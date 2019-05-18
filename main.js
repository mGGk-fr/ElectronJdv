/**
 * Projet : ElectronJdv
 * Auteur : Guillaume mGGk Arino
 * Fichier : main.js
 * Description : Point d'entrée de l'application
 */

//Import des dépendances
const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');

//Classes persos
const JdV = require('./classes/jdv');

//Fenêtre principale
let win;
//Configurations possibles
let configurations = {};
//Jeu en cours
let jeuEnCours;
let autoPlay = false;
let vitesseSimulation = 550;
let timerId = null;

//Creation de la fenêtre
function createWindow () {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.loadFile('src/index.html');

    win.webContents.openDevTools();

    win.on('closed', () => {
        win = null
    })
}

function chargeListeConfiguration(){
    //On parcours les fichiers json du dossier configs
    fs.readdirSync("./configs/").forEach(file => {
        let fichierOK = true;
       //on vérifie que c'est bien un fichier json que nous lisons
       if(file.endsWith("json")){
           let rawFile = fs.readFileSync("./configs/"+file);
           let config = JSON.parse(rawFile);
           //On contrôle qu'on a tous les paramètres
           if(typeof (config.name) === undefined){
               fichierOK = false;
           }
           if(typeof (config.hauteur) === "undefined"){
               fichierOK = false;
           }
           if(typeof (config.largeur) === "undefined"){
               fichierOK = false;
           }
           if(typeof (config.grille) === "undefined" || config.grille.length === 0){
               fichierOK = false;
           }
           if(fichierOK){
               configurations[file] = config;
           }
       }
    });
}

function autoPlayCycle(){
    if(autoPlay === true){
        jeuEnCours.processCycle();
        win.send("commAsync","callRender");
    }
}

//On déclare le timer d'autoplay
function declareIntervalAutoCycle(){
    if(timerId != null){
        clearInterval(timerId);
    }
    timerId = setInterval(autoPlayCycle, vitesseSimulation);
}

//On charge nos configurations
chargeListeConfiguration();

//On crée notre jeu de la vie !
//On regarde si on a au moins une configuration
if(Object.keys(configurations).length > 0){
    let configACharger = configurations[Object.keys(configurations)[0]];
    jeuEnCours = new JdV(configACharger.hauteur,configACharger.largeur);
    jeuEnCours.chargeConfiguration(configACharger);
}else{
    jeuEnCours = new JdV(20,20);
}


declareIntervalAutoCycle();

//On déclare les handlers IPC pour les instruction synchrones
ipcMain.on('commSync', (event, arg, param1, param2) => {
    switch(arg){
        case "getGrilleHauteur":
            event.returnValue = jeuEnCours.hauteur;
            break;
        case "setGrilleHauteur":
            if(param1 > 0){
                jeuEnCours.hauteur = param1;
                jeuEnCours.genereGrille(false);
            }
            event.returnValue = true;
            break;
        case "getGrilleLargeur":
            event.returnValue = jeuEnCours.largeur;
            break;
        case "setGrilleLargeur":
            if(param1 > 0){
                jeuEnCours.largeur = param1;
                jeuEnCours.genereGrille(false);
            }
            event.returnValue = true;
            break;
        case "getVitesseSimulation":
            event.returnValue = vitesseSimulation;
            break;
        case "getCellStatus":
            event.returnValue = jeuEnCours.getStatutCellule(param1,param2);
            break;
        case "processOneCycle":
            jeuEnCours.processCycle();
            event.returnValue = true;
            break;
        case "getAutoCycleStatus":
            event.returnValue = autoPlay;
            break;
        case "setAutoCycleStatus":
            if(param1 === true || param1 === false){
                autoPlay = param1;
            }
            event.returnValue = true;
            break;
        case "setAutoCycleVitesse":
            if(param1 > 0){
                vitesseSimulation = param1;
                declareIntervalAutoCycle();
            }
            event.returnValue = true;
            break;

    }
});



//Création de la fenêtre lorsque node est chargé
app.on('ready', createWindow);
