test.md


@ ```diagram
  viewport 32 20

  % variables
  a := (1,1) -- (5,5) -- (5,1) -- (1,1) ()
  b := (1,1) .. (5,5) .. (5,1) .. (1,1) ()

  % drawline
  drawline *a
  drawline *b

  % circles

  set fillcolor pink
  circle    {1} (16,1)
  halfcircle.top {1} (16,3)
  halfcircle.bot {1} (16,5)
  halfcircle.rt  {1} (16,7)
  halfcircle.lft {1} (16,9)
  quadrant.q1  {1} (18,1)
  quadrant.q2  {1} (18,1)
  quadrant.q3  {1} (18,1)
  quadrant.q4  {1} (18,1)
  octant.o1  {1} (18,3)
  octant.o2  {1} (18,3)
  octant.o3  {1} (18,3)
  octant.o4  {1} (18,3)
  octant.o5  {1} (18,3)
  octant.o6  {1} (18,3)
  octant.o7  {1} (18,3)
  octant.o8  {1} (18,3)
  circle.chord {1,0,135} (20,1)
  circle.arc   {1,0,135} (20,3)
  circle.cseg  {1,0,135} (20,5)

  % dot
  sq := (22,3) (23,3) (23,2) (22,2)
  dot (22,1)
  dot $somepoints(sq,0) $somepoints(sq,1) $somepoints(sq,2) $somepoints(sq,3) (22,4) (23,4)

  % tick
  tick.top (23,1)
  tick.bot (24,1)
  tick.rt  (25,1)
  tick.lft (26,1)

  % 90-degree angle
  drawline (28,4)--(31,4)
  a/b := *
  drawline (28,4)--(28,7)
  /c := *
  drawanglearc.sq *a *b *c

  % 45-degree angle
  drawline <0,-4> (28,4)--(31,4)
  a/b := *
  drawline <0,-4> (28,4)--(31,7)
  /c := *
  drawanglearc *a *b *c

  % drawline will fill      
  ff := (28,8)--(31,8)--(31,9)--(28,9)--cycle
  set linesize 2px
  set fillcolor orange
  drawline *ff
  reset

  % label
  label.rt  {``C_0``} (5,5)
  label.rt  {``B_0``} (5,1)
  label.top {``A_0``} (1,1)

  % dots
  dot (1,1) \
          (2,2) (3,3) \
          (4,4) (5,5)

  % ticks
  tick.top (2,1) (3,1) (4,1)
  tick.bot (2,1) (3,1) (4,1)
  tick.rt  (5,2) (5,3) (5,4)
  tick.lft (5,2) (5,3) (5,4)

  % arrow & dblarrow
  drawarrow (7,3) (9,5)
  drawdblarrow (9,3) (11,5)
  drawrevarrow (11,3) (13,5)

  % text of a different fontsize
  set fontsize 14pt
  label.ctr { 簡単 Triangle } (10,1)

  % shape
  brick (7,7) [h:1] [h:1]
  brick (7,8) [h:1] [h:1]

  % trapezoid
  trapezoid (2,11)

  % rhombus
  rhombus (5,11)

  % rect
  rect (8,11)

  % parallelgram
  parallelgram (11,11)

  % apple
  apple (15,11)

  % basket
  basket (17,11)

  % crate
  crate (21,11)

  % rrect
  rrect (26,11)

  % protractor
  protractor (10,15)

  % updnprotractor
  updnprotractor (10,15)

  % radical
  radical (1,17)
  ```

