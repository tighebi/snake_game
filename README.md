# Snake Game

A classic 2D Snake game built with HTML5 Canvas and JavaScript.

## Features

- Classic snake gameplay
- Score tracking with high score persistence
- Smooth controls using arrow keys
- Modern, responsive UI
- Game over detection (wall and self collision)

## How to Play

1. Open `index.html` in your web browser
2. Use the arrow keys to control the snake:
   - ↑ Up
   - ↓ Down
   - ← Left
   - → Right
3. Eat the red food to grow and increase your score
4. Avoid hitting the walls or your own tail
5. Press SPACE to restart after game over

## Files

- `index.html` - Main HTML structure
- `style.css` - Styling and layout
- `game.js` - Game logic and mechanics

## Game Mechanics

- Snake starts with 3 segments
- Each food eaten adds 10 points to your score
- High score is saved in browser localStorage
- Game speed: ~6.67 FPS (150ms per frame)

Enjoy playing!