const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
dotenv.config({path: './config.env'});
require('./db/conn');

if(process.env.NODE_ENV === 'production'){
    app.use(express.static("client/build"));
}
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(require('./router/auth'));

const PORT = process.env.PORT || 5000;

app.listen(PORT,()=>{
    console.log(`Server listening at port ${PORT}`);
});