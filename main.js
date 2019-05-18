/**
 * Projet : ElectronJdv
 * Auteur : Guillaume mGGk Arino
 * Fichier : main.js
 * Description : Point d'entrée de l'application
 */

//Import des dépendances
const { app, BrowserWindow, ipcMain } = require('electron');
//Classes persos
const JdV = require('./classes/jdv');

//Fenêtre principale
let win;
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
    win.loadFile('src/index.html')

    win.webContents.openDevTools()

    win.on('closed', () => {
        win = null
    })
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

//On crée notre jeu de la vie !
jeuEnCours = new JdV(10,10);

declareIntervalAutoCycle();

//On déclare les handlers IPC pour les instruction synchrones
ipcMain.on('commSync', (event, arg, param1, param2) => {
    switch(arg){
        case "getGrilleHauteur":
            event.returnValue = jeuEnCours.hauteur;
            break;
        case "getGrilleLargeur":
            event.returnValue = jeuEnCours.largeur;
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
