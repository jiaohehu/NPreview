EPUB Generation

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
