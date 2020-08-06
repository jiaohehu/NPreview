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


# Inline BARCHART 

The inline BARCHART takes on a syntax of the following.

  \vbarchart{width;height;data}

The 'width' argument is a number expressing in mm the width of the chart
on paper. The 'height' argument is a number expressing in mm the height
of the chart on paper. The 'data' argument is a list of floats, each separated
by a comma, the height of the bar. This number must be in the range from 0-1.

For example, the barchart of \vbarchart{20;10;0.2,0.8,0.6,0.4,1.0}
would have generated the following SVG code.

  </svg>
  <svg xmlns='http://www.w3.org/2000/svg' 
       xmlns:xlink='http://www.w3.org/1999/xlink' 
       width='20mm' height='10mm' 
       fill='currentColor' 
       stroke='currentColor' >
  <rect x='0' y='30.24' width='15.12' height='6.56' stroke='inherit' fill='none' />
  <rect x='15.12' y='7.56' width='15.12' height='29.24' stroke='inherit' fill='none' />
  <rect x='30.24' y='15.12' width='15.12' height='21.68' stroke='inherit' fill='none' />
  <rect x='45.36' y='22.68' width='15.12' height='14.12' stroke='inherit' fill='none' />
  <rect x='60.48' y='0' width='15.12' height='36.8' stroke='inherit' fill='none' />
  </svg>

Note that 1mm is 3.78px.
Thus, 20mm translates to 75.6px, and 10mm to 37.8px. These numbers are
utilized by the 'transform=' attribute so that each rect is shown in the
correct scaled size by the 'width' and 'height' arguments.


# Inline XYPLOT   

The inline XYPLOT takes on a syntax of the following.

  \xyplot{width;height;data}

The 'width' argument is a number expressing in mm the width of the chart
on paper. The 'height' argument is a number expressing in mm the height
of the chart on paper. The 'data' argument is a list of floats, each separated
by a comma. Each pair of number expresses one point in the coordinates.
Each coordinate is in the range of 0-1.

For example, the barchart of \xyplot{20;10;0.2,0.2,0.3,0.3,0.4,0.4}
would have generated the following SVG code.

  </svg>
  <svg xmlns='http://www.w3.org/2000/svg' 
       xmlns:xlink='http://www.w3.org/1999/xlink' 
       width='20mm' height='10mm' 
       fill='currentColor' 
       stroke='currentColor' >
  ...
  </svg>

Note that 1mm is 3.78px.
Thus, 20mm translates to 75.6px, and 10mm to 37.8px. These numbers are
utilized by the 'transform=' attribute so that each rect is shown in the
correct scaled size by the 'width' and 'height' arguments.





