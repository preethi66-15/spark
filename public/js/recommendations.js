/**
 * Spark — Recommendations Page
 * Fetches user analyses and renders personalized care tabs.
 */

document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    renderSidebar('recommendations');
    initRecommendations();
});

/* ─── State ─── */
let skinAnalysis = null;
let hairAnalysis = null;
let activeTab = 'skin';

/* ─── Bootstrap ─── */
async function initRecommendations() {
    try {
        const analyses = await apiRequest('/api/user/analyses');

        if (!analyses || analyses.length === 0) {
            showEmptyState();
            return;
        }

        // Find latest of each type
        skinAnalysis = [...analyses]
            .filter(a => a.type === 'skin')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;

        hairAnalysis = [...analyses]
            .filter(a => a.type === 'hair')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;

        // Read initial tab from URL hash
        const hash = window.location.hash.replace('#', '');
        if (['skin', 'hair', 'diet', 'water', 'sleep'].includes(hash)) {
            activeTab = hash;
        }

        setupTabs();
        renderTab(activeTab);
    } catch (err) {
        console.error('Failed to load analyses:', err);
        showToast('Unable to load your recommendations. Please try again.', 'error');
        showEmptyState();
    }
}

/* ─── Empty state ─── */
function showEmptyState() {
    const tabBar = document.getElementById('tab-bar');
    const content = document.getElementById('tab-content');
    const empty = document.getElementById('empty-state');

    if (tabBar) tabBar.style.display = 'none';
    if (content) content.style.display = 'none';
    if (empty) empty.style.display = 'block';
}

/* ─── Tab setup ─── */
function setupTabs() {
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            if (tab === activeTab) return;
            switchTab(tab);
        });
    });

    // Highlight initial tab
    highlightTab(activeTab);

    // Listen for hash changes (back/forward)
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '');
        if (['skin', 'hair', 'diet', 'water', 'sleep'].includes(hash) && hash !== activeTab) {
            switchTab(hash, false);
        }
    });
}

function highlightTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
        btn.setAttribute('aria-selected', btn.dataset.tab === tab);
    });
}

/* ─── Tab switching with fade animation ─── */
function switchTab(tab, pushHash = true) {
    const content = document.getElementById('tab-content');
    if (!content) return;

    // Fade out
    content.style.transition = 'opacity .18s ease, transform .18s ease';
    content.style.opacity = '0';
    content.style.transform = 'translateY(6px)';

    setTimeout(() => {
        activeTab = tab;
        highlightTab(tab);
        renderTab(tab);

        if (pushHash) {
            history.replaceState(null, '', `#${tab}`);
        }

        // Fade in
        requestAnimationFrame(() => {
            content.style.opacity = '1';
            content.style.transform = 'translateY(0)';
        });
    }, 180);
}

/* ─── Render dispatcher ─── */
function renderTab(tab) {
    const container = document.getElementById('tab-content');
    if (!container) return;

    switch (tab) {
        case 'skin':  container.innerHTML = renderSkinTab();  break;
        case 'hair':  container.innerHTML = renderHairTab();  break;
        case 'diet':  container.innerHTML = renderDietTab();  break;
        case 'water': container.innerHTML = renderWaterTab(); break;
        case 'sleep': container.innerHTML = renderSleepTab(); break;
        default:      container.innerHTML = renderSkinTab();
    }
}

/* ═══════════════════════════════════════
   SKIN CARE TAB
   ═══════════════════════════════════════ */
