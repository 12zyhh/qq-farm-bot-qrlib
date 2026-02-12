<template>
  <div class="home-view">
    <div class="sidebar">
      <div class="sidebar-section">
        <div class="sidebar-title">账户列表</div>
        <div class="account-list">
          <div 
            v-for="account in accounts" 
            :key="account.uin"
            class="account-item"
            :class="{ active: status.connected && String(status.gid) === account.uin }"
            @click="handleSelectAccount(account)"
          >
            <div class="account-avatar">
              <img 
                v-if="account.avatar" 
                :src="account.avatar" 
                class="avatar-image"
                alt="Avatar"
              />
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="8" r="4"/>
                <path d="M20 21a8 8 0 0 0-16 0"/>
              </svg>
            </div>
            <div class="account-info">
              <div class="account-name">{{ account.name || account.uin }}</div>
              <div class="account-level">Lv{{ account.level }}</div>
            </div>
            <div class="account-action" v-if="!status.connected || String(status.gid) !== account.uin">
              <el-button 
                type="primary" 
                size="small"
                @click.stop="handleConnectAccount(account)"
                :loading="connecting"
                v-if="false"
              >
                连接
              </el-button>
              <el-button 
                type="danger" 
                size="small"
                @click.stop="handleDeleteAccount(account)"
                :loading="deleting"
              >
                删除
              </el-button>
            </div>
          </div>
          <div v-if="accounts.length === 0" class="empty-accounts">
            暂无账户
          </div>
        </div>
      </div>
      
      <div class="sidebar-section">
        <div class="sidebar-title">系统信息</div>
        <div class="system-info">
          <div class="info-item">
            <span class="info-label">平台:</span>
            <span class="info-value">{{ platform === 'qq' ? 'QQ' : '微信' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">状态:</span>
            <span class="info-value" :class="status.connected ? 'online' : 'offline'">
              {{ status.connected ? '在线' : '离线' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="user-section">
        <div class="user-profile">
          <div class="avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="8" r="4"/>
              <path d="M20 21a8 8 0 0 0-16 0"/>
            </svg>
          </div>
          <div class="user-info">
            <div class="user-name">{{ status.connected ? status.name || '未登录' : '未登录' }}</div>
            <div class="user-status" :class="status.connected ? 'online' : 'offline'">
              <div class="status-dot"></div>
              <span>{{ status.connected ? '在线' : '离线' }}</span>
            </div>
          </div>
        </div>
        <div class="user-stats">
          <div class="stat-item">
            <div class="stat-icon level">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ status.connected ? `Lv${status.level}` : '--' }}</div>
              <div class="stat-label">等级</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon gold">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v12M9 9h6M9 15h6"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value gold-value">{{ status.connected ? formatNumber(status.gold) : '--' }}</div>
              <div class="stat-label">金币</div>
            </div>
          </div>
          <div class="stat-item">
            <div class="stat-icon exp">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <div class="stat-content">
              <div class="stat-value">{{ expDisplay }}</div>
              <div class="stat-label">经验</div>
            </div>
          </div>
        </div>
      </div>

      <div class="login-section" v-if="!status.connected">
        <div class="login-card">
          <div class="login-title">连接农场</div>
          <div class="login-desc">请输入从小程序获取的登录凭证或扫码登录</div>
          <div class="login-form" v-if="platform === 'wx'">
            <el-input 
              v-model="code" 
              placeholder="输入 code" 
              class="login-input"
              size="large"
            />
            <el-button 
              type="primary" 
              :loading="connecting" 
              @click="handleConnect"
              size="large"
              class="login-btn"
            >
              连接
            </el-button>
          </div>
          <div class="platform-select">
            <el-radio-group v-model="platform" size="large">
              <el-radio value="qq">
                <span class="platform-label">QQ</span>
              </el-radio>
              <el-radio value="wx">
                <span class="platform-label">微信</span>
              </el-radio>
            </el-radio-group>
          </div>
          <span style="color: red;">FIXME：存在Bug，年后在修 vx not showQRSection </span>
          <div class="qr-section" v-if="showQRSection">
            <el-button 
              type="success" 
              :loading="qrLoading" 
              @click="handleGenerateQR"
              size="large"
              class="qr-btn"
              v-if="!qrCode"
            >
              生成二维码
            </el-button>
            <div class="qr-code-container" v-if="qrCode">
              <iframe 
                v-if="isMiniProgram" 
                :src="qrCode" 
                class="qr-iframe"
                frameborder="0"
                scrolling="no"
              ></iframe>
              <img 
                v-else 
                :src="qrCode" 
                class="qr-image" 
                alt="QR Code" 
              />
              <div class="qr-status">{{ qrStatus }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="connected-banner" v-else>
        <div class="banner-left">
          <div class="banner-dot"></div>
          <span class="banner-text">已连接</span>
        </div>
        <el-button text @click="handleDisconnect">断开连接</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, computed, onMounted, watch, onUnmounted} from 'vue'
import {useBot} from '@/composables/useBot'
import {useToast} from '@/composables/useToast'

const {status, connecting, connect, disconnect, getConfig, refreshStatus} = useBot()
const {success, error, warning} = useToast()

const code = ref('')
const platform = ref('qq')
const qrCode = ref('')
const qrLoading = ref(false)
const qrStatus = ref('')
const qrSig = ref('')
const isMiniProgram = ref(false)
const accounts = ref([])
const selectedAccount = ref(null)
const showAccountList = ref(true)
const deleting = ref(false)
const showQRSection = ref(false)
let qrCheckInterval = null
let qrCheckCount = 0

function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + 'w'
  }
  return num.toLocaleString()
}

