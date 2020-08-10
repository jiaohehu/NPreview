@@ Table @ref{utf8encoding}
  UTF-8 encoding table

  Bits |Min      |Max       |Byte-1   |Byte-2   |Byte-3
  -----|---------|----------|---------|---------|---------
  7    |U+0000   |U+007F    |0xxxxxxx |         |
  11   |U+0080   |U+07FF    |110xxxxx |10xxxxxx |
  16   |U+0800   |U+FFFF    |1110xxxx |10xxxxxx |10xxxxxx
  

The first row represents the encoding of a ASCII grapheme
that is in the range of U+0000 and U+007F. The encoding is a
single byte that with its lowest 7-bit holding the numerical