function renderSkinTab() {
    if (!skinAnalysis) {
        return noDataCard('skin', '✨', 'No skin analysis found.', 'Complete a Face Scan to get personalized skin care recommendations.', 'face-scan.html', 'Start Face Scan');
    }

    const results = skinAnalysis.results || {};
    const recs = results.recommendations || {};
    const products = recs.products || [];
    const skinType = results.skinType || results.skin_type || 'Unknown';
    const concerns = results.concerns || [];

    let html = `<div class="tab-pane">`;

    // Summary chips
    html += `<div class="summary-row">`;
    html += `<div class="summary-chip"><strong>Skin Type:</strong> ${escHtml(skinType)}</div>`;
    if (concerns.length) {
        html += `<div class="summary-chip"><strong>Concerns:</strong> ${concerns.map(escHtml).join(', ')}</div>`;
    }
    html += `</div>`;

    // Products
    if (products.length) {
        html += `<h3 class="section-title"><span class="icon">🧴</span> Recommended Products</h3>`;
        html += `<div class="card-grid">${products.map(renderProductCard).join('')}</div>`;
    } else {
        html += `<p style="color:var(--text-secondary);font-size:.9rem;">No product recommendations available yet.</p>`;
    }

    // Extra tips
    const tips = recs.tips || recs.skinCareTips || [];
    if (tips.length) {
        html += `<h3 class="section-title" style="margin-top:36px"><span class="icon">💡</span> Skin Care Tips</h3>`;
        html += `<div class="card-grid">${tips.map((t, i) => `
            <div class="glass-card" style="animation:fadeIn .35s ease both;animation-delay:${i * .06}s">
                <div class="card-desc">${escHtml(typeof t === 'string' ? t : t.text || t.tip || '')}</div>
            </div>`).join('')}</div>`;
    }

    html += `</div>`;
    return html;
}

/* ═══════════════════════════════════════
   HAIR CARE TAB
   ═══════════════════════════════════════ */
function renderHairTab() {
    if (!hairAnalysis) {
        return noDataCard('hair', '💇', 'No hair analysis found.', 'Complete a Hair Analysis to get personalized hair care recommendations.', 'hair-scan.html', 'Start Hair Analysis');
    }

    const results = hairAnalysis.results || {};
    const recs = results.recommendations || {};
    const products = recs.products || [];
    const hairType = results.hairType || results.hair_type || 'Unknown';
    const concerns = results.concerns || [];

    let html = `<div class="tab-pane">`;

    html += `<div class="summary-row">`;
    html += `<div class="summary-chip"><strong>Hair Type:</strong> ${escHtml(hairType)}</div>`;
    if (concerns.length) {
        html += `<div class="summary-chip"><strong>Concerns:</strong> ${concerns.map(escHtml).join(', ')}</div>`;
    }
    html += `</div>`;

    if (products.length) {
        html += `<h3 class="section-title"><span class="icon">🧴</span> Recommended Products</h3>`;
        html += `<div class="card-grid">${products.map(renderProductCard).join('')}</div>`;
    } else {
        html += `<p style="color:var(--text-secondary);font-size:.9rem;">No product recommendations available yet.</p>`;
    }

    const tips = recs.tips || recs.hairCareTips || [];
    if (tips.length) {
        html += `<h3 class="section-title" style="margin-top:36px"><span class="icon">💡</span> Hair Care Tips</h3>`;
        html += `<div class="card-grid">${tips.map((t, i) => `
            <div class="glass-card" style="animation:fadeIn .35s ease both;animation-delay:${i * .06}s">
                <div class="card-desc">${escHtml(typeof t === 'string' ? t : t.text || t.tip || '')}</div>
            </div>`).join('')}</div>`;
    }

    html += `</div>`;
    return html;
}

/* ═══════════════════════════════════════
   DIET PLAN TAB
   ═══════════════════════════════════════ */
