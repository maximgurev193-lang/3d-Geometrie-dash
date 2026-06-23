import React, { useState, useEffect } from 'react';
import { Level, Obstacle, ObstacleType, Difficulty } from '../types';
import { Star, Save, Trash2, Plus, X, Sparkles, RefreshCw, Play } from 'lucide-react';
import { useLanguage } from '../utils/translations';

interface CustomLevelCreatorProps {
  onClose: () => void;
  onSave: (newLevel: Level, finalStars: number) => void;
  editingLevel?: Level | null;
  starsBalance: number;
}

const PRESET_COLORS = [
  { name: 'Neon Blue', hex: '#3b82f6' },
  { name: 'Cyber Green', hex: '#00FF95' },
  { name: 'Violet Pulse', hex: '#a855f7' },
  { name: 'Fiery Amber', hex: '#f59e0b' },
  { name: 'Danger Red', hex: '#ef4444' },
  { name: 'Laser Pink', hex: '#ec4899' },
];

export const OBSTACLE_COSTS: Record<ObstacleType, number> = {
  SPIKE: 1,
  DOUBLE_SPIKE: 2,
  TRIPLE_SPIKE: 3,
  BLOCK: 2,
  ORB_YELLOW: 3,
  PAD_YELLOW: 2,
  PORTAL_GRAVITY_UP: 4,
  PORTAL_GRAVITY_DOWN: 4,
  PORTAL_SPEED_1X: 4,
  PORTAL_SPEED_2X: 5,
  STAR: 2,
  POWERUP_DOUBLE_JUMP: 5,
  POWERUP_SPEED_BOOST: 5,
};

