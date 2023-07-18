import express from "express";
const app = express()
import authRouter from "./routes/authRoute"
import cors from "cors"
import http from 'http'
const server = http.createServer(app)
import { Server } from 'socket.io'
const io = new Server(server, {
    cors: {
        origin: "*", // Replace with your desired origin
        methods: ["GET", "POST", "PUT"],
    },
})
import dbConnection from "./config/dbConnection"
import logger from "./helpers/quick-logger"
import errorHandler from "./helpers/errorHandler";
import userRouter from "./routes/userRoute";
import { verifyUserToken } from "./middleware/userTokenverifivation";
import questionRouter from "./routes/questionRoute";
import answerRouter from "./routes/answerRoute";
import chatRouter from "./routes/chatRouter";
import dashboardRouter from "./routes/dashboardRoute";
import verifyBadge from "./helpers/badge";
declare global {
    var logger: any;
}
global.logger = logger
const port = process.env.port || 3000
dbConnection()
verifyBadge()

app.use(express.json())
app.use(cors({
    origin: "*"
}))
io.on('connection', (socket) => {
    socket.on('room', function ({ user_name, room_id }) {
        socket.join(room_id);
    });
    socket.on('chat', function ({ room_id, data }) {
        socket.broadcast.to(room_id).emit("message", { room_id, data });
    });
    socket.on('deleteChat', function ({ room_id, data }) {
        room_id?.map((room: string | string[]) => {
            socket.broadcast.to(room_id).emit("deletedChat", { room_id, data });
        })
    });
    socket.on('leaveRoom', ({ room_id, user, message }) => {
        console.log('leave room ',room_id);
        
        socket.leave(room_id)
    });
    socket.on('newChat', (data) => {
        data?.room_id?.map((room: string | string[]) => {
            socket.broadcast.to(room).emit('chatCreated', data.data);
        })
    })
    socket.on('exitChat', (data) => {
        data?.room_id?.map((room: string | string[]) => {
            console.log(room);

            socket.broadcast.to(room).emit('userLeft', data.data);
        })
    })
})
app.use("/api/auth", authRouter)
app.use("/api/user", verifyUserToken, userRouter)
app.use("/api/question", verifyUserToken, questionRouter)
app.use("/api/answer", verifyUserToken, answerRouter)
app.use("/api/chat", verifyUserToken, chatRouter)
app.use("/api/dashboard", verifyUserToken, dashboardRouter)

app.use(errorHandler)

server.listen(port, () => {
    console.log('server connected to ' + port);
})