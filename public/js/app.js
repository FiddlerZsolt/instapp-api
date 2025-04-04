// Global variables
let currentUser = null;
let authToken = localStorage.getItem('authToken');
const API_URL = 'http://localhost:3000/api';

// DOM Elements - will be initialized when DOM is loaded
let elements = {};

// Toast notification component
let toast;

// Initialize DOM elements
function initElements() {
  elements = {
    mainContainer: document.getElementById('main-container'),
    authButtons: document.getElementById('auth-buttons'),
    userInfo: document.getElementById('user-info'),
    welcomeUser: document.getElementById('welcome-user'),
    loginNavBtn: document.getElementById('login-nav-btn'),
    registerNavBtn: document.getElementById('register-nav-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    homeLink: document.getElementById('home-link'),
    exploreLink: document.getElementById('explore-link'),
    profileLink: document.getElementById('profile-link'),
  };
}

// API request helper
async function apiRequest(endpoint, method = 'GET', data = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const options = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, options);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || 'Something went wrong');
    }

    return result;
  } catch (error) {
    showNotification('Error', error.message, true);
    throw error;
  }
}

// Show notification
function showNotification(title, message, isError = false) {
  // Create toast container if it doesn't exist
  if (!document.getElementById('toast-container')) {
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'position-fixed bottom-0 end-0 p-3';
    toastContainer.style.zIndex = '5';

    toastContainer.innerHTML = `
      <div id="toast-notification" class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <strong class="me-auto" id="toast-title">Notification</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body" id="toast-message"></div>
      </div>
    `;

    document.body.appendChild(toastContainer);
    toast = new bootstrap.Toast(document.getElementById('toast-notification'));
  }

  document.getElementById('toast-title').textContent = title;
  document.getElementById('toast-message').textContent = message;
  document.getElementById('toast-notification').classList.toggle('bg-danger', isError);
  document.getElementById('toast-notification').classList.toggle('text-white', isError);

  toast.show();
}

// Check if user is authenticated
async function checkAuth() {
  if (authToken) {
    try {
      const userData = await apiRequest('/auth/me');
      currentUser = userData;

      // Update UI for authenticated user
      elements.authButtons.classList.add('d-none');
      elements.userInfo.classList.remove('d-none');
      elements.welcomeUser.textContent = `Hello, ${currentUser.username || currentUser.email}`;

      return true;
    } catch (error) {
      // Token is invalid, remove it
      localStorage.removeItem('authToken');
      authToken = null;
      return false;
    }
  }
  return false;
}

