const LIMITE_ATENCAO_PADRAO = 120;    // minutos parada até ATENÇÃO (2 h)
const LIMITE_ALERTA_PADRAO = 240;     // minutos parada até ALERTA (4 h)
const LIMITE_ATENCAO_BANHEIRO = 20;   // no banheiro o limite é bem menor
const LIMITE_ALERTA_BANHEIRO = 40;
const MINUTOS_MAXIMOS = 1440;         // um dia inteiro (24 h x 60 min)


const COR_VERDE = "#2E7D5B";
const COR_AMBAR = "#F2A93B";
const COR_VERMELHO = "#B3261E";
const COR_AZUL_NOITE = "#1B2A41";
const COR_BRANCO = "#FFFFFF";

const INTERVALO_SLIDE = 6000;        


const preferenciaMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");


function pegar(id) {
  const elemento = document.getElementById(id);
  if (elemento === null) {
    console.warn("[A Grande Família] Falta no HTML o elemento com id=\"" + id + "\"");
  }
  return elemento;
}

// Conferir elementos 
function todosExistem(lista) {
  for (let i = 0; i < lista.length; i++) {
    if (lista[i] === null) {
      return false;
    }
  }
  return true;
}


// MENU INICIAL 

function iniciarMenu() {
  const links = document.querySelectorAll(".menu-link");
  if (links.length === 0) {
    console.warn("[A Grande Família] Nenhum link com class=\"menu-link\" no menu.");
    return;
  }

 
  const secoes = [];
  for (let i = 0; i < links.length; i++) {
    const id = links[i].getAttribute("href").slice(1);
    secoes.push(document.getElementById(id));
  }

  function atualizarMenu() {
    
    let indiceAtual = 0;

    
    for (let i = 0; i < secoes.length; i++) {
      if (secoes[i] !== null && secoes[i].getBoundingClientRect().top <= 150) {
        indiceAtual = i;
      }
    }

    const fimDaPagina = window.innerHeight + window.scrollY >= document.body.scrollHeight - 2;
    if (fimDaPagina) {
      indiceAtual = secoes.length - 1;
    }

    
    for (let i = 0; i < links.length; i++) {
      if (i === indiceAtual) {
        links[i].classList.add("ativo");
        links[i].setAttribute("aria-current", "true");   
      } else {
        links[i].classList.remove("ativo");
        links[i].removeAttribute("aria-current");
      }
    }
  }


  window.addEventListener("scroll", atualizarMenu);
  atualizarMenu();   
}

