document.addEventListener('DOMContentLoaded', () => {
    // === Elementos da Página de Perfil (Dados Cadastrais) ===
    const userNameSpan = document.getElementById('perfil-nome'); 
    const userEmailSpan = document.getElementById('perfil-contato');
    const userSexSpan = document.getElementById('perfil-sexo');
    const userAgeSpan = document.getElementById('perfil-idade');
    const userIMC = document.getElementById('perfil-imc');
    
    // === Elementos da Página Inicial/Dashboard (Pontuação e Cardápio) ===
    const pontuacaoUsuarioSpan = document.getElementById('pontuacao-usuario');
    const pontuacaoTotalSpan = document.getElementById('pontuacao-total');
    const condicoesListUl = document.querySelector('.conditions-list ul'); 
    const semanaAtualTitulo = document.getElementById('semana-atual-titulo');
    const tasksContainerUl = document.querySelector('.tasks-container ul');
    const mensagemMotivacional = document.getElementById('mensagem-motivacional');

    // Tenta carregar os dados cadastrais
    const dadosUsuarioSalvos = localStorage.getItem('dadosUsuario');
    const dadosUsuario = dadosUsuarioSalvos ? JSON.parse(dadosUsuarioSalvos) : null;
    
    // Tenta carregar os resultados da avaliação
    const resultadoAvaliacaoSalvos = localStorage.getItem('ultimaAvaliacao');
    const resultadoAvaliacao = resultadoAvaliacaoSalvos ? JSON.parse(resultadoAvaliacaoSalvos) : null;
    
    // Define os cardápios com pontuação para cada refeição
    const substituicoes = {
        'lactose': { 'leite': 'leite de amêndoas', 'iogurte': 'iogurte de coco', 'queijo': 'queijo de castanhas' },
        'glúten': { 'pão': 'pão sem glúten', 'macarrão': 'macarrão de arroz ou abobrinha', 'trigo': 'farinha de arroz' }
    };
    

    try {
        // --- 1. CARREGAR DADOS CADASTRAIS (Para a página de Perfil) ---
        if (dadosUsuario) {
            if (userNameSpan) userNameSpan.textContent = dadosUsuario.nome || 'Não informado';
            if (userEmailSpan) userEmailSpan.textContent = dadosUsuario.contato || 'Não informado';
            if (userSexSpan) userSexSpan.textContent = dadosUsuario.sexo || 'Não informado';
            if (userAgeSpan) userAgeSpan.textContent = dadosUsuario.idade || 'Não informado';
            if (userIMC) userIMC.textContent = dadosUsuario.imc ? dadosUsuario.imc.toFixed(2) : 'Não informado';
        }
        
        // --- 2. CARREGAR PONTUAÇÃO E CONDIÇÕES ---
        if (resultadoAvaliacao) {
            if (condicoesListUl && resultadoAvaliacao.grupo) {
                condicoesListUl.innerHTML = '';
                const grupoLi = document.createElement('li');
                grupoLi.textContent = resultadoAvaliacao.grupo;
                condicoesListUl.appendChild(grupoLi);

                if (resultadoAvaliacao.alergias && resultadoAvaliacao.alergias.length > 0) {
                    resultadoAvaliacao.alergias.forEach(alergia => {
                        const li = document.createElement('li');
                        li.textContent = `Alergia a ${alergia}`;
                        condicoesListUl.appendChild(li);
                    });
                }
            }
            
            // --- 3. CÁLCULO DA SEMANA E CARDÁPIO ---
            if (semanaAtualTitulo && dadosUsuario && dadosUsuario.dataInicio) {
                const dataInicio = new Date(dadosUsuario.dataInicio);
                const dataAtual = new Date();
                
                const diferencaEmMilissegundos = dataAtual.getTime() - dataInicio.getTime();
                const diasPassados = Math.floor(diferencaEmMilissegundos / (1000 * 60 * 60 * 24));
                
                let semanaAtual = Math.floor(diasPassados / 7) + 1;
                semanaAtual = Math.min(semanaAtual, 12);

                let faseDoPrograma = '';
                if (semanaAtual >= 1 && semanaAtual <= 3) {
                    semanaAtualTitulo.textContent = `Semana ${semanaAtual} - INTRODUÇÃO`;
                    faseDoPrograma = 'introducao';
                } else if (semanaAtual >= 4 && semanaAtual <= 6) {
                    semanaAtualTitulo.textContent = `Semana ${semanaAtual} - ADAPTAÇÃO`;
                    faseDoPrograma = 'adaptacao';
                } else if (semanaAtual >= 7 && semanaAtual <= 9) {
                    semanaAtualTitulo.textContent = `Semana ${semanaAtual} - DESAFIOS`;
                    faseDoPrograma = 'desafios';
                } else if (semanaAtual >= 10 && semanaAtual <= 12) {
                    semanaAtualTitulo.textContent = `Semana ${semanaAtual} - CONSOLIDAÇÃO`;
                    faseDoPrograma = 'consolidacao';
                } else {
                    semanaAtualTitulo.textContent = `Parabéns! Você concluiu o programa de 12 semanas.`;
                    faseDoPrograma = 'consolidacao';
                }
                
                if (tasksContainerUl) {
                    const diasDaSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
                    const hoje = diasDaSemana[dataAtual.getDay()];
                    
                    const cardapioBase = cardapiosPorFase[faseDoPrograma] ? cardapiosPorFase[faseDoPrograma][hoje] : null;

                    if (cardapioBase) {
                        const alergias = resultadoAvaliacao.alergias || [];
                        const cardapioPersonalizado = adaptarCardapio(cardapioBase, alergias);

                        // Calcular pontuação total (META)
                        const pontuacaoMeta = calcularPontuacaoTotal(cardapioPersonalizado);
                        if (pontuacaoUsuarioSpan) {
                            pontuacaoUsuarioSpan.textContent = pontuacaoMeta;
                        }

                        // Calcular pontuação acumulada
                        const tarefasConcluidas = carregarTarefasConcluidas();
                        const pontuacaoAcumulada = calcularPontuacaoAcumulada(tarefasConcluidas);
                        if (pontuacaoTotalSpan) {
                            pontuacaoTotalSpan.textContent = pontuacaoAcumulada;
                        }

                        // Atualizar mensagem motivacional
                        atualizarMensagemMotivacional(pontuacaoAcumulada, pontuacaoMeta);

                        // Criar lista de tarefas com checkboxes
                        tasksContainerUl.innerHTML = '';
                        cardapioPersonalizado.forEach((refeicao, index) => {
                            const li = criarCheckboxTarefa(refeicao, index, hoje);
                            tasksContainerUl.appendChild(li);
                        });
                    } else {
                        tasksContainerUl.innerHTML = '<li>Cardápio não disponível para esta fase.</li>';
                    }
                }
            } else if (semanaAtualTitulo) {
                semanaAtualTitulo.textContent = `Programa não iniciado`;
            }
        } else {
            // Caso não haja NENHUM dado de avaliação
            if (semanaAtualTitulo) semanaAtualTitulo.textContent = `Bem-vindo ao Programa de Adaptação!`;
            if (pontuacaoUsuarioSpan) pontuacaoUsuarioSpan.textContent = `0`;
            if (pontuacaoTotalSpan) pontuacaoTotalSpan.textContent = `0`;
            if (condicoesListUl) condicoesListUl.innerHTML = `<li>Sem dados de avaliação.</li>`;
            if (tasksContainerUl) tasksContainerUl.innerHTML = `<li>Para começar, faça a sua avaliação.</li>`;
        }

    } catch (e) {
        console.error('Erro geral ao processar dados:', e);
        if (userNameSpan) userNameSpan.textContent = 'Erro ao carregar dados';
        if (pontuacaoUsuarioSpan) pontuacaoUsuarioSpan.textContent = `Erro`;
        if (semanaAtualTitulo) semanaAtualTitulo.textContent = `Erro ao carregar semana`;
        if (condicoesListUl) condicoesListUl.innerHTML = `<li>Erro ao carregar dados.</li>`;
    }
});

function voltarPagina() {
    window.history.back();
}
