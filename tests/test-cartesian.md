

@ Diagram 
  
  viewport 24 12

  def P(x) = exp(x)
  set refx 12
  set refy 6
  cartesian.setup 0 0 
  cartesian.xaxis -6 +6
  cartesian.yaxis -6 +6
  cartesian.arrow 0 0 1 1
  cartesian.xplot {f:P} [-1:0.25:1]
