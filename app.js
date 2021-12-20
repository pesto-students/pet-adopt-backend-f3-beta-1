const express = require('express');
const dotenv = require('dotenv');

const app = express();
dotenv.config({path: './config.env'});
require('./db/conn');

app.use(express.json());

// Linking the routes
app.use(require('./router/auth'));
app.use(require("./router/users/users"));
app.use(require("./router/items/items"));

// Linkubg the schemas
const User = require('./model/userSchema');

const PORT = process.env.PORT;


// app.get('/', (req,res) => {
//     res.send('<h1>Hello!!!</h1>')
// });



app.listen(PORT,()=>{
    console.log(`Server listening at port ${PORT}`);
});