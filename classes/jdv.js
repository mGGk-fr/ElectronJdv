/**
 * Projet : ElectronJdv
 * Auteur : Guillaume mGGk Arino
 * Fichier : classes/jdv.js
 * Description : Classe du jeu de la vie
 */
const Cellule = require("./cellule");

class JdV{
    tableauCellule = [];
    hauteur;
    largeur;

    //Constructeur
    constructor(hauteur, largeur){

        this.hauteur = hauteur;
        this.largeur = largeur;
        this.genereGrilleVide();
    }

    //Genere une grille vide
    genereGrilleVide(){
        this.tableauCellule = [];
        for(var i = 0; i < this.hauteur; i++){
            let arrayOfCell = [];
            for(var j = 0; j < this.largeur;j++){
                if(j == 2){
                    arrayOfCell[j] = true;
                }else{
                    arrayOfCell[j] = false;
                }
            }
            this.tableauCellule[i] = arrayOfCell;
        }
    }

    getStatutCellule(ligne, colonne){
        return this.tableauCellule[ligne][colonne];
    }

    processCycle(){
        let nouveauTableau = [];
        for(let i = 0; i < this.hauteur; i++){
            let tableauLigne = [];
            for(let j = 0; j < this.largeur; j++){
                let nbCellEnVie = this.getNombreCelluleVivante(i,j);
                if(this.tableauCellule[i][j] == true){
                    if(nbCellEnVie < 2 || nbCellEnVie > 3){
                        tableauLigne[j] = false;
                    }
                }else{
                    if(nbCellEnVie ==3){
                        tableauLigne[j] = true;
                    }
                }
            }
            nouveauTableau[i] = tableauLigne;
        }
        this.tableauCellule = nouveauTableau;
    }

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