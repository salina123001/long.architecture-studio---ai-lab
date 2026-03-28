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

// ─── Landing Page ─────────────────────────────────────────────────────────────

const LandingPage: React.FC<{ onEnterLab: () => void }> = ({ onEnterLab }) => {
  return (
    <div style={{ fontFamily: "'Inter', 'Noto Sans TC', sans-serif", backgroundColor: '#FFFFFF', color: '#333333', lineHeight: '1.5', overflowX: 'hidden' }}>
      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 4vw' }}>
        <header style={{ padding: '2rem 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 200, color: '#333', letterSpacing: '0.05em', margin: 0 }}>
              long.architecture studio
            </h1>
            <p style={{ fontSize: '10px', letterSpacing: '0.6em', marginTop: '0.5rem', color: '#555', textIndent: '0.6em', margin: '0.5rem 0 0 0' }}>
              巃.建築設計事務所
            </p>
          </div>
          <nav>
            <ul style={{ display: 'flex', listStyle: 'none', gap: '2.5rem', margin: 0, padding: 0 }}>
              {[
                { label: 'projects', href: '#projects' },
                { label: 'about', href: '#about' },
                { label: 'ai lab', href: '#', isLab: true },
                { label: 'contact', href: '#contact' },
              ].map(item => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    onClick={item.isLab ? (e) => { e.preventDefault(); onEnterLab(); } : undefined}
                    style={{ fontSize: '0.9rem', fontWeight: 300, textDecoration: 'none', color: 'inherit', transition: 'opacity 0.3s ease', letterSpacing: '0.05em' }}
                    onMouseOver={e => (e.currentTarget.style.opacity = '0.6')}
                    onMouseOut={e => (e.currentTarget.style.opacity = '1')}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </header>
      </div>

      <section style={{ height: '80vh', marginBottom: '12rem', overflow: 'hidden' }}>
        <img
          src="https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?q=80&w=1974&auto=format&fit=crop"
          alt="建築空間攝影"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </section>

      <section id="projects" style={{ maxWidth: '1600px', margin: '0 auto 12rem', padding: '0 4vw' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '6vw' }}>
          {[
            { src: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1953&auto=format&fit=crop', label: '清水模住宅, 台北' },
            { src: 'https://images.unsplash.com/photo-1618788372246-79faff0c3742?q=80&w=1935&auto=format&fit=crop', label: '極簡商業空間, 台中' },
            { src: 'https://images.unsplash.com/photo-1596443686489-5152e883283c?q=80&w=1974&auto=format&fit=crop', label: '海邊別墅, 墾丁' },
            { src: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=1964&auto=format&fit=crop', label: '城市藝術館, 高雄' },
          ].map((proj, i) => (
            <div key={i}>
              <img
                src={proj.src}
                alt={proj.label}
                style={{ width: '100%', height: '400px', objectFit: 'cover', marginBottom: '1rem', display: 'block', transition: 'opacity 0.4s ease' }}
                onMouseOver={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseOut={e => (e.currentTarget.style.opacity = '1')}
              />
              <p style={{ fontSize: '0.9rem', fontWeight: 300, color: '#444', margin: 0 }}>{proj.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="ai-lab" style={{ marginBottom: '12rem', padding: '8rem 0', position: 'relative', backgroundColor: '#f9f9f9', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1617097431754-1f502be22859?q=80&w=1974&auto=format&fit=crop')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15, zIndex: 0 }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '0 2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 200, marginBottom: '1.5rem', letterSpacing: '0.1em', color: '#333', marginTop: 0 }}>AI Design Lab</h2>
          <p style={{ fontSize: '1rem', fontWeight: 300, marginBottom: '3rem', color: '#555', lineHeight: 1.8 }}>
            Projecting the future of space through AI.<br />探索 AI 與空間美學的無限可能。
          </p>
          <button
            onClick={onEnterLab}
            style={{ display: 'inline-block', fontSize: '0.9rem', fontWeight: 300, padding: '1rem 2rem', border: '1px solid #333', backgroundColor: 'transparent', cursor: 'pointer', transition: 'all 0.3s ease', letterSpacing: '0.08em', color: '#333', fontFamily: 'inherit' }}
            onMouseOver={e => { e.currentTarget.style.backgroundColor = '#333'; e.currentTarget.style.color = '#fff'; }}
            onMouseOut={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#333'; }}
          >
            Enter AI Lab
          </button>
        </div>
      </section>

      <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 4vw' }}>
        <footer id="contact" style={{ padding: '6rem 0 3rem', borderTop: '1px solid #eee' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '4rem', fontWeight: 300, fontSize: '0.9rem', color: '#666' }}>
              <p style={{ margin: 0 }}>Email: info@long-architecture.com</p>
              <p style={{ margin: 0 }}>地址: 台北市大安區仁愛路四段126號15樓</p>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#888', fontWeight: 200, margin: '2rem 0 0 0' }}>
              © 2025 long.architecture studio 巃.建築設計事務所. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

// ─── AI Lab ───────────────────────────────────────────────────────────────────

const AILab: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [state, setState] = useState<GenerationState>({ isGenerating: false, step: 'idle', uploadedImage: null, results: [], error: null });
  const [selectedStyle, setSelectedStyle] = useState<DesignStyle>(DesignStyle.Minimalist);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [userIp, setUserIp] = useState<string | null>(null);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);

  const checkLimit = useCallback(async (ip: string) => {
    try {
      const res = await fetch(`${GAS_URL}?ip=${encodeURIComponent(ip)}&t=${Date.now()}`);
      const countText = (await res.text()).trim();
      const currentCount = parseInt(countText);
      if (!isNaN(currentCount) && currentCount >= 999) {
        setHasReachedLimit(true);
        setState(prev => ({ ...prev, error: `您的 IP 今日配額已達上限 (1/1)，請明日再試。` }));
        return true;
      }
      setHasReachedLimit(false);
      setState(prev => ({ ...prev, error: prev.error?.includes("配額") ? null : prev.error }));
      return false;
    } catch { return false; }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        setUserIp(ipData.ip);
        await checkLimit(ipData.ip);
      } catch {}
    };
    init();
  }, [checkLimit]);

  const handleUpload = (base64: string) => {
    setState(prev => ({ ...prev, uploadedImage: base64, results: [], error: hasReachedLimit ? prev.error : null, step: 'idle' }));
  };

  const triggerInitialAction = async () => {
    if (!state.uploadedImage) { alert("Please upload a floor plan first."); return; }
    setIsVerifying(true);
    const ip = userIp || (await (await fetch('https://api.ipify.org?format=json')).json()).ip;
    const isLimited = await checkLimit(ip);
    setIsVerifying(false);
    if (isLimited) { alert("今日配額已達上限，無法執行生成。"); return; }
    localStorage.getItem('long_arch_user') ? startGeneration() : setIsModalOpen(true);
  };

  const handleFormSubmit = async (name: string, email: string) => {
    setIsVerifying(true);
    setState(prev => ({ ...prev, error: null }));
    try {
      const ip = userIp || (await (await fetch('https://api.ipify.org?format=json')).json()).ip;
      const isLimited = await checkLimit(ip);
      if (isLimited) { setIsVerifying(false); setIsModalOpen(false); return; }
      await fetch(GAS_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ name, contact: email, ip, style: selectedStyle, timestamp: new Date().toISOString() }) });
      localStorage.setItem('long_arch_user', JSON.stringify({ name, email }));
      await new Promise(r => setTimeout(r, 1500));
      setIsModalOpen(false);
      setIsVerifying(false);
      startGeneration();
    } catch { setIsVerifying(false); setState(prev => ({ ...prev, error: "連線異常，請稍後再試。" })); }
  };

  const startGeneration = async () => {
    setState(prev => ({ ...prev, isGenerating: true, step: 'analyzing', results: [] }));
    try {
      const rooms = await analyzeFloorPlan(state.uploadedImage!);
      setState(prev => ({ ...prev, step: 'visualizing' }));
      const results = await Promise.all(rooms.map(async (room, index) => ({ id: `room-${index}`, type: room, url: await generateRoomView(state.uploadedImage!, selectedStyle, room), isEnergyFlowActive: false } as GeneratedSpace)));
      setState(prev => ({ ...prev, results, isGenerating: false, step: 'idle' }));
    } catch {
      setState(prev => ({ ...prev, isGenerating: false, step: 'idle', error: hasReachedLimit ? "今日配額已達上限 (1/1)。" : "生成過程發生異常，請重試。" }));
    }
  };

  const showResults = state.results.length > 0;
  const mainRoom = state.results[0];
  const subRooms = state.results.slice(1);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <div className="fixed top-6 right-8 z-50 hidden md:block">
        <button onClick={onBack} className="text-[10px] tracking-[0.3em] text-[#999999] hover:text-[#111111] transition-colors uppercase font-[300]">
          ← back to studio
        </button>
      </div>
      <UserFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} isSubmitting={isVerifying} />
      <main className="flex-grow flex flex-col pt-32 pb-12 px-8 md:px-16 lg:px-24 max-w-[1920px] mx-auto w-full">
        {!showResults ? (
          <div className="flex-grow flex flex-col gap-12 animate-in fade-in duration-1000">
            <div className="w-full max-w-5xl mx-auto">
              <DropZone onImageUpload={handleUpload} previewImage={state.uploadedImage} />
            </div>
            <div className="flex flex-col items-center">
              <StyleSelector selected={selectedStyle} onSelect={setSelectedStyle} />
              {state.error && (
                <div className="mt-8 p-6 border-[0.5px] border-red-200 bg-red-50/20 max-w-md animate-in slide-in-from-top-2 duration-500">
                  <p className="text-center text-[11px] text-red-600 font-[400] tracking-[0.15em] uppercase leading-relaxed">{state.error}</p>
                </div>
              )}
            </div>
            <div className="flex justify-center pt-[50px]">
              <button
                onClick={triggerInitialAction}
                disabled={state.isGenerating || isVerifying || (hasReachedLimit && !state.isGenerating)}
                className={`px-16 py-4 border border-[#111111] text-[12px] tracking-[0.4em] font-[300] transition-all duration-1000 uppercase min-w-[280px] flex items-center justify-center ${(state.isGenerating || isVerifying || (hasReachedLimit && !state.isGenerating)) ? 'opacity-30 border-[#EEEEEE] text-[#999999] cursor-not-allowed' : 'hover:bg-[#111111] hover:text-white cursor-pointer active:scale-95'}`}
              >
                {state.isGenerating ? `${state.step.toUpperCase()}...` : isVerifying ? 'VERIFYING...' : 'GENERATE DESIGN'}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 animate-in slide-in-from-bottom-8 duration-1000">
            <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-32 h-fit">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] tracking-[0.4em] uppercase text-[#111111] font-light">Original Blueprint</span>
                <span className="text-[9px] tracking-[0.2em] uppercase text-[#111111] font-[300]">原始藍圖</span>
              </div>
              <div className="border-[0.5px] border-[#EEEEEE] p-1 bg-[#FAFAFA]">
                <img src={state.uploadedImage!} alt="Blueprint" className="w-full grayscale contrast-125 opacity-70" />
              </div>
              <button onClick={() => setState(p => ({ ...p, results: [], uploadedImage: null }))} className="text-[10px] tracking-[0.3em] text-[#111111] mt-2 flex items-center gap-2 hover:opacity-50 transition-opacity uppercase font-[200]">
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
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  const [page, setPage] = useState<'landing' | 'lab'>('landing');
  return page === 'landing'
    ? <LandingPage onEnterLab={() => setPage('lab')} />
    : <AILab onBack={() => setPage('landing')} />;
};

export default App;