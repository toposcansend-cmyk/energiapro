/* ============================================
   EnergiaPro — MiniMax API Integration
   ============================================ */

const API = {
  BASE_URL: 'https://api.minimax.io/v1/chat/completions',
  API_KEY: 'sk-cp-bL5nlnvGAcrScqjZNExBsxZ2Wr4toA3yC-8p-H39GEtyWFfSeKLTPImDMzZd0DjLFpebEDHQebX6waP_HEWqFlbu6rznk3bRn_xiJzLubt4kOMVsdeR4lp4',
  MODEL: 'MiniMax-M2.7',

  // System prompt base
  SYSTEM_PROMPT: `Você é o EnergiaPro AI, um consultor especialista em eficiência energética para comércios no Brasil.
Você possui amplo conhecimento sobre:
- Tarifação de energia elétrica brasileira (Grupo A e B, bandeiras tarifárias, ICMS, PIS/COFINS, CIP)
- Análise de contas de energia (consumo, demanda, multas, créditos)
- Equipamentos elétricos comerciais e seus consumos típicos
- Selo Procel e eficiência energética de equipamentos
- Mercado Livre de Energia (elegibilidade, migração, economia)
- Geração distribuída e energia solar
- Melhores práticas de economia de energia para comércios
Responda sempre em português brasileiro. Seja preciso, prático e objetivo.`,

  // Chat completion (text only)
  async chat(userMessage, systemOverride = null) {
    const messages = [
      { role: 'system', content: systemOverride || this.SYSTEM_PROMPT },
      { role: 'user', content: userMessage }
    ];
    return this._request(messages);
  },

  // Vision analysis (image + text)
  async analyzeImage(base64DataUrl, prompt, systemOverride = null) {
    const messages = [
      { role: 'system', content: systemOverride || this.SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: base64DataUrl } }
        ]
      }
    ];
    return this._request(messages);
  },

  // Internal request handler
  async _request(messages) {
    try {
      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          model: this.MODEL,
          messages: messages,
          max_completion_tokens: 2048,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.base_resp?.status_msg || `Erro HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.base_resp && data.base_resp.status_code !== 0) {
        throw new Error(data.base_resp.status_msg || 'Erro na API MiniMax');
      }

      const content = data.choices?.[0]?.message?.content || '';
      // Remove thinking blocks from response
      const cleanContent = content.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
      return { success: true, content: cleanContent, usage: data.usage };

    } catch (error) {
      console.error('API Error:', error);
      return { success: false, error: error.message };
    }
  },

  // --- Specialized Prompts ---

  // Analyze energy bill from image
  async analyzeBill(imageBase64) {
    const prompt = `Analise esta imagem de conta de energia elétrica brasileira e extraia os dados em formato JSON com as seguintes chaves (use null se não encontrar o dado):

{
  "concessionaria": "nome da distribuidora",
  "unidade_consumidora": "número da UC",
  "nome_titular": "nome do titular",
  "endereco": "endereço",
  "mes_referencia": "MM/AAAA",
  "grupo_tarifario": "A ou B + subgrupo",
  "modalidade": "convencional, branca, horosazonal verde/azul",
  "consumo_total_kwh": 0,
  "consumo_ponta_kwh": 0,
  "consumo_fora_ponta_kwh": 0,
  "demanda_contratada_kw": 0,
  "demanda_medida_kw": 0,
  "tarifa_media_rs_kwh": 0.00,
  "bandeira_tarifaria": "verde/amarela/vermelha1/vermelha2",
  "valor_bandeira_rs": 0.00,
  "valor_energia_rs": 0.00,
  "icms_rs": 0.00,
  "pis_cofins_rs": 0.00,
  "cip_cosip_rs": 0.00,
  "multas_rs": 0.00,
  "creditos_geracao_rs": 0.00,
  "energia_injetada_kwh": 0,
  "valor_total_rs": 0.00,
  "observacoes": "qualquer irregularidade ou dado relevante identificado"
}

Retorne APENAS o JSON, sem explicações adicionais.`;

    return this.analyzeImage(imageBase64, prompt);
  },

  // Identify equipment from image
  async identifyEquipment(imageBase64) {
    const prompt = `Analise esta imagem de um equipamento elétrico/eletrônico e identifique. Retorne em formato JSON:

{
  "tipo": "tipo do equipamento (ex: ar-condicionado, geladeira, forno elétrico, etc)",
  "marca": "marca (se visível)",
  "modelo": "modelo (se visível)",
  "potencia_watts": 0,
  "tensao_volts": 0,
  "classe_eficiencia": "A/B/C/D/E (se visível no selo Procel)",
  "horas_uso_diario_estimado": 0,
  "vida_util_anos_estimado": 0,
  "recomendacoes": ["dica 1", "dica 2"]
}

Se não conseguir identificar com certeza, faça uma estimativa baseada no que é visível. Retorne APENAS o JSON.`;

    return this.analyzeImage(imageBase64, prompt);
  },

  // Generate full diagnostic
  async generateDiagnostic(profileData, billData, equipments) {
    const prompt = `Com base nos dados abaixo, gere um diagnóstico completo de eficiência energética em JSON:

PERFIL DO ESTABELECIMENTO:
${JSON.stringify(profileData, null, 2)}

DADOS DA ÚLTIMA CONTA DE ENERGIA:
${JSON.stringify(billData, null, 2)}

EQUIPAMENTOS MAPEADOS:
${JSON.stringify(equipments, null, 2)}

Retorne em JSON com esta estrutura:
{
  "iee_kwh_m2": 0,
  "iee_benchmark_setor": 0,
  "score_eficiencia": 0,
  "classificacao": "Excelente/Bom/Regular/Ruim/Crítico",
  "consumo_estimado_equipamentos_kwh": 0,
  "divergencia_consumo_percent": 0,
  "insights": [
    {
      "prioridade": "verde/amarela/vermelha",
      "titulo": "título da ação",
      "descricao": "descrição detalhada",
      "economia_mensal_rs": 0,
      "economia_anual_rs": 0,
      "investimento_rs": 0,
      "payback_meses": 0
    }
  ],
  "mercado_livre": {
    "elegivel": true,
    "economia_estimada_percent": 0,
    "economia_estimada_rs_mes": 0,
    "requisitos_atendidos": ["req1"],
    "requisitos_pendentes": ["req1"],
    "proximo_passo": "texto"
  },
  "geracao_solar": {
    "recomendado": true,
    "potencia_sugerida_kwp": 0,
    "economia_estimada_rs_mes": 0,
    "investimento_estimado_rs": 0,
    "payback_anos": 0
  },
  "dicas_gerais": ["dica 1", "dica 2", "dica 3"],
  "resumo_executivo": "Um parágrafo resumindo o diagnóstico"
}

Retorne APENAS o JSON, sem explicações adicionais.`;

    return this.chat(prompt);
  }
};
