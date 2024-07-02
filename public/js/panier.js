let delete_cart_button = document.querySelector(".delete-cart");
let deleteOneButton = document.querySelectorAll(".delete-one");
let deleteAllButton = document.querySelectorAll(".delete-all");
let submitButton = document.querySelector(".submit-cart");
let forms = document.querySelectorAll(".quantity-input-group");

/**
 * Supprime un élément du panier.
 *
 * @param {Event} event - L'événement de clic ou de soumission.
 * @returns {Promise<void>} - Une promesse qui se résout lorsque la suppression est terminée.
 */
const deleteOneFromCart = async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const qt = form.querySelector("input[type=number]");
  const submitBtn = form.querySelector("input[type=submit]");
  let data = {
    id_produit: parseInt(submitBtn.id.split("-")[0]),
    quantite: parseInt(submitBtn.id.split("-")[1]) - parseInt(qt.value),
  };
  await fetch("/api/panier", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  location.reload();
};

/**
 * Supprime le panier.
 *
 * @param {Event} event - L'événement de clic.
 * @returns {Promise<void>} - Une promesse qui se résout lorsque la suppression est terminée.
 */
const deleteCart = async (event) => {
  await fetch("/api/panier", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });
  location.reload();
};

/**
 * Supprime tous les éléments d'un produit du panier.
 *
 * @param {Event} event - L'événement de clic.
 * @returns {Promise<void>} - Une promesse qui se résout lorsque la suppression est terminée.
 */
const deleteAllFromCart = async (event) => {
  let data = {
    id_produit: parseInt(event.currentTarget.id.split("-")[0]),
    quantite: 0,
  };

  await fetch("/api/panier", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  location.reload();
};

/**
 * Valide l'état du formulaire.
 *
 * @param {Event} e - L'événement de soumission du formulaire.
 */
const submitCart = async (event) => {
  console.log(event.currentTarget);
  let data = {
    id_etat_commande: 2,
    date: new Date().getTime(),
  };

  await fetch("/api/commande", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  location.reload();
};

delete_cart_button.addEventListener("click", deleteCart);
submitButton.addEventListener("click", submitCart);
for (let form of forms) {
  form.addEventListener("submit", deleteOneFromCart);
}
for (let btn of deleteAllButton) {
  btn.addEventListener("click", deleteAllFromCart);
}
