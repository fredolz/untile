const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const hexagonContainer = document.getElementById('hexagon-container');

const TILE_SIZE = 50;
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

// Paramètres pour la génération de niveaux aléatoires
const randomLevelConfigs = [
  { name: "Random Easy", clicks: 4, tileTypes: [0], difficulty: 'easy' },
  { name: "Random Medium", clicks: 4, tileTypes: [0, 4, 5, 6], difficulty: 'medium' },
  { name: "Random Hard", clicks: 5, tileTypes: [0, 3, 4, 5, 6], difficulty: 'hard' }
];

// Définition des niveaux

const levels = [
  { grid: [1,1,1,0,1,1,1], optimalMoves: 1, difficulty: 'Tutorial' }, //lvl 1
  { grid: [1,0,0,1,0,1,0], optimalMoves: 1, difficulty: 'Tutorial'  }, //lvl 2
  { grid: [1,1,0,0,0,1,1], optimalMoves: 2, difficulty: 'easy'  }, //lvl 3
  { grid: [0,1,0,0,0,0,1], optimalMoves: 2, difficulty: 'easy'  }, //lvl 4
  { grid: [0,0,0,1,0,0,0], optimalMoves: 3, difficulty: 'easy'  }, //lvl 5 
  { grid: [0,0,0,1,0,1,1,1,0,0,0,1,1,1,0,1,0,0,0], optimalMoves: 2, difficulty: 'easy'  }, //lvl 6
  { grid: [0,0,0,1,1,0,0,1,0,0,0,0,1,1,1,0,0,0,0], optimalMoves: 2, difficulty: 'easy'  }, //lvl 7
  { grid: [0,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,1,1,0], optimalMoves: 4, difficulty: 'easy'  }, //lvl 8
  { grid: [1,1,1,0,0,0,1,1,1,1,1,1,1,0,0,0,1,1,0], optimalMoves: 3, difficulty: 'easy'  }, //lvl 9
  { grid: [0,0,1,0,1,0,1,0,1,0,0,0,0,0,0,0,0,0,0], optimalMoves: 2, difficulty: 'easy'  }, //lvl 10
  { grid: [0,1,0,0,1,0,0,1,1,0,1,1,0,0,1,0,0,1,0], optimalMoves: 3, difficulty: 'easy'  }, //lvl 11
  { grid: [1,0,1,1,0,1,1,0,0,1,1,1,1,1,1,0,0,0,1], optimalMoves: 3, difficulty: 'easy'  }, //lvl 12
  { grid: [0,0,0,1,0,1,1,1,0,1,0,0,0,1,0,1,1,1,1], optimalMoves: 3, difficulty: 'easy'  }, //lvl 13
  { grid: [1,0,0,0,1,1,0,1,0,0,0,1,1,1,0,1,0,0,0], optimalMoves: 3, difficulty: 'easy'  }, //lvl 14
  { grid: [1,1,0,1,0,1,0,0,1,0,1,1,0,0,1,1,0,1,0], optimalMoves: 3, difficulty: 'easy'  }, //lvl 15
  { grid: [1,1,1,0,0,0,0,0,1,1,1,0,0,1,0,1,1,1,0], optimalMoves: 3, difficulty: 'easy'  }, //lvl 16
  { grid: [1,0,0,0,1,0,0,0,0,0,0,0,0,0,1,0,0,0,1], optimalMoves: 3, difficulty: 'medium'  }, //lvl 17
  { grid: [0,0,0,1,1,1,0,0,0,0,0,0,0,1,1,1,0,0,0], optimalMoves: 3, difficulty: 'medium'  }, //lvl 18
  { grid: [1,0,0,0,0,1,1,0,0,0,0,1,0,0,0,1,0,0,1], optimalMoves: 3, difficulty: 'medium'  }, //lvl 19
  { grid: [1,1,0,1,0,0,0,0,0,1,0,0,1,0,0,1,1,0,0], optimalMoves: 4, difficulty: 'medium'  }, //lvl 20
  { grid: [2,2,2,0,2,2,2], optimalMoves: 2, difficulty: 'Tutorial'  }, //lvl 21 introduction tuile à 2 états 
  { grid: [0,1,2,2,0,0,1], optimalMoves: 2, difficulty: 'easy'  }, //lvl 22
  { grid: [0,0,1,0,2,0,2,1,0,0,1,2,2,0,2,0,0,0,0], optimalMoves: 3, difficulty: 'easy'  }, //lvl 23
  { grid: [2,0,0,1,2,2,1,2,0,0,0,0,1,0,0,1,0,0,0], optimalMoves: 3, difficulty: 'easy'  }, //lvl 24
  { grid: [0,1,1,0,1,0,2,2,1,0,1,1,1,0,2,0,1,1,0], optimalMoves: 4, difficulty: 'easy'  }, //lvl 25
  { grid: [0,1,1,0,1,0,0,0,2,0,2,0,0,0,1,0,1,1,0], optimalMoves: 5, difficulty: 'medium'  }, //lvl 26
  { grid: [2,1,2,1,1,0,0,0,0,1,0,0,0,0,0,0,1,0,0], optimalMoves: 4, difficulty: 'medium'  }, //lvl 27
  { grid: [1,1,2,0,1,2,1,1,0,1,0,0,0,0,0,0,1,0,0], optimalMoves: 5, difficulty: 'medium'  }, //lvl 28
  { grid: [0,0,1,0,0,1,0,1,0,1,1,0,0,0,1,0,2,2,2], optimalMoves: 6, difficulty: 'hard'  }, //lvl 29
  { grid: [2,1,1,0,1,1,1,0,1,1,2,0,0,0,1,0,1,0,0], optimalMoves: 6, difficulty: 'hard'  }, //lvl 30
  { grid: [1,1,1,1,1,1,1,1,1,3,1,1,1,1,1,1,1,1,1], optimalMoves: 1, difficulty: 'Tutorial'  }, //lvl 31 introduction tuile à double rangées
  { grid: [3,1,1,3,3,3,1,1,1,3,1,1,1,1,3,1,3,3,3], optimalMoves: 2, difficulty: 'easy'  }, //lvl 32
  { grid: [3,1,1,3,1,3,3,3,0,3,0,3,3,3,1,3,1,1,3], optimalMoves: 4, difficulty: 'easy'  }, //lvl 33
  { grid: [3,1,1,3,1,3,3,3,3,1,3,3,3,3,3,3,1,1,1], optimalMoves: 3, difficulty: 'easy'  }, //lvl 34 (39 dans doc de LD)
  { grid: [1,3,3,1,3,1,3,3,3,1,3,3,3,1,3,1,3,3,1], optimalMoves: 3, difficulty: 'easy'  }, //lvl 35 (40 dans doc de LD)
  { grid: [3,3,3,3,1,3,2,2,3,3,3,2,2,3,1,3,3,3,3], optimalMoves: 4, difficulty: 'easy'  }, //lvl 36 (41 dans doc de LD) 
  { grid: [3,3,3,3,3,3,3,1,3,2,3,1,3,3,3,3,3,3,3], optimalMoves: 4, difficulty: 'medium'  }, //lvl 37 (45 dans doc de LD) 
  { grid: [3,3,3,3,3,3,2,1,3,3,3,1,3,3,3,3,2,3,3], optimalMoves: 4, difficulty: 'medium'  }, //lvl 38 (48 dans doc de LD) 
  { grid: [3,3,3,3,1,3,3,3,3,3,3,0,0,1,0,1,2,2,1], optimalMoves: 4, difficulty: 'medium'  }, //lvl 39 
  { grid: [1,0,3,0,2,1,3,0,3,2,3,0,3,1,2,0,3,0,1], optimalMoves: 5, difficulty: 'medium'  }, //lvl 40 
  { grid: [1,0,0,4,0,0,1], optimalMoves: 1, difficulty: 'Tutorial'  }, //lvl 41 (50 dans doc de LD) introduction des tuiles retournant des lignes
  { grid: [1,1,1,1,1,4,1,4,1,4,1,4,1,4,1,1,1,1,1], optimalMoves: 5, difficulty: 'easy'  }, //lvl 42 (~51 dans doc de LD) 
  { grid: [5,5,5,1,5,1,5,1,4,1,4,5,5,5,5,5,5,5,5], optimalMoves: 2, difficulty: 'easy'  }, //lvl 43 (~52 dans doc de LD) 
  { grid: [6,4,4,4,6,1,1,4,4,6,4,4,1,1,6,4,4,4,6], optimalMoves: 3, difficulty: 'easy'  }, //lvl 44 (53 dans doc de LD) 
  { grid: [1,5,6,6,5,1,1,5,4,6,4,5,1,1,5,6,6,5,1], optimalMoves: 4, difficulty: 'medium'  }, //lvl 45 (54 dans doc de LD) 
  { grid: [4,5,5,1,4,5,1,5,1,4,1,5,1,5,4,1,5,5,4], optimalMoves: 5, difficulty: 'medium'  }, //lvl 46 (55 dans doc de LD) 
  { grid: [6,6,1,4,6,4,1,6,4,6,4,6,1,4,6,4,1,6,6], optimalMoves: 5, difficulty: 'medium'  }, //lvl 47 (56 dans doc de LD) 
  { grid: [6,4,4,1,6,6,4,4,1,6,1,4,4,6,6,1,4,4,6], optimalMoves: 5, difficulty: 'medium'  }, //lvl 48 (57 dans doc de LD) 
  { grid: [4,6,5,6,4,5,1,1,4,4,4,1,1,5,4,6,5,6,4], optimalMoves: 4, difficulty: 'medium'  }, //lvl 49 (58 dans doc de LD) 
  { grid: [5,5,5,1,5,5,1,5,4,4,4,1,6,1,6,6,6,6,6], optimalMoves: 5, difficulty: 'medium'  }, //lvl 50 (59 dans doc de LD)
  { grid: [4,4,4,5,2,6,4,4,5,4,6,1,1,5,4,6,4,4,4], optimalMoves: 4, difficulty: 'medium'  }, //lvl 51 (60 dans doc de LD) 
  { grid: [5,5,6,2,5,1,5,6,4,4,5,6,5,2,6,1,6,5,6], optimalMoves: 5, difficulty: 'medium'  }, //lvl 52 (61 dans doc de LD) 
  { grid: [4,1,1,5,5,6,5,6,2,4,2,6,5,6,6,5,1,1,4], optimalMoves: 4, difficulty: 'medium'  }, //lvl 53 (66 dans doc de LD) 
  { grid: [6,6,6,4,1,2,5,6,4,4,4,6,5,4,1,2,5,5,5], optimalMoves: 4, difficulty: 'medium'  }, //lvl 54 (63 dans doc de LD) 
  { grid: [2,2,6,5,6,6,4,6,4,4,2,4,5,6,5,5,2,5,2], optimalMoves: 5, difficulty: 'hard'  }, //lvl 55 (62 dans doc de LD) 
  { grid: [6,1,6,4,6,2,4,4,4,5,4,4,4,2,5,4,6,1,6], optimalMoves: 5, difficulty: 'hard'  }, //lvl 56 (64 dans doc de LD) 
  { grid: [6,6,6,4,2,4,6,1,4,4,4,5,1,4,2,4,5,5,5], optimalMoves: 6, difficulty: 'hard'  }, //lvl 57 (65 dans doc de LD) 
  { grid: [4,5,5,4,2,4,5,5,4,4,4,6,6,4,1,2,6,5,4], optimalMoves: 5, difficulty: 'hard'  }, //lvl 58 (67 dans doc de LD) 
  { grid: [4,5,6,2,4,5,6,1,4,5,4,1,6,5,4,6,6,5,2], optimalMoves: 6, difficulty: 'hard'  }, //lvl 59 (68 dans doc de LD) 
  { grid: [5,2,1,6,5,5,5,6,4,4,4,6,5,5,6,6,2,1,6], optimalMoves: 7, difficulty: 'hard'  }, //lvl 60 (69 dans doc de LD) 
  { grid: [0,0,0,1,1,0,1,0,0,7,0,0,0,1,0,0,0,0,0], optimalMoves: 2, difficulty: 'Tutorial'  }, //lvl 61 introduction de la tuile rotative 
  { grid: [0,1,1,0,0,0,0,1,0,7,0,1,0,0,0,0,1,1,0], optimalMoves: 3, difficulty: 'easy'  }, //lvl 62
  { grid: [0,0,0,0,0,0,0,0,0,7,0,0,0,1,0,1,0,0,0], optimalMoves: 3, difficulty: 'easy'  }, //lvl 63
  { grid: [1,0,0,1,1,0,0,0,0,7,0,1,0,1,0,0,0,0,1], optimalMoves: 3, difficulty: 'easy'  }, //lvl 64
  { grid: [0,1,1,0,0,0,0,0,0,7,0,0,0,0,0,0,1,1,0], optimalMoves: 5, difficulty: 'easy'  }, //lvl 65
  { grid: [1,0,1,1,0,7,0,0,0,0,0,0,0,7,0,1,1,0,1], optimalMoves: 5, difficulty: 'medium'  }, //lvl 66
  { grid: [1,1,0,0,7,0,0,1,1,0,1,7,7,1,0,1,1,1,0], optimalMoves: 6, difficulty: 'medium'  }, //lvl 67
  { grid: [1,1,0,0,7,1,7,0,1,0,0,0,1,0,1,1,0,0,0], optimalMoves: 4, difficulty: 'medium'  }, //lvl 68
  { grid: [0,1,1,1,7,0,0,1,1,7,1,0,0,0,1,0,1,1,0], optimalMoves: 5, difficulty: 'medium'  }, //lvl 69
  { grid: [0,0,1,0,1,1,7,7,1,7,0,0,1,0,0,0,0,1,0], optimalMoves: 6, difficulty: 'medium'  }, //lvl 70
  { grid: [0,1,0,0,0,0,2,0,2,7,0,0,0,0,0,0,1,0,0], optimalMoves: 3, difficulty: 'easy'  }, //lvl 71
  { grid: [0,0,0,0,7,1,0,7,0,2,0,0,2,0,0,0,0,1,0], optimalMoves: 4, difficulty: 'medium'  }, //lvl 72
  { grid: [1,0,1,1,1,0,2,0,1,7,0,0,2,0,0,0,1,1,0], optimalMoves: 5, difficulty: 'medium'  }, //lvl 73
  { grid: [0,2,2,0,0,1,7,7,0,0,0,0,0,0,0,0,1,0,0], optimalMoves: 6, difficulty: 'medium'  }, //lvl 74
  { grid: [0,1,1,0,0,0,0,0,0,0,1,7,7,0,0,2,0,1,0], optimalMoves: 7, difficulty: 'hard'  }, //lvl 75
  { grid: [0,1,2,0,7,0,7,7,2,0,0,0,0,0,0,0,0,1,0], optimalMoves: 7, difficulty: 'hard'  }, //lvl 76
  { grid: [0,2,2,2,1,2,1,1,1,7,1,0,0,0,0,0,0,0,0], optimalMoves: 7, difficulty: 'hard'  }, //lvl 77
  { grid: [0,0,0,0,7,0,2,0,1,0,1,2,0,0,7,0,0,0,0], optimalMoves: 7, difficulty: 'hard'  }, //lvl 78
  { grid: [2,1,1,0,7,1,1,0,0,7,0,0,1,1,7,0,1,1,2], optimalMoves: 8, difficulty: 'hard'  }, //lvl 79
  { grid: [7,2,2,1,0,7,0,0,0,7,0,0,1,1,0,0,1,0,0], optimalMoves: 10, difficulty: 'hard'  }, //lvl 80
  
];

