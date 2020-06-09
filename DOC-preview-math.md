# Previewing of Math

HTML Preview math is supported through generation of inline SVG that
would simulate the look of Math formula seen with a LATEX document.

However, not all Math syntax supported by LATEX are recognized. Nitrile
preview only recognizes a subset of these symbols. This document discusses
the syntax that is supported by Nitrile.

## Supported LATEX left/right fences

    \left\lbrace
    \left\lbrack
    \left\llbracket
    \left\langle
    \left(
    \left[
    \left\lVert
    \left\lvert
    \left\lceil
    \left\lfloor
    \left.

    \right\rbrace
    \right\rbrack
    \right\rlbracket
    \right\rangle
    \right)
    \right]
    \right\rVert
    \right\rvert
    \right\rceil
    \right\rfloor
    \right.

## Supported LATEX commands

    \text{Hello world}
    \operatorname{x}
    \frac{1}{4}
    \sqrt{x + y}
    \sqrt[3]{x + y}
    \od{x^2}{x}
    \od[2]{x^2}{x}
    \od[3]{x^2}{x}
    \pd{x^2}{x}
    \pd[2]{x^2}{x}
    \pd[3]{x^2}{x}
    \dif{x}
    \pmod{m}
    \pmod{5}
    \pmod{7}
    \binom{4}{0}    
    \binom{4}{1}    
    \binom{4}{2}    

## Supported LATEX stretchable overhead symbols

    \widehat     
    \overline    
    \overleftrightarrow 
    \overrightarrow 

## Supported LATEX non-stretchable overhead symbols

    \dot         
    \ddot        
    \dddot       
    \ddddot      
    \bar         
    \vec         
    \mathring    
    \hat         
    \check       
    \grave       
    \acute       
    \breve       
    \tilde       

## Supported LATEX font variants

    \mathbb{ABab12}       Double-struck
    \mathbf{ABab12}       Bold-face
    \mathcal{ABab12}      Cal (Script Capital L U+2112, etc.)
    \mathit{ABab12}       Italic (default for single-letter variable)
    \mathrm{ABab12}       Roman (regular letter or digit)

NOTE: only the upper-case letter, lower-case letter, and digits are supported.
No spaces are allowed.

NOTE: for mathbb-variant, which is for double-strike variant,
the following letters in Unicode are having a "different" appearance
than the other ones:

    C  - field of complex numbers
    H  - field of quaternion numbers, which is a number system that extends the complex numbers.
    N  - field of all natural numbers, which must be a positive integers: 1, 2, 100, ...
    P  - field of all prime number
    Q  - field of rational numbers, excluding irrational number such as PI
    R  - field of all real numbers, including integers and floating point numbers
    Z  - field of all integers, including negative integers and zeros.

Note that \mathscr is not supported. Use \mathcal instead.

## Supported LATEX spaces

    \; 
    \, 
    \:
    \quad
    \qquad

## Subscript and superscript for \sum, \lim and \int

Supports are provided for using these commands for showing the summation, limits, and
integral equations.

    \lim_{i \to \infty} \frac{1}{i}

Or

    \sum_{i=0}^{100} i^2

Or

    \int_{0}^{100} x dx

## Display math mode for \sum, \lim and \int

Note that when `\sum`, `\lim` and `\int` are paired with subscript and/or
superscript then there will be distinction made whether it is a 'inlinemath'
mode or a 'displaymath' mode. The displaying of summation symbol, the lettering
of "Lim", and/or the integration symbol will depends on choice of these two
display modes. In particular, when the 'displaymath' mode is detected efforts
are made to make these symbols appear larger.

## The \displaystyle 

The `\displaystyle` command is supported. When encountered, the result of the 
math is shown as display mode.

## Following matrix are supported:

    \begin{matrix} ... \end{matrix}
    \begin{pmatrix} ... \end{pmatrix}
    \begin{bmatrix} ... \end{bmatrix}
    \begin{Bmatrix} ... \end{Bmatrix}
    \begin{vmatrix} ... \end{vmatrix}
    \begin{Vmatrix} ... \end{Vmatrix}

## The compact layout mode 

The compact layout mode is entered for subscript and superscript, in which case
certain gaps such as those that are added around operators such as plus and
minus will be suppressed, thus the expression will appear more compact and take
up less space horizontally.

## The matrix element

Matrix elements always appear as 'inlinemath' style, even though the matrix
itself might be shown as 'displaymath' style.

## Greek letters

Greek letters are going to presented using the following symbols in LATEX.