const expDisplay = computed(() => {
  if (!status.connected) return '--'
  const p = status.expProgress
  if (p && p.needed > 0) return `${p.current}/${p.needed}`
  return String(status.exp)
})

async function loadAccounts() {
  try {
    const response = await fetch('/api/accounts')
    const data = await response.json()
    if (data.success) {
      accounts.value = data.accounts || []
    }
  } catch (err) {
    console.error('加载账户失败:', err)
  }
}

function handleSelectAccount(account) {
  selectedAccount.value = account
  showAccountList.value = false
}

async function handleConnectAccount(account) {

  console.info('连接账户:', account)
  if (status.connected) {
    warning('账户已连接')
    return
  }

  const result = await connect(account.code, account.platform)
  if (result.success) {
    success('连接成功')
    await updateAccount(account)
    await loadAccounts()
  } else {
    console.log('连接失败:', result.error)
    if (result.error === '正在连接中') {
      error('连接失败，code 可能已过期')
      if (platform.value === 'qq') {
        showQRSection.value = true
        await handleGenerateQR()
      }
    } else {
      error(result.error || '连接失败')
      showAccountList.value = true
    }
  }
}

async function handleDeleteAccount(account) {
  try {

    if (status.connected) {
      warning('请先断开当前连接')
      return
    }

    deleting.value = true
    const response = await fetch(`/api/accounts?uin=${account.uin}`, {
      method: 'DELETE'
    })
    const data = await response.json()
    if (data.success) {
      success('删除成功')
      await loadAccounts()
      if (platform.value === 'qq' && accounts.value.length === 0) {
        await handleGenerateQR()
      }
    } else {
      error(data.error || '删除失败')
    }
  } catch (err) {
    console.error('删除账户失败:', err)
    error('删除失败')
  } finally {
    deleting.value = false
  }
}

async function updateAccount(accountData) {
  try {
    await refreshStatus()
    console.log('更新账户，当前状态:', status)
    console.log('账户数据:', accountData)
    const uin = accountData.uin || String(status.gid)
    const avatar = accountData.platform === 'qq' ? `http://q1.qlogo.cn/g?b=qq&nk=${uin}&s=100` : ''
    const response = await fetch('/api/accounts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        uin: uin,
        name: status.name || '',
        code: accountData.code || '',
        platform: accountData.platform || 'qq',
        level: status.level || 0,
        avatar: avatar
      })
    })
    const result = await response.json()
    console.log('保存账户结果:', result)
  } catch (err) {
    console.error('保存账户失败:', err)
  }
}