function renderDietTab() {
    // Merge diet recommendations from both analyses
    const skinDiet = getDietItems(skinAnalysis);
    const hairDiet = getDietItems(hairAnalysis);
    const allDiet = [...skinDiet, ...hairDiet];

    if (!allDiet.length) {
        return noDataCard('diet', '🥗', 'No diet recommendations yet.', 'Complete a Face Scan or Hair Analysis to receive personalized diet suggestions.', 'face-scan.html', 'Start Analysis');
    }

    let html = `<div class="tab-pane">`;
    html += `<h3 class="section-title"><span class="icon">🥗</span> Your Personalized Diet Plan</h3>`;
    html += `<p style="color:var(--text-secondary);font-size:.88rem;margin-bottom:24px;">
        Foods tailored to improve your skin and hair health based on your analysis results.
    </p>`;

    html += `<div class="card-grid">`;
    allDiet.forEach((item, i) => {
        html += `
        <div class="glass-card diet-card" style="animation:fadeIn .35s ease both;animation-delay:${i * .06}s">
            <span class="emoji">${item.emoji || '🍽️'}</span>
            <div class="card-title">${escHtml(item.name)}</div>
            <div class="card-desc">${escHtml(item.benefit || '')}</div>
            <div class="meal-time">
                <span class="badge ${mealBadgeClass(item.meal)}">${escHtml(item.meal || 'Anytime')}</span>
            </div>
        </div>`;
    });
    html += `</div></div>`;
    return html;
}

function getDietItems(analysis) {
    if (!analysis) return [];
    const recs = analysis.results?.recommendations || {};
    const diet = recs.diet || recs.dietPlan || recs.foods || [];
    return diet.map(item => {
        if (typeof item === 'string') {
            return { name: item, emoji: foodEmoji(item), benefit: '', meal: 'Anytime' };
        }
        return {
            name: item.name || item.food || 'Food',
            emoji: item.emoji || foodEmoji(item.name || item.food || ''),
            benefit: item.benefit || item.description || item.reason || '',
            meal: item.meal || item.mealTime || item.time || 'Anytime'
        };
    });
}

function foodEmoji(name) {
    const n = (name || '').toLowerCase();
    const map = {
        'salmon': '🐟', 'fish': '🐟', 'tuna': '🐟',
        'avocado': '🥑', 'spinach': '🥬', 'kale': '🥬', 'broccoli': '🥦',
        'carrot': '🥕', 'sweet potato': '🍠', 'tomato': '🍅',
        'blueberry': '🫐', 'berry': '🫐', 'strawberry': '🍓',
        'orange': '🍊', 'lemon': '🍋', 'apple': '🍎', 'banana': '🍌',
        'almond': '🥜', 'nut': '🥜', 'walnut': '🥜', 'seed': '🌱',
        'egg': '🥚', 'chicken': '🍗', 'meat': '🥩',
        'yogurt': '🥛', 'milk': '🥛', 'cheese': '🧀',
        'rice': '🍚', 'oat': '🥣', 'bread': '🍞', 'grain': '🌾',
        'water': '💧', 'tea': '🍵', 'green tea': '🍵',
        'honey': '🍯', 'olive oil': '🫒', 'oil': '🫒',
        'dark chocolate': '🍫', 'chocolate': '🍫'
    };
    for (const [key, emoji] of Object.entries(map)) {
        if (n.includes(key)) return emoji;
    }
    return '🍽️';
}

function mealBadgeClass(meal) {
    const m = (meal || '').toLowerCase();
    if (m.includes('breakfast') || m.includes('morning')) return 'badge-gold';
    if (m.includes('lunch') || m.includes('afternoon')) return 'badge-green';
    if (m.includes('dinner') || m.includes('evening'))  return 'badge-purple';
    if (m.includes('snack'))                              return 'badge-cyan';
    return 'badge-cyan';
}

/* ═══════════════════════════════════════
   WATER INTAKE TAB
   ═══════════════════════════════════════ */
