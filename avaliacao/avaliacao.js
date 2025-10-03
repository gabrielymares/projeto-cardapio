document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formulario-avaliacao');

    formulario.addEventListener('submit', (e) => {
        e.preventDefault();

        // Garante que todas as perguntas obrigatórias sejam respondidas antes de prosseguir
        if (!validarFormulario()) return;

        const reverter = mostrarLoading();

        // 1. DADOS E PONTUAÇÃO (Recuperação da funcionalidade antiga)
        let pontuacaoTotal = 0;
        let temAlergiaIntestinal = false;
        let temRestricaoMetabolica = false;

        // Mapeamento e Pontuação das Respostas (Simulação do sistema de 50 pontos)
        const respostasPontuadas = {
            // Q1. Doença: NÃO = +10, SIM = +0
            p1_doenca: { 'nao': 10, 'sim': 0 },
            
            // Q4. Exercício: DIARIAMENTE = +10, 1-3 VEZES = +5, RARAMENTE = +0
            p4_exercicio: { 'diariamente': 10, 'algumas_vezes': 5, 'raramente': 0 },
            
            // Q5. Apetite: NORMAL = +10, BAIXO/AUMENTADO = +0
            p5_apetite: { 'normal': 10, 'baixo': 0, 'aumentado': 0 },

            // Q7. Refeições: 3 A 4 = +10, OUTROS = +0
            p7_refeicoes: { '3_ou_4': 10, '2_ou_menos': 0, '5_ou_mais': 0 },
            
            // Q10. Fome Emocional: NUNCA = +10, ÀS VEZES = +5, SEMPRE = +0
            p10_emocional: { 'nunca': 10, 'as_vezes': 5, 'sempre': 0 }
        };

        // Calcula a pontuação total (máx. 50)
        Object.keys(respostasPontuadas).forEach(name => {
            const resposta = document.querySelector(`input[name="${name}"]:checked`)?.value;
            if (resposta) {
                pontuacaoTotal += respostasPontuadas[name][resposta] || 0;
            }
        });

        // 2. CLASSIFICAÇÃO EM GRUPOS (Recuperação da funcionalidade antiga)
        
        // Alergias (Q2)
        const alergias = Array.from(document.querySelectorAll('input[name="p2_alergia"]:checked')).map(cb => cb.value);
        if (alergias.includes('lactose') || alergias.includes('gluten')) {
            temAlergiaIntestinal = true;
        }

        // Restrições (Q3) - Usando a mesma lógica de diabetes/hipertensão
        const restricaoTexto = document.querySelector('input[name="p3_outros"]')?.value.toLowerCase() || '';
        const doencaTexto = document.querySelector('input[name="p1_outros"]')?.value.toLowerCase() || '';

        const indicativosMetabolicos = ['diabetes', 'hipertensão', 'hipertenso', 'colesterol', 'renal'];
        
        // Verifica se a doença/restrição mencionada se encaixa em metabólica
        if (indicativosMetabolicos.some(cond => restricaoTexto.includes(cond) || doencaTexto.includes(cond))) {
            temRestricaoMetabolica = true;
        }


        // Lógica de classificação original (adaptada aos 50 pontos)
        let grupo = '';
        if (temAlergiaIntestinal) {
            grupo = 'Grupo 2 – Condições Intestinais';
        } else if (temRestricaoMetabolica) {
            grupo = 'Grupo 1 – Condições Metabólicas';
        } else if (pontuacaoTotal >= 40) {
            grupo = 'Grupo 3 – Estilo de Vida Saudável';
        } else if (pontuacaoTotal >= 25) { // 25 a 39 pontos
            grupo = 'Grupo 2 – Condições Intestinais';
        } else { // Menos de 25 pontos
            grupo = 'Grupo 1 – Condições Metabólicas';
        }
        
        // 3. COLETAR DADOS COMPLETOS E SALVAR
        
        // Coleta todas as respostas, incluindo os campos de texto
        const dadosCompletos = {
            // Resultados da pontuação e grupo
            pontuacao: pontuacaoTotal,
            grupo: grupo,
            
            // Respostas originais do formulário (incluindo textos)
            p1_doenca: document.querySelector('input[name="p1_doenca"]:checked')?.value || 'nao_respondeu',
            p1_doenca_outros: doencaTexto,
            p2_alergia: alergias.filter(v => v !== 'nenhuma'),
            p2_alergia_outros: document.querySelector('input[name="p2_outros"]')?.value || '',
            p3_restricao: document.querySelector('input[name="p3_restricao"]:checked')?.value || 'nao_respondeu',
            p3_restricao_outros: restricaoTexto,
            p4_exercicio: document.querySelector('input[name="p4_exercicio"]:checked')?.value || 'nao_respondeu',
            p5_apetite: document.querySelector('input[name="p5_apetite"]:checked')?.value || 'nao_respondeu',
            p6_objetivo: Array.from(document.querySelectorAll('input[name="p6_objetivo"]:checked')).map(cb => cb.value),
            p7_refeicoes: document.querySelector('input[name="p7_refeicoes"]:checked')?.value || 'nao_respondeu',
            p8_alimentos_evita: document.querySelector('textarea[name="p8_alimentos_evita"]')?.value || '',
            p9_frequencia: document.querySelector('textarea[name="p9_frequencia"]')?.value || '',
            p10_emocional: document.querySelector('input[name="p10_emocional"]:checked')?.value || 'nao_respondeu',
            
            timestamp: new Date().toISOString()
        };

        sessionStorage.setItem('resultadoAvaliacao', JSON.stringify(dadosCompletos)); // Mantive o nome da chave original para compatibilidade

        setTimeout(() => {
            reverter();
            window.location.href = "../pontuacao/pontuacao.html";
        }, 500);
    });
});

