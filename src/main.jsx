import React,{useEffect,useRef,useState} from "react";
import {createRoot} from "react-dom/client";
import {FaceLandmarker,FilesetResolver} from "@mediapipe/tasks-vision";
import { supabase } from "./supabase";
import "./styles.css";

const items=[
 ["home","◉","Home"],["inbox","✉","Inbox"],["chat","◌","Chats"],
 ["vibe","✦","My Vibe"],["face","◈","Face VIBE"],["roast","⚡","Roast Me"],
 ["profile","◎","Profile"],["settings","⚙","Settings"],["admin","▣","Owner Admin"]
];

function Auth(){
 const [mode,setMode]=useState("login");
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");

 const submit=async e=>{
  e.preventDefault();
  setLoading(true);
  setError("");
  setSuccess("");

  try{
   if(!email.trim() || !password){
    throw new Error("Please enter your email and password.");
   }

   if(password.length<6){
    throw new Error("Password must be at least 6 characters.");
   }

   if(mode==="signup"){
    const {data,error}=await supabase.auth.signUp({
     email:email.trim(),
     password
    });

    if(error) throw error;

    if(!data.session){
     setSuccess("Account created. Check your email to confirm your account, then log in.");
    }else{
     setSuccess("Account created successfully.");
    }
   }else{
    const {error}=await supabase.auth.signInWithPassword({
     email:email.trim(),
     password
    });

    if(error) throw error;
   }
  }catch(e){
   setError(e.message||"Authentication failed.");
  }finally{
   setLoading(false);
  }
 };

 return <div className="auth-screen">
  <div className="auth-card card">
   <div className="logo auth-logo">VI<span>BE</span></div>
   <h1>{mode==="login"?"Welcome back":"Create your VIBE"}</h1>
   <p>{mode==="login"
    ?"Log in to continue to your VIBE."
    :"Create your account to get started."
   }</p>

   <form onSubmit={submit}>
    <input
     type="email"
     value={email}
     onChange={e=>setEmail(e.target.value)}
     placeholder="Email address"
     autoComplete="email"
     required
    />

    <input
     type="password"
     value={password}
     onChange={e=>setPassword(e.target.value)}
     placeholder="Password"
     autoComplete={mode==="login"?"current-password":"new-password"}
     required
    />

    {error&&<div className="warning">{error}</div>}
    {success&&<div className="success">{success}</div>}

    <button className="primary auth-submit" disabled={loading}>
     {loading
      ?"Please wait…"
      :(mode==="login"?"Log in":"Create account")
     }
    </button>
   </form>

   <button
    className="secondary auth-switch"
    onClick={()=>{
     setMode(mode==="login"?"signup":"login");
     setError("");
     setSuccess("");
    }}
   >
    {mode==="login"
     ?"Create a new account"
     :"Already have an account? Log in"
    }
   </button>
  </div>
 </div>
}

