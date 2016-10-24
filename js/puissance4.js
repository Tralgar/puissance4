const HUMAN_PLAYER = 0;
const IA_PLAYER = 1;

var Master = {
  init: function () {
    console.log('Initialisation');
    this.addToken(1, HUMAN_PLAYER);
    // checker la diffultée
    $('#button-start').click(function () {
      Master.startGame();
    });

    //L'humain clique sur le bouton, ajoute son pion et redonne la main à l'IA
    $('#puissance4-actionRow th button').click(function () {
      Master.addToken($(this).data('col'),false);
      Master.iAPlay();
    });
  },
  startGame: function () {
    Master.displayMessage("Début de la partie");

    var random = (Math.floor((Math.random() * 10) + 1) <= 5);
    if (random) {
      Master.humanPlay();
    }
    else {
      Master.iAPlay();
    }
  },
  addToken: function (column_number, player_type) {
    console.log('addToken');
    if (player_type == HUMAN_PLAYER) {
      console.log('human_player');
      $('.column_' + column_number).toArray().reverse().forEach(function (element) {
        if ($(element).has('div').length == 0) {
          $(element).append('<div class="human_token"></div>')
        }
      });
    }
    else if (player_type == IA_PLAYER) {
      console.log('ia_player');
    }
    else {
      alert('AddToken  : player_type inconnu');
      return false;
    }
  },
  iAPlay: function() {
    Master.disableButton();
    Master.displayMessage("Tour IA");

    var listButton = $('#puissance4-actionRow button');

    //Tableau de colonne jouable
    aColonneJouable = Master.getColumnPlay();

    //Méthode ALEATOIRE
    if ($('#algo').val() == 0) {
      var nombreAleatoire = Math.floor(Math.random() * (aColonneJouable.length - 0));
      Master.addToken(aColonneJouable[nombreAleatoire],true);
      Master.humanPlay();
    }

    Master.refreshButton();
  },
  humanPlay: function () {
    //On désactive les boutons des colonnes pleines
    for(var i = 1; i <= 7; i++){
      if(Master.isFullColumn(i)){
        $('#row'+i+' button').attr('disabled', 'disabled');
      }
    }
    Master.displayMessage("Tour Humain");
  },
  getColumnPlay: function (){
    var aTable = new Array;
    for(var i = 1; i <= 7; i++){
      if(!Master.isFullColumn(i)){
        aTable.push(i);
      }
    }
    return aTable;
  },
  checkEnd: function () {

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
  refreshButton: function(){
    //On active les boutons de base
    $('#puissance4-actionRow button').removeAttr('disabled');
  },
  isFullColumn: function (column_number) {
    return $('#row-1 .column_' + column_number).has("div").length ? true : false;
  }
}
$(document).ready(function () {
  Master.init();
});
