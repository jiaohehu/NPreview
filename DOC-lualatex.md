# LATEX translation


# Required LATEX Packages For LuaLaTeX

Following are required LATEX packages that must be included:

    \usepackage{microtype}
      A typesetting enhancement that improves the interspacing
      of words.

    \usepackage{luatexja-fontspec}
    \usepackage{luatexja-ruby}
      For allowing CJK characters to show up in LuaLaTeX.

    \usepackage{geometry}
      For setting left margins, right margins, and top margins
      of the generated PDF page.

    \usepackage{graphicx}
      For \includegraphics command.

    \usepackage{caption}
      For \caption*{...}

    \usepackage{enumitem}
      Improvements version of the classic \begin{itemize},
      \begin{enumerate}, and \begin{description} environments.
      Needed because Nitrile makes extensive use of the options
      of these environments provided by this package.

    \usepackage{mathtools}
    \usepackage{amsfonts}
    \usepackage{amssymb}
    \usepackage{unicode-math}
    \usepackage{stmaryrd}
    \usepackage{wasysym}
    \usepackage{textcomp}
      AMS math and addition math symbols and text symbols such as
      \textrightarrow.  Currently not utilized but will be in the future.

    \usepackage{changepage}
      Used to change the orientation of the page for example from
      portrait to landscape. Good for typesetting a wide table on a
      page by itself. The \adjustwidth command this package provides
      is also used extensively
      by Nitrile.

    \usepackage[unicode]{hyperref}
      Defines \href, \url, and others. Also allows for generating
      of PDF bookmarks. This package has been superceeded by 
      "bookmark" package. 

    \usepackage{bookmark}
      Defines \href, \url, and others. Also allows for generating
      of PDF bookmarks. This package replaces "hyperref", which 
      requires two runs to have the bookmark inserted into the
      document, while "bookmark" package only requires one run.
      Ensure that Y2020 release is used, which seems to fix the 
      issue of CJK characters in the bookmark. Y2018 has been
      shown to have problems showing CJK characters.

    \usepackage{anyfontsize}
      Defines \selectfont{} used in typesetting of a verb block.

    \usepackage{luamplib}
      For \begin{mplibcode}

    \usepackage[normalem]{ulem}
      For \underline.

    \usepackage{ltablex}
      Needed to make 'tabular' environment happy. If not include there
      are some unexplained compilation errors.ßßß

    \usepackage{tabulary}
      For \begin{tabulary} 

    \usepackage{xcolor}
      Needed to use color such as \xcolor{...}

    \usepackage[export]{adjustbox}
      For \resizebox command that is used for typesetting VERB block.

    \usepackage{float}
      For defining customized floats.

    \usepackage{xfrac}
      For math \sfrac commands which provides side-by-side fraction.

# Setting the relative font size

Font sizes can be set for the following contents:

  %!LATEX.fscode = small
  %!LATEX.fstabular = small
  %!LATEX.fslisting = footnotesize
  %!LATEX.fssubcaption = footnotesize

The first one is used the SAMP block when its style is not
set to 1 or 2. The second one is used for tabular entries.
This will influence the text of TABB, TABR, and LONG blocks.
The third one is used for text in a VERB blocks, including the
line number. The last one is for captions and subcaptions.
Subcaptions are the text underneath each image in a PICT
block.

The values to be placed after the option is one of the following
values that expresses the font size relative to the current
document font. Note that these entries corresponding closely
with the font size switches of LATEX, but without the leading
backslash.

     size            factor
     ----------------------------
     tiny            0.5
     scriptsize      0.7
     footnotesize    0.8
     small           0.9
     normalsize      1.0
     large           1.2
     Large           1.4
     LARGE           1.7
     huge            2.0
     Huge            2.3
  
# Creating a LATEX document

When running 'nil' and the document is not a master document,
then no chapter is to be created, and only sections are.
In particular, each HDGS/1 block will become a "section"
of the CONTEX document, and the HDGS/2 block is to become
a subsection. If there is a HDGS/0 block it will also be 
part of the generated TEX document, but it will not be 
a section. It is simply a paragraph with a bigger font (\tfd).

If the ALL.title is set, then a title page will also be generated,
with the title set to this, and ALL.author will be included
if it is also specified. If ALL.title is not set, then no title
page will be created.

For a master document that includes other child documents, each child
document is to become a chapter (if "h1" is used). If ALL.title
is set, then a title page will be created. The "h1", "h2" designation
is to express the "indent" level, for which "h1" will treate each HDGS/0
block of each child document as a chapter, HDGS/1 as section, 
HDGS/2 as subsection, and so on. The "h2" designation is to treat
the HDGS/0 of each child document as a section, HDGS/1 as a subsection,
HDGS/2 as a subsubsection, and so on. 

