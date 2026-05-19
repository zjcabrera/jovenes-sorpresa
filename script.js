// Configuración de la fecha de anuncio
const announcementDate = new Date("2026-05-30T00:00:00-03:00").getTime();

// Pistas disponibles
const hints = [
    "📡 Transmisión 01: Conseguí provisiones. El bunker no es seguro.",
    "📡 Transmisión 02 La zona segura está lejos de la ciudad. Preparate para moverte.",
    null, // Pista 3: cifrado Pigpen
    `📡 Transmisión 05: El registro encontró 3 perfiles, pero los nombres fueron eliminados.
Solo quienes logren identificar a los sobrevivientes podrán recuperar los fragmentos.`
];

// ========================================
// PIGPEN CLÁSICO — SVG Rendering
// ========================================
// Grilla 1 (A-I): 3x3, sin punto
// Grilla 2 (J-R): 3x3, con punto
// X 1 (S-V): S=arriba T=izquierda U=abajo V=derecha, sin punto
// X 2 (W-Z): W=arriba X=izquierda Y=abajo Z=derecha, con punto
//
// Grilla:  A|B|C    J.|K.|L.
//          D|E|F    M.|N.|O.
//          G|H|I    P.|Q.|R.
//
// Paredes por celda (t=top, b=bottom, l=left, r=right):
//   A: rb    B: lrb   C: lb
//   D: rtb   E: lrtb  F: ltb
//   G: rt    H: lrt   I: lt

const SZ = 30;
const S = 3;        // inicio de líneas (margen)
const E = SZ - S;   // fin de líneas
const M = SZ / 2;   // centro

// Paredes para grilla: t=top, b=bottom, l=left, r=right
const gridEdges = {
    'A': 'rb', 'B': 'lrb', 'C': 'lb',
    'D': 'rtb', 'E': 'lrtb', 'F': 'ltb',
    'G': 'rt', 'H': 'lrt', 'I': 'lt',
    'J': 'rb', 'K': 'lrb', 'L': 'lb',
    'M': 'rtb', 'N': 'lrtb', 'O': 'ltb',
    'P': 'rt', 'Q': 'lrt', 'R': 'lt'
};

// Letras con punto (grilla 2)
const dotLetters = new Set('JKLMNOPQR'.split(''));

// Direcciones de la X
const xDirs = {
    'S': 'down', 'T': 'left', 'U': 'up', 'V': 'right',
    'W': 'down', 'X': 'left', 'Y': 'up', 'Z': 'right'
};
const xDots = new Set('WXYZ'.split(''));

