import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, MessageSquare, BrainCircuit, X, Send, Bot, Play, Save, ChevronRight, Gamepad2, Compass, AlertCircle, Activity, ChevronDown, ChevronUp, Volume2, VolumeX, Shield, Swords, Zap, RefreshCw, BarChart3, Radio } from 'lucide-react';
import { Level, PlayerStats } from '../types';
import { useLanguage } from '../utils/translations';

const botTranslations = {
  EN: {
    welcome: "System online! 🤖 I'm GD-Bot, your cybernetic co-pilot. I can analyze your stats, give you survival tricks for the track, or use AI to synthesize brand new levels! What are we conquering today?",
    cue: "SYSTEM COMPANION",
    liveAi: "LIVE AI",
    coachingOn: "COACHING ON",
    survivalCoach: "Survival Coach",
    aiLevelBuilder: "AI Level Builder",
    askAnything: "Ask GD-Bot anything...",
    quickLabels: "Quick Command Questions:",
    conquerTips: "💡 Survive",
    tellJoke: "🎲 Tell a Cube Joke",
    explainPortals: "🎮 Explain portals",
    descBuilder: "Voxel Generative Synth",
    descSub: "Describe the ideal pacing, decoration theme, speed, or color palette. Gemini will dynamically assemble custom coordinate layouts to spec!",
    labelPrompt: "Aesthetic Prompt",
    labelDiff: "Mathematical Difficulty",
    noCompiled: "No Compiled Matrix",
    noCompiledDesc: "Input any crazy request above, then tap \"Build with AI\" to let Gemini do the heavy lifting!",
    buildAi: "Build Level with AI",
    mapSynth: "MAP SYNTHESIZED!",
    aiOriginal: "AI ORIGINAL",
    btnSaveLoad: "Save & Load Level",
    btnGenerating: "GENERATING LEVEL...",
    stabilized: "Architecture stabilized!",
    imported: "✔️ LEVEL CONFIGURED IN RUNNER!",
    telemetryTitle: "CO-PILOT METRIC TELEMETRY",
    threatIndex: "THREAT INDEX",
    jumpsPerAttempt: "JUMPS / ATTEMPT",
    elementAnalysis: "ELEMENT FREQUENCY ANALYSIS",
    noStats: "Start a level to stream real-time coordinate logs."
  },
  DE: {
    welcome: "System online! 🤖 Ich bin GD-Bot, dein kybernetischer Co-Pilot. Ich kann deine Statistiken analysieren, dir Überlebenstipps für die Strecke geben oder mithilfe von KI brandneue Levels erstellen! Was erobern wir heute?",
    cue: "SYSTEM-CO-PILOT",
    liveAi: "LIVE-KI",
    coachingOn: "COACHING FÜR",
    survivalCoach: "Taktik-Coach",
    aiLevelBuilder: "KI-Strecken-Bauer",
    askAnything: "Frage GD-Bot alles...",
    quickLabels: "Schnellbefehle & Fragen:",
    conquerTips: "💡 Überlebe",
    tellJoke: "🎲 Würfel-Witz erzählen",
    explainPortals: "🎮 Portale erklären",
    descBuilder: "Voxel Generativer Synthesizer",
    descSub: "Beschreibe Tempo, Thema, Geschwindigkeit oder Farben deiner Traumstrecke. Gemini berechnet und baut das Hindernis-Layout in Echtzeit!",
    labelPrompt: "Ästhetische Beschreibung",
    labelDiff: "Mathematischer Schwierigkeitsgrad",
    noCompiled: "Keine kompilierte Matrix",
    noCompiledDesc: "Gib oben deine Wünsche ein und tippe auf \"Strecke mit KI erstellen\", um Gemini die Arbeit machen zu lassen!",
    buildAi: "Strecke mit KI erstellen",
    mapSynth: "STRECKE ERSTELLT!",
    aiOriginal: "KI-ORIGINAL",
    btnSaveLoad: "Level Speichern & Laden",
    btnGenerating: "LEVEL WIRD GENERIERT...",
    stabilized: "Architektur stabilisiert!",
    imported: "✔️ LEVEL IM RUNNER GELADEN!",
    telemetryTitle: "CO-PILOT METRIK-TELEMETRIE",
    threatIndex: "BEDROHUNGS-INDEX",
    jumpsPerAttempt: "SPRÜNGE / VERSUCH",
    elementAnalysis: "OBJEKT-FREQUENZANALYSE",
    noStats: "Starte ein Level für Echtzeit-Koordinaten-Logs."
  },
  ES: {
    welcome: "¡Sistema listo! 🤖 Soy GD-Bot, tu co-piloto cibernético. ¡Puedo analizar tus estadísticas, darte consejos de supervivencia en la pista o usar IA para crear niveles nuevos! ¿Qué conquistaremos hoy?",
    cue: "COMPAÑERO DE SISTEMA",
    liveAi: "IA EN VIVO",
    coachingOn: "ENTRENANDO EN",
    survivalCoach: "Entrenador de Ritmo",
    aiLevelBuilder: "Constructor de IA",
    askAnything: "Pregúntale a GD-Bot lo que sea...",
    quickLabels: "Comandos Rápidos:",
    conquerTips: "💡 Sobrevivir en",
    tellJoke: "🎲 Chiste de Cubos",
    explainPortals: "🎮 Explicar Portales",
    descBuilder: "Sintetizador de Voxel Generativo",
    descSub: "Describe el ritmo, la combinación de colores o picos que quieras. ¡Gemini distribuirá los obstáculos de forma interactiva!",
    labelPrompt: "Descripción Estética",
    labelDiff: "Dificultad Matemática",
    noCompiled: "Sin Matriz Compilada",
    noCompiledDesc: "¡Ingresa cualquier idea loca arriba y presiona \"Crear Nivel con IA\" para que Gemini haga los cálculos!",
    buildAi: "Crear Nivel con IA",
    mapSynth: "¡MAPA SINTETIZADO!",
    aiOriginal: "ORIGINAL DE IA",
    btnSaveLoad: "Guardar y Cargar Nivel",
    btnGenerating: "GENERANDO MAPA...",
    stabilized: "¡Arquitectura estabilizada!",
    imported: "✔️ ¡NIVEL CONFIGURADO EN EL MOTOR!",
    telemetryTitle: "TELEMETRÍA CO-PILOTO",
    threatIndex: "ÍNDICE DE AMENAZA",
    jumpsPerAttempt: "SALTOS / INTENTO",
    elementAnalysis: "ANÁLISIS DE OBSTÁCULOS",
    noStats: "Inicia un nivel para ver el registro de coordenadas."
  },
  FR: {
    welcome: "Système en ligne ! 🤖 Je suis GD-Bot, votre co-pilote cybernétique. Je peux analyser vos stats, vous donner des conseils ou utiliser l'IA de Gemini pour synthétiser de nouveaux niveaux ! Que veut-on conquérir aujourd'hui ?",
    cue: "COMPAGNON DE SYSTÈME",
    liveAi: "IA EN DIRECT",
    coachingOn: "ENTRAÎNEMENT SUR",
    survivalCoach: "Coach de Survie",
    aiLevelBuilder: "Synthétiseur IA",
    askAnything: "Demander n'importe quoi à GD-Bot...",
    quickLabels: "Commandes Rapides :",
    conquerTips: "💡 Survivre à",
    tellJoke: "🎲 Raconter une blague",
    explainPortals: "🎮 Expliquer les portails",
    descBuilder: "Synthèse Générative de Voxel",
    descSub: "Décrivez le rythme idéal, la vitesse, le thème visuel ou la palette de couleurs. Gemini compilera les coordonnées de chaque pic !",
    labelPrompt: "Description Esthétique",
    labelDiff: "Difficulté Mathématique",
    noCompiled: "Aucune Matrice Compilée",
    noCompiledDesc: "Entrez vos idées folles ci-dessus, puis appuyez sur \"Compiler avec l'IA\" pour que Gemini configure le parcours !",
    buildAi: "Compiler avec l'IA",
    mapSynth: "NIVEAU SYNTHÉTISÉ !",
    aiOriginal: "IA ORIGINAL",
    btnSaveLoad: "Enregistrer & Charger",
    btnGenerating: "GÉNÉRATION DU PARCOURS...",
    stabilized: "Architecture stabilisée !",
    imported: "✔️ PARCOURS CHARGÉ AVEC SUCCÈS !",
    telemetryTitle: "TÉLÉMÉTRIE CO-PILOTE",
    threatIndex: "INDICE DE MENACE",
    jumpsPerAttempt: "SAUTS / TENTATIVE",
    elementAnalysis: "ANALYSE DE FRÉQUENCE DES ÉLÉMENTS",
    noStats: "Lancez un niveau pour voir le journal de coordonnées."
  }
};

