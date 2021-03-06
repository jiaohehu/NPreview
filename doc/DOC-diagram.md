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

For CONTEX the MetaPost is called MetaFun, which is a variant that is based on 
MetaPost by has been modified by Hans Hagen. The syntax of MetaFun and MetaPost
are mostly compatible, but there are differences. One different is that MetaFun
supports transparent colors, while MetePost does not. In TexLive2020 distribution
the 'label' command for MetaFun requires quotation marks rather than btex and etex
for its first argument.


# An example diagram

Following is an example of a diagram block.

    @ Diagram

      viewport 32 20

      % variables
      path a = (1,1) -- (5,5) -- (5,1) -- (1,1) ()
      path b = (1,1) .. (5,5) .. (5,1) .. (1,1) ()

      % draw    
      draw  *a 
      draw  *b 

      % circles

      set fillcolor pink
      circle        {r:1} (16,1)
      circle.pie    {r:1; a1:0; a2:135} (20,1)
      circle.chord  {r:1; a1:0; a2:135} (20,3)
      circle.arc    {r:1; a1:0; a2:135} (20,5)
      circle.cseg   {r:1; a1:0; a2:135} (20,7)

      % dot
      path sq = (22,3) (23,3) (23,2) (22,2)
      dot (22,1)
      dot *sq (22,4) (23,4)
      dot.hbar  (23,1) (24,1)
      dot.vbar  (25,1) (26,1)
      dot   (1,1) \
            (2,2) (3,3) \
            (4,4) (5,5)

      % 90-degree angle
      draw     (28,4)--(31,4)
      path [a,b] = *
      draw     (28,4)--(28,7)
      path [,c] = *
      drawanglearc.sq *b *a *c

      % 45-degree angle
      draw     <0,-4> (28,4)--(31,4)
      path [a,b] = *
      draw     <0,-4> (28,4)--(31,7)
      path [,c] = *
      drawanglearc *b *a *c

      % draw     will fill      
      path ff = (28,8)--(31,8)--(31,9)--(28,9)--cycle
      draw {linesize:2;fillcolor:orange}  *ff
      reset

      % label
      label.rt  `C_0` (5,5)
      label.rt  `B_0` (5,1)
      label.top `A_0` (1,1)

      % arrow & dblarrow
      drawarrow (7,3) (9,5)
      drawdblarrow (9,3) (11,5)
      drawrevarrow (11,3) (13,5)

      % text of a different fontsize
      label.ctr " 簡単 Triangle " (10,1)

      % math
      label.ctr " ``\sqrt{2}`` " (18,18)

      %% shapes
      shape.trapezoid (2,11)
      shape.rhombus (5,11)
      shape.rect (8,11)
      shape.parallelgram (11,11)
      shape.apple (15,11)
      shape.basket (17,11)
      shape.crate (21,11)
      shape.rrect (26,11)
      shape.protractor (10,15)
      shape.updnprotractor (10,15)
      shape.radical (1,17)



# The unit length and grid lines

In Diagram, each figure is always expresses using the grid unit length. A unit
unit length is considered as a distance between two adjacent grid lines on a
graphing paper for which a length of 1 corresponds to the width of a single
grid.

In Diagram a grid is drawn as the background by default. The size of the grid
is 25 grid units length long in the horizontal direction and 10 grid unit length
long in the vertical directon. You can change that by using the 'config' command.

  config width 30  
  config height 20  

Each grid is by default 5mm in length, thus, 
a total of 25 grid units in horizontal direction will generate an image 
of 125mm in width, and 10 grid units of horizontal direction will put
the image in the height of 50mm. To set the unit to a different length,
call the 'config unit' command below.

    config unit 6

The 'config grid' command can be used to change how background grid lines are to be 
shown in the final Diagram image. By default, each grid is to be show with a 
grid line that is colored at 10% black. The color is currently not configurable.
When set the grid to 'boxed', only the outline of the image is drawn, and when set
to 'none', there is even no outline.

    config grid boxed
    config grid none   

However, for MetaPost and MetaFun generation when the grid is set to 'none' the
outline is actually drawn using a "white" color pixel.  This is because the
image that is generated are automatically expanded whenever there is contents
drawn on that image. Thus, without performing the draw of the outline does not
guarentee that the size of the image will be the size we want. However, for MetaFun
and MetaPost generation the image will be "enlarged" if contents were drawn outside
of the outline.


# The config command

The config command can be used to control the configuration
parameters for the entire Diagram. This set includes the previous
discussed viewport width and height, and the unit.

However, there are additional configuration parameters. These
parameters should be set at the beginning of the Diagram, before
any drawing commands, in order to maintain consistencies.
Changing these configuration parameters in the middle of other
drawing commands are not recommended and may result in distorted
picture.

