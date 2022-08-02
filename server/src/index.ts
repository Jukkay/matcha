import express from 'express';
import cors from 'cors';
import helmet from "helmet";
import userRouter from './routes/user';
import { refreshToken, verifyEmailToken } from './controllers/token';
import { resetPassword } from './controllers/resetpassword';
import { sendNewEmailVerification, sendPasswordReset } from './controllers/mailer';
import * as SQLConnect from './utilities/SQLConnect'
import { getURL } from './utilities/getURL'
import { login, logout } from './controllers/user'

const app: express.Application = express();

// initialize db pool
SQLConnect.init()

// Middleware
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors());
app.use(helmet());

// Routes
app.get("/", (req: express.Request, res: express.Response) => {
    res.send('backend server is running')
})
app.post('/login', login)
app.post('/logout', logout)
app.post('/token', refreshToken)
app.post('/emailtoken', sendNewEmailVerification)
app.post('/resetpasswordtoken', sendPasswordReset)
app.post('/verifyemail', verifyEmailToken)
app.post('/setpassword', resetPassword)

// User CRUD route
app.use('/user', userRouter);

// Server start
app.listen(process.env.PORT, () => {
    console.log(`backend server running at ${getURL()}`)
})