function createPigpenSVG(letter) {
    let paths = '';

    if (gridEdges[letter]) {
        const edges = gridEdges[letter];
        if (edges.includes('t')) paths += `<line x1="${S}" y1="${S}" x2="${E}" y2="${S}"/>`;
        if (edges.includes('b')) paths += `<line x1="${S}" y1="${E}" x2="${E}" y2="${E}"/>`;
        if (edges.includes('l')) paths += `<line x1="${S}" y1="${S}" x2="${S}" y2="${E}"/>`;
        if (edges.includes('r')) paths += `<line x1="${E}" y1="${S}" x2="${E}" y2="${E}"/>`;
        if (dotLetters.has(letter)) paths += `<circle cx="${M}" cy="${M}" r="3" fill="currentColor"/>`;
    } else if (xDirs[letter]) {
        const dir = xDirs[letter];
        if (dir === 'up') paths += `<polyline points="${S},${E} ${M},${S} ${E},${E}" fill="none"/>`;
        if (dir === 'left') paths += `<polyline points="${E},${S} ${S},${M} ${E},${E}" fill="none"/>`;
        if (dir === 'down') paths += `<polyline points="${S},${S} ${M},${E} ${E},${S}" fill="none"/>`;
        if (dir === 'right') paths += `<polyline points="${S},${S} ${E},${M} ${S},${E}" fill="none"/>`;
        if (xDots.has(letter)) paths += `<circle cx="${M}" cy="${M}" r="3" fill="currentColor"/>`;
    }

    return `<svg class="pigpen-char" viewBox="0 0 ${SZ} ${SZ}" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;
}

const PIGPEN_MESSAGE = "ACORDATE DE ESA NOCHE";
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function renderWord(word) {
    let html = '<span class="cipher-word">';
    for (const ch of word) html += createPigpenSVG(ch);
    html += '</span>';
    return html;
}

function renderMessage(msg) {
    return msg.split(' ').map(renderWord).join('<span class="cipher-space"></span>');
}

function renderScrambled(msg) {
    const s = msg.split('').map(ch => ch === ' ' ? ' ' : ALPHABET[Math.floor(Math.random() * 26)]).join('');
    return renderMessage(s);
}

// Cache del mensaje real
const realMessageHTML = renderMessage(PIGPEN_MESSAGE);

// ========================================
// DOM
// ========================================
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");
const preRevelationEl = document.getElementById("pre-revelation");
const postRevelationEl = document.getElementById("post-revelation");
const footerTextEl = document.getElementById("footer-text");
const currentHintEl = document.getElementById("current-hint");
const hintBoxEl = document.querySelector(".hint-box");
const cipherSectionEl = document.getElementById("cipher-section");
const cipherSymbolsEl = document.getElementById("cipher-symbols");
const cipherStatusEl = document.getElementById("cipher-status");
const dictToggleEl = document.getElementById("dict-toggle");
const dictOverlayEl = document.getElementById("dict-overlay");
const dictCloseEl = document.getElementById("dict-close");
const dictGridEl = document.getElementById("dict-grid");

const survivorOverlayEl = document.getElementById("survivor-overlay");
const survivorCloseEl = document.getElementById("survivor-close");
const survivorModalTitleEl = document.getElementById("survivor-modal-title");
const survivorQuestionEl = document.getElementById("survivor-question");
const survivorOptionsEl = document.getElementById("survivor-options");
const survivorResultEl = document.getElementById("survivor-result");
const survivorResultTextEl = document.getElementById("survivor-result-text");
const survivorFragmentEl = document.getElementById("survivor-fragment");

// ========================================
// Dictionary Modal
// ========================================
function renderDictionary() {
    let html = '';
    const sections = [
        'ABCDEFGHI',    // Grilla 1
        null,
        'JKLMNOPQR',    // Grilla 2
        null,
        'STUVWXYZ'      // X shapes
    ];
    sections.forEach(section => {
        if (section === null) {
            html += '<div class="dict-separator"></div>';
            return;
        }
        section.split('').forEach(letter => {
            html += `<div class="dict-cell">
                ${createPigpenSVG(letter)}
                <span class="dict-letter">${letter}</span>
            </div>`;
        });
    });
    dictGridEl.innerHTML = html;
}

function openDict() {
    dictOverlayEl.classList.add('open');
    if (!dictGridEl.hasChildNodes()) renderDictionary();
}

function closeDict() {
    dictOverlayEl.classList.remove('open');
}

dictToggleEl.addEventListener('click', openDict);
dictCloseEl.addEventListener('click', closeDict);
dictOverlayEl.addEventListener('click', (e) => {
    if (e.target === dictOverlayEl) closeDict();
});

// ========================================
// Cipher Interference Cycle
// ========================================
const INTERFERENCE_MS = 6000;
const STABLE_MS = 2000;
const REFRESH_MS = 300;

let cipherActive = false;
let refreshId = null;
let cycleId = null;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function startCipher() {
    if (cipherActive) return;
    cipherActive = true;
    if (prefersReducedMotion) { showStable(); return; }
    runCycle();
}

function stopCipher() {
    cipherActive = false;
    clearInterval(refreshId);
    clearTimeout(cycleId);
    refreshId = null;
    cycleId = null;
}

function runCycle() {
    showInterference();
    cycleId = setTimeout(() => {
        if (!cipherActive) return;
        showStable();
        cycleId = setTimeout(() => {
            if (!cipherActive) return;
            runCycle();
        }, STABLE_MS);
    }, INTERFERENCE_MS);
}

function showInterference() {
    cipherSymbolsEl.classList.add('interference');
    cipherSymbolsEl.classList.remove('stable');
    cipherStatusEl.textContent = 'Buscando señal…';
    cipherStatusEl.className = 'cipher-status searching';
    clearInterval(refreshId);
    cipherSymbolsEl.innerHTML = renderScrambled(PIGPEN_MESSAGE);
    refreshId = setInterval(() => {
        cipherSymbolsEl.innerHTML = renderScrambled(PIGPEN_MESSAGE);
    }, REFRESH_MS);
}

function showStable() {
    clearInterval(refreshId);
    refreshId = null;
    cipherSymbolsEl.innerHTML = realMessageHTML;
    cipherSymbolsEl.classList.remove('interference');
    cipherSymbolsEl.classList.add('stable');
    cipherStatusEl.textContent = 'Señal estabilizada';
    cipherStatusEl.className = 'cipher-status locked';
}

// ========================================
// Countdown
// ========================================
function updateCountdown() {
    const now = new Date().getTime();
    const distance = announcementDate - now;

    if (distance <= 0) { showRevelation(); return; }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');

    let hintIndex = 0;
    if (days > 21) hintIndex = 0;
    else if (days > 14) hintIndex = 3; // Mostrar Transmisión 05 ahora
    else if (days > 7) hintIndex = 3;
    else hintIndex = 3;

    if (hintIndex === 2) {
        hintBoxEl.style.display = 'none';
        cipherSectionEl.classList.add('active');
        startCipher();
    } else {
        hintBoxEl.style.display = 'flex';
        cipherSectionEl.classList.remove('active');
        stopCipher();
        currentHintEl.textContent = hints[hintIndex];
    }
}

function showRevelation() {
    if (postRevelationEl.classList.contains("active")) return;
    preRevelationEl.classList.remove("active");
    postRevelationEl.classList.add("active");
    footerTextEl.textContent = "Confirmá tu evacuación. No hay lugar para todos.";
    stopCipher();
    clearInterval(countdownInterval);
}

updateCountdown();
const countdownInterval = setInterval(updateCountdown, 1000);

// ========================================
// Survivors Polaroids
// ========================================
const survivors = [
    {
        id: 1,
        code: "SV-01",
        name: "Hay sonidos que alertan peligro y otros que recuerdan por qué todavía vale la pena seguir",
        image: "",
        question: "¿Qué perfil tendría más probabilidades de alterar el estado emocional del grupo sin necesidad de contacto físico?",
        options: ["Lautaro", "Nahiara", "Miqueas Jr", "Josi"],
        correctAnswer: "Nahiara",
        fragment: "EL PUENTE"
    },
    {
        id: 2,
        code: "SV-02",
        name: "En un mundo donde todo se rompe, alguien tenía que aprender qué hacer cuando ya es demasiado tarde.",
        image: "",
        question: "¿Qué integrante sería capaz de acercarse al daño cuando el resto decide retroceder?",
        options: ["Narella", "Mia", "Kiara", "Sofia"],
        correctAnswer: "Kiara",
        fragment: "TODAVIA..."
    },
    {
        id: 3,
        code: "SV-03",
        name: "Capacidad alta para interpretar patrones y transmitir información al grupo. Suele notar cosas que otros pasan por alto.",
        image: "",
        question: "Si alguien dejara señales para ayudar al resto a sobrevivir… ¿quién tendría más probabilidades de haberlas creado ? ",
        options: ["Isaias", "Thiago", "Tomas", "Lucas"],
        correctAnswer: "Isaias",
        fragment: "SIGUE INTACTO"
    }
];

const survivorsGridEl = document.getElementById("survivors-grid");

function getPlaceholderHTML() {
    return `
        <div class="polaroid-placeholder">
            <svg class="placeholder-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span class="placeholder-text">Imagen no recuperada</span>
        </div>
    `;
}

function renderSurvivors() {
    if (!survivorsGridEl) return;

    let html = '';
    survivors.forEach(survivor => {
        // Random rotation between -2deg and 2deg
        const randVar = Math.random();

        let imgContent = '';
        if (survivor.image && survivor.image.trim() !== '') {
            // Include onerror to fallback to placeholder if image fails to load
            imgContent = `<img src="${survivor.image}" alt="${survivor.name}" class="polaroid-img" onerror="this.outerHTML='${getPlaceholderHTML().replace(/'/g, "\\'")}'">`;
        } else {
            imgContent = getPlaceholderHTML();
        }

        const savedResult = localStorage.getItem(`survivor_${survivor.id}_result`);
        if (savedResult === 'success') survivor.verified = true;
        if (savedResult === 'error') survivor.failed = true;

        let cardClass = '';
        if (survivor.verified) cardClass = 'verified';
        if (survivor.failed) cardClass = 'failed';

        html += `
            <div class="polaroid-card ${cardClass}" id="polaroid-${survivor.id}" style="--rand: ${randVar};" onclick="openSurvivorModal(${survivor.id})">
                <div class="polaroid-img-container">
                    ${imgContent}
                </div>
                <div class="polaroid-info">
                    <div class="polaroid-code">${survivor.code}</div>
                    <div class="polaroid-name">${survivor.name}</div>
                </div>
            </div>
        `;
    });

    survivorsGridEl.innerHTML = html;
}

