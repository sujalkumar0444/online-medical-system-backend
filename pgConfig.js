const { Client } = require("pg");
const dotenv = require("dotenv");
dotenv.config();

async function postgreSQLConnect() {
    try {
        const pgClient = new Client({
            user: process.env.PG_USER,
            host: process.env.PG_HOST,
            database: process.env.PG_DATABASE,
            password: process.env.PG_PASSWORD,
            port: process.env.PG_PORT,
        });
        console.log("Trying to connect to PostgreSQL...");
        await pgClient.connect();
        console.log("Connected to PostgreSQL");
        return { pgClient };
    } catch (err) {
        console.error("Error connecting to PostgreSQL:", err);
    }
}

module.exports = { postgreSQLConnect };

