//Initialisation IPC client
const { ipcRenderer } = require('electron');
const shell = require('electron').shell;

//Timer autoplay
let timerId;
let isPlaying = false;
let vitesseSimulation = 500;

//Elements représentant la configuration de la simulation
const largeurGrille = document.getElementById("largeurSimulation");
const hauteurGrille = document.getElementById("hauteurSimulation");
const selVitesseSimulation = document.getElementById("selVitesseSimulation");
const configurationSelect = document.getElementById("configurationCellule");

//Elements gérant la simulation
const btnLancerSimulation = document.getElementById("btnLanceSimulation");
const btnCycleSuivant = document.getElementById("btnCycleSuivant");
const btnReset = document.getElementById("btnReset");

//Constante template elements
const tailleCell = 10;
const canvasCellGrid = document.getElementById("cellGrid");
const context2D = canvasCellGrid.getContext("2d");

//Liens hrefs
const links = document.querySelectorAll('a[href]');

/************************************
 * Interaction process principal
 ************************************/
//Envoie une demande de génération de cycle suivant
function nextCycle(){
    ipcRenderer.sendSync("commSync","processOneCycle");
    chargeGrille();
}

//Charge la liste des configurations dans le select
function getListeConfigurations(){
    //On charge la liste des configurations disponibles
    let reponse = ipcRenderer.sendSync("commSync", "getConfigList");
    //On vide la liste des configurations
    configurationSelect.innerHTML = "";
    //On rempli la liste des configurations
    reponse.forEach(function(config){
        let opt = document.createElement("option");
        opt.value = config.id;
        opt.innerHTML = config.nom;
        configurationSelect.appendChild(opt);
    });
}

/************************************
 * Gestion des evenements
 ************************************/

//Gere les modification hauteur / largeur
function handleChangeHauteur(){
    ipcRenderer.sendSync("commSync", "setGrilleHauteur", hauteurGrille.value);
    initGrille();
}
function handleChangeLargeur(){
    ipcRenderer.sendSync("commSync", "setGrilleLargeur", largeurGrille.value);
    initGrille();
}

//Gere la modification de la vitesse
function handleChangeVitesse(){
    vitesseSimulation = parseInt(selVitesseSimulation.value);
    clearInterval(timerId);
    if(isPlaying){
        timerId = setInterval(nextCycle,vitesseSimulation);
    }

}

//Gere le démarrage et l'arrêt du cycle automatique
function handleAutoCycle(){
    if(isPlaying){
        clearInterval(timerId);
        btnLancerSimulation.innerText = "Démarrer la simulation";
        btnCycleSuivant.disabled = false;
        isPlaying = false;
    }else{
        timerId = setInterval(nextCycle,vitesseSimulation);
        btnLancerSimulation.innerText = "Arrêter la simulation";
        btnCycleSuivant.disabled = true;
        isPlaying = true;
    }
}

//Gère le changement de configuration
function handleChangeConfiguration(){
    if(ipcRenderer.sendSync("commSync","changeConfiguration",configurationSelect[configurationSelect.selectedIndex].value)){
        initGrille();
    }else{
        alert("Une erreur est survenue durant le changement de configuration");
    }
}

/************************************
 * Gestion du dessin
 ************************************/
//Initialise la grille html
function initGrille(){
    hauteurGrille.value = ipcRenderer.sendSync("commSync","getGrilleHauteur");
    largeurGrille.value = ipcRenderer.sendSync("commSync","getGrilleLargeur");
    canvasCellGrid.height = hauteurGrille.value*tailleCell;
    canvasCellGrid.width = largeurGrille.value*tailleCell;
    chargeGrille();
}

//Charge la grille de l'application
function chargeGrille(){
    nettoyerGrille();
    let tab = ipcRenderer.sendSync("commSync", "getTableauCellule");
    for(let i = 0; i < largeurGrille.value;i++){
        for(let j = 0; j < hauteurGrille.value; j++){
            if(tab[i][j]){
                drawCell(i,j,"black");
            }
        }
    }
}

//Nettoie la grille
function nettoyerGrille(){
    context2D.clearRect(0,0,canvasCellGrid.width,canvasCellGrid.height);
}

//Dessine les cellules dans le canvas
function drawCell(ligne, colonne,color){
    context2D.fillStyle = color;
    context2D.fillRect(colonne*tailleCell,ligne*tailleCell,tailleCell,tailleCell);
}





/************************************
 * Declaration des handlers
 ************************************/
//Gestion des modifications hauteur/largeur
hauteurGrille.addEventListener("change",handleChangeHauteur, false);
hauteurGrille.addEventListener("keyup",handleChangeHauteur, false);
largeurGrille.addEventListener("change",handleChangeLargeur, false);
largeurGrille.addEventListener("keyup",handleChangeLargeur, false);

//Gestion de la modification de la configuration
configurationSelect.addEventListener("change",handleChangeConfiguration, false);
//Gestion du click sur reset, on recharge la configuration
btnReset.addEventListener("click",handleChangeConfiguration,false);

//Gestion de la modification de la vitesse
selVitesseSimulation.addEventListener("click", handleChangeVitesse,false);

//Gestion du click sur le bouton pour démarrer automatiquement la génération de cycles
btnLancerSimulation.addEventListener("click", handleAutoCycle,false);

//Click sur le bouton pour avancer d'un cycle
btnCycleSuivant.addEventListener("click", nextCycle, false);

//Gestion des liens href
Array.prototype.forEach.call(links, function (link) {
    const url = link.getAttribute('href');
    if (url.indexOf('http') === 0) {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            shell.openExternal(url)
        })
    }
});

/************************************
 * Initialisation page
 ************************************/
//On charge les configurations
getListeConfigurations();
//On initialise la grille
initGrille();