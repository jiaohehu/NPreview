# Supporting Diagram

A diagram block is to generate a diagram with vector based figures, made up
with vector based components as lines, circles, rectangles, arrows, dots, etc.
The goal of using a diagram block versus using an raster based image such as
PNG or JPEG is that a vector based diagram provides much better resolution
especially when the diagram is printed on a piece of paper.

A diagram block is to be translated into an inline MetaPost block between
`\begin{mplibcode}` and `\end{mplibcode}`. This environment is supported by the
`luamplib` LATEX package.

    \usepackage{luamplib}



## An example diagram

Following is an example of a diagram block.


```diagram
viewport 32 20

% variables
a := (1,1) -- (5,5) -- (5,1) -- (1,1) ()
b := (1,1) .. (5,5) .. (5,1) .. (1,1) ()

% drawline
drawline *a
drawline *b

% circles

set fill pink
set start-angle 0
set end-angle 90
circle     (16,1)
halfcircle.top (16,3)
halfcircle.bot (16,5)
halfcircle.rt  (16,7)
halfcircle.lft (16,9)
quadrant.q1  (18,1)
quadrant.q2  (18,1)
quadrant.q3  (18,1)
quadrant.q4  (18,1)
octant.o1  (18,3)
octant.o2  (18,3)
octant.o3  (18,3)
octant.o4  (18,3)
octant.o5  (18,3)
octant.o6  (18,3)
octant.o7  (18,3)
octant.o8  (18,3)
circle.chord (20,1)
circle.arc   (20,3)
circle.cseg  (20,5)

% dot
sq := (22,3) (23,3) (23,2) (22,2)
dot (22,1)
dot $somepoints(sq,0) $somepoints(sq,1) $somepoints(sq,2) $somepoints(sq,3) (22,4) (23,4)

% tick
tick.top (23,1)
tick.bot (24,1)
tick.rt  (25,1)
tick.lft (26,1)

% 90-degree angle
drawline (28,4)--(31,4)
a/b := *
drawline (28,4)--(28,7)
/c := *
drawanglearc.sq *a *b *c

% 45-degree angle
drawline <0,-4> (28,4)--(31,4)
a/b := *
drawline <0,-4> (28,4)--(31,7)
/c := *
drawanglearc *a *b *c

% drawline will fill      
ff := (28,8)--(31,8)--(31,9)--(28,9)--cycle
set stroke-width 2px
set fill orange
drawline *ff
reset

% label
label.rt  {``C_0``} (5,5)
label.rt  {``B_0``} (5,1)
label.top {``A_0``} (1,1)

% dots
dot (1,1) \
        (2,2) (3,3) \
        (4,4) (5,5)

% ticks
tick.top (2,1) (3,1) (4,1)
tick.bot (2,1) (3,1) (4,1)
tick.rt  (5,2) (5,3) (5,4)
tick.lft (5,2) (5,3) (5,4)

% arrow & dblarrow
drawarrow (7,3) (9,5)
drawdblarrow (9,3) (11,5)
drawrevarrow (11,3) (13,5)

% text of a different fontsize
set fontsize 14pt
label.ctr { 簡単 Triangle } (10,1)

% shape
brick (7,7) [h:1] [h:1]
brick (7,8) [h:1] [h:1]

% trapezoid
trapezoid (2,11)

% rhombus
rhombus (5,11)

% rect
rect (8,11)

% parallelgram
parallelgram (11,11)

% apple
apple (15,11)

% basket
basket (17,11)

% crate
crate (21,11)

% rrect
rrect (26,11)

% protractor
protractor (10,15)

% radical
radical (1,17)
```

## The unit length and grid lines

In Diagram, each figure is always expresses using the grid unit length. A unit
unit length is considered as a distance between two adjacent grid lines on a
graphing paper for which a length of 1 corresponds to the width of a single
grid.

In Diagram a grid is always draw as the background. By default the grid is
25 grid units length long in the horizontal direction and 10 grid unit length
long in the vertical directon. You can change that by running the `viewport`
command as the first statement within the diagram block. In the following example
a diagram area is set to be 32 grid unit length long in horizontal direction
and 20 grid unit length in vertical direction.

    viewport 32 20

When generationg MetaPost, each grid is by default considered as 4mm in length.
Thus, a total grid of 32 in width will give you a total width of 120mm and, a
total grid of 20 will give a total height of 80mm.  You can change the length
of each grid by running the `unit` command as follows.

    unit 6mm

The `config` command is designed to configure viewport. So far the only
available option is to set the 'grid' option to 1. When it is set to 1
then the grid will be drawn in such a way that the 10th and 5th grid
will be drawn in a slightly darker color, making it easier to spot
and count the number of grid lines horizontally and vertically.

    config grid 1

Note that these commands must appear before all other drawing instructions that
is to be explained later.



## Drawing instructions

