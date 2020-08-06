The fontmap

The "fontmap" refers to a database listing which fonts
should be used for certain glyphs. For LATEX and CONTEX,
there is a need to choose a font for certain glyph because
the main font does not provide all glyphs---even though
the glyph might be displayed inside a text editor---a feature
provided by the operating system that automatically locates
a system font for that glyph. However, for LATEX/CONTEX
this process is not there. LATEX/CONTEX simply sticks to
the main font, and when it cannot find the glyph, it either
does nothing, or generate an error.

The default behavior is doing nother for both LATEX/CONTEX.
For CONTEX, there is however a command that can be inserted
into the document that forces it to generate a warning 
in the ".log" file.

  \enabletrackers[fonts.missing]

This command is designed to be placed anywhere in the
preamble section and will instruct the compiler
to generate a warning message in the ".log" file. However,
the character is still going to be missing from the PDF
file regardless.

It is difficult to know which font to use for certain
glyphs as TEXLIVE distribution does not make this    
information easily available. However, there are online
resources that would offer to show a list of fonts
given a glyph. NITRILE tries to address this problem
by chooing a certain number of fonts that are known
to provide coverage for certain range of glyphs. So
far the chosen fonts are the following:

  'de' de.txt name:dejavusans
  'cn' cn.txt name:arplsungtilgb
  'tw' tw.txt name:arplmingti2lbig5
  'jp' jp.txt name:ipaexmincho
  'kr' kr.txt name:baekmukbatang

The first column is the name of the font. The name is
chosen abitrary by following a certain convension. However,
the name necessary because it will become a command in 
LUALATEX, so care must be take to avoid potential
name clashes. 

The second column is a glyph-coverage-file, listing in hexdecimal
number all the code points of glyphs provided by that font. There
are a total of five different files and all them
reside in the 'utils' sub-directory.

The third column is the actual font family name of the font
that is chosen from among all fonts shipped by the 
TEXLIVE-2018 distribution, and the content of file
listed in the second column is generated based on the 
choice of this font. If a different font is to be chosen
then the coverages of the glyphs will need to be updated.

To generate the glyph-coverage-file, first create the following
file, and save it as "my.tex".

  \usemodule [fnt-10]
  \starttext
  \ShowCompleteFont{name:dejavusans}{10pt}{1}
  \stoptext

The \ShowCompleteFont command must choose a name of the font
that is current available and installed. To see a list
of all available fonts, along with their names, run
the following command:

  mtxrun --script fonts --list --all --pattern=* 

The name "dejavusans" should appear under the column 
of "font family". Only the names under that column
should be used. Thus, assuming that the name "dejavusans"
is there, we simply compile the "my.tex" file. This
should create a PDF file named "my.pdf". If opened,
the left-hand column of this PDF file should have a list
of Unicode code points shown in the format of U+XXXXX.
These numbers are the glyphs that are covered by
this font.  The next step is to simply extract
this information to create the font-coverage-file.
We can simply do a select-all on the PDF file,
and then paste it into a text editor, and save
the new file as "my.txt".

NITRILE provides a script named 'to-glyphs', which will
scan the content of "my.txt" and send a
list of UNICODE code points to the stdout.
Each code point is going to be in the form of U+XXXXX. 
This is possible because only the code points in the PDF
are in the form of U+XXXXX, and other texts are not.
Thus, the job of the 'to-glyphs' will be simply
to scan each line of text file and extract all appearances
that is U+XXXXX and then compile them into the final list.

  to-glyphs my.txt >de.txt

Repeat the same process for 'jp' font, by replacing
the string "name:dejavusans" with "name:ipaexmincho",
in "my.tex", followed by compiling, copying and pasting, 
and running the 'to-glyphs' script, to obtain the 'jp.txt'
file.

Once all font-coverage-files are collected, run the script:

  to-fontmap de.txt jp.txt tw.txt cn.txt kr.txt

This script would send to stdout a content that would become
that of the 'nitrile-preview-fontmap.js' file.

  to-fontmap de.txt jp.txt tw.txt cn.txt kr.txt>out
  mv out nitrile-preview-fontmap.js

