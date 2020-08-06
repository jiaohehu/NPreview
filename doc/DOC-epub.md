# EPUB Generation

# Splitting chapters

If the input is a single file, then each section of that document
will be placed in its own XHTML file in the EPUB, and the title
of that document has its own XHTML file with only that title
text.

    "content1.xhtml"
    -----------
    <h1> My title
    -----------

    "content2.xhtml"
    -----------
    <h2>1 My first section
    ...
    ...
    -----------

    "content3.xhtml"
    -----------
    <h2>2 My second section
    ...
    ...
    -----------

If the input is a master file with at least sub-document or at
least one "part", then each subdocument becomes a single XHTML file,
with its title at the very beginning of that file. If there is 
a "part" before it, the "part" will be in its own XHTML file.

    "content1.xhtml"
    -----------
    <h1>PART I - My part
    -----------

    "content2.xhtml"
    -----------
    <h2>1  My title
    ...
    ...
    <h3>1.1  My first section
    ...
    ...
    <h3>1.2  My second section
    ...
    ...
    -----------


# Issues and remarks

- For MATH blocks with two more equations, EPUB tends to shrink
  the SVG for an formula if that formula has been too wide
  to fit within the boundary of the page. The shrink has been
  kept of their aspect ratio. However, this does raise an issue
  of vertical equations where they should be aligned with their
  "alignment points"---when one of the formula is shrinked it
  is no longer aligned with the neighboring formulas. One possible
  solution is to place them all inside a container SVG, thus
  if the container SVG is shrinked at least all formulas in it
  are kept in relative positions.

- For iBOOK which is on iPAD, first generation, there are several
  problems. First it does not support Unicode characters beyond
  0xFFFF. Thus, an italic variable such as v that is expressed
  by U+1D463 is not going to be shown correctly. Secondly, it
  has trouble position the image inside a <caption> element
  correctly---the image being a <img> element containing an
  embedded SVG. 

- When a SVG is converted to an IMG, with an embedded data URI,
  then the 'currentColor' for both 'stroke' and 'fill' attribute
  of the SVG does not pick up the current color setting of the
  document, and is always the color of black instead.
   
