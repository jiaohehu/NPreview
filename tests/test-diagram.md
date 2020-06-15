test.md

%!LATEX.bodyfontsizept=10
%!LATEX.diagfontsizept=12
%!CONTEX.bodyfontsizept=10
%!CONTEX.diagfontsizept=12
%!HTML.bodyfontsizept=10
%!HTML.diagfontsizept=12

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
minim veniam, quis nostrud exercitation ullamco laboris nisi ut
aliquip ex ea commodo consequat. Duis aute irure dolor in
reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
culpa qui officia deserunt mollit anim id est laborum.

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
  circle.fill {r:1;start:0;stop:180} (16,3)
  circle.fill {r:1;start:180;stop:0} (16,5)
  circle.fill {r:1;start:-90;stop:90} (16,7)
  circle.fill {r:1;start:90;stop:-90} (16,9)
  circle.fill {r:1;start:0;stop:100} (20,1)
  circle.fill {r:1;start:100;stop:0} (20,3)
  circle.fill {r:1}                  (20,5)
  circle.fill {r:2}                  (20,8)
  circle.fill {r:1;start:0;stop:90}  (16,1)
  circle.fill {r:1;start:90;stop:180}  (16,1)
  circle.fill {r:1;start:180;stop:270}  (16,1)
  circle.fill {r:1;start:270;stop:0}  (16,1)

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
  arrow (7,3) (9,5)
  dblarrow (9,3) (11,5)
  revarrow (11,3) (13,5)

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

  % math
  label.ctr { ``\sqrt{2}`` } (18,18)
  ```

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad
minim veniam, quis nostrud exercitation ullamco laboris nisi ut
aliquip ex ea commodo consequat. Duis aute irure dolor in
reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
culpa qui officia deserunt mollit anim id est laborum.
