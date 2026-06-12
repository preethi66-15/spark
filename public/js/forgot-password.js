// ── Spark Forgot Password handler (forgot-password.js) ──

document.addEventListener('DOMContentLoaded', () => {
  // Redirect to dashboard if logged in
  redirectIfLoggedIn();

  const forgotForm     = document.getElementById('forgot-form');
  const resetForm      = document.getElementById('reset-form');
  const emailInput     = document.getElementById('email');
  
  const forgotSubmit   = document.getElementById('forgot-submit-btn');
  const resetSubmit    = document.getElementById('reset-submit-btn');
  const codeDisplay    = document.getElementById('reset-code-display');

  const pageTitle      = document.getElementById('page-title');
  const pageSubtitle   = document.getElementById('page-subtitle');

  const codeInput      = document.getElementById('reset-code');
  const newPwdInput    = document.getElementById('new-password');
  const confirmPwdInput = document.getElementById('confirm-new-password');
  
  const pwdToggle      = document.getElementById('password-toggle');
  const cpwdToggle     = document.getElementById('confirm-password-toggle');
  const matchError     = document.getElementById('password-match-error');

  let savedEmail = '';

  // Toggle password visibility
  if (pwdToggle && newPwdInput) {
    pwdToggle.addEventListener('click', () => {
      const isPassword = newPwdInput.getAttribute('type') === 'password';
      newPwdInput.setAttribute('type', isPassword ? 'text' : 'password');
      pwdToggle.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  if (cpwdToggle && confirmPwdInput) {
    cpwdToggle.addEventListener('click', () => {
      const isPassword = confirmPwdInput.getAttribute('type') === 'password';
      confirmPwdInput.setAttribute('type', isPassword ? 'text' : 'password');
      cpwdToggle.textContent = isPassword ? '🙈' : '👁️';
    });
  }

  // Real-time password matching
  function checkPasswordMatch() {
    if (confirmPwdInput.value && newPwdInput.value !== confirmPwdInput.value) {
      matchError.classList.remove('hidden');
      return false;
    } else {
      matchError.classList.add('hidden');
      return true;
    }
  }

  if (newPwdInput) newPwdInput.addEventListener('input', checkPasswordMatch);
  if (confirmPwdInput) confirmPwdInput.addEventListener('input', checkPasswordMatch);

  // Step 1: Request Code
  if (forgotForm) {
    forgotForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();
      if (!email) return;

      const originalText = forgotSubmit.innerHTML;
      forgotSubmit.disabled = true;
      forgotSubmit.innerHTML = `<span class="loader"></span> Sending...`;

      try {
        const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Error requesting code');
        }

        savedEmail = email;
        
        // Show reset code display in UI
        codeDisplay.textContent = `CODE: ${data.resetCode}`;

        // Switch to Step 2 Form
        forgotForm.classList.add('hidden');
        resetForm.classList.remove('hidden');
        
        pageTitle.textContent = 'Set New Password';
        pageSubtitle.textContent = 'Enter the reset code and choose a new password';
        
        showToast('Reset code generated successfully', 'success');

      } catch (err) {
        showToast(err.message, 'error');
        forgotSubmit.disabled = false;
        forgotSubmit.innerHTML = originalText;
      }
    });
  }

  // Step 2: Reset Password
  if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const resetCode = codeInput.value.trim();
      const newPassword = newPwdInput.value;
      const confirmPassword = confirmPwdInput.value;

      if (!resetCode || !newPassword || !confirmPassword) {
        showToast('All fields are required', 'error');
        return;
      }

      if (newPassword !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
      }

      const originalText = resetSubmit.innerHTML;
      resetSubmit.disabled = true;
      resetSubmit.innerHTML = `<span class="loader"></span> Saving...`;

      try {
        const response = await fetch(`${API_URL}/api/auth/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: savedEmail,
            resetCode,
            newPassword
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to reset password');
        }

        showToast('Password reset successful! Redirecting to login...', 'success');

        setTimeout(() => {
          window.location.href = 'login.html';
        }, 2000);

      } catch (err) {
        showToast(err.message, 'error');
        resetSubmit.disabled = false;
        resetSubmit.innerHTML = originalText;
      }
    });
  }
});