@ Longtable

    ===
    Options         
    Default value   
    Comments        

    1fr
    1fr
    3fr

    width      
    25           
    Offset location (integer)

    height     
    10           
    Offset location (integer)

    unit       
    5            
    The width for each grid (mm)

    grid       
    ''           
    ''|'boxed'|'none'                 

    barlength  
    0.25         
    The default length of the bar (grid unit)

    dotsize    
    5            
    The default size of dot (pt)

    linesize   
    0            
    The default size for line drawing (pt), when 0 is set it uses the default line size

    linejoin
    ''
    Available values: 'bevel', 'round', 'miter'.

    linecap
    ''
    Available values: 'round', 'butt', 'rect'.

    fillcolor  
    ''            
    The default fill color, when set to empty string it implies that no filling should be performed

    opacity
    ''
    Specify the opacity of the filled area over the background; should be a number between 0-1; 1=full opaque (default), 0=full transparent (invisible)

    labeldx    
    2            
    The x-offset of label text to anchor point, SVG only (px)

    labeldy    
    2            
    The y-offset of label text to anchor point, SVG only (px)

    noderadius 
    1            
    The radius of the circle for each node. (grid unit)


# The set and reset commands

The `set` command sets the following parameters
for the current drawing environment.

    set refx <number>
    set refy <number>
    set refs <number>

Following are default values for it.

    @ Table

      -----------|-------------|---------------------------------
      Options    |Default value| Comments
      -----------|-------------|---------------------------------
      refx       |0            | Offset location (grid)
      refy       |0            | Offset location (grid)
      refs       |1            | Scale factor (scalar)
      -----------|-------------|---------------------------------

The 'refx', 'refy', and 'refs' parameters can be set at any point during a drawing.
It can be compared to a "transform" of a SVG operation. In this case, all drawings
will be scaled and/or translated. The 'refs' defines the scaling factor and 'refx'
and 'refy' defines the location to be translated to.

By default all drawings are expressed as relative to the origin, which is
(0,0), which is located at the lower-left-hand corner of the viewport.  By
setting it to a different value, it allows you to treat several drawings as a
group and then move them all at once at ease.

Note that when callign the 'set' command with a parameter, but without supplying
any additional values reset that parameter to its default value.
Thus, the second 'set' command below will reset the 'refx' parameter to its
default value, which is 0.

    set refx 10
    set refx


# The reset command

The 'reset' command reset all parameters to its default value.


# The exit command

The 'exit' command stops the processing of the rest of the instructions and of
the instruction.  It can be used to temporary avoiding some instruction to aid
debugging.

    exit


# The path  command

The 'path' command can be used to create path variables.  A path variable must
start with a upper case or lower case letters, and followed by one or more
upper case or lower case letters, or digits. Symbols and operators are
not allowed.

    path a = (1,1) -- (2,2) -- (3,4)

To reference all points in a path variable, use the asterisk followed
by the variable name. This is equivalent to a "spread" of a JavaScript.
Thus, '*a' is equivalent of taking out all points of a path. This syntax
allows a new path to be constructed based on the contents of a previous
path.

    draw *a
    path b = *a .. (5,5) .. (6,7)
    draw *b 

Typically, a path expression consists of one or more coordinates (points), and
join types. A join type can only be '--' or '..'. The '--' join type is to
express a 'lineto' operation between the last point and the next point.  A '..'
join type is to express a 'curveto' operation between the last point and the
next point. A point should always be expressed between a set of parentheses,
such as `(1,1)`, `(2,2)`, `(3,4)`, etc.  

However, Diagram also has something called 'path function'. It's main purpose
is to create new a new path based on points of existing path variables.     
In the following example a new path variable 'c' is created and is 
assigned the first point of the path 'a'.

    path c = &somepoints(a,0)

Following statement will assign the second point of path 'a' to
variable 'c'.

    path c = &somepoints(a,1)

Following statement assign the second and third point to path 'c'.

    path c = &somepoints(a,1,2)

The path command also has provision to allow for something akin to JavaScript
"array destructuring" statement, in which case individual points of a path are
assigned to different path variables at the same time by the same assignment
instruction. In the following assignment instruction path variables 'a', 'b'
and 'c' are each created and assigned three different points of the same path
that was drawn by the `draw` statement.

    path A = (1,1) (2,2) (3,4) (4,5)
    path [a,b,c] = A

The previous assignment instruction is functionally equivalent to the following
three assignment instructions using &somepoints() path function.

    path A = (1,1) (2,2) (3,4) (4,5)
    path a = &somepoints(A,0)
    path b = &somepoints(A,1)
    path c = &somepoints(A,2,3)

Each sub-variable must be separated from other sub-variables by one or more
slash character.  You can skip ahead and bypass certain points by not
including any variables in between slashes. For example, you can choose to
assign the first point to variable 'a' and the third point to variable 'b'
as follows.

    path A = (1,1) (2,2) (3,4) (4,5)
    path a//b = A

Note that the last variable gets all remaining points.  
This, variable 'b' will get the last two points, which are
(3,4) and (4,5).  However, you can choose to allow only a single point to
be assigned to the last variable by including an additional slash after
this variable.

    path A = (1,1) (2,2) (3,4) (4,5)
    path a//b/ = A

Similarly you can also add slashes at the beginning to skip first few
points.  Following example will skip the first two points and assign the
remaining two points to variable 'a'.

    path A = (1,1) (2,2) (3,4) (4,5)
    path //a = A

