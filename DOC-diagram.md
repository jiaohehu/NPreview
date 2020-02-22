# Supporting Diagram


```diagram
drawline (1,1) -- (5,5) -- (5,1) -- ()
label.top {A}       (6,6) 
label.rt  {``C_0``} (5,5) 
label.rt  {``B_0``} (5,1.5) 
label.lft {``A_0``} (1,1) 
drawdot (0,0) (1,1) \
        (2,2) (3,3) \
        (4,4) (5,5) 
set arrow arrow
drawline (10,5) (12,6)
set arrow dblarrow
drawline (10,2) (12,3)
set arrow
drawline (14,2) (15,3) (14,4) (15,5)
set diameter 2
drawfullcircle (20,8) 
drawupperhalfcircle (20,6) 
drawlowerhalfcircle (20,4) 
set fontsize 14pt
label { 簡単 Triangle } (10,1) 
set curve up
drawline (1,1) (2,2) (3,4) ()
```

## The unit length and grid lines

In Diagram, the length is always specified in the unit length. A unit length is
described as an abstract length on a graphing paper for which a length of 1
corresponds to the width of a single grid.

The 'width' and 'height' option specifies how many total unit length it has 
reserved for the width and height. These two parameters also determines the
total size of the graph that will appear in the PDF file. When translating
to MetaPost, each unit length is abstracted using a variable named 'u' that
is preset to be of '4mm'. You can also change it by setting the 'unit' 
option such as the following:

    set unit 6mm

A grid line is always shown as part of the diagram. The total number of
horizontal grids depends on the 'width' option.  The total number of vertical
grids depends on the 'height' option. The color of the grid is set to be 10
percent of the white.  Currently there is no provision to turn off the showing
of the grid or to change the color of the grid line.


## Instructions

Each instruction must start its own line. If a line is too long to fit side
a single source paragraph then a ending backslash is to be placed.
Blank lines are optional and will be ignored.

Also, if a percent sign (`%`) is detected as the first character of the line
then the entire line is considered a comment and will be ignored.

The first word of each instruction is considered the command that tells
what actions to take.  Following is a list of all commands:

  + set    

    Set or clear a command option.

  + save    

    Save the last path to one or more variables.

  + (var) := (path-expression)

    Create or modify a path variable.
        
  + label
  + label.rt
  + label.lft
  + label.top
  + label.bot
  + label.urt
  + label.ulft
  + label.lrt
  + label.llft

    Draw a text label at each path point.
    
  + shape   

    Draw a shape at each path point.

  + circle - draw/fill the full circle area
  + circle.ht - draw/fill the half circle area at the top
  + circle.hb - draw/fill the half circle area at the bottom
  + circle.hr - draw/fill the half circle area on the right hand side
  + circle.hl - draw/fill the half circle area on the left hand side
  + circle.q1 - draw/fill the 1st quadrant area
  + circle.q2 - draw/fill the 2nd quadrant area
  + circle.q3 - draw/fill the 3rd quadrant area
  + circle.q4 - draw/fill the 4th quadrant area
  + circle.o1 - draw/fill the 1st octant area
  + circle.o2 - draw/fill the 2nd octant area
  + circle.o3 - draw/fill the 3rd octant area
  + circle.o4 - draw/fill the 4th octant area
  + circle.o5 - draw/fill the 5th octant area
  + circle.o6 - draw/fill the 6th octant area
  + circle.o7 - draw/fill the 7th octant area
  + circle.o8 - draw/fill the 8th octant area
  + circle.chord - draw/only a chord line
  + circle.arc - draw/only an arc line
  + circle.cseg - draw/fill a circular segment area

    These are circle related operations. Note that for an area the path
    will be a closed path, thus suitable for filling. Each of these
    operations will also generate a path which can be retrieved and
    saved using the `save` command.

  + angle - draw an angle for each path point
  + angle.marker  - draw an angle marker 
  + angle.rmarker - draw an angle marker that is for the right angle

    Note that for drawing an angle additional information is needed besides
    the vertex location: start angle in degrees (ang1), stop angle in
    degrees (ang2), length of the first side in grid units (side1), and
    length of the second side in grid units (side2).  An angle is to be
    drawn at each path point with the start/ending angle and the length
    of the sides specified.

    The `angle.marker` command draw a marker that is identifies an angle,
    in the interior of an angle between the first and second side. The 
    arc is draw close to the vertex with a radius of 1/2 of the grid unit.
    When the angle is less than 60-deg its radius started to increase
    graduately and eventually tappered off at the radius of 2+1/2.
    
    The `angle.rmarker` draws the marker in the shape of a square. It
    should only be used for a known right angle.

  + rect - draw/fill a rectangle area
  + rect.parallelgram - draw/fill a parallelgram area

    The `rect` command would draw/fill a rectangle area. The width of the
    area is provided by (rectw). The height of the rectangle is (recth). 

    The `rect.parallelgram` will draw/fill a parallelgram. The overall
    width and height of the parallelgram is set in accordance with the
    (rectw) and (recth) options.  This means that the distance between its
    lower-left and upper-right hand corner is always equal to (rectw), and
    the height difference of them is always equal to (recth).  However,
    some part of the rect area will be sliced off to make the shape of a
    parallelgram.  The amount of area is determined by the (slant) option.
    If it is set to "0.3" which is default, 30 percent at top will be
    removed starting at the left hand side, and 30 percent of the bottom
    will be removed starting at the right hand side.
    
  + dot - draw a dot at each path point 
  + dot.tvbar - draw a vertical bar above the point.
  + dot.bvbar - draw a vertical bar below the point
  + dot.rhbar - draw a horizontal bar to the right hand side of the point
  + dot.lhbar - draw a horizontal bar to the left hand side of the point

    These commands are used to make a particular point, for example to show
    a point in a plane. The `dot` command will draw a circular dot. The
    default size of the dot is '4pt', but can be changed by the (dotsize) 
    option, for example to set to a string of '5pt'. 

    The color of the dot is set to black, unless changed by the (dotcolor)
    option, which is used to specify a color following in MetaPost syntax:
    "0.5[red,white]" , etc.

    The other variants can be used to draw ticker markers for an X-axis or
    Y-axis line, allowing for the tick marks to be either drawn above the
    X-axis or below, or left/right of a Y-axis.

  + drawrect
  + drawparallelgram
  + drawfullcircle
  + drawupperhalfcircle
  + drawlowerhalfcircle
  + drawlefthalfcircle
  + drawrighthalfcircle
  + drawquadrantonecircle
  + drawquadranttwocircle
  + drawquadrantthreecircle
  + drawquadrantfourcircle
  + drawcirclechord
  + drawanglearc
  + drawrightanglearc
  + drawdot
  + drawline
  + drawvdot
  + drawlvdot
  + drawuvdot
  + drawhdot

    These are old command syntax that are being phased out and be replaced
    by the counterparts.


