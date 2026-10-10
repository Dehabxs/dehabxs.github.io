const dropScene = document.querySelector('.drop-scene');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function playDrop() {
  if (reducedMotion.matches) return;
  dropScene.classList.remove('is-dropping');
  void dropScene.offsetWidth;
  dropScene.classList.add('is-dropping');
}
document.querySelector('.replay-drop').addEventListener('click', playDrop);
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    if(entries.some(entry => entry.isIntersecting)) {playDrop();observer.disconnect();}
  }, {threshold:.6});
  observer.observe(dropScene);
} else {playDrop();}
reducedMotion.addEventListener('change',()=>{if(reducedMotion.matches)dropScene.classList.remove('is-dropping');});
