<template>
  <div class="settings-view">
    <div class="tabs-header">
      <div 
        v-for="tab in tabs" 
        :key="tab.key"
        class="tab-item"
        :class="{ active: activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        <div class="tab-icon" v-html="tab.icon"></div>
        <span class="tab-label">{{ tab.label }}</span>
      </div>
    </div>

    <div class="tab-content">
      <div v-show="activeTab === 'farm'" class="section">
        <div class="section-header">
          <h2 class="section-title">自己农场</h2>
        </div>
        <div class="feature-list">
          <div class="feature-item" v-for="f in farmFeatures" :key="f.key">
            <div class="feature-info">
              <span class="feature-name">{{ f.label }}</span>
              <span class="feature-desc">{{ f.desc }}</span>
            </div>
            <el-switch 
              :model-value="status.features[f.key] !== false" 
              size="large"
              @change="(v) => toggleFeature(f.key, v)"
            />
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'friend'" class="section">
        <div class="section-header">
          <h2 class="section-title">好友农场</h2>
        </div>
        <div class="feature-list">
          <div class="feature-item" v-for="f in friendFeatures" :key="f.key" :class="{ 'sub-feature': f.indent }">
            <div class="feature-info">
              <span class="feature-name" :class="{ 'master': f.isMaster }">{{ f.label }}</span>
              <span class="feature-desc">{{ f.desc }}</span>
            </div>
            <el-switch 
              :model-value="status.features[f.key] !== false" 
              size="large"
              @change="(v) => toggleFeature(f.key, v)"
            />
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'system'" class="section">
        <div class="section-header">
          <h2 class="section-title">系统</h2>
        </div>
        <div class="feature-list">
          <div class="feature-item" v-for="f in systemFeatures" :key="f.key">
            <div class="feature-info">
              <span class="feature-name">{{ f.label }}</span>
              <span class="feature-desc">{{ f.desc }}</span>
            </div>
            <el-switch 
              :model-value="status.features[f.key] !== false" 
              size="large"
              @change="(v) => toggleFeature(f.key, v)"
            />
          </div>
        </div>
      </div>

      <div v-show="activeTab === 'other'" class="other-section">
        <div class="section">
          <div class="section-header">
            <h2 class="section-title">种植策略</h2>
          </div>
          <div class="plant-section" v-if="plantPlan">
            <div class="plant-recommend" v-if="plantPlan.recommended">
              <div class="recommend-card">
                <div class="recommend-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
                    <path d="M8 12l2 2 4-4"/>
                  </svg>
                </div>
                <div class="recommend-info">
                  <div class="recommend-label">推荐作物</div>
                  <div class="recommend-name">{{ plantPlan.recommended?.name || '无' }}</div>
                </div>
                <el-tag :type="strategyTagType" size="large">{{ strategyLabel }}</el-tag>
              </div>
              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-value">{{ plantPlan.recommended?.expPerHour || 0 }}</div>
                  <div class="stat-label">经验/小时</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ plantPlan.recommended?.expPerHarvest || 0 }}</div>
                  <div class="stat-label">单次经验</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ plantPlan.recommended?.growTimeWithFert || 0 }}s</div>
                  <div class="stat-label">生长周期</div>
                </div>
              </div>
            </div>
            <div class="plant-mode">
              <el-radio-group v-model="plantMode" size="large" @change="handlePlantModeChange">
                <el-radio value="fast">快速升级</el-radio>
                <el-radio value="advanced">高级作物</el-radio>
                <el-radio value="manual">手动选择</el-radio>
              </el-radio-group>
              <el-select 
                v-if="plantMode === 'manual'" 
                v-model="plantSeedId" 
                size="large"
                class="plant-select" 
                @change="handlePlantSeedChange"
                placeholder="选择作物"
              >
                <el-option 
                  v-for="opt in plantPlan.options" 
                  :key="opt.seedId"
                  :label="`${opt.name} (${opt.expPerHarvest}exp, ${opt.expPerHour}exp/h)`" 
                  :value="opt.seedId"
                />
              </el-select>
            </div>
          </div>
          <div v-else class="plant-empty">
            <div class="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
            </div>
            <span>登录后查看种植策略</span>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <h2 class="section-title">参数配置</h2>
          </div>
          <div class="config-grid">
            <div class="config-card">
              <div class="config-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div class="config-content">
                <div class="config-label">农场巡查间隔</div>
                <div class="config-desc">自己农场巡查完成后的等待时间</div>
              </div>
              <div class="config-control">
                <el-input-number v-model="farmInterval" :min="1" :max="3600" size="large" />
                <span class="config-unit">秒</span>
              </div>
            </div>
            <div class="config-card">
              <div class="config-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <div class="config-content">
                <div class="config-label">好友巡查间隔</div>
                <div class="config-desc">好友农场巡查完成后的等待时间</div>
              </div>
              <div class="config-control">
                <el-input-number v-model="friendInterval" :min="1" :max="3600" size="large" />
                <span class="config-unit">秒</span>
              </div>
            </div>
          </div>
          <div class="config-actions">
            <el-button type="primary" size="large" @click="handleSave" :loading="saving">
              保存配置
            </el-button>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <h2 class="section-title">种植效率排行</h2>
            <span class="level-badge" v-if="plantPlan">
              Lv{{ plantPlan.currentLevel }}
            </span>
          </div>
          <div class="table-wrapper" v-if="plantPlan">
            <el-table 
              :data="plantPlan?.options || []" 
              size="large" 
              class="plant-table"
              :row-class-name="rowClassName"
              max-height="400"
            >
              <el-table-column prop="rank" label="排名" width="80" align="center">
                <template #default="{ row }">
                  <div class="rank-cell" :class="{ 'top': row.rank === 1 }">
                    <span v-if="row.rank === 1" class="rank-icon">★</span>
                    <span v-else>{{ row.rank }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="作物" min-width="120">
                <template #default="{ row }">
                  <div class="plant-name" :class="{ 'recommend': row.rank === 1 }">
                    {{ row.name }}
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="生长时间" width="120" align="center">
                <template #default="{ row }">
                  <span class="time-value">{{ row.growTimeWithFert }}s</span>
                </template>
              </el-table-column>
              <el-table-column label="经验/小时" width="120" align="center">
                <template #default="{ row }">
                  <span class="exp-value">{{ row.expPerHour }}</span>
                </template>
              </el-table-column>
              <el-table-column label="单次经验" width="100" align="center">
                <template #default="{ row }">
                  <span>{{ row.expPerHarvest }}</span>
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div v-else class="empty-state">
            <div class="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
            </div>
            <span>登录后查看种植效率排行</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useBot } from '@/composables/useBot'