function App(){
 const [session,setSession]=useState(undefined);

 useEffect(()=>{
  supabase.auth.getSession().then(({data})=>{
   setSession(data.session);
  });

  const {data:{subscription}}=supabase.auth.onAuthStateChange(
   (_event,newSession)=>{
    setSession(newSession);
   }
  );

  return ()=>subscription.unsubscribe();
 },[]);

 if(session===undefined){
  return <div className="auth-screen"><div className="card auth-card"><h2>Loading VIBE…</h2></div></div>;
 }

 if(!session){
  return <Auth/>;
 }

 return <VibeApp session={session}/>;
}
function VibeApp({session}){
 const [page,setPage]=useState("home");
 const [profile,setProfile]=useState(null);
 const [profileLoading,setProfileLoading]=useState(true);

 const go=p=>setPage(p);

 useEffect(()=>{
  const loadProfile=async()=>{
   const {data,error}=await supabase
    .from("profiles")
    .select("id,username,display_name,bio,avatar_url,created_at")
    .eq("id",session.user.id)
    .maybeSingle();

   if(error) console.error("Profile load error:",error);

   setProfile(data||null);
   setProfileLoading(false);
  };

  loadProfile();
 },[session.user.id]);

 const logout=async()=>{
  await supabase.auth.signOut();
 };

 const userEmail=session?.user?.email||"";

 if(profileLoading){
  return <div className="auth-screen">
   <div className="card auth-card">
    <h2>Loading your VIBE…</h2>
    <p>Getting your profile ready.</p>
   </div>
  </div>;
 }

 return <div className="app">
  <aside>
   <div className="logo">VI<span>BE</span></div>

   {items.map(([id,ic,n])=>
    <button
     className={page===id?"nav active":"nav"}
     onClick={()=>go(id)}
     key={id}
    >
     {ic}<span>{n}</span>
    </button>
   )}

   <div className="mini">
    <b>
     {(profile?.display_name?.[0]||userEmail[0]||"U").toUpperCase()}
    </b>

    <div>
     <strong>
      {profile?.display_name||userEmail.split("@")[0]||"User"}
     </strong>

     <small>
      {profile?.username
       ? "@"+profile.username
       : userEmail}
     </small>
    </div>
   </div>

   <button className="nav" onClick={logout}>
    ⇥<span>Log out</span>
   </button>
  </aside>

  <main>
   <header>
    <div>
     <small>VIBE</small>
     <h1>{items.find(x=>x[0]===page)?.[2]}</h1>
     <p>Your space. Your vibe.</p>
    </div>

    <button
     className="primary"
     onClick={()=>go("profile")}
    >
     Share my VIBE
    </button>
   </header>

   {page==="home"&&<Home go={go}/>}
   {page==="inbox"&&<Inbox/>}
   {page==="chat"&&<Chat/>}
   {page==="vibe"&&<Vibe/>}
   {page==="face"&&<Face/>}
   {page==="roast"&&<Roast/>}

   {page==="profile"&&
    <Profile
     user={session.user}
     profile={profile}
     setProfile={setProfile}
    />
   }

   {page==="settings"&&<Settings/>}
   {page==="admin"&&<Admin/>}
  </main>
 </div>
}
const Card=({children,className=""})=>
 <div className={"card "+className}>{children}</div>;

function Home({go}){
 return <div className="grid">
  <Card className="hero">
   <span className="pill">PROFILE LIVE</span>
   <h2>Let people discover your vibe.</h2>
   <p>Share your anonymous link and let friends message or chat with you.</p>
   <div className="actions">
    <button className="primary" onClick={()=>go("profile")}>View profile</button>
    <button
     className="secondary"
     onClick={()=>navigator.clipboard?.writeText(location.origin+"/u/samvibe")}
    >
     Copy link
    </button>
   </div>
  </Card>

  <Card>
   <small>Your VIBE</small>
   <h2>The Quiet Charmer</h2>
   <div className="tags">
    <i>Reserved</i><i>Loyal</i><i>Observant</i>
   </div>
  </Card>

  <Card className="wide">
   <h3>Latest anonymous messages</h3>
   <Message text="Anonymous messages are stored locally in this MVP until a real database is connected."/>
   <Message text="Real product data will never be presented as demo data."/>
   <Message text="Connect a database before enabling multi-user messaging."/>
  </Card>

  <Card>
   <h3>Quick actions</h3>
   <div className="actions">
    <button className="secondary" onClick={()=>go("inbox")}>Inbox</button>
    <button className="secondary" onClick={()=>go("chat")}>Chat</button>
    <button className="secondary" onClick={()=>go("roast")}>Roast me</button>
   </div>
  </Card>
 </div>
}

function Message({text}){
 return <div className="msg">
  <b>?</b>
  <div><strong>System</strong><p>{text}</p></div>
 </div>
}

