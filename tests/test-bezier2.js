const { NitrilePreviewNode } = require('/Users/james/github/nitrile-preview/lib/nitrile-preview-node');
const { NitrilePreviewLatex } = require('/Users/james/github/nitrile-preview/lib/nitrile-preview-latex');
const parser = new NitrilePreviewLatex();

const input = `
Test

Hello world!
`;

var [main, flags] = parser.toFlow(input.split('\n'), 0, 'nofilename.txt');
var config = parser.toConfig(flags);
console.log(main);
console.log(config);
