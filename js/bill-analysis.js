/* ============================================
   EnergiaPro — Bill Analysis Module
   ============================================ */

const BillPage = {
  currentImage: null,

  render() {
    const bills = Storage.getBills();
    const latest = Storage.getLatestBill();
    return `
      <div class="page-section">
        <div class="page-section__header">
          <h3 class="page-section__title">📄 Análise de Conta de Energia</h3>
          <p class="page-section__subtitle">Envie uma foto da sua conta para a IA analisar automaticamente</p>
        </div>

        <!-- Upload -->
        <div class="card" style="max-width:700px;margin-bottom:var(--space-6);">
          <div class="upload-zone" id="bill-upload-zone">
            <input type="file" class="upload-zone__input" id="bill-file-input" accept="image/*,.pdf">
            <div id="bill-upload-content">
              <div class="upload-zone__icon">📄</div>
              <div class="upload-zone__title">Arraste a conta de energia aqui</div>
              <div class="upload-zone__subtitle">ou clique para selecionar • JPG, PNG ou PDF • máx. 10MB</div>
            </div>
            <div id="bill-preview" class="hidden"></div>
          </div>
          <div class="flex gap-4" style="margin-top:var(--space-4);">
            <button class="btn btn--primary btn--lg" id="btn-analyze-bill" disabled>
              🤖 Analisar com IA
            </button>
            <button class="btn btn--secondary" id="btn-manual-bill">
              ✏️ Preencher Manualmente
            </button>
          </div>
        </div>

        <!-- Results -->
        <div id="bill-results" class="${latest ? '' : 'hidden'}">
          ${latest ? this.renderBillResults(latest) : ''}
        </div>

        <!-- History -->
        ${bills.length > 0 ? `
        <div class="card" style="margin-top:var(--space-6);">
          <h4 style="margin-bottom:var(--space-4);">📋 Histórico de Contas</h4>
          <div class="flex flex-col gap-3">
            ${bills.map(b => `
              <div class="analysis-item">
                <div>
                  <div class="analysis-item__label">${b.mes_referencia || Utils.formatDate(b.createdAt)}</div>
                  <div style="font-size:var(--text-sm);color:var(--color-text-tertiary);">${Utils.formatKwh(b.consumo_total_kwh || 0)}</div>
                </div>
                <div class="analysis-item__value">${Utils.formatCurrency(b.valor_total_rs || 0)}</div>
              </div>
            `).join('')}
          </div>
        </div>` : ''}

        <div class="flex gap-4" style="margin-top:var(--space-6);">
          <button class="btn btn--ghost" onclick="App.navigateTo('profile')">← Voltar</button>
          <button class="btn btn--primary" onclick="App.navigateTo('equipment')">Continuar →</button>
        </div>
      </div>
    `;
  },

  renderBillResults(bill) {
    const fields = [
      ['Concessionária', bill.concessionaria],
      ['Mês Referência', bill.mes_referencia],
      ['Grupo Tarifário', bill.grupo_tarifario],
      ['Consumo Total', Utils.formatKwh(bill.consumo_total_kwh)],
      ['Consumo Ponta', Utils.formatKwh(bill.consumo_ponta_kwh)],
      ['Consumo F. Ponta', Utils.formatKwh(bill.consumo_fora_ponta_kwh)],
      ['Demanda Contratada', bill.demanda_contratada_kw ? bill.demanda_contratada_kw + ' kW' : '-'],
      ['Demanda Medida', bill.demanda_medida_kw ? bill.demanda_medida_kw + ' kW' : '-'],
      ['Tarifa Média', bill.tarifa_media_rs_kwh ? 'R$ ' + bill.tarifa_media_rs_kwh + '/kWh' : '-'],
      ['Bandeira', bill.bandeira_tarifaria || '-'],
      ['ICMS', Utils.formatCurrency(bill.icms_rs)],
      ['PIS/COFINS', Utils.formatCurrency(bill.pis_cofins_rs)],
      ['CIP/COSIP', Utils.formatCurrency(bill.cip_cosip_rs)],
      ['Multas', Utils.formatCurrency(bill.multas_rs)],
      ['Créditos Geração', Utils.formatCurrency(bill.creditos_geracao_rs)],
      ['VALOR TOTAL', Utils.formatCurrency(bill.valor_total_rs)],
    ];
    return `
      <div class="card card--highlight">
        <h4 style="margin-bottom:var(--space-4);">✅ Dados Extraídos da Conta</h4>
        ${bill.observacoes ? `<div class="badge badge--warning" style="margin-bottom:var(--space-4);">⚠️ ${Utils.escapeHtml(bill.observacoes)}</div>` : ''}
        <div class="analysis-results">
          ${fields.filter(([,v]) => v && v !== '-' && v !== 'R$ 0,00' && v !== '0,0 kWh')
            .map(([label, value]) => `
              <div class="analysis-item">
                <div class="analysis-item__label">${label}</div>
                <div class="analysis-item__value" style="font-size:${label==='VALOR TOTAL'?'var(--text-xl)':'var(--text-base)'};">${value}</div>
              </div>
            `).join('')}
        </div>
        <div class="flex gap-3" style="margin-top:var(--space-4);">
          <button class="btn btn--ghost btn--sm" id="btn-edit-bill">✏️ Editar Dados</button>
        </div>
      </div>
    `;
  },

  init() {
    const fileInput = document.getElementById('bill-file-input');
    const uploadZone = document.getElementById('bill-upload-zone');
    const analyzeBtn = document.getElementById('btn-analyze-bill');
    const manualBtn = document.getElementById('btn-manual-bill');

    if (fileInput) {
      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { Utils.showToast('error', 'Arquivo muito grande', 'Máximo 10MB'); return; }
        this.currentImage = await Utils.fileToBase64(file);
        document.getElementById('bill-upload-content').classList.add('hidden');
        const preview = document.getElementById('bill-preview');
        preview.classList.remove('hidden');
        preview.innerHTML = `
          <div class="upload-zone__preview">
            <img src="${this.currentImage}" alt="Conta de energia">
            <button class="upload-zone__remove" onclick="BillPage.clearUpload()">✕</button>
          </div>
        `;
        analyzeBtn.disabled = false;
      });
    }

    // Drag & drop
    if (uploadZone) {
      uploadZone.addEventListener('dragover', (e) => { e.preventDefault(); uploadZone.classList.add('upload-zone--dragover'); });
      uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('upload-zone--dragover'));
      uploadZone.addEventListener('drop', (e) => {
        e.preventDefault(); uploadZone.classList.remove('upload-zone--dragover');
        const file = e.dataTransfer.files[0];
        if (file) { fileInput.files = e.dataTransfer.files; fileInput.dispatchEvent(new Event('change')); }
      });
    }

    // Analyze
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', async () => {
        if (!this.currentImage) return;
        Utils.showLoading('🤖 Analisando conta de energia...', 'A IA está extraindo dados da sua conta. Isso pode levar alguns segundos.');
        const result = await API.analyzeBill(this.currentImage);
        Utils.hideLoading();
        if (result.success) {
          const billData = Utils.parseAIJson(result.content);
          if (billData) {
            Storage.addBill(billData);
            Storage.completeStep(2);
            Utils.showToast('success', 'Conta analisada!', 'Dados extraídos com sucesso.');
            App.navigateTo('bill'); // Re-render
          } else {
            Utils.showToast('warning', 'Análise parcial', 'Não foi possível extrair todos os dados. Preencha manualmente.');
            this.showManualForm();
          }
        } else {
          Utils.showToast('error', 'Erro na análise', result.error || 'Tente novamente ou preencha manualmente.');
          this.showManualForm();
        }
      });
    }

    // Manual
    if (manualBtn) manualBtn.addEventListener('click', () => this.showManualForm());

    // Edit bill
    const editBtn = document.getElementById('btn-edit-bill');
    if (editBtn) editBtn.addEventListener('click', () => this.showManualForm(Storage.getLatestBill()));
  },

  clearUpload() {
    this.currentImage = null;
    document.getElementById('bill-upload-content').classList.remove('hidden');
    document.getElementById('bill-preview').classList.add('hidden');
    document.getElementById('bill-preview').innerHTML = '';
    document.getElementById('btn-analyze-bill').disabled = true;
    document.getElementById('bill-file-input').value = '';
  },

  showManualForm(data = {}) {
    const fields = [
      { key: 'concessionaria', label: 'Concessionária', type: 'text' },
      { key: 'mes_referencia', label: 'Mês Referência', type: 'text', placeholder: 'MM/AAAA' },
      { key: 'consumo_total_kwh', label: 'Consumo Total (kWh)', type: 'number' },
      { key: 'consumo_ponta_kwh', label: 'Consumo Ponta (kWh)', type: 'number' },
      { key: 'consumo_fora_ponta_kwh', label: 'Consumo Fora Ponta (kWh)', type: 'number' },
      { key: 'demanda_contratada_kw', label: 'Demanda Contratada (kW)', type: 'number' },
      { key: 'demanda_medida_kw', label: 'Demanda Medida (kW)', type: 'number' },
      { key: 'tarifa_media_rs_kwh', label: 'Tarifa Média (R$/kWh)', type: 'number', step: '0.01' },
      { key: 'bandeira_tarifaria', label: 'Bandeira Tarifária', type: 'select', options: ['verde','amarela','vermelha1','vermelha2'] },
      { key: 'icms_rs', label: 'ICMS (R$)', type: 'number', step: '0.01' },
      { key: 'pis_cofins_rs', label: 'PIS/COFINS (R$)', type: 'number', step: '0.01' },
      { key: 'cip_cosip_rs', label: 'CIP/COSIP (R$)', type: 'number', step: '0.01' },
      { key: 'multas_rs', label: 'Multas (R$)', type: 'number', step: '0.01' },
      { key: 'creditos_geracao_rs', label: 'Créditos Geração (R$)', type: 'number', step: '0.01' },
      { key: 'valor_total_rs', label: 'Valor Total (R$)', type: 'number', step: '0.01' },
    ];
    const html = `
      <form id="manual-bill-form">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3);">
          ${fields.map(f => `
            <div class="form-group" style="margin-bottom:var(--space-3);">
              <label class="form-label">${f.label}</label>
              ${f.type === 'select'
                ? `<select class="form-input" id="mb-${f.key}">
                    <option value="">-</option>
                    ${f.options.map(o => `<option value="${o}" ${data[f.key]===o?'selected':''}>${o}</option>`).join('')}
                  </select>`
                : `<input class="form-input" type="${f.type}" id="mb-${f.key}" value="${data[f.key] || ''}" ${f.step?`step="${f.step}"`:''}  ${f.placeholder?`placeholder="${f.placeholder}"`:''}>` }
            </div>
          `).join('')}
        </div>
        <button type="submit" class="btn btn--primary" style="margin-top:var(--space-4);">💾 Salvar Conta</button>
      </form>
    `;
    Utils.showModal('Preencher Dados da Conta', html);
    document.getElementById('manual-bill-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const billData = {};
      fields.forEach(f => {
        const el = document.getElementById(`mb-${f.key}`);
        billData[f.key] = f.type === 'number' ? (parseFloat(el.value) || 0) : el.value;
      });
      Storage.addBill(billData);
      Storage.completeStep(2);
      Utils.hideModal();
      Utils.showToast('success', 'Conta salva!', 'Dados registrados com sucesso.');
      App.navigateTo('bill');
    });
  }
};
