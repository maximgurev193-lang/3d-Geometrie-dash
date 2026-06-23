/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GameState, CameraMode, Level, Skin, Checkpoint, PlayerStats, LeaderboardEntry } from './types';
import { PREDEFINED_LEVELS, generateEndlessLevel } from './utils/levels';
import { GameAudio } from './utils/audio';
import GameCanvas from './components/GameCanvas';
import LevelSelector from './components/LevelSelector';
import SkinSelector from './components/SkinSelector';
import Leaderboard from './components/Leaderboard';
import DailyMissions, { DailyMission } from './components/DailyMissions';
import CustomLevelCreator from './components/CustomLevelCreator';
import GameUI from './components/GameUI';
import AIHelperCompanion from './components/AIHelperCompanion';
import GameSavesAndSales from './components/GameSavesAndSales';
import SoundboardControls from './components/SoundboardControls';
import MenuMusicController from './components/MenuMusicController';
import SettingsHud from './components/SettingsHud';
import { Play, Star, Sparkles, Trophy, HelpCircle, Volume2, VolumeX, BarChart3, RotateCcw, Zap, Disc, ChevronRight, Sliders, Globe, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage, Language } from './utils/translations';

const SKINS_LIST: Skin[] = [
  { id: 'default', name: 'Classic Greeny', primaryColor: '#22c55e', secondaryColor: '#eab308', faceType: 'happy', glowColor: '#22c55e', price: 0, unlocked: true },
  { id: 'cyber', name: 'Neon Razer', primaryColor: '#10b981', secondaryColor: '#06b6d4', faceType: 'glowing', glowColor: '#06b6d4', price: 1, unlocked: false },
  { id: 'fury', name: 'Fire Demon', primaryColor: '#ef4444', secondaryColor: '#f97316', faceType: 'angry', glowColor: '#ef4444', price: 3, unlocked: false },
  { id: 'cool', name: 'Ocean Glide', primaryColor: '#3b82f6', secondaryColor: '#8b5cf6', faceType: 'cool', glowColor: '#8b5cf6', price: 5, unlocked: false },
  { id: 'pixel', name: 'Pixel Retro', primaryColor: '#14b8a6', secondaryColor: '#fb923c', faceType: 'retro', glowColor: '#fb923c', price: 8, unlocked: false },
  { id: 'gold', name: 'Golden King', primaryColor: '#fbbf24', secondaryColor: '#d97706', faceType: 'happy', glowColor: '#fbbf24', price: 12, unlocked: false },
  { id: 'shadow', name: 'Shadow Lord', primaryColor: '#030712', secondaryColor: '#a855f7', faceType: 'glowing', glowColor: '#a855f7', price: 16, unlocked: false },
  { id: 'derp', name: 'Derp Runner', primaryColor: '#ec4899', secondaryColor: '#db2777', faceType: 'derp', glowColor: '#ec4899', price: 20, unlocked: false },
  { id: 'cosmic', name: 'Cosmic Void', primaryColor: '#a855f7', secondaryColor: '#f43f5e', faceType: 'cool', glowColor: '#ec4899', price: 25, unlocked: false },
  { id: 'acid', name: 'Acid Toxicity', primaryColor: '#a3e635', secondaryColor: '#14b8a6', faceType: 'retro', glowColor: '#a3e635', price: 30, unlocked: false },
  { id: 'edges', name: 'Cyberpunk Edge', primaryColor: '#facc15', secondaryColor: '#06b6d4', faceType: 'glowing', glowColor: '#06b6d4', price: 35, unlocked: false },
  { id: 'reaper', name: 'Blood Reaper', primaryColor: '#1f2937', secondaryColor: '#ef4444', faceType: 'angry', glowColor: '#ef4444', price: 40, unlocked: false },
  { id: 'frost', name: 'Frostbite', primaryColor: '#f9fafb', secondaryColor: '#06b6d4', faceType: 'cool', glowColor: '#38bdf8', price: 45, unlocked: false },
  { id: 'amethyst', name: 'Royal Amethyst', primaryColor: '#7c3aed', secondaryColor: '#fbbf24', faceType: 'glowing', glowColor: '#fbbf24', price: 50, unlocked: false },
];

const MISSION_TEMPLATES: {
  type: DailyMission['type'];
  descriptionEN: string;
  descriptionDE: string;
  target: number;
  reward: number;
}[] = [
  { type: 'JUMPS', descriptionEN: 'Perform 60 cyber-jumps across any runs', descriptionDE: 'Führe 60 Cyber-Sprünge in beliebigen Läufen aus', target: 60, reward: 15 },
  { type: 'ATTEMPTS', descriptionEN: 'Initiate 6 dashboard-run attempts', descriptionDE: 'Starte 6 Dashboard-Run-Versuche', target: 6, reward: 10 },
  { type: 'CHECKPOINTS', descriptionEN: 'Deploy 4 checkpoint flags in practice mode', descriptionDE: 'Platziere 4 Kontrollpunkt-Flaggen im Übungsmodus', target: 4, reward: 8 },
  { type: 'COMPLETIONS', descriptionEN: 'Safely complete any level (reach 100%)', descriptionDE: 'Schließe ein beliebiges Level erfolgreich ab (100%)', target: 1, reward: 20 },
  { type: 'STARS_GATHERED', descriptionEN: 'Gather 8 stars while playing runs', descriptionDE: 'Sammle 8 Sterne während der Läufe', target: 8, reward: 12 },
  { type: 'JUMPS', descriptionEN: 'Perform 120 jumps across your runs today', descriptionDE: 'Führe heute insgesamt 120 Sprünge aus', target: 120, reward: 25 },
  { type: 'COMPLETIONS', descriptionEN: 'Safely complete any level 2 times', descriptionDE: 'Schließe ein beliebiges Level 2 Mal erfolgreich ab', target: 2, reward: 35 },
  { type: 'ATTEMPTS', descriptionEN: 'Initiate 12 dashboard-run attempts', descriptionDE: 'Starte 12 Dashboard-Run-Versuche', target: 12, reward: 20 },
];

