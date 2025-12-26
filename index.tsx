
import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GoogleGenAI } from "@google/genai";

// --- TYPES ---
interface Comment {
  id: string;
  author: string;
  text: string;
  timestamp: number;
}

interface Post {
  id: string;
  author: string;
  text: string;
  image?: string;
  timestamp: number;
  likes: number;
  likedBy: string[];
  comments: Comment[];
}

interface User {
  username: string;
  joinedAt: number;
}

// --- SERVICES ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const GeminiService = {
  async generateGoldThought(): Promise<string> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Generate a single, short, profound, and luxurious social media post (max 20 words) about gold, brilliance, or excellence. No hashtags.",
        config: {
          temperature: 0.9,
          topK: 40,
          topP: 0.95,
        }
      });
      return response.text?.trim() || "Brilliance is the true currency of the universe.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "True brilliance radiates from within.";
    }
  }
};

// --- COMPONENTS ---

const Login: React.FC<{ onLogin: (u: string) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-5xl font-black gold-text tracking-widest animate-pulse">GOLDEN SOCIAL</h1>
          <p className="text-white/40 uppercase tracking-[0.2em] text-sm">Universal Connect V4.0</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if(username.trim()) onLogin(username); }} className="bg-[#121212] p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <div className="space-y-4">
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 outline-none focus:border-[#ffd700] transition-colors" />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/20 outline-none focus:border-[#ffd700] transition-colors" />
          </div>
          <button type="submit" className="w-full gold-gradient py-4 rounded-xl text-black font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_10px_30px_rgba(255,215,0,0.3)]">ENTER UNIVERSE</button>
        </form>
      </div>
    </div>
  );
};