Aside from `viewport` and `unit`, the rest of diagram commands are considered
drawing instructions. Almost all drawing instructions will generate a MetaPost
output, such as output to draw a line, a circle, a dot, etc. The only
exceptions are the `set`, `reset` and `exit` instructions. The first two is to
set and/or clear the drawing parameters for other drawing instructions, and the
last one is to stop the processing of the rest of the instruction prematurely.

Each instruction must start its own line. If a line is too long to fit side a
single source paragraph then a backslash can be placed at the end of the line
to instruct that the next line is a continuation of the current line.

If a percent sign (`%`) is detected as the first character of the line
then the entire line is considered a comment and will be ignored.

The first word of each instruction is considered the instruction name that tells
what actions to take.  Following is a list of all instruction names:

    set stroke-width 2pt
    set fill 0.5[red,green]
    set stroke 0.5[red,green]
    set slant 0.44

The `set` instruction is to set or clear a drawing parameter.  When provide
a setting, simply place the parameter name after the `set` command, followed
by the value of the parameter.

To restore the parameter to its initial value you can call the `set` instruction
followed by the name of the parameter without any values.

    set stroke-width

The `reset` instruction clears *all* drawing parameters to its initial value.

    reset

The `exit` instruction will stop the processing of the rest of the instructions and
of the instruction.  It can be used to temporary avoiding
some instruction to aid debugging.

    exit

An assignment is to create a new path variable or several new path variables,
or to modify exsiting variables. A path variable must be consists of only
upper case or lower case letters. Digits are not allowed.
An assignment must appear in the form where the variable or variables
are to appear on the left hand side of the ':=' and the path expression
on the right hand side of it.

    a := (1,1) -- (2,2) -- (3,4)
    b := a .. (5,5) .. (6,7)

Typically, a path expression consists of one or more coordinates (points),
and join types. A join type can only be '--' or '..'. The '--' join type is
to express a 'lineto' operation between the last point and the next point.
A '..' join type is to express a 'curveto' operation between the last point
and the next point. A point should always be expressed between a set of
parentheses, such as `(1,1)`, `(2,2)`, `(3,4)`, etc.
However, Diagram also has something called 'path function'. It's main purpose
is to allow for new coordinates to be created from existing path variables.
For example, in the following example the variable 'c' is to be assigned the
the first point of the path 'a'.

    c := $somepoints(a,0)

Similarly, following statement will assign the second point of path 'a' to
variable 'd'.

    d := $somepoints(a,1)

Besides the user created variable, the asterisk (`*`) is called a "wildcard
path variable" A wildcard variable is a  built-in variable that is designed to
holds the path encountered by the last draw instruction.  This variable can be
used to recall the last path encountered. In the following example the same
path that was used for drawing the line is assigned to variable 'a'.

    drawline (1,1) (2,2) (3,4) (4,5)
    a := *

The wildcard variable is updated each time a new drawing instruction is
encountered.  However, it will not be changed by an assignment instruction such
as `a := *`.  This is by design and is to allow for the same wildcard variable
to be used multiple times to create other path variables.  Following example
shows how to create path variable 'a', 'b', and 'c' by extracting points and
amending points from the same path that was used by the `drawline` instruction.

    drawline (1,1) (2,2) (3,4) (4,5)
    a := *
    b := * (5,6)
    c := $somepoints(*,1,2)

For a path variable, as well as a wildcard variable, all its content points
will be subject to coordinate transformation based on values of 'refx', 'refy',
'refsx', and/or 'refsy' at the time.  Thus, the same path variable might
be used to draw different lines and curves under a different setting
of 'refx', 'refy', 'refsx' and 'refsy'.

The assignment instruction also has provision to allow for something akin to
JavaScript "array destructuring" statement, in which case individual points of
a path are assigned to different path variables at the same time by the same
assignment instruction. In the following assignment instruction path variables
'a', 'b' and 'c' are each created and assigned three different points of the
same path that was drawn by the `drawline` statement.

    drawline (1,1) (2,2) (3,4)(4,5)
    a/b/c := *

The previous assignment instruction is functionally equivalent to the following
three assignment instructions using $somepoints() path function.

    drawline (1,1) (2,2) (3,4) (4,5)
    a := $somepoints(*,0,0)
    b := $somepoints(*,1,1)
    c := $somepoints(*,2,3)

Each sub-variable must be separated from other sub-variables by one or more
slash character.  You can skip ahead and bypass certain points by not
including any variables in between slashes. For example, you can choose to
assign the first point to variable 'a' and the third point to variable 'b'
as follows.

    drawline (1,1) (2,2) (3,4) (4,5)
    a//b := *

Note that the last variable always gets all the remaining points.  In the
previous example, variable 'b' will get the last two points, which are
(3,4) and (4,5).  However, you can choose to allow only a single point to
be assigned to the last variable by including an additional slash after
this variable.

    drawline (1,1) (2,2) (3,4) (4,5)
    a//b/ := *

Similarly you can also add slashes at the beginning to skip first few
points.  Following example will skip the first two points and assign the
remaining two points to variable 'a'.

    drawline (1,1) (2,2) (3,4) (4,5)
    //a := *

