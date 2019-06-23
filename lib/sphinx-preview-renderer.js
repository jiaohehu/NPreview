'use babel';

export default {

  /*
  Return a string that is the HTML
  */
  toHTML(lines) {
//console.log('toHTML called!');
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
    var id = 0;
    var metadata = [];
    const step = 0.25;
    /// start processing all lines of the editor
    while (lines.length > 0) {

      var [ para, lines, the_fence ] = this.readPara(lines);
//console.log('lines: '+para);
//console.log(lines);
      if (para.length == 0) {
        continue
      } else if (para.length == 1 && para[0] === '') {
        row = nlines;
        nlines++;
        row2 = nlines;
//console.log('para.length:'+para.length);
//console.log('para[0]:'+para[0].slice(0,20));
//console.log('nlines:'+nlines);
        continue
      }

      /// increment block count
      ++nblocks;
      row = nlines;
      nlines += para.length;
      row2 = nlines;
      id = `sphinx-preview-${nblocks}`;

      /// If a paragraph is non-empty and the last line of
      /// that paragraph is an empty line then that last line
      /// is removed
      if (para[para.length-1].length == 0) {
        para = para.slice(0,para.length-1);
        row2 = row2 - 1;
      }

      /// metadata is an array each of which element
      /// is about the block
      metadata.push([id,row,row2]);

//console.log('para.length:'+para.length);
//console.log('para[0]:'+para[0].slice(0,20));
//console.log('nlines:'+nlines);

      /// the very first block
      if (nblocks == 1) {
        o.push(`<div id='${id}' rows='${row} ${row2}'>`);
        var text = para.join(' ');
        var text = this.escapeHTML(text);
        o.push(`<h1>${text}</h1>`);
        o.push(`</div>`);
        continue;
      }

      /// this is the directive such as [@itemize]
      var re = /^\[\@(\w+)\]$/;
      v = re.exec(para[0]); 
      if (v) {
        o.push(`<div id='${id}' rows='${row} ${row2}'>`);
        the_directive = v[1];
        the_directive_n = nblocks + 1;
        o.push(`</div>`);
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
        o.push(`<div id='${id}' rows='${row} ${row2}' style='margin-left:${(step*n)}cm'>`);
        o.push(`<p>`);
        for (text of para) {
          text = this.unmask(text);
          o.push(`${text}<br/>`);
        }
        o.push(`</p>`);
        o.push(`</div>`);
        continue
      }

      /// this is the CODE block
      if (the_fence === '~~~') {
        [para, n] = this.trimPara(para);
        para = this.trimFences(para);
        o.push(`<div id='${id}' rows='${row} ${row2}' style='margin-left:${(step*n)}cm'>`);
        var text = para.join('\n');
        var text = this.escapeHTML(text);
        o.push(`<pre><code>${text}</code></pre>`);
        o.push(`</div>`);
        continue;
      }

      /// this is the PGFP block
      if (the_fence === '///') {
        [para, n] = this.trimPara(para);
        para = this.trimFences(para);
        o.push(`<div id='${id}' rows='${row} ${row2}' style='margin-left:${(step*n)}cm'>`);
        o.push(`<p>`);
        o.push(`///<br/>`);
        for (i in para) {
          var text = para[i];
          var text = this.escapeHTML(text);
          o.push(`${text}<br/>`);
        }
        o.push(`///<br/>`);
        o.push('</p>');
        o.push('</div>');
        continue;
      }

      // this is the TERM block
      if (the_fence === '<<<') {
        [para, n] = this.trimPara(para);
        para = this.trimFences(para);
        o.push(`<div id='${id}' rows='${row} ${row2}' style='margin-left:${(step*n)}cm'>`);
        var out = this.parseTERM(para);
        o.push('<dl>');
        for(i=0; i < out.length; i+=2) {
          var dt = out[i];
          var dd = out[i+1];
          dt = this.escapeHTML(dt);
          dd = this.unmask(dd);
          o.push(`<dt><tt>${dt}</tt></dt><dd style='padding-left:1cm'>${dd}</dd>`)
        }
        o.push('</dl>');
        o.push('</div>');
        continue;
      }

      /// this is the DEF1 block
      if (/^(\@{1})\s+(\S.*)$/.test(para[0])) {
        o.push(`<div id='${id}' rows='${row} ${row2}'>`);
        var [ keys, text, n ] = this.parseDEF1(para);
        o.push('<dl>');
        for (i=0; i < keys.length; ++i) {
          o.push(`<dt><b>${this.escapeHTML(keys[i])}</b></dt>`);
        }
        o.push(`<dd style='margin-left:${step*n}cm'>${this.unmask(text)}</dd>`);
        o.push('</dl>');
        o.push('</div>');
        continue;
      }

      /// this is the DEF2 block
      if (/^(\@{2})\s+(\S.*)$/.test(para[0])) {
        o.push(`<div id='${id}' rows='${row} ${row2}'>`);
        var [ keys, text, n ] = this.parseDEF2(para);
        o.push('<dl>');
        for (i=0; i < keys.length; ++i) {
          o.push(`<dt><b><i>${this.escapeHTML(keys[i])}</i></b></dt>`);
        }
        o.push(`<dd style='margin-left:${step*n}cm'>${this.unmask(text)}</dd>`);
        o.push('</dl>');
        o.push('</div>');
        continue;
      }

      /// this is the DEF3 block
      if (/^(\@{3})\s+(\S.*)$/.test(para[0])) {
        o.push(`<div id='${id}' rows='${row} ${row2}'>`);
        var [ keys, text, n ] = this.parseDEF3(para);
        o.push('<dl>');
        for (i=0; i < keys.length; ++i) {
          o.push(`<dt><b><tt>${this.escapeHTML(keys[i])}</tt></b></dt>`);
        }
        o.push(`<dd style='margin-left:${step*n}cm'>${this.unmask(text)}</dd>`);
        o.push('</dl>');
        o.push('</div>');
        continue;
      }

      /// this is the PRIM block
      var re = /^\[\s+(.*?)\s+\]\s*(.*)$/;
      var v = re.exec(para[0]);
      if (v) {
        o.push(`<div id='${id}' rows='${row} ${row2}'>`);
        o.push('<p>');
        var lead = v[1];
        var text = v[2];
        for (i=1; i < para.length; ++i) {
          text = text.concat(` ${para[i].trimLeft()}`);
        }
        o.push(`<b>${this.escapeHTML(lead)}</b> &#160; ${this.unmask(text)}`);
        o.push('</p>');
        o.push('</div>');
        continue;
      }

      /// this is the SECO block
      var re = /^\[\[\s+(.*?)\s+\]\]\s*(.*)$/;
      var v = re.exec(para[0]);
      if (v) {
        o.push(`<div id='${id}' rows='${row} ${row2}'>`);
        o.push('<p>');
        var lead = v[1];
        var text = v[2];
        for (i=1; i < para.length; ++i) {
          text = text.concat(` ${para[i].trimLeft()}`);
        }
        o.push(`&#160;&#160;&#160;<b><i>${this.escapeHTML(lead)}</i></b> &#160; ${this.unmask(text)}`);
        o.push('</p>');
        o.push('</div>');
        continue;
      }

      /// this is the HDGS block
      var re = /^(\#{1,})\s+(.*)$/;
      if ((v = re.exec(para[0])) !== null) {
        o.push(`<div id='${id}' rows='${row} ${row2}'>`);
        var cat = v[1];
        var text = v[2];
        switch (cat.length) {
          case 1:
            o.push(`<h2>${this.escapeHTML(text)}</h2>`);
            break;
          case 2:
            o.push(`<h3>${this.escapeHTML(text)}</h3>`);
            break;
          case 3:
            o.push(`<h4>${this.escapeHTML(text)}</h4>`);
            break;
          case 4:
            o.push(`<h5>${this.escapeHTML(text)}</h5>`);
            break;
          default:
            o.push(`<h6>${this.escapeHTML(text)}</h6>`);
            break;
        }
        o.push(`</div>`);
        continue;
      }

      /// This is a PLST block
      var re = /^(\s*)(\-|\*|\d+.)\s+\S/;
      v = re.exec(para[0]);
      if (v) {
        [para, n] = this.trimPara(para);
        var items = this.parsePLST(para);
        o.push(`<div id='${id}' rows='${row} ${row2}' style='margin-left:${(step*n)}cm'>`);
        for (i in items) {
          var item = items[i];
          if (item.length === 3) {
            if (item[0] === 'OL') {
              o.push(`<ol style='padding-left:3ex;list-style-position:outside'><li value='${item[1]}'>${this.unmask(item[2])}`);
            } else if (item[0] === 'UL') {
              o.push(`<ul style='padding-left:3ex;list-style-position:outside'><li value='${item[1]}'>${this.unmask(item[2])}`);
            } else if (item[0] === 'LI') {
              o.push(`</li><li value='${item[1]}'>${this.unmask(item[2])}`);
            } else if (item[0] === '/OL') {
              o.push(`</li></ol><li value='${item[1]}'>${this.unmask(item[2])}`);
            } else if (item[0] === '/UL') {
              o.push(`</li></ul><li value='${item[1]}'>${this.unmask(item[2])}`);
            }
          } else {
            if (item[0] === '/OL') {
              o.push('</ol>');
            } else if (item[0] === '/UL') {
              o.push('</ul>');
            }
          }
        }
        o.push('</div>');
        continue
      }

      // treat it as the normal text
      if (true) {
        [para, n] = this.trimPara(para);
        o.push(`<div id='${id}' rows='${row} ${row2}' style='margin-left:${(step*n)}cm'>`);
        var text = para.join(' ');
        var text = this.unmask(text);
        o.push(`<p>${text}</p>`);
        o.push('</div>');
        continue;
      }

    }

    return [ o.join('\n'), metadata ];
  },

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
  },

  /*
  Returns a safe string suitable for HTML
  */
  escapeHTML (unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  },

  /*
  unmask all inline markups within a text
  */
  unmask (text) {
//console.log(`text(${text})`);
    var cnt;
    var v;
    var str = ' ' + text;
    var start_i = 0;
    var newtext = '';
    let re = /\s\_{2}(.*?)\_{2}|\s\_{1}(.*?)\_{1}|\s\`{3}\s*(.*?)\s*\`{3}|\s\`{2}\s*(.*?)\s*\`{2}|\s\`\s*(.*?)\s*\`|\[\^\^(.*?)\]|\[\^U\+([0-9a-fA-F]+)\]|\[\^\@(.*?)\]/g;
    while ((v = re.exec(str)) !== null) {
//console.log(v);
//console.log(re);
      var i = v.index;
//console.log('start_i='+start_i);
//console.log('i='+i);
      cnt = str.slice(start_i,i);
      cnt = this.escapeHTML(cnt);
      newtext = newtext.concat(cnt);
//console.log('newtext='+newtext);
      if (v[1]) {
        var cnt = v[1];
        cnt = this.escapeHTML(cnt);
        newtext = newtext.concat(` <strong>${cnt}</strong>`);
//console.log('newtext='+newtext);

      } else if (v[2]) {
        var cnt = v[2];
        cnt = this.escapeHTML(cnt);
        newtext = newtext.concat(` <em>${cnt}</em>`);
//console.log('newtext='+newtext);

      } else if (v[3]) {
        var cnt = v[3];
        cnt = this.escapeHTML(cnt);
        newtext = newtext.concat(` <tt>${cnt}</tt>`);
//console.log('newtext='+newtext);

      } else if (v[4]) {
        var cnt = v[4];
        cnt = this.escapeHTML(cnt);
        newtext = newtext.concat(` <tt>${cnt}</tt>`);
//console.log('newtext='+newtext);

      } else if (v[5]) {
        var cnt = v[5];
        cnt = this.escapeHTML(cnt);
        newtext = newtext.concat(` <tt>${cnt}</tt>`);
//console.log('newtext='+newtext);

      } else if (v[6]) {
        var cnt = v[6];
        var [rb, rt] = cnt.split(/\s+/);
        if (rb) {
          rb = this.escapeHTML(rb);
        } else {
          rb = '';
        }
        if (rt) {
          rt = this.escapeHTML(rt);
        } else {
          rt = '';
        }
        newtext = newtext.concat(`<ruby><rb>${rb}</rb><rt>${rt}</rt></ruby>`);
//console.log('newtext='+newtext);

      } else if (v[7]) {
        /// xunicode: [^U+4f60] /// 你
        var cnt = v[7];
        cnt = String.fromCodePoint('0x' + cnt);
        cnt = this.escapeHTML(cnt);
        newtext = newtext.concat(`<span>${cnt}</span>`);
//console.log('newtext='+newtext);

      } else if (v[8]) {
        /// uri: [^@d3js.org]
        var cnt = v[8];
        cnt = this.escapeHTML(cnt);
        newtext = newtext.concat(` <a style='word-break:break-all' href='${cnt}'><tt>${cnt}</tt></a>`);
//console.log('newtext='+newtext);

      }
      start_i = re.lastIndex;
    }
    cnt = str.slice(start_i);
    cnt = this.escapeHTML(cnt);
    newtext = newtext.concat(cnt);
    newtext = newtext.slice(1);
//console.log(`newtext(${newtext})`);
    return newtext;
  },

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
  },

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
  },

  /*
  Parse DEF1 block
  */
  parseDEF1 (para) {
    var re = /^(\@{1})\s+(\S.*)$/;
    return this.parseDEFS(para,re);
  },

  /*
  Parse DEF2 block
  */
  parseDEF2 (para) {
    var re = /^(\@{2})\s+(\S.*)$/;
    return this.parseDEFS(para,re);
  },

  /*
  Parse DEF3 block
  */
  parseDEF3 (para) {
    var re = /^(\@{3})\s+(\S.*)$/;
    return this.parseDEFS(para,re);
  },

  /*
  Parse the DEF1, DEF2, and DEF3 block
  */
  parseDEFS (para, re) {
    var text = '';
    var keys = [];
    var n = 0;
    for (i=0; i < para.length; ++i) {
      if (text) {
        text = text.concat(` ${para[i].trimLeft()}`);
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
  },

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
          text0 = text0.concat(` ${line}`);
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
  },

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
          out[out.length-1] = out[out.length-1].concat(`${v}`);
        }
      }
    }
    return out;
  }

};
