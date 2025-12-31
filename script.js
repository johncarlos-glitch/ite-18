// DOM Elements
const addStudentBtn = document.getElementById('addStudentBtn');
const studentModal = document.getElementById('studentModal');
const deleteModal = document.getElementById('deleteModal');
const closeModal = document.getElementById('closeModal');
const closeDeleteModal = document.getElementById('closeDeleteModal');
const cancelBtn = document.getElementById('cancelBtn');
const cancelDelete = document.getElementById('cancelDelete');
const confirmDeleteBtn = document.getElementById('confirmDelete');
const studentForm = document.getElementById('studentForm');
const searchInput = document.getElementById('searchInput');
const studentTableBody = document.getElementById('studentTableBody');
const toast = document.getElementById('toast');
const closeToast = document.getElementById('closeToast');

// Sample data - in a real app, this would come from an API
let students = [];
let editId = null;
let deleteId = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    loadStudents();
    
    // Add event listeners
    addStudentBtn.addEventListener('click', () => openModal());
    closeModal.addEventListener('click', () => closeModalFunc());
    closeDeleteModal.addEventListener('click', () => closeDeleteModalFunc());
    cancelBtn.addEventListener('click', () => closeModalFunc());
    cancelDelete.addEventListener('click', () => closeDeleteModalFunc());
    confirmDeleteBtn.addEventListener('click', deleteStudent);
    studentForm.addEventListener('submit', handleSubmit);
    searchInput.addEventListener('input', filterStudents);
    closeToast.addEventListener('click', () => {
        toast.style.display = 'none';
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === studentModal) closeModalFunc();
        if (e.target === deleteModal) closeDeleteModalFunc();
    });
});

// Load students
function loadStudents() {
    // In a real app, you would fetch this from an API
    // For demo purposes, we'll use sample data
    students = [
        { id: 1, name: 'John Doe', age: 20, gender: 'Male', course: 'Computer Science', year: '2', email: 'john@example.com', status: 'Active' },
        { id: 2, name: 'Jane Smith', age: 21, gender: 'Female', course: 'Engineering', year: '3', email: 'jane@example.com', status: 'Active' },
        { id: 3, name: 'Mike Johnson', age: 22, gender: 'Male', course: 'Business', year: '4', email: 'mike@example.com', status: 'Inactive' },
    ];
    
    updateTable(students);
    updateStats();
}

// Update the table with student data
function updateTable(studentsToShow) {
    if (studentsToShow.length === 0) {
        studentTableBody.innerHTML = `
            <tr>
                <td colspan="8" class="no-data">No students found. Add a new student to get started.</td>
            </tr>
        `;
        return;
    }
    
    studentTableBody.innerHTML = studentsToShow.map(student => `
        <tr>
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${student.age}</td>
            <td>${student.course}</td>
            <td>Year ${student.year}</td>
            <td>${student.gender}</td>
            <td><span class="badge ${student.status === 'Active' ? 'badge-success' : 'badge-warning'}">${student.status}</span></td>
            <td class="action-buttons">
                <button class="btn btn-edit" onclick="editStudent(${student.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-delete" onclick="confirmDeleteStudent(${student.id}, '${student.name.replace(/'/g, "\\'")}')">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Update statistics
function updateStats() {
    document.getElementById('totalStudents').textContent = students.length;
    document.getElementById('activeStudents').textContent = students.filter(s => s.status === 'Active').length;
    document.getElementById('inactiveStudents').textContent = students.filter(s => s.status !== 'Active').length;
    document.getElementById('totalCourses').textContent = [...new Set(students.map(s => s.course))].length;
}

// Filter students based on search input
function filterStudents() {
    const searchTerm = searchInput.value.toLowerCase();
    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm) ||
        student.course.toLowerCase().includes(searchTerm) ||
        (student.email && student.email.toLowerCase().includes(searchTerm))
    );
    updateTable(filteredStudents);
}

// Open modal for adding/editing a student
function openModal(id = null) {
    editId = id;
    const modalTitle = document.getElementById('studentModalLabel');
    
    if (id) {
        // Edit mode
        const student = students.find(s => s.id === id);
        if (!student) return;
        
        modalTitle.textContent = 'Edit Student';
        document.getElementById('name').value = student.name;
        document.getElementById('age').value = student.age || '';
        document.getElementById('gender').value = student.gender || '';
        document.getElementById('course').value = student.course || '';
        document.getElementById('year').value = student.year || '';
        document.getElementById('email').value = student.email || '';
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Student';
        studentForm.reset();
    }
    
    studentModal.style.display = 'flex';
}

// Close modal
function closeModalFunc() {
    studentModal.style.display = 'none';
    editId = null;
}

// Close delete confirmation modal
function closeDeleteModalFunc() {
    deleteModal.style.display = 'none';
    deleteId = null;
}

// Show delete confirmation
function confirmDeleteStudent(id, name) {
    deleteId = id;
    document.getElementById('studentToDelete').textContent = name;
    deleteModal.style.display = 'flex';
}

// Delete student
function deleteStudent() {
    if (!deleteId) return;
    
    // In a real app, you would make an API call here
    students = students.filter(student => student.id !== deleteId);
    
    closeDeleteModalFunc();
    updateTable(students);
    updateStats();
    showToast('Student deleted successfully', 'success');
}

// Handle form submission
function handleSubmit(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value.trim(),
        age: document.getElementById('age').value,
        gender: document.getElementById('gender').value,
        course: document.getElementById('course').value.trim(),
        year: document.getElementById('year').value,
        email: document.getElementById('email').value.trim(),
        status: 'Active' // Default status
    };
    
    // Basic validation
    if (!formData.name || !formData.course || !formData.year) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    if (editId) {
        // Update existing student
        const index = students.findIndex(s => s.id === editId);
        if (index !== -1) {
            students[index] = { ...students[index], ...formData };
            showToast('Student updated successfully', 'success');
        }
    } else {
        // Add new student
        const newStudent = {
            id: students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1,
            ...formData
        };
        students.push(newStudent);
        showToast('Student added successfully', 'success');
    }
    
    // Update UI
    updateTable(students);
    updateStats();
    closeModalFunc();
}

// Show toast notification
function showToast(message, type = 'info') {
    const toastTitle = document.getElementById('toastTitle');
    const toastMessage = document.getElementById('toastMessage');
    
    // Set title based on type
    const titles = {
        'success': 'Success',
        'error': 'Error',
        'info': 'Info'
    };
    
    // Set background color based on type
    const colors = {
        'success': '#4caf50',
        'error': '#f44336',
        'info': '#2196f3'
    };
    
    toastTitle.textContent = titles[type] || 'Notification';
    toastMessage.textContent = message;
    toast.style.display = 'block';
    
    // Auto hide after 3 seconds
    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

// Make functions available globally
window.editStudent = openModal;
window.confirmDeleteStudent = confirmDeleteStudent;
