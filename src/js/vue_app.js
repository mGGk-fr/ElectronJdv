const { ipcRenderer } = require('electron');
const shell = require('electron').shell;

new Vue({
    el: '#app',
    data:{
        hauteurGrille: 0,
        largeurGrille: 0,
        tableauCellule: [],
        configurations: [],
        configurationEnCours : "null",
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
        //Recupere la liste des configurations
        getListeConfigurations: function(){
            this.configurations = ipcRenderer.sendSync("commSync", "getConfigList");
        },
        //Récupère la configuration active
        getCurrentConfiguration: function(){
            this.configurationEnCours = ipcRenderer.sendSync("commSync", "getConfigEnCours");
        },
        //Défini la configuration à charger
        setCurrentConfiguration: function(){
            if(ipcRenderer.sendSync("commSync","changeConfiguration",this.configurationEnCours)){
                this.getHauteurGrille();
                this.getLargeurGrille();
                this.initGrille();
            }else{
                alert("Une erreur est survenue durant le changement de configuration");
            }
        },
        /*************************************
         * Methodes la configuration de la simulation
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
        changeVitesseSimulation: function(){
            clearInterval(this.timerId);
            if(this.isPlaying){
                this.timerId = setInterval(this.cycleSuivant,this.vitesseSimulation);
            }
        },
        /****************************************
         * Méthodes controlant la simulation
         ***************************************/
        demarreArretSimulation: function(){
            if(this.isPlaying){
                clearInterval(this.timerId);
                this.$refs['btnControlSimulation'].innerText = "Démarrer la simulation";
                this.$refs['btnCycleSuivant'].disabled = false;
                this.isPlaying = false;
            }else{
                this.timerId = setInterval(this.cycleSuivant,this.vitesseSimulation);
                this.$refs['btnControlSimulation'].innerText = "Arrêter la simulation";
                this.$refs['btnCycleSuivant'].disabled = false;
                this.isPlaying = true;
            }
        },
        cycleSuivant: function(){
            ipcRenderer.sendSync("commSync","processOneCycle");
            this.chargeGrille();
        }

    },
    mounted: function(){
        this.getListeConfigurations();
        this.getCurrentConfiguration();
        this.getHauteurGrille();
        this.getLargeurGrille();
        this.initGrille();
    }

});