# MEMOR translation


# The luatexja-fontspec package

The inclusion of the following packages causes 
the error which is also list below.

  \usepackage{luatexja-fontspec}
  \usepackage{luatexja-ruby}
  \newjfontfamily\de{dejavusans}
  \newjfontfamily\za{zapfdingbats}
  \newjfontfamily\cn{arplsungtilgb}
  \newjfontfamily\tw{arplmingti2lbig5}
  \newjfontfamily\jp{ipaexmincho}
  \newjfontfamily\kr{baekmukbatang}

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

Most packages work with the memoir class, the main exception
being the hyperref package. This package modifies many of the
internals of the standard classes but does not cater for all of
the differences between memoir and the standard ones. If you wish
to use hyperref with memoir then you must use the memhfixc
package2 after using hyperref. For example like:

  \documentclass[...]{memoir}
  ...
  \usepackage[...]{hyperref}
  \usepackage{memhfixc}
  ...
  \begin{document}

However, if you have a version of hyperref dated 2006/11/15 or
after, hyperref will auto- matically call in memhfixc so that you
don’t have to do anything.

# The metapost code

The metapost code that is known to have worked for regular LATEX
classes does not seem to work for memoir. It complains about 
a control sequence not defined. Unsure how to fix the problem.

  ! Undefined control sequence.
  l.299 \mplibtoPDF
                 {
  l.383 \end{mplibcode}

The solution turns out to be to add the following line to the
preamble section of the generated MEMOR document, at the point 
after the inclusion of all packages and before the start
of the \begin{document} command.

  \def\mplibtoPDF#1{\special{pdf:literal direct #1}}

# The two column layout mode

The two column layout mode is supported by the 'memoir' class 
by adding the 'twocolumn' option to the \documentclass command.

  \documentclass[twocolumn]{memoir}

It has also been shown that it automatically reduces the
left/right margins of the document if 'twocolumn' option is
inserted as one of the options of the class name, without one has
to do some specifically.

# The body font size

The standard LATEX classes such as 'article' and 'report' provide
point options of 10, 11, or 12 points for the main body font.

  \documentclass[12pt]{article}

However, memoir extends this by also providing a 9 point option,
and options ranging from 14 to 60 points. 

  \documentclass[9pt]{memoir}

  \documentclass[14pt]{memoir}

The width of the text block is automatically adjusted according
to the selected point size to try and keep within generally
accepted typographical limits for line lengths; you can override
this if you want.

# Font size switches within a document

Following are font size switches made available by the 'memoir'
class.  Following is a table copied directly from memoir class
documentation.

@ Table 
  The memoir class font sizes

  Switches       | 9pt  | 10pt   |11pt   |12pt
  ---------------|------|--------|-------|-------
  \miniscule     | 4pt  | 5pt    | 6pt   | 7pt
  \tiny          | 5pt  | 6pt    | 7pt   | 8pt
  \scriptsize    | 6pt  | 7pt    | 8pt   | 9pt
  \footnotesize  | 7pt  | 8pt    | 9pt   |10pt
  \small         | 8pt  | 9pt    |10pt   |11pt
  \normalsize    | 9pt  |10pt    |11pt   |12pt
  \large         |10pt  |11pt    |12pt   |14pt
  \Large         |11pt  |12pt    |14pt   |17pt
  \LARGE         |12pt  |14pt    |17pt   |20pt
  \huge          |14pt  |17pt    |20pt   |25pt
  \Huge          |17pt  |20pt    |25pt   |30pt
  \HUGE          |20pt  |25pt    |30pt   |36pt
  ---------------|------|--------|-------|-------

Given the same body font size, the same font size switch would
likely have turned out a smaller looking font for a memoir class
document than it would have for an article class document.

It has also been observed that the chapter, and section titles
appear to be one font size smaller than that of the equivalent 
chapter, section, subsection of a report class document. 

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

# The \autorows and \autocols command

The \autorows and \autocols commands are created to quickly
typeset a grid of texts arranged according to the rule that
is either a row-based or a column-based flow.
The following example is given by the documentation of the
'memoir' package. 

  \autorows{c}{5}{l}{one, two, three, four,
  five, six, seven, eight, nine, ten,
  eleven, twelve, thirteen }

And this as well.

 \autocols{c}{5}{l}{one, two, three, four,
 five, six, seven, eight, nine, ten,
 eleven, twelve, thirteen }

Each of the previous two commands takes four arguments. The first
one is a letter that is 'c', which states that the entire grid is
to be centered in the middle of the page. The second argument is
'5', which states that the maximum number of items per row is 5.
The third argument is 'l', which states that each item is to be
left aligned for that column. The last argument is a list of
items each of which is separated by a comma from the one before
it and from the one after it.

Note that the space after the comma is significant---which means
that the space before the text "six" is to appear also in the
grid before the text. However, multiple spaces will be
"collapsed" into a single space. It is also possible to allow for
spaces to be part of a grid item, by simply adding a set braces.

  \autorows{c}{5}{l}{one, two, three, four,
  five, {six weeks}, seven, eight, nine, ten,
  eleven, twelve, thirteen }

In this case, the item that was "six" before is now "six weeks",
and this is the text that will appear in that location of the
grid.  Note that the lengthening of the text in this case will
also influence the layout of the grid.  The \autorows command has
seen to be designed so that each column always occupies the same
width.  This, if the width of the text such as "six weeks" is to
become the longest text in the entire grid, its width becomes the
width for all the columns of the grid.

The \autorows and \autocols command produces an environment that
is similar to 'tabular', in which case all rows and columns are
always held together. In the case of two column layout, all texts
will appear in a single column. In the case of one column layout,
all texts will appear in a single page. 

# Additional document class options

As usual, the memoir class is called by

  \documentclass[options]{memoir} 

The 'options' include being able to select a paper size from
among a range of sizes, selecting a type size, selecting the kind
of manuscript, and some related specifically to the typesetting
of mathematics.

@ Table 
  Class stock metric paper size options,
  and commands

  Option                |Size 
  ----------------------|---------------------
  a6paper               |148×105mm       
  a5paper               |210×148mm 
  a4paper               |297×210mm 
  a3paper               |420×297mm 
  b6paper               |176×125mm 
  b5paper               |250×176mm 
  b4paper               |353×250mm
  b3paper               |500×353mm 
  mcrownvopaper         |186×123mm 
  mlargecrownvopaper    |198×129mm 
  mdemyvopaper          |216×138mm 
  msmallroyalvopaper    |234×156mm
  ----------------------|---------------------

The 'stock size' is the size of a single sheet of the paper you
expect to put through the printer. There is a range of stock
paper sizes from which to make a selection. These are listed in
Table 1.1 through Table 1.3 of the 'memoir' documentation.  Also
included in the tables are commands that will set the stock size
or paper size to the same dimensions.

There are two options that don’t really fit into the tables.
'ebook' for a stock size of 6 × 9 inches, principally for
‘electronic books’ intended to be dis- played on a computer
monitor, and 'landscape' to interchange the height and width of
the stock.

All the options, except for landscape, are mutually exclusive.
The default stock paper size is letterpaper.

@ Table 
  Class stock US paper size, and commands

  ----------------------|---------------------
  Option                |Size 
  ----------------------|---------------------
  dbillpaper            |7 x 3 in           
  statementpaper        |8.5 x 5.5 in   
  executivepaper        |10.5 x 7.25 in   
  letterpaper           |11 x 8.5 in   
  oldpaper              |12 x 9 in   
  legalpaper            |14 x 8.5 in   
  ledgerpaper           |17 x 11 in   
  broadsheetpaper       |22 x 17 in   
  ----------------------|---------------------

Following are point size options.

The type size option set the default font size throughout the
document. The class offers a wider range of type sizes than
usual. These are:

  9pt for 9pt as the normal type size 
  10pt for 10pt as the normal type size 
  11pt for 11pt as the normal type size 
  12pt for 12pt as the normal type size 
  14pt for 14pt as the normal type size

Note that for 14pt, \huge, \Huge and \HUGE will be the same as
\LARGE, unless the extrafontsizes option is also is activated.

  17pt for 17pt as the normal type size 
  20pt for 20pt as the normal type size 
  25pt for 25pt as the normal type size 
  30pt for 30pt as the normal type size 
  36pt for 36pt as the normal type size 
  48pt for 48pt as the normal type size 
  60pt for 60pt as the normal type size

By default, if you use the extrafontsizes option the default font
for the document is Latin Modern in the T1 font encoding. 

Following are printing options:

* twoside  for when the document will be published with printing
  on both sides of the paper.

* oneside  for when the document will be published with only one 
  side of each sheet being printed on.  Note that 'twoside' and
  'oneside' option are mutually exclusive.

* onecolumn  only one column of text on a page.

* twocolumn  two equal width columns of text on a page. The
  'onecolumn' and 'twocolumn' options are mutually exclusive.

* openright  each character will start on a recto page.

* openleft  each character will start on a verso page.

* openany  a chapter may start on either a recto or verso page.

* final  for camera-ready copy of your labours.

* draft  this marks overfull lines with black bars and enables
  some change marking to be shown. There may be other effects as
  well, particularly if some packages are used.

* ms  this tries to make the document look as though it was
  prepared on a typewriter. some publisher prefer to receive poor
  looking submissions.

* showtrims  this option prints marks at the corners of the sheet
  so that you can see where the stock must be trimmed to produce
  the final page size.

Following are other options.

* leqno  equations will be numbered at the left hand side.

* fleqn  displayed math environments will be indented an amount 
  \mathindent from the left margin (the default is to center
  the environments).

* openbib  each part of a bibliography entry will start on a new
  line, with second and succeding lines indented by \bibindent
  (the default is for an entry to run continuously with no
  indentations).

* article  typesetting simulates the article class, but the
  \chapter command is not disabled, basically \chapter will
  behave as if it was \section. Chapters do not start a new page
  and chapter headings are typeset like a section heading. The
  numbering of figures, etc., is continuous and not per chater.
  However, a \part command still puts its heading on a page by
  itself.

* oldfontcommands  makes the old, deprecated LATEX version 2.09
  font commands available. Warning messages will be produced
  whenever an old font command is encountered.

* fullptlayout  disable point trunction of certain layout
  lengths, for example \textwidth. The default is to round these
  of to a whole number of points, this option disables this
  feature.



