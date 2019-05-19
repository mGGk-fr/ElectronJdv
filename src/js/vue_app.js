/**
 * Projet : ElectronJdv
 * Auteur : Guillaume mGGk Arino
 * Fichier : src/js/vue_app.js
 * Description : Gestion complete du front de l'application
 */

//Require des libs electron
const { ipcRenderer } = require('electron');
const shell = require('electron').shell;

//Déclaration de l'élément vue
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
        afficheRepere: true
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
            if(this.afficheRepere === true){
                this.dessineGrilleRepere(context2D);
            }
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
        //Dessine une grille de repere
        dessineGrilleRepere: function(context){
            context.beginPath();
            //Sur ces deux boucles, on commence à 1 car la première bordure est celle de la zone de dessin
            //Lignes verticales
            for(let i = 1; i< this.largeurGrille;i++){
                context.moveTo(i*this.tailleCellule,0);
                context.lineTo(i*this.tailleCellule,this.hauteurGrille*this.tailleCellule);
            }
            //Lignes horizontales
            for(let i = 1; i< this.hauteurGrille;i++){
                context.moveTo(0,i*this.tailleCellule);
                context.lineTo(this.hauteurGrille*this.tailleCellule, i*this.tailleCellule);
            }
            context.lineWidth = 0.1;
            context.strokeStyle = 'black';
            context.stroke();
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
        //Contrôle l'arrêt et le démarrage de la simulation
        demarreArretSimulation: function(){
            if(this.isPlaying){
                clearInterval(this.timerId);
                this.$refs['btnControlSimulation'].innerText = "Démarrer la simulation";
                this.$refs['btnCycleSuivant'].disabled = false;
                this.isPlaying = false;
            }else{
                this.timerId = setInterval(this.cycleSuivant,this.vitesseSimulation);
                this.$refs['btnControlSimulation'].innerText = "Arrêter la simulation";
                this.$refs['btnCycleSuivant'].disabled = true;
                this.isPlaying = true;
            }
        },
        //Execute un cycle de simulation
        cycleSuivant: function(){
            ipcRenderer.sendSync("commSync","processOneCycle");
            this.chargeGrille();
        },
        //Remet à zeron la simulation
        resetSimulation: function(){
            clearInterval(this.timerId);
            this.$refs['btnControlSimulation'].innerText = "Démarrer la simulation";
            this.$refs['btnCycleSuivant'].disabled = false;
            this.isPlaying = false;
            this.setCurrentConfiguration();
        },
        //Permet de charger l'état d'une cellule
        toggleCellule: function(event){
            //On recupere la position du canvas
            let rect = this.$refs['canvasCellGrid'].getBoundingClientRect();
            //On récupère les coordonnées de la souris
            let x = event.clientX - rect.left;
            let y = event.clientY - rect.top;
            //Avec ces données, on peux determiner la cellule cliquée
            let colonne = ((this.largeurGrille/this.tailleCellule));
            console.log(colonne);
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

//Gestion des liens href
const links = document.querySelectorAll('a[href]');
Array.prototype.forEach.call(links, function (link) {
    const url = link.getAttribute('href');
    if (url.indexOf('http') === 0) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            shell.openExternal(url)
        })
    }
});
