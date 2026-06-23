import React from 'react';
import { Level } from '../types';
import { Play, Star, Plus, Trash2, Award, Edit } from 'lucide-react';
import { useLanguage } from '../utils/translations';

interface LevelSelectorProps {
  levels: Level[];
  activeLevelId: string;
  completedPercentages: Record<string, number>;
  bestAttempts: Record<string, number>;
  onSelectLevel: (levelId: string) => void;
  onCreateLevel?: () => void;
  onEditLevel?: (level: Level) => void;
  onDeleteLevel?: (levelId: string) => void;
}

export default function LevelSelector({
  levels,
  activeLevelId,
  completedPercentages,
  bestAttempts,
  onSelectLevel,
  onCreateLevel,
  onEditLevel,
  onDeleteLevel,
}: LevelSelectorProps) {
  const { t, language } = useLanguage();

  // Ratings structure in state and localStorage
  interface LevelRating {
    userRating: number; // 0 if not rated yet
    communityRatings: number[];
  }

  const DEFAULT_COMMUNITY_RATINGS: Record<string, number[]> = {
    stereo_madness: [5, 4, 5, 4, 5, 4, 5, 5, 4, 5],
    back_on_track: [4, 4, 3, 5, 4, 4, 5, 4, 4],
    polargeist: [5, 5, 4, 4, 5, 5, 4, 5],
    clutterfunk: [3, 4, 4, 3, 5, 4, 5, 4, 3, 4],
    demon_fortress: [5, 5, 5, 5, 4, 5, 5, 5, 4, 5, 5],
    endless: [4, 5, 4, 5, 5, 4, 4, 5],
  };

  const [ratings, setRatings] = React.useState<Record<string, LevelRating>>(() => {
    const stored = localStorage.getItem('gd3d_ratings');
    let parsed: Record<string, LevelRating> = {};
    try {
      if (stored) {
        parsed = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse ratings', e);
    }

    const initial: Record<string, LevelRating> = { ...parsed };
    
    // Seed default community ratings if not specified
    Object.keys(DEFAULT_COMMUNITY_RATINGS).forEach((id) => {
      if (!initial[id]) {
        initial[id] = {
          userRating: 0,
          communityRatings: DEFAULT_COMMUNITY_RATINGS[id]
        };
      }
    });

    return initial;
  });

  const [hoverRating, setHoverRating] = React.useState<number>(0);
  const [hoverLevelId, setHoverLevelId] = React.useState<string | null>(null);

  const handleRateLevel = (levelId: string, value: number) => {
    setRatings((prev) => {
      const existing = prev[levelId] || { userRating: 0, communityRatings: [] };
      const updated: LevelRating = {
        ...existing,
        userRating: value,
      };
      
      const nextRatings = {
        ...prev,
        [levelId]: updated,
      };
      
      localStorage.setItem('gd3d_ratings', JSON.stringify(nextRatings));
      return nextRatings;
    });
  };

  const getLevelRatingStats = (levelId: string) => {
    const record = ratings[levelId];
    if (!record) {
      return { avg: 0, count: 0 };
    }
    const allVotes = [...record.communityRatings];
    if (record.userRating > 0) {
      allVotes.push(record.userRating);
    }
    if (allVotes.length === 0) {
      return { avg: 0, count: 0 };
    }
    const sum = allVotes.reduce((acc, v) => acc + v, 0);
    return {
      avg: sum / allVotes.length,
      count: allVotes.length,
    };
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'NORMAL': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'HARD': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'INSANE': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'DEMON': return 'text-red-400 bg-red-400/10 border-red-500/20 font-bold tracking-widest';
      default: return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  const getDifficultyEmoji = (difficulty: string) => {
    switch (difficulty) {
      case 'EASY': return '😊';
      case 'NORMAL': return '😎';
      case 'HARD': return '🔥';
      case 'INSANE': return '⚡';
      case 'DEMON': return '👿';
      default: return '👾';
    }
  };

  return (
    <div className="bg-black/60 backdrop-blur-md border-2 border-white/10 p-6 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative overflow-hidden w-full h-full flex flex-col justify-between">
      {/* Decorative ambient glowing lines */}
      <div className="absolute top-0 right-0 w-[4px] h-32 bg-[#00FF95]/30"></div>
      <div className="absolute bottom-0 left-0 w-32 h-[4px] bg-[#00FF95]/20"></div>

      <div>
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <div className="flex flex-col">
            <span className="text-[#00FF95] font-mono text-[10px] tracking-widest uppercase mb-1 font-bold">{t.rhythmMetadata}</span>
            <h2 className="text-3xl font-sans font-black text-white tracking-tighter uppercase italic leading-none">{t.selectLevel}</h2>
          </div>
          {onCreateLevel && (
            <button
              onClick={onCreateLevel}
              className="px-3 py-1.5 bg-[#00FF95]/15 border border-[#00FF95]/45 hover:bg-[#00FF95] hover:text-black text-[#00FF95] font-mono font-black text-[10px] tracking-wider uppercase transition-all flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {t.buildLevel}
            </button>
          )}
        </div>

        <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
          {levels.map((level) => {
            const isActive = level.id === activeLevelId;
            const progress = completedPercentages[level.id] || 0;
            const attempts = bestAttempts[level.id] || 0;
            const diffColor = getDifficultyColor(level.difficulty);
            const diffEmoji = getDifficultyEmoji(level.difficulty);
            const isCustom = level.id.startsWith('custom_');
            const ratingStats = getLevelRatingStats(level.id);

            return (
              <div
                key={level.id}
                id={`level-card-${level.id}`}
                className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border-2 transition-all duration-300 gap-4 ${
                  isActive
                    ? 'border-[#00FF95] bg-[#00FF95]/5 shadow-[0_0_20px_rgba(0,255,149,0.15)]'
                    : 'border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.03]'
                }`}
              >
                {/* Level Left Side Specs */}
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  {/* Difficulty Face Badge */}
                  <div 
                    className="w-12 h-12 flex items-center justify-center text-2xl border"
                    style={{ 
                      backgroundColor: `${level.color}15`, 
                      borderColor: level.color,
                      boxShadow: `0 0 10px ${level.color}30`
                    }}
                  >
                    {diffEmoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap pb-1 border-b border-white/5 md:border-b-0 md:pb-0">
                      <h3 className="text-md font-sans font-black text-white tracking-tight uppercase italic truncate max-w-[180px] sm:max-w-none">{level.name}</h3>
                      <span className={`text-[9px] uppercase font-mono px-2.5 py-0.5 border font-bold tracking-widest ${diffColor}`}>
                        {level.difficulty}
                      </span>
                      {ratingStats.count > 0 && (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-black text-yellow-400 border border-yellow-500/20 bg-yellow-500/5 px-2 py-0.5 rounded shadow-[0_0_8px_rgba(234,179,8,0.15)]" title={`${ratingStats.count} total votes`}>
                          <Star className="w-3 h-3 fill-current text-yellow-500" />
                          <span>{ratingStats.avg.toFixed(1)}</span>
                          <span className="text-[8px] text-zinc-500 font-normal">({ratingStats.count})</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-400 font-mono flex-wrap">
                      <span className="flex items-center gap-0.5 text-yellow-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-current animate-pulse text-yellow-450" /> {level.starsAvailable} {t.stars}
                      </span>
                      <span className="text-zinc-750">|</span>
                      <span>{t.speed}: {level.speed}X</span>
                      {attempts > 0 && (
                        <>
                          <span className="text-zinc-750">|</span>
                          <span>{t.attempts}: {attempts}</span>
                        </>
                      )}
                    </div>

                    {/* Interactive 5-Star Rating Row */}
                    <div className="mt-3 pt-2.5 border-t border-white/5 flex flex-wrap items-center gap-2 font-mono">
                      {attempts > 0 ? (
                        <>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
                            {language === 'DE' ? 'BEWERTEN:' : 'RATE RUN:'}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((starVal) => {
                              const userRecord = ratings[level.id] || { userRating: 0, communityRatings: [] };
                              const userVal = userRecord.userRating;
                              const isHovered = hoverLevelId === level.id && starVal <= hoverRating;
                              const isSelected = !isHovered && starVal <= userVal;
                              const isActiveAndHoveringCurrent = hoverLevelId === level.id;
                              const isLit = isHovered || isSelected || (isActiveAndHoveringCurrent && starVal <= hoverRating);
                              
                              return (
                                <button
                                  key={starVal}
                                  onClick={() => handleRateLevel(level.id, starVal)}
                                  onMouseEnter={() => {
                                    setHoverLevelId(level.id);
                                    setHoverRating(starVal);
                                  }}
                                  onMouseLeave={() => {
                                    setHoverLevelId(null);
                                    setHoverRating(0);
                                  }}
                                  className="p-0.5 hover:scale-125 transition-all duration-100 cursor-pointer text-zinc-600 active:scale-95"
                                  title={`Rate ${starVal} Star${starVal > 1 ? 's' : ''}`}
                                >
                                  <Star 
                                    className={`w-3.5 h-3.5 transition-all duration-100 ${
                                      isLit 
                                        ? 'fill-current text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]' 
                                        : 'text-zinc-700 hover:text-yellow-400/40'
                                    }`} 
                                  />
                                </button>
                              );
                            })}
                          </div>
                          {(ratings[level.id]?.userRating || 0) > 0 && (
                            <span className="text-[9px] text-[#00FF95] bg-[#00FF95]/5 border border-[#00FF95]/20 px-1.5 py-0.2 font-black uppercase text-center rounded-[2px]">
                              {language === 'DE' ? 'GEWÄHLT:' : 'RATED'} {(ratings[level.id]?.userRating || 0)} ★
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-1 select-none">
                          🔒 {language === 'DE' ? 'ZUM BEWERTEN MINDESTENS EINMAL SPIELEN' : 'PLAY RUN AT LEAST ONCE TO RATE LEVEL'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress and Action Button */}
                <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                  {/* Horizontal progress bar */}
                  <div className="w-24 text-right hidden sm:block">
                    <div className="flex justify-between text-[9px] font-mono text-zinc-500 mb-1">
                      <span className="font-bold uppercase tracking-wider">{t.progress}</span>
                      <span className="text-[#00FF95] font-black">{progress}%</span>
                    </div>
                    <div className="w-full bg-white/5 h-2 overflow-hidden border border-white/10">
                      <div 
                        className="bg-[#00FF95] h-full shadow-[0_0_8px_#00FF95] transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {isCustom && (
                    <div className="flex gap-1">
                      {onEditLevel && (
                        <button
                          onClick={() => onEditLevel(level)}
                          className="p-2 border border-white/10 hover:border-[#00FF95]/50 hover:bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer"
                          title="Edit Custom Level"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDeleteLevel && (
                        <button
                          onClick={() => onDeleteLevel(level.id)}
                          className="p-2 border border-white/10 hover:border-red-500/55 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 transition-all cursor-pointer"
                          title="Delete Level"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Play select button */}
                  <button
                    id={`play-btn-${level.id}`}
                    onClick={() => onSelectLevel(level.id)}
                    className={`px-4 py-2 flex items-center justify-center gap-1.5 text-xxs font-mono font-black tracking-widest uppercase transition-all duration-200 border ${
                      isActive
                        ? 'bg-[#00FF95] text-black border-[#00FF95] shadow-[0_0_10px_rgba(0,255,149,0.3)]'
                        : 'bg-transparent text-white border-white/20 hover:border-white/40 hover:bg-white/5'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {isActive ? 'Active' : 'Load'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
