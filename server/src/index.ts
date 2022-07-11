import express from 'express';
import cors from 'cors';
import userRouter from './routes/user';
import { refreshToken, verifyEmailToken } from './controllers/token';
import * as SQLConnect from './utilities/SQLConnect'
import { getURL } from './utilities/getURL'
import { login, logout } from './controllers/user'
import checkJWT from './middleware/checkJWT';

const app: express.Application = express();

// initialize db pool
SQLConnect.init()

// Middleware
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors());

// Routes
app.get("/", (req: express.Request, res: express.Response) => {
    res.send('backend server is running')
})
app.post('/login', login)
app.post('/logout', checkJWT, logout)
app.post('/token', checkJWT, refreshToken)
app.get('/verify_email/:token', verifyEmailToken)

// User CRUD route
app.use('/user', userRouter);

// Server start
app.listen(process.env.PORT, () => {
    console.log(`backend server running at ${getURL()}`)
})