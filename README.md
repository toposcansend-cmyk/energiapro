# ⚡ EnergiaPro — Eficiência Energética com IA

Aplicativo web de eficiência energética para comércios, potencializado por Inteligência Artificial (MiniMax M2.7).

## 🎯 O que é

EnergiaPro é uma ferramenta para donos de comércio realizarem um diagnóstico preliminar de eficiência energética e análise mensal de conta de energia. O app utiliza IA para:

- **Análise de conta de energia** via foto (OCR inteligente)
- **Mapeamento de equipamentos** por foto ou manual
- **Diagnóstico completo** com score de eficiência e insights de economia
- **Análise de elegibilidade** para Mercado Livre de Energia
- **Dashboard de gestão** com histórico e evolução

## 🚀 Fluxo do App

1. **Cadastro & Perfil** — Dados do comércio (segmento, área, horários, etc.)
2. **Análise de Conta** — Upload da fatura para OCR com IA
3. **Mapeamento de Cargas** — Fotos de equipamentos para inventário automático
4. **Diagnóstico & Insights** — Relatório completo gerado por IA
5. **Painel de Gestão** — Dashboard com KPIs e histórico

## 🛠️ Tecnologias

- HTML5, CSS3, JavaScript vanilla (zero dependências)
- MiniMax M2.7 API (texto + visão)
- Canvas API para gráficos
- LocalStorage para persistência
- GitHub Pages para deploy

## 📁 Estrutura

```
energiapro/
├── index.html          # Landing page
├── app.html            # Aplicação principal
├── css/
│   ├── variables.css   # Design tokens
│   ├── base.css        # Reset & layout
│   ├── components.css  # Componentes UI
│   ├── animations.css  # Animações
│   └── pages.css       # Estilos por página
├── js/
│   ├── storage.js      # Persistência (localStorage)
│   ├── utils.js        # Helpers & formatação
│   ├── api.js          # Integração MiniMax API
│   ├── auth.js         # Autenticação
│   ├── app.js          # Controlador principal
│   ├── profile.js      # Perfil do estabelecimento
│   ├── bill-analysis.js# Análise de conta
│   ├── equipment.js    # Mapeamento de equipamentos
│   ├── insights.js     # Diagnóstico & insights
│   └── dashboard.js    # Painel de gestão
└── README.md
```

## 🌐 Deploy

Hospedado no GitHub Pages. Para rodar localmente:

```bash
# Qualquer servidor HTTP estático serve
npx serve .
# ou
python -m http.server 8000
```

## 📄 Licença

MIT © 2026
