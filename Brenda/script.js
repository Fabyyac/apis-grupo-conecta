
const apiKeyInput = document.getElementById('apikey');
const perguntaInput = document.getElementById('pergunta');
const btnPerguntar = document.getElementById('btnPerguntar');
const respostaDiv = document.getElementById('resposta');
const btnCopiar = document.getElementById('btnCopiar');
const btnLimpar = document.getElementById('btnLimpar');
const acoesDiv = document.querySelector('.botoes-acoes');


async function buscarRespostaDaIA(apiKey, pergunta) {
  const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [{ text: pergunta }]
      }
    ]
  };

  try {
    const resposta = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await resposta.json();

    if (!resposta.ok) {
      throw new Error(data.error?.message || "Erro desconhecido");
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ Resposta vazia.";
  } catch (err) {
    console.error("❌ Erro na API Gemini:", err);
    throw err;
  }
}


btnPerguntar.addEventListener('click', async () => {
  const apiKey = apiKeyInput.value.trim();
  const pergunta = perguntaInput.value.trim();

  if (!apiKey || !pergunta) {
    alert("Por favor, preencha a API Key e a pergunta.");
    return;
  }

  btnPerguntar.disabled = true;
  btnPerguntar.textContent = "Carregando...";
  respostaDiv.style.display = "block";
  respostaDiv.textContent = "";

  try {
    const resposta = await buscarRespostaDaIA(apiKey, pergunta);
    respostaDiv.innerHTML = `
      <strong>Sua pergunta:</strong><br>${pergunta}<br><br>
      <strong>Resposta da IA:</strong><br>${resposta}
    `;
    acoesDiv.style.display = "flex";
  } catch (erro) {
    respostaDiv.innerHTML = `
      ❌ Ocorreu um erro: ${erro.message || "Não foi possível se conectar à IA."}
    `;
    acoesDiv.style.display = "none";
  }

  btnPerguntar.disabled = false;
  btnPerguntar.textContent = "Perguntar";
});


perguntaInput.addEventListener('keydown', function (e) {
  if (e.ctrlKey && e.key === 'Enter') {
    btnPerguntar.click();
  }
});


btnCopiar.addEventListener('click', () => {
  const texto = respostaDiv.textContent;
  navigator.clipboard.writeText(texto)
    .then(() => alert("Resposta copiada!"))
    .catch(err => alert("Erro ao copiar: " + err));
});


btnLimpar.addEventListener('click', () => {
  respostaDiv.textContent = "";
  perguntaInput.value = "";
  acoesDiv.style.display = "none";
});


function salvarApiKey() {
  const chave = apiKeyInput.value.trim();
  if (chave) {
    localStorage.setItem('gemini_key', chave);
    alert("API Key salva com sucesso!");
  } else {
    alert("Digite uma API Key válida.");
  }
}


window.addEventListener('DOMContentLoaded', () => {
  const chaveSalva = localStorage.getItem('gemini_key');
  if (chaveSalva) {
    apiKeyInput.value = chaveSalva;
  }
});
