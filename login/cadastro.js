const btnCadastro = document.getElementById("btnCadastro");
const btnLogin = document.getElementById("btnLogin");
const formCadastro = document.getElementById("formCadastro");
const formLogin = document.getElementById("formLogin");
const btnEnviarCadastro = document.getElementById("btnEnviarCadastro");
const cadastroInput = document.getElementById("cadastroInput");
const btnEnviarLogin = document.getElementById("btnEnviarLogin");
const loginInput = document.getElementById("loginInput");

// Novas constantes para os campos de senha
const senhaCadastroInput = document.getElementById("senhaCadastroInput");
const confirmarSenhaInput = document.getElementById("confirmarSenhaInput");
// Essa constante precisa do ID no HTML do campo de senha do Login
const senhaLoginInput = document.getElementById("senhaLoginInput"); 

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

// Após cadastro, redirecionar automaticamente para Login
btnEnviarCadastro.addEventListener("click", (e) => {
    e.preventDefault();

    // NOVO: Verificação de campos vazios para o cadastro
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

    localStorage.setItem('dadosUsuario', JSON.stringify(dadosUsuario));

    alert("Cadastro realizado com sucesso!");
    showTab("login");
});

// Aplica a nova máscara a ambos os campos
function addMaskListeners(inputElement) {
    if (inputElement) {
        inputElement.addEventListener("input", applyContatoMask);
        inputElement.addEventListener("blur", applyContatoMask);
        inputElement.addEventListener("paste", () => setTimeout(applyContatoMask, 0));
    }
}

addMaskListeners(cadastroInput);
addMaskListeners(loginInput);


// Verificar se o botão foi encontrado
console.log("Botão de login encontrado:", btnEnviarLogin);

// Ao clicar em 'Entrar', salva o contato e redireciona
if (btnEnviarLogin) {
    btnEnviarLogin.addEventListener("click", (e) => {
        e.preventDefault();
        console.log("Botão de login clicado!");

        // NOVO: Verificação de campos vazios para o login
        if (!loginInput || !senhaLoginInput) {
            alert("Erro: campos não encontrados!");
            console.error("loginInput:", loginInput, "senhaLoginInput:", senhaLoginInput);
            return;
        }

        if (!loginInput.value.trim() || !senhaLoginInput.value.trim()) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        const dadosExistentes = JSON.parse(localStorage.getItem('dadosUsuario')) || {};
        
        const contatoDigitado = loginInput.value;
        const senhaDigitada = senhaLoginInput.value;

        console.log("Tentando fazer login com:", contatoDigitado);
        console.log("Dados salvos:", dadosExistentes);

        if (dadosExistentes.contato === contatoDigitado && dadosExistentes.senha === senhaDigitada) {
            alert("Login realizado com sucesso!");
            window.location.href = "../formulario/formulario.html";
        } else {
            alert("Credenciais inválidas. Verifique seu email/telefone e senha.");
        }
    });
} else {
    console.error("Botão de login não encontrado! Verifique o ID 'btnEnviarLogin' no HTML.");
}