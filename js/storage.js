/* ============================================
   EnergiaPro — Storage Module
   ============================================ */

const Storage = {
  PREFIX: 'energiapro_',

  get(key) {
    try {
      const raw = localStorage.getItem(this.PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  set(key, value) {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
      return true;
    } catch { return false; }
  },

  remove(key) {
    localStorage.removeItem(this.PREFIX + key);
  },

  clear() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(this.PREFIX))
      .forEach(k => localStorage.removeItem(k));
  },

  // --- User ---
  getUser() { return this.get('user'); },
  setUser(user) { this.set('user', user); },
  removeUser() { this.remove('user'); },

  // --- Profile ---
  getProfile() { return this.get('profile'); },
  setProfile(p) { this.set('profile', p); },

  // --- Bills ---
  getBills() { return this.get('bills') || []; },
  addBill(bill) {
    const bills = this.getBills();
    bill.id = Date.now().toString();
    bill.createdAt = new Date().toISOString();
    bills.push(bill);
    this.set('bills', bills);
    return bill;
  },
  updateBill(id, data) {
    const bills = this.getBills().map(b => b.id === id ? { ...b, ...data } : b);
    this.set('bills', bills);
  },
  deleteBill(id) {
    this.set('bills', this.getBills().filter(b => b.id !== id));
  },
  getLatestBill() {
    const bills = this.getBills();
    return bills.length ? bills[bills.length - 1] : null;
  },

  // --- Equipment ---
  getEquipments() { return this.get('equipments') || []; },
  addEquipment(eq) {
    const eqs = this.getEquipments();
    eq.id = Date.now().toString();
    eqs.push(eq);
    this.set('equipments', eqs);
    return eq;
  },
  updateEquipment(id, data) {
    const eqs = this.getEquipments().map(e => e.id === id ? { ...e, ...data } : e);
    this.set('equipments', eqs);
  },
  deleteEquipment(id) {
    this.set('equipments', this.getEquipments().filter(e => e.id !== id));
  },

  // --- Insights ---
  getInsights() { return this.get('insights'); },
  setInsights(i) { this.set('insights', i); },

  // --- Completed Steps ---
  getCompletedSteps() { return this.get('completedSteps') || []; },
  completeStep(step) {
    const steps = this.getCompletedSteps();
    if (!steps.includes(step)) { steps.push(step); this.set('completedSteps', steps); }
  }
};
