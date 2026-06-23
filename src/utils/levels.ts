import { Level, Obstacle, ObstacleType } from '../types';

// Helper to create obstacles easily
let idCounter = 0;
function createObst(type: ObstacleType, x: number, y: number, w = 1, h = 1, d = 1): Obstacle {
  return {
    id: `${type}-${idCounter++}-${x}`,
    type,
    x,
    y,
    width: w,
    height: h,
    depth: d,
  };
}

export const PREDEFINED_LEVELS: Level[] = [
  {
    id: 'stereo_madness',
    name: 'Stereo Madness',
    difficulty: 'EASY',
    speed: 12,
    color: '#3b82f6', // Neon Blue
    bpm: 130,
    length: 220,
    starsAvailable: 5,
    obstacles: [
      // Introduction to spikes
      createObst('SPIKE', 20, 0),
      createObst('STAR', 25, 1.5),
      createObst('SPIKE', 35, 0),
      createObst('POWERUP_DOUBLE_JUMP', 40, 1.2),
      createObst('SPIKE', 48, 0),
      
      // Introduce blocks
      createObst('BLOCK', 60, 0, 3, 1, 1),
      createObst('BLOCK', 63, 0, 2, 2, 1),
      createObst('STAR', 64, 3.2),
      createObst('SPIKE', 72, 0),
      
      // Blocks + Spikes
      createObst('BLOCK', 80, 0, 4, 1, 1),
      createObst('SPIKE', 82, 1), // Spike on top of block
      createObst('SPIKE', 92, 0),
      createObst('DOUBLE_SPIKE', 104, 0, 2, 1, 1),
      createObst('POWERUP_DOUBLE_JUMP', 110, 1.2),
      createObst('STAR', 105, 1.8),
      
      // Step climbs
      createObst('BLOCK', 120, 0, 3, 1, 1),
      createObst('BLOCK', 125, 0, 3, 2, 1),
      createObst('BLOCK', 130, 0, 3, 3, 1),
      createObst('POWERUP_SPEED_BOOST', 138, 1.2),
      createObst('SPIKE', 145, 0),
      createObst('DOUBLE_SPIKE', 155, 0, 2, 1, 1),
      createObst('STAR', 160, 1.5),
      
      // Final lap
      createObst('BLOCK', 170, 0, 2, 2, 1),
      createObst('SPIKE', 182, 0),
      createObst('DOUBLE_SPIKE', 195, 0, 2, 1, 1),
      createObst('STAR', 198, 1.8),
      createObst('SPIKE', 208, 0),
    ]
  },
  {
    id: 'back_on_track',
    name: 'Back On Track',
    difficulty: 'NORMAL',
    speed: 14,
    color: '#10b981', // Neon Emerald Green
    bpm: 135,
    length: 260,
    starsAvailable: 6,
    obstacles: [
      // Introduce bounce pads
      createObst('SPIKE', 22, 0),
      createObst('PAD_YELLOW', 35, 0, 1, 0.2), // Jumps automatically over a double spike!
      createObst('DOUBLE_SPIKE', 38, 0, 2, 1, 1),
      createObst('STAR', 39, 4),
      
      // Rhythmic platform jumping
      createObst('BLOCK', 55, 0, 2, 1, 1),
      createObst('BLOCK', 62, 0, 2, 2, 1),
      createObst('BLOCK', 69, 0, 2, 3, 1),
      createObst('SPIKE', 70, 3), // Spike on the top block
      
      createObst('PAD_YELLOW', 82, 0, 1, 0.2), // Launch onto higher block
      createObst('BLOCK', 85, 2, 4, 1, 1),
      createObst('STAR', 87, 3.5),
      createObst('SPIKE', 95, 0),
      
      // Double pads & blocks
      createObst('DOUBLE_SPIKE', 110, 0, 2, 1, 1),
      createObst('PAD_YELLOW', 125, 0, 1, 0.2),
      createObst('BLOCK', 128, 2, 2, 1, 1),
      createObst('PAD_YELLOW', 130, 2, 1, 0.2), // Jump from platform to higher platform
      createObst('BLOCK', 133, 4, 3, 1, 1),
      createObst('STAR', 135, 5.5),
      createObst('SPIKE', 145, 0),
      
      // Fast runs
      createObst('SPIKE', 160, 0),
      createObst('DOUBLE_SPIKE', 172, 0, 2, 1, 1),
      createObst('PAD_YELLOW', 185, 0, 1, 0.2),
      createObst('BLOCK', 188, 3, 4, 1, 1),
      createObst('SPIKE', 190, 3.8),
      createObst('STAR', 198, 1.5),
      
      // Sinks and pits
      createObst('BLOCK', 210, 0, 3, 1, 1),
      createObst('SPIKE', 214, 0),
      createObst('BLOCK', 218, 0, 3, 1, 1),
      createObst('STAR', 228, 2),
      createObst('TRIPLE_SPIKE', 240, 0, 3, 1, 1), // Tough finish!
    ]
  },
  {
    id: 'polargeist',
    name: 'Polargeist',
    difficulty: 'HARD',
    speed: 15,
    color: '#a855f7', // Electric Violet/Purple
    bpm: 140,
    length: 300,
    starsAvailable: 8,
    obstacles: [
      // Introduce Yellow jumping ORBS
      createObst('SPIKE', 20, 0),
      createObst('BLOCK', 32, 0, 3, 1, 1),
      createObst('ORB_YELLOW', 38, 1.8), // Hit JUMP mid-air to make it across!
      createObst('BLOCK', 44, 0, 3, 1, 1),
      createObst('STAR', 38, 3.5),
      
      createObst('DOUBLE_SPIKE', 55, 0, 2, 1, 1),
      createObst('ORB_YELLOW', 68, 1.2), // Orb jump over double spike
      createObst('DOUBLE_SPIKE', 68, 0, 2, 1, 1),
      createObst('STAR', 74, 2.5),
      
      // Portal gravity up!
      createObst('BLOCK', 90, 0, 4, 1, 1),
      createObst('PORTAL_GRAVITY_UP', 100, 1, 1, 3.5, 1), // Normal height portal flips gravity
      createObst('BLOCK', 108, 5, 6, 1, 1), // Ceiling block to land on
      createObst('SPIKE', 111, 4), // Hanging spike from ceiling (ceiling is at 5, so Spike occupies top under ceiling)
      createObst('STAR', 112, 3),

      // Gravity-flipped platforming
      createObst('BLOCK', 125, 5, 4, 1, 1),
      createObst('ORB_YELLOW', 133, 3.8), // Flipped orb jump
      createObst('BLOCK', 140, 5, 4, 1, 1),
      
      // Portal gravity down!
      createObst('PORTAL_GRAVITY_DOWN', 155, 3, 1, 3.5, 1), // Return to ground code
      createObst('SPIKE', 165, 0),
      createObst('DOUBLE_SPIKE', 178, 0, 2, 1, 1),
      createObst('STAR', 183, 1.5),

      // Orb chain!
      createObst('BLOCK', 195, 0, 3, 1, 1),
      createObst('ORB_YELLOW', 204, 1.6),
      createObst('ORB_YELLOW', 212, 2.8),
      createObst('BLOCK', 220, 2, 4, 1, 1),
      createObst('STAR', 222, 3.8),
      createObst('SPIKE', 235, 0),
      
      createObst('PAD_YELLOW', 246, 0, 1, 0.2),
      createObst('BLOCK', 250, 4, 2, 1, 1),
      createObst('SPIKE', 260, 0),
      createObst('TRIPLE_SPIKE', 275, 0, 3, 1, 1),
      createObst('STAR', 285, 1.5),
    ]
  },
  {
    id: 'clutterfunk',
    name: 'Clutterfunk',
    difficulty: 'INSANE',
    speed: 16.5,
    color: '#f59e0b', // Neon Amber/Orange
    bpm: 145,
    length: 330,
    starsAvailable: 10,
    obstacles: [
      createObst('SPIKE', 18, 0),
      createObst('PAD_YELLOW', 30, 0, 1, 0.2),
      createObst('BLOCK', 33, 3, 3, 1, 1),
      createObst('SPIKE', 34, 3.8),
      createObst('STAR', 39, 1.5),
      
      createObst('ORB_YELLOW', 48, 1.5),
      createObst('BLOCK', 54, 2, 3, 1, 1),
      createObst('PORTAL_GRAVITY_UP', 64, 3, 1, 3, 1),
      
      // Ceiling gameplay
      createObst('BLOCK', 70, 6, 8, 1, 1),
      createObst('SPIKE', 72, 5),
      createObst('SPIKE', 76, 5),
      createObst('STAR', 74, 3.5),
      
      // Rapid gravity flips
      createObst('PORTAL_GRAVITY_DOWN', 88, 3, 1, 3, 1),
      createObst('SPIKE', 96, 0),
      createObst('PORTAL_GRAVITY_UP', 105, 1, 1, 3, 1),
      createObst('BLOCK', 112, 6, 4, 1, 1),
      createObst('STAR', 114, 4),
      
      createObst('PORTAL_GRAVITY_DOWN', 125, 3, 1, 3, 1),
      createObst('DOUBLE_SPIKE', 135, 0, 2, 1, 1),
      
      // Jumping on thin columns
      createObst('BLOCK', 148, 0, 1, 1, 1),
      createObst('BLOCK', 154, 0, 1, 2, 1),
      createObst('BLOCK', 160, 0, 1, 3, 1),
      createObst('STAR', 154, 3.5),
      createObst('SPIKE', 168, 0),
      
      // Orb to Pad sequence
      createObst('ORB_YELLOW', 178, 1.2),
      createObst('BLOCK', 184, 1.5, 3, 1, 1),
      createObst('PAD_YELLOW', 185, 2.3, 1, 0.2),
      createObst('STAR', 185, 5),
      createObst('BLOCK', 190, 5, 4, 1, 1),
      
      createObst('PORTAL_GRAVITY_DOWN', 205, 3, 1, 3, 1),
      createObst('TRIPLE_SPIKE', 218, 0, 3, 1, 1),
      createObst('SPIKE', 230, 0),
      
      // Infinite stair jumps
      createObst('BLOCK', 242, 0, 2, 1, 1),
      createObst('ORB_YELLOW', 248, 2.5),
      createObst('BLOCK', 254, 3, 2, 1, 1),
      createObst('ORB_YELLOW', 260, 4.5),
      createObst('BLOCK', 266, 5, 3, 1, 1),
      createObst('STAR', 267, 6.5),
      
      createObst('PORTAL_GRAVITY_DOWN', 280, 4, 1, 4, 1),
      createObst('TRIPLE_SPIKE', 295, 0, 3, 1, 1),
      createObst('DOUBLE_SPIKE', 310, 0, 2, 1, 1),
      createObst('STAR', 315, 1.5),
    ]
  },
  {
    id: 'demon_fortress',
    name: 'Demon Fortress',
    difficulty: 'DEMON',
    speed: 18,
    color: '#ef4444', // Fiery Red
    bpm: 155,
    length: 380,
    starsAvailable: 15,
    obstacles: [
      createObst('TRIPLE_SPIKE', 20, 0, 3, 1, 1), // Instant brutality
      createObst('STAR', 25, 2.5),
      createObst('BLOCK', 35, 0, 2, 2, 1),
      createObst('SPIKE', 35, 2),
      createObst('SPIKE', 42, 0),
      
      // Orb precise jumps
      createObst('DOUBLE_SPIKE', 52, 0, 2, 1, 1),
      createObst('ORB_YELLOW', 53, 2.2), // precise mid-air orb press
      createObst('BLOCK', 60, 3, 2, 1, 1),
      createObst('SPIKE', 61, 3.8),
      createObst('STAR', 53, 4),

      // Fast Portal shift
      createObst('PORTAL_GRAVITY_UP', 72, 3, 1, 3, 1),
      createObst('BLOCK', 78, 6, 3, 1, 1),
      createObst('SPIKE', 79, 5),
      createObst('PORTAL_GRAVITY_DOWN', 88, 3, 1, 3, 1),
      
      createObst('TRIPLE_SPIKE', 98, 0, 3, 1, 1),
      
      // High-altitude parkour
      createObst('PAD_YELLOW', 110, 0, 1, 0.2),
      createObst('BLOCK', 114, 4, 2, 1, 1),
      createObst('SPIKE', 115, 4.8),
      createObst('ORB_YELLOW', 123, 4.8),
      createObst('BLOCK', 130, 4, 2, 1, 1),
      createObst('STAR', 123, 6.5),
      
      // Anti-gravity gauntlet
      createObst('PORTAL_GRAVITY_UP', 142, 2, 1, 3, 1),
      createObst('BLOCK', 148, 6, 12, 1, 1),
      createObst('SPIKE', 151, 5),
      createObst('SPIKE', 155, 5),
      createObst('SPIKE', 159, 5),
      createObst('ORB_YELLOW', 165, 4.2),
      createObst('SPIKE', 168, 5),
      createObst('STAR', 160, 3.5),
      
      // Drop back with spike pit
      createObst('PORTAL_GRAVITY_DOWN', 182, 3, 1, 3, 1),
      createObst('TRIPLE_SPIKE', 185, 0, 3, 1, 1),
      
      // Precision narrow gaps
      createObst('BLOCK', 200, 0, 4, 2, 1),
      createObst('BLOCK', 200, 4, 4, 3, 1), // gap at y = 2, 3
      createObst('STAR', 202, 3),
      
      createObst('TRIPLE_SPIKE', 215, 0, 3, 1, 1),
      
      // Pad to orb to portal combo!
      createObst('PAD_YELLOW', 228, 0, 1, 0.2),
      createObst('ORB_YELLOW', 234, 3.5),
      createObst('PORTAL_GRAVITY_UP', 242, 5, 1, 3, 1),
      createObst('BLOCK', 248, 8, 4, 1, 1),
      createObst('SPIKE', 249, 7),
      createObst('STAR', 250, 5),
      
      createObst('PORTAL_GRAVITY_DOWN', 265, 5, 1, 3, 1),
      createObst('TRIPLE_SPIKE', 278, 0, 3, 1, 1),
      
      // Mega climax stair climbing with spikes
      createObst('BLOCK', 290, 0, 2, 1, 1),
      createObst('BLOCK', 295, 0, 2, 2, 1),
      createObst('SPIKE', 295, 2.8),
      createObst('BLOCK', 300, 0, 2, 3, 1),
      createObst('SPIKE', 300, 3.8),
      createObst('BLOCK', 305, 0, 2, 4, 1),
      createObst('SPIKE', 305, 4.8),
      createObst('STAR', 306, 6),
      
      createObst('PAD_YELLOW', 315, 0, 1, 0.2),
      createObst('TRIPLE_SPIKE', 330, 0, 3, 1, 1),
      createObst('TRIPLE_SPIKE', 345, 0, 3, 1, 1),
      createObst('STAR', 355, 1.5),
      createObst('TRIPLE_SPIKE', 362, 0, 3, 1, 1),
    ]
  },
  {
    id: 'dash',
    name: 'Dash',
    difficulty: 'INSANE',
    speed: 17.5,
    color: '#ff6b00', // Fiery Lava Orange
    bpm: 150,
    length: 360,
    starsAvailable: 12,
    obstacles: [
      createObst('SPIKE', 18, 0),
      createObst('POWERUP_SPEED_BOOST', 24, 1.2), // High speed dash intro!
      createObst('DOUBLE_SPIKE', 36, 0, 2, 1, 1),
      createObst('STAR', 40, 2.5),

      // Landing blocks and rapid platforms
      createObst('BLOCK', 50, 0, 4, 1, 1),
      createObst('SPIKE', 52, 1),
      createObst('ORB_YELLOW', 59, 2.0),
      createObst('BLOCK', 66, 1.5, 3, 1, 1),
      createObst('STAR', 68, 3.2),

      // Bounce pads into high jumps
      createObst('PAD_YELLOW', 78, 0, 1, 0.2),
      createObst('BLOCK', 82, 3, 3, 1, 1),
      createObst('SPIKE', 83, 3.8),
      createObst('DOUBLE_SPIKE', 94, 0, 2, 1, 1),

      // Gravity-flipped dynamic dash gameplay
      createObst('PORTAL_GRAVITY_UP', 106, 2, 1, 3, 1),
      createObst('BLOCK', 114, 5, 8, 1, 1),
      createObst('SPIKE', 117, 4), // Hanging spike
      createObst('STAR', 118, 2.5),
      createObst('ORB_YELLOW', 126, 3.5), // Interactive flipped orb
      createObst('BLOCK', 132, 5, 4, 1, 1),
      createObst('PORTAL_GRAVITY_DOWN', 142, 3, 1, 3, 1),

      // Double-jump powerup adventure!
      createObst('POWERUP_DOUBLE_JUMP', 152, 1.2),
      createObst('TRIPLE_SPIKE', 165, 0, 3, 1, 1), // Jump 1
      createObst('TRIPLE_SPIKE', 178, 0, 3, 1, 1), // Mid-air double jump!
      createObst('STAR', 171, 3.5),

      // Falling and rising stair gauntlet
      createObst('BLOCK', 190, 0, 2, 1, 1),
      createObst('BLOCK', 195, 0, 2, 2, 1),
      createObst('BLOCK', 200, 0, 2, 3, 1),
      createObst('SPIKE', 200, 3.8),
      createObst('PAD_YELLOW', 208, 0, 1, 0.2), // High-launch
      createObst('BLOCK', 212, 4, 4, 1, 1),
      createObst('STAR', 214, 5.5),

      // Portal shift with dual-direction spikes
      createObst('PORTAL_GRAVITY_UP', 225, 3, 1, 3, 1),
      createObst('BLOCK', 232, 5, 12, 1, 1),
      createObst('SPIKE', 236, 4),
      createObst('SPIKE', 241, 4),
      createObst('ORB_YELLOW', 246, 3.2), // Hit orb upside down
      createObst('PORTAL_GRAVITY_DOWN', 256, 3, 1, 3, 1),

      // Fast-paced final straight-out run
      createObst('POWERUP_SPEED_BOOST', 268, 1.2),
      createObst('BLOCK', 280, 0, 3, 1.5, 1),
      createObst('TRIPLE_SPIKE', 295, 0, 3, 1, 1),
      createObst('STAR', 290, 3.5),
      createObst('ORB_YELLOW', 305, 1.5),
      createObst('BLOCK', 312, 2, 4, 1, 1),
      createObst('SPIKE', 314, 2.8),
      
      // Climax
      createObst('TRIPLE_SPIKE', 330, 0, 3, 1, 1),
      createObst('DOUBLE_SPIKE', 342, 0, 2, 1, 1),
      createObst('STAR', 348, 1.8),
    ]
  },
  {
    id: 'sonic_surge',
    name: 'Sonic Surge',
    difficulty: 'HARD',
    speed: 13,
    color: '#d946ef', // Indigo / Shocking Pink
    bpm: 148,
    length: 340,
    starsAvailable: 10,
    obstacles: [
      createObst('SPIKE', 20, 0),
      createObst('STAR', 26, 1.5),
      createObst('BLOCK', 35, 0, 3, 1, 1),
      createObst('SPIKE', 36, 1),
      
      // ENTER 2X SPEED PORTAL!
      createObst('PORTAL_SPEED_2X', 55, 1, 1, 3, 1),
      
      // High-speed segment (elements spaced further to account for speed)
      createObst('SPIKE', 75, 0),
      createObst('STAR', 83, 2.5),
      createObst('DOUBLE_SPIKE', 100, 0, 2, 1, 1),
      createObst('PAD_YELLOW', 115, 0, 1, 0.2), // high launch at speed
      createObst('BLOCK', 123, 3, 4, 1, 1),
      createObst('STAR', 125, 4.5),
      
      // ENTER 1X SPEED PORTAL (stabilize)
      createObst('PORTAL_SPEED_1X', 155, 1.5, 1, 3, 1),
      
      createObst('SPIKE', 170, 0),
      createObst('ORB_YELLOW', 182, 1.5),
      createObst('BLOCK', 190, 1, 3, 1, 1),
      
      // Gravity Flip
      createObst('PORTAL_GRAVITY_UP', 205, 1.5, 1, 3, 1),
      createObst('BLOCK', 215, 5, 8, 1, 1),
      createObst('SPIKE', 218, 4), // hanging spike
      createObst('STAR', 222, 3),
      
      createObst('ORB_YELLOW', 232, 3.5),
      
      // Restore Gravity
      createObst('PORTAL_GRAVITY_DOWN', 245, 3, 1, 3, 1),
      
      createObst('POWERUP_DOUBLE_JUMP', 260, 1.2),
      createObst('TRIPLE_SPIKE', 280, 0, 3, 1, 1),
      createObst('TRIPLE_SPIKE', 298, 0, 3, 1, 1), // Double jump needed!
      createObst('STAR', 312, 2.5),
      createObst('DOUBLE_SPIKE', 325, 0, 2, 1, 1),
    ]
  },
  {
    id: 'acid_hyperdrive',
    name: 'Acid Hyperdrive',
    difficulty: 'DEMON',
    speed: 15,
    color: '#84cc16', // Acid Lime Green
    bpm: 160,
    length: 390,
    starsAvailable: 15,
    obstacles: [
      createObst('DOUBLE_SPIKE', 18, 0, 2, 1, 1),
      createObst('STAR', 25, 1.8),
      
      // Instant Hyperdrive!
      createObst('PORTAL_SPEED_2X', 40, 1, 1, 3, 1),
      
      // High-speed stair columns
      createObst('BLOCK', 65, 0, 1.5, 1.5, 1),
      createObst('SPIKE', 65, 1.5),
      createObst('BLOCK', 85, 0, 1.5, 3, 1),
      createObst('SPIKE', 85, 3),
      createObst('STAR', 85, 4.8),
      
      createObst('PAD_YELLOW', 105, 0, 1, 0.2),
      createObst('BLOCK', 112, 4, 3, 1, 1),
      
      // High altitude gravity inversion
      createObst('PORTAL_GRAVITY_UP', 125, 4, 1, 3, 1),
      createObst('BLOCK', 135, 6, 12, 1, 1),
      createObst('SPIKE', 138, 5),
      createObst('SPIKE', 148, 5),
      createObst('STAR', 143, 3.5),
      
      createObst('ORB_YELLOW', 160, 4.2),
      createObst('SPIKE', 168, 5),
      
      // drop and neutralize speed slightly
      createObst('PORTAL_SPEED_1X', 185, 4, 1, 3, 1),
      createObst('PORTAL_GRAVITY_DOWN', 195, 3, 1, 3, 1),
      
      createObst('TRIPLE_SPIKE', 212, 0, 3, 1, 1),
      createObst('ORB_YELLOW', 228, 1.5),
      createObst('BLOCK', 236, 1.5, 3, 1, 1),
      createObst('SPIKE', 237, 2.5),
      createObst('STAR', 242, 3.8),
      
      createObst('PAD_YELLOW', 255, 0, 1, 0.2),
      createObst('ORB_YELLOW', 262, 3),
      createObst('BLOCK', 270, 3, 2, 1, 1),
      
      // Climax hyperdrive finish!
      createObst('PORTAL_SPEED_2X', 285, 3, 1, 3, 1),
      createObst('TRIPLE_SPIKE', 305, 0, 3, 1, 1),
      createObst('TRIPLE_SPIKE', 325, 0, 3, 1, 1),
      createObst('STAR', 335, 2.2),
      
      createObst('TRIPLE_SPIKE', 350, 0, 3, 1, 1),
      createObst('DOUBLE_SPIKE', 368, 0, 2, 1, 1),
      createObst('STAR', 378, 1.5),
    ]
  }
];

