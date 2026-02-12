<template>
  <div class="app-container">
    <div class="theme-transition-overlay" :class="{ active: isTransitioning, fading: isFading }"></div>
    
    <Toast 
      :visible="toast.visible" 
      :message="toast.message" 
      :type="toast.type"
    />
    
    <div class="titlebar">
      <span class="titlebar-title">QQ经典农场助手</span>
    </div>

    <div class="main-layout">
      <div class="sidebar">
        <div class="nav-items">
          <div
            v-for="item in navItems"
            :key="item.path"
            class="nav-item"
            :class="{ active: route.path === item.path }"
            @click="router.push(item.path)"
            :title="item.label"
          >
            <div class="nav-icon" v-html="item.icon"></div>
            <span class="nav-label">{{ item.label }}</span>
          </div>
        </div>
        <div class="sidebar-footer">
          <div class="theme-toggle" @click="handleToggleTheme" :title="theme === 'dark' ? '切换到亮色模式' : '切换到暗色模式'">
            <div class="theme-icon">
              <svg v-if="theme === 'dark'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </div>
            <span class="theme-label">{{ theme === 'dark' ? '亮色' : '暗色' }}</span>
          </div>
          <div class="status-indicator" :class="connected ? 'online' : 'offline'">
            <div class="status-dot"></div>
            <span class="status-text">{{ connected ? '在线' : '离线' }}</span>
          </div>
        </div>
      </div>

      <div class="content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTheme } from '@/composables/useTheme'
import Toast from '@/components/Toast.vue'

const { theme, toggleTheme } = useTheme()

const route = useRoute()
const router = useRouter()

const connected = ref(false)
const isTransitioning = ref(false)
const isFading = ref(false)
const toast = ref({
  visible: false,
  message: '',
  type: 'info'
})
let toastTimer = null

const showNotification = (message, type = 'info', duration = 3000) => {
  if (toastTimer) {
    clearTimeout(toastTimer)
  }
  
  toast.value = {
    visible: true,
    message,
    type
  }
  
  if (duration > 0) {
    toastTimer = setTimeout(() => {
      toast.value.visible = false
    }, duration)
  }
}

window.showToast = showNotification

const navItems = [
  { 
    path: '/', 
    label: '首页',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>`
  },
  { 
    path: '/settings', 
    label: '设置',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>`
  },
  { 
    path: '/logs', 
    label: '日志',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>`
  },
]

function handleToggleTheme() {
  isTransitioning.value = true
  isFading.value = false
  
  setTimeout(() => {
    toggleTheme()
  }, 50)
  
  setTimeout(() => {
    isFading.value = true
  }, 550)
  
  setTimeout(() => {
    isTransitioning.value = false
    isFading.value = false
  }, 850)
}

if (window.electronAPI) {
  window.electronAPI.on('bot:status-update', (data) => {
    if (data && typeof data.connected === 'boolean') {
      connected.value = data.connected
    }
  })
}
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-primary);
  transition: background-color var(--transition-normal);
  position: relative;
}

.theme-transition-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
  opacity: 1;
  transition: opacity 0.3s ease;
}

.theme-transition-overlay.fading {
  opacity: 0;
}

.theme-transition-overlay::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  background: var(--bg-primary);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.theme-transition-overlay.active::before {
  width: 300vw;
  height: 300vw;
  top: 0;
  left: 0;
}

.main-layout {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  width: 80px;
  background-color: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-md) var(--spacing-sm);
  flex-shrink: 0;
  border-right: 1px solid var(--color-border);
  transition: background-color var(--transition-normal), border-color var(--transition-normal);
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  flex: 1;
  width: 100%;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  gap: 4px;
}

.nav-item:hover {
  background: var(--bg-input);
}

.nav-item.active {
  background: var(--color-accent);
}

.nav-item.active .nav-icon {
  color: white;
}

.nav-item.active .nav-label {
  color: white;
}

.nav-icon {
  width: 22px;
  height: 22px;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.nav-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
  color: var(--color-text-tertiary);
  transition: color var(--transition-fast);
}

.nav-item:hover .nav-icon {
  color: var(--color-text);
}

.nav-item:hover .nav-label {
  color: var(--color-text-secondary);
}

.sidebar-footer {
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.theme-toggle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.theme-toggle:hover {
  background: var(--bg-input);
}

.theme-icon {
  width: 18px;
  height: 18px;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.theme-icon svg {
  width: 100%;
  height: 100%;
}

.theme-toggle:hover .theme-icon {
  color: var(--color-warning);
}

.theme-label {
  font-size: 10px;
  font-weight: 500;
  color: var(--color-text-tertiary);
  transition: color var(--transition-fast);
}

.theme-toggle:hover .theme-label {
  color: var(--color-text-secondary);
}

.status-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: var(--spacing-sm);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  transition: all var(--transition-normal);
}

.status-indicator.online .status-dot {
  background: var(--color-success);
  box-shadow: 0 0 8px var(--color-success);
}

.status-indicator.offline .status-dot {
  background: var(--color-text-tertiary);
}

.status-text {
  font-size: 10px;
  font-weight: 500;
  color: var(--color-text-tertiary);
}

.status-indicator.online .status-text {
  color: var(--color-success);
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-lg);
}

.titlebar-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  letter-spacing: -0.01em;
}
</style>
