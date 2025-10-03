// ===== FUNÇÕES DE VALIDAÇÃO E TRATAMENTO DE ERRO =====
function mostrarErro(mensagem) {
    const container = document.getElementById('resultado-box');
    container.className = 'resultado-box erro';

    document.getElementById("resultado-pontos").textContent = "⚠️ Erro ao carregar dados";
    document.getElementById("resultado-texto").textContent = mensagem;
    document.getElementById("detalhes-extras").innerHTML = `
        <p><strong>O que fazer:</strong></p>
        <ol>
            <li>Volte e refaça o questionário (Página anterior)</li>
            <li>Verifique se respondeu todas as perguntas</li>
            <li>Se o problema persistir, recarregue a página</li>
        </ol>
    `;

    // O botão de prosseguir deve sumir em caso de erro
    const btnProsseguir = document.getElementById("btn-prosseguir");
    if(btnProsseguir) {
        btnProsseguir.style.display = 'none';
    }
    document.getElementById("acoes-container").style.display = 'block';
}

function validarDados(dados) {
    const erros = [];

    // Adaptação: Verifica se os campos de pontuação e grupo existem no novo formato
    if (typeof dados.pontuacao !== 'number' || isNaN(dados.pontuacao)) {
        erros.push('Pontuação inválida');
    }

    if (!dados.grupo || dados.grupo.trim() === '') {
        erros.push('Grupo não identificado');
    }

    // Adaptação: O novo campo de alergias é p2_alergia
    if (!Array.isArray(dados.p2_alergia)) {
        erros.push('Dados de alergias corrompidos');
    }
    
    // Opcional: Adiciona verificação para as novas respostas de texto
    if (typeof dados.p8_alimentos_evita === 'undefined') {
        erros.push('Dados de hábitos alimentares incompletos');
    }

    return erros;
}

// ===== CARREGAMENTO PRINCIPAL =====
document.addEventListener('DOMContentLoaded', () => {
    // Simular um pequeno delay de loading (UX)
    setTimeout(() => {
        carregarResultados();
    }, 800);

    // ===== EVENT LISTENER PARA O BOTÃO PROSSEGUIR =====
    const botaoProsseguir = document.getElementById('btn-prosseguir');
    if (botaoProsseguir) {
        botaoProsseguir.addEventListener('click', () => {
            // Salvar dados para possível consulta futura
            const dados = JSON.parse(sessionStorage.getItem('resultadoAvaliacao'));
            if (dados) {
                localStorage.setItem('ultimaAvaliacao', JSON.stringify({
                    ...dados,
                    visualizadoEm: new Date().toISOString()
                }));
            }

            // Limpar dados da sessão atual
            sessionStorage.removeItem('resultadoAvaliacao');

            // Redirecionar
            window.location.href = "../paginainicial/paginainicial.html";
        });
    } else {
        console.error("Botão com o ID 'btn-prosseguir' não foi encontrado.");
    }
});

function carregarResultados() {
    try {
        // Recuperar dados do sessionStorage
        const dadosSalvos = sessionStorage.getItem('resultadoAvaliacao');

        if (!dadosSalvos) {
            throw new Error('Nenhum dado de avaliação encontrado. Por favor, volte e refaça o questionário.');
        }

        const dados = JSON.parse(dadosSalvos);

        // Validar dados
        const erros = validarDados(dados);
        if (erros.length > 0) {
            // Se houver erros, ainda assim tenta exibir o que foi coletado com uma mensagem de alerta
            exibirResultado(dados, true); // Passa true para forçar o modo de alerta
            return;
        }

        // Exibir resultado com sucesso
        exibirResultado(dados, false);

    } catch (error) {
        console.error('Erro ao carregar resultados:', error);
        mostrarErro(error.message);
    }
}

