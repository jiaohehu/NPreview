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

async function read_file_async (filename) {

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

async function read_image_file_async (filename) {

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

async function write_file_async (filename, data) {

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

function get_mine_type_from_signature (signature) {

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

function to_bool (val) {

  ///
  /// given a string, return a boolean value
  ///
  /// to_bool("1"); //true
  /// to_bool("12"); //true
  /// to_bool("12.5"); //true
  /// to_bool("1005"); //true
  /// to_bool("0"); //false
  /// to_bool("0.0"); //false
  /// to_bool(" "); //false
  /// to_bool(""); //false
  /// to_bool(undefined); //false
  /// to_bool(null); //false
  /// to_bool('blah'); //false
  /// to_bool('yes'); //true
  /// to_bool('on'); //true
  /// to_bool('YES'); //true
  /// to_bool('ON'); //true
  /// to_bool("true"); //true
  /// to_bool("TRUE"); //true
  /// to_bool("false"); //false
  /// to_bool("FALSE"); //false
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

function is_number (inputValue) {
  return ((parseFloat(inputValue) ==0 || parseFloat(inputValue)) && !isNaN(inputValue)); 
}

async function to_glyphs(fname) {
  var out = await read_file_async(fname);
  var lines = out.split('\n');
  var o = [];
  for(var line of lines){
    var l = extract_all_unicode_patterns(line);
    o = o.concat(l);
  }
  return o.join('\n');
}

async function to_fontmap(fnames){
  var fontmap = new Uint8Array(0x10000);
  var a = ['jp','tw','cn','kr','de'];
  for (let fname of fnames){
    var xxout = await read_file_async(fname);
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

async function run_fontmap(args){
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
  return  to_fontmap(myfiles);
}

async function run_glyphs(args){
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
  return to_glyphs(myfile);
}

module.exports = { 
  read_file_async,
  read_image_file_async,
  write_file_async,
  get_mine_type_from_signature,
  to_bool,
  is_number,
  to_glyphs,
  to_fontmap,
  run_glyphs,
  run_fontmap
}