function renderWaterTab() {
    // Extract water data from skin analysis if available
    const waterData = skinAnalysis?.results?.recommendations?.water
        || skinAnalysis?.results?.recommendations?.waterIntake
        || null;

    const totalLiters = waterData?.liters || waterData?.daily || 3;
    const totalGlasses = Math.round(totalLiters * 4); // ~250ml per glass
    const filledGlasses = waterData?.current || 0;

    let html = `<div class="tab-pane">`;
    html += `<h3 class="section-title"><span class="icon">💧</span> Daily Water Intake</h3>`;

    // Big stat
    html += `
    <div class="glass-card" style="text-align:center;max-width:500px;margin-bottom:28px;">
        <div class="water-stat">${totalLiters}L / day</div>
        <div style="color:var(--text-secondary);font-size:.88rem;">
            Recommended daily intake · ${totalGlasses} glasses (250ml each)
        </div>
        <div class="water-progress-bar" style="margin-top:18px;">
            <div class="water-progress-fill" style="width:${Math.min(100, (filledGlasses / totalGlasses) * 100)}%"></div>
        </div>
        <div style="margin-top:8px;font-size:.8rem;color:var(--text-secondary);">
            ${filledGlasses} of ${totalGlasses} glasses consumed today
        </div>
    </div>`;

    // Glass icons
    html += `<div class="water-container">`;
    for (let i = 0; i < totalGlasses; i++) {
        const filled = i < filledGlasses;
        html += `
        <div class="water-glass ${filled ? 'filled' : ''}" title="Glass ${i + 1}">
            ${filled ? '💧' : ''}
        </div>`;
    }
    html += `</div>`;

    // Hydration tips
    const tips = waterData?.tips || [
        'Drink a glass of water first thing in the morning',
        'Carry a reusable water bottle throughout the day',
        'Set hourly reminders to stay hydrated',
        'Infuse water with lemon or cucumber for variety',
        'Drink water before each meal to aid digestion',
        'Reduce caffeine — it can dehydrate your skin'
    ];

    html += `<h3 class="section-title" style="margin-top:32px"><span class="icon">💡</span> Hydration Tips</h3>`;
    html += `<div class="card-grid">`;
    tips.forEach((tip, i) => {
        const text = typeof tip === 'string' ? tip : (tip.text || tip.tip || '');
        html += `
        <div class="glass-card" style="animation:fadeIn .35s ease both;animation-delay:${i * .06}s">
            <div class="card-desc">💧 ${escHtml(text)}</div>
        </div>`;
    });
    html += `</div></div>`;
    return html;
}

/* ═══════════════════════════════════════
   SLEEP TAB
   ═══════════════════════════════════════ */
