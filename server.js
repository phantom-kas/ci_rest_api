
import express from 'express';
import cors from 'cors';
import { errorHander } from './middleware/errorHandeling.js';
import userRouter from './routes/userRoutes.js'
import authRouter from './routes/authRoutes.js'
import courseRouter from './routes/courseRoutes.js'
import db from './db.js';
// import { standardResponse } from './utils/utils.js';
import trackRouter from './routes/trackRoute.js'
import path from 'path'
import { fileURLToPath } from 'url';
import learnerRouter from './routes/learnerRoutes.js'
import invoiceRouter from './routes/invoiceRoutes.js'
import reviewRouter from './routes/reviewRoutes.js'
import dasBoardRouter from './routes/dashBorad.js';
import cookieParser from "cookie-parser";
import googleRouter from "./routes/googleRoutes.js"
import webhooks from "./webhooks/index.js"
import session from "express-session";
import passport from 'passport';



let users = [1]
const app = express();
app.use(
    cors({
        origin: true,        // allow all origins dynamically
        credentials: true,   // allow cookies to be sent
    })
);
// app.use(express.json());
app.use((req, res, next) => {
    if (req.originalUrl === "/webhooks/stripe" || req.originalUrl === "/webhooks/paystack") {
        next(); // skip json parsing for webhooks
    } else {
        express.json()(req, res, next);
    }
});
app.use(cookieParser());
app.use(passport.initialize());
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "supersecret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//     },
//   })
// );
const __dirname = path.dirname(fileURLToPath(import.meta.url))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/api', userRouter)
app.use('/api', authRouter)
app.use('/api', courseRouter)
app.use('/api', trackRouter)
app.use('/api', learnerRouter)
app.use('/api', invoiceRouter)
app.use('/api', reviewRouter)
app.use('/api', dasBoardRouter)
app.use('/api', googleRouter)
app.use('/webhooks', webhooks)
// app.get('/test', async (req, res) => {
//     const [rows] = await db.query("SELECT * from users");
//     standardResponse(res, 200, rows, 'success')
// });
app.use(errorHander)
export default app;

