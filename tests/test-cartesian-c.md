

@ Diagram

  viewport 25 11
  unit 6

  set refx 1
  set refy 1
  def P(x) = (2*x+7)/(4*x+1)
  cartesian.setup 2 3 0.75 0.75
  cartesian.xaxis -0.75 5.6
  cartesian.yaxis -0.75 4.5
  cartesian.xtick 1 2 3 4 5
  cartesian.ytick 1 2 3 4
  cartesian.yplot {f:P} 0.5 5 12
  cartesian.arc 0 0 1 0 45

  reset
  label.urt "``f(x)=\frac{2x+7}{4x+1}``" (4,1)

