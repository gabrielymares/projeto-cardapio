// ===== FUNÇÕES DE VALIDAÇÃO E TRATAMENTO DE ERRO =====
function mostrarErro(mensagem) {
    const container = document.getElementById('resultado-box');
    container.className = 'resultado-box erro';

    document.getElementById("resultado-pontos").textContent = "⚠️ Erro ao carregar dados";
    document.getElementById("resultado-texto").textContent = mensagem;
    document.getElementById("detalhes-extras").innerHTML = `
        <p><strong>O que fazer:</strong></p>
        <ol>
            <li>Volte e refaça o questionário</li>
            <li>Verifique se respondeu todas as perguntas</li>
            <li>Se o problema persistir, recarregue a página</li>
        </ol>
    `;

    // Esta linha estava causando um erro, pois o botão "btn-voltar" não existe.
    const btnVoltar = document.getElementById("btn-voltar");
    if(btnVoltar) {
        btnVoltar.style.display = 'inline-block';
    }

    document.getElementById("btn-prosseguir").style.display = 'none';
    document.getElementById("acoes-container").style.display = 'block';
}

function validarDados(dados) {
    const erros = [];

    if (typeof dados.pontuacao !== 'number' || isNaN(dados.pontuacao)) {
        erros.push('Pontuação inválida');
    }

    if (!dados.grupo || dados.grupo.trim() === '') {
        erros.push('Grupo não identificado');
    }

    if (!Array.isArray(dados.alergias)) {
        erros.push('Dados de alergias corrompidos');
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
            localStorage.setItem('ultimaAvaliacao', JSON.stringify({
                ...dados,
                visualizadoEm: new Date().toISOString()
            }));

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
            throw new Error('Nenhum dado de avaliação encontrado. Por favor, refaça o questionário.');
        }

        const dados = JSON.parse(dadosSalvos);

        // Validar dados
        const erros = validarDados(dados);
        if (erros.length > 0) {
            throw new Error(`Dados inválidos encontrados: ${erros.join(', ')}`);
        }

        // Exibir resultado com sucesso
        exibirResultado(dados);

    } catch (error) {
        console.error('Erro ao carregar resultados:', error);
        mostrarErro(error.message);
    }
}

function exibirResultado(dados) {
    // Remover estado de loading
    const container = document.getElementById('resultado-box');
    container.className = 'resultado-box sucesso';

    // Preencher dados principais
    document.getElementById("resultado-pontos").textContent = 
        `${dados.pontuacao} pontos - ${dados.grupo}`;

    document.getElementById("resultado-texto").innerHTML = 
        `🎯 Com base nas suas respostas, você obteve <strong>${dados.pontuacao} pontos</strong> e foi classificado no <strong>${dados.grupo}</strong>!`;

    // Mostrar detalhes extras
    let detalhesHTML = '';

    if (dados.alergias && dados.alergias.length > 0) {
        detalhesHTML += `
            <div style="margin-bottom: 15px;">
                <strong>🚫 Alergias identificadas:</strong>
                <ul>${dados.alergias.map(a => `<li>${a}</li>`).join('')}</ul>
            </div>
        `;
    }

    if (dados.restricoes && dados.restricoes.length > 0) {
        detalhesHTML += `
            <div style="margin-bottom: 15px;">
                <strong>⚠️ Restrições alimentares:</strong>
                <ul>${dados.restricoes.map(r => `<li>${r}</li>`).join('')}</ul>
            </div>
        `;
    }

    // Adicionar campos "Outros" se preenchidos
    if (dados.alergiaOutros) {
        detalhesHTML += `<p><strong>Outras alergias:</strong> ${dados.alergiaOutros}</p>`;
    }

    if (dados.restricaoOutros) {
        detalhesHTML += `<p><strong>Outras restrições:</strong> ${dados.restricaoOutros}</p>`;
    }

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