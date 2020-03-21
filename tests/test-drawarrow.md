Test drawline

This test drawline with Hobby curve.

``` diagram
viewport 32 30
set fontsize 7pt

reset 
set refx 5
set refy 5
drawarrow (0,0) -- (6,3)

reset 
set refx 10
set refy 10
drawrevarrow (0,0) -- (6,3)

reset 
set refx 15
set refy 15
drawdblarrow (0,0) -- (6,3)

```