## Path expression

The syntax for creating a new variable is shown as follows.  For example,
we can assign a new path consisting of two points (0,0) to (1,1) to a
variable named 'a' as follows.

    a := (0,0) (1,1)

What follows the `:=` is the path expression.  A path expression can
contain literal coordinates, path variables, path functions, and
combinations of all of them.

    a := (0,0) b (1,1) c (2,2) $somepoints(d,3,5)

In the previous example a new path variable is to be created and assigned a
new path containing a new set of path points. The first point will be
(0,0). Its second point will be copied path variable b, assuming b is not
empty. If b is empty, then no points are copied, and the second point of a
becomes (1,1).

The $somepoints(d,3,5) syntax expresses a path function. A path function
will take as its parameters either path variables or numbers (no literal
coordinates), and will return a new path. Thus, the points taken after
(2,2) are going to be whatever returned by the $somepoints() function.


## Drawing text Labels

Drawing text labels are done by using the `label` command.
For example, the following `label` command will each draw a label
at the given location.

    label.rt {A} (1,1)
    label.lft {B} (2,2)
    label.top {C} (3,4)

The default `label` command will position the text so that it is centered
at the path point. Other variants of the `label` command is to allow the 
text to be positioned around the location of the point.

    label.top   -  top
    label.bot   -  bottom
    label.lft   -  left    
    label.rt    -  right   
    label.ulft  -  upper left
    label.llft  -  lower left
    label.urt   -  upper right
    label.lrt   -  lower right

All `label` commands are designed to draw the same label at multiple
locations. For example, we can draw the same letter A three times
each at three different locations such as follows.

    label {A} (1,1) (2,2) (3,4) 

We can also ask a differet label to be drawn at a different 
location by writing the text label like the following:

    label {A\\B\\C} (1,1) (2,2) (3,4) 

This will draw the label "A", "B", and "C" respectly each at a different
location that is (1,1), (2,2), and (3,4). Note that all the labels will be
centered at the location because the command is `label`.


# The set command

The `set` command is used to modify the command option so that
it can be changed to a new value. 

    set rectw  29
    set recth  12

The first word after the word set is recognized as the name of the option.
All texts after the option name is considered the value of the option. 
To restore the option to its default value call the `set` command 
with a option name but do not provide an actual value.

    set rectw
    set recth



## Command options

Following is a list of configuration parameters.

