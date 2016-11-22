const HUMAN_PLAYER = 0;
const IA_PLAYER = 1;
const IA_PLAYER2 = 2;

var level_prediction = 1;
var current_player = null;
var enemy_player = null;

var token_in_game = [];

var Master = {
  init: function () {
    $('#button-start').click(function () {
      Master.startGame();
    });

    $('#puissance4-actionRow th button').click(function () {
      current_player = HUMAN_PLAYER;
      var coord = Master.addToken($(this).data('col'));

      if (Master.checkEnd(coord)) {
        Master.displayMessage("Vainqueur : Humain");
        Master.disableButton();
      }
      else {
        current_player = IA_PLAYER;
        Master.iAPlay();
      }
    });
  },
  startGame: function () {
    $('.token').remove();
    Master.refreshButton();
    Master.displayMessage("Début de la partie");

    level_prediction = $('#nbCoup1').val();

    var random = (Math.floor((Math.random() * 2) + 1) == 1);
    if (random) {
      current_player = $('#typeJoueur2').val();
      enemy_player = IA_PLAYER;

      if (current_player == IA_PLAYER2) {
        Master.iAPlay();
      }
      else {
        current_player = HUMAN_PLAYER;
        Master.humanPlay();
      }
    }
    else {
      current_player = IA_PLAYER;
      enemy_player = $('#typeJoueur2').val();
      Master.iAPlay();
    }
  },
  setPlayers: function () {
    var tmp_player = current_player;
    current_player = enemy_player;
    enemy_player = tmp_player;
  },
  getCoordTokenByColumn: function (column_number, virtual_token) {
    // @todo axe d'amélioration par ex ID et pas de foreach etc...
    var y = 0;
    $('.column_' + column_number).toArray().reverse().forEach(function (element) {
      if ($(element).has('div').length == 0) {
        y = $(element).parent().data('ligne');
      }
    });

    if (typeof virtual_token !== 'undefined') {
      virtual_token.forEach(function (colonne) {
        if (colonne == column_number) {
          y -= 1;
        }
      });
    }

    return (y < 1) ? false : new Coord(column_number, y);
  },
  addToken: function (column_number) {
    var coord = new Coord(null, column_number);

    $('.column_' + column_number).toArray().reverse().some(function (element) {
      if ($(element).has('div').length == 0) {
        $(element).append('<div class="token" data-player="' + current_player + '"></div>');
        coord.x = $(element).parent().data('ligne');
        return coord;
      }
    });

    return false;
  },
  iAPlay: function () {
    Master.disableButton();
    Master.displayMessage("Tour IA " + current_player);

    token_in_game[current_player] = [];
    token_in_game[enemy_player] = [];
    $('div[data-player]').each(function () {
      var parent = $(this).parent();
      token_in_game[$(this).attr('data-player')].push(new Coord(parent.attr('data-col'), parent.attr('data-row')));
    });

    var arbre = new Arbre(Master.creerArbre());
    var coord = Master.addToken(arbre.getMax());

    //WIN
    if (Master.checkEnd(coord)) {
      Master.displayMessage("Vainqueur : IA " + current_player);
      Master.disableButton();
    }
    else {
      Master.refreshButton();
      if (enemy_player == HUMAN_PLAYER) {
        Master.setPlayers();
        Master.humanPlay();
      }
      else {
        Master.setPlayers();
        Master.iAPlay();
      }
    }
  },
  humanPlay: function () {
    for (var i = 1; i <= 7; i++) {
      if (Master.isFullColumn(i)) {
        $('#button' + i).attr('disabled', 'disabled');
      }
    }
    Master.displayMessage("Tour Humain");
  },
  getColumnPlay: function (virtual_token) {
    var aTable = [];
    for (var i = 1; i <= 7; i++) {
      if (!Master.isFullColumn(i, virtual_token)) {
        aTable.push(i);
      }
    }
    return aTable;
  },
  checkEnd: function (coord, forcePrevision) {
    // @todo enlever tocheck et ajouter data-player
    if (forcePrevision == 'undefined') {
      forcePrevision = false;
    }

    // @todo essayer de ne pas mettre de pion physique mais ajouter au tableau
    //Ajout d'un jeton invisible sur la case de prevision
    if (forcePrevision) {
      var elem = $(".puissance4_column[data-col='" + coord.y + "'][data-row='" + coord.x + "']");
      if (elem.length > 0) {
        elem.append('<div class="invisibleToDelete" data-player="' + current_player + '"></div>');
      }
    }

    var win = false;
    var cpt = 0;
    //On check horizontalement
    for (var i = 1; i <= 7; i++) {
      elem = $('#row-' + coord.x + ' .column_' + i);
      // @todo mettre un find
      if (elem.children().length > 0) {
        token = elem.children();
        if (token.hasClass(toCheck)) {
          cpt++;
        }
        else {
          cpt = 0;
        }
      }
      else {
        cpt = 0;
      }
      if (cpt == 4) {
        win = true;
      }
    }

    //On check verticalement
    var cpt = 0;
    for (var i = 1; i <= 7; i++) {
      elem = $('#row-' + i + ' .column_' + coord.y);
      if (elem.children().length > 0) {
        token = elem.children();
        if (token.hasClass(toCheck)) {
          cpt++;
        }
        else {
          cpt = 0;
        }
      }
      else {
        cpt = 0;
      }
      if (cpt == 4) {
        win = true;
      }
    }

    //On check diagonale 1
    var cpt = 0;
    var start = coord.x - (coord.y - 1);
    if (start < 0) {
      start = 0;
    }
    var j = 1;
    for (var i = start; i <= 7; i++) {
      elem = $('#row-' + i + ' .column_' + j);
      if (elem.children().length > 0) {
        token = elem.children();
        if (token.hasClass(toCheck)) {
          cpt++;
        }
        else {
          cpt = 0;
        }
      }
      else {
        cpt = 0;
      }
      if (cpt == 4) {
        win = true;
      }
      j++;
    }

    //On check diagonale 2
    var cpt = 0;
    var startY = 7;
    var startX = coord.y - (7 - coord.x);
    var j = startX;
    if (startY < 0) {
      startY = 0;
    }

    for (var i = startY; i > 0; i--) {
      elem = $('#row-' + j + ' .column_' + i);
      if (elem.children().length > 0) {
        token = elem.children();
        if (token.hasClass(toCheck)) {
          cpt++;
        }
        else {
          cpt = 0;
        }
      }
      else {
        cpt = 0;
      }
      if (cpt == 4) {
        win = true;
      }
      j++;
    }

    if (forcePrevision) {
      $('.invisibleToDelete').remove();
    }

    return win;
  },
  displayMessage: function (str) {
    setTimeout(function () {
      $('#message').html(str);
    }, 500);
  },
  disableButton: function () {
    //On désactive les boutons de base
    $('#puissance4-actionRow button').attr('disabled', 'disabled');
  },
  refreshButton: function () {
    //On active les boutons de base
    $('#puissance4-actionRow button').removeAttr('disabled');
  },
  isFullColumn: function (column_number, virtual_token) {
    var case_to_test = 1;
    if (typeof virtual_token !== 'undefined') {
      virtual_token.forEach(function (colonne) {
        if (colonne == column_number) {
          case_to_test += 1;
        }
      });
    }

    return $('#row-' + case_to_test + ' .column_' + column_number + ' div').length ? true : false;
  },
  creerArbre: function () {
    var aFils = [];
    Master.getColumnPlay().forEach(function (colonne) {
      if (level_prediction > 1) {
        var node = Master.createNode(colonne, 1);
      }
      else {
        var node = new Feuille(colonne, Master.evalFeuille());
      }

      aFils.push(node);
    });

    return aFils;
  },
  createNode: function (colonne, current_level_prediction, virtual_token) {
    var virtual_token = (typeof virtual_token !== 'undefined') ? virtual_token : [];
    var node = new Noeud(colonne);
    var aFils = [];

    virtual_token.push(colonne);

    if (current_level_prediction == level_prediction) {
      Master.getColumnPlay(virtual_token).forEach(function (colonne) {
        aFils.push(new Feuille(colonne, Master.evalFeuille(colonne, virtual_token)));
      });
    }
    else {
      Master.getColumnPlay(virtual_token).forEach(function (colonne) {
        var tmp_current_level = current_level_prediction;
        aFils.push(Master.createNode(colonne, ++tmp_current_level, virtual_token));
      });
    }

    var aValeurs = aFils.map(function (a) {
      return a.valeur;
    });

    if (current_level_prediction % 2 == 0) {
      node.setValeur(Math.min.apply(null, aValeurs));
    }
    else {
      node.setValeur(Math.max.apply(null, aValeurs));
    }

    node.setFils(aFils);
    virtual_token.pop();

    return node;
  },
  // Donne un nombre de point à la branche en fonction de son potentiel
  // Algo 1 : donne des points en fonction du nombre de doublet/triplet que va former le nouveau jeton (dans tous les sens)
  // Algo 2 : donner un grand nombre de point pour contrer adversaire ayant un triplet
  evalFeuille: function (colonne, virtual_token) {
    var coord = Master.getCoordTokenByColumn(colonne, virtual_token);

    virtual_token.forEach(function (colonne, index) {
      if (index % 2 == 0) {
        token_in_game[current_player].push(Master.getCoordTokenByColumn(colonne));
      }
      else {
        token_in_game[enemy_player].push(Master.getCoordTokenByColumn(colonne));
      }
    });

    // horizontal
    var ptsH1 = 0;
    var multiplicateur = 1;
    for (var i = 1; i < 4; i++) {
      var tmp_coord = new Coord(coord.x + i, coord.y);
      if (token_in_game[current_player].indexOf(tmp_coord) > -1) {
        ptsH1 = ptsH1 + multiplicateur;
        multiplicateur++;
      }
      else {
        break;
      }
    }

    var ptsH2 = 0;
    multiplicateur = 1;
    for (var i = 1; i < 4; i++) {
      var tmp_coord = new Coord(coord.x - i, coord.y);
      if (token_in_game[current_player].indexOf(tmp_coord) > -1) {
        ptsH2 = ptsH2 + multiplicateur;
        multiplicateur++;
      }
      else {
        break;
      }
    }

    //Vertical
    var ptsV1 = 0;
    multiplicateur = 1;
    for (var i = 1; i < 4; i++) {
      var tmp_coord = new Coord(coord.x, coord.y + i);
      if (token_in_game[current_player].indexOf(tmp_coord)) {
        ptsV1 = ptsV1 + multiplicateur;
        multiplicateur++;
      }
      else {
        break;
      }
    }

    var ptsV2 = 0;
    multiplicateur = 1;
    for (var i = 1; i < 4; i++) {
      var tmp_coord = new Coord(coord.x, coord.y - i);
      if (token_in_game[current_player].indexOf(tmp_coord)) {
        ptsV2 = ptsV2 + multiplicateur;
        multiplicateur++;
      }
      else {
        break;
      }
    }
    
    //Diagonale 1
    var ptsD1 = 0;
    multiplicateur = 1;
    for (var i = 1; i < 4; i++) {
      var tmp_coord = new Coord(coord.x + i, coord.y + i);
      if (token_in_game[current_player].indexOf(tmp_coord)) {
        ptsD1 = ptsD1 + multiplicateur;
        multiplicateur++;
      }
      else {
        break;
      }
    }
    var ptsD2 = 0;
    multiplicateur = 1;
    for (var i = 1; i < 4; i++) {
      var tmp_coord = new Coord(coord.x - i, coord.y - i);
      if (token_in_game[current_player].indexOf(tmp_coord)) {
        ptsD2 = ptsD2 + multiplicateur;
        multiplicateur++;
      }
      else {
        break;
      }
    }
    var ptsD3 = 0;
    multiplicateur = 1;
    for (var i = 1; i < 4; i++) {
      var tmp_coord = new Coord(coord.x - i, coord.y + i);
      if (token_in_game[current_player].indexOf(tmp_coord)) {
        ptsD3 = ptsD3 + multiplicateur;
        multiplicateur++;
      }
      else {
        break;
      }
    }
    var ptsD4 = 0;
    multiplicateur = 1;
    for (var i = 1; i < 4; i++) {
      var tmp_coord = new Coord(coord.x + i, coord.y - i);
      if (token_in_game[current_player].indexOf(tmp_coord)) {
        ptsD4 = ptsD4 + multiplicateur;
        multiplicateur++;
      }
      else {
        break;
      }
    }

    var valeur = ptsH1 + ptsH2 + ptsV1 + ptsV2 + ptsD1 + ptsD2 + ptsD3 + ptsD4;

    //On donne des points pour les contres, si l'ennemi peut gagner avec une case on la bloque
    var endNextMove = false;
    //    if (current_player == IA_PLAYER) {
    //      var player_ennemi = IA_PLAYER2;
    //      if ($('#typeJoueur2').val() == 0) {
    //        player_ennemi = HUMAN_PLAYER;
    //      }
    //      endNextMove = Master.checkEnd(coord);
    //    }
    //    else if (current_player == IA_PLAYER2) {
    //      endNextMove = Master.checkEnd(coord);
    //    }

    if (endNextMove) {
      valeur += 100;
    }

    //$('.invisibleToDelete').remove();

    return valeur;
  }
}

$(document).ready(function () {
  Master.init();
});
