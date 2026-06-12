/**
 * Spark — Dashboard Controller
 * Handles data fetching, stat rendering, recent analyses,
 * and staggered card animations.
 */

document.addEventListener('DOMContentLoaded', async () => {
    // ── Auth & Sidebar ──
    requireAuth();
    renderSidebar('dashboard');

    // ── Fetch all dashboard data concurrently ──
    await Promise.allSettled([
        loadUserProfile(),
        loadAnalyses(),
        loadUserRating(),
    ]);

    // ── Trigger card entrance animations ──
    animateCardsOnLoad();
    setupHoverEffects();
});

/* ──────────────────────────────────────────────
   User Profile
   ────────────────────────────────────────────── */
async function loadUserProfile() {
    try {
        const data = await apiRequest('/api/user/profile');
        const nameEl = document.getElementById('user-name');
        if (data && data.name) {
            nameEl.textContent = data.name;
        }

        // Populate skin & hair types from profile if available
        const skinEl = document.getElementById('skin-type');
        const hairEl = document.getElementById('hair-type');

        setStat(skinEl, data?.skin_type || 'Not scanned');
        setStat(hairEl, data?.hair_type || 'Not scanned');
    } catch (err) {
        console.error('Failed to load profile:', err);
        showToast('Could not load your profile', 'error');
    }
}

/* ──────────────────────────────────────────────
   Analyses (total count + recent list)
   ────────────────────────────────────────────── */
async function loadAnalyses() {
    try {
        const analyses = await apiRequest('/api/user/analyses');
        const list = Array.isArray(analyses) ? analyses : [];

        // Total scans
        const totalEl = document.getElementById('total-scans');
        setStat(totalEl, list.length);

        // Recent analyses — last 3
        renderRecentAnalyses(list.slice(-3).reverse());
    } catch (err) {
        console.error('Failed to load analyses:', err);
        showToast('Could not load your analyses', 'error');

        const totalEl = document.getElementById('total-scans');
        setStat(totalEl, 0);
        renderRecentAnalyses([]);
    }
}

/* ──────────────────────────────────────────────
   User Rating
   ────────────────────────────────────────────── */
async function loadUserRating() {
    try {
        const data = await apiRequest('/api/user/rating');
        const ratingEl = document.getElementById('user-rating');

        if (data && data.rating !== undefined && data.rating !== null) {
            setStat(ratingEl, `${data.rating} / 5`);
        } else {
            setStat(ratingEl, 'Not rated');
        }
    } catch (err) {
        console.error('Failed to load rating:', err);
        const ratingEl = document.getElementById('user-rating');
        setStat(ratingEl, 'Not rated');
    }
}

/* ──────────────────────────────────────────────
   Render Recent Analyses
   ────────────────────────────────────────────── */
function renderRecentAnalyses(analyses) {
    const container = document.getElementById('recent-analyses');

    if (!analyses.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <p class="empty-state-text">No analyses yet — start with a Face Scan or Hair Analysis!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = analyses.map((item, index) => {
        const isSkin = (item.type || '').toLowerCase().includes('skin') ||
                       (item.type || '').toLowerCase().includes('face');
        const icon = isSkin ? '🧴' : '💇';
        const iconClass = isSkin ? 'skin' : 'hair';
        const label = isSkin ? 'Skin Analysis' : 'Hair Analysis';
        const date = formatDate(item.created_at || item.date);
        const delay = index * 0.1;

        return `
            <div class="analysis-item card-animate" style="animation-delay: ${delay}s;" id="analysis-item-${index}">
                <div class="analysis-icon ${iconClass}">${icon}</div>
                <div class="analysis-info">
                    <p class="analysis-type">${label}</p>
                    <p class="analysis-date">${date}</p>
                </div>
                <span class="analysis-badge completed">Completed</span>
            </div>
        `;
    }).join('');
}

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */

/** Remove shimmer and set stat value */
function setStat(el, value) {
    if (!el) return;
    el.classList.remove('shimmer');
    el.textContent = value;
}

/** Format ISO date to readable string */
function formatDate(dateStr) {
    if (!dateStr) return 'Recently';
    try {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return 'Recently';
    }
}

/* ──────────────────────────────────────────────
   Animations & Micro-interactions
   ────────────────────────────────────────────── */

function animateCardsOnLoad() {
    const cards = document.querySelectorAll('.card-animate');
    cards.forEach((card, i) => {
        card.style.animationDelay = `${i * 0.08}s`;
    });
}

function setupHoverEffects() {
    const featureCards = document.querySelectorAll('.feature-card');

    featureCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.animation = 'none';
            void card.offsetHeight; // reflow
        });

        // Subtle tilt effect on mousemove
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -3;
            const rotateY = ((x - centerX) / centerX) * 3;

            card.style.transform = `translateY(-4px) perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}
