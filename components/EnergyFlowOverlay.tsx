
import React from 'react';

const EnergyFlowOverlay: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-screen opacity-60">
      <svg className="w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
        <defs>
          <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.8)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>
        <path d="M-100,50 Q150,150 500,50" stroke="url(#flowGrad)" strokeWidth="0.5" fill="none">
          <animate attributeName="d" values="M-100,50 Q150,150 500,50; M-100,100 Q150,50 500,100; M-100,50 Q150,150 500,50" dur="10s" repeatCount="indefinite" />
        </path>
        <path d="M-100,250 Q150,150 500,250" stroke="url(#flowGrad)" strokeWidth="0.5" fill="none" opacity="0.5">
          <animate attributeName="d" values="M-100,250 Q150,150 500,250; M-100,200 Q150,250 500,200; M-100,250 Q150,150 500,250" dur="8s" repeatCount="indefinite" />
        </path>
      </svg>
    </div>
  );
};

export default EnergyFlowOverlay;
