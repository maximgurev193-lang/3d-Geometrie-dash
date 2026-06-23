import { Skin } from '../types';
import { Sparkles, Check, Lock, Star } from 'lucide-react';
import { useLanguage } from '../utils/translations';

interface SkinSelectorProps {
  skins: Skin[];
  activeSkinId: string;
  starsCollected: number;
  onSelectSkin: (skinId: string) => void;
  onUnlockSkin: (skinId: string) => void;
}

export default function SkinSelector({
  skins,
  activeSkinId,
  starsCollected,
  onSelectSkin,
  onUnlockSkin,
}: SkinSelectorProps) {
  const { t } = useLanguage();
  return (
    <div className="bg-black/60 backdrop-blur-md border-2 border-white/10 p-6 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative overflow-hidden w-full h-full flex flex-col justify-between">
      {/* Decorative ambient glowing lines */}
      <div className="absolute top-0 left-0 w-[4px] h-32 bg-[#00FF95]/30"></div>
      <div className="absolute bottom-0 right-0 w-32 h-[4px] bg-[#00FF95]/20"></div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex flex-col">
            <span className="text-[#00FF95] font-mono text-[10px] tracking-widest uppercase mb-1 font-bold">{t.selectClass}</span>
            <h2 className="text-3xl font-sans font-black text-white tracking-tighter uppercase italic leading-none">{t.customizer}</h2>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/20 px-3.5 py-1.5 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
            <span className="text-yellow-400 font-mono font-black text-xs tracking-wider uppercase">{starsCollected} {t.stars.toUpperCase()}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-[300px] overflow-y-auto pr-1">
          {skins.map((skin) => {
            const isActive = skin.id === activeSkinId;
            const isUnlocked = skin.unlocked;
            const canAfford = starsCollected >= skin.price;

            return (
              <button
                key={skin.id}
                id={`skin-btn-${skin.id}`}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectSkin(skin.id);
                  } else if (canAfford) {
                    onUnlockSkin(skin.id);
                  }
                }}
                className={`relative flex flex-col items-center justify-between p-4 border-2 transition-all duration-300 ${
                  isActive
                    ? 'border-[#00FF95] bg-[#00FF95]/5 shadow-[0_0_20px_rgba(0,255,149,0.15)]'
                    : isUnlocked
                    ? 'border-white/5 bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.03]'
                    : canAfford
                    ? 'border-yellow-600/30 bg-yellow-950/5 hover:border-yellow-500 hover:bg-yellow-950/10'
                    : 'border-white/5 bg-transparent opacity-40 cursor-not-allowed'
                }`}
              >
                {/* Actual Graphic Representation of Cube Face */}
                <div 
                  className="w-14 h-14 relative flex items-center justify-center border-2 mb-3 transition-transform hover:scale-105"
                  style={{
                    backgroundColor: skin.primaryColor,
                    borderColor: skin.secondaryColor,
                    boxShadow: `0 0 12px ${skin.glowColor}50`
                  }}
                >
                  {/* Embedded expression vector lines */}
                  <div className="w-full h-full relative flex items-center justify-center">
                    {skin.faceType === 'happy' && (
                      <svg className="w-8 h-8 text-black fill-current" viewBox="0 0 24 24">
                        <circle cx="8" cy="10" r="1.5" />
                        <circle cx="16" cy="10" r="1.5" />
                        <path d="M 6,14 Q 12,20 18,14" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                    {skin.faceType === 'angry' && (
                      <svg className="w-8 h-8 text-black fill-current" viewBox="0 0 24 24">
                        <path d="M5,7 L9,10" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                        <path d="M19,7 L15,10" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                        <circle cx="8" cy="12" r="1.5" />
                        <circle cx="16" cy="12" r="1.5" />
                        <path d="M 8,17 Q 12,15 16,17" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                    {skin.faceType === 'cool' && (
                      <svg className="w-8 h-8 text-black" viewBox="0 0 24 24">
                        {/* Shades */}
                        <path d="M4,10 C4,10 7,9 12,9 C17,9 20,10 20,10 L19,13 C19,13 17,14 15,14 C13,14 12,13 12,13 C12,13 11,14 9,14 C7,14 5,13 5,13 Z" fill="currentColor" />
                        {/* Smile */}
                        <path d="M 8,17 Q 12,19 16,17" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                    {skin.faceType === 'retro' && (
                      <div className="grid grid-cols-5 grid-rows-5 gap-0.5 w-7 h-7">
                        <div className="bg-black col-start-1 row-start-2"></div>
                        <div className="bg-black col-start-1 row-start-3"></div>
                        <div className="bg-black col-start-5 row-start-2"></div>
                        <div className="bg-black col-start-5 row-start-3"></div>
                        <div className="bg-black col-start-2 row-start-5"></div>
                        <div className="bg-black col-start-3 row-start-5"></div>
                        <div className="bg-black col-start-4 row-start-5"></div>
                      </div>
                    )}
                    {skin.faceType === 'glowing' && (
                      <svg className="w-8 h-8" viewBox="0 0 24 24">
                        <ellipse cx="7" cy="10" rx="3" ry="1.5" fill="white" className="animate-pulse" />
                        <ellipse cx="17" cy="10" rx="3" ry="1.5" fill="white" className="animate-pulse" />
                        <path d="M 7,16 h 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                    {skin.faceType === 'derp' && (
                      <svg className="w-8 h-8 text-black" viewBox="0 0 24 24">
                        <circle cx="7" cy="10" r="2.5" fill="white" stroke="black" strokeWidth="1" />
                        <circle cx="6.5" cy="10" r="1" fill="black" />
                        <circle cx="17" cy="10" r="2.5" fill="white" stroke="black" strokeWidth="1" />
                        <circle cx="18" cy="10" r="1" fill="black" />
                        <path d="M 9,15 Q 12,13 15,16" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Skin metadata */}
                <div className="text-center w-full font-sans">
                  <p className="text-xs font-mono font-bold text-white truncate w-full uppercase">{skin.name}</p>
                  
                  {/* Secondary/purchase tier status */}
                  <div className="mt-2 flex items-center justify-center gap-1 font-mono">
                    {isUnlocked ? (
                      isActive ? (
                        <span className="text-[10px] uppercase font-bold text-[#00FF95] flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> {t.equipped}
                        </span>
                      ) : (
                        <span className="text-[10px] uppercase text-zinc-500 font-bold">{t.unlockedWord}</span>
                      )
                    ) : (
                      <div className="flex items-center gap-0.5 bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 text-[9px] font-bold text-yellow-400 uppercase tracking-wider">
                        {canAfford ? (
                          <div className="flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5 text-yellow-400 animate-spin" />
                            <span>{t.equip} // {skin.price}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-0.5 text-zinc-500">
                            <Lock className="w-2.5 h-2.5" />
                            <span>{t.locked} // {skin.price}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
