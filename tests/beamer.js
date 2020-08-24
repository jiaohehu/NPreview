const { NitrilePreviewParser } = require('../lib/nitrile-preview-parser');
const { NitrilePreviewBeamer } = require('../lib/nitrile-preview-beamer');
const utils = require('../lib/nitrile-preview-utils');

var work = async ()=>{
  var out = await utils.read_file_async(fname);
  var lines = out.split('\n');
  const parser = new NitrilePreviewParser();
  const translator = new NitrilePreviewBeamer(parser);
  parser.read_md_lines(lines);
  translator.translate_blocks();
  var data = translator.to_beamer_document();
  return(data);
};

console.log(process.argv);
const fname = process.argv[2];
console.log(fname);

if (fname) {
  work().then(x => console.log(x));
  setTimeout(function () { }, 1000);
}else{
  console.log("Empty file name");
}

