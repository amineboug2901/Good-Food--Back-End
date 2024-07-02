import { validate } from 'email-validator';

/**
 * Valider l'email.
 * @param {number} email L'email.
 */
export const isEmailValid = (email) => 
    validate(email);

/**
 * Valider le mot de passe.
 * @param {string} password Le mot de passe.
 */
export const isPasswordValid = (password) => {

    // Règle de base : doit contenir au moins 8 caractères.
    if (password.length < 8) {
        return false;
    }

    return true;
};

/**
 * Valider le nom.
 * @param {string} n Le nom.
 */
export const isNameValid = (n) => {

    // Règle de base : doit contenir au moins 8 caractères.
    if (n.length < 3) {
        return false;
    }

    return true;
};