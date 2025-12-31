const mysql = require('mysql2/promise');

async function testConnection() {
    let connection;
    try {
        // Test connection to MySQL server
        connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''
        });
        console.log('✅ Successfully connected to MySQL server');

        // Test if database exists
        const [dbs] = await connection.query('SHOW DATABASES LIKE "student_db"');
        if (dbs.length === 0) {
            console.log('❌ Database "student_db" does not exist');
            console.log('Creating database...');
            await connection.query('CREATE DATABASE student_db');
            console.log('✅ Created database "student_db"');
        } else {
            console.log('✅ Database "student_db" exists');
        }

        // Test if table exists
        await connection.query('USE student_db');
        const [tables] = await connection.query('SHOW TABLES LIKE "students"');
        if (tables.length === 0) {
            console.log('❌ Table "students" does not exist');
            console.log('Creating table...');
            await connection.query(`
                CREATE TABLE students (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    age INT NOT NULL,
                    course VARCHAR(50) NOT NULL,
                    year INT NOT NULL,
                    gender VARCHAR(20) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log('✅ Created table "students"');
        } else {
            console.log('✅ Table "students" exists');
        }

        // Test inserting a sample record
        const [result] = await connection.query(
            'INSERT INTO students (name, age, course, year, gender) VALUES (?, ?, ?, ?, ?)',
            ['Test Student', 20, 'BSIT', 2, 'Male']
        );
        console.log('✅ Successfully inserted test student with ID:', result.insertId);

        // Verify the record was inserted
        const [students] = await connection.query('SELECT * FROM students');
        console.log('📋 Current students in database:');
        console.table(students);

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('⚠️  Could not connect to MySQL server. Make sure MySQL is running in XAMPP.');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('⚠️  Access denied. Please check your MySQL username and password in db.js');
        } else {
            console.error('⚠️  An error occurred:', error);
        }
    } finally {
        if (connection) await connection.end();
        process.exit();
    }
}

testConnection();
