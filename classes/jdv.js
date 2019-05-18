/**
 * Projet : ElectronJdv
 * Auteur : Guillaume mGGk Arino
 * Fichier : classes/jdv.js
 * Description : Classe du jeu de la vie
 */
//const Cellule = require("./cellule");

class JdV{
    tableauCellule = [];
    hauteur;
    largeur;

    //Constructeur
    constructor(hauteur, largeur){

        this.hauteur = hauteur;
        this.largeur = largeur;
        this.genereGrille(true);
    }

    //Genere une grille vide
    genereGrille(vide){
        let nouveauTableau = [];
        for(var i = 0; i < this.hauteur; i++){
            let arrayOfCell = [];
            for(var j = 0; j < this.largeur;j++){
                if(vide === true){
                    arrayOfCell[j] = false;
                }else{
                    if(typeof this.tableauCellule[i] !== 'undefined'){
                        if(typeof this.tableauCellule[i][j] !== 'undefined'){
                            arrayOfCell[j] = this.tableauCellule[i][j];
                        }else{
                            arrayOfCell[j] = false;
                        }
                    }else{
                        arrayOfCell[j] = false;
                    }
                }
            }
            nouveauTableau[i] = arrayOfCell;
        }
        this.tableauCellule = nouveauTableau;
    }

    //Renvoie le statut d'une cellule
    getStatutCellule(ligne, colonne){
        return this.tableauCellule[ligne][colonne];
    }

    //Exécute un cycle
    processCycle(){
        let nouveauTableau = [];
        for(let i = 0; i < this.hauteur; i++){
            let tableauLigne = [];
            for(let j = 0; j < this.largeur; j++){
                let nbCellEnVie = this.getNombreCelluleVivante(i,j);
                if(this.tableauCellule[i][j] === true){
                    if(nbCellEnVie < 2 || nbCellEnVie > 3){
                        tableauLigne[j] = false;
                    }
                }else{
                    if(nbCellEnVie === 3){
                        tableauLigne[j] = true;
                    }
                }
            }
            nouveauTableau[i] = tableauLigne;
        }
        this.tableauCellule = nouveauTableau;
    }

    //Renvoie le nombre de cellules vivantes pour une cellule donnée
    getNombreCelluleVivante(ligne, colonne){
        let compteur = 0;
        //Cellule en haut
        if(this.getEtatCelluleAdjacente(ligne-1,colonne)){
            compteur++;
        }
        //Cellule en haut à droite
        if(this.getEtatCelluleAdjacente(ligne-1,colonne+1)){
            compteur++;
        }
        //Cellule à droite
        if(this.getEtatCelluleAdjacente(ligne,colonne+1)){
            compteur++;
        }
        //Cellule en bas à droite
        if(this.getEtatCelluleAdjacente(ligne+1,colonne+1)){
            compteur++;
        }
        //Cellule en bas
        if(this.getEtatCelluleAdjacente(ligne+1,colonne)){
            compteur++;
        }
        //Cellule en bas à gauche
        if(this.getEtatCelluleAdjacente(ligne+1,colonne-1)){
            compteur++;
        }
        //Cellule à gauche
        if(this.getEtatCelluleAdjacente(ligne, colonne-1)){
            compteur++;
        }
        //Cellule en haut à gauche
        if(this.getEtatCelluleAdjacente(ligne-1,colonne-1)){
            compteur++;
        }
        return compteur;
    }

    //Renvoie l'état d'une cellule, gère le cas des cellules aux bords de la zone
    getEtatCelluleAdjacente(ligne, colonne){

        let xFinal = ligne;
        let yFinal = colonne;
        if(xFinal < 0){
            xFinal = this.largeur-1;
        }
        if(xFinal >= this.largeur){
            xFinal = 0;
        }
        if(yFinal < 0){
            yFinal = this.hauteur-1;
        }
        if(yFinal >= this.hauteur){
            yFinal = 0;
        }
        return this.tableauCellule[xFinal][yFinal];

    }
}
module.exports = JdV;