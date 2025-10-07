// Recuperar todos os clientes do localStorage
function getClientes() {
    const clientes = localStorage.getItem('clientes');
    if (clientes) {
        return JSON.parse(clientes);
    }
    
    // Se não tiver 'clientes', tentar buscar 'dadosUsuario' e 'ultimaAvaliacao'
    const dadosUsuario = localStorage.getItem('dadosUsuario');
    const ultimaAvaliacao = localStorage.getItem('ultimaAvaliacao');
    
    if (dadosUsuario) {
        const usuario = JSON.parse(dadosUsuario);
        const avaliacao = ultimaAvaliacao ? JSON.parse(ultimaAvaliacao) : {};
        
        // Combinar os dois objetos em um único cliente
        return [{
            nome: usuario.nome || 'Sem nome',
            genero: usuario.sexo || 'Não informado',
            altura: usuario.altura || '0',
            idade: usuario.idade || '0',
            peso: usuario.peso || '0',
            telefone: usuario.contato || 'Não informado',
            imc: usuario.imc || '0',
            restricoes: montarRestricoes(avaliacao),
            saude: montarSaude(avaliacao)
        }];
    }
    
    return [];
}

// Montar texto de restrições a partir da avaliação
function montarRestricoes(avaliacao) {
    const restricoes = [];
    
    if (avaliacao.p1_doenca === 'sim') {
        restricoes.push(avaliacao.p1_doenca_outros || 'Possui doença');
    }
    
    if (avaliacao.p2_alergia && avaliacao.p2_alergia.length > 0) {
        restricoes.push(`Alergias: ${avaliacao.p2_alergia.join(', ')}`);
    }
    
    if (avaliacao.p2_alergia_outros) {
        restricoes.push(avaliacao.p2_alergia_outros);
    }
    
    if (avaliacao.p3_restricao === 'sim') {
        restricoes.push(avaliacao.p3_restricao_outros || 'Possui restrição alimentar');
    }
    
    if (avaliacao.p7_refeicoes) {
        restricoes.push(`Refeições: ${avaliacao.p7_refeicoes}`);
    }
    
    if (avaliacao.p8_alimentos_evita) {
        restricoes.push(`Evita: ${avaliacao.p8_alimentos_evita}`);
    }
    
    return restricoes.length > 0 ? restricoes.join('\n') : 'Nenhuma restrição informada';
}

// Montar texto de saúde a partir da avaliação
function montarSaude(avaliacao) {
    const saude = [];
    
    if (avaliacao.p4_exercicio) {
        saude.push(`Exercício: ${avaliacao.p4_exercicio}`);
    }
    
    if (avaliacao.p5_apetite) {
        saude.push(`Apetite: ${avaliacao.p5_apetite}`);
    }
    
    if (avaliacao.p6_objetivo && avaliacao.p6_objetivo.length > 0) {
        saude.push(`Objetivo: ${avaliacao.p6_objetivo.join(', ')}`);
    }
    
    if (avaliacao.p9_frequencia) {
        saude.push(`Frequência alimentar: ${avaliacao.p9_frequencia}`);
    }
    
    if (avaliacao.p10_emocional) {
        saude.push(`Estado emocional: ${avaliacao.p10_emocional}`);
    }
    
    if (avaliacao.grupo) {
        saude.push(`Grupo: ${avaliacao.grupo}`);
    }
    
    return saude.length > 0 ? saude.join('\n') : 'Informações não disponíveis';
}

// Exibir lista de clientes
function renderClientes() {
    const clientes = getClientes();
    const clientsList = document.getElementById('clientsList');
    
    if (!clientsList) return;
    
    clientsList.innerHTML = '';

    if (clientes.length === 0) {
        clientsList.innerHTML = '<p style="text-align: center; color: #666; margin-top: 50px; font-size: 18px;">Nenhum cliente cadastrado ainda.</p>';
        return;
    }

    clientes.forEach((cliente, index) => {
        const card = document.createElement('div');
        card.className = 'client-card';
        card.onclick = () => mostrarDetalhes(index);
        
        card.innerHTML = `
            <span class="client-name">${cliente.nome || 'Nome não informado'}</span>
            <svg class="edit-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
        `;
        
        clientsList.appendChild(card);
    });
}

// Mostrar detalhes de um cliente
function mostrarDetalhes(index) {
    const clientes = getClientes();
    const cliente = clientes[index];

    if (!cliente) return;

    // Salvar o índice do cliente atual para usar na página de cardápio
    localStorage.setItem('clienteAtualIndex', index);

    document.getElementById('detailNome').textContent = cliente.nome || 'Nome não informado';
    document.getElementById('detailGenero').textContent = `Gênero ${cliente.genero || 'Não informado'}`;
    document.getElementById('detailAltura').textContent = `${cliente.altura || '0'} altura`;
    document.getElementById('detailIdade').textContent = `${cliente.idade || '0'} anos`;
    document.getElementById('detailPeso').textContent = `${cliente.peso || '0'} kg`;
    document.getElementById('detailTelefone').textContent = cliente.telefone || 'Não informado';
    
    // Formatar IMC
    let imcFormatado = cliente.imc || calcularIMC(cliente.peso, cliente.altura);
    if (typeof imcFormatado === 'number') {
        imcFormatado = imcFormatado.toFixed(2).replace('.', ',');
    }
    document.getElementById('detailIMC').textContent = `IMC ${imcFormatado}`;
    
    // Exibir restrições e saúde com quebras de linha
    const restricoesElement = document.getElementById('detailRestricoes');
    restricoesElement.style.whiteSpace = 'pre-line';
    restricoesElement.textContent = cliente.restricoes || 'Nenhuma restrição informada';
    
    const saudeElement = document.getElementById('detailSaude');
    saudeElement.style.whiteSpace = 'pre-line';
    saudeElement.textContent = cliente.saude || 'Informações não disponíveis';

    document.getElementById('clientListScreen').style.display = 'none';
    document.getElementById('clientDetailsScreen').style.display = 'block';
    
    // Tornar os cards de semana clicáveis
    adicionarEventosSemanais(index);
}

// Adicionar eventos de clique nos cards de semana
function adicionarEventosSemanais(clienteIndex) {
    const weekCards = document.querySelectorAll('.week-card');
    weekCards.forEach((card, index) => {
        // Remover eventos anteriores
        card.replaceWith(card.cloneNode(true));
    });
    
    // Adicionar novos eventos
    document.querySelectorAll('.week-card').forEach((card, index) => {
        card.addEventListener('click', () => {
            window.location.href = `./semanas/semana.html?semana=${index + 1}&cliente=${clienteIndex}`;
        });
    });
}

// Calcular IMC caso não esteja salvo
function calcularIMC(peso, altura) {
    if (!peso || !altura) return '0';
    const pesoNum = parseFloat(peso);
    const alturaNum = parseFloat(altura);
    if (isNaN(pesoNum) || isNaN(alturaNum) || alturaNum === 0) return '0';
    const imc = pesoNum / (alturaNum * alturaNum);
    return imc.toFixed(2).replace('.', ',');
}

// Voltar para a lista
function voltarParaLista() {
    document.getElementById('clientListScreen').style.display = 'block';
    document.getElementById('clientDetailsScreen').style.display = 'none';
}

// Inicializar a página quando carregar
document.addEventListener('DOMContentLoaded', () => {
    renderClientes();
});