import React, { useState, useEffect } from 'react';
import { Level, LeaderboardEntry } from '../types';
import { Trophy, Clock, User, Award, RefreshCw, Trash2, ArrowUpRight, Check } from 'lucide-react';
import { useLanguage } from '../utils/translations';
import { motion } from 'motion/react';

interface LeaderboardProps {
  activeLevel: Level;
  bestAttempts: Record<string, number>;
  completedPercentages: Record<string, number>;
}

const DEFAULT_LEADERBOARDS: Record<string, LeaderboardEntry[]> = {
  stereo_madness: [
    { id: 'bot_1', playerName: 'Michigun ▲▲▲', percentage: 100, timeSeconds: 17.82, date: '2026-05-12', isPractice: false },
    { id: 'bot_2', playerName: 'Riot', percentage: 100, timeSeconds: 18.45, date: '2026-06-01', isPractice: false },
    { id: 'bot_3', playerName: 'Viprin', percentage: 100, timeSeconds: 19.12, date: '2026-06-03', isPractice: false },
    { id: 'bot_4', playerName: 'Zobros', percentage: 88, timeSeconds: 16.20, date: '2026-06-08', isPractice: false },
    { id: 'bot_5', playerName: 'cyclic', percentage: 74, timeSeconds: 13.50, date: '2026-06-09', isPractice: false },
  ],
  back_on_track: [
    { id: 'bot_1', playerName: 'Michigun ▲▲▲', percentage: 100, timeSeconds: 18.10, date: '2026-05-15', isPractice: false },
    { id: 'bot_2', playerName: 'Spaceuk', percentage: 100, timeSeconds: 18.90, date: '2026-05-20', isPractice: false },
    { id: 'bot_3', playerName: 'Mefewe', percentage: 95, timeSeconds: 17.40, date: '2026-05-30', isPractice: false },
    { id: 'bot_4', playerName: 'Sunix', percentage: 80, timeSeconds: 14.80, date: '2026-06-04', isPractice: false },
    { id: 'bot_5', playerName: 'Evw', percentage: 65, timeSeconds: 11.20, date: '2026-06-05', isPractice: false },
  ],
  polargeist: [
    { id: 'bot_1', playerName: 'Riot', percentage: 100, timeSeconds: 19.85, date: '2026-05-10', isPractice: false },
    { id: 'bot_2', playerName: 'Michigun ▲▲▲', percentage: 100, timeSeconds: 20.40, date: '2026-05-11', isPractice: false },
    { id: 'bot_3', playerName: 'Technical', percentage: 100, timeSeconds: 21.05, date: '2026-05-18', isPractice: false },
    { id: 'bot_4', playerName: 'Nexus', percentage: 90, timeSeconds: 18.50, date: '2026-05-22', isPractice: false },
    { id: 'bot_5', playerName: 'Partition', percentage: 75, timeSeconds: 15.10, date: '2026-06-02', isPractice: false },
  ],
  clutterfunk: [
    { id: 'bot_1', playerName: 'Spaceuk', percentage: 100, timeSeconds: 24.12, date: '2026-05-14', isPractice: false },
    { id: 'bot_2', playerName: 'Michigun ▲▲▲', percentage: 92, timeSeconds: 22.80, date: '2026-05-18', isPractice: false },
    { id: 'bot_3', playerName: 'Riot', percentage: 84, timeSeconds: 20.10, date: '2026-05-28', isPractice: false },
    { id: 'bot_4', playerName: 'GuitarHeroStyles', percentage: 72, timeSeconds: 17.50, date: '2026-06-01', isPractice: false },
    { id: 'bot_5', playerName: 'Mulpan', percentage: 55, timeSeconds: 13.90, date: '2026-06-03', isPractice: false },
  ],
  demon_fortress: [
    { id: 'bot_1', playerName: 'Zoink', percentage: 100, timeSeconds: 28.52, date: '2026-05-22', isPractice: false },
    { id: 'bot_2', playerName: 'Spaceuk', percentage: 100, timeSeconds: 30.15, date: '2026-05-25', isPractice: false },
    { id: 'bot_3', playerName: 'Trick', percentage: 95, timeSeconds: 29.10, date: '2026-05-29', isPractice: false },
    { id: 'bot_4', playerName: 'Michigun ▲▲▲', percentage: 80, timeSeconds: 24.50, date: '2026-06-01', isPractice: false },
    { id: 'bot_5', playerName: 'Riot', percentage: 61, timeSeconds: 18.20, date: '2026-06-08', isPractice: false },
  ],
  endless: [
    { id: 'bot_1', playerName: 'Zoink', percentage: 100, timeSeconds: 45.20, date: '2026-05-20', isPractice: false },
    { id: 'bot_2', playerName: 'wpopoff', percentage: 100, timeSeconds: 52.80, date: '2026-05-26', isPractice: false },
    { id: 'bot_3', playerName: 'Sunix', percentage: 85, timeSeconds: 40.10, date: '2026-05-27', isPractice: false },
    { id: 'bot_4', playerName: 'Evw', percentage: 70, timeSeconds: 32.50, date: '2026-06-02', isPractice: false },
    { id: 'bot_5', playerName: 'Michigun ▲▲▲', percentage: 52, timeSeconds: 25.10, date: '2026-06-07', isPractice: false },
  ]
};

