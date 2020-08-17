CONTEXT translation


[ Unicode Math symbols. ]
CONTEXT has some support for math symbols in Unicode.
For example, it does not provide support for \coloneq
symbol but we can type a Unicode character U+2254 directly
inside the math formular and it will work.

    \( A ≔ B \)

When it is translated into a CONTEXT document it becomes

    \math{A ≔ B}

And it just works.

Following is a partial list of common LATEX symbols that
cannot be found on the CONTEXT side that must be
typeset by a Unicode character.

- \coloneq 
- \ctdot

Another interesting fact about CONTEXT is that for the following 
\startpart command which has a "bookmark" entry expected to be
filled in with a string that is to appear as a PDF bookmark,
the value for the "bookmark" field can also contain a \math command
such as the following.

  \startpart[title={A \math{≔} B},reference={},bookmark={A \math{≔} B}]
  
Context will ensure to convert the symbol into a Uniocode string in which
case it will appear as the PDF bookmark correctly. However, for 
slightly more complicated math expression such as the following
it stops working.

  \startpart[title={A \math{≔} B},reference={},bookmark={A \math{\sqrt{2} ≔} B}]



