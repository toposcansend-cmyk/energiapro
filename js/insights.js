/* ============================================
   EnergiaPro — Insights / Diagnostic Module
   ============================================ */

const InsightsPage = {
  render() {
    const insights = Storage.getInsights();
    const profile = Storage.getProfile();
    const bill = Storage.getLatestBill();
    const equipments = Storage.getEquipments();

    if (!insights) {
      return `
        <div class="page-section">
          <div class="page-section__header">
            <h3 class="page-section__title">💡 Diagnóstico & Insights</h3>
            <p class="page-section__subtitle">Gere um relatório completo de eficiência energética com IA</p>
          </div>
          <div class="card" style="max-width:600px;">
            <div class="empty-state">
              <div class="empty-state__icon">🤖</div>
              <h4 class="empty-state__title">Pronto para o Diagnóstico</h4>
              <p class="empty-state__description">
                ${!profile ? '⚠️ Preencha o perfil do estabelecimento primeiro.' :
                  !bill ? '⚠️ Envie pelo menos uma conta de energia primeiro.' :
                  'Temos todos os dados necessários. Clique abaixo para gerar o diagnóstico completo com IA.'}
              </p>
              <button class="btn btn--primary btn--lg animate-pulse-glow" id="btn-generate-diagnostic" ${!profile || !bill ? 'disabled' : ''}>
                🤖 Gerar Diagnóstico Completo
              </button>
              <p style="font-size:var(--text-xs);color:var(--color-text-tertiary);margin-top:var(--space-3);">
                Dados disponíveis: ${profile ? '✅ Perfil' : '❌ Perfil'} · ${bill ? '✅ Conta' : '❌ Conta'} · ${equipments.length > 0 ? `✅ ${equipments.length} equip.` : '⚠️ Sem equip.'}
              </p>
            </div>
          </div>
          <div class="flex gap-4" style="margin-top:var(--space-6);">
            <button class="btn btn--ghost" onclick="App.navigateTo('equipment')">← Voltar</button>
          </div>
        </div>
      `;
    }

    return this.renderResults(insights, profile);
  },

  renderResults(insights, profile) {
    const score = insights.score_eficiencia || 0;
    const scoreColor = score >= 80 ? 'var(--color-success)' : score >= 50 ? 'var(--color-warning)' : 'var(--color-danger)';
    const circumference = 2 * Math.PI * 65;
    const offset = circumference - (score / 100) * circumference;

    return `
      <div class="page-section">
        <div class="page-section__header">
          <h3 class="page-section__title">💡 Diagnóstico & Insights</h3>
          <p class="page-section__subtitle">Relatório completo de eficiência energética</p>
        </div>

        <!-- Score + Summary -->
        <div class="grid grid-2 gap-6" style="margin-bottom:var(--space-6);">
          <div class="card card--highlight text-center">
            <div class="score-ring" style="margin:0 auto var(--space-4);">
              <svg class="score-ring__svg" viewBox="0 0 160 160">
                <defs><linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="#00D4AA"/><stop offset="100%" stop-color="#0A84FF"/></linearGradient></defs>
                <circle class="score-ring__bg" cx="80" cy="80" r="65"/>
                <circle class="score-ring__progress" cx="80" cy="80" r="65" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"/>
              </svg>
              <div style="position:absolute;text-align:center;">
                <div class="score-ring__value">${score}</div>
                <div class="score-ring__label">de 100</div>
              </div>
            </div>
            <div class="badge ${score>=80?'badge--success':score>=50?'badge--warning':'badge--danger'}" style="font-size:var(--text-sm);">
              ${insights.classificacao || 'N/A'}
            </div>
            <p style="font-size:var(--text-sm);color:var(--color-text-tertiary);margin-top:var(--space-3);">
              IEE: ${Utils.formatNumber(insights.iee_kwh_m2, 1)} kWh/m² (benchmark: ${Utils.formatNumber(insights.iee_benchmark_setor, 1)} kWh/m²)
            </p>
          </div>
          <div class="card">
            <h4 style="margin-bottom:var(--space-3);">📝 Resumo Executivo</h4>
            <p style="font-size:var(--text-sm);line-height:var(--line-height-relaxed);">${Utils.escapeHtml(insights.resumo_executivo || '')}</p>
            ${insights.divergencia_consumo_percent > 20 ? `
              <div class="badge badge--danger" style="margin-top:var(--space-3);">
                ⚠️ Divergência de ${Utils.formatPercent(insights.divergencia_consumo_percent)} entre consumo mapeado e conta
              </div>` : ''}
          </div>
        </div>

        <!-- Insights Cards -->
        <h4 style="margin-bottom:var(--space-4);">🎯 Ações Recomendadas</h4>
        <div class="grid grid-2 gap-4" style="margin-bottom:var(--space-6);">
          ${(insights.insights || []).map(i => `
            <div class="card insight-card">
              <div class="insight-card__priority">
                <div class="insight-card__priority-dot insight-card__priority-dot--${i.prioridade === 'verde' ? 'green' : i.prioridade === 'amarela' ? 'yellow' : 'red'}"></div>
                <span class="badge ${i.prioridade === 'verde' ? 'badge--success' : i.prioridade === 'amarela' ? 'badge--warning' : 'badge--danger'}">
                  ${i.prioridade === 'verde' ? 'Sem custo' : i.prioridade === 'amarela' ? 'Investimento baixo' : 'Investimento médio/alto'}
                </span>
              </div>
              <div class="insight-card__title">${Utils.escapeHtml(i.titulo)}</div>
              <div class="insight-card__description">${Utils.escapeHtml(i.descricao)}</div>
              <div class="insight-card__savings">
                💰 Economia: ${Utils.formatCurrency(i.economia_mensal_rs)}/mês · ${Utils.formatCurrency(i.economia_anual_rs)}/ano
              </div>
              ${i.investimento_rs ? `<div style="font-size:var(--text-xs);color:var(--color-text-tertiary);margin-top:var(--space-1);">
                Investimento: ${Utils.formatCurrency(i.investimento_rs)} · Payback: ${i.payback_meses} meses
              </div>` : ''}
            </div>
          `).join('')}
        </div>

        <!-- Mercado Livre -->
        ${insights.mercado_livre ? `
        <div class="card ${insights.mercado_livre.elegivel ? 'card--highlight' : ''}" style="margin-bottom:var(--space-6);">
          <div class="card__header">
            <div class="card__icon" style="background:linear-gradient(135deg,#5AC8FA,#0A84FF);">⚡</div>
            <div>
              <div class="card__title">Mercado Livre de Energia</div>
              <div class="card__subtitle">${insights.mercado_livre.elegivel ? 'Seu comércio é elegível!' : 'Análise de elegibilidade'}</div>
            </div>
            <span class="badge ${insights.mercado_livre.elegivel ? 'badge--success' : 'badge--warning'}">${insights.mercado_livre.elegivel ? 'Elegível' : 'Não elegível'}</span>
          </div>
          <div class="card__body">
            ${insights.mercado_livre.elegivel ? `
              <p>💰 Economia estimada: <strong>${Utils.formatPercent(insights.mercado_livre.economia_estimada_percent)}</strong> — ${Utils.formatCurrency(insights.mercado_livre.economia_estimada_rs_mes)}/mês</p>
              <p style="margin-top:var(--space-2);">📋 Próximo passo: ${Utils.escapeHtml(insights.mercado_livre.proximo_passo || '')}</p>
            ` : `<p>Seu comércio ainda não atende os requisitos para migração ao Mercado Livre.</p>`}
          </div>
        </div>` : ''}

        <!-- Solar -->
        ${insights.geracao_solar && insights.geracao_solar.recomendado ? `
        <div class="card card--highlight" style="margin-bottom:var(--space-6);">
          <div class="card__header">
            <div class="card__icon" style="background:var(--gradient-warm);">☀️</div>
            <div>
              <div class="card__title">Geração Solar Fotovoltaica</div>
              <div class="card__subtitle">Recomendação de sistema solar</div>
            </div>
          </div>
          <div class="card__body">
            <p>⚡ Potência sugerida: <strong>${insights.geracao_solar.potencia_sugerida_kwp} kWp</strong></p>
            <p>💰 Economia: <strong>${Utils.formatCurrency(insights.geracao_solar.economia_estimada_rs_mes)}/mês</strong></p>
            <p>🏗️ Investimento: ${Utils.formatCurrency(insights.geracao_solar.investimento_estimado_rs)} · Payback: ${insights.geracao_solar.payback_anos} anos</p>
          </div>
        </div>` : ''}

        <!-- Tips -->
        ${insights.dicas_gerais && insights.dicas_gerais.length > 0 ? `
        <div class="card" style="margin-bottom:var(--space-6);">
          <h4 style="margin-bottom:var(--space-3);">📌 Dicas Gerais</h4>
          <ul style="list-style:disc;padding-left:var(--space-6);">
            ${insights.dicas_gerais.map(d => `<li style="color:var(--color-text-secondary);margin-bottom:var(--space-2);font-size:var(--text-sm);">${Utils.escapeHtml(d)}</li>`).join('')}
          </ul>
        </div>` : ''}

        <div class="flex gap-4">
          <button class="btn btn--ghost" onclick="App.navigateTo('equipment')">← Voltar</button>
          <button class="btn btn--secondary" id="btn-regenerate-diagnostic">🔄 Regerar Diagnóstico</button>
          <button class="btn btn--primary" onclick="App.navigateTo('dashboard')">Ver Dashboard →</button>
        </div>
      </div>
    `;
  },

  init() {
    const generateBtn = document.getElementById('btn-generate-diagnostic');
    const regenBtn = document.getElementById('btn-regenerate-diagnostic');

    const generate = async () => {
      const profile = Storage.getProfile();
      const bill = Storage.getLatestBill();
      const equipments = Storage.getEquipments();

      if (!profile) { Utils.showToast('error', 'Perfil necessário', 'Preencha o perfil primeiro.'); return; }
      if (!bill) { Utils.showToast('error', 'Conta necessária', 'Envie uma conta de energia primeiro.'); return; }

      Utils.showLoading('🤖 Gerando diagnóstico completo...', 'A IA está analisando todos os dados do seu comércio. Isso pode levar até 30 segundos.');
      const result = await API.generateDiagnostic(profile, bill, equipments);
      Utils.hideLoading();

      if (result.success) {
        const diagnosticData = Utils.parseAIJson(result.content);
        if (diagnosticData) {
          // Complement with local calculations
          if (profile.area && bill.consumo_total_kwh) {
            diagnosticData.iee_kwh_m2 = diagnosticData.iee_kwh_m2 || Utils.calcIEE(bill.consumo_total_kwh, profile.area);
            diagnosticData.score_eficiencia = diagnosticData.score_eficiencia || Utils.calcEnergyScore(diagnosticData.iee_kwh_m2, profile.segmento);
          }
          Storage.setInsights(diagnosticData);
          Storage.completeStep(4);
          Utils.showToast('success', 'Diagnóstico gerado!', 'Confira os insights e recomendações.');
          App.navigateTo('insights');
        } else {
          Utils.showToast('error', 'Erro no diagnóstico', 'Não foi possível interpretar a resposta da IA. Tente novamente.');
        }
      } else {
        Utils.showToast('error', 'Erro na geração', result.error || 'Tente novamente.');
      }
    };

    if (generateBtn) generateBtn.addEventListener('click', generate);
    if (regenBtn) regenBtn.addEventListener('click', () => { Storage.setInsights(null); generate(); });
  }
};
