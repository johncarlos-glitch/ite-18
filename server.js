const express = require('express');
const path = require('path');
const session = require('express-session');
const { pool, initializeDatabase } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'your-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(express.static(path.join(__dirname, 'public')));

// Initialize database (non-blocking - server will start even if DB fails)
let dbInitialized = false;
initializeDatabase()
    .then(() => {
        dbInitialized = true;
        console.log('✅ Database initialized successfully');
    })
    .catch((error) => {
        console.error('❌ Database initialization failed:', error.message);
        console.error('⚠️  Server will continue running, but database operations may fail.');
        console.error('💡 Please make sure MySQL Server is running and credentials are correct in db.js');
        dbInitialized = false;
    });

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT 1 as health');
        res.json({ 
            status: 'ok', 
            database: 'connected',
            initialized: dbInitialized 
        });
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            database: 'disconnected',
            error: error.message 
        });
    }
});

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized. Please login first.' });
}

// Serve login page for root route
app.get('/', (req, res) => {
    if (req.session && req.session.userId) {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    } else {
        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    }
});

// Serve login page
app.get('/login', (req, res) => {
    if (req.session && req.session.userId) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve main page (protected)
app.get('/dashboard', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Check authentication status
app.get('/api/auth/status', (req, res) => {
    res.json({
        authenticated: !!(req.session && req.session.userId),
        username: req.session?.username || null
    });
});

// Signup route
app.post('/api/auth/signup', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    try {
        // Check if username or email already exists
        const [existing] = await pool.query(
            'SELECT id FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Simple password hashing (in production, use bcrypt)
        // For now, we'll store a simple hash (NOT SECURE FOR PRODUCTION)
        const passwordHash = Buffer.from(password).toString('base64'); // Simple encoding

        // Insert new user
        const [result] = await pool.query(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, passwordHash]
        );

        // Create session
        req.session.userId = result.insertId;
        req.session.username = username;

        console.log(`✅ New user registered: ${username} (ID: ${result.insertId})`);
        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            user: { id: result.insertId, username, email }
        });
    } catch (error) {
        console.error('❌ Error during signup:', error);
        res.status(500).json({ error: 'Error creating account. Please try again.' });
    }
});

// Login route
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        const passwordHash = Buffer.from(password).toString('base64');
        
        const [users] = await pool.query(
            'SELECT id, username, email FROM users WHERE username = ? AND password = ?',
            [username, passwordHash]
        );

        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = users[0];

        // Create session
        req.session.userId = user.id;
        req.session.username = user.username;

        console.log(`✅ User logged in: ${user.username} (ID: ${user.id})`);
        res.json({
            success: true,
            message: 'Login successful',
            user: { id: user.id, username: user.username, email: user.email }
        });
    } catch (error) {
        console.error('❌ Error during login:', error);
        res.status(500).json({ error: 'Error during login. Please try again.' });
    }
});

// Logout route
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('❌ Error destroying session:', err);
            return res.status(500).json({ error: 'Error logging out' });
        }
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Logged out successfully' });
    });
});


// CRUD mao ni ang R(read)
// Get all students (protected)
app.get('/students', requireAuth, async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM student ORDER BY id DESC');
        console.log(`Fetched ${rows.length} students`);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: `Internal server error: ${error.message}` });
    }
});
// CRUD mao ni ang C(create)
// Add new student (protected)
app.post('/students', requireAuth, async (req, res) => {
    const { name, age, course, year, gender } = req.body;
    
    console.log('POST /students - Received data:', req.body);
    
    if (!name || !age || !course || !year || !gender) {
        console.log('Validation failed - missing fields');
        return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate data types
    if (isNaN(age) || isNaN(year)) {
        return res.status(400).json({ error: 'Age and year must be valid numbers' });
    }

    try {
        // Test database connection
        await pool.query('SELECT 1');
        
        const [result] = await pool.query(
            'INSERT INTO student (name, age, course, year, gender) VALUES (?, ?, ?, ?, ?)',
            [name, parseInt(age), course, parseInt(year), gender]
        );
        console.log('✅ Student inserted successfully with ID:', result.insertId);
        const newStudent = { id: result.insertId, name, age: parseInt(age), course, year: parseInt(year), gender };
        res.status(201).json(newStudent);
    } catch (error) {
        console.error('❌ Error adding student:', error);
        if (error.code === 'ECONNREFUSED') {
            res.status(503).json({ error: 'Database connection failed. Please make sure MySQL Server is running.' });
        } else if (error.code === 'ER_NO_SUCH_TABLE') {
            res.status(500).json({ error: 'Database table not found. Please restart the server to initialize the database.' });
        } else {
            res.status(500).json({ error: `Error adding student: ${error.message}` });
        }
    }
});
//CRUD mao ni ang U(update)
// Update student (protected)
app.put('/students/:id', requireAuth, async (req, res) => {
    const { id } = req.params;
    const { name, age, course, year, gender } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE student SET name = ?, age = ?, course = ?, year = ?, gender = ? WHERE id = ?',
            [name, age, course, year, gender, id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        res.json({ id, ...req.body });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ error: 'Error updating student' });
    }
});
// CRUD mao ni ang D(delete)
// Delete student (protected)
app.delete('/students/:id', requireAuth, async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM student WHERE id = ?', [id]);
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }
        
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ error: 'Error deleting student' });
    }
});

// Start the server (will start even if database initialization fails)
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    if (!dbInitialized) {
        console.log('⚠️  Warning: Database not initialized. Some features may not work.');
    }
});

// Error handling - prevent server from crashing
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    console.error('⚠️  Server will continue running...');
    // Don't exit - let the server keep running
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
    console.error('⚠️  Server will continue running...');
    // Don't exit - let the server keep running
});

// Graceful shutdown on SIGTERM/SIGINT
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\nSIGINT received, shutting down gracefully...');
    process.exit(0);
});