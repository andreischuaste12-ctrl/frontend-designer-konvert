// Contrato de cadastro: envia nome, email, empresa e senha para /api/signup e registra sign_up.
const form = document.getElementById('signup-form');
form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  const error = form.querySelector('.form-error');
  if (!data.email || !data.senha || data.senha.length < 8) {
    error.textContent = 'Dados inválidos.';
    error.hidden = false;
    return;
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'sign_up', method: 'form' });
  await fetch(form.action, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
});
