# Snake Game

A modern, feature-rich Snake game built with HTML5 Canvas and JavaScript. Play classic Snake, relax in Zen Mode, or challenge yourself with Power-Up Mode featuring special items and effects.

## 🎮 Game Modes

### Classic Mode
The traditional Snake game experience:
- Wall collisions end the game
- Self-collision ends the game
- High score tracking
- Score: 10 points per food

### Zen Mode
A relaxing, stress-free experience:
- **No walls** - Snake wraps around the edges
- **No self-collision** - Grow as big as you want!
- **No high scores** - Just enjoy the game
- Perfect for seeing how large you can grow

### Power-Up Mode
An enhanced experience with special items:
- All classic gameplay rules apply
- **Special food types** appear randomly:
  - 🍎 **Golden Apple** (5% chance) - Worth 10 points, appears rarely
  - 🔵 **Blue Potion** (10% chance) - Slows the snake down temporarily
  - 🔴 **Red Potion** (10% chance) - Speeds the snake up temporarily (risk/reward!)
  - ✂️ **Scissors** (10% chance) - Removes last 3 segments (escape hatch)
  - 🍎 **Normal Food** (65% chance) - Standard 10 points
- Separate high score tracking from Classic Mode

## 🎨 Customization

### Skins
Change the appearance of your snake:
- **Classic** - Solid colors that match your theme
- **Rainbow** - Animated rainbow colors that cycle
- **Robot** - Metallic gray with alternating segments

### Themes
Change the game's visual style and background:
- **Default** - Purple/blue gradient theme
- **Night Mode** - Dark purple theme for low-light gaming
- **Garden** - Green nature theme
- **Space** - Deep blue space theme
- **Retro LCD** - Classic green terminal theme

Themes affect:
- Game canvas background and grid
- Snake colors
- Website background (with matching hues)
- Food colors

## 🎯 Features

### Main Menu System
- Clean, intuitive menu interface
- Select game mode before playing
- Customize appearance before starting
- Settings persist across sessions

### Pause System
- **SPACE** key to pause/resume during gameplay
- Pause menu with Resume and Back to Menu options
- Game starts paused when mode is selected
- Mobile pause button for touch devices

### Enhanced Snake Head Visibility
- Snake head is rendered on top for easy tracking
- Brighter head color with visible border
- Especially helpful in Zen Mode with large snakes
- Works with all skins and themes

### High Score Tracking
- Separate high scores for Classic and Power-Up modes
- Top 5 scores displayed in leaderboard
- Scores saved in browser localStorage
- Medal system (🥇 🥈 🥉) for top 3

### Responsive Design
- Works on desktop and mobile devices
- Touch controls for mobile
- Swipe gestures for direction control
- Adaptive canvas sizing

### Smooth Animations
- Stable background animations
- Smooth theme transitions
- Rainbow skin color cycling
- Particle effects

## 🕹️ Controls

### Desktop
- **Arrow Keys** - Control snake direction (↑ ↓ ← →)
- **SPACE** - Pause/Resume game
- **Mouse** - Navigate menus and select options

### Mobile
- **Directional Buttons** - Tap to change direction
- **Swipe Gestures** - Swipe on canvas to control
- **Pause Button** - Tap to pause/resume

## 🚀 Getting Started

### Installation
1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. No build process or dependencies required!

### How to Play
1. **Start the Game**
   - Open `index.html` in your browser
   - Main menu will appear automatically

2. **Choose Your Mode**
   - Click on Classic, Zen Mode, or Power-Up
   - Game will start paused

3. **Customize (Optional)**
   - Select a Skin (Classic, Rainbow, Robot)
   - Select a Theme (Default, Night, Garden, Space, Retro)
   - Settings are saved automatically

4. **Play**
   - Click "Play" or press an arrow key to start
   - Control the snake with arrow keys
   - Eat food to grow and score points
   - Press SPACE to pause anytime

