// Global variables
let tasks = [];
let currentFilter = 'all';

// DOM elements
const taskForm = document.getElementById('taskForm');
const tasksList = document.getElementById('tasksList');
const taskCount = document.getElementById('taskCount');
const tabButtons = document.querySelectorAll('.tab-btn');

// Load data when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    updateTaskCount();
    renderTasks();
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDate').value = today;
});

// Event listener for form
taskForm.addEventListener('submit', function(e) {
    e.preventDefault();
    addTask();
});

// Event listeners for tab buttons
tabButtons.forEach(button => {
    button.addEventListener('click', function() {
        // Remove active class from all buttons
        tabButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        this.classList.add('active');
        
        // Update filter
        currentFilter = this.dataset.category;
        renderTasks();
    });
});

// Function to add new task
function addTask() {
    const title = document.getElementById('taskTitle').value.trim();
    const category = document.getElementById('taskCategory').value;
    const priority = document.getElementById('taskPriority').value;
    const date = document.getElementById('taskDate').value;
    const details = document.getElementById('taskDetails').value.trim();
    
    // Validation
    if (!title || !category || !priority || !date) {
        alert('Please fill in all required fields!');
        return;
    }
    
    // Create task object
    const task = {
        id: Date.now(), // Simple ID generation
        title: title,
        category: category,
        priority: priority,
        date: date,
        details: details || 'No detailed description',
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    // Add to array
    tasks.unshift(task); // unshift to add at beginning of array
    
    // Save and render
    saveTasks();
    renderTasks();
    updateTaskCount();
    
    // Reset form
    taskForm.reset();
    
    // Set default date again
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDate').value = today;
    
    // Success message
    showNotification('✅ Task added successfully!', 'success');
}

// Function to render tasks
function renderTasks() {
    const filteredTasks = currentFilter === 'all' 
        ? tasks 
        : tasks.filter(task => task.category === currentFilter);
    
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #6c757d;">
                <h3>🤷‍♂️ No tasks yet</h3>
                <p>Add your first task!</p>
            </div>
        `;
        return;
    }
    
    tasksList.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${task.priority} ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <div class="task-header">
                <div>
                    <div class="task-title">${task.title}</div>
                    <div class="task-category">${getCategoryIcon(task.category)} ${task.category}</div>
                </div>
            </div>
            
            <div class="task-meta">
                <div class="task-priority">
                    <span>⭐</span>
                    <span>Priority: ${getPriorityText(task.priority)}</span>
                </div>
                <div class="task-date">
                    <span>📅</span>
                    <span>Due: ${formatDate(task.date)}</span>
                </div>
            </div>
            
            <div class="task-details">
                ${task.details}
            </div>
            
            <div class="task-actions">
                ${task.completed 
                    ? `<button class="task-btn uncomplete-btn" onclick="toggleTask(${task.id})">↩️ Mark Incomplete</button>`
                    : `<button class="task-btn complete-btn" onclick="toggleTask(${task.id})">✅ Complete</button>`
                }
                <button class="task-btn delete-btn" onclick="deleteTask(${task.id})">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

// Function to toggle task (complete/uncomplete)
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
        updateTaskCount();
        
        const message = task.completed 
            ? '🎉 Task completed!' 
            : '↩️ Task marked as incomplete!';
        showNotification(message, 'success');
    }
}

// Delete task function
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks();
        updateTaskCount();
        showNotification('🗑️ Task deleted!', 'error');
    }
}

// Utility functions
function getCategoryIcon(category) {
    const icons = {
        'BraveBits': '🚀',
        'HREM': '👥',
        'QE': '🔍'
    };
    return icons[category] || '📋';
}

function getPriorityText(priority) {
    const priorities = {
        'high': '🔴 High',
        'medium': '🟡 Medium',
        'low': '🟢 Low'
    };
    return priorities[priority] || priority;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
    } else {
        return date.toLocaleDateString('en-US');
    }
}

function updateTaskCount() {
    taskCount.textContent = tasks.length;
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        font-weight: 600;
        animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Add to body
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Local Storage functions
function saveTasks() {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

function loadTasks() {
    const savedTasks = localStorage.getItem('todoTasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl + Enter to submit form
    if (e.ctrlKey && e.key === 'Enter') {
        const titleInput = document.getElementById('taskTitle');
        if (document.activeElement === titleInput || 
            document.activeElement === document.getElementById('taskDetails')) {
            taskForm.dispatchEvent(new Event('submit'));
        }
    }
});

// Smooth scroll for form when focused
document.getElementById('taskTitle').addEventListener('focus', function() {
    this.scrollIntoView({ behavior: 'smooth', block: 'center' });
});