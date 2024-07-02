/**
 * Valider l'ID du produit.
 * @param {number} id_produit L'ID du produit.
 */
export const isIDProduitValid = (id_produit) => 
    typeof id_produit === 'number';

/**
 * Valider la quantité du produit.
 * @param {number} quantite La quantité du produit.
 */
export const isQuantiteProduitValid = (quantite) =>
    typeof quantite === 'number' && quantite >= 0;
