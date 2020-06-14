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


