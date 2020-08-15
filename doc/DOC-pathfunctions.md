Path functions


Note that for a path function all its arguments must be either a path variable
or a number. Coordinate list is not valid. In the following examples all
letters a, b, c are path variables.

Path functions must start with an ampersand, followed immediately
by a letter, and optionally additional letters and/or digits.

- allpoints(a,b,c) - all points from a,b,and c,

    The "allpoints" function returns a new path with all the 
    points in existing path variables. This is equivalent
    to calling the "path" command with the followng.

    ```
    path newpath = &a &b &c
    ```

- lineintersect(a,b) - 'a' for the first line and 'b' for the second line

    The "lineintersect" returns a new point that it the intersection
    of two lines. The first line is described by the symbol 'a', which
    must have at least two points. The second line is described by the
    symbol 'b', which must have at least two points. Only the first
    two points of 'a' and 'b' are considered. The rest of the points
    of 'a' and 'b' are ignored. 
    
    ```
    path newpt = &lineintersect(a,b)
    ```

    Note that it is possible for the returned point to have either its
    X-coord or Y-coord to have numbers that is infinity or NaN,
    due to the nature of how parallel two lines are. Generally,
    only a single point is returned. In the following example the path
    variable 'c' will hold one point: (2,2)

    ```
    path a = (0,2) (4,2)
    path b = (2,0) (2,6)
    path c = &lineintersect(a,b)
    ```

- circlelineintersect(a,c,radius) - 'a' is a path variable describing the line, 'c' is a point describing the center of the circle, 'radius' is a scalar describing the radius of the circle.

    The "linecircleintersect" function returns new a path with two
    intersection points for the line and circle intersection. In the
    following diagram the pts variable 'pts' will hold two points:
    (6,2) and (4,2).

    ```
    path a = (2,2) (6,2)
    path c = (5,3)
    path pts = $linecircleintersect(a,c,1.4142)
    ```

- scatterpoints(x1,y1,x2,y2,numpts) - 'x1' and 'y1' describes the first end point, 'x2' and 'y2' describes the second end point, and 'numpts' describes how many points to generate in total, including the two end points.

   The "scatterpoints" function is to create new path with the
   number of points evenly distributed beteen the two end points. In
   the previous example there will be 10 points created in a path such
   that the first point is (1,0), and the last point is (10,0), and
   the rest of the points will be spaced evenly between the first and
   the last.

    ```
    path a = &scatterpoints(1,0,10,0,10)
    ```

- midpoint(a)
- midpoint(a,0.5)
- midpoint(a,0.75)
- midpoint(a,1.25)

    The "midpoint" function returns the mid point of the first two
    points in a path.

    ```
    path a = (1,1) (2,3)
    path b = &midpoint(a)
    ```

    Note that only the first two points of a path is used. The other
    points are ignored. Thus if path a has three points, then the
    third point is simply ignored.

    If two arguments are given, then the second point expresses where
    the mid points is relative to the first point, ie., an "0.5" 
    describes a mid point exactly in the middle, 
    and a "0.25" describes a mid point that is closer to the first
    point than the second, and is one-quarter of the total distance
    away from the first point.

    ```
    path a = (1,1) (2,3)
    path b = &midpoint(a,0.5)
    ```

    If the second argument is larger than "1" then the result
    is extrapolation. In the followng example the returned value
    is a point that is (2.5,2.5).

    ```
    path a = (1,1) (2,2)
    path b = &midpoint(a,1.5)
    ```

- shiftpoints(a,1,2) - 'a' is a path, 'dx' and 'dy' are scalars

    The "shiftpoints" function is always needed to be provided with
    three arguments. The first argument is always interpreted as a
    path variable. The second and the third arguments are to be
    interpreted as expressing length in grid unit. This function is to
    return a new path with exact the same number of points, except for
    that all the points will have been shifted by the number of grid
    units specified in the argument. For example, following would have
    shifted all the points in the original path one position to the
    left and two positions up.

    ```
    path b = $shiftpoints(a,-1,2)
    ```
- circlepoint(center,r,a1,a2,a3,...) - 'center' is a path variable, 'r', 'a1', 'a2', 'a3', are scalars

    This function returns a list of points on the circumference 
    of a circle, described by the 'center' and radius 'r', and
    by an argument that is 'a1', 'a2', 'a3', etc. Following 
    example returns a new path with four points each of which 
    is a circle on the circumference with angle 10, 20, 30 and
    40 degrees. The center of the circle is (0,0) and its radius
    is "3.5".

    ```
    path a = (0,0)
    path pts = &circlepoints(a,3.5,10,20,30,40)
    ```

