'use babel';

const path = require('path');
const fontmap = require('./sphinx-preview-fontmap');

class SphinxPreviewParser {

  constructor() {
  }

  /*
  Return a string that is the HTML
  */
  toBLOCKS(lines) {
    var the_directive = '';
    var the_directive_n = 0;
    var v = '';
    var n = 0;
    var i = 0;
    var o = [];
    var nblocks = 0;
    var nlines = 0;
    var row = 0;
    var row2 = 0;

    /// start processing all lines of the editor
    while (lines.length > 0) {

      var [ para, lines, the_fence ] = this.readPara(lines);
      if (para.length == 0) {
        continue
      } else if (para.length == 1 && para[0] === '') {
        row = nlines;
        nlines++;
        row2 = nlines;
        continue
      }

      /// increment block count
      ++nblocks;
      row = nlines;
      nlines += para.length;
      row2 = nlines;

      /// Remove the last empty line if any
      if (para[para.length-1].length == 0) {
        para = para.slice(0,para.length-1);
        row2 = row2 - 1;
      }

      /// this is a 'BOOK' block
      if (para[0] === '% !BOOK') {
        para = para.slice(1);
        o.push([nblocks,row,row2,'BOOK',0,para]);
        continue;
      } 

      /// first block is automatically treated as the HDGS/0 block
      if (nblocks == 1) {
        var text = this.joinPara(para);
        para = [0,text];
        o.push([nblocks,row,row2,'HDGS',0,para]);
        continue;
      }

      /// this is the directive such as [@itemize]
      var re = /^\[\@(\w+)\]$/;
      v = re.exec(para[0]); 
      if (v) {
        the_directive = v[1];
        the_directive_n = nblocks + 1;
        continue
      }

      /// clear up the directive if it is too old.
      if (nblocks > the_directive_n ) {
        the_directive = ''
      }

      // this is the VRSE block
      if (the_fence === '---') {
        [para, n] = this.trimPara(para);
        para = this.trimFences(para);
        o.push([nblocks,row,row2,'VRSE',n,para]);
        continue
      }

      /// this is the CODE block
      if (the_fence === '~~~') {
        [para, n] = this.trimPara(para);
        para = this.trimFences(para);
        o.push([nblocks,row,row2,'CODE',n,para]);
        continue;
      }

      /// this is the PGFP block
      if (the_fence === '///') {
        [para, n] = this.trimPara(para);
        para = this.trimFences(para);
        o.push([nblocks,row,row2,'PGFP',n,para]);
        continue;
      }

      // this is the TERM block
      if (the_fence === '<<<') {
        [para, n] = this.trimPara(para);
        para = this.trimFences(para);
        para = this.parseTERM(para);
        o.push([nblocks,row,row2,'TERM',n,para]);
        continue;
      }

      /// this is the DEF1 block
      var re = /^(\@{1})\s+(\S.*)$/;
      if (re.test(para[0])) {
        para = this.parseDEF(para,re);
        o.push([nblocks,row,row2,'DEF1',n,para]);
        continue;
      }

      /// this is the DEF2 block
      var re = /^(\@{2})\s+(\S.*)$/;
      if (re.test(para[0])) {
        para = this.parseDEF(para,re);
        o.push([nblocks,row,row2,'DEF2',n,para]);
        continue;
      }

      /// this is the DEF3 block
      var re = /^(\@{3})\s+(\S.*)$/;
      if (re.test(para[0])) {
        para = this.parseDEF(para,re);
        o.push([nblocks,row,row2,'DEF3',n,para]);
        continue;
      }

      /// this is the PRIM block
      var re = /^\[\s+(.*?)\s+\]\s*(.*)$/;
      var v = re.exec(para[0]);
      if (v) {
        var lead = v[1];
        var text = v[2];
        for (i=1; i < para.length; ++i) {
          /// candidate for line join
          text = this.joinLine(text,para[i]);
        }
        para = [lead,text];
        o.push([nblocks,row,row2,'PRIM',0,para]);
        continue;
      }

      /// this is the SECO block
      var re = /^\[\[\s+(.*?)\s+\]\]\s*(.*)$/;
      var v = re.exec(para[0]);
      if (v) {
        var lead = v[1];
        var text = v[2];
        for (i=1; i < para.length; ++i) {
          /// candidate for line join
          text = this.joinLine(text,para[i]);
        }
        para = [lead,text];
        o.push([nblocks,row,row2,'SECO',0,para]);
        continue;
      }

      /// this is the HDGS block
      var re = /^(\#{1,})\s+(.*)$/;
      if ((v = re.exec(para[0])) !== null) {
        var cat = v[1];
        var text = v[2];
        for (i=1; i < para.length; ++i) {
          /// candidate for line join
          text = this.joinLine(text,para[i]);
        }
        para = [cat.length,text];
        o.push([nblocks,row,row2,'HDGS',0,para]);
        continue;
      }

      /// This is a PLST block
      var re = /^(\s*)(\-|\*|\d+.)\s+\S/;
      v = re.exec(para[0]);
      if (v) {
        [para, n] = this.trimPara(para);
        para = this.parsePLST(para);
        o.push([nblocks,row,row2,'PLST',n,para]);
        continue
      }

      // This is a default block      
      if (true) {
        [para, n] = this.trimPara(para);
        /// a candidate for line join
        para = this.joinPara(para);
        o.push([nblocks,row,row2,'',n,para]);
        continue;
      }

    }

    return o;
  }

  /*
   Read a paragraph and return the paragraph, the unread lines. 
   and the fence if there is any.
   
   For a paragraph with fence, the returned paragraph is from the 
   first fence down the last fence. For a paragraph without fence,
   the first line of the paragraph is the first line and the last
   line of the paragraph is the blank immediately after the last
   non-empty line of the paragraph.
  */
  readPara (lines) {
    var para = [];
    var is_fence = false;
    var the_fence = '';
    for (var i=0; i < lines.length; ++i) {
      var line = lines[i];
      line = line.trimRight();
      if (is_fence) {
        if (line === the_fence) {
          para.push(line);
          break
        }
        para.push(line);
        continue
      }
      if (line.length == 0) {
        para.push(line);
        break
      }
      para.push(line);
      if (para.length == 1) {
        if (/^\s*(\~\~\~|\<\<\<|\/\/\/|\-\-\-)\s*$/.test(para[0])) {
          is_fence = true;
          the_fence = para[0];
        }
      }
    }
    return [
      para,
      lines.slice(i+1),
      the_fence.trim()
    ];
  }

  /*
  unmask all inline markups within a text
  */
  unmask (text) {
    var cnt;
    var v;
    var str = ' ' + text;
    var start_i = 0;
    var newtext = '';
    let re = /\s\_{2}(.*?)\_{2}|\s\_{1}(.*?)\_{1}|\s\`{3}\s*(.*?)\s*\`{3}|\s\`{2}\s*(.*?)\s*\`{2}|\s\`\s*(.*?)\s*\`|\[\^\^(.*?)\]|\[\^U\+([0-9a-fA-F]+)\]|\[\^\@(.*?)\]/g;
    while ((v = re.exec(str)) !== null) {
      var i = v.index;
      cnt = str.slice(start_i,i);
      cnt = this.escape(cnt);
      newtext = newtext.concat(cnt);
      if (v[1]) {
        var cnt = v[1];
        newtext += ' ';
        newtext += this.style('strong',cnt);

      } else if (v[2]) {
        var cnt = v[2];
        newtext += ' ';
        newtext += this.style('em',cnt);              

      } else if (v[3]) {
        var cnt = v[3];
        newtext += ' ';
        newtext += this.style('tt',cnt);              

      } else if (v[4]) {
        var cnt = v[4];
        newtext += ' ';
        newtext += this.style('tt',cnt);              

      } else if (v[5]) {
        var cnt = v[5];
        newtext += ' ';
        newtext += this.style('tt',cnt);              

      } else if (v[6]) {
        var cnt = v[6];
        var [rb, rt] = cnt.split(/\s+/);
        if (rb) {
          rb = this.escape(rb);
        } else {
          rb = '';
        }
        if (rt) {
          rt = this.escape(rt);
        } else {
          rt = '';
        }
        //newtext = newtext.concat(`<ruby><rb>${rb}</rb><rt>${rt}</rt></ruby>`);
        newtext += this.style('ruby',[rb,rt]);

      } else if (v[7]) {
        /// xunicode: [^U+4f60] /// 你
        var cnt = v[7];
        cnt = String.fromCodePoint('0x' + cnt);
        newtext += this.style('unicode',cnt);

      } else if (v[8]) {
        /// uri: [^@d3js.org]
        var cnt = v[8];
        //newtext = newtext.concat(` <a style='word-break:break-all' href='${cnt}'><tt>${cnt}</tt></a>`);
        newtext += this.style('uri',cnt);

      }
      start_i = re.lastIndex;
    }
    cnt = str.slice(start_i);
    cnt = this.escape(cnt);
    newtext = newtext.concat(cnt);
    newtext = newtext.slice(1);
    return newtext;
  }

  /*
  Trim the paragraph on the left side and return the number of
  spaces trimmed
  */
  trimPara (para) {
    if (para.length == 0) {
      return [para, 0];
    }
    var re = /^\s+/;
    var v = re.exec(para[0]);
    if (v == null) {
      return [para, 0];
    }
    var n = v[0].length;
    var out = [];
    var i;
    for (i in para) {
      out.push(para[i].slice(n));
    }
    return [out, n];
  }

  /*
  Trim the paragraph to remove fences on the top and/or bottom
  */
  trimFences (para) {
    if (para[para.length-1] === para[0]) {
      para = para.slice(1,para.length-1);
    } else {
      para = para.slice(1);
    }
    return para;
  }

  /*
  Parse the DEF1, DEF2, and DEF3 block
  */
  parseDEF (para, re) {
    var text = '';
    var keys = [];
    var n = 0;
    for (i=0; i < para.length; ++i) {
      if (text) {
        text = this.joinLine(text,para[i]);
        continue
      }
      var v = re.exec(para[i]);
      if (v) {
        keys.push(v[2]);
        continue;
      } 
      var s = para[i];
      var s1 = para[i].trimLeft();
      n = s.length - s1.length;
      text = s1;
    }
    return [ keys, text, n ];
  }

  /*
  Parse the paragraph that is PLST
  */
  parsePLST (para) {
    var items = [];
    //
    var levels = [];
    var lead = '';
    var bull = '';
    var bullet = ''
    //
    var i = 0;
    var re = /^(\s*)(\-|\*|\d+\.)\s+(.*)$/;
    //
    for (i in para) {
      var line = para[i];
      var v = re.exec(line);
      if (v) {
        var lead = v[1];
        var bullet = v[2];
        var text = v[3];
        // check for indentation
        if (levels.length == 0) {
          action = 'push';
        } else {
          var lead0 = levels[levels.length-1][0];
          if (lead0.length < lead.length) {
            action = 'push';
          } else if (lead0.length > lead.length) {
            action = 'pop';
          } else {
            action = 'item';
          }
        }
      } else {
        action = 'text';
      }

      //
      if (action === 'push') {
        if (bullet === '-') {
          items.push(['UL','',text]);
          levels.push([lead,'UL']);
          bull = 'UL';
        } else if (bullet === '*') {
          items.push(['UL','',text]);
          levels.push([lead,'UL']);
          bull = 'UL';
        } else {
          items.push(['OL',bullet.slice(0,bullet.length-1),text]);
          levels.push([lead,'OL']);
          bull = 'OL';
        }
      } else if (action === 'pop') {
        if (bull === 'OL') {
          items.push(['/OL',bullet.slice(0,bullet.length-1),text]);
        } else {
          items.push(['/UL','',text]);
        }
        [lead,bull] = levels.pop();
      } else if (action === 'item') {
        if (bull === 'OL') {
          items.push(['LI',bullet.slice(0,bullet.length-1),text]);
        } else {
          items.push(['LI','',text]);
        }
      } else {
        // 'text', concat the new text to the old of the last text
        if (items.length > 0) {
          var item = items.pop();
          var text0 = item[2];
          text0 = this.joinLine(text0,line);
          item[2] = text0;
          items.push(item);
        }
      }
    }
    //
    while (levels.length > 0) {
      [lead,bull] = levels.pop();
      items.push([`/${bull}`]);
    }
    //
    return items;
  }

  /*
  */
  parseTERM (para) {
    var out = [];
    for (i in para) {
      var v = para[i];
      if (/^\S/.test(v)) {
        out.push(v);
        out.push('');
      } else {
        if (out.length > 0) {
          /// join line candidate
          out[out.length-1] = this.joinLine(out[out.length-1],v);
        }
      }
    }
    return out;
  }

  /*
    parse BOOK block
  */
  parseBOOK (para) {
    var out = [];
    for (var s of para) {
      var re = /^\s*(\:|\#{1,})\s+(.*)$/;
      var v = re.exec(s);
      var path = undefined;
      var text = undefined;
      var sec = '';
      var num = 0;
      if (v) { 
        if (/^\"(.*)\"$/.test(v[2])) {
          text = v[2];
          text = text.slice(1,text.length-1);
        } else {
          path = v[2];
        }
        if (v[1] === ':') {
          sec = 'chapter';
        } else {
          sec = 'section';
          num = v[1].length;
        }
        /// a chapter
        out.push([sec,num,path,text]);
      }
    }
    return out;
  }

  /*
    perform replacements given a list of substrings and target 
    strings.
  */
  replaceSubstrings (src, map) {
    var j = 0;
    var k = 0;
    var out = '';
    while (j < src.length) {
      for (k=0; k < map.length; k+=2) {
        var str1 = map[k];
        var str2 = map[k+1];
        if (src.startsWith(str1,j)) {
          break
        }
      }
      if (k < map.length) {
        /// found!
        out += str2;
        j += str1.length;
      } else {
        out += src[j];
        j++;
      }
    }
    return out; 
  }

  /*
    Given a character code and returns true if 
    it is considered a CJK unified character
  */
  isHan (cc) {
    if (cc >= 0x4E00 && cc <= 0x9FFF) {
      return true;
    } else {
      return false;
    }
  }

  /*
    join two lines
  */
  joinLine (s0, s1) {
    s1 = s1.trimLeft();
    if (!s0) {
      return s1;
    } else if (!s1) {
      return s0;
    } else if (this.isHan(s0.charCodeAt(s0[s0.length-1])) && this.isHan(s1.charCodeAt(0))) {
      return s0.concat(s1);
    } else {
      return s0 + ' ' + s1;
    }
  }

  /*
    join two lines
  */
  joinPara (para) {
    var line = '';
    for (var s of para) {
      line = this.joinLine(line,s);
    }
    return line;
  }

  /*
    fontify in the style of Latex
  */
  fontifyLATEX (text) {
    
    const fontnames = ['jp','tw','cn','kr'];
    var newtext = '';
    var c0 = ''
    var s0 = '';
    var fns0 = 0;
  
    for (var j=0; j < text.length; ++j) {         
    
      var c = text[j];
      var cc = text.charCodeAt(j);
    
      if (cc >= 128 && cc <= 0xFFFF) {
        var fns = fontmap[cc];
      } else {
        var fns = 0
      }

      /// check to see if this char has the same font as the last one
      var fns0 = fns0 & fns; /// bitwise-AND
      if (fns0) {
        /// get the first font: assign 'k' according to the followin rules:
        ////  0b0001 => 0, 0b0010 => 1; 0b0011 => 0; 0b0100 => 2
        var k = 0;
        for (k=0; k < fontnames.length; ++k) {
          if (fns0 & (1 << k)) {
            break;
          }
        }
        var fn = fontnames[k];
        if (fn) {
          /// building up s0 by combining with previous 'c0' and 's0'
          var c0 = c0 + c;
          var s0 = `\\${fn}{${c0}}`;
          continue
        }
      }

      /// by the time we get here the 'c' is either a CJK that does
      //// not agree with previous character in terms of the same font;
      //// or 'c' is not a CJK at all.            
      newtext += s0;
      fns0 = 0;
      c0 = '';
      s0 = '';

      /// it is CJK if 'fns' is not zero
      if (fns) {
        /// get the first font: assign 'k' according to the followin rules:
        ////  0b0001 => 0, 0b0010 => 1; 0b0011 => 0; 0b0100 => 2
        var k = 0;
        for (k=0; k < fontnames.length; ++k) {
          if (fns & (1 << k)) {
            break;
          }
        }
        /// pick a font name
        var fn = fontnames[k];
        /// save the current font map infor for this char
        var fns0 = fns;
        var c0 = c;
        var s0 = `\\${fn}{${c0}}`;
        continue;
      }

      /// we get here if the 'c' is not a CJK
      newtext += c;
    }
    
    newtext += s0;
    return newtext;
  }

}

module.exports = { SphinxPreviewParser };

