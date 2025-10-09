// Variáveis globais
let diaAtual = null;
let refeicaoEditando = null;
let semanaAtual = 1;
let clienteAtual = 0; // Inicializado como 0, se não houver na URL

// Inicializar página
document.addEventListener('DOMContentLoaded', () => {
    // Pegar semana e cliente da URL
    const urlParams = new URLSearchParams(window.location.search);
    semanaAtual = parseInt(urlParams.get('semana')) || 1;
    clienteAtual = parseInt(urlParams.get('cliente')) || 0;
    
    // 🚨 MELHORIA APLICADA: Exibe o ID do Cliente no título da página
    const tituloElemento = document.getElementById('tituloSemana');
    
    if (clienteAtual > 0) {
        tituloElemento.textContent = `Semana ${semanaAtual} (Cliente ID: ${clienteAtual})`;
    } else {
        // Alerta o nutricionista que ele precisa especificar um cliente
        tituloElemento.textContent = `Semana ${semanaAtual} (ERRO: Cliente não identificado)`;
        console.error("Cliente ID não encontrado na URL. A edição não está vinculada a um cliente específico.");
        // Se precisar forçar a seleção de um cliente, você pode adicionar um 'return' aqui.
    }
    
    renderizarDias();
});

// ... (O restante da função renderizarDias e criarCardDia continua o mesmo) ...

// O restante do código JS que salva e lê o cardápio está correto,
// desde que o ID do cliente seja passado na URL.
// Por exemplo: semana.html?cliente=10&semana=1
// Isso garante que os dados serão salvos em 'cardapio_cliente10'.
// semana.js - Inicialização Corrigida

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    semanaAtual = parseInt(urlParams.get('semana')) || 1;
    clienteAtual = parseInt(urlParams.get('cliente')) || 0;
    
    // 🚨 IMPLEMENTAÇÃO CRÍTICA: Se não houver um ID de cliente válido, interrompa
    if (clienteAtual <= 0) {
        alert("Erro: É necessário especificar o ID do cliente na URL (ex: ?cliente=10).");
        // Opcional: Redirecionar ou desabilitar a edição
        // return; 
    }
    
    document.getElementById('tituloSemana').textContent = `Semana ${semanaAtual} (Cliente ${clienteAtual})`; 
    
    renderizarDias();
});

// Renderizar todos os dias da semana
function renderizarDias() {
    const container = document.getElementById('diasContainer');
    container.innerHTML = '';
    
    for (let dia = 1; dia <= 7; dia++) {
        const diaCard = criarCardDia(dia);
        container.appendChild(diaCard);
    }
}

// Criar card de um dia
function criarCardDia(numeroDia) {
    const cardapio = getCardapio();
    let refeicoesDoDia = cardapio[`semana${semanaAtual}`]?.[`dia${numeroDia}`] || [];
    
    // Ordena as refeições para garantir a ordem correta na renderização inicial
    refeicoesDoDia.sort((a, b) => {
        if (a.horario < b.horario) return -1;
        if (a.horario > b.horario) return 1;
        return 0;
    });

    // Verificar progresso do cliente neste dia
    const progressoDia = obterProgressoDia(numeroDia);
    
    const card = document.createElement('div');
    card.className = 'dia-card';
    
    card.innerHTML = `
        <div class="dia-header" onclick="toggleDia(${numeroDia})">
            <div style="display: flex; align-items: center; gap: 10px;">
                <h2 class="dia-titulo">DIA ${numeroDia}</h2>
                ${renderizarIndicadorProgresso(progressoDia, refeicoesDoDia.length)}
            </div>
            <span class="toggle-icon" id="toggle-${numeroDia}">+</span>
        </div>
        <div class="conteudo-dia" id="conteudo-${numeroDia}">
            <div class="refeicoes-list" id="refeicoes-${numeroDia}">
                ${renderizarRefeicoes(refeicoesDoDia, numeroDia)}
            </div>
            <button class="btn-adicionar" onclick="abrirModal(${numeroDia})">+ Adicionar Refeição</button>
        </div>
    `;
    
    return card;
}

