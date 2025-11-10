// Game configuration
const GRID_SIZE = 20;
const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 400;
const GRID_WIDTH = CANVAS_WIDTH / GRID_SIZE;
const GRID_HEIGHT = CANVAS_HEIGHT / GRID_SIZE;

// Game state
let canvas, ctx;
let snake = [];
let direction = { x: 0, y: 0 };
let nextDirection = { x: 0, y: 0 };
let food = { x: 0, y: 0 };
let foodType = 'normal'; // 'normal', 'golden', 'bluePotion', 'redPotion', 'scissors'
let score = 0;
let highScore = 0;
let highScores = [];
let powerUpHighScores = [];
let gameMode = 'classic'; // 'classic', 'zen', 'powerup'
let currentSkin = 'classic'; // 'classic', 'rainbow', 'robot'
let currentTheme = 'default'; // 'default', 'night', 'garden', 'space', 'retro'
let gameRunning = false;
let gameStarted = false;
let gameLoop = null;
let gameSpeed = 150; // milliseconds per frame
let speedModifier = 1.0; // For potion effects
let speedModifierTimer = 0; // Timer for speed modifier
let frameCount = 0; // For animations

// Theme configurations
const themes = {
    default: {
        bgColor: '#1a1a2e',
        gridColor: '#16213e',
        foodColor: '#ff6b6b',
        headColor: '#4ecdc4',
        bodyColor: '#45b7b8'
    },
    night: {
        bgColor: '#0a0a1a',
        gridColor: '#1a1a3a',
        foodColor: '#ff6b6b',
        headColor: '#6c5ce7',
        bodyColor: '#5f4dee'
    },
    garden: {
        bgColor: '#2d5016',
        gridColor: '#1a3009',
        foodColor: '#ff6b6b',
        headColor: '#51cf66',
        bodyColor: '#40c057'
    },
    space: {
        bgColor: '#000814',
        gridColor: '#001d3d',
        foodColor: '#ff6b6b',
        headColor: '#4a90e2',
        bodyColor: '#357abd'
    },
    retro: {
        bgColor: '#1e3a1e',
        gridColor: '#0f1f0f',
        foodColor: '#00ff41',
        headColor: '#00ff41',
        bodyColor: '#00cc33'
    }
};

// Skin configurations
const skins = {
    classic: {
        getHeadColor: (frame) => themes[currentTheme].headColor,
        getHeadBorderColor: (frame) => {
            // Make head brighter/lighter than body for visibility
            const theme = themes[currentTheme];
            if (currentTheme === 'retro') return '#00ff88';
            if (currentTheme === 'space') return '#6bb3ff';
            if (currentTheme === 'garden') return '#69db7c';
            if (currentTheme === 'night') return '#a29bfe';
            return '#6ef0f0'; // Brighter cyan for default
        },
        getBodyColor: (frame, index) => themes[currentTheme].bodyColor
    },
    rainbow: {
        getHeadColor: (frame) => {
            const hue = (frame * 2) % 360;
            return `hsl(${hue}, 70%, 60%)`;
        },
        getHeadBorderColor: (frame) => {
            const hue = (frame * 2 + 30) % 360;
            return `hsl(${hue}, 90%, 70%)`;
        },
        getBodyColor: (frame, index) => {
            const hue = (frame * 2 + index * 30) % 360;
            return `hsl(${hue}, 70%, 50%)`;
        }
    },
    robot: {
        getHeadColor: (frame) => '#e0e0e0',
        getHeadBorderColor: (frame) => '#ffffff',
        getBodyColor: (frame, index) => {
            // Alternating pattern
            return index % 2 === 0 ? '#808080' : '#a0a0a0';
        }
    }
};

