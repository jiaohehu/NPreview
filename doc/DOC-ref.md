# Handling LaTeX Labels 

Labels in LaTeX are done using commands `\label{}`
and `@ref{}`. The first command is placed next to a chapter,
section, subsection, etc., to allow for a special name to be
attached to this particular chapter, section or subjection,
so that future references to this chapter, section, or subject
can be done by simply referring to it using this special
name. 

    \chapter{My Chapter}\label{mych}

When referring to this chapter, section, or subsection,
the second command is used.

    Please see @ref{mych}

With Nitrile, the first command is always generated with a chapter,
a section, subsection, or subsubsection. The special name is 
always in the form of <filename>:<block-no>. For example, given
the following source MD file:

    My Title

    # My Section

The LATEX output would have looked like this:

    \title{My Title}
    \maketitle
    \section{My Section}\label{myfile:2}

The first section "My Section" will have a label named "myfile:2".  Assime that
this MD file is saved as `myfile.md`. The "2" here is the second block because
the first block is "My Title". You can place a '.label' option in front of the
section.

    My Title

    .label sec1
    # My Section

After you have generated the LATEX file the output would have looked like this:

    \title{My Title}
    \maketitle
    \section{My Section}\label{myfile:sec1}

To reference to a section the source MD file would need to follow the syntax of
`[[#sec#]]` when referring to a label within the same MD document. Since
Nitrile follow a convention of using a colon to separate file name and the
label, you must avoid using colon in your label. This convention allows for
referring to a label in a different source MD file using a syntax such as
`[[#myfile2:sec5#]]`, where the source MD file is named "myfile2.md" and 
the label within that file is "sec5".

Nitrile will try to detect that when you specify a label such as
`[[#sec#]]` such that it does not have a colon in it, and it will fix this
by prefixing the filename of the source document so that it will actually
become `[[#myfile:sec#]]`.