// Obter progresso do cliente em um dia específico
function obterProgressoDia(dia) {
    const chave = `status_refeicoes_cliente${clienteAtual}_s${semanaAtual}_d${dia}`;
    const status = localStorage.getItem(chave);
    
    if (!status) return { completas: 0, total: 0, porcentagem: 0 };
    
    const statusArray = JSON.parse(status);
    const completas = statusArray.filter(s => s).length;
    // O total de refeições do dia deve ser buscado do cardápio
    const cardapio = getCardapio();
    const refeicoesDoDia = cardapio[`semana${semanaAtual}`]?.[`dia${dia}`] || [];
    const total = refeicoesDoDia.length; 
    
    const porcentagem = total > 0 ? Math.round((completas / total) * 100) : 0;
    
    return { completas, total, porcentagem };
}

// Renderizar indicador de progresso (sinalizinho)
function renderizarIndicadorProgresso(progresso, totalRefeicoes) {
    if (totalRefeicoes === 0) {
        return ''; // Não mostra nada se não há refeições cadastradas
    }
    
    if (progresso.total === 0) {
        return `<span style="color: #9e9e9e; font-size: 0.85em;">⭕ Aguardando</span>`;
    }
    
    if (progresso.porcentagem === 100) {
        return `<span style="color: #4caf50; font-size: 1.2em;" title="Todas as refeições concluídas">✅</span>`;
    } else if (progresso.porcentagem > 0) {
        return `<span style="color: #ff9800; font-size: 1em;" title="${progresso.completas}/${progresso.total} refeições">🟡 ${progresso.completas}/${progresso.total}</span>`;
    }
    
    return '';
}

// Renderizar lista de refeições
function renderizarRefeicoes(refeicoes, dia) {
    if (refeicoes.length === 0) {
        return '<p class="mensagem-vazio">Nenhuma refeição cadastrada</p>';
    }
    
    // 🚨 Melhoria: Garantir que a lista de status do cliente é carregada para a renderização do ícone
    const chave = `status_refeicoes_cliente${clienteAtual}_s${semanaAtual}_d${dia}`;
    const statusStr = localStorage.getItem(chave);
    const status = statusStr ? JSON.parse(statusStr) : [];
    
    return refeicoes.map((ref, index) => {
        // Usa o index da refeição na lista atual para checar o status
        const foiConcluida = status[index] || false; 
        const classeStatus = foiConcluida ? 'refeicao-concluida' : '';
        const indicador = foiConcluida ? '✓' : '○';
        const corIndicador = foiConcluida ? '#4caf50' : '#ccc';
        
        return `
        <div class="refeicao-item ${classeStatus}">
            <span style="color: ${corIndicador}; font-size: 1.5em; margin-right: 10px;" title="${foiConcluida ? 'Concluída pelo cliente' : 'Aguardando conclusão'}">${indicador}</span>
            <button class="btn-editar-refeicao" onclick="editarRefeicao(${dia}, ${index})">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
            </button>
            <div class="refeicao-tipo">${ref.tipo}</div>
            <div class="refeicao-horario">Horário: ${ref.horario}</div>
            <div class="refeicao-detalhe">Refeições: ${ref.alimento}</div>
            <div class="refeicao-detalhe"><strong>Quantidade: ${ref.quantidade}</strong></div>
        </div>
    `;
    }).join('');
}

// Toggle (abrir/fechar) dia
function toggleDia(numeroDia) {
    const conteudo = document.getElementById(`conteudo-${numeroDia}`);
    const toggle = document.getElementById(`toggle-${numeroDia}`);
    
    conteudo.classList.toggle('expanded');
    toggle.classList.toggle('rotated');
}

// Abrir modal para adicionar refeição
function abrirModal(dia, refeicaoIndex = null) {
    diaAtual = dia;
    refeicaoEditando = refeicaoIndex;
    
    const modal = document.getElementById('modalRefeicao');
    modal.classList.add('active');
    
    if (refeicaoIndex !== null) {
        // Modo edição
        document.getElementById('modalTitulo').textContent = 'Editar Refeição';
        const cardapio = getCardapio();
        
        // Garante que o cardápio existe antes de tentar acessar
        const refeicoes = cardapio[`semana${semanaAtual}`]?.[`dia${dia}`];
        if (!refeicoes || !refeicoes[refeicaoIndex]) {
             console.error("Refeição não encontrada para edição.");
             fecharModal();
             return;
        }
        
        const refeicao = refeicoes[refeicaoIndex];
        
        document.getElementById('tipoRefeicao').value = refeicao.tipo;
        document.getElementById('horario').value = refeicao.horario;
        document.getElementById('alimento').value = refeicao.alimento;
        document.getElementById('gramas').value = refeicao.quantidade;
    } else {
        // Modo adicionar
        document.getElementById('modalTitulo').textContent = 'Adicionar Refeição';
        document.getElementById('tipoRefeicao').value = 'Café da manhã';
        document.getElementById('horario').value = '';
        document.getElementById('alimento').value = '';
        document.getElementById('gramas').value = '';
    }
}