// Initialize game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Make canvas responsive
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', () => {
        setTimeout(resizeCanvas, 100);
    });
    
    // Show main menu, hide game container
    showMainMenu();
    
    // Setup mode selection (menu buttons)
    setupModeSelection();
    
    // Setup theme and skin selection
    setupCustomization();
    
    // Setup pause menu
    setupPauseMenu();
    
    // Setup game over menu
    setupGameOverMenu();
    
    // Event listeners
    document.addEventListener('keydown', handleKeyPress);
    
    // Mobile touch controls
    setupTouchControls();
    
    // Tab switching
    setupTabs();
    
    // Start game loop (for rendering, game will be paused)
    startGame();
}

// Show main menu
function showMainMenu() {
    const mainMenu = document.getElementById('main-menu');
    const gameContainer = document.querySelector('.game-container');
    if (mainMenu) mainMenu.classList.remove('hidden');
    if (gameContainer) gameContainer.classList.add('hidden');
    hidePauseMenu();
    const gameOver = document.getElementById('game-over');
    if (gameOver) gameOver.classList.add('hidden');
    gameRunning = false;
    gameStarted = false;
    // Keep game loop running for rendering, but game won't update
}

// Hide main menu, show game
function showGame() {
    const mainMenu = document.getElementById('main-menu');
    const gameContainer = document.querySelector('.game-container');
    if (mainMenu) mainMenu.classList.add('hidden');
    if (gameContainer) gameContainer.classList.remove('hidden');
    hidePauseMenu();
    const gameOver = document.getElementById('game-over');
    if (gameOver) gameOver.classList.add('hidden');
    // Blur any focused select elements to prevent arrow key interference
    if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
    }
}

// Setup mode selection
function setupModeSelection() {
    const modeButtons = document.querySelectorAll('.menu-btn[data-mode]');
    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const mode = button.getAttribute('data-mode');
            selectGameMode(mode);
        });
    });
}

// Select game mode from menu
function selectGameMode(mode) {
    gameMode = mode;
    
    // Show/hide high score based on mode
    const highScoreContainer = document.getElementById('high-score-container');
    if (mode === 'zen') {
        highScoreContainer.style.display = 'none';
    } else {
        highScoreContainer.style.display = 'block';
        if (mode === 'powerup') {
            loadPowerUpHighScores();
            updatePowerUpHighScoreDisplay();
            // Update high scores tab button text
            const highscoresBtn = document.getElementById('highscores-tab-btn');
            if (highscoresBtn) {
                highscoresBtn.textContent = 'Power-Up Scores';
            }
        } else {
            loadHighScores();
            updateHighScoreDisplay();
            // Update high scores tab button text
            const highscoresBtn = document.getElementById('highscores-tab-btn');
            if (highscoresBtn) {
                highscoresBtn.textContent = 'High Scores';
            }
        }
    }
    
    // Reset game for new mode
    resetGame();
    
    // Show game and pause menu
    showGame();
    showPauseMenu();
}

// Setup pause menu
function setupPauseMenu() {
    const resumeBtn = document.getElementById('resume-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');
    const mobilePauseBtn = document.getElementById('mobile-pause-btn');
    
    if (resumeBtn) {
        resumeBtn.addEventListener('click', () => {
            hidePauseMenu();
            // If game hasn't started, it will wait for direction input
            // If game has started, resume it
            if (gameStarted) {
                gameRunning = true;
            }
            // Otherwise, wait for arrow key to start
        });
    }
    
    if (backToMenuBtn) {
        backToMenuBtn.addEventListener('click', () => {
            showMainMenu();
        });
    }
    
    if (mobilePauseBtn) {
        mobilePauseBtn.addEventListener('click', togglePause);
    }
}

// Setup game over menu
function setupGameOverMenu() {
    const playAgainBtn = document.getElementById('play-again-btn');
    const menuFromGameOverBtn = document.getElementById('menu-from-gameover-btn');
    
    if (playAgainBtn) {
        playAgainBtn.addEventListener('click', () => {
            resetGame();
            showPauseMenu();
        });
    }
    
    if (menuFromGameOverBtn) {
        menuFromGameOverBtn.addEventListener('click', () => {
            showMainMenu();
        });
    }
}

