const { NitrilePreviewParser } = require('../lib/nitrile-preview-parser');
const { NitrilePreviewSlide } = require('../lib/nitrile-preview-slide');
const utils = require('../lib/nitrile-preview-utils');


var work = async (fname)=>{
  var out = await utils.read_file_async(fname);
  var lines = out.split('\n');
  const parser = new NitrilePreviewParser();
  const translator = new NitrilePreviewSlide(parser);
  parser.read_md_lines(lines);
  translator.translate_blocks();
  var data = translator.to_slide_document();
  return(data);
};

console.log('process.arg=', process.argv);
const fname = process.argv[2];
console.log('fname=', fname);

if(fname){
  work(fname).then(data => console.log(data));
  setTimeout(function(){},1000);
} else {
  console.log("empty file name")
}