window.currentLevel = currentLevel;
window.levels = levels;



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
    
    // Effacer complètement le canvas et le conteneur d'hexagones
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    hexagonContainer.innerHTML = '';
    
    // Réinitialiser les états du jeu
    isLevelTransition = false;
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
//    const levelSelect = document.getElementById('level-select');
    if (typeof level === 'string' && level.startsWith('random-')) {
        levelSelect.value = level;
    } else if (level === 'random') {
        // Trouver l'index du niveau aléatoire actuel
        const randomIndex = randomLevelConfigs.findIndex(config => 
            config.clicks === storedRandomLevel.config.clicks && 
            config.tileTypes.toString() === storedRandomLevel.config.tileTypes.toString()
        );
        if (randomIndex !== -1) {
            levelSelect.value = `random-${randomIndex}`;
        }
    } else {
        levelSelect.value = level.toString();
    }
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

function updateInstructionVisibility() {
    const instructionElement = document.getElementById('instruction');
    if (currentLevel === 0) {
        const hexagonContainer = document.getElementById('hexagon-container');
        const hexagonRect = hexagonContainer.getBoundingClientRect();
        
        instructionElement.style.display = 'block';
        instructionElement.style.position = 'absolute';
        instructionElement.style.width = '100%';
        instructionElement.style.textAlign = 'center';
        instructionElement.style.top = `${hexagonRect.bottom - 50}px`; // 10px sous la grille
        instructionElement.style.left = '0';
        instructionElement.style.color = 'white';
		instructionElement.style.fontStyle = 'italic'; 
        instructionElement.style.fontSize = '18px';
        instructionElement.style.zIndex = '1000';
        instructionElement.innerHTML = '<b>How to play?</b><br><br>Choose the right blank tile to flip the adjacent ones<br>and clear the board!';
        
        // Animation de clignotement
        let opacity = 1;
        const animate = () => {
            opacity = Math.sin(Date.now() / 500) * 0.3 + 0.7;
            instructionElement.style.opacity = opacity;
            if (currentLevel === 0) {
                requestAnimationFrame(animate);
            }
        };
        animate();
    } else {
        instructionElement.style.display = 'none';
    }
}


