## 0.1.0 - First Release
* Every feature added
* Every bug fixed

- 6/25/2019

- Allow figures to be generated for LATEX

- Preview of figures and images are done using a placeholder frame
  (rendered using SVG) showing the image file name, and the subcaption
  of this image.

- Added support for %!BOOK block, in which case it is used to generate a
  LATEX document with 'book' as its document class. Generating this
  document requires the '%!BOOK' block, and within which specifies
  individual chapters which must come from other source files.

- Added support for cross reference markup [^/src1.md] for referring to
  the label of the highest heading of the source file 'src1.md'.

-  6/26/2019

- Allow for opening of source files from within preview of %!BOOK block

- Changed cross reference markup syntax to [^/d3js] or [^/d3js:intro]
  or [^/:intro]