// Show pause menu
function showPauseMenu() {
    const pauseMenu = document.getElementById('pause-menu');
    if (pauseMenu) {
        pauseMenu.classList.remove('hidden');
        // Update button text and title based on game state
        const resumeBtn = document.getElementById('resume-btn');
        const pauseTitle = document.getElementById('pause-title');
        const pauseInstructions = document.getElementById('pause-instructions');
        if (resumeBtn) {
            resumeBtn.textContent = gameStarted ? 'Resume' : 'Play';
        }
        if (pauseTitle) {
            pauseTitle.textContent = gameStarted ? 'Paused' : 'Ready to Play';
        }
        if (pauseInstructions) {
            pauseInstructions.textContent = gameStarted 
                ? 'Press SPACE to resume or click Resume' 
                : 'Press an arrow key or click Play to start';
        }
    }
    gameRunning = false;
    // Blur any focused elements
    if (document.activeElement && document.activeElement.blur) {
        document.activeElement.blur();
    }
}

// Hide pause menu
function hidePauseMenu() {
    const pauseMenu = document.getElementById('pause-menu');
    if (pauseMenu) {
        pauseMenu.classList.add('hidden');
    }
}

// Resume game (legacy function, now handled directly in setupPauseMenu)
function resumeGame() {
    hidePauseMenu();
    if (gameStarted) {
        gameRunning = true;
    }
}

// Toggle pause
function togglePause() {
    if (!gameStarted) return;
    
    if (gameRunning) {
        showPauseMenu();
    } else {
        resumeGame();
    }
}

// Switch game mode (legacy function, now handled by selectGameMode)
function switchMode(mode) {
    selectGameMode(mode);
}

// Setup customization (themes and skins)
function setupCustomization() {
    const skinSelector = document.getElementById('skin-selector');
    const themeSelector = document.getElementById('theme-selector');
    
    // Load saved preferences
    const savedSkin = localStorage.getItem('snakeSkin') || 'classic';
    const savedTheme = localStorage.getItem('snakeTheme') || 'default';
    
    currentSkin = savedSkin;
    currentTheme = savedTheme;
    
    skinSelector.value = savedSkin;
    themeSelector.value = savedTheme;
    
    applyTheme(savedTheme);
    
    // Add event listeners
    skinSelector.addEventListener('change', (e) => {
        currentSkin = e.target.value;
        localStorage.setItem('snakeSkin', currentSkin);
        // Blur to prevent arrow key interference
        e.target.blur();
    });
    
    themeSelector.addEventListener('change', (e) => {
        currentTheme = e.target.value;
        localStorage.setItem('snakeTheme', currentTheme);
        applyTheme(currentTheme);
        // Blur to prevent arrow key interference
        e.target.blur();
    });
    
    // Prevent arrow keys from changing select when game is running
    [skinSelector, themeSelector].forEach(select => {
        select.addEventListener('keydown', (e) => {
            // Only prevent if game is running and it's an arrow key
            if (gameRunning && (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
                e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
                e.preventDefault();
                e.stopPropagation();
                select.blur();
            }
        });
    });
}

// Apply theme to body
function applyTheme(theme) {
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    if (theme !== 'default') {
        document.body.classList.add(`theme-${theme}`);
    }
}

// Make canvas responsive
function resizeCanvas() {
    const container = canvas.parentElement;
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
        // On mobile, account for controls and footer
        const maxWidth = Math.min(400, window.innerWidth - 30);
        // Reserve space for controls (about 200px) and header/footer
        const maxHeight = Math.min(400, (window.innerHeight - 350) * 0.9);
        const size = Math.min(maxWidth, maxHeight);
        
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
    } else {
        const maxWidth = Math.min(400, window.innerWidth - 40);
        const maxHeight = Math.min(400, window.innerHeight * 0.5);
        const size = Math.min(maxWidth, maxHeight);
        
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
    }
}

// Swipe gesture variables
let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

