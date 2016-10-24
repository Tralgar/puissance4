const HUMAN_PLAYER = 0;
const IA_PLAYER = 1;

var Master = {
  init: function () {
    console.log('Initialisation');
    // checker la diffultée
    $('#button-start').click(function () {
      Master.startGame();
    });

    //L'humain clique sur le bouton, ajoute son pion et redonne la main à l'IA
    $('#puissance4-actionRow th button').click(function () {
      var coord = Master.addToken($(this).data('col'),HUMAN_PLAYER);
      if(Master.checkEnd(coord['x'],coord['y'],HUMAN_PLAYER)){
        Master.displayMessage("Vainqueur : Humain");
      }
      else{
        Master.iAPlay();
      }
    });
  },
  startGame: function () {
    $('.token').remove();
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
    var aResult = Array;
    aResult['y'] = column_number;
    if (player_type == HUMAN_PLAYER) {
      console.log('human_player');
      end = false;
      $('.column_' + column_number).toArray().reverse().forEach(function (element) {
        if ($(element).has('div').length == 0) {
          if(!end){
            $(element).append('<div class="token human_token"></div>');
            aResult['x'] = $(element).parent().data('ligne');
            end = true;
          } 
        }
      });
    }
    else if (player_type == IA_PLAYER) {
      console.log('ia_player');
      end = false;
      $('.column_' + column_number).toArray().reverse().forEach(function (element) {
        if ($(element).has('div').length == 0) {
          if(!end){
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
    return aResult;
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
      Master.addToken(aColonneJouable[nombreAleatoire],IA_PLAYER);
    }
    Master.refreshButton();
    Master.humanPlay();
  },
  humanPlay: function () {
    //On désactive les boutons des colonnes pleines
    for(var i = 1; i <= 7; i++){
      if(Master.isFullColumn(i)){
        console.log('#button'+i);
        $('#button'+i).attr('disabled', 'disabled');
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
  //On check si on finit on plaçant un pion au coord (x,y)
  checkEnd: function (x,y,type) {
    var toCheck = 'ia_token';
    if(type==HUMAN_PLAYER){
      toCheck = 'human_token';
    }

    var cpt = 0;
    //On check horizontalement
    $('#row-'+x+ ' td').each(function(){
      if($(this).children().length>0){
        cpt++;
        if(cpt == 4){return true;}
      }
    });
    return false;
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
    return $('#row-1 .column_' + column_number + ' div').length ? true : false;
  }
}
$(document).ready(function () {
  Master.init();
});
