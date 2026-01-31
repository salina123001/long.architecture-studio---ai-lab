
import React, { useState, useRef } from 'react';

interface DropZoneProps {
  onImageUpload: (base64: string) => void;
  previewImage: string | null;
}

const DropZone: React.FC<DropZoneProps> = ({ onImageUpload, previewImage }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      onImageUpload(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div 
      className={`relative w-full aspect-[16/10] md:aspect-[21/9] thin-border transition-colors duration-500 flex items-center justify-center group cursor-pointer overflow-hidden ${
        isDragging ? 'border-[#111111]' : 'border-[#E5E5E5]'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange} 
      />

      {previewImage ? (
        <img 
          src={previewImage} 
          alt="Space Preview" 
          className="w-full h-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
        />
      ) : (
        <span className="text-[12px] md:text-[14px] font-[200] tracking-[0.2em] text-[#666666] group-hover:text-[#111111] transition-colors">
          [ Drag or Click to upload your space ]
        </span>
      )}
      
      <div className="absolute inset-0 border-[0.5px] border-[#111111] m-4 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity"></div>
    </div>
  );
};

export default DropZone;