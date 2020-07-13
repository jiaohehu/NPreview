'use babel';

const fs = require('fs');

function extract_all_unicode_patterns(line){
  /// 5  U+0000
  ///

  var o = [];
  var re = /(?<!\w)U\+([0-9a-fA-F]+)/g;
  var cnt;
  var v;
  var line = line || '';
  var start_i = 0;
  while ((v = re.exec(line)) !== null) {
    var i = v.index;
    if (v[1] !== undefined) {

      var cnt = v[0]; 
      o.push(cnt);

    } 
    start_i = re.lastIndex;
  }
  return o;
}

async function readFileAsync (filename) {

  /// Returns a Promise that resolves to a string of
  /// the entire file content being read

  return new Promise((resolve, reject)=>{
      fs.readFile(filename, "utf8", function(err, data) {
              if (err) {
                reject(err.toString());
              } else {
                resolve(data.toString());
              }
      });
  });
}

async function readImageFileAsync (filename) {

  /// Returns a Promise that resolves to a NodeJs Buffer() and a mime-type pair
  /// ... [imgbuf,mime]
  
  /// NOTE: that the 'fs' method returns a new Buffer object
  /// and the 'Buffer#toString' method offers a way to 
  /// return a base64-encoded string.

  return new Promise((resolve, reject)=>{
      fs.readFile(filename, null, function(err, imgbuf) {
              if (err) {
                reject(err.toString());
              } else {
                let signature = imgbuf.toString('hex',0,4).toUpperCase();
                var mime;
                switch (signature) {
                    case '89504E47':
                        mime = 'image/png'
                        break;
                    case '47494638':
                        mime = 'image/gif'
                        break;
                    case '25504446':
                        mime = 'application/pdf'
                        break;
                    case 'FFD8FFDB':
                    case 'FFD8FFE0':
                    case 'FFD8FFE1':
                        mime = 'image/jpeg'
                        break;
                    case '504B0304':
                        mime = 'application/zip'
                        break;
                    default:
                        mime = 'unknown'
                        break;
                }
///console.log( `signature type: ${signature}`);
///console.log( `mime type: ${mime}`);
                resolve([imgbuf,mime]);///TODO: harded coded to PNG, this needs to be changed to accound for other image file types
              }
      });
  });
}

async function writeFileAsync (filename, data) {

  /// Returns a Promise that resolves to a string of
  /// the entire file content being read

  return new Promise((resolve, reject)=>{
      fs.writeFile(filename, data, 'utf8', function(err) {
              if (err) {
                reject(err.toString());
              } else {
                resolve(filename);
              }
      });
  });

}

function getMinetypeFromSignature (signature) {

  switch (signature) {
      case '89504E47':
          return 'image/png'
      case '47494638':
          return 'image/gif'
      case '25504446':
          return 'application/pdf'
      case 'FFD8FFDB':
      case 'FFD8FFE0':
      case 'FFD8FFE1':
          return 'image/jpeg'
      case '504B0304':
          return 'application/zip'
      default:
          return 'unknown'
  }
}

function getBool (val) {

  ///
  /// given a string, return a boolean value
  ///
  /// getBool("1"); //true
  /// getBool("12"); //true
  /// getBool("12.5"); //true
  /// getBool("1005"); //true
  /// getBool("0"); //false
  /// getBool("0.0"); //false
  /// getBool(" "); //false
  /// getBool(""); //false
  /// getBool(undefined); //false
  /// getBool(null); //false
  /// getBool('blah'); //false
  /// getBool('yes'); //true
  /// getBool('on'); //true
  /// getBool('YES'); //true
  /// getBool('ON'); //true
  /// getBool("true"); //true
  /// getBool("TRUE"); //true
  /// getBool("false"); //false
  /// getBool("FALSE"); //false
  ///

  if (!val) return false;
  if (typeof val === 'string') {
    val = val.trim();
    if (!val.length) { return false; }
    val = val.toLowerCase();
    if (val === 'true' || val === 'yes' || val === 'on') {
      return true;
    }
    val = +val;
    if (isNaN(val)) return false;
    return (val !== 0);
  }
  if (typeof val === 'boolean') {
    return val;
  }
  if (typeof val === 'number') {
    return !(val == 0);
  }
  return true;

}

function isNumber (inputValue) {
  return ((parseFloat(inputValue) ==0 || parseFloat(inputValue)) && !isNaN(inputValue)); 
}

async function toGlyphs(fname) {
  var out = await readFileAsync(fname);
  var lines = out.split('\n');
  var o = [];
  for(var line of lines){
    var l = extract_all_unicode_patterns(line);
    o = o.concat(l);
  }
  return o.join('\n');
}

async function toFontmap(fnames){
  var fontmap = new Uint8Array(0x10000);
  var a = ['jp','tw','cn','kr','de'];
  for (let fname of fnames){
    var xxout = await readFileAsync(fname);
    var basename = `${fname.slice(0,fname.length-path.extname(fname).length)}`;
    var k = a.indexOf(basename);
    if(k >= 0){
      let xx = 1 << k;
      let lines = xxout.split('\n');
      for(var line of lines){
        line = line.replace('U+','0x');
        let num = parseInt(line);
//console.log(num,line,fname,basename,k,xx);
        if(Number.isFinite(num)){
          if(num > 127 && num < 0x10000){
            fontmap[num] |= xx;
          }
        }
      }
    }
  }
  var o = [];
  o.push(`var fontmap = new Uint8Array(0x10000);`);
  o.push(`var fontnames = [${a.map(x=>`'${x}'`).join(',')}];`);
  o.push(`var ${a.map((x,i) =>`${x}=${1<<i}`).join(',')};`);
  //o.push(`var jp = 1;`);
  //o.push(`var tw = 2;`);
  //o.push(`var cn = 4;`);
  //o.push(`var kr = 8;`);
  //o.push(`var de = 16;`);
  for(var j=128; j < 0x10000; ++j){
    if(fontmap[j]){
      var v = fontmap[j];
      var l = [];
      for(var k=0; k < a.length; ++k){
        if(v & (1 << k)){
          l.push(a[k]);
        }
      }
      //o.push(`fontmap[${j}]=${l.join('+')};`);
      o.push(`fontmap[0x${j.toString(16)}]=${l.join('+')};`);
    }else{
      //o.push(`fontmap[${j}]=0;`);
    }
  }
  o.push(`module.exports = { fontmap, fontnames };`);
  return o.join('\n');
}

async function runFontmap(args){
  args = args.split(' ');
  var myopts = {};
  var myfiles = [];
  while(args.length){
    let item = args.shift();
    if(item.startsWith('--')){
      myopts[item] = 1;
    }
    else {
      myfiles.push(item);
    }
  }
  return toFontmap(myfiles);
}

async function runGlyphs(args){
  args = args.split(' ');
  var myopts = {};
  var myfile = '';
  while(args.length){
    let item = args.shift();
    if(item.startsWith('--')){
      myopts[item] = 1;
    }
    else {
      myfile = item;
    }
  }
  return toGlyphs(myfile);
}


module.exports = { 
  readFileAsync,
  readImageFileAsync,
  writeFileAsync,
  getMinetypeFromSignature,
  getBool,
  isNumber,
  toGlyphs,
  toFontmap,
  runGlyphs,
  runFontmap
}

