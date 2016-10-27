const NIVEAUARBRE = 4;

function Arbre(aFils){
  console.log("construction de l'arbre");
  this.fils = aFils;
}


function Noeud(){
  this.colonne = null;
  this.valeur = null;
  this.fils = null;
}
function Noeud(numColonne,valeur,aFils){
  this.colonne = numColonne;
  this.valeur = valeur;
  this.fils = aFils;
}

function setFils(noeud,aFils){
  noeud.fils = aFils;
}