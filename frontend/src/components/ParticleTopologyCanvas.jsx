import React, { useEffect, useRef, useState } from 'react'

export function ParticleTopologyCanvas ({ isGenerating = false, activeDemographic = 'c_level' }) {
  const canvasRef = useRef(null)
  const [isPaused, setIsPaused] = useState(false)
  const animationFrameId = useRef(null)
  const mousePos = useRef({ x: -1000, y: -1000, isHovering: false })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Detect user accessibility preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      setIsPaused(true)
    }

    let width = (canvas.width = canvas.parentElement.clientWidth)
    let height = (canvas.height = canvas.parentElement.clientHeight || 240)

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return
      width = canvas.width = canvas.parentElement.clientWidth
      height = canvas.height = canvas.parentElement.clientHeight || 240
    }
    window.addEventListener('resize', handleResize)

    // Generate 4D particles in hyper-space [-1, 1]^4
    const PARTICLE_COUNT = 55
    const particles = []

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x4: (Math.random() - 0.5) * 2,
        y4: (Math.random() - 0.5) * 2,
        z4: (Math.random() - 0.5) * 2,
        w4: (Math.random() - 0.5) * 2,
        vx: (Math.random() - 0.5) * 0.005,
        vy: (Math.random() - 0.5) * 0.005,
        vz: (Math.random() - 0.5) * 0.005,
        vw: (Math.random() - 0.5) * 0.008,
        baseColor: i % 3 === 0 ? '#06b6d4' : i % 3 === 1 ? '#6366f1' : '#10b981',
        radius: 2.2 + Math.random() * 2
      })
    }

    let time = 0

    const render = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, width, height)

      if (!isPaused) {
        time += isGenerating ? 0.035 : 0.012
      }

      // 4D Rotation matrix angles
      const cosT = Math.cos(time)
      const sinT = Math.sin(time)
      const cosW = Math.cos(time * 0.7)
      const sinW = Math.sin(time * 0.7)

      const projected = []

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        if (!isPaused) {
          p.x4 += p.vx * (isGenerating ? 2.5 : 1)
          p.y4 += p.vy * (isGenerating ? 2.5 : 1)
          p.z4 += p.vz * (isGenerating ? 2.5 : 1)
          p.w4 += p.vw * (isGenerating ? 2.5 : 1)

          // Bounce boundaries
          if (Math.abs(p.x4) > 1) p.vx *= -1
          if (Math.abs(p.y4) > 1) p.vy *= -1
          if (Math.abs(p.z4) > 1) p.vz *= -1
          if (Math.abs(p.w4) > 1) p.vw *= -1
        }

        // Apply 4D rotation in XW and ZW planes
        const rotX = p.x4 * cosT - p.w4 * sinT
        const rotW1 = p.x4 * sinT + p.w4 * cosT

        const rotZ = p.z4 * cosW - rotW1 * sinW
        const rotW2 = p.z4 * sinW + rotW1 * cosW

        // 4D -> 3D perspective projection (Distance factor in 4th dimension)
        const d4 = 2.4
        const factor4 = d4 / (d4 - rotW2)

        const x3 = rotX * factor4
        const y3 = p.y4 * factor4
        const z3 = rotZ * factor4

        // 3D -> 2D screen coordinates
        const d3 = 2.8
        const factor3 = d3 / (d3 - z3)

        let screenX = width / 2 + x3 * factor3 * (width * 0.32)
        let screenY = height / 2 + y3 * factor3 * (height * 0.38)

        // Mouse deflection interaction
        if (mousePos.current.isHovering) {
          const dx = screenX - mousePos.current.x
          const dy = screenY - mousePos.current.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120 && dist > 1) {
            const force = (120 - dist) / 120
            screenX += (dx / dist) * force * 24
            screenY += (dy / dist) * force * 24
          }
        }

        const alpha = Math.max(0.15, Math.min(0.9, (z3 + 1.2) / 2.4))
        projected.push({
          x: screenX,
          y: screenY,
          alpha,
          color: p.baseColor,
          radius: p.radius * Math.max(0.6, factor3 * 0.9)
        })
      }

      // Draw connection vectors between close nodes
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i]
          const p2 = projected[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < 90) {
            const lineAlpha = (1 - dist / 90) * 0.18 * Math.min(p1.alpha, p2.alpha)
            ctx.strokeStyle = isGenerating ? `rgba(6, 182, 212, ${lineAlpha * 2.2})` : `rgba(99, 102, 241, ${lineAlpha})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      }

      // Draw particles
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i]
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.alpha
        ctx.fill()

        // Core glow
        if (p.alpha > 0.6) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius * 2.2, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = p.alpha * 0.25
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1.0

      animationFrameId.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [isPaused, isGenerating, activeDemographic])

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    mousePos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      isHovering: true
    }
  }

  const handleMouseLeave = () => {
    mousePos.current.isHovering = false
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '220px',
        overflow: 'hidden',
        borderRadius: '16px',
        background: 'radial-gradient(ellipse at 50% 50%, #111b2b 0%, #090e18 100%)',
        border: '1px solid rgba(255, 255, 255, 0.08)'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
        aria-label="4D Demographic Affinity and Ad Performance Topology Visualizer"
      />

      {/* Topology Overlay HUD */}
      <div
        style={{
          position: 'absolute',
          top: '12px',
          left: '16px',
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isGenerating ? '#06b6d4' : '#10b981',
              boxShadow: isGenerating ? '0 0 8px #06b6d4' : '0 0 8px #10b981',
              animation: 'pulseGlow 2s infinite'
            }}
          />
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.05em' }}>
            DEMOGRAPHIC TOPOLOGY — 4D AFFINITY FIELD
          </span>
        </div>
        <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
          w(t) = sin(t · ω) | Target: {activeDemographic.toUpperCase()} | {isGenerating ? 'SYNTHESIZING PROMPT VECTORS...' : 'IDLE / READY'}
        </span>
      </div>

      {/* Accessible Pause / Motion Control */}
      <div style={{ position: 'absolute', bottom: '10px', right: '14px' }}>
        <button
          onClick={() => setIsPaused(!isPaused)}
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#94a3b8',
            fontSize: '0.7rem',
            padding: '4px 10px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
          title={isPaused ? 'Resume animation' : 'Pause animation (reduces CPU & motion)'}
        >
          {isPaused ? '▶ Resume Topology' : '⏸ Pause Topology'}
        </button>
      </div>
    </div>
  )
}

