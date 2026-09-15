'use client'

import { useEffect, useRef, useCallback, useState, type TouchEvent } from 'react'

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

// Simple synth sounds using Web Audio API
const playSound = (type: 'eat' | 'die') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    if (type === 'eat') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(800, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1)
      gainNode.gain.setValueAtTime(0.1, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.1)
    } else if (type === 'die') {
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(300, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3)
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.3)
    }
  } catch (e) {
    // Ignore audio errors if browser blocks auto-play
  }
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

    // Background
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Subtle grid lines
    ctx.strokeStyle = '#e5e7eb' // gray-200
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

    // Food (Apple)
    const fx = s.food.x * CELL + CELL / 2
    const fy = s.food.y * CELL + CELL / 2

    // Apple shadow
    ctx.fillStyle = 'rgba(0,0,0,0.1)'
    ctx.beginPath()
    ctx.arc(fx + 2, fy + 2, CELL / 2 - 2, 0, Math.PI * 2)
    ctx.fill()

    // Apple body
    ctx.fillStyle = '#ef4444' // red-500
    ctx.beginPath()
    ctx.arc(fx, fy, CELL / 2 - 2, 0, Math.PI * 2)
    ctx.fill()

    // Apple leaf
    ctx.fillStyle = '#22c55e'
    ctx.beginPath()
    ctx.ellipse(fx + 2, fy - 4, 3, 1.5, Math.PI / 4, 0, Math.PI * 2)
    ctx.fill()

    // Snake
    s.snake.forEach((seg, i) => {
      const isHead = i === 0
      const cx = seg.x * CELL + CELL / 2
      const cy = seg.y * CELL + CELL / 2
      const radius = isHead ? CELL / 2 - 1 : CELL / 2 - 2

      // Snake shadow
      ctx.fillStyle = 'rgba(0,0,0,0.1)'
      ctx.beginPath()
      ctx.arc(cx + 1, cy + 1, radius, 0, Math.PI * 2)
      ctx.fill()

      // Snake body (gradient from green to dark green)
      const alpha = isHead ? 1 : Math.max(0.4, 1 - (i / s.snake.length) * 0.5)
      ctx.fillStyle = isHead ? '#10b981' : `rgba(5, 150, 105, ${alpha})` // emerald-500 to emerald-600
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.fill()

      if (isHead) {
        // Draw Eyes based on direction
        ctx.fillStyle = '#ffffff'
        const eyeRadius = 2.5
        const pupilRadius = 1

        let eye1 = { x: cx, y: cy }
        let eye2 = { x: cx, y: cy }

        if (s.dir.dx === 1) { // right
          eye1 = { x: cx + 2, y: cy - 4 }
          eye2 = { x: cx + 2, y: cy + 4 }
        } else if (s.dir.dx === -1) { // left
          eye1 = { x: cx - 2, y: cy - 4 }
          eye2 = { x: cx - 2, y: cy + 4 }
        } else if (s.dir.dy === 1) { // down
          eye1 = { x: cx - 4, y: cy + 2 }
          eye2 = { x: cx + 4, y: cy + 2 }
        } else if (s.dir.dy === -1) { // up
          eye1 = { x: cx - 4, y: cy - 2 }
          eye2 = { x: cx + 4, y: cy - 2 }
        } else { // initial/idle (right)
          eye1 = { x: cx + 2, y: cy - 4 }
          eye2 = { x: cx + 2, y: cy + 4 }
        }

        ctx.beginPath(); ctx.arc(eye1.x, eye1.y, eyeRadius, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(eye2.x, eye2.y, eyeRadius, 0, Math.PI * 2); ctx.fill()

        ctx.fillStyle = '#000000'
        ctx.beginPath(); ctx.arc(eye1.x, eye1.y, pupilRadius, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(eye2.x, eye2.y, pupilRadius, 0, Math.PI * 2); ctx.fill()
      }
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

  const loop = useCallback((timestamp: number) => {    const s = stateRef.current
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
        playSound('die')
        s.running = false
        s.dead = true
        setIsGameOver(true)
        draw()
        return
      }
      // Self collision
      if (s.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        playSound('die')
        s.running = false
        s.dead = true
        setIsGameOver(true)
        draw()
        return
      }

      s.snake.unshift(head)

      if (head.x === s.food.x && head.y === s.food.y) {
        playSound('eat')
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
      if (!s.running && !s.dead && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
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

  const touchStartRef = useRef<Point | null>(null)

  const setDirection = useCallback((dx: number, dy: number) => {
    const s = stateRef.current
    const { dx: curDx, dy: curDy } = s.nextDir
    // Cegah putar balik 180 derajat
    if (dx === -curDx && dy === -curDy) return
    if (dx === curDx && dy === curDy) {
      // tetap start game kalau belum jalan
    } else {
      s.nextDir = { dx, dy }
    }
    if (!s.running && !s.dead) {
      s.running = true
      setIsGameStarted(true)
      s.lastTime = 0
      cancelAnimationFrame(s.frameId)
      s.frameId = requestAnimationFrame(loop)
    }
  }, [loop])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const t = e.touches[0]
    touchStartRef.current = { x: t.clientX, y: t.clientY }
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // Cegah halaman ikut scroll saat swipe di area game
    if (e.cancelable) e.preventDefault()
    const start = touchStartRef.current
    if (!start) return
    const t = e.touches[0]
    const diffX = t.clientX - start.x
    const diffY = t.clientY - start.y
    // Threshold kecil supaya responsif tapi tidak terlalu sensitif
    if (Math.abs(diffX) < 24 && Math.abs(diffY) < 24) return
    if (Math.abs(diffX) > Math.abs(diffY)) {
      setDirection(diffX > 0 ? 1 : -1, 0)
    } else {
      setDirection(0, diffY > 0 ? 1 : -1)
    }
    // Reset titik awal agar satu swipe panjang bisa belok berkali-kali
    touchStartRef.current = { x: t.clientX, y: t.clientY }
  }, [setDirection])

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null
  }, [])

  const handleStartOrRestart = () => {
    resetGame()
    cancelAnimationFrame(stateRef.current.frameId)
    stateRef.current.frameId = requestAnimationFrame(loop)
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Live Score Counter */}
      <div className="flex items-center justify-between w-full">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-[11px] font-medium text-gray-600">
          <span className="w-1.5 h-1.5 rounded-full bg-black" />
          Skor
          <strong className="text-black text-sm tabular-nums">{currentScore}</strong>
        </span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black text-[11px] font-medium text-white">
          High Score
          <strong className="text-white text-sm tabular-nums">{highScore}</strong>
        </span>
      </div>

      {/* Canvas Box */}
      <div
        className="relative w-full rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm touch-none select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <canvas
          ref={canvasRef}
          width={GRID * CELL}
          height={GRID * CELL}
          className="block w-full aspect-square"
        />

        {/* Game Over Overlay */}
        {isGameOver && (
          <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center p-6 text-center">
            <div className="scale-in flex flex-col items-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 ring-1 ring-gray-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-lg font-bold text-gray-900 mb-1">Game Over!</p>
              <p className="text-xs text-gray-500 mb-4">
                Skor akhir: <strong className="text-black text-sm tabular-nums">{currentScore}</strong>
              </p>
              <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
                <button
                  onClick={handleStartOrRestart}
                  className="flex-1 py-2 px-3 bg-black text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Main Lagi
                </button>
                <button
                  onClick={onEnterPortfolio}
                  className="flex-1 py-2 px-3 border border-gray-300 text-gray-700 text-xs font-medium rounded-lg hover:border-black hover:text-black transition-colors"
                >
                  Masuk Portfolio
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Idle Start Prompt */}
        {!isGameStarted && !isGameOver && (
          <div
            onClick={handleStartOrRestart}
            className="absolute inset-0 bg-black/5 flex items-center justify-center cursor-pointer hover:bg-black/10 transition-colors group"
          >
            <div className="flex flex-col items-center gap-2.5">
              <div className="w-11 h-11 rounded-full bg-black flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <span className="text-[11px] font-medium text-gray-600 bg-white/90 border border-gray-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                Klik / Tap / Swipe untuk Main
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}