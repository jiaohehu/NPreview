Test drawline

This test drawline with Hobby curve.

``` diagram
viewport 32 30
set font-size 7pt

set stroke blue
set fill orange
drawline (0,0)..(2,2)..(4,0) -- (6,0)

reset 
set refx 5
set refy 5
set stroke-width 0
set stroke blue
set fill orange
drawline (0,0)..(2,2)..(4,0) -- (6,0)

reset 
set refx 10
set refy 10
drawline (0,0)..(2,2)..(4,0) -- (6,0)

reset 
set refx 15
set refy 15
set stroke-width 1
drawline (0,0)..(2,2)..(4,0) -- (6,0)

reset 
set refx 17
set refy 17
set stroke-width 2
drawline (0,0)..(2,2)..(4,0) -- (6,0)

reset 
set refx 19
set refy 19
set stroke-width 3
drawline (0,0)..(2,2)..(4,0) -- (6,0)

reset 
set refx 21
set refy 21
set stroke-width 4
drawline (0,0)..(2,2)..(4,0) -- (6,0)

reset 
set refx 23
set refy 23
set stroke-width 5
drawline (0,0)..(2,2)..(4,0) -- (6,0)

reset 
set refx 25
set refy 25
set stroke-width 6
drawline (0,0)..(2,2)..(4,0) -- (6,0)

```
