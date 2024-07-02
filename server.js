import "dotenv/config";
import express, { json, request, response } from "express";
import { engine } from "express-handlebars";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import session from 'express-session';
import memorystore from 'memorystore';
import passport from 'passport';
import https from 'https';
import { readFile } from 'fs/promises';

import {
  isIDProduitValid,
  isQuantiteProduitValid,
} from "./produit/produitValidation.js";
import {
  isDateCommandeValid,
  isIDEtatCommandeValid,
} from "./commande/commandeValidation.js";
import { readProduits } from "./produit/produitHandler.js";
import {
  readCartIDOrCreateNewCart,
  readCommandesPopulated,
  updateCommande,
  deleteCommande,
  readCommandeParId,
  readCommandePopulatedParId
} from "./commande/commandeHandler.js";
import {
  readCommandeProduitPopulated,
  readProduitInCommandeProduit,
  createCommandeProduit,
  deleteCommandeProduit,
  updateCommandeProduit,
} from "./commande/commandeProduitHandler.js";

import { CreateSampleProducts } from "./model/sampleDB.js";
import connectionPromise from "./model/connexion.js";
import { calculTotal } from "./commande/utils.js";
import "./auth/authImports.js";
import { isEmailValid, isNameValid, isPasswordValid } from "./auth/authValidation.js";
import { addUtilisateur } from "./auth/authHandler.js";
import redirectToHTTPS from './redirect-to-https.js';
import { sseBroadcast } from './sse-broadcast.js';

// Création du serveur web
let app = express();
const MemoryStore = memorystore(session);

//Creation de l'engine dans Express
app.engine("handlebars", engine());

//Mettre l'engine handlebars comm engin de rendu
app.set("view engine", "handlebars");

//Confuguration de handlebars
app.set("views", "./views");

// Ajout de middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(json());
app.use(express.static("public"));
app.use(redirectToHTTPS);

// middlewares session et passport
app.use(session({
  cookie: { maxAge: 3600000 },
  name: process.env.npm_package_name,
  store: new MemoryStore({ checkPeriod: 3600000 }),
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET
}));
app.use(passport.initialize());
app.use(passport.session());
app.engine("handlebars", engine());
app.use(sseBroadcast());

// Programmation de routes
// Route pour visualiser le menu du restaurant
app.get("/", async (request, response) => {
  response.render("menu", {
    // Updated route name and template
    titre: "Good Food", // Updated project title
    h1: "Good Food", // Updated project title
    styles: ["/css/general.css"],
    scripts: ["/js/menu.js"], // Updated script name
    user: request.user,
    isAdmin: request?.user?.id_type_utilisateur > 1,
    produits: await readProduits(),
  });
});

// Route pour réviser et soumettre la panier
app.get("/panier", async (request, response) => {
  if (!request.user) {
    // Si l'utilisateur n'est pas connecté ou n'est pas un administrateur, on
    // retourne l'erreur 401
    return response.sendStatus(401);
  }
  response.render("panier", {
    // Updated route name and template
    titre: "Good Food", // Updated project title
    h1: "Good Food", // Updated project title
    styles: ["/css/general.css"],
    scripts: ["/js/panier.js"], // Updated script name
    user: request.user,
    isAdmin: request?.user?.id_type_utilisateur > 1,
    produits: await readCommandeProduitPopulated(
      await readCartIDOrCreateNewCart(request?.user?.id_utilisateur)
    ),
    total: (await calculTotal(await readCartIDOrCreateNewCart(request?.user?.id_utilisateur))).toFixed(2),
  });
});

// Route pour se connecter
app.get("/login", async (request, response) => {
  response.render("login", {
    // Updated route name and template
    titre: "Good Food", // Updated project title
    h1: "Good Food", // Updated project title
    styles: ["/css/general.css"],
    scripts: ["/js/login.js"], // Updated script name
    user: request.user,
    isAdmin: request?.user?.id_type_utilisateur > 1
  });
});
// Route pour s'inscrire
app.get("/register", async (request, response) => {
  response.render("register", {
    // Updated route name and template
    titre: "Good Food", // Updated project title
    h1: "Good Food", // Updated project title
    styles: ["/css/general.css"],
    scripts: ["/js/register.js"], // Updated script name
    user: request.user,
    isAdmin: request?.user?.id_type_utilisateur > 1
  });
});
// Route pour voir toutes les commandes soumises
app.get("/commandes", async (request, response) => {
  if (!request.user || request.user.id_type_utilisateur != 2) {
    // Si l'utilisateur n'est pas connecté ou n'est pas un administrateur, on
    // retourne l'erreur 401
    return response.sendStatus(401);
  }

  response.render("commandes", {
    // Updated route name and template
    titre: "Good Food", // Updated project title
    h1: "Good Food", // Updated project title
    styles: ["/css/general.css"],
    scripts: ["/js/commandes.js"], // Updated script name
    commandes: await readCommandesPopulated(),
    user: request.user,
    isAdmin: request?.user?.id_type_utilisateur > 1
  });
});

