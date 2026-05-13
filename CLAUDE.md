# Contexto Geral — Toposcan & Projetos

## Sobre a Toposcan (empresa do usuário)

**Toposcan** é a empresa proprietária deste repositório e responsável pelo desenvolvimento dos produtos.

- **Site:** www.toposcan.com.br
- **Segmento:** Agrimensura, escaneamento 3D e captura da realidade — setor de engenharia e construção civil
- **Fundadores:**
  - **Luiz Marcelo** Sperandio Ramos — agrimensor, especialista em georreferenciamento e laser scanner
  - **Guilherme** Conceição Becker — tecnologia e diretor comercial
- **Equipe comercial:** Guilherme, Marcelo, Allana
- **Experiência:** 10+ anos no mercado
- **Slogan:** "Onde a engenharia encontra a visão tecnológica"
- **Contato:** contato@toposcan.com.br

### Serviços da Toposcan

| Serviço | Descrição |
|---|---|
| Escaneamento 3D Georreferenciado | Nuvem de pontos, precisão milimétrica |
| Modelagem BIM | Modelos paramétricos (Revit, Civil 3D) |
| Serviços de Topografia | Drones, GNSS, laser scanner |
| Tour Virtual 360° | Documentação imersiva de obras e espaços |
| LiDAR | Levantamento aerotransportado |
| Projeto Misto | Combinação de serviços |

### Processo de trabalho (4 etapas)

1. **Briefing** — entendimento das necessidades do cliente
2. **Planejamento** — seleção tecnológica e cronograma
3. **Levantamento** — execução em campo com equipamentos avançados
4. **Entrega** — processamento e entrega dos produtos finais

### Público-alvo

Escritórios de engenharia, construtoras, incorporadoras e organizações que precisam de dados espaciais precisos.

---

## CRM Toposcan (toposcansend-cmyk/CRM)

CRM interno da Toposcan para gestão de oportunidades comerciais, versão v16.
Deploy: https://toposcansend-cmyk.github.io/CRM/

### Pipeline de vendas

| Estágio | Probabilidade |
|---|---|
| Lead | 20% |
| Enviada | 40% |
| Pendente | 60% |
| Quase Fechando | 80% |
| Fechada | 100% |
| Perdida | 0% |

### Campos de uma oportunidade

- Vendedor, Nº Proposta, Cliente, Contato, Telefone/Email
- Serviço, Localização, Data Proposta, Fechamento previsto
- Valor (R$), Probabilidade
- Último Follow-up, Próximo Follow-up, Observação

### Sistema de Precificação

Calcula o custo de projetos com base em:
1. Tipo de serviço (Scanner 3D, Topografia, LiDAR, Drone, Tour Virtual, BIM, Misto)
2. Localização e distância
3. Dias de operação e equipe
4. Equipamentos: Scanner (R$1.800/dia), Drone (R$600/dia), Matterport (R$750/dia)
5. Taxas, markup, descontos rápidos, comissões, integração Topopartner

### Funcionalidades

- Kanban visual do pipeline (visão mensal/trimestral/anual)
- Dashboard financeiro (faturamento acumulado, KPIs, evolução)
- Alertas de follow-up
- Histórico de orçamentos

---

## EnergiaPro (toposcansend-cmyk/energiapro)

Produto desenvolvido pela Toposcan para a **Nexum** (cliente/parceira).

- **Logo no app:** Nexum (`img/logo-nexum.png`)
- **Deploy:** GitHub Pages

### Stack

- Frontend: HTML5, CSS3, JavaScript vanilla (zero dependências)
- IA: MiniMax M2.7 (texto + visão)
- Persistência: localStorage (MVP)

### Fluxo do App (5 etapas)

1. Cadastro & Perfil do estabelecimento
2. Análise de conta de energia (foto → OCR com IA)
3. Mapeamento de equipamentos (foto → IA ou manual)
4. Diagnóstico & Insights (relatório gerado por IA)
5. Painel de Gestão (dashboard com KPIs e histórico)

---

## IshTar.AI (toposcansend-cmyk/IshTar.AI)

Projeto TypeScript em beta. Detalhes a aprofundar conforme acesso for liberado.

---

## Branch de desenvolvimento ativo

`claude/review-toposcan-automation-NxaUv` (repositório energiapro)
