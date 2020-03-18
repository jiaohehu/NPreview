'use babel';

const { makeknots, mp_make_choices } = require('./nitrile-preview-mppath');
const global_shapes = {};

const N_Max_Array = 256;
class NitrilePreviewDiagram {

  constructor(parser) {
    this.parser = parser;
    this.MAX = 256;
    /// regular expression
    this.re_word = /[A-Za-z]+/;
    this.re_commentline = /^\%/;
    this.re_defpicture_command = /^defpicture(\.\w+|)\s+(.*)$/;
    this.re_enddefpicture_command = /^enddefpicture(\.\w+|)\s+(.*)$/;
    this.re_var_command = /^([[A-Za-z\/]+)\s*\:\=\s*(.*)$/;
    this.re_viewport_command = /^viewport\s+(\d+)\s+(\d+)/;
    this.re_unit_command = /^unit\s+(\d+)(mm|cm|in)$/;
    this.re_config_command = /^config\s+(\w+)\s*(.*)$/;
    this.re_reset_command = /^reset/;
    this.re_set_command = /^set\s+([\w\-]+)\s*(.*)$/;
    this.re_exit_command = /^exit/;
    this.re_label_command = /^label(\.\w+|)\s+(.*)$/;
    this.re_shape_command = /^shape(\.\w+|)\s+(.*)$/;
    this.re_drawcontrolpoints_command = /^drawcontrolpoints(\.\w+|)\s+(.*)$/;
    this.re_drawline_command = /^drawline(\.\w+|)\s+(.*)$/;
    this.re_drawdblarrow_command = /^drawdblarrow(\.\w+|)\s+(.*)$/;
    this.re_drawarrow_command = /^drawarrow(\.\w+|)\s+(.*)$/;
    this.re_drawrevarrow_command = /^drawrevarrow(\.\w+|)\s+(.*)$/;
    this.re_drawarc_command = /^drawarc(\.\w+|)\s+(.*)$/;
    this.re_drawanglearc_command = /^drawanglearc(\.\w+|)\s+(.*)$/;
    this.re_circle_command = /^circle(\.\w+|)\s+(.*)$/;
    this.re_halfcircle_command = /^halfcircle(\.\w+|)\s+(.*)$/;
    this.re_quadrant_command = /^quadrant(\.\w+|)\s+(.*)$/;
    this.re_octant_command = /^octant(\.\w+|)\s+(.*)$/;
    this.re_rhombus_command = /^rhombus(\.\w+|)\s+(.*)$/;
    this.re_trapezoid_command = /^trapezoid(\.\w+|)\s+(.*)$/;
    this.re_parallelgram_command = /^parallelgram(\.\w+|)\s+(.*)$/;
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
    this.re_pathfunc = /^\$(\w+)\((.*?)\)\s*(.*)$/;
    this.re_dashdot = /^(\-{2,}|\.{2,})\s*(.*)$/;
    this.re_variable_range = /^\*([A-Za-z]*)\[(.*?)\]\s*(.*)$/;
    this.re_variable = /^\*([A-Za-z]*)\s*(.*)$/;
    this.re_movept = /^\@\((.*?)\)\s*(.*)$/;
    this.re_coord = /^\((.*?)\)\s*(.*)$/;
    this.re_cycle = /^(cycle)\s*(.*)$/;
    this.re_offset = /^\<(.*?)\>\s*(.*)$/;
    this.re_relative = /^\[(.*?)\]\s*(.*)$/;
    this.re_nonblanks = /^(\S+)\s*(.*)$/;
    this.re_label_arg = /\s*\{(.*)\}\s*(.*)$/;
    this.re_range = /^(\d+)\-(\d+)$/;
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
    this.commands = [];
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
    this.def_linecap = this.linecap = '';
    this.def_linedashed = this.linedashed = '';
    this.def_linecolor = this.linecolor = '';
    this.def_linesize = this.linesize = '';
    this.def_fillcolor = this.fillcolor = '';
    this.def_dotcolor = this.dotcolor = '';
    this.def_dotsize = this.dotsize = '';
    this.def_tickcolor = this.tickcolor = '';
    this.def_ticksize = this.ticksize = '';
    this.def_tickprotrude = this.tickprotrude = 0.33;
    this.def_labelgapx = this.labelgapx = 2;
    this.def_labelgapy = this.labelgapy = 2;
  }

  parse(para) {
    var p = null;
    var line = null;
    var v = null;
    var row = 0;
    this.do_setup();
    for (row in para) {
      line = para[row];
      this.row = row;
      this.line = line;
      var coords = [];
      var line0 = line;
      this.commands.push(this.do_comment(line));
      if ((v = this.re_commentline.exec(line)) !== null) {
        continue;
      }
      if ((v = this.re_var_command.exec(line)) !== null) {
        var symbol = v[1];
        line = v[2];
        var coords = this.readCoordsLine(line, false);
        ///NOTE: for "a:b:c"
        var segs = symbol.split('/');
        if (segs.length > 1) {
          for (var i = 0; this.valid(segs, i); ++i) {
            var seg = segs[i];
            var pt = this.point(coords, i);
            if (this.re_word.test(seg)) {
              this.variables[seg] = [pt];
              ///collect remaining points in coords if this is the last one
              if (i === segs.length - 1) {
                for (var j = i + 1; this.valid(coords, j); ++j) {
                  var pt = this.point(coords, j);
                  this.variables[seg].push(pt);
                }
              }
              this.commands.push(this.do_comment(`saved: ${seg}:=${this.coordsToStr(this.variables[seg])}`));
            }
          }
        } else if (this.re_word.test(symbol)) {
          this.variables[symbol] = coords;
          this.commands.push(this.do_comment(`saved: ${symbol}:=${this.coordsToStr(this.variables[symbol])}`));
        }
        continue;
      }
      if ((v = this.re_viewport_command.exec(line)) !== null) {
        this.width = this.assertInt(v[1], 25, 10, 100);
        this.height = this.assertInt(v[2], 10, 4, 100);
        this.commands.push(this.do_comment(`width: ${this.width} height: ${this.height}`));
        this.do_setup();
        continue;
      }
      if ((v = this.re_unit_command.exec(line)) !== null) {
        this.unit = `${v[1]}${v[2]}`;
        this.commands.push(this.do_comment(`unit: ${this.unit}`));
        this.do_setup();
        continue;
      }
      if ((v = this.re_config_command.exec(line)) !== null) {
        var key = v[1];
        var val = v[2];
        this.config[key] = val;
        this.commands.push(this.do_comment(`config: ${key} ${val}`));
        this.do_setup();
        continue;
      }
      if ((v = this.re_exit_command.exec(line)) !== null) {
        break;
      }
      if ((v = this.re_reset_command.exec(line)) !== null) {
        this.initSettings();
        continue;
      }
      if ((v = this.re_set_command.exec(line)) !== null) {
        var key = v[1];
        var val = v[2].trim();
        if (key === 'refx') {
          ///
          /// /3 - from left
          /// 3/ - from right
          ///
          if (val[0] === '/') { /// '/3'
            val = val.slice(1);
            val = this.assertFloat(val, this.def_refx, 0, this.width);
          } else if (val[val.length - 1] === '/') { /// '3/'
            val = val.slice(0, val.length - 1);
            val = this.width - this.assertFloat(val, this.def_refx, 0, this.width);
          } else {
            val = this.assertFloat(val, this.def_refx, 0, this.width);
          }
          this.refx = val;
        } ///such as 12.5
        if (key === 'refy') {
          ///
          /// /3 - from top
          /// 3/ - from bottom
          ///
          ///if it is "/3" then it specifies a distance from the top side of the diagram
          if (val[0] === '/') { /// '/3'
            val = val.slice(1);
            val = this.height - this.assertFloat(val, this.def_refy, 0, this.height);
          } else if (val[val.length - 1] === '/') { /// '3/'
            val = val.slice(0, val.length - 1);
            val = this.assertFloat(val, this.def_refy, 0, this.height);
          } else {
            val = this.assertFloat(val, this.def_refy, 0, this.height);
          }
          this.refy = val;
        } ///such as 12.5
        if (key === 'refsx') { this.refsx = this.assertFloat(val, this.def_refsx, 0.1, 10); } ///such as 1.5
        if (key === 'refsy') { this.refsy = this.assertFloat(val, this.def_refsy, 0.1, 10); } ///such as 1.5
        if (key === 'linedashed') { this.linedashed = this.toLineDashed(val, this.def_linedashed); } ///such as 'evenly' or 'withdots'
        if (key === 'line-size') { this.linesize = this.assertLength(val, this.def_linesize); } ///such as '0', '0.1', '1pt', '1mm'
        if (key === 'fill') { this.fillcolor = this.assertColor(val, this.def_fillcolor); } ///such as 'red', '0.5red', or '0.8[red,green]'
        if (key === 'stroke') { this.linecolor = this.assertColor(val, this.def_linecolor); } ///such as 'red', '0.5red', or '0.8[red,green]'
        if (key === 'dot') { this.dotcolor = this.assertColor(val, this.def_dotcolor); } ///such as 'red', '0.5red', or '0.8[red,green]'
        if (key === 'dot-size') { this.dotsize = this.assertLength(val, this.def_dotsize); } ///such as '4pt' or '4mm'
        if (key === 'tick') { this.tickcolor = this.assertColor(val, this.def_tickcolor); } ///such as 'red'
        if (key === 'tick-size') { this.ticksize = this.assertLength(val, this.def_ticksize); } ///such as '1pt' or '1mm'
        if (key === 'tick-protrude') { this.tickprotrude = this.assertFloat(val, this.def_tickprotrude, 0.1, 1.0); } ///such as '0.33'
        if (key === 'font-color') { this.fontcolor = this.assertColor(val, this.def_fontcolor); }/// such as 'green', 'rgb(200,100,255)'
        if (key === 'font-size') { this.fontsize = this.assertLength(val, this.def_fontsize); }/// such as '14pt'
        if (key === 'labelgapx') { this.labelgapx = this.assertInt(val, this.def_labelgapx, 0, 10); }///such as '0'
        if (key === 'labelgapy') { this.labelgapy = this.assertInt(val, this.def_labelgapy, 0, 10); }///such as '0'
        continue;
      }
      ///NOTE: defpicture/enddefpicture
      if ((v = this.re_defpicture_command.exec(line)) !== null) {
        continue;
      }
      if ((v = this.re_enddefpicture_command.exec(line)) !== null) {
        continue;
      }
      ///NOTE: *label* command
      if ((v = this.re_label_command.exec(line)) !== null) {
        var opt = this.assertAlign(v[1]);
        var cmd = 'label';
        var line = v[2];
        if ((v = this.re_label_arg.exec(line)) !== null) {
          var txt = v[1].trim();
          line = v[2];
        } else {
          var txt = '';
        }
        if (!txt) {
          txt = 'unassigned';
        }
        var label = txt;
        var coords = this.readCoordsLine(line);
        this.commands.push(this.do_label(opt,txt,coords));
        this.lastcoords = coords;
        continue;
      }
      ///NOTE: beginning of *object* commands
      if ((v = this.re_apple_command.exec(line)) !== null) {
        var opt = this.assertAlign(v[1]);
        var [txt,line] = this.readCoordsText(v[2]);
        var coords = this.readCoordsLine(line);
        this.commands.push(this.do_apple(opt,txt,coords));
        this.lastcoords = coords;
        continue;
      }
      if ((v = this.re_basket_command.exec(line)) !== null) {
        var opt = this.assertAlign(v[1]);
        var [txt,line] = this.readCoordsText(v[2]);
        var coords = this.readCoordsLine(line);
        this.commands.push(this.do_basket(opt,txt,coords));
        this.lastcoords = coords;
        continue;
      }
      if ((v = this.re_crate_command.exec(line)) !== null) {
        var opt = this.assertAlign(v[1]);
        var [txt,line] = this.readCoordsText(v[2]);
        var coords = this.readCoordsLine(line);
        this.commands.push(this.do_crate(opt,txt,coords));
        this.lastcoords = coords;
        continue;
      }
      if ((v = this.re_parallelgram_command.exec(line)) !== null) {
        var opt = this.assertAlign(v[1]);
        var [txt,line] = this.readCoordsText(v[2]);
        var coords = this.readCoordsLine(line);
        this.commands.push(this.do_parallelgram(opt,txt,coords));
        this.lastcoords = coords;
        continue;
      }
      if ((v = this.re_rhombus_command.exec(line)) !== null) {
        var opt = this.assertAlign(v[1]);
        var [txt,line] = this.readCoordsText(v[2]);
        var coords = this.readCoordsLine(line);
        this.commands.push(this.do_rhombus(opt,txt,coords));
        this.lastcoords = coords;
        continue;
      }
      if ((v = this.re_trapezoid_command.exec(line)) !== null) {
        var opt = this.assertAlign(v[1]);
        var [txt,line] = this.readCoordsText(v[2]);
        var coords = this.readCoordsLine(line);
        this.commands.push(this.do_trapezoid(opt,txt,coords));
        this.lastcoords = coords;
        continue;
      }
      if ((v = this.re_rect_command.exec(line)) !== null) {
        var opt = this.assertAlign(v[1]);
        var [txt,line] = this.readCoordsText(v[2]);
        var coords = this.readCoordsLine(line);
        this.commands.push(this.do_rect(opt,txt,coords));
        this.lastcoords = coords;
        continue;
      }
      if ((v = this.re_rrect_command.exec(line)) !== null) {
        var opt = this.assertAlign(v[1]);
        var [txt,line] = this.readCoordsText(v[2]);
        var coords = this.readCoordsLine(line);
        this.commands.push(this.do_rrect(opt,txt,coords));
        this.lastcoords = coords;
        continue;
      }
      if ((v = this.re_brick_command.exec(line)) !== null) {
        var opt = this.assertAlign(v[1]);
        var [txt,line] = this.readCoordsText(v[2]);
        var coords = this.readCoordsLine(line);
        this.commands.push(this.do_brick(opt,txt,coords));
        this.lastcoords = coords;
        continue;
      }
      ///NOTE: beginning of *draw* commands
      if ((v = this.re_drawcontrolpoints_command.exec(line)) !== null) {
        var opt = v[1].trim();
        var line = v[2];
        var txt = '';
        var coords = this.readCoordsLine(line);
        this.commands.push(this.do_drawcontrolpoints(opt,txt,coords));
        this.lastcoords = coords;
        continue;
      }
      if ((v = this.re_drawline_command.exec(line)) !== null) {
        var stroke_opt = v[1].trim();
        var line = v[2];
        var cmd = 'drawline';
        var txt = '';
        var coords = this.readCoordsLine(line);
        this.commands.push(this.do_drawline(stroke_opt,txt,coords));
        this.lastcoords = coords;
        continue;
      }
      if ((v = this.re_drawdblarrow_command.exec(line)) !== null) {
        var fill_opt = v[1].trim();
        var line = v[2];
        var coords = this.readCoordsLine(line);
        this.commands.push(this.do_drawdblarrow(fill_opt,'',coords));
        this.lastcoords = coords;
        continue;
      }
      if ((v = this.re_drawarrow_command.exec(line)) !== null) {
        var fill_opt = v[1].trim();
        var line = v[2];
        var coords = this.readCoordsLine(line);
        this.commands.push(this.do_drawarrow(fill_opt,'',coords));
        this.lastcoords = coords;
        continue;
      }
      if ((v = this.re_drawrevarrow_command.exec(line)) !== null) {
        var fill_opt = v[1].trim();
        var line = v[2];
        var coords = this.readCoordsLine(line);
        this.commands.push(this.do_drawrevarrow(fill_opt,'',coords));
        this.lastcoords = coords;
        continue;
      }
      if ((v = this.re_drawarc_command.exec(line)) !== null) {
        ///drawarc (x1,y1) (x2,y2)
        var opt = v[1].trim();
        var line = v[2];
        var coords = this.readCoordsLine(line);
        this.commands.push(this.do_drawarc(opt,'',coords));
        this.lastcoords = coords;
        continue;
      }
      if ((v = this.re_drawanglearc_command.exec(line)) !== null) {
        var anglearc_opt = v[1].trim();
        var [txt,line] = this.readCoordsText(v[2]);
        var coords = this.readCoordsLine(line);
        this.commands.push(this.do_drawanglearc(anglearc_opt,txt,coords));
        this.lastcoords = coords;
        continue;
      }
      ///NOTE: beginning of *primitive* commands
      if ((v = this.re_circle_command.exec(line)) !== null) {
        var circle_opt = v[1].trim();
        var [txt,line] = this.readCoordsText(v[2]);
        var coords = this.readCoordsLine(line);
        this.commands.push(this.do_circle(circle_opt,txt,coords));
        this.lastcoords = coords;
        continue;
      }
      if ((v = this.re_halfcircle_command.exec(line)) !== null) {
        var opt = v[1].trim();
        opt = opt||'.top';
        var [txt,line] = this.readCoordsText(v[2]);
        var coords = this.readCoordsLine(line);
        this.commands.push(this.do_halfcircle(opt,txt,coords));
        this.lastcoords = coords;
        continue;
      }
      if ((v = this.re_quadrant_command.exec(line)) !== null) {
        var opt = v[1].trim();
        opt = opt||'.q1';
        var [txt,line] = this.readCoordsText(v[2]);
        var coords = this.readCoordsLine(line);
        this.commands.push(this.do_quadrant(opt,txt,coords));
        this.lastcoords = coords;
        continue;
      }
      if ((v = this.re_octant_command.exec(line)) !== null) {
        var opt = v[1].trim();
        opt = opt||'.o1';
        var [txt,line] = this.readCoordsText(v[2]);
        var coords = this.readCoordsLine(line);
        this.commands.push(this.do_octant(opt,txt,coords));
        this.lastcoords = coords;
        continue;
      }
      if ((v = this.re_dot_command.exec(line)) !== null) {
        var dot_opt = v[1].trim();
        var [txt,line] = this.readCoordsText(v[2]);
        var coords = this.readCoordsLine(line);
        this.commands.push(this.do_dot(dot_opt,txt,coords));
        this.lastcoords = coords;
        continue;
      }
      if ((v = this.re_tick_command.exec(line)) !== null) {
        var tick_opt = v[1].trim();
        var [txt,line] = this.readCoordsText(v[2]);
        var coords = this.readCoordsLine(line);
        this.commands.push(this.do_tick(tick_opt,txt,coords));
        this.lastcoords = coords;
        continue;
      }
      if ((v = this.re_radical_command.exec(line)) !== null) {
        var opt = v[1].trim();
        var [txt,line] = this.readCoordsText(v[2]);
        var coords = this.readCoordsLine(line);
        this.commands.push(this.do_radical(opt,txt,coords));
        this.lastcoords = coords;
        continue;
      }
      if ((v = this.re_protractor_command.exec(line)) !== null) {
        var opt = v[1].trim();
        var [txt,line] = this.readCoordsText(v[2]);
        var coords = this.readCoordsLine(line);
        this.commands.push(this.do_protractor(opt,txt,coords));
        this.lastcoords = coords;
        continue;
      }
      this.commands.push(this.do_comment(`***ERROR: instruction not recognized: ${line}`));
    }
    return this.do_finalize(this.commands.join('\n'));
  }

  assertInt(val, def_v, min, max) {
    if (!val) {
      return def_v;
    }
    val = parseInt(val);
    if (!Number.isFinite(val)) {
      return def_v;
    }
    if (val < min) {
      val = min;
    } else if (val > max) {
      val = max;
    }
    return val;
  }

  assertFloat(val, def_v, min, max) {
    val = parseFloat(val);
    if (!Number.isFinite(val)) {
      return def_v;
    } 
    if (val < min) {
      val = min;
    } else if (val > max) {
      val = max;
    }
    return val;
  }

  toLineDashed(v, def_v) {
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

  toAreaOp(v, def_v) {
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

  toFloat(v, def_v) {
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

  toString(v, def_v) {
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
    return '' + v;
  }

  fetchVariable(a) {

    ///***NOTE: this function should return a path, not a point!

    /// if it is null then we return an empty path
    if (!a) {
      this.commands.push(this.do_comment(`***ERROR: empty variable name, assuming (0,0)`));
      return [[0, 0]];
    }
    if (this.variables.hasOwnProperty(a)) {
      return this.variables[a];
    }
    if (a === '*') {
      return this.lastcoords;
    }
    o.push(`%***ERROR: undefined variable '${a}', assuming (0,0)`);
    return [[0, 0]];
  }

  /// this is called inside readCoordsLine()
  execFunction(line, fun_str, arg_str) {

    var ret_val = [];
    var args = arg_str.split(',');
    args = args.map(x => x.trim());
    switch (fun_str) {

      case 'midpoint':

        if (args.length == 2) {
          var coords = this.fetchVariable(args[0]);
          var fraction = parseFloat(args[1]);
          if (coords && Number.isFinite(fraction)) {
            var z0 = this.point(coords, 0);
            var z1 = this.point(coords, 1);
            var z0x = parseFloat(z0[0]);
            var z0y = parseFloat(z0[1]);
            var z1x = parseFloat(z1[0]);
            var z1y = parseFloat(z1[1]);
            var ptx = z0x + (z1x - z0x) * fraction;
            var pty = z0y + (z1y - z0y) * fraction;
            ret_val.push([ptx, pty]);///always returns a single point
          }

        } else if (args.length == 1) {

          var coords = this.fetchVariable(args[0]);
          var z0 = this.point(coords, 0);
          var z1 = this.point(coords, 1);
          var z0x = parseFloat(z0[0]);
          var z0y = parseFloat(z0[1]);
          var z1x = parseFloat(z1[0]);
          var z1y = parseFloat(z1[1]);
          var midx = (z0x + z1x) * 0.5;
          var midy = (z0y + z1y) * 0.5;
          ret_val.push([midx, midy]);
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
            Number.isFinite(n)) {

            if (n > N_Max_Array) {
              n = N_Max_Array;
            }
            var pt = [sx, sy, 0, '', ''];
            var dx = tx - sx;
            var dy = ty - sy;
            ret_val.push(pt);
            for (let i = 1; i < n; i++) {
              var frac = i / (n - 1);
              var px = sx + frac * dx;
              var py = sy + frac * dy;
              ret_val.push([px, py, 0, '', '']);
            }
          }
        }
        break;

      case 'shiftpoints':

        /// shiftpoints(a,0,-2)
        /// shiftpoints(a,2,-1)

        if (args.length == 3) {
          var coords = this.fetchVariable(args[0]);
          var dx = parseFloat(args[1]);
          var dy = parseFloat(args[2]);
          if (coords &&
            Number.isFinite(dx) &&
            Number.isFinite(dy)) {

            for (let i = 0; i < coords.length; i++) {
              var pt = this.point(coords, i);
              if (this.iscyclept(pt)) {
                ret_val.push([0, 0, 'cycle']);
              } else {
                var x = pt[0] + dx;
                var y = pt[1] + dy;
                ret_val.push([x, y, pt[2], pt[3], pt[4], pt[5], pt[6]]);
              }
            }
          }
        }
        break;

      case 'somepoints':

        /// somepoints(a,0,2) - all points between 0 and 2, including 0 and 2
        /// somepoints(a,3,5) - all points between 3 and 5, including 3 and 5
        /// somepoints(a,3)   - a single point in 3

        if (args.length == 3) {
          var coords = this.fetchVariable(args[0]);
          var j = parseFloat(args[1]);
          var k = parseFloat(args[2]);
        } else if (args.length == 2) {
          var coords = this.fetchVariable(args[0]);
          var j = parseFloat(args[1]);
          var k = parseFloat(args[1]);
        } else {
          break;
        }

        if (coords &&
          Number.isFinite(j) &&
          Number.isFinite(k)) {

          var i;
          if (k >= j) {
            for (i = j; i <= k && i >= 0 && i < coords.length; ++i) {
              var pt = this.point(coords, i);
              ret_val.push(pt);
            }
          } else {
            for (i = j; i >= k && i >= 0 && i < coords.length; --i) {
              var pt = this.point(coords, i);
              ret_val.push(pt);
            }
          }
        }
        break;

      case 'allpoints':

        /// allpoints(a,b,c) - all points from a,b,and c,

        for (var i in args) {
          var coords = this.fetchVariable(args[i]);
          if (coords) {
            for (var j in coords) {
              var pt = this.point(coords, j);
              ret_val.push(pt);
            }
          }
        }
        break;

      case 'lineintersect': {

        /// lineintersect(a,b) - 'a' for the first line and 'b' for the second line

        if (args.length == 2) {
          var coords0 = this.fetchVariable(args[0]);
          var coords1 = this.fetchVariable(args[1]);

          let p0 = this.point(coords0, 0);
          let p1 = this.point(coords0, 1);
          let q0 = this.point(coords1, 0);
          let q1 = this.point(coords1, 1);
          let [x, y] = this.computeLineIntersection(p0, p1, q0, q1);
          ///console.log('p0=',p0);
          ///console.log('p1=',p1);
          ///console.log('q0=',q0);
          ///console.log('q1=',q1);
          ///console.log('x=',x);
          ///console.log('y=',y);
          return [[x, y]];
        }

        break;
      }

      case 'linecircleintersect': {

        /// circlelineintersect(a,c,radius)   
        ///
        ///  a - symbol: the line (two points)
        ///  c - symbol: circle center (one point)
        ///  radius - number: circle radius   

        if (args.length == 3) {
          let [a, c, radius] = args;
          var coords0 = this.fetchVariable(a);
          let p0 = this.point(coords0, 0);
          let p1 = this.point(coords0, 1);
          let [A, B, C] = this.computeStandardLineForm(p0, p1);
          var coords0 = this.fetchVariable(c);
          let [x0, y0] = this.point(coords0, 0);
          // translate C to new coords
          C = C - A * x0 - B * y0;
          let rsq = radius * radius;
          let [x1, y1, x2, y2] = this.computeCircleLineIntersection(rsq, A, B, C);
          x1 += x0;
          x2 += x0;
          y1 += y0;
          y2 += y0;
          return [[x1, y1], [x2, y2]];///return a path of two points;
          ///note one or both might be Infinity of NaN
        }
        break;
      }

      default:
        break;

    }
    if (ret_val.length == 0) {
      return [[0, 0]];///a coordinate with a single point
    }
    return ret_val;
  }

  argsToCoords(args) {

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

  assertAlign(v) {

    if (typeof v == 'string') {
      if (
        v.localeCompare('.ctr') == 0 ||
        v.localeCompare('.lft') == 0 ||
        v.localeCompare('.rt') == 0 ||
        v.localeCompare('.top') == 0 ||
        v.localeCompare('.bot') == 0 ||
        v.localeCompare('.ulft') == 0 ||
        v.localeCompare('.urt') == 0 ||
        v.localeCompare('.llft') == 0 ||
        v.localeCompare('.lrt') == 0) {
        return v;
      }
    }
    return '.urt';
  }

  fix(v) {
    if (typeof v == 'number') {
    } else {
      v = parseFloat(v);
    }
    return parseFloat(v.toFixed(6));
  }

  fix2(v) {
    if (typeof v == 'number') {
    } else {
      v = parseFloat(v);
    }
    return parseFloat(v.toFixed(2));
  }

  iscyclept(pt) {
    if (Array.isArray(pt) && pt[2] == 'cycle') {
      return true;
    }
    return false;
  }

  valid(coords, i) {
    if (Array.isArray(coords) && i >= 0 &&
      i < coords.length && coords[i][2] !== 'cycle' &&
      coords[i][2] !== 'nan') {
      return true;
    }
    return false;
  }

  isvalidpt(pt) {
    if (Array.isArray(pt)) {
      if (typeof pt[2] === 'string') {
        if( pt[2] == 'cycle'|| pt[2] == 'nan') {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  point(coords, i) {
    /// * NOTE: This method is to return a point not yet scaled by
    ///   refx/refy/refsx/refsy
    ///
    /// * NOTE: this method will always return a point. Albet the 
    ///   the join will be set to 'nan'.
    ///
    if (!coords) {
      return [0, 0, 'nan'];
    }
    if (i < coords.length) {
      var pt = coords[i];
      return pt;
    } else {
      return [0, 0, 'nan'];
    }
  }

  readCoordsText(line) {
    var v;
    if ((v = this.re_label_arg.exec(line)) !== null) {
      var label = v[1].trim();
      line = v[2];
    } else {
      var label = '';
    }
    return [label,line];
  }

  readCoordsLine(line) {

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
    /// *a..(1,2) (3,4)
    /// <0,1> *a..(1,2) (3,4)
    /// <0,1> *a..(1,2) (3,4) cycle

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
    var lastpt = [0, 0];
    var dx = 0;
    var dy = 0;
    var x = 0;
    var y = 0;
    var v;
    var n = 0;
    var x1 = 0;//First control point for cubic
    var y1 = 0;//First control point for cubic
    var x2 = 0;//Second control point for cubic
    var y2 = 0;//Second control point for cubic
    var x3 = 0;//First control point for quadratic
    var y3 = 0;//First control point for quadratic
    var lastjoin = '';///'hobby','','cubic','quadrilatic','arcpath'
    var hobby_p = [];
    while (line.length) {

      if ((v = this.re_variable_range.exec(line)) !== null) {
        var d = v[1].trim();
        var range = v[2].trim();
        line = v[3];

        var symbol = d;
        if (symbol.length == 0) {
          var from = this.lastcoords;
        } else {
          var from = this.fetchVariable(symbol);
        }
        var indices = range.split(',');
        var join = '';
        for (var s of indices) {
          if (this.re_range.test(s)) {
            var v = this.re_range.exec(s);
            var i1 = parseInt(v[1]);
            var i2 = parseInt(v[2]);
            if (Number.isFinite(i1) && Number.isFinite(i2)) {
              for (var i = i1; i1 <= i2 && i <= i2; ++i) {
                [x, y, join] = this.point(from, i);
                if (join !== 'cycle' && join !== 'nan') {
                  x += offsetx;
                  y += offsety;
                  coords.push([x, y]);
                  lastpt[0] = x;
                  lastpt[1] = y;
                }
              }
              for (var i = i1; i1 > i2 && i >= i2; --i) {
                [x, y, join] = this.point(from, i);
                if (join !== 'cycle' && join !== 'nan') {
                  x += offsetx;
                  y += offsety;
                  coords.push([x, y]);
                  lastpt[0] = x;
                  lastpt[1] = y;
                }
              }
            }
          } else {
            var i = parseInt(s);
            if (Number.isFinite(i)) {
              [x, y, join] = this.point(from, i);
              if (join !== 'cycle' && join !== 'nan') {
                x += offsetx;
                y += offsety;
                coords.push([x, y]);
                lastpt[0] = x;
                lastpt[1] = y;
              }
            }
          }
        }
        continue;

      } else if ((v = this.re_variable.exec(line)) !== null) {
        var d = v[1].trim();
        line = v[2];

        var symbol = d;
        if (symbol.length == 0) {
          var from = this.lastcoords;
        } else {
          var from = this.fetchVariable(symbol);
        }
        for (var i = 0; i < from.length; ++i) {
          ///***NOTE: must call point() so that it converts any variable
          ///   to real coords.;
          var pt = this.point(from, i);
          x = pt[0];
          y = pt[1];
          x += offsetx;
          y += offsety;
          coords.push([x, y, pt[2], pt[3], pt[4], pt[5], pt[6]]);
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
        var ret_val = this.execFunction(raw, d, args);
        for (var i = 0; i < ret_val.length; ++i) {
          [x, y] = this.point(ret_val, i);
          x += offsetx;
          y += offsety;
          coords.push([x, y, '--']);
          lastpt[0] = x;
          lastpt[1] = y;
        }
        continue;
      }

      if ((v = this.re_movept.exec(line)) !== null) {
        var d = v[1].trim();
        line = v[2];
        d = d.split(',');
        d = d.map(x => x.trim());
        if (d.length == 2) {
          [x,y] = d;
          x = parseFloat(x);
          y = parseFloat(y);
          if (Number.isFinite(x)&&
            Number.isFinite(y)) {
            x += offsetx;
            y += offsety;
            lastpt[0] = x;
            lastpt[1] = y;
            coords.push([0, 0, 'nan']);
            coords.push([x, y]);
            lastjoin = '';
          }
        }
        continue;
      }

      if (this.re_coord.test(line) || this.re_cycle.test(line)) {
        n++;
        var is_cycle = 0;
        if ((v=this.re_coord.exec(line)) !== null) {
          var d = v[1].trim();
          line = v[2];
          d = d.split(',');
          d = d.map(x => x.trim());
          if (d.length < 2) {
            continue;
          }
          var d0 = d[0];
          var d1 = d[1];
          if (!d0) {
            x = lastpt[0];
          } else {
            x = parseFloat(d0);
            x += offsetx;
          }
          if (!d1) {
            y = lastpt[1];
          } else {
            y = parseFloat(d1);
            y += offsety;
          }
        } else {
          is_cycle = 1;
          /// get the first point
          x = coords[0][0];
          y = coords[0][1];
        }
        if (Number.isFinite(x) && Number.isFinite(y)) {
          ///add in the offset; ***NOTE that offset should only
          ///be added for real coords, and not the relatives.
          if (lastjoin === 'hobby') {
            hobby_p.push([x, y]);
            var tension = 1;
            var knots = makeknots(hobby_p, tension, false);///nitrile-preview-mppath.js
            mp_make_choices(knots[0]);
            coords.push([x, y, '']);
            var i = coords.length - 3;
            for (var i = 1; i < knots.length; ++i) {
              var j = coords.length - knots.length + i;
              coords[j][2] = 'C';
              coords[j][3] = knots[i - 1].rx_pt;
              coords[j][4] = knots[i - 1].ry_pt;
              coords[j][5] = knots[i].lx_pt;
              coords[j][6] = knots[i].ly_pt;
            }
            lastjoin = 'hobby';///keep it as 'hobby' so that we can absorb more .. connectors
          } else {
            coords.push([x, y, '']);
            lastjoin = '';
          }
          lastpt[0] = x;
          lastpt[1] = y;
        }
        if (is_cycle) {
          coords.push([0, 0, 'cycle']);
          break;
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
        d = d.map(x => x.trim());
        if (d.length == 2) {
          dx = parseFloat(d[0]);
          dy = parseFloat(d[1]);
          if (Number.isFinite(dx)) { offsetx += dx; }
          if (Number.isFinite(dy)) { offsety += dy; }
        }
        continue;
      }

      if ((v = this.re_relative.exec(line)) !== null) {
        n++;
        /// [angledist:angle,dist]
        /// [turnrt:angle,dist]
        /// [turnlft:angle,dist]
        /// [turn:angle,dist]
        /// [flip:dx,dy] /// flip the point to the other side of the line of the last two points
        /// [l:dx,dy] /// line
        /// [h:dx] /// line
        /// [v:dy] /// line
        /// [c:dx1,dy1,dx2,dy2,dx,dy] 
        /// [s:dx2,dy2,dx,dy] 
        /// [a:rx,ry,angle,bigarcflag,sweepflag,dx,dy] 
        /// [q:dx1,dy1,dx,dy] 
        /// [t:dx,dy] 
        var d = v[1].trim();
        line = v[2];
        d = d.split(':');
        d = d.map(x => x.trim());
        if (d.length == 2) {
          var key = d[0];
          var val = d[1];
          if (key === 'angledist') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 2) {
              var angle = parseFloat(val[0]);
              var dist = parseFloat(val[1]);
              dx = dist * Math.cos(angle / 180 * Math.PI);
              dy = dist * Math.sin(angle / 180 * Math.PI);
              if (!Number.isFinite(dx)) { dx = 0; }
              if (!Number.isFinite(dy)) { dy = 0; }
              x = lastpt[0] + dx;
              y = lastpt[1] + dy;
              lastjoin = '';
              coords.push([x, y, '', x1, y1, x2, y2]);
              lastpt[0] = x;
              lastpt[1] = y;
            }
          }
          else if (key === 'turn') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 2) {
              var angle = parseFloat(val[0]);
              var lastangle = this.computeLastAngleDegree(coords);
              angle += lastangle;
              var dist = parseFloat(val[1]);
              dx = dist * Math.cos(angle / 180 * Math.PI);
              dy = dist * Math.sin(angle / 180 * Math.PI);
              if (!Number.isFinite(dx)) { dx = 0; }
              if (!Number.isFinite(dy)) { dy = 0; }
              x = lastpt[0] + dx;
              y = lastpt[1] + dy;
              lastjoin = '';
              coords.push([x, y, '', x1, y1, x2, y2]);
              lastpt[0] = x;
              lastpt[1] = y;
            }
          }
          else if (key === 'turnlft') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 2) {
              var angle = parseFloat(val[0]);
              var lastangle = this.computeLastAngleDegree(coords);
              angle += lastangle;
              var dist = parseFloat(val[1]);
              dx = dist * Math.cos(angle / 180 * Math.PI);
              dy = dist * Math.sin(angle / 180 * Math.PI);
              if (!Number.isFinite(dx)) { dx = 0; }
              if (!Number.isFinite(dy)) { dy = 0; }
              x = lastpt[0] + dx;
              y = lastpt[1] + dy;
              lastjoin = '';
              coords.push([x, y, '', x1, y1, x2, y2]);
              lastpt[0] = x;
              lastpt[1] = y;
            }
          }
          else if (key === 'turnrt') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 2) {
              var angle = parseFloat(val[0]);
              var lastangle = this.computeLastAngleDegree(coords);
              angle -= lastangle;
              var dist = parseFloat(val[1]);
              dx = dist * Math.cos(angle / 180 * Math.PI);
              dy = dist * Math.sin(angle / 180 * Math.PI);
              if (!Number.isFinite(dx)) { dx = 0; }
              if (!Number.isFinite(dy)) { dy = 0; }
              x = lastpt[0] + dx;
              y = lastpt[1] + dy;
              lastjoin = '';
              coords.push([x, y, '', x1, y1, x2, y2]);
              lastpt[0] = x;
              lastpt[1] = y;
            }
          }
          else if (key === 'flip') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 2) {
              var tx = parseFloat(val[0]);
              var ty = parseFloat(val[1]);
              if (coords.length > 1 && Number.isFinite(tx) && Number.isFinite(ty)) {
                [dx, dy] = this.computeMirroredPointOffset(coords, tx, ty);
                if (Number.isFinite(dx) && Number.isFinite(dy)) {
                  x = tx + dx;
                  y = ty + dy;
                  lastjoin = '';
                  coords.push([x, y, '', x1, y1, x2, y2]);
                  lastpt[0] = x;
                  lastpt[1] = y;
                }
              }
            }
          }
          else if (key === 'l') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 2) {
              dx = parseFloat(val[0]);
              dy = parseFloat(val[1]);
              if (Number.isFinite(dy) && Number.isFinite(dx)) {
                x = lastpt[0] + dx;
                y = lastpt[1] + dy;
                lastjoin = '';
                coords.push([x, y, '', x1, y1, x2, y2]);
                lastpt[0] = x;
                lastpt[1] = y;
              }
            }
          }
          else if (key === 'h') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 1) {
              dx = parseFloat(val[0]);
              dy = 0;
              if (Number.isFinite(dy) && Number.isFinite(dx)) {
                x = lastpt[0] + dx;
                y = lastpt[1] + dy;
                lastjoin = '';
                coords.push([x, y, '', x1, y1, x2, y2]);
                lastpt[0] = x;
                lastpt[1] = y;
              }
            }
          }
          else if (key === 'v') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 1) {
              dy = parseFloat(val[0]);
              dx = 0;
              if (Number.isFinite(dy) && Number.isFinite(dx)) {
                x = lastpt[0] + dx;
                y = lastpt[1] + dy;
                lastjoin = '';
                coords.push([x, y, '', x1, y1, x2, y2]);
                lastpt[0] = x;
                lastpt[1] = y;
              }
            }
          }
          else if (key === 'c') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 6) {
              x1 = lastpt[0] + parseFloat(val[0]);
              y1 = lastpt[1] + parseFloat(val[1]);
              x2 = lastpt[0] + parseFloat(val[2]);
              y2 = lastpt[1] + parseFloat(val[3]);
              x = lastpt[0] + parseFloat(val[4]);
              y = lastpt[1] + parseFloat(val[5]);
              if (Number.isFinite(x1) &&
                Number.isFinite(y1) &&
                Number.isFinite(x2) &&
                Number.isFinite(y2) &&
                Number.isFinite(x) &&
                Number.isFinite(y)) {
                lastjoin = 'cubic';
                coords.push([x, y, 'C', x1, y1, x2, y2]);
                lastpt[0] = x;
                lastpt[1] = y;
              }
            }
          }
          else if (key === 's') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 4) {
              if (lastjoin === 'quadrilatic') {
                [x1,y1] = this.MIRROR([x1,y1],lastpt);
              } else if (lastjoin === 'cubic') {
                [x1,y1] = this.MIRROR([x2,y2],lastpt);
              } else {
                [x1,y1] = lastpt;
              }
              x2 = lastpt[0] + parseFloat(val[0]);
              y2 = lastpt[1] + parseFloat(val[1]);
              x = lastpt[0] + parseFloat(val[2]);
              y = lastpt[1] + parseFloat(val[3]);
              if (Number.isFinite(x1) &&
                Number.isFinite(y1) &&
                Number.isFinite(x2) &&
                Number.isFinite(y2) &&
                Number.isFinite(x) &&
                Number.isFinite(y)) {
                lastjoin = 'cubic';
                coords.push([x, y, 'C', x1, y1, x2, y2]);
                lastpt[0] = x;
                lastpt[1] = y;
              }
            }
          }
          else if (key === 'a') {
          /// [a:rx,ry,angle,bigarcflag,sweepflag,dx,dy] 
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 7) {
              let X1 = lastpt[0];
              let Y1 = lastpt[1];
              let X2 = lastpt[0] + parseFloat(val[5]);
              let Y2 = lastpt[1] + parseFloat(val[6]);
              let Rx = parseFloat(val[0]);
              let Ry = parseFloat(val[1]);
              let Phi = parseFloat(val[2]);
              let bigarcflag = parseInt(val[3]);
              let sweepflag = parseInt(val[4]);
              if (Number.isFinite(X1) &&
                  Number.isFinite(Y1) &&
                  Number.isFinite(X2) &&
                  Number.isFinite(Y2) &&
                  Number.isFinite(Rx) &&
                  Number.isFinite(Ry) &&
                  Number.isFinite(Phi) &&
                  Number.isFinite(bigarcflag) &&
                  Number.isFinite(sweepflag)) {
                lastjoin = 'arcpath';
                coords.push([X2, Y2, 'A', Rx,Ry,Phi,bigarcflag,sweepflag]);
                lastpt[0] = X2;
                lastpt[1] = Y2;
              }
            }
          }
          else if (key === 'q') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 4) {
              x1 = lastpt[0] + parseFloat(val[0]);
              y1 = lastpt[1] + parseFloat(val[1]);
              x = lastpt[0] + parseFloat(val[2]);
              y = lastpt[1] + parseFloat(val[3]);
              if (Number.isFinite(x1) &&
                Number.isFinite(y1) &&
                Number.isFinite(x) &&
                Number.isFinite(y)) {
                ///NOTE: need to convert to cubic
                //let [C0,C1,C2,C3] = this.quadrilaticToCubic(lastpt,[x1,y1],[x,y]);
                coords.push([x, y, 'Q', x1, y1]);
                lastpt[0] = x;
                lastpt[1] = y;
                lastjoin = 'quadrilatic';
              }
            }
          }
          else if (key === 't') {
            var val = val.split(',');
            var val = val.map(x => x.trim());
            if (val.length == 2) {
              x = lastpt[0] + parseFloat(val[0]);
              y = lastpt[1] + parseFloat(val[1]);
              if (lastjoin === 'quadrilatic') {
                [x1,y1] = this.MIRROR([x1,y1],lastpt);
              } else if (lastjoin === 'cubic') {
                [x1,y1] = this.MIRROR([x2,y2],lastpt);
              } else {
                [x1,y1] = lastpt;
              }
              if (Number.isFinite(x1) &&
                Number.isFinite(y1) &&
                Number.isFinite(x) &&
                Number.isFinite(y)) {
                ///last control point for Q is saved as x1/y1, we need
                ///to mirror it again the lastpt
                ///NOTE: need to convert to cubic
                //let [C0,C1,C2,C3] = this.quadrilaticToCubic(lastpt,[x1,y1],[x,y]);
                coords.push([x, y, 'Q', x1, y1]);
                lastpt[0] = x;
                lastpt[1] = y;
                lastjoin = 'quadrilatic';
              }
            }
          }
        }
        continue;
      }

      if ((v = this.re_dashdot.exec(line)) !== null) {
        var d = v[1].trim();
        line = v[2];

        if (d === '..') {
          if (lastjoin !== 'hobby') {
            hobby_p = [];
            hobby_p.push([lastpt[0], lastpt[1]]);
            lastjoin = 'hobby';
          }
        } else {
          ///NOTE: it is a dash, which terminates it
          hobby_p = [];
          lastjoin = '';
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

    return coords;
  }

  computeAngleDegree(px, py, tx, ty) {
    var dx1 = tx - px;
    var dy1 = ty - py;
    var ang1 = Math.atan2(dy1, dx1) / Math.PI * 180;
    if (ang1 < 0) { ang1 += 360; }
    return ang1;
  }

  computeLastAngleDegree(coords) {
    var n = coords.length;
    if (n < 2) {
      return 0;
    }
    var sx = coords[n - 2][0];
    var sy = coords[n - 2][1];
    var px = coords[n - 1][0];
    var py = coords[n - 1][1];
    return this.computeAngleDegree(sx, sy, px, py);
  }

  computeMirroredPointOffset(coords, tx, ty) {
    /// This function is to compute the offset to a new point that is the
    /// mirror reflection of the current point (tx,ty) off the line formed
    /// by the last two points in the coords.
    var n = coords.length;
    if (n < 2) {
      return [tx, ty];
    }
    var sx = coords[n - 2][0];
    var sy = coords[n - 2][1];
    var px = coords[n - 1][0];
    var py = coords[n - 1][1];
    px -= sx;
    py -= sy;
    tx -= sx;
    ty -= sy;
    ///console.log('computeMirroredPointOffset: adjusted: tx=',tx,' ty=',ty);
    var magni = Math.sqrt(px * px + py * py);
    px /= magni;///unit vector
    py /= magni;///unit vector
    ///console.log('computeMirroredPointOffset: unit: px=',px,' py=',py);
    var dotprod = px * tx + py * ty;
    ///console.log('computeMirroredPointOffset: dotprod=',dotprod);
    var nx = dotprod * px;
    var ny = dotprod * py;
    ///console.log('computeMirroredPointOffset: nx=',nx,' ny=',ny);
    var dx = nx - tx;
    var dy = ny - ty;
    dx *= 2;
    dy *= 2;
    ///console.log('computeMirroredPointOffset: adjusted: dx=',dx,' dy=',dy);

    return [dx, dy];

  }

  computeLineIntersection(p0, p1, p2, p3) {
    /// this is to compute the intersection of two lines p0--p1 and p2--p3
    let [A1, B1, C1] = this.computeStandardLineForm(p0, p1);
    let [A2, B2, C2] = this.computeStandardLineForm(p2, p3);
    let y = (A1 * C2 - A2 * C1) / (A1 * B2 - A2 * B1);
    let x = (C1 * B2 - C2 * B1) / (A1 * B2 - A2 * B1);
    return [x, y];
  }

  computeStandardLineForm(p1, p2) {
    let [x1, y1] = p1;
    let [x2, y2] = p2;
    let A = y2 - y1;
    let B = x1 - x2;
    let C = A * x1 + B * y1;
    ///console.log('A=',A);
    ///console.log('B=',B);
    ///console.log('C=',C);
    return [A, B, C];
  }

  computeCircleLineIntersection(rsq, A, B, C) {
    ///return an array of four points: x1,y1,x2,y2
    let something = (A * A + B * B) * (B * B * rsq - C * C) + A * A * C * C;
    let x1 = (A * C + Math.sqrt(something)) / (A * A + B * B);
    let y1 = (C - A * x1) / B;
    let x2 = (A * C - Math.sqrt(something)) / (A * A + B * B);
    let y2 = (C - A * x2) / B;
    return [x1, y1, x2, y2];
  }

  assertColor(val, def_val) {
    ///such as 'red', 'rgb(200,100,123)'        
    var re_colorrgb = /^rgb\((\d+)\,(\d+)\,(\d+)\)$/;
    var re_colorname = /^([A-Za-z]+)$/;
    var v = null;
    if (!val) {
      return def_val;
    }
    if ((v = re_colorrgb.exec(val)) !== null) {
      return [v[1],v[2],v[3]];
    } else if ((v = re_colorname.exec(val)) !== null) {
      return val;
    } else {
      return def_val;
    }
  }

  assertLength(val, def_val) {
    if (!val) {
      return def_val;
    }
    var re = /^([\d\.]*)(px|pt|mm|cm|in|)$/
    var v;
    if ((v = re.exec(val)) !== null) {
      var num = parseFloat(v[1]);
      var unit = v[2];
      if (unit === '') {
        return num;
      }
      else if (unit === 'px') {
        return num;///SVG unit where 1px = 0.75pt
      }
      else if (unit==='pt'){
        return num*1.3333;
      } 
      else if (unit==='mm'){
        return num*3.78;
      } 
      else if (unit==='cm'){
        return num*37.8;
      }
      else if (unit==='in'){
        return num*96.0;
      }
    } else {
      return def_val;
    }
  }

  to360(val) {
    if (val < 0) {
      val += 360;
    } else if (val > 360) {
      val -= 360;
    }
    return val;
  }

  coordsToStr(coords) {
    ///***NOTE: returns [str,bad_vars]
    ///***NOTE: i.e: (1,2)..(2,3)--cycle
    /// pt[0]: [1,2,'','','']
    /// pt[1]: [2,3,'..','','']
    /// pt[2]: ['cycle','','--','','']
    var o = [];
    var iscycle = 0;
    var x0 = null;
    var y0 = null;
    for (var i in coords) {
      var pt = coords[i];
      var x = pt[0];/// cannot do fix here because x could be a string
      var y = pt[1];/// cannot do fix here because x could be a string
      if (x0 === null) { x0 = x; }
      if (y0 === null) { y0 = y; }
      var join = pt[2];
      ///doing some fixes
      join = join || '';
      if (i == 0) {
        join = '';
      }
      ///In case we have a CUBIC BEZIER curve, then pt1 and pt2 are the control points
      if (i == 0) {
        o.push(`(${this.fix(x)},${this.fix(y)})`);
      }
      else if (join == 'C') {
        var p1x = pt[3];/// CUBIC BEZIER curve controlpoint 1x
        var p1y = pt[4];/// CUBIC BEZIER curve controlpoint 1y
        var p2x = pt[5];/// CUBIC BEZIER curve controlpoint 2x
        var p2y = pt[6];/// CUBIC BEZIER curve controlpoint 2y
        o.push(`[C:${this.fix(p1x)},${this.fix(p1y)},${this.fix(p2x)},${this.fix(p2y)},${this.fix(x)},${this.fix(y)}]`);
      }
      else if (join == 'A') {
        var i3 = pt[3];/// CUBIC BEZIER curve controlpoint 1x
        var i4 = pt[4];/// CUBIC BEZIER curve controlpoint 1y
        var i5 = pt[5];/// CUBIC BEZIER curve controlpoint 2x
        var i6 = pt[6];/// CUBIC BEZIER curve controlpoint 2y
        var i7 = pt[7];/// CUBIC BEZIER curve controlpoint 2y
        o.push(`[A:${this.fix(i3)},${this.fix(i4)},${this.fix(i5)},${this.fix(i6)},${this.fix(i7)},${this.fix(x)},${this.fix(y)}]`);
      }
      else if (join == 'cycle') {
        iscycle = 1;
        o.push(`()`);
        break;
      }
      else {
        o.push(`(${this.fix(x)},${this.fix(y)})`);
      }
    }
    return o.join(' ');
  }

  quadrilaticToCubic(P0,P1,P2) {
    var C0=[0,0];
    var C1=[0,0];
    var C2=[0,0];
    var C3=[0,0];
    C0 = this.PT(P0);
    C1 = this.AT(this.ST(1/3,P0), this.ST(2/3,P1));
    C2 = this.AT(this.ST(2/3,P1), this.ST(1/3,P2));
    C3 = this.PT(P2);
    return [C0,C1,C2,C3];
  }

  PT(v){
    return [v[0],v[1]];
  }
  ST(scalar,v){
    return [parseFloat(scalar)*parseFloat(v[0]),
            parseFloat(scalar)*parseFloat(v[1])];
  }
  AT(v,w){
    return [parseFloat(v[0])+parseFloat(w[0]),
            parseFloat(v[1])+parseFloat(w[1])];
  }
  MIRROR(p,c){
    ///c is the mirror 
    ///p is the point on one side of the mirror
    ///RETURN; the mirror point of 'p' with respect to 'c'
    var dx = c[0] - p[0];
    var dy = c[1] - p[1];
    var x = c[0] + dx;
    var y = c[1] + dy;
    return [x,y];
  }

  readParamsLine(str) {
    var pp = str.split(',');
    var pp = pp.map( x => x.trim() );
    return pp;
  }

}

module.exports = { NitrilePreviewDiagram };
