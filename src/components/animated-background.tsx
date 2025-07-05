"use client"

import { useEffect, useRef } from 'react'

interface Blob {
  id: number
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  blur: number
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const blobsRef = useRef<Blob[]>([])
  const animationRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Create initial blobs
    const createBlobs = () => {
      const blobs: Blob[] = []
      const numBlobs = 12 // Number of blobs

      for (let i = 0; i < numBlobs; i++) {
        blobs.push({
          id: i,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 400 + 200, // Random size between 200-600
          speedX: (Math.random() - 0.5) * 0.3, // Random speed
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.4 + 0.2, // Random opacity between 0.2-0.6
          blur: Math.random() * 30 + 15 // Random blur amount
        })
      }
      return blobs
    }

    blobsRef.current = createBlobs()

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      blobsRef.current.forEach((blob) => {
        // Update position
        blob.x += blob.speedX
        blob.y += blob.speedY

        // Bounce off edges
        if (blob.x < -blob.size || blob.x > canvas.width + blob.size) {
          blob.speedX *= -1
        }
        if (blob.y < -blob.size || blob.y > canvas.height + blob.size) {
          blob.speedY *= -1
        }

        // Keep blobs within bounds
        blob.x = Math.max(-blob.size, Math.min(canvas.width + blob.size, blob.x))
        blob.y = Math.max(-blob.size, Math.min(canvas.height + blob.size, blob.y))

        // Create gradient for blob
        const gradient = ctx.createRadialGradient(
          blob.x, blob.y, 0,
          blob.x, blob.y, blob.size
        )

        // Create different colored blobs
        const colors = [
          'rgba(147, 51, 234, 0.3)', // Purple
          'rgba(236, 72, 153, 0.3)', // Pink
          'rgba(99, 102, 241, 0.3)', // Indigo
          'rgba(168, 85, 247, 0.3)', // Violet
          'rgba(244, 63, 94, 0.3)',  // Rose
        ]

        const color = colors[blob.id % colors.length]
        gradient.addColorStop(0, color)
        gradient.addColorStop(0.7, color.replace('0.3', '0.1'))
        gradient.addColorStop(1, 'transparent')

        // Draw blob with blur effect
        ctx.save()
        ctx.filter = `blur(${blob.blur}px)`
        ctx.globalAlpha = blob.opacity
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(blob.x, blob.y, blob.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ 
        zIndex: 0,
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh'
      }}
    />
  )
} 