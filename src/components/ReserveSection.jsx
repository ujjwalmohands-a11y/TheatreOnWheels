import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReserveSection() {
  const [step, setStep] = useState(1);
  const [selectedExperiences, setSelectedExperiences] = useState([]);

  const toggleExperience = (exp) => {
    if (selectedExperiences.includes(exp)) {
      setSelectedExperiences(selectedExperiences.filter(e => e !== exp));
    } else if (selectedExperiences.length < 3) {
      setSelectedExperiences([...selectedExperiences, exp]);
    }
  };

  const experiences = [
    { id: 'culture', label: 'Indian Culture & History', flagship: true },
    { id: 'flight', label: 'Flight Simulator' },
    { id: 'para', label: 'Paragliding' },
    { id: 'scuba', label: 'Scuba Diving' },
    { id: 'coaster', label: 'Roller Coaster' },
    { id: 'thrill', label: 'Thrill / Suspense' },
    { id: 'fantasy', label: 'Fantasy / Adventure' },
    { id: 'family', label: 'For my family' },
    { id: 'space', label: 'Space / Science' },
  ];

  return (
    <div className="reserve-container">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            className="form-step"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <h2 className="form-title">Claim your place</h2>
            <input type="text" className="input-field" placeholder="First Name" />
            <input type="tel" className="input-field" placeholder="Mobile Number (+91)" />
            <input type="text" className="input-field" placeholder="City" />
            <button className="btn-submit" onClick={() => setStep(2)}>Next</button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div 
            key="step2"
            className="form-step"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <h2 className="form-title" style={{fontSize: '1.5rem'}}>What should the door open to?</h2>
            <p className="form-desc">Choose up to three you'd love to see.</p>
            
            <div className="tile-grid">
              {experiences.map(exp => (
                <div 
                  key={exp.id}
                  className={`tile ${exp.flagship ? 'flagship' : ''} ${selectedExperiences.includes(exp.id) ? 'selected' : ''}`}
                  onClick={() => toggleExperience(exp.id)}
                >
                  {exp.label}
                </div>
              ))}
            </div>

            <button className="btn-submit" onClick={() => setStep(3)}>Continue</button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div 
            key="step3"
            className="form-step"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
          >
            <h2 className="form-title" style={{fontSize: '1.5rem'}}>Anything else?</h2>
            <p className="form-desc">Special requests or accessibility needs.</p>
            
            <input type="text" className="input-field" placeholder="Tell us..." />
            
            <label style={{display: 'flex', alignItems: 'center', gap: '8px', marginTop: '1rem', fontSize: '0.85rem', color: '#9CA3AF', cursor: 'pointer'}}>
              <input type="checkbox" style={{accentColor: '#FFC061', width: '16px', height: '16px'}} />
              Message me on WhatsApp about this
            </label>

            <button className="btn-submit" onClick={() => alert('Lamp ignited! You are on the list.')}>I want to be there</button>
            <p style={{fontSize: '0.75rem', textAlign: 'center', color: '#6B7280', marginTop: '8px'}}>Free. No payment now. We'll message you first.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
