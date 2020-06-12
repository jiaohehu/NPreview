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

- The iBook does not render EPUB well when it is styled with
  position:absolute.  Thus, for equation numbering and line
  numbering for listing blocks, it has been deliberately changed
  to not relying on this kind of technique to typeset line
  number. Instead the <table> is used and the leftmost table cell
  is used for inserting the numbering text.  For listing and/or
  verb block, the <table> is to be used in the similar style.

- In HTML generating of reference to equations are not yet
  implemented.