// Funções auxiliares (funções de aba, toggle, loading e validação mantidas)

function abrirAba(evt, nomeAba) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.getElementById(nomeAba).classList.add('active');
    evt.currentTarget.classList.add('active');
}

function toggleResposta(element) {
    const respostas = element.nextElementSibling;
    respostas.classList.toggle('active');
    element.classList.toggle('active');
}

function marcarNenhuma(cb) {
    document.querySelectorAll(`input[name="${cb.name}"]`).forEach(i => {
        if (i !== cb) {
            i.checked = false;
        }
    });
}

function mostrarCampoOutros(element, forceShow = null) {
    const name = element.name;
    const parent = element.closest('.respostas');
    const campoOutros = parent.querySelector(`input[name="${name.replace('_doenca', '_outros').replace('_restricao', '_outros')}"]`);
    
    if (!campoOutros) return;

    let shouldShow = element.checked;
    
    if (element.type === 'radio' && forceShow !== null) {
        shouldShow = (element.value === 'sim');
    } else if (element.type === 'checkbox' && element.value === 'outros') {
        shouldShow = element.checked;
    }
    
    if (shouldShow) {
        campoOutros.style.display = 'inline-block';
        if (element.type !== 'radio') campoOutros.focus();
    } else {
        campoOutros.style.display = 'none';
        campoOutros.value = '';
    }
}


function validarFormulario() {
    const perguntasObrigatorias = [
        'p1_doenca', 'p3_restricao', 'p4_exercicio', 'p5_apetite', 'p7_refeicoes', 'p10_emocional'
    ];
    let todosRadiosPreenchidos = true;

    // 1. Validar Rádios Obrigatórios
    for (const name of perguntasObrigatorias) {
        if (!document.querySelector(`input[name="${name}"]:checked`)) {
            alert('Por favor, responda todas as perguntas de escolha única.');
            todosRadiosPreenchidos = false;
            break;
        }
    }
    if (!todosRadiosPreenchidos) return false;

    // 2. Validar Checkbox (Objetivo - Q6)
    if (document.querySelectorAll('input[name="p6_objetivo"]:checked').length === 0) {
        alert('Por favor, selecione pelo menos um objetivo (Pergunta 6).');
        return false;
    }

    // 3. Validar Campos 'Outros' (Q1, Q2, Q3)
    const camposOutros = [
        { trigger: 'input[name="p1_doenca"][value="sim"]:checked', field: 'input[name="p1_outros"]' },
        { trigger: 'input[name="p2_alergia"][value="outros"]:checked', field: 'input[name="p2_outros"]' },
        { trigger: 'input[name="p3_restricao"][value="sim"]:checked', field: 'input[name="p3_outros"]' }
    ];

    for (const item of camposOutros) {
        if (document.querySelector(item.trigger)) {
            const campo = document.querySelector(item.field);
            if (!campo.value.trim()) {
                alert('Preencha o campo de especificação para sua resposta "Sim" ou "Outros".');
                campo.focus();
                return false;
            }
        }
    }

    // 4. Validar Checkbox Alergia (Q2)
    if (document.querySelectorAll('input[name="p2_alergia"]:checked').length === 0) {
        alert('Por favor, marque pelo menos uma opção para a pergunta de alergia/intolerância (Pergunta 2).');
        return false;
    }

    return true;
}

function mostrarLoading() {
    const botao = document.querySelector('#formulario-avaliacao button[type="submit"]');
    const texto = botao.innerHTML;
    botao.innerHTML = 'Processando... ⏳';
    botao.disabled = true;
    botao.style.opacity = '0.7';
    return () => { botao.innerHTML = texto; botao.disabled = false; botao.style.opacity = '1'; };
}