import { useToast } from '@/composables/useToast'

const { status, toggleFeature, getConfig, saveConfig, getPlantPlan } = useBot()
const { success } = useToast()

const activeTab = ref('farm')
const farmInterval = ref(10)
const friendInterval = ref(1)
const saving = ref(false)
const plantPlan = ref(null)
const plantMode = ref('fast')
const plantSeedId = ref(0)

const tabs = [
  { 
    key: 'farm', 
    label: '自己农场',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
      <path d="M12 6v6l4 2"/>
    </svg>`
  },
  { 
    key: 'friend', 
    label: '好友农场',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>`
  },
  { 
    key: 'system', 
    label: '系统',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>`
  },
  { 
    key: 'other', 
    label: '其他',
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="1"/>
      <circle cx="19" cy="12" r="1"/>
      <circle cx="5" cy="12" r="1"/>
    </svg>`
  },
]

const farmFeatures = [
  {key: 'autoHarvest', label: '自动收获', desc: '检测成熟作物并自动收获'},
  {key: 'autoPlant', label: '自动种植', desc: '收获后自动购买种子并种植'},
  {key: 'autoFertilize', label: '自动施肥', desc: '种植后自动施肥加速生长'},
  {key: 'autoWeed', label: '自动除草', desc: '检测并清除杂草'},
  {key: 'autoBug', label: '自动除虫', desc: '检测并消灭害虫'},
  {key: 'autoWater', label: '自动浇水', desc: '检测缺水作物并浇水'},
]

const friendFeatures = [
  {key: 'friendPatrol', label: '好友巡查', desc: '遍历好友列表进入农场', isMaster: true},
  {key: 'autoSteal', label: '自动偷菜', desc: '偷取好友成熟作物', indent: true},
  {key: 'friendHelp', label: '帮忙操作', desc: '帮好友除草除虫浇水', indent: true},
]

const systemFeatures = [
  {key: 'autoTask', label: '自动任务', desc: '自动领取完成的任务奖励'},
]

const strategyLabel = computed(() => {
  switch (plantMode.value) {
    case 'fast':
      return '经验效率最优'
    case 'advanced':
      return '高级作物优先'
    case 'manual':
      return '手动选择'
    default:
      return ''
  }
})

const strategyTagType = computed(() => {
  switch (plantMode.value) {
    case 'fast':
      return 'success'
    case 'advanced':
      return 'warning'
    case 'manual':
      return 'info'
    default:
      return 'info'
  }
})

function rowClassName({ row }) {
  return row.rank === 1 ? 'recommend-row' : ''
}

async function handleSave() {
  saving.value = true
  try {
    await saveConfig({
      farmInterval: farmInterval.value,
      friendInterval: friendInterval.value,
    })
    success('配置已保存')
  } finally {
    saving.value = false
  }
}

