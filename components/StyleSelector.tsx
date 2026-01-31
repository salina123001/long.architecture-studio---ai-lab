
import React from 'react';
import { DesignStyle } from '../types';

interface StyleSelectorProps {
  selected: DesignStyle;
  onSelect: (style: DesignStyle) => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ selected, onSelect }) => {
  const styles = [
    { key: DesignStyle.Modern, en: 'MODERN', zh: '現代' },
    { key: DesignStyle.Minimalist, en: 'MINIMALIST', zh: '極簡' },
    { key: DesignStyle.WabiSabi, en: 'WABI-SABI', zh: '侘寂' },
    { key: DesignStyle.Zen, en: 'ZEN', zh: '禪風' },
    { key: DesignStyle.Japandi, en: 'JAPANDI', zh: '北歐禪' },
    { key: DesignStyle.Nordic, en: 'NORDIC', zh: '北歐' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-[40px] py-4">
      {styles.map((style) => (
        <button
          key={style.key}
          onClick={() => onSelect(style.key)}
          className="group flex flex-col items-center focus:outline-none"
        >
          <div className="flex flex-col items-center gap-[4px] relative pb-2">
            <span 
              className={`text-[14px] font-[300] tracking-[0.1em] transition-colors duration-500 ${
                selected === style.key ? 'text-[#111111]' : 'text-[#333333] group-hover:text-[#111111]'
              }`}
            >
              {style.en}
            </span>
            <span 
              className={`text-[10px] font-[300] tracking-[0.2em] text-[#111111] transition-opacity duration-500 ${
                selected === style.key ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
              }`}
            >
              {style.zh}
            </span>
            
            <div 
              className={`absolute bottom-0 left-0 h-[1px] bg-[#111111] transition-all duration-700 ease-in-out ${
                selected === style.key ? 'w-full' : 'w-0'
              }`}
            />
          </div>
        </button>
      ))}
    </div>
  );
};

export default StyleSelector;