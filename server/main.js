const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const bot = require('./bot');
const {registerIPC, deployIPC} = require('./ipc');
const { QRLoginSession, MiniProgramLoginSession } = require('./qrlogin');
const { CookieUtils } = require('./qrutils');

let qrSessions = new Map();
const accountsPath = path.join(__dirname, '../accounts.json');

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    if (pathname === '/api/presets') {
        const qrPresets = Object.keys(QRLoginSession.Presets).map(key => {
            const config = QRLoginSession.Presets[key];
            return {
                key,
                type: 'qr',
                name: config.name,
                description: config.description
            };
        });

        const mpPresets = Object.keys(MiniProgramLoginSession.Presets).map(key => {
            const config = MiniProgramLoginSession.Presets[key];
            return {
                key,
                type: 'mp',
                name: config.name,
                description: config.description,
                defaultAppId: config.appid
            };
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify([...qrPresets, ...mpPresets]));
        return;
    }

    if (pathname === '/api/qr/create' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { preset = 'farm' } = JSON.parse(body);
                const isMiniProgram = MiniProgramLoginSession.Presets[preset];

                let result;
                if (isMiniProgram) {
                    result = await MiniProgramLoginSession.requestLoginCode();
                    qrSessions.set(result.code, { type: 'mp', preset });
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        qrsig: result.code,
                        qrcode: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(result.url)}`,
                        url: result.url,
                        isMiniProgram: true
                    }));
                } else {
                    result = await QRLoginSession.requestQRCode(preset);
                    qrSessions.set(result.qrsig, { type: 'qr', preset });
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        qrsig: result.qrsig,
                        qrcode: result.qrcode,
                        url: result.url,
                        isMiniProgram: false
                    }));
                }
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        });
        return;
    }

    if (pathname === '/api/qr/check' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { qrsig, preset = 'farm', appid } = JSON.parse(body);

                if (!qrsig || !/^[a-zA-Z0-9+/=._-]+$/.test(qrsig)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Invalid qrsig' }));
                    return;
                }

                const session = qrSessions.get(qrsig);
                if (!session) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'Session not found' }));
                    return;
                }

                let result;
                if (session.type === 'mp') {
                    result = await MiniProgramLoginSession.queryStatus(qrsig);

                    if (result.status === 'OK') {
                        const finalAppId = appid || MiniProgramLoginSession.Presets[preset]?.appid || '';
                        const code = await MiniProgramLoginSession.getAuthCode(result.ticket, finalAppId);
                        qrSessions.delete(qrsig);

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: true,
                            ret: '0',
                            msg: '登录成功',
                            code,
                            uin: result.uin,
                            ticket: result.ticket
                        }));
                    } else if (result.status === 'Wait') {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: true,
                            ret: '66',
                            msg: '等待扫码...',
                            code: '',
                            uin: '',
                            ticket: ''
                        }));
                    } else if (result.status === 'Used') {
                        qrSessions.delete(qrsig);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: true,
                            ret: '65',
                            msg: '二维码已失效',
                            code: '',
                            uin: '',
                            ticket: ''
                        }));
                    } else {
                        qrSessions.delete(qrsig);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: true,
                            ret: '65',
                            msg: result.msg || '二维码已失效',
                            code: '',
                            uin: '',
                            ticket: ''
                        }));
                    }
                } else {
                    result = await QRLoginSession.checkStatus(qrsig, preset);

                    if (result.ret === '0') {
                        qrSessions.delete(qrsig);
                        const jumpUrl = result.jumpUrl;
                        const cookies = await QRLoginSession.getFinalCookies(jumpUrl);

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: true,
                            ret: '0',
                            msg: '登录成功',
                            code: jumpUrl,
                            uin: cookies ? CookieUtils.getUin(cookies) : '',
                            ticket: ''
                        }));
                    } else if (result.ret === '66') {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: true,
                            ret: '66',
                            msg: '等待扫码...',
                            code: '',
                            uin: '',
                            ticket: ''
                        }));
                    } else if (result.ret === '65') {
                        qrSessions.delete(qrsig);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: true,
                            ret: '65',
                            msg: '二维码已失效',
                            code: '',
                            uin: '',
                            ticket: ''
                        }));
                    } else {
                        qrSessions.delete(qrsig);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: true,
                            ret: result.ret || '65',
                            msg: result.msg || '二维码已失效',
                            code: '',
                            uin: '',
                            ticket: ''
                        }));
                    }
                }
            } catch (error) {
                console.error('QR Check Error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        });
        return;
    }

    if (pathname === '/api/accounts' && req.method === 'GET') {
        fs.readFile(accountsPath, (err, data) => {
            if (err) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, accounts: [] }));
                return;
            }
            try {
                const accounts = JSON.parse(data.toString());
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, accounts }));
            } catch (e) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, accounts: [] }));
            }
        });
        return;
    }

    if (pathname === '/api/accounts' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const accountData = JSON.parse(body);
                fs.readFile(accountsPath, (err, data) => {
                    let accounts = [];
                    if (!err && data) {
                        try {
                            accounts = JSON.parse(data.toString());
                        } catch (e) {
                            accounts = [];
                        }
                    }

                    const existingIndex = accounts.findIndex(a => a.uin === accountData.uin);
                    if (existingIndex >= 0) {
                        accounts[existingIndex] = { ...accounts[existingIndex], ...accountData, updatedAt: Date.now() };
                    } else {
                        accounts.push({ ...accountData, createdAt: Date.now(), updatedAt: Date.now() });
                    }

                    fs.writeFile(accountsPath, JSON.stringify(accounts, null, 2), (err) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, error: '保存失败' }));
                            return;
                        }
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true }));
                    });
                });
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: error.message }));
            }
        });
        return;
    }

    if (pathname === '/api/accounts' && req.method === 'DELETE') {
        const { query } = url.parse(req.url, true);
        const uin = query.uin;
        
        if (!uin) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: '缺少 uin 参数' }));
            return;
        }
        
        fs.readFile(accountsPath, (err, data) => {
            if (err) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
                return;
            }
            
            try {
                let accounts = JSON.parse(data.toString());
                const newAccounts = accounts.filter(a => a.uin !== uin);
                
                fs.writeFile(accountsPath, JSON.stringify(newAccounts, null, 2), (err) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: '删除失败' }));
                        return;
                    }
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: true }));
                });
            } catch (e) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true }));
            }
        });
        return;
    }

    let filePath = path.join(__dirname, '../dist', req.url === '/' ? 'index.html' : req.url);
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('File Not Found');
            return;
        }
        const ext = path.extname(filePath);
        const contentType = {
            '.html': 'text/html',
            '.js': 'text/javascript',
            '.css': 'text/css'
        }[ext] || 'text/plain';

        res.writeHead(200, {'Content-Type': contentType});
        res.end(content);
    });
});

async function main() {
    registerIPC(server);
    await bot.init();

    server.listen(3000, () => {
        console.log('🚀 服务运行在 http://localhost:3000');
    });
}

async function gracefulShutdown(signal) {
    console.log(`🚀 退出信号: ${signal}`)
    // 执行机器人的断开逻辑
    bot.botDisconnect();
    // 关闭 IPC 通道
    await deployIPC();
    // 关闭 HTTP 服务器
    await new Promise(resolve => server.close(resolve));
    console.log('🌐 HTTP 服务器已关闭');
    process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
main().catch(console.error);