function Inbox(){
 return <Card>
  <h2>Anonymous messages</h2>
  <div className="warning">
   No remote inbox is connected yet. This build intentionally does not fabricate messages.
  </div>
 </Card>
}

function Chat(){
 const [msgs,setMsgs]=useState([]);
 const [v,setV]=useState("");

 return <Card className="chat">
  <div className="warning">
   Real multi-user chat requires authentication and a database.
   Local test messages below stay in this browser only.
  </div>

  <div className="bubbles">
   {msgs.map((m,i)=>
    <div key={i} className={"bubble "+(i%2?"me":"")}>{m}</div>
   )}
  </div>

  <div className="composer">
   <input
    value={v}
    onChange={e=>setV(e.target.value)}
    placeholder="Local test message…"
   />
   <button
    className="primary"
    onClick={()=>{
     if(v.trim()){
      setMsgs([...msgs,v.trim()]);
      setV("");
     }
    }}
   >
    Send
   </button>
  </div>
 </Card>
}

function Vibe(){
 return <div className="grid">
  <Card className="hero">
   <span className="pill">PROFILE ANALYSIS</span>
   <h2>VIBE profile</h2>
   <p>
    Personality scoring is not calculated until a real questionnaire
    or validated model is connected.
   </p>
  </Card>

  <Card className="wide">
   <h3>Analysis status</h3>
   <div className="warning">
    No fabricated personality scores. Connect a real assessment pipeline
    before displaying numerical results.
   </div>
  </Card>
 </div>
}

