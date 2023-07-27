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

import { Server, Socket } from 'socket.io';

let io: Server;

export function initializeSocket(server: any) {
    io = new Server(server, {
        cors: {
            origin: "*", // Replace with your desired origin
            methods: ["GET", "POST", "PUT"],
        },
    });

    io.on('connection', (socket: Socket) => {
            socket.on('room', ({ room_id }: { room_id: string }) => {
                console.log(room_id);
                
                socket.join(room_id);
            });
            socket.on('chat', function ({ room_id, data }: { room_id: string, data: any }) {
                socket.broadcast.to(room_id).emit("message", { room_id, data });
            });
            socket.on('deleteChat', function ({ room_id, data }: { room_id: string[], data: any }) {
                room_id?.map((room: string | string[]) => {
                    socket.broadcast.to(room_id).emit("deletedChat", { room_id, data });
                })
            });
            socket.on('leaveRoom', function ({ room_id }: { room_id: string }) {
                socket.leave(room_id);
            });
            socket.on('newChat', (data: any) => {
                data?.room_id?.map((room: string) => {
                    socket.broadcast.to(room).emit('chatCreated', data.data);
                })
            })
            socket.on('exitChat', (data: any) => {
                data?.room_id?.map((room: string) => {
                    socket.broadcast.to(room).emit('userLeft', data.data);
                })
            })
    });
}

export function getSocketIO(): Server {
    if (!io) {
        throw new Error('Socket.IO has not been initialized.');
    }
    return io;
}