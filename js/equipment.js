/* ============================================
   EnergiaPro — Equipment Mapping Module
   ============================================ */

const EquipmentPage = {
  render() {
    const equipments = Storage.getEquipments();
    const bill = Storage.getLatestBill();
    const totalKwh = equipments.reduce((sum, e) => sum + (e.consumoMensal || 0), 0);
    const billKwh = bill?.consumo_total_kwh || 0;
    const divergence = billKwh > 0 ? Math.abs(totalKwh - billKwh) / billKwh * 100 : 0;

    return `
      <div class="page-section">
        <div class="page-section__header">
          <h3 class="page-section__title">📸 Mapeamento de Equipamentos e Cargas</h3>
          <p class="page-section__subtitle">Cadastre seus equipamentos por foto ou manualmente para mapear o consumo</p>
        </div>

        <!-- Summary -->
        ${equipments.length > 0 ? `
        <div class="dashboard-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:var(--space-6);">
          <div class="card kpi">
            <div class="kpi__value">${equipments.length}</div>
            <div class="kpi__label">Equipamentos</div>
          </div>
          <div class="card kpi">
            <div class="kpi__value">${Utils.formatNumber(totalKwh, 0)}</div>
            <div class="kpi__label">kWh/mês estimado</div>
          </div>
          <div class="card kpi">
            <div class="kpi__value" style="${divergence > 20 ? 'background:var(--gradient-danger);-webkit-background-clip:text;' : ''}">${Utils.formatPercent(divergence)}</div>
            <div class="kpi__label">Divergência vs. Conta</div>
            ${divergence > 20 ? '<span class="badge badge--danger" style="margin-top:var(--space-2);">⚠️ Divergência alta</span>' : divergence > 0 ? '<span class="badge badge--success" style="margin-top:var(--space-2);">✅ Consistente</span>' : ''}
          </div>
        </div>` : ''}

        <!-- Add Equipment -->
        <div class="card" style="max-width:700px;margin-bottom:var(--space-6);">
          <h4 style="margin-bottom:var(--space-4);">Adicionar Equipamento</h4>
          <div class="upload-zone" id="eq-upload-zone" style="padding:var(--space-6);">
            <input type="file" class="upload-zone__input" id="eq-file-input" accept="image/*">
            <div id="eq-upload-content">
              <div class="upload-zone__icon">📷</div>
              <div class="upload-zone__title">Envie foto do equipamento</div>
              <div class="upload-zone__subtitle">A IA identificará o tipo, potência e classe de eficiência</div>
            </div>
            <div id="eq-preview" class="hidden"></div>
          </div>
          <div class="flex gap-3" style="margin-top:var(--space-4);">
            <button class="btn btn--primary" id="btn-analyze-eq" disabled>🤖 Identificar com IA</button>
            <button class="btn btn--secondary" id="btn-manual-eq">✏️ Cadastrar Manual</button>
          </div>
        </div>

        <!-- Equipment List -->
        ${equipments.length > 0 ? `
        <div class="card">
          <h4 style="margin-bottom:var(--space-4);">Equipamentos Cadastrados</h4>
          <div class="flex flex-col gap-3" id="equipment-list">
            ${equipments.map(eq => this.renderEquipmentItem(eq, totalKwh)).join('')}
          </div>
        </div>` : `
        <div class="card">
          <div class="empty-state">
            <div class="empty-state__icon">📸</div>
            <h4 class="empty-state__title">Nenhum equipamento cadastrado</h4>
            <p class="empty-state__description">Adicione seus equipamentos por foto ou manualmente para calcular a distribuição de consumo.</p>
          </div>
        </div>`}

        <div class="flex gap-4" style="margin-top:var(--space-6);">
          <button class="btn btn--ghost" onclick="App.navigateTo('bill')">← Voltar</button>
          <button class="btn btn--primary" onclick="App.navigateTo('insights')">Gerar Diagnóstico →</button>
        </div>
      </div>
    `;
  },

  renderEquipmentItem(eq, totalKwh) {
    const percent = totalKwh > 0 ? (eq.consumoMensal / totalKwh * 100) : 0;
    return `
      <div class="equipment-item" id="eq-${eq.id}">
        <div class="equipment-item__image" style="display:flex;align-items:center;justify-content:center;font-size:1.5rem;">
          ${this.getEquipmentIcon(eq.tipo)}
        </div>
        <div class="equipment-item__info">
          <div class="equipment-item__name">${Utils.escapeHtml(eq.tipo || 'Equipamento')}</div>
          <div class="equipment-item__details">
            ${eq.marca ? eq.marca + ' ' : ''}${eq.modelo ? eq.modelo + ' · ' : ''}${eq.potencia}W · ${eq.horasUso}h/dia
            ${eq.classeEficiencia ? ` · Selo ${eq.classeEficiencia}` : ''}
          </div>
        </div>
        <div class="equipment-item__consumption">
          <div class="equipment-item__kwh">${Utils.formatNumber(eq.consumoMensal, 1)}</div>
          <div class="equipment-item__percent">kWh/mês (${Utils.formatPercent(percent)})</div>
        </div>
        <div class="equipment-item__actions">
          <button class="btn btn--ghost btn--sm" onclick="EquipmentPage.editEquipment('${eq.id}')">✏️</button>
          <button class="btn btn--ghost btn--sm" onclick="EquipmentPage.deleteEquipment('${eq.id}')" style="color:var(--color-danger);">🗑️</button>
        </div>
      </div>
    `;
  },

  getEquipmentIcon(tipo) {
    const icons = {
      'ar-condicionado': '❄️', 'ar condicionado': '❄️', 'split': '❄️',
      'geladeira': '🧊', 'refrigerador': '🧊', 'freezer': '🧊',
      'forno': '🔥', 'fogão': '🔥', 'microondas': '🔥',
      'iluminação': '💡', 'lâmpada': '💡', 'luminária': '💡',
      'computador': '💻', 'servidor': '💻', 'desktop': '💻',
      'bomba': '🔧', 'motor': '🔧', 'compressor': '🔧',
    };
    if (!tipo) return '⚡';
    const lower = tipo.toLowerCase();
    for (const [key, icon] of Object.entries(icons)) {
      if (lower.includes(key)) return icon;
    }
    return '⚡';
  },

  currentImage: null,

  init() {
    const fileInput = document.getElementById('eq-file-input');
    const analyzeBtn = document.getElementById('btn-analyze-eq');
    const manualBtn = document.getElementById('btn-manual-eq');

    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        this.currentImage = await Utils.fileToBase64(file);
        document.getElementById('eq-upload-content').classList.add('hidden');
        const preview = document.getElementById('eq-preview');
        preview.classList.remove('hidden');
        preview.innerHTML = `<div class="upload-zone__preview"><img src="${this.currentImage}" alt="Equipamento"><button class="upload-zone__remove" onclick="EquipmentPage.clearUpload()">✕</button></div>`;
        analyzeBtn.disabled = false;
      });
    }

    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', async () => {
        if (!this.currentImage) return;
        Utils.showLoading('🤖 Identificando equipamento...', 'A IA está analisando a imagem para identificar tipo, potência e eficiência.');
        const result = await API.identifyEquipment(this.currentImage);
        Utils.hideLoading();
        if (result.success) {
          const eqData = Utils.parseAIJson(result.content);
          if (eqData) {
            this.showManualForm({
              tipo: eqData.tipo || '',
              marca: eqData.marca || '',
              modelo: eqData.modelo || '',
              potencia: eqData.potencia_watts || 0,
              horasUso: eqData.horas_uso_diario_estimado || 8,
              classeEficiencia: eqData.classe_eficiencia || '',
              quantidade: 1,
            });
            Utils.showToast('success', 'Equipamento identificado!', 'Confira e ajuste os dados se necessário.');
          } else {
            Utils.showToast('warning', 'Identificação parcial', 'Preencha os dados manualmente.');
            this.showManualForm();
          }
        } else {
          Utils.showToast('error', 'Erro na identificação', result.error);
          this.showManualForm();
        }
        this.clearUpload();
      });
    }

    if (manualBtn) manualBtn.addEventListener('click', () => this.showManualForm());
  },

  clearUpload() {
    this.currentImage = null;
    const content = document.getElementById('eq-upload-content');
    const preview = document.getElementById('eq-preview');
    const btn = document.getElementById('btn-analyze-eq');
    const input = document.getElementById('eq-file-input');
    if (content) content.classList.remove('hidden');
    if (preview) { preview.classList.add('hidden'); preview.innerHTML = ''; }
    if (btn) btn.disabled = true;
    if (input) input.value = '';
  },

  showManualForm(data = {}) {
    const html = `
      <form id="eq-manual-form">
        <div class="form-group"><label class="form-label">Tipo de Equipamento *</label>
          <input class="form-input" id="eq-tipo" value="${data.tipo || ''}" placeholder="Ex: Ar-condicionado, Geladeira, etc." required></div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);">
          <div class="form-group"><label class="form-label">Marca</label>
            <input class="form-input" id="eq-marca" value="${data.marca || ''}" placeholder="Ex: LG, Samsung"></div>
          <div class="form-group"><label class="form-label">Modelo</label>
            <input class="form-input" id="eq-modelo" value="${data.modelo || ''}" placeholder="Ex: Inverter 12000BTU"></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:var(--space-3);">
          <div class="form-group"><label class="form-label">Potência (W) *</label>
            <input class="form-input" type="number" id="eq-potencia" value="${data.potencia || ''}" placeholder="1200" min="1" required></div>
          <div class="form-group"><label class="form-label">Horas/dia *</label>
            <input class="form-input" type="number" id="eq-horas" value="${data.horasUso || ''}" placeholder="8" min="0.5" max="24" step="0.5" required></div>
          <div class="form-group"><label class="form-label">Quantidade</label>
            <input class="form-input" type="number" id="eq-qtd" value="${data.quantidade || 1}" min="1"></div>
        </div>
        <div class="form-group"><label class="form-label">Classe de Eficiência (Selo Procel)</label>
          <select class="form-input" id="eq-classe">
            <option value="">Não sei</option>
            ${['A','B','C','D','E'].map(c => `<option value="${c}" ${data.classeEficiencia===c?'selected':''}>${c}</option>`).join('')}
          </select></div>
        <button type="submit" class="btn btn--primary" style="margin-top:var(--space-2);">💾 Salvar Equipamento</button>
      </form>
    `;
    Utils.showModal('Cadastrar Equipamento', html);
    document.getElementById('eq-manual-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const potencia = parseFloat(document.getElementById('eq-potencia').value) || 0;
      const horasUso = parseFloat(document.getElementById('eq-horas').value) || 0;
      const qtd = parseInt(document.getElementById('eq-qtd').value) || 1;
      const consumoMensal = Utils.calcMonthlyKwh(potencia * qtd, horasUso);
      const eq = {
        tipo: document.getElementById('eq-tipo').value.trim(),
        marca: document.getElementById('eq-marca').value.trim(),
        modelo: document.getElementById('eq-modelo').value.trim(),
        potencia: potencia,
        horasUso: horasUso,
        quantidade: qtd,
        classeEficiencia: document.getElementById('eq-classe').value,
        consumoMensal: consumoMensal,
      };
      Storage.addEquipment(eq);
      Storage.completeStep(3);
      Utils.hideModal();
      Utils.showToast('success', 'Equipamento salvo!', `${eq.tipo} — ${Utils.formatNumber(consumoMensal, 1)} kWh/mês`);
      App.navigateTo('equipment');
    });
  },

  editEquipment(id) {
    const eq = Storage.getEquipments().find(e => e.id === id);
    if (!eq) return;
    this.showManualForm(eq);
    // Override save to update instead of add
    setTimeout(() => {
      const form = document.getElementById('eq-manual-form');
      if (form) {
        form.onsubmit = null;
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const potencia = parseFloat(document.getElementById('eq-potencia').value) || 0;
          const horasUso = parseFloat(document.getElementById('eq-horas').value) || 0;
          const qtd = parseInt(document.getElementById('eq-qtd').value) || 1;
          Storage.updateEquipment(id, {
            tipo: document.getElementById('eq-tipo').value.trim(),
            marca: document.getElementById('eq-marca').value.trim(),
            modelo: document.getElementById('eq-modelo').value.trim(),
            potencia, horasUso, quantidade: qtd,
            classeEficiencia: document.getElementById('eq-classe').value,
            consumoMensal: Utils.calcMonthlyKwh(potencia * qtd, horasUso),
          });
          Utils.hideModal();
          Utils.showToast('success', 'Equipamento atualizado!');
          App.navigateTo('equipment');
        });
      }
    }, 100);
  },

  deleteEquipment(id) {
    if (confirm('Remover este equipamento?')) {
      Storage.deleteEquipment(id);
      Utils.showToast('info', 'Equipamento removido');
      App.navigateTo('equipment');
    }
  }
};
