
function sauvegarder(nameFile,win){
	var fileSystem=new ActiveXObject("Scripting.FileSystemObject");
	fileSystem.CreateTextFile("../sav/nameFile",false);
	console.log(nameFile);
	console.log(win);
}