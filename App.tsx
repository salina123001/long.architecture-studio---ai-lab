
import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import DropZone from './components/DropZone';
import StyleSelector from './components/StyleSelector';
import EnergyFlowOverlay from './components/EnergyFlowOverlay';
import Watermark from './components/Watermark';
import UserFormModal from './components/UserFormModal';
import { DesignStyle, GenerationState, GeneratedSpace } from './types';
import { analyzeFloorPlan, generateRoomView } from './services/geminiService';

const GAS_URL = 'https://script.google.com/macros/s/AKfycbw6wiklq-D00N6gIqeu2ghmiI-12ZULGfjZ9AzVwOrEh37Gyd_rVUhaA9XpyM2e0JbVlQ/exec';

const App: React.FC = () => {
  const [state, setState] = useState<GenerationState>({
    isGenerating: false,
    step: 'idle',
    uploadedImage: null,
    results: [],
    error: null
  });
  
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle>(DesignStyle.Minimalist);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [userIp, setUserIp] = useState<string | null>(null);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  // --- 1. 嚴格 IP 限制檢查 ---
  const checkLimit = useCallback(async (ip: string) => {
    try {
      // 確保請求不會被緩存
      const res = await fetch(`${GAS_URL}?ip=${encodeURIComponent(ip)}&t=${Date.now()}`);
      const countText = (await res.text()).trim();
      const currentCount = parseInt(countText);

      console.log(`[Check] IP: ${ip}, Usage Count: ${currentCount}`);

      if (!isNaN(currentCount) && currentCount >= 999) {
        setHasReachedLimit(true);
        const limitMsg = `您的 IP 今日配額已達上限 (1/1)，請明日再試。`;
        setState(prev => ({ ...prev, error: limitMsg }));
        return true;
      }
      
      setHasReachedLimit(false);
      // 如果之前有錯誤訊息是關於上限的，現在清除它
      setState(prev => ({ 
        ...prev, 
        error: prev.error?.includes("配額") ? null : prev.error 
      }));
      return false;
    } catch (err) {
      console.error("Limit check service unavailable", err);
      return false;
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        setUserIp(ipData.ip);
        await checkLimit(ipData.ip);
      } catch (e) {
        console.warn("Initial IP fetch failed");
      }
    };
    init();
  }, [checkLimit]);

  const handleUpload = (base64: string) => {
    setState(prev => ({ 
      ...prev, 
      uploadedImage: base64, 
      results: [], 
      // 保留配額限制的錯誤，只清除其他錯誤
      error: hasReachedLimit ? prev.error : null,
      step: 'idle'
    }));
  };

  const triggerInitialAction = async () => {
    if (!state.uploadedImage) {
      alert("Please upload a floor plan first.");
      return;
    }

    // 再次確保最新狀態
    setIsVerifying(true);
    const ip = userIp || (await (await fetch('https://api.ipify.org?format=json')).json()).ip;
    const isLimited = await checkLimit(ip);
    setIsVerifying(false);

    if (isLimited) {
      alert("今日配額已達上限，無法執行生成。");
      return;
    }

    const savedUser = localStorage.getItem('long_arch_user');
    if (savedUser) {
      startGeneration();
    } else {
      setIsModalOpen(true);
    }
  };

  const handleFormSubmit = async (name: string, email: string) => {
    setIsVerifying(true);
    setState(prev => ({ ...prev, error: null }));

    try {
      const ip = userIp || (await (await fetch('https://api.ipify.org?format=json')).json()).ip;
      
      // 提交表單前最後一次攔截
      const isLimited = await checkLimit(ip);
      if (isLimited) {
        setIsVerifying(false);
        setIsModalOpen(false);
        return;
      }

      // 寫入 Google Sheets
      const payload = {
        name,
        contact: email,
        ip: ip,
        style: selectedStyle,
        timestamp: new Date().toISOString()
      };

      await fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      localStorage.setItem('long_arch_user', JSON.stringify({ name, email }));

      // 等待後端資料庫同步
      await new Promise(r => setTimeout(r, 1500));
      
      // 寫入成功後，立刻標記為已達上限
      setHasReachedLimit(true);
      setState(prev => ({ ...prev, error: "您的 IP 今日配額已達上限 (1/1)，請明日再試。" }));

      setIsModalOpen(false);
      setIsVerifying(false);
      
      // 啟動生成
      startGeneration(); 

    } catch (err) {
      console.error("Submit error", err);
      setIsVerifying(false);
      setState(prev => ({ ...prev, error: "連線異常，請稍後再試。" }));
    }
  };

  const startGeneration = async () => {
    // 進入生成流程，暫時清除 error (除非是 limit 錯誤，但理論上能進來代表剛寫入完成)
    setState(prev => ({ ...prev, isGenerating: true, step: 'analyzing', results: [] }));

    try {
      const rooms = await analyzeFloorPlan(state.uploadedImage!);
      setState(prev => ({ ...prev, step: 'visualizing' }));

      const generationPromises = rooms.map(async (room, index) => {
        const url = await generateRoomView(state.uploadedImage!, selectedStyle, room);
        return {
          id: `room-${index}`,
          type: room,
          url: url,
          isEnergyFlowActive: false
        } as GeneratedSpace;
      });

      const results = await Promise.all(generationPromises);
      setState(prev => ({ ...prev, results, isGenerating: false, step: 'idle' }));

    } catch (err) {
      console.error("Generation logic failed", err);
      // 如果發生錯誤，判斷是否為配額問題
      const errorMessage = hasReachedLimit ? "今日配額已達上限 (1/1)。" : "生成過程發生異常，請重試。";
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        step: 'idle', 
        error: errorMessage 
      }));
    }
  };

  const showResults = state.results.length > 0;
  const mainRoom = state.results[0];
  const subRooms = state.results.slice(1);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <UserFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleFormSubmit}
        isSubmitting={isVerifying}
      />

      <main className="flex-grow flex flex-col pt-32 pb-12 px-8 md:px-16 lg:px-24 max-w-[1920px] mx-auto w-full">
        {!showResults ? (
          <div className="flex-grow flex flex-col gap-12 animate-in fade-in duration-1000">
            <div className="w-full max-w-5xl mx-auto">
              <DropZone onImageUpload={handleUpload} previewImage={state.uploadedImage} />
            </div>
            
            <div className="flex flex-col items-center">
              <StyleSelector selected={selectedStyle} onSelect={setSelectedStyle} />
              
              {/* 錯誤提示區塊 */}
              {state.error && (
                <div className="mt-8 p-6 border-[0.5px] border-red-200 bg-red-50/20 max-w-md animate-in slide-in-from-top-2 duration-500">
                  <p className="text-center text-[11px] text-red-600 font-[400] tracking-[0.15em] uppercase leading-relaxed">
                    {state.error}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-center pt-[50px]">
              <button
                onClick={triggerInitialAction}
                disabled={state.isGenerating || isVerifying || (hasReachedLimit && !state.isGenerating)}
                className={`px-16 py-4 border border-[#111111] text-[12px] tracking-[0.4em] font-[300] transition-all duration-1000 uppercase min-w-[280px] flex items-center justify-center ${
                  (state.isGenerating || isVerifying || (hasReachedLimit && !state.isGenerating))
                    ? 'opacity-30 border-[#EEEEEE] text-[#999999] cursor-not-allowed' 
                    : 'hover:bg-[#111111] hover:text-white cursor-pointer active:scale-95'
                }`}
              >
                {state.isGenerating ? `${state.step.toUpperCase()}...` : isVerifying ? 'VERIFYING...' : 'GENERATE DESIGN'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 animate-in slide-in-from-bottom-8 duration-1000">
            {/* 結果展示內容保持不變... */}
            <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-32 h-fit">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] tracking-[0.4em] uppercase text-[#111111] font-light">Original Blueprint</span>
                <span className="text-[9px] tracking-[0.2em] uppercase text-[#111111] font-[300]">原始藍圖</span>
              </div>
              <div className="border-[0.5px] border-[#EEEEEE] p-1 bg-[#FAFAFA]">
                <img src={state.uploadedImage!} alt="Blueprint" className="w-full grayscale contrast-125 opacity-70" />
              </div>
              <button 
                onClick={() => setState(p => ({...p, results: [], uploadedImage: null}))}
                className="text-[10px] tracking-[0.3em] text-[#111111] mt-2 flex items-center gap-2 hover:opacity-50 transition-opacity uppercase font-[200]"
              >
                [ Reset Project / 重新開始 ]
              </button>
            </div>

            <div className="lg:col-span-8 flex flex-col gap-10">
              <div className="flex flex-col gap-1 border-b border-[#F5F5F5] pb-4">
                <span className="text-[10px] tracking-[0.4em] uppercase text-[#111111] font-light">Spatial Visualization Proposal</span>
                <span className="text-[9px] tracking-[0.2em] uppercase text-[#111111] font-[300]">空間提案</span>
              </div>
              
              <div className="flex flex-col gap-8">
                {mainRoom && (
                  <div className="flex flex-col gap-4 group">
                    <div className="relative aspect-[21/9] overflow-hidden border-[0.5px] border-[#EEEEEE] bg-[#F9F9F9]">
                      <img src={mainRoom.url} alt={mainRoom.type} className="w-full h-full object-cover" />
                      {mainRoom.isEnergyFlowActive && <EnergyFlowOverlay />}
                      <Watermark />
                      <div className="absolute top-6 left-6 flex flex-col gap-1 bg-white/90 backdrop-blur-sm px-4 py-2">
                        <span className="text-[10px] tracking-[0.3em] uppercase text-[#111111] font-[300] opacity-95">{mainRoom.type}</span>
                        <span className="text-[8px] tracking-[0.1em] text-[#111111] font-[300]">PRIMARY SPACE</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {subRooms.map((room) => (
                    <div key={room.id} className="flex flex-col gap-4 group">
                      <div className="relative aspect-[4/3] overflow-hidden border-[0.5px] border-[#EEEEEE] bg-[#F9F9F9]">
                        <img src={room.url} alt={room.type} className="w-full h-full object-cover" />
                        {room.isEnergyFlowActive && <EnergyFlowOverlay />}
                        <Watermark />
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 flex flex-col">
                          <span className="text-[9px] tracking-[0.2em] uppercase text-[#111111] font-[300] opacity-95">{room.type}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* 下方聯繫資訊保持... */}
            </div>
          </div>
        )}
      </main>
      {/* Footer 保持不變... */}
    </div>
  );
};

export default App;
