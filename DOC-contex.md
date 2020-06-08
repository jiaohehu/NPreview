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



