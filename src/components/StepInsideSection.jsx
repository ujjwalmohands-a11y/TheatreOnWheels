import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StepInsideSection() {
  const [seamWidth, setSeamWidth] = useState(2);
  const [isHolding, setIsHolding] = useState(false);
  const [stage, setStage] = useState(0); // 0 to 5
  const requestRef = useRef();

  // Animation loop for smooth opening/closing
  const animate = () => {
    setSeamWidth((prev) => {
      if (isHolding) {
        return Math.min(prev + 1.5, 280); // Open slowly
      } else {
        return Math.max(prev - 4, 2); // Close quickly if let go early (optional gameplay mechanic)
      }
    });
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isHolding]);

  // Map seam width to story beats
  useEffect(() => {
    if (seamWidth > 250) setStage(5);
    else if (seamWidth > 200) setStage(4);
    else if (seamWidth > 150) setStage(3);
    else if (seamWidth > 100) setStage(2);
    else if (seamWidth > 50) setStage(1);
    else setStage(0);
  }, [seamWidth]);

  const stages = [
    "",
    "Arrive.",
    "Cross.",
    "Settle.",
    "Begin.",
    "Step out."
  ];

  return (
    <div className="door-container">
      <div 
        className="arch-door"
        onPointerDown={() => setIsHolding(true)}
        onPointerUp={() => setIsHolding(false)}
        onPointerLeave={() => setIsHolding(false)}
      >
        <div 
          className="door-seam" 
          style={{ width: `${seamWidth}px`, opacity: 0.6 + (seamWidth/280)*0.4 }} 
        />
        
        {/* Content revealed inside the light */}
        <AnimatePresence>
          {seamWidth > 50 && (
            <motion.div 
              className="door-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: seamWidth > 100 ? 1 : 0 }}
              exit={{ opacity: 0 }}
            >
              {stages[stage]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div 
        className="instruction"
        animate={{ opacity: isHolding ? 0 : 1 }}
      >
        Press and hold to step inside
      </motion.div>
    </div>
  );
}