async function handleConnect() {
  if (!code.value.trim()) {
    warning('请输入 code')
    return
  }
  const result = await connect(code.value.trim(), platform.value)
  if (result.success) {
    success('连接成功')
  } else {
    error(result.error || '连接失败')
  }
}

async function handleDisconnect() {
  await disconnect()
  await loadAccounts()
}

async function handleGenerateQR() {
  qrLoading.value = true
  qrCode.value = ''
  qrStatus.value = '生成中...'
  qrCheckCount = 0
  isMiniProgram.value = false
  showQRSection.value = true
  
  try {
    const response = await fetch('/api/qr/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        preset: 'farm'
      })
    })
    
    const data = await response.json()
    
    if (data.success && data.qrcode) {
      qrCode.value = data.qrcode
      qrSig.value = data.qrsig
      isMiniProgram.value = data.isMiniProgram || false
      qrStatus.value = '请使用手机QQ扫码'
      startQRCheck()
    } else {
      error('生成二维码失败')
      qrStatus.value = '生成失败'
    }
  } catch (err) {
    console.error('生成二维码错误:', err)
    error('生成二维码失败: ' + err.message)
    qrStatus.value = '生成失败'
  } finally {
    qrLoading.value = false
  }
}

function startQRCheck() {
  stopQRCheck()
  qrCheckInterval = setInterval(async () => {
    qrCheckCount++
    if (qrCheckCount > 60) {
      stopQRCheck()
      qrStatus.value = '二维码已过期'
      return
    }
    
    try {
      const response = await fetch('/api/qr/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          qrsig: qrSig.value,
          preset: 'farm'
        })
      })
      
      const data = await response.json()
      console.log('扫码检查结果:', data)
      
      if (data.ret === '0') {
        console.log('扫码成功，开始连接...')
        stopQRCheck()
        qrStatus.value = '扫码成功，正在连接...'
        code.value = data.code
        
        const result = await connect(data.code, 'qq')
        console.log('连接结果:', result)
        
        if (result.success) {
          success('连接成功')
          qrCode.value = ''
          console.log('准备更新账户...')
          await updateAccount({ code: data.code, platform: 'qq', uin: data.uin })
          console.log('准备加载账户列表...')
          await loadAccounts()
        } else if (result.error === '正在连接中') {
          console.log('后端正在连接中，等待连接完成...')
          qrStatus.value = '正在连接...'
          
          const checkConnection = setInterval(() => {
            refreshStatus().then(() => {
              if (status.connected) {
                clearInterval(checkConnection)
                success('连接成功')
                qrCode.value = ''
                console.log('准备更新账户...')
                updateAccount({ code: data.code, platform: 'qq', uin: data.uin }).then(() => {
                  console.log('准备加载账户列表...')
                  loadAccounts()
                })
              }
            })
          }, 1000)
          
          setTimeout(() => {
            clearInterval(checkConnection)
            if (!status.connected) {
              console.log('连接超时，但仍保存账户信息')
              qrStatus.value = '扫码成功，已保存账户'
              qrCode.value = ''
              updateAccount({ code: data.code, platform: 'qq', uin: data.uin }).then(() => {
                loadAccounts()
              })
              setTimeout(() => {
                qrStatus.value = '请点击账户列表中的连接按钮'
              }, 2000)
            }
          }, 10000)
        } else {
          console.log('连接失败，但仍保存账户信息')
          qrStatus.value = '扫码成功，已保存账户'
          await updateAccount({ code: data.code, platform: 'qq', uin: data.uin })
          await loadAccounts()
          setTimeout(() => {
            qrStatus.value = '请点击账户列表中的连接按钮'
          }, 2000)
        }
      } else if (data.ret === '66') {
        qrStatus.value = '等待扫码...'
      } else if (data.ret === '65') {
        stopQRCheck()
        qrStatus.value = '二维码已失效'
      }
    } catch (error) {
      console.error('检查扫码状态错误:', error)
    }
  }, 2000)
}

function stopQRCheck() {
  if (qrCheckInterval) {
    clearInterval(qrCheckInterval)
    qrCheckInterval = null
  }
}

