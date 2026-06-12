/**
 * Spark – Rating Page Controller
 * Handles star rating interaction, feedback submission,
 * existing-rating display, and confetti celebration.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Auth & Sidebar ---
    requireAuth();
    renderSidebar('rating');

    // --- DOM References ---
    const starRatingEl      = document.getElementById('star-rating');
    const ratingTextEl      = document.getElementById('rating-text');
    const feedbackTextEl    = document.getElementById('feedback-text');
    const submitBtn         = document.getElementById('submit-rating');
    const ratingFormCard    = document.getElementById('rating-form-card');
    const thankYouCard      = document.getElementById('thank-you-card');
    const existingRatingEl  = document.getElementById('existing-rating');
    const existingStarsEl   = document.getElementById('existing-stars');
    const existingFeedbackEl= document.getElementById('existing-feedback-display');
    const updateRatingBtn   = document.getElementById('update-rating-btn');
    const confettiContainer = document.getElementById('confetti-container');

    const stars = starRatingEl.querySelectorAll('.star');

    // --- State ---
    let selectedRating = 0;
    let isSubmitting   = false;

    // ===================================================
    // Star Rating – Hover, Leave, Click
    // ===================================================

    const ratingLabels = [
        '',
        'Terrible 😞',
        'Poor 😕',
        'Okay 😐',
        'Good 😊',
        'Amazing 🤩'
    ];

    function highlightStars(upTo) {
        stars.forEach(star => {
            const val = parseInt(star.dataset.value, 10);
            if (val <= upTo) {
                star.classList.add('hovered');
            } else {
                star.classList.remove('hovered');
            }
        });
    }

    function renderSelectedStars() {
        stars.forEach(star => {
            const val = parseInt(star.dataset.value, 10);
            if (val <= selectedRating) {
                star.classList.add('selected');
            } else {
                star.classList.remove('selected');
            }
            star.classList.remove('hovered');
        });
    }

    stars.forEach(star => {
        // Hover
        star.addEventListener('mouseenter', () => {
            const val = parseInt(star.dataset.value, 10);
            highlightStars(val);
        });

        // Click
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.value, 10);
            renderSelectedStars();

            // Pulse animation on selected star
            star.classList.remove('pulse');
            // Trigger reflow
            void star.offsetWidth;
            star.classList.add('pulse');

            // Update text
            ratingTextEl.textContent = `You rated ${selectedRating}/5 stars – ${ratingLabels[selectedRating]}`;
            ratingTextEl.classList.add('has-rating');

            // Enable submit
            submitBtn.disabled = false;
        });
    });

    // Mouse leave – revert to selected state
    starRatingEl.addEventListener('mouseleave', () => {
        renderSelectedStars();
    });

    // ===================================================
    // Confetti Effect
    // ===================================================

    function triggerConfetti() {
        const colors = ['#7c3aed', '#06b6d4', '#f59e0b', '#10b981', '#ec4899', '#fff'];
        const count  = 60;

        for (let i = 0; i < count; i++) {
            const piece = document.createElement('span');
            piece.classList.add('confetti-piece');

            // Random shape
            if (Math.random() > 0.5) piece.classList.add('circle');

            // Random colour
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

            // Random position & animation vars
            const size = Math.random() * 8 + 6;
            piece.style.width  = size + 'px';
            piece.style.height = size + 'px';
            piece.style.left   = Math.random() * 100 + '%';
            piece.style.setProperty('--delay', (Math.random() * 0.6).toFixed(2) + 's');
            piece.style.setProperty('--fall-duration', (Math.random() * 1.5 + 2).toFixed(2) + 's');
            piece.style.setProperty('--drift', (Math.random() * 200 - 100).toFixed(0) + 'px');
            piece.style.setProperty('--spin', (Math.random() * 1080 - 540).toFixed(0) + 'deg');

            confettiContainer.appendChild(piece);
        }

        // Cleanup after animation finishes
        setTimeout(() => {
            confettiContainer.innerHTML = '';
        }, 3500);
    }

    // ===================================================
    // Submit Rating
    // ===================================================

    submitBtn.addEventListener('click', async () => {
        if (isSubmitting || selectedRating === 0) return;

        try {
            isSubmitting = true;
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;

            const payload = {
                score:    selectedRating,
                feedback: feedbackTextEl.value.trim()
            };

            await apiRequest('/api/user/rating', {
                method: 'POST',
                body:   JSON.stringify(payload)
            });

            // Success – hide form, show thank-you
            ratingFormCard.style.display = 'none';
            existingRatingEl.classList.remove('visible');
            existingRatingEl.style.display = 'none';
            thankYouCard.classList.add('visible');

            // Confetti 🎉
            triggerConfetti();

            if (typeof showToast === 'function') {
                showToast('Rating submitted successfully!', 'success');
            }
        } catch (err) {
            console.error('Rating submit error:', err);
            if (typeof showToast === 'function') {
                showToast(err.message || 'Failed to submit rating. Please try again.', 'error');
            }
        } finally {
            isSubmitting = false;
            submitBtn.classList.remove('loading');
            // Keep disabled after successful submit; re-enable on error
            if (ratingFormCard.style.display !== 'none') {
                submitBtn.disabled = selectedRating === 0;
            }
        }
    });

    // ===================================================
    // Render Existing Rating Stars (display only)
    // ===================================================

    function renderExistingStars(score) {
        existingStarsEl.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            const span = document.createElement('span');
            span.textContent = i <= score ? '★' : '☆';
            span.id = `existing-star-${i}`;
            if (i > score) span.style.color = 'rgba(255,255,255,0.18)';
            existingStarsEl.appendChild(span);
        }
    }

    // ===================================================
    // Update Rating – show form pre-filled
    // ===================================================

    updateRatingBtn.addEventListener('click', () => {
        existingRatingEl.classList.remove('visible');
        existingRatingEl.style.display = 'none';
        ratingFormCard.style.display = 'flex';
    });

    // ===================================================
    // Check for Existing Rating on Load
    // ===================================================

    async function checkExistingRating() {
        try {
            const data = await apiRequest('/api/user/rating');

            if (data && data.rating && data.rating.score) {
                const { score, feedback } = data.rating;

                // Pre-fill state for potential update
                selectedRating = score;
                renderSelectedStars();
                ratingTextEl.textContent = `You rated ${score}/5 stars – ${ratingLabels[score]}`;
                ratingTextEl.classList.add('has-rating');
                submitBtn.disabled = false;

                if (feedback) {
                    feedbackTextEl.value = feedback;
                }

                // Show existing rating section, hide form initially
                renderExistingStars(score);
                if (feedback) {
                    existingFeedbackEl.textContent = `"${feedback}"`;
                    existingFeedbackEl.style.display = 'block';
                } else {
                    existingFeedbackEl.style.display = 'none';
                }

                ratingFormCard.style.display = 'none';
                existingRatingEl.classList.add('visible');
            }
            // If no rating exists, keep the default form visible
        } catch (err) {
            // No existing rating or endpoint not ready – show form
            console.info('No existing rating found or API unavailable:', err.message);
        }
    }

    checkExistingRating();
});
