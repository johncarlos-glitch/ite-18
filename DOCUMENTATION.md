# ITE18 Student Management System

## Project Structure

```
ITE18/
├── server.js              # Main Express server
├── server-simple.js       # Simplified server for basic operations
├── db.js                 # Database configuration and utilities
├── students.json         # JSON database file
├── students_data_2.0.csv # CSV data import file
├── index.html            # Main frontend file
├── script.js             # Frontend JavaScript
├── style.css             # Main stylesheet
├── clean-style.css       # Additional styles
└── package.json          # Node.js dependencies and scripts
```

## Backend Documentation

### Server Files

1. **server.js**
   - Main Express server with full functionality
   - Handles all API endpoints
   - Manages student data CRUD operations

2. **server-simple.js**
   - Simplified server with basic endpoints
   - Good for testing and development
   - Uses `students.json` as the data source

3. **db.js**
   - Database configuration
   - Connection utilities
   - Data access helper functions

### API Endpoints (server-simple.js)

- `GET /test` - Server status check
- `GET /students` - Get all students
- `POST /students` - Add new student
- `GET /students/:id` - Get single student
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student

## Frontend Documentation

### Main Files

- **index.html** - Main application interface
- **script.js** - Frontend JavaScript logic
- **style.css** - Main styling
- **clean-style.css** - Additional styles

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   node server.js
   # or for the simple version
   node server-simple.js
   ```

3. Access the application at `http://localhost:3001`

## Data Files

- **students.json** - JSON database file
- **students_data_2.0.csv** - CSV data for initial import

## Dependencies

- Express.js
- Body Parser (included in Express)
- File System (Node.js core)
- Path (Node.js core)