// Generates an endless, procedurally calculated stream of playable patterns
export function generateEndlessLevel(seedScore: number): Level {
  const levelLength = 5000; // Virtually infinite length
  const obstacles: Obstacle[] = [];
  
  // Pattern components
  let curX = 30;
  while (curX < levelLength - 50) {
    const spacing = 12 + Math.random() * 12; // ensure jumps are possible
    curX += spacing;
    
    // Occasionally place magnificent double-jump powerups slightly ahead in endless levels
    if (Math.random() < 0.12) {
      obstacles.push(createObst('POWERUP_DOUBLE_JUMP', curX - 5, 1.2));
    }
    // Occasionally place legendary speed boosts to surge through the run!
    else if (Math.random() < 0.10) {
      obstacles.push(createObst('POWERUP_SPEED_BOOST', curX - 6, 1.2));
    }

    const choice = Math.random();
    
    if (choice < 0.20) {
      // Spikes
      const count = Math.random() < 0.4 ? 1 : Math.random() < 0.7 ? 2 : 3;
      if (count === 1) obstacles.push(createObst('SPIKE', curX, 0));
      else if (count === 2) obstacles.push(createObst('DOUBLE_SPIKE', curX, 0, 2, 1, 1));
      else obstacles.push(createObst('TRIPLE_SPIKE', curX, 0, 3, 1, 1));
      
      // Star above spikes occasionally
      if (Math.random() < 0.5) {
        obstacles.push(createObst('STAR', curX + (count - 1)/2, 2.2));
      }
    } else if (choice < 0.45) {
      // Block climb
      const h1 = 1 + Math.floor(Math.random() * 2);
      obstacles.push(createObst('BLOCK', curX, 0, 3, h1, 1));
      if (Math.random() < 0.4) {
        obstacles.push(createObst('SPIKE', curX + 1, h1)); // Spike on block
      }
      
      if (Math.random() < 0.5) {
        curX += 6;
        const h2 = h1 + 1;
        obstacles.push(createObst('BLOCK', curX, 0, 2, h2, 1));
        obstacles.push(createObst('STAR', curX + 1, h2 + 1.5));
      }
    } else if (choice < 0.65) {
      // Pad jump sequence
      obstacles.push(createObst('PAD_YELLOW', curX, 0, 1, 0.2));
      obstacles.push(createObst('DOUBLE_SPIKE', curX + 3, 0, 2, 1, 1));
      obstacles.push(createObst('BLOCK', curX + 6, 2, 3, 1, 1));
      obstacles.push(createObst('STAR', curX + 7, 3.5));
      curX += 8;
    } else if (choice < 0.85) {
      // Orb mid-air jump
      obstacles.push(createObst('DOUBLE_SPIKE', curX, 0, 2, 1, 1));
      obstacles.push(createObst('ORB_YELLOW', curX + 1, 1.5));
      obstacles.push(createObst('BLOCK', curX + 6, 0.5, 3, 1, 1));
      obstacles.push(createObst('STAR', curX + 1, 3.2));
      curX += 7;
    } else {
      // Gravity flip portal adventure!
      obstacles.push(createObst('PORTAL_GRAVITY_UP', curX, 1, 1, 3, 1));
      // Add ceiling blocks to land on
      obstacles.push(createObst('BLOCK', curX + 6, 5, 8, 1, 1));
      obstacles.push(createObst('SPIKE', curX + 9, 4)); // hanging spike
      obstacles.push(createObst('STAR', curX + 10, 3));
      
      obstacles.push(createObst('PORTAL_GRAVITY_DOWN', curX + 16, 3, 1, 3, 1));
      obstacles.push(createObst('SPIKE', curX + 22, 0));
      curX += 24;
    }
  }

  return {
    id: 'endless',
    name: 'Endless Run',
    difficulty: 'DEMON', // increases mentally as score rises
    speed: 14 + Math.min(seedScore / 1000, 6), // speeds up!
    color: '#3b82f6', // shifts over time
    bpm: 135 + Math.min(seedScore / 500, 30),
    length: levelLength,
    starsAvailable: 999,
    obstacles
  };
}
