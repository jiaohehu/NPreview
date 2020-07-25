test.md


Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
minim veniam, quis nostrud exercitation ullamco laboris nisi ut
aliquip ex ea commodo consequat. Duis aute irure dolor in
reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
culpa qui officia deserunt mollit anim id est laborum.

@ Diagram    

  viewport 32 20

  % variables
  path a = (1,1) -- (5,5) -- (5,1) -- (1,1) cycle
  path b = (1,1) .. (5,5) .. (5,1) .. (1,1) cycle

  % line
  draw *a
  draw *b

  % circles

  circle.pie  {r:1;a1:0;a2:180} (16,3)
  circle.pie  {r:1;a1:180;a2:0} (16,5)
  circle.pie  {r:1;a1:-90;a2:90} (16,7)
  circle.pie  {r:1;a1:90;a2:-90} (16,9)
  circle.pie  {r:1;a1:0;a2:100} (20,1)
  circle.pie  {r:1;a1:100;a2:0} (20,3)
  circle      {r:1}                  (20,5)
  circle      {r:2}                  (20,8)
  circle.pie  {r:1;a1:0;a2:90}  (16,1)
  circle.pie  {r:1;a1:90;a2:180}  (16,1)
  circle.pie  {r:1;a1:180;a2:270}  (16,1)
  circle.pie  {r:1;a1:270;a2:0}  (16,1)

  % dot
  path sq = (22,3) (23,3) (23,2) (22,2)
  dot (22,1)
  dot $somepoints(sq,0) $somepoints(sq,1) $somepoints(sq,2) $somepoints(sq,3) (22,4) (23,4)

  % tick
  dot.vbar (23,1)
  dot.vbar (24,1)
  dot.hbar (25,1)
  dot.hbar (26,1)

  % 90-degree angle
  draw (28,4)--(31,4)
  path [a,b] = *
  draw (28,4)--(28,7)
  path [,c] = *
  drawanglearc.sq *b *a *c

  % 45-degree angle
  draw <0,-4> (28,4)--(31,4)
  path [a,b] = *
  draw <0,-4> (28,4)--(31,7)
  path [,c] = *
  drawanglearc *b *a *c

  % line will fill      
  path ff = (28,8)--(31,8)--(31,9)--(28,9)--cycle
  draw {linesize:2; fillcolor:orange} *ff
  reset

  % label
  label.rt   `C_0`  (5,5)
  label.rt   `B_0`  (5,1)
  label.top  `A_0`  (1,1)

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
  label.ctr " 簡単 Triangle " (10,1)

  % shape
  shape.brick (7,7) [h:1] [h:1]
  shape.brick (7,8) [h:1] [h:1]

  % trapezoid
  shape.trapezoid (2,11)

  % rhombus
  shape.rhombus (5,11)

  % rect
  shape.rect (8,11)

  % parallelgram
  shape.parallelgram (11,11)

  % apple
  shape.apple (15,11)

  % basket
  shape.basket (17,11)

  % crate
  shape.crate (21,11)

  % rrect
  shape.rrect (26,11)

  % protractor
  shape.protractor (10,15)

  % updnprotractor
  shape.updnprotractor (10,15)

  % radical
  shape.radical (1,17)

  % math
  label.ctr  ``\sqrt{2}``  (18,18)

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
minim veniam, quis nostrud exercitation ullamco laboris nisi ut
aliquip ex ea commodo consequat. Duis aute irure dolor in
reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
culpa qui officia deserunt mollit anim id est laborum.
