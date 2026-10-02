document.querySelectorAll('[data-demo]').forEach(link => {
  link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const video = link.parentElement.querySelector('video');
    link.hidden = true;
    video.hidden = false;
    video.focus();
    video.play().catch(() => { /* Native controls remain available. */ });
  });
});
