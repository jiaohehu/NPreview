

# The luatexja-fontspec package

The inclusion of the following packages causes 
the error which is also list below.

  \\usepackage{luatexja-fontspec}
  \\usepackage{luatexja-ruby}
  \\newjfontfamily\\de{dejavusans}
  \\newjfontfamily\\za{zapfdingbats}
  \\newjfontfamily\\cn{arplsungtilgb}
  \\newjfontfamily\\tw{arplmingti2lbig5}
  \\newjfontfamily\\jp{ipaexmincho}
  \\newjfontfamily\\kr{baekmukbatang}

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

# The hyperref package

The hyperref package is stated to have many conflicts with the 
memoir package and is not recommanded. Thus, it is not possible
to click a link such as "Fig.1" to jump to the figure. However,
the correct figure numbering is still there. The figure
numberings are done internally by NITRILE.

# The metapost code

The metapost code that is known to have worked for regular LATEX
classes does not seem to work for memoir. It complains about 
a control sequence not defined. Unsure how to fix the problem.

  ! Undefined control sequence.
  l.299 \mplibtoPDF
                 {
  l.383 \end{mplibcode}