// Initialize the survivors grid
renderSurvivors();

function openSurvivorModal(id) {
    const survivor = survivors.find(s => s.id === id);
    if (!survivor) return;

    survivorModalTitleEl.textContent = `Identificación: ${survivor.code} - ${survivor.name}`;
    survivorQuestionEl.textContent = survivor.question;

    const savedResult = localStorage.getItem(`survivor_${id}_result`);

    // Render options
    let optionsHtml = '';
    survivor.options.forEach(option => {
        // Escape quotes to prevent HTML injection breaks
        const escapedOption = option.replace(/'/g, "\\'").replace(/"/g, '&quot;');
        const isDisabled = savedResult ? 'disabled' : '';
        optionsHtml += `<button class="survivor-option-btn" ${isDisabled} onclick="checkSurvivorAnswer(${id}, '${escapedOption}')">${option}</button>`;
    });
    survivorOptionsEl.innerHTML = optionsHtml;

    if (savedResult === 'success') {
        survivorResultEl.style.display = 'block';
        survivorResultEl.className = 'survivor-result success';
        survivorResultTextEl.textContent = 'Identidad confirmada. Fragmento recuperado:';
        survivorFragmentEl.textContent = survivor.fragment;
    } else if (savedResult === 'error') {
        survivorResultEl.style.display = 'block';
        survivorResultEl.className = 'survivor-result error';
        survivorResultTextEl.textContent = 'Acceso denegado. Sistema de seguridad bloqueado permanentemente.';
        survivorFragmentEl.textContent = 'ERROR';
    } else {
        survivorResultEl.style.display = 'none';
        survivorResultEl.className = 'survivor-result';
        survivorResultTextEl.textContent = '';
        survivorFragmentEl.textContent = '';
    }

    survivorOverlayEl.classList.add('open');
}