Following is an example of drawing dots.

    path p = (1,2) (2,3) (3,4)
    path p = (5,6) (7,8)
    dot *p1 *p2 (9,9)

For a given path variable access to individual points or a selected
few descrete range of points can also be done by the combination
of brackets, commas, and hyphen.

    path p = (1,2) (1,3) (3,4) (4,5) (5,6) (6,7)
    dot *p[0]
    dot *p[0-1]
    dot *p[0-2]
    dot *p[0,1,2]
    dot *p[0,1,2,4-5]


# The draw command

Following commands treats the input argument as path.

- draw
- drawarrow
- drawrevarrow
- drawdblarrow
- drawcontrolpoints
- drawanglearc

The 'draw' command would draw connecting lines between path points.
Typically it is straight lines, but Bezier curves are also supported.
This includes quadratic and cubic curves. The SVG arc is also supported.

    draw (0,0) -- (1,1) (2,2)

The double-hyphen operator between points indicates that it should be a
straight line between two points. However, it is assumed if two points
are detected without a connecting double-hyphen between, such as the case
of the second and third point above.  The points are typically expressed
as absolute points, but relative points can also be expressed. They 
are all in the form of [...] where a set of brackets are present.

    draw (0,0) [l:1,1] [l:1,1] 

Here the second and third points are each expressed as a distance away from its
previous point, which is to move right for one grid unit and then up for one
unit. Note that the coordinates in Diagram are always expressed in terms of
grid unit. There are other relative position syntaxes, that are shown below.

-   [l:dx,dy]
-   [h:dx]
-   [v:dy]
-   [a:rx,ry,angle,bigarcflag,sweepflag,dx,dy]
-   [c:dx1,dy1,dx2,dy2,dx,dy]
-   [s:dx2,dy2,dx,dy]
-   [q:dx1,dy1,dx,dy]
-   [t:dx,dy]
-   [angledist:angle,dist]
-   [turn:angle,dist]
-   [flip:dx,dy]

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

    draw (10,0) (15,0)
    draw (10,0) (10,5)

However, by using "offsets" we can rewrite them as follows.

    draw <10,0> (0,0) (5,0)
    draw <10,0> (0,0) (0,5)

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

    draw (0,0) <10,0> (5,0)

Offsets are also accumulative. Thus, if there are two offsets one appear after
another then the second offset is considered to be offset to the first. This
allows you to construct more points simply by moving offsets. For example, you
can construct a path with four points (11,0), (12,0), (13,0) and (14,0) as
follows.

    draw <11,0> (0,0) <1,0> (0,0) <1,0> (0,0) <1,0> (0,0)

The keyword 'cycle' denotes a special point such that the path is to be closed
and the last point should be connected to the first point using a straight line.
Note that a 'cycle' is not a physical point. It should be considered a meta data
and a notational trick that expresses the afformentioned intent. This notation
is usually a special syntax placed at the end of the long list of points.
For SVG it is the 'z', and for MetaPost/MetaFun it is the 'cycle'.

    draw (0,0) (1,2) (3,4) cycle

Note that for all 'draw' related commands, a path can be expressed such that
it contains multiple disjoint segments. For example, we can express to draw
two disjoint line in a single 'draw' command such that the first line segment
goes from (0,0) to (2,3) and the second line segment goes from (4,5) to (6,7). 
To do that, place a null point between the the (2,3) and (4,5).

    draw (0,0) (2,3) () (4,5) (6,7)

A null point is a point that is expressed a '()'. In addition, any appearances
In this case, Diagram recognizes that there is going to be two path segments,
one consisting of all points before the null point and the other consisting of 
all points after the null point.

In additional, if the 'cycle' keyword appears then it also means the 
end of the current path segment and the start of a new one. In this case no
null point needs to be specified. In the following example two path segment
is to e created, with one consisting of a triangle, and another one a line.

    draw (0,0) (2,0) (2,2) cycle (4,0) (6,2)

For MetaPost output, each path segment requires a separate "draw" command.
For SVG, a single PATH elements is sufficient; the SVG is implemented such
that a "M" operation can follow a "z". However, in our implementation 
each seprate path segment is still to be placed inside a separate PATH 
element. This is specifically designed so that those path segments that are
not "closed" will not be attempted to do a "fill" operation.

By default, the 'draw' command would stroke the path. However, if the
'fillcolor' attribute is set, then it would also fill the area enclosed by the
path. However, it does so only when the path is deemed "closed", in which case
a 'cycle' keyword must follow the last point.  If the path is not closed, it
will not be filled, even when 'fillcolor' is specified.

For SVG, when a 'fill=' attribute is specified the rendering engine will
attempt to fill the area, even when the area is not closed.  For
MetaPost/MetaFun the path will have to be closed before calling the 'fill'
MetaPost, as otherwise the compilation will complain.

The 'drawarrow', 'drawdblarrow', and 'drawrevarrow' are similar to 'draw'
except for the additional arrow head at the end of the line segment.

The 'drawcontrolpoint' is a special command that draws all the control points
detected in a given path. The control points are those present in a path
specification that are necessary to describe a Bezier curve, whether it is
cubic or quadratic.