To use a variable inside another path expression, place an asterisk
in front of it such as `*p`.

    p := (1,2) (2,3) (3,4)
    dot *p

In such a case three dots will be drawn in three locations that are: (1,2),
(2,3), and (3,4).  You can also freely mix variables and coordinates.

    p1 := (1,2) (2,3) (3,4)
    p2 := (5,6) (7,8)
    dot *p1 *p2 (9,9)

You can narrow down the range of the points by including a scription
such as the following, for example, if you only interested in printing
out the dot for the first point of a path 'p'.

    p := (1,2) (1,3) (3,4)
    dot *p[0]

Similarly, you can specify a range of subscriptions.

    p := (1,2) (1,3) (3,4) (4,5) (5,6) (6,7)
    dot *p[0]
    dot *p[0-1]
    dot *p[0-2]
    dot *p[0,1,2]
    dot *p[0,1,2,4-5]

The `brick` command is to draw a brick. The brick is a a width of 1
and height of 0.5. Its lower-left corner aligns with the point.

    brick (0,12)

The `radical` command draws a radical shape suitable for presetting
a long division worksheet. The topleft corner aligns with the point.

    radical (0,12)

By default, the length of the radical symbol is 4 grid units long. You
can change it by setting the 'radical-length' parameter.

    set radical-length 7
    radical (0,12)

The `protractor` command draws a protractor. The protractor is defined
to be having a width of 7 and height of 3.5. It is a half-circle
shape. The center of the protractor which is the center of the half
circle aligns with the point. Currently there is no provision to change
the size of the protractor.

    protractor (0,12)

The `basket` command draws a basket shape that is 3-by-2. The lower-left corner
of the basket aligns with the point.

    basket (0,12)

The `crate` command draws a crate shape that is 4-by-4. The lower-left corner
of the shape aligns with the point.

    crate (0,12)

The `drawline`, `drawarea`, `drawdblarrow`, `drawarrow` instructions
are designed to stroke a path or fill in the area desginated by the path.

    drawline
    drawarea
    drawdblarrow
    drawarrow
    drawrevarrow

The `drawline` instruction strokes the path, which many consists of multiple
straight line segments and/or curved segments. The `drawarea` instruction is to
fill the area designated by the path.  The `drawdblarrow` instruction is to do
the same thing as `drawline` except to place arrow at the beginning of the
first line segment and the end of the last line segment. The `drawarrow` is
similar to `drawdblarrow` except that the arrow head is to appear on at the end
of the last line segment.

The `drawline` instruction stroke a given path.  The (stroke) and
(stroke-width) settings will be pulled to get the stroke width and stroke
color.  The (stroke) setting is for specifying the color of the line. This
setting is to apply for both `drawline` and `drawarea`.  The (stroke-width)
setting is to set the line width when `drawline` and/or `drawarea`.
However, there is a difference. If (stroke-width) is set to "0", then
`drawline` would still draw the line. However, `drawarea` will not draw the
outline of the path.

Note that for drawing lines, such as `drawline`, `drawdblarrow`, and
`drawarrow` instructions, the line color is controlled by the *stroke*
parameter.  The *stroke-width* would have constrolled the line width, which could
be set to something like "2pt".

The `circle` instruction is to draw a full circle, or part of a circle.
It also has variants that would draw only a part of a circle as an arc, or to draw
a chord, or the circular segment described by the arc and chord,

    circle        (1,1)
    circle.chord  (1,1)
    circle.arc    (1,1)
    circle.cseg   (1,1)

    halfcircle.top    (1,1)
    halfcircle.bot    (1,1)
    halfcircle.rt     (1,1)
    halfcircle.lft    (1,1)

    quadrant.q1     (1,1)
    quadrant.q2     (1,1)
    quadrant.q3     (1,1)
    quadrant.q4     (1,1)

    octant.o1     (1,1)
    octant.o2     (1,1)
    octant.o3     (1,1)
    octant.o4     (1,1)
    octant.o5     (1,1)
    octant.o6     (1,1)
    octant.o7     (1,1)
    octant.o8     (1,1)

Each instruction is to accept a path expression where each point on the path
is to be interpreted as a point to place the circle. The center of the circle
is to be aligned with the point.  The following example draws the same circle
twice, once at (1,1) and another at (2,2).

    circle (1,1) (2,2)

The `circle` instruction is designed to either draw or fill in the area of the
circle. If it is to fill in the area of the circle, you must set the *fill*
parameter to a non-empty value, such as "orange", etc.
In this case, the circle will first be filled with black or orange, and then
drawn the outline using the normal line color. If not drawing is to happen,
set the *stroke-width* parameter to "0".

The size of the circle is to be controlled by the *diameter* parameter, which default
to 1. If set to "5", then the circle drawn will have a diameter of 5.

Variants of `circle.top`, `circle.bot`, `circle.rt`, `circle.lft` are to draw
half circle at the designed location. For example, `circle.top` is to draw a
half circle that appear on top of the point. These instructions can also be
used for draw, filling, or draw/fill, depending on the settings of *fill*
and/or *stroke-width*, in the same mannor as that of the `circle` instruction.

