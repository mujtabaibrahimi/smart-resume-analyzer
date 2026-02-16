import { useState, useRef } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.mjs", import.meta.url).href;

// ─── GROQ API CONFIG ───
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const ENV_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

const callGroq = async (sys, msg) => {
  try {
    const key = ENV_KEY || window.__GROQ_KEY__ || "";
    const r = await fetch(GROQ_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: GROQ_MODEL, messages: [{ role: "system", content: sys }, { role: "user", content: msg }], temperature: 0.7, max_completion_tokens: 2048, response_format: { type: "json_object" } }),
    });
    const d = await r.json();
    if (d.error) { console.error("Groq:", d.error); return null; }
    return d.choices?.[0]?.message?.content || "";
  } catch (e) { console.error(e); return null; }
};

// ─── Icons ───
const Ic={Upload:()=><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,Score:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,Bulb:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 18h6M10 22h4M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>,Case:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,Lin:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>,Mail:()=><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,Key:()=><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>,Check:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>,Warn:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,Arr:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,File:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,Spin:()=><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></path></svg>,Copy:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,Zap:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>};

// ─── Score Ring ───
const Ring=({score,sz=130})=>{const sw=10,r=(sz-sw)/2,c=2*Math.PI*r,o=c-(score/100)*c,col=score>=75?"#22c55e":score>=50?"#f59e0b":"#ef4444";return<div className="score-ring" style={{position:"relative",width:sz,height:sz}}><svg width={sz} height={sz} style={{transform:"rotate(-90deg)"}}><circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="#e4e7ec" strokeWidth={sw}/><circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={col} strokeWidth={sw} strokeDasharray={c} strokeDashoffset={o} strokeLinecap="round" style={{transition:"stroke-dashoffset 1.5s ease"}}/></svg><div style={{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:34,fontWeight:700,color:col,fontFamily:"'DM Mono',monospace"}}>{score}</span><span style={{fontSize:10,color:"#98a2b3",letterSpacing:2,marginTop:2}}>ATS SCORE</span></div></div>};

