/**
 * Scroll-entrance watcher.
 *
 * Injected as a plain inline script rather than a React effect so it is
 * running before hydration — the page never sits with invisible blocks
 * waiting for a bundle. It adds `.is-in` to `.ax-rv-scroll` elements as they
 * enter the viewport, re-scans when the router swaps the tree, and has a
 * safety net so nothing can be left permanently invisible.
 */
export const revealWatcherScript = `
(function () {
  var SEL = '.ax-rv-scroll:not(.is-in)';
  var io = null;
  var queued = false;

  function show(el) {
    el.classList.add('is-in');
    if (io) io.unobserve(el);
  }

  function showAll() {
    var list = document.querySelectorAll(SEL);
    for (var i = 0; i < list.length; i++) list[i].classList.add('is-in');
  }

  function scan() {
    queued = false;
    if (!io) return;
    var list = document.querySelectorAll(SEL);
    for (var i = 0; i < list.length; i++) io.observe(list[i]);
  }

  function queueScan() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(scan);
  }

  function boot() {
    if (!('IntersectionObserver' in window)) { showAll(); return; }

    io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) show(entries[i].target);
      }
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.01 });

    scan();

    if ('MutationObserver' in window) {
      new MutationObserver(queueScan).observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    // Anything close to the fold is revealed regardless, so a stalled
    // observer can never leave the page looking empty.
    setTimeout(function () {
      var list = document.querySelectorAll(SEL);
      for (var i = 0; i < list.length; i++) {
        if (list[i].getBoundingClientRect().top < window.innerHeight * 1.6) {
          list[i].classList.add('is-in');
        }
      }
    }, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
`;
