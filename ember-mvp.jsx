import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// EMBER MVP — Encrypted Mesh Based Emergency Response
// Community Resilience OS · Tier 1 Application
// License: AGPL v3 · github.com/ember-resilience
// ═══════════════════════════════════════════════════════════════════════════════

const MODE = { PEACE: "peace", CRISIS: "crisis", RECOVERY: "recovery" };
const STATUS = { SAFE: "safe", HELP: "help", UNKNOWN: "unknown" };
const SCREENS = { SPLASH: "splash", ONBOARD: "onboard", CREATE: "create", JOIN: "join", APP: "app" };

// ─── Flame Logo SVG ──────────────────────────────────────────────────────────

function EmberLogo({ size = 56, glow = false }) {
  return (
    <div style={{ width: size, height: size, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {glow && <div style={{ position: "absolute", width: size * 1.6, height: size * 1.6, borderRadius: "50%", background: "radial-gradient(circle, rgba(212,165,116,0.15) 0%, transparent 70%)", animation: "logoPulse 3s ease-in-out infinite" }} />}
      <svg viewBox="0 0 100 140" width={size} height={size * 1.2} style={{ filter: glow ? "drop-shadow(0 0 12px rgba(212,165,116,0.4))" : "none" }}>
        <defs>
          <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#d4a574" />
            <stop offset="40%" stopColor="#e8952e" />
            <stop offset="100%" stopColor="#f5a623" />
          </linearGradient>
        </defs>
        <path d="M50 5 C50 5, 85 45, 85 75 C85 95, 70 115, 50 115 C30 115, 15 95, 15 75 C15 45, 50 5, 50 5 Z" fill="url(#flameGrad)" opacity="0.9" />
        <path d="M50 35 C50 35, 70 55, 70 72 C70 85, 62 95, 50 95 C38 95, 30 85, 30 72 C30 55, 50 35, 50 35 Z" fill="#0a0a0a" opacity="0.3" />
        <path d="M50 50 C50 50, 63 62, 63 72 C63 82, 57 90, 50 90 C43 90, 37 82, 37 72 C37 62, 50 50, 50 50 Z" fill="url(#flameGrad)" opacity="0.7" />
      </svg>
    </div>
  );
}

// ─── Seed Data ────────────────────────────────────────────────────────────────

const INIT_MEMBERS = [
  { id:1, name:"You", role:"Block Captain", skills:["Security+","Mesh Networks","First Aid"], resources:["Mesh Node","Solar Charger","Water Filter"], status:STATUS.SAFE, checkIn:Date.now(), avatar:"N", bio:"Founder & lead coordinator" },
  { id:2, name:"Marcus Chen", role:"Medical Lead", skills:["RN","Trauma Care","CPR Instructor"], resources:["First Aid Kit","Medications","O2 Monitor"], status:STATUS.SAFE, checkIn:Date.now()-180000, avatar:"M", bio:"ER nurse, 8 years experience" },
  { id:3, name:"Sofia Ramirez", role:"Water Team", skills:["Purification","Gardening","Spanish","Foraging"], resources:["Rain Barrels","Purif. Tabs","Seeds"], status:STATUS.SAFE, checkIn:Date.now()-600000, avatar:"S", bio:"Urban farmer and water specialist" },
  { id:4, name:"James Okafor", role:"Comms Lead", skills:["HAM Radio","Electrical","LoRa Mesh"], resources:["HAM Radio","Generator","5gal Fuel"], status:STATUS.HELP, checkIn:Date.now()-3600000, avatar:"J", bio:"Licensed HAM operator KD0EMB" },
  { id:5, name:"Aisha Patel", role:"Education Lead", skills:["Teaching","Child Care","Psychology"], resources:["Books","Games","Candles"], status:STATUS.SAFE, checkIn:Date.now()-300000, avatar:"A", bio:"Elementary teacher, trauma informed care" },
  { id:6, name:"Tom Bradley", role:"Security Watch", skills:["CERT Certified","Carpentry","Navigation"], resources:["Tools","Lumber","Walkie Talkies"], status:STATUS.UNKNOWN, checkIn:Date.now()-7200000, avatar:"T", bio:"Retired firefighter, CERT trainer" },
  { id:7, name:"Elena Voss", role:"Supplies Coord", skills:["Logistics","Cooking","Preservation"], resources:["Camp Stove","Canned Goods","Cooler"], status:STATUS.SAFE, checkIn:Date.now()-420000, avatar:"E", bio:"Restaurant manager, food safety cert" },
  { id:8, name:"David Kim", role:"Tech Support", skills:["IT Systems","Solar Install","Networking"], resources:["Solar Panel","Batteries","Cable Kit"], status:STATUS.SAFE, checkIn:Date.now()-900000, avatar:"D", bio:"IT engineer, off grid solar installer" },
];

const INIT_RESOURCES = [
  { id:1, cat:"Water", name:"Treated Water", qty:85, unit:"gal", crit:50, max:200, icon:"💧" },
  { id:2, cat:"Water", name:"Purification Tabs", qty:120, unit:"tabs", crit:30, max:200, icon:"💊" },
  { id:3, cat:"Food", name:"Canned Goods", qty:64, unit:"cans", crit:20, max:150, icon:"🥫" },
  { id:4, cat:"Food", name:"Rice & Grains", qty:30, unit:"lbs", crit:10, max:100, icon:"🌾" },
  { id:5, cat:"Food", name:"Protein Bars", qty:48, unit:"bars", crit:12, max:100, icon:"🍫" },
  { id:6, cat:"Medical", name:"First Aid Kits", qty:4, unit:"kits", crit:2, max:10, icon:"🏥" },
  { id:7, cat:"Medical", name:"Rx Meds Supply", qty:12, unit:"days", crit:3, max:30, icon:"💊" },
  { id:8, cat:"Power", name:"Generator Fuel", qty:8, unit:"gal", crit:3, max:25, icon:"⛽" },
  { id:9, cat:"Power", name:"AA Batteries", qty:36, unit:"pcs", crit:12, max:100, icon:"🔋" },
  { id:10, cat:"Power", name:"Solar Capacity", qty:400, unit:"Wh", crit:100, max:1000, icon:"☀️" },
  { id:11, cat:"Comms", name:"Mesh Nodes Up", qty:7, unit:"nodes", crit:3, max:12, icon:"📡" },
  { id:12, cat:"Comms", name:"Walkie Talkies", qty:5, unit:"units", crit:2, max:10, icon:"📻" },
];

const DRILLS = [
  { id:1, name:"Comms Blackout", desc:"Run mesh network with all phones off for 2 hours. Test message relay across 3 nodes.", diff:"Med", time:"2h", done:true, score:88, icon:"📡", xp:150 },
  { id:2, name:"Water Station", desc:"Deploy purification station and serve 20 people clean water within 45 minutes.", diff:"Hard", time:"3h", done:true, score:72, icon:"💧", xp:250 },
  { id:3, name:"Night Watch", desc:"8 hour watch rotation with 4 shifts. Test silent alerts and handoff protocol.", diff:"Med", time:"8h", done:false, score:null, icon:"🔦", xp:200 },
  { id:4, name:"Medical Triage", desc:"Simulate 5 casualties with varying severity. Practice START triage system.", diff:"Hard", time:"2h", done:false, score:null, icon:"🏥", xp:300 },
  { id:5, name:"Supply Audit", desc:"Full inventory count, gap analysis report, and resupply plan in 30 minutes.", diff:"Easy", time:"30m", done:true, score:95, icon:"📋", xp:100 },
  { id:6, name:"Evacuation Run", desc:"All members reach rally point within 15 min. Test accountability system.", diff:"Med", time:"30m", done:false, score:null, icon:"🏃", xp:175 },
  { id:7, name:"Power Outage", desc:"Run community on battery and solar for 24 hours. Track consumption rates.", diff:"Hard", time:"24h", done:false, score:null, icon:"🔌", xp:350 },
];

const ACHIEVEMENTS = [
  { id:1, name:"First Check-In", icon:"✓", earned:true, desc:"Complete your first safety check-in" },
  { id:2, name:"72hr Kit Ready", icon:"🎒", earned:true, desc:"Personal emergency kit verified" },
  { id:3, name:"Mesh Pioneer", icon:"📡", earned:true, desc:"Connect to your first mesh node" },
  { id:4, name:"Water Secure", icon:"💧", earned:false, desc:"Community water supply above 80%" },
  { id:5, name:"Drill Sergeant", icon:"⭐", earned:false, desc:"Complete all available drills" },
  { id:6, name:"Community Shield", icon:"🛡", earned:false, desc:"100% member check-in rate" },
  { id:7, name:"Grid Independent", icon:"⚡", earned:false, desc:"24hr off-grid power test passed" },
  { id:8, name:"First Responder", icon:"🚑", earned:false, desc:"Medical triage drill score 85+" },
];

const EMERGENCY_PLANS = [
  { id:1, name:"Earthquake Protocol", type:"Natural Disaster", lastUpdated:"2026-03-15", size:"12 KB", status:"current" },
  { id:2, name:"Wildfire Evacuation Routes", type:"Evacuation", lastUpdated:"2026-03-01", size:"48 KB", status:"current" },
  { id:3, name:"Power Grid Failure", type:"Infrastructure", lastUpdated:"2026-02-20", size:"8 KB", status:"current" },
  { id:4, name:"Communication Tree", type:"Comms", lastUpdated:"2026-03-20", size:"4 KB", status:"current" },
  { id:5, name:"Medical Emergency Response", type:"Medical", lastUpdated:"2026-02-10", size:"16 KB", status:"needs review" },
  { id:6, name:"Water Contamination Plan", type:"Water Safety", lastUpdated:"2026-01-15", size:"10 KB", status:"needs review" },
];

const MESH_MESSAGES = [
  { id:1, from:"James O.", text:"Node 3 battery at 45%. Swapping solar panel position.", time:"2m ago", type:"system" },
  { id:2, from:"Marcus C.", text:"Medical supplies restocked. 3 new first aid kits added.", time:"15m ago", type:"resource" },
  { id:3, from:"Sofia R.", text:"Water purification test complete. 200 gallons treated.", time:"1h ago", type:"resource" },
  { id:4, from:"System", text:"Node 7 online. Mesh coverage expanded to Cedar Ave.", time:"2h ago", type:"system" },
  { id:5, from:"Elena V.", text:"Community dinner tonight 6pm. Bringing camp stove.", time:"3h ago", type:"social" },
];

// ─── Animated Mesh Canvas ────────────────────────────────────────────────────

function MeshCanvas({ mode, height = 160 }) {
  const ref = useRef(null);
  const anim = useRef(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const dpr = 2;
    c.width = c.offsetWidth * dpr;
    c.height = c.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    const W = c.offsetWidth, H = c.offsetHeight;
    let t = 0;

    const nodes = Array.from({ length: 14 }, (_, i) => ({
      x: W * 0.08 + Math.random() * W * 0.84,
      y: H * 0.08 + Math.random() * H * 0.84,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
      r: i < 8 ? 4 : 2.5,
      type: i < 8 ? "member" : "relay",
      phase: Math.random() * 6.28,
    }));

    const draw = () => {
      t += 0.012;
      ctx.clearRect(0, 0, W, H);
      const isCrisis = mode === MODE.CRISIS;
      const isRecovery = mode === MODE.RECOVERY;
      const base = isCrisis ? [239, 68, 68] : isRecovery ? [34, 197, 94] : [212, 165, 116];

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 15 || n.x > W - 15) n.vx *= -1;
        if (n.y < 15 || n.y > H - 15) n.vy *= -1;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            const a = (1 - d / 110) * 0.22 * (0.6 + Math.sin(t * 2 + i) * 0.4);
            ctx.strokeStyle = `rgba(${base},${a})`;
            ctx.lineWidth = (1 - d / 110) * 1.4;
            ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
          }
        }
      }

      nodes.forEach(n => {
        const p = Math.sin(t * 2.5 + n.phase) * 0.5 + 0.5;
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
        g.addColorStop(0, `rgba(${base},${0.12 + p * 0.08})`);
        g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 4, 0, 6.28); ctx.fill();
        ctx.fillStyle = `rgba(${base},${0.7 + p * 0.3})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + p * 0.6, 0, 6.28); ctx.fill();
      });

      anim.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(anim.current);
  }, [mode]);

  const bg = mode === MODE.CRISIS
    ? "linear-gradient(135deg,#0f0505,#080808)"
    : mode === MODE.RECOVERY
    ? "linear-gradient(135deg,#050f08,#080808)"
    : "linear-gradient(135deg,#0d0b08,#080808)";

  return <canvas ref={ref} style={{ width:"100%", height:`${height}px`, borderRadius:"12px", background: bg }} />;
}

// ─── Reusable Components ─────────────────────────────────────────────────────

function Ring({ value, size = 62, color = "#d4a574", label }) {
  const r = (size - 6) / 2, c = Math.PI * 2 * r, off = c - (value / 100) * c;
  return (
    <div style={{ textAlign: "center" }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2.5" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="2.5" strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" style={{ transition:"stroke-dashoffset 0.8s ease" }} />
        <text x={size/2} y={size/2+4} textAnchor="middle" fill="white" fontSize="13" fontWeight="700" style={{ transform:"rotate(90deg)", transformOrigin:"center" }}>{value}</text>
      </svg>
      <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.35)", textTransform:"uppercase", letterSpacing:"1.2px", marginTop:"3px" }}>{label}</div>
    </div>
  );
}

function Bar({ name, qty, max, crit, accent, unit }) {
  const pct = (qty/max)*100, low = qty <= crit;
  const col = low ? "#f59e0b" : accent;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"8px", padding:"5px 0" }}>
      <span style={{ fontSize:"11px", color: low ? col : "rgba(255,255,255,0.55)", minWidth:"110px", fontWeight: low ? "600" : "400" }}>{low ? "⚠ " : ""}{name}</span>
      <div style={{ flex:1, height:"3px", background:"rgba(255,255,255,0.05)", borderRadius:"2px", overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", background: low ? `linear-gradient(90deg,#f59e0b,#ef4444)` : col, borderRadius:"2px", transition:"width 0.5s" }} />
      </div>
      <span style={{ fontSize:"9px", color:"rgba(255,255,255,0.3)", minWidth:"50px", textAlign:"right", fontFamily:"'JetBrains Mono',monospace" }}>{qty}/{max}</span>
    </div>
  );
}

function Pill({ label, active, color, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding:"5px 10px", border:`1px solid ${active ? color+"40" : "rgba(255,255,255,0.06)"}`,
      borderRadius:"6px", background: active ? color+"12" : "rgba(255,255,255,0.02)",
      color: active ? color : "rgba(255,255,255,0.35)", fontSize:"9px", fontWeight:"600",
      cursor:"pointer", letterSpacing:"0.5px", textTransform:"uppercase", transition:"all 0.2s",
    }}>{label}</button>
  );
}

