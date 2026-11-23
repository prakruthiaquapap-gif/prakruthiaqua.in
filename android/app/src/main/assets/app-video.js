(() => {
  if (window.__prakruthiAppVideo) return;
  window.__prakruthiAppVideo = true;
  const selector = '.brand-loader video, .aqx-video video, .aqx-media video';
  const style = document.createElement('style');
  style.textContent = `.brand-loader{background:#031626!important}.brand-loader video{width:100%!important;height:100%!important;object-fit:contain!important;background:transparent!important}${selector.split(', ').map(s => s + '::-webkit-media-controls').join(',')}{display:none!important}`;
  style.textContent += '.brand-loader video.brand-loader-ambience{display:block!important;object-fit:cover!important;filter:blur(28px) brightness(.48);transform:scale(1.12);z-index:0!important}.brand-loader video:not(.brand-loader-ambience){z-index:1}.brand-loader-bottom{z-index:2}';
  document.head.appendChild(style);
  const prepare = video => {
    if (video.dataset.appPlaybackReady) return;
    video.dataset.appPlaybackReady = 'true';
    const loader = video.closest('.brand-loader');
    if (loader && !loader.querySelector('.brand-loader-ambience')) {
      const backdrop = video.cloneNode(true);
      backdrop.className = 'brand-loader-ambience';
      backdrop.removeAttribute('id');
      backdrop.removeAttribute('data-app-playback-ready');
      backdrop.autoplay = true;
      loader.prepend(backdrop);
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
    if (video.closest('.brand-loader') || video.classList.contains('is-front')) video.play().catch(() => {});
  };
  const scan = () => document.querySelectorAll(selector).forEach(prepare);
  scan();
  new MutationObserver(scan).observe(document.documentElement, {childList:true, subtree:true});
})();
