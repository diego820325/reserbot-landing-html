import { trialService } from './trial-service.js';

const form = document.querySelector('#trial-form');
const fields = form.querySelector('fieldset');
const notice = document.querySelector('#submission-notice');
const success = document.querySelector('#request-success');
let submitting = false;

// The HTML defaults to disabled so missing JavaScript cannot submit personal data.
if (trialService.available) {
  fields.disabled = false;
  notice.textContent = 'Todos los campos son obligatorios.';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!trialService.available || submitting || !form.reportValidity()) return;
  const request = Object.fromEntries(new FormData(form));
  submitting = true;
  fields.disabled = true;
  form.setAttribute('aria-busy', 'true');
  notice.textContent = 'Enviando tu solicitud…';
  try {
    const result = await trialService.submit(request);
    if (result?.accepted !== true) throw new Error('Submission not accepted.');
    form.hidden = true;
    notice.hidden = true;
    success.hidden = false;
    success.focus();
    form.reset();
  } catch {
    notice.textContent = 'No pudimos enviar tu solicitud. Tus datos no se han confirmado. Inténtalo de nuevo.';
    fields.disabled = false;
  } finally {
    submitting = false;
    form.removeAttribute('aria-busy');
  }
});
