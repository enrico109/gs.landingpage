/* =====================================================================
 *  A GRANDE FAMÍLIA - palco animado da família (seção "A família")
 *  JavaScript puro: desenha os 7 membros em SVG e conta a história.
 *
 *  Peças do HTML que este arquivo usa:
 *    #gf-palco (o <svg>), #gf-assistir, #gf-pausar, #gf-pontos, #gf-nomes,
 *    #gf-ficha-nome, #gf-ficha-texto, #gf-ficha-cor
 *  Classes criadas pelo script: .gf-ponto (bolinhas das cenas) e .gf-nome
 *  (botões com o nome de cada membro).
 *
 *  Ideia geral:
 *    - el() cria elementos SVG (como document.createElement, mas para SVG)
 *    - criarMembro() desenha um sensor com corpo, visor, rosto e expressões
 *    - CENAS guarda a história; cada cena diz onde cada personagem fica
 *    - quadro() roda ~60 vezes por segundo (requestAnimationFrame) e move
 *      cada personagem um pouquinho em direção ao lugar certo
 *    - com prefers-reduced-motion, o balanço e o tremor ficam desligados
 * ===================================================================== */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var svg = document.getElementById("gf-palco");
  if (!svg) return;            // a seção não está nesta página
  var modoFoto = false;
  var reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, a, pai) { var e = document.createElementNS(NS, tag); for (var k in a) e.setAttribute(k, a[k]); if (pai) pai.appendChild(e); return e; }
  function misturar(hex, alvo, k) {
    var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    var m = function (v) { return Math.round(v + (alvo - v) * k); };
    return "rgb(" + m(r) + "," + m(g) + "," + m(b) + ")";
  }
  function clarear(h, k) { return misturar(h, 255, k); }
  function escurecer(h, k) { return misturar(h, 0, k); }

  // ---------- A família: cada um com um corpo diferente ----------
  var FAMILIA = [
    { id: "dorival", nome: "Dorival", comodo: "Quarto", cor: "#4B5FA8", olhos: "sono", boca: "sorriso",
      texto: "Guarda o sono. À noite é paciente: espera o dobro do tempo, porque dormir parado é normal.", fala: "Pode dormir tranquila.",
      corpo: { tipo: "path", d: "M-96 -22 L-96 -64 C-96 -160 96 -160 96 -64 L96 -22 Z" }, visor: [-58, -118, 116, 52, 26], banda: -52, base: [-102, 204], topo: "lua" },
    { id: "lavinia", nome: "Lavínia", comodo: "Banheiro", cor: "#2A9DAA", olhos: "grande", boca: "sorriso",
      texto: "A mais atenta da família. No banheiro, 20 minutos sem movimento já é motivo para perguntar se está tudo bem.", fala: "Tá tudo bem aí?",
      corpo: { tipo: "path", d: "M0 -238 C34 -188 72 -138 72 -88 C72 -46 42 -22 0 -22 C-42 -22 -72 -46 -72 -88 C-72 -138 -34 -188 0 -238 Z" }, visor: [-46, -130, 92, 56, 26], banda: -62, base: [-64, 128], topo: null },
    { id: "salete", nome: "Salete", comodo: "Cozinha", cor: "#E0644F", olhos: "feliz", boca: "aberta",
      texto: "Acompanha o café, o almoço e o jantar. Se a cozinha fica em silêncio na hora de sempre, ela repara.", fala: "Café passado!",
      corpo: { tipo: "circle", cx: 0, cy: -106, r: 84 }, visor: [-52, -142, 104, 58, 28], banda: -66, base: [-68, 136], topo: "tampa" },
    { id: "luzia", nome: "Luzia", comodo: "Central", cor: "#F2A93B", olhos: "oculos", boca: "sorriso",
      texto: "A central. Ouve todos os outros e, se algo der errado, acende a luz na janela e chama ajuda.", fala: "Deixa comigo.",
      corpo: { tipo: "rect", x: -62, y: -212, w: 124, h: 192, rx: 62 }, visor: [-46, -174, 92, 62, 28], banda: -82, base: [-72, 144], topo: "lampada" },
    { id: "sofia", nome: "Sofia", comodo: "Sala", cor: "#8E6CC4", olhos: "piscada", boca: "sorriso",
      texto: "Faz companhia na hora da novela. Pequenos movimentos no sofá já bastam para ela saber que está tudo bem.", fala: "Começou a novela!",
      corpo: { tipo: "rect", x: -82, y: -176, w: 164, h: 154, rx: 52 }, visor: [-58, -148, 116, 60, 28], banda: -62, base: [-80, 160], topo: "coracao" },
    { id: "andrade", nome: "Andrade", comodo: "Corredor", cor: "#2E7D5B", olhos: "redondo", boca: "aberta",
      texto: "Fica no corredor, por onde todo mundo passa. É quem mais vê movimento durante o dia.", fala: "Vi ela passar!",
      corpo: { tipo: "rect", x: -46, y: -246, w: 92, h: 224, rx: 46 }, visor: [-36, -212, 72, 56, 24], banda: -72, base: [-58, 116], topo: null, faixa: true },
    { id: "portela", nome: "Portela", comodo: "Entrada", cor: "#4F7CAC", olhos: "redondo", boca: "sorriso",
      texto: "Cuida da porta. Recebe quem chega e percebe se alguém entra quando não deveria.", fala: "Quem vem lá?",
      corpo: { tipo: "rect", x: -70, y: -208, w: 140, h: 186, rx: 24 }, visor: [-52, -178, 104, 56, 22], banda: -74, base: [-80, 160], topo: "quepe", macaneta: true }
  ];
  var POR_ID = {}; FAMILIA.forEach(function (f) { POR_ID[f.id] = f; });
  var OLHO = "#FFE7B0";

  var defs = el("defs", {}, svg);
  var desfoque = el("filter", { id: "desfoque", x: "-50%", y: "-50%", width: "200%", height: "200%" }, defs);
  el("feGaussianBlur", { stdDeviation: 7 }, desfoque);
  var brilho = el("filter", { id: "brilho", x: "-100%", y: "-100%", width: "300%", height: "300%" }, defs);
  el("feGaussianBlur", { stdDeviation: 3.5 }, brilho);
  var gVisor = el("linearGradient", { id: "visor", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el("stop", { offset: "0%", "stop-color": "#2b3548" }, gVisor);
  el("stop", { offset: "100%", "stop-color": "#0c111b" }, gVisor);

  function formaCorpo(pai, c, attrs) {
    var a = {};
    for (var k in attrs) a[k] = attrs[k];
    if (c.tipo === "path") { a.d = c.d; return el("path", a, pai); }
    if (c.tipo === "circle") { a.cx = c.cx; a.cy = c.cy; a.r = c.r; return el("circle", a, pai); }
    a.x = c.x; a.y = c.y; a.width = c.w; a.height = c.h; a.rx = c.rx; return el("rect", a, pai);
  }

  // Desenha um membro com origem no chão, no centro (0,0)
  function criarMembro(pai, f) {
    var raiz = el("g", {}, pai);
    var sombra = el("ellipse", { cx: 0, cy: -6, rx: f.base[1] * 0.55, ry: 12, fill: "#1B2A41", "fill-opacity": 0.18, filter: "url(#desfoque)" }, raiz);
    var corpoG = el("g", {}, raiz);

    // Gradientes de volume
    var gc = el("linearGradient", { id: "c-" + f.id, x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
    el("stop", { offset: "0%", "stop-color": clarear(f.cor, 0.28) }, gc);
    el("stop", { offset: "45%", "stop-color": f.cor }, gc);
    el("stop", { offset: "100%", "stop-color": escurecer(f.cor, 0.3) }, gc);
    var gb = el("linearGradient", { id: "b-" + f.id, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el("stop", { offset: "0%", "stop-color": escurecer(f.cor, 0.15) }, gb);
    el("stop", { offset: "100%", "stop-color": escurecer(f.cor, 0.45) }, gb);
    var clip = el("clipPath", { id: "k-" + f.id }, defs);
    formaCorpo(clip, f.corpo, {});

    // Atrás do corpo
    var luzBrilho = null, bulbo = null;
    if (f.topo === "lampada") {
      luzBrilho = el("circle", { cx: 0, cy: -248, r: 44, fill: "#FFD27A", "fill-opacity": 0.45, filter: "url(#desfoque)" }, corpoG);
      el("rect", { x: -13, y: -230, width: 26, height: 22, rx: 5, fill: escurecer(f.cor, 0.35) }, corpoG);
      var gl = el("radialGradient", { id: "bulbo", cx: "40%", cy: "35%", r: "70%" }, defs);
      el("stop", { offset: "0%", "stop-color": "#fffaf0" }, gl);
      el("stop", { offset: "100%", "stop-color": "#FFD27A" }, gl);
      bulbo = el("circle", { cx: 0, cy: -250, r: 24, fill: "url(#bulbo)" }, corpoG);
    }
    if (f.topo === "coracao") el("line", { x1: 0, y1: -176, x2: 0, y2: -204, stroke: escurecer(f.cor, 0.35), "stroke-width": 5, "stroke-linecap": "round" }, corpoG);

    // Corpo com volume
    formaCorpo(corpoG, f.corpo, { fill: "url(#c-" + f.id + ")" });
    var vol = el("g", { "clip-path": "url(#k-" + f.id + ")" }, corpoG);
    el("ellipse", { cx: -30, cy: f.visor[1] - 10, rx: 30, ry: 60, fill: "#fff", "fill-opacity": 0.35, filter: "url(#desfoque)" }, vol);
    el("ellipse", { cx: 20, cy: -10, rx: 110, ry: 34, fill: "#0b1220", "fill-opacity": 0.22, filter: "url(#desfoque)" }, vol);
    var led = el("rect", { x: -120, y: f.banda, width: 240, height: 8, fill: clarear(f.cor, 0.6) }, vol);
    var ledBrilho = el("rect", { x: -120, y: f.banda - 3, width: 240, height: 14, fill: clarear(f.cor, 0.6), "fill-opacity": 0.5, filter: "url(#brilho)" }, vol);
    if (f.faixa) el("path", { d: "M-70 -126 L70 -160 L70 -144 L-70 -110 Z", fill: "#fff", "fill-opacity": 0.85 }, vol);

    // Base
    var b = f.base;
    el("rect", { x: b[0], y: -32, width: b[1], height: 24, rx: 12, fill: "url(#b-" + f.id + ")" }, corpoG);
    el("rect", { x: b[0] + 8, y: -31, width: b[1] - 16, height: 4, rx: 2, fill: "#fff", "fill-opacity": 0.18 }, corpoG);

    // Visor de vidro
    var v = f.visor, vx = v[0] + v[2] / 2, vy = v[1] + v[3] / 2;
    el("rect", { x: v[0], y: v[1], width: v[2], height: v[3], rx: v[4], fill: "url(#visor)" }, corpoG);
    el("path", { d: "M" + (v[0] + v[4] * 0.7) + " " + (v[1] + 7) + " H" + (v[0] + v[2] * 0.55), stroke: "#fff", "stroke-opacity": 0.22, "stroke-width": 4, "stroke-linecap": "round" }, corpoG);

    // Rosto
    var ex = v[2] * 0.2, ey = vy - 4, er = Math.min(8, v[3] * 0.14);
    var rosto = el("g", {}, corpoG);
    el("circle", { cx: vx - v[2] * 0.36, cy: vy + v[3] * 0.18, r: 6, fill: "#FF8FA3", "fill-opacity": 0.5 }, rosto);
    el("circle", { cx: vx + v[2] * 0.36, cy: vy + v[3] * 0.18, r: 6, fill: "#FF8FA3", "fill-opacity": 0.5 }, rosto);
    var olhos = el("g", {}, rosto);
    var olhosBrilho = el("g", { filter: "url(#brilho)", opacity: 0.7 }, olhos);
    var olhosNit = el("g", {}, olhos);
    function linha(g, d) { el("path", { d: d, stroke: OLHO, "stroke-width": 4.5, fill: "none", "stroke-linecap": "round" }, g); }
    function olhoTipo(g, tipo) {
      if (tipo === "redondo" || tipo === "oculos" || tipo === "grande") {
        var r = tipo === "grande" ? er * 1.3 : er;
        el("circle", { cx: vx - ex, cy: ey, r: r, fill: OLHO }, g);
        el("circle", { cx: vx + ex, cy: ey, r: r, fill: OLHO }, g);
      }
      if (tipo === "sono") { linha(g, "M" + (vx - ex - 8) + " " + (ey - 1) + " q8 8 16 0"); linha(g, "M" + (vx + ex - 8) + " " + (ey - 1) + " q8 8 16 0"); }
      if (tipo === "feliz") { linha(g, "M" + (vx - ex - 8) + " " + (ey + 3) + " q8 -11 16 0"); linha(g, "M" + (vx + ex - 8) + " " + (ey + 3) + " q8 -11 16 0"); }
      if (tipo === "piscada") { el("circle", { cx: vx - ex, cy: ey, r: er, fill: OLHO }, g); linha(g, "M" + (vx + ex - 8) + " " + (ey + 2) + " q8 -9 16 0"); }
    }
    olhoTipo(olhosBrilho, f.olhos); olhoTipo(olhosNit, f.olhos);
    if (f.olhos === "oculos") {
      el("circle", { cx: vx - ex, cy: ey, r: 13, stroke: OLHO, "stroke-width": 2.5, fill: "none" }, olhos);
      el("circle", { cx: vx + ex, cy: ey, r: 13, stroke: OLHO, "stroke-width": 2.5, fill: "none" }, olhos);
    }
    var olhosPreoc = el("g", { display: "none" }, rosto);
    el("circle", { cx: vx - ex, cy: ey + 2, r: er * 1.2, fill: OLHO }, olhosPreoc);
    el("circle", { cx: vx + ex, cy: ey + 2, r: er * 1.2, fill: OLHO }, olhosPreoc);
    linha(olhosPreoc, "M" + (vx - ex - 11) + " " + (ey - 14) + " l16 4");
    linha(olhosPreoc, "M" + (vx + ex + 11) + " " + (ey - 14) + " l-16 4");
    var olhosFeliz = el("g", { display: "none" }, rosto);
    linha(olhosFeliz, "M" + (vx - ex - 8) + " " + (ey + 3) + " q8 -11 16 0");
    linha(olhosFeliz, "M" + (vx + ex - 8) + " " + (ey + 3) + " q8 -11 16 0");

    var my = vy + v[3] * 0.22;
    var bocaN = el("g", {}, rosto);
    if (f.boca === "aberta") el("path", { d: "M" + (vx - 11) + " " + (my - 2) + " q11 16 22 0 Z", fill: OLHO }, bocaN);
    else linha(bocaN, "M" + (vx - 11) + " " + (my - 1) + " q11 11 22 0");
    var bocaO = el("circle", { cx: vx, cy: my + 2, r: 5, stroke: OLHO, "stroke-width": 3.5, fill: "none", display: "none" }, rosto);
    var bocaA = el("ellipse", { cx: vx, cy: my + 2, rx: 8, ry: 7, fill: OLHO, display: "none" }, rosto);
    var bocaF = el("path", { d: "M" + (vx - 12) + " " + (my - 3) + " q12 18 24 0 Z", fill: OLHO, display: "none" }, rosto);

    // Na frente do corpo
    if (f.topo === "lua") el("path", { d: "M64 -142 a16 16 0 1 0 18 20 a12 12 0 1 1 -18 -20 Z", fill: "#FFE7B0" }, corpoG);
    if (f.topo === "tampa") {
      el("ellipse", { cx: 0, cy: -186, rx: 36, ry: 9, fill: escurecer(f.cor, 0.3) }, corpoG);
      el("circle", { cx: 0, cy: -198, r: 9, fill: escurecer(f.cor, 0.3) }, corpoG);
    }
    if (f.topo === "coracao") el("path", { d: "M0 -196 C-15 -206 -13 -224 0 -214 C13 -224 15 -206 0 -196 Z", fill: "#FF8FA3" }, corpoG);
    if (f.topo === "quepe") {
      el("path", { d: "M-60 -208 Q-56 -250 0 -252 Q56 -250 60 -208 Z", fill: escurecer(f.cor, 0.3) }, corpoG);
      el("rect", { x: -78, y: -214, width: 156, height: 12, rx: 6, fill: "#1B2A41" }, corpoG);
      el("circle", { cx: 0, cy: -232, r: 7, fill: "#F2A93B" }, corpoG);
    }
    if (f.macaneta) el("circle", { cx: 52, cy: -104, r: 6, fill: "#F2C879" }, corpoG);

    return {
      raiz: raiz, corpo: corpoG, sombra: sombra, olhos: olhos, eyY: ey, luz: luzBrilho, bulbo: bulbo,
      expressao: function (e) {
        var preoc = e === "preocupado" || e === "alerta";
        olhos.setAttribute("display", preoc || e === "feliz" ? "none" : "inline");
        olhosPreoc.setAttribute("display", preoc ? "inline" : "none");
        olhosFeliz.setAttribute("display", e === "feliz" ? "inline" : "none");
        bocaN.setAttribute("display", e === "normal" ? "inline" : "none");
        bocaO.setAttribute("display", e === "preocupado" ? "inline" : "none");
        bocaA.setAttribute("display", e === "alerta" ? "inline" : "none");
        bocaF.setAttribute("display", e === "feliz" ? "inline" : "none");
      },
      led: function (cor) { led.setAttribute("fill", cor); ledBrilho.setAttribute("fill", cor); }
    };
  }

  // ---------- Cenário ----------
  var fundoDia = el("rect", { width: 1200, height: 600, fill: "#ffffff" }, svg);
  var gChao = el("linearGradient", { id: "chao", x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el("stop", { offset: "0%", "stop-color": "#F4F6F9" }, gChao);
  el("stop", { offset: "100%", "stop-color": "#E8EDF4" }, gChao);
  el("rect", { y: 452, width: 1200, height: 148, fill: "url(#chao)" }, svg);
  var fundoNoite = el("rect", { width: 1200, height: 600, fill: "#16233a", opacity: 0 }, svg);
  var estrelas = el("g", { opacity: 0 }, svg);
  [[90, 200], [190, 330], [1030, 210], [1110, 340], [960, 380], [80, 400], [1150, 250], [240, 220]].forEach(function (p, i) {
    el("circle", { cx: p[0], cy: p[1], r: i % 2 ? 1.6 : 2.4, fill: "#fff", "fill-opacity": 0.7 }, estrelas);
  });

  var legenda = el("text", { x: 600, y: 92, "text-anchor": "middle", fill: "#1B2A41", "font-size": 40, "font-weight": 800, "letter-spacing": "-0.5", opacity: 0 }, svg);
  var sublegenda = el("text", { x: 600, y: 132, "text-anchor": "middle", fill: "#5d6b80", "font-size": 22, opacity: 0 }, svg);
  var dica = el("text", { x: 600, y: 80, "text-anchor": "middle", fill: "#8a97aa", "font-size": 18, opacity: modoFoto ? 0 : 1 }, svg);
  dica.textContent = "Toque em um membro da família";

  var camadaRede = el("g", {}, svg);
  var camadaAtores = el("g", {}, svg);
  var camadaRotulos = el("g", {}, svg);

  // Dona Maria
  function criarMaria(pai) {
    var raiz = el("g", {}, pai);
    var sombra = el("ellipse", { cx: 0, cy: -4, rx: 34, ry: 7, fill: "#1B2A41", "fill-opacity": 0.16, filter: "url(#desfoque)" }, raiz);
    var corpo = el("g", {}, raiz);
    el("rect", { x: -16, y: -60, width: 32, height: 56, rx: 14, fill: "#F2A93B" }, corpo);
    el("rect", { x: -16, y: -60, width: 10, height: 50, rx: 5, fill: "#fff", "fill-opacity": 0.2 }, corpo);
    el("circle", { cx: 0, cy: -76, r: 15, fill: "#e8c3a0" }, corpo);
    el("path", { d: "M-15 -78 A15 15 0 0 1 15 -78 Q0 -86 -15 -78 Z", fill: "#d4d9e0" }, corpo);
    el("circle", { cx: 0, cy: -95, r: 7, fill: "#d4d9e0" }, corpo);
    el("circle", { cx: -5, cy: -76, r: 1.8, fill: "#1B2A41" }, corpo);
    el("circle", { cx: 5, cy: -76, r: 1.8, fill: "#1B2A41" }, corpo);
    el("path", { d: "M-4 -70 q4 3 8 0", stroke: "#1B2A41", "stroke-width": 1.6, fill: "none", "stroke-linecap": "round" }, corpo);
    var alerta = el("text", { x: 22, y: -96, "font-size": 28, "font-weight": 900, fill: "#B3261E", opacity: 0 }, raiz);
    alerta.textContent = "!";
    var zz = el("text", { x: 20, y: -104, "font-size": 20, "font-weight": 800, fill: "#b9c4d3", opacity: 0 }, raiz);
    zz.textContent = "z z";
    return { raiz: raiz, corpo: corpo, sombra: sombra, alerta: alerta, zz: zz };
  }

  var atores = {};
  FAMILIA.forEach(function (f, i) {
    var m = criarMembro(camadaAtores, f);
    m.fase = i * 0.9;
    m.raiz.style.cursor = "pointer";
    m.raiz.addEventListener("click", function (ev) { ev.stopPropagation(); selecionar(f.id); });
    atores[f.id] = m;
  });
  var maria = criarMaria(camadaAtores);
  atores.maria = maria;

  var rotulos = {};
  FAMILIA.forEach(function (f) {
    var g = el("g", { opacity: 0 }, camadaRotulos);
    var n = el("text", { "text-anchor": "middle", fill: "#1B2A41", "font-size": 20, "font-weight": 800 }, g); n.textContent = f.nome;
    var c = el("text", { "text-anchor": "middle", fill: escurecer(f.cor, 0.1), "font-size": 15, "font-weight": 700 }, g); c.textContent = f.comodo;
    rotulos[f.id] = { g: g, n: n, c: c };
  });

  // Balão de fala
  var balao = el("g", { opacity: 0 }, svg);
  var balaoR = el("rect", { rx: 18, height: 44, fill: "#fff", stroke: "#dfe5ee", "stroke-width": 2 }, balao);
  var balaoT = el("text", { "font-size": 18, "font-weight": 700, fill: "#1B2A41" }, balao);

  // Rede de ajuda (cenas 5 e 6)
  var REDE = {
    vizinho: { nome: "Vizinho", letra: "V", cor: "#2E7D5B" },
    filha: { nome: "Filha", letra: "F", cor: "#C9831F" },
    samu: { nome: "SAMU 192", letra: "S", cor: "#B3261E" },
    policia: { nome: "Polícia 190", letra: "P", cor: "#4F7CAC" }
  };
  var nos = {};
  Object.keys(REDE).forEach(function (k) {
    var r = REDE[k], g = el("g", { opacity: 0 }, camadaRede);
    var aro = el("circle", { r: 46, fill: r.cor, "fill-opacity": 0.15 }, g);
    var bola = el("circle", { r: 32, fill: "#dfe5ee" }, g);
    var l = el("text", { y: 9, "text-anchor": "middle", "font-size": 26, "font-weight": 800, fill: "#8a97aa" }, g); l.textContent = r.letra;
    var nome = el("text", { y: 66, "text-anchor": "middle", "font-size": 17, "font-weight": 700, fill: "#5d6b80" }, g); nome.textContent = r.nome;
    nos[k] = { g: g, aro: aro, bola: bola, l: l, nome: nome, x: 0, y: 300, o: 0, aceso: 0, alvo: 0, acende: 0 };
  });
  var fio = el("path", { fill: "none", stroke: "#dfe5ee", "stroke-width": 3, "stroke-dasharray": "2 8", "stroke-linecap": "round", opacity: 0 });
  camadaRede.insertBefore(fio, camadaRede.firstChild);

  // ---------- Cenas ----------
  // Cada ator: [x, y(chão), escala, opacidade, expressão]
  var GALERIA = {
    dorival: [120, 470, 0.86], lavinia: [270, 470, 0.86], salete: [420, 470, 0.86], luzia: [600, 470, 0.95],
    sofia: [780, 470, 0.86], andrade: [930, 470, 0.86], portela: [1080, 470, 0.86]
  };
  function galeria(extra) {
    var s = {};
    for (var id in GALERIA) s[id] = [GALERIA[id][0], GALERIA[id][1], GALERIA[id][2], 1, "normal"];
    s.maria = [600, 520, 1.6, 0, "normal"];
    if (extra) for (var k in extra) s[k] = extra[k];
    return s;
  }
  function apenas(lista) {
    var s = {};
    FAMILIA.forEach(function (f) { var G = GALERIA[f.id]; s[f.id] = [G[0], G[1] + 40, G[2] * 0.9, 0, "normal"]; });
    s.maria = [600, 500, 1.6, 0, "normal"];
    for (var k in lista) s[k] = lista[k];
    return s;
  }
  var linhaComMaria = {
    dorival: [90, 470, 0.72, 1, "feliz"], lavinia: [225, 470, 0.72, 1, "feliz"], salete: [360, 470, 0.72, 1, "feliz"], luzia: [495, 470, 0.8, 1, "feliz"],
    sofia: [805, 470, 0.72, 1, "feliz"], andrade: [945, 470, 0.72, 1, "feliz"], portela: [1090, 470, 0.72, 1, "feliz"], maria: [650, 478, 1.8, 1, "normal"]
  };

  var CENAS = [
    { dur: 5, titulo: "Esta é a Dona Maria.", sub: "Ela tem 78 anos e mora sozinha.", noite: false,
      atores: apenas({ maria: [600, 480, 2.2, 1, "normal"] }) },
    { dur: 5, titulo: "Mas ela não está sozinha.", sub: "Ela mora com a Grande Família.", noite: false, atores: linhaComMaria },
    { dur: 6, titulo: "Cada um cuida de um cômodo.", sub: "Sensores de presença: sem câmera, sem microfone.", noite: false, rotulos: true, atores: galeria() },
    { dur: 7, titulo: "15h12. Ela cai no banheiro.", sub: "Vinte minutos sem movimento. A Lavínia estranha.", noite: false,
      fala: ["lavinia", "Dona Maria? Tá tudo bem?", 1.8],
      atores: apenas({ lavinia: [430, 480, 1.15, 1, "preocupado"], maria: [760, 470, 1.8, 1, "caida"] }) },
    { dur: 8, titulo: "A Luzia acende a luz e chama ajuda.", sub: "Primeiro o vizinho e a família. Depois, o SAMU.", noite: false, luz: true,
      rede: [["vizinho", 560, 0.8], ["filha", 780, 1.9], ["samu", 1000, 3.0]],
      atores: apenas({ luzia: [270, 490, 1.15, 1, "alerta"] }) },
    { dur: 8, titulo: "3h da manhã. A porta abre.", sub: "O Dorival sabe que ela está na cama. A Luzia chama a polícia.", noite: true, luz: true,
      fala: ["dorival", "Ela está dormindo!", 1.2],
      rede: [["policia", 880, 2.6], ["vizinho", 1040, 3.4]],
      atores: apenas({ portela: [150, 490, 0.9, 1, "alerta"], dorival: [360, 490, 0.85, 1, "preocupado"], luzia: [590, 490, 1.0, 1, "alerta"] }) },
    { dur: 6.5, titulo: "A Grande Família.", sub: "Cuida sem vigiar. Chama gente de verdade.", noite: false, atores: linhaComMaria }
  ];

  // ---------- Estado ----------
  var estado = { modo: "galeria", cena: -1, tCena: 0, tocando: false, sel: null, pulo: {} };
  var atual = {};
  function alvoAtual() {
    if (estado.modo === "galeria") {
      var s = galeria();
      if (estado.sel) for (var id in s) if (id !== "maria") {
        s[id] = s[id].slice();
        if (id === estado.sel) { s[id][2] *= 1.12; s[id][4] = "feliz"; } else s[id][3] = 0.35;
      }
      return s;
    }
    return CENAS[estado.cena].atores;
  }
  // Começa já na posição certa
  (function () { var a = alvoAtual(); for (var id in a) atual[id] = { x: a[id][0], y: a[id][1], s: a[id][2], o: a[id][3] }; })();

  // ---------- Interface ----------
  var btnAssistir = document.getElementById("gf-assistir");
  var btnPausar = document.getElementById("gf-pausar");
  var pontos = document.getElementById("gf-pontos");
  var nomes = document.getElementById("gf-nomes");
  var ficha = { nome: document.getElementById("gf-ficha-nome"), texto: document.getElementById("gf-ficha-texto"), cor: document.getElementById("gf-ficha-cor") };

  CENAS.forEach(function (c, i) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "gf-ponto"; b.setAttribute("aria-label", "Cena " + (i + 1));
    b.addEventListener("click", function () { irCena(i); estado.tocando = true; btnPausar.textContent = "Pausar"; });
    pontos.appendChild(b);
  });
  FAMILIA.forEach(function (f) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "gf-nome"; b.dataset.id = f.id; b.setAttribute("aria-pressed", "false");
    b.innerHTML = '<i style="background:' + f.cor + '"></i>' + f.nome;
    b.addEventListener("click", function () { selecionar(f.id); });
    nomes.appendChild(b);
  });

  function selecionar(id) {
    if (estado.modo !== "galeria") voltarGaleria();
    estado.sel = estado.sel === id ? null : id;
    if (estado.sel) estado.pulo[id] = relogio;
    nomes.querySelectorAll(".gf-nome").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.id === estado.sel)); });
    if (estado.sel) {
      var f = POR_ID[id];
      ficha.nome.innerHTML = f.nome + "<small>" + f.comodo + "</small>";
      ficha.texto.innerHTML = f.texto + " <q>" + f.fala + "</q>";
      ficha.cor.style.background = f.cor;
    } else {
      ficha.nome.textContent = "Conheça a família";
      ficha.texto.textContent = "Toque em um deles, no palco ou nos nomes acima, para saber o que cada um faz.";
      ficha.cor.style.background = "var(--ambar)";
    }
  }
  svg.addEventListener("click", function () { if (estado.modo === "galeria" && estado.sel) selecionar(estado.sel); });

  function irCena(i) {
    estado.modo = "historia"; estado.cena = i; estado.tCena = 0; estado.sel = null;
    btnAssistir.textContent = "Voltar para a família";
    btnPausar.hidden = false; pontos.hidden = false;
    pontos.querySelectorAll(".gf-ponto").forEach(function (p, j) { p.classList.toggle("ativo", j === i); });
    nomes.querySelectorAll(".gf-nome").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
    var c = CENAS[i];
    legenda.textContent = c.titulo; sublegenda.textContent = c.sub;
    ficha.nome.textContent = c.titulo; ficha.texto.textContent = c.sub; ficha.cor.style.background = "var(--ambar)";
    // reposiciona os nós da rede
    Object.keys(nos).forEach(function (k) { nos[k].alvo = 0; nos[k].aceso = 0; });
    var pts = [];
    (c.rede || []).forEach(function (r) { var n = nos[r[0]]; n.x = r[1]; n.y = 300; n.alvo = 1; n.acende = r[2]; pts.push([r[1], 300]); });
    fio.setAttribute("d", pts.length ? "M" + pts.map(function (p) { return p.join(" "); }).join(" L") : "");
  }
  function voltarGaleria() {
    estado.modo = "galeria"; estado.cena = -1; estado.tocando = false;
    btnAssistir.textContent = "Assistir à história";
    btnPausar.hidden = true; pontos.hidden = true;
    Object.keys(nos).forEach(function (k) { nos[k].alvo = 0; });
    selecionar(null);
  }
  btnAssistir.addEventListener("click", function () {
    if (estado.modo === "galeria") { irCena(0); estado.tocando = true; btnPausar.textContent = "Pausar"; }
    else voltarGaleria();
  });
  btnPausar.addEventListener("click", function () {
    estado.tocando = !estado.tocando;
    btnPausar.textContent = estado.tocando ? "Pausar" : "Continuar";
  });

  // ---------- Animação ----------
  var relogio = 0, antes = performance.now();
  function suave(atualV, alvo, dt, vel) { return atualV + (alvo - atualV) * Math.min(1, dt * vel); }

  function quadro(agora) {
    var dt = Math.min((agora - antes) / 1000, 0.05); antes = agora;
    relogio += dt;
    if (estado.modo === "historia" && estado.tocando) {
      estado.tCena += dt;
      if (estado.tCena >= CENAS[estado.cena].dur) {
        if (estado.cena < CENAS.length - 1) irCena(estado.cena + 1);
        else { voltarGaleria(); }
      }
    }
    var historia = estado.modo === "historia";
    var cena = historia ? CENAS[estado.cena] : null;
    var tc = estado.tCena;

    // Fundo: dia ou noite
    var noite = cena && cena.noite ? 1 : 0;
    var on = parseFloat(fundoNoite.getAttribute("opacity"));
    on = suave(on, noite, dt, 3);
    fundoNoite.setAttribute("opacity", on.toFixed(3));
    estrelas.setAttribute("opacity", on.toFixed(3));

    // Textos
    var lo = historia ? Math.min(1, tc / 0.6) : 0;
    legenda.setAttribute("opacity", lo); legenda.setAttribute("fill", on > 0.5 ? "#F4F6F8" : "#1B2A41");
    sublegenda.setAttribute("opacity", historia ? Math.min(1, Math.max(0, (tc - 0.5) / 0.6)) : 0);
    sublegenda.setAttribute("fill", on > 0.5 ? "#b9c4d3" : "#5d6b80");
    legenda.setAttribute("transform", "translate(0 " + ((1 - lo) * 10).toFixed(1) + ")");
    dica.setAttribute("opacity", !historia && !estado.sel && !modoFoto ? 1 : 0);

    // Atores
    var alvo = alvoAtual();
    for (var id in alvo) {
      var a = alvo[id], c = atual[id], m = atores[id];
      c.x = suave(c.x, a[0], dt, 3.2); c.y = suave(c.y, a[1], dt, 3.2);
      c.s = suave(c.s, a[2], dt, 3.2); c.o = suave(c.o, a[3], dt, 3.6);
      var balanco = reduzir ? 0 : Math.sin(relogio * 1.6 + (m.fase || 0)) * 3;
      var pulo = 0;
      if (estado.pulo[id] !== undefined) {
        var p = relogio - estado.pulo[id];
        if (p < 0.55) pulo = Math.sin(p / 0.55 * Math.PI) * 26; else delete estado.pulo[id];
      }
      var tremor = a[4] === "alerta" && !reduzir ? Math.sin(relogio * 38) * 1.5 : 0;
      m.raiz.setAttribute("transform", "translate(" + (c.x + tremor).toFixed(1) + " " + c.y.toFixed(1) + ") scale(" + c.s.toFixed(3) + ")");
      m.raiz.setAttribute("opacity", c.o.toFixed(3));
      m.raiz.style.pointerEvents = c.o > 0.2 ? "auto" : "none";
      if (id === "maria") {
        var caida = a[4] === "caida";
        m.corpo.setAttribute("transform", caida ? "translate(40 -16) rotate(-90)" : "translate(0 " + (-balanco * 0.5).toFixed(1) + ")");
        m.alerta.setAttribute("x", caida ? -44 : 22); m.alerta.setAttribute("y", caida ? -50 : -96);
        m.alerta.setAttribute("opacity", caida ? (Math.sin(relogio * 5) > -0.3 ? 1 : 0.3) : 0);
        m.zz.setAttribute("opacity", 0);
        continue;
      }
      m.corpo.setAttribute("transform", "translate(0 " + (balanco - pulo).toFixed(1) + ")");
      m.sombra.setAttribute("rx", (POR_ID[id].base[1] * 0.55 * (1 - pulo / 80)).toFixed(1));
      m.expressao(a[4]);
      // piscar
      var ciclo = (relogio + m.fase * 1.7) % 4.6;
      var k = ciclo < 0.14 ? Math.abs(1 - ciclo / 0.07) : 1;
      m.olhos.setAttribute("transform", "translate(0 " + m.eyY + ") scale(1 " + Math.max(0.1, k).toFixed(2) + ") translate(0 " + (-m.eyY) + ")");
      // LED e lâmpada da Luzia
      var f = POR_ID[id];
      if (a[4] === "alerta") m.led(Math.sin(relogio * 9) > 0 ? "#ff5a4f" : "#ffb3ad");
      else if (a[4] === "preocupado") m.led("#FFD27A");
      else m.led(clarear(f.cor, 0.6));
      if (m.luz) {
        var acesa = cena && cena.luz;
        var intens = acesa ? (0.65 + 0.35 * Math.sin(relogio * 6)) : 0.35;
        m.luz.setAttribute("fill-opacity", intens.toFixed(2));
        m.luz.setAttribute("r", acesa ? 70 : 44);
      }
    }

    // Rótulos (nome e cômodo)
    FAMILIA.forEach(function (f) {
      var r = rotulos[f.id], c = atual[f.id];
      var mostrar = (!historia && !modoFoto) || modoFoto || (cena && cena.rotulos);
      var o = mostrar ? c.o : 0;
      r.g.setAttribute("opacity", o.toFixed(2));
      r.n.setAttribute("x", c.x); r.n.setAttribute("y", c.y + 44);
      r.c.setAttribute("x", c.x); r.c.setAttribute("y", c.y + 66);
    });

    // Fala
    var fala = cena && cena.fala;
    if (fala && tc > fala[2]) {
      var quem = atual[fala[0]], larg = fala[1].length * 9.6 + 36;
      var bx = Math.min(1180 - larg, Math.max(20, quem.x + 50)), by = quem.y - 270 * quem.s;
      balaoR.setAttribute("x", bx); balaoR.setAttribute("y", by); balaoR.setAttribute("width", larg);
      balaoT.setAttribute("x", bx + 18); balaoT.setAttribute("y", by + 29); balaoT.textContent = fala[1];
      balao.setAttribute("opacity", Math.min(1, (tc - fala[2]) / 0.4).toFixed(2));
    } else balao.setAttribute("opacity", 0);

    // Rede de ajuda
    var algumNo = false;
    Object.keys(nos).forEach(function (k) {
      var n = nos[k];
      n.o = suave(n.o, n.alvo, dt, 4);
      if (n.o > 0.01) algumNo = true;
      var aceso = n.alvo && tc > n.acende;
      n.aceso = suave(n.aceso, aceso ? 1 : 0, dt, 6);
      var cor = REDE[k].cor;
      n.g.setAttribute("opacity", n.o.toFixed(2));
      n.g.setAttribute("transform", "translate(" + n.x + " " + (n.y + (1 - n.o) * 16).toFixed(1) + ")");
      n.bola.setAttribute("fill", n.aceso > 0.5 ? cor : (on > 0.5 ? "#2a3a55" : "#dfe5ee"));
      n.l.setAttribute("fill", n.aceso > 0.5 ? "#fff" : "#8a97aa");
      n.aro.setAttribute("r", (40 + n.aceso * (8 + Math.sin(relogio * 4) * 4)).toFixed(1));
      n.aro.setAttribute("fill-opacity", (n.aceso * 0.18).toFixed(2));
      n.nome.setAttribute("fill", on > 0.5 ? "#b9c4d3" : "#5d6b80");
    });
    fio.setAttribute("opacity", algumNo ? 1 : 0);
    fio.setAttribute("stroke", on > 0.5 ? "#2a3a55" : "#dfe5ee");

    requestAnimationFrame(quadro);
  }
  requestAnimationFrame(quadro);
})();
