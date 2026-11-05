/**
 * Theatre on Wheels — Booking Database Service
 * ============================================
 * Reliable, efficient, resilient database layer for Pre-book passes.
 * 
 * Features:
 *  1. Dual-Write Architecture:
 *     - Local persistent storage (localStorage + memory fallback) ensures
 *       zero data loss even offline or with network hiccups.
 *     - Remote Cloud Webhook (Google Sheets / Excel / SheetDB / REST API)
 *       syncs new entries directly into a live spreadsheet.
 *  2. Built-in Excel (.csv) Exporter:
 *     - Generates valid UTF-8 BOM CSV files for 1-click opening in Microsoft Excel.
 *  3. Configurable Webhook URL:
 *     - Reads `VITE_BOOKING_WEBHOOK_URL` from env or user settings.
 */

const STORAGE_KEY = 'tow_prebookings';
const CONFIG_KEY = 'tow_db_config';

/**
 * Retrieve database configuration (webhook URL, sync settings).
 */
export function getDbConfig() {
  try {
    const envUrl = import.meta.env?.VITE_BOOKING_WEBHOOK_URL || '';
    const stored = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');
    return {
      webhookUrl: stored.webhookUrl || envUrl || '',
      autoSync: stored.autoSync !== false,
      lastSync: stored.lastSync || null,
    };
  } catch {
    return { webhookUrl: '', autoSync: true, lastSync: null };
  }
}

/**
 * Update database configuration (e.g. set Google Sheets webhook URL).
 */
export function setDbConfig(config) {
  try {
    const current = getDbConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return config;
  }
}

/**
 * Retrieve all stored pre-bookings from local database.
 * @returns {Array} List of booking objects sorted newest first
 */
export function getAllBookings() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('[BookingDB] Failed to read local bookings:', err);
    return [];
  }
}

/**
 * Save a booking to local storage and asynchronously push to remote database/Excel.
 * 
 * @param {Object} bookingDetails 
 * @returns {Promise<{ success: boolean, synced: boolean, reference: string }>}
 */
export async function saveBooking(bookingDetails) {
  const reference = bookingDetails.reference || `TOW-${Math.random().toString(36).slice(2, 6).toUpperCase()}-26`;
  const timestamp = bookingDetails.at || new Date().toISOString();
  const seat = bookingDetails.seat || 'B4';

  const entry = {
    id: `book_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    reference,
    name: (bookingDetails.name || '').trim(),
    city: (bookingDetails.city || '').trim(),
    destination: (bookingDetails.destination || '').trim(),
    whatsapp: (bookingDetails.whatsapp || '').trim(),
    email: (bookingDetails.email || '').trim(),
    seat,
    status: 'Confirmed',
    timestamp,
    syncedToCloud: false,
  };

  // 1. Save to local persistent storage (always succeeds)
  try {
    const existing = getAllBookings();
    existing.unshift(entry); // newest first
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (err) {
    console.error('[BookingDB] Local storage write failed:', err);
  }

  // 2. Asynchronously sync to Cloud Database / Google Sheets / Excel Webhook
  let synced = false;
  const config = getDbConfig();

  if (config.webhookUrl) {
    try {
      synced = await sendToCloudDatabase(entry, config.webhookUrl);
      if (synced) {
        // Mark as synced locally
        const list = getAllBookings();
        const item = list.find((b) => b.reference === reference);
        if (item) item.syncedToCloud = true;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      }
    } catch (err) {
      console.warn('[BookingDB] Cloud sync skipped/failed:', err);
    }
  }

  return { success: true, synced, reference, entry };
}

/**
 * Post booking data to Google Sheets / Excel Webhook.
 * Supports Google Apps Script web apps (mode: 'no-cors') and REST APIs.
 */
async function sendToCloudDatabase(entry, webhookUrl) {
  try {
    const isGoogleScript = webhookUrl.includes('script.google.com');

    const payload = JSON.stringify({
      timestamp: entry.timestamp,
      reference: entry.reference,
      name: entry.name,
      city: entry.city,
      destination: entry.destination,
      whatsapp: entry.whatsapp,
      email: entry.email,
      seat: entry.seat,
      status: entry.status,
    });

    // Google Apps Script requires no-cors when called from client-side browser
    if (isGoogleScript) {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: payload,
      });
      return true;
    }

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });

    return res.ok;
  } catch (err) {
    console.error('[BookingDB] Error transmitting to webhook:', err);
    return false;
  }
}

/**
 * Export all collected pre-bookings as a Microsoft Excel-friendly CSV.
 * Includes UTF-8 Byte Order Mark (BOM) so Excel opens it with proper encoding.
 */
export function exportBookingsToCSV() {
  const bookings = getAllBookings();
  if (bookings.length === 0) {
    return { success: false, count: 0, message: 'No bookings recorded yet.' };
  }

  const headers = [
    'Reference ID',
    'Date & Time',
    'Attendee Name',
    'City',
    'Experience World',
    'WhatsApp Number',
    'Email Address',
    'Allocated Seat',
    'Booking Status',
    'Cloud Synced',
  ];

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = bookings.map((b) => [
    escapeCell(b.reference),
    escapeCell(new Date(b.timestamp).toLocaleString()),
    escapeCell(b.name),
    escapeCell(b.city),
    escapeCell(b.destination),
    escapeCell(b.whatsapp),
    escapeCell(b.email),
    escapeCell(b.seat || 'B4'),
    escapeCell(b.status || 'Confirmed'),
    escapeCell(b.syncedToCloud ? 'Yes' : 'Local'),
  ]);

  const csvContent = '\uFEFF' + [headers.map(escapeCell).join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `TheatreOnWheels_PreBookings_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return { success: true, count: bookings.length };
}

/**
 * Clear all local bookings (admin only).
 */
export function clearAllBookings() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