function renderSleepTab() {
    const sleepData = skinAnalysis?.results?.recommendations?.sleep
        || hairAnalysis?.results?.recommendations?.sleep
        || null;

    const schedule = sleepData?.schedule || [
        { time: '9:00 PM', activity: 'Begin winding down', icon: '🌅', tip: 'Dim the lights and reduce screen brightness' },
        { time: '9:30 PM', activity: 'Skin care routine', icon: '🧴', tip: 'Apply night serum and moisturizer' },
        { time: '10:00 PM', activity: 'Relaxation', icon: '📖', tip: 'Read, meditate, or do light stretching' },
        { time: '10:30 PM', activity: 'Lights out', icon: '🌙', tip: 'Keep room cool (65-68°F) and dark' },
        { time: '6:30 AM', activity: 'Wake up', icon: '☀️', tip: 'Get sunlight within 30 minutes of waking' }
    ];

    const tips = sleepData?.tips || [
        { icon: '📱', title: 'No screens before bed', text: 'Avoid blue light at least 1 hour before sleeping for better melatonin production.' },
        { icon: '🌡️', title: 'Cool room temperature', text: 'Keep your bedroom between 65-68°F (18-20°C) for optimal sleep quality.' },
        { icon: '⏰', title: 'Consistent schedule', text: 'Go to bed and wake up at the same time every day, even on weekends.' },
        { icon: '🍵', title: 'Avoid late caffeine', text: 'No coffee or caffeinated drinks after 2 PM to prevent sleep disruption.' },
        { icon: '🧘', title: 'Wind-down ritual', text: 'Create a calming pre-sleep routine — meditation, reading, or gentle yoga.' },
        { icon: '🛏️', title: 'Sleep environment', text: 'Use blackout curtains, keep the room quiet, and invest in quality bedding.' }
    ];

    const hours = sleepData?.hours || '7-9';

    let html = `<div class="tab-pane">`;
    html += `<h3 class="section-title"><span class="icon">😴</span> Sleep Schedule</h3>`;

    html += `
    <div class="summary-row">
        <div class="summary-chip"><strong>Recommended:</strong> ${escHtml(String(hours))} hours per night</div>
    </div>`;

    // Timeline
    html += `<div class="sleep-timeline">`;
    schedule.forEach((item, i) => {
        const icon = item.icon || '⏰';
        const time = item.time || '';
        const activity = item.activity || '';
        const tip = item.tip || '';
        html += `
        <div class="timeline-item" style="animation-delay:${i * .08}s">
            <div class="time">${icon} ${escHtml(time)}</div>
            <div class="activity">${escHtml(activity)}</div>
            ${tip ? `<div class="tip">${escHtml(tip)}</div>` : ''}
        </div>`;
    });
    html += `</div>`;

    // Tips grid
    html += `<h3 class="section-title" style="margin-top:36px"><span class="icon">💡</span> Sleep Tips</h3>`;
    html += `<div class="sleep-tips-grid">`;
    tips.forEach((tip, i) => {
        const t = typeof tip === 'string' ? { icon: '💤', title: '', text: tip } : tip;
        html += `
        <div class="sleep-tip-card" style="animation:fadeIn .35s ease both;animation-delay:${i * .06}s">
            <span class="tip-icon">${t.icon || '💤'}</span>
            <div>
                ${t.title ? `<div class="tip-title">${escHtml(t.title)}</div>` : ''}
                <div class="tip-text">${escHtml(t.text || '')}</div>
            </div>
        </div>`;
    });
    html += `</div></div>`;
    return html;
}

/* ═══════════════════════════════════════
   SHARED RENDERERS
   ═══════════════════════════════════════ */

function renderProductCard(product) {
    const name = product.name || product.title || 'Product';
    const type = product.type || product.category || '';
    const price = product.price || '';
    const rating = product.rating || 0;
    const budget = product.budgetFriendly || product.budget_friendly || false;

    const stars = renderStars(rating);

    return `
    <div class="glass-card" style="animation:fadeIn .35s ease both;">
        ${type ? `<div class="card-label">${escHtml(type)}</div>` : ''}
        <div class="card-title">${escHtml(name)}</div>
        ${stars ? `<div class="star-rating">${stars}</div>` : ''}
        ${product.description ? `<div class="card-desc">${escHtml(product.description)}</div>` : ''}
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            ${price ? `<span class="price-tag">${escHtml(String(price))}</span>` : ''}
            ${budget ? `<span class="badge badge-green">💰 Budget Friendly</span>` : ''}
        </div>
    </div>`;
}

function renderStars(rating) {
    if (!rating || rating <= 0) return '';
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '⭐'.repeat(full) + (half ? '⭐' : '') + '☆'.repeat(Math.max(0, empty));
}

function noDataCard(type, icon, title, desc, link, linkText) {
    return `
    <div class="tab-pane" style="text-align:center;padding:60px 20px;">
        <div style="font-size:3rem;margin-bottom:14px;">${icon}</div>
        <h3 style="font-family:'Outfit',sans-serif;font-weight:700;font-size:1.15rem;margin:0 0 8px;color:var(--text-primary);">
            ${escHtml(title)}
        </h3>
        <p style="color:var(--text-secondary);font-size:.88rem;max-width:380px;margin:0 auto 22px;line-height:1.6;">
            ${escHtml(desc)}
        </p>
        <a href="${link}" class="empty-link primary" style="display:inline-block;text-decoration:none;">
            ${escHtml(linkText)}
        </a>
    </div>`;
}

/* ─── Utilities ─── */
function escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
