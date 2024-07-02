import connectionPromise from "./connexion.js";

/**
 * Initialise le tableau produit avec des données fictives.
 */
export const CreateSampleProducts = async () => {
  console.log("--- Création des produits fictifs ---");
  let connection = await connectionPromise;

  let data = [
    {
      id_produit: 1,
      nom: "Pizza",
      chemin_image: "/img/pizza.jpg",
      prix: 10.99,
    },
    {
      id_produit: 2,
      nom: "Poutine",
      chemin_image: "/img/poutine.jpg",
      prix: 7.99,
    },
    {
      id_produit: 3,
      nom: "Hamburger",
      chemin_image: "/img/hamburger.jpg",
      prix: 6.99,
    },
    {
      id_produit: 4,
      nom: "Salade",
      chemin_image: "/img/salade.jpg",
      prix: 5.99,
    },
  ];

  for (let produit of data) {
    await connection.run(
      `INSERT INTO produit(id_produit, nom, chemin_image, prix)
      VALUES(?,?,?,?)`,
      [produit.id_produit, produit.nom, produit.chemin_image, produit.prix]
    );
    console.log(`${produit.id_produit} - ${produit.nom} ajouté: `);
  }

  console.log("--------------------------------------------");
};
