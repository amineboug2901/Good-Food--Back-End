import bcrypt from 'bcrypt';

import connectionPromise from "../model/connexion.js";

/**
 * Ajoute un nouvel utilisateur à la base de données.
 * 
 * @param {string} courriel - L'email de l'utilisateur.
 * @param {string} motDePasse - Le mot de passe de l'utilisateur.
 * @param {string} prenom - Le prénom de l'utilisateur.
 * @param {string} nom - Le nom de famille de l'utilisateur.
 * @returns {Promise<void>} - Une promesse qui se résout lorsque l'utilisateur est ajouté avec succès.
 */
export async function addUtilisateur(courriel, motDePasse, prenom, nom) {
  let connection = await connectionPromise;
  let motDePasseEncrypte = await bcrypt.hash(motDePasse, 10);

  await connection.run(
      `INSERT INTO utilisateur(id_type_utilisateur, courriel, mot_de_passe, prenom, nom)
      VALUES (1, ?, ?, ?, ?)`,
      [courriel, motDePasseEncrypte, prenom, nom]
  )
}

/**
 * Récupère un utilisateur à partir de la base de données en fonction de son adresse e-mail.
 * @param {string} courriel - L'adresse e-mail de l'utilisateur.
 * @returns {Promise<Object>} - Une promesse qui se résout à l'objet utilisateur
 */
export async function getUtilisateur(courriel) {
  let connection = await connectionPromise;

  const result = await connection.get(
      `SELECT id_utilisateur, id_type_utilisateur, courriel, mot_de_passe 
      FROM utilisateur
      WHERE courriel = ?`,
      [courriel]
  );

  return result;
}