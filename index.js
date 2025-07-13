import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHander } from './middleware/errorHandeling.js';
import userRouter from './routes/userRoutes.js'
import authRouter from './routes/authRoutes.js'
import db from './db.js';
import { standardResponse } from './utils/utils.js';
dotenv.config();
let users = [1]
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', userRouter)
app.use('/api', authRouter)


app.get('/test', async (req, res) => {
    const [rows] = await db.query("SELECT * from users");
    standardResponse(res, 200,rows,'success')
});
app.use(errorHander)
app.listen(5000, () => console.log("Server running on port 5000"));
