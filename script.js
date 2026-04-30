// Configuración de la fecha de anuncio
const announcementDate = new Date("2026-05-30T00:00:00-03:00").getTime();

// Pistas disponibles
const hints = [
    "Pista 1: Llego la hora de prepararse.",
    "Pista 2: No va a ser una reunión más.",
    "Pista 3: Hay cosas que pasan lejos del ruido.",
    "Pista 4: Algo puede cambiar en un fin de semana."
];

// Elementos del DOM
const daysEl = document.getElementById("days");
const hoursEl = document.getElementById("hours");
const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

const preRevelationEl = document.getElementById("pre-revelation");
const postRevelationEl = document.getElementById("post-revelation");
const footerTextEl = document.getElementById("footer-text");
const currentHintEl = document.getElementById("current-hint");

// Función para actualizar la cuenta regresiva
function updateCountdown() {
    const now = new Date().getTime();
    const distance = announcementDate - now;

    if (distance <= 0) {
        // Llegó la fecha, mostrar revelación
        showRevelation();
        return;
    }

    // Cálculos de tiempo
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Actualizar UI
    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');

    // Lógica para mostrar las pistas basada en el tiempo restante
    // Como son 4 pistas, las dividimos en semanas.
    // Pista 1: Más de 21 días
    // Pista 2: Entre 14 y 21 días
    // Pista 3: Entre 7 y 14 días
    // Pista 4: Menos de 7 días
    let hintIndex = 0;
    if (days > 21) {
        hintIndex = 0;
    } else if (days > 14) {
        hintIndex = 1;
    } else if (days > 7) {
        hintIndex = 2;
    } else {
        hintIndex = 3;
    }

    currentHintEl.textContent = hints[hintIndex];
}

// Función para cambiar al modo revelación
function showRevelation() {
    // Si ya estamos en revelación, no hacer nada para no interrumpir repetidamente
    if (postRevelationEl.classList.contains("active")) return;

    preRevelationEl.classList.remove("active");
    postRevelationEl.classList.add("active");
    footerTextEl.textContent = "Ahora sí: contanos si venís.";

    // Podemos detener el intervalo ya que no hay más cuenta regresiva
    clearInterval(countdownInterval);
}

// Inicializar y establecer intervalo
updateCountdown();
const countdownInterval = setInterval(updateCountdown, 1000);