export default function CustomLevelCreator({ onClose, onSave, editingLevel, starsBalance }: CustomLevelCreatorProps) {
  const { language } = useLanguage();

  // Configs
  const [name, setName] = useState(editingLevel?.name || 'Custom Run 1');
  const [difficulty, setDifficulty] = useState<Difficulty>(editingLevel?.difficulty || 'NORMAL');
  const [speed, setSpeed] = useState(editingLevel?.speed || 14);
  const [color, setColor] = useState(editingLevel?.color || '#00FF95');
  const [bpm, setBpm] = useState(editingLevel?.bpm || 135);
  const [length, setLength] = useState(editingLevel?.length || 200);

  // Obstacles list
  const [obstacles, setObstacles] = useState<Obstacle[]>(editingLevel?.obstacles || []);
  const [nextX, setNextX] = useState<number>(30); // Coordinate preview

  // Sandbox current stars balance
  const [localStars, setLocalStars] = useState(starsBalance);
  const [errorNotification, setErrorNotification] = useState<string | null>(null);

  // Auto-clear invalid fund error warnings
  useEffect(() => {
    if (errorNotification) {
      const timer = setTimeout(() => {
        setErrorNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorNotification]);

  // Set default speed/bpm based on difficulty selection for convenience
  const handleDifficultyChange = (diff: Difficulty) => {
    setDifficulty(diff);
    // Suggest standard presets
    switch (diff) {
      case 'EASY':
        setSpeed(12);
        setBpm(130);
        break;
      case 'NORMAL':
        setSpeed(14);
        setBpm(135);
        break;
      case 'HARD':
        setSpeed(15);
        setBpm(140);
        break;
      case 'INSANE':
        setSpeed(16.5);
        setBpm(145);
        break;
      case 'DEMON':
        setSpeed(18);
        setBpm(155);
        break;
    }
  };

  // Helper sizes compatible with WebGL representation
  const getObstacleSpec = (type: ObstacleType) => {
    switch (type) {
      case 'SPIKE': return { w: 1, h: 1, d: 1 };
      case 'DOUBLE_SPIKE': return { w: 2, h: 1, d: 1 };
      case 'TRIPLE_SPIKE': return { w: 3, h: 1, d: 1 };
      case 'BLOCK': return { w: 3, h: 1, d: 1 };
      case 'ORB_YELLOW': return { w: 1, h: 1, d: 1 };
      case 'PAD_YELLOW': return { w: 1, h: 0.2, d: 1 };
      case 'PORTAL_GRAVITY_UP': return { w: 1, h: 3.5, d: 1 };
      case 'PORTAL_GRAVITY_DOWN': return { w: 1, h: 3.5, d: 1 };
      case 'PORTAL_SPEED_1X': return { w: 1, h: 3.5, d: 1 };
      case 'PORTAL_SPEED_2X': return { w: 1, h: 3.5, d: 1 };
      case 'STAR': return { w: 1, h: 1, d: 1 };
      case 'POWERUP_DOUBLE_JUMP': return { w: 1, h: 1, d: 1 };
      case 'POWERUP_SPEED_BOOST': return { w: 1, h: 1, d: 1 };
      default: return { w: 1, h: 1, d: 1 };
    }
  };

  // Quick obstacle adder
  const handleAddObstacle = (type: ObstacleType, customX?: number, customY?: number) => {
    const cost = OBSTACLE_COSTS[type] || 0;
    if (localStars < cost) {
      const typeClean = type.replace(/_/g, ' ');
      if (language === 'DE') {
        setErrorNotification(`NICHT GENUG STERNE! Das Platzieren von "${typeClean}" kostet ${cost} Sterne (Du hast nur ${localStars}).`);
      } else if (language === 'ES') {
        setErrorNotification(`¡ESTRELLAS INSUFICIENTES! Colocar "${typeClean}" cuesta ${cost} estrellas (tienes ${localStars}).`);
      } else if (language === 'FR') {
        setErrorNotification(`ÉTOILES INSUFFISANTES! Placer "${typeClean}" coûte ${cost} étoiles (vous en avez ${localStars}).`);
      } else {
        setErrorNotification(`INSUFFICIENT STARS! Placing "${typeClean}" requires ${cost} Stars (You have ${localStars}).`);
      }
      return;
    }

    const spec = getObstacleSpec(type);
    const resolvedX = customX !== undefined ? customX : nextX;
    const resolvedY = customY !== undefined ? customY : 0;

    const newObstacle: Obstacle = {
      id: `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type,
      x: Math.round(resolvedX),
      y: resolvedY,
      width: spec.w,
      height: spec.h,
      depth: spec.d,
    };

    setLocalStars(prev => prev - cost);
    setObstacles(prev => {
      // Keep sorted by X position
      const nextList = [...prev, newObstacle];
      return nextList.sort((a, b) => a.x - b.x);
    });

    // Advance placement recommendations
    if (customX === undefined) {
      setNextX(prev => prev + 15);
    }
    setErrorNotification(null);
  };

  // Manage individual item updates
  const handleUpdateObstacleX = (id: string, xVal: number) => {
    setObstacles(prev =>
      prev.map(o => o.id === id ? { ...o, x: Math.max(10, Math.round(xVal)) } : o)
          .sort((a, b) => a.x - b.x)
    );
  };

  const handleUpdateObstacleY = (id: string, yVal: number) => {
    setObstacles(prev =>
      prev.map(o => o.id === id ? { ...o, y: Math.max(0, parseFloat(yVal.toFixed(1))) } : o)
    );
  };

  const handleDeleteObstacle = (id: string) => {
    const obstacleToDelete = obstacles.find(o => o.id === id);
    if (obstacleToDelete) {
      const refund = OBSTACLE_COSTS[obstacleToDelete.type] || 0;
      setLocalStars(prev => prev + refund);
    }
    setObstacles(prev => prev.filter(o => o.id !== id));
  };

  const handleClearAll = () => {
    const totalRefund = obstacles.reduce((sum, o) => sum + (OBSTACLE_COSTS[o.type] || 0), 0);
    setLocalStars(prev => prev + totalRefund);
    setObstacles([]);
    setNextX(30);
  };

  // Auto-Generate a rhythm track based on parameters spending stars safely
  const handleAutoGenerate = () => {
    const generated: Obstacle[] = [];
    let cur = 25;
    const endPos = length - 30;
    let estimatedCost = 0;

    while (cur < endPos) {
      // Spacing depends on speed & difficulty
      const minSpacing = difficulty === 'DEMON' ? 10 : difficulty === 'EASY' ? 15 : 12;
      const spacingRand = 8 + Math.random() * 12;
      cur += Math.round(minSpacing + spacingRand);

      if (cur > endPos) break;

      const seed = Math.random();
      let type: ObstacleType | null = null;
      let hVal = 1;
      
      if (seed < 0.25) {
        // Spikes sequence
        const sub = Math.random();
        if (sub < 0.4) {
          type = 'SPIKE';
        } else if (sub < 0.75) {
          type = 'DOUBLE_SPIKE';
        } else {
          type = 'TRIPLE_SPIKE';
        }
      } else if (seed < 0.50) {
        // Block step climbs
        type = 'BLOCK';
        hVal = Math.random() < 0.6 ? 1 : 2;
      } else if (seed < 0.70) {
        // Yellow bounce pad
        type = 'PAD_YELLOW';
      } else if (seed < 0.85) {
        // Yellow jump orb
        type = 'ORB_YELLOW';
      } else {
        // Gravity Portal
        type = 'PORTAL_GRAVITY_UP';
      }

      const cost = OBSTACLE_COSTS[type];
      if (estimatedCost + cost <= localStars + obstacles.reduce((sum, o) => sum + (OBSTACLE_COSTS[o.type] || 0), 0)) {
        estimatedCost += cost;
        const spec = getObstacleSpec(type);
        generated.push({ 
          id: `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}-${cur}`, 
          type, 
          x: cur, 
          y: type === 'PORTAL_GRAVITY_UP' ? 1 : 0, 
          width: spec.w, 
          height: type === 'BLOCK' ? hVal : spec.h, 
          depth: spec.d 
        });

        // star occasionally on peak
        if (Math.random() < 0.4 && type !== 'PORTAL_GRAVITY_UP') {
          const starCost = OBSTACLE_COSTS['STAR'];
          if (estimatedCost + starCost <= localStars + obstacles.reduce((sum, o) => sum + (OBSTACLE_COSTS[o.type] || 0), 0)) {
            estimatedCost += starCost;
            generated.push({ 
              id: `STAR-${Date.now()}-${cur}`, 
              type: 'STAR', 
              x: cur + (type === 'BLOCK' ? 1.5 : 1), 
              y: type === 'BLOCK' ? hVal + 1.5 : 2.2, 
              width: 1, 
              height: 1, 
              depth: 1 
            });
          }
        }
      } else {
        break; // Out of budget
      }
    }

    const currentObstaclesCost = obstacles.reduce((sum, o) => sum + (OBSTACLE_COSTS[o.type] || 0), 0);
    const baseStarsPool = localStars + currentObstaclesCost;

    if (generated.length === 0) {
      if (language === 'DE') {
        setErrorNotification(`NICHT GENUG STERNE! Das automatische Generieren benötigt mindestens 4-5 Sterne.`);
      } else {
        setErrorNotification(`INSUFFICIENT STARS! Auto-generation requires at least 4-5 Stars to start.`);
      }
      return;
    }

    if (estimatedCost <= baseStarsPool) {
      setLocalStars(baseStarsPool - estimatedCost);
      setObstacles(generated);
      if (generated.length > 0) {
        setNextX(generated[generated.length - 1].x + 15);
      }
      setErrorNotification(null);
    } else {
      if (language === 'DE') {
        setErrorNotification(`NICHT GENUG STERNE! Diese Generierung kostet ${estimatedCost} Sterne, du hast jedoch nur ${baseStarsPool} Sterne.`);
      } else {
        setErrorNotification(`INSUFFICIENT STARS! This auto-generated map costs ${estimatedCost} Stars, but you only have ${baseStarsPool} Stars.`);
      }
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;

    // Count stars available in obstacles list
    const starsCount = obstacles.filter(o => o.type === 'STAR').length;

    const newLevel: Level = {
      id: editingLevel?.id || `custom_${Date.now()}`,
      name: name.trim(),
      difficulty,
      speed: Number(speed),
      color,
      bpm: Number(bpm),
      obstacles,
      length: Number(length),
      starsAvailable: starsCount || 3, // fallback default
    };

    onSave(newLevel, localStars);
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto p-4 sm:p-8 flex items-center justify-center backdrop-blur-lg">
      <div className="w-full max-w-5xl bg-[#080808] border-2 border-[#00FF95]/30 shadow-[0_0_50px_rgba(0,255,149,0.15)] flex flex-col relative text-white">
        
        {/* Glow corner line decoration */}
        <div className="absolute top-0 left-0 w-32 h-1 bg-[#00FF95] shadow-[0_0_10px_#00FF95]"></div>
        <div className="absolute top-0 right-0 p-4">
          <button 
            onClick={onClose}
            className="p-2 border border-white/20 hover:border-[#00FF95] text-white hover:text-[#00FF95] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title HUD Header */}
        <div className="p-8 pb-3 border-b border-white/5 flex flex-col">
          <span className="text-[#00FF95] font-mono text-xs tracking-widest uppercase mb-1 font-bold">
            {language === 'DE' ? 'CYBER-ENGINE EIGENE TRANCHE' : 'CYBER ENGINE CUSTOM MAPS'}
          </span>
          <h1 className="text-4xl font-black tracking-tighter leading-none italic uppercase">
            {editingLevel 
              ? (language === 'DE' ? 'LEVEL BEARBEITEN' : 'EDIT CUSTOM LEVEL') 
              : (language === 'DE' ? 'LEVEL ENTWERFEN' : 'DESIGN LEVEL')}
          </h1>
        </div>

        {/* Warning Notification Banner */}
        {errorNotification && (
          <div className="bg-red-500/10 border-b border-red-500/30 px-8 py-3.5 text-red-400 font-mono text-xs font-bold tracking-wider uppercase flex items-center justify-between animate-pulse">
            <span className="flex items-center gap-2">⚠️ {errorNotification}</span>
            <button onClick={() => setErrorNotification(null)} className="hover:text-white transition-colors cursor-pointer select-none border border-red-500/30 px-2 py-0.5 rounded text-[10px]">
              {language === 'DE' ? 'SCHLIESSEN' : 'DISMISS'}
            </button>
          </div>
        )}

        <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Metadata config form (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6 border-r border-white/5 pr-0 lg:pr-8">
            <h2 className="text-lg font-black tracking-tighter uppercase italic text-zinc-300">
              {language === 'DE' ? 'Level-Parameter' : 'Level Parameters'}
            </h2>
            
            {/* Level Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                {language === 'DE' ? 'Level-Name' : 'Map Title'}
              </label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                maxLength={32}
                className="bg-white/5 border border-white/10 px-4 py-3 font-bold text-white uppercase italic focus:border-[#00FF95] outline-none transition-all font-sans"
              />
            </div>

            {/* Difficulty Tabs */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold font-sans">
                {language === 'DE' ? 'Schwierigkeitsgrad' : 'Difficulty Preset'}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 font-mono">
                {(['EASY', 'NORMAL', 'HARD', 'INSANE', 'DEMON'] as Difficulty[]).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => handleDifficultyChange(diff)}
                    className={`py-1.5 border hover:border-white/40 font-black text-[9px] tracking-wider uppercase transition-all cursor-pointer ${
                      difficulty === diff 
                        ? 'bg-[#00FF95] text-black border-[#00FF95] font-black' 
                        : 'bg-transparent text-zinc-400 border-white/10'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            {/* Speed & BPM Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold font-sans">
                  {language === 'DE' ? 'Tempo' : 'Speed'} ({speed}x)
                </label>
                <input 
                  type="range" 
                  min={10} 
                  max={22} 
                  step={0.5} 
                  value={speed} 
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full accent-[#00FF95] bg-white/10 h-1 rounded" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold font-sans">
                  Synth BPM ({bpm})
                </label>
                <input 
                  type="range" 
                  min={100} 
                  max={180} 
                  step={5} 
                  value={bpm} 
                  onChange={(e) => setBpm(Number(e.target.value))}
                  className="w-full accent-[#00FF95] bg-white/10 h-1 rounded" 
                />
              </div>
            </div>

            {/* Neon Theme color picker */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                {language === 'DE' ? 'Ambientes Leuchten' : 'Ambient Light Beam'}
              </label>
              <div className="flex gap-2 flex-wrap pt-1">
                {PRESET_COLORS.map(c => (
                  <button
                    key={c.hex}
                    onClick={() => setColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                    className={`w-8 h-8 cursor-pointer transition-transform relative ${
                      color === c.hex ? 'scale-110 ring-2 ring-white' : 'hover:scale-105 opacity-80'
                    }`}
                  >
                    {color === c.hex && (
                      <div className="absolute inset-0 bg-black/15 flex items-center justify-center font-bold text-[10px]">✔</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Length */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                {language === 'DE' ? 'Level-Länge' : 'Level Length'} ({length} {language === 'DE' ? 'Meter' : 'meters'})
              </label>
              <input 
                type="range" 
                min={100} 
                max={1000} 
                step={50} 
                value={length} 
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full accent-[#00FF95] bg-white/10 h-1 rounded" 
              />
              <span className="text-[9px] text-zinc-500 font-semibold font-mono uppercase">
                {language === 'DE' ? 'GESCHÄTZTE RUN-DAUER: ' : 'ESTIMATED RUN TIME: '} 
                <span className="text-zinc-300">{Math.round(length / speed)} {language === 'DE' ? 'SEKUNDEN' : 'SECONDS'}</span>
              </span>
            </div>

            <div className="pt-4 border-t border-white/5 flex flex-col gap-1">
              <button
                onClick={handleAutoGenerate}
                className="w-full py-3 border border-[#00FF95] text-[#00FF95] hover:bg-[#00FF95] hover:text-black font-black text-xs uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,149,0.1)] active:scale-95"
              >
                <Sparkles className="w-4 h-4 animate-spin-slow" />
                {language === 'DE' ? 'ZUFÄLLIG BEFÜLLEN (Sterne)' : 'Auto-Generate Spikes'}
              </button>
              <span className="text-[8px] font-mono font-bold text-center text-zinc-500 uppercase tracking-widest mt-1">
                {language === 'DE' ? 'Zieht Sterne basierend auf gesetzten Elementen ab!' : 'Uses available stars dynamically from your balance!'}
              </span>
            </div>

          </div>

          {/* RIGHT: Obstacles Creator (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="bg-[#00FF95]/10 border border-[#00FF95]/40 px-3 py-1 flex items-center gap-2 rounded shadow-[0_0_10px_rgba(0,255,149,0.1)]">
                  <Star className="w-3.5 h-3.5 text-[#00FF95] fill-current animate-pulse md:scale-100 scale-90" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.15em] text-[#00FF95] font-black flex items-center gap-1">
                    {language === 'DE' ? 'STERNE' : 'STARS'}: 
                    <span className="text-xs font-black text-white ml-0.5 drop-shadow-[0_0_5px_#00FF95]">{localStars}</span>
                  </span>
                </div>
                <h2 className="text-sm font-black tracking-tight uppercase text-zinc-400 hidden sm:block font-mono">
                  {language === 'DE' ? 'ELEMENTE' : 'ELEMENTS'} ({obstacles.length})
                </h2>
              </div>
              
              {obstacles.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-red-500 hover:text-red-400 uppercase tracking-wider font-extrabold transition-colors cursor-pointer flex items-center gap-1 select-none font-mono"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {language === 'DE' ? 'ALLE ENTFERNEN' : 'Clear All'}
                </button>
              )}
            </div>

            {/* Quick adding buttons tray */}
            <div className="bg-black/40 border border-white/10 p-4 relative overflow-hidden">
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest mb-3 block">
                {language === 'DE' ? 'ELEMENT AUSWÄHLEN (Bauen bei' : 'Tap element to insert at'} {nextX}m):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 font-mono">
                {(['SPIKE', 'DOUBLE_SPIKE', 'TRIPLE_SPIKE', 'BLOCK', 'ORB_YELLOW', 'PAD_YELLOW', 'PORTAL_GRAVITY_UP', 'PORTAL_GRAVITY_DOWN', 'PORTAL_SPEED_1X', 'PORTAL_SPEED_2X', 'STAR', 'POWERUP_DOUBLE_JUMP', 'POWERUP_SPEED_BOOST'] as ObstacleType[]).map((type) => {
                  const affordable = localStars >= (OBSTACLE_COSTS[type] || 0);
                  const cost = OBSTACLE_COSTS[type] || 0;
                  return (
                    <button
                      key={type}
                      onClick={() => handleAddObstacle(type)}
                      className={`p-2 border transition-all cursor-pointer flex flex-col items-center justify-between min-h-[56px] rounded-sm group relative overflow-hidden select-none active:scale-95 ${
                        affordable
                          ? 'bg-zinc-900 border-white/10 hover:border-[#00FF95]/70 hover:bg-[#00FF95]/5 text-zinc-200 hover:text-[#00FF95]'
                          : 'bg-zinc-950/40 border-red-500/10 text-zinc-650 cursor-not-allowed'
                      }`}
                      title={`${type.replace(/_/g, ' ')} - Cost: ${cost} Stars`}
                    >
                      <span className="text-[8px] font-bold tracking-tight uppercase text-center block leading-tight truncate w-full">
                        {type.replace(/_/g, ' ')}
                      </span>
                      <span className={`text-[9px] font-mono font-black flex items-center gap-0.5 mt-1 px-1.5 py-0.5 rounded leading-none ${
                        affordable
                          ? 'bg-[#00FF95]/10 text-[#00FF95] group-hover:bg-[#00FF95] group-hover:text-black font-extrabold'
                          : 'bg-red-500/5 text-red-500/70 border border-red-500/10'
                      }`}>
                        <Star className="w-2.5 h-2.5 fill-current" />
                        {cost}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex items-center gap-3 border-t border-white/5 pt-3">
                <span className="text-[10px] font-mono text-zinc-400">Position offset:</span>
                <input 
                  type="range"
                  min={15}
                  max={length - 20}
                  value={nextX}
                  onChange={(e) => setNextX(Number(e.target.value))}
                  className="flex-1 accent-[#00FF95] bg-white/10 h-1 rounded cursor-pointer"
                />
                <span className="text-xs font-mono text-white font-bold">{nextX}m</span>
              </div>
            </div>

            {/* Element Rows Table */}
            <div className="border border-white/10 max-h-[280px] overflow-y-auto bg-black/20">
              {obstacles.length === 0 ? (
                <div className="py-12 p-6 text-center flex flex-col items-center justify-center gap-2">
                  <span className="text-zinc-600 text-xs font-semibold uppercase font-mono tracking-widest">
                    {language === 'DE' ? 'Keine Elemente konfiguriert' : 'No elements configured'}
                  </span>
                  <p className="text-xxs text-zinc-500 max-w-xs leading-relaxed font-mono">
                    {language === 'DE' 
                      ? 'Klicke auf "ZUFÄLLIG BEFÜLLEN" um ein rhythmisches Spikes-Layout zu bauen, oder platziere manuell Spikes und Schwerkraftportale, solange dein Sternenstand reicht!' 
                      : 'Click "Auto-Generate Spikes" to make a quick synchronized layout, or tap individual elements to manually place spikes and gravity pads!'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5 font-mono">
                  {obstacles.map((o) => (
                    <div key={o.id} className="p-2.5 px-3 flex items-center justify-between gap-4 text-xs font-mono bg-black/15 hover:bg-white/[0.01] transition-all">
                      <div className="flex items-center gap-2.5">
                        <span className="bg-[#00FF95]/10 text-[#00FF95] border border-[#00FF95]/30 font-bold px-2 py-0.5 text-[9px] uppercase tracking-wide">
                          {o.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-zinc-500 flex items-center gap-0.5 bg-zinc-900 border border-white/5 px-1 py-0.2">
                          Refund: +{OBSTACLE_COSTS[o.type] || 0} ⭐
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <span className="text-zinc-500 text-[10px] uppercase font-bold">X:</span>
                          <input 
                            type="number" 
                            value={o.x} 
                            min={10}
                            max={length}
                            onChange={(e) => handleUpdateObstacleX(o.id, Number(e.target.value))}
                            className="bg-white/5 text-center font-bold py-0.5 w-14 border border-white/10 focus:border-[#00FF95] outline-none text-xxs"
                          />
                          <span className="text-[9px] text-zinc-500">m</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-zinc-500 text-[10px] uppercase font-bold">Y:</span>
                          <input 
                            type="number" 
                            step={0.5}
                            value={o.y} 
                            min={0}
                            max={10}
                            onChange={(e) => handleUpdateObstacleY(o.id, Number(e.target.value))}
                            className="bg-white/5 text-center font-bold py-0.5 w-10 border border-white/10 focus:border-[#00FF95] outline-none text-xxs"
                          />
                          <span className="text-[9px] text-zinc-500">m</span>
                        </div>

                        <button 
                          onClick={() => handleDeleteObstacle(o.id)}
                          className="p-1 hover:text-red-500 text-zinc-500 hover:bg-red-500/10 transition-colors cursor-pointer select-none rounded"
                          title="Delete Obstacle (Refund Stars)"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Footer controls */}
        <div className="p-8 border-t border-white/5 bg-black/40 flex justify-between items-center flex-wrap gap-4 font-mono">
          <div className="flex flex-col gap-0.5">
            <span className="text-[#00FF95] font-black text-sm uppercase">Verification Checklist</span>
            <span className="text-xs text-zinc-400">
              Length: {length}m | Obstacles: {obstacles.length} | Available Stars: {obstacles.filter(o => o.type === 'STAR').length}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-white/10 hover:bg-white/5 text-zinc-400 text-xs font-black tracking-widest uppercase transition-all cursor-pointer"
            >
              {language === 'DE' ? 'Abbrechen' : 'Cancel'}
            </button>
            <button
              onClick={handleSave}
              disabled={obstacles.length === 0}
              className={`px-8 py-3 font-black text-xs tracking-widest uppercase transition-all cursor-pointer flex items-center gap-1.5 leading-none ${
                obstacles.length > 0 
                  ? 'bg-[#00FF95] text-black border-2 border-[#00FF95] shadow-[0_0_15px_rgba(0,255,149,0.3)] hover:shadow-[0_0_25px_#00FF95]' 
                  : 'bg-zinc-800 text-zinc-500 border border-zinc-800 cursor-not-allowed opacity-50'
              }`}
            >
              <Save className="w-4 h-4" />
              {language === 'DE' ? 'Level speichern' : 'Save Level'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