5. **Power-Up Mode Tips**
   - Blue Potion: Use when you need to navigate tight spaces
   - Red Potion: Risk/reward - faster movement, harder control
   - Scissors: Emergency option when you're in a tight spot
   - Golden Apple: Rare bonus points!

## 📁 File Structure

```
snake_game/
├── index.html      # Main HTML structure
├── style.css       # Styling and themes
├── game.js         # Game logic and mechanics
├── background.js   # Background animation
└── README.md       # This file
```

## 🎮 Game Mechanics

### Snake Movement
- Snake starts with 3 segments
- Moves continuously in the current direction
- Cannot reverse directly into itself
- Grows by 1 segment when eating food

### Scoring
- **Normal Food**: 10 points
- **Golden Apple**: 10 points (rare)
- **Potions**: 10 points + special effect
- **Scissors**: 10 points + removes 3 segments

### Speed Effects
- **Normal Speed**: 150ms per frame (~6.67 FPS)
- **Blue Potion**: 60% speed (slower) for ~22.5 seconds
- **Red Potion**: 150% speed (faster) for ~10 seconds
- Effects stack if multiple potions are consumed

### Collision Detection
- **Classic/Power-Up**: Walls and self-collision end the game
- **Zen Mode**: No collisions, snake wraps around edges

## 💾 Data Storage

- High scores saved in browser `localStorage`
- Theme and skin preferences saved automatically
- Data persists between browser sessions
- No server or database required

## 🛠️ Technical Details

### Technologies
- **HTML5 Canvas** - Game rendering
- **Vanilla JavaScript** - Game logic (no frameworks)
- **CSS3** - Styling and animations
- **localStorage API** - Data persistence

### Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari
- Modern mobile browsers

### Performance
- Smooth 60 FPS rendering
- Optimized game loop
- Efficient collision detection
- Lightweight codebase (< 1200 lines)

## 🎨 Theme Details

### Default Theme
- Background: Dark purple/blue (#1a1a2e)
- Snake: Cyan/teal (#4ecdc4, #45b7b8)
- Food: Red (#ff6b6b)

### Night Mode
- Background: Very dark purple (#0a0a1a)
- Snake: Purple (#6c5ce7, #5f4dee)
- Food: Red (#ff6b6b)

### Garden Theme
- Background: Dark green (#2d5016)
- Snake: Bright green (#51cf66, #40c057)
- Food: Red (#ff6b6b)

### Space Theme
- Background: Deep space blue (#000814)
- Snake: Sky blue (#4a90e2, #357abd)
- Food: Red (#ff6b6b)

### Retro LCD Theme
- Background: Dark green (#1e3a1e)
- Snake: Bright green (#00ff41, #00cc33)
- Food: Bright green (#00ff41)

## 🌟 Tips & Strategies

### Classic Mode
- Plan your path before moving
- Use the walls to your advantage
- Keep space for maneuvering

### Zen Mode
- Relax and enjoy unlimited growth
- Experiment with patterns
- Perfect for stress-free gaming

### Power-Up Mode
- Save Blue Potions for tight situations
- Use Red Potions when you have space
- Scissors are great escape options
- Watch for rare Golden Apples!

## 📝 Changelog

### Version 2.0 (Current)
- Added Zen Mode (no walls, no self-collision)
- Added Power-Up Mode with special items
- Added menu system
- Added pause functionality
- Added theme system (5 themes)
- Added skin system (3 skins)
- Enhanced snake head visibility
- Improved mobile controls
- Stable background animations
- Separate high score tracking

### Version 1.0
- Classic Snake gameplay
- Basic high score tracking
- Mobile support

## 👤 Author

**Tighe Billings**
- Email: tigheb@bu.edu
- Sponsored by Boston University

## 📄 License

© 2025 All rights reserved

## 🙏 Acknowledgments

- Boston University for sponsorship
- Classic Snake game inspiration
- Modern web technologies

---

**Enjoy playing!** 🐍🎮

For questions or concerns, contact: tigheb@bu.edu
