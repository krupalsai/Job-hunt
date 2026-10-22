/* Privacy-conscious Job Hunt activity tracking.
   Logs navigation and clicks by stable element identifiers only. Never records
   typed values, form contents, response text, credentials, or arbitrary labels. */
(function () {
  if (window.__jobHuntActivityLoaded) return;
  window.__jobHuntActivityLoaded = true;
  const endpoint = "/api/activity";
  const lastSent = new Map();
  function pageName() {
    const path = String(location.pathname || "/").slice(0, 70);
    const hash = String(location.hash || "").replace(/[^a-zA-Z0-9_#-]/g, "").slice(0, 25);
    return (path + hash).slice(0, 100);
  }
  function send(eventType, label) {
    const key = eventType + ":" + (label || "");
    const now = Date.now();
    if (now - (lastSent.get(key) || 0) < 1200) return;
    lastSent.set(key, now);
    const body = JSON.stringify({
      event_type: eventType,
      page: pageName(),
      label: typeof label === "string" ? label.slice(0, 100) : null
    });
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        if (navigator.sendBeacon(endpoint, blob)) return;
      }
      fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true, credentials: "same-origin" }).catch(function () {});
    } catch (e) {}
  }
  function stableLabel(el) {
    if (!el) return null;
    const explicit = el.getAttribute("data-activity");
    if (explicit && /^[a-zA-Z0-9_.:-]{1,80}$/.test(explicit)) return explicit;
    if (el.id && /^[a-zA-Z0-9_.:-]{1,80}$/.test(el.id)) return "id:" + el.id;
    const tag = String(el.tagName || "").toLowerCase();
    const classes = Array.from(el.classList || []).filter(function (c) { return /^[a-zA-Z0-9_-]{1,35}$/.test(c); }).slice(0, 2);
    return tag + (classes.length ? "." + classes.join(".") : "");
  }
  send("page_view", pageName());
  window.addEventListener("hashchange", function () { send("page_view", pageName()); });
  document.addEventListener("click", function (event) {
    const target = event.target instanceof Element ? event.target.closest("button,a,[role='button']") : null;
    if (!target) return;
    send("click", stableLabel(target));
  }, true);
  document.addEventListener("submit", function (event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    send("form_submit", stableLabel(form));
  }, true);
})();
