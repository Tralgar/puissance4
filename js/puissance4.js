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
var arbre = [];
var level_prediction = 1;

var Master = {
  init: function () {
    console.log('Initialisation');

    // checker la diffultée
    $('#button-start').click(function () {
      Master.startGame();
    });

    //L'humain clique sur le bouton, ajoute son pion et redonne la main à l'IA
    $('#puissance4-actionRow th button').click(function () {
      var coord = Master.addToken($(this).data('col'), HUMAN_PLAYER);
      if (Master.checkEnd(coord['x'], coord['y'], HUMAN_PLAYER)) {
        Master.displayMessage("Vainqueur : Humain");
		Master.endGame();
      }
      else {
        Master.iAPlay(IA_PLAYER);
      }
    });
  },
  endGame: function (type) {
	  tempsPartie = Math.round(new Date().getTime()) - tempsPartie;
	  
	  Master.disableButton();
	  renderHistorique(historique);
	  
	  //Nombre de partie et nombre partie gagants
	  nbPartie++;
	  if(type==2){nbWin2++}
	  else{nbWin1++;}
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
	  if(tempsSessionMoyen<1000){tempsSessionMoyen = tempsSessionMoyen + ' ms';}
	  else{tempsSessionMoyen = tempsSessionMoyen/1000 + 's';}
	  $('#tempsPartie').html(tempsPartie + ' ms');
	  $('#tempsSession').html(tempsSessionMoyen);
	  
	  
	  //Création des charts
	  tabPartie.push(nbPartie);
	  
	  //Création chart temp
	  tabTempsCoup.push(tempsPartie);
	  Master.creerGraph("#myChart",tabPartie,tabTempsCoup,"Temps d'éxécution par partie");
	  
	  //Création chart nbCoups
	  tabNbCoup.push(nbCoup);
	  Master.creerGraph("#myChart2",tabPartie,tabNbCoup,"Nombre de coups par partie");
	  
	  nbPartieSession++;
	  //On a fini la session
	  if(nbPartieSession == $("#nbPartie").val()){
		  nbPartieSession = 0;
	  }
	  //on continue
	  else{
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

    level_prediction = $('#nbCoup1').val();

    var random = (Math.floor((Math.random() * 10) + 1) <= 5);
    if (random) {
      if ($('#typeJoueur2').val() == 1) {
        Master.iAPlay(IA_PLAYER2);
      }
      else {
        Master.humanPlay();
      }
    }
    else {
      Master.iAPlay(IA_PLAYER);
    }
  },
  //Renvoie les coodonnée X/Y de la prochaine case à jouer d'une colonne
  getCoordJetonByColumn: function (column_number) {
    var aResult = new Array;
    aResult['y'] = column_number;
    end = false;
    $('.column_' + column_number).toArray().reverse().forEach(function (element) {
      if ($(element).has('div').length == 0) {
        if (!end) {
          aResult['x'] = $(element).parent().data('ligne');
          end = true;
        }
      }
    });
    if (aResult['x'] <= 0) {
      return false;
    }
    return aResult;
  },
  addToken: function (column_number, player_type) {
    nbCoup++;
	
	var aResult = Array;
    aResult['y'] = column_number;
    if (player_type == HUMAN_PLAYER || player_type == IA_PLAYER2) {
      end = false;
      $('.column_' + column_number).toArray().reverse().forEach(function (element) {
        if ($(element).has('div').length == 0) {
          if (!end) {
            if (player_type == HUMAN_PLAYER) {
              $(element).append('<div class="token human_token"></div>');
            }
            else {
              $(element).append('<div class="token ia_token2"></div>');
            }
            aResult['x'] = $(element).parent().data('ligne');
            end = true;
          }
        }
      });
    }
    else if (player_type == IA_PLAYER) {
      end = false;
      $('.column_' + column_number).toArray().reverse().forEach(function (element) {
        if ($(element).has('div').length == 0) {
          if (!end) {
            $(element).append('<div class="token ia_token"></div>');
            aResult['x'] = $(element).parent().data('ligne');
            end = true;
          }
        }
      });
    }
    else {
      alert('AddToken  : player_type inconnu');
    }
	//Maj historique
	addCoupHistorique(historique,aResult['y'],aResult['x'],player_type);
	
    //FIN
    return aResult;
  },
  iAPlay: function (TYPE_IA) {
    Master.disableButton();
    Master.displayMessage("Tour IA " + TYPE_IA);

    arbre = new Arbre(Master.creerArbre());

    //On parcours les fils de la branche en cours
    var colMax = null;
    var arrayMax = new Array;
    for (i = 0; i < arbre.fils.length; i++) {
      //console.log(arbre.fils[i]);
      if (colMax == null || arbre.fils[i].valeur > colMax) {
        colMax = arbre.fils[i].valeur;
        arrayMax = new Array;
        arrayMax[0] = arbre.fils[i].colonne;

      }
      else if (colMax == arbre.fils[i].valeur) {
        arrayMax[arrayMax.length] = arbre.fils[i].colonne;
      }
    }
    //SI plusieurs possibilité ont les même valeurs on choisi aléatoirement
    var nombreAleatoire = Math.floor(Math.random() * (arrayMax.length - 0));
    coord = Master.addToken(arrayMax[nombreAleatoire], TYPE_IA);

    //WIN
    if (Master.checkEnd(coord['x'], coord['y'], TYPE_IA)) {
      Master.displayMessage("Vainqueur : IA " + TYPE_IA);
	  Master.endGame(TYPE_IA);
    }
    //On continue
    else {
      Master.refreshButton();
      if ($("#typeJoueur2").val() == 0) {
        Master.humanPlay();
      }
      else {
        if (TYPE_IA == 1) {
          Master.iAPlay(IA_PLAYER2);
        }
        else {
          Master.iAPlay(IA_PLAYER);
        }

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
    var aTable = [];
    for (var i = 1; i <= 7; i++) {
      if (!Master.isFullColumn(i, virtual_token)) {
        aTable.push(i);
      }
    }
    return aTable;
  },
  //On check si on finit on plaçant un pion au coord (x,y)
  checkEnd: function (x, y, type, forcePrevision) {
    if (forcePrevision == 'undefined') {
      forcePrevision = false;
    }
    var toCheck = 'ia_token';
    if (type == HUMAN_PLAYER) {
      toCheck = 'human_token';
    }
    if (type == IA_PLAYER2) {
      toCheck = 'ia_token2';
    }

    //Ajout d'un jeton invisible sur la case de prevision
    if (forcePrevision) {
      var elem = $(".puissance4_column[data-col='" + (y) + "'][data-row='" + (x) + "']");
      if (elem.length > 0) {
        elem.append('<div style="display:none" class="invisibleToDelete ' + toCheck + '"></div>');
      }
    }

    var win = false;
    var cpt = 0;
    //On check horizontalement
    for (var i = 1; i <= 7; i++) {
      elem = $('#row-' + x + ' .column_' + i);
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
      elem = $('#row-' + i + ' .column_' + y);
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
    var start = x - (y - 1);
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
    var startX = y - (7 - x);
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
      if (virtual_token.indexOf(column_number) >= 0) { //@todo remplacer if par while et corriger le tableau virtual token
        case_to_test += 1;
      }
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
        var node = new Feuille(colonne, 1); //@todo remplacer par la fonction d'eval
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
      //console.log(virtual_token);
      Master.getColumnPlay(virtual_token).forEach(function (colonne) {
        aFils.push(new Feuille(colonne, 1)); // 1 valeur de la feuille @todo remplacer par la fonction d'eval
      });
    }
    else {
      Master.getColumnPlay(virtual_token).forEach(function (colonne) {
        var tmp_current_level = current_level_prediction;
        aFils.push(Master.createNode(colonne, ++tmp_current_level, virtual_token));
      });
    }

    node.setFils(aFils);

    return node;
  },
  // Donne un nombre de point à la branche en fonction de son potentiel
  // Algo 1 : donne des points en fonction du nombre de doublet/triplet que va former le nouveau jeton (dans tous les sens)
  // Algo 2 : donner un grand nombre de point pour contrer adversaire ayant un triplet
  evalFeuille: function (type) {
    var typeToken = 'ia_token';
    if (type == IA_PLAYER2) {
      typeToken = 'ia_token2';
    }

    //On donne des points en fonction du nombre de jeton de même couleurs sur les cases annexes (ex : v=5 si on est entouré de 5 jetons)
    for (i = 0; i < arbre.fils.length; i++) {
      valeur = 0;
      col = arbre.fils[i].colonne;
      var casec = $('.column_' + col + ':not(:has(div)):last');
      caseX = casec.data('col');
      caseY = casec.data('row');

      //Horizontal
      var ptsX = 0;
      var multiplicateur = 1;
      for (var j = 1; j < 4; j++) {
        if ($(".puissance4_column[data-col='" + (caseX + j) + "'][data-row='" + (caseY) + "']:has(div." + typeToken + ")").length > 0) {
          ptsX = ptsX + (1 * multiplicateur);
          multiplicateur++;
        }
        else {
          break;
        }
      }
      for (var k = 1; k < 4; k++) {
        if ($(".puissance4_column[data-col='" + (caseX - k) + "'][data-row='" + (caseY) + "']:has(div." + typeToken + ")").length > 0) {
          ptsX = ptsX + (1 * multiplicateur);
          multiplicateur++;
        }
        else {
          break;
        }
      }
      //Vertical
      var ptsY = 0;
      var multiplicateur = 1;
      for (var j = 1; j < 4; j++) {
        if ($(".puissance4_column[data-col='" + (caseX) + "'][data-row='" + (caseY + j) + "']:has(div." + typeToken + ")").length > 0) {
          ptsY = ptsY + (1 * multiplicateur);
          multiplicateur++;
        }
        else {
          break;
        }
      }
      for (var k = 1; k < 4; k++) {
        if ($(".puissance4_column[data-col='" + (caseX) + "'][data-row='" + (caseY - k) + "']:has(div." + typeToken + ")").length > 0) {
          ptsY = ptsY + (1 * multiplicateur);
          multiplicateur++;
        }
        else {
          break;
        }
      }
      //Diagonale 1
      var ptsD1 = 0;
      var multiplicateur = 1;
      for (var j = 1; j < 4; j++) {
        if ($(".puissance4_column[data-col='" + (caseX + j) + "'][data-row='" + (caseY + j) + "']:has(div." + typeToken + ")").length > 0) {
          ptsD1 = ptsD1 + (1 * multiplicateur);
          multiplicateur++;
        }
        else {
          break;
        }
      }
      for (var k = 1; k < 4; k++) {
        if ($(".puissance4_column[data-col='" + (caseX - k) + "'][data-row='" + (caseY - k) + "']:has(div." + typeToken + ")").length > 0) {
          ptsD1 = ptsD1 + (1 * multiplicateur);
          multiplicateur++;
        }
        else {
          break;
        }
      }
      //Diagonale 2
      var ptsD2 = 0;
      var multiplicateur = 1;
      for (var j = 1; j < 4; j++) {
        if ($(".puissance4_column[data-col='" + (caseX + j) + "'][data-row='" + (caseY - j) + "']:has(div." + typeToken + ")").length > 0) {
          ptsD2 = ptsD2 + (1 * multiplicateur);
          multiplicateur++;
        }
        else {
          break;
        }
      }
      for (var k = 1; k < 4; k++) {
        if ($(".puissance4_column[data-col='" + (caseX - k) + "'][data-row='" + (caseY + k) + "']:has(div." + typeToken + ")").length > 0) {
          ptsD2 = ptsD2 + (1 * multiplicateur);
          multiplicateur++;
        }
        else {
          break;
        }
      }
      arbre.fils[i].valeur = ptsX + ptsY + ptsD1 + ptsD2;
      arbre.fils[i].ptsX = ptsX;
      arbre.fils[i].ptsY = ptsY;
      arbre.fils[i].ptsD1 = ptsD1;
      arbre.fils[i].ptsD2 = ptsD2;

      //On donne des points pour les contres, si l'ennemi peut gagner avec une case on la bloque
      var coord = Master.getCoordJetonByColumn(arbre.fils[i].colonne);
      var endNextMove = false;
      if (type == IA_PLAYER) {
        var player_ennemi = IA_PLAYER2;
        if ($('#typeJoueur2').val() == 0) {
          player_ennemi = HUMAN_PLAYER;
        }
        endNextMove = Master.checkEnd(coord['x'], coord['y'], player_ennemi, true);
      }
      if (type == IA_PLAYER2) {
        endNextMove = Master.checkEnd(coord['x'], coord['y'], IA_PLAYER, true);
      }
      if (endNextMove) {
        arbre.fils[i].valeur += 100;
        arbre.fils[i].ptsContre = 100;
      }
    }
  },
  creerGraph: function(selector,labelsParam,dataParam,labelParam){
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