const getDailyMissionsForDate = (dateStr: string): DailyMission[] => {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = dateStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  const selected: typeof MISSION_TEMPLATES[number][] = [];
  const indicesUsed = new Set<number>();
  let attemptIdx = 0;
  while (selected.length < 3 && attemptIdx < 100) {
    const seed = Math.abs(hash + attemptIdx * 31);
    const index = seed % MISSION_TEMPLATES.length;
    if (!indicesUsed.has(index)) {
      indicesUsed.add(index);
      selected.push(MISSION_TEMPLATES[index]);
    }
    attemptIdx++;
  }
  return selected.map((t, idx) => ({
    id: `mission_${dateStr}_${idx}`,
    type: t.type,
    descriptionEN: t.descriptionEN,
    descriptionDE: t.descriptionDE,
    target: t.target,
    current: 0,
    reward: t.reward,
    claimed: false,
  }));
};

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const [showLangMenu, setShowLangMenu] = useState<boolean>(false);
  const [showSettingsHud, setShowSettingsHud] = useState<boolean>(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Game states
  const [gameState, setGameState] = useState<GameState>('START');
  const gameStateRef = useRef<GameState>('START');
  
  // Sync state ref to prevent closures in WebGL physics thread loop
  const updateGameState = (newVal: GameState) => {
    setGameState(newVal);
    gameStateRef.current = newVal;
  };

  // Levels & Stats State
  const [levels, setLevels] = useState<Level[]>(PREDEFINED_LEVELS);
  const [activeLevelId, setActiveLevelId] = useState<string>('stereo_madness');
  const [isCreatingLevel, setIsCreatingLevel] = useState<boolean>(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [starsBalance, setStarsBalance] = useState<number>(0);
  const [completedPercentages, setCompletedPercentages] = useState<Record<string, number>>({});
  const [bestAttempts, setBestAttempts] = useState<Record<string, number>>({});
  const [skins, setSkins] = useState<Skin[]>(SKINS_LIST);
  const [activeSkinId, setActiveSkinId] = useState<string>('default');

  const [dailyMissions, setDailyMissions] = useState<DailyMission[]>([]);

  const updateDailyMissions = (type: DailyMission['type'], amount: number) => {
    setDailyMissions(prev => {
      const next = prev.map(m => {
        if (m.type === type && !m.claimed && m.current < m.target) {
          return { ...m, current: Math.min(m.target, m.current + amount) };
        }
        return m;
      });
      localStorage.setItem('gd3d_daily_missions', JSON.stringify(next));
      return next;
    });
  };

  const handleClaimMission = (missionId: string, reward: number) => {
    setDailyMissions(prev => {
      const next = prev.map(m => {
        if (m.id === missionId) {
          return { ...m, claimed: true };
        }
        return m;
      });
      localStorage.setItem('gd3d_daily_missions', JSON.stringify(next));
      return next;
    });

    setStarsBalance(prev => {
      const nextBal = prev + reward;
      localStorage.setItem('gd3d_stars', nextBal.toString());
      return nextBal;
    });
  };

  const handleResetProgress = () => {
    localStorage.removeItem('gd3d_stars');
    localStorage.removeItem('gd3d_progress');
    localStorage.removeItem('gd3d_attempts');
    localStorage.removeItem('gd3d_unlocked_skins');
    localStorage.removeItem('gd3d_active_skin');
    localStorage.removeItem('gd3d_custom_levels');
    
    setStarsBalance(0);
    setCompletedPercentages({});
    setBestAttempts({});
    setActiveSkinId('default');
    setSkins(SKINS_LIST.map(s => s.id === 'default' ? { ...s, unlocked: true } : { ...s, unlocked: false }));
    setLevels(PREDEFINED_LEVELS);
  };

  // Interactive View Settings
  const [cameraMode, setCameraMode] = useState<CameraMode>('CLASSIC_3D');
  const [audioMuted, setAudioMuted] = useState<boolean>(false);
  const [activeAudioTab, setActiveAudioTab] = useState<'menu' | 'game'>('menu');
  const [isPracticeMode, setIsPracticeMode] = useState<boolean>(false);
  const [isAutopilotEnabled, setIsAutopilotEnabled] = useState<boolean>(false);
  
  // Live in-run dynamic indicators (passed to HUD)
  const [runStats, setRunStats] = useState<PlayerStats>({
    stars: 0,
    attempts: 0,
    jumps: 0,
    starsCollectedThisRun: 0,
  });
  const [percentComplete, setPercentComplete] = useState<number>(0);

  // Practice checkpoints store (mutable ref to preserve performance)
  const practiceCheckpointsRef = useRef<Checkpoint[]>([]);
  const [checkpointCount, setCheckpointCount] = useState<number>(0);
  const startTimeRef = useRef<number>(0);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    try {
      const storedStars = localStorage.getItem('gd3d_stars');
      if (storedStars) setStarsBalance(parseInt(storedStars, 10));

      const storedProgress = localStorage.getItem('gd3d_progress');
      if (storedProgress) setCompletedPercentages(JSON.parse(storedProgress));

      const storedAttempts = localStorage.getItem('gd3d_attempts');
      if (storedAttempts) setBestAttempts(JSON.parse(storedAttempts));

      const storedUnlockedSkins = localStorage.getItem('gd3d_unlocked_skins');
      if (storedUnlockedSkins) {
        const unlockedIds = new Set<string>(JSON.parse(storedUnlockedSkins));
        setSkins(prev => prev.map(s => unlockedIds.has(s.id) ? { ...s, unlocked: true } : s));
      }

      const storedSkinId = localStorage.getItem('gd3d_active_skin');
      if (storedSkinId) setActiveSkinId(storedSkinId);

      const storedMute = localStorage.getItem('gd3d_mute');
      if (storedMute) {
        const m = storedMute === 'true';
        setAudioMuted(m);
        GameAudio.setMute(m);
      }

      const storedCustomLevels = localStorage.getItem('gd3d_custom_levels');
      if (storedCustomLevels) {
        const parsed = JSON.parse(storedCustomLevels);
        setLevels(PREDEFINED_LEVELS.concat(parsed));
      }

      // Initialize or Restore Daily Missions
      const todayStr = new Date().toISOString().substring(0, 10);
      const storedMissionsDate = localStorage.getItem('gd3d_daily_missions_date');
      const storedMissions = localStorage.getItem('gd3d_daily_missions');
      
      if (storedMissionsDate === todayStr && storedMissions) {
        try {
          setDailyMissions(JSON.parse(storedMissions));
        } catch (e) {
          const freshMissions = getDailyMissionsForDate(todayStr);
          setDailyMissions(freshMissions);
          localStorage.setItem('gd3d_daily_missions', JSON.stringify(freshMissions));
          localStorage.setItem('gd3d_daily_missions_date', todayStr);
        }
      } else {
        const freshMissions = getDailyMissionsForDate(todayStr);
        setDailyMissions(freshMissions);
        localStorage.setItem('gd3d_daily_missions', JSON.stringify(freshMissions));
        localStorage.setItem('gd3d_daily_missions_date', todayStr);
      }
    } catch (e) {
      console.warn('LocalStorage reads failed', e);
    }
  }, []);

  // Handle music state switches on start screen loads or mute actions
  useEffect(() => {
    if (gameState === 'PLAYING') {
      const activeLvl = levels.find(l => l.id === activeLevelId) || levels[0];
      GameAudio.startMusic(activeLvl.bpm, activeLvl.color);
    } else if (gameState === 'START' || gameState === 'PAUSED') {
      GameAudio.startMenuMusic();
    } else {
      GameAudio.stopMusic();
    }
    return () => {
      GameAudio.stopMusic();
    };
  }, [gameState, activeLevelId, levels]);

  // Resume AudioContext on initial interaction (browser security autoplay policy override)
  useEffect(() => {
    const handleFirstInteraction = () => {
      // @ts-ignore
      const ctx = GameAudio.ctx;
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().then(() => {
          if (gameState === 'START' || gameState === 'PAUSED') {
            GameAudio.startMenuMusic();
          }
        });
      } else {
        // If context isn't initiated yet, calling initCtx inside startMenuMusic will build it
        if (gameState === 'START' || gameState === 'PAUSED') {
          GameAudio.startMenuMusic();
        }
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, [gameState]);

  // Escape key pauses the game
  useEffect(() => {
    const handleKD = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (gameStateRef.current === 'PLAYING') {
          updateGameState('PAUSED');
        } else if (gameStateRef.current === 'PAUSED') {
          updateGameState('PLAYING');
        }
      }
    };
    window.addEventListener('keydown', handleKD);
    return () => window.removeEventListener('keydown', handleKD);
  }, []);

  // Selected level object helper
  const selectedLevel = (() => {
    if (activeLevelId === 'endless') {
      const bestScore = completedPercentages['endless'] || 0;
      return generateEndlessLevel(bestScore);
    }
    return levels.find(l => l.id === activeLevelId) || levels[0];
  })();

  const activeSkin = skins.find(s => s.id === activeSkinId) || skins[0];

  // 2. Play Actions
  const handleStartGame = () => {
    // Record attempting counts inside level
    const newBestAttempts = { ...bestAttempts };
    const currentAtts = (newBestAttempts[activeLevelId] || 0) + 1;
    newBestAttempts[activeLevelId] = currentAtts;
    setBestAttempts(newBestAttempts);
    localStorage.setItem('gd3d_attempts', JSON.stringify(newBestAttempts));

    // Progress daily mission
    updateDailyMissions('ATTEMPTS', 1);

    // Clear run coordinates
    practiceCheckpointsRef.current = [];
    setCheckpointCount(0);
    setPercentComplete(0);

    setRunStats({
      stars: starsBalance,
      attempts: currentAtts,
      jumps: 0,
      starsCollectedThisRun: 0,
    });

    // Toggle playing states
    startTimeRef.current = Date.now();
    updateGameState('PLAYING');
  };

  const handleRestartRun = () => {
    if (isPracticeMode && practiceCheckpointsRef.current.length > 0) {
      // Respawn from latest flag
      updateGameState('PLAYING');
    } else {
      // Standard full level restart (increment attempts)
      const newBestAttempts = { ...bestAttempts };
      const currentAtts = (newBestAttempts[activeLevelId] || 0) + 1;
      newBestAttempts[activeLevelId] = currentAtts;
      setBestAttempts(newBestAttempts);
      localStorage.setItem('gd3d_attempts', JSON.stringify(newBestAttempts));

      // Progress daily mission
      updateDailyMissions('ATTEMPTS', 1);

      setPercentComplete(0);
      setRunStats(prev => ({
        ...prev,
        attempts: currentAtts,
        jumps: 0,
        starsCollectedThisRun: 0,
      }));

      startTimeRef.current = Date.now();
      updateGameState('PLAYING');
    }
  };

  const handleTogglePause = () => {
    if (gameState === 'PLAYING') updateGameState('PAUSED');
    else if (gameState === 'PAUSED') updateGameState('PLAYING');
  };

  const handleToggleMute = () => {
    const nextMute = GameAudio.toggleMute();
    setAudioMuted(nextMute);
    localStorage.setItem('gd3d_mute', nextMute ? 'true' : 'false');
  };

  const handleExitToMenu = () => {
    updateGameState('START');
    practiceCheckpointsRef.current = [];
    setCheckpointCount(0);
  };

  const handleSelectLevel = (levelId: string) => {
    setActiveLevelId(levelId);
  };

  const handleSaveCustomLevel = (newLevel: Level, finalStars?: number) => {
    let nextCustomList: Level[] = [];
    try {
      const stored = localStorage.getItem('gd3d_custom_levels');
      if (stored) {
        nextCustomList = JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }

    const existingIndex = nextCustomList.findIndex(l => l.id === newLevel.id);
    if (existingIndex > -1) {
      nextCustomList[existingIndex] = newLevel;
    } else {
      nextCustomList.push(newLevel);
    }

    localStorage.setItem('gd3d_custom_levels', JSON.stringify(nextCustomList));
    setLevels(PREDEFINED_LEVELS.concat(nextCustomList));
    setActiveLevelId(newLevel.id);

    if (finalStars !== undefined) {
      setStarsBalance(finalStars);
      localStorage.setItem('gd3d_stars', finalStars.toString());
    }

    setIsCreatingLevel(false);
    setEditingLevel(null);
  };

  const handleDeleteCustomLevel = (levelId: string) => {
    let nextCustomList: Level[] = [];
    try {
      const stored = localStorage.getItem('gd3d_custom_levels');
      if (stored) {
        nextCustomList = JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }

    nextCustomList = nextCustomList.filter(l => l.id !== levelId);
    localStorage.setItem('gd3d_custom_levels', JSON.stringify(nextCustomList));
    setLevels(PREDEFINED_LEVELS.concat(nextCustomList));

    if (activeLevelId === levelId) {
      setActiveLevelId(PREDEFINED_LEVELS[0].id);
    }
  };

  const handleImportAICustomLevel = (generatedLevel: Level) => {
    let nextCustomList: Level[] = [];
    try {
      const stored = localStorage.getItem('gd3d_custom_levels');
      if (stored) {
        nextCustomList = JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }

    nextCustomList.push(generatedLevel);
    localStorage.setItem('gd3d_custom_levels', JSON.stringify(nextCustomList));
    setLevels(PREDEFINED_LEVELS.concat(nextCustomList));
    setActiveLevelId(generatedLevel.id);
  };

  const handleEditCustomLevel = (level: Level) => {
    setEditingLevel(level);
    setIsCreatingLevel(true);
  };

  const handleCreateCustomLevel = () => {
    setEditingLevel(null);
    setIsCreatingLevel(true);
  };

  // 3. Skins purchase and custom actions
  const handleSelectSkin = (skinId: string) => {
    setActiveSkinId(skinId);
    localStorage.setItem('gd3d_active_skin', skinId);
  };

  const handleUnlockSkin = (skinId: string) => {
    const skinToBuy = skins.find(s => s.id === skinId);
    if (skinToBuy && !skinToBuy.unlocked && starsBalance >= skinToBuy.price) {
      // Deduct balance
      const newBalance = starsBalance - skinToBuy.price;
      setStarsBalance(newBalance);

      const nextSkins = skins.map(s => s.id === skinId ? { ...s, unlocked: true } : s);
      setSkins(nextSkins);

      // Save unlocked IDs
      const unlockedIds = nextSkins.filter(s => s.unlocked).map(s => s.id);
      localStorage.setItem('gd3d_unlocked_skins', JSON.stringify(unlockedIds));
      localStorage.setItem('gd3d_stars', newBalance.toString());

      // Auto select newly bought outline
      setActiveSkinId(skinId);
      localStorage.setItem('gd3d_active_skin', skinId);
    }
  };

  // 4. In-game feedback handlers (passed to GameCanvas thread)
  const handleStatsUpdate = (stats: { jumps: number; stars: number }) => {
    if (stats.jumps > 0) {
      updateDailyMissions('JUMPS', stats.jumps);
    }
    if (stats.stars > 0) {
      updateDailyMissions('STARS_GATHERED', stats.stars);
    }

    setRunStats(prev => {
      const nextJumps = prev.jumps + stats.jumps;
      const nextStarsCollected = prev.starsCollectedThisRun + stats.stars;
      
      if (stats.stars > 0) {
        const nextStarsBalance = starsBalance + stats.stars;
        setStarsBalance(nextStarsBalance);
        localStorage.setItem('gd3d_stars', nextStarsBalance.toString());
      }

      return {
        ...prev,
        jumps: nextJumps,
        starsCollectedThisRun: nextStarsCollected,
      };
    });
  };

  const recordLeaderboardRun = (percent: number) => {
    const elapsedMs = Date.now() - startTimeRef.current;
    const timeSec = Math.max(0.1, parseFloat((elapsedMs / 1000).toFixed(2)));
    const playerName = localStorage.getItem('gd3d_player_name') || 'CYBER_RUNNER';
    
    // Minimum 1% progress to avoid spamming 0% runs
    if (percent < 1) return;

    let stored: Record<string, any[]> = {};
    try {
      const storedStr = localStorage.getItem('gd3d_leaderboards');
      if (storedStr) {
        stored = JSON.parse(storedStr);
      }
    } catch (e) {
      console.warn('Leaderboard parse error', e);
    }

    const defaultLeaderboards = {
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
        { id: 'bot_5', playerName: 'Michigun ▲▲▲', percentage: 52, timeSeconds: 25.10, date: '2026-06-07', isPractice: false },
      ],
      dash: [
        { id: 'bot_1', playerName: 'Zoink', percentage: 100, timeSeconds: 22.10, date: '2026-06-19', isPractice: false },
        { id: 'bot_2', playerName: 'Trick', percentage: 100, timeSeconds: 23.45, date: '2026-06-20', isPractice: false },
        { id: 'bot_3', playerName: 'Sunix', percentage: 100, timeSeconds: 24.80, date: '2026-06-21', isPractice: false },
        { id: 'bot_4', playerName: 'Michigun ▲▲▲', percentage: 85, timeSeconds: 19.50, date: '2026-06-21', isPractice: false },
        { id: 'bot_5', playerName: 'Riot', percentage: 70, timeSeconds: 15.20, date: '2026-06-21', isPractice: false },
      ]
    };

    const currentList = stored[activeLevelId] || defaultLeaderboards[activeLevelId as keyof typeof defaultLeaderboards] || [];
    
    const newEntry = {
      id: `run_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      playerName,
      percentage: Math.round(percent),
      timeSeconds: timeSec,
      date: new Date().toISOString().substring(0, 10),
      isPractice: isPracticeMode
    };

    const nextList = [...currentList, newEntry]
      .sort((a, b) => {
        if (b.percentage !== a.percentage) {
          return b.percentage - a.percentage;
        }
        if (a.percentage === 100) {
          return a.timeSeconds - b.timeSeconds;
        }
        return b.timeSeconds - a.timeSeconds;
      })
      .slice(0, 8);

    const updatedLeaderboards = {
      ...defaultLeaderboards,
      ...stored,
      [activeLevelId]: nextList
    };

    localStorage.setItem('gd3d_leaderboards', JSON.stringify(updatedLeaderboards));
  };

  const handleCrash = (percent: number) => {
    setPercentComplete(percent);
    updateGameState('CRASHED');

    // Save best progress
    const currentBest = completedPercentages[activeLevelId] || 0;
    if (percent > currentBest) {
      const nextProgress = { ...completedPercentages, [activeLevelId]: percent };
      setCompletedPercentages(nextProgress);
      localStorage.setItem('gd3d_progress', JSON.stringify(nextProgress));
    }

    recordLeaderboardRun(percent);
  };

  const handleWin = () => {
    // Progress daily mission
    updateDailyMissions('COMPLETIONS', 1);

    setPercentComplete(100);
    updateGameState('WON');

    // Save full progress completed
    const nextProgress = { ...completedPercentages, [activeLevelId]: 100 };
    setCompletedPercentages(nextProgress);
    localStorage.setItem('gd3d_progress', JSON.stringify(nextProgress));

    // Award bonus coins for completing level!
    const activeLvl = selectedLevel;
    const bonusStars = activeLvl.starsAvailable;
    const newBalance = starsBalance + bonusStars;
    setStarsBalance(newBalance);
    localStorage.setItem('gd3d_stars', newBalance.toString());

    recordLeaderboardRun(100);
  };

  // 5. Checkpoints Managers inside UI overlay
  const handleTogglePractice = () => {
    setIsPracticeMode(prev => !prev);
    practiceCheckpointsRef.current = [];
    setCheckpointCount(0);
  };

  const handlePlaceCheckpoint = () => {
    // Progress daily mission
    updateDailyMissions('CHECKPOINTS', 1);

    // Dispatch dummy key events or trigger directly since we hold a ref.
    // The GameCanvas physics loop handles capturing these coordinates
    const viewCanvas = document.getElementById('geometry-dash-three-viewport');
    if (viewCanvas) {
      // Simulate artificial KeyZ press inside WebGL animation thread
      const event = new KeyboardEvent('keydown', { code: 'KeyZ' });
      window.dispatchEvent(event);
      
      // Delay readout representation slightly
      setTimeout(() => {
        setCheckpointCount(practiceCheckpointsRef.current.length);
      }, 50);
    }
  };

  const handleClearCheckpoint = () => {
    const viewCanvas = document.getElementById('geometry-dash-three-viewport');
    if (viewCanvas) {
      const event = new KeyboardEvent('keydown', { code: 'KeyX' });
      window.dispatchEvent(event);
      setTimeout(() => {
        setCheckpointCount(practiceCheckpointsRef.current.length);
      }, 50);
    }
  };

  // Toggle Camera Views
  const handleToggleCamera = () => {
    setCameraMode(prev => {
      if (prev === 'CLASSIC_3D') return 'CHASE_3D';
      if (prev === 'CHASE_3D') return 'TOP_DOWN';
      if (prev === 'TOP_DOWN') return 'BIRD_EYE_3D';
      if (prev === 'BIRD_EYE_3D') return 'ORTHO_2D';
      return 'CLASSIC_3D';
    });
  };

  // Helper stats displays
  const levelsCount = levels.length;
  const clearedCount = Object.values(completedPercentages).filter(percent => percent === 100).length;

  return (
    <div id="full-app-root" className="w-screen h-screen bg-[#050505] flex flex-col justify-between overflow-hidden text-white select-none relative font-sans">
      
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#00FF95 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* Side Decorative Dash Accent Lines */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-1 z-0 pointer-events-none">
        <div className="h-1 w-8 bg-[#00FF95] shadow-[0_0_8px_#00FF95]"></div>
        <div className="h-1 w-4 bg-[#00FF95]/40"></div>
        <div className="h-1 w-6 bg-[#00FF95]/70"></div>
      </div>

      <div className="absolute right-6 top-1/2 -translate-y-1/2 [writing-mode:vertical-rl] text-[10px] uppercase tracking-[0.4em] font-black opacity-30 rotate-180 hidden lg:block z-0 pointer-events-none font-mono">
        Geometry Dash Engine V3.0 // Neural Render
      </div>

      {/* 1. START LANDING SCREEN: Full Featured Dashboard */}
      {gameState === 'START' && (
        <div id="landing-screen-wrapper" className="flex-1 w-full flex flex-col justify-between p-6 sm:p-8 lg:p-12 overflow-y-auto z-10 relative">
          
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes scrollGrid {
              0% { background-position-y: 0px; }
              100% { background-position-y: 60px; }
            }
            @keyframes laserScan {
              0% { top: -10%; }
              50% { top: 110%; }
              100% { top: -10%; }
            }
            @keyframes shine {
              100% { transform: translateX(100%); }
            }
          `}} />

          {/* Dynamic parallax floating assets container */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Perspective moving bottom cyber grid */}
            <div 
              className="absolute bottom-0 left-0 w-full h-[55%] opacity-15"
              style={{
                backgroundImage: 'linear-gradient(to right, #00FF95 1.5px, transparent 1.5px), linear-gradient(to bottom, #00FF95 1.5px, transparent 1.5px)',
                backgroundSize: '60px 60px',
                transform: 'perspective(350px) rotateX(65deg) translateY(0px)',
                transformOrigin: 'bottom center',
                animation: 'scrollGrid 3.5s linear infinite'
              }}
            />
            {/* Ambient Radial Lights */}
            <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px]" />
            <div className="absolute top-[35%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[110px]" />
            <div className="absolute bottom-[-10%] left-[25%] w-[500px] h-[500px] rounded-full bg-[#00FF95]/5 blur-[120px]" />
            
            {/* Laser scanning beam line */}
            <div 
              className="absolute left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#00FF95]/40 to-transparent shadow-[0_0_12px_rgba(0,255,149,0.5)] opacity-30 pointer-events-none"
              style={{ animation: 'laserScan 10s ease-in-out infinite' }}
            />

            {/* Floating Player Cube representation (Interactive element) */}
            <motion.div 
              className="absolute top-[22%] left-[6%] hidden xl:flex flex-col items-center justify-center w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 border-2 border-white rounded-lg shadow-[0_0_15px_rgba(0,255,149,0.35)]"
              animate={{ 
                y: [0, -12, 0],
                rotate: [0, 90, 180, 270, 360],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {/* Glowing face */}
              <div className="flex gap-2 items-center justify-center">
                <span className="w-2 h-2 bg-yellow-300 rounded-full" />
                <span className="w-2 h-2 bg-yellow-300 rounded-full" />
              </div>
              <div className="w-5 h-1 bg-yellow-300 rounded-full mt-1" />
            </motion.div>

            {/* Floating Emerald Crystal (Double Jump representation) */}
            <motion.div 
              className="absolute top-[16%] right-[8%] hidden lg:flex flex-col items-center justify-center"
              animate={{ 
                y: [0, 10, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-10 h-10 bg-[#00ff95]/10 border border-[#00ff95]/50 flex items-center justify-center rounded-xl backdrop-blur-md shadow-[0_0_20px_rgba(0,255,149,0.25)] rotate-45 transform">
                <Zap className="w-4 h-4 text-[#00ff95] -rotate-45 animate-pulse" />
              </div>
              <span className="text-[7px] font-mono text-[#00ff95]/85 uppercase tracking-[0.2em] mt-2.5 bg-black/60 px-2 py-0.5 border border-[#00ff95]/20">DBL_JUMP</span>
            </motion.div>

            {/* Floating Rocket Accent (Speed Boost representation) */}
            <motion.div 
              className="absolute bottom-[32%] right-[4%] hidden xl:flex flex-col items-center justify-center"
              animate={{ 
                y: [0, -8, 0],
                rotate: [4, -4, 4]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="w-10 h-10 bg-orange-500/10 border border-orange-500/50 flex items-center justify-center rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(255,165,0,0.25)]">
                <Sparkles className="w-4 h-4 text-orange-400 animate-bounce" />
              </div>
              <span className="text-[7px] font-mono text-orange-400/85 uppercase tracking-[0.2em] mt-2.5 bg-black/60 px-2 py-0.5 border border-orange-500/20">SPEED_BST</span>
            </motion.div>

            {/* Floating Golden Star (Star Balance representation) */}
            <motion.div 
              className="absolute bottom-[20%] left-[10%] hidden lg:flex flex-col items-center justify-center"
              animate={{ 
                y: [0, 12, 0],
                rotate: 360
              }}
              transition={{
                y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                rotate: { duration: 20, repeat: Infinity, ease: "linear" }
              }}
            >
              <Star className="w-7 h-7 fill-yellow-400 text-yellow-300 drop-shadow-[0_0_8px_#facc15]" />
            </motion.div>
          </div>

          {/* 1. CINEMATIC GLITCH HEADER */}
          <motion.header 
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-950/75 backdrop-blur-xl p-6 sm:p-8 border-2 border-[#00FF95]/25 gap-6 shadow-[0_0_40px_rgba(0,255,149,0.06)] relative overflow-hidden z-10"
          >
            {/* Left neon glowing aesthetic tab */}
            <div className="absolute top-0 left-0 w-1.5 bg-[#00FF95] h-full shadow-[0_0_15px_#00FF95]"></div>
            
            <div className="flex flex-col relative z-10 select-none">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[#00FF95] font-mono text-[9px] tracking-[0.4em] uppercase font-black px-2 py-0.5 bg-[#00FF95]/10 border border-[#00FF95]/30">{t.stereoscopicEng}</span>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              </div>
              
              <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none italic uppercase text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                GEOMETRY<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-[#00FF95] to-emerald-400 font-extrabold tracking-tight filter drop-shadow-[0_0_12px_rgba(0,255,149,0.35)]">
                  DASH 3D
                </span>
              </h1>
            </div>

            {/* Premium Stats Displays */}
            <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto relative z-10 font-mono">
              <div className="flex items-center gap-5 text-xs flex-wrap">
                
                {/* Stars balance with glowing mini-box */}
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold mb-1">{t.starsBalance}</span>
                  <div className="text-2xl font-black text-yellow-400 flex items-center gap-1.5 bg-yellow-400/5 px-3 py-1 border border-yellow-400/20 rounded-md">
                    <Star className="w-5 h-5 fill-current text-yellow-400 animate-pulse" />
                    <span className="text-white drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">{starsBalance}</span>
                  </div>
                </div>

                <div className="h-10 w-[1px] bg-white/10 hidden sm:block"></div>

                {/* Segmented notches representing completed levels */}
                <div className="flex flex-col items-end">
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold mb-1">{t.levelProgress}</span>
                  <div className="flex gap-0.5 h-7 items-stretch bg-black/40 p-1 border border-white/10 rounded-md">
                    {Array.from({ length: 12 }).map((_, i) => {
                      const ratio = levelsCount > 0 ? (clearedCount / levelsCount) : 0;
                      const isActive = (i + 0.5) < (ratio * 12);
                      return (
                        <div 
                          key={i} 
                          className={`w-2 transition-all duration-300 rounded-sm ${
                            isActive 
                              ? 'bg-gradient-to-t from-emerald-500 to-[#00FF95] shadow-[0_0_8px_#00FF95]' 
                              : 'bg-zinc-900 border border-zinc-800'
                          }`} 
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="h-10 w-[1px] bg-white/10"></div>

                {/* Cybernetic Language Selector Dropdown */}
                <div className="relative font-mono" ref={langDropdownRef}>
                  <button
                    id="dashboard-lang-btn"
                    onClick={() => setShowLangMenu(!showLangMenu)}
                    className={`p-3 bg-zinc-900 border ${showLangMenu ? 'border-[#00FF95] text-[#00FF95] shadow-[0_0_15px_rgba(0,255,149,0.3)]' : 'border-white/10 text-zinc-400'} hover:bg-white/10 hover:border-[#00FF95] hover:text-[#00FF95] rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,0,0,0.5)] active:scale-95`}
                    title="Select Language / Sprache wählen"
                  >
                    <Globe className="w-5 h-5 text-[#00FF95] drop-shadow-[0_0_8px_#00FF95]" />
                    <span className="text-[10px] font-black tracking-widest">{language}</span>
                  </button>

                  <AnimatePresence>
                    {showLangMenu && (
                      <motion.div
                        id="lang-dropdown-menu"
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2.5 w-44 bg-zinc-950 border-2 border-[#00FF95]/30 shadow-[0_10px_25px_rgba(0,255,149,0.15)] rounded-md py-1.5 z-50 overflow-hidden backdrop-blur-xl"
                      >
                        <div className="px-3 py-1 border-b border-white/5 mb-1 bg-[#00FF95]/5">
                          <span className="text-[8px] tracking-[0.22em] text-[#00FF95] font-black uppercase">
                            {t.selectLanguage || "LANGUAGE"}
                          </span>
                        </div>
                        {[
                          { code: 'EN', name: 'English', emoji: '🇬🇧' },
                          { code: 'DE', name: 'Deutsch', emoji: '🇩🇪' },
                          { code: 'ES', name: 'Español', emoji: '🇪🇸' },
                          { code: 'FR', name: 'Français', emoji: '🇫🇷' }
                        ].map((langObj) => {
                          const isSelected = language === langObj.code;
                          return (
                            <button
                              key={langObj.code}
                              onClick={() => {
                                setLanguage(langObj.code as Language);
                                setShowLangMenu(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-[11px] font-bold flex items-center justify-between tracking-wide transition-colors cursor-pointer ${
                                isSelected
                                  ? 'bg-[#00FF95]/10 text-[#00FF95] border-l-2 border-[#00FF95] font-black'
                                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span className="text-sm">{langObj.emoji}</span>
                                <span>{langObj.name}</span>
                              </span>
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#00FF95]" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="h-10 w-[1px] bg-white/10"></div>

                {/* Settings HUD Toggle Button */}
                <button
                  id="dashboard-settings-btn"
                  onClick={() => setShowSettingsHud(true)}
                  className="p-3 bg-zinc-900 border border-white/10 hover:bg-white/10 hover:border-[#00FF95] text-zinc-400 hover:text-[#00FF95] rounded-md transition-all cursor-pointer flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] active:scale-95"
                  title={language === 'DE' ? 'Einstellungen' : 'Settings'}
                >
                  <Settings className="w-5 h-5 text-[#00FF95] drop-shadow-[0_0_8px_#00FF95]" />
                </button>

                <div className="h-10 w-[1px] bg-white/10"></div>

                {/* Cybernetic mute controller */}
                <button
                  id="dashboard-mute-btn"
                  onClick={handleToggleMute}
                  className="p-3 bg-zinc-900 border border-white/10 hover:bg-white/10 hover:border-[#00FF95] text-zinc-400 hover:text-[#00FF95] rounded-md transition-all cursor-pointer flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] active:scale-95"
                  title={audioMuted ? t.unmuteAudio : t.muteAudio}
                >
                  {audioMuted ? (
                    <VolumeX className="w-5 h-5 text-red-500 animate-pulse" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-[#00FF95] drop-shadow-[0_0_8px_#00FF95]" />
                  )}
                </button>
              </div>
            </div>
          </motion.header>

          {/* DAILY MISSIONS PROTCOL HUD */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
            className="w-full max-w-7xl mx-auto mt-8 relative z-10"
          >
            <DailyMissions
              missions={dailyMissions}
              onClaim={handleClaimMission}
            />
          </motion.div>

          {/* MAIN COLUMN BODY */}
          <main className="w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 my-8 items-stretch relative z-10">
            
            {/* LEVEL DECK CARD COLUMN */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
              className="flex flex-col h-full transform hover:shadow-[0_0_35px_rgba(0,255,149,0.05)] transition-all duration-300"
            >
              <LevelSelector
                levels={levels}
                activeLevelId={activeLevelId}
                completedPercentages={completedPercentages}
                bestAttempts={bestAttempts}
                onSelectLevel={handleSelectLevel}
                onCreateLevel={handleCreateCustomLevel}
                onEditLevel={handleEditCustomLevel}
                onDeleteLevel={handleDeleteCustomLevel}
              />
            </motion.div>

            {/* NEURAL LEADERBOARD COLUMN */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.22, ease: 'easeOut' }}
              className="flex flex-col h-full transform hover:shadow-[0_0_35px_rgba(0,255,149,0.05)] transition-all duration-300"
            >
              <Leaderboard 
                activeLevel={selectedLevel}
                bestAttempts={bestAttempts}
                completedPercentages={completedPercentages}
              />
            </motion.div>

            {/* SKIN CUSTOMIZER BOX COLUMN */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.29, ease: 'easeOut' }}
              className="flex flex-col h-full transform hover:shadow-[0_0_35px_rgba(6,182,212,0.05)] transition-all duration-300 md:col-span-2 lg:col-span-1"
            >
              <SkinSelector
                skins={skins}
                activeSkinId={activeSkinId}
                starsCollected={starsBalance}
                onSelectSkin={handleSelectSkin}
                onUnlockSkin={handleUnlockSkin}
              />
            </motion.div>

          </main>

          {/* CLOUD SAVES, COMMUNITY MARKET & CYBER SYNTH AUDIO BOARD */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.36, ease: 'easeOut' }}
            className="w-full max-w-7xl mx-auto mb-8 relative z-10 px-0 grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch"
          >
            <GameSavesAndSales
              starsBalance={starsBalance}
              completedPercentages={completedPercentages}
              bestAttempts={bestAttempts}
              customLevels={levels.filter(l => l.id.startsWith('custom_') || l.id.startsWith('custom_ai_'))}
              skins={skins}
              activeSkinId={activeSkinId}
              onImportCustomLevel={handleImportAICustomLevel}
              onStateRestore={(restored) => {
                setStarsBalance(restored.starsBalance);
                setCompletedPercentages(restored.completedPercentages);
                setBestAttempts(restored.bestAttempts);
                
                // Merge or set restored custom levels
                const customList = restored.customLevels;
                setLevels(PREDEFINED_LEVELS.concat(customList));
                
                // Unlock and select skins
                setSkins(prev => prev.map(s => restored.unlockedSkinIds.includes(s.id) ? { ...s, unlocked: true } : s));
                setActiveSkinId(restored.activeSkinId);
 
                // Write backup checkpoints to localStorage safely
                localStorage.setItem('gd3d_stars', restored.starsBalance.toString());
                localStorage.setItem('gd3d_progress', JSON.stringify(restored.completedPercentages));
                localStorage.setItem('gd3d_attempts', JSON.stringify(restored.bestAttempts));
                localStorage.setItem('gd3d_custom_levels', JSON.stringify(customList));
                localStorage.setItem('gd3d_active_skin', restored.activeSkinId);
                localStorage.setItem('gd3d_unlocked_skins', JSON.stringify(restored.unlockedSkinIds));
              }}
              onSpendStars={(amount) => {
                const nextVal = Math.max(0, starsBalance - amount);
                setStarsBalance(nextVal);
                localStorage.setItem('gd3d_stars', nextVal.toString());
              }}
              onRewardStars={(amount) => {
                const nextVal = starsBalance + amount;
                setStarsBalance(nextVal);
                localStorage.setItem('gd3d_stars', nextVal.toString());
              }}
            />
            <div className="flex flex-col h-full bg-black/90 border-2 border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.6)] relative overflow-hidden">
              <div className="flex bg-zinc-950 border-b border-white/10 select-none">
                <button
                  id="tab-audio-menu"
                  onClick={() => setActiveAudioTab('menu')}
                  className={`flex-1 py-3 text-xs tracking-wider font-extrabold uppercase transition-all duration-200 border-r border-white/10 flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeAudioTab === 'menu'
                      ? 'bg-cyan-500/10 text-cyan-400 font-black border-b-2 border-b-cyan-500'
                      : 'text-zinc-500 hover:text-white bg-black/10'
                  }`}
                >
                  <Disc className={`w-3.5 h-3.5 ${activeAudioTab === 'menu' && GameAudio.musicMode === 'MENU' ? 'animate-spin' : ''}`} />
                  <span>MENU MUSIC MIXER</span>
                </button>
                <button
                  id="tab-audio-game"
                  onClick={() => setActiveAudioTab('game')}
                  className={`flex-1 py-3 text-xs tracking-wider font-extrabold uppercase transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeAudioTab === 'game'
                      ? 'bg-purple-500/10 text-purple-400 font-black border-b-2 border-b-purple-500'
                      : 'text-zinc-500 hover:text-white bg-black/10'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>GAME SOUNDBOARD</span>
                </button>
              </div>
              <div className="flex-1">
                {activeAudioTab === 'menu' ? (
                  <MenuMusicController />
                ) : (
                  <SoundboardControls />
                )}
              </div>
            </div>
          </motion.div>

          {/* PLAY FLOATING HERO CALL TO ACTION (Bottom banner) */}
          <motion.section 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.43, ease: 'easeOut' }}
            className="w-full max-w-7xl mx-auto flex flex-col items-center gap-6 mb-8 relative z-10"
          >
            
            {/* Interactive Cyber Power-Up Manual Showcase */}
            <div className="w-full bg-zinc-950/75 border-2 border-white/10 p-5 rounded-none backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.6)]">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#00FF95]" />
                <span className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-[0.2em]">TACTICAL HUD: INTEGRATED ACTIVE SYSTEMS</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
                {/* Double Jump Crystal */}
                <div className="bg-[#00ff95]/5 border border-emerald-500/20 p-4 flex items-center gap-4 group hover:border-[#00ff95]/60 hover:bg-[#00ff95]/10 transition-all duration-300">
                  <div className="w-12 h-12 shrink-0 bg-[#00ff95]/10 border-2 border-[#00ff95] flex items-center justify-center rounded-lg shadow-[0_0_15px_rgba(0,255,149,0.25)] group-hover:scale-105 transition-transform">
                    <Zap className="w-5 h-5 text-[#00ff95] animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-black tracking-widest uppercase">EMERALD CRYSTAL (⚡)</h4>
                    <p className="text-[10px] text-zinc-400 leading-normal mt-1">
                      COLLECT TO CHARGE <span className="text-[#00ff95] font-black">2 MID-AIR DOUBLE JUMPS</span>. RE-TRIGGER JUMP COMMANDS IN FLIGHT TO SURMOUNT DEEPER SPIKE CHASMS!
                    </p>
                  </div>
                </div>

                {/* Speed Booster Cone */}
                <div className="bg-orange-500/5 border border-orange-500/20 p-4 flex items-center gap-4 group hover:border-orange-500/60 hover:bg-orange-500/10 transition-all duration-300">
                  <div className="w-12 h-12 shrink-0 bg-orange-500/10 border-2 border-orange-400 flex items-center justify-center rounded-lg shadow-[0_0_15px_rgba(255,165,0,0.25)] group-hover:scale-105 transition-transform">
                    <Sparkles className="w-5 h-5 text-orange-400 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-white text-xs font-black tracking-widest uppercase">VELOCITY ACCELERATOR (🔥)</h4>
                    <p className="text-[10px] text-zinc-400 leading-normal mt-1">
                      ENGAGE THE VECTOR ARROWS TO TRIGGER <span className="text-orange-400 font-bold">4.0 SECONDS OF SPEED BOOST (+55%)</span>. LEAVES CONTINUOUS FIERY ROCKET TRAILS AND SURGES VELOCITY!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Launch Action */}
            <div className="flex flex-col items-center gap-4 w-full">
              <motion.button
                id="dashboard-play-hero-btn"
                onClick={handleStartGame}
                whileHover={{ scale: 1.05, textShadow: "0 0 10px #00FF95" }}
                whileTap={{ scale: 0.98 }}
                className="px-12 py-5 border-3 border-[#00FF95] bg-[#00FF95]/5 text-[#00FF95] font-black text-2xl tracking-[0.2em] uppercase shadow-[0_0_30px_rgba(0,255,149,0.25)] hover:bg-[#00FF95] hover:text-black transition-all cursor-pointer flex items-center gap-4 relative overflow-hidden group font-sans outline-none"
              >
                {/* Sliding glow shine background */}
                <div 
                  className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full pointer-events-none"
                  style={{ animation: 'shine 2s ease-in-out infinite' }}
                />
                
                <Play className="w-6 h-6 fill-current animate-pulse" />
                START RUN
                <ChevronRight className="w-6 h-6 text-current transition-transform group-hover:translate-x-1.5" />
              </motion.button>
              
              {/* Short description overlay */}
              <div className="flex items-center gap-2 bg-neutral-950/80 border border-white/10 px-5 py-3 text-[10px] text-zinc-400 font-mono tracking-tight max-w-lg text-center shadow-lg">
                <HelpCircle className="w-4 h-4 text-[#00FF95] shrink-0" />
                <span>
                  CONTROLS: <strong>SPACEBAR / CLICK SCREEN</strong> TO JUMP. DODGE DYNAMIC PHYSICAL SPIKES. CHANGE PERSPECTIVE IN RUNS VIA THE <strong>EYE PORT VIEW</strong> WINDOWS!
                </span>
              </div>
            </div>
          </motion.section>

          {/* Footer branding */}
          <motion.footer 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="w-full text-center text-[10px] text-zinc-650 mt-8 font-mono tracking-widest relative z-10 uppercase"
          >
            GEOMETRY DASH 3D // POWERED BY THREE.JS WEBGL RENDERER // NEURAL MODE ONLINE
          </motion.footer>

          <AIHelperCompanion
            activeLevel={selectedLevel}
            playerStats={{
              stars: starsBalance,
              attempts: runStats.attempts,
              jumps: runStats.jumps,
              starsCollectedThisRun: runStats.starsCollectedThisRun
            }}
            onImportCustomLevel={handleImportAICustomLevel}
          />

        </div>
      )}

      {/* 2. GAME SCREEN OVERLAYS & REALWEBGL CANVAS VIEWER */}
      {gameState !== 'START' && (
        <div id="active-game-viewport-container" className="flex-1 w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
          
          {/* Live High Performance 3D Component Rendering */}
          <GameCanvas
            level={selectedLevel}
            gameState={gameState}
            cameraMode={cameraMode}
            skin={activeSkin}
            isPracticeMode={isPracticeMode}
            isAutopilotEnabled={isAutopilotEnabled}
            onCrash={handleCrash}
            onWin={handleWin}
            onStatsUpdate={handleStatsUpdate}
            practiceCheckpointsRef={practiceCheckpointsRef}
            gameStateRef={gameStateRef}
          />

          {/* Heads Up Displays GameUI HUD Layer */}
          <GameUI
            levelName={selectedLevel.name}
            gameState={gameState}
            percentComplete={percentComplete}
            attempts={runStats.attempts}
            jumps={runStats.jumps}
            starsCollected={runStats.starsCollectedThisRun}
            isPracticeMode={isPracticeMode}
            isAutopilotEnabled={isAutopilotEnabled}
            checkpointCount={checkpointCount}
            cameraMode={cameraMode}
            audioMuted={audioMuted}
            score={starsBalance}
            onTogglePause={handleTogglePause}
            onRestart={handleRestartRun}
            onTogglePractice={handleTogglePractice}
            onToggleAutopilot={() => setIsAutopilotEnabled(prev => !prev)}
            onPlaceCheckpoint={handlePlaceCheckpoint}
            onClearCheckpoint={handleClearCheckpoint}
            onToggleCamera={handleToggleCamera}
            onToggleMute={handleToggleMute}
            onExitToMenu={handleExitToMenu}
          />

        </div>
      )}

      {isCreatingLevel && (
        <CustomLevelCreator
          onClose={() => {
            setIsCreatingLevel(false);
            setEditingLevel(null);
          }}
          onSave={handleSaveCustomLevel}
          editingLevel={editingLevel}
          starsBalance={starsBalance}
        />
      )}

      <SettingsHud
        isOpen={showSettingsHud}
        onClose={() => setShowSettingsHud(false)}
        cameraMode={cameraMode}
        onUpdateCameraMode={setCameraMode}
        onResetProgress={handleResetProgress}
      />

    </div>
  );
}