function iniciarSlideshow() {
  const caixa = pegar("slideshow");
  const botaoAnterior = pegar("slide-anterior");
  const botaoProximo = pegar("slide-proximo");
  const caixaBolinhas = pegar("slide-bolinhas");
  const botaoPausar = pegar("slide-pausar");
  if (!todosExistem([caixa, botaoAnterior, botaoProximo, caixaBolinhas, botaoPausar])) {
    return;
  }

  const slides = caixa.querySelectorAll(".slide");
  if (slides.length === 0) {
    console.warn("[A Grande Família] Nenhum class=\"slide\" dentro do #slideshow.");
    return;
  }

  let atual = 0;               
  let temporizador = null;     

  let pausado = preferenciaMovimento.matches;
  let mouseDentro = false;     
  let focoDentro = false;      

  // MANIPULAÇÃO DO DOM: criamos uma bolinha (<button>) para cada slide
  const bolinhas = [];
  for (let i = 0; i < slides.length; i++) {
    const bolinha = document.createElement("button");
    bolinha.type = "button";
    bolinha.className = "bolinha";
    bolinha.setAttribute("aria-label", "Mostrar imagem " + (i + 1) + " de " + slides.length);
    i
    bolinha.addEventListener("click", function () {
      mostrarSlide(i);
      reiniciarTroca();   
    });
    caixaBolinhas.appendChild(bolinha);
    bolinhas.push(bolinha);
  }

  // Mostra o slide da posição 
  function mostrarSlide(posicao) {
    mo
    if (posicao >= slides.length) {
      posicao = 0;
    } else if (posicao < 0) {
      posicao = slides.length - 1;
    }
    atual = posicao;

    for (let i = 0; i < slides.length; i++) {
      const visivel = (i === atual);
      slides[i].hidden = !visivel;                    
      slides[i].classList.toggle("ativo", visivel);   
      bolinhas[i].classList.toggle("ativa", visivel);
      if (visivel) {
        bolinhas[i].setAttribute("aria-current", "true");
      } else {
        bolinhas[i].removeAttribute("aria-current");
      }
    }
  }

 
  function ligarTroca() {
    
    if (temporizador !== null || pausado || mouseDentro || focoDentro) {
      return;
    }
    temporizador = setInterval(function () {
      mostrarSlide(atual + 1);
    }, INTERVALO_SLIDE);
  }

  // Desliga a troca 
  function desligarTroca() {
    clearInterval(temporizador);
    temporizador = null;
  }

  function reiniciarTroca() {
    desligarTroca();
    ligarTroca();
  }

  // Atualiza o texto 
  function atualizarBotaoPausar() {
    if (pausado) {
      botaoPausar.textContent = "Continuar troca automática";
    } else {
      botaoPausar.textContent = "Pausar troca automática";
    }
    botaoPausar.setAttribute("aria-pressed", String(pausado));
  }

  // Botões anterior e próximo
  botaoAnterior.addEventListener("click", function () {
    mostrarSlide(atual - 1);
    reiniciarTroca();
  });
  botaoProximo.addEventListener("click", function () {
    mostrarSlide(atual + 1);
    reiniciarTroca();
  });

 
  botaoPausar.addEventListener("click", function () {
    pausado = !pausado;
    if (pausado) {
      desligarTroca();
    } else {
      ligarTroca();
    }
    atualizarBotaoPausar();
  });

  
  caixa.addEventListener("mouseenter", function () {
    mouseDentro = true;
    desligarTroca();
  });
  caixa.addEventListener("mouseleave", function () {
    mouseDentro = false;
    ligarTroca();
  });

  
  caixa.addEventListener("focusin", function () {
    focoDentro = true;
    desligarTroca();
  });
  caixa.addEventListener("focusout", function (evento) {
    
    if (!caixa.contains(evento.relatedTarget)) {
      focoDentro = false;
      ligarTroca();
    }
  });

  // preferencia da pessoa 
  preferenciaMovimento.addEventListener("change", function () {
    pausado = preferenciaMovimento.matches;
    if (pausado) {
      desligarTroca();
    } else {
      ligarTroca();
    }
    atualizarBotaoPausar();
  });

  // slide troca 
  mostrarSlide(0);
  atualizarBotaoPausar();
  ligarTroca();
}


function somenteDigitos(texto) {
  let resultado = "";
  for (let i = 0; i < texto.length; i++) {
    const caractere = texto[i];
    if (caractere >= "0" && caractere <= "9") {
      resultado = resultado + caractere;
    }
  }
  return resultado;
}


function formatarTelefone(digitos) {
  const ddd = digitos.slice(0, 2);
  const numero = digitos.slice(2);
  const meio = numero.length - 4;  
  return "(" + ddd + ") " + numero.slice(0, meio) + "-" + numero.slice(meio);
}

// cada funcao corretaf
function validarNome(nome) {
  if (nome === "") {
    return "Digite o nome do vizinho.";
  }
  if (nome.length < 3) {
    return "O nome precisa ter pelo menos 3 letras.";
  }
  return "";
}

function validarTelefone(telefone) {
  if (telefone === "") {
    return "Digite o telefone com DDD.";
  }
  const digitos = somenteDigitos(telefone);
  if (digitos.length < 10 || digitos.length > 11) {
    return "Use DDD + número (10 ou 11 números). Exemplo: (11) 91234-5678.";
  }
  if (digitos[0] === "0") {
    return "O DDD não começa com 0. Exemplo: 11 para São Paulo.";
  }
  return "";
}

function validarBairro(bairro) {
  if (bairro === "") {
    return "Digite o bairro onde o vizinho mora.";
  }
  return "";
}

// Mostra (ou apaga) o erro de UM campo
function mostrarErro(campo, caixaErro, mensagem) {
  caixaErro.textContent = mensagem;
  if (mensagem === "") {
    campo.classList.remove("campo-invalido");
    campo.removeAttribute("aria-invalid");
  } else {
    campo.classList.add("campo-invalido");
    campo.setAttribute("aria-invalid", "true");   
  }
}
// avisa o erro do usario 