// Setup touch controls
function setupTouchControls() {
    // Button controls
    const controlButtons = document.querySelectorAll('.control-btn');
    controlButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const direction = btn.getAttribute('data-direction');
            handleDirectionInput(direction);
        });
        
        // Touch events for better mobile support
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            btn.classList.add('active');
        });
        
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            btn.classList.remove('active');
            const direction = btn.getAttribute('data-direction');
            handleDirectionInput(direction);
        });
    });
    
    // Swipe gesture detection on canvas
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: false });
}

// Handle swipe gestures
function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    const minSwipeDistance = 30;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                handleDirectionInput('right');
            } else {
                handleDirectionInput('left');
            }
        }
    } else {
        // Vertical swipe
        if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0) {
                handleDirectionInput('down');
            } else {
                handleDirectionInput('up');
            }
        }
    }
}

// Handle direction input (works for both keyboard and touch)
function handleDirectionInput(dir) {
    let key;
    switch(dir) {
        case 'up':
            key = 'ArrowUp';
            break;
        case 'down':
            key = 'ArrowDown';
            break;
        case 'left':
            key = 'ArrowLeft';
            break;
        case 'right':
            key = 'ArrowRight';
            break;
        default:
            return;
    }
    
    // Check if pause menu is visible
    const pauseMenu = document.getElementById('pause-menu');
    if (pauseMenu && !pauseMenu.classList.contains('hidden')) {
        // Hide pause menu and start/resume game
        hidePauseMenu();
        if (!gameStarted) {
            startNewGame(key);
        } else {
            gameRunning = true;
        }
        return;
    }
    
    // Check if game-over overlay is visible
    const gameOverElement = document.getElementById('game-over');
    const isGameOverVisible = !gameOverElement.classList.contains('hidden');
    
    // If game is not running and not started (initial start), wait for direction input
    if (!gameRunning && !gameStarted && !isGameOverVisible) {
        // Prevent down arrow as initial direction
        if (key === 'ArrowDown') {
            return;
        }
        startNewGame(key);
        return;
    }
    
    // If game is not running or not started, ignore
    if (!gameRunning || !gameStarted) return;
    
    // Prevent reversing into itself
    switch(key) {
        case 'ArrowUp':
            if (direction.y === 0) nextDirection = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (direction.y === 0) nextDirection = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (direction.x === 0) nextDirection = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (direction.x === 0) nextDirection = { x: 1, y: 0 };
            break;
    }
}

// Setup tab switching
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // If restart button is clicked and game is over, reset and wait for direction
            if (tabName === 'restart' && !gameRunning) {
                resetGame();
                return; // Don't switch tabs, just reset
            }
            
            // Remove active class from all tabs and buttons
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            button.classList.add('active');
            
            // Handle mode-specific tabs
            if (tabName === 'highscores') {
                if (gameMode === 'powerup') {
                    // Show power-up high scores tab
                    document.getElementById('powerup-highscores-tab').classList.add('active');
                    updatePowerUpHighScoreDisplay();
                } else {
                    // Show classic high scores tab
                    document.getElementById('highscores-tab').classList.add('active');
                    updateHighScoreDisplay();
                }
            } else {
                const targetTab = document.getElementById(`${tabName}-tab`);
                if (targetTab) {
                    targetTab.classList.add('active');
                }
            }
        });
    });
}

// Load high scores from localStorage
function loadHighScores() {
    const saved = localStorage.getItem('snakeHighScores');
    if (saved) {
        highScores = JSON.parse(saved);
        highScores.sort((a, b) => b - a); // Sort descending
    } else {
        highScores = [];
    }
    highScore = highScores.length > 0 ? highScores[0] : 0;
    document.getElementById('high-score').textContent = highScore;
}

