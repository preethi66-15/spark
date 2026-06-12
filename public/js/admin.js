/**
 * Spark — Admin Dashboard Controller
 * Handles stats display, user management table, and ratings grid.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ── Auth guard ──
    requireAuth();
    const user = getUser();
    if (!user || user.role !== 'admin') {
        window.location.href = 'dashboard.html';
        return;
    }

    renderSidebar('admin');

    // ── Bootstrap data fetches ──
    loadStats();
    loadUsers();
    loadRatings();

    // ── Search binding ──
    const searchInput = document.getElementById('user-search');
    if (searchInput) {
        searchInput.addEventListener('input', handleUserSearch);
    }
});

/* ================================================================
   STATS
   ================================================================ */

async function loadStats() {
    try {
        const data = await apiRequest('/api/admin/stats');

        animateCount('stat-users', data.totalUsers);
        animateCount('stat-scans', data.totalAnalyses);
        animateCount('stat-ratings', data.totalRatings);
        animateCount('stat-avg-rating', data.averageRating, true);
    } catch (err) {
        console.error('Failed to load stats:', err);
        showToast('Failed to load dashboard stats', 'error');
    }
}

/**
 * Smoothly counts a stat-card value from 0 to `target`.
 * @param {string}  cardId    - ID of the stat-card element
 * @param {number}  target    - Final numeric value
 * @param {boolean} isDecimal - If true, display one decimal place
 */
function animateCount(cardId, target, isDecimal = false) {
    const card = document.getElementById(cardId);
    if (!card) return;
    const valueEl = card.querySelector('.stat-value');
    if (!valueEl) return;

    const duration = 1000; // ms
    const fps = 60;
    const totalFrames = Math.round(duration / (1000 / fps));
    let frame = 0;

    const counter = setInterval(() => {
        frame++;
        const progress = easeOutExpo(frame / totalFrames);
        const current = progress * target;

        valueEl.textContent = isDecimal
            ? current.toFixed(1)
            : Math.round(current).toLocaleString();

        if (frame >= totalFrames) {
            clearInterval(counter);
            valueEl.textContent = isDecimal
                ? Number(target).toFixed(1)
                : Number(target).toLocaleString();
        }
    }, 1000 / fps);
}

/** Easing function for a satisfying deceleration curve. */
function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/* ================================================================
   USERS TABLE
   ================================================================ */

let allUsers = []; // Cache for search filtering

async function loadUsers() {
    try {
        const data = await apiRequest('/api/admin/users');
        allUsers = data.users || data || [];
        renderUsersTable(allUsers);
    } catch (err) {
        console.error('Failed to load users:', err);
        showToast('Failed to load users', 'error');
        const tbody = document.getElementById('users-tbody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <span class="empty-icon">⚠️</span>
                        Unable to load users
                    </td>
                </tr>`;
        }
    }
}

/**
 * Renders the users table body.
 * @param {Array} users
 */
function renderUsersTable(users) {
    const tbody = document.getElementById('users-tbody');
    if (!tbody) return;

    if (!users.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    <span class="empty-icon">🔍</span>
                    No users found
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = users.map((u, i) => `
        <tr class="animate-in" style="animation-delay:${i * 0.03}s">
            <td>${i + 1}</td>
            <td>${escapeHtml(u.name || 'N/A')}</td>
            <td>${escapeHtml(u.email || 'N/A')}</td>
            <td>${u.age ?? 'N/A'}</td>
            <td>${u.skin_type || 'N/A'}</td>
            <td>${u.hair_type || 'N/A'}</td>
            <td>${formatDate(u.created_at)}</td>
        </tr>
    `).join('');
}

/** Real-time search/filter handler. */
function handleUserSearch() {
    const query = document.getElementById('user-search').value.trim().toLowerCase();
    if (!query) {
        renderUsersTable(allUsers);
        return;
    }
    const filtered = allUsers.filter(u =>
        (u.name && u.name.toLowerCase().includes(query)) ||
        (u.email && u.email.toLowerCase().includes(query))
    );
    renderUsersTable(filtered);
}

/* ================================================================
   RATINGS
   ================================================================ */

async function loadRatings() {
    try {
        const data = await apiRequest('/api/admin/ratings');
        const ratings = data.ratings || data || [];
        renderRatings(ratings);
    } catch (err) {
        console.error('Failed to load ratings:', err);
        showToast('Failed to load ratings', 'error');
        const container = document.getElementById('ratings-container');
        if (container) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1">
                    <span class="empty-icon">⚠️</span>
                    Unable to load ratings
                </div>`;
        }
    }
}

/**
 * Renders rating cards into the grid.
 * @param {Array} ratings
 */
function renderRatings(ratings) {
    const container = document.getElementById('ratings-container');
    if (!container) return;

    if (!ratings.length) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1">
                <span class="empty-icon">📭</span>
                No ratings yet
            </div>`;
        return;
    }

    container.innerHTML = ratings.map((r, i) => {
        const score = Number(r.rating) || 0;
        const tierClass = score >= 4 ? 'rating-high' : score === 3 ? 'rating-mid' : 'rating-low';
        const stars = renderStars(score);

        return `
            <div class="glass-card rating-card ${tierClass} animate-in" style="animation-delay:${i * 0.06}s">
                <div class="rc-header">
                    <div>
                        <div class="rc-user">${escapeHtml(r.user_name || r.name || 'Unknown')}</div>
                        <div class="rc-email">${escapeHtml(r.user_email || r.email || '')}</div>
                    </div>
                    <div class="rc-stars">${stars}</div>
                </div>
                <div class="rc-feedback">${escapeHtml(r.feedback || r.comment || 'No feedback provided')}</div>
                <div class="rc-date">${formatDate(r.created_at)}</div>
            </div>`;
    }).join('');
}

/**
 * Returns a string of filled/empty star spans.
 * @param {number} count - Rating 1-5
 */
function renderStars(count) {
    let html = '';
    for (let i = 1; i <= 5; i++) {
        html += i <= count
            ? '<span class="star-filled">★</span>'
            : '<span class="star-empty">★</span>';
    }
    return html;
}

/* ================================================================
   HELPERS
   ================================================================ */

/**
 * Formats an ISO date string to a human-readable form.
 * @param {string} iso
 * @returns {string} e.g. "Jan 15, 2026"
 */
function formatDate(iso) {
    if (!iso) return 'N/A';
    try {
        const d = new Date(iso);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    } catch {
        return 'N/A';
    }
}

/**
 * Escapes HTML entities to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
    if (!str) return '';
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return String(str).replace(/[&<>"']/g, c => map[c]);
}