function iniciarFormularioVizinho() {
  const form = pegar("form-vizinho");
  const campoNome = pegar("vizinho-nome");
  const campoTelefone = pegar("vizinho-telefone");
  const campoBairro = pegar("vizinho-bairro");
  const erroNome = pegar("erro-nome");
  const erroTelefone = pegar("erro-telefone");
  const erroBairro = pegar("erro-bairro");
  const sucesso = pegar("form-sucesso");
  if (!todosExistem([form, campoNome, campoTelefone, campoBairro, erroNome, erroTelefone, erroBairro, sucesso])) {
    return;
  }
  o
  const lista = document.getElementById("lista-vizinhos");

  
  const campos = [campoNome, campoTelefone, campoBairro];
  const erros = [erroNome, erroTelefone, erroBairro];
  const validadores = [validarNome, validarTelefone, validarBairro];

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();   
    sucesso.hidden = true;

    let primeiroErrado = null;
    for (let i = 0; i < campos.length; i++) {
    
      const valor = campos[i].value.trim();
      const mensagem = validadores[i](valor);
      mostrarErro(campos[i], erros[i], mensagem);
      if (mensagem !== "" && primeiroErrado === null) {
        primeiroErrado = campos[i];
      }
    }

    
    if (primeiroErrado !== null) {
      primeiroErrado.focus();
      return;
    }

   
    const nome = campoNome.value.trim();
    const telefone = formatarTelefone(somenteDigitos(campoTelefone.value));
    const bairro = campoBairro.value.trim();

    // MANIPULAÇÃO DO DOM: mensagem de sucesso.
    
    sucesso.textContent = "Pronto! " + nome + " agora faz parte da rede de cuidado da Dona Maria. " +
      "Se a Luzia der ALERTA, a luz da janela chama " + nome + " primeiro.";
    sucesso.hidden = false;

    // MANIPULAÇÃO DO DOM: novo item na lista de vizinhos 
    if (lista !== null) {
      const item = document.createElement("li");
      item.textContent = nome + " · " + telefone + " · " + bairro;
      lista.appendChild(item);
    }

    form.reset();   // limpa os campos para cadastrar outro
    
  });

  // Enquanto a pessoa corrige um campo, o erro DAQUELE campo some
  for (let i = 0; i < campos.length; i++) {
    campos[i].addEventListener("input", function () {
      if (erros[i].textContent !== "") {
        mostrarErro(campos[i], erros[i], validadores[i](campos[i].value.trim()));
      }
    });
  }
}


/* ---------------------------------------------------------------------
 * 4. SIMULADOR DA GRANDE FAMÍLIA
 * A pessoa escolhe o cômodo, os minutos parada e se é noite. A página
 * calcula o estado com a MESMA regra do Python (calcular_limites e
 * classificar) e mostra a cor e a fala do personagem daquele cômodo.
 * --------------------------------------------------------------------- */

// A família. Uma lista de objetos: cada objeto junta os dados de um sensor.
// "noComodo" já vem com o artigo certo ("no quarto", "na sala") para as frases.
// "falas" segue a ordem dos estados: [NORMAL, ATENÇÃO, ALERTA]
const FAMILIA = [
  { comodo: "quarto", nome: "Dorival", nomeComodo: "Quarto", noComodo: "no quarto",
    falas: ["Pode dormir tranquila. Estou de olho no quarto.",
            "Dona Maria, a senhora está bem? Faz tempo que não se mexe.",
            "Ela não responde! Luzia, acende a luz da janela!"] },
  { comodo: "banheiro", nome: "Lavínia", nomeComodo: "Banheiro", noComodo: "no banheiro",
    falas: ["Tudo certo no banheiro.",
            "Dona Maria? Tá tudo bem aí?",
            "Ela não sai do banheiro! Luzia, chama ajuda agora!"] },
  { comodo: "cozinha", nome: "Salete", nomeComodo: "Cozinha", noComodo: "na cozinha",
    falas: ["Café passado! Tudo em ordem na cozinha.",
            "A cozinha está quieta demais... Tudo bem, Dona Maria?",
            "Nada de movimento na cozinha! Luzia, chama o vizinho!"] },
  { comodo: "sala", nome: "Sofia", nomeComodo: "Sala", noComodo: "na sala",
    falas: ["Começou a novela! Tudo bem por aqui.",
            "A senhora cochilou no sofá? Dá um sinal!",
            "Ela não se mexe no sofá! Luzia, chama ajuda!"] },
  { comodo: "corredor", nome: "Andrade", nomeComodo: "Corredor", noComodo: "no corredor",
    falas: ["Vi ela passar! Tudo normal.",
            "Faz tempo que ninguém passa por aqui...",
            "Ninguém se mexe no corredor! Luzia, alerta!"] },
  { comodo: "entrada", nome: "Portela", nomeComodo: "Entrada", noComodo: "na entrada",
    falas: ["Tudo tranquilo na porta.",
            "Ela está parada na entrada faz tempo. Tudo bem?",
            "Ela não se mexe na entrada! Luzia, chama o vizinho!"] }
];

