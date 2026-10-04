import { useEffect, useState } from 'react'
type Theme = 'light' | 'dark'
function savedTheme(): Theme | null {
  try {
    const theme = localStorage.getItem('memory-theme')
    return theme === 'light' || theme === 'dark' ? theme : null
  } catch {
    return null
  }
}
function systemTheme(): Theme {
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}
export function useTheme() {
  const [preference, setPreference] = useState<Theme | null>(savedTheme)
  const [system, setSystem] = useState<Theme>(systemTheme)
  const theme = preference || system
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)')
    const change = () => setSystem(media.matches ? 'dark' : 'light')
    const storage = (event: StorageEvent) => {
      if (event.key === 'memory-theme') setPreference(savedTheme())
    }
    media.addEventListener('change', change)
    window.addEventListener('storage', storage)
    return () => {
      media.removeEventListener('change', change)
      window.removeEventListener('storage', storage)
    }
  }, [])
  function toggle() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setPreference(next)
    try {
      localStorage.setItem('memory-theme', next)
    } catch {
      /* Keep the theme usable without browser storage. */
    }
  }
  return { theme, toggle }
}
