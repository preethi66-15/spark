// ── Spark Login handler (login.js) ──

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is already logged in
  redirectIfLoggedIn();

  const loginForm      = document.getElementById('login-form');
  const emailInput     = document.getElementById('email');
  const passwordInput  = document.getElementById('password');
  const passwordToggle = document.getElementById('password-toggle');
  const submitBtn      = document.getElementById('login-submit-btn');

  // Password Visibility Toggle logic
  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      passwordToggle.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  // Handle Login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email || !password) {
        showToast('Please enter both email and password', 'error');
        return;
      }

      // Set Loading state
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="loader"></span> Logging in...`;

      try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Invalid credentials');
        }

        // Save Auth token and user info
        setToken(data.token);
        setUser(data.user);

        showToast(`Welcome back, ${data.user.name}! ✨`, 'success');

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1200);

      } catch (err) {
        showToast(err.message, 'error');
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
});