onMounted(async () => {
  const config = await getConfig()
  platform.value = config.platform || 'qq'
  await refreshStatus()
  await loadAccounts()
  if (platform.value === 'qq' && !status.connected) {
    showQRSection.value = true
  }
})

watch(platform, async (newPlatform) => {
  if (newPlatform === 'qq' && !status.connected) {
    showQRSection.value = true
  }
})

onUnmounted(() => {
  stopQRCheck()
})
</script>

<style scoped>
.home-view {
  display: flex;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  min-height: 100vh;
}

.sidebar {
  width: 320px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.sidebar-section {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
}

.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: var(--spacing-md);
  letter-spacing: -0.02em;
}

.system-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm) 0;
}

.info-label {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.info-value {
  font-size: 14px;
  font-weight: 500;
}

.info-value.online {
  color: var(--color-success);
}

.info-value.offline {
  color: var(--color-text-tertiary);
}

.account-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.account-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 2px solid transparent;
}

.account-item:hover {
  background: var(--bg-card-hover);
}

.account-item.active {
  border-color: var(--color-accent);
  background: rgba(10, 132, 255, 0.08);
}

.account-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-sm);
  background: rgba(10, 132, 255, 0.15);
  color: var(--color-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.account-avatar svg {
  width: 20px;
  height: 20px;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.account-info {
  flex: 1;
  min-width: 0;
}

.account-name {
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 1px;
}

.account-level {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.account-action {
  flex-shrink: 0;
  display: flex;
  gap: 4px;
}

.empty-accounts {
  text-align: center;
  padding: var(--spacing-lg);
  color: var(--color-text-tertiary);
  font-size: 14px;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.user-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  gap: var(--spacing-lg);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-accent), var(--color-purple));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar svg {
  width: 32px;
  height: 32px;
  color: white;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.user-status.online {
  color: var(--color-success);
}

.user-status.offline {
  color: var(--color-text-tertiary);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.user-status.online .status-dot {
  background: var(--color-success);
  box-shadow: 0 0 8px var(--color-success);
}

.user-status.offline .status-dot {
  background: var(--color-text-tertiary);
}

.user-stats {
  display: flex;
  gap: var(--spacing-lg);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--bg-card);
  border-radius: var(--radius-md);
  min-width: 120px;
}

.stat-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon svg {
  width: 18px;
  height: 18px;
}

.stat-icon.level {
  background: rgba(191, 90, 242, 0.15);
  color: var(--color-purple);
}

.stat-icon.gold {
  background: rgba(255, 159, 10, 0.15);
  color: var(--color-warning);
}

.stat-icon.exp {
  background: rgba(48, 209, 88, 0.15);
  color: var(--color-success);
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.02em;
}

.gold-value {
  color: var(--color-warning);
}

.stat-label {
  font-size: 11px;
  color: var(--color-text-tertiary);
}

.login-section {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
}

.login-card {
  max-width: 500px;
  margin: 0 auto;
  text-align: center;
}

.login-title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: var(--spacing-xs);
  letter-spacing: -0.02em;
}

.login-desc {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-lg);
}

.login-form {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.login-input {
  flex: 1;
}

.login-btn {
  min-width: 80px;
}

.platform-select {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-md);
}

.platform-label {
  font-weight: 500;
  color:#fff; 
}

.qr-section {
  margin-top: var(--spacing-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.qr-btn {
  width: 100%;
}

.qr-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.qr-image {
  width: 280px;
  height: 280px;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  background: white;
  display: block;
}

.qr-iframe {
  width: 300px;
  height: 300px;
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  background: white;
}

.qr-status {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: var(--spacing-sm);
}

.connected-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(48, 209, 88, 0.1);
  border: 1px solid rgba(48, 209, 88, 0.2);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
}

.banner-left {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.banner-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 8px var(--color-success);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.banner-text {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-success);
}

@media (max-width: 700px) {
  .user-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .user-stats {
    width: 100%;
    justify-content: space-between;
  }
  
  .stat-item {
    min-width: auto;
    flex: 1;
  }
}
</style>
