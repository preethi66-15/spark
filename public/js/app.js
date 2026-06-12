// ── Spark Helper & Auth Utilities (app.js) ──

const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? ''
  : 'https://spark-backend-service.onrender.com'; // Replace this with your actual Render backend URL


// Auth state helper methods
function getToken() {
  return localStorage.getItem('spark_token');
}

function setToken(token) {
  localStorage.setItem('spark_token', token);
}

function getUser() {
  const user = localStorage.getItem('spark_user');
  return user ? JSON.parse(user) : null;
}

function setUser(user) {
  localStorage.setItem('spark_user', JSON.stringify(user));
}

function isLoggedIn() {
  return !!getToken();
}

function isAdmin() {
  const user = getUser();
  return user && user.role === 'admin';
}

function logout() {
  localStorage.removeItem('spark_token');
  localStorage.removeItem('spark_user');
  showToast('Logged out successfully', 'info');
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 1000);
}

// Global API Request handler
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  const config = {
    headers,
    ...options
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired/invalid, clear local auth
        localStorage.removeItem('spark_token');
        localStorage.removeItem('spark_user');
        window.location.href = 'login.html';
      }
      throw new Error(data.message || 'API request failed');
    }
    return data;
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err.message);
    throw err;
  }
}

// Toast notification helper
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  // Set icons based on toast type
  let icon = '✨';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '❌';
  if (type === 'info') icon = 'ℹ️';

  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  container.appendChild(toast);

  // Auto-remove toast after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.35s ease forwards';
    toast.addEventListener('animationend', () => {
      toast.remove();
      if (container.children.length === 0) {
        container.remove();
      }
    });
  }, 3000);
}

// Navigation Guards
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

function requireAdminAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  if (!isAdmin()) {
    window.location.href = 'dashboard.html';
    return false;
  }
  return true;
}

function redirectIfLoggedIn() {
  if (isLoggedIn()) {
    window.location.href = 'dashboard.html';
  }
}

// Date formatter helper
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Sidebar renderer for SPA dashboard views
function renderSidebar(activePage) {
  const sidebarContainer = document.getElementById('sidebar');
  if (!sidebarContainer) return;

  sidebarContainer.className = 'sidebar';

  const user = getUser();
  const name = user ? user.name : 'User';
  const role = user ? user.role : 'user';

  let adminLink = '';
  if (role === 'admin') {
    adminLink = `
      <li>
        <a href="admin.html" class="sidebar-link ${activePage === 'admin' ? 'active' : ''}">
          <span>🔒</span> Admin Panel
        </a>
      </li>
    `;
  }

  sidebarContainer.innerHTML = `
    <div class="sidebar-brand">Spark ✨</div>
    <ul class="sidebar-menu">
      <li>
        <a href="dashboard.html" class="sidebar-link ${activePage === 'dashboard' ? 'active' : ''}">
          <span>📊</span> Dashboard
        </a>
      </li>
      <li>
        <a href="face-scan.html" class="sidebar-link ${activePage === 'face-scan' ? 'active' : ''}">
          <span>📸</span> Face Scan
        </a>
      </li>
      <li>
        <a href="hair-scan.html" class="sidebar-link ${activePage === 'hair-scan' ? 'active' : ''}">
          <span>💇</span> Hair Analysis
        </a>
      </li>
      <li>
        <a href="recommendations.html" class="sidebar-link ${activePage === 'recommendations' ? 'active' : ''}">
          <span>📋</span> My Care Plan
        </a>
      </li>
      <li>
        <a href="rating.html" class="sidebar-link ${activePage === 'rating' ? 'active' : ''}">
          <span>⭐</span> Rate Us
        </a>
      </li>
      ${adminLink}
    </ul>
    <div class="sidebar-footer">
      <a onclick="logout()" class="sidebar-link" style="color: var(--red);">
        <span>🚪</span> Logout
      </a>
    </div>
  `;

  // Add mobile layout hamburger menu support
  let navTrigger = document.getElementById('mobile-nav-trigger');
  if (!navTrigger && window.innerWidth <= 768) {
    navTrigger = document.createElement('div');
    navTrigger.id = 'mobile-nav-trigger';
    navTrigger.style.position = 'fixed';
    navTrigger.style.top = '1.25rem';
    navTrigger.style.left = '1.25rem';
    navTrigger.style.zIndex = '1100';
    navTrigger.style.fontSize = '1.5rem';
    navTrigger.style.cursor = 'pointer';
    navTrigger.innerHTML = '☰';
    document.body.appendChild(navTrigger);

    navTrigger.addEventListener('click', () => {
      sidebarContainer.classList.toggle('mobile-open');
      navTrigger.innerHTML = sidebarContainer.classList.contains('mobile-open') ? '✕' : '☰';
    });
  }
}
