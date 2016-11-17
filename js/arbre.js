function Arbre(aFils) {
  this.fils = aFils;
}

function Noeud(colonne) {
  this.colonne = colonne;
  this.valeur = null;
  this.fils = [];
}

Noeud.prototype.setFils = function (aFils) {
  this.fils = aFils;
};

Noeud.prototype.setValeur = function (valeur) {
  this.valeur = valeur;
};

Noeud.prototype.toString = function () {
  console.log("Je suis le noeud [" + this.colonne + ";" + this.valeur + "] et mes fils sont :");
  this.fils.forEach(function (element) {
    console.log("Fils : [" + element.colonne + ";" + element.valeur + "] ");
  });
}

function Feuille(colonne, valeur) {
  this.colonne = colonne;
  this.valeur = valeur;
}