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


