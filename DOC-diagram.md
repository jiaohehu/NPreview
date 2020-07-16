# Diagram

A diagram block is to generate a diagram with vector based figures, made up
with vector based components as lines, circles, rectangles, arrows, dots, etc.
The goal of using a diagram block versus using an raster based image such as
PNG or JPEG is that a vector based diagram provides much better resolution
especially when the diagram is printed on a piece of paper.

A diagram block is to be translated into an inline MetaPost block between
`\begin{mplibcode}` and `\end{mplibcode}`. This environment is supported by the
`luamplib` LATEX package.

    \usepackage{luamplib}



# An example diagram

Following is an example of a diagram block.


    @ ```diagram
    viewport 32 20

    % variables
    a := (1,1) -- (5,5) -- (5,1) -- (1,1) ()
    b := (1,1) .. (5,5) .. (5,1) .. (1,1) ()

    % draw    
    draw  *a

    % circles

    set fillcolor pink
    circle    {1} (16,1)
    chord     {1,0,135} (20,1)
    arc       {1,0,135} (20,3)
    cseg      {1,0,135} (20,5)

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
    draw     (28,4)--(31,4)
    a/b := *
    draw     (28,4)--(28,7)
    /c := *
    drawanglearc.sq *a *b *c

    % 45-degree angle
    draw     <0,-4> (28,4)--(31,4)
    a/b := *
    draw     <0,-4> (28,4)--(31,7)
    /c := *
    drawanglearc *a *b *c

    % draw     will fill      
    ff := (28,8)--(31,8)--(31,9)--(28,9)--cycle
    fill {linesize:2;fillcolor:orange}  *ff
    reset

    % label
    label.rt  "``C_0``" (5,5)
    label.rt  "``B_0``" (5,1)
    label.top "``A_0``" (1,1)

    % dots
    dot (1,1) \
            (2,2) (3,3) \
            (4,4) (5,5)

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

    % updnprotractor
    updnprotractor (10,15)

    % radical
    radical (1,17)

    % math
    label.ctr { ``\sqrt{2}`` } (18,18)
    ```

# The unit length and grid lines

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



# Drawing instructions

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
the dot is '4pt', but can be changed by the *dotsize* setting, i.e., to set it
to a string of '5pt'.  Following example draw three dots at location of (1,1),
(2,2) and (3,3) where each dot is at a size of "5pt".

    set dotsize 5pt
    dot (1,1) (2,2) (3,3)

The color of the dot is by default set to black, unless changed by the
*dot* setting, which describes a color such as "orange".

    set dot orange
    set dotsize 5pt
    dot (1,1) (2,2) (3,3)

The `tick` instruction is designed to draw ticks along a number line, or x-axis
or y-axis.  Specifically, the `tick.top` instruction draws a vertical tick
above the point.  The `tick.bot` instruction draws a vertical tick below the
point The `tick.rt ` instruction draws a horizontal tick to the right hand side
of the point The `tick.lft` instruction draws a horizontal tick to the left
hand side of the point

The protrusion of the tick is by default set to 0.33 grid unit. This is length
of the line it will protrude away from the point. It is controlled by the
*tickprotrude* setting. It is always in the grid unit length.  The default is
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



# The drawing parameters

Following is a list of all drawing parameters

* refx                Set an offset number to offset coordinate in x-axis.  
                      Ex. if refx is set to 4 a source coordinate of        
                      (2,0) will map to (6,0).                              
                      Must be set to a number zero or greater, and no more  
                      than the total number of grids in the horizontal.     

* refy                Same as refx bug does it for its y-coordinate.        
                      Must be set to a number zero or greater, and no more  
                      than the total number of grids in the vertical.       

* refsx               Set a scalar number to scale coordinate in x-axis.    
                      Ex. if refx is set to 6 and refsx      is set to 3,   
                      For a coord that is specified as (2,0),               
                      it is first scaled three times which puts it at (6,0)
                      before being shifted 6 grids to the right which puts  
                      it at (12,0), which is its final displayed position.  
                      Must be set to a number between 0.1 and 10.           

