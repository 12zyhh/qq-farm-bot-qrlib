import {createApp} from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import App from './App.vue'
import router from './router'
import './styles/dark-theme.css'
import {socket, waitForConnection} from './socket'

window.electronAPI = {
    async on(channel, callback) {
        console.log('>>> on', channel, socket.connected);
        socket.on(channel, (data) => {
            console.log('<<< on', channel, data);
            callback(data)
        });
    },
    async invoke(channel, req) {
        await waitForConnection();
        console.log('>>> invoke', channel, req, socket.connected);
        return await new Promise((resolve) => {
            socket.emit(channel, req, (res) => {
                console.log('<<< invoke', channel, res);
                resolve(res)
            });
        });
    }
};

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.mount('#app')