By default, LATEX uses the following English letters for expressing certain 
Greek letters. They are listed below:

    o    \omicron
    A    \Alpha
    B    \Beta
    E    \Epsilon
    Z    \Zeta
    H    \Eta
    I    \Iota
    K    \Kappa
    M    \Mu
    N    \Nu
    O    \Omicron
    P    \Rho
    T    \Tau
    X    \Chi

With Nitrile, the equivalent symbols on the right hand side column of the
previous list are made available by adding the following definition to the
preamble of the generated LATEX file, allowing you to use it instead of the
English letter on the left hand side column. 

Following is copied from mathspec.sty's Greek-letter definition to allow for
the new commands to be made available:

    \DeclareMathSymbol{\omicron}{\mathord}{letters}{"6F}
    \DeclareMathSymbol{\Alpha}{\mathalpha}{operators}{"41}
    \DeclareMathSymbol{\Beta}{\mathalpha}{operators}{"42}
    \DeclareMathSymbol{\Epsilon}{\mathalpha}{operators}{"45}
    \DeclareMathSymbol{\Zeta}{\mathalpha}{operators}{"5A}
    \DeclareMathSymbol{\Eta}{\mathalpha}{operators}{"48}
    \DeclareMathSymbol{\Iota}{\mathalpha}{operators}{"49}
    \DeclareMathSymbol{\Kappa}{\mathalpha}{operators}{"4B}
    \DeclareMathSymbol{\Mu}{\mathalpha}{operators}{"4D}
    \DeclareMathSymbol{\Nu}{\mathalpha}{operators}{"4E}
    \DeclareMathSymbol{\Omicron}{\mathalpha}{operators}{"4F}
    \DeclareMathSymbol{\Rho}{\mathalpha}{operators}{"50}
    \DeclareMathSymbol{\Tau}{\mathalpha}{operators}{"54}
    \DeclareMathSymbol{\Chi}{\mathalpha}{operators}{"58}

Another benefit of using these commands for the Greek letters is to allow for
PREVIEW to choose Greek letter UNICODE for the previous command, while at the
same time remain commited to using the ASCII UNICODE characters for regular
English letters detected in its math expression.

Following table shows the UNICODE code point that would be used for each
Greek letters:

    "\Alpha"          "&#913;"         
    "\Beta"           "&#914;"         
    "\Gamma"          "&#915;"         
    "\Delta"          "&#916;"         
    "\Epsilon"        "&#917;"         
    "\Zeta"           "&#918;"         
    "\Eta"            "&#919;"         
    "\Theta"          "&#920;"         
    "\Iota"           "&#921;"         
    "\Kappa"          "&#922;"         
    "\Lambda"         "&#923;"         
    "\Mu"             "&#924;"         
    "\Nu"             "&#925;"         
    "\Xi"             "&#926;"         
    "\Omicron"        "&#927;"         
    "\Pi"             "&#928;"         
    "\Rho"            "&#929;"         
    "\Sigma"          "&#931;"         
    "\Tau"            "&#932;"         
    "\Upsilon"        "&#933;"         
    "\Phi"            "&#934;"         
    "\Chi"            "&#935;"         
    "\Psi"            "&#936;"         
    "\Omega"          "&#937;"         

    "\alpha"          "&#945;"         
    "\beta"           "&#946;"         
    "\gamma"          "&#947;"         
    "\delta"          "&#948;"         
    "\epsilon"        "&#949;"         
    "\zeta"           "&#950;"         
    "\eta"            "&#951;"         
    "\theta"          "&#952;"         
    "\vartheta"       "&#x03D1;"       
    "\iota"           "&#953;"         
    "\kappa"          "&#954;"         
    "\lambda"         "&#955;"         
    "\mu"             "&#956;"         
    "\nu"             "&#957;"         
    "\xi"             "&#958;"         
    "\o"              "&#959;"         
    "\pi"             "&#960;"         
    "\rho"            "&#961;"         
    "\varrho"         "&#x03F1;"       
    "\varsigma"       "&#962;"         
    "\sigma"          "&#963;"         
    "\tau"            "&#964;"         
    "\upsilon"        "&#965;"         
    "\phi"            "&#x03D5;"       
    "\varphi"         "&#x03C6;"       
    "\chi"            "&#967;"         
    "\psi"            "&#968;"         
    "\omega"          "&#969;"         
    "\varepsilon"     "&#x03F5;"       


Following are the commands for entering Greek letter in a Math expression that
will be supported in the generated LATEX document as well as in PREVIEW:

    Alpha     \Alpha        Iota      \Iota           Rho       \Rho       
    Beta      \Beta         Kappa     \Kappa          Sigma     \Sigma     
    Gamma     \Gamma        Lambda    \Lambda         Tau       \Tau       
    Delta     \Delta        Mu        \Mu             Upsilon   \Upsilon   
    Epsilon   \Epsilon      Nu        \Nu             Phi       \Phi       
    Zeta      \Zeta         Xi        \Xi             Chi       \Chi       
    Eta       \Eta          Omicron   \Omicron        Psi       \Psi       
    Theta     \Theta        Pi        \Pi             Omega     \Omega     

    alpha    \alpha         iota      \iota           rho       \rho            
    beta     \beta          kappa     \kappa          sigma     \sigma   
    gamma    \gamma         lambda    \lambda         tau       \tau         
    delta    \delta         mu        \mu             upsilon   \upsilon       
    epsilon  \epsilon       nu        \nu             phi       \phi      
    zeta     \zeta          xi        \xi             chi       \chi       
    eta      \eta           omicron   \omicron        psi       \psi        
    theta    \theta         pi        \pi             omega     \omega    

Following are additional commands for the Greek letter that are supported in
the generated LATEX document as well as in PREVIEW:

    vartheta     \vartheta
    varrho       \varrho          
    varsigma     \varsigma             
    varphi       \varphi          
    varepsilon   \varepsilon           

## The commath package

Following commands are supported that are provided by the 'commath' package.

    \usepackage{commath}

- The `\od` command: 

    ``\od{x^2}{x}``
    ``\od[2]{x^2}{x}``

- The `\pd` command:

    ``\pd{x^2}{x}``
    ``\pd[2]{x^2}{x}``

- The `\dif` command:

    ``\dif{x}``

## Special behaviors

- A matching \begin{somename} and \end{somename} environment for which the
  name of the environment is not one of the recognized one will simply be
  treated as a braced expression.

- If a \begin{name1} is found for which there is no matching \end{name1}
  then the rest of the expression after \begin{name1} is treated as part
  of that environment.

- For backslash followed by one or more letters such as \Rot, then it is
  treated as a log-like symbol. The CONTEX/LATEX implementation is to
  generate something like '\;\text{Rot}'. Thus adding some kind of space 
  before it. But it needs work so that the '\;' should not be added
  when it is the first element. And it should also add a '\;' after it 
  if the next element is not a parenthesis. But these bahavior is  
  currently not implemented yet. For HTML this behavior is correctly
  similated.

## Behavior that is different than LATEX:      

- In LATEX, The double-backslash (`\\`) in a inline math will actually cause a
  line break in PDF file. In CONTEX, the same double-backslash does not do 
  anything. Thus, the same double-backslashes are ignored in HTML, 
  LATEX, and CONTEX. The future implementation will try to see if it can
  be used to split a long equation into multiple lines.

- In LATEX, the ampersand (`&`) in a inline math that is not part of a
  \begin{matrix} will not show up in the PDF file. In PREVIEW math, the
  ampersand is shown as an ampersand.

## Known problems

- The `\bar{a}`, `\vec{a}`, and all other variant seems to have left a larger
  gap between the top edge of the letter 'a' and the bar, then the appearance
  done by LATEX. Do not know if this is a problem.

- The font used as integral symbol `\int` on MaxOS X have been observed to have
  over shifted to the right and downwards, thus overlaying part of the text on
  the right hand side of it, making it appear that they are overlapping.  This
  behavior was observed when viewing exported HTML using Safari, Firefox,
  and/or Chrome. 

- The fraction, such as \frac{1}{3} when previewed in HTML, appeared to be a
  little too tall relative to the surrounding text, especailly when 
  LATEX have made it appear a little smaller comparing with the surrounding
  text.

- Need to support \operatorname{}

- When typesetting a SUM operator, the top part if it is a smaller 
  letter i it is left justified. It needs to be center justified.

- Need to shrink the preview math SVG if the font size is set to small.

- For (-a,0) the minus sign should be placed immediate in front of a but
  right now there seems to be a gap between the minus sign and a

- If a unicode math symbol is entered, such as U+2262 NOT IDENTICAL TO, 
  then MATH PREVIEW will display it. However, it will display it without
  treating it as an operator. It is treating it as a text. Thus, this
  symbol gets no extra spacing before and after it.

## LATEX math commands not supported on CONTEX

- operatorname{a} 
  This is simulated as: {\:\mathrm{a}\:}

- ddddot{a} 
  This is currently not supported on CONTEX

- \not\equiv 
  This is not rendered correct on CONTEX; it is rendered
  as a \not followed by \equiv. The solution to get the
  "not congruent" symbol to work on CONTEX is to simply
  enter the Unicode U+2262 symbol (≢)

## LATEX math problems

- For unicode characters such as ℤ (U+2124), it cannot be shown
  on LATEX yet because there is no suitable font found to show
  this glyph.



