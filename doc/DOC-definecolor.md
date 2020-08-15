LATEX "definecolor" command

The "xcolor" package provides the following command:

    \definecolor{canvascolor}{rgb}{0.643,0.690,0.843}

Once a new color name is defined, it can be used, in places such 
as
   
    The {\color{canvascolor}colored text}.

Colors can be freely combined with other color names without having
to create new color names, 

    The {\color{canvascolor!75!white}color text}.

The "colorlet" command can also be used to create new color name
that is the result of mixing with one or more existing colors.
Following example would provide 75 percent "canvascolor" with 25
percent of "white".

    \colorlet{canvas75}{canvascolor!75!white}

The "definecolor" and "colorlet" commands can appear in a preamble,
but it can also appear as part of a normal text. Following is
a minimal example.

    \documentclass{article}
    \usepackage{xcolor}
    \definecolor{canvascolor}{rgb}{0.643,0.690,0.843}
    \colorlet{canvas75}{canvascolor!75!white}
    \begin{document}
    \noindent\ttfamily
    \color{canvas75}RGB colour canvascolor!75!white\\
    html : \convertcolorspec{named}{canvas75}{HTML}\HTMLcolour
    \HTMLcolour\\
    cmyk : \convertcolorspec{named}{canvas75}{cmyk}\CMYKcolour
    \CMYKcolour
    \end{document}