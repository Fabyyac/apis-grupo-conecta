document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const saveApiKeyButton = document.getElementById('saveApiKey');
    const questionInput = document.getElementById('questionInput');
    const askButton = document.getElementById('askButton');
    const responseArea = document.getElementById('responseArea');
    const userQuestionText = document.getElementById('userQuestionText');
    const aiResponseText = document.getElementById('aiResponseText');
    const btnCopy = document.getElementById('btnCopy');
    const btnClear = document.getElementById('btnClear');
    const themeToggle = document.getElementById('themeToggle');
    const toggleHistoryBtn = document.getElementById('toggleHistory');
    const historyContainer = document.getElementById('history-container');
    const historyTabs = document.getElementById('historyTabs');
    const clearAllHistoryBtn = document.getElementById('clearAllHistory');

    let conversationHistory = [];
    const maxChars = 1000;
    

    const loadConversationHistory = () => {
        const savedHistory = localStorage.getItem('conversationHistory');
        if (savedHistory) {
            conversationHistory = JSON.parse(savedHistory);
            renderHistoryTabs();
            // Exibir a última conversa ao carregar
            if (conversationHistory.length > 0) {
                displayConversation(conversationHistory.length - 1);
            }
        }
    };

    const saveConversationHistory = () => {
        localStorage.setItem('conversationHistory', JSON.stringify(conversationHistory));
        renderHistoryTabs();
    };

    const renderHistoryTabs = () => {
        historyTabs.innerHTML = '';
        if (conversationHistory.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = 'Nenhum histórico encontrado.';
            emptyMessage.style.fontStyle = 'italic';
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.color = 'var(--secondary-text)';
            historyTabs.appendChild(emptyMessage);
            clearAllHistoryBtn.style.display = 'none';
            return;
        }
        
        clearAllHistoryBtn.style.display = 'block';

        conversationHistory.forEach((item, index) => {
            const li = document.createElement('li');
            li.classList.add('history-tab');
            li.textContent = item.userQuestion.substring(0, 30) + '...';
            li.dataset.index = index;
            historyTabs.appendChild(li);
        });
    };

    const displayConversation = (index) => {
        const conversation = conversationHistory[index];
        userQuestionText.textContent = `Você perguntou: ${conversation.userQuestion}`;
        aiResponseText.innerHTML = marked.parse(conversation.aiResponse);
        responseArea.style.display = 'block';
        
        document.querySelectorAll('.history-tab').forEach(tab => tab.classList.remove('active'));
        const activeTab = historyTabs.querySelector(`li[data-index="${index}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    };

    // Alternar o tema (Dark/Light Mode)
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            localStorage.setItem('theme', 'light');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    });

    // Abrir/Fechar o histórico
    toggleHistoryBtn.addEventListener('click', () => {
        historyContainer.classList.toggle('active');
    });

    // Selecionar uma conversa do histórico
    historyTabs.addEventListener('click', (event) => {
        const tab = event.target.closest('.history-tab');
        if (tab) {
            const index = parseInt(tab.dataset.index);
            displayConversation(index);
        }
    });
    
    // Limpar conversa atual
    btnClear.addEventListener('click', () => {
        const confirmClear = confirm('Tem certeza que deseja limpar esta conversa da tela?');
        if (confirmClear) {
            responseArea.style.display = 'none';
        }
    });
    
    // Limpar todo o histórico
    clearAllHistoryBtn.addEventListener('click', () => {
        const confirmClear = confirm('Tem certeza que deseja apagar todo o histórico de conversas? Esta ação é irreversível.');
        if (confirmClear) {
            localStorage.removeItem('conversationHistory');
            conversationHistory = [];
            renderHistoryTabs();
            responseArea.style.display = 'none';
        }
    });

    // Copiar a resposta
    btnCopy.addEventListener('click', async () => {
        const textToCopy = aiResponseText.textContent;
        const copyIcon = btnCopy.querySelector('i');
        const originalText = btnCopy.textContent;
        
        try {
            await navigator.clipboard.writeText(textToCopy);
            copyIcon.classList.remove('fa-copy');
            copyIcon.classList.add('fa-check');
            btnCopy.textContent = 'Copiado!';

            setTimeout(() => {
                copyIcon.classList.remove('fa-check');
                copyIcon.classList.add('fa-copy');
                btnCopy.textContent = originalText;
            }, 1000);
        } catch (err) {
            console.error('Falha ao copiar:', err);
            alert('Erro ao copiar a resposta. Por favor, tente novamente.');
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
        
        askButton.disabled = true;
        askButton.textContent = 'Carregando...';

        const provider = apiProvider.value;
        const apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

        let requestBody = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": question
                        }
                    ]
                }
            ]
        };
        
        try {
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': apiKey
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const aiResponse = data.candidates[0].content.parts[0].text;
            
            conversationHistory.push({
                userQuestion: question,
                aiResponse: aiResponse
            });

            saveConversationHistory();
            displayConversation(conversationHistory.length - 1);
            
        } catch (error) {
            alert(`Erro: ${error.message}. Verifique sua chave de API e a conexão.`);
        } finally {
            askButton.disabled = false;
            askButton.textContent = 'Perguntar';
            questionInput.value = '';
        }
    });
    
    // Contador de caracteres
    const charCount = document.getElementById('charCount');
    questionInput.addEventListener('input', () => {
        const currentLength = questionInput.value.length;
        charCount.textContent = `${currentLength}/${maxChars}`;
    });

    // Atalho de teclado para enviar (Ctrl + Enter)
    questionInput.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 'Enter') {
            askButton.click();
        }
    });

    const savedApiKey = localStorage.getItem('geminiApiKey');
    if (savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }
    loadThemePreference();
    loadConversationHistory();
});

const loadThemePreference = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i>';
    }
};