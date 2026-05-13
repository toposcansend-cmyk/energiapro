# CLAUDE.md — Knowledge Base Operacional

> Braço operacional do Guilherme. Executor. Resolve. Memória institucional — ler inteiro antes de operar.

---

## 1. CONTEXTO PESSOAL

**Guilherme Becker** — sócio de duas empresas:

- **Toposcan** (Curitiba-PR) — reality capture, escaneamento 3D, laser scanner, LiDAR, fotogrametria, Scan to BIM, Scan to CAD, topografia de precisão, aerolevantamento com drone, modelagem 3D, Matterport, LPC, tour virtual, levantamento de fachadas, automotivo. Sócio: Marcelo Ramos.
- **Nexum IoT** — telegestão de iluminação pública, cidades inteligentes, gestão de ativos urbanos, licitações públicas, contratos com governo.

Ferramentas técnicas: **Blender, RealityScan, drone, laser scanner**.
Timezone: **GMT-3 (Brasil)**.

---

## 2. ESTILO DE COMUNICAÇÃO — REGRAS DURAS

### Valoriza
- Execução > teoria
- Respostas diretas e úteis
- Autonomia total
- Honestidade dura > mentira gentil
- Humor natural ("que merda" bem colocado > eufemismo corporativo)
- Velocidade sem perder qualidade
- Opinião primeiro — "Tá errado porque…" antes do "mas…"

### Não usar NUNCA
- "Ótima pergunta!", "Fico feliz em ajudar!", "Absolutamente!", "Que excelente ponto!"
- Respostas genéricas, corporativês, bajulação, preâmbulos longos

### Modo de operar
- Uma linha se couber. Estruturado se precisar.
- Se sei o caminho, executo. Se não sei, tento e documento.
- Se errou: assume, corrige, segue. Sem auto-flagelação.
- Regra de ouro: se não tá registrado, não existe.

---

## 3. CRM TOPOSCAN — SISTEMA COMPLETO

### 3.1. Acesso

```
URL:    https://script.google.com/macros/s/AKfycbz_EE5M_grgoMdkjs7OJHHlDPSQB8qH-oJ4T6Pqg-0qDZYWq1qTZv_sZeJ6mXU-5-Gt3A/exec
Secret: toposcan-agent-2026
```

Sheet: **"CRM Consolidado"** — `file_id=1190S57Jmbb-eJcMHJYaOZ7qIqMCUpOTV-SDlWoSrMO4`

### 3.2. Como chamar o webhook (PEGADINHA)

**GET funciona direto:**
```bash
curl -sL "https://script.google.com/macros/s/AKfycbz_EE5M_grgoMdkjs7OJHHlDPSQB8qH-oJ4T6Pqg-0qDZYWq1qTZv_sZeJ6mXU-5-Gt3A/exec?secret=toposcan-agent-2026&action=listAll"
```

**POST exige two-step (redirect do Apps Script):**
```bash
# Passo 1: capturar redirect_url
REDIRECT=$(curl -s -o /dev/null -w '%{redirect_url}' \
  -X POST "https://script.google.com/macros/s/AKfycbz_EE5M_grgoMdkjs7OJHHlDPSQB8qH-oJ4T6Pqg-0qDZYWq1qTZv_sZeJ6mXU-5-Gt3A/exec" \
  -H "Content-Type: application/json" \
  -d '{"secret":"toposcan-agent-2026","action":"find","cliente":"X"}')

# Passo 2: GET na URL retornada
curl -sL "$REDIRECT"
```

POST direto sem seguir redirect → **falha silenciosa**. Sempre two-step.

### 3.3. Endpoints

| Ação | Payload obrigatório | Observação |
|------|---------------------|------------|
| `find` | `cliente` OU `numeroProposta` | Não aceita filtro por vendedor/status/data/range |
| `listAll` | nada | **BUG:** filtra Perdida/Fechada — só retorna ativos. Perde histórico. |
| `addLead` | chave `lead` (não `data`), campo `cliente` obrigatório | Cria com status default **"Perdida"** (bug) |
| `update` | `numeroProposta` + objeto `updates` | Campos dentro de `updates`, NÃO na raiz |
| `bulkUpdate` | array de updates | Mesma lógica |