``` tabularx
|----------------|-----------------------------------------------------|
|Command option  |Description                                          |
|----------------|-----------------------------------------------------|
|width           |Specifies the total number of grids in the width.    |
|                |Minimum is 10 and maximum is 100.                    |
|                |Default is 25.                                       |
|----------------|-----------------------------------------------------|
|height          |Specifies the total number of grids in the height.   |
|                |Minimum is 4  and maximum is 100.                    |
|                |Default is 10.                                       |
|----------------|-----------------------------------------------------|
|unit            |Specifies the length for each grid unit.             |
|                |Default is '4mm'.                                    |
|                |                                                     |
|----------------|-----------------------------------------------------|
|refx            |Set an offset number to offset coordinate in x-axis. |
|                |Ex. if refx is set to 4 a source coordinate of       | 
|                |(2,0) will map to (6,0).                             | 
|                |Must be set to a number zero or greater, and no more |
|                |than the total number of grids in the horizontal.    | 
|----------------|-----------------------------------------------------|
|refy            |Same as refx bug does it for its y-coordinate.       |
|                |Must be set to a number zero or greater, and no more |
|                |than the total number of grids in the vertical.      | 
|                |                                                     |
|                |                                                     | 
|----------------|-----------------------------------------------------|
|refsx           |Set a scalar number to scale coordinate in x-axis.   |
|                |Ex. if refx is set to 6 and refsx      is set to 3,  |
|                |For a coord that is specified as (2,0),              | 
|                |it is first scaled three times which puts it at (6,0)| 
|                |before being shifted 6 grids to the right which puts | 
|                |it at (12,0), which is its final displayed position. | 
|                |Must be set to a number between 0.1 and 10.          | 
|----------------|-----------------------------------------------------|
|refsy           |Same as refsx      but does it in y-axis.            |
|                |                                                     |
|                |                                                     | 
|----------------|-----------------------------------------------------|
|fontsize        |Set to a font size specification such as '14pt'      |
|                |to be used for 'drawlabel' command.                   |
|                |                                                     | 
|----------------|-----------------------------------------------------|
|slant           |Set to a floating point number between 0.1 and 0.9   |
|                |expressing the proportion of the overall parallelgram|
|                |width reserved for the slanted part of the shape.    | 
|                |Default is 0.3.                                      | 
|----------------|-----------------------------------------------------|
|anglearcradius  |Set to a number between 0.1 to 1 to specify the      |
|                |radius of the arc for the 'drawanglearc' command.    |
|                |Default is 0.5.                                      |
|----------------|-----------------------------------------------------|
|text            |Set to a string that is       the text label for     |
|                |display with the label command and its variants.     |
|                |It is also used by the drawlabel command.             |
|----------------|-----------------------------------------------------|
|align           |Set the alignment for the text to be drawn.          |
|                |It is used by the drawlabel command.                  |
|                |                                                     |
|----------------|-----------------------------------------------------|
|linecolor       |Set the color used when drawing lines, such as "red".|
|                |It is used by the drawline command.                  |
|                |                                                     |
|----------------|-----------------------------------------------------|
|linewidth       |Set the width of the line when drawing lines,        |
|                |such as "4pt".                                       |
|                |It is used by the drawline command.                  |
|----------------|-----------------------------------------------------|
|dotcolor        |Set the color used for drawing dots, such as "red".  |
|                |It is used by the drawdot command.                   |
|                |                                                     |
|----------------|-----------------------------------------------------|
|dotsize         |Configure the size of the dot to be drawn, such as   |
|                |"8pt". Used by the drawdot command.                  |
|                |                                                     |
|----------------|-----------------------------------------------------|
|curve           |To be set when drawing a curve.                      |
|                |(To be deprecated so that a more rebust way of       |
|                |specifying curves and lines can be devised)          |
|----------------|-----------------------------------------------------|
|arrow           |Set to one of the predefined strings for expressing  |
|                |that an end arrow or double arrow should be drawn    |
|                |either at the end of the path or both.               |
|                |The valid values are: "arrow" and "dblarrow"         |
|----------------|-----------------------------------------------------|
|rectw           |Set to a number that is the width of the rectangle.  |
|                |This is to be used with the drawrect command.        |
|                |                                                     |
|----------------|-----------------------------------------------------|
|recth           |Set to a number that is the height of the rectangle. |
|                |This is to be used with the drawrect command.        |
|                |                                                     |
|----------------|-----------------------------------------------------|
|diameter        |Set to a number that is the diameter of the circle.  |
|                |This is to be used with the drawfullcircle, and      |
|                |variants of draw*halfcircle, and                     |
|                |variants of drawquadrant*dircle commands.            |
|----------------|-----------------------------------------------------|
|angle1          |Set to a number that expresses the angle in degrees. |
|                |This is used by the drawcirclechord method, which    |
|                |draws a chord from two points on a circle. The       |
|                |first point measures angle1 degrees, and the second  |
|                |point measures angle2 degrees.                       |
|----------------|-----------------------------------------------------|
|angle2          |Set to a number that expresses the angle in degrees. |
|                |This is used by the drawcirclechord method.          |
|                |                                                     |
|----------------|-----------------------------------------------------|
``` 