The variants of `circle.q1`, `circle.q2`, `circle.q3`, and `circle.q4` are designed
to draw a quadrand of the circle. Their drawing and filling behavior can be controlled
in the same mannor as that of the `circle`.

The variants of `circle.o1` to `circle.o8` are designed to draw octant of a
circle.  Their drawing and filling behavior can be controlled in the same
mannor as that of the `circle`.

The instructions of `circle.chord` or `circle.arc` are stroke operations only.
They will not attempt to fill an area.  They drawing behavior will only respond
to changes in *stroke* and *stroke-width*. The `circle.chord` is to draw a
chord connecting to points on the circumference of the circle. The two points
are defined by the *angle1* and *angle2* parameter, each of which expresses an
angle that is in degrees. The circle is of a diameter that is expressed by the
*diameter* parameter.  The location of the circle is given by a point that is
part of a path expression.

    circle.chord (1,1)

The `circle.arc` instruction works the same way and is controlled by the same
set of parameters as that of the `circle.chord`.

    circle.chord (1,1)

The `circle.cseg` is to draw a circular segment bound by the chord and arc.
Therefore it is controlled by the same set of parameters as those of
`circle.chord` and `circle.arc`. It is an area operation that will subject to
the drawing or filling operation depending on the same set of settings as those
of the `circle` instruction.

    circle.chord (1,1)

The `drawanglearc` instruction is to draw a small arc denoting the interior
of an angle.  The `drawanglearc.sq` is to do the same thing but will draw a
square instead of the arc.  It should only be used for a right angle.

The `drawanglearc` instruction is similar to `circle.arc` except for the
interpretation of the arguments. the `drawanglearc` instruction expectes
three points in the arguments to be interpreted as the origin, a point on
the starting side of the angle, and a point at the ending side of the
angle. Following will draw a 45 degree angle arc assuming angle vertex is
at (0,0), the starting side is a line from (0,0) to (1,0), and the ending
side is a line from (0,0) to (1,1).

    drawanglearc (0,0) (1,0) (1,1)

The amount of distance of the arc is controled by the setting (anglearcradius)
which expresses the radius of the arc from the angle vertex. The default
setting is 0.5 grid unit length. You can set it to a larger value if the angle
is small.

    set anglearcradius 1.5
    drawanglearc (0,0) (1,0) (1,0.5)

Latest addition also allows for a text label to be positioned relative to the
arc or sq.  To specify text label, includes it as the first argument before any
coordinates.

    drawanglearc {``\gamma``} (3,4) (4,4) (4,5)

The `drawarc` instruction would draw an arc from point a to point b.

    drawarc (6,10) (10,10) (14,10)

The arc to be drawn will be understood to have a x-radius of 2 and y-radius
of 1, and a rotation of 0. To change it you can set the 'x-radius', 'y-radius'
and 'rotation'.

    set x-radius 6
    set y-radius 4
    set rotation 30
    drawarc (6,10) (10,10) (14,10)

Note that the 'rotation' setting is in the unit of degrees and
counterclockwise direction is the positive direction.

The `rect` instruction draws a rectangle, `rect.parallelgram` draws a
parallelgram, `rect.rhombus` draws a rhombus, and `rect.trapezoid` draws a
trapezoid shape.

    rect                (1,1)
    rect.parallelgram   (1,1)
    rect.rhombus        (1,1)
    rect.trapezoid      (1,1)

These instructions are all area operations. By default it draws the outline of
the shape, but if *fill* is set, then it also fills the area using the fill
color specified. It always draw the outline of the shape unless the
*stroke-width* is specifically set to "0" when filling an area.

The overall size of the quadrilateral is controlled by the *rectw* and *recth*
parameter, which specifies the width and height of the shape in grid unit
length.  The following example draws a rectangle with a width of 5 and height
of 3, and its lower-left position is aligned with (1,1).

    set rectw 5
    set recth 3
    rect (1,1)

These settings apples to all quadrilaterals.  For a parallelgram, this means
that the horizontal difference between its lower-left and upper-right hand
corner is always equal to *rectw*, and the height difference between the upper
parallel line and lower parallel line is always equal to *recth*.  

However, for a parallelgram, the topleft and bottomright part of the rect area
will be sliced off to make the shape of a parallelgram.  The amount of
incursion is determined by the *slant* setting.  This setting is a number
between 0.1 and 0.9.  It describes the portion of the total width that is to
make up the "slanting" part of the parallelgram.  For example, if it is set to
"0.3" which is the default, it means that 30 percent of the overall width will be
used for slanting. This means 30 percent of the distance of the overall width
from top left corner moving towards the right, and 30 percent of the overall
width from the bottom right corner moving towards the left, will be the
"slanting" part of the parallelgram. The following example will draw a
parallelgram such that its slanted part is half the width of the overall
parallgram.

    set rectw 5
    set recth 3
    set slant 0.5
    parallelgram (1,1)

