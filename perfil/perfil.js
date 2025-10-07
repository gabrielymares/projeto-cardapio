document.addEventListener('DOMContentLoaded', carregarPerfil);

function carregarPerfil() {
    // === 1. Tenta buscar os dados cadastrais (Formulário) ===
    const dadosUsuarioSalvos = localStorage.getItem('dadosUsuario');
    const dadosUsuario = dadosUsuarioSalvos ? JSON.parse(dadosUsuarioSalvos) : null;
    
    // === 2. Tenta buscar os resultados da avaliação ===
    const resultadoAvaliacaoSalvos = localStorage.getItem('ultimaAvaliacao');
    const resultadoAvaliacao = resultadoAvaliacaoSalvos ? JSON.parse(resultadoAvaliacaoSalvos) : null;

    // --- CARREGAR DADOS CADASTRAIS (Altura, Peso, Nome, etc.) ---
    if (dadosUsuario) {
        try {
            // Preenchendo as informações de texto
            document.getElementById('perfil-nome').textContent = dadosUsuario.nome || '--';
            document.getElementById('perfil-idade').textContent = dadosUsuario.idade || '--';
            document.getElementById('perfil-sexo').textContent = dadosUsuario.sexo || '--';
            document.getElementById('perfil-contato').textContent = dadosUsuario.contato || '--';
            
            // Tratamento de Números (Altura, Peso, IMC)
            // Usa .toFixed(2) para garantir duas casas decimais, se o dado existir
            document.getElementById('perfil-altura').textContent = dadosUsuario.altura ? dadosUsuario.altura.toFixed(2) : '--';
            document.getElementById('perfil-peso').textContent = dadosUsuario.peso ? dadosUsuario.peso.toFixed(2) : '--';
            document.getElementById('perfil-imc').textContent = dadosUsuario.imc ? dadosUsuario.imc.toFixed(2) : '--';

        } catch (error) {
            console.error("Erro ao processar dados cadastrais:", error);
        }
    }

    // --- CARREGAR RESULTADOS DA AVALIAÇÃO (Pontuação, Grupo) ---
    if (resultadoAvaliacao) {
        try {
            // Pontuação
            document.getElementById('pontuacao-usuario').textContent = resultadoAvaliacao.pontuacao || '0';
            document.getElementById('pontuacao-total').textContent = '22'; // Mantendo o total fixo
            
            // Condições e Alergias
            const condicoesListUl = document.querySelector('.conditions-list ul');
            if (condicoesListUl) {
                condicoesListUl.innerHTML = '';
                
                // 1. Grupo (Fase do Programa)
                const grupoLi = document.createElement('li');
                grupoLi.textContent = `Grupo: ${resultadoAvaliacao.grupo || 'Não avaliado'}`;
                condicoesListUl.appendChild(grupoLi);
                
                // 2. Alergias
                if (resultadoAvaliacao.alergias && resultadoAvaliacao.alergias.length > 0) {
                    resultadoAvaliacao.alergias.forEach(alergia => {
                        const li = document.createElement('li');
                        li.textContent = `Alergia a ${alergia}`;
                        condicoesListUl.appendChild(li);
                    });
                }
            }
            
        } catch (error) {
            console.error("Erro ao processar resultados da avaliação:", error);
        }
    }
}
