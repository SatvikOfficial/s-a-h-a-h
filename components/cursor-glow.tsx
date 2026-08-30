'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

// A soft saffron glow that trails the cursor. Native cursor is left visible;
// this just adds a subtle ambient accent. It auto-hides on touch/coarse pointers.
export function CursorGlow() {
  const [coarse, setCoarse] = useState(false)
  const mx = useMotionValue(-400)
  const my = useMotionValue(-400)
  const x = useSpring(mx, { stiffness: 140, damping: 22, mass: 0.4 })
  const y = useSpring(my, { stiffness: 140, damping: 22, mass: 0.4 })

  useEffect(() => {
    setCoarse(window.matchMedia('(pointer: coarse)').matches)
    function move(e: PointerEvent) {
      mx.set(e.clientX)
      my.set(e.clientY)
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [mx, my])

  if (coarse) return null

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-0 hidden md:block"
      style={{ x, y }}
    >
      <div className="size-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-saffron/10 blur-3xl" />
    </motion.div>
  )
}