* refsy               Same as refsx      but does it in y-axis.             

* fontcolor           Set to a string that describes the color,
                      such as        
                      'green', 'red', 'blue', 'black', and 'white'.         
                      Note that expressing using RGB such as "rgb(100,200,50)"
                      is only supported for SVG generation.

* fontsize            Set to a font size specification such as '14pt'.      
                      Used when drawing text labels.                        

* linedashed          Set a string that is either 'evenly', or 'withdots'   
                      that is to control the appearances of the dashes.     
                      Default is empty, that a solid line is to be drawn.   

* linecolor           Set the color used when drawing lines, such as "red".
                      It is used by the drawline instruction.               

* linesize            Set the thickness of the line when drawing lines,     
                      such as "4pt".                                        
                      It is used when drawing lines.                        

* fillcolor           Set the color used when filling an area, i.e., "red".
                      It is used when drawing an area.                      

* dotcolor            Set the color used for drawing dots, such as "red".   
                      It is used by the `dot` instruction.                

* dotsize             Configure the size of the dot to be drawn, such as    
                      "8pt". Used by the `dot` instruction. The default     
                      is "5" user unit.                                     

* tickcolor           Set the color used for drawing ticks, i.e.,  "red".   
                      It is used by the `tick`  instruction.                
                      The default is empty, which MetaPost assume as black.

* ticksize            Configure the thickness of the line for ticks.        
                      i.e, "2pt". The default is "1pt".                     
                      It is used by the `tick` instruction.                 

* tickprotrude        Configure how far away the end point is from the      
                      axis line. The default is 0.33 grid unit.             
                      The maximum is "1.0", the minimum is "0.1".           




# Path expression       

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
points in a few more different ways. For example, it offers a "relative point"
syntax that allows you to specify a point that is relative to the point before
it.

    a := (1,1) [v:1] [h:2] [v:-1]

This allows you to create a four point path where the first point is (1,1),
and the rest points being at (1,2), (3,2), and (3,1).
Following are all relative points.

    [l:dx,dy]
    [h:dx]
    [v:dy]
    [a:rx,ry,angle,bigarcflag,sweepflag,dx,dy]
    [c:dx1,dy1,dx2,dy2,dx,dy]
    [s:dx2,dy2,dx,dy]
    [q:dx1,dy1,dx,dy]
    [t:dx,dy]
    [angledist:angle,dist]
    [turn:angle,dist]
    [flip:dx,dy]

The [l:dx,dy] is to draw a line from the current point to the new location is
relative to the current point by dx and dy. Note that dx and dy are specified
in Cartesian coordinates, thus positive dx is towards the right, and positive
dy is towards the top.

The [h:dx] is to draw a horizontal line. The [v:dy] is to draw a vertical
line.

The [a:rx,ry,angle,bigarcflag,sweepflag,dx,dy] is to draw an arc to the end
point that is dx/dy away from the current point. The arc is assumed to trace
alone an elliptical arc with x-axis and y-axis each of which having a radius of
rx and ry. The angle is in the unit of degrees, specifying the rotation of the
ellipse if any, with position number denoting a counter-clockwise rotation. The
bigarcflag is set to 1 if the arc to be drawn are the longer of the two
between the starting point and end point. Otherwise the shorter arc is to be
drawn. The sweepflag expresses whether the shorter arc or longer is to travel
counterclockwise or clockwise from the current point to the new point: 0 =
counterclockwise, 1 = clockwise. Thus, to draw an arc from the last point to a
new point that is on its right hand side of the last point, and if the
sweepflag is set to 0, then the arc will always appear below both points.

The [c:dx1,dy1,dx2,dy2,dx,dy] is to draw a cubic Bezier curve from the current
point to the new point that is dx/dy away. The (dx1,dy1), and (dx2,dy2) are
two control points. Note that all numbers are specified relative to the
last point.

