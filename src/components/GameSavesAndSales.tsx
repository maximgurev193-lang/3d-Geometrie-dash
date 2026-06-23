import React, { useState, useEffect } from 'react';
import { 
  CloudRain, 
  CloudLightning, 
  Cloud, 
  CloudUpload, 
  CloudDownload, 
  ShoppingBag, 
  Sparkles, 
  Tag, 
  Star, 
  Check, 
  Flame, 
  TrendingUp, 
  BookOpen, 
  Upload, 
  AlertCircle,
  Coins
} from 'lucide-react';
import { Level, Skin } from '../types';

interface GameSavesAndSalesProps {
  starsBalance: number;
  completedPercentages: Record<string, number>;
  bestAttempts: Record<string, number>;
  customLevels: Level[];
  skins: Skin[];
  activeSkinId: string;
  onImportCustomLevel: (level: Level) => void;
  onStateRestore: (restoredData: {
    starsBalance: number;
    completedPercentages: Record<string, number>;
    bestAttempts: Record<string, number>;
    customLevels: Level[];
    activeSkinId: string;
    unlockedSkinIds: string[];
  }) => void;
  onSpendStars: (amount: number) => void;
  onRewardStars: (amount: number) => void;
}

export default function GameSavesAndSales({
  starsBalance,
  completedPercentages,
  bestAttempts,
  customLevels,
  skins,
  activeSkinId,
  onImportCustomLevel,
  onStateRestore,
  onSpendStars,
  onRewardStars,
}: GameSavesAndSalesProps) {
  const [activeTab, setActiveTab] = useState<'saves' | 'marketplace' | 'deals'>('saves');

  // Cloud Saves states
  const [username, setUsername] = useState('');
  const [saveStatus, setSaveStatus] = useState<{ status: 'idle' | 'loading' | 'success' | 'error'; msg: string }>({ status: 'idle', msg: '' });
  const [restoreStatus, setRestoreStatus] = useState<{ status: 'idle' | 'loading' | 'success' | 'error'; msg: string }>({ status: 'idle', msg: '' });

  // Marketplace states
  const [marketLevels, setMarketLevels] = useState<any[]>([]);
  const [marketLoading, setMarketLoading] = useState(false);
  const [selectedLevelToPublishId, setSelectedLevelToPublishId] = useState('');
  const [publishPrice, setPublishPrice] = useState('3');
  const [publishStatus, setPublishStatus] = useState<{ status: 'idle' | 'loading' | 'success' | 'error'; msg: string }>({ status: 'idle', msg: '' });
  const [buyStatus, setBuyStatus] = useState<Record<string, { status: 'idle' | 'loading' | 'success' | 'error'; msg: string }>>({});

  // Dynamic Skin Flash Sale (50% off!)
  const [flashSaleSkin, setFlashSaleSkin] = useState<Skin | null>(null);
  const [flashSalePrice, setFlashSalePrice] = useState(0);

  // Auto-load marketplace levels and generate a flash sale on boot
  useEffect(() => {
    fetchMarketplace();
    generateFlashSale();
  }, []);

  const fetchMarketplace = async () => {
    setMarketLoading(true);
    try {
      const response = await fetch('/api/marketplace');
      const data = await response.json();
      if (data.marketplace) {
        setMarketLevels(data.marketplace);
      }
    } catch (e) {
      console.error('Failed to fetch marketplace levels', e);
    } finally {
      setMarketLoading(false);
    }
  };

  const generateFlashSale = () => {
    // Pick first locked skin with price > 0
    const lockedSkins = skins.filter(s => !s.unlocked && s.price > 0);
    if (lockedSkins.length > 0) {
      // Pick one randomly or deterministic by day or first available
      const selected = lockedSkins[0];
      setFlashSaleSkin(selected);
      setFlashSalePrice(Math.max(1, Math.round(selected.price * 0.5))); // 50% calculated off, minimum 1
    } else {
      setFlashSaleSkin(null);
    }
  };

  // Perform Cloud Save Backup
  const handleCloudBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setSaveStatus({ status: 'error', msg: 'Please configure a player name to sync saves.' });
      return;
    }

    setSaveStatus({ status: 'loading', msg: 'Initiating cyber backup...' });

    try {
      const response = await fetch('/api/saves/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          starsBalance,
          completedPercentages,
          bestAttempts,
          customLevels,
          activeSkinId,
          skins
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSaveStatus({ status: 'success', msg: data.message });
        setTimeout(() => setSaveStatus({ status: 'idle', msg: '' }), 4000);
      } else {
        throw new Error(data.error || 'Server rejected backup stream.');
      }
    } catch (err: any) {
      setSaveStatus({ status: 'error', msg: err.message || 'Backup connection error' });
    }
  };

  // Perform Cloud Restore
  const handleCloudRestore = async () => {
    if (!username.trim()) {
      setRestoreStatus({ status: 'error', msg: 'Type your Username to fetch saves.' });
      return;
    }

    setRestoreStatus({ status: 'loading', msg: 'Retrieving cloud matrices...' });

    try {
      const response = await fetch(`/api/saves/restore/${encodeURIComponent(username)}`);
      const data = await response.json();

      if (response.ok && data.success && data.userData) {
        const uData = data.userData;
        
        // Pass to parent handler to configure local state
        onStateRestore({
          starsBalance: uData.starsBalance || 0,
          completedPercentages: uData.completedPercentages || {},
          bestAttempts: uData.bestAttempts || {},
          customLevels: uData.customLevels || [],
          activeSkinId: uData.activeSkinId || 'default',
          unlockedSkinIds: uData.skins ? uData.skins.filter((s: any) => s.unlocked).map((s: any) => s.id) : ['default']
        });

        setRestoreStatus({ status: 'success', msg: `Sync Complete! Unlocked ${uData.starsBalance} Stars and custom tracks.` });
        setTimeout(() => setRestoreStatus({ status: 'idle', msg: '' }), 4000);
      } else {
        throw new Error(data.error || 'User saving packet not found.');
      }
    } catch (err: any) {
      setRestoreStatus({ status: 'error', msg: err.message || 'Backup packet missing.' });
    }
  };

  // Publish / Sell level
  const handlePublishLevel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLevelToPublishId) {
      setPublishStatus({ status: 'error', msg: 'Select a custom level to supply.' });
      return;
    }

    const level = customLevels.find(l => l.id === selectedLevelToPublishId);
    if (!level) return;

    setPublishStatus({ status: 'loading', msg: 'Uploading schema to store...' });

    const priceNum = parseInt(publishPrice, 10);
    const resolvedCreator = username.trim() || 'Offline Maker';

    try {
      const response = await fetch('/api/marketplace/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          price: priceNum,
          creator: resolvedCreator
        })
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setPublishStatus({ status: 'success', msg: `Level "${level.name}" is now listed for ${priceNum} Stars!` });
        // Refresh catalog list
        fetchMarketplace();
        setSelectedLevelToPublishId('');
        setTimeout(() => setPublishStatus({ status: 'idle', msg: '' }), 3000);
      } else {
        throw new Error(data.error || 'Server rejected publisher stream.');
      }
    } catch (err: any) {
      setPublishStatus({ status: 'error', msg: err.message || 'Publishing error' });
    }
  };

  // Purchase/Buy level from marketplace
  const handleBuyMarketplaceLevel = async (mLevel: any) => {
    if (starsBalance < mLevel.price) {
      setBuyStatus(prev => ({
        ...prev,
        [mLevel.id]: { status: 'error', msg: 'Not enough Stars! Conquer maps to earn more.' }
      }));
      setTimeout(() => setBuyStatus(prev => ({ ...prev, [mLevel.id]: { status: 'idle', msg: '' } })), 3000);
      return;
    }

    setBuyStatus(prev => ({ ...prev, [mLevel.id]: { status: 'loading', msg: 'Exchanging stars...' } }));

    try {
      // Record purchase on backend server
      const response = await fetch('/api/marketplace/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ levelId: mLevel.id })
      });

      if (!response.ok) {
        throw new Error('Transaction declined.');
      }

      // Deduct Stars locally
      onSpendStars(mLevel.price);

      // Import level structure into our levels catalog
      const importedLevel: Level = {
        id: `market_bought_${mLevel.id}_${Date.now()}`,
        name: mLevel.name,
        difficulty: mLevel.difficulty,
        speed: mLevel.speed,
        color: mLevel.color,
        bpm: mLevel.bpm,
        obstacles: mLevel.obstacles,
        length: mLevel.length,
        starsAvailable: mLevel.starsAvailable || 3
      };

      onImportCustomLevel(importedLevel);

      setBuyStatus(prev => ({
        ...prev,
        [mLevel.id]: { status: 'success', msg: 'Purchased! Loaded to levels menu.' }
      }));

      // Refresh list to pull newest purchase count telemetry
      fetchMarketplace();

      setTimeout(() => setBuyStatus(prev => ({ ...prev, [mLevel.id]: { status: 'idle', msg: '' } })), 3000);
    } catch (err: any) {
      setBuyStatus(prev => ({
        ...prev,
        [mLevel.id]: { status: 'error', msg: err.message || 'Transaction error' }
      }));
    }
  };

  // Flash Sale Purchase
  const handleBuyFlashSale = () => {
    if (!flashSaleSkin) return;
    if (starsBalance < flashSalePrice) {
      alert('Insufficient Stars balance for this special offer.');
      return;
    }

    // Spend the stars
    onSpendStars(flashSalePrice);

    // Save and unlock skin locally via active skin selection
    const storedUnlockedSkins = localStorage.getItem('gd3d_unlocked_skins');
    let unlockedIds: string[] = ['default'];
    try {
      if (storedUnlockedSkins) {
        unlockedIds = JSON.parse(storedUnlockedSkins);
      }
    } catch (e) {
      console.error(e);
    }

    if (!unlockedIds.includes(flashSaleSkin.id)) {
      unlockedIds.push(flashSaleSkin.id);
    }
    
    localStorage.setItem('gd3d_unlocked_skins', JSON.stringify(unlockedIds));
    localStorage.setItem('gd3d_stars', (starsBalance - flashSalePrice).toString());

    // Update parent about restored skin structures
    onStateRestore({
      starsBalance: starsBalance - flashSalePrice,
      completedPercentages,
      bestAttempts,
      customLevels,
      activeSkinId: flashSaleSkin.id,
      unlockedSkinIds: unlockedIds
    });

    alert(`🎉 Congratulations! You purchased the custom skin "${flashSaleSkin.name}" at 50% discount!`);
    generateFlashSale(); // regenerate flash deals (refreshing unlocks list)
  };

  return (
    <div className="bg-black/80 backdrop-blur-md border-2 border-white/10 p-6 shadow-[0_0_35px_rgba(0,0,0,0.9)] relative overflow-hidden w-full flex flex-col justify-between">
      
      {/* Visual cybernetic frame decorations */}
      <div className="absolute top-0 right-0 w-[4px] h-24 bg-purple-500/40"></div>
      <div className="absolute bottom-0 left-0 w-24 h-[4px] bg-purple-500/30"></div>

      <div>
        {/* Header containing metadata */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-4">
          <div className="flex flex-col">
            <span className="text-purple-400 font-mono text-[9px] tracking-[0.3em] uppercase mb-1 font-black">MARKETPLACE & CYBER-STORAGE</span>
            <h2 className="text-2xl font-sans font-black text-white tracking-tighter uppercase italic leading-none">
              SAVES & MARKET SALES
            </h2>
          </div>

          {/* Mini-tab controls */}
          <div className="flex gap-1.5 font-mono text-[10px]">
            <button
              onClick={() => setActiveTab('saves')}
              className={`px-3 py-1.5 border uppercase font-bold tracking-wider transition-all cursor-pointer ${
                activeTab === 'saves' 
                  ? 'bg-purple-900/30 border-purple-500 text-purple-400 font-black' 
                  : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              ☁️ Cloud Saves
            </button>
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-3 py-1.5 border uppercase font-bold tracking-wider transition-all cursor-pointer ${
                activeTab === 'marketplace' 
                  ? 'bg-purple-900/30 border-purple-500 text-purple-400 font-black' 
                  : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              🛒 Level Sales
            </button>
            <button
              onClick={() => setActiveTab('deals')}
              className={`px-3 py-1.5 border uppercase font-bold tracking-wider transition-all cursor-pointer relative ${
                activeTab === 'deals' 
                  ? 'bg-purple-900/30 border-purple-500 text-purple-400 font-black' 
                  : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              {flashSaleSkin && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white font-mono font-black text-[7px] px-1 py-0.5 rounded-sm animate-pulse tracking-tight uppercase">SALE</span>
              )}
              🔥 Skin Deals
            </button>
          </div>
        </div>

        {/* TAB 1: Cloud Saves System */}
        {activeTab === 'saves' && (
          <div className="space-y-4 font-sans text-xs">
            <div className="bg-purple-500/5 border border-purple-500/20 p-3.5 rounded-lg flex gap-3">
              <CloudLightning className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-zinc-300">
                <p className="font-bold text-white uppercase text-[10px] tracking-wider font-mono">Quantum Account Backup</p>
                <p className="leading-relaxed text-[11px]">Syncing logs your stars, unlocked shapes, attempt metadata, and offline custom levels to the master servers. Backup case-insensitive saves using a simple username code!</p>
              </div>
            </div>

            {/* Form layout */}
            <form onSubmit={handleCloudBackup} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-black">Sync Username Key</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                    placeholder="Enter unique profile tag (e.g. NeoCube99)"
                    maxLength={18}
                    className="flex-1 bg-zinc-950 border border-white/10 text-xs px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-purple-500 text-white placeholder:text-zinc-600 font-mono tracking-wide"
                  />
                  <button
                    type="button"
                    onClick={handleCloudRestore}
                    disabled={!username.trim() || restoreStatus.status === 'loading'}
                    className="px-4 py-2.5 bg-zinc-900 border border-white/10 hover:border-purple-500 text-zinc-300 hover:text-purple-400 font-mono font-black text-[10px] uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <CloudDownload className="w-4 h-4 shrink-0" />
                    Restore
                  </button>
                </div>
              </div>

              {/* Status messages and feedback flags */}
              {(saveStatus.msg || restoreStatus.msg) && (
                <div className={`p-3 border rounded-lg font-mono text-[10px] flex items-center gap-2 ${
                  saveStatus.status === 'error' || restoreStatus.status === 'error'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : saveStatus.status === 'success' || restoreStatus.status === 'success'
                    ? 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                    : 'bg-zinc-900/80 border-white/5 text-zinc-400'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{saveStatus.msg || restoreStatus.msg}</span>
                </div>
              )}

              {/* Submit Sync action */}
              <button
                type="submit"
                disabled={!username.trim() || saveStatus.status === 'loading'}
                className="w-full py-3 border-2 border-purple-500 bg-purple-500/5 hover:bg-purple-500 text-purple-400 hover:text-black font-mono font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_25px_rgba(168,85,247,0.3)]"
              >
                <CloudUpload className="w-4.5 h-4.5 shrink-0" />
                Backup Profile to Cloud Save
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: Level Sales Marketplace */}
        {activeTab === 'marketplace' && (
          <div className="space-y-4 text-xs font-sans">
            
            {/* Split screen: Store catalog and Sell level portal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              
              {/* Catalog Panel */}
              <div className="space-y-2 border-r border-white/5 pr-0 md:pr-4">
                <div className="flex items-center justify-between pb-1.5 border-b border-white/5 mb-2">
                  <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-black">Community Shop Catalogue</span>
                  <button onClick={fetchMarketplace} className="text-[9.5px] font-mono text-purple-400 hover:underline uppercase font-bold cursor-pointer">🔄 Reload</button>
                </div>

                {marketLoading ? (
                  <div className="text-center py-10 font-mono text-zinc-500 text-[10px] uppercase tracking-widest">Loading Catalog...</div>
                ) : marketLevels.length === 0 ? (
                  <div className="text-center py-10 text-zinc-600 text-[10px] font-mono uppercase">Market catalog is currently empty</div>
                ) : (
                  <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {marketLevels.map((ml) => {
                      const userStats = buyStatus[ml.id] || { status: 'idle', msg: '' };
                      return (
                        <div key={ml.id} className="p-2.5 bg-zinc-950 border border-white/5 hover:border-white/10 rounded-lg flex flex-col justify-between gap-2 transition-all">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-black text-[11px] text-white uppercase italic truncate max-w-[120px] leading-tight-none">{ml.name}</h4>
                              <p className="text-[8.5px] text-zinc-500 font-mono uppercase mt-0.5">By: <span className="text-zinc-300">{ml.creator}</span></p>
                            </div>
                            <span className="px-1.5 py-0.5 bg-zinc-900 border border-white/5 text-[8.5px] font-mono text-zinc-400">{ml.difficulty}</span>
                          </div>

                          <div className="flex items-center justify-between font-mono text-[9px] text-zinc-400 mt-0.5">
                            <span className="flex items-center gap-0.5 text-zinc-500"><TrendingUp className="w-3 h-3" /> Sales: {ml.purchasesCount || 0}</span>
                            <span className="flex items-center gap-0.5 text-yellow-500"><Star className="w-3 h-3 fill-current text-yellow-400" /> Reward: {ml.starsAvailable || 3}</span>
                          </div>

                          {/* Purchase or buy triggers */}
                          {userStats.msg ? (
                            <div className={`p-1 text-center text-[8.5px] font-mono ${userStats.status === 'error' ? 'text-red-400' : 'text-purple-400'}`}>
                              {userStats.msg}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleBuyMarketplaceLevel(ml)}
                              className="w-full py-1.5 bg-purple-950/20 border border-purple-500/40 hover:bg-purple-500 hover:text-black font-sans font-black text-[9.5px] text-purple-400 tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <ShoppingBag className="w-3 h-3" />
                              Buy Level // {ml.price} Stars
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Sell / Publish Panel */}
              <div className="space-y-3 pt-4 md:pt-0">
                <span className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase font-black block border-b border-white/5 pb-2">Sell Custom Track</span>
                
                {customLevels.length === 0 ? (
                  <div className="p-4 bg-zinc-900/30 border border-white/5 rounded-lg text-center font-mono text-[10px] text-zinc-500">
                    Create a custom level in Level Selector to sell on the market!
                  </div>
                ) : (
                  <form onSubmit={handlePublishLevel} className="space-y-3 font-sans">
                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-bold">Select Level</label>
                      <select
                        value={selectedLevelToPublishId}
                        onChange={(e) => setSelectedLevelToPublishId(e.target.value)}
                        className="w-full bg-zinc-950 border border-white/10 text-[11px] text-white px-2 py-2 rounded-md focus:border-purple-500 outline-none uppercase font-mono tracking-tight"
                      >
                        <option value="">-- CHOOSE LEVEL --</option>
                        {customLevels.map(cl => (
                          <option key={cl.id} value={cl.id}>{cl.name.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-bold">Trading Star Price</label>
                      <select
                        value={publishPrice}
                        onChange={(e) => setPublishPrice(e.target.value)}
                        className="w-full bg-zinc-950 border border-white/10 text-[11px] text-white px-2 py-2 rounded-md focus:border-purple-500 outline-none font-mono"
                      >
                        {[1, 2, 3, 5, 8, 12, 15, 20].map(val => (
                          <option key={val} value={val}>{val} Stars</option>
                        ))}
                      </select>
                    </div>

                    {publishStatus.msg && (
                      <p className={`p-1 text-[8.5px] font-mono ${publishStatus.status === 'error' ? 'text-red-400' : 'text-purple-400'}`}>
                        {publishStatus.msg}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={!selectedLevelToPublishId || publishStatus.status === 'loading'}
                      className="w-full py-2 bg-purple-500/10 border border-purple-500 hover:bg-purple-500 hover:text-black font-sans font-black text-[10px] tracking-widest text-purple-400 uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-45"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      List on Market
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: Cyber Skin Deals & Discounts */}
        {activeTab === 'deals' && (
          <div className="space-y-4 text-xs font-sans">
            <div className="bg-gradient-to-r from-red-900/10 to-orange-950/15 border border-red-500/30 p-3.5 rounded-lg flex gap-3 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-red-500/5 rounded-full blur-xl animate-pulse"></div>
              <Flame className="w-5 h-5 text-red-500 shrink-0 mt-0.5 animate-bounce" />
              <div className="space-y-1">
                <p className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 uppercase text-[10px] font-mono tracking-widest">
                  FLASH DISCOUNT OUTPOST
                </p>
                <p className="leading-relaxed text-zinc-300 text-[11px]">Daily special deals! Cybernetic skin configurations are discounted by 50% for high priority runners. Purchase today before prices reset back to normal.</p>
              </div>
            </div>

            {flashSaleSkin ? (
              <div className="bg-zinc-950 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-6 hover:border-red-500/20 transition-all">
                <div className="flex items-center gap-4">
                  {/* Miniature Graphics */}
                  <div 
                    className="w-12 h-12 flex items-center justify-center border-2 border-dashed shrink-0" 
                    style={{ 
                      backgroundColor: flashSaleSkin.primaryColor, 
                      borderColor: flashSaleSkin.secondaryColor,
                      boxShadow: `0 0 10px ${flashSaleSkin.glowColor}50`
                    }}
                  >
                    <svg className="w-6 h-6 text-black" viewBox="0 0 24 24">
                      <circle cx="8" cy="11" r="1.5" />
                      <circle cx="16" cy="11" r="1.5" />
                      <path d="M 7,16 q 5,3 10,0" fill="none" stroke="black" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-black text-xs text-white uppercase italic">{flashSaleSkin.name}</h4>
                      <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-1 py-0.5 text-[7px] font-black tracking-widest font-mono uppercase">50% SALE</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-mono uppercase mt-0.5">Price: <span className="text-zinc-500 line-through font-bold">{flashSaleSkin.price} Stars</span> ➡️ <span className="text-red-400 font-black">{flashSalePrice} Stars</span></p>
                  </div>
                </div>

                <button
                  onClick={handleBuyFlashSale}
                  className="px-4 py-2.5 bg-red-600/20 hover:bg-red-600 border border-red-500 text-red-400 hover:text-white font-mono font-black text-[10px] tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                >
                  <Tag className="w-3.5 h-3.5 shrink-0" />
                  Claim Deal
                </button>
              </div>
            ) : (
              <div className="p-6 bg-zinc-900/40 border border-white/5 rounded-xl text-center text-zinc-500 font-mono text-[10px]">
                🎉 You have successfully purchased and unlocked all currently available skin collections!
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
