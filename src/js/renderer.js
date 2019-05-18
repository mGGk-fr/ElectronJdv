//Initialisation IPC client
const { ipcRenderer } = require('electron');

//Timer autoplay
let timerId;
let isPlaying = false;
let vitesseSimulation = 450;

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

//Charge la liste des configurations dans le select
function getListeConfigurations(){
    //On charge la liste des configurations disponibles
    let reponse = ipcRenderer.sendSync("commSync", "getConfigList");
    //On vide la liste des configurations
    configurationSelect.innerHTML = "";
    reponse.forEach(function(config){
        let opt = document.createElement("option");
        opt.value = config.id;
        opt.innerHTML = config.nom;
        configurationSelect.appendChild(opt);
    });
}

//Gère le changement de configuration
function handleChangeConfiguration(){
    if(ipcRenderer.sendSync("commSync","changeConfiguration",configurationSelect[configurationSelect.selectedIndex].value)){
        initGrille();
    }else{
        alert("Une erreur est survenue durant le changement de configuration");
    }
}

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
            //let status = ipcRenderer.sendSync("commSync","getCellStatus",i,j);
            //drawCell(i+1,j+1,"red");
            if(tab[i][j]){
                drawCell(i,j,"black");
            }else{
                //drawCell(i,j,"white");
            }
        }
    }
    //drawGrille();
}

//Nettoie la grille
function nettoyerGrille(){
    context2D.clearRect(0,0,canvasCellGrid.width,canvasCellGrid.height);
}

function drawGrille(){
    //On dessine la grille
    context2D.strokeStyle = "black";
    for(let i = 1; i< hauteurGrille.value;i++){
        context2D.moveTo(0,i*tailleCell);
        context2D.lineTo(canvasCellGrid.width,i*tailleCell);
    }
    for(let i = 1; i< largeurGrille.value;i++){
        context2D.moveTo(i*tailleCell,0);
        context2D.lineTo(i*tailleCell,canvasCellGrid.height);
    }
    context2D.stroke();
}

//Dessine les cellules dans le canvas
function drawCell(ligne, colonne,color){
    context2D.fillStyle = color;
    context2D.fillRect(colonne*tailleCell,ligne*tailleCell,tailleCell,tailleCell);
}

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
        console.log(vitesseSimulation);
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

//Envoie une demande de génération de cycle suivant
function nextCycle(){
    ipcRenderer.sendSync("commSync","processOneCycle");
    chargeGrille();
}

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

//On charge les configurations
getListeConfigurations();
//On initialise la grille
initGrille();