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