// Load power-up high scores from localStorage
function loadPowerUpHighScores() {
    const saved = localStorage.getItem('snakePowerUpHighScores');
    if (saved) {
        powerUpHighScores = JSON.parse(saved);
        powerUpHighScores.sort((a, b) => b - a); // Sort descending
    } else {
        powerUpHighScores = [];
    }
    const powerUpHighScore = powerUpHighScores.length > 0 ? powerUpHighScores[0] : 0;
    document.getElementById('high-score').textContent = powerUpHighScore;
}

// Save high scores to localStorage
function saveHighScores() {
    localStorage.setItem('snakeHighScores', JSON.stringify(highScores));
}

// Save power-up high scores to localStorage
function savePowerUpHighScores() {
    localStorage.setItem('snakePowerUpHighScores', JSON.stringify(powerUpHighScores));
}

// Update high score display in the tab
function updateHighScoreDisplay() {
    const list = document.getElementById('high-scores-list');
    if (highScores.length === 0) {
        list.innerHTML = '<p style="text-align: center; opacity: 0.7;">No scores yet!</p>';
        return;
    }
    
    // Show top 5 scores only
    list.innerHTML = highScores.slice(0, 5).map((score, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
        return `
            <div class="high-score-item">
                <span><span class="rank">${index + 1}.</span> ${medal}</span>
                <span class="score">${score} points</span>
            </div>
        `;
    }).join('');
}

// Update power-up high score display
function updatePowerUpHighScoreDisplay() {
    const list = document.getElementById('powerup-high-scores-list');
    if (powerUpHighScores.length === 0) {
        list.innerHTML = '<p style="text-align: center; opacity: 0.7;">No scores yet!</p>';
        return;
    }
    
    // Show top 5 scores only
    list.innerHTML = powerUpHighScores.slice(0, 5).map((score, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
        return `
            <div class="high-score-item">
                <span><span class="rank">${index + 1}.</span> ${medal}</span>
                <span class="score">${score} points</span>
            </div>
        `;
    }).join('');
}

// Reset game to initial state
function resetGame() {
    // Position snake in center, facing up (so all 4 directions are safe)
    // Snake: head at (10, 10), body at (10, 11), tail at (10, 12)
    snake = [
        { x: 10, y: 10 },
        { x: 10, y: 11 },
        { x: 10, y: 12 }
    ];
    direction = { x: 0, y: 0 };
    nextDirection = { x: 0, y: 0 };
    score = 0;
    gameRunning = false;
    gameStarted = false;
    gameSpeed = 150;
    speedModifier = 1.0;
    speedModifierTimer = 0;
    frameCount = 0;
    document.getElementById('score').textContent = score;
    document.getElementById('game-over').classList.add('hidden');
    
    // Reset to restart tab
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    const restartTabBtn = document.querySelector('[data-tab="restart"]');
    if (restartTabBtn) {
        restartTabBtn.classList.add('active');
    }
    const restartTab = document.getElementById('restart-tab');
    if (restartTab) {
        restartTab.classList.add('active');
    }
    
    generateFood();
}

