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
			 this.posts = [
                        {
                            id: 1,
                            author: 'CoreyMS',
                            title: 'My Latest Post!',
                            content: 'My latest post! This is exciting...\n\nThis will be a good overview of how to use the Django framework. I hope you all learn a lot and enjoy the series!',
                            date: 'August 27, 2018',
                            avatar: 'C'
                        },
                        {
                            id: 2,
                            author: 'TestUser',
                            title: 'Top 5 YouTube Channels For Learning Programming',
                            content: 'Quo inanis quando ea, mel an vide adversarium suscipiantur. Et dicunt eleifend splendide pro. Nibh animal dolorem vim ex, nec te agam referrentur. Usu admodum ocurreret ne.\n\nEt dico audire cotidieque sed, cibo latine ut has, an case magna alienum.',
                            date: 'August 26, 2018',
                            avatar: 'T'
                        },
                        {
                            id: 3,
                            author: 'TestUser',
                            title: 'The Rise of Data Science',
                            content: 'Per omittam placerat at. Eius aeque ei mei. Usu ex partiendo salutandi. Pro illud placerat molestiae ex, habeo vidisse volutpatum cu vel, efficiendi accommodare eum ea! Ne has case minimum facilisis, pertinax efficiendi eu vel!\n\nEt movet semper assueverit his. Mei et liber vitae. Vix et pericula definebas, vero falli.',
                            date: 'August 26, 2018',
                            avatar: 'T'
                        },
                        {
                            id: 4,
                            author: 'TestUser',
                            title: '5 Tips for Writing Catchy Headlines',
                            content: 'Learn how to write headlines that grab attention and keep readers engaged. These simple techniques will help you create compelling titles for your blog posts.',
                            date: 'August 26, 2018',
                            avatar: 'T'
                        }
                    ];
                    this.savePosts();
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
		

		
		if (this.posts.length === 0) {
			blogPosts.innerHTML = `
				<div class="empty-state">
					<h3>No posts yet</h3>
					<p>Start by creating your first blog post!</p>
				</div>
			`;
			return;
		}

		blogPosts.innerHTML = this.posts.map(post => `
			<div class="blog-post">
				<div class="post-header">
					<div class="author-avatar">${post.avatar}</div>
					<div class="post-meta">
						<div class="author-name">${post.author}</div>
						<div class="post-date">${post.date}</div>
					</div>
				</div>
				<h2 class="post-title">${post.title}</h2>
				<div class="post-content">${post.content.replace(/\n/g, '<br>')}</div>
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