Note that the use of name 'de.txt', 'jp.txt', etc., are crutial
as the name of the font is constructed solely by the name of 
the input file. The 'to-fontmap' script has been hardcoded
to process only those five different fonts. If in the future
additional fonts are to be included, then the 'to-fontmap' 
script would need to be modified.

The 'nitrile-preview-fontmap.js' file is designed to 
build and export variables 'fontmap' and 'fontnames'.
Following are the first few entries of this file.

  var fontmap = new Uint8Array(0x10000);
  var fontnames = ['de','jp','tw','cn','kr'];
  var de=1,jp=2,tw=4,cn=8,kr=16;
  fontmap[128]=tw;
  fontmap[160]=de+jp+kr;
  fontmap[161]=de+jp+kr;
  fontmap[162]=de+jp+tw;
  fontmap[163]=de+jp+tw;
  ...
  module.exports = { fontmap, fontnames };

The 'fontmap' variable contains information as to which glyph is
provided by which font. For example, the glyph 128 (decimal)
is to be provided by the font 'tw', and glyph 160 (decimal)
is provided by font 'de', 'jp' and 'kr'.  The coverage
by a particular font is done by utilizing a bit field
such that the present of one's place digit denotes the
coverage by font 'de', the two's place digit denotes the
coverage by font 'jp', the four's place digit denotes
the coverage by font 'tw', etc. The 'fontnames'
is designed to work with 'fontify_latex()' and "fontify_contex()'
functions when it comes to figure out where to insert font switch
commands such as \jp, or \switchtobodyfont[jp].
For example the string:

  Hello 日本人 world
  
Would be convertd to 

  {Hello {\jp{}日本人} world}

by the 'fontify_latex()' function, and

  {Hello {\switchtobodyfont[jp]日本人} world}

by the 'fontify_contex()' function.

The \jp and \switchtobodyfont[jp] commands are considered the 
font switch commands. On LATEX, the \jp command and others are 
created by running the following commands in the preamble.

  \newjfontfamily\de{dejavusans}
  \newjfontfamily\jp{ipaexmincho}
  \newjfontfamily\tw{arplmingti2lbig5}
  \newjfontfamily\cn{arplsungtilgb}
  \newjfontfamily\kr{baekmukbatang}

The \newjfontfamily command is part of a "luatexja-fontspec"
package, that is called to create "new" font switch commands.
Thus, after running the prevous five commands five additional
font switch commands are created: \de, \jp, \tw, \cn, and \kr.

Note that the \newjfontfamily command itself is part of the 
following package that must also be included:

  \usepackage{luatexja-fontspec}

This packages supercedes the "fontspec" package. In addition,
following packages supercedes the "ruby" package and should
be used instead to provide better ruby support.

  \usepackage{luatexja-ruby}

The "luatexja-fontspec" is designed to provide improved layout
for CJK characters, without which the CJK characters will not be
split into consecutive lines as CJK characters are by convension
always typed together without blanks between them. Thus, the
traditional layout provided by "fontspec" package would treat
them as a "long" word, and not to try to break them into multiple
lines.  The "luatexja-fontspec" package addresses this issue, at
the same time still provide correct word breaking for roman
letters. This package has been shown to work well not just for
Japanese characters, but for all CJK characters as well.

In addition, this package provides the \newjfontfamily, which is
designed to create new font switch commands which should be
created one per new font. After a new font switch command is
created, it can be called to switch to a particular font.
For example, the \jp font switch will switch a select range
of text to be rendered by the "ipaexmincho" font family.
The syntax of using the font switch is very similar to other
font switches such as \ttfamily:

  {Hello {\jp{}日本人} world}

The newly defined font switch \jp has been shown to mix well
with other font switches such as \ttfamily, \small, etc., such
that after the font switch it still retains the same size, and/or
characteristic specified by previous switches.

  {\ttfamily Hello {\jp{}日本人} world}
  {\small Hello {\jp{}日本人} world}

