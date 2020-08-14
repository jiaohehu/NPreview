'use babel';

const { NitrilePreviewDiagram } = require('./nitrile-preview-diagram');
const { arcpath } = require('./nitrile-preview-arcpath');

class NitrilePreviewDiagramTikz extends NitrilePreviewDiagram {

  constructor(translator) {
    super(translator);
  }
  do_setup() {
  }
  do_finalize(s) {
    var o = [];
    var xm = this.config.width;
    var ym = this.config.height;
    var unit = this.config.unit;
    /// these items needs to be constracted after all
    /// previous p's have been processed because it needs
    /// to be dependant on some of the command line options
    /// settings such as width and height.
    ///var ym = this.config.height;
    ///var xm = this.config.width;
    ///var unit = this.config.unit;
    ///var a1 = `pu := \\mpdim{\\linewidth}/${xm};`;
    ///var a2 = `u := ${unit}mm;`;///unit is always in mm
    ///var a3 = `ratio := pu/u;`;
    ///var a4 = `picture wheel;`;
    ///var a5 = `wheel := image(`;
    ///var a6 = `for i=0 upto ${ym}: draw (0,i*u) --- (${xm}*u,i*u) withcolor .9white; endfor;`;
    ///var a7 = `for i=0 upto ${xm}: draw (i*u,0) --- (i*u,${ym}*u) withcolor .9white; endfor;`;
    ///o.push(a1, a2, a3, a4, a5, a6, a7);
    var p = `
\\draw[help lines, step=${unit}mm,lightgray,very thin] (0,0) grid (${xm*unit}mm,${ym*unit}mm);
`;

    p = p.trim();
    o.push(p);
    o.push(s);
    var s = o.join('\n');
    return {s,xm,ym,unit};
  }
  do_comment(s) {
    s = s.replace(/\-\-/g,'');
    s = s.replace(/\\/g,'\\\\');
    return `% <-- ${s} -->`;
  }
  p_path(coords,g){
    var o = [];
    var items = this.coordsToDraw(coords,true);
    for(var item of items) {
      var {iscycled,d} = item;
      d = d.trim();
      if(!d) continue;
      if(iscycled && this.has_fills(g)){
        o.push(`\\fill ${d} ${this.to_fills(g)};`);
      }
      if(g.dblarrow){
        o.push(`\\draw[<->] ${d} ${this.to_draws(g)};`);
      }else if(g.revarrow){
        o.push(`\\draw[<-] ${d} ${this.to_draws(g)};`);
      }else if(g.arrow){
        o.push(`\\draw[->] ${d} ${this.to_draws(g)};`);
      }else{
        o.push(`\\draw ${d} ${this.to_draws(g)};`);
      }
    }
    return o.join('\n');
  }
  p_circle(x,y,radius,g){
    return ''
  }
  p_rect(x,y,w,h,g){
    return ''
  }
  p_line(x1,y1,x2,y2,g){
    return ''
  }
  p_qbezier_line(x0,y0, x1,y1, x2,y2, g){
    return ''
  }
  p_hbar(x,y,g){
    return ''
  }
  p_vbar(x,y,g){
    return ''
  }
  p_label(x,y,txt,ts,ta,g){
    var unit = this.config.unit;
    var anchor = this.to_anchor(ta);
    if(anchor){
      anchor=`anchor=${anchor}`;
    }
    var textcolor = this.to_texts(g);
    return `\\draw (${this.fix(x*unit)}mm,${this.fix(y*unit)}mm) node[${anchor}] {${textcolor}${txt}};`;
  }
  p_pie(x,y,radius,angle1,angle2,g){
    return ''
  }
  p_chord(x,y,radius,angle1,angle2,g){
    return ''
  }
  p_cseg(x,y,radius,angle1,angle2,g){
    return ''
  }
  p_ellipse(x,y,Rx,Ry,angle,g){
    return ''
  }
  p_dot(x,y,g){
    return ''
  }
  p_arc(x,y,r,a1,a2,g){
    return ''
  }
  p_arc_sq(x,y,r,a1,a2,g){
    return ''
  }
  p_shape(x,y,p,g){
    return ''
  }
  coordsToDraw(coords,multi=false) {
    ///***NOTE: returns [str,bad_vars]
    ///***NOTE: i.e: (1,2)..(2,3)--cycle
    /// pt[0]: [1,2,'','','']
    /// pt[1]: [2,3,'..','','']
    /// pt[2]: ['cycle','','--','','']
    var o = [];
    var items = [];
    var iscycled = 0;
    var d = '';
    var x0 = 0;//previous point
    var y0 = 0;
    var isnewseg = 0;
    var unit = this.config.unit;
    for (var i in coords) {
      var pt = coords[i];
      var x = pt[0];/// we will do fix down below
      var y = pt[1];///
      var join = pt[2];
      ///doing some fixes
      join = join || '';
      if (i == 0) {
        o.push(`(${this.fix(x*unit)}mm,${this.fix(y*unit)}mm)`);
        x0 = x;
        y0 = y;
        continue;
      }
      else if (join == 'cycle') {
        if(o.length){
          o.push(`--cycle`);
        }
        if(multi){
          iscycled = 1;
          d = o.join('');
          o = [];
          items.push({iscycled,d});
          isnewseg = 1;
          continue;
        }else{
          break;
        }
      }
      else if (join == 'nan') {
        if(multi){
          iscycled = 0;
          d = o.join('');
          o = [];
          items.push({iscycled,d});
          isnewseg = 1;
        }
        continue;
      }
      else if (multi && isnewseg == 1) {
        isnewseg = 0;
        o.push(`(${this.fix(x)},${this.fix(y)})`);
        x0 = x;
        y0 = y;
        continue;
      }
      else if (join == 'C') {
        var unit = this.config.unit;
        let p1x = pt[3];/// CUBIC BEZIER curve controlpoint 1x
        let p1y = pt[4];/// CUBIC BEZIER curve controlpoint 1y
        let p2x = pt[5];/// CUBIC BEZIER curve controlpoint 2x
        let p2y = pt[6];/// CUBIC BEZIER curve controlpoint 2y
        var bezier = `..controls(${this.fix(p1x*unit)}mm,${this.fix(p1y*unit)}mm)and(${this.fix(p2x*unit)}mm,${this.fix(p2y*unit)}mm)..`;
        o.push(`${bezier}(${this.fix(x*unit)}mm,${this.fix(y*unit)}mm)`);
        x0 = x;
        y0 = y;
      }
      else if (join == 'Q') {
        let p1x_ = pt[3];/// QUADRILATIC BEZIER curve controlpoint 1x
        let p1y_ = pt[4];/// QUADRILATIC BEZIER curve controlpoint 1y
        let [C0,C1,C2,C3] = this.quadrilatic_bezier_to_cubic([x0,y0],[p1x_,p1y_],[x,y]);
        let p1x = C1[0];
        let p1y = C1[1];
        let p2x = C2[0];
        let p2y = C2[1];
        var bezier = `..controls(${this.fix(p1x*unit)}mm,${this.fix(p1y*unit)}mm)and(${this.fix(p2x*unit)}mm,${this.fix(p2y*unit)}mm)..`;
        o.push(`${bezier}(${this.fix(x*unit)}mm,${this.fix(y*unit)}mm)`);
        x0 = x;
        y0 = y;
      }
      else if (join == 'A') {
        var X1 = x0;
        var Y1 = y0;
        var X2 = x;
        var Y2 = y;
        var Rx         = pt[7];       
        var Ry         = pt[8];       
        var Phi        = pt[9];        
        var bigarcflag = pt[10];        
        var sweepflag  = pt[11];        
        if (sweepflag) {
          ///NOTE: note that the arcpath() always assumes anti-clockwise. So if we are
          ///drawing clockwise we just need to swap the starting and end point
          ///for X1/Y1 and X2/Y2
          ///this.sweepflag=1: clockwise
          ///this.sweepflag=0: anti-clockwise
          var tmp = X1; X1 = X2; X2 = tmp;
          var tmp = Y1; Y1 = Y2; Y2 = tmp;
        } 
        var [Cx, Cy, Rx, Ry] = arcpath(X1, Y1, X2, Y2, Rx, Ry, Phi, bigarcflag);
        if (Number.isFinite(Cx) && Number.isFinite(Cy)) {
          var lambda1 = Math.atan2(Y1 - Cy, X1 - Cx);
          var lambda2 = Math.atan2(Y2 - Cy, X2 - Cx);
          lambda2 -= Phi / 180 * Math.PI;
          lambda1 -= Phi / 180 * Math.PI;
          var tao1 = Math.atan2(Math.sin(lambda1) / Ry, Math.cos(lambda1) / Rx);
          var tao2 = Math.atan2(Math.sin(lambda2) / Ry, Math.cos(lambda2) / Rx);
          var ang1 = this.to360(tao1 / Math.PI * 180);
          var ang2 = this.to360(tao2 / Math.PI * 180);
          if (ang2 < ang1) { ang2 += 360; }
        }
        if (sweepflag) {
          o.push(`--(subpath (${ang2 / 45},${ang1 / 45}) of fullcircle xscaled(${this.fix(2*Rx)}) yscaled(${this.fix(2*Ry)}) rotated(${Phi}) shifted(${this.fix(Cx)},${this.fix(Cy)}))`);
        } else {
          o.push(`--(subpath (${ang1 / 45},${ang2 / 45}) of fullcircle xscaled(${this.fix(2*Rx)}) yscaled(${this.fix(2*Ry)}) rotated(${Phi}) shifted(${this.fix(Cx)},${this.fix(Cy)}))`);
        }
        x0 = x;
        y0 = y;
      }
      else {
        ///NOTE: line
        o.push(`--(${this.fix(x*unit)}mm,${this.fix(y*unit)}mm)`);
        x0 = x;
        y0 = y;
      }
    }
    if(multi){
      if(o.length){
        iscycled = 0;
        d = o.join('');
        items.push({iscycled,d});
      }
      return items;
    }else{
      return o.join('');
    }
  }
  to_draws(g) {
    var o = [];
    if (g.linedashed) {
      o.push(`dashed evenly`);
    }
    var d = this.to_linesize_pt(g);
    if(d){
      o.push(`withpen pencircle scaled ${d}`);
    }
    if (g.linecolor) {
      o.push(`withcolor ${this.to_colors(g.linecolor)}`);
    }
    return o.join(' ');
  }
  to_fills(g) {
    var d = this.to_fillcolor_str(g);
    if (d) {
      return(`withcolor ${d}`);
    } 
    return '';
  }
  to_linesize_pt(g){
    if (g.linesize) {
      var d = parseFloat(g.linesize);
      if(Number.isFinite(d)){
        return(`${d}`);
      }
    }
    if(this.config.linesize){
      d = this.config.linesize;
      return(`${d}`);
    }
    return '';
  }
  fontsizes() {
    //return this.translator.mpfontsize(this.fontsize);
    return '12';
  }
  to_colors(color) {
    if (!color) {
      return 'black';
    } 
    else if (typeof color === 'string' && color[0] == '#') {
      color = color.slice(1);///getrid of the first #
      return this.webrgb_to_mprgb_s(color);
    }
    else if (typeof color === 'string') {
      return (color);
    } 
    else {
      return 'black';
    }
  }
  to_anchor(ta){
    if( ta.localeCompare('lft') == 0   ) return 'east';
    if( ta.localeCompare('rt') == 0    ) return 'west';
    if( ta.localeCompare('top') == 0   ) return 'south';
    if( ta.localeCompare('bot') == 0   ) return 'north';
    if( ta.localeCompare('ulft') == 0  ) return 'south east';
    if( ta.localeCompare('urt') == 0   ) return 'south west';
    if( ta.localeCompare('llft') == 0  ) return 'north east';
    if( ta.localeCompare('lrt') == 0   ) return 'north west';
    if( ta.localeCompare('ctr') == 0   ) return '';
    return 'south west';
  }
  to_texts(g) {
    var withcolor = '';
    if (g.fontcolor) {
      var withcolor = `\\color{${this.to_colors(g.fontcolor)}}`;
    }
    return withcolor;
  }

}
module.exports = { NitrilePreviewDiagramTikz };
