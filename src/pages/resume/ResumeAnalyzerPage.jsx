import { useState, useRef, useCallback } from 'react';

const SKILL_CATEGORIES = {
  'Programming Languages': { present: ['Python','JavaScript','C++'], missing: ['TypeScript','Go','Rust'] },
  'Web & Frameworks':      { present: ['React','HTML/CSS','Node.js'], missing: ['Next.js','FastAPI','GraphQL'] },
  'Data & AI':             { present: ['NumPy','Pandas'], missing: ['PyTorch','TensorFlow','LangChain','Scikit-learn'] },
  'DevOps & Cloud':        { present: ['Git','GitHub'], missing: ['Docker','Kubernetes','AWS','CI/CD'] },
};

const CAREER_PATHS = [
  { title:'Full-Stack Developer', match:78, color:'#CC1111', icon:'⚡', desc:'Strong frontend base. Add TypeScript, Next.js & backend depth.', roadmap:['TypeScript','Next.js','PostgreSQL','Docker','AWS'] },
  { title:'AI / ML Engineer',     match:61, color:'#E85D04', icon:'🧠', desc:'Python skills are solid. Deepen ML frameworks and MLOps.',      roadmap:['PyTorch','Scikit-learn','MLflow','LangChain','Kubernetes'] },
  { title:'DevOps / Cloud',       match:45, color:'#F4A261', icon:'☁️', desc:'Git is a start. Focus on containers, cloud, and pipelines.',    roadmap:['Docker','Kubernetes','Terraform','AWS','CI/CD'] },
];

const CERTS = [
  { name:'AWS Solutions Architect', provider:'Amazon', priority:'High' },
  { name:'TensorFlow Developer',    provider:'Google', priority:'High' },
  { name:'GitHub Actions',          provider:'GitHub', priority:'Medium' },
  { name:'Docker Certified Assoc.', provider:'Docker', priority:'Medium' },
];

function ScoreRing({ score, label, size=120, stroke=10, color='var(--c1)' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition:'stroke-dasharray 1.2s cubic-bezier(.22,1,.36,1)' }}/>
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
          fill="var(--t1)" fontSize={size*0.22} fontWeight={700}
          fontFamily="'Orbitron',monospace"
          style={{ transform:'rotate(90deg)', transformOrigin:'center' }}>{score}</text>
      </svg>
      <span style={{ color:'var(--t2)', fontSize:'0.78rem', letterSpacing:'0.08em', textTransform:'uppercase' }}>{label}</span>
    </div>
  );
}

function SkillPill({ label, present }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:5,
      padding:'4px 11px', borderRadius:20, fontSize:'0.78rem', fontWeight:600,
      background: present ? 'rgba(204,17,17,0.15)' : 'rgba(255,255,255,0.05)',
      border:`1px solid ${present ? 'rgba(204,17,17,0.5)' : 'rgba(255,255,255,0.1)'}`,
      color: present ? '#ff6b6b' : 'var(--t2)',
    }}>
      <span style={{ fontSize:'0.65rem' }}>{present ? '✓' : '+'}</span>{label}
    </span>
  );
}

function MatchBar({ value, color }) {
  return (
    <div style={{ height:6, borderRadius:3, background:'rgba(255,255,255,.07)', overflow:'hidden', flex:1 }}>
      <div style={{ height:'100%', width:`${value}%`, borderRadius:3, background:color, transition:'width 1s cubic-bezier(.22,1,.36,1)' }}/>
    </div>
  );
}

