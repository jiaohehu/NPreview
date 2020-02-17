# Supporting Diagram


```diagram
drawtriangle (1,1) (5,5) (5,1.5)
label (6,6) A
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
set fontsize 14pt
set label 簡単 Triangle
label (10,1) 
```

## The grid lines

A grid line is always shown as part of the diagram. The total number of
horizontal grids depends on the 'width' command option.  The total number of
vertical grids depends on the 'height' command option. The color of the grid is
set to be 10 percent of the white.  Currently there is no provision 
to turn it off or change the color of the grid line.


## The command options

Command option is a set of configuration setting for certain commands.
For example, the 'label' command is to come to the 'label' option when
it needs to find out what text is to use for the label.

The syntax for setting a command option is to use the 'set' command:

    set label Points

Following table presents a list of command options and provides
brief descriptions for each one of them.

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
|refx            |Change the origin so that its x-coordinate is        |
|                |set to this number. Valid number must be between     |
|                |0 and the total number of grids in the width.        | 
|----------------|-----------------------------------------------------|
|refy            |Change the origin so that its y-coordinate is        |
|                |set to this number. Valid number must be between     |
|                |0 and the total number of grids in the height.       | 
|----------------|-----------------------------------------------------|
|fontsize        |Set to a font size specification such as '14pt'      |
|                |to be used for 'drawtext' command. Without the       |
|                |option not specific font size is to be set.          | 
|----------------|-----------------------------------------------------|
|slant           |Set to a floating point number between 0.1 and 0.9   |
|                |expressing the fraction of the width that will be    |
|                |reserved for the slanted part of the parallelgram.   | 
|                |Default is 0.3.                                      | 
|----------------|-----------------------------------------------------|
|anglearcradius  |Set to a number between 0.1 to 1 to specify the      |
|                |radius of the arc for the 'drawanglearc' command.    |
|                |Default is 0.5.                                      |
|----------------|-----------------------------------------------------|
|label           |Set to a string that would be the text label for     |
|                |display with all variants of the 'label' commands,   |
|                |including 'labelleft', 'labelright', etc.            |
|----------------|-----------------------------------------------------|
``` 


## The set command

This command is to set the command option. The first argument is the name
of the option. Whatever follows is to be considered the value of the option.
For example, you can set the text label by setting the 'label' option.

    set label An example

In such a case the string 'An example' is set to be the value of the 
command option 'label'.

## The label command and its variants

The 'label' command shows a text label on the screen. The label text itself is
set by setting 'label' option.  The following example draw a text label on the
location that is (10,10) with the label text that is 'An example'.

    set label An example
    label (10,10)


## The drawanglearc command

This command allows you to draw a small arc describing the span of an angle.
It expects three coords: the vertex of the angle, one point on the first ray,
and one on the second ray. 

    drawanglearc (0,0) (5,0) (5,5) 

This will draw an arc that shows a 45-degree angle spanning from 0 to 45 degree
where the vertex of the angle is at (0,0).  The radius of the arc is determined
by the 'anglearcradius' option.