interface AIHelperCompanionProps {
  activeLevel: Level | null;
  playerStats: PlayerStats;
  onImportCustomLevel: (generatedLevel: Level) => void;
}

interface Message {
  id: string;
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export default function AIHelperCompanion({ activeLevel, playerStats, onImportCustomLevel }: AIHelperCompanionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'builder'>('chat');
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(true);
  const { language } = useLanguage();
  
  // Custom Co-pilot states
  const [voiceSynthEnabled, setVoiceSynthEnabled] = useState(false);
  const [selectedThemePreset, setSelectedThemePreset] = useState<'none' | 'cyberpunk' | 'toxic' | 'cosmic' | 'inferno' | 'golden'>('cyberpunk');
  const [activeVoiceMsgId, setActiveVoiceMsgId] = useState<string | null>(null);

  // Voice player helper
  const performCyberTTS = (text: string, msgId?: string) => {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      if (msgId) {
        setActiveVoiceMsgId(msgId);
      }
      
      const cleanText = text
        .replace(/[*#_`~🤖⚠️✔️■▲●✦⇄]/g, '')
        .replace(/(https?:\/\/[^\s]+)/g, '')
        .trim();
        
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.pitch = 1.35; // Cute robotic high pitches
      utterance.rate = 1.08;  // Computerized cybertempo
      
      if (language === 'DE') utterance.lang = 'de-DE';
      else if (language === 'ES') utterance.lang = 'es-ES';
      else if (language === 'FR') utterance.lang = 'fr-FR';
      else utterance.lang = 'en-US';

      utterance.onend = () => {
        setActiveVoiceMsgId(null);
      };
      utterance.onerror = () => {
        setActiveVoiceMsgId(null);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech element synthesis error:", e);
      setActiveVoiceMsgId(null);
    }
  };

  const stopCyberTTS = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActiveVoiceMsgId(null);
  };
  
  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    // Dynamically localize initial greeting when language updates
    setMessages([
      {
        id: 'welcome',
        role: 'bot',
        content: botTranslations[language]?.welcome || botTranslations.EN.welcome,
        timestamp: new Date()
      }
    ]);
  }, [language]);

