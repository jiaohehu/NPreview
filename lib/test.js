
const latex = require ('./sphinx-preview-latex.js');

lines = [
  'james * $ %',
  '_james_ _yu_',
  '__james__ __yu__',
  '',
  '~~~',
  '$include <stdio>',
  '~~~',
]

var out = latex.toTEXT(lines);
console.log(out);