The `rect.rhombus` shape is drawn with diamond head and tail pointing
to the left and right. There is currently no provision to change
its size so it will be the same size for now.

    set rectw 5
    set recth 3
    rhombus (1,1)

The `rect.trapezoid` shape is drawn with a base larger than the top.    
Also, the encroachmentment from the left at the top is 20 percent of the
total width. The encroachment from the right at the top is 40 percent of
the total width.  Currently these numbers are fixed but future improvement
will likely to provide options to allow for adjustments.

    set rectw 5
    set recth 3
    trapezoid (1,1)

The `dot` instruction is to draw a dot at each path point.  It is typically
used to identify the location of a point in a plane by showing a visible round
black dot.  The `dot` instruction will draw a circular dot. The default size of
the dot is '4pt', but can be changed by the *dot-size* setting, i.e., to set it
to a string of '5pt'.  Following example draw three dots at location of (1,1),
(2,2) and (3,3) where each dot is at a size of "5pt".

    set dot-size 5pt
    dot (1,1) (2,2) (3,3)

The color of the dot is by default set to black, unless changed by the
*dot* setting, which describes a color such as "orange".

    set dot orange
    set dot-size 5pt
    dot (1,1) (2,2) (3,3)

The `tick` instruction is designed to draw ticks along a number line, or x-axis
or y-axis.  Specifically, the `tick.top` instruction draws a vertical tick
above the point.  The `tick.bot` instruction draws a vertical tick below the
point The `tick.rt ` instruction draws a horizontal tick to the right hand side
of the point The `tick.lft` instruction draws a horizontal tick to the left
hand side of the point

The protrusion of the tick is by default set to 0.33 grid unit. This is length
of the line it will protrude away from the point. It is controlled by the
*tick-protrude* setting. It is always in the grid unit length.  The default is
'0.33'.

The color of the tick is set to black, unless changed by the *tick*
setting, which describes the color of the tick, such as "0.5[red,white]".
The thickness of the tick line is controlled by the setting *tick-width*.
The default is "1pt".

Drawing text labels are done by using the `label` instruction.
For example, the following `label` instruction will each draw a label
at the given location.

    label.rt {A} (1,1)
    label.lft {B} (2,2)
    label.top {C} (3,4)

The default `label` instruction will position the text so that it is centered
at the path point. Other variants of the `label` instruction is to allow the
text to be positioned around the location of the point.

    label.top   -  top
    label.bot   -  bottom
    label.lft   -  left    
    label.rt    -  right   
    label.ulft  -  upper left
    label.llft  -  lower left
    label.urt   -  upper right
    label.lrt   -  lower right

All `label` instructions are designed to draw the same label at multiple
locations. For example, we can draw the same letter A three times
each at three different locations such as follows.

    label {A} (1,1) (2,2) (3,4)

We can also ask a differet label to be drawn at a different
location by writing the text label like the following:

    label {A\\B\\C} (1,1) (2,2) (3,4)

This will draw the label "A", "B", and "C" respectly each at a different
location that is (1,1), (2,2), and (3,4). Note that all the labels will be
centered at the location because the instruction is `label`.



## The settings

Following is a list of all settings.

