// Initialisation du SDK Poki

/*  if (PokiSDK.playtestCaptureHtmlForce) {
  PokiSDK.playtestCaptureHtmlForce();
}

PokiSDK.init().then(() => {
    console.log("Poki SDK successfully initialized");
    // fire your function to continue to game
}).catch(() => {
    console.log("Initialized, something went wrong, load you game anyway");
    // fire your function to continue to game
});  */

// Déclaration de constantes 

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d', { alpha: true });
const hexagonContainer = document.getElementById('hexagon-container');

const TILE_SIZE = 35;
const SMALL_GRID_SIZE = 7;
const LARGE_GRID_SIZE = 19;
const SHOW_TILE_NUMBERS = false;

// Déclaration des sons
const victorySound = new Audio('victory.mp3');
const flipSound = new Audio('flip-sound.mp3');
let isFlipping = false;

let currentLevel = 0;
let remainingMoves;
let isLevelTransition = false;
let isTransitioning = false;
let rotationAngle = 0;
let initialState = [];
let flipCount = [];
let tiles = [];
let storedRandomLevel = null;
let cleanupCongratulationsMessage = null;
let hasFirstClick = false;
let openedFromHome = false;
let openedFromLevel = false;

// Déclarations de constantes pour le curseur d'indice
let showHints = false;
let lastAnimationTime = 0;
const BLINK_DURATION = 1000; // Durée complète d'un cycle en millisecondes
const MIN_OPACITY = 0.3;
const MAX_OPACITY = 0.8;

// Ajout de nouvelles constantes pour les indices
const NORMAL_BLINK_DURATION = 1000;  // Durée normale du clignotement
const ERROR_BLINK_DURATION = 500;    // Durée accélérée du clignotement après erreur
const ERROR_MIN_OPACITY = 0.3;       // Opacité minimale en cas d'erreur
const ERROR_MAX_OPACITY = 0.9;       // Opacité maximale en cas d'erreur
let isErrorBlinking = false;         // État du clignotement d'erreur
let errorBlinkTimeout = null;        // Timer pour arrêter le clignotement d'erreur

// Constantes pour gérer le clignotement des boutons reset et compteurs de coups
let isBlinkingReset = false;
let blinkAnimationFrame = null;
let blinkOpacity = 1;

// Paramètres pour la génération de niveaux aléatoires
const randomLevelConfigs = [
  { name: "Random Easy", clicks: 4, tileTypes: [0], difficulty: 'easy' },
  { name: "Random Medium", clicks: 4, tileTypes: [0, 4, 5, 6], difficulty: 'medium' },
  { name: "Random Hard", clicks: 5, tileTypes: [0, 3, 4, 5, 6], difficulty: 'hard' }
];

// Définition des variables pour le système de prévisualisation
let hoverAnimationFrame = null;
let hoveredTileIndex = null;
let hoverOpacity = 1;
let hoverDirection = -1;

// Définition des niveaux

const levels = [
  { grid: [1,1,1,0,1,1,1], optimalMoves: 1, difficulty: 'easy', world: 1  }, //lvl 1
  { grid: [1,0,0,1,0,1,0], optimalMoves: 1, difficulty: 'easy', world: 1  }, //lvl 2
  { grid: [1,1,0,0,0,1,1], optimalMoves: 2, difficulty: 'easy', world: 1  }, //lvl 3
  { grid: [0,1,0,0,0,0,1], optimalMoves: 2, difficulty: 'easy', world: 1  }, //lvl 4
  { grid: [1,1,1,0,0,0,1,1,0,1,0,0,0,0,1,0,1,1,0], optimalMoves: 2, difficulty: 'easy', world: 1 }, //lvl 5 
  { grid: [0,0,0,1,0,1,1,1,0,0,0,1,1,1,0,1,0,0,0], optimalMoves: 2, difficulty: 'easy', world: 2 }, //lvl 6
  { grid: [0,0,0,1,1,0,0,1,0,0,0,0,1,1,1,0,0,0,0], optimalMoves: 2, difficulty: 'easy', world: 2}, //lvl 7
  { grid: [0,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,0], optimalMoves: 4, difficulty: 'easy', world: 2}, //lvl 8
  { grid: [1,1,1,0,0,0,1,1,1,1,1,1,1,0,0,0,1,1,0], optimalMoves: 3, difficulty: 'easy', world: 2}, //lvl 9
  { grid: [0,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0], optimalMoves: 2, difficulty: 'easy', world: 2}, //lvl 10
  { grid: [0,1,0,0,1,0,0,1,1,0,1,1,0,0,1,0,0,1,0], optimalMoves: 3, difficulty: 'easy', world: 2}, //lvl 11
  { grid: [1,0,1,1,0,1,1,0,0,1,1,1,1,1,1,0,0,0,1], optimalMoves: 3, difficulty: 'easy', world: 2}, //lvl 12
  { grid: [0,0,0,1,0,1,1,1,0,1,0,0,0,1,0,1,1,1,1], optimalMoves: 3, difficulty: 'easy', world: 2}, //lvl 13
  { grid: [1,0,0,0,1,1,0,1,0,0,0,1,1,1,0,1,0,0,0], optimalMoves: 3, difficulty: 'easy', world: 2}, //lvl 14
  { grid: [1,1,0,1,0,1,0,0,1,0,1,1,0,0,1,1,0,1,0], optimalMoves: 3, difficulty: 'easy', world: 2}, //lvl 15
  { grid: [1,1,1,0,0,0,0,0,1,1,1,0,0,1,0,1,1,1,0], optimalMoves: 3, difficulty: 'easy', world: 2}, //lvl 16
  { grid: [1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1], optimalMoves: 3, difficulty: 'medium', world: 2}, //lvl 17
  { grid: [0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1,0,0,0], optimalMoves: 3, difficulty: 'medium', world: 2}, //lvl 18
  { grid: [1,0,0,0,0,1,1,0,0,0,0,1,0,0,0,1,0,0,1], optimalMoves: 3, difficulty: 'medium', world: 2}, //lvl 19
  { grid: [1,1,0,1,0,0,0,0,0,1,0,0,1,0,0,1,1,0,0], optimalMoves: 4, difficulty: 'medium', world: 2}, //lvl 20
  { grid: [2,2,2,0,2,2,2], optimalMoves: 2, difficulty: 'easy', world: 3}, //lvl 21 introduction tuile à 2 états 
  { grid: [0,1,2,2,0,0,1], optimalMoves: 2, difficulty: 'easy', world: 3}, //lvl 22
  { grid: [0,0,1,0,2,0,2,1,0,0,1,2,2,0,2,0,0,0,0], optimalMoves: 3, difficulty: 'easy', world: 3}, //lvl 23
  { grid: [2,0,0,1,2,2,1,2,0,0,0,0,1,0,0,1,0,0,0], optimalMoves: 3, difficulty: 'easy', world: 3}, //lvl 24
  { grid: [0,1,1,0,1,0,2,2,1,0,1,1,1,0,2,0,1,1,0], optimalMoves: 4, difficulty: 'easy', world: 3}, //lvl 25
  { grid: [0,1,1,0,1,0,0,0,2,0,2,0,0,0,1,0,1,1,0], optimalMoves: 5, difficulty: 'medium', world: 3}, //lvl 26
  { grid: [2,1,2,1,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0], optimalMoves: 4, difficulty: 'medium', world: 3}, //lvl 27
  { grid: [1,1,2,0,1,2,1,1,0,1,0,0,0,0,0,0,1,0,0], optimalMoves: 5, difficulty: 'medium', world: 3}, //lvl 28
  { grid: [0,0,1,0,0,1,0,1,0,1,1,0,0,0,1,0,2,2,2], optimalMoves: 6, difficulty: 'hard', world: 3}, //lvl 29
  { grid: [2,1,1,0,1,1,1,0,1,1,2,0,0,0,1,0,1,0,0], optimalMoves: 6, difficulty: 'hard', world: 3}, //lvl 30
  { grid: [1,1,1,1,1,1,1,1,1,3,1,1,1,1,1,1,1,1,1], optimalMoves: 1, difficulty: 'easy', world: 4}, //lvl 31 introduction tuile à double rangées
  { grid: [3,1,1,3,3,3,1,1,1,3,1,1,1,1,3,1,3,3,3], optimalMoves: 2, difficulty: 'easy', world: 4}, //lvl 32
  { grid: [3,1,1,3,1,3,3,3,0,3,0,3,3,3,1,3,1,1,3], optimalMoves: 4, difficulty: 'easy', world: 4}, //lvl 33
  { grid: [3,1,1,3,1,3,3,3,3,1,3,3,3,3,3,3,1,1,1], optimalMoves: 3, difficulty: 'easy', world: 4}, //lvl 34 (39 dans doc de LD)
  { grid: [1,3,3,1,3,1,3,3,3,1,3,3,3,1,3,1,3,3,1], optimalMoves: 3, difficulty: 'easy', world: 4}, //lvl 35 (40 dans doc de LD)
  { grid: [3,3,3,3,1,3,2,2,3,3,3,2,2,3,1,3,3,3,3], optimalMoves: 4, difficulty: 'easy', world: 4}, //lvl 36 (41 dans doc de LD) 
  { grid: [3,3,3,3,3,3,3,1,3,2,3,1,3,3,3,3,3,3,3], optimalMoves: 4, difficulty: 'medium', world: 4}, //lvl 37 (45 dans doc de LD) 
  { grid: [3,3,3,3,3,3,2,1,3,3,3,1,3,3,3,3,2,3,3], optimalMoves: 4, difficulty: 'medium', world: 4}, //lvl 38 (48 dans doc de LD) 
  { grid: [3,3,3,3,1,3,3,3,3,3,3,0,0,1,0,1,2,2,1], optimalMoves: 4, difficulty: 'medium', world: 4}, //lvl 39 
  { grid: [1,0,3,0,2,1,3,0,3,2,3,0,3,1,2,0,3,0,1], optimalMoves: 5, difficulty: 'medium', world: 4}, //lvl 40 
  { grid: [1,0,0,4,0,0,1], optimalMoves: 1, difficulty: 'easy', world: 5}, //lvl 41 (50 dans doc de LD) introduction des tuiles retournant des lignes
  { grid: [1,1,1,1,1,4,1,4,1,4,1,4,1,4,1,1,1,1,1], optimalMoves: 5, difficulty: 'easy', world: 5}, //lvl 42 (~51 dans doc de LD) 
  { grid: [5,5,5,1,5,1,5,1,4,1,4,5,5,5,5,5,5,5,5], optimalMoves: 2, difficulty: 'easy', world: 5}, //lvl 43 (~52 dans doc de LD) 
  { grid: [6,4,4,4,6,1,1,4,4,6,4,4,1,1,6,4,4,4,6], optimalMoves: 3, difficulty: 'easy', world: 5}, //lvl 44 (53 dans doc de LD) 
  { grid: [1,5,6,6,5,1,1,5,4,6,4,5,1,1,5,6,6,5,1], optimalMoves: 4, difficulty: 'medium', world: 5}, //lvl 45 (54 dans doc de LD) 
  { grid: [4,5,5,1,4,5,1,5,1,4,1,5,1,5,4,1,5,5,4], optimalMoves: 5, difficulty: 'medium', world: 5}, //lvl 46 (55 dans doc de LD) 
  { grid: [6,6,1,4,6,4,1,6,4,6,4,6,1,4,6,4,1,6,6], optimalMoves: 5, difficulty: 'medium', world: 5}, //lvl 47 (56 dans doc de LD) 
  { grid: [6,4,4,1,6,6,4,4,1,6,1,4,4,6,6,1,4,4,6], optimalMoves: 5, difficulty: 'medium', world: 5}, //lvl 48 (57 dans doc de LD) 
  { grid: [4,6,5,6,4,5,1,1,4,4,4,1,1,5,4,6,5,6,4], optimalMoves: 4, difficulty: 'medium', world: 5}, //lvl 49 (58 dans doc de LD) 
  { grid: [5,5,5,1,5,5,1,5,4,4,4,1,6,1,6,6,6,6,6], optimalMoves: 5, difficulty: 'medium', world: 5}, //lvl 50 (59 dans doc de LD)
  { grid: [4,4,4,5,2,6,4,4,5,4,6,1,1,5,4,6,4,4,4], optimalMoves: 4, difficulty: 'medium', world: 6}, //lvl 51 (60 dans doc de LD) 
  { grid: [5,5,6,2,5,1,5,6,4,4,5,6,5,2,6,1,6,5,6], optimalMoves: 5, difficulty: 'medium', world: 6}, //lvl 52 (61 dans doc de LD) 
  { grid: [4,1,1,5,5,6,5,6,2,4,2,6,5,6,6,5,1,1,4], optimalMoves: 4, difficulty: 'medium', world: 6}, //lvl 53 (66 dans doc de LD) 
  { grid: [6,6,6,4,1,2,5,6,4,4,4,6,5,4,1,2,5,5,5], optimalMoves: 4, difficulty: 'medium', world: 6}, //lvl 54 (63 dans doc de LD) 
  { grid: [2,2,6,5,6,6,4,6,4,4,2,4,5,6,5,5,2,5,2], optimalMoves: 5, difficulty: 'hard', world: 6}, //lvl 55 (62 dans doc de LD) 
  { grid: [6,1,6,4,6,2,4,4,4,5,4,4,4,2,5,4,6,1,6], optimalMoves: 5, difficulty: 'hard', world: 6}, //lvl 56 (64 dans doc de LD) 
  { grid: [6,6,6,4,2,4,6,1,4,4,4,5,1,4,2,4,5,5,5], optimalMoves: 6, difficulty: 'hard', world: 6}, //lvl 57 (65 dans doc de LD) 
  { grid: [4,5,5,4,2,4,5,5,4,4,4,6,6,4,1,2,6,5,4], optimalMoves: 5, difficulty: 'hard', world: 6}, //lvl 58 (67 dans doc de LD) 
  { grid: [4,5,6,2,4,5,6,1,4,5,4,1,6,5,4,6,6,5,2], optimalMoves: 6, difficulty: 'hard', world: 6}, //lvl 59 (68 dans doc de LD) 
  { grid: [5,2,1,6,5,5,5,6,4,4,4,6,5,5,6,6,2,1,6], optimalMoves: 7, difficulty: 'hard', world: 6}, //lvl 60 (69 dans doc de LD) 
  { grid: [0,0,0,1,1,0,1,0,0,7,0,0,0,1,0,0,0,0,0], optimalMoves: 2, difficulty: 'easy', world: 7}, //lvl 61 introduction de la tuile rotative 
  { grid: [0,1,1,0,0,0,0,1,0,7,0,1,0,0,0,0,1,1,0], optimalMoves: 3, difficulty: 'easy', world: 7}, //lvl 62
  { grid: [0,0,0,0,0,0,0,0,0,7,0,0,0,1,0,1,0,0,0], optimalMoves: 3, difficulty: 'easy', world: 7}, //lvl 63
  { grid: [1,0,0,1,1,0,0,0,0,7,0,1,0,1,0,0,0,0,1], optimalMoves: 3, difficulty: 'easy', world: 7}, //lvl 64
  { grid: [0,1,1,0,0,0,0,0,0,7,0,0,0,0,0,0,1,1,0], optimalMoves: 5, difficulty: 'easy', world: 7}, //lvl 65
  { grid: [1,0,1,1,0,7,0,0,0,0,0,0,0,7,0,1,1,0,1], optimalMoves: 5, difficulty: 'medium', world: 7}, //lvl 66
  { grid: [1,1,0,0,7,0,0,1,1,0,1,7,7,1,0,1,1,1,0], optimalMoves: 6, difficulty: 'medium', world: 7}, //lvl 67
  { grid: [1,1,0,0,7,1,7,0,1,0,0,0,1,0,1,1,0,0,0], optimalMoves: 4, difficulty: 'medium', world: 7}, //lvl 68
  { grid: [0,1,1,1,7,0,0,1,1,7,1,0,0,0,1,0,1,1,0], optimalMoves: 5, difficulty: 'medium', world: 7}, //lvl 69
  { grid: [0,0,1,0,1,1,7,7,1,7,0,0,1,0,0,0,0,1,0], optimalMoves: 6, difficulty: 'medium', world: 7}, //lvl 70
  { grid: [0,1,0,0,0,0,2,0,2,7,0,0,0,0,0,0,1,0,0], optimalMoves: 3, difficulty: 'easy', world: 8}, //lvl 71
  { grid: [0,0,0,0,7,1,0,7,0,2,0,0,2,0,0,0,0,1,0], optimalMoves: 4, difficulty: 'medium', world: 8}, //lvl 72
  { grid: [1,0,1,1,1,0,2,0,1,7,0,0,2,0,0,0,1,1,0], optimalMoves: 5, difficulty: 'medium', world: 8}, //lvl 73
  { grid: [0,2,2,0,0,1,7,7,0,0,0,0,0,0,0,0,1,0,0], optimalMoves: 6, difficulty: 'medium', world: 8}, //lvl 74
  { grid: [0,1,1,0,0,0,0,0,0,0,1,7,7,0,0,2,0,1,0], optimalMoves: 7, difficulty: 'hard', world: 8}, //lvl 75
  { grid: [0,1,2,0,7,0,7,7,2,0,0,0,0,0,0,0,0,1,0], optimalMoves: 7, difficulty: 'hard', world: 8}, //lvl 76
  { grid: [0,2,2,2,1,2,1,1,1,7,1,0,0,0,0,0,0,0,0], optimalMoves: 7, difficulty: 'hard', world: 8}, //lvl 77
  { grid: [0,0,0,0,7,0,2,0,1,0,1,2,0,0,7,0,0,0,0], optimalMoves: 7, difficulty: 'hard', world: 8}, //lvl 78
  { grid: [2,1,1,0,7,1,1,0,0,7,0,0,1,1,7,0,1,1,2], optimalMoves: 8, difficulty: 'hard', world: 8}, //lvl 79
  { grid: [7,2,2,1,0,7,0,0,0,7,0,0,1,1,0,0,1,0,0], optimalMoves: 10, difficulty: 'hard', world: 8}, //lvl 80
  
];

// Variables de gestion des indices
let currentHintIndex = 0;  // Pour suivre combien d'indices sont actuellement affichés
let maxHintsForLevel = 0;  // Pour stocker le nombre maximum d'indices pour le niveau en cours
let isHintButtonActive = true; // Variable pour suivre l'état du bouton

// Définition des indices par niveau
const hintPositions = {
  0: [3],    // Niveau 1: position 3
  1: [2],   
  2: [2, 4],  
  3: [0, 5],    
  4: [4, 18], 
  5: [8, 10],  
  6: [8, 9], 
  7: [0, 8, 10, 18],
  8: [4, 13, 15],
  9: [0, 3],
  10: [3, 9, 15],
  11: [1, 7, 16],
  12: [8, 10, 14],
  13: [1, 8, 10],
  14: [2, 6, 12],
  15: [4, 11, 12],
  16: [1, 8, 16],
  17: [8, 9, 10],
  18: [2, 9, 17],
  19: [2, 6, 10, 13],
  20: [3],
  21: [0, 5],
  22: [5, 9],
  23: [1, 2, 10],
  24: [3, 5, 18, 9],
  25: [3, 5, 13, 15, 9],
  26: [4, 6, 13], 
  27: [4, 7, 10, 12, 18],
  28: [5, 10, 12, 14, 15],
  29: [3, 4, 7, 15, 18],
  30: [9],
  31: [3, 5],
  32: [0, 8, 10, 18],
  33: [3, 5, 14],
  34: [1, 10, 16],
  35: [0, 8, 10, 18], 
  36: [1, 5, 13, 17], 
  37: [1, 5, 13, 17],
  38: [0, 8, 10, 14],
  39: [2, 3, 9, 15, 16],
  40: [3],
  41: [5, 7, 9, 11, 13],
  42: [8, 11],
  43: [8, 9, 10],
  44: [1, 9, 10, 16],
  45: [1, 2, 9, 16, 17],
  46: [0, 8, 9, 10, 18],
  47: [2, 4, 9, 14, 16],
  48: [1, 2, 16, 17],
  49: [1, 2, 9, 16, 17],
  50: [8, 10, 16, 17],
  51: [1, 2, 8, 16, 17],
  52: [6, 7, 11, 12],
  53: [2, 9, 10, 17],
  54: [3, 7, 9, 12, 13],
  55: [0, 6, 9, 12, 18],
  56: [1, 2, 9, 10, 16, 17],
  57: [0, 2, 12, 13, 17],
  58: [8, 9, 10, 16, 17], 
  59: [0, 6, 7, 8, 11, 12, 18],
  60: [8, 9],
  61: [0, 9, 18],
  62: [9, 16, 17],
  63: [1, 9, 16],
  64: [0, 9, 18],
  65: [1, 5, 9, 13, 17],
  66: [3, 4, 5, 11, 12, 18],
  67: [3, 4, 9, 10],
  68: [0, 6, 9, 13, 15],
  69: [0, 6, 7, 9, 15],
  70: [3, 9, 13],
  71: [5, 7, 9, 15],
  72: [1, 5, 9, 13, 15],
  73: [0, 6, 7, 13],
  74: [3, 5, 11, 12],
  75: [3, 7, 9, 11, 18], 
  76: [0, 1, 2, 6, 7, 9],
  77: [4, 13, 14, 15],
  78: [2, 4, 9, 14, 16],
  79: [0, 5, 8, 9, 15, 18]
};