The [s:dx2,dy2,dx,dy] is to draw a cubic Bezier curve from the current point to
the new point that is dx/dy away. Only the second point of the current Bezier
curve needs to be provided. The first control point is deduced from the second
control point of the previous cubic Bezier curve operation. If the previous
operation is not a cubic Bezier curve drawing, but a quadratic Bezier curve
drawing, then the first control point of the quadratic curve is used to
deduce the first control point of the current operation. If it is neither a
cubic nor a quadrilatic, then the last point is assumed.

The [q:dx1,dy1,dx,dy] is to draw a quadrilatic Bezier curve. The dx1/dy1
is the only control point. The dx/dy is the new point. All positions
are expressed relative to the last point.

The [t:dx,dy] is to draw a quadratic Bezier curve with the first control
point deduced from a previous Bezier curve operation. If a previous operation
is not a Bezier curve operation, then the last point is assumed to be control
point, in which case the drawn curve will be straight line.

The [angledist:1,30] allows you to construct a new point that is to travel at a
angle of 30 degrees counterclockwise from due east for 1 unit length, starting
from the current point.

The [turn:30,1] is to create a new point that is equivalent to making a left
turn of 30 degrees from the direction you have arrived at the current point, and
then travel for one more unit length. If it is to make a right turn, then set
the angle to a negative number.

The [flip:5,5] is to construct a new point that is the mirror image of the
current point. The current point in this case is five unit distance to the
right and towards the top of the last point.  The mirror is the line segment
that is made up by the current point and the point before that. This operations
allows you to figure out where an existing point will land as if you were
folding a paper along an existing line that is traveled between the last two
points.

Path expression can also include "offsets". An offset is expressed
as <x,y>. The presence of them will not cause a real points to be inserted
into the path. Rather, it serves to provide an "offset" such that all
future points will be computed as relative to this offset.
For example, let's suppose we have the following two draw line program.

    drawline (10,0) (15,0)
    drawline (10,0) (10,5)

However, by using "offsets" we can rewrite them as follows.

    drawline <10,0> (0,0) (5,0)
    drawline <10,0> (0,0) (0,5)

Here, <10,0> are considered an offset. An offset <10,0> is to set it so that the
all future points will be considered an offset to the point that is (10,0).
Thus, the point of (0,0) is considered as (10,0), and (5,0) is considered
(15,0). The offset always appears between a set of angle brackets. The first
number is the offset in the horizontal direction, and the second one in vertical
direction.

The offset is only going to be valid for the current path, and it only
takes affect after it is encountered, and will only affect the points
that follow it. Thus, if you have placed an offset in the middle of two
points, such as the following, then the first point is to be considered
as (0,0) while the second one as (15,0).

    drawline (0,0) <10,0> (5,0)

Offsets are also accumulative. Thus, if two offset appears in a path expression,
then the second offset is considered to be offset to the first. This allows you
to construct more points simply by moving offsets. For example, you can
construct a path with four points (11,0), (12,0), (13,0) and (14,0) as follows.

    drawline <11,0> (0,0) <1,0> (0,0) <1,0> (0,0) <1,0> (0,0)

The 'cycle' point, when encountered, will introduce two new points to the path:
a duplicate point that is the same as the first point, and an additional 'cycle'
point.  The 'cycle' point can be compared to a 'z' operator of a SVG d
attribute.  For this reason, when a 'cycle' point is encountered, all addition
points after the cycle point are ignored.

    drawline (0,0) (1,2) (3,4) cycle

A 'move' point allows an existing path to be broken into multiple line
segment. It always takes the form of @(x,y).

    drawline (0,0) (2,3) @(4,5) (6,7)

In the following example there will be two distinct polylines: one
goes from (0,0) to (2,3) and the other goes from (4,5) to (6,7).

When generating MetaPost output, the entire path will be broken down into two
separate "draw" commands.  For SVG, two <path> elements will be generated. Note
that a "move" point will still be affected by the current settings of the
"offset" as all the other coordinate points in the path expression.


# Path functions        

Note that for a path function all its arguments must be either a path variable
or a number. Coordinate list is not valid. In the following examples all
letters a, b, c are path variables.

The `$midpoint()` function returns the mid point of the first two points in a
path expression if a single argument is given.  Following returns a path with a
single point: (1.5,2), which is the mid point of (1,1) and (2,3).

    a := (1,1) (2,3)
    b := $midpoint(a)

