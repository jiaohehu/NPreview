
const latex = require ('./sphinx-preview-latex.js');

lines = [
  'Hello',
  '',
  'james * $ %',
  '_james_ _yu_',
  '__james__ __yu__',
  '',
  '~~~',
  '$include <stdio>',
  '~~~',
]

lines2 = [
  '% !BOOK',
  ': ch1.md',
  ': ch2.md',
]

latex.toLUALATEX(lines2,'.')
    .then((out) => {
        console.log(out);
    });

