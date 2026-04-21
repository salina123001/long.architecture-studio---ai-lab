import React, { useState } from 'react';

const PROJECTS = [
  {
    id: '01',
    title: '仁愛路住宅',
    titleEn: 'Renai Residence',
    type: 'residential',
    typeZh: '住宅',
    year: '2024',
    location: '台北市大安區',
    desc: '以光為設計語彙，透過材質的層次與留白，打造靜謐的都市居所。',
    cover: 'https://res.cloudinary.com/djtlcde9i/image/upload/v1776777779/long_arch_01_%E4%BB%81%E6%84%9B%E8%B7%AF%E4%BD%8F%E5%AE%85_%E5%AE%A2%E5%BB%B3_l2fl7t.png',
    images: [
      { url: 'https://res.cloudinary.com/djtlcde9i/image/upload/v1776777779/long_arch_01_%E4%BB%81%E6%84%9B%E8%B7%AF%E4%BD%8F%E5%AE%85_%E5%AE%A2%E5%BB%B3_l2fl7t.png', space: '客廳' },
      { url: 'https://res.cloudinary.com/djtlcde9i/image/upload/v1776777780/long_arch_01_%E4%BB%81%E6%84%9B%E8%B7%AF%E4%BD%8F%E5%AE%85_%E9%A4%90%E5%BB%B3_u14hll.png', space: '餐廳' },
      { url: 'https://res.cloudinary.com/djtlcde9i/image/upload/v1776777778/long_arch_01_%E4%BB%81%E6%84%9B%E8%B7%AF%E4%BD%8F%E5%AE%85_%E4%B8%BB%E8%87%A5_vfdsse.png', space: '主臥' },
      { url: 'https://res.cloudinary.com/djtlcde9i/image/upload/v1776777780/long_arch_01_%E4%BB%81%E6%84%9B%E8%B7%AF%E4%BD%8F%E5%AE%85_%E6%B5%B4%E5%AE%A4_kyozjq.png', space: '浴室' },
      { url: 'https://res.cloudinary.com/djtlcde9i/image/upload/v1776777778/long_arch_01_%E4%BB%81%E6%84%9B%E8%B7%AF%E4%BD%8F%E5%AE%85_%E7%8E%84%E9%97%9C_ho2aod.png', space: '玄關' },
    ]
  },
  {
    id: '02',
    title: '信義複合辦公',
    titleEn: 'Xinyi Office Complex',
    type: 'office',
    typeZh: '辦公',
    year: '2023',
    location: '台北市信義區',
    desc: '以開放式格局重新定義工作場所的可能性，融入自然採光與彈性動線設計。',
    cover: 'https://res.cloudinary.com/djtlcde9i/image/upload/v1776778163/long_arch_02_%E4%BF%A1%E7%BE%A9%E8%A4%87%E5%90%88%E8%BE%A6%E5%85%AC_%E6%8E%A5%E5%BE%85%E5%A4%A7%E5%BB%B3_p76yao.png',
    images: [
      { url: 'https://res.cloudinary.com/djtlcde9i/image/upload/v1776778163/long_arch_02_%E4%BF%A1%E7%BE%A9%E8%A4%87%E5%90%88%E8%BE%A6%E5%85%AC_%E6%8E%A5%E5%BE%85%E5%A4%A7%E5%BB%B3_p76yao.png', space: '接待大廳' },
      { url: 'https://res.cloudinary.com/djtlcde9i/image/upload/v1776778159/long_arch_02_%E4%BF%A1%E7%BE%A9%E8%A4%87%E5%90%88%E8%BE%A6%E5%85%AC_%E6%9C%83%E8%AD%B0%E5%AE%A4_k8gf7j.png', space: '會議室' },
    ]
  },
  {
    id: '03',
    title: '南港餐飲空間',
    titleEn: 'Nangang Dining',
    type: 'commercial',
    typeZh: '商業',
    year: '2023',
    location: '台北市南港區',
    desc: '品牌空間的感官延伸，以材料的對話取代多餘的裝飾。',
    cover: 'https://res.cloudinary.com/djtlcde9i/image/upload/v1776777944/long_arch_03_%E5%8D%97%E6%B8%AF%E9%A4%90%E9%A3%B2%E7%A9%BA%E9%96%93_%E9%A4%90%E5%BB%B3%E5%85%A5%E5%8F%A3_epl8eo.png',
    images: [
      { url: 'https://res.cloudinary.com/djtlcde9i/image/upload/v1776777944/long_arch_03_%E5%8D%97%E6%B8%AF%E9%A4%90%E9%A3%B2%E7%A9%BA%E9%96%93_%E9%A4%90%E5%BB%B3%E5%85%A5%E5%8F%A3_epl8eo.png', space: '餐廳入口' },
      { url: 'https://res.cloudinary.com/djtlcde9i/image/upload/v1776777943/long_arch_03_%E5%8D%97%E6%B8%AF%E9%A4%90%E9%A3%B2%E7%A9%BA%E9%96%93_%E4%B8%BB%E7%94%A8%E9%A4%90%E5%8D%80_cy9jxo.png', space: '主用餐區' },
      { url: 'https://res.cloudinary.com/djtlcde9i/image/upload/v1776777943/long_arch_03_%E5%8D%97%E6%B8%AF%E9%A4%90%E9%A3%B2%E7%A9%BA%E9%96%93_%E5%90%A7%E5%8F%B0_mxpkv5.png', space: '吧台' },
    ]
  },
  {
    id: '04',
    title: '天母別墅改造',
    titleEn: 'Tianmu Villa Renovation',
    type: 'residential',
    typeZh: '住宅',
    year: '2022',
    location: '台北市士林區',
    desc: '舊屋翻新，保留原始結構，注入溫潤木質元素，重建家的記憶。',
    cover: 'https://res.cloudinary.com/djtlcde9i/image/upload/v1776778192/long_arch_04_%E5%A4%A9%E6%AF%8D%E5%88%A5%E5%A2%85%E6%94%B9%E9%80%A0_%E8%B5%B7%E5%B1%85%E5%AE%A4_d0eykc.png',
    images: [
      { url: 'https://res.cloudinary.com/djtlcde9i/image/upload/v1776778192/long_arch_04_%E5%A4%A9%E6%AF%8D%E5%88%A5%E5%A2%85%E6%94%B9%E9%80%A0_%E8%B5%B7%E5%B1%85%E5%AE%A4_d0eykc.png', space: '起居室' },
      { url: 'https://res.cloudinary.com/djtlcde9i/image/upload/v1776778191/long_arch_04_%E5%A4%A9%E6%AF%8D%E5%88%A5%E5%A2%85%E6%94%B9%E9%80%A0_%E6%9B%B8%E6%88%BF_aww8mt.png', space: '書房' },
    ]
  },
];