Note that only the first two points of a path is used. The other points
are ignored. Thus if path a has three points, then the third point
is simply ignored.

If two arguments are given, it does a linear interpolation alone the
line segment of the first two points, and return a point that corresponds
to the percentage of the path traveled from the first point to the second.
The second argument is an floating point number between 0-1.
For example, if 0.5 is given as the second parameters, it should return the
same path as that with a single argument. Thus, following example will return
the same result as the one before.

    a := (1,1) (2,3)
    b := $midpoint(a,0.5)

Following will return the a point that is one-third the way from the first
point to the second point.

    a := (1,1) (2,3)
    b := $midpoint(a,0.333333)

The `$shiftpoints()` function is always needed to be provided with three
arguments. The first argument is always interpreted as a path variable. The
second and the third arguments are to be interpreted as expressing length in
grid unit. This function is to return a new path with exact the same number of
points, except for that all the points will have been shifted by the number of
grid units specified in the argument. For example, following would have shifted
all the points in the original path one position to the left and two positions
up.

    b := $shiftpoints(a,-1,2)

The `$scatterpoints()`  function is to create new path with the number of
points evenly distributed beteen the two end points. In the previous example
there will be 10 points created in a path such that the first point is (1,0),
and the last point is (10,0), and the rest of the points will be spaced evenly
between the first and the last.

    a := $scatterpoints(1,0,10,0,10)

The `$lineintersect()` Returns new a path that contains a single point which is
the point at which the two lines intersect. The first line is described by the
symbol 'a', which must have at least two points. The second line is described
by the symbol 'b', which must have at least two points. Only the first two
points of 'a' and 'b' are considered. The rest of the points of 'a' and 'b' are
ignored.

    a := $lineintersect(a,b)  

Note that the returned point might have Infinity or NaN due to the nature of
line parallelness.  In the following example the path variable 'c' will hold
one point: (2,2)

    a := (0,2) (4,2)
    b := (2,0) (2,6)
    c := $lineintersect(a,b)


The `$linecircleintersect()` function returns new a path that contains two
points for the line and circle intersection.  In the following diagram the pts
variable 'pts' will hold two points: (6,2) and (4,2).

    a := (2,2) (6,2)
    c := (5,3)
    pts := $linecircleintersect(a,c,1.4142)



# Specifying the color for MetaPost

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


# The line size or dot size unit

Note that for units such as line width, dot size, etc, is
maintained internally by Diagram as the SVG user unit. One user
unit is exactly 1/96 of an inch.  Following is the conversion of
SVG units.

    1in = 96px
    1in = 72pt
    1in = 2.54cm

It seems that MetaPost allows for a line length or dot size to be
expressed without a specific unit attached to it. For example, you
can ask to draw a dot by MetaPost with the following command.
The "withpen pencircle scaled 5" is part of a configuration to
the "dot" command that is to tell it to use a pen size of 5.
Note that the size of 5 is interpreted as the size of the pen,
therefore, the diameter of the dot as the pen is a circle pen.

    dot (22*u,3*u) withpen pencircle scaled 5 ;

You can also provide a unit directly, such as pt.

    dot (22*u,3*u) withpen pencircle scaled 5pt ;



# The Linecap draw parameter

The linecap attribute is defines the shape to be used at the end
of open subpaths when they are stroked. The SVG has an attribute
that can used for <line> element. The available values are:
'butt', 'round', and 'square'. The default value is 'butt'.


# The cartesian command

- cartesian.setup xorigin yorigin gridrange
- cartesian.xaxis xmin xmax   
- cartesian.yaxis ymin ymax   
- cartesian.ytick y1 y2 y3 ...
- cartesian.xtick x1 x2 x3 ...
- cartesian.yplot {f:P} x1 x2 x3 ...
- cartesian.xplot {f:P} y1 y2 y3 ...
- cartesian.dot x1 y1 x2 y2 x3 y3 ...
- cartesian.line x1 y1 x2 y2 x3 y3 ...
- cartesian.arrow x1 y1 x2 y2 x3 y3 ...
- cartesian.text.rt x1 y1 x2 y2 x3 y3 ...
- cartesian.ellipse x y Rx Ry Phi
- cartesian.arc x y R startAngle stopAngle

