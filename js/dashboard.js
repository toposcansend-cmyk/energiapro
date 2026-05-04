/* ============================================
   EnergiaPro — Dashboard Module
   ============================================ */

const DashboardPage = {
  render() {
    const bills = Storage.getBills();
    const profile = Storage.getProfile() || {};
    const insights = Storage.getInsights();
    const equipments = Storage.getEquipments();
    const latest = Storage.getLatestBill();

    const totalKwhEq = equipments.reduce((s, e) => s + (e.consumoMensal || 0), 0);
    const score = insights?.score_eficiencia || 0;
    const totalSavings = (insights?.insights || []).reduce((s, i) => s + (i.economia_mensal_rs || 0), 0);

    return `
      <div class="page-section">
        <div class="page-section__header">
          <h3 class="page-section__title">📊 Painel de Gestão Energética</h3>
          <p class="page-section__subtitle">${profile.empresa || 'Seu Comércio'} — Visão geral</p>
        </div>

        <!-- KPIs -->
        <div class="dashboard-grid stagger-children">
          <div class="card kpi">
            <div class="kpi__value">${latest ? Utils.formatNumber(latest.consumo_total_kwh || 0) : '-'}</div>
            <div class="kpi__label">kWh consumidos</div>
            ${bills.length >= 2 ? (() => {
              const prev = bills[bills.length - 2];
              const diff = ((latest.consumo_total_kwh || 0) - (prev.consumo_total_kwh || 0)) / (prev.consumo_total_kwh || 1) * 100;
              return `<div class="kpi__change kpi__change--${diff > 0 ? 'up' : 'down'}">${diff > 0 ? '↑' : '↓'} ${Utils.formatPercent(Math.abs(diff))}</div>`;
            })() : ''}
          </div>
          <div class="card kpi">
            <div class="kpi__value" style="font-size:var(--text-2xl);">${latest ? Utils.formatCurrency(latest.valor_total_rs || 0) : '-'}</div>
            <div class="kpi__label">Último mês</div>
          </div>
          <div class="card kpi">
            <div class="kpi__value" style="${score>=80?'':'background:var(--gradient-warm);-webkit-background-clip:text;'}">${score || '-'}</div>
            <div class="kpi__label">Score Eficiência</div>
            <span class="badge ${score>=80?'badge--success':score>=50?'badge--warning':'badge--danger'}" style="margin-top:var(--space-2);">${insights?.classificacao || 'N/A'}</span>
          </div>
          <div class="card kpi">
            <div class="kpi__value" style="background:var(--gradient-primary);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-size:var(--text-2xl);">${Utils.formatCurrency(totalSavings)}</div>
            <div class="kpi__label">Economia potencial/mês</div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-2 gap-6" style="margin-top:var(--space-6);">
          <!-- Consumption Chart -->
          <div class="chart-container">
            <div class="chart-container__header">
              <div class="chart-container__title">📈 Histórico de Consumo</div>
            </div>
            <canvas id="chart-consumption" class="chart-canvas"></canvas>
            ${bills.length === 0 ? '<p style="text-align:center;color:var(--color-text-tertiary);font-size:var(--text-sm);padding:var(--space-8);">Adicione contas para ver o histórico</p>' : ''}
          </div>

          <!-- Equipment Distribution -->
          <div class="chart-container">
            <div class="chart-container__header">
              <div class="chart-container__title">🔌 Distribuição de Consumo</div>
            </div>
            <canvas id="chart-distribution" class="chart-canvas"></canvas>
            ${equipments.length === 0 ? '<p style="text-align:center;color:var(--color-text-tertiary);font-size:var(--text-sm);padding:var(--space-8);">Cadastre equipamentos para ver a distribuição</p>' : ''}
          </div>
        </div>

        <!-- Cost Chart -->
        <div class="chart-container" style="margin-top:var(--space-6);">
          <div class="chart-container__header">
            <div class="chart-container__title">💰 Histórico de Custos (R$)</div>
          </div>
          <canvas id="chart-costs" class="chart-canvas"></canvas>
        </div>

        <!-- Actions Checklist -->
        ${insights?.insights?.length > 0 ? `
        <div class="card" style="margin-top:var(--space-6);">
          <h4 style="margin-bottom:var(--space-4);">✅ Checklist de Ações</h4>
          <div class="flex flex-col gap-3">
            ${insights.insights.map((i, idx) => `
              <label class="toggle" style="padding:var(--space-3);background:var(--glass-bg);border:1px solid var(--glass-border);border-radius:var(--radius-lg);">
                <input type="checkbox" class="toggle__input" data-action-idx="${idx}">
                <span class="toggle__slider"></span>
                <span class="toggle__label" style="flex:1;">
                  <strong>${Utils.escapeHtml(i.titulo)}</strong>
                  <span style="color:var(--color-success);margin-left:var(--space-2);">${Utils.formatCurrency(i.economia_mensal_rs)}/mês</span>
                </span>
              </label>
            `).join('')}
          </div>
        </div>` : ''}

        <div class="flex gap-4" style="margin-top:var(--space-6);">
          <button class="btn btn--ghost" onclick="App.navigateTo('insights')">← Voltar</button>
          <button class="btn btn--secondary" onclick="DashboardPage.exportReport()">📥 Exportar Relatório</button>
        </div>
      </div>
    `;
  },

  init() {
    Storage.completeStep(5);
    this.drawCharts();
  },

  drawCharts() {
    const bills = Storage.getBills();
    const equipments = Storage.getEquipments();

    // Consumption Bar Chart
    if (bills.length > 0) this.drawBarChart('chart-consumption', bills.map(b => b.mes_referencia || 'Mês'), bills.map(b => b.consumo_total_kwh || 0), 'kWh', ['#00D4AA', '#0A84FF']);

    // Cost Bar Chart
    if (bills.length > 0) this.drawBarChart('chart-costs', bills.map(b => b.mes_referencia || 'Mês'), bills.map(b => b.valor_total_rs || 0), 'R$', ['#FFD60A', '#FF9F0A']);

    // Equipment Pie Chart
    if (equipments.length > 0) this.drawPieChart('chart-distribution', equipments.map(e => e.tipo || 'Equip.'), equipments.map(e => e.consumoMensal || 0));
  },

  drawBarChart(canvasId, labels, data, unit, colors) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;
    const max = Math.max(...data, 1) * 1.1;
    const barWidth = Math.min(40, (chartW / data.length) * 0.6);
    const gap = chartW / data.length;

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(w - padding.right, y); ctx.stroke();
      ctx.fillStyle = '#6B7280';
      ctx.font = '11px Inter';
      ctx.textAlign = 'right';
      const val = max - (max / 4) * i;
      ctx.fillText(unit === 'R$' ? Utils.formatCurrency(val) : Utils.formatNumber(val), padding.left - 8, y + 4);
    }

    // Bars
    data.forEach((v, i) => {
      const x = padding.left + gap * i + (gap - barWidth) / 2;
      const barH = (v / max) * chartH;
      const y = padding.top + chartH - barH;
      const grad = ctx.createLinearGradient(x, y, x, y + barH);
      grad.addColorStop(0, colors[0]);
      grad.addColorStop(1, colors[1] || colors[0]);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, [4, 4, 0, 0]);
      ctx.fill();
      // Label
      ctx.fillStyle = '#A1A1AA';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(labels[i] || '', x + barWidth / 2, h - padding.bottom + 16);
    });
  },

  drawPieChart(canvasId, labels, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const cx = w * 0.35;
    const cy = h / 2;
    const r = Math.min(cx - 20, cy - 20);
    const total = data.reduce((s, v) => s + v, 0);
    if (total === 0) return;

    const pieColors = ['#00D4AA', '#0A84FF', '#FFD60A', '#FF9F0A', '#5AC8FA', '#FF453A', '#30D158', '#64D2FF', '#BF5AF2', '#FF6B6B'];
    let angle = -Math.PI / 2;

    data.forEach((v, i) => {
      const slice = (v / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle, angle + slice);
      ctx.closePath();
      ctx.fillStyle = pieColors[i % pieColors.length];
      ctx.fill();
      angle += slice;
    });

    // Center hole (donut)
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = '#111827';
    ctx.fill();
    ctx.fillStyle = '#F5F5F7';
    ctx.font = 'bold 14px Outfit';
    ctx.textAlign = 'center';
    ctx.fillText(Utils.formatNumber(total, 0), cx, cy - 4);
    ctx.fillStyle = '#6B7280';
    ctx.font = '10px Inter';
    ctx.fillText('kWh/mês', cx, cy + 12);

    // Legend
    const legendX = w * 0.65;
    let legendY = 20;
    labels.forEach((label, i) => {
      if (legendY > h - 10) return;
      const pct = (data[i] / total * 100).toFixed(1);
      ctx.fillStyle = pieColors[i % pieColors.length];
      ctx.fillRect(legendX, legendY, 10, 10);
      ctx.fillStyle = '#A1A1AA';
      ctx.font = '11px Inter';
      ctx.textAlign = 'left';
      const txt = `${label} (${pct}%)`;
      ctx.fillText(txt.length > 20 ? txt.substring(0, 18) + '…' : txt, legendX + 16, legendY + 9);
      legendY += 20;
    });
  },

  exportReport() {
    const profile = Storage.getProfile() || {};
    const bill = Storage.getLatestBill() || {};
    const equipments = Storage.getEquipments();
    const insights = Storage.getInsights() || {};

    let report = `RELATÓRIO DE EFICIÊNCIA ENERGÉTICA - EnergiaPro\n`;
    report += `${'='.repeat(50)}\n\n`;
    report += `Empresa: ${profile.empresa || '-'}\n`;
    report += `Segmento: ${profile.segmento || '-'}\n`;
    report += `Área: ${profile.area || '-'} m²\n`;
    report += `Data: ${new Date().toLocaleDateString('pt-BR')}\n\n`;
    report += `SCORE DE EFICIÊNCIA: ${insights.score_eficiencia || '-'}/100 (${insights.classificacao || '-'})\n`;
    report += `IEE: ${Utils.formatNumber(insights.iee_kwh_m2, 1)} kWh/m²\n\n`;
    report += `ÚLTIMA CONTA:\n`;
    report += `  Consumo: ${Utils.formatKwh(bill.consumo_total_kwh)} | Valor: ${Utils.formatCurrency(bill.valor_total_rs)}\n\n`;
    report += `EQUIPAMENTOS (${equipments.length}):\n`;
    equipments.forEach(e => { report += `  - ${e.tipo}: ${e.potencia}W × ${e.horasUso}h/dia = ${Utils.formatNumber(e.consumoMensal, 1)} kWh/mês\n`; });
    report += `\nRECOMENDAÇÕES:\n`;
    (insights.insights || []).forEach((i, idx) => {
      report += `  ${idx + 1}. [${i.prioridade}] ${i.titulo}\n     ${i.descricao}\n     Economia: ${Utils.formatCurrency(i.economia_mensal_rs)}/mês\n\n`;
    });
    report += `\n${insights.resumo_executivo || ''}\n`;
    report += `\n${'='.repeat(50)}\nGerado por EnergiaPro © ${new Date().getFullYear()}\n`;

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-energiapro-${profile.empresa ? profile.empresa.replace(/\s+/g, '-').toLowerCase() : 'report'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    Utils.showToast('success', 'Relatório exportado!', 'Arquivo salvo com sucesso.');
  }
};
