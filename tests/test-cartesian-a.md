
@ Diagram
  
  set refx 13
  set refy 5
  cartesian.a setup 0 0
  %cartesian.a xaxis -8 8
  %cartesian.a yaxis -4 4
  cartesian.a {fillcolor:pink} ellipse 0 0 5 3 
  cartesian.a dot -4 0 4 0
  cartesian.a dot -5 0 5 0
  cartesian.a line -5 0 5 0
  cartesian.a line 0 -3 0 3
  cartesian.a {label:Vertex;anchor:ulft} text -5 0
  cartesian.a {label:Vertex;anchor:urt} text +5 0
  cartesian.a {label:Major axis;anchor:bot} text -2 0
  cartesian.a {label:Minor axis;anchor:rt} text 0 2
  cartesian.a {label:Focus;anchor:top} text -4 0 4 0
  cartesian.a {label:Center;anchor:lrt} text 0 0 
  cartesian.a {label:Co-vertex; anchor:urt} text 0 3 
  cartesian.a {label:Co-vertex; anchor:lrt} text 0 -3 
  cartesian.a dot 0 3 0 -3 0 0
  