function StatCard({ label, value, color, sub }) {
  return (
    <div style={{ padding:"12px", borderRadius:"10px", background:`${color}08`, border:`1px solid ${color}15`, textAlign:"center", flex:1 }}>
      <div style={{ fontSize:"22px", fontWeight:"700", color, lineHeight:1 }}>{value}</div>
      <div style={{ fontSize:"8px", color:`${color}90`, textTransform:"uppercase", letterSpacing:"1px", marginTop:"4px" }}>{label}</div>
      {sub && <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.2)", marginTop:"2px" }}>{sub}</div>}
    </div>
  );
}

function SectionHeader({ children, accent }) {
  return (
    <div style={{ fontSize:"9px", color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"2px", marginBottom:"10px", fontWeight:"600", display:"flex", alignItems:"center", gap:"6px" }}>
      <span style={{ width:"3px", height:"3px", borderRadius:"50%", background: accent || "rgba(255,255,255,0.25)" }} />
      {children}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function Ember() {
  const [screen, setScreen] = useState(SCREENS.SPLASH);
  const [mode, setMode] = useState(MODE.PEACE);
  const [tab, setTab] = useState("home");
  const [members, setMembers] = useState(INIT_MEMBERS);
  const [resources, setResources] = useState(INIT_RESOURCES);
  const [checkInPulse, setCheckInPulse] = useState(false);
  const [time, setTime] = useState(new Date());
  const [expandedMember, setExpandedMember] = useState(null);
  const [communityName, setCommunityName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [userName, setUserName] = useState("");
  const [showResourceModal, setShowResourceModal] = useState(null);
  const [resourceAction, setResourceAction] = useState("add");
  const [resourceQty, setResourceQty] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [messages, setMessages] = useState(MESH_MESSAGES);
  const [expandedPlan, setExpandedPlan] = useState(null);
  const [settingsSection, setSettingsSection] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [streak, setStreak] = useState(7);

  useEffect(() => { const i = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(i); }, []);

  const isCrisis = mode === MODE.CRISIS;
  const isRecovery = mode === MODE.RECOVERY;
  const accent = isCrisis ? "#ef4444" : isRecovery ? "#22c55e" : "#d4a574";
  const accentBg = `${accent}0d`;
  const safe = members.filter(m => m.status === STATUS.SAFE).length;
  const help = members.filter(m => m.status === STATUS.HELP).length;
  const unknown = members.filter(m => m.status === STATUS.UNKNOWN).length;
  const drillsDone = DRILLS.filter(d => d.done);
  const drillAvg = Math.round(drillsDone.reduce((a,d) => a+d.score, 0) / Math.max(drillsDone.length, 1));
  const resHealth = Math.round(resources.reduce((a,r) => a+(r.qty/r.max)*100, 0) / resources.length);
  const readiness = Math.round((safe/members.length)*40 + (drillAvg/100)*30 + (resHealth/100)*30);
  const totalXP = drillsDone.reduce((a,d) => a + d.xp, 0);
  const criticalItems = resources.filter(r => r.qty <= r.crit).length;

  const doCheckIn = useCallback((id, s) => {
    setMembers(p => p.map(m => m.id===id ? {...m, status:s, checkIn:Date.now()} : m));
    if (id === 1) { setCheckInPulse(true); setTimeout(() => setCheckInPulse(false), 1500); }
  }, []);

  const updateResource = useCallback((id, action, amount) => {
    setResources(p => p.map(r => {
      if (r.id !== id) return r;
      const newQty = action === "add" ? Math.min(r.qty + amount, r.max) : Math.max(r.qty - amount, 0);
      return { ...r, qty: newQty };
    }));
  }, []);

  const sendBroadcast = useCallback(() => {
    if (!broadcastMsg.trim()) return;
    setMessages(p => [{ id: Date.now(), from: "You", text: broadcastMsg, time: "now", type: "broadcast" }, ...p]);
    setBroadcastMsg("");
  }, [broadcastMsg]);

  const addNotification = useCallback((msg) => {
    const n = { id: Date.now(), msg, time: new Date() };
    setNotifications(p => [n, ...p.slice(0, 9)]);
  }, []);

  const peaceTabs = [
    { id:"home", label:"Home", icon:"◉" },
    { id:"community", label:"People", icon:"◎" },
    { id:"resources", label:"Supply", icon:"◫" },
    { id:"drills", label:"Drills", icon:"⬡" },
    { id:"plans", label:"Plans", icon:"◈" },
    { id:"settings", label:"Config", icon:"⚙" },
  ];

  const crisisTabs = [
    { id:"status", label:"Status", icon:"◉" },
    { id:"resources", label:"Supply", icon:"◫" },
    { id:"mesh", label:"Mesh", icon:"◎" },
    { id:"plans", label:"Plans", icon:"◈" },
  ];

  const tabs_list = isCrisis ? crisisTabs : peaceTabs;

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
    @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
    @keyframes slideUp { from{opacity:0;transform:translateY(100%)} to{opacity:1;transform:translateY(0)} }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
    @keyframes checkPulse { 0%{transform:scale(1);box-shadow:0 0 0 0 rgba(34,197,94,0.4)} 50%{transform:scale(1.05);box-shadow:0 0 0 12px rgba(34,197,94,0)} 100%{transform:scale(1);box-shadow:0 0 0 0 rgba(34,197,94,0)} }
    @keyframes logoPulse { 0%,100%{opacity:0.6;transform:scale(1)} 50%{opacity:1;transform:scale(1.05)} }
    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    @keyframes breathe { 0%,100%{opacity:0.3} 50%{opacity:0.6} }
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.06);border-radius:2px}
    input,textarea{font-family:'DM Sans',sans-serif}
    ::placeholder{color:rgba(255,255,255,0.2)}
  `;

  const base = {
    width:"100%", maxWidth:"420px", margin:"0 auto", minHeight:"100vh",
    background: isCrisis ? "linear-gradient(180deg,#0f0505 0%,#0a0a0a 20%)" : isRecovery ? "linear-gradient(180deg,#050f08 0%,#0a0a0a 20%)" : "linear-gradient(180deg,#0e0c09 0%,#0a0a0a 20%)",
    color:"white", fontFamily:"'DM Sans','Segoe UI',sans-serif", position:"relative", overflow:"hidden",
  };

  const inputStyle = {
    width:"100%", padding:"12px 14px", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"8px",
    background:"rgba(255,255,255,0.03)", color:"white", fontSize:"13px", outline:"none",
    transition:"border-color 0.2s",
  };

  // ═══ SPLASH SCREEN ═══════════════════════════════════════════════════════

  if (screen === SCREENS.SPLASH) {
    return (
      <div style={{...base, display:"flex", alignItems:"center", justifyContent:"center"}}>
        <style>{css}</style>
        <div style={{ textAlign:"center", padding:"40px 32px", animation:"fadeUp 0.8s ease", maxWidth:"340px" }}>
          <div style={{ marginBottom:"24px" }}>
            <EmberLogo size={64} glow={true} />
          </div>
          <h1 style={{ fontSize:"32px", fontWeight:"700", letterSpacing:"8px", textTransform:"uppercase", margin:"0 0 4px" }}>EMBER</h1>
          <p style={{ fontSize:"10px", color:"rgba(255,255,255,0.25)", letterSpacing:"4px", textTransform:"uppercase", margin:"0 0 8px" }}>Encrypted Mesh Based Emergency Response</p>
          <div style={{ width:"40px", height:"1px", background:"linear-gradient(90deg,transparent,rgba(212,165,116,0.3),transparent)", margin:"16px auto" }} />
          <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.4)", lineHeight:"1.8", margin:"0 0 36px" }}>
            Coordinate your community before, during, and after crisis. Offline first. Zero knowledge encryption. No infrastructure required.
          </p>
          <button onClick={() => setScreen(SCREENS.ONBOARD)} style={{
            width:"100%", padding:"14px", border:"none", borderRadius:"10px",
            background:"linear-gradient(135deg,#d4a574,#a0764a)", color:"#0a0a0a",
            fontSize:"12px", fontWeight:"700", cursor:"pointer", letterSpacing:"2px", textTransform:"uppercase",
            marginBottom:"10px", transition:"transform 0.2s", boxShadow:"0 4px 20px rgba(212,165,116,0.2)",
          }}>
            Get Started
          </button>
          <button onClick={() => { setScreen(SCREENS.APP); setMode(MODE.CRISIS); setTab("status"); }} style={{
            width:"100%", padding:"14px", border:"1px solid rgba(239,68,68,0.2)", borderRadius:"10px",
            background:"rgba(239,68,68,0.04)", color:"#ef4444",
            fontSize:"12px", fontWeight:"700", cursor:"pointer", letterSpacing:"2px", textTransform:"uppercase",
          }}>
            Simulate Crisis Mode
          </button>
          <div style={{ marginTop:"32px", display:"flex", justifyContent:"center", gap:"20px", flexWrap:"wrap" }}>
            {["AES-256 Encrypted","Zero Knowledge","Offline First","Open Source","AGPL v3"].map(t => (
              <span key={t} style={{ fontSize:"7px", color:"rgba(255,255,255,0.18)", letterSpacing:"1px", textTransform:"uppercase" }}>{t}</span>
            ))}
          </div>
          <div style={{ marginTop:"20px", fontSize:"8px", color:"rgba(255,255,255,0.12)", letterSpacing:"1px" }}>
            v1.0.0-mvp · Tier 1 Community App
          </div>
        </div>
      </div>
    );
  }

  // ═══ ONBOARDING ══════════════════════════════════════════════════════════

  if (screen === SCREENS.ONBOARD) {
    return (
      <div style={{...base, display:"flex", alignItems:"center", justifyContent:"center"}}>
        <style>{css}</style>
        <div style={{ padding:"40px 28px", animation:"fadeUp 0.6s ease", width:"100%" }}>
          <div style={{ textAlign:"center", marginBottom:"36px" }}>
            <EmberLogo size={40} />
            <h2 style={{ fontSize:"20px", fontWeight:"700", letterSpacing:"3px", textTransform:"uppercase", margin:"16px 0 6px" }}>Welcome</h2>
            <p style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)", lineHeight:"1.6" }}>
              Every community starts with one person deciding to be prepared.
            </p>
          </div>

          <div style={{ marginBottom:"16px" }}>
            <label style={{ fontSize:"9px", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1.5px", display:"block", marginBottom:"6px" }}>Your Name</label>
            <input value={userName} onChange={e => setUserName(e.target.value)} placeholder="How your community knows you" style={inputStyle} />
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:"10px", marginTop:"24px" }}>
            <button onClick={() => setScreen(SCREENS.CREATE)} style={{
              padding:"16px", border:"1px solid rgba(212,165,116,0.15)", borderRadius:"10px",
              background:"rgba(212,165,116,0.04)", cursor:"pointer", textAlign:"left",
            }}>
              <div style={{ fontSize:"13px", fontWeight:"600", color:"#d4a574", marginBottom:"4px" }}>Create a Community</div>
              <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", lineHeight:"1.5" }}>Start a new neighborhood group. You will get an encrypted invite code to share.</div>
            </button>

            <button onClick={() => setScreen(SCREENS.JOIN)} style={{
              padding:"16px", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"10px",
              background:"rgba(255,255,255,0.02)", cursor:"pointer", textAlign:"left",
            }}>
              <div style={{ fontSize:"13px", fontWeight:"600", color:"white", marginBottom:"4px" }}>Join a Community</div>
              <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", lineHeight:"1.5" }}>Enter an invite code from your community organizer.</div>
            </button>
          </div>

          <div style={{ marginTop:"28px", padding:"14px", borderRadius:"8px", background:"rgba(212,165,116,0.04)", border:"1px solid rgba(212,165,116,0.08)" }}>
            <div style={{ fontSize:"9px", color:"#d4a574", fontWeight:"600", letterSpacing:"1px", textTransform:"uppercase", marginBottom:"6px" }}>How encryption works</div>
            <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)", lineHeight:"1.6" }}>
              Your community data is encrypted on your device before it ever leaves your phone. The encryption key is derived from your community passphrase. No server, no operator, and no government can read your data. Not even us.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ═══ CREATE COMMUNITY ═══════════════════════════════════════════════════

  if (screen === SCREENS.CREATE) {
    const inviteCode = "EMBR-" + Math.random().toString(36).substring(2, 6).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    return (
      <div style={{...base, display:"flex", alignItems:"center", justifyContent:"center"}}>
        <style>{css}</style>
        <div style={{ padding:"40px 28px", animation:"fadeUp 0.6s ease", width:"100%" }}>
          <button onClick={() => setScreen(SCREENS.ONBOARD)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.3)", fontSize:"11px", cursor:"pointer", marginBottom:"20px", display:"flex", alignItems:"center", gap:"4px" }}>
            ← Back
          </button>
          <h2 style={{ fontSize:"20px", fontWeight:"700", letterSpacing:"2px", marginBottom:"6px" }}>Create Community</h2>
          <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", marginBottom:"24px" }}>All data stays on your device. Encrypted end to end.</p>

          <div style={{ marginBottom:"16px" }}>
            <label style={{ fontSize:"9px", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1.5px", display:"block", marginBottom:"6px" }}>Community Name</label>
            <input value={communityName} onChange={e => setCommunityName(e.target.value)} placeholder="e.g. Cedar Block Mutual Aid" style={inputStyle} />
          </div>

          <div style={{ marginBottom:"16px" }}>
            <label style={{ fontSize:"9px", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1.5px", display:"block", marginBottom:"6px" }}>Community Passphrase</label>
            <input type="password" placeholder="Used to derive encryption keys" style={inputStyle} />
            <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.2)", marginTop:"4px" }}>This passphrase encrypts all community data. Share it only in person. It never leaves this device.</div>
          </div>

          <div style={{ padding:"14px", borderRadius:"8px", background:"rgba(212,165,116,0.06)", border:"1px solid rgba(212,165,116,0.12)", marginBottom:"20px" }}>
            <div style={{ fontSize:"9px", color:"#d4a574", fontWeight:"600", letterSpacing:"1px", textTransform:"uppercase", marginBottom:"8px" }}>Invite Code</div>
            <div style={{ fontSize:"16px", fontFamily:"'JetBrains Mono',monospace", color:"white", letterSpacing:"2px", textAlign:"center", padding:"8px 0" }}>{inviteCode}</div>
            <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.25)", textAlign:"center" }}>Share this code with neighbors to join your community</div>
          </div>

          <button onClick={() => { setScreen(SCREENS.APP); setMode(MODE.PEACE); setTab("home"); addNotification("Community created successfully"); }} style={{
            width:"100%", padding:"14px", border:"none", borderRadius:"10px",
            background:"linear-gradient(135deg,#d4a574,#a0764a)", color:"#0a0a0a",
            fontSize:"12px", fontWeight:"700", cursor:"pointer", letterSpacing:"2px", textTransform:"uppercase",
          }}>
            Create & Enter
          </button>
        </div>
      </div>
    );
  }

  // ═══ JOIN COMMUNITY ═══════════════════════════════════════════════════════

  if (screen === SCREENS.JOIN) {
    return (
      <div style={{...base, display:"flex", alignItems:"center", justifyContent:"center"}}>
        <style>{css}</style>
        <div style={{ padding:"40px 28px", animation:"fadeUp 0.6s ease", width:"100%" }}>
          <button onClick={() => setScreen(SCREENS.ONBOARD)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.3)", fontSize:"11px", cursor:"pointer", marginBottom:"20px", display:"flex", alignItems:"center", gap:"4px" }}>
            ← Back
          </button>
          <h2 style={{ fontSize:"20px", fontWeight:"700", letterSpacing:"2px", marginBottom:"6px" }}>Join Community</h2>
          <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)", marginBottom:"24px" }}>Enter the invite code from your community organizer.</p>

          <div style={{ marginBottom:"16px" }}>
            <label style={{ fontSize:"9px", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1.5px", display:"block", marginBottom:"6px" }}>Invite Code</label>
            <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())} placeholder="EMBR-XXXX-XXXX" style={{...inputStyle, fontFamily:"'JetBrains Mono',monospace", letterSpacing:"2px", textAlign:"center", fontSize:"16px"}} />
          </div>

          <div style={{ marginBottom:"16px" }}>
            <label style={{ fontSize:"9px", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1.5px", display:"block", marginBottom:"6px" }}>Community Passphrase</label>
            <input type="password" placeholder="Get this from your community organizer" style={inputStyle} />
            <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.2)", marginTop:"4px" }}>The passphrase decrypts community data on your device.</div>
          </div>

          <div style={{ marginBottom:"16px" }}>
            <label style={{ fontSize:"9px", color:"rgba(255,255,255,0.3)", textTransform:"uppercase", letterSpacing:"1.5px", display:"block", marginBottom:"6px" }}>Your Skills (select all that apply)</label>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
              {["First Aid","CPR","Medical","HAM Radio","Electrical","Plumbing","Carpentry","Cooking","Gardening","Teaching","Security","IT/Tech","Solar","Water Purification","Navigation","Spanish","ASL"].map(s => (
                <span key={s} style={{ padding:"5px 9px", borderRadius:"5px", border:"1px solid rgba(255,255,255,0.06)", background:"rgba(255,255,255,0.02)", color:"rgba(255,255,255,0.4)", fontSize:"9px", cursor:"pointer", transition:"all 0.2s" }}>{s}</span>
              ))}
            </div>
          </div>

          <button onClick={() => { setScreen(SCREENS.APP); setMode(MODE.PEACE); setTab("home"); addNotification("Joined community successfully"); }} style={{
            width:"100%", padding:"14px", border:"none", borderRadius:"10px",
            background:"linear-gradient(135deg,#d4a574,#a0764a)", color:"#0a0a0a",
            fontSize:"12px", fontWeight:"700", cursor:"pointer", letterSpacing:"2px", textTransform:"uppercase",
          }}>
            Join Community
          </button>
        </div>
      </div>
    );
  }

  // ═══ MAIN APP ═══════════════════════════════════════════════════════════

  return (
    <div style={base}>
      <style>{css}</style>

      {/* ─── Header ─── */}
      <div style={{ padding:"12px 16px 10px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${isCrisis ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.04)"}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <div style={{ width:"26px", height:"26px", borderRadius:"7px", background: isCrisis ? "linear-gradient(135deg,#ef4444,#991b1b)" : isRecovery ? "linear-gradient(135deg,#22c55e,#15803d)" : "linear-gradient(135deg,#d4a574,#8b5e3c)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", boxShadow: isCrisis ? "0 0 12px rgba(239,68,68,0.25)" : "0 0 8px rgba(212,165,116,0.15)" }}>
            <svg viewBox="0 0 100 130" width="14" height="16">
              <defs><linearGradient id="hf" x1="0%" y1="100%" x2="0%" y2="0%"><stop offset="0%" stopColor={isCrisis ? "#fca5a5" : "#f5deb3"} /><stop offset="100%" stopColor={isCrisis ? "#fef2f2" : "#fff8ee"} /></linearGradient></defs>
              <path d="M50 5 C50 5,85 45,85 72 C85 95,70 112,50 112 C30 112,15 95,15 72 C15 45,50 5,50 5Z" fill="url(#hf)" />
            </svg>
          </div>
          <span style={{ fontSize:"13px", fontWeight:"700", letterSpacing:"4px" }}>EMBER</span>
          {isCrisis && <span style={{ fontSize:"7px", padding:"2px 6px", background:"rgba(239,68,68,0.15)", color:"#ef4444", borderRadius:"3px", fontWeight:"600", letterSpacing:"0.5px", animation:"pulse 1.5s infinite" }}>CRISIS</span>}
          {isRecovery && <span style={{ fontSize:"7px", padding:"2px 6px", background:"rgba(34,197,94,0.15)", color:"#22c55e", borderRadius:"3px", fontWeight:"600", letterSpacing:"0.5px" }}>RECOVERY</span>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <span style={{ fontSize:"9px", color:"rgba(255,255,255,0.2)", fontFamily:"'JetBrains Mono',monospace" }}>{time.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>
          <div style={{ display:"flex", gap:"1px", padding:"2px", background:"rgba(255,255,255,0.03)", borderRadius:"5px" }}>
            {[MODE.PEACE, MODE.CRISIS, MODE.RECOVERY].map(m => (
              <button key={m} onClick={() => { setMode(m); setTab(m===MODE.CRISIS?"status":"home"); }} style={{
                padding:"3px 6px", border:"none", borderRadius:"3px", cursor:"pointer", fontSize:"7px",
                fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.3px",
                background: mode===m ? `${m===MODE.CRISIS?"#ef4444":m===MODE.RECOVERY?"#22c55e":"#d4a574"}12` : "transparent",
                color: mode===m ? (m===MODE.CRISIS?"#ef4444":m===MODE.RECOVERY?"#22c55e":"#d4a574") : "rgba(255,255,255,0.2)",
                transition:"all 0.2s",
              }}>
                {m===MODE.PEACE ? "Peace" : m===MODE.CRISIS ? "Crisis" : "Recover"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Crisis Banner ─── */}
      {isCrisis && (
        <div style={{ padding:"8px 16px", background:"linear-gradient(90deg,rgba(239,68,68,0.08),rgba(239,68,68,0.01))", borderBottom:"1px solid rgba(239,68,68,0.08)", display:"flex", alignItems:"center", gap:"6px", animation:"fadeIn 0.3s" }}>
          <span style={{ fontSize:"7px", color:"#ef4444", animation:"blink 1s infinite" }}>●</span>
          <span style={{ fontSize:"10px", color:"#ef4444", fontWeight:"500" }}>Grid down · Mesh active · {safe}/{members.length} confirmed safe</span>
        </div>
      )}

      {/* ─── Check-In Bar ─── */}
      <div style={{ padding:"8px 16px", borderBottom:`1px solid ${isCrisis ? "rgba(239,68,68,0.05)" : "rgba(255,255,255,0.03)"}` }}>
        <button onClick={() => doCheckIn(1, STATUS.SAFE)} style={{
          width:"100%", padding:"10px", border:"none", borderRadius:"8px", cursor:"pointer",
          fontWeight:"600", fontSize:"11px", letterSpacing:"1.5px", textTransform:"uppercase", transition:"all 0.2s",
          background: checkInPulse ? "rgba(34,197,94,0.15)" : (isCrisis ? "rgba(34,197,94,0.06)" : `${accent}0a`),
          color: checkInPulse ? "#22c55e" : (isCrisis ? "#22c55e" : accent),
          border: `1px solid ${checkInPulse ? "rgba(34,197,94,0.3)" : (isCrisis ? "rgba(34,197,94,0.1)" : accent+"18")}`,
          animation: checkInPulse ? "checkPulse 0.6s ease" : "none",
        }}>
          {checkInPulse ? "✓ Checked In — Safe" : `Tap to Check In · ${streak} Day Streak`}
        </button>
      </div>

      {/* ─── Content ─── */}
      <div style={{ height:"calc(100vh - 180px)", overflowY:"auto", padding:"14px 16px" }}>

        {/* ═══ HOME / STATUS ═══ */}
        {(tab === "home" || tab === "status") && (
          <div style={{ animation:"fadeUp 0.3s ease" }}>
            <MeshCanvas mode={mode} />

            {/* Score Rings */}
            <div style={{ display:"flex", justifyContent:"space-around", padding:"16px 0", borderBottom:"1px solid rgba(255,255,255,0.03)" }}>
              <Ring value={readiness} label="Readiness" color={accent} />
              <Ring value={resHealth} label="Supply" color={resHealth < 40 ? "#f59e0b" : accent} />
              <Ring value={drillAvg} label="Drills" color={accent} />
              <Ring value={Math.round((safe/members.length)*100)} label="Safe" color={safe === members.length ? "#22c55e" : accent} />
            </div>

            {/* Status Cards */}
            <div style={{ display:"flex", gap:"6px", padding:"14px 0" }}>
              <StatCard label="Safe" value={safe} color={isCrisis ? "#22c55e" : accent} />
              <StatCard label="Need Help" value={help} color="#f59e0b" />
              <StatCard label="Unknown" value={unknown} color={isCrisis ? "#ef4444" : "#6b7280"} />
            </div>

            {/* XP Bar */}
            {!isCrisis && (
              <div style={{ padding:"12px", borderRadius:"8px", background:accentBg, border:`1px solid ${accent}12`, marginBottom:"14px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"6px" }}>
                  <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.4)" }}>Community XP</span>
                  <span style={{ fontSize:"11px", color:accent, fontWeight:"700", fontFamily:"'JetBrains Mono',monospace" }}>{totalXP} XP</span>
                </div>
                <div style={{ height:"4px", background:"rgba(255,255,255,0.05)", borderRadius:"3px", overflow:"hidden" }}>
                  <div style={{ width:`${Math.min((totalXP/1500)*100, 100)}%`, height:"100%", background:`linear-gradient(90deg,${accent},#8b5e3c)`, borderRadius:"3px", transition:"width 0.5s" }} />
                </div>
                <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.2)", marginTop:"4px", textAlign:"right" }}>{totalXP}/1500 to Level 3</div>
              </div>
            )}

            {/* Community Status Chips */}
            <SectionHeader accent={accent}>Community Status</SectionHeader>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"5px", marginBottom:"16px" }}>
              {members.map(m => (
                <div key={m.id} style={{ display:"flex", alignItems:"center", gap:"4px", padding:"4px 8px", borderRadius:"6px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ width:"6px", height:"6px", borderRadius:"50%", background: m.status===STATUS.SAFE ? "#22c55e" : m.status===STATUS.HELP ? "#f59e0b" : "#6b7280", animation: m.status===STATUS.HELP ? "pulse 1.5s infinite" : "none" }} />
                  <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.5)" }}>{m.name.split(" ")[0]}</span>
                </div>
              ))}
            </div>

            {/* Critical Resources */}
            {criticalItems > 0 && (
              <>
                <SectionHeader accent="#f59e0b">⚠ Critical Supplies ({criticalItems})</SectionHeader>
                <div style={{ marginBottom:"16px" }}>
                  {resources.filter(r => r.qty <= r.crit).map(r => (
                    <Bar key={r.id} name={r.name} qty={r.qty} max={r.max} crit={r.crit} accent={accent} />
                  ))}
                </div>
              </>
            )}

            {/* Achievements */}
            {!isCrisis && (
              <>
                <SectionHeader accent={accent}>Achievements · {ACHIEVEMENTS.filter(a=>a.earned).length}/{ACHIEVEMENTS.length}</SectionHeader>
                <div style={{ display:"flex", gap:"6px", marginBottom:"16px", overflowX:"auto", paddingBottom:"4px" }}>
                  {ACHIEVEMENTS.map(a => (
                    <div key={a.id} title={a.desc} style={{ minWidth:"58px", padding:"8px 4px", borderRadius:"8px", background: a.earned ? accentBg : "rgba(255,255,255,0.015)", border:`1px solid ${a.earned ? accent+"20" : "rgba(255,255,255,0.04)"}`, textAlign:"center", opacity: a.earned ? 1 : 0.35, transition:"all 0.2s", cursor:"pointer" }}>
                      <div style={{ fontSize:"16px", marginBottom:"3px" }}>{a.icon}</div>
                      <div style={{ fontSize:"7px", color: a.earned ? accent : "rgba(255,255,255,0.3)", letterSpacing:"0.3px", lineHeight:"1.3" }}>{a.name}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Recent Activity */}
            <SectionHeader accent={accent}>Recent Activity</SectionHeader>
            <div style={{ marginBottom:"12px" }}>
              {messages.slice(0, 3).map(m => (
                <div key={m.id} style={{ display:"flex", gap:"8px", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.02)" }}>
                  <div style={{ width:"6px", height:"6px", borderRadius:"50%", background: m.type==="system" ? accent : m.type==="broadcast" ? "#ef4444" : "#22c55e", marginTop:"5px", flexShrink:0 }} />
                  <div>
                    <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.5)" }}><span style={{ fontWeight:"600", color:"rgba(255,255,255,0.65)" }}>{m.from}</span> · {m.time}</div>
                    <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.35)", marginTop:"2px" }}>{m.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ COMMUNITY ═══ */}
        {tab === "community" && (
          <div style={{ animation:"fadeUp 0.3s ease" }}>
            <SectionHeader accent={accent}>{members.length} Members · {safe} Safe · {members.reduce((a,m) => a + m.skills.length, 0)} Skills</SectionHeader>

            {/* Skills overview */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:"4px", marginBottom:"14px" }}>
              {[...new Set(members.flatMap(m => m.skills))].sort().map(s => (
                <span key={s} style={{ padding:"3px 7px", borderRadius:"4px", background:accentBg, border:`1px solid ${accent}10`, fontSize:"8px", color:accent, fontWeight:"500" }}>{s}</span>
              ))}
            </div>

            {members.map((m, i) => {
              const expanded = expandedMember === m.id;
              const ago = Math.round((Date.now()-m.checkIn)/60000);
              return (
                <div key={m.id} onClick={() => setExpandedMember(expanded ? null : m.id)} style={{
                  padding:"12px", marginBottom:"6px", borderRadius:"10px", cursor:"pointer",
                  background: expanded ? accentBg : "rgba(255,255,255,0.015)",
                  border:`1px solid ${expanded ? accent+"18" : "rgba(255,255,255,0.04)"}`,
                  transition:"all 0.2s", animation:`fadeUp 0.3s ease ${i*0.03}s both`,
                }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                      <div style={{ width:"30px", height:"30px", borderRadius:"8px", background: m.status===STATUS.SAFE ? "rgba(34,197,94,0.1)" : m.status===STATUS.HELP ? "rgba(245,158,11,0.1)" : "rgba(107,114,128,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:"700", color: m.status===STATUS.SAFE ? "#22c55e" : m.status===STATUS.HELP ? "#f59e0b" : "#6b7280" }}>
                        {m.avatar}
                      </div>
                      <div>
                        <div style={{ fontSize:"12px", fontWeight:"600" }}>{m.name}</div>
                        <div style={{ fontSize:"9px", color:accent, marginTop:"1px" }}>{m.role}</div>
                      </div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                      <span style={{ fontSize:"8px", color:"rgba(255,255,255,0.2)", fontFamily:"'JetBrains Mono',monospace" }}>{ago < 60 ? `${ago}m` : `${Math.round(ago/60)}h`}</span>
                      <div style={{ display:"flex", gap:"3px" }}>
                        {[STATUS.SAFE, STATUS.HELP].map(s => (
                          <button key={s} onClick={e => { e.stopPropagation(); doCheckIn(m.id, s); }} style={{
                            padding:"3px 7px", border:"none", borderRadius:"4px", cursor:"pointer", fontSize:"7px", fontWeight:"600", textTransform:"uppercase",
                            background: m.status===s ? (s===STATUS.SAFE ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)") : "rgba(255,255,255,0.03)",
                            color: m.status===s ? (s===STATUS.SAFE ? "#22c55e" : "#f59e0b") : "rgba(255,255,255,0.2)",
                          }}>{s===STATUS.SAFE ? "Safe" : "Help"}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                  {expanded && (
                    <div style={{ marginTop:"10px", paddingTop:"10px", borderTop:"1px solid rgba(255,255,255,0.04)", animation:"fadeIn 0.2s" }}>
                      <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)", marginBottom:"8px", fontStyle:"italic" }}>{m.bio}</div>
                      <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"4px" }}>Skills</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:"3px", marginBottom:"8px" }}>
                        {m.skills.map(s => <span key={s} style={{ fontSize:"8px", padding:"2px 6px", borderRadius:"3px", background:accentBg, color:accent, fontWeight:"500" }}>{s}</span>)}
                      </div>
                      <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"4px" }}>Resources</div>
                      <div style={{ display:"flex", flexWrap:"wrap", gap:"3px" }}>
                        {m.resources.map(r => <span key={r} style={{ fontSize:"8px", padding:"2px 6px", borderRadius:"3px", background:"rgba(255,255,255,0.03)", color:"rgba(255,255,255,0.35)" }}>{r}</span>)}
                      </div>
                      <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.15)", marginTop:"8px", fontFamily:"'JetBrains Mono',monospace" }}>
                        Last check-in: {ago < 60 ? `${ago}m ago` : `${Math.round(ago/60)}h ago`} · ID: {m.id.toString(16).padStart(4, "0")}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ RESOURCES ═══ */}
        {tab === "resources" && (
          <div style={{ animation:"fadeUp 0.3s ease" }}>
            <SectionHeader accent={accent}>Community Inventory · {criticalItems} Critical</SectionHeader>

            {/* Resource Summary */}
            <div style={{ display:"flex", gap:"6px", marginBottom:"14px" }}>
              <div style={{ flex:1, padding:"10px", borderRadius:"8px", background:accentBg, textAlign:"center" }}>
                <div style={{ fontSize:"18px", fontWeight:"700", color:accent }}>{resources.length}</div>
                <div style={{ fontSize:"7px", color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"1px" }}>Items Tracked</div>
              </div>
              <div style={{ flex:1, padding:"10px", borderRadius:"8px", background: criticalItems > 0 ? "rgba(245,158,11,0.06)" : accentBg, textAlign:"center" }}>
                <div style={{ fontSize:"18px", fontWeight:"700", color: criticalItems > 0 ? "#f59e0b" : accent }}>{criticalItems}</div>
                <div style={{ fontSize:"7px", color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"1px" }}>Critical</div>
              </div>
              <div style={{ flex:1, padding:"10px", borderRadius:"8px", background:accentBg, textAlign:"center" }}>
                <div style={{ fontSize:"18px", fontWeight:"700", color:accent }}>{resHealth}%</div>
                <div style={{ fontSize:"7px", color:"rgba(255,255,255,0.25)", textTransform:"uppercase", letterSpacing:"1px" }}>Health</div>
              </div>
            </div>

            {["Water","Food","Medical","Power","Comms"].map(cat => (
              <div key={cat} style={{ marginBottom:"16px" }}>
                <div style={{ fontSize:"9px", color:accent, textTransform:"uppercase", letterSpacing:"2px", marginBottom:"6px", fontWeight:"600", display:"flex", alignItems:"center", gap:"5px" }}>
                  <span style={{ width:"3px", height:"3px", borderRadius:"1px", background:accent }} />{cat}
                </div>
                {resources.filter(r => r.cat===cat).map(r => (
                  <div key={r.id} onClick={() => setShowResourceModal(r.id)} style={{ cursor:"pointer" }}>
                    <Bar name={`${r.icon} ${r.name}`} qty={r.qty} max={r.max} crit={r.crit} accent={accent} />
                  </div>
                ))}
              </div>
            ))}

            {/* Resource Modal */}
            {showResourceModal && (() => {
              const r = resources.find(x => x.id === showResourceModal);
              if (!r) return null;
              return (
                <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, animation:"fadeIn 0.2s" }} onClick={() => setShowResourceModal(null)}>
                  <div onClick={e => e.stopPropagation()} style={{ width:"300px", padding:"20px", borderRadius:"12px", background:"#141414", border:`1px solid ${accent}20`, animation:"slideUp 0.3s ease" }}>
                    <div style={{ fontSize:"14px", fontWeight:"600", marginBottom:"4px" }}>{r.icon} {r.name}</div>
                    <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", marginBottom:"16px" }}>{r.qty} {r.unit} of {r.max} · {r.qty <= r.crit ? "⚠ Critical" : "Healthy"}</div>
                    <div style={{ display:"flex", gap:"6px", marginBottom:"12px" }}>
                      <Pill label="Add" active={resourceAction==="add"} color="#22c55e" onClick={() => setResourceAction("add")} />
                      <Pill label="Use" active={resourceAction==="use"} color="#f59e0b" onClick={() => setResourceAction("use")} />
                    </div>
                    <input type="number" value={resourceQty} onChange={e => setResourceQty(e.target.value)} placeholder="Quantity" style={{...inputStyle, marginBottom:"12px"}} />
                    <button onClick={() => { const amt = parseInt(resourceQty) || 0; if (amt > 0) { updateResource(r.id, resourceAction, amt); setResourceQty(""); setShowResourceModal(null); } }} style={{ width:"100%", padding:"10px", border:"none", borderRadius:"8px", background: resourceAction==="add" ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)", color: resourceAction==="add" ? "#22c55e" : "#f59e0b", fontSize:"11px", fontWeight:"600", cursor:"pointer", textTransform:"uppercase", letterSpacing:"1px" }}>
                      {resourceAction === "add" ? "Add to Inventory" : "Log Consumption"}
                    </button>
                  </div>
                </div>
              );
            })()}

            {/* Actions */}
            <div style={{ padding:"12px", borderRadius:"8px", background:accentBg, border:`1px solid ${accent}12` }}>
              <div style={{ fontSize:"9px", color:accent, fontWeight:"600", marginBottom:"6px", textTransform:"uppercase", letterSpacing:"1px" }}>Quick Actions</div>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
                {["Full Audit","Export CSV","Gap Report","Request Resupply"].map(a => (
                  <span key={a} style={{ padding:"6px 10px", border:`1px solid ${accent}20`, borderRadius:"6px", fontSize:"9px", color:accent, fontWeight:"500", cursor:"pointer", transition:"all 0.2s" }}>{a}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ DRILLS ═══ */}
        {tab === "drills" && (
          <div style={{ animation:"fadeUp 0.3s ease" }}>
            <div style={{ padding:"14px", borderRadius:"10px", background:accentBg, border:`1px solid ${accent}12`, marginBottom:"14px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
                <div>
                  <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.4)" }}>Preparedness Progress</div>
                  <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.2)", marginTop:"2px" }}>Complete drills to earn XP and improve readiness</div>
                </div>
                <span style={{ fontSize:"12px", color:accent, fontWeight:"700" }}>{drillsDone.length}/{DRILLS.length}</span>
              </div>
              <div style={{ height:"5px", background:"rgba(255,255,255,0.05)", borderRadius:"3px", overflow:"hidden" }}>
                <div style={{ width:`${(drillsDone.length/DRILLS.length)*100}%`, height:"100%", background:`linear-gradient(90deg,${accent},${isCrisis?"#991b1b":"#8b5e3c"})`, borderRadius:"3px", transition:"width 0.5s" }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:"6px" }}>
                <span style={{ fontSize:"8px", color:"rgba(255,255,255,0.2)" }}>Avg Score: {drillAvg}</span>
                <span style={{ fontSize:"8px", color:accent }}>{totalXP} XP earned</span>
              </div>
            </div>

            {DRILLS.map((d, i) => (
              <div key={d.id} style={{
                padding:"12px", marginBottom:"6px", borderRadius:"10px",
                background: d.done ? accentBg : "rgba(255,255,255,0.015)",
                border:`1px solid ${d.done ? accent+"12" : "rgba(255,255,255,0.04)"}`,
                animation:`fadeUp 0.3s ease ${i*0.04}s both`,
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                      <span style={{ fontSize:"14px" }}>{d.icon}</span>
                      <span style={{ fontSize:"12px", fontWeight:"600", color: d.done ? "white" : "rgba(255,255,255,0.45)" }}>{d.name}</span>
                      {d.done && <span style={{ fontSize:"7px", padding:"1px 4px", borderRadius:"2px", background:"rgba(34,197,94,0.15)", color:"#22c55e" }}>DONE</span>}
                    </div>
                    <p style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", marginTop:"4px", lineHeight:"1.5", paddingLeft:"20px" }}>{d.desc}</p>
                    <div style={{ display:"flex", gap:"6px", marginTop:"6px", paddingLeft:"20px" }}>
                      <span style={{ fontSize:"8px", padding:"2px 6px", borderRadius:"3px", background:"rgba(255,255,255,0.03)", color:"rgba(255,255,255,0.25)" }}>{d.diff}</span>
                      <span style={{ fontSize:"8px", padding:"2px 6px", borderRadius:"3px", background:"rgba(255,255,255,0.03)", color:"rgba(255,255,255,0.25)" }}>{d.time}</span>
                      <span style={{ fontSize:"8px", padding:"2px 6px", borderRadius:"3px", background:accentBg, color:accent }}>{d.xp} XP</span>
                    </div>
                  </div>
                  {d.score !== null ? (
                    <div style={{ width:"38px", height:"38px", borderRadius:"50%", border:`2px solid ${d.score>=80?"#22c55e":d.score>=60?"#f59e0b":"#ef4444"}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"11px", fontWeight:"700", color:d.score>=80?"#22c55e":d.score>=60?"#f59e0b":"#ef4444", flexShrink:0 }}>
                      {d.score}
                    </div>
                  ) : (
                    <button style={{ padding:"7px 12px", border:`1px solid ${accent}30`, borderRadius:"6px", background:"transparent", color:accent, fontSize:"9px", fontWeight:"600", cursor:"pointer", flexShrink:0, letterSpacing:"0.5px" }}>Start</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ EMERGENCY PLANS ═══ */}
        {tab === "plans" && (
          <div style={{ animation:"fadeUp 0.3s ease" }}>
            <SectionHeader accent={accent}>Emergency Plans · Stored Offline</SectionHeader>
            <p style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", lineHeight:"1.6", marginBottom:"14px" }}>
              All plans are encrypted and stored locally on your device. They are accessible without any network connection.
            </p>

            {EMERGENCY_PLANS.map((plan, i) => (
              <div key={plan.id} onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)} style={{
                padding:"12px", marginBottom:"6px", borderRadius:"10px", cursor:"pointer",
                background: expandedPlan === plan.id ? accentBg : "rgba(255,255,255,0.015)",
                border:`1px solid ${expandedPlan === plan.id ? accent+"18" : "rgba(255,255,255,0.04)"}`,
                transition:"all 0.2s", animation:`fadeUp 0.3s ease ${i*0.04}s both`,
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div>
                    <div style={{ fontSize:"12px", fontWeight:"600", marginBottom:"2px" }}>{plan.name}</div>
                    <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
                      <span style={{ fontSize:"8px", padding:"2px 6px", borderRadius:"3px", background:accentBg, color:accent }}>{plan.type}</span>
                      <span style={{ fontSize:"8px", color:"rgba(255,255,255,0.2)" }}>{plan.size}</span>
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontSize:"8px", padding:"2px 6px", borderRadius:"3px", background: plan.status === "current" ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)", color: plan.status === "current" ? "#22c55e" : "#f59e0b", fontWeight:"500" }}>
                      {plan.status === "current" ? "Current" : "Needs Review"}
                    </div>
                    <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.15)", marginTop:"3px" }}>{plan.lastUpdated}</div>
                  </div>
                </div>
                {expandedPlan === plan.id && (
                  <div style={{ marginTop:"10px", paddingTop:"10px", borderTop:"1px solid rgba(255,255,255,0.04)", animation:"fadeIn 0.2s" }}>
                    <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", lineHeight:"1.6", marginBottom:"8px" }}>
                      This plan is stored locally and encrypted with your community passphrase. Last synced with community members on {plan.lastUpdated}.
                    </div>
                    <div style={{ display:"flex", gap:"6px" }}>
                      <span style={{ padding:"5px 10px", borderRadius:"5px", border:`1px solid ${accent}20`, fontSize:"9px", color:accent, cursor:"pointer" }}>View Full Plan</span>
                      <span style={{ padding:"5px 10px", borderRadius:"5px", border:"1px solid rgba(255,255,255,0.06)", fontSize:"9px", color:"rgba(255,255,255,0.3)", cursor:"pointer" }}>Edit</span>
                      <span style={{ padding:"5px 10px", borderRadius:"5px", border:"1px solid rgba(255,255,255,0.06)", fontSize:"9px", color:"rgba(255,255,255,0.3)", cursor:"pointer" }}>Share via Mesh</span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            <button style={{ width:"100%", padding:"12px", marginTop:"8px", border:`1px dashed ${accent}25`, borderRadius:"10px", background:"transparent", color:accent, fontSize:"11px", fontWeight:"500", cursor:"pointer", letterSpacing:"0.5px" }}>
              + Create New Plan
            </button>

            {/* Analog Kit */}
            <div style={{ marginTop:"16px", padding:"14px", borderRadius:"10px", background:"rgba(255,255,255,0.015)", border:"1px solid rgba(255,255,255,0.04)" }}>
              <SectionHeader accent={accent}>Printable Analog Kit</SectionHeader>
              <p style={{ fontSize:"10px", color:"rgba(255,255,255,0.3)", lineHeight:"1.5", marginBottom:"10px" }}>
                Download and print these resources for when all electronics are unavailable.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                {["Signal Cards (Green/Yellow/Red)", "Frequency Chart (HAM/FRS/GMRS)", "Communication Tree Template", "Neighborhood Resource Map"].map(doc => (
                  <div key={doc} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px", borderRadius:"6px", background:"rgba(255,255,255,0.02)" }}>
                    <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.4)" }}>{doc}</span>
                    <span style={{ fontSize:"8px", color:accent, cursor:"pointer" }}>PDF ↓</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ MESH (Crisis) ═══ */}
        {tab === "mesh" && (
          <div style={{ animation:"fadeUp 0.3s ease" }}>
            <MeshCanvas mode={mode} height={140} />

            <SectionHeader accent={accent}>Network Status</SectionHeader>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px", marginBottom:"14px" }}>
              {[
                { l:"Active Nodes", v:"7 / 9", ok:true },
                { l:"Signal Avg", v:"-72 dBm", ok:true },
                { l:"Messages", v:"1,247", ok:true },
                { l:"Last Packet", v:"4s ago", ok:true },
                { l:"Encryption", v:"AES-256", ok:true },
                { l:"Failed Routes", v:"2 rerouted", ok:false },
              ].map((item, i) => (
                <div key={i} style={{ padding:"8px 10px", borderRadius:"6px", background:"rgba(255,255,255,0.015)", border:"1px solid rgba(255,255,255,0.03)", display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontSize:"9px", color:"rgba(255,255,255,0.35)" }}>{item.l}</span>
                  <span style={{ fontSize:"9px", fontFamily:"'JetBrains Mono',monospace", color: item.ok ? accent : "#f59e0b", fontWeight:"500" }}>{item.v}</span>
                </div>
              ))}
            </div>

            {/* Messages */}
            <SectionHeader accent={accent}>Mesh Messages</SectionHeader>
            <div style={{ marginBottom:"14px" }}>
              {messages.map(m => (
                <div key={m.id} style={{ display:"flex", gap:"8px", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.02)" }}>
                  <div style={{ width:"5px", height:"5px", borderRadius:"50%", background: m.type==="system" ? "#6b7280" : m.type==="broadcast" ? "#ef4444" : m.type==="resource" ? "#22c55e" : accent, marginTop:"5px", flexShrink:0 }} />
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <span style={{ fontSize:"10px", fontWeight:"600", color:"rgba(255,255,255,0.6)" }}>{m.from}</span>
                      <span style={{ fontSize:"8px", color:"rgba(255,255,255,0.15)", fontFamily:"'JetBrains Mono',monospace" }}>{m.time}</span>
                    </div>
                    <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.35)", marginTop:"2px", lineHeight:"1.4" }}>{m.text}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Broadcast */}
            <div style={{ padding:"12px", borderRadius:"10px", background: isCrisis ? "rgba(239,68,68,0.04)" : accentBg, border:`1px solid ${accent}12` }}>
              <div style={{ fontSize:"9px", color:accent, fontWeight:"600", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"8px" }}>Broadcast to All Nodes</div>
              <div style={{ display:"flex", gap:"6px" }}>
                <input value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} onKeyDown={e => e.key === "Enter" && sendBroadcast()} placeholder="Type message (max 237 bytes)..." style={{...inputStyle, flex:1, padding:"8px 10px", fontSize:"11px"}} />
                <button onClick={sendBroadcast} style={{ padding:"8px 14px", border:"none", borderRadius:"6px", background: broadcastMsg ? accent : "rgba(255,255,255,0.05)", color: broadcastMsg ? "#0a0a0a" : "rgba(255,255,255,0.2)", fontSize:"10px", fontWeight:"600", cursor:"pointer", transition:"all 0.2s" }}>Send</button>
              </div>
              <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.15)", marginTop:"6px" }}>Messages are AES-256 encrypted and relayed through all active mesh nodes</div>
            </div>
          </div>
        )}

        {/* ═══ SETTINGS ═══ */}
        {tab === "settings" && (
          <div style={{ animation:"fadeUp 0.3s ease" }}>
            <SectionHeader accent={accent}>Configuration</SectionHeader>

            {/* Profile */}
            <div style={{ padding:"14px", borderRadius:"10px", background:accentBg, border:`1px solid ${accent}12`, marginBottom:"10px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                <div style={{ width:"40px", height:"40px", borderRadius:"10px", background:`linear-gradient(135deg,${accent},#8b5e3c)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"16px", fontWeight:"700", color:"#0a0a0a" }}>N</div>
                <div>
                  <div style={{ fontSize:"14px", fontWeight:"600" }}>{userName || "Block Captain"}</div>
                  <div style={{ fontSize:"10px", color:accent }}>Cedar Block Mutual Aid</div>
                  <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.2)", fontFamily:"'JetBrains Mono',monospace", marginTop:"2px" }}>Member since March 2026</div>
                </div>
              </div>
            </div>

            {/* Settings Sections */}
            {[
              { id:"encryption", label:"Encryption & Security", icon:"🔐", items:["Zero-knowledge encryption: Active", "Algorithm: AES-256-GCM", "Key derivation: PBKDF2", "Last key rotation: 7 days ago", "Passphrase strength: Strong"] },
              { id:"mesh", label:"Mesh Network", icon:"📡", items:["BLE scanning: Enabled", "Auto-connect to known nodes: On", "Relay mode: Active", "Channel: EMBR-DEFAULT", "Region: US 915MHz ISM"] },
              { id:"notifications", label:"Notifications", icon:"🔔", items:["Check-in reminders: Daily 9am", "Crisis alerts: Immediate", "Resource warnings: When critical", "Drill reminders: Weekly", "Mesh messages: All"] },
              { id:"data", label:"Data & Privacy", icon:"💾", items:["Local storage: 24.3 MB used", "Last cloud sync: Encrypted, 2h ago", "Peer syncs today: 3", "Export community data", "Delete all local data"] },
              { id:"about", label:"About EMBER", icon:"🔥", items:["Version: 1.0.0-mvp", "License: AGPL v3", "Tier: Community App (Free)", "Source: github.com/ember-resilience", "Built by ILLAPEX LLC / Lirio Labs"] },
            ].map(section => (
              <div key={section.id} style={{ marginBottom:"6px" }}>
                <div onClick={() => setSettingsSection(settingsSection === section.id ? null : section.id)} style={{
                  padding:"12px", borderRadius:"10px", cursor:"pointer",
                  background: settingsSection === section.id ? accentBg : "rgba(255,255,255,0.015)",
                  border:`1px solid ${settingsSection === section.id ? accent+"18" : "rgba(255,255,255,0.04)"}`,
                  transition:"all 0.2s",
                }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                      <span style={{ fontSize:"14px" }}>{section.icon}</span>
                      <span style={{ fontSize:"12px", fontWeight:"500" }}>{section.label}</span>
                    </div>
                    <span style={{ fontSize:"10px", color:"rgba(255,255,255,0.2)", transform: settingsSection === section.id ? "rotate(90deg)" : "none", transition:"transform 0.2s" }}>›</span>
                  </div>
                  {settingsSection === section.id && (
                    <div style={{ marginTop:"10px", paddingTop:"10px", borderTop:"1px solid rgba(255,255,255,0.04)", animation:"fadeIn 0.2s" }}>
                      {section.items.map((item, i) => (
                        <div key={i} style={{ padding:"6px 0", fontSize:"10px", color:"rgba(255,255,255,0.35)", borderBottom: i < section.items.length-1 ? "1px solid rgba(255,255,255,0.02)" : "none" }}>
                          {item}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Danger Zone */}
            <div style={{ marginTop:"14px", padding:"12px", borderRadius:"10px", border:"1px solid rgba(239,68,68,0.1)", background:"rgba(239,68,68,0.02)" }}>
              <div style={{ fontSize:"9px", color:"#ef4444", fontWeight:"600", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"8px" }}>Danger Zone</div>
              <div style={{ display:"flex", gap:"6px" }}>
                <span style={{ padding:"6px 10px", borderRadius:"6px", border:"1px solid rgba(239,68,68,0.15)", fontSize:"9px", color:"#ef4444", cursor:"pointer" }}>Leave Community</span>
                <span style={{ padding:"6px 10px", borderRadius:"6px", border:"1px solid rgba(239,68,68,0.15)", fontSize:"9px", color:"#ef4444", cursor:"pointer" }}>Wipe All Data</span>
              </div>
            </div>

            {/* Footer */}
            <div style={{ textAlign:"center", padding:"20px 0", marginTop:"10px" }}>
              <EmberLogo size={24} />
              <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.12)", marginTop:"8px", letterSpacing:"1px" }}>EMBER v1.0.0-mvp · AGPL v3</div>
              <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.08)", marginTop:"2px" }}>ILLAPEX LLC · Lirio Labs</div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Tab Bar ─── */}
      <div style={{ position:"sticky", bottom:0, padding:"4px 10px 12px", background:"linear-gradient(180deg,transparent,#0a0a0a 25%)", display:"flex", justifyContent:"space-around" }}>
        {tabs_list.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            display:"flex", flexDirection:"column", alignItems:"center", gap:"2px",
            padding:"5px 8px", border:"none", background:"none", cursor:"pointer",
            color: tab===t.id ? accent : "rgba(255,255,255,0.18)", transition:"color 0.2s",
          }}>
            <span style={{ fontSize:"13px", lineHeight:1 }}>{t.icon}</span>
            <span style={{ fontSize:"7px", fontWeight:"600", textTransform:"uppercase", letterSpacing:"0.8px" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}