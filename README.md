# SIMS - Student Information Management System (Midterm Project)

This project implements a simple Student Information Management System (SIMS) with a plain HTML/CSS/JS frontend and a Node.js (Express) backend that stores data in a MySQL database.

## Prerequisites
- Node.js (v16+ recommended)
- MySQL Server installed and running
- MySQL user with appropriate permissions (default: root with no password)

## How to run locally
1. Make sure MySQL Server is running on your machine.
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Configure database (if needed):
   - Edit `db.js` to match your MySQL credentials (host, user, password)
   - Default settings: host='localhost', user='root', password='', database='student_db'
4. Start the server:
   ```bash
   npm start
   ```
   or
   ```bash
   node server.js
   ```
5. Open `http://localhost:3000` in your browser.

The database and table will be created automatically on first run if they don't exist.

## Features
- Add student via form (name, age, course, year, gender)
- List students in a table with delete action
- Search/filter by name or course; limit results to 20/50/all
- Input validation on client and server (age > 0, year 1-5, gender required)
- JSON file storage simulating a database

## API
Base URL: `http://localhost:3000`

### GET `/students`
Returns an array of students.

### POST `/students`
Create a student.

Body (JSON):
```json
{
  "name": "Jane Doe",
  "age": 19,
  "course": "BSIT",
  "year": 2,
  "gender": "Female"
}
```

Responses:
- `201 Created` with created student
- `400 Bad Request` when validation fails

### DELETE `/students/:id`
Deletes a student by ID. Returns `{ ok: true }` or `404` if not found.

## Project Structure
```
index.html      # UI
style.css       # basic styling
script.js       # frontend logic
server.js       # Express server and routes
students.json   # data store
```

## Database
- Database name: `student_db`
- Table name: `student`
- The database and table are automatically created on server startup if they don't exist.

## Troubleshooting
- **Students not saving**: Make sure MySQL Server is running and the database credentials in `db.js` are correct.
- **Connection errors**: Check that MySQL is accessible on `localhost` with the configured credentials.
- **Port already in use**: Change the PORT in `server.js` or set it via environment variable.

## Notes
- This is a Node.js/Express application (NOT Laravel PHP).
- Use `npm start` or `node server.js` to run (NOT `php artisan serve`).
- This is a learning project; no authentication is implemented.
