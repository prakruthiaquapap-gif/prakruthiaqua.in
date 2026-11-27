(() => {
  if (window.__prakruthiAppVideo) return;
  window.__prakruthiAppVideo = true;
  const selector = '.brand-loader video, .aqx-video video, .aqx-media video';
  const style = document.createElement('style');
  style.textContent = `.brand-loader{background:#031626!important}.brand-loader video{width:100%!important;height:100%!important;object-fit:cover!important;object-position:50% 50%!important;background:transparent!important}${selector.split(', ').map(s => s + '::-webkit-media-controls').join(',')}{display:none!important}`;
  style.textContent += '.brand-loader video.brand-loader-ambience{display:none!important}.brand-loader-bottom{z-index:2}';
  style.textContent += '.aqx-video{background:transparent!important;transform:translateZ(0)}.aqx[data-app-banner-ready="false"]{visibility:hidden}';
  document.head.appendChild(style);
  const readyHeroes = new WeakSet();
  const startHero = hero => {
    if (readyHeroes.has(hero) || document.querySelector('.brand-loader')) return;
    const buttons = hero.querySelectorAll('button[aria-label^="Show slide "]');
    if (!buttons.length) return;
    readyHeroes.add(hero);
    // Reset the site's own carousel timer after the intro, with no visible jump.
    if (buttons.length > 1 && buttons[0].getAttribute('aria-pressed') === 'true') {
      buttons[buttons.length - 1].click();
    }
    requestAnimationFrame(() => {
      buttons[0].click();
      requestAnimationFrame(() => {
        hero.dataset.appBannerReady = 'true';
        hero.querySelectorAll('.aqx-video video.is-front').forEach(video => {
          video.currentTime = 0;
          video.play().catch(() => {});
        });
      });
    });
  };
  const prepare = video => {
    if (video.dataset.appPlaybackReady) return;
    video.dataset.appPlaybackReady = 'true';
    if (video.classList.contains('brand-loader-ambience')) { video.pause(); video.remove(); return; }
    if (video.closest('.aqx-video, .aqx-media')) {
      // Let the intro finish before allocating playback to the banner video.
      const deferDuringIntro = () => {
        if (document.querySelector('.brand-loader')) video.pause();
      };
      video.addEventListener('play', deferDuringIntro);
      deferDuringIntro();
    }
    // An explicit transparent poster also suppresses vendor WebView play artwork.
    video.poster = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
    video.controls = false;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.setAttribute('muted', '');
    video.removeAttribute('controls');
    if (video.closest('.brand-loader') || (video.classList.contains('is-front') && !document.querySelector('.brand-loader'))) video.play().catch(() => {});
  };
  const scan = () => {
    document.querySelectorAll(selector).forEach(prepare);
    document.querySelectorAll('.aqx').forEach(hero => {
      if (!readyHeroes.has(hero)) hero.dataset.appBannerReady = 'false';
      startHero(hero);
    });
  };
  scan();
  new MutationObserver(scan).observe(document.documentElement, {childList:true, subtree:true});
})();