// Routes pour l'API
// Route pour ajouter un produit au panier
app.post("/api/panier", async (request, response) => {
  if (!request.user) {
    // Si l'utilisateur n'est pas connecté, on
    // retourne l'erreur 401
    return response.sendStatus(401);
  }

  const { id_produit, quantity } = request.body;
  if (!(isIDProduitValid(id_produit) && isQuantiteProduitValid(quantity))) {
    return response.sendStatus(400);

  }
  console.log(
    `[POST] - /api/panier - ${new Date()}: Ajout du produit ${id_produit} au panier`
  );
  let id_commande = await readCartIDOrCreateNewCart(request.user.id_utilisateur);
  let produit = await readProduitInCommandeProduit(id_commande, id_produit);
  if (produit) {
    await updateCommandeProduit(
      id_commande,
      id_produit,
      produit.quantite + quantity
    );
  } else {
    await createCommandeProduit(id_commande, id_produit, quantity);
  }
  return response.sendStatus(201);
});

// Route pour mettre a jour ou supprimer les produits du panier
app.put("/api/panier", async (request, response) => {
  if (!request.user) {
    // Si l'utilisateur n'est pas connecté, on
    // retourne l'erreur 401
    return response.sendStatus(401);
  }

  const { id_produit, quantite } = request.body;
  if (!(isIDProduitValid(id_produit) && isQuantiteProduitValid(quantite))) {
    return response.sendStatus(400);

  }
  console.log(
    `[PUT] - /api/panier - ${new Date()}: Mise a jour du quantité du produit ${id_produit}`
  );
  let id_commande = await readCartIDOrCreateNewCart(request.user.id_utilisateur);
  let produit = await readProduitInCommandeProduit(id_commande, id_produit);
  if (!produit) {
    console.log(`[PUT] - /api/panier - ${new Date()}: Produit non trouvé`);
    return response.sendStatus(404);

  }

  if (quantite > 0) {
    await updateCommandeProduit(id_commande, id_produit, quantite);
  } else {
    await deleteCommandeProduit(id_commande, id_produit);
  }
  return response.sendStatus(200);
});

// Route pour supprimer le panier
app.delete("/api/panier", async (request, response) => {
  if (!request.user) {
    // Si l'utilisateur n'est pas connecté, on
    // retourne l'erreur 401
    return response.sendStatus(401);
  }
  console.log(`[DELETE] - /api/panier - ${new Date()}: Suppression du panier`);
  let id_commande = await readCartIDOrCreateNewCart(request.user.id_utilisateur);
  await deleteCommande(id_commande);
  return response.sendStatus(200);
});