// Load all posts
async function loadPosts() {
  try {
    // Clear main container and add post content structure
    elements.mainContainer.innerHTML = `
      <div class="row">
        <!-- Left sidebar - user profile -->
        <div class="col-md-3 d-none d-md-block" id="user-profile">
          <div class="card mb-4">
            <div class="card-body text-center">
              <img src="https://via.placeholder.com/150" class="img-fluid rounded-circle mb-3" alt="Profile Image" id="profile-image">
              <h5 class="card-title" id="profile-username">Username</h5>
              <p class="card-text text-muted" id="profile-email">email@example.com</p>
            </div>
          </div>
        </div>

        <!-- Center column - posts feed -->
        <div class="col-md-6">
          <!-- Create post card (visible when logged in) -->
          <div class="card mb-4 d-none" id="create-post-card">
            <div class="card-body">
              <h5 class="card-title">Create Post</h5>
              <form id="create-post-form">
                <div class="mb-3">
                  <textarea class="form-control" id="post-content" rows="3" placeholder="What's on your mind?"></textarea>
                </div>
                <div class="mb-3">
                  <label for="post-image-url" class="form-label">Image URL (optional)</label>
                  <input type="url" class="form-control" id="post-image-url">
                </div>
                <button type="submit" class="btn btn-primary">Post</button>
              </form>
            </div>
          </div>

          <!-- Posts container -->
          <div id="posts-container">
            <div class="d-flex justify-content-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right sidebar - users list -->
        <div class="col-md-3">
          <div class="card">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">Users</h5>
            </div>
            <div class="card-body p-0">
              <ul class="list-group list-group-flush" id="users-list">
                <li class="list-group-item text-center">
                  <div class="spinner-border spinner-border-sm text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;

    // Get all posts from API
    const posts = await apiRequest('/posts');
    const postsContainer = document.getElementById('posts-container');
    const createPostCard = document.getElementById('create-post-card');
    const userProfile = document.getElementById('user-profile');

    // Show create post form and profile if user is authenticated
    if (currentUser) {
      createPostCard.classList.remove('d-none');
      userProfile.classList.remove('d-none');

      // Update profile info
      document.getElementById('profile-username').textContent = currentUser.username || 'User';
      document.getElementById('profile-email').textContent = currentUser.email || '';
    }

    // Display posts
    postsContainer.innerHTML = '';

    if (posts.length === 0) {
      postsContainer.innerHTML = '<div class="alert alert-info">No posts yet. Be the first to share something!</div>';
      return;
    }

    posts.forEach((post) => {
      const isLiked = post.likes && post.likes.some((like) => currentUser && like.userId === currentUser.id);

      const postHtml = `
        <div class="card post-card" data-id="${post.id}">
          <div class="card-header d-flex align-items-center">
            <img src="https://via.placeholder.com/40" class="avatar me-2" alt="User avatar">
            <div>
              <h6 class="mb-0">${post.user ? post.user.username : 'Unknown User'}</h6>
              <small class="text-muted">${new Date(post.created_at).toLocaleString()}</small>
            </div>
            ${
              currentUser && post.userId === currentUser.id
                ? `<div class="ms-auto dropdown">
                <button class="btn btn-sm btn-light" data-bs-toggle="dropdown"><i class="bi bi-three-dots"></i></button>
                <ul class="dropdown-menu">
                  <li><a class="dropdown-item edit-post" href="#" data-id="${post.id}">Edit</a></li>
                  <li><a class="dropdown-item delete-post" href="#" data-id="${post.id}">Delete</a></li>
                </ul>
              </div>`
                : ''
            }
          </div>
          <div class="card-body">
            <p class="card-text">${post.content}</p>
            ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image mb-3" alt="Post image">` : ''}
          </div>
          <div class="card-footer d-flex">
            <button class="btn btn-link like-button ${isLiked ? 'liked' : ''}" data-id="${post.id}">
              <i class="bi bi-heart${isLiked ? '-fill' : ''}"></i> ${post.likes ? post.likes.length : 0}
            </button>
            <button class="btn btn-link">
              <i class="bi bi-chat"></i> ${post.comments ? post.comments.length : 0}
            </button>
          </div>
        </div>
      `;
      postsContainer.innerHTML += postHtml;
    });

    // Add event listeners for post actions
    attachPostEventListeners();

    // Load users list
    loadUsers();
  } catch (error) {
    console.error('Error loading posts:', error);
    document.getElementById('posts-container').innerHTML =
      '<div class="alert alert-danger">Failed to load posts. Please try again later.</div>';
  }
}

// Load all users
async function loadUsers() {
  try {
    const users = await apiRequest('/users');
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = '';

    if (users.length === 0) {
      usersList.innerHTML = '<li class="list-group-item">No users found.</li>';
      return;
    }

    users.forEach((user) => {
      usersList.innerHTML += `
        <li class="list-group-item d-flex align-items-center">
          <img src="https://via.placeholder.com/32" class="avatar me-2" alt="${user.username}">
          <div>
            <h6 class="mb-0">${user.username || 'User'}</h6>
            <small class="text-muted">${user.email || ''}</small>
          </div>
        </li>
      `;
    });
  } catch (error) {
    console.error('Error loading users:', error);
    document.getElementById('users-list').innerHTML =
      '<li class="list-group-item text-danger">Failed to load users.</li>';
  }
}

// Attach event listeners to post actions
function attachPostEventListeners() {
  // Like/unlike post
  document.querySelectorAll('.like-button').forEach((button) => {
    button.addEventListener('click', async (e) => {
      if (!currentUser) {
        showNotification('Authentication Required', 'Please log in to like posts');
        showLoginForm();
        return;
      }

      const postId = e.currentTarget.dataset.id;
      const isLiked = e.currentTarget.classList.contains('liked');

      try {
        if (isLiked) {
          await apiRequest(`/posts/${postId}/like`, 'DELETE');
          e.currentTarget.classList.remove('liked');
          e.currentTarget.querySelector('i').classList.replace('bi-heart-fill', 'bi-heart');
        } else {
          await apiRequest(`/posts/${postId}/like`, 'POST');
          e.currentTarget.classList.add('liked');
          e.currentTarget.querySelector('i').classList.replace('bi-heart', 'bi-heart-fill');
        }

        // Reload posts to update like count
        loadPosts();
      } catch (error) {
        console.error('Error updating like:', error);
      }
    });
  });

  // Delete post
  document.querySelectorAll('.delete-post').forEach((link) => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();

      if (confirm('Are you sure you want to delete this post?')) {
        const postId = e.currentTarget.dataset.id;

        try {
          await apiRequest(`/posts/${postId}`, 'DELETE');
          showNotification('Success', 'Post deleted successfully');
          loadPosts();
        } catch (error) {
          console.error('Error deleting post:', error);
        }
      }
    });
  });

  // Edit post
  document.querySelectorAll('.edit-post').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const postId = e.currentTarget.dataset.id;
      showNotification('Info', 'Edit functionality coming soon!');
      // TODO: Implement edit post modal
    });
  });

  // Create post form submission
  const createPostForm = document.getElementById('create-post-form');
  if (createPostForm) {
    createPostForm.addEventListener('submit', handleCreatePost);
  }
}

// Handle create post form submission
async function handleCreatePost(e) {
  e.preventDefault();

  const content = document.getElementById('post-content').value;
  const imageUrl = document.getElementById('post-image-url').value;

  if (!content.trim()) {
    showNotification('Error', 'Post content cannot be empty', true);
    return;
  }

  try {
    await apiRequest('/posts', 'POST', { content, imageUrl });
    showNotification('Success', 'Post created successfully');

    // Clear form
    document.getElementById('post-content').value = '';
    document.getElementById('post-image-url').value = '';

    // Reload posts
    loadPosts();
  } catch (error) {
    console.error('Error creating post:', error);
  }
}

// Show login form
function showLoginForm() {
  elements.mainContainer.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0">Login</h4>
          </div>
          <div class="card-body">
            <form id="login-form">
              <div class="mb-3">
                <label for="login-email" class="form-label">Email</label>
                <input type="email" class="form-control" id="login-email" required>
              </div>
              <div class="mb-3">
                <label for="login-password" class="form-label">Password</label>
                <input type="password" class="form-control" id="login-password" required>
              </div>
              <button type="submit" class="btn btn-primary">Login</button>
              <button type="button" class="btn btn-link" id="show-register-btn">Need an account? Register</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add form submit event listener
  document.getElementById('login-form').addEventListener('submit', handleLogin);

  // Add show register form button event listener
  document.getElementById('show-register-btn').addEventListener('click', showRegisterForm);
}

// Show register form
function showRegisterForm() {
  elements.mainContainer.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0">Register</h4>
          </div>
          <div class="card-body">
            <form id="register-form">
              <div class="mb-3">
                <label for="register-username" class="form-label">Username</label>
                <input type="text" class="form-control" id="register-username" required>
              </div>
              <div class="mb-3">
                <label for="register-email" class="form-label">Email</label>
                <input type="email" class="form-control" id="register-email" required>
              </div>
              <div class="mb-3">
                <label for="register-password" class="form-label">Password</label>
                <input type="password" class="form-control" id="register-password" required>
              </div>
              <button type="submit" class="btn btn-primary">Register</button>
              <button type="button" class="btn btn-link" id="show-login-btn">Already have an account? Login</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `;

  // Add form submit event listener
  document.getElementById('register-form').addEventListener('submit', handleRegister);

  // Add show login form button event listener
  document.getElementById('show-login-btn').addEventListener('click', showLoginForm);
}

// Handle login form submission
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await apiRequest('/auth/login', 'POST', { email, password });
    authToken = response.token;
    localStorage.setItem('authToken', authToken);

    showNotification('Success', 'Logged in successfully');

    // Update UI and data
    await checkAuth();
    loadPosts();
  } catch (error) {
    console.error('Login error:', error);
  }
}

