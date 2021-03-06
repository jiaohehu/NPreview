MetaPost & MetaFun

# MetaPost

MetaPost refers to both a programming language and the interpreter of the
MetaPost programming language. Both are derived from Donald Knuth's Metafont
language and interpreter. MetaPost produces vector graphic diagrams from a
geometric/algebraic description. The language shares Metafont's declarative
syntax for manipulating lines, curves, points and geometric transformations.
However,

  beginfig(1) ;
  fill fullcircle scaled 5cm withcolor red ; % a graphic
  endfig ;
  end .

Don’t forget the semi--colons that end the statements. If the file is saved as
yourfile.mp, then the file can be processed. Before we process this file, we
first need to load some basic METAPOST definitions, because the built in
repertoire of commands is rather limited. Such a set is called a format. The
standard format is called metapost but we will use a more extensive set of
macros metafun. In the past such a set was converted into a mem file and
running the above file was done with:

  mpost --mem=metafun.mem yourfile

However, this is no longer the case and macros need to be loaded at startup as
follows:

  mpost --ini metafun.mpii yourfile.mp

Watch the suffix mpii: this refers to the stand alone, the one that doesn’t
rely on LUATEX.  After the run the results are available in yourfile.1 and can
be viewed with GHOSTSCRIPT. You don’t need to close the file so reprocessing is
very convenient.

- Metafont is set up to produce fonts, in the form of image files (in .gf
format) with associated font metric files (in .tfm format), whereas MetaPost
produces EPS, SVG, or PNG files

- The output of Metafont consists of the fonts at a fixed resolution in a
raster-based format, whereas MetaPost's output is vector-based graphics (lines,
Bézier curves)

- Metafont output is monochrome, whereas MetaPost uses RGB or CMYK colors.

- The MetaPost language can include text labels on the diagrams, either strings
from a specified font, or anything else that can be typeset with TeX.

- Starting with version 1.8, Metapost allows floating-point arithmetic with 64
bits (default: 32 bit fixed-point arithmetic)

Many of the limitations of MetaPost derive from features of Metafont. For
instance, MetaPost does not support all features of PostScript. Most notably,
paths can have only one segment (so that regions are simply connected), and
regions can be filled only with uniform colours. PostScript level 1 supports
tiled patterns and PostScript 3 supports Gouraud shading.

MetaPost is distributed with many distributions of the TeX and Metafont
framework, for example, it is included in the MiKTeX and the TeX Live
distributions.

The encapsulated postscript produced by Metapost can be included in LaTeX,
ConTeXt, and TeX documents via standard graphics inclusion commands. The
encapsulated postscript output can also be used with the PDFTeX engine, thus
directly giving PDF. This ability is implemented in ConTeXt and in the LaTeX
graphics package, and can be used from plain TeX via the supp-pdf.tex macro
file.

Prior to the introduction of ConTeXt and LuaTeX, MetaPost is only to serve as
an indenpendent interpreter that is to process as the input a MetaPost document
and produce as the output a separate image file that would then to be included
with the document, possibly using \includegraphics command. However, with the
introduction of ConTeXt and LuaTeX, it is possible to embed    MetaPost source
code directly within a document file, and then compile the document using the
same command as to compile a normal ConTeXt or LuaTeX file, and then have the
resulting image appearing as part of the document. It is also possible to
typeset the image as a "float".

  \starttext
    \startMPpage
      fill fullcircle scaled 5cm withcolor red ;
    \stopMPpage
    \startMPpage
      fill unitsquare scaled 5cm withcolor red ;
    \stopMPpage
  \stoptext

If the file is saved as yourfile.tex, then you can produce a PDF file with:

  context yourfile

The previous call will use LUATEX and CONTEXT MKIV to produce a file with two
pages using the built in METAPOST library with METAFUN. When you use this route
you will automatically get the integrated text support shown in this manual,
including OPENTYPE support. If one page is enough, you can also say:

Inclusion of MetaPost code in LaTeX is also possible by using LaTeX-packages,
for example gmp or mpgraphics.

# MetaFun

MetaFun is the "improved" version of the original MetaPost. It is written by
Hans Hagen, that is based of the original MetaPost, who is primarily written by
John Hobby. "MetaFun" tries to add additional features that are previous absent
from MetaPost, and at the same time modify it so that it will work with ConTeXt
to provide graphing capability, just as MetaPost has done to TeX.
At the mean time, MetaFun has maintained backward compatibility with MetaPost,
even though it has introduced some additional syntax.

