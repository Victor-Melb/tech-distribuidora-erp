import React, { useState, useEffect, useCallback } from 'react'
import { flushSync } from 'react-dom'
import { ThemeContext } from './theme-context'

const STORAGE_KEY = 'techerp_theme'

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    // Fallback
  }
  return 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // Silencioso
    }
  }, [theme])

  const toggleTheme = useCallback(
    (event) => {
      const nextTheme = theme === 'dark' ? 'light' : 'dark'
      const prefersReduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // Animação radial em ondas (View Transitions API) partindo do botão clicado
      if (
        typeof document !== 'undefined' &&
        typeof document.startViewTransition === 'function' &&
        !prefersReduced &&
        event?.currentTarget
      ) {
        const rect = event.currentTarget.getBoundingClientRect()
        const x = rect.left + rect.width / 2
        const y = rect.top + rect.height / 2
        const endRadius = Math.hypot(
          Math.max(x, window.innerWidth - x),
          Math.max(y, window.innerHeight - y)
        )

        const transition = document.startViewTransition(() => {
          flushSync(() => {
            setTheme(nextTheme)
          })
          document.documentElement.classList.toggle('dark', nextTheme === 'dark')
        })

        transition.ready.then(() => {
          document.documentElement.animate(
            {
              clipPath: [
                `circle(0px at ${x}px ${y}px)`,
                `circle(${endRadius}px at ${x}px ${y}px)`,
              ],
            },
            {
              duration: 560,
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              pseudoElement: '::view-transition-new(root)',
            }
          )
        })
        return
      }

      setTheme(nextTheme)
    },
    [theme]
  )

  return (
    <ThemeContext.Provider value={{ theme, isDark: theme === 'dark', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