The `cartesian` command is used to draw plots, curves, axis,
ticks that are related to a single Cartesian coordinate.  It is a
composite command that includes many sub-commands. All subcommands must follow the
word 'cartesian' after a dot symbol. The subcommand itself
can also have its own option, such as 'cartesian.text.rt'.

The `setup` command would set up a Cartesian coordate to be used.
The first two arguments defines the low left hand corner where the origin of the cartesian
coordinates will appear inside the Diagram. It is specified in grid coordintes.
For example, if they are passed as 2 and 3, then the origin
of the Cartesian coordinates will appear at the location of (2,3) 
of the Diagram.

  cartesian.setup 2 3 0.5 

The third argument can be omitted. If provided, it states the how to interpret
the input range of the Cartesian coordinates. For example, when 0.5 is passed,
it states that each grid unit of the Diagram is to be interpreted as expressing
an input range of 0.5 for the Cartesian coordinates, or that 2 grid units will
be used for each length of 1 of the input range of the Cartesian coordinates.
This means that if we were to plot a point of (1,1) of the Cartesian
coordinates the dot will appear at the location  (2,3) + (2,2) = (4,5) inside
the Diagram, where (2,3) is the location of the origin, and (2,2) is where
the point is relative to the origin.

The `cartesian.xaxis` command is to draw the x-axis. The only two parameters
passed to it is the lower and upper range that this axis entails.  Similarly,
the `cartesian.yaxis` command draws the y-axis with similar parameter
requirements.

  cartesian.xaxis -0.75 5.6
  cartesian.yaxis -0.75 4.5

The `cartesian.xtick` is used to draw ticks as well as labels on
the x-axis of the coordinate. The list of arguments passed to
this command is a list of location of these ticks on the axis.
For example, if passed as "1 2 3" then the ticks will appear
where (1,0), (2,0), and (3,0) points are. For each tick, a label
string will also appear unerneath that tick.  Similarly, the
`cartesian.ytick` command does the same thing except for that it
is for the y-axis. 

  cartesian.xtick 1 2 3 4 5
  cartesian.ytick 1 2 3 4

The `cartesian dot` command shows one or more points as dots
inside the coordinate. Every two numbers are interpreted as
a pair of (x,y) coordinates.  

  cartesian.dot  -4 0 4 0 \
                 -5 0 5 0

The 'cartesian.line' and 'cartesian.arrow' commands 
are similar, except for that the first one will draw connecting
lines between all points, and the second one also adds an arrowhead
at the very end of the line.

  cartesian.line  -4 0 4 0 \
                  -5 0 5 0
  cartesian.arrow -4 0 4 0 \
                  -5 0 5 0

The 'cartesian.yplot; is similar to 'cartesian.dot', in
that it generates a series of dots. However, the coordinates
of dots are based on the result of evaluting a function 
that must be provided via the {f:P} option and the 'P'
expresses the name of a scalar function. 

  def P(x) = pow(x,2)
  cartesian.yplot {f:P} -2 2 100

The name of the function could be arbitrary.  However, it must be specified by
the "f" member of the option.  The function must have been previously defined
by a 'def' command. The first two arguments expresses the lower and upper bound
of the input range, and the third argument specifies the total number of
intervals within that range. For example, if 100 is provided, then the range
between -2 and 2, which is 4, is to be subdivided into a total of 100
intervals, with each interval of 4/100 in length. Note that the exact number of
points will be exactly one more than the total number of intervals; so there
would be exactly 101 points for the previous example.  If the last argument is
not specified, then the total number of segments will be automatically computed
such that for each grid within the Diagram there will be exactly 10 intervals.

The 'cartesian.xplot' is similar except for that the input arguments expresses
a range of values as the y-coordinates of the points, and the funtion generates
the corresponding x-coordinates.

