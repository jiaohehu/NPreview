# Previewing of Math

HTML Preview math is supported through generation of inline SVG that
would simulate the look of Math formula seen with a LATEX document.

However, not all Math syntax supported by LATEX are recognized. Nitrile
preview only recognizes a subset of these symbols. This document discusses
the syntax that is supported by Nitrile.

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
    \left.

    "\\right\\lbrace"
    "\\right\\lbrack"
    "\\right\\llbracket"
    "\\right\\langle"
    "\\right)"
    "\\right\\lVert"
    "\\right\\lvert"
    "\\right\\lceil"
    "\\right\\lfloor"
    \right.

## Supported LATEX commands

    \text
    \binom
    \frac
    \sqrt

## Supported LATEX font variants

    \mathbb{ABab12}
    \mathscr{ABab12}
    \mathcal{ABab12}
    \mathit{}
    \mathrm{}

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

## Following matrix are supported:

    \begin{matrix} ... \end{matrix}
    \begin{pmatrix} ... \end{pmatrix}
    \begin{bmatrix} ... \end{bmatrix}
    \begin{Bmatrix} ... \end{Bmatrix}
    \begin{vmatrix} ... \end{vmatrix}
    \begin{Vmatrix} ... \end{Vmatrix}

## Special notes

- A matching \begin{somename} and \end{somename} environment for which the
  name of the environment is not one of the recognized one will simply be
  treated as a braced expression.

- If a \begin{name1} is found for which there is no matching \end{name1}
  then the rest of the expression after \begin{name1} is treated as part
  of that environment.

## Behavior that is different than LATEX:      

- In LATEX, The double-backslash (`\\`) in a inline math will actually cause a
  line break in PDF file. In PREVIEW math, a double-backslash is shown
  as a double-backslash.

- In LATEX, the ampersand (`&`) in a inline math that is not part of a
  \begin{matrix} will not show up in the PDF file. In PREVIEW math, the
  ampersand is shown as an ampersand.

## Known problems

- The `\bar{x}` has left a larger gap between the top bar and the letter x
  then the one done by LATEX.
