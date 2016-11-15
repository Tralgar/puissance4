function Node(x, y) {
  this.x = x;
  this.y = y;
  this.children = [];
}

Node.prototype.getX = function () {
  return this.x;
};

Node.prototype.getY = function () {
  return this.y;
};

Node.prototype.getChildren = function () {
  return this.children;
};

Node.prototype.toString = function () {
  console.log("Je suis le noeud [" + this.x + ";" + this.y + "] et mes fils sont :");
  this.children.forEach(function (element) {
    console.log("Fils : [" + element.x + ";" + element.y + "] ");
  });
}