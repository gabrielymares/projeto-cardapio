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
    
    const cardapiosPorFase = {
        'introducao': {
            'domingo': [
                { texto: 'Café da manhã: Iogurte natural com frutas', pontos: 3 },
                { texto: 'Almoço: Salada de folhas com frango grelhado', pontos: 4 },
                { texto: 'Jantar: Omelete de legumes com queijo', pontos: 3 }
            ],
            'segunda': [
                { texto: 'Café da manhã: Pão integral com queijo branco', pontos: 3 },
                { texto: 'Almoço: Arroz integral, feijão e carne magra', pontos: 5 },
                { texto: 'Jantar: Sopa de abóbora com gengibre', pontos: 2 }
            ],
            'terca': [
                { texto: 'Café da manhã: Mingau de aveia', pontos: 3 },
                { texto: 'Almoço: Peixe assado com batata doce', pontos: 5 },
                { texto: 'Jantar: Wrap de frango com vegetais', pontos: 4 }
            ],
            'quarta': [
                { texto: 'Café da manhã: Vitamina de banana e leite de amêndoas', pontos: 3 },
                { texto: 'Almoço: Salada de lentilha com legumes coloridos', pontos: 4 },
                { texto: 'Jantar: Frango desfiado com purê de couve-flor', pontos: 3 }
            ],
            'quinta': [
                { texto: 'Café da manhã: Ovos mexidos com tomate e orégano', pontos: 3 },
                { texto: 'Almoço: Quibe assado com salada de pepino', pontos: 5 },
                { texto: 'Jantar: Sopa de legumes com croutons integrais', pontos: 2 }
            ],
            'sexta': [
                { texto: 'Café da manhã: Panqueca de banana e aveia', pontos: 4 },
                { texto: 'Almoço: Salmão grelhado com quinoa e brócolis', pontos: 5 },
                { texto: 'Jantar: Sopa de feijão com carne desfiada', pontos: 3 }
            ],
            'sabado': [
                { texto: 'Café da manhã: Frutas variadas e castanhas', pontos: 3 },
                { texto: 'Almoço: Macarrão integral com molho de tomate caseiro', pontos: 4 },
                { texto: 'Jantar: Salada de atum com grão de bico', pontos: 3 }
            ]
        },
        'adaptacao': {
            'domingo': [
                { texto: 'Café da manhã: Omelete com legumes e queijo', pontos: 4 },
                { texto: 'Almoço: Bife grelhado, arroz integral e salada', pontos: 5 },
                { texto: 'Jantar: Salada de frango com abacate', pontos: 4 }
            ],
            'segunda': [
                { texto: 'Café da manhã: Panqueca de aveia com morangos', pontos: 4 },
                { texto: 'Almoço: Salmão assado com purê de abóbora', pontos: 5 },
                { texto: 'Jantar: Sopa de mandioquinha', pontos: 3 }
            ],
            'terca': [
                { texto: 'Café da manhã: Iogurte grego com granola caseira', pontos: 4 },
                { texto: 'Almoço: Frango ao curry com arroz basmati', pontos: 5 },
                { texto: 'Jantar: Wraps de alface recheados com carne moída', pontos: 4 }
            ],
            'quarta': [
                { texto: 'Café da manhã: Ovos mexidos com abacate', pontos: 4 },
                { texto: 'Almoço: Espaguete de abobrinha com molho bolonhesa', pontos: 5 },
                { texto: 'Jantar: Sopa de lentilha com gengibre', pontos: 3 }
            ],
            'quinta': [
                { texto: 'Café da manhã: Pão sem glúten com ovos e tomate', pontos: 4 },
                { texto: 'Almoço: Salada de quinoa com legumes e queijo', pontos: 4 },
                { texto: 'Jantar: Bife de patinho com brócolis cozido', pontos: 4 }
            ],
            'sexta': [
                { texto: 'Café da manhã: Vitamina de frutas vermelhas e proteína', pontos: 4 },
                { texto: 'Almoço: Frango xadrez fit com arroz integral', pontos: 5 },
                { texto: 'Jantar: Sopa cremosa de legumes com frango', pontos: 3 }
            ],
            'sabado': [
                { texto: 'Café da manhã: Tapioca com recheio de frango e requeijão', pontos: 4 },
                { texto: 'Almoço: Filé de peixe em crosta de castanhas com salada', pontos: 5 },
                { texto: 'Jantar: Salada de atum com ovos e azeitonas', pontos: 4 }
            ]
        },
        'desafios': {}, 
        'consolidacao': {}
    };

    function adaptarCardapio(cardapioOriginal, alergiasDoUsuario) {
        if (!alergiasDoUsuario || alergiasDoUsuario.length === 0) return cardapioOriginal;
        
        return cardapioOriginal.map(refeicao => {
            let textoAdaptado = refeicao.texto;
            alergiasDoUsuario.forEach(alergia => {
                const mapaSub = substituicoes[alergia.toLowerCase()];
                if (mapaSub) {
                    for (const alimento in mapaSub) {
                        const regex = new RegExp(`\\b${alimento}\\b`, 'gi');
                        textoAdaptado = textoAdaptado.replace(regex, mapaSub[alimento]);
                    }
                }
            });
            return { texto: textoAdaptado, pontos: refeicao.pontos };
        });
    }

    function calcularPontuacaoTotal(cardapio) {
        return cardapio.reduce((total, refeicao) => total + refeicao.pontos, 0);
    }

    function carregarTarefasConcluidas() {
        const tarefasSalvas = localStorage.getItem('tarefasConcluidas');
        return tarefasSalvas ? JSON.parse(tarefasSalvas) : {};
    }

    function salvarTarefasConcluidas(tarefas) {
        localStorage.setItem('tarefasConcluidas', JSON.stringify(tarefas));
    }

    function calcularPontuacaoAcumulada(tarefasConcluidas) {
        let total = 0;
        for (const key in tarefasConcluidas) {
            if (tarefasConcluidas[key].concluida) {
                total += tarefasConcluidas[key].pontos;
            }
        }
        return total;
    }

    function atualizarMensagemMotivacional(pontuacaoAtual, pontuacaoMeta) {
        if (!mensagemMotivacional) return;
        
        const porcentagem = (pontuacaoAtual / pontuacaoMeta) * 100;
        
        if (pontuacaoAtual === 0) {
            mensagemMotivacional.textContent = '🌱 Comece sua jornada! Marque suas primeiras tarefas.';
            mensagemMotivacional.className = 'mensagem-motivacional inicio';
        } else if (porcentagem < 50) {
            mensagemMotivacional.textContent = '💪 Bom começo! Continue completando as demandas.';
            mensagemMotivacional.className = 'mensagem-motivacional progresso';
        } else if (porcentagem >= 50 && porcentagem < 100) {
            mensagemMotivacional.textContent = '🔥 Você já cumpriu metade dos desafios, continue assim!';
            mensagemMotivacional.className = 'mensagem-motivacional metade';
        } else if (porcentagem >= 100) {
            mensagemMotivacional.textContent = '🎉 Parabéns! Você cumpriu todos os desafios!';
            mensagemMotivacional.className = 'mensagem-motivacional completo';
        }
    }

    function criarCheckboxTarefa(tarefa, index, diaAtual) {
        const li = document.createElement('li');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `tarefa-${diaAtual}-${index}`;
        checkbox.classList.add('task-checkbox');
        
        const tarefasConcluidas = carregarTarefasConcluidas();
        const chave = `${diaAtual}-${index}`;
        
        if (tarefasConcluidas[chave] && tarefasConcluidas[chave].concluida) {
            checkbox.checked = true;
            li.classList.add('tarefa-concluida');
        }
        
        checkbox.addEventListener('change', function() {
            const tarefas = carregarTarefasConcluidas();
            
            if (this.checked) {
                tarefas[chave] = {
                    concluida: true,
                    pontos: tarefa.pontos,
                    texto: tarefa.texto
                };
                li.classList.add('tarefa-concluida');
            } else {
                delete tarefas[chave];
                li.classList.remove('tarefa-concluida');
            }
            
            salvarTarefasConcluidas(tarefas);
            
            const pontuacaoAtual = calcularPontuacaoAcumulada(tarefas);
            if (pontuacaoTotalSpan) {
                pontuacaoTotalSpan.textContent = pontuacaoAtual;
            }
            
            const pontuacaoMeta = parseInt(pontuacaoUsuarioSpan.textContent) || 0;
            atualizarMensagemMotivacional(pontuacaoAtual, pontuacaoMeta);
        });
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.classList.add('task-label');
        
        const span = document.createElement('span');
        span.textContent = tarefa.texto;
        
        const pontosBadge = document.createElement('span');
        pontosBadge.classList.add('task-pontos');
        pontosBadge.textContent = `+${tarefa.pontos}`;
        
        label.appendChild(span);
        
        li.appendChild(checkbox);
        li.appendChild(label);
        li.appendChild(pontosBadge);
        
        return li;
    }

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
