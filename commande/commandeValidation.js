/**
 * Valider l'ID du commande.
 * @param {number} id_commande L'ID du commande.
 */
export const isIDCommandeValid = (id_commande) => 
    typeof id_commande === 'number';

/**
 * Vérifie si l'identifiant de l'état de la commande est valide.
 * @param {number} id_etat_commande - L'identifiant de l'état de la commande.
 * @returns {boolean} - Retourne true si l'identifiant de l'état de la commande est valide, sinon false.
 */
export const isIDEtatCommandeValid = (id_etat_commande) =>
    typeof id_etat_commande === 'number' && [1, 2, 3, 4].includes(id_etat_commande);
  
/**
 * Vérifie si la date de la commande est valide.
 * @param {number} date - La date de la commande.
 * @returns {boolean} - Retourne true si la date de la commande est valide, sinon false.
 */
export const isDateCommandeValid = (date) => 
    typeof date === 'number' && date > 0;