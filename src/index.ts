import express from 'express';
import './db/mongoose.js';
import {postRouter} from './routers/post.js';
import {getRouter} from './routers/get.js';
import {patchRouter} from './routers/patch.js';
import {deleteRouter} from './routers/delete.js';
import {defaultRouter} from './routers/default.js';

const app = express();
app.use(express.json());
app.use(postRouter);
app.use(getRouter);
app.use(patchRouter);
app.use(deleteRouter);
app.use(defaultRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => {
console.log(`Server is up on port ${port}`);
});