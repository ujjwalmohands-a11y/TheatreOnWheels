import React from 'react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <div className="hero-container">
      <header className="hero-header">
        <div className="logo-mark">GD</div>
        <button className="reserve-badge">Reserve</button>
      </header>

      {/* Center - Headlights Effect */}
      <div className="headlights-wrapper">
        {/* Left Headlight */}
        <motion.div 
          style={{
            position: 'absolute',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: '#FFD6A5',
            filter: 'blur(70px)',
            opacity: 0.1
          }}
          initial={{ scale: 0.5, x: -120, opacity: 0 }}
          animate={{ scale: [0.5, 1.2, 1], x: -70, opacity: 0.2 }}
          transition={{ duration: 5, ease: "easeOut" }}
        />
        {/* Right Headlight */}
        <motion.div 
          style={{
            position: 'absolute',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            background: '#FFD6A5',
            filter: 'blur(70px)',
            opacity: 0.1
          }}
          initial={{ scale: 0.5, x: 120, opacity: 0 }}
          animate={{ scale: [0.5, 1.2, 1], x: 70, opacity: 0.2 }}
          transition={{ duration: 5, ease: "easeOut", delay: 0.3 }}
        />
        
        {/* Ambient dust/embers (simplified) */}
        <motion.div
          style={{
            position: 'absolute',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: '#FFC061',
            boxShadow: '0 0 10px #FFC061',
            opacity: 0
          }}
          animate={{ 
            opacity: [0, 0.8, 0],
            y: [0, -100],
            x: [0, 50]
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
        />
      </div>

      <div className="hero-footer">
        <motion.p 
          className="tagline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 3, delay: 1 }}
        >
          Something is on its way.
        </motion.p>
      </div>
    </div>
  );
}
