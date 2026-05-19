'use client'

import { useEffect, useState } from 'react'

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 3 + 2,
  delay: Math.random() * 2,
}))

const typewriterTexts = [
  'Initializing neural network...',
  'Weaving story threads...',
  'Generating narrative arc...',
  'Crafting characters...',
  'Building your world...',
]

export function StoryGeneratingAnimation() {
  const [currentText, setCurrentText] = useState('')
  const [textIndex, setTextIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)

  useEffect(() => {
    const text = typewriterTexts[textIndex]
    if (charIndex < text.length) {
      const timer = setTimeout(() => {
        setCurrentText(text.slice(0, charIndex + 1))
        setCharIndex(charIndex + 1)
      }, 40)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        setTextIndex((textIndex + 1) % typewriterTexts.length)
        setCharIndex(0)
        setCurrentText('')
      }, 1500)
      return () => clearTimeout(timer)
    }
  }, [charIndex, textIndex])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      {/* Grid background */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="sci-fi-grid" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-primary/60"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              animation: `float ${p.duration}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative flex flex-col items-center gap-8">
        {/* Glowing orb */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full border border-primary/30 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border border-primary/50 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-primary/80 animate-pulse" />
            </div>
          </div>
          {/* Orbiting ring */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-primary" />
          </div>
          {/* Outer ring */}
          <div className="absolute -in-4 animate-spin" style={{ animationDuration: '5s', animationDirection: 'reverse' }}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary/60" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-wider text-foreground mb-2">
            GENERATING
          </h2>
          <div className="flex items-center gap-1 justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary"
                style={{
                  animation: `dotPulse 1.4s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Typewriter text */}
        <div className="h-6 flex items-center">
          <p className="text-sm font-mono text-muted-foreground tracking-wide">
            {currentText}
            <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-blink" />
          </p>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-0.5 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full animate-progress" />
        </div>
      </div>
    </div>
  )
}