function isSmallGrid(level) {
    if (level === 'random') {
        // Pour le niveau aléatoire, nous utiliserons toujours la grande grille
        return false;
    }
    return level < 5 || (level >= 20 && level < 22) || level === 40;
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
        drawHexagon(front.getContext('2d'), size / 2, size / 2, size / 2, 3); // 3 pour la tuile neutre
    } else {
        const back = document.createElement('canvas');
        back.width = size;
        back.height = size;
        drawHexagon(back.getContext('2d'), size / 2, size / 2, size / 2, (state + 1) % 3);
        back.style.transform = 'rotateY(180deg)';
        hexagon.appendChild(back);
    }

    // Rendre la tuile centrale du premier niveau semi-transparente	
    if (currentLevel === 0 && index === 3) {
        front.style.opacity = '0.1';  
    }	

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
    const centerY = canvas.height / 2 + 20;
    
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
        setButtonsEnabled(false);  // Désactiver les boutons
        isLevelTransition = true; 
        const tutorialImage = new Image();
        tutorialImage.src = imageName;
        
        tutorialImage.onload = () => {
            let opacity = 0;
            const fadeInDuration = 200;
            const startTime = Date.now();

            function animate() {
                const currentTime = Date.now();
                const elapsedTime = currentTime - startTime;
                opacity = Math.min(elapsedTime / fadeInDuration, 1);

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = `rgba(0, 0, 0, ${0.7 * opacity})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                const imageWidth = 480;
                const imageHeight = 400;
                const x = (canvas.width - imageWidth) / 2;
                const y = (canvas.height - imageHeight) / 2;
                
                ctx.globalAlpha = opacity;
                ctx.drawImage(tutorialImage, x, y, imageWidth, imageHeight);
                
                ctx.globalAlpha = 1;

                if (opacity < 1) {
                    requestAnimationFrame(animate);
                }
            }

            animate();

            function handleClick() {
                canvas.removeEventListener('click', handleClick);
                isLevelTransition = false;
                setButtonsEnabled(true);  // Réactiver les boutons
                resolve();
            }
            
            canvas.addEventListener('click', handleClick);
        };
    });
}

function initLevel(level) {
    return new Promise(async (resolve) => {
        isLevelTransition = false;
        isTransitioning = false;
        updateLevelSelector(level);
        
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
        
        // Utiliser setTimeout pour permettre au navigateur de mettre à jour l'affichage
        setTimeout(() => {
            resolve();
        }, 100);
    });
}

// Fonction de génération de niveau aléatoire
async function initRandomLevel(config) {
    console.log("Entering initRandomLevel");
    
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
                // Remplir les tuiles supplémentaires avec un état neutre (par exemple, 0)
                return {
                    currentState: 0,
                    initialState: 0,
                    flipCount: 0
                };
            }
        });
        
        remainingMoves = config.clicks;
        history = [];
        
        drawGrid();
        updateMovesDisplay();
        updateStarsDisplay();
        updateElementsVisibility();
        updateLevelSelector('random');
    } else {
        console.error("Impossible de générer un niveau aléatoire.");
        alert("Échec de la génération du niveau aléatoire. Retour au niveau précédent.");
        currentLevel = 5; // Retour à un niveau compatible avec la grande grille
        await initLevel(currentLevel);
    }
	
	setButtonsEnabled(true);
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
    movesDisplay.textContent = `Remaining moves for optimal solution: ${remainingMoves}`;
    movesDisplay.style.position = 'absolute';
    movesDisplay.style.bottom = '50px'; // Ajustez cette valeur pour remonter le texte
    movesDisplay.style.left = '0';
    movesDisplay.style.right = '0';
    movesDisplay.style.textAlign = 'center';
    movesDisplay.style.color = 'white';
    movesDisplay.style.fontSize = '16px';
	movesDisplay.style.fontStyle = 'italic';
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




function drawLevelText() {
    const centerX = canvas.width / 2;
    
    // Afficher le numéro du niveau ou "Random Level"
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(currentLevel === 'random' ? 'Random Level' : `Level ${currentLevel + 1} / ${levels.length}`, centerX, 10);
    
    // Ne pas afficher la difficulté et le nombre de coups optimal pour le premier niveau
    if (currentLevel !== 0) {
        let difficultyText, movesText, difficulty;

        if (currentLevel === 'random') {
            const config = storedRandomLevel.config;
            difficulty = config.difficulty;
            difficultyText = `Difficulty: ${difficulty.toUpperCase()}`;
            movesText = `Optimal clicks: ${config.clicks}`;
        } else {
            difficulty = levels[currentLevel].difficulty;
            difficultyText = `Difficulty: ${difficulty.toUpperCase()}`;
            movesText = `Optimal moves: ${levels[currentLevel].optimalMoves}`;
        }

        const combinedText = `${difficultyText}  -  ${movesText}`;
        
        // Mesurer la largeur du texte combiné
        ctx.font = 'italic 16px Arial';
        const textWidth = ctx.measureText(combinedText).width;
        
        // Calculer les positions de début pour chaque partie du texte
        const startX = centerX - textWidth / 2;
        const y = 40; // Position verticale du texte
        
        // Afficher la difficulté
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
            default:
                difficultyColor = 'white';
        }
        ctx.fillStyle = difficultyColor;
        ctx.textAlign = 'left';
        ctx.fillText(difficultyText, startX, y);
        
        // Mesurer la largeur du texte de difficulté
        const difficultyWidth = ctx.measureText(difficultyText).width;
        
        // Afficher le séparateur
        ctx.fillStyle = 'white';
        ctx.fillText('  -  ', startX + difficultyWidth, y);
        
        // Mesurer la largeur du séparateur
        const separatorWidth = ctx.measureText('  -  ').width;
        
        // Afficher le nombre de coups optimal
        ctx.fillStyle = 'lightblue';
        ctx.fillText(movesText, startX + difficultyWidth + separatorWidth, y);
    }
    
    // Garder le texte 'Start!' pour le premier niveau
    if (currentLevel === 0) {
        const centerY = canvas.height / 2 + 20;
        ctx.fillStyle = 'lightblue';
        ctx.font = 'italic 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Start!', centerX, centerY);
    }
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
        
        if (back) {
            const backCtx = back.getContext('2d');
            backCtx.clearRect(0, 0, back.width, back.height);
            drawHexagon(backCtx, back.width / 2, back.height / 2, back.width / 2, (tiles[index].currentState + 1) % 3);
        }
        hexagon.style.transform = 'none'; // Réinitialiser la transformation
        hexagon.dataset.state = tiles[index].currentState; // Mettre à jour l'attribut data-state
    });
    drawLevelText();
}

async function handleClick(x, y) {
    if (isLevelTransition || isFlipping || isTransitioning) return;

    const clickedTile = getTileFromCoordinates(x, y);
    if (clickedTile !== -1) {
        const clickedTileState = tiles[clickedTile].currentState;
        history.push(tiles.map(tile => ({ ...tile })));

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

        console.log("Impacted tiles:", impactedTiles);
        console.log("Updated grid:", tiles.map(tile => tile.currentState));

        remainingMoves--;
        updateMovesDisplay();
        await checkWinCondition();
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

function showCongratulationsMessage(level, starsEarned) {
    return new Promise(resolve => {
        let opacity = 0;
        let animationComplete = false;
        let perfectScoreOpacity = 1;
        let animationId;
        let time = 0;
        let hoveredButton = null;
        
        function drawMessage() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = `rgba(0, 0, 0, ${opacity * 0.7})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.textAlign = 'center';
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;

            ctx.font = 'bold 30px Arial';
            ctx.fillText('Congratulations!', canvas.width / 2, canvas.height / 2 - 80);

            ctx.font = '20px Arial';
            ctx.fillText(`You ${level === 'Random' ? 'completed the random level' : `achieved level ${level}`}.`, canvas.width / 2, canvas.height / 2 - 40);

            if (level === 'Random') {
                ctx.font = 'italic 18px Arial, sans-serif';
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                if (remainingMoves === 0) {
					perfectScoreOpacity = 0.8 + 0.2 * Math.sin(time);
					ctx.fillStyle = `rgba(255, 215, 0, ${perfectScoreOpacity})`;
                    ctx.fillText("Perfect! You used the minimum number of moves!", canvas.width / 2, canvas.height / 2);
                } else {
                    ctx.fillText(`You completed the level in ${storedRandomLevel.clickSequence.length - remainingMoves} moves. You can do better...`, canvas.width / 2, canvas.height / 2);
                }
            } else {
                if (starsEarned === 3) {
                    ctx.font = 'italic 18px Arial, sans-serif';
                    perfectScoreOpacity = 0.8 + 0.2 * Math.sin(time);
                    ctx.fillStyle = `rgba(255, 215, 0, ${perfectScoreOpacity})`;
                    ctx.fillText("Perfect! You used the minimum number of moves!", canvas.width / 2, canvas.height / 2);
                } else {
                    ctx.font = 'italic 18px Arial, sans-serif';
                    ctx.fillStyle = `rgba(192, 192, 192, ${opacity})`;
                    ctx.fillText("... but you can do this with less moves ...", canvas.width / 2, canvas.height / 2);
                }

                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.fillText(`Stars earned: ${'★'.repeat(starsEarned)}${'☆'.repeat(3-starsEarned)}`, canvas.width / 2, canvas.height / 2 + 60);
            }

            // Dessiner les boutons
			if (level === 'Random') {
                if (remainingMoves === 0) {
                    // Si le niveau aléatoire est complété avec le nombre de coups optimum
                    drawButton("New random level", canvas.width / 2, canvas.height / 2 + 120, 180, 40, hoveredButton === 'new');
                } else {
                    // Si le niveau aléatoire n'est pas complété avec le nombre de coups optimum
                    drawButton("Try again", canvas.width / 2 - 100, canvas.height / 2 + 120, 180, 40, hoveredButton === 'try');
                    drawButton("New random level", canvas.width / 2 + 100, canvas.height / 2 + 120, 180, 40, hoveredButton === 'new');
                }
            } else {
                // Pour les niveaux non aléatoires
                if (starsEarned < 3) {
                    drawButton("Try again", canvas.width / 2 - 100, canvas.height / 2 + 120, 180, 40, hoveredButton === 'try');
                    drawButton("Next level", canvas.width / 2 + 100, canvas.height / 2 + 120, 180, 40, hoveredButton === 'next');
                } else {
                    drawButton("Next level", canvas.width / 2, canvas.height / 2 + 120, 180, 40, hoveredButton === 'next');
                }
            }
        }

        function drawButton(text, x, y, width, height, isHovered) {
            ctx.fillStyle = isHovered ? 'rgba(70, 70, 70, ' + opacity + ')' : 'rgba(50, 50, 50, ' + opacity + ')';
            ctx.fillRect(x - width/2, y - height/2, width, height);
            ctx.strokeStyle = 'rgba(255, 255, 255, ' + opacity + ')';
            ctx.strokeRect(x - width/2, y - height/2, width, height);
            ctx.fillStyle = 'rgba(255, 255, 255, ' + opacity + ')';
            ctx.font = '18px Arial';
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

		function handleClick(event) {
            if (animationComplete) {
                const rect = canvas.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;

                if (y > canvas.height / 2 + 100 && y < canvas.height / 2 + 140) {
                    if (level === 'Random') {
                        if (remainingMoves === 0) {
                            // Si le niveau aléatoire est complété avec le nombre de coups optimum
                            if (x > canvas.width / 2 - 90 && x < canvas.width / 2 + 90) {
                                cleanup();
                                resolve({ action: 'newRandom', starsEarned: 0 });
                            }
                        } else {
                            // Si le niveau aléatoire n'est pas complété avec le nombre de coups optimum
                            if (x > canvas.width / 2 - 190 && x < canvas.width / 2 - 10) {
                                cleanup();
                                resolve({ action: 'retry', starsEarned: 0 });
                            } else if (x > canvas.width / 2 + 10 && x < canvas.width / 2 + 190) {
                                cleanup();
                                resolve({ action: 'newRandom', starsEarned: 0 });
                            }
                        }
                    } else {
                        // Pour les niveaux non aléatoires
                        if (starsEarned < 3) {
                            if (x > canvas.width / 2 - 190 && x < canvas.width / 2 - 10) {
                                cleanup();
                                resolve({ action: 'retry', starsEarned: 0 });
                            } else if (x > canvas.width / 2 + 10 && x < canvas.width / 2 + 190) {
                                cleanup();
                                resolve({ action: 'next', starsEarned: starsEarned });
                            }
                        } else {
                            if (x > canvas.width / 2 - 90 && x < canvas.width / 2 + 90) {
                                cleanup();
                                resolve({ action: 'next', starsEarned: starsEarned });
                            }
                        }
                    }
                }
            }
        }

		function handleMouseMove(event) {
			const rect = canvas.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			if (y > canvas.height / 2 + 100 && y < canvas.height / 2 + 140) {
				if (level === 'Random') {
					if (remainingMoves === 0) {
						// Si le niveau aléatoire est complété avec le nombre de coups optimum
						if (x > canvas.width / 2 - 90 && x < canvas.width / 2 + 90) {
							hoveredButton = 'new';
						} else {
							hoveredButton = null;
						}
					} else {
						// Si le niveau aléatoire n'est pas complété avec le nombre de coups optimum
						if (x > canvas.width / 2 - 190 && x < canvas.width / 2 - 10) {
							hoveredButton = 'try';
						} else if (x > canvas.width / 2 + 10 && x < canvas.width / 2 + 190) {
							hoveredButton = 'new';
						} else {
							hoveredButton = null;
						}
					}
				} else if (starsEarned < 3) {
					// Pour les niveaux non aléatoires avec moins de 3 étoiles
					if (x > canvas.width / 2 - 190 && x < canvas.width / 2 - 10) {
						hoveredButton = 'try';
					} else if (x > canvas.width / 2 + 10 && x < canvas.width / 2 + 190) {
						hoveredButton = 'next';
					} else {
						hoveredButton = null;
					}
				} else {
					// Pour les niveaux non aléatoires avec 3 étoiles
					if (x > canvas.width / 2 - 90 && x < canvas.width / 2 + 90) {
						hoveredButton = 'next';
					} else {
						hoveredButton = null;
					}
				}
			} else {
				hoveredButton = null;
			}
		}
		
        function cleanup() {
            canvas.removeEventListener('click', handleClick);
            canvas.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationId);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            hexagonContainer.innerHTML = '';
            hexagonContainer.style.display = '';
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
		// Cacher les boutons undo et reset
        document.getElementById('undo-btn').style.display = 'none';
        document.getElementById('reset-btn').style.display = 'none';
		// Cacher l'affichage des coups restants
        document.getElementById('moves-display').style.display = 'none';
		// Cacher le sélecteur de niveaux
        document.getElementById('level-select').style.display = 'none';
		// Cacher l'affichage des étoiles en haut à droite
        document.getElementById('stars-display').style.display = 'none';
		
        setButtonsEnabled(false);  // Désactiver les boutons
		
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

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white';
            ctx.font = 'italic bold 30px Arial, sans-serif';
            ctx.fillText('Congratulations!', centerX, 40);
			ctx.font = 'italic bold 24px Arial, sans-serif';
            ctx.fillText('You finished Untile v0.8.4', centerX, 80);

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

			// Afficher le nombre d'étoiles gagnées
            ctx.fillStyle = 'white';
            ctx.font = 'italic 24px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`Total stars: ${totalStars} / ${maxStars} ★`, centerX, canvas.height - 60);
			
			// Afficher le texte "Perfect score" si le score est maximal
            if (totalStars === maxStars) {
                ctx.font = 'italic 24px Arial, sans-serif';
                ctx.fillStyle = `rgba(255, 215, 0, ${perfectScoreOpacity})`;  // Couleur or avec opacité variable
                ctx.fillText('Perfect score', centerX, canvas.height - 30);

                // Faire clignoter le texte
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


            requestAnimationFrame(animate);
        }

        animate();

        function handleClick() {
            canvas.removeEventListener('click', handleClick);
            resolve();
        }
        
        canvas.addEventListener('click', handleClick);
    });
}


