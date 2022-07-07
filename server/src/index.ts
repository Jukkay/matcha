import express from 'express';
import cors from 'cors';
// import bodyParser from 'body-parser';

const app: express.Application = express();
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors());

app.get("/", (req: express.Request, res: express.Response) => {
    res.send('backend server is running')
})

import userRouter from './routes/user';

app.use('/user', userRouter);
const port: number = 4000;
app.listen(port, () => {
    console.log(`backend server running at http://localhost:${port}`)
})