// Route pour mettre a jour l'etat d'un commande
app.put("/api/commande", async (request, response) => {
  if (!request.user) {
    // Si l'utilisateur n'est pas connecté, on
    // retourne l'erreur 401
    return response.sendStatus(401);
  }
  let { id_commande, id_etat_commande, date } = request.body;
  console.log(
    `[PUT] - /api/commande - ${new Date()}: Mise a jour de l'etat de la commande ${id_commande}`
  );
  if (
    !(
      isIDEtatCommandeValid(id_etat_commande) &&
      id_etat_commande != 1 &&
      isDateCommandeValid(date)
    )
  ) {
    return response.sendStatus(400);

  }
  if (!request.user) {
    // Si l'utilisateur n'est pas un administrateur (pour proteger le changement d'etat), on
    // retourne l'erreur 401
    return response.sendStatus(401);
  }
  console.log(
    `[POST] - /api/panier/commande - ${new Date()}: Mise a jour de l'etat de la commande vers etat ${id_etat_commande}`
  );
  if (!id_commande) {
    id_commande = await readCartIDOrCreateNewCart(request.user.id_utilisateur);
  }

  // On teste pour connaitre si c'est une soumission de panier ou un changement d'etat par l'admin.
  // Si l'id avant cette requete du commande n'est pas 1 (panier), et l'utilisateur n'est pas un admin
  // on retourne 401
  let commande = await readCommandeParId(id_commande);
  if (commande.id_etat_commande != 1 && request.user.id_type_utilisateur != 2) {
    return response.sendStatus(401);
  }
  let type_event = 'etat';
  if (commande.id_etat_commande === 1 && commande.date === null) {
    type_event = 'commande';
  }
  await updateCommande(id_commande, id_etat_commande, date);

  response.sendStatus(200);
  commande = await readCommandePopulatedParId(id_commande);
  response.pushEvent({
    id_commande: commande.id_commande, id_etat_commande, nom: commande.nom, date: commande.date
  }, type_event);

});
app.post('/api/register', async (request, response, next) => {
  // On vérifie le le courriel et le mot de passe
  // envoyé sont valides
  if (isEmailValid(request.body.email) &&
    isPasswordValid(request.body.password) &&
    isNameValid(request.body.firstName) &&
    isNameValid(request.body.lastName)) {
    try {
      console.log(
        `[POST] - /api/register - ${new Date()}: Adding new user ${request.body.email}`
      );
      // Si la validation passe, on crée l'utilisateur
      await addUtilisateur(request.body.email, request.body.password, request.body.firstName, request.body.lastName);
      return response.sendStatus(201);
    }
    catch (error) {
      // S'il y a une erreur de SQL, on regarde
      // si c'est parce qu'il y a conflit
      // d'identifiant
      if (error.code === 'SQLITE_CONSTRAINT') {
        return response.sendStatus(409);
      }
      else {
        next(error);

      }
    }
  }
  else {
    return response.sendStatus(400);
  }
});
app.post('/api/login', (request, response, next) => {
  // On vérifie le le courriel et le mot de passe
  // envoyé sont valides
  if (isEmailValid(request.body.email) &&
    isPasswordValid(request.body.password)) {
    console.log(
      `[POST] - /api/login - ${new Date()}: New login request: ${request.body.email}`
    );
    // On lance l'authentification avec passport.js
    passport.authenticate('local', (error, user, info) => {
      if (error) {
        // S'il y a une erreur, on la passe
        // au serveur
        console.log(`[POST] - /api/login - ${new Date()}: Error: ${error}`)
        next(error);
      }
      else if (!user) {
        // Si la connexion échoue, on envoit
        // l'information au client avec un code
        // 401 (Unauthorized)
        response.status(401).json(info);
      }
      else {
        // Si tout fonctionne, on ajoute
        // l'utilisateur dans la session et
        // on retourne un code 200 (OK)
        console.log(
          `[POST] - /api/login - ${new Date()}: User ${user.courriel} logged in.`
        );
        request.logIn(user, (error) => {
          if (error) {
            next(error);
          }

          return response.sendStatus(200);
        });
      }
    })(request, response, next);
  }
  else {
    return response.sendStatus(400);
  }
});
app.post('/api/logout', (request, response) => {
  // Déconnecter l'utilisateur
  request.logout(function (err) {
    if (err) {
      console.error(err);
      return response.sendStatus(500);
    }

    // Rediriger l'utilisateur vers une autre page
    response.redirect('/');
  });
});

// Initialiser le stream de données
app.get('/realtime', (request, response) => {
  if (!request.user || request.user.id_type_utilisateur != 2) {
    // Si l'utilisateur n'est pas connecté ou n'est pas un administrateur, on
    // retourne l'erreur 401
    return response.sendStatus(401);
  }

  response.initStream();
})

// Démarrage du serveur
if (process.env.NODE_ENV === 'production') {
  app.listen(process.env.PORT);
  console.log("Serveur démarré: http://localhost:" + process.env.PORT);
}
else {
  const credentials = {
    key: await readFile('./security/localhost.key'),
    cert: await readFile('./security/localhost.cert')
  }

  https.createServer(credentials, app).listen(process.env.PORT);
  console.log("Serveur démarré: https://localhost:" + process.env.PORT);
}


/**
 * Initialisation de la base de données
 */
if (process.env.SAMPLE_DB && process.env.SAMPLE_DB === "true") {
  let produits = await readProduits();
  if (produits.length > 0) {
    console.log(
      "SAMPLE_DB: Skipping initialisation. Ignorer l'initialisation. La base de données est déjà initialisée."
    );
  } else {
    CreateSampleProducts(connectionPromise);
  }
}