## Path manipulation functions        

Note that all path manipulation functions will either take a path expressio
variable, integers, or a floating point number. It can not be passed
an path expression literal. 

In the following description, letter 'a', 'b', 'c' are used to express
an existing path variable.

  + midpoint(a)     
  + midpoint(a,0.2)     

    This function returns the mid point of the first two points in a path 
    expression if a single argument is given. 

    ```
    a := (1,1) (2,3) (3,4)
    b := $midpoint(a)
    ```

    This will return a path with a single point: (1.5,2)
    
    If two arguments are given, it does a linear interpolation alone the 
    line segment of the first two points, and return a point that corresponds
    to the percentage of the path traveled from the first point to the second.
    The second argument is an floating point number between 0-1.
    For example, if 0.5 is given as the second parameters, it should return the
    same path as that with a single argument. Thus, following example will return
    the same result as the one before.

    ```
    a := (1,1) (2,3) (3,4)
    b := $midpoint(a,0.5)
    ```

    Following will return the a point that is one-third the way from the first
    point to the second point.

    ```
    a := (1,1) (2,3) (3,4)
    b := $midpoint(a,0.333333)
    ```

  + somepoints(a,2)
  + somepoints(a,2,2)
  + somepoints(a,2,5)
  + somepoints(a,5,2)
    
    This function can be called with 2 arguments or 3. If called with 2, it is
    to return a new path containing a single point at the index location
    of its original path. The first argument is always a path variable. The
    second argument is always interpreted as an integer.

    If called with three arguments, the last argument is also to be treated as 
    an integers. The returned path is to contain all points between the 
    index locations specified by the last two arguments. The order
    of the points will be so arranged so that the index location of the first
    integer is to appear first, followed by a point moving towards the 
    second index location. Thus, this function can be used to return an inverse
    order of the points of the original path.

  + allpoints(a)    
  + allpoints(a,b)    
  + allpoints(a,b,c)    
  + allpoints(a,b,c,...)    
    
    This function can be called with 0 arguments to infinitely numbered.
    It is to return a new path with all the point in the variable.

  + shiftpoints(a,-1,2)
   
    This function is always needed to be provided with three arguments. The
    first argument is always interpreted as a path variable. The second
    and the third arguments are to be interpreted as expressing length
    in grid unit. This function is to return a new path with exact the same
    number of points, except for that all the points will have been shifted
    by the number of grid units specified in the argument. For example,
    following would have shifted all the points in the original path 
    one position to the left and two positions up.

    ```
    b := shiftpoints(a,-1,2)
    ````

  + scatterpoints(1,0,10,0,10)

    This function is to create new path with the number of points evenly distributed
    beteen the two end points. In the previous example there will be 10 points created
    in a path such that the first point is (1,0), and the last point is (10,0), 
    and the rest of the points will be spaced evenly between the first and the last.

  + rectpoints(0,2,4,3)  
    
    Returns new a path that describes the rectangle with its lower left at (0,2)
    and with a width of 4 and a height of 3; the path is closed with the last
    point a null point. In this case, the return point is equivalent to the following.

    ```
    a := (0,2) (4,2) (4,5) (0,5) ()
    ```


## Built-in path variables

Following are built-in path variables that can be used.

  + all 

    This path variable is automatically assigned to the path used by the
    last command.


## The shape command

This command is designed to draw a shape at each one of the path points.

Note that each shape can only be draw at its natural size and shape. There
is no provision to scale it. 

The origin of the shape is determined by each shape itself.  For example,
for 'brick' shape the origin is at its lower-left hand corner.  For
'radical4' it is at the top-left hand corner.  For 'protractor7' it is the
mid point between the lower-left and lower-right points. When asked to draw
a shape the orgin of the shape is to be aligned with the path point.

As of writing, following shape exists:

``` tabularx
|--------------|------------------------------------------------------------|
|Shape         |Description                                                 |
|              |                                                            |
|--------------|------------------------------------------------------------|
|brick         |This is a rectangle with a width of 1 and a height of 0.5;  |
|              |It is origin is at the lower-left hand corner.              |
|              |                                                            |
|--------------|------------------------------------------------------------|
|radical4      |This is a radical sign. The length of the top bar is 4 and  |
|              |the height of the left vertical bar is 2.                   |
|              |The origin is at the top-left hand corner.                  |
|--------------|------------------------------------------------------------|
|protractor7   |This draws a protractor that is 7 grid units in diameter,   |
|              |and the entire protractor is an upper half circle.          |
|              |The center of the shape is at the center of the bottom      |
|              |where the small hold is for aligning with the angle vertex. |
|--------------|------------------------------------------------------------|
```


