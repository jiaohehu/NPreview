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
  translate (blocks,o) {
    this.blocks = blocks;
    o = o || [];
    const step = 0.25;
    for (var block of blocks) {
      this.block = block;
      const [id,row1,row2,type,n,data,para,ins,ins_local,ins_text,fname,plevel] = block;
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
              o.push(`<h1>`);
              o.push(`${this.escape(text)}`);
              o.push(`<small><mark>[${id}]</mark></small>`);
              o.push(`</h1>`);
              break;
            case 1:
              this.secnum += 1;
              this.subsecnum = 0;
              this.subsubsecnum = 0;
              o.push(`<h2>`);
              o.push(`${this.secnum} &#160; ${this.escape(text)}`);
              o.push(`<small><mark>[${id}]</mark></small>`);
              o.push(`</h2>`);
              break;
            case 2:
              this.subsecnum += 1;
              this.subsubsecnum = 0;
              o.push(`<h3>`);
              o.push(`${this.secnum}.${this.subsecnum} &#160; ${this.escape(text)}`);
              o.push(`<small><mark>[${id}]</mark></small>`);
              o.push(`</h3>`);
              break;
            default:
              this.subsubsecnum += 1;
              o.push(`<h4>`);
              o.push(`${this.secnum}.${this.subsecnum}.${this.subsubsecnum} &#160; ${this.escape(text)}`);
              o.push(`<small><mark>[${id}]</mark></small>`);
              o.push(`</h4>`);
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
        case 'CODE':
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
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          o.push(`<p>`);
          if (ins === 'figure') {
            this.fignum += 1;
            o.push(`<b>Figure ${this.fignum}:</b>`);
            if (ins_local) {
              var base = id.split(':')[0];
              o.push(`<small><mark>[${base}:${ins_local}]</mark></small>`);
            } else {
              o.push(`<small><mark>[${id}]</mark></small>`);
            }
            o.push(`${this.unmask(ins_text)}<br/>`);
          }
          for (var j in data) {
            var pp = data[j];
            const [what,opts,srcs,sub] = pp;
            const src = srcs[0];
            o.push(`<svg width="200" height="200">`);
            if (ins ==='figure') {
              o.push(`<rect x='1' y='1' width='198' height='180' stroke='orange' fill='none'/>`);
              o.push(`<text x='100' y='90' text-anchor='middle' textLength='190'>${this.escape(src)}</text>`);
              o.push(`<text x='0' y='195' font-size='10'>(${this.toSubfigNum(j)}) ${this.escape(this.toEllipsedText(sub,10))}</text>`);
            } else {
              o.push(`<rect x='1' y='1' width='198' height='198' stroke='orange' fill='none'/>`);
              o.push(`<text x='100' y='100' text-anchor='middle' textLength='190'>${this.escape(src)}</text>`);

            }
            o.push(`</svg>`);
          }
          o.push('</p>');
          o.push('</div>');
          o.push('');
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
          o.push(`<div id='${id}' class='${type}' rows='${row1} ${row2}' style='margin-left:${left}'>`);
          for (var item of data) {
            var [lead,bullet,text] = item;
            bullet = bullet || '';
            text = text || '';
            if (bullet === '*') {
              var v = text.match(this.re_bullet_text);
              if (v) {
                text = `<tt>${this.escape(v[1])}</tt> ${v[2]} ${this.unmask(v[3])}`;
              } else {
                text = this.unmask(text);
              }
              bullet = '';
            } else if (bullet.match(/^\d+\.$/)) {
              bullet = this.chomp(bullet);
              text = this.unmask(text);
            } else {
              bullet = '';
            }
            if (item.length === 3) {
              switch (lead) {
                case 'OL': {
                  o.push(`<ol style='padding-left:3ex;list-style-position:outside'><li value='${bullet}'>${text}`);
                  break;
                }
                case 'UL': {
                  o.push(`<ul style='padding-left:3ex;list-style-position:outside'><li value='${bullet}'>${text}`);
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
        const [cnt,href] = text;
        if (cnt) {
          return `<span>${this.escape(cnt)}</span><span style='word-break:break-all'>(${this.escape(href)})</span>`
        } else {
          return `<span style='word-break:break-all'>${this.escape(href)}</span>`
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

}

module.exports = { NitrilePreviewHtml };
