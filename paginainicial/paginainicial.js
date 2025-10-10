
// =======================
// INICIALIZAÇÃO
// =======================
document.addEventListener('DOMContentLoaded', () => {
    // Buscar cliente logado
    const clienteLogado = localStorage.getItem('clienteLogado');
    // Garante que clienteAtual é 0 se não estiver logado, evitando chaves de localStorage inválidas
    clienteAtual = clienteLogado ? parseInt(clienteLogado) : 0; 

    if (!clienteAtual) {
        console.warn("Nenhum cliente logado. Carregando dados genéricos (cliente 0).");
        // window.location.href = "../login/login.html"; // Comentário mantido para forçar login
    }

    // Buscar semana atual
    const semanaStorage = localStorage.getItem(`semanaAtual_cliente${clienteAtual}`);
    semanaAtual = semanaStorage ? parseInt(semanaStorage) : 1;

    // Calcular o dia atual
    diaAtual = calcularDiaAtual();

    // Atualizar título da página
    atualizarTitulo();

    // Carregar dados
    carregarRefeicoesDoDia();
    carregarCondicoes();
    carregarPontuacao();
});

// =======================
// FUNÇÕES PRINCIPAIS
// =======================

// Atualizar o título com semana e dia
function atualizarTitulo() {
    const diasSemana = ['', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];
    const nomeDia = diasSemana[diaAtual] || `Dia ${diaAtual}`;
    document.getElementById('semana-atual-titulo').textContent = `Semana ${semanaAtual} - ${nomeDia}`;
}

// Retorna número do dia (1 = segunda ... 7 = domingo)
function calcularDiaAtual() {
    const hoje = new Date();
    const diaSemana = hoje.getDay();
    return diaSemana === 0 ? 7 : diaSemana;
}

// Carregar refeições do dia
function carregarRefeicoesDoDia() {
    const cardapio = getCardapio();
    // 🚨 Melhoria: Ordenar refeições do cardápio por horário antes de usar
    let refeicoesDoDia = cardapio[`semana${semanaAtual}`]?.[`dia${diaAtual}`] || [];
    
    // Ordena as refeições por horário para exibição correta
    refeicoesDoDia.sort((a, b) => {
        if (a.horario < b.horario) return -1;
        if (a.horario > b.horario) return 1;
        return 0;
    });

    const container = document.querySelector('.tasks-container ul');

    if (!refeicoesDoDia.length) {
        container.innerHTML = `
            <li style="text-align:center; padding:30px; color:#999; list-style:none;">
                <div style="font-size:3em; margin-bottom:10px;">🍽️</div>
                <div>Nenhuma refeição cadastrada para hoje</div>
                <div style="font-size:0.9em; margin-top:10px;">Aguarde o nutricionista adicionar seu cardápio</div>
            </li>`;
        return;
    }

    const chave = `status_refeicoes_cliente${clienteAtual}_s${semanaAtual}_d${diaAtual}`;
    let status = JSON.parse(localStorage.getItem(chave) || '[]');
    
    // Garante que o array de status tenha o mesmo tamanho das refeições. 
    // Isso é importante após o nutricionista editar/adicionar/remover refeições, o que zera o status.
    if (status.length !== refeicoesDoDia.length) {
        status = Array(refeicoesDoDia.length).fill(false);
        localStorage.setItem(chave, JSON.stringify(status));
    }


    // Renderizar lista
    container.innerHTML = refeicoesDoDia.map((refeicao, index) => {
        const concluida = status[index];
        return `
            <li class="${concluida ? 'tarefa-concluida' : ''}">
                <input type="checkbox"
                    class="task-checkbox"
                    id="refeicao-${index}"
                    ${concluida ? 'checked' : ''}
                    onchange="marcarRefeicao(${index})">
                <label class="task-label" for="refeicao-${index}">
                    <strong style="color:var(--main-green);">${refeicao.tipo}</strong>
                    <span style="color:#ff6b6b;font-weight:600;"> às ${refeicao.horario}</span><br>
                    <span style="color:#666;">${refeicao.alimento}</span><br>
                    <small style="color:#999;">Quantidade: ${refeicao.quantidade}</small>
                </label>
            </li>
        `;
    }).join('');
}
 

