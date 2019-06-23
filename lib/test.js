
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

var out = latex.toLUALATEX(lines);
console.log(out);