The 'drawanglearc' is designed to draw a small arc describing the span of an
angle. The path that is given to this command is expected to describe the
angle, where the first/second/third path would have formed the first angle
where the second point serves as the vertex of the angle, and each of the first
and third point denotes a point on either side of the angle. There should be at
least three points on the path, but if there are additional points, then each
consecutive three points will be used to describe an angle for the arc to draw.
Thus, if there had been four points in the path, then the first three points
describes the first angle, and the last three points describes the second
angle.

The 'drawanglearc' can also place text next to the angle arc to show the name
of an angle.

    draw (0,6) (2,4) (4,6) (6,4) (8,6)
    drawanglearc "1\\2\\3" *


# The circle command

Following commands work to draw elements related to a circle.

- circle
- circle.pie
- circle.chord
- circle.arc
- circle.cseg

The 'circle' command is to draw a full circle centered on each one
of the points in the path given. Thus, the following example 
would have drawn three circles each centered at a different location
that is (1,1), (3,4), and (5,5).

    circle   (1,1) (3,4) [l:2,1]

Note that for all commands that are in this group, the path merely serves to
provide the location to which the shape is to appear. For all the above
commands, including 'circle', it expresses the center of the circle.

The radius of the circle is to be given by the 'r' attribute.
In the following example three circles each having a radius of 10 is
to be drawn at three different locations.

  circle {r:10} (1,1) (3,4) [l:2,1]

The rest of the commands have all something to do with a circle.  For example,
the command 'arc' is to draw part of the circle circumference.  For this to
work, additional attributes would need to be specified. In particular, the 'a1'
and 'a2' attributes each specifies an angle. In particular, the 'a1' attribute
specifies the starting angle and the 'a2' attribute specifies the stop angle.
The arc will run from the angle that is 'a1' to the one that is 'a2'.  The
angles are in the unit of degrees. The following example draws an arc that is
part of the circle circumference that runs from the 30 degree angle to the 60
degree angle.

    circle.arc {r:10; a1:30; a2:60} (1,1) (3,4) [l:2,1]

The 'pie' command is similar to 'arc' except that it also connects the two
end points of an arc to the center of the circle, forming an area.

    circle.pie {r:10; a1:30; a2:60} (1,1) (3,4) [l:2,1]

The 'chord' command would draw a straight line that connects the 
two end points of an arc.

    circle.chord {r:10; a1:30; a2:60} (1,1) (3,4) [l:2,1]

The 'cseg' draws a circular segment that expresses an a region of a circle
which is "cut off" from the rest of the circle by a chord line.
For this reason, it always expresses an area.

    circle.cseg {r:10; a1:30; a2:60} (1,1) (3,4) [l:2,1]


# Shapes

Following commands are to draw a shape. 
The shape to be drawn is specified as the "subcommand". 
Each shape has its "native" size, which is going to be different 
from shape to shape. 

-   shape.rect
-   shape.rhombus
-   shape.trapezoid
-   shape.parallelgram
-   shape.apple
-   shape.rrect
-   shape.basket
-   shape.crate
-   shape.radical
-   shape.protractor
-   shape.updnprotractor

Similar to the 'circle' command, each shape is to be drawn
at a location of the path. Thus, the following command would have 
drawn three 'rect' shape each at a different location.

    shape.rect   (1,1) (3,4) [l:2,1]

Each shape has its own native size, and depending on the shape, each
shape will be aligned differently to the location specified.
example, the 'rect' and 'rrect' will position the shape so that its
lower left hand corner aligned with the location.
However, the 'protractor' shape will position itself so that
its middle center point is aligned with the location.
Following table shows the natural size and the alignment location
of that shape.

    @ Table

      -----------------|-----------------|-----------
      Shape            |Natural size     |Alignment
      -----------------|-----------------|-----------
      rect             |1x1              |left-left
      rhombus          |1x1              |left-left
      trapezoid        |1x1              |left-left
      parallelgram     |1x1              |left-left
      apple            |1x1              |left-left
      rrect            |1x1              |left-left
      basket           |3x2              |left-left
      crate            |4x3              |left-left
      radical          |4x2(*)           |top-left
      protractor       |7x3.5            |lower-center
      updnprotractor   |7x3.5            |upper-center
      -----------------|-----------------|-----------

- (*) Note that for the radical the height is always 2, but the width
  might be changed to a differen width if the 'radicallength' attribute
  is set to a different number. The default width is 4.
  
For each shape, the 'sx' and 'sy' attribute can be used to resize
it. For example, protractor will be shrunk to half it size.

  shape.protractor {sx:0.5;sy:0.5} (0,0)


# The dot command

The 'dot' command is to draw a dot to mark the location.
Similar to the primitive command, a
single dot is to be repeated for all points on the given path. Thus, following
command will draw three dots each at three different locations of the input
path.

    dot (1,1) (3,4) [l:2,1]

The 'dot' command provide several subcommands that allows for a different
shape to be drawn instead of a circular dot.

    dot.hbar (1,1) (3,4) [l:2,1]
    dot.vbar (1,1) (3,4) [l:2,1]

For 'dot' command, the color can be specified using the 'dotcolor'.

    dot {dotcolor:orange} (1,1) (3,4) [l:2,1]

