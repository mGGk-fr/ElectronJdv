/**
 * Projet : ElectronJdv
 * Auteur : Guillaume mGGk Arino
 * Fichier : classes/cellule.js
 * Description : Classe representant une cellule
 */
class Cellule{
    positionX;
    positionY;
    enVie;
    nouvelEtat;

    constructor(posX,posY,etat){
        this.positionX = posX;
        this.positionY = posY;
        this.enVie = etat;
    }
}

module.exports = Cellule;