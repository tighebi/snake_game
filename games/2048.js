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
    lastMoveDirection: null,
    tileMovements: [], // Track tile movements for animation
    
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
        
        // Save old state and direction
        this.oldGridState = this.grid.map(row => [...row]);
        this.lastMoveDirection = direction;
        this.tileMovements = [];
        
        // Perform move (this will populate tileMovements)
        const moved = this.move(direction);
        
        if (!moved) {
            this.oldGridState = null;
            this.lastMoveDirection = null;
            this.tileMovements = [];
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
            this.lastMoveDirection = null;
            this.tileMovements = [];
        });
        
        return true;
    },
    
    move(direction) {
        const oldGrid = this.grid.map(row => [...row]);
        let moved = false;
        this.tileMovements = [];
        
        // Enhanced merge function that tracks movements
        const mergeWithTracking = (line, isReverse = false) => {
            const merged = [];
            const movements = [];
            let mergeIndex = 0;
            
            // Filter out zeros and track original indices
            const nonZeros = [];
            for (let i = 0; i < line.length; i++) {
                if (line[i] !== 0) {
                    nonZeros.push({ value: line[i], originalIndex: i });
                }
            }
            
            // Process merges
            for (let i = 0; i < nonZeros.length; i++) {
                if (i < nonZeros.length - 1 && nonZeros[i].value === nonZeros[i + 1].value) {
                    // Merge - use the further source tile for animation (looks more natural)
                    const mergedValue = nonZeros[i].value * 2;
                    merged.push(mergedValue);
                    this.score += mergedValue; // Update score
                    
                    // For merges, animate from the further source position for better visual
                    // Use the tile that's further from the destination
                    const fromIndex = isReverse 
                        ? nonZeros[i].originalIndex  // In reverse, first in array is further from destination
                        : nonZeros[i + 1].originalIndex; // In normal, second is further from destination
                    
                    movements.push({
                        fromIndex: fromIndex,
                        toIndex: mergeIndex,
                        merged: true
                    });
                    
                    i++; // Skip next (merged) tile
                } else {
                    // No merge - simple movement
                    merged.push(nonZeros[i].value);
                    movements.push({
                        fromIndex: nonZeros[i].originalIndex,
                        toIndex: mergeIndex,
                        merged: false
                    });
                }
                mergeIndex++;
            }
            
            // Pad with zeros
            while (merged.length < line.length) {
                merged.push(0);
            }
            
            return { merged, movements };
        };
        
        if (direction === 'left') {
            for (let r = 0; r < this.SIZE; r++) {
                const result = mergeWithTracking(oldGrid[r], false);
                this.grid[r] = result.merged;
                result.movements.forEach(mov => {
                    if (mov.fromIndex !== mov.toIndex) {
                        this.tileMovements.push({
                            fromR: r,
                            fromC: mov.fromIndex,
                            toR: r,
                            toC: mov.toIndex,
                            merged: mov.merged
                        });
                    }
                });
            }
        } else if (direction === 'right') {
            for (let r = 0; r < this.SIZE; r++) {
                const reversed = [...oldGrid[r]].reverse();
                const result = mergeWithTracking(reversed, true);
                this.grid[r] = result.merged.reverse();
                result.movements.forEach(mov => {
                    const fromC = this.SIZE - 1 - mov.fromIndex;
                    const toC = this.SIZE - 1 - mov.toIndex;
                    if (fromC !== toC) {
                        this.tileMovements.push({
                            fromR: r,
                            fromC: fromC,
                            toR: r,
                            toC: toC,
                            merged: mov.merged
                        });
                    }
                });
            }
        } else if (direction === 'up') {
            for (let c = 0; c < this.SIZE; c++) {
                const column = [];
                for (let r = 0; r < this.SIZE; r++) {
                    column.push(oldGrid[r][c]);
                }
                const result = mergeWithTracking(column, false);
                for (let r = 0; r < this.SIZE; r++) {
                    this.grid[r][c] = result.merged[r];
                }
                result.movements.forEach(mov => {
                    if (mov.fromIndex !== mov.toIndex) {
                        this.tileMovements.push({
                            fromR: mov.fromIndex,
                            fromC: c,
                            toR: mov.toIndex,
                            toC: c,
                            merged: mov.merged
                        });
                    }
                });
            }
        } else if (direction === 'down') {
            for (let c = 0; c < this.SIZE; c++) {
                const column = [];
                for (let r = 0; r < this.SIZE; r++) {
                    column.push(oldGrid[r][c]);
                }
                const reversed = [...column].reverse();
                const result = mergeWithTracking(reversed, true);
                const finalColumn = result.merged.reverse();
                for (let r = 0; r < this.SIZE; r++) {
                    this.grid[r][c] = finalColumn[r];
                }
                result.movements.forEach(mov => {
                    const fromR = this.SIZE - 1 - mov.fromIndex;
                    const toR = this.SIZE - 1 - mov.toIndex;
                    if (fromR !== toR) {
                        this.tileMovements.push({
                            fromR: fromR,
                            fromC: c,
                            toR: toR,
                            toC: c,
                            merged: mov.merged
                        });
                    }
                });
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
            this.tileMovements = [];
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
        if (!this.oldGridState || this.tileMovements.length === 0) {
            this.updateDisplay();
            if (callback) callback();
            return;
        }
        
        // Update display first - create tiles at final positions
        this.updateDisplay();
        
        // Animate after DOM update
        requestAnimationFrame(() => {
            const tiles = this.gridElement.querySelectorAll('.tile');
            const tileSize = 110; // Size including padding
            const gap = 10; // Gap between tiles
            const cellSize = tileSize + gap;
            const speed = 1200; // pixels per second - constant speed for all tiles (faster animation)
            
            // Create a map of final positions to tiles
            const tileMap = new Map();
            tiles.forEach((tile, index) => {
                const r = Math.floor(index / this.SIZE);
                const c = index % this.SIZE;
                tileMap.set(`${r}-${c}`, tile);
            });
            
            let hasAnimations = false;
            let maxDuration = 0;
            const animations = [];
            
            // First pass: calculate all movements and find max duration
            this.tileMovements.forEach(move => {
                const tileKey = `${move.toR}-${move.toC}`;
                const tile = tileMap.get(tileKey);
                
                if (!tile) return;
                
                // Calculate delta based on direction - ensure straight line (horizontal OR vertical only)
                let deltaX = 0;
                let deltaY = 0;
                let distance = 0;
                
                if (this.lastMoveDirection === 'left' || this.lastMoveDirection === 'right') {
                    // Horizontal movement only - no vertical component
                    deltaX = (move.fromC - move.toC) * cellSize;
                    deltaY = 0;
                    distance = Math.abs(deltaX);
                } else if (this.lastMoveDirection === 'up' || this.lastMoveDirection === 'down') {
                    // Vertical movement only - no horizontal component
                    deltaX = 0;
                    deltaY = (move.fromR - move.toR) * cellSize;
                    distance = Math.abs(deltaY);
                }
                
                if (distance > 0) {
                    hasAnimations = true;
                    // Calculate duration based on distance for constant speed
                    const duration = distance / speed;
                    maxDuration = Math.max(maxDuration, duration);
                    
                    animations.push({
                        tile,
                        deltaX,
                        deltaY,
                        duration,
                        merged: move.merged
                    });
                }
            });
            
            // Second pass: apply animations - each tile uses its calculated duration for constant speed
            animations.forEach(anim => {
                // Set initial position (tile starts offset by the movement distance)
                anim.tile.style.transform = `translate(${anim.deltaX}px, ${anim.deltaY}px)`;
                anim.tile.style.transition = 'none';
                anim.tile.classList.add('sliding');
                
                // Force reflow
                anim.tile.offsetHeight;
                
                // Animate to final position - use calculated duration for constant speed
                // Linear timing ensures constant speed (no acceleration/deceleration)
                // Duration is distance-based, so all tiles move at the same pixels/second
                requestAnimationFrame(() => {
                    anim.tile.style.transition = `transform ${anim.duration}s linear`;
                    anim.tile.style.transform = 'translate(0, 0)';
                });
            });
            
            // Mark new tiles (that appeared without moving)
            const newTilePositions = new Set();
            this.tileMovements.forEach(move => {
                newTilePositions.add(`${move.toR}-${move.toC}`);
            });
            
            // Find tiles that are new (not in movements and not in old grid)
            for (let r = 0; r < this.SIZE; r++) {
                for (let c = 0; c < this.SIZE; c++) {
                    if (this.grid[r][c] !== 0 && this.oldGridState[r][c] === 0) {
                        const tileKey = `${r}-${c}`;
                        if (!newTilePositions.has(tileKey)) {
                            const tile = tileMap.get(tileKey);
                            if (tile) {
                                tile.classList.add('tile-new');
                            }
                        }
                    }
                }
            }
            
            // Cleanup after animation - use max duration
            const delay = hasAnimations ? (maxDuration * 1000) + 50 : 100;
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
