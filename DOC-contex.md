# CONTEX translation

# The Font size problem

  If 'bodyfontsizept' and 'diagfontsizept' are set to 
  different numbers, it has been observed that for '\sqrt{2}'
  the left-hand part of the radical symbol will be clipped.
  The problem disappear if both sizes are set to the same.


# The \bTABLE problem

The LONG table expressed by \bTABLE tends to start in a 
fresh new column if "twocolumns" option is set to true.


# The "longpadding" option

The "longpadding" option is designed to control the inner padding
for the \bTABLE. It can be set to an integer, inwhich case both
vertical and horizontal padding will be set to the same value. If 
set to two valuess, then the first one will be for the padding
top/bottom and the second one will be for the left/right padding.

# The "longvlines" option

This option controls the appearance of vertical lines for the 
LONG block. It is a list of integers. 0 is always the left-most
vertical line for the table. 1 is the vertical line to the right
of column one, 2 is the vertical line to the right of the column
two, and so on. The character asterisk instructs that all
vertical lines should appear.

# The "longhlines" option

This options controls the appearance of horizontal lines for the
\bTABLE used in LONG block. It is a list of following four letters:
t, m, b, and r. The "t" letter instructs that the top border
of the table should appear. The "m" letter instructs that the bottom
border of the header row should appear. The "b" letter instructs
that the bottom of the table should have a border. The "r" letter
instructs that borders between data rows should be drawn.

# Setting the relative font size

Font sizes can be set for the following contents:

  code: "fscode" 
  listing: "fslisting"
  tabular: "fstabular"

The first one is used the SAMP block when its style is not
set to 1 or 2. The second one is used for listing contents.
The third one is used for tabular entries, which includes all
contents of TABR, TABB, and LONG contents.  

These options must only be used to specify a "relative font size".
The only valid relative font sizes are the following:

      size            factor
      ----------------------------
      xxxsm           0.5
      xxsm            0.7
      xsm             0.8
      sm              0.9
      (empty)         1.0
      big             1.2
      xbig            1.4
      xxbig           1.7
      huge            2.0
      xhuge           2.3

For example:

  %!CONTEX.fscode=xxsm
  %!CONTEX.fslisting=xxsm
  %!CONTEX.fstabular=sm  

Note that the relative font such as 'sm' is to be combined
with other switches that specifies the typeface such
as Sans Serif (\sssm), or Serif (\tfsm). This switch has
a lasting effect that stays on even after switches to a 
different font family. This could be beneficial if 
a different font family is to be chosen for a different
Unicode character or a collection of characters.

  {\tfsm Hello {\switchtobodyfont[jp]日本人}}




# Creating a CONTEX document

When running 'nic' and the document is not a master document,
then no chapter is to be created, and only sections are.
In particular, each HDGS/1 block will become a "section"
of the CONTEX document, and the HDGS/2 block is to become
a subsection. If there is a HDGS/0 block it will also be 
part of the generated TEX document, but it will not be 
a section. It is simply a paragraph with a bigger font (\tfd).

If the ALL.title is set, then a title page will also be generated,
with the title set to this, and ALL.author will be included
if it is also specified. If ALL.title is not set, then no title
page will be created.

For a master document that includes other child documents, each child
document is to become a chapter (if "h1" is used). If ALL.title
is set, then a title page will be created. The "h1", "h2" designation
is to express the "indent" level, for which "h1" will treate each HDGS/0
block of each child document as a chapter, HDGS/1 as section, 
HDGS/2 as subsection, and so on. The "h2" designation is to treat
the HDGS/0 of each child document as a section, HDGS/1 as a subsection,
HDGS/2 as a subsubsection, and so on. 

# The \mathscr command 

The \mathscr is not available on CONTEX and thus is not supported
on NITRILE.

# Using libertine font

To use the Linux Libertine font, specify "linuxlibertineo" as the
font family name. 

  \setupbodyfont[linuxlibertineo]
  \setupbodyfont[linuxlibertineo,12pt]

There are other font family in there with 
similar names but not sure what they are about.

  $ mtxrun --script font --list --file -pattern=*libertine*

  familyname                weight     style    width    variant   fontname               filename               subfont   fontweight

  linuxlibertinedisplayo    normal     normal   normal   normal    linlibertinedisplayo   LinLibertine_DR.otf              conflict: book
  linuxlibertineinitialso   normal     normal   normal   normal    linlibertineio         LinLibertine_I.otf               conflict: book
  linuxlibertinemonoo       normal     normal   normal   normal    linlibertinemo         LinLibertine_M.otf               conflict: book
  linuxlibertinemonoo       bold       normal   normal   normal    linlibertinemob        LinLibertine_MB.otf
  linuxlibertinemonoo       bold       italic   normal   normal    linlibertinemobo       LinLibertine_MBO.otf
  linuxlibertinemonoo       normal     italic   normal   normal    linlibertinemoo        LinLibertine_MO.otf              conflict: book
  linuxlibertineo           normal     normal   normal   normal    linlibertineo          LinLibertine_R.otf               conflict: book
  linuxlibertineo           bold       normal   normal   normal    linlibertineob         LinLibertine_RB.otf
  linuxlibertineo           bold       italic   normal   normal    linlibertineobi        LinLibertine_RBI.otf
  linuxlibertineo           normal     italic   normal   normal    linlibertineoi         LinLibertine_RI.otf              conflict: book
  linuxlibertineo           semibold   normal   normal   normal    linlibertineoz         LinLibertine_RZ.otf
  linuxlibertineo           semibold   italic   normal   normal    linlibertineozi        LinLibertine_RZI.otf

