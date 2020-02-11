# Auto rubifying of Japanese Text

Nitrile comes with a limited set of Japanese Kanji Character vocabulary
and its phonetic pronunciation in Hiragana. It will allow for auto rubifying
of Kanji characters in the SAMP block only. Since this process is expensive,
it needs to be enabled. To enable it, set the 'sampruby' config flag to
'true'.

    % !NTR sampruby = true

Auto rubifying is done by using a built-in database of some known Japanese text
strings and its associated pronunciations (ruby strings)

    簡単　－＞　かんたん

The Parser::buildRubyMap() is called once to initialize an array of items
where each element is a two-item array. Two-item array contains the short
japanses text and its phonetic part, for example, 簡単 and かんたん. Note
the methed is named to return a map but it does not return a JavaScript
Map object. It returns an Array.

The Array that is returned is assigned to be a member of the Parser Object
itself, named this.rubymap.

The this.rubymap member is accessed as read-only by Parser::rubify to search
and and see if any of the known short Japanese text appears in the 'src' string
that is the input argument of the function call Parser::rubify. The goal
of Parser::rubify() method is to return a new string that is

    This is <ruby><rb>簡単</rb><rt>かんたん</rt></ruby>.

For an input string that is:

    This is 簡単.

Given that 簡単 is a know entry in Parser::rubymap.

The Parser::rubify() is used for both LATEX and HTML generation. Since these
two formats are different, Parser::rubify() calls a virtual method

    this.extractRubyItems()

to actually build the following string:

    <ruby><rb>簡単</rb><rt>かんたん</rt></ruby>

This construction of this string is implemented by
Html::extraRubyItems() method. The Latex::extraRubyItems() method
implements a different string that is:

    \ruby{簡単}{かんたん}

There is a duplication of the code in the implementation of the

    Html::extraRubyItems(), and
    Html::extraRubyItems()

methods.

One of the important piece of the logic is to figure out the boundary of
the phonetic component. This is because not all part of the short Japanese
text need to be placed a phonetic part at the top. Only the kanji's do.

For example, the 'rubymap' will hold one of the entry that is

    "近く","ちかく"

The style of phoneticize the Japanese phrase is to add ちか at the top of 近,
and leave the く untouched. So for HTML generation the returned string from
Html::extraRubyItems() should be:

    <ruby><rb>近</rb><rt>ちか</rt><rb>く</rb><rt></rt></ruby>

And the string returned by Latex::extraRubyItems() should be:

    \ruby{近}{ちか}\ruby{く}{}

Thus, there are complex logic implemented in both places to figure how
how to break the short japanese text such as 近く into 近 and く
