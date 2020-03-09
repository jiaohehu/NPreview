'use babel';

const { makeknots, mp_make_choices } = require('./nitrile-preview-mppath');
const { arcpath } = require('./nitrile-preview-arcpath');

const N_Max_Array = 400;
class NitrilePreviewDiagram {

  constructor (parser) {
    this.parser = parser;
    /// regular expression
    this.re_word = /\w+/;
    this.re_commentline = /^\%/;
    this.re_var_command  = /^([\w\/]+)\s*\:\=\s*(.*)$/;
    this.re_viewport_command = /^viewport\s+(\d+)\s+(\d+)/;
    this.re_unit_command = /^unit\s+(\d+)(mm|cm|in)$/;
    this.re_config_command = /^config\s+(\w+)\s*(.*)$/;
    this.re_reset_command = /^reset/;
    this.re_set_command = /^set\s+([\w\-]+)\s*(.*)$/;
    this.re_exit_command = /^exit/;
    this.re_label_command = /^label(\.\w+|)\s+(.*)$/;
    this.re_shape_command = /^shape(\.\w+|)\s+(.*)$/;
    this.re_drawline_command = /^drawline(\.\w+|)\s+(.*)$/;
    this.re_drawarea_command = /^drawarea(\.\w+|)\s+(.*)$/;
    this.re_drawdblarrow_command = /^drawdblarrow(\.\w+|)\s+(.*)$/;
    this.re_drawarrow_command = /^drawarrow(\.\w+|)\s+(.*)$/;
    this.re_drawellipsearc_command = /^drawellipsearc(\.\w+|)\s+(.*)$/;
    this.re_drawanglearc_command = /^drawanglearc(\.\w+|)\s+(.*)$/;
    this.re_circle_command = /^circle(\.\w+|)\s+(.*)$/;
    this.re_rect_command = /^rect(\.\w+|)\s+(.*)$/;
    this.re_rrect_command = /^rrect(\.\w+|)\s+(.*)$/;
    this.re_dot_command = /^dot(\.\w+|)\s+(.*)$/;
    this.re_tick_command = /^tick(\.\w+|)\s+(.*)$/;
    this.re_apple_command = /^apple(\.\w+|)\s+(.*)$/;
    this.re_basket_command = /^basket(\.\w+|)\s+(.*)$/;
    this.re_crate_command = /^crate(\.\w+|)\s+(.*)$/;
    this.re_radical_command = /^radical(\.\w+|)\s+(.*)$/;
    this.re_brick_command = /^brick(\.\w+|)\s+(.*)$/;
    this.re_protractor_command = /^protractor(\.\w+|)\s+(.*)$/;
    this.re_showvar_command = /^showvar\s+(\*|\w+)\s*(.*)$/;
    this.re_pathfunc = /^\$(\w+)\((.*?)\)\s*(.*)$/;
    this.re_dashdot = /^(\-{2,}|\.{2,})\s*(.*)$/;
    this.re_asterisk_index_withopt = /^(\{[^\{\}]*?\}|)\*(\w+)(\d+)(\{.*?\}|)\s*(.*)$/;
    this.re_asterisk_withopt = /^(\{[^\{\}]*?\}|)(\*\w*)(\{.*?\}|)\s*(.*)$/;
    this.re_symbol_withopt =   /^(\{[^\{\}]*?\}|)(\w+)(\{.*?\}|)\s*(.*)$/;
    this.re_coord_withopt =    /^(\{[^\{\}]*?\}|)\((.*?)\)(\{.*?\}|)\s*(.*)$/;
    this.re_offset = /^\<(.*?)\>\s*(.*)$/;
    this.re_relative = /^\[(.*?)\]\s*(.*)$/;
    this.re_label_arg = /\s*\{(.*)\}\s*(.*)$/;
    ///following is a map storing all the symbols
    this.variables = {};
    ///following stores the last array of coords
    /// note that each time an new array must be created
    /// because there might be existing symbols pointing at it
    this.lastcoords = [];
    /// set the viewport width and height and unit
    this.width = 25;  // the total number of grid units of the width
    this.height = 10; // the total number of grid units of the height
    this.unit = '4mm';  // the length each grid unit entails
    this.config = {}; // extra config stuff for the viewport
    /// following are command options for drawing
    this.initSettings();
  }

  initSettings() {
    this.def_refx = this.refx = 0;
    this.def_refy = this.refy = 0;
    this.def_refsx = this.refsx = 1;
    this.def_refsy = this.refsy = 1;
    this.def_fontcolor = this.fontcolor = '';
    this.def_fontsize = this.fontsize = '';
    this.def_slant = this.slant = 0.3;
    this.def_linedashed  = this.linedashed = '';
    this.def_linecolor = this.linecolor = '';
    this.def_linewidth = this.linewidth = '';
    this.def_fillcolor = this.fillcolor = '';
    this.def_dotcolor = this.dotcolor = '';
    this.def_dotsize = this.dotsize = '4pt';
    this.def_tickcolor = this.tickcolor = '';
    this.def_tickwidth = this.tickwidth = '1pt';
    this.def_tickprotrude = this.tickprotrude = 0.33;
    this.def_rectw = this.rectw = 3;
    this.def_recth = this.recth = 2;
    this.def_diameter = this.diameter = 1;
    this.def_angle1 = this.angle1 = 0;
    this.def_angle2 = this.angle2 = 45;
    this.def_xradius = this.xradius = 2;
    this.def_yradius = this.yradius = 1;
    this.def_position = this.position = 'top';
    this.def_anglearcradius = this.anglearcradius = 0.5;
    this.def_anglearclabelradius = this.anglearclabelradius = 1.0;
    this.def_radicallength = this.radicallength = 4;
  }