``` tabularx
|--------------------|-----------------------------------------------------|
|Command setting     |Description                                          |
|--------------------|-----------------------------------------------------|
|refx                |Set an offset number to offset coordinate in x-axis. |
|                    |Ex. if refx is set to 4 a source coordinate of       |
|                    |(2,0) will map to (6,0).                             |
|                    |Must be set to a number zero or greater, and no more |
|                    |than the total number of grids in the horizontal.    |
|--------------------|-----------------------------------------------------|
|refy                |Same as refx bug does it for its y-coordinate.       |
|                    |Must be set to a number zero or greater, and no more |
|                    |than the total number of grids in the vertical.      |
|                    |                                                     |
|                    |                                                     |
|--------------------|-----------------------------------------------------|
|refsx               |Set a scalar number to scale coordinate in x-axis.   |
|                    |Ex. if refx is set to 6 and refsx      is set to 3,  |
|                    |For a coord that is specified as (2,0),              |
|                    |it is first scaled three times which puts it at (6,0)|
|                    |before being shifted 6 grids to the right which puts |
|                    |it at (12,0), which is its final displayed position. |
|                    |Must be set to a number between 0.1 and 10.          |
|--------------------|-----------------------------------------------------|
|refsy               |Same as refsx      but does it in y-axis.            |
|                    |                                                     |
|                    |                                                     |
|--------------------|-----------------------------------------------------|
|font-color          |Set a string that describes the color, such as       |
|                    |'green', 'red', 'blue', 'black', and 'white'.        |
|                    |Only the five colors are supported.                  |
|                    |                                                     |
|--------------------|-----------------------------------------------------|
|font-size           |Set to a font size specification such as '14pt'.     |
|                    |Used when drawing text labels.                       |
|                    |                                                     |
|--------------------|-----------------------------------------------------|
|slant               |Set to a floating point number between 0.1 and 0.9   |
|                    |expressing the proportion of the overall parallelgram|
|                    |width reserved for the slanted part of the shape.    |
|                    |Default is 0.3.                                      |
|--------------------|-----------------------------------------------------|
|linedashed          |Set a string that is either 'evenly', or 'withdots'  |
|                    |that is to control the appearances of the dashes.    |
|                    |Default is empty, that a solid line is to be drawn.  |
|--------------------|-----------------------------------------------------|
|stroke              |Set the color used when drawing lines, such as "red".|
|                    |It is used by the drawline instruction.              |
|                    |                                                     |
|--------------------|-----------------------------------------------------|
|line-size           |Set the thickness of the line when drawing lines,    |
|                    |such as "4pt".                                       |
|                    |It is used when drawing lines.                       |
|--------------------|-----------------------------------------------------|
|fill                |Set the color used when filling an area, i.e., "red".|
|                    |It is used when drawing an area.                     |
|                    |                                                     |
|--------------------|-----------------------------------------------------|
|dot                 |Set the color used for drawing dots, such as "red".  |
|                    |It is used by the drawdot instruction.               |
|                    |                                                     |
|--------------------|-----------------------------------------------------|
|dot-size            |Configure the size of the dot to be drawn, such as   |
|                    |"8pt". Used by the `dot` instruction. The default    |
|                    |is "5" user unit.                                    |
|--------------------|-----------------------------------------------------|
|tick                |Set the color used for drawing ticks, i.e.,  "red".  |
|                    |It is used by the `tick`  instruction.               |
|                    |The default is empty, which MetaPost assume as black.|
|--------------------|-----------------------------------------------------|
|tick-size           |Configure the thickness of the line for ticks.       |
|                    |i.e, "2pt". The default is "1pt".                    |
|                    |It is used by the `tick` instruction.                |
|                    |                                                     |
|--------------------|-----------------------------------------------------|
|tick-protrude       |Configure how far away the end point is from the     |
|                    |axis line. The default is 0.33 grid unit.            |
|                    |The maximum is "1.0", the minimum is "0.1".          |
|--------------------|-----------------------------------------------------|
|rectw               |Set to a number that is the width of the rectangle.  |
|                    |Used by rect, rrect, rhombus, trapezoid,             |
|                    |and parallelgram.                                    |
|--------------------|-----------------------------------------------------|
|recth               |Set to a number that is the height of the rectangle. |
|                    |Used by rect, rrect, rhombus, trapezoid,             |
|                    |and parallelgram.                                    |
|--------------------|-----------------------------------------------------|
|radius              |This is to express the length of the radius for      |
|                    |an circle, halfcircle, quadrant circle, or octant    |
|                    |circle.                                              |
|--------------------|-----------------------------------------------------|
|start-angle         |This is to express the measurement of the first      |
|                    |angle. It is used by circle.arc, circle.chord,       |
|                    |and circle.cseg                                      |
|--------------------|-----------------------------------------------------|
|end-angle           |This is to express the measurement of the second     |
|                    |angle. It is used by circle.arc, circle.chord,       |
|                    |and circle.cseg                                      |
|--------------------|-----------------------------------------------------|
|angle-arc-radius    |This is to provide the radius for the angle arc.     |
|                    |Used by drawanglearc command                         |
|                    |                                                     |
|--------------------|-----------------------------------------------------|
|angle-arc-label-    |This is the additional distance between the angle    |
|offset              |arc and the label text.                              |
|                    |                                                     |
|--------------------|-----------------------------------------------------|
|x-radius            |This is to provide the radius that will be used when |
|                    |drawing an arc.                                      |
|                    |Used by drawarc command.                             |
|--------------------|-----------------------------------------------------|
|y-radius            |This is to provide the radius that will be used when |
|                    |drawing an arc.                                      |
|                    |Used by drawarc command.                             |
|--------------------|-----------------------------------------------------|
|rotation            |This is to provide the rotation when drawing an      |
|                    |arc.                                                 |
|                    |Used by drawarc command.                             |
|--------------------|-----------------------------------------------------|
```

## Path expression       

As can be seen, a path expression is used by an assignment instruction, as well
as other statements that also expectes a path.  A path expression consists of
literal points, path variables, path functions, wildcard spreads, or path
variable spreads.

All the previous constructs are for a single goal, which is to create a path.
A path can be considered collection of single points, where each point
describes its location and how it supposes to join the previous point (line, or
curve).  It also includes additional information such as '{up}', '{down}' that
describes the direction of the curvature if a curve is to be formed between the
two points.  The syntax of a Diagram path expression is very similar to that of
MetaPost and models it closely, allowing it take advantage of the MetaPost's
strong path description capability.

    a := (1,1) -- (2,2) -- (3,4)
    b := a{up} .. (5,5) .. (6,7)

However, Diagram have added a few more syntax designed to allow for specifying
points in a few more different ways. For example, it offers a "relative point" syntax
that allows you to specify a point that is relative to the point before it.

    a := (1,1) [up:1] [rt:2] [down:1]

