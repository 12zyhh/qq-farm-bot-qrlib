import { ref, watch } from 'vue'

const THEME_KEY = 'qq-farm-theme'

const theme = ref(localStorage.getItem(THEME_KEY) || 'dark')

function applyTheme(value) {
  document.documentElement.setAttribute('data-theme', value)
  localStorage.setItem(THEME_KEY, value)
}

export function useTheme() {
  watch(theme, (val) => {
    applyTheme(val)
  }, { immediate: true })

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  function setTheme(value) {
    theme.value = value
  }

  return {
    theme,
    toggleTheme,
    setTheme,
    isDark: () => theme.value === 'dark',
    isLight: () => theme.value === 'light',
  }
}