window.currentLevel = currentLevel;
window.levels = levels;

// Fonction pour obtenir les informations sur les mondes
function getWorldInfo() {
  const worlds = {
    1: { name: "Tutorial", startLevel: 0, endLevel: 4 },
    2: { name: "Basics", startLevel: 5, endLevel: 19 },
    3: { name: "Double-state", startLevel: 20, endLevel: 29 },
    4: { name: "Double-row", startLevel: 30, endLevel: 39 },
    5: { name: "Lines", startLevel: 40, endLevel: 49 },
    6: { name: "Lines & Double-state", startLevel: 50, endLevel: 59 },
    7: { name: "Rotations", startLevel: 60, endLevel: 69 },
    8: { name: "Rotations & Double-state", startLevel: 70, endLevel: 79 }
  };
  return worlds;
}

// Fonction pour obtenir le numéro de niveau relatif au monde actuel
function getWorldRelativeLevel(absoluteLevel) {
    const worlds = getWorldInfo();
    const worldNum = levels[absoluteLevel].world;
    return absoluteLevel - worlds[worldNum].startLevel + 1;
}

// Detection d'un device mobile
function isTouchDevice() {
	return window.innerWidth <= 768;
}


let hintOpacity = 1;
let hintDirection = -1;
let hintAnimationFrame = null;

function drawHintCursor(ctx, x, y, size, opacity = 1) {
  const cursorSize = size * 0.3;
  const yOffset = 5;
  ctx.save();
  ctx.globalAlpha = opacity;
  
  // Dessiner le curseur
  ctx.beginPath();
  ctx.moveTo(x - cursorSize/2, y - cursorSize/2 - yOffset);
  ctx.lineTo(x + cursorSize/2, y - cursorSize/2 - yOffset);
  ctx.lineTo(x, y + cursorSize/2 - yOffset);
  ctx.closePath();
  
  // Créer un dégradé pour le curseur avec des couleurs différentes selon l'état d'erreur
  const gradient = ctx.createLinearGradient(
    x - cursorSize/2, 
    y - cursorSize/2 - yOffset, 
    x + cursorSize/2, 
    y + cursorSize/2 - yOffset
  );
  
  if (isErrorBlinking) {
    gradient.addColorStop(0, '#aaffaa');
    gradient.addColorStop(1, '#00ff00'); // Vert 
  } else {
    gradient.addColorStop(0, '#ffffff');
    gradient.addColorStop(1, '#ffff00'); // Jaune par défaut
  }
  
  ctx.fillStyle = gradient;
  ctx.fill();
  
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  
  ctx.restore();
}

// Animations des curseurs indices
function animateHintCursors(timestamp) {
    // Si nous sommes dans un niveau aléatoire
    if (currentLevel === 'random' && storedRandomLevel) {
        if (!showHints) {
            if (hintAnimationFrame) {
                cancelAnimationFrame(hintAnimationFrame);
                hintAnimationFrame = null;
            }
            return;
        }

        // Utiliser la séquence de clics comme positions d'indices
        const hintClickSequence = storedRandomLevel.clickSequence;
        const hintsToShow = hintClickSequence.slice(0, currentHintIndex + 1);

        // Initialiser le temps si c'est le premier appel
        if (!lastAnimationTime) {
            lastAnimationTime = timestamp;
        }

        // Calculer la progression basée sur le temps écoulé
        const elapsedTime = timestamp - lastAnimationTime;
        const normalizedTime = (elapsedTime % BLINK_DURATION) / BLINK_DURATION;
        
        hintOpacity = MIN_OPACITY + (MAX_OPACITY - MIN_OPACITY) * 
                     (0.5 + 0.5 * Math.sin(2 * Math.PI * normalizedTime));

        // Mettre à jour chaque curseur d'indice
        hintsToShow.forEach(position => {
            const hexagon = hexagonContainer.querySelector(`.hexagon[data-index="${position}"]`);
            if (hexagon) {
                const front = hexagon.children[0];
                const frontCtx = front.getContext('2d');
                
                frontCtx.clearRect(0, 0, front.width, front.height);
                drawHexagon(frontCtx, front.width/2, front.height/2, front.width/2, tiles[position].currentState);
                
                if (tiles[position].currentState === 7) {
                    drawRotationSymbol(frontCtx, front.width/2, front.height/2, front.width/2);
                }
                
                drawHintCursor(frontCtx, front.width/2, front.height/2, front.width/2, hintOpacity);
            }
        });

        hintAnimationFrame = requestAnimationFrame(animateHintCursors);
    } 
    // Pour les niveaux normaux
    else {
        if (!hintPositions[currentLevel]) {
            if (hintAnimationFrame) {
                cancelAnimationFrame(hintAnimationFrame);
                hintAnimationFrame = null;
            }
            return;
        }

        // Pour les niveaux tutoriels (0-4), garder l'ancien comportement
        if (currentLevel < 5) {
            const allHintPositions = hintPositions[currentLevel];
            // Logique existante pour les niveaux tutoriels...
            if (!lastAnimationTime) {
                lastAnimationTime = timestamp;
            }

            const elapsedTime = timestamp - lastAnimationTime;
            const currentBlinkDuration = isErrorBlinking ? ERROR_BLINK_DURATION : NORMAL_BLINK_DURATION;
            const normalizedTime = (elapsedTime % currentBlinkDuration) / currentBlinkDuration;
            
            const minOpacity = isErrorBlinking ? ERROR_MIN_OPACITY : MIN_OPACITY;
            const maxOpacity = isErrorBlinking ? ERROR_MAX_OPACITY : MAX_OPACITY;
            
            hintOpacity = minOpacity + (maxOpacity - minOpacity) * 
                         (0.5 + 0.5 * Math.sin(2 * Math.PI * normalizedTime));

            allHintPositions.forEach(position => {
                const hexagon = hexagonContainer.querySelector(`.hexagon[data-index="${position}"]`);
                if (hexagon) {
                    const front = hexagon.children[0];
                    const frontCtx = front.getContext('2d');
                    
                    frontCtx.clearRect(0, 0, front.width, front.height);
                    drawHexagon(frontCtx, front.width/2, front.height/2, front.width/2, tiles[position].currentState);
                    
                    if (tiles[position].currentState === 7) {
                        drawRotationSymbol(frontCtx, front.width/2, front.height/2, front.width/2);
                    }
                    
                    drawHintCursor(frontCtx, front.width/2, front.height/2, front.width/2, hintOpacity);
                }
            });
        } else {
            // Nouveau comportement pour les niveaux normaux
            if (!showHints) {
                if (hintAnimationFrame) {
                    cancelAnimationFrame(hintAnimationFrame);
                    hintAnimationFrame = null;
                }
                return;
            }

            const hintsToShow = hintPositions[currentLevel].slice(0, currentHintIndex + 1);

            if (!lastAnimationTime) {
                lastAnimationTime = timestamp;
            }

            const elapsedTime = timestamp - lastAnimationTime;
            const currentBlinkDuration = isErrorBlinking ? ERROR_BLINK_DURATION : NORMAL_BLINK_DURATION;
            const normalizedTime = (elapsedTime % currentBlinkDuration) / currentBlinkDuration;
            
            const minOpacity = isErrorBlinking ? ERROR_MIN_OPACITY : MIN_OPACITY;
            const maxOpacity = isErrorBlinking ? ERROR_MAX_OPACITY : MAX_OPACITY;
            
            hintOpacity = minOpacity + (maxOpacity - minOpacity) * 
                         (0.5 + 0.5 * Math.sin(2 * Math.PI * normalizedTime));

            hintsToShow.forEach(position => {
                const hexagon = hexagonContainer.querySelector(`.hexagon[data-index="${position}"]`);
                if (hexagon) {
                    const front = hexagon.children[0];
                    const frontCtx = front.getContext('2d');
                    
                    frontCtx.clearRect(0, 0, front.width, front.height);
                    drawHexagon(frontCtx, front.width/2, front.height/2, front.width/2, tiles[position].currentState);
                    
                    if (tiles[position].currentState === 7) {
                        drawRotationSymbol(frontCtx, front.width/2, front.height/2, front.width/2);
                    }
                    
                    drawHintCursor(frontCtx, front.width/2, front.height/2, front.width/2, hintOpacity);
                }
            });
        }

        hintAnimationFrame = requestAnimationFrame(animateHintCursors);
    }
}

// Modifier la fonction initLevel pour démarrer/arrêter l'animation des indices
const originalInitLevel = window.initLevel;
window.initLevel = function(level) {
    // Réinitialiser le bouton hint
    const hintButton = document.getElementById('hint-btn');
    isHintButtonActive = true;
    hintButton.style.opacity = '1';
    hintButton.style.cursor = 'pointer';
    
    // Réinitialiser les variables d'indices
    if (hintAnimationFrame) {
        cancelAnimationFrame(hintAnimationFrame);
        hintAnimationFrame = null;
    }
    lastAnimationTime = 0;
    showHints = false;
    currentHintIndex = 0;
    
    // Mettre à jour le nombre maximum d'indices pour le niveau
    if (level === 'random') {
        maxHintsForLevel = storedRandomLevel ? storedRandomLevel.clickSequence.length : 0;
    } else if (hintPositions[level]) {
        maxHintsForLevel = hintPositions[level].length;
    } else {
        maxHintsForLevel = 0;
    }

    return originalInitLevel(level).then(() => {
        drawGrid();
        
        if (level === 'random') {
            // Ne rien faire ici, on attend que l'utilisateur active les indices
        } else if (hintPositions[level] && level < 5) {
            // Activer automatiquement les indices uniquement pour les premiers niveaux
            showHints = true;
            currentHintIndex = maxHintsForLevel - 1; // Afficher tous les indices pour les niveaux tutoriels
            animateHintCursors();
        }
    });
};

// Arrêter l'animation des indices lors de la victoire
const originalCheckWinCondition = window.checkWinCondition;
window.checkWinCondition = async function() {
  if (hintAnimationFrame) {
    cancelAnimationFrame(hintAnimationFrame);
    hintAnimationFrame = null;
  }
  return originalCheckWinCondition.call(this);
};


// Système de prévisualisation
function startHoverPreview(tileIndex) {
    // Si c'est un appareil tactile, on ne fait rien
    if (isTouchDevice()) return;
    
    if (isLevelTransition || isFlipping || isTransitioning) return;
    
    const tile = tiles[tileIndex];
    if (tile.currentState !== 0) return;
    
    hoveredTileIndex = tileIndex;
    
    if (hoverAnimationFrame) {
        cancelAnimationFrame(hoverAnimationFrame);
    }
    
    // Démarrer l'animation de clignotement
    function animateHover() {
        // Faire varier l'opacité entre 0.3 et 1
        hoverOpacity += 0.015 * hoverDirection;
        if (hoverOpacity <= 0.3) {
            hoverOpacity = 0.3;
            hoverDirection = 1;
        } else if (hoverOpacity >= 1) {
            hoverOpacity = 1;
            hoverDirection = -1;
        }
        
        // Obtenir les cases adjacentes
        const adjacentTiles = getAdjacentTiles(tileIndex);
        
        // Mettre à jour l'apparence de chaque case adjacente
        adjacentTiles.forEach(adjIndex => {
            const hexagon = hexagonContainer.querySelector(`.hexagon[data-index="${adjIndex}"]`);
            if (hexagon) {
                const front = hexagon.children[0];
                const frontCtx = front.getContext('2d');
                frontCtx.clearRect(0, 0, front.width, front.height);
                
                // Dessiner l'état actuel
                drawHexagon(frontCtx, front.width / 2, front.height / 2, front.width / 2, tiles[adjIndex].currentState);
                
                // Dessiner l'effet de survol par-dessus
                const nextState = tiles[adjIndex].currentState === 1 ? 0 : 1;
                frontCtx.globalAlpha = 1 - hoverOpacity;
                drawHexagon(frontCtx, front.width / 2, front.height / 2, front.width / 2, nextState);
                frontCtx.globalAlpha = 1;
                
                // Si la tuile est de type 7, redessiner le symbole de rotation
                if (tiles[adjIndex].currentState === 7) {
                    drawRotationSymbol(frontCtx, front.width / 2, front.height / 2, front.width / 2);
                }
            }
        });
        
        if (hoveredTileIndex === tileIndex) {
            hoverAnimationFrame = requestAnimationFrame(animateHover);
        }
    }
    
    animateHover();
}

function stopHoverPreview() {
    if (hoverAnimationFrame) {
        cancelAnimationFrame(hoverAnimationFrame);
        hoverAnimationFrame = null;
    }
    
    if (hoveredTileIndex !== null) {
        // Restaurer l'apparence normale des cases adjacentes
        const adjacentTiles = getAdjacentTiles(hoveredTileIndex);
        adjacentTiles.forEach(adjIndex => {
            const hexagon = hexagonContainer.querySelector(`.hexagon[data-index="${adjIndex}"]`);
            if (hexagon) {
                const front = hexagon.children[0];
                const frontCtx = front.getContext('2d');
                frontCtx.clearRect(0, 0, front.width, front.height);
                drawHexagon(frontCtx, front.width / 2, front.height / 2, front.width / 2, tiles[adjIndex].currentState);
                
                // Redessiner le symbole de rotation si nécessaire
                if (tiles[adjIndex].currentState === 7) {
                    drawRotationSymbol(frontCtx, front.width / 2, front.height / 2, front.width / 2);
                }
            }
        });
    }
    
    hoveredTileIndex = null;
}

// Fonction pour gérer le clignotement du bouton reset et du compteur de coups

function animateResetHint() {
    if (!isBlinkingReset) return;
    
    const resetBtn = document.getElementById('reset-btn');
    const movesDisplay = document.getElementById('moves-display');
    
    blinkOpacity = 0.5 + (Math.sin(Date.now() / 150) + 1) / 2 * 0.7;
    
    resetBtn.style.opacity = blinkOpacity;
    movesDisplay.style.opacity = blinkOpacity;
    
    blinkAnimationFrame = requestAnimationFrame(animateResetHint);
}

function startResetHint() {
    if (!isBlinkingReset) {
        isBlinkingReset = true;
        animateResetHint();
    }
}

function stopResetHint() {
    isBlinkingReset = false;
    if (blinkAnimationFrame) {
        cancelAnimationFrame(blinkAnimationFrame);
        blinkAnimationFrame = null;
    }
    
    const resetBtn = document.getElementById('reset-btn');
    const movesDisplay = document.getElementById('moves-display');
    resetBtn.style.opacity = '1';
    movesDisplay.style.opacity = '1';
}


// Ajour de l'élément random en fin de liste
const levelSelect = document.getElementById('level-select');
levels.forEach((level, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = `Level ${index + 1}`;
    levelSelect.appendChild(option);
});

// Ajouter un séparateur
const separator = document.createElement('option');
separator.disabled = true;
separator.value = "";
separator.textContent = "─────────────";
separator.style.color = "#888";
separator.style.fontWeight = "bold";
separator.style.backgroundColor = "#f0f0f0";
levelSelect.appendChild(separator);

randomLevelConfigs.forEach((config, index) => {
  const randomOption = document.createElement('option');
  randomOption.value = `random-${index}`;
  randomOption.textContent = config.name;
  levelSelect.appendChild(randomOption);
});

// Ajouter un écouteur d'événements pour le changement de niveau
levelSelect.addEventListener('change', async (e) => {
    console.log("Level select changed");
    const selectedLevel = e.target.value;
    console.log("Selected level:", selectedLevel);
    
    if (cleanupCongratulationsMessage) {
        cleanupCongratulationsMessage();
        cleanupCongratulationsMessage = null;
    }
    
	isLevelTransition = false;
	
    showHints = false;
    if (hintAnimationFrame) {
        cancelAnimationFrame(hintAnimationFrame);
        hintAnimationFrame = null;
    }	
	
    // Effacer complètement le canvas et le conteneur d'hexagones
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hexagonContainer.innerHTML = '';
    
    // Réinitialiser les états du jeu

    isTransitioning = false;
    
    if (selectedLevel.startsWith('random-')) {
        const configIndex = parseInt(selectedLevel.split('-')[1]);
        const config = randomLevelConfigs[configIndex];
        console.log("Initializing random level with config:", config);
        await initRandomLevel(config);
    } else {
        currentLevel = parseInt(selectedLevel);
        await initLevel(currentLevel);
    }
    
    // Assurez-vous que le conteneur d'hexagones est visible
    hexagonContainer.style.display = '';
    
	setButtonsEnabled(true);
	
    levelSelect.value = selectedLevel;
    console.log("Level select change handled");
});


function updateLevelSelector(level) {
    const levelSelect = document.getElementById('level-select');
    levelSelect.innerHTML = '';
    
    const worlds = getWorldInfo();
    
    // Pour chaque monde
    for (let worldNum = 1; worldNum <= 8; worldNum++) {
        const world = worlds[worldNum];
        
        // Créer un groupe pour le monde
        const worldGroup = document.createElement('optgroup');
        worldGroup.label = world.name;
        
        // Ajouter les niveaux de ce monde
        for (let i = world.startLevel; i <= world.endLevel; i++) {
            const option = document.createElement('option');
            option.value = i;
            // Utiliser la numérotation relative au monde
            const relativeLevel = i - world.startLevel + 1;
            option.textContent = `Level ${relativeLevel}`;
            if (i === level) {
                option.selected = true;
            }
            worldGroup.appendChild(option);
        }
        
        levelSelect.appendChild(worldGroup);
    }
    
    // Ajouter le séparateur et les niveaux aléatoires
    const separator = document.createElement('option');
    separator.disabled = true;
    separator.value = "";
    separator.textContent = "─────────────";
    separator.style.color = "#888";
    separator.style.fontWeight = "bold";
    separator.style.backgroundColor = "#f0f0f0";
    levelSelect.appendChild(separator);
    
    // Ajouter les options de niveaux aléatoires
    randomLevelConfigs.forEach((config, index) => {
        const randomOption = document.createElement('option');
        randomOption.value = `random-${index}`;
        randomOption.textContent = config.name;
        if (level === `random-${index}`) {
            randomOption.selected = true;
        }
        levelSelect.appendChild(randomOption);
    });
}

// Définition des variables de scoring
let totalStars = 0;
const maxStars = levels.length * 3;

let gameState = [];
let history = [];

const smallHexPositions = [
  {x: 0, y: -1},        // 0: Haut
  {x: 0.866, y: -0.5},  // 1: Haut-droite
  {x: -0.866, y: -0.5}, // 2: Haut-gauche
  {x: 0, y: 0},         // 3: Centre
  {x: 0.866, y: 0.5},   // 4: Bas-droite
  {x: -0.866, y: 0.5},  // 5: Bas-gauche
  {x: 0, y: 1}          // 6: Bas
];

