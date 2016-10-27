const HUMAN_PLAYER = 0;
const IA_PLAYER = 1;
var arbre;

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
        Master.disableButton();
      }
      else{
        Master.evalBranche();
        Master.iAPlay();
      }
    });
  },
  startGame: function () {
    //On initialise l'arbre
    var aFils = Master.creerFils();
    arbre = new Arbre(aFils);
    $('.token').remove();
    Master.refreshButton();
    Master.displayMessage("Début de la partie");

    var random = (Math.floor((Math.random() * 10) + 1) <= 5);
    if (random) {
      Master.humanPlay();
    }
    else {
      Master.evalBranche();
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
    //DEBUT on recrée les branches
    arbre = new Arbre(Master.creerFils());
    //FIN
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
    //Méthode Min-Max
    else if($('#algo').val() == 1) {
      //On parcours les fils de la branche en cours
      var colMax = null;
      for(i=0;i<arbre.fils.length;i++){
        if(colMax == null || colMax > arbre.fils[i].valeur){
          colMax = arbre.fils[i].colonne;
        }
      }
      Master.addToken(colMax,IA_PLAYER);
    }
    Master.refreshButton();
    Master.humanPlay();
  },
  humanPlay: function () {
    //On désactive les boutons des colonnes pleines
    for(var i = 1; i <= 7; i++){
      if(Master.isFullColumn(i)){
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

    var win = false;
    var cpt = 0;
    //On check horizontalement
    for(var i=1;i<=7;i++){
      elem = $('#row-'+x+ ' .column_'+i);
      if(elem.children().length>0){
        token = elem.children();
        if(token.hasClass(toCheck)){cpt++;}
        else{cpt--;}
      }
      else{cpt = 0;}
      if(cpt == 4){
        win = true;
      }
    }

    //On check verticalement
    var cpt = 0;
    for(var i=1;i<=7;i++){
      elem = $('#row-'+i+ ' .column_'+y);
      if(elem.children().length>0){
        token = elem.children();
        if(token.hasClass(toCheck)){cpt++;}
        else{cpt--;}
      }
      else{cpt = 0;}
      if(cpt == 4){
        win = true;
      }
    }

    //On check diagonale 1
    var cpt = 0;
    var start = x-(y-1);
    if(start<0){start=0;}
    var j =1;
    for(var i = start;i<=7;i++){
      elem = $('#row-'+i+ ' .column_'+j);
      if(elem.children().length>0){
        token = elem.children();
        if(token.hasClass(toCheck)){cpt++;}
        else{cpt--;}
      }
      else{cpt = 0;}
      if(cpt == 4){
        win = true;
      }
      j++;
    }

    //On check diagonale 2
    var cpt = 0;
    var startY = 7;
    var startX = y - (7-x);
    var j = startX;
    if(startY < 0){startY =0;}
    
    for(var i = startY;i>0;i--){
      elem = $('#row-'+j+ ' .column_'+i);
      if(elem.children().length>0){
        token = elem.children();
        if(token.hasClass(toCheck)){cpt++;}
        else{cpt--;}
      }
      else{cpt = 0;}
      if(cpt == 4){
        win = true;
      }
      j++;
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
  refreshButton: function(){
    //On active les boutons de base
    $('#puissance4-actionRow button').removeAttr('disabled');
  },
  isFullColumn: function (column_number) {
    return $('#row-1 .column_' + column_number + ' div').length ? true : false;
  },
  creerFils: function(){
    var aColonneJouable = Master.getColumnPlay();
    var aFils = new Array;
    for(i=0;i<aColonneJouable.length;i++){
      var colonne = aColonneJouable[i];
      var value = 1;
      var noeudTmp = new Noeud(colonne,value,new Array);
      aFils.push(noeudTmp);
    }
    return aFils;
  },
  evalBranche:function(){
    var typeToken = 'ia_token';

    for(i=0;i<arbre.fils.length;i++){
      valeur = 0;
      col = arbre.fils[i].colonne;
      var casec = $('.column_'+col+':not(:has(div)):last');
      caseX = casec.data('col');
      caseY = casec.data('row');
      if($(".puissance4_column[data-col='"+(caseX+1)+"'][data-row='"+(caseY)+"']:has(div."+typeToken+")").length>0){
        valeur++;
      }
      if($(".puissance4_column[data-col='"+(caseX+1)+"'][data-row='"+(caseY+1)+"']:has(div."+typeToken+")").length>0){
        valeur++;
      }
      if($(".puissance4_column[data-col='"+(caseX+1)+"'][data-row='"+(caseY-1)+"']:has(div."+typeToken+")").length>0){
        valeur++;
      }
      if($(".puissance4_column[data-col='"+(caseX)+"'][data-row='"+(caseY+1)+"']:has(div."+typeToken+")").length>0){
        valeur++;
      }
      if($(".puissance4_column[data-col='"+(caseX)+"'][data-row='"+(caseY+1)+"']:has(div."+typeToken+")").length>0){
        valeur++;
      }
      if($(".puissance4_column[data-col='"+(caseX-1)+"'][data-row='"+(caseY)+"']:has(div."+typeToken+")").length>0){
        valeur++;
      }
      if($(".puissance4_column[data-col='"+(caseX-1)+"'][data-row='"+(caseY+1)+"']:has(div."+typeToken+")").length>0){
        valeur++;
      }
      if($(".puissance4_column[data-col='"+(caseX-1)+"'][data-row='"+(caseY-1)+"']:has(div."+typeToken+")").length>0){
        valeur++;
      }
      arbre.fils[i].valeur = valeur;
    }
  }
}
$(document).ready(function () {
  Master.init();
});
