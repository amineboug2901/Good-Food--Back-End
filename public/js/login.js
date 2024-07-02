const form = document.querySelector(".login");

/**
 * Valide le formulaire et renvoie true si tous les champs sont valides, sinon renvoie false.
 * @param {Event} e - L'événement de soumission du formulaire.
 * @returns {boolean} - True si tous les champs sont valides, sinon false.
 */
const validateForm = (e) => {
  e.preventDefault();

  const inputs = e.currentTarget.elements;
  let valid = true;

  for (let input of inputs) {
    if (input.validity.valid) {
      input.style.borderColor = "inherit";
    } else {
      input.style.borderColor = "red";
      valid = false;
    }
  }

  if (!valid) {
    alert("Please fill out all fields correctly.");
  }

  return valid;
};

/**
 * Soumet le formulaire de connexion.
 * @param {Event} event - L'événement de soumission du formulaire.
 * @returns {Promise<void>} - Une promesse qui se résout lorsque la connexion est terminée.
 */
const login = async (event) => {
  event.preventDefault();

  const inputs = event.currentTarget.elements;
  if (!form.checkValidity() || !validateForm(event)) {
    form.reportValidity();
    return;
  }

  let data = {
    email: inputs["InputEmail"].value,
    password: inputs["InputPassword"].value,
  };

  let response = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    location.replace("/");
  } else {
    alert("Erreur: " + (await response.text()));
  }
};

form.addEventListener("submit", login);
