const fs = require('fs');

function generateSvg(heartPath, textY1, textY2, textSize1, textSize2, letterSpacing2 = '3px') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="shield" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f87171"/>
      <stop offset="30%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#b91c1c"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#ef4444" flood-opacity="0.45"/>
    </filter>
    <filter id="heartShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#7f1d1d" flood-opacity="0.3"/>
    </filter>
  </defs>

  <!-- Fundo escuro PWA -->
  <rect width="512" height="512" rx="118" fill="url(#bg)"/>

  <!-- Escudo Protetor Lindo e Amplo -->
  <path d="M 256 42 
           L 430 98 
           C 430 282, 256 428, 256 472 
           C 256 428, 82 282, 82 98 
           Z" 
        fill="url(#shield)" 
        filter="url(#glow)"
  />

  <!-- Borda interna suave de brilho -->
  <path d="M 256 58 
           L 414 108 
           C 414 272, 256 410, 256 452 
           C 256 410, 98 272, 98 108 
           Z" 
        fill="none" 
        stroke="#ffffff" 
        stroke-width="5" 
        stroke-opacity="0.25"
  />

  <!-- Coração Branco 100% contido DENTRO do escudo -->
  <path d="${heartPath}" fill="#ffffff" filter="url(#heartShadow)"/>

  <!-- Inscrição G6PD + LHPT em Vermelho Vivo -->
  <text x="256" y="${textY1}" 
        font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" 
        font-size="${textSize1}" 
        font-weight="900" 
        fill="#dc2626" 
        text-anchor="middle" 
        letter-spacing="1.5px">G6PD</text>

  <text x="256" y="${textY2}" 
        font-family="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif" 
        font-size="${textSize2}" 
        font-weight="800" 
        fill="#ef4444" 
        text-anchor="middle" 
        letter-spacing="${letterSpacing2}">LHPT</text>
</svg>`;
}

// Opção 1: Equilibrada (Proporção Áurea) - coração com borda generosa de 45px de escudo vermelho em toda a volta
const path1 = 'M 256 172 C 266 138, 292 112, 326 112 C 362 112, 386 142, 386 182 C 386 244, 318 296, 256 352 C 194 296, 126 244, 126 182 C 126 142, 150 112, 186 112 C 220 112, 246 138, 256 172 Z';
const svg1 = generateSvg(path1, 222, 256, 36, 23, '3px');

// Opção 2: Silhueta Afilada (Fenda profunda + base esbelta)
const path2 = 'M 256 178 C 265 144, 288 118, 320 118 C 354 118, 376 146, 376 184 C 376 252, 308 308, 256 368 C 204 308, 136 252, 136 184 C 136 146, 158 118, 192 118 C 224 118, 247 144, 256 178 Z';
const svg2 = generateSvg(path2, 226, 260, 35, 22, '3.5px');

// Opção 3: Compacta / Escudo Dominante (coração um pouco mais contido)
const path3 = 'M 256 168 C 264 136, 286 114, 316 114 C 348 114, 368 140, 368 176 C 368 234, 306 284, 256 338 C 206 284, 144 234, 144 176 C 144 140, 164 114, 196 114 C 226 114, 248 136, 256 168 Z';
const svg3 = generateSvg(path3, 218, 250, 33, 21, '3px');

const artifactDir = 'C:/Users/Geraldo.Toledo/.gemini/antigravity/brain/caefa2c5-edfd-4c12-bb82-016b2abef5b0';
fs.writeFileSync(`${artifactDir}/icon_lhpt_1.svg`, svg1);
fs.writeFileSync(`${artifactDir}/icon_lhpt_2.svg`, svg2);
fs.writeFileSync(`${artifactDir}/icon_lhpt_3.svg`, svg3);

console.log('SVGs generated successfully');
