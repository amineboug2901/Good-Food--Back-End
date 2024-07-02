import connectionPromise from "../model/connexion.js";

/* *
  * Lire tous les produits d'une commande
  * @param {number} id_commande - Id de la commande
  * @returns {Promise<Array<Object>>} Liste des produits de la commande
*/
export const readCommandeProduitPopulated = async (id_commande) => {
  let connection = await connectionPromise;
  let result = await connection.all(
    `SELECT * FROM commande_produit
    INNER JOIN produit ON produit.id_produit = commande_produit.id_produit
    WHERE id_commande = ?`,
    [id_commande]
  );
  return result;
};

/**
 * Lire un produit d'une commande
 * @param {number} id_commande - Id de la commande 
 */
export const readProduitInCommandeProduit = async (id_commande, id_produit) => {
  let connection = await connectionPromise;
  let result = await connection.get(
    `SELECT * FROM commande_produit WHERE id_commande = ? AND id_produit = ?`,
    [id_commande, id_produit]
  );
  return result;
};

/**
 * Creer un produit dans une commande
 * @param {number} id_commande - Id de la commande
 * @param {number} id_produit - Id du produit
 * @param {number} quantité - Quantité du produit
 * @returns {Promise<number>} Id du produit créé
 */
export const createCommandeProduit = async (
  id_commande,
  id_produit,
  quantité
) => {
  let connection = await connectionPromise;
  let result = await connection.run(
    `INSERT INTO commande_produit(id_commande, id_produit, quantite) VALUES(?,?,?)`,
    [id_commande, id_produit, quantité]
  );
  return result.lastID;
};

/**
 * Supprimer un produit dans une commande
 * @param {number} id_commande - Id de la commande
 * @param {number} id_produit - Id du produit
 * @returns {Promise<number>} Nombre de lignes supprimées
 */
export const deleteCommandeProduit = async (id_commande, id_produit) => {
  let connection = await connectionPromise;
  let result = await connection.run(
    `DELETE FROM commande_produit WHERE id_commande = ? AND id_produit = ?`,
    [id_commande, id_produit]
  );
  return result.changes;
};

/**
 * Mettre à jour un produit dans une commande
 * @param {number} id_commande - Id de la commande
 * @param {number} id_produit - Id du produit
 * @param {number} quantité - Quantité du produit
 * @returns {Promise<number>} Nombre de lignes modifiées
 */
export const updateCommandeProduit = async (
  id_commande,
  id_produit,
  quantité
) => {
  let connection = await connectionPromise;

  let result = await connection.run(
    `UPDATE commande_produit SET quantite = ? WHERE id_commande = ? AND id_produit = ?`,
    [quantité, id_commande, id_produit]
  );
  return result.changes;
};
