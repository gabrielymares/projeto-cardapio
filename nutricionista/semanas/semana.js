// Variáveis globais
let diaAtual = null;
let refeicaoEditando = null;
let semanaAtual = 1;
let clienteAtual = null;

// Inicializar página
document.addEventListener('DOMContentLoaded', () => {
    // Pegar semana da URL
    const urlParams = new URLSearchParams(window.location.search);
    semanaAtual = parseInt(urlParams.get('semana')) || 1;
    clienteAtual = parseInt(urlParams.get('cliente')) || 0;
    
    document.getElementById('tituloSemana').textContent = `Semana ${semanaAtual}`;
    
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
    const refeicoesDoDia = cardapio[`semana${semanaAtual}`]?.[`dia${numeroDia}`] || [];
    
    const card = document.createElement('div');
    card.className = 'dia-card';
    
    card.innerHTML = `
        <div class="dia-header" onclick="toggleDia(${numeroDia})">
            <h2 class="dia-titulo">DIA ${numeroDia}</h2>
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

// Renderizar lista de refeições
function renderizarRefeicoes(refeicoes, dia) {
    if (refeicoes.length === 0) {
        return '<p class="mensagem-vazio">Nenhuma refeição cadastrada</p>';
    }
    
    return refeicoes.map((ref, index) => `
        <div class="refeicao-item">
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
    `).join('');
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
        const refeicao = cardapio[`semana${semanaAtual}`][`dia${dia}`][refeicaoIndex];
        
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
    
    saveCardapio(cardapio);
    
    // Atualizar apenas o dia modificado
    const refeicoesContainer = document.getElementById(`refeicoes-${diaAtual}`);
    const refeicoes = cardapio[`semana${semanaAtual}`][`dia${diaAtual}`];
    refeicoesContainer.innerHTML = renderizarRefeicoes(refeicoes, diaAtual);
    
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