// Handle register form submission
async function handleRegister(e) {
  e.preventDefault();

  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  try {
    await apiRequest('/auth/register', 'POST', { username, email, password });
    showNotification('Success', 'Registration successful! You can now log in');

    // Switch to login form
    showLoginForm();

    // Pre-fill login form
    document.getElementById('login-email').value = email;
  } catch (error) {
    console.error('Registration error:', error);
  }
}

// Initialize event listeners
function initEventListeners() {
  // Navigation buttons
  elements.loginNavBtn.addEventListener('click', showLoginForm);
  elements.registerNavBtn.addEventListener('click', showRegisterForm);
  elements.logoutBtn.addEventListener('click', handleLogout);
  elements.homeLink.addEventListener('click', (e) => {
    e.preventDefault();
    loadPosts();
  });
  elements.exploreLink.addEventListener('click', (e) => {
    e.preventDefault();
    showNotification('Info', 'Explore functionality coming soon!');
  });
  elements.profileLink.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentUser) {
      showProfile();
    } else {
      showNotification('Authentication Required', 'Please log in to view your profile');
      showLoginForm();
    }
  });
}

// Handle logout
function handleLogout() {
  localStorage.removeItem('authToken');
  authToken = null;
  currentUser = null;

  // Update UI
  elements.authButtons.classList.remove('d-none');
  elements.userInfo.classList.add('d-none');

  showNotification('Success', 'Logged out successfully');
  loadPosts();
}

