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
    \begin{cases} ... \end{cases}

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

## Issues and remarks            

- A matching \begin{somename} and \end{somename} environment for which the
  name of the environment is not one of the recognized one will simply be
  treated as a normal braced expression.

- If a \begin{name1} is found for which there is no matching \end{name1}
  then the rest of the expression after \begin{name1} is treated as part
  of that environment and no error is generated.

- For a backslash followed by one or more letters such as \Rot, then it is
  treated as a log-like symbol. For CONTEX/LATEX translation it is to
  generate something like '\;\text{Rot}' to similate this effect. 
  However, this similation is not always perfect.
  First of all, a space \; is always added, even when it is at the beginning
  of an expression. Second, the after-space should be created if \Rot is not
  immediately followed by a parenthesis, which is exactly what \log like 
  operators do.  But this bahavior is not implemented for CONTEX/LATEX
  translation.  For HTML this behavior is correctly similated.

- In LATEX, The double-backslash (`\\`) in a inline math will actually cause a
  line break in PDF file. In CONTEX, the same double-backslash does not do 
  anything. This is to assume that it is not part of a begin-end matrix 
  or cases. However, in NITRILE, a \\ that is part of the top-level
  expression is repurposed to mean to break down a long expression 
  into two or more lines.

- In LATEX, the ampersand (`&`) in a inline math that is not part of a
  \begin{matrix} will not show up in the PDF file. NITRILE has repurposed this
  character as expressing the "alignment point" (this is only when this 
  character is not part of a matrix or cases expression.

- The fraction, such as \frac{1}{3} when previewed in HTML, appeared to be a
  little too tall relative to the surrounding text, especailly when 
  LATEX have made it appear a little smaller comparing with the surrounding
  text.

- If a unicode math symbol is entered, such as U+2262 NOT IDENTICAL TO, 
  then HTML translation will display it. However, it will display it without
  treating it as an operator. It is treating it as a text. Thus, this
  symbol gets no extra spacing before and after it. This problem is the 
  same that is to happen to ther Unicode character that need to be 
  treated as an operator like such as plus-sign or minus-sign, to have
  before and after-space. Right now, all these character are treated 
  as a text, thus, no before and after space is allocated.

- The \operatorname{} is not available on CONTEX. NITRILE
  supports it. It is being
  translated as `{\\:\\mathrm{a}\\:}` if `\operatorname{a}` is 
  detected.

- The ddddot{a} is not supported on CONTEX. Therefore it is
  not provided by NITRILE.

- The \not\equiv symbol is not being rendered correct on CONTEX; 
  it is rendered as a \not followed by \equiv. Thus, the \not\equiv
  is not supported by NITRILE. The solution to have this symbol
  ("not congruent") is to enter this symbol as a Unicode character,
  in a MD document: U+2262 symbol (≢).

- For unicode characters such as ℤ (U+2124), it cannot be shown
  on LATEX yet because there is no suitable font found to show
  this glyph.

- It has been observed if a \lfloor and/or \rfloor symbol is 
  to appear in a LATEX document by itself, then nothing is seen
  in the PDF.  To make it "appear", it must be part of 
  a \left-\right expression: such as \left\lfloor ... \right\rfloor. 
  CONTEX does not this problem. 
  Thus, the solution is to always use \left\lfloor and \right\rfloor.

## Equation numbering

By default, equations are not numbered. However if the equation
is detected to have a label that is at the first part of the expression
immediately after the dollar sign, then this equation is to be
numbered.  On top of that, if multiple equations are "conglomerated"
due to their appearing one after another, then all the equations
will be numbered.

This makes it easy to be implemented in LATEX, as latex provides
two environments, namely, "align" and "gather", that would assign
a number for each one of the equations in the list. If one is to
prefer having a single number for an equation that spans across
multiple lines, then the "split" is the one. The nice thing about
the "split" is that it can be nested inside an "align" or "gather".
See the following.

    \begin{align}
    \begin{split}
    A = a + b + c\\
      = 2a + 2b
    \end{split}
    B = a + b\\
    C = b + c
    \end{align}

However, similar things can not be said for CONTEX. For CONTEX,
There is no "subalignment", or I have tried and it does not 
work. For CONTEX, it is possible to assign numbering to a selected
few equations with a \startmathalign-\stopmathalign block.  And this
is exactly what we are going to do to "simulate" this effect
if some of the equations are considered to be part of a larger "multi-line"
equation where one should only assign a single number. Following
is how to do it in CONTEX.

    \startmathalign[n=1]
    \NC A \NC = a + b + c \NR
    \NC   \NC = 2a + 2b \NR[+]
    \NC B \NC = a + b \NR[+]
    \NC C \NC = b + c \NR[+]
    \stopmathalign

This is to assume that following appears within
a source MD file.

  $ $(#eq:a) A &= a + b + c\\ 
               &= 2a + 2b

  $          B &= a + b

  $          C &= b + c      

Note that in the previous case, only having had detected
the label in the first (main) equation will trigger all
numbering for subsequent sub-equations, regardless if
the subequation is labeled or not. However, without a label
means it is impossible to reliably refer to this equation
using a number that is consistant. Thus, in order to 
refer to sub-equations, one can place additional labels
such as follows.

  $ $(#eq:a) A &= a + b + c\\ 
               &= 2a + 2b

  $ $(#eq:b) B &= a + b

  $ $(#eq:c) C &= b + c      

For a given equation, if a double-backslashes are detected in the 
main expression, (those that are part of a begin-end matrix or 
begin-end cases are not counted), then these backslashes
are interpreted as "line breaks" for a long formular.
This behavior is similar to LATEX "split" environment.

  $ $(#eq:a) A &= a + b + c\\ 
               &= 2a + 2b

In this case, it might be preferrable to have an "alignment 
point" where all equations will be aligned to that point.
This is done by placing a '&' character.

  $ $(#eq:a) C &= a^2 + b^2 + c^2 \\
               &= a^3 + b^3 \\
               &= c^4

Note that only the first '&' will be treated as the alignment
point. All subsequent '&' detected will be ignore.

However, it is possible to similate the "gather" environment
of the LATEX, in which the "alignment point" of each equation
is the middle point of that equation. To enable a "gather"
environment instead of "align", use a double-dollar as the 
leading bullet.

  $$ $(#eq:a) A &= a + b + c\\ 
               &= 2a + 2b

  $ $(#eq:b) B &= a + b

  $ $(#eq:c) C &= b + c      

The double-dollar leading bullet for the first equation 
will tell NITRILE to use a "gather" environment. Otherwise
it uses "align".

It is not necessary for the sub-equations to have a double-dollar
leading bullet, as NITRILE only looks at the double-dollar
leading bullet from the first equation to make the decision.



