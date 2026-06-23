import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'EN' | 'DE' | 'ES' | 'FR';

export interface TranslationDictionary {
  // Landing/Header
  stereoscopicEng: string;
  starsBalance: string;
  levelProgress: string;
  muteAudio: string;
  unmuteAudio: string;
  active: string;
  tacticalHud: string;
  emeraldCrystal: string;
  emeraldDesc: string;
  velocityBooster: string;
  velocityDesc: string;
  startRun: string;
  controlsOverlay: string;

  // Level Selector
  selectLevel: string;
  rhythmMetadata: string;
  buildLevel: string;
  stars: string;
  speed: string;
  attempts: string;
  progress: string;
  editCustomLevel: string;
  deleteLevel: string;

  // Skin Selector
  customizer: string;
  selectClass: string;
  unlocked: string;
  unlockedWord: string;
  locked: string;
  equipped: string;
  equip: string;
  buyFor: string;
  insufficientStars: string;

  // Audio Mixer Channels
  menuSynthesizer: string;
  audioMixerDesc: string;
  liveMixing: string;
  activateDsp: string;
  acousticPresets: string;
  muteDecks: string;
  kick: string;
  shaker: string;
  pad: string;
  lead: string;
  bpmClockRate: string;
  scaleTransposition: string;
  melodyVoice: string;
  harmonyBase: string;
  stepSequencerGrid: string;
  currentStep: string;
  stopped: string;
  midiClockActive: string;
  sensitivity: string;
  customSoundboard: string;
  soundboardDesc: string;
  interactivePads: string;
  synthesizeRhythm: string;

  // Game UI
  score: string;
  percent: string;
  pauseTitle: string;
  resume: string;
  restartRun: string;
  bestDistance: string;
  normalMode: string;
  practiceMode: string;
  doubleJumpCharge: string;
  speedBoostCharge: string;
  gravityNormal: string;
  gravityInverted: string;

  // Crash / Win Screens
  crashDetected: string;
  respawning: string;
  attemptLabel: string;
  levelCompleted: string;
  starsRecovered: string;
  playAgain: string;
  backToMenu: string;

