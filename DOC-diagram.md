# Supporting Diagram


```diagram
drawtriangle (1,1) (5,5) (5,1.5)
labelctr (6,6) A
labelright  (5,5) ``C_0``
labelright  (5,1.5) ``B_0``
labelleft  (1,1) ``A_0``
drawdot (0,0) (1,1) \
        (2,2) (3,3) \
        (4,4) (5,5) 
drawarrow (10,5) (12,6)
drawdblarrow (10,2) (12,3)
drawline (14,2) (15,3) (14,4) (15,5)
drawfullcircle (20,8) (21,8)
drawupperhalfcircle (20,6) (21,6)
drawlowerhalfcircle (20,4) (21,4)
fontsize 14pt
drawtext (10,1) 簡単 Triangle
```

# drawanglearc

This command allows you to draw a small arc describing the span of an angle.
It expects three coords: the vertex of the angle, one point on the first ray,
and one on the second ray. 

    drawanglearc (0,0) (5,0) (5,5) 

This will draw an arc that shows a 45-degree angle spanning from 0 to 45 degree
where the vertex of the angle is at (0,0).

Note that the radius of the arc is always set at 0.5 grid unit. 