For 'hbar' and 'vbar' subcommands the 'linecolor' attribute would
have expressed the color of the lines.

    dot.hbar {linecolor:orange} (1,1) (3,4) [l:2,1]
    dot.vbar {linecolor:orange} (1,1) (3,4) [l:2,1]

The diameter of the dot can be set using the 'dotsize' attribute.

    dot {dotcolor:orange; dotsize:10} (1,1) (3,4) [l:2,1]

For 'hbar' and 'vbar' subcommands the 'linesize' attribute would hve
expressed the width of the line.

    dot.hbar {barcolor:orange; linesize:2} (1,1) (3,4) [l:2,1]
    dot.vbar {barcolor:orange; linesize:2} (1,1) (3,4) [l:2,1]

The 'dotsize' and 'linesize' are both expressed in terms of 'pt'. For 'hbar'
and 'vbar' commands, the length of the bar can be specified via the 'barlength'
attribute.  It is a number that expresses the line length in grid unit.  If not
specified, the default value is 0.25, which is one-quarter the length of a
grid, and it can be changed to a different value by the 'set barlength' command.

    dot.hbar {linecolor:orange; barlength:0.5} (1,1) (3,4) [l:2,1]
    dot.vbar {linecolor:orange; barlength:0.5} (1,1) (3,4) [l:2,1]

Here, the length of each bar is going to be about half the length of the grid.
Note that for 'vbar', it's lower end point aligns with the location, and for 
'hbar', its left end aligns with the location.


# Label text

Drawing text labels are done by using the 'label' command.    For example, the
following 'label' command will each draw a label at the given location.

    label.rt "A" (1,1)
    label.lft "B" (2,2)
    label.top "C" (3,4)

The 'label' command is designed to draw the same label at multiple
locations. For example, we can draw the same letter A three times
each at three different locations such as follows.

    label "A" (1,1) (2,2) (3,4)

Each subcommand specifies how the text is to be aligned relative to the 
locatoin. For example, the 'top' subcommand would have aligned the text
so that it appears on top of the location, centered horizontally.
When a label command is without its subcommand it defaults to 'urt', which 
basically asignes the lower left hand corner of the text with the loction.

    label.top   -  top
    label.bot   -  bottom
    label.lft   -  left    
    label.rt    -  right   
    label.ulft  -  upper left
    label.llft  -  lower left
    label.urt   -  upper right
    label.lrt   -  lower right
    label.ctr   -  centering the text

The text to be drawn must be expressed using a set of quotation marks, and they
must appear before any option and before any coordinates.  Usually a single
text is repeated in all locations. However, it is also possible to specify a
different text for each one of the locations, by separating each text with
a double-backslash, such as the following, in which case the letter "A",
"B", and "C" are each to be drawn at three different location.

    label "A\\B\\C" (1,1) (2,2) (3,4)

It is also possible to express that a math expression instead of
plain text.

    label ``A_1\\B_1\\C_1`` (1,1) (2,2) (3,4)

If all you have is something like A_0 and x^2 then a pair of
single backquates can be used so that all these patterns will be
scanned and re-formatted to be subscript and superscript.

    label `A_1\\B_1\\C_1` (1,1) (2,2) (3,4)



# Path functions        

Note that for a path function all its arguments must be either a path variable
or a number. Coordinate numbers are also allowed. 

In addition, argument lists for a path function is specified between a set
of curly braces. 

The `&midpoint` function returns the mid point of the first two points in a
path expression if a single argument is given.  Following returns a path with a
single point: (1.5,2), which is the mid point of (1,1) and (2,3).

    path a = (1,1) (2,3)
    path b = &midpoint{&a[0],&a[1]}

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

    path a = (1,1) (2,3)
    path b = &midpoint{&a[0],&a[1],0.5}

Following will return the a point that is one-third the way from the first
point to the second point.

    path a = (1,1) (2,3)
    path b = &midpoint{&a[0],&a[1],0.333333}

The ``perpoint`` method returns a new point that is perpendicular
to the given line. It operates in two different modes depending
on the arrangement of the argument.

If the third argument is a scalar, then it returns a path 
with a single point which expresses a point such that the line
segment from that point to the first point of the input line segment
is perpendicular to the input line. In the example below 
the returned point will be at (0,4).

    path a = (0,0) (2,0)
    path c = &perpoint{&a[0],&a[1],4}

If the third argument is a path with at least a single coordinate, 
then it returns a point somewhere on the input line segment (or the extension of it) 
such that the line segment of the returned point and the third point
forms a new line that is perpendicular to the
input line. In the following example the returned point is (1,0).

    path a = (0,0) (2,0)
    path c = &perpoint{&a[0],&a[1],(1,1)}


The `&shiftpoints` function is always needed to be provided with three
arguments. The first argument is always interpreted as a path variable. The
second and the third arguments are to be interpreted as expressing length in
grid unit. This function is to return a new path with exact the same number of
points, except for that all the points will have been shifted by the number of
grid units specified in the argument. For example, following would have shifted
all the points in the original path one position to the left and two positions
up.

    path b = &shiftpoints{&a,-1,2}