// Show user profile
function showProfile() {
  if (!currentUser) {
    showNotification('Authentication Required', 'Please log in to view your profile');
    return showLoginForm();
  }

  elements.mainContainer.innerHTML = `
    <div class="row">
      <div class="col-md-4">
        <div class="card">
          <div class="card-body text-center">
            <img src="https://via.placeholder.com/150" class="img-fluid rounded-circle mb-3" alt="Profile Image">
            <h3 class="card-title">${currentUser.username || 'User'}</h3>
            <p class="card-text text-muted">${currentUser.email || ''}</p>
            <button class="btn btn-primary" id="edit-profile-btn">Edit Profile</button>
          </div>
        </div>
      </div>
      <div class="col-md-8">
        <h4 class="mb-3">My Posts</h4>
        <div id="user-posts">
          <div class="d-flex justify-content-center">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // TODO: Implement user posts loading via API
  document.getElementById('user-posts').innerHTML =
    '<div class="alert alert-info">User posts feature coming soon!</div>';

  // Add edit profile button event listener
  document.getElementById('edit-profile-btn').addEventListener('click', () => {
    showNotification('Info', 'Edit profile functionality coming soon!');
  });
}

// Initialize the application
async function initApp() {
  // Initialize DOM elements
  initElements();

  // Check authentication status
  const isAuthenticated = await checkAuth();

  // Initialize event listeners
  initEventListeners();

  // Load posts feed (main content)
  loadPosts();
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);