// Generate food at random position
function generateFood() {
    do {
        food.x = Math.floor(Math.random() * GRID_WIDTH);
        food.y = Math.floor(Math.random() * GRID_HEIGHT);
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
    
    // Determine food type based on game mode
    if (gameMode === 'powerup') {
        const rand = Math.random();
        if (rand < 0.05) { // 5% chance for Golden Apple
            foodType = 'golden';
        } else if (rand < 0.15) { // 10% chance for Blue Potion
            foodType = 'bluePotion';
        } else if (rand < 0.25) { // 10% chance for Red Potion
            foodType = 'redPotion';
        } else if (rand < 0.35) { // 10% chance for Scissors
            foodType = 'scissors';
        } else {
            foodType = 'normal';
        }
    } else {
        foodType = 'normal';
    }
}

// Handle keyboard input
function handleKeyPress(e) {
    // Handle pause (SPACE key) - only if game container is visible
    if ((e.key === ' ' || e.key === 'Spacebar') && !document.querySelector('.game-container').classList.contains('hidden')) {
        e.preventDefault();
        const gameOverElement = document.getElementById('game-over');
        if (gameOverElement && !gameOverElement.classList.contains('hidden')) {
            // Don't pause during game over
            return;
        }
        if (gameStarted) {
            togglePause();
        }
        return;
    }
    
    // Don't handle arrow keys if a select is focused
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === 'SELECT' || activeElement.tagName === 'OPTION')) {
        return;
    }
    
    // Don't handle input if pause menu is visible (unless it's to start the game)
    const pauseMenu = document.getElementById('pause-menu');
    if (pauseMenu && !pauseMenu.classList.contains('hidden')) {
        // Allow arrow keys to start/resume game from pause menu
        return;
    }
    
    // Check if it's an arrow key
    const isArrowKey = e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
                       e.key === 'ArrowLeft' || e.key === 'ArrowRight';
    
    if (isArrowKey) {
        let dir;
        switch(e.key) {
            case 'ArrowUp':
                dir = 'up';
                break;
            case 'ArrowDown':
                dir = 'down';
                break;
            case 'ArrowLeft':
                dir = 'left';
                break;
            case 'ArrowRight':
                dir = 'right';
                break;
        }
        handleDirectionInput(dir);
    }
}

// Start new game with initial direction
function startNewGame(initialKey) {
    // Prevent down arrow as initial direction (would cause immediate collision with tail)
    if (initialKey === 'ArrowDown') {
        return; // Don't start if down arrow is pressed
    }
    
    gameStarted = true;
    gameRunning = true;
    document.getElementById('game-over').classList.add('hidden');
    hidePauseMenu();
    
    // Set initial direction based on key pressed
    switch(initialKey) {
        case 'ArrowUp':
            direction = { x: 0, y: -1 };
            nextDirection = { x: 0, y: -1 };
            break;
        case 'ArrowLeft':
            direction = { x: -1, y: 0 };
            nextDirection = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            direction = { x: 1, y: 0 };
            nextDirection = { x: 1, y: 0 };
            break;
        // ArrowDown is not allowed as initial direction
    }
}

// Update game state
function update() {
    if (!gameRunning || !gameStarted) return;
    
    // Update frame count for animations
    frameCount++;
    
    // Update speed modifier timer
    if (speedModifierTimer > 0) {
        speedModifierTimer--;
        if (speedModifierTimer === 0) {
            speedModifier = 1.0;
            gameSpeed = 150;
            // Restart game loop with normal speed
            startGame();
        }
    }
    
    // Update direction
    direction = { ...nextDirection };
    
    // Calculate new head position
    const head = {
        x: snake[0].x + direction.x,
        y: snake[0].y + direction.y
    };
    
    // Handle wall collision based on game mode
    if (gameMode !== 'zen') {
        // Classic and Power-Up modes have walls
        if (head.x < 0 || head.x >= GRID_WIDTH || 
            head.y < 0 || head.y >= GRID_HEIGHT) {
            gameOver();
            return;
        }
    } else {
        // Zen mode: wrap around
        if (head.x < 0) head.x = GRID_WIDTH - 1;
        if (head.x >= GRID_WIDTH) head.x = 0;
        if (head.y < 0) head.y = GRID_HEIGHT - 1;
        if (head.y >= GRID_HEIGHT) head.y = 0;
    }
    
    // Check self collision based on game mode
    if (gameMode !== 'zen') {
        // Classic and Power-Up modes have self-collision
        if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            gameOver();
            return;
        }
    }
    // Zen mode: no self-collision check
    
    // Add new head
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        handleFoodEaten();
        generateFood();
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
}

