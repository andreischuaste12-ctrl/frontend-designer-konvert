// Contrato de tracking e checkout da loja: evento add_to_cart com SKU e valor.
window.dataLayer = window.dataLayer || [];
document.getElementById('add-to-cart')?.addEventListener('click', (event) => {
  const button = event.currentTarget;
  const color = document.querySelector('input[name="cor"]:checked')?.value;
  window.dataLayer.push({ event: 'add_to_cart', ecommerce: { currency: 'BRL', value: 389.9, items: [{ item_id: button.dataset.sku, item_variant: color, quantity: 1 }] } });
});
