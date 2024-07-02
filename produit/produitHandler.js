import connectionPromise from "../model/connexion.js";

/**
 * Lire tous les produits
 * @returns {Promise<Array<Object>>} Liste des produits
 *
 */ 
export const readProduits = async () => {
  let connection = await connectionPromise;
  let produits = await connection.all("SELECT * FROM produit");
  return produits;
};