function Face(){
 const [file,setFile]=useState(null);
 const [url,setUrl]=useState("");
 const [result,setResult]=useState(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [camera,setCamera]=useState(false);

 const inputRef=useRef(null);
 const videoRef=useRef(null);
 const streamRef=useRef(null);

 useEffect(()=>
  ()=>{
   if(url)URL.revokeObjectURL(url);
   if(streamRef.current)
    streamRef.current.getTracks().forEach(t=>t.stop());
  },
  [url]
 );

 const analyze=async f=>{
  setBusy(true);
  setError("");
  setResult(null);

  try{
   const fileset=await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
   );

   const landmarker=await FaceLandmarker.createFromOptions(
    fileset,
    {
     baseOptions:{
      modelAssetPath:
       "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      delegate:"GPU"
     },
     runningMode:"IMAGE",
     numFaces:1
    }
   );

   const img=document.createElement("img");
   img.src=URL.createObjectURL(f);
   await img.decode();

   const r=landmarker.detect(img);
   URL.revokeObjectURL(img.src);
   landmarker.close();

   if(!r.faceLandmarks?.length)
    throw new Error(
     "No face detected. Use a clear, front-facing selfie with good lighting."
    );

   const p=r.faceLandmarks[0];

   const d=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

   const eyeL=(d(p[33],p[133])+d(p[159],p[145]))/2;
   const eyeR=(d(p[362],p[263])+d(p[386],p[374]))/2;

   const faceW=d(p[234],p[454]);
   const faceH=d(p[10],p[152]);
   const jawW=d(p[172],p[397]);

   const symmetry=Math.max(
    0,
    100-Math.abs(eyeL-eyeR)/Math.max(eyeL,eyeR)*100
   );

   const ratio=faceH/Math.max(faceW,.0001);
   const jawRatio=jawW/Math.max(faceW,.0001);

   const shape=
    ratio>1.48?"Long":
    ratio>1.30?"Oval":
    ratio>1.16?"Balanced":
    "Broad";

   const jaw=jawRatio>0.72?"Broad":"Moderate";

   setResult({
    symmetry:Math.round(symmetry),
    shape,
    jaw,
    faceRatio:ratio.toFixed(2),
    landmarks:p.length
   });
  }catch(e){
   setError(e.message||"Analysis failed.");
  }finally{
   setBusy(false);
  }
 };

 const onFile=e=>{
  const f=e.target.files?.[0];
  if(!f)return;

  if(!f.type.startsWith("image/")){
   setError("Please choose an image file.");
   return;
  }

  setFile(f);
  setUrl(URL.createObjectURL(f));
  setError("");
  setResult(null);
 };

 const openCamera=async()=>{
  try{
   setError("");

   const s=await navigator.mediaDevices.getUserMedia({
    video:{facingMode:"user"}
   });

   streamRef.current=s;
   setCamera(true);

   setTimeout(()=>{
    if(videoRef.current)
     videoRef.current.srcObject=s;
   },0);
  }catch(e){
   setError("Camera access was blocked or unavailable in this browser.");
  }
 };

 const capture=async()=>{
  const v=videoRef.current;
  if(!v)return;

  const c=document.createElement("canvas");
  c.width=v.videoWidth;
  c.height=v.videoHeight;

  c.getContext("2d").drawImage(v,0,0);

  c.toBlob(
   async b=>{
    const f=new File(
     [b],
     "camera-selfie.jpg",
     {type:"image/jpeg"}
    );

    setFile(f);
    setUrl(URL.createObjectURL(f));
    setCamera(false);

    streamRef.current?.getTracks().forEach(t=>t.stop());

    await analyze(f);
   },
   "image/jpeg",
   .92
  );
 };

 return <div className="grid">
  <Card className="hero">
   <span className="pill">REAL IMAGE ANALYSIS</span>
   <h2>Your Face VIBE</h2>
   <p>
    Upload a selfie to run landmark-based facial geometry analysis
    in your browser. No fake scores.
   </p>

   <div className="actions">
    <label className="primary" style={{cursor:"pointer"}}>
     Upload Selfie
     <input
      ref={inputRef}
      type="file"
      accept="image/*"
      style={{display:"none"}}
      onChange={onFile}
     />
    </label>

    <button className="secondary" onClick={openCamera}>
     Use Camera
    </button>
   </div>

   {url&&
    <div className="preview-wrap">
     <img className="face-preview" src={url} alt="Selected selfie"/>
     <p className="preview-note">
      Image preview is local to this browser. Analysis starts only when you press Analyze.
     </p>
    </div>
   }

   {camera&&
    <div className="preview-wrap">
     <video
      ref={videoRef}
      autoPlay
      playsInline
      className="face-preview"
     />

     <div className="actions">
      <button className="primary" onClick={capture}>
       Capture & Analyze
      </button>

      <button
       className="secondary"
       onClick={()=>{
        streamRef.current?.getTracks().forEach(t=>t.stop());
        setCamera(false);
       }}
      >
       Cancel
      </button>
     </div>
    </div>
   }

   {file&&!camera&&
    <div className="actions">
     <button
      className="primary"
      disabled={busy}
      onClick={()=>analyze(file)}
     >
      {busy?"Analyzing…":"Analyze selfie"}
     </button>
    </div>
   }

   {error&&
    <div className="warning" style={{marginTop:14}}>
     {error}
    </div>
   }
  </Card>

  <Card className="wide">
   <h3>Analysis results</h3>

   {!result?
    <div className="warning">
     No result yet. Upload a clear selfie and run the analysis.
    </div>
   :
    <>
     <div className="result-grid">
      <div className="result-item">
       <small>Detected face</small>
       <strong>Yes</strong>
      </div>

      <div className="result-item">
       <small>Landmarks</small>
       <strong>{result.landmarks}</strong>
      </div>

      <div className="result-item">
       <small>Face shape estimate</small>
       <strong>{result.shape}</strong>
      </div>

      <div className="result-item">
       <small>Jaw width</small>
       <strong>{result.jaw}</strong>
      </div>

      <div className="result-item">
       <small>Left/right eye geometry</small>
       <strong>{result.symmetry}%</strong>
      </div>

      <div className="result-item">
       <small>Height/width ratio</small>
       <strong>{result.faceRatio}</strong>
      </div>
     </div>

     <p className="preview-note">
      These are measurable landmark-derived geometry results,
      not an attractiveness score or a claim about personality.
     </p>
    </>
   }
  </Card>

  <Card className="wide">
   <h3>Hairstyle recommendations</h3>
   <div className="warning">
    Recommendations will be generated only after we connect a real
    hairstyle rules/model pipeline. No invented “best” styles are shown yet.
   </div>
  </Card>

  <Card>
   <h3>AI hairstyle previews</h3>
   <div className="warning">
    Image generation/editing is not connected yet, so VIBE will not pretend previews exist.
   </div>
  </Card>
 </div>
}