On CONTEX side the \switchtobodyfont command is the only command
that is needed to switch to a different font family. Instead
of creating a new font switch command such as \jp on LATEX, 
a new font family name such "jp" is needed to refers to the
specific font family that is installed at the system level.
The new font family can be considered as an "alias" to an
existing font family name, which could be quite long and
different to remember. Thus, by creating a specific name
such as "jp" that refers to this font family we can create
some uniformity.

In the following example the font family name "jp" is 
associated with the installed font family name "ipaexmincho". 

  \definefontfamily[de][serif][dejavusans]
  \definefontfamily[za][serif][zapfdingbats]
  \definefontfamily[cn][serif][arplsungtilgb]
  \definefontfamily[tw][serif][arplmingti2lbig5]
  \definefontfamily[jp][serif][ipaexmincho]
  \definefontfamily[kr][serif][baekmukbatang]
  \definefontfamily[de][sans][dejavusans]
  \definefontfamily[za][sans][zapfdingbats]
  \definefontfamily[cn][sans][arplsungtilgb]
  \definefontfamily[tw][sans][arplmingti2lbig5]
  \definefontfamily[jp][sans][ipaexmincho]
  \definefontfamily[kr][sans][baekmukbatang]

It has been observed that the sometimes font size switch such as
\small does not propergate after a new font family has been
switched to.

  {\small Hello {\switchtobodyfont[jp]日本人} world}

But it seems to have worked well if we were to define our
own font size switches and uses them instead. Following
command has been part of the translated CONTEX document
that serves to define new font size switches.

  \definefontsize[sm]
  \definefontsize[xsm]
  \definefontsize[xxsm]
  \definefontsize[xxxsm]
  \definefontsize[big]
  \definefontsize[xbig]
  \definefontsize[xxbig]
  \definefontsize[huge]
  \definefontsize[xhuge]
  \definebodyfontenvironment
    [default]
    [sm=.9,xsm=.8,xxsm=.7,xxxsm=.5,
     big=1.2,xbig=1.4,xxbig=1.7,huge=2.0,xhuge=2.3]

Each switch is present with a scaling factor that scales up
or down the current body font. The scaling factor has
been carefully chosen to match those found on the LATEX side.
Following table offers a comparison of the scaling factors with 
font switches from the LATEX world as well those of CONTEX.

     LATEX           factor      CONTEX
     -----------------------------------
     tiny            0.5         xxxsm
     scriptsize      0.7         xxsm
     footnotesize    0.8         xsm
     small           0.9         sm
     normalsize      1.0         (empty)
     large           1.2         big
     Large           1.4         xbig
     LARGE           1.7         xxbig
     huge            2.0         huge
     Huge            2.3         xhuge
  
Unlike the counterpart on LATEX, the font size switches on the
CONTEX side can be used directly, instead, each one has to be
mixed with a "prefix".

  {\tfsm Hello {\switchtobodyfont[jp]日本人} world}
  {\tfxsm Hello {\switchtobodyfont[jp]日本人} world}
  {\tfxxsm Hello {\switchtobodyfont[jp]日本人} world}
  {\tfxxxsm Hello {\switchtobodyfont[jp]日本人} world}
  {\tfbig Hello {\switchtobodyfont[jp]日本人} world}
  {\tfxbig Hello {\switchtobodyfont[jp]日本人} world}
  {\tfxxbig Hello {\switchtobodyfont[jp]日本人} world}
  {\tfhuge Hello {\switchtobodyfont[jp]日本人} world}
  {\tfxhuge Hello {\switchtobodyfont[jp]日本人} world}

  {\sssm Hello {\switchtobodyfont[jp]日本人} world}
  {\ssxsm Hello {\switchtobodyfont[jp]日本人} world}
  {\ssxxsm Hello {\switchtobodyfont[jp]日本人} world}
  {\ssxxxsm Hello {\switchtobodyfont[jp]日本人} world}
  {\ssbig Hello {\switchtobodyfont[jp]日本人} world}
  {\ssxbig Hello {\switchtobodyfont[jp]日本人} world}
  {\ssxxbig Hello {\switchtobodyfont[jp]日本人} world}
  {\sshuge Hello {\switchtobodyfont[jp]日本人} world}
  {\ssxhuge Hello {\switchtobodyfont[jp]日本人} world}

