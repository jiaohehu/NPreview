# MEMOR translation


# The luatexja-fontspec package

The inclusion of the following packages causes 
the error which is also list below.

  \\usepackage{luatexja-fontspec}
  \\usepackage{luatexja-ruby}
  \\newjfontfamily\\de{dejavusans}
  \\newjfontfamily\\za{zapfdingbats}
  \\newjfontfamily\\cn{arplsungtilgb}
  \\newjfontfamily\\tw{arplmingti2lbig5}
  \\newjfontfamily\\jp{ipaexmincho}
  \\newjfontfamily\\kr{baekmukbatang}

  (/usr/local/texlive/2018/texmf-dist/tex/latex/filehook/filehook-memoir.sty)))))
   (/usr/local/texlive/2018/texmf-dist/tex/luatex/luatexja/luatexja-compat.sty(lo
   ad cache:
   /Users/james/Library/texlive/2018/texmf-var/luatexja/ltj-jisx0208.luc
   )

   ! LaTeX Error: Command \printglossary already defined.
                  Or name \end... illegal, see p.192 of the manual.


Note including this package will cause a long paragraph
consisting of CJK characters to be typeset in only one
line---which is the case where the line break does not happen to
it. This is because traditionally CJK characters are placed next
to each other without any blanks inserted between them.

The solution is to add the following compilation option
and this error will be ignored.

  lualatex --interaction=nonstopmode my.tex

However, since this isn't a satisfactory solution. The current
translation implementation is to save the package \printglossary
command and then restore it after the 'luatexja-fontspec' has
been loaded.

  \documentclass[twocolumn,11.5pt]{memoir}
  \usepackage{microtype}
  \let\saveprintglossary\printglossary
  \let\printglossary\relax
  \usepackage{luatexja-fontspec}
  \usepackage{luatexja-ruby}
  \let\printglossary\saveprintglossary
  \let\saveprintglossary\relax

# The hyperref package

The hyperref package is stated to have many conflicts with the 
memoir package and is not recommanded. Thus, it is not possible
to click a link such as "Fig.1" to jump to the figure. However,
the correct figure numbering is still there. The figure
numberings are done internally by NITRILE.

# The metapost code

The metapost code that is known to have worked for regular LATEX
classes does not seem to work for memoir. It complains about 
a control sequence not defined. Unsure how to fix the problem.

  ! Undefined control sequence.
  l.299 \mplibtoPDF
                 {
  l.383 \end{mplibcode}

The solution turns out to be to add the following line to the
preamble section of the generated MEMOR document.

  \def\mplibtoPDF#1{\special{pdf:literal direct #1}}

# The two column layout mode

The two column layout mode is supported by the 'memoir' class. 

It has also been shown that it automatically reduces the
left/right margins of the document if 'twocolumn' option is
inserted as one of the options of the class name, without one has
to do some specifically.

# Font size switches

Following is copied directly from memoir 
class documentation.

  Table 3.9: The memoir class font sizes

  Switches       9pt    10pt    11pt    12pt
  ---------------------------------------------
  \miniscule     4pt    5pt      6pt     7pt
  \tiny          5pt    6pt      7pt     8pt
  \scriptsize    6pt    7pt      8pt     9pt
  \footnotesize  7pt    8pt      9pt    10pt
  \small         8pt    9pt     10pt    11pt
  \normalsize    9pt   10pt     11pt    12pt
  \large        10pt   11pt     12pt    14pt
  \Large        11pt   12pt     14pt    17pt
  \LARGE        12pt   14pt     17pt    20pt
  \huge         14pt   17pt     20pt    25pt
  \Huge         17pt   20pt     25pt    30pt
  \HUGE         20pt   25pt     30pt    36pt

Given the same body font size, the same font size switch would
likely have turned out a smaller looking font for a memoir class
document than it would have for an article class document.

It has also been observed that the chapter, and section titles
appear to be one font size smaller than that of the equivalent 
chapter, section, subsection of a report class document. 

# The body font size

The standard classes provide point options of 10, 11, or 12
points for the main body font. memoir extends this by also
providing a 9 point option, and options ranging from 14 to 60
points. The width of the text block is automatically adjusted
according to the selected point size to try and keep within
generally accepted typographical limits for line lengths; you 
can override this if you want.

# Setting margins

The class also provides easy methods for specifying the page
layout parameters such as the margins — both the side margins and
those at the top and bottom of the page; the methods are similar
to those of the geometry package.

The page layout facilities also include methods, like those
provided by the fancyhdr package, for defining your own header
and footer styles, and you can have as many differ- ent ones as
you wish. In fact the class provides seven styles to choose from
before having to create your own if none of the built-in styles
suit you.

Sometimes it is useful, or even required, to place trimming marks
on each page showing the desired size of the final page with
respect to the sheet of paper that is used in the printer. This
is provided by the 'showtrims' option. A variety of trim marks are
provided and you can define your own if you need some other kind.




