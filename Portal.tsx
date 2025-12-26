
import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Post, User } from '../types';

interface PortalProps {
  onClose: () => void;
  activePosts: Post[];
  currentUser: User;
}

interface UserMarker {
  username: string;
  lat: number;
  lon: number;
  mesh: THREE.Group;
}

const Portal: React.FC<PortalProps> = ({ onClose, activePosts, currentUser }) => {
  const [gateState, setGateState] = useState<'closed' | 'opening' | 'open'>('closed');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [rotationTrigger, setRotationTrigger] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const earthRef = useRef<THREE.Mesh>(null);
  const markersRef = useRef<UserMarker[]>([]);

  // Helper to create a text texture for labels
  const createTextLabel = (text: string) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;

    canvas.width = 256;
    canvas.height = 64;

    // Background capsule
    context.fillStyle = 'rgba(0, 0, 0, 0.6)';
    context.beginPath();
    context.roundRect(32, 8, 192, 48, 24);
    context.fill();
    context.strokeStyle = '#ffd700';
    context.lineWidth = 2;
    context.stroke();

    // Text
    context.font = 'bold 24px Arial';
    context.fillStyle = '#ffd700';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(`@${text}`, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  };

  // Helper to convert Lat/Lon to Vector3
  const latLonToVector3 = (lat: number, lon: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    );
  };

  const getUniverseUsers = () => {
    const usersSet = new Set<string>();
    usersSet.add(currentUser.username);
    activePosts.forEach(post => {
      usersSet.add(post.author);
      post.likedBy.forEach(u => usersSet.add(u));
      post.comments.forEach(c => usersSet.add(c.author));
    });
    ['The_Founder', 'Midas_King', 'Noble_Soul', 'Golden_AI', 'Zara_Universe', 'Oracle_Alpha', 'Stellar_Nexus'].forEach(u => usersSet.add(u));
    return Array.from(usersSet);
  };

  useEffect(() => {
    const sequence = async () => {
      await new Promise(r => setTimeout(r, 100));
      setGateState('opening');
      await new Promise(r => setTimeout(r, 1500));
      setGateState('open');
    };
    sequence();
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ 
      color: 0xffd700, 
      size: 0.1, 
      transparent: true, 
      opacity: 0.8,
      blending: THREE.AdditiveBlending 
    });
    
    const starVertices = [];
    for (let i = 0; i < 15000; i++) {
      const x = (Math.random() - 0.5) * 2500;
      const y = (Math.random() - 0.5) * 2500;
      const z = (Math.random() - 0.5) * 2500;
      starVertices.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load('https://upload.wikimedia.org/wikipedia/commons/c/cf/World_map_blank_without_borders.jpg');
    
    const earthRadius = 2.2;
    const geometry = new THREE.SphereGeometry(earthRadius, 64, 64);
    const material = new THREE.MeshPhongMaterial({ 
      map: earthTexture,
      shininess: 45,
      specular: new THREE.Color(0xffd700),
      emissive: new THREE.Color(0x221a00),
      emissiveIntensity: 0.6
    });
    const earth = new THREE.Mesh(geometry, material);
    (earthRef as any).current = earth;
    scene.add(earth);

    // Add User Markers to Earth
    const users = getUniverseUsers();
    const userMarkers: UserMarker[] = [];
    
    users.forEach((username) => {
      const lat = (Math.random() - 0.5) * 160;
      const lon = (Math.random() - 0.5) * 360;
      const pos = latLonToVector3(lat, lon, earthRadius + 0.05);
      
      const markerGroup = new THREE.Group();
      
      // Glowing dot
      const dotGeom = new THREE.SphereGeometry(0.04, 8, 8);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0xffd700 });
      const dot = new THREE.Mesh(dotGeom, dotMat);
      markerGroup.add(dot);

      // Pulse ring
      const ringGeom = new THREE.RingGeometry(0.06, 0.08, 16);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.lookAt(pos.clone().multiplyScalar(2));
      markerGroup.add(ring);

      // Username Label
      const labelTexture = createTextLabel(username);
      if (labelTexture) {
        const spriteMat = new THREE.SpriteMaterial({ map: labelTexture, transparent: true });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(0.8, 0.2, 1);
        sprite.position.set(0, 0.15, 0); // Position slightly above the dot
        markerGroup.add(sprite);
      }

      markerGroup.position.copy(pos);
      markerGroup.lookAt(pos.clone().multiplyScalar(2));
      
      earth.add(markerGroup);
      userMarkers.push({ username, lat, lon, mesh: markerGroup });
    });
    markersRef.current = userMarkers;

    const haloGeometry = new THREE.SphereGeometry(earthRadius * 1.06, 64, 64);
    const haloMaterial = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0xffd700) },
        viewVector: { value: camera.position }
      },
      vertexShader: `
        varying float intensity;
        void main() {
          vec3 vNormal = normalize( normalMatrix * normal );
          vec3 vNormel = normalize( normalMatrix * vec3(0.0, 0.0, 1.0) );
          intensity = pow( 0.65 - dot(vNormal, vNormel), 2.5 );
          gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4( glow, 1.0 );
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true
    });
    const halo = new THREE.Mesh(haloGeometry, haloMaterial);
    scene.add(halo);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffd700, 2.5);
    mainLight.position.set(12, 12, 12);
    scene.add(mainLight);

    camera.position.z = 7.5;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 1.0;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;
    controls.enableZoom = false;
    controls.enablePan = false;

    controls.addEventListener('start', () => setIsScanning(true));
    controls.addEventListener('end', () => setIsScanning(false));
    controls.addEventListener('change', () => setRotationTrigger(prev => prev + 1));

    const animate = (time: number) => {
      requestAnimationFrame(animate);
      if (earthRef.current) {
        const speed = isScanning ? 0.02 : 0.0008;
        earthRef.current.rotation.y += speed;

        markersRef.current.forEach(m => {
          const ring = m.mesh.children[1];
          if (ring) {
            const s = 1 + Math.sin(time * 0.005) * 0.3;
            ring.scale.set(s, s, s);
          }
        });
      }
      stars.rotation.y += 0.00015;
      controls.update();
      renderer.render(scene, camera);
    };
    animate(0);

    return () => {
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, []);

  useEffect(() => {
    if (isScanning) {
      const allUsers = getUniverseUsers();
      const discovered = [...allUsers]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      setSearchResults(prev => {
        const combined = new Set([...prev, ...discovered]);
        return Array.from(combined).slice(-10);
      });
    }
  }, [rotationTrigger, isScanning]);

  const handleSearch = (val: string) => {
    setSearchQuery(val);
    if (!val) {
      setSearchResults([]);
      return;
    }
    const allUsers = getUniverseUsers();
    setSearchResults(allUsers.filter(u => u.toLowerCase().includes(val.toLowerCase())));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black">
      <div className="absolute inset-0 pointer-events-none z-[130] flex">
        <div className={`h-full w-1/2 bg-[#050505] border-r-4 border-[#ffd700] transition-transform duration-[1800ms] cubic-bezier(0.7, 0, 0.3, 1) ${gateState !== 'closed' ? '-translate-x-full' : 'translate-x-0'}`}></div>
        <div className={`h-full w-1/2 bg-[#050505] border-l-4 border-[#ffd700] transition-transform duration-[1800ms] cubic-bezier(0.7, 0, 0.3, 1) ${gateState !== 'closed' ? 'translate-x-full' : 'translate-x-0'}`}></div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-black border-[6px] border-[#ffd700] shadow-[0_0_80px_rgba(255,215,0,0.6)] flex items-center justify-center transition-all duration-[1200ms] ${gateState !== 'closed' ? 'scale-0 opacity-0 rotate-[360deg]' : 'scale-100 opacity-100 rotate-0'}`}>
          <div className="text-6xl font-black italic gold-text select-none">G</div>
        </div>
      </div>

      <div ref={containerRef} className="absolute inset-0 z-[90]"></div>

      <div className={`relative z-[120] w-full max-w-xl h-full flex flex-col items-center justify-between p-8 transition-all duration-1000 pointer-events-none ${gateState === 'open' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        
        <div className="text-center mt-4 pointer-events-auto">
          <h2 className="text-6xl font-black gold-text tracking-tighter drop-shadow-[0_0_25px_rgba(255,215,0,0.5)] select-none uppercase">Universe Scan</h2>
          <p className="text-[#ffd700]/60 text-[10px] tracking-[0.5em] uppercase font-bold mt-2">Detected Souls: {markersRef.current.length}</p>
        </div>

        <div className="pointer-events-none text-white/20 uppercase tracking-[0.8em] text-[10px] font-bold animate-pulse text-center">
          Labels Locked to Geolocation Satellites
        </div>

        <div className="w-full space-y-6 mb-8 pointer-events-auto">
          <div className="relative max-w-lg mx-auto group">
            <input
              type="text"
              placeholder="Detecting frequency..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-black/60 backdrop-blur-3xl border-2 border-[#ffd700]/30 rounded-3xl px-8 py-5 text-white placeholder-white/20 outline-none focus:border-[#ffd700] focus:shadow-[0_0_50px_rgba(255,215,0,0.35)] transition-all text-center text-xl font-light tracking-wide pointer-events-auto"
            />
            <div className="absolute right-6 top-1/2 -translate-y-1/2">
              <i className={`fa-solid ${isScanning ? 'fa-spinner fa-spin' : 'fa-satellite'} text-[#ffd700] text-xl`}></i>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[30vh] overflow-y-auto no-scrollbar px-4 py-2 pointer-events-auto">
            {searchResults.map((user, idx) => {
              const userLikes = activePosts.filter(p => p.likedBy.includes(user)).length;
              const postCount = activePosts.filter(p => p.author === user).length;
              return (
                <div key={idx} className="group bg-white/10 backdrop-blur-2xl border border-white/20 p-4 rounded-2xl flex items-center gap-4 hover:bg-[#ffd700]/20 hover:border-[#ffd700]/60 transition-all cursor-pointer transform animate-in zoom-in-75">
                  <div className="w-12 h-12 rounded-full border-2 border-[#ffd700]/40 gold-gradient flex items-center justify-center text-black text-xl font-black shadow-[0_0_20px_rgba(255,215,0,0.4)]">{user[0]}</div>
                  <div className="flex-1">
                    <div className="font-black text-[#ffd700] text-sm uppercase">@{user}</div>
                    <div className="text-[10px] text-white/50 font-bold uppercase">
                      {userLikes > 0 ? `${userLikes} Likes ` : ''}
                      {postCount > 0 ? `• ${postCount} Posts` : (userLikes === 0 ? 'Satellite Found' : '')}
                    </div>
                  </div>
                  <i className="fa-solid fa-paper-plane text-[#ffd700] opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => {e.stopPropagation(); alert(`Channeling thought to @${user}...`);}}></i>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center pt-2">
            <button onClick={() => { setGateState('closed'); setTimeout(onClose, 1800); }} className="group inline-flex items-center gap-3 px-12 py-4 font-black text-[#ffd700] bg-black/60 backdrop-blur-xl border-2 border-[#ffd700]/40 rounded-full hover:bg-[#ffd700] hover:text-black transition-all active:scale-95 pointer-events-auto">
              <span className="tracking-[0.2em] text-sm uppercase">Exit Satellite View</span>
            </button>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none z-[95] bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.95)_100%)]"></div>
      {isScanning && <div className="absolute inset-0 z-[115] pointer-events-none overflow-hidden"><div className="w-full h-[2px] bg-[#ffd700] opacity-50 shadow-[0_0_30px_#ffd700] animate-[radar_2s_linear_infinite]"></div></div>}
      <style>{`
        @keyframes radar { 0% { top: 0%; } 100% { top: 100%; } }
        .gold-text { background: linear-gradient(135deg, #ffd700 0%, #b8860b 50%, #ffd700 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-size: 200% auto; animation: shine 4s linear infinite; }
        @keyframes shine { to { background-position: 200% center; } }
      `}</style>
    </div>
  );
};

export default Portal;