type FilterType = 'all' | 'residential' | 'office' | 'commercial';

interface ProjectsProps {
  onBack: () => void;
}

const Projects: React.FC<ProjectsProps> = ({ onBack }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedProject, setSelectedProject] = useState<typeof PROJECTS[0] | null>(null);
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);

  const filtered = filter === 'all' ? PROJECTS : PROJECTS.filter(p => p.type === filter);

  if (selectedProject) {
    return (
      <div style={{ fontFamily: "'Inter','Helvetica Neue',sans-serif", background: '#fff', minHeight: '100vh' }}>
        {/* Header */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'1.4rem 2rem', borderBottom:'0.5px solid rgba(0,0,0,0.07)', position:'sticky', top:0, background:'rgba(255,255,255,0.96)', zIndex:100 }}>
          <div>
            <div style={{ fontSize:'1rem', fontWeight:200, letterSpacing:'0.06em' }}>long.architecture studio</div>
            <div style={{ fontSize:'8px', letterSpacing:'0.5em', color:'#888', marginTop:'3px' }}>巃．建築設計事務所</div>
          </div>
          <button onClick={() => setSelectedProject(null)} style={{ fontSize:'11px', letterSpacing:'0.3em', color:'#111', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:300, textTransform:'uppercase' }}>← Projects</button>
        </div>

        <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'3rem 2rem' }}>
          {/* Project info */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:'4rem', marginBottom:'3rem', alignItems:'start' }}>
            <div>
              <div style={{ fontSize:'8px', letterSpacing:'0.5em', color:'#aaa', textTransform:'uppercase', marginBottom:'0.8rem' }}>{selectedProject.id} / {selectedProject.typeZh}</div>
              <div style={{ fontSize:'1.6rem', fontWeight:200, letterSpacing:'0.06em', color:'#1a1a1a', marginBottom:'0.3rem' }}>{selectedProject.title}</div>
              <div style={{ fontSize:'11px', letterSpacing:'0.2em', color:'#aaa', marginBottom:'1.5rem' }}>{selectedProject.titleEn}</div>
              <div style={{ width:'32px', height:'0.5px', background:'#bbb', marginBottom:'1.5rem' }} />
              <div style={{ fontSize:'12px', fontWeight:300, color:'#555', lineHeight:2, marginBottom:'1.5rem' }}>{selectedProject.desc}</div>
              <div style={{ fontSize:'10px', color:'#aaa', letterSpacing:'0.1em' }}>{selectedProject.year} · {selectedProject.location}</div>
            </div>
            <div>
              {/* Main image */}
              <div style={{ aspectRatio:'16/9', overflow:'hidden', marginBottom:'10px', background:'#f5f4f2' }}>
                <img src={selectedProject.images[selectedImgIdx].url} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
              </div>
              {/* Thumbnails */}
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {selectedProject.images.map((img, i) => (
                  <div key={i} onClick={() => setSelectedImgIdx(i)}
                    style={{ width:'80px', aspectRatio:'4/3', overflow:'hidden', cursor:'pointer', opacity: i === selectedImgIdx ? 1 : 0.5, border: i === selectedImgIdx ? '1px solid #111' : '0.5px solid transparent', transition:'all 0.3s' }}>
                    <img src={img.url} alt={img.space} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                  </div>
                ))}
              </div>
              <div style={{ fontSize:'10px', color:'#aaa', letterSpacing:'0.15em', marginTop:'8px', textTransform:'uppercase' }}>{selectedProject.images[selectedImgIdx].space}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Inter','Helvetica Neue',sans-serif", background: '#fff', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'1.4rem 2rem', borderBottom:'0.5px solid rgba(0,0,0,0.07)', position:'sticky', top:0, background:'rgba(255,255,255,0.96)', zIndex:100 }}>
        <div>
          <div style={{ fontSize:'1rem', fontWeight:200, letterSpacing:'0.06em' }}>long.architecture studio</div>
          <div style={{ fontSize:'8px', letterSpacing:'0.5em', color:'#888', marginTop:'3px' }}>巃．建築設計事務所</div>
        </div>
        <button onClick={onBack} style={{ fontSize:'11px', letterSpacing:'0.3em', color:'#111', background:'none', border:'none', cursor:'pointer', fontFamily:'inherit', fontWeight:300, textTransform:'uppercase' }}>← Back to Studio</button>
      </div>

      <div style={{ maxWidth:'1100px', margin:'0 auto', padding:'3rem 2rem' }}>
        {/* Title */}
        <div style={{ marginBottom:'2.5rem' }}>
          <div style={{ fontSize:'8px', letterSpacing:'0.5em', color:'#aaa', textTransform:'uppercase', marginBottom:'0.6rem' }}>Selected Works</div>
          <div style={{ fontSize:'1.6rem', fontWeight:200, letterSpacing:'0.08em', color:'#1a1a1a' }}>作品集</div>
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:'2rem', marginBottom:'2.5rem', borderBottom:'0.5px solid rgba(0,0,0,0.06)', paddingBottom:'1rem' }}>
          {[['all','All'],['residential','住宅'],['office','辦公'],['commercial','商業']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val as FilterType)}
              style={{ background:'none', border:'none', fontFamily:'inherit', fontSize:'10px', letterSpacing:'0.3em', color: filter === val ? '#111' : '#aaa', cursor:'pointer', padding:'4px 0', textTransform:'uppercase', position:'relative', paddingBottom:'6px', borderBottom: filter === val ? '0.5px solid #111' : '0.5px solid transparent', transition:'all 0.3s' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'16px' }}>
          {filtered.map((proj, i) => (
            <div key={proj.id} onClick={() => { setSelectedProject(proj); setSelectedImgIdx(0); }}
              style={{ cursor:'pointer', position:'relative', overflow:'hidden', background:'#f5f4f2', aspectRatio: i === 0 ? '21/9' : '4/3', gridColumn: i === 0 ? '1 / -1' : 'auto' }}>
              <img src={proj.cover} alt={proj.title}
                style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'transform 0.7s ease' }}
                onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.04)')}
                onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')} />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)', pointerEvents:'none' }} />
              <div style={{ position:'absolute', bottom:'1.2rem', left:'1.4rem' }}>
                <div style={{ fontSize:'8px', letterSpacing:'0.3em', color:'rgba(255,255,255,0.7)', textTransform:'uppercase', marginBottom:'4px' }}>{proj.typeZh} · {proj.year}</div>
                <div style={{ fontSize: i === 0 ? '1.3rem' : '1rem', fontWeight:200, color:'#fff', letterSpacing:'0.06em' }}>{proj.title}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;
