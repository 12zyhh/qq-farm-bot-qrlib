<template>
  <div class="log-view">
    <div class="log-header">
      <div class="header-left">
        <h2 class="section-title">操作日志</h2>
        <span class="log-count" v-if="logs.length > 0">{{ logs.length }} 条记录</span>
      </div>
      <el-button @click="handleClear">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="btn-icon">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
        </svg>
        清空日志
      </el-button>
    </div>

    <div class="filter-section">
      <div class="filter-chips">
        <div 
          class="filter-chip" 
          :class="{ active: allChecked }"
          @click="handleAllChange(!allChecked)"
        >
          <span>全部</span>
        </div>
        <div 
          class="filter-chip farm" 
          :class="{ active: filters.farm }"
          @click="filters.farm = !filters.farm"
        >
          <div class="chip-dot"></div>
          <span>农场</span>
        </div>
        <div 
          class="filter-chip friend" 
          :class="{ active: filters.friend }"
          @click="filters.friend = !filters.friend"
        >
          <div class="chip-dot"></div>
          <span>好友</span>
        </div>
        <div 
          class="filter-chip task" 
          :class="{ active: filters.task }"
          @click="filters.task = !filters.task"
        >
          <div class="chip-dot"></div>
          <span>任务</span>
        </div>
        <div 
          class="filter-chip shop" 
          :class="{ active: filters.shop }"
          @click="filters.shop = !filters.shop"
        >
          <div class="chip-dot"></div>
          <span>商店</span>
        </div>
        <div 
          class="filter-chip system" 
          :class="{ active: filters.system }"
          @click="filters.system = !filters.system"
        >
          <div class="chip-dot"></div>
          <span>系统</span>
        </div>
      </div>
    </div>

    <div class="log-list" ref="logListRef" @scroll="handleScroll">
      <div v-for="(log, i) in displayLogs" :key="i" class="log-item" :class="[log.level, log.category]">
        <span class="log-time">{{ log.time }}</span>
        <span class="log-category">{{ getCategoryLabel(log.category) }}</span>
        <span class="log-msg">{{ log.message }}</span>
      </div>
      <div v-if="displayLogs.length === 0" class="log-empty">
        <div class="empty-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <span>暂无日志记录</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { useLog } from '@/composables/useLog'

const { logs, loadLogs, clearLogs } = useLog()

const logListRef = ref(null)
const autoScroll = ref(true)

const filters = reactive({
  farm: true,
  friend: true,
  task: true,
  shop: true,
  system: true,
})

const allChecked = computed({
  get: () => Object.values(filters).every(Boolean),
  set: () => { },
})

const displayLogs = computed(() => {
  const allOn = Object.values(filters).every(Boolean)
  if (allOn) return logs
  return logs.filter(l => filters[l.category])
})

function getCategoryLabel(category) {
  const labels = {
    farm: '农场',
    friend: '好友',
    task: '任务',
    shop: '商店',
    system: '系统',
  }
  return labels[category] || category
}

function handleAllChange(val) {
  filters.farm = val
  filters.friend = val
  filters.task = val
  filters.shop = val
  filters.system = val
}

async function handleClear() {
  await clearLogs()
}

function handleScroll() {
  const el = logListRef.value
  if (!el) return
  const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 30
  autoScroll.value = atBottom
}

function scrollToBottom() {
  if (!autoScroll.value) return
  const el = logListRef.value
  if (el) {
    nextTick(() => { el.scrollTop = el.scrollHeight })
  }
}

watch(() => logs.length, scrollToBottom)

onMounted(() => {
  loadLogs()
  nextTick(scrollToBottom)
})
</script>

<style scoped>
.log-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: var(--spacing-md);
}

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0;
}

.log-count {
  font-size: 13px;
  color: var(--color-text-tertiary);
}

.btn-icon {
  width: 16px;
  height: 16px;
  margin-right: 6px;
}

.filter-section {
  flex-shrink: 0;
}

.filter-chips {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-card);
  border-radius: 20px;
  font-size: 13px;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  user-select: none;
}

.filter-chip:hover {
  background: var(--bg-card-hover);
}

.filter-chip.active {
  background: rgba(10, 132, 255, 0.15);
  color: var(--color-accent);
}

.filter-chip.farm.active {
  background: rgba(48, 209, 88, 0.15);
  color: var(--color-success);
}

.filter-chip.friend.active {
  background: rgba(10, 132, 255, 0.15);
  color: var(--color-accent);
}

.filter-chip.task.active {
  background: rgba(191, 90, 242, 0.15);
  color: var(--color-purple);
}

.filter-chip.shop.active {
  background: rgba(255, 159, 10, 0.15);
  color: var(--color-warning);
}

.filter-chip.system.active {
  background: rgba(100, 210, 255, 0.15);
  color: var(--color-teal);
}

.chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.6;
}

.log-list {
  flex: 1;
  overflow-y: auto;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  font-family: var(--font-mono);
  font-size: 13px;
  min-height: 0;
}

.log-item {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.log-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.log-item.warn {
  background: rgba(255, 159, 10, 0.08);
}

.log-item.warn:hover {
  background: rgba(255, 159, 10, 0.12);
}

.log-time {
  color: var(--color-text-tertiary);
  flex-shrink: 0;
  font-size: 12px;
  width: 70px;
}

.log-category {
  flex-shrink: 0;
  width: 40px;
  font-size: 11px;
  font-weight: 500;
  text-align: center;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--color-text-secondary);
}

.log-item.farm .log-category {
  background: rgba(48, 209, 88, 0.15);
  color: var(--color-success);
}

.log-item.friend .log-category {
  background: rgba(10, 132, 255, 0.15);
  color: var(--color-accent);
}

.log-item.task .log-category {
  background: rgba(191, 90, 242, 0.15);
  color: var(--color-purple);
}

.log-item.shop .log-category {
  background: rgba(255, 159, 10, 0.15);
  color: var(--color-warning);
}

.log-item.system .log-category {
  background: rgba(100, 210, 255, 0.15);
  color: var(--color-teal);
}

.log-msg {
  flex: 1;
  word-break: break-all;
  color: var(--color-text);
}

.log-item.warn .log-msg {
  color: var(--color-warning);
}

.log-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  color: var(--color-text-secondary);
  gap: var(--spacing-sm);
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: var(--color-text-tertiary);
}

.empty-icon svg {
  width: 100%;
  height: 100%;
}
</style>
