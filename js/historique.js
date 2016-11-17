

function Historique(){
	this.aCoup = new Array();
	this.aTable = new Array;
}

function addCoupHistorique(historique,x,y,player){
  historique.aCoup.push(new Coup(x,y,player));
  var tmp = new Array();
  tmp = historique.aCoup.slice(0);
  historique.aTable.push(tmp);
}

function renderHistorique(historique){
	historique.aTable.reverse();
	var html = "<div>Nombre coups joués : " + historique.aTable.length + "</div>";
	
	for(var i = 0; i<historique.aTable.length; i++){
		var html = html + "<div class='tableHistorique'>";
		var html = html + "<h3> Coup n° " + (historique.aTable.length-i) + "</h3>";
		var html = html + renderJeu(historique.aTable[i]);
		var html = html + "</div>";
	}
	$("#historique").html(html);
}

function renderJeu(aCoup){
	var html = "<table class='historiqueJeu'>";
	
	for(var y = 0; y<6; y++){
		var html = html + "<tr>";
		for(var x = 0; x<7; x++){
			var caseHtml = "";
			var classT = "";
				for(var i = 0; i<aCoup.length; i++){
					if((aCoup[i].x-1) == x && (aCoup[i].y-1) == y){
						if(i == aCoup.length-1){
							classT = 'last';
						}
						var caseHtml = caseHtml + "<div class=' token token"+(aCoup[i].player)+"'>";
					}
				}
			html = html + "<td class='" + classT + "'>" + caseHtml + "</td>";
		}
		var html = html + "</tr>";
	}
	var html = html + "</table>";
	return html;
}