function closeSurvivorModal() {
    survivorOverlayEl.classList.remove('open');
}

function checkSurvivorAnswer(id, selectedOption) {
    const survivor = survivors.find(s => s.id === id);
    if (!survivor) return;

    const buttons = survivorOptionsEl.querySelectorAll('.survivor-option-btn');
    buttons.forEach(btn => btn.disabled = true);

    survivorResultEl.style.display = 'block';

    if (selectedOption === survivor.correctAnswer) {
        localStorage.setItem(`survivor_${id}_result`, 'success');
        survivorResultEl.className = 'survivor-result success';
        survivorResultTextEl.textContent = 'Identidad confirmada. Fragmento recuperado:';
        survivorFragmentEl.textContent = survivor.fragment;

        // Mark as verified visually in the grid
        survivor.verified = true;
        const polaroidEl = document.getElementById(`polaroid-${survivor.id}`);
        if (polaroidEl) {
            polaroidEl.classList.add('verified');
        }
    } else {
        localStorage.setItem(`survivor_${id}_result`, 'error');
        survivorResultEl.className = 'survivor-result error';
        survivorResultTextEl.textContent = 'Acceso denegado. Sistema de seguridad bloqueado permanentemente.';
        survivorFragmentEl.textContent = 'ERROR';

        // Block permanently
        survivor.failed = true;
        const polaroidEl = document.getElementById(`polaroid-${survivor.id}`);
        if (polaroidEl) {
            polaroidEl.classList.add('failed');
        }
    }
}

survivorCloseEl.addEventListener('click', closeSurvivorModal);
survivorOverlayEl.addEventListener('click', (e) => {
    if (e.target === survivorOverlayEl) closeSurvivorModal();
});