  toMetaPost (para) {
    var p = null;
    var line = null;
    var o = [];
    var v = null;
    for (line of para) {
      var coords = [];
      var line0 = line;
      if ((v = this.re_commentline.exec(line)) !== null) {
        o.push(`%${line}`);
        continue;
      }
      if ((v = this.re_var_command.exec(line)) !== null) {
        o.push(`%${line}`);
        var symbol = v[1];
        line = v[2];
        var coords = this.readCoordsLine(o, line, false);
        var str = this.coordsToString(coords);
        ///if a:b:c
        var segs = symbol.split('/');
        if (segs.length > 1) {
          for (var i=0; i < segs.length; ++i) {
            var seg = segs[i];
            var pt = this.point(o, coords,i);
            if (this.re_word.test(seg)) {
              this.variables[seg] = [pt];
              ///collect remaining points in coords if this is the last one
              if (i === segs.length-1) {
                for (var j=i+1; j < coords.length; ++j) {
                  var pt = this.point(o, coords,j);
                  this.variables[seg].push(pt);
                }
              }
              o.push(`%***saved as '${seg}'`);
              o.push(`path ${seg}; ${seg}:=${this.coordsToString(this.variables[seg])};`);
            }
          }
        } else if (this.re_word.test(symbol)) {
          o.push(`path ${symbol}; ${symbol}:=${str};`);
          this.variables[symbol] = coords;
        }
        continue;
      }
      if ((v = this.re_viewport_command.exec(line)) !== null) {
        o.push(`%${line}`);
        this.width = this.assertInt(v[1],25,10,100);
        this.height = this.assertInt(v[2],10,4,100);
        o.push(`%*** width: ${this.width} height: ${this.height}`);
        continue;
      }
      if ((v = this.re_unit_command.exec(line)) !== null) {
        o.push(`%${line}`);
        this.unit = `${v[1]}${v[2]}`;
        o.push(`%*** unit: ${this.unit}`);
        continue;
      }
      if ((v = this.re_config_command.exec(line)) !== null) {
        o.push(`%${line}`);
        var key = v[1];
        var val = v[2];
        this.config[key] = val;
        continue;
      }
      if ((v = this.re_reset_command.exec(line)) !== null) {
        o.push(`%${line}`);
        this.initSettings();
        continue;
      }
      if ((v = this.re_set_command.exec(line)) !== null) {
        o.push(`%${line}`);
        var key = v[1];
        var val = v[2].trim();
        if (key === 'refx'    )  {
          ///
          /// /3 - from left
          /// 3/ - from right
          ///
          if (val[0] === '/') { /// '/3'
            val = val.slice(1);
            val = this.assertFloat(val,this.def_refx,0,this.width);
          } else if (val[val.length-1] === '/') { /// '3/'
            val = val.slice(0,val.length-1);
            val = this.width - this.assertFloat(val,this.def_refx,0,this.width);
          } else {
            val = this.assertFloat(val,this.def_refx,0,this.width);
          }
          this.refx = val;
        } ///such as 12.5
        if (key === 'refy'    )  {
          ///
          /// /3 - from top
          /// 3/ - from bottom
          ///
          ///if it is "/3" then it specifies a distance from the top side of the diagram
          if (val[0] === '/') { /// '/3'
            val = val.slice(1);
            val = this.height - this.assertFloat(val,this.def_refy,0,this.height);
          } else if (val[val.length-1] === '/') { /// '3/'
            val = val.slice(0,val.length-1);
            val = this.assertFloat(val,this.def_refy,0,this.height);
          } else {
            val = this.assertFloat(val,this.def_refy,0,this.height);
          }
          this.refy = val;
        } ///such as 12.5
        if (key === 'refsx'   )  { this.refsx = this.assertFloat(val,this.def_refsx,0.1,10); } ///such as 1.5
        if (key === 'refsy'   )  { this.refsy = this.assertFloat(val,this.def_refsy,0.1,10); } ///such as 1.5
        if (key === 'slant'   )  { this.slant = this.assertFloat(val,this.def_slant,0.1,0.9); }
        if (key === 'linedashed'){ this.linedashed = this.toLineDashed(val,this.def_linedashed); } ///such as 'evenly' or 'withdots'
        if (key === 'rectw'     ){ this.rectw   = this.assertFloat(val,this.def_rectw,-100,100);    } ///such as '12.5'
        if (key === 'recth'     ){ this.recth   = this.assertFloat(val,this.def_recth,-100,100);    } ///such as '12.5'
        if (key === 'diameter'  ){ this.diameter= this.toFloat(val,this.def_diameter); } ///such as '12.5'
        if (key === 'angle1'    ){ this.angle1  = this.assertFloat(val,this.def_angle1,0,360);   } ///such as '90'
        if (key === 'angle2'    ){ this.angle2  = this.assertFloat(val,this.def_angle2,0,360);   } //suchas '180'
        if (key === 'xradius'   ){ this.xradius = this.assertFloat(val,this.def_xradius,0.1,100);   } //suchas '2'
        if (key === 'yradius'   ){ this.yradius = this.assertFloat(val,this.def_yradius,0.1,100);   } //suchas '1'
        if (key === 'position'  ){ this.position = this.toString(val,this.def_position);   } //suchas 'top'
        if (key === 'anglearcradius' ){ this.anglearcradius  = this.assertFloat(val,this.def_anglearcradius,0.1,100);   } //suchas '0.5'
        if (key === 'anglearclabelradius' ){ this.anglearclabelradius  = this.assertFloat(val,this.def_anglearclabelradius,0.1,100);   } //suchas '1.0'
        if (key === 'stroke-width'  ){ this.linewidth = this.toLength(val,this.def_linewidth); } ///such as '0', '0.1', '1pt', '1mm'
        if (key === 'fill'          ){ this.fillcolor = this.toColor(val,this.def_fillcolor); } ///such as 'red', '0.5red', or '0.8[red,green]'
        if (key === 'stroke'        ){ this.linecolor = this.toColor(val,this.def_linecolor); } ///such as 'red', '0.5red', or '0.8[red,green]'
        if (key === 'dot'           ){ this.dotcolor  = this.toColor(val,this.def_dotcolor); } ///such as 'red', '0.5red', or '0.8[red,green]'
        if (key === 'dot-size'      ){ this.dotsize   = this.toLength(val,this.def_dotsize); } ///such as '4pt' or '4mm'
        if (key === 'tick'          ){ this.tickcolor = this.toColor(val,this.def_tickcolor);  } ///such as 'red'
        if (key === 'tick-width'    ){ this.tickwidth  = this.toLength(val,this.def_tickwidth); } ///such as '1pt' or '1mm'
        if (key === 'tick-protrude' ){ this.tickprotrude = this.assertFloat(val,this.def_tickprotrude,0.1,1.0); } ///such as '0.33'
        if (key === 'font-color'    ){ this.fontcolor = this.toColor(val,this.def_fontcolor); }/// such as 'green', '0.5red', '0.8[red,green]'
        if (key === 'font-size'     ){ this.fontsize = this.toLength(val,this.def_fontsize); }/// such as '14pt'
        if (key === 'radical-length'){ this.radicallength = this.assertFloat(val,this.def_radicallength,1,100); }///such as '4'
        continue;
      }
      if ((v = this.re_exit_command.exec(line)) !== null) {
        o.push(`%${line}`);
        break;
      }
      if ((v = this.re_label_command.exec(line)) !== null) {
        o.push(`%${line}`);
        var label_alignment = this.assertAlignLabelAlignment(v[1]);
        var line = v[2];
        if ((v = this.re_label_arg.exec(line)) !== null) {
          var label = v[1].trim();
          line = v[2];
        } else {
          var label = '';
        }
        if (!label) {
          label = 'unassigned';
        }
        var coords = this.readCoordsLine(o, line);
        var all_labels = label.split('\\\\');
        var all_labels = all_labels.map(x => x.trim());
        var withcolor = '';
        if (this.fontcolor) {
          var withcolor = `withcolor ${this.fontcolor}`;
        }
        for (var i=0; i < coords.length; ++i) {
          var z0 = this.point(o, coords,i);
          var z0 = this.local(z0);
          var x = z0[0];
          var y = z0[1];
          var label = this.toString(all_labels[i],label);
          var tex_label = this.parser.unmask(label);
          if (this.fontsize) {
            tex_label = `\\fontsize{${this.fontsize}}{${this.fontsize}}\\selectfont{}${tex_label}`;
          }
          o.push(`label${label_alignment} (btex {${tex_label}} etex, (${x}*u,${y}*u)) ${withcolor};`);
        }
        continue;
      }
      if ((v = this.re_drawline_command.exec(line)) !== null) {
        o.push(`%${line}`);
        var stroke_opt = v[1].trim();
        var line = v[2];
        var coords = this.readCoordsLine(o, line);
        var str = this.coordsToString(coords);
        if (!str) {
          o.push(`%***ERROR: empty output for instruction: ${line0}`);
        } else {
          var withscaled = `xscaled(${this.refsx}) yscaled(${this.refsy})`;
          var withshifted = `shifted(${this.refx},${this.refy})`;
          o.push(`draw (${str}) ${withscaled} ${withshifted} scaled(u) ${this.draws()};`);
        }
//var p = [[0,0],[50,-50],[100,0]];
//var knots = makeknots(p,1,false);
//mp_make_choices(knots[0]);
//console.log(p);
//console.log(knots);

        continue;
      }
      if ((v = this.re_drawarea_command.exec(line)) !== null) {
        o.push(`%${line}`);
        var fill_opt = v[1].trim();
        var line = v[2];
        var coords = this.readCoordsLine(o, line);
        var str = this.coordsToString(coords,true);///needcycle=true
        if (!str) {
          o.push(`%***ERROR: empty output for instruction: ${line0}`);
        } else {
          var withscaled = `xscaled(${this.refsx}) yscaled(${this.refsy})`;
          var withshifted = `shifted(${this.refx},${this.refy})`;
          o.push(`fill (${str}) ${withscaled} ${withshifted} scaled(u) ${this.fills()};`);
          if (this.linewidth !== '0') {
            o.push(`draw (${str}) ${withscaled} ${withshifted} scaled(u) ${this.draws()};`);
          }
        }
        continue;
      }
      if ((v = this.re_drawdblarrow_command.exec(line)) !== null) {
        o.push(`%${line}`);
        var fill_opt = v[1].trim();
        var line = v[2];
        var coords = this.readCoordsLine(o, line);
        var dstr = this.coordsToString(coords,false);///needcycle=false
        if (!dstr) {
          o.push(`%***ERROR: empty output for instruction: ${line0}`);
        } else {
          var withscaled = `xscaled(${this.refsx}) yscaled(${this.refsy})`;
          var withshifted = `shifted(${this.refx},${this.refy})`;
          o.push(`drawdblarrow (${dstr}) ${withscaled} ${withshifted} scaled(u) ${this.draws()};`);
        }
        continue;
      }
      if ((v = this.re_drawarrow_command.exec(line)) !== null) {
        o.push(`%${line}`);
        var fill_opt = v[1].trim();
        var line = v[2];
        var coords = this.readCoordsLine(o, line);
        var dstr = this.coordsToString(coords,false);///needcycle=false
        if (!dstr) {
          o.push(`%***ERROR: empty output for instruction: ${line0}`);
        } else {
          var withscaled = `xscaled(${this.refsx}) yscaled(${this.refsy})`;
          var withshifted = `shifted(${this.refx},${this.refy})`;
          o.push(`drawarrow (${dstr}) ${withscaled} ${withshifted} scaled(u) ${this.draws()};`);
        }
        continue;
      }
      if ((v = this.re_circle_command.exec(line)) !== null) {
        o.push(`%${line}`);
        var circle_opt = v[1].trim();
        var line = v[2];
        var coords = this.readCoordsLine(o, line);
        for (var i=0; i < coords.length; i++) {
          z0 = this.point(o, coords,i);
          z0 = this.local(z0);
          var x = z0[0];
          var y = z0[1];
          if (circle_opt==='') {
            if (this.fillcolor) {
              //o.push(`fill fullcircle scaled(${this.diameter}*u) shifted(${x}*u,${y}*u) ${this.fills()};`);
              o.push(`fill fullcircle scaled(${this.diameter}) shifted(${x},${y}) scaled(u) ${this.fills()};`);
            }
            if (this.linewidth !== '0') {
              //o.push(`draw fullcircle scaled(${this.diameter}*u) shifted(${x}*u,${y}*u) ${this.draws()};`);
              o.push(`draw fullcircle scaled(${this.diameter}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
            }
          } else if (circle_opt==='.top' ||
                     circle_opt==='.bot' ||
                     circle_opt==='.rt'  ||
                     circle_opt==='.lft' ) {
            var rot = 0;
            if (circle_opt==='.bot') { rot=180; }
            if (circle_opt==='.rt' ) { rot=270; }
            if (circle_opt==='.lft') { rot= 90; }
            if (this.fillcolor) {
              //o.push(`fill (halfcircle--cycle) scaled(${this.diameter}*u) shifted(${x}*u,${y}*u) ${this.fills()};`);
              o.push(`fill (halfcircle--cycle) rotated(${rot}) scaled(${this.diameter}) shifted(${x},${y}) scaled(u) ${this.fills()};`);
            }
            if (this.linewidth !== '0') {
              //o.push(`draw (halfcircle--cycle) scaled(${this.diameter}*u) shifted(${x}*u,${y}*u) ${this.draws()};`);
              o.push(`draw (halfcircle--cycle) rotated(${rot}) scaled(${this.diameter}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
            }
          } else if (circle_opt==='.q1' ||
                     circle_opt==='.q2' ||
                     circle_opt==='.q3' ||
                     circle_opt==='.q4' ) {
            var rot = circle_opt.slice(2);
            var rot = parseInt(rot);
            var rot = rot - 1;
            var rot = rot*90;
            if (this.fillcolor) {
              o.push(`fill (quartercircle--(0,0)--cycle) rotated(${rot}) scaled(${this.diameter}) shifted(${x},${y}) scaled(u) ${this.fills()};`);
            }
            if (this.linewidth !== '0') {
              o.push(`draw (quartercircle--(0,0)--cycle) rotated(${rot}) scaled(${this.diameter}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
            }
          } else if (circle_opt==='.o1' ||
                     circle_opt==='.o2' ||
                     circle_opt==='.o3' ||
                     circle_opt==='.o4' ||
                     circle_opt==='.o5' ||
                     circle_opt==='.o6' ||
                     circle_opt==='.o7' ||
                     circle_opt==='.o8' ) {
            var rot = circle_opt.slice(2);
            var rot = parseInt(rot);
            var rot = rot - 1;
            var rot = rot*45;
            if (!this.has_octantcircle) {
              o.push('path my.octantcircle; my.octantcircle := (0.5,0)..(0.4619395,0.1913415)..(0.35355,0.35355);');
              this.has_octantcircle = 1;
            }
            if (this.fillcolor) {
              o.push(`fill (my.octantcircle--(0,0)--cycle) rotated(${rot}) scaled(${this.diameter}) shifted(${x},${y}) scaled(u) ${this.fills()};`);
            }
            if (this.linewidth !== '0') {
              o.push(`draw (my.octantcircle--(0,0)--cycle) rotated(${rot}) scaled(${this.diameter}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
            }
          } else if ( circle_opt==='.chord' ) {
            var x1 = 0.5*Math.cos(this.angle1/180*Math.PI);
            var y1 = 0.5*Math.sin(this.angle1/180*Math.PI);
            var x2 = 0.5*Math.cos(this.angle2/180*Math.PI);
            var y2 = 0.5*Math.sin(this.angle2/180*Math.PI);
            x1 = this.fix(x1);
            y1 = this.fix(y1);
            x2 = this.fix(x2);
            y2 = this.fix(y2);
            o.push(`draw ((${x1},${y1})--(${x2},${y2})) scaled(${this.diameter}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
          } else if ( circle_opt==='.arc' ) {
            var x1 = 0.5*Math.cos(this.angle1/180*Math.PI);
            var y1 = 0.5*Math.sin(this.angle1/180*Math.PI);
            var x2 = 0.5*Math.cos(this.angle2/180*Math.PI);
            var y2 = 0.5*Math.sin(this.angle2/180*Math.PI);
            if (this.angle2 >= this.angle1) {
              var my_angle = this.angle2 - this.angle1;
              var my_angle = this.angle1 + my_angle/2;
            } else {
              var my_angle = this.angle2 - this.angle1 + 360;
              var my_angle = this.angle1 + my_angle/2;
              if (my_angle > 360) {
                my_angle -= 360;
              }
            }
            var xm = 0.5*Math.cos(my_angle/180*Math.PI);
            var ym = 0.5*Math.sin(my_angle/180*Math.PI);
            x1 = this.fix(x1);
            y1 = this.fix(y1);
            x2 = this.fix(x2);
            y2 = this.fix(y2);
            xm = this.fix(xm);
            ym = this.fix(ym);
            o.push(`draw ((${x1},${y1})..(${xm},${ym})..(${x2},${y2})) scaled(${this.diameter}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
          } else if ( circle_opt==='.cseg' ) {
            var x1 = 0.5*Math.cos(this.angle1/180*Math.PI);
            var y1 = 0.5*Math.sin(this.angle1/180*Math.PI);
            var x2 = 0.5*Math.cos(this.angle2/180*Math.PI);
            var y2 = 0.5*Math.sin(this.angle2/180*Math.PI);
            if (this.angle2 >= this.angle1) {
              var my_angle = this.angle2 - this.angle1;
              var my_angle = this.angle1 + my_angle/2;
            } else {
              var my_angle = this.angle2 - this.angle1 + 360;
              var my_angle = this.angle1 + my_angle/2;
              if (my_angle > 360) {
                my_angle -= 360;
              }
            }
            var xm = 0.5*Math.cos(my_angle/180*Math.PI);
            var ym = 0.5*Math.sin(my_angle/180*Math.PI);
            x1 = this.fix(x1);
            y1 = this.fix(y1);
            x2 = this.fix(x2);
            y2 = this.fix(y2);
            xm = this.fix(xm);
            ym = this.fix(ym);
            if (this.fillcolor) {
              o.push(`fill ((${x1},${y1})..(${xm},${ym})..(${x2},${y2})--cycle) scaled(${this.diameter}) shifted(${x},${y}) scaled(u) ${this.fills()};`);
            }
            if (this.linewidth !== '0') {
              o.push(`draw ((${x1},${y1})..(${xm},${ym})..(${x2},${y2})--cycle) scaled(${this.diameter}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
            }
          }
        }
        continue;
      }
      if ((v = this.re_rect_command.exec(line)) !== null) {
        o.push(`%${line}`);
        var rect_opt = v[1].trim();
        var line = v[2];
        var coords = this.readCoordsLine(o, line);
        for (var i=0; i < coords.length; i++) {
          z0 = this.point(o, coords,i);
          z0 = this.local(z0);
          var x = z0[0];
          var y = z0[1];
          if (rect_opt==='') {
            if (this.fillcolor) {
              o.push(`fill unitsquare xscaled(${this.rectw}) yscaled(${this.recth}) shifted(${x},${y}) scaled(u) ${this.fills()};`);
            }
            if (this.linewidth !== '0') {
              o.push(`draw unitsquare xscaled(${this.rectw}) yscaled(${this.recth}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
            }
          } else if (rect_opt==='.parallelgram') {
            var sl  = this.fix(this.slant);
            var xs  = this.fix(1-this.slant);
            if (this.fillcolor) {
              o.push(`fill unitsquare xscaled(${xs}) slanted(${sl}) xscaled(${this.rectw}) yscaled(${this.recth}) shifted(${x},${y}) scaled(u) ${this.fills()};`);
            }
            if (this.linewidth !== '0') {
              o.push(`draw unitsquare xscaled(${xs}) slanted(${sl}) xscaled(${this.rectw}) yscaled(${this.recth}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
            }
          } else if (rect_opt==='.rhombus') {
            if (!this.has_rhombus) {
              o.push(`path my.rhombus; my.rhombus:=(0,0.5)--(0.5,1)--(1,0.5)--(0.5,0)--cycle;`);
              this.has_rhombus = 1;
            }
            if (this.fillcolor) {
              o.push(`fill my.rhombus xscaled(${this.rectw}) yscaled(${this.recth}) shifted(${x},${y}) scaled(u) ${this.fills()};`);
            }
            if (this.linewidth !== '0') {
              o.push(`draw my.rhombus xscaled(${this.rectw}) yscaled(${this.recth}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
            }
          } else if (rect_opt==='.trapezoid') {
            if (!this.has_trapezoid) {
              o.push(`path my.trapezoid; my.trapezoid:=(0,0)--(1,0)--(0.6,1)--(0.2,1)--cycle;`);
              this.has_trapezoid = 1;
            }
            if (this.fillcolor) {
              o.push(`fill my.trapezoid xscaled(${this.rectw}) yscaled(${this.recth}) shifted(${x},${y}) scaled(u) ${this.fills()};`);
            }
            if (this.linewidth !== '0') {
              o.push(`draw my.trapezoid xscaled(${this.rectw}) yscaled(${this.recth}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
            }
          }
        }
        continue;
      }
      if ((v = this.re_rrect_command.exec(line)) !== null) {
        o.push(`%${line}`);
        var my_opt = v[1].trim();
        var line = v[2];
        var coords = this.readCoordsLine(o, line);
        for (var i=0; i < coords.length; i++) {
          z0 = this.point(o, coords,i);
          z0 = this.local(z0);
          var x = z0[0];
          var y = z0[1];
          if (this.fillcolor) {
            o.push(`fill my.runitsquare xscaled(${this.rectw}) yscaled(${this.recth}) shifted(${x},${y}) scaled(u) ${this.fills()};`);
          }
          if (this.linewidth !== '0') {
            o.push(`draw my.runitsquare xscaled(${this.rectw}) yscaled(${this.recth}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
          }
        }
        continue;
      }
      if ((v = this.re_dot_command.exec(line)) !== null) {
        o.push(`%${line}`);
        var dot_opt = v[1].trim();
        var line = v[2];
        var coords = this.readCoordsLine(o, line);
        for (var i=0; i < coords.length; i++) {
          z0 = this.point(o, coords,i);
          z0 = this.local(z0);
          var x = z0[0];
          var y = z0[1];
          if (dot_opt==='') {
            var withcolor = (this.dotcolor) ? `withcolor ${this.dotcolor}` : '';
            var withpen = `withpen pencircle scaled ${this.dotsize}`;
            ///***NOTE that drawdot cannot use shifted or scaled command
            ///   because there is no path before it
            o.push(`drawdot (${x}*u,${y}*u) ${withpen} ${withcolor};`);
          }
        }
        continue;
      }
      if ((v = this.re_tick_command.exec(line)) !== null) {
        o.push(`%${line}`);
        var tick_opt = v[1].trim();
        var line = v[2];
        var coords = this.readCoordsLine(o, line);
        for (var i=0; i < coords.length; i++) {
          z0 = this.point(o, coords,i);
          z0 = this.local(z0);
          var x = z0[0];
          var y = z0[1];
          var len = this.tickprotrude;
          if (tick_opt==='.top') {
            var withcolor = (this.tickcolor) ? `withcolor ${this.tickcolor}` : '';
            var withpen = `withpen pensquare scaled ${this.tickwidth}`;
            o.push(`draw ((${x},${y}) -- (${x},${this.fix(y+len)})) scaled(u) ${withpen} ${withcolor};`);
          } else if (tick_opt==='.bot') {
            var withcolor = (this.tickcolor) ? `withcolor ${this.tickcolor}` : '';
            var withpen = `withpen pensquare scaled ${this.tickwidth}`;
            o.push(`draw ((${x},${y}) -- (${x},${this.fix(y-len)})) scaled(u) ${withpen} ${withcolor};`);
          } else if (tick_opt==='.rt') {
            var withcolor = (this.tickcolor) ? `withcolor ${this.tickcolor}` : '';
            var withpen = `withpen pensquare scaled ${this.tickwidth}`;
            o.push(`draw ((${x},${y}) -- (${this.fix(x+len)},${y})) scaled(u) ${withpen} ${withcolor};`);
          } else if (tick_opt==='.lft') {
            var withcolor = (this.tickcolor) ? `withcolor ${this.tickcolor}` : '';
            var withpen = `withpen pensquare scaled ${this.tickwidth}`;
            o.push(`draw ((${x},${y}) -- (${this.fix(x-len)},${y})) scaled(u) ${withpen} ${withcolor};`);
          }
        }
        continue;
      }
      if ((v = this.re_apple_command.exec(line)) !== null) {
        o.push(`%${line}`);
        var my_opt = v[1].trim();
        var line = v[2];
        var coords = this.readCoordsLine(o, line);
        var mypath='(.5,.7)..(.25,.85)..(0,.4)..(.5,0)..(1.0,.5)..(.8,.9)..(.5,.7)--(.5,.7)..(.6,1.0)..(.3,1.1)--(.3,1.1)..(.4,1.0)..(.5,.7)--cycle';
        for (var i=0; i < coords.length; i++) {
          z0 = this.point(o, coords,i);
          z0 = this.local(z0);
          var x = z0[0];
          var y = z0[1];
          if (my_opt==='.top') {
            o.push(`draw (${mypath}) shifted(-0.5,0) shifted(${x},${y}) scaled(u) ${this.draws()};`);
          } else if (my_opt==='.bot') {
            o.push(`draw (${mypath}) shifted(-0.5,-1) shifted(${x},${y}) scaled(u) ${this.draws()};`);
          } else if (my_opt==='.rt') {
            o.push(`draw (${mypath}) shifted(0,-0.5) shifted(${x},${y}) scaled(u) ${this.draws()};`);
          } else if (my_opt==='.lft') {
            o.push(`draw (${mypath}) shifted(-1,-0.5) shifted(${x},${y}) scaled(u) ${this.draws()};`);
          } else {
            if (this.fillcolor) {
              o.push(`fill (${mypath}) shifted(-0.5,-0.5) shifted(${x},${y}) scaled(u) ${this.fills()};`);
            }
            if (this.linewidth !== '0') {
              o.push(`draw (${mypath}) shifted(-0.5,-0.5) shifted(${x},${y}) scaled(u) ${this.draws()};`);
            }
          }
        }
        continue;
      }
      if ((v = this.re_basket_command.exec(line)) !== null) {
        o.push(`%${line}`);
        var my_opt = v[1].trim();
        var line = v[2];
        var coords = this.readCoordsLine(o, line);
        var mypath='(0.3,0)--(2.6,0)..(2.8,1)..(3,2)--(3,2)..(1.5,1.5)..(0,2)--(0,2)..(0.2,1)..cycle';
        for (var i=0; i < coords.length; i++) {
          z0 = this.point(o, coords,i);
          z0 = this.local(z0);
          var x = z0[0];
          var y = z0[1];
          if (this.fillcolor) {
            o.push(`fill (${mypath}) shifted(0,0) shifted(${x},${y}) scaled(u) ${this.fills()};`);
          }
          if (this.linewidth !== '0') {
            o.push(`draw (${mypath}) shifted(0,0) shifted(${x},${y}) scaled(u) ${this.draws()};`);
          }
        }
        continue;
      }
      if ((v = this.re_crate_command.exec(line)) !== null) {
        o.push(`%${line}`);
        var my_opt = v[1].trim();
        var line = v[2];
        var coords = this.readCoordsLine(o, line);
        var mypath='(3,2)--(0,2)--(0,0)--(3,0)--(3,2)--(0,2)--(1,3)--(4,3)--(3,2)--(3,0)--(4,1)--(4,3)--cycle';
        for (var i=0; i < coords.length; i++) {
          z0 = this.point(o, coords,i);
          z0 = this.local(z0);
          var x = z0[0];
          var y = z0[1];
          if (this.fillcolor) {
            o.push(`fill (${mypath}) shifted(0,0) shifted(${x},${y}) scaled(u) ${this.fills()};`);
          }
          if (this.linewidth !== '0') {
            o.push(`draw (${mypath}) shifted(0,0) shifted(${x},${y}) scaled(u) ${this.draws()};`);
          }
        }
        continue;
      }
      if ((v = this.re_radical_command.exec(line)) !== null) {
        o.push(`%${line}`);
        var my_opt = v[1].trim();
        var line = v[2];
        var coords = this.readCoordsLine(o, line);
        ///var mypath='(3,2)--(0,2)--(0,0)--(3,0)--(3,2)--(0,2)--(1,3)--(4,3)--(3,2)--(3,0)--(4,1)--(4,3)--cycle';
        var mypath=`(${this.radicallength},0)--(0,0)--(0,-2)--(-0.25,-1.5)--(-0.5,-1.75)`;
        for (var i=0; i < coords.length; i++) {
          z0 = this.point(o, coords,i);
          z0 = this.local(z0);
          var x = z0[0];
          var y = z0[1];
          o.push(`draw (${mypath}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
        }
        continue;
      }
      if ((v = this.re_brick_command.exec(line)) !== null) {
        o.push(`%${line}`);
        var my_opt = v[1].trim();
        var line = v[2];
        var coords = this.readCoordsLine(o, line);
        var mypath='(0,0)--(1,0)--(1,0.5)--(0,0.5)--cycle';
        for (var i=0; i < coords.length; i++) {
          z0 = this.point(o, coords,i);
          z0 = this.local(z0);
          var x = z0[0];
          var y = z0[1];
          if (this.fillcolor) {
            o.push(`fill (${mypath}) shifted(${x},${y}) scaled(u) ${this.fills()};`);
          }
          if (this.linewidth !== '0') {
            o.push(`draw (${mypath}) shifted(${x},${y}) scaled(u) ${this.draws()};`);
          }
        }
        continue;
      }
      if ((v = this.re_protractor_command.exec(line)) !== null) {
        o.push(`%${line}`);
        var my_opt = v[1].trim();
        var line = v[2];
        var coords = this.readCoordsLine(o, line);
        var mypath='(0,0)--(1,0)--(1,0.5)--(0,0.5)--cycle';
        for (var i=0; i < coords.length; i++) {
          z0 = this.point(o, coords,i);
          z0 = this.local(z0);
          var x = z0[0];
          var y = z0[1];
          o.push(`draw ((-3.5, 0)--(3.5, 0)..(0, 3.5)..cycle) shifted(${x},${y}) scaled(u) ${this.strokes()};`);
          o.push(`draw ((-2.5100, 0.8500)--(2.5100, 0.8500)..(0, 2.65)..cycle) shifted(${x},${y}) scaled(u) ${this.strokes()};`);
          o.push(`draw ((3.4468,  0.6078)-- (3.0529,  0.5383)) shifted(${x},${y}) scaled(u) ${this.strokes()};`);
          o.push(`draw ((3.2889,  1.1971)-- (2.9130,  1.0603)) shifted(${x},${y}) scaled(u) ${this.strokes()};`);
          o.push(`draw ((3.0311,  1.7500)-- (2.6847,  1.5500)) shifted(${x},${y}) scaled(u) ${this.strokes()};`);
          o.push(`draw ((2.6812,  2.2498)-- (2.3747,  1.9926)) shifted(${x},${y}) scaled(u) ${this.strokes()};`);
          o.push(`draw ((2.2498,  2.6812)-- (1.9926,  2.3747)) shifted(${x},${y}) scaled(u) ${this.strokes()};`);
          o.push(`draw ((1.7500,  3.0311)-- (1.5500,  2.6847)) shifted(${x},${y}) scaled(u) ${this.strokes()};`);
          o.push(`draw ((1.1971,  3.2889)-- (1.0603,  2.9130)) shifted(${x},${y}) scaled(u) ${this.strokes()};`);
          o.push(`draw ((0.6078,  3.4468)-- (0.5383,  3.0529)) shifted(${x},${y}) scaled(u) ${this.strokes()};`);
          o.push(`draw ((0.0000,  3.5000)-- (0.0000,  3.1000)) shifted(${x},${y}) scaled(u) ${this.strokes()};`);
          o.push(`draw ((-3.4468, 0.6078)-- (-3.0529, 0.5383)) shifted(${x},${y}) scaled(u) ${this.strokes()};`);
          o.push(`draw ((-3.2889, 1.1971)-- (-2.9130, 1.0603)) shifted(${x},${y}) scaled(u) ${this.strokes()};`);
          o.push(`draw ((-3.0311, 1.7500)-- (-2.6847, 1.5500)) shifted(${x},${y}) scaled(u) ${this.strokes()};`);
          o.push(`draw ((-2.6812, 2.2498)-- (-2.3747, 1.9926)) shifted(${x},${y}) scaled(u) ${this.strokes()};`);
          o.push(`draw ((-2.2498, 2.6812)-- (-1.9926, 2.3747)) shifted(${x},${y}) scaled(u) ${this.strokes()};`);
          o.push(`draw ((-1.7500, 3.0311)-- (-1.5500, 2.6847)) shifted(${x},${y}) scaled(u) ${this.strokes()};`);
          o.push(`draw ((-1.1971, 3.2889)-- (-1.0603, 2.9130)) shifted(${x},${y}) scaled(u) ${this.strokes()};`);
          o.push(`draw ((-0.6078, 3.4468)-- (-0.5383, 3.0529)) shifted(${x},${y}) scaled(u) ${this.strokes()};`);
          o.push(`draw ((0.0000,  0.0000)-- (0.0000,  0.8500)) shifted(${x},${y}) scaled(u) ${this.strokes()};`);
          o.push(`drawdot (0.0000, 0.0000) shifted(${x},${y}) scaled(u) withpen pencircle scaled 4pt ${this.dots()};`);

        }
        continue;
      }
      if ((v = this.re_drawellipsearc_command.exec(line)) !== null) {
        ///drawellipsearc (x1,y1) (x2,y2)
        o.push(`%${line}`);
        var my_opt = v[1].trim();
        var line = v[2];
        var coords = this.readCoordsLine(o, line);
        var z0 = this.point(o, coords,0);
        var z1 = this.point(o, coords,1);
        z0 = this.local(z0);
        z1 = this.local(z1);
        var X1 = z0[0];
        var Y1 = z0[1];
        var X2 = z1[0];
        var Y2 = z1[1];
        var Rx = this.xradius;
        var Ry = this.yradius;
        var position = this.position;
        var [Cx,Cy] = arcpath(X1,Y1,X2,Y2,Rx,Ry,(position=='top'?1:0));
console.log('james: Cx=',Cx);
console.log('james: Cy=',Cy);
        if (Number.isFinite(Cx) && Number.isFinite(Cy)) {
          if (position=='top') {
            var lambda2 = Math.atan2(Y1-Cy,X1-Cx);
            var lambda1 = Math.atan2(Y2-Cy,X2-Cx);
            var tao1 = Math.atan2(Math.sin(lambda1)/Ry,Math.cos(lambda1)/Rx);
            var tao2 = Math.atan2(Math.sin(lambda2)/Ry,Math.cos(lambda2)/Rx);
            var ang1 = tao1/Math.PI*180;
            var ang2 = tao2/Math.PI*180;
            o.push(`draw subpath (${ang1/45},${ang2/45}) of fullcircle xscaled(${2*Rx}) yscaled(${2*Ry}) scaled(u) shifted(${Cx}*u,${Cy}*u);`);
          } else {
            var lambda1 = Math.atan2(Y1 - Cy, X1 - Cx);
            var lambda2 = Math.atan2(Y2 - Cy, X2 - Cx);
            var tao1 = Math.atan2(Math.sin(lambda1) / Ry, Math.cos(lambda1) / Rx);
            var tao2 = Math.atan2(Math.sin(lambda2) / Ry, Math.cos(lambda2) / Rx);
            var ang1 = tao1 / Math.PI * 180;
            var ang2 = tao2 / Math.PI * 180;
            o.push(`draw subpath (${ang1/45},${ang2/45}) of fullcircle xscaled(${2*Rx}) yscaled(${2*Ry}) scaled(u) shifted(${Cx}*u,${Cy}*u);`);
          }
        }
        continue;
      }
      if ((v = this.re_drawanglearc_command.exec(line)) !== null) {
        o.push(`%${line}`);
        var anglearc_opt = v[1].trim();
        var line = v[2];
        ///: drawanglearc {1} (0,0) (1,0) (0,1)
        if ((v = this.re_label_arg.exec(line)) !== null) {
          var label = v[1].trim();
          line = v[2];
        } else {
          var label = '';
        }
        var coords = this.readCoordsLine(o, line);
        if (anglearc_opt==='') {
          var z0 = this.point(o, coords,0);
          var z1 = this.point(o, coords,1);
          var z2 = this.point(o, coords,2);
          z0 = this.local(z0);
          z1 = this.local(z1);
          z2 = this.local(z2);
          var x = z0[0];
          var y = z0[1];
          var dx1 = z1[0]-z0[0];
          var dy1 = z1[1]-z0[1];
          var dx2 = z2[0]-z0[0];
          var dy2 = z2[1]-z0[1];
          var ang1 = Math.atan2(dy1,dx1) / Math.PI * 180;
          var ang2 = Math.atan2(dy2,dx2) / Math.PI * 180;
          if (ang1 < 0) { ang1 += 360; }
          if (ang2 < 0) { ang2 += 360; }
          if (ang2 < ang1) { ang2 += 360; }
          var r = 0.5;
          ///***NEW: when the ang2-ang1 is too small the arc is barely visible!!!
          ///thus we gradually increase r to a maximum of 2 when angle delta is 45 degree or less
          var angledelta = ang2-ang1;
          const max_angle = 60.0;
          if (angledelta < max_angle) {
            var dd = (max_angle-angledelta)/max_angle; // range from 0-1
            var increase_length = this.fix(dd*dd*2.0);///use a polobra curve
            r = r + increase_length;
          }
          var r = this.anglearcradius;
          var diameter = r+r;
          o.push(`draw subpath (${ang1/45},${ang2/45}) of fullcircle scaled(u) scaled(${diameter}) shifted(${x}*u,${y}*u);`);
          if (label) {
            var r = this.anglearclabelradius;
            var tex_label = this.parser.unmask(label);
            if (this.fontsize) {
              tex_label = `\\fontsize{${this.fontsize}}{${this.fontsize}}\\selectfont{}${tex_label}`;
            }
            if (this.fontcolor) {
              var withcolor = `withcolor ${this.fontcolor}`;
            } else {
              var withcolor = '';
            }
            var ang = ang1 + angledelta/2;
            if (ang > 360) {
              ang -= 360;
            }
            var myx = r * Math.cos(ang/180*Math.PI);
            var myy = r * Math.sin(ang/180*Math.PI);
            o.push(`label (btex {${tex_label}} etex, (${myx}*u,${myy}*u)) shifted(${x}*u,${y}*u) ${withcolor};`);
          }
        } else if (anglearc_opt === '.sq') {
          var z0 = this.point(o, coords,0);
          var z1 = this.point(o, coords,1);
          var z2 = this.point(o, coords,2);
          z0 = this.local(z0);
          z1 = this.local(z1);
          z2 = this.local(z2);
          var x = z0[0];
          var y = z0[1];
          var dx1 = z1[0]-z0[0];
          var dy1 = z1[1]-z0[1];
          var dx2 = z2[0]-z0[0];
          var dy2 = z2[1]-z0[1];
          var ang1 = Math.atan2(dy1,dx1) / Math.PI * 180;
          var ang2 = Math.atan2(dy2,dx2) / Math.PI * 180;
          if (ang1 < 0) { ang1 += 360; }
          if (ang2 < 0) { ang2 += 360; }
          if (ang2 < ang1) { ang2 += 360; }
          var r = this.anglearcradius;
          var angledelta = ang2-ang1;
          o.push(`draw subpath (0,4) of unitsquare rotated(${ang1}) scaled(u) scaled(${r}) shifted(${x}*u,${y}*u);`);
          if (label) {
            var r = this.anglearclabelradius;
            var tex_label = this.parser.unmask(label);
            if (this.fontsize) {
              tex_label = `\\fontsize{${this.fontsize}}{${this.fontsize}}\\selectfont{}${tex_label}`;
            }
            if (this.fontcolor) {
              var withcolor = `withcolor ${this.fontcolor}`;
            } else {
              var withcolor = '';
            }
            var ang = ang1 + angledelta/2;
            if (ang > 360) {
              ang -= 360;
            }
            var myx = r * Math.cos(ang/180*Math.PI);
            var myy = r * Math.sin(ang/180*Math.PI);
            o.push(`label (btex {${tex_label}} etex, (${myx}*u,${myy}*u)) shifted(${x}*u,${y}*u) ${withcolor};`);
          }
        }
        continue;
      }
      if ((v = this.re_showvar_command.exec(line)) !== null) {
        o.push(`%${line}`);
        var symbol = v[1];
        var line = v[2];
        var coords = this.fetchVariable(o, symbol);
        var str = this.coordsToString(coords);
        o.push(`label.urt (btex ${str} etex, (0,0));`);
        continue;
      }
      o.push(`%${line0}`);
      o.push(`%***ERROR: instruction not recognized: ${line0}`);
    }
    o.push(`);`);
    o.push(`draw my.wheel scaled(my.ratio);`);

    ///now we need to add customized path suchas 'octantcircle'
    o.unshift('path my.octantcircle; my.octantcircle := (0.5,0)..(0.4619395,0.1913415)..(0.35355,0.35355);');
    o.unshift('path my.runitsquare; my.runitsquare := (0,0.2){down}..(0.058,0.058)..{right}(0.2,0)--(0.8,0){right}..(0.958,0.058)..{up}(1,0.2)--(1,0.8){up}..(0.958,0.958)..{left}(0.8,1)--(0.2,1){left}..(0.058,0.958)..{down}(0,0.8)--cycle ;');

    ///now if the grid has be configured to show five's and ten's, then we need to draw them separately
    if (this.config.grid) {
      var ym = this.height;
      var xm = this.width;
      var a8=`for i=0 step 5 until ${xm}: draw (i*u,0) --- (i*u,${ym}*u) withcolor .8white; endfor;`;
      var a9=`for i=0 step 5 until ${ym}: draw (0,i*u) --- (${xm}*u,i*u) withcolor .8white; endfor;`;
      var a10=`for i=0 step 10 until ${xm}: draw (i*u,0) --- (i*u,${ym}*u) withcolor .7white; endfor;`;
      var a11=`for i=0 step 10 until ${ym}: draw (0,i*u) --- (${xm}*u,i*u) withcolor .7white; endfor;`;
      o.unshift(a8,a9,a10,a11);
    }

    ///now we need to add new items at the beginning
    /// these items needs to be constracted after all
    /// previous p's have been processed because it needs
    /// to be dependant on some of the command line options
    /// settings such as width and height.
    var ym = this.height;
    var xm = this.width;
    var a1=`my.pu := \\mpdim{\\linewidth}/${xm};`;
    var a2=`u := ${this.unit};`;
    var a3=`my.ratio := my.pu/u;`;
    var a4=`picture my.wheel;`;
    var a5=`my.wheel := image(`;
    var a6=`for i=0 upto ${ym}: draw (0,i*u) --- (${xm}*u,i*u) withcolor .9white; endfor;`;
    var a7=`for i=0 upto ${xm}: draw (i*u,0) --- (i*u,${ym}*u) withcolor .9white; endfor;`;
    o.unshift(a1,a2,a3,a4,a5,a6,a7);

    return o.join('\n');
  }

  assertInt (val,def_v,min,max) {
    if (!val) {
      return def_v;
    }
    val = parseInt(val);
    if( val < min) {
      val = min;
    } else if (val > max) {
      val = max;
    }
    return val;
  }

  assertFloat (val,def_v,min,max) {
    if (!val) {
      return def_v;
    }
    val = parseFloat(val);
    if (Number.isFinite(val)) {
    } else {
      val = 0;
    }
    if( val < min) {
      val = min;
    } else if (val > max) {
      val = max;
    }
    return val;
  }

  toLineDashed (v,def_v) {
    if (!v) {
      return def_v;
    }
    if (typeof v == 'string') {
      v = v.trim();
      if (!v) {
        return def_v;
      }
      if (v === 'withdots') {
        return v;
      }
      if (v === 'evenly') {
        return v;
      }
    }
    return def_v;
  }

  toAreaOp (v,def_v) {
    if (!v) {
      return def_v;
    }
    if (typeof v == 'string') {
      v = v.trim();
      if (!v) {
        return def_v;
      }
      if (v === 'filldraw') {
        return 0x11;
      }
      if (v === 'fill') {
        return 0x10;
      }
      if (v === 'draw') {
        return 0x10;
      }
    }
    return def_v;
  }

  toFloat (v,def_v) {
    if (!v) {
      return def_v;
    }
    if (typeof v == 'string') {
      v = v.trim();
      if (!v) {
        return def_v;
      }
    }
    return parseFloat(v);
  }

  toString (v,def_v) {
    if (!v) {
      return def_v;
    }
    if (typeof v == 'string') {
      v = v.trim();
      if (!v) {
        return def_v;
      }
      return v;
    }
    return ''+v;
  }

  fetchVariable (o, a) {

    ///***NOTE: this function should return a path, not a point!

    /// if it is null then we return an empty path
    if (!a) {
      o.push(`%***ERROR: empty variable name, assuming (0,0)`);
      return [[0,0]];
    }
    if (this.variables.hasOwnProperty(a)) {
      return this.variables[a];
    }
    if (a==='*') {
      return this.lastcoords;
    }
    o.push(`%***ERROR: undefined variable '${a}', assuming (0,0)`);
    return [[0,0]];
  }

  /// this is called inside readCoordsLine()
  execFunction (o, line,fun_str,arg_str) {

    var ret_val = [];
    var args = arg_str.split(',');
    args = args.map(x => x.trim());
    switch (fun_str) {

      case 'midpoint':

        if (args.length == 2) {
          var coords = this.fetchVariable(o, args[0]);
          var fraction = parseFloat(args[1]);
          if (coords && Number.isFinite(fraction)) {
            var z0 = this.point(o, coords,0);
            var z1 = this.point(o, coords,1);
            var z0x = parseFloat(z0[0]);
            var z0y = parseFloat(z0[1]);
            var z1x = parseFloat(z1[0]);
            var z1y = parseFloat(z1[1]);
            var ptx = z0x + (z1x - z0x)*fraction;
            var pty = z0y + (z1y - z0y)*fraction;
            ret_val.push([ptx,pty]);///always returns a single point
          }

        } else if (args.length == 1) {

          var coords = this.fetchVariable(o, args[0]);
          var z0 = this.point(o, coords,0);
          var z1 = this.point(o, coords,1);
          var z0x = parseFloat(z0[0]);
          var z0y = parseFloat(z0[1]);
          var z1x = parseFloat(z1[0]);
          var z1y = parseFloat(z1[1]);
          var midx = (z0x + z1x)*0.5;
          var midy = (z0y + z1y)*0.5;
          ret_val.push([midx,midy]);
        }
        break;

      case 'scatterpoints':

        if (args.length == 5) {
          var sx = parseFloat(args[0]);
          var sy = parseFloat(args[1]);
          var tx = parseFloat(args[2]);
          var ty = parseFloat(args[3]);
          var n = parseFloat(args[4]);
          if (Number.isFinite(sx) &&
              Number.isFinite(sy) &&
              Number.isFinite(tx) &&
              Number.isFinite(ty) &&
              Number.isFinite(n) ) {

            if (n > N_Max_Array) {
              n = N_Max_Array;
            }
            var pt = [sx,sy,0,'',''];
            var dx = tx - sx;
            var dy = ty - sy;
            ret_val.push(pt);
            for (let i=1; i < n; i++) {
              var frac = i/(n-1);
              var px = sx+frac*dx;
              var py = sy+frac*dy;
              ret_val.push([px,py,0,'','']);
            }
          }
        }
        break;

      case 'shiftpoints':

        /// shiftpoints(a,0,-2)
        /// shiftpoints(a,2,-1)

        if (args.length == 3) {
          var coords = this.fetchVariable(o, args[0]);
          var dx = parseFloat(args[1]);
          var dy = parseFloat(args[2]);
          if (coords &&
              Number.isFinite(dx) &&
              Number.isFinite(dy) ) {

            for (let i=0; i < coords.length; i++) {
              var pt = this.point(o, coords,i);
              var x = pt[0] + dx;
              var y = pt[1] + dy;
              ret_val.push([x,y,pt[2],pt[3],pt[4]]);
            }
          }
        }
        break;

      case 'somepoints':

        /// somepoints(a,0,2) - all points between 0 and 2, including 0 and 2
        /// somepoints(a,3,5) - all points between 3 and 5, including 3 and 5
        /// somepoints(a,3)   - a single point in 3

        if (args.length == 3) {
          var coords = this.fetchVariable(o, args[0]);
          var j   = parseFloat(args[1]);
          var k   = parseFloat(args[2]);
        } else if (args.length == 2) {
          var coords = this.fetchVariable(o, args[0]);
          var j   = parseFloat(args[1]);
          var k   = parseFloat(args[1]);
        } else {
          break;
        }

        if (coords &&
            Number.isFinite(j) &&
            Number.isFinite(k) ) {

          var i;
          if (k >= j) {
            for (i=j; i <= k && i >= 0 && i < coords.length; ++i) {
              var pt = this.point(o, coords,i);
              ret_val.push(pt);
            }
          } else {
            for (i=j; i >= k && i >= 0 && i < coords.length; --i) {
              var pt = this.point(o, coords,i);
              ret_val.push(pt);
            }
          }
        }
        break;

      case 'allpoints':

        /// allpoints(a,b,c) - all points from a,b,and c,

        for (var i in args) {
          var coords = this.fetchVariable(o, args[i]);
          if (coords) {
            for (var j in coords) {
              var pt = this.point(o, coords,j);
              ret_val.push(pt);
            }
          }
        }
        break;

      case 'lineintersect': {

        /// lineintersect(a,b) - 'a' for the first line and 'b' for the second line

        if (args.length == 2) {
          var coords0 = this.fetchVariable(o, args[0]);
          var coords1 = this.fetchVariable(o, args[1]);

          let p0 = this.point(o, coords0,0);
          let p1 = this.point(o, coords0,1);
          let q0 = this.point(o, coords1,0);
          let q1 = this.point(o, coords1,1);
          let [x,y] = this.computeLineIntersection(p0,p1,q0,q1);
///console.log('p0=',p0);
///console.log('p1=',p1);
///console.log('q0=',q0);
///console.log('q1=',q1);
///console.log('x=',x);
///console.log('y=',y);
          return [[x,y]];
        }

        break;
      }

      case 'linecircleintersect': {

        /// circlelineintersect(a,c,diameter)
        ///
        ///  a - symbol: the line (two points)
        ///  c - symbol: circle center (one point)
        ///  diameter - number: circle diameter

        if (args.length == 3) {
          let [a,c,diameter] = args;
          var coords0 = this.fetchVariable(o, a);
          let p0 = this.point(o, coords0,0);
          let p1 = this.point(o, coords0,1);
          let [A,B,C] = this.computeStandardLineForm(p0,p1);
          var coords0 = this.fetchVariable(o, c);
          let [x0,y0] = this.point(o, coords0,0);
          // translate C to new coords
          C = C - A*x0 - B*y0;
          let rsq = diameter*diameter/4;
          let [x1,y1,x2,y2] = this.computeCircleLineIntersection(rsq,A,B,C);
          x1 += x0;
          x2 += x0;
          y1 += y0;
          y2 += y0;
          return [[x1,y1],[x2,y2]];///return a path of two points;
                                   ///note one or both might be Infinity of NaN
        }
        break;
      }

      default:
        break;

    }
    if (ret_val.length == 0) {
      return [[0,0]];///a coordinate with a single point
    }
    return ret_val;
  }

  argsToCoords (args) {

    var pp = args.split(',');
    if (pp.length == 1) {
      var pp0 = pp[0];
      if (pp0[0] == '$') {
        pp0 = pp0.slice(1);
        if (this.variables.hasOwnProperty(pp0)) {
          return this.variables[pp0];
        }
      }
    }
    return [];
  }

  isValidAlign (str) {

    if (str.localeCompare('lft') == 0 ||
        str.localeCompare('rt') == 0 ||
        str.localeCompare('top') == 0 ||
        str.localeCompare('bot') == 0 ||
        str.localeCompare('ulft') == 0 ||
        str.localeCompare('urt') == 0 ||
        str.localeCompare('llft') == 0 ||
        str.localeCompare('lrt') == 0 ) {
      return true;
    }
    return false;
  }

  assertAlign (v) {

    if (typeof v == 'string') {
      if (v.localeCompare('lft') == 0 ||
          v.localeCompare('rt') == 0 ||
          v.localeCompare('top') == 0 ||
          v.localeCompare('bot') == 0 ||
          v.localeCompare('ulft') == 0 ||
          v.localeCompare('urt') == 0 ||
          v.localeCompare('llft') == 0 ||
          v.localeCompare('lrt') == 0 ) {
        return v;
      }
    }
    return '';
  }

  assertAlignLabelAlignment (v) {

    if (typeof v == 'string') {
      if (v.localeCompare('.lft') == 0 ||
          v.localeCompare('.rt') == 0 ||
          v.localeCompare('.top') == 0 ||
          v.localeCompare('.bot') == 0 ||
          v.localeCompare('.ulft') == 0 ||
          v.localeCompare('.urt') == 0 ||
          v.localeCompare('.llft') == 0 ||
          v.localeCompare('.lrt') == 0 ) {
        return v;
      }
    }
    return '';
  }

  fix (v) {
    if (typeof v == 'number') {
    } else {
      v = parseFloat(v);
    }
    return parseFloat(v.toFixed(6));
  }

  fills () {
    var s = [];
    if (this.fillcolor) {
      s.push(`withcolor ${this.fillcolor}`);
    }
    return s.join(' ');
  }

  draws() {
    var s = [];
    if (this.linedashed) {
      s.push(`dashed ${this.linedashed}`);
    }
    if (this.linewidth) {
      s.push(`withpen pencircle scaled ${this.linewidth}`);
    }
    if (this.linecolor) {
      s.push(`withcolor ${this.linecolor}`);
    }
    return s.join(' ');
  }

  strokes() {
    var s = [];
    if (this.linecolor) {
      s.push(`withcolor ${this.linecolor}`);
    }
    return s.join(' ');
  }

  dots() {
    var s = [];
    if (this.dotcolor) {
      s.push(`withcolor ${this.dotcolor}`);
    }
    return s.join(' ');
  }

  coordsToString(coords,needcycle=false) {
    ///***NOTE: returns [str,bad_vars]
    ///***NOTE: i.e: (1,2)..(2,3)--{up}cycle
    /// pt[0]: [1,2,'','','']
    /// pt[1]: [2,3,'..','','']
    /// pt[2]: ['cycle','','--','{up}','']
    var o = [];
    var iscycle=0;
    for (var i in coords) {
      var pt = coords[i];
      var x =    pt[0];/// cannot do fix here because x could be a string
      var y =    pt[1];/// cannot do fix here because x could be a string
      var join = pt[2];
      var pre =  pt[3];
      var post = pt[4];
      ///doing some fixes
      join = join||'';
      pre = pre||'';
      post = post||'';
      if (i==0) {
        join = '';
      } else {
        if (!join) {
          join = '--';
        }
      }
      ///output
      var iscycle=0;
      if (typeof x == 'number') {
        o.push(`${join}${pre}(${this.fix(x)},${this.fix(y)})${post}`);
      } else if (typeof x == 'string') {
        if (x==='cycle') {
          iscycle=1;
        }
        o.push(`${join}${pre}${x}${post}`);
      }
    }
    if (needcycle && !iscycle) {
      o.push('--cycle');
    }
    return o.join('');
  }

  point(o, coords, i, nlevel=0) {
    /// * NOTE: This method is to return a point not yet scaled by
    ///   refx/refy/refsx/refsy
    ///
    /// * NOTE: this method will always return a point and not a path;
    ///   in case of there is an error, i.e.,
    ///   a symbol does no exist, or array index is out of bound,
    ///   a point of [0,0] is then returned;
    ///
    /// * NOTE: if a particular point is a symbol, this method will return
    ///   a real number; it will fetch the value of this symbol and return
    ///   the first point in the path pointed to by this symbol;
    ///   if the first one again is a symbol then another trip will be made;
    ///   the maximum nested level searched is 10;
    ///
    /// * NOTE: the return value is a new array;
    ///
    /// * NOTE: if a 'cycle' is encountered that is the first element,
    ///   a [0,0] is returned; if a 'cycle' is encountered that is not
    ///   the first symbol, then it fetches the value that is of the
    ///   first element;
    ///
    var x = 0;
    var y = 0;
    if (coords && i < coords.length) {
      var pt = coords[i];
      x = pt[0];///x could be a symbol, including a 'cycle'
      y = pt[1];
    }
    if (typeof x == 'number' && typeof y == 'number') {
      return [x,y];
    }
    /// cycle
    if (typeof x == 'string' && x == 'cycle') {
      if (i==0) {
        ///this is an error, so we return [0,0]
        o.push(`***ERROR: 'cycle' is the first element, assuming (0,0)`);
        return [0,0];
      } else {
        var pt = coords[0];
        x = pt[0];
        y = pt[1];
        if (typeof x == 'number' && typeof y == 'number') {
          return [x,y];
        }
      }
    }
    /// symbol
    if (typeof x == 'string') {
      var var_coords = this.fetchVariable(o, x);
      if (nlevel < 10) {
        return this.point(o, var_coords,0,nlevel+1); /// *first* point of variable
      } else {
        return [0,0];
      }
    }
    return [0,0];
  }

  local(pt) {
    /// * NOTE: this method translate and/or scale the local reference point to
    ///   global coords.
    ///
    var x = pt[0];
    var y = pt[1];
    x *= this.refsx;
    y *= this.refsy;
    x += this.refx;
    y += this.refy;
    x = this.fix(x);
    y = this.fix(y);
    return [x,y];
  }

  readCoordsLine (o, line, changeall=true) {

    /// $midpoint(a)
    /// $somepoint(a,0.2)
    /// a
    /// b
    /// last
    /// (1,2) (3,4) (5,6) ...
    /// (1,2) (3) (4) ...
    /// (1,2) 3 (4,5) ...
    /// (1,2) 3 (4,5) ...
    /// (1,2) 3 [up:3] [down:4] [lft:3] [rt:5] [ulft:3] [urt:3] [llft:3] [lrt:5] (9,10) ...
    /// <3,1> (1,2)
    /// (1,2) 3 [angledist:10,4] (9,10) ()
    /// * (1,2) (3,4)
    /// *a (1,2) (3,4)
    /// *a{up}..(1,2) (3,4)
    /// <0,1> *a{up}..(1,2) (3,4)

    /// The <3,4> is for setting an offset, for which all future
    /// coord points will be based on. Thus for the following we are adding
    /// points that are: (3,4) and (4,5)
    ///   <3,3> (0,1) (1,2)

    /// Note that the entire line is going to be
    /// either a function, a variable, or a
    /// list of coordinates.

    /// ***IMPORTANT***:
    /// If a function is detected, then the entire
    /// line is assumed to be of only that function;
    /// if a variable is detected, then the entire line
    /// if of that variable; if a list of numbers (with parenthesized
    /// pairs, then the entire line will be scanned for all literal
    /// points until something non-number is detected and then the scan
    /// stops.

    /// not that for the literal number input, each individual
    /// coordinate is considered to be either in pairs, in which case
    /// the parentheses must be detected. Of within the parenthesis
    /// only a single number is detected and there is no comma, then
    /// only the x/coordinate will be initialized to this number,
    /// and the y/coordinate will be reset to zero. If a number without
    /// parenthesis is detected then only the x-coordinate will be set
    /// that number, and the its y/coordinate is left to zero.

    /// (1,2) (3,4) (5,6) ...
    /// (1,2) (3) (4) ...
    /// (1,2) a (4,5) ...
    /// (1,2) a (4,5) ()
    /// (1,2) -- a .. (4,5) -- (4,4) -- ()

    var coords = [];
    var offsetx = 0;
    var offsety = 0;
    var lastpt = [0,0];
    var dx = 0;
    var dy = 0;
    var x = 0;
    var y = 0;
    var v;
    var lastjoin = '';
    var n = 0;
    while (line.length) {

      if ((v = this.re_asterisk_index_withopt.exec(line)) !== null) {
        var pre  = v[1].trim();
        var d    = v[2].trim();
        var i    = v[3].trim();
        var post = v[4].trim();
        line     = v[5];

        var symbol = d;
        var from = this.fetchVariable(o, symbol);
        [x,y] = this.point(o, from,i);
        x += offsetx;
        y += offsety;
        coords.push([x,y,lastjoin,pre,post]);
        lastpt[0] = x;
        lastpt[1] = y;
        continue;

      } else if ((v = this.re_asterisk_withopt.exec(line)) !== null) {
        var pre  = v[1].trim();
        var d    = v[2].trim();
        var post = v[3].trim();
        line = v[4];
        if (d.length == 1) {
          var from = this.lastcoords;
        } else {
          var symbol = d.slice(1); /// such as *p
          var from = this.fetchVariable(o, symbol);
        }
        for (var i=0; i < from.length; ++i) {
          ///***NOTE: must call point() so that it converts any variable
          ///   to real coords.;
          [x,y] = this.point(o, from,i);
          x += offsetx;
          y += offsety;
          coords.push([x,y,lastjoin,pre,post]);
          lastpt[0] = x;
          lastpt[1] = y;
        }
        continue;
      }

      if ((v = this.re_pathfunc.exec(line)) !== null) {
        var raw = v[0];
        var d = v[1];
        var args = v[2];
        line = v[3];
        var ret_val = this.execFunction(o, raw,d,args);
        for (var i=0; i < ret_val.length; ++i) {
          [x,y] = this.point(o, ret_val,i);
          x += offsetx;
          y += offsety;
          coords.push([x,y,lastjoin,pre,post]);
          lastpt[0] = x;
          lastpt[1] = y;
        }
        continue;
      }

      if ((v = this.re_dashdot.exec(line)) !== null) {
        var d = v[1].trim();
        line = v[2];
        lastjoin = d;
        continue;
      }

      if ((v = this.re_symbol_withopt.exec(line)) !== null) {
        var pre = v[1].trim();
        var d = v[2].trim();
        var post = v[3].trim();
        line = v[4];
        if (!this.variables.hasOwnProperty(d)) {
          ///o.push(`%***ERROR: undefined variable: ${d}, inserted below:`);
          ///o.push(`path ${d}; ${d}:=(0,0);`);
          ///this.variables[d]=[[0,0]];
        }
        coords.push([d,'',lastjoin,pre,post]);
        continue;
      }

      if ((v = this.re_coord_withopt.exec(line)) !== null) {
        n++;
        var pre = v[1].trim();
        var d = v[2].trim();
        var post = v[3].trim();
        line = v[4];
        d = d.split(',');
        d = d.map( x => x.trim() );
        if (d.length<2) {
          coords.push(['cycle','',lastjoin,pre,post]);
          break;
        }
        var d0 = d[0];
        var d1 = d[1];
        if (!d0) {
          x = lastpt[0];
        } else {
          x = parseFloat(d0);
        }
        if (!d1) {
          y = lastpt[1];
        } else {
          y = parseFloat(d1);
        }
        if (Number.isFinite(x) && Number.isFinite(y)) {
          ///add in the offset; ***NOTE that offset should only
          ///be added for real coords, and not the relatives.
          x += offsetx;
          y += offsety;
          coords.push([x,y,lastjoin,pre,post]);
          lastpt[0] = x;
          lastpt[1] = y;
        }
        continue;
      }

      if ((v = this.re_offset.exec(line)) !== null) {
        n++;
        /// <1,2>, or <1,>, or <,2>
        var d = v[1].trim();
        line = v[2];
        if (!d) {
          continue; ///d is an empty string
        }
        d = d.split(',');
        d = d.map( x => x.trim() );
        if (d.length==2) {
          dx = parseFloat(d[0]);
          dy = parseFloat(d[1]);
          if (Number.isFinite(dx)) { offsetx += dx; }
          if (Number.isFinite(dy)) { offsety += dy; }
        }
        continue;
      }

      if ((v = this.re_relative.exec(line)) !== null) {
        n++;
        /// [angledist:10,4]
        /// [turn:270,5]
        /// [flip:5,5] /// flip the point to the other side of the line of the last two points
        var d = v[1].trim();
        line = v[2];
        d = d.split(':');
        d = d.map( x => x.trim() );
        if (d.length==2) {
          var key = d[0];
          var val = d[1];
          if (key === 'angledist') {
            var val = val.split(',');
            var val = val.map( x => x.trim() );
            if (val.length == 2) {
              var angle = parseFloat(val[0]);
              var dist  = parseFloat(val[1]);
              dx = dist * Math.cos(angle/180*Math.PI);
              dy = dist * Math.sin(angle/180*Math.PI);
              if (!Number.isFinite(dx)) { dx = 0; }
              if (!Number.isFinite(dy)) { dy = 0; }
              x = lastpt[0] + dx;
              y = lastpt[1] + dy;
            }
          }
          else if (key === 'turnlft') {
            var val = val.split(',');
            var val = val.map( x => x.trim() );
            if (val.length == 2) {
              var angle = parseFloat(val[0]);
              var lastangle = this.computeLastAngleDegree(coords);
              angle += lastangle;
              var dist  = parseFloat(val[1]);
              dx = dist * Math.cos(angle/180*Math.PI);
              dy = dist * Math.sin(angle/180*Math.PI);
              if (!Number.isFinite(dx)) { dx = 0; }
              if (!Number.isFinite(dy)) { dy = 0; }
              x = lastpt[0] + dx;
              y = lastpt[1] + dy;
            }
          }
          else if (key === 'turnrt') {
            var val = val.split(',');
            var val = val.map( x => x.trim() );
            if (val.length == 2) {
              var angle = parseFloat(val[0]);
              var lastangle = this.computeLastAngleDegree(coords);
              angle -= lastangle;
              var dist  = parseFloat(val[1]);
              dx = dist * Math.cos(angle/180*Math.PI);
              dy = dist * Math.sin(angle/180*Math.PI);
              if (!Number.isFinite(dx)) { dx = 0; }
              if (!Number.isFinite(dy)) { dy = 0; }
              x = lastpt[0] + dx;
              y = lastpt[1] + dy;
            }
          }
          else if (key==='flip') {
            var val = val.split(',');
            var val = val.map( x => x.trim() );
            if (val.length == 2) {
              var tx = parseFloat(val[0]);
              var ty = parseFloat(val[1]);
              if (coords.length>1 && Number.isFinite(tx) && Number.isFinite(ty)) {
                [dx,dy] = this.computeMirroredPointOffset(coords, tx,ty);
                if (Number.isFinite(dx) && Number.isFinite(dy)) {
                  x = tx + dx;
                  y = ty + dy;
                }
              }
            }
          }
          else if (key === 'top') {
            dx = 0;
            dy = + parseFloat(val);
            if (!Number.isFinite(dy)) { dy = 0; }
            x = lastpt[0] + dx;
            y = lastpt[1] + dy;
          }
          else if (key === 'bot') {
            dx = 0;
            dy = - parseFloat(val);
            if (!Number.isFinite(dy)) { dy = 0; }
            x = lastpt[0] + dx;
            y = lastpt[1] + dy;
          }
          else if (key === 'up') {
            dx = 0;
            dy = + parseFloat(val);
            if (!Number.isFinite(dy)) { dy = 0; }
            x = lastpt[0] + dx;
            y = lastpt[1] + dy;
          }
          else if (key === 'down') {
            dx = 0;
            dy = - parseFloat(val);
            if (!Number.isFinite(dy)) { dy = 0; }
            x = lastpt[0] + dx;
            y = lastpt[1] + dy;
          }
          else if (key === 'rt') {
            dx = + parseFloat(val);
            dy = 0;
            if (!Number.isFinite(dy)) { dx = 0; }
            x = lastpt[0] + dx;
            y = lastpt[1] + dy;
          }
          else if (key === 'lft') {
            dx = - parseFloat(val);
            dy = 0;
            if (!Number.isFinite(dy)) { dx = 0; }
            x = lastpt[0] + dx;
            y = lastpt[1] + dy;
          }
          else if (key === 'urt') {
            var val = val.split(',');
            var val = val.map( x => x.trim() );
            if (val.length == 2) {
              dy = + parseFloat(val[0]);///first is vertical
              dx = + parseFloat(val[1]);///second is horizontal
              if (Number.isFinite(dy) && Number.isFinite(dx)) {
                y = lastpt[1] + dy;
                x = lastpt[0] + dx;
              }
            }
          }
          else if (key === 'ulft') {
            var val = val.split(',');
            var val = val.map( x => x.trim() );
            if (val.length == 2) {
              dy = + parseFloat(val[0]);///first is vertical
              dx = + parseFloat(val[1]);///second is horizontal
              if (Number.isFinite(dy) && Number.isFinite(dx)) {
                y = lastpt[1] + dy;
                x = lastpt[0] - dx;
              }
            }
          }
          else if (key === 'lrt') {
            var val = val.split(',');
            var val = val.map( x => x.trim() );
            if (val.length == 2) {
              dy = + parseFloat(val[0]);///first is vertical
              dx = + parseFloat(val[1]);///second is horizontal
              if (Number.isFinite(dy) && Number.isFinite(dx)) {
                y = lastpt[1] - dy;
                x = lastpt[0] + dx;
              }
            }
          }
          else if (key === 'lft') {
            var val = val.split(',');
            var val = val.map( x => x.trim() );
            if (val.length == 2) {
              dy = + parseFloat(val[0]);///first is vertical
              dx = + parseFloat(val[1]);///second is horizontal
              if (Number.isFinite(dy) && Number.isFinite(dx)) {
                y = lastpt[1] - dy;
                x = lastpt[0] - dx;
              }
            }
          }
          else {
            x = lastpt[0];
            y = lastpt[1];
            lastjoin = '--'
          }
          lastpt[0] = x;
          lastpt[1] = y;
          coords.push([x,y,lastjoin,'','']);
        }
        continue;
      }

      ///***NOTE: it is important to get out of for-loop
      ///because we do not know how to skip to the next coord
      break;
    }

    ///NOTE: here we will call the latest addition which is to
    ///turn all continuous '..' MetaPost curve operation into
    ///..controls(x,y)and(x,y).. 

    ///this should be the only place to set the 'this.lastcoords'
    ///We want to set this only after we have read a true coords
    ///specification such as (1,1) (2,2) (3,4), but not
    ///for $allpoints(all)
    if (changeall) {
      this.lastcoords = coords;
    }
    return coords;
  }

  computeAngleDegree(px,py,tx,ty) {
    var dx1 = tx - px;
    var dy1 = ty - py;
    var ang1 = Math.atan2(dy1,dx1) / Math.PI * 180;
    if (ang1 < 0) { ang1 += 360; }
    return ang1;
  }

  computeLastAngleDegree(coords) {
    var n = coords.length;
    if (n < 2) {
      return 0;
    }
    var sx = coords[n-2][0];
    var sy = coords[n-2][1];
    var px = coords[n-1][0];
    var py = coords[n-1][1];
    return this.computeAngleDegree(sx,sy,px,py);
  }

  computeMirroredPointOffset(coords, tx,ty) {
    /// This function is to compute the offset to a new point that is the
    /// mirror reflection of the current point (tx,ty) off the line formed
    /// by the last two points in the coords.
    var n = coords.length;
    if (n < 2) {
      return [tx,ty];
    }
    var sx = coords[n-2][0];
    var sy = coords[n-2][1];
    var px = coords[n-1][0];
    var py = coords[n-1][1];
    px -= sx;
    py -= sy;
    tx -= sx;
    ty -= sy;
///console.log('computeMirroredPointOffset: adjusted: tx=',tx,' ty=',ty);
    var magni = Math.sqrt(px*px + py*py);
    px /= magni;///unit vector
    py /= magni;///unit vector
///console.log('computeMirroredPointOffset: unit: px=',px,' py=',py);
    var dotprod = px*tx + py*ty;
///console.log('computeMirroredPointOffset: dotprod=',dotprod);
    var nx = dotprod * px;
    var ny = dotprod * py;
///console.log('computeMirroredPointOffset: nx=',nx,' ny=',ny);
    var dx = nx - tx;
    var dy = ny - ty;
    dx *= 2;
    dy *= 2;
///console.log('computeMirroredPointOffset: adjusted: dx=',dx,' dy=',dy);

    return [dx,dy];

  }

  computeLineIntersection(p0,p1,p2,p3) {
    /// this is to compute the intersection of two lines p0--p1 and p2--p3
    let [A1,B1,C1] = this.computeStandardLineForm(p0,p1);
    let [A2,B2,C2] = this.computeStandardLineForm(p2,p3);
    let y = (A1*C2 - A2*C1)/(A1*B2 - A2*B1);
    let x = (C1*B2 - C2*B1)/(A1*B2 - A2*B1);
    return [x,y];
  }

  computeStandardLineForm(p1,p2) {
    let [x1,y1] = p1;
    let [x2,y2] = p2;
    let A = y2-y1;
    let B = x1-x2;
    let C = A*x1 + B*y1;
///console.log('A=',A);
///console.log('B=',B);
///console.log('C=',C);
    return [A,B,C];
  }

  computeCircleLineIntersection(rsq,A,B,C) {
    ///return an array of four points: x1,y1,x2,y2
    let something = (A*A+B*B)*(B*B*rsq-C*C) + A*A*C*C;
    let x1 = (A*C + Math.sqrt(something))/(A*A+B*B);
    let y1 = (C - A*x1)/B;
    let x2 = (A*C - Math.sqrt(something))/(A*A+B*B);
    let y2 = (C - A*x2)/B;
    return [x1,y1,x2,y2];
  }

  toColor(val,def_val) {
    ///such as 'red', '0.5red', or 0.8[red,green]
    var re_color = /^([\d\.]*)(\w+)$/;
    var re_color2 = /^([\d\.]*)\[(\w+)\,(\w+)\]$/;
    var v = null;
    if (!val) {
      return def_val;
    }
    if ((v = re_color2.exec(val)) !== null) {
      var num  = v[1];
      var color1 = v[2];
      var color2 = v[3];
      if (!num) {
        num = 0.5;
      }
      num = parseFloat(v[1]);
      if (!Number.isFinite(num)) {
        num = 0.5;
      }
      num = Math.max(0,num);
      num = Math.min(1,num);
      var first = (num * 100);
      var second = ((1-num) * 100);
      first = first.toFixed(0);
      second = second.toFixed(0);
      return `\\mpcolor{${color1}!${first}!${color2}!${second}!}`;

    } else if ((v = re_color.exec(val)) !== null) {

      var num = v[1];
      var color = v[2];
      if (!num) {
        num = 1;
      }
      num = parseFloat(v[1]);
      if (!Number.isFinite(num)) {
        num = 1;
      }
      num = Math.max(0,num);
      num = Math.min(1,num);
      var first = (num * 100);
      first = first.toFixed(0);
      if (first == 100) {
        return `\\mpcolor{${color}}`;
      } else {
        return `\\mpcolor{${color}!${first}!}`;
      }

    } else {
      return val;
    }
  }

  toLength(val,def_val) {
    if (!val) {
      return def_val;
    }
    var re = /^([\d\.]*)(px|pt|mm|cm|in|)$/
    var v;
    if ((v = re.exec(val)) !== null) {
      var num = parseFloat(v[1]);
      var unit = v[2];
      if (unit === '') {
        return `${num}`;
      }
      else if (unit === 'px') {
        return `${num*0.75}pt`;///SVG unit where 1px = 0.75pt
      }
      else {
        return `${num}${unit}`;///use the input unit
      }
    } else {
      return val;
    }
  }

}
module.exports = { NitrilePreviewDiagram };