# Remarks

- For code listing in VERB block, as it is done using \starttabulate,
  if there are many lines they some of them might appear before a 
  "floating" figure and some of them after.

- The \sfrac in CONTEX does not place the numerator/denominator side-by-side,
  but instead laying them out top-to-bottom.

- The equation numbering always starts at 1 for each chapter, regardless of
  how many chapters there are. Each chapter would have its equation starting
  from 1. This is different than LATEX, where the whole document is considered
  a unit, and equation numbers continue from those of a previous chapter.

- The only place to insert [+] or [eq:a] is to place it inside one
  of the items after \startmathalignment. Placing after the \startformula
  would trigger the equation numbering to be generated, and the numbering text 
  is seen vertically centered comparing to the formula---however, 
  the \in[eq:a] reference will not work in this case; all it shows is a ??.

- When in twocolumn code, some of the lines are being compressed horizontally
  when CONTEX determines it is just a little too long to fit in a line and
  it think it can just squeeze it in by shrinking all the spaces tighter.
  However, it has been observed that sometimes the parentheses are being
  drawn on top of other characters.

- The \placefloat does not seem to have an option to expand the
  float so that it covers the entire width of the page. The only
  available way of having it expand multiple columns is to use
  the \startpostponing..\page..\stoppostponing command. In
  addition, it will expand the float to multiple columns when
  the float is *wider* than the width of a column. For \bTABLE,
  the only way to make the entire table wide is to set the width
  of each column separately---this breaking the internal algorithm of
  the table that each column will balance itself based on the
  width of neighboring columns. However, this is the only way to
  have it work for now---that is to hardcode the column width
  to be the same and being the fraction of the \makeupwidth,
  which seems to be always set to the width of the entire page, 
  rather than \textwidth, which will be shrunk to be the width
  of only a single column.

- The \latexdesc command that is defined allows for font switch
  commands and math to be included inside the braces.
  The LATEX version of \item[], can also include font switch commands
  and math mode texts (using \( and \))

- For two-column-layout mode, there is not a default option to
  configure, it will have to be done manually, by placing   
  \startcolumns and \stopcolumns commands at the start and end
  of a chapter, or the content of a document if the current
  document is not a master document.

- The name for the parser is 'CONTEX'.

# Math formula

The math formula generation for CONTEX is done 
as the following:

  $  C &= a + &b\\
       &= c + d

  $ A + B &= a + b

  $ A + B + C &= c + d

The output would have been as follows:

  \startformula
  \startmathalignment[n=2]
  \NC C \NC = a + b \NR
  \NC  \NC = c + d \NR[+]
  \stopmathalignment
  \stopformula
  \startformula
  \startmathalignment[n=2]
  \NC A + B + C \NC = c \NR
  \stopmathalignment
  \stopformula
  \startformula
    A + B = c
  \stopformula

The result is that for the first \startformula, there are
two lines on top of each other and these two lines will have
their equal-signs aligned. For the next two formulas they
are always arranged centered.

# Setting the gap between images

For PICT block, when multiple images are present in a row,
there must be some gap that needs to be reserved. The 
default setting for the gap between the images is a fixed
value (unknown), which causes the problem of not being able
to control the total width of the block so that it stay
within the width of the page.

The solution is to configure it so that the gap is set to
a fraction of the width of the page. Following is an example
of setting it to be 6% of the page width.

  \setupcombinations[distance=0.06\textwidth]

Following are examples copied from WIKI page of CONTEX.
Suppressing both the horizontal and vertical gap between cells:

  \setupcombinations[distance=0mm,after=]

A 10mm horizontal and vertical gap between cells:

  \setupcombinations[distance=10mm,after={\blank[10mm]}]

The distance between the content and its caption entry is set
with the 'inbetween' parameter.

Current the distance is made a parameter in CONTEX
that is CONTEX.distance, it is set to a number that represents
the percentage of the page. For example '2' would mean two-percent
of the page width. The \setupcombinations command is then placed
at the preamble of each generated CONTEX document that reflects
this setting.

# Page layout

To setup the page layout of the entire document. The following three
parameters are to be used for controlling the margin left/right
and the width of the document itself.

  %!CONTEX.papersize=A4
  %!CONTEX.backspace=15
  %!CONTEX.cutspace=15
  %!CONTEX.width=180

Note that the total distance of backspace, cutspace and width
should equal to the width of the page, which has been set to A4,
having a standard width of 210mm and height of 297mm. All the
numbers of these parameters must be specified in numbers, and are
assumed to be in mm.

The vertical spaces are controlled by the following parameters:

  %!CONTEX.topspace=20;
  %!CONTEX.header=10;
  %!CONTEX.footer=0;
  %!CONTEX.height=250;


