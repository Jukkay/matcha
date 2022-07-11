import express from 'express';
import cors from 'cors';
import userRouter from './routes/user';
import { verifyEmailToken } from './controllers/verifyEmailToken';
import * as SQLConnect from './utilities/SQLConnect'
import { getURL } from './utilities/getURL'

const app: express.Application = express();
SQLConnect.init()
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors());

app.get("/", (req: express.Request, res: express.Response) => {
    res.send('backend server is running')
})

app.use('/user', userRouter);
app.listen(process.env.PORT, () => {
    console.log(`backend server running at ${getURL()}`)
})
app.get("/verify_email/:token", verifyEmailToken)