function Arbre(aFils) {
  this.fils = aFils;
}

Arbre.prototype.getMax = function () {
  var colonne_a_jouer = 0;
  var max_valeur = 0;
  this.fils.forEach(function (valeur) {
    // si c'est la meme valeur, 1 chance sur 2 de prendre la nouvelle pour le random de norman
    if (valeur.valeur == max_valeur) {
      if (Math.floor((Math.random() * 2) + 1) == 2) {
        colonne_a_jouer = valeur.colonne;
      }
    }
    if (valeur.valeur > max_valeur) {
      max_valeur = valeur.valeur;
      colonne_a_jouer = valeur.colonne;
    }
  });

  return colonne_a_jouer;

//  var aValeurs = this.fils.map(function (a) {
//    return a.valeur;
//  });
//
//  return Math.max.apply(null, aValeurs);
};

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

Array.prototype.randomValue = function () {
  return this[Math.floor(Math.random() * this.length)];
};

function Coord(x, y) {
  this.x = x;
  this.y = y;
}

Coord.prototype.getCoord = function() {
  return [this.x, this.y];
}