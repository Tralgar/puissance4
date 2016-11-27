const HUMAN_PLAYER = 0;
const IA_PLAYER = 1;
const IA_PLAYER2 = 2;

var nbPartie = 0;
var nbCoup = 0;
var tempsPartie = 0;

var nbPartieSession = 0;
var nbCoupSession = 0;
var tempsSession = 0;

var tabTempsCoup = new Array();
var tabNbCoup = new Array();
var tabPartie = new Array();

var nbWin1 = 0;
var nbWin2 = 0;

var historique;

var current_player = null;
var enemy_player = null;

var level_prediction = {};
var eval_type = {};

var token_in_game = [];

// @todo : axe amélioration -ne pas reconstruire le token_in_game
// @todo : L'eval prend la meme fonction d'eval pour le min max pour l'adversaire !
// @todo : eval feuille avec check end pas l'air de fonctionner + level prevision pair impair ca fait quoi ?

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
        Master.endGame();
      }
      else {
        current_player = IA_PLAYER;
        Master.iAPlay();
      }
    });
  },
  endGame: function () {
    tempsPartie = Math.round(new Date().getTime()) - tempsPartie;

    Master.disableButton();
    renderHistorique(historique);

    //Nombre de partie et nombre partie gagants
    nbPartie++;
    if (current_player == IA_PLAYER) {
      nbWin1++
    }
    else {
      nbWin2++;
    }
    $('.nbPartie').html(nbPartie);
    $('#nbVictoire1').html(nbWin1);
    $('#nbVictoire2').html(nbWin2);

    //Nombre de coups joués
    nbCoupSession = nbCoupSession + nbCoup;
    nbCoupSessionMoyen = nbCoupSession / nbPartie;
    $('#nbCoupPartie').html(nbCoup);
    $('#nbCoupSession').html(nbCoupSessionMoyen);

    //Temps d'exection
    tempsSession = tempsSession + tempsPartie;
    tempsSessionMoyen = tempsSession / nbPartie;
    if (tempsSessionMoyen < 1000) {
      tempsSessionMoyen = tempsSessionMoyen + ' ms';
    }
    else {
      tempsSessionMoyen = tempsSessionMoyen / 1000 + 's';
    }
    $('#tempsPartie').html(tempsPartie + ' ms');
    $('#tempsSession').html(tempsSessionMoyen);

    //Création des charts
    tabPartie.push(nbPartie);

    //Création chart temp
    tabTempsCoup.push(tempsPartie);
    Master.creerGraph("#myChart", tabPartie, tabTempsCoup, "Temps d'éxécution par partie");

    //Création chart nbCoups
    tabNbCoup.push(nbCoup);
    Master.creerGraph("#myChart2", tabPartie, tabNbCoup, "Nombre de coups par partie");

    nbPartieSession++;
    //On a fini la session
    if (nbPartieSession == $("#nbPartie").val()) {
      nbPartieSession = 0;
    }
    //on continue
    else {
      Master.startGame();
    }
  },
  startGame: function () {
    nbCoup = 0;
    tempsPartie = Math.round(new Date().getTime());

    //on initialise l'historique
    $('#historique').html("");
    historique = new Historique();

    $('.token').remove();
    Master.refreshButton();
    Master.displayMessage("Début de la partie");

    var player1 = $('#typeJoueur1').val();
    var player2 = $('#typeJoueur2').val();

    level_prediction[player1] = $('#nbCoup1').val();
    level_prediction[player2] = $('#nbCoup2').val();

    eval_type[player1] = $('#heuristique1').val();
    eval_type[player2] = $('#heuristique2').val();

    if (Math.floor((Math.random() * 2) + 1) == 1) {
      current_player = player2;
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
      enemy_player = player2;
      Master.iAPlay();
    }
  },
  setPlayers: function () {
    var tmp_player = current_player;
    current_player = enemy_player;
    enemy_player = tmp_player;
  },
  getCoordTokenByColumn: function (column_number, virtual_token) {
    // @todo : axe d'amélioration par ex ID et pas de foreach etc...
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
    nbCoup++;

    var coord = new Coord(column_number, null);

    var result = $('.column_' + column_number).toArray().reverse().some(function (element) {
      if ($(element).has('div').length == 0) {
        $(element).append('<div class="token" data-player="' + current_player + '"></div>');
        coord.y = $(element).parent().data('ligne');
        if (current_player != HUMAN_PLAYER) {
          token_in_game[current_player].push(coord);
        }
        return true;
      }
    });

    addCoupHistorique(historique, coord.y, coord.x);

    return result ? coord : false;
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

    if (token_in_game[current_player].length == 10 && current_player == 1)
      console.log(JSON.stringify(arbre, null, '\t'));

    var colonne = arbre.getMax();
    if (colonne == 0) {
      colonne = Master.getColumnPlay()[0];
    }
    var coord = Master.addToken(colonne);

    if (token_in_game[current_player].length == 10 && current_player == 1)
      console.log(coord);

    if (Master.checkEnd(coord)) {
      Master.displayMessage("Vainqueur : IA " + current_player);
      Master.endGame();
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
    //On désactive les boutons des colonnes pleines
    for (var i = 1; i <= 7; i++) {
      if (Master.isFullColumn(i)) {
        $('#button' + i).attr('disabled', 'disabled');
      }
    }
    Master.displayMessage("Tour Humain");
  },
  getColumnPlay: function (virtual_token) {
    var aColumns = [];
    for (var i = 1; i <= 7; i++) {
      if (!Master.isFullColumn(i, virtual_token)) {
        aColumns.push(i);
      }
    }
    return aColumns;
  },
  checkEnd: function (coord, forcePrevision) {
    if (typeof forcePrevision !== "undefined") {
      token_in_game[current_player].push(coord);
    }

    var i = 0;
    //On check verticalement
    var cpt = 0;
    for (i = 1; i <= 7; i++) {
      if (token_in_game[current_player].isInArray(new Coord(coord.x, i))) {
        cpt++;
        if (cpt == 4) {
          return true;
        }
      }
      else {
        cpt = 0;
      }
    }

    //On check horizontalement
    cpt = 0;
    for (i = 1; i <= 7; i++) {
      if (token_in_game[current_player].isInArray(new Coord(i, coord.y))) {
        cpt++;
        if (cpt == 4) {
          return true;
        }
      }
      else {
        cpt = 0;
      }
    }

    var x = 1;
    var y = 1;
    cpt = 0;
    if (coord.x < coord.y) {
      y = coord.y - coord.x + 1;
    }
    else if (coord.x > coord.y) {
      x = coord.x - coord.y + 1;
    }

    while (x <= 7 && y <= 6) {
      if (token_in_game[current_player].isInArray(new Coord(x, y))) {
        cpt++;
        if (cpt == 4) {
          return true;
        }
      }
      else {
        cpt = 0;
      }

      x++;
      y++;
    }

    x = 7;
    y = 1;
    cpt = 0;
    var add_coord = coord.x + coord.y;
    if (add_coord <= 8) {
      x = add_coord - y;
    }
    else {
      y = add_coord - x;
    }

    while (x >= 1 && y <= 6) {
      if (token_in_game[current_player].isInArray(new Coord(x, y))) {
        cpt++;
        if (cpt == 4) {
          return true;
        }
      }
      else {
        cpt = 0;
      }

      x--;
      y++;
    }

    token_in_game[current_player].pop();

    for (var i = 1; i <= 7; i++) {
      if (!Master.isFullColumn(i)) {
        return false;
      }
      j++;
    }

    return true;
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
    var case_to_test = 6;
    if (typeof virtual_token !== 'undefined') {
      virtual_token.forEach(function (colonne) {
        if (colonne == column_number) {
          case_to_test -= 1;
        }
      });
    }

    return $('#row-' + case_to_test + ' .column_' + column_number + ' div').length ? true : false;
  },
  creerArbre: function () {
    var aFils = [];
    Master.getColumnPlay().forEach(function (colonne) {
      if (level_prediction[current_player] >= 1) {
        var node = Master.creerNoeud(colonne, 1);
      }
      else {
        var node = new Feuille(colonne, Master.evalFeuille(colonne));
      }

      aFils.push(node);
    });

    return aFils;
  },
  creerNoeud: function (colonne, current_level_prediction, virtual_token) {
    var virtual_token = (typeof virtual_token !== 'undefined') ? virtual_token : [];
    var node = new Noeud(colonne);
    var aFils = [];

    virtual_token.push(colonne);

    if (current_level_prediction == level_prediction[current_player]) {
      Master.getColumnPlay(virtual_token).forEach(function (colonne) {
        aFils.push(new Feuille(colonne, Master.evalFeuille(colonne, virtual_token)));
      });
    }
    else {
      Master.getColumnPlay(virtual_token).forEach(function (colonne) {
        var tmp_current_level = current_level_prediction;
        aFils.push(Master.creerNoeud(colonne, ++tmp_current_level, virtual_token));
      });
    }

    var aValeurs = aFils.map(function (a) {
      return a.valeur;
    });

    if (current_level_prediction % 2 == 0) {
      node.setValeur(Math.max.apply(null, aValeurs));
    }
    else {
      node.setValeur(Math.min.apply(null, aValeurs));
    }

    node.setFils(aFils);
    virtual_token.pop();

    return node;
  },
  evalFeuille: function (colonne, virtual_token) {
    // @todo : est-ce que le virtual token est bien dans l'ordre ou des que la longueur est 1 c'est ennemi ou current ?
    if (eval_type[current_player] == 0) {
      return Math.floor((Math.random() * 100) + 1);
    }
    else if (eval_type[current_player] == 1) {
      var coord = Master.getCoordTokenByColumn(colonne, virtual_token);

      if (typeof virtual_token !== 'undefined') {
        virtual_token.forEach(function (colonne, index) {
          if (index % 2 == 0) {
            token_in_game[current_player].push(Master.getCoordTokenByColumn(colonne));
          }
          else {
            token_in_game[enemy_player].push(Master.getCoordTokenByColumn(colonne));
          }
        });
      }

      // horizontal
      var ptsH1 = 0;
      var multiplicateur = 1;
      for (var i = 1; i < 4; i++) {
        var tmp_coord = new Coord(coord.x + i, coord.y);
        if (token_in_game[current_player].isInArray(tmp_coord) > -1) {
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
        if (token_in_game[current_player].isInArray(tmp_coord) > -1) {
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
        if (token_in_game[current_player].isInArray(tmp_coord)) {
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
        if (token_in_game[current_player].isInArray(tmp_coord)) {
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
        if (token_in_game[current_player].isInArray(tmp_coord)) {
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
        if (token_in_game[current_player].isInArray(tmp_coord)) {
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
        if (token_in_game[current_player].isInArray(tmp_coord)) {
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
        if (token_in_game[current_player].isInArray(tmp_coord)) {
          ptsD4 = ptsD4 + multiplicateur;
          multiplicateur++;
        }
        else {
          break;
        }
      }

      var valeur = ptsH1 + ptsH2 + ptsV1 + ptsV2 + ptsD1 + ptsD2 + ptsD3 + ptsD4;

      //On donne des points pour les contres, si l'ennemi peut gagner avec une case on la bloque
      valeur += Master.checkEnd(coord, true) ? 100 : 0;

      if (typeof virtual_token != "undefined") {
        virtual_token.forEach(function (colonne, index) {
          if (index % 2 == 0) {
            token_in_game[current_player].pop();
          }
          else {
            token_in_game[enemy_player].pop();
          }
        });
      }

      return valeur;
    }
    else {
      return 1;
    }
  },
  creerGraph: function (selector, labelsParam, dataParam, labelParam) {
    var ctx = $(selector);
    var data = {
      labels: labelsParam,
      datasets: [
        {
          label: labelParam,
          fill: false,
          lineTension: 0.1,
          backgroundColor: "rgba(75,192,192,0.4)",
          borderColor: "rgba(75,192,192,1)",
          borderCapStyle: 'butt',
          borderDash: [],
          borderDashOffset: 0.0,
          borderJoinStyle: 'miter',
          pointBorderColor: "rgba(75,192,192,1)",
          pointBackgroundColor: "#fff",
          pointBorderWidth: 1,
          pointHoverRadius: 5,
          pointHoverBackgroundColor: "rgba(75,192,192,1)",
          pointHoverBorderColor: "rgba(220,220,220,1)",
          pointHoverBorderWidth: 2,
          pointRadius: 1,
          pointHitRadius: 10,
          data: dataParam,
          spanGaps: false,
        }
      ]
    };
    var myLineChart = new Chart(ctx, {
      type: 'line',
      data: data
    });
  }
}

$(document).ready(function () {
  Master.init();
});
