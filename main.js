'use strict';

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* 1. Efecto de escritura en el hero */
(function tipeo() {
    const destino = $('#tipeo');
    const frases = [
        'print("Hola, mundo")',
        'estudiante = "Tecsup"',
        'lenguajes = ["Python", "C++", "Java"]',
        'while True: mejorar()'
    ];
    if (sinMovimiento) { destino.textContent = frases[0]; return; }

    let f = 0, c = 0, borrando = false;
    function paso() {
        const frase = frases[f];
        destino.textContent = frase.slice(0, c);
        let espera = borrando ? 35 : 75;

        if (!borrando && c === frase.length) { borrando = true; espera = 1600; }
        else if (borrando && c === 0) { borrando = false; f = (f + 1) % frases.length; espera = 350; }
        else c += borrando ? -1 : 1;

        setTimeout(paso, espera);
    }
    paso();
})();

/* 2. Menú móvil */
const menuBtn = $('#menuBtn');
const menu = $('#menu');

function cerrarMenu() {
    menu.classList.remove('abierto');
    menuBtn.setAttribute('aria-expanded', 'false');
}
menuBtn.addEventListener('click', () => {
    const abierto = menu.classList.toggle('abierto');
    menuBtn.setAttribute('aria-expanded', String(abierto));
});
$$('a', menu).forEach(a => a.addEventListener('click', cerrarMenu));
document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarMenu(); });

/* 3. Scroll: barra de progreso, nav con fondo y botón subir */
const nav = $('#nav');
const progreso = $('#progreso');
const subir = $('#subir');

function alScroll() {
    const y = window.scrollY;
    const total = document.documentElement.scrollHeight - innerHeight;
    progreso.style.width = (total > 0 ? (y / total) * 100 : 0) + '%';
    nav.classList.toggle('scroll', y > 40);
    subir.classList.toggle('visible', y > 600);
}
addEventListener('scroll', alScroll, { passive: true });
alScroll();
subir.addEventListener('click', () => scrollTo({ top: 0, behavior: sinMovimiento ? 'auto' : 'smooth' }));

/* 4. Marcar el enlace de la sección visible */
const enlaces = $$('#menu a');
const observador = new IntersectionObserver(entradas => {
    entradas.forEach(e => {
        if (!e.isIntersecting) return;
        enlaces.forEach(a => a.classList.toggle('activo', a.getAttribute('href') === '#' + e.target.id));
    });
}, { rootMargin: '-45% 0px -50% 0px' });
$$('main section[id]').forEach(s => observador.observe(s));

/* 5. Inclinación 3D en las tarjetas de skills (solo con mouse) */
if (!sinMovimiento && matchMedia('(hover: hover)').matches) {
    $$('[data-tilt]').forEach(tarjeta => {
        tarjeta.addEventListener('mousemove', e => {
            const r = tarjeta.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5;
            const y = (e.clientY - r.top) / r.height - 0.5;
            tarjeta.style.transform = `rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateY(-4px)`;
        });
        tarjeta.addEventListener('mouseleave', () => { tarjeta.style.transform = ''; });
    });
}

/* 6. Copiar correo y Discord */
const toast = $('#toast');
let temporizador;

function avisar(mensaje) {
    toast.textContent = mensaje;
    toast.classList.add('visible');
    clearTimeout(temporizador);
    temporizador = setTimeout(() => toast.classList.remove('visible'), 1800);
}

$$('.copiar').forEach(btn => {
    btn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(btn.dataset.copiar);
            avisar('Copiado');
        } catch {
            avisar('No se pudo copiar. Cópialo a mano.');
        }
    });
});