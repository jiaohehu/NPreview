# Text blocks

A text block does not exhibit a particular
structure preference.

Each text blocks will be translated into LATEX as a normal paragraph, with one
blank line before it and one blank line after it in the TEX file. The LATEX
engine PDFLATEX or LUALATEX will indent the first line. However, it will
suppress the intending if it is the first paragraph after a chapter, section,
subsection, or a subsubsection.

We can turn a text into a LATEX `\paragraph` by adding the square brackets at
the beginning of the text block, such as follows.

    [ Exercise. ]  Find the largest common factor for 24 and 36.

    [ Answer. ] blah blah ...

We can also turn a text block into a LATEX `\subparagraph` by adding double square
brackets at the beginning of the text block, such as follows.

    [ Exercise. ]  Find the largest common factor for 24 and 36.

    [[ Answer. ]] blah blah.

We would call the first a PRIM block and the second a SECO block.

Note that in order for a PRIM block to be recognized the brackets must appear
with no white space before it. It must also have at least one space after the
opening bracket and one before the closing bracket.

In order for a SECO block to be recognized the first opening bracket must appear
with no white space before it. The two opening brackets must also be place
together with no white spaces. There is also need to be at least one space
between the second opening bracket and the text within it. There should also
need to be at least one space between the interior text and the first closing
bracket. The two closing brackets must also be placed next to each other with no
spacing between them.

The appearance of PRIM, SECO, and TEXT blocks on PREVIEW are modeled so that
they resemble the look on LATEX for as much as possible.

For a normal TEXT block, the PREVIEW will try to indent the first line with five
non-breakable-spaces (unicode point 160 decimal), unless it is the first paragraph
after a heading. In order to closely model after the look on a LATEX document, the top and bottom margin of the DIV element for a TEXT block is set to both zero.

For PRIM and SECO block the top margin is set to 1em, and the bottom margin is
set  to zero, this is to allow for the TEXT block immediately following it to be
placed close to it with any added vertical spacing.   
