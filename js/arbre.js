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
};

Arbre.prototype.getMaxMinMax = function () {
  for (var element of this.fils) {
    if (element instanceof Noeud) {
      element.setValeurMinMax(1);
      if ((this.valeur == 0) || (element.valeur < this.valeur)) {
        this.valeur = element.valeur;
      }
    }
    else if (element instanceof Feuille) {
      if ((this.valeur == 0) || (element.valeur < this.valeur)) {
        this.valeur = element.valeur;
      }
    }
  }

  return this.getMax();
};

Noeud.prototype.setValeurMinMax = function (level) {
  var tmp_level = level;
  for (var element of this.fils) {
    if (element instanceof Noeud) {
      element.setValeurMinMax(++tmp_level);
      if (level % 2 == 0) {
        if (element.valeur > this.valeur) {
          this.valeur = element.valeur;
        }
      }
      else {
        if ((this.valeur == 0) || (element.valeur < this.valeur)) {
          this.valeur = element.valeur;
        }
      }
    }
    else if (element instanceof Feuille) {
      if (element.valeur > this.valeur) {
        this.valeur = element.valeur;
      }
    }
  }
};

function Noeud(colonne) {
  this.colonne = colonne;
  this.valeur = 0;
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