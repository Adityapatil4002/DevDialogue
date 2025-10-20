
import express from 'express';
import morgan from 'morgan';
import connect from './db/db.js';
import userRoutes from './Routes/User.routes.js';
import cookieParser from 'cookie-parser';


connect();

const app = express();  
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/user', userRoutes)
app.use(morgan('dev'))
app.get('/', (req, res) => {
    res.send('Hello World!');
})

export default app;