//Initialisation IPC client
const { ipcRenderer } = require('electron');

//Constantes représentant l'interface graphique
const largeurGrille = document.getElementById("hauteurSimulation");
const hauteurGrille = document.getElementById("largeurSimulation");

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
    let reponse;
    reponse = ipcRenderer.sendSync("commSync","getGrilleHauteur");
    hauteurGrille.value = reponse;
    reponse = ipcRenderer.sendSync("commSync","getGrilleLargeur");
    largeurGrille.value = reponse;
    chargeGrille();
}

//Charge la grille de l'application
function chargeGrille(){
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
            currentLine.innerHTML+=currentCell.outerHTML;
        }
        gameGrid.innerHTML+=currentLine.outerHTML;
    }
}

//Envoie une demande de génération de cycle suivant
function nextCycle(){
    ipcRenderer.sendSync("commSync","processOneCycle");
    chargeGrille();
}

//Active la génération de cycle automatique

//Desactive la génération de cycle automatique

btnCycleSuivant.addEventListener("click", nextCycle, false);


initGrille();