/**
 * IPC 通道处理
 * 注册所有 ipcMain.handle 通道，调用 bot.js 并返回结果
 * 将 bot.js 事件推送到渲染进程
 */
const {Server} = require('socket.io');
const bot = require('./bot');

let io = null;

function handle(socket, ev, cb) {
    if (!io)
        throw new Error('IPC 尚未初始化');
    socket.on(ev, async (data, ioCb) => {
        try {
            ioCb(await cb(data));
        } catch (e) {
            ioCb({success: false, error: e.message,});
        }
    });
}

/**
 * 注册所有 IPC 通道
 */
function registerIPC(server) {
    io = new Server(server);

    io.on('connection', (socket) => {
        console.log('👤 用户连接:', socket.id);
        // socket.onAny((event, ...args) => {
        //     console.log(`[收到消息] 来自: ${socket.id} | 事件: ${event} | 数据:`, args);
        // });

        // === 请求/响应通道 ===

        handle(socket, 'bot:connect', async ({code, platform}) => {
            return await bot.botConnect(code, platform);
        });

        handle(socket, 'bot:connect', async ({code, platform}) => {
            return await bot.botConnect(code, platform);
        });

        handle(socket, 'bot:disconnect', () => {
            return bot.botDisconnect();
        });

        handle(socket, 'bot:status', () => {
            return bot.getStatus();
        });

        handle(socket, 'bot:feature-toggle', ({feature, enabled}) => {
            return bot.setFeatureEnabled(feature, enabled);
        });

        handle(socket, 'bot:get-config', () => {
            return bot.getConfig();
        });

        handle(socket, 'bot:save-config', (partial) => {
            return bot.saveConfig(partial);
        });

        handle(socket, 'bot:get-plant-plan', () => {
            return bot.getPlantPlan();
        });

        handle(socket, 'bot:get-logs', () => {
            return bot.getLogs();
        });

        handle(socket, 'bot:clear-logs', () => {
            bot.clearLogs();
            return {success: true};
        });
    });

    // === 主进程 → 渲染进程推送 ===

    bot.botEvents.on('log', (entry) => {
        if (!io)
            throw new Error('IPC 尚未初始化');
        io.emit('bot:log', entry);
    });

    bot.botEvents.on('status-update', (status) => {
        if (!io)
            throw new Error('IPC 尚未初始化');
        io.emit('bot:status-update', status);
    });
}

async function deployIPC() {
    if (!io) return;
    await new Promise(resolve => io.close(resolve));
    io = null;
}

module.exports = {registerIPC, deployIPC};
