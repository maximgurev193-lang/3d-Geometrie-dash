/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GameState, CameraMode, Level, Skin, Checkpoint, Obstacle } from '../types';
import { GameAudio } from '../utils/audio';

interface GameCanvasProps {
  level: Level;
  gameState: GameState;
  cameraMode: CameraMode;
  skin: Skin;
  isPracticeMode: boolean;
  isAutopilotEnabled?: boolean;
  onCrash: (percent: number) => void;
  onWin: () => void;
  onStatsUpdate: (stats: { jumps: number; stars: number }) => void;
  practiceCheckpointsRef: React.MutableRefObject<Checkpoint[]>;
  gameStateRef: React.MutableRefObject<GameState>;
}

export default function GameCanvas({
  level,
  gameState,
  cameraMode,
  skin,
  isPracticeMode,
  isAutopilotEnabled = false,
  onCrash,
  onWin,
  onStatsUpdate,
  practiceCheckpointsRef,
  gameStateRef,
}: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // References to communicate user actions (to prevent effect re-trigger closures)
  const isPracticeModeRef = useRef(isPracticeMode);
  useEffect(() => {
    isPracticeModeRef.current = isPracticeMode;
  }, [isPracticeMode]);

  const isAutopilotEnabledRef = useRef(isAutopilotEnabled);
  useEffect(() => {
    isAutopilotEnabledRef.current = isAutopilotEnabled;
  }, [isAutopilotEnabled]);

  const skinRef = useRef(skin);
  useEffect(() => {
    skinRef.current = skin;
    // We can trigger texture reconstruction in the renderer loop if skin changes
    triggerSkinUpdateRef.current = true;
  }, [skin]);

  const triggerSkinUpdateRef = useRef(false);
  const screenShakeRef = useRef(0);
  const crashExplosionSpawnedRef = useRef(false);

  const [doubleJumpsUI, setDoubleJumpsUI] = useState(0);
  const doubleJumpsUIStateRef = useRef(0);

  const [speedBoostUI, setSpeedBoostUI] = useState(0);
  const speedBoostUIStateRef = useRef(0);

  const [gestureToast, setGestureToast] = useState<{ message: string; color: string } | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  const showGestureFeedback = (message: string, color: string) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }
    setGestureToast({ message, color });
    toastTimeoutRef.current = window.setTimeout(() => {
      setGestureToast(null);
    }, 1500);
  };

  // Jump commands triggerable from parent or keyboard
  const jumpRequestedRef = useRef(false);
  const isJumpKeyHeldRef = useRef(false);
  const zPressedRef = useRef(false);
  const xPressedRef = useRef(false);

  // Game internal variables (physics/simulation running at 60 FPS)
  const playerState = useRef({
    x: 0,
    y: 0,
    vy: 0,
    gravityUp: false,
    onGround: true,
    jumps: 0,
    starsCollected: 0,
    rollAngle: 0, // dynamic visual flip
    trailParticles: [] as any[],
    orbRipples: [] as any[],
    doubleJumpsLeft: 0,
    speedBoostTimeLeft: 0,
    speedMultiplier: 1.0,
  });

  // Track coordinates of collected obstacles in this single run
  const collectedStarIdsRef = useRef<Set<string>>(new Set());

  // Checkpoint flag meshes mapped to checkpoint locations
  const flagMeshesRef = useRef<Record<string, THREE.Mesh>>({});

  // Death marker position and level tracking
  const previousDeathRef = useRef<{ x: number; y: number } | null>(null);
  const lastLevelIdRef = useRef<string | null>(null);

  // Reset core runs
  const resetRun = () => {
    crashExplosionSpawnedRef.current = false;
    playerState.current.doubleJumpsLeft = 0;
    doubleJumpsUIStateRef.current = 0;
    setDoubleJumpsUI(0);
    playerState.current.speedBoostTimeLeft = 0;
    speedBoostUIStateRef.current = 0;
    setSpeedBoostUI(0);
    playerState.current.speedMultiplier = 1.0;
    // Collect starting checkpoint if practice mode is on and has flags
    const checkpoints = practiceCheckpointsRef.current;
    if (isPracticeModeRef.current && checkpoints.length > 0) {
      const lastCp = checkpoints[checkpoints.length - 1];
      playerState.current.x = lastCp.x;
      playerState.current.y = lastCp.y;
      playerState.current.vy = lastCp.vy;
      playerState.current.gravityUp = lastCp.gravityUp;
      playerState.current.onGround = false;
      // Stars are kept or re-evaluated
    } else {
      playerState.current.x = 0;
      playerState.current.y = 0;
      playerState.current.vy = 0;
      playerState.current.gravityUp = false;
      playerState.current.onGround = true;
      playerState.current.rollAngle = 0;
      collectedStarIdsRef.current.clear();
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameStateRef.current !== 'PLAYING') return;

      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        if (!isJumpKeyHeldRef.current) {
          jumpRequestedRef.current = true;
        }
        isJumpKeyHeldRef.current = true;
        e.preventDefault();
      }
      if (e.code === 'KeyZ') {
        zPressedRef.current = true;
      }
      if (e.code === 'KeyX') {
        xPressedRef.current = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        jumpRequestedRef.current = false;
        isJumpKeyHeldRef.current = false;
      }
    };

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let lastTapTime = 0;
    let wasPausedBySwipe = false;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 0) return;

      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartTime = performance.now();
      wasPausedBySwipe = false;

      // Check for two-finger tap to place checkpoint in practice mode
      if (e.touches.length === 2 && isPracticeModeRef.current && gameStateRef.current === 'PLAYING') {
        // Prevent default jump for two finger interaction
        jumpRequestedRef.current = false;
        isJumpKeyHeldRef.current = false;
        
        // Trigger KeyZ (place checkpoint)
        zPressedRef.current = true;
        showGestureFeedback("CHECKPOINT PLACED 🤖", "#00FF95");
        e.preventDefault();
        return;
      }

      if (gameStateRef.current === 'PLAYING') {
        jumpRequestedRef.current = true;
        isJumpKeyHeldRef.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0 || gameStateRef.current !== 'PLAYING') return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX;
      const deltaY = touch.clientY - touchStartY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      // If they swiped at least 65px, trigger swipe-to-pause
      if (distance > 65 && !wasPausedBySwipe) {
        wasPausedBySwipe = true;
        // Suppress jump commands immediately
        jumpRequestedRef.current = false;
        isJumpKeyHeldRef.current = false;

        // Dispatch keydown event for Escape
        const escapeEvent = new KeyboardEvent('keydown', { code: 'Escape' });
        window.dispatchEvent(escapeEvent);
        showGestureFeedback("GAME PAUSED ⏸️", "#00E0FF");
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const now = performance.now();
      const touchDuration = now - touchStartTime;

      if (wasPausedBySwipe) {
        wasPausedBySwipe = false;
        jumpRequestedRef.current = false;
        isJumpKeyHeldRef.current = false;
        return;
      }

      // Tap-to-checkpoint logic on single tap end: (Check for double-tap)
      if (e.touches.length === 0 && isPracticeModeRef.current && gameStateRef.current === 'PLAYING') {
        const sinceLastTap = now - lastTapTime;
        // If rapid taps and was quite short, trigger practice checkpoint
        if (sinceLastTap < 260 && touchDuration < 180) {
          jumpRequestedRef.current = false;
          isJumpKeyHeldRef.current = false;

          // Dispatch KeyZ
          zPressedRef.current = true;
          showGestureFeedback("CHECKPOINT PLACED ⚡", "#03FF95");
        }
        lastTapTime = now;
      }

      // Stop jump hold on release
      if (jumpRequestedRef.current) {
        jumpRequestedRef.current = false;
        isJumpKeyHeldRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Add touch screen bindings to the workspace parent
    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart);
      container.addEventListener('touchmove', handleTouchMove);
      container.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (container) {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [gameStateRef]);

  // Click-to-jump mouse gesture in canvas container
  const handleMouseDown = () => {
    if (gameStateRef.current === 'PLAYING') {
      jumpRequestedRef.current = true;
      isJumpKeyHeldRef.current = true;
    }
  };

  const handleMouseUp = () => {
    jumpRequestedRef.current = false;
    isJumpKeyHeldRef.current = false;
  };

  // Helper: Generates a sharp Canvas Texture representing the Player Face
  const generatePlayerFaceTexture = (currentSkin: Skin): THREE.CanvasTexture => {
    const faceCanvas = document.createElement('canvas');
    faceCanvas.width = 128;
    faceCanvas.height = 128;
    const ctx = faceCanvas.getContext('2d');
    
    if (ctx) {
      // 1. Draw base container canvas background (Skin primary)
      ctx.fillStyle = currentSkin.primaryColor;
      ctx.fillRect(0, 0, 128, 128);

      // 2. Draw border inner grid (Skin secondary)
      ctx.lineWidth = 10;
      ctx.strokeStyle = currentSkin.secondaryColor;
      ctx.strokeRect(5, 5, 118, 118);

      // 3. Draw different expressive features of the Face
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';

      const f = currentSkin.faceType;

      if (f === 'happy') {
        // Eyes
        ctx.beginPath();
        ctx.arc(40, 50, 7, 0, Math.PI * 2);
        ctx.arc(88, 50, 7, 0, Math.PI * 2);
        ctx.fill();

        // Smile
        ctx.beginPath();
        ctx.arc(64, 75, 22, 0, Math.PI);
        ctx.stroke();
      } 
      else if (f === 'angry') {
        // Slanted eyebrows
        ctx.beginPath();
        ctx.moveTo(30, 36);
        ctx.lineTo(52, 48);
        ctx.moveTo(98, 36);
        ctx.lineTo(76, 48);
        ctx.stroke();

        // Eyes
        ctx.beginPath();
        ctx.arc(42, 58, 6, 0, Math.PI * 2);
        ctx.arc(86, 58, 6, 0, Math.PI * 2);
        ctx.fill();

        // Grunt/frown mouth
        ctx.beginPath();
        ctx.moveTo(45, 85);
        ctx.quadraticCurveTo(64, 74, 83, 85);
        ctx.stroke();
      } 
      else if (f === 'cool') {
        // Cool sunglasses
        ctx.fillStyle = '#111827';
        ctx.beginPath();
        ctx.moveTo(25, 42);
        ctx.lineTo(103, 42);
        ctx.lineTo(95, 60);
        ctx.quadraticCurveTo(80, 65, 66, 52);
        ctx.quadraticCurveTo(52, 65, 33, 60);
        ctx.closePath();
        ctx.fill();

        // Smile smirk
        ctx.beginPath();
        ctx.arc(75, 80, 15, 0, Math.PI);
        ctx.stroke();
      } 
      else if (f === 'retro') {
        // 8-bit eyes
        ctx.fillRect(32, 40, 16, 16);
        ctx.fillRect(80, 40, 16, 16);
        
        // 8-bit flat mouth
        ctx.fillRect(40, 78, 48, 10);
      } 
      else if (f === 'glowing') {
        // Cyber neon face
        ctx.shadowColor = currentSkin.glowColor;
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#ffffff';

        // Glowing oval eyes
        ctx.beginPath();
        ctx.ellipse(38, 50, 12, 6, 0, 0, Math.PI * 2);
        ctx.ellipse(90, 50, 12, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // High gloss smile
        ctx.beginPath();
        ctx.arc(64, 78, 14, 0, Math.PI);
        ctx.stroke();
      } 
      else if (f === 'derp') {
        // Cross eyed derp
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(36, 48, 12, 0, Math.PI * 2);
        ctx.arc(88, 48, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(42, 48, 4, 0, Math.PI * 2); // looking in
        ctx.arc(80, 48, 4, 0, Math.PI * 2); // looking in
        ctx.fill();

        // Wiggly mouth
        ctx.beginPath();
        ctx.moveTo(40, 80);
        ctx.bezierCurveTo(48, 70, 56, 92, 64, 80);
        ctx.bezierCurveTo(72, 68, 80, 92, 88, 80);
        ctx.stroke();
      }
    }

    const tex = new THREE.CanvasTexture(faceCanvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  };

  // MAIN GAME 3D VIEWPORT ENGINE (Three.js init)
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    if (lastLevelIdRef.current !== level.id) {
      previousDeathRef.current = null;
      lastLevelIdRef.current = level.id;
    }

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Initial WebGL Scene, Camera & Renderer setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a14, 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. Light Setup for futuristic neon style
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Directional light that shadows player and scrolls with playerX
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.82);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    dirLight.shadow.camera.near = 0.5;
    dirLight.shadow.camera.far = 150;
    const d = 30;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    // Dynamic glowing accent running lights to represent neon obstacles
    const pointLight = new THREE.PointLight(new THREE.Color(level.color), 3, 40);
    pointLight.position.set(0, 5, 0);
    scene.add(pointLight);

    // 3. Grid & Track Visualizations
    const trackWidth = 5;
    const trackLength = level.length;

    // Beautiful glowing Floor plane
    const floorGeo = THREE.ImageUtils ? new THREE.PlaneGeometry(trackLength * 1.5, 40) : new THREE.PlaneGeometry(trackLength * 1.5, 40);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111124,
      roughness: 0.1,
      metalness: 0.9,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(trackLength / 2, -0.5, 0);
    floor.receiveShadow = true;
    scene.add(floor);

    // Rhythmic grid lines
    const gridHelper = new THREE.GridHelper(trackLength * 2, Math.floor(trackLength / 2), 0xffffff, 0x333366);
    gridHelper.position.set(trackLength / 2, -0.48, 0);
    gridHelper.rotation.y = Math.PI / 2;
    scene.add(gridHelper);

    // Ceiling plane (for inverse gravity landings)
    const ceilingGeo = new THREE.PlaneGeometry(trackLength * 1.5, 12);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x0c0c17,
      roughness: 0.6,
      metalness: 0.2,
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(trackLength / 2, 6.5, 0); // floor is at y = -0.5, ceiling at y = +6.5 (total gap = 7)
    scene.add(ceiling);

    const ceilingGrid = new THREE.GridHelper(trackLength * 2, Math.floor(trackLength / 2), 0xffffff, 0x4d1666);
    ceilingGrid.position.set(trackLength / 2, 6.48, 0);
    scene.add(ceilingGrid);

    // Distant background starfield stars for depth
    const starGeo = new THREE.BufferGeometry();
    const starCount = 500;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = Math.random() * (trackLength * 1.5) - 100;
      starPositions[i * 3 + 1] = Math.random() * 80 + 10;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 80 - 40; // far backward
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.35,
      transparent: true,
      opacity: 0.8,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // Stretchy Background Cybermatic EQ Towers & Universal Core Sphere
    const eqGroup = new THREE.Group();
    scene.add(eqGroup);
    
    const eqTowers: THREE.Mesh[] = [];
    const towerGeo = new THREE.BoxGeometry(1.6, 12, 1.6);
    const towerMat = new THREE.MeshStandardMaterial({
      color: 0x111118,
      roughness: 0.15,
      metalness: 0.85,
    });
    
    for (let i = 0; i < 22; i++) {
      const towerMatInstance = towerMat.clone();
      const tower = new THREE.Mesh(towerGeo, towerMatInstance);
      const xPos = (trackLength / 21) * i;
      tower.position.set(xPos, -6.5, -14); // spaced far back on Z plane
      eqGroup.add(tower);
      eqTowers.push(tower);
    }
    
    // Rotating giant Wireframe core
    const coreGeo = new THREE.IcosahedronGeometry(7, 1);
    const coreMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(level.color),
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.set(trackLength / 2, 12, -22);
    scene.add(coreMesh);

    // Group for shatter / crash explosion fragments
    const debrisGroup = new THREE.Group();
    scene.add(debrisGroup);
    
    interface DebrisInfo {
      mesh: THREE.Mesh;
      vx: number;
      vy: number;
      vz: number;
      rotX: number;
      rotY: number;
    }
    const debrisMeshes: DebrisInfo[] = [];

    // 4. Mesh Player Creation
    let faceTex = generatePlayerFaceTexture(skinRef.current);
    
    // Geometry Dash is standard Cube. Left, right, top, bottom can be plain primary colors, only Front has the texture!
    const sideMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(skinRef.current.primaryColor),
      roughness: 0.3,
      metalness: 0.4,
    });
    const frontMat = new THREE.MeshStandardMaterial({
      map: faceTex,
      roughness: 0.2,
      metalness: 0.3,
    });

    const playerMaterials = [
      sideMat, // right
      sideMat, // left
      sideMat, // top
      sideMat, // bottom
      frontMat, // front (Positive Z or Positive X - let's map according to view. Let's make face look along +X direction, which is forward!)
      sideMat, // back
    ];

    const pCubeGeo = new THREE.BoxGeometry(1, 1, 1);
    const playerMesh = new THREE.Mesh(pCubeGeo, playerMaterials);
    playerMesh.castShadow = true;
    playerMesh.receiveShadow = true;
    scene.add(playerMesh);

    // Glowing outline boundary around cube (Geometry Dash glow effect!)
    const pOutlineGeo = new THREE.BoxGeometry(1.05, 1.05, 1.05);
    const pOutlineMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(skinRef.current.glowColor),
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const playerOutline = new THREE.Mesh(pOutlineGeo, pOutlineMat);
    playerMesh.add(playerOutline);

    // Neon Ghost afterimage trail meshes for speed multipliers motion blur
    const ghostMeshes: THREE.Mesh[] = [];
    const ghostCount = 3;
    const ghostMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(skinRef.current.glowColor),
      transparent: true,
      opacity: 0,
      blending: THREE.AdditiveBlending,
      wireframe: false
    });

    for (let i = 0; i < ghostCount; i++) {
      const ghost = new THREE.Mesh(pCubeGeo, ghostMaterial);
      ghost.visible = false;
      scene.add(ghost);
      ghostMeshes.push(ghost);
    }

    const trailPositions: { x: number; y: number; rollAngle: number }[] = [];

    // 4.5 3D Neon Holographic Death Marker (shows where the player failed on their previous attempt)
    const deathMarkerGroup = new THREE.Group();
    
    const poleGeo = new THREE.CylinderGeometry(0.04, 0.04, 3, 6);
    const poleMat = new THREE.MeshBasicMaterial({
      color: 0xff3333,
      transparent: true,
      opacity: 0.55
    });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 1;
    deathMarkerGroup.add(pole);

    const headGeo = new THREE.OctahedronGeometry(0.48, 0);
    const headMat = new THREE.MeshBasicMaterial({
      color: 0xff1111,
      transparent: true,
      opacity: 0.9,
      wireframe: false
    });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = 2.5;
    deathMarkerGroup.add(headMesh);

    // Glowing red orbit ring around the head
    const haloGeo = new THREE.TorusGeometry(0.55, 0.04, 6, 20);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xff3344,
      transparent: true,
      opacity: 0.75
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.position.y = 2.5;
    haloMesh.rotation.x = Math.PI / 2;
    deathMarkerGroup.add(haloMesh);

    // Mini fail icon / skull representation (crossed lines for bone symbol!)
    const crossGeo1 = new THREE.BoxGeometry(0.1, 0.6, 0.1);
    const crossMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const c1 = new THREE.Mesh(crossGeo1, crossMat);
    c1.position.y = 2.5;
    c1.rotation.z = Math.PI / 4;
    deathMarkerGroup.add(c1);

    const c2 = new THREE.Mesh(crossGeo1, crossMat);
    c2.position.y = 2.5;
    c2.rotation.z = -Math.PI / 4;
    deathMarkerGroup.add(c2);

    deathMarkerGroup.visible = false;
    scene.add(deathMarkerGroup);

    // Set initial position of death marker if we have a previous fail coordinate
    if (previousDeathRef.current) {
      deathMarkerGroup.position.set(previousDeathRef.current.x, previousDeathRef.current.y, 0);
      deathMarkerGroup.visible = true;
    }

    // 5. Generate Level 3D Obstacles
    const obstaclesGroup = new THREE.Group();
    scene.add(obstaclesGroup);

    // Keep arrays for active objects to facilitate mesh manipulation and rotation
    const obstacleGeometries: Record<string, THREE.Mesh> = {};
    const orbVisuals: THREE.Mesh[] = [];
    const starVisuals: { mesh: THREE.Mesh; id: string }[] = [];

    // Construct level props
    level.obstacles.forEach((obs) => {
      let mesh: THREE.Mesh | null = null;

      if (obs.type === 'SPIKE' || obs.type === 'DOUBLE_SPIKE' || obs.type === 'TRIPLE_SPIKE') {
        // Core spike: conical pyramid
        // For double and triple spikes, we can render multiple cones within a single obstacle boundaries
        const spikesNum = obs.type === 'SPIKE' ? 1 : obs.type === 'DOUBLE_SPIKE' ? 2 : 3;
        
        const compoundMesh = new THREE.Group() as any;
        
        for (let i = 0; i < spikesNum; i++) {
          const coneGeo = new THREE.ConeGeometry(0.5, 1, 4); // 4 radial segments makes elegant diamond pyramids
          const coneMat = new THREE.MeshStandardMaterial({
            color: 0xef4444,
            emissive: 0x4a1111,
            roughness: 0.1,
            metalness: 0.9,
          });
          const cone = new THREE.Mesh(coneGeo, coneMat);
          cone.rotation.y = Math.PI / 4; // rotate to face player nicely
          
          // spacing across horizontal
          const subOffset = spikesNum > 1 ? (i - (spikesNum - 1) / 2) * 0.8 : 0;
          cone.position.set(subOffset, 0, 0);
          cone.castShadow = true;
          compoundMesh.add(cone);
        }

        mesh = compoundMesh;
        
        if (mesh) {
          // Check if ceiling spike (gravity level)
          if (obs.y > 3) {
            mesh.rotation.z = Math.PI; // point downwards!
            mesh.position.set(obs.x + obs.width / 2, obs.y + 0.5, 0); // align under ceiling block
          } else {
            mesh.position.set(obs.x + obs.width / 2, obs.y + 0.5, 0); // base rests on ground/block (y bounds center)
          }
        }
      } 
      else if (obs.type === 'BLOCK') {
        const blockGeo = new THREE.BoxGeometry(obs.width, obs.height, obs.depth);
        const blockMat = new THREE.MeshStandardMaterial({
          color: 0x1f2937,
          roughness: 0.4,
          metalness: 0.7,
        });
        const edgeOffsetGeo = new THREE.BoxGeometry(obs.width + 0.02, obs.height + 0.02, obs.depth + 0.02);
        const edgeOffsetMat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(level.color),
          wireframe: true,
          transparent: true,
          opacity: 0.45,
        });

        mesh = new THREE.Mesh(blockGeo, blockMat);
        const edges = new THREE.Mesh(edgeOffsetGeo, edgeOffsetMat);
        mesh.add(edges);
        
        mesh.position.set(obs.x + obs.width / 2, obs.y + obs.height / 2, 0);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
      } 
      else if (obs.type === 'ORB_YELLOW') {
        // Orb: Glowing orb inside visual ring
        const orbGroup = new THREE.Group() as any;

        const sphereGeo = new THREE.SphereGeometry(0.35, 16, 16);
        const sphereMat = new THREE.MeshBasicMaterial({ color: 0xeab308 });
        const sphere = new THREE.Mesh(sphereGeo, sphereMat);
        orbGroup.add(sphere);

        const ringGeo = new THREE.TorusGeometry(0.55, 0.06, 8, 32);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.7 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        orbGroup.add(ring);

        // Sub light
        const orbLight = new THREE.PointLight(0xeab308, 1.5, 5);
        orbLight.position.set(0, 0, 0);
        orbGroup.add(orbLight);

        mesh = orbGroup;
        if (mesh) {
          mesh.position.set(obs.x + 0.5, obs.y + 0.5, 0);
          orbVisuals.push(mesh);
        }
      } 
      else if (obs.type === 'PAD_YELLOW') {
        // Pad: Small neon bumper resting flat on floors
        const padGeo = new THREE.BoxGeometry(0.9, 0.2, 0.9);
        const padMat = new THREE.MeshBasicMaterial({ color: 0xeab308 });
        mesh = new THREE.Mesh(padGeo, padMat);
        
        const padGlowGeo = new THREE.BoxGeometry(0.95, 0.08, 0.95);
        const padGlowMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
        const glow = new THREE.Mesh(padGlowGeo, padGlowMat);
        glow.position.y = 0.08;
        mesh.add(glow);

        mesh.position.set(obs.x + 0.5, obs.y + 0.1, 0);
      } 
      else if (obs.type === 'PORTAL_GRAVITY_UP' || obs.type === 'PORTAL_GRAVITY_DOWN') {
        const portalColor = obs.type === 'PORTAL_GRAVITY_UP' ? 0xf59e0b : 0x3b82f6; // Up is orange, down is blue
        
        const portalGroup = new THREE.Group() as any;

        // Arch mesh representation
        const archGeo = new THREE.TorusGeometry(1.5, 0.15, 8, 32, Math.PI); // Half arch
        const archMat = new THREE.MeshStandardMaterial({
          color: portalColor,
          emissive: portalColor,
          roughness: 0.1,
          metalness: 0.8,
        });
        const arch1 = new THREE.Mesh(archGeo, archMat);
        arch1.rotation.z = Math.PI / 2; // vertical loop
        portalGroup.add(arch1);

        const arch2 = new THREE.Mesh(archGeo, archMat);
        arch2.rotation.z = -Math.PI / 2; // complement side
        portalGroup.add(arch2);

        // Core light beam inside portal
        const beamGeo = new THREE.CylinderGeometry(0.6, 0.6, 2.9, 16, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({
          color: portalColor,
          transparent: true,
          opacity: 0.35,
          side: THREE.DoubleSide,
          wireframe: true,
        });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.rotation.z = Math.PI / 2;
        portalGroup.add(beam);

        mesh = portalGroup;
        if (mesh) {
          mesh.position.set(obs.x + 0.5, obs.y + 2, 0); // centers at y height
          mesh.rotation.y = Math.PI / 2; // align perpendicular to player path
        }
      }
      else if (obs.type === 'PORTAL_SPEED_1X' || obs.type === 'PORTAL_SPEED_2X') {
        const portalColor = obs.type === 'PORTAL_SPEED_1X' ? 0x06b6d4 : 0x10b981; // 1X is cyan, 2X is bright green
        const portalGroup = new THREE.Group() as any;

        // Arch mesh representation (Slightly tilted for dynamic motion feel)
        const archGeo = new THREE.TorusGeometry(1.4, 0.12, 8, 32, Math.PI); 
        const archMat = new THREE.MeshStandardMaterial({
          color: portalColor,
          emissive: portalColor,
          roughness: 0.1,
          metalness: 0.8,
        });
        const arch1 = new THREE.Mesh(archGeo, archMat);
        arch1.rotation.z = Math.PI / 2; // vertical loop
        portalGroup.add(arch1);

        const arch2 = new THREE.Mesh(archGeo, archMat);
        arch2.rotation.z = -Math.PI / 2; 
        portalGroup.add(arch2);

        // Core dynamic cylinder
        const beamGeo = new THREE.CylinderGeometry(0.5, 0.5, 2.7, 16, 1, true);
        const beamMat = new THREE.MeshBasicMaterial({
          color: portalColor,
          transparent: true,
          opacity: 0.45,
          side: THREE.DoubleSide,
          wireframe: true,
        });
        const beam = new THREE.Mesh(beamGeo, beamMat);
        beam.rotation.z = Math.PI / 2;
        portalGroup.add(beam);

        // Speed arrows inside pointing forward (relative to track, arrow points along track)
        const arrowGeo = new THREE.ConeGeometry(0.2, 0.4, 4);
        const arrowMat = new THREE.MeshBasicMaterial({ color: portalColor, transparent: true, opacity: 0.85 });
        
        const arrow1 = new THREE.Mesh(arrowGeo, arrowMat);
        arrow1.position.set(0.3, 0.4, 0);
        arrow1.rotation.z = -Math.PI / 2; // point forward
        portalGroup.add(arrow1);

        const arrow2 = new THREE.Mesh(arrowGeo, arrowMat);
        arrow2.position.set(-0.3, -0.4, 0);
        arrow2.rotation.z = -Math.PI / 2; // point forward
        portalGroup.add(arrow2);

        if (obs.type === 'PORTAL_SPEED_2X') {
          const arrow3 = new THREE.Mesh(arrowGeo, arrowMat);
          arrow3.position.set(0, 0, 0);
          arrow3.rotation.z = -Math.PI / 2; // point forward
          portalGroup.add(arrow3);
        }

        mesh = portalGroup;
        if (mesh) {
          mesh.position.set(obs.x + 0.5, obs.y + 2, 0); // centers at y height
          mesh.rotation.y = Math.PI / 2; // align perpendicular to player path
        }
      } 
      else if (obs.type === 'STAR') {
        // Star: Spinning 3D gold jewel
        const starGroup = new THREE.Group() as any;
        const geom = new THREE.OctahedronGeometry(0.4, 0); // gold diamond shape
        const mat = new THREE.MeshStandardMaterial({
          color: 0xfacc15,
          emissive: 0x78350f,
          roughness: 0.05,
          metalness: 0.95,
        });
        const diamond = new THREE.Mesh(geom, mat);
        starGroup.add(diamond);

        const glowRingGeo = new THREE.TorusGeometry(0.5, 0.04, 4, 16);
        const glowRingMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.6 });
        const ring = new THREE.Mesh(glowRingGeo, glowRingMat);
        starGroup.add(ring);

        mesh = starGroup;
        if (mesh) {
          mesh.position.set(obs.x + 0.5, obs.y + 0.5, 0);
          starVisuals.push({ mesh, id: obs.id });
        }
      }
      else if (obs.type === 'POWERUP_DOUBLE_JUMP') {
        const djGroup = new THREE.Group() as any;
        
        // Inner diamond crystal (glowing clean emerald green)
        const gemGeom = new THREE.OctahedronGeometry(0.38, 0);
        const gemMat = new THREE.MeshStandardMaterial({
          color: 0x00ff95,
          emissive: 0x003311,
          roughness: 0.1,
          metalness: 0.9,
        });
        const diamond = new THREE.Mesh(gemGeom, gemMat);
        djGroup.add(diamond);

        // Nested spinning outer toruses
        const ringGeo1 = new THREE.TorusGeometry(0.52, 0.05, 4, 18);
        const ringMat1 = new THREE.MeshBasicMaterial({ color: 0x00ff95, transparent: true, opacity: 0.55 });
        const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
        ring1.rotation.y = Math.PI / 4;
        djGroup.add(ring1);

        const ringGeo2 = new THREE.TorusGeometry(0.32, 0.04, 4, 18);
        const ringMat2 = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
        const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
        ring2.rotation.y = -Math.PI / 4;
        djGroup.add(ring2);

        mesh = djGroup;
        if (mesh) {
          mesh.position.set(obs.x + 0.5, obs.y + 0.5, 0);
          starVisuals.push({ mesh, id: obs.id });
        }
      }
      else if (obs.type === 'POWERUP_SPEED_BOOST') {
        const sbGroup = new THREE.Group() as any;
        
        // Two horizontal glowing bright neon-gold cones pointing right (+X)
        const arrowGeom = new THREE.ConeGeometry(0.22, 0.5, 4);
        arrowGeom.rotateZ(-Math.PI / 2); // Point right
        
        const arrowMat = new THREE.MeshStandardMaterial({
          color: 0xffa500, // vibrant orange
          emissive: 0x441100,
          roughness: 0.1,
          metalness: 0.8,
        });

        const arrow1 = new THREE.Mesh(arrowGeom, arrowMat);
        arrow1.position.x = -0.15;
        sbGroup.add(arrow1);

        const arrow2 = new THREE.Mesh(arrowGeom, arrowMat);
        arrow2.position.x = 0.2;
        sbGroup.add(arrow2);

        // Glowing horizontal ring surrounding the speed arrows
        const ringGeo = new THREE.TorusGeometry(0.48, 0.04, 4, 16);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.65 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2; // flat horizontal
        sbGroup.add(ring);

        mesh = sbGroup;
        if (mesh) {
          mesh.position.set(obs.x + 0.5, obs.y + 0.5, 0);
          starVisuals.push({ mesh, id: obs.id });
        }
      }

      if (mesh) {
        obstaclesGroup.add(mesh);
        // Map ID references to dynamic update positions
        obstacleGeometries[obs.id] = mesh;
      }
    });

    // 6. Particle Trail System
    const particlePoolSize = 100;
    const particlesArr: THREE.Mesh[] = [];
    const pMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(skinRef.current.glowColor),
      transparent: true,
    });
    
    // Tiny boxes
    const pGeo = new THREE.BoxGeometry(0.12, 0.12, 0.12);
    for (let i = 0; i < particlePoolSize; i++) {
      const pMesh = new THREE.Mesh(pGeo, pMat.clone());
      pMesh.visible = false;
      scene.add(pMesh);
      particlesArr.push(pMesh);
    }
    let pPoolIdx = 0;

    const spawnParticle = (x: number, y: number, z: number, vx: number, vy: number, colorOverride?: string | number) => {
      const p = particlesArr[pPoolIdx];
      p.position.set(x, y, z);
      (p as any).vx = vx;
      (p as any).vy = vy;
      (p as any).life = 1.0; // decay
      (p as any).maxLife = 1.0;
      
      // Sync color with player trail or use override
      if (colorOverride !== undefined) {
        (p.material as THREE.MeshBasicMaterial).color.set(colorOverride);
      } else {
        (p.material as THREE.MeshBasicMaterial).color.set(skinRef.current.glowColor);
      }
      p.visible = true;
      
      pPoolIdx = (pPoolIdx + 1) % particlePoolSize;
    };

    // Practice flags manager (render diamonds where checkpoints exist)
    const updateCheckpointsVisuals = () => {
      // Clear flag meshes that don't belong to any checkpoint anymore
      const currentCps = practiceCheckpointsRef.current;
      const cpIds = new Set(currentCps.map(c => c.id));
      
      Object.keys(flagMeshesRef.current).forEach(id => {
        if (!cpIds.has(id)) {
          scene.remove(flagMeshesRef.current[id]);
          delete flagMeshesRef.current[id];
        }
      });

      // Add missing checkpoint diamonds
      currentCps.forEach(cp => {
        if (!flagMeshesRef.current[cp.id]) {
          const gemGeo = new THREE.OctahedronGeometry(0.4, 0);
          const gemMat = new THREE.MeshBasicMaterial({
            color: 0x22c55e, // Practice Green color
            wireframe: true,
          });
          const gem = new THREE.Mesh(gemGeo, gemMat);
          gem.position.set(cp.x, cp.y, 0);
          scene.add(gem);
          flagMeshesRef.current[cp.id] = gem;
        }
      });
    };

    // 7. Core Clock Physics Loop
    let lastTime = performance.now();
    let frameId = 0;

    const gameLoop = (currentTime: number) => {
      frameId = requestAnimationFrame(gameLoop);

      // Delta calculator (caps to avoid jumps if browser lags)
      let dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;
      if (dt > 0.1) dt = 0.1;

      const stateVal = gameStateRef.current;

      // Restore player cube visibility when the run resets or is not currently crashed
      if (stateVal !== 'CRASHED') {
        playerMesh.visible = true;
      }

      // Handle Skin Updates on-demand
      if (triggerSkinUpdateRef.current) {
        triggerSkinUpdateRef.current = false;
        faceTex = generatePlayerFaceTexture(skinRef.current);
        const dynamicSideMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(skinRef.current.primaryColor),
          roughness: 0.3,
          metalness: 0.4,
        });
        const dynamicFrontMat = new THREE.MeshStandardMaterial({
          map: faceTex,
          roughness: 0.2,
          metalness: 0.3,
        });
        
        playerMesh.material = [
          dynamicSideMat, // right
          dynamicSideMat, // left
          dynamicSideMat, // top
          dynamicSideMat, // bottom
          dynamicFrontMat, // front
          dynamicSideMat, // back
        ];

        playerOutline.material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(skinRef.current.glowColor),
          wireframe: true,
          transparent: true,
          opacity: 0.7,
        });
      }

      // Sync practice flags visually
      if (isPracticeModeRef.current) {
        updateCheckpointsVisuals();
      } else {
        // Clear all practice flags if practice mode turned off
        Object.keys(flagMeshesRef.current).forEach(id => {
          scene.remove(flagMeshesRef.current[id]);
          delete flagMeshesRef.current[id];
        });
      }

      // Snappy, snappy rhythmic math synchronized to level BPM
      const bSec = 60 / level.bpm;
      const bTime = (currentTime / 1000) / bSec;
      const rhythmFactor = Math.pow(1 - (bTime % 1), 2.5); // high peak that decays exponentially

      // Pulse lights & outlines in sync with BPM
      ambientLight.intensity = 0.35 + rhythmFactor * 0.45;
      pointLight.intensity = 2.0 + rhythmFactor * 6.5;
      pointLight.color.set(level.color);
      
      // Expand target outline scale on beat pulsation
      playerOutline.scale.setScalar(1.0 + rhythmFactor * 0.08);

      // Animate background Cyber EQ Towers
      eqTowers.forEach((tower, i) => {
        const phase = (currentTime / 800) + i * 0.35;
        const heightScale = 0.15 + (Math.sin(phase) * 0.3 + 0.5) * (0.35 + rhythmFactor * 0.65);
        tower.scale.y = heightScale;
        tower.position.y = -6.5 + (12 * heightScale) / 2;
        
        // Glow accentuation
        const towerMaterial = tower.material as THREE.MeshStandardMaterial;
        towerMaterial.emissive.set(level.color).multiplyScalar(0.06 + rhythmFactor * 0.22);
      });

      // Animate giant rotating background nebula Core
      coreMesh.rotation.y += dt * 0.12;
      coreMesh.rotation.x += dt * 0.06;
      coreMesh.position.x = (trackLength / 2) + Math.sin(currentTime / 4000) * 12;
      coreMat.color.set(level.color);
      coreMat.opacity = 0.12 + rhythmFactor * 0.20;
      coreMesh.scale.setScalar(1.0 + rhythmFactor * 0.08);

      // Animate crash shattered debris fragments
      debrisMeshes.forEach(d => {
        d.mesh.position.x += d.vx * dt;
        d.mesh.position.y += d.vy * dt;
        d.mesh.position.z += d.vz * dt;
        
        // gravity on shard fragments
        d.vy -= 26 * dt;
        
        d.mesh.rotation.x += d.rotX * dt;
        d.mesh.rotation.y += d.rotY * dt;
        
        // Shrink shard factor
        const sc = d.mesh.scale.x;
        if (sc > 0.05) {
          d.mesh.scale.setScalar(sc - dt * 0.8);
        } else {
          d.mesh.visible = false;
        }
      });

      // Rotate gems and orbs in background
      orbVisuals.forEach(mesh => {
        // ring revolve
        mesh.children[1].rotation.z += 0.02;
        mesh.children[0].rotation.y += 0.01;
      });

      starVisuals.forEach(item => {
        if (item.mesh && item.mesh.children && item.mesh.children.length > 0) {
          // rotate diamond or arrow
          item.mesh.children[0].rotation.y += 0.02;
          
          if (item.mesh.children[1]) {
            item.mesh.children[1].rotation.z += 0.035;
          }
          if (item.mesh.children[2]) {
            item.mesh.children[2].rotation.z += 0.05;
          }
        }

        // Hide star if collected in this run
        if (collectedStarIdsRef.current.has(item.id)) {
          item.mesh.visible = false;
        } else {
          item.mesh.visible = true;
        }
      });

      // Animate flag gems
      Object.values(flagMeshesRef.current).forEach((gem: any) => {
        gem.rotation.y += 0.03;
      });

      // Update particle animations
      particlesArr.forEach(p => {
        if (p.visible) {
          const l = p as any;
          l.life -= dt * 2.5;
          if (l.life <= 0) {
            p.visible = false;
          } else {
            p.position.x += l.vx * dt;
            p.position.y += l.vy * dt;
            // scale down
            p.scale.set(l.life, l.life, l.life);
            (p.material as THREE.MeshBasicMaterial).opacity = l.life;
          }
        }
      });

      if (stateVal === 'PLAYING') {
        // Handle speed boost countdown
        let tempSpeedMultiplier = 1.0;
        if (playerState.current.speedBoostTimeLeft > 0) {
          playerState.current.speedBoostTimeLeft -= dt;
          if (playerState.current.speedBoostTimeLeft < 0) {
            playerState.current.speedBoostTimeLeft = 0;
          }
          tempSpeedMultiplier = 1.55; // 55% velocity boost!
        }

        const baseSpeedMultiplier = playerState.current.speedMultiplier || 1.0;
        const totalSpeedMultiplier = baseSpeedMultiplier * tempSpeedMultiplier;

        // ADVANCE runner along X coordinate
        const currentSpeed = level.speed * totalSpeedMultiplier;
        playerState.current.x += currentSpeed * dt;

        // Autopilot AI sensor scanning logic
        if (isAutopilotEnabledRef.current && (playerState.current.onGround || playerState.current.y <= 0.1 || playerState.current.y >= 4.9)) {
          const px = playerState.current.x;
          // Search for upcoming spikes or blocks
          const upcomingObstacle = level.obstacles.find(obs => {
            if (obs.x <= px) return false;
            
            const isHazard = obs.type === 'SPIKE' || 
                             obs.type === 'DOUBLE_SPIKE' || 
                             obs.type === 'TRIPLE_SPIKE' || 
                             obs.type === 'BLOCK';
                             
            if (!isHazard) return false;
            
            // Check if the obstacle sits on the player's current gravity plane
            if (!playerState.current.gravityUp && obs.y < 2.0) {
              return true;
            }
            if (playerState.current.gravityUp && obs.y > 2.5) {
              return true;
            }
            return false;
          });

          if (upcomingObstacle) {
            const dx = upcomingObstacle.x - px;
            // Perfect jump window distance based on player's instant speed
            const minS = currentSpeed * 0.24;
            const maxS = currentSpeed * 0.33;
            if (dx >= minS && dx <= maxS) {
              jumpRequestedRef.current = true;
            }
          }
        }

        // Gravity parameters
        // Normal floor: y downwards. Reversed gravity (PORTAL): y upwards!
        const gravityDir = playerState.current.gravityUp ? 1 : -1;
        const gAcc = 39 * gravityDir; // vertical pull (39 units/s2)

        playerState.current.vy += gAcc * dt;
        playerState.current.y += playerState.current.vy * dt;

        // Default constraints (floor limit y=0, ceiling limit y=6)
        let playerOnGround = false;
        const ceilingYBound = 5.0; // limit height
        
        if (!playerState.current.gravityUp) {
          if (playerState.current.y <= 0) {
            playerState.current.y = 0;
            playerState.current.vy = 0;
            playerOnGround = true;
          }
        } else {
          if (playerState.current.y >= ceilingYBound) {
            playerState.current.y = ceilingYBound;
            playerState.current.vy = 0;
            playerOnGround = true;
          }
        }

        // --- KEYBOARD PRACTICE SHORTCUT TRIGGERS inside simulator loop ---
        if (zPressedRef.current) {
          zPressedRef.current = false;
          if (isPracticeModeRef.current) {
            const currentPosition = playerState.current;
            const newCp: Checkpoint = {
              id: `cp-${performance.now()}-${currentPosition.x.toFixed(1)}`,
              x: currentPosition.x,
              y: currentPosition.y,
              vy: currentPosition.vy,
              gravityUp: currentPosition.gravityUp,
              attemptTime: Date.now(),
            };
            practiceCheckpointsRef.current.push(newCp);
            GameAudio.playCheckpoint();
          }
        }

        if (xPressedRef.current) {
          xPressedRef.current = false;
          if (isPracticeModeRef.current && practiceCheckpointsRef.current.length > 0) {
            practiceCheckpointsRef.current.pop();
            GameAudio.playCheckpoint();
          }
        }

        // --- COLLISION DETECTION & TACTILE PHYSICS ---
        const px = playerState.current.x;
        const py = playerState.current.y;
        const playerRadius = 0.5;

        // Temporary tracking bounds
        let landedOnBlock = false;

        // Scan level obstacles for collisions
        level.obstacles.forEach((obs) => {
          // Skip check if star is already collected
          if (obs.type === 'STAR' && collectedStarIdsRef.current.has(obs.id)) return;

          // Simple 2D rectangular AABB checks along route direction
          let finalOxLeft = obs.x;
          let finalOxRight = obs.x + obs.width;
          let finalOyBottom = obs.y;
          let finalOyTop = obs.y + obs.height;

          // Fair hitbox shrinking for high-polished, professional precision of SPIKES
          if (obs.type === 'SPIKE' || obs.type === 'DOUBLE_SPIKE' || obs.type === 'TRIPLE_SPIKE') {
            const shrinkX = obs.width * 0.20; // 20% shrink on sides
            finalOxLeft = obs.x + shrinkX;
            finalOxRight = obs.x + obs.width - shrinkX;
            
            const isCeilingSpike = obs.y > 2.5; // typically suspended ceiling spikes
            if (isCeilingSpike) {
              finalOyBottom = obs.y + obs.height * 0.20; // ignore tip extending down
            } else {
              finalOyTop = obs.y + obs.height - obs.height * 0.20; // ignore ground spike peak
            }
          }

          // Player bounding box (center px, py. cube size 1x1 leads to boundary edges [px-0.5, px+0.5], [py-0.5, py+0.5])
          const pLeft = px - 0.5;
          const pRight = px + 0.5;
          const pBottom = py - 0.5;
          const pTop = py + 0.5;

          const isOverlapping = 
            pRight > finalOxLeft && 
            pLeft < finalOxRight && 
            pTop > finalOyBottom && 
            pBottom < finalOyTop;

          if (isOverlapping) {
            if (obs.type === 'SPIKE' || obs.type === 'DOUBLE_SPIKE' || obs.type === 'TRIPLE_SPIKE') {
              // Direct Spike collision triggers immediate crash!
              gameStateRef.current = 'CRASHED';
              GameAudio.playCrash();
              const percent = Math.min(Math.floor((px / level.length) * 100), 99);
              onCrash(percent);
            } 
            else if (obs.type === 'BLOCK') {
              // Standard Block landing or sideways collision check
              // To handle landing versus side crashing, let's look at the previous frame's height
              const prevY = py - playerState.current.vy * dt;
              const prevYBottom = prevY - 0.5;
              const prevYTop = prevY + 0.5;

              if (!playerState.current.gravityUp) {
                // Falling standard down: land on top of the block
                // Hard requirement: must land on top of the box. Hitting the front/side from ground level results in death.
                const verticalPerfectMatch = prevYBottom >= finalOyTop - 0.08 && playerState.current.vy <= 0.5;

                if (verticalPerfectMatch) {
                  playerState.current.y = finalOyTop + 0.5;
                  playerState.current.vy = 0;
                  playerOnGround = true;
                  landedOnBlock = true;
                } else {
                  // Hit side/bottom of block -> CRASH!
                  gameStateRef.current = 'CRASHED';
                  GameAudio.playCrash();
                  const percent = Math.min(Math.floor((px / level.length) * 100), 99);
                  onCrash(percent);
                }
              } else {
                // Falling up (anti-gravity): land on bottom ceiling face of high block
                // Hard requirement for gravity-flipped boxes
                const verticalPerfectMatch = prevYTop <= finalOyBottom + 0.08 && playerState.current.vy >= -0.5;

                if (verticalPerfectMatch) {
                  playerState.current.y = finalOyBottom - 0.5;
                  playerState.current.vy = 0;
                  playerOnGround = true;
                  landedOnBlock = true;
                } else {
                  // Hit side block -> CRASH!
                  gameStateRef.current = 'CRASHED';
                  GameAudio.playCrash();
                  const percent = Math.min(Math.floor((px / level.length) * 100), 99);
                  onCrash(percent);
                }
              }
            } 
            else if (obs.type === 'ORB_YELLOW') {
              // Yellow dynamic ORB: jump mid-air when JUMP is pressed while inside radius
              if (isAutopilotEnabledRef.current) {
                jumpRequestedRef.current = true;
              }
              if (jumpRequestedRef.current) {
                jumpRequestedRef.current = false; // consume press
                // Trigger major upward boost (or downward if reversed gravity)
                playerState.current.vy = playerState.current.gravityUp ? -13 : 13;
                GameAudio.playOrb();
                screenShakeRef.current = 0.75; // Air stomp shake!
                
                // Spawn beautiful orbital flash ripples
                for (let i = 0; i < 15; i++) {
                  const theta = Math.random() * Math.PI * 2;
                  spawnParticle(
                    obs.x + 0.5, 
                    obs.y + 0.5, 
                    0, 
                    Math.cos(theta) * 8 + currentSpeed, 
                    Math.sin(theta) * 8
                  );
                }
              }
            } 
            else if (obs.type === 'PAD_YELLOW') {
              // Yellow bounce PAD: launch high instantly without pressing jump!
              playerState.current.vy = playerState.current.gravityUp ? -19 : 19;
              GameAudio.playPad();
              screenShakeRef.current = 1.15; // Major bounce impact!
              
              // Pad particles
              for (let i = 0; i < 8; i++) {
                spawnParticle(obs.x + 0.5, obs.y + 0.2, 0, (Math.random() - 0.5) * 4, (playerState.current.gravityUp ? -1 : 1) * (10 + Math.random() * 5));
              }
            } 
            else if (obs.type === 'PORTAL_GRAVITY_UP') {
              // Flip gravity upwards if player not already flipped
              if (!playerState.current.gravityUp) {
                playerState.current.gravityUp = true;
                playerState.current.vy = 2; // slight nudge
                // play high-speed whoosh sound
                GameAudio.playPad();
                
                // Glow flashes
                for (let i = 0; i < 10; i++) {
                  spawnParticle(px, py, 0, (Math.random() - 0.5) * 5, Math.random() * 6);
                }
              }
            } 
            else if (obs.type === 'PORTAL_GRAVITY_DOWN') {
              // Restore normal gravity downwards
              if (playerState.current.gravityUp) {
                playerState.current.gravityUp = false;
                playerState.current.vy = -2;
                GameAudio.playPad();
                
                for (let i = 0; i < 10; i++) {
                  spawnParticle(px, py, 0, (Math.random() - 0.5) * 5, -Math.random() * 6);
                }
              }
            } 
            else if (obs.type === 'PORTAL_SPEED_1X') {
              if (playerState.current.speedMultiplier !== 1.0) {
                playerState.current.speedMultiplier = 1.0;
                GameAudio.playPad();
                showGestureFeedback("SPEED: 1.0X 💨", "#06b6d4");
                for (let i = 0; i < 12; i++) {
                  spawnParticle(px, py, 0, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, '#06b6d4');
                }
              }
            }
            else if (obs.type === 'PORTAL_SPEED_2X') {
              if (playerState.current.speedMultiplier !== 2.0) {
                playerState.current.speedMultiplier = 2.0;
                GameAudio.playPad();
                showGestureFeedback("SPEED: 2.0X ⚡", "#10b981");
                for (let i = 0; i < 15; i++) {
                  spawnParticle(px, py, 0, (Math.random() - 0.5) * 8, (Math.random() - 0.5) * 8, '#10b981');
                }
              }
            } 
            else if (obs.type === 'STAR') {
              // Collect star
              collectedStarIdsRef.current.add(obs.id);
              playerState.current.starsCollected++;
              GameAudio.playCollectStar();
              screenShakeRef.current = 0.4; // shimmer strike
              
              // Collect flash particles
              for (let i = 0; i < 6; i++) {
                spawnParticle(obs.x + 0.5, obs.y + 0.5, 0, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
              }

              // Update stats inside parent state
              onStatsUpdate({ jumps: playerState.current.jumps, stars: 1 });
            }
            else if (obs.type === 'POWERUP_DOUBLE_JUMP') {
              if (!collectedStarIdsRef.current.has(obs.id)) {
                collectedStarIdsRef.current.add(obs.id);
                playerState.current.doubleJumpsLeft = 2; // grant 2 mid-air jump charges
                GameAudio.playDoubleJumpCollect();
                screenShakeRef.current = 0.5;

                // Burst of green stars
                for (let i = 0; i < 15; i++) {
                  spawnParticle(
                    obs.x + 0.5,
                    obs.y + 0.5,
                    0,
                    (Math.random() - 0.5) * 6,
                    (Math.random() - 0.5) * 6,
                    '#00ff95'
                  );
                }
              }
            }
            else if (obs.type === 'POWERUP_SPEED_BOOST') {
              if (!collectedStarIdsRef.current.has(obs.id)) {
                collectedStarIdsRef.current.add(obs.id);
                playerState.current.speedBoostTimeLeft = 4.0; // 4.0 seconds of speed boost
                GameAudio.playSpeedBoostCollect();
                screenShakeRef.current = 0.8; // major vehicle boost shake

                // Rocket ignite particle burst (neon orange/yellow flames)
                for (let i = 0; i < 20; i++) {
                  spawnParticle(
                    obs.x + 0.5,
                    obs.y + 0.5,
                    0,
                    (Math.random() - 0.5) * 8,
                    (Math.random() - 0.5) * 8,
                    '#ffa500'
                  );
                }
              }
            }
          }
        });

        playerState.current.onGround = playerOnGround || landedOnBlock;

        // --- HANDLE JUMP COMMMANDS ---
        const canGroundJump = playerState.current.onGround && (isJumpKeyHeldRef.current || jumpRequestedRef.current);
        const canDoubleJump = !playerState.current.onGround && playerState.current.doubleJumpsLeft > 0 && jumpRequestedRef.current;

        if (canGroundJump) {
          jumpRequestedRef.current = false; // clear any pending tap request
          
          playerState.current.vy = playerState.current.gravityUp ? -14.2 : 14.2;
          playerState.current.onGround = false;
          playerState.current.jumps++;
          GameAudio.playJump();
          screenShakeRef.current = 0.45; // Jump kick shake

          onStatsUpdate({ jumps: 1, stars: 0 });

          // Visual expanding ripple on jump
          for (let i = 0; i < 6; i++) {
            spawnParticle(
              px, 
              py - (playerState.current.gravityUp ? -0.5 : 0.5), 
              0, 
              -currentSpeed * 0.4 + (Math.random() - 0.5) * 3, 
              (playerState.current.gravityUp ? 1 : -1) * (2 + Math.random() * 2),
              playerState.current.doubleJumpsLeft > 0 ? '#00ff95' : undefined
            );
          }
        } else if (canDoubleJump) {
          // Mid-air double jump!
          jumpRequestedRef.current = false; // consume
          
          playerState.current.doubleJumpsLeft--;
          playerState.current.vy = playerState.current.gravityUp ? -13.5 : 13.5;
          playerState.current.onGround = false;
          playerState.current.jumps++;
          GameAudio.playDoubleJumpUse();
          screenShakeRef.current = 0.65; // Major mid-air pop shake

          onStatsUpdate({ jumps: 1, stars: 0 });

          // Magical shockwave emerald green trails mid-air!
          for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            spawnParticle(
              px,
              py,
              0,
              Math.cos(angle) * 7.5 - currentSpeed * 0.3,
              Math.sin(angle) * 7.5,
              '#00ff95' // Emerald green pulse
            );
          }
        }

        // --- ANIMATE ROTATIONS & CUBE ACTIONS ---
        if (playerState.current.onGround) {
          // Snap coordinate angle back to nearest 90-degree quadrant when sliding on ground
          const targetAngle = playerState.current.gravityUp ? Math.PI : 0;
          // Slowly align face forwards
          playerState.current.rollAngle = THREE.MathUtils.lerp(playerState.current.rollAngle, targetAngle, 0.22);
          
          // Spawn continuous ground/slide debris trail particles behind player cube
          if (Math.random() < 0.45) {
            const pHeightOffset = playerState.current.gravityUp ? 0.5 : -0.5;
            const trailColor = playerState.current.speedBoostTimeLeft > 0 
              ? '#ffa500' 
              : (playerState.current.doubleJumpsLeft > 0 ? '#00ff95' : undefined);

            spawnParticle(
              px - 0.5, 
              py + pHeightOffset, 
              (Math.random() - 0.5) * 0.4, 
              -currentSpeed * 0.5 + (Math.random() - 1) * 2, 
              (playerState.current.gravityUp ? -1 : 1) * (1 + Math.random() * 2),
              trailColor
            );
          }
        } else {
          // Spin the cube gracefully while airborne! Rotates 360 degrees per second
          const spinSpeed = playerState.current.gravityUp ? 6.5 : -6.5;
          playerState.current.rollAngle += spinSpeed * dt;
        }

        // Spawn continuous aerodynamic fiery exhaust trails if Speed Boost is active
        if (playerState.current.speedBoostTimeLeft > 0) {
          if (Math.random() < 0.6) {
            spawnParticle(
              px - 0.45,
              py + (Math.random() - 0.5) * 0.4,
              (Math.random() - 0.5) * 0.4,
              -currentSpeed * 0.5 + (Math.random() - 0.5) * 3,
              (Math.random() - 0.5) * 2,
              '#ffa500' // Gold Orange flames
            );
          }
          if (Math.random() < 0.35) {
            spawnParticle(
              px - 0.45,
              py + (Math.random() - 0.5) * 0.4,
              (Math.random() - 0.5) * 0.4,
              -currentSpeed * 0.5 + (Math.random() - 0.5) * 2,
              (Math.random() - 0.5) * 1.5,
              '#ffea00' // Yellow fire core
            );
          }
        }

        // Sync React HUD state if changed
        if (playerState.current.doubleJumpsLeft !== doubleJumpsUIStateRef.current) {
          doubleJumpsUIStateRef.current = playerState.current.doubleJumpsLeft;
          setDoubleJumpsUI(playerState.current.doubleJumpsLeft);
        }

        const roundedSpeedUI = Math.ceil(playerState.current.speedBoostTimeLeft * 10) / 10;
        if (roundedSpeedUI !== speedBoostUIStateRef.current) {
          speedBoostUIStateRef.current = roundedSpeedUI;
          setSpeedBoostUI(roundedSpeedUI);
        }

        // Apply physical coordinates simulation to the 3D meshes
        playerMesh.position.set(px, py, 0);
        playerMesh.rotation.z = playerState.current.rollAngle; // Roll rotation on runners' Z flat plane

        // Append historical positions for visceral motion blur afterimage trails
        if (stateVal === 'PLAYING') {
          trailPositions.unshift({
            x: px,
            y: py,
            rollAngle: playerState.current.rollAngle
          });
          if (trailPositions.length > 30) {
            trailPositions.pop();
          }
        } else {
          trailPositions.length = 0;
        }

        // Dynamically update ghost meshes for speed multipliers motion blur
        ghostMeshes.forEach((ghost, idx) => {
          const isSpeedBoosted = playerState.current.speedBoostTimeLeft > 0;
          if (isSpeedBoosted && stateVal === 'PLAYING' && trailPositions.length > (idx + 1) * 3) {
            const hist = trailPositions[(idx + 1) * 3];
            ghost.visible = true;
            ghost.position.set(hist.x, hist.y, 0);
            ghost.rotation.z = hist.rollAngle;
            
            // Scaled scaling and transparent additive opacity to make it look like a glowing high-speed streak
            const scaleFactor = 1.0 - (idx + 1) * 0.12;
            ghost.scale.set(scaleFactor, scaleFactor, scaleFactor);
            (ghost.material as THREE.MeshBasicMaterial).opacity = 0.48 * (1.0 - (idx + 1) * 0.28);
          } else {
            // Fade out when inactive
            const mat = (ghost.material as THREE.MeshBasicMaterial);
            if (ghost.visible) {
              if (mat.opacity > 0) {
                mat.opacity -= dt * 6;
                if (mat.opacity < 0) mat.opacity = 0;
              } else {
                ghost.visible = false;
              }
            }
          }
        });

        // Sync glowing accent point-light above runner to follow player x progress
        pointLight.position.set(px, py + 2, 2);

        // --- WIN TRIGGER CONDITIONS ---
        if (px >= level.length) {
          gameStateRef.current = 'WON';
          GameAudio.playWin();
          onWin();
        }
      } 
      else {
        // If state is CRASHED or PAUSED, hold player visual state, but allow background stars revolving
        if (stateVal === 'CRASHED' && !crashExplosionSpawnedRef.current) {
          crashExplosionSpawnedRef.current = true;
          playerMesh.visible = false; // shred the cube
          screenShakeRef.current = 2.4; // heavy camera tremor

          // Record death coordinate and reveal death marker flag!
          const dxVal = playerState.current.x;
          const dyVal = playerState.current.y;
          previousDeathRef.current = { x: dxVal, y: dyVal };
          deathMarkerGroup.position.set(dxVal, dyVal, 0);
          deathMarkerGroup.visible = true;
          
          const shardGeo = new THREE.BoxGeometry(0.24, 0.24, 0.24);
          const shardColors = [0xef4444, 0xeab308, 0x3b82f6, 0xa855f7, 0x10b981, 0xffffff];
          
          for (let i = 0; i < 45; i++) {
            const randomColor = shardColors[Math.floor(Math.random() * shardColors.length)];
            const shardMat = new THREE.MeshBasicMaterial({ color: randomColor });
            const shard = new THREE.Mesh(shardGeo, shardMat);
            shard.position.copy(playerMesh.position);
            
            const rAngle = Math.random() * Math.PI * 2;
            const rSpeed = 4.5 + Math.random() * 14.5;
            const vxVal = Math.cos(rAngle) * rSpeed;
            const vyVal = Math.sin(rAngle) * rSpeed + 2 + Math.random() * 4;
            const vzVal = (Math.random() - 0.5) * 8;
            
            debrisGroup.add(shard);
            debrisMeshes.push({
              mesh: shard,
              vx: vxVal,
              vy: vyVal,
              vz: vzVal,
              rotX: (Math.random() - 0.5) * 18,
              rotY: (Math.random() - 0.5) * 18
            });
          }
        }
      }

      // --- 3D CAMERA RESOLUTIONS & SHAKE ---
      const pX = playerState.current.x;
      const pY = playerState.current.y;

      // Continuous minor high-speed vibration shudder to make things feel visceral when speed multiplier is active
      const isSpeedBoosted = playerState.current.speedBoostTimeLeft > 0;
      if (isSpeedBoosted && stateVal === 'PLAYING') {
        screenShakeRef.current = Math.max(screenShakeRef.current, 0.16);
      }

      // Decay camera tremor effect
      screenShakeRef.current *= 0.90;
      if (screenShakeRef.current < 0.01) screenShakeRef.current = 0;
      
      const shakeX = (Math.random() - 0.5) * screenShakeRef.current;
      const shakeY = (Math.random() - 0.5) * screenShakeRef.current;
      const shakeZ = (Math.random() - 0.5) * screenShakeRef.current;

      if (cameraMode === 'CLASSIC_3D') {
        // Side-scrolling isometric 3D (camera trails behind/above slightly, maintains consistent profile side scrolling)
        camera.position.set(pX + 5 + shakeX, pY + 2.5 + shakeY, 12 + shakeZ);
        camera.lookAt(pX + 4, pY + 1.0, 0);
      } 
      else if (cameraMode === 'CHASE_3D') {
        // Close, thrilling over the shoulder chase racing camera!
        // Camera stays at x - 7 behind, slightly zoomed inside and above, looking forward on the block
        camera.position.set(pX - 5.5 + shakeX, pY + 2.22 + shakeY, 4.2 + shakeZ);
        camera.lookAt(pX + 6.0, pY - 0.2, -0.6);
      } 
      else if (cameraMode === 'TOP_DOWN') {
        // High diagonal birds-eye isometric view
        camera.position.set(pX + 2 + shakeX, pY + 13 + shakeY, 10 + shakeZ);
        camera.lookAt(pX + 4, pY, 0);
      }
      else if (cameraMode === 'BIRD_EYE_3D') {
        // High vertical Birds-Eye view tracing block path
        camera.position.set(pX + 1.5 + shakeX, pY + 14.5 + shakeY, 5.0 + shakeZ);
        camera.lookAt(pX + 2.5, pY, -0.5);
      }
      else if (cameraMode === 'ORTHO_2D') {
        // Pure perpendicular flat 2D projection feel (perfect side profile)
        camera.position.set(pX + 4.5 + shakeX, pY + 1.8 + shakeY, 12.5 + shakeZ);
        camera.lookAt(pX + 4.5, pY + 1.8, 0);
      }

      // Dynamic warp Field-Of-View stretch when accelerating, jumping high, or speed boosted!
      const currentVy = Math.abs(playerState.current.vy);
      const boostStretch = isSpeedBoosted ? 14 : 0; // Huge FOV warp when speed-boosted!
      const speedStretch = stateVal === 'PLAYING' ? ((currentVy > 8 ? (currentVy - 8) * 0.75 : 0) + boostStretch) : 0;
      const targetFov = cameraMode === 'CHASE_3D' ? 52 + speedStretch : 45 + speedStretch;
      camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, dt * 8);
      camera.updateProjectionMatrix();

      // Keep light centered on track horizontal
      dirLight.position.set(pX + 15, 30, 20);
      dirLight.shadow.camera.left = pX - 25;
      dirLight.shadow.camera.right = pX + 25;

      // Update high-polished animations on persistent death marker
      if (deathMarkerGroup.visible) {
        headMesh.rotation.y += dt * 1.5;
        headMesh.rotation.x += dt * 0.5;
        haloMesh.rotation.z += dt * 2.0;

        // Visual hover floating effect using sine wave on local time
        const floatingY = 2.5 + Math.sin(currentTime * 0.0035) * 0.15;
        headMesh.position.y = floatingY;
        haloMesh.position.y = floatingY;
        c1.position.y = floatingY;
        c2.position.y = floatingY;
      }

      renderer.render(scene, camera);
    };

    // Begin looping
    frameId = requestAnimationFrame(gameLoop);

    // Dynamic sizing with ResizeObserver to prevent visual breakages in iframe resizes (as mandated)
    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        const h = entry.contentRect.height;
        renderer.setSize(w, h);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      }
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(containerRef.current);

    // Cleanup WebGL viewport on unmount
    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      renderer.dispose();
      
      // Clean up geometry buffers
      floorGeo.dispose();
      floorMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      ceilingGeo.dispose();
      ceilingMat.dispose();
      pCubeGeo.dispose();
      sideMat.dispose();
      frontMat.dispose();
      pOutlineGeo.dispose();
      pOutlineMat.dispose();
      
      // Cyber aesthetic disposals
      towerGeo.dispose();
      towerMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
      eqTowers.forEach(t => (t.material as THREE.Material).dispose());
      ghostMaterial.dispose();

      // Death marker disposals
      poleGeo.dispose();
      poleMat.dispose();
      headGeo.dispose();
      headMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      crossGeo1.dispose();
      crossMat.dispose();
    };
  }, [level, cameraMode]); // rebuild full track mesh if active level changes

  // Trigger runs whenever level or manual reset demands
  useEffect(() => {
    resetRun();
  }, [level, gameState]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full relative overflow-hidden select-none cursor-pointer"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <canvas 
        ref={canvasRef} 
        id="geometry-dash-three-viewport"
        className="block w-full h-full object-cover select-none pointer-events-none transition-[filter] duration-300" 
        style={{
          filter: speedBoostUI > 0 ? 'url(#horizontal-motion-blur)' : 'none',
        }}
      />

      {/* Dynamic custom standard SVG motion blur definition targeting horizontal axis and zero height wrapper */}
      <svg xmlns="http://www.w3.org/2000/svg" className="absolute w-0 h-0 pointer-events-none" style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="horizontal-motion-blur">
            <feGaussianBlur stdDeviation="8,0" />
          </filter>
        </defs>
      </svg>

      {/* High-speed warp vignette and speed lines overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-300"
        style={{
          opacity: speedBoostUI > 0 ? 0.35 : 0,
          boxShadow: 'inset 0 0 120px rgba(255, 165, 0, 0.45)',
          background: 'radial-gradient(circle, transparent 40%, rgba(255, 165, 0, 0.1) 100%)',
        }}
      />

      {/* FLOATING ACTIVE STATE INDICATORS */}
      <div className="absolute top-20 left-4 flex flex-col gap-2 relative z-30 select-none">
        {doubleJumpsUI > 0 && (
          <div className="bg-black/85 border-2 border-[#00ff95] px-4 py-2 font-mono flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,149,0.35)] animate-bounce">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ff95] animate-ping" />
            <span className="text-[#00ff95] font-black text-xs uppercase tracking-widest flex items-center gap-1.5 label-double-jump">
              ⚡ DOUBLE JUMP: <span className="text-white text-sm font-black">{doubleJumpsUI}/2</span>
            </span>
          </div>
        )}

        {speedBoostUI > 0 && (
          <div className="bg-black/85 border-2 border-[#ffa500] px-4 py-2 font-mono flex items-center gap-2 shadow-[0_0_15px_rgba(255,165,0,0.35)] animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffa500] animate-ping" />
            <span className="text-[#ffa500] font-black text-xs uppercase tracking-widest flex items-center gap-1.5 label-speed-boost">
              🔥 SPEED BOOST: <span className="text-white text-sm font-black">{speedBoostUI}s</span>
            </span>
          </div>
        )}
      </div>

      {/* On-Screen Mobile Touch Gesture Indicator Toasts */}
      {gestureToast && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none select-none">
          <div 
            className="px-6 py-3 rounded-full border bg-black/95 backdrop-blur-md shadow-[0_0_25px_rgba(0,0,0,0.8)] flex items-center gap-2.5 animate-pulse text-[10px] font-black tracking-widest uppercase font-mono"
            style={{ 
              borderColor: gestureToast.color,
              boxShadow: `0 0 15px ${gestureToast.color}55`
            }}
          >
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: gestureToast.color }} />
            <span style={{ color: gestureToast.color }}>{gestureToast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