The word "tf" and "ss" are the prefixes that must appear before
the word "sm", "xsm", etc. The word "tf" refers to the default
"Serif" style font, or the one provided by the \rm switch.  The
word "ss" refers to the "Sans Serif" style font, or the one
provided by the \ss switch.

Thus, \tfsm would means a "default font scaled by 0.9", and \sssm
would mean a "Sans Serif version of the current body font scaled
by 0.9".

In general, CONTEX uses the following prefix(es) for 
referring to various styling of the font. 

  \tf   normal
  \it   italic
  \sl   slanted
  \bf   bold-normal 
  \bi   bold-italic
  \bs   bold-slanted

For example, to change to bold, one would use \bf, as in 

  {\bf Hello}

This style of usage implies that the font size remains 
the same. However, if font size is also to be changed then
the font size switch follows it.
For example: \bfsm, \bfxsm, \bfxxsm, etc.

  {\bfsm Hello {\switchtobodyfont[jp]日本人} world}
  {\bfxsm Hello {\switchtobodyfont[jp]日本人} world}
  {\bfxxsm Hello {\switchtobodyfont[jp]日本人} world}
  {\bfxxxsm Hello {\switchtobodyfont[jp]日本人} world}
  {\bfbig Hello {\switchtobodyfont[jp]日本人} world}
  {\bfxbig Hello {\switchtobodyfont[jp]日本人} world}
  {\bfxxbig Hello {\switchtobodyfont[jp]日本人} world}
  {\bfhuge Hello {\switchtobodyfont[jp]日本人} world}
  {\bfxhuge Hello {\switchtobodyfont[jp]日本人} world}

In this case, if a "Sans Serif" style is also desired,
then \ss should appear as the first part of the switch.

  {\ss\bfsm Hello {\switchtobodyfont[jp]日本人} world}
  {\ss\bfxsm Hello {\switchtobodyfont[jp]日本人} world}
  {\ss\bfxxsm Hello {\switchtobodyfont[jp]日本人} world}
  {\ss\bfxxxsm Hello {\switchtobodyfont[jp]日本人} world}
  {\ss\bfbig Hello {\switchtobodyfont[jp]日本人} world}
  {\ss\bfxbig Hello {\switchtobodyfont[jp]日本人} world}
  {\ss\bfxxbig Hello {\switchtobodyfont[jp]日本人} world}
  {\ss\bfhuge Hello {\switchtobodyfont[jp]日本人} world}
  {\ss\bfxhuge Hello {\switchtobodyfont[jp]日本人} world}

Following is how to combine \sl with the font size switches,
and optionally with \ss.

  {\slsm Hello {\switchtobodyfont[jp]日本人} world}
  {\slxsm Hello {\switchtobodyfont[jp]日本人} world}
  {\slxxsm Hello {\switchtobodyfont[jp]日本人} world}
  {\slxxxsm Hello {\switchtobodyfont[jp]日本人} world}
  {\slbig Hello {\switchtobodyfont[jp]日本人} world}
  {\slxbig Hello {\switchtobodyfont[jp]日本人} world}
  {\slxxbig Hello {\switchtobodyfont[jp]日本人} world}
  {\slhuge Hello {\switchtobodyfont[jp]日本人} world}
  {\slxhuge Hello {\switchtobodyfont[jp]日本人} world}

  {\ss\slsm Hello {\switchtobodyfont[jp]日本人} world}
  {\ss\slxsm Hello {\switchtobodyfont[jp]日本人} world}
  {\ss\slxxsm Hello {\switchtobodyfont[jp]日本人} world}
  {\ss\slxxxsm Hello {\switchtobodyfont[jp]日本人} world}
  {\ss\slbig Hello {\switchtobodyfont[jp]日本人} world}
  {\ss\slxbig Hello {\switchtobodyfont[jp]日本人} world}
  {\ss\slxxbig Hello {\switchtobodyfont[jp]日本人} world}
  {\ss\slhuge Hello {\switchtobodyfont[jp]日本人} world}
  {\ss\slxhuge Hello {\switchtobodyfont[jp]日本人} world}








