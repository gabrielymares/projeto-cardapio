
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
    
    // Ordenar o array de refeições por horário antes de salvar
    cardapio[`semana${semanaAtual}`][`dia${diaAtual}`].sort((a, b) => {
        if (a.horario < b.horario) return -1;
        if (a.horario > b.horario) return 1;
        return 0;
    });

    saveCardapio(cardapio);
    

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