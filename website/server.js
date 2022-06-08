import express from "express";
import path from "path";
import {fileURLToPath} from 'url';
import bodyParser from "body-parser";
import mongoose from "mongoose";

mongoose.connect('mongodb://localhost:27017/web-app-db', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
console.log('directory-name 👉️', __dirname);

const app = express();
app.use('/', express.static(path.join(__dirname, '/static')));
app.use(bodyParser.json());

app.post('/api/register', async (req, res) => {
    console.log(req.body);
    res.json({status: 'ok'});
})


app.listen(9999, () => {
    console.log("Server up at 9999");
})