function Roast(){
 const [mode,setMode]=useState("Funny");
 const [text,setText]=useState("");

 const modes=[
  "Funny","Savage","Brutal","Ego Check","Relationship","Student"
 ];

 return <div className="grid">
  <Card className="wide">
   <h2>Pick your mode</h2>

   <div className="actions">
    {modes.map(x=>
     <button
      key={x}
      className={mode===x?"primary":"secondary"}
      onClick={()=>setMode(x)}
     >
      {x}
     </button>
    )}
   </div>

   <div className="quote">
    {text||
     "Enter a real prompt to generate a roast. AI generation is not connected yet, so no fake roast is shown."
    }
   </div>

   <div className="actions">
    <button
     className="primary"
     onClick={()=>
      setText(
       `Mode selected: ${mode}. Connect an AI provider to generate the actual roast.`
      )
     }
    >
     Test mode
    </button>
   </div>
  </Card>
 </div>
}

function Profile({user,profile,setProfile}){
 const [username,setUsername]=useState(profile?.username||"");
 const [displayName,setDisplayName]=useState(profile?.display_name||"");
 const [bio,setBio]=useState(profile?.bio||"");
 const [avatarUrl,setAvatarUrl]=useState(profile?.avatar_url||"");
 const [saving,setSaving]=useState(false);
 const [uploading,setUploading]=useState(false);
 const [error,setError]=useState("");
 const [success,setSuccess]=useState("");

 useEffect(()=>{
  setUsername(profile?.username||"");
  setDisplayName(profile?.display_name||"");
  setBio(profile?.bio||"");
  setAvatarUrl(profile?.avatar_url||"");
 },[profile]);

 const uploadAvatar=async(e)=>{
  const file=e.target.files?.[0];
  if(!file) return;

  setUploading(true);
  setError("");
  setSuccess("");

  try{
   if(!file.type.startsWith("image/")){
    throw new Error("Please select an image file.");
   }

   if(file.size>5*1024*1024){
    throw new Error("Image must be smaller than 5MB.");
   }

   const ext=file.name.split(".").pop()?.toLowerCase()||"jpg";
   const path=`${user.id}/${Date.now()}.${ext}`;

   const {error:uploadError}=await supabase
    .storage
    .from("Avatar")
    .upload(path,file,{
     upsert:true,
     contentType:file.type
    });

   if(uploadError) throw uploadError;

   const {data}=supabase
    .storage
    .from("avatars")
    .getPublicUrl(path);

   setAvatarUrl(data.publicUrl);
   setSuccess("Profile photo uploaded.");
  }catch(e){
   console.error("Avatar upload error:",e);
   setError(e.message||"Could not upload profile photo.");
  }finally{
   setUploading(false);
  }
 };

 const saveProfile=async()=>{
  setSaving(true);
  setError("");
  setSuccess("");

  const cleanUsername=username.trim().toLowerCase();
  const cleanDisplayName=displayName.trim();
  const cleanBio=bio.trim();
  const cleanAvatar=avatarUrl.trim();

  if(!cleanUsername){
   setSaving(false);
   setError("Please choose a username.");
   return;
  }

  if(!cleanDisplayName){
   setSaving(false);
   setError("Please enter your display name.");
   return;
  }

  if(!/^[a-z0-9_]{3,20}$/.test(cleanUsername)){
   setSaving(false);
   setError("Username must be 3–20 characters and use only letters, numbers or underscores.");
   return;
  }

  try{
   const {data,error}=await supabase
    .from("profiles")
    .upsert({
     id:user.id,
     username:cleanUsername,
     display_name:cleanDisplayName,
     bio:cleanBio||null,
     avatar_url:cleanAvatar||null
    },{
     onConflict:"id"
    })
    .select("id,username,display_name,bio,avatar_url,created_at")
    .single();

   if(error) throw error;

   setProfile(data);
   setSuccess("Your VIBE profile has been saved.");
  }catch(e){
   console.error("Profile save error:",e);
   setError(e.message||"Could not save your profile.");
  }finally{
   setSaving(false);
  }
 };

 const initial=(displayName||username||user?.email||"U")[0].toUpperCase();

 return <div className="profile">

  <Card>
   {avatarUrl ? (
    <img
     src={avatarUrl}
     alt="Profile"
     style={{
      width:96,
      height:96,
      borderRadius:"50%",
      objectFit:"cover"
     }}
    />
   ) : (
    <div className="avatar">{initial}</div>
   )}

   <h2>{displayName||"Your Name"}</h2>
   <p>{username ? "@"+username : "@yourusername"}</p>

   {bio&&<p>{bio}</p>}

   <div className="tags">
    <i>VIBE Profile</i>
    <i>{user?.email}</i>
   </div>
  </Card>

  <Card>
   <h2>Create your VIBE</h2>
   <p>Tell people about yourself. Your information will be saved to your VIBE profile.</p>

   <input
    type="text"
    value={displayName}
    onChange={e=>setDisplayName(e.target.value)}
    placeholder="Display name"
    maxLength={50}
   />

   <input
    type="text"
    value={username}
    onChange={e=>setUsername(e.target.value.replace(/\s/g,""))}
    placeholder="Username"
    maxLength={20}
   />

   <textarea
    value={bio}
    onChange={e=>setBio(e.target.value)}
    placeholder="Tell people about yourself…"
    maxLength={500}
   />

   <div style={{marginTop:14}}>
    <label style={{display:"block",marginBottom:8}}>
     Profile photo
    </label>

    <input
     type="file"
     accept="image/*"
     onChange={uploadAvatar}
     disabled={uploading}
    />

    {uploading&&(
     <p style={{marginTop:8}}>Uploading photo…</p>
    )}
   </div>

   {error&&
    <div className="warning" style={{marginTop:12}}>
     {error}
    </div>
   }

   {success&&
    <div className="success" style={{marginTop:12}}>
     {success}
    </div>
   }

   <div className="actions" style={{marginTop:14}}>
    <button
     className="primary"
     onClick={saveProfile}
     disabled={saving||uploading}
    >
     {saving?"Saving…":"Save my VIBE"}
    </button>
   </div>
  </Card>

 </div>
}

function Settings(){
 return <Card>
  <h2>Control your VIBE.</h2>

  {["Anonymous messages","Anonymous chat","Profile visibility"].map(x=>
   <div className="setting" key={x}>
    <div>
     <strong>{x}</strong>
     <p>
      Remote settings are disabled until authentication/database is connected.
     </p>
    </div>
    <span className="pill">LOCAL</span>
   </div>
  )}
 </Card>
}

function Admin(){
 return <div className="grid">
  <Card className="wide">
   <h2>Owner Admin</h2>

   <div className="warning">
    Real analytics are intentionally blank until a real database
    and authentication layer are connected. This prevents fabricated
    user counts and activity.
   </div>
  </Card>

  <Card>
   <h3>System</h3>
   <p className="ok">● Frontend deployed</p>
   <p className="ok">● Local face analysis available</p>
   <p className="ok">● Supabase authentication connected</p>
   <p>○ AI provider not connected</p>
  </Card>
 </div>
}

createRoot(document.getElementById("root")).render(<App/>);
