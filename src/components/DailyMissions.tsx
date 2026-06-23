import React, { useState, useEffect } from 'react';
import { Target, Star, CheckCircle, Zap, Shield, Sparkles, Award, Clock } from 'lucide-react';
import { useLanguage } from '../utils/translations';
import { motion, AnimatePresence } from 'motion/react';

export interface DailyMission {
  id: string;
  type: 'JUMPS' | 'ATTEMPTS' | 'CHECKPOINTS' | 'COMPLETIONS' | 'STARS_GATHERED';
  descriptionEN: string;
  descriptionDE: string;
  target: number;
  current: number;
  reward: number;
  claimed: boolean;
}

interface DailyMissionsProps {
  missions: DailyMission[];
  onClaim: (missionId: string, reward: number) => void;
}

export default function DailyMissions({ missions, onClaim }: DailyMissionsProps) {
  const { language } = useLanguage();
  const [timeLeft, setTimeLeft] = useState('');

  // Ticking time countdown until next midnight UTC or local time
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // next midnight local time
      
      const diffMs = midnight.getTime() - now.getTime();
      if (diffMs <= 0) {
        setTimeLeft('00:00:00');
        return;
      }

      const h = Math.floor(diffMs / (1000 * 60 * 60));
      const m = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diffMs % (1000 * 60)) / 1000);

      const pads = (num: number) => String(num).padStart(2, '0');
      setTimeLeft(`${pads(h)}:${pads(m)}:${pads(s)}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const tLabels = {
    title: language === 'DE' ? 'TÄGLICHE MISSIONEN' : 'DAILY CYBER-MISSIONS',
    subtitle: language === 'DE' ? 'ERLEDIGE AUFGABEN FÜR EXTRA STERNE' : 'SOLVE CHALLENGES FOR EXTRA CODES',
    timeRemaining: language === 'DE' ? 'NÄCHSTER RESET IN' : 'NEXT PROTOCOL ROTATION IN',
    claim: language === 'DE' ? 'ANFORDERN' : 'CLAIM REWARD',
    claimed: language === 'DE' ? 'BEREITS BEANSPRUCHT' : 'COMPLETED & CLAIMED',
    completed: language === 'DE' ? 'ABGESCHLOSSEN!' : 'READY TO COMPILE',
    noMissions: language === 'DE' ? 'Keine Missionen aktiv!' : 'No missions loaded in active session!',
  };

  const getMissionIcon = (type: string) => {
    switch (type) {
      case 'JUMPS':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'ATTEMPTS':
        return <Target className="w-4 h-4 text-cyan-400" />;
      case 'CHECKPOINTS':
        return <Shield className="w-4 h-4 text-pink-400" />;
      case 'COMPLETIONS':
        return <Award className="w-4 h-4 text-[#00FF95]" />;
      case 'STARS_GATHERED':
        return <Star className="w-4 h-4 text-yellow-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-[#00FF95]" />;
    }
  };

  return (
    <div id="daily-missions-hud" className="w-full bg-[#070708]/90 border-2 border-[#00FF95]/20 shadow-[0_0_30px_rgba(0,255,149,0.04)] relative overflow-hidden backdrop-blur-md p-6 font-mono select-none">
      
      {/* Visual cyber decoration */}
      <div className="absolute top-0 left-0 w-24 h-[2px] bg-gradient-to-r from-[#00FF95] to-transparent animate-pulse" />
      <div className="absolute bottom-0 right-0 w-24 h-[2px] bg-gradient-to-l from-[#00FF95] to-transparent animate-pulse" />
      
      {/* Title & Reset Countdown Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-white/5 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-[#00FF95] animate-pulse drop-shadow-[0_0_6px_#00FF95]" />
            <span className="text-[10px] tracking-[0.25em] text-[#00FF95] font-black uppercase">
              {tLabels.title}
            </span>
          </div>
          <p className="text-zinc-500 font-bold text-[10px] uppercase">
            {tLabels.subtitle}
          </p>
        </div>

        {/* Rotation countdown */}
        <div className="flex items-center gap-3 bg-zinc-950/60 border border-white/10 px-3 py-1.5 rounded-sm">
          <Clock className="w-3.5 h-3.5 text-zinc-500" />
          <div className="flex flex-col text-right">
            <span className="text-[7px] text-zinc-500 font-black tracking-widest">{tLabels.timeRemaining}</span>
            <span className="text-xs font-black text-[#00FF95] tracking-widest">{timeLeft || '23:59:59'}</span>
          </div>
        </div>
      </div>

      {/* Missions Stack */}
      <div className="flex flex-col gap-3">
        {missions.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500 font-bold border border-dashed border-white/5 bg-white/[0.01]">
            {tLabels.noMissions}
          </div>
        ) : (
          missions.map((mission) => {
            const isCompleted = mission.current >= mission.target;
            const progressPercent = Math.min(100, Math.round((mission.current / mission.target) * 100));
            const isClaimed = mission.claimed;

            let cardBorder = 'border-white/5 bg-zinc-950/20';
            if (isCompleted && !isClaimed) {
              cardBorder = 'border-[#00FF95]/35 bg-[#00FF95]/[0.02] shadow-[0_0_15px_rgba(0,255,149,0.02)]';
            } else if (isClaimed) {
              cardBorder = 'border-zinc-800/40 opacity-60 bg-[#070708]/30';
            }

            return (
              <div 
                key={mission.id}
                className={`py-3.5 px-4 border rounded-sm transition-all duration-350 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${cardBorder}`}
              >
                {/* Left block: Description, progress bar */}
                <div className="flex-1 flex gap-3.5 items-start">
                  {/* Skill Badge Icon wrapper */}
                  <div className={`p-2 shrink-0 rounded-sm border ${
                    isClaimed 
                      ? 'bg-zinc-900 border-zinc-800 text-zinc-650' 
                      : isCompleted 
                        ? 'bg-[#00FF95]/10 border-[#00FF95]/20 text-[#00FF95] shadow-[0_0_10px_rgba(0,255,149,0.1)]' 
                        : 'bg-zinc-950 border-white/10'
                  }`}>
                    {getMissionIcon(mission.type)}
                  </div>

                  <div className="flex-1 flex flex-col justify-center min-w-0">
                    <h4 className={`text-xs font-bold leading-normal truncate ${
                      isClaimed ? 'text-zinc-500 line-through' : 'text-zinc-200 font-black'
                    }`}>
                      {language === 'DE' ? mission.descriptionDE : mission.descriptionEN}
                    </h4>

                    {/* Progress tracking display info */}
                    <div className="flex items-center gap-3 mt-1.5 select-none">
                      {/* Bar */}
                      <div className="flex-1 bg-zinc-900/80 h-1.5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            isClaimed 
                              ? 'bg-zinc-600' 
                              : isCompleted 
                                ? 'bg-gradient-to-r from-emerald-500 to-[#00FF95]' 
                                : 'bg-cyan-500'
                          }`}
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span className={`text-[10px] font-bold shrink-0 ${
                        isClaimed 
                          ? 'text-zinc-500 font-medium' 
                          : isCompleted 
                            ? 'text-[#00FF95] font-black' 
                            : 'text-zinc-400'
                      }`}>
                        {mission.current} / {mission.target} ({progressPercent}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right block: Reward & action trigger */}
                <div className="flex items-center sm:justify-end gap-3.5 shrink-0 pl-11 sm:pl-0">
                  {/* Reward indicator */}
                  <div className="flex flex-col items-start sm:items-end select-none font-bold">
                    <span className="text-[7px] text-zinc-500 uppercase tracking-wider">REWARD CODES</span>
                    <span className="flex items-center gap-1 text-xs text-yellow-500 font-black tracking-widest">
                      <Star className="w-3.5 h-3.5 fill-current animate-pulse text-yellow-500" />
                      +{mission.reward}
                    </span>
                  </div>

                  {/* Operational status action Button */}
                  {isClaimed ? (
                    <span className="text-[8px] font-black tracking-widest text-[#00FF95]/60 bg-[#00FF95]/5 border border-[#00FF95]/20 px-2 py-1.5 uppercase rounded-sm select-none">
                      {tLabels.claimed}
                    </span>
                  ) : isCompleted ? (
                    <button
                      onClick={() => onClaim(mission.id, mission.reward)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-[#00FF95] text-black hover:brightness-110 active:scale-95 transition-all text-[9px] font-black uppercase tracking-widest rounded-sm cursor-pointer shadow-[0_0_10px_rgba(0,255,149,0.2)] animate-pulse"
                    >
                      {tLabels.claim}
                    </button>
                  ) : (
                    <span className="text-[8px] font-bold text-zinc-500 tracking-wider border border-white/5 bg-zinc-950/30 px-2 py-1.5 uppercase rounded-sm select-none">
                      IN_PROGRESS
                    </span>
                  )}
                </div>

              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
