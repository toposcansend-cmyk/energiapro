/* ============================================
   EnergiaPro — Main App Controller
   ============================================ */

const App = {
  currentPage: 'profile',

  pages: {
    profile: { module: ProfilePage, title: 'Perfil do Estabelecimento', step: 1 },
    bill: { module: BillPage, title: 'Análise de Conta', step: 2 },
    equipment: { module: EquipmentPage, title: 'Mapeamento de Cargas', step: 3 },
    insights: { module: InsightsPage, title: 'Diagnóstico & Insights', step: 4 },
    dashboard: { module: DashboardPage, title: 'Painel de Gestão', step: 5 },
  },

  init() {
    // Check auth
    const user = Storage.getUser();
    if (!user) { window.location.href = 'index.html'; return; }

    // Populate user info
    const nameEl = document.getElementById('user-name');
    const emailEl = document.getElementById('user-email');
    const avatarEl = document.getElementById('user-avatar');
    if (nameEl) nameEl.textContent = user.name || 'Usuário';
    if (emailEl) emailEl.textContent = user.email || '';
    if (avatarEl) avatarEl.textContent = (user.name || 'U').charAt(0).toUpperCase();

    // Sidebar navigation
    document.querySelectorAll('.app-sidebar [data-page]').forEach(btn => {
      btn.addEventListener('click', () => this.navigateTo(btn.dataset.page));
    });

    // Mobile bottom navigation
    document.querySelectorAll('.mobile-bottom-nav [data-page]').forEach(btn => {
      btn.addEventListener('click', () => this.navigateTo(btn.dataset.page));
    });

    // Stepper navigation
    document.querySelectorAll('[data-step]').forEach(step => {
      step.addEventListener('click', () => {
        const pageKeys = Object.keys(this.pages);
        const stepNum = parseInt(step.dataset.step);
        if (stepNum >= 1 && stepNum <= pageKeys.length) {
          this.navigateTo(pageKeys[stepNum - 1]);
        }
      });
    });

    // Mobile menu
    const mobileToggle = document.getElementById('mobile-menu-toggle');
    const sidebar = document.getElementById('app-sidebar');
    if (mobileToggle && sidebar) {
      mobileToggle.addEventListener('click', () => sidebar.classList.toggle('app-sidebar--open'));
      // Close on outside click
      document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('app-sidebar--open') && !sidebar.contains(e.target) && e.target !== mobileToggle) {
          sidebar.classList.remove('app-sidebar--open');
        }
      });
    }

    // Logout
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('Deseja sair? Seus dados serão mantidos.')) {
          Storage.removeUser();
          window.location.href = 'index.html';
        }
      });
    }

    // Initial page
    this.navigateTo('profile');
  },

  navigateTo(page) {
    const config = this.pages[page];
    if (!config) return;
    this.currentPage = page;

    // Update sidebar
    document.querySelectorAll('.app-sidebar [data-page]').forEach(btn => {
      btn.classList.toggle('app-sidebar__link--active', btn.dataset.page === page);
    });

    // Update mobile bottom nav
    document.querySelectorAll('.mobile-bottom-nav [data-page]').forEach(btn => {
      btn.classList.toggle('mobile-bottom-nav__item--active', btn.dataset.page === page);
    });

    // Update title
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = config.title;

    // Update stepper
    this.updateStepper(config.step);

    // Render page
    const content = document.getElementById('page-content');
    if (content) {
      content.innerHTML = config.module.render();
      config.module.init();
    }

    // Close mobile sidebar
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) sidebar.classList.remove('app-sidebar--open');

    // Scroll to top
    window.scrollTo(0, 0);
  },

  updateStepper(activeStep) {
    const completedSteps = Storage.getCompletedSteps();
    document.querySelectorAll('[data-step]').forEach(stepEl => {
      const num = parseInt(stepEl.dataset.step);
      stepEl.classList.remove('stepper__step--active', 'stepper__step--completed');
      if (num === activeStep) {
        stepEl.classList.add('stepper__step--active');
      } else if (completedSteps.includes(num)) {
        stepEl.classList.add('stepper__step--completed');
        stepEl.querySelector('.stepper__number').textContent = '✓';
      }
    });

    // Connectors
    const connectors = document.querySelectorAll('.stepper__connector');
    connectors.forEach((conn, i) => {
      conn.style.background = completedSteps.includes(i + 1) ? 'var(--color-primary)' : 'var(--color-border)';
    });
  }
};

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