// O que a Luzia faz em cada estado (mesma rede de cuidado do Python)
const ACOES = [
  "Ninguém é avisado. A família continua cuidando, sem vigiar.",
  "A Luzia pergunta para a Dona Maria: \"Está tudo bem?\". Ninguém é chamado ainda.",
  "A Luzia acende a luz da janela e toca o alarme: avisa o vizinho e o familiar, e depois o SAMU (192)."
];

// Procura na FAMILIA o sensor do cômodo escolhido (ex.: "banheiro" -> Lavínia)
function buscarSensor(comodo) {
  for (let i = 0; i < FAMILIA.length; i++) {
    if (FAMILIA[i].comodo === comodo) {
      return FAMILIA[i];
    }
  }
  return FAMILIA[0];   // não deveria acontecer; volta o primeiro por segurança
}

// Igual ao calcular_limites() do Python. Devolve [atencao, alerta] em minutos.
function calcularLimites(comodo, ehNoite, temperaturaExtrema) {
  let atencao;
  let alerta;
  if (comodo === "banheiro") {
    atencao = LIMITE_ATENCAO_BANHEIRO;
    alerta = LIMITE_ALERTA_BANHEIRO;
  } else {
    atencao = LIMITE_ATENCAO_PADRAO;
    alerta = LIMITE_ALERTA_PADRAO;
    // À noite, dormir parado é normal: os limites dobram (menos no banheiro)
    if (ehNoite) {
      atencao = atencao * 2;
      alerta = alerta * 2;
    }
  }
  // Casa fria ou quente demais: os limites caem pela metade.
  // Math.floor faz a divisão inteira, como o // do Python.
  if (temperaturaExtrema) {
    atencao = Math.floor(atencao / 2);
    alerta = Math.floor(alerta / 2);
  }
  return [atencao, alerta];
}

// Igual ao classificar() do Python. Devolve 0 (NORMAL), 1 (ATENÇÃO) ou 2 (ALERTA).
// Testa primeiro o caso mais grave, igual ao if/elif/else do Python.
function classificar(minutos, limites) {
  if (minutos >= limites[1]) {
    return 2;
  } else if (minutos >= limites[0]) {
    return 1;
  } else {
    return 0;
  }
}

// 300 vira "300 min (5 h)"; 90 vira "90 min (1 h 30 min)"; 20 vira "20 min"
function formatarMinutos(minutos) {
  if (minutos < 60) {
    return minutos + " min";
  }
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  let texto = minutos + " min (" + horas + " h";
  if (resto > 0) {
    texto = texto + " " + resto + " min";
  }
  return texto + ")";
}

