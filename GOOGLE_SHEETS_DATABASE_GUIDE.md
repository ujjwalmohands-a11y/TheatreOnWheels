# Google Sheets & Excel Live Database Guide

Theatre on Wheels has a built-in **Dual-Write Database Engine**:
1. **Local Persistent Storage**: Every booking is instantly saved to `localStorage` & browser memory. Zero lost entries.
2. **One-Click Excel (.xlsx / .csv) Export**: Download all collected bookings anytime directly to an Excel-formatted spreadsheet.
3. **Live Google Sheets / Excel Cloud Sync**: Automatically streams every new pre-booking directly into your Google Sheet / Excel in real time!

---

## ⚡ 60-Second Setup: Connect to Google Sheets & Excel

Follow these 3 quick steps to have your live cloud database running for free:

### Step 1: Create a Google Sheet
1. Open [Google Sheets](https://sheets.new) and create a new blank spreadsheet.
2. Name it **"Theatre on Wheels — Pre-Bookings"**.
3. In row 1, add these column headers:
   | A | B | C | D | E | F | G | H | I |
   | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
   | **Timestamp** | **Reference ID** | **Name** | **City** | **World** | **WhatsApp** | **Email** | **Seat** | **Status** |

---

### Step 2: Add the Auto-Sync Script
1. In your Google Sheet, click **Extensions** > **Apps Script**.
2. Delete any code in the editor and paste this script:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.reference || "N/A",
      data.name || "Anonymous",
      data.city || "N/A",
      data.destination || "N/A",
      data.whatsapp || "N/A",
      data.email || "N/A",
      data.seat || "B4",
      data.status || "Confirmed"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Click **Deploy** (top right) > **New deployment**.
4. Click the gear icon ⚙️ next to "Select type" and choose **Web app**.
5. Configure:
   - **Description**: `TheatreOnWheels Webhook`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone` *(Crucial so the website can post bookings)*
6. Click **Deploy** and copy your **Web App URL** (starts with `https://script.google.com/macros/s/...`).

---

### Step 3: Add to `.env`
Add your Web App URL to your `.env` file in the project root:
```env
VITE_BOOKING_WEBHOOK_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
```

Restart the dev server (`npm run dev`) or re-build (`npm run build`). Now, every time a user pre-books a seat, a new row will instantly appear in your Google Sheet!

*(Admin tip: You can also press `Ctrl + Shift + E` on the website anytime to download a backup CSV file directly).*

---

## 📊 Live Excel Integration
- Your Google Sheet can be opened, searched, and filtered simultaneously by multiple team members on web or mobile.
- To open in Microsoft Excel at any time:
  - In Google Sheets, click **File** > **Download** > **Microsoft Excel (.xlsx)**.
  - Or use Excel's built-in **Data > From Web** to link the Google Sheet directly inside desktop Excel!

