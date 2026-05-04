/* ============================================
   EnergiaPro — Auth Module (Landing Page)
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Check if user already logged in
  const user = Storage.getUser();
  if (user) {
    window.location.href = 'app.html';
    return;
  }

  // DOM refs
  const signupForm = document.getElementById('signup-form');
  const loginForm = document.getElementById('login-form');
  const switchToLogin = document.getElementById('switch-to-login');
  const switchToSignup = document.getElementById('switch-to-signup');
  const formSignup = document.getElementById('form-signup');
  const formLogin = document.getElementById('form-login');
  const btnStartHero = document.getElementById('btn-start-hero');
  const btnSignupNav = document.getElementById('btn-signup-nav');
  const btnLoginNav = document.getElementById('btn-login-nav');

  // Toggle forms
  function showLogin() {
    signupForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    document.getElementById('auth-section').scrollIntoView({ behavior: 'smooth' });
  }

  function showSignup() {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    document.getElementById('auth-section').scrollIntoView({ behavior: 'smooth' });
  }

  if (switchToLogin) switchToLogin.addEventListener('click', (e) => { e.preventDefault(); showLogin(); });
  if (switchToSignup) switchToSignup.addEventListener('click', (e) => { e.preventDefault(); showSignup(); });
  if (btnStartHero) btnStartHero.addEventListener('click', () => showSignup());
  if (btnSignupNav) btnSignupNav.addEventListener('click', () => showSignup());
  if (btnLoginNav) btnLoginNav.addEventListener('click', () => showLogin());

  // Signup
  if (formSignup) {
    formSignup.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value;

      if (!name || !email || !password) {
        Utils.showToast('error', 'Campos obrigatórios', 'Preencha todos os campos.');
        return;
      }
      if (!Utils.isValidEmail(email)) {
        Utils.showToast('error', 'E-mail inválido', 'Informe um e-mail válido.');
        return;
      }
      if (password.length < 6) {
        Utils.showToast('error', 'Senha fraca', 'A senha deve ter no mínimo 6 caracteres.');
        return;
      }

      // Save user (MVP - localStorage)
      const user = { name, email, password: btoa(password), createdAt: new Date().toISOString() };
      Storage.setUser(user);
      Utils.showToast('success', 'Conta criada!', 'Redirecionando para o diagnóstico...');
      setTimeout(() => { window.location.href = 'app.html'; }, 1000);
    });
  }

  // Login
  if (formLogin) {
    formLogin.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      if (!email || !password) {
        Utils.showToast('error', 'Campos obrigatórios', 'Preencha todos os campos.');
        return;
      }

      // Check stored user (MVP - simple check)
      const storedUser = Storage.getUser();
      if (storedUser && storedUser.email === email && atob(storedUser.password) === password) {
        Utils.showToast('success', 'Login realizado!', 'Bem-vindo de volta!');
        setTimeout(() => { window.location.href = 'app.html'; }, 1000);
      } else if (storedUser && storedUser.email === email) {
        Utils.showToast('error', 'Senha incorreta', 'Verifique sua senha e tente novamente.');
      } else {
        // For MVP, just create account
        const user = { name: email.split('@')[0], email, password: btoa(password), createdAt: new Date().toISOString() };
        Storage.setUser(user);
        Utils.showToast('success', 'Conta criada!', 'Redirecionando...');
        setTimeout(() => { window.location.href = 'app.html'; }, 1000);
      }
    });
  }
});
