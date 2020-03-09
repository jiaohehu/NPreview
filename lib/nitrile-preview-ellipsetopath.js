var ellipsetopath = function(x1,y1,x2,y2,Rx,Ry,Cx,Cy) {
  var lambda1 = Math.atan2(y1-Cy,x1-Cx);
  var lambda2 = Math.atan2(y2-Cy,x2-Cx);
  var tao1 = Math.atan2(Math.sin(lambda1)/Ry,Math.cos(lambda1)/Rx);
  var tao2 = Math.atan2(Math.sin(lambda2)/Ry,Math.cos(lambda2)/Rx);
  var mytan = Math.tan((tao2-tao1)/2);
  var m = Math.sin(tao2-tao1)*((Math.sqrt(4+3*mytan*mytan)-1))/3;

  var P1x = Cx + Rx*Math.cos(tao1);
  var P1y = Cy + Ry*Math.sin(tao1);
  var P2x = Cx + Rx*Math.cos(tao2);
  var P2y = Cy + Ry*Math.sin(tao2);
  var Q1x = P1x + m*(-Rx*Math.sin(tao1));
  var Q1y = P1y + m*(+Ry*Math.cos(tao1));
  var Q2x = P2x - m*(-Rx*Math.sin(tao2));
  var Q2y = P2y - m*(+Ry*Math.cos(tao2));
  return [P1x,P1y,Q1x,Q1y,Q2x,Q2y,P2x,P2y];
};

module.exports = { ellipsetopath };