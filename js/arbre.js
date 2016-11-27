function Arbre(aFils) {
  this.fils = aFils;
}

Arbre.prototype.getMax = function () {
  var aValeurs = [];
  var max_valeur = 0;
  this.fils.forEach(function (valeur) {
    if (valeur.valeur == max_valeur) {
      aValeurs.push(valeur.colonne);
    }
    else if (valeur.valeur > max_valeur) {
      max_valeur = valeur.valeur;
      aValeurs = [valeur.colonne];
    }
  });

  return aValeurs.getRandomValue();

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

Array.prototype.getRandomValue = function () {
  return this[Math.floor(Math.random() * this.length)];
};

Array.prototype.isInArray = function (coord) {
  return this.some(function (element) {
    if ((element.x == coord.x) && (element.y == coord.y)) {
      return true;
    }
  });
}

function Coord(x, y) {
  this.x = x;
  this.y = y;
}