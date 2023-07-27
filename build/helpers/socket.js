"use strict";
// import { Socket } from "socket.io";
// import { Server } from 'socket.io'
// let socketInstance: any
// socketInstance = null
// export function initializeSocket(server: any) {
//     const io = new Server(server, {
//         cors: {
//             origin: "*", // Replace with your desired origin
//             methods: ["GET", "POST", "PUT"],
//         },
//     })
//     io.on('connection', (socket: any) => {
//         socket.on('room', ({ room_id }: { room_id: string }) => {
//             socket.join(room_id);
//         });
//         socket.on('chat', function ({ room_id, data }: { room_id: string, data: any }) {
//             socket.broadcast.to(room_id).emit("message", { room_id, data });
//         });
//         socket.on('deleteChat', function ({ room_id, data }: { room_id: string[], data: any }) {
//             room_id?.map((room: string | string[]) => {
//                 socket.broadcast.to(room_id).emit("deletedChat", { room_id, data });
//             })
//         });
//         socket.on('leaveRoom', function ({ room_id }: { room_id: string }) {
//             socket.leave(room_id);
//         });
//         socket.on('newChat', (data: any) => {
//             data?.room_id?.map((room: string) => {
//                 socket.broadcast.to(room).emit('chatCreated', data.data);
//             })
//         })
//         socket.on('exitChat', (data: any) => {
//             data?.room_id?.map((room: string) => {
//                 socket.broadcast.to(room).emit('userLeft', data.data);
//             })
//         })
//         socketInstance = socket
//     })
// }
// export default socketInstance
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSocketIO = exports.initializeSocket = void 0;
const socket_io_1 = require("socket.io");
let io;
function initializeSocket(server) {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST", "PUT"],
        },
    });
    io.on('connection', (socket) => {
        socket.on('room', ({ room_id }) => {
            console.log(room_id);
            socket.join(room_id);
        });
        socket.on('chat', function ({ room_id, data }) {
            socket.broadcast.to(room_id).emit("message", { room_id, data });
        });
        socket.on('deleteChat', function ({ room_id, data }) {
            room_id === null || room_id === void 0 ? void 0 : room_id.map((room) => {
                socket.broadcast.to(room_id).emit("deletedChat", { room_id, data });
            });
        });
        socket.on('leaveRoom', function ({ room_id }) {
            socket.leave(room_id);
        });
        socket.on('newChat', (data) => {
            var _a;
            (_a = data === null || data === void 0 ? void 0 : data.room_id) === null || _a === void 0 ? void 0 : _a.map((room) => {
                socket.broadcast.to(room).emit('chatCreated', data.data);
            });
        });
        socket.on('exitChat', (data) => {
            var _a;
            (_a = data === null || data === void 0 ? void 0 : data.room_id) === null || _a === void 0 ? void 0 : _a.map((room) => {
                socket.broadcast.to(room).emit('userLeft', data.data);
            });
        });
    });
}
exports.initializeSocket = initializeSocket;
function getSocketIO() {
    if (!io) {
        throw new Error('Socket.IO has not been initialized.');
    }
    return io;
}
exports.getSocketIO = getSocketIO;
