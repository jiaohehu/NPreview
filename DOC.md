Nitrile Preview

Nitrile Preview package generates LATEX document from one or more Markdown (MD) documents.

The goal of this package is simply, that is to allow you to quickly whip up a LATEX file
from a MD document. By default, a MD document will be converted to a LATEX Article document.
However, there is a provision that allows you to create a LATEX Book document by combining
multiple source MD documents.

# Makeups

Not all MD markups are recognized. Following are the one that are recognized.

- Headings using hash (#)
- List items using plus (+), hyphen (-), and asterisk (*).
- Triple-grave-accent fenced block for code block
- Triple-tilde block fenced block for verbatim block
- Inline markup using double-underscore for bold, and single-underscore for
  italic, double-grave-accent for inline code, and single-grave-accent for
  inline code.
- Link markup such as `` [Google](www.google.com) ``.

# Stylign a tabular

A tabular can be constructed by constructing a fenced block using === fences.
The result is either a "tabulary" or a "tabularx" environment. The first is
provided by package "tabulary" and the second "ltablex".

    ===
    Node Type      Value   Example
    ELEMENT_NODE   1       The <body> element
    TEXT_NODE      3       Text that is not part of an element
    COMMENT_NODE   8       <!-- an HTML comment -->
    ===

Each line is recognized as a row to a table. Cells are recognized by splittting
the line into multiple segments separated by two or more spaces.

If there are no double-space detected in the first line, then it is assumed
that the entire line is for the first cell of the first row, and the next
line is for the second cell of the first row, and so on. A second row is
started when a blank line is encountered. Thus, the previous table can be rewritten
as follows.

    ===
    Node Type
    Value
    Example

    ELEMENT_NODE
    1
    The <body> element

    TEXT_NODE
    3
    Text that is not part of an element

    COMMENT_NODE
    8
    <!-- an HTML comment -->
    ===

The "xtabular" package is used by default. By default all columns are assumed
the type of "L", as is recognized in "tabulary" as a "balanced" column, whose
width is automatically determiend by "tabulary" based on the content of the column
and also those of other "L" columns.

By default, Nitrile uses the \toprule, \midrule to draw horizontal lines
on top of the header row and underneath the header row. It also uses
\bottomrule to draw a horizontal line after the last row of the table.
The first row is always assumed as the header row.

## Supported LATEX left/right fences

    "\\left\\lbrace"
    "\\left\\lbrack"
    "\\left\\llbracket"
    "\\left\\langle"
    "\\left("
    "\\left\\lVert"
    "\\left\\lvert"
    "\\left\\lceil"
    "\\left\\lfloor"

    "\\right\\lbrace"
    "\\right\\lbrack"
    "\\right\\llbracket"
    "\\right\\langle"
    "\\right)"
    "\\right\\lVert"
    "\\right\\lvert"
    "\\right\\lceil"
    "\\right\\lfloor"

## Supported LATEX commands

    \text
    \binom
    \frac
    \sqrt

## Supported LATEX font variants

    \mathbb{ABab12}
    \mathscr{ABab12}
    \mathcal{ABab12}

NOTE: only the upper-case letter, lower-case letter, and digits are supported.
No spaces are allowed.

NOTE: for mathbb variant, which is for double-strike variant,
the following letters in Unicode are having a "different" appearance
than the other ones:

    C  - field of complex numbers
    H  - field of quaternion numbers, which is a number system that extends the complex numbers.
    N  - field of all natural numbers, which must be a positive integers: 1, 2, 100, ...
    P  - field of all prime number
    Q  - field of rational numbers, excluding irrational number such as PI
    R  - field of all real numbers, including integers and floating point numbers
    Z  - field of all integers, including negative integers and zeros.

NOTE: Unicode only provide code points for mathbb-variant digits, which would have
been styled with double-struck appearance. Unicode does not provide code points for
mathscr or mathcal style variants. Thus, if digits are detected for mathscr or mathcal
variants it simply falls back to using regular digits.

## \sum, \lim and \int

Supports are provided for using these commands for showing the summation, limits, and
integral equations.

    \lim_{i \to \infty} \frac{1}{i}

Or

    \sum_{i=0}^{100} i^2

Or

    \int_{0}^{100} x dx

So far only the inline-math mode is supported.


# The 'outlineonly' and 'sections' flags

The 'outlineonly' and 'sections' flags are designed to control the preview
of contents so that only a selected few are shown.

    % !NTR outlineonly = true
    % !NTR sections 1.3

This configuration will only show the entire content of section 1.3, and leave
everything else as showing as outlines only. You can list additional sections
numbers that are separated by spaces such that the 'sections' flag would look
like the following: '1.3 1.5 1.6', and in this case the sections of 1.3, 1.5 and 1.6
are showing its entire content and everything else is shown as outline only.

# Work still needs to be done

- Need to continue fine-tune individual symbols in nitrile-preview-math.json file
so that each of the math symbols in the "mathSymbols" section have its optimal width
such that when displayed the symbol is neither cut-off or left with too much space
at the tail-end.

- Need to work on display-math such that the fraction, the lim, sum, and integral
will be styled and scaled differently than those of inline-math mode.

- Need to add an "formula" block that will turn into either an equation or display
math.

# Lists items

For a list item there are special processing to be done.

Especially, if a colon is found to have followed the first word of the list
item text and the colon is tself proceeded immediately by at least one blank
space and followed immediately by another blank, then the first word of the
list item text is considered an emphasized word and will be styled differently.

The styling will be different depending on the choice of the symbol character
that leads the list item.  Especially, for a list item that starts with a
hyphen-minus character then that word will be styled as italic. For a list item
that starts with a asterisk character then that word will be styled as bold.
For a list item that starts with a plus-sign character then that word will be
styled as typewriter fonts.

For example for the following list

    - Apple : the word "apple" will be italic
    * Apple : the word "apple" will be bold
    + Apple : the word "apple" will be monospaced

# The parskip flag

The 'parskip' flag, when set to true, is to constrol the formatting of normal
paragraphs such that they each appear as a block with no indentation at the first line of the paragraph.
When set to false then a normal paragraph except for the one immediately
follows the heading is being indented as LATEX normally does.

In reality, when this flag is set, Nitrile will insert a begin/end flushleft
environment around the normal paragraph when translating it to a LATEX document
so that these paragraphs will be styled as a non-indent block by a LATEX
engine. When this flag is set to false, each normal paragraph will simply be
left as is, with an empty line inserted between itself and the paragraph
proceeding it, such that when processed by LATEX the produced PDF will
appear as indented for this paragraph.

The default setting for this flag is true.

# A sample block

A sample block is a block that shows an provides an sample or example of something for
illustration purpose, such as for showing a piece of code snippet.

A sample block is recognized by the setting up of a flag that is "sample",
and a block that is indented at least to the number of spaces required.

    Lorem ipsum dolor sit amet, consectetur
    adipiscing elit, sed do eiusmod tempor
    incididunt ut labore et dolore magna aliqua.

        #include <stdio>
        int main() {
          printf("Hello world\n");
          return 0;
        }

    Lorem ipsum dolor sit amet, consectetur
    adipiscing elit, sed do eiusmod tempor
    incididunt ut labore et dolore magna aliqua.

In the previous example the C-program code snippet is being detected to
have an indentation of its first line that is 4 spaces, and thus is being
recognized as an sample block.

The sample block is typeset using monospace fonts. All spaces after the initial
4-spaces are preserved, as well as line breaks. Long lines are wrapped into
multiple lines. The length at which the line is wrapped is set by the following
configuration parameters and by default it is set at 60.

    % !NTR sampwrap = 60

This setting instructs that if a line in a sample block is detected to be
longer than 60, then an algorithm will be employed to find an optimal
place so that it will be split at that point.

For LATEX translation it observes instead the following configuration
parameters, and it is set to 60 by default.

    % !NTR latexsampwrap = 60

You may choose to set it to be a smaller number, if for example,
you have changed the page left/right margins, or have chosen to 
typeset it using a different font, or having decided to typeset
in a twocolumn mode.

# LATEX-only options

Following are configuration options that are related to LATEX document
generation only.  It does not affects PREVIEW.

    latexlatexfamily
    latexdocumentclass
    latextwocolumn
    latexa4paper
    latextwoside
    latexparskip
    latexstepmagin
    latexsampwrap
    latexsampmargin
    latexleftmargin
    latexrightmargin
    latextopmargin
    latexleftmarginTC
    latexrightmarginTC
    latextopmarginTC

For example, if we would like to change the document class to
be *scrartcl* then we will include the following configuration
parameters.

    % !NTR latexdocumentclass = scrartcl

# EPUB splitting chapters

When HTML translation is being done to it there are two kind of outputs:
The HTMLS array and CHAPS array.

    <h1>PART I - Basi...
    <h2>Chap 1. Intro...
    ...
    ...
    <h2>1.1 Welcome to...
    ...
    ...

There could be two or more elements that make up for a single block.

The CHAPS array looks like the following:

  ['PART',   'nitri....1',''        ,'   ','PART I..',0  ,'']
  ['CHAPTER','nitri...12','my:intro','1  ','Intro...',1  ,'']
  ['SECTION','nitri...24',''        ,'1.1','Welco...',225,'']
  ['CHAPTER','nitri...34',''        ,'2  ','regexp  ',300,'']

Each element is itself an array of seven part.

The first part is a string such as 'PART', 'CHAPTER', 'SECTION', etc; the
second one being the CSS ID of that part, chapter, section; the third one being
the label for that part, chapter, sections, etc.; the fourth one being the dept
that is assigned to that chapter, section, such as "1", "1.1", etc., the fifth
one being the actual title for the part, chapter, section; and the sixth one
being the index into the HTMLS array that the first line of that part, section,
etc. started.

The seventh part is being left empty by translateHtml call, it expresses the
name of the file that is to be saved under, and thus should be used when, not
empty to construct the Href-attribute of the A-element such as when exporting
to a EPUB archive.

For 'PART', 'CHAPTER', 'SECTION', 'SUBSECTION', 'SUBSUBSECTION', each element
of the CHAPS array express the first line in the HTMLS array that starts that
part, chapter, section, etc.

Following is the likely output after being modified by EPUB generator.

    ['PART',   'nitri....1',''        ,'   ','PART I..',0,  'content0.xhtml']
    ['CHAPTER','nitri...12','my:intro','1  ','Intro...',1,  'content1.xhtml']
    ['SECTION','nitri...24',''        ,'1.1','Welco...',225,'content2.xhtml']
    ['CHAPTER','nitri...34',''        ,'2  ','Regexp..',300.'content3.xhtml']

This, in order to find all the contents of the chapter within the HTMLS array
that is that chapter and its contents, find the next entry in CHAPS array that
says 'CHAPTER' and see what index that is. The index of the current 'CHAPTER'
and the index of the next 'CHAPTER' forms the range of elements for the
contents of that chapter.

NOTE: The length of HTMLS and CHAPS array are not the same and will not be the
same.

# Handling images in HTML

In PREVIEW, the images are previewd by modifying the img.src member
posthumously at the background *after* the innerHTML has been assigned.

The innerHTML constructed always points to the original src file such as

    <img id='my-unieque-id' src='./tree.png' />

The Img-element is also given a unique Id, taken from the last HTML parser's
this.imgId value. The actual ID is irrelevant but it should always be unique.
The idea is that once the Img-element is constructed it can be unique identified
later on by its ID.

The HTML parser calls the *view.requestImage* and pass it the *imgid* and *src*
member. The *view.requestImage* member will take care of setting up a *fs.readFileAsync*
call to load the image from the file and then do a global search using

    document.querySelector('img#my-unique-id')

to find the node that is our Img-element and then change its *img.src* member
to a URI that expresses an PNG file that is base64-encoded. So in the end,
or Img-element should have looked like the following in DOM:

    <img id='my-unique-id' src="image:data/png;base64,..." />

However, the origial HTML still looked like:

    <img id='my-unieque-id' src='./tree.png' />

The NitrilPreviewView class has a build-in image cache named *this.imagemap*,
which is a JavaScript *Map* object that caches the image data read from
previous calls to *fs.readFileAsync*. Thus if the same image is to be asked
again it can simply retrieve it from *this.imagemap*.

The *fs.readFileAsync* always returns a JavaScript *Buffer* object which
stores binary data. This is what is stored with *this.imagemap*, indexed
by the name of the image file, such as "tree.png".

The *this.imagemap* is cleared when a new file has been asked to be previewed.

During the translation of HTML, all images encountered will left with a trace
in the *chaps* array. It's entry starts with the string 'image':

    ['PART',   'nitri....1',''        ,'   ','PART I..',0  ,'']
    ['CHAPTER','nitri...12','my:intro','1  ','Intro...',1  ,'']
    ['image'  ,''          ,''        ,''   ,'tree.png','' ,'']
    ['SECTION','nitri...24',''        ,'1.1','Welco...',225,'']
    ['CHAPTER','nitri...34',''        ,'2  ','regexp  ',300,'']

In the previous example the third line is an 'image' entry. The fifth column is
filled with the name of the image file and other columns are irrelevant and
left unfilled.

The presence of the 'image' entry in *chaps* array allows for the posthumous
process such as EPUB translation to scan and detect all external image files
referenced. It can thus build proper entries for these external images for its
*manifest* section of the *package.opf" document, and also ensures that the
content of the image files themselves are added to the archive.

This is assuming that HTML itself always generate images referencing the name
only:

    <img id='my-unieque-id' src='./tree.png' />

NOTE: only PNG files are supported, and they will always be treated as PNG
files even if their file names might appear as tree.jpg, tree.pdf, etc.,
regardless.

# Handling REF in HTML translation

In HTML translation, the REF(s) are not directly translated first by translateHTML() 
function and rather a string such as [#](chap1:intro) is inserted into the document.

However, the latest changes in translateHtml() has been to generate a new output
that is called 'chaps' in addition to 'htmls'. This output can be considered metadata
that provide location information of chapters, sections, subsections, images, etc.,
that were encountered during the HTML translation. For chapters/sections, it saves
the index number of the 'htmls' output that started that chapters/sections. For 
external images encountered it saves the src string. If a chapter/section has a label
defined then it is saved in there as well. 

This allows for a post-processing that is to replace all occurrances of 
strings such as [#](chap1:intro) in the tranlsated HTML so that it now replaced
with a string such as "1". The replaceRef() function does just that and must
now be called immediately after translateHtml() has completed.

The replaceRef() takes two parameters, the 'htmls' and 'chaps' output
of translateHtml(). It returns a new 'htmls' array that is exact the same
number of lines except for that all occurrances of [#](chap1:intro) 
and others have been replaced.

# Required LATEX packages 

    \usepackage{luatexja-fontspec}
    \usepackage{luatexja-ruby}
      For allowing CJK characters to show up in LuaLaTeX. 

    \usepackage{geometry}
      For setting left margins, right margins, and top margins 
      of the generated PDF page.

    \usepackage{graphicx}
      For \includegraphics command.

    \usepackage{subcaption}
      For \begin{subfigure} environment.

    \usepackage{caption}
      For \caption*{...} 

    \usepackage{enumitem}
      Improvements version of the classic \begin{itemize}, 
      \begin{enumerate}, and \begin{description} environments.

    \usepackage{mathtools}
    \usepackage{amsfonts}
    \usepackage{amssymb}
    \usepackage{unicode-math}
      Defines many math symbols.

    \usepackage{changepage}
      Deprecated.

    \usepackage{stmaryrd}
    \usepackage{wasysym}
    \usepackage{textcomp}
      Defines many symbols used in text mode such as \textrightarrow.

    \usepackage{xfrac}
      Defines \sfrac macro that used in math. (Deprecated)

    \usepackage[unicode]{hyperref}
      Defines \href, \url, and others. Also allows for generating 
      of PDF bookmarks.

    \usepackage{anyfontsize}
      Defines \selectfont{}

    \usepackage{fancyvrb}
      Deprecated

    \usepackage{tikz}
      For \begin{pgfpicture} and \begin{tikzpicture}

    \usepackage[normalem]{ulem}
      For \underline.

    \usepackage{listings}
      For \begin{lstlisting}

    \usepackage{quoting}
      Deprecated. 

    \usepackage{csquotes}
      Deprecated.

    \usepackage{booktabs}
      For \toprule, \midrule, and \bottomrule.

    \usepackage{xtab}
    \usepackage{ltablex}
      For \begin{xtabular} environment. It turns out that if 
      *ltablex* package is not included there are some weired 
      compilation errors from lualatex. Including this package 
      seems to make it goes away.

    \usepackage{xifthen}
      For \ifthenelse command.

# Specifying images   

The images are specified within a PICT block. 

    /// 
    image tree.png
    ///

By default an image is always displayed in the full width of the page. In LATEX
it is \linewidth.

    \includegraphics[width=\linewidth](tree.png)

However, you can override this specification by providing a fixed width.

    /// 
    image [width:4cm] tree.png
    ///

In this case the image will be set to a width of 4cm.

    \includegraphics[width=4cm](tree.png)

If you say width:auto then the width= option is to be left out and thus the
natural width of the image is to be shown.

    /// 
    image [width:auto] tree.png
    ///

    \includegraphics[](tree.png)

If you need to set the image to a different proportion other than 100% of the
page width, do not provide a width option with the image itself but provide an
"adjust" line before the image. 

    /// 
    adjust .50
    image tree.png
    ///

    \includegraphics[width=.50\linewidth](tree.png)

The "adjust" line allows you to adjust the widthes of multiple images:

    /// 
    adjust .50 .45
    image tree.png
    image fish.png
    ///

    \includegraphics[width=.50\linewidth](tree.png)~\includegraphics[width=.45\linewidth](fish.png)

Using "adjust" line width two numbers also automatically assumes that the
following two images should be placed in the same row with the given
proportions specified. For LATEX the translation has to ensure that there are
no blanks or line brakes inserted between the two \includegraphics commands for
tree.png and fish.png files, when the goal is to typeset two images right next 
to each other side-by-side.

However, if the widthes of the image are also provided as part of the image
options, then the width of that images will be used instead, overriding the
proportion provided by "adjust". In the following example the actual width
of 2cm and 3cm is used instead of the percentage of the \linewidth.

    /// 
    adjust .50 .45
    image [width:2cm] tree.png
    image [width:3cm] fish.png
    ///

    \includegraphics[width=2cm](tree.png)~\includegraphics[width=3cm](fish.png)

By default a non-breakable space character that is tilde will be inserted
between any two \includegraphics commands when two images are supposed to be
placed side-by-side. Otherwise, the \includegraphics command will be placed
at the next line, and which gives LATEX the opportunity to place the image
in the next line if necessary.

    /// 
    adjust .50 
    image tree.png
    adjust .45
    image fish.png
    ///

    \includegraphics[width=.50\linewidth](tree.png)
    \includegraphics[width=.45\linewidth](fish.png)

# Enabling/disabling quotation marks for the entire quot-block

By default, a QUOT block is set up so that quotation marks are placed at the 
beginning of the block as well as end. This can be controlled by setting
the following global-option to false.

    % !NTR quotquotation = false

# Enabling auto-rubification for Japanese Kanji Characters

Nitrile comes with a limited set of Japanese Kanji Character vocabulary 
and its phonetic pronunciation in Hiragana. It will allow for auto rubification
of Kanji characters in the following blocks: VRSE, QUOT and TABB. 

You would have to specifically turned this feature by setting the 'autoruby' 
config parameter to a list of the block names:

    % !NTR autoruby = VRSE TABU

This will enable auto-rubification for the block that is VRSE and TABU.
You could also elect to express it using the type of fence that is associated
with each block for expressing that block. Following would have had the
same affect as the one above.

    % !NTR autoruby = --- +++




