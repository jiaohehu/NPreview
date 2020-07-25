Polynomials

@ Diagram 
  
  viewport 24 12
  def P(x) = pow(0.7,x) * 0.3
  barchart.setup 2 2 20 8 9 0.3
  barchart.bbox
  barchart.vbar {fillcolor:pink}  0.3 0.21 0.147 0.1029 (P(4)) \
                                  (P(5)) \
                                  (P(6)) \
                                  (P(7)) \
                                  (P(8))
  barchart.ytick 0 0.1 0.2 0.3
  barchart.xtext "P(0)" 0.5
  barchart.xtext "P(1)" 1.5  
  barchart.xtext "P(2)" 2.5  
  barchart.xtext "P(3)" 3.5  
  barchart.xtext "P(4)" 4.5  
  barchart.xtext "P(5)" 5.5  
  barchart.xtext "P(6)" 6.5  
  barchart.xtext "P(7)" 7.5  
  barchart.xtext `P_8` 8.5  