The `&scatterpoints()`  function is to create new path with the number of
points evenly distributed beteen the two end points. In the previous example
there will be 10 points created in a path such that the first point is (1,0),
and the last point is (10,0), and the rest of the points will be spaced evenly
between the first and the last.

    path a = &scatterpoints{1,0,10,0,10}

The `&linelineintersect()` Returns new a path that contains a single point which is
the point at which the two lines intersect. The first line is described by the
symbol 'a', which must have at least two points. The second line is described
by the symbol 'b', which must have at least two points. Only the first two
points of 'a' and 'b' are considered. The rest of the points of 'a' and 'b' are
ignored.

    path a = &linelineintersect{&a[0],&a[1],&b[0],&b[1]}

Note that the returned point might have Infinity or NaN due to the nature of
line parallelness.  In the following example the path variable 'c' will hold
one point: (2,2)

    path a = (0,2) (4,2)
    path b = (2,0) (2,6)
    path c = &linelineintersect{&a[0],&a[1],&b[0],&b[1]}


The `&linecircleintersect()` function returns new a path that contains two
points for the line and circle intersection.  In the following diagram the pts
variable 'pts' will hold two points: (6,2) and (4,2).

    path a = (2,2) (6,2)
    path c = (5,3)
    path pts = &linecircleintersect{&a[0],&a[1],&c[0],1.4142}

The `circlecircleintersect()` function would return two, one, or no points
regarding the intersection points of two circles.

    path a = (0,0)
    path b = (5,0)
    path pts = &circlecircleintersect{&a[0],&b[0],4,3};



# Special notes for MetaPost users

The color syntax is either the color name, such as "red", "green",
or RGB such as "rgb(200,100,25)".

The MetaPost code has the provision to allow for a "xcolor" provided
by the "xcolor" package, such as using the \mpcolor macro. Thus,
the MetaPost command can be set up as

    draw (1,2)--(2,3) withpen pencircle withcolor \mpcolor(gray)

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

    draw (1,2)--(2,3) withpen pencircle withcolor \mpcolor(red!80!white!20!)

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
that it generates a series of dots. Only the x-coordinates
of plotted points are provided, and the y-coordinates of
each point is calculated by the supplied function, which
must be provided by the "f" member of the option. 

    def P(x) = pow(x,2)
    cartesian.yplot {f:P} 1 2 3 4 5

In the previous example, following points will be shown:
(1,1), (2,4), (3,9), (4,16), and (5,25) as dots.
The Range expression in this case can be useful, such
as the following:

    def P(v) = pow(v,2)
    cartesian.yplot {f:P} [1:5]

The name of the function could be arbitrary.  However, it must be specified by
the "f" member of the option.  The function must have been previously defined
by a 'def' command, and must only accept one argument and return a single
scalar.

The 'cartesian.xplot' is similar except for that the input arguments expresses
a range of values as the y-coordinates of the points, and the funtion generates
the corresponding x-coordinates.

    def P(v) = sqrt(v)
    cartesian.xplot {f:P} 1 4 9 25 16 25

The `cartesian.label` command draws a text at the location of the cartesian
coord. The text itself is expressed via the quotation marks that must proceed
the any option and all scalar values.  Following example draw texts at location
(-5,0), (-5,1) and (-5,2) of the Cartesian coordinates, and at each point the
text will be "P(0)", "P(1)", and "P(2)". The text is to appear at the bottom of
each point.

    cartesian.label.bot "P(0)\\P(1)\\P(2)" -5 0 -5 1 -5 2

The 'cartesian.ellipse' will draw an ellipse centered at the
location. There can only be one ellipse to be drawn, and the
signature of the arguments are:

    cartesian.ellipse x y Rx Ry Phi

The 'x' and 'y' are coodinates for the center point of the ellipse. Each of the
'Rx' and 'Ry' is the semi-major or semi-minor axis in horizontal or vertical
direction. 'Phi' is the measurement of the angle rotation of the entire ellipse
around the center.  If it is a counter-clockwise rotation. It is in degrees.

The "cartesian.arc" command will draw an arc with the given center, radius,
start and stop angle. The signature of the function looks like the following.

    cartesian.arc x y R startAngle stopAngle     

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
one.  For example, if we were to show five bars, that is 0.1, 0.3, 0.2, 0.4, 0.2,
then the 'yrange' should be set to 0.4, and 'xrange' should be set to "5"
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


# The line, and area operation.

The 'line' operation would stroke a line alone the path. The 'area' operation
would fill an area enclosed by the path, and it only does it when the area
is considered "closed" by the path. If the area is not "closed" no area operation
takes place.

If area is to be filled, the "opacity" option is checked. If it is set, then
the opacity is set according to the setting. A value of "1" means fully-opaque,
which is the default behavior. A value of "0" means that the area is
fully-transparent, in which case the fillcolor is not to be applied. A value of
"0.5" is half-transparent. The "opaque" can be set as a global option that
applies to all filled areas.


# The arrow, revarrow, and dblarrow operation

