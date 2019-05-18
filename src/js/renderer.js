//Initialisation IPC client
const { ipcRenderer } = require('electron');

//Elements représentant la configuration de la simulation
const largeurGrille = document.getElementById("largeurSimulation");
const hauteurGrille = document.getElementById("hauteurSimulation");
const vitesseSimulation = document.getElementById("vitesseSimulation");

//Elements gérant la simulation
const btnLancerSimulation = document.getElementById("btnLanceSimulation");
const btnCycleSuivant = document.getElementById("btnCycleSuivant");

//Constante template elements
const cellTpl = document.getElementById("cellTpl");
const rowTpl = document.getElementById("rowTpl");
const gameGrid = document.getElementById("gameArena");

//Ecoute les signaux IPC envoyés par le process nodejs
ipcRenderer.on("commAsync", function(event, arg){
   switch(arg){
       case "callRender":
           chargeGrille();
           break;
   }
});

//Initialise la grille au démarrage de l'appli
function initGrille(){
    hauteurGrille.value = ipcRenderer.sendSync("commSync","getGrilleHauteur");
    largeurGrille.value = ipcRenderer.sendSync("commSync","getGrilleLargeur");
    vitesseSimulation.value = ipcRenderer.sendSync("commSync", "getVitesseSimulation");
    gameGrid.innerHTML = "";
    for(let i = 0; i < hauteurGrille.value;i++){
        let currentLine = rowTpl.cloneNode();
        currentLine.id = "row"+i;
        for(let j = 0; j < largeurGrille.value; j++){
            let currentCell = cellTpl.cloneNode();
            let status = ipcRenderer.sendSync("commSync","getCellStatus",i,j);
            if(status){
                currentCell.classList.add("vivante");
            }
            currentCell.id=i+"x"+j;
            currentLine.innerHTML+=currentCell.outerHTML;
        }
        gameGrid.innerHTML+=currentLine.outerHTML;
    }
    chargeGrille();
}

//Charge la grille de l'application
function chargeGrille(){
    for(let i = 0; i < hauteurGrille.value;i++){
        for(let j = 0; j < largeurGrille.value; j++){
            let status = ipcRenderer.sendSync("commSync","getCellStatus",i,j);
            let curCell = document.getElementById(i+"x"+j);
            if(status){
                if(!curCell.classList.contains("vivante")){
                    curCell.classList.add("vivante");
                }
            }else{
                curCell.classList.remove("vivante");
            }
        }
    }
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
    ipcRenderer.sendSync("commSync","setAutoCycleVitesse", vitesseSimulation.value);
    console.log(vitesseSimulation.value);
}

//Gere le démarrage et l'arrêt du cycle automatique
function handleAutoCycle(){
    let response = ipcRenderer.sendSync("commSync","getAutoCycleStatus");
    if(response === true){
        ipcRenderer.sendSync("commSync", "setAutoCycleStatus",false);
        btnLancerSimulation.innerText = "Démarrer la simulation";
        btnCycleSuivant.disabled = false;
    }else{
        ipcRenderer.sendSync("commSync", "setAutoCycleStatus", true);
        btnLancerSimulation.innerText = "Arrêter la simulation";
        btnCycleSuivant.disabled = true;
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

//Gestion de la modification de la vitesse
vitesseSimulation.addEventListener("click", handleChangeVitesse,false);

//Gestion du click sur le bouton pour démarrer automatiquement la génération de cycles
btnLancerSimulation.addEventListener("click", handleAutoCycle,false);

//Click sur le bouton pour avancer d'un cycle
btnCycleSuivant.addEventListener("click", nextCycle, false);


initGrille();