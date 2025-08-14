window.onload = () => {
  const enviar = document.getElementById("enviar");
  const limpar = document.getElementById("limpar");
  const copiarBtn = document.getElementById("copiar");
  const perguntaInput = document.getElementById("pergunta");
  const apiKeyInput = document.getElementById("apiKey");
  const respostaContainer = document.getElementById("respostaContainer");
  const respostaDiv = document.getElementById("resposta");
  const status = document.getElementById("status");

  async function enviarPergunta() {
    const pergunta = perguntaInput.value.trim();
    const apiKey = apiKeyInput.value.trim();

    if (!apiKey || !pergunta) {
      alert("Preencha todos os campos!");
      return;
    }

    status.textContent = "Carregando...";
    respostaContainer.style.display = "none";
    enviar.disabled = true;

    try {
      const resposta = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              { parts: [{ text: pergunta }] }
            ]
          })
        }
      );

      const data = await resposta.json();

      if (!resposta.ok) {
        respostaDiv.textContent = `Erro: ${data.error?.message || "Erro desconhecido"}`;
      } else if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
        respostaDiv.textContent = data.candidates[0].content.parts[0].text;
      } else {
        respostaDiv.textContent = "Nenhuma resposta recebida.";
      }

      respostaContainer.style.display = "block";

    } catch (erro) {
      respostaDiv.textContent = "Erro de conexão.";
      respostaContainer.style.display = "block";
    }

    status.textContent = "";
    enviar.disabled = false;
  }

  copiarBtn.addEventListener("click", () => {
    const texto = respostaDiv.textContent;
    if (!texto) {
      alert("Não há resposta para copiar.");
      return;
    }
    navigator.clipboard.writeText(texto)
      .then(() => alert("Resposta copiada!"))
      .catch(() => alert("Erro ao copiar."));
  });

  enviar.addEventListener("click", enviarPergunta);

  limpar.addEventListener("click", () => {
    perguntaInput.value = "";
    respostaDiv.textContent = "";
    respostaContainer.style.display = "none";
  });

  perguntaInput.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "Enter") {
      enviarPergunta();
    }
  });
};