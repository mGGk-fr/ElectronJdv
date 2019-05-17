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
let timer = 50;
let timerId;

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

//On crée notre jeu de la vie !
jeuEnCours = new JdV(50,50);

//On déclare le timer d'autoplay
setInterval(autoPlayCycle, timer);

//On déclare les handlers IPC pour les instruction asynchrones
ipcMain.on('commSync', (event, arg, param1, param2) => {
    switch(arg){
        case "getGrilleHauteur":
            event.returnValue = jeuEnCours.hauteur;
            break;
        case "getGrilleLargeur":
            event.returnValue = jeuEnCours.largeur;
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

    }
});



//Création de la fenêtre lorsque node est chargé
app.on('ready', createWindow);
