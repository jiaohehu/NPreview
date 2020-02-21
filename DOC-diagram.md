# Supporting Diagram


```diagram
drawline (1,1) (5,5) (5,1) ()
set label A
labeltop (6,6) 
set label ``C_0``
labelrt  (5,5) 
set label ``B_0``
labelrt  (5,1.5) 
set label ``A_0``
labellft  (1,1) 
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
set label  簡単 Triangle
label (10,1) 
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

    set    
    save    

    <var> := <path-expression>

    label
    labelrt
    labellft
    labeltop
    labelbot
    labelurt
    labelulft
    labellrt
    labelllft
    
    drawrect
    drawparallelgram
    drawfullcircle
    drawupperhalfcircle
    drawlowerhalfcircle
    drawlefthalfcircle
    drawrighthalfcircle
    drawquadrantonecircle
    drawquadranttwocircle
    drawquadrantthreecircle
    drawquadrantfourcircle
    drawcirclechord
    drawanglearc
    drawdot
    drawline
    drawvdot
    drawlvdot
    drawuvdot
    drawhdot
    drawshape
    drawlabel

The commands can be classified into three groups. The first group consists of
two commands: `set` and `save`. The `set` command is used to set all
configuration parameters. Configuration parameters are set of key-value pairs
that are used by various commands when it runs. The most famous one is the
'label' property, which is used by the `drawlabel` command as well as the
`label` command and its variants.  Other properties, such as 'diameter', is
used by many commands including the `drawfullcircle`, `drawupperhalfcircle`,
`drawlowerhalfcircle`, and others. There are also 'fillcolor' and 'color'
properties, that supplies a different fill color of line color if they are set.

Look at the section titled "Configuration parameters" for detail.

The `save` command saves the last path expression to a list of user
supplied variables so that these variables can be used directly.
Note that variables are only designed to hold path expressions and
nothing else.

The second group is the "assignment" statement, in which a new variable
is assigned a particular path expression. This kind of command 
always takes the form as follows.

    <variable> := <path-expression>

For example, we can assign a new path consisting of two points (0,0)
to (1,1) to a variable named 'a' as follows.

    a := (0,0) (1,1)

The path expression can come in many syntax other than the one shown, in which
case a number of coordinates are written literally.  Diagram also provide path
manipulation functions to extra, add, or create new paths.  For example, the
`$somepoints()` function would extra part of an existing path and return a new
path. For example, the following example we will create a new variable named
'b' that would hold the points of an existing path that was assigned to 'a'.

    b := $somepoints(a,5,10)
 
The path manipulation function always starts with a dollar sign.
The path manipulation function `$shiftpoints()` would take an existing
path, and return a new path such that all the points of the original
path are shifted in a given x-direction or y-direction.
In the following example the path points in 'a' is returned and assigned to
'b' after all the points have been shifted one unit position to the right 
and one unit position down.

    b := $shiftpoints(a,1,-1)

Note that in Diagram all path points are specified in grid units. The grid
is always shown as part of the diagram, thus it should be easy to see where
if a shape has been drawn at the position specified.

See the section "Path manipulation functions" for more information.

The third group is the `label` command and its variants. Each command in
this group is designed to place a text label onto the diagram. Their only
differ in how the coordinates would be interpreted as to position the text.
By default, a label label is centered at the coordinate point. But if the
command `labelrt` is used, then the label is placed at the right-hand
side of the coorindate.

The forth group consists of the "draw" command. For example, the
`drawdot`, `drawline`, `drawfullcircle`, `drawrect`, `drawshape`, etc. 
The arguments for these commands are all the same, which is a
path expression.

    drawdot (1,1) (2,3) (4,3) (5,6) 
    drawline (1,1) (2,3) (4,3) (5,6) 
    drawfullcircle (1,1) (2,3) 
    drawrect (1,1) (2,3) 
    drawshape (1,1) (2,3)

Each command might interpret the path expression slightly differently. But most
of the command except for the `drawline` is to treat each point in the path
expression as a single point to which a shape is to be drawn. For example, for
`drawdot` command each point in the path expression is to express a position
of a dot to be drawn. Thus, for a command such as the following there will
be three dots at the location (1,1), (2,2), and (3,4).

    drawdot (1,1) (2,2) (3,4)

The size of the dot and the color of the dot is expresses as part 
of the command configuration option. For example, to change the size of the dot
to 8pt, you would set the configuation option of 'fillcolor' to '8pt' first
before calling `drawdot` command.

    set dotsize 8pt
    drawdot (1,1) (2,2) (3,4)

Similar, to simultanous change the color and the size of the dot, you would configure
both options such as below before calling `drawdot`.

    set dotsize 8pt
    set dotcolor 0.5[red,white]

Note that you do not need to place any quoting when calling the `set` command.
Everything after the configuration name is considered the value that is to be
assigned to the parameter. However, some parameter will expect a string, and
some will expect a float.  Thus, for parameters that expectes a float, validity
checks will be performed and out-of-range data will be ignored. 

Even the `drawfullcircle` command is to behave the same way. For example, 
the following command will draw three circles at the given location. 

    drawfullcircle (1,1) (2,2) (3,4)

By default, the circle to be drawn has a diameter equal to one grid unit. 
However, you can ask to draw a circle of a different diameter by setting
the 'diameter' configuration parameter.

The only command that might behave a little differently is the `drawline`
command, in which case all points of the path is to be drawn as part of line
segments, which connect two neighboring points.  

    drawline (1,1) (2,2) (3,4)

You can close a path by including a "null" point using the notation of "()".

    drawline (1,1) (2,2) (3,4) ()

If the 'curve' property is also set, which is a string such as 'up'
or 'down', then the entire path is considered to represent a curve, 
where the text of the 'curve' property is to set the initial direction
of the curve. Thus, following command will draw a curved line that go
through all the points of this path.

    set curve up
    drawline (1,1) (2,2) (3,4) ()

When drawing label text, the 'label' and 'align' parameter can have
multiple entries separated by double-backslash such as following:

    set label A \\ B \\ C
    set align rt \\ lft \\ top
    drawlabel (1,1) (2,2) (3,4)

This will draw the label "A", "B", and "C" respectly each at a different
point that is (1,1), (2,2), (3,4), and each with a different alignment
that is right, left, and top.

Note that only the 'label' and 'align' parameters are to be treated
this way and only by the `drawlabel` command. All other parameters
will always be treated as a single value.

For this reason, the `drawlabel` command allows an optional parameter
before the coordinates to be used to specify the text to be drawn,
such that the text does not always have to be specified by the 
`set label` command. However, it will still use the 'align' parameter
that was previously set.

    drawlabel {A\\B\\C} (1,1) (2,2) (3,4)

In addition, when a text label is provided by the `drawlabel` command,
it is then set as the latest value of the 'label' parameter..


# The set command

The set command is used to configure and also provides information that
aides or otherwise provides critical information for other commands. 
For example, the `drawlabel` and label command uses the 'text' option
to fetch the actual text to be drawn.

Following are examples of using this command for setting the options.  

    set label  Points
    set width  29
    set height  12

The first word after the word set is recognized as the name of the option, and
it must consists of only word characters. All texts after the option name is
considered the value of the option. This allows a long text string with
spaces to be constructed without needing for any quoting.

    set label A short example

## Configuration parameters

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



## The label command and its variants

The 'label' command shows a text label on the screen. The label text itself is
set by setting 'label' option.  The following example draw a text label on the
location that is (10,10) with the label text that is 'An example'.

    set label  An example
    label (10,10)

The label command only requires a single point.  The text label will be
displayed and centered at the location described by the first point.  

Other variants of the label command is follows:

    labelleft
    labelright
    labeltop
    labelbot
    labeltopleft
    labelbotleft
    labeltopright
    labelbotright

Each of the variants is designed to position the text differently but otherwise
it behaves exactly as the label command.

## The drawlabel command

The drawlabel command is designed to draw multiple text labels each one
corresponding to one of the points in the path. The label text itself must be
specified using 'set label' command. Multiple text labels are recognized by the
presence of the double-backslash in the "text" option.  Following example shows
how to draw three text labels each at the location specified.

    set label A \\ B \\ C
    drawlabel (1,1) (2,2) (3,3)

The drawlabel command is to utilize each one of the points in the command line.
If there isn't any text available for the given point then a string such as
"(empty)" will be shown at that location.

Each text label is also able to attach a meta information regarding how the
text label is to be position relative to the point location. The offset
information is to be attached with each label text in the form of a set of
curly brackets and a string that describes the offset.

    set label A{top} \\ B{bot} \\ C{lft}
    drawlabel (1,1) (2,2) (3,3)

Following is the available options for describing the offset:

    {top}   -  top
    {bot}   -  bottom
    {lft}   -  left    
    {rt}    -  right   
    {ulft}  -  upper left
    {llft}  -  lower left
    {urt}   -  upper right
    {lrt}   -  lower right

## The drawanglearc command

This command is designed to draw a small arc describing the span of an angle.
It expects three coords: the vertex of the angle, a point on the side of the
ray, and a point on the second side of the ray. 

    drawanglearc (0,0) (5,0) (5,5) 

In the previous example the small arc will start at 0 degree and run counter
clockwise for a degree span of 45 degrees.

The radius of the arc is determined by the 'anglearcradius' option. 
The default is set to be 0.5 unit length.

## The drawrightanglearc command

This command is designed to draw a small square shape describing the span of a 
right angle.

    drawrightanglearc (0,0) (5,0) (5,5) 

It has the same expectations for the arguments as the drawanglearc command.

## The drawshape command

This command is to put a shape in each one of the locations that is a point in
a path. The shape must be one of the built-in shape defined by Diagram.

The shape can only be draw at the predefined size and there is no provision
to scale it. The origin of the shape is to be aligned with the point specified.
Typically the origin is at the lower-left hand corner, but it can also be
different for each shape. Some might even be at the center, depending on 
how the shape is intended to be used. Typically the shape is 1x1 but that
is not the intent to keep it that way. For example, for the radical4 shape
its width is 4 and its height is 2. It is designed to be used with a 
long division illustraton that can be used for a dividend of 3 digit long.

The drawshape command only takes path expression as its arguments. It
can be used to draw one or more shapes. The name of the shape must be 
specified by the `set label` command. Following example draws two shapes:
one for the brick and one for the radical4, each one at a different
location of the path.

    set label brick \\ radical4
    drawshape (5,5) (10,5)

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
```


