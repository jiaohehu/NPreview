Test drawarc

Test drawarc

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
drawarc (6,0) (6,8)

reset
set refx 10
set refy 3
set x-radius 6
set y-radius 4
set bigarcflag 1
set sweepflag 0
set rotation 45
drawarc (6,0) (6,8)

reset
set refx 4
set refy 15
set x-radius 6
set y-radius 4
set bigarcflag 0
set sweepflag 1
set rotation 45
drawarc (6,0) (6,8)

reset
set refx 10
set refy 15
set x-radius 6
set y-radius 4
set bigarcflag 0
set sweepflag 0
set rotation 45
drawarc (6,0) (6,8)


```