// Fechar modal
function fecharModal() {
    const modal = document.getElementById('modalRefeicao');
    modal.classList.remove('active');
    diaAtual = null;
    refeicaoEditando = null;
}

// Salvar refeição
function salvarRefeicao() {
    const tipo = document.getElementById('tipoRefeicao').value;
    const horario = document.getElementById('horario').value;
    const alimento = document.getElementById('alimento').value;
    const quantidade = document.getElementById('gramas').value;
    
    if (!horario || !alimento || !quantidade) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    const novaRefeicao = {
        tipo,
        horario,
        alimento,
        quantidade
    };
    
    const cardapio = getCardapio();
    
    // Garantir que a estrutura existe
    if (!cardapio[`semana${semanaAtual}`]) {
        cardapio[`semana${semanaAtual}`] = {};
    }
    if (!cardapio[`semana${semanaAtual}`][`dia${diaAtual}`]) {
        cardapio[`semana${semanaAtual}`][`dia${diaAtual}`] = [];
    }
    
    if (refeicaoEditando !== null) {
        // Editar refeição existente
        cardapio[`semana${semanaAtual}`][`dia${diaAtual}`][refeicaoEditando] = novaRefeicao;
    } else {
        // Adicionar nova refeição
        cardapio[`semana${semanaAtual}`][`dia${diaAtual}`].push(novaRefeicao);
    }
    
    // 🚨 Melhoria 1: Ordenar o array de refeições por horário antes de salvar
    cardapio[`semana${semanaAtual}`][`dia${diaAtual}`].sort((a, b) => {
        if (a.horario < b.horario) return -1;
        if (a.horario > b.horario) return 1;
        return 0;
    });

    saveCardapio(cardapio);
    
    // 🚨 Melhoria 2: Resetar o status de conclusão do cliente para este dia (Integridade de Dados)
    const chaveStatusCliente = `status_refeicoes_cliente${clienteAtual}_s${semanaAtual}_d${diaAtual}`;
    localStorage.removeItem(chaveStatusCliente); // Força o cliente a recarregar e ter o status zerado/correto

    // Atualizar apenas o dia modificado
    const refeicoesContainer = document.getElementById(`refeicoes-${diaAtual}`);
    const refeicoes = cardapio[`semana${semanaAtual}`][`dia${diaAtual}`];
    refeicoesContainer.innerHTML = renderizarRefeicoes(refeicoes, diaAtual);
    
    // Atualizar o indicador de progresso no header do dia (busca o progresso atualizado)
    const progressoDia = obterProgressoDia(diaAtual);
    const diaHeader = document.querySelector(`#conteudo-${diaAtual}`).previousElementSibling;
    const indicadorDiv = diaHeader.querySelector('div');
    indicadorDiv.innerHTML = `
        <h2 class="dia-titulo">DIA ${diaAtual}</h2>
        ${renderizarIndicadorProgresso(progressoDia, refeicoes.length)}
    `;
    
    fecharModal();
}

// Editar refeição
function editarRefeicao(dia, index) {
    abrirModal(dia, index);
}

// Voltar para detalhes do cliente
function voltarParaDetalhes() {
    window.history.back();
}

// Funções de armazenamento
function getCardapio() {
    const chave = `cardapio_cliente${clienteAtual}`;
    const cardapio = localStorage.getItem(chave);
    return cardapio ? JSON.parse(cardapio) : {};
}

function saveCardapio(cardapio) {
    const chave = `cardapio_cliente${clienteAtual}`;
    localStorage.setItem(chave, JSON.stringify(cardapio));
}

// Fechar modal ao clicar fora
document.getElementById('modalRefeicao').addEventListener('click', (e) => {
    if (e.target.id === 'modalRefeicao') {
        fecharModal();
    }
});