const largeHexPositions = [
  {x: 0, y: -2},        // 0: Centre-haut
  {x: 0.866, y: -1.5},  // 1
  {x: -0.866, y: -1.5}, // 2
  {x: 1.732, y: -1},    // 3
  {x: 0, y: -1},        // 4
  {x: -1.732, y: -1},   // 5
  {x: 0.866, y: -0.5},  // 6
  {x: -0.866, y: -0.5}, // 7
  {x: 1.732, y: 0},     // 8
  {x: 0, y: 0},         // 9: Centre
  {x: -1.732, y: 0},    // 10
  {x: 0.866, y: 0.5},   // 11
  {x: -0.866, y: 0.5},  // 12
  {x: 1.732, y: 1},     // 13
  {x: 0, y: 1},         // 14
  {x: -1.732, y: 1},    // 15
  {x: 0.866, y: 1.5},   // 16
  {x: -0.866, y: 1.5},  // 17
  {x: 0, y: 2}          // 18: Centre-bas
];

// Gestion du tuto du tout premier niveau dont l'instruction et la main animée
function updateInstructionVisibility() {
    const instructionElement = document.getElementById('instruction');
    let cursorElement = document.getElementById('tutorial-cursor');
    let animationFrameId = null;
    
    if (currentLevel === 0) {
        const hexagonContainer = document.getElementById('hexagon-container');
        const hexagonRect = hexagonContainer.getBoundingClientRect();

        // Instructions avec animation de clignotement
        instructionElement.style.display = 'block';
        instructionElement.style.position = 'absolute';
        instructionElement.style.width = '100%';
        instructionElement.style.textAlign = 'center';
        instructionElement.style.top = `${hexagonRect.bottom - 500}px`;
        instructionElement.style.left = '0';
        instructionElement.style.color = 'lightyellow';
        instructionElement.style.fontStyle = 'italic';
        instructionElement.style.fontSize = '14px';
        instructionElement.style.zIndex = '1000';
        instructionElement.innerHTML = '<b>Click</b> on the right blank tiles <br>to <b>flip</b> the others and <b>clear</b> the board!';

        // Position centrale de la grille
        const centerX = (hexagonRect.left + hexagonRect.width / 2) + 10;
        const centerY = (hexagonRect.top + hexagonRect.height / 2) - 25;
        
        // Position de départ (en bas à droite)
        const startX = hexagonRect.right - 460;
        const startY = hexagonRect.bottom - 280;

        // Créer et positionner le curseur
        if (!cursorElement) {
            cursorElement = document.createElement('img');
            cursorElement.id = 'tutorial-cursor';
            cursorElement.src = 'hand.png';
            cursorElement.style.cssText = `
                position: fixed;
                z-index: 10000;
                pointer-events: none;
                width: 32px;
                height: 32px;
                opacity: 0;
            `;
            document.body.appendChild(cursorElement);
            
            // Position initiale
            cursorElement.style.left = `${startX}px`;
            cursorElement.style.top = `${startY}px`;
        }

        let startTime = null;
        const animationDuration = 1000;
        const waitDuration = 500;
        const totalDuration = animationDuration + waitDuration;

        function animate(timestamp) {
            if (currentLevel !== 0) {
                if (cursorElement) cursorElement.remove();
                if (animationFrameId) cancelAnimationFrame(animationFrameId);
                return;
            }

            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const cycle = Math.floor(elapsed / totalDuration);
            const cycleTime = elapsed % totalDuration;
            
            // Animation du texte d'instruction
            instructionElement.style.opacity = Math.sin(elapsed / 500) * 0.3 + 0.7;

            if (cycleTime <= animationDuration) {
                const progress = cycleTime / animationDuration;
                const easeProgress = progress < 0.5 
                    ? 2 * progress * progress 
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                const currentX = startX + (centerX - startX) * easeProgress;
                const currentY = startY + (centerY - startY) * easeProgress;
                
                cursorElement.style.left = `${currentX - 16}px`;
                cursorElement.style.top = `${currentY - 16}px`;
                
                // Gestion de l'opacité
                let opacity = 1;
                if (cycleTime < 200) {
                    opacity = cycleTime / 200;
                } else if (cycleTime > animationDuration - 200) {
                    opacity = (animationDuration - cycleTime) / 200;
                }
                cursorElement.style.opacity = opacity;
            } else {
                // Pendant la période d'attente
                cursorElement.style.opacity = 0;
                cursorElement.style.left = `${startX - 16}px`;
                cursorElement.style.top = `${startY - 16}px`;
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        // Démarrer l'animation
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(animate);

    } else {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
        if (cursorElement) {
            cursorElement.remove();
        }
        instructionElement.style.display = 'none';
    }
}


function isSmallGrid(level) {
    if (level === 'random') {
        // Pour le niveau aléatoire, nous utiliserons toujours la grande grille
        return false;
    }
    return level < 4 || (level >= 20 && level < 22) || level === 40;
}

function drawHexagon(ctx, x, y, size, state) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const hx = x + size * Math.cos(angle);
        const hy = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(hx, hy);
        else ctx.lineTo(hx, hy);
    }
    ctx.closePath();
    
    const gradientAngle = Math.PI / 6;
    const gradientStartX = x + size * Math.cos(gradientAngle);
    const gradientStartY = y + size * Math.sin(gradientAngle);
    const gradientEndX = x + size * Math.cos(gradientAngle + Math.PI);
    const gradientEndY = y + size * Math.sin(gradientAngle + Math.PI);
    
    let gradient;
    switch(state) {
        case 0:
            ctx.fillStyle = '#101010';
            break;
        case 1:
            gradient = ctx.createLinearGradient(gradientStartX, gradientStartY, gradientEndX, gradientEndY);
            gradient.addColorStop(0, '#12d8ee');
            gradient.addColorStop(1, '#ddfca0');
            ctx.fillStyle = gradient;
            break;
        case 2:
            gradient = ctx.createLinearGradient(gradientStartX, gradientStartY, gradientEndX, gradientEndY);
            gradient.addColorStop(0, '#b74dd4');
            gradient.addColorStop(1, '#5e8bb5');
            ctx.fillStyle = gradient;
            break;
        case 3: // Tuile spéciale modifiée
            ctx.fillStyle = '#101010';
            break;
		case 4: // Nouvelle tuile neutre avec trait vertical
            ctx.fillStyle = '#101010';
            ctx.fill();
            ctx.strokeStyle = 'cyan';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            
            // Dessiner le trait vertical cyan
            ctx.beginPath();
            ctx.moveTo(x, y - size / 2);
            ctx.lineTo(x, y + size / 2);
            ctx.strokeStyle = 'cyan';
            ctx.lineWidth = 2;
            ctx.stroke();
            break;
		        case 5: // Tuile neutre avec trait diagonal (haut gauche vers bas droite)
            ctx.fillStyle = '#101010';
            ctx.fill();
            ctx.strokeStyle = 'cyan';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            
            // Dessiner le trait diagonal cyan (30° sens anti-horaire)
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(-Math.PI / 3);
            ctx.beginPath();
            ctx.moveTo(0, -size / 2);
            ctx.lineTo(0, size / 2);
            ctx.strokeStyle = 'cyan';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
            break;
        case 6: // Tuile neutre avec trait diagonal (bas gauche vers haut droite)
            ctx.fillStyle = '#101010';
            ctx.fill();
            ctx.strokeStyle = 'cyan';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            
            // Dessiner le trait diagonal cyan (30° sens horaire)
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(Math.PI / 3);
            ctx.beginPath();
            ctx.moveTo(0, -size / 2);
            ctx.lineTo(0, size / 2);
            ctx.strokeStyle = 'cyan';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.restore();
            break;
		case 7: // Nouvelle tuile avec cercle animé
            ctx.fillStyle = '#101010';
            ctx.fill();
            ctx.strokeStyle = 'cyan';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            break;
        default:
            ctx.fillStyle = 'lightgray';
    }
    
    ctx.fill();
    
    // Dessiner le contour extérieur pour toutes les tuiles
    ctx.strokeStyle = 'cyan';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Ajouter une ligne de contour intérieure pour la tuile spéciale (état 3)
    if (state === 3) {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const innerSize = size * 0.85; // Ajustez cette valeur pour modifier la taille du contour intérieur
            const hx = x + innerSize * Math.cos(angle);
            const hy = y + innerSize * Math.sin(angle);
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.strokeStyle = 'cyan';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
	
}

function createHexagonElement(x, y, size, state, index, isNeutral = false) {
    const hexagon = document.createElement('div');
    hexagon.dataset.state = state;
    hexagon.className = 'hexagon';
    hexagon.style.left = `${x - size / 2}px`;
    hexagon.style.top = `${y - size / 2}px`;
    hexagon.style.width = `${size}px`;
    hexagon.style.height = `${size}px`;
    hexagon.dataset.index = index;

    const front = document.createElement('canvas');
    front.width = size;
    front.height = size;
    drawHexagon(front.getContext('2d'), size / 2, size / 2, size / 2, state);
    
    if (state === 7) {
        drawRotationSymbol(front.getContext('2d'), size / 2, size / 2, size / 2);
    }
    
    hexagon.appendChild(front);

    if (isNeutral) {
        hexagon.classList.add('neutral');
        drawHexagon(front.getContext('2d'), size / 2, size / 2, size / 2, 3);
    } else {
        const back = document.createElement('canvas');
        back.width = size;
        back.height = size;
        drawHexagon(back.getContext('2d'), size / 2, size / 2, size / 2, (state + 1) % 3);
        back.style.transform = 'rotateY(180deg)';
        hexagon.appendChild(back);
    }

    // if (currentLevel === 0 && index === 3) {
        // front.style.opacity = '0.1';  
    // }

    // N'ajouter les événements de survol que sur les appareils non tactiles
    if (!isTouchDevice()) {
        hexagon.addEventListener('mouseenter', () => {
            startHoverPreview(index);
        });

        hexagon.addEventListener('mouseleave', () => {
            stopHoverPreview();
        });
    }

    // Garder l'événement click pour tous les appareils
    hexagon.addEventListener('click', async (e) => {
        e.stopPropagation();
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        await handleClick(x, y);
    });

    return hexagon;
}



function drawGrid() {
	console.log("Entering drawGrid");
    console.log("Current level:", currentLevel);
    console.log("Tiles:", tiles);
	
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hexagonContainer.innerHTML = '';
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 - 10 ;
    
    const hexPositions = currentLevel === 'random' ? largeHexPositions : (isSmallGrid(currentLevel) ? smallHexPositions : largeHexPositions);
    const gridSize = currentLevel === 'random' ? LARGE_GRID_SIZE : (isSmallGrid(currentLevel) ? SMALL_GRID_SIZE : LARGE_GRID_SIZE);
    
    hexPositions.forEach((pos, index) => {
        if (index < tiles.length) {
            const x = centerX + pos.x * TILE_SIZE * 1.75;
            const y = centerY + pos.y * TILE_SIZE * 1.75;
            
            const hexagon = createHexagonElement(x, y, TILE_SIZE * 2, tiles[index].currentState, index, false);
            hexagonContainer.appendChild(hexagon);
        }
    });
    
    drawLevelText();
    drawTileIndices();

	// fire loading function here
	//PokiSDK.gameLoadingFinished();

	
}

function blinkGrid() {
  return new Promise(resolve => {
    victorySound.currentTime = 0;
    victorySound.play();    

    const maxBlinks = 4;
    let blinkCount = 0;
    let opacity = 0;
    const maxOpacity = 0.9;
    const gridSize = isSmallGrid(currentLevel) ? SMALL_GRID_SIZE : LARGE_GRID_SIZE;
    const fadeSpeed = isSmallGrid(currentLevel) ? 0.2 : 0.09 * (gridSize / SMALL_GRID_SIZE);
    const hexagons = hexagonContainer.querySelectorAll('.hexagon');

    function blink(timestamp) {
      if (blinkCount < maxBlinks) {
        hexagons.forEach(hexagon => {
          const front = hexagon.children[0];
          const frontCtx = front.getContext('2d');
          frontCtx.clearRect(0, 0, front.width, front.height);
          
          const state = tiles[hexagon.dataset.index].currentState;
          drawHexagon(frontCtx, front.width / 2, front.height / 2, front.width / 2, state);
          drawVictoryHexagon(frontCtx, front.width / 2, front.height / 2, front.width / 2, opacity);
        });

        if (blinkCount % 2 === 0) {
          opacity += fadeSpeed;
          if (opacity >= maxOpacity) {
            opacity = maxOpacity;
            blinkCount++;
          }
        } else {
          opacity -= fadeSpeed;
          if (opacity <= 0) {
            opacity = 0;
            blinkCount++;
          }
        }

        requestAnimationFrame(blink);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(blink);
  });
}

function showTutorialImage(imageName) {
    return new Promise(resolve => {
        setButtonsEnabled(false);
        isLevelTransition = true;
        const movesDisplay = document.getElementById('moves-display');
        const undoButton = document.getElementById('undo-btn');
        const hintButton = document.getElementById('hint-btn');
        const resetButton = document.getElementById('reset-btn');
        
        if (movesDisplay) movesDisplay.style.display = 'none';
        if (undoButton) undoButton.style.display = 'none';
        if (hintButton) hintButton.style.display = 'none';
        if (resetButton) resetButton.style.display = 'none';
        
        const tutorialImage = new Image();
        tutorialImage.src = imageName;
        
        let animationId;
        let opacity = 0;
        let isAnimationComplete = false;

        function drawTutorialImage() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Fond semi-transparent avec la même teinte que l'écran d'accueil
            ctx.fillStyle = `rgba(0, 10, 20, ${0 * opacity})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Définir les dimensions de l'image en fonction du device
            let imageWidth, imageHeight;
            if (isTouchDevice()) {
                // Sur mobile, utiliser 95% de la largeur de l'écran
                imageWidth = window.innerWidth * 0.95;
                // Calculer la hauteur proportionnellement pour maintenir le ratio
                const ratio = tutorialImage.height / tutorialImage.width;
                imageHeight = imageWidth * ratio;
            } else {
                // Sur desktop, utiliser les dimensions fixes originales
                imageWidth = 480;
                imageHeight = 400;
            }
            
            const x = (canvas.width - imageWidth) / 2;
            const y = (canvas.height - imageHeight) / 2;
            
            ctx.globalAlpha = opacity;
            ctx.drawImage(tutorialImage, x, y, imageWidth, imageHeight);
            ctx.globalAlpha = 1;
        }

        function animate() {
            if (opacity < 1) {
                opacity += 0.05;
                drawTutorialImage();
                animationId = requestAnimationFrame(animate);
            } else {
                isAnimationComplete = true;
                drawTutorialImage();
            }
        }

        function handleClick(event) {
            if (isAnimationComplete) {
                cleanup();
                resolve();
            }
        }

        function cleanup() {
            document.removeEventListener('click', handleClick);
            cancelAnimationFrame(animationId);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            isLevelTransition = false;
            setButtonsEnabled(true);
            
            // Restaurer les boutons seulement si on n'est pas au premier niveau
            if (currentLevel !== 0) {
                if (movesDisplay) movesDisplay.style.display = 'block';
                if (undoButton) undoButton.style.display = 'block';
                if (currentLevel >= 5) {
                    if (hintButton) hintButton.style.display = 'block';
                }
                if (resetButton) resetButton.style.display = 'block';
            }
        }

        document.addEventListener('click', handleClick);

        tutorialImage.onload = () => {
            animate();
        };

        cleanupCongratulationsMessage = cleanup;
    });
}

function initLevel(level) {
    return new Promise(async (resolve) => {
		stopResetHint(); // Arrêter l'animation
        hasFirstClick = false;
		isLevelTransition = false;
        isTransitioning = false;
        updateLevelSelector(level);
		
		 // Si l'écran d'accueil est affiché, ne pas montrer les éléments du jeu
        const homeScreenVisible = document.getElementById('home-screen').style.display === 'block';
        if (!homeScreenVisible) {
            document.getElementById('hexagon-container').style.display = '';
            updateElementsVisibility();
        }
        
        // Nettoyage complet du canvas et du conteneur d'hexagones
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        hexagonContainer.innerHTML = '';
        hexagonContainer.style.display = ''; 
        
        if (level === 'random') {
            const randomLevel = generateRandomLevel(storedRandomLevel.config.clicks, storedRandomLevel.config.tileTypes);
            if (randomLevel) {
                tiles = randomLevel.grid.map((state, index) => ({
                    currentState: state,
                    initialState: randomLevel.initialGrid[index],
                    flipCount: 0
                }));
                remainingMoves = randomLevel.clickSequence.length;
            } else {
                console.error("Impossible de générer un niveau aléatoire.");
                resolve();
                return;
            }
        } else {
            tiles = levels[level].grid.map(state => ({
                currentState: state,
                initialState: state,
                flipCount: 0
            }));
            remainingMoves = levels[level].optimalMoves;
        }
        history = [];
        drawGrid();
        updateMovesDisplay();
        updateStarsDisplay();
        updateElementsVisibility();
		setButtonsEnabled(true);
        
		if (level !== 0 && level !== 'random') {
            //PokiSDK.gameplayStart();
        }
		
        // Utiliser setTimeout pour permettre au navigateur de mettre à jour l'affichage
        setTimeout(() => {
            resolve();
        }, 100);
    });
}

// Fonction de génération de niveau aléatoire
async function initRandomLevel(config) {
    console.log("Entering initRandomLevel");
    hasFirstClick = false;
    
    // Vérifier si l'écran d'accueil est visible
    const homeScreenVisible = document.getElementById('home-screen').style.display === 'block';
    
    // Réinitialiser l'état des indices
    showHints = false;
    if (hintAnimationFrame) {
        cancelAnimationFrame(hintAnimationFrame);
        hintAnimationFrame = null;
    }
    
    // Effacer complètement le canvas et le conteneur d'hexagones
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hexagonContainer.innerHTML = '';
    
    // Forcer l'utilisation d'une grande grille
    currentLevel = 'random';
    
    // Générer le niveau aléatoire
    const randomLevel = generateRandomLevel(config.clicks, config.tileTypes);
    if (randomLevel) {
        console.log("Random level generated:", randomLevel);
        storedRandomLevel = { ...randomLevel, config };
        
        // Créer les tuiles pour la grande grille
        tiles = Array(LARGE_GRID_SIZE).fill().map((_, index) => {
            if (index < randomLevel.grid.length) {
                return {
                    currentState: randomLevel.grid[index],
                    initialState: randomLevel.initialGrid[index],
                    flipCount: 0
                };
            } else {
                return {
                    currentState: 0,
                    initialState: 0,
                    flipCount: 0
                };
            }
        });
        
        remainingMoves = config.clicks;
        history = [];
        
        // N'afficher les éléments que si l'écran d'accueil n'est pas visible
        if (!homeScreenVisible) {
            requestAnimationFrame(() => {
                document.getElementById('hexagon-container').style.display = 'block';
                drawGrid();
                updateMovesDisplay();
                updateStarsDisplay();
                updateElementsVisibility();
                updateLevelSelector('random');
            });
        }
        
    } else {
        console.error("Impossible de générer un niveau aléatoire.");
        alert("Échec de la génération du niveau aléatoire. Retour au niveau précédent.");
    }
    
    setButtonsEnabled(!homeScreenVisible);
}


// Mécaniques de retournement de tuiles
function flipTile(tileIndex, flipperState) {
    const tile = tiles[tileIndex];

    if (tile.currentState === 7) {
        return; // La tuile 7 ne change jamais d'état
    }

    if (tile.currentState !== 1 || tile.flipCount % 2 === 1) {
        tile.flipCount++;
    }

    if (tile.initialState === 2) {
        if (tile.flipCount === 1) {
            tile.currentState = 1;
        } else if (tile.flipCount === 2) {
            tile.currentState = 0;
        } else {
            tile.currentState = tile.currentState === 1 ? 0 : 1;
        }
    } else if (tile.initialState === 1) {
        tile.currentState = tile.currentState === 1 ? 0 : 1;
    } else {
        tile.currentState = tile.flipCount % 2 === 1 ? 1 : tile.initialState;
    }
}


function flipAdjacentTiles(tileIndex) {
    const adjacentTiles = getAdjacentTiles(tileIndex);
    const flipperState = tiles[tileIndex].currentState;
    adjacentTiles.forEach(tile => {
        flipTile(tile, flipperState);
    });
}

function flipTwoRowsOfTiles(tileIndex) {
    const adjacentTiles = getAdjacentTiles(tileIndex);
    const secondRowTiles = getSecondRowTiles(tileIndex);
    const allTilesToFlip = [...new Set([...adjacentTiles, ...secondRowTiles])];
    const flipperState = gameState[tileIndex];

    allTilesToFlip.forEach(tile => {
        if (tile !== tileIndex) {
            flipTile(tile, flipperState);
        }
    });
}

function flipVerticalColumnTiles(tileIndex) {
    const columnTiles = getVerticalColumnTiles(tileIndex);
    const flipperState = gameState[tileIndex];
    columnTiles.forEach(tile => {
        flipTile(tile, flipperState);
    });
}

function flipDiagonalTiles(tileIndex, getDiagonalTiles) {
    const diagonalTiles = getDiagonalTiles(tileIndex);
    const flipperState = gameState[tileIndex];
    diagonalTiles.forEach(tile => {
        flipTile(tile, flipperState);
    });
}

function rotateAdjacentTiles(tileIndex) {
    const adjacentTiles = getAdjacentTiles(tileIndex);
    
    if (adjacentTiles.length < 3) return;

    const clickedPos = isSmallGrid(currentLevel) ? smallHexPositions[tileIndex] : largeHexPositions[tileIndex];
    const sortedTiles = adjacentTiles.sort((a, b) => {
        const posA = isSmallGrid(currentLevel) ? smallHexPositions[a] : largeHexPositions[a];
        const posB = isSmallGrid(currentLevel) ? smallHexPositions[b] : largeHexPositions[b];
        const angleA = Math.atan2(posA.y - clickedPos.y, posA.x - clickedPos.x);
        const angleB = Math.atan2(posB.y - clickedPos.y, posB.x - clickedPos.x);
        return angleA - angleB;
    });

    const tempTiles = sortedTiles.map(index => ({ ...tiles[index] }));
    
    for (let i = 0; i < sortedTiles.length; i++) {
        const prevIndex = (i - 1 + sortedTiles.length) % sortedTiles.length;
        tiles[sortedTiles[i]] = tempTiles[prevIndex];
    }
}


function updateMovesDisplay() {
    const movesDisplay = document.getElementById('moves-display');
    movesDisplay.style.color = remainingMoves < 0 ? '#ff9999' : 'lightyellow';
    movesDisplay.textContent = `Remaining moves: ${remainingMoves}`;
    movesDisplay.style.position = 'absolute';
    movesDisplay.style.top = '58px';
    movesDisplay.style.left = '0';
    movesDisplay.style.right = '0';
    movesDisplay.style.textAlign = 'center';
    movesDisplay.style.fontSize = '12px';
    movesDisplay.style.fontStyle = 'italic';

    // Démarrer l'animation si les coups restants sont -3 ou moins
    if (remainingMoves <= -3) {
        startResetHint();
    } else {
        stopResetHint();
    }
}

function playFlipSound() {
    flipSound.currentTime = 0;
    flipSound.play().catch(error => {
        console.log("Erreur lors de la lecture du son :", error);
    });
}

function setFlipSoundVolume(volume) {
    flipSound.volume = Math.max(0, Math.min(1, volume));  // Assurez-vous que le volume est entre 0 et 1
}

setFlipSoundVolume(0.3);  // Définir le volume à 50%

function animateFlip(tileIndex) {
    return new Promise(resolve => {
        isFlipping = true;
        const adjacentTiles = getAdjacentTiles(tileIndex);
        const clickedPos = isSmallGrid(currentLevel) ? smallHexPositions[tileIndex] : largeHexPositions[tileIndex];

        adjacentTiles.forEach(index => {
            const hexagon = hexagonContainer.querySelector(`.hexagon[data-index="${index}"]`);
            if (hexagon) {
                const pos = isSmallGrid(currentLevel) ? smallHexPositions[index] : largeHexPositions[index];
                
                // Calculer le vecteur de l'arête connexe
                const edgeVector = {
                    x: clickedPos.x - pos.x,
                    y: clickedPos.y - pos.y
                };

                // Normaliser le vecteur
                const length = Math.sqrt(edgeVector.x * edgeVector.x + edgeVector.y * edgeVector.y);
                edgeVector.x /= length;
                edgeVector.y /= length;

                // L'axe de rotation est perpendiculaire à l'arête connexe
                const rotationAxis = [-edgeVector.y, edgeVector.x, 0];

                // Appliquer la transformation
                hexagon.style.transformOrigin = 'center center';
                hexagon.style.transform = `rotate3d(${rotationAxis.join(',')}, ${Math.PI/2}rad)`;
            }
        });

        setTimeout(() => {
            flipAdjacentTiles(tileIndex);
            updateHexagonStates();
            flipSound.currentTime = 0;
            flipSound.play().then(() => {
                isFlipping = false;
                resolve();
            }).catch(error => {
                console.log("Erreur lors de la lecture du son de flip :", error);
                isFlipping = false;
                resolve();
            });
        }, 250);
    });
}

function getSecondRowTiles(tileIndex) {
    const adjacentTiles = getAdjacentTiles(tileIndex);
    const secondRowTiles = [];
    
    adjacentTiles.forEach(adjTile => {
        const adjTileAdjacents = getAdjacentTiles(adjTile);
        adjTileAdjacents.forEach(secondRowTile => {
            if (!adjacentTiles.includes(secondRowTile) && secondRowTile !== tileIndex) {
                secondRowTiles.push(secondRowTile);
            }
        });
    });
    
    return [...new Set(secondRowTiles)];
}

function animateFlipTwoRows(tileIndex) {
    return new Promise(resolve => {
        isFlipping = true;
        const adjacentTiles = getAdjacentTiles(tileIndex);
        const secondRowTiles = getSecondRowTiles(tileIndex);
        const clickedPos = isSmallGrid(currentLevel) ? smallHexPositions[tileIndex] : largeHexPositions[tileIndex];

        function applyRotation(index, delay = 0) {
            const hexagon = hexagonContainer.querySelector(`.hexagon[data-index="${index}"]`);
            if (hexagon && !hexagon.classList.contains('neutral')) {
                const pos = isSmallGrid(currentLevel) ? smallHexPositions[index] : largeHexPositions[index];
                
                // Calculer le vecteur de l'arête connexe
                const edgeVector = {
                    x: clickedPos.x - pos.x,
                    y: clickedPos.y - pos.y
                };

                // Normaliser le vecteur
                const length = Math.sqrt(edgeVector.x * edgeVector.x + edgeVector.y * edgeVector.y);
                edgeVector.x /= length;
                edgeVector.y /= length;

                // L'axe de rotation est perpendiculaire à l'arête connexe
                const rotationAxis = [-edgeVector.y, edgeVector.x, 0];

                setTimeout(() => {
                    // Appliquer la transformation
                    hexagon.style.transformOrigin = 'center center';
                    hexagon.style.transform = `rotate3d(${rotationAxis.join(',')}, ${Math.PI/2}rad)`;
                }, delay);
            }
        }

        // Animer la première rangée immédiatement
        adjacentTiles.forEach(index => applyRotation(index));

        // Animer la deuxième rangée avec un délai
        secondRowTiles.forEach(index => applyRotation(index, 100)); // 10ms de délai

        setTimeout(() => {
            flipTwoRowsOfTiles(tileIndex);
            updateHexagonStates();
            flipSound.currentTime = 0;
            flipSound.play().then(() => {
                isFlipping = false;
                resolve();
            }).catch(error => {
                console.log("Erreur lors de la lecture du son de flip :", error);
                isFlipping = false;
                resolve();
            });
        }, 350); // Augmenté à 260ms pour prendre en compte le délai de 10ms
    });
}

function animateFlipVerticalColumn(tileIndex) {
    return new Promise(resolve => {
        isFlipping = true;
        const columnTiles = getVerticalColumnTiles(tileIndex);
        const clickedPos = isSmallGrid(currentLevel) ? smallHexPositions[tileIndex] : largeHexPositions[tileIndex];

        // Trier les tuiles par distance par rapport à la tuile cliquée
        columnTiles.sort((a, b) => {
            const posA = isSmallGrid(currentLevel) ? smallHexPositions[a] : largeHexPositions[a];
            const posB = isSmallGrid(currentLevel) ? smallHexPositions[b] : largeHexPositions[b];
            return Math.abs(posA.y - clickedPos.y) - Math.abs(posB.y - clickedPos.y);
        });

        columnTiles.forEach((index, i) => {
            const hexagon = hexagonContainer.querySelector(`.hexagon[data-index="${index}"]`);
            if (hexagon) {
                const pos = isSmallGrid(currentLevel) ? smallHexPositions[index] : largeHexPositions[index];
                
                const verticalVector = {
                    x: 0,
                    y: clickedPos.y - pos.y
                };

                const length = Math.abs(verticalVector.y);
                verticalVector.y /= length;

                const rotationAxis = [1, 0, 0];

                setTimeout(() => {
                    hexagon.style.transformOrigin = 'center center';
                    hexagon.style.transform = `rotate3d(${rotationAxis.join(',')}, ${Math.PI/2}rad)`;
                }, i * 50); // Délai progressif
            }
        });

        setTimeout(() => {
            flipVerticalColumnTiles(tileIndex);
            updateHexagonStates();
            flipSound.currentTime = 0;
            flipSound.play().then(() => {
                isFlipping = false;
                resolve();
            }).catch(error => {
                console.log("Erreur lors de la lecture du son de flip :", error);
                isFlipping = false;
                resolve();
            });
        }, columnTiles.length * 50 + 250);
    });
}

function animateFlipDiagonal(tileIndex, getDiagonalTiles) {
    return new Promise(resolve => {
        isFlipping = true;
        const diagonalTiles = getDiagonalTiles(tileIndex);
        const clickedPos = isSmallGrid(currentLevel) ? smallHexPositions[tileIndex] : largeHexPositions[tileIndex];

        // Trier les tuiles par distance par rapport à la tuile cliquée
        diagonalTiles.sort((a, b) => {
            const posA = isSmallGrid(currentLevel) ? smallHexPositions[a] : largeHexPositions[a];
            const posB = isSmallGrid(currentLevel) ? smallHexPositions[b] : largeHexPositions[b];
            const distA = Math.sqrt(Math.pow(posA.x - clickedPos.x, 2) + Math.pow(posA.y - clickedPos.y, 2));
            const distB = Math.sqrt(Math.pow(posB.x - clickedPos.x, 2) + Math.pow(posB.y - clickedPos.y, 2));
            return distA - distB;
        });

        diagonalTiles.forEach((index, i) => {
            const hexagon = hexagonContainer.querySelector(`.hexagon[data-index="${index}"]`);
            if (hexagon) {
                const pos = isSmallGrid(currentLevel) ? smallHexPositions[index] : largeHexPositions[index];
                
                const diagonalVector = {
                    x: clickedPos.x - pos.x,
                    y: clickedPos.y - pos.y
                };

                const length = Math.sqrt(diagonalVector.x * diagonalVector.x + diagonalVector.y * diagonalVector.y);
                diagonalVector.x /= length;
                diagonalVector.y /= length;

                const rotationAxis = [-diagonalVector.y, diagonalVector.x, 0];

                setTimeout(() => {
                    hexagon.style.transformOrigin = 'center center';
                    hexagon.style.transform = `rotate3d(${rotationAxis.join(',')}, ${Math.PI/2}rad)`;
                }, i * 50); // Délai progressif
            }
        });

        setTimeout(() => {
            flipDiagonalTiles(tileIndex, getDiagonalTiles);
            updateHexagonStates();
            flipSound.currentTime = 0;
            flipSound.play().then(() => {
                isFlipping = false;
                resolve();
            }).catch(error => {
                console.log("Erreur lors de la lecture du son de flip :", error);
                isFlipping = false;
                resolve();
            });
        }, diagonalTiles.length * 50 + 250);
    });
}

function drawRotationSymbol(ctx, x, y, size) {
    const circleRadius = size * 0.6;
    const dotRadius = 3;
    
    // Dessiner le grand cercle
    ctx.beginPath();
    ctx.arc(x, y, circleRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'cyan';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Calculer la position du point en rotation
    const dotX = x + circleRadius * Math.cos(rotationAngle);
    const dotY = y + circleRadius * Math.sin(rotationAngle);
    
    // Dessiner le point
    ctx.beginPath();
    ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'cyan';
    ctx.fill();
}

function animateRotationSymbol() {
    const hexagons = document.querySelectorAll('.hexagon');
    hexagons.forEach(hexagon => {
        const canvas = hexagon.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        const state = parseInt(hexagon.dataset.state);
        
        if (state === 7) {
            const size = canvas.width / 2;
            const circleRadius = size * 0.6; // Grand cercle
            const dotRadius = 3; // Taille du point en pixels
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawHexagon(ctx, size, size, size, state);
            
            ctx.save();
            ctx.translate(size, size);
            
            // Dessiner le grand cercle
            ctx.beginPath();
            ctx.arc(0, 0, circleRadius, 0, Math.PI * 2);
            ctx.strokeStyle = 'cyan';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Calculer la position du point en rotation
            const dotX = circleRadius * Math.cos(rotationAngle);
            const dotY = circleRadius * Math.sin(rotationAngle);
            
            // Dessiner le point
            ctx.beginPath();
            ctx.arc(dotX, dotY, dotRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'cyan';
            ctx.fill();
            
            ctx.restore();
        }
    });
    
    rotationAngle += 0.05;
    if (rotationAngle >= Math.PI * 2) {
        rotationAngle = 0;
    }
    
    requestAnimationFrame(animateRotationSymbol);
}

function animateRotation(tileIndex) {
    return new Promise(resolve => {
        isFlipping = true;
        const adjacentTiles = getAdjacentTiles(tileIndex);
        const clickedPos = isSmallGrid(currentLevel) ? smallHexPositions[tileIndex] : largeHexPositions[tileIndex];
        
        const tilesToRotate = adjacentTiles.sort((a, b) => {
            const posA = isSmallGrid(currentLevel) ? smallHexPositions[a] : largeHexPositions[a];
            const posB = isSmallGrid(currentLevel) ? smallHexPositions[b] : largeHexPositions[b];
            const angleA = Math.atan2(posA.y - clickedPos.y, posA.x - clickedPos.x);
            const angleB = Math.atan2(posB.y - clickedPos.y, posB.x - clickedPos.x);
            return angleA - angleB;
        });
        
        const duration = 800; // ms
        const startTime = Date.now();

        const tilePositions = tilesToRotate.map((index, i) => {
            const startPos = isSmallGrid(currentLevel) ? smallHexPositions[index] : largeHexPositions[index];
            const endIndex = (i + 1) % tilesToRotate.length;
            const endPos = isSmallGrid(currentLevel) ? smallHexPositions[tilesToRotate[endIndex]] : largeHexPositions[tilesToRotate[endIndex]];
            return { start: startPos, end: endPos };
        });

        // Nouvelle fonction d'accélération plus agressive
        function customEase(t) {
            return 1 - Math.pow(1 - t, 7);
        }

        function moveStep() {
            const elapsedTime = Date.now() - startTime;
            const rawProgress = Math.min(elapsedTime / duration, 1);
            const progress = customEase(rawProgress);

            if (rawProgress < 1) {
                tilesToRotate.forEach((index, i) => {
                    const hexagon = hexagonContainer.querySelector(`.hexagon[data-index="${index}"]`);
                    if (hexagon) {
                        const { start, end } = tilePositions[i];
                        const currentX = start.x + (end.x - start.x) * progress;
                        const currentY = start.y + (end.y - start.y) * progress;
                        
                        const moveX = (currentX - start.x) * TILE_SIZE * 1.75;
                        const moveY = (currentY - start.y) * TILE_SIZE * 1.75;
                        
                        hexagon.style.transform = `translate(${moveX}px, ${moveY}px)`;
                    }
                });

                requestAnimationFrame(moveStep);
            } else {
                rotateAdjacentTiles(tileIndex);
                drawGrid();
                flipSound.currentTime = 0;
                flipSound.play().then(() => {
                    isFlipping = false;
                    resolve();
                }).catch(error => {
                    console.log("Erreur lors de la lecture du son de flip :", error);
                    isFlipping = false;
                    resolve();
                });
            }
        }

        moveStep();
    });
}


// Affichage du niveau en cours

function drawLevelText() {
    const centerX = canvas.width / 2;
    
    // Afficher le numéro du niveau ou "Random Level"
    ctx.fillStyle = 'white';
    ctx.font = '18px Blouse';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    if (currentLevel === 'random') {
        ctx.fillText('Random Level', centerX, 10);
    } else {
        const worlds = getWorldInfo();
        const currentWorldNum = levels[currentLevel].world;
        const worldName = worlds[currentWorldNum].name;
        const relativeLevel = currentLevel - worlds[currentWorldNum].startLevel + 1;
        ctx.fillText(`${worldName} - Level ${relativeLevel}`, centerX, 13);
    }
    
    // Afficher la difficulté
    let difficulty = currentLevel === 'random' ? 
        storedRandomLevel.config.difficulty : 
        levels[currentLevel].difficulty;
    
    let difficultyColor;
    switch(difficulty) {
        case 'easy':
            difficultyColor = '#81edbf';
            break;
        case 'medium':
            difficultyColor = '#e8fda0';
            break;
        case 'hard':
            difficultyColor = '#c91f8b';
            break;
        case 'Tutorial':
            difficultyColor = '#aaffff';
            break;
        default:
            difficultyColor = 'white';
    }
    
    ctx.font = '12px Blouse';
    ctx.fillStyle = difficultyColor;
    ctx.textAlign = 'center';
    ctx.fillText(`${difficulty.toUpperCase()}`, centerX, 43);
}
    

function updateHexagonStates() {
    const hexagons = hexagonContainer.querySelectorAll('.hexagon:not(#neutral-container .hexagon)');
    hexagons.forEach((hexagon, index) => {
        const front = hexagon.children[0];
        const back = hexagon.children[1];
        const frontCtx = front.getContext('2d');
        frontCtx.clearRect(0, 0, front.width, front.height);
        drawHexagon(frontCtx, front.width / 2, front.height / 2, front.width / 2, tiles[index].currentState);
        
        if (tiles[index].currentState === 7) {
            drawRotationSymbol(frontCtx, front.width / 2, front.height / 2, front.width / 2);
        }
        
        // Redessiner le curseur d'indice uniquement si nécessaire
        if (hintPositions[currentLevel] && 
            hintPositions[currentLevel].includes(index) &&
            (currentLevel < 5 || showHints)) {
            drawHintCursor(frontCtx, front.width/2, front.height/2, front.width/2, hintOpacity);
        }
        
        if (back) {
            const backCtx = back.getContext('2d');
            backCtx.clearRect(0, 0, back.width, back.height);
            drawHexagon(backCtx, back.width / 2, back.height / 2, back.width / 2, (tiles[index].currentState + 1) % 3);
        }
        hexagon.style.transform = 'none'; // Réinitialiser la transformation
        hexagon.dataset.state = tiles[index].currentState; // Mettre à jour l'attribut data-state
    });
    
    drawLevelText();

    // Redémarrer l'animation des indices si elle n'est pas déjà en cours
    if (!hintAnimationFrame && 
        hintPositions[currentLevel] && 
        (currentLevel < 5 || showHints)) {
        animateHintCursors();
    }
}

async function handleClick(x, y) {
    if (isLevelTransition || isFlipping || isTransitioning) return;

    const clickedTile = getTileFromCoordinates(x, y);
    if (clickedTile !== -1) {
        if (!hasFirstClick && currentLevel === 0) {
            hasFirstClick = true;
            //PokiSDK.gameplayStart();
        }
		
		// Réinitialiser les indices pour les niveaux aléatoires
        if (currentLevel === 'random') {
            showHints = false;
            currentHintIndex = 0;
            if (hintAnimationFrame) {
                cancelAnimationFrame(hintAnimationFrame);
                hintAnimationFrame = null;
            }
            // Réactiver le bouton d'indices
            const hintButton = document.getElementById('hint-btn');
            isHintButtonActive = true;
            hintButton.style.opacity = '1';
            hintButton.style.cursor = 'pointer';
        }
        
        // Si on est au niveau 0 et qu'on clique sur la tuile 3, on supprime la main
        if (currentLevel === 0 && clickedTile === 3) {
            const tutorialCursor = document.getElementById('tutorial-cursor');
            if (tutorialCursor) {
                tutorialCursor.remove();
            }
        }
        
        wasAnimating = hintAnimationFrame !== null;
        
        // Vérifier si le clic est incorrect dans les premiers niveaux
        if (currentLevel < 5 && 
            hintPositions[currentLevel] && 
            !hintPositions[currentLevel].includes(clickedTile)) {
            
            // Activer le clignotement d'erreur
            isErrorBlinking = true;
            
            // Réinitialiser le timer précédent si existant
            if (errorBlinkTimeout) {
                clearTimeout(errorBlinkTimeout);
            }
            
            // Arrêter le clignotement d'erreur après 1.5 secondes
            errorBlinkTimeout = setTimeout(() => {
                isErrorBlinking = false;
            }, 1500);

            // Redémarrer l'animation des indices si c'est un mauvais clic
            if (hintAnimationFrame) {
                cancelAnimationFrame(hintAnimationFrame);
                hintAnimationFrame = null;
            }
            animateHintCursors();
            return; // On arrête ici si c'est un mauvais clic
        }

        const clickedTileState = tiles[clickedTile].currentState;
        
        // Ne désactiver les indices que pour les niveaux non tutoriels ou la tuile 3 du niveau 0
        if (currentLevel >= 5 || (currentLevel === 0 && clickedTile === 3)) {
            // Réinitialiser l'état des indices et du bouton
            showHints = false;
            currentHintIndex = 0;
            if (hintAnimationFrame) {
                cancelAnimationFrame(hintAnimationFrame);
                hintAnimationFrame = null;
            }
            const hintButton = document.getElementById('hint-btn');
            isHintButtonActive = true;
            hintButton.style.opacity = '1';
            hintButton.style.cursor = 'pointer';
        }
        
        if (clickedTileState === 0 || clickedTileState === 3 || 
            clickedTileState === 4 || clickedTileState === 5 || 
            clickedTileState === 6 || clickedTileState === 7) {
                
            // Désactiver le clignotement d'erreur si le clic est correct
            if (hintPositions[currentLevel] && 
                hintPositions[currentLevel].includes(clickedTile)) {
                isErrorBlinking = false;
                if (errorBlinkTimeout) {
                    clearTimeout(errorBlinkTimeout);
                }
            }

            history.push(tiles.map(tile => ({ ...tile })));
            remainingMoves--;
            updateMovesDisplay();

            let impactedTiles = [];
            switch (clickedTileState) {
                case 0:
                    impactedTiles = getAdjacentTiles(clickedTile);
                    await animateFlip(clickedTile);
                    break;
                case 3:
                    impactedTiles = [...getAdjacentTiles(clickedTile), ...getSecondRowTiles(clickedTile)];
                    await animateFlipTwoRows(clickedTile);
                    break;
                case 4:
                    impactedTiles = getVerticalColumnTiles(clickedTile);
                    await animateFlipVerticalColumn(clickedTile);
                    break;
                case 5:
                    impactedTiles = getDiagonalTilesTopLeftToBottomRight(clickedTile);
                    await animateFlipDiagonal(clickedTile, getDiagonalTilesTopLeftToBottomRight);
                    break;
                case 6:
                    impactedTiles = getDiagonalTilesBottomLeftToTopRight(clickedTile);
                    await animateFlipDiagonal(clickedTile, getDiagonalTilesBottomLeftToTopRight);
                    break;
                case 7:
                    impactedTiles = getAdjacentTiles(clickedTile);
                    await animateRotation(clickedTile);
                    break;
            }

            await checkWinCondition();
        }

        // Réanimer les indices pour les niveaux tutoriels (sauf la tuile 3 du niveau 0)
        // ou pour les niveaux normaux si les indices étaient actifs
        if (wasAnimating && 
            hintPositions[currentLevel] && 
            ((currentLevel < 5 && !(currentLevel === 0 && clickedTile === 3)) || 
            (currentLevel >= 5 && showHints))) {
            animateHintCursors();
        }
    }
}



function getTileFromCoordinates(x, y) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    const hexPositions = isSmallGrid(currentLevel) ? smallHexPositions : largeHexPositions;
    const gridSize = isSmallGrid(currentLevel) ? SMALL_GRID_SIZE : LARGE_GRID_SIZE;
    
    for (let i = 0; i < gridSize; i++) {
        const hx = centerX + hexPositions[i].x * TILE_SIZE * 1.75;
        const hy = centerY + hexPositions[i].y * TILE_SIZE * 1.75;
        const dx = x - hx;
        const dy = y - hy;
        if (dx*dx + dy*dy < TILE_SIZE*TILE_SIZE) {
            return i;
        }
    }
    return -1;
}

function getAdjacentTiles(tileIndex) {
  const smallAdjacencyMap = [
    [1, 2, 3],          // Haut
    [0, 3, 4],          // Haut-droite
    [0, 3, 5],          // Haut-gauche
    [0, 1, 2, 4, 5, 6], // Centre
    [1, 3, 6],          // Bas-droite
    [2, 3, 6],          // Bas-gauche
    [3, 4, 5]           // Bas
  ];
  
  const largeAdjacencyMap = [
    [1, 2, 4],             // 0
    [0, 3, 4, 6],          // 1
    [0, 4, 5, 7],          // 2
    [1, 6, 8],             // 3
    [0, 1, 2, 6, 7, 9],    // 4
    [2, 7, 10],            // 5
    [1, 3, 4, 8, 9, 11],   // 6
    [2, 4, 5, 9, 10, 12],  // 7
    [3, 6, 11, 13],        // 8
    [4, 6, 7, 11, 12, 14], // 9
    [5, 7, 12, 15],        // 10
    [6, 8, 9, 13, 14, 16], // 11
    [7, 9, 10, 14, 15, 17],// 12
    [8, 11, 16],           // 13
    [9, 11, 12, 16, 17, 18], // 14
    [10, 12, 17],          // 15
    [11, 13, 14, 18],      // 16
    [12, 14, 15, 18],      // 17
    [14, 16, 17]           // 18
  ];

  return isSmallGrid(currentLevel) ? smallAdjacencyMap[tileIndex] : largeAdjacencyMap[tileIndex];
}

function getVerticalColumnTiles(tileIndex) {
    const gridSize = isSmallGrid(currentLevel) ? SMALL_GRID_SIZE : LARGE_GRID_SIZE;
    const columnTiles = [];
    
    for (let i = 0; i < gridSize; i++) {
        if (i !== tileIndex && (isSmallGrid(currentLevel) ? smallHexPositions[i].x === smallHexPositions[tileIndex].x : largeHexPositions[i].x === largeHexPositions[tileIndex].x)) {
            columnTiles.push(i);
        }
    }
    
    return columnTiles;
}

function getDiagonalTilesTopLeftToBottomRight(tileIndex) {
    const positions = isSmallGrid(currentLevel) ? smallHexPositions : largeHexPositions;
    const gridSize = isSmallGrid(currentLevel) ? SMALL_GRID_SIZE : LARGE_GRID_SIZE;
    const diagonalTiles = [];
    
    const clickedX = positions[tileIndex].x;
    const clickedY = positions[tileIndex].y;
    
    for (let i = 0; i < gridSize; i++) {
        if (i !== tileIndex) {
            const dx = positions[i].x - clickedX;
            const dy = positions[i].y - clickedY;
            // Vérifier si la tuile est sur la même diagonale (du haut-gauche au bas-droite)
            if (Math.abs(dx - dy * Math.sqrt(3)) < 0.001) {
                diagonalTiles.push(i);
            }
        }
    }
    
    return diagonalTiles;
}

function getDiagonalTilesBottomLeftToTopRight(tileIndex) {
    const positions = isSmallGrid(currentLevel) ? smallHexPositions : largeHexPositions;
    const gridSize = isSmallGrid(currentLevel) ? SMALL_GRID_SIZE : LARGE_GRID_SIZE;
    const diagonalTiles = [];
    
    const clickedX = positions[tileIndex].x;
    const clickedY = positions[tileIndex].y;
    
    for (let i = 0; i < gridSize; i++) {
        if (i !== tileIndex) {
            const dx = positions[i].x - clickedX;
            const dy = positions[i].y - clickedY;
            // Vérifier si la tuile est sur la même diagonale (du bas-gauche au haut-droite)
            if (Math.abs(dx + dy * Math.sqrt(3)) < 0.001) {
                diagonalTiles.push(i);
            }
        }
    }
    
    return diagonalTiles;
}

// Animation des étoiles vers le compteur
function animateStarsToCounter(starsEarned) {
    return new Promise(resolve => {
        if (starsEarned === 0) {
            resolve();
            return;
        }

        // Utiliser directement le canvas pour le positionnement initial
		const canvasRect = canvas.getBoundingClientRect();
        const startX = canvasRect.left + canvas.width / 2;  
        const startY = canvasRect.top + canvas.height / 2 + 60;   

        const starsContainer = document.createElement('div');
        starsContainer.style.position = 'fixed';
        starsContainer.style.top = '0';
        starsContainer.style.left = '0';
        starsContainer.style.width = '100%';
        starsContainer.style.height = '100%';
        starsContainer.style.pointerEvents = 'none';
        starsContainer.style.zIndex = '10001';
        document.body.appendChild(starsContainer);

        // Position finale (compteur d'étoiles)
        const starsDisplay = document.getElementById('stars-display');
        const targetRect = starsDisplay.getBoundingClientRect();
        const targetX = targetRect.right - 20;
        const targetY = targetRect.top + targetRect.height / 2;

        // Créer les étoiles
        const stars = [];
        const duration = 400;
        const delayBetweenStars = 100;

        for (let i = 0; i < starsEarned; i++) {
            const star = document.createElement('div');
            star.textContent = '★';
            star.style.position = 'absolute';
            star.style.fontSize = '24px';
            star.style.color = '#DDC76E';
			star.style.textShadow = '0 0 5px rgba(0, 0, 0, 1)';
            star.style.transform = 'translate(-50%, -50%)';
            star.style.opacity = '0.5';
            star.style.transition = 'all 0.5s ease-out';
            starsContainer.appendChild(star);

            star.style.left = `${startX}px`;
            star.style.top = `${startY}px`;

            stars.push({
                element: star,
                startTime: performance.now() + (i * delayBetweenStars),
                startX: startX,
                startY: startY,
                targetX: targetX,
                targetY: targetY
            });
        }

        function animate(currentTime) {
            let allComplete = true;

            stars.forEach(star => {
                if (currentTime < star.startTime) {
                    allComplete = false;
                    return;
                }

                const elapsed = currentTime - star.startTime;
                if (elapsed >= duration) return;

                allComplete = false;
                const progress = elapsed / duration;
                
                const controlX = star.startX + (star.targetX - star.startX) * 0.5;
                const controlY = Math.min(star.startY, star.targetY) - 150;

                const t = progress;
                const x = Math.pow(1-t, 2) * star.startX + 
                         2 * (1-t) * t * controlX + 
                         Math.pow(t, 2) * star.targetX;
                const y = Math.pow(1-t, 2) * star.startY + 
                         2 * (1-t) * t * controlY + 
                         Math.pow(t, 2) * star.targetY;

                star.element.style.left = `${x}px`;
                star.element.style.top = `${y}px`;
                star.element.style.opacity = Math.min(1, 2 * (1 - progress));
                star.element.style.transform = `translate(-50%, -50%) scale(${1 - 0.2 * progress})`;
            });

            if (!allComplete) {
                requestAnimationFrame(animate);
            } else {
                setTimeout(() => {
                    starsContainer.remove();
                    resolve();
                }, 500);
            }
        }

        requestAnimationFrame(animate);
    });
}

// Fenêtre de félicitations en fin de niveau
function showCongratulationsMessage(level, starsEarned) {
	//PokiSDK.gameplayStop();
    return new Promise(resolve => {
		
		const movesDisplay = document.getElementById('moves-display');
        const undoButton = document.getElementById('undo-btn');
		const hintButton = document.getElementById('hint-btn');
        const resetButton = document.getElementById('reset-btn');
		const homeButton = document.getElementById('home-button');
		const BUTTON_WIDTH = 140;
		const BUTTON_SPACING = 20; 
        
        if (movesDisplay) movesDisplay.style.display = 'none';
        if (undoButton) undoButton.style.display = 'none';
		if (hintButton) hintButton.style.display = 'none';
        if (resetButton) resetButton.style.display = 'none';
		if (homeButton) { // Ajout
            homeButton.style.display = 'none';
            homeButton.style.pointerEvents = 'none';
        }
		
        let opacity = 0;
        let animationComplete = false;
        let perfectScoreOpacity = 1;
        let animationId;
        let time = 0;
        let hoveredButton = null;
        
        function drawMessage() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.fillStyle = `rgba(0, 10, 20, ${opacity * 0.3})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.restore();

            ctx.textAlign = 'center';
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;

            // Message spécial pour le niveau 4 fin du tutorial
            ctx.font = '26px Blouse';
            if (level === 5) { // niveau 4 (index = 4)
                ctx.fillText('Tutorial completed ✓', canvas.width / 2, canvas.height / 2 - 80);
            } else {
                ctx.fillText('Congratulations!', canvas.width / 2, canvas.height / 2 - 80);
            }

            ctx.font = 'Italic 16px Blouse';
			if (level === 'Random') {
				ctx.fillText(`Random level completed!`, canvas.width / 2, canvas.height / 2 - 40);
			} else {
				const worlds = getWorldInfo();
				const currentWorldNum = levels[level - 1].world;
				const worldName = worlds[currentWorldNum].name;
				const relativeLevel = level - worlds[currentWorldNum].startLevel;
				ctx.fillText(`You completed ${worldName} - Level ${relativeLevel}.`, canvas.width / 2, canvas.height / 2 - 40);
			}

            if (level === 'Random') {
                ctx.font = 'italic 14px Blouse, sans-serif';
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                if (remainingMoves >= 0) {
                    perfectScoreOpacity = 0.8 + 0.2 * Math.sin(time);
                    ctx.fillStyle = `rgba(255, 215, 0, ${perfectScoreOpacity})`;
                    ctx.fillText("Perfect! Optimal number of moves!", canvas.width / 2, canvas.height / 2);
                } else {
                    ctx.fillText(`You completed the level in ${storedRandomLevel.clickSequence.length - remainingMoves} moves.`, canvas.width / 2, canvas.height / 2);
					ctx.fillText(`You can do better...`, canvas.width / 2, (canvas.height / 2) +20);
                }
            } else {
                if (starsEarned === 3) {
                    ctx.font = 'italic 14px Blouse, sans-serif';
                    perfectScoreOpacity = 0.8 + 0.2 * Math.sin(time);
                    ctx.fillStyle = `rgba(255, 215, 0, ${perfectScoreOpacity})`;
                    ctx.fillText("Perfect! Optimal number of moves!", canvas.width / 2, canvas.height / 2);
                } else {
                    ctx.font = 'italic 14px Blouse, sans-serif';
                    ctx.fillStyle = `rgba(192, 192, 192, ${opacity})`;
                    ctx.fillText("... but you can do this with less moves ...", canvas.width / 2, canvas.height / 2);
                }
                ctx.fillStyle = `rgba(221, 199, 110, ${opacity})`;
                ctx.fillText(`Stars earned:`, canvas.width / 2, canvas.height / 2 + 40);
				ctx.font = '16px Blouse, sans-serif';
				ctx.fillText(`${'★'.repeat(starsEarned)}${'☆'.repeat(3-starsEarned)}`, canvas.width / 2, canvas.height / 2 + 60);
            }

            // Dessiner les boutons
			if (level === 'Random') {
				if (remainingMoves >= 0) {
					// Un seul bouton centré
					drawButton("New random level", canvas.width / 2, canvas.height / 2 + 120, BUTTON_WIDTH, 40, hoveredButton === 'new');
				} else {
					// Deux boutons avec espacement réduit
					drawButton("← Try again", canvas.width / 2 - (BUTTON_WIDTH/2 + BUTTON_SPACING), canvas.height / 2 + 120, BUTTON_WIDTH, 40, hoveredButton === 'try');
					drawButton("New random level", canvas.width / 2 + (BUTTON_WIDTH/2 + BUTTON_SPACING), canvas.height / 2 + 120, BUTTON_WIDTH, 40, hoveredButton === 'new');
				}
			} else {
				// Pour les niveaux non aléatoires
				if (starsEarned < 3) {
					// Deux boutons avec espacement réduit
					drawButton("← Try again", canvas.width / 2 - (BUTTON_WIDTH/2 + BUTTON_SPACING), canvas.height / 2 + 120, BUTTON_WIDTH, 40, hoveredButton === 'try');
					drawButton("Next level →", canvas.width / 2 + (BUTTON_WIDTH/2 + BUTTON_SPACING), canvas.height / 2 + 120, BUTTON_WIDTH, 40, hoveredButton === 'next');
				} else {
					// Un seul bouton centré
					drawButton("Next level →", canvas.width / 2, canvas.height / 2 + 120, BUTTON_WIDTH, 40, hoveredButton === 'next');
				}
			}
        }

		function drawButton(text, x, y, width, height, isHovered) {
			const buttonWidth = 160;  
			const buttonHeight = 40;  
			ctx.fillStyle = isHovered ? 'rgba(0, 70, 70, ' + opacity + ')' : 'rgba(0, 50, 50, ' + opacity + ')';
			ctx.fillRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight);
			ctx.strokeStyle = 'rgba(0, 255, 255, ' + opacity + ')';
			ctx.strokeRect(x - buttonWidth/2, y - buttonHeight/2, buttonWidth, buttonHeight);
			ctx.fillStyle = 'rgba(0, 255, 255, ' + opacity + ')';
			ctx.font = '13px Blouse';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText(text, x, y);
		}

        function animate() {
            if (opacity < 1) {
                opacity += 0.05;
            } else if (!animationComplete) {
                animationComplete = true;
            }

            time += 0.03;

            drawMessage();
            animationId = requestAnimationFrame(animate);
        }

        animate();

		async function handleClick(event) {
			if (animationComplete) {
				if (level === 'Random') {
					if (remainingMoves >= 0) {
						cleanup();
						//PokiSDK.gameplayStart();
						resolve({ action: 'newRandom', starsEarned: 0 });
					} else {
						const rect = canvas.getBoundingClientRect();
						const x = event.clientX - rect.left;
						const y = event.clientY - rect.top;
						if (y > canvas.height / 2 + 100 && y < canvas.height / 2 + 140) {
							if (x > canvas.width / 2 - 170 && x < canvas.width / 2 - 30) {
								cleanup();
								//PokiSDK.gameplayStart();
								resolve({ action: 'retry', starsEarned: 0 });
							} else if (x > canvas.width / 2 + 30 && x < canvas.width / 2 + 170) {
								cleanup();
								//PokiSDK.gameplayStart();
								resolve({ action: 'newRandom', starsEarned: 0 });
							}
						}
					}
				} else {
					if (starsEarned < 3) {
						const rect = canvas.getBoundingClientRect();
						const x = event.clientX - rect.left;
						const y = event.clientY - rect.top;
						if (y > canvas.height / 2 + 100 && y < canvas.height / 2 + 140) {
							if (x > canvas.width / 2 - 170 && x < canvas.width / 2 - 30) {
								cleanup();
								resolve({ action: 'retry', starsEarned: 0 });
							} else {
								cleanup();
								resolve({ action: 'next', starsEarned: starsEarned });
							}
						} else {
							cleanup();
							resolve({ action: 'next', starsEarned: starsEarned });
						}
					} else {
						cleanup();
						resolve({ action: 'next', starsEarned: starsEarned });
					}
				}
			}
		}

		function handleMouseMove(event) {
			const rect = canvas.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			if (y > canvas.height / 2 + 100 && y < canvas.height / 2 + 140) {
				const centerX = canvas.width / 2;
				const buttonLeft = centerX - (BUTTON_WIDTH/2 + BUTTON_SPACING/2);
				const buttonRight = centerX + (BUTTON_WIDTH/2 + BUTTON_SPACING/2);

				if (level === 'Random') {
					if (remainingMoves >= 0) {
						hoveredButton = x > centerX - BUTTON_WIDTH/2 && x < centerX + BUTTON_WIDTH/2 ? 'new' : null;
					} else {
						if (x > buttonLeft - BUTTON_WIDTH/2 && x < buttonLeft + BUTTON_WIDTH/2) {
							hoveredButton = 'try';
						} else if (x > buttonRight - BUTTON_WIDTH/2 && x < buttonRight + BUTTON_WIDTH/2) {
							hoveredButton = 'new';
						} else {
							hoveredButton = null;
						}
					}
				} else if (starsEarned < 3) {
					if (x > buttonLeft - BUTTON_WIDTH/2 && x < buttonLeft + BUTTON_WIDTH/2) {
						hoveredButton = 'try';
					} else if (x > buttonRight - BUTTON_WIDTH/2 && x < buttonRight + BUTTON_WIDTH/2) {
						hoveredButton = 'next';
					} else {
						hoveredButton = null;
					}
				} else {
					hoveredButton = x > centerX - BUTTON_WIDTH/2 && x < centerX + BUTTON_WIDTH/2 ? 'next' : null;
				}
			} else {
				hoveredButton = null;
			}
		}
		
		function cleanup() {
			document.removeEventListener('click', handleClick);
			cancelAnimationFrame(animationId);
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			isLevelTransition = false;
			setButtonsEnabled(true);
			
			// Restaurer les boutons seulement si on n'est pas au premier niveau
			if (currentLevel !== 0) {
				if (movesDisplay) movesDisplay.style.display = 'block';
				if (undoButton) undoButton.style.display = 'block';
				if (currentLevel >= 5 || level === 'Random') { 
					if (hintButton) hintButton.style.display = 'block';
				}
				if (resetButton) resetButton.style.display = 'block';
				if (homeButton) { // Ajout
					homeButton.style.display = 'block';
					homeButton.style.pointerEvents = 'auto';
				}
			}
		}

        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('mousemove', handleMouseMove);
        cleanupCongratulationsMessage = cleanup;
        return cleanup;
    });
}

function drawVictoryHexagon(ctx, x, y, size, opacity = 1) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const hx = x + size * Math.cos(angle);
    const hy = y + size * Math.sin(angle);
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
  gradient.addColorStop(0, '#ffd7dd');
  gradient.addColorStop(1, '#daa5dd');
  
  // Sauvegarder l'état actuel du contexte
  ctx.save();
  
  // Appliquer la transparence
  ctx.globalAlpha = opacity;
  
  ctx.fillStyle = gradient;
  ctx.fill();
  
  ctx.strokeStyle = 'black';
  ctx.stroke();
  
  // Restaurer l'état précédent du contexte
  ctx.restore();
}

