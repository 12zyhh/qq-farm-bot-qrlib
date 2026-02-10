import {reactive, ref} from 'vue'

const status = reactive({
    connected: false,
    gid: 0,
    name: '',
    level: 0,
    gold: 0,
    exp: 0,
    expProgress: {current: 0, needed: 0},
    features: {},
    currentPlant: null,
    landSummary: {total: 0, growing: 0, harvestable: 0, empty: 0},
})

const connecting = ref(false)

async function connect(code, platform) {
    connecting.value = true
    try {
        const result = await window.electronAPI.invoke('bot:connect', {code, platform})
        if (result.success) {
            await refreshStatus()
        }
        return result
    } finally {
        connecting.value = false
    }
}

async function disconnect() {
    return await window.electronAPI.invoke('bot:disconnect')
}

async function refreshStatus() {
    const data = await window.electronAPI.invoke('bot:status')
    Object.assign(status, data)
}

async function toggleFeature(feature, enabled) {
    const result = await window.electronAPI.invoke('bot:feature-toggle', {feature, enabled})
    if (result.success) {
        status.features = result.features
    }
    return result
}

async function getConfig() {
    const result = await window.electronAPI.invoke('bot:get-config')
    status.features = result.features
    return result
}

async function saveConfig(partial) {
    return await window.electronAPI.invoke('bot:save-config', partial)
}

async function getPlantPlan() {
    return await window.electronAPI.invoke('bot:get-plant-plan')
}

// Listen for status updates from main process
if (window.electronAPI) {
    window.electronAPI.on('bot:status-update', (data) => {
        Object.assign(status, data)
    })
}

export function useBot() {
    return {
        status,
        connecting,
        connect,
        disconnect,
        refreshStatus,
        toggleFeature,
        getConfig,
        saveConfig,
        getPlantPlan,
    }
}