  const [inputVal, setInputVal] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Level Generator state
  const [generatorPrompt, setGeneratorPrompt] = useState('A neon violet speedway with high speed gravity flips and yellow bounce pads');
  const [generatorDifficulty, setGeneratorDifficulty] = useState<'EASY' | 'NORMAL' | 'HARD' | 'INSANE' | 'DEMON'>('NORMAL');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatorProgress, setGeneratorProgress] = useState(0);
  const [generatorMessage, setGeneratorMessage] = useState('');
  const [generatedLevel, setGeneratedLevel] = useState<Level | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isChatLoading]);

  // Speak new bot messages if voice mode is enabled
  useEffect(() => {
    if (voiceSynthEnabled && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'bot') {
        performCyberTTS(lastMsg.content, lastMsg.id);
      }
    }
  }, [messages, voiceSynthEnabled]);

  // Loading animation simulation for builder
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      const messagesSeq = [
        'Connecting to Gemini matrix...',
        'Synthesizing rhythm & synth BPM...',
        'Deploying synchronized spikes on the grid...',
        'Formulating high-dimensional gravity portals...',
        'Paving geometric floor tiles...',
        'Calibrating jump safety and reaction physics...',
        'Validating level completion feasibility...'
      ];

      let msgIndex = 0;
      setGeneratorProgress(3);
      setGeneratorMessage(messagesSeq[0]);

      interval = setInterval(() => {
        setGeneratorProgress(prev => {
          const next = prev + Math.floor(Math.random() * 15) + 5;
          if (next >= 95) {
            clearInterval(interval);
            return 95;
          }
          // Cycle through funny cyberpunk developer messages
          if (next > (msgIndex + 1) * 14 && msgIndex < messagesSeq.length - 1) {
            msgIndex++;
            setGeneratorMessage(messagesSeq[msgIndex]);
          }
          return next;
        });
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Handle chatbot messaging
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputVal.trim() || isChatLoading) return;

    const userText = inputVal.trim();
    setInputVal('');

    const newMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newMsg]);
    setIsChatLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [...messages, newMsg].map(m => ({ role: m.role, content: m.content })),
          stats: playerStats,
          activeLevel: activeLevel,
          language: language
        })
      });

      if (!response.ok) {
        throw new Error('API signal lost. Make sure process.env.GEMINI_API_KEY is configured correctly.');
      }

      const data = await response.json();
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        role: 'bot',
        content: data.text || "I apologize, my neural circuits got slightly misaligned. Could you run that pattern past me again?",
        timestamp: new Date()
      }]);
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        role: 'bot',
        content: `⚠️ Connection failure: ${err.message || 'Server did not respond.'}`,
        timestamp: new Date()
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Quick Chat Suggestion Trigger
  const handleQuickPrompt = (promptText: string) => {
    setInputVal(promptText);
    setTimeout(() => {
      // Trigger visually as if clicked submit
      const inputForm = document.getElementById('ai-chat-input-form');
      if (inputForm) {
        inputForm.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      }
    }, 50);
  };

  // Generate Custom Level call
  const handleGenerateCustomLevel = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGeneratedLevel(null);
    setImportSuccess(false);

    try {
      const response = await fetch('/api/gemini/generate-level', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: generatorPrompt,
          difficulty: generatorDifficulty
        })
      });

      if (!response.ok) {
        throw new Error('Synth session interrupted. Please ensure your API key settings are healthy.');
      }

      const levelData = await response.json();
      
      // Post-process the generated level to make sure the ID and format matches
      const customId = `custom_ai_${Date.now()}`;
      const level: Level = {
        id: customId,
        name: levelData.name || `AI Generator Run`,
        difficulty: levelData.difficulty || generatorDifficulty,
        speed: levelData.speed || (generatorDifficulty === 'DEMON' ? 18 : generatorDifficulty === 'EASY' ? 11 : 14),
        color: levelData.color || '#a855f7',
        bpm: levelData.bpm || 135,
        obstacles: levelData.obstacles || [],
        length: levelData.length || 200,
        starsAvailable: levelData.obstacles ? levelData.obstacles.filter((o: any) => o.type === 'STAR').length : 3
      };

      setGeneratorProgress(100);
      setGeneratorMessage('Architecture stabilized!');
      setTimeout(() => {
        setGeneratedLevel(level);
        setIsGenerating(false);
      }, 500);

    } catch (err: any) {
      setIsGenerating(false);
      alert(`Synthesis Error: ${err.message || 'Please query again'}`);
    }
  };

  // Import level to main game list
  const handleImportLevel = () => {
    if (!generatedLevel) return;
    onImportCustomLevel(generatedLevel);
    setImportSuccess(true);
    setTimeout(() => {
      setImportSuccess(false);
      setIsOpen(false);
    }, 1500);
  };

  return (
    <>
      {/* FLOATING BOT TRIGGER */}
      <button
        id="ai-bot-floating-trigger"
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-black border-2 border-[#00FF95] text-[#00FF95] shadow-[0_0_20px_rgba(0,255,149,0.35)] hover:shadow-[0_0_35px_#00FF95] hover:scale-110 active:scale-95 transition-all flex items-center gap-2 font-mono font-black text-xs uppercase tracking-widest cursor-pointer group"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping Absolute inline-flex h-full w-full rounded-full bg-[#00FF95] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00FF95]"></span>
        </span>
        <BrainCircuit className="w-5 h-5 group-hover:rotate-12 transition-transform" />
        AI GD-BOT
      </button>

      {/* EXPANDABLE COMPANION DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 w-full sm:w-[460px] h-[100dvh] sm:h-[620px] bg-black/95 border-0 sm:border-2 border-[#00FF95]/40 shadow-[0_0_40px_rgba(0,255,149,0.15)] z-[100] flex flex-col font-sans text-white overflow-hidden backdrop-blur-xl transition-all animate-in fade-in slide-in-from-bottom-5">
          
          {/* Neon glow header cap decoration */}
          <div className="h-1 bg-gradient-to-r from-[#00FF95] via-[#a855f7] to-[#00FF95] shadow-[0_0_10px_#00FF95]"></div>

          {/* HUD Header */}
          <div className="p-4 bg-zinc-950/80 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#00FF95]/10 border border-[#00FF95]/30 flex items-center justify-center text-xl animate-pulse">
                🤖
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-sans font-black text-xs tracking-wider text-white uppercase italic">
                    {botTranslations[language]?.cue || botTranslations.EN.cue}
                  </span>
                  <span className="px-1.5 py-0.5 bg-[#00FF95]/10 text-[#00FF95] border border-[#00FF95]/30 text-[8px] font-mono tracking-widest uppercase font-black">
                    {botTranslations[language]?.liveAi || botTranslations.EN.liveAi}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase font-semibold">
                  {botTranslations[language]?.coachingOn || botTranslations.EN.coachingOn}: {activeLevel ? activeLevel.name.toUpperCase() : 'NONE'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Voice Mode Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (voiceSynthEnabled) {
                    stopCyberTTS();
                    setVoiceSynthEnabled(false);
                  } else {
                    setVoiceSynthEnabled(true);
                    performCyberTTS(language === 'DE' ? "Sprachausgabe aktiviert!" : language === 'ES' ? "¡Voz activada!" : language === 'FR' ? "Synthétiseur vocal activé !" : "Voice synthesis online! GD-Bot speaking.");
                  }
                }}
                title="Toggle Cybermatic Voice synthesized responses"
                className={`p-1.5 border rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                  voiceSynthEnabled 
                    ? 'bg-[#00FF95]/10 border-[#00FF95] text-[#00FF95] shadow-[0_0_8px_rgba(0,255,149,0.25)]' 
                    : 'bg-transparent border-white/10 text-zinc-500 hover:text-zinc-300 hover:border-white/20'
                }`}
              >
                {voiceSynthEnabled ? <Volume2 className="w-4 h-4 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  stopCyberTTS();
                  setIsOpen(false);
                }}
                className="p-1.5 border border-white/10 hover:border-[#00FF95] hover:text-[#00FF95] text-zinc-400 transition-all cursor-pointer rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab Sub-Header */}
          <div className="grid grid-cols-2 border-b border-white/5 font-mono text-xs font-bold uppercase tracking-wider">
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-3 flex items-center justify-center gap-2 border-r border-white/5 transition-all text-center cursor-pointer ${
                activeTab === 'chat' ? 'bg-[#00FF95]/10 text-[#00FF95] font-black border-b border-[#00FF95]' : 'bg-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {botTranslations[language]?.survivalCoach || botTranslations.EN.survivalCoach}
            </button>
            <button
              onClick={() => setActiveTab('builder')}
              className={`py-3 flex items-center justify-center gap-2 transition-all text-center cursor-pointer ${
                activeTab === 'builder' ? 'bg-[#00FF95]/10 text-[#00FF95] font-black border-b border-[#00FF95]' : 'bg-transparent text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 animate-bounce" />
              {botTranslations[language]?.aiLevelBuilder || botTranslations.EN.aiLevelBuilder}
            </button>
          </div>

          {/* TAB 1: Survival Chat Coach */}
          {activeTab === 'chat' && (
            <div className="flex-1 flex flex-col min-h-0 bg-[#060606]">
              {/* Telemetry Dashboard Widget */}
              <div className="mx-4 mt-4 border border-zinc-800/80 bg-zinc-950/90 rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
                <button
                  type="button"
                  onClick={() => setIsTelemetryOpen(!isTelemetryOpen)}
                  className="w-full px-3.5 py-2.5 flex items-center justify-between bg-zinc-905/60 hover:bg-zinc-900 border-b border-zinc-800/80 cursor-pointer select-none transition-all"
                >
                  <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#00FF95] font-black uppercase">
                    <Activity className="w-3.5 h-3.5 text-[#00FF95] animate-pulse" />
                    <span>{botTranslations[language]?.telemetryTitle || botTranslations.EN.telemetryTitle}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00FF95] animate-ping" />
                    {isTelemetryOpen ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
                  </div>
                </button>

                {isTelemetryOpen && (
                  <div className="p-3.5 space-y-3 font-mono text-[10px] text-zinc-400">
                    {activeLevel ? (
                      <>
                        {/* Summary Metrics Row */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-zinc-900/55 p-2 border border-white/5 rounded-lg text-center">
                            <span className="text-[8px] text-zinc-500 block uppercase font-bold tracking-wider">
                              {botTranslations[language]?.threatIndex || botTranslations.EN.threatIndex}
                            </span>
                            <span className="text-[#EF4444] text-xs font-black">
                              {activeLevel.difficulty === 'EASY' ? '21%' :
                               activeLevel.difficulty === 'NORMAL' ? '42%' :
                               activeLevel.difficulty === 'HARD' ? '65%' :
                               activeLevel.difficulty === 'INSANE' ? '88%' : '99%'}
                            </span>
                          </div>
                          <div className="bg-zinc-900/55 p-2 border border-white/5 rounded-lg text-center">
                            <span className="text-[8px] text-zinc-500 block uppercase font-bold tracking-wider">
                              {botTranslations[language]?.jumpsPerAttempt || botTranslations.EN.jumpsPerAttempt}
                            </span>
                            <span className="text-cyan-400 text-xs font-black">
                              {playerStats.attempts > 0 ? (playerStats.jumps / playerStats.attempts).toFixed(1) : '0.0'}
                            </span>
                          </div>
                          <div className="bg-zinc-900/55 p-2 border border-white/5 rounded-lg text-center">
                            <span className="text-[8px] text-zinc-500 block uppercase font-bold tracking-wider">
                              BPM TEMPO
                            </span>
                            <span className="text-yellow-400 text-xs font-black">
                              {activeLevel.bpm}
                            </span>
                          </div>
                        </div>

                        {/* Element breakdown bar */}
                        <div className="space-y-1.5 pt-0.5">
                          <div className="flex items-center justify-between text-[8px] text-zinc-500 uppercase font-black tracking-wider">
                            <span>{botTranslations[language]?.elementAnalysis || botTranslations.EN.elementAnalysis}</span>
                            <span className="text-zinc-400 font-bold font-mono">
                              {activeLevel.obstacles.length} TOTAL
                            </span>
                          </div>

                          <div className="bg-zinc-905 p-2 border border-white/5 rounded-lg grid grid-cols-5 text-center gap-1">
                            <div>
                              <span className="text-[8px] text-red-500 block font-black">▲</span>
                              <span className="text-white text-[10px] font-bold">
                                {activeLevel.obstacles.filter(o => o.type.includes('SPIKE')).length}
                              </span>
                            </div>
                            <div>
                              <span className="text-[8px] text-[#A855F7] block font-black">■</span>
                              <span className="text-white text-[10px] font-bold">
                                {activeLevel.obstacles.filter(o => o.type === 'BLOCK').length}
                              </span>
                            </div>
                            <div>
                              <span className="text-[8px] text-yellow-400 block font-black">●</span>
                              <span className="text-white text-[10px] font-bold">
                                {activeLevel.obstacles.filter(o => o.type === 'ORB_YELLOW' || o.type === 'PAD_YELLOW').length}
                              </span>
                            </div>
                            <div>
                              <span className="text-[8px] text-emerald-400 block font-black">✦</span>
                              <span className="text-white text-[10px] font-bold">
                                {activeLevel.obstacles.filter(o => o.type === 'STAR').length}
                              </span>
                            </div>
                            <div>
                              <span className="text-[8px] text-cyan-400 block font-black">⇄</span>
                              <span className="text-white text-[10px] font-bold">
                                {activeLevel.obstacles.filter(o => o.type.startsWith('PORTAL')).length}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* CHALLENGE PROFILE TRAJECTORY TIMELINE */}
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[8px] text-zinc-500 uppercase font-black tracking-wider">
                            <span>CHALLENGE PROFILE (0% ➔ 100% DISTANCE)</span>
                            <span className="text-[#00FF95] hover:underline cursor-pointer flex items-center gap-1 font-bold" onClick={() => performCyberTTS(language === 'DE' ? "Echtzeit Gefahrenanalyse aktiv. Die roten Balken markieren dichte Ansammlungen von Stacheln." : "Realtime obstacle threat map. Higher red columns represent denser spike clusters.")}>
                              <Radio className="w-2.5 h-2.5 text-[#00FF95] animate-pulse shrink-0" />
                              REALTIME SCAN
                            </span>
                          </div>
                          
                          <div className="bg-zinc-900/50 border border-white/5 p-2 rounded-lg">
                            <div className="grid grid-cols-10 gap-1 items-end h-[34px]">
                              {(() => {
                                const len = activeLevel.length || 200;
                                const buckets = Array(10).fill(0);
                                activeLevel.obstacles.forEach((obs) => {
                                  let fraction = obs.x / len;
                                  if (fraction < 0) fraction = 0;
                                  if (fraction >= 1) fraction = 0.99;
                                  const index = Math.floor(fraction * 10);
                                  
                                  let weight = 1;
                                  if (obs.type.includes('TRIPLE')) weight = 4;
                                  else if (obs.type.includes('DOUBLE')) weight = 3;
                                  else if (obs.type.includes('SPIKE')) weight = 2;
                                  else if (obs.type.startsWith('PORTAL')) weight = 2;
                                  else if (obs.type.startsWith('PAD') || obs.type.startsWith('ORB')) weight = 1.2;
                                  
                                  buckets[index] += weight;
                                });
                                
                                const maxVal = Math.max(...buckets, 1);
                                return buckets.map((v, i) => {
                                  const normalizedHeight = Math.min(100, Math.max(12, Math.round((v / maxVal) * 100)));
                                  const colors = normalizedHeight < 30 ? 'bg-[#00FF95]' 
                                               : normalizedHeight < 65 ? 'bg-yellow-400' 
                                               : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]';
                                  return (
                                    <div key={i} className="flex flex-col items-center gap-1 group/bar relative w-full" style={{ height: '100dvh', maxHeight: '100%' }}>
                                      {/* Hover tooltip */}
                                      <div className="absolute bottom-full mb-1 bg-black/90 border border-white/10 px-1 py-0.5 rounded text-[8px] text-white opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                        Dist: {i*10}%-{(i+1)*10}% | Weight: {v.toFixed(1)}
                                      </div>
                                      <div 
                                        className={`w-full ${colors} rounded-t-sm transition-all duration-500`}
                                        style={{ height: `${normalizedHeight}%` }}
                                      />
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                            <div className="grid grid-cols-10 text-[7px] text-zinc-600 text-center font-bold font-mono pt-1">
                              <span>10%</span>
                              <span>20%</span>
                              <span>30%</span>
                              <span>40%</span>
                              <span>50%</span>
                              <span>60%</span>
                              <span>70%</span>
                              <span>80%</span>
                              <span>90%</span>
                              <span>100%</span>
                            </div>
                          </div>
                        </div>

                        {/* Co-pilot Tactical recommendation */}
                        <div className="bg-zinc-900/45 p-2.5 border-l border-[#00FF95] text-[9.5px] leading-relaxed text-zinc-300">
                          <span className="text-[#00FF95] font-black mr-1 text-[8px] uppercase tracking-wider block font-sans">
                            🤖 GD-BOT RECOMMENDS:
                          </span>
                          {language === 'DE' ? (
                            activeLevel.difficulty === 'EASY' ? "KI-Empfehlung: Schalte den Autopiloten oben rechts ein, um die Sprungkraftmuster zu erlernen!" :
                            activeLevel.difficulty === 'NORMAL' ? "KI-Empfehlung: Passe deine Sprünge an den Bassdrumpuls der Synthmusik im Hintergrund an!" :
                            activeLevel.difficulty === 'HARD' ? "KI-Empfehlung: Drücke die Leertaste genau vor dem Scheitelpunkt, um Doppelstacheln sauber zu überwinden." :
                            activeLevel.difficulty === 'INSANE' ? "KI-Empfehlung: Nutze die Gravitationsportale achtsam. Halte den Daumen über dem Sprungpedal." :
                            "KI-Empfehlung: Extrem präzise Reaktionen nötig. Benutze den Übungsmodus, um die anspruchsvollen Passagen zu meistern."
                          ) : language === 'ES' ? (
                            activeLevel.difficulty === 'EASY' ? "Recomendación IA: ¡Activa el piloto automático en la esquina superior para entender el ritmo de salto!" :
                            activeLevel.difficulty === 'NORMAL' ? "Recomendación IA: ¡Adapta tus saltos al bombo pulsante de la música sintética!" :
                            activeLevel.difficulty === 'HARD' ? "Recomendación IA: Pulsa salto justo antes de los picos para superar obstáculos medianos." :
                            activeLevel.difficulty === 'INSANE' ? "Recomendación IA: Las zonas gravitatorias cambian la orientación, prepárate para saltar al revés." :
                            "Recomendación IA: Sincronización milimétrica requerida. Se recomienda de forma prioritaria usar el modo de práctica."
                          ) : language === 'FR' ? (
                            activeLevel.difficulty === 'EASY' ? "Recommandation IA : Activez l'Autopilote en haut à droite pour comprendre les synchronisations de saut." :
                            activeLevel.difficulty === 'NORMAL' ? "Recommandation IA : Synchronisez vos impulsions avec le rythme de synthé en arrière-plan !" :
                            activeLevel.difficulty === 'HARD' ? "Recommandation IA : Sautez juste avant la pointe des pics pour passer les double-stacheln !" :
                            activeLevel.difficulty === 'INSANE' ? "Recommandation IA : Maîtrisez les portails de gravité. Faites des frappes ultra-rapides." :
                            "Recommandation IA : Timing chirurgical requis. Un passage par le mode Entraînement est vivement conseillé."
                          ) : (
                            activeLevel.difficulty === 'EASY' ? "AI Advisory: Enable the Autopilot toggle in the upper corner to study the jump timings!" :
                            activeLevel.difficulty === 'NORMAL' ? "AI Advisory: Sync your jumping loops directly with the synth bass kick of the track!" :
                            activeLevel.difficulty === 'HARD' ? "AI Advisory: Press jump right before edge parameters to clear double spike obstacles." :
                            activeLevel.difficulty === 'INSANE' ? "AI Advisory: Gravity flips inverted physics. Anticipate ceiling layouts in advance." :
                            "AI Advisory: Frame-perfect reaction windows. Practice mode checks are highly advised for this sequence."
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-2 text-zinc-500 font-sans italic">
                        {botTranslations[language]?.noStats || botTranslations.EN.noStats}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Message scroll stream */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border text-[13px] ${
                      m.role === 'user' 
                        ? 'bg-zinc-800 border-zinc-700 text-end'
                        : 'bg-[#00FF95]/10 border-[#00FF95]/30 text-start'
                    }`}>
                      {m.role === 'user' ? '👤' : '🤖'}
                    </div>

                    <div className="relative group/msg flex-1 min-w-0">
                      <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        m.role === 'user' 
                          ? 'bg-zinc-900 border border-white/5 text-zinc-200 rounded-tr-none'
                          : 'bg-zinc-950/80 border border-white/5 text-zinc-300 rounded-tl-none pr-7'
                      }`}>
                        {m.content}
                      </div>
                      {m.role === 'bot' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (activeVoiceMsgId === m.id) stopCyberTTS();
                            else performCyberTTS(m.content, m.id);
                          }}
                          className={`absolute bottom-2.5 right-2 text-zinc-500 hover:text-[#00FF95] transition-colors p-1 rounded-md cursor-pointer ${activeVoiceMsgId === m.id ? 'text-[#00FF95]' : 'opacity-100 group-hover/msg:opacity-100'}`}
                          title="Speak this cybernetic intelligence text"
                        >
                          <Volume2 className={`w-3.5 h-3.5 ${activeVoiceMsgId === m.id ? 'animate-pulse text-[#00FF95]' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {isChatLoading && (
                  <div className="flex gap-3 max-w-[85%]">
                    <div className="w-7 h-7 rounded-lg bg-[#00FF95]/15 border border-[#00FF95]/30 flex items-center justify-center text-[12px] animate-pulse">🤖</div>
                    <div className="p-3 bg-zinc-950/80 border border-white/5 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#00FF95] rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-[#00FF95] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-[#00FF95] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Instant Prompt Suggestions */}
              <div className="px-4 pb-2 pt-1.5 border-t border-white/5 bg-black/40">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider block mb-2 font-bold font-sans">
                  {botTranslations[language]?.quickLabels || botTranslations.EN.quickLabels}
                </span>
                <div className="flex gap-1.5 overflow-x-auto text-[10px] pb-1.5 scrollbar-thin font-sans">
                  <button
                    onClick={() => handleQuickPrompt(
                      language === 'DE' ? `Gib mir Überlebenstipps für das Level: ${activeLevel ? activeLevel.name : 'Stereo Madness'}!` :
                      language === 'ES' ? `¡Dame consejos de supervivencia para el nivel: ${activeLevel ? activeLevel.name : 'Stereo Madness'}!` :
                      language === 'FR' ? `Donne-moi des conseils de survie pour le niveau : ${activeLevel ? activeLevel.name : 'Stereo Madness'} !` :
                      `Give me survival tips to beat the level: ${activeLevel ? activeLevel.name : 'Stereo Madness'}!`
                    )}
                    className="px-2.5 py-1 bg-zinc-900 border border-white/10 hover:border-[#00FF95] text-zinc-300 hover:text-white whitespace-nowrap transition-all rounded-md cursor-pointer"
                  >
                    {botTranslations[language]?.conquerTips || botTranslations.EN.conquerTips} {activeLevel ? activeLevel.name : 'Stereo Madness'}
                  </button>
                  <button
                    onClick={() => handleQuickPrompt(
                      language === 'DE' ? "Erzähle mir einen lustigen Physik- oder Cube-Runner-Witz!" :
                      language === 'ES' ? "¡Cuéntame un chiste divertido de física o de cubos!" :
                      language === 'FR' ? "Raconte-moi une blague amusante sur la physique ou les cubes !" :
                      "Tell me a funny physics or cube-runner joke!"
                    )}
                    className="px-2.5 py-1 bg-zinc-900 border border-white/10 hover:border-[#00FF95] text-zinc-300 hover:text-white whitespace-nowrap transition-all rounded-md cursor-pointer"
                  >
                    {botTranslations[language]?.tellJoke || botTranslations.EN.tellJoke}
                  </button>
                  <button
                    onClick={() => handleQuickPrompt(
                      language === 'DE' ? "Erkläre mir, wie Gravitationsportale und Sprungpads in Geometry Dash 3D funktionieren." :
                      language === 'ES' ? "Explícame cómo funcionan los portales de gravedad y las plataformas de salto en Geometry Dash 3D." :
                      language === 'FR' ? "Explique-moi comment fonctionnent les portails de gravité et les dalles de saut dans Geometry Dash 3D." :
                      "Explain how gravity portals and jump pads work in Geometry Dash 3D."
                    )}
                    className="px-2.5 py-1 bg-zinc-900 border border-white/10 hover:border-[#00FF95] text-zinc-300 hover:text-white whitespace-nowrap transition-all rounded-md cursor-pointer"
                  >
                    {botTranslations[language]?.explainPortals || botTranslations.EN.explainPortals}
                  </button>
                </div>
              </div>

              {/* Chat Input Bar */}
              <form
                id="ai-chat-input-form"
                onSubmit={handleSendMessage}
                className="p-3 border-t border-white/5 bg-zinc-950 flex gap-2"
              >
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={botTranslations[language]?.askAnything || botTranslations.EN.askAnything}
                  className="flex-1 bg-zinc-900 border border-white/10 px-3.5 py-2 text-xs rounded-xl focus:border-[#00FF95] focus:outline-none transition-all placeholder:text-zinc-600 font-sans"
                />
                <button
                  type="submit"
                  disabled={!inputVal.trim() || isChatLoading}
                  className="p-2.5 bg-[#00FF95]/20 border border-[#00FF95]/40 hover:bg-[#00FF95] text-[#00FF95] hover:text-black rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: AI Level Builder */}
          {activeTab === 'builder' && (
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#040404] flex flex-col justify-between min-h-0">
              
              <div className="space-y-4">
                <div className="flex items-start gap-3 bg-[#00FF95]/5 border border-[#00FF95]/20 p-3.5 rounded-xl">
                  <BrainCircuit className="w-5 h-5 text-[#00FF95] shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1.5 leading-relaxed">
                    <p className="font-semibold text-white font-sans uppercase text-[10px] tracking-wider text-[#00FF95]">
                      {botTranslations[language]?.descBuilder || botTranslations.EN.descBuilder}
                    </p>
                    <p className="text-zinc-400">
                      {botTranslations[language]?.descSub || botTranslations.EN.descSub}
                    </p>
                  </div>
                </div>

                {/* Prompt input */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                    {botTranslations[language]?.labelPrompt || botTranslations.EN.labelPrompt}
                  </label>
                  <textarea
                    value={generatorPrompt}
                    onChange={(e) => setGeneratorPrompt(e.target.value)}
                    rows={3}
                    maxLength={160}
                    placeholder={
                      language === 'DE' ? "Z. B. Eine verrückt schwere rote Cyberpunk-Strecke voller Sprünge..." :
                      language === 'ES' ? "Ej. Una pista cibernética roja muy difícil con obstáculos cercanos..." :
                      language === 'FR' ? "Ex. Un parcours cybernétique rouge super difficile avec des pics serrés..." :
                      "E.g., A crazy hard red cybernetic track with close obstacles..."
                    }
                    className="w-full bg-zinc-900/60 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-[#00FF95] focus:outline-none transition-all resize-none font-sans leading-relaxed"
                  />
                </div>

                {/* Style Preset Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-[#00FF95] font-black">
                    {language === 'DE' ? "STIL-THEMEN-PRESETS" :
                     language === 'ES' ? "PREAJUSTES DE ESTILO" :
                     language === 'FR' ? "PRESETS DE STYLES VISUELS" :
                     "DESIGN STYLE PRESETS"}
                  </label>
                  <div className="flex gap-2 pb-1 overflow-x-auto scrollbar-thin">
                    {[
                      { id: 'cyberpunk', name: 'Cyber Neon', prompt: 'A sharp cyberpunk speedway glowing with neon lime vibes and fast portals', diff: 'NORMAL' },
                      { id: 'toxic', name: 'Acid Core', prompt: 'A radioactive waste plant theme with neon orange portals and green sludge hazards', diff: 'HARD' },
                      { id: 'cosmic', name: 'Stellar Cosmos', prompt: 'A deep space nebula ride with floating blue platforms and multiple gravity shifts', diff: 'INSANE' },
                      { id: 'inferno', name: 'Demon Trial', prompt: 'A hellfire crimson trial with triple spike cascades and high speed action', diff: 'DEMON' },
                      { id: 'golden', name: 'Royal Gold', prompt: 'A glorious golden cathedral level with glowing yellow pads and precise star collection slots', diff: 'EASY' }
                    ].map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setSelectedThemePreset(preset.id as any);
                          setGeneratorPrompt(preset.prompt);
                          setGeneratorDifficulty(preset.diff as any);
                          performCyberTTS(`Selected ${preset.name} preset outline.`);
                        }}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] uppercase font-black tracking-wider transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                          selectedThemePreset === preset.id
                            ? 'bg-[#00FF95]/20 border-[#00FF95] text-[#00FF95] shadow-[0_0_8px_rgba(0,255,149,0.2)]'
                            : 'bg-zinc-900/60 border-white/5 text-[#cccccc] hover:border-white/10 hover:text-white'
                        }`}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Level difficulty parameter */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold">
                    {botTranslations[language]?.labelDiff || botTranslations.EN.labelDiff}
                  </label>
                  <div className="grid grid-cols-5 gap-1.5 font-mono">
                    {(['EASY', 'NORMAL', 'HARD', 'INSANE', 'DEMON'] as const).map((diff) => (
                      <button
                        key={diff}
                        type="button"
                        onClick={() => setGeneratorDifficulty(diff)}
                        className={`py-2 text-[10px] font-black border transition-all cursor-pointer ${
                          generatorDifficulty === diff
                            ? 'bg-[#00FF95] border-[#00FF95] text-black'
                            : 'bg-zinc-900 border-white/5 text-zinc-400 hover:border-white/20'
                        }`}
                      >
                        {diff}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* GENERATOR PROGRESS CONTAINER OR PREVIEW DETAILS */}
              <div className="flex-1 flex flex-col justify-center min-h-[140px] border border-white/5 bg-black/40 rounded-xl p-4">
                
                {isGenerating ? (
                  /* Animated Synthesizing display */
                  <div className="text-center space-y-3.5">
                     <div className="relative inline-block">
                       <div className="w-12 h-12 rounded-2xl border-2 border-[#00FF95]/30 border-t-[#00FF95] animate-spin"></div>
                       <div className="absolute inset-0 flex items-center justify-center text-xs">⚡</div>
                     </div>
                    
                    <div className="space-y-1">
                      <span className="text-[11px] text-[#00FF95] font-black uppercase font-mono tracking-widest animate-pulse">
                        {botTranslations[language]?.btnGenerating || botTranslations.EN.btnGenerating}
                      </span>
                      <p className="text-[10px] text-zinc-500 font-semibold font-mono uppercase">
                        {generatorMessage === 'Architecture stabilized!' && botTranslations[language]?.stabilized ? botTranslations[language].stabilized : generatorMessage}
                      </p>
                    </div>

                    <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden max-w-sm mx-auto border border-white/5">
                      <div style={{ width: `${generatorProgress}%` }} className="h-full bg-gradient-to-r from-[#00FF95] to-[#a855f7] transition-all duration-300"></div>
                    </div>
                  </div>

                ) : generatedLevel ? (
                  /* Generation Output Card */
                  <div className="space-y-3 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[#00FF95] text-[10px] font-black tracking-widest uppercase">
                        {botTranslations[language]?.mapSynth || botTranslations.EN.mapSynth}
                      </span>
                      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 border border-purple-500/30 text-[9px] uppercase font-black tracking-wider">
                        {botTranslations[language]?.aiOriginal || botTranslations.EN.aiOriginal}
                      </span>
                    </div>

                    <div className="p-3 bg-zinc-950 border border-white/5 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-sans font-black text-white uppercase italic">{generatedLevel.name}</h4>
                        <span className="text-xs px-1.5 py-0.5 bg-zinc-800 text-zinc-300 border border-white/10 font-bold">{generatedLevel.difficulty}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-[10px] text-zinc-400 font-medium">
                        <div>Speed: <span className="text-white font-bold">{generatedLevel.speed}x</span></div>
                        <div>Length: <span className="text-white font-bold">{generatedLevel.length}m</span></div>
                        <div>BPM Synth: <span className="text-white font-bold">{generatedLevel.bpm}bpm</span></div>
                        <div>Spikes & Orbs: <span className="text-white font-bold">{generatedLevel.obstacles.length} items</span></div>
                        <div className="col-span-2 flex items-center gap-1 mt-1">
                          Theme Color:
                          <span className="mt-0.5 inline-block w-3.5 h-3.5 rounded-sm border border-white/20" style={{ backgroundColor: generatedLevel.color }} />
                          <span className="text-white font-bold font-mono">{generatedLevel.color}</span>
                        </div>
                      </div>
                    </div>

                    {importSuccess ? (
                      <div className="py-1 text-center text-xs text-[#00FF95] font-black tracking-widest uppercase flex items-center justify-center gap-1.5 animate-bounce">
                        {botTranslations[language]?.imported || botTranslations.EN.imported}
                      </div>
                    ) : (
                      <button
                        onClick={handleImportLevel}
                        className="w-full py-3 bg-[#00FF95] hover:bg-[#00FF95]/90 text-black font-sans font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(30,225,120,0.3)]"
                      >
                        <Save className="w-4 h-4" />
                        {botTranslations[language]?.btnSaveLoad || botTranslations.EN.btnSaveLoad}
                      </button>
                    )}
                  </div>

                ) : (
                  /* Empty State */
                  <div className="text-center py-6 flex flex-col items-center justify-center gap-1.5 text-zinc-500 select-none">
                    <Compass className="w-7 h-7 text-zinc-600 mb-1" />
                    <span className="text-[10px] font-mono tracking-wider font-bold uppercase font-black text-white/60">
                      {botTranslations[language]?.noCompiled || botTranslations.EN.noCompiled}
                    </span>
                    <p className="text-[10px] text-zinc-600 max-w-[280px]">
                      {botTranslations[language]?.noCompiledDesc || botTranslations.EN.noCompiledDesc}
                    </p>
                  </div>
                )}
              </div>

              {/* ACTION TRIGGER BUTTON */}
              {!generatedLevel && !isGenerating && (
                <button
                  type="button"
                  onClick={handleGenerateCustomLevel}
                  disabled={!generatorPrompt.trim()}
                  className="w-full py-3 bg-[#00FF95]/15 border border-[#00FF95]/45 hover:bg-[#00FF95] text-[#00FF95] hover:text-black font-sans font-black text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_10px_rgba(0,255,149,0.1)] hover:shadow-[0_0_20px_rgba(0,255,149,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" />
                  {botTranslations[language]?.buildAi || botTranslations.EN.buildAi}
                </button>
              )}

            </div>
          )}

        </div>
      )}
    </>
  );
}
