// ── Spark Registration handler (register.js) ──

document.addEventListener('DOMContentLoaded', () => {
  // Redirect to dashboard if user is already logged in
  redirectIfLoggedIn();

  const registerForm          = document.getElementById('register-form');
  const nameInput             = document.getElementById('name');
  const ageInput              = document.getElementById('age');
  const emailInput            = document.getElementById('email');
  const passwordInput         = document.getElementById('password');
  const confirmPasswordInput  = document.getElementById('confirm-password');
  
  const passwordToggle        = document.getElementById('password-toggle');
  const confirmPasswordToggle = document.getElementById('confirm-password-toggle');
  const matchError            = document.getElementById('password-match-error');
  const submitBtn             = document.getElementById('register-submit-btn');

  // Toggle Password visibility
  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      passwordToggle.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  // Toggle Confirm Password visibility
  if (confirmPasswordToggle && confirmPasswordInput) {
    confirmPasswordToggle.addEventListener('click', () => {
      const isPassword = confirmPasswordInput.getAttribute('type') === 'password';
      confirmPasswordInput.setAttribute('type', isPassword ? 'text' : 'password');
      confirmPasswordToggle.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  // Real-time password matching check
  function checkPasswordMatch() {
    const pwd = passwordInput.value;
    const cpwd = confirmPasswordInput.value;

    if (cpwd && pwd !== cpwd) {
      matchError.classList.remove('hidden');
      return false;
    } else {
      matchError.classList.add('hidden');
      return true;
    }
  }

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', checkPasswordMatch);
  }
  if (passwordInput) {
    passwordInput.addEventListener('input', checkPasswordMatch);
  }

  // Handle Form Submission
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = nameInput.value.trim();
      const age = parseInt(ageInput.value, 10);
      const email = emailInput.value.trim();
      const password = passwordInput.value;
      const confirmPassword = confirmPasswordInput.value;

      // Validate matching passwords
      if (password !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        matchError.classList.remove('hidden');
        return;
      }

      // Validate age parameters
      if (isNaN(age) || age < 13 || age > 120) {
        showToast('Age must be between 13 and 120', 'error');
        return;
      }

      // Set Loading State
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span class="loader"></span> Registering...`;

      try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, age, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Registration failed');
        }

        // Save token and user details
        setToken(data.token);
        setUser(data.user);

        showToast('Account created successfully! ✨', 'success');

        // Forward to dashboard
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