const PostCard: React.FC<{ post: Post, currentUser: User, onLike: () => void, onComment: (t: string) => void }> = ({ post, currentUser, onLike, onComment }) => {
  const [isGlowing, setIsGlowing] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);
  const isLiked = post.likedBy.includes(currentUser.username);

  useEffect(() => {
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const timer = setTimeout(() => setIsGlowing(true), 3000);
        entry.target.setAttribute('data-timer', timer.toString());
      } else {
        const t = entry.target.getAttribute('data-timer');
        if(t) clearTimeout(parseInt(t));
        setIsGlowing(false);
      }
    }, { threshold: 0.8 });
    if(cardRef.current) obs.observe(cardRef.current);
    return () => obs.disconnect();
  }, []);

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    return `${Math.floor(diff / 3600000)}h ago`;
  };

  return (
    <div ref={cardRef} className={`bg-[#121212] p-5 rounded-3xl border border-white/10 border-l-4 border-l-[#ffd700] transition-all duration-500 ${isGlowing ? 'attention-glow scale-[1.03] z-10' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center font-bold text-black uppercase">{post.author[0]}</div>
          <div>
            <h4 className="font-bold text-[#ffd700]">@{post.author}</h4>
            <p className="text-[10px] text-white/30 uppercase tracking-widest">{formatTime(post.timestamp)}</p>
          </div>
        </div>
      </div>
      <p className="text-white/90 leading-relaxed mb-4">{post.text}</p>
      {post.image && <img src={post.image} className="w-full rounded-2xl mb-4 border border-white/5" />}
      <div className="flex gap-6 border-t border-white/5 pt-4">
        <button onClick={onLike} className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : 'text-white/40 hover:text-red-500'}`}>
          <i className={`fa-${isLiked ? 'solid' : 'regular'} fa-heart`}></i>
          <span className="text-sm font-bold">{post.likes}</span>
        </button>
        <button onClick={() => setShowComments(!showComments)} className={`flex items-center gap-2 ${showComments ? 'text-[#ffd700]' : 'text-white/40 hover:text-[#ffd700]'}`}>
          <i className="fa-regular fa-comment"></i>
          <span className="text-sm font-bold">{post.comments.length}</span>
        </button>
      </div>
      {showComments && (
        <div className="mt-4 space-y-4 border-t border-white/5 pt-4">
          <form onSubmit={e => { e.preventDefault(); if(commentText.trim()) { onComment(commentText); setCommentText(''); } }} className="flex gap-2">
            <input type="text" placeholder="Add a comment..." value={commentText} onChange={e => setCommentText(e.target.value)} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#ffd700]/50" />
            <button type="submit" className="text-[#ffd700] px-2 font-bold text-sm">Post</button>
          </form>
          <div className="space-y-3 max-h-40 overflow-y-auto no-scrollbar">
            {post.comments.map(c => (
              <div key={c.id} className="flex gap-2">
                <div className="w-6 h-6 rounded-full gold-gradient flex-shrink-0 flex items-center justify-center text-[10px] font-black text-black">{c.author[0]}</div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-[#ffd700]">@{c.author} <span className="text-[10px] text-white/20 ml-2 font-normal">{formatTime(c.timestamp)}</span></div>
                  <p className="text-xs text-white/70">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Feed: React.FC<{ user: User, posts: Post[], onAddPost: (t: string, i?: string) => void, onLike: (id: string) => void, onComment: (id: string, t: string) => void }> = ({ user, posts, onAddPost, onLike, onComment }) => {
  const [inputText, setInputText] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      <div className="overflow-hidden bg-[#ffd700]/10 border border-[#ffd700]/20 rounded-xl py-2 px-4 whitespace-nowrap">
        <div className="inline-block animate-[scroll_20s_linear_infinite] text-[#ffd700] font-bold">✨ Welcome @{user.username} | Share your brilliance | Explore the Golden Universe Search! ✨</div>
      </div>
      <div className="bg-[#121212] p-4 rounded-2xl border-l-4 border-[#ffd700] space-y-4 shadow-xl">
        <textarea placeholder="What gold thoughts are you weighing today?" value={inputText} onChange={e => setInputText(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-white/30 min-h-[100px] outline-none focus:border-[#ffd700]/50 resize-none" />
        {previewImage && <div className="relative"><img src={previewImage} className="w-full rounded-xl border border-[#ffd700]" /><button onClick={() => setPreviewImage(null)} className="absolute top-2 right-2 bg-black/70 w-8 h-8 rounded-full border border-white/20">×</button></div>}
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <button onClick={() => fileRef.current?.click()} className="text-2xl hover:scale-125">🖼️</button>
            <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={e => {
              const file = e.target.files?.[0];
              if(file) {
                const reader = new FileReader();
                reader.onloadend = () => setPreviewImage(reader.result as string);
                reader.readAsDataURL(file);
              }
            }} />
            <button onClick={async () => { setIsGenerating(true); setInputText(await GeminiService.generateGoldThought()); setIsGenerating(false); }} disabled={isGenerating} className={`text-2xl hover:scale-125 ${isGenerating ? 'opacity-50' : ''}`}>🪄</button>
          </div>
          <button onClick={() => { if(inputText.trim() || previewImage) { onAddPost(inputText, previewImage || undefined); setInputText(''); setPreviewImage(null); } }} className="gold-gradient px-8 py-2 rounded-xl text-black font-bold hover:scale-105 active:scale-95 transition-all">POST ✨</button>
        </div>
      </div>
      <div className="space-y-4">
        {posts.map(p => <PostCard key={p.id} post={p} currentUser={user} onLike={() => onLike(p.id)} onComment={t => onComment(p.id, t)} />)}
      </div>
    </div>
  );
};

const Portal: React.FC<{ onClose: () => void, activePosts: Post[], currentUser: User }> = ({ onClose, activePosts, currentUser }) => {
  const [gateState, setGateState] = useState<'closed' | 'opening' | 'open'>('closed');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [rotationTrigger, setRotationTrigger] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const earthRef = useRef<THREE.Mesh>(null);
  const markersRef = useRef<{ username: string, mesh: THREE.Group }[]>([]);

  const usersList = useMemo(() => {
    const set = new Set<string>([currentUser.username]);
    activePosts.forEach(p => { set.add(p.author); p.likedBy.forEach(u => set.add(u)); p.comments.forEach(c => set.add(c.author)); });
    ['The_Founder', 'Midas_King', 'Noble_Soul', 'Golden_AI', 'Zara_Universe', 'Oracle_Alpha'].forEach(u => set.add(u));
    return Array.from(set);
  }, [activePosts, currentUser]);

  useEffect(() => {
    setTimeout(() => setGateState('opening'), 100);
    setTimeout(() => setGateState('open'), 1600);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const earthRadius = 2.2;
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(earthRadius, 64, 64),
      new THREE.MeshPhongMaterial({ 
        map: new THREE.TextureLoader().load('https://upload.wikimedia.org/wikipedia/commons/c/cf/World_map_blank_without_borders.jpg'),
        shininess: 45, specular: 0xffd700, emissive: 0x111111 
      })
    );
    earthRef.current = earth;
    scene.add(earth);

    // Labels
    const createLabel = (text: string) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256; canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.beginPath(); ctx.roundRect(32, 8, 192, 48, 24); ctx.fill();
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2; ctx.stroke();
      ctx.font = 'bold 24px Arial'; ctx.fillStyle = '#ffd700'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(`@${text}`, 128, 32);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true }));
      sprite.scale.set(0.8, 0.2, 1);
      sprite.position.y = 0.15;
      return sprite;
    };

    usersList.forEach(u => {
      const lat = (Math.random() - 0.5) * 160, lon = (Math.random() - 0.5) * 360;
      const phi = (90 - lat) * (Math.PI / 180), theta = (lon + 180) * (Math.PI / 180);
      const pos = new THREE.Vector3(-earthRadius * Math.sin(phi) * Math.cos(theta), earthRadius * Math.cos(phi), earthRadius * Math.sin(phi) * Math.sin(theta));
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), new THREE.MeshBasicMaterial({ color: 0xffd700 })));
      g.add(createLabel(u));
      g.position.copy(pos);
      g.lookAt(pos.clone().multiplyScalar(2));
      earth.add(g);
      markersRef.current.push({ username: u, mesh: g });
    });

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    const l = new THREE.DirectionalLight(0xffd700, 2.5); l.position.set(12, 12, 12); scene.add(l);
    camera.position.z = 7.5;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; controls.autoRotate = true; controls.autoRotateSpeed = 0.5; controls.enableZoom = false;
    controls.addEventListener('start', () => setIsScanning(true));
    controls.addEventListener('end', () => setIsScanning(false));
    controls.addEventListener('change', () => setRotationTrigger(v => v + 1));

    const animate = () => {
      requestAnimationFrame(animate);
      if(earthRef.current) earthRef.current.rotation.y += isScanning ? 0.015 : 0.0005;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();
    return () => { renderer.dispose(); if(containerRef.current) containerRef.current.innerHTML = ''; };
  }, []);

  useEffect(() => {
    if(isScanning) {
      const found = [...usersList].sort(() => 0.5 - Math.random()).slice(0, 3);
      setSearchResults(prev => Array.from(new Set([...prev, ...found])).slice(-10));
    }
  }, [rotationTrigger, isScanning, usersList]);

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 z-[130] flex pointer-events-none">
        <div className={`h-full w-1/2 bg-[#050505] border-r-4 border-[#ffd700] transition-transform duration-[1800ms] ${gateState !== 'closed' ? '-translate-x-full' : ''}`} />
        <div className={`h-full w-1/2 bg-[#050505] border-l-4 border-[#ffd700] transition-transform duration-[1800ms] ${gateState !== 'closed' ? 'translate-x-full' : ''}`} />
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-black border-[6px] border-[#ffd700] shadow-[0_0_80px_rgba(255,215,0,0.6)] flex items-center justify-center transition-all duration-[1200ms] ${gateState !== 'closed' ? 'scale-0 opacity-0 rotate-[360deg]' : ''}`}><div className="text-6xl font-black italic gold-text">G</div></div>
      </div>
      <div ref={containerRef} className="absolute inset-0 z-[90]" />
      <div className={`relative z-[120] w-full max-w-xl h-full flex flex-col items-center justify-between p-8 transition-opacity duration-1000 pointer-events-none ${gateState === 'open' ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-center mt-4 pointer-events-auto">
          <h2 className="text-6xl font-black gold-text tracking-tighter drop-shadow-[0_0_25px_rgba(255,215,0,0.5)] uppercase">Universe Scan</h2>
          <p className="text-[#ffd700]/60 text-[10px] tracking-[0.5em] font-bold mt-2">Active Signals Locked</p>
        </div>
        <div className="w-full space-y-6 mb-8 pointer-events-auto">
          <div className="relative max-w-lg mx-auto"><input type="text" placeholder="Scanning..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setSearchResults(usersList.filter(u => u.toLowerCase().includes(e.target.value.toLowerCase()))); }} className="w-full bg-black/60 border-2 border-[#ffd700]/30 rounded-3xl px-8 py-5 text-white text-center outline-none focus:border-[#ffd700] transition-all" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[30vh] overflow-y-auto no-scrollbar px-4 py-2">
            {searchResults.map((u, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-2xl border border-white/20 p-4 rounded-2xl flex items-center gap-4 hover:bg-[#ffd700]/20 transition-all cursor-pointer">
                <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center text-black font-black">{u[0]}</div>
                <div className="flex-1"><div className="font-black text-[#ffd700] text-sm uppercase">@{u}</div><div className="text-[10px] text-white/50 uppercase">Satellite Signal</div></div>
                <i className="fa-solid fa-paper-plane text-[#ffd700]" onClick={() => alert(`Opening secure channel to @${u}...`)}></i>
              </div>
            ))}
          </div>
          <div className="flex justify-center"><button onClick={() => { setGateState('closed'); setTimeout(onClose, 1800); }} className="px-12 py-4 font-black text-[#ffd700] bg-black/60 border-2 border-[#ffd700]/40 rounded-full hover:bg-[#ffd700] hover:text-black transition-all">EXIT UNIVERSE</button></div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPortalOpen, setIsPortalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('golden_user'); if(saved) setUser(JSON.parse(saved));
    const savedPosts = localStorage.getItem('golden_posts');
    if(savedPosts) setPosts(JSON.parse(savedPosts));
    else {
      const init = [{ id: '1', author: 'Founder', text: 'Welcome to the Golden Universe.', timestamp: Date.now(), likes: 7, likedBy: ['AI_Guide'], comments: [] }];
      setPosts(init); localStorage.setItem('golden_posts', JSON.stringify(init));
    }
  }, []);

  const addPost = (t: string, i?: string) => {
    if(!user) return;
    const p: Post = { id: Math.random().toString(36).substr(2,9), author: user.username, text: t, image: i, timestamp: Date.now(), likes: 0, likedBy: [], comments: [] };
    const up = [p, ...posts]; setPosts(up); localStorage.setItem('golden_posts', JSON.stringify(up));
  };

  const toggleLike = (id: string) => {
    if(!user) return;
    const up = posts.map(p => {
      if(p.id === id) {
        const liked = p.likedBy.includes(user.username);
        const newBy = liked ? p.likedBy.filter(u => u !== user.username) : [...p.likedBy, user.username];
        return { ...p, likedBy: newBy, likes: newBy.length };
      }
      return p;
    });
    setPosts(up); localStorage.setItem('golden_posts', JSON.stringify(up));
  };

  const addComment = (id: string, t: string) => {
    if(!user) return;
    const up = posts.map(p => {
      if(p.id === id) return { ...p, comments: [...p.comments, { id: Math.random().toString(36).substr(2,9), author: user.username, text: t, timestamp: Date.now() }] };
      return p;
    });
    setPosts(up); localStorage.setItem('golden_posts', JSON.stringify(up));
  };

  if (!user) return <Login onLogin={u => { const nu = { username: u, joinedAt: Date.now() }; setUser(nu); localStorage.setItem('golden_user', JSON.stringify(nu)); }} />;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center">
      <header className="w-full max-w-lg sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-white/10 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-black italic gold-text tracking-tighter">GOLDEN</h1>
        <button onClick={() => setIsPortalOpen(true)} className="w-12 h-12 rounded-full border-2 border-[#ffd700] flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(255,215,0,0.5)]">🌍</button>
      </header>
      <main className="w-full max-w-lg px-4 pb-24 pt-4">
        <Feed user={user} posts={posts} onAddPost={addPost} onLike={toggleLike} onComment={addComment} />
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 px-8 py-5 flex justify-around items-center z-40 max-w-lg mx-auto rounded-t-3xl">
        <button className="text-2xl hover:text-[#ffd700]" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}><i className="fa-solid fa-house"></i></button>
        <button className="text-2xl text-white/40 hover:text-[#ffd700]"><i className="fa-solid fa-bell"></i></button>
        <button className="text-2xl text-white/40 hover:text-[#ffd700]"><i className="fa-solid fa-comment-dots"></i></button>
        <button className="text-2xl text-white/40 hover:text-red-500" onClick={() => { if(confirm('Exit Universe?')) { setUser(null); localStorage.removeItem('golden_user'); } }}><i className="fa-solid fa-right-from-bracket"></i></button>
      </nav>
      {isPortalOpen && <Portal onClose={() => setIsPortalOpen(false)} activePosts={posts} currentUser={user} />}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><App /></React.StrictMode>);
