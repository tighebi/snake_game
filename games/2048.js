// 2048 Game with Slide Animations
const Game2048 = {
    grid: [],
    score: 0,
    highScore: 0,
    gameOver: false,
    won: false,
    gridElement: null,
    SIZE: 4,
    animating: false,
    oldGridState: null,
    
    init() {
        this.gridElement = document.getElementById('grid');
        
        // Load high score
        if (typeof ArcadeStorage !== 'undefined') {
            this.highScore = ArcadeStorage.getBestScore(ArcadeStorage.GAMES.GAME2048);
            document.getElementById('high-score').textContent = this.highScore;
        }
        
        // Setup controls
        this.setupControls();
        this.setupMenu();
        
        // Initialize game
        this.resetGame();
    },
    
    resetGame() {
        this.grid = Array(this.SIZE).fill().map(() => Array(this.SIZE).fill(0));
        this.score = 0;
        this.gameOver = false;
        this.won = false;
        this.oldGridState = null;
        
        // Add two random tiles
        this.addRandomTile();
        this.addRandomTile();
        
        // Update UI
        this.updateDisplay();
        document.getElementById('score').textContent = this.score;
        document.getElementById('game-over').classList.add('hidden');
        document.getElementById('win-message').classList.add('hidden');
    },
    
    addRandomTile() {
        const emptyCells = [];
        for (let r = 0; r < this.SIZE; r++) {
            for (let c = 0; c < this.SIZE; c++) {
                if (this.grid[r][c] === 0) {
                    emptyCells.push({ r, c });
                }
            }
        }
        
        if (emptyCells.length === 0) return;
        
        const cell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        this.grid[cell.r][cell.c] = Math.random() < 0.9 ? 2 : 4;
    },
    
    setupControls() {
        let touchStartX = 0;
        let touchStartY = 0;
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.gameOver && !this.won) return;
            if (this.animating) return;
            
            let moved = false;
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    moved = this.performMove('up');
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    moved = this.performMove('down');
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    moved = this.performMove('left');
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    moved = this.performMove('right');
                    break;
            }
            
            if (moved) {
                e.preventDefault();
            }
        });
        
        // Touch controls (swipe)
        this.gridElement.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }, { passive: true });
        
        this.gridElement.addEventListener('touchend', (e) => {
            if (this.gameOver && !this.won) return;
            if (this.animating) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            const minSwipe = 30;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (Math.abs(deltaX) > minSwipe) {
                    this.performMove(deltaX > 0 ? 'right' : 'left');
                }
            } else {
                if (Math.abs(deltaY) > minSwipe) {
                    this.performMove(deltaY > 0 ? 'down' : 'up');
                }
            }
        }, { passive: true });
    },
    
    setupMenu() {
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.resetGame();
        });
        
        document.getElementById('back-to-menu-btn').addEventListener('click', () => {
            window.location.href = '../index.html';
        });
        
        document.getElementById('continue-btn').addEventListener('click', () => {
            this.won = false;
            document.getElementById('win-message').classList.add('hidden');
        });
        
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.resetGame();
        });
    },
    
    performMove(direction) {
        if (this.animating) return false;
        
        // Save old state
        this.oldGridState = this.grid.map(row => [...row]);
        
        // Perform move
        const moved = this.move(direction);
        
        if (!moved) {
            this.oldGridState = null;
            return false;
        }
        
        this.animating = true;
        
        // Animate and then add new tile
        this.animateMove(() => {
            this.addRandomTile();
            this.updateDisplay();
            this.checkGameState();
            this.animating = false;
            this.oldGridState = null;
        });
        
        return true;
    },
    
    move(direction) {
        const oldGrid = this.grid.map(row => [...row]);
        let moved = false;
        
        if (direction === 'left') {
            for (let r = 0; r < this.SIZE; r++) {
                const row = this.grid[r].filter(val => val !== 0);
                const merged = this.merge(row);
                while (merged.length < this.SIZE) merged.push(0);
                this.grid[r] = merged;
            }
        } else if (direction === 'right') {
            for (let r = 0; r < this.SIZE; r++) {
                const row = this.grid[r].filter(val => val !== 0);
                const merged = this.merge(row.reverse()).reverse();
                while (merged.length < this.SIZE) merged.unshift(0);
                this.grid[r] = merged;
            }
        } else if (direction === 'up') {
            for (let c = 0; c < this.SIZE; c++) {
                const column = [];
                for (let r = 0; r < this.SIZE; r++) {
                    if (this.grid[r][c] !== 0) column.push(this.grid[r][c]);
                }
                const merged = this.merge(column);
                while (merged.length < this.SIZE) merged.push(0);
                for (let r = 0; r < this.SIZE; r++) {
                    this.grid[r][c] = merged[r];
                }
            }
        } else if (direction === 'down') {
            for (let c = 0; c < this.SIZE; c++) {
                const column = [];
                for (let r = 0; r < this.SIZE; r++) {
                    if (this.grid[r][c] !== 0) column.push(this.grid[r][c]);
                }
                const merged = this.merge(column.reverse()).reverse();
                while (merged.length < this.SIZE) merged.unshift(0);
                for (let r = 0; r < this.SIZE; r++) {
                    this.grid[r][c] = merged[r];
                }
            }
        }
        
        // Check if moved
        for (let r = 0; r < this.SIZE; r++) {
            for (let c = 0; c < this.SIZE; c++) {
                if (this.grid[r][c] !== oldGrid[r][c]) {
                    moved = true;
                    break;
                }
            }
            if (moved) break;
        }
        
        if (!moved) {
            this.grid = oldGrid;
        }
        
        return moved;
    },
    
    merge(row) {
        const merged = [];
        for (let i = 0; i < row.length; i++) {
            if (i < row.length - 1 && row[i] === row[i + 1]) {
                const value = row[i] * 2;
                merged.push(value);
                this.score += value;
                i++; // Skip next element
            } else {
                merged.push(row[i]);
            }
        }
        return merged;
    },
    
    animateMove(callback) {
        if (!this.oldGridState) {
            this.updateDisplay();
            if (callback) callback();
            return;
        }
        
        // Create movement tracking
        const movements = this.calculateTileMovements();
        
        // Update display first
        this.updateDisplay();
        
        // Animate after DOM update
        requestAnimationFrame(() => {
            const tiles = this.gridElement.querySelectorAll('.tile');
            const tileSize = 110;
            let hasAnimations = false;
            
            movements.forEach(move => {
                const tileIndex = move.toR * this.SIZE + move.toC;
                const tile = tiles[tileIndex];
                
                if (tile && (move.deltaX !== 0 || move.deltaY !== 0)) {
                    hasAnimations = true;
                    const deltaX = move.deltaX * tileSize;
                    const deltaY = move.deltaY * tileSize;
                    
                    // Set initial transform
                    tile.style.transform = `translate(${-deltaX}px, ${-deltaY}px)`;
                    tile.style.transition = 'none';
                    tile.classList.add('sliding');
                    
                    // Force reflow
                    tile.offsetHeight;
                    
                    // Animate to final position
                    requestAnimationFrame(() => {
                        tile.style.transition = 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)';
                        tile.style.transform = 'translate(0, 0)';
                    });
                } else if (tile && move.isNew) {
                    // New tile animation
                    tile.classList.add('tile-new');
                }
            });
            
            // Cleanup after animation
            const delay = hasAnimations ? 200 : 50;
            setTimeout(() => {
                tiles.forEach(tile => {
                    tile.style.transform = '';
                    tile.style.transition = '';
                    tile.classList.remove('sliding', 'tile-new');
                });
                if (callback) callback();
            }, delay);
        });
    },
    
    calculateTileMovements() {
        if (!this.oldGridState) return [];
        
        const movements = [];
        const usedOldPositions = new Set();
        
        // Track movements: for each new position, find where it came from
        for (let newR = 0; newR < this.SIZE; newR++) {
            for (let newC = 0; newC < this.SIZE; newC++) {
                const newValue = this.grid[newR][newC];
                const oldValue = this.oldGridState[newR][newC];
                
                if (newValue === 0) continue;
                
                // Check if this is a new tile (was empty before)
                if (oldValue === 0) {
                    movements.push({
                        toR: newR,
                        toC: newC,
                        deltaX: 0,
                        deltaY: 0,
                        isNew: true
                    });
                    continue;
                }
                
                // Check if value changed (merge happened)
                if (newValue !== oldValue && newValue === oldValue * 2) {
                    // This is a merged tile - find the two source tiles
                    movements.push({
                        toR: newR,
                        toC: newC,
                        deltaX: 0,
                        deltaY: 0,
                        isMerged: true,
                        isNew: true
                    });
                    continue;
                }
                
                // Check if tile moved from a different position
                if (newValue === oldValue) {
                    // Tile didn't move or change
                    continue;
                }
                
                // Find source position for moved tiles
                // Look for this value in old grid that's not at current position
                for (let oldR = 0; oldR < this.SIZE; oldR++) {
                    for (let oldC = 0; oldC < this.SIZE; oldC++) {
                        const key = `${oldR}-${oldC}`;
                        if (this.oldGridState[oldR][oldC] === newValue && 
                            !usedOldPositions.has(key) &&
                            (oldR !== newR || oldC !== newC)) {
                            
                            // Check if old position is now empty or different
                            if (this.grid[oldR][oldC] !== newValue) {
                                const deltaX = newC - oldC;
                                const deltaY = newR - oldR;
                                movements.push({
                                    toR: newR,
                                    toC: newC,
                                    deltaX: deltaX,
                                    deltaY: deltaY,
                                    isNew: false
                                });
                                usedOldPositions.add(key);
                                break;
                            }
                        }
                    }
                }
            }
        }
        
        return movements;
    },
    
    checkGameState() {
        // Check for win (2048 tile)
        if (!this.won) {
            for (let r = 0; r < this.SIZE; r++) {
                for (let c = 0; c < this.SIZE; c++) {
                    if (this.grid[r][c] === 2048) {
                        this.won = true;
                        document.getElementById('win-message').classList.remove('hidden');
                    }
                }
            }
        }
        
        // Check for game over (no moves available)
        if (!this.canMove()) {
            this.gameOver = true;
            document.getElementById('final-score').textContent = this.score;
            
            // Save high score
            if (typeof ArcadeStorage !== 'undefined') {
                ArcadeStorage.saveHighScore(ArcadeStorage.GAMES.GAME2048, this.score);
                this.highScore = ArcadeStorage.getBestScore(ArcadeStorage.GAMES.GAME2048);
                document.getElementById('high-score').textContent = this.highScore;
            }
            
            document.getElementById('game-over').classList.remove('hidden');
        }
        
        // Update score display
        document.getElementById('score').textContent = this.score;
        if (this.score > this.highScore) {
            this.highScore = this.score;
            document.getElementById('high-score').textContent = this.highScore;
        }
    },
    
    canMove() {
        // Check for empty cells
        for (let r = 0; r < this.SIZE; r++) {
            for (let c = 0; c < this.SIZE; c++) {
                if (this.grid[r][c] === 0) return true;
            }
        }
        
        // Check for possible merges
        for (let r = 0; r < this.SIZE; r++) {
            for (let c = 0; c < this.SIZE; c++) {
                const current = this.grid[r][c];
                if ((r < this.SIZE - 1 && this.grid[r + 1][c] === current) ||
                    (c < this.SIZE - 1 && this.grid[r][c + 1] === current)) {
                    return true;
                }
            }
        }
        
        return false;
    },
    
    updateDisplay() {
        this.gridElement.innerHTML = '';
        
        for (let r = 0; r < this.SIZE; r++) {
            for (let c = 0; c < this.SIZE; c++) {
                const tile = document.createElement('div');
                const value = this.grid[r][c];
                tile.className = `tile ${value ? `tile-${value}` : ''}`;
                tile.textContent = value || '';
                this.gridElement.appendChild(tile);
            }
        }
    }
};

// Initialize when page loads
window.addEventListener('load', () => Game2048.init());
