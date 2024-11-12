const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require("dotenv");
dotenv.config();
// dbconnect
const { mongoDBConnect } = require("./mongoConfig");
const { postgreSQLConnect } = require("./pgconfig");

// dbconnection
// mongoDBConnect();
// postgreSQLConnect();

//Routes


// cors
app.use(cors({
    origin: '*'
}));


// parsers
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

const TIMEOUT = 300000; 
const PORT = process.env.PORT || 8800;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
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
