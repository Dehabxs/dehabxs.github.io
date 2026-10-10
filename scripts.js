const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
}
menuButton.addEventListener('click', () => {
  const open = navigation.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia('(min-width: 721px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});
document.querySelector('#year').textContent = new Date().getFullYear();


// Enhance visible content only when motion is welcome and observation is supported.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
const revealElements = [...document.querySelectorAll('.section-top, .about > div:not(.flyby-stage), .experience-row, .project, .next-project, .education-grid article, .certificates > a, .contact')].filter(element => !element.closest('#experience, #projects'));
let revealObserver;
function configureReveals() {
  revealObserver?.disconnect();
  revealElements.forEach(element => element.classList.remove('reveal-pending'));
  if (motionPreference.matches || !('IntersectionObserver' in window)) return;
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.remove('reveal-pending');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
  revealElements.forEach(element => {
    if (element.getBoundingClientRect().top < window.innerHeight - 24) return;
    element.classList.add('scroll-reveal', 'reveal-pending');
    const siblings = [...element.parentElement.children];
    element.style.setProperty('--reveal-delay', (siblings.indexOf(element) % 3) * 65 + 'ms');
    revealObserver.observe(element);
  });
}
configureReveals();
motionPreference.addEventListener('change', configureReveals);

const progress = document.createElement('div');
progress.className = 'reading-progress';
progress.setAttribute('aria-hidden', 'true');
document.body.append(progress);
const universe = document.querySelector('.universe');
let framePending = false;
function updateScrollEffects() {
  const available = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = 'scaleX(' + (available > 0 ? Math.min(1, Math.max(0, window.scrollY / available)) : 0) + ')';
  const offset = motionPreference.matches ? 0 : Math.min(window.scrollY, 800) * 0.07;
  universe.style.setProperty('--scroll-drift', offset + 'px');
  framePending = false;
}
function scheduleScrollEffects() {
  if (!framePending) { framePending = true; requestAnimationFrame(updateScrollEffects); }
}
window.addEventListener('scroll', scheduleScrollEffects, { passive: true });
window.addEventListener('resize', scheduleScrollEffects);
motionPreference.addEventListener('change', scheduleScrollEffects);
updateScrollEffects();
// Keyboard navigation always brings a revealed, readable element into focus.
document.addEventListener('focusin', event => {
  const section = event.target.closest('.reveal-pending');
  if (section) { section.classList.remove('reveal-pending'); revealObserver?.unobserve(section); }
});


const flybyStage = document.querySelector('.flyby-stage');
if (flybyStage && 'IntersectionObserver' in window) {
  const flybyObserver = new IntersectionObserver(entries => {
    if (motionPreference.matches || !entries.some(entry => entry.isIntersecting)) return;
    flybyStage.classList.add('is-flying');
    flybyObserver.disconnect();
  }, { threshold: 0.65 });
  flybyObserver.observe(flybyStage);
  flybyStage.querySelector('.flyby-ship').addEventListener('animationend', event => {
    if (event.animationName === 'ship-pass') flybyStage.classList.remove('is-flying');
  });
}


// Section 02 arrives through a black hole once per page visit.
const experienceSection = document.querySelector('#experience');
const experiencePayload = document.querySelector('.experience-payload');
let blackHoleObserver;
let blackHoleTimeout;
function finishBlackHole() {
  experienceSection.classList.remove('hole-ready', 'hole-playing');
  blackHoleObserver?.disconnect();
  clearTimeout(blackHoleTimeout);
}
if (experienceSection && !motionPreference.matches && 'IntersectionObserver' in window) {
  experienceSection.classList.add('hole-ready');
  blackHoleObserver = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    experienceSection.classList.add('hole-playing');
    blackHoleObserver.disconnect();
    blackHoleTimeout = setTimeout(finishBlackHole, 5200);
  }, { threshold: 0.6, rootMargin: '0px 0px -40px 0px' });
  blackHoleObserver.observe(experienceSection.querySelector('.section-top'));
  experienceSection.querySelector('.black-hole').addEventListener('animationend', event => {
    if (event.animationName === 'black-hole-pass') finishBlackHole();
  });
  experiencePayload.addEventListener('focusin', finishBlackHole);
  motionPreference.addEventListener('change', event => { if(event.matches) finishBlackHole(); });
}


// Robot ribbon-cutting for Section 03; the tarp never blocks keyboard access.
const projectSection = document.querySelector('#projects');
let constructionObserver;
let constructionTimeout;
function finishConstruction() {
  if (document.querySelector('#secret-dialog')?.open) return;
  projectSection.classList.remove('construction-ready', 'construction-playing');
  constructionObserver?.disconnect();
  clearTimeout(constructionTimeout);
}
if (projectSection && !motionPreference.matches && 'IntersectionObserver' in window) {
  projectSection.classList.add('construction-ready');
  constructionObserver = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    projectSection.classList.add('construction-playing');
    constructionObserver.disconnect();
    constructionTimeout = setTimeout(finishConstruction, 6500);
  }, {threshold: 0.65, rootMargin: '0px 0px -40px 0px'});
  constructionObserver.observe(projectSection.querySelector('.section-top'));
  projectSection.querySelector('.red-tarp').addEventListener('animationend', event => {
    if (event.animationName === 'tarp-unveil') finishConstruction();
  });
  projectSection.querySelector('.project-payload').addEventListener('focusin', finishConstruction);
  motionPreference.addEventListener('change', event => { if (event.matches) finishConstruction(); });
}


const secretDialog = document.querySelector('#secret-dialog');
const secretCode = document.querySelector('#secret-code');
const codeStatus = document.querySelector('#code-status');
const robotButton = document.querySelector('.robot-builder');
robotButton.addEventListener('click', () => {
  clearTimeout(constructionTimeout);
  projectSection.classList.add('construction-paused');
  secretCode.value = '';
  codeStatus.textContent = '';
  secretCode.removeAttribute('aria-invalid');
  secretDialog.showModal();
  secretCode.focus();
});
document.querySelector('.dialog-close').addEventListener('click', () => secretDialog.close());
secretDialog.addEventListener('close', () => {
  projectSection.classList.remove('construction-paused');
  constructionTimeout = setTimeout(finishConstruction, 6500);
  robotButton.focus();
});
document.querySelector('#secret-form').addEventListener('submit', event => {
  event.preventDefault();
  if (secretCode.value.trim() === '117') {
    window.location.assign('secret.html');
  } else {
    codeStatus.textContent = 'Access denied. Think of a legendary Spartan.';
    secretCode.setAttribute('aria-invalid', 'true');
    secretCode.select();
  }
});
