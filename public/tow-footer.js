/* Theater on Wheels footer: embers + reveal-on-scroll. No dependencies. */
(function () {
  function init(f) {
    if (f.dataset.tfReady) return;
    f.dataset.tfReady = "1";
    var fx = f.querySelector(".tf-fx");
    for (var i = 0; i < 7; i++) {
      var p = document.createElement("i");
      p.style.cssText = "left:" + (8 + Math.random() * 84) + "%;--dx:" + (Math.random() * 60 - 30) +
        "px;animation-duration:" + (7 + Math.random() * 7) + "s;animation-delay:-" + Math.random() * 9 + "s";
      fx.appendChild(p);
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (e, o) {
        if (e[0].isIntersecting) { f.classList.add("tf-in"); o.disconnect(); }
      }, { threshold: 0.2 }).observe(f);
    } else f.classList.add("tf-in");
  }
  function run() { document.querySelectorAll(".tow-footer").forEach(init); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
})();
