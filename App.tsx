import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const aboutRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const aboutLeftRef = useRef<HTMLDivElement>(null);
  const aboutRightRef = useRef<HTMLDivElement>(null);
  const footerRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 數字計數動畫
  const animateCount = (el: HTMLSpanElement, target: number) => {
    let current = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = String(current);
      if (current >= target) clearInterval(timer);
    }, 30);
  };

  useEffect(() => {
    const targets = [
      aboutLeftRef.current,
      aboutRightRef.current,
      ...footerRefs.current,
    ].filter(Boolean) as HTMLDivElement[];

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('reveal-visible');
          // 數字動畫
          const nums = e.target.querySelectorAll<HTMLSpanElement>('[data-target]');
          nums.forEach(n => animateCount(n, parseInt(n.dataset.target || '0')));
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });

    targets.forEach(t => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ fontFamily: "'Inter','Helvetica Neue',sans-serif", background: '#fff', color: '#222' }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .reveal-block {
          opacity: 0;
          transform: translateY(32px);
          transition: opacity 0.9s ease, transform 0.9s ease;
        }
        .reveal-block.delay-1 { transition-delay: 0.15s; }
        .reveal-block.delay-2 { transition-delay: 0.3s; }
        .reveal-visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        .entry-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }
        .entry-panel::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0);
          transition: background 0.5s ease;
        }
        .entry-panel:hover::after { background: rgba(0,0,0,0.06); }
        .entry-inner {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          position: relative;
          z-index: 1;
          transition: transform 0.5s ease;
        }
        .entry-panel:hover .entry-inner { transform: translateY(-6px); }
        .entry-btn {
          font-size: 9px;
          letter-spacing: 0.35em;
          color: #555;
          border: 0.5px solid #999;
          padding: 0.6rem 1.6rem;
          text-transform: uppercase;
          opacity: 0;
          transform: translateY(8px);
          transition: opacity 0.4s ease, transform 0.4s ease, background 0.3s, color 0.3s;
          font-family: inherit;
          background: transparent;
          cursor: pointer;
        }
        .entry-panel:hover .entry-btn { opacity: 1; transform: translateY(0); }
        .entry-btn:hover { background: #222; color: #fff; border-color: #222; }
        .nav-link {
          font-size: 11px;
          font-weight: 300;
          color: #555;
          letter-spacing: 0.08em;
          cursor: pointer;
          position: relative;
          padding-bottom: 2px;
          text-decoration: none;
          transition: color 0.3s;
          background: none;
          border: none;
          font-family: inherit;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 0; height: 0.5px;
          background: #222;
          transition: width 0.3s;
        }
        .nav-link:hover { color: #222; }
        .nav-link:hover::after { width: 100%; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1.8rem 3rem', borderBottom: '0.5px solid rgba(0,0,0,0.07)', position: 'sticky', top: 0, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)', zIndex: 100 }}>
        <div>
          <div style={{ fontSize: '1.2rem', fontWeight: 200, letterSpacing: '0.06em' }}>long.architecture studio</div>
          <div style={{ fontSize: '9px', letterSpacing: '0.55em', color: '#888', marginTop: '5px' }}>巃．建築設計事務所</div>
        </div>
        <div style={{ display: 'flex', gap: '2.5rem', paddingTop: '6px' }}>
          <button className="nav-link" onClick={() => scrollTo(aboutRef)}>projects</button>
          <button className="nav-link" onClick={() => scrollTo(aboutRef)}>about</button>
          <button className="nav-link" onClick={onEnterLab} style={{ color: '#222', borderBottom: '0.5px solid #222', paddingBottom: '2px' }}>ai lab</button>
          <button className="nav-link" onClick={() => scrollTo(contactRef)}>contact</button>
        </div>
      </div>

      {/* Hero：兩個入口 */}
      <div style={{ position: 'relative', width: '100%', height: '100vh', background: 'linear-gradient(140deg,#f7f6f4 0%,#edeae4 40%,#f2efeb 70%,#e9e6e0 100%)', display: 'flex', overflow: 'hidden' }}>
        {/* 大理石紋 */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.18, pointerEvents: 'none' }}>
          {[[18,8,45,-13],[32,2,60,-10],[52,15,50,-16],[68,0,55,-8]].map(([t,l,w,r],i) => (
            <div key={i} style={{ position:'absolute', top:`${t}%`, left:`${l}%`, width:`${w}%`, height: i%2===0?'0.5px':'1px', background:'#bbb', transform:`rotate(${r}deg)` }} />
          ))}
          {[[28,8,38,18],[60,3,42,14]].map(([t,r,w,rot],i) => (
            <div key={i} style={{ position:'absolute', top:`${t}%`, right:`${r}%`, width:`${w}%`, height:'0.5px', background:'#aaa', transform:`rotate(${rot}deg)` }} />
          ))}
        </div>

        {/* 左：Projects */}
        <div className="entry-panel" style={{ borderRight: '0.5px solid rgba(0,0,0,0.1)' }}>
          <div className="entry-inner">
            <div style={{ fontSize:'9px', letterSpacing:'0.6em', color:'#999', textTransform:'uppercase', animation:'fadeInUp 0.8s 0.2s both' }}>01</div>
            <div style={{ fontSize:'2.2rem', fontWeight:200, letterSpacing:'0.12em', textTransform:'uppercase', color:'#1a1a1a', animation:'fadeInUp 0.8s 0.4s both' }}>Projects</div>
            <div style={{ fontSize:'14px', letterSpacing:'0.2em', color:'#777', animation:'fadeInUp 0.8s 0.6s both' }}>作品集</div>
            <button className="entry-btn" onClick={() => scrollTo(aboutRef)}>View Works →</button>
          </div>
        </div>

        {/* 右：AI Lab */}
        <div className="entry-panel">
          <div className="entry-inner">
            <div style={{ fontSize:'9px', letterSpacing:'0.6em', color:'#999', textTransform:'uppercase', animation:'fadeInUp 0.8s 0.3s both' }}>02</div>
            <div style={{ fontSize:'2.2rem', fontWeight:200, letterSpacing:'0.12em', textTransform:'uppercase', color:'#1a1a1a', animation:'fadeInUp 0.8s 0.5s both' }}>AI Lab</div>
            <div style={{ fontSize:'14px', letterSpacing:'0.2em', color:'#777', animation:'fadeInUp 0.8s 0.7s both' }}>空間設計生成</div>
            <button className="entry-btn" onClick={onEnterLab}>Enter Lab →</button>
          </div>
        </div>
      </div>

      {/* About */}
      <div ref={aboutRef} style={{ padding: '7rem 3rem', maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: '6rem', alignItems: 'start' }}>
        <div ref={aboutLeftRef} className="reveal-block">
          <div style={{ fontSize:'9px', letterSpacing:'0.5em', color:'#aaa', textTransform:'uppercase', marginBottom:'1.5rem' }}>About</div>
          <div style={{ fontSize:'1.5rem', fontWeight:200, color:'#1a1a1a', letterSpacing:'0.05em', lineHeight:1.7 }}>關於<br/>巃．建築</div>
          <div style={{ width:'32px', height:'0.5px', background:'#bbb', marginTop:'2rem' }} />
        </div>
        <div ref={aboutRightRef} className="reveal-block delay-1">
          <p style={{ fontSize:'0.9rem', fontWeight:300, color:'#555', lineHeight:2.1, marginBottom:'1.8rem' }}>
            巃．建築設計事務所創立於2015年，長期致力於探索空間與光線的本質關係。我們相信，真正的建築不只是結構的堆疊，而是對生活方式的深刻回應。
          </p>
          <p style={{ fontSize:'0.9rem', fontWeight:300, color:'#555', lineHeight:2.1, marginBottom:'3rem' }}>
            從住宅設計到商業空間，每一個專案都從場地的獨特性出發，融合材料的質感與光影的流動，打造出兼具機能與美學的建築語彙。近年來，事務所更引入 AI 輔助設計工具，讓業主在設計初期即可直觀感受空間提案的可能性。
          </p>
          <div style={{ display:'flex', gap:'4rem' }}>
            {[{target:80,suffix:'+',label:'PROJECTS'},{target:10,suffix:'',label:'YEARS'},{target:5,suffix:'',label:'AWARDS'}].map(({target,suffix,label}) => (
              <div key={label}>
                <div style={{ display:'flex', alignItems:'baseline', gap:'2px' }}>
                  <span data-target={target} style={{ fontSize:'1.8rem', fontWeight:200, color:'#1a1a1a' }}>0</span>
                  <span style={{ fontSize:'1.8rem', fontWeight:200, color:'#1a1a1a' }}>{suffix}</span>
                </div>
                <div style={{ fontSize:'8px', letterSpacing:'0.3em', color:'#aaa', marginTop:'6px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 分隔線 */}
      <div style={{ height:'0.5px', background:'rgba(0,0,0,0.07)', margin:'0 3rem' }} />

      {/* Footer */}
      <div ref={contactRef} style={{ padding:'5rem 3rem 3rem', maxWidth:'1100px', margin:'0 auto', display:'grid', gridTemplateColumns:'1.5fr 1fr 1fr', gap:'4rem' }}>
        {[0,1,2].map(i => (
          <div key={i} ref={el => { footerRefs.current[i] = el; }} className={`reveal-block${i > 0 ? ` delay-${i}` : ''}`}>
            {i === 0 && <>
              <div style={{ fontSize:'1.1rem', fontWeight:200, letterSpacing:'0.06em', marginBottom:'0.5rem' }}>long.architecture studio</div>
              <div style={{ fontSize:'9px', letterSpacing:'0.5em', color:'#aaa', marginBottom:'1.5rem' }}>巃．建築設計事務所</div>
              <div style={{ fontSize:'11px', fontWeight:300, color:'#666', lineHeight:2.2 }}>
                台北市大安區仁愛路四段 126 號 15 樓<br/>
                info@long-architecture.com<br/>
                +886 2 2700 0000
              </div>
            </>}
            {i === 1 && <>
              <div style={{ fontSize:'9px', letterSpacing:'0.5em', color:'#aaa', textTransform:'uppercase', marginBottom:'1.5rem' }}>Navigation</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.9rem', fontSize:'11px', fontWeight:300, color:'#666', letterSpacing:'0.05em' }}>
                {['Projects','About','AI Lab','Contact'].map(l => (
                  <button key={l} onClick={l === 'AI Lab' ? onEnterLab : l === 'Contact' ? () => scrollTo(contactRef) : () => scrollTo(aboutRef)}
                    style={{ background:'none', border:'none', fontFamily:'inherit', fontSize:'11px', fontWeight:300, color:'#666', letterSpacing:'0.05em', cursor:'pointer', textAlign:'left', padding:0, transition:'color 0.3s' }}
                    onMouseOver={e => (e.currentTarget.style.color='#222')}
                    onMouseOut={e => (e.currentTarget.style.color='#666')}
                  >{l}</button>
                ))}
              </div>
            </>}
            {i === 2 && <>
              <div style={{ fontSize:'9px', letterSpacing:'0.5em', color:'#aaa', textTransform:'uppercase', marginBottom:'1.5rem' }}>Follow</div>
              <div style={{ display:'flex', flexDirection:'column', gap:'0.9rem', fontSize:'11px', fontWeight:300, color:'#666', letterSpacing:'0.05em' }}>
                {['Instagram','Facebook','LinkedIn'].map(l => <span key={l}>{l}</span>)}
              </div>
            </>}
          </div>
        ))}
      </div>

      <div style={{ padding:'1.5rem 3rem 2.5rem', borderTop:'0.5px solid rgba(0,0,0,0.07)', marginTop:'1rem' }}>
        <div style={{ fontSize:'10px', fontWeight:300, color:'#ccc', letterSpacing:'0.05em' }}>© 2025 long.architecture studio. All rights reserved.</div>
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
      <Header onBack={onBack} />
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