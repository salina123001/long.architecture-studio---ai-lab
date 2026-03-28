import React from 'react';

interface HeaderProps {
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onBack }) => {
  return (
    <header className="fixed top-0 left-0 w-full z-50 px-8 md:px-16 py-8 flex justify-between items-start bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl md:text-2xl font-[200] tracking-[0.15em] text-[#111111] leading-none uppercase">
          long.architecture studio
        </h1>
        <p className="text-[10px] md:text-[11px] tracking-[0.5em] text-[#111111] font-[300]">
          巃.建築設計事務所
        </p>
      </div>

      {onBack ? (
        <button
          onClick={onBack}
          className="text-[12px] tracking-[0.3em] text-[#111111] hover:opacity-50 transition-opacity uppercase font-[300]"
        >
          ← back to studio
        </button>
      ) : (
        <nav className="hidden md:flex gap-12 text-[12px] tracking-[0.1em] font-[300] text-[#222222]">
          <a href="#" className="hover:text-[#111111] transition-colors">projects</a>
          <a href="#" className="hover:text-[#111111] transition-colors">about</a>
          <a href="#" className="text-[#111111] border-b border-[#111111]">ai lab</a>
          <a href="#" className="hover:text-[#111111] transition-colors">contact</a>
        </nav>
      )}
    </header>
  );
};

export default Header;