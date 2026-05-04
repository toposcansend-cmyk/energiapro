/* ============================================
   EnergiaPro — Profile Module
   ============================================ */

const ProfilePage = {
  render() {
    const profile = Storage.getProfile() || {};
    return `
      <div class="page-section">
        <div class="page-section__header">
          <h3 class="page-section__title">📋 Perfil do Estabelecimento</h3>
          <p class="page-section__subtitle">Preencha os dados do seu comércio para personalizar a análise</p>
        </div>
        <form id="profile-form" class="card" style="max-width:700px;">
          <div class="grid grid-2 gap-4">
            <div class="form-group">
              <label class="form-label" for="p-empresa">Nome da Empresa *</label>
              <input class="form-input" id="p-empresa" value="${profile.empresa || ''}" placeholder="Ex: Padaria do João" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="p-cnpj">CNPJ</label>
              <input class="form-input" id="p-cnpj" value="${profile.cnpj || ''}" placeholder="00.000.000/0000-00">
            </div>
          </div>
          <div class="grid grid-2 gap-4">
            <div class="form-group">
              <label class="form-label" for="p-segmento">Segmento *</label>
              <select class="form-input" id="p-segmento" required>
                <option value="">Selecione...</option>
                ${['restaurante','padaria','loja','escritorio','supermercado','farmacia','academia','hotel','oficina','outro']
                  .map(s => `<option value="${s}" ${profile.segmento===s?'selected':''}>${s.charAt(0).toUpperCase()+s.slice(1)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="p-concessionaria">Concessionária</label>
              <input class="form-input" id="p-concessionaria" value="${profile.concessionaria || ''}" placeholder="Ex: CPFL, Enel, Cemig">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="p-endereco">Endereço</label>
            <input class="form-input" id="p-endereco" value="${profile.endereco || ''}" placeholder="Rua, número, cidade - UF">
          </div>
          <div class="grid grid-2 gap-4">
            <div class="form-group">
              <label class="form-label" for="p-area">Área Total (m²) *</label>
              <input class="form-input" type="number" id="p-area" value="${profile.area || ''}" placeholder="150" min="1" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="p-area-clima">Área Climatizada (m²)</label>
              <input class="form-input" type="number" id="p-area-clima" value="${profile.areaClimatizada || ''}" placeholder="80" min="0">
            </div>
          </div>
          <div class="grid grid-2 gap-4">
            <div class="form-group">
              <label class="form-label" for="p-horario">Horário de Funcionamento</label>
              <input class="form-input" id="p-horario" value="${profile.horario || ''}" placeholder="Ex: 08:00 - 22:00">
            </div>
            <div class="form-group">
              <label class="form-label" for="p-funcionarios">Nº de Funcionários</label>
              <input class="form-input" type="number" id="p-funcionarios" value="${profile.funcionarios || ''}" placeholder="10" min="0">
            </div>
          </div>
          <div class="grid grid-2 gap-4">
            <div class="form-group">
              <label class="form-label" for="p-tipo-ligacao">Tipo de Ligação</label>
              <select class="form-input" id="p-tipo-ligacao">
                <option value="">Selecione...</option>
                ${['monofasica','bifasica','trifasica'].map(t => `<option value="${t}" ${profile.tipoLigacao===t?'selected':''}>${t.charAt(0).toUpperCase()+t.slice(1)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="p-grupo">Grupo Tarifário</label>
              <select class="form-input" id="p-grupo">
                <option value="">Selecione...</option>
                ${['B1','B2','B3','A4','A3a','A3','A2','A1'].map(g => `<option value="${g}" ${profile.grupoTarifario===g?'selected':''}>${g}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="grid grid-2 gap-4">
            <div class="form-group">
              <label class="form-label" for="p-consumo-medio">Consumo Médio (kWh/mês)</label>
              <input class="form-input" type="number" id="p-consumo-medio" value="${profile.consumoMedio || ''}" placeholder="2000" min="0">
            </div>
            <div class="form-group">
              <label class="form-label" for="p-gasto-medio">Gasto Médio (R$/mês)</label>
              <input class="form-input" type="number" id="p-gasto-medio" value="${profile.gastoMedio || ''}" placeholder="2500" min="0" step="0.01">
            </div>
          </div>
          <div class="form-group">
            <label class="toggle">
              <input type="checkbox" class="toggle__input" id="p-geracao" ${profile.geracaoPropria ? 'checked' : ''}>
              <span class="toggle__slider"></span>
              <span class="toggle__label">Possui geração própria (solar, etc.)?</span>
            </label>
          </div>
          <div class="form-group ${profile.geracaoPropria ? '' : 'hidden'}" id="p-geracao-details">
            <label class="form-label" for="p-potencia-solar">Potência Instalada (kWp)</label>
            <input class="form-input" type="number" id="p-potencia-solar" value="${profile.potenciaSolar || ''}" placeholder="10" min="0" step="0.1">
          </div>
          <div class="form-group">
            <label class="form-label" for="p-observacoes">Observações Adicionais</label>
            <textarea class="form-input" id="p-observacoes" placeholder="Detalhes relevantes sobre o local, como reformas recentes, equipamentos novos, etc.">${profile.observacoes || ''}</textarea>
          </div>
          <div class="flex gap-4" style="margin-top:var(--space-6);">
            <button type="submit" class="btn btn--primary btn--lg">
              💾 Salvar e Continuar
            </button>
          </div>
        </form>
      </div>
    `;
  },

  init() {
    const form = document.getElementById('profile-form');
    const geracaoToggle = document.getElementById('p-geracao');
    const geracaoDetails = document.getElementById('p-geracao-details');

    if (geracaoToggle) {
      geracaoToggle.addEventListener('change', () => {
        geracaoDetails.classList.toggle('hidden', !geracaoToggle.checked);
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const profile = {
          empresa: document.getElementById('p-empresa').value.trim(),
          cnpj: document.getElementById('p-cnpj').value.trim(),
          segmento: document.getElementById('p-segmento').value,
          concessionaria: document.getElementById('p-concessionaria').value.trim(),
          endereco: document.getElementById('p-endereco').value.trim(),
          area: parseFloat(document.getElementById('p-area').value) || 0,
          areaClimatizada: parseFloat(document.getElementById('p-area-clima').value) || 0,
          horario: document.getElementById('p-horario').value.trim(),
          funcionarios: parseInt(document.getElementById('p-funcionarios').value) || 0,
          tipoLigacao: document.getElementById('p-tipo-ligacao').value,
          grupoTarifario: document.getElementById('p-grupo').value,
          consumoMedio: parseFloat(document.getElementById('p-consumo-medio').value) || 0,
          gastoMedio: parseFloat(document.getElementById('p-gasto-medio').value) || 0,
          geracaoPropria: document.getElementById('p-geracao').checked,
          potenciaSolar: parseFloat(document.getElementById('p-potencia-solar').value) || 0,
          observacoes: document.getElementById('p-observacoes').value.trim(),
        };

        if (!profile.empresa || !profile.segmento || !profile.area) {
          Utils.showToast('error', 'Campos obrigatórios', 'Preencha empresa, segmento e área.');
          return;
        }

        Storage.setProfile(profile);
        Storage.completeStep(1);
        Utils.showToast('success', 'Perfil salvo!', 'Dados salvos com sucesso.');
        if (typeof App !== 'undefined') App.navigateTo('bill');
      });
    }
  }
};
