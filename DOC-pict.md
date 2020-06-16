# The PICT block

This block is designed to preset a "float" picture.

Images can be arranged in rows and columns, and the total number
of images in a single row can vary---thus it is possible to have
three images to be arranged side-by-side on the top row and two
images to be arranged side-by-side on the bottom row.

  @  ```image
     image-gimp.jpg One 
     image-gimp.jpg Two 
     image-gimp.jpg Three
     ---
     image-gimp.jpg Four 
     image-gimp.jpg Five
     ```

For CONTEX translation the following output are likely to be
generated. Note that the choice of "width" to be a percentage
of the total page width (\textwidth) are harded coded and
fine tuned so that the total row width does not go beyond
the \textwidth, as the \startcombination command provided
by CONTEX adds an unknown length of inter-margin between
images. Thus, it is hard-coded so that when there are three
images asked to be laid out then each image is set to
have 29% of the total page width. And when there are a
total of two images to be placed in a row each image is to
be shrinked to be 47% of the page width.
When there is only a single image it is set to 100%.

  \placefloat
  [here]
  []
  {}
  {%
  {\centeraligned{\startcombination[3*1]
  {\externalfigure[image-gimp.jpg][width=0.29\textwidth]} {{\tfsm{}One}}
  {\externalfigure[image-gimp.jpg][width=0.29\textwidth]} {{\tfsm{}Two}}
  {\externalfigure[image-gimp.jpg][width=0.29\textwidth]} {{\tfsm{}Three}}
  \stopcombination}}
  {\centeraligned{\startcombination[2*1]
  {\externalfigure[image-gimp.jpg][width=0.47\textwidth]} {{\tfsm{}Four}}
  {\externalfigure[image-gimp.jpg][width=0.47\textwidth]} {{\tfsm{}Five}}
  \stopcombination}}
  }

For LATEX generation the following likely translations are generated:

  \begin{Figure}[ht]
  \centering
  \begin{tabulary}{\linewidth}{@{}CCC@{}}
  \includegraphics[width=\linewidth]{image-gimp.jpg} & \includegraphics[width=\linewidth]{image-gimp.jpg} & \includegraphics[width=\linewidth]{image-gimp.jpg}
  \\
  {\small{}One} & {\small{}Two} & {\small{}Three}
  \\
  \end{tabulary}
  \begin{tabulary}{\linewidth}{@{}CC@{}}
  \includegraphics[width=\linewidth]{image-gimp.jpg} & \includegraphics[width=\linewidth]{image-gimp.jpg}
  \\
  {\small{}Four} & {\small{}Five}
  \\
  \end{tabulary}
  \end{Figure}

The idea is to *always* place the picture into a "float",
regardless if there has been a caption and/or label. In the event
where there isn't a label or caption, the image will be a "float"
but without the caption, making it hard to see it being a float.
However, making it "float" will enable the layout engine to
freely move it to a different location if it happen to be in a
tight space. For CONTEX and LATEX it has been observed with
relative confidence that the layout engine pretty honors the
"here" location for as much as possible. 

However, LATEX has been good at "moving" the "float" to the next
column or page in two-column mode, when the current column has
been shown to not have enough space left. On the other hand
CONTEX has been shown to be more "loyal" in keep image after
their preceeding paragraph, and in doing so, leaving a "hole"
between its preceeding paragraph and itself, after it has
been moved to the next column or page.


