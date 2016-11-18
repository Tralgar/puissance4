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

function Feuille(colonne, valeur) {
  this.colonne = colonne;
  this.valeur = valeur;
}