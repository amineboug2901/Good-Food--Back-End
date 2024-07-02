let forms = document.querySelectorAll(".quantity-input-group");

/**
 * Ajoute un produit au panier.
 *
 * @param {Event} event - L'événement de clic sur le bouton d'ajout au panier.
 */
const addToCart = (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const qt = form.querySelector("input[type=number]");
  const submitBtn = form.querySelector("input[type=submit]");

  let data = {
    id_produit: parseInt(submitBtn.id),
    quantity: parseInt(qt.value),
  };
  fetch("/api/panier", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

for (let form of forms) {
  form.addEventListener("submit", addToCart);
}
