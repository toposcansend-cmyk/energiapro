/* ============================================
   EnergiaPro — Utility Helpers
   ============================================ */

const Utils = {
  // Format currency BRL
  formatCurrency(value) {
    if (value == null || isNaN(value)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  },

  // Format number with locale
  formatNumber(value, decimals = 0) {
    if (value == null || isNaN(value)) return '0';
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(value);
  },

  // Format kWh
  formatKwh(value) {
    return this.formatNumber(value, 1) + ' kWh';
  },

  // Format percentage
  formatPercent(value) {
    return this.formatNumber(value, 1) + '%';
  },

  // Format date
  formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR');
  },

  formatMonth(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  },

  // File to base64
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  // Debounce
  debounce(fn, delay = 300) {
    let timer;
    return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
  },

  // Generate simple ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  },

  // Escape HTML
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  // Show toast
  showToast(type, title, message, duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const icons = { success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
      <span class="toast__icon">${icons[type] || 'ℹ️'}</span>
      <div class="toast__content">
        <div class="toast__title">${this.escapeHtml(title)}</div>
        ${message ? `<div class="toast__message">${this.escapeHtml(message)}</div>` : ''}
      </div>
      <button class="toast__close" onclick="this.closest('.toast').remove()">✕</button>
    `;
    container.appendChild(toast);
    if (duration > 0) setTimeout(() => { if (toast.parentNode) toast.remove(); }, duration);
  },

  // Show loading
  showLoading(text = 'Analisando com IA...', subtext = '') {
    const overlay = document.getElementById('loading-overlay');
    if (!overlay) return;
    overlay.classList.remove('hidden');
    const textEl = document.getElementById('loading-text');
    const subEl = document.getElementById('loading-subtext');
    if (textEl) textEl.textContent = text;
    if (subEl) subEl.textContent = subtext;
  },

  hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.add('hidden');
  },

  // Show modal
  showModal(title, bodyHtml) {
    const backdrop = document.getElementById('modal-backdrop');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    if (!backdrop) return;
    modalTitle.textContent = title;
    modalBody.innerHTML = bodyHtml;
    backdrop.classList.add('modal-backdrop--active');
  },

  hideModal() {
    const backdrop = document.getElementById('modal-backdrop');
    if (backdrop) backdrop.classList.remove('modal-backdrop--active');
  },

  // Validate email
  isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  },

  // Calculate equipment monthly consumption
  calcMonthlyKwh(watts, hoursPerDay, daysPerMonth = 30) {
    return (watts * hoursPerDay * daysPerMonth) / 1000;
  },

  // IEE - Índice de Eficiência Energética
  calcIEE(kwhMonth, areaM2) {
    if (!areaM2 || areaM2 === 0) return 0;
    return kwhMonth / areaM2;
  },

  // Energy efficiency score based on segment benchmarks
  calcEnergyScore(iee, segment) {
    const benchmarks = {
      'restaurante': { good: 30, avg: 50, bad: 80 },
      'padaria': { good: 35, avg: 55, bad: 85 },
      'loja': { good: 15, avg: 30, bad: 50 },
      'escritorio': { good: 12, avg: 25, bad: 45 },
      'supermercado': { good: 40, avg: 65, bad: 100 },
      'farmacia': { good: 20, avg: 35, bad: 55 },
      'academia': { good: 25, avg: 45, bad: 70 },
      'hotel': { good: 35, avg: 55, bad: 90 },
      'oficina': { good: 20, avg: 40, bad: 65 },
      'outro': { good: 20, avg: 40, bad: 65 },
    };
    const bench = benchmarks[segment] || benchmarks['outro'];
    if (iee <= bench.good) return Math.min(100, 80 + (bench.good - iee) / bench.good * 20);
    if (iee <= bench.avg) return 50 + (bench.avg - iee) / (bench.avg - bench.good) * 30;
    if (iee <= bench.bad) return 20 + (bench.bad - iee) / (bench.bad - bench.avg) * 30;
    return Math.max(0, 20 - (iee - bench.bad) / bench.bad * 20);
  },

  // Parse AI JSON response (handles markdown code blocks)
  parseAIJson(text) {
    if (!text) return null;
    // Remove <think> blocks
    text = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    // Try direct parse
    try { return JSON.parse(text); } catch {}
    // Try extracting from markdown code block
    const match = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) { try { return JSON.parse(match[1].trim()); } catch {} }
    // Try finding JSON object
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) { try { return JSON.parse(objMatch[0]); } catch {} }
    return null;
  }
};

// Modal close handlers
document.addEventListener('DOMContentLoaded', () => {
  const modalClose = document.getElementById('modal-close');
  const modalBackdrop = document.getElementById('modal-backdrop');
  if (modalClose) modalClose.addEventListener('click', () => Utils.hideModal());
  if (modalBackdrop) modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) Utils.hideModal();
  });
});
