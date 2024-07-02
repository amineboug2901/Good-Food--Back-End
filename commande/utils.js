import { readCommandeProduitPopulated } from "./commandeProduitHandler.js"

/**
 * Calculer le total d'une commande
 * @param {number} id_commande - Id de la commande
 * @returns {Promise<number>} Total de la commande
 */
export const calculTotal = async (id_commande) => {
  const produits = await readCommandeProduitPopulated(id_commande);
  let total = 0;
  for (let produit of produits) {
    total += produit.prix * produit.quantite;
  }
  return total;
}