# HTML/EPUB Translation


# Issues and remarks

- When changing the font size, it is best to do it
  at the paragraph level, such as at the level of a P-element,
  or a TABLE-element, etc. If font size were changed using
  a SPAN-element of an individual part of the text, or 
  a table data cell (TD-element), then the inter-line-spacing
  is not adjusted, such that wider gaps between lines is
  going to be observed.

- The SVG-math seems to be effected by the change of a font-size
  as well and it is shrinked or expanded in accordance to the 
  size of the relative font size such as `0.7em`, `1.2em`.

- Following BLOCK are to be place inside a <figure>: 
  PICT, TABR, FRMD, DIAG, VERB, MATH

- The font size change for "nitabb", "nicode", "niprog" and "nicaption"
  are to be done by providing a CSS that sets the font-size
  style.

  %!HTML.css+=.nitabb{font-size:0.8em}
  %!HTML.css+=.nicode{font-size:0.9em}
  %!HTML.css+=.niprog{font-size:0.9em}
  %!HTML.css+=.nicaption{font-size:0.8em}
 
  The settings will have to be defined different differently
  for HTML and EPUB, thus allowing each translation to take on 
  a different stylesheet settings.

  %!EPUB.css+=.nitabb{font-size:0.8em}
  %!EPUB.css+=.nicode{font-size:0.9em}
  %!EPUB.css+=.niprog{font-size:0.9em}
  %!EPUB.css+=.nicaption{font-size:0.8em}

  Note that '+=' is used here instead of the normal '='.
  This allows the CSS to be built incrementally. On top
  of that, each addition by string by '+=' is going to be
  prepended with a newline character, except for the very
  first item.    

