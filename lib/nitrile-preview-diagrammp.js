'use babel';

const { NitrilePreviewDiagram } = require('./nitrile-preview-diagram');
const { arcpath } = require('./nitrile-preview-arcpath');

class NitrilePreviewDiagramMP extends NitrilePreviewDiagram {

  constructor(translator) {
    super(translator);
    this.re_unit = /^(\d+)mm$/;
    this.re_inlinemath = /^\`\`(.*)\`\`$/;
  }
  
  do_setup() {
  }

  do_finalize(s,style) {
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
    if (this.config.grid && this.config.grid=='boxed') {
      o.push(`for i=0 step ${ym} until ${ym}: draw (0,i*u) --- (${xm}*u,i*u) withcolor black; endfor;`);
      o.push(`for i=0 step ${xm} until ${xm}: draw (i*u,0) --- (i*u,${ym}*u) withcolor black; endfor;`);
    } else if (this.config.grid && this.config.grid=='none') {
      o.push(`for i=0 step ${ym} until ${ym}: draw (0,i*u) --- (${xm}*u,i*u) withcolor white; endfor;`);
      o.push(`for i=0 step ${xm} until ${xm}: draw (i*u,0) --- (i*u,${ym}*u) withcolor white; endfor;`);
    } else {
      o.push(`for i=0 upto ${ym}: draw (0,i*u) --- (${xm}*u,i*u) withcolor .9white; endfor;`);
      o.push(`for i=0 upto ${xm}: draw (i*u,0) --- (i*u,${ym}*u) withcolor .9white; endfor;`);
    }
    o.push(this.do_reset());
    o.push(s);
    var s = o.join('\n');
    if(style && style.width){
      let str = style.width;
      str = this.str_to_mf_width(str);
      let d = [];
      d.push('\\startMPcode');
      d.push(`numeric textwidth; textwidth := ${str};`);
      d.push(`numeric pu; pu := textwidth/${xm};`);
      d.push(`numeric u; u := ${unit}mm;`);
      d.push(`numeric ratio; ratio := pu/u;`);
      d.push(`picture wheel;`);
      d.push(`wheel := image(`);
      d.push(s);
      d.push(`);`);
      d.push(`draw wheel scaled(ratio);`);
      d.push('\\stopMPcode');
      var text = d.join('\n');
    }else{
      let d = [];
      d.push('\\startMPcode');
      d.push(`numeric u; u := ${unit}mm;`);
      d.push(s);
      d.push('\\stopMPcode');
      var text = d.join('\n');
    }
    s = text;
    return {s};
  }

  do_comment(s) {
    s = s.replace(/\-\-/g,'');
    s = s.replace(/\\/g,'\\\\');
    return `% <-- ${s} -->`;
  }

  do_drawarc(opt,txt,ts,g,coords){
    var o = [];
    for (var i = 1; i < coords.length; ++i) {
      var z0 = this.point(coords, i - 1);
      var z1 = this.point(coords, i);
      if(!this.isvalidpt(z0)) continue;
      if(!this.isvalidpt(z1)) continue;
      z0 = this.local(z0);
      z1 = this.local(z1);
      var X1 = z0[0];
      var Y1 = z0[1];
      var X2 = z1[0];
      var Y2 = z1[1];
      var Rx = this.Rx;
      var Ry = this.Ry;
      var Phi = this.rotation;
      if (this.sweepflag) {
        ///NOTE: note that the arcpath() always assumes anti-clockwise. So if we are
        ///drawing clockwise we just need to swap the starting and end point
        ///for X1/Y1 and X2/Y2
        ///this.sweepflag=1: clockwise
        ///this.sweepflag=0: anti-clockwise
        var tmp = X1; X1 = X2; X2 = tmp;
        var tmp = Y1; Y1 = Y2; Y2 = tmp;
      } 
      var [Cx, Cy, Rx, Ry] = arcpath(X1, Y1, X2, Y2, Rx, Ry, Phi, this.bigarcflag);
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
      if (this.sweepflag) {
        o.push(`draw subpath (${ang2 / 45},${ang1 / 45}) of fullcircle xscaled(${2 * Rx}) yscaled(${2 * Ry}) rotated(${Phi}) scaled(u) shifted(${Cx}*u,${Cy}*u);`);
      } else {
        o.push(`draw subpath (${ang1 / 45},${ang2 / 45}) of fullcircle xscaled(${2 * Rx}) yscaled(${2 * Ry}) rotated(${Phi}) scaled(u) shifted(${Cx}*u,${Cy}*u);`);
      }
    }
    return o.join('\n');
  }
  
  do_drawcontrolpoints(opt,txt,ts,g,coords){
    var s = [];
    ///NOTE: the dotsize attribute could be an empty string
    var dm = this.to_dotsize_diameter(g);
    var r = dm/2; 
    var x0 = null;
    var y0 = null;
    for (var i = 0; i < coords.length    ; i++) {
      var z0 = this.point(coords, i);
      if (!this.isvalidpt(z0)) continue;
      var x = this.localx(z0[0]);
      var y = this.localy(z0[1]);
      var join = z0[2];
      if (join==='C') {
        var i3 = this.localx(z0[3]);
        var i4 = this.localy(z0[4]);
        var i5 = this.localx(z0[5]);
        var i6 = this.localy(z0[6]);
        s.push(`fill unitsquare scaled(${dm}) shifted(${-r},${-r}) shifted(${x}*u,${y}*u) ${this.to_dotcolors(g)};`);
        if (typeof x0 === 'number' && typeof y0 === 'number') {
          s.push(`fill unitsquare scaled(${dm}) shifted(${-r},${-r}) shifted(${x0}*u,${y0}*u) ${this.to_dotcolors(g)};`);
          x0 = null;
          y0 = null;
        }
        s.push(`fill fullcircle scaled(${dm}) shifted(${i3}*u,${i4}*u) ${this.to_dotcolors(g)};`);
        s.push(`fill fullcircle scaled(${dm}) shifted(${i5}*u,${i6}*u) ${this.to_dotcolors(g)};`);
      } if (join==='Q') {
        var i3 = this.localx(z0[3]);
        var i4 = this.localy(z0[4]);
        s.push(`fill unitsquare scaled(${dm}) shifted(${-r},${-r}) shifted(${x}*u,${y}*u) ${this.to_dotcolors(g)};`);
        if (typeof x0 === 'number' && typeof y0 === 'number') {
          s.push(`fill unitsquare scaled(${dm}) shifted(${-r},${-r}) shifted(${x0}*u,${y0}*u) ${this.to_dotcolors(g)};`);
          x0 = null;
          y0 = null;
        }
        s.push(`fill fullcircle scaled(${dm}) shifted(${i3}*u,${i4}*u) ${this.to_dotcolors(g)};`);
      } else {
        x0 = x;
        y0 = y;
      }
    }
    return s.join('\n');
  }

  to_tex_label(txt,ts,fontsize){
    txt = txt||'';
    var fs = `${fontsize}pt`;
    if (ts==2) {
      // math text
      var s = this.translator.to_inlinemath(txt);
      var s = `{\\fontsize{${fs}}{${fs}}\\selectfont{}${s}}`;
    } else if (ts==1){
      // literal text 
      var s = this.translator.polish(txt);
      var s = `{\\fontsize{${fs}}{${fs}}\\selectfont{}${s}}`;
    } else {
      // normal text with symbols
      var s = this.translator.smooth(txt);
      var s = `{\\fontsize{${fs}}{${fs}}\\selectfont{}${s}}`;
    }
    return `btex ${s} etex`;
  }

  fontsizes() {
    return this.translator.mpfontsize(this.fontsize);
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
      /// such as '\mpcolor{pink}' for latex or \MPcolor{pink} for contex
      return this.translator.to_mpcolor(color);
    } 
    else {
      return 'black';
    }
  }

  localcoords(coords) {
    var s = [];
    for( let [x,y,join,x1,y1,x2,y2,Rx,Ry,angle,bigarcflag,sweepflag] of coords ) {
      if (join=='cycle'||join=='nan') {
        s.push([x,y,join,x1,y1,x2,y2,Rx,Ry,angle,bigarcflag,sweepflag]);
      } else {
        x = this.localx(x);
        y = this.localy(y);
        x1 = this.localx(x1);
        y1 = this.localy(y1);
        x2 = this.localx(x2);
        y2 = this.localy(y2);
        s.push([x,y,join,x1,y1,x2,y2,Rx,Ry,angle,bigarcflag,sweepflag]);
      }
    }
    return s;
  }

  scalecoords(coords,scalarx,scalary) {
    var s = [];
    for( let [x,y,join,x1,y1,x2,y2] of coords ) {
      if (join=='cycle'||join=='nan') {
        s.push([x,y,join,x1,y1,x2,y2]);
      } else {
        x *= scalarx;
        y *= scalary;
        x1 *= scalarx;
        y1 *= scalary;
        x2 *= scalarx;
        y2 *= scalary;
        s.push([x,y,join,x1,y1,x2,y2]);
      }
    }
    return s;
  }

  rotatecoords(coords,ang_deg) {
    var s = [];
    var costheta = Math.cos(ang_deg/180*Math.PI);
    var sintheta = Math.sin(ang_deg/180*Math.PI);
    for( let [x,y,join,x1,y1,x2,y2] of coords ) {
      if (join=='cycle'||join=='nan') {
        s.push([x,y,join,x1,y1,x2,y2]);
      } else {
        var _x   =   x*costheta -   y*sintheta;
        var _y   =   x*sintheta +   y*costheta;
        var _x1  =  x1*costheta -  y1*sintheta;
        var _y1  =  x1*sintheta +  y1*costheta;
        var _x2  =  x2*costheta -  y2*sintheta;
        var _y2  =  x2*sintheta +  y2*costheta;
        s.push([_x,_y,join,_x1,_y1,_x2,_y2]);
      }
    }
    return s;
  }

  do_reset() {
    var o = [];
    o.push(`linecap := butt;`);
    o.push(`linejoin := mitered;`);
    return o.join('\n');
  }

  coordsToMP(coords,multi=false) {
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
    for (var i in coords) {
      var pt = coords[i];
      var x = pt[0];/// we will do fix down below
      var y = pt[1];///
      var join = pt[2];
      ///doing some fixes
      join = join || '';
      if (i == 0) {
        o.push(`(${this.fix(x)},${this.fix(y)})`);
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
        let p1x = pt[3];/// CUBIC BEZIER curve controlpoint 1x
        let p1y = pt[4];/// CUBIC BEZIER curve controlpoint 1y
        let p2x = pt[5];/// CUBIC BEZIER curve controlpoint 2x
        let p2y = pt[6];/// CUBIC BEZIER curve controlpoint 2y
        var bezier = `..controls(${this.fix(p1x)},${this.fix(p1y)})and(${this.fix(p2x)},${this.fix(p2y)})..`;
        o.push(`${bezier}(${this.fix(x)},${this.fix(y)})`);
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
        var bezier = `..controls(${this.fix(p1x)},${this.fix(p1y)})and(${this.fix(p2x)},${this.fix(p2y)})..`;
        o.push(`${bezier}(${this.fix(x)},${this.fix(y)})`);
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
        o.push(`--(${this.fix(x)},${this.fix(y)})`);
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

  def_linecaps(g) {
    if (this.linecap === 'butt') {
      return 'butt';
    } else if (this.linecap === 'round') {
      return 'rounded';
    } else if (this.linecap === 'square') {
      return 'squared';
    }
    return '';
  }
  
  def_linejoins(g) {
    if (this.linejoin === 'miter') {
      return 'mitered';
    } else if (this.linejoin === 'round') {
      return 'rounded';
    } else if (this.linejoin === 'bevel') {
      return 'beveled';
    }
    return '';
  }
  
  local(pt) {
    var x = pt[0];
    var y = pt[1];
    return [x, y];
  }

  localx(x) {
    return x;
  }

  localy(y) {
    return y;
  }

  p_path(coords,g){
    var o = [];
    var items = this.coordsToMP(coords,true);
    for(var item of items) {
      var {iscycled,d} = item;
      d = d.trim();
      if(!d) continue;
      if(iscycled && this.has_fills(g)){
        o.push(`fill (${d}) scaled(u) ${this.to_fills(g)};`);
      }
      if(g.dblarrow){
        o.push(`drawdblarrow (${d}) scaled(u) ${this.to_draws(g)};`);
      }else if(g.revarrow){
        o.push(`drawarrow reverse(${d}) scaled(u) ${this.to_draws(g)};`);
      }else if(g.arrow){
        o.push(`drawarrow (${d}) scaled(u) ${this.to_draws(g)};`);
      }else{
        o.push(`draw (${d}) scaled(u) ${this.to_draws(g)};`);
      }
    }
    return o.join('\n');
  }

  p_circle(x,y,radius,g){
    var o = [];
    if (this.has_fills(g)){
      o.push(`fill fullcircle scaled(${radius*2}) shifted(${x},${y}) scaled(u) ${this.to_fills(g)};`);
    } 
    o.push(`draw fullcircle scaled(${radius*2}) shifted(${x},${y}) scaled(u) ${this.to_draws(g)};`);
    return o.join('\n');
  }

  p_rect(x,y,w,h,g){
    var mypath = `(${x},${y})--(${x+w},${y})--(${x+w},${y+h})--(${x},${y+h})--cycle`;
    var o = [];
    if (this.has_fills(g)){
      o.push(`fill (${mypath}) scaled(u) ${this.to_fills(g)};`);
    } 
    o.push(`draw (${mypath}) scaled(u) ${this.to_draws(g)};`);
    return o.join('\n');
  }

  p_line(x1,y1,x2,y2,g){
    var mypath = `(${x1},${y1})--(${x2},${y2})`;
    var o = [];
    if(g.dblarrow){
      o.push(`drawdblarrow (${mypath}) scaled(u) ${this.to_draws(g)};`);
    }
    else if(g.revarrow){
      o.push(`drawarrow reverse(${mypath}) scaled(u) ${this.to_draws(g)};`);
    }
    else if(g.arrow){
      o.push(`drawarrow (${mypath}) scaled(u) ${this.to_draws(g)};`);
    }
    else {
      o.push(`draw (${mypath}) scaled(u) ${this.to_draws(g)};`);
    }
    return o.join('\n');
  }

  p_qbezier_line(x0,y0, x1,y1, x2,y2, g){
    var o = [];
    let [C0,C1,C2,C3] = this.quadrilatic_bezier_to_cubic([x0,y0],[x1,y1],[x2,y2]);
    var x0 = C0[0];
    var y0 = C0[1];
    var x1 = C1[0];
    var y1 = C1[1];
    var x2 = C2[0];
    var y2 = C2[1];
    var x3 = C3[0];
    var y3 = C3[1];
    var path = `(${this.fix(x0)},${this.fix(y0)})..controls(${this.fix(x1)},${this.fix(y1)})and(${this.fix(x2)},${this.fix(y2)})..(${this.fix(x3)},${this.fix(y3)})`;
    if(g.dblarrow){
      o.push(`drawdblarrow (${path}) scaled(u) ${this.to_draws(g)};`);
    }else if(g.revarrow){
      o.push(`drawarrow reverse(${path}) scaled(u) ${this.to_draws(g)};`);
    }else if(g.arrow){
      o.push(`drawarrow (${path}) scaled(u) ${this.to_draws(g)};`);
    }else{
      o.push(`draw (${path}) scaled(u) ${this.to_draws(g)};`);
    }
    return o.join('\n');
  }

  p_hbar(x,y,g){
    var o = [];
    var dx = this.to_barlength_length(g);
    var mypath = `(${this.fix(x)},${this.fix(y)})--(${this.fix(x+dx)},${this.fix(y)})`;
    o.push(`draw (${mypath}) scaled(u) ${this.to_draws(g)};`);
    return o.join('\n');
  }

  p_vbar(x,y,g){
    var o = [];
    var dy = this.to_barlength_length(g);
    var mypath = `(${this.fix(x)},${this.fix(y)})--(${this.fix(x)},${this.fix(y+dy)})`;
    o.push(`draw (${mypath}) scaled(u) ${this.to_draws(g)};`);
    return o.join('\n');
  }

  p_label(x,y,txt,ts,ta,g){
    ///move the label distance away
    [x,y] = this.move_label_away(x,y,ta,this.config.labeldx,this.config.labeldy);
    x += this.assertFloat(g.dx,0);
    y += this.assertFloat(g.dy,0);

    ///then we convert to local
    x = this.localx(x);
    y = this.localy(y);
    if(ta=='ctr'){
      var myopt = '';
    }
    else if(ta.length && this.is_valid_ta(ta)){
      var myopt = `.${ta}`;
    }
    else {
      var myopt = `.urt`;
    }
    var fontsize = this.config.fontsize;
    var tex_label = this.to_tex_label(txt,ts,fontsize);
    return(`label${myopt} (${tex_label}, (${this.fix(x)}*u,${this.fix(y)}*u)) ${this.to_texts(g)};`);
  }

  p_pie(x,y,radius,angle1,angle2,g){
    ///pie
    var x1 = Math.cos(angle1 / 180 * Math.PI);
    var y1 = Math.sin(angle1 / 180 * Math.PI);
    var x2 = Math.cos(angle2 / 180 * Math.PI);
    var y2 = Math.sin(angle2 / 180 * Math.PI);
    if (angle2 >= angle1) {
      var my_angle = angle2 - angle1;
      var my_angle = angle1 + my_angle / 2;
    } else {
      var my_angle = angle2 - angle1 + 360;
      var my_angle = angle1 + my_angle / 2;
      if (my_angle > 360) {
        my_angle -= 360;
      }
    }
    var xm = Math.cos(my_angle / 180 * Math.PI);
    var ym = Math.sin(my_angle / 180 * Math.PI);
    x1 = this.fix(x1);
    y1 = this.fix(y1);
    x2 = this.fix(x2);
    y2 = this.fix(y2);
    xm = this.fix(xm);
    ym = this.fix(ym);
    var o = [];
    if (this.has_fills(g)) {
      o.push(`fill ((${x1},${y1})..(${xm},${ym})..(${x2},${y2})--(0,0)--cycle) scaled(${radius}) shifted(${x},${y}) scaled(u) ${this.to_fills(g)};`);
    }
    o.push(`draw ((${x1},${y1})..(${xm},${ym})..(${x2},${y2})--(0,0)--cycle) scaled(${radius}) shifted(${x},${y}) scaled(u) ${this.to_draws(g)};`);
    return o.join('\n');
  }

  p_chord(x,y,radius,angle1,angle2,g){
    //chord
    var x1 = Math.cos(angle1 / 180 * Math.PI);
    var y1 = Math.sin(angle1 / 180 * Math.PI);
    var x2 = Math.cos(angle2 / 180 * Math.PI);
    var y2 = Math.sin(angle2 / 180 * Math.PI);
    x1 = this.fix(x1);
    y1 = this.fix(y1);
    x2 = this.fix(x2);
    y2 = this.fix(y2);
    radius = this.fix(radius);
    return(`draw ((${x1},${y1})--(${x2},${y2})) scaled(${radius}) shifted(${x},${y}) scaled(u) ${this.to_draws(g)};`);
  }

  _p_arc(x,y,radius,angle1,angle2,g){
    //arc   
    var x1 = Math.cos(angle1 / 180 * Math.PI);
    var y1 = Math.sin(angle1 / 180 * Math.PI);
    var x2 = Math.cos(angle2 / 180 * Math.PI);
    var y2 = Math.sin(angle2 / 180 * Math.PI);
    if (angle2 >= angle1) {
      var my_angle = angle2 - angle1;
      var my_angle = angle1 + my_angle / 2;
    } else {
      var my_angle = angle2 - angle1 + 360;
      var my_angle = angle1 + my_angle / 2;
      if (my_angle > 360) {
        my_angle -= 360;
      }
    }
    var xm = Math.cos(my_angle / 180 * Math.PI);
    var ym = Math.sin(my_angle / 180 * Math.PI);
    x1 = this.fix(x1);
    y1 = this.fix(y1);
    x2 = this.fix(x2);
    y2 = this.fix(y2);
    xm = this.fix(xm);
    ym = this.fix(ym);
    radius = this.fix(radius);
    return(`draw ((${x1},${y1})..(${xm},${ym})..(${x2},${y2})) scaled(${radius}) shifted(${x},${y}) scaled(u) ${this.to_draws(g)};`);
  }

  p_cseg(x,y,radius,angle1,angle2,g){
    //cseg
    var x1 = Math.cos(angle1 / 180 * Math.PI);
    var y1 = Math.sin(angle1 / 180 * Math.PI);
    var x2 = Math.cos(angle2 / 180 * Math.PI);
    var y2 = Math.sin(angle2 / 180 * Math.PI);
    if (angle2 >= angle1) {
      var my_angle = angle2 - angle1;
      var my_angle = angle1 + my_angle / 2;
    } else {
      var my_angle = angle2 - angle1 + 360;
      var my_angle = angle1 + my_angle / 2;
      if (my_angle > 360) {
        my_angle -= 360;
      }
    }
    var xm = Math.cos(my_angle / 180 * Math.PI);
    var ym = Math.sin(my_angle / 180 * Math.PI);
    x1 = this.fix(x1);
    y1 = this.fix(y1);
    x2 = this.fix(x2);
    y2 = this.fix(y2);
    xm = this.fix(xm);
    ym = this.fix(ym);
    var o = [];
    if (this.has_fills(g)) {
      o.push(`fill ((${x1},${y1})..(${xm},${ym})..(${x2},${y2})--cycle) scaled(${radius}) shifted(${x},${y}) scaled(u) ${this.to_fills(g)};`);
    }
    o.push(`draw ((${x1},${y1})..(${xm},${ym})..(${x2},${y2})--cycle) scaled(${radius}) shifted(${x},${y}) scaled(u) ${this.to_draws(g)};`);
    return o.join('\n');
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

  to_fillcolor_str(g){
    if (g.fillcolor) {
      return(`${this.to_colors(g.fillcolor)}`);
    } 
    if(this.config.fillcolor){
      return(`${this.to_colors(this.config.fillcolor)}`);
    }
    return '';
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

  has_fills(g){
    var d = this.to_fillcolor_str(g);
    return (d)?true:false;
  }

  to_texts(g) {
    var withcolor = '';
    if (g.fontcolor) {
      var withcolor = `withcolor ${this.to_colors(g.fontcolor)}`;
    }
    return withcolor;
  }

  p_ellipse(x,y,Rx,Ry,angle,g){
    var o = [];
    /// x,y,angle,rx,ry
    var x1 = x + Rx * Math.cos(angle/180*Math.PI);
    var y1 = y + Rx * Math.sin(angle/180*Math.PI);
    var x2 = x - Rx * Math.cos(angle/180*Math.PI);
    var y2 = y - Rx * Math.sin(angle/180*Math.PI);
    x1 = this.localx(x1);
    y1 = this.localy(y1);
    x2 = this.localx(x2);
    y2 = this.localy(y2);
    ///GETTING ready to compute the 
    var X1 = x1;
    var Y1 = y1;
    var X2 = x2;
    var Y2 = y2;
    var Phi = angle;
    var Cx = x;
    var Cy = y;
    ///THE following steps are to calculate the ang1/ang2 which is the perimetric angle
    ///which is needed for the 'subpath' of MP
    var lambda1 = Math.atan2(Y1 - Cy, X1 - Cx);
    var lambda2 = Math.atan2(Y2 - Cy, X2 - Cx);
    lambda2 -= Phi / 180 * Math.PI;
    lambda1 -= Phi / 180 * Math.PI;
    var tao1 = Math.atan2(Math.sin(lambda1) / Ry, Math.cos(lambda1) / Rx);
    var tao2 = Math.atan2(Math.sin(lambda2) / Ry, Math.cos(lambda2) / Rx);
    var ang1 = this.to360(tao1 / Math.PI * 180);
    var ang2 = this.to360(tao2 / Math.PI * 180);
    if (ang2 < ang1) { ang2 += 360; }
    //s.push(`--(subpath (${ang1 / 45},${ang2 / 45}) of fullcircle xscaled(${this.fix(2*Rx)}) yscaled(${this.fix(2*Ry)}) rotated(${Phi}) shifted(${this.fix(Cx)},${this.fix(Cy)}))`);
    //s.push(`--(subpath (${ang2 / 45},${ang1 / 45}) of fullcircle xscaled(${this.fix(2*Rx)}) yscaled(${this.fix(2*Ry)}) rotated(${Phi}) shifted(${this.fix(Cx)},${this.fix(Cy)}))`);
    if (this.has_fills(g)){
      o.push(`fill fullcircle xscaled(${this.fix(2*Rx)}*u) yscaled(${this.fix(2*Ry)}*u) rotated(${Phi}) shifted(${this.fix(Cx)}*u,${this.fix(Cy)}*u) ${this.to_fills(g)};`);
    }
    o.push(`draw fullcircle xscaled(${this.fix(2*Rx)}*u) yscaled(${this.fix(2*Ry)}*u) rotated(${Phi}) shifted(${this.fix(Cx)}*u,${this.fix(Cy)}*u) ${this.to_draws(g)};`);
    return o.join('\n'); 
  }

  p_dot(x,y,g){
    var x = this.localx(x);    
    var y = this.localy(y);    
    ///reject points that are not within the viewport
    if(x < 0 || x > this.config.width){
      return;
    }
    if(y < 0 || y > this.config.height){
      return;
    }
    ///***NOTE that drawdot cannot use shifted or scaled command
    ///   because there is no path before it
    return(`fill fullcircle scaled(${this.to_dotsize_diameter(g)}) shifted(${x}*u,${y}*u) ${this.to_dotcolors(g)};`);
  }

  to_dotsize_diameter(g) {
    if (g.dotsize) {
      var d = parseFloat(g.dotsize);
      if(Number.isFinite(d)){
        return (d);
      }
    } 
    return parseFloat(this.config.dotsize);
  }

  to_barlength_length(g) {
    if (g.barlength) {
      var d = parseFloat(g.barlength);
      if(Number.isFinite(d)){
        return (d);
      }
    } 
    return parseFloat(this.config.barlength);
  }

  to_dotcolors(g){
    if (g.dotcolor) {
      return(`withcolor ${this.to_colors(g.dotcolor)}`);
    }
    return '';
  }

  p_arc(x,y,r,a1,a2,g){
    var o = [];
    var x1 = x + r*Math.cos(a1/180*Math.PI); 
    var y1 = y + r*Math.sin(a1/180*Math.PI); 
    var x2 = x + r*Math.cos(a2/180*Math.PI); 
    var y2 = y + r*Math.sin(a2/180*Math.PI); 
    var Rx = r;
    var Ry = r;
    var Phi = 0;
    var Cx = x;
    var Cy = y;
    var ang1 = a1/45;
    var ang2 = a2/45;
    if(ang2 < ang1) { ang2 += 8; }
    var mypath = `(subpath (${this.fix(ang1)},${this.fix(ang2)}) of fullcircle xscaled(${this.fix(2*Rx)}) yscaled(${this.fix(2*Ry)}) rotated(${Phi}) shifted(${this.fix(Cx)},${this.fix(Cy)}))`;
    o.push(`draw (${mypath}) scaled(u) ${this.to_draws(g)};`);
    return o.join('\n');
  }

  p_arc_sq(x,y,r,a1,a2,g){
    var o = [];
    var x1 = x + 0.7*r*Math.cos(a1/180*Math.PI); 
    var y1 = y + 0.7*r*Math.sin(a1/180*Math.PI); 
    var x2 = x + 0.7*r*Math.cos(a2/180*Math.PI); 
    var y2 = y + 0.7*r*Math.sin(a2/180*Math.PI); 
    var xm = x + r*Math.cos((a1+a2)/2/180*Math.PI); 
    var ym = y + r*Math.sin((a1+a2)/2/180*Math.PI); 
    var Rx = r;
    var Ry = r;
    var Phi = 0;
    var Cx = x;
    var Cy = y;
    var ang1 = a1;
    var ang2 = a2;
    var mypath = `(${this.fix(x1)},${this.fix(y1)})--(${this.fix(xm)},${this.fix(ym)})--(${this.fix(x2)},${this.fix(y2)})`;
    o.push(`draw (${mypath}) scaled(u) ${this.to_draws(g)};`);
    return o.join('\n');
  }

  p_shape(x,y,p,g){
    var o = [];
    var items = this.coordsToMP(p,true);
    var sx = this.assertFloat(g.sx,1);
    var sy = this.assertFloat(g.sy,1);
    for( var item of items ) {
      var {iscycled,d} = item;
      d = d.trim();
      if(!d) continue;
      if(iscycled && this.has_fills(g)){
        o.push(`fill (${d}) xscaled(${sx}) yscaled(${sy}) shifted(${x},${y}) scaled(u) ${this.to_fills(g)};`);
      }
      o.push(`draw (${d}) xscaled(${sx}) yscaled(${sy}) shifted(${x},${y}) scaled(u) ${this.to_draws(g)};`);
    }
    return o.join('\n');
  }

  is_valid_ta(s){
    if( s.localeCompare('lft') == 0 ||
        s.localeCompare('rt') == 0 ||
        s.localeCompare('top') == 0 ||
        s.localeCompare('bot') == 0 ||
        s.localeCompare('ulft') == 0 ||
        s.localeCompare('urt') == 0 ||
        s.localeCompare('llft') == 0 ||
        s.localeCompare('lrt') == 0) {
        return true;
    }
    return false;
  }

  webrgb_to_mprgb_s(s){
    // convert a string such as EFD to (0.93,1,0.87)
    // will truncate to 2 decimal places
    // convert a string such as E0F0D0 to (0.93,1,0.87)
    if(s.length==6){
      var r = s.substr(0,2); r = parseInt(`0x${r}`); r /= 255;
      var g = s.substr(2,2); g = parseInt(`0x${g}`); g /= 255;
      var b = s.substr(4,2); b = parseInt(`0x${b}`); b /= 255;
    }else if(s.length==3){
      var r = s.substr(0,1); r = parseInt(`0x${r}`); r /= 15;
      var g = s.substr(1,1); g = parseInt(`0x${g}`); g /= 15;
      var b = s.substr(2,1); b = parseInt(`0x${b}`); b /= 15;
    } else {
      var r = 1;
      var g = 1;
      var b = 1;
    }
    return `(${this.fix2(r)},${this.fix2(g)},${this.fix2(b)})`;
  }
  to_mp_vbarchart (g) {
    ///
    /// vbarchart
    ///
    // *** \vbarchart{20;10;0.2,0.8,0.6,0.4,1.0}
    //
    //  \begin{mplibcode}
    //  beginfig(1)
    //  linecap := butt;
    //  linejoin := mitered;
    //  w := 20mm;
    //  h := 10mm;
    //  draw ((0,0)--(0.2,0)--(0.2,0.2)--(0,0.2)--cycle)     xscaled(w) yscaled(h) ;
    //  draw ((0.2,0)--(0.4,0)--(0.4,0.8)--(0.2,0.8)--cycle) xscaled(w) yscaled(h) ;
    //  draw ((0.4,0)--(0.6,0)--(0.6,0.6)--(0.4,0.6)--cycle) xscaled(w) yscaled(h) ;
    //  draw ((0.6,0)--(0.8,0)--(0.8,0.4)--(0.6,0.4)--cycle) xscaled(w) yscaled(h) ;
    //  draw ((0.8,0)--(1,0)--(1,1.0)--(0.8,1.0)--cycle)     xscaled(w) yscaled(h) ;
    //  endfig
    //  \end{mplibcode}
    //
    var o = [];
    var w = g.width;
    var h = g.height;
    var data = g.data;
    if(w && h && data){
      var data = data.split(',');
      var data = data.map(x => x.trim());
      o.push(`linecap := butt;`);
      o.push(`linejoin := mitered;`);
      o.push(`w := ${w}mm;`);
      o.push(`h := ${h}mm;`);
      o.push(`draw (0,0)--(1,1) xscaled(w) yscaled(h) withcolor white;`);
      for(var j=0; j < data.length; j++){
        var num=data[j];
        var gap=1/data.length;
        var x1=j*gap;
        var x2=(j+1)*gap;
        var y1=0;
        var y2=data[j];
        o.push(`draw ((${this.fix(x1)},${this.fix(y1)})--(${this.fix(x2)},${this.fix(y1)})--(${this.fix(x2)},${this.fix(y2)})--(${this.fix(x1)},${this.fix(y2)})--cycle) xscaled(w) yscaled(h) ;`);
      }
    }
    var s = o.join('\n');
    return s;
  }
  to_mp_colorbox (g) {
    ///
    /// colorbox
    /// 
    var o = [];
    var width = g.width;
    var height = g.height;
    var data = g.data;
    o.push(`fill unitsquare xscaled(${width}mm) yscaled(${height}mm) withcolor ${this.to_colors(data)};`);
    return o.join('\n');
  }
  to_mp_xyplot(g){
    ///
    /// xyplot   
    ///
    // *** \xyplot{0.2,0.2,0.3,0.3,0.4,0.4;20;10}
    //
    //  \begin{mplibcode}
    //  beginfig(1)
    //  linecap := butt;
    //  linejoin := mitered;
    //  w := 20mm;
    //  h := 10mm;
    //  fill fullcircle scaled(2) shifted(0.2,0.2) scaled(u) ;`);
    //  fill fullcircle scaled(2) shifted(0.3,0.3) scaled(u) ;`);
    //  fill fullcircle scaled(2) shifted(0.4,0.4) scaled(u) ;`);
    //  endfig
    //  \end{mplibcode}
    //
    var o = [];
    var p_circledot=1;
    var p_interline=2;
    var w = g.width;
    var h = g.height;
    var data = g.data;  
    var p = g.extra;
    if(w && h && data){
      var data = data.split(',');
      var data = data.map(x => x.trim());
      var data = data.map(x => parseFloat(x));
      var data = data.filter(x => Number.isFinite(x));
      if(p&p_interline){
        var ldata = data.slice(0,4);
        data = data.slice(4);
      }else{
        var ldata=[];
      }
      o.push(`linecap := butt;`);
      o.push(`linejoin := mitered;`);
      o.push(`w := ${w}mm;`);
      o.push(`h := ${h}mm;`);
      o.push(`draw (0,0)--(1,1) xscaled(w) yscaled(h) withcolor white;`);
      for(var j=0; j < data.length; j+=2){
        var x=data[j];
        var y=data[j+1];
        if(p&p_circledot){
          o.push(`draw fullcircle scaled(2) shifted(${this.fix(x)}*w,${this.fix(y)}*h) ;`);
        }else{
          o.push(`fill fullcircle scaled(2) shifted(${this.fix(x)}*w,${this.fix(y)}*h) ;`);
        }
      }
      ///draw interline
      if(ldata.length==4){
        var x1=ldata[0];
        var y1=ldata[1];
        var x2=ldata[2];
        var y2=ldata[3];
        o.push(`draw ((${x1},${y1})--(${x2},${y2})) xscaled(w) yscaled(h) ;`);
      }
    }
    return o.join('\n');
  }
  str_to_mf_width(str) {
    /// take an input string that is 100% and convert it to '\linewidth'.
    /// take an input string that is 50% and convert it to '0.5\linewidth'.
    /// take an input string that is 10cm and returns "10cm"
    if (!str) {
      return '';
    }
    var re = /^(.*)\%$/;
    if (re.test(str)) {
      var str0 = str.slice(0, str.length - 1);
      var num = parseFloat(str0) / 100;
      if (Number.isFinite(num)) {
        var num = num.toFixed(3);
        if (num == 1) {
          return `\\the\\textwidth`;
        }
        return `${num}\\the\\textwidth`;
      }
    }
    return str;
  }

}

module.exports = { NitrilePreviewDiagramMP };
