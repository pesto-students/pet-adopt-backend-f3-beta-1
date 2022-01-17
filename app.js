const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const app = express();
dotenv.config({path: './config.env'});
require('./db/conn');

app.use(express.json());
app.use(cookieParser());
app.use(require('./router/auth'));
app.use(cors({origin: /\.herokuapp\.com$/}));

const User = require('./model/userSchema');

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server listening at port ${PORT}`);
});