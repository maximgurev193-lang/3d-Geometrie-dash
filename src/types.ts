export type GameState = 'START' | 'PLAYING' | 'CRASHED' | 'WON' | 'PAUSED';

export type CameraMode = 'CLASSIC_3D' | 'CHASE_3D' | 'TOP_DOWN' | 'BIRD_EYE_3D' | 'ORTHO_2D';

export type ObstacleType = 
  | 'SPIKE' 
  | 'DOUBLE_SPIKE' 
  | 'TRIPLE_SPIKE' 
  | 'BLOCK' 
  | 'ORB_YELLOW' 
  | 'PAD_YELLOW' 
  | 'PORTAL_GRAVITY_UP' 
  | 'PORTAL_GRAVITY_DOWN' 
  | 'PORTAL_SPEED_1X'
  | 'PORTAL_SPEED_2X'
  | 'STAR'
  | 'POWERUP_DOUBLE_JUMP'
  | 'POWERUP_SPEED_BOOST';

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;          // Position along the horizontal track (Z-axis or X-axis)
  y: number;          // Height above the floor (normally 0 for spikes/blocks)
  width: number;
  height: number;
  depth: number;
  collected?: boolean;
}

export type Difficulty = 'EASY' | 'NORMAL' | 'HARD' | 'INSANE' | 'DEMON';

export interface Level {
  id: string;
  name: string;
  difficulty: Difficulty;
  speed: number;       // speed multiplier
  color: string;       // HEX color theme for lights & backgrounds
  bpm: number;         // Beats per minute for music synthesis
  obstacles: Obstacle[];
  length: number;      // Total track end position
  starsAvailable: number;
}

export interface Skin {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  faceType: 'happy' | 'angry' | 'cool' | 'glowing' | 'retro' | 'derp';
  glowColor: string;
  price: number;
  unlocked: boolean;
}

export interface Checkpoint {
  id: string;
  x: number;
  y: number;
  vy: number;
  gravityUp: boolean;
  attemptTime: number;
}

export interface PlayerStats {
  stars: number;
  attempts: number;
  jumps: number;
  starsCollectedThisRun: number;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  percentage: number;
  timeSeconds: number;
  date: string;
  isPractice: boolean;
}