This allows you to create a four point path where the first point is (1,1),
and the rest points being at (1,2), (3,2), and (3,1).
Following are all relative points.

    up:1
    down:1
    top:1
    bot:1
    rt:1
    lft:1
    urt:1
    ulft:1
    lrt:1
    llft:1
    angledist:1,30
    turnrt:1,30
    turnlft:1,30
    flip:5,5

The [angledist:1,30] allows you to construct a new point that is to travel at a
angle of 30 degrees counterclockwise from due east for 1 unit length, starting
from the current point.

The [turnrt:1,30] is to create a new point that is equivalent to making a right
turn of 30 degrees from the direction you have arrived at the current point, and
then travel for one more unit length.

The [turnlft:1,30] is similar to [turnrt:1,30] except that you will be making
a left turn instead of right turn.

The [flip:5,5] is to construct a new point that is the mirror image of the
current point. The mirror is the line segment that is made up by the current
point and the point before that. This operations allows you to figure out where
an existing point will land as if you were folding a paper along some existing
line.

Aside from relative points, path expression can also include "offsets". An offset
allows you to do "psudo translation" for the points of the same path. For example,
if were to draw one horizontal line and one vertical line that meets
at (10,0) such as the following.

    drawline (10,0) (15,0)
    drawline (10,0) (10,5)

You can do that using the offset as follows.

    drawline <10,0> (0,0) (5,0)
    drawline <10,0> (0,0) (0,5)

The offset <10,0> is to set it so that the all future points will be considered
an offset to the point that is (10,0).  Thus, the point of (0,0) is considered
as (10,0), and (5,0) is considered (15,0). The offset always appears between a
set of angle brackets. The first number is the offset in the horizontal
direction, and the second one in vertical direction.

The offset is only going to be valid for the current path. It will affect all
future points after it. Thus, if you have placed an offset in the middle of two
points, such as the following, then the first point is to be considered
as (0,0) while the second one as (15,0).

    drawline (0,0) <10,0> (5,0)

If two offset appears in a path expression, then the second offset is
considered to be offset to the first. This allows you to construct more points
simply by moving offsets. For example, you can construct a path with four
points (11,0), (12,0), (13,0) and (14,0) as follows.

    drawline <11,0> (0,0) <1,0> (0,0) <1,0> (0,0) <1,0> (0,0)

The 'cycle' keyword will instroduce a cycled point to the path and then
terminate it. This will essentially add a *new* point at the end of the
current path that is the same point of the first, followed by a 'cycle'
point. These two additional points will appear at the end of the 
current path. The process will also terminate and stop processing all
future points in the input line. 

On the other hand, if a '()' is encountered, such as the following, then
a new 'nan' point will be instroduced and the processing continue on
without interruption. This feature allows for multiple 'nan' points to be
introduced to the path, simulating multiple broken "line segments."
In the following example two line segments will be drawn, one between
(0,0) and (2,3), and another between (4,5) and (6,7).

    drawline (0,0) (2,3) () (4,5) (6,7)


## Path functions        

Note that for a path function all its arguments must be either a path variable
or a number. Coordinate list is not valid. In the following examples all
letters a, b, c are path variables.

+ midpoint(a)     
+ midpoint(a,0.2)     

This function returns the mid point of the first two points in a path
expression if a single argument is given.

    a := (1,1) (2,3) (3,4)
    b := $midpoint(a)

This will return a path with a single point: (1.5,2)

If two arguments are given, it does a linear interpolation alone the
line segment of the first two points, and return a point that corresponds
to the percentage of the path traveled from the first point to the second.
The second argument is an floating point number between 0-1.
For example, if 0.5 is given as the second parameters, it should return the
same path as that with a single argument. Thus, following example will return
the same result as the one before.

    a := (1,1) (2,3) (3,4)
    b := $midpoint(a,0.5)

    Following will return the a point that is one-third the way from the first
    point to the second point.

    a := (1,1) (2,3) (3,4)
    b := $midpoint(a,0.333333)

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

    b := shiftpoints(a,-1,2)

+ scatterpoints(1,0,10,0,10)

This function is to create new path with the number of points evenly distributed
beteen the two end points. In the previous example there will be 10 points created
in a path such that the first point is (1,0), and the last point is (10,0),
and the rest of the points will be spaced evenly between the first and the last.

+ lineintersect(a,b)  

Returns new a path that contains a single point which is the point at which the
two lines intersect. The first line is described by the symbol 'a', which must
have at least two points. The second line is described by the symbol 'b', which
must have at least two points. Only the first two points of 'a' and 'b' are
considered. The rest of the points of 'a' and 'b' are ignored.

Note that the returned point might have Infinity or NaN due to the nature
of parallelness.  In the following example the path variable 'c' will hold
one point: (2,2)

    a := (0,2) (4,2)
    b := (2,0) (2,6)
    c := $lineintersect(a,b)

+ linecircleintersect(a,c,radius)

