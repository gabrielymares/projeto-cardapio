const btnCadastro = document.getElementById("btnCadastro");
const btnLogin = document.getElementById("btnLogin");
const formCadastro = document.getElementById("formCadastro");
const formLogin = document.getElementById("formLogin");
const btnEnviarCadastro = document.getElementById("btnEnviarCadastro");
const cadastroInput = document.getElementById("cadastroInput");
const btnEnviarLogin = document.getElementById("btnEnviarLogin");
const loginInput = document.getElementById("loginInput");

// Campos de senha
const senhaCadastroInput = document.getElementById("senhaCadastroInput");
const confirmarSenhaInput = document.getElementById("confirmarSenhaInput");
const senhaLoginInput = document.getElementById("senhaLoginInput");

// ==== CREDENCIAIS DO NUTRICIONISTA ====
const NUTRICIONISTA_EMAIL = "nutricionista@gmail.com";
const NUTRICIONISTA_SENHA = "nutri123";

// ==== Funções de máscara para o contato ====

function maskPhoneBR(digits) {
    const d = digits.replace(/\D/g, "").slice(0, 11);
    if (d.length === 0) return '';
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function applyContatoMask(e) {
    let val = e.target.value || "";
    val = val.trim();

    if (val.includes("@")) {
        e.target.setAttribute("inputmode", "email");
        e.target.maxLength = 254;
        e.target.value = val;
        return;
    }

    if (/^[\d()\s\-]*$/.test(val)) {
        const digits = val.replace(/\D/g, "");
        e.target.setAttribute("inputmode", "tel");
        e.target.maxLength = 16;
        e.target.value = maskPhoneBR(digits);
    } else {
        e.target.setAttribute("inputmode", "email");
        e.target.maxLength = 254;
        e.target.value = val;
    }
}

// Função para alternar abas
function showTab(tab) {
    if (tab === "cadastro") {
        btnCadastro.classList.add("active");
        btnLogin.classList.remove("active");
        formCadastro.classList.add("active");
        formLogin.classList.remove("active");
    } else {
        btnLogin.classList.add("active");
        btnCadastro.classList.remove("active");
        formLogin.classList.add("active");
        formCadastro.classList.remove("active");
    }
}

// Eventos de clique nos botões
btnCadastro.addEventListener("click", () => showTab("cadastro"));
btnLogin.addEventListener("click", () => showTab("login"));

// ==== CADASTRO ====
btnEnviarCadastro.addEventListener("click", (e) => {
    e.preventDefault();

    if (!cadastroInput.value.trim() || !senhaCadastroInput.value.trim() || !confirmarSenhaInput.value.trim()) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    if (senhaCadastroInput.value !== confirmarSenhaInput.value) {
        alert("As senhas não coincidem. Por favor, tente novamente.");
        return;
    }
    
    const dadosUsuario = {
        contato: cadastroInput.value,
        senha: senhaCadastroInput.value
    };

    // Salvar dados do usuário para o login
    window.localStorage.setItem('dadosUsuario', JSON.stringify(dadosUsuario));

    // NOVO: Adicionar à lista de clientes para o nutricionista
    let clientes = JSON.parse(window.localStorage.getItem('clientes') || '[]');
    
    // Verificar se já existe
    const jaExiste = clientes.some(c => c.telefone === dadosUsuario.contato);
    
    if (!jaExiste) {
        // Adicionar novo cliente (inicialmente sem dados completos)
        clientes.push({
            nome: 'Aguardando cadastro',
            genero: 'Não informado',
            altura: '0',
            idade: '0',
            peso: '0',
            telefone: dadosUsuario.contato,
            imc: '0',
            restricoes: 'Nenhuma restrição informada',
            saude: 'Informações não disponíveis'
        });
        
        window.localStorage.setItem('clientes', JSON.stringify(clientes));
    }

    alert("Cadastro realizado com sucesso!");
    
    // Limpar campos
    cadastroInput.value = '';
    senhaCadastroInput.value = '';
    confirmarSenhaInput.value = '';
    
    showTab("login");
});

// ==== LOGIN (AUTOMÁTICO) ====
if (btnEnviarLogin) {
    btnEnviarLogin.addEventListener("click", (e) => {
        e.preventDefault();

        if (!loginInput || !senhaLoginInput) {
            alert("Erro: campos não encontrados!");
            return;
        }

        if (!loginInput.value.trim() || !senhaLoginInput.value.trim()) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        const contatoDigitado = loginInput.value.trim();
        const senhaDigitada = senhaLoginInput.value;

        // PRIMEIRO: Verifica se é o nutricionista
        if (contatoDigitado === NUTRICIONISTA_EMAIL && senhaDigitada === NUTRICIONISTA_SENHA) {
            alert("Bem-vindo, Nutricionista!");
            window.location.href = "../nutricionista/telainicial.html";
            return;
        }

        // SEGUNDO: Verifica se é um usuário comum cadastrado
        const dadosExistentes = JSON.parse(window.localStorage.getItem('dadosUsuario')) || {};
        
        if (dadosExistentes.contato === contatoDigitado && dadosExistentes.senha === senhaDigitada) {
            alert("Login realizado com sucesso!");
            window.location.href = "../formulario/formulario.html";
        } else {
            alert("Credenciais inválidas. Verifique seu email/telefone e senha.");
        }
    });
}

// Aplicar máscaras
function addMaskListeners(inputElement) {
    if (inputElement) {
        inputElement.addEventListener("input", applyContatoMask);
        inputElement.addEventListener("blur", applyContatoMask);
        inputElement.addEventListener("paste", () => setTimeout(applyContatoMask, 0));
    }
}

addMaskListeners(cadastroInput);
addMaskListeners(loginInput);