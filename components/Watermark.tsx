
import React from 'react';

const Watermark: React.FC = () => {
  return (
    <div 
      className="absolute bottom-[20px] right-[20px] pointer-events-none select-none"
      style={{
        fontFamily: "'Inter', sans-serif",
        fontWeight: 200,
        fontSize: '11px',
        letterSpacing: '0.25em',
        color: 'rgba(255, 255, 255, 0.95)',
        textTransform: 'lowercase',
        textShadow: '0 1px 6px rgba(0,0,0,0.5)',
        zIndex: 10
      }}
    >
      long.architecture studio
    </div>
  );
};

export default Watermark;
