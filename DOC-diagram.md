% !TEX nitrile latexTwoColumnEnabled = true
# Supporting Diagram


```diagram
drawtriangle (1,1) (5,5) (5,1.5)
set text A
labeltop (6,6) 
set text ``C_0``
labelright  (5,5) 
set text ``B_0``
labelright  (5,1.5) 
set text ``A_0``
labelleft  (1,1) 
drawdot (0,0) (1,1) \
        (2,2) (3,3) \
        (4,4) (5,5) 
drawarrow (10,5) (12,6)
drawdblarrow (10,2) (12,3)
drawline (14,2) (15,3) (14,4) (15,5)
drawfullcircle (20,8) (21,8)
drawupperhalfcircle (20,6) (21,6)
drawlowerhalfcircle (20,4) (21,4)
set fontsize 14pt
set text  簡単 Triangle
label (10,1) 
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
    drawarrow
    drawdblarrow
    drawtriangle
    drawrect
    drawparallelgram
    drawupperhalfcircle
    drawlowerhalfcircle
    drawlefthalfcircle
    drawrighthalfcircle
    drawfullcircle
    drawanglearc
    drawline
    drawdot
    drawtext
    label
    labelrigh
    labelleft
    labeltop
    labelbot
    labeltopleft
    labeltopright
    labelbotleft
    labelbotright

All commands, aside from 'set' and 'save' will be accompanied by a list of
points after the command name.

    drawdot (1,1) (2,3) (4,3) (5,6) 
    drawline (1,1) (2,3) (4,3) (5,6) 
    drawfullcircle (1,1) (2,3) 
    drawrect (1,1) (2,3) 

There is no limit to how many points that are allowed for a command.  However,
each command does have requirement that a certain minimum number of points that
must be present before that command is considered meaningful. Some commands,
for example, like drawdot and drawline, would utilize all points. Other
commands, such as drawrect, or drawcircle, would only require the first two and
promptly ignores all future points.


## The set command

The set command is used to configure and also provides information that
aides or otherwise provides critical information for other commands. 
For example, the drawtext and label command uses the 'text' option
to fetch the actual text to be drawn.

Following are examples of using this command for setting the options.  

    set text  Points
    set width  29
    set height  12

The first word after the word set is recognized as the name of the option, and
it must consists of only word characters. All texts after the option name is
considered the value of the option. This allows a long text string with
spaces to be constructed without needing for any quoting.

    set text A short example

Following table presents a list of all options and provides brief descriptions
for each one of them.

``` tabl
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
|                |to be used for 'drawtext' command.                   |
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
|                |It is also used by the drawtext command.             |
|----------------|-----------------------------------------------------|
|align           |Set the alignment for the text to be drawn.          |
|                |It is used by the drawtext command.                  |
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
|curve           |To be set when drawing a curve.                      |
|                |(To be deprecated so that a more rebust way of       |
|                |specifying curves and lines can be devised)          |
|----------------|-----------------------------------------------------|
|arrow           |Set to one of the predefined strings for expressing  |
|                |that an end arrow or double arrow should be drawn    |
|                |either at the end of the path or both.               |
|                |The valid values are: "arrow" and "dblarrow"         |
|----------------|-----------------------------------------------------|
``` 



## The label command and its variants

The 'label' command shows a text label on the screen. The label text itself is
set by setting 'label' option.  The following example draw a text label on the
location that is (10,10) with the label text that is 'An example'.

    set text  An example
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

## The drawtext command

The drawtext command is designed to draw multiple text labels each one
corresponding to one of the points in the path. The label text itself must be
specified using 'set text' command. Multiple text labels are recognized by the
presence of the double-backslash in the "text" option.  Following example shows
how to draw three text labels each at the location specified.

    set text A \\ B \\ C
    drawtext (1,1) (2,2) (3,3)

The drawtext command is to utilize each one of the points in the command line.
If there isn't any text available for the given point then a string such as
"(empty)" will be shown at that location.

Each text label is also able to attach a meta information regarding how the
text label is to be position relative to the point location. The offset
information is to be attached with each label text in the form of a set of
curly brackets and a string that describes the offset.

    set text A{top} \\ B{bot} \\ C{lft}
    drawtext (1,1) (2,2) (3,3)

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
specified by the `set text` command. Following example draws two shapes:
one for the brick and one for the radical4, each one at a different
location of the path.

    set text brick \\ radical4
    drawshape (5,5) (10,5)

As of writing, following shape exists:

``` tabl
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


