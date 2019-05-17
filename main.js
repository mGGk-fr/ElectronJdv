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

//On crée notre jeu de la vie !
jeuEnCours = new JdV(10,10);

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
    }
});

//Création de la fenêtre lorsque node est chargé
app.on('ready', createWindow);
