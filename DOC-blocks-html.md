# Blocks

# HTML figure

  Following eight blocks in HTML are implemented using
  <figure>:

  VERB
  PICT
  TABB
  TABR
  LONG
  DIAG
  MATH
  FRMD

  By default HTML FIGURE element is configured to be about 80%
  of the text width with a left margin of about '2em'.

# FRMD block

  FRMD block is implemented as a inline-SVG. The display by
  browser as a IMG with a data URI that is encoded by calling
  'encodeURIComponent()' has been shown to have a visual
  problem where part of the image at the right-hand side
  are clipped.

  Current a 1px outline is shown.

# MATH

  Each math expression is done by a SVG. The inline SVG
  that is generated has a 'mid' member, in pt, that is a measurement
  of distance from top of the SVG downward. It expresses
  a vertical position within SVG that is considered the "baseline"
  of that SVG. 

  This "baseline" is then used to vertically align this SVG with
  the surrounding text. It is done by setting the "vertical-align"
  style to a value. This value is computed such that the "baseline"
  of the SVG aligns with an imaginary "font-line" that is 1/3 above
  the bottom of text, where the 1/3 distance is computed as 
  1/3 of the 'HTML.bodyfontsizept'. 

  For simulating "align by equation" between multiple formulas,
  each output of SVG also comes with a "shiftdist" member. This
  member is a number in the unit of "pt". It expresses the horizontal
  distance from the start of the SVG for which the equal-sign
  appears. Thus, the "shiftdist" members can 
  be used to compute relative distances of each, if multiple
  formulas and thus make adjustments such that their 
  "equal-sign" all line up. The adjustment (*) is currently done 
  using "position:relative;left:*" CSS style.




