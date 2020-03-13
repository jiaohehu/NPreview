Test line circle intersect

Test line circle intersect

```diagram
viewport 32 30
set font-size 7pt

a := (2,2) (6,2)
c := (5,3)
pts := $linecircleintersect(a,c,1.4142)

drawline *a
dot *c
set radius 1.4142
circle *c
drawline *pts
dot *pts

set refx 10
set refy 10
a := (0,2) (4,2)
b := (2,0) (2,6)
c := $lineintersect(a,b)

drawline *a
drawline *b
dot *c
```
