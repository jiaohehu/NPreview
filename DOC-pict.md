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
generated. Note that the choice of "width" option to 
each image to be a percentage
of the total page width (\textwidth) are calculated 
based on the settings of the 'distance' parameter
and the total number of images. In essense, the 'distance'
parameter specifies the percentage of total page width
that is reserved to be set for the inter-image gap.
Thus, each image width can be calculated based on this
value and the total number images.

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
their preceeding paragraph when two column layout is enabled,
and in doing so, leaving a "gap" between its preceeding paragraph 
and itself. This has been observed whether it is to moving
the image from the left-hand column to the next or from the right-hand
side column to the left-hand column of the following page.

Another interesting fact about "float" figure is that LATEX
allows for a "wide" float that covers the length of two columns
when two column layout mode is enabled for the entire document,
thus making it possible to still have table or image that requires
the width of the whole page to be laid out nicely, while at the
same time still manage the arrange for the normal text to be
shown in a two column setting.

However, it is still yet to have this same feature available on
CONTEX. As of writing it wasn't available.

To specify the "wide" float for LATEX, it is the star-version
of the "float", for exmple:

  \begin{Figure*}[ht]
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

The "Figure" is a custom float that is defined by NITRILE. 
It places the definition of "Figure" at the preamble of each
generated LATEX document. There are other custom floats, namely
"Table", "Program".