async function checkWinCondition() {
    if (tiles.every(tile => tile.currentState === 0 || tile.currentState === 3 || tile.currentState === 4 || tile.currentState === 5 || tile.currentState === 6 || tile.currentState === 7)) {
        isTransitioning = true;
        isLevelTransition = true;
        setButtonsEnabled(false);

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
                totalStars += result.starsEarned;
                updateStarsDisplay();
                if (currentLevel !== 'random') {
                    currentLevel++;
                    updateLevelSelector(currentLevel);
                }
                updateElementsVisibility();
                updateInstructionVisibility();
                
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
                } else {
                    await showFinalVictoryScreen();
                }
            } else if (result.action === 'retry') {
                hexagonContainer.style.display = '';
                if (currentLevel === 'random') {
                    await resetCurrentRandomLevel();
                } else {
                    await initLevel(currentLevel);
                }
            } else if (result.action === 'newRandom') {
                hexagonContainer.style.display = '';
                await generateNewRandomLevel(storedRandomLevel.config);
            }
        } finally {
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
    document.getElementById('stars-display').style.display = isFirstLevel ? 'none' : 'block';
    document.getElementById('undo-btn').style.display = isFirstLevel ? 'none' : 'block';
    document.getElementById('reset-btn').style.display = isFirstLevel ? 'none' : 'block';
    document.getElementById('moves-display').style.display = isFirstLevel ? 'none' : 'block';
	document.getElementById('level-select').style.display = isFirstLevel ? 'none' : 'block';

}

//Gestion des boutons de contrôle

function setButtonsEnabled(enabled) {
    const undoBtn = document.getElementById('undo-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    if (enabled) {
        undoBtn.style.opacity = '1';
        resetBtn.style.opacity = '1';
        undoBtn.style.pointerEvents = 'auto';
        resetBtn.style.pointerEvents = 'auto';
    } else {
        undoBtn.style.opacity = '0.5';
        resetBtn.style.opacity = '0.5';
        undoBtn.style.pointerEvents = 'none';
        resetBtn.style.pointerEvents = 'none';
    }
}

function resetCurrentLevel() {
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
        if (storedRandomLevel) {
            tiles = storedRandomLevel.grid.map((state, index) => ({
                currentState: state,
                initialState: storedRandomLevel.initialGrid[index],
                flipCount: 0
            }));
            remainingMoves = storedRandomLevel.config.clicks; // Utilisez le nouveau paramètre ici
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