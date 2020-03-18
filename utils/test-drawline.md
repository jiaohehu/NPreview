Test drawline

This test drawline with Hobby curve.

``` diagram
viewport 32 30
set fontsize 7pt

set stroke blue
set fill orange
drawline (0,0)..(2,2)..(4,0) -- (6,0)

reset 
set refx 5
set refy 5
set linesize 0
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
set linesize 1
drawline (0,0)..(2,2)..(4,0) -- (6,0)

reset 
set refx 17
set refy 17
set linesize 2
drawline (0,0)..(2,2)..(4,0) -- (6,0)

reset 
set refx 19
set refy 19
set linesize 3
drawline (0,0)..(2,2)..(4,0) -- (6,0)

reset 
set refx 21
set refy 21
set linesize 4
drawline (0,0)..(2,2)..(4,0) -- (6,0)

reset 
set refx 23
set refy 23
set linesize 5
drawline (0,0)..(2,2)..(4,0) -- (6,0)

reset 
set refx 25
set refy 25
set linesize 6
drawline (0,0)..(2,2)..(4,0) -- (6,0)

```
