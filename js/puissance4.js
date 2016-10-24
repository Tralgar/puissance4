var Master = {
  init: function () {
    console.log('Initialisation');
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
  addToken: function (numCol, b) {
    //IA
    if (b) {

    }
    //Humain
    else {

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
    return $('#row-' + column_number + ' .column-1').has("div").length ? true : false;
  }
}
$(document).ready(function () {
  Master.init();
});
