import connectionPromise from "../model/connexion.js";

/**
 * Lire commande populated avec ID
 * @returns {Promise<Object>} Commande
 *
 */
export const readCommandePopulatedParId = async (id) => {
  let connection = await connectionPromise;
  let commande = await connection.get(
    `SELECT *, datetime(date/1000, 'unixepoch', 'localtime') AS date FROM commande
    INNER JOIN etat_commande ON etat_commande.id_etat_commande = commande.id_etat_commande
    WHERE id_commande = ${id}
    `
  );
  return commande;
};
/**
 * Lire commande avec ID
 * @returns {Promise<Object>} Commande
 *
 */
export const readCommandeParId = async (id) => {
  let connection = await connectionPromise;
  let commande = await connection.get(
    `SELECT * FROM commande WHERE id_commande = ${id}`
  );
  return commande;
};
/**
 * Lire tous les commandes
 * @returns {Promise<Array<Object>>} Liste des commandes
 *
 */
export const readCartIDOrCreateNewCart = async (user) => {
  let connection = await connectionPromise;
  let commande = await connection.get(
    `SELECT * FROM commande WHERE id_etat_commande = 1 AND id_utilisateur = ${user}`
  );
  if (commande) {
    return commande.id_commande;
  } else {
    let result = await connection.run(
      `INSERT INTO commande(id_utilisateur, id_etat_commande) VALUES(${user}, 1)`
    );
    return result.lastID;
  }
};

/**
 * Lire tous les commandes populées
 * 
 * @returns {Promise<Array<Object>>} Liste des commandes
 */
export const readCommandesPopulated = async () => {
  let connection = await connectionPromise;
  let commandes = await connection.all(
    `SELECT *, datetime(date/1000, 'unixepoch', 'localtime') AS date FROM commande
    INNER JOIN etat_commande ON etat_commande.id_etat_commande = commande.id_etat_commande
    WHERE commande.id_etat_commande != 1`
  );
  return commandes;
};

/**
 * Lire un commande
 * @param {number} id_commande - Id de la commande
 * @returns {Promise<Object>} Commande
 */
export const updateCommande = async (id_commande, id_etat_commande, date) => {
  let connection = await connectionPromise;
  let result = await connection.run(
    `UPDATE commande SET id_etat_commande = ?, date = ?  WHERE id_commande = ?`,
    [id_etat_commande, date, id_commande]
  );
  return result.changes;
};

/**
 * Lire un commande
 * @param {number} id_commande - Id de la commande
 * @returns {Promise<Object>} Commande
 */
export const deleteCommande = async (id_commande) => {
  let connection = await connectionPromise;
  let result = await connection.run(
    `DELETE FROM commande_produit WHERE id_commande = ?`,
    [id_commande]
  );
  result = await connection.run(`DELETE FROM commande WHERE id_commande = ?`, [
    id_commande,
  ]);
  return result.changes;
};