The `cartesian.text` command draws a text at the location of the cartesian
coord. The text itself is expressed via the quotation marks that must proceed
the any option and all scalar values.  Following example draw texts at location
(-5,0), (-5,1) and (-5,2) of the Cartesian coordinates, and at each point the
text will be "P(0)", "P(1)", and "P(2)". The text is to appear at the bottom of
each point.

  cartesian.text.bot "P(0)\\P(1)\\P(2)" -5 0 -5 1 -5 2

The 'cartesian.ellipse' will draw an ellipse centered at the
location. There can only be one ellipse to be drawn, and the
signature of the arguments are:

  cartesian.a ellipse x y Rx Ry Phi

The 'x' and 'y' are coodinates for the center point of the ellipse. Each of the
'Rx' and 'Ry' is the semi-major or semi-minor axis in horizontal or vertical
direction. 'Phi' is the measurement of the angle rotation of the entire ellipse
around the center.  If it is a counter-clockwise rotation. It is in degrees.

The "cartesian.arc" command will draw an arc with the given center, radius,
start and stop angle. The signature of the function looks like the following.

  cartesian.a arc x y R startAngle stopAngle     

The 'x' and 'y' are coordinates expressing the center
of the arc. 'R' is the radius of the arc. 'startAngle'
and 'stopAngle' are the angles expressing starting angle
and stopping angle of the arc. They are both in degrees.


# The barchart compound command

The 'barchart' is another compound command that is to be used
with many subcommands. Following is a list of some 
of its subcommands.

- barchart.setup xorigin yorigin xwidth ywidth xrange yrange
- barchart.bbox 
- barchart.vbar
- barchart.ytick 
- barchart.xtext

The 'barchart.setup' command would setup the barchart and
config it. The 'xorigin' and 'yorigin' are to state
the grid coordinates where lower left hand corner is to appear in the 
Diagram. Note that this number is subject to current settings
of 'refx', 'refy', 'refsx' and 'refsy' settings.

The 'xwidth' and 'ywidth' is to state the width and height
of the bar chart measured in grid length. Thus, setting them
to '10' and '15' would have a barchart of 10 grids wide and
15 grids tall.

The 'xrange' and 'yrange' is to state the input range for the x-direction and
y-direction axes. Specifically, if the bars are going to be drawn vertically,
from bottom to top, then the 'yrange' should be stated as the highest number of
the tallest bar,and 'xrange' should be stated as the total number of bars minus
1.  For example, if we were to show five bars, that is 0.1, 0.3, 0.2, 0.4, 0.2,
then the 'yrange' should be set to 0.4, and 'xrange' should be set to 5.
Following example shows how to set up a barchart that is to be placed at
(0,0), with a width of 10, and height of 15, and with the 'xrange' set to 5
and 'yrange' set to 0.4.

  barchart.setup 0 0 10 15 5 0.4

The 'barchart.bbox' is to draw a bounding box covering the entire barchart.
It does not require any arguments.

The 'barchart.vbar' is to draw vertical bars. The arguments are the y-values
of the bar themselves. Thus, to draw the previous five bars, it will be

  barchart.vbar 0.1 0.3 0.2 0.4 0.2

The 'barchart.ytick' operation is to draw "ticks" along its y-axis on the left
hand side, and also show the label for each axis to its left hand side. Its
arguments are the location of ticks, and they should be stated in the same
input range as those of the 'vbar'. For example, if ticks were to be placed
at the location of '0.1', '0.2' and '0.3', then following command should be
issued.

  barchart.ytick 0.1 0.2 0.3

The 'barchart.xtext' is to add information at the bottom of each bar as to
express what these bars are intended for.  The text must be provided by a
set of quotation marks that must proceed all options and scalars. The scalars
express the location of vertical bars on x-axis. Thus, if the input range
has been set to 5, the first bar is to appear between 0-1, and second bar 1-2, 
and so on, thus, the center location for the first vertical bar is 0.5, and center
location for the second bar is 1.5, etc.

  barchart.xtext "P(0)\\P(1)\\P(2)" 0.5 1.5 2.5