  // Level Creator / AI Creator
  customLevelCreator: string;
  creatorSubtitle: string;
  exitCreator: string;
  levelProperties: string;
  levelName: string;
  themeColor: string;
  targetBpm: string;
  difficulty: string;
  levelLength: string;
  addObstacles: string;
  saveLevel: string;
  aiGenerator: string;
  aiPrompt: string;
  aiGenerate: string;
  aiGenerating: string;
  importAiLevel: string;
  savesAndCloud: string;
  savesSubtitle: string;
  selectLanguage: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  EN: {
    stereoscopicEng: "STEREOSCOPIC ENG v3",
    starsBalance: "STARS_BALANCE",
    levelProgress: "LEVEL_PROGRESS",
    muteAudio: "Mute Audio",
    unmuteAudio: "Unmute Audio",
    active: "ACTIVE",
    tacticalHud: "TACTICAL HUD: INTEGRATED ACTIVE SYSTEMS",
    emeraldCrystal: "EMERALD CRYSTAL (⚡)",
    emeraldDesc: "COLLECT TO CHARGE 2 MID-AIR DOUBLE JUMPS. RE-TRIGGER JUMP COMMANDS IN FLIGHT TO SURMOUNT DEEPER SPIKE CHASMS!",
    velocityBooster: "VELOCITY ACCELERATOR (🔥)",
    velocityDesc: "ENGAGE THE VECTOR ARROWS TO TRIGGER 4.0 SECONDS OF SPEED BOOST (+55%). LEAVES CONTINUOUS FIERY ROCKET TRAILS AND SURGES VELOCITY!",
    startRun: "START RUN",
    controlsOverlay: "CONTROLS: SPACEBAR / CLICK SCREEN TO JUMP. DODGE DYNAMIC PHYSICAL SPIKES. CHANGE PERSPECTIVE IN RUNS VIA THE EYE PORT VIEW WINDOWS!",
    
    selectLevel: "SELECT LEVEL",
    rhythmMetadata: "RHYTHM METADATA",
    buildLevel: "BUILD LEVEL",
    stars: "Stars",
    speed: "SPEED",
    attempts: "ATTEMPTS",
    progress: "PROGRESS",
    editCustomLevel: "Edit Custom Level",
    deleteLevel: "Delete Level",

    customizer: "SKIN CUSTOMIZER",
    selectClass: "SELECT CUBE MATRIX",
    unlocked: "UNLOCKED",
    unlockedWord: "Unlocked",
    locked: "LOCKED",
    equipped: "EQUIPPED",
    equip: "EQUIP",
    buyFor: "BUY FOR",
    insufficientStars: "INSUFFICIENT STARS",

    menuSynthesizer: "MENU SYNTH CONSOLE",
    audioMixerDesc: "Real-time modular menu audio driver",
    liveMixing: "LIVE MIXING ...",
    activateDsp: "ACTIVATE INTRO DSP",
    acousticPresets: "Acoustic Presets (Style)",
    muteDecks: "MUTE DECKS (LIVE INJECTIONS)",
    kick: "KICK",
    shaker: "SHAKER",
    pad: "PAD",
    lead: "LEAD",
    bpmClockRate: "Intro BPM Clock Rate",
    scaleTransposition: "Scale Transposition",
    melodyVoice: "Melody Voice",
    harmonyBase: "Harmony Base",
    stepSequencerGrid: "Interactive 16-Step Procedural Sequencer Grid",
    currentStep: "CURRENT_STEP",
    stopped: "STOPPED",
    midiClockActive: "MIDI_CLOCK: ACTIVE",
    sensitivity: "SENSITIVITY: 44.1 KHZ / WEB_AUDIO BUFFER",
    customSoundboard: "CUSTOM PLAYGROUND SOUNDBOARD",
    soundboardDesc: "Trigger interactive modular synthesizers on-demand",
    interactivePads: "INTERACTIVE REAL-TIME PADS",
    synthesizeRhythm: "SYNTHESIZE PROCEDURAL RHYTHM LOOP",

    score: "SCORE",
    percent: "PERCENT",
    pauseTitle: "GAME PAUSED",
    resume: "RESUME",
    restartRun: "RESTART RUN",
    bestDistance: "BEST DISTANCE",
    normalMode: "NORMAL RUN",
    practiceMode: "PRACTICE (CHECKPOINTS)",
    doubleJumpCharge: "DOUBLE JUMPS AVAILABLE",
    speedBoostCharge: "ROCKET BOOST ACTIVE",
    gravityNormal: "GRAVITY: NORMAL",
    gravityInverted: "GRAVITY: INVERTED",

    crashDetected: "CRASH DETECTED",
    respawning: "RESPAWNING...",
    attemptLabel: "ATTEMPT",
    levelCompleted: "LEVEL COMPLETED!",
    starsRecovered: "STARS RECOVERED:",
    playAgain: "PLAY AGAIN",
    backToMenu: "BACK TO MENU",

    customLevelCreator: "LEVEL ARCHITECT",
    creatorSubtitle: "Create and code custom levels dynamically",
    exitCreator: "EXIT ARCHITECT",
    levelProperties: "LEVEL SETTINGS",
    levelName: "Level Name",
    themeColor: "Aesthetic Color",
    targetBpm: "Target Tempo (BPM)",
    difficulty: "Difficulty Rating",
    levelLength: "Track Length",
    addObstacles: "ADD PHYSICAL ASSETS",
    saveLevel: "SAVE ARCHITECT FILE",
    aiGenerator: "CO-PILING COMPANION (AI GENERATION)",
    aiPrompt: "Enter instructions (e.g. lots of jumps, slow easy, hyper boost, etc.)",
    aiGenerate: "AI COMPILE",
    aiGenerating: "COMPILING IN NEURAL NET...",
    importAiLevel: "IMPORT AI COMPILED LEVEL",
    savesAndCloud: "STORAGE & SAVES CONSOLE",
    savesSubtitle: "Backup and synchronize your levels",
    selectLanguage: "LANGUAGE"
  },
  DE: {
    stereoscopicEng: "STEREOSKOPISCHE ENGINE v3",
    starsBalance: "STERNENSTAND",
    levelProgress: "LEVEL-FORTSCHRITT",
    muteAudio: "Stummschalten",
    unmuteAudio: "Ton einschalten",
    active: "AKTIV",
    tacticalHud: "TAKTIK-HUD: INTEGRIERTE AKTIVE SYSTEME",
    emeraldCrystal: "SMARAGD-KRISTALL (⚡)",
    emeraldDesc: "SAMMLE IHN FÜR 2 DOPPELSPRÜNGE IN DER LUFT. ERNEUTE SPRUNGBEFEHLE IN DER LUFT LASSEN DICH WEITERE SCHLUCHTEN ÜBERWINDEN!",
    velocityBooster: "GESCHWINDIGKEITS-BESCHLEUNIGER (🔥)",
    velocityDesc: "BERÜHRE DIE VEKTOR-PFEILE FÜR 4.0 SEKUNDEN GESCHWINDIGKEITS-BOOST (+55%). HINTERLÄSST FEURIGE RAKETEN-SPUREN!",
    startRun: "STARTEN",
    controlsOverlay: "STEUERUNG: LEERTASTE / KLICK ZUM SPRINGEN. WEICHE PHYSIKALISCH-DYNAMISCHEN SPIKES AUS. PERSPEKTIVENWECHSEL MIT DEINEM AUGE-ICON!",
    
    selectLevel: "LEVEL WÄHLEN",
    rhythmMetadata: "RHYTHMUS METADATEN",
    buildLevel: "LEVEL BAUEN",
    stars: "Sterne",
    speed: "TEMPO",
    attempts: "VERSUCHE",
    progress: "FORTSCHRITT",
    editCustomLevel: "Eigenes Level bearbeiten",
    deleteLevel: "Level löschen",

    customizer: "SKIN AUSWÄHLEN",
    selectClass: "CUBE-MATRIX WÄHLEN",
    unlocked: "FREIGESCHALTET",
    unlockedWord: "Freigeschaltet",
    locked: "GESPERRT",
    equipped: "AUSGERÜSTET",
    equip: "AUSRÜSTEN",
    buyFor: "KAUFEN FÜR",
    insufficientStars: "ZU WENIG STERNE",

    menuSynthesizer: "MENÜ-SYNTH-KONSOLE",
    audioMixerDesc: "Echtzeit-Modular-Audio-Treiber für das Menü",
    liveMixing: "MIXING IN ECHTZEIT ...",
    activateDsp: "INTRO-DSP AKTIVIEREN",
    acousticPresets: "Akustische Presets (Stil)",
    muteDecks: "SPUREN STUMMSCHALTEN (LIVE INJEKTIONEN)",
    kick: "KICK",
    shaker: "SHAKER",
    pad: "PAD",
    lead: "LEAD",
    bpmClockRate: "Echtzeit BPM-Rate",
    scaleTransposition: "Tonart transponieren",
    melodyVoice: "Melodiestimme",
    harmonyBase: "Harmoniebass",
    stepSequencerGrid: "Interaktives 16-Schritte Sequenzer-Raster",
    currentStep: "AKTUELLER_SCHRITT",
    stopped: "GESTOPPT",
    midiClockActive: "MIDI-CHRONOMETER: AKTIV",
    sensitivity: "AUFLÖSUNG: 44.1 KHZ / WEB_AUDIO",
    customSoundboard: "EIGENES SOUNDBOARD-PLAYGROUND",
    soundboardDesc: "Interaktive modulare Synthesizer auf Knopfdruck abspielen",
    interactivePads: "INTERAKTIVE ECHTZEIT-DRUMPADS",
    synthesizeRhythm: "PROZEDURALEN RHYTHMUS-LOOP ERZEUGEN",

    score: "PUNKTE",
    percent: "PROZENT",
    pauseTitle: "SPIEL PAUSIERT",
    resume: "FORTSETZEN",
    restartRun: "NEU STARTEN",
    bestDistance: "BESTE WEITE",
    normalMode: "NORMALER MODUS",
    practiceMode: "ÜBUNG (CHECKPOINTS)",
    doubleJumpCharge: "DOPPELSPRÜNGE BEREIT",
    speedBoostCharge: "RAKETENBOOST AKTIV",
    gravityNormal: "GRAVITATION: NORMAL",
    gravityInverted: "GRAVITATION: INVERTIERT",

    crashDetected: "CRASH ERKANNT",
    respawning: "WURMLESER RESPONDET...",
    attemptLabel: "VERSUCH",
    levelCompleted: "LEVEL ABGESCHLOSSEN!",
    starsRecovered: "STERNE GERETTET:",
    playAgain: "NOCHMAL SPIELEN",
    backToMenu: "ZUM MENÜ",

    customLevelCreator: "LEVEL-ARCHITEKT",
    creatorSubtitle: "Erstelle und kodiere deine eigenen Welten",
    exitCreator: "SCHLIEẞEN",
    levelProperties: "LEVEL-EINSTELLUNGEN",
    levelName: "Level Name",
    themeColor: "Ästhetische Farbe",
    targetBpm: "Ziel-Tempo (BPM)",
    difficulty: "Schwierigkeitsgrad",
    levelLength: "Streckenlänge",
    addObstacles: "HINDERNISSE PLATZIEREN",
    saveLevel: "LEVEL SPEICHERN",
    aiGenerator: "KI-KOMPANION (GENERIERUNG)",
    aiPrompt: "Anweisungen eingeben (z. B. viele Sprünge, Hyperboost, etc.)",
    aiGenerate: "KI GENERIEREN",
    aiGenerating: "ERSTELLE LEVEL IM NEURONALEN NETZ...",
    importAiLevel: "KI-LEVEL IMPORTIEREN",
    savesAndCloud: "SPEICHER-KONSOLE & SAVES",
    savesSubtitle: "Sichere und synchronisiere deine Level",
    selectLanguage: "SPRACHE"
  },
  ES: {
    stereoscopicEng: "MOTOR ESTEREOSCÓPICO v3",
    starsBalance: "BALANTE_ESTRELLAS",
    levelProgress: "PROGRESO_NIVEL",
    muteAudio: "Silenciar audio",
    unmuteAudio: "Activar audio",
    active: "ACTIVO",
    tacticalHud: "HUD TÁCTICO: SISTEMAS ACTIVOS INTEGRADOS",
    emeraldCrystal: "CRISTAL ESMERALDA (⚡)",
    emeraldDesc: "COLECCIONA PARA CARGAR 2 DOBLES SALTOS EN EL AIRE. ¡RE-ACTIVA SALTOS EN EL VUELO PARA SUPERAR ABISMOS MÁS PROFUNDOS!",
    velocityBooster: "ACELERADOR DE VELOCIDAD (🔥)",
    velocityDesc: "¡ACTIVA LAS FLECHAS VECTORIALES PARA DESENCADENAR 4.0 SEGUNDOS DE IMPULSO (+55%)! ¡DEJA RASTROS DE FUEGO Y ELEVA LA VELOCIDAD!",
    startRun: "CORRER",
    controlsOverlay: "CONTROLES: ESPACIO / CLIC EN PANTALLA PARA SALTAR. ESQUIVA PICOS DE FÍSICA. ¡USA LA VENTANA DEL OJO PARA PERSPECTIVA!",
    
    selectLevel: "SELECCIONAR NIVEL",
    rhythmMetadata: "METADATOS DE RITMO",
    buildLevel: "CREAR NIVEL",
    stars: "Estrellas",
    speed: "VELOCIDAD",
    attempts: "INTENTOS",
    progress: "PROGRESO",
    editCustomLevel: "Editar nivel personalizado",
    deleteLevel: "Borrar nivel",

    customizer: "CREADOR DE SKIN",
    selectClass: "SELECCIONAR MATRIZ CUBICA",
    unlocked: "DESBLOQUEADO",
    unlockedWord: "Desbloqueado",
    locked: "BLOQUEADO",
    equipped: "EQUIPADO",
    equip: "EQUIPAR",
    buyFor: "COMPRAR POR",
    insufficientStars: "ESTRELLAS INSUFICIENTES",

    menuSynthesizer: "CONSOLA DE MENÚ SYNTH",
    audioMixerDesc: "Controlador de audio modular en tiempo real",
    liveMixing: "MEZCLANDO EN VIVO ...",
    activateDsp: "ACTIVAR INTRO DSP",
    acousticPresets: "Alineaciones acústicas",
    muteDecks: "SILENCIAR CANALES (INYECCIÓN)",
    kick: "BOMBO",
    shaker: "AGITADOR",
    pad: "PAD",
    lead: "GUÍA",
    bpmClockRate: "Velocidad de BPM",
    scaleTransposition: "Transposición de Escala",
    melodyVoice: "Voz de Melodía",
    harmonyBase: "Base Armónica",
    stepSequencerGrid: "Cuadrícula del secuenciador de 16 pasos",
    currentStep: "PASO_ACTUAL",
    stopped: "DETENIDO",
    midiClockActive: "RELOJ MIDI: ACTIVO",
    sensitivity: "SENSIBILIDAD: 44.1 KHZ / AUDIO BUFFER",
    customSoundboard: "TAPÁ DE EFECTOS ESPECIALES",
    soundboardDesc: "Activa sintetizadores modulares en tiempo real",
    interactivePads: "ALMOHADILLAS INTERACTIVAS",
    synthesizeRhythm: "SINTETIZAR RITMO PROCEDIMENTAL",

    score: "PUNTUACIÓN",
    percent: "PORCENTAJE",
    pauseTitle: "JUEGO PAUSADO",
    resume: "REANUDAR",
    restartRun: "REINICIAR",
    bestDistance: "MEJOR DISTANCIA",
    normalMode: "CARRERA NORMAL",
    practiceMode: "PRÁCTICA (PUNTOS)",
    doubleJumpCharge: "SALTOS DISPONIBLES",
    speedBoostCharge: "SUPER EMPUJE INICIADO",
    gravityNormal: "GRAVEDAD: NORMAL",
    gravityInverted: "GRAVEDAD: INVERTIDA",

    crashDetected: "CRASH DETECTADO",
    respawning: "REAPARECIENDO...",
    attemptLabel: "INTENTO",
    levelCompleted: "¡NIVEL COMPLETADO!",
    starsRecovered: "ESTRELLAS CONSEGUIDAS:",
    playAgain: "OTRA VEZ",
    backToMenu: "VOLVER AL MENÚ",

    customLevelCreator: "DISEÑADOR DE NIVELES",
    creatorSubtitle: "Diseña mapas de picos de forma dinámica",
    exitCreator: "SALIR",
    levelProperties: "AJUSTES DE MAPA",
    levelName: "Nombre de Nivel",
    themeColor: "Color de Iluminación",
    targetBpm: "Tempo del Mapa (BPM)",
    difficulty: "Nivel de Dificultad",
    levelLength: "Longitud de Carrera",
    addObstacles: "AÑADIR OBSTÁCULOS",
    saveLevel: "GUARDAR NIVEL",
    aiGenerator: "GENERADOS CON COMPAÑERO KI (KI)",
    aiPrompt: "Instrucciones de compilación (ej. saltos rápidos, etc.)",
    aiGenerate: "COMPILAR POR KI",
    aiGenerating: "SINTETIZANDO EN RED NEURONAL...",
    importAiLevel: "IMPORTAR NIVEL DE KI",
    savesAndCloud: "CONSOLA DE ARCHIVOS",
    savesSubtitle: "Guarda y restaura tu progreso con seguridad",
    selectLanguage: "IDIOMA"
  },
  FR: {
    stereoscopicEng: "MOTEUR STÉRÉOSCOPIQUE v3",
    starsBalance: "SOLDE_ETOILES",
    levelProgress: "PROGRES_NIVEAUX",
    muteAudio: "Couper le son",
    unmuteAudio: "Activer le son",
    active: "ACTIF",
    tacticalHud: "HUD TACTIQUE : SYSTÈMES ACTIFS INTÉGRÉS",
    emeraldCrystal: "CRISTAL D'ÉMERAUDE (⚡)",
    emeraldDesc: "COLLECTEZ POUR CHARGER 2 DOUBLES SAUTS EN PLEIN VOL. RÉACTIVEZ LES COMMANDES EN VOL POUR SURMONTER LES ABÎMES DE PIC !",
    velocityBooster: "ACCÉLÉRATEUR DE VITESSE (🔥)",
    velocityDesc: "ENGAGEZ LES FLÈCHES VECTORIELLES POUR ACTIVER UN BOOST DE VITESSE DE 4,0 SECONDES (+55%). LAISSE DES TRAÎNÉES DE FEU ET ACCÉLÈRE !",
    startRun: "COMMENCER",
    controlsOverlay: "CONTRÔLES : ESPACE / CLIC ÉCRAN POUR SAUTER. ÉVITEZ LES PICS PHYSIQUES. UTILISEZ LE VISEUR D'ŒIL POUR CONFIGURER CHAQUE PERSPECTIVE !",
    
    selectLevel: "SÉLECTIONNER NIVEAU",
    rhythmMetadata: "MÉTADONNÉES DE RYTHME",
    buildLevel: "CONSTRUIRE UN NIVEAU",
    stars: "Étoiles",
    speed: "VITESSE",
    attempts: "TENTATIVES",
    progress: "PROGRESSION",
    editCustomLevel: "Éditer niveau perso",
    deleteLevel: "Supprimer niveau",

    customizer: "STYLE DU CUBE",
    selectClass: "SÉLECTIONNER MATRICE CUBE",
    unlocked: "DÉVERROUILLÉ",
    unlockedWord: "Déverrouillé",
    locked: "VERROUILLÉ",
    equipped: "ÉQUIPÉ",
    equip: "ÉQUIPER",
    buyFor: "ACHETER POUR",
    insufficientStars: "ÉTOILES INSUFFISANTES",

    menuSynthesizer: "CONSOLE SYS-SYNTH MENUS",
    audioMixerDesc: "Pilote audio de menu modulaire en temps réel",
    liveMixing: "MIXAGE EN DIRECT ...",
    activateDsp: "ACTIVER LE DSP INTRO",
    acousticPresets: "Configuration Acoustique",
    muteDecks: "MUTATION DE CANAUX (DIRECT)",
    kick: "KICK",
    shaker: "SECOUEUR",
    pad: "PAD",
    lead: "SOLO",
    bpmClockRate: "Rythme de Tempo (BPM)",
    scaleTransposition: "Transposition Musicale",
    melodyVoice: "Voix Mélodique",
    harmonyBase: "Basse d'Accord",
    stepSequencerGrid: "Grille de séquenceur interactive 16 étapes",
    currentStep: "ÉTAPE_ACTU",
    stopped: "ARRÊT",
    midiClockActive: "HORLOGE MIDI : ACTIVE",
    sensitivity: "SENSIBILITÉ : 44,1 KHZ / BUFFER WEB_AUDIO",
    customSoundboard: "TABLE DE SYNTHÉTISATION",
    soundboardDesc: "Déclenchez des synthétiseurs en temps réel",
    interactivePads: "PADS INTERACTIFS DIRECTS",
    synthesizeRhythm: "GÉNÉRER UN RYTHME DE SYNTHÈSE",

    score: "SCORE",
    percent: "POURCENT",
    pauseTitle: "JEU EN PAUSE",
    resume: "REPRENDRE",
    restartRun: "RECOMMENCER",
    bestDistance: "MEILLEUR RENTRÉE",
    normalMode: "COURSE NORMAL",
    practiceMode: "ENTRAÎNEMENT (CHECKPOINTS)",
    doubleJumpCharge: "DOUBLE SAUTS CHARGÉS",
    speedBoostCharge: "SUPER PROPULSION COMPILÉE",
    gravityNormal: "GRAVITÉ : NORMALE",
    gravityInverted: "GRAVITÉ : INVERSÉE",

    crashDetected: "COLLISION DÉTECTÉE",
    respawning: "RÉAPPARITION...",
    attemptLabel: "TENTATIVE",
    levelCompleted: "NIVEAU TERMINÉ !",
    starsRecovered: "ÉTOILES RÉCUPÉRÉES :",
    playAgain: "REJOUER",
    backToMenu: "RETOUR AU MENU",

    customLevelCreator: "ARCHITECTE DE NIVEAU",
    creatorSubtitle: "Créez vos propres parcours d'obstacles physiques",
    exitCreator: "RETOURNER",
    levelProperties: "OPTIONS DU NIVEAU",
    levelName: "Nom du Niveau",
    themeColor: "Couleur Thématique",
    targetBpm: "BPM de Vitesse cible",
    difficulty: "Difficulté Établie",
    levelLength: "Distance de la piste",
    addObstacles: "AJOUTER DES OBSTACLES",
    saveLevel: "SAUVEGARDER LE NIVEAU",
    aiGenerator: "COMPAGNON D'INTELLIGENCE COMPILÉ (KI)",
    aiPrompt: "Directives de génération (ex. beaucoup de sauts, etc.)",
    aiGenerate: "NEURONALE CRÉATION",
    aiGenerating: "SÉLECTION DU RÉSEAU DE COMPILATION...",
    importAiLevel: "CHARGER LE NIVEAU KI",
    savesAndCloud: "SAUVEGARDES PAR CLOUD",
    savesSubtitle: "Sécurisez vos niveaux et configurations de progression",
    selectLanguage: "LANGUE"
  }
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('gd3d_language');
    if (saved === 'EN' || saved === 'DE' || saved === 'ES' || saved === 'FR') {
      return saved as Language;
    }
    return 'EN';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('gd3d_language', lang);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