// ─── Styles ───
const c={bg:"#f7f8fa",acc:"#6366f1",acc2:"#818cf8"};
const s={
  app:{minHeight:"100vh",background:c.bg,fontFamily:"'Instrument Sans','DM Sans',system-ui,sans-serif",color:"#101828"},
  card:{background:"#ffffff",border:"1px solid #e4e7ec",borderRadius:14,padding:24,marginBottom:16,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"},
  btn:(v,d)=>({padding:"11px 24px",borderRadius:10,border:v==="p"?"none":"1px solid #d0d5dd",background:v==="p"?(d?"#a5b4fc":"linear-gradient(135deg,#6366f1,#4f46e5)"):"#ffffff",color:v==="p"?(d?"#e0e7ff":"#fff"):(d?"#98a2b3":"#344054"),fontSize:13.5,fontWeight:600,cursor:d?"not-allowed":"pointer",fontFamily:"inherit",display:"inline-flex",alignItems:"center",gap:8,boxShadow:v==="p"&&!d?"0 4px 16px rgba(99,102,241,0.25)":"0 1px 2px rgba(0,0,0,0.05)"}),
  inp:{width:"100%",background:"#ffffff",border:"1px solid #d0d5dd",borderRadius:10,padding:"12px 16px",color:"#101828",fontSize:13.5,fontFamily:"inherit",outline:"none",boxSizing:"border-box"},
  ta:{width:"100%",minHeight:120,background:"#ffffff",border:"1px solid #d0d5dd",borderRadius:10,padding:"14px 16px",color:"#101828",fontSize:13,fontFamily:"'DM Mono',monospace",resize:"vertical",outline:"none",lineHeight:1.6,boxSizing:"border-box"},
  tag:{display:"inline-block",padding:"4px 10px",borderRadius:6,fontSize:11,fontWeight:500,background:"rgba(99,102,241,0.08)",color:"#6366f1",margin:"3px 4px 3px 0"},
  badge:cl=>({display:"inline-flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,fontSize:11,fontWeight:600,background:`${cl}18`,color:cl}),
  pbar:{height:6,borderRadius:3,background:"#eef0f4",position:"relative",overflow:"hidden"},
  pfill:(p,cl)=>({position:"absolute",left:0,top:0,height:"100%",width:`${p}%`,borderRadius:3,background:cl,transition:"width 1s ease"}),
};

export default function SmartResumeAnalyzer(){
  const [tab,setTab]=useState("upload");
  const [resume,setResume]=useState("");
  const [fn,setFn]=useState("");
  const [jd,setJd]=useState("");
  const [ld,setLd]=useState({});
  const [res,setRes]=useState({});
  const [lq,setLq]=useState("");
  const [clj,setClj]=useState("");
  const [ak,setAk]=useState("");
  const [akOk,setAkOk]=useState(!!ENV_KEY);
  const [drag,setDrag]=useState(false);
  const [pm,setPm]=useState(false);
  const [pt,setPt]=useState("");
  const [mob,setMob]=useState(false);
  const fRef=useRef(null);
  const has=resume.length>0;

  const tabs=[{id:"upload",l:"Upload",i:Ic.Upload},{id:"ats",l:"ATS Score",i:Ic.Score},{id:"improve",l:"Improve",i:Ic.Bulb},{id:"match",l:"Job Match",i:Ic.Case},{id:"linkedin",l:"LinkedIn",i:Ic.Lin},{id:"cover",l:"Cover Letter",i:Ic.Mail}];

  const go=()=>{if(ak.trim()){window.__GROQ_KEY__=ak.trim();setAkOk(true);}};

  const upload=async e=>{const f=e.target.files[0];if(!f)return;setFn(f.name);try{if(f.name.toLowerCase().endsWith(".pdf")){const buf=await f.arrayBuffer();const pdf=await getDocument({data:buf}).promise;let text="";for(let i=1;i<=pdf.numPages;i++){const pg=await pdf.getPage(i);const tc=await pg.getTextContent();text+=tc.items.map(it=>it.str).join(" ")+"\n";}setResume(text.trim().slice(0,8000));}else{setResume(await f.text());}}catch{const r=new FileReader();r.onload=ev=>{setResume(ev.target.result.replace(/[^\x20-\x7E\n\r\t]/g," ").replace(/\s+/g," ").trim().slice(0,8000));};r.readAsText(f);}setRes(p=>({...p,uploaded:true}));};

  const run=async(k,sys,msg)=>{setLd(p=>({...p,[k]:true}));const r=await callGroq(sys,msg);let d=null;try{d=JSON.parse((r||"").replace(/```json|```/g,"").trim());}catch{}setRes(p=>({...p,[k]:d}));setLd(p=>({...p,[k]:false}));};

  // ─── API Key Screen ───
  if(!akOk)return<>
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
    <div style={{...s.app,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div className="key-page" style={{maxWidth:460,width:"100%",padding:"0 24px"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div className="logo-mark" style={{width:52,height:52,borderRadius:13,background:"linear-gradient(135deg,#6366f1,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:700,color:"#fff",margin:"0 auto 14px",boxShadow:"0 0 24px rgba(99,102,241,0.3)"}}>SR</div>
          <h1 style={{fontSize:26,fontWeight:700,letterSpacing:"-0.02em",marginBottom:6}}>Smart Resume Analyzer</h1>
          <p style={{color:"#475467",fontSize:13.5}}>Powered by <strong style={{color:"#818cf8"}}>Groq</strong> · Llama 3.3 70B · Ultra-fast AI</p>
        </div>
        <div style={s.card}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}><span style={{color:c.acc}}><Ic.Key/></span><h2 style={{fontSize:15,fontWeight:600}}>Enter your Groq API Key</h2></div>
          <p style={{fontSize:12.5,color:"#475467",lineHeight:1.6,marginBottom:14}}>Get your free key at <a href="https://console.groq.com/keys" target="_blank" rel="noopener" style={{color:"#818cf8",textDecoration:"none"}}>console.groq.com/keys</a></p>
          <input type="password" style={{...s.inp,marginBottom:12}} placeholder="gsk_xxxxxxxxxxxxxxxxxxxxxxxx" value={ak} onChange={e=>setAk(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}/>
          <button style={s.btn("p",!ak.trim())} onClick={go} disabled={!ak.trim()}><Ic.Zap/> Start Analyzing</button>
        </div>
        <div className="resp-grid" style={{marginTop:20,display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
          {[{e:"⚡",t:"Ultra-fast",d:"Groq LPU"},{e:"🆓",t:"Free tier",d:"No credit card"},{e:"🔒",t:"Secure",d:"Key stays local"}].map((f,i)=><div key={i} className="feat-card" style={{...s.card,textAlign:"center",padding:"14px 10px"}}><div style={{fontSize:18,marginBottom:4}}>{f.e}</div><p style={{fontSize:11,fontWeight:600,marginBottom:1}}>{f.t}</p><p style={{fontSize:10,color:"#667085"}}>{f.d}</p></div>)}
        </div>
      </div>
    </div>
  </>;

  // ─── Prompt helpers ───
  const noResume=<div style={s.card}><p style={{color:"#475467",textAlign:"center",padding:20}}>Please upload your resume first.</p><div style={{textAlign:"center"}}><button style={s.btn("p")} onClick={()=>setTab("upload")}>Go to Upload</button></div></div>;

  const actionBtn=(key,label,fn)=><div style={{textAlign:"center",padding:20}}><button style={s.btn("p",ld[key])} onClick={fn} disabled={ld[key]}>{ld[key]?<><Ic.Spin/> Analyzing...</>:<>{label}</>}</button></div>;

  const loading=k=><div className="loading-container" style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 20px",gap:16}}><Ic.Spin/><p style={{color:"#475467",fontSize:13}}>Analyzing with Groq...</p></div>;

  // ─── UPLOAD TAB ───
  const Upload=()=><div>
    <h2 style={{fontSize:24,fontWeight:700,letterSpacing:"-0.02em",marginBottom:6}}>Upload Your Resume</h2>
    <p style={{fontSize:14,color:"#475467",marginBottom:28,lineHeight:1.5}}>Upload a file or paste text to get started.</p>
    {!has?<>
      <div className="drop-zone" style={{border:`2px dashed ${drag?"#6366f1":"#d0d5dd"}`,borderRadius:16,padding:"48px 32px",textAlign:"center",cursor:"pointer",background:drag?"rgba(99,102,241,0.08)":"#fafbfc"}} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);upload({target:{files:[e.dataTransfer.files[0]]}});}} onClick={()=>!pm&&fRef.current?.click()}>
        <input ref={fRef} type="file" accept=".txt,.pdf,.doc,.docx,.rtf,.md" style={{display:"none"}} onChange={upload}/>
        <div className="upload-icon" style={{marginBottom:14,opacity:0.5}}><Ic.Upload/></div>
        <p style={{fontSize:15,fontWeight:600,marginBottom:4}}>Drag & drop your resume here</p>
        <p style={{fontSize:12,color:"#667085"}}>Supports .txt, .pdf, .doc, .docx, .rtf, .md</p>
      </div>
      <div style={{textAlign:"center",margin:"18px 0",color:"#98a2b3",fontSize:12,letterSpacing:2}}>OR</div>
      {!pm?<button style={s.btn("s")} onClick={()=>setPm(true)}>Paste resume text manually</button>:<div>
        <textarea style={s.ta} placeholder="Paste your resume text here..." value={pt} onChange={e=>setPt(e.target.value)} rows={10}/>
        <div style={{display:"flex",gap:10,marginTop:12}}>
          <button style={s.btn("p",!pt)} onClick={()=>{if(pt){setResume(pt);setFn("Pasted Resume");setRes(p=>({...p,uploaded:true}));}}} disabled={!pt}>Submit</button>
          <button style={s.btn("s")} onClick={()=>setPm(false)}>Cancel</button>
        </div>
      </div>}
    </>:<div style={s.card}>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
        <div style={{width:42,height:42,borderRadius:10,background:"rgba(34,197,94,0.1)",display:"flex",alignItems:"center",justifyContent:"center",color:"#22c55e"}}><Ic.File/></div>
        <div><p style={{fontWeight:600,fontSize:14}}>{fn}</p><p style={{fontSize:12,color:"#475467",marginTop:2}}>{resume.length.toLocaleString()} chars</p></div>
        <span style={s.badge("#22c55e")}><Ic.Check/> Uploaded</span>
      </div>
      <div style={{background:"#f1f3f9",borderRadius:10,padding:14,maxHeight:180,overflowY:"auto"}}><pre style={{fontSize:11,color:"#475467",fontFamily:"'DM Mono',monospace",whiteSpace:"pre-wrap",lineHeight:1.6,margin:0}}>{resume.slice(0,1200)}{resume.length>1200?"...":""}</pre></div>
      <div style={{marginTop:14,display:"flex",gap:10}}>
        <button style={s.btn("s")} onClick={()=>{setResume("");setFn("");setRes({});}}>Change Resume</button>
        <button style={s.btn("p")} onClick={()=>setTab("ats")}>Analyze ATS Score <Ic.Arr/></button>
      </div>
    </div>}
    <div className="resp-grid" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginTop:28}}>
      {[{i:Ic.Score,t:"ATS Scoring",d:"Check ATS compatibility"},{i:Ic.Bulb,t:"Smart Tips",d:"AI suggestions"},{i:Ic.Case,t:"Job Match",d:"Find matching roles"}].map((f,i)=><div key={i} className="feat-card" style={{...s.card,textAlign:"center",padding:"18px 14px"}}><div style={{marginBottom:8,color:c.acc,display:"flex",justifyContent:"center"}}><f.i/></div><p style={{fontSize:12.5,fontWeight:600,marginBottom:3}}>{f.t}</p><p style={{fontSize:11,color:"#667085"}}>{f.d}</p></div>)}
    </div>
  </div>;

  // ─── ATS TAB ───
  const ATS=()=>{const d=res.ats;return<div>
    <h2 style={{fontSize:24,fontWeight:700,marginBottom:6}}>ATS Compatibility Score</h2>
    <p style={{fontSize:14,color:"#475467",marginBottom:28}}>See how your resume performs against ATS systems.</p>
    {!has?noResume:!d&&!ld.ats?actionBtn("ats","Analyze ATS Score",()=>doATS()):ld.ats?loading("ats"):<>
      <div className="ats-hero" style={{...s.card,display:"flex",alignItems:"center",gap:32}}><Ring score={d.score}/><div style={{flex:1}}><p style={{fontSize:17,fontWeight:700,marginBottom:6}}>{d.score>=75?"Great ATS Compatibility!":d.score>=50?"Needs Improvement":"Low ATS Score"}</p><p style={{fontSize:13,color:"#475467",lineHeight:1.6}}>{d.score>=75?"Well-optimized. Focus on minor improvements below.":d.score>=50?"Some issues found. Address items below.":"Significant improvements needed."}</p></div></div>
      <div style={s.card}><h3 style={{fontSize:15,fontWeight:600,marginBottom:16}}>Category Breakdown</h3>{d.breakdown?.map((cat,i)=>{const cl=cat.score>=75?"#22c55e":cat.score>=50?"#f59e0b":"#ef4444";return<div key={i} style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:13,fontWeight:500}}>{cat.category}</span><span style={{fontSize:13,fontWeight:700,color:cl,fontFamily:"'DM Mono',monospace"}}>{cat.score}%</span></div><div style={s.pbar}><div style={s.pfill(cat.score,cl)}/></div><p style={{fontSize:12,color:"#475467",marginTop:5,lineHeight:1.5}}>{cat.feedback}</p></div>})}</div>
      <div className="resp-grid-2" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <div style={s.card}><h3 style={{fontSize:13,fontWeight:600,marginBottom:10,color:"#22c55e"}}>✓ Keywords Found</h3><div style={{display:"flex",flexWrap:"wrap"}}>{d.keywords_found?.map((k,i)=><span key={i} style={{...s.tag,background:"rgba(34,197,94,0.1)",color:"#16a34a"}}>{k}</span>)}</div></div>
        <div style={s.card}><h3 style={{fontSize:13,fontWeight:600,marginBottom:10,color:"#f59e0b"}}>⚠ Missing Keywords</h3><div style={{display:"flex",flexWrap:"wrap"}}>{d.keywords_missing?.map((k,i)=><span key={i} style={{...s.tag,background:"rgba(245,158,11,0.1)",color:"#d97706"}}>{k}</span>)}</div></div>
      </div>
      {d.format_issues?.length>0&&<div style={s.card}><h3 style={{fontSize:13,fontWeight:600,marginBottom:10}}>Format Issues</h3>{d.format_issues.map((x,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:8}}><span style={{color:"#ef4444",flexShrink:0}}><Ic.Warn/></span><span style={{fontSize:12.5,color:"#475467",lineHeight:1.5}}>{x}</span></div>)}</div>}
      <button style={s.btn("s")} onClick={doATS}>Re-analyze</button>
    </>}
  </div>};

  const doATS=()=>run("ats",`You are an ATS expert. Return ONLY JSON: {"score":<0-100>,"breakdown":[{"category":"<str>","score":<0-100>,"feedback":"<str>"}],"keywords_found":["<str>"],"keywords_missing":["<str>"],"format_issues":["<str>"]} Categories: Contact Information, Work Experience, Skills, Education, Keywords Optimization, Formatting.`,`Analyze for ATS:\n\n${resume}`);

  // ─── IMPROVE TAB ───
  const Improve=()=>{const d=res.improve;return<div>
    <h2 style={{fontSize:24,fontWeight:700,marginBottom:6}}>Improvement Suggestions</h2>
    <p style={{fontSize:14,color:"#475467",marginBottom:28}}>AI-powered recommendations to stand out.</p>
    {!has?noResume:!d&&!ld.improve?actionBtn("improve","Get Suggestions",doImprove):ld.improve?loading("improve"):<>
      <div style={{...s.card,borderLeft:"3px solid #6366f1"}}><p style={{fontSize:14,lineHeight:1.7,color:"#344054"}}>{d.summary}</p></div>
      {d.critical?.length>0&&<div style={s.card}><h3 style={{fontSize:14,fontWeight:600,marginBottom:14,color:"#ef4444"}}>🔴 Critical</h3>{d.critical.map((x,i)=><div key={i} style={{marginBottom:16,paddingBottom:16,borderBottom:i<d.critical.length-1?"1px solid #eaecf0":"none"}}><p style={{fontWeight:600,fontSize:13,marginBottom:4}}>{x.title}</p><p style={{fontSize:12,color:"#475467",lineHeight:1.6,marginBottom:6}}>{x.description}</p>{x.example&&<div style={{background:"rgba(99,102,241,0.08)",borderRadius:8,padding:"8px 12px",fontSize:11.5,color:"#818cf8",fontFamily:"'DM Mono',monospace",lineHeight:1.5}}>💡 {x.example}</div>}</div>)}</div>}
      {d.recommended?.length>0&&<div style={s.card}><h3 style={{fontSize:14,fontWeight:600,marginBottom:14,color:"#f59e0b"}}>🟡 Recommended</h3>{d.recommended.map((x,i)=><div key={i} style={{marginBottom:16,paddingBottom:16,borderBottom:i<d.recommended.length-1?"1px solid #eaecf0":"none"}}><p style={{fontWeight:600,fontSize:13,marginBottom:4}}>{x.title}</p><p style={{fontSize:12,color:"#475467",lineHeight:1.6,marginBottom:6}}>{x.description}</p>{x.example&&<div style={{background:"rgba(245,158,11,0.08)",borderRadius:8,padding:"8px 12px",fontSize:11.5,color:"#d97706",fontFamily:"'DM Mono',monospace",lineHeight:1.5}}>💡 {x.example}</div>}</div>)}</div>}
      {d.quick_wins?.length>0&&<div style={s.card}><h3 style={{fontSize:14,fontWeight:600,marginBottom:14,color:"#22c55e"}}>⚡ Quick Wins</h3>{d.quick_wins.map((x,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:10}}><span style={{color:"#22c55e",flexShrink:0,marginTop:2}}><Ic.Check/></span><div><p style={{fontWeight:600,fontSize:12.5,marginBottom:2}}>{x.title}</p><p style={{fontSize:11.5,color:"#475467",lineHeight:1.5}}>{x.description}</p></div></div>)}</div>}
      {d.power_words?.length>0&&<div style={s.card}><h3 style={{fontSize:13,fontWeight:600,marginBottom:10}}>💎 Power Words</h3><div style={{display:"flex",flexWrap:"wrap"}}>{d.power_words.map((w,i)=><span key={i} style={s.tag}>{w}</span>)}</div></div>}
      <button style={s.btn("s")} onClick={doImprove}>Re-analyze</button>
    </>}
  </div>};

  const doImprove=()=>run("improve",`You are a career coach. Return ONLY JSON: {"summary":"<str>","critical":[{"title":"<str>","description":"<str>","example":"<str>"}],"recommended":[{"title":"<str>","description":"<str>","example":"<str>"}],"quick_wins":[{"title":"<str>","description":"<str>"}],"power_words":["<str>"]}`,`Improve this resume:\n\n${resume}`);

  // ─── MATCH TAB ───
  const Match=()=>{const d=res.match;return<div>
    <h2 style={{fontSize:24,fontWeight:700,marginBottom:6}}>Job Matching</h2>
    <p style={{fontSize:14,color:"#475467",marginBottom:28}}>Discover roles matching your profile.</p>
    {!has?noResume:<>
      <div style={{...s.card,marginBottom:20}}><label style={{fontSize:13,fontWeight:500,marginBottom:8,display:"block",color:"#475467"}}>Target Job Description (optional)</label><textarea style={{...s.ta,minHeight:80}} placeholder="Paste a job description..." value={jd} onChange={e=>setJd(e.target.value)}/><div style={{marginTop:12}}><button style={s.btn("p",ld.match)} onClick={doMatch} disabled={ld.match}>{ld.match?<><Ic.Spin/> Matching...</>:<>Find Jobs</>}</button></div></div>
      {ld.match&&loading("match")}
      {d&&!ld.match&&<>
        <div style={{...s.card,borderLeft:"3px solid #6366f1"}}><p style={{fontSize:14,lineHeight:1.7,color:"#344054"}}>{d.fit_summary}</p></div>
        {d.top_matches?.map((j,i)=>{const cl=j.match_percent>=80?"#22c55e":j.match_percent>=60?"#f59e0b":"#6366f1";return<div key={i} style={s.card}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><div><p style={{fontSize:15,fontWeight:700,marginBottom:3}}>{j.title}</p><div style={{display:"flex",gap:10,fontSize:12,color:"#475467"}}>{j.salary_range&&<span>{j.salary_range}</span>}{j.demand_level&&<span style={s.badge(j.demand_level==="high"?"#22c55e":j.demand_level==="medium"?"#f59e0b":"#6366f1")}>{j.demand_level} demand</span>}</div></div><div style={{textAlign:"center"}}><span style={{fontSize:22,fontWeight:700,color:cl,fontFamily:"'DM Mono',monospace"}}>{j.match_percent}%</span><p style={{fontSize:9,color:"#667085",letterSpacing:1}}>MATCH</p></div></div>
          <p style={{fontSize:12.5,color:"#475467",lineHeight:1.6,marginBottom:12}}>{j.reason}</p>
          <div style={{display:"flex",gap:16}}><div><p style={{fontSize:10,color:"#667085",marginBottom:5,fontWeight:600,letterSpacing:1}}>ALIGNED</p><div style={{display:"flex",flexWrap:"wrap"}}>{j.skills_aligned?.map((x,k)=><span key={k} style={{...s.tag,background:"rgba(34,197,94,0.1)",color:"#16a34a"}}>{x}</span>)}</div></div><div><p style={{fontSize:10,color:"#667085",marginBottom:5,fontWeight:600,letterSpacing:1}}>GAP</p><div style={{display:"flex",flexWrap:"wrap"}}>{j.skills_gap?.map((x,k)=><span key={k} style={{...s.tag,background:"rgba(239,68,68,0.1)",color:"#dc2626"}}>{x}</span>)}</div></div></div>
        </div>})}
        {d.career_paths?.map((cp,i)=><div key={i} style={s.card}><h3 style={{fontSize:13,fontWeight:600,marginBottom:3}}>{cp.path}</h3><p style={{fontSize:11,color:"#667085",marginBottom:10}}>{cp.timeline}</p><div style={{display:"flex",alignItems:"center",flexWrap:"wrap"}}>{cp.steps?.map((st,j)=><div key={j} style={{display:"flex",alignItems:"center"}}><div style={{background:"rgba(99,102,241,0.1)",borderRadius:8,padding:"6px 12px",fontSize:11.5,color:"#818cf8",fontWeight:500}}>{st}</div>{j<cp.steps.length-1&&<span style={{margin:"0 5px",color:"#d0d5dd"}}>→</span>}</div>)}</div></div>)}
      </>}
    </>}
  </div>};

  const doMatch=()=>run("match",`Career matching expert. Return ONLY JSON: {"fit_summary":"<str>","top_matches":[{"title":"<str>","match_percent":<num>,"reason":"<str>","skills_aligned":["<str>"],"skills_gap":["<str>"],"salary_range":"<str>","demand_level":"<high|medium|low>"}],"industries":["<str>"],"career_paths":[{"path":"<str>","timeline":"<str>","steps":["<str>"]}]} 5 matches, 2 paths.`,`${jd?`Job: ${jd}\n\n`:""}Match:\n\n${resume}`);

  // ─── LINKEDIN TAB ───
  const LinkedIn=()=>{const d=res.linkedin;return<div>
    <h2 style={{fontSize:24,fontWeight:700,marginBottom:6}}>LinkedIn Job Search</h2>
    <p style={{fontSize:14,color:"#475467",marginBottom:28}}>AI-powered job search based on your profile.</p>
    {!has?noResume:<>
      <div className="search-bar" style={{display:"flex",gap:10,marginBottom:22}}><input style={{...s.inp,flex:1}} placeholder="Search jobs (e.g. 'React Developer Remote')..." value={lq} onChange={e=>setLq(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLin()}/><button style={s.btn("p",ld.linkedin)} onClick={doLin} disabled={ld.linkedin}>{ld.linkedin?<Ic.Spin/>:"Search"}</button></div>
      {ld.linkedin&&loading("linkedin")}
      {d?.jobs?.map((j,i)=><div key={i} className="job-card" style={{...s.card,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(99,102,241,0.3)"} onMouseLeave={e=>e.currentTarget.style.borderColor="#e4e7ec"}>
        <div style={{display:"flex",justifyContent:"space-between"}}>
          <div style={{flex:1}}><p style={{fontSize:14,fontWeight:700,marginBottom:3,color:"#818cf8"}}>{j.title}</p><p style={{fontSize:12.5,fontWeight:500,marginBottom:2}}>{j.company}</p><div style={{display:"flex",gap:10,fontSize:11.5,color:"#475467",marginBottom:8}}><span>{j.location}</span><span>•</span><span>{j.type}</span>{j.salary&&<><span>•</span><span>{j.salary}</span></>}</div><p style={{fontSize:12,color:"#475467",lineHeight:1.5,marginBottom:8}}>{j.description_snippet}</p><div style={{display:"flex",flexWrap:"wrap",gap:3}}>{j.skills_match?.map((x,k)=><span key={k} style={s.tag}>{x}</span>)}</div></div>
          <div style={{textAlign:"center",marginLeft:16,flexShrink:0}}><div style={{width:48,height:48,borderRadius:"50%",border:`2px solid ${j.match_score>=80?"#22c55e":j.match_score>=60?"#f59e0b":"#6366f1"}`,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontSize:14,fontWeight:700,fontFamily:"'DM Mono',monospace",color:j.match_score>=80?"#22c55e":j.match_score>=60?"#f59e0b":"#6366f1"}}>{j.match_score}%</span></div><p style={{fontSize:8,color:"#667085",marginTop:3,letterSpacing:1}}>MATCH</p></div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:10,paddingTop:10,borderTop:"1px solid #eaecf0"}}><div style={{display:"flex",gap:10,fontSize:10.5,color:"#667085"}}><span>📅 {j.posted}</span><span>👥 {j.applicants}</span><span>{j.experience_level}</span></div><span style={{fontSize:10.5,color:"#6366f1",fontWeight:500}}>View →</span></div>
      </div>)}
    </>}
  </div>};

  const doLin=()=>run("linkedin",`LinkedIn job assistant. Return ONLY JSON: {"jobs":[{"title":"<str>","company":"<str>","location":"<str>","type":"<Full-time|Part-time|Contract|Remote>","posted":"<str>","applicants":<num>,"match_score":<0-100>,"description_snippet":"<max 120 chars>","skills_match":["<str>"],"salary":"<str>","experience_level":"<str>"}]} Generate 6-8 listings.`,`Query: "${lq||"jobs matching resume"}"\n\nResume:\n${resume}`);

  // ─── COVER LETTER TAB ───
  const Cover=()=>{const d=res.cover;return<div>
    <h2 style={{fontSize:24,fontWeight:700,marginBottom:6}}>Cover Letter Generator</h2>
    <p style={{fontSize:14,color:"#475467",marginBottom:28}}>Generate a tailored cover letter.</p>
    {!has?noResume:<>
      <div style={{...s.card,marginBottom:20}}><label style={{fontSize:13,fontWeight:500,marginBottom:8,display:"block",color:"#475467"}}>Target Job / Company (optional)</label><input style={s.inp} placeholder="e.g. 'Software Engineer at Google'" value={clj} onChange={e=>setClj(e.target.value)}/><div style={{marginTop:12}}><button style={s.btn("p",ld.cover)} onClick={doCover} disabled={ld.cover}>{ld.cover?<><Ic.Spin/> Generating...</>:<>Generate Cover Letter</>}</button></div></div>
      {ld.cover&&loading("cover")}
      {d&&!ld.cover&&<>
        <div style={s.card}><div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}><div style={{display:"flex",gap:8,alignItems:"center"}}><h3 style={{fontSize:14,fontWeight:600}}>Your Cover Letter</h3>{d.tone&&<span style={s.badge("#6366f1")}>{d.tone}</span>}</div><button style={{...s.btn("s"),padding:"6px 12px",fontSize:11}} onClick={()=>navigator.clipboard.writeText(d.cover_letter)}><Ic.Copy/> Copy</button></div><div style={{background:"#f8fafc",borderRadius:12,padding:"20px 24px",lineHeight:1.8,fontSize:13,color:"#344054",whiteSpace:"pre-wrap",fontFamily:"'Instrument Sans',system-ui,sans-serif"}}>{d.cover_letter}</div></div>
        {d.key_highlights?.length>0&&<div style={s.card}><h3 style={{fontSize:13,fontWeight:600,marginBottom:10}}>Key Highlights</h3>{d.key_highlights.map((h,i)=><div key={i} style={{display:"flex",gap:6,marginBottom:6}}><span style={{color:"#22c55e",flexShrink:0}}>★</span><span style={{fontSize:12.5,color:"#475467",lineHeight:1.5}}>{h}</span></div>)}</div>}
        {d.customization_tips?.length>0&&<div style={s.card}><h3 style={{fontSize:13,fontWeight:600,marginBottom:10}}>Tips</h3>{d.customization_tips.map((t,i)=><div key={i} style={{display:"flex",gap:6,marginBottom:6}}><span style={{color:"#f59e0b",flexShrink:0}}>💡</span><span style={{fontSize:12.5,color:"#475467",lineHeight:1.5}}>{t}</span></div>)}</div>}
        <button style={s.btn("s")} onClick={doCover}>Regenerate</button>
      </>}
    </>}
  </div>};

  const doCover=()=>run("cover",`Cover letter expert. Return ONLY JSON: {"cover_letter":"<full letter with \\n>","tone":"<str>","key_highlights":["<str>"],"customization_tips":["<str>"]} 3-4 paragraphs, professional, specific to resume.`,`${clj?`Job: ${clj}\n\n`:""}Resume:\n\n${resume}`);

  const content={upload:Upload,ats:ATS,improve:Improve,match:Match,linkedin:LinkedIn,cover:Cover};
  const T=content[tab];

  return<>
    <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet"/>
    <div className="noise-overlay"/>
    <div className="main-app" style={s.app}>
      <div className="ambient-glow"/>
      <div className="header-bar" style={{padding:"14px 24px",borderBottom:"1px solid #eaecf0",background:"#ffffff"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div className="logo-mark" style={{width:36,height:36,borderRadius:9,background:"linear-gradient(135deg,#6366f1,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:"#fff",boxShadow:"0 0 20px rgba(99,102,241,0.2)"}}>SR</div>
            <div><div style={{fontSize:18,fontWeight:700,letterSpacing:"-0.02em",color:"#101828"}}>Smart Resume <span style={{color:"#6366f1"}}>Analyzer</span></div><div className="header-sub" style={{fontSize:11,color:"#98a2b3",letterSpacing:"0.05em"}}>Powered by Groq · Llama 3.3 70B</div></div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            {has&&<div className="file-indicator" style={{display:"flex",alignItems:"center",gap:6,fontSize:11.5,color:"#475467"}}><span className="status-dot" style={{width:7,height:7,borderRadius:"50%",background:"#22c55e",display:"inline-block"}}/>{fn}</div>}
            <button className="key-btn" style={{...s.btn("s"),padding:"6px 12px",fontSize:10.5}} onClick={()=>{setAkOk(false);setAk("");window.__GROQ_KEY__="";}}>Change Key</button>
            <button className="menu-toggle" onClick={()=>setMob(!mob)}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
          </div>
        </div>
      </div>
      <div style={{display:"flex",minHeight:"calc(100vh - 65px)"}}>
        {mob&&<div className="menu-backdrop" onClick={()=>setMob(false)}/>}
        <div className={"sidebar"+(mob?" open":"")} style={{width:220,borderRight:"1px solid #eaecf0",padding:"18px 10px",display:"flex",flexDirection:"column",gap:3,background:"#ffffff"}}>
          <p style={{fontSize:9,letterSpacing:2,color:"#98a2b3",padding:"6px 12px",fontWeight:600}}>ANALYZE</p>
          {tabs.slice(0,4).map(t=><button key={t.id} className="nav-item" style={{display:"flex",alignItems:"center",gap:9,padding:"10px 12px",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:tab===t.id?600:400,color:tab===t.id?"#4f46e5":"#475467",background:tab===t.id?"rgba(99,102,241,0.08)":"transparent",textAlign:"left",width:"100%",fontFamily:"inherit",position:"relative"}} onClick={()=>{setTab(t.id);setMob(false);}}>{tab===t.id&&<div style={{position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",width:3,height:18,borderRadius:2,background:"#6366f1"}}/>}<t.i/> {t.l}</button>)}
          <p style={{fontSize:9,letterSpacing:2,color:"#98a2b3",padding:"14px 12px 6px",fontWeight:600}}>ADD-ONS</p>
          {tabs.slice(4).map(t=><button key={t.id} className="nav-item" style={{display:"flex",alignItems:"center",gap:9,padding:"10px 12px",borderRadius:9,border:"none",cursor:"pointer",fontSize:13,fontWeight:tab===t.id?600:400,color:tab===t.id?"#4f46e5":"#475467",background:tab===t.id?"rgba(99,102,241,0.08)":"transparent",textAlign:"left",width:"100%",fontFamily:"inherit",position:"relative"}} onClick={()=>{setTab(t.id);setMob(false);}}>{tab===t.id&&<div style={{position:"absolute",left:0,top:"50%",transform:"translateY(-50%)",width:3,height:18,borderRadius:2,background:"#6366f1"}}/>}<t.i/> {t.l}</button>)}
        </div>
        <div className="tab-content" key={tab} style={{flex:1,padding:"26px 34px",maxWidth:880,overflowY:"auto"}}><T/></div>
      </div>
    </div>
  </>;
}