These three operations only draw lines, similar to the 'line' operation. The
'arrow' would place an arrowhead at the ending line cap location. The
'revarrow' would place an arrowhead at the starting line cap location. The
'dblarrow' would place two arrowheads one at the beginning and the other at the
ending line cap location. The lines are always drawn, regardless of the
'linesize' setting. If 'linesize' is set to zero, the default line width for
the target platform is assumed.  The 'linecolor' setting determines the line
color as well as the color of the arrowhead.  However, due to outstanding
issues on SVG, the arrowhead MARKER-element does not change the color
with the line it is attached to, and is always shown as black.

# Known problems

- The arrow head in HTML is done using MARKER-element. And for SVG 1.1 the
  limitation is that its coloring and filling is not changed to the line
  element it attaches to. It is a browser problem and currently there is no
  fix.

- For SVG we *had* to make a choice to either show a plaintext, using 
  TEXT-element or math text  using SVG-element, there is currently a 
  lot of grief
  as prevously we were freely mixing normal and math text as this was not a
  problem for MetaPost, as it supports TeX text between btex and etex
  constructs.  However, mixing plain text and math text is an issue because
  math text is translated into SVG and plain text into the  TEXT-element, and
  there is no way to correctly position the SVG text if it is to appear in the
  middle of a TEXT-element.

- The generation of fontsize is always done to convert a user unit to pt.

- It has been observed that for MP generation if the symbol were part of a math
  such as between `\(` and `\)`, then it appears smaller than those that are not.

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

- The "dashed withdots" option for "draw" will not show any visible dotted
  lines in the PDF file when linecap:=butt. The linecap:=rounded will has to be
  set in order to produce dotted-lines. Thus, currently the "set linedashed
  withdots" option is considered broken for MP generation.  Do not use it for
  now. Use "set linedashed evenly" instead.


# The Unicode Characters for subscript 0-9

    0   U+2080
    1   U+2081
    2   U+2082
    3   U+2083
    4   U+2084
    5   U+2085
    6   U+2086
    7   U+2087
    8   U+2088
    9   U+2089


# The Unicode Characters for superscript 0-9

    0   U+2070
    1   U+00B9
    2   U+00B2
    3   U+00B3
    4   U+2074
    5   U+2075
    6   U+2076
    7   U+2077
    8   U+2078
    9   U+2079


# The foreach loop

A foreach-loop is provided by Diagram such that a number
of commands can be repetitively executed, and each iteration
these commands would have been run under a different set
of arguments. The basic syntax is 

    foreach (a) [1,2,3,4]:
      draw (\a,\a) (0,0)

In the example, the 'draw' command will be executed exactly
four times, each of which looks like the following.

    draw (1,1) (0,0)
    draw (2,2) (0,0)
    draw (3,3) (0,0)
    draw (4,4) (0,0)

The 'foreach' command starts with the keyword 'foreach', followed
by a set of parentheses, and then followed by a set 
of brackets, and then a colon. 

The set of parentheses denotes a list of loop symbols.  Each loop
symbol must only consist of uppercase or lowercase letters, such
as a, aa, abc, zzz, etc.  Symbols such as 1, 2, a2, aa3 are not
allowed.  

The set of brackets denotes a list of sequences.  Each sequence
could be of any string, except for comma, which serves solely as
the delimiters for two neighboring sequences.

The 'foreach' command would iterate over each sequence provided
in the sequence list.  If there is only one loop symbol, such as
the one shown in the previous example, the number of
iterations equals the total number of sequences. For each
iteration, the loop body, which consists of one or more lines,
would execute exactly once, during which each command within the
body executes in the same order as it appears in the body. 

Before each iteration, the entire loop body would undergo a global
search-and-replace to substitute any occurrences of the loop
symbol with the actual sequence that is to be iterated over.
For example, if the symbol is provided as 'a',
then the global search-and-replace would replace any occurrences
of `\a` by the sequence.

If there are two loop symbols, then each iteration would 
pick up two sequences in the list, and the total number
of iterations would be reduced by half. 
In addition, the global search-and-replace would be
done for both symbols.  For example, if we were to
have the following 'foreach' loop,

    foreach (a,b) [1,2,3,4]:
      draw (\a,\a) (\b,\b)

then the 'draw' command would be executed two times,
and each of them looks like 

    draw (1,1) (2,2)
    draw (3,3) (4,4)

Note that all lines of the loop body must have an indentation
level that is greater than the indentation of the 'foreach'
command itself.  If a line is encountered that is of the same or
less of an indentation level as that of the 'foreach' command,
then that line is not considered as part of the loop body, and no
additional lines will be considered for inclusion as the loop
body.

