import express from "express";
const app = express()
import authRouter from "./routes/authRoute.js"
import cors from "cors"
import dbConnection from "../src/config/dbConnection.js"
import logger from "../src/helpers/quick-logger.js"
import errorHandler from "./helpers/errorHandler.js";
global.logger = logger
const port = process.env.port || 3000
dbConnection()

app.use(express.json())
app.use(cors())

app.use("/api/auth", authRouter)

app.use(errorHandler)

app.listen(port, () => {
    console.log('server connected to ' + port);
})