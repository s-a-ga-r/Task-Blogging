frappe.pages['task-blogging'].on_page_load = function(wrapper) {
	new BlogApp(wrapper);
};

class BlogApp {
	constructor(wrapper) {
		this.wrapper = wrapper;
		this.init();
	}

	init() {
		this.page = frappe.ui.make_app_page({
			parent: this.wrapper,
			title: 'Task Blogging',
			single_column: true
		});
		this.renderTemplate();
	}
	renderTemplate() {
		$(frappe.render_template("task_blogging", {})).appendTo(this.page.main);
		this.posts = JSON.parse(localStorage.getItem('taskBlogTasks') || '[]');
		// this.posts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
		this.initSampleData();
		this.renderPosts();
		this.bindEvents();
		this.addBlog()
		// this.closeModal()
		
	}

	addBlog(){
		let self = this
		$(document).on("click", ".open-modal", function (event) {
			console.log("clicked")
			self.openModal()
			// self.closeModal()
		})
	}

	closeDialog(){
		let self = this
		$(document).on("click", ".close-model", function (event) {
			console.log("clicked")
			// self.openModal()
			self.closeModal()
		})
	}

	initSampleData() {
		if (this.posts.length === 0) {

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
		document.getElementById('postForm').addEventListener('submit', (e) => {
			e.preventDefault();
			this.addPost();
		});

		// Close modal when clicking outside
		document.getElementById('postModal').addEventListener('click', (e) => {
			if (e.target === e.currentTarget) {
				this.closeModal();
			}
		});
	}

	renderPosts() {
		const blogPosts = document.getElementById('blogPosts');
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
                    blogPosts.innerHTML = `
                        <div class="empty-state">
                            <h3>No tasks found</h3>
                            <p>Start by creating your first task!</p>
                        </div>
                    `;
                    return;
                }

		
		// if (this.posts.length === 0) {
		// 	blogPosts.innerHTML = `
		// 		<div class="empty-state">
		// 			<h3>No posts yet</h3>
		// 			<p>Start by creating your first blog post!</p>
		// 		</div>
		// 	`;
		// 	return;
		// }

		// blogPosts.innerHTML = this.posts.map(post => `
		// 	<div class="blog-post">
		// 		<div class="post-header">
		// 			<div class="author-avatar">${post.avatar}</div>
		// 			<div class="post-meta">
		// 				<div class="author-name">${post.author}</div>
		// 				<div class="post-date">${post.date}</div>
		// 			</div>
		// 		</div>
		// 		<h2 class="post-title">${post.title}</h2>
		// 		<div class="post-content">${post.content.replace(/\n/g, '<br>')}</div>
		// 	</div>
		// `).join('');


		blogPosts.innerHTML = filteredTasks.map(task => `
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
                            <button class="action-btn view-btn" onclick="viewTask(${task.id})">Read More</button>
                            <button class="action-btn delete-btn" onclick="confirmDeleteTask(${task.id})">Delete</button>
                        </div>
                    </div>
                `).join('');
	}

	addPost() {
		const form = document.getElementById('postForm');
		const formData = new FormData(form);
		
		const newPost = {
			id: Date.now(),
			author: formData.get('authorName'),
			title: formData.get('postTitle'),
			content: formData.get('postContent'),
			date: new Date().toLocaleDateString('en-US', { 
				year: 'numeric', 
				month: 'long', 
				day: 'numeric' 
			}),
			avatar: formData.get('authorName').charAt(0).toUpperCase()
		};

		console.log(newPost);

		frappe.call({
			method:"task_blogging.task_blogging.page.task_blogging.task_blogging.save_task_blogs",
			args:{
				postdata:newPost
			},
			callback:(r)=>{



			}

		})

		this.posts.unshift(newPost);
		this.savePosts();
		this.renderPosts();
		this.closeModal();
		form.reset();
	}

	savePosts() {
		localStorage.setItem('blogPosts', JSON.stringify(this.posts));
	}

	openModal() {
		document.getElementById('postModal').style.display = 'block';
		this.closeDialog()

	}

	closeModal() {
		document.getElementById('postModal').style.display = 'none';
	}
}

// class Ends

// // Global functions for modal
// function openModal() {
// 	blogApp.openModal();
// }

// function closeModal() {
// 	closeModal();
// }

// // Initialize app
// let blogApp;
// document.addEventListener('DOMContentLoaded', () => {
// 	blogApp = new BlogApp();
// });

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
	if (e.key === 'Escape') {
		closeModal();
	}
});