This design also permits the inclusion of additional nested
'foreach' loop, each of which only to have its own loop body
being indented even further inwards.  The following example show
the implementation of two 'foreach' loops. The toplevel 'foreach'
loop offsers two loop symbols: 'a', and 'b', and the nested
'foreach' loop offers one loop symbol: 'c'.  Note that the last
'label.bot' command is not part of the nested 'foreach' loop, but
rather part of the toplevel 'foreach' loop.

    @ Diagram

      viewport 31 24

      foreach (a,b) [9,0.4, 19,0.5, 29,0.6] :
        set refx \a
        foreach (c) [16,4]:
          set refy \c
          draw (0,0) [h:-6] [v:6]
          draw (0,0) [q:-6,0,-6,6]
          path P0 = (0,0)
          path P1 = (-6,0)
          path P2 = (-6,6)
          dot *P0 *P1 *P2
          label.lrt "P_0" *P0
          label.llft "P_1" *P1
          label.ulft "P_2" *P2
          path line1 = *P0 *P1
          path line2 = *P1 *P2
          path m0 = &midpoint(line1,\b )
          path m1 = &midpoint(line2,\b )
          dot *m0 *m1
          draw *m0 *m1
          path line3 = *m0 *m1
          path B = &midpoint(line3,\b )
          dot *B
          label.bot "m_0" *m0
          label.lft "m_1" {dx:-.1} *m1
          label.urt "B" *B
        label.bot "t=\b" (-3,-2)


# The def command

The 'def' command allows for a new user-defined function to be  
created.

    def P(x) = pow(x,2)
    cartesian.yplot {f:P} 1 2 3

The command starts with the string 'def', followed by a function
name, followed by a set of parentheses, within which is a list
of arguments, separated by comma, followed by an equal sign,
and then addtional expression. 

The expression can contain other user-defined funtions, 
or built-in scalar function provided by Diagram. 


# Built-in scalar functions

Following are built-in functions provided by Diagram

* log     - natural log
* log10   - base-10 log
* log1p   - natural log of 1 plus the argument, the same as log(1+x)
* log2    - base-2 log
* exp     - exponential function: exp(1) = e, exp(2) = `e^2`
* pow     - power function: power(5,2) = 25
* rad     - convert degree to radian
* deg     - convert radian to degree
* cos     - cosine function, input must be given in radians
* sin     - sine function, input must be given in radians
* sqrt    - the square root function
* atan2   - returns the measurement in radians for an 
            angle formed between the vector line from the origin to 
            (x,y) and the x-axis, when called as atan2(y,x)



# Range expression

The Range expression serves to express one or more scalar
quantities.    When it appears as part of a group of scalar
arguments of a command, it serves to express one or more
scalar quantities for that command, instead of a single scalar
as is expressed by a float or an expression.  
For example, in the following command
a total of 11 scalars will be supplied to the `cartesian.yplot`
command.

    def P(x) = pow(x,2)
    cartesian.yplot {f:P} [1:10] 

A Range-expression must appears between a set of brackets,
and it consists of two or three quantities each of which separated
by a single colon.

The semantics between a Range expression for when there are two
quantities versus when there are three quantities are slightly 
different. When there are only two quantities, such as
"1:10", the quantity "1" denotes the `base`, and the quantity
"10" denotes the `limit`. The range of scalars will be
generated in such a way that the first one is always the same 
as `base`, and each additional scalars is introduced
by adding "1" to the previous quantity. The generation of
scalars stops as soon as the scalar exceeds the quantity
imposed by the `limit`.
Thus, for the example of "1:10", the scalars it
entails are 1, 2, 3, 4, 5, 6, 7, 8, 9 and 10. 

If a Range-expression is given as a set of three quantities, such
as the case of "1:3:10", then the last quantity denotes
the `limit`, and the middle quantity denotes the increment for
each additional scalar starting from the second one.
Thus, in the case of "1:3:10", the scalars it entails
are: 1, 4, 7, 10.



# The mini-diagram

The mini-diagram are commands that allow for a diagram to be generated
that would be blended with the surrounding text. Following are two
examples of such mini-diagram.

    \xyplot{20;10;0.2,0.2,0.3,0.3,0.4,0.4;3}
    \vbarchart{20;10;0.2,0.8,0.6,0.4,1.0}



# The node and edge

The 'node' and 'edge' commands are for supporting drawings commonly found in
graph theory, where there are nodes, which are basically circles with an
optional text in the middle, or edges, which are lines (straight or curved)
connecting two nodes, with an optional arrow at either end of the line.

    node.A  (1,1)
    node.B  (5,5)

The previous two commands would have drawn two nodes, one named "A",
and one named "B" at two locations where each aligns with the center
of one of the nodes.
The default radius of the node is 1, but it can be configured to another 
such as "2" by doing the following
    config noderadius 2

The "edge" command would be able to draw an edge between two nodes.

    edge.A.B  

The edge is by default a straight line.  Each end point of this line starts
from the outside of the node. However, if a curved line is desired, then the
"dir:" option can be included. This option describes an angle in degree, as to
how to start out the curved line in a new direction. A positive number
describes an additional angle to be added to the normal angle, calculated by
the direct distance between the two nodes. A positive "dir" expresses that it
should turn counter-clockwise, and a negative "dir" expresses that it should
turn clockwise. Note that the angle being discussed here refers to the angle
going from the first node to the second node.

Thus, the following example would have drawn a curved edge that is to appear on
the top-left hand side of the supposed straight line that would have been drawn
had the "dir:" option not been specified.

    edge.A.B {dir:45} 

If the edge is going to include arrow heads, then one of the following three
options should've been used

    edge.A.B {arrow;dir:45}
    edge.A.B {revarrow;dir:45}
    edge.A.B {dblarrow;dir:45}




