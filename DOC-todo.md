# TODO

- Need to change the `u` variable to `_u`
- Need to change the `pu` variable to `_pu`
- Need to change the `ratio` variable to `_ratio`
- Need to change the `wheel` variable to `_wheel`
- Need to come up with a new curve.jump method for drawline and set curve up combination
- Need to define standard color names for both latex text and color in MP.
  Switch over to using \mpcolor macro so that we can use standard xcolor names
- Need to implement a custom function to break the columns of a table
  so that the vertical bar character is only treated as a column separator
  when it is proceeded and followed by a space at the same time, or as the last
  character of the line, or as the first character of the line.
- Need to place all configuration flags in the output of LUALATEX, with
  leading percent-sign character so that it does not get processed by LATEX.
- When 'math' block is detected to have labels and turned
  into an equation block for latex and html, it does not
  quite work when 'alignequalsign' is set.
- The replaceREF() function might not have worked for EPUB because of the
  ID might have been in different files.
- The highlighting of yellow on the PREVIEW is not working for SUBs
