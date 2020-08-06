# Preview REF 

In HTML translation, the REF(s) are not directly translated first by
translateHTML() function and rather a string such as [[#chap1:intro#]] is
inserted into the document.

However, the latest changes in translateHtml() has been to generate a new output
that is called 'chaps' in addition to 'htmls'. This output can be considered
metadata that provide location information of chapters, sections, subsections,
images, etc., that were encountered during the HTML translation. For
chapters/sections, it saves the index number of the 'htmls' output that started
that chapters/sections. For external images encountered it saves the src string.
If a chapter/section has a label defined then it is saved in there as well.

This allows for a post-processing that is to replace all occurrances of strings
such as [[#chap1:intro#]] in the tranlsated HTML so that it now replaced with a
string such as "1". The replaceRef() function does just that and must now be
called immediately after translateHtml() has completed.

The replaceRef() takes two parameters, the 'htmls' and 'chaps' output of
translateHtml(). It returns a new 'htmls' array that is exact the same number of
lines except for that all occurrances of [[#chap1:intro#]] and others have been
replaced.
