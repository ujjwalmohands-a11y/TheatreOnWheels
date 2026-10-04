import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import AdmitOneTicket, {
  TICKET_GEOMETRY,
  TICKET_TEXTURE,
  playShutterSound,
} from "@/components/ui/admit-one-ticket";

export type PrebookDetails = {
  name: string;
  city: string;
  world: string;
};

type Props = PrebookDetails & {
  onConfirmed?: (details: PrebookDetails) => void;
  onClose: () => void;
};

const RIP_DISTANCE = 90;

/**
 * Premium pre-booking confirmation: the visitor must physically rip the
 * stub off the ticket. Only then is the pre-booking confirmed.
 */
export default function PrebookModal({ name, city, world, onConfirmed, onClose }: Props) {
  const [width, setWidth] = useState(() =>
    typeof window === "undefined" ? 741 : Math.min(741, window.innerWidth - 32),
  );
  const [stage, setStage] = useState<"idle" | "ripping" | "done">("idle");

  useEffect(() => {
    const onResize = () => setWidth(Math.min(741, window.innerWidth - 32));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const height = width / TICKET_GEOMETRY.aspect;
  const perfX = TICKET_GEOMETRY.perforation * width;

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, (v) => Math.max(-4, v * 0.07));
  const mainShift = useTransform(x, [0, 220], [0, -10]);
  const hintOpacity = useTransform(x, [0, 40], [1, 0]);

  const rip = () => {
    if (stage !== "idle") return;
    setStage("ripping");
    playShutterSound();
    animate(x, width, { duration: 0.7, ease: [0.5, 0, 0.9, 0.4] });
    animate(y, height * 0.9, { duration: 0.7, ease: [0.5, 0, 0.9, 0.4] });
    setTimeout(() => {
      setStage("done");
      onConfirmed?.({ name, city, world });
    }, 650);
  };

  // Static texture (speed 0) so both halves of the ticket match pixel-for-pixel.
  const ticketProps = {
    name,
    presenter: "Theatre on Wheels presents",
    event: world,
    venue: city || "Your city",
    dates: "Pre-booked",
    stubText: "Admit one",
    watermark: "2026",
    width,
    tilt: false as const,
    texture: { ...TICKET_TEXTURE, speed: 0 },
  };

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Confirm your pre-booking"
      className="tk-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="tk-close"
      >
        ✕
      </button>

      <div className="tk-copy">
        <AnimatePresence mode="wait">
          {stage !== "done" ? (
            <motion.div key="a" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className="tk-eyebrow">Your ticket is ready</p>
              <h2 className="tk-title">Tear the stub to confirm your pre-booking</h2>
            </motion.div>
          ) : (
            <motion.div key="b" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="tk-eyebrow">Pre-booked ✓</p>
              <h2 className="tk-title">The door will open for you, {name.split(" ")[0]}.</h2>
              <p className="tk-sub">We'll message you on WhatsApp when the theatre arrives in {city || "your city"}.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="relative" style={{ width, height }}>
        {/* Main body of the ticket */}
        <motion.div
          className="absolute inset-0"
          style={{
            x: mainShift,
            clipPath: `inset(0 ${width - perfX}px 0 0)`,
            filter: "drop-shadow(0 24px 40px rgba(0,0,0,.55))",
          }}
        >
          <AdmitOneTicket {...ticketProps} />
        </motion.div>

        {/* Rippable stub */}
        {stage !== "done" && (
          <motion.div
            drag={stage === "idle"}
            dragSnapToOrigin
            dragMomentum={false}
            dragElastic={0.15}
            onDragEnd={(_, info) => {
              if (Math.hypot(info.offset.x, info.offset.y) > RIP_DISTANCE && info.offset.x > 20) rip();
            }}
            whileHover={{ cursor: "grab" }}
            whileTap={{ cursor: "grabbing" }}
            className="absolute inset-0 touch-none"
            style={{
              x,
              y,
              rotate,
              transformOrigin: `${perfX}px ${height}px`,
              clipPath: `inset(0 0 0 ${perfX}px)`,
              filter: "drop-shadow(0 24px 40px rgba(0,0,0,.55))",
            }}
          >
            <AdmitOneTicket {...ticketProps} />
          </motion.div>
        )}

        {stage === "idle" && (
          <motion.div
            aria-hidden
            style={{ opacity: hintOpacity, left: perfX, width: width - perfX }}
            className="tk-hint"
            animate={{ x: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          >
            Drag →
          </motion.div>
        )}
      </div>

      {stage === "idle" && (
        <button
          type="button"
          onClick={rip}
          className="tk-link"
        >
          Can't drag? Tap to tear
        </button>
      )}
      {stage === "done" && (
        <motion.button
          type="button"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="tk-done"
        >
          Done
        </motion.button>
      )}
    </motion.div>
  );
}