// Mostrar feedback visual
function mostrarFeedback(msg) {
    const antigo = document.querySelector('.feedback-temp');
    if (antigo) antigo.remove();

    const div = document.createElement('div');
    div.className = 'feedback-temp';
    div.textContent = msg;
    // O estilo agora depende do seu CSS externo (paginainicial.css)
    div.style.cssText = `
        position:fixed;top:20px;right:20px;
        background:#4caf50;color:white;
        padding:15px 25px;border-radius:8px;
        font-weight:600;z-index:10000;
        box-shadow:0 4px 12px rgba(0,0,0,0.2);
        animation:slideIn 0.3s ease;
    `;
    document.body.appendChild(div);
    setTimeout(() => {
        div.style.animation = 'slideOut 0.3s ease forwards'; // 'forwards' para garantir que pare no final
        setTimeout(() => div.remove(), 300);
    }, 2000);
}

// Carregar condições intestinais
function carregarCondicoes() {
    const container = document.getElementById('lista-condicoes');
    const condicoesStr = localStorage.getItem(`condicoes_cliente${clienteAtual}`);
    // ... restante da função sem alterações ...
    
    if (!condicoesStr) {
        container.innerHTML = '<li style="color:#999;">Nenhuma condição cadastrada</li>';
        return;
    }

    try {
        const condicoes = JSON.parse(condicoesStr);
        if (!Array.isArray(condicoes) || !condicoes.length) {
            container.innerHTML = '<li style="color:#999;">Nenhuma condição cadastrada</li>';
            return;
        }

        container.innerHTML = condicoes.map(c => `<li>• ${c}</li>`).join('');
    } catch (e) {
        console.error("Erro ao carregar condições:", e);
        container.innerHTML = '<li style="color:#999;">Erro ao carregar condições</li>';
    }
}

// Atualizar pontuação
function carregarPontuacao() {
    const cardapio = getCardapio();
    const refeicoes = cardapio[`semana${semanaAtual}`]?.[`dia${diaAtual}`] || [];
    const chave = `status_refeicoes_cliente${clienteAtual}_s${semanaAtual}_d${diaAtual}`;
    const status = JSON.parse(localStorage.getItem(chave) || '[]');

    // Considera apenas as marcações que correspondem ao número atual de refeições
    const completas = status.slice(0, refeicoes.length).filter(s => s).length; 
    const total = refeicoes.length;

    document.getElementById('pontuacao-total').textContent = completas;

    const box = document.querySelector('.score-box');
    if (total > 0 && completas === total) {
        box.style.background = 'linear-gradient(135deg,#4caf50,#8bc34a)';
        box.style.color = 'white';
    } else {
        box.style.background = '';
        box.style.color = '';
    }
    // O total exibido no scorebox é corrigido no HTML para refletir o total de refeições
    const scoreTextElement = box.querySelector('p:last-child');
    if (scoreTextElement) {
        scoreTextElement.innerHTML = `<span id="pontuacao-total">${completas}</span>/${total}`;
    }
}

// Buscar cardápio salvo
function getCardapio() {
    const chave = `cardapio_cliente${clienteAtual}`;
    try {
        const dados = localStorage.getItem(chave);
        return dados ? JSON.parse(dados) : {};
    } catch {
        console.error("Erro ao ler cardápio do localStorage");
        return {};
    }
}

// ⚠️ NOTA: Você precisa adicionar as seguintes regras ao seu arquivo CSS (paginainicial.css)
/*
.tarefa-concluida { opacity: 0.6; text-decoration: line-through; }
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}
.feedback-temp {
    animation-fill-mode: forwards;
}
*/