# Libertine Fonts

There are pre-existing packages of the following nature
that can be included with each TEX document to change
the document font to Linux Libertine, including also
changing the font of Math expression.
The last one is the one instructing LATEX to use T1
encoded fonts, even though there are other types of 
encodings out there, including TrueType, and OpenType.

  \usepackage{libertine}
  \usepackage{libertinust1math}
  \usepackage[T1]{fontenc}

These packages are not enabled by default. However, NITRILE has
provision that allows additional commands to be inserted at the
end of preamble by providing the following configuration
parameters inside the document.

  %!LATEX.extra+=\usepackage{libertine}
  %!LATEX.extra+=\usepackage{libertinust1math}
  %!LATEX.extra+=\usepackage[T1]{fontenc}

Note the use of `+=` operator rather than the normal `='
operator. It is designed to build expand the previous string into
a larger one by appending new text at the end of it---and 
to insert a "newline" character before each additional text.

# To wide table table/figure

  \begin{figure*}[ht]
  ...
  \end{figure*}

  \begin{table*}[ht]
  ...
  \end{table*}

You can change the horizontal space between columns through:

  \setlength{\columnsep}{2cm}

The following code adds a separation line between columns:

  \setlength{\columnseprule}{0.5pt}

# Custom float

LATEX provides custom float allowing one to define for 
their own use. One good thing about it is that it 
has a star-version such as \begin{Program*} 
that would allow this float to be wide taking up spaces
of both columns when one-column mode is enabled. 

Another thing to point out is that the float number is always
monotonously increasing as a single integer regardless whether
chapter is present or not. To enable it to be chapter aware
the [section] option will need to be specified:

  \floatstyle{ruled}
  \newfloat{Program}{tbp}{lop}[section]

Note that if a star-version of the "caption" command such as
\caption* is used the counter is not increased.  In addition, if
\caption command is not present, there is no caption shown, and
the counter is not increased.

Following is a custom float for Figure:

  \documentclass[twocolumn]{report}
  \usepackage{float}
  \usepackage{graphicx}
  \floatstyle{plaintop}
  \newfloat{Figure}{tbp}{lof}
  \begin{document}
  \chapter*{Chapter 1 - My}
  If tables and figures are not adequate for your needs, then you always have the
  option to create your own! A good example of such an instance would be a
  document that gives lots of source code examples of a programming language. One
  might therefore wish to create a program float. The float package is your
  friend for this task. All commands to set up the new float must be placed in
  the preamble, and not within the document.
  \begin{Figure*}
  \centering
  \caption{The Hello World! program in Java.}
  \medskip
  \includegraphics{tests/image-gimp.jpg}
  \end{Figure*}
  If tables and figures are not adequate for your needs, then you always have the
  option to create your own! A good example of such an instance would be a
  document that gives lots of source code examples of a programming language. One
  might therefore wish to create a program float. The float package is your
  friend for this task. All commands to set up the new float must be placed in
  the preamble, and not within the document.
  \end{document}

Following is a custom float for Program:

  \documentclass[twocolumn]{report}
  \usepackage{float}
  \floatstyle{ruled}
  \newfloat{Program}{tbp}{lop}
  \begin{document}
  \chapter*{Chapter 1 - My}
  If tables and figures are not adequate for your needs, then you always have the
  option to create your own! A good example of such an instance would be a
  document that gives lots of source code examples of a programming language. One
  might therefore wish to create a program float. The float package is your
  friend for this task. All commands to set up the new float must be placed in
  the preamble, and not within the document.
  \begin{Program*}
  \caption{The Hello World! program in Java.}
  \begin{verbatim}
  class HelloWorldApp {
    public static void main(String[] args) {
      //Display the string
      System.out.println("Hello World!");
    }
  }
  \end{verbatim}
  \end{Program*}
  If tables and figures are not adequate for your needs, then you always have the
  option to create your own! A good example of such an instance would be a
  document that gives lots of source code examples of a programming language. One
  might therefore wish to create a program float. The float package is your
  friend for this task. All commands to set up the new float must be placed in
  the preamble, and not within the document.
  \end{document}

# Floats

The PICT, TABR, FRMD, and DIAG will *always* generate a "float" regardless
if a label or caption is present. If both caption and label is lacking
a \caption command is simply not there inside the "float" block---the visual
effect is that user will see no caption text at all, and no numbering.

However, if a label is detected or a caption is provided then 
the \caption will appear. Actually to be more accurate it is the star-version
of the \caption, which will show up as \caption*. This is because NITRILE
generates the number of all floats itself---the only exception being
the equation.

Thus, the \caption* will be used to typeset the caption. The logic is follow:
if the label is there, then a new number is obtained, and is shown, making
look like a "Fig.1", "Table.1", "Prog.1", etc. If no label is present, but
a caption text, then no new numbering is obtained---the caption line is simply
just the caption text without the numbering text that is "Fig.1", "Table.1",
"Prog.1", etc.

One can force the generation of a number by using an "empty label"
in the form of `$(#)`.

NITRILE defines customized floats in the names of: Figure, Table, and Program.
The last one is for source code list, which works with VERB block. The first
one works for PICT, DIAG, and FRMD. The second float works with TABR block.

# Issues and additional remarks

- For Linux liberbine package which changes body font, the documentation
  states to use font encoding using the following option. However, it
  has been observed that on LuaLATEX if following package is used then
  the bold-face went away.

  \usepackage[T1]{fontenc}

- The "xltabular" environment does not work with "twocolumn" mode. 
  Thus, the LONG and TABU blocks cannot be present if "twocolumn" 
  is going to be an option for the document because both of these
  blocks reply on "xltabular" environment. However, TABR 
  uses float and thus is save with "twocolumn". TABB 
  uses "tabbing" and is thus also safe with "twocolumn". 

# The "tabbing" environment

Following is an example of a "tabbing" environment in LATEX
that can set the "tab-stop" to positions relative to the whole
page width.

  \begin{tabbing}
  \hspace{0.234527\linewidth}\=\hspace{0.265473\linewidth}\=\hspace{0.234527\linewidth}\=\hspace{0.265473\linewidth}\kill
  {\small{}hello} \> {\small{}world} \> {\small{}hello} \> {\small{}world} \\
  {\small{}hello} \> {\small{}world} \> {\small{}hello} \> {\small{}world} \\
  {\small{}hello} \> {\small{}world} \> {\small{}hello} \> {\small{}world} \\
  {\small{}hello} \> {\small{}world} \> {\small{}hello} \> {\small{}world} \\
  {\small{}hello} \> {\small{}world} \> {\small{}hello} \> {\small{}world} \\
  {\small{}hello} \> {\small{}world} \> {\small{}hello} \> {\small{}world} \\
  \end{tabbing}

# LATEX tables

The 'tabular' environment does not work across pages. The 'xtabular' environment
can work across page but not across columns when two column layout is turned on.
'tabulary' does not work across pages, but it has the benefit of always
ensure that the total table width does not go over the specified width, which
is a plus when typesetting tables in a tight space, such as within the column
of a two column layout, the feature of which neither 'tabular' nor 'xtabular'
offers. 

The 'xltabular' environment can work with large list of table rows
and works very well across different page, but it does not work in two column
layout. When this happens all the rows of the table end up in the column
that is at the left-hand side of the page---no rows are placed at the right-hand
side of the column. This is also to assume that the compilation flag is 
the following, which ensures that the compiler does not despite the warning.

  lualatex --interaction=nonstopmode

One can choose to temporary "halt" the two column layout by inserting the 
command 

  \onecolumn

before the \begin{xltabular} command, and then another command

  \twocolumn

after the \end{xltabular} command. However, by doing so LATEX would
starts a new page for the table, thus leaving a visible blank at 
towards the bottom of the page that is before the table.

It should also be pointed out that the normal way of adding additional 
vertical spacing to each row, either before or after, using the following
command

  \noalign{\vspace{2pt}}

is possible, unless when the vertical line is to be drawn, in which 
case there is going to be visible gap at at the place that the previous
gap is inserted. To ensure that there is no gap do not use this
command to insert vertical spacing between rows.

# The \adjustwidth command

With the "changepage" package, you can use the adjustwidth environment as
follows, to shrink the width of the current paragraph by 5mm on
the left-hand side and 7mm from the right-hand side.

  \usepackage{changepage}
  \begin{adjustwidth}{5mm}{7mm}
  \lipsum[2]
  \end{adjustwidth}

It has also been suggested by other people to place
the following in the preamble:

  \def\changemargin#1#2{\list{}{\rightmargin#2\leftmargin#1}\item[]}
  \let\endchangemargin=\endlist 

Then the \changemargin becomes a new command that can be used to
do the following:

  \begin{changemargin}{0.5cm}{0.5cm} 
  %your text here  
  \end{changemargin}

# The enumerate package     

The 'enumerate' package redefines the 'enumerate' and 'itemize'
environments.

  \usepackage{enumerate}

The enumerate package allows you to control the display of the
enumeration counter. The package adds an optional parameter to
the enumerate environment, which is used to specify the layout of
the labels. The layout parameter contains an enumeration type (1
for arabic numerals, a or A for alphabetic enumeration, and i or
I for Roman numerals), and things to act as decoration of the
enumeration. For example, the following 'enumerate' environment
will allow for the labels of each item to appear as
(a), (b), (c), etc.

  \usepackage{enumerate}
  \begin{enumerate}[(a)]
  \item 
  \item 
  \item 
  \end{enumerate}

The following 'enumerate' environment would allow for the labels
of each list item to appear as I/, II/, III/, etc.

  \usepackage{enumerate}
  \begin{enumerate}[I/]
  \item 
  \item 
  \item 
  \end{enumerate}

# The enumitem package

This package redefines the 'itemize', 'enumerate' and
'description' environment
so that it can have the effect of a "tight list", such that the
vertical margins before and after each item are removed. 

  \begin{itemize}[nosep]

If you need non-stereotyped designs, the enumitem package gives
you most of the flexibility you might want to design your own.
The silly roman example above could be achieved by:

  \usepackage{enumitem}
  \begin{enumerate}[label=\Roman{*}/]
  \item 
  \item 
  \item 
  \end{enumerate}

Note that the * in the key value stands for the list counter at
this level. You can also manipulate the format of references to
list item labels:

  \usepackage{enumitem}
  \begin{enumerate}[label=\Roman{*}/, ref=(\roman{*})]
  \item 
  \item 
  \item 
  \end{enumerate}

To make references to the list items format appear as (i), (ii),
(iii), etc.

The 'unboxed' option is especially useful if the label is long
and sometimes need to be split into multiple lines.

  \usepackage{enumitem}
  \begin{enumerate}[style=unboxed]
  \item 
  \item 
  \item 
  \end{enumerate}

The 'nosep' option is used to ask that there is no additional
vertical margins allocated for each list item---thus making it a 
"tight list" in appearance.

  \usepackage{enumitem}
  \begin{enumerate}[nosep]         
  \item 
  \item 
  \item 
  \end{enumerate}

The 'font' option allows for a different font style to
be applied to each data term in a 'description' list.

  \begin{description}[nosep,style=unboxed,font=\\normalfont]
  \item
  \item
  \item
  \end{description}

# The LONG block

The long table is expressed by the LONG block. It is done
by the 'xltabular' environment that is offered by the following 
package:

  \usepackage{xltabular}

This environment is perfect for one to typeset a table that has
many rows that would need to appear in many different pages.
This environment also has the ability to designate a header row
that is to appear at the top of each one of the sub-tables.  

However, there is a limitation to the 'xltabular'
environment---that its implementor has not designed it to work
when the 'twocolumn' option is set for the document class.
Thus, if the following is the case then when a 'xltabular' is to
appear inside this document then LATEX will complain.

  \documentclass[twocolumn]{article}

Thus, NITRILE implementation of the translation to LATEX has
been implemented so that if a 'twocolumns' option is set,
then it will place a \onecolumn command before the start
of this environment, and then insert a \twocolumn command
after it to resume the two column layout mode.

By doing it this way it has been shown that it makes 'xltabular'
environment happy.  However, the downside of this is, the flow of
the text is interrupted at the point of \onecolumn, where the
table is to start at a new page, and the text after the table is
to start at a new page after the table. Depending on the
situation, there might be a huge blank space between the last
line of the text before the table to the end of the page it is
in. It would be nice to later find a way to make the long table 
"float" when the two column layout mode is enabled.

The 'xltabular' environment is able to have a caption. 
The \caption command must be the first one immediately following
the opening of 'xltabular', and terminated by a double-backslash.

  \begin{xltabular}
  \caption{...}\\
  \end{xltablar}

The star version of the caption command is also possible to
be used to suppress the numbering of the table.

  \begin{xltabular}
  \caption*{...}\\
  \end{xltablar}

However, the current syntax for a LONG block in a NITRILE
document does not allow for the specification of a caption.

# The TABB block

The TABB block is to be typeset by a 'tabbing' environment. 
This block is expressing a quick tabular environment where isn't
a table header. 

The 'tabbing' environment generated in the TEX file has been
specifically designed so that each column is to occupy the same
width of the entire page, the entire column if it is in a two
column layout mode.

Note that TABB block would treat each entry as a rich text.

# The TABU block

This block is similar to TABB block. However, data inside this
block is to be treated as a plain text. 

  =  Inf. neg.               ,  簡単ではない
     Inf. past               ,  簡単だった
     Inf. neg. past          ,  簡単ではなかった
     Formal                  ,  簡単です
     Formal neg.             ,  簡単ではありません
     Formal past             ,  簡単でした
     Formal neg. past        ,  簡単ではありませんでした
     Conjunctive             ,  簡単で
     Conditional             ,  簡単なら（ば）
     Provisional             ,  簡単だったら
     Volitional              ,  簡単だろう
     Adverbial               ,  簡単に
     Degree                  ,  簡単さ

It scans the first line to see if it contains a comma. If 
it does then the commas are treated as delimeter for separating 
items for each line. If a comma is not found then spaces
are assume.

The begin/end "tabbing" environment is used to typeset this
block. The "tabbing" environment need to be "marked" for the tab
stops in order it to work property. For TABB, each column should
appear to be just wide enough for the widest element of that
column. In this case, the "widest" element of that column is
determined to be the longest string. 

# Breaking lines inside a \begin{tabulary}

Inside a \begin{tabulary}, each cell can be broken into multiple
lines by inserting a \newline{} in the middle the text.
This is possible because \newline macro has been redefined to
serve this purpose inside a 'p' specification for that column.
Since 'L' for 'tabulary' is really a 'p' then this command is
carried over to the 'tabulary' environment.

However, using this approach is not recommand as 'tabulary' seems
to have made that column too wide when \newline
appear within that column.

# Multi-column 

Merging multiple columns for a given row.

  \begin{tabulary}{\linewidth}{LLL}
  Category & \multicolumn{2}{c}{Unit Symbol}\\
  Length & meter & m\\
  Mass & kilogram & kg\\
  \end{tabulary}

# The %^rmap= entry

This entry is a new 'mode' entry that serves to express a MD file
such that all its 'rmap' entries will be imported and added to
the end of the 'rmap' entries of the current doc.

Its typical use will be to set it up so that the master document
will have this entry. Since all entries of a 'rmap' that is part 
of a master document will be copied over and appended to the end
of the 'rmap' of a sub-document, it serves the purpose of letting
all sub-document sharing the same 'rmap' entries of those of the
master document.

Note that if a sub-document has a '%^root=' entry, then when this
sub-document is compiled the 'rmap' entries from a master file
will be "imported". If the '%^only=' mode is set to 1, then only
the contents of this sub-document will be shown.

A 'rmap' is automatically created for a doc, whether it is a
master or a sub-document. The 'rmap' is automatically populated
whenever a DLST is encountered such that the 'key' part of an
item is detected to follow the pattern of a "rmap", which is a
pattern that starts with some Japanese characters, followed by a
Unicode character U+30fb, and then followed by some additional
Japanese characters. When such a pattern is detected, the 
'rmap' of that document is populated with the content of this
item. 

# The \label and \ref

Note that \label and \ref commands do not accept the hash mark
character as part of the label name---thus following are
illegal.

  \label{#my} 
  \ref{#my}

When compiling a document with such \label and/or \ref
designation, no error will be generated, but the reference
to the labels are remained unresolved.

# The \img 

The \img phrase would insert an external image on the bases
that the name of an external image file is to be expected:

  The image is \img{mytree.png}

Note that for LATEX translation it is to be the \includegraphics
command without additional options.

  The image is \includegraphics{mytree.png}

For CONTEX translation it is to be the \externalfigure
command without additional options.

  The image is \externalfigure[mytree.png]

For HTML translation it is to be a IMG element.

  The image is <img src='mytree.png' />

The intend is to typeset a image without having to worry about
the placement and scaling of this image. It is thus suitable for
showing small images alone with text or by itself.  The image
will tend to be shown in its native size, according to the rules
observed on LATEX, CONTEX and HTML. For LATEX and CONTEX if it is
by itself the only element in a paragraph, it might still be
subject to indentation processing and thus might be shown with
an indentation.

# The ampersand character in the sectional title

The ampersand character and other symbol should not appear in 
a sectional title, such as a chapter, a section, a subsection, 
a subsubsection, etc. Since the text of the sectional title is
used directly as the string to the command `\addcontentsline`
when a symbol such as an ampersand appears it causes the 
lualatex compilation to complain---don't know why.
It is thus better to avoid it.

  \addcontentsline{toc}{chapter}{1 Continuative forms}



