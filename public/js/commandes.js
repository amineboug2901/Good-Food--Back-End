const forms = document.querySelectorAll(".form-etat");
const form_copy = document.querySelector("#form-copy");

/**
 * Valide l'état du formulaire.
 *
 * @param {Event} e - L'événement de soumission du formulaire.
 */
const validateIDEtat = (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  const selectChangeState = form.querySelector(".form-select");
  const errorChangeState = form.querySelector(".error-etat");

  if (selectChangeState.validity.valid) {
    selectChangeState.style.borderColor = "inherit";
    errorChangeState.style.display = "none";
  } else {
    // if (selectChangeState.validity.valueMissing) {
    selectChangeState.style.borderColor = "red";
    errorChangeState.style.display = "block";
  }
};
for (let form of forms) {
  form.addEventListener("submit", validateIDEtat);
}

/**
 * Met à jour l'état d'une commande.
 * @param {Event} event - L'événement de soumission du formulaire.
 * @returns {Promise<void>} - Une promesse qui se résout lorsque la mise à jour est terminée.
 */
const updateEtatCommande = async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const selectChangeState = form.querySelector(".form-select");
  const submitBtn = form.querySelector("input[type=submit]");
  let data = {
    id_commande: parseInt(submitBtn.id),
    id_etat_commande: parseInt(selectChangeState.value),
    date: new Date().getTime(),
  };

  await fetch("/api/commande", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  location.reload();
};
for (let form of forms) {
  form.addEventListener("submit", updateEtatCommande);
}

/**
 * Ouvre un stream avec le serveur pour que celui-ci puisse nous envoyer
 * des notifications.
 */
const listen = () => {
  // Ouvre le stream avec le serveur
  let eventSource = new EventSource("/realtime");

  // Écoute pour les notifications d'ajout de ToDo sur le serveur
  eventSource.addEventListener("etat", (event) => {
    let data = JSON.parse(event.data);
    console.log("etat", data);
    let commande = document.getElementById(data.id_commande);
    let etat = commande.querySelector(".etat");
    etat.innerHTML = data.nom;
  });

  // Lors d'une nouvelle commande, on clone le form et on l'ajoute
  // à la liste des commandes
  eventSource.addEventListener("commande", (event) => {
    let data = JSON.parse(event.data);

    // clone form
    let new_commande = form_copy.cloneNode(true);
    new_commande.id = data.id_commande;
    new_commande.style.display = "table-row";

    // update form
    let id_commande = new_commande.querySelector(".id_commande");
    id_commande.innerHTML = data.id_commande;
    let date = new_commande.querySelector(".date");
    date.innerHTML = data.date;
    let etat = new_commande.querySelector(".etat");
    etat.innerHTML = data.nom;
    // get button submit
    let submitBtn = new_commande.querySelector("input[type=submit]");
    submitBtn.id = data.id_commande;

    // add to forms
    let tbody = document.querySelector("tbody");
    tbody.appendChild(new_commande);
  });
};
listen();