function exibirResultado(dados, isWarning = false) {
    // Remover estado de loading e aplicar sucesso/alerta
    const container = document.getElementById('resultado-box');
    container.className = isWarning ? 'resultado-box erro' : 'resultado-box sucesso';

    // --- 1. Preencher dados principais (Pontuação e Grupo) ---
    document.getElementById("resultado-pontos").textContent = 
        isWarning ? "⚠️ Dados Inconsistentes" : `${dados.pontuacao} pontos - ${dados.grupo}`;

    document.getElementById("resultado-texto").innerHTML = 
        isWarning 
        ? `Seus dados foram salvos, mas houve inconsistências. Revise o questionário. Pontuação calculada: <strong>${dados.pontuacao}</strong>.`
        : `🎯 Com base nas suas respostas, você obteve <strong>${dados.pontuacao} pontos</strong> e foi classificado no <strong>${dados.grupo}</strong>!`;

    // --- 2. Montar Detalhes Extras ---
    let detalhesHTML = '';

    // Detalhes de Alergias (p2_alergia)
    const alergias = Array.isArray(dados.p2_alergia) ? dados.p2_alergia : [];
    if (alergias.length > 0) {
        const nomesAlergias = alergias.map(a => {
            if (a === 'lactose') return 'Leite / Lactose';
            if (a === 'gluten') return 'Glúten';
            return a; // Mantém "outros" ou outros valores
        });

        detalhesHTML += `
            <div style="margin-bottom: 15px;">
                <strong>🚫 Alergias e Intolerâncias:</strong>
                <ul>${nomesAlergias.map(a => `<li>${a}</li>`).join('')}</ul>
            </div>
        `;
    }

    // Campo de texto de Alergias Outras (p2_outros)
    const alergiaOutros = dados.p2_alergia_outros || '';
    if (alergiaOutros.trim()) {
        detalhesHTML += `<p><strong>Outras Alergias/Intolerâncias:</strong> ${alergiaOutros}</p>`;
    }
    
    // Campo de texto de Restrição Médica (p3_outros) e Doença (p1_outros)
    const restricaoMedica = dados.p3_restricao_outros || '';
    const doencaDiagnosticada = dados.p1_doenca_outros || '';

    if (dados.p3_restricao === 'sim' && restricaoMedica.trim()) {
         detalhesHTML += `<p><strong>⚠️ Restrição por Orientação Médica:</strong> ${restricaoMedica}</p>`;
    }
    
    if (dados.p1_doenca === 'sim' && doencaDiagnosticada.trim()) {
         detalhesHTML += `<p><strong>🩺 Doença(s) Diagnosticada(s):</strong> ${doencaDiagnosticada}</p>`;
    }
    
    // Objetivo (p6_objetivo)
    const objetivos = Array.isArray(dados.p6_objetivo) ? dados.p6_objetivo : [];
    if (objetivos.length > 0) {
        // Formata os valores para exibição (ex: 'ganhar_massa' -> 'Ganhar Massa Muscular')
        const nomesObjetivos = objetivos.map(o => o.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
        detalhesHTML += `
            <div style="margin-top: 15px;">
                <strong>💡 Seus Objetivos:</strong>
                <ul>${nomesObjetivos.map(o => `<li>${o}</li>`).join('')}</ul>
            </div>
        `;
    }
    
    // Respostas de texto (Q8 e Q9)
    const alimentosEvita = dados.p8_alimentos_evita || 'Não especificado';
    const alimentosFrequentes = dados.p9_frequencia || 'Não especificado';
    
    detalhesHTML += `
        <hr style="margin: 15px 0; border-top: 1px solid #ccc;">
        <p><strong>Alimentos que evita:</strong> ${alimentosEvita}</p>
        <p><strong>Alimentos/Bebidas mais frequentes:</strong> ${alimentosFrequentes}</p>
    `;

    // Adicionar timestamp
    if (dados.timestamp) {
        const dataAvaliacao = new Date(dados.timestamp).toLocaleString('pt-BR');
        detalhesHTML += `<p style="color: #666; font-size: 12px; margin-top: 20px;">Avaliação realizada em: ${dataAvaliacao}</p>`;
    }

    document.getElementById("detalhes-extras").innerHTML = detalhesHTML;

    // Mostrar botões de ação
    document.getElementById("acoes-container").style.display = 'block';
}

// ===== TRATAMENTO DE ERRO DE PÁGINA =====
window.addEventListener('error', (e) => {
    console.error('Erro na página:', e.error);
    mostrarErro('Ocorreu um erro inesperado. Tente recarregar a página.');
});
