(function () {
  'use strict';
  // Small, self-contained exam selection overlay. Runs after prep/exams.js
  // has defined EXAMS. If EXAMS is not present yet it polls a few times.

  const LS_KEY = 'jobhunt_current_exam';
  const MAX_POLL = 30; // ~3 seconds
  let polls = 0;

  function getExams() {
    return window.EXAMS || window.exams || null;
  }

  function validKey(k) {
    const exams = getExams();
    return exams && exams.some(e => e.key === k);
  }

  function showPicker(exams) {
    try { document.body.style.pointerEvents = 'none'; } catch (e) {}

    const overlay = document.createElement('div');
    overlay.id = 'exam-select-overlay';
    Object.assign(overlay.style, {
      position: 'fixed', inset: '0', zIndex: 2147483647,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(180deg, rgba(11,17,32,0.96), rgba(6,8,15,0.98))',
      padding: '20px', WebkitTapHighlightColor: 'transparent'
    });

    const card = document.createElement('div');
    Object.assign(card.style, {
      width: '100%', maxWidth: '460px', borderRadius: '14px',
      background: '#0f172a', border: '1px solid #1e293b', padding: '18px',
      boxSizing: 'border-box', color: '#e2e8f0', fontFamily: 'inherit'
    });

    card.innerHTML = `
      <h2 style="margin:0 0 6px; font-size:18px;">WHICH EXAM ARE YOU PREPARING FOR?</h2>
      <div style="color:#94a3b8; font-size:13px; margin-bottom:12px">Choose one exam and press CONTINUE. You can change this later from the menu.</div>
      <div id="_exam_options" style="display:flex;flex-direction:column;gap:10px;">
      </div>
      <div style="display:flex;justify-content:flex-end;margin-top:14px;">
        <button id="_exam_continue" disabled style="padding:9px 14px;border-radius:9px;border:0;background:#22c55e;color:#0b1120;font-weight:800;cursor:pointer">CONTINUE</button>
      </div>
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);
    // prevent background scrolling / interaction while picker is open
    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';

    const options = card.querySelector('#_exam_options');
    exams.forEach(e => {
      const label = document.createElement('label');
      Object.assign(label.style, {
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px', borderRadius: '10px', background: '#111827', cursor: 'pointer'
      });
      const radio = document.createElement('input');
      radio.type = 'radio'; radio.name = 'exam'; radio.value = e.key;
      radio.style.width = '18px'; radio.style.height = '18px';
      const txt = document.createElement('div');
      txt.innerHTML = `<div style="font-weight:700">${escapeHtml(e.name)}</div><div style="color:#94a3b8;font-size:13px">${escapeHtml(e.short || '')}</div>`;
      label.appendChild(radio);
      label.appendChild(txt);
      label.onclick = () => { radio.checked = true; continueBtn.disabled = false; };
      options.appendChild(label);
    });

    const continueBtn = card.querySelector('#_exam_continue');
    continueBtn.onclick = () => {
      const checked = options.querySelector('input[name=exam]:checked');
      if (!checked) return;
      try { localStorage.setItem(LS_KEY, checked.value); } catch (e) {}
      // tidy up in case something else reads localStorage synchronously
      try { document.documentElement.style.overflow = prevOverflow; } catch (e) {}
      // reload so the whole app initialises with a single exam key and no
      // competing state. A reload is acceptable and safe in the current
      // architecture.
      window.location.reload();
    };

    function escapeHtml(s){ return String(s||'').replace(/[&<>"]+/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]||c)); }
  }

  function start() {
    const exams = getExams();
    if (!exams || !exams.length) {
      if (polls++ < MAX_POLL) { setTimeout(start, 100); return; }
      // Could not find EXAMS; nothing to do.
      return;
    }

    let cur = null;
    try { cur = localStorage.getItem(LS_KEY); } catch (e) { cur = null; }

    if (cur && exams.some(e => e.key === cur)) return; // valid — normal app continues

    // Show the picker overlay which blocks the rest of the UI until an exam
    // has been selected and persisted.
    showPicker(exams);
  }

  // Start when DOM is ready; run as early as possible.
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
