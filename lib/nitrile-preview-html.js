'use babel';

const { NitrilePreviewParser } = require('./nitrile-preview-parser');

class NitrilePreviewHtml extends NitrilePreviewParser {

  constructor() {
    super();
    this.title = '';
    this.author = '';
    this.secnum = 0;
    this.subsecnum = 0;
    this.subsubsecnum = 0;
    this.fignum = 0;
    this.lstnum = 0;
  }

  /*
    return a set of lines that is the result of converting
    to output from blocks
    */
  translate (blocks,isarticle,o) {
    /// as it was used before to search for ref-id given a file name
    o = o || [];
    if (blocks.length == 1 && blocks[0][3] === '%!BOOK') {
      var block = blocks[0];
      this.block = block;
      const [id,row1,row2,type,n,data,para,ins,ins_local,ins_text,fname,plevel] = block;
      o.push(`<div>`);
      o.push('<p>');
      for (var text of para) {
        var re = /^(\:+)\s+(.*)$/;
        var v = text.match(re);
        if (v) {
          o.push(`<tt>${v[1]} <a href='file://${v[2]}'>${v[2]}</a></tt><br/>`);
        } else {
          o.push(`<tt>${text}</tt><br/>`);
        }
      }
      o.push('</p>');
      o.push(`</div>`);
      o.push('');
      return o;
    }
    const step = 0.25;
    this.heading = '';
    this.block = [];   
    for (var block of blocks) {
      /// store the current processed block so that it 
      /// can be accessed by 'unmask' function to find out
      /// what block is currently being processed
      this.block = block;

      const [id,row1,row2,type,n,data,para,ins,ins_local,ins_text,fname,plevel] = block;
      const left = `${step*n}cm`;
      switch (type) {
        case 'HDGS': {
          var [cat,text] = data;
          if (plevel) {
            cat += plevel;
          }
          switch (cat) {
            case 0:
              if (isarticle) {
                this.title = text;
                o.push(`<p id='${id}' class='TITLE' rows='${row1} ${row2}'>`);
                o.push(`${this.escape(text)}`);
                o.push(`</p>`);
                o.push(`<p class='DATE'>`);
                o.push(`${this.escape(new Date().toLocaleDateString())}`);
                o.push(`</p>`);
              } else {
                o.push(`<h1 id='${id}' class='CHAPTER' rows='${row1} ${row2}'>`);
                o.push(`Chapter ${ins_local} &#160; ${this.escape(text)}`);
                o.push(`<small><mark>[${id}]</mark></small>`);
                o.push(`</h1>`);
                this.heading = 'CHAPTER';
              }
              break;
            case 1:
              o.push(`<h2 id='${id}' class='SECTION' rows='${row1} ${row2}'>`);
              o.push(`${ins_local} &#160; ${this.escape(text)}`);
              o.push(`<small><mark>[${id}]</mark></small>`);
              o.push(`</h2>`);
              this.heading = 'SECTION';
              break;
            case 2:
              o.push(`<h3 id='${id}' class='SUBSECTION' rows='${row1} ${row2}'>`);
              o.push(`${ins_local} &#160; ${this.escape(text)}`);
              o.push(`<small><mark>[${id}]</mark></small>`);
              o.push(`</h3>`);
              this.heading = 'SUBSECTION';
              break;
            case 3:
              o.push(`<h3 id='${id}' class='SUBSUBSECTION' rows='${row1} ${row2}'>`);
              o.push(`${ins_local} &#160; ${this.escape(text)}`);
              o.push(`<small><mark>[${id}]</mark></small>`);
              o.push(`</h3>`);
              this.heading = 'SUBSUBSECTION';
              break;
            case 4:
              o.push(`<div id='${id}' class='PARAGRAPH' rows='${row1} ${row2}'>`);
              o.push('<p>');
              o.push(`<b>${this.escape(text)}</b> &#160;`);
              o.push('</p>');
              o.push(`</div>`);
              this.heading = 'PARAGRAPH';
              break;
            default:
              o.push(`<div id='${id}' class='SUBPARAGRAPH' rows='${row1} ${row2}'>`);
              o.push('<p>');
              o.push(`&#160; &#160; &#160; <b>${this.escape(text)}</b> &#160;`);
              o.push('</p>');
              o.push(`</div>`);
              this.heading = 'SUBPARAGRAPH';
              break;
          }
          o.push('');
          break;
        }
        case 'VRSE': {
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          o.push(`<p>`);
          for (var text of data) {
            text = this.unmask(text);
            o.push(`${text}<br/>`);
          }
          o.push(`</p>`);
          o.push(`</div>`);
          o.push('');
          break;
        }
        case 'LSTG': {
          this.lstnum += 1;
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          o.push(`<figure>`);
          o.push(`<figcaption>Listing ${ins_local}: <small><mark>[${id}]</mark></small> ${this.unmask(ins_text)}</figcaption>`);
          text = data.map( x => this.escape(x) );
          var linenum = 0;
          text = text.map( x => `<span>${++linenum}</span>${x}` );
          var text = text.join('\n');
          o.push(`<pre>${text}</pre>`);
          o.push(`</figure>`);
          o.push(`</div>`);
          o.push('');
          break;
        }
        case 'CODE': {
          var [text,fencecmd] = data;
          if (fencecmd['n']) {
            o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
            text = text.map( x => this.escape(x) );
            var linenum = 0;
            text = text.map( x => `<span><small>${this.expandString(++linenum,4,' ')}</small></span>${x}` );
            var text = text.join('\n');
            o.push(`<pre>${text}</pre>`);
            o.push(`</div>`);
            o.push('');
          } else {
            o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
            text = text.map( x => this.escape(x) );
            text = text.map( x => `${x}` );
            var text = text.join('\n');
            o.push(`<pre>${text}</pre>`);
            o.push(`</div>`);
            o.push('');
          }
          break;
        }
        case 'VERB': {
          var [text,fencecmd] = data;
          if (fencecmd['frame']) {
            o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='border:1px solid;margin-left:${left}'>`);
            var text = text.join('\n');
            var text = this.escape(text);
            o.push(`<pre>${text}</pre>`);
            o.push(`</div>`);
            o.push('');
          } else {
            o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
            var text = text.join('\n');
            var text = this.escape(text);
            o.push(`<pre>${text}</pre>`);
            o.push(`</div>`);
            o.push('');
          }
          break;
        }
        case 'FIGE': {
          this.fignum += 1;
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}'>`);
          o.push(`<figure>`);
          o.push(`<figcaption>Figure ${ins_local}: <small><mark>[${id}]</mark></small> ${this.unmask(ins_text)}</figcaption>`);
          for (var j in data) {  
            var pp = data[j];
            const [what,opts,srcs,sub] = pp;
            if (what === 'image') {
              const src = srcs[0] || '';
              o.push(`<svg width="200" height="200">`);
              o.push(`<rect x='1' y='1' width='198' height='178' stroke='#333' fill='none'/>`);
              o.push(`<text x='100' y='20' text-anchor='middle' textLength='190'>${this.escape(src)}</text>`);
              o.push(`<text x='100' y='50' text-anchor='middle'`);
              for (var key of ['width','height','frame']) {
                var val = opts[key] || '';
                o.push(`<tspan x='100' dy='1em'>${this.escape(key)}:${this.escape(val)}</tspan>`);
              }
              o.push(`</text>`);
              o.push(`<text x='0' y='195' font-size='10'>(${this.toSubfigNum(j)}) ${this.escape(this.toEllipsedText(sub,10))}</text>`);
              o.push(`</svg>`);

            } else {
              o.push(`<br/>`);
            }
          }
          o.push('</figure>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'PICT': {
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          o.push('<p>');
          for (var j in data) {
            var pp = data[j];
            const [what,opts,srcs,sub] = pp;
            const src = srcs[0] || '';
            if (what === 'image') {
              o.push(`<svg width="200" height="180">`);
              o.push(`<rect x='1' y='1' width='198' height='178' stroke='#333' fill='none'/>`);
              o.push(`<text x='100' y='20' text-anchor='middle' textLength='190'>${this.escape(src)}</text>`);
              o.push(`<text x='100' y='50' text-anchor='middle'`);
              for (var key of ['width','height','frame']) {
                var val = opts[key] || '';
                o.push(`<tspan x='100' dy='1em'>${this.escape(key)}:${this.escape(val)}</tspan>`);
              }
              o.push(`</text>`);
              o.push(`</svg>`);

            } else {
              o.push('<br/>');
            }
          }
          o.push('</p>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'TABB': {
          var [text,fencecmd] = data;
console.log(fencecmd);
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          o.push(`<table>`);
          var maxj = this.matrixMaxJ(text);
          if (maxj == 0) {
            maxj = 1;
          }
          var ll = this.expandRow(this.toList(fencecmd.columns),maxj,'l');
          var ll = this.columnsToTableCellStyles(ll);
console.log(ll);
          var text = text.map ( pp => this.expandRow(pp,maxj,'') )
          var rowcount = 0;
          for (var pp of text) {
            rowcount += 1;
            pp = pp.map(x => x.split('\n'));
            if (rowcount == 1) {
              pp = pp.map(x => x.map(y => this.escape(y)));
            } else {
              pp = pp.map(x => x.map(y => this.unmask(y)));
            }
            pp = pp.map(x => x.join('<br/>'));
            o.push('<tr>');
            if (rowcount == 1) {
              pp = pp.map(x => `<th>${x}</th>`);
              o.push(pp.join(''));
            } else {
              pp = pp.map((x,i) => `<td style='${ll[i]}'>${x}</td>`);
              o.push(pp.join(''));
            }
            o.push('</tr>');
          }
          o.push(`</table>`);
          o.push('</div>');
          o.push('');
          break;
        }
        case 'TERM': {
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          o.push('<dl>');
          for(var i=0; i < data.length; i+=2) {
            var dt = data[i];
            var dd = data[i+1];
            var dt = this.escape(dt);
            var dd = this.unmask(dd);
            o.push(`<dt><tt>${dt}</tt></dt>`);
            o.push(`<dd style='padding-left:1cm'>${dd}</dd>`);
          }
          o.push('</dl>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'QUOT': {
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          var text = this.unmask(data);
          o.push(`<blockquote><q>${text}</q></blockquote>`);
          o.push('</div>');
          o.push('');
          break;
        }
        case 'DESC': {
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}'>`);
          o.push('<dl>');
          var [ cat, keys, text, xn ] = data;
          var xleft = `${step*xn}cm`;
          for (i=0; i < keys.length; ++i) {
            if (cat === 'tt') {
              o.push(`<dt><b><tt>${this.escape(keys[i])}</tt></b></dt>`);
            } else if (cat === 'b') {
              o.push(`<dt><b>${this.escape(keys[i])}</b></dt>`);
            } else {
              o.push(`<dt><b><i>${this.escape(keys[i])}</i></b></dt>`);
            }
          }
          o.push(`<dd style='margin-left:${xleft}'>${this.unmask(text)}</dd>`);
          o.push('</dl>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'PRIM': {
          var [lead,text] = data;
          o.push(`<div id='${id}' class='PARAGRAPH' rows='${row1} ${row2}'>`);
          o.push('<p>');
          o.push(`<b>${this.escape(lead)}</b> &#160;`);
          o.push(`${this.unmask(text)}`);
          o.push('</p>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'SECO': {
          var [lead,text] = data;
          o.push(`<div id='${id}' class='SUBPARAGRAPH' rows='${row1} ${row2}'>`);
          o.push('<p>');
          o.push(`&#160; &#160; &#160; <b>${this.escape(lead)}</b> &#160;`);
          o.push(`${this.unmask(text)}`);
          o.push('</p>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'PLST': {
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          for (var item of data) {
            var [lead,bullet,text] = item;
            bullet = bullet || '';
            text = text || '';
            if (bullet === '-') {
              var v = text.match(this.re_bullet_text);
              if (v) {
                text = `<i>${this.escape(v[1])}</i> ${v[2]} ${this.unmask(v[3])}`;
              } else {
                text = this.unmask(text);
              }
              bullet = '';
            } else if (bullet === '+') {
              var v = text.match(this.re_bullet_text);
              if (v) {
                text = `<tt>${this.escape(v[1])}</tt> ${v[2]} ${this.unmask(v[3])}`;
              } else {
                text = this.unmask(text);
              }
              bullet = '';
            } else if (bullet === '*') {
              var v = text.match(this.re_bullet_text);
              if (v) {
                text = `<b>${this.escape(v[1])}</b> ${v[2]} ${this.unmask(v[3])}`;
              } else {
                text = this.unmask(text);
              }
              bullet = '';
            } else if (bullet.match(/^\d+\.$/)) {
              bullet = this.chomp(bullet);
              text = this.unmask(text);
            } else {
              bullet = '';
              text = this.unmask(text);
            }
            if (item.length === 3) {
              switch (lead) {
                case 'OL': {
                  o.push(`<ol><li value='${bullet}'>${text}`);
                  break;
                }
                case 'UL': {
                  o.push(`<ul><li value='${bullet}'>${text}`);
                  break;
                }
                case 'LI': {
                  o.push(`</li><li value='${bullet}'>${text}`);
                  break;
                }
                case '/OL': {
                  o.push(`</li></ol><li value='${bullet}'>${text}`);
                  break;
                }
                case '/UL': {
                  o.push(`</li></ul><li value='${bullet}'>${text}`);
                  break;
                }
              }
            } else if (item.length == 1) {
              if (item[0] === '/OL') {
                o.push('</ol>');
              } else if (item[0] === '/UL') {
                o.push('</ul>');
              }
            }
          }
          o.push('</div>');
          o.push('');
          break;
        }
        default: {
          if (this.heading === 'PARAGRAPH' || this.heading === 'SUBPARAGRAPH') {
            this.heading = '';
            o.pop();
            o.pop();
            o.pop();
            var text = this.unmask(data);
            o.push(`${text}`);
            o.push('</p>');
            o.push('</div>');
            o.push('');
          } else {
            o.push(`<div id='${id}' class='TEXT' rows='${row1} ${row2}' style='margin-left:${left}'>`);
            var text = this.unmask(data);
            o.push(`<p>${text}</p>`);
            o.push('</div>');
            o.push('');
          }
          break;
        }
      }
    }
    return o;
  }

  /*
    Translate only HDGS/FIGE/LSTG blocks
    */
  translateOutline (title,author,blocks,o) {
    o = o || [];
    o.push(`<p class='TITLE'>`);
    o.push(`${this.escape(title)}`);
    o.push(`</p>`);
    o.push(`<p class='AUTHOR'>`);
    o.push(`${this.escape(author)}`);
    o.push(`</p>`);
    o.push(`<p class='DATE'>`);
    o.push(`${this.escape(new Date().toLocaleDateString())}`);
    o.push(`</p>`);
    var chapnum = 0;
    for (var block of blocks) {
      const [id,row1,row2,type,n,data,para,ins,ins_local,ins_text,fname,plevel] = block;
      switch (type) {
        case 'HDGS': {
          var [cat,text] = data;
          if (plevel) {
            cat += plevel;
          }
          switch (cat) {
            case 0:
              chapnum += 1;
              this.secnum = 0;
              this.subsecnum = 0;
              this.subsubsecnum = 0;
              this.fignum = 0;
              this.lstnum = 0;
              o.push(`<h1 id='${id}' class='${type}'>`);
              o.push(`Chapter ${ins_local} &#160; ${this.escape(text)}`);
              o.push(`<small><mark class='LABEL'>[${id}]</mark></small>`);
              o.push(`</h1>`);
              break;
            case 1:
              this.secnum += 1;
              this.subsecnum = 0;
              this.subsubsecnum = 0;
              o.push(`<h2 id='${id}' class='${type}'>`);
              o.push(`${ins_local} &#160; ${this.escape(text)}`);
              o.push(`<small><mark class='LABEL'>[${id}]</mark></small>`);
              o.push(`</h2>`);
              break;
            case 2:
              this.subsecnum += 1;
              this.subsubsecnum = 0;
              o.push(`<h3 id='${id}' class='${type}'>`);
              o.push(`${ins_local} &#160; ${this.escape(text)}`);
              o.push(`<small><mark class='LABEL'>[${id}]</mark></small>`);
              o.push(`</h3>`);
              break;
            default:
              this.subsubsecnum += 1;
              o.push(`<h4 id='${id}' class='${type}'>`);
              o.push(`${ins_local} &#160; ${this.escape(text)}`);
              o.push(`<small><mark class='LABEL'>[${id}]</mark></small>`);
              o.push(`</h4>`);
              break;
          }
          o.push('');
          break;
        }
        case 'FIGE': {
          this.fignum += 1;
          o.push(`<p id='${id}' class='${type}'>`);
          o.push(`Figure ${ins_local}`);
          o.push(`<small><mark class='LABEL'>[${id}]</mark></small>`);
          o.push(`</p>`);
          break;
        }
        case 'LSTG': {
          this.lstnum += 1;
          o.push(`<p id='${id}' class='${type}'>`);
          o.push(`Listing ${ins_local}`);
          o.push(`<small><mark class='LABEL'>[${id}]</mark></small>`);
          o.push(`</p>`);
          break;
        }
      }
    }
    return o;
  }

  /*
    Returns a safe string suitable for HTML
  */
  escape (unsafe) {
    unsafe = ''+unsafe; /// force it to be a string when it can be a interger
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }

  /*
    return the styled inline text
  */
  style (type, text) {
    switch (type) {
      case 'tt': {
        return `<nobr><code>${this.escape(text)}</code></nobr>`
        break;
      }
      case 'em': {
        return `<em>${this.escape(text)}</em>`
        break;
      }
      case 'strong': {
        return `<strong>${this.escape(text)}</strong>`
        break;
      }
      case 'uri': {
        const [cnt,href] = text;
        if (cnt) {
          return `<span>${this.escape(cnt)}</span><span style='word-break:break-all'>(<tt>${this.escape(href)}</tt>)</span>`
        } else {
          return `<span style='word-break:break-all'><tt>${this.escape(href)}</tt></span>`
        }
        break;
      }
      case 'ruby': {
        const [rb,rt] = text;
        return `<ruby><rb>${this.escape(rb)}</rb><rt>${this.escape(rt)}</rt></ruby>`
        break;
      }
      case 'ref': {
        return `<small><mark>\[${this.escape(text)}\]</mark></small>`
        break;
      }
      default: {
        return `<span>${this.escape(text)}</span>`
        break;
      }
    }
  }

  columnsToTableCellStyles (ll) {
    var o = [];
    var re_p = /^p\{(.*)\}$/;
    for (var s of ll) {
      if (s === 'l') {
        o.push('text-align:left');
      } else if (s === 'r') {
        o.push('text-align:right');
      } else if (s === 'c') {
        o.push('text-align:center');
      } else if (s === 'L') {
        o.push('');
      } else {
        var v = re_p.exec(s);
        if (v) {
          o.push(`width:${v[1]}`);
        } else {
          o.push('');
        }
      }
    }
    return o;
  }
}

module.exports = { NitrilePreviewHtml };
