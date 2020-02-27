# LATEX text color and color in MetaPost

The color in LATEX text is achieved through the *xcolor* package.

    {\textcolor{green}My Text}

The `\textcolor` command is to change the environment so that the 
rest of the text is to be shown with a color of green.

To set a customed color, do the following:

    \colorlet{LightRubineRed}{RubineRed!70!} A new colour named LightRubineRed
        is created, this colour has 70% the intensity of the original RubineRed
        colour. You can think of it as a mixture of 70% RubineRed and 30%
        white. Defining colours in this way is great to obtain different tones
        of a main colour, common practice in corporate brands. In the example,
        you can see the original RubineRed and the new LightRubineRed used in
        two consecutive horizontal rulers.

    \colorlet{Mycolor1}{green!10!orange!90!} A colour named Mycolor1 is created
        with 10% green and 90%orange. You can use any number of colours to
        create new ones with this syntax.

    \definecolor{Mycolor2}{HTML}{00F9DE} The colour Mycolor2 is created using
        the HTML model. Colours in this model must be created with 6
        hexadecimal digits, the characters A,B,C,D,E and F must be upper-case.


The colour models that only xcolor support are:

  -   cmy cyan, magenta, yellow
  -   hsb hue, saturation, brightness
  -   HTML RRGGBB
  -   Gray Grey scale, a number between 1 and 15.
  -   wave Wave length. Between 363 and 814.