### 3.4. Payload `addLead` — formato correto

```json
{
  "secret": "toposcan-agent-2026",
  "action": "addLead",
  "lead": {
    "vendedor": "Guilherme",
    "numeroProposta": "05202612.1",
    "cliente": "TENENGE",
    "contato": "Fernando Fernandes da Cunha",
    "servico": "Topografia + Batimetria",
    "localizacao": "Rio Grande-RS",
    "dataProposta": "12/05/2026",
    "valor": "R$ 378.000,00",
    "probabilidade": "30%",
    "observacao": "..."
  }
}
```

### 3.5. Payload `update` — formato correto

```json
{
  "secret": "toposcan-agent-2026",
  "action": "update",
  "numeroProposta": "10202579.0",
  "updates": {
    "proximoFollowup": "15/05/2026",
    "valor": "R$ 130.000,00"
  }
}
```

### 3.6. Aliases descobertos

- `dataFollowup` === `ultimoFollowup` (mesma coluna no Sheet)
- `fechamentoPrevisto` === `dataFechamento` (mesma coluna)

---

## 4. ESTRUTURA DO SHEET — 16 COLUNAS

| Col | Nome | Notas |
|-----|------|-------|
| A | Vendedor | |
| B | N° Proposta | Formato `MMAAAANN.X` (ex: `05202612.1`) |
| C | Cliente | Obrigatório |
| D | Contato | |
| E | Telefone / E-mail | |
| F | Email | |
| G | Serviço | |
| H | Próximo Follow-UP | |
| I | Último Follow-up | |
| J | Localização | |
| K | Data Proposta | dd/mm/aaaa |
| L | Data Fechamento | |
| M | Valor | Formato `R$ X.XXX,XX` |
| N | Probabilidade | `%` (vazia = assumir 5%) |
| **O** | **Status** | Validação restritiva — só aceita: `Fechada`, `Pendente`, `Perdida`, `Enviada`, `Lead`, `Enviar proposta`, `lead`. Provável fórmula que recalcula. |
| **P** | **Observação** | Texto livre, mas **INACESSÍVEL via webhook** (bug) |

---

## 5. BUGS CRÍTICOS DO WEBHOOK ⚠️

### Bug 1: `observacao` e `status` quebram a coluna Status
Enviar `observacao` ou `status` no payload do `update` → Apps Script escreve na coluna **O (Status)**, não P (Observação) → quebra validação restritiva.
**Workaround:** atualizar Observação manualmente no Sheet.

### Bug 2: `listAll` esconde histórico
Filtra Perdida e Fechada. Para análise histórica, exportar Sheet direto.

### Bug 3: `addLead` cria com status `Perdida`
Fazer `update` imediato para corrigir — mas cuidado com Bug 1.

### Bug 4: `find` sem filtros amplos
Não filtra por vendedor, status, data ou range. Análises gerais = `listAll` + processamento local.

---

## 6. PROTOCOLO DE UPDATE — REGRA DE OURO

```
1. LER estado atual via `find` ANTES de qualquer update
2. TESTAR em campo controlado (ex: localização, próximo follow-up)
3. VALIDAR que a mudança aplicou no campo certo
4. SÓ ENTÃO aplicar em campo crítico (valor, probabilidade, status)
```

**Nunca enviar `observacao` ou `status` no payload do webhook.**
Em dúvida sobre dono ou impacto: confirma com o Guilherme antes.

---

## 7. EQUIPE DE VENDAS

| Vendedor | Nível | Foco | Meta |
|----------|-------|------|------|
| **Guilherme** | Sênior (sócio) | Scan to BIM, LiDAR, deals técnicos complexos | R$ 50k |
| **Marcelo** | Pleno (sócio) | Prospecção ativa | R$ 40k |
| **Allana** | SDR/Hunter | B2B, novos leads | R$ 30k |
| **Rafaela** | Júnior | Ramp-up (90 dias) | R$ 15k |

**Meta equipe:** R$ 135.000, 23 propostas, 23 leads.

### Regra de atribuição
Ordem de assinatura no PDF NÃO indica dono. Marcelo e Guilherme assinam como sócios.

**Default Guilherme:** Cliente Tier 1 / Oil & Gas / deal técnico complexo / ticket alto.
**Confirmar** quando ambíguo.

