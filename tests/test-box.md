

@ Diagram

	config height 14

  % The second pyramid
  config boxwidth 2
  config boxheight 2

  set refx 6
  set refy /4
  box "1" {} (0,0)
  box "1" <-1,-2> (0,0) (2,0)
  path [a,b] = <-1,-2> (0,0) (2,0)
  box "1" <-2,-4> (0,0) 
  box "2" <-2,-4> (2,0) 
  box "1" <-2,-4> (4,0)
  path [,c,] = <-2,-4> (0,0) (2,0) (4,0)
  box "1" <-3,-6> (0,0) 
  box "3" <-3,-6> (2,0) 
  box "3" <-3,-6> (4,0) 
  box "1" <-3,-6> (6,0)

  box "1" <-4,-8> (0,0) 
  box "4" <-4,-8> (2,0) 
  box "6" <-4,-8> (4,0) 
  box "4" <-4,-8> (6,0) 
  box "1" <-4,-8> (8,0)

  box "1" {fillcolor:lightgray} &a &b
  box "2" {fillcolor:lightgray} &c
  drawarrow <1,1> <-0.5,0> &a &c
  drawarrow <1,1> <+0.5,0> &b &c

