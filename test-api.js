const API_KEY = 'sk-cp-bL5nlnvGAcrScqjZNExBsxZ2Wr4toA3yC-8p-H39GEtyWFfSeKLTPImDMzZd0DjLFpebEDHQebX6waP_HEWqFlbu6rznk3bRn_xiJzLubt4kOMVsdeR4lp4';
const BASE_URL = 'https://api.minimax.io/v1/chat/completions';
const MODEL = 'MiniMax-M2.7'; // Or perhaps we need 'minimax-m2.7' depending on the exact casing, though MiniMax usually accepts it.

async function testLLM() {
  console.log("Iniciando teste da LLM MiniMax...");
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: 'Diga "A IA está funcionando!" e nada mais.' }],
        max_completion_tokens: 50,
        temperature: 0.1
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Erro HTTP:", response.status, err);
      return;
    }

    const data = await response.json();
    if (data.base_resp && data.base_resp.status_code !== 0) {
      console.error("Erro na API:", data.base_resp);
    } else {
      console.log("SUCESSO!");
      console.log("Resposta da IA:", data.choices[0].message.content);
    }
  } catch (err) {
    console.error("Erro no teste:", err);
  }
}

testLLM();
