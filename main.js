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
let configurations = [];
//Configuration en cours
let configEnCours;
//Jeu en cours
let jeuEnCours;

//Creation de la fenêtre
function createWindow () {
    win = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.loadFile('src/index.html');
    win.setMenu(null);
    win.setMenuBarVisibility(false);
    win.webContents.openDevTools();

    win.on('closed', () => {
        win = null
    })
}

//Chargement de la liste des configurations depuis le dossier config
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
               configurations.push(config);
           }
       }
    });
}

//On charge nos configurations
chargeListeConfiguration();

//On crée notre jeu de la vie !
//On regarde si on a au moins une configuration
if(Object.keys(configurations).length > 0){
    jeuEnCours = new JdV(configurations[0].hauteur,configurations[0].largeur);
    jeuEnCours.chargeConfiguration(configurations[0]);
    configEnCours = 0;
}else{
    jeuEnCours = new JdV(20,20);
}

//On déclare les handlers IPC pour les instruction synchrones
ipcMain.on('commSync', (event, arg, param1, param2) => {
    let tabReponse = [];
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
        case "getTableauCellule":
            event.returnValue = jeuEnCours.tableauCellule;
            break;
        case "processOneCycle":
            jeuEnCours.processCycle();
            event.returnValue = true;
            break;
        case "getConfigList":
            configurations.forEach(function(config, index){
               tabReponse.push({nom:config.name,id:index});
            });
            event.returnValue = tabReponse;
            break;
        case "getConfigEnCours":
            event.returnValue = configEnCours;
            break;
        case "changeConfiguration":
            if(param1 !== null && typeof (configurations[param1]) !== "undefined"){
                jeuEnCours.chargeConfiguration(configurations[param1]);
                event.returnValue = true;
            }else{
                event.returnValue = false;
            }
            break;
        case "toggleCellule":
            if(param2 < jeuEnCours.hauteur && param1 < jeuEnCours.largeur){
                if(jeuEnCours.tableauCellule[param1][param2] === true){
                    jeuEnCours.tableauCellule[param1][param2] = false;
                }else{
                    jeuEnCours.tableauCellule[param1][param2] = true;
                }
                event.returnValue = true;
            }else{
                event.returnValue = false
            }
            break;
        default:
            event.returnValue = false;
            break;

    }
});

//Création de la fenêtre lorsque node est chargé
app.on('ready', createWindow);
