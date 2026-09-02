'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

const GRID = 20
const CELL = 20

type Point = { x: number; y: number }
type Dir = { dx: number; dy: number }

function randomFood(snake: Point[]): Point {
  let food: Point
  do {
    food = {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID),
    }
  } while (snake.some(s => s.x === food.x && s.y === food.y))
  return food
}

interface Props {
  onEnterPortfolio: () => void
  onScoreUpdate?: (score: number) => void
}

export default function SnakeGame({ onEnterPortfolio, onScoreUpdate }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentScore, setCurrentScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isGameStarted, setIsGameStarted] = useState(false)

  const stateRef = useRef({
    snake: [{ x: 10, y: 10 }] as Point[],
    dir: { dx: 1, dy: 0 } as Dir,
    nextDir: { dx: 1, dy: 0 } as Dir,
    food: { x: 14, y: 10 } as Point,
    score: 0,
    running: false,
    dead: false,
    frameId: 0,
    lastTime: 0,
    speed: 130,
  })

  useEffect(() => {
    const saved = localStorage.getItem('snake_highscore')
    if (saved) setHighScore(parseInt(saved, 10))
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const s = stateRef.current

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Subtle grid lines
    ctx.strokeStyle = '#f3f4f6'
    ctx.lineWidth = 0.5
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath()
      ctx.moveTo(i * CELL, 0)
      ctx.lineTo(i * CELL, GRID * CELL)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i * CELL)
      ctx.lineTo(GRID * CELL, i * CELL)
      ctx.stroke()
    }

    // Food (Black dot)
    ctx.fillStyle = '#000000'
    const fx = s.food.x * CELL + CELL / 2
    const fy = s.food.y * CELL + CELL / 2
    ctx.beginPath()
    ctx.arc(fx, fy, CELL / 2 - 2, 0, Math.PI * 2)
    ctx.fill()

    // Snake
    s.snake.forEach((seg, i) => {
      const alpha = i === 0 ? 1 : Math.max(0.2, 1 - (i / s.snake.length) * 0.7)
      ctx.fillStyle = i === 0 ? '#000000' : `rgba(0,0,0,${alpha})`
      const size = i === 0 ? CELL - 1 : CELL - 3
      const offset = i === 0 ? 0 : 1
      ctx.fillRect(seg.x * CELL + offset, seg.y * CELL + offset, size, size)
    })
  }, [])

  const resetGame = useCallback(() => {
    const s = stateRef.current
    s.snake = [{ x: 10, y: 10 }]
    s.dir = { dx: 1, dy: 0 }
    s.nextDir = { dx: 1, dy: 0 }
    s.food = randomFood(s.snake)
    s.score = 0
    s.running = true
    s.dead = false
    s.lastTime = 0
    setCurrentScore(0)
    setIsGameOver(false)
    setIsGameStarted(true)
    draw()
  }, [draw])

  const loop = useCallback((timestamp: number) => {
    const s = stateRef.current
    if (!s.running) return

    if (timestamp - s.lastTime >= s.speed) {
      s.lastTime = timestamp
      s.dir = s.nextDir

      const head: Point = {
        x: s.snake[0].x + s.dir.dx,
        y: s.snake[0].y + s.dir.dy,
      }

      // Wall collision
      if (head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID) {
        s.running = false
        s.dead = true
        setIsGameOver(true)
        draw()
        return
      }
      // Self collision
      if (s.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        s.running = false
        s.dead = true
        setIsGameOver(true)
        draw()
        return
      }

      s.snake.unshift(head)

      if (head.x === s.food.x && head.y === s.food.y) {
        s.score += 1
        setCurrentScore(s.score)
        if (onScoreUpdate) onScoreUpdate(s.score)

        // Update high score
        const prev = parseInt(localStorage.getItem('snake_highscore') ?? '0', 10)
        if (s.score > prev) {
          localStorage.setItem('snake_highscore', String(s.score))
          setHighScore(s.score)
        }

        s.food = randomFood(s.snake)
      } else {
        s.snake.pop()
      }
    }

    draw()
    s.frameId = requestAnimationFrame(loop)
  }, [draw, onScoreUpdate])

  useEffect(() => {
    const s = stateRef.current

    const handleKey = (e: KeyboardEvent) => {
      const { dx, dy } = s.nextDir
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W':
          if (dy !== 1) s.nextDir = { dx: 0, dy: -1 }; break
        case 'ArrowDown': case 's': case 'S':
          if (dy !== -1) s.nextDir = { dx: 0, dy: 1 }; break
        case 'ArrowLeft': case 'a': case 'A':
          if (dx !== 1) s.nextDir = { dx: -1, dy: 0 }; break
        case 'ArrowRight': case 'd': case 'D':
          if (dx !== -1) s.nextDir = { dx: 1, dy: 0 }; break
        case ' ':
          if (s.dead) {
            resetGame()
            s.frameId = requestAnimationFrame(loop)
          } else if (!s.running && !s.dead) {
            s.running = true
            setIsGameStarted(true)
            s.frameId = requestAnimationFrame(loop)
          }
          break
      }

      // Start on first direction key
      if (!s.running && !s.dead && ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'].includes(e.key)) {
        s.running = true
        setIsGameStarted(true)
        s.lastTime = 0
        s.frameId = requestAnimationFrame(loop)
      }
    }

    window.addEventListener('keydown', handleKey)
    draw()

    return () => {
      window.removeEventListener('keydown', handleKey)
      cancelAnimationFrame(s.frameId)
    }
  }, [draw, loop, resetGame])

  const handleStartOrRestart = () => {
    resetGame()
    stateRef.current.frameId = requestAnimationFrame(loop)
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Live Score Counter */}
      <div className="flex items-center justify-between w-full px-1 text-xs text-gray-500 font-medium">
        <span>Skor: <strong className="text-black text-sm">{currentScore}</strong></span>
        <span>High Score: <strong className="text-black text-sm">{highScore}</strong></span>
      </div>

      {/* Canvas Box */}
      <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-white shadow-inner">
        <canvas
          ref={canvasRef}
          width={GRID * CELL}
          height={GRID * CELL}
          style={{ imageRendering: 'pixelated', display: 'block' }}
        />

        {/* Game Over Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <p className="text-lg font-bold text-gray-900 mb-1">Game Over!</p>
            <p className="text-xs text-gray-500 mb-4">
              Skor akhir: <strong className="text-black text-sm">{currentScore}</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
              <button
                onClick={handleStartOrRestart}
                className="flex-1 py-2 px-3 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Main Lagi ↺
              </button>
              <button
                onClick={onEnterPortfolio}
                className="flex-1 py-2 px-3 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:border-black hover:text-black transition-colors"
              >
                Masuk Portfolio →
              </button>
            </div>
          </div>
        )}

        {/* Idle Start Prompt */}
        {!isGameStarted && !isGameOver && (
          <div
            onClick={handleStartOrRestart}
            className="absolute inset-0 bg-black/5 flex items-center justify-center cursor-pointer hover:bg-black/10 transition-colors"
          >
            <span className="bg-white/95 px-3 py-1.5 rounded-md border border-gray-200 text-xs font-medium text-gray-700 shadow-sm">
              Klik / Tekan Tombol Arah untuk Main
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
