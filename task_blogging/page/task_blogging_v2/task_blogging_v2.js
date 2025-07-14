frappe.pages['task-blogging-v2'].on_page_load = function (wrapper) {
    new TaskBlogApp(wrapper);
}

class TaskBlogApp {
    constructor(wrapper) {
        this.wrapper = wrapper;
        this.init();
    }

    init() {
        this.page = frappe.ui.make_app_page({
            parent: this.wrapper,
            title: 'Task Blogging V2',
            single_column: true
        })
        this.renderTemplate();
    }

    renderTemplate() {
        console.log("rendererddd");
        $(frappe.render_template("task_blogging_v2", {})).appendTo(this.page.main);
        this.tasks = JSON.parse(localStorage.getItem('taskBlogTasks') || '[]');
        this.selectedPriority = 'medium';
        this.currentFilter = 'all';
        this.currentTaskId = null;
        this.initSampleData();
        this.renderTasks();
        this.updateStats();
        this.bindEvents();
        this.OpenAddTask()
        this.closeAddTask()
        this.deleteBlog()
        this.closeViewer()
    }
   
    initSampleData() {
        if (this.tasks.length === 0) {
            this.tasks = [
                {
                    id: 1,
                    title: 'Complete Django Tutorial Series',
                    description: 'My latest task! This is exciting...\n\nThis will be a good overview of how to use the Django framework. I hope to learn a lot and enjoy the series!\n\nThe tutorial covers:\n- Setting up Django environment\n- Creating models and views\n- Working with templates\n- Database migrations\n- User authentication\n- Deployment strategies\n\nI plan to build a small project alongside the tutorial to practice what I learn.',
                    category: 'learning',
                    priority: 'high',
                    status: 'in-progress',
                    startTime: '2024-08-27T09:00',
                    endTime: '2024-08-27T11:00',
                    createdAt: new Date('2024-08-27').toISOString(),
                    author: 'TaskUser'
                },
                {
                    id: 2,
                    title: 'Research Top 5 YouTube Channels For Learning Programming',
                    description: 'Find the best programming channels on YouTube. Need to evaluate content quality, teaching style, and community engagement.\n\nThis will help me plan my learning path for the next months.\n\nChannels to research:\n- FreeCodeCamp\n- The Net Ninja\n- Traversy Media\n- Programming with Mosh\n- Corey Schafer\n\nCriteria for evaluation:\n- Content quality and accuracy\n- Teaching methodology\n- Community engagement\n- Regular updates\n- Beginner-friendly approach',
                    category: 'work',
                    priority: 'medium',
                    status: 'completed',
                    startTime: '2024-08-26T14:00',
                    endTime: '2024-08-26T16:00',
                    createdAt: new Date('2024-08-26').toISOString(),
                    author: 'TaskUser'
                },
                {
                    id: 3,
                    title: 'Data Science Project Planning',
                    description: 'Plan the next data science project. Need to define scope, timeline, and required resources.\n\nThis project will focus on analyzing user behavior patterns and creating predictive models.\n\nProject phases:\n1. Data collection and cleaning\n2. Exploratory data analysis\n3. Feature engineering\n4. Model development\n5. Model evaluation\n6. Deployment and monitoring\n\nExpected outcomes:\n- Improved user engagement metrics\n- Better understanding of user patterns\n- Predictive capabilities for user behavior',
                    category: 'project',
                    priority: 'high',
                    status: 'pending',
                    startTime: '2024-08-26T10:00',
                    endTime: '2024-08-26T12:00',
                    createdAt: new Date('2024-08-26').toISOString(),
                    author: 'TaskUser'
                }
            ];
            this.saveTasks();
        }
    }


