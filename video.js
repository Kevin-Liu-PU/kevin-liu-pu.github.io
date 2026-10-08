document.querySelectorAll('.video-player').forEach(player => {
  const video = player.querySelector('video');
  const button = player.querySelector('.video-play');
  const status = player.querySelector('.video-status');
  if (!video || !button || !status) return;

  // Native controls in the HTML remain the fallback if enhancement cannot load.
  try {
    const playLabel = button.getAttribute('aria-label');
    let attempt = 0;
    let pending = false;
    let started = false;
    let timeout;
    let returnFocus = false;

    const focusIfNeeded = element => {
      if (returnFocus && (document.activeElement === button || document.activeElement === document.body)) {
        element.focus({ preventScroll: true });
      }
    };

    const retry = id => {
      if (id !== attempt) return;
      attempt += 1;
      clearTimeout(timeout);
      pending = false;
      started = false;
      video.pause();
      video.controls = false;
      video.tabIndex = -1;
      button.disabled = false;
      button.hidden = false;
      button.removeAttribute('aria-busy');
      button.setAttribute('aria-label', playLabel.replace(/^Play /, 'Retry playing '));
      status.textContent = "Playback couldn't start. Please try again.";
      status.hidden = false;
      focusIfNeeded(button);
    };

    video.addEventListener('playing', () => {
      if (!pending && !started) {
        video.pause();
        return;
      }
      clearTimeout(timeout);
      pending = false;
      started = true;
      video.controls = true;
      video.tabIndex = 0;
      focusIfNeeded(video);
      button.hidden = true;
      button.disabled = false;
      button.removeAttribute('aria-busy');
      status.hidden = true;
      status.textContent = '';
    });

    video.addEventListener('error', () => retry(attempt));

    button.addEventListener('click', async () => {
      if (pending || started) return;
      const id = ++attempt;
      pending = true;
      returnFocus = document.activeElement === button;
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');
      status.hidden = true;
      status.textContent = '';
      timeout = setTimeout(() => retry(id), 15000);
      try {
        if (video.error) video.load();
        await video.play();
      } catch {
        if (!started) retry(id);
      }
    });

    // Enable the custom entry point only after every handler is installed.
    button.hidden = false;
    video.controls = false;
    video.tabIndex = -1;
  } catch {
    video.controls = true;
    video.tabIndex = 0;
    button.hidden = true;
    status.hidden = true;
  }
});