The text will always be centered at location, and placed directly below the 
bar.


# The line, area, linearea operation

The 'line' operation would stroke a line alone the path. The 'area' operation
would fill an area enclosed by the path, and it will "close" the path if it is
not closed. The 'linearea' operation will fill the area and also stroke its
outline, and it will also "close" the path if it is not closed. For 'line' and
'linearea' operations, the lines are always visible. If 'linesize' is set to
zero then the default line width is used.  For the 'linearea' and 'area'
operation the 'fillcolor' is used; and it will be set to BLACK if it is not
set.  For 'line' and 'linearea' the line color uses 'linecolor' property. If it
is not set it defaults to BLACK.

# The arrow, revarrow, and dblarrow operation

These three operations only draw lines, similar to the 'line' operation. The
'arrow' would place an arrowhead at the ending line cap location. The
'revarrow' would place an arrowhead at the starting line cap location. The
'dblarrow' would place two arrowheads one at the beginning and the other at the
ending line cap location. The lines are always drawn, regardless of the
'linesize' setting. If 'linesize' is set to zero, the default line width for
the target platform is assumed.  The 'linecolor' setting determines the line
color as well as the color of the arrowhead.  However, due to outstanding
issues on SVG, the arrowhead <marker> element does not reflect the color
setting of the from the line to which it is attached, and will always show as
black. 

# Known problems

- The arrow head in HTML is done using <marker> element. And for SVG 1.1 the
  limitation is that its coloring and filling is not changed to the line
  element it attaches to. It is a browser problem and currently there is no
  fix.

- For SVG we *had* to make a choice to either show a plaintext, using <text>
  element or math text  using <svg> element, there is currently a lot of grief
  as prevously we were freely mixing normal and math text as this was not a
  problem for MetaPost, as it supports TeX text between btex and etex
  constructs.  However, mixing plain text and math text is an issue because
  math text is translated into SVG and plain text into <text> SVG element, and
  there is no way to correctly position the SVG text if it is to appear in the
  middle of a <text> element.

- The generation of fontsize is always done to convert a user unit to pt.

- It has been observed that for MP generation if the symbol were part of a math
  such as between \( and \), then it appears smaller than those that are not.

- The text-aligmnents are default to 'urt' and not 'centered', thus we need to
  ensure previous auto choices of text alignment which asssumes the center are
  now being shown as 'urt' and thus we need to make some adjustments where
  necessary.

- Need to make the aligment of objects consistant. By default labels are
  aligned at the center, crate and basket and apples are aligned at the center,
  but rect, trapezoid, rhombus, and parallelgram are aligned at the lower left
  corner. Need to change is so that besides text, other objects are by default
  aligned at the lower-left corner.

- For shapes such as apple, brick and radical cannot be scaled, although the
  radical has a configuration option. We need to create a scale factor for each
  of the shape. Even though each shape has a natural size, but we should also
  be able to specify a scaling factor to allow it to enlarge or shrink beyond
  its natural size.

- When mathtext is generated for the label, since the font size is always set
  at 12-pt, which makes the text look big. The problem has been corrected by
  shrinking the size of the SVG.    

- It is not currently possible to specify multiple line segments such that the
  line drawing is to terminate at one point and restart at another.  The newly
  proposed form of @(5,6) is to make it possible to "move a point" to a new
  position so that the last point becomes the "last point of a polyline" and
  the new moved point is the "first point of a new polyline".

- Note that for MetaPost translation, it is very sensitive to backslashes.
  Even for texts that exists in comments, if a backslash is encountered that is
  not followed by another backslash, it is processed as a backslash sequence
  for which, it will consume a brace which will likely cause an unmatched brace
  compile error in LATEX engine. For this reason, all texts translated as a
  comment line are also "escaped".

- The "dashed withdots" option for "drawline" will not show any visible dotted
  lines in the PDF file when linecap:=butt. The linecap:=rounded will has to be
  set in order to produce dotted-lines. Thus, currently the "set linedashed
  withdots" option is considered broken for MP generation.  Do not use it for
  now. Use "set linedashed evenly" instead.




