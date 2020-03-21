Test drawarc

This is test the [a:*] operation of drawline.

``` diagram
viewport 32 30

reset
set refx 4
set refy 3
set x-radius 6
set y-radius 4
set bigarcflag 1
set sweepflag 1
set rotation 45
drawline (6,-3) (6,0) [a:6,4,45,1,1,0,8] [v:2]

reset
set refx 10
set refy 3
set x-radius 6
set y-radius 4
set bigarcflag 1
set sweepflag 0
set rotation 45
drawline (6,-3) (6,0) [a:6,4,45,1,0,0,8] [v:2]

reset
set refx 4
set refy 15
set x-radius 6
set y-radius 4
set bigarcflag 0
set sweepflag 1
set rotation 45
drawline (6,-3) (6,0) [a:6,4,45,0,1,0,8] [v:2]

reset
set refx 10
set refy 15
set x-radius 6
set y-radius 4
set bigarcflag 0
set sweepflag 0
set rotation 45
drawline (6,-3) (6,0) [a:6,4,45,0,0,0,8] [v:2]


```