function UploadZone({ onFile, fileName }) {
  const ref = useRef(null);
  const [drag, setDrag] = useState(false);
  const onDrop = useCallback(e => { e.preventDefault(); setDrag(false); const f=e.dataTransfer.files[0]; if(f) onFile(f); }, [onFile]);
  return (
    <div onClick={() => ref.current?.click()}
      onDragOver={e=>{ e.preventDefault(); setDrag(true); }}
      onDragLeave={()=>setDrag(false)} onDrop={onDrop}
      style={{ border:`2px dashed ${drag?'var(--c1)':'rgba(255,255,255,.15)'}`, borderRadius:16,
        padding:'48px 32px', textAlign:'center', cursor:'pointer',
        background: drag?'rgba(204,17,17,0.06)':'rgba(255,255,255,0.02)', transition:'all .2s' }}>
      <input ref={ref} type="file" accept=".pdf,.doc,.docx" style={{ display:'none' }} onChange={e=>{ if(e.target.files[0]) onFile(e.target.files[0]); }}/>
      <div style={{ fontSize:'2.8rem', marginBottom:12 }}>{fileName ? '✅' : '📄'}</div>
      {fileName ? (
        <><p style={{ color:'var(--t1)', fontWeight:700, marginBottom:4 }}>{fileName}</p><p style={{ color:'var(--t2)', fontSize:'0.82rem' }}>Click to replace</p></>
      ) : (
        <><p style={{ color:'var(--t1)', fontWeight:700, fontSize:'1.05rem', marginBottom:8 }}>Drop your resume here</p>
          <p style={{ color:'var(--t2)', fontSize:'0.85rem', lineHeight:1.6 }}>PDF, DOC or DOCX · max 5 MB</p>
          <div style={{ display:'inline-block', marginTop:16, padding:'8px 20px', borderRadius:8, background:'linear-gradient(135deg,#CC1111,#880000)', color:'#fff', fontSize:'0.82rem', fontWeight:600 }}>Browse File</div>
        </>
      )}
    </div>
  );
}