In a nutshell, if LuaTeX is to be used, then one should stick strictly with
the syntax of MetaPost. If ConTeXt is to be used, then one can switch over
to some of the new syntax introduced by MetaFun.

Following is two different syntax for typesetting a label text inside a
ConTeXt document:

+ MetaPost:

  label (btex {\switchtobodyfont[12pt]0} etex, (4*u,7.5*u)) ;

+ MetaFun:

  draw textext("{\switchtobodyfont[12pt]0}") shifted (4*u,7.5*u) ;

The first one is the MetaPost syntax, and the second one is the MetaFun
syntax. Notice that the text to be processed is a ConText native
text that should also work directly inside a ConTeXt document. If the
same "label" command is to be used inside a LuaLaTeX document, then
the string passed to the "label" command would have to be a one
that is compatible with LuaLaTeX, such as the following:

+ MetaPost:

  label (btex {\fontsize{12pt}{12pt}\selectfont{}0} etex, (4*u,7.5*u)) ;

The \fontsize{12pt}{12pt}\selectfont command is defined by the 
"anyfont" package that must also be included within that LuaLaLaTeX
document.

Following are additional commands that are introduced by 
MetaFun:

+ bbwidth(Page);
+ bbheight(Page);

These two command is to return the width and/or height of the
bounding box of the picture being drawn. For \startMPpage, after
the "StartPage" command, the entire picture is to be point to by
the "Page" varibale. This can be compared to the "currentpicture"
variable if \startMPcode is to be used instead.

However, the bbwidth(Page) would return the width of the page
before any drawing command is put in place. In the case
\startMPcode, the picture would probably expand or shink based on
the "draw" command that is performed. The "draw" is capable of
"expanding" the picture if it is to draw "outside" of the
bounding box of the existing picture; in this case the new
bounding box is recomputed to be just big enough to "include" the
area that is affected by the drawing. 

The \startMPpage is one to create an entire page that is to be
filled with vectors of graphics. Following is a simple example:

  \definecolor [Top] [h=a5b291]
  \definecolor [Bottom] [h=b7c1a7]
  \definecolor [TitleColor] [h=96433a]
  \starttext
  \startMPpage
  StartPage;
  numeric w; w := bbwidth(Page);
  numeric h; h := bbheight(Page);
  fill (unitsquare xyscaled (w,.0.8h)) withcolor \MPcolor{Bottom}
  fill (unitsquare xyscaled (w,.0.2h)) withcolor \MPcolor{Top}
  draw (0,.8h) -- (w,.8h) withpen pensquare scaled 2pt withcolor white;
  StopPage;
  \stopMPpage
  \stoptext

This block of MetaFun code is to create an entire page that is to
be filled with two colors and a line drawn at the border of the
two colors, with the top color taking up 20-percent of the
height, and the bottom color taking up 80-percent of the height,
and with a width that spans the entire width of the page. Of
course, the name of the color such as "Bottom" and "Top" must be
enclosed using the command \MPcolor in order to convert the name
of the color, which is defined within the CONTEX scope, into a
color within the METAFUN scope. Note that METAPOST/METAFUN only
defines two colors, "black" and "white". These are the only two
color names that can be used within the METAPOST/METAFUN
directly. This is also why the last "draw" command is able to use the 
color name "white" without having to go through the \MPcolor
command.

+ textext() 

The textext() function constructs a new path object that is based
on the choice of the font and the text string composition.
With the introduction of this function, it is possible to 
call up the "draw" command, which expects a path specification.

  draw textext("{\switchtobodyfont[12pt]0}") shifted (4*u,7.5*u) ;

Without going through textext() function, the process of drawing
a text label must be done through the "label" command such as 
follows.

  label (btex {\switchtobodyfont[12pt]0} etex, (4*u,7.5*u)) ;

The "alignment" option of the "label" command is to be specified
by the "alignment" option of the "textext()" function as follows:

  label.rt (btex {\switchtobodyfont[12pt]0} etex, (4*u,7.5*u)) ;
  draw textext.rt("{\switchtobodyfont[12pt]0}") shifted (4*u,7.5*u) ;



