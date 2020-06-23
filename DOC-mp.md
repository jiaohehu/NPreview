MetaPost & MetaFun


MetaPost refers to both a programming language and the interpreter of the
MetaPost programming language. Both are derived from Donald Knuth's Metafont
language and interpreter. MetaPost produces vector graphic diagrams from a
geometric/algebraic description. The language shares Metafont's declarative
syntax for manipulating lines, curves, points and geometric transformations.
However,

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