export default function ResumeAnalyzerPage({ onBack }) {
  const [file,      setFile]      = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed,  setAnalyzed]  = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [active,    setActive]    = useState(null);

  const handleFile = f => { setFile(f); setAnalyzed(false); };

  const handleAnalyze = () => {
    if (!file) return;
    setAnalyzing(true); setProgress(0);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 18 + 4;
      if (p >= 100) { clearInterval(iv); setAnalyzing(false); setAnalyzed(true); p = 100; }
      setProgress(Math.min(Math.round(p), 100));
    }, 220);
  };

  const card = { background:'rgba(255,255,255,0.035)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'28px 24px' };
  const secTitle = { fontFamily:"'Orbitron',monospace", fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--c1)', marginBottom:20 };

  return (
    <div style={{ minHeight:'100vh', padding:'40px 0 80px' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 24px' }}>

        <button onClick={onBack} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--t2)', fontSize:'0.88rem', display:'flex', alignItems:'center', gap:6, marginBottom:36, padding:0 }}
          onMouseEnter={e=>e.currentTarget.style.color='var(--t1)'} onMouseLeave={e=>e.currentTarget.style.color='var(--t2)'}>
          ← Back to Home
        </button>

        <div style={{ marginBottom:48 }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(204,17,17,0.12)', border:'1px solid rgba(204,17,17,0.3)', borderRadius:20, padding:'5px 14px', marginBottom:16 }}>
            <span style={{ width:7, height:7, borderRadius:'50%', background:'#CC1111', display:'inline-block' }}/>
            <span style={{ color:'#ff6b6b', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase' }}>AI-Powered · Issue #59</span>
          </div>
          <h1 style={{ fontFamily:"'Orbitron',monospace", fontSize:'clamp(1.8rem,4vw,3rem)', fontWeight:900, color:'var(--t1)', lineHeight:1.15, marginBottom:12 }}>
            Resume Analyzer &<br/>
            <span style={{ background:'linear-gradient(135deg,#CC1111,#FF4444)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Career Dashboard</span>
          </h1>
          <p style={{ color:'var(--t2)', fontSize:'1rem', maxWidth:520, lineHeight:1.7 }}>Upload your resume and get instant AI-driven skill gap analysis, career path recommendations, and a personalised roadmap.</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:20, marginBottom:32 }}>
          <div style={card}><p style={secTitle}>01 — Upload Resume</p><UploadZone onFile={handleFile} fileName={file?.name}/></div>
          <div style={{ ...card, display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
            <p style={secTitle}>What you will get</p>
            {[['🎯','Skill gap detection','See exactly what is missing for your target role'],['📊','ATS compatibility score','Know if your resume passes automated screening'],['🗺️','Personalised roadmap','Step-by-step learning plan built for you'],['🏆','Career path match %','Ranked fits across popular tech domains']].map(([icon,title,desc])=>(
              <div key={title} style={{ display:'flex', gap:14, marginBottom:18 }}>
                <span style={{ fontSize:'1.3rem', lineHeight:1 }}>{icon}</span>
                <div><p style={{ color:'var(--t1)', fontWeight:600, fontSize:'0.88rem', marginBottom:2 }}>{title}</p><p style={{ color:'var(--t2)', fontSize:'0.78rem', lineHeight:1.5 }}>{desc}</p></div>
              </div>
            ))}
          </div>
        </div>

        {!analyzed && (
          <div style={{ textAlign:'center', marginBottom:48 }}>
            <button onClick={handleAnalyze} disabled={!file||analyzing}
              style={{ padding:'14px 48px', borderRadius:12, background: file&&!analyzing?'linear-gradient(135deg,#CC1111,#880000)':'rgba(255,255,255,0.06)', border:'none', color: file&&!analyzing?'#fff':'var(--t2)', fontSize:'0.95rem', fontWeight:700, cursor: file&&!analyzing?'pointer':'not-allowed', fontFamily:"'Orbitron',monospace", letterSpacing:'0.06em', boxShadow: file&&!analyzing?'0 4px 24px rgba(204,17,17,0.4)':'none', transition:'all .2s' }}>
              {analyzing ? `Analyzing… ${progress}%` : 'Analyze Resume →'}
            </button>
            {analyzing && (
              <div style={{ maxWidth:400, margin:'16px auto 0', height:4, borderRadius:2, background:'rgba(255,255,255,.07)' }}>
                <div style={{ height:'100%', borderRadius:2, width:`${progress}%`, background:'linear-gradient(90deg,#CC1111,#FF4444)', transition:'width .25s linear' }}/>
              </div>
            )}
          </div>
        )}

        {analyzed && (
          <div>
            <div style={{ ...card, display:'flex', flexWrap:'wrap', justifyContent:'space-around', alignItems:'center', gap:32, marginBottom:24 }}>
              <ScoreRing score={74} label="Resume Score"     color="#CC1111"/>
              <ScoreRing score={81} label="ATS Score"        color="#E85D04"/>
              <ScoreRing score={68} label="Skill Coverage"   color="#F4A261"/>
              <ScoreRing score={61} label="Career Readiness" color="#2A9D8F"/>
              <div style={{ flex:'1 1 200px', minWidth:200 }}>
                <p style={{ color:'var(--t1)', fontWeight:700, marginBottom:8 }}>Quick Summary</p>
                <p style={{ color:'var(--t2)', fontSize:'0.85rem', lineHeight:1.7 }}>Strong foundation in web development with good Python skills. Key gaps: cloud, containerisation, and advanced ML frameworks. Focus on TypeScript and Docker next.</p>
                <button onClick={()=>{ setFile(null); setAnalyzed(false); }} style={{ marginTop:16, background:'none', border:'1px solid rgba(255,255,255,.12)', borderRadius:8, padding:'7px 16px', color:'var(--t2)', fontSize:'0.78rem', cursor:'pointer' }}>↺ Analyse another resume</button>
              </div>
            </div>

            <div style={{ ...card, marginBottom:24 }}>
              <p style={secTitle}>02 — Skill Gap Analysis</p>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:24 }}>
                {Object.entries(SKILL_CATEGORIES).map(([cat,{present,missing}])=>(
                  <div key={cat}>
                    <p style={{ color:'var(--t2)', fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 }}>{cat}</p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                      {present.map(s=><SkillPill key={s} label={s} present/>)}
                      {missing.map(s=><SkillPill key={s} label={s} present={false}/>)}
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:20, display:'flex', gap:20, flexWrap:'wrap' }}>
                <span style={{ color:'#ff6b6b', fontSize:'0.78rem' }}>✓ Skills you have</span>
                <span style={{ color:'var(--t2)', fontSize:'0.78rem' }}>+ Recommended additions</span>
              </div>
            </div>

            <div style={{ ...card, marginBottom:24 }}>
              <p style={secTitle}>03 — Career Path Match</p>
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {CAREER_PATHS.map((path,i)=>(
                  <div key={path.title} onClick={()=>setActive(active===i?null:i)}
                    style={{ borderRadius:12, overflow:'hidden', cursor:'pointer', border:`1px solid ${active===i?path.color+'55':'rgba(255,255,255,.07)'}`, background: active===i?`${path.color}09`:'rgba(255,255,255,.02)', transition:'all .2s' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:16, padding:'16px 20px' }}>
                      <span style={{ fontSize:'1.6rem' }}>{path.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                          <span style={{ color:'var(--t1)', fontWeight:700, fontSize:'0.95rem' }}>{path.title}</span>
                          <span style={{ color:path.color, fontWeight:800, fontFamily:"'Orbitron',monospace", fontSize:'0.9rem' }}>{path.match}%</span>
                        </div>
                        <MatchBar value={path.match} color={path.color}/>
                      </div>
                      <span style={{ color:'var(--t2)', fontSize:'0.8rem', marginLeft:4 }}>{active===i?'▲':'▼'}</span>
                    </div>
                    {active===i&&(
                      <div style={{ padding:'0 20px 20px' }}>
                        <p style={{ color:'var(--t2)', fontSize:'0.85rem', marginBottom:14 }}>{path.desc}</p>
                        <p style={{ color:'var(--t2)', fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:10 }}>Suggested next steps</p>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                          {path.roadmap.map((step,j)=>(
                            <span key={step} style={{ padding:'5px 13px', borderRadius:20, fontSize:'0.78rem', background:`${path.color}18`, border:`1px solid ${path.color}40`, color:'var(--t1)' }}>{j+1}. {step}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20, marginBottom:24 }}>
              <div style={card}>
                <p style={secTitle}>04 — Certifications</p>
                {CERTS.map(c=>(
                  <div key={c.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
                    <div><p style={{ color:'var(--t1)', fontSize:'0.88rem', fontWeight:600, marginBottom:2 }}>{c.name}</p><p style={{ color:'var(--t2)', fontSize:'0.75rem' }}>{c.provider}</p></div>
                    <span style={{ padding:'3px 10px', borderRadius:10, fontSize:'0.7rem', fontWeight:700, background: c.priority==='High'?'rgba(204,17,17,0.15)':'rgba(255,255,255,0.06)', color: c.priority==='High'?'#ff6b6b':'var(--t2)', border:`1px solid ${c.priority==='High'?'rgba(204,17,17,0.3)':'rgba(255,255,255,0.1)'}` }}>{c.priority}</span>
                  </div>
                ))}
              </div>
              <div style={card}>
                <p style={secTitle}>05 — NexaSphere Resources</p>
                {[['🗺️','Learning Roadmaps','Structured paths for every domain'],['💡','Hackathon / Codathon','Build real projects under pressure'],['🎤','Insight Sessions','Industry talks & career guidance'],['🔓','Open Source Day','First PR guidance & Git deep dive']].map(([icon,title,desc])=>(
                  <div key={title} style={{ display:'flex', gap:14, alignItems:'flex-start', padding:'12px 0', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
                    <span style={{ fontSize:'1.2rem' }}>{icon}</span>
                    <div><p style={{ color:'var(--t1)', fontSize:'0.88rem', fontWeight:600, marginBottom:2 }}>{title}</p><p style={{ color:'var(--t2)', fontSize:'0.75rem' }}>{desc}</p></div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...card, textAlign:'center', background:'linear-gradient(135deg,rgba(204,17,17,0.12),rgba(136,0,0,0.08))', border:'1px solid rgba(204,17,17,0.2)' }}>
              <p style={{ fontFamily:"'Orbitron',monospace", fontSize:'clamp(1rem,2.5vw,1.4rem)', fontWeight:800, color:'var(--t1)', marginBottom:8 }}>Ready to close the gap?</p>
              <p style={{ color:'var(--t2)', fontSize:'0.88rem', marginBottom:24 }}>Join NexaSphere and start building the skills your career needs.</p>
              <div style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
                <button className="btn btn-primary">Explore Roadmaps →</button>
                <button className="btn btn-outline">View Activities</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
