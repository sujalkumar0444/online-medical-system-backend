const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
// dbconnect
const { databaseconnect } = require("./dbconfig");

// dbconnection
databaseconnect();

//Routes


// cors
app.use(cors({
    origin: '*'
}));

// app.use(cors({
//     origin: 'https://frontend-mauve-tau.vercel.app',
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type'],
// }));

// parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

const TIMEOUT = 300000; 
const server = app.listen(8800, () => {
    console.log(`Server is running`);
});

// Increase timeout
server.setTimeout(TIMEOUT);

// routes
app.get('/', (req, res) => {
    res.send("Welcome to the server");
});



app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal Server Error'
        }
    });
});
