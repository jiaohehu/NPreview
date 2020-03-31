Test cartesian

```diagram
viewport 25 10
unit 8
cartesian.a setup 12 5 2 2
cartesian.a xaxis -6 6 
cartesian.a yaxis -5 5 
cartesian.a xticks 1 2 3 4 5 
cartesian.a yticks 1 2 3 4 
cartesian.a curve  0.2 4.11 \
                   0.5 2.67 \
                   0.8 2.05 \
                   1   1.80 \
                   2   1.22 \
                   3   1.00 \
                   4   0.88 \
                   5   0.81   
cartesian.a plot   3   1
cartesian.a ellipse   0  0  30 2 1

```