function iniciarSimulador() {
  const form = pegar("form-simulador");
  const campoComodo = pegar("sim-comodo");
  const campoMinutos = pegar("sim-minutos");
  const campoNoite = pegar("sim-noite");
  const erroMinutos = pegar("erro-minutos");
  const resultado = pegar("sim-resultado");
  const textoEstado = pegar("sim-estado");
  const textoPersonagem = pegar("sim-personagem");
  const textoFala = pegar("sim-fala");
  const textoAcao = pegar("sim-acao");
  const textoExplicacao = pegar("sim-explicacao");
  if (!todosExistem([form, campoComodo, campoMinutos, campoNoite, erroMinutos, resultado,
                     textoEstado, textoPersonagem, textoFala, textoAcao, textoExplicacao])) {
    return;
  }
  // Opcional: a caixinha da temperatura
  const campoTemperatura = document.getElementById("sim-temperatura");

  // Listas paralelas dos 3 estados: nome, classe do CSS, cor de fundo e cor do texto
  const NOMES_ESTADO = ["NORMAL", "ATENÇÃO", "ALERTA"];
  const CLASSES_ESTADO = ["estado-normal", "estado-atencao", "estado-alerta"];
  const CORES_FUNDO = [COR_VERDE, COR_AMBAR, COR_VERMELHO];
  const CORES_TEXTO = [COR_BRANCO, COR_AZUL_NOITE, COR_BRANCO];   // contraste alto

  // Confere o campo dos minutos. Devolve o erro, ou "" se estiver certo.
  function validarMinutos(texto) {
    if (texto === "") {
      return "Digite há quantos minutos a Dona Maria está parada.";
    }
    const numero = Number(texto);   // "45" vira 45; "abc" vira NaN (não é número)
    if (!Number.isInteger(numero)) {
      return "Use um número inteiro de minutos, por exemplo 45.";
    }
    if (numero < 0 || numero > MINUTOS_MAXIMOS) {
      return "Use um valor de 0 a " + MINUTOS_MAXIMOS + " minutos (um dia inteiro).";
    }
    return "";
  }

  function simular() {
    const texto = campoMinutos.value.trim();
    const erro = validarMinutos(texto);
    mostrarErro(campoMinutos, erroMinutos, erro);
    if (erro !== "") {
      resultado.hidden = true;
      return;
    }

    // Ler o que a pessoa escolheu
    const minutos = Number(texto);
    const comodo = campoComodo.value;
    const ehNoite = campoNoite.checked;   // checkbox marcada = true
    let temperaturaExtrema = false;
    if (campoTemperatura !== null) {
      temperaturaExtrema = campoTemperatura.checked;
    }

    //  Decidir (a mesma conta do Python e do ESP32)
    const limites = calcularLimites(comodo, ehNoite, temperaturaExtrema);
    const estado = classificar(minutos, limites);
    const sensor = buscarSensor(comodo);

    //  MANIPULAÇÃO DO DOM (textos, classe e cores)
    textoEstado.textContent = NOMES_ESTADO[estado];
    textoEstado.style.backgroundColor = CORES_FUNDO[estado];
    textoEstado.style.color = CORES_TEXTO[estado];

    textoPersonagem.textContent = sensor.nome + " (" + sensor.nomeComodo + ")";
    textoFala.textContent = "“" + sensor.falas[estado] + "”";   
    textoAcao.textContent = ACOES[estado];

    // Explica a conta, para a pessoa entender POR QUE deu esse estado
    let explicacao = "Para quem está " + sensor.noComodo + ": ATENÇÃO a partir de " +
      formatarMinutos(limites[0]) + " e ALERTA a partir de " + formatarMinutos(limites[1]) + ".";
    if (ehNoite && comodo !== "banheiro") {
      explicacao = explicacao + " À noite os limites dobram, porque dormir parado é normal.";
    }
    if (ehNoite && comodo === "banheiro") {
      explicacao = explicacao + " No banheiro os limites NÃO dobram à noite: a Lavínia continua atenta.";
    }
    if (temperaturaExtrema) {
      explicacao = explicacao + " Com a casa muito fria ou muito quente, os limites caem pela metade.";
    }
    textoExplicacao.textContent = explicacao;

    // Troca a classe do resultado: tira as 3 e coloca só a do estado atual
    for (let i = 0; i < CLASSES_ESTADO.length; i++) {
      resultado.classList.remove(CLASSES_ESTADO[i]);
    }
    resultado.classList.add(CLASSES_ESTADO[estado]);
    resultado.hidden = false;
  }

  // Clicou em "Simular": não recarrega a página, só calcula
  form.addEventListener("submit", function (evento) {
    evento.preventDefault();
    simular();
  });

  // Se o resultado já está na tela e a pessoa muda o cômodo
  form.addEventListener("change", function () {
    if (!resultado.hidden) {
      simular();
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  iniciarMenu();
  iniciarSlideshow();
  iniciarFormularioVizinho();
  iniciarSimulador();
});