    bindEvents() {
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });
        document.querySelectorAll('.priority-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                document.querySelectorAll('.priority-tag').forEach(t => t.classList.remove('selected'));
                e.target.classList.add('selected');
                this.selectedPriority = e.target.dataset.priority;
            });
        });

        // Close modals when clicking outside
        document.getElementById('taskModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeModal();
            }
        });

        document.getElementById('blogReaderModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeBlogReader();
            }
        });

        document.getElementById('deleteModal').addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                this.closeDeleteModal();
            }
        });

        // Set default datetime
        this.setDefaultDateTime();
    }
    
    renderTasks() {
        console.log("rendering tasks");
        const taskPosts = document.getElementById('taskPosts');
        let filteredTasks = this.tasks;

        switch (this.currentFilter) {
            case 'today':
                const today = new Date().toDateString();
                filteredTasks = this.tasks.filter(task =>
                    new Date(task.startTime).toDateString() === today
                );
                break;
            case 'high':
                filteredTasks = this.tasks.filter(task => task.priority === 'high');
                break;
            case 'completed':
                filteredTasks = this.tasks.filter(task => task.status === 'completed');
                break;
            case 'pending':
                filteredTasks = this.tasks.filter(task => task.status === 'pending');
                break;
        }

        if (filteredTasks.length === 0) {
            taskPosts.innerHTML = `
                <div class="empty-state">
                    <h3>No tasks found</h3>
                    <p>Start by creating your first task!</p>
                </div>
            `;
            return;
        }

        taskPosts.innerHTML = filteredTasks.map(task => `
            <div class="task-post">
                <div class="post-header">
                    <div class="author-avatar">${task.author.charAt(0)}</div>
                    <div class="post-meta">
                        <div class="author-name">${task.author}</div>
                        <div class="post-date">${this.formatDate(task.createdAt)}</div>
                    </div>
                    <div class="task-status ${task.status.replace('-', '')}">${task.status.replace('-', ' ').toUpperCase()}</div>
                </div>
                <h2 class="task-title">${task.title}</h2>
                <div class="task-content task-content-preview">${task.description.split('\n')[0]}</div>
                <div class="task-details">
                    <span class="task-category">${task.category.toUpperCase()}</span>
                    <span class="task-priority ${task.priority}">${task.priority.toUpperCase()}</span>
                    <span class="task-time">${this.formatDateTime(task.startTime)} - ${this.formatDateTime(task.endTime)}</span>
                </div>
                <div class="post-actions">
                    <button class="action-btn view-btn" data-task-id=${task.id}>Read More</button>
                    <button class="action-btn delete-btn" data-task-id="${task.id}">Delete</button>
                </div>
            </div>
        `).join('');


        this.viewBlog()
    }

    // viewTask(taskId) {
    //     const task = this.tasks.find(t => t.id === taskId);
    //     if (!task) return;
    //     this.currentTaskId = taskId;
    //     // Populate blog reader modal
    //     document.getElementById('blogTitle').textContent = task.title;
    //     document.getElementById('blogAvatar').textContent = task.author.charAt(0);
    //     document.getElementById('blogAuthor').textContent = task.author;
    //     document.getElementById('blogDate').textContent = this.formatDate(task.createdAt);
    //     document.getElementById('blogContent').innerHTML = task.description.replace(/\n/g, '<br>');

    //     // $(".container2").html("");

    //     // Populate task details

    //     document.getElementById('blogDetails').innerHTML = `
    //         <div class="blog-reader-detail-item">
    //             <div class="blog-reader-detail-label">Category</div>
    //             <div class="blog-reader-detail-value">${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</div>
    //         </div>
    //         <div class="blog-reader-detail-item">
    //             <div class="blog-reader-detail-label">Priority</div>
    //             <div class="blog-reader-detail-value">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</div>
    //         </div>
    //         <div class="blog-reader-detail-item">
    //             <div class="blog-reader-detail-label">Status</div>
    //             <div class="blog-reader-detail-value">${task.status.replace('-', ' ').toUpperCase()}</div>
    //         </div>
    //         <div class="blog-reader-detail-item">
    //             <div class="blog-reader-detail-label">Start Time</div>
    //             <div class="blog-reader-detail-value">${this.formatFullDateTime(task.startTime)}</div>
    //         </div>
    //         <div class="blog-reader-detail-item">
    //             <div class="blog-reader-detail-label">End Time</div>
    //             <div class="blog-reader-detail-value">${this.formatFullDateTime(task.endTime)}</div>
    //         </div>
    //         <div class="blog-reader-detail-item">
    //             <div class="blog-reader-detail-label">Duration</div>
    //             <div class="blog-reader-detail-value">${this.calculateDuration(task.startTime, task.endTime)}</div>
    //         </div>
    //     `;
    //     // Show blog reader modal
    //     document.getElementById('blogReaderModal').style.display = 'block';
    // }

    viewTask(taskId) {
        let self = this
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) {
            console.error(`Task with ID ${taskId} not found`);
            return;
        };

        this.currentTaskId = taskId;

        // Create the blog reader content as HTML string
        const blogReaderHTML = `
            <div id="blogReaderModal" class="blog-reader-content">
                 <button class="blog-reader-close">&times;</button>
                <div class="blog-reader-header">
                    <div class="blog-reader-meta">
                        <div class="blog-reader-avatar">${task.author.charAt(0)}</div>
                        <div class="blog-reader-author-info">
                            <div class="blog-reader-author-name">${task.author}</div>
                            <div class="blog-reader-date">${this.formatDate(task.createdAt)}</div>
                        </div>
                        <div class="blog-reader-actions">
                            <button class="action-btn delete-btn">Delete</button>
                        </div>
                        <div class="blog-reader-actions">
                            <button class="action-btn close-viewer">Close</button>
                        </div>
                    </div>
                </div>
                <div class="blog-reader-content-body">
                    <h1 class="blog-reader-title">${task.title}</h1>
                    <div class="blog-reader-text">${task.description.replace(/\n/g, '<br>')}</div>
                        <div class="blog-reader-details">
                            <div class="blog-reader-detail-item">
                                <div class="blog-reader-detail-label">Category</div>
                                <div class="blog-reader-detail-value">${task.category.charAt(0).toUpperCase() + task.category.slice(1)}</div>
                            </div>
                            <div class="blog-reader-detail-item">
                                <div class="blog-reader-detail-label">Priority</div>
                                <div class="blog-reader-detail-value">${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</div>
                            </div>
                            <div class="blog-reader-detail-item">
                                <div class="blog-reader-detail-label">Status</div>
                                <div class="blog-reader-detail-value">${task.status.replace('-', ' ').toUpperCase()}</div>
                            </div>
                            <div class="blog-reader-detail-item">
                                <div class="blog-reader-detail-label">Start Time</div>
                                <div class="blog-reader-detail-value">${this.formatFullDateTime(task.startTime)}</div>
                            </div>
                            <div class="blog-reader-detail-item">
                                <div class="blog-reader-detail-label">End Time</div>
                                <div class="blog-reader-detail-value">${this.formatFullDateTime(task.endTime)}</div>
                            </div>
                            <div class="blog-reader-detail-item">
                                <div class="blog-reader-detail-label">Duration</div>
                                <div class="blog-reader-detail-value">${this.calculateDuration(task.startTime, task.endTime)}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Clear the container and append the blog reader content

        $(".container2").html("");
        $(".page-container").html("")
        $("#body").append(blogReaderHTML);

        // Add event listener for the close button
        $(".blog-reader-close .close-viewer").click(function () {
            // $(".container2").html("");
            console.log("close clicked");

            self.closeBlogReader();

            // self.renderTasks()
            // Optional: reload your task posts here if needed
            // loadTaskPosts();
        });

        // Add event listener for the delete button
        $(".action-btn.delete-btn").click(function () {
            // Handle delete functionality
            self.confirmDeleteTask();
        });
    }

    OpenAddTask() {
        $(document).on("click", "#open-modal", function (event) {
            console.log("clicked")
            document.getElementById('taskModal').style.display = 'block';
        })
    }

    closeAddTask() {
        $(document).on("click", ".close-model", function (event) {
            console.log("close clicked")
            document.getElementById('taskModal').style.display = 'none';
        })
    }


    closeViewer() {
        let self = this
        $(document).on("click", ".close-viewer", function (event) {
            console.log("close clicked")
            // document.getElementById('blogReaderModal').style.display = 'none';
            self.closeBlogReader()
        })
    }

    closeBlogReader() {
        // document.getElementById('blogReaderModal').style.display = 'none';
        $("#blogReaderModal").remove();
        this.currentTaskId = null;
        this.renderTemplate()
    }


    deleteBlog() {
        let self = this
        $(document).on("click", ".delete-btn", function (event) {
            console.log("delete clicked")

            let taskid = $(this).data("task-id");
            // console.log(taskid);
            self.deleteTask()
            // document.getElementById('taskModal').style.display = 'none';
        })
        $(document).on("click", ".confirm-delete-btn", function (event) {
            console.log("confirm clicked clicked")
            self.confirmDeleteTask(taskid)

            
        })
    }

    viewBlog() {
        let self = this
        $(document).on("click", ".view-btn", function (event) {
            console.log("view-blog clicked");
            // 
            let taskid = $(this).data("task-id")
            console.log(taskid);
            self.viewTask(taskid)

        })
    }

    confirmDeleteTask(taskId) {
        this.currentTaskId = taskId;
        document.getElementById('deleteModal').style.display = 'block';
    }

    deleteTask() {
        if (!this.currentTaskId) return;
        this.tasks = this.tasks.filter(task => task.id !== this.currentTaskId);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.closeDeleteModal();
        this.closeBlogReader();
        this.currentTaskId = null;
    }

    addTask() {
        const form = document.getElementById('taskForm');
        const formData = new FormData(form);

        const newTask = {
            id: Date.now(),
            title: formData.get('taskTitle'),
            description: formData.get('taskDescription'),
            category: formData.get('taskCategory'),
            priority: this.selectedPriority,
            status: formData.get('taskStatus'),
            startTime: formData.get('startTime'),
            endTime: formData.get('endTime'),
            createdAt: new Date().toISOString(),
            author: 'TaskUser'
        };

        this.tasks.unshift(newTask);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.closeModal();
        form.reset();
        this.setDefaultDateTime();

        // Reset priority selection
        document.querySelectorAll('.priority-tag').forEach(t => t.classList.remove('selected'));
        document.querySelector('.priority-tag.medium').classList.add('selected');
        this.selectedPriority = 'medium';
    }

    saveTasks() {
        localStorage.setItem('taskBlogTasks', JSON.stringify(this.tasks));
    }

    updateStats() {
        const today = new Date().toDateString();
        const todayTasks = this.tasks.filter(task =>
            new Date(task.startTime).toDateString() === today
        );
        const completedTasks = this.tasks.filter(task => task.status === 'completed');
        const pendingTasks = this.tasks.filter(task => task.status === 'pending');

        document.getElementById('totalTasks').textContent = this.tasks.length;
        document.getElementById('todayTasks').textContent = todayTasks.length;
        document.getElementById('completedTasks').textContent = completedTasks.length;
        document.getElementById('pendingTasks').textContent = pendingTasks.length;
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    formatDateTime(dateTimeStr) {
        const date = new Date(dateTimeStr);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatFullDateTime(dateTimeStr) {
        const date = new Date(dateTimeStr);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    calculateDuration(startTime, endTime) {
        const start = new Date(startTime);
        const end = new Date(endTime);
        const diffMs = end - start;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (diffHours > 0) {
            return `${diffHours}h ${diffMinutes}m`;
        } else {
            return `${diffMinutes}m`;
        }
    }

    filterTasks(filter) {
        this.currentFilter = filter;
        this.renderTasks();
    }

    setDefaultDateTime() {
        const now = new Date();
        const startTime = new Date(now.getTime() + 30 * 60000); // 30 minutes from now
        const endTime = new Date(now.getTime() + 90 * 60000); // 1.5 hours from now

        document.getElementById('startTime').value = startTime.toISOString().slice(0, 16);
        document.getElementById('endTime').value = endTime.toISOString().slice(0, 16);
    }

    closeDeleteModal() {
        document.getElementById('deleteModal').style.display = 'none';
        this.currentTaskId = null;
    }

    confirmDelete() {
        if (!this.currentTaskId) return;
        document.getElementById('deleteModal').style.display = 'block';
    }
}

// Global functions
// function openModal() {
//     taskBlogApp.openModal();
// }

// function closeModal() {
//     taskBlogApp.closeModal();
// }

// function filterTasks(filter) {
//     taskBlogApp.filterTasks(filter);
// }

// function viewTask(taskId) {
//     taskBlogApp.viewTask(taskId);
// }

// function confirmDeleteTask(taskId) {
//     taskBlogApp.confirmDeleteTask(taskId);
// }

// function deleteTask() {
//     taskBlogApp.deleteTask();
// }

// function closeBlogReader() {
//     taskBlogApp.closeBlogReader();
// }

// function closeDeleteModal() {
//     taskBlogApp.closeDeleteModal();
// }

// function confirmDelete() {
//     taskBlogApp.confirmDelete();
// }

// // Initialize app
// let taskBlogApp;
// document.addEventListener('DOMContentLoaded', () => {
//     taskBlogApp = new TaskBlogApp();
// });

// // Keyboard shortcuts
// document.addEventListener('keydown', (e) => {
//     if (e.key === 'Escape') {
//         closeModal();
//         closeBlogReader();
//         closeDeleteModal();
//     }
// });
