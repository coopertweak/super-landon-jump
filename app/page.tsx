'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, RotateCcw, Trophy, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Obstacle {
  id: number
  x: number
  width: number
  height: number
  scored?: boolean
}

interface Particle {
  id: number
  x: number
  y: number
  color: string
  vx: number
  vy: number
}

export default function LandonJumpGame() {
  // Game state
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameOver'>('menu')
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [gameSpeed, setGameSpeed] = useState(2)
  
  // Player state
  const [landonY, setLandonY] = useState(0)
  const [landonVelocity, setLandonVelocity] = useState(0)
  const [isJumping, setIsJumping] = useState(false)
  
  // Game objects
  const [obstacles, setObstacles] = useState<Obstacle[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  
  // Game constants  
  const GRAVITY = -0.6  // Negative gravity pulls DOWN (toward ground)
  const JUMP_FORCE = 12   // Positive jump force goes UP
  const GROUND_Y = 0
  const LANDON_SIZE = 80
  const GAME_WIDTH = 800
  const GAME_HEIGHT = 400
  
  // Refs
  const gameLoopRef = useRef<number>()
  const lastObstacleRef = useRef(0)
  const physicsRef = useRef({ y: 0, velocity: 0, isJumping: false })
  
  // Initialize physics to ground state
  useEffect(() => {
    physicsRef.current = { y: 0, velocity: 0, isJumping: false }
    console.log('Physics initialized to:', physicsRef.current)
  }, [])

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem('landon-jump-high-score')
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore))
    }
  }, [])

  // Save high score to localStorage
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score)
      localStorage.setItem('landon-jump-high-score', score.toString())
    }
  }, [score, highScore])

  // Jump function using physics ref
  const jump = useCallback(() => {
    const physics = physicsRef.current
    if (gameState === 'playing' && physics.y <= GROUND_Y && !physics.isJumping) {
      physics.velocity = JUMP_FORCE  // Positive velocity = upward
      physics.isJumping = true
      
      console.log('Jumping! Y:', physics.y, 'Velocity:', physics.velocity, 'isJumping:', physics.isJumping)
      
      // Create jump particles
      const jumpParticles: Particle[] = Array.from({length: 8}, (_, i) => ({
        id: Date.now() + i,
        x: 100 + LANDON_SIZE/2 + (Math.random() - 0.5) * 40,
        y: 80 + LANDON_SIZE/2,
        color: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57', '#ff9ff3'][Math.floor(Math.random() * 5)],
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * -5 - 3
      }))
      setParticles(prev => [...prev, ...jumpParticles])
    }
  }, [gameState])

  // Generate obstacles with progressive difficulty
  const generateObstacle = () => {
    const now = Date.now()
    // Start with very generous gaps, get closer as speed increases
    const baseGap = 4000 // 4 seconds initially - very easy!
    const minGap = 1500  // Minimum 1.5 seconds at max speed
    const gap = Math.max(minGap, baseGap / gameSpeed)
    
    if (now - lastObstacleRef.current > gap) {
      const newObstacle: Obstacle = {
        id: now,
        x: GAME_WIDTH,
        width: 35,  // Fixed width for motorcycle
        height: 30  // Fixed height for motorcycle
      }
      setObstacles(prev => [...prev, newObstacle])
      lastObstacleRef.current = now
    }
  }

  // Check collision with proper coordinates
  const checkCollision = (landonY: number, obstacles: Obstacle[]) => {
    const landonX = 100
    const landonBottom = 80 + landonY  // Bottom of Landon relative to ground
    const landonTop = landonBottom + LANDON_SIZE  // Top of Landon
    const landonLeft = landonX
    const landonRight = landonX + LANDON_SIZE

    for (const obstacle of obstacles) {
      const obstacleBottom = 80  // Ground level
      const obstacleTop = obstacleBottom + obstacle.height
      const obstacleLeft = obstacle.x
      const obstacleRight = obstacle.x + obstacle.width

      // Check if Landon overlaps with obstacle
      if (landonRight > obstacleLeft && 
          landonLeft < obstacleRight && 
          landonTop > obstacleBottom && 
          landonBottom < obstacleTop) {
        return true
      }
    }
    return false
  }

  // Game loop with proper physics using refs
  const gameLoop = useCallback(() => {
    if (gameState !== 'playing') {
      // Stop the game loop if not playing
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
      }
      return
    }

    // Update physics using refs to avoid state update issues
    const physics = physicsRef.current
    
    // Emergency reset if physics go crazy
    if (Math.abs(physics.y) > 1000 || Math.abs(physics.velocity) > 100) {
      console.log('EMERGENCY PHYSICS RESET! Y was:', physics.y, 'Velocity was:', physics.velocity)
      physics.y = 0
      physics.velocity = 0
      physics.isJumping = false
      // Stop applying gravity after emergency reset
      setLandonY(0)
      setLandonVelocity(0)
      setIsJumping(false)
      return
    }
    
    // Only apply physics if Landon is in the air OR has upward velocity (jumping)
    if (physics.y > GROUND_Y || physics.velocity > 0) {
      // Apply gravity (pulls down)
      physics.velocity += GRAVITY
      physics.y += physics.velocity
      
      // Debug jump arc
      if (physics.isJumping || physics.y > 0) {
        console.log('Jump arc - Y:', physics.y.toFixed(1), 'Velocity:', physics.velocity.toFixed(1))
      }
      
      // Check ground collision
      if (physics.y <= GROUND_Y) {
        physics.y = GROUND_Y
        physics.velocity = 0
        physics.isJumping = false
        console.log('Landed on ground! Perfect landing at Y:', physics.y)
        
        // Create landing particles
        const landingParticles: Particle[] = Array.from({length: 6}, (_, i) => ({
          id: Date.now() + i + 1000,
          x: 100 + LANDON_SIZE/2 + (Math.random() - 0.5) * 60,
          y: 80,
          color: ['#22c55e', '#10b981', '#059669'][Math.floor(Math.random() * 3)],
          vx: (Math.random() - 0.5) * 8,
          vy: Math.random() * 3 + 2
        }))
        setParticles(prev => [...prev, ...landingParticles])
      }
    } else {
      // Landon is on the ground and should stay there
      physics.y = GROUND_Y
      physics.velocity = 0
      if (physics.isJumping) {
        physics.isJumping = false
        console.log('Forced to ground, stopping movement')
      }
    }
    
    // Update React state
    setLandonY(physics.y)
    setLandonVelocity(physics.velocity)
    setIsJumping(physics.isJumping)
    
    // Only log physics when something interesting happens
    if (physics.y > 0 || physics.velocity !== 0) {
      console.log('Physics:', physics)
    }

    // Update obstacles and check collisions
    setObstacles(prevObstacles => {
      const newObstacles = prevObstacles
        .map(obstacle => ({ ...obstacle, x: obstacle.x - gameSpeed * 4 }))  // Move obstacles faster
        .filter(obstacle => obstacle.x + obstacle.width > -50)
      
      // Check collision with current Landon position
      if (checkCollision(physics.y, newObstacles)) {
        setGameState('gameOver')
        console.log('Game Over - Collision detected!')
        return newObstacles
      }

      // Update score when Landon passes obstacles
      newObstacles.forEach(obstacle => {
        // Check if Landon just passed this obstacle
        if (obstacle.x + obstacle.width < 100 && !obstacle.scored) {
          obstacle.scored = true
          setScore(prev => prev + 10)
        }
      })

      return newObstacles
    })

    // Update particles
    setParticles(prevParticles => 
      prevParticles
        .map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.5
        }))
        .filter(particle => particle.y > -50 && particle.x > -50 && particle.x < GAME_WIDTH + 50)
    )

    generateObstacle()
    // Much slower speed progression - starts easy!
    setGameSpeed(prev => Math.min(prev + 0.0005, 2.5))

    // Only schedule next frame if still playing
    if (gameState === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop)
    }
  }, [gameState])

  // Start game loop
  useEffect(() => {
    // Cancel any existing loop first
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current)
      gameLoopRef.current = undefined
    }

    if (gameState === 'playing') {
      console.log('Starting game loop for state:', gameState)
      // Start the game loop
      const startLoop = () => {
        if (gameState === 'playing' && !gameLoopRef.current) {
          gameLoopRef.current = requestAnimationFrame(gameLoop)
        }
      }
      startLoop()
    } else {
      console.log('Stopping game loop, game state:', gameState)
      // Reset physics when not playing
      if (gameState === 'menu' || gameState === 'gameOver') {
        physicsRef.current = { y: 0, velocity: 0, isJumping: false }
        setLandonY(0)
        setLandonVelocity(0)
        setIsJumping(false)
        console.log('Physics reset to ground state')
      }
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current)
        gameLoopRef.current = undefined
      }
    }
  }, [gameState])

  // Handle keyboard and touch input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        if (gameState === 'menu' || gameState === 'gameOver') {
          startGame()
        } else {
          jump()
        }
      }
    }

    const handleTouch = (e: TouchEvent) => {
      e.preventDefault()
      if (gameState === 'menu' || gameState === 'gameOver') {
        startGame()
      } else {
        jump()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    window.addEventListener('touchstart', handleTouch)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
      window.removeEventListener('touchstart', handleTouch)
    }
  }, [gameState, jump])

  const startGame = () => {
    // Stop any existing game loop
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current)
      gameLoopRef.current = undefined
    }
    
    // Reset everything to initial state
    setScore(0)
    setGameSpeed(1)  // Start slower for easier gameplay
    
    // FORCE reset physics to ground level
    physicsRef.current = { y: 0, velocity: 0, isJumping: false }
    setLandonY(0)
    setLandonVelocity(0)
    setIsJumping(false)
    
    setObstacles([])
    setParticles([])
    lastObstacleRef.current = 0
    
    console.log('Game started, physics FORCE reset to:', physicsRef.current)
    
    // Set game state last so useEffect can start clean loop
    setGameState('playing')
  }

  const resetGame = () => {
    setGameState('menu')
    setScore(0)
    setGameSpeed(2)
    
    // Stop any running game loop
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current)
    }
    
    // Reset physics completely
    physicsRef.current = { y: 0, velocity: 0, isJumping: false }
    setLandonY(0)
    setLandonVelocity(0)
    setIsJumping(false)
    
    setObstacles([])
    setParticles([])
    
    console.log('Game reset, physics reset to:', physicsRef.current)
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900 via-blue-900 to-slate-900 opacity-50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-pink-900 via-purple-900 to-transparent opacity-30" />
      </div>



      {/* Main game container */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        
        {/* Game Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            SUPER LANDON JUMP
          </h1>
          <p className="text-white/60 text-lg">Help Landon jump over obstacles and become legendary!</p>
        </motion.div>

        {/* Game Screen */}
        <motion.div
          className="relative border-4 border-white/20 rounded-2xl overflow-hidden bg-gradient-to-b from-cyan-900/20 to-blue-900/20 backdrop-blur-sm mx-auto w-full max-w-4xl"
          style={{ 
            width: '100%',
            height: '400px',
            maxWidth: '800px'
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onClick={() => gameState === 'playing' && jump()}
          onTouchStart={(e) => {
            e.preventDefault()
            if (gameState === 'playing') jump()
          }}
        >
          {/* Game UI Overlay */}
          <div className="absolute top-4 left-4 z-20 text-white">
            <div className="text-xl font-bold">Score: {score}</div>
            <div className="text-sm opacity-75">High Score: {highScore}</div>
          </div>

          {/* Ground */}
          <div 
            className="absolute bottom-0 w-full bg-gradient-to-t from-green-600 to-green-500 border-t-2 border-green-400"
            style={{ height: '80px' }}
          >
            {/* Ground pattern */}
            <div className="absolute inset-0 opacity-30">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute bottom-0 w-8 h-4 bg-green-700 rounded-t"
                  style={{ left: `${i * 40}px` }}
                />
              ))}
            </div>
          </div>

          {/* Landon Character - The Cool Kid */}
          <motion.div
            className="absolute flex items-center justify-center"
            style={{
              width: LANDON_SIZE,
              height: LANDON_SIZE,
              left: '100px',
              bottom: `${80 + Math.max(0, landonY)}px`,
            }}
            animate={{
              rotate: isJumping ? 360 : 0,  // Clean 360 flip
              scale: isJumping ? 1.1 : 1,
            }}
            transition={{ 
              duration: 0.6,
              ease: "easeInOut"
            }}
          >
            {/* Landon's Body */}
            <div className="relative">
              {/* Head */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full border-2 border-white/50 flex items-center justify-center">
                {/* Cool Sunglasses */}
                <div className="w-8 h-3 bg-black rounded-full flex items-center justify-center">
                  <div className="w-6 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-80"></div>
                </div>
                {/* Cool Hair */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-10 h-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-full"></div>
              </div>
              
              {/* Body */}
              <div className="w-14 h-16 bg-gradient-to-b from-pink-400 via-purple-500 to-blue-600 rounded-lg border-2 border-white/30 shadow-lg flex flex-col items-center justify-center relative">
                {/* Cool "L" on shirt */}
                <div className="text-white font-black text-xl drop-shadow-lg">L</div>
                
                {/* Arms */}
                <div className="absolute -left-3 top-2 w-6 h-3 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transform -rotate-12"></div>
                <div className="absolute -right-3 top-2 w-6 h-3 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full transform rotate-12"></div>
                
                {/* Legs - animated for landing */}
                <motion.div 
                  className="absolute -bottom-4 left-2 w-3 h-8 bg-gradient-to-b from-blue-600 to-purple-700 rounded-full"
                  animate={{
                    scaleY: isJumping ? 0.8 : 1,
                    y: isJumping ? 2 : 0
                  }}
                  transition={{ duration: 0.2 }}
                />
                <motion.div 
                  className="absolute -bottom-4 right-2 w-3 h-8 bg-gradient-to-b from-blue-600 to-purple-700 rounded-full"
                  animate={{
                    scaleY: isJumping ? 0.8 : 1,
                    y: isJumping ? 2 : 0
                  }}
                  transition={{ duration: 0.2 }}
                />
                
                {/* Cool Cape */}
                <motion.div 
                  className="absolute -top-1 -left-1 w-16 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-t-lg opacity-80"
                  animate={{
                    scaleX: isJumping ? [1, 1.3, 1] : [1, 1.1, 1],
                  }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  style={{ zIndex: -1 }}
                />
              </div>
              
              {/* Cool Shoes */}
              <div className="absolute -bottom-6 left-1 w-4 h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full border border-white/30"></div>
              <div className="absolute -bottom-6 right-1 w-4 h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full border border-white/30"></div>
            </div>
            
            {/* Cool Aura Effect */}
            <motion.div
              className="absolute inset-0 rounded-full"
              animate={{
                boxShadow: [
                  "0 0 20px rgba(236, 72, 153, 0.5)",
                  "0 0 40px rgba(139, 69, 255, 0.7)",
                  "0 0 20px rgba(59, 130, 246, 0.5)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          {/* Sportbike Motorcycles */}
          {obstacles.map((obstacle) => (
            <motion.div
              key={obstacle.id}
              className="absolute bottom-20 flex items-center justify-center"
              style={{
                left: `${obstacle.x}px`,
                width: `${obstacle.width}px`,
                height: `${obstacle.height}px`,
              }}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
            >
              {/* Sportbike Motorcycle */}
              <div className="relative w-full h-full">
                {/* Main bike frame */}
                <div className="absolute bottom-1 left-2 w-6 h-3 bg-gradient-to-r from-red-500 to-red-700 rounded-sm border border-red-300 shadow-sm"></div>
                
                {/* Fuel tank */}
                <div className="absolute bottom-3 left-3 w-4 h-2 bg-gradient-to-b from-red-400 to-red-600 rounded-full"></div>
                
                {/* Front fairing */}
                <div className="absolute bottom-2 right-1 w-3 h-4 bg-gradient-to-br from-white to-gray-200 rounded-r-lg border border-gray-300"></div>
                
                {/* Windscreen */}
                <div className="absolute bottom-4 right-0.5 w-2 h-3 bg-gradient-to-t from-blue-400/70 to-cyan-300/90 rounded-t-sm border border-cyan-200/60"></div>
                
                {/* Front wheel */}
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-gradient-to-br from-gray-900 to-black rounded-full border-2 border-gray-700">
                  <div className="absolute inset-0.5 border border-gray-500 rounded-full"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
                
                {/* Back wheel */}
                <div className="absolute bottom-0 left-0 w-4 h-4 bg-gradient-to-br from-gray-900 to-black rounded-full border-2 border-gray-700">
                  <div className="absolute inset-0.5 border border-gray-500 rounded-full"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-gray-400 rounded-full"></div>
                </div>
                
                {/* Exhaust pipes */}
                <div className="absolute bottom-1 left-0 w-2 h-1 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full"></div>
                <div className="absolute bottom-0.5 left-0 w-1.5 h-0.5 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full opacity-80"></div>
                
                {/* Headlight */}
                <div className="absolute bottom-2 right-0 w-1 h-1 bg-gradient-to-r from-yellow-300 to-white rounded-full border border-yellow-200 shadow-sm"></div>
                
                {/* Speed lines */}
                <motion.div
                  className="absolute -left-3 top-1/2 transform -translate-y-1/2"
                  animate={{ x: [-3, 3, -3], opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 0.4, repeat: Infinity }}
                >
                  <div className="w-4 h-0.5 bg-white/40 rounded-full mb-0.5"></div>
                  <div className="w-3 h-0.5 bg-white/30 rounded-full mb-0.5"></div>
                  <div className="w-2 h-0.5 bg-white/20 rounded-full"></div>
                </motion.div>
              </div>
            </motion.div>
          ))}

          {/* Game particles */}
          <AnimatePresence>
            {particles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute w-2 h-2 rounded-full pointer-events-none z-30"
                style={{
                  left: `${particle.x}px`,
                  bottom: `${particle.y}px`,
                  backgroundColor: particle.color,
                  boxShadow: `0 0 10px ${particle.color}`,
                }}
                initial={{ opacity: 1 }}
                animate={{ opacity: [1, 0.5, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
              />
            ))}
          </AnimatePresence>

          {/* Game State Overlays */}
          <AnimatePresence>
            {gameState === 'menu' && (
              <motion.div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-8 text-center">
                  <CardContent>
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to Jump?</h2>
                    <p className="text-white/70 mb-6">Press SPACE or click to jump over obstacles!</p>
                    <Button
                      variant="neon"
                      size="lg"
                      onClick={startGame}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Game
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {gameState === 'gameOver' && (
              <motion.div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="bg-white/10 backdrop-blur-xl border-white/20 p-8 text-center">
                  <CardContent>
                    <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
                    <div className="text-white/70 mb-6">
                      <div className="text-xl mb-2">Final Score: {score}</div>
                      {score === highScore && score > 0 && (
                        <div className="text-yellow-400 flex items-center justify-center gap-2">
                          <Trophy className="w-5 h-5" />
                          New High Score!
                          <Trophy className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div className="flex gap-4 justify-center">
                      <Button
                        variant="neon"
                        onClick={startGame}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Play Again
                      </Button>
                      <Button
                        variant="glass"
                        onClick={resetGame}
                        className="text-white"
                      >
                        <RotateCcw className="w-5 h-5 mr-2" />
                        Menu
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Instructions */}
        <motion.div
          className="mt-6 text-center text-white/60 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-sm">
            Press <kbd className="px-2 py-1 bg-white/20 rounded">SPACE</kbd>, 
            click, or <span className="md:hidden">tap screen</span><span className="hidden md:inline">click</span> to jump!
          </p>
          <p className="text-xs mt-2">Avoid obstacles and see how legendary you can become!</p>
          <p className="text-xs mt-1 md:hidden">📱 Mobile-optimized for touch controls!</p>
        </motion.div>

        {/* Fun messages based on score */}
        <AnimatePresence>
          {score > 0 && gameState === 'playing' && (
            <motion.div
              className="absolute top-20 left-1/2 transform -translate-x-1/2 text-white text-lg font-bold"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {score >= 100 && "🚀 LEGENDARY LANDON! 🚀"}
              {score >= 50 && score < 100 && "⭐ SUPER COOL! ⭐"}
              {score >= 20 && score < 50 && "😎 Getting Awesome! 😎"}
              {score >= 10 && score < 20 && "🌟 Nice Jump! 🌟"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
