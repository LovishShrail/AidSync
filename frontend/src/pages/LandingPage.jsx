import React, { useEffect, useState, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, Zap, Globe, Heart, Coins, Layers, Database, Lock, Activity } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  
  // Eased scroll value for smooth inertia scrolling
  const [dampenedScroll, setDampenedScroll] = useState(0);
  
  // Continuous rotation angle for 3D spin
  const [rotationTime, setRotationTime] = useState(0);

  // Dynamic layout coordinates for placeholder tracking
  const [positions, setPositions] = useState({
    hero: { x: typeof window !== 'undefined' ? window.innerWidth / 2 : 600, y: 320 },
    constellation: { x: typeof window !== 'undefined' ? window.innerWidth * 0.75 : 900, y: 1100 }
  });

  // Load Inter font dynamically to match style guide typography
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Update base 3D cube rotation angles (continuous auto-spin)
  useEffect(() => {
    let animationFrameId;
    const animate = () => {
      setRotationTime(t => t + 0.5);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Dampened scroll loop (cinematic inertia)
  useEffect(() => {
    let targetScroll = 0;
    let currentScroll = 0;
    let animationFrameId;

    const handleScroll = () => {
      targetScroll = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const updateScroll = () => {
      // 0.1 interpolation factor gives a smooth spring ease-out trailing effect
      currentScroll += (targetScroll - currentScroll) * 0.1;
      setDampenedScroll(currentScroll);
      animationFrameId = requestAnimationFrame(updateScroll);
    };
    updateScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Measure placeholder center positions in absolute document coordinates
  useLayoutEffect(() => {
    const measurePositions = () => {
      const heroEl = document.getElementById('placeholder-hero');
      const constEl = document.getElementById('placeholder-constellation');

      if (heroEl && constEl) {
        const heroRect = heroEl.getBoundingClientRect();
        const constRect = constEl.getBoundingClientRect();

        setPositions({
          hero: {
            x: heroRect.left + window.scrollX + heroRect.width / 2,
            y: heroRect.top + window.scrollY + heroRect.height / 2
          },
          constellation: {
            x: constRect.left + window.scrollX + constRect.width / 2,
            y: constRect.top + window.scrollY + constRect.height / 2
          }
        });
      }
    };

    // Delay slightly to ensure browser layout completes
    const timer = setTimeout(measurePositions, 100);
    window.addEventListener('resize', measurePositions);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measurePositions);
    };
  }, []);

  const enterApp = () => {
    navigate('/home');
  };

  const viewDisasters = () => {
    navigate('/disasters');
  };

  // Interpolation logic to map the single 3D cube instance down to its final destination
  const getCubeTransform = () => {
    let pageX = positions.hero.x;
    let pageY = positions.hero.y;
    let scale = 1.25;

    // Milestone threshold: scroll distance to complete landing transition
    const m1 = 750;  
    const t = Math.min(1, dampenedScroll / m1);
    const ease = t * t * (3 - 2 * t); // Smoothstep ease-in-out

    // Glide smoothly from hero placeholder to constellation node placeholder
    pageX = positions.hero.x + (positions.constellation.x - positions.hero.x) * ease;
    pageY = positions.hero.y + (positions.constellation.y - positions.hero.y) * ease;
    
    // Scale transitions from 1.25 down to 0.55.
    const baseScale = 1.25 + (0.55 - 1.25) * ease;
    
    // Add subtle breathing scale pulse on arrival
    const pulse = t === 1 ? Math.sin(rotationTime * 0.05) * 0.015 : 0;
    scale = baseScale + pulse;

    // Viewport-relative fixed positioning (syncs with dampened scroll)
    const clientX = pageX - (typeof window !== 'undefined' ? window.scrollX : 0);
    const clientY = pageY - dampenedScroll;

    // Combine spin and scroll rotations
    const rotX = rotationTime * 0.3 + dampenedScroll * 0.15;
    const rotY = rotationTime * 0.4 + dampenedScroll * 0.2;
    const rotZ = dampenedScroll * 0.05;

    // Emissive styling factors mapping merge arrival status
    const borderAlpha = 0.35 + ease * 0.25; // Border opacity highlights on arrival
    const insetGlow = 15 + ease * 15;
    const outerGlow = ease * 30;
    const auraOpacity = ease * 0.35;

    return {
      style: {
        left: `${clientX}px`,
        top: `${clientY}px`,
        transform: 'translate(-50%, -50%)',
        zIndex: 40
      },
      cubeTransform: `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg) scale(${scale})`,
      faceStyle: {
        borderColor: `rgba(255, 255, 255, ${borderAlpha})`, // Elegant white highlight border
        // Premium solid blue gradient representing the brand color
        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', 
        boxShadow: `inset 0 0 ${insetGlow}px rgba(255, 255, 255, 0.3), 0 0 ${outerGlow}px rgba(37, 99, 235, ${0.1 + auraOpacity})`
      },
      mergeProgress: t
    };
  };

  const activeCube = getCubeTransform();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-blue-500/20 selection:text-blue-900 relative overflow-x-hidden">
      
      {/* Self-contained CSS for 3D Cube (Dice) render & custom animation rules */}
      <style>{`
        .scene {
          /* Higher perspective distance (3000px) reduces lens distortion, keeping the cube shape perfectly square and avoiding cuboid stretching */
          perspective: 3000px;
          perspective-origin: center;
        }
        .cube {
          position: absolute;
          width: 140px;
          height: 140px;
          transform-style: preserve-3d;
        }
        .cube-face {
          position: absolute;
          width: 140px;
          height: 140px;
          border-width: 1.5px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        
        /* 3D Dice Face Positions */
        .face-front  { transform: rotateY(  0deg) translateZ(70px); }
        .face-back   { transform: rotateY(180deg) translateZ(70px); }
        .face-right  { transform: rotateY( 90deg) translateZ(70px); }
        .face-left   { transform: rotateY(-90deg) translateZ(70px); }
        .face-top    { transform: rotateX( 90deg) translateZ(70px); }
        .face-bottom { transform: rotateX(-90deg) translateZ(70px); }

        /* Left/Right Floating Cubes in Reversal Band */
        .mini-cube {
          position: relative;
          transform-style: preserve-3d;
          animation: spinMini 12s linear infinite;
        }
        .mini-face {
          position: absolute;
          width: 60px;
          height: 60px;
          border: 1px solid rgba(59, 130, 246, 0.4);
          background: rgba(30, 41, 59, 0.95); /* Dark theme match for reversal band */
          border-radius: 6px;
          box-shadow: inset 0 0 10px rgba(59, 130, 246, 0.2);
        }
        .mini-front  { transform: rotateY(  0deg) translateZ(30px); }
        .mini-back   { transform: rotateY(180deg) translateZ(30px); }
        .mini-right  { transform: rotateY( 90deg) translateZ(30px); }
        .mini-left   { transform: rotateY(-90deg) translateZ(30px); }
        .mini-top    { transform: rotateX( 90deg) translateZ(30px); }
        .mini-bottom { transform: rotateX(-90deg) translateZ(30px); }

        @keyframes spinMini {
          0% { transform: rotateX(0deg) rotateY(0deg); }
          100% { transform: rotateX(360deg) rotateY(360deg); }
        }

        /* Animated SVG constellation connectors */
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animated-connector {
          stroke-dasharray: 6, 6;
          animation: dash 1.5s linear infinite;
        }

        /* Text entrance fade effect */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
      `}</style>

      {/* Global Pinned Single 3D Cube Instance */}
      <div 
        className="fixed pointer-events-none"
        style={activeCube.style}
      >
        <div className="scene w-[200px] h-[200px] flex items-center justify-center">
          <div 
            className="cube" 
            style={{ transform: activeCube.cubeTransform }}
          >
            {/* Front: Smart Escrow */}
            <div className="cube-face face-front" style={activeCube.faceStyle}>
              <Shield className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
            {/* Back: Verified Evidence */}
            <div className="cube-face face-back" style={activeCube.faceStyle}>
              <Eye className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
            {/* Right: Event Synchronization */}
            <div className="cube-face face-right" style={activeCube.faceStyle}>
              <Zap className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
            {/* Left: Global Blockchain */}
            <div className="cube-face face-left" style={activeCube.faceStyle}>
              <Globe className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
            {/* Top: Secure escrow funds */}
            <div className="cube-face face-top" style={activeCube.faceStyle}>
              <Coins className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
            {/* Bottom: Aid & Relief */}
            <div className="cube-face face-bottom" style={activeCube.faceStyle}>
              <Heart className="w-10 h-10 text-white" strokeWidth={1.5} />
            </div>
          </div>
        </div>
      </div>

      {/* Light Blueprint Mesh Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#fff_70%,transparent_100%)] opacity-55 pointer-events-none z-0" />

      {/* Navigation Bar */}
      <nav className="max-w-[1280px] w-full mx-auto px-6 h-24 flex justify-between items-center z-50 relative bg-transparent">
        <div className="flex items-center">
          <img
            src="/AidsyncLogo.png"
            alt="AidSync3D Logo"
            className="h-16 object-contain ml-[-10px]"
          />
        </div>
        
        {/* Navigation Links matching project specifications */}
        <div className="hidden md:flex items-center space-x-10">
          <span onClick={enterApp} className="cursor-pointer text-[10px] font-semibold tracking-[0.22em] text-slate-500 hover:text-blue-600 transition-colors uppercase">
            Dashboard
          </span>
          <span onClick={viewDisasters} className="cursor-pointer text-[10px] font-semibold tracking-[0.22em] text-slate-500 hover:text-blue-600 transition-colors uppercase">
            Active Disasters
          </span>
          <a href="/organizations" className="text-[10px] font-semibold tracking-[0.22em] text-slate-500 hover:text-blue-600 transition-colors uppercase">
            Relief Units
          </a>
          <a href="/leaderboard" className="text-[10px] font-semibold tracking-[0.22em] text-slate-500 hover:text-blue-600 transition-colors uppercase">
            Donors
          </a>
          <a href="/emergency-fund" className="text-[10px] font-semibold tracking-[0.22em] text-slate-500 hover:text-blue-600 transition-colors uppercase">
            Emergency
          </a>
        </div>

        {/* Primary Action Button */}
        <div>
          <button
            onClick={enterApp}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-[4px] text-xs font-semibold tracking-[0.15em] uppercase transition-all duration-200 flex items-center shadow-md shadow-blue-600/10 cursor-pointer"
          >
            <span className="w-1.5 h-1.5 bg-white mr-2 inline-block rounded-[1px]" />
            Launch App
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-grow flex flex-col items-center justify-center text-center px-6 pt-16 pb-32 z-10 max-w-[1280px] mx-auto w-full relative">
        
        {/* Invisible Hero Position Placeholder */}
        <div 
          id="placeholder-hero" 
          className="w-[140px] h-[140px] mb-10 mt-4 pointer-events-none opacity-0"
        />

        {/* Feature Tag Pill */}
        <div className="inline-flex items-center space-x-2.5 px-3 py-1 mb-8 rounded-[4px] border border-blue-500/20 bg-blue-50 text-blue-600 animate-fade-in-up">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
          <span className="text-[10px] font-semibold tracking-[0.25em] uppercase">
            Secured On-Chain · Verified Off-Chain
          </span>
        </div>

        {/* Monolithic Display Headline */}
        <h1 className="text-4xl md:text-[80px] font-normal leading-[0.90] tracking-[-0.035em] text-slate-900 uppercase max-w-5xl mx-auto my-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Transparent Aid. <br />
          On-Chain Escrow. <br />
          Real-Time Sync.
        </h1>

        {/* Humanist Body Text */}
        <p className="text-slate-500 text-base md:text-[16px] leading-[1.50] max-w-[560px] mx-auto mt-6 mb-12 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          AidSync3D coordinates global crisis donation registries directly via Ethereum smart contracts, backed by visual IPFS evidence and synchronized instantly into a local cache database.
        </p>

        {/* Actions Row */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          <button
            onClick={enterApp}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs tracking-[0.15em] uppercase px-8 py-4 rounded-[4px] transition-all cursor-pointer flex items-center shadow-lg shadow-blue-600/10"
          >
            <span className="w-1.5 h-1.5 bg-white mr-2 inline-block rounded-[1px]" />
            Enter Platform
          </button>
          
          <button
            onClick={viewDisasters}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs tracking-[0.15em] uppercase px-8 py-4 rounded-[4px] transition-all cursor-pointer shadow-sm"
          >
            Browse Active Cases
          </button>
        </div>
      </section>

      {/* Social Proof Row */}
      <section className="border-t border-slate-200 py-10 w-full z-10 relative bg-slate-100/50">
        <div className="max-w-[1280px] mx-auto px-6 text-center">
          <p className="text-[9px] font-semibold tracking-[0.3em] uppercase text-slate-400 mb-6">Supported Standards & Protocols</p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-60 grayscale hover:opacity-100 transition-opacity duration-300">
            <span className="text-xs font-mono font-bold tracking-widest text-slate-800">ETHEREUM SEPOLIA</span>
            <span className="text-xs font-mono font-bold tracking-widest text-slate-800">IPFS STORAGE</span>
            <span className="text-xs font-mono font-bold tracking-widest text-slate-800">PINATA GATEWAY</span>
            <span className="text-xs font-mono font-bold tracking-widest text-slate-800">MONGODB DATABASE</span>
            <span className="text-xs font-mono font-bold tracking-widest text-slate-800">METAMASK WALLET</span>
          </div>
        </div>
      </section>

      {/* Split Feature Block: Text Left, Constellation Visual Right */}
      <section className="max-w-[1280px] w-full mx-auto px-6 py-24 z-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          
          {/* Left Description Column (40% equivalent) */}
          <div className="lg:col-span-5 space-y-8">
            <span className="text-[10px] font-semibold tracking-[0.25em] text-blue-600 uppercase">System Topology</span>
            <h2 className="text-3xl md:text-[48px] font-normal leading-[1.0] text-slate-900 tracking-[-0.03em] uppercase">
              DECENTRALIZED RESOURCE ROUTING
            </h2>
            <div className="h-0.5 w-16 bg-blue-600" />
            <p className="text-slate-500 text-sm leading-[1.6]">
              All crisis funds are held securely in the Ethereum escrow contract. Registered relief organizations must be audited and registered by the admin authority before collecting donor allocations.
            </p>
            <p className="text-slate-500 text-sm leading-[1.6]">
              A background caching server intercepts contract events (`DisasterCreated`, `Donated`), synchronizing on-chain states to the local database to bypass heavy blockchain querying.
            </p>
          </div>

          {/* Right Constellation Visual (60% equivalent) */}
          <div className="lg:col-span-7 flex justify-center relative select-none">
            
            {/* SVG Constellation with empty center for 3D Cube alignment */}
            <svg viewBox="0 0 500 500" className="w-full max-w-[480px] h-auto">
              
              {/* Pulsing Central Target Rings: Glows and pulses actively once the cube arrives */}
              <circle 
                cx="250" 
                cy="250" 
                r="35" 
                fill="none" 
                stroke={activeCube.mergeProgress === 1 ? "#2563eb" : "rgba(37, 99, 235, 0.3)"} 
                strokeWidth={activeCube.mergeProgress === 1 ? "2" : "1"} 
                className={activeCube.mergeProgress === 1 ? "animate-pulse" : ""} 
                style={{ transition: 'stroke 0.4s ease, stroke-width 0.4s ease' }}
              />
              <circle cx="250" cy="250" r="60" fill="none" stroke="rgba(37, 99, 235, 0.15)" strokeWidth="1" strokeDasharray="3 3" />
              
              {/* Connector lines mapping the constellation with active animation */}
              <line x1="250" y1="250" x2="110" y2="150" stroke="#3b82f6" strokeOpacity="0.4" strokeWidth="1.5" className="animated-connector" />
              <line x1="250" y1="250" x2="390" y2="150" stroke="#3b82f6" strokeOpacity="0.4" strokeWidth="1.5" className="animated-connector" />
              <line x1="250" y1="250" x2="90" y2="310" stroke="#3b82f6" strokeOpacity="0.4" strokeWidth="1.5" className="animated-connector" />
              <line x1="250" y1="250" x2="410" y2="310" stroke="#3b82f6" strokeOpacity="0.4" strokeWidth="1.5" className="animated-connector" />
              <line x1="250" y1="250" x2="250" y2="80"  stroke="#3b82f6" strokeOpacity="0.4" strokeWidth="1.5" className="animated-connector" />
              <line x1="250" y1="250" x2="250" y2="420" stroke="#3b82f6" strokeOpacity="0.4" strokeWidth="1.5" className="animated-connector" />

              {/* Node Outer Orbit Ring */}
              <circle cx="250" cy="250" r="180" fill="none" stroke="rgba(226, 232, 240, 0.8)" strokeWidth="1" />

              {/* Satellite Node: Sepolia Contract */}
              <g transform="translate(225, 55)">
                <circle cx="25" cy="25" r="20" fill="white" stroke="#3b82f6" strokeWidth="1.5" />
                <Lock className="w-5 h-5 text-blue-600" x="15" y="15" />
                <text x="25" y="62" textAnchor="middle" fill="#64748b" fontSize="9" letterSpacing="1" className="font-semibold uppercase">SEPOLIA</text>
              </g>

              {/* Satellite Node: MongoDB Cache */}
              <g transform="translate(225, 395)">
                <circle cx="25" cy="25" r="20" fill="white" stroke="#3b82f6" strokeWidth="1.5" />
                <Database className="w-5 h-5 text-blue-600" x="15" y="15" />
                <text x="25" y="62" textAnchor="middle" fill="#64748b" fontSize="9" letterSpacing="1" className="font-semibold uppercase">DATABASE</text>
              </g>

              {/* Satellite Node: Donor wallet */}
              <g transform="translate(85, 125)">
                <circle cx="25" cy="25" r="20" fill="white" stroke="#94a3b8" strokeWidth="1" />
                <Coins className="w-5 h-5 text-slate-500" x="15" y="15" />
                <text x="25" y="62" textAnchor="middle" fill="#64748b" fontSize="9" letterSpacing="1" className="font-semibold uppercase">DONOR</text>
              </g>

              {/* Satellite Node: IPFS storage */}
              <g transform="translate(365, 125)">
                <circle cx="25" cy="25" r="20" fill="white" stroke="#3b82f6" strokeWidth="1.5" />
                <Eye className="w-5 h-5 text-blue-600" x="15" y="15" />
                <text x="25" y="62" textAnchor="middle" fill="#64748b" fontSize="9" letterSpacing="1" className="font-semibold uppercase">IPFS PROOF</text>
              </g>

              {/* Satellite Node: Escrow system */}
              <g transform="translate(65, 285)">
                <circle cx="25" cy="25" r="20" fill="white" stroke="#94a3b8" strokeWidth="1" />
                <Shield className="w-5 h-5 text-slate-500" x="15" y="15" />
                <text x="25" y="62" textAnchor="middle" fill="#64748b" fontSize="9" letterSpacing="1" className="font-semibold uppercase">ESCROW</text>
              </g>

              {/* Satellite Node: Local backend */}
              <g transform="translate(385, 285)">
                <circle cx="25" cy="25" r="20" fill="white" stroke="#3b82f6" strokeWidth="1.5" />
                <Activity className="w-5 h-5 text-blue-600" x="15" y="15" />
                <text x="25" y="62" textAnchor="middle" fill="#64748b" fontSize="9" letterSpacing="1" className="font-semibold uppercase">BACKEND</text>
              </g>
            </svg>

            {/* Target placeholder inside constellation center for 3D Cube alignment */}
            <div 
              id="placeholder-constellation" 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80px] h-[80px] pointer-events-none opacity-0"
            />
          </div>
        </div>
      </section>

      {/* Reversal Band: Dark Section breaking the light rhythm */}
      <section className="bg-[#0f172a] text-[#f9f9f9] py-24 w-full relative z-10 select-none overflow-hidden border-t border-b border-[#1e293b]">
        
        {/* Floating Mini 3D Cubes overlapping at left/right edges for visual balance */}
        <div className="absolute left-[8%] top-[30%] pointer-events-none opacity-30 md:opacity-50">
          <div className="mini-cube">
            <div className="mini-face mini-front"></div>
            <div className="mini-face mini-back"></div>
            <div className="mini-face mini-right"></div>
            <div className="mini-face mini-left"></div>
            <div className="mini-face mini-top"></div>
            <div className="mini-face mini-bottom"></div>
          </div>
        </div>
        <div className="absolute right-[8%] top-[30%] pointer-events-none opacity-30 md:opacity-50">
          <div className="mini-cube" style={{ animationDelay: '-4s' }}>
            <div className="mini-face mini-front"></div>
            <div className="mini-face mini-back"></div>
            <div className="mini-face mini-right"></div>
            <div className="mini-face mini-left"></div>
            <div className="mini-face mini-top"></div>
            <div className="mini-face mini-bottom"></div>
          </div>
        </div>

        {/* Reversal Centered Layout Grid */}
        <div className="max-w-[1280px] mx-auto px-6 text-center relative z-20">
          <span className="text-[10px] font-semibold tracking-[0.25em] text-[#94a3b8] uppercase mb-4 block">Audit Performance</span>
          <h2 className="text-4xl md:text-[80px] font-normal leading-[0.90] tracking-[-0.035em] text-white uppercase mb-8 max-w-xl mx-auto">
            ABSOLUTE VERACITY
          </h2>
          <p className="text-[#94a3b8] text-[16px] leading-[1.50] max-w-[560px] mx-auto mb-10">
            We bypass intermediate database trust entirely. Every state is audit-checked dynamically against Ethereum block state records, ensuring flawless consistency.
          </p>

          <div className="flex justify-center space-x-4">
            <button
              onClick={enterApp}
              className="bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs tracking-[0.15em] uppercase px-8 py-3.5 rounded-[4px] transition-all cursor-pointer flex items-center shadow-lg shadow-white/5"
            >
              <span className="w-1.5 h-1.5 bg-blue-600 mr-2 inline-block rounded-[1px]" />
              Launch Application
            </button>
            
            <button
              onClick={viewDisasters}
              className="bg-transparent hover:bg-white/5 border border-white/40 text-white font-semibold text-xs tracking-[0.15em] uppercase px-8 py-3.5 rounded-[4px] transition-all cursor-pointer"
            >
              Check Cases
            </button>
          </div>
        </div>
      </section>

      {/* Detail Stats / Feature Grid on light Slate canvas */}
      <section className="max-w-[1280px] w-full mx-auto px-6 py-24 z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div className="p-8 border border-slate-200 bg-white rounded-[8px] space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[9px] font-semibold tracking-[0.2em] text-slate-400 uppercase">Protocol Layer</span>
            <h3 className="text-lg font-medium tracking-wide text-slate-900 uppercase">IMMUTABLE ESCROWS</h3>
            <p className="text-slate-500 text-xs leading-[1.6]">
              All crisis funds are held in secure, immutable smart contract escrow pools. Withdrawals are strictly limited to relief units assigned explicitly by the admin authority.
            </p>
          </div>

          <div className="p-8 border border-slate-200 bg-white rounded-[8px] space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[9px] font-semibold tracking-[0.2em] text-slate-400 uppercase">Storage Layer</span>
            <h3 className="text-lg font-medium tracking-wide text-slate-900 uppercase">DECENTRALIZED IPFS</h3>
            <p className="text-slate-500 text-xs leading-[1.6]">
              Heavier content like drone video verification clips and 3D terrain reconstruction models are stored and pinned on decentralized IPFS node layers, preventing database tampering.
            </p>
          </div>

          <div className="p-8 border border-slate-200 bg-white rounded-[8px] space-y-4 shadow-sm hover:shadow-md transition-shadow">
            <span className="text-[9px] font-semibold tracking-[0.2em] text-slate-400 uppercase">Sync Layer</span>
            <h3 className="text-lg font-medium tracking-wide text-slate-900 uppercase">EXPRESS CACHING</h3>
            <p className="text-slate-500 text-xs leading-[1.6]">
              A specialized local cache using a Node/Express middleware retrieves contract log updates dynamically, updating MongoDB indexes to serve UI charts instantly.
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 w-full z-10 relative mt-auto bg-slate-100/60">
        <div className="max-w-[1280px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-500 space-y-6 md:space-y-0">
          <div>
            © {new Date().getFullYear()} AIDSYNC3D COORD. ALL RIGHTS RESERVED.
          </div>
          <div className="flex space-x-8">
            <span className="hover:text-blue-600 transition-colors">SEPOLIA ADDR: 0xF0d2bdAB...EbE</span>
          </div>
        </div>
      </footer>

    </div>
  );
}