function showFinalVictoryScreen() {
    return new Promise(resolve => {
        // Masquer les éléments existants
        document.getElementById('undo-btn').style.display = 'none';
        document.getElementById('hint-btn').style.display = 'none';
        document.getElementById('reset-btn').style.display = 'none';
        document.getElementById('moves-display').style.display = 'none';
        document.getElementById('level-select').style.display = 'none';
        document.getElementById('stars-display').style.display = 'none';
        document.getElementById('hexagon-container').style.display = 'none';
        
        setButtonsEnabled(false);

        let rotation = 0;
        const rotationSpeed = 0.01;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        let expansionFactor = 1;
        const expansionSpeed = 0.005;
        const maxExpansion = 1.5;
        let expanding = true;
        let perfectScoreOpacity = 1;
        let perfectScoreIncreasing = false;
        let animationFrameId = null;

        // Ajouter le bouton de fermeture
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            font-size: 24px;
            color: #DDC76E;
            background: none;
            border: none;
            cursor: pointer;
            z-index: 10002;
        `;

        document.body.appendChild(closeBtn);

        function cleanup() {
            closeBtn.remove();
            canvas.removeEventListener('click', handleClick);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Restaurer la visibilité des éléments de jeu
            document.getElementById('hexagon-container').style.display = 'block';
            document.getElementById('moves-display').style.display = 'block';
            document.getElementById('stars-display').style.display = 'block';
            document.getElementById('hint-btn').style.display = 'block';
            document.getElementById('reset-btn').style.display = 'block';
            document.getElementById('undo-btn').style.display = 'block';
            
            // Réinitialiser les états importants
            isLevelTransition = false;
            isTransitioning = false;
            setButtonsEnabled(true);
        }

        function handleClose() {
            cleanup();
			window.location.reload();
            resolve('close');
        }

        closeBtn.addEventListener('click', handleClose);
        
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.color = 'white';
        });
        
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.color = '#DDC76E';
        });

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white';
            ctx.font = 'italic bold 30px Blouse, sans-serif';
            ctx.fillText('Congratulations!', centerX, 40);
            ctx.font = 'italic bold 24px Blouse, sans-serif';
            ctx.fillText('You finished Untile v0.9.1b', centerX, 80);

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(rotation);

            const firstLevelGrid = levels[0].grid;
            const hexPositions = smallHexPositions;
            
            hexPositions.forEach((pos, index) => {
                if (index !== 3) {
                    const x = pos.x * TILE_SIZE * 1.75 * expansionFactor;
                    const y = pos.y * TILE_SIZE * 1.75 * expansionFactor;
                    drawHexagon(ctx, x, y, TILE_SIZE, firstLevelGrid[index]);
                }
            });

            ctx.restore();

            rotation += rotationSpeed;

            if (expanding) {
                expansionFactor += expansionSpeed;
                if (expansionFactor >= maxExpansion) {
                    expanding = false;
                }
            } else {
                expansionFactor -= expansionSpeed;
                if (expansionFactor <= 1) {
                    expanding = true;
                }
            }

            ctx.fillStyle = 'white';
            ctx.font = 'italic 24px Blouse, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`Total stars: ${totalStars} / ${maxStars} ★`, centerX, canvas.height - 60);
            
            if (totalStars === maxStars) {
                ctx.font = 'italic 24px Blouse, sans-serif';
                ctx.fillStyle = `rgba(255, 215, 0, ${perfectScoreOpacity})`;
                ctx.fillText('Perfect score', centerX, canvas.height - 30);

                if (perfectScoreIncreasing) {
                    perfectScoreOpacity += 0.02;
                    if (perfectScoreOpacity >= 1) {
                        perfectScoreOpacity = 1;
                        perfectScoreIncreasing = false;
                    }
                } else {
                    perfectScoreOpacity -= 0.02;
                    if (perfectScoreOpacity <= 0.3) {
                        perfectScoreOpacity = 0.3;
                        perfectScoreIncreasing = true;
                    }
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        }

        animate();

        function handleClick(e) {
            if (e.target === closeBtn) return;
            cleanup();
            showHomeScreen();
            resolve('click');
        }
        
        canvas.addEventListener('click', handleClick);
    });
}


async function checkWinCondition() {
    if (tiles.every(tile => tile.currentState === 0 || tile.currentState === 3 || tile.currentState === 4 || tile.currentState === 5 || tile.currentState === 6 || tile.currentState === 7)) {
        isTransitioning = true;
        isLevelTransition = true;
        setButtonsEnabled(false);
		
        showHints = false;
        if (hintAnimationFrame) {
            cancelAnimationFrame(hintAnimationFrame);
            hintAnimationFrame = null;
        }		

        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            await blinkGrid();
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            let starsEarned = currentLevel === 'random' ? 0 : calculateStarsEarned();
            
            hexagonContainer.style.display = 'none';
            const result = await showCongratulationsMessage(currentLevel === 'random' ? 'Random' : currentLevel + 1, starsEarned);
            
			if (cleanupCongratulationsMessage) {
                cleanupCongratulationsMessage();
                cleanupCongratulationsMessage = null;
            }
			
			// Nettoyer le canvas et le conteneur d'hexagones avant de passer au niveau suivant
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            hexagonContainer.innerHTML = '';
			
			if (result.action === 'next') {
			// Vérifier si le niveau était déjà complété avec 3 étoiles
			const wasAlreadyPerfect = (gameProgress.starsPerLevel[currentLevel] || 0) === 3;
			
			if (wasAlreadyPerfect) {
				// Si le niveau était déjà parfait, on se contente d'afficher le niveau suivant
				// sans mettre à jour les étoiles ou autre
				currentLevel++;
				await initLevel(currentLevel);
			} else {
				// Comportement normal pour un niveau non-parfait
				const starsEarned = calculateStarsEarned();
				updateLevelStars(currentLevel, starsEarned);
				
				// Pour le bouton continue
				const nextLevelToPlay = getNextLevelToPlay();
				updateContinueHexButton(nextLevelToPlay);
				
				if (currentLevel !== 'random') {
					currentLevel++; // S'assurer que cette ligne est exécutée
					saveProgress();
					updateLevelSelector(currentLevel);
				}
				
				updateElementsVisibility();
				updateInstructionVisibility();

				const allLevelsCompleted = levels.every((level, index) => {
					return (gameProgress.starsPerLevel[index] || 0) > 0;
				});

				if (allLevelsCompleted && currentLevel >= levels.length) {
					const result = await showFinalVictoryScreen();
					if (result === 'close') {
						showHomeScreen();
					}
				} else {
					if (currentLevel === 5) {
                            await showTutorialImage('Unlock0.jpg');
                        }
					if (currentLevel === 20) {
						await showTutorialImage('Unlock.jpg');
					} else if (currentLevel === 30) {
						await showTutorialImage('TwoRows.jpg');
					} else if (currentLevel === 40) {  
						await showTutorialImage('Lines.jpg');
					} else if (currentLevel === 60) { 
						await showTutorialImage('Rotation.jpg');
					}
					
					if (currentLevel < levels.length || currentLevel === 'random') {
						hexagonContainer.style.display = '';
						await initLevel(currentLevel);
						await animateStarsToCounter(starsEarned);
					}
				}
                
                updateStarsDisplay();
			}

			} else if (result.action === 'retry') {
				hexagonContainer.style.display = '';
				if (currentLevel === 'random') {
					await resetCurrentRandomLevel();
					updateElementsVisibility(); // Ajout de cette ligne
				} else {
					await initLevel(currentLevel);
				}
            } else if (result.action === 'newRandom') {
                hexagonContainer.style.display = '';
                await generateNewRandomLevel(storedRandomLevel.config);
                await animateStarsToCounter(starsEarned);
            }
        }
        finally {
            isLevelTransition = false;
            isTransitioning = false;
            setButtonsEnabled(true);
        }
    }
}

function calculateStarsEarned() {
    const movesUsed = levels[currentLevel].optimalMoves - remainingMoves;
    if (movesUsed <= levels[currentLevel].optimalMoves) return 3;
    if (movesUsed <= levels[currentLevel].optimalMoves + 3) return 2;
    return 1;
}

// Affichage du score
function updateStarsDisplay() {
    const starsDisplay = document.getElementById('stars-display');
    starsDisplay.textContent = `${totalStars} / ${maxStars} ★`;
}

//Gestion de l'UI au premier niveau 
function updateElementsVisibility() {
    const isFirstLevel = currentLevel === 0;
    const showHintButton = currentLevel >= 5 || currentLevel === 'random';
    const homeScreenVisible = document.getElementById('home-screen').style.display === 'block';

    if (!homeScreenVisible) {
        document.getElementById('home-button').style.display = showHintButton ? 'block' : 'none';
        document.getElementById('stars-display').style.display = isFirstLevel ? 'none' : 'block';
        document.getElementById('undo-btn').style.display = isFirstLevel ? 'none' : 'block';
        document.getElementById('hint-btn').style.display = showHintButton ? 'block' : 'none';
        document.getElementById('reset-btn').style.display = isFirstLevel ? 'none' : 'block';
        document.getElementById('moves-display').style.display = isFirstLevel ? 'none' : 'block';
    } else {
        // Si l'écran d'accueil est visible, on ne montre que le compteur d'étoiles
        document.getElementById('stars-display').style.display = 'block';
        document.getElementById('home-button').style.display = 'none';
        document.getElementById('undo-btn').style.display = 'none';
        document.getElementById('hint-btn').style.display = 'none';
        document.getElementById('reset-btn').style.display = 'none';
        document.getElementById('moves-display').style.display = 'none';
    }
}

//Gestion des boutons de contrôle

function setButtonsEnabled(enabled) {
    const undoBtn = document.getElementById('undo-btn');
    const hintBtn = document.getElementById('hint-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    if (enabled) {
        undoBtn.style.opacity = '1';
        hintBtn.style.opacity = '1';
        resetBtn.style.opacity = '1';
        undoBtn.style.pointerEvents = 'auto';
        hintBtn.style.pointerEvents = 'auto';
        resetBtn.style.pointerEvents = 'auto';
    } else {
        undoBtn.style.opacity = '0.5';
        hintBtn.style.opacity = '0.5';
        resetBtn.style.opacity = '0.5';
        undoBtn.style.pointerEvents = 'none';
        hintBtn.style.pointerEvents = 'none';
        resetBtn.style.pointerEvents = 'none';
    }
}

function resetCurrentLevel() {
    stopResetHint(); // Arrêter l'animation
    
    if (currentLevel === 'random' && storedRandomLevel) {
        tiles = storedRandomLevel.grid.map((state, index) => ({
            currentState: state,
            initialState: storedRandomLevel.initialGrid[index],
            flipCount: 0
        }));
        remainingMoves = storedRandomLevel.clickSequence.length;
        history = [];
        drawGrid();
        updateMovesDisplay();
    } else {
        initLevel(currentLevel);
    }
}

document.getElementById('undo-btn').addEventListener('mouseup', function(e) {
    if (e.target.style.pointerEvents === 'none') return;
    this.src = 'undo-button.png';
    if (history.length > 0) {
        tiles = history.pop();
        drawGrid();
        updateMovesDisplay();
    }
});

document.getElementById('undo-btn').addEventListener('mousedown', function(e) {
    if (e.target.style.pointerEvents === 'none') return;
    this.src = 'undo-button-clicked.png';
});

document.getElementById('reset-btn').addEventListener('mouseup', function(e) {
    if (e.target.style.pointerEvents === 'none') return;
    this.src = 'restart-button.png';
	showHints = false;
    if (hintAnimationFrame) {
        cancelAnimationFrame(hintAnimationFrame);
        hintAnimationFrame = null;
    }
    resetCurrentLevel();
});

document.getElementById('reset-btn').addEventListener('mousedown', function(e) {
    if (e.target.style.pointerEvents === 'none') return;
    this.src = 'restart-button-clicked.png';
});


// Assurez-vous également de gérer le cas où l'utilisateur déplace la souris hors du bouton pendant le clic
document.getElementById('undo-btn').addEventListener('mouseout', function() {
    this.src = 'undo-button.png';
});

document.getElementById('reset-btn').addEventListener('mouseout', function() {
    this.src = 'restart-button.png';
});

// Gestion du bouton d'indices
document.getElementById('hint-btn').addEventListener('mouseup', function(e) {
    if (e.target.style.pointerEvents === 'none' || !isHintButtonActive) return;
    this.src = 'hint-button.png';
    
    if (currentLevel === 'random' || currentLevel >= 4) {
        if (!showHints) {
            // Premier clic sur le bouton hint
            showHints = true;
            currentHintIndex = 0;
            maxHintsForLevel = currentLevel === 'random' ? 
                storedRandomLevel.clickSequence.length :
                hintPositions[currentLevel].length;
        } else {
            // Incrémenter l'index avant de vérifier le maximum
            currentHintIndex++;
            
            // Vérifier si on a atteint le maximum d'indices
            if (currentHintIndex >= maxHintsForLevel - 1) {
                // Garder tous les indices affichés et désactiver le bouton
                currentHintIndex = maxHintsForLevel - 1;
                isHintButtonActive = false;
                this.style.opacity = '0.5';
                this.style.cursor = 'default';
            }
        }
        
        if (showHints) {
            animateHintCursors();
        }
    }
});

document.getElementById('hint-btn').addEventListener('mousedown', function(e) {
    if (e.target.style.pointerEvents === 'none') return;
    this.src = 'hint-button-clicked.png';
});

document.getElementById('hint-btn').addEventListener('mouseout', function() {
    this.src = 'hint-button.png';
});

initLevel(currentLevel);
updateStarsDisplay();
updateInstructionVisibility();
updateElementsVisibility();
animateRotationSymbol();



// fonction de debug pour montrer les index des tuiles
// Passer SHOW_TILE_NUMBERS à true pour les afficher
function drawTileIndices() {
    if (!SHOW_TILE_NUMBERS) return;

    // Supprimer la couche existante si elle existe
    let existingLayer = document.getElementById('indices-layer');
    if (existingLayer) {
        existingLayer.remove();
    }

    // Créer une nouvelle couche pour les indices
    const indicesLayer = document.createElement('div');
    indicesLayer.id = 'indices-layer';
    indicesLayer.style.position = 'absolute';
    indicesLayer.style.top = '0';
    indicesLayer.style.left = '0';
    indicesLayer.style.width = '100%';
    indicesLayer.style.height = '100%';
    indicesLayer.style.pointerEvents = 'none'; // Pour que les clics passent à travers

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 + 20;
    
    const hexPositions = isSmallGrid(currentLevel) ? smallHexPositions : largeHexPositions;
    const gridSize = isSmallGrid(currentLevel) ? SMALL_GRID_SIZE : LARGE_GRID_SIZE;

    for (let i = 0; i < gridSize; i++) {
        const x = centerX + hexPositions[i].x * TILE_SIZE * 1.75;
        const y = centerY + hexPositions[i].y * TILE_SIZE * 1.75;
        
        const indexElement = document.createElement('div');
        indexElement.textContent = i.toString();
        indexElement.style.position = 'absolute';
        indexElement.style.left = `${x}px`;
        indexElement.style.top = `${y}px`;
        indexElement.style.transform = 'translate(-50%, -50%)';
        indexElement.style.color = 'white';
        indexElement.style.fontSize = '12px';
        indexElement.style.fontFamily = 'Arial';
        indexElement.style.textAlign = 'center';
        indexElement.style.lineHeight = '1';
        indexElement.style.textShadow = '1px 1px 2px black';

        indicesLayer.appendChild(indexElement);
    }

    document.getElementById('game-container').appendChild(indicesLayer);
}



// Générateur de niveaux aléatoires

function generateRandomLevel(clicks, tileTypes) {
    console.log("Generating random level...");

	function generateRandomGrid() {
    return Array(19).fill().map(() => tileTypes[Math.floor(Math.random() * tileTypes.length)]);
	}

    function getClickableTiles(grid, clickedTiles) {
        return grid.reduce((acc, tile, index) => {
            if ((tile === 0 || tile === 3 || tile === 4 || tile === 5 || tile === 6) && !clickedTiles.includes(index)) {
                acc.push(index);
            }
            return acc;
        }, []);
    }

    function simulateClick(grid, initialGrid, tileIndex, flipCount) {
    const newGrid = [...grid];
    const clickedTileType = initialGrid[tileIndex];

    function flipTile(index) {
        const currentState = newGrid[index];
        const initialTileState = initialGrid[index];
        flipCount[index]++;

        if (initialTileState === 2) {
            newGrid[index] = (flipCount[index] % 2 === 1) ? 1 : (clickedTileType === 1 || clickedTileType === 2) ? 0 : clickedTileType;
        } else if (initialTileState === 1) {
            newGrid[index] = (flipCount[index] % 2 === 1) ? ((clickedTileType === 1 || clickedTileType === 2) ? 0 : clickedTileType) : 1;
        } else {
            newGrid[index] = (flipCount[index] % 2 === 1) ? 1 : initialTileState;
        }
    }

        if (clickedTileType === 0) {
            getAdjacentTiles(tileIndex).forEach(flipTile);
        } else if (clickedTileType === 3) {
            const adjacentTiles = getAdjacentTiles(tileIndex);
            const secondRowTiles = getSecondRowTiles(tileIndex);
            [...new Set([...adjacentTiles, ...secondRowTiles])].forEach(tile => {
                if (tile !== tileIndex) flipTile(tile);
            });
        } else if (clickedTileType === 4) {
            getVerticalColumnTiles(tileIndex).forEach(flipTile);
        } else if (clickedTileType === 5) {
            getDiagonalTilesTopLeftToBottomRight(tileIndex).forEach(flipTile);
        } else if (clickedTileType === 6) {
            getDiagonalTilesBottomLeftToTopRight(tileIndex).forEach(flipTile);
        }

        return newGrid;
    }

    let grid, initialGrid, clickSequence, clickableTiles, flipCount;
    let attempts = 0;
    const maxAttempts = 1000;

	while (attempts < maxAttempts) {
        attempts++;
        initialGrid = generateRandomGrid();
        grid = [...initialGrid];
        clickSequence = [];
        flipCount = new Array(grid.length).fill(0);

        console.log(`Attempt ${attempts}:`);
        console.log("Initial grid:", initialGrid);

        for (let i = 0; i < clicks; i++) {
            clickableTiles = getClickableTiles(grid, clickSequence);
            
            if (clickableTiles.length === 0) {
                console.log(`No more clickable tiles at step ${i + 1}. Restarting...`);
                break;
            }

            const randomIndex = Math.floor(Math.random() * clickableTiles.length);
            const clickedTile = clickableTiles[randomIndex];
            clickSequence.push(clickedTile);
            
            // Simuler le clic
            grid = simulateClick(grid, initialGrid, clickedTile, flipCount);
            console.log(`After click ${i + 1} on tile ${clickedTile}:`, grid);
        }

        if (clickSequence.length === clicks) {
            console.log("Successfully generated a random level!");
            console.log("Final grid:", grid);
            console.log("Initial grid:", initialGrid);
            console.log("Click sequence:", clickSequence);
            return { grid, initialGrid, clickSequence };
        }
    }

    console.log(`Failed to generate a valid level after ${maxAttempts} attempts.`);
    return null;
}


// fonction de création du niveau
function createRandomLevel() {
    const randomLevel = generateRandomLevel(config.clicks, config.tileTypes);
    if (randomLevel) {
        // Utilisez randomLevel.grid comme nouvelle grille de jeu
        gameState = randomLevel.grid;
        // Vous pouvez également utiliser randomLevel.clickSequence 
        // pour déterminer le nombre optimal de coups
        levels[currentLevel].optimalMoves = randomLevel.clickSequence.length;
        drawGrid();
        updateMovesDisplay();
    } else {
        console.error("Impossible de générer un niveau aléatoire.");
    }
}

// Création d'un nouveau niveau aléatoire
function generateNewRandomLevel(config) {
    return new Promise(resolve => {
        // Réinitialiser l'état des indices
        if (hintAnimationFrame) {
            cancelAnimationFrame(hintAnimationFrame);
            hintAnimationFrame = null;
        }
        showHints = false;
        currentHintIndex = 0;
        lastAnimationTime = 0;
        isHintButtonActive = true; // Réactiver le bouton hint

        const randomLevel = generateRandomLevel(config.clicks, config.tileTypes);
        if (randomLevel) {
            currentLevel = 'random';
            storedRandomLevel = { ...randomLevel, config };
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            hexagonContainer.innerHTML = '';
            
            tiles = randomLevel.grid.map((state, index) => ({
                currentState: state,
                initialState: randomLevel.initialGrid[index],
                flipCount: 0
            }));
            remainingMoves = config.clicks;
            history = [];
            drawGrid();
            updateMovesDisplay();
            updateStarsDisplay();
            updateElementsVisibility();
            updateLevelSelector('random');
            resolve();
        } else {
            console.error("Impossible de générer un niveau aléatoire.");
            resolve();
        }
    });
}

function resetCurrentRandomLevel() {
    return new Promise(resolve => {
        // Réinitialiser l'état des indices
        if (hintAnimationFrame) {
            cancelAnimationFrame(hintAnimationFrame);
            hintAnimationFrame = null;
        }
        showHints = false;
        currentHintIndex = 0;
        lastAnimationTime = 0;
        isHintButtonActive = true; // Réinitialiser l'état du bouton hint

        // Réinitialiser visuellement le bouton hint
        const hintButton = document.getElementById('hint-btn');
        hintButton.style.opacity = '1';
        hintButton.style.cursor = 'pointer';

        if (storedRandomLevel) {
            tiles = storedRandomLevel.grid.map((state, index) => ({
                currentState: state,
                initialState: storedRandomLevel.initialGrid[index],
                flipCount: 0
            }));
            remainingMoves = storedRandomLevel.config.clicks;
            history = [];
            drawGrid();
            updateMovesDisplay();
            resolve();
        } else {
            console.error("No stored random level to reset.");
            resolve();
        }
    });
}




// Système de sauvegarde locale 

// Définir les données à sauvegarder
const gameProgress = {
    currentLevel: 0,
    totalStars: 0,
    starsPerLevel: {}, // Pour stocker les étoiles gagnées par niveau
    hasSeenTutorial: {} // Pour suivre les tutoriels déjà vus
};

// Fonction pour sauvegarder la progression
function saveProgress() {
    const progressData = {
        currentLevel: currentLevel,
        totalStars: totalStars,
        starsPerLevel: gameProgress.starsPerLevel,
        hasSeenTutorial: gameProgress.hasSeenTutorial
    };
    localStorage.setItem('untileProgress', JSON.stringify(progressData));
}

// Fonction pour charger la progression
function loadProgress() {
    const savedProgress = localStorage.getItem('untileProgress');
    if (savedProgress) {
        const progressData = JSON.parse(savedProgress);
        currentLevel = progressData.currentLevel;
        totalStars = progressData.totalStars;
        gameProgress.starsPerLevel = progressData.starsPerLevel || {};
        gameProgress.hasSeenTutorial = progressData.hasSeenTutorial || {};
        return true;
    }
    return false;
}

// Fonction pour mettre à jour les étoiles d'un niveau
function updateLevelStars(level, stars) {
    const currentStars = gameProgress.starsPerLevel[level] || 0;
    if (stars > currentStars) {
        gameProgress.starsPerLevel[level] = stars;
        // Le total est recalculé à partir de tous les niveaux
        totalStars = Object.entries(gameProgress.starsPerLevel)
            .filter(([level, _]) => !isNaN(parseInt(level))) // Exclure les niveaux random
            .reduce((sum, [_, stars]) => sum + stars, 0);
        saveProgress();
    }
}

// Ajouter un bouton pour réinitialiser la progression (optionnel)
function resetProgress() {
    if (confirm("Are you sure you want to reset your progress? This action is irreversible.")) {
        localStorage.removeItem('untileProgress');
        // Recharger la page immédiatement après la réinitialisation
        window.location.reload();
    }
}

// Gestion de la fenêtre de sélection des niveaux
document.getElementById('levels-button').addEventListener('click', () => {
    showLevelsModal(false, true);
});

// Gestionnaire de fermeture de la modale
document.querySelector('.close-button').addEventListener('click', hideLevelsModal);

// Fermer la modale si on clique en dehors
window.addEventListener('click', (event) => {
    const modal = document.getElementById('levels-modal');
    if (event.target === modal) {
        hideLevelsModal();
    }
});

function showLevelsModal(fromHome = false, fromLevel = false) {
    openedFromHome = fromHome;
    openedFromLevel = fromLevel;
    const modal = document.getElementById('levels-modal');
    const worldsContainer = document.getElementById('worlds-container');
    worldsContainer.innerHTML = '';
	
	// Ajuster la largeur de la modale selon le device
    const modalContent = document.querySelector('.modal-content');
    if (isTouchDevice()) {
        modalContent.style.width = '80%';
        modalContent.style.maxWidth = '80%';
        modalContent.style.maxHeight = '80%';
    } 
    
    const worlds = getWorldInfo();
    
    Object.entries(worlds).forEach(([worldNum, world]) => {
        const worldSection = document.createElement('div');
        worldSection.className = 'world-section';
        worldSection.style.marginBottom = '30px';
        worldSection.style.padding = '20px';
        const isUnlocked = isWorldUnlocked(parseInt(worldNum));
        
        worldSection.style.backgroundColor = isUnlocked ? 'rgba(0, 0, 0, 0.3)' : 'rgba(20, 20, 20, 0.5)';
        worldSection.style.borderRadius = '8px';
        worldSection.style.border = isUnlocked ? '1px solid rgba(110, 99, 55, 0.3)' : '1px solid #333';
        
        const worldTitle = document.createElement('h3');
        worldTitle.textContent = isUnlocked ? world.name : `${world.name} 🔒`;
        worldTitle.style.color = isUnlocked ? '#AAAAAA' : '#666';
        worldTitle.style.marginBottom = '15px';
        worldTitle.style.fontSize = '18px';
		worldTitle.style.textAlign = 'center'; 
        worldSection.appendChild(worldTitle);
        
		if (isUnlocked) {
			const levelsGrid = document.createElement('div');
			levelsGrid.style.display = 'grid';
			// Adapter le nombre de colonnes selon le device
			levelsGrid.style.gridTemplateColumns = isTouchDevice() ? 
				'repeat(3, 1fr)' :  // 3 colonnes sur mobile
				'repeat(5, 1fr)';   // 5 colonnes sur desktop
			levelsGrid.style.gap = '15px';
			levelsGrid.style.justifyContent = 'center';
			levelsGrid.style.maxWidth = '600px';
			levelsGrid.style.margin = '0 auto';
            
            for (let i = world.startLevel; i <= world.endLevel; i++) {
                const levelButton = createLevelButton(i);
                levelsGrid.appendChild(levelButton);
            }
            worldSection.appendChild(levelsGrid);
        }
        
        worldsContainer.appendChild(worldSection);
    });
    
    modal.style.display = 'block';
}

// Fonction pour vérifier si un monde est débloqué
function isWorldUnlocked(worldNum) {
    if (worldNum === 1) return true; // Premier monde toujours débloqué
    
    const worlds = getWorldInfo();
    const previousWorld = worlds[worldNum - 1];
    
    // Vérifier si tous les niveaux du monde précédent ont au moins une étoile
    for (let level = previousWorld.startLevel; level <= previousWorld.endLevel; level++) {
        if ((gameProgress.starsPerLevel[level] || 0) === 0) {
            return false;
        }
    }
    return true;
}

// Fonction pour vérifier si un niveau est débloqué
function isLevelUnlocked(levelIndex) {
    const worlds = getWorldInfo();
    const worldNum = levels[levelIndex].world;
    
    if (!isWorldUnlocked(worldNum)) return false;
    
    // Dans un monde débloqué, les niveaux se débloquent séquentiellement
    if (levelIndex === worlds[worldNum].startLevel) return true;
    return (gameProgress.starsPerLevel[levelIndex - 1] || 0) > 0;
}

function createLevelButton(levelIndex) {
    const button = document.createElement('button');
    const relativeLevel = getWorldRelativeLevel(levelIndex);
    const stars = gameProgress.starsPerLevel[levelIndex] || 0;
    const isCompleted = stars === 3;
    const isUnlocked = isLevelUnlocked(levelIndex);
    
    // Style de base pour un bouton carré
    button.style.width = '100%';
    button.style.aspectRatio = '1'; // Force le bouton à être carré
    button.style.display = 'flex';
    button.style.flexDirection = 'column';
    button.style.justifyContent = 'center';
    button.style.alignItems = 'center';
    button.style.padding = '5px';
    button.style.borderRadius = '8px';
    button.style.transition = 'all 0.2s';
    
    if (!isUnlocked) {
        // Style pour niveau bloqué
        button.style.backgroundColor = 'rgba(30, 30, 30, 0.5)';
        button.style.border = '1px solid #333';
        button.style.color = '#666';
        button.style.cursor = 'not-allowed';
        
        const levelNum = document.createElement('div');
        levelNum.textContent = relativeLevel;
        levelNum.style.fontSize = '18px';
        levelNum.style.marginBottom = '5px';
		levelNum.style.fontFamily = 'Blouse, sans-serif';
        
        const lockIcon = document.createElement('div');
        lockIcon.textContent = '🔒';
        lockIcon.style.fontSize = '16px';
        
        button.appendChild(levelNum);
        button.appendChild(lockIcon);
    } else {
        // Style pour niveau débloqué
        button.style.backgroundColor = isCompleted ? 'rgba(34, 139, 34, 0.3)' : 'rgba(60, 45, 30, 0.5)';
        button.style.border = isCompleted ? '1px solid #4CAF50' : '1px solid #6e6337';
        button.style.color = '#DDC76E';
        button.style.cursor = 'pointer';
        
        const levelNum = document.createElement('div');
        levelNum.textContent = relativeLevel;
        levelNum.style.fontSize = '20px';
        levelNum.style.marginBottom = '5px';
		levelNum.style.fontFamily = 'Blouse, sans-serif';
        button.appendChild(levelNum);
        
        const starsDisplay = document.createElement('div');
        starsDisplay.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars);
        starsDisplay.style.fontSize = '14px';
        button.appendChild(starsDisplay);
    }
    
    if (isUnlocked) {
        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = isCompleted ? 'rgba(34, 139, 34, 0.4)' : 'rgba(80, 60, 40, 0.5)';
            button.style.transform = 'scale(1.05)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = isCompleted ? 'rgba(34, 139, 34, 0.3)' : 'rgba(60, 45, 30, 0.5)';
            button.style.transform = 'scale(1)';
        });
        
        button.addEventListener('click', async () => {
			currentLevel = levelIndex;
			await initLevel(currentLevel);
			hideLevelsModal();
			if (!openedFromHome) {
				hideHomeScreen();
			}
		});
    }
    
    return button;
}

function createRandomLevelButton(config, index) {
    const button = document.createElement('button');
    button.textContent = config.name;
    button.style.width = '100%';
    button.style.padding = '10px';
    button.style.backgroundColor = 'rgba(60, 45, 30, 0.5)';
    button.style.border = '1px solid #6e6337';
    button.style.borderRadius = '5px';
    button.style.color = '#DDC76E';
    button.style.cursor = 'pointer';
    button.style.transition = 'background-color 0.2s';
    
    button.addEventListener('mouseenter', () => {
        button.style.backgroundColor = 'rgba(80, 60, 40, 0.5)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.backgroundColor = 'rgba(60, 45, 30, 0.5)';
    });
    
    button.addEventListener('click', async () => {
        await initRandomLevel(config);
        hideLevelsModal();
    });
    
    return button;
}

function hideLevelsModal() {
    const modal = document.getElementById('levels-modal');
    modal.style.display = 'none';
    
    if (openedFromHome) {
        showHomeScreen();
    } else if (openedFromLevel) {
        // Ne rien faire, on revient au niveau en cours
    }
    
    openedFromHome = false;
    openedFromLevel = false;
}


// Initialisation du jeu avec chargement de la progression
window.onload = async function() {
    // Essayer de charger la progression sauvegardée
    if (!loadProgress()) {
        // Si pas de sauvegarde, initialiser avec les valeurs par défaut
        currentLevel = 0;
        totalStars = 0;
    }
    
    await initLevel(currentLevel);
    updateStarsDisplay();
    updateInstructionVisibility();
    updateElementsVisibility();
    animateRotationSymbol();
    
    // Mettre à jour le sélecteur de niveau
    updateLevelSelector(currentLevel);
};


// Fonctions de gestion de l'écran d'accueil
function showHomeScreen() {
    // Afficher l'écran d'accueil
    document.getElementById('home-screen').style.display = 'block';
    
    // Masquer les éléments du jeu
    document.getElementById('hexagon-container').style.display = 'none';
    document.getElementById('moves-display').style.display = 'none';
    document.getElementById('home-button').style.display = 'none';
    document.getElementById('undo-btn').style.display = 'none';
    document.getElementById('hint-btn').style.display = 'none';
    document.getElementById('reset-btn').style.display = 'none';
    
    // Effacer le canvas pour masquer le titre du niveau et la difficulté
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function hideHomeScreen() {
    // Masquer l'écran d'accueil
    document.getElementById('home-screen').style.display = 'none';
    
    // Réafficher les éléments du jeu
    document.getElementById('hexagon-container').style.display = 'block';
    document.getElementById('moves-display').style.display = 'block';
    
    // Réafficher les boutons de contrôle seulement si on n'est pas au niveau 0
    if (currentLevel !== 0) {
        document.getElementById('undo-btn').style.display = 'block';
        document.getElementById('reset-btn').style.display = 'block';
        document.getElementById('home-button').style.display = 'block';
        
        // Réafficher le bouton hint uniquement si niveau ≥ 5
        if (currentLevel >= 5 || currentLevel === 'random') {
            document.getElementById('hint-btn').style.display = 'block';
        }
    }
    
    // Redessiner le niveau
    drawGrid();
    updateElementsVisibility();
    updateInstructionVisibility();
}


function continueGame() {
    hideHomeScreen();
    // Le jeu continue avec le niveau actuel
}

function startRandomLevel(configIndex) {
    hideHomeScreen();
    const config = randomLevelConfigs[configIndex];
    initRandomLevel(config);
}

// Détermination du prochain niveau à jouer
function getNextLevelToPlay() {
    // Cas où il n'y a pas de sauvegarde
    if (!loadProgress()) {
        return {
            level: 0,
            type: 'new'
        };
    }

    // Chercher d'abord un niveau débloqué sans étoile
    for (let i = 0; i < levels.length; i++) {
        if (isLevelUnlocked(i) && !gameProgress.starsPerLevel[i]) {
            return {
                level: i,
                type: 'continue'
            };
        }
    }

    // Sinon, chercher le premier niveau avec moins de 3 étoiles
    for (let i = 0; i < levels.length; i++) {
        if ((gameProgress.starsPerLevel[i] || 0) < 3) {
            return {
                level: i,
                type: 'continue'
            };
        }
    }

    // Si tous les niveaux sont complétés avec 3 étoiles
    return {
        level: levels.length - 1, // Garder le dernier niveau comme référence
        type: 'completed'
    };
}

// Fonction pour changer le contenu du bouton continue de l'accueil
function updateContinueButton(nextLevel) {
    const continueBtn = document.getElementById('continue-btn');
    const continueText = document.getElementById('continue-text');
    const currentLevelText = document.getElementById('current-level-text');
    const levelsButton = document.getElementById('levels-button');

    if (nextLevel.type === 'new') {
        continueText.textContent = 'Start Game';
        currentLevelText.textContent = 'Tutorial - Level 1';
        levelsButton.style.display = 'block'; // Montrer le bouton Levels
        continueBtn.onclick = () => {
            hideHomeScreen();
            initLevel(0);
        };
    }
    else if (nextLevel.type === 'completed') {
        continueText.textContent = 'All Levels Completed!';
        currentLevelText.textContent = 'Click to see all levels';
        levelsButton.style.display = 'none'; // Cacher le bouton Levels car redondant
        continueBtn.onclick = () => {
            hideHomeScreen();
            showLevelsModal();
        };
    }
    else {
        const worlds = getWorldInfo();
        const worldNum = levels[nextLevel.level].world;
        const worldName = worlds[worldNum].name;
        const relativeLevel = getWorldRelativeLevel(nextLevel.level);
        
        continueText.textContent = 'Continue';
        currentLevelText.textContent = `${worldName} - Level ${relativeLevel}`;
        levelsButton.style.display = 'block'; // Montrer le bouton Levels
        continueBtn.onclick = () => {
            hideHomeScreen();
            currentLevel = nextLevel.level;
            initLevel(currentLevel);
        };
    }
}

// Fonction pour créer et gérer le bouton continue hexagonal
function createContinueHexButton() {
    const hexButton = document.createElement('div');
    hexButton.id = 'continue-hex-button';
    hexButton.style.cssText = `
        position: relative;
        width: 200px;
        height: 230px;
        cursor: pointer;
    `;

    // Créer le canvas pour l'hexagone
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 230;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';

    // Conteneur pour le texte
    const textContainer = document.createElement('div');
    textContainer.style.cssText = `
        position: absolute;
        width: 100%;
        text-align: center;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
        pointer-events: none;
    `;

    // Éléments de texte
    const continueText = document.createElement('div');
    continueText.id = 'continue-text';
    continueText.style.cssText = `
        color: #FFFFFF;
        font-size: 18px;
		margin-top: 15px;
    `;

    const levelText = document.createElement('div');
    levelText.id = 'current-level-text';
    levelText.style.cssText = `
        color: #FFFFFF;
        font-size: 10px;
        opacity: 0.8;
		
    `;

    textContainer.appendChild(continueText);
    textContainer.appendChild(levelText);
    hexButton.appendChild(canvas);
    hexButton.appendChild(textContainer);

    let hoverOpacity = 0;
    let isHovered = false;
    let animationFrame = null;

    function drawHexagon(ctx, opacity = 1) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const size = 90;

        // Effacer le canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Dessiner l'hexagone
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = centerX + size * Math.cos(angle);
            const y = centerY + size * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();

        // Créer le dégradé
        const gradient = ctx.createLinearGradient(
            centerX - size,
            centerY - size,
            centerX + size,
            centerY + size
        );
        gradient.addColorStop(0, `rgba(18, 216, 238, ${opacity})`);
        gradient.addColorStop(1, `rgba(221, 252, 160, ${opacity})`);

        // Remplir avec le dégradé
        ctx.fillStyle = gradient;
        ctx.fill();

        // Dessiner le contour
        ctx.strokeStyle = 'cyan';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Ajouter une lueur si survolé
        if (isHovered) {
            ctx.shadowColor = 'cyan';
            ctx.shadowBlur = 20;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }

    function updateAnimation() {
        const ctx = canvas.getContext('2d');
        
        if (isHovered && hoverOpacity < 1) {
            hoverOpacity += 0.05;
        } else if (!isHovered && hoverOpacity > 0) {
            hoverOpacity -= 0.05;
        }

        drawHexagon(ctx, 0.8 + (hoverOpacity * 0.2));

        if (hoverOpacity > 0 && hoverOpacity < 1) {
            animationFrame = requestAnimationFrame(updateAnimation);
        } else {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    }

    // Gestionnaires d'événements pour les effets de survol
    hexButton.addEventListener('mouseenter', () => {
        isHovered = true;
        if (!animationFrame) {
            updateAnimation();
        }
    });

    hexButton.addEventListener('mouseleave', () => {
        isHovered = false;
        if (!animationFrame) {
            updateAnimation();
        }
    });

    // Dessiner l'état initial
    const ctx = canvas.getContext('2d');
    drawHexagon(ctx, 0.8);

    return hexButton;
}

// Fonction pour mettre à jour le bouton continue avec le style hexagonal
function updateContinueHexButton(nextLevel) {
    const continueBtn = document.getElementById('continue-hex-button');
    const continueText = document.getElementById('continue-text');
    const currentLevelText = document.getElementById('current-level-text');
    const levelsHexButton = document.getElementById('levels-hex-button');

    if (nextLevel.type === 'new') {
        continueText.textContent = 'Start Game';
        currentLevelText.innerHTML = 'Tutorial<br>Level 1';
        if (levelsHexButton) levelsHexButton.style.display = 'block';
        continueBtn.onclick = () => {
            hideHomeScreen();
            initLevel(0);
        };
    }
    else if (nextLevel.type === 'completed') {
        continueText.textContent = 'All Levels Completed!';
        currentLevelText.textContent = 'Click to see the list';
        if (levelsHexButton) levelsHexButton.style.display = 'none';
        continueBtn.onclick = () => {
            hideHomeScreen();
            showLevelsModal(true);
        };
    }
    else {
        const worlds = getWorldInfo();
        const worldNum = levels[nextLevel.level].world;
        const worldName = worlds[worldNum].name;
        const relativeLevel = getWorldRelativeLevel(nextLevel.level);
        
        continueText.textContent = 'Continue';
        currentLevelText.innerHTML = `${worldName}<br>Level ${relativeLevel}`;
        if (levelsHexButton) levelsHexButton.style.display = 'block';
        continueBtn.onclick = () => {
            hideHomeScreen();
            currentLevel = nextLevel.level;
            initLevel(currentLevel);
        };
    }
}

// Fonction d'initialisation pour remplacer le bouton existant
function initializeHexagonalContinueButton() {
    // Récupérer le conteneur du bouton continue existant
    const oldContinueBtn = document.getElementById('continue-btn');
    // Créer le nouveau bouton hexagonal
    const hexButton = createContinueHexButton();
    // Remplacer l'ancien bouton par le nouveau
    oldContinueBtn.parentNode.replaceChild(hexButton, oldContinueBtn);
}

// Fonction pour créer le bouton Levels hexagonal
function createLevelsHexButton() {
    const hexButton = document.createElement('div');
    hexButton.id = 'levels-hex-button';
    hexButton.style.cssText = `
        position: relative;
        width: 100px;
        height: 115px;
        cursor: pointer;
		margin-top: -30px;
    `;

    // Créer le canvas pour l'hexagone
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 115;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';

    // Conteneur pour le texte
    const textContainer = document.createElement('div');
    textContainer.style.cssText = `
        position: absolute;
        width: 100%;
        text-align: center;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
        pointer-events: none;
    `;

    // Texte du bouton
    const levelsText = document.createElement('div');
    levelsText.textContent = 'Levels';
    levelsText.style.cssText = `
        color: #FFFFFF;
        font-size: 14px;
    `;

    textContainer.appendChild(levelsText);
    hexButton.appendChild(canvas);
    hexButton.appendChild(textContainer);

    let hoverOpacity = 0;
    let isHovered = false;
    let animationFrame = null;

    function drawHexagon(ctx, opacity = 1) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const size = 45;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = centerX + size * Math.cos(angle);
            const y = centerY + size * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();

        // Utiliser un dégradé différent pour distinguer du bouton continue
        const gradient = ctx.createLinearGradient(
            centerX - size,
            centerY - size,
            centerX + size,
            centerY + size
        );
        gradient.addColorStop(0, `rgba(221, 252, 160, ${opacity})`);
        gradient.addColorStop(1, `rgba(18, 216, 238, ${opacity})`);

        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.strokeStyle = 'cyan';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (isHovered) {
            ctx.shadowColor = 'cyan';
            ctx.shadowBlur = 20;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }

    function updateAnimation() {
        const ctx = canvas.getContext('2d');
        
        if (isHovered && hoverOpacity < 1) {
            hoverOpacity += 0.05;
        } else if (!isHovered && hoverOpacity > 0) {
            hoverOpacity -= 0.05;
        }

        drawHexagon(ctx, 0.8 + (hoverOpacity * 0.2));

        if (hoverOpacity > 0 && hoverOpacity < 1) {
            animationFrame = requestAnimationFrame(updateAnimation);
        } else {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    }

    // Gestionnaires d'événements
    hexButton.addEventListener('mouseenter', () => {
        isHovered = true;
        if (!animationFrame) {
            updateAnimation();
        }
    });

    hexButton.addEventListener('mouseleave', () => {
        isHovered = false;
        if (!animationFrame) {
            updateAnimation();
        }
    });

	hexButton.addEventListener('click', () => {
		hideHomeScreen();
		showLevelsModal(true);
	});

    // Dessiner l'état initial
    const ctx = canvas.getContext('2d');
    drawHexagon(ctx, 0.8);

    return hexButton;
}

// Fonction pour initialiser le bouton Levels hexagonal
function initializeLevelsHexButton() {
    const oldLevelsBtn = document.getElementById('levels-button');
    const hexButton = createLevelsHexButton();
    oldLevelsBtn.parentNode.replaceChild(hexButton, oldLevelsBtn);
}

// Fonction pour créer un bouton random hexagonal
function createRandomHexButton(config) {
    const hexButton = document.createElement('div');
    hexButton.style.cssText = `
        position: relative;
        width: 100px;
        height: 115px;
        cursor: pointer;
        margin-top: -30px;
    `;

    // Créer le canvas pour l'hexagone
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 115;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';

    // Conteneur pour le texte
    const textContainer = document.createElement('div');
    textContainer.style.cssText = `
        position: absolute;
        width: 90%;
        text-align: center;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
        pointer-events: none;
    `;

    // Définir les couleurs de texte selon la difficulté
    const textColors = {
        'easy': '#81edbf',    // Vert clair
        'medium': '#e8fda0',  // Jaune
        'hard': '#c91f8b'     // Rose/violet
    };

    // Texte du bouton
    const buttonText = document.createElement('div');
    buttonText.textContent = config.name;
    buttonText.style.cssText = `
        color: ${textColors[config.difficulty]};
        font-size: 13px;
		margin-top : 10px;
    `;

    textContainer.appendChild(buttonText);
    hexButton.appendChild(canvas);
    hexButton.appendChild(textContainer);

    let hoverOpacity = 0;
    let isHovered = false;
    let animationFrame = null;

    const colors = {
        'easy': ['#330d69', '#30c9cd'],
        'medium': ['#330d69', '#30c9cd'],
        'hard': ['#330d69', '#30c9cd']
    };

    function drawHexagon(ctx, opacity = 1) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const size = 45;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const x = centerX + size * Math.cos(angle);
            const y = centerY + size * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();

        const gradient = ctx.createLinearGradient(
            centerX - size,
            centerY - size,
            centerX + size,
            centerY + size
        );
        gradient.addColorStop(0, `${colors[config.difficulty][0]}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`);
        gradient.addColorStop(1, `${colors[config.difficulty][1]}${Math.round(opacity * 255).toString(16, '0')}`);

        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.strokeStyle = 'cyan';
        ctx.lineWidth = 2;
        ctx.stroke();

        if (isHovered) {
            ctx.shadowColor = 'cyan';
            ctx.shadowBlur = 20;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
    }

    function updateAnimation() {
        const ctx = canvas.getContext('2d');
        
        if (isHovered && hoverOpacity < 1) {
            hoverOpacity += 0.05;
        } else if (!isHovered && hoverOpacity > 0) {
            hoverOpacity -= 0.05;
        }

        drawHexagon(ctx, 0.8 + (hoverOpacity * 0.2));

        if (hoverOpacity > 0 && hoverOpacity < 1) {
            animationFrame = requestAnimationFrame(updateAnimation);
        } else {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    }

    hexButton.addEventListener('mouseenter', () => {
        isHovered = true;
        if (!animationFrame) {
            updateAnimation();
        }
    });

    hexButton.addEventListener('mouseleave', () => {
        isHovered = false;
        if (!animationFrame) {
            updateAnimation();
        }
    });

    hexButton.addEventListener('click', async () => {
        hideHomeScreen();
        await initRandomLevel(config);
    });

    const ctx = canvas.getContext('2d');
    drawHexagon(ctx, 0.8);

    return hexButton;
}

// Puis modifier la section de création des boutons random dans la home :
const randomLevelsContainer = document.querySelector('.random-levels');
if (randomLevelsContainer) {
    randomLevelsContainer.style.display = 'flex';
    randomLevelsContainer.style.gap = '10px';
    randomLevelsContainer.style.justifyContent = 'center';
    
    // Supprimer les anciens boutons
    randomLevelsContainer.innerHTML = '';
    
    // Ajouter les nouveaux boutons hexagonaux
    randomLevelConfigs.forEach(config => {
        const hexButton = createRandomHexButton(config);
        randomLevelsContainer.appendChild(hexButton);
    });
}


// Bouton reset progress
const resetProgressBtn = document.getElementById('reset-progress-btn');

resetProgressBtn.addEventListener('mouseenter', () => {
    resetProgressBtn.style.color = 'rgba(221, 199, 110, 0.8)';
    resetProgressBtn.style.borderColor = 'rgba(110, 99, 55, 0.6)';
});

resetProgressBtn.addEventListener('mouseleave', () => {
    resetProgressBtn.style.color = 'rgba(221, 199, 110, 0.5)';
    resetProgressBtn.style.borderColor = 'rgba(110, 99, 55, 0.3)';
});

resetProgressBtn.addEventListener('click', resetProgress);


// Pour gérer le clic sur l'indicateur d'étoiles qui renvoie vers la fenêtre des niveaux
const starsDisplay = document.getElementById('stars-display');

starsDisplay.addEventListener('click', () => {
    // Si on est dans l'écran d'accueil
    if (document.getElementById('home-screen').style.display === 'block') {
        showLevelsModal(true, false);
    } else {
        // Si on est dans un niveau
        showLevelsModal(false, true);
    }
});

starsDisplay.addEventListener('mouseenter', () => {
    starsDisplay.style.backgroundColor = 'rgba(60, 45, 30, 0.7)';
    starsDisplay.style.borderColor = '#DDC76E';
});

starsDisplay.addEventListener('mouseleave', () => {
    starsDisplay.style.backgroundColor = 'rgba(40, 30, 20, 0.5)';
    starsDisplay.style.borderColor = '#6e6337';
});


// Configuration de la grille de fond
const BACKGROUND_TILE_SIZE = 90;
const hexWidth = BACKGROUND_TILE_SIZE * 2;
const hexHeight = Math.sqrt(3) * BACKGROUND_TILE_SIZE;
const horizontalSpacing = hexWidth * 0.75 + 35;
const verticalSpacing = hexHeight - 5;
let animationOffset = 0;
let backgroundAnimationFrame = null;

function calculateGridSize() {
    const width = window.innerHeight;  // Inversé à cause de la rotation
    const height = window.innerWidth;  // Inversé à cause de la rotation
    
    if (isTouchDevice()) {
        // Sur mobile : 5 colonnes fixes
        const cols = 5;
        const rows = Math.ceil(height / verticalSpacing) + 2;
        return { width, height, cols, rows, isMobile: true };
    } else {
        // Sur desktop : calcul normal avec colonnes supplémentaires pour l'animation
        const cols = Math.ceil(width / horizontalSpacing) + 6;
        const rows = Math.ceil(height / verticalSpacing) + 2;
        return { width, height, cols, rows, isMobile: false };
    }
}


function generateHexagonPoints(x, y, offset) {
    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + Math.PI / 2;
        const hx = x + offset + BACKGROUND_TILE_SIZE * Math.cos(angle);
        const hy = y + BACKGROUND_TILE_SIZE * Math.sin(angle);
        points.push(`${hx},${hy}`);
    }
    return points.join(' ');
}

function generateBackgroundGrid() {
    const gridContainer = document.getElementById('hexagon-grid');
    const dimensions = calculateGridSize();
    
    gridContainer.innerHTML = '';
    
    // Créer un groupe pour la rotation fixe
    const rotatedGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Appliquer la rotation à 90 degrés autour du centre
    rotatedGroup.setAttribute('transform', 
        `translate(${centerX}, ${centerY}) 
         rotate(90) 
         translate(${-centerY}, ${-centerX})`
    );
    
    gridContainer.appendChild(rotatedGroup);
    
    // Créer un groupe pour l'animation de défilement
    const animatedGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    rotatedGroup.appendChild(animatedGroup);

    if (dimensions.isMobile) {
        // Calcul du décalage pour centrer les 5 colonnes
        const totalWidth = dimensions.cols * horizontalSpacing;
        const startX = -totalWidth / 2;

        // Sur mobile, on crée deux séries de 5 colonnes
        for (let set = 0; set < 2; set++) {
            for (let row = 0; row < dimensions.rows; row++) {
                for (let col = 0; col < dimensions.cols; col++) {
                    const x = startX + (col * horizontalSpacing) + (set * dimensions.cols * horizontalSpacing);
                    const y = row * verticalSpacing;
                    const offset = row % 2 ? horizontalSpacing / 2 : 0;

                    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                    polygon.setAttribute('points', generateHexagonPoints(x, y, offset));
                    polygon.setAttribute('fill', 'black');
                    polygon.setAttribute('stroke', 'cyan');
                    polygon.setAttribute('stroke-width', '1.5');
                    polygon.setAttribute('stroke-opacity', '0.2');

                    animatedGroup.appendChild(polygon);
                }
            }
        }
    } else {
        // Version desktop inchangée
        for (let set = 0; set < 2; set++) {
            for (let row = 0; row < dimensions.rows; row++) {
                for (let col = 0; col < dimensions.cols; col++) {
                    const x = (col * horizontalSpacing) + (set * dimensions.cols * horizontalSpacing);
                    const y = row * verticalSpacing;
                    const offset = row % 2 ? horizontalSpacing / 2 : 0;

                    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                    polygon.setAttribute('points', generateHexagonPoints(x, y, offset));
                    polygon.setAttribute('fill', 'black');
                    polygon.setAttribute('stroke', 'cyan');
                    polygon.setAttribute('stroke-width', '1.5');
                    polygon.setAttribute('stroke-opacity', '0.2');

                    animatedGroup.appendChild(polygon);
                }
            }
        }
    }

    // Animation de défilement
    function animateBackground() {
        animationOffset -= 0.2;
        
        if (Math.abs(animationOffset) >= dimensions.cols * horizontalSpacing) {
            animationOffset = 0;
        }
        
        animatedGroup.style.transform = `translateX(${animationOffset}px)`;
        backgroundAnimationFrame = requestAnimationFrame(animateBackground);
    }

    if (backgroundAnimationFrame) {
        cancelAnimationFrame(backgroundAnimationFrame);
    }
    
    animateBackground();
}

// Window.onload pour ajouter les écouteurs d'événements
const originalOnload = window.onload;
window.onload = async function() {
	
	const fadeOverlay = document.getElementById('fade-overlay');
	// Attendre un court instant pour s'assurer que tout est bien chargé
	setTimeout(() => {
		fadeOverlay.style.opacity = '0';
		// Supprimer l'élément une fois l'animation terminée
		setTimeout(() => {
			fadeOverlay.remove();
		}, 1500); // Correspond à la durée de la transition
	}, 100);
	
    // Charger la progression sauvegardée
    if (!loadProgress()) {
        currentLevel = 0;
        totalStars = 0;
    }

    // Ajouter les écouteurs d'événements pour l'écran d'accueil
    document.getElementById('home-button').addEventListener('click', showHomeScreen);
    document.getElementById('home-close-btn').addEventListener('click', hideHomeScreen);
    
    // Écouteurs pour les boutons de niveau aléatoire
    document.querySelectorAll('.random-level-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            startRandomLevel(parseInt(btn.dataset.difficulty));
        });
    });
    
    // Ajuster la position du bouton Levels
    document.getElementById('levels-button').style.left = '80px';

    // Initialiser les boutons hexagonaux
    initializeHexagonalContinueButton();
    initializeLevelsHexButton();

    // Déterminer le prochain niveau à jouer
    const nextLevel = getNextLevelToPlay();
    
    // Mettre à jour le bouton continue hexagonal
    updateContinueHexButton(nextLevel);

    // Si c'est un nouveau jeu, commencer au niveau 0
    // Si le jeu est complété ou une sauvegarde existe, montrer l'écran d'accueil
    if (nextLevel.type === 'completed') {
        currentLevel = nextLevel.level;
        await initLevel(currentLevel);
        showHomeScreen();
    } else if (nextLevel.type === 'new') {
        await initLevel(0);
    } else {
        currentLevel = nextLevel.level;
        await initLevel(currentLevel);
        showHomeScreen();
    }


    // Mettre à jour les affichages
    updateStarsDisplay();
    updateInstructionVisibility();
    updateElementsVisibility();
    animateRotationSymbol();
    updateLevelSelector(currentLevel);
};

window.addEventListener('load', generateBackgroundGrid);
window.addEventListener('resize', generateBackgroundGrid);

// Nettoyage de l'animation lors du déchargement de la page
window.addEventListener('unload', () => {
    if (backgroundAnimationFrame) {
        cancelAnimationFrame(backgroundAnimationFrame);
    }
});