import {io} from "socket.io-client";

export const socket = io(null, {
    autoConnect: true, // 自动连接
    reconnection: true, // 开启重连
    reconnectionAttempts: Infinity, // 无限次重连
    reconnectionDelay: 1000, // 重连间隔
});

export function waitForConnection() {
    return new Promise((resolve) => {
        if (socket.connected) {
            resolve();
        } else {
            socket.once("connect", resolve);
        }
    });
}
