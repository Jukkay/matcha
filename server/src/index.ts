import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());

app.get("/", (_req, res) => {
    res.send('backend server is running')
})
const port = 4000;
app.listen(port, () => {
    console.log(`backend server running at http://localhost:${port}`)
})