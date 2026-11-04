// Throwaway iPhone storage probe. No patient data. One shared key for every page.
(function () {
  var KEY = "probe-shared-v1";
  var page = document.body.getAttribute("data-page");
  var mode = (window.navigator.standalone || matchMedia("(display-mode: standalone)").matches) ? "installed app" : "Safari tab";
  var events = [];

  function read() {
    try { return JSON.parse(localStorage.getItem(KEY)) || { n: 0, log: [] }; }
    catch (e) { return { n: 0, log: [], err: String(e) }; }
  }
  function t() { return new Date().toLocaleTimeString(); }
  function bump() {
    var s = read();
    s.n += 1;
    s.log.unshift("#" + s.n + " by " + page + " (" + mode + ") at " + t());
    s.log = s.log.slice(0, 12);
    try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { note("write failed: " + e); }
    show();
  }
  function note(msg) { events.unshift(t() + "  " + msg); events = events.slice(0, 12); show(); }
  function show() {
    var s = read();
    document.getElementById("where").textContent = page + " — open as: " + mode;
    document.getElementById("count").textContent = s.n;
    document.getElementById("log").textContent = s.log.length ? s.log.join("\n") : "(nothing written yet)";
    document.getElementById("events").textContent = events.length ? events.join("\n") : "(none yet)";
  }
  window.addEventListener("storage", function (e) { if (e.key === KEY) note("storage event: count is now " + read().n); });
  document.addEventListener("visibilitychange", function () { if (!document.hidden) note("came back (visibilitychange): count is " + read().n); });
  window.addEventListener("focus", function () { note("focus: count is " + read().n); });
  window.addEventListener("pageshow", function (e) { note("pageshow" + (e.persisted ? " (from cache)" : "") + ": count is " + read().n); });
  document.getElementById("plus").onclick = bump;
  document.getElementById("copy").onclick = function () {
    var s = read();
    var txt = "PROBE " + page + " | " + mode + " | count " + s.n + "\nwrites:\n" + s.log.join("\n") + "\nevents:\n" + events.join("\n");
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(
      function () { document.getElementById("copy").textContent = "Copied"; },
      function () { prompt("Copy this:", txt); });
  };
  show();
})();