Returns new a path that contains two points for the line and circle intersection.
In the following diagram the pts variable 'pts' will hold two points: (6,2) and
(4,2).

    a := (2,2) (6,2)
    c := (5,3)
    pts := $linecircleintersect(a,c,1.4142)


## The shape instruction

This instruction is designed to draw a shape at each one of the path points.

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


## Specifying the color for MetaPost

The color syntax is either the color name, such as "red", "green",
or RGB such as "rgb(200,100,25)".

The MetaPost code has the provision to allow for a "xcolor" provided
by the "xcolor" package, such as using the \mpcolor macro. Thus,
the MetaPost command can be set up as

    drawline (1,2)--(2,3) withpen pencircle withcolor \mpcolor(gray)

The xcolor package has also expanded the avialble color names to more than
what's provided by MetaPost, including "gray", "orange", etc. Following
additional color names are always provided by the xcolor package:

    red, green, blue, cyan, magenta, yellow, black, gray, white,
    darkgray, lightgray, brown, lime, olive, orange, pink,
    purple, teal, violet

SVG also allows for a color to be specified directly using RGB, such as

    <line x1='0' y1='1' x2='2' y2='3' stroke='rgb(200,100,25)'/>

However, MetaPost does not allow for expressing a color using three integers
as RGB values of a color. It insists that a name is to be used for \mpcolor
macro. However, it does not have provision such that you can *create* a new
color name with a customized RGB values in it, such as

    \definecolor{ultramarine}{RGB}{0,32,96}
    \definecolor{wrongultramarine}{rgb}{0.07, 0.04, 0.56}

The \definecolor is a macro provided by xcolor package. This means if a
color is specified as "rgb(200,100,25)" then a \definecolor command must
first be called to create a "unique" color name, such as "mycolor003"
which is to be placed outside of the "mplibcode" environment, in order
for this particular color to be referenced inside "mplibcode" environment.
Therefore, currently MetaPost translation does not support specifying
color using RGB directly.

Note that MetaPost does allow for a color mixing using existing color names
such as

    drawline (1,2)--(2,3) withpen pencircle withcolor \mpcolor(red!80!white!20!)


## The line size or dot size unit

Note that for units such as line width, dot size, etc, is maintained internally
by Diagram as the SVG user unit. One user unit is exactly 1/96 of an inch.
Following is the conversion of SVG units.

    1in = 96px
    1in = 72pt
    1in = 2.54cm

It seems that MetaPost allows for a line length or dot size to be
expressed without a specific unit attached to it. For example, you
can ask to draw a dot by MetaPost with the following command.
The "withpen pencircle scaled 5" is part of a configuration to
the "drawdot" command that is to tell it to use a pen size of 5.
Note that the size of 5 is interpreted as the size of the pen,
therefore, the diameter of the dot as the pen is a circle pen.

    drawdot (22*u,3*u) withpen pencircle scaled 5 ;

You can also provide a unit directly, such as pt.

    drawdot (22*u,3*u) withpen pencircle scaled 5pt ;



## Known problems

- The arrow head in HTML is done using <marker> element. And for SVG 1.1
  the limitation is that its coloring and filling is not changed to
  the line element it attaches to. It is a browser problem and currently
  there is no fix.

- For SVG we *had* to make a choice to either show a plaintext, using <text>
  element or math text  using <svg> element, there is currently a lot of grief 
  as prevously we were freely mixing normal and math text as this was not 
  a problem for MetaPost, as it supports TeX text between btex and etex
  constructs. But for us following is a problem for SVG.
  
      label {See the angle ``\alpha``} (1,2)

- The generation of font-size is always done to convert a user unit
  to pt.

- It has been observed that for MP generation if the symbol were part
  of a math such as between \( and \), then it appears smaller than
  those that are not.

- The text-aligmnents are default to 'urt' and not 'centered', thus
  we need to ensure previous auto choices of text alignment which
  asssumes the center are now being shown as 'urt' and thus we need
  to make some adjustments where necessary.

- Need to make the aligment of objects consistant. By default labels
  are aligned at the center, crate and basket and apples are aligned at the
  center, but rect, trapezoid, rhombus, and parallelgram are aligned
  at the lower left corner. Need to change is so that besides text,
  other objects are by default aligned at the lower-left corner.

- For shapes such as apple, brick and radical cannot be scaled, although
  the radical has a configuration option. We need to create a scale factor
  for each of the shape. Even though each shape has a natural size, but
  we should also be able to specify a scaling factor to allow it to enlarge
  or shrink beyond its natural size.

- When mathtext is generated for the label, since the font size is always set 
  at 12-pt, which makes the text look big. The problem has been corrected
  by shrinking the size of the SVG.    

- It is not currently possible to specify line segments in a drawline method.
  Such that it allows a line to be terminated and the next point will start
  a new line segment. The proposed method is to repurpose the () operator
  to insert a 'nan' point. This point will be interpreted to mean the interruption
  of the current line segment, and the next point will be the start of a new
  line segment. 


