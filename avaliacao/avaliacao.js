document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.getElementById('formulario-avaliacao');

    formulario.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validarFormulario()) return;

        const reverter = mostrarLoading();

        // ===== COLETAR DADOS =====
        let pontuacaoTotal = 0;
        let temCondicaoIntestinal = false;
        let temCondicaoMetabolica = false;

        // Pontuação radio
        document.querySelectorAll('#formulario-avaliacao input[type="radio"]:checked').forEach(r => {
            pontuacaoTotal += parseInt(r.value);
        });

        // Alergias e restrições
        const alergias = Array.from(document.querySelectorAll('input[name="alergia"]:checked')).map(cb => cb.value);
        const restricoes = Array.from(document.querySelectorAll('input[name="restricao"]:checked')).map(cb => cb.value);

        if (alergias.includes('leite') || alergias.includes('gluten')) temCondicaoIntestinal = true;
        if (restricoes.includes('diabetes') || restricoes.includes('hipertensao') || restricoes.includes('gluten')) temCondicaoMetabolica = true;

        // Classificação
        let grupo = '';
        if (temCondicaoIntestinal) grupo = 'Grupo 2 – Condições Intestinais';
        else if (temCondicaoMetabolica) grupo = 'Grupo 1 – Condições Metabólicas';
        else if (pontuacaoTotal >= 40) grupo = 'Grupo 3 – Estilo de Vida Saudável';
        else if (pontuacaoTotal >= 25) grupo = 'Grupo 2 – Condições Intestinais';
        else grupo = 'Grupo 1 – Condições Metabólicas';

        const dados = {
            pontuacao: pontuacaoTotal,
            grupo: grupo,
            alergias: alergias.filter(a => a !== 'nenhuma'),
            restricoes: restricoes.filter(r => r !== 'nenhuma'),
            alergiaOutros: document.querySelector('input[name="alergia_outros"]')?.value || '',
            restricaoOutros: document.querySelector('input[name="restricao_outros"]')?.value || '',
            timestamp: new Date().toISOString()
        };

        sessionStorage.setItem('resultadoAvaliacao', JSON.stringify(dados));

        setTimeout(() => {
            reverter();
            window.location.href = "../pontuacao/pontuacao.html";
        }, 500);
    });
});

// Funções auxiliares
function abrirAba(evt, nomeAba) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    document.getElementById(nomeAba).classList.add('active');
    evt.currentTarget.classList.add('active');
}

function toggleResposta(element) {
    const respostas = element.nextElementSibling;
    respostas.style.display = respostas.style.display === 'block' ? 'none' : 'block';
}

function marcarNenhuma(cb) {
    document.querySelectorAll(`input[name="${cb.name}"]`).forEach(i => {
        if (i !== cb) {
            i.checked = false;
            const campo = i.parentElement.querySelector('.campo-outros');
            if (campo) campo.style.display = 'none';
        }
    });
}

function mostrarCampoOutros(cb) {
    const campo = cb.parentElement.querySelector('.campo-outros');
    campo.style.display = cb.checked ? 'inline-block' : 'none';
    if (cb.checked) campo.focus();
}

function validarFormulario() {
    const radios = document.querySelectorAll('#formulario-avaliacao input[type="radio"]');
    const grupos = {};
    radios.forEach(r => { grupos[r.name] = grupos[r.name] || false; if (r.checked) grupos[r.name] = true; });
    for (let g in grupos) if (!grupos[g]) { alert('Responda todas as perguntas!'); return false; }

    const checkboxes = document.querySelectorAll('#formulario-avaliacao input[type="checkbox"]');
    const gruposCb = {};
    checkboxes.forEach(c => { gruposCb[c.name] = gruposCb[c.name] || false; if (c.checked) gruposCb[c.name] = true; });
    for (let g in gruposCb) if (!gruposCb[g]) { alert('Marque pelo menos uma opção para cada pergunta!'); return false; }

    const outros = document.querySelectorAll('input[value="outros"]:checked');
    for (let o of outros) { const campo = o.parentElement.querySelector('.campo-outros'); if (!campo.value.trim()) { alert('Preencha o campo "Outros"!'); campo.focus(); return false; } }

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