async function loadPlantPlan() {
  try {
    plantPlan.value = await getPlantPlan()
  } catch { }
}

async function handlePlantModeChange(mode) {
  await saveConfig({plantMode: mode, plantSeedId: 0})
  plantSeedId.value = 0
  await loadPlantPlan()
}

async function handlePlantSeedChange(seedId) {
  await saveConfig({plantMode: 'manual', plantSeedId: seedId})
}

async function loadData() {
  const config = await getConfig()
  farmInterval.value = config.farmInterval || 10
  friendInterval.value = config.friendInterval || 1
  plantMode.value = config.plantMode || 'fast'
  plantSeedId.value = config.plantSeedId || 0
  if (status.connected) {
    await loadPlantPlan()
  }
}

onMounted(loadData)

watch(() => status.connected, (val) => {
  if (val) loadData()
})
</script>

<style scoped>
.settings-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: var(--spacing-md);
}

.tabs-header {
  display: flex;
  gap: var(--spacing-xs);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-sm);
  flex-shrink: 0;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex: 1;
  justify-content: center;
}

.tab-item:hover {
  background: rgba(255, 255, 255, 0.06);
}

.tab-item.active {
  background: var(--color-accent);
}

.tab-icon {
  width: 18px;
  height: 18px;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.tab-icon :deep(svg) {
  width: 100%;
  height: 100%;
}

.tab-item.active .tab-icon {
  color: white;
}

.tab-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  transition: color var(--transition-fast);
}

.tab-item.active .tab-label {
  color: white;
}

.tab-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.section {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.section:last-child {
  margin-bottom: 0;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-md);
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin: 0;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.feature-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  background: var(--bg-card);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.feature-item:hover {
  background: var(--bg-card-hover);
}

.feature-item.sub-feature {
  margin-left: var(--spacing-lg);
}

.feature-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.feature-name {
  font-size: 14px;
  font-weight: 500;
}

.feature-name.master {
  color: var(--color-accent);
}

.feature-desc {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.other-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.level-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-xs) var(--spacing-sm);
  background: rgba(191, 90, 242, 0.15);
  color: var(--color-purple);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
}

.config-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.config-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-card);
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.config-card:hover {
  background: var(--bg-card-hover);
}

.config-icon {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: rgba(10, 132, 255, 0.15);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.config-icon svg {
  width: 22px;
  height: 22px;
}

.config-content {
  flex: 1;
  min-width: 0;
}

.config-label {
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 2px;
}

.config-desc {
  font-size: 12px;
  color: var(--color-text-tertiary);
}

.config-control {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.config-unit {
  font-size: 13px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.config-actions {
  display: flex;
  justify-content: flex-end;
}

.table-wrapper {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.plant-table {
  --el-table-bg-color: transparent !important;
  --el-table-tr-bg-color: transparent !important;
  --el-table-header-bg-color: rgba(255, 255, 255, 0.04) !important;
  --el-table-row-hover-bg-color: rgba(255, 255, 255, 0.06) !important;
  --el-table-text-color: var(--color-text) !important;
  --el-table-header-text-color: var(--color-text-secondary) !important;
  --el-table-border-color: var(--color-border) !important;
}

.plant-table :deep(th.el-table__cell) {
  font-weight: 500 !important;
  font-size: 13px;
}

.plant-table :deep(td.el-table__cell) {
  padding: 12px 0;
}

.plant-table :deep(.recommend-row) {
  background: rgba(48, 209, 88, 0.08) !important;
}

.rank-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.rank-cell.top {
  color: var(--color-warning);
}

.rank-icon {
  font-size: 18px;
}

.plant-name {
  font-weight: 500;
}

.plant-name.recommend {
  color: var(--color-success);
}

.time-value {
  color: var(--color-text-secondary);
}

.exp-value {
  color: var(--color-accent);
  font-weight: 600;
}

.empty-state,
.plant-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl);
  background: var(--bg-card);
  border-radius: var(--radius-md);
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

.plant-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.plant-recommend {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.recommend-card {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--bg-card);
  border-radius: var(--radius-md);
}

.recommend-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: rgba(48, 209, 88, 0.15);
  color: var(--color-success);
  display: flex;
  align-items: center;
  justify-content: center;
}

.recommend-icon svg {
  width: 24px;
  height: 24px;
}

.recommend-info {
  flex: 1;
}

.recommend-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 2px;
}

.recommend-name {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.stat-item {
  text-align: center;
  padding: var(--spacing-md);
  background: var(--bg-card);
  border-radius: var(--radius-md);
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.02em;
  margin-bottom: 2px;
}

.stat-label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.plant-mode {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.plant-select {
  width: 280px;
}
</style>
