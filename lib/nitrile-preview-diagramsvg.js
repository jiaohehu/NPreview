'use babel';

const { NitrilePreviewDiagram } = require('./nitrile-preview-diagram');
const { NitrilePreviewTokenizer } = require('./nitrile-preview-tokenizer');
const { arcpath } = require('./nitrile-preview-arcpath');
const my_svglabel_dx = 4;///hardcoded for moving horizontally away from the anchor point in px
const my_svglabel_dy = 2;///hardcoded for moving vertically away from the anchor point in px

class NitrilePreviewDiagramSVG extends NitrilePreviewDiagram {

  constructor(translator) {
    super(translator);
    this.tokenizer = new NitrilePreviewTokenizer(translator);
    this.re_unit = /^(\d+)mm$/;
    this.re_inlinemath = /^\`\`(.*)\`\`$/;
    this.is_dia = 0;
  }


  do_setup () {
    /// generate viewBox
    var v = null;
    var u = 3.78*this.config.unit;///this.config.unit is always in mm
    var vw = u*this.config.width;
    var vh = u*this.config.height;
    this.u = u;
    this.vw = vw;
    this.vh = vh;
  }
  do_finalize(s,style) {
    var o = [];
    ///GENERATE grids
    var u = this.u;
    var vw = this.vw;
    var vh = this.vh;
    if(this.is_dia){
      o.push('<defs>');
      o.push(`<marker id='markerArrow' markerWidth='3' markerHeight='4' refX='3' refY='2' orient='auto'> <path d='M0,0 L3,2 L0,4 z' stroke='none' fill='context-stroke'/> </marker>`);
      o.push(`<marker id='startArrow'  markerWidth='3' markerHeight='4' refX='0' refY='2' orient='auto'> <path d='M3,0 L3,4 L0,2 z' stroke='none' fill='context-stroke'/> </marker>`);
      o.push('</defs>');
      o.push(`<rect width="${vw}" height="${vh}" fill="none" />`);
      o.push(s);    
      var s = o.join('\n');
    }else{
      o.push('<defs>');
      o.push(`<pattern id="smallgrid" width="${u}" height="${u}" patternUnits="userSpaceOnUse"><path d="M ${u} 0 L 0 0 0 ${u}" fill="none" stroke="gray" stroke-width="0.5" /></pattern>`);
      o.push(`<marker id='markerArrow' markerWidth='3' markerHeight='4' refX='3' refY='2' orient='auto'> <path d='M0,0 L3,2 L0,4 z' stroke='none' fill='context-stroke'/> </marker>`);
      o.push(`<marker id='startArrow'  markerWidth='3' markerHeight='4' refX='0' refY='2' orient='auto'> <path d='M3,0 L3,4 L0,2 z' stroke='none' fill='context-stroke'/> </marker>`);
      o.push('</defs>');
      o.push(`<rect width="${vw}" height="${vh}" fill="url(#smallgrid)" />`);
      o.push(s);    
      var s = o.join('\n');
    }
    if (style && style.width) {
      let str = style.width;
      str = this.translator.str_to_css_width(str);
      var text = `<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' fill='currentColor' stroke='currentColor' viewBox='0 0 ${vw} ${vh}' style='width:${str}; ' >${s}</svg>`;
    } else {
      var text = `<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' fill='currentColor' stroke='currentColor' width='${vw}' height='${vh}' >${s}</svg>`;
    }
    s = text;
    return {s};
  }
  
  do_comment(s) {
    s = s.replace(/\-\-/g,'');
    s = s.replace(/\\/g,'\\\\');
    s = this.translator.smooth(s);
    return `<!-- ${s} -->`;
  }

  localline(x1,y1,x2,y2) {
    /// * NOTE: this method translate and/or scale the local reference point to
    ///   SVG coords.
    ///
    x1 = this.localx(x1);
    y1 = this.localy(y1);
    x2 = this.localx(x2);
    y2 = this.localy(y2);
    return [x1,y1,x2,y2];
  }

  localx(x) {
    /// * NOTE: this method translate and/or scale the local reference point to
    ///   SVG coords.
    ///
    //x *= this.refs;
    //x += this.refx;
    x *= this.u;
    return x;
  }

  localdist(x) {
    x *= this.u;
    return x;
  }

  localy(y) {
    /// * NOTE: this method translate and/or scale the local reference point to
    ///   SVG coords.
    ///
    //y *= this.refs;
    //y += this.refy;
    y = this.config.height-y;
    y *= this.u;
    return y;
  }

  localpt(pt) {
    /// * NOTE: this method translate and/or scale the local reference point to
    ///   SVG coords.
    ///
    let [x,y] = pt;;
    x = this.localx(x);
    y = this.localy(y);
    return [x,y];
  }

  to_colors(color) {
    if (!color) {
      return 'none';
    } 
    else if (Array.isArray(color)) {
      return `rgb(${color[0]},${color[1]},${color[2]})`;
    } 
    else if (typeof color === 'string' && color[0] == '#') {
      color = color.slice(1);
      return this.webrgb_to_svgrgb_s(color);
    }
    else if (typeof color === 'string') {
      return color;
    } 
    else {
      return 'none';
    }
  }

  to_textdraws(g) {
    var s = [];
    if (g.fontcolor) {
      s.push(`fill='${this.to_colors(g.fontcolor)}'`);
    }
    s.push(`stroke='none'`);
    return s.join(' ');
  }

  to_linecaps(s) {
    if (s === 'butt') {
      return 'butt';
    } else if (s === 'round') {
      return 'round';
    } else if (s === 'square') {
      return 'square';
    }
    return '';
  }
  
  to_linejoins(s) {
    if (s === 'miter') {
      return 'miter';
    } else if (s === 'round') {
      return 'round';
    } else if (s === 'bevel') {
      return 'bevel';
    }
    return '';
  }
  
  do_drawarc(opt,txt,ts,g,coords){
    ///this functionality has been incorporated into 'line' , with [a:Rx,Ry,Phi,bigf,sweepf,X1,Y1]
    var s = [];
    for (var i = 1; i < coords.length; ++i) {
      var z0 = this.point(coords, i - 1);
      var z1 = this.point(coords, i);
      if(!this.isvalidpt(z0)) continue;
      if(!this.isvalidpt(z1)) continue;
      var X1 = z0[0];
      var Y1 = z0[1];
      var X2 = z1[0];
      var Y2 = z1[1];
      var Rx = this.Rx;
      var Ry = this.Ry;
      var Phi = this.rotation;
      ///NOTE: we need to switch X1/Y1 and X2/Y2 position
      /// so that X1 is always on the left hand side of X2
      if (0 && X1 > X2) {
        var tmp = X1; X1 = X2; X2 = tmp;
        var tmp = Y1; Y1 = Y2; Y2 = tmp;
      }
      if (this.position == 'top') {
        if (this.bigarcflag) {
          var [Cx, Cy, Rx, Ry] = arcpath(X1, Y1, X2, Y2, Rx, Ry, Phi, 0);
          if (Number.isFinite(Cx) && Number.isFinite(Cy)) {
            var lambda2 = Math.atan2(Y1 - Cy, X1 - Cx);
            var lambda1 = Math.atan2(Y2 - Cy, X2 - Cx);
            lambda2 -= Phi / 180 * Math.PI;
            lambda1 -= Phi / 180 * Math.PI;
            var tao1 = Math.atan2(Math.sin(lambda1) / Ry, Math.cos(lambda1) / Rx);
            var tao2 = Math.atan2(Math.sin(lambda2) / Ry, Math.cos(lambda2) / Rx);
            var ang1 = this.to360(tao1 / Math.PI * 180);
            var ang2 = this.to360(tao2 / Math.PI * 180);
            if (ang2 < ang1) { ang2 += 360; }
          }
        } else {
          var [Cx, Cy, Rx, Ry] = arcpath(X1, Y1, X2, Y2, Rx, Ry, Phi, 1);
          if (Number.isFinite(Cx) && Number.isFinite(Cy)) {
            var lambda2 = Math.atan2(Y1 - Cy, X1 - Cx);
            var lambda1 = Math.atan2(Y2 - Cy, X2 - Cx);
            lambda2 -= Phi / 180 * Math.PI;
            lambda1 -= Phi / 180 * Math.PI;
            var tao1 = Math.atan2(Math.sin(lambda1) / Ry, Math.cos(lambda1) / Rx);
            var tao2 = Math.atan2(Math.sin(lambda2) / Ry, Math.cos(lambda2) / Rx);
            var ang1 = this.to360(tao1 / Math.PI * 180);
            var ang2 = this.to360(tao2 / Math.PI * 180);
            if (ang2 < ang1) { ang2 += 360; }
          }
        }
      } else {
        if (this.bigarcflag) {
          var [Cx, Cy, Rx, Ry] = arcpath(X1, Y1, X2, Y2, Rx, Ry, Phi, 1);
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
        } else {
          var [Cx, Cy, Rx, Ry] = arcpath(X1, Y1, X2, Y2, Rx, Ry, Phi, 0);
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
        }
      }
      //console.log('do_drawarc: tao1=',ang1);
      //console.log('do_drawarc: tao2=',ang2);
      //console.log('do_drawarc: Cx=',Cx);
      //console.log('do_drawarc: Cy=',Cy);
      //console.log('do_drawarc: Rx=',Rx);
      //console.log('do_drawarc: Ry=',Ry);
      //console.log('do_drawarc: Phi=',Phi);
      ///NOTE: need to draw an arc 
      var points = [];
      var ds = [];
      var z0 = this.point(coords, 0);
      var x = z0[0];
      var y = z0[1];
      var bigarcflag = (this.bigarcflag)?1:0;
      var sweepflag = (this.sweepflag)?1:0;///1-clockwise;1-anticlockwise;
      ///NOTE: that X1 is always at the left hand side of X2, and
      ///we are always drawing from X1->X2. Thus, if the curve is at the top
      ///then we are drawing clockwise, thus sweepflag 1.
      ///The rotation is that the positive angle rotates clockwise.
      ///The rotation angle is always in DEGRESS
      if (1) {
        ds.push(`M${this.localx(X1)},${this.localy(Y1)}`);
      }
      if (1) {
        ds.push(`A${this.localdist(Rx)},${this.localdist(Ry)},${-Phi},${bigarcflag},${sweepflag},${this.localx(X2)},${this.localy(Y2)}`);
      }
      var d = ds.join(' ');
      s.push(`<path d='${d}' ${this.to_drawonlys(g)} />`);
    }
    return s.join('\n');
  }

  do_drawcontrolpoints(opt,txt,ts,g,coords){    
    var s = [];
    ///NOTE: the dotsize attribute could be an empty string
    var r = this.to_dotsize_radius(g);
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
        s.push(`<circle cx='${i3}' cy='${i4}' r='${r}' ${this.to_dots(g)}/>`);
        s.push(`<circle cx='${i5}' cy='${i6}' r='${r}' ${this.to_dots(g)}/>`);
        s.push(`<rect x='${x-r}' y='${y-r}' width='${r+r}' height='${r+r}' ${this.to_dots(g)}/>`);
        if (typeof x0 === 'number' && typeof y0 === 'number') {
          s.push(`<rect x='${x0-r}' y='${y0-r}' width='${r+r}' height='${r+r}' ${this.to_dots(g)}/>`);
          x0 = null;
          y0 = null;
        }
      } if (join==='Q') {
        var i3 = this.localx(z0[3]);
        var i4 = this.localy(z0[4]);
        s.push(`<circle cx='${i3}' cy='${i4}' r='${r}' ${this.to_dots(g)}/>`);
        s.push(`<rect x='${x-r}' y='${y-r}' width='${r+r}' height='${r+r}' ${this.to_dots(g)}/>`);
        if (typeof x0 === 'number' && typeof y0 === 'number') {
          s.push(`<rect x='${x0-r}' y='${y0-r}' width='${r+r}' height='${r+r}' ${this.to_dots(g)}/>`);
          x0 = null;
          y0 = null;
        }
      } else {
        x0 = x;
        y0 = y;
      }
    }
    return s.join('\n');
  }

  do_rcard(opt,txt,ts,g,coords){
    var s = [];
    var w = w*this.u;
    var h = h*this.u;
    var rx = 0.2*w;
    var dx = 0.6*w;
    var ry = 0.2*h;
    var dy = 0.6*h;
    for (var i = 0; i < coords.length; i++) {
      var z0 = this.point(coords, i);
      if(!this.isvalidpt(z0)) continue;
      var x = this.localx(z0[0]);
      var y = this.localy(z0[1]);
      s.push(`<path d='M${x+rx},${y} h${dx} q${rx},${0},${rx},${-ry} v${-dy} q${0},${-ry},${-rx},${-ry} h${-dx} q${-rx},${0},${-rx},${ry} v${dy} q${rx},${0},${rx},${ry} z' ${this.to_filldraws(g)} />`);
    }
    return s.join('\n');
  }

  ticks() {
    var s = [];
    if (this.tickcolor) {
      s.push(`stroke='${this.to_colors(this.tickcolor)}'`);
    } else {
      s.push(`stroke='inherit'`);
    }
    if (this.ticksize) {
      s.push(`stroke-width='${this.ticksize}'`);
    }
    return s.join(' ');
  }

  localcoords(coords) {
    var s = [];
    for( let [x,y,join,x1,y1,x2,y2] of coords ) {
      if (join=='cycle'||join=='nan') {
        s.push([x,y,join,x1,y1,x2,y2]);
      } else {
        x = this.localx(x);
        y = this.localx(y);
        x1 = this.localx(x1);
        y1 = this.localx(y1);
        x2 = this.localx(x2);
        y2 = this.localx(y2);
        s.push([x,y,join,x1,y1,x2,y2]);
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

  coordsToD(coords,multi=false) {
    ///***NOTE: returns [str,bad_vars]
    ///***NOTE: i.e: (1,2)..(2,3)--cycle
    /// pt[0]: [1,2,'','','']
    /// pt[1]: [2,3,'..','','']
    /// pt[2]: ['cycle','','--','','']
    var o = [];
    var items = [];
    var iscycled = 0;
    var d = '';
    var item = {iscycled,d};
    var x0 = 0;///last point
    var y0 = 0;
    var u = this.u;
    var isnewseg = 0;
    for (var i in coords) {
      var pt = coords[i];
      var x = this.localx(pt[0]);///NOTE:becomes SVG coords
      var y = this.localy(pt[1]);
      var join = pt[2];
      var p1x = this.localx(pt[3]);/// CUBIC BEZIER curve controlpoint 1x
      var p1y = this.localy(pt[4]);/// CUBIC BEZIER curve controlpoint 1y
      var p2x = this.localx(pt[5]);/// CUBIC BEZIER curve controlpoint 2x
      var p2y = this.localy(pt[6]);/// CUBIC BEZIER curve controlpoint 2y
      ///In case we have a CUBIC BEZIER curve, then pt1 and pt2 are the control points
      if (i == 0) {
        o.push(`M${x},${y}`);
        x0 = x;
        y0 = y;
      }
      else if (join == 'cycle') {
        o.push(`z`);
        if(multi){
          iscycled = 1;
          d = o.join(' ');
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
          d = o.join(' ');
          o = [];
          items.push({iscycled,d});
          isnewseg = 1;
        }
        continue;
      }
      else if (multi && isnewseg == 1) {
        isnewseg = 0;
        o.push(`M${this.fix(x)},${this.fix(y)}`);
        x0 = x;
        y0 = y;
      }
      else if (join == 'C') {
        o.push(`C${this.fix(p1x)},${this.fix(p1y)},${this.fix(p2x)},${this.fix(p2y)},${this.fix(x)},${this.fix(y)}`);
        x0 = x;
        y0 = y;
      }
      else if (join == 'Q') {
        o.push(`Q${this.fix(p1x)},${this.fix(p1y)},${this.fix(x)},${this.fix(y)}`);
        x0 = x;
        y0 = y;
      }
      else if (join == 'A') {
        var Rx         = this.localdist(pt[7]);       
        var Ry         = this.localdist(pt[8]);      
        var Phi        = pt[9];        
        var bigarcflag = pt[10];        
        var sweepflag  = pt[11];        
        o.push(`A${this.fix(Rx)},${this.fix(Ry)},${-this.fix(Phi)},${bigarcflag?1:0},${sweepflag?1:0},${this.fix(x)},${this.fix(y)}`);
        x0 = x;
        y0 = y;
      }
      else {
        o.push(`L${this.fix(x)},${this.fix(y)}`);
        x0 = x;
        y0 = y;
      }
    }
    if(multi){
      if(o.length){
        iscycled = 0;
        d = o.join(' ');
        items.push({iscycled,d});
      }
      return items;
    }else{
      return o.join(' ');
    }
  }

  do_reset() {
    return '';
  }

  p_label(x, y, txt, ts, ta, g) {

    ///move the label distance away
    [x,y] = this.move_label_away(x,y,ta,this.config.labeldx,this.config.labeldy);
    x += this.assertFloat(g.dx,0);
    y += this.assertFloat(g.dy,0);
    
    var x = this.localx(x);
    var y = this.localy(y);

    /// (x,y) is now in SVG-coordinates. 

    /// move extra distance because of the SVG specifics
    var gapx = my_svglabel_dx;
    var gapy = my_svglabel_dy;
    var dx = 0;
    var dy = 0;
    if (ta==='lrt') {
      dx = +gapx;///NOTE:these are in SVG COORD where +y goes downwards
      dy = +gapy;
    } else if (ta==='bot') {
      dy = +gapy;
    } else if (ta==='llft') {
      dx = -gapx;
      dy = +gapy;
    } else if (ta==='urt') {
      dx = +gapx;
      dy = -gapy;
    } else if (ta==='top') {
      dy = -gapy;
    } else if (ta==='ulft') {
      dx = -gapx;
      dy = -gapy;
    } else if (ta==='rt') {
      dx = +gapx;
    } else if (ta==='lft') {
      dx = -gapx;
    } else if (ta==='ctr') {
    } else {
      //treat it as 'urt'
      dx = +gapx;
      dy = -gapy;
    }
    x += dx;
    y += dy;

    ///is it inline math or text?
    var d = [];
    if (ts==2) {
      //math text
      var dstyle = 0;
      var {s,w,h,defs} = this.tokenizer.to_svgmath(txt,dstyle,this.config.fontsize);
      var vw = w*1.3333;///convert to px
      var vh = h*1.3333;///convert to px
      if (ta==='lrt') {
      } else if (ta==='bot') {
        x -= vw/2;
      } else if (ta==='llft') {
        x -= vw;
      } else if (ta==='urt') {
        y -= vh;
      } else if (ta==='top') {
        x -= vw/2;
        y -= vh;
      } else if (ta==='ulft') {
        x -= vw;
        y -= vh;
      } else if (ta==='rt') {
        y -= vh/2;
      } else if (ta==='lft') {
        x -= vw;
        y -= vh/2;
      } else if (ta==='ctr') {
        x -= vw/2;
        y -= vh/2;
      } else {
        ///treat it as 'urt'
        y -= vh;
      }
      d.push(`<svg x='${x}' y='${y}' width='${vw}' height='${vh}' fill='inherit' stroke='inherit' viewBox='0 0 ${vw} ${vh}'><defs>${defs.join('\n')}</defs>${s}</svg>`);
    } else {
      //literal text
      if(ts==1){
        txt = this.translator.polish(txt);
      }else{
        //normal text with symbols
        txt = this.translator.smooth(txt);
      }
      var anchor = 'middle', dy='0.3em';
      if (ta==='lrt') {
        anchor = 'start', dy='0.8em';
      } else if (ta==='bot') {
        anchor = 'middle', dy='0.8em';
      } else if (ta==='llft') {
        anchor = 'end', dy='0.8em';
      } else if (ta==='urt') {
        anchor = 'start', dy='-0.2em';
      } else if (ta==='top') {
        anchor = 'middle', dy='-0.2em';
      } else if (ta==='ulft') {
        anchor = 'end', dy='-0.2em';
      } else if (ta==='rt') {
        anchor = 'start', dy='0.3em';
      } else if (ta==='lft') {
        anchor = 'end', dy='0.3em';
      } else if (ta==='ctr') {
        anchor = 'middle', dy='0.3em';
      } else {
        anchor = 'start', dy='-0.2em';
      }
      d.push(`<text font-size='${this.config.fontsize}pt' text-anchor='${anchor}' ${this.to_textdraws(g)} x='${x}' y='${y}' dy='${dy}'>${txt}</text>`);
    }
    return d.join('\n');
  }

  p_path(coords,g){
    var items = this.coordsToD(coords,true);
    var x = this.to_marker_arrows(g);
    var o = [];
    for(var item of items){
      var {iscycled,d} = item; 
      if(iscycled){
        o.push(`<path d='${d}' ${x} ${this.to_filldraws(g)}/>`);
      } else {
        o.push(`<path d='${d}' ${x} ${this.to_drawonlys(g)}/>`);
      }
    }
    return o.join('\n');
  }

  p_circle(cx, cy, r, g) {
    var o = [];
    var r = this.localdist(r);
    var cx = this.localx(cx);
    var cy = this.localy(cy);
    o.push(`<circle cx='${this.fix(cx)}' cy='${this.fix(cy)}' r='${this.fix(r)}' ${this.to_filldraws(g)}/>`);
    return o.join('\n');
  }

  p_rect(x,y,w,h,g){
    var o = [];
    var x = this.localx(x);
    var y = this.localy(y);
    var w = this.localdist(w);
    var h = this.localdist(h);
    y = y - h;
    o.push(`<rect x='${this.fix(x)}' y='${this.fix(y)}' width='${this.fix(w)}' height='${this.fix(h)}' ${this.to_filldraws(g)} />`);
    return o.join('\n');
  }

  p_line(x1,y1,x2,y2,g){
    var o = [];
    var x1 = this.localx(x1);
    var y1 = this.localy(y1);
    var x2 = this.localx(x2);
    var y2 = this.localy(y2);
    var x = this.to_marker_arrows(g);
    o.push(`<line x1='${this.fix(x1)}' y1='${this.fix(y1)}' x2='${this.fix(x2)}' y2='${this.fix(y2)}' ${x} ${this.to_drawonlys(g)} />`);
    return o.join('\n');
  }

  p_qbezier_line(x0,y0, x1,y1, x2,y2, g){
    var o = [];
    var x0 = this.localx(x0);
    var y0 = this.localy(y0);
    var x1 = this.localx(x1);
    var y1 = this.localy(y1);
    var x2 = this.localx(x2);
    var y2 = this.localy(y2);
    var x = this.to_marker_arrows(g);
    o.push(`<path d='M ${this.fix(x0)},${this.fix(y0)} Q ${this.fix(x1)},${this.fix(y1)},${this.fix(x2)},${this.fix(y2)}' ${x} ${this.to_drawonlys(g)} />`);
    return o.join('\n');
  }

  p_dot(x,y,g){
    var r = this.to_dotsize_radius(g);
    var o = [];
    if(x < 0 || x > this.config.width){
      return;
    }
    if(y < 0 || y > this.config.height){
      return;
    }
    var x = this.localx(x);
    var y = this.localy(y);
    o.push(`<circle cx='${x}' cy='${y}' r='${r}' ${this.to_dots(g)}/>`);
    return o.join('\n');
  }

  p_hbar(x,y,g){
    var o = [];
    var x = parseFloat(x);
    var y = parseFloat(y);
    var X = this.localx(x);
    var Y = this.localy(y);
    var dx = this.to_barlength_length(g);
    var x2 = x + dx;
    var X2 = this.localx(x2);
    var Y2 = this.localy(y);
    o.push(`<line x1='${X}' y1='${Y}' x2='${X2}' y2='${Y2}' ${this.to_drawonlys(g)}/>`);
    return o.join('\n');
  }

  p_vbar(x,y,g){
    var o = [];
    var x = parseFloat(x);
    var y = parseFloat(y);
    var X = this.localx(x);
    var Y = this.localy(y);
    var dy = this.to_barlength_length(g);
    var X2 = this.localx(x);
    var Y2 = this.localy(y+dy);
    o.push(`<line x1='${X}' y1='${Y}' x2='${X2}' y2='${Y2}' ${this.to_drawonlys(g)}/>`);
    return o.join('\n');
  }

  p_pie(cx,cy,radius,angle1,angle2,g){
    //pie       
    var x1 = cx + radius * Math.cos(angle1 / 180 * Math.PI);
    var y1 = cy + radius * Math.sin(angle1 / 180 * Math.PI);
    var x2 = cx + radius * Math.cos(angle2 / 180 * Math.PI);
    var y2 = cy + radius * Math.sin(angle2 / 180 * Math.PI);
    var diff = angle2 - angle1;
    if (diff < 0) diff += 360;
    else if (diff > 360) diff -= 360;
    if (diff > 180) {
      var bigflag = 1;
    } else {
      var bigflag = 0;
    }
    var cx = this.localx(cx);
    var cy = this.localy(cy);
    var x1 = this.localx(x1);
    var y1 = this.localy(y1);
    var x2 = this.localx(x2);
    var y2 = this.localy(y2);
    var r = this.localdist(radius);
    // part of a circle
    return(`<path d='M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${bigflag} 0 ${x2} ${y2} Z' ${this.to_filldraws(g)} />`);
  }

  p_chord(cx,cy,radius,angle1,angle2,g){
    //chord       
    var x1 = cx + radius * Math.cos(angle1 / 180 * Math.PI);
    var y1 = cy + radius * Math.sin(angle1 / 180 * Math.PI);
    var x2 = cx + radius * Math.cos(angle2 / 180 * Math.PI);
    var y2 = cy + radius * Math.sin(angle2 / 180 * Math.PI);
    var diff = angle2 - angle1;
    if (diff < 0) diff += 360;
    else if (diff > 360) diff -= 360;
    if (diff > 180) {
      var bigflag = 1;
    } else {
      var bigflag = 0;
    }
    var cx = this.localx(cx);
    var cy = this.localy(cy);
    var x1 = this.localx(x1);
    var y1 = this.localy(y1);
    var x2 = this.localx(x2);
    var y2 = this.localy(y2);
    var r = this.localdist(radius);
    // part of a circle
    return(`<line x1='${x1}' y1='${y1}' x2='${x2}' y2='${y2}' ${this.to_drawonlys(g)} />`);
  }

  p_arc(cx,cy,radius,angle1,angle2,g){
    //arc     
    var x1 = cx + radius * Math.cos(angle1 / 180 * Math.PI);
    var y1 = cy + radius * Math.sin(angle1 / 180 * Math.PI);
    var x2 = cx + radius * Math.cos(angle2 / 180 * Math.PI);
    var y2 = cy + radius * Math.sin(angle2 / 180 * Math.PI);
    var diff = angle2 - angle1;
    if (diff < 0) diff += 360;
    else if (diff > 360) diff -= 360;
    if (diff > 180) {
      var bigflag = 1;
    } else {
      var bigflag = 0;
    }
    var cx = this.localx(cx);
    var cy = this.localy(cy);
    var x1 = this.localx(x1);
    var y1 = this.localy(y1);
    var x2 = this.localx(x2);
    var y2 = this.localy(y2);
    var r = this.localdist(radius);
    // part of a circle
    return(`<path d='M ${x1} ${y1} A ${r} ${r} 0 ${bigflag} 0 ${x2} ${y2}' ${this.to_drawonlys(g)} />`);
  }

  p_cseg(cx,cy,radius,angle1,angle2,g){
    //arc     
    var x1 = cx + radius * Math.cos(angle1 / 180 * Math.PI);
    var y1 = cy + radius * Math.sin(angle1 / 180 * Math.PI);
    var x2 = cx + radius * Math.cos(angle2 / 180 * Math.PI);
    var y2 = cy + radius * Math.sin(angle2 / 180 * Math.PI);
    var diff = angle2 - angle1;
    if (diff < 0) diff += 360;
    else if (diff > 360) diff -= 360;
    if (diff > 180) {
      var bigflag = 1;
    } else {
      var bigflag = 0;
    }
    var cx = this.localx(cx);
    var cy = this.localy(cy);
    var x1 = this.localx(x1);
    var y1 = this.localy(y1);
    var x2 = this.localx(x2);
    var y2 = this.localy(y2);
    var r = this.localdist(radius);
    // part of a circle
    return(`<path d='M ${x1} ${y1} A ${r} ${r} 0 ${bigflag} 0 ${x2} ${y2} Z' ${this.to_filldraws(g)} />`);
  }

  to_drawonlys(g) {
    g = g||{};
    var o = [];
    if (g.linedashed) {
      o.push(`stroke-dasharray='2'`);
    } else if (g.linedashed === 'withdots') {
      o.push(`stroke-dasharray='1 1'`);
    }
    let linesize = this.to_linesize_px(g);
    if(linesize){
      o.push(`stroke-width='${linesize}'`);
    }
    if (g.linecolor) {
      o.push(`stroke='${this.to_colors(g.linecolor)}'`);
    } else {
      o.push(`stroke='inherit'`);
    }
    if (g.linecap) {
      o.push(`stroke-linecap='${this.to_linecaps(g.linecap)}'`);
    } 
    if (g.linejoin) {
      o.push(`stroke-linejoin='${this.to_linejoins(g.linejoin)}'`);
    } 
    o.push(`fill='none'`);
    return o.join(' ');
  }

  to_filldraws(g) {
    g = g||{};
    var o = [];
    if (g.linedashed) {
      o.push(`stroke-dasharray='2'`);
    } else if (g.linedashed === 'withdots') {
      o.push(`stroke-dasharray='1 1'`);
    }
    let linesize = this.to_linesize_px(g);
    if(linesize){
      o.push(`stroke-width='${linesize}'`);
    }
    if (g.linecolor) {
      o.push(`stroke='${this.to_colors(g.linecolor)}'`);
    } else {
      o.push(`stroke='inherit'`);
    }
    if (g.linecap) {
      o.push(`stroke-linecap='${this.to_linecaps(g.linecap)}'`);
    } 
    if (g.linejoin) {
      o.push(`stroke-linejoin='${this.to_linejoins(g.linejoin)}'`);
    } 
    let d = this.to_fillcolor_str(g);
    if(d){
      o.push(`fill='${d}'`);
    } else {
      o.push(`fill='none'`)
    }
    d = this.to_opacity_str(g);
    if(d){
      o.push(`opacity='${d}'`);
    }
    return o.join(' ');
  }

  to_fillonlys(g) {
    g = g||{};
    var o = [];
    let d = this.to_fillcolor_str(g);
    if(d){
      o.push(`fill='${d}'`);
    } else {
      o.push(`fill='inherit'`)
    }
    d = this.to_opacity_str(g);
    if (d) {
      o.push(`opacity='${d}'`);
    }
    return o.join(' ');
  }

  to_dots(g){
    g = g||{};
    var o = [];
    if (g.dotcolor) {
      o.push(`fill='${this.to_colors(g.dotcolor)}'`);
    } else {
      o.push(`fill='inherit'`);
    }
    o.push(`stroke='none'`);
    return o.join(' ');
  }

  to_bars(g){
    g = g||{};
    var o = [];
    if (g.barcolor) {
      o.push(`stroke='${this.to_colors(g.barcolor)}'`);
    } else {
      o.push(`stroke='inherit'`);
    }
    o.push(`fill='none'`);
    return o.join(' ');
  }

  to_texts(g) {
    var o = [];
    if (g.fontcolor) {
      o.push(`fill='${this.to_colors(g.fontcolor)}'`);
    }
    o.push(`stroke='none'`);
    return o.join(' ');
  }

  p_ellipse(x,y,Rx,Ry,angle,g){
    var o = [];
    var x1 = x + Rx * Math.cos(angle/180*Math.PI);
    var y1 = y + Rx * Math.sin(angle/180*Math.PI);
    var x2 = x - Rx * Math.cos(angle/180*Math.PI);
    var y2 = y - Rx * Math.sin(angle/180*Math.PI);
    x1 = this.localx(x1);
    y1 = this.localy(y1);
    x2 = this.localx(x2);
    y2 = this.localy(y2);
    Rx = this.localdist(Rx);
    Ry = this.localdist(Ry);
    o.push(`<path d='M${x1},${y1} A${Rx},${Ry},${-angle},1,0,${x2},${y2}' ${this.to_filldraws(g)} />`);//anti-clockwise
    o.push(`<path d='M${x1},${y1} A${Rx},${Ry},${-angle},1,1,${x2},${y2}' ${this.to_filldraws(g)} />`);//clockwise
    return o.join('\n');
  }

  to_dotsize_radius(g){
    if(g.dotsize){
      var d = parseFloat(g.dotsize);
      if(Number.isFinite(d)){
        return (d/2*1.333);
      }
    } 
    return (this.config.dotsize/2*1.333);
  }

  to_linesize_px(g){
    if(g.linesize){
      var d = parseFloat(g.linesize);
      if(Number.isFinite(d)){
        return (d*1.333);
      }
    } 
    if(this.config.linesize){
      return (this.config.linesize*1.333);
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

  to_opacity_str(g){
    if(typeof g.opacity === 'number'){
      return `${g.opacity}`;
    }
    if(typeof g.opacity === 'string' && g.opacity.length){
      return g.opacity;
    }
    return '';
  }

  to_barlength_length(g){
    if(g.barlength){
      var d = parseFloat(g.barlength);
      if(Number.isFinite(d)){
        return (d);
      }
    } 
    return parseFloat(this.config.barlength);
    
  }

  p_arc_sq(x,y,r,a1,a2,g){
    var x1 = x + 0.7*r*Math.cos(a1/180*Math.PI); 
    var y1 = y + 0.7*r*Math.sin(a1/180*Math.PI); 
    var x2 = x + 0.7*r*Math.cos(a2/180*Math.PI); 
    var y2 = y + 0.7*r*Math.sin(a2/180*Math.PI); 
    var xm = x + r*Math.cos((a1+a2)/2/180*Math.PI); 
    var ym = y + r*Math.sin((a1+a2)/2/180*Math.PI); 
    x1 = this.localx(x1);
    y1 = this.localy(y1);
    x2 = this.localx(x2);
    y2 = this.localy(y2);
    xm = this.localx(xm);
    ym = this.localy(ym);
    return(`<path d='M${x1},${y1} L${xm},${ym} L${x2},${y2}' ${this.to_drawonlys(g)} />`);
  }

  p_arc(x,y,r,a1,a2,g){
    var x1 = x + r*Math.cos(a1/180*Math.PI); 
    var y1 = y + r*Math.sin(a1/180*Math.PI); 
    var x2 = x + r*Math.cos(a2/180*Math.PI); 
    var y2 = y + r*Math.sin(a2/180*Math.PI); 
    x1 = this.localx(x1);
    y1 = this.localy(y1);
    x2 = this.localx(x2);
    y2 = this.localy(y2);
    r = this.localdist(r);
    if (a2-a1 < 180) {
      return(`<path d='M${x1},${y1} A${r},${r},0,0,0,${x2},${y2}' ${this.to_drawonlys(g)} />`);
    } else {
      return(`<path d='M${x1},${y1} A${r},${r},0,1,0,${x2},${y2}' ${this.to_drawonlys(g)} />`);
    }
  }

  p_shape(x,y,p,g){
    var sx = this.assertFloat(g.sx,1);
    var sy = this.assertFloat(g.sy,1);
    var p = this.scalecoords(p, sx, sy);//refs
    var p = this.shiftcoords(p, x, y);//refx,refy
    var items = this.coordsToD(p,true);
    var o = [];
    for(var item of items){
      var {iscycled,d} = item;
      if(iscycled){
        o.push(`<path d='${d}' ${this.to_filldraws(g)} />`);
      }else{
        o.push(`<path d='${d}' ${this.to_drawonlys(g)} />`);
      }
    }
    return o.join('\n');
  }

  webrgb_to_svgrgb_s(s){
    // convert a string such as EFD to rgb(93%,100%,87%)
    // will truncate to 2 decimal places
    // convert a string such as E0F0D0 to (93%,100%,87%)
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
    r *= 100;
    g *= 100;
    b *= 100;
    return `rgb(${this.fix(r)}%,${this.fix(g)}%,${this.fix(b)}%)`;
  }

  to_marker_arrows(g){
    var x = [];
    if(g.dblarrow){
      x.push(`marker-start='url(#startArrow)'`);
      x.push(`marker-end='url(#markerArrow)'`);
    }else if(g.revarrow){
      x.push(`marker-start='url(#startArrow)'`);
    }else if(g.arrow){
      x.push(`marker-end='url(#markerArrow)'`);
    }
    x = x.join(' ');
    return x;
  }
  to_svg_xyplot (g) {
    // *** \xyplot{20;10;0.2,0.2,0.3,0.3,0.4,0.4}
    //
    var p_circledot=1;
    var p_interline=2;
    var o = [];
    var w = g.width;
    var h = g.height;
    var data = g.data;;
    var p = g.extra;
    if(w && h && data){
      var u = 3.78;
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
      for(var j=0; j < data.length; j+=2){
        var x=data[j];
        var y= 1 - data[j+1];
        if(p&p_circledot){
          o.push(`<circle cx='${this.fix(x*u*w)}' cy='${this.fix(y*u*h)}' r='1pt' stroke='inherit' fill='none' />`);
        }else{
          o.push(`<circle cx='${this.fix(x*u*w)}' cy='${this.fix(y*u*h)}' r='1pt' stroke='none' fill='inherit' />`);
        }
      }
      ///draw interline
      if(ldata.length==4){
        var x1=ldata[0];
        var y1=1 - ldata[1];
        var x2=ldata[2];
        var y2=1 - ldata[3];
        o.push(`<line x1='${this.fix(x1*u*w)}' y1='${this.fix(y1*u*h)}' x2='${this.fix(x2*u*w)}' y2='${this.fix(y2*u*h)}' stroke='inherit' />`);
      }
    }
    var s = o.join('\n');
    return {s,w,h};
  }
  to_svg_colorbox (g) {
    // *** \colorbox{20;10;pink}
    //
    var o = [];
    var w = g.width;
    var h = g.height;
    var color = g.data;;
    o.push(`<rect x='0' y='0' width='${this.fix(w)}mm' height='${this.fix(h)}mm' stroke='none' fill='${this.to_colors(color)}' />`);
    var s = o.join('\n');
    return {s,w,h};
  }
  to_svg_vbarchart (g) {
    //  \vbarchart{20;10;0.2,0.8,0.6,0.4,1.0}. 
    //
    var o = [];
    var w = g.width;
    var h = g.height;
    var data = g.data; 
    if(w && h && data){
      var u = 3.78;
      var data = data.split(',');
      var data = data.map(x => x.trim());
      for(var j=0; j < data.length; j++){
        var num=data[j];
        var gap=1/data.length;
        var x1=j*gap;
        var y1=1-num;
        o.push(`<rect x='${this.fix(x1*u*w)}' y='${this.fix(y1*u*h)}' width='${this.fix(gap*u*w)}' height='${this.fix(num*u*h-1)}' stroke='inherit' fill='none' />`);
      }
    }
    var s = o.join('\n');
    return {s,w,h};
  }


  
}

module.exports = { NitrilePreviewDiagramSVG };
