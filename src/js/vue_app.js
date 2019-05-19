const { ipcRenderer } = require('electron');
const shell = require('electron').shell;

new Vue({
    el: '#app',
    data:{
        hauteurGrille: 0,
        largeurGrille: 0,
        tableauCellule: [],
        configuration: "none",
        vitesseSimulation: 500,
        timerId : null,
        isPlaying: false,
        tailleCellule: 10,
        context2D: null
    },
    methods:{
        /*************************************
         * Methodes gerant le dessin
         *************************************/
        //Initialise la grille
        initGrille: function(){
            this.$refs['canvasCellGrid'].height = this.hauteurGrille*this.tailleCellule;
            this.$refs['canvasCellGrid'].width = this.largeurGrille*this.tailleCellule;
            this.chargeGrille();
        },
        //Charge la grille depuis le tableau de cellules
        chargeGrille: function(){
            this.chargeTableauCellule();
            let context2D = this.$refs['canvasCellGrid'].getContext("2d");
            this.nettoyerGrille(context2D);
            for(let i = 0; i < this.largeurGrille;i++){
                for(let j = 0; j < this.hauteurGrille; j++){
                    if(this.tableauCellule[i][j]){
                        this.drawCell(context2D, i,j,"black");
                    }
                }
            }
        },
        //Met la grille à vide
        nettoyerGrille: function(context){
            context.clearRect(0,0,this.$refs['canvasCellGrid'].width,this.$refs['canvasCellGrid'].height);
        },
        //Dessine une cellule
        drawCell: function(context, ligne, colonne, color){
            context.fillStyle = color;
            context.fillRect(colonne*this.tailleCellule,ligne*this.tailleCellule,this.tailleCellule,this.tailleCellule);
        },
        /*************************************
         * Methodes gerant les configurations
         *************************************/
        /*************************************
         * Methodes gerant les flux de données
         *************************************/
        //Charge la hauteur de la grille
        getHauteurGrille: function(){
            this.hauteurGrille = ipcRenderer.sendSync("commSync","getGrilleHauteur");
        },
        //Defini la hauteur de la grille
        setHauteurGrille: function(){
            ipcRenderer.sendSync("commSync", "setGrilleHauteur", this.hauteurGrille);
            this.initGrille();
        },
        //Charge la largeur de la grille
        getLargeurGrille: function(){
            this.largeurGrille = ipcRenderer.sendSync("commSync","getGrilleLargeur");
        },
        //Defini la largeur de la grille
        setLargeurGrille: function(){
            ipcRenderer.sendSync("commSync", "setGrilleLargeur", this.largeurGrille);
            this.initGrille();
        },
        //Charge le tableau des cellules
        chargeTableauCellule: function(){
            this.tableauCellule = ipcRenderer.sendSync("commSync", "getTableauCellule");
        },

    },
    mounted: function(){
        this.getHauteurGrille();
        this.getLargeurGrille();
        this.initGrille();
    }

});