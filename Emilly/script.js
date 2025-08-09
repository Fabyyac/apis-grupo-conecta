document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const saveApiKeyButton = document.getElementById('saveApiKey');
    const questionInput = document.getElementById('questionInput');
    const askButton = document.getElementById('askButton');
    const responseArea = document.getElementById('responseArea');

    // Carregar a API Key do localStorage ao iniciar
    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }

    // Salvar a API Key no localStorage
    saveApiKeyButton.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            localStorage.setItem('geminiApiKey', apiKey);
            alert('Chave da API salva com sucesso!');
        } else {
            alert('Por favor, insira uma chave de API válida.');
        }
    });
    
    // Enviar a pergunta para a API
    askButton.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        const question = questionInput.value.trim();

        if (!apiKey || !question) {
            alert('Por favor, preencha a chave da API e a pergunta.');
            return;
        }
        
        // Desabilitar o botão e mostrar que está carregando
        askButton.disabled = true;
        askButton.textContent = 'Carregando...';
        responseArea.textContent = 'Aguardando resposta da IA...';
        responseArea.style.display = 'block';

        const apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        
        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': apiKey
        },
        body: JSON.stringify({
            "contents": [
                {
                    "parts": [
                        {
                            "text": question
                        }
                    ]
                }
            ]
         })
        });

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            // Extrair e exibir a resposta 
            const aiResponse = data.candidates[0].content.parts[0].text;;
            responseArea.textContent = aiResponse;
            
        } catch (error) {
            // Exibir mensagens de erro amigáveis
            responseArea.textContent = `Erro: ${error.message}. Verifique sua chave de API e a conexão.`;
        } finally {
            // Reabilitar o botão ao final
            askButton.disabled = false;
            askButton.textContent = 'Perguntar';
        }
    });

    // Atalho de teclado para enviar (Ctrl + Enter)
    questionInput.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 'Enter') {
            askButton.click();
        }
    });
});