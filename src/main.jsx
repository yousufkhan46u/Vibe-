import React,{useState} from "react";
import {createRoot} from "react-dom/client";
import "./styles.css";

const items=[["home","◉","Home"],["inbox","✉","Inbox"],["chat","◌","Chats"],["vibe","✦","My Vibe"],["face","◈","Face VIBE"],["roast","⚡","Roast Me"],["profile","◎","Profile"],["settings","⚙","Settings"],["admin","▣","Owner Admin"]];

function App(){
 const [page,setPage]=useState("home");
 const [message,setMessage]=useState("");
 const [sent,setSent]=useState(false);
 const go=p=>{setPage(p);setSent(false)};
 return <div className="app">
  <aside><div className="logo">VI<span>BE</span></div>{items.map(([id,ic,n])=><button className={page===id?"nav active":"nav"} onClick={()=>go(id)} key={id}>{ic}<span>{n}</span></button>)}<div className="mini"><b>S</b><div><strong>Sam</strong><small>@samvibe</small></div></div></aside>
  <main>
   <header><div><small>VIBE</small><h1>{items.find(x=>x[0]===page)?.[2]}</h1><p>Your space. Your vibe.</p></div><button className="primary" onClick={()=>go("profile")}>Share my VIBE</button></header>
   {page==="home"&&<Home go={go}/>}
   {page==="inbox"&&<Inbox/>}
   {page==="chat"&&<Chat/>}
   {page==="vibe"&&<Vibe/>}
   {page==="face"&&<Face/>}
   {page==="roast"&&<Roast/>}
   {page==="profile"&&<Profile message={message} setMessage={setMessage} sent={sent} setSent={setSent}/>}
   {page==="settings"&&<Settings/>}
   {page==="admin"&&<Admin/>}
  </main>
 </div>
}
const Card=({children,className=""})=><div className={"card "+className}>{children}</div>;
function Home({go}){return <div className="grid"><Card className="hero"><span className="pill">PROFILE LIVE</span><h2>Let people discover your vibe.</h2><p>Share your anonymous link and let friends message or chat with you.</p><div className="actions"><button className="primary" onClick={()=>go("profile")}>View profile</button><button className="secondary" onClick={()=>navigator.clipboard?.writeText("vibe.example/u/samvibe")}>Copy link</button></div></Card><Card><small>Your VIBE</small><h2>The Quiet Charmer</h2><div className="tags"><i>Reserved</i><i>Loyal</i><i>Observant</i></div></Card>{[["Anonymous messages","128","+18 this week"],["Chat sessions","34","+7 this week"],["VIBE views","2.8K","+21% this month"],["Shares","416","+52 this month"]].map(x=><Card className="stat"><small>{x[0]}</small><strong>{x[1]}</strong><p>{x[2]}</p></Card>)}<Card className="wide"><h3>Latest anonymous messages</h3><Message text="You actually have a really calm energy. Never change that."/><Message text="I have wanted to tell you something for a while…"/><Message text="Your VIBE profile is honestly accurate 😂"/></Card><Card><h3>Quick actions</h3><div className="actions"><button className="secondary" onClick={()=>go("inbox")}>Inbox</button><button className="secondary" onClick={()=>go("chat")}>Chat</button><button className="secondary" onClick={()=>go("roast")}>Roast me</button></div></Card></div>}
function Message({text}){return <div className="msg"><b>?</b><div><strong>Anonymous</strong><p>{text}</p></div></div>}
function Inbox(){return <Card><h2>Anonymous messages</h2><Message text="Be honest, what's something you never tell people?"/><Message text="Your music taste is elite."/><Message text="Would you ever date someone who started as an anonymous chat?"/></Card>}
function Chat(){const [msgs,setMsgs]=useState(["Hey. Can I ask you something?","Sure, what's up?"]);const [v,setV]=useState("");return <Card className="chat"><div className="bubbles">{msgs.map((m,i)=><div className={"bubble "+(i%2?"me":"")}>{m}</div>)}</div><div className="composer"><input value={v} onChange={e=>setV(e.target.value)} placeholder="Write a message…"/><button className="primary" onClick={()=>{if(v.trim()){setMsgs([...msgs,v]);setV("")}}}>Send</button></div></Card>}
function Vibe(){return <div className="grid"><Card className="hero"><span className="pill">AI ANALYSIS</span><h2>The Quiet Charmer</h2><p>Calm, observant energy. You don't need to be the loudest person in the room to leave an impression.</p></Card><Card><small>VIBE SCORE</small><strong>87/100</strong><p>Distinctive social energy</p></Card><Card className="wide"><h3>Personality mix</h3>{[["Reserved",82],["Romantic",76],["Loyal",91],["Observant",88]].map(x=><div className="score"><span>{x[0]} <b>{x[1]}%</b></span><em><i style={{width:x[1]+"%"}}/></em></div>)}</Card><Card><h3>Aesthetic</h3><h2>Midnight Luxury</h2><p>Minimal • mysterious • refined</p></Card></div>}
function Face(){return <div className="grid"><Card className="hero"><span className="pill">AI FACE ANALYSIS</span><h2>Your Face VIBE</h2><p>Discover facial structure and find your best look.</p><div className="actions"><button className="primary">Upload Selfie</button><button className="secondary">Use Camera</button></div></Card><Card><small>OVERALL STYLE POTENTIAL</small><strong>91/100</strong><p>Based on structure & grooming compatibility.</p></Card>{[["Face Structure","88/100"],["Jawline","84/100"],["Facial Balance","91/100"],["Hair Compatibility","89/100"]].map(x=><Card className="stat"><small>{x[0]}</small><strong>{x[1]}</strong></Card>)}<Card className="wide"><h3>Recommended hairstyles</h3><div className="tags"><i>Textured Crop</i><i>Low Taper</i><i>Messy Fringe</i><i>Classic Side Part</i><i>Mid Fade</i></div><div className="actions"><button className="primary">Generate hairstyle previews</button></div></Card><Card><h3>Grooming</h3><p><b>Beard:</b> Short boxed / light stubble</p><p><b>Moustache:</b> Clean natural trim</p><p><b>Glasses:</b> Medium rectangular frames</p></Card></div>}
function Roast(){return <div className="grid"><Card className="wide"><h2>Pick your mode</h2><div className="actions">{["😂 Funny","🔥 Savage","☠ Brutal","🪞 Ego Check","❤️ Relationship","🎓 Student"].map(x=><button className="secondary">{x}</button>)}</div><div className="quote">“You don't overthink. You simply run a full committee meeting in your head before sending a two-word reply.”</div></Card><Card><span className="pill">POPULAR</span><h2>Brutal</h2><p>No sugar coating. Still within safe boundaries.</p><button className="primary">Roast me</button></Card></div>}
function Profile({message,setMessage,sent,setSent}){return <div className="profile"><Card><div className="avatar">S</div><h2>Sam</h2><p>@samvibe</p><div className="tags"><i>The Quiet Charmer</i><i>Midnight Luxury</i></div><p>Quiet by nature. Observant by choice. I keep my circle small and my VIBE real.</p></Card><Card><h3>Send Anonymous Message</h3>{sent?<div className="success">Message sent anonymously ✓</div>:<><textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Say something anonymously…"/><button className="primary" onClick={()=>message.trim()&&setSent(true)}>Send anonymously</button></>}</Card></div>}
function Settings(){return <Card><h2>Control your VIBE.</h2>{["Anonymous messages","Anonymous chat","Profile visibility"].map(x=><div className="setting"><div><strong>{x}</strong><p>Manage this preference.</p></div><span className="pill">ON</span></div>)}</Card>}
function Admin(){return <div className="grid">{[["Total users","18,492"],["Active today","4,821"],["Messages","94.7K"],["Reports","37"]].map(x=><Card className="stat"><small>{x[0]}</small><strong>{x[1]}</strong></Card>)}<Card className="wide"><h2>Growth overview</h2><div className="bars">{[35,48,43,66,58,82,100].map(h=><i style={{height:h+"%"}}/>)}</div></Card><Card><h3>System</h3><p className="ok">● API Operational</p><p className="ok">● Database Operational</p><p className="ok">● Storage Operational</p></Card></div>}

createRoot(document.getElementById("root")).render(<App/>);