
import React, { useState } from 'react';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, email: string) => Promise<void>;
  isSubmitting: boolean;
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!name.trim()) {
      setLocalError("請輸入姓名");
      return;
    }

    if (!validateEmail(contact)) {
      setLocalError("請輸入正確的 Email 格式 (Ex: arch@domain.com)");
      return;
    }

    onSubmit(name, contact);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-white/90 backdrop-blur-md transition-opacity duration-700"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-white border-[0.5px] border-[#111111] p-10 md:p-16 animate-in fade-in zoom-in duration-500 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-[10px] tracking-[0.2em] text-[#111111] hover:opacity-50 transition-opacity"
        >
          [ CLOSE ]
        </button>

        <div className="flex flex-col gap-2 mb-10">
          <h2 className="text-sm tracking-[0.4em] text-[#111111] uppercase font-[400]">Project Application</h2>
          <p className="text-[10px] tracking-[0.2em] text-[#333333] font-[300] uppercase">方案申請與存取驗證</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <label className="text-[9px] tracking-[0.3em] text-[#333333] uppercase font-[500]">Full Name / 姓名</label>
            <input
              required
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setLocalError(null);
              }}
              className="w-full border-b border-[#333333] py-2 text-xs font-[300] focus:outline-none focus:border-[#111111] transition-colors bg-transparent text-[#111111]"
              placeholder="Ex: Ar. Wei Lin"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[9px] tracking-[0.3em] text-[#333333] uppercase font-[500]">Email / 電子信箱</label>
            <input
              required
              type="email"
              value={contact}
              onChange={(e) => {
                setContact(e.target.value);
                setLocalError(null);
              }}
              className="w-full border-b border-[#333333] py-2 text-xs font-[300] focus:outline-none focus:border-[#111111] transition-colors bg-transparent text-[#111111]"
              placeholder="arch.design@example.com"
            />
          </div>

          {localError && (
            <p className="text-[9px] text-red-600 tracking-wider font-[500] animate-pulse uppercase">
              * {localError}
            </p>
          )}

          <div className="flex flex-col gap-4">
            <p className="text-[9px] leading-relaxed text-[#666666] font-[300] tracking-[0.05em]">
              * 此資料僅用於研究與技術展示紀錄。您的 IP 位址每日限額 1 次生成權限。
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 border border-[#111111] text-[10px] tracking-[0.4em] font-[400] transition-all duration-700 uppercase ${
                isSubmitting ? 'bg-[#F5F5F5] text-[#999999] cursor-wait' : 'hover:bg-[#111111] hover:text-white'
              }`}
            >
              {isSubmitting ? 'Verifying...' : 'Submit & Proceed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;