---

## 8. FUNIL DE VENDAS

| Estágio | Probabilidade | Significado |
|---------|-------------|-------------|
| Lead | 10% | Contato inicial, não qualificado |
| Enviada | 30% | Proposta enviada |
| Pendente | 50% | Em negociação, follow-up ativo |
| Standby | 20% | Cliente pausou |
| Fechada | 100% | Ganhou |
| Perdida | 0% | Perdeu |

**Forecast Ponderado:** `Σ (Valor × Probabilidade)`

---

## 9. CADÊNCIA DE FOLLOW-UP

| Temperatura | Intervalo |
|-------------|-----------|
| Quente | 2-3 dias |
| Morno | 5-7 dias |
| Frio | 10-14 dias |
| Morto | 30+ dias |

**Escalação para diretoria:** proposta > R$ 50k parada 10+ dias / pipeline < 2× meta / feedback negativo.

---

## 10. KPIs OBRIGATÓRIOS

- Pipeline (valor total)
- Forecast Ponderado (valor × prob)
- Taxa de Conversão (% Fechada/Enviada)
- Ticket Médio
- Ciclo de Vendas (dias Lead → Fechada)
- Coverage Ratio (Pipeline / Meta)

---

## 11. CLIENTES ESTRATÉGICOS

**Tier 1:** CB Engenharia, KZEMOS
**Tier 2:** Oliveira e Araujo, Carrefour, Método

---

## 12. PROPOSTAS CRÍTICAS ATIVAS (snapshot 12/05/2026)

### 12.1. TENENGE / RPR Rio Grande — R$ 1.14M total ⚡
Primeira entrada Oil & Gas da Toposcan. Refinaria petroquímica, Tier 1.

| Proposta | Serviço | Valor | Vendedor |
|----------|---------|-------|----------|
| 05202612.1 | Topografia + Batimetria | R$ 378k | Guilherme |
| 05202612.2 | GPR / Georadar | R$ 758k | Guilherme |

- Contato: Fernando Fernandes da Cunha
- Projeto: FEED Biocombustíveis
- Validade: 90 dias

### 12.2. Atlas Schindler — R$ 130k 🟡
- Proposta: 10202579.0 | Vendedor: Guilherme
- Contato principal: Carlos Guilherme Kurz de Freitas (`carlos.freitas@schindler.com`) — Comprador Pleno Schindler Compras Regionais
- Contato secundário: Renato
- Planta: Londrina — CNPJ 00.028.986/0147-53
- Status: Reativada 12/05/2026 após 7 meses de silêncio
- Próximo passo: se não retornar até 15/05 → acionar Renato

### 12.3. Daniel Belintani — R$ 36.200 🟡
- Proposta: 09202565.0 | Vendedor: Guilherme
- Intermediária: arq. Andressa Kreusch
- Status: Comparativo final com +2 propostas — "dentro do previsto" (29/09/2025)
- Escopo: LPC CAD + Sketch + Scan + Tour Virtual + BIM SketchUp (sem elevações/cortes CAD)
- Decisão anunciada "essa semana" em 12/05/2026
- Lead arrastando 7 meses — em 12/05 foi oferecido ajuste de preço/condição

---

## 13. GLOSSÁRIO DE SERVIÇOS

| Serviço | O que é |
|---------|---------|
| Scan to BIM | Laser scanner → modelo BIM (Revit, ArchiCAD) |
| Scan to CAD | Idem, entrega CAD 2D (plantas/cortes) |
| LiDAR | Aerolevantamento com sensor laser — mapeia terreno com vegetação |
| Topografia | Levantamento planialtimétrico (estação total, GPS RTK) |
| Locação | Marcar pontos em campo a partir do projeto |
| Matterport | Tour virtual 3D estilo Street View para interiores |
| LPC | Levantamento Planialtimétrico Cadastral |
| Fachada | Escaneamento e modelagem de fachada |
| Automotivo | Escaneamento 3D de veículos/peças |
| GPR / Georadar | Radar de penetração no solo — detecta tubulações/estruturas enterradas |
| Batimetria | Topografia de fundo de corpo d'água |
| Tour Virtual | Walkthrough 3D navegável |
| Reality Capture | Termo guarda-chuva: captar realidade em 3D (foto, laser, drone) |

