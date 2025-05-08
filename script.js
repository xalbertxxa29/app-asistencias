// script.js

// === Slideshow Background Injection ===
const styleEl = document.createElement('style');
styleEl.textContent = `
  .slideshow1, .slideshow2 {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    transition: opacity 1s ease-in-out;
    z-index: -2;
    opacity: 0;
  }
  .slideshow1.active, .slideshow2.active {
    opacity: 1;
  }
`;
document.head.appendChild(styleEl);

const slideA = document.createElement('div');
slideA.classList.add('slideshow1', 'active');
const slideB = document.createElement('div');
slideB.classList.add('slideshow2');
// Insert behind all content
document.body.prepend(slideB);
document.body.prepend(slideA);

// List of background image URLs (replace with your own paths)
const images = [
  'images/bg1.jpg',
  'images/bg2.jpg',
  'images/bg3.jpg',
];
let current = 0;
let activeSlide = slideA;
let nextSlideDiv = slideB;

// Preload all images
images.forEach(src => {
  const img = new Image();
  img.src = src;
});
// Set initial background
activeSlide.style.backgroundImage = `url('${images[0]}')`;

// Cycle to next background
function cycleBackground() {
  current = (current + 1) % images.length;
  nextSlideDiv.style.backgroundImage = `url('${images[current]}')`;
  nextSlideDiv.classList.add('active');
  activeSlide.classList.remove('active');
  [activeSlide, nextSlideDiv] = [nextSlideDiv, activeSlide];
}
// Change every 5 seconds
setInterval(cycleBackground, 5000);

// === 3D Tilt Effect on Buttons ===
const buttons = document.querySelectorAll('.report-btn');
buttons.forEach(btn => {
  btn.addEventListener('mousemove', (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = (x - cx) / cx;
    const dy = (y - cy) / cy;
    btn.style.transform = `rotateY(${dx * 10}deg) rotateX(${-dy * 10}deg) scale(1.05)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

// === Page Fade-out + Redirect ===
function redirectWithFade(url) {
  document.body.classList.add('fade-out');
  setTimeout(() => { window.location.href = url; }, 500);
}

document.getElementById('reporte-marcacion').addEventListener('click', () => {
  redirectWithFade('marcacion.html');
});
document.getElementById('reporte-mensual').addEventListener('click', () => {
  redirectWithFade('asistencia.html');
});
