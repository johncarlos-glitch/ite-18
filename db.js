const mysql = require('mysql2/promise');

// Create a connection pool with error handling
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'student_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Handle pool errors without crashing
pool.on('error', (err) => {
    console.error('❌ MySQL Pool Error:', err.message);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('⚠️  Database connection lost. Attempting to reconnect...');
    } else if (err.code === 'ECONNREFUSED') {
        console.error('⚠️  Database connection refused. Is MySQL Server running?');
    } else {
        console.error('⚠️  Unexpected database error:', err.code);
    }
});

// Function to initialize the database
async function initializeDatabase() {
    let connection;
    try {
        // Connect without specifying a database first
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''
        });

        // Create database if it doesn't exist
        await connection.query('CREATE DATABASE IF NOT EXISTS student_db');
        await connection.query('USE student_db');

        // Create users table for authentication
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create student table with correct structure
        await connection.query(`
            CREATE TABLE IF NOT EXISTS student (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                age INT NOT NULL,
                course VARCHAR(50) NOT NULL,
                year INT NOT NULL,
                gender VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Database and tables verified/created successfully!');
        return true;

    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('💡 MySQL Server is not running or not accessible.');
            console.error('💡 Please start MySQL Server and try again.');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('💡 Access denied. Please check your MySQL username and password in db.js');
        }
        // Don't throw - let the server start anyway
        return false;
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (err) {
                // Ignore errors when closing connection
            }
        }
    }
}

// Export the pool and initializeDatabase function
module.exports = {
    pool,
    initializeDatabase
};