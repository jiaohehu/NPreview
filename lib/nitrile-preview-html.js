'use babel';

const { NitrilePreviewParser } = require('./nitrile-preview-parser');

class NitrilePreviewHtml extends NitrilePreviewParser {

  constructor() {
    super();
    this.title = 'Untitled';
    this.secnum = 0;
    this.subsecnum = 0;
    this.subsubsecnum = 0;
    this.fignum = 0;
  }

  /*
    return a set of lines that is the result of converting
    to output from blocks
    */
  toLINES (blocks,o) {
    this.blocks = blocks;
    o = o || [];
    var ispreview = true;
    const step = 0.25;
    for (var block of blocks) {
      this.block = block;
      const [id,row1,row2,type,n,data,para,inst,inst_t,fname,plevel] = block;
      const left = `${step*n}cm`;
      switch (type) {
        case 'HDGS': {
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}'>`);
          var [cat,text] = data;
          if (plevel) {
            cat += plevel;
          }
          switch (cat) {
            case 0:
              o.push(`<h1>${this.escape(text)}</h1>`);
              break;
            case 1:
              this.secnum += 1;
              this.subsecnum = 0;
              this.subsubsecnum = 0;
              o.push(`<h2>${this.secnum} &#160; ${this.escape(text)}</h2>`);
              break;
            case 2:
              this.subsecnum += 1;
              this.subsubsecnum = 0;
              o.push(`<h3>${this.secnum}.${this.subsecnum} &#160; ${this.escape(text)}</h3>`);
              break;
            default:
              this.subsubsecnum += 1;
              o.push(`<h4>${this.secnum}.${this.subsecnum}.${this.subsubsecnum} &#160; ${this.escape(text)}</h4>`);
              break;
          }
          o.push(`</div>`);
          o.push('');
          break;
        }
        case '%!BOOK': {
          o.push(`<div id='${id}' rows='${row1} ${row2}'>`);
          o.push('<p>');
          for (var text of para) {
            var re = /^(\:+)\s+(.*)$/;
            var v = text.match(re);
            if (v) {
              o.push(`<tt>${v[1]} <a href='file://${v[2]}'>${v[2]}<a></tt><br/>`);
            } else {
              o.push(`<tt>${text}</tt><br/>`);
            }
          }
          o.push('</p>');
          o.push(`</div>`);
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
        case 'VERB': {
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          var text = data.join('\n');
          var text = this.escape(text);
          o.push(`<pre><code>${text}</code></pre>`);
          o.push(`</div>`);
          o.push('');
          break;
        }
        case 'PICT': {
          if (ispreview) {
            o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
            o.push(`<p>`);
            if (inst === 'figure') {
              this.fignum += 1;
              o.push(`<b><i>Figure ${this.fignum}.</i></b> ${this.unmask(inst_t)}<br/>`);
            }
            for (var j in data) {
              var pp = data[j];
              const [what,opts,srcs,sub] = pp;
              const src = srcs[0];
              o.push(`<svg width="100" height="100">
                      <rect x='1' y='1' width='98' height='80' stroke='orange' fill='none'/>
                      <text x='50' y='40' text-anchor='middle' textLength='90'>${this.escape(src)}</text>
                      <text x='0' y='95' font-size='10'>(${this.toSubfigNum(j)}) ${this.escape(this.toEllipsedText(sub,5))}</text>
                      </svg>`);
            }
            o.push('</p>');
            o.push('</div>');
            o.push('');
          } else if (inst === 'figure') {
            o.push(`<figure id='${id}' class='${type}' rows='${row1} ${row2}'>`);
            this.fignum += 1;
            o.push(`<figcaption><b><i>Figure</i></b> ${this.fignum}. ${this.unmask(inst_t)}</figcaption>`);
            for (var pp of data) {
              const [what,opts,srcs,sub] = pp;
              const src = srcs[0];
              const {width,height,frame} = opts;
              var style = '';
              if (width) {
                style += `width:${width};`;
              }
              if (height) {
                style += `height:${height};`;
              }
              if (frame) {
                style += `outline:1px solid;`;
              }
              if (what === 'image') {
                o.push(`<img alt='${src}' style='${style}' src='${src}'/>`);
              }
            }
            o.push(`</figure>`);
            o.push('')
          } else {
            o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
            for (var pp of data) {
              const [what,opts,srcs,sub] = pp;
              const src = srcs[0];
              const {width,height,frame} = opts;
              var style = '';
              if (width) {
                style += `width:${width};`;
              }
              if (height) {
                style += `height:${height};`;
              }
              if (frame) {
                style += `outline:1px solid;`;
              }
              if (what === 'image') {
                o.push(`<img alt='${src}' style='${style}' src='${src}'/>`);
              }
            }
            o.push(`</div>`);
            o.push('')
          }
          break;
        }
        case 'TABB': {
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          o.push(`<table>`);
          var maxj = this.matrixMaxJ(data);
          if (maxj == 0) {
            maxj = 1;
          }
          for (var i in data) {
            var pp = data[i];
            var pp = this.expandRow(pp,'',maxj);
            data[i] = pp;
          }
          for (var i in data) {
            var pp = data[i];
            var pp = pp.map(x => this.unmask(x));
            var pp = pp.map(x => x.split('\n'));
            var pp = pp.map(x => x.join('<br/>'));
            data[i] = pp;
          }
          for (var i in data) {
            var pp = data[i];
            o.push('<tr>');
            for (var j=0; j < pp.length; ++j) {
              var ppj = pp[j];
              o.push(`<td>${ppj}</td>`);
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
        case 'DEF1': {
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}'>`);
          o.push('<dl>');
          var [ keys, text, xn ] = data;
          var xleft = `${step*xn}cm`;
          for (i=0; i < keys.length; ++i) {
            o.push(`<dt><b>${this.escape(keys[i])}</b></dt>`);
          }
          o.push(`<dd style='margin-left:${xleft}'>${this.unmask(text)}</dd>`);
          o.push('</dl>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'DEF2': {
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}'>`);
          o.push('<dl>');
          var [ keys, text, xn ] = data;
          var xleft = `${step*xn}cm`;
          for (i=0; i < keys.length; ++i) {
            o.push(`<dt><b><i>${this.escape(keys[i])}</i></b></dt>`);
          }
          o.push(`<dd style='margin-left:${xleft}'>${this.unmask(text)}</dd>`);
          o.push('</dl>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'DEF3': {
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}'>`);
          o.push('<dl>');
          var [ keys, text, xn ] = data;
          var xleft = `${step*xn}cm`;
          for (i=0; i < keys.length; ++i) {
            o.push(`<dt><b><tt>${this.escape(keys[i])}</tt></b></dt>`);
          }
          o.push(`<dd style='margin-left:${xleft}'>${this.unmask(text)}</dd>`);
          o.push('</dl>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'PRIM': {
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}'>`);
          o.push('<p>');
          var [lead,text] = data;
          o.push(`<b>${this.escape(lead)}</b> &#160; ${this.unmask(text)}`);
          o.push('</p>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'SECO': {
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}'>`);
          o.push('<p>');
          var [lead,text] = data;
          o.push(`&#160;&#160;&#160; <b>${this.escape(lead)}</b> &#160; ${this.unmask(text)}`);
          o.push('</p>');
          o.push('</div>');
          o.push('');
          break;
        }
        case 'PLST': {
          var items = data;
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          for (var i in items) {
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
          o.push('');
          break;
        }
        default: {
          o.push(`<div id='${id}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          var text = this.unmask(data);
          o.push(`<p>${text}</p>`);
          o.push('</div>');
          o.push('');
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
        return `<tt>${this.escape(text)}</tt>`
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
        return `<a href='${this.escape(text)}'>${this.escape(text)}</a>`
        break;
      }
      case 'ruby': {
        const [rb,rt] = text;
        return `<ruby><rb>${this.escape(rb)}</rb><rt>${this.escape(rt)}</rt></ruby>`
        break;
      }
      default: {
        return `<span>${this.escape(text)}</span>`
        break;
      }
    }
  }

}

module.exports = {

  toPREVIEW (blocks) {
    var parser = new NitrilePreviewHtml();
    var o = parser.toLINES(blocks);
    return o.join('\n');
  },

  async toHtml (blocks) {
    var parser = new NitrilePreviewHtml();
    var o = parser.toLINES(blocks);
    o.push(`<!DOCTYPE html>`);
    o.push(`<head>`);
    o.push(`<meta charset="utf-8">`);
    o.push(`<meta name='viewport' content='width=device-width, initial-scale=1.0'>`);
    o.push(`</head>`);
    o.push(`<body>`);
    o = parser.toLINES(blocks,0,false,o);
    o.push(`</body>`);
    return o.join('\n');
  },

  async toXHTML (blocks) {
    var parser = new NitrilePreviewHtml();
    var o = parser.toLINES(blocks);
    o.push("<?xml version='1.0' encoding='UTF-8'?>");
    o.push("<html xmlns='http://www.w3.org/1999/xhtml' xmlns:epub='http://www.idpf.org/2007/ops'>");
    o.push("<head>");
    o.push("<meta http-equiv='default-style' content='text/html' charset='utf-8'/>");
    o.push("<meta name='viewport' content='width=device-width, initial-scale=1.0'/>");
    o.push("</head>");
    o.push("<body>");
    o = parser.toLINES(blocks,0,false,o);
    o.push(`</body>`);
    o.push(`</html>`);
    return o.join('\n');
  },

}
