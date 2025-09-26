document.addEventListener('DOMContentLoaded', () => {
    // === Elementos da Página de Perfil (Dados Cadastrais) ===
    // ATENÇÃO: Se estiver usando o HTML de perfil da nossa última interação,
    // os IDs corretos seriam: perfil-nome, perfil-idade, perfil-sexo, perfil-contato, perfil-imc, etc.
    // Adaptei para IDs mais genéricos, mas você pode precisar ajustá-los.
    const userNameSpan = document.getElementById('perfil-nome'); 
    const userEmailSpan = document.getElementById('perfil-contato'); // Usamos Contato/Email
    const userSexSpan = document.getElementById('perfil-sexo');
    const userAgeSpan = document.getElementById('perfil-idade');
    const userIMC = document.getElementById('perfil-imc');
    
    // === Elementos da Página Inicial/Dashboard (Pontuação e Cardápio) ===
    const pontuacaoUsuarioSpan = document.getElementById('pontuacao-usuario');
    const pontuacaoTotalSpan = document.getElementById('pontuacao-total');
    // Este seletor foi mantido do seu segundo bloco para as Condições/Alergias:
    const condicoesListUl = document.querySelector('.conditions-list ul'); 
    const semanaAtualTitulo = document.getElementById('semana-atual-titulo');
    const tasksContainerUl = document.querySelector('.tasks-container ul');

    // Tenta carregar os dados cadastrais (criados pelo formulário)
    const dadosUsuarioSalvos = localStorage.getItem('dadosUsuario');
    const dadosUsuario = dadosUsuarioSalvos ? JSON.parse(dadosUsuarioSalvos) : null;
    
    // Tenta carregar os resultados da avaliação
    const resultadoAvaliacaoSalvos = localStorage.getItem('ultimaAvaliacao');
    const resultadoAvaliacao = resultadoAvaliacaoSalvos ? JSON.parse(resultadoAvaliacaoSalvos) : null;
    
    // Define os cardápios (mantido)
    const substituicoes = {
        'lactose': { 'leite': 'leite de amêndoas', 'iogurte': 'iogurte de coco', 'queijo': 'queijo de castanhas' },
        'glúten': { 'pão': 'pão sem glúten', 'macarrão': 'macarrão de arroz ou abobrinha', 'trigo': 'farinha de arroz' }
    };
    
    const cardapiosPorFase = {
        'introducao': {
            'domingo': ['Café da manhã: Iogurte natural com frutas', 'Almoço: Salada de folhas com frango grelhado', 'Jantar: Omelete de legumes com queijo'],
            'segunda': ['Café da manhã: Pão integral com queijo branco', 'Almoço: Arroz integral, feijão e carne magra', 'Jantar: Sopa de abóbora com gengibre'],
            'terca': ['Café da manhã: Mingau de aveia', 'Almoço: Peixe assado com batata doce', 'Jantar: Wrap de frango com vegetais'],
            'quarta': ['Café da manhã: Vitamina de banana e leite de amêndoas', 'Almoço: Salada de lentilha com legumes coloridos', 'Jantar: Frango desfiado com purê de couve-flor'],
            'quinta': ['Café da manhã: Ovos mexidos com tomate e orégano', 'Almoço: Quibe assado com salada de pepino', 'Jantar: Sopa de legumes com croutons integrais'],
            'sexta': ['Café da manhã: Panqueca de banana e aveia', 'Almoço: Salmão grelhado com quinoa e brócolis', 'Jantar: Sopa de feijão com carne desfiada'],
            'sabado': ['Café da manhã: Frutas variadas e castanhas', 'Almoço: Macarrão integral com molho de tomate caseiro', 'Jantar: Salada de atum com grão de bico']
        },
        'adaptacao': {
            'domingo': ['Café da manhã: Omelete com legumes e queijo', 'Almoço: Bife grelhado, arroz integral e salada', 'Jantar: Salada de frango com abacate'],
            'segunda': ['Café da manhã: Panqueca de aveia com morangos', 'Almoço: Salmão assado com purê de abóbora', 'Jantar: Sopa de mandioquinha'],
            'terca': ['Café da manhã: Iogurte grego com granola caseira', 'Almoço: Frango ao curry com arroz basmati', 'Jantar: Wraps de alface recheados com carne moída'],
            'quarta': ['Café da manhã: Ovos mexidos com abacate', 'Almoço: Espaguete de abobrinha com molho bolonhesa', 'Jantar: Sopa de lentilha com gengibre'],
            'quinta': ['Café da manhã: Pão sem glúten com ovos e tomate', 'Almoço: Salada de quinoa com legumes e queijo', 'Jantar: Bife de patinho com brócolis cozido'],
            'sexta': ['Café da manhã: Vitamina de frutas vermelhas e proteína', 'Almoço: Frango xadrez fit com arroz integral', 'Jantar: Sopa cremosa de legumes com frango'],
            'sabado': ['Café da manhã: Tapioca com recheio de frango e requeijão', 'Almoço: Filé de peixe em crosta de castanhas com salada', 'Jantar: Salada de atum com ovos e azeitonas']
        },
        'desafios': {}, 'consolidacao': {}
    };

    function adaptarCardapio(cardapioOriginal, alergiasDoUsuario) {
        if (!alergiasDoUsuario || alergiasDoUsuario.length === 0) return cardapioOriginal;
        
        return cardapioOriginal.map(refeicao => {
            let refeicaoAdaptada = refeicao;
            alergiasDoUsuario.forEach(alergia => {
                const mapaSub = substituicoes[alergia.toLowerCase()];
                if (mapaSub) {
                    for (const alimento in mapaSub) {
                        const regex = new RegExp(`\\b${alimento}\\b`, 'gi');
                        refeicaoAdaptada = refeicaoAdaptada.replace(regex, mapaSub[alimento]);
                    }
                }
            });
            return refeicaoAdaptada;
        });
    }

    try {
        // --- 1. CARREGAR DADOS CADASTRAIS (Para a página de Perfil) ---
        if (dadosUsuario) {
            if (userNameSpan) userNameSpan.textContent = dadosUsuario.nome || 'Não informado';
            if (userEmailSpan) userEmailSpan.textContent = dadosUsuario.contato || 'Não informado';
            if (userSexSpan) userSexSpan.textContent = dadosUsuario.sexo || 'Não informado';
            if (userAgeSpan) userAgeSpan.textContent = dadosUsuario.idade || 'Não informado';
            if (userIMC) userIMC.textContent = dadosUsuario.imc ? dadosUsuario.imc.toFixed(2) : 'Não informado';
            // Nota: CPF não foi solicitado nem salvo no formulário, é normal que não apareça.
        }
        
        // --- 2. CARREGAR PONTUAÇÃO E CONDIÇÕES ---
        if (resultadoAvaliacao) {
            if (pontuacaoUsuarioSpan) pontuacaoUsuarioSpan.textContent = resultadoAvaliacao.pontuacao || 'N/A';
            if (pontuacaoTotalSpan) pontuacaoTotalSpan.textContent = '22';

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
            
            // --- 3. CÁLCULO DA SEMANA E CARDÁPIO (Lógica da Página Inicial) ---
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

                        tasksContainerUl.innerHTML = '';
                        cardapioPersonalizado.forEach(refeicao => {
                            const li = document.createElement('li');
                            const span = document.createElement('span');
                            span.textContent = refeicao;
                            li.appendChild(span);
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
            if (pontuacaoTotalSpan) pontuacaoTotalSpan.textContent = `22`;
            if (condicoesListUl) condicoesListUl.innerHTML = `<li>Sem dados de avaliação.</li>`;
            if (tasksContainerUl) tasksContainerUl.innerHTML = `<li>Para começar, faça a sua avaliação.</li>`;
        }

    } catch (e) {
        console.error('Erro geral ao processar dados:', e);
        // Exibir mensagens de erro em todos os spans relevantes
        if (userNameSpan) userNameSpan.textContent = 'Erro ao carregar dados';
        if (pontuacaoUsuarioSpan) pontuacaoUsuarioSpan.textContent = `Erro`;
        if (semanaAtualTitulo) semanaAtualTitulo.textContent = `Erro ao carregar semana`;
        if (condicoesListUl) condicoesListUl.innerHTML = `<li>Erro ao carregar dados.</li>`;
    }
});

function voltarPagina() {
  window.history.back();
}
