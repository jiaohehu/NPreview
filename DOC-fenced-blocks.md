# Fenced blocks

Nitrile support fenced blocks.

The fenced blocks are those that must be started by the appearence of triple
grave-accent at the beginning of a line, followed by a single word and nothing
else.

Nitrile utilizes the idea of a fenced block to allow for showing contents of a
varieties of structures. For example, a MATH block is to show LATEX
display-math expressions, a EQTN block is to show LATEX equations, a CODE block
is to show computer software codes, and a TABL block is to show texts arranged
in tabular formations, etc.  

    ``` math
    a^2 + b^2 = c^2

    ```

or

    ``` code
    num1 = 15
    num2 = 12
    sum = num1 + num2
    print("Sum of {0} and {1} is {2}" .format(num1, num2, sum))
    ```

The single word after the triple grave-accent symbols describes the name of the
block.  When absent, it is assumed to be MATH. The name is case insensitive.

Following fenced blocks are recognized:

-   imgs block
-   line block
-   long block
-   tabl block
-   tabf block
-   tabb block
-   term block
-   quot block
-   center block
-   flushright block
-   flushleft block
-   eqtn block
-   math block
-   verb block
-   code block

Note that following block names are reserved internally that are assigned to
non-fenced blocks:

-   text block
-   sample block
-   tabular block
-   description block
-   list block
