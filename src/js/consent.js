export const CONSENT_KEY = 'reserbot.analytics.consent';
export const CONSENT_VERSION = '2';

export function readConsent(storage) {
  try {
    const value = JSON.parse(storage.getItem(CONSENT_KEY));
    return value?.consent_version === CONSENT_VERSION &&
      ['accepted', 'rejected'].includes(value.state) ? value.state : 'undecided';
  } catch { return 'undecided'; }
}

export function writeConsent(storage, state) {
  if (!['accepted', 'rejected'].includes(state)) return false;
  try {
    storage.setItem(CONSENT_KEY, JSON.stringify({
      state, consent_version: CONSENT_VERSION, recorded_at: new Date().toISOString(),
    }));
    return true;
  } catch { return false; }
}

export function mountConsent(onChange) {
  let storage;
  try { storage = window.localStorage; } catch { /* Choice still works in memory. */ }
  let state = readConsent(storage);
  let returnFocus;
  const region = document.createElement('section');
  region.className = 'analytics-consent';
  region.setAttribute('aria-labelledby', 'analytics-consent-title');
  region.innerHTML = `<div class="analytics-consent-inner">
    <div><h2 id="analytics-consent-title" tabindex="-1">Tu privacidad</h2>
    <p>Solo si aceptas, usamos PostHog para analizar cómo utilizas Reserbot y mejorar tu experiencia. Puede incluir grabaciones de interacción, pero el formulario y sus campos quedan excluidos. Puedes cambiar tu decisión en Preferencias de analítica.</p></div>
    <div class="analytics-consent-actions"><button type="button" data-choice="accepted">Aceptar</button>
    <button type="button" data-choice="rejected">Rechazar</button>
    <a href="./privacidad.html" target="_blank" rel="noopener">Privacidad<span class="sr-only"> (abre otra pestaña)</span></a></div></div>`;
  const preferences = document.createElement('button');
  preferences.type = 'button';
  preferences.className = 'analytics-preferences';
  preferences.textContent = 'Preferencias de analítica';
  const footer = document.querySelector('footer > div, footer') || document.querySelector('main');
  footer.append(preferences);
  document.body.append(region);

  const reserveSpace = () => {
    document.documentElement.style.setProperty('--consent-height', `${region.hidden ? 0 : region.getBoundingClientRect().height}px`);
  };
  new ResizeObserver(reserveSpace).observe(region);
  const render = () => { region.hidden = state !== 'undecided'; reserveSpace(); };
  preferences.addEventListener('click', () => {
    returnFocus = preferences;
    region.hidden = false;
    reserveSpace();
    region.querySelector('h2').focus({ preventScroll: true });
  });
  region.addEventListener('click', event => {
    const choice = event.target.closest('[data-choice]')?.dataset.choice;
    if (!choice) return;
    state = choice;
    writeConsent(storage, state);
    onChange(state);
    render();
    (returnFocus || preferences).focus({ preventScroll: true });
  });
  window.addEventListener('storage', event => {
    if (event.key !== CONSENT_KEY && event.key !== null) return;
    state = readConsent(storage);
    onChange(state);
    render();
  });
  render();
  onChange(state);
}
