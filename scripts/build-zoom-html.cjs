const fs = require('fs');
const path = require('path');

const artifactDir = 'C:/Users/Geraldo.Toledo/.gemini/antigravity/brain/caefa2c5-edfd-4c12-bb82-016b2abef5b0';
const svgA = fs.readFileSync(path.join(artifactDir, 'icon_lhpt_a.svg'), 'utf8');
const svgB = fs.readFileSync(path.join(artifactDir, 'icon_lhpt_b.svg'), 'utf8');
const svgC = fs.readFileSync(path.join(artifactDir, 'icon_lhpt_c.svg'), 'utf8');

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zoom dos Ícones G6PD LHPT</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    body {
      margin: 0;
      padding: 16px;
      background: transparent;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #f8fafc;
    }
    .tab-btn {
      padding: 8px 16px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 13px;
      border: 1px solid #334155;
      background: #1e293b;
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .tab-btn.active {
      background: #0284c7;
      color: white;
      border-color: #38bdf8;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
    }
    .tab-btn:hover:not(.active) {
      background: #334155;
      color: #f8fafc;
    }
    .zoom-container {
      width: 100%;
      max-width: 380px;
      height: 380px;
      margin: 0 auto;
    }
  </style>
</head>
<body class="p-2">
  <div class="max-w-2xl mx-auto bg-[#0b1120] border border-[#1e293b] rounded-2xl p-6 shadow-2xl">
    
    <!-- Título -->
    <div class="text-center mb-6">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold mb-2">
        🔍 Visualização com Zoom Detalhado
      </div>
      <h2 class="text-xl sm:text-2xl font-black text-slate-100">
        Inspeção em Alta Resolução (380px)
      </h2>
      <p class="text-xs text-slate-400 mt-1">
        Alterne entre as opções abaixo para inspecionar as curvas do coração, a borda do escudo e a tipografia do <strong>LHPT</strong>:
      </p>
    </div>

    <!-- Abas de Seleção -->
    <div class="flex flex-wrap justify-center gap-2 mb-6">
      <button class="tab-btn active" onclick="switchOption('A')">Opção A (Recomendada)</button>
      <button class="tab-btn" onclick="switchOption('B')">Opção B (Monograma)</button>
      <button class="tab-btn" onclick="switchOption('C')">Opção C (Marca d'Água)</button>
    </div>

    <!-- Área de Exibição com Zoom Grande -->
    <div class="bg-slate-950/80 p-6 rounded-2xl border border-slate-800 flex flex-col items-center shadow-inner mb-6">
      
      <!-- Container Opção A -->
      <div id="view-A" class="zoom-view w-full flex flex-col items-center">
        <div class="zoom-container rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 mb-4">
          ${svgA}
        </div>
        <div class="text-center max-w-md">
          <span class="inline-block bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-bold px-3 py-1 rounded-full mb-2">
            Opção A: Tipografia Refinada & Equilibrada
          </span>
          <p class="text-xs text-slate-300 leading-relaxed">
            • Coração 100% contido dentro da armadura vermelha, com <strong>margem generosa de 45px</strong> de proteção ao redor.<br>
            • <strong>LHPT</strong> proporcional à palavra G6PD (50% do tamanho), com espaçamento luxuoso (tracking de 4px).
          </p>
        </div>
      </div>

      <!-- Container Opção B -->
      <div id="view-B" class="zoom-view w-full flex flex-col items-center hidden">
        <div class="zoom-container rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 mb-4">
          ${svgB}
        </div>
        <div class="text-center max-w-md">
          <span class="inline-block bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-bold px-3 py-1 rounded-full mb-2">
            Opção B: Micro-Monograma Delicado
          </span>
          <p class="text-xs text-slate-300 leading-relaxed">
            • <strong>· LHPT ·</strong> bem sutil e miniaturizado (15px), emoldurado por pontos elegantes de assinatura.<br>
            • Dá ênfase total à sigla médica G6PD, deixando as iniciais como um detalhe íntimo de família.
          </p>
        </div>
      </div>

      <!-- Container Opção C -->
      <div id="view-C" class="zoom-view w-full flex flex-col items-center hidden">
        <div class="zoom-container rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 mb-4">
          ${svgC}
        </div>
        <div class="text-center max-w-md">
          <span class="inline-block bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold px-3 py-1 rounded-full mb-2">
            Opção C: Marca d'Água Suave
          </span>
          <p class="text-xs text-slate-300 leading-relaxed">
            • <strong>LHPT</strong> translúcido com 65% de opacidade, parecendo gravado em baixo-relevo no coração branco.<br>
            • Contraste muito discreto e harmônico.
          </p>
        </div>
      </div>

    </div>

    <!-- Comparação Lado a Lado dos 3 Corações em Zoom -->
    <div class="border-t border-slate-800 pt-5">
      <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">
        Comparação Direta dos 3 Textos no Centro do Coração:
      </h3>
      <div class="grid grid-cols-3 gap-3 text-center">
        <div class="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
          <div class="w-20 h-20 mx-auto mb-2 rounded-xl overflow-hidden shadow">
            ${svgA}
          </div>
          <span class="text-[11px] font-bold text-sky-400 block">Opção A</span>
          <span class="text-[10px] text-slate-400">LHPT Clássico</span>
        </div>

        <div class="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
          <div class="w-20 h-20 mx-auto mb-2 rounded-xl overflow-hidden shadow">
            ${svgB}
          </div>
          <span class="text-[11px] font-bold text-purple-400 block">Opção B</span>
          <span class="text-[10px] text-slate-400">· LHPT · Pontos</span>
        </div>

        <div class="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
          <div class="w-20 h-20 mx-auto mb-2 rounded-xl overflow-hidden shadow">
            ${svgC}
          </div>
          <span class="text-[11px] font-bold text-amber-400 block">Opção C</span>
          <span class="text-[10px] text-slate-400">LHPT Marca d'Água</span>
        </div>
      </div>
    </div>

  </div>

  <script>
    function switchOption(opt) {
      document.querySelectorAll('.zoom-view').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      
      document.getElementById('view-' + opt).classList.remove('hidden');
      
      const buttons = document.querySelectorAll('.tab-btn');
      if (opt === 'A') buttons[0].classList.add('active');
      if (opt === 'B') buttons[1].classList.add('active');
      if (opt === 'C') buttons[2].classList.add('active');
    }
  </script>
</body>
</html>`;

fs.writeFileSync(path.join(artifactDir, 'icon_zoom_view.html'), html);
console.log('icon_zoom_view.html created successfully');