// Handle food being eaten
function handleFoodEaten() {
    if (gameMode === 'powerup') {
        switch(foodType) {
            case 'golden':
                score += 10;
                break;
            case 'bluePotion':
                // Slow down (increase game speed interval)
                speedModifier = 0.6; // 60% of normal speed (slower)
                speedModifierTimer = 150; // 150 frames = ~22.5 seconds at normal speed
                score += 10;
                startGame(); // Update game loop with new speed
                break;
            case 'redPotion':
                // Speed up (decrease game speed interval)
                speedModifier = 1.5; // 150% of normal speed (faster)
                speedModifierTimer = 100; // 100 frames = ~10 seconds at normal speed
                score += 10;
                startGame(); // Update game loop with new speed
                break;
            case 'scissors':
                // Remove last 3 segments (or all but head if snake is too short)
                const segmentsToRemove = Math.min(3, snake.length - 1);
                for (let i = 0; i < segmentsToRemove; i++) {
                    if (snake.length > 1) {
                        snake.pop();
                    }
                }
                score += 10;
                break;
            default: // normal
                score += 10;
                break;
        }
    } else {
        score += 10;
    }
    
    document.getElementById('score').textContent = score;
    
    // Update high score display (not the list, just the current high)
    if (gameMode !== 'zen') {
        if (gameMode === 'powerup') {
            const powerUpHighScore = powerUpHighScores.length > 0 ? powerUpHighScores[0] : 0;
            if (score > powerUpHighScore) {
                document.getElementById('high-score').textContent = score;
            }
        } else {
            if (score > highScore) {
                highScore = score;
                document.getElementById('high-score').textContent = highScore;
            }
        }
    }
    
    // Update game speed if modifier changed (handled in startGame call above)
}

// Update high scores list
function updateHighScores(newScore) {
    // Add new score if it's high enough
    if (highScores.length < 10 || newScore > highScores[highScores.length - 1]) {
        highScores.push(newScore);
        highScores.sort((a, b) => b - a); // Sort descending
        highScores = highScores.slice(0, 10); // Keep top 10
        saveHighScores();
        
        // Update display
        highScore = highScores[0];
        document.getElementById('high-score').textContent = highScore;
        updateHighScoreDisplay();
    }
}

// Update power-up high scores list
function updatePowerUpHighScores(newScore) {
    // Add new score if it's high enough
    if (powerUpHighScores.length < 10 || newScore > powerUpHighScores[powerUpHighScores.length - 1]) {
        powerUpHighScores.push(newScore);
        powerUpHighScores.sort((a, b) => b - a); // Sort descending
        powerUpHighScores = powerUpHighScores.slice(0, 10); // Keep top 10
        savePowerUpHighScores();
        
        // Update display
        const powerUpHighScore = powerUpHighScores[0];
        document.getElementById('high-score').textContent = powerUpHighScore;
        updatePowerUpHighScoreDisplay();
    }
}

// Render game
function render() {
    const theme = themes[currentTheme];
    const skin = skins[currentSkin];
    
    // Clear canvas
    ctx.fillStyle = theme.bgColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Ensure canvas maintains proper aspect ratio
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;
    if (canvas.width !== CANVAS_WIDTH || canvas.height !== CANVAS_HEIGHT) {
        canvas.width = CANVAS_WIDTH;
        canvas.height = CANVAS_HEIGHT;
    }
    
    // Draw grid (optional, for visual aid)
    ctx.strokeStyle = theme.gridColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_WIDTH; i++) {
        ctx.beginPath();
        ctx.moveTo(i * GRID_SIZE, 0);
        ctx.lineTo(i * GRID_SIZE, CANVAS_HEIGHT);
        ctx.stroke();
    }
    for (let i = 0; i <= GRID_HEIGHT; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * GRID_SIZE);
        ctx.lineTo(CANVAS_WIDTH, i * GRID_SIZE);
        ctx.stroke();
    }
    
    // Draw food
    drawFood();
    
    // Draw snake body first (so head renders on top)
    snake.forEach((segment, index) => {
        if (index > 0) {
            // Body
            ctx.fillStyle = skin.getBodyColor(frameCount, index);
            ctx.fillRect(
                segment.x * GRID_SIZE + 2,
                segment.y * GRID_SIZE + 2,
                GRID_SIZE - 4,
                GRID_SIZE - 4
            );
        }
    });
    
    // Draw snake head last (on top) with border for visibility
    if (snake.length > 0) {
        const head = snake[0];
        const headX = head.x * GRID_SIZE + 2;
        const headY = head.y * GRID_SIZE + 2;
        const headSize = GRID_SIZE - 4;
        
        // Draw head with brighter color
        ctx.fillStyle = skin.getHeadColor(frameCount);
        ctx.fillRect(headX, headY, headSize, headSize);
        
        // Draw border around head for better visibility
        ctx.strokeStyle = skin.getHeadBorderColor ? skin.getHeadBorderColor(frameCount) : '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(headX - 1, headY - 1, headSize + 2, headSize + 2);
    }
}