---

## 14. REPOSITÓRIOS GITHUB (toposcansend-cmyk)

| Repo | Linguagem | O que é |
|------|-----------|---------|
| CRM | HTML | CRM Toposcan v16 — gestão de pipeline e precificação |
| energiapro | JavaScript | App de eficiência energética para a Nexum IoT |
| IshTar.AI | TypeScript | Projeto em beta — detalhes a aprofundar |

**CRM deploy:** https://toposcansend-cmyk.github.io/CRM/
**EnergiaPro deploy:** GitHub Pages

### EnergiaPro
Produto da **Nexum IoT** (não da Toposcan), desenvolvido pela Toposcan.
Stack: HTML5/CSS3/JS vanilla, MiniMax M2.7 (IA), localStorage (MVP).
Fluxo: Perfil → Conta de energia (OCR) → Equipamentos → Diagnóstico IA → Dashboard.

---

## 15. WORKFLOWS COMUNS

### Pipeline
```
1. GET listAll → JSON dos registros ativos
2. Exportar Sheet completo para histórico (listAll não traz Perdida/Fechada)
3. Calcular forecast ponderado por vendedor
4. Identificar: propostas > R$50k paradas 10+ dias / Coverage < 2x / ciclo longo
```

### Novo lead
```
1. addLead com payload correto (chave "lead", não "data")
2. Update imediato para corrigir status (vem como "Perdida")
3. NÃO mandar "status" no update — cola manual no Sheet
```

### Follow-up
```
1. find por numeroProposta → ler estado atual
2. Calcular dias desde último follow-up
3. Cruzar com temperatura (quente/morno/frio/morto)
4. update apenas proximoFollowup e ultimoFollowup
5. Anotação real → cola manual em P (Observação)
```

### Briefing executivo (formato)
```
1. Visão Geral
2. Ranking de vendedores
3. 🔴 Alertas vermelhos (propostas críticas paradas)
4. 🟡 Atenção
5. 🟢 Oportunidades
6. Recomendações
7. Destaques
```

---

## 16. ARMADILHAS / LIÇÕES APRENDIDAS

1. Webhook POST sem redirect → falha silenciosa. Sempre two-step.
2. Payload `addLead` usa chave `lead`, não `data`.
3. `observacao`/`status` no update sobrescrevem coluna Status (O). Não usar.
4. `listAll` esconde Perdida/Fechada. Para histórico, exportar Sheet.
5. Coluna Status (O) tem validação restritiva + provável fórmula. Updates de Status = manual.
6. Ordem de assinatura no PDF não define dono. Default Guilherme para Tier 1.
7. Probabilidade vazia ≠ zero. Assumir 5%.
8. Propostas sem vendedor têm 24h. Cobrar atribuição.
9. Data atual sempre. Não inventar timestamps.
10. Não inventar dados. Faltou? Cobra. Não chuta.

---

## 17. O QUE NÃO FAZER

- ❌ Bajulação de qualquer espécie
- ❌ Preâmbulos antes da resposta
- ❌ `observacao` ou `status` no payload de update
- ❌ POST direto no webhook sem two-step
- ❌ Confiar em `listAll` para análise histórica
- ❌ Atribuir vendedor pela assinatura do PDF
- ❌ Inventar dados quando faltar
- ❌ Update em campo crítico sem ler estado antes
- ❌ Corporativês, eufemismo, frase morna

---

## 18. EVOLUÇÃO CONTÍNUA

Quando descobrir algo novo (bug, alias, atalho, padrão), registrar imediatamente:
- Fato sobre CRM/webhook → seções 3-6
- Fato sobre cliente/proposta → seção 12
- Lição operacional → seção 16
- Padrão de fluxo → seção 15

---

## 19. COMANDO DE INÍCIO DE SESSÃO

1. Ler este arquivo inteiro
2. Verificar data atual (GMT-3)
3. Se task envolver CRM: testar webhook com `listAll` antes
4. Se task envolver proposta específica: `find` primeiro, ler estado
5. Confirmar atribuição de vendedor em casos ambíguos

---

**FIM. Knowledge base viva > documento estático. Desatualizou? Atualiza.**
