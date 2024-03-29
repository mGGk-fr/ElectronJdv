/**
 * Projet : ElectronJdv
 * Auteur : Guillaume mGGk Arino
 * Fichier : classes/jdv.js
 * Description : Classe du jeu de la vie
 */

class JdV{
    tableauCellule;
    hauteur;
    largeur;

    //Constructeur
    constructor(hauteur, largeur){

        this.hauteur = hauteur;
        this.largeur = largeur;
        this.genereGrille(true);
    }

    //Charge une configuration
    chargeConfiguration(config){
        var self = this;
        this.hauteur = config.hauteur;
        this.largeur = config.largeur;
        this.genereGrille(true);
        config.grille.forEach(function(element){
           let x, y;
           x = parseInt(element.split("x")[0])-1;
           y = parseInt(element.split("x")[1])-1;
           self.tableauCellule[y][x] = true;
        });

    }

    //Genere une grille vide
    genereGrille(vide){
        let nouveauTableau = [];
        for(var i = 0; i < this.largeur; i++){
            let arrayOfCell = [];
            for(var j = 0; j < this.hauteur;j++){
                //arrayOfCell[j] = Math.round((Math.random() * 1) + 0) === 0;
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

    //Exécute un cycle
    processCycle(){
        let nouveauTableau = [];
        for(let i = 0; i < this.largeur; i++){
            let tableauLigne = [];
            for(let j = 0; j < this.hauteur; j++){
                let nbCellEnVie = this.getNombreCelluleVivante(i,j);
                if(this.tableauCellule[i][j] === true){
                    tableauLigne[j] = nbCellEnVie === 2 || nbCellEnVie === 3;
                }else{
                    tableauLigne[j] = nbCellEnVie === 3;
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
    //Les contrôles permettent de bloucler la grille et de la relier bord à bord
    getEtatCelluleAdjacente(colonne, ligne){
        let ligneFinale = ligne;
        let colonneFinale = colonne;
        if(ligneFinale < 0){
            ligneFinale = this.hauteur-1;
        }
        if(ligneFinale >= this.hauteur){
            ligneFinale = 0;
        }
        if(colonneFinale < 0){
            colonneFinale = this.largeur-1;
        }
        if(colonneFinale >= this.largeur){
            colonneFinale = 0;
        }
        return this.tableauCellule[colonneFinale][ligneFinale];

    }
}
module.exports = JdV;