// Draw food based on type
function drawFood() {
    const theme = themes[currentTheme];
    const padding = 2;
    const size = GRID_SIZE - 4;
    const x = food.x * GRID_SIZE + padding;
    const y = food.y * GRID_SIZE + padding;
    
    switch(foodType) {
        case 'golden':
            // Golden Apple - yellow/gold color
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(x, y, size, size);
            // Add shine effect
            ctx.fillStyle = '#ffed4e';
            ctx.fillRect(x + 2, y + 2, size * 0.4, size * 0.4);
            break;
        case 'bluePotion':
            // Blue Potion - blue color
            ctx.fillStyle = '#4a90e2';
            ctx.fillRect(x, y, size, size);
            // Add glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#4a90e2';
            ctx.fillRect(x, y, size, size);
            ctx.shadowBlur = 0;
            break;
        case 'redPotion':
            // Red Potion - red color
            ctx.fillStyle = '#e74c3c';
            ctx.fillRect(x, y, size, size);
            // Add glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#e74c3c';
            ctx.fillRect(x, y, size, size);
            ctx.shadowBlur = 0;
            break;
        case 'scissors':
            // Scissors - silver/gray color
            ctx.fillStyle = '#95a5a6';
            ctx.fillRect(x, y, size, size);
            // Draw X pattern
            ctx.strokeStyle = '#34495e';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x + 4, y + 4);
            ctx.lineTo(x + size - 4, y + size - 4);
            ctx.moveTo(x + size - 4, y + 4);
            ctx.lineTo(x + 4, y + size - 4);
            ctx.stroke();
            break;
        default: // normal
            ctx.fillStyle = theme.foodColor;
            ctx.fillRect(x, y, size, size);
            break;
    }
}

// Game over
function gameOver() {
    gameRunning = false;
    gameStarted = false;
    
    // Add score to high scores if applicable (not Zen mode)
    if (gameMode !== 'zen') {
        if (gameMode === 'powerup') {
            updatePowerUpHighScores(score);
        } else {
            updateHighScores(score);
        }
    }
    
    // Update final score display
    document.getElementById('final-score').textContent = score;
    
    // Reset to restart tab
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    const restartTabBtn = document.querySelector('[data-tab="restart"]');
    if (restartTabBtn) {
        restartTabBtn.classList.add('active');
    }
    const restartTab = document.getElementById('restart-tab');
    if (restartTab) {
        restartTab.classList.add('active');
    }
    
    document.getElementById('game-over').classList.remove('hidden');
    hidePauseMenu();
}

// Main game loop
function gameStep() {
    // Always render, but only update if game is running
    render();
    update();
}

// Start game
function startGame() {
    if (gameLoop) {
        clearInterval(gameLoop);
    }
    // Calculate actual game speed based on modifier
    // If speedModifier is 1.5 (faster), divide by 1.5 to get smaller interval
    // If speedModifier is 0.6 (slower), divide by 0.6 to get larger interval
    const baseSpeed = 150;
    const actualSpeed = Math.max(50, Math.min(300, baseSpeed / speedModifier));
    gameLoop = setInterval(gameStep, actualSpeed);
}

// Initialize when page loads
window.addEventListener('load', init);

// Background interaction is now in background.js
