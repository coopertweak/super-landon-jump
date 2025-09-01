# 🏍️ Super Landon Jump - The Legendary Game!

An awesome Next.js jumping game where Landon shows off his legendary skills by jumping over cool sportbike motorcycles! Inspired by the classic Chrome dino game but way cooler.

![Game Screenshot](https://img.shields.io/badge/Game-Ready%20to%20Play!-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Mobile](https://img.shields.io/badge/Mobile-Optimized-purple)

## 🎮 Game Features

- **🚀 Smooth Physics**: Perfect jump arc with realistic gravity
- **🏍️ Cool Obstacles**: Detailed sportbike motorcycles to jump over
- **✨ Amazing Animations**: 360° flips, particle effects, and smooth transitions
- **📱 Mobile Ready**: Touch controls for phones and tablets
- **🎯 Progressive Difficulty**: Starts easy, gets challenging
- **🏆 High Score Tracking**: Saves your best score locally
- **🎨 Modern UI**: Glass morphism, gradients, and professional design

## 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd landon
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the game:**
   ```bash
   npm run dev
   ```

4. **Play the game:**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 How to Play

- **Desktop**: Press `SPACE` or click to jump
- **Mobile**: Tap anywhere on the screen to jump
- **Goal**: Jump over sportbike motorcycles and get the highest score!
- **Scoring**: 10 points per motorcycle you successfully jump over

## 🎪 Game Mechanics

- **Perfect Physics**: Landon jumps up to 114px and smoothly comes back down
- **Cool Animations**: 360° flip rotation when jumping, lands on feet
- **Smart Collision**: Accurate hit detection with motorcycle obstacles
- **Progressive Speed**: Game gets faster as your score increases
- **Particle Effects**: Jump particles and landing effects

## 🛠️ Tech Stack

- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe development
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[Framer Motion](https://www.framer.com/motion/)** - Smooth animations
- **[Lucide React](https://lucide.dev/)** - Beautiful icons
- **[Radix UI](https://www.radix-ui.com/)** - Accessible components

## 📁 Project Structure

```
landon/
├── app/
│   ├── layout.tsx           # Root layout and metadata
│   ├── page.tsx            # Main game component
│   └── globals.css         # Global styles and animations
├── components/ui/
│   ├── button.tsx          # Reusable button component
│   └── card.tsx           # Card component for UI
├── lib/
│   └── utils.ts           # Utility functions
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind configuration
├── tsconfig.json          # TypeScript configuration
└── README.md             # This file
```

## 🎨 Customization

Want to make it your own? You can easily:

- **Change the character**: Modify the Landon character design in the game component
- **New obstacles**: Replace motorcycles with different vehicles or objects
- **Adjust difficulty**: Modify `GRAVITY`, `JUMP_FORCE`, and obstacle spacing
- **Add power-ups**: Extend the game with special abilities
- **New themes**: Change colors and styling in `tailwind.config.js`

## 🚀 Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=<your-repo-url>)

Or deploy to any platform that supports Next.js:
```bash
npm run build
npm start
```

## 🎉 About

This game was created to celebrate Landon's awesomeness! It combines modern web technologies with fun gameplay to create an engaging experience that showcases just how legendary Landon really is.

**Made with ❤️ for the legend himself!** 🌟

---

### 🏆 High Scores Challenge

Think you can beat the high score? Share your best scores and challenge others to beat Landon's legendary jumping skills!

**Have fun and keep being awesome, Landon!** 😎✨