export default function Leaderboard({ activeLevel, bestAttempts, completedPercentages }: LeaderboardProps) {
  const { language } = useLanguage();
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem('gd3d_player_name') || 'CYBER_RUNNER';
  });
  
  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>(() => {
    const stored = localStorage.getItem('gd3d_leaderboards');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Failed parsing leaderboards', e);
      }
    }
    return DEFAULT_LEADERBOARDS;
  });

  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(playerName);

  useEffect(() => {
    localStorage.setItem('gd3d_leaderboards', JSON.stringify(leaderboards));
  }, [leaderboards]);

  const handleSavePlayerName = () => {
    const trimmed = tempName.trim().toUpperCase().replace(/\s+/g, '_');
    if (trimmed) {
      setPlayerName(trimmed);
      localStorage.setItem('gd3d_player_name', trimmed);
      setEditingName(false);
    }
  };

  const handleClearScores = () => {
    const confirmText = language === 'DE' 
      ? 'Möchtest du wirklich alle Bestenlisten zurücksetzen?' 
      : 'Are you sure you want to reset all score data?';
    if (window.confirm(confirmText)) {
      setLeaderboards(DEFAULT_LEADERBOARDS);
    }
  };

  const getEntriesForLevel = (levelId: string): LeaderboardEntry[] => {
    const raw = leaderboards[levelId] || [];
    // Sort logic: 
    // 1st Priority: Completion Percentage (higher is better)
    // 2nd Priority: Completion Time (for same percentage, faster time is better, unless percentage < 100 where higher time might mean they survived longer/further. Actually, standard geometry dash speed is constant, so higher percentage always equals higher time or distance. If both 100%, lower time is faster/better).
    return [...raw].sort((a, b) => {
      if (b.percentage !== a.percentage) {
        return b.percentage - a.percentage;
      }
      // If both are 100%, faster time (lower) is better
      if (a.percentage === 100) {
        return a.timeSeconds - b.timeSeconds;
      }
      // Otherwise, larger time/distance is slightly better, or just standard
      return b.timeSeconds - a.timeSeconds;
    }).slice(0, 5);
  };

  const currentEntries = getEntriesForLevel(activeLevel.id);

  // Translation helpers in-component
  const tLabels = {
    title: language === 'DE' ? 'LEVEL-BESTENLISTE' : 'NEURAL RUN LEADERBOARD',
    subtitle: language === 'DE' ? 'DIE TOP 5 CYBER-LÄUFER' : 'TOP 5 COMPLETED COMMITS',
    playerName: language === 'DE' ? 'NAME' : 'RUNNER',
    rank: language === 'DE' ? 'RANG' : 'RANK',
    progress: language === 'DE' ? 'FORTSCHRITT' : 'PERCENT',
    time: language === 'DE' ? 'DAUER' : 'SPEED TIME',
    attempts: language === 'DE' ? 'Versuche' : 'Attempts',
    personalBest: language === 'DE' ? 'Persönlicher Rekord' : 'Personal Record',
    editName: language === 'DE' ? 'Ändern' : 'Change Name',
    save: language === 'DE' ? 'OK' : 'SAVE',
    noRecords: language === 'DE' ? 'Bisher keine Läufe aufgezeichnet!' : 'No neuro-runs recorded for this level yet!',
    syncText: language === 'DE' ? 'Synchronisiert mit aktuellem Level' : 'Synced with selected run profile',
    resetBtn: language === 'DE' ? 'ZURÜCKSETZEN' : 'HARD RESET',
  };

  return (
    <div id="leaderboard-card-container" className="flex flex-col h-full bg-[#070708]/90 border-2 border-[#00FF95]/20 shadow-[0_0_30px_rgba(0,255,149,0.04)] relative overflow-hidden backdrop-blur-md">
      
      {/* Visual cyber decoration */}
      <div className="absolute top-0 right-0 w-24 h-1 bg-gradient-to-r from-transparent to-[#00FF95]" />
      
      {/* Header Panel */}
      <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950/40 select-none">
        
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-[#00FF95] animate-pulse drop-shadow-[0_0_6px_#00FF95]" />
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#00FF95] font-black uppercase">
              {tLabels.title}
            </span>
          </div>
          <h2 className="text-xl font-sans font-black tracking-tight uppercase italic text-white flex items-center gap-2">
            <span>{activeLevel.name}</span>
            <span className="text-xs font-mono font-bold not-italic px-1.5 py-0.2 border border-white/10 text-zinc-500 rounded">
              {activeLevel.difficulty}
            </span>
          </h2>
        </div>

        {/* Sync Indicator */}
        <div className="flex flex-col items-start sm:items-end font-mono">
          <span className="text-[8px] tracking-wider text-zinc-500 font-bold uppercase">{tLabels.syncText}</span>
          <span className="text-[10px] text-zinc-300 font-bold flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF95] animate-ping" />
            LIVE RADAR
          </span>
        </div>

      </div>

      {/* Main Core: Rankings rows list */}
      <div className="flex-1 p-5 flex flex-col justify-between gap-4 font-mono">
        
        <div className="flex flex-col gap-2">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-2 text-[9px] font-bold text-zinc-500 uppercase tracking-widest px-3 select-none pb-1 border-b border-white/5">
            <div className="col-span-2 text-center">{tLabels.rank}</div>
            <div className="col-span-4">{tLabels.playerName}</div>
            <div className="col-span-3 text-right">{tLabels.progress}</div>
            <div className="col-span-3 text-right">{tLabels.time}</div>
          </div>

          {/* Ranking Rows */}
          {currentEntries.length === 0 ? (
            <div className="py-10 text-center text-xs text-zinc-500 font-bold border border-dashed border-white/5 bg-white/[0.01]">
              {tLabels.noRecords}
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {currentEntries.map((entry, index) => {
                const isPlayer = entry.playerName === playerName;
                const isGold = index === 0;
                const isSilver = index === 1;
                const isBronze = index === 2;
                
                // Styling per rank
                let rowBg = 'bg-zinc-950/20 hover:bg-white/[0.01] border-white/5';
                let rankColor = 'text-zinc-400 bg-zinc-900 border-white/10';
                if (isPlayer) {
                  rowBg = 'bg-[#00FF95]/5 border-[#00FF95]/20 hover:bg-[#00FF95]/10';
                }
                
                if (isGold) {
                  rankColor = 'bg-yellow-500 text-black border-yellow-400 font-black shadow-[0_0_8px_rgba(234,179,8,0.4)]';
                } else if (isSilver) {
                  rankColor = 'bg-cyan-500 text-black border-cyan-400 font-black shadow-[0_0_8px_rgba(6,182,212,0.4)]';
                } else if (isBronze) {
                  rankColor = 'bg-amber-600 text-white border-amber-500 font-black';
                }

                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`grid grid-cols-12 gap-2 py-2 px-3 border items-center rounded-sm transition-all text-xs font-mono select-none ${rowBg}`}
                  >
                    {/* Rank Badge */}
                    <div className="col-span-2 flex justify-center">
                      <span className={`w-5 h-5 flex items-center justify-center text-[10px] rounded-full border ${rankColor}`}>
                        {index + 1}
                      </span>
                    </div>

                    {/* Runner Name */}
                    <div className="col-span-4 font-bold flex items-center gap-1 text-zinc-200 truncate">
                      {isPlayer && <span className="text-[#00FF95] text-[10px]" title="You">▶</span>}
                      <span className={isPlayer ? "text-[#00FF95] font-black" : ""}>
                        {entry.playerName}
                      </span>
                    </div>

                    {/* Progress Bar / Percentage */}
                    <div className="col-span-3 text-right flex items-center justify-end gap-2">
                      <div className="w-12 bg-zinc-900 h-1.5 rounded-full overflow-hidden hidden sm:block border border-white/5">
                        <div 
                          className={`h-full ${entry.percentage === 100 ? 'bg-gradient-to-r from-emerald-500 to-[#00FF95]' : 'bg-zinc-600'}`}
                          style={{ width: `${entry.percentage}%` }}
                        />
                      </div>
                      <span className={`font-black ${entry.percentage === 100 ? 'text-[#00FF95] drop-shadow-[0_0_8px_#00FF95]' : 'text-zinc-300'}`}>
                        {entry.percentage}%
                      </span>
                    </div>

                    {/* Completion Time */}
                    <div className="col-span-3 text-right text-zinc-400 font-bold flex items-center justify-end gap-1">
                      <Clock className="w-3 h-3 text-zinc-600 inline" />
                      <span>{entry.timeSeconds.toFixed(2)}s</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Profile / High Score configuration HUD row */}
        <div className="border-t border-white/5 pt-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
          
          {/* Runner Identifier Setup */}
          <div className="flex-1 flex items-center gap-3 bg-black/40 border border-white/10 p-2 px-3 rounded-md">
            <User className="w-4 h-4 text-cyan-400 shrink-0" />
            <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
              {editingName ? (
                <div className="flex items-center gap-2 w-full">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value.substring(0, 15))}
                    placeholder="NAME"
                    maxLength={15}
                    className="bg-white/5 font-black text-xs text-[#00FF95] uppercase italic focus:outline-none border-b border-[#00FF95] w-28 px-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSavePlayerName();
                      if (e.key === 'Escape') setEditingName(false);
                    }}
                    autoFocus
                  />
                  <button 
                    onClick={handleSavePlayerName}
                    className="p-1 text-[#00FF95] hover:bg-[#00FF95]/10 border border-[#00FF95]/30 rounded text-[9px] font-black cursor-pointer flex items-center gap-0.5"
                  >
                    <Check className="w-2.5 h-2.5" />
                    {tLabels.save}
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col min-w-0 select-none">
                    <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-[0.15em]">MY PILOT LOG</span>
                    <span className="text-xs font-black text-cyan-300 tracking-wider truncate">{playerName}</span>
                  </div>
                  <button
                    onClick={() => {
                      setTempName(playerName);
                      setEditingName(true);
                    }}
                    className="text-[9px] font-bold text-zinc-500 hover:text-[#00FF95] uppercase border border-white/10 px-2 py-1 rounded hover:bg-white/5 select-none transition-all cursor-pointer"
                  >
                    {tLabels.editName}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Score Stats / Reset Controller */}
          <div className="flex gap-2 shrink-0 justify-end">
            <button
              onClick={handleClearScores}
              className="text-[9px] font-mono text-center font-bold tracking-widest text-zinc-600 hover:text-red-500 border border-white/5 px-2.5 py-1.5 rounded hover:bg-red-500/10 hover:border-red-500/20 transition-all cursor-pointer select-none"
              title="Reset records to default bots"
            >
              <Trash2 className="w-3.5 h-3.5 inline mr-1" />
              {tLabels.resetBtn}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
