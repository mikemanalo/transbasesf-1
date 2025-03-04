Ext.namespace("gxp.form");
gxp.form.ColorField = Ext.extend(Ext.form.TextField, {
  cssColors: {
    aqua: "#00FFFF",
    black: "#000000",
    blue: "#0000FF",
    fuchsia: "#FF00FF",
    gray: "#808080",
    green: "#008000",
    lime: "#00FF00",
    maroon: "#800000",
    navy: "#000080",
    olive: "#808000",
    purple: "#800080",
    red: "#FF0000",
    silver: "#C0C0C0",
    teal: "#008080",
    white: "#FFFFFF",
    yellow: "#FFFF00"
  },
  defaultBackground: "#ffffff",
  initComponent: function() {
    if (this.value) this.value = this.hexToColor(this.value);
    gxp.form.ColorField.superclass.initComponent.call(this);
    this.on({
      render: this.colorField,
      valid: this.colorField,
      scope: this
    })
  },
  isDark: function(a) {
    var b = !1;
    if (a) var b = parseInt(a.substring(1, 3), 16) / 255,
        c = parseInt(a.substring(3, 5), 16) / 255,
        a = parseInt(a.substring(5, 7), 16) / 255,
        b = 0.5 > 0.299 * b + 0.587 * c + 0.144 * a;
    return b
  },
  colorField: function() {
    var a = this.colorToHex(this.getValue()) || this.defaultBackground;
    this.getEl().setStyle({
      background: a,
      color: this.isDark(a) ? "#ffffff" : "#000000"
    })
  },
  expand3DigitHex: function(a) {
    a && 4 == a.length && 0 == a.indexOf("#") && (a = "#" + a.charAt(1) + a.charAt(1) + a.charAt(2) + a.charAt(2) + a.charAt(3) + a.charAt(3));
    return a
  },
  getHexValue: function() {
    return this.colorToHex(gxp.form.ColorField.superclass.getValue.apply(this, arguments))
  },
  getValue: function() {
    var a = this.getHexValue(),
        b = this.initialConfig.value;
    a === this.hexToColor(b) && (a = b);
    return a
  },
  setValue: function(a) {
    gxp.form.ColorField.superclass.setValue.apply(this, [this.hexToColor(a)])
  },
  colorToHex: function(a) {
    if (!a) return a;
    a = this.expand3DigitHex(a);
    return a.match(/^#[0-9a-f]{6}$/i) ? a : this.cssColors[a.toLowerCase()] || null
  },
  hexToColor: function(a) {
    if (!a) return a;
    var a = this.expand3DigitHex(a),
        b;
    for (b in this.cssColors) if (this.cssColors[b] == a.toUpperCase()) {
      a = b;
      break
    }
    return a
  }
});
Ext.reg("gxp_colorfield", gxp.form.ColorField);
Ext.namespace("gxp");
gxp.ColorManager = function(a) {
  Ext.apply(this, a)
};
Ext.apply(gxp.ColorManager.prototype, {
  field: null,
  init: function(a) {
    this.register(a)
  },
  destroy: function() {
    this.field && this.unregister(this.field)
  },
  register: function(a) {
    this.field && this.unregister(this.field);
    this.field = a;
    a.on({
      focus: this.fieldFocus,
      destroy: this.destroy,
      scope: this
    })
  },
  unregister: function(a) {
    a.un("focus", this.fieldFocus, this);
    a.un("destroy", this.destroy, this);
    gxp.ColorManager.picker && a == this.field && gxp.ColorManager.picker.un("pickcolor", this.setFieldValue, this);
    this.field = null
  },
  fieldFocus: function() {
    gxp.ColorManager.pickerWin ? gxp.ColorManager.picker.purgeListeners() : (gxp.ColorManager.picker = new Ext.ColorPalette, gxp.ColorManager.pickerWin = new Ext.Window({
      title: "Color Picker",
      closeAction: "hide",
      autoWidth: !0,
      autoHeight: !0
    }));
    var a = {
      select: this.setFieldValue,
      scope: this
    },
        b = this.getPickerValue();
    if (b) {
      var c = [].concat(gxp.ColorManager.picker.colors);
      if (!~c.indexOf(b)) {
        if (gxp.ColorManager.picker.ownerCt) gxp.ColorManager.pickerWin.remove(gxp.ColorManager.picker), gxp.ColorManager.picker = new Ext.ColorPalette;
        c.push(b);
        gxp.ColorManager.picker.colors =
        c
      }
      gxp.ColorManager.pickerWin.add(gxp.ColorManager.picker);
      gxp.ColorManager.pickerWin.doLayout();
      gxp.ColorManager.picker.rendered ? gxp.ColorManager.picker.select(b) : a.afterrender = function() {
        gxp.ColorManager.picker.select(b)
      }
    }
    gxp.ColorManager.picker.on(a);
    gxp.ColorManager.pickerWin.show()
  },
  setFieldValue: function(a, b) {
    this.field.isVisible() && this.field.setValue("#" + b)
  },
  getPickerValue: function() {
    var a = this.field;
    if (a = a.getHexValue ? a.getHexValue() || a.defaultBackground : a.getValue()) return a.substr(1)
  }
});
(function() {
  Ext.util.Observable.observeClass(gxp.form.ColorField);
  gxp.form.ColorField.on({
    render: function(a) {
      (new gxp.ColorManager).register(a)
    }
  })
})();
gxp.ColorManager.picker = null;
gxp.ColorManager.pickerWin = null;
Ext.ns("gxp.data");
gxp.data.AutoCompleteProxy = Ext.extend(GeoExt.data.ProtocolProxy, {
  doRequest: function(a, b, c, d, e, f, g) {
    if (c.query) c.filter = new OpenLayers.Filter.Comparison({
      type: OpenLayers.Filter.Comparison.LIKE,
      matchCase: !1,
      property: this.protocol.propertyNames[0],
      value: "*" + c.query + "*"
    }), delete c.query;
    gxp.data.AutoCompleteProxy.superclass.doRequest.apply(this, arguments)
  }
});
Ext.ns("gxp.data");
gxp.data.AutoCompleteReader = Ext.extend(GeoExt.data.FeatureReader, {
  read: function(a) {
    var b = this.meta.uniqueField;
    this.features = [];
    for (var c = 0, d = a.features.length; c < d; ++c) {
      var e = a.features[c];
      !1 === this.isDuplicate(b, e.attributes[b]) ? this.features.push(e) : e.destroy()
    }
    a.features = this.features;
    return gxp.data.AutoCompleteReader.superclass.read.apply(this, arguments)
  },
  isDuplicate: function(a, b) {
    for (var c = 0, d = this.features.length; c < d; ++c) if (this.features[c].attributes[a] === b) return !0;
    return !1
  }
});
Ext.ns("gxp.util");
gxp.util.color = function() {
  function a(a, b, c) {
    0 > c && (c += 1);
    1 < c && (c -= 1);
    return c < 1 / 6 ? a + 6 * (b - a) * c : 0.5 > c ? b : c < 2 / 3 ? a + 6 * (b - a) * (2 / 3 - c) : a
  }
  var b = {},
      c = {
      aliceblue: "#f0f8ff",
      antiquewhite: "#faebd7",
      aqua: "#00ffff",
      aquamarine: "#7fffd4",
      azure: "#f0ffff",
      beige: "#f5f5dc",
      bisque: "#ffe4c4",
      black: "#000000",
      blanchedalmond: "#ffebcd",
      blue: "#0000ff",
      blueviolet: "#8a2be2",
      brown: "#a52a2a",
      burlywood: "#deb887",
      cadetblue: "#5f9ea0",
      chartreuse: "#7fff00",
      chocolate: "#d2691e",
      coral: "#ff7f50",
      cornflowerblue: "#6495ed",
      cornsilk: "#fff8dc",
      crimson: "#dc143c",
      cyan: "#00ffff",
      darkblue: "#00008b",
      darkcyan: "#008b8b",
      darkgoldenrod: "#b8860b",
      darkgray: "#a9a9a9",
      darkgreen: "#006400",
      darkkhaki: "#bdb76b",
      darkmagenta: "#8b008b",
      darkolivegreen: "#556b2f",
      darkorange: "#ff8c00",
      darkorchid: "#9932cc",
      darkred: "#8b0000",
      darksalmon: "#e9967a",
      darkseagreen: "#8fbc8f",
      darkslateblue: "#483d8b",
      darkslategray: "#2f4f4f",
      darkturquoise: "#00ced1",
      darkviolet: "#9400d3",
      deeppink: "#ff1493",
      deepskyblue: "#00bfff",
      dimgray: "#696969",
      dodgerblue: "#1e90ff",
      firebrick: "#b22222",
      floralwhite: "#fffaf0",
      forestgreen: "#228b22",
      fuchsia: "#ff00ff",
      gainsboro: "#dcdcdc",
      ghostwhite: "#f8f8ff",
      gold: "#ffd700",
      goldenrod: "#daa520",
      gray: "#808080",
      green: "#008000",
      greenyellow: "#adff2f",
      honeydew: "#f0fff0",
      hotpink: "#ff69b4",
      indianred: "#cd5c5c",
      indigo: "#4b0082",
      ivory: "#fffff0",
      khaki: "#f0e68c",
      lavender: "#e6e6fa",
      lavenderblush: "#fff0f5",
      lawngreen: "#7cfc00",
      lemonchiffon: "#fffacd",
      lightblue: "#add8e6",
      lightcoral: "#f08080",
      lightcyan: "#e0ffff",
      lightgoldenrodyellow: "#fafad2",
      lightgrey: "#d3d3d3",
      lightgreen: "#90ee90",
      lightpink: "#ffb6c1",
      lightsalmon: "#ffa07a",
      lightseagreen: "#20b2aa",
      lightskyblue: "#87cefa",
      lightslategray: "#778899",
      lightsteelblue: "#b0c4de",
      lightyellow: "#ffffe0",
      lime: "#00ff00",
      limegreen: "#32cd32",
      linen: "#faf0e6",
      magenta: "#ff00ff",
      maroon: "#800000",
      mediumaquamarine: "#66cdaa",
      mediumblue: "#0000cd",
      mediumorchid: "#ba55d3",
      mediumpurple: "#9370d8",
      mediumseagreen: "#3cb371",
      mediumslateblue: "#7b68ee",
      mediumspringgreen: "#00fa9a",
      mediumturquoise: "#48d1cc",
      mediumvioletred: "#c71585",
      midnightblue: "#191970",
      mintcream: "#f5fffa",
      mistyrose: "#ffe4e1",
      moccasin: "#ffe4b5",
      navajowhite: "#ffdead",
      navy: "#000080",
      oldlace: "#fdf5e6",
      olive: "#808000",
      olivedrab: "#6b8e23",
      orange: "#ffa500",
      orangered: "#ff4500",
      orchid: "#da70d6",
      palegoldenrod: "#eee8aa",
      palegreen: "#98fb98",
      paleturquoise: "#afeeee",
      palevioletred: "#d87093",
      papayawhip: "#ffefd5",
      peachpuff: "#ffdab9",
      peru: "#cd853f",
      pink: "#ffc0cb",
      plum: "#dda0dd",
      powderblue: "#b0e0e6",
      purple: "#800080",
      red: "#ff0000",
      rosybrown: "#bc8f8f",
      royalblue: "#4169e1",
      saddlebrown: "#8b4513",
      salmon: "#fa8072",
      sandybrown: "#f4a460",
      seagreen: "#2e8b57",
      seashell: "#fff5ee",
      sienna: "#a0522d",
      silver: "#c0c0c0",
      skyblue: "#87ceeb",
      slateblue: "#6a5acd",
      slategray: "#708090",
      snow: "#fffafa",
      springgreen: "#00ff7f",
      steelblue: "#4682b4",
      tan: "#d2b48c",
      teal: "#008080",
      thistle: "#d8bfd8",
      tomato: "#ff6347",
      turquoise: "#40e0d0",
      violet: "#ee82ee",
      wheat: "#f5deb3",
      white: "#ffffff",
      whitesmoke: "#f5f5f5",
      yellow: "#ffff00",
      yellowgreen: "#9acd32"
      };
  rgb = b.rgb = function(a) {
    var a = a.toLowerCase(),
        b;
    "#" === a[0] ? b = a : a in c ? b = c[a] : a.match(/^[0-9a-f]{6}$/) && (b = "#" + a);
    var a = b,
        f;
    a && (f = [parseInt(a.substr(1, 2), 16), parseInt(a.substr(3, 2), 16), parseInt(a.substr(5, 2), 16)]);
    return f
  };
  hex = b.hex = function(a) {
    return ["#", Number(a[0]).toString(16), Number(a[1]).toString(16), Number(a[2]).toString(16)].join("")
  };
  b.rgb2hsl = function(a) {
    var b = a[0] / 255,
        c = a[1] / 255,
        a = a[2] / 255,
        g = Math.max(b, c, a),
        h = Math.min(b, c, a),
        j, k = (g + h) / 2;
    if (g == h) j = h = 0;
    else {
      var l = g - h,
          h = 0.5 < k ? l / (2 - g - h) : l / (g + h);
      switch (g) {
      case b:
        j = (c - a) / l + (c < a ? 6 : 0);
        break;
      case c:
        j = (a - b) / l + 2;
        break;
      case a:
        j = (b - c) / l + 4
      }
      j /= 6
    }
    return [j, h, k]
  };
  b.hsl2rgb = function(b) {
    var c, f;
    f = b[0];
    c = b[1];
    b = b[2];
    if (0 == c) c = b = f = b;
    else {
      var g = 0.5 > b ? b * (1 + c) : b + c - b * c,
          h = 2 * b - g;
      c = a(h, g, f + 1 / 3);
      b = a(h, g, f);
      f = a(h, g, f - 1 / 3)
    }
    return [Math.round(255 * c), Math.round(255 * b), Math.round(255 * f)]
  };
  return b
}();
Ext.ns("gxp.util");
gxp.util.style = function() {
  function a(a, b, l) {
    var n = Ext.apply({}, a);
    Ext.iterate(a, function(m) {
      if (g.test(m)) {
        var r = d(e(a[m])),
            o = d(e(b[m]));
        if (r && o) {
          for (var q = [], s = r.length - 1; 0 <= s; --s) q[s] = r[s] + l * (o[s] - r[s]);
          n[m] = f(c(q))
        }
      } else h.test(m) && (r = null, m in a && m in b && (o = a[m], q = b[m], o.literal && q.literal && (o = parseFloat(o.text), q = parseFloat(q.text), r = o + l * (q - o))), null !== r && (n[m] = r))
    });
    return n
  }
  var b = {},
      c = gxp.util.color.hsl2rgb,
      d = gxp.util.color.rgb2hsl,
      e = gxp.util.color.rgb,
      f = gxp.util.color.hex,
      g = /Color$/,
      h = /(Width|Height|[rR]otation|Opacity|Size)$/;
  b.interpolateSymbolizers = function(b, c, d) {
    for (var e, f, g = [], h = 0, q = b.length; h < q; ++h) {
      e = b[h];
      f = c[h];
      if (!f) throw Error("Start style and end style must have equal number of parts.");
      g[h] = a(e, f, d)
    }
    return g
  };
  return b
}();
Ext.ns("gxp.data");
gxp.data.FeatureTypeClassifier = Ext.extend(Ext.util.Observable, {
  store: null,
  constructor: function(a) {
    gxp.data.FeatureTypeClassifier.superclass.constructor.apply(this, arguments);
    Ext.apply(this, a)
  },
  classify: function(a, b, c, d, e) {
    this.store.filter("group", a);
    var f, g, h = this.store.getCount();
    0 < h && (f = this.store.getAt(0).get("symbolizers"), g = this.store.getAt(h - 1).get("symbolizers"));
    h = [function(h) {
      var k, l = 0,
          n = h.getCount(),
          m;
      for (h.each(function(d) {
        k = l / n;
        var e = this.store.getAt(l);
        e || (e = new this.store.recordType(Ext.apply({}, m)), this.store.add([e]));
        m = e.data;
        d = d.get("filter");
        f && g && e.set("symbolizers", gxp.util.style.interpolateSymbolizers(f, g, k));
        e.set("filter", d);
        e.set("label", d.lowerBoundary + "-" + d.upperBoundary);
        e.set("group", a);
        e.set("name", Ext.applyIf({
          group: a,
          method: b,
          args: c
        }, e.get("name")));
        l++
      }, this); h = this.store.getAt(l);) this.store.remove(h), l++;
      this.store.clearFilter();
      d && d.call(e)
    }];
    h.unshift.apply(h, c);
    this.methods[b].apply(this, h)
  },
  methods: {
    graduated: function(a, b, c, d) {
      b = {
        identifier: "gs:FeatureClassStats",
        dataInputs: [{
          identifier: "features",
          reference: {
            mimeType: "text/xml; subtype=wfs-collection/1.0",
            href: "http://geoserver/wfs",
            method: "POST",
            body: {
              wfs: {
                version: "1.0.0",
                outputFormat: "GML2",
                featureType: this.store.reader.raw.layerName
              }
            }
          }
        }, {
          identifier: "attribute",
          data: {
            literalData: {
              value: a
            }
          }
        }, {
          identifier: "classes",
          data: {
            literalData: {
              value: b
            }
          }
        }, {
          identifier: "method",
          data: {
            literalData: {
              value: c
            }
          }
        }],
        responseForm: {
          rawDataOutput: {
            mimeType: "text/xml",
            identifier: "results"
          }
        }
      };
      return new Ext.data.XmlStore({
        record: "Class",
        fields: [{
          name: "count",
          mapping: "@count"
        }, {
          name: "filter",
          convert: function(b, c) {
            return new OpenLayers.Filter.Comparison({
              type: OpenLayers.Filter.Comparison.BETWEEN,
              property: a,
              lowerBoundary: parseFloat(c.getAttribute("lowerBound")),
              upperBoundary: parseFloat(c.getAttribute("upperBound"))
            })
          }
        }],
        proxy: new Ext.data.HttpProxy({
          url: "/geoserver/wps",
          method: "POST",
          xmlData: (new OpenLayers.Format.WPSExecute).write(b)
        }),
        autoLoad: !0,
        listeners: {
          load: d,
          scope: this
        }
      })
    }
  }
});
Ext.ns("gxp.data");
gxp.data.GroupStyleReader = Ext.extend(GeoExt.data.StyleReader, {
  onMetaChange: function() {
    gxp.data.GroupStyleReader.superclass.onMetaChange.apply(this, arguments);
    var a = this.recordType,
        b = !1;
    a.prototype.set = Ext.createInterceptor(this.recordType.prototype.set, function(c, d) {
      if (!b && "filter" === c) {
        b = !0;
        var e = this.store,
            f = this.get("filter");
        BETWEEN = OpenLayers.Filter.Comparison.BETWEEN;
        f instanceof OpenLayers.Filter && "string" === typeof d && (d = OpenLayers.Format.CQL.prototype.read(d));
        var g, h = e.indexOf(this);
        if (h < e.getCount() - 1 && (g = d.type === BETWEEN ? "upperBoundary" : "value", d[g] !== f[g])) {
          var j = e.getAt(h + 1),
              k = j.get("filter").clone();
          k[k.type === BETWEEN ? "lowerBoundary" : "value"] = d[g];
          j.set("filter", k)
        }
        0 < h && (g = d.type === BETWEEN ? "lowerBoundary" : "value", d[g] !== f[g] && (e = e.getAt(h - 1), f = e.get("filter").clone(), f[f.type === BETWEEN ? "upperBoundary" : "value"] = d[g], e.set("filter", f)));
        a.prototype.set.apply(this, [c, d]);
        return b = !1
      }
    })
  }
});
Ext.ns("gxp.data");
gxp.data.RuleGroupReader = Ext.extend(GeoExt.data.StyleReader, {
  constructor: function(a, b) {
    a = a || {
      fields: ["symbolizers", "filter",
      {
        name: "label",
        mapping: "title"
      }, {
        name: "name",
        convert: function(a, b) {
          var e;
          try {
            e = Ext.util.JSON.decode(a)
          } catch (f) {
            e = {
              group: "Custom",
              name: a
            }
          }
          b.group = e.group;
          return e
        }
      }, "group", "description", "elseFilter", "minScaleDenominator", "maxScaleDenominator"],
      storeToData: function(a) {
        var a = GeoExt.data.StyleReader.metaData.rules.storeToData(a),
            b, e;
        for (e = a.length - 1; 0 <= e; --e) if (b = a[e], "object" === typeof b.name) b.name = "Custom" === b.group ? b.name.name : Ext.util.JSON.encode(b.name), delete b.group;
        return a
      }
    };
    gxp.data.RuleGroupReader.superclass.constructor.apply(this, [a, b])
  }
});
Ext.namespace("gxp.data");
gxp.data.WFSProtocolProxy = Ext.extend(GeoExt.data.ProtocolProxy, {
  setFilter: function(a) {
    this.protocol.filter = a;
    this.protocol.options.filter = a
  },
  constructor: function(a) {
    Ext.applyIf(a, {
      version: "1.1.0"
    });
    if (!(this.protocol && this.protocol instanceof OpenLayers.Protocol)) a.protocol = new OpenLayers.Protocol.WFS(Ext.apply({
      version: a.version,
      srsName: a.srsName,
      url: a.url,
      featureType: a.featureType,
      featureNS: a.featureNS,
      geometryName: a.geometryName,
      schema: a.schema,
      filter: a.filter,
      maxFeatures: a.maxFeatures,
      multi: a.multi
    }, a.protocol));
    gxp.data.WFSProtocolProxy.superclass.constructor.apply(this, arguments)
  },
  doRequest: function(a, b, c, d, e, f, g) {
    delete c.xaction;
    if (a === Ext.data.Api.actions.read) this.load(c, d, e, f, g);
    else {
      b instanceof Array || (b = [b]);
      var h = Array(b.length),
          j;
      Ext.each(b, function(a, b) {
        h[b] = a.getFeature();
        j = h[b];
        j.modified = Ext.apply(j.modified || {}, {
          attributes: Ext.apply(j.modified && j.modified.attributes || {}, a.modified)
        })
      }, this);
      var k = {
        action: a,
        records: b,
        callback: e,
        scope: f
      },
          a = {
          callback: function(a) {
            this.onProtocolCommit(a, k)
          },
          scope: this
          };
      Ext.applyIf(a, c);
      this.protocol.commit(h, a)
    }
  },
  onProtocolCommit: function(a, b) {
    if (a.success()) {
      var c = a.reqFeatures,
          d, e, f = [],
          g = a.insertIds || [],
          h, j, k = 0;
      for (h = 0, j = c.length; h < j; ++h) if (e = c[h], d = e.state) {
        if (d == OpenLayers.State.DELETE) f.push(e);
        else if (d == OpenLayers.State.INSERT) e.fid = g[k], ++k;
        else if (e.modified) e.modified = {};
        e.state = null
      }
      for (h = 0, j = f.length; h < j; ++h) e = f[h], e.layer && e.layer.destroyFeatures([e]);
      j = c.length;
      d = Array(j);
      for (h = 0; h < j; ++h) {
        e = c[h];
        d[h] = {
          id: e.id,
          feature: e,
          state: null
        };
        var f = b.records[h].fields,
            l;
        for (l in e.attributes) f.containsKey(l) && (d[h][l] = e.attributes[l])
      }
      b.callback.call(b.scope, d, a.priv, !0)
    } else c = a.priv, 200 <= c.status && 300 > c.status ? this.fireEvent("exception", this, "remote", b.action, b, a.error, b.records) : this.fireEvent("exception", this, "response", b.action, b, c), b.callback.call(b.scope, [], c, !1)
  }
});
Ext.namespace("gxp.data");
gxp.data.WFSFeatureStore = Ext.extend(GeoExt.data.FeatureStore, {
  setOgcFilter: function(a) {
    this.proxy.setFilter(a)
  },
  constructor: function(a) {
    if (!(a.proxy && a.proxy instanceof GeoExt.data.ProtocolProxy)) a.proxy = new gxp.data.WFSProtocolProxy(Ext.apply({
      srsName: a.srsName,
      url: a.url,
      featureType: a.featureType,
      featureNS: a.featureNS,
      geometryName: a.geometryName,
      schema: a.schema,
      filter: a.ogcFilter,
      maxFeatures: a.maxFeatures,
      multi: a.multi
    }, a.proxy));
    if (!a.writer) a.writer = new Ext.data.DataWriter({
      write: Ext.emptyFn
    });
    gxp.data.WFSFeatureStore.superclass.constructor.apply(this, arguments);
    this.reader.extractValues = function(a) {
      return this.readRecords([a.feature]).records[0].data
    }.createDelegate(this.reader);
    this.reader.meta.idProperty = "id";
    this.reader.getId = function(a) {
      return a.id
    }
  }
});
GeoExt.Lang.add("ca", {
  "gxp.menu.LayerMenu.prototype": {
    layerText: "Capa"
  },
  "gxp.plugins.AddLayers.prototype": {
    addActionMenuText: "Afegeix Capes",
    addActionTip: "Afegeix Capes",
    addServerText: "Afegeix servidor",
    addButtonText: "Afegeix Capes",
    untitledText: "Sense T\u00edtol",
    addLayerSourceErrorText: "Error obtenint les capabilities del WMS ({msg}).\nSi us plau, comproveu la URL i torneu-ho a intentar.",
    availableLayersText: "Capes disponibles",
    expanderTemplateText: "<p><b>Resum:</b> {abstract}</p>",
    panelTitleText: "T\u00edtol",
    layerSelectionText: "Veure dades disponibles de:",
    doneText: "Fet",
    uploadText: "Puja dades",
    addFeedActionMenuText: "Add feeds",
    searchText: "Search for layers"
  },
  "gxp.plugins.BingSource.prototype": {
    title: "Capes Bing",
    roadTitle: "Bing Carrerer",
    aerialTitle: "Bing Fotografia A\u00e8ria",
    labeledAerialTitle: "Bing Fotografia A\u00e8ria amb Etiquetes"
  },
  "gxp.plugins.FeatureEditor.prototype": {
    splitButtonText: "Edit",
    createFeatureActionText: "Create",
    editFeatureActionText: "Modify",
    createFeatureActionTip: "Crea nou element",
    editFeatureActionTip: "Edita element existent",
    commitTitle: "Commit message",
    commitText: "Please enter a commit message for this edit:"
  },
  "gxp.plugins.FeatureGrid.prototype": {
    displayFeatureText: "Mostra al mapa",
    firstPageTip: "Primera p\u00e0gina",
    previousPageTip: "P\u00e0gina anterior",
    zoomPageExtentTip: "Ajusta vista a l'extensi\u00f3 de la p\u00e0gina",
    nextPageTip: "P\u00e0gina seg\u00fcent",
    lastPageTip: "P\u00e0gina anterior",
    totalMsg: "Features {1} to {2} of {0}"
  },
  "gxp.plugins.GoogleEarth.prototype": {
    menuText: "Vista 3D",
    tooltip: "Vista 3D"
  },
  "gxp.plugins.GoogleSource.prototype": {
    title: "Capes Google",
    roadmapAbstract: "Mostra carrerer",
    satelliteAbstract: "Mostra imatges de sat\u00e8l\u00b7lit",
    hybridAbstract: "Mostra imatges amb noms de carrer",
    terrainAbstract: "Mostra carrerer amb terreny"
  },
  "gxp.plugins.LayerProperties.prototype": {
    menuText: "Propietats de la capa",
    toolTip: "Propietats de la capa"
  },
  "gxp.plugins.LayerTree.prototype": {
    shortTitle: "Capes",
    rootNodeText: "Capes",
    overlayNodeText: "Capes addicionals",
    baseNodeText: "Capa base"
  },
  "gxp.plugins.LayerManager.prototype": {
    baseNodeText: "Capa base"
  },
  "gxp.plugins.Legend.prototype": {
    menuText: "Mostra Llegenda",
    tooltip: "Mostra Llegenda"
  },
  "gxp.plugins.LoadingIndicator.prototype": {
    loadingMapMessage: "Loading Map..."
  },
  "gxp.plugins.MapBoxSource.prototype": {
    title: "MapBox Layers",
    blueMarbleTopoBathyJanTitle: "Blue Marble Topography & Bathymetry (January)",
    blueMarbleTopoBathyJulTitle: "Blue Marble Topography & Bathymetry (July)",
    blueMarbleTopoJanTitle: "Blue Marble Topography (January)",
    blueMarbleTopoJulTitle: "Blue Marble Topography (July)",
    controlRoomTitle: "Control Room",
    geographyClassTitle: "Geography Class",
    naturalEarthHypsoTitle: "Natural Earth Hypsometric",
    naturalEarthHypsoBathyTitle: "Natural Earth Hypsometric & Bathymetry",
    naturalEarth1Title: "Natural Earth I",
    naturalEarth2Title: "Natural Earth II",
    worldDarkTitle: "World Dark",
    worldLightTitle: "World Light",
    worldPrintTitle: "World Print"
  },
  "gxp.plugins.Measure.prototype": {
    buttonText: "Mesura",
    lengthMenuText: "Longitud",
    areaMenuText: "\u00c0rea",
    lengthTooltip: "Mesura Longitud",
    areaTooltip: "Mesura \u00c0rea",
    measureTooltip: "Mesura"
  },
  "gxp.plugins.Navigation.prototype": {
    menuText: "Despla\u00e7a mapa",
    tooltip: "Despla\u00e7a mapa"
  },
  "gxp.plugins.NavigationHistory.prototype": {
    previousMenuText: "Vista anterior",
    nextMenuText: "Vista seg\u00fcent",
    previousTooltip: "Vista anterior",
    nextTooltip: "Vista seg\u00fcent"
  },
  "gxp.plugins.OSMSource.prototype": {
    title: "Capes OpenStreetMap",
    mapnikAttribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
    osmarenderAttribution: "Daded CC-By-SA de <a href='http://openstreetmap.org/'>OpenStreetMap</a>"
  },
  "gxp.plugins.Print.prototype": {
    buttonText: "Imprimeix",
    menuText: "Imprimeix mapa",
    tooltip: "Imprimeix mapa",
    previewText: "Vista pr\u00e8via",
    notAllNotPrintableText: "No es poden imprimir totes les capes",
    nonePrintableText: "No es pot imprimir cap de les capes del mapa"
  },
  "gxp.plugins.MapQuestSource.prototype": {
    title: "MapQuest Layers",
    osmAttribution: "Tessel\u00b7les cortesia de <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
    osmTitle: "MapQuest OpenStreetMap",
    naipAttribution: "Tessel\u00b7les cortesia de <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
    naipTitle: "MapQuest Imatge"
  },
  "gxp.plugins.QueryForm.prototype": {
    queryActionText: "Consulta",
    queryMenuText: "Consulta layer",
    queryActionTip: "Consulta la capa sel\u00b7leccionada",
    queryByLocationText: "Query by current map extent",
    queryByAttributesText: "Consulta per atributs",
    queryMsg: "Consultant...",
    cancelButtonText: "Cancel\u00b7la",
    noFeaturesTitle: "Sense coincid\u00e8ncies",
    noFeaturesMessage: "La vostra consulta no ha produ\u00eft resultats."
  },
  "gxp.plugins.RemoveLayer.prototype": {
    removeMenuText: "Elimina Capa",
    removeActionTip: "Elimina Capa"
  },
  "gxp.plugins.Styler.prototype": {
    menuText: "Edita Estils",
    tooltip: "Gestiona els estils de les capes"
  },
  "gxp.plugins.WMSGetFeatureInfo.prototype": {
    buttonText: "Identify",
    infoActionTip: "Consulta elements",
    popupTitle: "Informaci\u00f3 dels elements"
  },
  "gxp.plugins.Zoom.prototype": {
    zoomMenuText: "Zoom Box",
    zoomInMenuText: "Apropa",
    zoomOutMenuText: "Allunya",
    zoomTooltip: "Zoom by dragging a box",
    zoomInTooltip: "Apropa",
    zoomOutTooltip: "Allunya"
  },
  "gxp.plugins.ZoomToExtent.prototype": {
    menuText: "Mostra l'extensi\u00f3 total",
    tooltip: "Mostra l'extensi\u00f3 total"
  },
  "gxp.plugins.ZoomToDataExtent.prototype": {
    menuText: "Mostra tota la capa",
    tooltip: "Mostra tota la capa"
  },
  "gxp.plugins.ZoomToLayerExtent.prototype": {
    menuText: "Mostra tota la capa",
    tooltip: "Mostra tota la capa"
  },
  "gxp.plugins.ZoomToSelectedFeatures.prototype": {
    menuText: "Mostra els elements seleccionats",
    tooltip: "Mostra els elements seleccionats"
  },
  "gxp.FeatureEditPopup.prototype": {
    closeMsgTitle: "Desitgeu desar els canvis?",
    closeMsg: "Els canvis en aquest element no s'han desat. Desitja desar-los?",
    deleteMsgTitle: "Desitgeu esborrar l'element?",
    deleteMsg: "Esteu segurs de voler esborrar aquest element?",
    editButtonText: "Edita",
    editButtonTooltip: "Fes que aquest element sigui editable",
    deleteButtonText: "Esborra",
    deleteButtonTooltip: "Esborra aquest element",
    cancelButtonText: "Cancel\u00b7la",
    cancelButtonTooltip: "Deixa d'editar, descarta els canvis",
    saveButtonText: "Desa",
    saveButtonTooltip: "Desa els canvis"
  },
  "gxp.FillSymbolizer.prototype": {
    fillText: "Farcit",
    colorText: "Color",
    opacityText: "Opacitat"
  },
  "gxp.FilterBuilder.prototype": {
    builderTypeNames: ["alguna de", "totes", "cap de", "no totes"],
    preComboText: "Acompleix",
    postComboText: "les condicions seg\u00fcents:",
    addConditionText: "afegeix condici\u00f3",
    addGroupText: "afegeix grup",
    removeConditionText: "treu condici\u00f3"
  },
  "gxp.grid.CapabilitiesGrid.prototype": {
    nameHeaderText: "Nom",
    titleHeaderText: "T\u00edtol",
    queryableHeaderText: "Consultable",
    layerSelectionLabel: "Llista les capes de:",
    layerAdditionLabel: "o afegeix un altre servidor.",
    expanderTemplateText: "<p><b>Resum:</b> {abstract}</p>"
  },
  "gxp.PointSymbolizer.prototype": {
    graphicCircleText: "cercle",
    graphicSquareText: "quadrat",
    graphicTriangleText: "triangle",
    graphicStarText: "estrella",
    graphicCrossText: "creu",
    graphicXText: "x",
    graphicExternalText: "extern",
    urlText: "URL",
    opacityText: "opacitat",
    symbolText: "S\u00edmbol",
    sizeText: "Mides",
    rotationText: "Gir"
  },
  "gxp.QueryPanel.prototype": {
    queryByLocationText: "Consulta per lloc",
    currentTextText: "Vista actual",
    queryByAttributesText: "Consulta per atributs",
    layerText: "Capa"
  },
  "gxp.RulePanel.prototype": {
    scaleSliderTemplate: "{scaleType} Escala 1:{scale}",
    labelFeaturesText: "Etiqueta elements",
    labelsText: "Etiquetes",
    basicText: "B\u00e0sic",
    advancedText: "Avan\u00e7at",
    limitByScaleText: "Restringeix per escala",
    limitByConditionText: "Restringeix per condici\u00f3",
    symbolText: "S\u00edmbol",
    nameText: "Nom"
  },
  "gxp.ScaleLimitPanel.prototype": {
    scaleSliderTemplate: "{scaleType} Escala 1:{scale}",
    minScaleLimitText: "Escala m\u00ednima",
    maxScaleLimitText: "Escala m\u00e0xima"
  },
  "gxp.StrokeSymbolizer.prototype": {
    solidStrokeName: "continu",
    dashStrokeName: "guions",
    dotStrokeName: "punts",
    titleText: "Tra\u00e7",
    styleText: "Estil",
    colorText: "Color",
    widthText: "Amplada",
    opacityText: "Opacitad"
  },
  "gxp.StylePropertiesDialog.prototype": {
    titleText: "General",
    nameFieldText: "Nom",
    titleFieldText: "T\u00edtol",
    abstractFieldText: "Resum"
  },
  "gxp.TextSymbolizer.prototype": {
    labelValuesText: "Etiquetatge",
    haloText: "Halo",
    sizeText: "Mida"
  },
  "gxp.WMSLayerPanel.prototype": {
    attributionText: "Attribution",
    aboutText: "Quant a",
    titleText: "T\u00edtol",
    nameText: "Nom",
    descriptionText: "Descripci\u00f3",
    displayText: "Mostra",
    opacityText: "Opacitat",
    formatText: "Format",
    transparentText: "Transparent",
    cacheText: "Cach\u00e9",
    cacheFieldText: "Utiliza la versi\u00f3 en cach\u00e9",
    stylesText: "Estils disponibles",
    infoFormatText: "Info format",
    infoFormatEmptyText: "Select a format",
    displayOptionsText: "Display options",
    queryText: "Limit with filters",
    scaleText: "Limit by scale",
    minScaleText: "Min scale",
    maxScaleText: "Max scale",
    switchToFilterBuilderText: "Switch back to filter builder",
    cqlPrefixText: "or ",
    cqlText: "use CQL filter instead",
    singleTileText: "Single tile",
    singleTileFieldText: "Use a single tile"
  },
  "gxp.EmbedMapDialog.prototype": {
    publishMessage: "Ja podeu incloure el vostre mapa a altres webs! Simplement copieu el seg\u00fcent codi HTML all\u00e0 on desitgeu incrustar-ho:",
    heightLabel: "Al\u00e7\u00e0ria",
    widthLabel: "Amplada",
    mapSizeLabel: "Mida",
    miniSizeLabel: "M\u00ednima",
    smallSizeLabel: "Petita",
    premiumSizeLabel: "Premium",
    largeSizeLabel: "Gran"
  },
  "gxp.WMSStylesDialog.prototype": {
    addStyleText: "Afegeix",
    addStyleTip: "Afegeix nou estil",
    chooseStyleText: "Escull estil",
    deleteStyleText: "Treu",
    deleteStyleTip: "Esborra l'estil sel\u00b7leccionat",
    editStyleText: "Canvia",
    editStyleTip: "Edita l'estil sel\u00b7leccionat",
    duplicateStyleText: "Clona",
    duplicateStyleTip: "Duplica l'estil sel\u00b7leccionat",
    addRuleText: "Afegeix",
    addRuleTip: "Afegeix nova regla",
    newRuleText: "Nova regla",
    deleteRuleText: "Treu",
    deleteRuleTip: "Esborra la regla sel\u00b7leccionada",
    editRuleText: "Edita",
    editRuleTip: "Edita la regla sel\u00b7leccionada",
    duplicateRuleText: "Clona",
    duplicateRuleTip: "Duplica la regla sel\u00b7leccionada",
    cancelText: "Cancel\u00b7la",
    saveText: "Desa",
    styleWindowTitle: "Estil: {0}",
    ruleWindowTitle: "Regla: {0}",
    stylesFieldsetTitle: "Estils",
    rulesFieldsetTitle: "Regles"
  },
  "gxp.LayerUploadPanel.prototype": {
    titleLabel: "T\u00edtol",
    titleEmptyText: "T\u00edtol de la capa",
    abstractLabel: "Descripci\u00f3",
    abstractEmptyText: "Descripci\u00f3 de la capa",
    fileLabel: "Dades",
    fieldEmptyText: "Navegueu per les dades...",
    uploadText: "Puja",
    uploadFailedText: "Upload failed",
    processingUploadText: "Processing upload...",
    waitMsgText: "Pugeu les vostres dades...",
    invalidFileExtensionText: "L'extensi\u00f3 del fitxer ha de ser alguna d'aquestes: ",
    optionsText: "Opcions",
    workspaceLabel: "Espai de treball",
    workspaceEmptyText: "Espai de treball per defecte",
    dataStoreLabel: "Magatzem",
    dataStoreEmptyText: "Create new store",
    defaultDataStoreEmptyText: "Magatzem de dades per defecte"
  },
  "gxp.NewSourceDialog.prototype": {
    title: "Afegeix Servidor...",
    cancelText: "Cancel\u00b7la",
    addServerText: "Afegeix Servidor",
    invalidURLText: "Enter a valid URL to a WMS endpoint (e.g. http://example.com/geoserver/wms)",
    contactingServerText: "Connectant amb el Servidor..."
  },
  "gxp.ScaleOverlay.prototype": {
    zoomLevelText: "Escala"
  },
  "gxp.Viewer.prototype": {
    saveErrorText: "Problemes desant: "
  },
  "gxp.FeedSourceDialog.prototype": {
    feedTypeText: "Font",
    addPicasaText: "Picasa fotos",
    addYouTubeText: "YouTube Videos",
    addRSSText: "Feed GeoRSS Un altre",
    addFeedText: "Afegeix a Mapa",
    addTitleText: "T\u00edtol",
    keywordText: "Paraula clau",
    doneText: "Fet",
    titleText: "Afegir Feeds",
    maxResultsText: "Productes Max"
  }
});
GeoExt.Lang.add("en", {
  "gxp.menu.LayerMenu.prototype": {
    layerText: "\u56fe\u5c42"
  },
  "gxp.plugins.AddLayers.prototype": {
    addActionMenuText: "\u6dfb\u52a0\u56fe\u5c42",
    addActionTip: "\u6dfb\u52a0\u56fe\u5c42",
    addServerText: "\u6dfb\u52a0\u65b0\u670d\u52a1\u5668",
    addButtonText: "\u6dfb\u52a0\u56fe\u5c42",
    untitledText: "\u65e0\u6807\u9898",
    addLayerSourceErrorText: "WMS\u83b7\u53d6\u53d1\u751f\u9519\u8bef ({msg}).\n\u8bf7\u68c0\u67e5URL\u5e76\u91cd\u8bd5",
    availableLayersText: "\u73b0\u6709\u56fe\u5c42",
    expanderTemplateText: "<p><b>\u7b80\u4ecb:</b> {\u7b80\u4ecb}</p>",
    panelTitleText: "\u6807\u9898",
    layerSelectionText: "\u67e5\u770b\u73b0\u6709\u6570\u636e:",
    doneText: "\u5b8c\u6210",
    uploadText: "\u4e0a\u4f20\u56fe\u5c42",
    addFeedActionMenuText: "Add feeds",
    searchText: "Search for layers"
  },
  "gxp.plugins.BingSource.prototype": {
    title: "Bing\u56fe\u5c42",
    roadTitle: "Bing\u9053\u8def",
    aerialTitle: "Bing\u822a\u62cd\u56fe\u7247",
    labeledAerialTitle: "Bing\u822a\u62cd\u56fe\u7247\u5e26\u6807\u8bb0"
  },
  "gxp.plugins.FeatureEditor.prototype": {
    splitButtonText: "\u7f16\u8f91",
    createFeatureActionText: "\u521b\u5efa",
    editFeatureActionText: "\u4fee\u6539",
    createFeatureActionTip: "\u521b\u5efa\u65b0\u56fe\u5f62",
    editFeatureActionTip: "\u4fee\u6539\u5df2\u5b58\u5728\u56fe\u5f62",
    commitTitle: "Commit message",
    commitText: "Please enter a commit message for this edit:"
  },
  "gxp.plugins.FeatureGrid.prototype": {
    displayFeatureText: "\u5728\u5730\u56fe\u4e0a\u663e\u793a",
    firstPageTip: "\u7b2c\u4e00\u9875",
    previousPageTip: "\u524d\u4e00\u9875",
    zoomPageExtentTip: "\u805a\u7126\u5230\u9875\u9762\u5c3a\u5bf8",
    nextPageTip: "\u4e0b\u4e00\u9875",
    lastPageTip: "\u6700\u540e\u4e00\u9875",
    totalMsg: "\u56fe\u5f62 {1} \u5230 {2} \u4ece {0}"
  },
  "gxp.plugins.GoogleEarth.prototype": {
    menuText: "3D\u89c6\u89d2",
    tooltip: "\u5207\u6362\u52303D\u89c6\u89d2"
  },
  "gxp.plugins.GoogleSource.prototype": {
    title: "Google\u56fe\u5c42",
    roadmapAbstract: "\u663e\u793a\u8857\u9053",
    satelliteAbstract: "\u663e\u793a\u536b\u661f\u56fe",
    hybridAbstract: "\u663e\u793a\u536b\u661f\u56fe\u53ca\u8857\u9053\u540d\u79f0",
    terrainAbstract: "\u663e\u793a\u8857\u9053\u548c\u5730\u5f62"
  },
  "gxp.plugins.LayerProperties.prototype": {
    menuText: "\u56fe\u5c42\u5c5e\u6027",
    toolTip: "\u56fe\u5c42\u5c5e\u6027"
  },
  "gxp.plugins.LayerTree.prototype": {
    shortTitle: "\u56fe\u5c42",
    rootNodeText: "\u56fe\u5c42",
    overlayNodeText: "\u53e0\u52a0",
    baseNodeText: "\u57fa\u56fe\u5c42"
  },
  "gxp.plugins.Legend.prototype": {
    menuText: "\u663e\u793a\u56fe\u4f8b",
    tooltip: "\u663e\u793a\u56fe\u4f8b"
  },
  "gxp.plugins.LoadingIndicator.prototype": {
    loadingMapMessage: "\u8bfb\u53d6\u5730\u56fe..."
  },
  "gxp.plugins.MapBoxSource.prototype": {
    title: "MapBox\u56fe\u5c42",
    blueMarbleTopoBathyJanTitle: "Blue Marble Topography & Bathymetry (January)\u84dd\u5927\u7406\u77f3\u5730\u5f62\u56fe\u548c\u6e56\u76c6\u56fe\uff08\u4e00\u6708\uff09",
    blueMarbleTopoBathyJulTitle: "Blue Marble Topography & Bathymetry (July)\u84dd\u5927\u7406\u77f3\u5730\u5f62\u56fe\u548c\u6e56\u76c6\u56fe\uff08\u4e03\u6708)",
    blueMarbleTopoJanTitle: "Blue Marble Topography (January)\u84dd\u5927\u7406\u77f3\u5730\u5f62\u56fe\uff08\u4e00\u6708\uff09",
    blueMarbleTopoJulTitle: "Blue Marble Topography (July)\u84dd\u5927\u7406\u77f3\u5730\u5f62\u56fe\uff08\u4e03\u6708\uff09",
    controlRoomTitle: "Control Room\u63a7\u5236\u5ba4",
    geographyClassTitle: "Geography Class\u5730\u7406\u8bfe",
    naturalEarthHypsoTitle: "Natural Earth Hypsometric",
    naturalEarthHypsoBathyTitle: "Natural Earth Hypsometric & Bathymetry",
    naturalEarth1Title: "Natural Earth I",
    naturalEarth2Title: "Natural Earth II",
    worldDarkTitle: "World Dark",
    worldLightTitle: "World Light",
    worldPrintTitle: "World Print"
  },
  "gxp.plugins.Measure.prototype": {
    buttonText: "\u6d4b\u91cf",
    lengthMenuText: "\u957f\u5ea6",
    areaMenuText: "\u9762\u79ef",
    lengthTooltip: "\u6d4b\u91cf\u957f\u5ea6",
    areaTooltip: "\u6d4b\u91cf\u9762\u79ef",
    measureTooltip: "\u6d4b\u91cf"
  },
  "gxp.plugins.Navigation.prototype": {
    menuText: "\u5e73\u79fb\u5730\u56fe",
    tooltip: "\u5e73\u79fb\u5730\u56fe"
  },
  "gxp.plugins.NavigationHistory.prototype": {
    previousMenuText: "\u805a\u7126\u5230\u524d\u4e00\u5c3a\u5bf8",
    nextMenuText: "\u805a\u96c6\u5230\u4e0b\u4e00\u5c3a\u5bf8",
    previousTooltip: "\u805a\u7126\u5230\u524d\u4e00\u5c3a\u5bf8",
    nextTooltip: "\u805a\u7126\u5230\u4e0b\u4e00\u5c3a\u5bf8"
  },
  "gxp.plugins.OSMSource.prototype": {
    title: "OpenStreetMap\u56fe\u5c42",
    mapnikAttribution: "CC-By-SA\u6570\u636e<a href='http://openstreetmap.org/'>OpenStreetMap</a>",
    osmarenderAttribution: "CC-By-SA\u6570\u636e<a href='http://openstreetmap.org/'>OpenStreetMap</a>"
  },
  "gxp.plugins.Print.prototype": {
    buttonText: "\u6253\u5370",
    menuText: "\u6253\u5370\u5730\u56fe",
    tooltip: "\u6253\u5370\u5730\u56fe",
    previewText: "\u6253\u5370\u9884\u89c8",
    notAllNotPrintableText: "\u5e76\u975e\u6240\u6709\u56fe\u5c42\u90fd\u53ef\u6253\u5370",
    nonePrintableText: "\u73b0\u6709\u5730\u56fe\u4e2d\u7684\u56fe\u5c42\u90fd\u4e0d\u53ef\u6253\u5370"
  },
  "gxp.plugins.MapQuestSource.prototype": {
    title: "MapQuest\u56fe\u5c42",
    osmAttribution: "\u6805\u683c\u83b7\u53d6\u81ea <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
    osmTitle: "MapQuest OpenStreetMap",
    naipAttribution: "\u6805\u683c\u83b7\u53d6\u81ea <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
    naipTitle: "MapQuest\u56fe\u7247"
  },
  "gxp.plugins.QueryForm.prototype": {
    queryActionText: "\u67e5\u8be2",
    queryMenuText: "\u67e5\u8be2\u56fe\u5c42",
    queryActionTip: "\u67e5\u8be2\u88ab\u9009\u56fe\u5c42",
    queryByLocationText: "\u6839\u636e\u73b0\u6709\u5730\u56fe\u5c3a\u5bf8\u67e5\u8be2",
    queryByAttributesText: "\u6839\u636e\u5c5e\u6027\u67e5\u8be2",
    queryMsg: "\u67e5\u8be2\u4e2d...",
    cancelButtonText: "\u53d6\u6d88",
    noFeaturesTitle: "\u6ca1\u6709\u5339\u914d\u5bf9\u8c61",
    noFeaturesMessage: "\u60a8\u7684\u67e5\u8be2\u672a\u8fd4\u56de\u4efb\u4f55\u7ed3\u679c"
  },
  "gxp.plugins.RemoveLayer.prototype": {
    removeMenuText: "\u5220\u9664\u56fe\u5c42",
    removeActionTip: "\u5220\u9664\u56fe\u5c42"
  },
  "gxp.plugins.Styler.prototype": {
    menuText: "\u4fee\u6539\u5f0f\u6837",
    tooltip: "\u7ba1\u7406\u56fe\u5c42\u5f0f\u6837"
  },
  "gxp.plugins.WMSGetFeatureInfo.prototype": {
    buttonText: "\u8bc6\u522b",
    infoActionTip: "\u83b7\u53d6\u56fe\u5f62\u4fe1\u606f",
    popupTitle: "\u56fe\u5f62\u4fe1\u606f"
  },
  "gxp.plugins.Zoom.prototype": {
    zoomMenuText: "\u805a\u7126\u6846",
    zoomInMenuText: "\u653e\u5927",
    zoomOutMenuText: "\u7f29\u5c0f",
    zoomTooltip: "\u8ddf\u636e\u5212\u6846\u805a\u7126",
    zoomInTooltip: "\u653e\u5927",
    zoomOutTooltip: "\u7f29\u5c0f"
  },
  "gxp.plugins.ZoomToExtent.prototype": {
    menuText: "\u805a\u7126\u5230\u6700\u5927\u5c3a\u5bf8",
    tooltip: "\u805a\u7126\u5230\u6700\u5927\u5c3a\u5bf8"
  },
  "gxp.plugins.ZoomToDataExtent.prototype": {
    menuText: "\u805a\u7126\u5230\u56fe\u5c42\u5c3a\u5bf8",
    tooltip: "\u805a\u7126\u5230\u56fe\u5c42\u5c3a\u5bf8"
  },
  "gxp.plugins.ZoomToLayerExtent.prototype": {
    menuText: "\u805a\u7126\u5230\u56fe\u5c42\u5c3a\u5bf8",
    tooltip: "\u805a\u7126\u5230\u56fe\u5c42\u5c3a\u5bf8"
  },
  "gxp.plugins.ZoomToSelectedFeatures.prototype": {
    menuText: "\u805a\u7126\u5230\u88ab\u9009\u56fe\u5f62",
    tooltip: "\u805a\u7126\u5230\u88ab\u9009\u56fe\u5f62"
  },
  "gxp.FeatureEditPopup.prototype": {
    closeMsgTitle: "\u4fdd\u5b58\u4fee\u6539?",
    closeMsg: "\u56fe\u5f62\u4fee\u6539\u672a\u88ab\u4fdd\u5b58,\u60a8\u6253\u7b97\u4fdd\u5b58\u8fd9\u4e9b\u4fee\u6539\u4e48\uff1f",
    deleteMsgTitle: "\u5220\u9664\u56fe\u5f62?",
    deleteMsg: "\u60a8\u786e\u5b9a\u8981\u5220\u9664\u8fd9\u4e9b\u56fe\u5f62\uff1f",
    editButtonText: "\u4fee\u6539",
    editButtonTooltip: "\u4f7f\u6b64\u56fe\u5f62\u53ef\u7f16\u8f91",
    deleteButtonText: "\u5220\u9664",
    deleteButtonTooltip: "\u5220\u9664\u8fd9\u4e00\u56fe\u5f62",
    cancelButtonText: "\u53d6\u6d88",
    cancelButtonTooltip: "\u505c\u6b62\u7f16\u8f91,\u653e\u5f03\u4fee\u6539",
    saveButtonText: "\u4fdd\u5b58",
    saveButtonTooltip: "\u4fdd\u5b58\u4fee\u6539"
  },
  "gxp.FillSymbolizer.prototype": {
    fillText: "\u586b\u6ee1",
    colorText: "\u989c\u8272",
    opacityText: "\u900f\u660e\u5ea6"
  },
  "gxp.FilterBuilder.prototype": {
    builderTypeNames: ["\u4efb\u4f55", "\u5168\u90e8", "\u6ca1\u6709", "\u975e\u5168\u90e8"],
    preComboText: "\u5339\u914d",
    postComboText: "\u81ea\u4e0b\u5217:",
    addConditionText: "\u6dfb\u52a0\u6761\u4ef6",
    addGroupText: "\u6dfb\u52a0\u7ec4",
    removeConditionText: "\u53bb\u9664\u6761\u4ef6"
  },
  "gxp.grid.CapabilitiesGrid.prototype": {
    nameHeaderText: "\u540d\u5b57",
    titleHeaderText: "\u6807\u9898",
    queryableHeaderText: "\u53ef\u67e5\u8be2",
    layerSelectionLabel: "\u67e5\u770b\u73b0\u6709\u6570\u636e",
    layerAdditionLabel: "\u6216\u6dfb\u52a0\u65b0\u670d\u52a1\u5668",
    expanderTemplateText: "<p><b>\u7b80\u4ecb:</b> {\u7b80\u4ecb:}</p>"
  },
  "gxp.PointSymbolizer.prototype": {
    graphicCircleText: "\u5706",
    graphicSquareText: "\u65b9",
    graphicTriangleText: "\u4e09\u89d2",
    graphicStarText: "\u661f",
    graphicCrossText: "\u5341\u5b57",
    graphicXText: "\u53c9",
    graphicExternalText: "\u5916\u90e8",
    urlText: "URL",
    opacityText: "\u900f\u660e\u5ea6",
    symbolText: "\u6807\u5fd7",
    sizeText: "\u5c3a\u5bf8",
    rotationText: "\u65cb\u8f6c"
  },
  "gxp.QueryPanel.prototype": {
    queryByLocationText: "\u6839\u636e\u65b9\u4f4d\u67e5\u8be2",
    currentTextText: "\u73b0\u6709\u5c3a\u5bf8",
    queryByAttributesText: "\u6839\u636e\u5c5e\u6027\u67e5\u8be2",
    layerText: "\u56fe\u5c42"
  },
  "gxp.RulePanel.prototype": {
    scaleSliderTemplate: "{scaleType}\u6bd4\u4f8b 1:{scale}",
    labelFeaturesText: "\u6807\u8bb0\u56fe\u5f62",
    labelsText: "\u6807\u8bb0",
    basicText: "\u57fa\u672c",
    advancedText: "\u9ad8\u7ea7",
    limitByScaleText: "\u7528\u6bd4\u4f8b\u5c3a\u7b5b\u9009",
    limitByConditionText: "\u7528\u6761\u4ef6\u7b5b\u9009",
    symbolText: "\u6807\u5fd7",
    nameText: "\u540d\u5b57"
  },
  "gxp.ScaleLimitPanel.prototype": {
    scaleSliderTemplate: "{scaleType} \u6bd4\u4f8b 1:{scale}",
    minScaleLimitText: "\u6700\u5c0f\u6bd4\u4f8b\u6781\u9650",
    maxScaleLimitText: "\u6700\u5927\u6bd4\u4f8b\u6781\u9650"
  },
  "gxp.StrokeSymbolizer.prototype": {
    solidStrokeName: "\u5b9e\u7ebf",
    dashStrokeName: "\u865a\u7ebf",
    dotStrokeName: "\u70b9\u7ebf",
    titleText: "\u7ebf\u5bbd",
    styleText: "\u6837\u5f0f",
    colorText: "\u989c\u8272",
    widthText: "\u5bbd\u5ea6",
    opacityText: "\u900f\u660e\u5ea6"
  },
  "gxp.StylePropertiesDialog.prototype": {
    titleText: "\u5e38\u89c4",
    nameFieldText: "\u540d\u79f0",
    titleFieldText: "\u6807\u9898",
    abstractFieldText: "\u7b80\u4ecb"
  },
  "gxp.TextSymbolizer.prototype": {
    labelValuesText: "\u6807\u8bb0\u6570\u503c",
    haloText: "\u5149\u6655",
    sizeText: "\u5c3a\u5bf8"
  },
  "gxp.WMSLayerPanel.prototype": {
    attributionText: "Attribution",
    aboutText: "\u5173\u4e8e",
    titleText: "\u6807\u9898",
    nameText: "\u540d\u5b57",
    descriptionText: "\u63cf\u8ff0",
    displayText: "\u663e\u793a",
    opacityText: "\u534a\u900f\u660e",
    formatText: "\u683c\u5f0f",
    transparentText: "\u900f\u660e",
    cacheText: "\u7f13\u5b58",
    cacheFieldText: "\u4f7f\u7528\u7f13\u5b58\u7248\u672c",
    stylesText: "Available styles",
    infoFormatText: "\u683c\u5f0f\u4fe1\u606f",
    infoFormatEmptyText: "\u9009\u62e9\u4e00\u79cd\u683c\u5f0f",
    displayOptionsText: "Display options",
    queryText: "Limit with filters",
    scaleText: "Limit by scale",
    minScaleText: "Min scale",
    maxScaleText: "Max scale",
    switchToFilterBuilderText: "Switch back to filter builder",
    cqlPrefixText: "or ",
    cqlText: "use CQL filter instead",
    singleTileText: "Single tile",
    singleTileFieldText: "Use a single tile"
  },
  "gxp.EmbedMapDialog.prototype": {
    publishMessage: "\u60a8\u7684\u5730\u56fe\u5df2\u7ecf\u53ef\u4ee5\u5728\u7f51\u4e0a\u53d1\u5e03\uff01\u8bf7\u62f7\u8d1d\u4ee5\u4e0bHTML\u4ee5\u5c06\u5730\u56fe\u63d2\u5165\u60a8\u7684\u7f51\u7ad9",
    heightLabel: "\u9ad8",
    widthLabel: "\u5bbd",
    mapSizeLabel: "\u5730\u56fe\u5927\u5c0f",
    miniSizeLabel: "\u8ff7\u4f60",
    smallSizeLabel: "\u5c0f",
    premiumSizeLabel: "\u6700\u4f73",
    largeSizeLabel: "\u5927"
  },
  "gxp.WMSStylesDialog.prototype": {
    addStyleText: "\u6dfb\u52a0",
    addStyleTip: "\u6dfb\u52a0\u65b0\u5f0f\u6837",
    chooseStyleText: "\u9009\u62e9\u5f0f\u6837",
    deleteStyleText: "\u79fb\u9664",
    deleteStyleTip: "\u5220\u9664\u88ab\u9009\u5f0f\u6837",
    editStyleText: "\u4fee\u6539",
    editStyleTip: "\u4fee\u6539\u88ab\u9009\u5f0f\u6837",
    duplicateStyleText: "\u590d\u5236",
    duplicateStyleTip: "\u590d\u5236\u88ab\u9009\u5f0f\u6837",
    addRuleText: "\u6dfb\u52a0",
    addRuleTip: "\u6dfb\u52a0\u65b0\u89c4\u5219",
    newRuleText: "\u65b0\u89c4\u5219",
    deleteRuleText: "\u79fb\u9664",
    deleteRuleTip: "\u5220\u9664\u88ab\u9009\u89c4\u5219",
    editRuleText: "\u4fee\u6539",
    editRuleTip: "\u4fee\u6539\u88ab\u9009\u89c4\u5219",
    duplicateRuleText: "\u590d\u5236",
    duplicateRuleTip: "\u590d\u5236\u88ab\u9009\u89c4\u5219",
    cancelText: "\u53d6\u6d88",
    saveText: "\u4fdd\u5b58",
    styleWindowTitle: "\u7528\u6237\u5f0f\u6837: {0}",
    ruleWindowTitle: "\u5f0f\u6837\u89c4\u5219: {0}",
    stylesFieldsetTitle: "\u5f0f\u6837",
    rulesFieldsetTitle: "\u89c4\u5219"
  },
  "gxp.LayerUploadPanel.prototype": {
    titleLabel: "\u6807\u9898",
    titleEmptyText: "\u56fe\u5c42\u6807\u9898",
    abstractLabel: "\u63cf\u8ff0",
    abstractEmptyText: "\u56fe\u5c42\u63cf\u8ff0",
    fileLabel: "\u6570\u636e",
    fieldEmptyText: "\u6d4f\u89c8\u6570\u636e\u6863\u6848...",
    uploadText: "\u4e0a\u4f20",
    uploadFailedText: "Upload failed",
    processingUploadText: "Processing upload...",
    waitMsgText: "\u4e0a\u4f20\u60a8\u7684\u6570\u636e",
    invalidFileExtensionText: "\u6587\u4ef6\u540e\u7f00\u540d\u5fc5\u987b\u662f: ",
    optionsText: "\u9009\u9879",
    workspaceLabel: "\u5de5\u4f5c\u533a",
    workspaceEmptyText: "\u9ed8\u8ba4\u5de5\u4f5c\u533a",
    dataStoreLabel: "\u6570\u636e\u5305",
    dataStoreEmptyText: "\u751f\u6210\u65b0\u6570\u636e\u5305",
    defaultDataStoreEmptyText: "\u9ed8\u8ba4\u6570\u636e\u5305"
  },
  "gxp.NewSourceDialog.prototype": {
    title: "\u6dfb\u52a0\u65b0\u670d\u52a1\u5668...",
    cancelText: "\u53d6\u6d88",
    addServerText: "\u6dfb\u52a0\u670d\u52a1\u5668",
    invalidURLText: "\u8bf7\u6dfb\u52a0\u6709\u6548\u7684URL\u4ee5\u8054\u63a5WMS\u7aef\u70b9(\u6bd4\u5982http://example.com/geoserver/wms)",
    contactingServerText: "\u8054\u63a5\u670d\u52a1\u5668\u4e2d..."
  },
  "gxp.ScaleOverlay.prototype": {
    zoomLevelText: "\u805a\u7126\u5ea6"
  },
  "gxp.Viewer.prototype": {
    saveErrorText: "Trouble saving: "
  },
  "gxp.FeedSourceDialog.prototype": {
    feedTypeText: "\u6e90",
    addPicasaText: "Picasa\u7167\u7247",
    addYouTubeText: "YouTube\u8996\u983b",
    addRSSText: "\u5176\u4ed6\u7684GeoRSS\u98fc\u6599",
    addFeedText: "\u5730\u5716",
    addTitleText: "\u6a19\u984c",
    keywordText: "\u95dc\u9375\u5b57",
    doneText: "\u5b8c\u6210",
    titleText: "\u6dfb\u52a0\u8a02\u95b1",
    maxResultsText: "\u6700\u5927\u9805\u76ee"
  }
});
GeoExt.Lang.add("de", {
  "gxp.menu.LayerMenu.prototype": {
    layerText: "Layer"
  },
  "gxp.plugins.AddLayers.prototype": {
    addActionMenuText: "Layer hinzuf\u00fcgen",
    addActionTip: "Layer hinzuf\u00fcgen",
    addServerText: "Server hinzuf\u00fcgen",
    addButtonText: "Layer hinzuf\u00fcgen",
    untitledText: "ohne Titel",
    addLayerSourceErrorText: "Fehler beim Abfragen der WMS Capabilities ({msg}).\nBitte URL pr\u00fcfen und erneut versuchen.",
    availableLayersText: "verf\u00fcgbare Layer",
    expanderTemplateText: "<p><b>Kurzbeschreibung:</b> {abstract}</p>",
    panelTitleText: "Titel",
    layerSelectionText: "Verf\u00fcgbare Daten anzeigen von:",
    doneText: "Fertig",
    uploadText: "Daten hochladen",
    addFeedActionMenuText: "Add feeds",
    searchText: "Search for layers"
  },
  "gxp.plugins.BingSource.prototype": {
    title: "Bing Layer",
    roadTitle: "Bing Strassen",
    aerialTitle: "Bing Luftbilder",
    labeledAerialTitle: "Bing Luftbilder mit Beschriftung"
  },
  "gxp.plugins.FeatureEditor.prototype": {
    splitButtonText: "Editieren",
    createFeatureActionText: "Erzeugen",
    editFeatureActionText: "Bearbeiten",
    createFeatureActionTip: "neues Objekt erstellen",
    editFeatureActionTip: "bestehendes Objekt bearbeiten",
    commitTitle: "Commit message",
    commitText: "Please enter a commit message for this edit:"
  },
  "gxp.plugins.FeatureGrid.prototype": {
    displayFeatureText: "auf der Karte darstellen",
    firstPageTip: "erste Seite",
    previousPageTip: "vorherige Seite",
    zoomPageExtentTip: "Zoom zur max. Ausdehnung",
    nextPageTip: "n\u00e4chste Seite",
    lastPageTip: "letzte Seite",
    totalMsg: "{1} bis {2} von {0} Datens\u00e4tzen"
  },
  "gxp.plugins.GoogleEarth.prototype": {
    menuText: "3D Viewer",
    tooltip: "zum 3D Viewer wechseln"
  },
  "gxp.plugins.GoogleSource.prototype": {
    title: "Google Layers",
    roadmapAbstract: "Strassenkarte zeigen",
    satelliteAbstract: "Luftbilder zeigen",
    hybridAbstract: "Luftbilder mit Strassennamen zeigen",
    terrainAbstract: "Strassenkarte mit Gel\u00e4nde zeigen"
  },
  "gxp.plugins.LayerProperties.prototype": {
    menuText: "Layer Eigenschaften",
    toolTip: "Layer Eigenschaften"
  },
  "gxp.plugins.LayerTree.prototype": {
    shortTitle: "Layer",
    rootNodeText: "Layer",
    overlayNodeText: "\u00fcberlagernde Layer",
    baseNodeText: "Basiskarten"
  },
  "gxp.plugins.LayerManager.prototype": {
    baseNodeText: "Basiskarte"
  },
  "gxp.plugins.Legend.prototype": {
    menuText: "Legende zeigen",
    tooltip: "Legende zeigen"
  },
  "gxp.plugins.LoadingIndicator.prototype": {
    loadingMapMessage: "Karte laden..."
  },
  "gxp.plugins.MapBoxSource.prototype": {
    title: "MapBox Layers",
    blueMarbleTopoBathyJanTitle: "Blue Marble Topography & Bathymetry (January)",
    blueMarbleTopoBathyJulTitle: "Blue Marble Topography & Bathymetry (July)",
    blueMarbleTopoJanTitle: "Blue Marble Topography (January)",
    blueMarbleTopoJulTitle: "Blue Marble Topography (July)",
    controlRoomTitle: "Control Room",
    geographyClassTitle: "Geography Class",
    naturalEarthHypsoTitle: "Natural Earth Hypsometric",
    naturalEarthHypsoBathyTitle: "Natural Earth Hypsometric & Bathymetry",
    naturalEarth1Title: "Natural Earth I",
    naturalEarth2Title: "Natural Earth II",
    worldDarkTitle: "World Dark",
    worldLightTitle: "World Light",
    worldPrintTitle: "World Print"
  },
  "gxp.plugins.Measure.prototype": {
    buttonText: "Messen",
    lengthMenuText: "L\u00e4nge",
    areaMenuText: "Fl\u00e4che",
    lengthTooltip: "L\u00e4nge messen",
    areaTooltip: "Fl\u00e4che messen",
    measureTooltip: "Messen"
  },
  "gxp.plugins.Navigation.prototype": {
    menuText: "Kartenausschnitt verschieben",
    tooltip: "Kartenausschnitt verschieben"
  },
  "gxp.plugins.NavigationHistory.prototype": {
    previousMenuText: "Kartenausschnitt zur\u00fcck",
    nextMenuText: "Kartenausschnitt vorw\u00e4rts",
    previousTooltip: "Vorherigen Kartenausschnitt anzeigen",
    nextTooltip: "N\u00e4chsten Kartenausschnit anzeigen"
  },
  "gxp.plugins.OSMSource.prototype": {
    title: "OpenStreetMap Layer",
    mapnikAttribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
    osmarenderAttribution: "Data CC-By-SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>"
  },
  "gxp.plugins.Print.prototype": {
    buttonText: "Drucken",
    menuText: "Karte drucken",
    tooltip: "Karte drucken",
    previewText: "Druckansicht",
    notAllNotPrintableText: "Es k\u00f6nnen nicht alle Layer gedruckt werden.",
    nonePrintableText: "Keiner der aktuellen Kartenlayer kann gedruckt werden."
  },
  "gxp.plugins.MapQuestSource.prototype": {
    title: "MapQuest Layers",
    osmAttribution: "Tiles Courtesy of <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
    osmTitle: "MapQuest OpenStreetMap",
    naipAttribution: "Tiles Courtesy of <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
    naipTitle: "MapQuest Imagery"
  },
  "gxp.plugins.QueryForm.prototype": {
    queryActionText: "Abfrage",
    queryMenuText: "Abfrage Layer",
    queryActionTip: "selektierten Layer abfragen",
    queryByLocationText: "Abfrage nach aktuellem Kartenauscchnitt",
    queryByAttributesText: "Attributabfrage",
    queryMsg: "Abfrage wird ausgef\u00fchrt",
    cancelButtonText: "Abbrechen",
    noFeaturesTitle: "keine \u00dcbereinstimmung",
    noFeaturesMessage: "Ihre Abfrage liefert keine Resultate."
  },
  "gxp.plugins.RemoveLayer.prototype": {
    removeMenuText: "Layer l\u00f6schen",
    removeActionTip: "Layer l\u00f6schen"
  },
  "gxp.plugins.Styler.prototype": {
    menuText: "Style bearbeiten",
    tooltip: "Layer Styles verwalten"
  },
  "gxp.plugins.WMSGetFeatureInfo.prototype": {
    buttonText: "Objektinformation",
    infoActionTip: "Objektinformation abfragen",
    popupTitle: "Objektinformation"
  },
  "gxp.plugins.Zoom.prototype": {
    zoomMenuText: "Zoom Box",
    zoomInMenuText: "Vergr\u00f6ssern",
    zoomOutMenuText: "Verkleinern",
    zoomTooltip: "Box aufziehen zum Zoomen",
    zoomInTooltip: "Vergr\u00f6ssern",
    zoomOutTooltip: "Verkleinern"
  },
  "gxp.plugins.ZoomToExtent.prototype": {
    menuText: "Maximale Ausdehnung",
    tooltip: "Maximale Ausdehnung anzeigen"
  },
  "gxp.plugins.ZoomToDataExtent.prototype": {
    menuText: "Auf Layer zoomen",
    tooltip: "Auf Layer zoomen"
  },
  "gxp.plugins.ZoomToLayerExtent.prototype": {
    menuText: "Auf Layer zoomen",
    tooltip: "Auf Layer zoomen"
  },
  "gxp.plugins.ZoomToSelectedFeatures.prototype": {
    menuText: "Auf selektierte Objekte zoomen",
    tooltip: "Auf selektierte Objekte zoomen"
  },
  "gxp.FeatureEditPopup.prototype": {
    closeMsgTitle: "\u00c4nderung speichern?",
    closeMsg: "Ungespeicherte \u00c4nderungen. M\u00f6chten Sie die \u00c4nderungen speichern?",
    deleteMsgTitle: "Objekt l\u00f6schen?",
    deleteMsg: "Sind Sie sicher, dass Sie dieses Objekt l\u00f6schen m\u00f6chten?",
    editButtonText: "Bearbeiten",
    editButtonTooltip: "Objekt editieren",
    deleteButtonText: "L\u00f6schen",
    deleteButtonTooltip: "Objekt l\u00f6schen",
    cancelButtonText: "Abbrechen",
    cancelButtonTooltip: "Bearbeitung beenden, \u00c4nderungen verwerfen.",
    saveButtonText: "Speichern",
    saveButtonTooltip: "\u00c4nderungen speichern"
  },
  "gxp.FillSymbolizer.prototype": {
    fillText: "F\u00fcllung",
    colorText: "Farbe",
    opacityText: "Transparenz"
  },
  "gxp.FilterBuilder.prototype": {
    builderTypeNames: ["beliebige", "alle", "keine", "nicht alle"],
    preComboText: "Match",
    postComboText: "der folgenden:",
    addConditionText: "Bedingung hinzuf\u00fcgen",
    addGroupText: "Gruppe hinzuf\u00fcgen",
    removeConditionText: "Bedingung entfernen"
  },
  "gxp.grid.CapabilitiesGrid.prototype": {
    nameHeaderText: "Name",
    titleHeaderText: "Titel",
    queryableHeaderText: "abfragbar",
    layerSelectionLabel: "Verf\u00fcgbare Daten anzeigen von:",
    layerAdditionLabel: "oder neuen Server hinzuf\u00fcgen.",
    expanderTemplateText: "<p><b>Kurzbeschreibung:</b> {abstract}</p>"
  },
  "gxp.PointSymbolizer.prototype": {
    graphicCircleText: "Kreis",
    graphicSquareText: "Rechteck",
    graphicTriangleText: "Dreieck",
    graphicStarText: "Stern",
    graphicCrossText: "Kreuz",
    graphicXText: "x",
    graphicExternalText: "extern",
    urlText: "URL",
    opacityText: "Transparenz",
    symbolText: "Symbol",
    sizeText: "Gr\u00f6sse",
    rotationText: "Rotation"
  },
  "gxp.QueryPanel.prototype": {
    queryByLocationText: "lagebezogene Abfrage",
    currentTextText: "aktuelle Ausdehnung",
    queryByAttributesText: "Attributabfrage",
    layerText: "Layer"
  },
  "gxp.RulePanel.prototype": {
    scaleSliderTemplate: "{scaleType} Massstab 1:{scale}",
    labelFeaturesText: "Objekte beschriften",
    labelsText: "Beschriftung",
    basicText: "Basic",
    advancedText: "Erweitert",
    limitByScaleText: "Massstabsbeschr\u00e4nkung",
    limitByConditionText: "Einschr\u00e4nkung durch Bedingung",
    symbolText: "Symbol",
    nameText: "Name"
  },
  "gxp.ScaleLimitPanel.prototype": {
    scaleSliderTemplate: "{scaleType} Massstab 1:{scale}",
    minScaleLimitText: "Minimale Massstabsgrenze",
    maxScaleLimitText: "Maximale Massstabsgrenze"
  },
  "gxp.StrokeSymbolizer.prototype": {
    solidStrokeName: "ausgezogen",
    dashStrokeName: "gestrichelt",
    dotStrokeName: "gepunktet",
    titleText: "Linie",
    styleText: "Style",
    colorText: "Farbe",
    widthText: "Breite",
    opacityText: "Transparenz"
  },
  "gxp.StylePropertiesDialog.prototype": {
    titleText: "Allgemein",
    nameFieldText: "Name",
    titleFieldText: "Titel",
    abstractFieldText: "Kurzbeschreibung"
  },
  "gxp.TextSymbolizer.prototype": {
    labelValuesText: "Label values",
    haloText: "Halo",
    sizeText: "Gr\u00f6sse"
  },
  "gxp.WMSLayerPanel.prototype": {
    attributionText: "Attribution",
    aboutText: "\u00dcber",
    titleText: "Titel",
    nameText: "Name",
    descriptionText: "Beschreibung",
    displayText: "Anzeige",
    opacityText: "Transparenz",
    formatText: "Format",
    transparentText: "transparent",
    cacheText: "Cache",
    cacheFieldText: "Version aus dem Cache ben\u00fctzen",
    stylesText: "Verf\u00fcgbare Styles",
    infoFormatText: "Info Format",
    infoFormatEmptyText: "Format ausw\u00e4hlen",
    displayOptionsText: "Display options",
    queryText: "Limit with filters",
    scaleText: "Limit by scale",
    minScaleText: "Min scale",
    maxScaleText: "Max scale",
    switchToFilterBuilderText: "Switch back to filter builder",
    cqlPrefixText: "or ",
    cqlText: "use CQL filter instead",
    singleTileText: "Single tile",
    singleTileFieldText: "Use a single tile"
  },
  "gxp.EmbedMapDialog.prototype": {
    publishMessage: "Ihre Karte ist f\u00fcr die Publikation im Web bereit. Kopieren Sie einfach den folgenden HTML-Code, um die Karte in Ihre Webseite einzubinden:",
    heightLabel: "H\u00f6he",
    widthLabel: "Breite",
    mapSizeLabel: "Kartengr\u00f6sse",
    miniSizeLabel: "Mini",
    smallSizeLabel: "Klein",
    premiumSizeLabel: "Premium",
    largeSizeLabel: "Gross"
  },
  "gxp.WMSStylesDialog.prototype": {
    addStyleText: "Hinzuf\u00fcgen",
    addStyleTip: "neuen Style hinzuf\u00fcgen",
    chooseStyleText: "Style ausw\u00e4hlen",
    deleteStyleText: "L\u00f6schen",
    deleteStyleTip: "selektierten Style l\u00f6schen",
    editStyleText: "Bearbeiten",
    editStyleTip: "selektierten Style bearbeiten",
    duplicateStyleText: "Duplizieren",
    duplicateStyleTip: "selektierten Style duplizieren",
    addRuleText: "Hinzuf\u00fcgen",
    addRuleTip: "neue Regel hinzuf\u00fcgen",
    newRuleText: "neue Regel",
    deleteRuleText: "Entfernen",
    deleteRuleTip: "selektierte Regel l\u00f6schen",
    editRuleText: "Bearbeiten",
    editRuleTip: "selektierte Regel bearbeiten",
    duplicateRuleText: "Duplizieren",
    duplicateRuleTip: "selektierte Regel duplizieren",
    cancelText: "Abbrechen",
    saveText: "Speichern",
    styleWindowTitle: "User Style: {0}",
    ruleWindowTitle: "Style Regel: {0}",
    stylesFieldsetTitle: "Styles",
    rulesFieldsetTitle: "Regeln"
  },
  "gxp.LayerUploadPanel.prototype": {
    titleLabel: "Titel",
    titleEmptyText: "Layertitel",
    abstractLabel: "Beschreibung",
    abstractEmptyText: "Layerbeschreibung",
    fileLabel: "Daten",
    fieldEmptyText: "Datenarchiv durchsuchen...",
    uploadText: "Hochladen",
    uploadFailedText: "Hochladen fehlgeschlagen",
    processingUploadText: "Upload wird bearbeitet",
    waitMsgText: "Ihre Daten werden hochgeladen...",
    invalidFileExtensionText: "Dateierweiterung muss eine sein von: ",
    optionsText: "Optionen",
    workspaceLabel: "Workspace",
    workspaceEmptyText: "Standard Workspace",
    dataStoreLabel: "Store",
    dataStoreEmptyText: "Neuen Store erzeugen",
    defaultDataStoreEmptyText: "Default Datastore"
  },
  "gxp.NewSourceDialog.prototype": {
    title: "neuen Server hinzuf\u00fcgen...",
    cancelText: "Abbrechen",
    addServerText: "Server hinzuf\u00fcgen",
    invalidURLText: "F\u00fcgen Sie eine g\u00fcltige URL zu einem WMS ein (z.B. http://example.com/geoserver/wms)",
    contactingServerText: "Server wird kontaktiert..."
  },
  "gxp.ScaleOverlay.prototype": {
    zoomLevelText: "Zoomstufe"
  },
  "gxp.Viewer.prototype": {
    saveErrorText: "Beim Speichern ist ein Problem aufgetreten: "
  },
  "gxp.FeedSourceDialog.prototype": {
    feedTypeText: "Source",
    addPicasaText: "Picasa Fotos",
    addYouTubeText: "YouTube Videos",
    addRSSText: "Andere GeoRSS Feed",
    addFeedText: "zur Karte hinzuf\u00fcgen",
    addTitleText: "Titel",
    keywordText: "Keyword",
    doneText: "Fertig",
    titleText: "Add-Feeds",
    maxResultsText: "Max Items"
  }
});
GeoExt.Lang.add("el", {
  "gxp.menu.LayerMenu.prototype": {
    layerText: "\u0395\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b1"
  },
  "gxp.plugins.AddLayers.prototype": {
    addActionMenuText: "\u03a0\u03c1\u03bf\u03c3\u03b8\u03ad\u03c3\u03c4\u03b5 \u03b5\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b5\u03c2",
    addActionTip: "\u03a0\u03c1\u03bf\u03c3\u03b8\u03ad\u03c3\u03c4\u03b5 \u03b5\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b5\u03c2",
    addServerText: "\u03a0\u03c1\u03bf\u03c3\u03b8\u03ad\u03c3\u03c4\u03b5 \u03ad\u03bd\u03b1 \u039d\u03ad\u03bf \u0394\u03b9\u03b1\u03ba\u03bf\u03bc\u03b9\u03c3\u03c4\u03ae",
    addButtonText: "\u03a0\u03c1\u03bf\u03c3\u03b8\u03ad\u03c3\u03c4\u03b5 \u03b5\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b5\u03c2",
    untitledText: "\u03a7\u03c9\u03c1\u03af\u03c2 \u03c4\u03af\u03c4\u03bb\u03bf",
    addLayerSourceErrorText: "\u03a3\u03c6\u03ac\u03bb\u03bc\u03b1 \u03c3\u03c4\u03b7\u03bd \u03b1\u03bd\u03ac\u03ba\u03c4\u03b7\u03c3\u03b7 \u03b4\u03c5\u03bd\u03b1\u03c4\u03bf\u03c4\u03ae\u03c4\u03c9\u03bd WMS ({msg}).\n\u03a0\u03b1\u03c1\u03b1\u03ba\u03b1\u03bb\u03ce \u03b5\u03bb\u03ad\u03b3\u03be\u03c4\u03b5 \u03c4\u03bf url \u03ba\u03b1\u03b9 \u03b4\u03bf\u03ba\u03b9\u03bc\u03ac\u03c3\u03c4\u03b5 \u03be\u03b1\u03bd\u03ac.",
    availableLayersText: "\u0394\u03b9\u03b1\u03b8\u03ad\u03c3\u03b9\u03bc\u03b5\u03c2 \u0395\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b5\u03c2",
    expanderTemplateText: "<p><b>\u03a0\u03b5\u03c1\u03af\u03bb\u03b7\u03c8\u03b7:</b> {abstract}</p>",
    panelTitleText: "\u03a4\u03af\u03c4\u03bb\u03bf\u03c2",
    layerSelectionText: "\u0394\u03b5\u03af\u03c4\u03b5 \u03b4\u03b9\u03b1\u03b8\u03ad\u03c3\u03b9\u03bc\u03b1 \u03b4\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03b1 \u03b1\u03c0\u03cc:",
    doneText: "\u039f\u03bb\u03bf\u03ba\u03bb\u03b7\u03c1\u03ce\u03b8\u03b7\u03ba\u03b5",
    uploadText: "\u0391\u03bd\u03b5\u03b2\u03ac\u03c3\u03c4\u03b5 \u0394\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03b1",
    addFeedActionMenuText: "Add feeds",
    searchText: "Search for layers"
  },
  "gxp.plugins.BingSource.prototype": {
    title: "\u0395\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b5\u03c2 Bing",
    roadTitle: "\u0394\u03c1\u03cc\u03bc\u03bf\u03b9 Bing",
    aerialTitle: "\u0395\u03bd\u03b1\u03ad\u03c1\u03b9\u03b5\u03c2 Bing",
    labeledAerialTitle: "\u0395\u03bd\u03b1\u03ad\u03c1\u03b9\u03b5\u03c2 Bing \u03bc\u03b5 \u0395\u03c4\u03b9\u03ba\u03ad\u03c4\u03b5\u03c2"
  },
  "gxp.plugins.FeatureEditor.prototype": {
    splitButtonText: "Edit",
    createFeatureActionText: "Create",
    editFeatureActionText: "Modify",
    createFeatureActionTip: "\u0394\u03b7\u03bc\u03b9\u03bf\u03c5\u03c1\u03b3\u03ae\u03c3\u03c4\u03b5 \u03ad\u03bd\u03b1 \u03bd\u03ad\u03bf \u03c7\u03b1\u03c1\u03b1\u03ba\u03c4\u03b7\u03c1\u03b9\u03c3\u03c4\u03b9\u03ba\u03cc",
    editFeatureActionTip: "\u03a4\u03c1\u03bf\u03c0\u03bf\u03c0\u03bf\u03b9\u03ae\u03c3\u03c4\u03b5 \u03c5\u03c0\u03ac\u03c1\u03c7\u03bf\u03bd \u03c7\u03b1\u03c1\u03b1\u03ba\u03c4\u03b7\u03c1\u03b9\u03c3\u03c4\u03b9\u03ba\u03cc",
    commitTitle: "Commit message",
    commitText: "Please enter a commit message for this edit:"
  },
  "gxp.plugins.FeatureGrid.prototype": {
    displayFeatureText: "\u03a0\u03c1\u03bf\u03b2\u03bf\u03bb\u03ae \u03c3\u03c4\u03bf\u03bd \u03c7\u03ac\u03c1\u03c4\u03b7",
    firstPageTip: "\u03a0\u03c1\u03ce\u03c4\u03b7 \u03c3\u03b5\u03bb\u03af\u03b4\u03b1",
    previousPageTip: "\u03a0\u03c1\u03bf\u03b7\u03b3\u03bf\u03cd\u03bc\u03b5\u03bd\u03b7 \u03c3\u03b5\u03bb\u03af\u03b4\u03b1",
    zoomPageExtentTip: "\u0396\u03bf\u03c5\u03bc \u03c3\u03c4\u03bf \u03b5\u03cd\u03c1\u03bf\u03c2 \u03c4\u03b7\u03c2 \u03c3\u03b5\u03bb\u03af\u03b4\u03b1\u03c2",
    nextPageTip: "\u0395\u03c0\u03cc\u03bc\u03b5\u03bd\u03b7 \u03c3\u03b5\u03bb\u03af\u03b4\u03b1",
    nextPageTip: "\u03a4\u03b5\u03bb\u03b5\u03c5\u03c4\u03b1\u03af\u03b1 \u03c3\u03b5\u03bb\u03af\u03b4\u03b1",
    totalMsg: "Features {1} to {2} of {0}"
  },
  "gxp.plugins.GoogleEarth.prototype": {
    apiKeyPrompt: "\u03a0\u03b1\u03c1\u03b1\u03ba\u03b1\u03bb\u03ce \u03b5\u03b9\u03c3\u03ac\u03b3\u03b5\u03c4\u03b5 \u03c4\u03bf Google API \u03ba\u03bb\u03b5\u03b9\u03b4\u03af \u03b3\u03b9\u03b1 ",
    menuText: "3D \u03a0\u03c1\u03bf\u03b2\u03bf\u03bb\u03ae",
    tooltip: "\u0391\u03bb\u03bb\u03ac\u03be\u03c4\u03b5 \u03c3\u03b5 3D \u03a0\u03c1\u03bf\u03b2\u03bf\u03bb\u03ae"
  },
  "gxp.plugins.GoogleSource.prototype": {
    title: "\u0395\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b5\u03c2 Google",
    roadmapAbstract: "\u03a0\u03c1\u03bf\u03b2\u03bf\u03bb\u03ae \u03bf\u03b4\u03b9\u03ba\u03bf\u03cd \u03c7\u03ac\u03c1\u03c4\u03b7",
    satelliteAbstract: "\u03a0\u03c1\u03bf\u03b2\u03bf\u03bb\u03ae \u03b5\u03b9\u03ba\u03cc\u03bd\u03c9\u03bd \u03b1\u03c0\u03cc \u03b4\u03bf\u03c1\u03c5\u03c6\u03cc\u03c1\u03bf",
    hybridAbstract: "\u03a0\u03c1\u03bf\u03b2\u03bf\u03bb\u03ae \u03b5\u03b9\u03ba\u03cc\u03bd\u03c9\u03bd \u03bc\u03b5 \u03bf\u03bd\u03cc\u03bc\u03b1\u03c4\u03b1 \u03bf\u03b4\u03ce\u03bd",
    terrainAbstract: "\u03a0\u03c1\u03bf\u03b2\u03bf\u03bb\u03ae \u03bf\u03b4\u03b9\u03ba\u03bf\u03cd \u03c7\u03ac\u03c1\u03c4\u03b7 \u03bc\u03b5 \u03b1\u03bd\u03ac\u03b3\u03bb\u03c5\u03c6\u03bf \u03b5\u03b4\u03ac\u03c6\u03bf\u03c5\u03c2"
  },
  "gxp.plugins.LayerProperties.prototype": {
    menuText: "\u0395\u03c0\u03b9\u03bb\u03bf\u03b3\u03ad\u03c2 \u0395\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b1\u03c2",
    toolTip: "\u0395\u03c0\u03b9\u03bb\u03bf\u03b3\u03ad\u03c2 \u0395\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b1\u03c2"
  },
  "gxp.plugins.LayerTree.prototype": {
    rootNodeText: "\u0395\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b5\u03c2",
    overlayNodeText: "\u0395\u03c0\u03b9\u03c3\u03c4\u03c1\u03ce\u03bc\u03b1\u03c4\u03b1",
    baseNodeText: "\u03a5\u03c0\u03cc\u03b2\u03b1\u03b8\u03c1\u03b1"
  },
  "gxp.plugins.Legend.prototype": {
    menuText: "\u03a0\u03c1\u03bf\u03b2\u03bf\u03bb\u03ae \u03a5\u03c0\u03bf\u03bc\u03bd\u03ae\u03bc\u03b1\u03c4\u03bf\u03c2",
    tooltip: "\u03a0\u03c1\u03bf\u03b2\u03bf\u03bb\u03ae \u03a5\u03c0\u03bf\u03bc\u03bd\u03ae\u03bc\u03b1\u03c4\u03bf\u03c2"
  },
  "gxp.plugins.LoadingIndicator.prototype": {
    loadingMapMessage: "\u03a6\u03cc\u03c1\u03c4\u03c9\u03c3\u03b7 \u03a7\u03ac\u03c1\u03c4\u03b7..."
  },
  "gxp.plugins.MapBoxSource.prototype": {
    title: "MapBox Layers",
    blueMarbleTopoBathyJanTitle: "Blue Marble Topography & Bathymetry (January)",
    blueMarbleTopoBathyJulTitle: "Blue Marble Topography & Bathymetry (July)",
    blueMarbleTopoJanTitle: "Blue Marble Topography (January)",
    blueMarbleTopoJulTitle: "Blue Marble Topography (July)",
    controlRoomTitle: "Control Room",
    geographyClassTitle: "Geography Class",
    naturalEarthHypsoTitle: "Natural Earth Hypsometric",
    naturalEarthHypsoBathyTitle: "Natural Earth Hypsometric & Bathymetry",
    naturalEarth1Title: "Natural Earth I",
    naturalEarth2Title: "Natural Earth II",
    worldDarkTitle: "World Dark",
    worldLightTitle: "World Light",
    worldPrintTitle: "World Print"
  },
  "gxp.plugins.Measure.prototype": {
    buttonText: "\u039c\u03ad\u03c4\u03c1\u03bf",
    lengthMenuText: "\u0391\u03c0\u03cc\u03c3\u03c4\u03b1\u03c3\u03b7",
    areaMenuText: "\u0395\u03bc\u03b2\u03b1\u03b4\u03cc\u03bd",
    lengthTooltip: "\u03a5\u03c0\u03bf\u03bb\u03bf\u03b3\u03af\u03c3\u03c4\u03b5 \u03b1\u03c0\u03cc\u03c3\u03c4\u03b1\u03c3\u03b7",
    areaTooltip: "\u03a5\u03c0\u03bf\u03bb\u03bf\u03b3\u03af\u03c3\u03c4\u03b5 \u03b5\u03bc\u03b2\u03b1\u03b4\u03cc\u03bd",
    measureTooltip: "\u039c\u03ad\u03c4\u03c1\u03bf"
  },
  "gxp.plugins.Navigation.prototype": {
    menuText: "\u039c\u03b5\u03c4\u03b1\u03ba\u03b9\u03bd\u03ae\u03c3\u03c4\u03b5 \u03a7\u03ac\u03c1\u03c4\u03b7",
    tooltip: "\u039c\u03b5\u03c4\u03b1\u03ba\u03b9\u03bd\u03ae\u03c3\u03c4\u03b5 \u03a7\u03ac\u03c1\u03c4\u03b7"
  },
  "gxp.plugins.NavigationHistory.prototype": {
    previousMenuText: "\u0396\u03bf\u03c5\u03bc \u03a3\u03c4\u03bf \u03a0\u03c1\u03bf\u03b7\u03b3\u03bf\u03cd\u03bc\u03b5\u03bd\u03bf \u0395\u03c0\u03af\u03c0\u03b5\u03b4\u03bf",
    nextMenuText: "\u0396\u03bf\u03c5\u03bc \u03a3\u03c4\u03bf \u0395\u03c0\u03cc\u03bc\u03b5\u03bd\u03bf \u0395\u03c0\u03af\u03c0\u03b5\u03b4\u03bf",
    previousTooltip: "\u0396\u03bf\u03c5\u03bc \u03a3\u03c4\u03bf \u03a0\u03c1\u03bf\u03b7\u03b3\u03bf\u03cd\u03bc\u03b5\u03bd\u03bf \u0395\u03c0\u03af\u03c0\u03b5\u03b4\u03bf",
    nextTooltip: "\u0396\u03bf\u03c5\u03bc \u03a3\u03c4\u03bf \u0395\u03c0\u03cc\u03bc\u03b5\u03bd\u03bf \u0395\u03c0\u03af\u03c0\u03b5\u03b4\u03bf"
  },
  "gxp.plugins.OSMSource.prototype": {
    title: "\u0395\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b5\u03c2 OpenStreetMap",
    mapnikAttribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
    osmarenderAttribution: "\u0394\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03b1 CC-By-SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>"
  },
  "gxp.plugins.Print.prototype": {
    buttonText: "\u0395\u03ba\u03c4\u03cd\u03c0\u03c9\u03c3\u03b7",
    menuText: "\u0395\u03ba\u03c4\u03cd\u03c0\u03c9\u03c3\u03b7 \u03a7\u03ac\u03c1\u03c4\u03b7",
    tooltip: "\u0395\u03ba\u03c4\u03cd\u03c0\u03c9\u03c3\u03b7 \u03a7\u03ac\u03c1\u03c4\u03b7",
    previewText: "\u03a0\u03c1\u03bf\u03b5\u03c0\u03b9\u03c3\u03ba\u03cc\u03c0\u03b7\u03c3\u03b7 \u0395\u03ba\u03c4\u03cd\u03c0\u03c9\u03c3\u03b7\u03c2",
    notAllNotPrintableText: "\u0394\u03b5\u03bd \u039c\u03c0\u03bf\u03c1\u03bf\u03cd\u03bd \u039d\u03b1 \u0395\u03ba\u03c4\u03c5\u03c0\u03c9\u03b8\u03bf\u03cd\u03bd \u038c\u03bb\u03b5\u03c2 \u039f\u03b9 \u0395\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b5\u03c2",
    nonePrintableText: "\u039a\u03b1\u03bc\u03af\u03b1 \u03b1\u03c0\u03cc \u03c4\u03b9\u03c2 \u03b5\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b5\u03c2 \u03c4\u03bf\u03c5 \u03c4\u03c1\u03ad\u03c7\u03bf\u03bd\u03c4\u03bf\u03c2 \u03c7\u03ac\u03c1\u03c4\u03b7 \u03b4\u03b5\u03bd \u03bc\u03c0\u03bf\u03c1\u03b5\u03af \u03bd\u03b1 \u03b5\u03ba\u03c4\u03c5\u03c0\u03c9\u03b8\u03b5\u03af"
  },
  "gxp.plugins.MapQuestSource.prototype": {
    title: "\u0395\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b5\u03c2 MapQuest",
    osmAttribution: "\u03a0\u03bb\u03b1\u03ba\u03af\u03b4\u03b9\u03b1 \u03a0\u03c1\u03bf\u03c3\u03c6\u03bf\u03c1\u03ac \u03a4\u03c9\u03bd <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
    osmTitle: "MapQuest OpenStreetMap",
    naipAttribution: "\u03a0\u03bb\u03b1\u03ba\u03af\u03b4\u03b9\u03b1 \u03a0\u03c1\u03bf\u03c3\u03c6\u03bf\u03c1\u03ac \u03a4\u03c9\u03bd of <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
    naipTitle: "\u0395\u03b9\u03ba\u03cc\u03bd\u03b5\u03c2 MapQuest"
  },
  "gxp.plugins.QueryForm.prototype": {
    queryActionText: "\u0395\u03c0\u03b5\u03c1\u03ce\u03c4\u03b7\u03c3\u03b7",
    queryMenuText: "\u0395\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b1 \u03b5\u03c0\u03b5\u03c1\u03ce\u03c4\u03b7\u03c3\u03b7\u03c2",
    queryActionTip: "\u039a\u03ac\u03bd\u03c4\u03b5 \u03b5\u03c0\u03b5\u03c1\u03ce\u03c4\u03b7\u03c3\u03b7 \u03c3\u03c4\u03b7\u03bd \u03b5\u03c0\u03b9\u03bb\u03b5\u03b3\u03bc\u03ad\u03bd\u03b7 \u03b5\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b1",
    queryByLocationText: "Query by current map extent",
    queryByAttributesText: "\u0395\u03c0\u03b5\u03c1\u03ce\u03c4\u03b7\u03c3\u03b7 \u03b2\u03ac\u03c3\u03b5\u03b9 \u03c7\u03b1\u03c1\u03b1\u03ba\u03c4\u03b7\u03c1\u03b9\u03c3\u03c4\u03b9\u03ba\u03ce\u03bd",
    queryMsg: "\u0393\u03af\u03bd\u03b5\u03c4\u03b1\u03b9 \u03b5\u03c0\u03b5\u03c1\u03ce\u03c4\u03b7\u03c3\u03b7...",
    cancelButtonText: "\u0391\u03ba\u03cd\u03c1\u03c9\u03c3\u03b7",
    noFeaturesTitle: "\u039a\u03b1\u03bd\u03ad\u03bd\u03b1 \u0391\u03c0\u03bf\u03c4\u03ad\u03bb\u03b5\u03c3\u03bc\u03b1",
    noFeaturesMessage: "\u0397 \u03b5\u03c0\u03b5\u03c1\u03ce\u03c4\u03b7\u03c3\u03b7 \u03c3\u03b1\u03c2 \u03b4\u03b5\u03bd \u03b5\u03c0\u03ad\u03c3\u03c4\u03c1\u03b5\u03c8\u03b5 \u03b1\u03c0\u03bf\u03c4\u03b5\u03bb\u03ad\u03c3\u03bc\u03b1\u03c4\u03b1."
  },
  "gxp.plugins.RemoveLayer.prototype": {
    removeMenuText: "\u039a\u03b1\u03c4\u03ac\u03c1\u03b3\u03b7\u03c3\u03b7 \u03b5\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b1\u03c2",
    removeActionTip: "\u039a\u03b1\u03c4\u03ac\u03c1\u03b3\u03b7\u03c3\u03b7 \u03b5\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b1\u03c2"
  },
  "gxp.plugins.Styler.prototype": {
    menuText: "\u0395\u03c0\u03b5\u03be\u03b5\u03c1\u03b3\u03b1\u03c3\u03af\u03b1 \u03a3\u03c4\u03c5\u03bb",
    tooltip: "\u0395\u03c0\u03b5\u03be\u03b5\u03c1\u03b3\u03b1\u03c3\u03af\u03b1 \u03c3\u03c4\u03c5\u03bb \u03b5\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b1\u03c2"
  },
  "gxp.plugins.WMSGetFeatureInfo.prototype": {
    buttonText: "Identify",
    infoActionTip: "\u03a0\u03ac\u03c1\u03c4\u03b5 \u03a0\u03bb\u03b7\u03c1\u03bf\u03c6\u03bf\u03c1\u03af\u03b5\u03c2 \u03a7\u03b1\u03c1\u03b1\u03ba\u03c4\u03b7\u03c1\u03b9\u03c3\u03c4\u03b9\u03ba\u03bf\u03cd",
    popupTitle: "\u03a0\u03bb\u03b7\u03c1\u03bf\u03c6\u03bf\u03c1\u03af\u03b5\u03c2 \u03a7\u03b1\u03c1\u03b1\u03ba\u03c4\u03b7\u03c1\u03b9\u03c3\u03c4\u03b9\u03ba\u03bf\u03cd"
  },
  "gxp.plugins.Zoom.prototype": {
    zoomMenuText: "Zoom Box",
    zoomInMenuText: "\u0396\u03bf\u03c5\u03bc \u039c\u03ad\u03c3\u03b1",
    zoomOutMenuText: "\u0396\u03bf\u03c5\u03bc \u0388\u03be\u03c9",
    zoomTooltip: "Zoom by dragging a box",
    zoomInTooltip: "\u0396\u03bf\u03c5\u03bc \u039c\u03ad\u03c3\u03b1",
    zoomOutTooltip: "\u0396\u03bf\u03c5\u03bc \u0388\u03be\u03c9"
  },
  "gxp.plugins.ZoomToExtent.prototype": {
    menuText: "\u0396\u03bf\u03c5\u03bc \u03a3\u03c4\u03bf \u039c\u03ad\u03b3\u03b9\u03c3\u03c4\u03bf \u0395\u03cd\u03c1\u03bf\u03c2",
    tooltip: "\u0396\u03bf\u03c5\u03bc \u03a3\u03c4\u03bf \u039c\u03ad\u03b3\u03b9\u03c3\u03c4\u03bf \u0395\u03cd\u03c1\u03bf\u03c2"
  },
  "gxp.plugins.ZoomToDataExtent.prototype": {
    menuText: "\u0396\u03bf\u03c5\u03bc \u03c3\u03c4\u03bf \u03b5\u03cd\u03c1\u03bf\u03c2 \u03b5\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b1\u03c2",
    tooltip: "\u0396\u03bf\u03c5\u03bc \u03c3\u03c4\u03bf \u03b5\u03cd\u03c1\u03bf\u03c2 \u03b5\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b1\u03c2"
  },
  "gxp.plugins.ZoomToLayerExtent.prototype": {
    menuText: "\u0396\u03bf\u03c5\u03bc \u03c3\u03c4\u03bf \u03b5\u03cd\u03c1\u03bf\u03c2 \u03b5\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b1\u03c2",
    tooltip: "\u0396\u03bf\u03c5\u03bc \u03c3\u03c4\u03bf \u03b5\u03cd\u03c1\u03bf\u03c2 \u03b5\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b1\u03c2"
  },
  "gxp.plugins.ZoomToSelectedFeatures.prototype": {
    menuText: "\u0396\u03bf\u03c5\u03bc \u03c3\u03c4\u03b1 \u03c3\u03c5\u03b3\u03ba\u03b5\u03ba\u03c1\u03b9\u03bc\u03ad\u03bd\u03b1 \u03c7\u03b1\u03c1\u03b1\u03ba\u03c4\u03b7\u03c1\u03b9\u03c3\u03c4\u03b9\u03ba\u03ac",
    tooltip: "\u0396\u03bf\u03c5\u03bc \u03c3\u03c4\u03b1 \u03c3\u03c5\u03b3\u03ba\u03b5\u03ba\u03c1\u03b9\u03bc\u03ad\u03bd\u03b1 \u03c7\u03b1\u03c1\u03b1\u03ba\u03c4\u03b7\u03c1\u03b9\u03c3\u03c4\u03b9\u03ba\u03ac"
  },
  "gxp.FeatureEditPopup.prototype": {
    closeMsgTitle: "\u0391\u03c0\u03bf\u03b8\u03ae\u03ba\u03b5\u03c5\u03c3\u03b7 \u0391\u03bb\u03bb\u03b1\u03b3\u03ce\u03bd;",
    closeMsg: "\u0391\u03c5\u03c4\u03cc \u03c4\u03bf \u03c7\u03b1\u03c1\u03b1\u03ba\u03c4\u03b7\u03c1\u03b9\u03c3\u03c4\u03b9\u03ba\u03cc \u03ad\u03c7\u03b5\u03b9 \u03c4\u03c1\u03bf\u03c0\u03bf\u03c0\u03bf\u03b9\u03ae\u03c3\u03b5\u03b9\u03c2 \u03c0\u03bf\u03c5 \u03b4\u03b5\u03bd \u03ad\u03c7\u03bf\u03c5\u03bd \u03b1\u03c0\u03bf\u03b8\u03b7\u03ba\u03b5\u03c5\u03c4\u03b5\u03af. \u0398\u03ad\u03bb\u03b5\u03c4\u03b5 \u03bd\u03b1 \u03c6\u03c5\u03bb\u03ac\u03be\u03b5\u03c4\u03b5 \u03c4\u03b9\u03c2 \u03b1\u03bb\u03bb\u03b1\u03b3\u03ad\u03c2 \u03c3\u03b1\u03c2;",
    deleteMsgTitle: "\u0394\u03b9\u03b1\u03b3\u03c1\u03b1\u03c6\u03ae \u03a7\u03b1\u03c1\u03b1\u03ba\u03c4\u03b7\u03c1\u03b9\u03c3\u03c4\u03b9\u03ba\u03bf\u03cd",
    deleteMsg: "\u0395\u03af\u03c3\u03c4\u03b5 \u03c3\u03af\u03b3\u03bf\u03c5\u03c1\u03bf\u03b9 \u03bf\u03c4\u03b9 \u03b8\u03ad\u03bb\u03b5\u03c4\u03b5 \u03bd\u03b1 \u03b4\u03b9\u03b1\u03b3\u03c1\u03ac\u03c8\u03b5\u03c4\u03b5 \u03c4\u03bf \u03c3\u03c5\u03b3\u03ba\u03b5\u03ba\u03c1\u03b9\u03bc\u03ad\u03bd\u03bf \u03c7\u03b1\u03c1\u03b1\u03ba\u03c4\u03b7\u03c1\u03b9\u03c3\u03c4\u03b9\u03ba\u03cc",
    editButtonText: "\u03a4\u03c1\u03bf\u03c0\u03bf\u03c0\u03bf\u03af\u03b7\u03c3\u03b7",
    editButtonTooltip: "\u039a\u03ac\u03bd\u03c4\u03b5 \u03b1\u03c5\u03c4\u03cc \u03c4\u03bf \u03c7\u03b1\u03c1\u03b1\u03ba\u03c4\u03b7\u03c1\u03b9\u03c3\u03c4\u03b9\u03ba\u03cc \u03c4\u03c1\u03bf\u03c0\u03bf\u03c0\u03bf\u03b9\u03ae\u03c3\u03b9\u03bc\u03bf",
    deleteButtonText: "\u0394\u03b9\u03b1\u03b3\u03c1\u03b1\u03c6\u03ae",
    deleteButtonTooltip: "\u0394\u03b9\u03b1\u03b3\u03c1\u03ac\u03c8\u03c4\u03b5 \u03b1\u03c5\u03c4\u03cc \u03c4\u03bf \u03c7\u03b1\u03c1\u03b1\u03ba\u03c4\u03b7\u03c1\u03b9\u03c3\u03c4\u03b9\u03ba\u03cc",
    cancelButtonText: "\u0391\u03ba\u03cd\u03c1\u03c9\u03c3\u03b7",
    cancelButtonTooltip: "\u03a3\u03c4\u03b1\u03bc\u03b1\u03c4\u03ae\u03c3\u03c4\u03b5 \u03c4\u03b7\u03bd \u03c4\u03c1\u03bf\u03c0\u03bf\u03c0\u03bf\u03af\u03b7\u03c3\u03b7, \u03b1\u03c0\u03bf\u03c1\u03c1\u03af\u03c0\u03c4\u03bf\u03bd\u03c4\u03b1\u03c2 \u03bf\u03c0\u03bf\u03b9\u03b5\u03c3\u03b4\u03ae\u03c0\u03bf\u03c4\u03b5 \u03b1\u03bb\u03bb\u03b1\u03b3\u03ad\u03c2",
    saveButtonText: "\u0391\u03c0\u03bf\u03b8\u03ae\u03ba\u03b5\u03c5\u03c3\u03b7",
    saveButtonTooltip: "\u0391\u03c0\u03bf\u03b8\u03ae\u03ba\u03b5\u03c5\u03c3\u03b7 \u03b1\u03bb\u03bb\u03b1\u03b3\u03ce\u03bd"
  },
  "gxp.FillSymbolizer.prototype": {
    fillText: "\u0393\u03ad\u03bc\u03b9\u03c3\u03bc\u03b1",
    colorText: "\u03a7\u03c1\u03ce\u03bc\u03b1",
    opacityText: "\u0391\u03b4\u03b9\u03b1\u03c6\u03ac\u03bd\u03b5\u03b9\u03b1"
  },
  "gxp.FilterBuilder.prototype": {
    builderTypeNames: ["\u03bf\u03c0\u03bf\u03b9\u03bf\u03b4\u03ae\u03c0\u03bf\u03c4\u03b5", "\u03cc\u03bb\u03b1", "\u03ba\u03b1\u03bd\u03ad\u03bd\u03b1", "\u03cc\u03c7\u03b9 \u03cc\u03bb\u03b1"],
    preComboText: "\u03a4\u03b1\u03cd\u03c4\u03b9\u03c3\u03b7",
    postComboText: "\u03c4\u03c9\u03bd \u03b1\u03ba\u03cc\u03bb\u03bf\u03c5\u03b8\u03c9\u03bd:",
    addConditionText: "\u03c0\u03c1\u03bf\u03c3\u03b8\u03ae\u03ba\u03b7 \u03c3\u03c5\u03bd\u03b8\u03ae\u03ba\u03b7\u03c2",
    addGroupText: "\u03c0\u03c1\u03bf\u03c3\u03b8\u03ae\u03ba\u03b7 \u03bf\u03bc\u03ac\u03b4\u03b1\u03c2",
    removeConditionText: "\u03ba\u03b1\u03c4\u03ac\u03c1\u03b3\u03b7\u03c3\u03b7 \u03c3\u03c5\u03bd\u03b8\u03ae\u03ba\u03b7\u03c2"
  },
  "gxp.grid.CapabilitiesGrid.prototype": {
    nameHeaderText: "\u038c\u03bd\u03bf\u03bc\u03b1",
    titleHeaderText: "\u03a4\u03af\u03c4\u03bb\u03bf\u03c2",
    queryableHeaderText: "\u039c\u03c0\u03bf\u03c1\u03bf\u03cd\u03bd \u03bd\u03b1 \u03b3\u03af\u03bd\u03bf\u03c5\u03bd \u03b5\u03c0\u03b5\u03c1\u03c9\u03c4\u03ae\u03c3\u03b5\u03b9\u03c2",
    layerSelectionLabel: "\u0394\u03b5\u03af\u03c4\u03b5 \u03b4\u03b9\u03b1\u03b8\u03ad\u03c3\u03b9\u03bc\u03b1 \u03b4\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03b1 \u03b1\u03c0\u03cc:",
    layerAdditionLabel: "\u03ae \u03c0\u03c1\u03bf\u03c3\u03b8\u03ad\u03c3\u03c4\u03b5 \u03bd\u03ad\u03bf \u03b4\u03b9\u03b1\u03ba\u03bf\u03bc\u03b9\u03c3\u03c4\u03ae.",
    expanderTemplateText: "<p><b>\u03a0\u03b5\u03c1\u03b9\u03b3\u03c1\u03b1\u03c6\u03ae:</b> {abstract}</p>"
  },
  "gxp.PointSymbolizer.prototype": {
    graphicCircleText: "\u03ba\u03cd\u03ba\u03bb\u03bf\u03c2",
    graphicSquareText: "\u03c4\u03b5\u03c4\u03c1\u03ac\u03b3\u03c9\u03bd\u03bf",
    graphicTriangleText: "\u03c4\u03c1\u03af\u03b3\u03c9\u03bd\u03bf",
    graphicStarText: "\u03b1\u03c3\u03c4\u03ad\u03c1\u03b9",
    graphicCrossText: "\u03c3\u03c4\u03b1\u03c5\u03c1\u03cc\u03c2",
    graphicXText: "\u03c7",
    graphicExternalText: "\u03b5\u03be\u03c9\u03c4\u03b5\u03c1\u03b9\u03ba\u03cc",
    urlText: "URL",
    opacityText: "\u03b1\u03b4\u03b9\u03b1\u03c6\u03ac\u03bd\u03b5\u03b9\u03b1",
    symbolText: "\u03a3\u03cd\u03bc\u03b2\u03bf\u03bb\u03bf",
    sizeText: "\u0395\u03cd\u03c1\u03bf\u03c2",
    rotationText: "\u03a0\u03b5\u03c1\u03b9\u03c3\u03c4\u03c1\u03bf\u03c6\u03ae"
  },
  "gxp.QueryPanel.prototype": {
    queryByLocationText: "\u0395\u03c0\u03b5\u03c1\u03ce\u03c4\u03b7\u03c3\u03b7 \u03b2\u03ac\u03c3\u03b5\u03b9 \u03c4\u03bf\u03c0\u03bf\u03b8\u03b5\u03c3\u03af\u03b1\u03c2",
    currentTextText: "\u03a4\u03c1\u03ad\u03c7\u03bf\u03bd \u03b5\u03cd\u03c1\u03bf\u03c2",
    queryByAttributesText: "\u0395\u03c0\u03b5\u03c1\u03ce\u03c4\u03b7\u03c3\u03b7 \u03b2\u03ac\u03c3\u03b5\u03b9 \u03c7\u03b1\u03c1\u03b1\u03ba\u03c4\u03b7\u03c1\u03b9\u03c3\u03c4\u03b9\u03ba\u03ce\u03bd",
    layerText: "\u0395\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b1"
  },
  "gxp.RulePanel.prototype": {
    scaleSliderTemplate: "{scaleType} \u039a\u03bb\u03af\u03bc\u03b1\u03ba\u03b1 1:{scale}",
    labelFeaturesText: "\u03a7\u03b1\u03c1\u03b1\u03ba\u03c4\u03b7\u03c1\u03b9\u03c3\u03c4\u03b9\u03ba\u03ac \u0395\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b1\u03c2",
    labelsText: "\u0395\u03c4\u03b9\u03ba\u03ad\u03c4\u03b5\u03c2",
    basicText: "\u0391\u03c0\u03bb\u03ae",
    advancedText: "\u03a0\u03c1\u03bf\u03b7\u03b3\u03bc\u03ad\u03bd\u03b7",
    limitByScaleText: "\u03a0\u03b5\u03c1\u03b9\u03bf\u03c1\u03b9\u03c3\u03bc\u03cc\u03c2 \u03b2\u03ac\u03c3\u03b5\u03b9 \u03ba\u03bb\u03af\u03bc\u03b1\u03ba\u03b1\u03c2",
    limitByConditionText: "\u03a0\u03b5\u03c1\u03b9\u03bf\u03c1\u03b9\u03c3\u03bc\u03cc\u03c2 \u03b2\u03ac\u03c3\u03b5\u03b9 \u03c3\u03c5\u03bd\u03b8\u03ae\u03ba\u03b7\u03c2",
    symbolText: "\u03a3\u03cd\u03bc\u03b2\u03bf\u03bb\u03bf",
    nameText: "\u038c\u03bd\u03bf\u03bc\u03b1"
  },
  "gxp.ScaleLimitPanel.prototype": {
    scaleSliderTemplate: "{scaleType} \u039a\u03bb\u03af\u03bc\u03b1\u03ba\u03b1 1:{scale}",
    minScaleLimitText: "\u038c\u03c1\u03b9\u03bf \u03b5\u03bb\u03ac\u03c7\u03b9\u03c3\u03c4\u03b7\u03c2 \u03ba\u03bb\u03af\u03bc\u03b1\u03ba\u03b1\u03c2",
    maxScaleLimitText: "\u038c\u03c1\u03b9\u03bf \u03bc\u03ad\u03b3\u03b9\u03c3\u03c4\u03b7\u03c2 \u03ba\u03bb\u03af\u03bc\u03b1\u03ba\u03b1\u03c2"
  },
  "gxp.StrokeSymbolizer.prototype": {
    solidStrokeName: "\u03c3\u03c5\u03bc\u03c0\u03b1\u03b3\u03ae\u03c2",
    dashStrokeName: "\u03bc\u03b5 \u03c0\u03b1\u03cd\u03bb\u03b5\u03c2",
    dotStrokeName: "\u03bc\u03b5 \u03ba\u03bf\u03c5\u03ba\u03af\u03b4\u03b5\u03c2",
    titleText: "\u03a0\u03ad\u03c1\u03b1\u03c3\u03bc\u03b1",
    styleText: "\u03a3\u03c4\u03cd\u03bb\u03bf",
    colorText: "\u03a7\u03c1\u03ce\u03bc\u03b1",
    widthText: "\u03a0\u03bb\u03ac\u03c4\u03bf\u03c2",
    opacityText: "\u0391\u03b4\u03b9\u03b1\u03c6\u03ac\u03bd\u03b5\u03b9\u03b1"
  },
  "gxp.StylePropertiesDialog.prototype": {
    titleText: "\u0393\u03b5\u03bd\u03b9\u03ba\u03ac",
    nameFieldText: "\u038c\u03bd\u03bf\u03bc\u03b1",
    titleFieldText: "\u03a4\u03af\u03c4\u03bb\u03bf\u03c2",
    abstractFieldText: "\u03a0\u03b5\u03c1\u03af\u03bb\u03b7\u03c8\u03b7"
  },
  "gxp.TextSymbolizer.prototype": {
    labelValuesText: "\u03a4\u03b9\u03bc\u03ad\u03c2 \u03b5\u03c4\u03b9\u03ba\u03ad\u03c4\u03b1\u03c2",
    haloText: "\u03a6\u03c9\u03c4\u03bf\u03c3\u03c4\u03ad\u03c6\u03b1\u03bd\u03bf",
    sizeText: "\u039c\u03ad\u03b3\u03b5\u03b8\u03bf\u03c2"
  },
  "gxp.WMSLayerPanel.prototype": {
    aboutText: "\u03a3\u03c7\u03b5\u03c4\u03b9\u03ba\u03ac \u03bc\u03b5",
    titleText: "\u03a4\u03af\u03c4\u03bb\u03bf\u03c2",
    nameText: "\u038c\u03bd\u03bf\u03bc\u03b1",
    descriptionText: "\u03a0\u03b5\u03c1\u03b9\u03b3\u03c1\u03b1\u03c6\u03ae",
    displayText: "\u03a0\u03c1\u03bf\u03b2\u03bf\u03bb\u03ae",
    opacityText: "\u0391\u03b4\u03b9\u03b1\u03c6\u03ac\u03bd\u03b5\u03b9\u03b1",
    formatText: "\u03a4\u03cd\u03c0\u03bf\u03c2",
    transparentText: "\u0394\u03b9\u03b1\u03c6\u03b1\u03bd\u03ad\u03c2",
    cacheText: "Cache",
    cacheFieldText: "\u03a7\u03c1\u03b7\u03c3\u03b9\u03bc\u03bf\u03c0\u03bf\u03af\u03b7\u03c3\u03b5 \u03c4\u03b7\u03bd cached \u03ad\u03ba\u03b4\u03bf\u03c3\u03b7",
    stylesText: "\u0394\u03b9\u03b1\u03b8\u03ad\u03c3\u03b9\u03bc\u03b5\u03c2 \u03a3\u03c4\u03c5\u03bb",
    infoFormatText: "Info format",
    infoFormatEmptyText: "Select a format",
    displayOptionsText: "Display options",
    queryText: "Limit with filters",
    scaleText: "Limit by scale",
    minScaleText: "Min scale",
    maxScaleText: "Max scale",
    switchToFilterBuilderText: "Switch back to filter builder",
    cqlPrefixText: "or ",
    cqlText: "use CQL filter instead",
    singleTileText: "Single tile",
    singleTileFieldText: "Use a single tile"
  },
  "gxp.EmbedMapDialog.prototype": {
    publishMessage: "\u039f \u03c7\u03ac\u03c1\u03c4\u03b7\u03c2 \u03c3\u03b1\u03c2 \u03b5\u03af\u03bd\u03b1\u03b9 \u03ad\u03c4\u03bf\u03b9\u03bc\u03bf\u03c2 \u03bd\u03b1 \u03b4\u03b7\u03bc\u03bf\u03c3\u03b9\u03b5\u03c5\u03c4\u03b5\u03af \u03c3\u03c4\u03bf \u03b4\u03b9\u03b1\u03b4\u03af\u03ba\u03c4\u03c5\u03bf! \u0391\u03c0\u03bb\u03ac \u03b1\u03bd\u03c4\u03b9\u03b3\u03c1\u03ac\u03c8\u03c4\u03b5 \u03c4\u03bf\u03bd \u03b1\u03ba\u03cc\u03bb\u03bf\u03c5\u03b8\u03bf HTML \u03ba\u03ce\u03b4\u03b9\u03ba\u03b1 \u03b3\u03b9\u03b1 \u03bd\u03b1 \u03b5\u03bd\u03c3\u03c9\u03bc\u03b1\u03c4\u03ce\u03c3\u03b5\u03c4\u03b5 \u03c4\u03bf\u03bd \u03c7\u03ac\u03c1\u03c4\u03b7 \u03c3\u03c4\u03b7\u03bd \u03b9\u03c3\u03c4\u03bf\u03c3\u03b5\u03bb\u03af\u03b4\u03b1 \u03c3\u03b1\u03c2:",
    heightLabel: "\u038e\u03c8\u03bf\u03c2",
    widthLabel: "\u03a0\u03bb\u03ac\u03c4\u03bf\u03c2",
    mapSizeLabel: "\u039c\u03ad\u03b3\u03b5\u03b8\u03bf\u03c2 \u03a7\u03ac\u03c1\u03c4\u03b7",
    miniSizeLabel: "\u039c\u03b9\u03ba\u03c1\u03bf\u03b3\u03c1\u03b1\u03c6\u03af\u03b1",
    smallSizeLabel: "\u039c\u03b9\u03ba\u03c1\u03cc",
    premiumSizeLabel: "\u0395\u03be\u03b1\u03b9\u03c1\u03b5\u03c4\u03b9\u03ba\u03ac \u03c0\u03bf\u03b9\u03bf\u03c4\u03b9\u03ba\u03cc",
    largeSizeLabel: "\u039c\u03b5\u03b3\u03ac\u03bb\u03bf\u03c2"
  },
  "gxp.WMSStylesDialog.prototype": {
    addStyleText: "\u03a0\u03c1\u03bf\u03c3\u03b8\u03ae\u03ba\u03b7",
    addStyleTip: "\u03a0\u03c1\u03bf\u03c3\u03b8\u03ae\u03ba\u03b7 \u03bd\u03ad\u03bf\u03c5 \u03c3\u03c4\u03c5\u03bb",
    chooseStyleText: "\u0395\u03c0\u03b9\u03bb\u03bf\u03b3\u03ae \u03c3\u03c4\u03c5\u03bb",
    deleteStyleText: "\u0391\u03c6\u03b1\u03af\u03c1\u03b5\u03c3\u03b7",
    deleteStyleTip: "\u0394\u03b9\u03b1\u03b3\u03c1\u03b1\u03c6\u03ae \u03c4\u03bf\u03c5 \u03b5\u03c0\u03b9\u03bb\u03b5\u03b3\u03bc\u03ad\u03bd\u03bf\u03c5 \u03c3\u03c4\u03c5\u03bb",
    editStyleText: "\u0395\u03c0\u03b5\u03be\u03b5\u03c1\u03b3\u03b1\u03c3\u03af\u03b1",
    editStyleTip: "\u0395\u03c0\u03b5\u03be\u03b5\u03c1\u03b3\u03b1\u03c3\u03af\u03b1 \u03c4\u03bf\u03c5 \u03b5\u03c0\u03b9\u03bb\u03b5\u03b3\u03bc\u03ad\u03bd\u03bf\u03c5 \u03c3\u03c4\u03c5\u03bb",
    duplicateStyleText: "\u0394\u03b9\u03c0\u03bb\u03cc\u03c4\u03c5\u03c0\u03bf",
    duplicateStyleTip: "\u03a6\u03c4\u03b9\u03ac\u03be\u03c4\u03b5 \u03b4\u03b9\u03c0\u03bb\u03cc\u03c4\u03c5\u03c0\u03bf \u03c4\u03bf\u03c5 \u03b5\u03c0\u03b9\u03bb\u03b5\u03b3\u03bc\u03ad\u03bd\u03bf\u03c5 \u03c3\u03c4\u03cd\u03bb",
    addRuleText: "\u03a0\u03c1\u03bf\u03c3\u03b8\u03ae\u03ba\u03b7",
    addRuleTip: "\u03a0\u03c1\u03bf\u03c3\u03b8\u03ae\u03ba\u03b7 \u03bd\u03ad\u03bf\u03c5 \u03ba\u03b1\u03bd\u03cc\u03bd\u03b1",
    newRuleText: "\u039d\u03ad\u03bf\u03c2 \u039a\u03b1\u03bd\u03cc\u03bd\u03b1\u03c2",
    deleteRuleText: "\u0391\u03c6\u03b1\u03af\u03c1\u03b5\u03c3\u03b7",
    deleteRuleTip: "\u0394\u03b9\u03b1\u03b3\u03c1\u03ac\u03c8\u03c4\u03b5 \u03c4\u03bf\u03bd \u03b5\u03c0\u03b9\u03bb\u03b5\u03b3\u03bc\u03ad\u03bd\u03bf \u03ba\u03b1\u03bd\u03cc\u03bd\u03b1",
    editRuleText: "\u0395\u03c0\u03b5\u03be\u03b5\u03c1\u03b3\u03b1\u03c3\u03af\u03b1",
    editRuleTip: "\u0395\u03c0\u03b5\u03be\u03b5\u03c1\u03b3\u03b1\u03c3\u03c4\u03b5\u03af\u03c4\u03b5 \u03c4\u03bf\u03bd \u03b5\u03c0\u03b9\u03bb\u03b5\u03b3\u03bc\u03ad\u03bd\u03bf \u03ba\u03b1\u03bd\u03cc\u03bd\u03b1",
    duplicateRuleText: "\u0394\u03b9\u03c0\u03bb\u03cc\u03c4\u03c5\u03c0\u03bf",
    duplicateRuleTip: "\u03a6\u03c4\u03b9\u03ac\u03be\u03c4\u03b5 \u03b4\u03b9\u03c0\u03bb\u03cc\u03c4\u03c5\u03c0\u03bf \u03c4\u03bf\u03c5 \u03b5\u03c0\u03b9\u03bb\u03b5\u03b3\u03bc\u03ad\u03bd\u03bf\u03c5 \u03ba\u03b1\u03bd\u03cc\u03bd\u03b1",
    cancelText: "\u0391\u03ba\u03cd\u03c1\u03c9\u03c3\u03b7",
    saveText: "\u0391\u03c0\u03bf\u03b8\u03ae\u03ba\u03b5\u03c5\u03c3\u03b7",
    styleWindowTitle: "\u03a3\u03c4\u03c5\u03bb \u03a7\u03c1\u03ae\u03c3\u03c4\u03b7: {0}",
    ruleWindowTitle: "\u039a\u03b1\u03bd\u03cc\u03bd\u03b5\u03c2 \u03a3\u03c4\u03c5\u03bb: {0}",
    stylesFieldsetTitle: "\u03a3\u03c4\u03c5\u03bb",
    rulesFieldsetTitle: "\u039a\u03b1\u03bd\u03cc\u03bd\u03b5\u03c2"
  },
  "gxp.LayerUploadPanel.prototype": {
    titleLabel: "\u03a4\u03af\u03c4\u03bb\u03bf\u03c2",
    titleEmptyText: "\u03a4\u03af\u03c4\u03bb\u03bf\u03c2 \u03b5\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b1\u03c2",
    abstractLabel: "\u03a0\u03b5\u03c1\u03b9\u03b3\u03c1\u03b1\u03c6\u03ae",
    abstractEmptyText: "\u03a0\u03b5\u03c1\u03b9\u03b3\u03c1\u03b1\u03c6\u03ae \u03b5\u03c0\u03b9\u03c6\u03ac\u03bd\u03b5\u03b9\u03b1\u03c2",
    fileLabel: "\u0394\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03b1",
    fieldEmptyText: "\u0392\u03c1\u03b5\u03af\u03c4\u03b5 \u03c4\u03bf \u03bc\u03bf\u03bd\u03bf\u03c0\u03ac\u03c4\u03b9 \u03b3\u03b9\u03b1 \u03ad\u03bd\u03b1 \u03b1\u03c1\u03c7\u03b5\u03af\u03bf \u03b4\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03c9\u03bd...",
    uploadText: "\u0391\u03bd\u03ad\u03b2\u03b1\u03c3\u03bc\u03b1",
    uploadFailedText: "Upload failed",
    processingUploadText: "Processing upload...",
    waitMsgText: "\u03a4\u03b1 \u03b4\u03b5\u03b4\u03bf\u03bc\u03ad\u03bd\u03b1 \u03c3\u03b1\u03c2 \u03b1\u03bd\u03b5\u03b2\u03b1\u03af\u03bd\u03bf\u03c5\u03bd...",
    invalidFileExtensionText: "\u039f \u03c4\u03cd\u03c0\u03bf\u03c2 \u03b1\u03c1\u03c7\u03b5\u03af\u03bf\u03c5 \u03c0\u03c1\u03ad\u03c0\u03b5\u03b9 \u03bd\u03b1 \u03b5\u03af\u03bd\u03b1\u03b9 \u03ad\u03bd\u03b1\u03c2 \u03b1\u03c0\u03cc \u03c4\u03bf\u03c5\u03c2: ",
    optionsText: "\u0395\u03c0\u03b9\u03bb\u03bf\u03b3\u03ad\u03c2",
    workspaceLabel: "\u03a7\u03ce\u03c1\u03bf\u03c2 \u03b5\u03c1\u03b3\u03b1\u03c3\u03af\u03b1\u03c2",
    workspaceEmptyText: "\u03a0\u03c1\u03bf\u03b5\u03c0\u03b9\u03bb\u03b5\u03b3\u03bc\u03ad\u03bd\u03bf\u03c2 \u03c7\u03ce\u03c1\u03bf\u03c2 \u03b5\u03c1\u03b3\u03b1\u03c3\u03af\u03b1\u03c2",
    dataStoreLabel: "\u0391\u03c0\u03bf\u03b8\u03ae\u03ba\u03b7",
    dataStoreEmptyText: "Create new store",
    defaultDataStoreEmptyText: "\u03a0\u03c1\u03bf\u03b5\u03c0\u03b9\u03bb\u03b5\u03b3\u03bc\u03ad\u03bd\u03b7 \u03b1\u03c0\u03bf\u03b8\u03ae\u03ba\u03b7"
  },
  "gxp.NewSourceWindow.prototype": {
    title: "\u03a0\u03c1\u03bf\u03c3\u03b8\u03ae\u03ba\u03b7 \u039d\u03ad\u03bf\u03c5 \u0394\u03b9\u03b1\u03ba\u03bf\u03bc\u03b9\u03c3\u03c4\u03ae...",
    cancelText: "\u0391\u03ba\u03cd\u03c1\u03c9\u03c3\u03b7",
    addServerText: "\u03a0\u03c1\u03bf\u03c3\u03b8\u03ae\u03ba\u03b7 \u0394\u03b9\u03b1\u03ba\u03bf\u03bc\u03b9\u03c3\u03c4\u03ae",
    invalidURLText: "\u0395\u03af\u03c3\u03b1\u03b3\u03b5\u03c4\u03b5 \u03ad\u03bd\u03b1 \u03ad\u03b3\u03ba\u03c5\u03c1\u03bf URL \u03b3\u03b9\u03b1 \u03ad\u03bd\u03b1 WMS endpoint (e.g. http://example.com/geoserver/wms)",
    contactingServerText: "\u0395\u03c0\u03b9\u03ba\u03bf\u03b9\u03bd\u03c9\u03bd\u03af\u03b1 \u03bc\u03b5 \u0394\u03b9\u03b1\u03ba\u03bf\u03bc\u03b9\u03c3\u03c4\u03ae..."
  },
  "gxp.ScaleOverlay.prototype": {
    zoomLevelText: "\u0395\u03c0\u03af\u03c0\u03b5\u03b4\u03bf \u03b6\u03bf\u03c5\u03bc"
  },
  "gxp.Viewer.prototype": {
    saveErrorText: "Trouble saving: "
  },
  "gxp.FeedSourceDialog.prototype": {
    feedTypeText: "\u03a0\u03b7\u03b3\u03ae",
    addPicasaText: "\u03a6\u03c9\u03c4\u03bf\u03b3\u03c1\u03b1\u03c6\u03af\u03b5\u03c2 Picasa",
    addYouTubeText: "YouTube \u03b2\u03af\u03bd\u03c4\u03b5\u03bf",
    addRSSText: "\u0386\u03bb\u03bb\u03b1 Feed GeoRSS",
    addFeedText: "\u03a0\u03c1\u03bf\u03c3\u03b8\u03ae\u03ba\u03b7 \u03c3\u03c4\u03bf \u03c7\u03ac\u03c1\u03c4\u03b7",
    addTitleText: "\u03a4\u03af\u03c4\u03bb\u03bf\u03c2",
    keywordText: "\u039b\u03ad\u03be\u03b7-\u03ba\u03bb\u03b5\u03b9\u03b4\u03af",
    doneText: "Done",
    titleText: "\u03a0\u03c1\u03bf\u03c3\u03b8\u03ae\u03ba\u03b7 \u03c1\u03bf\u03ae\u03c2",
    maxResultsText: "Max \u0395\u03af\u03b4\u03b7"
  }
});
GeoExt.Lang.add("en", {
  "gxp.menu.LayerMenu.prototype": {
    layerText: "Layer"
  },
  "gxp.plugins.AddLayers.prototype": {
    addActionMenuText: "Add layers",
    addActionTip: "Add layers",
    addServerText: "Add a New Server",
    addButtonText: "Add layers",
    untitledText: "Untitled",
    addLayerSourceErrorText: "Error getting WMS capabilities ({msg}).\nPlease check the url and try again.",
    availableLayersText: "Available Layers",
    expanderTemplateText: "<p><b>Abstract:</b> {abstract}</p>",
    panelTitleText: "Title",
    layerSelectionText: "View available data from:",
    doneText: "Done",
    uploadText: "Upload layers",
    addFeedActionMenuText: "Add feeds",
    searchText: "Search for layers"
  },
  "gxp.plugins.BingSource.prototype": {
    title: "Bing Layers",
    roadTitle: "Bing Roads",
    aerialTitle: "Bing Aerial",
    labeledAerialTitle: "Bing Aerial With Labels"
  },
  "gxp.plugins.FeatureEditor.prototype": {
    splitButtonText: "Edit",
    createFeatureActionText: "Create",
    editFeatureActionText: "Modify",
    createFeatureActionTip: "Create a new feature",
    editFeatureActionTip: "Edit existing feature",
    commitTitle: "Commit message",
    commitText: "Please enter a commit message for this edit:"
  },
  "gxp.plugins.FeatureGrid.prototype": {
    displayFeatureText: "Display on map",
    firstPageTip: "First page",
    previousPageTip: "Previous page",
    zoomPageExtentTip: "Zoom to page extent",
    nextPageTip: "Next page",
    lastPageTip: "Last page",
    totalMsg: "Features {1} to {2} of {0}"
  },
  "gxp.plugins.GoogleEarth.prototype": {
    menuText: "3D Viewer",
    tooltip: "Switch to 3D Viewer"
  },
  "gxp.plugins.GoogleSource.prototype": {
    title: "Google Layers",
    roadmapAbstract: "Show street map",
    satelliteAbstract: "Show satellite imagery",
    hybridAbstract: "Show imagery with street names",
    terrainAbstract: "Show street map with terrain"
  },
  "gxp.plugins.LayerProperties.prototype": {
    menuText: "Layer Properties",
    toolTip: "Layer Properties"
  },
  "gxp.plugins.LayerTree.prototype": {
    shortTitle: "Layers",
    rootNodeText: "Layers",
    overlayNodeText: "Overlays",
    baseNodeText: "Base Layers"
  },
  "gxp.plugins.LayerManager.prototype": {
    baseNodeText: "Base Maps"
  },
  "gxp.plugins.Legend.prototype": {
    menuText: "Show legend",
    tooltip: "Show legend"
  },
  "gxp.plugins.LoadingIndicator.prototype": {
    loadingMapMessage: "Loading map..."
  },
  "gxp.plugins.MapBoxSource.prototype": {
    title: "MapBox Layers",
    blueMarbleTopoBathyJanTitle: "Blue Marble Topography & Bathymetry (January)",
    blueMarbleTopoBathyJulTitle: "Blue Marble Topography & Bathymetry (July)",
    blueMarbleTopoJanTitle: "Blue Marble Topography (January)",
    blueMarbleTopoJulTitle: "Blue Marble Topography (July)",
    controlRoomTitle: "Control Room",
    geographyClassTitle: "Geography Class",
    naturalEarthHypsoTitle: "Natural Earth Hypsometric",
    naturalEarthHypsoBathyTitle: "Natural Earth Hypsometric & Bathymetry",
    naturalEarth1Title: "Natural Earth I",
    naturalEarth2Title: "Natural Earth II",
    worldDarkTitle: "World Dark",
    worldLightTitle: "World Light",
    worldPrintTitle: "World Print"
  },
  "gxp.plugins.Measure.prototype": {
    buttonText: "Measure",
    lengthMenuText: "Length",
    areaMenuText: "Area",
    lengthTooltip: "Measure length",
    areaTooltip: "Measure area",
    measureTooltip: "Measure"
  },
  "gxp.plugins.Navigation.prototype": {
    menuText: "Pan map",
    tooltip: "Pan map"
  },
  "gxp.plugins.NavigationHistory.prototype": {
    previousMenuText: "Zoom to previous extent",
    nextMenuText: "Zoom to next extent",
    previousTooltip: "Zoom to previous extent",
    nextTooltip: "Zoom to next extent"
  },
  "gxp.plugins.OSMSource.prototype": {
    title: "OpenStreetMap Layers",
    mapnikAttribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
    osmarenderAttribution: "Data CC-By-SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>"
  },
  "gxp.plugins.Print.prototype": {
    buttonText: "Print",
    menuText: "Print map",
    tooltip: "Print map",
    previewText: "Print Preview",
    notAllNotPrintableText: "Not All Layers Can Be Printed",
    nonePrintableText: "None of your current map layers can be printed"
  },
  "gxp.plugins.MapQuestSource.prototype": {
    title: "MapQuest Layers",
    osmAttribution: "Tiles Courtesy of <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
    osmTitle: "MapQuest OpenStreetMap",
    naipAttribution: "Tiles Courtesy of <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
    naipTitle: "MapQuest Imagery"
  },
  "gxp.plugins.QueryForm.prototype": {
    queryActionText: "Query",
    queryMenuText: "Query layer",
    queryActionTip: "Query the selected layer",
    queryByLocationText: "Query by current map extent",
    queryByAttributesText: "Query by attributes",
    queryMsg: "Querying...",
    cancelButtonText: "Cancel",
    noFeaturesTitle: "No Match",
    noFeaturesMessage: "Your query did not return any results."
  },
  "gxp.plugins.RemoveLayer.prototype": {
    removeMenuText: "Remove layer",
    removeActionTip: "Remove layer"
  },
  "gxp.plugins.Styler.prototype": {
    menuText: "Layer Styles",
    tooltip: "Layer Styles"
  },
  "gxp.plugins.WMSGetFeatureInfo.prototype": {
    buttonText: "Identify",
    infoActionTip: "Get Feature Info",
    popupTitle: "Feature Info"
  },
  "gxp.plugins.Zoom.prototype": {
    zoomMenuText: "Zoom box",
    zoomInMenuText: "Zoom in",
    zoomOutMenuText: "Zoom out",
    zoomTooltip: "Zoom by dragging a box",
    zoomInTooltip: "Zoom in",
    zoomOutTooltip: "Zoom out"
  },
  "gxp.plugins.ZoomToExtent.prototype": {
    menuText: "Zoom to max extent",
    tooltip: "Zoom to max extent"
  },
  "gxp.plugins.ZoomToDataExtent.prototype": {
    menuText: "Zoom to layer extent",
    tooltip: "Zoom to layer extent"
  },
  "gxp.plugins.ZoomToLayerExtent.prototype": {
    menuText: "Zoom to layer extent",
    tooltip: "Zoom to layer extent"
  },
  "gxp.plugins.ZoomToSelectedFeatures.prototype": {
    menuText: "Zoom to selected features",
    tooltip: "Zoom to selected features"
  },
  "gxp.FeatureEditPopup.prototype": {
    closeMsgTitle: "Save Changes?",
    closeMsg: "This feature has unsaved changes. Would you like to save your changes?",
    deleteMsgTitle: "Delete Feature?",
    deleteMsg: "Are you sure you want to delete this feature?",
    editButtonText: "Edit",
    editButtonTooltip: "Make this feature editable",
    deleteButtonText: "Delete",
    deleteButtonTooltip: "Delete this feature",
    cancelButtonText: "Cancel",
    cancelButtonTooltip: "Stop editing, discard changes",
    saveButtonText: "Save",
    saveButtonTooltip: "Save changes"
  },
  "gxp.FillSymbolizer.prototype": {
    fillText: "Fill",
    colorText: "Color",
    opacityText: "Opacity"
  },
  "gxp.FilterBuilder.prototype": {
    builderTypeNames: ["any", "all", "none", "not all"],
    preComboText: "Match",
    postComboText: "of the following:",
    addConditionText: "add condition",
    addGroupText: "add group",
    removeConditionText: "remove condition"
  },
  "gxp.grid.CapabilitiesGrid.prototype": {
    nameHeaderText: "Name",
    titleHeaderText: "Title",
    queryableHeaderText: "Queryable",
    layerSelectionLabel: "View available data from:",
    layerAdditionLabel: "or add a new server.",
    expanderTemplateText: "<p><b>Abstract:</b> {abstract}</p>"
  },
  "gxp.PointSymbolizer.prototype": {
    graphicCircleText: "Circle",
    graphicSquareText: "Square",
    graphicTriangleText: "Triangle",
    graphicStarText: "Star",
    graphicCrossText: "Cross",
    graphicXText: "X",
    graphicExternalText: "External",
    urlText: "URL",
    opacityText: "opacity",
    symbolText: "Symbol",
    sizeText: "Size",
    rotationText: "Rotation"
  },
  "gxp.QueryPanel.prototype": {
    queryByLocationText: "Query by location",
    currentTextText: "Current extent",
    queryByAttributesText: "Query by attributes",
    layerText: "Layer"
  },
  "gxp.RulePanel.prototype": {
    scaleSliderTemplate: "{scaleType} Scale 1:{scale}",
    labelFeaturesText: "Label Features",
    labelsText: "Labels",
    basicText: "Basic",
    advancedText: "Advanced",
    limitByScaleText: "Limit by scale",
    limitByConditionText: "Limit by condition",
    symbolText: "Symbol",
    nameText: "Name"
  },
  "gxp.ScaleLimitPanel.prototype": {
    scaleSliderTemplate: "{scaleType} Scale 1:{scale}",
    minScaleLimitText: "Min scale limit",
    maxScaleLimitText: "Max scale limit"
  },
  "gxp.StrokeSymbolizer.prototype": {
    solidStrokeName: "Solid",
    dashStrokeName: "Dash",
    dotStrokeName: "Dot",
    titleText: "Stroke",
    styleText: "Style",
    colorText: "Color",
    widthText: "Width (px)",
    opacityText: "Opacity"
  },
  "gxp.StylePropertiesDialog.prototype": {
    titleText: "General",
    nameFieldText: "Name",
    titleFieldText: "Title",
    abstractFieldText: "Abstract"
  },
  "gxp.TextSymbolizer.prototype": {
    labelValuesText: "Label values",
    haloText: "Halo",
    sizeText: "Size"
  },
  "gxp.WMSLayerPanel.prototype": {
    attributionText: "Attribution",
    aboutText: "About",
    titleText: "Title",
    nameText: "Name",
    descriptionText: "Description",
    displayText: "Display",
    opacityText: "Opacity",
    formatText: "Format",
    transparentText: "Transparent",
    cacheText: "Cache",
    cacheFieldText: "Use cached version",
    stylesText: "Available Styles",
    infoFormatText: "Info format",
    infoFormatEmptyText: "Select a format",
    displayOptionsText: "Display options",
    queryText: "Limit with filters",
    scaleText: "Limit by scale",
    minScaleText: "Min scale",
    maxScaleText: "Max scale",
    switchToFilterBuilderText: "Switch back to filter builder",
    cqlPrefixText: "or ",
    cqlText: "use CQL filter instead",
    singleTileText: "Single tile",
    singleTileFieldText: "Use a single tile"
  },
  "gxp.EmbedMapDialog.prototype": {
    publishMessage: "Your map is ready to be published to the web! Simply copy the following HTML to embed the map in your website:",
    heightLabel: "Height",
    widthLabel: "Width",
    mapSizeLabel: "Map Size",
    miniSizeLabel: "Mini",
    smallSizeLabel: "Small",
    premiumSizeLabel: "Premium",
    largeSizeLabel: "Large"
  },
  "gxp.StylesDialog.prototype": {
    addStyleText: "Add",
    addStyleTip: "Add a new style",
    chooseStyleText: "Choose style",
    deleteStyleText: "Remove",
    deleteStyleTip: "Delete the selected style",
    editStyleText: "Edit",
    editStyleTip: "Edit the selected style",
    duplicateStyleText: "Duplicate",
    duplicateStyleTip: "Duplicate the selected style",
    addRuleText: "Add",
    addRuleTip: "Add a new rule",
    newRuleText: "New Rule",
    deleteRuleText: "Remove",
    deleteRuleTip: "Delete the selected rule",
    editRuleText: "Edit",
    editRuleTip: "Edit the selected rule",
    duplicateRuleText: "Duplicate",
    duplicateRuleTip: "Duplicate the selected rule",
    cancelText: "Cancel",
    saveText: "Save",
    styleWindowTitle: "User Style: {0}",
    ruleWindowTitle: "Style Rule: {0}",
    stylesFieldsetTitle: "Styles",
    rulesFieldsetTitle: "Rules"
  },
  "gxp.LayerUploadPanel.prototype": {
    titleLabel: "Title",
    titleEmptyText: "Layer title",
    abstractLabel: "Description",
    abstractEmptyText: "Layer description",
    fileLabel: "Data",
    fieldEmptyText: "Browse for data archive...",
    uploadText: "Upload",
    uploadFailedText: "Upload failed",
    processingUploadText: "Processing upload...",
    waitMsgText: "Uploading your data...",
    invalidFileExtensionText: "File extension must be one of: ",
    optionsText: "Options",
    workspaceLabel: "Workspace",
    workspaceEmptyText: "Default workspace",
    dataStoreLabel: "Store",
    dataStoreEmptyText: "Choose a store",
    dataStoreNewText: "Create new store",
    crsLabel: "CRS",
    crsEmptyText: "Coordinate Reference System ID",
    invalidCrsText: "CRS identifier should be an EPSG code (e.g. EPSG:4326)"
  },
  "gxp.NewSourceDialog.prototype": {
    title: "Add new server...",
    cancelText: "Cancel",
    addServerText: "Add Server",
    invalidURLText: "Enter a valid URL to a WMS endpoint (e.g. http://example.com/geoserver/wms)",
    contactingServerText: "Contacting Server..."
  },
  "gxp.ScaleOverlay.prototype": {
    zoomLevelText: "Zoom level"
  },
  "gxp.Viewer.prototype": {
    saveErrorText: "Trouble saving: "
  },
  "gxp.FeedSourceDialog.prototype": {
    feedTypeText: "Source",
    addPicasaText: "Picasa Photos",
    addYouTubeText: "YouTube Videos",
    addRSSText: "Other GeoRSS Feed",
    addFeedText: "Add to Map",
    addTitleText: "Title",
    keywordText: "Keyword",
    doneText: "Done",
    titleText: "Add Feeds",
    maxResultsText: "Max Items"
  }
});
GeoExt.Lang.add("es", {
  "gxp.menu.LayerMenu.prototype": {
    layerText: "Capa"
  },
  "gxp.plugins.AddLayers.prototype": {
    addActionMenuText: "A\u00f1adir Capas",
    addActionTip: "A\u00f1adir Capas",
    addServerText: "A\u00f1adir servidor",
    addButtonText: "A\u00f1adir Capas",
    untitledText: "Sin T\u00edtulo",
    addLayerSourceErrorText: "Error obteniendo capabilities de WMS ({msg}).\nPor favor, compruebe la URL y vuelva a intentarlo.",
    availableLayersText: "Capas disponibles",
    expanderTemplateText: "<p><b>Resumen:</b> {abstract}</p>",
    panelTitleText: "T\u00edtulo",
    layerSelectionText: "Ver datos disponibles de:",
    doneText: "Hecho",
    uploadText: "Subir Datos",
    addFeedActionMenuText: "Add feeds",
    searchText: "Search for layers"
  },
  "gxp.plugins.BingSource.prototype": {
    title: "Capas Bing",
    roadTitle: "Bing Carreteras",
    aerialTitle: "Bing Foto A\u00e9rea",
    labeledAerialTitle: "Bing H\u00edbrido"
  },
  "gxp.plugins.FeatureEditor.prototype": {
    splitButtonText: "Edit",
    createFeatureActionText: "Create",
    editFeatureActionText: "Modify",
    createFeatureActionTip: "Crear nuevo elemento",
    editFeatureActionTip: "Editar elemento existente",
    commitTitle: "Commit message",
    commitText: "Please enter a commit message for this edit:"
  },
  "gxp.plugins.FeatureGrid.prototype": {
    displayFeatureText: "Mostrar en el mapa",
    firstPageTip: "Primera p\u00e1gina",
    previousPageTip: "P\u00e1gina anterior",
    zoomPageExtentTip: "Zoom a la extensi\u00f3n de la p\u00e1gina",
    nextPageTip: "P\u00e1gina siguiente",
    lastPageTip: "\u00daltima p\u00e1gina",
    totalMsg: "Features {1} to {2} of {0}"
  },
  "gxp.plugins.GoogleEarth.prototype": {
    menuText: "Vista 3D",
    tooltip: "Vista 3D"
  },
  "gxp.plugins.GoogleSource.prototype": {
    title: "Capas Google",
    roadmapAbstract: "Mostrar Callejero",
    satelliteAbstract: "Mostrar im\u00e1genes a\u00e9reas",
    hybridAbstract: "Mostrar im\u00e1genes con nombres de calle",
    terrainAbstract: "Mostrar callejero con terreno"
  },
  "gxp.plugins.LayerProperties.prototype": {
    menuText: "Propiedades de la capa",
    toolTip: "Propiedades de la capa"
  },
  "gxp.plugins.LayerTree.prototype": {
    shortTitle: "Capas",
    rootNodeText: "Capas",
    overlayNodeText: "Capas superpuestas",
    baseNodeText: "Capa base"
  },
  "gxp.plugins.LayerManager.prototype": {
    baseNodeText: "Capa base"
  },
  "gxp.plugins.Legend.prototype": {
    menuText: "Leyenda",
    tooltip: "Leyenda"
  },
  "gxp.plugins.LoadingIndicator.prototype": {
    loadingMapMessage: "Loading Map..."
  },
  "gxp.plugins.MapBoxSource.prototype": {
    title: "MapBox Layers",
    blueMarbleTopoBathyJanTitle: "Blue Marble Topography & Bathymetry (January)",
    blueMarbleTopoBathyJulTitle: "Blue Marble Topography & Bathymetry (July)",
    blueMarbleTopoJanTitle: "Blue Marble Topography (January)",
    blueMarbleTopoJulTitle: "Blue Marble Topography (July)",
    controlRoomTitle: "Control Room",
    geographyClassTitle: "Geography Class",
    naturalEarthHypsoTitle: "Natural Earth Hypsometric",
    naturalEarthHypsoBathyTitle: "Natural Earth Hypsometric & Bathymetry",
    naturalEarth1Title: "Natural Earth I",
    naturalEarth2Title: "Natural Earth II",
    worldDarkTitle: "World Dark",
    worldLightTitle: "World Light",
    worldPrintTitle: "World Print"
  },
  "gxp.plugins.Measure.prototype": {
    buttonText: "Medir",
    lengthMenuText: "Longitud",
    areaMenuText: "\u00c1rea",
    lengthTooltip: "Medir Longitud",
    areaTooltip: "Medir \u00c1rea",
    measureTooltip: "Medir"
  },
  "gxp.plugins.Navigation.prototype": {
    menuText: "Desplazar mapa",
    tooltip: "Desplazar mapa"
  },
  "gxp.plugins.NavigationHistory.prototype": {
    previousMenuText: "Vista anterior",
    nextMenuText: "Vista siguiente",
    previousTooltip: "Vista anterior",
    nextTooltip: "Vista siguiente"
  },
  "gxp.plugins.OSMSource.prototype": {
    title: "Capas OpenStreetMap",
    mapnikAttribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
    osmarenderAttribution: "Datos CC-By-SA de <a href='http://openstreetmap.org/'>OpenStreetMap</a>"
  },
  "gxp.plugins.Print.prototype": {
    buttonText: "Imprimir",
    menuText: "Imprimir mapa",
    tooltip: "Imprimir mapa",
    previewText: "Vista previa",
    notAllNotPrintableText: "No se pueden imprimir todas las capas",
    nonePrintableText: "No se puede imprimir ninguna de las capas del mapa"
  },
  "gxp.plugins.MapQuestSource.prototype": {
    title: "Capas MapQuest",
    osmAttribution: "Teselas cortes\u00eda de <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
    osmTitle: "MapQuest OpenStreetMap",
    naipAttribution: "Teselas cortes\u00eda de <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
    naipTitle: "MapQuest Im\u00e1genes"
  },
  "gxp.plugins.QueryForm.prototype": {
    queryActionText: "Consultar",
    queryMenuText: "Consultar capa",
    queryActionTip: "Consultar la capa seleccionada",
    queryByLocationText: "Query by current map extent",
    queryByAttributesText: "Consultar por atributos",
    queryMsg: "Consultando...",
    cancelButtonText: "Cancelar",
    noFeaturesTitle: "Sin coincidencias",
    noFeaturesMessage: "Su consulta no produjo resultados."
  },
  "gxp.plugins.RemoveLayer.prototype": {
    removeMenuText: "Eliminar Capa",
    removeActionTip: "Eliminar Capa"
  },
  "gxp.plugins.Styler.prototype": {
    menuText: "Editar estilos",
    tooltip: "Gestionar estilos de capa"
  },
  "gxp.plugins.WMSGetFeatureInfo.prototype": {
    buttonText: "Identify",
    infoActionTip: "Consultar elementos",
    popupTitle: "Informaci\u00f3n de elementos"
  },
  "gxp.plugins.Zoom.prototype": {
    zoomMenuText: "Zoom Box",
    zoomInMenuText: "Acercar",
    zoomOutMenuText: "Alejar",
    zoomTooltip: "Zoom by dragging a box",
    zoomInTooltip: "Acercar",
    zoomOutTooltip: "Alejar"
  },
  "gxp.plugins.ZoomToExtent.prototype": {
    menuText: "Ver extensi\u00f3n total",
    tooltip: "Ver extensi\u00f3n total"
  },
  "gxp.plugins.ZoomToDataExtent.prototype": {
    menuText: "Ver toda la capa",
    tooltip: "Ver toda la capa"
  },
  "gxp.plugins.ZoomToLayerExtent.prototype": {
    menuText: "Ver toda la la capa",
    tooltip: "Ver toda la capa"
  },
  "gxp.plugins.ZoomToSelectedFeatures.prototype": {
    menuText: "Ver los elementos seleccionados",
    tooltip: "Ver los elementos seleccionados"
  },
  "gxp.FeatureEditPopup.prototype": {
    closeMsgTitle: "\u00bfDesea guardar los cambios?",
    closeMsg: "Los cambios en este elemento no se han guardado. \u00bfDesea guardar los cambios?",
    deleteMsgTitle: "\u00bfDesea borrar el elemento?",
    deleteMsg: "\u00bfEst\u00e1 seguro de querer borrar este elemento?",
    editButtonText: "Editar",
    editButtonTooltip: "Hacer editable este elemento",
    deleteButtonText: "Borrar",
    deleteButtonTooltip: "Borrar este elemento",
    cancelButtonText: "Cancelar",
    cancelButtonTooltip: "Dejar de editar, descartar cambios",
    saveButtonText: "Guardar",
    saveButtonTooltip: "Guardar cambios"
  },
  "gxp.FillSymbolizer.prototype": {
    fillText: "Relleno",
    colorText: "Color",
    opacityText: "Opacidad"
  },
  "gxp.FilterBuilder.prototype": {
    builderTypeNames: ["cualquiera de", "todas", "ninguna de", "no todas"],
    preComboText: "Cumplir",
    postComboText: "las condiciones siguientes:",
    addConditionText: "a\u00f1adir condici\u00f3n",
    addGroupText: "a\u00f1adir grupo",
    removeConditionText: "eliminar condici\u00f3n"
  },
  "gxp.grid.CapabilitiesGrid.prototype": {
    nameHeaderText: "Nombre",
    titleHeaderText: "T\u00edtulo",
    queryableHeaderText: "Consultable",
    layerSelectionLabel: "Ver datos disponibles de:",
    layerAdditionLabel: "o a\u00f1adir otro servidor.",
    expanderTemplateText: "<p><b>Resumen:</b> {abstract}</p>"
  },
  "gxp.PointSymbolizer.prototype": {
    graphicCircleText: "c\u00edrculo",
    graphicSquareText: "cuadrado",
    graphicTriangleText: "tri\u00e1ngulo",
    graphicStarText: "estrella",
    graphicCrossText: "cruz",
    graphicXText: "x",
    graphicExternalText: "externo",
    urlText: "URL",
    opacityText: "opacidad",
    symbolText: "S\u00edmbolo",
    sizeText: "Tama\u00f1o",
    rotationText: "Giro"
  },
  "gxp.QueryPanel.prototype": {
    queryByLocationText: "Consultar por localizaci\u00f3n",
    currentTextText: "Extensi\u00f3n actual",
    queryByAttributesText: "Consultar por atributo",
    layerText: "Capa"
  },
  "gxp.RulePanel.prototype": {
    scaleSliderTemplate: "{scaleType} Escala 1:{scale}",
    labelFeaturesText: "Etiquetado de elementos",
    labelsText: "Etiquetas",
    basicText: "B\u00e1sico",
    advancedText: "Advanzado",
    limitByScaleText: "Limitar por escala",
    limitByConditionText: "Limitar por condici\u00f3n",
    symbolText: "S\u00edmbolo",
    nameText: "Nombre"
  },
  "gxp.ScaleLimitPanel.prototype": {
    scaleSliderTemplate: "{scaleType} Escala 1:{scale}",
    minScaleLimitText: "Escala m\u00ednima",
    maxScaleLimitText: "Escala m\u00e1xima"
  },
  "gxp.StrokeSymbolizer.prototype": {
    solidStrokeName: "continuo",
    dashStrokeName: "guiones",
    dotStrokeName: "puntos",
    titleText: "Trazo",
    styleText: "Estilo",
    colorText: "Color",
    widthText: "Ancho",
    opacityText: "Opacidad"
  },
  "gxp.StylePropertiesDialog.prototype": {
    titleText: "General",
    nameFieldText: "Nombre",
    titleFieldText: "T\u00edtulo",
    abstractFieldText: "Resumen"
  },
  "gxp.TextSymbolizer.prototype": {
    labelValuesText: "Etiquetado",
    haloText: "Halo",
    sizeText: "Tama\u00f1o"
  },
  "gxp.WMSLayerPanel.prototype": {
    attributionText: "Attribution",
    aboutText: "Acerca de",
    titleText: "T\u00edtulo",
    nameText: "Nombre",
    descriptionText: "Descripci\u00f3n",
    displayText: "Mostrar",
    opacityText: "Opacidad",
    formatText: "Formato",
    transparentText: "Transparente",
    cacheText: "Cach\u00e9",
    cacheFieldText: "Usar la versi\u00f3n en cach\u00e9",
    stylesText: "Estilos disponibles",
    infoFormatText: "Info format",
    infoFormatEmptyText: "Select a format",
    displayOptionsText: "Display options",
    queryText: "Limit with filters",
    scaleText: "Limit by scale",
    minScaleText: "Min scale",
    maxScaleText: "Max scale",
    switchToFilterBuilderText: "Switch back to filter builder",
    cqlPrefixText: "or ",
    cqlText: "use CQL filter instead",
    singleTileText: "Single tile",
    singleTileFieldText: "Use a single tile"
  },
  "gxp.EmbedMapDialog.prototype": {
    publishMessage: "\u00a1Ya puede publicar su mapa en otras webs! Simplemente copie el siguiente c\u00f3digo HTML en el lugar donde desee incrustarlo:",
    heightLabel: "Alto",
    widthLabel: "Ancho",
    mapSizeLabel: "Tama\u00f1o",
    miniSizeLabel: "M\u00ednimo",
    smallSizeLabel: "Peque\u00f1o",
    premiumSizeLabel: "Premium",
    largeSizeLabel: "Grande"
  },
  "gxp.WMSStylesDialog.prototype": {
    addStyleText: "A\u00f1adir",
    addStyleTip: "A\u00f1adir un estilo",
    chooseStyleText: "Escoger estilo",
    deleteStyleText: "Quitar",
    deleteStyleTip: "Borrar el estilo seleccionado",
    editStyleText: "Cambiar",
    editStyleTip: "Editar el estilo seleccionado",
    duplicateStyleText: "Clonar",
    duplicateStyleTip: "Duplicar el estilo seleccionado",
    addRuleText: "A\u00f1adir",
    addRuleTip: "A\u00f1adir una regla",
    newRuleText: "Nueva regla",
    deleteRuleText: "Quitar",
    deleteRuleTip: "Borrar la regla seleccionada",
    editRuleText: "Cambiar",
    editRuleTip: "Editar la regla seleccionada",
    duplicateRuleText: "Duplicar",
    duplicateRuleTip: "Duplicar la regla seleccionada",
    cancelText: "Cancelar",
    saveText: "Guardar",
    styleWindowTitle: "Estilo: {0}",
    ruleWindowTitle: "Regla: {0}",
    stylesFieldsetTitle: "Estilos",
    rulesFieldsetTitle: "Reglas"
  },
  "gxp.LayerUploadPanel.prototype": {
    titleLabel: "T\u00edtulo",
    titleEmptyText: "T\u00edtulo de la capa",
    abstractLabel: "Descripci\u00f3n",
    abstractEmptyText: "Descripci\u00f3n de la capa",
    fileLabel: "Datos",
    fieldEmptyText: "Navegue por los datos...",
    uploadText: "Subir",
    uploadFailedText: "Upload failed",
    processingUploadText: "Processing upload...",
    waitMsgText: "Suba sus datos data...",
    invalidFileExtensionText: "El fichero debe tener alguna de estas extensiones: ",
    optionsText: "Opciones",
    workspaceLabel: "Espacio de trabajo",
    workspaceEmptyText: "Espacio de trabajo por defecto",
    dataStoreLabel: "Almac\u00e9n de datos",
    dataStoreEmptyText: "Create new store",
    defaultDataStoreEmptyText: "Almac\u00e9n de datos por defecto"
  },
  "gxp.NewSourceDialog.prototype": {
    title: "A\u00f1adir Servidor...",
    cancelText: "Cancelar",
    addServerText: "A\u00f1adir Servidor",
    invalidURLText: "Enter a valid URL to a WMS endpoint (e.g. http://example.com/geoserver/wms)",
    contactingServerText: "Conectando con el Servidor..."
  },
  "gxp.ScaleOverlay.prototype": {
    zoomLevelText: "Escala"
  },
  "gxp.Viewer.prototype": {
    saveErrorText: "Problemas guardando: "
  },
  "gxp.FeedSourceDialog.prototype": {
    feedTypeText: "Fuente",
    addPicasaText: "Picasa fotos",
    addYouTubeText: "YouTube Videos",
    addRSSText: "Feed GeoRSS Otro",
    addFeedText: "Agregar al Mapa",
    addTitleText: "T\u00edtulo",
    keywordText: "Palabra clave",
    doneText: "Hecho",
    titleText: "Agregar Feeds",
    maxResultsText: "Productos Max"
  }
});
GeoExt.Lang.add("fr", {
  "gxp.plugins.AddLayers.prototype": {
    addActionMenuText: "Ajouter des calques",
    addActionTip: "Ajouter des calques",
    addServerText: "Ajouter un nouveau serveur",
    untitledText: "Sans titre",
    addLayerSourceErrorText: "Impossible d'obtenir les capacit\u00e9s WMS ({msg}).\nVeuillez v\u00e9rifier l'URL et essayez \u00e0 nouveau.",
    availableLayersText: "Couches disponibles",
    doneText: "Termin\u00e9",
    uploadText: "T\u00e9l\u00e9charger des donn\u00e9es",
    addFeedActionMenuText: "Add feeds",
    searchText: "Search for layers"
  },
  "gxp.plugins.BingSource.prototype": {
    title: "Calques Bing",
    roadTitle: "Bing routes",
    aerialTitle: "Bing images a\u00e9riennes",
    labeledAerialTitle: "Bing images a\u00e9riennes avec \u00e9tiquettes"
  },
  "gxp.plugins.FeatureEditor.prototype": {
    splitButtonText: "Edit",
    createFeatureActionText: "Create",
    editFeatureActionText: "Modify",
    createFeatureActionTip: "Cr\u00e9er un nouvel objet",
    editFeatureActionTip: "Modifier un objet existant",
    commitTitle: "Commit message",
    commitText: "Please enter a commit message for this edit:"
  },
  "gxp.plugins.FeatureGrid.prototype": {
    displayFeatureText: "Afficher sur la carte",
    firstPageTip: "Premi\u00e8re page",
    previousPageTip: "Page pr\u00e9c\u00e9dente",
    zoomPageExtentTip: "Zoom sur la page",
    nextPageTip: "Page suivante",
    lastPageTip: "Derni\u00e8re page",
    totalMsg: "Features {1} to {2} of {0}"
  },
  "gxp.plugins.GoogleEarth.prototype": {
    menuText: "Passer \u00e0 la visionneuse 3D",
    tooltip: "Passer \u00e0 la visionneuse 3D"
  },
  "gxp.plugins.GoogleSource.prototype": {
    title: "Calques Google",
    roadmapAbstract: "Carte routi\u00e8re",
    satelliteAbstract: "Images satellite",
    hybridAbstract: "Images avec routes",
    terrainAbstract: "Carte routi\u00e8re avec le terrain"
  },
  "gxp.plugins.LayerProperties.prototype": {
    menuText: "Propri\u00e9t\u00e9s de la couche",
    toolTip: "Afficher les propri\u00e9t\u00e9s de la couche"
  },
  "gxp.plugins.LayerTree.prototype": {
    shortTitle: "Layers",
    rootNodeText: "Layers",
    overlayNodeText: "Surimpressions",
    baseNodeText: "Couches"
  },
  "gxp.plugins.LayerManager.prototype": {
    baseNodeText: "Couche"
  },
  "gxp.plugins.Legend.prototype": {
    menuText: "L\u00e9gende",
    tooltip: "Afficher la l\u00e9gende"
  },
  "gxp.plugins.Measure.prototype": {
    buttonText: "Mesure",
    lengthMenuText: "Longueur",
    areaMenuText: "Surface",
    lengthTooltip: "Mesurer une longueur",
    areaTooltip: "Mesurer une surface",
    measureTooltip: "Mesurer"
  },
  "gxp.plugins.Navigation.prototype": {
    menuText: "Panner",
    tooltip: "Faire glisser la carte"
  },
  "gxp.plugins.NavigationHistory.prototype": {
    previousMenuText: "Position pr\u00e9c\u00e9dente",
    nextMenuText: "Position suivante",
    previousTooltip: "Retourner \u00e0 la position pr\u00e9c\u00e9dente",
    nextTooltip: "Aller \u00e0 la position suivante"
  },
  "gxp.plugins.LoadingIndicator.prototype": {
    loadingMapMessage: "Chargement de la carte..."
  },
  "gxp.plugins.MapBoxSource.prototype": {
    title: "MapBox Layers",
    blueMarbleTopoBathyJanTitle: "Blue Marble Topography & Bathymetry (January)",
    blueMarbleTopoBathyJulTitle: "Blue Marble Topography & Bathymetry (July)",
    blueMarbleTopoJanTitle: "Blue Marble Topography (January)",
    blueMarbleTopoJulTitle: "Blue Marble Topography (July)",
    controlRoomTitle: "Control Room",
    geographyClassTitle: "Geography Class",
    naturalEarthHypsoTitle: "Natural Earth Hypsometric",
    naturalEarthHypsoBathyTitle: "Natural Earth Hypsometric & Bathymetry",
    naturalEarth1Title: "Natural Earth I",
    naturalEarth2Title: "Natural Earth II",
    worldDarkTitle: "World Dark",
    worldLightTitle: "World Light",
    worldPrintTitle: "World Print"
  },
  "gxp.plugins.OSMSource.prototype": {
    title: "Calques OpenStreetMap",
    mapnikAttribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
    osmarenderAttribution: "Donn\u00e9es CC-By-SA par <a href='http://openstreetmap.org/'>OpenStreetMap</a>"
  },
  "gxp.plugins.Print.prototype": {
    buttonText: "Imprimer",
    menuText: "Imprimer la carte",
    tooltip: "Imprimer la carte",
    previewText: "Aper\u00e7u avant impression",
    notAllNotPrintableText: "Non, toutes les couches peuvent \u00eatre imprim\u00e9es",
    nonePrintableText: "Aucune de vos couches ne peut \u00eatre imprim\u00e9e"
  },
  "gxp.plugins.MapQuestSource.prototype": {
    title: "MapQuest Layers",
    osmAttribution: "Avec la permission de tuiles <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
    osmTitle: "MapQuest OpenStreetMap",
    naipAttribution: "Avec la permission de tuiles <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
    naipTitle: "MapQuest Imagery"
  },
  "gxp.plugins.QueryForm.prototype": {
    queryActionText: "Interrogation",
    queryMenuText: "Couche de requ\u00eates",
    queryActionTip: "Interroger la couche s\u00e9lectionn\u00e9e",
    queryByLocationText: "Query by current map extent",
    queryByAttributesText: "Requ\u00eate par attributs"
  },
  "gxp.plugins.RemoveLayer.prototype": {
    removeMenuText: "Enlever la couche",
    removeActionTip: "Enlever la couche"
  },
  "gxp.plugins.WMSGetFeatureInfo.prototype": {
    buttonText: "Identify",
    infoActionTip: "Get Feature Info",
    popupTitle: "Info sur l'objet"
  },
  "gxp.plugins.Zoom.prototype": {
    zoomMenuText: "Zoom Box",
    zoomInMenuText: "Zoom avant",
    zoomOutMenuText: "Zoom arri\u00e8re",
    zoomTooltip: "Zoomer en dessinant un rectangle",
    zoomInTooltip: "Zoomer",
    zoomOutTooltip: "D\u00e9zoomer"
  },
  "gxp.plugins.ZoomToExtent.prototype": {
    menuText: "Zoomer sur la carte max",
    tooltip: "Zoomer sur la carte max"
  },
  "gxp.plugins.ZoomToDataExtent.prototype": {
    menuText: "Zoomer sur la couche",
    tooltip: "Zoomer sur la couche"
  },
  "gxp.plugins.ZoomToLayerExtent.prototype": {
    menuText: "Zoomer sur la couche",
    tooltip: "Zoomer sur la couche"
  },
  "gxp.plugins.ZoomToSelectedFeatures.prototype": {
    menuText: "Zoomer sur les objets s\u00e9lectionn\u00e9s",
    tooltip: "Zoomer sur les objets s\u00e9lectionn\u00e9s"
  },
  "gxp.FeatureEditPopup.prototype": {
    closeMsgTitle: "Enregistrer les modifications ?",
    closeMsg: "Cet objet a des modifications non enregistr\u00e9es. Voulez-vous enregistrer vos modifications ?",
    deleteMsgTitle: "Supprimer l'objet ?",
    deleteMsg: "Etes-vous s\u00fbr de vouloir supprimer cet objet ?",
    editButtonText: "Modifier",
    editButtonTooltip: "Modifier cet objet",
    deleteButtonText: "Supprimer",
    deleteButtonTooltip: "Supprimer cet objet",
    cancelButtonText: "Annuler",
    cancelButtonTooltip: "Arr\u00eater de modifier, annuler les modifications",
    saveButtonText: "Enregistrer",
    saveButtonTooltip: "Enregistrer les modifications"
  },
  "gxp.FillSymbolizer.prototype": {
    fillText: "Remplir",
    colorText: "Couleur",
    opacityText: "Opacit\u00e9"
  },
  "gxp.FilterBuilder.prototype": {
    builderTypeNames: ["Tout", "tous", "aucun", "pas tout"],
    preComboText: "Match",
    postComboText: "de ce qui suit:",
    addConditionText: "Ajouter la condition",
    addGroupText: "Ajouter un groupe",
    removeConditionText: "Supprimer la condition"
  },
  "gxp.grid.CapabilitiesGrid.prototype": {
    nameHeaderText: "Nom",
    titleHeaderText: "Titre",
    queryableHeaderText: "Interrogeable",
    layerSelectionLabel: "Voir les donn\u00e9es disponibles \u00e0 partir de :",
    layerAdditionLabel: "ou ajouter un nouveau serveur.",
    expanderTemplateText: "<p><b>R\u00e9sum\u00e9:</b> {abstract}</p>"
  },
  "gxp.PointSymbolizer.prototype": {
    graphicCircleText: "Cercle",
    graphicSquareText: "Carr\u00e9",
    graphicTriangleText: "Triangle",
    graphicStarText: "\u00c9toile",
    graphicCrossText: "Croix",
    graphicXText: "x",
    graphicExternalText: "Externe",
    urlText: "URL",
    opacityText: "Opacit\u00e9",
    symbolText: "Symbole",
    sizeText: "Taille",
    rotationText: "Rotation"
  },
  "gxp.QueryPanel.prototype": {
    queryByLocationText: "Interrogation selon le lieu",
    currentTextText: "Mesure actuelle",
    queryByAttributesText: "Requ\u00eate par attributs",
    layerText: "Calque"
  },
  "gxp.RulePanel.prototype": {
    scaleSliderTemplate: "{scaleType} \u00e9chelle 1:{scale}",
    labelFeaturesText: "Label Caract\u00e9ristiques",
    advancedText: "Avanc\u00e9",
    limitByScaleText: "Limiter par l'\u00e9chelle",
    limitByConditionText: "Limiter par condition",
    symbolText: "Symbole",
    nameText: "Nom"
  },
  "gxp.ScaleLimitPanel.prototype": {
    scaleSliderTemplate: "{scaleType} \u00e9chelle 1:{scale}",
    maxScaleLimitText: "\u00c9chelle maximale"
  },
  "gxp.TextSymbolizer.prototype": {
    labelValuesText: "Label valeurs",
    haloText: "Halo",
    sizeText: "Taille"
  },
  "gxp.WMSLayerPanel.prototype": {
    attributionText: "Attribution",
    aboutText: "A propos",
    titleText: "Titre",
    nameText: "Nom",
    descriptionText: "Description",
    displayText: "Affichage",
    opacityText: "Opacit\u00e9",
    formatText: "Format",
    transparentText: "Transparent",
    cacheText: "Cache",
    cacheFieldText: "Utiliser la version mise en cache",
    stylesText: "Available styles",
    infoFormatText: "Info format",
    infoFormatEmptyText: "Choisissez un format",
    displayOptionsText: "Display options",
    queryText: "Limit with filters",
    scaleText: "Limit by scale",
    minScaleText: "Min scale",
    maxScaleText: "Max scale",
    switchToFilterBuilderText: "Switch back to filter builder",
    cqlPrefixText: "or ",
    cqlText: "use CQL filter instead",
    singleTileText: "Single tile",
    singleTileFieldText: "Use a single tile"
  },
  "gxp.EmbedMapDialog.prototype": {
    publishMessage: "Votre carte est pr\u00eate \u00e0 \u00eatre publi\u00e9e sur le web. Il suffit de copier le code HTML suivant pour int\u00e9grer la carte dans votre site Web :",
    heightLabel: "Hauteur",
    widthLabel: "Largeur",
    mapSizeLabel: "Taille de la carte",
    miniSizeLabel: "Mini",
    smallSizeLabel: "Petit",
    premiumSizeLabel: "Premium",
    largeSizeLabel: "Large"
  },
  "gxp.LayerUploadPanel.prototype": {
    titleLabel: "Titre",
    titleEmptyText: "Titre de la couche",
    abstractLabel: "Description",
    abstractEmptyText: "Description couche",
    fileLabel: "Donn\u00e9es",
    fieldEmptyText: "Parcourir pour ...",
    uploadText: "Upload",
    uploadFailedText: "Upload failed",
    processingUploadText: "Processing upload...",
    waitMsgText: "Transfert de vos donn\u00e9es ...",
    invalidFileExtensionText: "L'extension du fichier doit \u00eatre : ",
    optionsText: "Options",
    workspaceLabel: "Espace de travail",
    workspaceEmptyText: "Espace de travail par d\u00e9faut",
    dataStoreLabel: "Magasin de donn\u00e9es",
    dataStoreEmptyText: "Create new store",
    defaultDataStoreEmptyText: "Magasin de donn\u00e9es par d\u00e9faut"
  },
  "gxp.NewSourceDialog.prototype": {
    title: "Ajouter un nouveau serveur...",
    cancelText: "Annuler",
    addServerText: "Ajouter un serveur",
    invalidURLText: "Indiquez l'URL valide d'un serveur WMS (e.g. http://example.com/geoserver/wms)",
    contactingServerText: "Interrogation du serveur..."
  },
  "gxp.ScaleOverlay.prototype": {
    zoomLevelText: "Niveau de zoom"
  },
  "gxp.Viewer.prototype": {
    saveErrorText: "Sauver Trouble: "
  },
  "gxp.FeedSourceDialog.prototype": {
    feedTypeText: "Source",
    addPicasaText: "Picasa Photos",
    addYouTubeText: "YouTube Vid\u00e9os",
    addRSSText: "GeoRSS Autre",
    addFeedText: "Ajouter \u00e0 la carte",
    addTitleText: "Titre",
    keywordText: "Mot-cl\u00e9",
    doneText: "Termin\u00e9",
    titletext: "Ajouter RSS",
    maxResultsText: "Articles Max"
  }
});
GeoExt.Lang.add("hu", {
  "gxp.menu.LayerMenu.prototype": {
    layerText: "R\u00e9teg"
  },
  "gxp.plugins.AddLayers.prototype": {
    addActionMenuText: "R\u00e9tegek hozz\u00e1ad\u00e1sa",
    addActionTip: "R\u00e9tegek hozz\u00e1ad\u00e1sa",
    addServerText: "\u00daj Szerver hozz\u00e1ad\u00e1sa",
    addButtonText: "R\u00e9tegek hozz\u00e1ad\u00e1sa",
    untitledText: "N\u00e9vtelen",
    addLayerSourceErrorText: "Hiba t\u00f6rt\u00e9nt a WMS capabilities lek\u00e9rdez\u00e9sekor ({msg}).\nEllen\u0151rizze az el\u00e9r\u00e9si c\u00edmet.",
    availableLayersText: "El\u00e9rhet\u0151 r\u00e9tegek",
    expanderTemplateText: "<p><b>Abstractt:</b> {abstract}</p>",
    panelTitleText: "C\u00edm",
    layerSelectionText: "Rendelkez\u00e9sre \u00e1ll\u00f3 adat megtekint\u00e9se innen:",
    doneText: "K\u00e9sz",
    uploadText: "R\u00e9tegek felt\u00f6lt\u00e9se",
    addFeedActionMenuText: "Feed hozz\u00e1ad\u00e1sa",
    searchText: "R\u00e9tegek keres\u00e9se"
  },
  "gxp.plugins.BingSource.prototype": {
    title: "Bing R\u00e9tegek",
    roadTitle: "Bing Roads",
    aerialTitle: "Bing Aerial",
    labeledAerialTitle: "Bing Aerial Feliratokkal"
  },
  "gxp.plugins.FeatureEditor.prototype": {
    splitButtonText: "Szerkeszt",
    createFeatureActionText: "L\u00e9trehoz",
    editFeatureActionText: "M\u00f3dos\u00edt",
    createFeatureActionTip: "\u00daj elem l\u00e9trehoz\u00e1sa",
    editFeatureActionTip: "L\u00e9tez\u0151 elem m\u00f3dos\u00edt\u00e1sa",
    commitTitle: "Commit message",
    commitText: "Please enter a commit message for this edit:"
  },
  "gxp.plugins.FeatureGrid.prototype": {
    displayFeatureText: "T\u00e9rk\u00e9pen mutat",
    firstPageTip: "Els\u0151 oldal",
    previousPageTip: "El\u0151z\u0151 oldal",
    zoomPageExtentTip: "Lap kiterjed\u00e9s\u00e9re nagy\u00edt",
    nextPageTip: "K\u00f6vetkez\u0151 lap",
    lastPageTip: "Utols\u00f3 lap",
    totalMsg: "Features {1} to {2} of {0}"
  },
  "gxp.plugins.GoogleEarth.prototype": {
    menuText: "3D N\u00e9zet",
    tooltip: "3D n\u00e9zetbe v\u00e1lt\u00e1s"
  },
  "gxp.plugins.GoogleSource.prototype": {
    title: "Google R\u00e9tegek",
    roadmapAbstract: "Show street map",
    satelliteAbstract: "Show satellite imagery",
    hybridAbstract: "Show imagery with street names",
    terrainAbstract: "Show street map with terrain"
  },
  "gxp.plugins.LayerProperties.prototype": {
    menuText: "R\u00e9teg tulajdons\u00e1gok",
    toolTip: "R\u00e9teg tulajdons\u00e1gok"
  },
  "gxp.plugins.LayerTree.prototype": {
    shortTitle: "R\u00e9tegek",
    rootNodeText: "R\u00e9tegek",
    overlayNodeText: "Fedv\u00e9nyek",
    baseNodeText: "Alapt\u00e9rk\u00e9pek"
  },
  "gxp.plugins.LayerManager.prototype": {
    baseNodeText: "Alapt\u00e9rk\u00e9pek"
  },
  "gxp.plugins.Legend.prototype": {
    menuText: "Jelmagyar\u00e1zatot mutat",
    tooltip: "Jelmagyar\u00e1zatot mutat"
  },
  "gxp.plugins.LoadingIndicator.prototype": {
    loadingMapMessage: "T\u00e9rk\u00e9p bet\u00f6lt\u00e9se..."
  },
  "gxp.plugins.MapBoxSource.prototype": {
    title: "MapBox Layers",
    blueMarbleTopoBathyJanTitle: "Blue Marble Topography & Bathymetry (January)",
    blueMarbleTopoBathyJulTitle: "Blue Marble Topography & Bathymetry (July)",
    blueMarbleTopoJanTitle: "Blue Marble Topography (January)",
    blueMarbleTopoJulTitle: "Blue Marble Topography (July)",
    controlRoomTitle: "Control Room",
    geographyClassTitle: "Geography Class",
    naturalEarthHypsoTitle: "Natural Earth Hypsometric",
    naturalEarthHypsoBathyTitle: "Natural Earth Hypsometric & Bathymetry",
    naturalEarth1Title: "Natural Earth I",
    naturalEarth2Title: "Natural Earth II",
    worldDarkTitle: "World Dark",
    worldLightTitle: "World Light",
    worldPrintTitle: "World Print"
  },
  "gxp.plugins.Measure.prototype": {
    buttonText: "M\u00e9r\u00e9s",
    lengthMenuText: "Hossz",
    areaMenuText: "Ter\u00fclet",
    lengthTooltip: "Hosszm\u00e9r\u00e9s",
    areaTooltip: "Ter\u00fcletm\u00e9r\u00e9s",
    measureTooltip: "M\u00e9r\u00e9s"
  },
  "gxp.plugins.Navigation.prototype": {
    menuText: "T\u00e9rk\u00e9p eltol\u00e1s",
    tooltip: "T\u00e9rk\u00e9p eltol\u00e1s"
  },
  "gxp.plugins.NavigationHistory.prototype": {
    previousMenuText: "El\u0151z\u0151 n\u00e9zetre nagy\u00edt",
    nextMenuText: "K\u00f6vetkez\u0151 n\u00e9zetre nagy\u00edt",
    previousTooltip: "El\u0151z\u0151 n\u00e9zetre nagy\u00edt",
    nextTooltip: "K\u00f6vetkez\u0151 n\u00e9zetre nagy\u00edt"
  },
  "gxp.plugins.OSMSource.prototype": {
    title: "OpenStreetMap R\u00e9tegek",
    mapnikAttribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
    osmarenderAttribution: "Data CC-By-SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>"
  },
  "gxp.plugins.Print.prototype": {
    buttonText: "Nyomtat",
    menuText: "T\u00e9rk\u00e9p nyomtat\u00e1sa",
    tooltip: "T\u00e9rk\u00e9p nyomtat\u00e1sa",
    previewText: "T\u00e9rk\u00e9p el\u0151n\u00e9zet",
    notAllNotPrintableText: "Nem nyomtathat\u00f3 minden r\u00e9teg",
    nonePrintableText: "Nem nyomtathat\u00f3 minden r\u00e9teg"
  },
  "gxp.plugins.MapQuestSource.prototype": {
    title: "MapQuest R\u00e9tegek",
    osmAttribution: "Tiles Courtesy of <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
    osmTitle: "MapQuest OpenStreetMap",
    naipAttribution: "Tiles Courtesy of <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
    naipTitle: "MapQuest Imagery"
  },
  "gxp.plugins.QueryForm.prototype": {
    queryActionText: "Lek\u00e9rdez\u00e9s",
    queryMenuText: "R\u00e9teg lek\u00e9rdez\u00e9s",
    queryActionTip: "A kiv\u00e1lasztott r\u00e9teg lek\u00e9rdez\u00e9se",
    queryByLocationText: "Keres\u00e9s t\u00e9rbeli helyzet alapj\u00e1n",
    queryByAttributesText: "Keres\u00e9s attrib\u00fatumok alapj\u00e1n",
    queryMsg: "Keres\u00e9s...",
    cancelButtonText: "M\u00e9gsem",
    noFeaturesTitle: "Nincs tal\u00e1lat",
    noFeaturesMessage: "A keres\u00e9s nem hozott eredm\u00e9nyt."
  },
  "gxp.plugins.RemoveLayer.prototype": {
    removeMenuText: "R\u00e9teg elt\u00e1vol\u00edt\u00e1sa",
    removeActionTip: "R\u00e9teg elt\u00e1vol\u00edt\u00e1sa"
  },
  "gxp.plugins.Styler.prototype": {
    menuText: "R\u00e9teg st\u00edlusok",
    tooltip: "R\u00e9teg st\u00edlusok"
  },
  "gxp.plugins.WMSGetFeatureInfo.prototype": {
    buttonText: "Aonos\u00edt",
    infoActionTip: "Elem azonos\u00edt\u00e1s (Get Feature Info)",
    popupTitle: "Elem azonos\u00edt\u00e1s (Feature Info)"
  },
  "gxp.plugins.Zoom.prototype": {
    zoomMenuText: "Zoom box",
    zoomInMenuText: "Nagy\u00edt",
    zoomOutMenuText: "Kicsiny\u00edt",
    zoomTooltip: "Zoom by dragging a box",
    zoomInTooltip: "Nagy\u00edt",
    zoomOutTooltip: "Kicsiny\u00edt"
  },
  "gxp.plugins.ZoomToExtent.prototype": {
    menuText: "Teljes kiterjed\u00e9sre nagy\u00edt",
    tooltip: "Teljes kiterjed\u00e9sre nagy\u00edt"
  },
  "gxp.plugins.ZoomToDataExtent.prototype": {
    menuText: "R\u00e9teg kiterjed\u00e9sre nagy\u00edt",
    tooltip: "R\u00e9teg kiterjed\u00e9sre nagy\u00edt"
  },
  "gxp.plugins.ZoomToLayerExtent.prototype": {
    menuText: "R\u00e9teg kiterjed\u00e9sre nagy\u00edt",
    tooltip: "R\u00e9teg kiterjed\u00e9sre nagy\u00edt"
  },
  "gxp.plugins.ZoomToSelectedFeatures.prototype": {
    menuText: "Kiv\u00e1lasztott elemekre nagy\u00edt",
    tooltip: "Kiv\u00e1lasztott elemekre nagy\u00edt"
  },
  "gxp.FeatureEditPopup.prototype": {
    closeMsgTitle: "Menti a v\u00e1ltoztat\u00e1sokat?",
    closeMsg: "This feature has unsaved changes. Would you like to save your changes?",
    deleteMsgTitle: "T\u00f6rli az elemet?",
    deleteMsg: "Biztos benne, hogy t\u00f6rli az elemet?",
    editButtonText: "Szerkeszt",
    editButtonTooltip: "Elem szerkeszthet\u0151v\u00e9 t\u00e9tele",
    deleteButtonText: "T\u00f6rl\u00e9s",
    deleteButtonTooltip: "Elem t\u00f6rl\u00e9se",
    cancelButtonText: "M\u00e9gsem",
    cancelButtonTooltip: "Szerkeszt\u00e9s befejez\u00e9se, v\u00e1ltoztat\u00e1sok elvet\u00e9se",
    saveButtonText: "Ment\u00e9s",
    saveButtonTooltip: "V\u00e1ltoztat\u00e1sok ment\u00e9se"
  },
  "gxp.FillSymbolizer.prototype": {
    fillText: "Kit\u00f6lt\u00e9s",
    colorText: "Sz\u00edn",
    opacityText: "\u00c1tl\u00e1tsz\u00f3s\u00e1g"
  },
  "gxp.FilterBuilder.prototype": {
    builderTypeNames: ["b\u00e1rmelyik", "mindegyik", "egyik sem", "nem mindegyik"],
    preComboText: "Teljes\u00fclj\u00f6n",
    postComboText: "a k\u00f6vetkez\u0151kb\u0151l:",
    addConditionText: "felt\u00e9tel hozz\u00e1ad\u00e1sa",
    addGroupText: "csoport hozz\u00e1ad\u00e1sa",
    removeConditionText: "felt\u00e9tel t\u00f6rl\u00e9se"
  },
  "gxp.grid.CapabilitiesGrid.prototype": {
    nameHeaderText: "N\u00e9v",
    titleHeaderText: "C\u00edm",
    queryableHeaderText: "Kereshet\u0151",
    layerSelectionLabel: "View available data from:",
    layerAdditionLabel: "or add a new server.",
    expanderTemplateText: "<p><b>Abstract:</b> {abstract}</p>"
  },
  "gxp.PointSymbolizer.prototype": {
    graphicCircleText: "k\u00f6r",
    graphicSquareText: "n\u00e9gyzet",
    graphicTriangleText: "h\u00e1romsz\u00f6g",
    graphicStarText: "csillag",
    graphicCrossText: "kereszt",
    graphicXText: "x",
    graphicExternalText: "k\u00fcls\u0151",
    urlText: "URL",
    opacityText: "\u00e1tl\u00e1tsz\u00f3s\u00e1g",
    symbolText: "Szimb\u00f3lum",
    sizeText: "M\u00e9ret",
    rotationText: "Elforgat\u00e1s"
  },
  "gxp.QueryPanel.prototype": {
    queryByLocationText: "Keres\u00e9s t\u00e9rbeli helyzet alapj\u00e1n",
    currentTextText: "Aktu\u00e1lis kiterjed\u00e9s",
    queryByAttributesText: "Keres\u00e9s attrib\u00fatumok alapj\u00e1n",
    layerText: "R\u00e9teg"
  },
  "gxp.RulePanel.prototype": {
    scaleSliderTemplate: "{scaleType} M\u00e9retar\u00e1ny 1:{scale}",
    labelFeaturesText: "Elemek c\u00edmk\u00e9z\u00e9se",
    labelsText: "C\u00edmk\u00e9k",
    basicText: "Alapbe\u00e1ll\u00edt\u00e1sok",
    advancedText: "Halad\u00f3",
    limitByScaleText: "Sz\u0171r\u00e9s m\u00e9retar\u00e1ny szerint",
    limitByConditionText: "Sz\u0171r\u00e9s felt\u00e9tel szerint",
    symbolText: "Szimb\u00f3lum",
    nameText: "N\u00e9v"
  },
  "gxp.ScaleLimitPanel.prototype": {
    scaleSliderTemplate: "{scaleType} L\u00e9pt\u00e9k 1:{scale}",
    minScaleLimitText: "Min l\u00e9pt\u00e9k",
    maxScaleLimitText: "Max l\u00e9pt\u00e9k"
  },
  "gxp.StrokeSymbolizer.prototype": {
    solidStrokeName: "t\u00f6m\u00f6r",
    dashStrokeName: "szaggatott",
    dotStrokeName: "pontozott",
    titleText: "K\u00f6rvonal",
    styleText: "St\u00edlus",
    colorText: "Sz\u00edn",
    widthText: "Sz\u00e9less\u00e9g",
    opacityText: "\u00c1tl\u00e1tsz\u00f3s\u00e1g"
  },
  "gxp.StylePropertiesDialog.prototype": {
    titleText: "\u00c1ltal\u00e1nos",
    nameFieldText: "N\u00e9v",
    titleFieldText: "C\u00edm",
    abstractFieldText: "Abstract"
  },
  "gxp.TextSymbolizer.prototype": {
    labelValuesText: "C\u00edmke mez\u0151",
    haloText: "K\u00f6rvonal (maszk)",
    sizeText: "M\u00e9ret",
    fontColorTitle: "Bet\u0171 sz\u00edn \u00e9s \u00e1tl\u00e1tsz\u00f3s\u00e1g"
  },
  "gxp.WMSLayerPanel.prototype": {
    attributionText: "Attribution",
    aboutText: "About",
    titleText: "Title",
    nameText: "Name",
    descriptionText: "Description",
    displayText: "Display",
    opacityText: "Opacity",
    formatText: "Format",
    transparentText: "Transparent",
    cacheText: "Cache",
    cacheFieldText: "Use cached version",
    stylesText: "Available Styles",
    infoFormatText: "Info format",
    infoFormatEmptyText: "Select a format",
    displayOptionsText: "Display options",
    queryText: "Limit with filters",
    scaleText: "Limit by scale",
    minScaleText: "Min scale",
    maxScaleText: "Max scale",
    switchToFilterBuilderText: "Switch back to filter builder",
    cqlPrefixText: "or ",
    cqlText: "use CQL filter instead",
    singleTileText: "Single tile",
    singleTileFieldText: "Use a single tile"
  },
  "gxp.EmbedMapDialog.prototype": {
    publishMessage: "Az \u00d6n t\u00e9rk\u00e9pe k\u00e9szen \u00e1ll a publik\u00e1l\u00e1sra. M\u00e1solja be a k\u00f6vetkez\u0151 HTML-t a honlapj\u00e1ra",
    heightLabel: "Magass\u00e1g",
    widthLabel: "Sz\u00e9less\u00e9g",
    mapSizeLabel: "T\u00e9rk\u00e9p m\u00e9rete",
    miniSizeLabel: "Mini",
    smallSizeLabel: "Kicsi",
    premiumSizeLabel: "Pr\u00e9mium",
    largeSizeLabel: "Nagy"
  },
  "gxp.WMSStylesDialog.prototype": {
    addStyleText: "Hozz\u00e1ad",
    addStyleTip: "\u00daj st\u00edlus hozz\u00e1ad\u00e1sa",
    chooseStyleText: "V\u00e1lasszon st\u00edlust",
    deleteStyleText: "T\u00f6r\u00f6l",
    deleteStyleTip: "A kiv\u00e1lasztott st\u00edlus t\u00f6rl\u00e9se",
    editStyleText: "Szerkeszt",
    editStyleTip: "A kiv\u00e1lasztott st\u00edlus szerkeszt\u00e9se",
    duplicateStyleText: "Duplik\u00e1l",
    duplicateStyleTip: "A kiv\u00e1lasztott st\u00edlus duplik\u00e1l\u00e1sa",
    addRuleText: "Hozz\u00e1ad",
    addRuleTip: "\u00daj szab\u00e1ly hozz\u00e1ad\u00e1sa",
    newRuleText: "\u00daj szab\u00e1ly",
    deleteRuleText: "T\u00f6r\u00f6l",
    deleteRuleTip: "A kiv\u00e1lasztott szab\u00e1ly t\u00f6rl\u00e9se",
    editRuleText: "Szerkeszt",
    editRuleTip: "A kiv\u00e1lasztott szab\u00e1ly szerkeszt\u00e9se",
    duplicateRuleText: "Duplik\u00e1l",
    duplicateRuleTip: "A kiv\u00e1lasztott szab\u00e1ly duplik\u00e1l\u00e1sa",
    cancelText: "M\u00e9gsem",
    saveText: "Ment\u00e9s",
    styleWindowTitle: "Felhaszn\u00e1l\u00f3i st\u00edlus: {0}",
    ruleWindowTitle: "St\u00edlusszab\u00e1ly: {0}",
    stylesFieldsetTitle: "St\u00edlusok",
    rulesFieldsetTitle: "Szab\u00e1lyok"
  },
  "gxp.LayerUploadPanel.prototype": {
    titleLabel: "C\u00edm",
    titleEmptyText: "R\u00e9teg neve",
    abstractLabel: "Le\u00edr\u00e1s",
    abstractEmptyText: "R\u00e9teg le\u00edr\u00e1s",
    fileLabel: "Adat",
    fieldEmptyText: "Browse for data archive...",
    uploadText: "Felt\u00f6lt\u00e9s",
    uploadFailedText: "Felt\u00f6lt\u00e9s sikertelen",
    processingUploadText: "Felt\u00f6lt\u00e9s folyamatban...",
    waitMsgText: "Adat felt\u00f6lt\u00e9se...",
    invalidFileExtensionText: "File extension must be one of: ",
    optionsText: "Options",
    workspaceLabel: "Munkater\u00fclet",
    workspaceEmptyText: "Alap\u00e9rtelmezett munkater\u00fclet",
    dataStoreLabel: "Store",
    dataStoreEmptyText: "Create new store",
    defaultDataStoreEmptyText: "Default data store"
  },
  "gxp.NewSourceDialog.prototype": {
    title: "\u00daj szerver hozz\u00e1ad\u00e1sa...",
    cancelText: "M\u00e9gsem",
    addServerText: "Szerver hozz\u00e1ad\u00e1sa",
    invalidURLText: "Adjon meg helyes URL-t a WMS h\u00edv\u00e1shoz (pl. http://example.com/geoserver/wms)",
    contactingServerText: "Kapcsol\u00f3d\u00e1s a szerverhez..."
  },
  "gxp.ScaleOverlay.prototype": {
    zoomLevelText: "Zoom szint"
  },
  "gxp.Viewer.prototype": {
    saveErrorText: "Probl\u00e9ma a ment\u00e9s sor\u00e1n: "
  },
  "gxp.FeedSourceDialog.prototype": {
    feedTypeText: "Source",
    addPicasaText: "Picasa Photos",
    addYouTubeText: "YouTube Videos",
    addRSSText: "Other GeoRSS Feed",
    addFeedText: "Add to Map",
    addTitleText: "C\u00edm",
    keywordText: "Kulcssz\u00f3",
    doneText: "K\u00e9sz",
    titleText: "Add Feeds",
    maxResultsText: "Max Items"
  },
  "gxp.StylesDialog.prototype": {
    cancelText: "M\u00e9gsem",
    saveText: "Ment\u00e9s",
    addStyleText: "Hozz\u00e1ad",
    addStyleTip: "\u00daj st\u00edlus hozz\u00e1ad\u00e1sa",
    chooseStyleText: "V\u00e1lasszon st\u00edlust",
    deleteStyleText: "Elt\u00e1vol\u00edt",
    deleteStyleTip: "Kiv\u00e1lasztott st\u00edlus t\u00f6rl\u00e9se",
    editStyleText: "Szerkeszt",
    editStyleTip: "Kiv\u00e1lasztott st\u00edlus szerkeszt\u00e9se",
    duplicateStyleText: "Duplik\u00e1l",
    duplicateStyleTip: "Kiv\u00e1lasztott st\u00edlus duplik\u00e1l\u00e1sa",
    addRuleText: "Hozz\u00e1ad",
    addRuleTip: "\u00daj szab\u00e1ly hozz\u00e1ad\u00e1sa",
    newRuleText: "\u00daj szab\u00e1ly",
    deleteRuleText: "Elt\u00e1vol\u00edt",
    deleteRuleTip: "Kiv\u00e1lasztott szab\u00e1ly t\u00f6rl\u00e9se",
    editRuleText: "Szerkeszt",
    editRuleTip: "Kiv\u00e1lasztott szab\u00e1ly szerkeszt\u00e9se",
    duplicateRuleText: "Duplik\u00e1l",
    duplicateRuleTip: "Kiv\u00e1lasztott szab\u00e1ly duplik\u00e1l\u00e1sa",
    styleWindowTitle: "Felhaszn\u00e1l\u00f3i st\u00edlus: {0}",
    ruleWindowTitle: "St\u00edlusszab\u00e1ly: {0}",
    stylesFieldsetTitle: "St\u00edlusok",
    rulesFieldsetTitle: "Szab\u00e1lyok",
    errorTitle: "Hiba t\u00f6rt\u00e9nt a st\u00edlus ment\u00e9se sor\u00e1n",
    errorMsg: "Hiba t\u00f6rt\u00e9nt a st\u00edlus szerverre t\u00f6rt\u00e9n\u0151 ment\u00e9se sor\u00e1n."
  }
});
GeoExt.Lang.add("id", {
  "gxp.menu.LayerMenu.prototype": {
    layerText: "Layer"
  },
  "gxp.plugins.AddLayers.prototype": {
    addActionMenuText: "Tambahkan layer",
    addActionTip: "Tambahkan layer",
    addServerText: "Tambahkan server baru",
    addButtonText: "Add layers",
    untitledText: "Untitled",
    addLayerSourceErrorText: "Kesalahan mendapatkan kemampuan WMS ({msg}). \nSilakan cek url dan coba lagi.",
    availableLayersText: "Layer tersedia",
    expanderTemplateText: "<p><b>Abstract:</b> {abstract}</p>",
    panelTitleText: "Title",
    layerSelectionText: "View available data from:",
    doneText: "Selesai",
    uploadText: "Unggah data",
    addFeedActionMenuText: "Add feeds",
    searchText: "Search for layers"
  },
  "gxp.plugins.BingSource.prototype": {
    title: "Layers Bing",
    roadTitle: "Jalan Bing",
    aerialTitle: "Udara Bing",
    labeledAerialTitle: "Udara Bing dengan label"
  },
  "gxp.plugins.FeatureEditor.prototype": {
    splitButtonText: "Edit",
    createFeatureActionText: "Create",
    editFeatureActionText: "Modify",
    createFeatureActionTip: "Membuat sebuah fitur",
    editFeatureActionTip: "Edit fitur",
    commitTitle: "Commit message",
    commitText: "Please enter a commit message for this edit:"
  },
  "gxp.plugins.FeatureGrid.prototype": {
    displayFeatureText: "Tampilkan pada peta",
    firstPageTip: "Halaman pertama",
    previousPageTip: "Halaman sebelumnya",
    zoomPageExtentTip: "Zoom sampai batas halaman",
    nextPageTip: "Halaman berikut",
    lastPageTip: "Halaman terakhir",
    totalMsg: "Features {1} to {2} of {0}"
  },
  "gxp.plugins.GoogleEarth.prototype": {
    menuText: "3D Viewer",
    tooltip: "Switch to 3D Viewer"
  },
  "gxp.plugins.GoogleSource.prototype": {
    title: "Google Layers",
    roadmapAbstract: "Tampilkan peta jalan",
    satelliteAbstract: "Tampilkan citra satelit",
    hybridAbstract: "Tampilkan citra dengan nama jalan",
    terrainAbstract: "Tampilkan peta jalan dengan peta medan"
  },
  "gxp.plugins.LayerProperties.prototype": {
    menuText: "Properti layer",
    toolTip: "Properti layer"
  },
  "gxp.plugins.LayerTree.prototype": {
    shortTitle: "Layer-layer",
    rootNodeText: "Layer-layer",
    overlayNodeText: "Superimposisi",
    baseNodeText: "Layer dasar"
  },
  "gxp.plugins.LayerManager.prototype": {
    baseNodeText: "Layer dasar"
  },
  "gxp.plugins.Legend.prototype": {
    menuText: "Tampilkan legend",
    tooltip: "Tampilkan legend"
  },
  "gxp.plugins.LoadingIndicator.prototype": {
    loadingMapMessage: "Loading Map..."
  },
  "gxp.plugins.MapBoxSource.prototype": {
    title: "MapBox Layers",
    blueMarbleTopoBathyJanTitle: "Blue Marble Topography & Bathymetry (January)",
    blueMarbleTopoBathyJulTitle: "Blue Marble Topography & Bathymetry (July)",
    blueMarbleTopoJanTitle: "Blue Marble Topography (January)",
    blueMarbleTopoJulTitle: "Blue Marble Topography (July)",
    controlRoomTitle: "Control Room",
    geographyClassTitle: "Geography Class",
    naturalEarthHypsoTitle: "Natural Earth Hypsometric",
    naturalEarthHypsoBathyTitle: "Natural Earth Hypsometric & Bathymetry",
    naturalEarth1Title: "Natural Earth I",
    naturalEarth2Title: "Natural Earth II",
    worldDarkTitle: "World Dark",
    worldLightTitle: "World Light",
    worldPrintTitle: "World Print"
  },
  "gxp.plugins.Measure.prototype": {
    buttonText: "Pengukuran",
    lengthMenuText: "Panjang",
    areaMenuText: "Luas",
    lengthTooltip: "Pengukuran panjang",
    areaTooltip: "Pengukuran luas",
    measureTooltip: "Pengukuran"
  },
  "gxp.plugins.Navigation.prototype": {
    menuText: "Pan peta",
    tooltip: "Pan peta"
  },
  "gxp.plugins.NavigationHistory.prototype": {
    previousMenuText: "Zoom ke luas sebelumnya",
    nextMenuText: "Zoom ke luas setelahnya",
    previousTooltip: "Zoom ke luas sebelumnya",
    nextTooltip: "Zoom ke luas setelahnya"
  },
  "gxp.plugins.OSMSource.prototype": {
    title: "OpenStreetMap Layers",
    mapnikAttribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
    osmarenderAttribution: "Data CC-By-SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>"
  },
  "gxp.plugins.Print.prototype": {
    buttonText: "Cetak",
    menuText: "Cetak peta",
    tooltip: "Cetak peta",
    previewText: "Preview cetak",
    notAllNotPrintableText: "Tidak semua layer dapat dicetak",
    nonePrintableText: "Tidak ada peta yang dapat dicetak"
  },
  "gxp.plugins.MapQuestSource.prototype": {
    title: "MapQuest Layers",
    osmAttribution: "Tiles Courtesy of <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
    osmTitle: "MapQuest OpenStreetMap",
    naipAttribution: "Tiles Courtesy of <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
    naipTitle: "Citra MapQuest"
  },
  "gxp.plugins.QueryForm.prototype": {
    queryActionText: "Query",
    queryMenuText: "Queryable Layer",
    queryActionTip: "Query layer yang dipilih",
    queryByLocationText: "Query by current map extent",
    queryByAttributesText: "Query atribut",
    queryMsg: "Querying...",
    cancelButtonText: "Batal",
    noFeaturesTitle: "Tidak sesuai",
    noFeaturesMessage: "Permintaan anda tidak berhasil."
  },
  "gxp.plugins.RemoveLayer.prototype": {
    removeMenuText: "Hapus layer",
    removeActionTip: "Hapus layer"
  },
  "gxp.plugins.Styler.prototype": {
    menuText: "Edit Styles",
    tooltip: "Manage layer styles"
  },
  "gxp.plugins.WMSGetFeatureInfo.prototype": {
    buttonText: "Identify",
    infoActionTip: "Get Feature Info",
    popupTitle: "Info fitur"
  },
  "gxp.plugins.Zoom.prototype": {
    zoomMenuText: "Zoom Box",
    zoomInMenuText: "Memperbesar",
    zoomOutMenuText: "Memperkecil",
    zoomTooltip: "Zoom by dragging a box",
    zoomInTooltip: "Memperbesar",
    zoomOutTooltip: "Memperkecil"
  },
  "gxp.plugins.ZoomToExtent.prototype": {
    menuText: "Pembesaran maksimum",
    tooltip: "Pembesaran maksimum"
  },
  "gxp.plugins.ZoomToDataExtent.prototype": {
    menuText: "Pembesaran batas layer",
    tooltip: "Pembesaran batas layer"
  },
  "gxp.plugins.ZoomToLayerExtent.prototype": {
    menuText: "Pembesaran batas layer",
    tooltip: "Pembesaran batas layer"
  },
  "gxp.plugins.ZoomToSelectedFeatures.prototype": {
    menuText: "Pembesaran pada fitur terpilih",
    tooltip: "Pembesaran pada fitur terpilih"
  },
  "gxp.FeatureEditPopup.prototype": {
    closeMsgTitle: "Simpan update?",
    closeMsg: "Fitur belum di simpan. Apakah ingin disimpan?",
    deleteMsgTitle: "Hapus Fitur?",
    deleteMsg: "Anda yakin untuk menghapus fitur ini?",
    editButtonText: "Edit",
    editButtonTooltip: "Jadikan fitur dapat diedit",
    deleteButtonText: "Hapus",
    deleteButtonTooltip: "Hapus fitur ini",
    cancelButtonText: "Batal",
    cancelButtonTooltip: "Berhenti mengedit, batalkan perubahan",
    saveButtonText: "Simpan",
    saveButtonTooltip: "Simpan Update"
  },
  "gxp.FillSymbolizer.prototype": {
    fillText: "Isikan warna",
    colorText: "Warna",
    opacityText: "Kepekatan"
  },
  "gxp.FilterBuilder.prototype": {
    builderTypeNames: ["any", "all", "none", "not all"],
    preComboText: "Sesuai",
    postComboText: "of the following:",
    addConditionText: "tambahkan kondisi",
    addGroupText: "tambahkan grup",
    removeConditionText: "Hilangkan kondisi"
  },
  "gxp.grid.CapabilitiesGrid.prototype": {
    nameHeaderText: "Nama",
    titleHeaderText: "Judul",
    queryableHeaderText: "Queryable",
    layerSelectionLabel: "Melihat data dari:",
    layerAdditionLabel: "atau tambahkan sebagai server baru.",
    expanderTemplateText: "<p><b>Abstract:</b> {abstract}</p>"
  },
  "gxp.PointSymbolizer.prototype": {
    graphicCircleText: "Lingkaran",
    graphicSquareText: "square",
    graphicTriangleText: "Segitiga",
    graphicStarText: "Bintang",
    graphicCrossText: "Silang",
    graphicXText: "x",
    graphicExternalText: "dari luar",
    urlText: "URL",
    opacityText: "Kepekatan",
    symbolText: "Simbol",
    sizeText: "Ukuran",
    rotationText: "Rotasi"
  },
  "gxp.QueryPanel.prototype": {
    queryByLocationText: "Query lokasi",
    currentTextText: "Sejauh ini",
    queryByAttributesText: "Query atribut",
    layerText: "Layer"
  },
  "gxp.RulePanel.prototype": {
    scaleSliderTemplate: "{scaleType} Scale 1:{scale}",
    labelFeaturesText: "Label Fitur",
    labelsText: "Labels",
    basicText: "Basic",
    advancedText: "Tingkat lanjut",
    limitByScaleText: "Batasan oleh skala",
    limitByConditionText: "Batasan oleh kondisi",
    symbolText: "Simbol",
    nameText: "Nama"
  },
  "gxp.ScaleLimitPanel.prototype": {
    scaleSliderTemplate: "{scaleType} Scale 1:{scale}",
    minScaleLimitText: "Min scale limit",
    maxScaleLimitText: "Batas skala maksimum"
  },
  "gxp.StrokeSymbolizer.prototype": {
    solidStrokeName: "solid",
    dashStrokeName: "dash",
    dotStrokeName: "dot",
    titleText: "Stroke",
    styleText: "Style",
    colorText: "Color",
    widthText: "Width",
    opacityText: "Opacity"
  },
  "gxp.StylePropertiesDialog.prototype": {
    titleText: "General",
    nameFieldText: "Name",
    titleFieldText: "Title",
    abstractFieldText: "Abstract"
  },
  "gxp.TextSymbolizer.prototype": {
    labelValuesText: "Label nilai",
    haloText: "Halo",
    sizeText: "Ukuran"
  },
  "gxp.WMSLayerPanel.prototype": {
    attributionText: "Attribution",
    aboutText: "Tentang Program",
    titleText: "Judul",
    nameText: "Nama",
    descriptionText: "Deskripsi",
    displayText: "Tampilan",
    opacityText: "Kecerahan",
    formatText: "Format",
    transparentText: "Transparent",
    cacheText: "Cache",
    cacheFieldText: "Menggunakan versi cached",
    stylesText: "Styles tersedia",
    infoFormatText: "Info format",
    infoFormatEmptyText: "Select a format",
    displayOptionsText: "Display options",
    queryText: "Limit with filters",
    scaleText: "Limit by scale",
    minScaleText: "Min scale",
    maxScaleText: "Max scale",
    switchToFilterBuilderText: "Switch back to filter builder",
    cqlPrefixText: "or ",
    cqlText: "use CQL filter instead",
    singleTileText: "Single tile",
    singleTileFieldText: "Use a single tile"
  },
  "gxp.EmbedMapDialog.prototype": {
    publishMessage: "Peta anda siap dipublikasikan melalui web! Cukup salin HTML berikut untuk meletakkan peta dalam situs web Anda:",
    heightLabel: "Tinggi",
    widthLabel: "Lebar",
    mapSizeLabel: "Ukuran peta",
    miniSizeLabel: "Mini",
    smallSizeLabel: "Kecil",
    premiumSizeLabel: "Premium",
    largeSizeLabel: "Besar"
  },
  "gxp.WMSStylesDialog.prototype": {
    addStyleText: "Tambah",
    addStyleTip: "Tambah style baru",
    chooseStyleText: "Choose style",
    deleteStyleText: "Hilangkan",
    deleteStyleTip: "Hapus style yang dipilih",
    editStyleText: "Edit",
    editStyleTip: "Edit style yang dipilih",
    duplicateStyleText: "Duplikat",
    duplicateStyleTip: "Duplikat style yang dipilih",
    addRuleText: "Tambah",
    addRuleTip: "Tambah Rule baru",
    newRuleText: "New Rule",
    deleteRuleText: "Hilangkan",
    deleteRuleTip: "Hapus Rule yang dipilih",
    editRuleText: "Edit",
    editRuleTip: "Edit ule yang dipilih",
    duplicateRuleText: "Duplikat",
    duplicateRuleTip: "Duplikat style yang dipilih",
    cancelText: "Batal",
    saveText: "Save",
    styleWindowTitle: "User Style: {0}",
    ruleWindowTitle: "Style Rule: {0}",
    stylesFieldsetTitle: "Styles",
    rulesFieldsetTitle: "Rules"
  },
  "gxp.LayerUploadPanel.prototype": {
    titleLabel: "Judul",
    titleEmptyText: "Judul Layer",
    abstractLabel: "Deskripsi",
    abstractEmptyText: "Deskripsi Layer",
    fileLabel: "Data",
    fieldEmptyText: "Pencarian arsip data...",
    uploadText: "Pengisian",
    uploadFailedText: "Upload failed",
    processingUploadText: "Processing upload...",
    waitMsgText: "Mengisi Data anda...",
    invalidFileExtensionText: "Ekstensi file harus salah satu: ",
    optionsText: "Pilihan",
    workspaceLabel: "Ruang Kerja",
    workspaceEmptyText: "Ruang kerja Default",
    dataStoreLabel: "Penyimpanan",
    dataStoreEmptyText: "Create new store",
    defaultDataStoreEmptyText: "Penyimpanan data Default"
  },
  "gxp.NewSourceDialog.prototype": {
    title: "Add New Server...",
    cancelText: "Cancel",
    addServerText: "Add Server",
    invalidURLText: "Enter a valid URL to a WMS endpoint (e.g. http://example.com/geoserver/wms)",
    contactingServerText: "Contacting Server..."
  },
  "gxp.ScaleOverlay.prototype": {
    zoomLevelText: "Zoom level"
  },
  "gxp.Viewer.prototype": {
    saveErrorText: "Trouble saving: "
  },
  "gxp.FeedSourceDialog.prototype": {
    feedTypeText: "Sumber",
    addPicasaText: "Picasa Foto",
    addYouTubeText: "YouTube Video",
    addRSSText: "GeoRSS Pakan lain",
    addFeedText: "Tambah ke Peta",
    addTitleText: "Judul",
    keywordText: "Kata Kunci",
    doneText: "Selesai",
    titleText: "Tambah Blog",
    maxResultsText: "Produk Max"
  }
});
GeoExt.Lang.add("nl", {
  "gxp.plugins.AddLayers.prototype": {
    addActionMenuText: "Voeg kaartlagen toe",
    addActionTip: "Voeg kaartlagen toe",
    addServerText: "Voeg service toe",
    untitledText: "Onbekend",
    addLayerSourceErrorText: "Probleem bij het ophalen van de Error WMS GetCapabilities ({msg}).\nControleer de URL en probeer opnieuw.",
    availableLayersText: "Beschikbare kaartlagen",
    doneText: "Klaar",
    addFeedActionMenuText: "Add feeds",
    searchText: "Zoek naar kaartlagen"
  },
  "gxp.plugins.BingSource.prototype": {
    title: "Bing kaartlagen",
    roadTitle: "Bing wegen",
    aerialTitle: "Bing luchtfoto's",
    labeledAerialTitle: "Bing luchtfoto's met labels"
  },
  "gxp.plugins.FeatureEditor.prototype": {
    createFeatureActionTip: "Maak een nieuw object",
    editFeatureActionTip: "Wijzig een bestand object",
    commitTitle: "Wijzingsbeschrijving",
    commitText: "Voor a.u.b. een beschrijving in voor de wijziging:"
  },
  "gxp.plugins.FeatureGrid.prototype": {
    displayFeatureText: "Toon op kaart",
    firstPageTip: "Eerste pagina",
    previousPageTip: "Vorige pagina",
    zoomPageExtentTip: "Zoom naar de uitsnede van de pagina",
    nextPageTip: "Volgende pagina",
    lastPageTip: "Laatste pagina",
    totalMsg: "Features {1} to {2} of {0}"
  },
  "gxp.plugins.GoogleEarth.prototype": {
    menuText: "3D weergave",
    tooltip: "Bekijk kaart in 3D"
  },
  "gxp.plugins.GoogleSource.prototype": {
    title: "Google Maps kaartlagen",
    roadmapAbstract: "Toon stratenkaart",
    satelliteAbstract: "Toon satellietbeeld",
    hybridAbstract: "Toon rasterbeelden met labels",
    terrainAbstract: "Toon stratenkaart met terrein"
  },
  "gxp.plugins.LayerProperties.prototype": {
    menuText: "Kaartlaag eigenschappen",
    toolTip: "Kaartlaag eigenschappen"
  },
  "gxp.plugins.LayerTree.prototype": {
    shortTitle: "Kaartlagen",
    rootNodeText: "Kaartlagen",
    overlayNodeText: "Kaart overlays",
    baseNodeText: "Basis Kaarten"
  },
  "gxp.plugins.LayerManager.prototype": {
    baseNodeText: "Basis Kaart"
  },
  "gxp.plugins.Legend.prototype": {
    menuText: "Toon legenda",
    tooltip: "Toon legenda"
  },
  "gxp.plugins.LoadingIndicator.prototype": {
    loadingMapMessage: "Laden van de kaart..."
  },
  "gxp.plugins.MapBoxSource.prototype": {
    title: "MapBox Layers",
    blueMarbleTopoBathyJanTitle: "Blue Marble Topography & Bathymetry (January)",
    blueMarbleTopoBathyJulTitle: "Blue Marble Topography & Bathymetry (July)",
    blueMarbleTopoJanTitle: "Blue Marble Topography (January)",
    blueMarbleTopoJulTitle: "Blue Marble Topography (July)",
    controlRoomTitle: "Control Room",
    geographyClassTitle: "Geography Class",
    naturalEarthHypsoTitle: "Natural Earth Hypsometric",
    naturalEarthHypsoBathyTitle: "Natural Earth Hypsometric & Bathymetry",
    naturalEarth1Title: "Natural Earth I",
    naturalEarth2Title: "Natural Earth II",
    worldDarkTitle: "World Dark",
    worldLightTitle: "World Light",
    worldPrintTitle: "World Print"
  },
  "gxp.plugins.Measure.prototype": {
    splitButtonText: "Edit",
    createFeatureActionText: "Create",
    editFeatureActionText: "Modify",
    buttonText: "Meten",
    lengthMenuText: "Lengte",
    areaMenuText: "Oppervlakte",
    lengthTooltip: "Meet lengte",
    areaTooltip: "Meet oppervlakte",
    measureTooltip: "Meten"
  },
  "gxp.plugins.Navigation.prototype": {
    menuText: "Verschuif kaart",
    tooltip: "Verschuif kaart"
  },
  "gxp.plugins.NavigationHistory.prototype": {
    previousMenuText: "Zoom naar de vorige uitsnede",
    nextMenuText: "Zoom naar de volgende uitsnede",
    previousTooltip: "Zoom naar de vorige uitsnede",
    nextTooltip: "Zoom naar de volgende uitsnede"
  },
  "gxp.plugins.OSMSource.prototype": {
    title: "OpenStreetMap kaartlagen",
    mapnikAttribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
    osmarenderAttribution: "Data CC-By-SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>"
  },
  "gxp.plugins.Print.prototype": {
    buttonText: "Afdrukken",
    menuText: "Afdrukken kaart",
    tooltip: "Afdrukken kaart",
    previewText: "Voorvertoning",
    notAllNotPrintableText: "Niet alle lagen kunnen worden afgedrukt",
    nonePrintableText: "Geen van de huidige lagen kunnen worden afgedrukt"
  },
  "gxp.plugins.MapQuestSource.prototype": {
    title: "MapQuest kaartlagen",
    osmAttribution: "Tiles Courtesy of <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
    osmTitle: "MapQuest OpenStreetMap",
    naipAttribution: "Tiles Courtesy of <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
    naipTitle: "MapQuest Rasterbeelden"
  },
  "gxp.plugins.QueryForm.prototype": {
    queryActionText: "Bevraag",
    queryMenuText: "Bevraag kaartlaag",
    queryActionTip: "Bevraag de geselecteerde kaartlaag",
    queryByLocationText: "Query by current map extent",
    queryByAttributesText: "Bevraag middels attributen",
    queryMsg: "Bevragen...",
    cancelButtonText: "Annuleren",
    noFeaturesTitle: "Niks gevonden",
    noFeaturesMessage: "De bevraging heeft geen resultaten opgeleverd."
  },
  "gxp.plugins.RemoveLayer.prototype": {
    removeMenuText: "Verwijder kaartlaag",
    removeActionTip: "Verwijder kaartlaag"
  },
  "gxp.plugins.WMSGetFeatureInfo.prototype": {
    buttonText: "Identify",
    infoActionTip: "Attribuut-informatie",
    popupTitle: "Attribuut-informatie"
  },
  "gxp.plugins.Zoom.prototype": {
    zoomMenuText: "Zoom Box",
    zoomInMenuText: "Inzoomen",
    zoomOutMenuText: "Uitzoomen",
    zoomTooltip: "Zoom by dragging a box",
    zoomInTooltip: "Inzoomen",
    zoomOutTooltip: "Uitzoomen"
  },
  "gxp.plugins.ZoomToExtent.prototype": {
    menuText: "Zoom naar de maximale uitsnede",
    tooltip: "Zoom naar de maximale uitsnede"
  },
  "gxp.plugins.ZoomToDataExtent.prototype": {
    menuText: "Zoom naar de uitsnede van de kaartlaag",
    tooltip: "Zoom naar de uitsnede van de kaartlaag"
  },
  "gxp.plugins.ZoomToLayerExtent.prototype": {
    menuText: "Zoom naar de uitsnede van de kaartlaag",
    tooltip: "Zoom naar de uitsnede van de kaartlaag"
  },
  "gxp.plugins.ZoomToSelectedFeatures.prototype": {
    menuText: "Zoom naar de geselecteerde objecten",
    tooltip: "Zoom naar de geselecteerde objecten"
  },
  "gxp.FeatureEditPopup.prototype": {
    closeMsgTitle: "Wijzigingen opslaan?",
    closeMsg: "Het object is gewijzigd. Wilt u de wijzigingen opslaan?",
    deleteMsgTitle: "Verwijder object?",
    deleteMsg: "Weet u zeker dat u dit object wilt verwijderen?",
    editButtonText: "Wijzigen",
    editButtonTooltip: "Wijzig dit object",
    deleteButtonText: "Verwijderen",
    deleteButtonTooltip: "Verwijder dit object",
    cancelButtonText: "Annuleren",
    cancelButtonTooltip: "Stop met wijzigen, wijzigingen worden ongedaan gemaakt",
    saveButtonText: "Opslaan",
    saveButtonTooltip: "Wijzigingen opslaan"
  },
  "gxp.FillSymbolizer.prototype": {
    fillText: "Opvulling",
    colorText: "Kleur",
    opacityText: "Opaciteit"
  },
  "gxp.FilterBuilder.prototype": {
    builderTypeNames: ["om het even welk", "alle", "geen", "niet alle"],
    preComboText: "Overeenkomst",
    postComboText: "van de volgende:",
    addConditionText: "voeg voorwaarde toe",
    addGroupText: "voeg groep toe",
    removeConditionText: "verwijder voorwaarde"
  },
  "gxp.grid.CapabilitiesGrid.prototype": {
    nameHeaderText: "Naam",
    titleHeaderText: "Titel",
    queryableHeaderText: "Bevraagbaar",
    layerSelectionLabel: "Bekijk beschikbare data van:",
    layerAdditionLabel: "of voeg een nieuwe server toe.",
    expanderTemplateText: "<p><b>Samenvatting:</b> {abstract}</p>"
  },
  "gxp.PointSymbolizer.prototype": {
    graphicCircleText: "cirkel",
    graphicSquareText: "vierkant",
    graphicTriangleText: "driehoek",
    graphicStarText: "ster",
    graphicCrossText: "kruis",
    graphicXText: "x",
    graphicExternalText: "extern",
    urlText: "URL",
    opacityText: "opaciteit",
    symbolText: "Symbool",
    sizeText: "Grootte",
    rotationText: "Rotatie"
  },
  "gxp.QueryPanel.prototype": {
    queryByLocationText: "Bevraag middels locatie",
    currentTextText: "Huidige uitsnede",
    queryByAttributesText: "Bevraag middels attributen",
    layerText: "Kaartlaag"
  },
  "gxp.RulePanel.prototype": {
    scaleSliderTemplate: "{scaleType} Schaal 1:{scale}",
    labelFeaturesText: "Label objecten",
    advancedText: "Geavanceerd",
    limitByScaleText: "Beperk middels schaal",
    limitByConditionText: "Beperk middels voorwaarde",
    symbolText: "Symbool",
    nameText: "Naam"
  },
  "gxp.ScaleLimitPanel.prototype": {
    scaleSliderTemplate: "{scaleType} Schaal 1:{scale}",
    maxScaleLimitText: "Maximale schaal"
  },
  "gxp.TextSymbolizer.prototype": {
    labelValuesText: "Label waardes",
    haloText: "Halo",
    sizeText: "Grootte"
  },
  "gxp.WMSLayerPanel.prototype": {
    attributionText: "Bronvermelding",
    aboutText: "Informatie",
    titleText: "Titel",
    nameText: "Naam",
    descriptionText: "Omschrijving",
    displayText: "Toon",
    opacityText: "Opaciteit",
    formatText: "Formaat",
    transparentText: "Transparant",
    cacheText: "Cache",
    cacheFieldText: "Gebruik de versie vanuit de cache",
    stylesText: "Beschikbare Stijlen",
    infoFormatText: "Info formaat",
    infoFormatEmptyText: "Selecteer een formaat",
    displayOptionsText: "Weergave opties",
    queryText: "Begrens d.m.v. query",
    scaleText: "Bregens d.m.v. schaal",
    minScaleText: "Minimum schaal",
    maxScaleText: "Maximum schaal",
    switchToFilterBuilderText: "Terug naar de querybuilder",
    cqlPrefixText: "of ",
    cqlText: "gebruik een CQL filter",
    singleTileText: "Enkele kaarttegel",
    singleTileFieldText: "Gebruik 1 kaarttegel"
  },
  "gxp.EmbedMapDialog.prototype": {
    publishMessage: "Uw map is klaar voor publicatie! Kopieer de volgende HTML in uw website om de kaart in te voegen:",
    heightLabel: "Hoogte",
    widthLabel: "Breedte",
    mapSizeLabel: "Kaartgrootte",
    miniSizeLabel: "Mini",
    smallSizeLabel: "Klein",
    premiumSizeLabel: "Extra groot",
    largeSizeLabel: "Groot"
  },
  "gxp.StylesDialog.prototype": {
    addStyleText: "Voeg toe",
    addStyleTip: "Voeg een nieuwe stijl toe",
    deleteStyleText: "Verwijder",
    deleteStyleTip: "Verwijder de geselecteerde stijl",
    editStyleText: "Wijzig",
    editStyleTip: "Wijzig de geselecteerde stijl",
    duplicateStyleText: "Dupliceer",
    duplicateStyleTip: "Dupliceer de geselecteerde stijl",
    addRuleText: "Voeg toe",
    addRuleTip: "Voeg een nieuwe klasse toe",
    deleteRuleText: "Verwijder",
    deleteRuleTip: "Verwijder de geselecteerde klasse",
    editRuleText: "Wijzig",
    editRuleTip: "Wijzig de geselecteerde klasse",
    duplicateRuleText: "Dupliceer",
    duplicateRuleTip: "Dupliceer de geselecteerde klasse",
    cancelText: "Annuleer",
    styleWindowTitle: "Kaartstijl: {0}",
    ruleWindowTitle: "Klasse: {0}",
    stylesFieldsetTitle: "Kaartstijlen",
    rulesFieldsetTitle: "Klassen"
  },
  "gxp.LayerUploadPanel.prototype": {
    titleLabel: "Titel",
    titleEmptyText: "Kaartlaag titel",
    abstractLabel: "Omschrijving",
    abstractEmptyText: "Kaartlaag omschrijving",
    fileLabel: "Data",
    fieldEmptyText: "Kies data archief...",
    uploadText: "Upload",
    uploadFailedText: "Upload failed",
    processingUploadText: "Processing upload...",
    waitMsgText: "Bezig met uploaden van de data...",
    invalidFileExtensionText: "Bestandsextensie is een van: ",
    optionsText: "Opties",
    workspaceLabel: "Werkruimte",
    workspaceEmptyText: "Standaard werkruimte",
    dataStoreLabel: "Archief",
    dataStoreEmptyText: "Create new store",
    defaultDataStoreEmptyText: "Standaard archief"
  },
  "gxp.NewSourceDialog.prototype": {
    title: "Add New Server...",
    cancelText: "Cancel",
    addServerText: "Add Server",
    invalidURLText: "Enter a valid URL to a WMS endpoint (e.g. http://example.com/geoserver/wms)",
    contactingServerText: "Contacting Server..."
  },
  "gxp.ScaleOverlay.prototype": {
    zoomLevelText: "Zoom niveau"
  },
  "gxp.Viewer.prototype": {
    saveErrorText: "Problemen bij het opslaan: "
  },
  "gxp.FeedSourceDialog.prototype": {
    feedTypeText: "Bron",
    addPicasaText: "Picasa Foto's",
    addYouTubeText: "YouTube video's",
    addRSSText: "Andere GeoRSS Feed",
    addFeedText: "Voeg toe aan Map",
    addTitleText: "Titel",
    keywordText: "Trefwoord",
    doneText: "Klaar",
    titleText: "Voeg Feeds",
    maxResultsText: "Max Items"
  }
});
GeoExt.Lang.add("no", {
  "gxp.menu.LayerMenu.prototype": {
    layerText: "Kartlag"
  },
  "gxp.plugins.AddLayers.prototype": {
    addActionMenuText: "Legg til kartlag",
    addActionTip: "Legg til kartlag",
    addServerText: "Legg til en ny server",
    addButtonText: "Legg til kartlag",
    untitledText: "Uten titel",
    addLayerSourceErrorText: "Feil ved henting av WMS capabilities ({msg}).\nSjekk urlen og pr\u00f8v igjen.",
    availableLayersText: "Tilgjengelige kartlag",
    expanderTemplateText: "<p><b>Abstrakt:</b> {abstract}</p>",
    panelTitleText: "Titel",
    layerSelectionText: "Vis tilgjengelige data fra:",
    doneText: "Ferdig",
    uploadText: "Last opp kartlag",
    addFeedActionMenuText: "Legg til feeds",
    searchText: "S\u00f8k etter kartlag"
  },
  "gxp.plugins.BingSource.prototype": {
    title: "Bing kartlag",
    roadTitle: "Bing Roads",
    aerialTitle: "Bing Aerial",
    labeledAerialTitle: "Bing Aerial med Etikett"
  },
  "gxp.plugins.FeatureEditor.prototype": {
    splitButtonText: "Editer",
    createFeatureActionText: "Lag",
    editFeatureActionText: "Modifiser",
    createFeatureActionTip: "Lag en ny feature",
    editFeatureActionTip: "Editer eksisterende feature",
    commitTitle: "Sjekk inn melding",
    commitText: "Skriv in en innsjekkingsmelding for denne editeringen:"
  },
  "gxp.plugins.FeatureGrid.prototype": {
    displayFeatureText: "Vis p\u00e5 kart",
    firstPageTip: "F\u00f8rste side",
    previousPageTip: "Neste side",
    zoomPageExtentTip: "Zoom til side utstrekning",
    nextPageTip: "Neste side",
    lastPageTip: "Siste side",
    totalMsg: "Features {1} til {2} av {0}"
  },
  "gxp.plugins.GoogleEarth.prototype": {
    menuText: "3D Visning",
    tooltip: "Bytt til 3D Visning"
  },
  "gxp.plugins.GoogleSource.prototype": {
    title: "Google kartlag",
    roadmapAbstract: "Vis street map",
    satelliteAbstract: "Vis satelitt bilder",
    hybridAbstract: "Vis bilder med gatenavn",
    terrainAbstract: "Vis street map med terreng"
  },
  "gxp.plugins.LayerProperties.prototype": {
    menuText: "Kartlag Egenskaper",
    toolTip: "Kartlag Egenskaper"
  },
  "gxp.plugins.LayerTree.prototype": {
    shortTitle: "kartlag",
    rootNodeText: "Kartlag",
    overlayNodeText: "Kartlag",
    baseNodeText: "Bakgrunnskart"
  },
  "gxp.plugins.LayerManager.prototype": {
    baseNodeText: "Bakgrunnskart"
  },
  "gxp.plugins.Legend.prototype": {
    menuText: "Vis tegnforklaring",
    tooltip: "Vis tegnforklaring"
  },
  "gxp.plugins.LoadingIndicator.prototype": {
    loadingMapMessage: "Laster kart..."
  },
  "gxp.plugins.MapBoxSource.prototype": {
    title: "MapBox kartlag",
    blueMarbleTopoBathyJanTitle: "Blue Marble Topografi & Batymetri (januar)",
    blueMarbleTopoBathyJulTitle: "Blue Marble Topografi & Batymetri (Juli)",
    blueMarbleTopoJanTitle: "Blue Marble Topografi (januar)",
    blueMarbleTopoJulTitle: "Blue Marble Topografi (Juli)",
    controlRoomTitle: "Kontrollrom",
    geographyClassTitle: "Geografi Klasse",
    naturalEarthHypsoTitle: "Naturlig Jordklode Hypsometri",
    naturalEarthHypsoBathyTitle: "Naturlig Jordklode  Hypsometri & Batymetri",
    naturalEarth1Title: "Naturlig Jordklode I",
    naturalEarth2Title: "Naturlig Jordklode II",
    worldDarkTitle: "Verden M\u00f8rk",
    worldLightTitle: "Verden Lys",
    worldPrintTitle: "Verden utskrift"
  },
  "gxp.plugins.Measure.prototype": {
    buttonText: "M\u00e5l",
    lengthMenuText: "Lengde",
    areaMenuText: "Areal",
    lengthTooltip: "M\u00e5l lengde",
    areaTooltip: "M\u00e5l areal",
    measureTooltip: "M\u00e5l"
  },
  "gxp.plugins.Navigation.prototype": {
    menuText: "Panorer kart",
    tooltip: "Panorer kart"
  },
  "gxp.plugins.NavigationHistory.prototype": {
    previousMenuText: "Zoom til forrige utstrekning",
    nextMenuText: "Zoom til neste utstrekning",
    previousTooltip: "Zoom til forrige utstrekning",
    nextTooltip: "Zoom til neste utstrekning"
  },
  "gxp.plugins.OSMSource.prototype": {
    title: "OpenStreetMap Kartlag",
    mapnikAttribution: "&kopier; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> bidragsytere",
    osmarenderAttribution: "Data CC-By-SA av <a href='http://openstreetmap.org/'>OpenStreetMap</a>"
  },
  "gxp.plugins.Print.prototype": {
    buttonText: "Skriv ut",
    menuText: "Skriv ut kart",
    tooltip: "Skriv ut kart",
    previewText: "Forh\u00e5ndsvinsning av utskrift",
    notAllNotPrintableText: "Ikke alle kartlag kan skrives ut",
    nonePrintableText: "Ingen av dine valgte kartlag kan skrives ut"
  },
  "gxp.plugins.MapQuestSource.prototype": {
    title: "MapQuest Kartlag",
    osmAttribution: "Titler levert av <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
    osmTitle: "MapQuest OpenStreetMap",
    naipAttribution: "Tutker levert av <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
    naipTitle: "MapQuest bilder"
  },
  "gxp.plugins.QueryForm.prototype": {
    queryActionText: "Sp\u00f8r",
    queryMenuText: "Sp\u00f8r kartlag",
    queryActionTip: "Sp\u00f8r det valgte kartlaget",
    queryByLocationText: "Sp\u00f8r ved valgt kartlags utstrekning",
    queryByAttributesText: "Sp\u00f8r ved attributter",
    queryMsg: "Sp\u00f8rring...",
    cancelButtonText: "Kanseler",
    noFeaturesTitle: "Ingen treff",
    noFeaturesMessage: "Din sp\u00f8rring gav ingen treff."
  },
  "gxp.plugins.RemoveLayer.prototype": {
    removeMenuText: "Fjern kartlag",
    removeActionTip: "Fjern kartlag"
  },
  "gxp.plugins.Styler.prototype": {
    menuText: "Kartlag Stiler",
    tooltip: "Kartlag Stiler"
  },
  "gxp.plugins.WMSGetFeatureInfo.prototype": {
    buttonText: "Identifiser",
    infoActionTip: "Hent Feature Info",
    popupTitle: "Feature Info"
  },
  "gxp.plugins.Zoom.prototype": {
    zoomMenuText: "Zoom firkant",
    zoomInMenuText: "Zoom inn",
    zoomOutMenuText: "Zoom ut",
    zoomTooltip: "Zoom ved \u00e5 tegne en firkant",
    zoomInTooltip: "Zoom inn",
    zoomOutTooltip: "Zoom ut"
  },
  "gxp.plugins.ZoomToExtent.prototype": {
    menuText: "Zoom til maks utstrekning",
    tooltip: "Zoom til maks utstrekning"
  },
  "gxp.plugins.ZoomToDataExtent.prototype": {
    menuText: "Zoom til kartlagets utstrekning",
    tooltip: "Zoom til kartlagets utstrekning"
  },
  "gxp.plugins.ZoomToLayerExtent.prototype": {
    menuText: "Zoom til kartlagets utstrekning",
    tooltip: "Zoom til kartlagets utstrekning"
  },
  "gxp.plugins.ZoomToSelectedFeatures.prototype": {
    menuText: "Zoom til valgte features",
    tooltip: "Zoom til valgte features"
  },
  "gxp.FeatureEditPopup.prototype": {
    closeMsgTitle: "Lagre Endringer?",
    closeMsg: "Denne featuren har nye endringer som ikke er lagret. Vill du lagre endringene?",
    deleteMsgTitle: "Slett Feature?",
    deleteMsg: "Er du sikker p\u00e5 at du vil slette denne featuren?",
    editButtonText: "Editer",
    editButtonTooltip: "Gj\u00f8r denne featuren editerbar",
    deleteButtonText: "Slett",
    deleteButtonTooltip: "Slett denne featuren",
    cancelButtonText: "Kanseler",
    cancelButtonTooltip: "Stopp editering, forkast endringer",
    saveButtonText: "Lagre",
    saveButtonTooltip: "Lagre endringer"
  },
  "gxp.FillSymbolizer.prototype": {
    fillText: "Fyll ut",
    colorText: "Farge",
    opacityText: "Gjennomskinnelighet"
  },
  "gxp.FilterBuilder.prototype": {
    builderTypeNames: ["en", "alle", "ingen", "ikke alle"],
    preComboText: "Treff",
    postComboText: "av f\u00f8lgende:",
    addConditionText: "legg til betingelse",
    addGroupText: "Legg til gruppe",
    removeConditionText: "fjern betingelse"
  },
  "gxp.grid.CapabilitiesGrid.prototype": {
    nameHeaderText: "Navn",
    titleHeaderText: "Tittel",
    queryableHeaderText: "Mulig \u00e5 sp\u00f8rre",
    layerSelectionLabel: "Vis tilgjengelig data fra:",
    layerAdditionLabel: "eller legg til en ny server.",
    expanderTemplateText: "<p><b>Abstrakt:</b> {abstract}</p>"
  },
  "gxp.PointSymbolizer.prototype": {
    graphicCircleText: "sirkel",
    graphicSquareText: "firkant",
    graphicTriangleText: "triangel",
    graphicStarText: "stjerne",
    graphicCrossText: "kryss",
    graphicXText: "x",
    graphicExternalText: "ekstern",
    urlText: "URL",
    opacityText: "gjennomskinnelighet",
    symbolText: "Symbol",
    sizeText: "St\u00f8rrelse",
    rotationText: "Rotasjon"
  },
  "gxp.QueryPanel.prototype": {
    queryByLocationText: "Sp\u00f8r etter plassering",
    currentTextText: "N\u00e5v\u00e6rende utstrekning",
    queryByAttributesText: "Sp\u00f8r etter attributter",
    layerText: "Kartlag"
  },
  "gxp.RulePanel.prototype": {
    scaleSliderTemplate: "{scaleType} M\u00e5lestokk 1:{scale}",
    labelFeaturesText: "Etikett Features",
    labelsText: "Etiketter",
    basicText: "Grunnleggende",
    advancedText: "Avansert",
    limitByScaleText: "M\u00e5lestokksbegrensning",
    limitByConditionText: "Begrensning p\u00e5 tilstand",
    symbolText: "Symbol",
    nameText: "Navn"
  },
  "gxp.ScaleLimitPanel.prototype": {
    scaleSliderTemplate: "{scaleType} M\u00e5lestokk 1:{scale}",
    minScaleLimitText: "Minimum m\u00e5lestokksgrense",
    maxScaleLimitText: "Maximum m\u00e5lestokksgrense"
  },
  "gxp.StrokeSymbolizer.prototype": {
    solidStrokeName: "solid",
    dashStrokeName: "dash",
    dotStrokeName: "dot",
    titleText: "Strek",
    styleText: "Stil",
    colorText: "Farge",
    widthText: "Bredde",
    opacityText: "gjennomskinnelighet"
  },
  "gxp.StylePropertiesDialog.prototype": {
    titleText: "Generel",
    nameFieldText: "Navn",
    titleFieldText: "Tittel",
    abstractFieldText: "Abstrakt"
  },
  "gxp.TextSymbolizer.prototype": {
    labelValuesText: "Etikett verdier",
    haloText: "Halo",
    sizeText: "St\u00f8rrelse"
  },
  "gxp.WMSLayerPanel.prototype": {
    attributionText: "Tilskrivende",
    aboutText: "Om",
    titleText: "Tittel",
    nameText: "Navn",
    descriptionText: "Beskrivelse",
    displayText: "Visning",
    opacityText: "Gjennomskinnelighet",
    formatText: "Format",
    transparentText: "Gjennomskinnelighet",
    cacheText: "Cache",
    cacheFieldText: "Bruk cachet versjon",
    stylesText: "Tilgjengelige Stiler",
    infoFormatText: "Info format",
    infoFormatEmptyText: "Velg et format",
    displayOptionsText: "Visningsvalg",
    queryText: "Begrensning ved filter",
    scaleText: "Begrensning ved m\u00e5lestokk",
    minScaleText: "Minimum m\u00e5lestokk",
    maxScaleText: "Maximum m\u00e5lestokk",
    switchToFilterBuilderText: "Bytt tilbake til filter bygger",
    cqlPrefixText: "eller ",
    cqlText: "bruk CQL filter istedenfor",
    singleTileText: "Enkel tile",
    singleTileFieldText: "Bruk enkel tile"
  },
  "gxp.EmbedMapDialog.prototype": {
    publishMessage: "Ditt kartlag kan publisers til web!! Kopier f\u00f8lgende HTML for \u00e5 legge ditt kartlag til din webside:",
    heightLabel: "H\u00f8yde",
    widthLabel: "Bredde",
    mapSizeLabel: "Kart st\u00f8rrelse",
    miniSizeLabel: "Mini",
    smallSizeLabel: "Liten",
    premiumSizeLabel: "Premium",
    largeSizeLabel: "Stor"
  },
  "gxp.WMSStylesDialog.prototype": {
    addStyleText: "Legg til",
    addStyleTip: "Legg til en ny stil",
    chooseStyleText: "Velg en stil",
    deleteStyleText: "Fjern",
    deleteStyleTip: "Slett den valgte stilen",
    editStyleText: "Editer",
    editStyleTip: "Editer den valgte stilen",
    duplicateStyleText: "Reproduser",
    duplicateStyleTip: "Reproduser den valgte stilen",
    addRuleText: "Legg til",
    addRuleTip: "Legg til ny regel",
    newRuleText: "Ny Regel",
    deleteRuleText: "Fjern",
    deleteRuleTip: "Slett den valgte regelen",
    editRuleText: "Editer",
    editRuleTip: "Editer den valgte regelen",
    duplicateRuleText: "Reproduser",
    duplicateRuleTip: "Reproduser den valgte regelen",
    cancelText: "Kanseler",
    saveText: "Lagre",
    styleWindowTitle: "Bruker Stil: {0}",
    ruleWindowTitle: "Stil regel: {0}",
    stylesFieldsetTitle: "Stiler",
    rulesFieldsetTitle: "Regler"
  },
  "gxp.LayerUploadPanel.prototype": {
    titleLabel: "Titel",
    titleEmptyText: "Kartlags titel",
    abstractLabel: "Beskrivelse",
    abstractEmptyText: "Kartlag beskrivelse",
    fileLabel: "Data",
    fieldEmptyText: "Bla igjennom data arkiv...",
    uploadText: "Last opp",
    uploadFailedText: "Opplasting feilet",
    processingUploadText: "Prosesserer opplasting...",
    waitMsgText: "Laster opp dataene...",
    invalidFileExtensionText: "Filtype m\u00e5 v\u00e6re en av: ",
    optionsText: "Valt",
    workspaceLabel: "arbeidsomr\u00e5de",
    workspaceEmptyText: "standard arbeidsomr\u00e5de",
    dataStoreLabel: "Lagre",
    dataStoreEmptyText: "Velg et lagringsmedium",
    dataStoreNewText: "Velg et nytt lagringsmedium",
    crsLabel: "KRS",
    crsEmptyText: "Koordinat Referanse System ID",
    invalidCrsText: "KRS identifikatorer m\u00e5 v\u00e6re en EPSG kode (e.g. EPSG:4326)"
  },
  "gxp.NewSourceDialog.prototype": {
    title: "Legg til ny Server...",
    cancelText: "Kanseler",
    addServerText: "Legg til Server",
    invalidURLText: "Skriv inn en gyldig URL til et WMS endepunkt (f.eks. http://example.com/geoserver/wms)",
    contactingServerText: "Kontakter Server..."
  },
  "gxp.ScaleOverlay.prototype": {
    zoomLevelText: "Zoom niv\u00e5"
  },
  "gxp.Viewer.prototype": {
    saveErrorText: "Problemer med \u00e5 lagre: "
  },
  "gxp.FeedSourceDialog.prototype": {
    feedTypeText: "Kilde",
    addPicasaText: "Picasa Foto",
    addYouTubeText: "YouTube Videoer",
    addRSSText: "Andre GeoRSS Feed",
    addFeedText: "Legg til Kart",
    addTitleText: "Tittel",
    keywordText: "N\u00f8kkelord",
    doneText: "Ferdig",
    titleText: "Legg til Feeds",
    maxResultsText: "Max elementer"
  }
});
GeoExt.Lang.add("pl", {
  "gxp.menu.LayerMenu.prototype": {
    layerText: "Warstwa"
  },
  "gxp.plugins.AddLayers.prototype": {
    addMenuText: "Dodaj warstwy",
    addActionTip: "Dodaj warstwy",
    addServerText: "Dodaj serwer",
    addButtonText: "Dodaj warstwy",
    untitledText: "Bez tytu\u0142u",
    addLayerSourceErrorText: "B\u0142\u0105d w czasie pobierania parametr\u00f3w serwera WMS ({msg}).\nProsz\u0119 sprawdzi\u0107 adres.",
    availableLayersText: "Dost\u0119pne warstwy",
    expanderTemplateText: "<p><b>Opis:</b> {abstract}</p>",
    panelTitleText: "Tytu\u0142",
    layerSelectionText: "Poka\u017c dost\u0119pne warstwy z:",
    doneText: "Gotowe",
    uploadText: "Wy\u015blij dane",
    addFeedActionMenuText: "Add feeds",
    searchText: "Search for layers"
  },
  "gxp.plugins.BingSource.prototype": {
    title: "Bing Maps",
    roadTitle: "Bing - drogi",
    aerialTitle: "Bing - ortofoto",
    labeledAerialTitle: "Bing - ortofoto z etykietami"
  },
  "gxp.plugins.FeatureEditor.prototype": {
    splitButtonText: "Edit",
    createFeatureActionText: "Create",
    editFeatureActionText: "Modify",
    createFeatureActionTip: "Utw\u00f3rz nowy obiekt",
    editFeatureActionTip: "Edytuj istniej\u0105cy obiekt",
    commitTitle: "Commit message",
    commitText: "Please enter a commit message for this edit:"
  },
  "gxp.plugins.FeatureGrid.prototype": {
    displayFeatureText: "Poka\u017c na mapie",
    firstPageTip: "Pierwsza strona",
    previousPageTip: "Poprzednia strona",
    zoomPageExtentTip: "Powi\u0119ksz do zasi\u0119gu strony",
    nextPageTip: "Nast\u0119pna strona",
    lastPageTip: "Ostatnia strona",
    totalMsg: "Features {1} to {2} of {0}"
  },
  "gxp.plugins.GoogleEarth.prototype": {
    menuText: "Przegl\u0105darka 3D",
    tooltip: "Prze\u0142\u0105cz do widoku 3D"
  },
  "gxp.plugins.GoogleSource.prototype": {
    title: "Google Maps",
    roadmapAbstract: "Mapa drogowa",
    satelliteAbstract: "Zdj\u0119cia satelitarne",
    hybridAbstract: "Zdj\u0119cia satelitarne z etykietami",
    terrainAbstract: "Mapa terenowa z etykietami"
  },
  "gxp.plugins.LayerProperties.prototype": {
    menuText: "W\u0142a\u015bciwo\u015bci",
    toolTip: "W\u0142a\u015bciwo\u015bci"
  },
  "gxp.plugins.LayerTree.prototype": {
    shortTitle: "Mapa",
    rootNodeText: "Mapa",
    overlayNodeText: "Warstwy",
    baseNodeText: "Mapa referencyjna"
  },
  "gxp.plugins.LayerManager.prototype": {
    baseNodeText: "Mapa referencyjna"
  },
  "gxp.plugins.Legend.prototype": {
    menuText: "Legenda mapy",
    tooltip: "Legenda mapy"
  },
  "gxp.plugins.Measure.prototype": {
    buttonText: "Pomiary",
    lengthMenuText: "D\u0142ugo\u015b\u0107",
    areaMenuText: "Powierzchnia",
    lengthTooltip: "Pomiar odleg\u0142o\u015bci",
    areaTooltip: "Pomiar powierzchni",
    measureTooltip: "Pomiary"
  },
  "gxp.plugins.Navigation.prototype": {
    menuText: "Przesu\u0144 map\u0119",
    tooltip: "Przesu\u0144 map\u0119"
  },
  "gxp.plugins.NavigationHistory.prototype": {
    previousMenuText: "Poprzedni widok",
    nextMenuText: "Kolejny widok",
    previousTooltip: "Poprzedni widok",
    nextTooltip: "Kolejny widok"
  },
  "gxp.plugins.OSMSource.prototype": {
    title: "OpenStreetMap",
    mapnikAttribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
    osmarenderAttribution: "Data CC-By-SA by <a href='http://openstreetmap.org/'>OpenStreetMap</a>"
  },
  "gxp.plugins.Print.prototype": {
    buttonText: "Drukuj",
    menuText: "Drukuj",
    tooltip: "Drukuj",
    previewText: "Podgl\u0105d wydruku",
    notAllNotPrintableText: "Nie wszystkie warstwy mog\u0105 by\u0107 wydrukowane",
    nonePrintableText: "\u017badna z warstw nie mo\u017ce byc wydrukowana"
  },
  "gxp.plugins.MapQuestSource.prototype": {
    title: "MapQuest",
    osmAttribution: "Tiles Courtesy of <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
    osmTitle: "MapQuest OpenStreetMap",
    naipAttribution: "Tiles Courtesy of <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
    naipTitle: "MapQuest Imagery"
  },
  "gxp.plugins.QueryForm.prototype": {
    queryActionText: "Wyszukaj",
    queryMenuText: "Przeszukaj warstw\u0119",
    queryActionTip: "Przeszukaj zaznaczon\u0105 warstw\u0119",
    queryByLocationText: "Query by current map extent",
    queryByAttributesText: "Przeszukaj po atrybutach",
    queryMsg: "Przeszukiwanie...",
    cancelButtonText: "Anuluj",
    noFeaturesTitle: "Brak danych",
    noFeaturesMessage: "Przeszukanie nie zwr\u00f3ci\u0142o \u017cadnych danych."
  },
  "gxp.plugins.RemoveLayer.prototype": {
    removeMenuText: "Usu\u0144 warstw\u0119",
    removeActionTip: "Usu\u0144 warstw\u0119"
  },
  "gxp.plugins.Styler.prototype": {
    menuText: "Eycja styli",
    tooltip: "Zarz\u0105dzanie stylami warstwy"
  },
  "gxp.plugins.WMSGetFeatureInfo.prototype": {
    buttonText: "Identify",
    infoActionTip: "Info o obiekcie",
    popupTitle: "Info o obiekcie"
  },
  "gxp.plugins.Zoom.prototype": {
    zoomMenuText: "Zoom Box",
    zoomInMenuText: "Powi\u0119ksz",
    zoomOutMenuText: "Pomniejsz",
    zoomTooltip: "Zoom by dragging a box",
    zoomInTooltip: "Powi\u0119ksz",
    zoomOutTooltip: "Pomniejsz"
  },
  "gxp.plugins.ZoomToExtent.prototype": {
    menuText: "Ca\u0142a mapa",
    tooltip: "Ca\u0142a mapa"
  },
  "gxp.plugins.ZoomToDataExtent.prototype": {
    menuText: "Powi\u0119ksz do zasi\u0119gu ca\u0142ej warstwy",
    tooltip: "Powi\u0119ksz do zasi\u0119gu ca\u0142ej warstwy"
  },
  "gxp.plugins.ZoomToLayerExtent.prototype": {
    menuText: "Powi\u0119ksz do zasi\u0119gu ca\u0142ej warstwy",
    tooltip: "Powi\u0119ksz do zasi\u0119gu ca\u0142ej warstwy"
  },
  "gxp.plugins.ZoomToSelectedFeatures.prototype": {
    menuText: "Powi\u0119ksz do wybranych obiekt\u00f3w",
    tooltip: "Powi\u0119ksz do wybranych obiekt\u00f3w"
  },
  "gxp.FeatureEditPopup.prototype": {
    closeMsgTitle: "Zapisa\u0107 zmiany?",
    closeMsg: "Istniej\u0105 nie zapisane zmiany. Chcesz je zapisa\u0107?",
    deleteMsgTitle: "Usun\u0105\u0107 obiekt?",
    deleteMsg: "Jeste\u015b pewien \u017ce chcesz usun\u0105\u0107 ten obiekt?",
    editButtonText: "Edytuj",
    editButtonTooltip: "Edytuj ten obiekt",
    deleteButtonText: "Usu\u0144",
    deleteButtonTooltip: "Usu\u0144 ten obiekt",
    cancelButtonText: "Anuluj",
    cancelButtonTooltip: "Anuluj edycj\u0119 i nie zapisuj zmian",
    saveButtonText: "Zapisz",
    saveButtonTooltip: "Zapisz zmiany"
  },
  "gxp.FillSymbolizer.prototype": {
    fillText: "Wype\u0142nienie",
    colorText: "Kolor",
    opacityText: "Prze\u015bwit"
  },
  "gxp.FilterBuilder.prototype": {
    builderTypeNames: ["dowolny", "wszystkie", "\u017caden", "odwrotno\u015b\u0107"],
    preComboText: "Dopasuj",
    postComboText: "sposr\u00f3d:",
    addConditionText: "dodaj warunek",
    addGroupText: "dodaj grup\u0119",
    removeConditionText: "usu\u0144 warunek"
  },
  "gxp.grid.CapabilitiesGrid.prototype": {
    nameHeaderText: "Nazwa",
    titleHeaderText: "Tytu\u0142",
    queryableHeaderText: "Przeszukiwalna",
    layerSelectionLabel: "Zobacz dost\u0119pne dane z:",
    layerAdditionLabel: "lub dodaj serwer.",
    expanderTemplateText: "<p><b>Opis:</b> {abstract}</p>"
  },
  "gxp.PointSymbolizer.prototype": {
    graphicCircleText: "ko\u0142o",
    graphicSquareText: "kwadrat",
    graphicTriangleText: "tr\u00f3jk\u0105t",
    graphicStarText: "gwiazda",
    graphicCrossText: "krzy\u017c",
    graphicXText: "x",
    graphicExternalText: "inny",
    urlText: "URL",
    opacityText: "Prze\u015bwit",
    symbolText: "Symbol",
    sizeText: "Rozmiar",
    rotationText: "Obr\u00f3t"
  },
  "gxp.QueryPanel.prototype": {
    queryByLocationText: "Zapytanie przestrzenne",
    currentTextText: "Aktualne powi\u0119kszenie",
    queryByAttributesText: "Zapytanie atrybutowe",
    layerText: "Warstwa"
  },
  "gxp.RulePanel.prototype": {
    scaleSliderTemplate: "{scaleType} Skala 1:{scale}",
    labelFeaturesText: "Etykiety obiekt\u00f3w",
    labelsText: "Etykiety",
    basicText: "Podstawowa",
    advancedText: "Zaawansowana",
    limitByScaleText: "Ograniczenie skalowe",
    limitByConditionText: "Ograniczenie warunkowe",
    symbolText: "Symbol",
    nameText: "Nazwa"
  },
  "gxp.ScaleLimitPanel.prototype": {
    scaleSliderTemplate: "{scaleType} Skala 1:{scale}",
    minScaleLimitText: "Skala min.",
    maxScaleLimitText: "Skala max"
  },
  "gxp.StrokeSymbolizer.prototype": {
    solidStrokeName: "ci\u0105g\u0142y",
    dashStrokeName: "kreskowany",
    dotStrokeName: "kropkowany",
    titleText: "Obrys",
    styleText: "Styl",
    colorText: "Kolor",
    widthText: "Grubo\u015b\u0107",
    opacityText: "Prze\u015bwit"
  },
  "gxp.StylePropertiesDialog.prototype": {
    titleText: "Og\u00f3lny",
    nameFieldText: "Nazwa",
    titleFieldText: "Tytu\u0142",
    abstractFieldText: "Opis"
  },
  "gxp.TextSymbolizer.prototype": {
    labelValuesText: "Warto\u015bci etykiet",
    haloText: "Efekt Halo",
    sizeText: "Rozmiar"
  },
  "gxp.WMSLayerPanel.prototype": {
    attributionText: "Attribution",
    aboutText: "O",
    titleText: "Tytu\u0142",
    nameText: "Nazwa",
    descriptionText: "Opis",
    displayText: "Wy\u015bwietlanie",
    opacityText: "Prze\u015bwit",
    formatText: "Format",
    transparentText: "Prze\u017ar.",
    cacheText: "Cache",
    cacheFieldText: "U\u017cyj wersji cache",
    stylesText: "Dost\u0119pne Style",
    infoFormatText: "Info format",
    infoFormatEmptyText: "Select a format",
    displayOptionsText: "Display options",
    queryText: "Limit with filters",
    scaleText: "Limit by scale",
    minScaleText: "Min scale",
    maxScaleText: "Max scale",
    switchToFilterBuilderText: "Switch back to filter builder",
    cqlPrefixText: "or ",
    cqlText: "use CQL filter instead",
    singleTileText: "Single tile",
    singleTileFieldText: "Use a single tile"
  },
  "gxp.EmbedMapDialog.prototype": {
    publishMessage: "Twoja mapa jest gotowa do publikacji! Po prostu wklej poni\u017cszy kod na swojej witrynie:",
    heightLabel: "Wysoko\u015b\u0107",
    widthLabel: "Szeroko\u015b\u0107",
    mapSizeLabel: "Rozmiar mapy",
    miniSizeLabel: "Mini",
    smallSizeLabel: "Ma\u0142y",
    premiumSizeLabel: "\u015aredni",
    largeSizeLabel: "Du\u017cy"
  },
  "gxp.WMSStylesDialog.prototype": {
    addStyleText: "Dodaj",
    addStyleTip: "Dodaj nowy styl",
    chooseStyleText: "Wybierz styl",
    deleteStyleText: "Usu\u0144",
    deleteStyleTip: "Usu\u0144 styl",
    editStyleText: "Edytuj",
    editStyleTip: "Edytuj wybrany styl",
    duplicateStyleText: "Stw\u00f3rz kopi\u0119",
    duplicateStyleTip: "Stw\u00f3rz kopi\u0119 wybranego stylu",
    addRuleText: "Dodaj",
    addRuleTip: "Dodaj now\u0105 regu\u0142\u0119",
    newRuleText: "Nowa regu\u0142a",
    deleteRuleText: "Usu\u0144",
    deleteRuleTip: "Usu\u0144 wybran\u0105 regu\u0142\u0119",
    editRuleText: "Edytuj",
    editRuleTip: "Edytuj wybran\u0105 regu\u0142\u0119",
    duplicateRuleText: "Stw\u00f3rz kopi\u0119",
    duplicateRuleTip: "Skopiuj wybran\u0105 regu\u0142\u0119",
    cancelText: "Anuluj",
    saveText: "Zapisz",
    styleWindowTitle: "Styl u\u017cytkownika: {0}",
    ruleWindowTitle: "Regu\u0142a stylu: {0}",
    stylesFieldsetTitle: "Style",
    rulesFieldsetTitle: "Regu\u0142y"
  },
  "gxp.LayerUploadPanel.prototype": {
    titleLabel: "Tytu\u0142",
    titleEmptyText: "Tytu\u0142 warstwy",
    abstractLabel: "Opis",
    abstractEmptyText: "Opis warstwy",
    fileLabel: "Dane",
    fieldEmptyText: "Wska\u017c lokalizacj\u0119 danych...",
    uploadText: "Prze\u015blij",
    uploadFailedText: "Upload failed",
    processingUploadText: "Processing upload...",
    importText: "Importing upload...",
    waitMsgText: "Przesy\u0142anie danych...",
    invalidFileExtensionText: "Typ pliku musi by\u0107 jednym z poni\u017cszych: ",
    optionsText: "Opcje",
    workspaceLabel: "Obszar roboczy",
    workspaceEmptyText: "Domy\u015blny obszar roboczy",
    dataStoreLabel: "Magazyn danych",
    dataStoreEmptyText: "Create new store",
    defaultDataStoreEmptyText: "Domy\u015blny magazyn danych"
  },
  "gxp.NewSourceDialog.prototype": {
    title: "Dodaj serwer...",
    cancelText: "Anuluj",
    addServerText: "Dodaj serwer",
    invalidURLText: "Podaj prawid\u0142owy adres URL us\u0142ugi WMS (n.p. http://example.com/geoserver/wms)",
    contactingServerText: "\u0141\u0105czenie z serwerem..."
  },
  "gxp.ScaleOverlay.prototype": {
    zoomLevelText: "Poziom powi\u0119kszenia"
  },
  "gxp.Viewer.prototype": {
    saveErrorText: "Trouble saving: "
  },
  "gxp.FeedSourceDialog.prototype": {
    feedTypeText: "\u0179r\u00f3d\u0142o",
    addPicasaText: "Picasa zdj\u0119cia",
    addYouTubeText: "YouTube Videos",
    addRSSText: "Inne GeoRSS",
    addFeedText: "Dodaj do mapy",
    addTitleText: "Tytu\u0142",
    keywordText: "S\u0142owo",
    doneText: "Gotowe",
    titleText: "Dodaj kana\u0142y",
    maxResultsText: "Rzeczy Max"
  }
});
Ext.namespace("gxp.menu");
gxp.menu.LayerMenu = Ext.extend(Ext.menu.Menu, {
  layerText: "Layer",
  layers: null,
  initComponent: function() {
    gxp.menu.LayerMenu.superclass.initComponent.apply(this, arguments);
    this.layers.on("add", this.onLayerAdd, this);
    this.onLayerAdd()
  },
  onRender: function(a, b) {
    gxp.menu.LayerMenu.superclass.onRender.apply(this, arguments)
  },
  beforeDestroy: function() {
    this.layers && this.layers.on && this.layers.un("add", this.onLayerAdd, this);
    delete this.layers;
    gxp.menu.LayerMenu.superclass.beforeDestroy.apply(this, arguments)
  },
  onLayerAdd: function() {
    this.removeAll();
    this.add({
      iconCls: "gxp-layer-visibility",
      text: this.layerText,
      canActivate: !1
    }, "-");
    this.layers.each(function(a) {
      if (a.getLayer().displayInLayerSwitcher) {
        var b = new Ext.menu.CheckItem({
          text: a.get("title"),
          checked: a.getLayer().getVisibility(),
          group: a.get("group"),
          listeners: {
            checkchange: function(b, d) {
              a.getLayer().setVisibility(d)
            }
          }
        });
        2 < this.items.getCount() ? this.insert(2, b) : this.add(b)
      }
    }, this)
  }
});
Ext.reg("gxp_layermenu", gxp.menu.LayerMenu);
Ext.namespace("gxp.form");
gxp.form.FilterField = Ext.extend(Ext.form.CompositeField, {
  lowerBoundaryTip: "lower boundary",
  upperBoundaryTip: "upper boundary",
  caseInsensitiveMatch: !1,
  filter: null,
  attributes: null,
  attributesComboConfig: null,
  initComponent: function() {
    if (!this.filter) this.filter = this.createDefaultFilter();
    var a = "remote",
        b = new GeoExt.data.AttributeStore;
    if (this.attributes) 0 != this.attributes.getCount() ? (a = "local", this.attributes.each(function(a) {
      /gml:((Multi)?(Point|Line|Polygon|Curve|Surface|Geometry)).*/.exec(a.get("type")) || b.add([a])
    })) : b = this.attributes;
    a = {
      xtype: "combo",
      store: b,
      editable: "local" == a,
      typeAhead: !0,
      forceSelection: !0,
      mode: a,
      triggerAction: "all",
      ref: "property",
      allowBlank: this.allowBlank,
      displayField: "name",
      valueField: "name",
      value: this.filter.property,
      listeners: {
        select: function(a, b) {
          this.items.get(1).enable();
          this.filter.property = b.get("name");
          this.fireEvent("change", this.filter, this)
        },
        blur: function(a) {
          var b = a.store.findExact("name", a.getValue()); - 1 != b ? a.fireEvent("select", a, a.store.getAt(b)) : null != a.startValue && a.setValue(a.startValue)
        },
        scope: this
      },
      width: 120
    };
    this.attributesComboConfig = this.attributesComboConfig || {};
    Ext.applyIf(this.attributesComboConfig, a);
    this.items = this.createFilterItems();
    this.addEvents("change");
    gxp.form.FilterField.superclass.initComponent.call(this)
  },
  validateValue: function() {
    return this.filter.type === OpenLayers.Filter.Comparison.BETWEEN ? null !== this.filter.property && null !== this.filter.upperBoundary && null !== this.filter.lowerBoundary : null !== this.filter.property && null !== this.filter.value && null !== this.filter.type
  },
  createDefaultFilter: function() {
    return new OpenLayers.Filter.Comparison({
      matchCase: !this.caseInsensitiveMatch
    })
  },
  createFilterItems: function() {
    var a = this.filter.type === OpenLayers.Filter.Comparison.BETWEEN;
    return [this.attributesComboConfig, Ext.applyIf({
      xtype: "gxp_comparisoncombo",
      ref: "type",
      disabled: null == this.filter.property,
      allowBlank: this.allowBlank,
      value: this.filter.type,
      listeners: {
        select: function(a, c) {
          this.items.get(2).enable();
          this.items.get(3).enable();
          this.items.get(4).enable();
          this.setFilterType(c.get("value"));
          this.fireEvent("change", this.filter, this)
        },
        scope: this
      }
    }, this.comparisonComboConfig), {
      //CHANGE THIS
	  xtype: "textfield",
      disabled: null == this.filter.type,
      hidden: a,
      ref: "value",
      value: this.filter.value,
      width: 50,
      grow: !0,
      growMin: 50,
      anchor: "100%",
      allowBlank: this.allowBlank,
      listeners: {
        change: function(a, c) {
          this.filter.value = c;
          this.fireEvent("change", this.filter, this)
        },
        scope: this
      }
    }, {
      xtype: "textfield",
      disabled: null == this.filter.type,
      hidden: !a,
      value: this.filter.lowerBoundary,
      tooltip: this.lowerBoundaryTip,
      grow: !0,
      growMin: 30,
      ref: "lowerBoundary",
      anchor: "100%",
      allowBlank: this.allowBlank,
      listeners: {
        change: function(a, c) {
          this.filter.lowerBoundary = c;
          this.fireEvent("change", this.filter, this)
        },
        render: function(a) {
          Ext.QuickTips.register({
            target: a.getEl(),
            text: this.lowerBoundaryTip
          })
        },
        autosize: function(a, c) {
          a.setWidth(c);
          a.ownerCt.doLayout()
        },
        scope: this
      }
    }, {
      xtype: "textfield",
      disabled: null == this.filter.type,
      hidden: !a,
      grow: !0,
      growMin: 30,
      ref: "upperBoundary",
      value: this.filter.upperBoundary,
      allowBlank: this.allowBlank,
      listeners: {
        change: function(a, c) {
          this.filter.upperBoundary = c;
          this.fireEvent("change", this.filter, this)
        },
        render: function(a) {
          Ext.QuickTips.register({
            target: a.getEl(),
            text: this.upperBoundaryTip
          })
        },
        scope: this
      }
    }]
  },
  setFilterType: function(a) {
    this.filter.type = a;
    a === OpenLayers.Filter.Comparison.BETWEEN ? (this.items.get(2).hide(), this.items.get(3).show(), this.items.get(4).show()) : (this.items.get(2).show(), this.items.get(3).hide(), this.items.get(4).hide());
    this.doLayout()
  },
  setFilter: function(a) {
    var b = this.filter.type;
    this.filter = a;
    b !== a.type && this.setFilterType(a.type);
    this.property.setValue(a.property);
    this.type.setValue(a.type);
    a.type === OpenLayers.Filter.Comparison.BETWEEN ? (this.lowerBoundary.setValue(a.lowerBoundary), this.upperBoundary.setValue(a.upperBoundary)) : this.value.setValue(a.value);
    this.fireEvent("change", this.filter, this)
  }
});
Ext.reg("gxp_filterfield", gxp.form.FilterField);
Ext.namespace("gxp.menu");
gxp.menu.TimelineMenu = Ext.extend(Ext.menu.Menu, {
  filterLabel: "Filter",
  attributeLabel: "Label",
  showNotesText: "Show notes",
  layers: null,
  subMenuSize: [350, 60],
  initComponent: function() {
    gxp.menu.TimelineMenu.superclass.initComponent.apply(this, arguments);
    this.timelinePanel = this.timelineTool && this.timelineTool.getTimelinePanel();
    this.layers.on("add", this.onLayerAddOrRemove, this);
    this.layers.on("remove", this.onLayerAddOrRemove, this);
    this.onLayerAddOrRemove()
  },
  onRender: function(a, b) {
    gxp.menu.TimelineMenu.superclass.onRender.apply(this, arguments)
  },
  beforeDestroy: function() {
    this.layers && this.layers.on && (this.layers.un("add", this.onLayerAddOrRemove, this), this.layers.un("remove", this.onLayerAddOrRemove, this));
    delete this.layers;
    gxp.menu.TimelineMenu.superclass.beforeDestroy.apply(this, arguments)
  },
  onLayerAddOrRemove: function() {
    this.removeAll();
    if (this.timelinePanel.annotationsRecord) {
      var a = this.timelinePanel.annotationsRecord,
          b = this.timelinePanel.getKey(a);
      this.add(new Ext.menu.CheckItem({
        text: this.showNotesText,
        checked: this.timelinePanel.layerLookup[b] && this.timelinePanel.layerLookup[b].visible || !0,
        listeners: {
          checkchange: function(b, d) {
            this.timelinePanel.setLayerVisibility(b, d, a, !1)
          },
          scope: this
        }
      }))
    }
    this.layers.each(function(a) {
      var b = a.getLayer();
      if (b.displayInLayerSwitcher && b.dimensions && b.dimensions.time) {
        var b = this.timelinePanel.getKey(a),
            e = this.timelinePanel.schemaCache[b];
        this.add(new Ext.menu.CheckItem({
          text: a.get("title"),
          checked: this.timelinePanel.layerLookup[b] && this.timelinePanel.layerLookup[b].visible || !1,
          menu: new Ext.menu.Menu({
            plain: !0,
            style: {
              overflow: "visible"
            },
            showSeparator: !1,
            items: [{
              xtype: "container",
              width: this.subMenuSize[0],
              height: this.subMenuSize[1],
              layout: "vbox",
              defaults: {
                border: !1
              },
              layoutConfig: {
                align: "stretch",
                pack: "start"
              },
              items: [{
                xtype: "form",
                labelWidth: 75,
                height: 30,
                items: [{
                  xtype: "combo",
                  forceSelection: !0,
                  getListParent: function() {
                    return this.el.up(".x-menu")
                  },
                  store: e,
                  mode: "local",
                  triggerAction: "all",
                  value: this.timelinePanel.layerLookup[b] ? this.timelinePanel.layerLookup[b].titleAttr : null,
                  listeners: {
                    select: function(b) {
                      this.timelinePanel.setTitleAttribute(a, b.getValue())
                    },
                    scope: this
                  },
                  displayField: "name",
                  valueField: "name",
                  fieldLabel: this.attributeLabel
                }]
              }, {
                xtype: "container",
                layout: "hbox",
                id: "gxp_timemenufilter",
                layoutConfig: {
                  align: "stretch",
                  pack: "start"
                },
                defaults: {
                  border: !1
                },
                items: [{
                  width: 25,
                  xtype: "form",
                  layout: "fit",
                  items: [{
                    xtype: "checkbox",
                    checked: this.timelinePanel.layerLookup[b] && void 0 !== this.timelinePanel.layerLookup[b].clientSideFilter,
                    ref: "../applyFilter",
                    listeners: {
                      check: function(b, d) {
                        var e = Ext.getCmp("gxp_timemenufilter").filter;
                        e.isValid() && this.timelinePanel.applyFilter(a, e.filter, d)
                      },
                      scope: this
                    }
                  }]
                }, {
                  flex: 1,
                  xtype: "form",
                  labelWidth: 75,
                  items: [{
                    xtype: "gxp_filterfield",
                    ref: "../filter",
                    filter: this.timelinePanel.layerLookup[b] ? this.timelinePanel.layerLookup[b].clientSideFilter : null,
                    listeners: {
                      change: function(b, d) {
                        d.isValid() && this.timelinePanel.applyFilter(a, b, Ext.getCmp("gxp_timemenufilter").applyFilter.getValue())
                      },
                      scope: this
                    },
                    attributesComboConfig: {
                      getListParent: function() {
                        return this.el.up(".x-menu")
                      }
                    },
                    comparisonComboConfig: {
                      getListParent: function() {
                        return this.el.up(".x-menu")
                      }
                    },
                    fieldLabel: this.filterLabel,
                    attributes: e
                  }]
                }],
                height: 30
              }]
            }]
          }),
          listeners: {
            checkchange: function(b, d) {
              this.timelinePanel.setLayerVisibility(b, d, a)
            },
            scope: this
          }
        }))
      }
    }, this)
  }
});
Ext.reg("gxp_timelinemenu", gxp.menu.TimelineMenu);
(function() {
  Ext.util.Observable.observeClass(Ext.form.TextField);
  Ext.form.TextField.on("specialkey", function(a, b) {
    a.hasFocus && b.getKey() === b.ENTER && a.blur.defer(10, a)
  })
})();
Ext.namespace("gxp.plugins");
gxp.plugins.Tool = Ext.extend(Ext.util.Observable, {
  ptype: "gxp_tool",
  autoActivate: !0,
  actionTarget: "map.tbar",
  showButtonText: !1,
  output: null,
  constructor: function(a) {
    this.initialConfig = a || {};
    this.active = !1;
    Ext.apply(this, a);
    if (!this.id) this.id = Ext.id();
    this.output = [];
    this.addEvents("activate", "deactivate");
    gxp.plugins.Tool.superclass.constructor.apply(this, arguments)
  },
  init: function(a) {
    a.tools[this.id] = this;
    this.target = a;
    this.autoActivate && this.activate();
    this.target.on("portalready", this.addActions, this)
  },
  activate: function() {
    if (!1 === this.active) return this.active = !0, this.fireEvent("activate", this), !0
  },
  deactivate: function() {
    if (!0 === this.active) return this.active = !1, this.fireEvent("deactivate", this), !0
  },
  getContainer: function(a) {
    var b, c;
    b = a.split(".");
    if (c = b[0]) if ("map" == c) a = this.target.mapPanel;
    else {
      if (a = Ext.getCmp(c) || this.target.portal[c], !a) throw Error("Can't find component with id: " + c);
    } else a = this.target.portal;
    if (b = 1 < b.length && b[1]) a = (c = {
      tbar: "getTopToolbar",
      bbar: "getBottomToolbar",
      fbar: "getFooterToolbar"
    }[b]) ? a[c]() : a[b];
    return a
  },
  addActions: function(a) {
    a = a || this.actions;
    if (!a || null === this.actionTarget) this.addOutput();
    else {
      var b = this.actionTarget instanceof Array ? this.actionTarget : [this.actionTarget],
          a = a instanceof Array ? a : [a],
          c, d, e, f, g, h, j = null;
      for (e = b.length - 1; 0 <= e; --e) {
        if (c = b[e]) {
          if (c instanceof Object) j = c.index, c = c.target;
          h = this.getContainer(c)
        }
        for (f = 0, g = a.length; f < g; ++f) {
          if (!(a[f] instanceof Ext.Action || a[f] instanceof Ext.Component)) if ((d = Ext.getCmp(a[f])) && (a[f] = d), "string" != typeof a[f]) {
            if (f == this.defaultAction) a[f].pressed = !0;
            a[f] = new Ext.Action(a[f])
          }
          c = a[f];
          if (f == this.defaultAction && c instanceof GeoExt.Action) c.isDisabled() ? c.activateOnEnable = !0 : c.control.activate();
          if (h) {
            this.showButtonText && c.setText(c.initialConfig.buttonText);
            h instanceof Ext.menu.Menu ? c = Ext.apply(new Ext.menu.CheckItem(c), {
              text: c.initialConfig.menuText,
              group: c.initialConfig.toggleGroup,
              groupClass: null
            }) : h instanceof Ext.Toolbar || (c = new Ext.Button(c));
            var k = null === j ? h.add(c) : h.insert(j, c);
            c = c instanceof Ext.Button ? c : k;
            null !== j && (j += 1);
            if (null != this.outputAction && f == this.outputAction) c.on("click", function() {
              d ? this.outputTarget ? d.show() : d.ownerCt.ownerCt.show() : d = this.addOutput()
            }, this)
          }
        }
        h && (h.isVisible() ? h.doLayout() : h instanceof Ext.menu.Menu || h.show())
      }
      return this.actions = a
    }
  },
  addOutput: function(a) {
    if (a || this.outputConfig) {
      var a = a || {},
          b = this.outputTarget;
      b ? (b = this.getContainer(b), a instanceof Ext.Component || Ext.apply(a, this.outputConfig)) : (b = this.outputConfig || {}, b = (new Ext.Window(Ext.apply({
        hideBorders: !0,
        shadow: !1,
        closeAction: "hide",
        autoHeight: !b.height,
        layout: b.height ? "fit" : void 0,
        items: [{
          defaults: Ext.applyIf({
            autoHeight: !b.height && !(b.defaults && b.defaults.height)
          }, b.defaults)
        }]
      }, b))).show().items.get(0));
      if (b) return a = b.add(a), a.on("removed", function(a) {
        this.output.remove(a)
      }, this, {
        single: !0
      }), a instanceof Ext.Window ? a.show() : b.doLayout(), this.output.push(a), a;
      a = this.ptype;
      window.console && console.error("Failed to create output for plugin with ptype: " + a)
    }
  },
  removeOutput: function() {
    for (var a, b = this.output.length - 1; 0 <= b; --b) if (a =
    this.output[b], this.outputTarget) if (a.ownerCt) {
      if (a.ownerCt.remove(a), a.ownerCt instanceof Ext.Window) a.ownerCt[a.ownerCt.closeAction]()
    } else a.remove();
    else a.findParentBy(function(a) {
      return a instanceof Ext.Window
    }).close();
    this.output = []
  },
  getState: function() {
    return Ext.apply({}, this.initialConfig)
  }
});
Ext.preg(gxp.plugins.Tool.prototype.ptype, gxp.plugins.Tool);
Ext.namespace("gxp");
gxp.NewSourceDialog = Ext.extend(Ext.Panel, {
  title: "Add New Server...",
  cancelText: "Cancel",
  addServerText: "Add Server",
  invalidURLText: "Enter a valid URL to a WMS/TMS/REST endpoint (e.g. http://example.com/geoserver/wms)",
  contactingServerText: "Contacting Server...",
  bodyStyle: "padding: 0px",
  error: null,
  initComponent: function() {
    this.addEvents("urlselected");
    this.urlTextField = new Ext.form.TextField({
      fieldLabel: "URL",
      allowBlank: !1,
      width: 240,
      msgTarget: "under",
      validator: this.urlValidator.createDelegate(this),
      listeners: {
        specialkey: function(a, b) {
          b.getKey() === b.ENTER && this.addServer()
        },
        scope: this
      }
    });
    this.form = new Ext.form.FormPanel({
      items: [{
        xtype: "combo",
        width: 240,
        name: "type",
        fieldLabel: "Type",
        value: "WMS",
        mode: "local",
        triggerAction: "all",
        store: [
          ["WMS", "Web Map Service (WMS)"],
          ["TMS", "Tiled Map Service (TMS)"],
          ["REST", "ArcGIS REST Service (REST)"]
        ]
      },
      this.urlTextField],
      border: !1,
      labelWidth: 30,
      bodyStyle: "padding: 5px",
      autoWidth: !0,
      autoHeight: !0,
      listeners: {
        afterrender: function() {
          this.urlTextField.focus(!1, !0)
        },
        scope: this
      }
    });
    this.bbar = [new Ext.Button({
      text: this.cancelText,
      handler: this.hide,
      scope: this
    }), new Ext.Toolbar.Fill, new Ext.Button({
      text: this.addServerText,
      iconCls: "add",
      handler: this.addServer,
      scope: this
    })];
    this.items = this.form;
    gxp.NewSourceDialog.superclass.initComponent.call(this);
    this.form.on("render", function() {
      this.loadMask = new Ext.LoadMask(this.form.getEl(), {
        msg: this.contactingServerText
      })
    }, this);
    this.on({
      hide: this.reset,
      removed: this.reset,
      scope: this
    });
    this.on("urlselected", function(a, b) {
      this.setLoading();
      this.addSource(b, this.hide, function() {
        this.setError(this.sourceLoadFailureMessage)
      }, this)
    }, this)
  },
  addServer: function() {
    this.error = null;
    this.urlTextField.validate() && this.fireEvent("urlselected", this, this.urlTextField.getValue(), this.form.getForm().findField("type").getValue())
  },
  reset: function() {
    this.error = null;
    this.urlTextField.reset();
    this.loadMask.hide()
  },
  urlRegExp: /^(http(s)?:)?\/\/([\w%]+:[\w%]+@)?([^@\/:]+)(:\d+)?\//i,
  urlValidator: function(a) {
    a = this.urlRegExp.test(a) ? !this.error || this.error : this.invalidURLText;
    this.error = null;
    return a
  },
  setLoading: function() {
    this.loadMask.show()
  },
  setError: function(a) {
    this.loadMask.hide();
    this.error = a;
    this.urlTextField.validate()
  },
  addSource: function() {}
});
Ext.reg("gxp_newsourcedialog", gxp.NewSourceDialog);
Ext.namespace("gxp.plugins");
gxp.plugins.LayerSource = Ext.extend(Ext.util.Observable, {
  store: null,
  lazy: !1,
  hidden: !1,
  title: "",
  constructor: function(a) {
    this.initialConfig = a;
    Ext.apply(this, a);
    this.addEvents("ready", "failure");
    gxp.plugins.LayerSource.superclass.constructor.apply(this, arguments)
  },
  init: function(a) {
    this.target = a;
    this.createStore()
  },
  getMapProjection: function() {
    var a = this.target.mapPanel.map.projection;
    return this.target.mapPanel.map.getProjectionObject() || a && new OpenLayers.Projection(a) || new OpenLayers.Projection("EPSG:4326")
  },
  getProjection: function(a) {
    var a = a.getLayer(),
        b = this.getMapProjection();
    return (a.projection ? a.projection instanceof OpenLayers.Projection ? a.projection : new OpenLayers.Projection(a.projection) : b).equals(b) ? b : null
  },
  createStore: function() {
    this.fireEvent("ready", this)
  },
  createLayerRecord: function() {},
  getConfigForRecord: function(a) {
    var b = a.getLayer();
    return {
      source: a.get("source"),
      name: a.get("name"),
      title: a.get("title"),
      visibility: b.getVisibility(),
      opacity: b.opacity || void 0,
      group: a.get("group"),
      fixed: a.get("fixed"),
      selected: a.get("selected")
    }
  },
  getState: function() {
    return Ext.apply({}, this.initialConfig)
  }
});
Ext.namespace("gxp.plugins");
gxp.plugins.FeedGetFeatureInfo = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_getfeedfeatureinfo",
  init: function(a) {
    gxp.plugins.FeedGetFeatureInfo.superclass.init.apply(this, arguments);
    this.target.mapPanel.layers.on({
      add: this.addLayer,
      remove: this.removeLayer,
      scope: this
    })
  },
  addLayer: function(a, b) {
    for (var c = 0, d = b.length; c < d; ++c) {
      var e = b[c],
          f = this.target.getSource(e),
          e = e.getLayer();
      if (f instanceof gxp.plugins.FeedSource) null == this.target.selectControl ? (this.target.selectControl = new OpenLayers.Control.SelectFeature(e, {
        clickout: !0,
        listeners: {
          clickoutFeature: function() {}
        },
        scope: this
      }), this.target.mapPanel.map.addControl(this.target.selectControl)) : (f = this.target.selectControl.layers ? this.target.selectControl.layers : this.target.selectControl.layer ? [this.target.selectControl.layer] : [], f.push(e), this.target.selectControl.setLayer(f))
    }
    this.target.selectControl && this.target.selectControl.activate()
  },
  removeLayer: function(a, b) {
    b.length || (b = [b]);
    for (var c = 0, d = b.length; c < d; ++c) {
      var e = b[c].getLayer(),
          f = this.target.selectControl;
      if (null != f) if (f.layers) for (var g = 0; g < f.layers.length; g++) {
        var h = f.layers;
        f.layers[g].id === e.id && (h.splice(g, 1), f.setLayer(h))
      } else null != f.layer && e.id === f.layer.id && f.setLayer([])
    }
  }
});
Ext.preg(gxp.plugins.FeedGetFeatureInfo.prototype.ptype, gxp.plugins.FeedGetFeatureInfo);
Ext.namespace("gxp.plugins");
gxp.plugins.FeedSource = Ext.extend(gxp.plugins.LayerSource, {
  ptype: "gxp_feedsource",
  title: "Feed Source",
  format: "OpenLayers.Format.GeoRSS",
  popupTemplate: '<a target="_blank" href="{link}">{description}</a>',
  fixed: !0,
  createLayerRecord: function(a) {
    var b = new OpenLayers.Layer.Vector(a.name, {
      projection: "projection" in a ? a.projection : "EPSG:4326",
      visibility: "visibility" in a ? a.visibility : !0,
      strategies: [this.fixed ? new OpenLayers.Strategy.Fixed : new OpenLayers.Strategy.BBOX({
        resFactor: 1,
        ratio: 1
      })],
      protocol: new OpenLayers.Protocol.HTTP({
        url: this.url,
        params: a.params,
        format: this.getFormat(a)
      }),
      styleMap: this.getStyleMap(a)
    });
    this.configureInfoPopup(b);
    var c = GeoExt.data.LayerRecord.create([{
      name: "name",
      type: "string"
    }, {
      name: "source",
      type: "string"
    }, {
      name: "group",
      type: "string"
    }, {
      name: "fixed",
      type: "boolean"
    }, {
      name: "selected",
      type: "boolean"
    }, {
      name: "visibility",
      type: "boolean"
    }, {
      name: "format",
      type: "string"
    }, {
      name: "defaultStyle"
    }, {
      name: "selectStyle"
    }, {
      name: "params"
    }]),
        d = "format" in a ? a.format : this.format;
    return new c({
      layer: b,
      name: a.name,
      source: a.source,
      group: a.group,
      fixed: "fixed" in a ? a.fixed : !1,
      selected: "selected" in a ? a.selected : !1,
      params: "params" in a ? a.params : {},
      visibility: "visibility" in a ? a.visibility : !1,
      format: d instanceof String ? d : null,
      defaultStyle: "defaultStyle" in a ? a.defaultStyle : {},
      selectStyle: "selectStyle" in a ? a.selectStyle : {}
    }, b.id)
  },
  getConfigForRecord: function(a) {
    var b = gxp.plugins.FeedSource.superclass.getConfigForRecord.apply(this, arguments);
    return Ext.apply(b, {
      name: a.get("name"),
      group: a.get("group"),
      fixed: a.get("fixed"),
      selected: a.get("selected"),
      params: a.get("params"),
      visibility: a.getLayer().getVisibility(),
      format: a.get("format"),
      defaultStyle: a.getLayer().styleMap.styles["default"].defaultStyle,
      selectStyle: a.getLayer().styleMap.styles.select.defaultStyle
    })
  },
  getFormat: function(a) {
    var b = window,
        a = "format" in a ? a.format : this.format;
    if ("string" == typeof a || a instanceof String) {
      for (var a = a.split("."), c = 0, d = a.length; c < d && !(b = b[a[c]], !b); ++c);
      if (b && b.prototype && b.prototype.initialize) return a = function() {
        b.prototype.initialize.apply(this)
      }, a.prototype =
      b.prototype, new a
    } else
    return a
  },
  configureInfoPopup: function(a) {
    var b = new Ext.XTemplate(this.popupTemplate);
    a.events.on({
      featureselected: function(a) {
        a = a.feature;
        if (this.target.selectControl) this.target.selectControl.popup && this.target.selectControl.popup.close(), this.target.selectControl.popup = new GeoExt.Popup({
          title: a.attributes.title,
          closeAction: "destroy",
          location: a,
          html: b.apply(a.attributes)
        }), this.target.selectControl.popup.show()
      },
      featureunselected: function() {
        this.target.selectControl && this.target.selectControl.popup && this.target.selectControl.popup.close()
      },
      scope: this
    })
  },
  getStyleMap: function(a) {
    return new OpenLayers.StyleMap({
      "default": new OpenLayers.Style("defaultStyle" in a ? a.defaultStyle : {
        graphicName: "circle",
        pointRadius: 5,
        fillOpacity: 0.7,
        fillColor: "Red"
      }, {
        title: a.name
      }),
      select: new OpenLayers.Style("selectStyle" in a ? a.selectStyle : {
        graphicName: "circle",
        pointRadius: 10,
        fillOpacity: 1,
        fillColor: "Yellow"
      })
    })
  }
});
Ext.preg(gxp.plugins.FeedSource.prototype.ptype, gxp.plugins.FeedSource);
Ext.namespace("gxp.plugins");
gxp.plugins.PicasaFeedSource = Ext.extend(gxp.plugins.FeedSource, {
  ptype: "gxp_picasasource",
  url: "http://picasaweb.google.com/data/feed/base/all?thumbsize=160c&",
  format: "OpenLayers.Format.Picasa",
  title: "Picasa Photos",
  pointRadius: 14,
  popupTemplate: '<tpl for="."><a target="_blank" href="{link}"><img  title="{title}" src="{thumbnail}"/></a></tpl>',
  fixed: !1,
  createLayerRecord: function(a) {
    Ext.isEmpty(a.params["max-results"]) && (a.params["max-results"] = 50);
    a.url = this.url;
    this.format = new OpenLayers.Format.GeoRSS({
      createFeatureFromItem: function(a) {
        var b =
        OpenLayers.Format.GeoRSS.prototype.createFeatureFromItem.apply(this, arguments);
        b.attributes.thumbnail = this.getElementsByTagNameNS(a, "http://search.yahoo.com/mrss/", "thumbnail")[0].getAttribute("url");
        b.attributes.content = OpenLayers.Util.getXmlNodeValue(this.getElementsByTagNameNS(a, "*", "summary")[0]);
        return b
      }
    });
    var b = gxp.plugins.PicasaFeedSource.superclass.createLayerRecord.apply(this, arguments);
    b.getLayer().protocol.filterToParams = function(a, b) {
      if (a.type === OpenLayers.Filter.Spatial.BBOX) {
        var e =
        a.value.toArray();
        b.bbox = [Math.max(-180, e[0]), Math.max(-90, e[1]), Math.min(180, e[2]), Math.min(90, e[3])]
      }
      return b
    };
    return b
  },
  configureInfoPopup: function(a) {
    var b = new Ext.XTemplate(this.popupTemplate);
    a.events.on({
      featureselected: function(a) {
        a = a.feature;
        null != this.target.selectControl.popup && this.target.selectControl.popup.close();
        var d = document.createElement("div");
        d.innerHTML = a.attributes.content;
        d = {
          link: d.getElementsByTagName("a")[0].getAttribute("href"),
          title: a.attributes.title,
          thumbnail: a.attributes.thumbnail
        };
        this.target.selectControl.popup = new GeoExt.Popup({
          title: a.attributes.title,
          closeAction: "destroy",
          location: a,
          width: 175,
          height: 200,
          html: b.apply(d)
        });
        this.target.selectControl.popup.show()
      },
      featureunselected: function() {
        this.target.selectControl && this.target.selectControl.popup && this.target.selectControl.popup.close()
      },
      scope: this
    })
  },
  getStyleMap: function() {
    return new OpenLayers.StyleMap({
      "default": new OpenLayers.Style({
        externalGraphic: "${thumbnail}",
        pointRadius: this.pointRadius
      }, {
        title: this.title
      }),
      select: new OpenLayers.Style({
        pointRadius: this.pointRadius + 5
      })
    })
  }
});
Ext.preg(gxp.plugins.PicasaFeedSource.prototype.ptype, gxp.plugins.PicasaFeedSource);
Ext.namespace("gxp.plugins");
gxp.plugins.YouTubeFeedSource = Ext.extend(gxp.plugins.FeedSource, {
  ptype: "gxp_youtubesource",
  url: "http://gdata.youtube.com/feeds/api/videos?v=2&prettyprint=true&",
  format: "OpenLayers.Format.YouTube",
  title: "Youtube Videos",
  pointRadius: 24,
  popupTemplate: '<tpl for="."><a target="_blank" href="{link}"><img height="180"  width="240" title="{title}" src="{thumbnail}"/></a></tpl>',
  fixed: !1,
  createLayerRecord: function(a) {
    a.params["max-results"] = Ext.isEmpty(a.params["max-results"]) ? 50 : Math.min(a.params["max-results"], 50);
    a.url = this.url;
    this.format = new OpenLayers.Format.GeoRSS({
      createFeatureFromItem: function(a) {
        var b = OpenLayers.Format.GeoRSS.prototype.createFeatureFromItem.apply(this, arguments);
        b.attributes.thumbnail = this.getElementsByTagNameNS(a, "http://search.yahoo.com/mrss/", "thumbnail")[4].getAttribute("url");
        b.attributes.content = OpenLayers.Util.getXmlNodeValue(this.getElementsByTagNameNS(a, "*", "summary")[0]);
        return b
      }
    });
    var b = gxp.plugins.YouTubeFeedSource.superclass.createLayerRecord.apply(this, arguments);
    b.getLayer().protocol.filterToParams = function(a, b) {
      if (a.type === OpenLayers.Filter.Spatial.BBOX) {
        var e = a.value,
            f = e.getCenterLonLat(),
            e = Math.min(2 * ((6378.137 * e.right / 180 / 3.1415926 - 6378.137 * e.left / 180 / 3.1415926) / 2), 1E3);
        Ext.apply(b, {
          location: "" + f.lat + "," + f.lon,
          "location-radius": e + "km"
        })
      }
      return b
    };
    return b
  },
  configureInfoPopup: function(a) {
    var b = new Ext.XTemplate(this.popupTemplate);
    a.events.on({
      featureselected: function(a) {
        a = a.feature;
        null != this.target.selectControl.popup && this.target.selectControl.popup.close();
        this.target.selectControl.popup = new GeoExt.Popup({
          title: a.attributes.title,
          location: a,
          width: 240,
          height: 220,
          closeAction: "destroy",
          html: b.apply(a.attributes)
        });
        this.target.selectControl.popup.show()
      },
      featureunselected: function() {
        this.target.selectControl && this.target.selectControl.popup && this.target.selectControl.popup.close()
      },
      scope: this
    })
  },
  getStyleMap: function() {
    return new OpenLayers.StyleMap({
      "default": new OpenLayers.Style({
        externalGraphic: "${thumbnail}",
        pointRadius: 24
      }, {
        title: this.title
      }),
      select: new OpenLayers.Style({
        pointRadius: this.pointRadius + 5
      })
    })
  }
});
Ext.preg(gxp.plugins.YouTubeFeedSource.prototype.ptype, gxp.plugins.YouTubeFeedSource);
Ext.namespace("gxp");
gxp.PointSymbolizer = Ext.extend(Ext.Panel, {
  symbolizer: null,
  graphicCircleText: "Circle",
  graphicSquareText: "Square",
  graphicTriangleText: "Triangle",
  graphicStarText: "Star",
  graphicCrossText: "Cross",
  graphicXText: "X",
  graphicExternalText: "External",
  urlText: "URL",
  opacityText: "opacity",
  symbolText: "Symbol",
  sizeText: "Size",
  rotationText: "Rotation",
  pointGraphics: null,
  colorManager: null,
  external: null,
  layout: "form",
  initComponent: function() {
    if (!this.symbolizer) this.symbolizer = {};
    this.symbolizer.graphicName || (this.symbolizer.graphicName = "circle");
    this.symbolizer.rotation || (this.symbolizer.rotation = 0);
    if (!this.pointGraphics) this.pointGraphics = [{
      display: this.graphicCircleText,
      value: "circle",
      mark: !0
    }, {
      display: this.graphicSquareText,
      value: "square",
      mark: !0
    }, {
      display: this.graphicTriangleText,
      value: "triangle",
      mark: !0
    }, {
      display: this.graphicStarText,
      value: "star",
      mark: !0
    }, {
      display: this.graphicCrossText,
      value: "cross",
      mark: !0
    }, {
      display: this.graphicXText,
      value: "x",
      mark: !0
    }, {
      display: this.graphicExternalText
    }];
    this.external = !! this.symbolizer.externalGraphic;
    this.markPanel = new Ext.Panel({
      border: !1,
      collapsed: this.external,
      layout: "form",
      items: [{
        xtype: "gxp_fillsymbolizer",
        symbolizer: this.symbolizer,
        labelWidth: this.labelWidth,
        labelAlign: this.labelAlign,
        colorManager: this.colorManager,
        listeners: {
          change: function() {
            this.fireEvent("change", this.symbolizer)
          },
          scope: this
        }
      }, {
        xtype: "gxp_strokesymbolizer",
        symbolizer: this.symbolizer,
        labelWidth: this.labelWidth,
        labelAlign: this.labelAlign,
        colorManager: this.colorManager,
        listeners: {
          change: function() {
            this.fireEvent("change", this.symbolizer)
          },
          scope: this
        }
      }]
    });
    this.urlField = new Ext.form.TextField({
      name: "url",
      fieldLabel: this.urlText,
      value: this.symbolizer.externalGraphic,
      hidden: !this.external,
      listeners: {
        change: function(a, b) {
          this.symbolizer.externalGraphic = b;
          this.fireEvent("change", this.symbolizer)
        },
        scope: this
      },
      width: 100
    });
    this.graphicPanel = new Ext.Panel({
      border: !1,
      collapsed: !this.external,
      layout: "form",
      items: [this.urlField,
      {
        xtype: "slider",
        name: "opacity",
        fieldLabel: this.opacityText,
        value: [null == this.symbolizer.graphicOpacity ? 100 : 100 * this.symbolizer.graphicOpacity],
        isFormField: !0,
        listeners: {
          changecomplete: function(a, b) {
            this.symbolizer.graphicOpacity = b / 100;
            this.fireEvent("change", this.symbolizer)
          },
          scope: this
        },
        plugins: [new GeoExt.SliderTip({
          getText: function(a) {
            return a.value + "%"
          }
        })],
        width: 100
      }]
    });
    this.items = [{
      xtype: "combo",
      name: "mark",
      fieldLabel: this.symbolText,
      store: new Ext.data.JsonStore({
        data: {
          root: this.pointGraphics
        },
        root: "root",
        fields: ["value", "display", "preview",
        {
          name: "mark",
          type: "boolean"
        }]
      }),
      value: this.external ? 0 : this.symbolizer.graphicName,
      displayField: "display",
      valueField: "value",
      tpl: new Ext.XTemplate('<tpl for="."><div class="x-combo-list-item gx-pointsymbolizer-mark-item"><tpl if="preview"><img src="{preview}" alt="{display}"/></tpl><span>{display}</span></div></tpl>'),
      mode: "local",
      allowBlank: !1,
      triggerAction: "all",
      editable: !1,
      listeners: {
        select: function(a, b) {
          var c = b.get("mark"),
              d = b.get("value");
          if (c) {
            if (this.external) this.external = !1, delete this.symbolizer.externalGraphic, this.updateGraphicDisplay();
            this.symbolizer.graphicName = d
          } else if (d ? (this.urlField.hide(), this.symbolizer.externalGraphic = d) : this.urlField.show(), !this.external) this.external = !0, c = this.urlField.getValue(), Ext.isEmpty(c) || (this.symbolizer.externalGraphic = c), delete this.symbolizer.graphicName, this.updateGraphicDisplay();
          this.fireEvent("change", this.symbolizer)
        },
        scope: this
      },
      width: 100
    }, {
      xtype: "textfield",
      name: "size",
      fieldLabel: this.sizeText,
      value: this.symbolizer.pointRadius && 2 * this.symbolizer.pointRadius,
      listeners: {
        change: function(a, b) {
          this.symbolizer.pointRadius = b / 2;
          this.fireEvent("change", this.symbolizer)
        },
        scope: this
      },
      width: 100
    }, {
      xtype: "textfield",
      name: "rotation",
      fieldLabel: this.rotationText,
      value: this.symbolizer.rotation,
      listeners: {
        change: function(a, b) {
          this.symbolizer.rotation = b;
          this.fireEvent("change", this.symbolizer)
        },
        scope: this
      },
      width: 100
    },
    this.markPanel, this.graphicPanel];
    this.addEvents("change");
    gxp.PointSymbolizer.superclass.initComponent.call(this)
  },
  updateGraphicDisplay: function() {
    this.external ? (this.markPanel.collapse(), this.graphicPanel.expand()) : (this.graphicPanel.collapse(), this.markPanel.expand())
  }
});
Ext.reg("gxp_pointsymbolizer", gxp.PointSymbolizer);
Ext.namespace("gxp");
gxp.FeedSourceDialog = Ext.extend(Ext.Container, {
  feedTypeText: "Source",
  addPicasaText: "Picasa Photos",
  addYouTubeText: "YouTube Videos",
  addRSSText: "GeoRSS Feed",
  addFeedText: "Add to Map",
  addTitleText: "Title",
  keywordText: "Keyword",
  doneText: "Done",
  titleText: "Add Feeds",
  maxResultsText: "Max Items",
  width: 300,
  autoHeight: !0,
  closeAction: "destroy",
  initComponent: function() {
    this.addEvents("addfeed");
    if (!this.feedTypes) this.feedTypes = [
      [gxp.plugins.PicasaFeedSource.ptype, this.addPicasaText],
      [gxp.plugins.YouTubeFeedSource.ptype, this.addYouTubeText],
      [gxp.plugins.FeedSource.ptype, this.addRSSText]
    ];
    var a = new Ext.data.ArrayStore({
      fields: ["type", "name"],
      data: this.feedTypes
    }),
        b = new Ext.form.ComboBox({
        store: a,
        fieldLabel: this.feedTypeText,
        displayField: "name",
        valueField: "type",
        typeAhead: !0,
        width: 180,
        mode: "local",
        triggerAction: "all",
        emptyText: "Select a feed source...",
        selectOnFocus: !0,
        listeners: {
          select: function(a) {
            a.value == gxp.plugins.FeedSource.ptype ? (c.show(), d.hide(), f.hide(), g.show()) : (c.hide(), d.show(), f.show(), g.hide());
            h.setDisabled(null == a.value)
          },
          scope: this
        }
      }),
        c = new Ext.form.TextField({
        fieldLabel: "URL",
        allowBlank: !1,
        width: 180,
        msgTarget: "right",
        validator: this.urlValidator.createDelegate(this)
      }),
        d = new Ext.form.TextField({
        fieldLabel: this.keywordText,
        allowBlank: !0,
        hidden: !0,
        width: 180,
        msgTarget: "right"
      }),
        e = new Ext.form.TextField({
        fieldLabel: this.addTitleText,
        allowBlank: !0,
        width: 180,
        msgTarget: "right"
      }),
        f = new Ext.form.ComboBox({
        fieldLabel: this.maxResultsText,
        hidden: !0,
        hiddenName: "max-results",
        store: new Ext.data.ArrayStore({
          fields: ["max-results"],
          data: [
            [10],
            [25],
            [50],
            [100]
          ]
        }),
        displayField: "max-results",
        mode: "local",
        triggerAction: "all",
        emptyText: "Choose number...",
        labelWidth: 70,
        width: 180,
        defaults: {
          labelWidth: 70,
          width: 180
        }
      }),
        g = new gxp.PointSymbolizer({
        bodyStyle: {
          padding: "10px"
        },
        width: 280,
        border: !1,
        hidden: !0,
        labelWidth: 70,
        defaults: {
          labelWidth: 70
        },
        symbolizer: {
          pointGraphics: "circle",
          pointRadius: "5"
        }
      });
    g.find("name", "rotation")[0].hidden = !0;
    if ("Point" === this.symbolType && this.pointGraphics) cfg.pointGraphics = this.pointGraphics;
    var h = new Ext.Button({
      text: this.addFeedText,
      iconCls: "gxp-icon-addlayers",
      disabled: !0,
      handler: function() {
        var a = b.getValue(),
            h = {
            name: e.getValue()
            };
        if ("gxp_feedsource" != a) h.params = {
          q: d.getValue(),
          "max-results": f.getValue()
        };
        else {
          h.url = c.getValue();
          var l = g.symbolizer;
          h.defaultStyle = {};
          h.selectStyle = {};
          Ext.apply(h.defaultStyle, l);
          Ext.apply(h.selectStyle, l);
          Ext.apply(h.selectStyle, {
            fillColor: "Yellow",
            pointRadius: parseInt(l.pointRadius) + 2
          })
        }
        this.fireEvent("addfeed", a, h)
      },
      scope: this
    }),
        a = ["->", h, new Ext.Button({
        text: this.doneText,
        handler: function() {
          this.hide()
        },
        scope: this
      })];
    this.items = this.panel = new Ext.Panel({
      bbar: a,
      autoScroll: !0,
      items: [b, e, c, d, f, g],
      layout: "form",
      border: !1,
      labelWidth: 100,
      bodyStyle: "padding: 5px",
      autoWidth: !0,
      autoHeight: !0
    });
    gxp.FeedSourceDialog.superclass.initComponent.call(this)
  },
  urlRegExp: /^(http(s)?:)?\/\/([\w%]+:[\w%]+@)?([^@\/:]+)(:\d+)?\//i,
  urlValidator: function(a) {
    a = this.urlRegExp.test(a) ? !this.error || this.error : this.invalidURLText;
    this.error = null;
    return a
  }
});
Ext.reg("gxp_feedsourcedialog", gxp.FeedSourceDialog);
Ext.namespace("gxp");
gxp.util = {
  _uniqueNames: {},
  getOGCExceptionText: function(a) {
    var b;
    a && a.exceptions ? (b = [], Ext.each(a.exceptions, function(a) {
      Ext.each(a.texts, function(a) {
        b.push(a)
      })
    }), b = b.join("\n")) : b = "Unknown error (no exception report).";
    return b
  },
  dispatch: function(a, b, c) {
    function d() {
      ++g;
      g === f && b.call(c, h)
    }
    function e(b) {
      window.setTimeout(function() {
        a[b].apply(c, [d, h])
      })
    }
    for (var b = b || Ext.emptyFn, c = c || this, f = a.length, g = 0, h = {}, j = 0; j < f; ++j) e(j)
  },
  uniqueName: function(a, b) {
    var b = b || " ",
        c = RegExp(b + "[0-9]*$"),
        d = a.replace(c, ""),
        c = c.exec(a),
        c = void 0 !== this._uniqueNames[d] ? this._uniqueNames[d] : c instanceof Array ? Number(c[0]) : void 0,
        e = d;
    void 0 !== c && (c++, e += b + c);
    this._uniqueNames[d] = c || 0;
    return e
  },
  getAbsoluteUrl: function(a) {
    var b;
    Ext.isIE6 || Ext.isIE7 || Ext.isIE8 ? (b = document.createElement("<a href='" + a + "'/>"), b.style.display = "none", document.body.appendChild(b), b.href = b.href, document.body.removeChild(b)) : (b = document.createElement("a"), b.href = a);
    return b.href
  },
  throttle: function() {
    var a = function(a, c, d) {
      var e, f, g, h, j = function() {
        a.apply(d || this, g);
        e = (new Date).getTime()
      };
      return function() {
        f = (new Date).getTime() - e;
        g = arguments;
        clearTimeout(h);
        !e || f >= c ? j() : h = setTimeout(j, c - f)
      }
    };
    return function(b, c, d) {
      return a(b, c, d)
    }
  }(),
  md5: function() {
    function a(a) {
      return String.fromCharCode(a & 255) + String.fromCharCode(a >>> 8 & 255) + String.fromCharCode(a >>> 16 & 255) + String.fromCharCode(a >>> 24 & 255)
    }
    function b(a) {
      for (; 0 > a;) a += 4294967296;
      for (; 4294967295 < a;) a -= 4294967296;
      return a
    }
    var c = [0, 3614090360, 3905402710, 606105819, 3250441966, 4118548399, 1200080426, 2821735955, 4249261313, 1770035416, 2336552879, 4294925233, 2304563134, 1804603682, 4254626195, 2792965006, 1236535329, 4129170786, 3225465664, 643717713, 3921069994, 3593408605, 38016083, 3634488961, 3889429448, 568446438, 3275163606, 4107603335, 1163531501, 2850285829, 4243563512, 1735328473, 2368359562, 4294588738, 2272392833, 1839030562, 4259657740, 2763975236, 1272893353, 4139469664, 3200236656, 681279174, 3936430074, 3572445317, 76029189, 3654602809, 3873151461, 530742520, 3299628645, 4096336452, 1126891415, 2878612391, 4237533241, 1700485571, 2399980690, 4293915773, 2240044497, 1873313359, 4264355552, 2734768916, 1309151649, 4149444226, 3174756917, 718787259, 3951481745],
        d = [
        [function(a, b, c) {
          return a & b | ~a & c
        }, [
          [0, 7, 1],
          [1, 12, 2],
          [2, 17, 3],
          [3, 22, 4],
          [4, 7, 5],
          [5, 12, 6],
          [6, 17, 7],
          [7, 22, 8],
          [8, 7, 9],
          [9, 12, 10],
          [10, 17, 11],
          [11, 22, 12],
          [12, 7, 13],
          [13, 12, 14],
          [14, 17, 15],
          [15, 22, 16]
        ]],
        [function(a, b, c) {
          return a & c | b & ~c
        }, [
          [1, 5, 17],
          [6, 9, 18],
          [11, 14, 19],
          [0, 20, 20],
          [5, 5, 21],
          [10, 9, 22],
          [15, 14, 23],
          [4, 20, 24],
          [9, 5, 25],
          [14, 9, 26],
          [3, 14, 27],
          [8, 20, 28],
          [13, 5, 29],
          [2, 9, 30],
          [7, 14, 31],
          [12, 20, 32]
        ]],
        [function(a, b, c) {
          return a ^ b ^ c
        }, [
          [5, 4, 33],
          [8, 11, 34],
          [11, 16, 35],
          [14, 23, 36],
          [1, 4, 37],
          [4, 11, 38],
          [7, 16, 39],
          [10, 23, 40],
          [13, 4, 41],
          [0, 11, 42],
          [3, 16, 43],
          [6, 23, 44],
          [9, 4, 45],
          [12, 11, 46],
          [15, 16, 47],
          [2, 23, 48]
        ]],
        [function(a, b, c) {
          return b ^ (a | ~c)
        }, [
          [0, 6, 49],
          [7, 10, 50],
          [14, 15, 51],
          [5, 21, 52],
          [12, 6, 53],
          [3, 10, 54],
          [10, 15, 55],
          [1, 21, 56],
          [8, 6, 57],
          [15, 10, 58],
          [6, 15, 59],
          [13, 21, 60],
          [4, 6, 61],
          [11, 10, 62],
          [2, 15, 63],
          [9, 21, 64]
        ]]
        ];
    return function(e) {
      var f, g, h, j, k, l, n, m, r, o, q;
      f = [1732584193, 4023233417, 2562383102, 271733878];
      g = e.length;
      h = g & 63;
      j = 56 > h ? 56 - h : 120 - h;
      if (0 < j) {
        e += "\u0080";
        for (h = 0; h < j - 1; h++) e += "\x00"
      }
      e += a(8 * g);
      e += a(0);
      g += j + 8;
      j = [0, 1, 2, 3];
      k = [16];
      l = [4];
      for (o = 0; o < g; o += 64) {
        for (h = 0, r = o; 16 > h; h++, r += 4) k[h] = e.charCodeAt(r) | e.charCodeAt(r + 1) << 8 | e.charCodeAt(r + 2) << 16 | e.charCodeAt(r + 3) << 24;
        for (h = 0; 4 > h; h++) l[h] = f[h];
        for (h = 0; 4 > h; h++) {
          n = d[h][0];
          m = d[h][1];
          for (r = 0; 16 > r; r++) {
            q = k;
            var s = l,
                u = m[r],
                w = void 0,
                x = void 0,
                v = void 0,
                z = void 0,
                t = void 0,
                y = void 0,
                A = void 0,
                v = t = void 0,
                w = j[0],
                x = j[1],
                v = j[2],
                z = j[3],
                t = u[0],
                y = u[1],
                A = u[2],
                v = n(s[x], s[v], s[z]),
                t = s[w] + v + q[t] + c[A],
                t = b(t),
                t = t << y | t >>> 32 - y,
                t = t + s[x];
            s[w] = b(t);
            q = j[0];
            j[0] = j[3];
            j[3] = j[2];
            j[2] = j[1];
            j[1] = q
          }
        }
        for (h = 0; 4 > h; h++) f[h] += l[h], f[h] = b(f[h])
      }
      h = a(f[0]) + a(f[1]) + a(f[2]) + a(f[3]);
      f = "";
      for (e = 0; 16 > e; e++) g = h.charCodeAt(e), f += "0123456789abcdef".charAt(g >> 4 & 15), f += "0123456789abcdef".charAt(g & 15);
      return f
    }
  }()
};
(function() {
  function a(a) {
    var c = this.meta.format;
    if ("string" === typeof a || a.nodeType) {
      var a = c.read(a),
          d = c.read;
      c.read = function() {
        c.read = d;
        return a
      }
    }
    this.raw = a
  }
  Ext.intercept(GeoExt.data.WMSCapabilitiesReader.prototype, "readRecords", a);
  GeoExt.data.AttributeReader && Ext.intercept(GeoExt.data.AttributeReader.prototype, "readRecords", a)
})();
Ext.namespace("gxp.plugins");
gxp.plugins.WMSSource = Ext.extend(gxp.plugins.LayerSource, {
  ptype: "gxp_wmssource",
  baseParams: null,
  format: null,
  describeLayerStore: null,
  describedLayers: null,
  schemaCache: null,
  ready: !1,
  requiredProperties: ["title", "bbox"],
  constructor: function(a) {
    if (a && !0 === a.forceLazy) a.requiredProperties = [], delete a.forceLazy, window.console && console.warn("Deprecated config option 'forceLazy: true' for layer source '" + a.id + "'. Use 'requiredProperties: []' instead.");
    gxp.plugins.WMSSource.superclass.constructor.apply(this, arguments);
    if (!this.format) this.format = new OpenLayers.Format.WMSCapabilities({
      keepData: !0
    })
  },
  init: function(a) {
    gxp.plugins.WMSSource.superclass.init.apply(this, arguments);
    this.target.on("authorizationchange", this.onAuthorizationChange, this)
  },
  onAuthorizationChange: function() {
    if (this.store && "/" === this.url.charAt(0)) {
      var a = this.store.lastOptions || {
        params: {}
      };
      Ext.apply(a.params, {
        _dc: Math.random()
      });
      this.store.reload(a)
    }
  },
  destroy: function() {
    this.target.un("authorizationchange", this.onAuthorizationChange, this);
    gxp.plugins.WMSSource.superclass.destroy.apply(this, arguments)
  },
  isLazy: function() {
    var a = !0,
        b = this.target.initialConfig.map;
    if (b && b.layers) for (var c, d = 0, e = b.layers.length; d < e && !(c = b.layers[d], c.source === this.id && (a = this.layerConfigComplete(c), !1 === a)); ++d);
    return a
  },
  layerConfigComplete: function(a) {
    var b = !0;
    if (!Ext.isObject(a.capability)) for (var c = this.requiredProperties, d = c.length - 1; 0 <= d && !(b = !! a[c[d]], !1 === b); --d);
    return b
  },
  createStore: function() {
    var a = this.baseParams || {
      SERVICE: "WMS",
      REQUEST: "GetCapabilities"
    };
    if (this.version) a.VERSION = this.version;
    var b = this.isLazy();
    this.store = new GeoExt.data.WMSCapabilitiesStore({
      url: this.trimUrl(this.url, a),
      baseParams: a,
      format: this.format,
      autoLoad: !b,
      layerParams: {
        exceptions: null
      },
      listeners: {
        load: function() {
          if (!this.store.reader.raw || !this.store.reader.raw.service) this.fireEvent("failure", this, "Invalid capabilities document.");
          else {
            if (!this.title) this.title = this.store.reader.raw.service.title;
            this.ready ? this.lazy = !1 : (this.ready = !0, this.fireEvent("ready", this))
          }
          delete this.format.data
        },
        exception: function(a, b, e, f, g, h) {
          delete this.store;
          a = "";
          "response" === b ? "string" == typeof h ? b = h : (b = "Invalid response from server.", (a = this.format && this.format.data) && a.parseError && (b += "  " + a.parseError.reason + " - line: " + a.parseError.line), g = g.status, a = 200 <= g && 300 > g ? gxp.util.getOGCExceptionText(h && h.arg && h.arg.exceptionReport) : "Status: " + g) : (b = "Trouble creating layer store from response.", a = "Unable to handle response.");
          this.fireEvent("failure", this, b, a);
          delete this.format.data
        },
        scope: this
      }
    });
    if (b) this.lazy =
    b, this.ready = !0, this.fireEvent("ready", this)
  },
  trimUrl: function(a, b) {
    var c = OpenLayers.Util.getParameters(a),
        b = OpenLayers.Util.upperCaseObject(b),
        d = 0,
        e;
    for (e in c)++d, e.toUpperCase() in b && (--d, delete c[e]);
    return a.split("?").shift() + (d ? "?" + OpenLayers.Util.getParameterString(c) : "")
  },
  createLazyLayerRecord: function(a) {
    var a = Ext.apply({}, a),
        b = a.srs || this.target.map.projection;
    a.srs = {};
    a.srs[b] = !0;
    var c = a.bbox || this.target.map.maxExtent || OpenLayers.Projection.defaults[b].maxExtent;
    a.bbox = {};
    a.bbox[b] = {
      bbox: c
    };
    c = this.store && this.store instanceof GeoExt.data.WMSCapabilitiesStore ? new this.store.recordType(a) : new GeoExt.data.LayerRecord(a);
    c.setLayer(new OpenLayers.Layer.WMS(a.title || a.name, a.url || this.url, {
      layers: a.name,
      transparent: "transparent" in a ? a.transparent : !0,
      cql_filter: a.cql_filter,
      format: a.format
    }, {
      projection: b,
      eventListeners: {
        tileloaded: this.countAlive,
        tileerror: this.countAlive,
        scope: this
      }
    }));
    c.json = a;
    return c
  },
  countAlive: function(a) {
    if (!("_alive" in a.object.metadata)) a.object.metadata._alive = 0, a.object.events.register("loadend", this, this.removeDeadLayer);
    a.object.metadata._alive += "tileerror" == a.type ? -1 : 1
  },
  removeDeadLayer: function(a) {
    a.object.events.un({
      tileloaded: this.countAlive,
      tileerror: this.countAlive,
      loadend: this.removeDeadLayer,
      scope: this
    });
    0 === a.object.metadata._alive && (this.target.mapPanel.map.removeLayer(a.object), window.console && console.debug("Unavailable layer " + a.object.name + " removed."));
    delete a.object.metadata._alive
  },
  createLayerRecord: function(a) {
    var b, c, d = this.store.findExact("name", a.name); - 1 < d ? c = this.store.getAt(d) : Ext.isObject(a.capability) ? c = this.store.reader.readRecords({
      capability: {
        request: {
          getmap: {
            href: this.trimUrl(this.url, this.baseParams)
          }
        },
        layers: [a.capability]
      }
    }).records[0] : this.layerConfigComplete(a) && (c = this.createLazyLayerRecord(a));
    if (c) {
      b = c.getLayer().clone();
      var d = this.getMapProjection(),
          e = this.getProjection(c);
      e && b.addOptions({
        projection: e
      });
      var e = (e || d).getCode(),
          f = c.get("bbox"),
          g;
      if (f && f[e]) g = OpenLayers.Bounds.fromArray(f[e].bbox, b.reverseAxisOrder());
      else if (e =
      c.get("llbbox")) e[0] = Math.max(e[0], -180), e[1] = Math.max(e[1], -90), e[2] = Math.min(e[2], 180), e[3] = Math.min(e[3], 90), g = OpenLayers.Bounds.fromArray(e).transform("EPSG:4326", d);
      b.mergeNewParams({
        STYLES: a.styles,
        FORMAT: a.format,
        TRANSPARENT: a.transparent,
        CQL_FILTER: a.cql_filter
      });
      d = !1;
      "tiled" in a ? d = !a.tiled : c.data.dimensions && c.data.dimensions.time && (d = !0);
      b.setName(a.title || b.name);
      b.addOptions({
        attribution: b.attribution || a.attribution,
        maxExtent: g,
        restrictedExtent: g,
        singleTile: d,
        ratio: a.ratio || 1,
        visibility: "visibility" in a ? a.visibility : !0,
        opacity: "opacity" in a ? a.opacity : 1,
        buffer: "buffer" in a ? a.buffer : 1,
        dimensions: c.data.dimensions,
        transitionEffect: d ? "resize" : null,
        minScale: a.minscale,
        maxScale: a.maxscale
      });
      g = Ext.applyIf({
        title: b.name,
        group: a.group,
        infoFormat: a.infoFormat,
        getFeatureInfo: a.getFeatureInfo,
        source: a.source,
        properties: "gxp_wmslayerpanel",
        fixed: a.fixed,
        selected: "selected" in a ? a.selected : !1,
        restUrl: this.restUrl,
        layer: b
      }, c.data);
      var h = [{
        name: "source",
        type: "string"
      }, {
        name: "group",
        type: "string"
      }, {
        name: "properties",
        type: "string"
      }, {
        name: "fixed",
        type: "boolean"
      }, {
        name: "selected",
        type: "boolean"
      }, {
        name: "restUrl",
        type: "string"
      }, {
        name: "infoFormat",
        type: "string"
      }, {
        name: "getFeatureInfo"
      }];
      c.fields.each(function(a) {
        h.push(a)
      });
      b = new(GeoExt.data.LayerRecord.create(h))(g, b.id);
      b.json = a
    } else window.console && 0 < this.store.getCount() && void 0 !== a.name && console.warn("Could not create layer record for layer '" + a.name + "'. Check if the layer is found in the WMS GetCapabilities response.");
    return b
  },
  getProjection: function(a) {
    var b =
    this.getMapProjection(),
        c = b,
        a = a.get("srs");
    if (!a[b.getCode()]) {
      var c = null,
          d, e;
      for (e in a) if ((d = new OpenLayers.Projection(e)).equals(b)) {
        c = d;
        break
      }
    }
    return c
  },
  initDescribeLayerStore: function() {
    var a = this.store.reader.raw;
    this.lazy && (a = {
      capability: {
        request: {
          describelayer: {
            href: this.url
          }
        }
      },
      version: this.version || "1.1.1"
    });
    var b = a.capability.request.describelayer;
    if (b) a = a.version, 1.1 < parseFloat(a) && (a = "1.1.1"), a = {
      SERVICE: "WMS",
      VERSION: a,
      REQUEST: "DescribeLayer"
    }, this.describeLayerStore = new GeoExt.data.WMSDescribeLayerStore({
      url: this.trimUrl(b.href, a),
      baseParams: a
    })
  },
  describeLayer: function(a, b, c) {
    function d(a) {
      window.setTimeout(function() {
        b.call(c, a)
      }, 0)
    }
    this.describeLayerStore || this.initDescribeLayerStore();
    if (this.describeLayerStore) {
      if (!this.describedLayers) this.describedLayers = {};
      var e = a.getLayer().params.LAYERS,
          a = function() {
          for (var a = Ext.isArray(arguments[1]) ? arguments[1] : arguments[0], d, g, l = a.length - 1; 0 <= l; l--) {
            d = a[l];
            g = d.get("layerName");
            if (g == e) {
              this.describeLayerStore.un("load", arguments.callee, this);
              this.describedLayers[g] = !0;
              b.call(c, d);
              return
            }
            "function" == typeof this.describedLayers[g] && (d = this.describedLayers[g], this.describeLayerStore.un("load", d, this), d.apply(this, arguments))
          }
          delete f[e];
          b.call(c, !1)
          },
          f = this.describedLayers,
          g;
      if (f[e]) if (-1 == (g = this.describeLayerStore.findExact("layerName", e))) this.describeLayerStore.on("load", a, this);
      else d(this.describeLayerStore.getAt(g));
      else f[e] = a, this.describeLayerStore.load({
        params: {
          LAYERS: e
        },
        add: !0,
        callback: a,
        scope: this
      })
    } else d(!1)
  },
  fetchSchema: function(a, b, c, d) {
    var e = this.schemaCache[b];
    if (e) if (0 == e.getCount()) e.on("load", function() {
      c.call(d, e)
    }, this, {
      single: !0
    });
    else c.call(d, e);
    else e = new GeoExt.data.AttributeStore({
      url: a,
      baseParams: {
        SERVICE: "WFS",
        VERSION: "1.1.0",
        REQUEST: "DescribeFeatureType",
        TYPENAME: b
      },
      autoLoad: !0,
      listeners: {
        load: function() {
          c.call(d, e)
        },
        scope: this
      }
    }), this.schemaCache[b] = e
  },
  getSchema: function(a, b, c) {
    if (!this.schemaCache) this.schemaCache = {};
    this.describeLayer(a, function(d) {
      if (d && "WFS" == d.get("owsType")) {
        var e = d.get("typeName");
        this.fetchSchema(d.get("owsURL"), e, b, c)
      } else d ? b.call(c, !1) : this.fetchSchema(this.url, a.get("name"), b, c)
    }, this)
  },
  getWFSProtocol: function(a, b, c) {
    this.getSchema(a, function(d) {
      var e = !1;
      if (d) {
        var f, g = /gml:((Multi)?(Point|Line|Polygon|Curve|Surface|Geometry)).*/;
        d.each(function(a) {
          g.exec(a.get("type")) && (f = a.get("name"))
        }, this);
        e = new OpenLayers.Protocol.WFS({
          version: "1.1.0",
          srsName: a.getLayer().projection.getCode(),
          url: d.url,
          featureType: d.reader.raw.featureTypes[0].typeName,
          featureNS: d.reader.raw.targetNamespace,
          geometryName: f
        })
      }
      b.call(c, e, d, a)
    }, this)
  },
  getConfigForRecord: function(a) {
    var b = Ext.applyIf(gxp.plugins.WMSSource.superclass.getConfigForRecord.apply(this, arguments), a.json),
        c = a.getLayer(),
        d = c.params,
        e = c.options,
        f = b.name,
        g = this.store.reader.raw;
    if (g) for (var g = g.capability.layers, h = g.length - 1; 0 <= h; --h) if (g[h].name === f) {
      b.capability = Ext.apply({}, g[h]);
      f = {};
      f[c.projection.getCode()] = !0;
      b.capability.srs = f;
      break
    }
    if (!b.capability) {
      if (c.maxExtent) b.bbox = c.maxExtent.toArray();
      b.srs = c.projection.getCode()
    }
    return Ext.apply(b, {
      format: d.FORMAT,
      styles: d.STYLES,
      tiled: !e.singleTile,
      transparent: d.TRANSPARENT,
      cql_filter: d.CQL_FILTER,
      minscale: e.minScale,
      maxscale: e.maxScale,
      infoFormat: a.get("infoFormat"),
      attribution: c.attribution
    })
  },
  getState: function() {
    var a = gxp.plugins.WMSSource.superclass.getState.apply(this, arguments);
    return Ext.applyIf(a, {
      title: this.title
    })
  }
});
Ext.preg(gxp.plugins.WMSSource.prototype.ptype, gxp.plugins.WMSSource);
Ext.namespace("gxp.plugins");
gxp.plugins.CatalogueSource = Ext.extend(gxp.plugins.WMSSource, {
  url: null,
  yx: null,
  title: null,
  lazy: !0,
  hidden: !0,
  proxyOptions: null,
  describeLayer: function(a, b, c) {
    a = new(Ext.data.Record.create([{
      name: "owsType",
      type: "string"
    }, {
      name: "owsURL",
      type: "string"
    }, {
      name: "typeName",
      type: "string"
    }]))({
      owsType: "WFS",
      owsURL: a.get("url"),
      typeName: a.get("name")
    });
    b.call(c, a)
  },
  destroy: function() {
    this.store && this.store.destroy();
    this.store = null;
    gxp.plugins.CatalogueSource.superclass.destroy.apply(this, arguments)
  }
});
Ext.namespace("gxp.plugins");
gxp.plugins.GeoNodeCatalogueSource = Ext.extend(gxp.plugins.CatalogueSource, {
  ptype: "gxp_geonodecataloguesource",
  rootProperty: "results",
  baseParams: null,
  fields: [{
    name: "title",
    convert: function(a) {
      return [a]
    }
  }, {
    name: "abstract",
    mapping: "description"
  }, {
    name: "bounds",
    mapping: "bbox",
    convert: function(a) {
      return {
        left: a.minx,
        right: a.maxx,
        bottom: a.miny,
        top: a.maxy
      }
    }
  }, {
    name: "URI",
    mapping: "links",
    convert: function(a) {
      var b = [],
          c;
      for (c in a) b.push({
        value: a[c].url
      });
      return b
    }
  }],
  createStore: function() {
    this.store = new Ext.data.Store({
      proxy: new Ext.data.HttpProxy(Ext.apply({
        url: this.url,
        method: "GET"
      }, this.proxyOptions || {})),
      baseParams: Ext.apply({
        type: "layer"
      }, this.baseParams),
      reader: new Ext.data.JsonReader({
        root: this.rootProperty
      }, this.fields)
    });
    gxp.plugins.LayerSource.prototype.createStore.apply(this, arguments)
  },
  getPagingStart: function() {
    return 0
  },
  getPagingParamNames: function() {
    return {
      start: "startIndex",
      limit: "limit"
    }
  },
  filter: function(a) {
    var b = void 0;
    if (void 0 !== a.filters) for (var c = 0, d = a.filters.length; c < d; ++c) {
      var e = a.filters[c];
      if (e instanceof OpenLayers.Filter.Spatial) {
        b = e.value.toBBOX();
        break
      }
    }
    Ext.apply(this.store.baseParams, {
      q: a.queryString
    });
    void 0 !== a.limit && Ext.apply(this.store.baseParams, {
      limit: a.limit
    });
    void 0 !== b ? Ext.apply(this.store.baseParams, {
      bbox: b
    }) : delete this.store.baseParams.bbox;
    this.store.load()
  },
  createLayerRecord: function(a) {
    a.restUrl = this.restUrl;
    a.queryable = !0;
    return gxp.plugins.GeoNodeCatalogueSource.superclass.createLayerRecord.apply(this, arguments)
  }
});
Ext.preg(gxp.plugins.GeoNodeCatalogueSource.prototype.ptype, gxp.plugins.GeoNodeCatalogueSource);
Ext.namespace("gxp.form");
gxp.form.CSWFilterField = Ext.extend(Ext.form.CompositeField, {
  clearTooltip: "Clear the filter for this category",
  emptyText: "Select filter",
  property: null,
  map: null,
  type: OpenLayers.Filter.Comparison.EQUAL_TO,
  name: null,
  comboFieldLabel: null,
  comboStoreData: null,
  target: null,
  getFilter: function() {
    return "BoundingBox" === this.property ? new OpenLayers.Filter.Spatial({
      type: OpenLayers.Filter.Spatial.BBOX,
      property: this.property,
      projection: "EPSG:4326",
      value: this.map.getExtent().transform(this.map.getProjectionObject(), new OpenLayers.Projection("EPSG:4326"))
    }) : new OpenLayers.Filter.Comparison({
      type: this.type,
      property: this.property,
      value: this.combo.getValue()
    })
  },
  initComponent: function() {
    this.items = [{
      ref: "combo",
      xtype: "combo",
      fieldLabel: this.comboFieldLabel,
      store: new Ext.data.ArrayStore({
        fields: ["id", "value"],
        data: this.comboStoreData
      }),
      displayField: "value",
      valueField: "id",
      mode: "local",
      listeners: {
        select: function() {
          this.filter && this.target.removeFilter(this.filter);
          this.filter = this.getFilter();
          this.target.addFilter(this.filter);
          return !1
        },
        scope: this
      },
      emptyText: this.emptyText,
      triggerAction: "all"
    }, {
      xtype: "button",
      iconCls: "gxp-icon-removelayers",
      tooltip: this.clearTooltip,
      handler: function() {
        this.target.removeFilter(this.filter);
        this.hide()
      },
      scope: this
    }];
    this.hidden = !0;
    gxp.form.CSWFilterField.superclass.initComponent.apply(this, arguments)
  },
  destroy: function() {
    this.map = this.target = this.filter = null;
    gxp.form.CSWFilterField.superclass.destroy.call(this)
  }
});
Ext.reg("gxp_cswfilterfield", gxp.form.CSWFilterField);
Ext.namespace("gxp");
gxp.CatalogueSearchPanel = Ext.extend(Ext.Panel, {
  border: !1,
  maxRecords: 10,
  map: null,
  selectedSource: null,
  sources: null,
  searchFieldEmptyText: "Search",
  searchButtonText: "Search",
  addTooltip: "Create filter",
  addMapTooltip: "Add to map",
  advancedTitle: "Advanced",
  datatypeLabel: "Data type",
  extentLabel: "Spatial extent",
  categoryLabel: "Category",
  datasourceLabel: "Data source",
  filterLabel: "Filter search by",
  removeSourceTooltip: "Switch back to original source",
  initComponent: function() {
    var a = this;
    this.addEvents("addlayer");
    this.filters = [];
    var b = [],
        c;
    for (c in this.sources) b.push([c, this.sources[c].title]);
    if (1 <= b.length) this.selectedSource = b[0][0];
    c = [
      ["datatype", "data type"],
      ["extent", "spatial extent"],
      ["category", "category"]
    ];
    1 < b.length && c.push(["csw", "data source"]);
    this.sources[this.selectedSource].store.on("loadexception", function(a, b, c, g) {
      c.success() && Ext.Msg.show({
        title: g.message,
        msg: gxp.util.getOGCExceptionText(g.arg.exceptionReport),
        icon: Ext.MessageBox.ERROR,
        buttons: Ext.MessageBox.OK
      })
    });
    this.items = [{
      xtype: "form",
      border: !1,
      ref: "form",
      hideLabels: !0,
      autoHeight: !0,
      style: "margin-left: 5px; margin-right: 5px; margin-bottom: 5px; margin-top: 5px",
      items: [{
        xtype: "compositefield",
        items: [{
          xtype: "textfield",
          emptyText: this.searchFieldEmptyText,
          ref: "../../search",
          name: "search",
          listeners: {
            specialkey: function(a, b) {
              b.getKey() == b.ENTER && this.performQuery()
            },
            scope: this
          },
          width: 250
        }, {
          xtype: "button",
          text: this.searchButtonText,
          handler: this.performQuery,
          scope: this
        }]
      }, {
        xtype: "fieldset",
        collapsible: !0,
        collapsed: !0,
        hideLabels: !1,
        hidden: !0,
        title: this.advancedTitle,
        items: [{
          xtype: "gxp_cswfilterfield",
          name: "datatype",
          property: "apiso:Type",
          comboFieldLabel: this.datatypeLabel,
          comboStoreData: [
            ["dataset", "Dataset"],
            ["datasetcollection", "Dataset collection"],
            ["application", "Application"],
            ["service", "Service"]
          ],
          target: this
        }, {
          xtype: "gxp_cswfilterfield",
          name: "extent",
          property: "BoundingBox",
          map: this.map,
          comboFieldLabel: this.extentLabel,
          comboStoreData: [
            ["map", "spatial extent of the map"]
          ],
          target: this
        }, {
          xtype: "gxp_cswfilterfield",
          name: "category",
          property: "apiso:TopicCategory",
          comboFieldLabel: this.categoryLabel,
          comboStoreData: [
            ["farming", "Farming"],
            ["biota", "Biota"],
            ["boundaries", "Boundaries"],
            ["climatologyMeteorologyAtmosphere", "Climatology/Meteorology/Atmosphere"],
            ["economy", "Economy"],
            ["elevation", "Elevation"],
            ["environment", "Environment"],
            ["geoscientificinformation", "Geoscientific Information"],
            ["health", "Health"],
            ["imageryBaseMapsEarthCover", "Imagery/Base Maps/Earth Cover"],
            ["intelligenceMilitary", "Intelligence/Military"],
            ["inlandWaters", "Inland Waters"],
            ["location", "Location"],
            ["oceans", "Oceans"],
            ["planningCadastre", "Planning Cadastre"],
            ["society", "Society"],
            ["structure", "Structure"],
            ["transportation", "Transportation"],
            ["utilitiesCommunications", "Utilities/Communications"]
          ],
          target: this
        }, {
          xtype: "compositefield",
          id: "csw",
          ref: "../../cswCompositeField",
          hidden: !0,
          items: [{
            xtype: "combo",
            ref: "../../../sourceCombo",
            fieldLabel: this.datasourceLabel,
            store: new Ext.data.ArrayStore({
              fields: ["id", "value"],
              data: b
            }),
            displayField: "value",
            valueField: "id",
            mode: "local",
            listeners: {
              select: function(a) {
                this.setSource(a.getValue())
              },
              render: function() {
                this.sourceCombo.setValue(this.selectedSource)
              },
              scope: this
            },
            triggerAction: "all"
          }, {
            xtype: "button",
            iconCls: "gxp-icon-removelayers",
            tooltip: this.removeSourceTooltip,
            handler: function() {
              this.setSource(this.initialConfig.selectedSource);
              this.sourceCombo.setValue(this.initialConfig.selectedSource);
              this.cswCompositeField.hide()
            },
            scope: this
          }]
        }, {
          xtype: "compositefield",
          items: [{
            xtype: "combo",
            fieldLabel: this.filterLabel,
            store: new Ext.data.ArrayStore({
              fields: ["id", "value"],
              data: c
            }),
            displayField: "value",
            valueField: "id",
            mode: "local",
            triggerAction: "all"
          }, {
            xtype: "button",
            iconCls: "gxp-icon-addlayers",
            tooltip: this.addTooltip,
            handler: function(a) {
              a.ownerCt.items.each(function(a) {
                if ("combo" === a.getXType()) {
                  var b = a.getValue();
                  a.clearValue();
                  (a = this.form.getForm().findField(b)) && a.show()
                }
              }, this)
            },
            scope: this
          }]
        }]
      }, {
        xtype: "grid",
        width: "100%",
        anchor: "99%",
        viewConfig: {
          scrollOffset: 0,
          forceFit: !0
        },
        border: !1,
        ref: "../grid",
        bbar: new Ext.PagingToolbar({
          listeners: {
            beforechange: function(b, c) {
              var f = a.sources[a.selectedSource].getPagingStart();
              c.startPosition && (c.startPosition += f)
            }
          },
          onLoad: function(b, c, f) {
            var g = a.sources[a.selectedSource].getPagingStart();
            this.rendered ? (b = this.getParams(), this.cursor = f.params && f.params[b.start] ? f.params[b.start] - g : 0, f = this.getPageData(), g = f.activePage, b = f.pages, this.afterTextItem.setText(String.format(this.afterPageText, f.pages)), this.inputItem.setValue(g), this.first.setDisabled(1 == g), this.prev.setDisabled(1 == g), this.next.setDisabled(g == b), this.last.setDisabled(g == b), this.refresh.enable(), this.updateInfo(), this.fireEvent("change", this, f)) : this.dsLoaded = [b, c, f]
          },
          paramNames: this.sources[this.selectedSource].getPagingParamNames(),
          store: this.sources[this.selectedSource].store,
          pageSize: this.maxRecords
        }),
        loadMask: !0,
        hideHeaders: !0,
        store: this.sources[this.selectedSource].store,
        columns: [{
          id: "title",
          xtype: "templatecolumn",
          tpl: new Ext.XTemplate("<b>{title}</b><br/>{abstract}"),
          sortable: !0
        }, {
          xtype: "actioncolumn",
          width: 30,
          items: [{
            getClass: function(a, b, c) {
              if (!1 !== this.findWMS(c.get("URI")) || !1 !== this.findWMS(c.get("references"))) return "gxp-icon-addlayers"
            },
            tooltip: this.addMapTooltip,
            handler: function(a, b) {
              this.addLayer(this.grid.store.getAt(b))
            },
            scope: this
          }]
        }],
        autoExpandColumn: "title",
        autoHeight: !0
      }]
    }];
    gxp.CatalogueSearchPanel.superclass.initComponent.apply(this, arguments)
  },
  destroy: function() {
    this.map = this.sources = null;
    gxp.CatalogueSearchPanel.superclass.destroy.call(this)
  },
  setSource: function(a) {
    this.selectedSource = a;
    a = this.sources[a].store;
    this.grid.reconfigure(a, this.grid.getColumnModel());
    this.grid.getBottomToolbar().bindStore(a)
  },
  performQuery: function() {
    this.sources[this.selectedSource].filter({
      queryString: this.search.getValue(),
      limit: this.maxRecords,
      filters: this.filters
    })
  },
  addFilter: function(a) {
    this.filters.push(a)
  },
  removeFilter: function(a) {
    this.filters.remove(a)
  },
  findWMS: function(a) {
    var b = ["OGC:WMS-1.1.1-HTTP-GET-MAP", "OGC:WMS"],
        c = null,
        d = null,
        e, f, g;
    for (e = 0, f = a.length; e < f; ++e) if (g = a[e], g.protocol && -1 !== b.indexOf(g.protocol.toUpperCase()) && g.value && g.name) {
      c = g.value;
      d = g.name;
      break
    }
    if (null === c) for (e = 0, f = a.length; e < f; ++e) if (g = a[e], b = g.value ? g.value : g, 0 < b.toLowerCase().indexOf("service=wms")) {
      a = OpenLayers.Util.createUrlObject(b);
      c = a.protocol + "//" + a.host + ":" + a.port + a.pathname;
      d = a.args.layers;
      break
    }
    return null !== c && null !== d ? {
      url: c,
      name: d
    } : !1
  },
  addLayer: function(a) {
    var b = a.get("URI"),
        c = a.get("bounds"),
        d = c.left,
        e = c.right,
        f = c.bottom,
        g = c.top,
        c = Math.min(d, e),
        d = Math.max(d, e),
        e = Math.min(f, g),
        f = Math.max(f, g),
        b = this.findWMS(b);
    !1 === b && (b = this.findWMS(a.get("references")));
    !1 !== b && this.fireEvent("addlayer", this, this.selectedSource, Ext.apply({
      title: a.get("title")[0],
      bbox: [c, e, d, f],
      srs: "EPSG:4326",
      projection: a.get("projection")
    }, b))
  }
});
Ext.reg("gxp_cataloguesearchpanel", gxp.CatalogueSearchPanel);
Ext.ns("gxp.data", "gxp.plugins");
gxp.data.TMSCapabilitiesReader = Ext.extend(Ext.data.DataReader, {
  constructor: function(a, b) {
    a = a || {};
    if (!a.format) a.format = new OpenLayers.Format.TMSCapabilities;
    "function" !== typeof b && (b = GeoExt.data.LayerRecord.create(b || a.fields || [{
      name: "name",
      type: "string"
    }, {
      name: "title",
      type: "string"
    }, {
      name: "tileMapUrl",
      type: "string"
    }]));
    gxp.data.TMSCapabilitiesReader.superclass.constructor.call(this, a, b)
  },
  read: function(a) {
    var b = a.responseXML;
    if (!b || !b.documentElement) b = a.responseText;
    return this.readRecords(b)
  },
  readRecords: function(a) {
    var b = [],
        c, d, e;
    if ("string" === typeof a || a.nodeType) if (this.raw = a = this.meta.format.read(a), a.tileMaps) for (c = 0, d = a.tileMaps.length; c < d; ++c) {
      var f = a.tileMaps[c];
      e = new OpenLayers.Projection(f.srs);
      if (this.meta.mapProjection.equals(e)) {
        e = f.href;
        var g = e.substring(e.indexOf(this.meta.version + "/") + 6);
        b.push(new this.recordType({
          layer: new OpenLayers.Layer.TMS(f.title, -1 !== this.meta.baseUrl.indexOf(this.meta.version) ? this.meta.baseUrl.replace(this.meta.version + "/", "") : this.meta.baseUrl, {
            layername: g
          }),
          title: f.title,
          name: f.title,
          tileMapUrl: e
        }))
      }
    } else if (a.tileSets && (e = new OpenLayers.Projection(a.srs), this.meta.mapProjection.equals(e))) {
      f = [];
      for (c = 0, d = a.tileSets.length; c < d; ++c) f.push(a.tileSets[c].unitsPerPixel);
      e = this.meta.baseUrl;
      c = e.substring(e.indexOf(this.meta.version) + this.meta.version.length + 1, e.lastIndexOf("/"));
      b.push(new this.recordType({
        layer: new OpenLayers.Layer.TMS(a.title, a.tileMapService.replace("/" + this.meta.version, ""), {
          serverResolutions: f,
          type: a.tileFormat.extension,
          layername: c
        }),
        title: a.title,
        name: a.title,
        tileMapUrl: this.meta.baseUrl
      }))
    }
    return {
      totalRecords: b.length,
      success: !0,
      records: b
    }
  }
});
gxp.plugins.TMSSource = Ext.extend(gxp.plugins.LayerSource, {
  ptype: "gxp_tmssource",
  version: "1.0.0",
  constructor: function(a) {
    gxp.plugins.TMSSource.superclass.constructor.apply(this, arguments);
    this.format = new OpenLayers.Format.TMSCapabilities;
    "/" !== this.url.slice(-1) && (this.url += "/")
  },
  createStore: function() {
    this.store = new Ext.data.Store({
      autoLoad: !0,
      listeners: {
        load: function() {
          this.title = this.store.reader.raw.title;
          this.fireEvent("ready", this)
        },
        exception: function() {
          this.fireEvent("failure", this, "Trouble creating TMS layer store from response.", "Unable to handle response.")
        },
        scope: this
      },
      proxy: new Ext.data.HttpProxy({
        url: -1 === this.url.indexOf(this.version) ? this.url + this.version : this.url,
        disableCaching: !1,
        method: "GET"
      }),
      reader: new gxp.data.TMSCapabilitiesReader({
        baseUrl: this.url,
        version: this.version,
        mapProjection: this.getMapProjection()
      })
    })
  },
  createLayerRecord: function(a, b, c) {
    var d = this.store.findExact("name", a.name);
    if (-1 < d) {
      var d = this.store.getAt(d),
          e = d.getLayer();
      if (null !== e.serverResolutions) return d;
      Ext.Ajax.request({
        url: d.get("tileMapUrl"),
        success: function(d) {
          for (var g = [], d = this.format.read(d.responseText), h = 0, j = d.tileSets.length; h < j; ++h) g.push(d.tileSets[h].unitsPerPixel);
          e.addOptions({
            serverResolutions: g,
            type: d.tileFormat.extension
          });
          this.target.createLayerRecord({
            source: this.id,
            name: a.name
          }, b, c)
        },
        scope: this
      })
    }
  }
});
Ext.preg(gxp.plugins.TMSSource.prototype.ptype, gxp.plugins.TMSSource);
Ext.namespace("gxp.plugins");
gxp.plugins.ArcRestSource = Ext.extend(gxp.plugins.LayerSource, {
  ptype: "gxp_arcrestsource",
  requiredProperties: ["name"],
  constructor: function(a) {
    this.config = a;
    gxp.plugins.ArcRestSource.superclass.constructor.apply(this, arguments)
  },
  createStore: function() {
    var a = this.url.split("?")[0],
        b = this,
        c = function(c) {
        var f = Ext.decode(c.responseText),
            g = b.getArcProjection(f.spatialReference.wkid),
            h = [];
        if (null != g) for (c = 0; c < f.layers.length; c++) {
          var j = f.layers[c];
          h.push(new OpenLayers.Layer.ArcGIS93Rest(j.name, a + "/export", {
            layers: "show:" + j.id,
            TRANSPARENT: !0
          }, {
            isBaseLayer: !1,
            ratio: 1,
            displayInLayerSwitcher: !0,
            visibility: !0,
            projection: g,
            queryable: f.capabilities && f.capabilities.Identify
          }))
        } else d(c);
        b.title = f.documentInfo.Title;
        b.store = new GeoExt.data.LayerStore({
          layers: h,
          fields: [{
            name: "source",
            type: "string"
          }, {
            name: "name",
            type: "string",
            mapping: "name"
          }, {
            name: "layerid",
            type: "string"
          }, {
            name: "group",
            type: "string",
            defaultValue: this.title
          }, {
            name: "fixed",
            type: "boolean",
            defaultValue: !0
          }, {
            name: "tiled",
            type: "boolean",
            defaultValue: !0
          }, {
            name: "queryable",
            type: "boolean",
            defaultValue: !0
          }, {
            name: "selected",
            type: "boolean"
          }]
        });
        b.fireEvent("ready", b)
        },
        d = function() {
        Ext.Msg.alert("No ArcGIS Layers", "Could not find any compatible layers  at " + b.config.url);
        b.fireEvent("failure", b)
        };
    (this.lazy = this.isLazy()) ? this.fireEvent("ready") : Ext.Ajax.request({
      url: a,
      params: {
        f: "json",
        pretty: "false",
        keepPostParams: "true"
      },
      method: "POST",
      success: c,
      failure: d
    })
  },
  isLazy: function() {
    var a = !0,
        b = !1,
        c = this.target.initialConfig.map;
    if (c && c.layers) for (var d, e = 0, f =
    c.layers.length; e < f && !(d = c.layers[e], d.source === this.id && (b = !0, a = this.layerConfigComplete(d), !1 === a)); ++e);
    return a && b
  },
  layerConfigComplete: function(a) {
    for (var b = !0, c = this.requiredProperties, d = c.length - 1; 0 <= d && !(b = !! a[c[d]], !1 === b); --d);
    return b
  },
  createLayerRecord: function(a) {
    var b, c;
    c = function(b) {
      return b.get("name") === a.name
    };
    var d = this.lazy || this.store && -1 < this.store.findBy(c);
    if (-1 == this.target.mapPanel.layers.findBy(c) && d) {
      b = !this.lazy && -1 < this.store.findBy(c) ? this.store.getAt(this.store.findBy(c)).clone() : this.createLazyLayerRecord(a);
      c = b.getLayer();
      a.title && (c.setName(a.title), b.set("title", a.title));
      if ("visibility" in a) c.visibility = a.visibility;
      if ("opacity" in a) c.opacity = a.opacity;
      if ("format" in a) c.params.FORMAT = a.format, b.set("format", a.format);
      c = !1;
      "tiled" in a && (c = !a.tiled);
      b.set("tiled", !c);
      b.set("selected", a.selected || !1);
      b.set("queryable", a.queryable || !0);
      b.set("source", a.source);
      b.set("name", a.name);
      b.set("layerid", a.layerid);
      b.set("properties", "gxp_wmslayerpanel");
      "group" in a && b.set("group", a.group);
      b.commit()
    }
    return b
  },
  getArcProjection: function(a) {
    var b = this.getMapProjection(),
        c = b,
        a = "EPSG:" + a + "";
    if (a !== b.getCode() && (c = null, (p = new OpenLayers.Projection(a)).equals(b))) c = p;
    return c
  },
  createLazyLayerRecord: function(a) {
    var b = a.srs || this.target.map.projection;
    a.srs = {};
    a.srs[b] = !0;
    var c = a.bbox || this.target.map.maxExtent || OpenLayers.Projection.defaults[b].maxExtent;
    a.bbox = {};
    a.bbox[b] = {
      bbox: c
    };
    c = new GeoExt.data.LayerRecord(a);
    c.set("name", a.name);
    c.set("layerid", a.layerid || "show:0");
    c.set("format", a.format || "png");
    c.set("tiled", "tiled" in a ? a.tiled : !0);
    c.setLayer(new OpenLayers.Layer.ArcGIS93Rest(a.name, this.url.split("?")[0] + "/export", {
      layers: a.layerid,
      TRANSPARENT: !0,
      FORMAT: "format" in a ? a.format : "png"
    }, {
      isBaseLayer: !1,
      displayInLayerSwitcher: !0,
      projection: b,
      singleTile: "tiled" in a ? !a.tiled : !1,
      queryable: "queryable" in a ? a.queryable : !1
    }));
    return c
  },
  getConfigForRecord: function(a) {
    var b = a.getLayer();
    return {
      source: a.get("source"),
      name: a.get("name"),
      title: a.get("title"),
      tiled: a.get("tiled"),
      visibility: b.getVisibility(),
      layerid: b.params.LAYERS,
      format: b.params.FORMAT,
      opacity: b.opacity || void 0,
      group: a.get("group"),
      fixed: a.get("fixed"),
      selected: a.get("selected")
    }
  }
});
Ext.preg(gxp.plugins.ArcRestSource.prototype.ptype, gxp.plugins.ArcRestSource);
Ext.namespace("gxp.plugins");
gxp.plugins.AddLayers = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_addlayers",
  addActionMenuText: "Add layers",
  findActionMenuText: "Find layers",
  addFeedActionMenuText: "Add feeds",
  addActionTip: "Add layers",
  addServerText: "Add a New Server",
  addButtonText: "Add layers",
  untitledText: "Untitled",
  addLayerSourceErrorText: "Error getting {type} capabilities ({msg}).\nPlease check the url and try again.",
  availableLayersText: "Available Layers",
  searchText: "Search for layers",
  expanderTemplateText: "<p><b>Abstract:</b> {abstract}</p>",
  panelTitleText: "Title",
  layerSelectionText: "View available data from:",
  doneText: "Done",
  uploadRoles: ["ROLE_ADMINISTRATOR"],
  uploadText: "Upload layers",
  relativeUploadOnly: !0,
  startSourceId: null,
  catalogSourceKey: null,
  selectedSource: null,
  addServerId: null,
  constructor: function(a) {
    this.addEvents("sourceselected");
    gxp.plugins.AddLayers.superclass.constructor.apply(this, arguments)
  },
  addActions: function() {
    var a = {
      tooltip: this.addActionTip,
      text: this.addActionText,
      menuText: this.addActionMenuText,
      disabled: !0,
      iconCls: "gxp-icon-addlayers"
    },
        b;
    if (this.initialConfig.search || this.uploadSource) {
      var c = [new Ext.menu.Item({
        iconCls: "gxp-icon-addlayers",
        text: this.addActionMenuText,
        handler: this.showCapabilitiesGrid,
        scope: this
      })];
      if (this.initialConfig.search && this.initialConfig.search.selectedSource && this.target.sources[this.initialConfig.search.selectedSource]) {
        var d = new Ext.menu.Item({
          iconCls: "gxp-icon-addlayers",
          text: this.findActionMenuText,
          handler: this.showCatalogueSearch,
          scope: this
        });
        c.push(d);
        Ext.Ajax.request({
          method: "GET",
          url: this.target.sources[this.initialConfig.search.selectedSource].url,
          callback: function(a, b) {
            !1 === b && d.hide()
          }
        })
      }
      this.initialConfig.feeds && c.push(new Ext.menu.Item({
        iconCls: "gxp-icon-addlayers",
        text: this.addFeedActionMenuText,
        handler: this.showFeedDialog,
        scope: this
      }));
      this.uploadSource && (b = this.createUploadButton(Ext.menu.Item)) && c.push(b);
      a = Ext.apply(a, {
        menu: new Ext.menu.Menu({
          items: c
        })
      })
    } else a = Ext.apply(a, {
      handler: this.showCapabilitiesGrid,
      scope: this
    });
    var e = gxp.plugins.AddLayers.superclass.addActions.apply(this, [a]);
    this.target.on("ready", function() {
      if (this.uploadSource) {
        var a =
        this.target.layerSources[this.uploadSource];
        a ? this.setSelectedSource(a) : (delete this.uploadSource, b && b.hide())
      }
      e[0].enable()
    }, this);
    return e
  },
  showCatalogueSearch: function() {
    var a = this.initialConfig.search.selectedSource,
        b = {},
        c = !1,
        d;
    for (d in this.target.layerSources) {
      var e = this.target.layerSources[d];
      e instanceof gxp.plugins.CatalogueSource && (c = {}, c[d] = e, Ext.apply(b, c), c = !0)
    }
    if (!1 === c) window.console && window.console.debug("No catalogue source specified");
    else
    return a = gxp.plugins.AddLayers.superclass.addOutput.apply(this, [{
      sources: b,
      title: this.searchText,
      height: 300,
      width: 315,
      selectedSource: a,
      xtype: "gxp_cataloguesearchpanel",
      map: this.target.mapPanel.map
    }]), a.on({
      addlayer: function(a, b, c) {
        var a = this.target.layerSources[b],
            d = OpenLayers.Bounds.fromArray(c.bbox, a.yx && !0 === a.yx[c.projection]),
            e = this.target.mapPanel.map.getProjection(),
            d = d.transform(c.srs, e);
        c.srs = e;
        c.bbox = d.toArray();
        c.source = null !== this.initialConfig.catalogSourceKey ? this.initialConfig.catalogSourceKey : b;
        this.target.mapPanel.layers.add(a.createLayerRecord(c));
        d && this.target.mapPanel.map.zoomToExtent(d)
      },
      scope: this
    }), (b = a.findParentByType("window")) && b.center(), a
  },
  showCapabilitiesGrid: function() {
    this.capGrid ? this.capGrid instanceof Ext.Window || this.addOutput(this.capGrid) : this.initCapGrid();
    this.capGrid.show()
  },
  showFeedDialog: function() {
    if (!this.feedDialog) {
      var a = this.outputTarget ? Ext.Panel : Ext.Window;
      this.feedDialog = new a(Ext.apply({
        closeAction: "hide",
        autoScroll: !0,
        title: this.addFeedActionMenuText,
        items: [{
          xtype: "gxp_feedsourcedialog",
          target: this.target,
          listeners: {
            addfeed: function(a, c) {
              var d = {
                config: {
                  ptype: a
                }
              };
              if (c.url) d.config.url = c.url;
              d = this.target.addLayerSource(d);
              c.source = d.id;
              this.target.mapPanel.layers.add([d.createLayerRecord(c)]);
              this.feedDialog.hide()
            },
            scope: this
          }
        }]
      }, this.initialConfig.outputConfig));
      a === Ext.Panel && this.addOutput(this.feedDialog)
    }
    this.feedDialog instanceof Ext.Window || this.addOutput(this.feedDialog);
    this.feedDialog.show()
  },
  initCapGrid: function() {
    function a() {
      function a(b) {
        d && d.push(b);
        e--;
        0 === e && this.addLayers(d)
      }
      for (var b =
      this.selectedSource, c = h.getSelectionModel().getSelections(), d = [], e = c.length, f = 0, g = c.length; f < g; ++f) {
        var j = b.createLayerRecord({
          name: c[f].get("name"),
          source: b.id
        }, a, this);
        j && a.call(this, j)
      }
    }
    var b, c = [],
        d = this.target,
        e;
    for (e in d.layerSources) b = d.layerSources[e], b.store && !b.hidden && c.push([e, b.title || e, b.url]);
    var f = new Ext.data.ArrayStore({
      fields: ["id", "title", "url"],
      data: c
    });
    e = this.createExpander();
    var g = 0;
    null !== this.startSourceId && f.each(function(a) {
      a.get("id") === this.startSourceId && (g = f.indexOf(a))
    }, this);
    b = this.target.layerSources[c[g][0]];
    var h = new Ext.grid.GridPanel({
      store: b.store,
      autoScroll: !0,
      autoExpandColumn: "title",
      plugins: [e],
      loadMask: !0,
      colModel: new Ext.grid.ColumnModel([e,
      {
        id: "title",
        header: this.panelTitleText,
        dataIndex: "title",
        sortable: !0
      }, {
        header: "Id",
        dataIndex: "name",
        width: 120,
        sortable: !0
      }]),
      listeners: {
        rowdblclick: a,
        scope: this
      }
    }),
        j = new Ext.form.ComboBox({
        ref: "../../sourceComboBox",
        width: 165,
        store: f,
        valueField: "id",
        displayField: "title",
        tpl: '<tpl for="."><div ext:qtip="{url}" class="x-combo-list-item">{title}</div></tpl>',
        triggerAction: "all",
        editable: !1,
        allowBlank: !1,
        forceSelection: !0,
        mode: "local",
        value: c[g][0],
        listeners: {
          select: function(a, b) {
            var c = b.get("id");
            c === this.addServerId ? (l.outputTarget ? l.addOutput(k) : (new Ext.Window({
              title: gxp.NewSourceDialog.prototype.title,
              modal: !0,
              hideBorders: !0,
              width: 300,
              items: k
            })).show(), j.reset()) : (c = this.target.layerSources[c], h.reconfigure(c.store, h.getColumnModel()), h.getView().focusRow(0), this.setSelectedSource(c), function() {
              a.triggerBlur();
              a.el.blur()
            }.defer(100))
          },
          focus: function(a) {
            d.proxy && a.reset()
          },
          scope: this
        }
      });
    b = null;
    if (this.target.proxy || 1 < c.length) b = new Ext.Container({
      cls: "gxp-addlayers-sourceselect",
      items: [new Ext.Toolbar.TextItem({
        text: this.layerSelectionText
      }), j]
    }), b = [b];
    if (this.target.proxy) this.addServerId = Ext.id(), f.loadData([
      [this.addServerId, this.addServerText + "..."]
    ], !0);
    var k = {
      xtype: "gxp_newsourcedialog",
      header: !1,
      listeners: {
        hide: function(a) {
          this.outputTarget || a.ownerCt.hide()
        },
        urlselected: function(a, b, c) {
          a.setLoading();
          var d;
          switch (c) {
          case "TMS":
            d = "gxp_tmssource";
            break;
          case "REST":
            d = "gxp_arcrestsource";
            break;
          default:
            d = "gxp_wmscsource"
          }
          this.target.addLayerSource({
            config: {
              url: b,
              ptype: d
            },
            callback: function(b) {
              b = new f.recordType({
                id: b,
                title: this.target.layerSources[b].title || this.untitledText
              });
              f.insert(0, [b]);
              j.onSelect(b, 0);
              a.hide()
            },
            fallback: function(b, d) {
              a.setError((new Ext.Template(this.addLayerSourceErrorText)).apply({
                type: c,
                msg: d
              }))
            },
            scope: this
          })
        },
        scope: this
      }
    },
        l = this;
    e = {
      xtype: "container",
      region: "center",
      layout: "fit",
      hideBorders: !0,
      items: [h]
    };
    this.instructionsText && e.items.push({
      xtype: "box",
      autoHeight: !0,
      autoEl: {
        tag: "p",
        cls: "x-form-item",
        style: "padding-left: 5px; padding-right: 5px"
      },
      html: this.instructionsText
    });
    var n = ["->", new Ext.Button({
      text: this.addButtonText,
      iconCls: "gxp-icon-addlayers",
      handler: a,
      scope: this
    }), new Ext.Button({
      text: this.doneText,
      handler: function() {
        this.capGrid.hide()
      },
      scope: this
    })],
        m;
    this.uploadSource || (m = this.createUploadButton()) && n.unshift(m);
    m = this.outputTarget ? Ext.Panel : Ext.Window;
    this.capGrid = new m(Ext.apply({
      title: this.availableLayersText,
      closeAction: "hide",
      layout: "border",
      height: 300,
      width: 315,
      modal: !0,
      items: e,
      tbar: b,
      bbar: n,
      listeners: {
        hide: function() {
          h.getSelectionModel().clearSelections()
        },
        show: function() {
          null === this.selectedSource ? this.setSelectedSource(this.target.layerSources[c[g][0]]) : this.setSelectedSource(this.selectedSource)
        },
        scope: this
      }
    }, this.initialConfig.outputConfig));
    m === Ext.Panel && this.addOutput(this.capGrid)
  },
  addLayers: function(a, b) {
    for (var c = this.selectedSource, d = this.target.mapPanel.layers, e, f, g, h = 0, j = a.length; h < j; ++h) if (f =
    c.createLayerRecord({
      name: a[h].get("name"),
      source: c.id
    }) || a[h]) g = f.getLayer(), g.maxExtent && (e ? e.extend(f.getLayer().maxExtent) : e = f.getLayer().maxExtent.clone()), "background" === f.get("group") ? d.insert(1, [f]) : d.add([f]);
    e && this.target.mapPanel.map.zoomToExtent(e);
    if (1 === a.length && f && (this.target.selectLayer(f), b && this.postUploadAction)) {
      var k, c = this.postUploadAction;
      if (!Ext.isString(c)) k = c.outputConfig, c = c.plugin;
      this.target.tools[c].addOutput(k)
    }
  },
  setSelectedSource: function(a) {
    this.selectedSource =
    a;
    this.fireEvent("sourceselected", this, a);
    this.capGrid && a.lazy && a.store.load({
      callback: function() {
        var a = this.capGrid.sourceComboBox,
            c = a.store,
            d = a.valueField,
            e = c.findExact(d, a.getValue()),
            e = c.getAt(e),
            f = this.target.layerSources[e.get("id")];
        f ? f.title !== e.get("title") && !Ext.isEmpty(f.title) && (e.set("title", f.title), a.setValue(e.get(d))) : c.remove(e)
      }.createDelegate(this)
    })
  },
  createUploadButton: function(a) {
    var a = a || Ext.Button,
        b, c = this.initialConfig.upload || !! this.initialConfig.uploadSource,
        d;
    if (c) {
      "boolean" === typeof c && (c = {});
      b = new a({
        text: this.uploadText,
        iconCls: "gxp-icon-filebrowse",
        hidden: !this.uploadSource,
        handler: function() {
          this.target.doAuthorized(this.uploadRoles, function() {
            var a = new gxp.LayerUploadPanel(Ext.apply({
              title: this.outputTarget ? this.uploadText : void 0,
              url: d,
              width: 300,
              border: !1,
              bodyStyle: "padding: 10px 10px 0 10px;",
              labelWidth: 65,
              autoScroll: !0,
              defaults: {
                anchor: "99%",
                allowBlank: !1,
                msgTarget: "side"
              },
              listeners: {
                uploadcomplete: function(a, c) {
                  for (var d = c["import"].tasks, e, f = {}, g = 0, o = d.length; g < o; ++g) {
                    e = d[g];
                    if ("ERROR" === e.state) {
                      Ext.Msg.alert(e.layer.originalName, e.errorMessage);
                      return
                    }
                    var q;
                    if (e.target.dataStore) q = e.target.dataStore.workspace.name;
                    else if (e.target.coverageStore) q = e.target.coverageStore.workspace.name;
                    f[q + ":" + e.layer.name] = !0
                  }
                  this.selectedSource.store.load({
                    params: {
                      _dc: Math.random()
                    },
                    callback: function() {
                      var a, b;
                      this.capGrid && this.capGrid.isVisible() && (a = this.capGrid.get(0).get(0), b = a.getSelectionModel(), b.clearSelections());
                      var c = [],
                          d = 0;
                      this.selectedSource.store.each(function(a, b) {
                        a.get("name") in f && (d = b, c.push(a))
                      });
                      a ? window.setTimeout(function() {
                        b.selectRecords(c);
                        a.getView().focusRow(d)
                      }, 100) : this.addLayers(c, !0)
                    },
                    scope: this
                  });
                  this.outputTarget ? a.hide() : b.close()
                },
                scope: this
              }
            }, c)),
                b;
            this.outputTarget ? this.addOutput(a) : (b = new Ext.Window({
              title: this.uploadText,
              modal: !0,
              resizable: !1,
              items: [a]
            }), b.show())
          }, this)
        },
        scope: this
      });
      var e = {},
          f = function(a, b, c) {
          a in e ? window.setTimeout(function() {
            b.call(c, e[a])
          }, 0) : Ext.Ajax.request({
            url: a,
            disableCaching: !1,
            callback: function(d, f, n) {
              d =
              n.status;
              e[a] = d;
              b.call(c, d)
            }
          })
          };
      this.on({
        sourceselected: function(a, c) {
          b[this.uploadSource ? "show" : "hide"]();
          this.isEligibleForUpload(c) && (d = this.getGeoServerRestUrl(c.url), this.target.isAuthorized() && f(d + "/imports", function(a) {
            b.setVisible(200 === a)
          }, this))
        },
        scope: this
      })
    }
    return b
  },
  getGeoServerRestUrl: function(a) {
    a = a.split("/");
    a.pop();
    a.push("rest");
    return a.join("/")
  },
  isEligibleForUpload: function(a) {
    return a.url && (this.relativeUploadOnly ? "/" === a.url.charAt(0) : !0) && -1 === (this.nonUploadSources || []).indexOf(a.id)
  },
  createExpander: function() {
    return new Ext.grid.RowExpander({
      tpl: new Ext.Template(this.expanderTemplateText)
    })
  }
});
Ext.preg(gxp.plugins.AddLayers.prototype.ptype, gxp.plugins.AddLayers);
Ext.namespace("gxp.plugins");
gxp.plugins.BingSource = Ext.extend(gxp.plugins.LayerSource, {
  ptype: "gxp_bingsource",
  title: "Bing Layers",
  roadTitle: "Bing Roads",
  aerialTitle: "Bing Aerial",
  labeledAerialTitle: "Bing Aerial With Labels",
  apiKey: "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf",
  createStore: function() {
    var a = [new OpenLayers.Layer.Bing({
      key: this.apiKey,
      name: this.roadTitle,
      type: "Road",
      buffer: 1,
      transitionEffect: "resize"
    }), new OpenLayers.Layer.Bing({
      key: this.apiKey,
      name: this.aerialTitle,
      type: "Aerial",
      buffer: 1,
      transitionEffect: "resize"
    }), new OpenLayers.Layer.Bing({
      key: this.apiKey,
      name: this.labeledAerialTitle,
      type: "AerialWithLabels",
      buffer: 1,
      transitionEffect: "resize"
    })];
    this.store = new GeoExt.data.LayerStore({
      layers: a,
      fields: [{
        name: "source",
        type: "string"
      }, {
        name: "name",
        type: "string",
        mapping: "type"
      }, {
        name: "abstract",
        type: "string",
        mapping: "attribution"
      }, {
        name: "group",
        type: "string",
        defaultValue: "background"
      }, {
        name: "fixed",
        type: "boolean",
        defaultValue: !0
      }, {
        name: "selected",
        type: "boolean"
      }]
    });
    this.store.each(function(a) {
      a.set("group", "background")
    });
    this.fireEvent("ready", this)
  },
  createLayerRecord: function(a) {
    var b, c = this.store.findExact("name", a.name);
    if (-1 < c) {
      b = this.store.getAt(c).copy(Ext.data.Record.id({}));
      c = b.getLayer().clone();
      a.title && (c.setName(a.title), b.set("title", a.title));
      if ("visibility" in a) c.visibility = a.visibility;
      b.set("selected", a.selected || !1);
      b.set("source", a.source);
      b.set("name", a.name);
      "group" in a && b.set("group", a.group);
      b.data.layer = c;
      b.commit()
    }
    return b
  }
});
Ext.preg(gxp.plugins.BingSource.prototype.ptype, gxp.plugins.BingSource);
Ext.namespace("gxp.plugins");
gxp.plugins.ClickableFeatures = Ext.extend(gxp.plugins.Tool, {
  featureManager: null,
  autoLoadFeature: !1,
  autoLoadedFeature: null,
  toleranceParameters: ["BUFFER", "RADIUS"],
  constructor: function(a) {
    if (a && "autoLoadFeatures" in a) a.autoLoadFeature = a.autoLoadFeatures, delete a.autoLoadFeatures, window.console && console.warn("Deprecated config option 'autoLoadFeatures' for ptype: '" + a.ptype + "'. Use 'autoLoadFeature' instead.");
    gxp.plugins.ClickableFeatures.superclass.constructor.apply(this, [a])
  },
  noFeatureClick: function(a) {
    if (!this.selectControl) this.selectControl =
    new OpenLayers.Control.SelectFeature(this.target.tools[this.featureManager].featureLayer, this.initialConfig.controlOptions);
    var b = this.target.mapPanel.map.getLonLatFromPixel(a.xy),
        c = this.target.tools[this.featureManager],
        d = c.page;
    if (!("all" == c.visible() && c.paging && d && d.extent.containsLonLat(b)) && (b = c.layerRecord && c.layerRecord.getLayer())) {
      var e = this.target.mapPanel.map,
          d = e.getSize(),
          d = Ext.applyIf({
          REQUEST: "GetFeatureInfo",
          BBOX: e.getExtent().toBBOX(),
          WIDTH: d.w,
          HEIGHT: d.h,
          X: parseInt(a.xy.x),
          Y: parseInt(a.xy.y),
          QUERY_LAYERS: b.params.LAYERS,
          INFO_FORMAT: "application/vnd.ogc.gml",
          EXCEPTIONS: "application/vnd.ogc.se_xml",
          FEATURE_COUNT: 1
        }, b.params);
      if ("number" === typeof this.tolerance) for (var f = 0, g = this.toleranceParameters.length; f < g; ++f) d[this.toleranceParameters[f]] = this.tolerance;
      e = e.getProjectionObject();
      (f = b.projection) && f.equals(e) && (e = f);
      1.3 <= parseFloat(b.params.VERSION) ? d.CRS = e.getCode() : d.SRS = e.getCode();
      new GeoExt.data.FeatureStore({
        fields: {},
        proxy: new GeoExt.data.ProtocolProxy({
          protocol: new OpenLayers.Protocol.HTTP({
            url: "string" === typeof b.url ? b.url : b.url[0],
            params: d,
            format: new OpenLayers.Format.WMSGetFeatureInfo
          })
        }),
        autoLoad: !0,
        listeners: {
          load: function(b, d) {
            if (0 < d.length) {
              var e = d[0].get("fid"),
                  f = new OpenLayers.Filter.FeatureId({
                  fids: [e]
                }),
                  g = function() {
                  c.loadFeatures(f, function(a) {
                    if (a.length) this.autoLoadedFeature = a[0], this.select(a[0])
                  }, this)
                  }.createDelegate(this),
                  m = c.featureLayer.getFeatureByFid(e);
              m ? this.select(m) : c.paging && c.pagingType === gxp.plugins.FeatureManager.QUADTREE_PAGING ? (m = this.target.mapPanel.map.getLonLatFromPixel(a.xy), c.setPage({
                lonLat: m
              }, function() {
                var a = c.featureLayer.getFeatureByFid(e);
                a ? this.select(a) : !0 === this.autoLoadFeature && g()
              }, this)) : g()
            }
          },
          scope: this
        }
      })
    }
  },
  select: function(a) {
    this.selectControl.unselectAll();
    this.selectControl.select(a)
  }
});
Ext.namespace("gxp.plugins");
gxp.plugins.CSWCatalogueSource = Ext.extend(gxp.plugins.CatalogueSource, {
  ptype: "gxp_cataloguesource",
  createStore: function() {
    this.store = new Ext.data.Store({
      proxy: new GeoExt.data.ProtocolProxy(Ext.apply({
        setParamsAsOptions: !0,
        protocol: new OpenLayers.Protocol.CSW({
          url: this.url
        })
      }, this.proxyOptions || {})),
      reader: new GeoExt.data.CSWRecordsReader({
        fields: "title,abstract,URI,bounds,projection,references".split(",")
      })
    });
    gxp.plugins.LayerSource.prototype.createStore.apply(this, arguments)
  },
  getPagingStart: function() {
    return 1
  },
  getPagingParamNames: function() {
    return {
      start: "startPosition",
      limit: "maxRecords"
    }
  },
  getFullFilter: function(a, b) {
    var c = [];
    void 0 !== a && c.push(a);
    c = c.concat(b);
    return 1 >= c.length ? c[0] : new OpenLayers.Filter.Logical({
      type: OpenLayers.Filter.Logical.AND,
      filters: c
    })
  },
  filter: function(a) {
    var b = void 0;
    "" !== a.queryString && (b = new OpenLayers.Filter.Comparison({
      type: OpenLayers.Filter.Comparison.LIKE,
      matchCase: !1,
      property: "csw:AnyText",
      value: "*" + a.queryString + "*"
    }));
    var c = {
      resultType: "results",
      maxRecords: a.limit,
      Query: {
        typeNames: "gmd:MD_Metadata",
        ElementSetName: {
          value: "full"
        }
      }
    },
        a = this.getFullFilter(b, a.filters);
    void 0 !== a && Ext.apply(c.Query, {
      Constraint: {
        version: "1.1.0",
        Filter: a
      }
    });
    Ext.apply(this.store.baseParams, c);
    this.store.load()
  }
});
Ext.preg(gxp.plugins.CSWCatalogueSource.prototype.ptype, gxp.plugins.CSWCatalogueSource);
Ext.namespace("gxp.plugins");
gxp.plugins.DeleteSelectedFeatures = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_deleteselectedfeatures",
  deleteMsgTitle: "Delete",
  deleteFeaturesMsg: "Are you sure you want to delete {0} selected features?",
  deleteFeatureMsg: "Are you sure you want to delete the selected feature?",
  menuText: "Delete selected features",
  tooltip: "Delete the currently selected features",
  iconCls: "delete",
  addActions: function() {
    var a = gxp.plugins.DeleteSelectedFeatures.superclass.addActions.apply(this, [{
      text: this.buttonText,
      menuText: this.menuText,
      iconCls: this.iconCls,
      tooltip: this.tooltip,
      handler: this.deleteFeatures,
      scope: this
    }]);
    a[0].disable();
    var b = this.target.tools[this.featureManager].featureLayer;
    b.events.on({
      featureselected: function() {
        a[0].isDisabled() && a[0].enable()
      },
      featureunselected: function() {
        0 == b.selectedFeatures.length && a[0].disable()
      }
    });
    return a
  },
  deleteFeatures: function() {
    var a = this.target.tools[this.featureManager],
        b = a.featureLayer.selectedFeatures;
    Ext.Msg.show({
      title: this.deleteMsgTitle,
      msg: 1 < b.length ? String.format(this.deleteFeaturesMsg, b.length) : this.deleteFeatureMsg,
      buttons: Ext.Msg.YESNO,
      fn: function(c) {
        if ("yes" === c) {
          for (var c = a.featureStore, d, e = b.length - 1; 0 <= e; --e) {
            d = b[e];
            d.layer.selectedFeatures.remove(d);
            d.layer.events.triggerEvent("featureunselected", {
              feature: d
            });
            if (d.state !== OpenLayers.State.INSERT) d.state = OpenLayers.State.DELETE, c._removing = !0;
            c.remove(c.getRecordFromFeature(d));
            delete c._removing
          }
          c.save()
        }
      },
      scope: this,
      icon: Ext.MessageBox.QUESTION
    })
  }
});
Ext.preg(gxp.plugins.DeleteSelectedFeatures.prototype.ptype, gxp.plugins.DeleteSelectedFeatures);
Ext.namespace("gxp.plugins");
gxp.plugins.SchemaAnnotations = {
  getAnnotationsFromSchema: function(a) {
    var b = null,
        a = a.get("annotation");
    if (void 0 !== a) {
      var b = {},
          c = GeoExt.Lang.locale.split("-").shift(),
          d, e;
      for (d = 0, e = a.appinfo.length; d < e; ++d) {
        var f = Ext.decode(a.appinfo[d]);
        if (f.title && f.title[c]) {
          b.label = f.title[c];
          break
        }
      }
      for (d = 0, e = a.documentation.length; d < e; ++d) if (a.documentation[d].lang === c) {
        b.helpText = a.documentation[d].textContent;
        break
      }
    }
    return b
  }
};
Ext.namespace("gxp.plugins");
gxp.plugins.FeatureEditorGrid = Ext.extend(Ext.grid.PropertyGrid, {
  ptype: "gxp_editorgrid",
  xtype: "gxp_editorgrid",
  feature: null,
  schema: null,
  fields: null,
  excludeFields: null,
  propertyNames: null,
  readOnly: null,
  border: !1,
  initComponent: function() {
    if (!this.dateFormat) this.dateFormat = Ext.form.DateField.prototype.format;
    if (!this.timeFormat) this.timeFormat = Ext.form.TimeField.prototype.format;
    this.customRenderers = this.customRenderers || {};
    this.customEditors = this.customEditors || {};
    var a = this.feature,
        b;
    if (this.fields) {
      b = {};
      for (var c = 0, d = this.fields.length; c < d; ++c) b[this.fields[c]] = a.attributes[this.fields[c]]
    } else b = a.attributes;
    if (!this.excludeFields) this.excludeFields = [];
    if (this.schema) {
      var e = this.fields ? this.fields.join(",").toUpperCase().split(",") : [];
      this.schema.each(function(c) {
        var d = c.get("type");
        if (!d.match(/^[^:]*:?((Multi)?(Point|Line|Polygon|Curve|Surface|Geometry))/)) {
          var f = c.get("name");
          this.fields && -1 == e.indexOf(f.toUpperCase()) && this.excludeFields.push(f);
          var k = a.attributes[f],
              l = GeoExt.form.recordToField(c);
          if ((c = this.getAnnotationsFromSchema(c)) && c.label) this.propertyNames = this.propertyNames || {}, this.propertyNames[f] = c.label;
          var n;
          if ("string" == typeof k) {
            var m;
            switch (d.split(":").pop()) {
            case "date":
              m = this.dateFormat;
              l.editable = !1;
              break;
            case "dateTime":
              if (!m) m = this.dateFormat + " " + this.timeFormat, l.editable = !0;
              l.format = m;
              n = {
                startedit: function(a, b) {
                  if (!(b instanceof Date)) {
                    var c = Date.parseDate(b.replace(/Z$/, ""), "c");
                    c && this.setValue(c)
                  }
                }
              };
              this.customRenderers[f] = function() {
                return function(a) {
                  var b = a;
                  "string" == typeof a && (b = Date.parseDate(a.replace(/Z$/, ""), "c"));
                  return b ? b.format(m) : a
                }
              }();
              break;
            case "boolean":
              n = {
                startedit: function(a, b) {
                  this.setValue(Boolean(b))
                }
              }
            }
          }
          this.customEditors[f] = new Ext.grid.GridEditor({
            field: Ext.create(l),
            listeners: n
          });
          b[f] = k
        }
      }, this);
      a.attributes = b
    }
    this.source = b;
    var f = this.excludeFields.length ? this.excludeFields.join(",").toUpperCase().split(",") : [];
    this.viewConfig = {
      forceFit: !0,
      getRowClass: function(a) {
        if (-1 !== f.indexOf(a.get("name").toUpperCase())) return "x-hide-nosize"
      }
    };
    this.listeners = {
      beforeedit: function() {
        return this.featureEditor && this.featureEditor.editing
      },
      propertychange: function() {
        this.featureEditor && this.featureEditor.setFeatureState(this.featureEditor.getDirtyState())
      },
      scope: this
    };
    c = Ext.data.Store.prototype.sort;
    Ext.data.Store.prototype.sort = function() {};
    gxp.plugins.FeatureEditorGrid.superclass.initComponent.apply(this, arguments);
    Ext.data.Store.prototype.sort = c;
    this.propStore.isEditableValue = function() {
      return !0
    }
  },
  init: function(a) {
    this.featureEditor = a;
    this.featureEditor.on("canceledit", this.onCancelEdit, this);
    this.featureEditor.add(this);
    this.featureEditor.doLayout()
  },
  destroy: function() {
    if (this.featureEditor) this.featureEditor.un("canceledit", this.onCancelEdit, this), this.featureEditor = null;
    gxp.plugins.FeatureEditorGrid.superclass.destroy.call(this)
  },
  onCancelEdit: function(a, b) {
    b && this.setSource(b.attributes)
  }
});
Ext.override(gxp.plugins.FeatureEditorGrid, gxp.plugins.SchemaAnnotations);
Ext.preg(gxp.plugins.FeatureEditorGrid.prototype.ptype, gxp.plugins.FeatureEditorGrid);
Ext.reg(gxp.plugins.FeatureEditorGrid.prototype.xtype, gxp.plugins.FeatureEditorGrid);
Ext.namespace("gxp");
gxp.FeatureEditPopup = Ext.extend(GeoExt.Popup, {
  closeMsgTitle: "Save Changes?",
  closeMsg: "This feature has unsaved changes. Would you like to save your changes?",
  deleteMsgTitle: "Delete Feature?",
  deleteMsg: "Are you sure you want to delete this feature?",
  editButtonText: "Edit",
  editButtonTooltip: "Make this feature editable",
  deleteButtonText: "Delete",
  deleteButtonTooltip: "Delete this feature",
  cancelButtonText: "Cancel",
  cancelButtonTooltip: "Stop editing, discard changes",
  saveButtonText: "Save",
  saveButtonTooltip: "Save changes",
  layout: "fit",
  feature: null,
  schema: null,
  readOnly: !1,
  allowDelete: !1,
  editing: !1,
  editorPluginConfig: {
    ptype: "gxp_editorgrid"
  },
  modifyControl: null,
  geometry: null,
  attributes: null,
  cancelButton: null,
  saveButton: null,
  editButton: null,
  deleteButton: null,
  initComponent: function() {
    var b;
    this.addEvents("startedit", "stopedit", "beforefeaturemodified", "featuremodified", "canceledit", "cancelclose");
    var a = this.feature;
    if (a instanceof GeoExt.data.FeatureRecord) b = this.feature = a.getFeature(), a = b;
    if (!this.location) this.location =
    a;
    this.anchored = !this.editing;
    if (!this.title && a.fid) this.title = a.fid;
    this.editButton = new Ext.Button({
      text: this.editButtonText,
      tooltip: this.editButtonTooltip,
      iconCls: "edit",
      handler: this.startEditing,
      scope: this
    });
    this.deleteButton = new Ext.Button({
      text: this.deleteButtonText,
      tooltip: this.deleteButtonTooltip,
      iconCls: "delete",
      hidden: !this.allowDelete,
      handler: this.deleteFeature,
      scope: this
    });
    this.cancelButton = new Ext.Button({
      text: this.cancelButtonText,
      tooltip: this.cancelButtonTooltip,
      iconCls: "cancel",
      hidden: !0,
      handler: function() {
        this.stopEditing(!1)
      },
      scope: this
    });
    this.saveButton = new Ext.Button({
      text: this.saveButtonText,
      tooltip: this.saveButtonTooltip,
      iconCls: "save",
      hidden: !0,
      handler: function() {
        this.stopEditing(!0)
      },
      scope: this
    });
    this.plugins = [Ext.apply({
      feature: a,
      schema: this.schema,
      fields: this.fields,
      excludeFields: this.excludeFields,
      propertyNames: this.propertyNames,
      readOnly: this.readOnly
    }, this.editorPluginConfig)];
    this.bbar = new Ext.Toolbar({
      hidden: this.readOnly,
      items: [this.editButton, this.deleteButton, this.saveButton, this.cancelButton]
    });
    gxp.FeatureEditPopup.superclass.initComponent.call(this);
    this.on({
      show: function() {
        if (this.editing) this.editing = null, this.startEditing()
      },
      beforeclose: function() {
        if (this.editing) {
          if (this.feature.state === this.getDirtyState()) return Ext.Msg.show({
            title: this.closeMsgTitle,
            msg: this.closeMsg,
            buttons: Ext.Msg.YESNOCANCEL,
            fn: function(a) {
              a && "cancel" !== a ? (this.stopEditing("yes" === a), this.close()) : this.fireEvent("cancelclose", this)
            },
            scope: this,
            icon: Ext.MessageBox.QUESTION,
            animEl: this.getEl()
          }), !1;
          this.stopEditing(!1)
        }
      },
      scope: this
    })
  },
  getDirtyState: function() {
    return this.feature.state === OpenLayers.State.INSERT ? this.feature.state : OpenLayers.State.UPDATE
  },
  startEditing: function() {
    if (!this.editing) this.fireEvent("startedit", this), this.editing = !0, this.anc && this.unanchorPopup(), this.editButton.hide(), this.deleteButton.hide(), this.saveButton.show(), this.cancelButton.show(), this.geometry = this.feature.geometry && this.feature.geometry.clone(), this.attributes = Ext.apply({}, this.feature.attributes), this.modifyControl =
    new OpenLayers.Control.ModifyFeature(this.feature.layer, {
      standalone: !0,
      vertexRenderIntent: this.vertexRenderIntent
    }), this.feature.layer.map.addControl(this.modifyControl), this.modifyControl.activate(), this.feature.geometry && this.modifyControl.selectFeature(this.feature)
  },
  stopEditing: function(a) {
    if (this.editing) {
      this.fireEvent("stopedit", this);
      this.modifyControl.deactivate();
      this.modifyControl.destroy();
      var b = this.feature;
      if (b.state === this.getDirtyState()) if (!0 === a) {
        this.fireEvent("beforefeaturemodified", this, b);
        if (this.schema) {
          var c, d;
          for (d in b.attributes) c = this.schema.getAt(this.schema.findExact("name", d)), a = b.attributes[d], a instanceof Date && (c = c.get("type").split(":").pop(), b.attributes[d] = a.format("date" == c ? "Y-m-d" : "c"))
        }
        this.fireEvent("featuremodified", this, b)
      } else b.state === OpenLayers.State.INSERT ? (this.editing = !1, b.layer && b.layer.destroyFeatures([b]), this.fireEvent("canceledit", this, null), this.close()) : (d = b.layer, d.drawFeature(b, {
        display: "none"
      }), b.geometry = this.geometry, b.attributes = this.attributes, this.setFeatureState(null), d.drawFeature(b), this.fireEvent("canceledit", this, b));
      this.isDestroyed || (this.cancelButton.hide(), this.saveButton.hide(), this.editButton.show(), this.allowDelete && this.deleteButton.show());
      this.editing = !1
    }
  },
  deleteFeature: function() {
    Ext.Msg.show({
      title: this.deleteMsgTitle,
      msg: this.deleteMsg,
      buttons: Ext.Msg.YESNO,
      fn: function(a) {
        "yes" === a && (this.setFeatureState(OpenLayers.State.DELETE), this.fireEvent("featuremodified", this, this.feature), this.close())
      },
      scope: this,
      icon: Ext.MessageBox.QUESTION,
      animEl: this.getEl()
    })
  },
  setFeatureState: function(a) {
    this.feature.state = a;
    (a = this.feature.layer) && a.events.triggerEvent("featuremodified", {
      feature: this.feature
    })
  }
});
Ext.reg("gxp_featureeditpopup", gxp.FeatureEditPopup);
Ext.namespace("gxp.plugins");
gxp.plugins.FeatureEditor = Ext.extend(gxp.plugins.ClickableFeatures, {
  ptype: "gxp_featureeditor",
  commitMessage: !1,
  splitButton: null,
  iconClsAdd: "gxp-icon-addfeature",
  closeOnSave: !1,
  supportAbstractGeometry: !1,
  supportNoGeometry: !1,
  iconClsEdit: "gxp-icon-editfeature",
  exceptionTitle: "Save Failed",
  exceptionText: "Trouble saving features",
  pointText: "Point",
  lineText: "Line",
  polygonText: "Polygon",
  noGeometryText: "Event",
  commitTitle: "Commit message",
  commitText: "Please enter a commit message for this edit:",
  createFeatureActionTip: "Create a new feature",
  createFeatureActionText: "Create",
  editFeatureActionTip: "Edit existing feature",
  editFeatureActionText: "Modify",
  splitButtonText: "Edit",
  splitButtonTooltip: "Edit features on selected WMS layer",
  outputTarget: "map",
  snappingAgent: null,
  readOnly: !1,
  modifyOnly: !1,
  showSelectedOnly: !0,
  roles: ["ROLE_ADMINISTRATOR"],
  createAction: null,
  editAction: null,
  activeIndex: 0,
  drawControl: null,
  popup: null,
  schema: null,
  constructor: function(a) {
    this.addEvents("layereditable", "featureeditable");
    gxp.plugins.FeatureEditor.superclass.constructor.apply(this, arguments)
  },
  init: function(a) {
    gxp.plugins.FeatureEditor.superclass.init.apply(this, arguments);
    this.target.on("authorizationchange", this.onAuthorizationChange, this)
  },
  destroy: function() {
    this.target.un("authorizationchange", this.onAuthorizationChange, this);
    gxp.plugins.FeatureEditor.superclass.destroy.apply(this, arguments)
  },
  onAuthorizationChange: function() {
    this.target.isAuthorized(this.roles) || (this.selectControl.deactivate(), this.drawControl.deactivate());
    this.enableOrDisable()
  },
  addActions: function() {
    function a(a, d) {
      var f = Array.prototype.slice.call(arguments);
      f.splice(0, 2);
      if (!e && b && !b.isDestroyed) {
        if (b.editing) {
          var g = function() {
            e = !0;
            h.call(this);
            "setLayer" === d ? this.target.selectLayer(f[0]) : "clearFeatures" === d ? window.setTimeout(function() {
              a[d].call(a)
            }) : a[d].apply(a, f)
          },
              h = function() {
              c.featureStore.un("write", g, this);
              b.un("canceledit", g, this);
              b.un("cancelclose", h, this)
              };
          c.featureStore.on("write", g, this);
          b.on({
            canceledit: g,
            cancelclose: h,
            scope: this
          });
          b.close()
        }
        return !b.editing
      }
      e = !1
    }
    var b, c = this.getFeatureManager(),
        d = c.featureLayer,
        e = !1;
    c.on({
      beforequery: a.createDelegate(this, "loadFeatures", 1),
      beforelayerchange: a.createDelegate(this, "setLayer", 1),
      beforesetpage: a.createDelegate(this, "setPage", 1),
      beforeclearfeatures: a.createDelegate(this, "clearFeatures", 1),
      scope: this
    });
    this.drawControl = new OpenLayers.Control.DrawFeature(d, OpenLayers.Handler.Point, {
      eventListeners: {
        featureadded: function(a) {
          if (!0 === this.autoLoadFeature) this.autoLoadedFeature = a.feature
        },
        activate: function() {
          this.target.doAuthorized(this.roles, function() {
            c.showLayer(this.id, this.showSelectedOnly && "selected")
          }, this)
        },
        deactivate: function() {
          c.hideLayer(this.id)
        },
        scope: this
      }
    });
    this.selectControl = new OpenLayers.Control.SelectFeature(d, {
      clickout: !1,
      multipleKey: "fakeKey",
      eventListeners: {
        activate: function() {
          this.target.doAuthorized(this.roles, function() {
            (!0 === this.autoLoadFeature || c.paging) && this.target.mapPanel.map.events.register("click", this, this.noFeatureClick);
            c.showLayer(this.id, this.showSelectedOnly && "selected");
            this.selectControl.unselectAll(b && b.editing && {
              except: b.feature
            })
          }, this)
        },
        deactivate: function() {
          (!0 === this.autoLoadFeature || c.paging) && this.target.mapPanel.map.events.unregister("click", this, this.noFeatureClick);
          if (b) {
            if (b.editing) b.on("cancelclose", function() {
              this.selectControl.activate()
            }, this, {
              single: !0
            });
            b.on("close", function() {
              c.hideLayer(this.id)
            }, this, {
              single: !0
            });
            b.close()
          } else c.hideLayer(this.id)
        },
        scope: this
      }
    });
    d.events.on({
      beforefeatureremoved: function(a) {
        this.popup && a.feature === this.popup.feature && this.selectControl.unselect(a.feature)
      },
      featureunselected: function(a) {
        (a =
        a.feature) && this.fireEvent("featureeditable", this, a, !1);
        a && a.geometry && b && !b.hidden && b.close()
      },
      beforefeatureselected: function() {
        if (b) return !b.editing
      },
      featureselected: function(a) {
        var d = a.feature;
        d && this.fireEvent("featureeditable", this, d, !0);
        var e = c.featureStore;
        if (!0 === this._forcePopupForNoGeometry || this.selectControl.active && null !== d.geometry)!1 === this.readOnly && (this.selectControl.deactivate(), c.showLayer(this.id, this.showSelectedOnly && "selected")), b = this.addOutput({
          xtype: "gxp_featureeditpopup",
          collapsible: !0,
          feature: e.getByFeature(d),
          vertexRenderIntent: "vertex",
          readOnly: this.readOnly,
          fields: this.fields,
          excludeFields: this.excludeFields,
          editing: d.state === OpenLayers.State.INSERT,
          schema: this.schema,
          allowDelete: !0,
          width: 200,
          height: 250
        }), b.on({
          close: function() {
            !1 === this.readOnly && this.selectControl.activate();
            d.layer && -1 !== d.layer.selectedFeatures.indexOf(d) && this.selectControl.unselect(d);
            if (d === this.autoLoadedFeature) d.layer && d.layer.removeFeatures([a.feature]), this.autoLoadedFeature = null
          },
          featuremodified: function(a, b) {
            e.on({
              beforewrite: {
                fn: function(a, b, c, d) {
                  if (!0 === this.commitMessage) d.params.handle = this._commitMsg, delete this._commitMsg
                },
                single: !0
              },
              beforesave: {
                fn: function() {
                  a && a.isVisible() && a.disable();
                  if (!0 === this.commitMessage && !this._commitMsg) {
                    var b = arguments.callee;
                    Ext.Msg.show({
                      prompt: !0,
                      title: this.commitTitle,
                      msg: this.commitText,
                      buttons: Ext.Msg.OK,
                      fn: function(a, c) {
                        if ("ok" === a) this._commitMsg = c, e.un("beforesave", b, this), e.save()
                      },
                      scope: this,
                      multiline: !0
                    });
                    return !1
                  }
                },
                single: !0 !== this.commitMessage
              },
              write: {
                fn: function() {
                  a && (a.isVisible() && a.enable(), this.closeOnSave && a.close());
                  var b = c.layerRecord;
                  this.target.fireEvent("featureedit", c, {
                    name: b.get("name"),
                    source: b.get("source")
                  })
                },
                single: !0
              },
              exception: {
                fn: function(b, d, f, g, h, j) {
                  b = this.exceptionText;
                  "remote" === d ? h.exceptionReport && (b = gxp.util.getOGCExceptionText(h.exceptionReport)) : b = "Status: " + h.status;
                  c.fireEvent("exception", c, h.exceptionReport || {}, b, j);
                  !1 === c.hasListener("exception") && !1 === e.hasListener("exception") && Ext.Msg.show({
                    title: this.exceptionTitle,
                    msg: b,
                    icon: Ext.MessageBox.ERROR,
                    buttons: {
                      ok: !0
                    }
                  });
                  a && a.isVisible() && (a.enable(), a.startEditing())
                },
                single: !0
              },
              scope: this
            });
            if (b.state === OpenLayers.State.DELETE) e._removing = !0, e.remove(e.getRecordFromFeature(b)), delete e._removing;
            e.save()
          },
          canceledit: function() {
            e.commitChanges()
          },
          scope: this
        }), this.popup = b
      },
      sketchcomplete: function() {
        c.featureLayer.events.register("featuresadded", this, function(a) {
          c.featureLayer.events.unregister("featuresadded", this, arguments.callee);
          this.drawControl.deactivate();
          this.selectControl.activate();
          this.selectControl.select(a.features[0])
        })
      },
      scope: this
    });
    var f = this.toggleGroup || Ext.id(),
        g = [],
        h = {
        tooltip: this.createFeatureActionTip,
        menuText: this.initialConfig.createFeatureActionText,
        text: this.initialConfig.createFeatureActionText,
        iconCls: this.iconClsAdd,
        disabled: !0,
        hidden: this.modifyOnly || this.readOnly,
        toggleGroup: f,
        group: f,
        groupClass: null,
        enableToggle: !0,
        allowDepress: !0,
        control: this.drawControl,
        deactivateOnDisable: !0,
        map: this.target.mapPanel.map,
        listeners: {
          checkchange: this.onItemCheckchange,
          scope: this
        }
        };
    if (!0 === this.supportAbstractGeometry) {
      var j = [];
      !0 === this.supportNoGeometry && j.push(new Ext.menu.CheckItem({
        text: this.noGeometryText,
        iconCls: "gxp-icon-event",
        groupClass: null,
        group: f,
        listeners: {
          checkchange: function(a, b) {
            if (!0 === b) {
              var c = new OpenLayers.Feature.Vector(null);
              c.state = OpenLayers.State.INSERT;
              d.addFeatures([c]);
              this._forcePopupForNoGeometry = !0;
              d.events.triggerEvent("featureselected", {
                feature: c
              });
              delete this._forcePopupForNoGeometry
            }
            this.createAction.items[0] instanceof Ext.menu.CheckItem ? this.createAction.items[0].setChecked(!1) : this.createAction.items[0].toggle(!1)
          },
          scope: this
        }
      }));
      var k = function(a, b, c) {
        !0 === b && this.setHandler(c, !1);
        this.createAction.items[0] instanceof Ext.menu.CheckItem ? this.createAction.items[0].setChecked(b) : this.createAction.items[0].toggle(b)
      };
      j.push(new Ext.menu.CheckItem({
        groupClass: null,
        text: this.pointText,
        group: f,
        iconCls: "gxp-icon-point",
        listeners: {
          checkchange: k.createDelegate(this, [OpenLayers.Handler.Point], 2)
        }
      }), new Ext.menu.CheckItem({
        groupClass: null,
        text: this.lineText,
        group: f,
        iconCls: "gxp-icon-line",
        listeners: {
          checkchange: k.createDelegate(this, [OpenLayers.Handler.Path], 2)
        }
      }), new Ext.menu.CheckItem({
        groupClass: null,
        text: this.polygonText,
        group: f,
        iconCls: "gxp-icon-polygon",
        listeners: {
          checkchange: k.createDelegate(this, [OpenLayers.Handler.Polygon], 2)
        }
      }));
      g.push(new GeoExt.Action(Ext.apply(h, {
        menu: new Ext.menu.Menu({
          items: j
        })
      })))
    } else g.push(new GeoExt.Action(h));
    g.push(new GeoExt.Action({
      tooltip: this.editFeatureActionTip,
      text: this.initialConfig.editFeatureActionText,
      menuText: this.initialConfig.editFeatureActionText,
      iconCls: this.iconClsEdit,
      disabled: !0,
      toggleGroup: f,
      group: f,
      groupClass: null,
      enableToggle: !0,
      allowDepress: !0,
      control: this.selectControl,
      deactivateOnDisable: !0,
      map: this.target.mapPanel.map,
      listeners: {
        checkchange: this.onItemCheckchange,
        scope: this
      }
    }));
    this.createAction = g[0];
    this.editAction = g[1];
    if (this.splitButton) this.splitButton = new Ext.SplitButton({
      menu: {
        items: [Ext.apply(new Ext.menu.CheckItem(g[0]), {
          text: this.createFeatureActionText
        }), Ext.apply(new Ext.menu.CheckItem(g[1]), {
          text: this.editFeatureActionText
        })]
      },
      disabled: !0,
      buttonText: this.splitButtonText,
      tooltip: this.splitButtonTooltip,
      iconCls: this.iconClsAdd,
      enableToggle: !0,
      toggleGroup: this.toggleGroup,
      allowDepress: !0,
      handler: function(a) {
        a.pressed && a.menu.items.itemAt(this.activeIndex).setChecked(!0)
      },
      scope: this,
      listeners: {
        toggle: function(a, b) {
          b || a.menu.items.each(function(a) {
            a.setChecked(!1)
          })
        },
        render: function(a) {
          Ext.ButtonToggleMgr.register(a)
        }
      }
    }), g = [this.splitButton];
    g = gxp.plugins.FeatureEditor.superclass.addActions.call(this, g);
    c.on("layerchange", this.onLayerChange, this);
    (f = this.getSnappingAgent()) && f.registerEditor(this);
    return g
  },
  onItemCheckchange: function(a, b) {
    if (this.splitButton) this.activeIndex = a.ownerCt.items.indexOf(a), this.splitButton.toggle(b), b && this.splitButton.setIconClass(a.iconCls)
  },
  getFeatureManager: function() {
    var a = this.target.tools[this.featureManager];
    if (!a) throw Error("Unable to access feature manager by id: " + this.featureManager);
    return a
  },
  getSnappingAgent: function() {
    var a, b = this.snappingAgent;
    if (b && (a = this.target.tools[b], !a)) throw Error("Unable to locate snapping agent with id: " + b);
    return a
  },
  setHandler: function(a, b) {
    var c = this.drawControl,
        d = c.active;
    d && c.deactivate();
    c.handler.destroy();
    c.handler = new a(c, c.callbacks, Ext.apply(c.handlerOptions, {
      multi: b
    }));
    d && c.activate()
  },
  enableOrDisable: function() {
    var a = !this.schema;
    this.splitButton && this.splitButton.setDisabled(a);
    this.createAction.setDisabled(a);
    this.editAction.setDisabled(a);
    return a
  },
  onLayerChange: function(a, b, c) {
    this.schema = c;
    if (this.enableOrDisable()) this.fireEvent("layereditable", this, b, !1);
    else {
      var c = this.createAction,
          d = {
          Point: OpenLayers.Handler.Point,
          Line: OpenLayers.Handler.Path,
          Curve: OpenLayers.Handler.Path,
          Polygon: OpenLayers.Handler.Polygon,
          Surface: OpenLayers.Handler.Polygon
          },
          e = a.geometryType && a.geometryType.replace("Multi", "");
      (d = e && d[e]) ? (this.setHandler(d, e != a.geometryType), c.enable()) : !0 === this.supportAbstractGeometry && a.geometryType && "Geometry" === a.geometryType ? c.enable() : c.disable();
      this.fireEvent("layereditable", this, b, !0)
    }
  },
  select: function(a) {
    this.selectControl.unselectAll(this.popup && this.popup.editing && {
      except: this.popup.feature
    });
    this.selectControl.select(a)
  }
});
Ext.preg(gxp.plugins.FeatureEditor.prototype.ptype, gxp.plugins.FeatureEditor);
Ext.namespace("gxp.plugins");
gxp.plugins.FormFieldHelp = Ext.extend(Object, {
  ptype: "gxp_formfieldhelp",
  helpText: null,
  dismissDelay: 5E3,
  constructor: function(a) {
    Ext.apply(this, a)
  },
  init: function(a) {
    this.target = a;
    a.on("render", this.showHelp, this)
  },
  showHelp: function() {
    var a;
    a = this.target.label ? this.target.label : this.target.getEl();
    Ext.QuickTips.register({
      target: a,
      dismissDelay: this.dismissDelay,
      text: this.helpText
    })
  }
});
Ext.preg(gxp.plugins.FormFieldHelp.prototype.ptype, gxp.plugins.FormFieldHelp);
Ext.namespace("gxp.plugins");
gxp.plugins.FeatureEditorForm = Ext.extend(Ext.FormPanel, {
  ptype: "gxp_editorform",
  xtype: "gxp_editorform",
  feature: null,
  schema: null,
  fieldConfig: null,
  fields: null,
  excludeFields: null,
  propertyNames: null,
  readOnly: null,
  monitorValid: !0,
  initComponent: function() {
    this.defaults = Ext.apply(this.defaults || {}, {
      readOnly: !0
    });
    this.listeners = {
      clientvalidation: function(a, b) {
        b && this.getForm().isDirty() && (Ext.apply(this.feature.attributes, this.getForm().getFieldValues()), this.featureEditor.setFeatureState(this.featureEditor.getDirtyState()))
      },
      scope: this
    };
    gxp.plugins.FeatureEditorForm.superclass.initComponent.call(this);
    if (!this.excludeFields) this.excludeFields = [];
    var a = [],
        b, c;
    for (b = 0, c = this.excludeFields.length; b < c; ++b) a[b] = this.excludeFields[b].toLowerCase();
    this.excludeFields = a;
    var d = this.fields ? this.fields.join(",").toUpperCase().split(",") : [],
        e = {};
    if (this.schema) this.schema.each(function(a) {
      var b = a.get("name"),
          c = b.toLowerCase();
      this.fields && -1 == d.indexOf(b.toUpperCase()) && this.excludeFields.push(c);
      if (-1 == this.excludeFields.indexOf(c) && !a.get("type").match(/^[^:]*:?((Multi)?(Point|Line|Polygon|Curve|Surface|Geometry))/)) {
        var f = GeoExt.form.recordToField(a),
            a = this.getAnnotationsFromSchema(a);
        if (null !== a) {
          if (a.helpText) {
            if (!f.plugins) f.plugins = [];
            f.plugins.push({
              ptype: "gxp_formfieldhelp",
              helpText: a.helpText
            })
          }
          if (a.label) f.fieldLabel = a.label
        }
        f.fieldLabel = this.propertyNames ? this.propertyNames[b] || f.fieldLabel : f.fieldLabel;
        this.fieldConfig && this.fieldConfig[b] && Ext.apply(f, this.fieldConfig[b]);
        if (void 0 !== this.feature.attributes[b]) f.value =
        this.feature.attributes[b];
        if (f.value && "checkbox" == f.xtype) f.checked = Ext.isBoolean(f.value) ? f.value : "true" === f.value;
        if (f.value && "gxp_datefield" == f.xtype) f.value = new Date(1E3 * f.value);
        if (f.value && "datefield" == f.xtype) f.format = "Y-m-d", f.value = Date.parseDate(f.value.replace(/Z$/, ""), "Y-m-d");
        "combo" === f.xtype && Ext.applyIf(f, {
          store: new Ext.data.ArrayStore({
            fields: ["id", "value"],
            data: f.comboStoreData
          }),
          displayField: "value",
          valueField: "id",
          mode: "local",
          triggerAction: "all"
        });
        e[c] = f
      }
    }, this);
    else {
      var e = {},
          f;
      for (f in this.feature.attributes) a = f.toLowerCase(), this.fields && -1 == d.indexOf(f.toUpperCase()) && this.excludeFields.push(a), -1 === this.excludeFields.indexOf(a) && (e[a] = {
        xtype: "textfield",
        fieldLabel: this.propertyNames ? this.propertyNames[f] || f : f,
        name: f,
        value: this.feature.attributes[f]
      })
    }
    this.add(this.reorderFields(e))
  },
  reorderFields: function(a) {
    var b = [];
    if (this.fields) for (var c = 0, d = this.fields.length; c < d; ++c) a[this.fields[c].toLowerCase()] && b.push(a[this.fields[c].toLowerCase()]);
    else
    for (c in a) b.push(a[c]);
    return b
  },
  init: function(a) {
    this.featureEditor = a;
    this.featureEditor.on("startedit", this.onStartEdit, this);
    this.featureEditor.on("stopedit", this.onStopEdit, this);
    this.featureEditor.on("canceledit", this.onCancelEdit, this);
    this.featureEditor.add(this);
    this.featureEditor.doLayout()
  },
  destroy: function() {
    this.featureEditor.un("startedit", this.onStartEdit, this);
    this.featureEditor.un("stopedit", this.onStopEdit, this);
    this.featureEditor.un("canceledit", this.onCancelEdit, this);
    this.featureEditor = null;
    gxp.plugins.FeatureEditorForm.superclass.destroy.call(this)
  },
  onStartEdit: function() {
    this.getForm().items.each(function(a) {
      !0 !== this.readOnly && a.setReadOnly(!1)
    }, this)
  },
  onStopEdit: function() {
    this.getForm().items.each(function(a) {
      a.setReadOnly(!0)
    })
  },
  onCancelEdit: function(a, b) {
    if (b) {
      var c = this.getForm(),
          d;
      for (d in b.attributes) {
        var e = c.findField(d);
        e && e.setValue(b.attributes[d])
      }
    }
  }
});
Ext.override(gxp.plugins.FeatureEditorForm, gxp.plugins.SchemaAnnotations);
Ext.preg(gxp.plugins.FeatureEditorForm.prototype.ptype, gxp.plugins.FeatureEditorForm);
Ext.reg(gxp.plugins.FeatureEditorForm.prototype.xtype, gxp.plugins.FeatureEditorForm);
Ext.namespace("gxp.grid");
gxp.grid.FeatureGrid = Ext.extend(Ext.grid.GridPanel, {
  map: null,
  ignoreFields: null,
  includeFields: null,
  layer: null,
  columnsSortable: !0,
  columnMenuDisabled: !1,
  initComponent: function() {
    this.ignoreFields = ["feature", "state", "fid"].concat(this.ignoreFields);
    if (this.store) {
      if (this.cm = this.createColumnModel(this.store), this.map) this.layer = new OpenLayers.Layer.Vector(this.id + "_layer"), this.map.addLayer(this.layer)
    } else this.store = new Ext.data.Store, this.cm = new Ext.grid.ColumnModel({
      columns: []
    });
    if (this.layer) this.sm =
    this.sm || new GeoExt.grid.FeatureSelectionModel({
      layerFromStore: !1,
      layer: this.layer
    }), this.store instanceof GeoExt.data.FeatureStore && this.store.bind(this.layer);
    if (!this.dateFormat) this.dateFormat = Ext.form.DateField.prototype.format;
    if (!this.timeFormat) this.timeFormat = Ext.form.TimeField.prototype.format;
    gxp.grid.FeatureGrid.superclass.initComponent.call(this)
  },
  onDestroy: function() {
    this.initialConfig && this.initialConfig.map && !this.initialConfig.layer && (this.layer.destroy(), delete this.layer);
    gxp.grid.FeatureGrid.superclass.onDestroy.apply(this, arguments)
  },
  setStore: function(a, b) {
    if (b) this.schema = b;
    a ? (this.store instanceof GeoExt.data.FeatureStore && this.store.unbind(), this.layer && (this.layer.destroyFeatures(), a.bind(this.layer)), this.reconfigure(a, this.createColumnModel(a))) : this.reconfigure(new Ext.data.Store, new Ext.grid.ColumnModel({
      columns: []
    }))
  },
  getColumns: function(a) {
    function b(a) {
      return function(b) {
        var c = b;
        "string" == typeof b && (c = Date.parseDate(b.replace(/Z$/, ""), "c"));
        return c ? c.format(a) : b
      }
    }
    var c = [],
        d = this.customEditors || {},
        e = this.customRenderers || {},
        f, g, h, j, k;
    (this.schema || a.fields).each(function(a) {
      if (this.schema) switch (f = a.get("name"), g = a.get("type").split(":").pop(), j = null, g) {
      case "date":
        j = this.dateFormat;
        break;
      case "datetime":
        j = j ? j : this.dateFormat + " " + this.timeFormat;
        h = void 0;
        k = b(j);
        break;
      case "boolean":
        h = "booleancolumn";
        break;
      case "string":
        h = "gridcolumn";
        break;
      default:
        h = "numbercolumn"
      } else f = a.name;
      if (-1 === this.ignoreFields.indexOf(f) && (null === this.includeFields || 0 <= this.includeFields.indexOf(f))) c.push(Ext.apply({
        dataIndex: f,
        hidden: this.fieldVisibility ? !this.fieldVisibility[f] : !1,
        header: this.propertyNames ? this.propertyNames[f] || f : f,
        sortable: this.columnsSortable,
        menuDisabled: this.columnMenuDisabled,
        xtype: h,
        editor: d[f] || {
          xtype: "textfield"
        },
        format: j,
        renderer: e[f] || (h ? void 0 : k)
      }, this.columnConfig ? this.columnConfig[f] : null))
    }, this);
    return c
  },
  createColumnModel: function(a) {
    a = this.getColumns(a);
    return new Ext.grid.ColumnModel(a)
  }
});
Ext.reg("gxp_featuregrid", gxp.grid.FeatureGrid);
Ext.namespace("gxp.plugins");
gxp.plugins.FeatureGrid = Ext.extend(gxp.plugins.ClickableFeatures, {
  ptype: "gxp_featuregrid",
  schema: null,
  showTotalResults: !1,
  alwaysDisplayOnMap: !1,
  displayMode: "all",
  autoExpand: !1,
  autoCollapse: !1,
  selectOnMap: !1,
  displayFeatureText: "Display on map",
  firstPageTip: "First page",
  previousPageTip: "Previous page",
  zoomPageExtentTip: "Zoom to page extent",
  nextPageTip: "Next page",
  lastPageTip: "Last page",
  totalMsg: "Features {1} to {2} of {0}",
  displayTotalResults: function() {
    var a = this.target.tools[this.featureManager];
    !0 === this.showTotalResults && this.displayItem.setText(null !== a.numberOfFeatures ? String.format(this.totalMsg, a.numberOfFeatures, a.pageIndex * a.maxFeatures + Math.min(a.numberOfFeatures, 1), Math.min((a.pageIndex + 1) * a.maxFeatures, a.numberOfFeatures)) : "")
  },
  addOutput: function(a) {
    function b() {
      var a = c.schema,
          b = ["feature", "state", "fid"];
      a && a.each(function(a) {
        0 == a.get("type").indexOf("gml:") && b.push(a.get("name"))
      });
      f.ignoreFields = b;
      f.setStore(c.featureStore, a);
      c.featureStore || (c.paging && (f.lastPageButton.disable(), f.nextPageButton.disable(), f.firstPageButton.disable(), f.prevPageButton.disable(), f.zoomToPageButton.disable()), this.displayTotalResults())
    }
    var c = this.target.tools[this.featureManager],
        d = this.target.mapPanel.map,
        e;
    this.selectControl = new OpenLayers.Control.SelectFeature(c.featureLayer, this.initialConfig.controlOptions);
    if (this.selectOnMap) {
      if (this.autoLoadFeature || c.paging && c.pagingType === gxp.plugins.FeatureManager.QUADTREE_PAGING) this.selectControl.events.on({
        activate: function() {
          d.events.register("click", this, this.noFeatureClick)
        },
        deactivate: function() {
          d.events.unregister("click", this, this.noFeatureClick)
        },
        scope: this
      });
      d.addControl(this.selectControl);
      e = {
        selectControl: this.selectControl
      }
    } else e = {
      selectControl: this.selectControl,
      singleSelect: !1,
      autoActivateControl: !1,
      listeners: {
        beforerowselect: function() {
          if (window.event && "contextmenu" == window.event.type || this.selectControl.active || c.featureStore.getModifiedRecords().length) return !1
        },
        scope: this
      }
    };
    this.displayItem = new Ext.Toolbar.TextItem({});
    var a =
    Ext.apply({
      xtype: "gxp_featuregrid",
      border: !1,
      sm: new GeoExt.grid.FeatureSelectionModel(e),
      autoScroll: !0,
      columnMenuDisabled: !! c.paging,
      bbar: (c.paging ? [{
        iconCls: "x-tbar-page-first",
        ref: "../firstPageButton",
        tooltip: this.firstPageTip,
        disabled: !0,
        handler: function() {
          c.setPage({
            index: 0
          })
        }
      }, {
        iconCls: "x-tbar-page-prev",
        ref: "../prevPageButton",
        tooltip: this.previousPageTip,
        disabled: !0,
        handler: function() {
          c.previousPage()
        }
      }, {
        iconCls: "gxp-icon-zoom-to",
        ref: "../zoomToPageButton",
        tooltip: this.zoomPageExtentTip,
        disabled: !0,
        hidden: c.pagingType !== gxp.plugins.FeatureManager.QUADTREE_PAGING || c.autoZoomPage,
        handler: function() {
          var a = c.getPageExtent();
          null !== a && d.zoomToExtent(a)
        }
      }, {
        iconCls: "x-tbar-page-next",
        ref: "../nextPageButton",
        tooltip: this.nextPageTip,
        disabled: !0,
        handler: function() {
          c.nextPage()
        }
      }, {
        iconCls: "x-tbar-page-last",
        ref: "../lastPageButton",
        tooltip: this.lastPageTip,
        disabled: !0,
        handler: function() {
          c.setPage({
            index: "last"
          })
        }
      }, {
        xtype: "tbspacer",
        width: 10
      },
      this.displayItem] : []).concat(["->"].concat(!this.alwaysDisplayOnMap ? [{
        text: this.displayFeatureText,
        enableToggle: !0,
        toggleHandler: function(a, b) {
          this.selectOnMap && this.selectControl[b ? "activate" : "deactivate"]();
          c[b ? "showLayer" : "hideLayer"](this.id, this.displayMode)
        },
        scope: this
      }] : [])),
      contextMenu: new Ext.menu.Menu({
        items: []
      })
    }, a || {}),
        f = gxp.plugins.FeatureGrid.superclass.addOutput.call(this, a);
    f.on({
      added: function(a, b) {
        function d() {
          this.displayTotalResults();
          this.selectOnMap && this.selectControl.deactivate();
          this.autoCollapse && "function" == typeof b.collapse && b.collapse()
        }
        c.on({
          query: function(a, c) {
            c && c.getCount() ? (this.displayTotalResults(), this.selectOnMap && this.selectControl.activate(), this.autoExpand && "function" == typeof b.expand && b.expand()) : d.call(this)
          },
          layerchange: d,
          clearfeatures: d,
          scope: this
        })
      },
      contextmenu: function(a) {
        if (0 < f.contextMenu.items.getCount()) {
          var b = f.getView().findRowIndex(a.getTarget());
          !1 !== b && (f.getSelectionModel().selectRow(b), f.contextMenu.showAt(a.getXY()), a.stopEvent())
        }
      },
      scope: this
    });
    (this.alwaysDisplayOnMap || !0 === this.selectOnMap && "selected" === this.displayMode) && c.showLayer(this.id, this.displayMode);
    c.paging && c.on({
      beforesetpage: function() {
        f.zoomToPageButton.disable()
      },
      setpage: function(a, b, c, d, e, n) {
        a = 0 < n;
        f.zoomToPageButton.setDisabled(!a);
        b = a && 0 !== e;
        f.firstPageButton.setDisabled(!b);
        f.prevPageButton.setDisabled(!b);
        e = a && e !== n - 1;
        f.lastPageButton.setDisabled(!e);
        f.nextPageButton.setDisabled(!e)
      },
      scope: this
    });
    c.featureStore && b.call(this);
    c.on("layerchange", b, this);
    return f
  }
});
Ext.preg(gxp.plugins.FeatureGrid.prototype.ptype, gxp.plugins.FeatureGrid);
Ext.namespace("gxp.plugins");
gxp.plugins.FeatureManager = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_featuremanager",
  maxFeatures: 100,
  paging: !0,
  pagingType: null,
  autoZoomPage: !1,
  autoSetLayer: !0,
  autoLoadFeatures: !1,
  layerRecord: null,
  featureStore: null,
  hitCountProtocol: null,
  featureLayer: null,
  schema: null,
  geometryType: null,
  toolsShowingLayer: null,
  selectStyle: null,
  style: null,
  pages: null,
  page: null,
  numberOfFeatures: null,
  numPages: null,
  pageIndex: null,
  constructor: function(a) {
    this.addEvents("beforequery", "query", "beforelayerchange", "layerchange", "beforesetpage", "setpage", "beforeclearfeatures", "clearfeatures", "beforesave", "exception");
    if (a && !a.pagingType) this.pagingType = gxp.plugins.FeatureManager.QUADTREE_PAGING;
    if (a && a.layer) this.autoSetLayer = !1;
    gxp.plugins.FeatureManager.superclass.constructor.apply(this, arguments)
  },
  init: function(a) {
    gxp.plugins.FeatureManager.superclass.init.apply(this, arguments);
    this.toolsShowingLayer = {};
    this.style = {
      all: new OpenLayers.Style(null, {
        rules: [new OpenLayers.Rule({
          symbolizer: this.initialConfig.symbolizer || {
            Point: {
              pointRadius: 4,
              graphicName: "square",
              fillColor: "white",
              fillOpacity: 1,
              strokeWidth: 1,
              strokeOpacity: 1,
              strokeColor: "#333333"
            },
            Line: {
              strokeWidth: 4,
              strokeOpacity: 1,
              strokeColor: "#ff9933"
            },
            Polygon: {
              strokeWidth: 2,
              strokeOpacity: 1,
              strokeColor: "#ff6633",
              fillColor: "white",
              fillOpacity: 0.3
            }
          }
        })]
      }),
      selected: new OpenLayers.Style(null, {
        rules: [new OpenLayers.Rule({
          symbolizer: {
            display: "none"
          }
        })]
      })
    };
    this.featureLayer = new OpenLayers.Layer.Vector(this.id, {
      displayInLayerSwitcher: !1,
      visibility: !1,
      styleMap: new OpenLayers.StyleMap({
        select: Ext.applyIf(Ext.apply({
          display: ""
        }, this.selectStyle), OpenLayers.Feature.Vector.style.select),
        vertex: this.style.all
      }, {
        extendDefault: !1
      })
    });
    this.target.on({
      ready: function() {
        this.target.mapPanel.map.addLayer(this.featureLayer)
      },
      scope: this
    });
    this.on({
      beforedestroy: function() {
        this.target.mapPanel.map.removeLayer(this.featureLayer)
      },
      scope: this
    })
  },
  activate: function() {
    if (gxp.plugins.FeatureManager.superclass.activate.apply(this, arguments)) {
      if (this.autoSetLayer) this.target.on("beforelayerselectionchange", this.setLayer, this);
      this.layer && this.target.createLayerRecord(Ext.apply({}, this.layer), this.setLayer, this);
      this.on("layerchange", this.setSchema, this);
      return !0
    }
  },
  deactivate: function() {
    if (gxp.plugins.FeatureManager.superclass.deactivate.apply(this, arguments)) return this.autoSetLayer && this.target.un("beforelayerselectionchange", this.setLayer, this), this.un("layerchange", this.setSchema, this), this.setLayer(), !0
  },
  getPageExtent: function() {
    return this.pagingType === gxp.plugins.FeatureManager.QUADTREE_PAGING ? this.page.extent : this.featureStore.layer.getDataExtent()
  },
  setLayer: function(a) {
    var b =
    this.fireEvent("beforelayerchange", this, a);
    if (!1 !== b) {
      if (a) this.featureLayer.projection = a.getLayer().projection;
      if (a !== this.layerRecord) this.clearFeatureStore(), (this.layerRecord = a) ? !0 === this.autoLoadFeatures ? this.loadFeatures() : this.setFeatureStore() : this.fireEvent("layerchange", this, null)
    }
    return b
  },
  setSchema: function(a, b, c) {
    this.schema = c
  },
  showLayer: function(a, b) {
    this.toolsShowingLayer[a] = b || "all";
    this.setLayerDisplay()
  },
  hideLayer: function(a) {
    delete this.toolsShowingLayer[a];
    this.setLayerDisplay()
  },
  setLayerDisplay: function() {
    var a = this.visible(),
        b = this.target.mapPanel.map;
    a ? (a = this.style[a], a !== this.featureLayer.styleMap.styles["default"] && (this.featureLayer.styleMap.styles["default"] = a, this.featureLayer.redraw()), this.featureLayer.setVisibility(!0), b.events.on({
      addlayer: this.raiseLayer,
      scope: this
    })) : this.featureLayer.map && (this.featureLayer.setVisibility(!1), b.events.un({
      addlayer: this.raiseLayer,
      scope: this
    }))
  },
  visible: function() {
    var a = !1,
        b;
    for (b in this.toolsShowingLayer)"all" != a && (a = this.toolsShowingLayer[b]);
    return a
  },
  raiseLayer: function() {
    var a = this.featureLayer && this.featureLayer.map;
    a && a.setLayerIndex(this.featureLayer, a.layers.length)
  },
  loadFeatures: function(a, b, c) {
    if (!1 !== this.fireEvent("beforequery", this, a, b, c)) {
      this.filter = a;
      this.pages = null;
      if (b) {
        var d = this;
        d._activeQuery && d.un("query", d._activeQuery);
        this.on("query", d._activeQuery = function(a, f) {
          delete d._activeQuery;
          this.un("query", arguments.callee, this);
          f.getCount();
          0 == f.getCount() ? b.call(c, []) : this.featureLayer.events.register("featuresadded", this, function(a) {
            this.featureLayer.events.unregister("featuresadded", this, arguments.callee);
            b.call(c, a.features)
          })
        }, this, {
          single: !0
        })
      }
      this.featureStore ? (this.featureStore.setOgcFilter(a), this.paging ? this.setPage() : this.featureStore.load()) : (this.paging && this.on("layerchange", function(a, b, c) {
        c && (this.un("layerchange", arguments.callee, this), this.setPage())
      }, this), this.setFeatureStore(a, !this.paging))
    }
  },
  clearFeatures: function() {
    var a = this.featureStore;
    if (a && !1 !== this.fireEvent("beforeclearfeatures", this)) a.removeAll(), this.fireEvent("clearfeatures", this), a = a.proxy, a.abortRequest(), a.protocol.response && a.protocol.response.abort()
  },
  getProjection: function(a) {
    var b = this.target.mapPanel.map.getProjectionObject();
    (a = a.getLayer().projection) && a.equals(b) && (b = a);
    return b
  },
  setFeatureStore: function(a, b) {
    var c = this.layerRecord,
        d = this.target.getSource(c);
    d && d instanceof gxp.plugins.WMSSource ? d.getSchema(c, function(d) {
      if (!1 === d) this.clearFeatureStore();
      else {
        var f = [],
            g, h = /gml:((Multi)?(Point|Line|Polygon|Curve|Surface|Geometry)).*/,
            j = {
            "xsd:boolean": "boolean",
            "xsd:int": "int",
            "xsd:integer": "int",
            "xsd:short": "int",
            "xsd:long": "int",
            "xsd:date": "date",
            "xsd:string": "string",
            "xsd:float": "float",
            "xsd:double": "float"
            };
        d.each(function(a) {
          var b = h.exec(a.get("type"));
          if (b) g = a.get("name"), this.geometryType = b[1];
          else {
            b = j[a.get("type")];
            a = {
              name: a.get("name"),
              type: j[b]
            };
            if ("date" == b) a.dateFormat = "Y-m-d\\Z";
            f.push(a)
          }
        }, this);
        var k = {
          srsName: this.getProjection(c).getCode(),
          url: d.url,
          featureType: d.reader.raw.featureTypes[0].typeName,
          featureNS: d.reader.raw.targetNamespace,
          geometryName: g
        };
        this.hitCountProtocol = new OpenLayers.Protocol.WFS(Ext.apply({
          version: "1.1.0",
          readOptions: {
            output: "object"
          },
          resultType: "hits",
          filter: a
        }, k));
        this.featureStore = new gxp.data.WFSFeatureStore(Ext.apply({
          fields: f,
          proxy: {
            protocol: {
              outputFormat: this.format,
              multi: this.multi
            }
          },
          maxFeatures: this.maxFeatures,
          layer: this.featureLayer,
          ogcFilter: a,
          autoLoad: b,
          autoSave: !1,
          listeners: {
            beforewrite: function(a, b, c, d) {
              this.fireEvent("beforesave", this, a, d.params)
            },
            write: function() {
              this.redrawMatchingLayers(c)
            },
            load: function(a) {
              this.fireEvent("query", this, a, this.filter)
            },
            scope: this
          }
        }, k))
      }
      this.fireEvent("layerchange", this, c, d)
    }, this) : (this.clearFeatureStore(), this.fireEvent("layerchange", this, c, !1))
  },
  redrawMatchingLayers: function(a) {
    var b = a.get("name"),
        c = a.get("source");
    this.target.mapPanel.layers.each(function(a) {
      a.get("source") === c && a.get("name") === b && a.getLayer().redraw(!0)
    })
  },
  clearFeatureStore: function() {
    if (this.featureStore) this.featureStore.removeAll(), this.featureStore.unbind(), this.featureStore.destroy(), this.geometryType = this.featureStore = this.numberOfFeatures = null
  },
  processPage: function(a, b, c, d) {
    var b = b || {},
        e = b.lonLat ? null : b.index,
        f = b.next,
        g = this.pages,
        h = this.pages.indexOf(a);
    this.setPageFilter(a);
    var j = f ? h == (g.indexOf(f) || g.length) - 1 : !0,
        k = b.lonLat ? a.extent.containsLonLat(b.lonLat) : !0;
    k && a.numFeatures && a.numFeatures <= this.maxFeatures ? c.call(this, a) : k && (h == e || j) && this.hitCountProtocol.read({
      callback: function(h) {
        var j = e,
            k = b.lonLat;
        f && (j = (g.indexOf(f) || g.length) - 1);
        !j && k && a.extent.containsLonLat(k) && (j = g.indexOf(a));
        a.numFeatures = h.numberOfFeatures;
        this.page || (a.numFeatures > this.maxFeatures ? this.createLeaf(a, Ext.applyIf({
          index: j,
          next: f
        }, b), c, d) : 0 == a.numFeatures && 1 < g.length ? (g.remove(a), !1 === b.allowEmpty && this.setPage({
          index: e % this.pages.length,
          allowEmpty: !1
        })) : this.pages.indexOf(a) == j && c.call(this, a))
      },
      scope: this
    })
  },
  createLeaf: function(a, b, c, d) {
    b = b || {};
    this.layerRecord.getLayer();
    var e = this.pages.indexOf(a);
    this.pages.remove(a);
    for (var f = a.extent, g = f.getCenterLonLat(), a = [f.left, g.lon, f.left, g.lon], h = [g.lat, g.lat, f.bottom, f.bottom], j = [g.lon, f.right, g.lon, f.right], f = [f.top, f.top, g.lat, g.lat], k, g = 3; 0 <= g; --g) k = {
      extent: new OpenLayers.Bounds(a[g], h[g], j[g], f[g])
    }, this.pages.splice(e, 0, k), this.processPage(k, b, c, d)
  },
  getPagingExtent: function(a) {
    var b = this.layerRecord.getLayer(),
        c = this.getSpatialFilter();
    if ((a = c ? c.value : this.target.mapPanel.map[a]()) && b.maxExtent && a.containsBounds(b.maxExtent)) a = b.maxExtent;
    return a
  },
  getSpatialFilter: function() {
    var a;
    if (this.filter instanceof OpenLayers.Filter.Spatial && this.filter.type === OpenLayers.Filter.Spatial.BBOX) a = this.filter;
    else if (this.filter instanceof OpenLayers.Filter.Logical && this.filter.type === OpenLayers.Filter.Logical.AND) for (var b, c = this.filter.filters.length - 1; 0 <= c; --c) if (b = this.filter.filters[c], b instanceof OpenLayers.Filter.Spatial && b.type === OpenLayers.Filter.Spatial.BBOX) {
      a = b;
      break
    }
    return a
  },
  setPageFilter: function(a) {
    a.extent ? (a = new OpenLayers.Filter.Spatial({
      type: OpenLayers.Filter.Spatial.BBOX,
      property: this.featureStore.geometryName,
      value: a.extent
    }), a = this.filter ? new OpenLayers.Filter.Logical({
      type: OpenLayers.Filter.Logical.AND,
      filters: [this.filter, a]
    }) : a) : a = this.filter;
    this.featureStore.setOgcFilter(a);
    this.hitCountProtocol.filter = a;
    return this.hitCountProtocol.options.filter = a
  },
  nextPage: function(a, b) {
    var c;
    this.pagingType === gxp.plugins.FeatureManager.QUADTREE_PAGING ? (c = this.page, this.page = null, c = (this.pages.indexOf(c) + 1) % this.pages.length) : c = this.pageIndex + 1 % this.numPages;
    this.setPage({
      index: c,
      allowEmpty: !1
    }, a, b)
  },
  previousPage: function(a) {
    var b;
    this.pagingType === gxp.plugins.FeatureManager.QUADTREE_PAGING ? (b = this.pages.indexOf(this.page) - 1, 0 > b && (b = this.pages.length - 1)) : (b = this.pageIndex - 1, 0 > b && (b = this.numPages - 1));
    this.setPage({
      index: b,
      allowEmpty: !1,
      next: this.page
    }, a)
  },
  setPage: function(a, b, c) {
    if (this.pagingType === gxp.plugins.FeatureManager.QUADTREE_PAGING) if (this.filter instanceof OpenLayers.Filter.FeatureId) this.featureStore.load({
      callback: function() {
        b && b.call(c)
      }
    });
    else {
      if (!1 !== this.fireEvent("beforesetpage", this, a, b, c)) {
        if (!a) {
          var d = this.getPagingExtent("getExtent"),
              d = new OpenLayers.LonLat(d.left, d.top),
              e = this.target.mapPanel.map.getMaxExtent();
          e.containsLonLat(d, !0) || (d = new OpenLayers.LonLat(e.left, e.top));
          a = {
            lonLat: d,
            allowEmpty: !1
          }
        }
        a.index = a.index || 0;
        if ("last" == a.index) a.index = this.pages.length - 1, a.next = this.pages[0];
        this.page = null;
        if (this.pages) {
          if (a.lonLat) for (d = this.pages.length - 1; 0 <= d; --d) if (this.pages[d].extent.containsLonLat(a.lonLat)) {
            a.index = d;
            break
          }
        } else this.layerRecord.getLayer(), this.pages = [{
          extent: this.getPagingExtent("getMaxExtent")
        }], a.index =
        0;
        this.processPage(this.pages[a.index], a, function(d) {
          var e = this.target.mapPanel.map;
          this.page = d;
          this.setPageFilter(d);
          this.autoZoomPage && !e.getExtent().containsLonLat(d.extent.getCenterLonLat()) && e.zoomToExtent(d.extent);
          e = this.pages.indexOf(this.page);
          this.fireEvent("setpage", this, a, b, c, e, this.pages.length);
          this.featureStore.load({
            callback: function() {
              b && b.call(c, d)
            }
          })
        }, this)
      }
    } else if (!1 !== this.fireEvent("beforesetpage", this, a, b, c)) if (a) {
      if (null != a.index) this.pageIndex = "last" === a.index ? this.numPages - 1 : "first" === a.index ? 0 : a.index, d = this.pageIndex * this.maxFeatures, this.fireEvent("setpage", this, a, b, c, this.pageIndex, this.numPages), this.featureStore.load({
        startIndex: d,
        callback: function() {
          b && b.call(c)
        }
      })
    } else this.hitCountProtocol.read({
      filter: this.filter,
      callback: function(d) {
        this.numberOfFeatures = d.numberOfFeatures;
        this.numPages = Math.ceil(this.numberOfFeatures / this.maxFeatures);
        this.pageIndex = 0;
        this.fireEvent("setpage", this, a, b, c, this.pageIndex, this.numPages);
        this.featureStore.load({
          output: "object",
          callback: function() {
            b && b.call(c)
          }
        })
      },
      scope: this
    })
  }
});
gxp.plugins.FeatureManager.QUADTREE_PAGING = 0;
gxp.plugins.FeatureManager.WFS_PAGING = 1;
Ext.preg(gxp.plugins.FeatureManager.prototype.ptype, gxp.plugins.FeatureManager);
Ext.namespace("gxp.plugins");
gxp.plugins.FeatureToField = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_featuretofield",
  format: "GeoJSON",
  addActions: function() {
    var a = this.target.tools[this.featureManager],
        b, c = new OpenLayers.Format[this.format];
    a.featureLayer.events.on({
      featureselected: function(a) {
        this.target.field.setValue(c.write(a.feature));
        b = a.feature
      },
      featureunselected: function() {
        this.target.field.setValue("");
        b = null
      },
      scope: this
    });
    a.on("layerchange", function() {
      a.featureStore && a.featureStore.on("save", function(a, e, f) {
        if (f.create) for (a =
        f.create.length - 1; 0 <= a; --a) e = f.create[a].feature, e == b && this.target.field.setValue(c.write(e))
      }, this)
    });
    return gxp.plugins.FeatureToField.superclass.addActions.apply(this, arguments)
  }
});
Ext.preg(gxp.plugins.FeatureToField.prototype.ptype, gxp.plugins.FeatureToField);
Ext.ns("gxp.plugins");
gxp.plugins.GeoRowEditor = Ext.ux && Ext.ux.grid && Ext.ux.grid.RowEditor && Ext.extend(Ext.ux.grid.RowEditor, {
  drawControl: null,
  modifyControl: null,
  addPointGeometryText: "Add point",
  addLineGeometryText: "Add line",
  addPolygonGeometryText: "Add polygon",
  modifyGeometryText: "Modify geometry",
  deleteGeometryText: "Delete geometry",
  deleteGeometryTooltip: "Delete the existing geometry",
  addGeometryTooltip: "Add a new geometry by clicking in the map",
  modifyGeometryTooltip: "Modify an existing geometry",
  beforedestroy: function() {
    this.geometry =
    this.feature = this.modifyControl = this.drawControl = null;
    gxp.plugins.GeoRowEditor.superclass.beforedestroy.apply(this, arguments)
  },
  handleAddGeometry: function(a) {
    this.feature = this.record.get("feature");
    if (null === this.drawControl) this.drawControl = new OpenLayers.Control.DrawFeature(new OpenLayers.Layer.Vector, a, {
      eventListeners: {
        featureadded: function(a) {
          this.drawControl.deactivate();
          var b = this.feature;
          b.modified = Ext.apply(b.modified || {}, {
            geometry: null
          });
          b.geometry = a.feature.geometry.clone();
          if (b.state !== OpenLayers.State.INSERT) b.state = OpenLayers.State.UPDATE;
          this.record.set("state", b.state)
        },
        scope: this
      }
    }), this.feature.layer.map.addControl(this.drawControl);
    else {
      var b = this.drawControl;
      b.handler.destroy();
      b.handler = new a(b, b.callbacks, b.handlerOptions)
    }
    this.drawControl.activate()
  },
  handleAddPointGeometry: function() {
    this.handleAddGeometry(OpenLayers.Handler.Point)
  },
  handleAddLineGeometry: function() {
    this.handleAddGeometry(OpenLayers.Handler.Path)
  },
  handleAddPolygonGeometry: function() {
    this.handleAddGeometry(OpenLayers.Handler.Polygon)
  },
  handleDeleteGeometry: function() {
    this.feature = this.record.get("feature");
    this.feature.layer.eraseFeatures([this.feature]);
    this.feature.geometry.destroy();
    this.feature.geometry = null;
    this.feature.state = OpenLayers.State.UPDATE;
    this.btns.items.get(2).show();
    this.btns.items.get(3).show();
    this.btns.items.get(4).show();
    this.btns.items.get(5).hide();
    this.btns.items.get(6).hide()
  },
  handleModifyGeometry: function() {
    this.feature = this.record.get("feature");
    if (null === this.modifyControl) this.modifyControl = new OpenLayers.Control.ModifyFeature(this.feature.layer, {
      standalone: !0
    }), this.feature.layer.map.addControl(this.modifyControl);
    this.modifyControl.activate();
    this.modifyControl.selectFeature(this.feature)
  },
  stopEditing: function(a) {
    this.editing = !1;
    if (this.isVisible()) if (!1 === a || !this.isValid()) this.hide(), this.fireEvent("canceledit", this, !1 === a);
    else {
      for (var a = {}, b = this.record, c = !1, d = this.grid.colModel, e = this.items.items, f = 0, g = d.getColumnCount(); f < g; f++) if (!d.isHidden(f)) {
        var h = d.getDataIndex(f);
        if (!Ext.isEmpty(h)) {
          var j = b.data[h],
              k = this.postEditValue(e[f].getValue(), j, b, h);
          "" + j !== "" + k && (a[h] = k, c = !0)
        }
      }
      if ((c = c || this.feature && this.feature.state === OpenLayers.State.UPDATE) && !1 !== this.fireEvent("validateedit", this, a, b, this.rowIndex)) b.beginEdit(), Ext.iterate(a, function(a, c) {
        b.set(a, c)
      }), b.endEdit(), this.fireEvent("afteredit", this, a, b, this.rowIndex);
      this.hide()
    }
  },
  init: function(a) {
    gxp.plugins.GeoRowEditor.superclass.init.apply(this, arguments);
    this.on("afteredit", function() {
      this.grid.store.save();
      null !== this.modifyControl && this.modifyControl.deactivate();
      null !== this.drawControl && this.drawControl.deactivate()
    }, this);
    this.on("canceledit", function() {
      this.grid.store.rejectChanges();
      if (this.feature) this.feature.geometry && this.feature.layer.eraseFeatures([this.feature]), this.feature.geometry = this.geometry, this.feature.layer.drawFeature(this.feature);
      null !== this.modifyControl && this.modifyControl.deactivate();
      null !== this.drawControl && this.drawControl.deactivate()
    }, this);
    this.on("beforeedit", function(a, c) {
      var d = this.grid;
      d.getView();
      d = d.store.getAt(c);
      this.geometry = d.get("feature").geometry && d.get("feature").geometry.clone();
      this.btns && (null === d.get("feature").geometry ? (this.btns.items.get(6).hide(), this.btns.items.get(5).hide(), this.btns.items.get(2).show(), this.btns.items.get(3).show(), this.btns.items.get(4).show()) : (this.btns.items.get(2).hide(), this.btns.items.get(3).hide(), this.btns.items.get(4).hide(), this.btns.items.get(5).show(), this.btns.items.get(6).show()));
      return !0
    }, this)
  },
  onRender: function() {
    Ext.ux.grid.RowEditor.superclass.onRender.apply(this, arguments);
    this.el.swallowEvent(["keydown", "keyup", "keypress"]);
    this.btns = new Ext.Panel({
      baseCls: "x-plain",
      cls: "x-btns",
      elements: "body",
      layout: "table",
      width: 6 * this.minButtonWidth + 5 * this.frameWidth + 10 * this.buttonPad,
      items: [{
        ref: "saveBtn",
        itemId: "saveBtn",
        xtype: "button",
        text: this.saveText,
        width: this.minButtonWidth,
        handler: this.stopEditing.createDelegate(this, [!0])
      }, {
        xtype: "button",
        text: this.cancelText,
        width: this.minButtonWidth,
        handler: this.stopEditing.createDelegate(this, [!1])
      }, {
        xtype: "button",
        text: this.addPointGeometryText,
        tooltip: this.addGeometryTooltip,
        handler: this.handleAddPointGeometry,
        scope: this,
        hidden: null !== this.record.get("feature").geometry,
        width: 1.5 * this.minButtonWidth
      }, {
        xtype: "button",
        text: this.addLineGeometryText,
        tooltip: this.addGeometryTooltip,
        handler: this.handleAddLineGeometry,
        scope: this,
        hidden: null !== this.record.get("feature").geometry,
        width: 1.5 * this.minButtonWidth
      }, {
        xtype: "button",
        text: this.addPolygonGeometryText,
        tooltip: this.addGeometryTooltip,
        handler: this.handleAddPolygonGeometry,
        scope: this,
        hidden: null !== this.record.get("feature").geometry,
        width: 1.5 * this.minButtonWidth
      }, {
        xtype: "button",
        text: this.modifyGeometryText,
        tooltip: this.modifyGeometryTooltip,
        handler: this.handleModifyGeometry,
        scope: this,
        hidden: null === this.record.get("feature").geometry,
        width: 1.5 * this.minButtonWidth
      }, {
        xtype: "button",
        text: this.deleteGeometryText,
        tooltip: this.deleteGeometryTooltip,
        handler: this.handleDeleteGeometry,
        scope: this,
        hidden: null === this.record.get("feature").geometry,
        width: 1.5 * this.minButtonWidth
      }]
    });
    this.fireEvent("buttonrender", this, this.btns);
    this.btns.render(this.bwrap)
  }
});
gxp.plugins.GeoRowEditor && Ext.preg("gxp_georoweditor", gxp.plugins.GeoRowEditor);
Ext.namespace("gxp.plugins");
gxp.plugins.StyleWriter = Ext.extend(Ext.util.Observable, {
  deletedStyles: null,
  constructor: function(a) {
    this.initialConfig = a;
    Ext.apply(this, a);
    this.deletedStyles = [];
    gxp.plugins.StyleWriter.superclass.constructor.apply(this, arguments)
  },
  init: function(a) {
    this.target = a;
    a.stylesStore.on({
      remove: function(a, c) {
        var d = c.get("name");
        c.get("name") === d && this.deletedStyles.push(d)
      },
      scope: this
    });
    a.on({
      beforesaved: this.write,
      scope: this
    })
  },
  write: function(a) {
    a.stylesStore.commitChanges();
    a.fireEvent("saved", a, a.selectedStyle.get("name"))
  }
});
Ext.namespace("gxp.plugins");
gxp.plugins.GeoServerStyleWriter = Ext.extend(gxp.plugins.StyleWriter, {
  baseUrl: "/geoserver/rest",
  constructor: function(a) {
    this.initialConfig = a;
    Ext.apply(this, a);
    gxp.plugins.GeoServerStyleWriter.superclass.constructor.apply(this, arguments)
  },
  write: function(a) {
    delete this._failed;
    var a = a || {},
        b = [],
        c = this.target.stylesStore;
    c.each(function(a) {
      (a.phantom || -1 !== c.modified.indexOf(a)) && this.writeStyle(a, b)
    }, this);
    var d = function() {
      var b = this.target;
      if (!0 !== this._failed) {
        this.deleteStyles();
        for (var c = this.target.stylesStore.getModifiedRecords(), d = c.length - 1; 0 <= d; --d) c[d].phantom = !1;
        b.stylesStore.commitChanges();
        a.success && a.success.call(a.scope);
        b.fireEvent("saved", b, b.selectedStyle.get("name"))
      } else b.fireEvent("savefailed", b, b.selectedStyle.get("name"))
    };
    0 < b.length ? gxp.util.dispatch(b, function() {
      this.assignStyles(a.defaultStyle, d)
    }, this) : this.assignStyles(a.defaultStyle, d)
  },
  writeStyle: function(a, b) {
    var c = a.get("userStyle").name;
    b.push(function(b) {
      Ext.Ajax.request({
        method: !0 === a.phantom ? "POST" : "PUT",
        url: this.baseUrl + "/styles" + (!0 === a.phantom ? "" : "/" + c + ".xml"),
        headers: {
          "Content-Type": "application/vnd.ogc.sld+xml; charset=UTF-8"
        },
        xmlData: this.target.createSLD({
          userStyles: [c]
        }),
        failure: function() {
          this._failed = !0;
          b.call(this)
        },
        success: !0 === a.phantom ?
        function() {
          Ext.Ajax.request({
            method: "POST",
            url: this.baseUrl + "/layers/" + this.target.layerRecord.get("name") + "/styles.json",
            jsonData: {
              style: {
                name: c
              }
            },
            failure: function() {
              this._failed = !0;
              b.call(this)
            },
            success: b,
            scope: this
          })
        } : b,
        scope: this
      })
    })
  },
  assignStyles: function(a, b) {
    var c = [];
    this.target.stylesStore.each(function(b) {
      !a && !0 === b.get("userStyle").isDefault && (a = b.get("name"));
      b.get("name") !== a && -1 === this.deletedStyles.indexOf(b.id) && c.push({
        name: b.get("name")
      })
    }, this);
    Ext.Ajax.request({
      method: "PUT",
      url: this.baseUrl + "/layers/" + this.target.layerRecord.get("name") + ".json",
      jsonData: {
        layer: {
          defaultStyle: {
            name: a
          },
          styles: 0 < c.length ? {
            style: c
          } : {},
          enabled: !0
        }
      },
      success: b,
      failure: function() {
        this._failed = !0;
        b.call(this)
      },
      scope: this
    })
  },
  deleteStyles: function() {
    for (var a = 0, b = this.deletedStyles.length; a < b; ++a) Ext.Ajax.request({
      method: "DELETE",
      url: this.baseUrl + "/styles/" + this.deletedStyles[a] + "?purge=true"
    });
    this.deletedStyles = []
  }
});
Ext.preg("gxp_geoserverstylewriter", gxp.plugins.GeoServerStyleWriter);
Ext.namespace("gxp.plugins");
gxp.plugins.GoogleEarth = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_googleearth",
  timeout: 7E3,
  menuText: "3D Viewer",
  tooltip: "Switch to 3D Viewer",
  tooltipMap: "Switch back to normal map view",
  constructor: function(a) {
    gxp.plugins.GoogleEarth.superclass.constructor.apply(this, arguments)
  },
  addActions: function() {
    return gxp.plugins.GoogleEarth.superclass.addActions.apply(this, [
      [{
        menuText: this.menuText,
        enableToggle: !0,
        iconCls: "gxp-icon-googleearth",
        tooltip: this.tooltip,
        toggleHandler: function(a, b) {
          this.actions[0].each(function(a) {
            a.toggle && a.toggle(!1, !0)
          });
          this.togglePanelDisplay(b)
        },
        scope: this
      }]
    ])
  },
  togglePanelDisplay: function(a) {
    var b = this.target.mapPanel.ownerCt,
        c = b && b.getLayout();
    if (c && c instanceof Ext.layout.CardLayout) if (!0 === a) gxp.plugins.GoogleEarth.loader.onLoad({
      callback: function() {
        c.setActiveItem(1);
        this.actions[0].enable();
        this.actions[0].items[0].setTooltip(this.tooltipMap);
        this.actions[0].each(function(a) {
          a.toggle && a.toggle(!0, !0)
        })
      },
      scope: this
    });
    else c.setActiveItem(0), this.actions[0].items[0].setTooltip(this.tooltip)
  },
  getHost: function() {
    return window.location.host.split(":").shift() + ":" + (window.location.port || "80")
  }
});
gxp.plugins.GoogleEarth.loader = new(Ext.extend(Ext.util.Observable, {
  ready: !(!window.google || !window.google.earth),
  loading: !1,
  constructor: function() {
    this.addEvents("ready", "failure");
    return Ext.util.Observable.prototype.constructor.apply(this, arguments)
  },
  onScriptLoad: function() {
    var a = gxp.plugins.GoogleEarth.loader;
    if (!a.ready) a.ready = !0, a.loading = !1, a.fireEvent("ready")
  },
  onLoad: function(a) {
    if (this.ready) window.setTimeout(function() {
      a.callback.call(a.scope)
    }, 0);
    else if (this.loading) this.on({
      ready: a.callback,
      failure: a.errback || Ext.emptyFn,
      scope: a.scope
    });
    else this.loadScript(a)
  },
  loadScript: function(a) {
    function b() {
      document.getElementsByTagName("head")[0].appendChild(d)
    }
    window.google && delete google.loader;
    var c = {
      autoload: Ext.encode({
        modules: [{
          name: "earth",
          version: "1",
          callback: "gxp.plugins.GoogleEarth.loader.onScriptLoad"
        }]
      })
    },
        d = document.createElement("script");
    d.src = "//www.google.com/jsapi?" + Ext.urlEncode(c);
    c = a.timeout || gxp.plugins.GoogleSource.prototype.timeout;
    window.setTimeout(function() {
      gxp.plugins.GoogleEarth.loader.ready || (this.fireEvent("failure"), this.unload())
    }.createDelegate(this), c);
    this.on({
      ready: a.callback,
      failure: a.errback || Ext.emptyFn,
      scope: a.scope
    });
    this.loading = !0;
    if (document.body) b();
    else Ext.onReady(b);
    this.script = d
  },
  unload: function() {
    this.purgeListeners();
    this.script && (document.getElementsByTagName("head")[0].removeChild(this.script), delete this.script);
    this.ready = this.loading = !1;
    delete google.loader;
    delete google.earth
  }
}));
Ext.preg(gxp.plugins.GoogleEarth.prototype.ptype, gxp.plugins.GoogleEarth);
Ext.namespace("gxp.form");
gxp.form.GoogleGeocoderComboBox = Ext.extend(Ext.form.ComboBox, {
  xtype: "gxp_googlegeocodercombo",
  queryDelay: 100,
  valueField: "viewport",
  displayField: "address",
  initComponent: function() {
    this.disabled = !0;
    if (window.google && google.maps) window.setTimeout(function() {
      this.prepGeocoder()
    }.createDelegate(this), 0);
    else {
      if (!gxp.plugins || !gxp.plugins.GoogleSource) throw Error("The gxp.form.GoogleGeocoderComboBox requires the gxp.plugins.GoogleSource or the Google Maps V3 API to be loaded.");
      gxp.plugins.GoogleSource.loader.onLoad({
        otherParams: gxp.plugins.GoogleSource.prototype.otherParams,
        callback: this.prepGeocoder,
        errback: function() {
          throw Error("The Google Maps script failed to load within the given timeout.");
        },
        scope: this
      })
    }
    this.store = new Ext.data.JsonStore({
      root: "results",
      fields: [{
        name: "address",
        type: "string"
      }, {
        name: "location"
      }, {
        name: "viewport"
      }],
      autoLoad: !1
    });
    this.on({
      focus: function() {
        this.clearValue()
      },
      scope: this
    });
    return gxp.form.GoogleGeocoderComboBox.superclass.initComponent.apply(this, arguments)
  },
  prepGeocoder: function() {
    var a = new google.maps.Geocoder,
        b = {};
    b[Ext.data.Api.actions.read] = !0;
    var b = new Ext.data.DataProxy({
      api: b
    }),
        c = this,
        d = function() {
        var a = this.bounds;
        a && (a instanceof OpenLayers.Bounds && (a = a.toArray()), a = new google.maps.LatLngBounds(new google.maps.LatLng(a[1], a[0]), new google.maps.LatLng(a[3], a[2])));
        return a
        }.createDelegate(this);
    b.doRequest = function(b, f, g, h, j, k, l) {
      a.geocode({
        address: g.query,
        bounds: d()
      }, function(a, d) {
        var f;
        if (d === google.maps.GeocoderStatus.OK || d === google.maps.GeocoderStatus.ZERO_RESULTS) try {
          a = c.transformResults(a), f = h.readRecords({
            results: a
          })
        } catch (g) {
          c.fireEvent("exception", c, "response", b, l, d, g)
        } else c.fireEvent("exception", c, "remote", b, l, d, null);
        f ? j.call(k, f, l, !0) : j.call(k, null, l, !1)
      })
    };
    this.store.proxy = b;
    !0 != this.initialConfig.disabled && this.enable()
  },
  transformResults: function(a) {
    var b = a.length,
        c = Array(b),
        d, e, f, g;
    for (i = 0; i < b; ++i) d = a[i], e = d.geometry.location, f = d.geometry.viewport, g = f.getNorthEast(), f = f.getSouthWest(), c[i] = {
      address: d.formatted_address,
      location: new OpenLayers.LonLat(e.lng(), e.lat()),
      viewport: new OpenLayers.Bounds(f.lng(), f.lat(), g.lng(), g.lat())
    };
    return c
  }
});
Ext.reg(gxp.form.GoogleGeocoderComboBox.prototype.xtype, gxp.form.GoogleGeocoderComboBox);
Ext.namespace("gxp.plugins");
gxp.plugins.GoogleGeocoder = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_googlegeocoder",
  updateField: "viewport",
  init: function(a) {
    var b = new gxp.form.GoogleGeocoderComboBox(Ext.apply({
      listeners: {
        select: this.onComboSelect,
        scope: this
      }
    }, this.outputConfig)),
        c = a.mapPanel.map.restrictedExtent;
    if (c && !b.bounds) a.on({
      ready: function() {
        b.bounds = c.clone().transform(a.mapPanel.map.getProjectionObject(), new OpenLayers.Projection("EPSG:4326"))
      }
    });
    this.combo = b;
    return gxp.plugins.GoogleGeocoder.superclass.init.apply(this, arguments)
  },
  addOutput: function() {
    return gxp.plugins.GoogleGeocoder.superclass.addOutput.call(this, this.combo)
  },
  onComboSelect: function(a, b) {
    if (this.updateField) {
      var c = this.target.mapPanel.map,
          d = b.get(this.updateField).clone().transform(new OpenLayers.Projection("EPSG:4326"), c.getProjectionObject());
      d instanceof OpenLayers.Bounds ? c.zoomToExtent(d, !0) : c.setCenter(d)
    }
  }
});
Ext.preg(gxp.plugins.GoogleGeocoder.prototype.ptype, gxp.plugins.GoogleGeocoder);
Ext.namespace("gxp.plugins");
gxp.plugins.GoogleSource = Ext.extend(gxp.plugins.LayerSource, {
  ptype: "gxp_googlesource",
  timeout: 7E3,
  title: "Google Layers",
  roadmapAbstract: "Show street map",
  satelliteAbstract: "Show satellite imagery",
  hybridAbstract: "Show imagery with street names",
  terrainAbstract: "Show street map with terrain",
  otherParams: "sensor=false",
  constructor: function(a) {
    this.config = a;
    gxp.plugins.GoogleSource.superclass.constructor.apply(this, arguments)
  },
  createStore: function() {
    gxp.plugins.GoogleSource.loader.onLoad({
      otherParams: this.otherParams,
      timeout: this.timeout,
      callback: this.syncCreateStore,
      errback: function() {
        delete this.store;
        this.fireEvent("failure", this, "The Google Maps script failed to load within the provided timeout (" + this.timeout / 1E3 + " s).")
      },
      scope: this
    })
  },
  syncCreateStore: function() {
    var a = {
      ROADMAP: {
        "abstract": this.roadmapAbstract,
        MAX_ZOOM_LEVEL: 20
      },
      SATELLITE: {
        "abstract": this.satelliteAbstract
      },
      HYBRID: {
        "abstract": this.hybridAbstract
      },
      TERRAIN: {
        "abstract": this.terrainAbstract,
        MAX_ZOOM_LEVEL: 15
      }
    },
        b = [],
        c, d;
    for (c in a) d = google.maps.MapTypeId[c], b.push(new OpenLayers.Layer.Google("Google " + d.replace(/\w/, function(a) {
      return a.toUpperCase()
    }), {
      type: d,
      typeName: c,
      MAX_ZOOM_LEVEL: a[c].MAX_ZOOM_LEVEL,
      maxExtent: new OpenLayers.Bounds(-2.003750834E7, -2.003750834E7, 2.003750834E7, 2.003750834E7),
      restrictedExtent: new OpenLayers.Bounds(-2.003750834E7, -2.003750834E7, 2.003750834E7, 2.003750834E7),
      projection: this.projection
    }));
    this.store = new GeoExt.data.LayerStore({
      layers: b,
      fields: [{
        name: "source",
        type: "string"
      }, {
        name: "name",
        type: "string",
        mapping: "typeName"
      }, {
        name: "abstract",
        type: "string"
      }, {
        name: "group",
        type: "string",
        defaultValue: "background"
      }, {
        name: "fixed",
        type: "boolean",
        defaultValue: !0
      }, {
        name: "selected",
        type: "boolean"
      }]
    });
    this.store.each(function(b) {
      b.set("abstract", a[b.get("name")]["abstract"])
    });
    this.fireEvent("ready", this)
  },
  createLayerRecord: function(a) {
    var b, c = function(b) {
      return b.get("name") === a.name
    };
    if (-1 == this.target.mapPanel.layers.findBy(c)) {
      b = this.store.getAt(this.store.findBy(c)).clone();
      c = b.getLayer();
      a.title && (c.setName(a.title), b.set("title", a.title));
      if ("visibility" in a) c.visibility = a.visibility;
      b.set("selected", a.selected || !1);
      b.set("source", a.source);
      b.set("name", a.name);
      "group" in a && b.set("group", a.group);
      b.commit()
    }
    return b
  }
});
gxp.plugins.GoogleSource.loader = new(Ext.extend(Ext.util.Observable, {
  ready: !(!window.google || !google.maps),
  loading: !1,
  constructor: function() {
    this.addEvents("ready", "failure");
    return Ext.util.Observable.prototype.constructor.apply(this, arguments)
  },
  onScriptLoad: function() {
    var a = gxp.plugins.GoogleSource.loader;
    if (!a.ready) a.ready = !0, a.loading = !1, a.fireEvent("ready")
  },
  onLoad: function(a) {
    if (this.ready) window.setTimeout(function() {
      a.callback.call(a.scope)
    }, 0);
    else if (this.loading) this.on({
      ready: a.callback,
      failure: a.errback || Ext.emptyFn,
      scope: a.scope
    });
    else this.loadScript(a)
  },
  loadScript: function(a) {
    function b() {
      document.getElementsByTagName("head")[0].appendChild(d)
    }
    var c = {
      autoload: Ext.encode({
        modules: [{
          name: "maps",
          version: 3.3,
          nocss: "true",
          callback: "gxp.plugins.GoogleSource.loader.onScriptLoad",
          other_params: a.otherParams
        }]
      })
    },
        d = document.createElement("script");
    d.src = "http://www.google.com/jsapi?" + Ext.urlEncode(c);
    var e = a.errback || Ext.emptyFn,
        c = a.timeout || gxp.plugins.GoogleSource.prototype.timeout;
    window.setTimeout(function() {
      if (!gxp.plugins.GoogleSource.loader.ready) this.ready = this.loading = !1, document.getElementsByTagName("head")[0].removeChild(d), e.call(a.scope), this.fireEvent("failure"), this.purgeListeners()
    }.createDelegate(this), c);
    this.on({
      ready: a.callback,
      scope: a.scope
    });
    this.loading = !0;
    if (document.body) b();
    else Ext.onReady(b)
  }
}));
Ext.preg(gxp.plugins.GoogleSource.prototype.ptype, gxp.plugins.GoogleSource);
Ext.namespace("gxp.plugins");
gxp.plugins.LayerTree = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_layertree",
  shortTitle: "Layers",
  rootNodeText: "Layers",
  overlayNodeText: "Overlays",
  baseNodeText: "Base Layers",
  groups: null,
  defaultGroup: "default",
  treeNodeUI: null,
  constructor: function(a) {
    gxp.plugins.LayerTree.superclass.constructor.apply(this, arguments);
    if (!this.groups) this.groups = {
      "default": this.overlayNodeText,
      background: {
        title: this.baseNodeText,
        exclusive: !0
      }
    };
    if (!this.treeNodeUI) this.treeNodeUI = Ext.extend(GeoExt.tree.LayerNodeUI, new GeoExt.tree.TreeNodeUIEventMixin)
  },
  addOutput: function(a) {
    a = Ext.apply(this.createOutputConfig(), a || {});
    a = gxp.plugins.LayerTree.superclass.addOutput.call(this, a);
    a.on({
      contextmenu: this.handleTreeContextMenu,
      beforemovenode: this.handleBeforeMoveNode,
      scope: this
    });
    return a
  },
  createOutputConfig: function() {
    var a = new Ext.tree.TreeNode({
      text: this.rootNodeText,
      expanded: !0,
      isTarget: !1,
      allowDrop: !1
    }),
        b;
    if (this.initialConfig.loader && this.initialConfig.loader.baseAttrs) b = this.initialConfig.loader.baseAttrs;
    var c = this.defaultGroup,
        d = this,
        e, f, g;
    for (g in this.groups) e = "string" == typeof this.groups[g] ? {
      title: this.groups[g]
    } : this.groups[g], f = e.exclusive, a.appendChild(new GeoExt.tree.LayerContainer(Ext.apply({
      text: e.title,
      iconCls: "gxp-folder",
      expanded: !0,
      group: g == this.defaultGroup ? void 0 : g,
      loader: new GeoExt.tree.LayerLoader({
        baseAttrs: f ? Ext.apply({
          checkedGroup: Ext.isString(f) ? f : g
        }, b) : b,
        store: this.target.mapPanel.layers,
        filter: function(a) {
          return function(b) {
            return (b.get("group") || c) == a && !0 == b.getLayer().displayInLayerSwitcher
          }
        }(g),
        createNode: function(a) {
          d.configureLayerNode(this, a);
          return GeoExt.tree.LayerLoader.prototype.createNode.apply(this, arguments)
        }
      }),
      singleClickExpand: !0,
      allowDrag: !1,
      listeners: {
        append: function(a, b) {
          b.expand()
        }
      }
    }, e)));
    return {
      xtype: "treepanel",
      root: a,
      rootVisible: !1,
      shortTitle: this.shortTitle,
      border: !1,
      enableDD: !0,
      selModel: new Ext.tree.DefaultSelectionModel({
        listeners: {
          beforeselect: this.handleBeforeSelect,
          scope: this
        }
      }),
      contextMenu: new Ext.menu.Menu({
        items: []
      })
    }
  },
  configureLayerNode: function(a, b) {
    b.uiProvider = this.treeNodeUI;
    var c = b.layer,
        d = b.layerStore;
    if (c && d) {
      var e = d.getAt(d.findBy(function(a) {
        return a.getLayer() === c
      }));
      if (e) {
        b.qtip = e.get("abstract");
        if (!e.get("queryable") && !b.iconCls) b.iconCls = "gxp-tree-rasterlayer-icon";
        if (e.get("fixed")) b.allowDrag = !1;
        b.listeners = {
          rendernode: function(a) {
            e === this.target.selectedLayer && a.select();
            this.target.on("layerselectionchange", function(b) {
              !this.selectionChanging && b === e && a.select()
            }, this)
          },
          scope: this
        }
      }
    }
  },
  handleBeforeSelect: function(a, b) {
    var c = !0,
        d = b && b.layer,
        e;
    if (d) c = b.layerStore, e = c.getAt(c.findBy(function(a) {
      return a.getLayer() === d
    }));
    this.selectionChanging = !0;
    c = this.target.selectLayer(e);
    this.selectionChanging = !1;
    return c
  },
  handleTreeContextMenu: function(a, b) {
    if (a && a.layer) {
      a.select();
      var c = a.getOwnerTree();
      if (c.getSelectionModel().getSelectedNode() === a) c = c.contextMenu, c.contextNode = a, 0 < c.items.getCount() && c.showAt(b.getXY())
    }
  },
  handleBeforeMoveNode: function(a, b, c, d) {
    if (c !== d) a = d.loader.store, c = a.findBy(function(a) {
      return a.getLayer() === b.layer
    }), a.getAt(c).set("group", d.attributes.group)
  }
});
Ext.preg(gxp.plugins.LayerTree.prototype.ptype, gxp.plugins.LayerTree);
Ext.namespace("gxp.plugins");
gxp.plugins.LayerManager = Ext.extend(gxp.plugins.LayerTree, {
  ptype: "gxp_layermanager",
  baseNodeText: "Base Maps",
  createOutputConfig: function() {
    var a = gxp.plugins.LayerManager.superclass.createOutputConfig.apply(this, arguments);
    Ext.applyIf(a, Ext.apply({
      cls: "gxp-layermanager-tree",
      lines: !1,
      useArrows: !0,
      plugins: [{
        ptype: "gx_treenodecomponent"
      }]
    }, this.treeConfig));
    return a
  },
  configureLayerNode: function(a, b) {
    gxp.plugins.LayerManager.superclass.configureLayerNode.apply(this, arguments);
    var c;
    OpenLayers.Layer.WMS && b.layer instanceof OpenLayers.Layer.WMS ? c = "gx_wmslegend" : OpenLayers.Layer.Vector && b.layer instanceof OpenLayers.Layer.Vector && (c = "gx_vectorlegend");
    if (c) {
      var d;
      if (a && a.baseAttrs && a.baseAttrs.baseParams) d = a.baseAttrs.baseParams;
      Ext.apply(b, {
        component: {
          xtype: c,
          hidden: !b.layer.getVisibility(),
          baseParams: Ext.apply({
            transparent: !0,
            format: "image/png",
            legend_options: "fontAntiAliasing:true;fontSize:11;fontName:Arial"
          }, d),
          layerRecord: this.target.mapPanel.layers.getByLayer(b.layer),
          showTitle: !1,
          cls: "legend"
        }
      })
    }
  }
});
Ext.preg(gxp.plugins.LayerManager.prototype.ptype, gxp.plugins.LayerManager);
Ext.namespace("gxp.plugins");
gxp.plugins.LayerProperties = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_layerproperties",
  menuText: "Layer Properties",
  toolTip: "Layer Properties",
  constructor: function(a) {
    gxp.plugins.LayerProperties.superclass.constructor.apply(this, arguments);
    if (!this.outputConfig) this.outputConfig = {
      width: 325,
      autoHeight: !0
    }
  },
  addActions: function() {
    var a = gxp.plugins.LayerProperties.superclass.addActions.apply(this, [{
      menuText: this.menuText,
      iconCls: "gxp-icon-layerproperties",
      disabled: !0,
      tooltip: this.toolTip,
      handler: function() {
        this.removeOutput();
        this.addOutput()
      },
      scope: this
    }]),
        b = a[0];
    this.target.on("layerselectionchange", function(a) {
      b.setDisabled(!a || !a.get("properties"))
    }, this);
    return a
  },
  addOutput: function(a) {
    var a = a || {},
        b = this.target.selectedLayer;
    this.outputConfig.title = (this.initialConfig.outputConfig || {}).title || this.menuText + ": " + b.get("title");
    this.outputConfig.shortTitle = b.get("title");
    var c = b.get("properties") || "gxp_layerpanel",
        d = this.layerPanelConfig;
    d && d[c] && Ext.apply(a, d[c]);
    a = gxp.plugins.LayerProperties.superclass.addOutput.call(this, Ext.apply({
      xtype: c,
      authorized: this.target.isAuthorized(),
      layerRecord: b,
      source: this.target.getSource(b),
      defaults: {
        style: "padding: 10px",
        autoHeight: this.outputConfig.autoHeight
      }
    }, a));
    a.on({
      added: function(a) {
        if (!this.outputTarget) a.on("afterrender", function() {
          a.ownerCt.ownerCt.center()
        }, this, {
          single: !0
        })
      },
      scope: this
    });
    return a
  }
});
Ext.preg(gxp.plugins.LayerProperties.prototype.ptype, gxp.plugins.LayerProperties);
Ext.namespace("gxp.plugins");
gxp.plugins.Legend = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_legend",
  menuText: "Legend",
  tooltip: "Show Legend",
  actionTarget: null,
  constructor: function(a) {
    gxp.plugins.Legend.superclass.constructor.apply(this, arguments);
    if (!this.outputConfig) this.outputConfig = {
      width: 300,
      height: 400
    };
    Ext.applyIf(this.outputConfig, {
      title: this.menuText
    })
  },
  addActions: function() {
    return gxp.plugins.Legend.superclass.addActions.apply(this, [
      [{
        menuText: this.menuText,
        iconCls: "gxp-icon-legend",
        tooltip: this.tooltip,
        handler: function() {
          this.removeOutput();
          this.addOutput(this.outputConfig)
        },
        scope: this
      }]
    ])
  },
  getLegendPanel: function() {
    return this.output[0]
  },
  addOutput: function(a) {
    return gxp.plugins.Legend.superclass.addOutput.call(this, Ext.apply({
      xtype: "gx_legendpanel",
      ascending: !1,
      border: !1,
      hideMode: "offsets",
      layerStore: this.target.mapPanel.layers,
      defaults: {
        cls: "gxp-legend-item"
      }
    }, a))
  }
});
Ext.preg(gxp.plugins.Legend.prototype.ptype, gxp.plugins.Legend);
Ext.namespace("gxp.plugins");
gxp.plugins.LoadingIndicator = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_loadingindicator",
  onlyShowOnFirstLoad: !1,
  loadingMapMessage: "Loading Map...",
  layerCount: 0,
  busyMask: null,
  init: function(a) {
    var b = a instanceof GeoExt.MapPanel ? a.map : a.mapPanel.map;
    b.events.register("preaddlayer", this, function(a) {
      var d = a.layer;
      if (d instanceof OpenLayers.Layer.WMS) d.events.on({
        loadstart: function() {
          this.layerCount++;
          if (!this.busyMask) this.busyMask = new Ext.LoadMask(b.div, {
            msg: this.loadingMapMessage
          });
          this.busyMask.show();
          !0 === this.onlyShowOnFirstLoad && d.events.unregister("loadstart", this, arguments.callee)
        },
        loadend: function() {
          this.layerCount--;
          0 === this.layerCount && this.busyMask.hide();
          !0 === this.onlyShowOnFirstLoad && d.events.unregister("loadend", this, arguments.callee)
        },
        scope: this
      })
    })
  },
  destroy: function() {
    Ext.destroy(this.busyMask);
    this.busyMask = null;
    gxp.plugins.LoadingIndicator.superclass.destroy.apply(this, arguments)
  }
});
Ext.preg(gxp.plugins.LoadingIndicator.prototype.ptype, gxp.plugins.LoadingIndicator);
Ext.namespace("gxp.plugins");
gxp.plugins.MapBoxSource = Ext.extend(gxp.plugins.LayerSource, {
  ptype: "gxp_mapboxsource",
  title: "MapBox Layers",
  blueMarbleTopoBathyJanTitle: "Blue Marble Topography & Bathymetry (January)",
  blueMarbleTopoBathyJulTitle: "Blue Marble Topography & Bathymetry (July)",
  blueMarbleTopoJanTitle: "Blue Marble Topography (January)",
  blueMarbleTopoJulTitle: "Blue Marble Topography (July)",
  controlRoomTitle: "Control Room",
  geographyClassTitle: "Geography Class",
  naturalEarthHypsoTitle: "Natural Earth Hypsometric",
  naturalEarthHypsoBathyTitle: "Natural Earth Hypsometric & Bathymetry",
  naturalEarth1Title: "Natural Earth I",
  naturalEarth2Title: "Natural Earth II",
  worldDarkTitle: "World Dark",
  worldLightTitle: "World Light",
  worldGlassTitle: "World Glass",
  worldPrintTitle: "World Print",
  createStore: function() {
    for (var a = {
      projection: "EPSG:900913",
      numZoomLevels: 19,
      serverResolutions: [156543.03390625, 78271.516953125, 39135.7584765625, 19567.87923828125, 9783.939619140625, 4891.9698095703125, 2445.9849047851562, 1222.9924523925781, 611.4962261962891, 305.74811309814453, 152.87405654907226, 76.43702827453613, 38.218514137268066, 19.109257068634033, 9.554628534317017, 4.777314267158508, 2.388657133579254, 1.194328566789627, 0.5971642833948135],
      buffer: 1
    }, b = [{
      name: "blue-marble-topo-bathy-jan",
      numZoomLevels: 9
    }, {
      name: "blue-marble-topo-bathy-jul",
      numZoomLevels: 9
    }, {
      name: "blue-marble-topo-jan",
      numZoomLevels: 9
    }, {
      name: "blue-marble-topo-jul",
      numZoomLevels: 9
    }, {
      name: "control-room",
      numZoomLevels: 9
    }, {
      name: "geography-class",
      numZoomLevels: 9
    }, {
      name: "natural-earth-hypso",
      numZoomLevels: 7
    }, {
      name: "natural-earth-hypso-bathy",
      numZoomLevels: 7
    }, {
      name: "natural-earth-1",
      numZoomLevels: 7
    }, {
      name: "natural-earth-2",
      numZoomLevels: 7
    }, {
      name: "world-dark",
      numZoomLevels: 12
    }, {
      name: "world-light",
      numZoomLevels: 12
    }, {
      name: "world-glass",
      numZoomLevels: 11
    }, {
      name: "world-print",
      numZoomLevels: 10
    }], c = b.length, d = Array(c), e, f = 0; f < c; ++f) e = b[f], d[f] = new OpenLayers.Layer.TMS(this[OpenLayers.String.camelize(e.name) + "Title"], ["http://a.tiles.mapbox.com/mapbox/", "http://b.tiles.mapbox.com/mapbox/", "http://c.tiles.mapbox.com/mapbox/", "http://d.tiles.mapbox.com/mapbox/"], OpenLayers.Util.applyDefaults({
      attribution: /^world/.test(name) ? "<a href='http://mapbox.com'>MapBox</a> | Some Data &copy; OSM CC-BY-SA | <a href='http://mapbox.com/tos'>Terms of Service</a>" : "<a href='http://mapbox.com'>MapBox</a> | <a href='http://mapbox.com/tos'>Terms of Service</a>",
      type: "png",
      tileOrigin: new OpenLayers.LonLat(-2.003750834E7, -2.003750834E7),
      layername: e.name,
      "abstract": '<div class="thumb-mapbox thumb-mapbox-' + e.name + '"></div>',
      numZoomLevels: e.numZoomLevels
    }, a));
    this.store = new GeoExt.data.LayerStore({
      layers: d,
      fields: [{
        name: "source",
        type: "string"
      }, {
        name: "name",
        type: "string",
        mapping: "layername"
      }, {
        name: "abstract",
        type: "string"
      }, {
        name: "group",
        type: "string"
      }, {
        name: "fixed",
        type: "boolean"
      }, {
        name: "selected",
        type: "boolean"
      }]
    });
    this.fireEvent("ready", this)
  },
  createLayerRecord: function(a) {
    var b, c = this.store.findExact("name", a.name);
    if (-1 < c) {
      b = this.store.getAt(c).copy(Ext.data.Record.id({}));
      c = b.getLayer().clone();
      a.title && (c.setName(a.title), b.set("title", a.title));
      if ("visibility" in a) c.visibility = a.visibility;
      b.set("selected", a.selected || !1);
      b.set("source", a.source);
      b.set("name", a.name);
      "group" in a && b.set("group", a.group);
      b.data.layer = c;
      b.commit()
    }
    return b
  }
});
Ext.preg(gxp.plugins.MapBoxSource.prototype.ptype, gxp.plugins.MapBoxSource);
Ext.namespace("gxp.plugins");
gxp.plugins.MapProperties = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_mapproperties",
  colorManager: null,
  menuText: "Map Properties",
  toolTip: "Map Properties",
  wrapDateLineText: "Wrap dateline",
  numberOfZoomLevelsText: "Number of zoom levels",
  colorText: "Background color",
  addActions: function() {
    var a = this.target.mapPanel.map.baseLayer,
        b = Ext.get(this.target.mapPanel.map.getViewport());
    this.initialConfig.backgroundColor && b.setStyle("background-color", this.initialConfig.backgroundColor);
    this.initialConfig.numZoomLevels && (a.addOptions({
      numZoomLevels: this.initialConfig.numZoomLevels
    }), this.target.mapPanel.map.events.triggerEvent("changebaselayer", {
      layer: a
    }));
    if (this.initialConfig.wrapDateLine) a.wrapDateLine = this.initialConfig.wrapDateLine;
    return gxp.plugins.MapProperties.superclass.addActions.apply(this, [{
      menuText: this.menuText,
      iconCls: "gxp-icon-mapproperties",
      tooltip: this.toolTip,
      handler: function() {
        this.removeOutput();
        this.addOutput()
      },
      scope: this
    }])
  },
  addOutput: function() {
    var a;
    this.colorManager && (a = [new this.colorManager]);
    var b = this.target.mapPanel.map.baseLayer,
        c = Ext.get(this.target.mapPanel.map.getViewport());
    return gxp.plugins.MapProperties.superclass.addOutput.call(this, {
      xtype: "form",
      border: !1,
      bodyStyle: "padding: 10px",
      items: [{
        xtype: "numberfield",
        allowNegative: !1,
        allowDecimals: !1,
        fieldLabel: this.numberOfZoomLevelsText,
        minValue: 1,
        value: b.numZoomLevels,
        listeners: {
          change: function(a, c) {
            b.addOptions({
              numZoomLevels: c
            });
            this.target.mapPanel.map.events.triggerEvent("changebaselayer", {
              layer: b
            })
          },
          scope: this
        }
      }, {
        xtype: "checkbox",
        fieldLabel: this.wrapDateLineText,
        checked: b.wrapDateLine,
        listeners: {
          check: function(a, c) {
            b.wrapDateLine = c
          },
          scope: this
        }
      }, {
        xtype: "gxp_colorfield",
        fieldLabel: this.colorText,
        value: c.getColor("background-color"),
        plugins: a,
        listeners: {
          valid: function(a) {
            c.setStyle("background-color", a.getValue())
          },
          scope: this
        }
      }]
    })
  },
  getState: function() {
    var a = this.target.mapPanel.map.baseLayer;
    return {
      ptype: this.ptype,
      backgroundColor: Ext.get(this.target.mapPanel.map.getViewport()).getColor("background-color"),
      numZoomLevels: a.numZoomLevels,
      wrapDateLine: a.wrapDateLine
    }
  }
});
Ext.preg(gxp.plugins.MapProperties.prototype.ptype, gxp.plugins.MapProperties);
Ext.namespace("gxp.plugins");
gxp.plugins.MapQuestSource = Ext.extend(gxp.plugins.LayerSource, {
  ptype: "gxp_mapquestsource",
  title: "MapQuest Layers",
  osmAttribution: "Tiles Courtesy of <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
  osmTitle: "MapQuest OpenStreetMap",
  naipAttribution: "Tiles Courtesy of <a href='http://open.mapquest.co.uk/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png' border='0'>",
  naipTitle: "MapQuest Imagery",
  createStore: function() {
    var a = {
      projection: "EPSG:900913",
      maxExtent: new OpenLayers.Bounds(-2.00375083392E7, -2.00375083392E7, 2.00375083392E7, 2.00375083392E7),
      maxResolution: 156543.03390625,
      numZoomLevels: 19,
      units: "m",
      buffer: 1,
      transitionEffect: "resize",
      tileOptions: {
        crossOriginKeyword: null
      }
    },
        a = [new OpenLayers.Layer.OSM(this.osmTitle, ["http://otile1.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.png", "http://otile2.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.png", "http://otile3.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.png", "http://otile4.mqcdn.com/tiles/1.0.0/map/${z}/${x}/${y}.png"], OpenLayers.Util.applyDefaults({
        attribution: this.osmAttribution,
        type: "osm"
      }, a)), new OpenLayers.Layer.OSM(this.naipTitle, ["http://otile1.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.png", "http://otile2.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.png", "http://otile3.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.png", "http://otile4.mqcdn.com/tiles/1.0.0/sat/${z}/${x}/${y}.png"], OpenLayers.Util.applyDefaults({
        attribution: this.naipAttribution,
        type: "naip"
      }, a))];
    this.store = new GeoExt.data.LayerStore({
      layers: a,
      fields: [{
        name: "source",
        type: "string"
      }, {
        name: "name",
        type: "string",
        mapping: "type"
      }, {
        name: "abstract",
        type: "string",
        mapping: "attribution"
      }, {
        name: "group",
        type: "string",
        defaultValue: "background"
      }, {
        name: "fixed",
        type: "boolean",
        defaultValue: !0
      }, {
        name: "selected",
        type: "boolean"
      }]
    });
    this.store.each(function(a) {
      a.set("group", "background")
    });
    this.fireEvent("ready", this)
  },
  createLayerRecord: function(a) {
    var b, c = this.store.findExact("name", a.name);
    if (-1 < c) {
      b = this.store.getAt(c).copy(Ext.data.Record.id({}));
      c = b.getLayer().clone();
      a.title && (c.setName(a.title), b.set("title", a.title));
      if ("visibility" in a) c.visibility = a.visibility;
      b.set("selected", a.selected || !1);
      b.set("source", a.source);
      b.set("name", a.name);
      "group" in a && b.set("group", a.group);
      b.data.layer = c;
      b.commit()
    }
    return b
  }
});
Ext.preg(gxp.plugins.MapQuestSource.prototype.ptype, gxp.plugins.MapQuestSource);
Ext.namespace("gxp.plugins");
gxp.plugins.Measure = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_measure",
  outputTarget: "map",
  buttonText: "Measure",
  lengthMenuText: "Length",
  areaMenuText: "Area",
  lengthTooltip: "Measure length",
  areaTooltip: "Measure area",
  measureTooltip: "Measure",
  constructor: function(a) {
    gxp.plugins.Measure.superclass.constructor.apply(this, arguments)
  },
  destroy: function() {
    this.button = null;
    gxp.plugins.Measure.superclass.destroy.apply(this, arguments)
  },
  createMeasureControl: function(a, b) {
    var c = new OpenLayers.StyleMap({
      "default": new OpenLayers.Style(null, {
        rules: [new OpenLayers.Rule({
          symbolizer: {
            Point: {
              pointRadius: 4,
              graphicName: "square",
              fillColor: "white",
              fillOpacity: 1,
              strokeWidth: 1,
              strokeOpacity: 1,
              strokeColor: "#333333"
            },
            Line: {
              strokeWidth: 3,
              strokeOpacity: 1,
              strokeColor: "#666666",
              strokeDashstyle: "dash"
            },
            Polygon: {
              strokeWidth: 2,
              strokeOpacity: 1,
              strokeColor: "#666666",
              fillColor: "white",
              fillOpacity: 0.3
            }
          }
        })]
      })
    }),
        d = function() {
        f && f.destroy()
        },
        e = function(a) {
        var b = a.measure,
            c = a.units;
        h.displaySystem = "english";
        var d = -1 < a.geometry.CLASS_NAME.indexOf("LineString") ? h.getBestLength(a.geometry) : h.getBestArea(a.geometry),
            e = d[0],
            d = d[1];
        h.displaySystem = "metric";
        a = 2 == a.order ? "<sup>2</sup>" : "";
        return b.toFixed(2) + " " + c + a + "<br>" + e.toFixed(2) + " " + d + a
        },
        f, g = Ext.apply({}, this.initialConfig.controlOptions);
    Ext.applyIf(g, {
      geodesic: !0,
      persist: !0,
      handlerOptions: {
        layerOptions: {
          styleMap: c
        }
      },
      eventListeners: {
        measurepartial: function(a) {
          d();
          f = this.addOutput({
            xtype: "tooltip",
            html: e(a),
            title: b,
            autoHide: !1,
            closable: !0,
            draggable: !1,
            mouseOffset: [0, 0],
            showDelay: 1,
            listeners: {
              hide: d
            }
          });
          if (0 < a.measure) {
            var a = h.handler.lastUp,
                c = this.target.mapPanel.getPosition();
            f.targetXY = [c[0] + a.x, c[1] + a.y];
            f.show()
          }
        },
        deactivate: d,
        scope: this
      }
    });
    var h = new OpenLayers.Control.Measure(a, g);
    return h
  },
  addActions: function() {
    this.activeIndex = 0;
    this.button = new Ext.SplitButton({
      iconCls: "gxp-icon-measure-length",
      tooltip: this.measureTooltip,
      buttonText: this.buttonText,
      enableToggle: !0,
      toggleGroup: this.toggleGroup,
      allowDepress: !0,
      handler: function(a) {
        a.pressed && a.menu.items.itemAt(this.activeIndex).setChecked(!0)
      },
      scope: this,
      listeners: {
        toggle: function(a, b) {
          b || a.menu.items.each(function(a) {
            a.setChecked(!1)
          })
        },
        render: function(a) {
          Ext.ButtonToggleMgr.register(a)
        }
      },
      menu: new Ext.menu.Menu({
        items: [new Ext.menu.CheckItem(new GeoExt.Action({
          text: this.lengthMenuText,
          iconCls: "gxp-icon-measure-length",
          toggleGroup: this.toggleGroup,
          group: this.toggleGroup,
          listeners: {
            checkchange: function(a, b) {
              this.activeIndex = 0;
              this.button.toggle(b);
              b && this.button.setIconClass(a.iconCls)
            },
            scope: this
          },
          map: this.target.mapPanel.map,
          control: this.createMeasureControl(OpenLayers.Handler.Path, this.lengthTooltip)
        })), new Ext.menu.CheckItem(new GeoExt.Action({
          text: this.areaMenuText,
          iconCls: "gxp-icon-measure-area",
          toggleGroup: this.toggleGroup,
          group: this.toggleGroup,
          allowDepress: !1,
          listeners: {
            checkchange: function(a, b) {
              this.activeIndex = 1;
              this.button.toggle(b);
              b && this.button.setIconClass(a.iconCls)
            },
            scope: this
          },
          map: this.target.mapPanel.map,
          control: this.createMeasureControl(OpenLayers.Handler.Polygon, this.areaTooltip)
        }))]
      })
    });
    return gxp.plugins.Measure.superclass.addActions.apply(this, [this.button])
  }
});
Ext.preg(gxp.plugins.Measure.prototype.ptype, gxp.plugins.Measure);
Ext.namespace("gxp.plugins");
gxp.plugins.Navigation = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_navigation",
  menuText: "Pan Map",
  tooltip: "Pan Map",
  constructor: function(a) {
    gxp.plugins.Navigation.superclass.constructor.apply(this, arguments)
  },
  addActions: function() {
    var a;
    this.controlOptions ? (this.controlOptions = this.controlOptions || {}, Ext.applyIf(this.controlOptions, {
      dragPanOptions: {
        enableKinetic: !0
      }
    }), a = new OpenLayers.Control.Navigation(this.controlOptions)) : (candidates = this.target.mapPanel.map.getControlsByClass("OpenLayers.Control.Navigation"), candidates.length && (a = candidates[0]));
    a = [new GeoExt.Action({
      tooltip: this.tooltip,
      menuText: this.menuText,
      iconCls: "gxp-icon-pan",
      enableToggle: !0,
      pressed: !0,
      allowDepress: !1,
      control: a,
      map: a.map ? null : this.target.mapPanel.map,
      toggleGroup: this.toggleGroup
    })];
    return gxp.plugins.Navigation.superclass.addActions.apply(this, [a])
  }
});
Ext.preg(gxp.plugins.Navigation.prototype.ptype, gxp.plugins.Navigation);
Ext.namespace("gxp.plugins");
gxp.plugins.NavigationHistory = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_navigationhistory",
  previousMenuText: "Zoom To Previous Extent",
  nextMenuText: "Zoom To Next Extent",
  previousTooltip: "Zoom To Previous Extent",
  nextTooltip: "Zoom To Next Extent",
  constructor: function(a) {
    gxp.plugins.NavigationHistory.superclass.constructor.apply(this, arguments)
  },
  addActions: function() {
    var a = new OpenLayers.Control.NavigationHistory;
    this.target.mapPanel.map.addControl(a);
    a = [new GeoExt.Action({
      menuText: this.previousMenuText,
      iconCls: "gxp-icon-zoom-previous",
      tooltip: this.previousTooltip,
      disabled: !0,
      control: a.previous
    }), new GeoExt.Action({
      menuText: this.nextMenuText,
      iconCls: "gxp-icon-zoom-next",
      tooltip: this.nextTooltip,
      disabled: !0,
      control: a.next
    })];
    return gxp.plugins.NavigationHistory.superclass.addActions.apply(this, [a])
  }
});
Ext.preg(gxp.plugins.NavigationHistory.prototype.ptype, gxp.plugins.NavigationHistory);
Ext.namespace("gxp.plugins");
gxp.plugins.OLSource = Ext.extend(gxp.plugins.LayerSource, {
  ptype: "gxp_olsource",
  createLayerRecord: function(a) {
    var b, c = window;
    b = a.type.split(".");
    for (var d = 0, e = b.length; d < e && !(c = c[b[d]], !c); ++d);
    if (c && c.prototype && c.prototype.initialize) {
      b = function() {
        c.prototype.initialize.apply(this, a.args)
      };
      b.prototype = c.prototype;
      b = new b;
      if ("visibility" in a) b.visibility = a.visibility;
      b = new(GeoExt.data.LayerRecord.create([{
        name: "name",
        type: "string"
      }, {
        name: "source",
        type: "string"
      }, {
        name: "group",
        type: "string"
      }, {
        name: "fixed",
        type: "boolean"
      }, {
        name: "selected",
        type: "boolean"
      }, {
        name: "type",
        type: "string"
      }, {
        name: "args"
      }]))({
        layer: b,
        title: b.name,
        name: a.name || b.name,
        source: a.source,
        group: a.group,
        fixed: "fixed" in a ? a.fixed : !1,
        selected: "selected" in a ? a.selected : !1,
        type: a.type,
        args: a.args,
        properties: "properties" in a ? a.properties : void 0
      }, b.id)
    } else
    throw Error("Cannot construct OpenLayers layer from given type: " + a.type);
    return b
  },
  getConfigForRecord: function(a) {
    var b = gxp.plugins.OLSource.superclass.getConfigForRecord.apply(this, arguments);
    a.getLayer();
    return Ext.apply(b, {
      type: a.get("type"),
      args: a.get("args")
    })
  }
});
Ext.preg(gxp.plugins.OLSource.prototype.ptype, gxp.plugins.OLSource);
Ext.namespace("gxp.plugins");
gxp.plugins.OSMSource = Ext.extend(gxp.plugins.LayerSource, {
  ptype: "gxp_osmsource",
  title: "OpenStreetMap Layers",
  mapnikAttribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
  osmarenderAttribution: "Data CC-By-SA by <a href='http://openstreetmap.org/' target='_blank'>OpenStreetMap</a>",
  createStore: function() {
    var a = {
      projection: "EPSG:900913",
      maxExtent: new OpenLayers.Bounds(-2.00375083392E7, -2.00375083392E7, 2.00375083392E7, 2.00375083392E7),
      maxResolution: 156543.03390625,
      numZoomLevels: 19,
      units: "m",
      buffer: 1,
      transitionEffect: "resize"
    },
        a = [new OpenLayers.Layer.OSM("OpenStreetMap", ["http://a.tile.openstreetmap.org/${z}/${x}/${y}.png", "http://b.tile.openstreetmap.org/${z}/${x}/${y}.png", "http://c.tile.openstreetmap.org/${z}/${x}/${y}.png"], OpenLayers.Util.applyDefaults({
        attribution: this.mapnikAttribution,
        type: "mapnik"
      }, a))];
    this.store = new GeoExt.data.LayerStore({
      layers: a,
      fields: [{
        name: "source",
        type: "string"
      }, {
        name: "name",
        type: "string",
        mapping: "type"
      }, {
        name: "abstract",
        type: "string",
        mapping: "attribution"
      }, {
        name: "group",
        type: "string",
        defaultValue: "background"
      }, {
        name: "fixed",
        type: "boolean",
        defaultValue: !0
      }, {
        name: "selected",
        type: "boolean"
      }]
    });
    this.store.each(function(a) {
      a.set("group", "background")
    });
    this.fireEvent("ready", this)
  },
  createLayerRecord: function(a) {
    var b, c = this.store.findExact("name", a.name);
    if (-1 < c) {
      b = this.store.getAt(c).copy(Ext.data.Record.id({}));
      c = b.getLayer().clone();
      a.title && (c.setName(a.title), b.set("title", a.title));
      if ("visibility" in a) c.visibility = a.visibility;
      b.set("selected", a.selected || !1);
      b.set("source", a.source);
      b.set("name", a.name);
      "group" in a && b.set("group", a.group);
      b.data.layer = c;
      b.commit()
    }
    return b
  }
});
Ext.preg(gxp.plugins.OSMSource.prototype.ptype, gxp.plugins.OSMSource);
Ext.ns("gxp.slider");
gxp.slider.TimeSlider = Ext.extend(Ext.slider.MultiSlider, {
  ref: "slider",
  cls: "gx_timeslider",
  indexMap: null,
  width: 200,
  animate: !1,
  timeFormat: "l, F d, Y g:i:s A",
  timeManager: null,
  playbackMode: "track",
  autoPlay: !1,
  aggressive: !1,
  changeBuffer: 10,
  map: null,
  initComponent: function() {
    if (!this.timeManager) this.timeManager = new OpenLayers.Control.DimensionManager, this.map.addControl(this.timeManager);
    if (!this.model) this.model = this.timeManager.model;
    if (this.timeManager.agents) {
      if (!this.timeManager.timeUnits && !this.timeManager.snapToList) {
        if (this.model.values && !this.model.resolution && !1 !== this.timeManager.snapToList) this.timeManager.snapToList = !0;
        if (this.model.resolution && !this.model.values && this.model.timeUnits) this.timeManager.timeUnits = this.model.timeUnits, this.timeManager.timeStep = this.model.timeStep
      }
      this.playbackMode && "track" != this.playbackMode && this.timeManager.timeUnits && this.timeManager.incrementTimeValue(this.timeManager.rangeInterval)
    }
    var a = this.buildSliderValues();
    if (a) {
      !this.timeManager.snapToList && !this.timeManager.timeUnits && this.timeManager.guessPlaybackRate();
      var b = {
        maxValue: a.maxValue,
        minValue: a.minValue,
        increment: a.interval,
        keyIncrement: a.interval,
        indexMap: a.map,
        values: a.values
      };
      if (!this.initialConfig.timeFormat) if (a.interval) this.setTimeFormat(gxp.PlaybackToolbar.guessTimeFormat(a.interval * OpenLayers.TimeStep[this.timeManager.timeUnits]));
      else if (this.model.values) {
        for (var a = "Seconds,Minutes,Hours,Days,Months,Years".split(","), c = {}, d = 1, e = this.model.values.length; d < e; ++d) diff = this.model.values[d] - this.model.values[d - 1], info = gxp.PlaybackToolbar.smartIntervalFormat(diff), c[info.units] = !0;
        var f = null;
        for (d = 0, e = a.length; d < e; ++d) if (!0 === c[a[d]]) {
          f = a[d];
          break
        }
        null !== f && (a = gxp.PlaybackToolbar.timeFormats[f]) && this.setTimeFormat(a)
      }
      Ext.applyIf(this.initialConfig, b);
      Ext.apply(this, this.initialConfig)
    }
    this.timeManager.events.on({
      rangemodified: this.onRangeModified,
      tick: this.onTimeTick,
      scope: this
    });
    this.plugins = (this.plugins || []).concat([new Ext.slider.Tip({
      cls: "gxp-timeslider-tip",
      getText: this.getThumbText
    })]);
    this.listeners = Ext.applyIf(this.listeners || {}, {
      dragstart: function() {
        if (this.timeManager.timer) this.timeManager.stop(), this._restartPlayback = !0
      },
      beforechange: function(a, b, c, d) {
        b = !0;
        !this.timeManager.timeUnits && !this.timeManager.snapToList ? b = !1 : "cumulative" == this.playbackMode && "tail" == a.indexMap[d.index] && (b = !1);
        return b
      },
      afterrender: function(a) {
        this.sliderTip = a.plugins[0];
        this.timeManager.units && 1 < a.thumbs.length && a.setThumbStyles();
        this.autoPlay && this.timeManager.play()
      },
      scope: this
    });
    !0 === this.aggressive ? this.listeners.change = {
      fn: this.onSliderChangeComplete,
      buffer: this.changeBuffer
    } : this.listeners.changecomplete =
    this.onSliderChangeComplete;
    gxp.slider.TimeSlider.superclass.initComponent.call(this);
    this.addEvents("sliderclick")
  },
  onClickChange: function(a) {
    this.fireEvent("sliderclick", this);
    gxp.slider.TimeSlider.superclass.onClickChange.apply(this, arguments)
  },
  beforeDestroy: function() {
    this.map = null;
    gxp.slider.TimeSlider.superclass.beforeDestroy.call(this)
  },
  setPlaybackMode: function(a) {
    this.playbackMode = a;
    this.reconfigureSlider(this.buildSliderValues());
    "track" != this.playbackMode && this.timeManager.rangeInterval && (this.timeManager.incrementTimeValue(this.timeManager.rangeInterval), this.setValue(0, this.timeManager.currentValue));
    this.setThumbStyles()
  },
  setTimeFormat: function(a) {
    if (a) this.timeFormat = a
  },
  onRangeModified: function() {
    var a = this.timeManager;
    if (!a.agents || !a.agents.length) a.map.removeControl(this.ctl), a.destroy();
    else {
      var b = a.animationRange[0],
          c = a.animationRange[1];
      a.guessPlaybackRate();
      if (a.animationRange[0] != b || a.animationRange[1] != c || void 0 != a.units || void 0 != a.step) this.reconfigureSlider(this.buildSliderValues()), this.setThumbStyles(), this.fireEvent("rangemodified", this, a.animationRange)
    }
  },
  onTimeTick: function(a) {
    if (a = a.currentValue) {
      var b = this.refOwner,
          c = this.indexMap ? this.indexMap.indexOf("tail") : -1,
          d = -1 < c ? a - this.thumbs[0].value : 0;
      this.setValue(0, a); - 1 < c && this.setValue(c, this.thumbs[c].value + d);
      this.updateTimeDisplay();
      b.fireEvent("timechange", b, a)
    }
  },
  updateTimeDisplay: function() {
    this.sliderTip.onSlide(this, null, this.thumbs[0]);
    this.sliderTip.el.alignTo(this.el, "b-t?", this.offsets)
  },
  buildSliderValues: function() {
    var a =
    this.timeManager;
    if (!a.step && !a.snapToList) return !1;
    var b = ["primary"],
        c = [a.currentValue],
        d = a.animationRange[0],
        e = a.animationRange[1],
        f = !1;
    if (this.dynamicRange) {
      var g = 0.1 * (d - e);
      c.push(d -= g, e += g);
      b[1] = "minTime";
      b[2] = "maxTime"
    }
    "track" != this.playbackMode && (c.push(d), b[b.length] = "tail");
    if (!a.snapToList) f = a.step;
    return {
      values: c,
      map: b,
      maxValue: e,
      minValue: d,
      interval: f
    }
  },
  reconfigureSlider: function(a) {
    this.setMaxValue(a.maxValue);
    this.setMinValue(a.minValue);
    Ext.apply(this, {
      increment: a.interval,
      keyIncrement: a.interval,
      indexMap: a.map
    });
    for (var b = 0; b < a.values.length; b++) this.thumbs[b] ? this.setValue(b, a.values[b]) : this.addThumb(a.values[b]);
    if (!a.interval && this.timeManager.modelCache.values) a.interval = Math.round((a.maxValue - a.minValue) / this.timeManager.modelCache.values.length);
    this.setTimeFormat(gxp.PlaybackToolbar.guessTimeFormat(a.interval))
  },
  setThumbStyles: function() {
    var a = this.indexMap.indexOf("tail");
    "min" == this.indexMap[1] && (this.thumbs[1].el.addClass("x-slider-min-thumb"), this.thumbs[2].el.addClass("x-slider-max-thumb"));
    if (-1 < a) {
      var a = this.thumbs[a],
          b = this.thumbs[0];
      a.el.addClass("x-slider-tail-thumb");
      a.constrain = !1;
      b.constrain = !1
    }
  },
  getThumbText: function(a) {
    if ("tail" != a.slider.indexMap[a.index]) {
      var b = new Date(a.value);
      b.setTime(b.getTime() + 6E4 * b.getTimezoneOffset());
      return b.format(a.slider.timeFormat)
    }
    a = gxp.PlaybackToolbar.smartIntervalFormat.call(a, a.slider.thumbs[0].value - a.value);
    return a.value + " " + a.units
  },
  onSliderChangeComplete: function(a, b, c, d) {
    var e = a.timeManager;
    if (b !== e.currentValue) {
      switch (a.indexMap[c.index]) {
      case "primary":
        d =
        a.indexMap.indexOf("tail");
        if (-1 < d) a.onSliderChangeComplete(a, a.thumbs[d].value, a.thumbs[d], !0);
        !e.snapToList && e.timeUnits ? (a = Math[b > e.currentValue ? "ceil" : "floor"]((b - e.currentValue) / OpenLayers.TimeStep[e.timeUnits]), e.setCurrentValue(e.incrementTimeValue(a))) : e.setCurrentValue(b);
        break;
      case "min":
        e.setAnimationStart(b);
        break;
      case "max":
        e.seAnimantionEnd(b);
        break;
      case "tail":
        for (var c = 0, f = e.agents.length; c < f; c++) if ("range" == e.agents[c].tickMode) e.agents[c].rangeInterval = a.thumbs[0].value - b;
        d || e.setCurrentValue(a.thumbs[0].value)
      }
      this._restartPlayback && (delete this._restartPlayback, e.play())
    }
  },
  onRender: function() {
    this.autoEl = {
      cls: "x-slider " + (this.vertical ? "x-slider-vert" : "x-slider-horz"),
      cn: [{
        cls: "x-slider-end",
        cn: {
          cls: "x-slider-inner",
          cn: [{
            tag: "a",
            cls: "x-slider-focus",
            href: "#",
            tabIndex: "-1",
            hidefocus: "on"
          }]
        }
      }, {
        cls: "x-slider-progress"
      }]
    };
    Ext.slider.MultiSlider.superclass.onRender.apply(this, arguments);
    this.endEl = this.el.first();
    this.progressEl = this.el.child(".x-slider-progress");
    this.innerEl = this.endEl.first();
    this.focusEl = this.innerEl.child(".x-slider-focus");
    for (var a = 0; a < this.thumbs.length; a++) this.thumbs[a].render();
    a = this.innerEl.child(".x-slider-thumb");
    this.halfThumb = (this.vertical ? a.getHeight() : a.getWidth()) / 2;
    this.initEvents()
  }
});
Ext.reg("gxp_timeslider", gxp.slider.TimeSlider);
Ext.namespace("gxp");
gxp.PlaybackToolbar = Ext.extend(Ext.Toolbar, {
  control: null,
  dimModel: null,
  mapPanel: null,
  initialTime: null,
  timeFormat: "l, F d, Y g:i:s A",
  toolbarCls: "x-toolbar gx-overlay-playback",
  ctCls: "gx-playback-wrap",
  slider: !0,
  dynamicRange: !1,
  playbackMode: "track",
  showIntervals: !1,
  labelButtons: !1,
  settingsButton: !0,
  rateAdjuster: !1,
  looped: !1,
  autoPlay: !1,
  aggressive: null,
  prebuffer: null,
  maxframes: null,
  optionsWindow: null,
  playing: !1,
  playLabel: "Play",
  playTooltip: "Play",
  stopLabel: "Stop",
  stopTooltip: "Stop",
  fastforwardLabel: "FFWD",
  fastforwardTooltip: "Double Speed Playback",
  nextLabel: "Next",
  nextTooltip: "Advance One Frame",
  resetLabel: "Reset",
  resetTooltip: "Reset to the start",
  loopLabel: "Loop",
  loopTooltip: "Continously loop the animation",
  normalTooltip: "Return to normal playback",
  pauseLabel: "Pause",
  pauseTooltip: "Pause",
  initComponent: function() {
    if (!this.playbackActions) this.playbackActions = "settings,slider,reset,play,fastforward,next,loop".split(",");
    if (!this.control) this.controlConfig = Ext.applyIf(this.controlConfig || {}, {
      dimension: "time",
      prebuffer: this.prebuffer,
      maxframes: this.maxframes,
      autoSync: !0
    }), this.control = this.buildTimeManager();
    this.control.events.on({
      play: function() {
        this.playing = !0
      },
      stop: function() {
        this.playing = !1
      },
      scope: this
    });
    if (!this.dimModel) this.dimModel = new OpenLayers.Dimension.Model({
      dimension: "time",
      map: this.mapPanel.map
    });
    this.mapPanel.map.events.on({
      zoomend: function() {
        if (!0 === this._prebuffer && this.mapPanel.map.zoom !== this.previousZoom) this._stopPrebuffer = !0, this.slider.progressEl.hide(), this.mapPanel.map.events.un({
          zoomend: arguments.callee,
          scope: this
        });
        this.previousZoom = this.mapPanel.map.zoom
      },
      scope: this
    });
    this.control.events.on({
      prebuffer: function(a) {
        this._prebuffer = !0;
        !0 === this._stopPrebuffer && this.slider.progressEl.hide();
        this.slider.progressEl.setWidth(100 * a.progress + "%");
        return !0 !== this._stopPrebuffer
      },
      scope: this
    });
    this.availableTools = Ext.applyIf(this.availableTools || {}, this.getAvailableTools());
    Ext.applyIf(this, {
      defaults: {
        xtype: "button",
        flex: 1,
        scale: "small"
      },
      items: this.buildPlaybackItems(),
      border: !1,
      frame: !1,
      unstyled: !0,
      shadow: !1,
      timeDisplayConfig: {
        xtype: "tip",
        format: this.timeFormat,
        height: "auto",
        closeable: !1,
        title: !1,
        width: 210
      }
    });
    this.addEvents("timechange", "rangemodified");
    gxp.PlaybackToolbar.superclass.initComponent.call(this)
  },
  destroy: function() {
    if (this.control && !this.initialConfig.control) this.control.map && this.control.map.removeControl(this.control), this.control.destroy(), this.control = null;
    this.mapPanel = null;
    gxp.PlaybackToolbar.superclass.destroy.call(this)
  },
  setTime: function(a) {
    a = a.getTime();
    if (a < this.slider.minValue || a > this.slider.maxValue) return !1;
    this.control.setCurrentValue(a);
    return !0
  },
  setTimeFormat: function(a) {
    if (a) this.timeFormat = a, this.slider.setTimeFormat(a)
  },
  setPlaybackMode: function(a) {
    if (a) this.playbackMode = a, this.slider && this.slider.setPlaybackMode(a)
  },
  buildPlaybackItems: function() {
    for (var a = this.playbackActions, b = [], c = 0, d = a.length; c < d; c++) {
      var e = a[c],
          f = this.availableTools[e];
      f ? b.push(f) : -1 < ["|", " ", "->"].indexOf(e) && b.push(e)
    }
    return b
  },
  getAvailableTools: function() {
    return {
      slider: {
        xtype: "gxp_timeslider",
        ref: "slider",
        listeners: {
          sliderclick: {
            fn: function() {
              this._stopPrebuffer = !0
            },
            scope: this
          },
          dragstart: {
            fn: function() {
              this._stopPrebuffer = !0
            },
            scope: this
          }
        },
        map: this.mapPanel.map,
        timeManager: this.control,
        model: this.dimModel,
        playbackMode: this.playbackMode,
        aggressive: this.aggressive
      },
      reset: {
        iconCls: "gxp-icon-reset",
        ref: "btnReset",
        handler: this.control.reset,
        scope: this.control,
        tooltip: this.resetTooltip,
        menuText: this.resetLabel,
        text: this.labelButtons ? this.resetLabel : !1
      },
      pause: {
        iconCls: "gxp-icon-pause",
        ref: "btnPause",
        handler: this.control.stop,
        scope: this.control,
        tooltip: this.stopTooltip,
        menuText: this.stopLabel,
        text: this.labelButtons ? this.stopLabel : !1,
        toggleGroup: "timecontrol",
        enableToggle: !0,
        allowDepress: !1
      },
      play: {
        iconCls: "gxp-icon-play",
        ref: "btnPlay",
        toggleHandler: this.toggleAnimation,
        scope: this,
        toggleGroup: "timecontrol",
        enableToggle: !0,
        allowDepress: !0,
        tooltip: this.playTooltip,
        menuText: this.playLabel,
        text: this.labelButtons ? this.playLabel : !1
      },
      next: {
        iconCls: "gxp-icon-next",
        ref: "btnNext",
        handler: function() {
          this.stop();
          this.tick()
        },
        scope: this.control,
        tooltip: this.nextTooltip,
        menuText: this.nextLabel,
        text: this.labelButtons ? this.nextLabel : !1
      },
      end: {
        iconCls: "gxp-icon-last",
        ref: "btnEnd",
        handler: this.forwardToEnd,
        scope: this,
        tooltip: this.endTooltip,
        menuText: this.endLabel,
        text: this.labelButtons ? this.endLabel : !1
      },
      loop: {
        iconCls: "gxp-icon-loop",
        ref: "btnLoop",
        tooltip: this.loopTooltip,
        enableToggle: !0,
        allowDepress: !0,
        pressed: this.looped,
        toggleHandler: this.toggleLoopMode,
        scope: this,
        menuText: this.loopLabel,
        text: this.labelButtons ? this.loopLabel : !1
      },
      fastforward: {
        iconCls: "gxp-icon-ffwd",
        ref: "btnFastforward",
        tooltip: this.fastforwardTooltip,
        enableToggle: !0,
        toggleGroup: "fastforward",
        toggleHandler: this.toggleDoubleSpeed,
        scope: this,
        disabled: !0,
        menuText: this.fastforwardLabel,
        text: this.labelButtons ? this.fastforwardLabel : !1
      },
      settings: {
        iconCls: "gxp-icon-settings",
        ref: "btnSettings",
        scope: this,
        handler: this.toggleOptionsWindow,
        enableToggle: !1,
        tooltip: this.settingsTooltip,
        menuText: this.settingsLabel,
        text: this.labelButtons ? this.settingsLabel : !1
      }
    }
  },
  buildTimeManager: function() {
    this.controlConfig || (this.controlConfig = {});
    if (this.controlConfig.timeAgents) this.controlConfig.agents = this.controlConfig.timeAgents, delete this.controlConfig.timeAgents;
    if (this.controlConfig.agents) for (var a = 0; a < this.controlConfig.agents.length; a++) {
      var b = this.controlConfig.agents[a],
          c = b.type,
          d = [];
      Ext.each(b.layers, function(a) {
        var b = this.mapPanel.layers.findBy(function(b) {
          return b.json && b.json.source == a.source && b.json.title == a.title && b.json.name == a.name && (b.json.styles == a.styles || !1 == !! b.json.styles && !1 == !! a.styles)
        }); - 1 < b && d.push(this.mapPanel.layers.getAt(b).getLayer())
      }, this);
      b.layers = d;
      if (b.rangeMode) b.tickMode = b.rangeMode, delete b.rangeMode;
      delete b.type;
      if (!b.dimension) b.dimension = "time";
      b = c && OpenLayers.Dimension.Agent[c] ? new OpenLayers.Dimension.Agent[c](b) : new OpenLayers.Dimension.Agent(b);
      this.controlConfig.agents[a] = b
    } else "ranged" == this.playbackMode ? Ext.apply(this.controlConfig, {
      agentOptions: {
        WMS: {
          tickMode: "range",
          rangeInterval: this.controlConfig.rangeInterval || void 0
        },
        Vector: {
          tickMode: "range",
          rangeInterval: this.controlConfig.rangeInterval || void 0
        }
      }
    }) : "cumulative" == this.playbackMode && Ext.apply(this.controlConfig, {
      agentOptions: {
        WMS: {
          tickMode: "cumulative"
        },
        Vector: {
          tickMode: "cumulative"
        }
      }
    });
    if (!this.controlConfig.dimension) this.controlConfig.dimension = "time";
    a = this.control = new OpenLayers.Control.DimensionManager(this.controlConfig);
    a.loop = this.looped;
    this.mapPanel.map.addControl(a);
    a.layers && this.fireEvent("rangemodified", this, a.range);
    return a
  },
  forwardToEnd: function() {
    var a =
    this.control;
    a.setCurrentValue(a.animationRange[0 > a.step ? 0 : 1])
  },
  toggleAnimation: function(a, b) {
    if (!a.bound && b) this.control.events.on({
      stop: function(b) {
        a.toggle(!1);
        if (b.rangeExceeded) this._resetOnPlay = !0
      },
      play: function() {
        a.toggle(!0);
        this._resetOnPlay && (this.reset(), delete this._resetOnPlay)
      }
    }), a.bound = !0;
    b ? (this.playing || this.control.play(), a.btnEl.removeClass("gxp-icon-play"), a.btnEl.addClass("gxp-icon-pause"), a.setTooltip(this.pauseTooltip)) : (this.playing && this.control.stop(), a.btnEl.addClass("gxp-icon-play"), a.btnEl.removeClass("gxp-icon-pause"), a.setTooltip(this.playTooltip));
    a.el.removeClass("x-btn-pressed");
    a.refOwner.btnFastforward.setDisabled(!b);
    this.labelButtons && a.text && a.setText(b ? this.pauseLabel : this.playLabel)
  },
  toggleLoopMode: function(a, b) {
    this.control.loop = b;
    a.setTooltip(b ? this.normalTooltip : this.loopTooltip);
    this.labelButtons && a.text && a.setText(b ? this.normalLabel : this.loopLabel)
  },
  toggleDoubleSpeed: function(a, b) {
    this.control.setFrameRate(this.control.frameRate * (b ? 2 : 0.5));
    a.setTooltip(b ? this.normalTooltip : this.fastforwardTooltip)
  },
  toggleOptionsWindow: function(a, b) {
    if (b && this.optionsWindow.hidden) {
      if (!this.optionsWindow.optionsPanel.timeManager) this.optionsWindow.optionsPanel.timeManager = this.control, this.optionsWindow.optionsPanel.playbackToolbar = this;
      this.optionsWindow.show()
    } else!b && !this.optionsWindow.hidden && this.optionsWindow.hide()
  }
});
gxp.PlaybackToolbar.timeFormats = {
  Minutes: "l, F d, Y g:i A",
  Hours: "l, F d, Y g A",
  Days: "l, F d, Y",
  Months: "F, Y",
  Years: "Y"
};
gxp.PlaybackToolbar.guessTimeFormat = function(a) {
  if (a) {
    var a = gxp.PlaybackToolbar.smartIntervalFormat(a).units,
        b = this.timeFormat;
    gxp.PlaybackToolbar.timeFormats[a] && (b = gxp.PlaybackToolbar.timeFormats[a]);
    return b
  }
};
gxp.PlaybackToolbar.smartIntervalFormat = function(a) {
  var b;
  b = Math.abs(a);
  5E3 > b ? (b = "Seconds", a = Math.round(a / 100) / 10) : 35E5 > b ? (b = "Minutes", a = Math.round(a / 600) / 10) : 828E5 > b ? (b = "Hours", a = Math.round(a / 36E4) / 10) : 25E8 > b ? (b = "Days", a = Math.round(a / 864E4) / 10) : 311E8 > b ? (b = "Months", a = Math.round(a / 2628E5) / 10) : (b = "Years", a = Math.round(a / 31536E5) / 10);
  return {
    units: b,
    value: a
  }
};
Ext.reg("gxp_playbacktoolbar", gxp.PlaybackToolbar);
Ext.namespace("gxp.form");
gxp.form.PlaybackModeComboBox = Ext.extend(Ext.form.ComboBox, {
  modeFieldText: "Playback Mode",
  normalOptText: "Normal",
  cumulativeOptText: "Cumulative",
  rangedOptText: "Ranged",
  modes: [],
  defaultMode: "track",
  agents: null,
  allowBlank: !1,
  mode: "local",
  triggerAction: "all",
  editable: !1,
  constructor: function(a) {
    this.addEvents("beforemodechange", "modechange");
    !a.modes && !this.modes.length && this.modes.push(["track", this.normalOptText], ["cumulative", this.cumulativeOptText], ["ranged", this.rangedOptText]);
    gxp.form.PlaybackModeComboBox.superclass.constructor.call(this, a)
  },
  initComponent: function() {
    Ext.applyIf(this, {
      displayField: "field2",
      valueField: "field1",
      store: this.modes,
      value: this.defaultMode,
      listeners: {
        select: this.setPlaybackMode,
        scope: this
      }
    });
    gxp.form.PlaybackModeComboBox.superclass.initComponent.call(this)
  },
  setPlaybackMode: function(a, b) {
    this.fireEvent("beforemodechange");
    if (!this.agents && window.console) window.console.warn("No agents configured for playback mode combobox");
    else {
      var c = b.get("field1");
      Ext.each(this.agents, function(a) {
        a.tickMode = c;
        if ("range" == c && !a.rangeInterval) a.rangeInterval = 1
      });
      this.fireEvent("modechange", this, c, this.agents)
    }
  }
});
Ext.reg("gxp_playbackmodecombo", gxp.form.PlaybackModeComboBox);
Ext.namespace("gxp");
gxp.PlaybackOptionsPanel = Ext.extend(Ext.Panel, {
  layout: "fit",
  titleText: "Date & Time Options",
  rangeFieldsetText: "Time Range",
  animationFieldsetText: "Animation Options",
  startText: "Start",
  endText: "End",
  listOnlyText: "Use Exact List Values Only",
  stepText: "Animation Step",
  unitsText: "Animation Units",
  noUnitsText: "Snap To Time List",
  loopText: "Loop Animation",
  reverseText: "Reverse Animation",
  rangeChoiceText: "Choose the range for the time control",
  rangedPlayChoiceText: "Playback Mode",
  initComponent: function() {
    var a =
    Ext.applyIf(this.initialConfig, {
      minHeight: 400,
      minWidth: 275,
      ref: "optionsPanel",
      items: [{
        xtype: "form",
        layout: "form",
        autoScroll: !0,
        ref: "form",
        labelWidth: 10,
        defaultType: "textfield",
        items: [{
          xtype: "fieldset",
          title: this.rangeFieldsetText,
          defaultType: "datefield",
          labelWidth: 60,
          items: [{
            xtype: "displayfield",
            text: this.rangeChoiceText
          }, {
            fieldLabel: this.startText,
            listeners: {
              select: this.setStartTime,
              change: this.setStartTime,
              scope: this
            },
            ref: "../../rangeStartField"
          }, {
            fieldLabel: this.endText,
            listeners: {
              select: this.setEndTime,
              change: this.setEndTime,
              scope: this
            },
            ref: "../../rangeEndField"
          }]
        }, {
          xtype: "fieldset",
          title: this.animationFieldsetText,
          labelWidth: 100,
          items: [{
            boxLabel: this.listOnlyText,
            hideLabel: !0,
            xtype: "checkbox",
            handler: this.toggleListMode,
            scope: this,
            ref: "../../listOnlyCheck"
          }, {
            fieldLabel: this.stepText,
            xtype: "numberfield",
            anchor: "-25",
            enableKeyEvents: !0,
            listeners: {
              change: this.setStep,
              scope: this
            },
            ref: "../../stepValueField"
          }, {
            fieldLabel: this.unitsText,
            xtype: "combo",
            anchor: "-5",
            store: [
              [OpenLayers.TimeUnit.SECONDS, "Seconds"],
              [OpenLayers.TimeUnit.MINUTES, "Minutes"],
              [OpenLayers.TimeUnit.HOURS, "Hours"],
              [OpenLayers.TimeUnit.DAYS, "Days"],
              [OpenLayers.TimeUnit.MONTHS, "Months"],
              [OpenLayers.TimeUnit.YEARS, "Years"]
            ],
            valueNotFoundText: this.noUnitsText,
            mode: "local",
            forceSelection: !0,
            autoSelect: !1,
            editable: !1,
            triggerAction: "all",
            listeners: {
              select: this.setUnits,
              scope: this
            },
            ref: "../../stepUnitsField"
          }, {
            fieldLabel: this.rangedPlayChoiceText,
            xtype: "gxp_playbackmodecombo",
            agents: this.timeManager && this.timeManager.agents,
            anchor: "-5",
            listeners: {
              modechange: this.setPlaybackMode,
              scope: this
            },
            ref: "../../playbackModeField"
          }]
        }, {
          xtype: "checkbox",
          boxLabel: this.loopText,
          handler: this.setLoopMode,
          scope: this,
          ref: "../loopModeCheck"
        }, {
          xtype: "checkbox",
          boxLabel: this.reverseText,
          handler: this.setReverseMode,
          scope: this,
          ref: "../reverseModeCheck"
        }]
      }],
      bbar: [{
        text: "Save",
        ref: "../saveBtn",
        hidden: this.readOnly,
        handler: function() {
          this.fireEvent("save", this)
        },
        scope: this
      }]
    });
    Ext.apply(this, a);
    this.on("show", this.populateForm, this);
    gxp.PlaybackOptionsPanel.superclass.initComponent.call(this)
  },
  destroy: function() {
    this.playbackToolbar =
    this.timeManager = null;
    this.un("show", this, this.populateForm);
    gxp.PlaybackOptionsPanel.superclass.destroy.call(this)
  },
  setStartTime: function(a, b) {
    this.timeManager.setAnimationStart(b.getTime());
    this.timeManager.fixedRange = !0
  },
  setEndTime: function(a, b) {
    this.timeManager.setAnimationEnd(b.getTime());
    this.timeManager.fixedRange = !0
  },
  toggleListMode: function(a, b) {
    this.stepValueField.setDisabled(b);
    this.stepUnitsField.setDisabled(b);
    this.timeManager.snapToList = b
  },
  setUnits: function(a, b) {
    var c = b.get("field1");
    if (this.timeManager.timeUnits != c) this.timeManager.timeUnits = c, this.timeManager.step = a.refOwner.stepValueField.value * OpenLayers.TimeStep[c], "track" != this.playbackToolbar.playbackMode && this.timeManager.incrementValue()
  },
  setStep: function(a, b) {
    if (a.validate() && b && (this.timeManager.step = b * OpenLayers.TimeStep[this.timeManager.timeUnits], this.timeManager.timeStep = b, "ranged" == this.playbackToolbar.playbackMode && this.timeManager.rangeInterval != b)) this.timeManager.rangeInterval = b, this.timeManager.incrementTimeValue(b)
  },
  setPlaybackMode: function(a, b, c) {
    var d = a.startValue;
    Ext.each(c, function(a) {
      if (a.tickMode == d) a.tickMode = b
    });
    this.disableListMode("ranged" == b);
    this.playbackToolbar.setPlaybackMode(b)
  },
  disableListMode: function(a) {
    (a = !1 !== a) && this.listOnlyCheck.setValue(!a);
    this.listOnlyCheck.setDisabled(a)
  },
  setLoopMode: function(a, b) {
    this.timeManager.loop = b
  },
  setReverseMode: function() {
    this.timeManager.step *= -1
  },
  populateForm: function() {
    this.readOnly ? this.saveBtn.hide() : this.saveBtn.show();
    this.doLayout();
    if (this.timeManager) {
      var a =
      new Date(this.timeManager.animationRange[0]),
          b = new Date(this.timeManager.animationRange[1]),
          c = this.timeManager.timeStep,
          d = this.timeManager.timeUnit,
          e = this.timeManager.snapToList,
          f = this.playbackToolbar ? this.playbackToolbar.playbackMode : this.timeManager.agents[0].tickMode,
          g = this.timeManager.loop,
          h = 0 > this.timeManager.step;
      this.rangeStartField.setValue(a);
      this.rangeStartField.originalValue = a;
      this.rangeEndField.setValue(b);
      this.rangeEndField.originalValue = b;
      this.stepValueField.originalValue = this.stepValueField.setValue(c);
      this.stepUnitsField.originalValue = this.stepUnitsField.setValue(d);
      this.listOnlyCheck.setValue(e);
      this.listOnlyCheck.originalValue = e;
      if (!this.playbackModeField.agents || !this.playbackModeField.agents.length) this.playbackModeField.agents = this.timeManager.agents;
      this.playbackModeField.setValue(f);
      this.playbackModeField.originalValue = f;
      this.loopModeCheck.setValue(g);
      this.loopModeCheck.originalValue = g;
      this.reverseModeCheck.setValue(h);
      this.reverseModeCheck.originalValue = h
    }
  },
  close: function() {
    if (this.ownerCt && this.ownerCt.close) this.ownerCt[this.ownerCt.closeAction]()
  }
});
Ext.reg("gxp_playbackoptions", gxp.PlaybackOptionsPanel);
Ext.namespace("gxp.plugins");
gxp.plugins.Playback = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_playback",
  autoStart: !1,
  looped: !1,
  playbackMode: "track",
  menuText: "Time Playback",
  tooltip: "Show Time Playback Panel",
  actionTarget: null,
  outputTarget: "map",
  constructor: function(a) {
    gxp.plugins.Playback.superclass.constructor.apply(this, arguments)
  },
  init: function(a) {
    a.on("saved", function() {
      if (this.output) this.output[0].optionsWindow.optionsPanel.readOnly = !1
    }, this, {
      single: !0
    });
    gxp.plugins.Playback.superclass.init.call(this, a)
  },
  addOutput: function(a) {
    delete this._ready;
    OpenLayers.Control.DimensionManager.prototype.maxFrameDelay = this.target.tests && this.target.tests.dropFrames ? 10 : NaN;
    a = Ext.applyIf(a || this.outputConfig || {}, {
      xtype: "gxp_playbacktoolbar",
      mapPanel: this.target.mapPanel,
      playbackMode: this.playbackMode,
      prebuffer: this.target.prebuffer,
      maxframes: this.target.maxframes,
      looped: this.looped,
      autoPlay: this.autoStart,
      optionsWindow: new Ext.Window({
        title: gxp.PlaybackOptionsPanel.prototype.titleText,
        width: 350,
        height: 400,
        layout: "fit",
        items: [{
          xtype: "gxp_playbackoptions",
          readOnly: !this.target.isAuthorized() || !(this.target.id || this.target.mapID),
          listeners: {
            save: function(a) {
              this.target.on("saved", function() {
                a.ownerCt.close()
              }, this, {
                single: !0
              });
              this.target.save()
            },
            scope: this
          }
        }],
        closeable: !0,
        closeAction: "hide",
        renderTo: Ext.getBody(),
        listeners: {
          show: function(a) {
            a = a.findByType("gxp_playbackoptions")[0];
            a.fireEvent("show", a)
          },
          hide: function(a) {
            a = a.findByType("gxp_playbackoptions")[0];
            a.fireEvent("hide", a)
          }
        }
      })
    });
    a = gxp.plugins.Playback.superclass.addOutput.call(this, a);
    this.relayEvents(a, ["timechange", "rangemodified"]);
    this.playbackToolbar = a;
    a.control.layers && this.fireEvent("rangemodified", this, a.control.range);
    return a
  },
  addActions: function() {
    this._ready = 0;
    this.target.mapPanel.map.events.register("addlayer", this, function(a) {
      var b = a.layer;
      b instanceof OpenLayers.Layer.WMS && b.dimensions && b.dimensions.time && (this.target.mapPanel.map.events.unregister("addlayer", this, arguments.callee), this._ready += 1, 1 < this._ready && this.addOutput())
    });
    this.target.on("ready", function() {
      this._ready += 1;
      1 < this._ready && this.addOutput()
    }, this)
  },
  setTime: function(a) {
    return this.playbackToolbar.setTime(a)
  },
  getState: function() {
    var a = gxp.plugins.Playback.superclass.getState.call(this),
        b = this.playbackToolbar;
    if (b) {
      var c = b.control;
      a.outputConfig = Ext.apply(b.initialConfig, {
        dynamicRange: b.dyanamicRange,
        playbackMode: b.playbackMode
      });
      if (c && (b = c.modelCache || c.model, a.outputConfig.controlConfig = {
        model: {
          dimension: b.dimension || c.dimension,
          values: b.values,
          range: b.range
        },
        animationRange: c.animationRange,
        timeStep: c.timeStep,
        timeUnits: c.timeUnits ? c.timeUnits : void 0,
        loop: c.loop,
        snapToList: c.snapToList,
        dimension: b.dimension || c.dimension
      }, 1 < c.agents.length)) {
        for (var c = c.agents, b = [], d = 0; d < c.length; d++) {
          for (var e = {
            type: c[d].CLASS_NAME.split("Agent.")[1],
            tickMode: c[d].tickMode,
            rangeInterval: c[d].rangeInterval,
            values: c[d].values,
            layers: []
          }, f = 0; f < c[d].layers.length; f++) {
            var g = this.target.mapPanel.layers.getByLayer(c[d].layers[f]),
                g = this.target.layerSources[g.get("source")].getConfigForRecord(g);
            e.layers.push({
              source: g.source,
              title: g.title,
              name: g.name,
              styles: g.styles ? g.styles : void 0
            })
          }
          b.push(e)
        }
        a.outputConfig.controlConfig.agents = b
      }
      delete a.outputConfig.mapPanel;
      delete a.outputConfig.optionsWindow
    }
    return a
  }
});
Ext.preg(gxp.plugins.Playback.prototype.ptype, gxp.plugins.Playback);
Ext.namespace("gxp.plugins");
gxp.plugins.Print = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_print",
  printService: null,
  printCapabilities: null,
  customParams: null,
  includeLegend: !1,
  menuText: "Print Map",
  tooltip: "Print Map",
  buttonText: "Print",
  notAllNotPrintableText: "Not All Layers Can Be Printed",
  nonePrintableText: "None of your current map layers can be printed",
  previewText: "Print Preview",
  openInNewWindow: !1,
  constructor: function(a) {
    gxp.plugins.Print.superclass.constructor.apply(this, arguments)
  },
  addActions: function() {
    if (null !== this.printService || null != this.printCapabilities) {
      var a = new GeoExt.data.PrintProvider({
        capabilities: this.printCapabilities,
        url: this.printService,
        customParams: this.customParams,
        autoLoad: !1,
        listeners: {
          beforedownload: function(a, b) {
            if (!0 === this.openInNewWindow) return window.open(b), !1
          },
          beforeencodelegend: function(a, b, c) {
            if (c && "gxp_layermanager" === c.ptype) {
              var d = [];
              (c = c.output) && c[0] && c[0].getRootNode().cascade(function(a) {
                if (a.component && !a.component.hidden) {
                  var a = a.component,
                      c = this.encoders.legends[a.getXType()];
                  d = d.concat(c.call(this, a, b.pages[0].scale))
                }
              }, a);
              b.legends = d;
              return !1
            }
          },
          beforeprint: function() {
            d.items.get(0).printMapPanel.layers.each(function(a) {
              var a = a.get("layer").params,
                  b;
              for (b in a) a[b] instanceof Array && (a[b] = a[b].join(","))
            })
          },
          loadcapabilities: function() {
            if (c) c.initialConfig.disabled = !1, c.enable()
          },
          print: function() {
            try {
              d.close()
            } catch (a) {}
          },
          printException: function(a, b) {
            this.target.displayXHRTrouble && this.target.displayXHRTrouble(b)
          },
          scope: this
        }
      }),
          b = gxp.plugins.Print.superclass.addActions.call(this, [{
          menuText: this.menuText,
          buttonText: this.buttonText,
          tooltip: this.tooltip,
          iconCls: "gxp-icon-print",
          disabled: null !== this.printCapabilities ? !1 : !0,
          handler: function() {
            if (0 < g().length) {
              var a = j.call(this);
              k.call(this);
              return a
            }
            Ext.Msg.alert(this.notAllNotPrintableText, this.nonePrintableText)
          },
          scope: this,
          listeners: {
            render: function() {
              a.loadCapabilities()
            }
          }
        }]),
          c = b[0].items[0],
          d, e = function() {
          if (d) {
            try {
              d.items.first().printMapPanel.printPage.destroy()
            } catch (a) {}
            d = null
          }
          },
          f = this.target.mapPanel,
          g = function() {
          var a = [];
          f.layers.each(function(b) {
            b =
            b.getLayer();
            h(b) && a.push(b)
          });
          return a
          },
          h = function(a) {
          return !0 === a.getVisibility() && (a instanceof OpenLayers.Layer.WMS || a instanceof OpenLayers.Layer.OSM)
          },
          j = function() {
          var b = null;
          if (!0 === this.includeLegend) {
            var c, g;
            for (c in this.target.tools) if (g = this.target.tools[c], "gxp_legend" === g.ptype) {
              b = g.getLegendPanel();
              break
            }
            if (null === b) for (c in this.target.tools) if (g = this.target.tools[c], "gxp_layermanager" === g.ptype) {
              b = g;
              break
            }
          }
          return d = new Ext.Window({
            title: this.previewText,
            modal: !0,
            border: !1,
            autoHeight: !0,
            resizable: !1,
            width: 360,
            items: [new GeoExt.ux.PrintPreview({
              minWidth: 336,
              mapTitle: this.target.about && this.target.about.title,
              comment: this.target.about && this.target.about["abstract"],
              printMapPanel: {
                autoWidth: !0,
                height: Math.min(420, Ext.get(document.body).getHeight() - 150),
                limitScales: !0,
                map: Ext.applyIf({
                  controls: [new OpenLayers.Control.Navigation({
                    zoomWheelEnabled: !1,
                    zoomBoxEnabled: !1
                  }), new OpenLayers.Control.PanPanel, new OpenLayers.Control.ZoomPanel, new OpenLayers.Control.Attribution],
                  eventListeners: {
                    preaddlayer: function(a) {
                      return h(a.layer)
                    }
                  }
                }, f.initialConfig.map),
                items: [{
                  xtype: "gx_zoomslider",
                  vertical: !0,
                  height: 100,
                  aggressive: !0
                }],
                listeners: {
                  afterlayout: function() {
                    d.setWidth(Math.max(360, this.getWidth() + 24));
                    d.center()
                  }
                }
              },
              printProvider: a,
              includeLegend: this.includeLegend,
              legend: b,
              sourceMap: f
            })],
            listeners: {
              beforedestroy: e
            }
          })
          },
          k = function() {
          d.show();
          d.setWidth(0);
          var a = 0;
          d.items.get(0).items.get(0).items.each(function(b) {
            b.getEl() && (a += b.getWidth())
          });
          d.setWidth(Math.max(d.items.get(0).printMapPanel.getWidth(), a + 20));
          d.center()
          };
      return b
    }
  }
});
Ext.preg(gxp.plugins.Print.prototype.ptype, gxp.plugins.Print);
Ext.namespace("gxp.plugins");
gxp.plugins.QueryForm = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_queryform",
  featureManager: null,
  autoHide: !1,
  schema: null,
  queryActionText: "Query",
  cancelButtonText: "Cancel",
  queryMenuText: "Query layer",
  queryActionTip: "Query the selected layer",
  queryByLocationText: "Query by current map extent",
  queryByAttributesText: "Query by attributes",
  queryMsg: "Querying...",
  noFeaturesTitle: "No Match",
  noFeaturesMessage: "Your query did not return any results.",
  outputAction: 0,
  autoExpand: null,
  addActions: function(a) {
    !this.initialConfig.actions && !a && (a = [{
      text: this.queryActionText,
      menuText: this.queryMenuText,
      iconCls: "gxp-icon-find",
      tooltip: this.queryActionTip,
      disabled: !0,
      toggleGroup: this.toggleGroup,
      enableToggle: !0,
      allowDepress: !0,
      toggleHandler: function(a, c) {
        if (this.autoExpand && 0 < this.output.length) {
          var d = Ext.getCmp(this.autoExpand);
          d[c ? "expand" : "collapse"]();
          c ? (d.expand(), d.ownerCt && d.ownerCt instanceof Ext.Panel && d.ownerCt.expand()) : this.target.tools[this.featureManager].loadFeatures()
        }
      },
      scope: this
    }]);
    this.actions = gxp.plugins.QueryForm.superclass.addActions.apply(this, a);
    if (null !== this.actionTarget && this.actions) this.target.tools[this.featureManager].on("layerchange", function(a, c, d) {
      for (a = this.actions.length - 1; 0 <= a; --a) this.actions[a].setDisabled(!d)
    }, this)
  },
  addOutput: function(a) {
    var b = this.target.tools[this.featureManager],
        a = Ext.apply({
        border: !1,
        bodyStyle: "padding: 10px",
        layout: "form",
        width: 320,
        autoScroll: !0,
        items: [{
          xtype: "fieldset",
          ref: "spatialFieldset",
          title: this.queryByLocationText,
          anchor: "97%",
          style: "margin-bottom:0; border-left-color:transparent; border-right-color:transparent; border-width:1px 1px 0 1px; padding-bottom:0",
          checkboxToggle: !0
        }, {
          xtype: "fieldset",
          ref: "attributeFieldset",
          title: this.queryByAttributesText,
          anchor: "97%",
          style: "margin-bottom:0",
          checkboxToggle: !0
        }],
        bbar: ["->",
        {
          text: this.cancelButtonText,
          iconCls: "cancel",
          handler: function() {
            var a = this.outputTarget ? c.ownerCt : c.ownerCt.ownerCt;
            a && a instanceof Ext.Window && a.hide();
            g(b, b.layerRecord, b.schema);
            b.loadFeatures()
          }
        }, {
          text: this.queryActionText,
          iconCls: "gxp-icon-find",
          handler: function() {
            var a = [];
            !0 !== c.spatialFieldset.collapsed && a.push(new OpenLayers.Filter.Spatial({
              type: OpenLayers.Filter.Spatial.BBOX,
              property: b.featureStore.geometryName,
              value: this.target.mapPanel.map.getExtent()
            }));
            if (!0 !== c.attributeFieldset.collapsed) {
              var d = c.filterBuilder.getFilter();
              d && a.push(d)
            }
            b.loadFeatures(1 < a.length ? new OpenLayers.Filter.Logical({
              type: OpenLayers.Filter.Logical.AND,
              filters: a
            }) : a[0])
          },
          scope: this
        }]
      }, a || {}),
        c = gxp.plugins.QueryForm.superclass.addOutput.call(this, a),
        d = null,
        e = !0;
    if (this.autoExpand) {
      var d = Ext.getCmp(this.autoExpand),
          f = function() {
          e && (d.un("expand", f), d.un("collapse", f), d = null);
          e = !0
          };
      d.on({
        expand: f,
        collapse: f
      })
    }
    var g = function(a, b, f) {
      c.attributeFieldset.removeAll();
      c.setDisabled(!f);
      d && (e = !1, d[f ? "expand" : "collapse"](), f && d && d.ownerCt && d.ownerCt instanceof Ext.Panel && d.ownerCt.expand());
      f ? (c.attributeFieldset.add({
        xtype: "gxp_filterbuilder",
        ref: "../filterBuilder",
        attributes: f,
        allowBlank: !0,
        allowGroups: !1
      }), c.spatialFieldset.expand(), c.attributeFieldset.expand()) : (c.attributeFieldset.rendered && c.attributeFieldset.collapse(), c.spatialFieldset.rendered && c.spatialFieldset.collapse());
      c.attributeFieldset.doLayout()
    };
    b.on("layerchange", g);
    g(b, b.layerRecord, b.schema);
    b.on({
      beforequery: function() {
        (new Ext.LoadMask(c.getEl(), {
          store: b.featureStore,
          msg: this.queryMsg
        })).show()
      },
      query: function(a, b) {
        if (b && null !== this.target.tools[this.featureManager].featureStore && (b.getCount() || Ext.Msg.show({
          title: this.noFeaturesTitle,
          msg: this.noFeaturesMessage,
          buttons: Ext.Msg.OK,
          icon: Ext.Msg.INFO
        }), this.autoHide)) {
          var d = this.outputTarget ? c.ownerCt : c.ownerCt.ownerCt;
          d instanceof Ext.Window && d.hide()
        }
      },
      scope: this
    });
    return c
  }
});
Ext.preg(gxp.plugins.QueryForm.prototype.ptype, gxp.plugins.QueryForm);
Ext.namespace("gxp.plugins");
gxp.plugins.RemoveLayer = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_removelayer",
  removeMenuText: "Remove layer",
  removeActionTip: "Remove layer",
  addActions: function() {
    var a, b = gxp.plugins.RemoveLayer.superclass.addActions.apply(this, [{
      menuText: this.removeMenuText,
      iconCls: "gxp-icon-removelayers",
      disabled: !0,
      tooltip: this.removeActionTip,
      handler: function() {
        var b = a;
        b && this.target.mapPanel.layers.remove(b)
      },
      scope: this
    }]),
        c = b[0];
    this.target.on("layerselectionchange", function(b) {
      a = b;
      c.setDisabled(1 >= this.target.mapPanel.layers.getCount() || !b)
    }, this);
    var d = function(b) {
      c.setDisabled(!a || 1 >= b.getCount())
    };
    this.target.mapPanel.layers.on({
      add: d,
      remove: d
    });
    return b
  }
});
Ext.preg(gxp.plugins.RemoveLayer.prototype.ptype, gxp.plugins.RemoveLayer);
Ext.namespace("gxp.plugins");
gxp.plugins.SelectedFeatureActions = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_selectedfeatureactions",
  addActions: function() {
    for (var a = this.target.tools[this.featureManager], b = this.actions.length, c = Array(b), d = this, e = 0; e < b; ++e) c[e] = Ext.apply({
      iconCls: "process",
      disabled: !0,
      handler: function() {
        var b = a.featureLayer.selectedFeatures[0],
            c = new Ext.Template(this.urlTemplate),
            e = Ext.applyIf(this.outputConfig || {}, d.initialConfig.outputConfig);
        d.outputConfig = Ext.apply(e, {
          title: this.menuText,
          bodyCfg: {
            tag: "iframe",
            src: c.apply(Ext.applyIf({
              fid: b.fid.split(".").pop(),
              layer: a.layerRecord.get("name")
            }, b.attributes)),
            style: {
              border: "0px none"
            }
          }
        });
        d.addOutput()
      }
    }, this.actions[e]);
    a.featureLayer.events.on({
      featureselected: function(a) {
        for (var a = 1 != a.feature.layer.selectedFeatures.length, b = c.length - 1; 0 <= b; --b) c[b].setDisabled(a)
      },
      featureunselected: function(a) {
        if (0 == a.feature.layer.selectedFeatures.length) for (a = c.length - 1; 0 <= a; --a) c[a].disable()
      },
      scope: this
    });
    gxp.plugins.SelectedFeatureActions.superclass.addActions.apply(this, [c])
  }
});
Ext.preg(gxp.plugins.SelectedFeatureActions.prototype.ptype, gxp.plugins.SelectedFeatureActions);
Ext.namespace("gxp.plugins");
gxp.plugins.SnappingAgent = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_snappingagent",
  init: function(a) {
    gxp.plugins.SnappingAgent.superclass.init.apply(this, arguments);
    this.snappingTargets = [];
    this.controls = {};
    this.setSnappingTargets(this.targets)
  },
  setSnappingTargets: function(a) {
    this.clearSnappingTargets();
    if (a) for (var b = 0, c = a.length; b < c; ++b) this.addSnappingTarget(a[b])
  },
  clearSnappingTargets: function() {
    for (var a, b = 0, c = this.snappingTargets.length; b < c; ++b) a = this.snappingTargets[b], a.layer && a.layer.destroy();
    this.snappingTargets.length = 0
  },
  addSnappingTarget: function(a) {
    var a = Ext.apply({}, a),
        b = this.target.mapPanel.map,
        c = new OpenLayers.Layer.Vector(a.name, {
        strategies: [new OpenLayers.Strategy.BBOX({
          ratio: 1.5,
          autoActivate: !1
        })],
        displayInLayerSwitcher: !1,
        visibility: !1,
        minResolution: a.minResolution,
        maxResolution: a.maxResolution
      });
    a.layer = c;
    this.snappingTargets.push(a);
    var d = new gxp.plugins.FeatureManager({
      maxFeatures: null,
      paging: !1,
      layer: {
        source: a.source,
        name: a.name
      },
      listeners: {
        layerchange: function() {
          c.protocol =
          d.featureStore.proxy.protocol;
          b.addLayer(c);
          b.events.on({
            moveend: function() {
              this.updateSnappingTarget(a)
            },
            scope: this
          });
          this.updateSnappingTarget(a);
          this.target.on({
            featureedit: function(b, c) {
              c.name == a.name && c.source == a.source && this.updateSnappingTarget(a, {
                force: !0
              })
            },
            scope: this
          })
        },
        scope: this
      }
    });
    d.init(this.target)
  },
  updateSnappingTarget: function(a, b) {
    var c = a.minResolution || Number.NEGATIVE_INFINITY,
        d = a.maxResolution || Number.POSITIVE_INFINITY,
        e = this.target.mapPanel.map.getResolution();
    if (c <= e && e < d) c =
    a.layer.visibility, a.layer.visibility = !0, a.layer.strategies[0].update(b), a.layer.visibility = c
  },
  createSnappingControl: function(a) {
    return new OpenLayers.Control.Snapping(Ext.applyIf({
      layer: a
    }, this.initialConfig.controlOptions || this.initialConfig.options || {}))
  },
  registerEditor: function(a) {
    var b = this.createSnappingControl(a.getFeatureManager().featureLayer);
    this.controls[a.id] = b;
    a.on({
      layereditable: this.onLayerEditable,
      featureeditable: this.onFeatureEditable,
      scope: this
    })
  },
  onLayerEditable: function(a, b, c) {
    a =
    this.controls[a.id];
    if (c) {
      for (var c = [], d, e, f = b.get("source"), g = b.get("name"), h = 0, j = this.snappingTargets.length; h < j; ++h) if (b = this.snappingTargets[h], b.restrictedLayers) {
        e = !1;
        for (var k = 0, l = b.restrictedLayers.length; k < l; ++k) if (d = b.restrictedLayers[k], d.source === f && d.name === g) {
          e = !0;
          break
        }
        e && c.push(b)
      } else c.push(b);
      a.setTargets(c);
      a.activate()
    } else a.deactivate()
  },
  onFeatureEditable: function(a, b, c) {
    for (var d = a.getFeatureManager().layerRecord, a = d.get("source"), d = d.get("name"), e, f, g, h = 0, j = this.snappingTargets.length; h < j; ++h) if (e = this.snappingTargets[h], a === e.source && d === e.name) f = this.targets[h].filter, !b || !b.fid || !c ? e.filter = f : (g = new OpenLayers.Filter.Logical({
      type: OpenLayers.Filter.Logical.NOT,
      filters: [new OpenLayers.Filter.FeatureId({
        fids: [b.fid]
      })]
    }), e.filter = f ? new OpenLayers.Filter.Logical({
      type: OpenLayers.Filter.Logical.AND,
      filters: [f, g]
    }) : g)
  }
});
Ext.preg(gxp.plugins.SnappingAgent.prototype.ptype, gxp.plugins.SnappingAgent);
Ext.namespace("gxp.plugins");
gxp.plugins.StamenSource = Ext.extend(gxp.plugins.LayerSource, {
  ptype: "gxp_stamensource",
  title: "Stamen Design Layers",
  attribution: "Map tiles by <a href='http://stamen.com'>Stamen Design</a>, under <a href='http://creativecommons.org/licenses/by/3.0'>CC BY 3.0</a>. Data by <a href='http://openstreetmap.org'>OpenStreetMap</a>, under <a href='http://creativecommons.org/licenses/by-sa/3.0'>CC BY SA</a>.",
  tonerTitle: "Toner",
  tonerHybridTitle: "Toner Hybrid",
  tonerLabelsTitle: "Toner Labels",
  tonerLinesTitle: "Toner Lines",
  tonerBackgroundTitle: "Toner Background",
  tonerLiteTitle: "Toner Lite",
  terrainTitle: "Terrain",
  terrainLabelsTitle: "Terrain Labels",
  terrainLinesTitle: "Terrain Lines",
  terrainBackgroundTitle: "Terrain Background",
  watercolorTitle: "Watercolor",
  createStore: function() {
    for (var a = {
      projection: "EPSG:900913",
      numZoomLevels: 20,
      attribution: this.attribution,
      buffer: 0,
      transitionEffect: "resize",
      tileOptions: {
        crossOriginKeyword: null
      }
    }, b = [{
      name: "toner",
      type: "png"
    }, {
      name: "toner-hybrid",
      type: "png"
    }, {
      name: "toner-labels",
      type: "png"
    }, {
      name: "toner-lines",
      type: "png"
    }, {
      name: "toner-background",
      type: "png"
    }, {
      name: "toner-lite",
      type: "png"
    }, {
      name: "terrain",
      type: "png",
      numZoomLevels: 15,
      maxResolution: 9783.939619140625
    }, {
      name: "terrain-labels",
      type: "png",
      numZoomLevels: 15,
      maxResolution: 9783.939619140625
    }, {
      name: "terrain-lines",
      type: "png",
      numZoomLevels: 15,
      maxResolution: 9783.939619140625
    }, {
      name: "terrain-background",
      type: "png",
      numZoomLevels: 15,
      maxResolution: 9783.939619140625
    }, {
      name: "watercolor",
      type: "jpg"
    }], c = b.length, d = Array(c), e, f = 0; f < c; ++f) e =
    b[f], d[f] = new OpenLayers.Layer.OSM(this[OpenLayers.String.camelize(e.name) + "Title"], [
      ["http://tile.stamen.com/", e.name, "/${z}/${x}/${y}.", e.type].join(""), ["http://a.tile.stamen.com/", e.name, "/${z}/${x}/${y}.", e.type].join(""), ["http://b.tile.stamen.com/", e.name, "/${z}/${x}/${y}.", e.type].join(""), ["http://c.tile.stamen.com/", e.name, "/${z}/${x}/${y}.", e.type].join(""), ["http://d.tile.stamen.com/", e.name, "/${z}/${x}/${y}.", e.type].join("")], OpenLayers.Util.applyDefaults({
      layername: e.name,
      numZoomLevels: e.numZoomLevels,
      maxResolution: e.maxResolution
    }, a));
    this.store = new GeoExt.data.LayerStore({
      layers: d,
      fields: [{
        name: "source",
        type: "string"
      }, {
        name: "name",
        type: "string",
        mapping: "layername"
      }, {
        name: "abstract",
        type: "string",
        mapping: "attribution"
      }, {
        name: "group",
        type: "string",
        defaultValue: "background"
      }, {
        name: "fixed",
        type: "boolean",
        defaultValue: !0
      }, {
        name: "selected",
        type: "boolean"
      }]
    });
    this.store.each(function(a) {
      -1 != a.get("name").search(/labels|lines/i) && a.set("group", "")
    });
    this.fireEvent("ready", this)
  },
  createLayerRecord: function(a) {
    var b, c = this.store.findExact("name", a.name);
    if (-1 < c) {
      b = this.store.getAt(c).copy(Ext.data.Record.id({}));
      c = b.getLayer().clone();
      a.title && (c.setName(a.title), b.set("title", a.title));
      if ("visibility" in a) c.visibility = a.visibility;
      b.set("selected", a.selected || !1);
      b.set("source", a.source);
      b.set("name", a.name);
      "group" in a && b.set("group", a.group);
      b.data.layer = c;
      b.commit()
    }
    return b
  }
});
Ext.preg(gxp.plugins.StamenSource.prototype.ptype, gxp.plugins.StamenSource);
Ext.namespace("gxp");
gxp.RulePanel = Ext.extend(Ext.TabPanel, {
  fonts: void 0,
  symbolType: "Point",
  rule: null,
  attributes: null,
  nestedFilters: !0,
  minScaleDenominatorLimit: 1.577757414193268E9 * Math.pow(0.5, 19) * OpenLayers.DOTS_PER_INCH / 256,
  maxScaleDenominatorLimit: 1.577757414193268E9 * OpenLayers.DOTS_PER_INCH / 256,
  scaleLevels: 20,
  scaleSliderTemplate: "{scaleType} Scale 1:{scale}",
  modifyScaleTipContext: Ext.emptyFn,
  labelFeaturesText: "Label Features",
  labelsText: "Labels",
  basicText: "Basic",
  advancedText: "Advanced",
  limitByScaleText: "Limit by scale",
  limitByConditionText: "Limit by condition",
  symbolText: "Symbol",
  nameText: "Name",
  initComponent: function() {
    Ext.applyIf(this, {
      plain: !0,
      border: !1
    });
    if (this.rule) {
      if (!this.initialConfig.symbolType) this.symbolType = this.getSymbolTypeFromRule(this.rule) || this.symbolType
    } else this.rule = new OpenLayers.Rule({
      name: this.uniqueRuleName()
    });
    this.activeTab = 0;
    this.textSymbolizer = new gxp.TextSymbolizer({
      symbolizer: this.getTextSymbolizer(),
      attributes: this.attributes,
      fonts: this.fonts,
      listeners: {
        change: function() {
          this.fireEvent("change", this, this.rule)
        },
        scope: this
      }
    });
    this.scaleLimitPanel = new gxp.ScaleLimitPanel({
      maxScaleDenominator: this.rule.maxScaleDenominator || void 0,
      limitMaxScaleDenominator: !! this.rule.maxScaleDenominator,
      maxScaleDenominatorLimit: this.maxScaleDenominatorLimit,
      minScaleDenominator: this.rule.minScaleDenominator || void 0,
      limitMinScaleDenominator: !! this.rule.minScaleDenominator,
      minScaleDenominatorLimit: this.minScaleDenominatorLimit,
      scaleLevels: this.scaleLevels,
      scaleSliderTemplate: this.scaleSliderTemplate,
      modifyScaleTipContext: this.modifyScaleTipContext,
      listeners: {
        change: function(a, b, c) {
          this.rule.minScaleDenominator = b;
          this.rule.maxScaleDenominator = c;
          this.fireEvent("change", this, this.rule)
        },
        scope: this
      }
    });
    this.filterBuilder = new gxp.FilterBuilder({
      allowGroups: this.nestedFilters,
      filter: this.rule && this.rule.filter && this.rule.filter.clone(),
      attributes: this.attributes,
      listeners: {
        change: function(a) {
          this.rule.filter = a.getFilter();
          this.fireEvent("change", this, this.rule)
        },
        scope: this
      }
    });
    this.items = [{
      title: this.labelsText,
      autoScroll: !0,
      bodyStyle: {
        padding: "10px"
      },
      items: [{
        xtype: "fieldset",
        title: this.labelFeaturesText,
        autoHeight: !0,
        checkboxToggle: !0,
        collapsed: !this.hasTextSymbolizer(!0),
        items: [this.textSymbolizer],
        listeners: {
          collapse: function() {
            OpenLayers.Util.removeItem(this.rule.symbolizers, this.getTextSymbolizer());
            this.fireEvent("change", this, this.rule)
          },
          expand: function() {
            this.setTextSymbolizer(this.textSymbolizer.symbolizer);
            this.textSymbolizer.doLayout();
            this.fireEvent("change", this, this.rule)
          },
          scope: this
        }
      }]
    }];
    if (this.getSymbolTypeFromRule(this.rule) || this.symbolType) this.items = [{
      title: this.basicText,
      autoScroll: !0,
      items: [this.createHeaderPanel(), this.createSymbolizerPanel()]
    },
    this.items[0],
    {
      title: this.advancedText,
      defaults: {
        style: {
          margin: "7px"
        }
      },
      autoScroll: !0,
      items: [{
        xtype: "fieldset",
        title: this.limitByScaleText,
        checkboxToggle: !0,
        collapsed: !(this.rule && (this.rule.minScaleDenominator || this.rule.maxScaleDenominator)),
        autoHeight: !0,
        items: [this.scaleLimitPanel],
        listeners: {
          collapse: function() {
            delete this.rule.minScaleDenominator;
            delete this.rule.maxScaleDenominator;
            this.fireEvent("change", this, this.rule)
          },
          expand: function() {
            var a = this.getActiveTab();
            this.activeTab = null;
            this.setActiveTab(a);
            a = !1;
            if (this.scaleLimitPanel.limitMinScaleDenominator) this.rule.minScaleDenominator = this.scaleLimitPanel.minScaleDenominator, a = !0;
            if (this.scaleLimitPanel.limitMaxScaleDenominator) this.rule.maxScaleDenominator = this.scaleLimitPanel.maxScaleDenominator, a = !0;
            a && this.fireEvent("change", this, this.rule)
          },
          scope: this
        }
      }, {
        xtype: "fieldset",
        title: this.limitByConditionText,
        checkboxToggle: !0,
        collapsed: !(this.rule && this.rule.filter),
        autoHeight: !0,
        items: [this.filterBuilder],
        listeners: {
          collapse: function() {
            delete this.rule.filter;
            this.fireEvent("change", this, this.rule)
          },
          expand: function() {
            this.rule.filter = this.filterBuilder.getFilter();
            this.fireEvent("change", this, this.rule)
          },
          scope: this
        }
      }]
    }];
    this.items[0].autoHeight = !0;
    this.addEvents("change");
    this.on({
      tabchange: function(a, b) {
        b.doLayout()
      },
      scope: this
    });
    gxp.RulePanel.superclass.initComponent.call(this)
  },
  hasTextSymbolizer: function(a) {
    for (var b, c, d = 0, e = this.rule.symbolizers.length; d < e; ++d) if (b = this.rule.symbolizers[d], b instanceof OpenLayers.Symbolizer.Text && (!0 !== a || b.label)) {
      c = b;
      break
    }
    return c
  },
  getTextSymbolizer: function() {
    var a = this.hasTextSymbolizer();
    a || (a = new OpenLayers.Symbolizer.Text({
      graphic: !1
    }));
    return a
  },
  setTextSymbolizer: function(a) {
    for (var b, c = 0, d = this.rule.symbolizers.length; c < d; ++c) if (this.rule.symbolizers[c] instanceof OpenLayers.Symbolizer.Text) {
      this.rule.symbolizers[c] = a;
      b = !0;
      break
    }
    b || this.rule.symbolizers.push(a)
  },
  uniqueRuleName: function() {
    return OpenLayers.Util.createUniqueID("rule_")
  },
  createHeaderPanel: function() {
    this.symbolizerSwatch = new GeoExt.FeatureRenderer({
      symbolType: this.symbolType,
      isFormField: !0,
      fieldLabel: this.symbolText
    });
    return {
      xtype: "form",
      border: !1,
      labelAlign: "top",
      defaults: {
        border: !1
      },
      style: {
        padding: "0.3em 0 0 1em"
      },
      items: [{
        layout: "column",
        defaults: {
          border: !1,
          style: {
            "padding-right": "1em"
          }
        },
        items: [{
          layout: "form",
          width: 150,
          items: [{
            xtype: "textfield",
            fieldLabel: this.nameText,
            anchor: "95%",
            value: this.rule && (this.rule.title || this.rule.name || ""),
            listeners: {
              change: function(a, b) {
                this.rule.title = b;
                this.fireEvent("change", this, this.rule)
              },
              scope: this
            }
          }]
        }, {
          layout: "form",
          width: 70,
          items: [this.symbolizerSwatch]
        }]
      }]
    }
  },
  createSymbolizerPanel: function() {
    var a, b, c = OpenLayers.Symbolizer[this.symbolType],
        d = !1;
    if (c) {
      for (var e = 0, f = this.rule.symbolizers.length; e < f; ++e) if (a = this.rule.symbolizers[e], a instanceof c) {
        d = !0;
        b = a;
        break
      }
      b || (b = new c({
        fill: !1,
        stroke: !1
      }))
    } else
    throw Error("Appropriate symbolizer type not included in build: " + this.symbolType);
    this.symbolizerSwatch.setSymbolizers([b], {
      draw: this.symbolizerSwatch.rendered
    });
    a = {
      xtype: "gxp_" + this.symbolType.toLowerCase() + "symbolizer",
      symbolizer: b,
      bodyStyle: {
        padding: "10px"
      },
      border: !1,
      labelWidth: 70,
      defaults: {
        labelWidth: 70
      },
      listeners: {
        change: function(a) {
          this.symbolizerSwatch.setSymbolizers([a], {
            draw: this.symbolizerSwatch.rendered
          });
          d || (this.rule.symbolizers.push(a), d = !0);
          this.fireEvent("change", this, this.rule)
        },
        scope: this
      }
    };
    if ("Point" === this.symbolType && this.pointGraphics) a.pointGraphics = this.pointGraphics;
    return a
  },
  getSymbolTypeFromRule: function(a) {
    for (var b, c, d = 0, e = a.symbolizers.length; d < e; ++d) if (b = a.symbolizers[d], !(b instanceof OpenLayers.Symbolizer.Text)) {
      c = b.CLASS_NAME.split(".").pop();
      break
    }
    return c
  }
});
Ext.reg("gxp_rulepanel", gxp.RulePanel);
Ext.namespace("gxp");
gxp.StylePropertiesDialog = Ext.extend(Ext.Container, {
  titleText: "General",
  nameFieldText: "Name",
  titleFieldText: "Title",
  abstractFieldText: "Abstract",
  userStyle: null,
  initComponent: function() {
    Ext.applyIf(this, {
      layout: "form",
      items: [{
        xtype: "fieldset",
        title: this.titleText,
        labelWidth: 75,
        defaults: {
          xtype: "textfield",
          anchor: "100%",
          listeners: {
            change: function(a, b) {
              this.userStyle[a.name] = b;
              this.fireEvent("change", this, this.userStyle)
            },
            scope: this
          }
        },
        items: [{
          xtype: this.initialConfig.nameEditable ? "textfield" : "displayfield",
          fieldLabel: this.nameFieldText,
          name: "name",
          value: this.userStyle.name,
          maskRe: /[A-Za-z0-9_]/
        }, {
          fieldLabel: this.titleFieldText,
          name: "title",
          value: this.userStyle.title
        }, {
          xtype: "textarea",
          fieldLabel: this.abstractFieldText,
          name: "description",
          value: this.userStyle.description
        }]
      }]
    });
    this.addEvents("change");
    gxp.StylePropertiesDialog.superclass.initComponent.apply(this, arguments)
  }
});
Ext.reg("gxp_stylepropertiesdialog", gxp.StylePropertiesDialog);
Ext.namespace("gxp");
gxp.WMSStylesDialog = Ext.extend(Ext.Container, {
  addStyleText: "Add",
  addStyleTip: "Add a new style",
  chooseStyleText: "Choose style",
  deleteStyleText: "Remove",
  deleteStyleTip: "Delete the selected style",
  editStyleText: "Edit",
  editStyleTip: "Edit the selected style",
  duplicateStyleText: "Duplicate",
  duplicateStyleTip: "Duplicate the selected style",
  addRuleText: "Add",
  addRuleTip: "Add a new rule",
  newRuleText: "New Rule",
  deleteRuleText: "Remove",
  deleteRuleTip: "Delete the selected rule",
  editRuleText: "Edit",
  editRuleTip: "Edit the selected rule",
  duplicateRuleText: "Duplicate",
  duplicateRuleTip: "Duplicate the selected rule",
  cancelText: "Cancel",
  saveText: "Save",
  styleWindowTitle: "User Style: {0}",
  ruleWindowTitle: "Style Rule: {0}",
  stylesFieldsetTitle: "Styles",
  rulesFieldsetTitle: "Rules",
  errorTitle: "Error saving style",
  errorMsg: "There was an error saving the style back to the server.",
  layerRecord: null,
  layerDescription: null,
  symbolType: null,
  stylesStore: null,
  selectedStyle: null,
  selectedRule: null,
  editable: !0,
  modified: !1,
  dialogCls: Ext.Window,
  initComponent: function() {
    this.addEvents("ready", "modified", "styleselected", "beforesaved", "saved");
    Ext.applyIf(this, {
      layout: "form",
      disabled: !0,
      items: [{
        xtype: "fieldset",
        title: this.stylesFieldsetTitle,
        labelWidth: 85,
        style: "margin-bottom: 0;"
      }, {
        xtype: "toolbar",
        style: "border-width: 0 1px 1px 1px; margin-bottom: 10px;",
        items: [{
          xtype: "button",
          iconCls: "add",
          text: this.addStyleText,
          tooltip: this.addStyleTip,
          handler: this.addStyle,
          scope: this
        }, {
          xtype: "button",
          iconCls: "delete",
          text: this.deleteStyleText,
          tooltip: this.deleteStyleTip,
          handler: function() {
            this.stylesStore.remove(this.selectedStyle)
          },
          scope: this
        }, {
          xtype: "button",
          iconCls: "edit",
          text: this.editStyleText,
          tooltip: this.editStyleTip,
          handler: function() {
            this.editStyle()
          },
          scope: this
        }, {
          xtype: "button",
          iconCls: "duplicate",
          text: this.duplicateStyleText,
          tooltip: this.duplicateStyleTip,
          handler: function() {
            var a = this.selectedStyle,
                b = a.get("userStyle").clone();
            b.isDefault = !1;
            b.name = this.newStyleName();
            var c = this.stylesStore;
            c.add(new c.recordType({
              name: b.name,
              title: b.title,
              "abstract": b.description,
              userStyle: b
            }));
            this.editStyle(a)
          },
          scope: this
        }]
      }]
    });
    this.createStylesStore();
    this.on({
      beforesaved: function() {
        this._saving = !0
      },
      saved: function() {
        delete this._saving
      },
      savefailed: function() {
        Ext.Msg.show({
          title: this.errorTitle,
          msg: this.errorMsg,
          icon: Ext.MessageBox.ERROR,
          buttons: {
            ok: !0
          }
        });
        delete this._saving
      },
      render: function() {
        gxp.util.dispatch([this.getStyles], function() {
          this.enable()
        }, this)
      },
      scope: this
    });
    gxp.WMSStylesDialog.superclass.initComponent.apply(this, arguments)
  },
  addStyle: function() {
    if (this._ready) {
      var a = this.selectedStyle,
          b = this.stylesStore,
          c =
          new OpenLayers.Style(null, {
          name: this.newStyleName(),
          rules: [this.createRule()]
        });
      b.add(new b.recordType({
        name: c.name,
        userStyle: c
      }));
      this.editStyle(a)
    } else this.on("ready", this.addStyle, this)
  },
  editStyle: function(a) {
    var b = this.selectedStyle.get("userStyle"),
        c = new this.dialogCls(Ext.apply({
        bbar: ["->",
        {
          text: this.cancelText,
          iconCls: "cancel",
          handler: function() {
            c.propertiesDialog.userStyle = b;
            c.destroy();
            if (a) this._cancelling = !0, this.stylesStore.remove(this.selectedStyle), this.changeStyle(a, {
              updateCombo: !0,
              markModified: !0
            }), delete this._cancelling
          },
          scope: this
        }, {
          text: this.saveText,
          iconCls: "save",
          handler: function() {
            c.destroy()
          }
        }]
      }, {
        title: String.format(this.styleWindowTitle, b.title || b.name),
        shortTitle: b.title || b.name,
        bodyBorder: !1,
        autoHeight: !0,
        width: 300,
        modal: !0,
        items: {
          border: !1,
          items: {
            xtype: "gxp_stylepropertiesdialog",
            ref: "../propertiesDialog",
            userStyle: b.clone(),
            nameEditable: !1,
            style: "padding: 10px;"
          }
        },
        listeners: {
          beforedestroy: function() {
            this.selectedStyle.set("userStyle", c.propertiesDialog.userStyle)
          },
          scope: this
        }
      }));
    this.showDlg(c)
  },
  createSLD: function(a) {
    var a = a || {},
        b = {
        version: "1.0.0",
        namedLayers: {}
        },
        c = this.layerRecord.get("name");
    b.namedLayers[c] = {
      name: c,
      userStyles: []
    };
    this.stylesStore.each(function(d) {
      (!a.userStyles || -1 !== a.userStyles.indexOf(d.get("name"))) && b.namedLayers[c].userStyles.push(d.get("userStyle"))
    });
    return (new OpenLayers.Format.SLD({
      multipleSymbolizers: !0,
      profile: "GeoServer"
    })).write(b)
  },
  saveStyles: function(a) {
    !0 === this.modified && this.fireEvent("beforesaved", this, a)
  },
  updateStyleRemoveButton: function() {
    var a =
    this.selectedStyle && this.selectedStyle.get("userStyle");
    this.items.get(1).items.get(1).setDisabled(!a || 1 >= this.stylesStore.getCount() || !0 === a.isDefault)
  },
  updateRuleRemoveButton: function() {
    this.items.get(3).items.get(1).setDisabled(!this.selectedRule || 2 > this.items.get(2).items.get(0).rules.length)
  },
  createRule: function() {
    return new OpenLayers.Rule({
      symbolizers: [new OpenLayers.Symbolizer[this.symbolType]]
    })
  },
  addRulesFieldSet: function() {
    var a = new Ext.form.FieldSet({
      itemId: "rulesfieldset",
      title: this.rulesFieldsetTitle,
      autoScroll: !0,
      style: "margin-bottom: 0;",
      hideMode: "offsets",
      hidden: !0
    }),
        b = new Ext.Toolbar({
        style: "border-width: 0 1px 1px 1px;",
        hidden: !0,
        items: [{
          xtype: "button",
          iconCls: "add",
          text: this.addRuleText,
          tooltip: this.addRuleTip,
          handler: this.addRule,
          scope: this
        }, {
          xtype: "button",
          iconCls: "delete",
          text: this.deleteRuleText,
          tooltip: this.deleteRuleTip,
          handler: this.removeRule,
          scope: this,
          disabled: !0
        }, {
          xtype: "button",
          iconCls: "edit",
          text: this.editRuleText,
          toolitp: this.editRuleTip,
          handler: function() {
            this.layerDescription ? this.editRule() : this.describeLayer(this.editRule)
          },
          scope: this,
          disabled: !0
        }, {
          xtype: "button",
          iconCls: "duplicate",
          text: this.duplicateRuleText,
          tip: this.duplicateRuleTip,
          handler: this.duplicateRule,
          scope: this,
          disabled: !0
        }]
      });
    this.add(a, b);
    this.doLayout();
    return a
  },
  addRule: function() {
    var a = this.items.get(2).items.get(0);
    this.selectedStyle.get("userStyle").rules.push(this.createRule());
    a.update();
    this.selectedStyle.store.afterEdit(this.selectedStyle);
    this.updateRuleRemoveButton()
  },
  removeRule: function() {
    var a =
    this.selectedRule;
    this.items.get(2).items.get(0).unselect();
    this.selectedStyle.get("userStyle").rules.remove(a);
    this.afterRuleChange()
  },
  duplicateRule: function() {
    var a = this.items.get(2).items.get(0),
        b = this.selectedRule.clone();
    this.selectedStyle.get("userStyle").rules.push(b);
    a.update();
    this.selectedStyle.store.afterEdit(this.selectedStyle);
    this.updateRuleRemoveButton()
  },
  editRule: function() {
    var a = this.selectedRule,
        b = a.clone(),
        c = new this.dialogCls({
        title: String.format(this.ruleWindowTitle, a.title || a.name || this.newRuleText),
        shortTitle: a.title || a.name || this.newRuleText,
        layout: "fit",
        width: 320,
        height: 450,
        modal: !0,
        items: [{
          xtype: "gxp_rulepanel",
          ref: "rulePanel",
          symbolType: this.symbolType,
          rule: a,
          attributes: new GeoExt.data.AttributeStore({
            url: this.layerDescription.owsURL,
            baseParams: {
              SERVICE: this.layerDescription.owsType,
              REQUEST: "DescribeFeatureType",
              TYPENAME: this.layerDescription.typeName
            },
            method: "GET",
            disableCaching: !1
          }),
          autoScroll: !0,
          border: !1,
          defaults: {
            autoHeight: !0,
            hideMode: "offsets"
          },
          listeners: {
            change: this.saveRule,
            tabchange: function() {
              c instanceof Ext.Window && c.syncShadow()
            },
            scope: this
          }
        }],
        bbar: ["->",
        {
          text: this.cancelText,
          iconCls: "cancel",
          handler: function() {
            this.saveRule(c.rulePanel, b);
            c.destroy()
          },
          scope: this
        }, {
          text: this.saveText,
          iconCls: "save",
          handler: function() {
            c.destroy()
          }
        }]
      });
    this.showDlg(c)
  },
  saveRule: function(a, b) {
    var c = this.selectedStyle;
    this.items.get(2).items.get(0);
    var c = c.get("userStyle"),
        d = c.rules.indexOf(this.selectedRule);
    c.rules[d] = b;
    this.afterRuleChange(b)
  },
  afterRuleChange: function(a) {
    this.items.get(2).items.get(0);
    this.selectedRule = a;
    this.selectedStyle.store.afterEdit(this.selectedStyle)
  },
  setRulesFieldSetVisible: function(a) {
    this.items.get(3).setVisible(a && this.editable);
    this.items.get(2).setVisible(a);
    this.doLayout()
  },
  parseSLD: function(a) {
    var b = a.responseXML;
    if (!b || !b.documentElement) b = (new OpenLayers.Format.XML).read(a.responseText);
    var a = this.layerRecord.getLayer().params,
        c = this.initialConfig.styleName || a.STYLES;
    if (c) this.selectedStyle = this.stylesStore.getAt(this.stylesStore.findExact("name", c));
    var d = new OpenLayers.Format.SLD({
      profile: "GeoServer",
      multipleSymbolizers: !0
    });
    try {
      var e = d.read(b).namedLayers[a.LAYERS].userStyles,
          f;
      if (a.SLD_BODY) f = d.read(a.SLD_BODY).namedLayers[a.LAYERS].userStyles, Array.prototype.push.apply(e, f);
      this.stylesStore.removeAll();
      this.selectedStyle = null;
      for (var g, h, j, k, b = 0, l = e.length; b < l; ++b) {
        g = e[b];
        j = this.stylesStore.findExact("name", g.name); - 1 !== j && this.stylesStore.removeAt(j);
        h = new this.stylesStore.recordType({
          name: g.name,
          title: g.title,
          "abstract": g.description,
          userStyle: g
        });
        h.phantom = !1;
        this.stylesStore.add(h);
        if (!this.selectedStyle && (c === g.name || !c && !0 === g.isDefault)) this.selectedStyle = h;
        !0 === g.isDefault && (k = h)
      }
      if (!this.selectedStyle) this.selectedStyle = k;
      this.addRulesFieldSet();
      this.createLegend(this.selectedStyle.get("userStyle").rules);
      this.stylesStoreReady();
      a.SLD_BODY && this.markModified()
    } catch (n) {
      window.console && console.warn(n.message), this.setupNonEditable()
    }
  },
  createLegend: function(a) {
    var b = OpenLayers.Symbolizer.Raster;
    if (b && a[0] && a[0].symbolizers[0] instanceof b) throw Error("Raster symbolizers are not supported.");
    this.addVectorLegend(a)
  },
  setupNonEditable: function() {
    this.editable = !1;
    this.items.get(1).hide();
    (this.getComponent("rulesfieldset") || this.addRulesFieldSet()).add(this.createLegendImage());
    this.doLayout();
    this.items.get(3).hide();
    this.stylesStoreReady()
  },
  stylesStoreReady: function() {
    this.stylesStore.commitChanges();
    this.stylesStore.on({
      load: function() {
        this.addStylesCombo();
        this.updateStyleRemoveButton()
      },
      add: function(a, b, c) {
        this.updateStyleRemoveButton();
        b = this.items.get(0).items.get(0);
        this.markModified();
        b.fireEvent("select", b, a.getAt(c), c);
        b.setValue(this.selectedStyle.get("name"))
      },
      remove: function(a, b, c) {
        if (!this._cancelling) this._removing = !0, b = Math.min(c, a.getCount() - 1), this.updateStyleRemoveButton(), c = this.items.get(0).items.get(0), this.markModified(), c.fireEvent("select", c, a.getAt(b), b), c.setValue(this.selectedStyle.get("name")), delete this._removing
      },
      update: function(a, b) {
        var c = b.get("userStyle");
        Ext.apply(b.data, {
          name: c.name,
          title: c.title || c.name,
          "abstract": c.description
        });
        this.changeStyle(b, {
          updateCombo: !0,
          markModified: !0
        })
      },
      scope: this
    });
    this.stylesStore.fireEvent("load", this.stylesStore, this.stylesStore.getRange());
    this._ready = !0;
    this.fireEvent("ready")
  },
  markModified: function() {
    if (!1 === this.modified) this.modified = !0;
    this._saving || this.fireEvent("modified", this, this.selectedStyle.get("name"))
  },
  createStylesStore: function() {
    var a = this.layerRecord.get("styles") || [];
    this.stylesStore = new Ext.data.JsonStore({
      data: {
        styles: a
      },
      idProperty: "name",
      root: "styles",
      fields: ["name", "title", "abstract", "legend", "userStyle"],
      listeners: {
        add: function(a, c) {
          for (var d, e = c.length - 1; 0 <= e; --e) d = c[e], a.suspendEvents(), d.get("title") || d.set("title", d.get("name")), a.resumeEvents()
        }
      }
    })
  },
  getStyles: function(a) {
    var b = this.layerRecord.getLayer();
    if (!0 === this.editable) {
      var c = b.params.VERSION;
      1.1 < parseFloat(c) && (c = "1.1.1");
      Ext.Ajax.request({
        url: b.url,
        params: {
          SERVICE: "WMS",
          VERSION: c,
          REQUEST: "GetStyles",
          LAYERS: "" + b.params.LAYERS
        },
        method: "GET",
        disableCaching: !1,
        success: this.parseSLD,
        failure: this.setupNonEditable,
        callback: a,
        scope: this
      })
    } else this.setupNonEditable()
  },
  describeLayer: function(a) {
    if (this.layerDescription) window.setTimeout(function() {
      a.call(this)
    }, 0);
    else {
      var b = this.layerRecord.getLayer(),
          c = b.params.VERSION;
      1.1 < parseFloat(c) && (c = "1.1.1");
      Ext.Ajax.request({
        url: b.url,
        params: {
          SERVICE: "WMS",
          VERSION: c,
          REQUEST: "DescribeLayer",
          LAYERS: "" + b.params.LAYERS
        },
        method: "GET",
        disableCaching: !1,
        success: function(a) {
          this.layerDescription = (new OpenLayers.Format.WMSDescribeLayer).read(a.responseXML && a.responseXML.documentElement ? a.responseXML : a.responseText)[0]
        },
        callback: a,
        scope: this
      })
    }
  },
  addStylesCombo: function() {
    var a = this.stylesStore,
        a = new Ext.form.ComboBox(Ext.apply({
        fieldLabel: this.chooseStyleText,
        store: a,
        editable: !1,
        displayField: "title",
        valueField: "name",
        value: this.selectedStyle ? this.selectedStyle.get("title") : this.layerRecord.getLayer().params.STYLES || "default",
        disabled: !a.getCount(),
        mode: "local",
        typeAhead: !0,
        triggerAction: "all",
        forceSelection: !0,
        anchor: "100%",
        listeners: {
          select: function(a, c) {
            this.changeStyle(c);
            !c.phantom && !this._removing && this.fireEvent("styleselected", this, c.get("name"))
          },
          scope: this
        }
      }, this.initialConfig.stylesComboOptions));
    this.items.get(0).add(a);
    this.doLayout()
  },
  createLegendImage: function() {
    var a = new GeoExt.WMSLegend({
      showTitle: !1,
      layerRecord: this.layerRecord,
      autoScroll: !0,
      defaults: {
        listeners: {
          render: function(b) {
            b.getEl().on({
              load: function(c, d) {
                d.getAttribute("src") != b.defaultImgSrc && (this.setRulesFieldSetVisible(!0), 250 < b.getEl().getHeight() && a.setHeight(250))
              },
              error: function() {
                this.setRulesFieldSetVisible(!1)
              },
              scope: this
            })
          },
          scope: this
        }
      }
    });
    return a
  },
  changeStyle: function(a, b) {
    var b = b || {},
        c = this.items.get(2).items.get(0);
    this.selectedStyle = a;
    this.updateStyleRemoveButton();
    a.get("name");
    if (!0 === this.editable) {
      var d = a.get("userStyle"),
          e = c.rules.indexOf(this.selectedRule);
      c.ownerCt.remove(c);
      this.createLegend(d.rules, {
        selectedRuleIndex: e
      })
    }!0 === b.updateCombo && (this.items.get(0).items.get(0).setValue(d.name), !0 === b.markModified && this.markModified())
  },
  addVectorLegend: function(a, b) {
    b = Ext.applyIf(b || {}, {
      enableDD: !0
    });
    this.symbolType = b.symbolType;
    if (!this.symbolType) {
      var c = ["Point", "Line", "Polygon"];
      highest = 0;
      for (var d = a[0].symbolizers, e, f = d.length - 1; 0 <= f; f--) e = d[f].CLASS_NAME.split(".").pop(), highest = Math.max(highest, c.indexOf(e));
      this.symbolType = c[highest]
    }
    var g = this.items.get(2).add({
      xtype: "gx_vectorlegend",
      showTitle: !1,
      height: 10 < a.length ? 250 : void 0,
      autoScroll: 10 < a.length,
      rules: a,
      symbolType: this.symbolType,
      selectOnClick: !0,
      enableDD: b.enableDD,
      listeners: {
        ruleselected: function(a, b) {
          this.selectedRule = b;
          var c = this.items.get(3).items;
          this.updateRuleRemoveButton();
          c.get(2).enable();
          c.get(3).enable()
        },
        ruleunselected: function() {
          this.selectedRule = null;
          var a = this.items.get(3).items;
          a.get(1).disable();
          a.get(2).disable();
          a.get(3).disable()
        },
        rulemoved: function() {
          this.markModified()
        },
        afterlayout: function() {
          null !== this.selectedRule && null === g.selectedRule && -1 !== g.rules.indexOf(this.selectedRule) && g.selectRuleEntry(this.selectedRule)
        },
        scope: this
      }
    });
    this.setRulesFieldSetVisible(!0);
    return g
  },
  newStyleName: function() {
    var a = this.layerRecord.get("name");
    return a.split(":").pop() + "_" + gxp.util.md5(a + new Date + Math.random()).substr(0, 8)
  },
  showDlg: function(a) {
    a.show()
  }
});
gxp.WMSStylesDialog.createGeoServerStylerConfig = function(a, b) {
  var c = a.getLayer();
  b || (b = a.get("restUrl"));
  b || (b = c.url.split("?").shift().replace(/\/(wms|ows)\/?$/, "/rest"));
  return {
    xtype: "gxp_wmsstylesdialog",
    layerRecord: a,
    plugins: [{
      ptype: "gxp_geoserverstylewriter",
      baseUrl: b
    }],
    listeners: {
      styleselected: function(a, b) {
        c.mergeNewParams({
          styles: b
        })
      },
      modified: function(a) {
        a.saveStyles()
      },
      saved: function(a, b) {
        c.mergeNewParams({
          _olSalt: Math.random(),
          styles: b
        })
      },
      scope: this
    }
  }
};
OpenLayers.Renderer.defaultSymbolizerGXP = {
  fillColor: "#808080",
  fillOpacity: 1,
  strokeColor: "#000000",
  strokeOpacity: 1,
  strokeWidth: 1,
  strokeDashstyle: "solid",
  pointRadius: 3,
  graphicName: "square",
  fontColor: "#000000",
  fontSize: 10,
  haloColor: "#FFFFFF",
  haloOpacity: 1,
  haloRadius: 1,
  labelAlign: "cm"
};
Ext.reg("gxp_wmsstylesdialog", gxp.WMSStylesDialog);
Ext.namespace("gxp.plugins");
gxp.plugins.WMSRasterStylesDialog = {
  isRaster: null,
  init: function(a) {
    Ext.apply(a, gxp.plugins.WMSRasterStylesDialog)
  },
  createRule: function() {
    var a = [new OpenLayers.Symbolizer[this.isRaster ? "Raster" : this.symbolType]];
    return new OpenLayers.Rule({
      symbolizers: a
    })
  },
  addRule: function() {
    var a = this.items.get(2).items.get(0);
    this.isRaster ? (a.rules.push(this.createPseudoRule()), 1 == a.rules.length && a.rules.push(this.createPseudoRule()), this.savePseudoRules()) : (this.selectedStyle.get("userStyle").rules.push(this.createRule()), a.update(), this.selectedStyle.store.afterEdit(this.selectedStyle));
    this.updateRuleRemoveButton()
  },
  removeRule: function() {
    if (this.isRaster) {
      var a = this.items.get(2).items.get(0),
          b = this.selectedRule;
      a.unselect();
      a.rules.remove(b);
      1 == a.rules.length && a.rules.remove(a.rules[0]);
      this.savePseudoRules()
    } else gxp.WMSStylesDialog.prototype.removeRule.apply(this, arguments)
  },
  duplicateRule: function() {
    var a = this.items.get(2).items.get(0);
    if (this.isRaster) a.rules.push(this.createPseudoRule({
      quantity: this.selectedRule.name,
      label: this.selectedRule.title,
      color: this.selectedRule.symbolizers[0].fillColor,
      opacity: this.selectedRule.symbolizers[0].fillOpacity
    })), this.savePseudoRules();
    else {
      var b = this.selectedRule.clone();
      b.name = gxp.util.uniqueName((b.title || b.name) + " (copy)");
      delete b.title;
      this.selectedStyle.get("userStyle").rules.push(b);
      a.update()
    }
    this.updateRuleRemoveButton()
  },
  editRule: function() {
    this.isRaster ? this.editPseudoRule() : gxp.WMSStylesDialog.prototype.editRule.apply(this, arguments)
  },
  editPseudoRule: function() {
    var a =
    this,
        b = this.selectedRule,
        c = new Ext.Window({
        title: "Color Map Entry: " + b.name,
        width: 340,
        autoHeight: !0,
        modal: !0,
        items: [{
          bodyStyle: "padding-top: 5px",
          border: !1,
          defaults: {
            autoHeight: !0,
            hideMode: "offsets"
          },
          items: [{
            xtype: "form",
            border: !1,
            labelAlign: "top",
            defaults: {
              border: !1
            },
            style: {
              padding: "0.3em 0 0 1em"
            },
            items: [{
              layout: "column",
              defaults: {
                border: !1,
                style: {
                  "padding-right": "1em"
                }
              },
              items: [{
                layout: "form",
                width: 70,
                items: [{
                  xtype: "numberfield",
                  anchor: "95%",
                  value: b.name,
                  allowBlank: !1,
                  fieldLabel: "Quantity",
                  validator: function(c) {
                    for (var d =
                    a.items.get(2).items.get(0).rules, g = d.length - 1; 0 <= g; g--) if (b !== d[g] && d[g].name == c) return "Quantity " + c + " is already defined";
                    return !0
                  },
                  listeners: {
                    valid: function(a) {
                      this.selectedRule.name = "" + a.getValue();
                      this.savePseudoRules()
                    },
                    scope: this
                  }
                }]
              }, {
                layout: "form",
                width: 130,
                items: [{
                  xtype: "textfield",
                  fieldLabel: "Label",
                  anchor: "95%",
                  value: b.title,
                  listeners: {
                    valid: function(a) {
                      this.selectedRule.title = a.getValue();
                      this.savePseudoRules()
                    },
                    scope: this
                  }
                }]
              }, {
                layout: "form",
                width: 70,
                items: [new GeoExt.FeatureRenderer({
                  symbolType: this.symbolType,
                  symbolizers: [b.symbolizers[0]],
                  isFormField: !0,
                  fieldLabel: "Appearance"
                })]
              }]
            }]
          }, {
            xtype: "gxp_polygonsymbolizer",
            symbolizer: b.symbolizers[0],
            bodyStyle: {
              padding: "10px"
            },
            border: !1,
            labelWidth: 70,
            defaults: {
              labelWidth: 70
            },
            listeners: {
              change: function(a) {
                var b = c.findByType(GeoExt.FeatureRenderer)[0];
                b.setSymbolizers([a], {
                  draw: b.rendered
                });
                this.selectedRule.symbolizers[0] = a;
                this.savePseudoRules()
              },
              scope: this
            }
          }]
        }]
      }),
        d = c.findByType("gxp_strokesymbolizer")[0];
    d.ownerCt.remove(d);
    c.show()
  },
  savePseudoRules: function() {
    var a =
    this.selectedStyle,
        b = this.items.get(2).items.get(0),
        a = a.get("userStyle"),
        b = b.rules;
    b.sort(function(a, b) {
      var c = parseFloat(a.name),
          d = parseFloat(b.name);
      return c === d ? 0 : c < d ? -1 : 1
    });
    a = a.rules[0].symbolizers[0];
    a.colorMap = 0 < b.length ? Array(b.length) : void 0;
    for (var c, d = 0, e = b.length; d < e; ++d) c = b[d], a.colorMap[d] = {
      quantity: parseFloat(c.name),
      label: c.title || void 0,
      color: c.symbolizers[0].fillColor || void 0,
      opacity: !1 == c.symbolizers[0].fill ? 0 : c.symbolizers[0].fillOpacity
    };
    this.afterRuleChange(this.selectedRule)
  },
  createLegend: function(a, b) {
    var c = OpenLayers.Symbolizer.Raster;
    c && a[0] && a[0].symbolizers[0] instanceof c ? (this.getComponent("rulesfieldset").setTitle("Color Map Entries"), this.isRaster = !0, this.addRasterLegend(a, b)) : (this.isRaster = !1, this.addVectorLegend(a))
  },
  addRasterLegend: function(a, b) {
    for (var b = b || {}, c = a[0].symbolizers[0].colorMap || [], d = [], e = 0, f = c.length; e < f; e++) d.push(this.createPseudoRule(c[e]));
    this.selectedRule = null != b.selectedRuleIndex ? d[b.selectedRuleIndex] : null;
    return this.addVectorLegend(d, {
      symbolType: "Polygon",
      enableDD: !1
    })
  },
  createPseudoRule: function(a) {
    var b = -1;
    if (!a) {
      var c = this.items.get(2);
      if (c.items) {
        rules = c.items.get(0).rules;
        for (c = rules.length - 1; 0 <= c; c--) b = Math.max(b, parseFloat(rules[c].name))
      }
    }
    a = Ext.applyIf(a || {}, {
      quantity: ++b,
      color: "#000000",
      opacity: 1
    });
    return new OpenLayers.Rule({
      title: a.label,
      name: "" + a.quantity,
      symbolizers: [new OpenLayers.Symbolizer.Polygon({
        fillColor: a.color,
        fillOpacity: a.opacity,
        stroke: !1,
        fill: 0 !== a.opacity
      })]
    })
  },
  updateRuleRemoveButton: function() {
    this.items.get(3).items.get(1).setDisabled(!this.selectedRule || !1 === this.isRaster && 1 >= this.items.get(2).items.get(0).rules.length)
  }
};
Ext.preg("gxp_wmsrasterstylesdialog", gxp.plugins.WMSRasterStylesDialog);
Ext.namespace("gxp.plugins");
gxp.plugins.Styler = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_styler",
  menuText: "Edit Styles",
  tooltip: "Manage layer styles",
  roles: ["ROLE_ADMINISTRATOR"],
  sameOriginStyling: !0,
  rasterStyling: !1,
  requireDescribeLayer: !0,
  constructor: function(a) {
    gxp.plugins.Styler.superclass.constructor.apply(this, arguments);
    if (!this.outputConfig) this.outputConfig = {
      autoHeight: !0,
      width: 265
    };
    Ext.applyIf(this.outputConfig, {
      closeAction: "close"
    })
  },
  init: function(a) {
    gxp.plugins.Styler.superclass.init.apply(this, arguments);
    this.target.on("authorizationchange", this.enableOrDisable, this)
  },
  destroy: function() {
    this.target.un("authorizationchange", this.enableOrDisable, this);
    gxp.plugins.Styler.superclass.destroy.apply(this, arguments)
  },
  enableOrDisable: function() {
    this.target && null !== this.target.selectedLayer && this.handleLayerChange(this.target.selectedLayer)
  },
  addActions: function() {
    var a = gxp.plugins.Styler.superclass.addActions.apply(this, [{
      menuText: this.menuText,
      iconCls: "gxp-icon-palette",
      disabled: !0,
      tooltip: this.tooltip,
      handler: function() {
        this.target.doAuthorized(this.roles, this.addOutput, this)
      },
      scope: this
    }]);
    this.launchAction = a[0];
    this.target.on({
      layerselectionchange: this.handleLayerChange,
      scope: this
    });
    return a
  },
  handleLayerChange: function(a) {
    this.launchAction.disable();
    if (a) {
      var b = this.target.getSource(a);
      b instanceof gxp.plugins.WMSSource && b.describeLayer(a, function(b) {
        this.checkIfStyleable(a, b)
      }, this)
    }
  },
  checkIfStyleable: function(a, b) {
    if (b) {
      var c = ["WFS"];
      !0 === this.rasterStyling && c.push("WCS")
    }
    if (b ? -1 !== c.indexOf(b.get("owsType")) : !this.requireDescribeLayer) {
      var c = !1,
          c = this.target.layerSources[a.get("source")],
          d;
      d = (d = a.get("restUrl")) ? d + "/styles" : c.url.split("?").shift().replace(/\/(wms|ows)\/?$/, "/rest/styles");
      if (this.sameOriginStyling) {
        if (c = "/" === d.charAt(0), this.target.authenticate && c) {
          this.launchAction.enable();
          return
        }
      } else c = !0;
      c && this.target.isAuthorized() && this.enableActionIfAvailable(d)
    }
  },
  enableActionIfAvailable: function(a) {
    Ext.Ajax.request({
      method: "PUT",
      url: a,
      callback: function(a, c, d) {
        this.launchAction.setDisabled(405 !== d.status)
      },
      scope: this
    })
  },
  addOutput: function(a) {
    var a =
    a || {},
        b = this.target.selectedLayer;
    this.outputConfig.title = (this.initialConfig.outputConfig || {}).title || this.menuText + ": " + b.get("title");
    this.outputConfig.shortTitle = b.get("title");
    Ext.apply(a, gxp.WMSStylesDialog.createGeoServerStylerConfig(b));
    !0 === this.rasterStyling && a.plugins.push({
      ptype: "gxp_wmsrasterstylesdialog"
    });
    Ext.applyIf(a, {
      style: "padding: 10px"
    });
    var c = gxp.plugins.Styler.superclass.addOutput.call(this, a);
    if (!(c.ownerCt.ownerCt instanceof Ext.Window)) c.dialogCls = Ext.Panel, c.showDlg = function(a) {
      a.layout = "fit";
      a.autoHeight = !1;
      c.ownerCt.add(a)
    };
    c.stylesStore.on("load", function() {
      !this.outputTarget && c.ownerCt.ownerCt instanceof Ext.Window && c.ownerCt.ownerCt.center()
    })
  }
});
Ext.preg(gxp.plugins.Styler.prototype.ptype, gxp.plugins.Styler);
Ext.namespace("gxp");
Ext.override(Ext.Tip, {
  showBy: function(a, b, c) {
    if (Ext.isEmpty(b)) b = this.defaultAlign;
    var d = c[0],
        c = c[1];
    "b" === b.charAt(0) && (c = -c);
    if ("r" === b.charAt(0) || "r" === b.charAt(1)) d = -d;
    "c" === b.charAt(0) && (c = d = 0);
    if ("l" === b.charAt(0) || "r" === b.charAt(0)) c = 0;
    this.rendered || this.render(Ext.getBody());
    b = this.el.getAlignToXY(a, b || this.defaultAlign, [d, c]);
    0 < document.body.scrollTop && document.body.scrollTop > a.getTop() && (b[1] += a.getTop() - document.body.scrollTop);
    this.isVisible() ? this.setPagePosition(b[0], b[1]) : this.showAt(b)
  }
});
GeoExt.FeatureTip = Ext.extend(Ext.Tip, {
  map: null,
  location: null,
  shouldBeVisible: null,
  initComponent: function() {
    var a = this.location.geometry.getCentroid();
    this.location = new OpenLayers.LonLat(a.x, a.y);
    this.map.events.on({
      move: this.show,
      scope: this
    });
    GeoExt.FeatureTip.superclass.initComponent.call(this)
  },
  beforeDestroy: function() {
    for (var a in this.youtubePlayers) this.youtubePlayers[a].destroy(), delete this.youtubePlayers[a];
    this.map.events.un({
      move: this.show,
      scope: this
    });
    GeoExt.FeatureTip.superclass.beforeDestroy.call(this)
  },
  getPosition: function() {
    if (this.map.getExtent().containsLonLat(this.location)) {
      var a = this.map.getPixelFromLonLat(this.location),
          b = Ext.fly(this.map.div).getBox(!0);
      return [a.x + b.x, a.y + b.y]
    }
    return null
  },
  show: function() {
    var a = this.getPosition();
    null !== a && (null === this.shouldBeVisible || this.shouldBeVisible.call(this)) ? this.isVisible() ? this.setPagePosition(a[0], a[1]) : this.showAt(a) : this.hide()
  }
});
window.Timeline && window.SimileAjax &&
function() {
  SimileAjax.History.enabled = !1;
  Timeline._Band.prototype._onDblClick = Ext.emptyFn;
  Timeline.DefaultEventSource.prototype.remove = function(a) {
    this._events.remove(a)
  };
  SimileAjax.EventIndex.prototype.remove = function(a) {
    this._events.remove(this._idToEvent[a]);
    delete this._idToEvent[a]
  };
  Timeline._Band.prototype.zoom = function(a) {
    if (this._zoomSteps) {
      var b = this.getCenterVisibleDate();
      this._etherPainter.zoom(this._ether.zoom(a));
      this.setCenterVisibleDate(b)
    }
  }
}();
gxp.TimelinePanel = Ext.extend(Ext.Panel, {
  youtubePlayers: {},
  scrollInterval: 500,
  annotationConfig: {
    timeAttr: "start_time",
    endTimeAttr: "end_time",
    filterAttr: "in_timeline",
    mapFilterAttr: "in_map"
  },
  layout: "border",
  initComponent: function() {
    Timeline.OriginalEventPainter.prototype._showBubble = this.handleEventClick.createDelegate(this);
    this.timelineContainer = new Ext.Container({
      region: "center"
    });
    this.eventSource = new Timeline.DefaultEventSource(0);
    this.items = [this.timelineContainer];
    this.initialConfig.viewer && (delete this.viewer, this.bindViewer(this.initialConfig.viewer));
    this.initialConfig.annotationsStore && this.bindAnnotationsStore(this.initialConfig.annotationsStore);
    this.initialConfig.playbackTool && (delete this.playbackTool, this.bindPlaybackTool(this.initialConfig.playbackTool));
    this.ownerCt && (this.ownerCt.on("beforecollapse", function() {
      this._silentMapMove = !0
    }, this), this.ownerCt.on("beforeexpand", function() {
      delete this._silentMapMove
    }, this), this.ownerCt.on("afterlayout", function() {
      delete this._silent
    }, this));
    gxp.TimelinePanel.superclass.initComponent.call(this)
  },
  handleEventClick: function(a, b, c) {
    this.fireEvent("click", c.getProperty("fid"))
  },
  bindAnnotationsStore: function(a) {
    this.annotationsStore = a;
    a.on("load", function(a, c) {
      this.layerLookup.annotations = Ext.apply({
        titleAttr: "title",
        icon: Timeline.urlPrefix + "/images/note.png",
        layer: a.layer,
        visible: !0
      }, this.annotationConfig);
      var d = [];
      a.each(function(a) {
        d.push(a.getFeature())
      });
      this.addFeatures("annotations", d);
      0 < c.length && this.ownerCt.expand();
      this.showAnnotations()
    }, this, {
      single: !0
    });
    a.on("write", this.onSave, this)
  },
  unbindAnnotationsStore: function() {
    this.annotationsStore && this.annotationsStore.un("write", this.onSave, this)
  },
  clearEventsForFid: function(a, b) {
    for (var c = this.eventSource.getAllEventIterator(), d = []; c.hasNext();) {
      var e = c.next();
      e.getProperty("key") === a && e.getProperty("fid") === b && d.push(e.getID())
    }
    c = 0;
    for (e = d.length; c < e; ++c) this.eventSource.remove(d[c]);
    this.timeline && this.timeline.layout()
  },
  onSave: function(a, b, c) {
    for (var a = [], d = 0, e = c.length; d < e; d++) {
      var f = c[d].feature;
      a.push(f);
      f = f.fid;
      this.clearEventsForFid("annotations", f);
      this.tooltips && this.tooltips[f] && (this.tooltips[f].destroy(), this.tooltips[f] = null)
    }
    b !== Ext.data.Api.actions.destroy && this.addFeatures("annotations", a);
    this.showAnnotations()
  },
  bindPlaybackTool: function(a) {
    this.playbackTool = a;
    this.playbackTool.on("timechange", this.onTimeChange, this);
    this.playbackTool.on("rangemodified", this.onRangeModify, this)
  },
  unbindPlaybackTool: function() {
    if (this.playbackTool) this.playbackTool.un("timechange", this.onTimeChange, this), this.playbackTool.un("rangemodified", this.onRangeModify, this), this.playbackTool = null
  },
  onTimeChange: function(a, b) {
    this._silent = !0;
    !0 !== this._ignoreTimeChange && this.setCenterDate(b);
    delete this._silent
  },
  onRangeModify: function(a, b) {
    this._silent = !0;
    this.setRange(b);
    delete this._silent
  },
  createTimeline: function(a) {
    if (this.rendered && !(0 === this.timelineContainer.el.getSize().width && 0 === this.timelineContainer.el.getSize().height)) {
      var b = Timeline.ClassicTheme.create(),
          c = a[1] - a[0],
          d = [];
      50 <= c / 1E3 / 60 / 60 / 24 / 365 ? (d.push(Timeline.DateTime.DECADE), d.push(Timeline.DateTime.CENTURY)) : (d.push(Timeline.DateTime.YEAR), d.push(Timeline.DateTime.DECADE));
      a = new Date(a[0] + c / 2);
      d = [Timeline.createBandInfo({
        width: "80%",
        intervalUnit: d[0],
        intervalPixels: 200,
        eventSource: this.eventSource,
        date: a,
        theme: b,
        layout: "original",
        zoomIndex: 7,
        zoomSteps: [{
          pixelsPerInterval: 25,
          unit: d[0]
        }, {
          pixelsPerInterval: 50,
          unit: d[0]
        }, {
          pixelsPerInterval: 75,
          unit: d[0]
        }, {
          pixelsPerInterval: 100,
          unit: d[0]
        }, {
          pixelsPerInterval: 125,
          unit: d[0]
        }, {
          pixelsPerInterval: 150,
          unit: d[0]
        }, {
          pixelsPerInterval: 175,
          unit: d[0]
        }, {
          pixelsPerInterval: 200,
          unit: d[0]
        }, {
          pixelsPerInterval: 225,
          unit: d[0]
        }, {
          pixelsPerInterval: 250,
          unit: d[0]
        }, {
          pixelsPerInterval: 275,
          unit: d[0]
        }, {
          pixelsPerInterval: 300,
          unit: d[0]
        }, {
          pixelsPerInterval: 325,
          unit: d[0]
        }, {
          pixelsPerInterval: 350,
          unit: d[0]
        }, {
          pixelsPerInterval: 375,
          unit: d[0]
        }]
      }), Timeline.createBandInfo({
        width: "20%",
        intervalUnit: d[1],
        intervalPixels: 200,
        eventSource: this.eventSource,
        date: a,
        theme: b,
        layout: "overview"
      })];
      d[1].syncWith = 0;
      d[1].highlight = !0;
      d[0].decorators = [new Timeline.PointHighlightDecorator({
        date: a,
        theme: b
      })];
      this.timeline =
      Timeline.create(this.timelineContainer.el.dom, d, Timeline.HORIZONTAL);
      this._silent = !0;
      this.timeline.getBand(0).addOnScrollListener(gxp.util.throttle(this.setPlaybackCenter.createDelegate(this), this.scrollInterval))
    }
  },
  setPlaybackCenter: function(a) {
    a = a.getCenterVisibleDate();
    if (!0 !== this._silent && this.playbackTool && !0 !== this.playbackTool.playbackToolbar.playing) this._ignoreTimeChange = !0, this.playbackTool.setTime(a), this.timeline.getBand(0)._decorators[0]._date = this.playbackTool.playbackToolbar.control.currentValue, this.timeline.getBand(0)._decorators[0].paint(), delete this._ignoreTimeChange, this.showAnnotations()
  },
  bindViewer: function(a) {
    this.viewer && this.unbindViewer();
    this.viewer = a;
    if (!this.layerLookup) this.layerLookup = {}
  },
  unbindViewer: function() {
    delete this.viewer;
    delete this.layerLookup
  },
  onLayout: function() {
    gxp.TimelinePanel.superclass.onLayout.call(this, arguments);
    !this.timeline && this.playbackTool && this.playbackTool.playbackToolbar && (this.setRange(this.playbackTool.playbackToolbar.control.animationRange), this.setCenterDate(this.playbackTool.playbackToolbar.control.currentValue))
  },
  setRange: function(a) {
    this.originalRange = a;
    this.timeline || this.createTimeline(a);
    if (this.timeline) {
      var b = this.timeline.getBand(0);
      b.setMinVisibleDate(a[0]);
      b.setMaxVisibleDate(a[1]);
      this.timeline.getBand(1).getEtherPainter().setHighlight(a[0], a[1])
    }
  },
  buildHTML: function(a) {
    var b = a.get("content"),
        c = b ? b.indexOf("[youtube=") : -1;
    if (-1 !== c) {
      var d = b.substr(0, c),
          e = b.indexOf("]", c),
          f = b.substr(e + 1),
          b = b.substr(c + 9, e - 9),
          g = OpenLayers.Util.getParameters(b),
          c = g.w || 250,
          e = g.h || 250,
          g = g.v;
      void 0 === g && (g = b.substr(b.lastIndexOf("/") + 1, -1 !== b.indexOf("?") ? b.indexOf("?") - (b.lastIndexOf("/") + 1) : void 0));
      b = "http://www.youtube.com/embed/" + g;
      a = "player_" + a.getFeature().fid;
      return d + '<br/><iframe id="' + a + '" type="text/html" width="' + c + '" height="' + e + '" src="' + b + "?enablejsapi=1&origin=" + window.location.origin + '" frameborder="0"></iframe><br/>' + f
    }
    return b
  },
  displayTooltip: function(a) {
    var b = null !== a.getFeature().geometry;
    if (!this.tooltips) this.tooltips = {};
    var c = a.getFeature().fid,
        d = -1 !== (a.get("content") || "").indexOf("[youtube="),
        e = {
        hide: function() {
          !0 === d && this.youtubePlayers[c].stopVideo()
        },
        show: function() {
          !0 === d && this.youtubePlayers[c]._ready && this.playbackTool.playbackToolbar.playing && this.youtubePlayers[c].playVideo()
        },
        afterrender: function() {
          if (!0 === d && !this.youtubePlayers[c]) {
            var a = this;
            if (a.playbackTool.playbackToolbar.playing) a.playbackTool.playbackToolbar._weStopped = !0, window.setTimeout(function() {
              a.playbackTool.playbackToolbar.control.stop()
            }, 0);
            this.youtubePlayers[c] =
            new YT.Player("player_" + c, {
              events: {
                onReady: function(b) {
                  b.target._ready = !0;
                  (a.playbackTool.playbackToolbar.playing || a.playbackTool.playbackToolbar._weStopped) && b.target.playVideo()
                },
                onStateChange: function(b) {
                  if (b.data === YT.PlayerState.PLAYING) {
                    if (!a.playbackTool.playbackToolbar._weStopped && a.playbackTool.playbackToolbar.playing) a.playbackTool.playbackToolbar._weStopped = !0, a.playbackTool.playbackToolbar.control.stop()
                  } else b.data == YT.PlayerState.ENDED && a.playbackTool.playbackToolbar._weStopped && (a.playbackTool.playbackToolbar.control.play(), delete a.playbackTool.playbackToolbar._weStopped)
                }
              }
            })
          }
        },
        scope: this
        };
    this.tooltips[c] || (this.tooltips[c] = !b || b && "geom" !== a.get("appearance") && !Ext.isEmpty(a.get("appearance")) ? new Ext.Tip({
      cls: "gxp-annotations-tip",
      maxWidth: 500,
      bodyCssClass: "gxp-annotations-tip-body",
      listeners: e,
      title: a.get("title"),
      html: this.buildHTML(a)
    }) : new GeoExt.FeatureTip({
      map: this.viewer.mapPanel.map,
      location: a.getFeature(),
      shouldBeVisible: function() {
        return !0 === this._inTimeRange
      },
      cls: "gxp-annotations-tip",
      bodyCssClass: "gxp-annotations-tip-body",
      maxWidth: 500,
      title: a.get("title"),
      listeners: e,
      html: this.buildHTML(a)
    }));
    e = this.tooltips[c];
    e._inTimeRange = !0;
    !b || b && "geom" !== a.get("appearance") && !Ext.isEmpty(a.get("appearance")) ? (e.showBy(this.viewer.mapPanel.body, a.get("appearance"), [10, 10]), e.showBy(this.viewer.mapPanel.body, a.get("appearance"), [10, 10])) : e.isVisible() || e.show();
    b && this.annotationsLayer.addFeatures([a.getFeature()])
  },
  hideTooltip: function(a) {
    var b = a.getFeature().fid,
        c = null !== a.getFeature().geometry;
    if (this.tooltips && this.tooltips[b]) this.tooltips[b]._inTimeRange = !1, this.tooltips[b].hide(), c && this.annotationsLayer.removeFeatures([a.getFeature()])
  },
  showAnnotations: function() {
    if (!this.annotationsLayer) this.annotationsLayer = new OpenLayers.Layer.Vector(null, {
      displayInLayerSwitcher: !1
    }), this.viewer && this.viewer.mapPanel.map.addLayer(this.annotationsLayer);
    var a = (new Date(this.playbackTool.playbackToolbar.control.currentValue)).getTime() / 1E3;
    this.annotationsStore && this.annotationsStore.each(function(b) {
      var c = this.annotationConfig.mapFilterAttr;
      if (Ext.isBoolean(b.get(c)) ? b.get(c) : "true" === b.get(c)) {
        var c = parseFloat(b.get(this.annotationConfig.timeAttr)),
            d = b.get(this.annotationConfig.endTimeAttr),
            e = d != c;
        if ("" == d || null == d) d = this.playbackTool.playbackToolbar.control.animationRange[1];
        !0 === e ? a <= parseFloat(d) && a >= c ? this.displayTooltip(b) : this.hideTooltip(b) : 0 === c - a ? this.displayTooltip(b) : this.hideTooltip(b)
      }
    }, this)
  },
  setCenterDate: function(a) {
    a instanceof Date || (a = new Date(a));
    if (this.timeline) this.timeline.getBand(0)._decorators[0]._date = a, this.timeline.getBand(0)._decorators[0].paint(), this.timeline.getBand(0).setCenterVisibleDate(a);
    this.showAnnotations()
  },
  addFeatures: function(a, b) {
    var c = !1,
        d = this.layerLookup[a].titleAttr,
        e = this.layerLookup[a].timeAttr,
        f = this.layerLookup[a].endTimeAttr,
        g = this.layerLookup[a].filterAttr;
    f && (c = !0);
    for (var h = b.length, j = [], k, l = 0; l < h; ++l) {
      a: {
        k = b[l].fid;
        for (var n = this.eventSource.getAllEventIterator(); n.hasNext();) {
          var m = n.next();
          if (m.getProperty("key") === a && m.getProperty("fid") === k) {
            k = !0;
            break a
          }
        }
        k = !1
      }
      if (!1 === k) if (k = b[l].attributes, !1 === c) j.push({
        start: OpenLayers.Date.parse(k[e]),
        title: k[d],
        durationEvent: !1,
        key: a,
        icon: this.layerLookup[a].icon,
        fid: b[l].fid
      });
      else if (Ext.isBoolean(k[g]) ? k[g] : "true" === k[g]) {
        var n = k[e],
            m = k[f],
            r = n != m;
        Ext.isEmpty(n) || (n = parseFloat(n), n = Ext.isNumber(n) ? new Date(1E3 * n) : OpenLayers.Date.parse(n));
        Ext.isEmpty(m) || (m = parseFloat(m), m = Ext.isNumber(m) ? new Date(1E3 * m) : OpenLayers.Date.parse(m));
        if (!1 === r) m = void 0;
        else if ("" == m || null == m) m = new Date(this.playbackTool.playbackToolbar.control.animationRange[1]);
        null != n && j.push({
          start: n,
          end: m,
          icon: this.layerLookup[a].icon,
          title: k[d],
          durationEvent: r,
          key: a,
          fid: b[l].fid
        })
      }
    }
    this.eventSource.loadJSON({
      dateTimeFormat: "javascriptnative",
      events: j
    }, "mapstory.org")
  },
  onResize: function() {
    gxp.TimelinePanel.superclass.onResize.apply(this, arguments);
    this.timeline && this.timeline.layout()
  },
  beforeDestroy: function() {
    gxp.TimelinePanel.superclass.beforeDestroy.call(this);
    this.annotationsLayer = null;
    this.unbindViewer();
    this.unbindAnnotationsStore();
    this.unbindPlaybackTool();
    this.eventSource = null;
    if (this.timeline) this.timeline.dispose(), this.timeline = null
  }
});
Ext.reg("gxp_timelinepanel", gxp.TimelinePanel);
Ext.namespace("gxp.plugins");
gxp.plugins.Timeline = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_timeline",
  playbackTool: null,
  menuText: "Timeline",
  tooltip: "Show Timeline",
  actionTarget: null,
  constructor: function(a) {
    gxp.plugins.Timeline.superclass.constructor.apply(this, arguments);
    if (!this.outputConfig) this.outputConfig = {};
    Ext.applyIf(this.outputConfig, {
      title: this.menuText
    })
  },
  addActions: function() {
    return gxp.plugins.Timeline.superclass.addActions.apply(this, [
      [{
        menuText: this.menuText,
        tooltip: this.tooltip,
        handler: function() {
          this.addOutput()
        },
        scope: this
      }]
    ])
  },
  addOutput: function() {
    return gxp.plugins.Timeline.superclass.addOutput.call(this, Ext.apply({
      xtype: "gxp_timelinepanel",
      viewer: this.target,
      listeners: {
        click: function(a) {
          this.fireEvent("click", a)
        },
        scope: this
      },
      annotationsStore: this.annotationsStore,
      playbackTool: this.target.tools[this.playbackTool]
    }, this.outputConfig))
  },
  getTimelinePanel: function() {
    return this.output[0]
  },
  getState: function() {
    var a = gxp.plugins.Timeline.superclass.getState.call(this);
    a.outputConfig = Ext.apply(a.outputConfig || {}, this.getTimelinePanel().getState());
    return a
  },
  setAnnotationsStore: function(a) {
    this.annotationsStore = a;
    this.output && this.output[0] && this.output[0].bindAnnotationsStore(a)
  }
});
Ext.preg(gxp.plugins.Timeline.prototype.ptype, gxp.plugins.Timeline);
Ext.namespace("gxp.plugins");
gxp.plugins.VectorStyleWriter = Ext.extend(gxp.plugins.StyleWriter, {
  constructor: function(a) {
    this.initialConfig = a;
    Ext.apply(this, a);
    gxp.plugins.VectorStyleWriter.superclass.constructor.apply(this, arguments)
  },
  init: function(a) {
    gxp.plugins.VectorStyleWriter.superclass.init.apply(this, arguments);
    a.on({
      beforesaved: this.write,
      saved: this.assignStyles,
      scope: this
    })
  },
  write: function() {
    var a = this.target.layerRecord.getLayer();
    if (a.customStyling && a.features && a.styleMap && a.styleMap.styles["default"]) for (var b = a.styleMap.styles["default"], c = a.features, d, e, f = 0; f < c.length; f++) if (d = c[f], !d.style) e = b, d.renderIntent && "default" != d.renderIntent && (e = a.styleMap.styles[d.renderIntent]), d.style = e.createSymbolizer(d);
    this.target.stylesStore.commitChanges();
    this.target.fireEvent("saved", this.target, this.target.selectedStyle.get("name"))
  },
  writeStyle: function(a) {
    a.get("userStyle")
  },
  assignStyles: function(a, b) {
    if (this.target.first) {
      var c = this.target.layerRecord.getLayer(),
          d = c.styleMap,
          e = this.target.selectedStyle;
      if (e) {
        e = e.get("userStyle").clone();
        e.defaultsPerSymbolizer = !1;
        var f = {},
            g;
        if (e.rules) for (var h = 0, j = e.rules.length; h < j; h++) {
          var k = e.rules[h];
          k.symbolizer = {};
          for (var l = 0; l < k.symbolizers.length; l++) {
            g = k.symbolizers[l];
            var n = g.CLASS_NAME.split(".").pop();
            if ("Text" == n) f.label = g.label, f.fontFamily = g.fontFamily, f.fontSize = g.fontSize, f.fontWeight = g.fontWeight, f.fontStyle = g.fontStyle, f.fontColor = g.fontColor, f.fontOpacity = g.fontOpacity;
            k.symbolizer[n] = k.symbolizers[l].clone()
          }
          k.symbolizers = void 0
        }
        OpenLayers.Util.extend(e.defaultStyle, f);
        e.propertyStyles =
        e.findPropertyStyles();
        d.styles[b] = e;
        d = c.selectedFeatures && 0 < c.selectedFeatures.length ? c.selectedFeatures : c.features;
        c.eraseFeatures(d);
        for (g = 0; g < d.length; g++) {
          f = d[g];
          h = !1;
          if (c.selectedFeatures) for (j = 0; j < c.selectedFeatures.length; j++) if (c.selectedFeatures[j].id == f.id) {
            h = !0;
            break
          }
          if (c.customStyling) {
            if (h || !f.style) f.style && delete f.style, f.style = "text" == f.featureType ? c.styleMap.styles.defaultLabel.createSymbolizer(f) : e.createSymbolizer(f)
          } else f.style = null;
          c.drawFeature(f)
        }
        c.events.triggerEvent("stylechanged", e)
      }
    }
  },
  deleteStyles: function() {
    this.deletedStyles = []
  }
});
Ext.preg("gxp_vectorstylewriter", gxp.plugins.VectorStyleWriter);
Ext.namespace("gxp.plugins");
gxp.plugins.VersionedEditor = Ext.extend(Ext.TabPanel, {
  url: null,
  historyTpl: '<ol><tpl for="."><li class="commit"><div class="commit-msg">{message}</div><div>{author} <span class="commit-datetime">authored {date:this.formatDate}</span></div></li></tpl>',
  attributesTitle: "Attributes",
  historyTitle: "History",
  hour: "hour",
  hours: "hours",
  day: "day",
  days: "days",
  ago: "ago",
  border: !1,
  activeTab: 0,
  editor: null,
  attributeEditor: null,
  ptype: "gxp_versionededitor",
  initComponent: function() {
    gxp.plugins.VersionedEditor.superclass.initComponent.call(this);
    var a = Ext.apply({
      xtype: this.initialConfig.editor || "gxp_editorgrid",
      title: this.attributesTitle
    }, {
      feature: this.initialConfig.feature,
      schema: this.initialConfig.schema,
      fields: this.initialConfig.fields,
      excludeFields: this.initialConfig.excludeFields,
      propertyNames: this.initialConfig.propertyNames,
      readOnly: this.initialConfig.readOnly
    });
    this.attributeEditor = Ext.ComponentMgr.create(a);
    this.add(this.attributeEditor);
    this.add({
      xtype: "panel",
      border: !1,
      plain: !0,
      layout: "fit",
      autoScroll: !0,
      items: [this.createDataView()],
      title: this.historyTitle
    })
  },
  createDataView: function() {
    var a = this.schema.reader.raw.featureTypes[0].typeName.split(":").pop() + "/" + this.feature.fid;
    "/" !== this.url.charAt(this.url.length - 1) && (this.url += "/");
    var b = this.url + "log",
        b = Ext.urlAppend(b, "path=" + a + "&output_format=json"),
        a = new Ext.data.JsonStore({
        url: b,
        root: "response.commit",
        fields: ["message", "author", "email", "commit",
        {
          name: "date",
          type: "date",
          convert: function(a) {
            return new Date(a)
          }
        }],
        autoLoad: !0
      }),
        c = this,
        b = new Ext.XTemplate(this.historyTpl, {
        formatDate: function(a) {
          var b =
          new Date,
              f = "";
          if (a > b.add(Date.DAY, -1)) return a = Math.round((b - a) / 36E5), f += a + " ", f += 1 < f ? c.hours : c.hour, f += " " + c.ago;
          if (a > b.add(Date.MONTH, -1)) return a = Math.round((b - a) / 864E5), f += a + " ", f += 1 < f ? c.days : c.day, f += " " + c.ago
        }
      });
    return new Ext.DataView({
      store: a,
      tpl: b,
      autoHeight: !0
    })
  },
  init: function(a) {
    a.on("beforeadd", OpenLayers.Function.False, this);
    this.attributeEditor.init(a);
    a.un("beforeadd", OpenLayers.Function.False, this);
    a.add(this);
    a.doLayout()
  }
});
Ext.preg(gxp.plugins.VersionedEditor.prototype.ptype, gxp.plugins.VersionedEditor);
Ext.namespace("gxp.plugins");
gxp.plugins.WizardContainer = {
  init: function(a) {
    a.addEvents("wizardstepvalid", "wizardstepinvalid", "wizardstepexpanded");
    a.on("add", function(b) {
      b.on("expand", function() {
        a.fireEvent("wizardstepexpanded", a.items.indexOf(b))
      })
    })
  }
};
Ext.preg("gxp_wizardcontainer", gxp.plugins.WizardContainer);
Ext.namespace("gxp.plugins");
gxp.plugins.WizardStep = Ext.extend(gxp.plugins.Tool, {
  autoActivate: !1,
  index: null,
  valid: !1,
  wizardContainer: null,
  wizardData: null,
  constructor: function(a) {
    gxp.plugins.WizardStep.superclass.constructor.apply(this, arguments);
    this.wizardData = {}
  },
  addOutput: function(a) {
    a = Ext.ComponentMgr.create(Ext.apply(a, this.outputConfig));
    a.on("added", function(a, c) {
      this.wizardContainer = c.ownerCt;
      this.index = c.ownerCt.items.indexOf(c);
      c.setDisabled(0 != this.index);
      c.ownerCt.on({
        wizardstepvalid: function(a, b) {
          Ext.apply(this.wizardData, b);
          this.previousStepsCompleted() && c.enable()
        },
        wizardstepinvalid: function() {
          this.previousStepsCompleted() || c.disable()
        },
        scope: this
      });
      c.on({
        expand: this.activate,
        collapse: this.deactivate,
        scope: this
      })
    }, this);
    return gxp.plugins.WizardStep.superclass.addOutput.call(this, a)
  },
  setValid: function(a, b) {
    (this.valid = a) ? this.wizardContainer.fireEvent("wizardstepvalid", this, b) : this.wizardContainer.fireEvent("wizardstepinvalid", this)
  },
  previousStepsCompleted: function() {
    var a = this.index,
        b = !0;
    if (0 < a) {
      var c, d;
      for (d in this.target.tools) c =
      this.target.tools[d], c instanceof gxp.plugins.WizardStep && c.index < a && (b = b && c.valid)
    }
    return b
  }
});
Ext.namespace("gxp.plugins");
gxp.plugins.WMSCSource = Ext.extend(gxp.plugins.WMSSource, {
  ptype: "gxp_wmscsource",
  version: "1.1.1",
  constructor: function(a) {
    a.baseParams = {
      SERVICE: "WMS",
      REQUEST: "GetCapabilities",
      TILED: !0
    };
    if (!a.format) this.format = new OpenLayers.Format.WMSCapabilities({
      keepData: !0,
      profile: "WMSC",
      allowFallback: !0
    });
    gxp.plugins.WMSCSource.superclass.constructor.apply(this, arguments)
  },
  createLayerRecord: function(a) {
    var b = gxp.plugins.WMSCSource.superclass.createLayerRecord.apply(this, arguments);
    if (b) {
      var c, d;
      if (this.store.reader.raw) c =
      this.store.reader.raw.capability;
      var e = c && c.vendorSpecific ? c.vendorSpecific.tileSets : a.capability && a.capability.tileSets;
      c = b.get("layer");
      if (e) for (var f = this.getProjection(b) || this.getMapProjection(), g = 0, h = e.length; g < h; g++) {
        var j = e[g];
        if (j.layers === c.params.LAYERS) {
          var k;
          for (d in j.srs) {
            k = new OpenLayers.Projection(d);
            break
          }
          if (f.equals(k)) {
            d = j.bbox[d].bbox;
            c.projection = k;
            c.addOptions({
              resolutions: j.resolutions,
              tileSize: new OpenLayers.Size(j.width, j.height),
              tileOrigin: new OpenLayers.LonLat(d[0], d[1])
            });
            break
          }
        }
      } else if (this.lazy && (k = a.tileSize, d = a.tileOrigin, c.addOptions({
        resolutions: a.resolutions,
        tileSize: k ? new OpenLayers.Size(k[0], k[1]) : void 0,
        tileOrigin: d ? OpenLayers.LonLat.fromArray(d) : void 0
      }), !d && (this.target.map.maxExtent ? k = this.target.map.maxExtent : (d = a.srs || this.target.map.projection, k = OpenLayers.Projection.defaults[d].maxExtent), k))) c.tileOrigin = OpenLayers.LonLat.fromArray(k);
      c.params.TILED = !1 !== a.cached && !0;
      return b
    }
  },
  getConfigForRecord: function(a) {
    var b = gxp.plugins.WMSCSource.superclass.getConfigForRecord.apply(this, arguments),
        c = b.name,
        d, e = a.getLayer();
    if (b.capability && this.store.reader.raw) {
      d = this.store.reader.raw.capability;
      var f = d.vendorSpecific && d.vendorSpecific.tileSets;
      if (f) for (var g = f.length - 1; 0 <= g; --g) if (d = f[g], d.layers === c && d.srs[e.projection]) {
        b.capability.tileSets = [d];
        break
      }
    }
    if (!b.capability || !b.capability.tileSets) {
      if (c = e.options.tileSize) b.tileSize = [c.w, c.h];
      b.tileOrigin = e.options.tileOrigin;
      b.resolutions = e.options.resolutions
    }
    return Ext.applyIf(b, {
      cached: !! e.params.TILED
    })
  }
});
Ext.preg(gxp.plugins.WMSCSource.prototype.ptype, gxp.plugins.WMSCSource);
Ext.namespace("gxp.plugins");
gxp.plugins.WMSFilterView = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_wmsfilterview",
  featureManager: null,
  init: function(a) {
    gxp.plugins.WMSFilterView.superclass.init.apply(this, arguments);
    this.createFilterLayer()
  },
  createFilterLayer: function() {
    this.filterLayer = new OpenLayers.Layer.WMS(this.id + "filterlayer", Ext.BLANK_IMAGE_URL, {
      format: "image/png",
      transparent: !0
    }, {
      buffer: 0,
      displayInLayerSwitcher: !1,
      tileOptions: {
        maxGetUrlLength: 2048
      }
    });
    var a = this.target.mapPanel.map;
    a.addLayer(this.filterLayer);
    a.events.on({
      addlayer: this.raiseLayer,
      scope: this
    });
    var b = this.target.tools[this.featureManager],
        c = new OpenLayers.Format.SLD,
        a = function() {
        this.filterLayer.setUrl(Ext.BLANK_IMAGE_URL);
        this.filterLayer.setVisibility(!1)
        }.bind(this);
    b.on({
      clearfeatures: a,
      beforelayerchange: a,
      beforequery: function() {
        this.filterLayer.setUrl(Ext.BLANK_IMAGE_URL);
        this.filterLayer.setVisibility(!1)
      },
      query: function(a, e, f) {
        if (f) {
          var e = new OpenLayers.Rule,
              g = b.geometryType.replace(/^Multi/, ""),
              h = b.style.all.rules[0].symbolizer;
          e.symbolizer[g] = Ext.applyIf(Ext.apply({}, h[g] || h), OpenLayers.Feature.Vector.style["default"]);
          e = new OpenLayers.Style(null, {
            rules: [e]
          });
          this.filterLayer.setUrl(a.layerRecord.getLayer().url);
          if (f instanceof OpenLayers.Filter.Logical) {
            a = f.filters;
            for (g = a.length - 1; 0 <= g; --g) a[g].type === OpenLayers.Filter.Spatial.BBOX && a.remove(a[g]);
            1 == a.length && f.type !== OpenLayers.Filter.Comparison.NOT ? f = a[0] : 0 == a.length && (f = null)
          } else f.type === OpenLayers.Filter.Spatial.BBOX && (f = null);
          a = {};
          if (f) f instanceof OpenLayers.Filter.FeatureId ? a.featureid = f.fids : a.cql_filter = (new OpenLayers.Format.CQL).write(f);
          this.filterLayer.mergeNewParams(Ext.apply(a, {
            sld_body: c.write({
              namedLayers: [{
                name: b.layerRecord.get("name"),
                userStyles: [e]
              }]
            }).replace(/( (xmlns|xsi):[^\"]*\"[^\"]*"|sld:)/g, "")
          }));
          this.filterLayer.setVisibility(!0)
        }
      },
      scope: this
    })
  },
  raiseLayer: function() {
    var a = this.filterLayer.map;
    a.setLayerIndex(this.filterLayer, a.layers.length)
  }
});
Ext.preg(gxp.plugins.WMSFilterView.prototype.ptype, gxp.plugins.WMSFilterView);
Ext.namespace("gxp.plugins");
gxp.plugins.WMSGetFeatureInfo = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_wmsgetfeatureinfo",
  outputTarget: "map",
  popupCache: null,
  infoActionTip: "Get Feature Info",
  popupTitle: "Feature Info",
  buttonText: "Identify",
  format: "html",
  addActions: function() {
    var a;
    this.popupCache = {};
    var b = gxp.plugins.WMSGetFeatureInfo.superclass.addActions.call(this, [{
      tooltip: this.infoActionTip,
      iconCls: "gxp-icon-getfeatureinfo",
      buttonText: this.buttonText,
      toggleGroup: this.toggleGroup,
      enableToggle: !0,
      allowDepress: !0,
      toggleHandler: function(b, c) {
        for (var d = 0, h = a.length; d < h; d++) c ? a[d].activate() : a[d].deactivate()
      }
    }]),
        c = this.actions[0].items[0];
    a = [];
    var d = function() {
      for (var b = this.target.mapPanel.layers.queryBy(function(a) {
        return a.get("queryable")
      }), d = this.target.mapPanel.map, g, h = 0, j = a.length; h < j; h++) g = a[h], g.deactivate(), g.destroy();
      a = [];
      b.each(function(b) {
        var e = b.getLayer(),
            g = Ext.apply({}, this.vendorParams),
            h;
        if (this.layerParams) for (var j = this.layerParams.length - 1; 0 <= j; --j) h = this.layerParams[j].toUpperCase(), g[h] = e.params[h];
        var o = b.get("infoFormat");
        void 0 === o && (o = "html" == this.format ? "text/html" : "application/vnd.ogc.gml");
        e = new OpenLayers.Control.WMSGetFeatureInfo(Ext.applyIf({
          url: e.url,
          queryVisible: !0,
          layers: [e],
          infoFormat: o,
          vendorParams: g,
          eventListeners: {
            getfeatureinfo: function(a) {
              var c = b.get("title") || b.get("name");
              if ("text/html" == o) {
                var d = a.text.match(/<body[^>]*>([\s\S]*)<\/body>/);
                d && !d[1].match(/^\s*$/) && this.displayPopup(a, c, d[1])
              } else "text/plain" == o ? this.displayPopup(a, c, "<pre>" + a.text + "</pre>") : a.features && 0 < a.features.length && this.displayPopup(a, c, null, b.get("getFeatureInfo"))
            },
            scope: this
          }
        }, this.controlOptions));
        d.addControl(e);
        a.push(e);
        c.pressed && e.activate()
      }, this)
    };
    this.target.mapPanel.layers.on("update", d, this);
    this.target.mapPanel.layers.on("add", d, this);
    this.target.mapPanel.layers.on("remove", d, this);
    return b
  },
  displayPopup: function(a, b, c, d) {
    var e, f = a.xy.x + "." + a.xy.y,
        d = d || {};
    f in this.popupCache ? e = this.popupCache[f] : (e = this.addOutput({
      xtype: "gx_popup",
      title: this.popupTitle,
      layout: "accordion",
      fill: !1,
      autoScroll: !0,
      location: a.xy,
      map: this.target.mapPanel,
      width: 250,
      height: 300,
      defaults: {
        layout: "fit",
        autoScroll: !0,
        autoHeight: !0,
        autoWidth: !0,
        collapsible: !0
      }
    }), e.on({
      close: function(a) {
        return function() {
          delete this.popupCache[a]
        }
      }(f),
      scope: this
    }), this.popupCache[f] = e);
    a = a.features;
    f = [];
    if (!c && a) for (var g = 0, h = a.length; g < h; ++g) c = a[g], f.push(Ext.apply({
      xtype: "gxp_editorgrid",
      readOnly: !0,
      listeners: {
        beforeedit: function() {
          return !1
        }
      },
      title: c.fid ? c.fid : b,
      feature: c,
      fields: d.fields,
      propertyNames: d.propertyNames
    }, this.itemConfig));
    else c && f.push(Ext.apply({
      title: b,
      html: c
    }, this.itemConfig));
    e.add(f);
    e.doLayout()
  }
});
Ext.preg(gxp.plugins.WMSGetFeatureInfo.prototype.ptype, gxp.plugins.WMSGetFeatureInfo);
Ext.namespace("gxp.plugins");
gxp.plugins.Zoom = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_zoom",
  zoomMenuText: "Zoom Box",
  zoomInMenuText: "Zoom In",
  zoomOutMenuText: "Zoom Out",
  zoomTooltip: "Zoom by dragging a box",
  zoomInTooltip: "Zoom in",
  zoomOutTooltip: "Zoom out",
  constructor: function(a) {
    gxp.plugins.Zoom.superclass.constructor.apply(this, arguments)
  },
  addActions: function() {
    var a = [{
      menuText: this.zoomInMenuText,
      iconCls: "gxp-icon-zoom-in",
      tooltip: this.zoomInTooltip,
      handler: function() {
        this.target.mapPanel.map.zoomIn()
      },
      scope: this
    }, {
      menuText: this.zoomOutMenuText,
      iconCls: "gxp-icon-zoom-out",
      tooltip: this.zoomOutTooltip,
      handler: function() {
        this.target.mapPanel.map.zoomOut()
      },
      scope: this
    }];
    this.showZoomBoxAction && a.unshift(new GeoExt.Action({
      menuText: this.zoomText,
      iconCls: "gxp-icon-zoom",
      tooltip: this.zoomTooltip,
      control: new OpenLayers.Control.ZoomBox(this.controlOptions),
      map: this.target.mapPanel.map,
      enableToggle: !0,
      allowDepress: !1,
      toggleGroup: this.toggleGroup
    }));
    return gxp.plugins.Zoom.superclass.addActions.apply(this, [a])
  }
});
Ext.preg(gxp.plugins.Zoom.prototype.ptype, gxp.plugins.Zoom);
Ext.namespace("gxp.plugins");
gxp.plugins.ZoomToExtent = Ext.extend(gxp.plugins.Tool, {
  ptype: "gxp_zoomtoextent",
  menuText: "Zoom To Max Extent",
  tooltip: "Zoom To Max Extent",
  extent: null,
  closest: !0,
  iconCls: "gxp-icon-zoomtoextent",
  closest: !0,
  constructor: function(a) {
    gxp.plugins.ZoomToExtent.superclass.constructor.apply(this, arguments);
    if (this.extent instanceof Array) this.extent = OpenLayers.Bounds.fromArray(this.extent)
  },
  addActions: function() {
    return gxp.plugins.ZoomToExtent.superclass.addActions.apply(this, [{
      text: this.buttonText,
      menuText: this.menuText,
      iconCls: this.iconCls,
      tooltip: this.tooltip,
      handler: function() {
        var a = this.target.mapPanel.map,
            b = "function" == typeof this.extent ? this.extent() : this.extent;
        if (!b) for (var c, d = 0, e = a.layers.length; d < e; ++d) c = a.layers[d], c.getVisibility() && (c = c.restrictedExtent || c.maxExtent, b ? b.extend(c) : c && (b = c.clone()));
        b && ((d = a.restrictedExtent || a.maxExtent) && (b = new OpenLayers.Bounds(Math.max(b.left, d.left), Math.max(b.bottom, d.bottom), Math.min(b.right, d.right), Math.min(b.top, d.top))), a.zoomToExtent(b, this.closest))
      },
      scope: this
    }])
  }
});
Ext.preg(gxp.plugins.ZoomToExtent.prototype.ptype, gxp.plugins.ZoomToExtent);
Ext.namespace("gxp.plugins");
gxp.plugins.ZoomToDataExtent = Ext.extend(gxp.plugins.ZoomToExtent, {
  ptype: "gxp_zoomtodataextent",
  menuText: "Zoom to layer extent",
  tooltip: "Zoom to layer extent",
  closest: !1,
  iconCls: "gxp-icon-zoom-to",
  extent: function() {
    return this.target.tools[this.featureManager].featureLayer.getDataExtent()
  },
  addActions: function() {
    var a = gxp.plugins.ZoomToDataExtent.superclass.addActions.apply(this, arguments);
    a[0].disable();
    var b = this.target.tools[this.featureManager].featureLayer;
    b.events.on({
      featuresadded: function() {
        a[0].isDisabled() && a[0].enable()
      },
      featuresremoved: function() {
        0 == b.features.length && a[0].disable()
      }
    });
    return a
  }
});
Ext.preg(gxp.plugins.ZoomToDataExtent.prototype.ptype, gxp.plugins.ZoomToDataExtent);
Ext.namespace("gxp.plugins");
gxp.plugins.ZoomToLayerExtent = Ext.extend(gxp.plugins.ZoomToExtent, {
  ptype: "gxp_zoomtolayerextent",
  menuText: "Zoom to layer extent",
  tooltip: "Zoom to layer extent",
  iconCls: "gxp-icon-zoom-to",
  destroy: function() {
    this.selectedRecord = null;
    gxp.plugins.ZoomToLayerExtent.superclass.destroy.apply(this, arguments)
  },
  extent: function() {
    var a = this.selectedRecord.getLayer(),
        b;
    OpenLayers.Layer.Vector && (b = a instanceof OpenLayers.Layer.Vector && a.getDataExtent());
    return a.restrictedExtent || b || a.maxExtent || map.maxExtent
  },
  addActions: function() {
    var a = gxp.plugins.ZoomToLayerExtent.superclass.addActions.apply(this, arguments);
    a[0].disable();
    this.target.on("layerselectionchange", function(b) {
      this.selectedRecord = b;
      a[0].setDisabled(!b || !b.get("layer"))
    }, this);
    return a
  }
});
Ext.preg(gxp.plugins.ZoomToLayerExtent.prototype.ptype, gxp.plugins.ZoomToLayerExtent);
Ext.namespace("gxp.plugins");
gxp.plugins.ZoomToSelectedFeatures = Ext.extend(gxp.plugins.ZoomToExtent, {
  ptype: "gxp_zoomtoselectedfeatures",
  menuText: "Zoom to selected features",
  tooltip: "Zoom to selected features",
  closest: !1,
  layer: null,
  iconCls: "gxp-icon-zoom-to",
  extent: function() {
    for (var a, b, c = this.target.tools[this.featureManager].featureLayer.selectedFeatures, d = c.length - 1; 0 <= d; --d) if (b = c[d].geometry) b = b.getBounds(), a ? a.extend(b) : a = b.clone();
    return a
  },
  addActions: function() {
    function a() {
      this.layer && this.layer.events.un(c);
      if (this.layer =
      d.featureLayer) this.layer.events.on(c)
    }
    var b = gxp.plugins.ZoomToSelectedFeatures.superclass.addActions.apply(this, arguments);
    b[0].disable();
    var c = {
      featureselected: function(a) {
        b[0].isDisabled() && null !== a.feature.geometry && b[0].enable()
      },
      featureunselected: function() {
        0 === this.layer.selectedFeatures.length && b[0].disable()
      },
      scope: this
    },
        d = this.target.tools[this.featureManager];
    this.target.on("layerselectionchange", a);
    d.on("query", function() {
      b[0].disable()
    });
    a.call(this);
    return b
  }
});
Ext.preg(gxp.plugins.ZoomToSelectedFeatures.prototype.ptype, gxp.plugins.ZoomToSelectedFeatures);
Ext.namespace("gxp");
gxp.CrumbPanel = Ext.extend(Ext.TabPanel, {
  widths: null,
  enableTabScroll: !0,
  initComponent: function() {
    gxp.CrumbPanel.superclass.initComponent.apply(this, arguments);
    this.widths = {}
  },
  onBeforeAdd: function(a) {
    gxp.CrumbPanel.superclass.onBeforeAdd.apply(this, arguments);
    if (a.shortTitle) a.title = a.shortTitle
  },
  onAdd: function(a) {
    gxp.CrumbPanel.superclass.onAdd.apply(this, arguments);
    this.setActiveTab(this.items.getCount() - 1);
    a.on("hide", this.onCmpHide, this);
    a.getEl().dom.style.display = ""
  },
  onRemove: function(a) {
    gxp.CrumbPanel.superclass.onRemove.apply(this, arguments);
    a.un("hide", this.onCmpHide, this);
    var b = this.widths[this.get(this.items.getCount() - 1).id];
    b && b < this.getWidth() && (this.setWidth(b), this.ownerCt && this.ownerCt.syncSize());
    a.getEl().dom.style.display = "none";
    this.activeTab.doLayout()
  },
  onRender: function(a) {
    if (!this.initialConfig.itemTpl) this.itemTpl = new Ext.Template('<li class="{cls} gxp-crumb" id="{id}"><div class="gxp-crumb-separator">\u00bb</div>', '<a class="x-tab-right" href="#"><em class="x-tab-left">', '<span class="x-tab-strip-inner"><span class="x-tab-strip-text {iconCls}">{text}</span></span>', "</em></a></li>");
    gxp.CrumbPanel.superclass.onRender.apply(this, arguments);
    this.getEl().down("div").addClass("gxp-crumbpanel-header")
  },
  onCmpHide: function(a) {
    var b = this.items.getCount() - 1;
    this.items.indexOf(a) === b && this.setActiveTab(this.get(--b))
  },
  setActiveTab: function(a) {
    var b;
    Ext.isNumber(a) ? (b = a, a = this.get(b)) : b = this.items.indexOf(a);
    if (~b) {
      var c, d;
      for (d = this.items.getCount() - 1; d > b; --d) c = this.get(d), this.remove(c, "hide" !== c.closeAction)
    }
    c = a.initialConfig.minWidth || a.initialConfig.width;
    d = this.getWidth();
    c > d && (this.widths[this.get(b - 1).id] = d, this.setWidth(c), this.ownerCt && this.ownerCt.syncSize());
    gxp.CrumbPanel.superclass.setActiveTab.apply(this, arguments)
  }
});
Ext.reg("gxp_crumbpanel", gxp.CrumbPanel);
Ext.namespace("gxp");
gxp.EmbedMapDialog = Ext.extend(Ext.Container, {
  url: null,
  url: null,
  publishMessage: "Your map is ready to be published to the web! Simply copy the following HTML to embed the map in your website:",
  heightLabel: "Height",
  widthLabel: "Width",
  mapSizeLabel: "Map Size",
  miniSizeLabel: "Mini",
  smallSizeLabel: "Small",
  premiumSizeLabel: "Premium",
  largeSizeLabel: "Large",
  snippetArea: null,
  heightField: null,
  widthField: null,
  initComponent: function() {
    Ext.apply(this, this.getConfig());
    gxp.EmbedMapDialog.superclass.initComponent.call(this)
  },
  getIframeHTML: function() {
    return this.snippetArea.getValue()
  },
  updateSnippet: function() {
    this.snippetArea.setValue('<iframe style="border: none;" height="' + this.heightField.getValue() + '" width="' + this.widthField.getValue() + '" src="' + gxp.util.getAbsoluteUrl(this.url) + '"></iframe>');
    !0 === this.snippetArea.isVisible() && this.snippetArea.focus(!0, 100)
  },
  getConfig: function() {
    this.snippetArea = new Ext.form.TextArea({
      height: 70,
      selectOnFocus: !0,
      readOnly: !0
    });
    var a = {
      change: this.updateSnippet,
      specialkey: function(a, c) {
        c.getKey() == c.ENTER && this.updateSnippet()
      },
      scope: this
    };
    this.heightField = new Ext.form.NumberField({
      width: 50,
      value: 400,
      listeners: a
    });
    this.widthField = new Ext.form.NumberField({
      width: 50,
      value: 600,
      listeners: a
    });
    return {
      border: !1,
      defaults: {
        border: !1,
        cls: "gxp-export-section",
        xtype: "container",
        layout: "fit"
      },
      items: [{
        items: [new Ext.Container({
          layout: "column",
          defaults: {
            border: !1,
            xtype: "box"
          },
          items: [{
            autoEl: {
              cls: "gxp-field-label",
              html: this.mapSizeLabel
            }
          },
          new Ext.form.ComboBox({
            editable: !1,
            width: 75,
            store: new Ext.data.SimpleStore({
              fields: ["name", "height", "width"],
              data: [
                [this.miniSizeLabel, 100, 100],
                [this.smallSizeLabel, 200, 300],
                [this.largeSizeLabel, 400, 600],
                [this.premiumSizeLabel, 600, 800]
              ]
            }),
            triggerAction: "all",
            displayField: "name",
            value: this.largeSizeLabel,
            mode: "local",
            listeners: {
              select: function(a, c) {
                this.widthField.setValue(c.get("width"));
                this.heightField.setValue(c.get("height"));
                this.updateSnippet()
              },
              scope: this
            }
          }),
          {
            autoEl: {
              cls: "gxp-field-label",
              html: this.heightLabel
            }
          },
          this.heightField,
          {
            autoEl: {
              cls: "gxp-field-label",
              html: this.widthLabel
            }
          },
          this.widthField]
        })]
      }, {
        xtype: "box",
        autoEl: {
          tag: "p",
          html: this.publishMessage
        }
      }, {
        items: [this.snippetArea]
      }],
      listeners: {
        afterrender: this.updateSnippet,
        scope: this
      }
    }
  }
});
Ext.reg("gxp_embedmapdialog", gxp.EmbedMapDialog);
Ext.namespace("gxp");
gxp.FillSymbolizer = Ext.extend(Ext.FormPanel, {
  symbolizer: null,
  colorProperty: "fillColor",
  opacityProperty: "fillOpacity",
  colorManager: null,
  checkboxToggle: !0,
  defaultColor: null,
  border: !1,
  fillText: "Fill",
  colorText: "Color",
  opacityText: "Opacity",
  initComponent: function() {
    if (!this.symbolizer) this.symbolizer = {};
    var a;
    this.colorManager && (a = [new this.colorManager]);
    var b = 100;
    this.opacityProperty in this.symbolizer ? b = 100 * this.symbolizer[this.opacityProperty] : OpenLayers.Renderer.defaultSymbolizerGXP[this.opacityProperty] && (b = 100 * OpenLayers.Renderer.defaultSymbolizerGXP[this.opacityProperty]);
    this.items = [{
      xtype: "fieldset",
      title: this.fillText,
      autoHeight: !0,
      checkboxToggle: this.checkboxToggle,
      collapsed: !0 === this.checkboxToggle && !1 === this.symbolizer.fill,
      hideMode: "offsets",
      defaults: {
        width: 100
      },
      items: [{
        xtype: "gxp_colorfield",
        fieldLabel: this.colorText,
        name: "color",
        emptyText: OpenLayers.Renderer.defaultSymbolizerGXP[this.colorProperty],
        value: this.symbolizer[this.colorProperty],
        defaultBackground: this.defaultColor || OpenLayers.Renderer.defaultSymbolizerGXP[this.colorProperty],
        plugins: a,
        listeners: {
          valid: function(a) {
            var a = a.getValue(),
                b = this.symbolizer[this.colorProperty] != a;
            this.symbolizer[this.colorProperty] = a;
            b && this.fireEvent("change", this.symbolizer)
          },
          scope: this
        }
      }, {
        xtype: "slider",
        fieldLabel: this.opacityText,
        name: "opacity",
        values: [b],
        isFormField: !0,
        listeners: {
          changecomplete: function(a, b) {
            this.symbolizer[this.opacityProperty] = b / 100;
            this.fireEvent("change", this.symbolizer)
          },
          scope: this
        },
        plugins: [new GeoExt.SliderTip({
          getText: function(a) {
            return a.value + "%"
          }
        })]
      }],
      listeners: {
        collapse: function() {
          if (!1 !== this.symbolizer.fill) this.symbolizer.fill = !1, this.fireEvent("change", this.symbolizer)
        },
        expand: function() {
          this.symbolizer.fill = !0;
          this.fireEvent("change", this.symbolizer)
        },
        scope: this
      }
    }];
    this.addEvents("change");
    gxp.FillSymbolizer.superclass.initComponent.call(this)
  }
});
Ext.reg("gxp_fillsymbolizer", gxp.FillSymbolizer);
Ext.namespace("gxp");
gxp.FilterBuilder = Ext.extend(Ext.Container, {
  builderTypeNames: ["any", "all", "none", "not all"],
  allowedBuilderTypes: null,
  allowBlank: !1,
  caseInsensitiveMatch: !1,
  preComboText: "Match",
  postComboText: "of the following:",
  cls: "gxp-filterbuilder",
  builderType: null,
  childFilterContainer: null,
  customizeFilterOnInit: !0,
  addConditionText: "add condition",
  addGroupText: "add group",
  removeConditionText: "remove condition",
  allowGroups: !0,
  initComponent: function() {
    Ext.applyIf(this, {
      defaultBuilderType: gxp.FilterBuilder.ANY_OF
    });
    if (this.customizeFilterOnInit) this.filter = this.customizeFilter(this.filter);
    this.builderType = this.getBuilderType();
    this.items = [{
      xtype: "container",
      layout: "form",
      ref: "form",
      defaults: {
        anchor: "100%"
      },
      hideLabels: !0,
      items: [{
        xtype: "compositefield",
        style: "padding-left: 2px",
        items: [{
          xtype: "label",
          style: "padding-top: 0.3em",
          text: this.preComboText
        },
        this.createBuilderTypeCombo(),
        {
          xtype: "label",
          style: "padding-top: 0.3em",
          text: this.postComboText
        }]
      },
      this.createChildFiltersPanel(),
      {
        xtype: "toolbar",
        items: this.createToolBar()
      }]
    }];
    this.addEvents("change");
    gxp.FilterBuilder.superclass.initComponent.call(this)
  },
  createToolBar: function() {
    var a = [{
      text: this.addConditionText,
      iconCls: "add",
      handler: function() {
        this.addCondition()
      },
      scope: this
    }];
    this.allowGroups && a.push({
      text: this.addGroupText,
      iconCls: "add",
      handler: function() {
        this.addCondition(!0)
      },
      scope: this
    });
    return a
  },
  getFilter: function() {
    var a;
    this.filter && (a = this.filter.clone(), a instanceof OpenLayers.Filter.Logical && (a = this.cleanFilter(a)));
    return a
  },
  cleanFilter: function(a) {
    if (a instanceof
    OpenLayers.Filter.Logical) if (a.type !== OpenLayers.Filter.Logical.NOT && 1 === a.filters.length) a = this.cleanFilter(a.filters[0]);
    else
    for (var b, c = 0, d = a.filters.length; c < d; ++c) if (b = a.filters[c], b instanceof OpenLayers.Filter.Logical) if (b = this.cleanFilter(b)) a.filters[c] = b;
    else {
      a = b;
      break
    } else {
      if (!b || null === b.type || null === b.property || null === b[a.type === OpenLayers.Filter.Comparison.BETWEEN ? "lowerBoundary" : "value"]) {
        a = !1;
        break
      }
    } else if (!a || null === a.type || null === a.property || null === a[a.type === OpenLayers.Filter.Comparison.BETWEEN ? "lowerBoundary" : "value"]) a = !1;
    return a
  },
  customizeFilter: function(a) {
    if (a) {
      var a = this.cleanFilter(a),
          b, c, d;
      switch (a.type) {
      case OpenLayers.Filter.Logical.AND:
      case OpenLayers.Filter.Logical.OR:
        if (!a.filters || 0 === a.filters.length) a.filters = [this.createDefaultFilter()];
        else
        for (c = 0, d = a.filters.length; c < d; ++c) b = a.filters[c], b instanceof OpenLayers.Filter.Logical && (a.filters[c] = this.customizeFilter(b));
        a = new OpenLayers.Filter.Logical({
          type: OpenLayers.Filter.Logical.OR,
          filters: [a]
        });
        break;
      case OpenLayers.Filter.Logical.NOT:
        if (!a.filters || 0 === a.filters.length) a.filters = [new OpenLayers.Filter.Logical({
          type: OpenLayers.Filter.Logical.OR,
          filters: [this.createDefaultFilter()]
        })];
        else if (b = a.filters[0], b instanceof OpenLayers.Filter.Logical) if (b.type !== OpenLayers.Filter.Logical.NOT) {
          var e;
          for (c = 0, d = b.filters.length; c < d; ++c) e = b.filters[c], e instanceof OpenLayers.Filter.Logical && (b.filters[c] = this.customizeFilter(e))
        } else a = b.filters && 0 < b.filters.length ? this.customizeFilter(b.filters[0]) : this.wrapFilter(this.createDefaultFilter());
        else a.filters = [new OpenLayers.Filter.Logical({
          type: this.defaultBuilderType === gxp.FilterBuilder.NOT_ALL_OF ? OpenLayers.Filter.Logical.AND : OpenLayers.Filter.Logical.OR,
          filters: [b]
        })];
        break;
      default:
        a = this.wrapFilter(a)
      }
    } else a = this.wrapFilter(this.createDefaultFilter());
    return a
  },
  createDefaultFilter: function() {
    return new OpenLayers.Filter.Comparison({
      matchCase: !this.caseInsensitiveMatch
    })
  },
  wrapFilter: function(a) {
    return new OpenLayers.Filter.Logical({
      type: OpenLayers.Filter.Logical.OR,
      filters: [new OpenLayers.Filter.Logical({
        type: this.defaultBuilderType === gxp.FilterBuilder.ALL_OF ? OpenLayers.Filter.Logical.AND : OpenLayers.Filter.Logical.OR,
        filters: [a]
      })]
    })
  },
  addCondition: function(a) {
    var b, c;
    a ? (c = "gxp_filterbuilder", b = this.wrapFilter(this.createDefaultFilter())) : (c = "gxp_filterfield", b = this.createDefaultFilter());
    this.childFilterContainer.add(this.newRow({
      xtype: c,
      filter: b,
      columnWidth: 1,
      attributes: this.attributes,
      allowBlank: a ? void 0 : this.allowBlank,
      customizeFilterOnInit: a && !1,
      caseInsensitiveMatch: this.caseInsensitiveMatch,
      listeners: {
        change: function() {
          this.fireEvent("change", this)
        },
        scope: this
      }
    }));
    this.filter.filters[0].filters.push(b);
    this.childFilterContainer.doLayout()
  },
  removeCondition: function(a, b) {
    var c = this.filter.filters[0].filters;
    0 < c.length && (c.remove(b), this.childFilterContainer.remove(a, !0));
    0 === c.length && this.addCondition();
    this.fireEvent("change", this)
  },
  createBuilderTypeCombo: function() {
    for (var a = this.allowedBuilderTypes || [gxp.FilterBuilder.ANY_OF, gxp.FilterBuilder.ALL_OF, gxp.FilterBuilder.NONE_OF], b = a.length, c = Array(b), d, e = 0; e < b; ++e) d = a[e], c[e] = [d, this.builderTypeNames[d]];
    return {
      xtype: "combo",
      store: new Ext.data.SimpleStore({
        data: c,
        fields: ["value", "name"]
      }),
      value: this.builderType,
      ref: "../../builderTypeCombo",
      displayField: "name",
      valueField: "value",
      triggerAction: "all",
      mode: "local",
      listeners: {
        select: function(a, b) {
          this.changeBuilderType(b.get("value"));
          this.fireEvent("change", this)
        },
        scope: this
      },
      width: 60
    }
  },
  changeBuilderType: function(a) {
    if (a !== this.builderType) {
      this.builderType = a;
      var b = this.filter.filters[0];
      switch (a) {
      case gxp.FilterBuilder.ANY_OF:
        this.filter.type = OpenLayers.Filter.Logical.OR;
        b.type = OpenLayers.Filter.Logical.OR;
        break;
      case gxp.FilterBuilder.ALL_OF:
        this.filter.type = OpenLayers.Filter.Logical.OR;
        b.type = OpenLayers.Filter.Logical.AND;
        break;
      case gxp.FilterBuilder.NONE_OF:
        this.filter.type = OpenLayers.Filter.Logical.NOT;
        b.type = OpenLayers.Filter.Logical.OR;
        break;
      case gxp.FilterBuilder.NOT_ALL_OF:
        this.filter.type = OpenLayers.Filter.Logical.NOT, b.type = OpenLayers.Filter.Logical.AND
      }
    }
  },
  createChildFiltersPanel: function() {
    this.childFilterContainer = new Ext.Container;
    for (var a = this.filter.filters[0].filters, b, c = 0, d = a.length; c < d; ++c) {
      b = a[c];
      var e = {
        xtype: "gxp_filterfield",
        allowBlank: this.allowBlank,
        columnWidth: 1,
        filter: b,
        attributes: this.attributes,
        listeners: {
          change: function() {
            this.fireEvent("change", this)
          },
          scope: this
        }
      };
      this.childFilterContainer.add(this.newRow(Ext.applyIf(b instanceof OpenLayers.Filter.Logical ? {
        xtype: "gxp_filterbuilder"
      } : {
        xtype: "container",
        layout: "form",
        hideLabels: !0,
        items: e
      }, e)))
    }
    return this.childFilterContainer
  },
  newRow: function(a) {
    var b = new Ext.Container({
      layout: "column",
      items: [{
        xtype: "container",
        width: 28,
        height: 26,
        style: "padding-left: 2px",
        items: {
          xtype: "button",
          tooltip: this.removeConditionText,
          iconCls: "delete",
          handler: function() {
            this.removeCondition(b, a.filter)
          },
          scope: this
        }
      },
      a]
    });
    return b
  },
  getBuilderType: function() {
    var a = this.defaultBuilderType;
    if (this.filter) {
      var b = this.filter.filters[0];
      if (this.filter.type === OpenLayers.Filter.Logical.NOT) switch (b.type) {
      case OpenLayers.Filter.Logical.OR:
        a = gxp.FilterBuilder.NONE_OF;
        break;
      case OpenLayers.Filter.Logical.AND:
        a = gxp.FilterBuilder.NOT_ALL_OF
      } else
      switch (b.type) {
      case OpenLayers.Filter.Logical.OR:
        a =
        gxp.FilterBuilder.ANY_OF;
        break;
      case OpenLayers.Filter.Logical.AND:
        a = gxp.FilterBuilder.ALL_OF
      }
    }
    return a
  },
  setFilter: function(a) {
    this.filter = this.customizeFilter(a);
    this.changeBuilderType(this.getBuilderType());
    this.builderTypeCombo.setValue(this.builderType);
    this.form.remove(this.childFilterContainer);
    this.form.insert(1, this.createChildFiltersPanel());
    this.form.doLayout();
    this.fireEvent("change", this)
  }
});
gxp.FilterBuilder.ANY_OF = 0;
gxp.FilterBuilder.ALL_OF = 1;
gxp.FilterBuilder.NONE_OF = 2;
gxp.FilterBuilder.NOT_ALL_OF = 3;
Ext.reg("gxp_filterbuilder", gxp.FilterBuilder);
Ext.namespace("gxp.form");
gxp.form.AutoCompleteComboBox = Ext.extend(Ext.form.ComboBox, {
  xtype: "gxp_autocompletecombo",
  fieldName: null,
  featureType: null,
  featurePrefix: null,
  fieldLabel: null,
  geometryName: null,
  maxFeatures: 500,
  url: null,
  srsName: null,
  autoHeight: !0,
  hideTrigger: !0,
  customSortInfo: null,
  initComponent: function() {
    var a = [{
      name: this.fieldName
    }],
        b = [this.fieldName];
    null !== this.geometryName && (a.push({
      name: this.geometryName
    }), b.push(this.geometryName));
    if (!this.name) this.name = this.fieldName;
    this.valueField = this.displayField = this.fieldName;
    this.tpl = new Ext.XTemplate('<tpl for="."><div class="x-form-field">', "{" + this.fieldName + "}", "</div></tpl>");
    this.itemSelector = "div.x-form-field";
    this.store = new Ext.data.Store({
      fields: a,
      reader: new gxp.data.AutoCompleteReader({
        uniqueField: this.fieldName
      }, b),
      proxy: new gxp.data.AutoCompleteProxy({
        protocol: new OpenLayers.Protocol.WFS({
          version: "1.1.0",
          url: this.url,
          featureType: this.featureType,
          featurePrefix: this.featurePrefix,
          srsName: this.srsName,
          propertyNames: b,
          maxFeatures: this.maxFeatures
        }),
        setParamsAsOptions: !0
      }),
      sortInfo: this.customSortInfo && {
        field: this.fieldName,
        direction: this.customSortInfo.direction
      }
    });
    if (this.customSortInfo) this.store.createSortFunction = this.createCustomSortFunction();
    return gxp.form.AutoCompleteComboBox.superclass.initComponent.apply(this, arguments)
  },
  createCustomSortFunction: function() {
    for (var a = RegExp(this.customSortInfo.matcher), b = this.customSortInfo.parts.length, c = Array(b), d, e = 0; e < b; ++e) d = this.customSortInfo.parts[e], c[e] = {
      index: e,
      sortType: Ext.data.SortTypes[d.sortType || "none"],
      order: d.order || 0
    };
    c.sort(function(a, b) {
      return a.order - b.order
    });
    return function(b, d) {
      var e = "DESC" == (d || "ASC").toUpperCase() ? -1 : 1;
      return function(d, g) {
        for (var l = d.data[b], n = g.data[b], m = a.exec(l) || [], r = a.exec(n) || [], o, q, s = 0, u = c.length; s < u && !(q = c[s], o = q.sortType(m[q.index + 1] || l), q = q.sortType(r[q.index + 1] || n), o = o > q ? 1 : o < q ? -1 : 0); ++s);
        return e * o
      }
    }
  }
});
Ext.reg(gxp.form.AutoCompleteComboBox.prototype.xtype, gxp.form.AutoCompleteComboBox);
Ext.namespace("gxp.form");
gxp.form.ComparisonComboBox = Ext.extend(Ext.form.ComboBox, {
  allowedTypes: [
    [OpenLayers.Filter.Comparison.EQUAL_TO, "="],
    [OpenLayers.Filter.Comparison.NOT_EQUAL_TO, "<>"],
    [OpenLayers.Filter.Comparison.LESS_THAN, "<"],
    [OpenLayers.Filter.Comparison.GREATER_THAN, ">"],
    [OpenLayers.Filter.Comparison.LESS_THAN_OR_EQUAL_TO, "<="],
    [OpenLayers.Filter.Comparison.GREATER_THAN_OR_EQUAL_TO, ">="],
    [OpenLayers.Filter.Comparison.LIKE, "like"],
    [OpenLayers.Filter.Comparison.BETWEEN, "between"]
  ],
  allowBlank: !1,
  mode: "local",
  typeAhead: !0,
  forceSelection: !0,
  triggerAction: "all",
  width: 50,
  editable: !0,
  initComponent: function() {
    var a = {
      displayField: "name",
      valueField: "value",
      store: new Ext.data.SimpleStore({
        data: this.allowedTypes,
        fields: ["value", "name"]
      }),
      value: void 0 === this.value ? this.allowedTypes[0][0] : this.value,
      listeners: {
        blur: function() {
          var a = this.store.findExact("value", this.getValue()); - 1 != a ? this.fireEvent("select", this, this.store.getAt(a)) : null != this.startValue && this.setValue(this.startValue)
        }
      }
    };
    Ext.applyIf(this, a);
    gxp.form.ComparisonComboBox.superclass.initComponent.call(this)
  }
});
Ext.reg("gxp_comparisoncombo", gxp.form.ComparisonComboBox);
Ext.namespace("gxp.form");
Date.defaults.d = 1;
Date.defaults.m = 1;
gxp.form.ExtendedDateTimeField = Ext.extend(Ext.form.CompositeField, {
  initComponent: function() {
    Ext.QuickTips.init();
    this.items = [{
      xtype: "gxp_datefield",
      allowBlank: !1 !== this.initialConfig.allowBlank,
      todayText: this.initialConfig.todayText,
      selectToday: this.initialConfig.selectToday,
      ref: "date"
    }, {
      xtype: "timefield",
      width: 80,
      ref: "time"
    }];
    gxp.form.ExtendedDateTimeField.superclass.initComponent.apply(this, arguments)
  },
  getValue: function() {
    var a = this.date.getValue(),
        b = this.time.getValue();
    null !== a && "" === b && (b = "12:00 AM");
    if ("" !== b) {
      var b = this.time.parseDate(b),
          c = new Date(this.time.initDate),
          b = b.getTime() / 1E3 - c.getTime() / 1E3;
      return a + b - 60 * (new Date(1E3 * a)).getTimezoneOffset()
    }
    return a
  },
  setValue: function(a) {
    this.date.setValue(a);
    a = new Date(1E3 * parseFloat(a));
    a.setTime(a.getTime() + 6E4 * a.getTimezoneOffset());
    if (a) {
      var b = a.getHours();
      12 < b ? b -= 12 : 0 === b && (b = 12);
      var c = a.getMinutes();
      10 > c && (c = "0" + c);
      this.time.setValue(b + ":" + c + " " + (12 < a.getHours() ? "PM" : "AM"))
    }
  }
});
Ext.reg("gxp_datetimefield", gxp.form.ExtendedDateTimeField);
gxp.form.ExtendedDateField = Ext.extend(Ext.form.DateField, {
  altFormats: "-c|-Y|m -Y|n -Y|M -Y|m/d/-Y|n/j/-Y|m/j/-Y|n/d/-Y|c|Y|m/d/Y|n/j/Y|n/j/y|m/j/y|n/d/y|m/j/Y|n/d/Y|m-d-y|m-d-Y|m/d|m-d|md|mdy|mdY|d|Y-m-d|n-j|n/j",
  bcYrRegEx: /^(-\d{3,4})|(-\d{3,4})$/,
  invalidText: "{0} is not a valid date. If you are attempting to enter a BCE date please enter a zero padded 4 digit year or just enter the year",
  beforeBlur: Ext.emptyFn,
  getValue: function() {
    var a = Ext.form.DateField.superclass.getValue.call(this),
        b = this.parseDate(a);
    a.match(this.bcYrRegEx) && (1 === (a.match(/-/g) || []).length || "-" === a.charAt(0)) && b && (b = new Date(-1 * b.getFullYear(), b.getMonth(), b.getDate(), b.getHours(), b.getMinutes(), b.getSeconds()));
    return b ? b.getTime() / 1E3 : null
  },
  setValue: function(a) {
    var b = a;
    Ext.isNumber(parseFloat(a)) && (b = new Date(1E3 * parseFloat(a)), b.setTime(b.getTime() + 6E4 * b.getTimezoneOffset()));
    if (a = this.formatDate(b)) if (b = a.match(this.bcYrRegEx)) if ((b = b[0] || b[1]) && 5 > b.length) {
      for (var c = "-", d = b.length; 4 >= d; ++d) c += "0";
      a = a.replace(b, c + Math.abs(parseInt(b, 10)))
    }
    return Ext.form.DateField.superclass.setValue.call(this, a)
  },
  getPickerDate: function() {
    return new Date
  },
  onTriggerClick: function() {
    if (!this.disabled) {
      if (!this.menu) this.menu = new Ext.menu.DateMenu({
        hideOnClick: !1,
        focusOnSelect: !1
      });
      this.onFocus();
      Ext.apply(this.menu.picker, {
        minDate: this.minValue,
        todayText: this.todayText ? this.todayText : Ext.DatePicker.prototype.todayText,
        selectToday: this.selectToday ? this.selectToday : Ext.DatePicker.prototype.selectToday,
        maxDate: this.maxValue,
        disabledDatesRE: this.disabledDatesRE,
        disabledDatesText: this.disabledDatesText,
        disabledDays: this.disabledDays,
        disabledDaysText: this.disabledDaysText,
        format: this.format,
        showToday: this.showToday,
        startDay: this.startDay,
        minText: String.format(this.minText, this.formatDate(this.minValue)),
        maxText: String.format(this.maxText, this.formatDate(this.maxValue))
      });
      var a = this.getValue();
      this.menu.picker.setValue(null === a ? this.getPickerDate() : new Date(1E3 * a));
      this.menu.show(this.el, "tl-bl?");
      this.menuEvents("on")
    }
  }
});
Ext.reg("gxp_datefield", gxp.form.ExtendedDateField);
Ext.namespace("gxp.form");
gxp.form.FontComboBox = Ext.extend(Ext.form.ComboBox, {
  fonts: "Serif,SansSerif,Arial,Courier New,Tahoma,Times New Roman,Verdana".split(","),
  defaultFont: "Serif",
  allowBlank: !1,
  mode: "local",
  triggerAction: "all",
  editable: !1,
  initComponent: function() {
    var a = this.fonts || gxp.form.FontComboBox.prototype.fonts,
        b = this.defaultFont; - 1 === a.indexOf(this.defaultFont) && (b = a[0]);
    a = {
      displayField: "field1",
      valueField: "field1",
      store: a,
      value: b,
      tpl: new Ext.XTemplate('<tpl for="."><div class="x-combo-list-item"><span style="font-family: {field1};">{field1}</span></div></tpl>')
    };
    Ext.applyIf(this, a);
    gxp.form.FontComboBox.superclass.initComponent.call(this)
  }
});
Ext.reg("gxp_fontcombo", gxp.form.FontComboBox);
Ext.namespace("gxp.form");
gxp.form.ViewerField = Ext.extend(Ext.form.TextArea, {
  viewer: null,
  initComponent: function() {
    this.width = this.width || 350;
    this.height = this.height || 220;
    gxp.form.ViewerField.superclass.initComponent.call(this)
  },
  onRender: function() {
    if (!this.el) this.defaultAutoCreate = {
      tag: "textarea",
      style: {
        color: "transparent",
        background: "none"
      }
    };
    gxp.form.ViewerField.superclass.onRender.apply(this, arguments);
    this.viewerEl = Ext.get(document.createElement("div"));
    this.viewerEl.setStyle("position", "absolute");
    this.viewerEl.on({
      mouseenter: function() {
        this.hasFocus || this.el.focus()
      },
      mousemove: function() {
        this.hasFocus || this.el.focus()
      },
      mouseleave: function() {
        this.hasFocus && this.el.blur()
      },
      scope: this
    });
    this.el.dom.parentNode.appendChild(this.viewerEl.dom);
    this.viewerEl.anchorTo(this.el, "tl-tl");
    var a = {
      border: !1,
      renderTo: this.viewerEl,
      width: this.width,
      height: this.height,
      style: "border: 1px solid transparent"
    },
        b = Ext.applyIf(this.initialConfig.viewer || {}, {
        field: this,
        portalConfig: a
      });
    Ext.apply(b.portalConfig, a);
    this.viewer = new gxp.Viewer(b)
  }
});
Ext.reg("gxp_viewerfield", gxp.form.ViewerField);
Ext.namespace("gxp");
gxp.GoogleEarthPanel = Ext.extend(Ext.Panel, {
  HORIZONTAL_FIELD_OF_VIEW: 30 * Math.PI / 180,
  map: null,
  mapPanel: null,
  layers: null,
  earth: null,
  projection: null,
  layerCache: null,
  initComponent: function() {
    this.addEvents("beforeadd", "pluginfailure", "pluginready");
    gxp.GoogleEarthPanel.superclass.initComponent.call(this);
    var a = this.mapPanel;
    a && !(a instanceof GeoExt.MapPanel) && (a = Ext.getCmp(a));
    if (!a) throw Error("Could not get map panel from config: " + this.mapPanel);
    this.map = a.map;
    this.layers = a.layers;
    this.projection = new OpenLayers.Projection("EPSG:4326");
    this.on("render", this.onRenderEvent, this);
    this.on("show", this.onShowEvent, this);
    this.on("hide", function() {
      null != this.earth && this.updateMap();
      this.body.dom.innerHTML = "";
      this.earth = null
    }, this)
  },
  onEarthReady: function(a) {
    this.earth = a;
    void 0 === this.flyToSpeed ? this.earth.getOptions().setFlyToSpeed(this.earth.SPEED_TELEPORT) : null !== this.flyToSpeed && this.earth.getOptions().setFlyToSpeed(this.flyToSpeed);
    this.resetCamera();
    this.setExtent(this.map.getExtent());
    this.earth.getNavigationControl().setVisibility(this.earth.VISIBILITY_SHOW);
    a = this.earth.getNavigationControl().getScreenXY();
    a.setXUnits(this.earth.UNITS_PIXELS);
    a.setYUnits(this.earth.UNITS_INSET_PIXELS);
    this.earth.getWindow().setVisibility(!0);
    this.layers.each(function(a) {
      this.addLayer(a)
    }, this);
    this.layers.on("remove", this.updateLayers, this);
    this.layers.on("update", this.updateLayers, this);
    this.layers.on("add", this.updateLayers, this);
    this.fireEvent("pluginready", this.earth)
  },
  onRenderEvent: function() {
    var a = this.ownerCt && this.ownerCt.layout instanceof Ext.layout.CardLayout;
    if (!this.hidden && !a) this.onShowEvent()
  },
  onShowEvent: function() {
    if (this.rendered) this.layerCache = {}, google.earth.createInstance(this.body.dom, this.onEarthReady.createDelegate(this), function(a) {
      this.fireEvent("pluginfailure", this, a)
    }.createDelegate(this))
  },
  beforeDestroy: function() {
    this.layers.un("remove", this.updateLayers, this);
    this.layers.un("update", this.updateLayers, this);
    this.layers.un("add", this.updateLayers, this);
    gxp.GoogleEarthPanel.superclass.beforeDestroy.call(this)
  },
  updateLayers: function() {
    if (this.earth) {
      for (var a =
      this.earth.getFeatures(), b = a.getFirstChild(); null != b;) a.removeChild(b), b = a.getFirstChild();
      this.layers.each(function(a) {
        this.addLayer(a)
      }, this)
    }
  },
  addLayer: function(a, b) {
    var c = a.getLayer(),
        d = c && c.url;
    if (this.earth && c instanceof OpenLayers.Layer.WMS && "string" == typeof d && !1 !== this.fireEvent("beforeadd", a)) {
      var e = c.id;
      if (this.layerCache[e]) d = this.layerCache[e];
      else {
        var f = this.earth.createLink("kl_" + e),
            d = d.replace(/\?.*/, ""),
            g = c.params;
        f.setHref(d + ("/kml?mode=refresh&layers=" + g.LAYERS + "&styles=" + g.STYLES));
        d = this.earth.createNetworkLink("nl_" + e);
        d.setName(e);
        d.set(f, !1, !1);
        this.layerCache[e] = d
      }
      d.setVisibility(c.getVisibility());
      void 0 !== b && b < this.earth.getFeatures().getChildNodes().getLength() ? this.earth.getFeatures().insertBefore(this.earth.getFeatures().getChildNodes().item(b)) : this.earth.getFeatures().appendChild(d)
    }
  },
  setExtent: function(a) {
    var a = a.transform(this.map.getProjectionObject(), this.projection),
        b = a.getCenterLonLat(),
        a = this.getExtentWidth(a) / (2 * Math.tan(this.HORIZONTAL_FIELD_OF_VIEW)),
        c =
        this.earth.getView().copyAsLookAt(this.earth.ALTITUDE_RELATIVE_TO_GROUND);
    c.setLatitude(b.lat);
    c.setLongitude(b.lon);
    c.setRange(a);
    this.earth.getView().setAbstractView(c)
  },
  resetCamera: function() {
    var a = this.earth.getView().copyAsCamera(this.earth.ALTITUDE_RELATIVE_TO_GROUND);
    a.setRoll(0);
    a.setHeading(0);
    a.setTilt(0);
    this.earth.getView().setAbstractView(a)
  },
  getExtent: function() {
    var a = this.earth.getView().getViewportGlobeBounds();
    return new OpenLayers.Bounds(a.getWest(), a.getSouth(), a.getEast(), a.getNorth())
  },
  updateMap: function() {
    var a = this.earth.getView().copyAsLookAt(this.earth.ALTITUDE_RELATIVE_TO_GROUND),
        b = this.reprojectToMap(new OpenLayers.LonLat(a.getLongitude(), a.getLatitude()));
    this.map.zoomToExtent(this.reprojectToMap(this.getExtent()), !0);
    this.map.setCenter(b);
    var a = 2 * a.getRange() * Math.tan(this.HORIZONTAL_FIELD_OF_VIEW),
        c = this.map.getResolutionForZoom(this.map.getZoom() + 1),
        d = this.map.getExtent(),
        b = new OpenLayers.Bounds(b.lon - this.map.getSize().w / 2 * c, b.lat + this.map.getSize().h / 2 * c, b.lon + this.map.getSize().w / 2 * c, b.lat - this.map.getSize().h / 2 * c),
        d = Math.abs(this.getExtentWidth(d) - a);
    Math.abs(this.getExtentWidth(b) - a) < d && this.map.zoomTo(this.map.getZoom() + 1)
  },
  getExtentWidth: function(a) {
    var b = a.getCenterLonLat(),
        c = new OpenLayers.LonLat(a.left, b.lat),
        a = new OpenLayers.LonLat(a.right, b.lat);
    return 1E3 * OpenLayers.Util.distVincenty(c, a)
  },
  reprojectToGE: function(a) {
    return a.clone().transform(this.map.getProjectionObject(), this.projection)
  },
  reprojectToMap: function(a) {
    return a.clone().transform(this.projection, this.map.getProjectionObject())
  }
});
Ext.reg("gxp_googleearthpanel", gxp.GoogleEarthPanel);
Ext.namespace("gxp");
gxp.GoogleStreetViewPanel = Ext.extend(Ext.Panel, {
  panorama: null,
  heading: 0,
  pitch: 0,
  zoom: 0,
  location: null,
  initComponent: function() {
    Ext.applyIf(this, {
      plain: !0,
      border: !1
    });
    return gxp.GoogleStreetViewPanel.superclass.initComponent.call(this)
  },
  afterRender: function() {
    var a = this.ownerCt;
    a && (a = a.getSize(), Ext.applyIf(this, a), this.location || GeoExt.Popup && this.bubble(function(a) {
      if (a instanceof GeoExt.Popup) return this.location = a.location.clone().transform(a.map.getProjectionObject(), new OpenLayers.Projection("EPSG:4326")), !1
    }, this));
    gxp.GoogleStreetViewPanel.superclass.afterRender.call(this);
    a = {
      position: new google.maps.LatLng(this.location.lat, this.location.lon),
      pov: {
        heading: this.heading,
        pitch: this.pitch,
        zoom: this.zoom
      }
    };
    this.panorama = new google.maps.StreetViewPanorama(this.body.dom, a)
  },
  beforeDestroy: function() {
    delete this.panorama;
    gxp.GoogleStreetViewPanel.superclass.beforeDestroy.apply(this, arguments)
  },
  onResize: function(a, b) {
    gxp.GoogleStreetViewPanel.superclass.onResize.apply(this, arguments);
    this.panorama && "object" == typeof this.panorama && google.maps.event.trigger(this.panorama, "resize")
  },
  setSize: function(a, b, c) {
    gxp.GoogleStreetViewPanel.superclass.setSize.apply(this, arguments);
    this.panorama && "object" == typeof this.panorama && google.maps.event.trigger(this.panorama, "resize")
  }
});
Ext.reg("gxp_googlestreetviewpanel", gxp.GoogleStreetViewPanel);
Ext.namespace("gxp.grid");
gxp.grid.CapabilitiesGrid = Ext.extend(Ext.grid.GridPanel, {
  store: null,
  cm: null,
  expander: null,
  mapPanel: null,
  url: null,
  autoExpandColumn: "title",
  allowNewSources: !0,
  nameHeaderText: "Name",
  titleHeaderText: "Title",
  queryableHeaderText: "Queryable",
  layerSelectionLabel: "View available data from:",
  layerAdditionLabel: "or add a new server.",
  expanderTemplateText: "<p><b>Abstract:</b> {abstract}</p>",
  constructor: function() {
    this.addEvents("sourceselected");
    gxp.grid.CapabilitiesGrid.superclass.constructor.apply(this, arguments)
  },
  initComponent: function() {
    if (!this.store) this.store = new GeoExt.data.WMSCapabilitiesStore({
      url: this.url + "?service=wms&request=GetCapabilities"
    }), this.store.load();
    this.on("afterrender", function() {
      this.fireEvent("sourceselected", this, this.store)
    }, this);
    if (!("expander" in this)) this.expander = new Ext.grid.RowExpander({
      tpl: new Ext.Template(this.expanderTemplateText)
    });
    if (!this.plugins && this.expander) this.plugins = this.expander;
    if (!this.cm) {
      var a = [{
        id: "title",
        header: this.titleHeaderText,
        dataIndex: "title",
        sortable: !0
      }, {
        header: this.nameHeaderText,
        dataIndex: "name",
        width: 180,
        sortable: !0
      }, {
        header: this.queryableHeaderText,
        dataIndex: "queryable",
        width: 70,
        renderer: function(a, b) {
          b.css = "x-btn";
          var e = "x-btn cancel";
          a && (e = "x-btn add");
          return '<div style="background-repeat: no-repeat; background-position: 50% 0%; height: 16px;" class="' + e + '">&nbsp;</div>'
        }
      }];
      this.expander && a.unshift(this.expander);
      this.cm = new Ext.grid.ColumnModel(a)
    }
    if (!("allowNewSources" in this)) this.allowNewSources = !! this.metaStore;
    if (this.allowNewSources || this.metaStore && 1 < this.metaStore.getCount()) this.sourceComboBox = new Ext.form.ComboBox({
      store: this.metaStore,
      valueField: "identifier",
      displayField: "name",
      triggerAction: "all",
      editable: !1,
      allowBlank: !1,
      forceSelection: !0,
      mode: "local",
      value: this.metaStore.getAt(this.metaStore.findBy(function(a) {
        return a.get("store") == this.store
      }, this)).get("identifier"),
      listeners: {
        select: function(a, b) {
          this.fireEvent("sourceselected", this, b.data.store);
          this.reconfigure(b.data.store, this.getColumnModel());
          if (this.expander) this.expander.ows =
          b.get("url")
        },
        scope: this
      }
    }), this.metaStore.on("add", function(a, b, e) {
      this.sourceComboBox.onSelect(b[0], e)
    }, this), this.tbar = this.tbar || [], this.tbar.push("" + this.layerSelectionLabel), this.tbar.push(this.sourceComboBox);
    if (this.allowNewSources) {
      var b = this;
      if (!this.newSourceWindow) this.newSourceWindow = new gxp.NewSourceWindow({
        modal: !0,
        metaStore: this.metaStore,
        addSource: function() {
          b.addSource.apply(b, arguments)
        }
      });
      this.tbar.push(new Ext.Button({
        iconCls: "gxp-icon-addserver",
        text: this.layerAdditionLabel,
        handler: function() {
          this.newSourceWindow.show()
        },
        scope: this
      }))
    }
    gxp.grid.CapabilitiesGrid.superclass.initComponent.call(this)
  },
  addSource: function(a, b, c, d) {
    d = d || this;
    c = new GeoExt.data.WMSCapabilitiesStore({
      url: a,
      autoLoad: !0
    });
    this.metaStore.add(new this.metaStore.recordType({
      url: a,
      store: c,
      identifier: a,
      name: a
    }));
    b.apply(d)
  },
  addLayers: function() {
    for (var a = this.getSelectionModel().getSelections(), b, c, d = [], e = 0; e < a.length; e++) Ext.data.Record.AUTO_ID++, b = a[e].copy(Ext.data.Record.AUTO_ID), this.alignToGrid ? (c = b.getLayer().clone(), c.maxExtent = new OpenLayers.Bounds(-180, -90, 180, 90)) : (c = b.getLayer(), c instanceof OpenLayers.Layer.WMS && (c = new OpenLayers.Layer.WMS(c.name, c.url, {
      layers: c.params.LAYERS
    }, {
      attribution: c.attribution,
      maxExtent: OpenLayers.Bounds.fromArray(b.get("llbbox")).transform(new OpenLayers.Projection("EPSG:4326"), this.mapPanel.map.getProjectionObject())
    }))), b.data.layer = c, b.commit(!0), d.push(b);
    d.length && (a = this.mapPanel.layers.findBy(function(a) {
      return a.getLayer() instanceof OpenLayers.Layer.Vector
    }), -1 !== a ? this.mapPanel.layers.insert(a, d) : this.mapPanel.layers.add(d))
  }
});
Ext.reg("gxp_capabilitiesgrid", gxp.grid.CapabilitiesGrid);
Ext.ns("gxp.tree");
gxp.tree.TreeGridNodeUI = Ext.ux && Ext.ux.tree && Ext.ux.tree.TreeGridNodeUI && Ext.extend(Ext.ux.tree.TreeGridNodeUI, {
  renderElements: function(a, b, c, d) {
    var e = a.getOwnerTree(),
        f = e.columns,
        g = f[0],
        h, j, k;
    this.indentMarkup = a.parentNode ? a.parentNode.ui.getChildIndent() : "";
    var l = Ext.isBoolean(b.checked);
    j = ['<tbody class="x-tree-node">', '<tr ext:tree-node-id="', a.id, '" class="x-tree-node-el x-tree-node-leaf ', b.cls, '">', '<td class="x-treegrid-col">', '<span class="x-tree-node-indent">', this.indentMarkup, "</span>", '<img src="', this.emptyIcon, '" class="x-tree-ec-icon x-tree-elbow" />', '<img src="', b.icon || this.emptyIcon, '" class="x-tree-node-icon', b.icon ? " x-tree-node-inline-icon" : "", b.iconCls ? " " + b.iconCls : "", '" unselectable="on" />', l ? '<input class="x-tree-node-cb" type="checkbox" ' + (b.checked ? 'checked="checked" />' : "/>") : "", '<a hidefocus="on" class="x-tree-node-anchor" href="', b.href ? b.href : "#", '" tabIndex="1" ', b.hrefTarget ? ' target="' + b.hrefTarget + '"' : "", ">", '<span unselectable="on">', g.tpl ? g.tpl.apply(b) : b[g.dataIndex] || g.text, "</span></a>", "</td>"];
    for (h = 1, k = f.length; h < k; h++) g = f[h], j.push('<td class="x-treegrid-col ', g.cls ? g.cls : "", '">', '<div unselectable="on" class="x-treegrid-text"', g.align ? ' style="text-align: ' + g.align + ';"' : "", ">", g.tpl ? g.tpl.apply(b) : b[g.dataIndex], "</div>", "</td>");
    j.push('</tr><tr class="x-tree-node-ct"><td colspan="', f.length, '">', '<table class="x-treegrid-node-ct-table" cellpadding="0" cellspacing="0" style="table-layout: fixed; display: none; width: ', e.innerCt.getWidth(), 'px;"><colgroup>');
    for (h = 0, k = f.length; h < k; h++) j.push('<col style="width: ', f[h].hidden ? 0 : f[h].width, 'px;" />');
    j.push("</colgroup></table></td></tr></tbody>");
    this.wrap = !0 !== d && a.nextSibling && a.nextSibling.ui.getEl() ? Ext.DomHelper.insertHtml("beforeBegin", a.nextSibling.ui.getEl(), j.join("")) : Ext.DomHelper.insertHtml("beforeEnd", c, j.join(""));
    this.elNode = this.wrap.childNodes[0];
    this.ctNode = this.wrap.childNodes[1].firstChild.firstChild;
    a = this.elNode.firstChild.childNodes;
    this.indentNode = a[0];
    this.ecNode =
    a[1];
    this.iconNode = a[2];
    b = 3;
    if (l) this.checkbox = a[3], this.checkbox.defaultChecked = this.checkbox.checked, b++;
    this.anchor = a[b];
    this.textNode = a[b].firstChild
  }
});
Ext.ns("gxp.tree");
gxp.tree.SymbolizerLoader = function(a) {
  Ext.apply(this, a);
  gxp.tree.SymbolizerLoader.superclass.constructor.call(this)
};
Ext.extend(gxp.tree.SymbolizerLoader, Ext.util.Observable, {
  symbolizers: null,
  load: function(a, b) {
    if (this.fireEvent("beforeload", this, a)) {
      for (; a.firstChild;) a.removeChild(a.firstChild);
      for (var c = new Ext.Template('<div class="gxp-symbolgrid-swatch" id="{id}"></div>'), d = 0, e = this.symbolizers.length; d < e; ++d) {
        var f = this.symbolizers[d],
            g = f.CLASS_NAME.substring(f.CLASS_NAME.lastIndexOf(".") + 1),
            h = f.clone();
        if ("Text" === g && (h.label = "Ab", h.fillColor || h.graphicName)) h.graphic = !0;
        var j = Ext.id(),
            f = this.createNode({
            type: g,
            expanded: !0,
            rendererId: j,
            originalSymbolizer: f,
            symbolizer: h,
            iconCls: "gxp-icon-symbolgrid-" + g.toLowerCase(),
            preview: c.applyTemplate({
              id: j
            })
          });
        if ("Polygon" === g || "Point" === g) j = Ext.id(), g = h.clone(), g.fill = !1, f.appendChild(this.createNode({
          checked: void 0 !== h.stroke ? h.stroke : !0,
          iconCls: "gxp-icon-symbolgrid-none",
          type: "Stroke",
          symbolizer: g,
          rendererId: j,
          preview: c.applyTemplate({
            id: j
          })
        })), j = Ext.id(), g = h.clone(), g.stroke = !1, f.appendChild(this.createNode({
          checked: void 0 !== h.fill ? h.fill : !0,
          iconCls: "gxp-icon-symbolgrid-none",
          type: "Fill",
          symbolizer: g,
          rendererId: j,
          preview: c.applyTemplate({
            id: j
          })
        }));
        else if ("Line" === g) j = Ext.id(), f.appendChild(this.createNode({
          type: "Stroke",
          checked: !0,
          iconCls: "gxp-icon-symbolgrid-none",
          symbolizer: h.clone(),
          rendererId: j,
          preview: c.applyTemplate({
            id: j
          })
        }));
        else if ("Text" === g) j = Ext.id(), g = h.clone(), g.graphic = !1, f.appendChild(this.createNode({
          checked: !0,
          iconCls: "gxp-icon-symbolgrid-none",
          type: "Label",
          symbolizer: g,
          rendererId: j,
          preview: c.applyTemplate({
            id: j
          })
        })), j = Ext.id(), g = h.clone(), g.label = "", f.appendChild(this.createNode({
          checked: h.graphic,
          iconCls: "gxp-icon-symbolgrid-none",
          type: "Graphic",
          symbolizer: g,
          rendererId: j,
          preview: c.applyTemplate({
            id: j
          })
        }));
        a.appendChild(f)
      }
      "function" == typeof b && b();
      this.fireEvent("load", this, a)
    }
  },
  createNode: function(a) {
    this.baseAttrs && Ext.apply(a, this.baseAttrs);
    if (!a.uiProvider) a.uiProvider = gxp.tree.TreeGridNodeUI;
    a.nodeType = a.nodeType || "node";
    return new Ext.tree.TreePanel.nodeTypes[a.nodeType](a)
  }
});
Ext.namespace("gxp.grid");
gxp.grid.SymbolizerGrid = Ext.ux && Ext.ux.tree && Ext.ux.tree.TreeGrid && Ext.extend(Ext.ux.tree.TreeGrid, {
  symbolizers: null,
  enableHdMenu: !1,
  enableSort: !1,
  useArrows: !1,
  columnResize: !1,
  cls: "gxp-symbolgrid",
  typeTitle: "Symbolizer Type",
  previewTitle: "Preview",
  initComponent: function() {
    this.on("checkchange", this.onCheckChange, this);
    this.loader = new gxp.tree.SymbolizerLoader({
      symbolizers: this.symbolizers
    });
    this.columns = [{
      header: this.typeTitle,
      dataIndex: "type",
      width: 200
    }, {
      header: this.previewTitle,
      width: 100,
      dataIndex: "preview"
    }];
    gxp.grid.SymbolizerGrid.superclass.initComponent.call(this)
  },
  getSymbolizers: function() {
    var a = [];
    this.root.eachChild(function(b) {
      var c = !1;
      b.eachChild(function(a) {
        var e = a.attributes.type.toLowerCase();
        if ("label" !== e) b.attributes.originalSymbolizer[e] = a.attributes.checked;
        !0 === a.attributes.checked && (c = !0)
      });
      c && a.push(b.attributes.originalSymbolizer)
    });
    return a
  },
  beforeDestroy: function() {
    this.root.cascade(function(a) {
      if (a.attributes.featureRenderer) a.attributes.featureRenderer.destroy(), a.attributes.featureRenderer =
      null
    });
    gxp.grid.SymbolizerGrid.superclass.onDestroy.call(this)
  },
  onCheckChange: function(a, b) {
    var c = a.attributes,
        d = c.featureRenderer,
        e = c.type.toLowerCase(),
        c = c.symbolizer,
        f = a.parentNode.attributes.symbolizer;
    if ("label" !== e) if ("graphic" === e) {
      var g = a.parentNode.findChild("type", "Label");
      null !== g && (g.attributes.checked && b || !b ? f[e] = c[e] = b : a.getUI().toggleCheck(!1))
    } else f[e] = c[e] = b;
    else b ? c[e] = f[e] = "Ab" : (c[e] = f[e] = "", e = a.parentNode.findChild("type", "Graphic"), null !== e && e.getUI().toggleCheck(!1));
    a.parentNode.attributes.featureRenderer && a.parentNode.attributes.featureRenderer.update({
      symbolizers: [f]
    });
    d.update({
      symbolizers: [c]
    })
  },
  afterRender: function() {
    gxp.grid.SymbolizerGrid.superclass.afterRender.call(this);
    this.root.cascade(function(a) {
      if (a.attributes.rendererId) {
        var b = Ext.get(a.attributes.rendererId);
        if (b) a.attributes.featureRenderer = new GeoExt.FeatureRenderer({
          symbolizers: [a.attributes.symbolizer],
          renderTo: b,
          width: 21,
          height: 21
        })
      }
    })
  }
});
gxp.grid.SymbolizerGrid && Ext.reg("gxp_symbolgrid", gxp.grid.SymbolizerGrid);
Ext.namespace("gxp");
gxp.Histogram = Ext.extend(Ext.BoxComponent, {
  onRender: function(a, b) {
    if (!this.el) {
      var c = document.createElement("div");
      c.id = this.getId();
      this.el = Ext.get(c)
    }
    this.el.addClass("gxp-histogram");
    this.quantities && this.setQuantities(this.quantities);
    gxp.Histogram.superclass.onRender.apply(this, arguments)
  },
  setQuantities: function(a) {
    for (this.quantities = a; this.el.dom.firstChild;) this.el.dom.removeChild(this.el.dom.firstChild);
    var b, c = 0,
        d = Number.POSITIVE_INFINITY,
        e, f = a.length;
    for (e = 0; e < f; ++e) b = a[e], b < d && (d = b), b > c && (c = b);
    var c = 100 / c,
        g, h = 100 / f;
    for (e = 0; e < f; ++e) b = document.createElement("div"), b.className = "bar", g = b.style, g.width = h + "%", g.left = e * h + "%", g.top = 100 - (a[e] - d) * c + "%", this.el.dom.appendChild(b)
  }
});
Ext.reg("gxp_histogram", gxp.Histogram);
Ext.namespace("gxp");
gxp.LayerUploadPanel = Ext.extend(Ext.FormPanel, {
  titleLabel: "Title",
  titleEmptyText: "Layer title",
  abstractLabel: "Description",
  abstractEmptyText: "Layer description",
  fileLabel: "Data",
  fieldEmptyText: "Browse for data archive...",
  uploadText: "Upload",
  uploadFailedText: "Upload failed",
  processingUploadText: "Processing upload...",
  waitMsgText: "Uploading your data...",
  invalidFileExtensionText: "File extension must be one of: ",
  optionsText: "Options",
  workspaceLabel: "Workspace",
  workspaceEmptyText: "Default workspace",
  dataStoreLabel: "Store",
  dataStoreEmptyText: "Choose a store",
  dataStoreNewText: "Create new store",
  crsLabel: "CRS",
  crsEmptyText: "Coordinate Reference System ID",
  invalidCrsText: "CRS identifier should be an EPSG code (e.g. EPSG:4326)",
  fileUpload: !0,
  validFileExtensions: ".zip,.tif,.tiff,.gz,.tar.bz2,.tar,.tgz,.tbz2".split(","),
  defaultDataStore: null,
  constructor: function(a) {
    a.errorReader = {
      read: a.handleUploadResponse || this.handleUploadResponse.createDelegate(this)
    };
    gxp.LayerUploadPanel.superclass.constructor.call(this, a)
  },
  selectedWorkspace: null,
  initComponent: function() {
    this.items = [{
      xtype: "textfield",
      name: "title",
      fieldLabel: this.titleLabel,
      emptyText: this.titleEmptyText,
      allowBlank: !0
    }, {
      xtype: "textarea",
      name: "abstract",
      fieldLabel: this.abstractLabel,
      emptyText: this.abstractEmptyText,
      allowBlank: !0
    }, {
      xtype: "fileuploadfield",
      id: "file",
      anchor: "90%",
      emptyText: this.fieldEmptyText,
      fieldLabel: this.fileLabel,
      name: "file",
      buttonText: "",
      buttonCfg: {
        iconCls: "gxp-icon-filebrowse"
      },
      listeners: {
        fileselected: function(a, b) {
          a.setValue(b.split(/[/\\]/).pop())
        }
      },
      validator: this.fileNameValidator.createDelegate(this)
    }, {
      xtype: "fieldset",
      ref: "optionsFieldset",
      title: this.optionsText,
      checkboxToggle: !0,
      collapsed: !0,
      hidden: void 0 != this.workspace && void 0 != this.store && void 0 != this.crs,
      hideMode: "offsets",
      defaults: {
        anchor: "97%"
      },
      items: [this.createWorkspacesCombo(), this.createDataStoresCombo(),
      {
        xtype: "textfield",
        name: "nativeCRS",
        fieldLabel: this.crsLabel,
        emptyText: this.crsEmptyText,
        allowBlank: !0,
        regex: /^epsg:\d+$/i,
        regexText: this.invalidCrsText
      }],
      listeners: {
        collapse: function(a) {
          a.items.each(function(a) {
            a.reset()
          })
        }
      }
    }];
    this.buttons = [{
      text: this.uploadText,
      handler: function() {
        var a = this.getForm();
        if (a.isValid()) {
          var b = a.getFieldValues(),
              c = {
              "import": {}
              };
          if (b.workspace) c["import"].targetWorkspace = {
            workspace: {
              name: b.workspace
            }
          };
          if (Ext.isEmpty(b.store) && this.defaultDataStore) c["import"].targetStore = {
            dataStore: {
              name: this.defaultDataStore
            }
          };
          else if (!Ext.isEmpty(b.store) && b.store !== this.dataStoreNewText) c["import"].targetStore = {
            dataStore: {
              name: b.store
            }
          };
          Ext.Ajax.request({
            url: this.getUploadUrl(),
            method: "POST",
            jsonData: c,
            success: function(b) {
              this._import =
              b.getResponseHeader("Location");
              this.optionsFieldset.expand();
              a.submit({
                url: this._import + "/tasks?expand=all",
                waitMsg: this.waitMsgText,
                waitMsgTarget: !0,
                reset: !0,
                scope: this
              })
            },
            scope: this
          })
        }
      },
      scope: this
    }];
    this.addEvents("workspaceselected", "datastoreselected", "uploadcomplete");
    this.getDefaultDataStore("default");
    gxp.LayerUploadPanel.superclass.initComponent.call(this)
  },
  fileNameValidator: function(a) {
    for (var b = !1, c, d = 0, e = this.validFileExtensions.length; d < e; ++d) if (c = this.validFileExtensions[d], a.slice(-c.length).toLowerCase() === c) {
      b = !0;
      break
    }
    return b || this.invalidFileExtensionText + "<br/>" + this.validFileExtensions.join(", ")
  },
  createWorkspacesCombo: function() {
    return {
      xtype: "combo",
      name: "workspace",
      ref: "../workspace",
      fieldLabel: this.workspaceLabel,
      store: new Ext.data.JsonStore({
        url: this.getWorkspacesUrl(),
        autoLoad: !0,
        root: "workspaces.workspace",
        fields: ["name", "href"]
      }),
      displayField: "name",
      valueField: "name",
      mode: "local",
      allowBlank: !0,
      triggerAction: "all",
      forceSelection: !0,
      listeners: {
        select: function(a, b) {
          this.getDefaultDataStore(b.get("name"));
          this.fireEvent("workspaceselected", this, b)
        },
        scope: this
      }
    }
  },
  createDataStoresCombo: function() {
    var a = new Ext.data.JsonStore({
      autoLoad: !1,
      root: "dataStores.dataStore",
      fields: ["name", "href"]
    });
    this.on({
      workspaceselected: function(d, e) {
        c.reset();
        var f = e.get("href");
        a.removeAll();
        a.proxy = new Ext.data.HttpProxy({
          url: f.split(".json").shift() + "/datastores.json"
        });
        a.proxy.on("loadexception", b, this);
        a.load()
      },
      scope: this
    });
    var b = function() {
      var c = new a.recordType({
        name: this.dataStoreNewText
      });
      a.insert(0, c);
      a.proxy && a.proxy.un("loadexception", b, this)
    };
    a.on("load", b, this);
    var c = new Ext.form.ComboBox({
      name: "store",
      ref: "../dataStore",
      emptyText: this.dataStoreEmptyText,
      fieldLabel: this.dataStoreLabel,
      store: a,
      displayField: "name",
      valueField: "name",
      mode: "local",
      allowBlank: !0,
      triggerAction: "all",
      forceSelection: !0,
      listeners: {
        select: function(a, b) {
          this.fireEvent("datastoreselected", this, b)
        },
        scope: this
      }
    });
    return c
  },
  getDefaultDataStore: function(a) {
    Ext.Ajax.request({
      url: this.url + "/workspaces/" + a + "/datastores/default.json",
      callback: function(b, c, d) {
        this.defaultDataStore = null;
        if (200 === d.status && (b = Ext.decode(d.responseText), "default" === a && b.dataStore && b.dataStore.workspace && (this.workspace.setValue(b.dataStore.workspace.name), this.fireEvent("workspaceselected", this, new this.workspace.store.recordType({
          name: b.dataStore.workspace.name,
          href: b.dataStore.workspace.href
        }))), b.dataStore && !0 === b.dataStore.enabled && !/file/i.test(b.dataStore.type))) this.defaultDataStore = b.dataStore.name, this.dataStore.setValue(this.defaultDataStore)
      },
      scope: this
    })
  },
  getUploadUrl: function() {
    return this.url + "/imports"
  },
  getWorkspacesUrl: function() {
    return this.url + "/workspaces.json"
  },
  handleUploadResponse: function(a) {
    var b = this.parseResponseText(a.responseText),
        c, d, e, f, a = this.getForm().getFieldValues(),
        g = !! b;
    if (b) if ("string" === typeof b) g = !1, e = b;
    else if (d = b.tasks || [b.task], 0 === d.length) g = !1, e = "Upload contains no suitable files.";
    else
    for (f = d.length - 1; 0 <= f; --f)(b = d[f]) ? "NO_FORMAT" === b.state ? (g = !1, e = "Upload contains no suitable files.") : "NO_CRS" === b.state && !a.nativeCRS && (g = !1, e = "Coordinate Reference System (CRS) of source file " + b.data.file + " could not be determined. Please specify manually.") : (g = !1, e = "Unknown upload error");
    g ? (a.title || a["abstract"] || a.nativeCRS) && d[0].target.dataStore ? (this.waitMsg = new Ext.LoadMask((this.ownerCt || this).getEl(), {
      msg: this.processingUploadText
    }), this.waitMsg.show(), Ext.Ajax.request({
      method: "PUT",
      url: d[0].layer.href,
      jsonData: {
        title: a.title || void 0,
        "abstract": a["abstract"] || void 0,
        srs: a.nativeCRS || void 0
      },
      success: this.finishUpload,
      failure: function(a) {
        this.waitMsg && this.waitMsg.hide();
        var b = [];
        try {
          var c = Ext.decode(a.responseText);
          if (c.errors) for (var d = 0, e = c.errors.length; d < e; ++d) b.push({
            id: ~c.errors[d].indexOf("SRS") ? "nativeCRS" : "file",
            msg: c.errors[d]
          })
        } catch (f) {
          b.push({
            id: "file",
            msg: a.responseText
          })
        }
        this.getForm().markInvalid(b)
      },
      scope: this
    })) : this.finishUpload() : c = [{
      data: {
        id: "file",
        msg: e || this.uploadFailedText
      }
    }];
    return {
      success: !1,
      records: c
    }
  },
  finishUpload: function() {
    Ext.Ajax.request({
      method: "POST",
      url: this._import,
      failure: this.handleFailure,
      success: this.handleUploadSuccess,
      scope: this
    })
  },
  parseResponseText: function(a) {
    var b;
    try {
      b = Ext.decode(a)
    } catch (c) {
      if (a = a.match(/^\s*<pre[^>]*>(.*)<\/pre>\s*/)) try {
        b = Ext.decode(a[1])
      } catch (d) {
        b = a[1]
      }
    }
    return b
  },
  handleUploadSuccess: function() {
    Ext.Ajax.request({
      method: "GET",
      url: this._import + "?expand=all",
      failure: this.handleFailure,
      success: function(a) {
        this.waitMsg && this.waitMsg.hide();
        this.getForm().reset();
        this.fireEvent("uploadcomplete", this, Ext.decode(a.responseText));
        delete this._import
      },
      scope: this
    })
  },
  handleFailure: function(a) {
    a && 1223 === a.status ? this.handleUploadSuccess(a) : (this.waitMsg && this.waitMsg.hide(), this.getForm().markInvalid([{
      file: this.uploadFailedText
    }]))
  }
});
Ext.reg("gxp_layeruploadpanel", gxp.LayerUploadPanel);
Ext.namespace("gxp");
gxp.LineSymbolizer = Ext.extend(Ext.Panel, {
  symbolizer: null,
  initComponent: function() {
    this.items = [{
      xtype: "gxp_strokesymbolizer",
      symbolizer: this.symbolizer,
      listeners: {
        change: function() {
          this.fireEvent("change", this.symbolizer)
        },
        scope: this
      }
    }];
    this.addEvents("change");
    gxp.LineSymbolizer.superclass.initComponent.call(this)
  }
});
Ext.reg("gxp_linesymbolizer", gxp.LineSymbolizer);
Ext.namespace("gxp");
gxp.NewSourceWindow = Ext.extend(Ext.Window, {
  bodyStyle: "padding: 0px",
  hideBorders: !0,
  width: 300,
  closeAction: "hide",
  error: null,
  initComponent: function() {
    window.setTimeout(function() {
      throw "gxp.NewSourceWindow is deprecated. Use gxp.NewSourceDialog instead.";
    }, 0);
    this.addEvents("server-added");
    gxp.NewSourceWindow.superclass.initComponent.apply(this, arguments);
    this.addEvents("server-added");
    var a = this.add(new gxp.NewSourceDialog(Ext.applyIf({
      addSource: this.addSource,
      header: !1,
      listeners: {
        urlselected: function(a, c) {
          this.fireEvent("server-added", c)
        }
      }
    }, this.initialConfig)));
    this.setTitle(a.title);
    this.setLoading = a.setLoading.createDelegate(a);
    this.setError = a.setError.createDelegate(a);
    this.on("hide", a.onHide, a)
  },
  addSource: function() {}
});
Ext.namespace("gxp");
gxp.PolygonSymbolizer = Ext.extend(Ext.Panel, {
  symbolizer: null,
  initComponent: function() {
    this.items = [{
      xtype: "gxp_fillsymbolizer",
      symbolizer: this.symbolizer,
      listeners: {
        change: function() {
          this.fireEvent("change", this.symbolizer)
        },
        scope: this
      }
    }, {
      xtype: "gxp_strokesymbolizer",
      symbolizer: this.symbolizer,
      listeners: {
        change: function() {
          this.fireEvent("change", this.symbolizer)
        },
        scope: this
      }
    }];
    this.addEvents("change");
    gxp.PolygonSymbolizer.superclass.initComponent.call(this)
  }
});
Ext.reg("gxp_polygonsymbolizer", gxp.PolygonSymbolizer);
Ext.namespace("gxp");
gxp.QueryPanel = Ext.extend(Ext.Panel, {
  layout: "form",
  spatialQuery: !0,
  attributeQuery: !0,
  caseInsensitiveMatch: !1,
  likeSubstring: !1,
  wildCardString: ".*",
  selectedLayer: null,
  featureStore: null,
  attributeStore: null,
  geometryType: null,
  geometryName: null,
  queryByLocationText: "Query by location",
  currentTextText: "Current extent",
  queryByAttributesText: "Query by attributes",
  layerText: "Layer",
  initComponent: function() {
    this.addEvents("ready", "beforelayerchange", "layerchange", "beforequery", "query", "storeload");
    this.mapExtentField =
    new Ext.form.TextField({
      fieldLabel: this.currentTextText,
      readOnly: !0,
      anchor: "100%",
      value: this.getFormattedMapExtent()
    });
    this.map.events.on({
      moveend: this.updateMapExtent,
      scope: this
    });
    this.createFilterBuilder(this.layerStore.getAt(0));
    this.items = [{
      xtype: "combo",
      name: "layer",
      fieldLabel: this.layerText,
      store: this.layerStore,
	  width: 315,
      value: this.layerStore.getAt(0).get("name"),
      displayField: "title",
      valueField: "name",
      mode: "local",
      allowBlank: !0,
      editable: !1,
      triggerAction: "all",
      listeners: {
        beforeselect: function(a, b) {
          return this.fireEvent("beforelayerchange", this, b)
        },
        select: function(a, b) {
          this.createFilterBuilder(b)
        },
        scope: this
      }
    }, {
      xtype: "fieldset",
      title: this.queryByLocationText,
      checkboxToggle: !0,
      collapsed: !this.spatialQuery,
      anchor: "95%",
      items: [this.mapExtentField],
      listeners: {
        collapse: function() {
          this.spatialQuery = !1
        },
        expand: function() {
          this.spatialQuery = !0
        },
        scope: this
      }
    }, {
      xtype: "fieldset",
      title: this.queryByAttributesText,
      checkboxToggle: !0,
      collapsed: !this.attributeQuery,
      anchor: "95%",
      items: [this.filterBuilder],
      listeners: {
        collapse: function() {
          this.attributeQuery = !1
        },
        expand: function() {
          this.attributeQuery = !0
        },
        scope: this
      }
    }];
    gxp.QueryPanel.superclass.initComponent.apply(this, arguments)
  },
  createFilterBuilder: function(a) {
    this.selectedLayer = a;
    var b = this.filterBuilder && this.filterBuilder.ownerCt;
    b && b.remove(this.filterBuilder, !0);
    this.attributeStore = new GeoExt.data.AttributeStore({
      url: a.get("schema"),
      listeners: {
        load: function(b) {
          this.geometryName = null;
          b.filterBy(function(b) {
            var c = /gml:((Multi)?(Point|Line|Polygon|Curve|Surface|Geometry)).*/.exec(b.get("type"));
            if (c && !this.geometryName) this.geometryName = b.get("name"), this.geometryType = c[1], this.fireEvent("layerchange", this, a);
            return !c
          }, this);
          this.createFeatureStore()
        },
        scope: this
      },
      autoLoad: !0
    });
    this.filterBuilder = new gxp.FilterBuilder({
      attributes: this.attributeStore,
      allowGroups: !1,
      caseInsensitiveMatch: this.caseInsensitiveMatch
    });
    b && (b.add(this.filterBuilder), b.doLayout())
  },
  getFormattedMapExtent: function() {
    return this.map && this.map.getExtent() && this.map.getExtent().toBBOX().replace(/\.(\d)\d*/g, ".$1").replace(/,/g, ", ")
  },
  updateMapExtent: function() {
    this.mapExtentField.setValue(this.getFormattedMapExtent())
  },
  getFilter: function() {
    var a = this.attributeQuery && this.filterBuilder.getFilter();
    a && this.likeSubstring && (a = this.wrapWildCards(a));
    var b = this.spatialQuery && new OpenLayers.Filter.Spatial({
      type: OpenLayers.Filter.Spatial.BBOX,
      value: this.map.getExtent()
    });
    return a && b ? new OpenLayers.Filter.Logical({
      type: OpenLayers.Filter.Logical.AND,
      filters: [b, a]
    }) : a || b
  },
  wrapWildCards: function(a) {
    if (a instanceof OpenLayers.Filter.Logical) for (var b =
    0, c = a.filters.length; b < c; ++b) a = this.wrapWildCards(a.filters[b]);
    else if (a.type === OpenLayers.Filter.Comparison.LIKE) a.value = this.wildCardString + a.value + this.wildCardString;
    return a
  },
  getFieldType: function(a) {
    return {
      "xsd:boolean": "boolean",
      "xsd:int": "int",
      "xsd:integer": "int",
      "xsd:short": "int",
      "xsd:long": "int",
      "xsd:date": "date",
      "xsd:string": "string",
      "xsd:float": "float",
      "xsd:double": "float"
    }[a]
  },
  createFeatureStore: function() {
    var a = [];
    this.attributeStore.each(function(b) {
      a.push({
        name: b.get("name"),
        type: this.getFieldType(b.get("type"))
      })
    }, this);
    var b = this.selectedLayer;
    this.featureStore = new gxp.data.WFSFeatureStore({
      fields: a,
      srsName: this.map.getProjection(),
      url: b.get("url"),
      featureType: b.get("name"),
      featureNS: b.get("namespace"),
      geometryName: this.geometryName,
      schema: b.get("schema"),
      maxFeatures: this.maxFeatures,
      autoLoad: !1,
      autoSave: !1,
      listeners: {
        load: function(a, b, e) {
          this.fireEvent("storeload", this, a, b, e)
        },
        scope: this
      }
    });
    this.fireEvent("ready", this, this.featureStore)
  },
  query: function() {
    this.featureStore && !1 !== this.fireEvent("beforequery", this) && (this.featureStore.setOgcFilter(this.getFilter()), this.featureStore.load(), this.fireEvent("query", this, this.featureStore))
  },
  beforeDestroy: function() {
    this.map && this.map.events && this.map.events.un({
      moveend: this.updateMapExtent,
      scope: this
    });
    gxp.QueryPanel.superclass.beforeDestroy.apply(this, arguments)
  }
});
Ext.reg("gxp_querypanel", gxp.QueryPanel);
Ext.namespace("gxp");
gxp.ScaleLimitPanel = Ext.extend(Ext.Panel, {
  maxScaleDenominatorLimit: 1.577757414193268E9 * OpenLayers.DOTS_PER_INCH / 256,
  limitMaxScaleDenominator: !0,
  maxScaleDenominator: void 0,
  minScaleDenominatorLimit: 1.577757414193268E9 * Math.pow(0.5, 19) * OpenLayers.DOTS_PER_INCH / 256,
  limitMinScaleDenominator: !0,
  minScaleDenominator: void 0,
  scaleLevels: 20,
  scaleSliderTemplate: "{scaleType} Scale 1:{scale}",
  modifyScaleTipContext: Ext.emptyFn,
  scaleFactor: null,
  changing: !1,
  border: !1,
  maxScaleLimitText: "Max scale limit",
  minScaleLimitText: "Min scale limit",
  initComponent: function() {
    this.layout = "column";
    this.defaults = {
      border: !1,
      bodyStyle: "margin: 0 5px;"
    };
    this.bodyStyle = {
      padding: "5px"
    };
    this.scaleSliderTemplate = new Ext.Template(this.scaleSliderTemplate);
    Ext.applyIf(this, {
      minScaleDenominator: this.minScaleDenominatorLimit,
      maxScaleDenominator: this.maxScaleDenominatorLimit
    });
    this.scaleFactor = Math.pow(this.maxScaleDenominatorLimit / this.minScaleDenominatorLimit, 1 / (this.scaleLevels - 1));
    this.scaleSlider = new Ext.Slider({
      vertical: !0,
      height: 100,
      values: [0, 100],
      listeners: {
        changecomplete: function(a) {
          this.updateScaleValues(a)
        },
        render: function(a) {
          a.thumbs[0].el.setVisible(this.limitMaxScaleDenominator);
          a.thumbs[1].el.setVisible(this.limitMinScaleDenominator);
          a.setDisabled(!this.limitMinScaleDenominator && !this.limitMaxScaleDenominator)
        },
        scope: this
      },
      plugins: [new gxp.slider.Tip({
        getText: function(a) {
          var b = a.slider.thumbs.indexOf(a),
              a = {
              scale: "" + this.sliderValuesToScale([a.value])[0],
              zoom: (a.value * (this.scaleLevels / 100)).toFixed(1),
              type: 0 === b ? "Max" : "Min",
              scaleType: 0 === b ? "Min" : "Max"
              };
          this.modifyScaleTipContext(this, a);
          return this.scaleSliderTemplate.apply(a)
        }.createDelegate(this)
      })]
    });
    this.maxScaleDenominatorInput = new Ext.form.NumberField({
      allowNegative: !1,
      width: 100,
      fieldLabel: "1",
      value: Math.round(this.maxScaleDenominator),
      disabled: !this.limitMaxScaleDenominator,
      validator: function(a) {
        return !this.limitMinScaleDenominator || a > this.minScaleDenominator
      }.createDelegate(this),
      listeners: {
        valid: function(a) {
          var a = Number(a.getValue()),
              b = Math.round(this.maxScaleDenominatorLimit);
          if (a < b && a > this.minScaleDenominator) this.maxScaleDenominator = a, this.updateSliderValues()
        },
        change: function(a) {
          var b =
          Number(a.getValue()),
              c = Math.round(this.maxScaleDenominatorLimit);
          b > c ? a.setValue(c) : b < this.minScaleDenominator ? a.setValue(this.minScaleDenominator) : (this.maxScaleDenominator = b, this.updateSliderValues())
        },
        scope: this
      }
    });
    this.minScaleDenominatorInput = new Ext.form.NumberField({
      allowNegative: !1,
      width: 100,
      fieldLabel: "1",
      value: Math.round(this.minScaleDenominator),
      disabled: !this.limitMinScaleDenominator,
      validator: function(a) {
        return !this.limitMaxScaleDenominator || a < this.maxScaleDenominator
      }.createDelegate(this),
      listeners: {
        valid: function(a) {
          var a = Number(a.getValue()),
              b = Math.round(this.minScaleDenominatorLimit);
          if (a > b && a < this.maxScaleDenominator) this.minScaleDenominator = a, this.updateSliderValues()
        },
        change: function(a) {
          var b = Number(a.getValue()),
              c = Math.round(this.minScaleDenominatorLimit);
          b < c ? a.setValue(c) : b > this.maxScaleDenominator ? a.setValue(this.maxScaleDenominator) : (this.minScaleDenominator = b, this.updateSliderValues())
        },
        scope: this
      }
    });
    this.items = [this.scaleSlider,
    {
      xtype: "panel",
      layout: "form",
      defaults: {
        border: !1
      },
      items: [{
        labelWidth: 90,
        layout: "form",
        width: 150,
        items: [{
          xtype: "checkbox",
          checked: !! this.limitMinScaleDenominator,
          fieldLabel: this.maxScaleLimitText,
          listeners: {
            check: function(a, b) {
              this.limitMinScaleDenominator = b;
              var c = this.scaleSlider;
              c.setValue(1, 100);
              c.thumbs[1].el.setVisible(b);
              this.minScaleDenominatorInput.setDisabled(!b);
              this.updateScaleValues(c);
              c.setDisabled(!this.limitMinScaleDenominator && !this.limitMaxScaleDenominator)
            },
            scope: this
          }
        }]
      }, {
        labelWidth: 10,
        layout: "form",
        items: [this.minScaleDenominatorInput]
      }, {
        labelWidth: 90,
        layout: "form",
        items: [{
          xtype: "checkbox",
          checked: !! this.limitMaxScaleDenominator,
          fieldLabel: this.minScaleLimitText,
          listeners: {
            check: function(a, b) {
              this.limitMaxScaleDenominator = b;
              var c = this.scaleSlider;
              c.setValue(0, 0);
              c.thumbs[0].el.setVisible(b);
              this.maxScaleDenominatorInput.setDisabled(!b);
              this.updateScaleValues(c);
              c.setDisabled(!this.limitMinScaleDenominator && !this.limitMaxScaleDenominator)
            },
            scope: this
          }
        }]
      }, {
        labelWidth: 10,
        layout: "form",
        items: [this.maxScaleDenominatorInput]
      }]
    }];
    this.addEvents("change");
    gxp.ScaleLimitPanel.superclass.initComponent.call(this)
  },
  updateScaleValues: function(a) {
    if (!this.changing) {
      var b = a.getValues(),
          c = !1;
      !this.limitMaxScaleDenominator && 0 < b[0] && (b[0] = 0, c = !0);
      !this.limitMinScaleDenominator && 100 > b[1] && (b[1] = 100, c = !0);
      c ? (a.setValue(0, b[0]), a.setValue(1, b[1])) : (b = this.sliderValuesToScale(b), a = b[0], b = b[1], this.changing = !0, this.minScaleDenominatorInput.setValue(b), this.maxScaleDenominatorInput.setValue(a), this.changing = !1, this.fireEvent("change", this, this.limitMinScaleDenominator ? b : void 0, this.limitMaxScaleDenominator ? a : void 0))
    }
  },
  updateSliderValues: function() {
    if (!this.changing) {
      var a = this.minScaleDenominator,
          b = this.maxScaleDenominator,
          c = this.scaleToSliderValues([b, a]);
      this.changing = !0;
      this.scaleSlider.setValue(0, c[0]);
      this.scaleSlider.setValue(1, c[1]);
      this.changing = !1;
      this.fireEvent("change", this, this.limitMinScaleDenominator ? a : void 0, this.limitMaxScaleDenominator ? b : void 0)
    }
  },
  sliderValuesToScale: function(a) {
    var b = 100 / (this.scaleLevels - 1);
    return [Math.round(Math.pow(this.scaleFactor, (100 - a[0]) / b) * this.minScaleDenominatorLimit), Math.round(Math.pow(this.scaleFactor, (100 - a[1]) / b) * this.minScaleDenominatorLimit)]
  },
  scaleToSliderValues: function(a) {
    var b = 100 / (this.scaleLevels - 1);
    return [100 - b * Math.log(a[0] / this.minScaleDenominatorLimit) / Math.log(this.scaleFactor), 100 - b * Math.log(a[1] / this.minScaleDenominatorLimit) / Math.log(this.scaleFactor)]
  }
});
Ext.reg("gxp_scalelimitpanel", gxp.ScaleLimitPanel);
Ext.namespace("gxp");
gxp.ScaleOverlay = Ext.extend(Ext.Panel, {
  map: null,
  zoomLevelText: "Zoom level",
  initComponent: function() {
    gxp.ScaleOverlay.superclass.initComponent.call(this);
    this.cls = "map-overlay";
    if (this.map) {
      if (this.map instanceof GeoExt.MapPanel) this.map = this.map.map;
      this.bind(this.map)
    }
    this.on("beforedestroy", this.unbind, this)
  },
  addToMapPanel: function(a) {
    this.on({
      afterrender: function() {
        this.bind(a.map)
      },
      scope: this
    })
  },
  stopMouseEvents: function(a) {
    a.stopEvent()
  },
  removeFromMapPanel: function() {
    var a = this.getEl();
    a.un("mousedown", this.stopMouseEvents, this);
    a.un("click", this.stopMouseEvents, this);
    this.unbind()
  },
  addScaleLine: function() {
    var a = new Ext.BoxComponent({
      autoEl: {
        tag: "div",
        cls: "olControlScaleLine overlay-element overlay-scaleline"
      }
    });
    this.on("afterlayout", function() {
      a.getEl().dom.style.position = "relative";
      a.getEl().dom.style.display = "inline";
      this.getEl().on("click", this.stopMouseEvents, this);
      this.getEl().on("mousedown", this.stopMouseEvents, this)
    }, this);
    a.on("render", function() {
      var b = new OpenLayers.Control.ScaleLine({
        geodesic: !0,
        div: a.getEl().dom
      });
      this.map.addControl(b);
      b.activate()
    }, this);
    this.add(a)
  },
  handleZoomEnd: function() {
    var a = this.zoomStore.queryBy(function(a) {
      return this.map.getZoom() == a.data.level
    }, this);
    0 < a.length ? (a = a.items[0], this.zoomSelector.setValue("1 : " + parseInt(a.data.scale, 10))) : this.zoomSelector.rendered && this.zoomSelector.clearValue()
  },
  addScaleCombo: function() {
    this.zoomStore = new GeoExt.data.ScaleStore({
      map: this.map
    });
    this.zoomSelector = new Ext.form.ComboBox({
      emptyText: this.zoomLevelText,
      tpl: '<tpl for="."><div class="x-combo-list-item">1 : {[parseInt(values.scale)]}</div></tpl>',
      editable: !1,
      triggerAction: "all",
      mode: "local",
      store: this.zoomStore,
      width: 110
    });
    this.zoomSelector.on({
      click: this.stopMouseEvents,
      mousedown: this.stopMouseEvents,
      select: function(a, b) {
        this.map.zoomTo(b.data.level)
      },
      scope: this
    });
    this.map.events.register("zoomend", this, this.handleZoomEnd);
    this.add(new Ext.Panel({
      items: [this.zoomSelector],
      cls: "overlay-element overlay-scalechooser",
      border: !1
    }))
  },
  bind: function(a) {
    this.map = a;
    this.addScaleLine();
    this.addScaleCombo();
    this.doLayout()
  },
  unbind: function() {
    this.map && this.map.events && this.map.events.unregister("zoomend", this, this.handleZoomEnd);
    this.zoomSelector = this.zoomStore = null
  }
});
Ext.reg("gxp_scaleoverlay", gxp.ScaleOverlay);
Ext.namespace("gxp.slider");
gxp.slider.ClassBreakSlider = Ext.extend(Ext.slider.MultiSlider, {
  store: null,
  initComponent: function() {
    this.store = Ext.StoreMgr.lookup(this.store);
    if (!("constrainThumbs" in this.initialConfig)) this.constrainThumbs = this.store.reader.raw instanceof OpenLayers.Style;
    this.values = this.storeToValues();
    this.on("changecomplete", this.valuesToStore);
    this.store.on("update", this.storeToValues, this);
    gxp.slider.ClassBreakSlider.superclass.initComponent.call(this)
  },
  storeToValues: function() {
    var a = [];
    this.store.each(function(b) {
      var d =
      b.get("filter");
      d instanceof OpenLayers.Filter ? d.type === OpenLayers.Filter.Comparison.BETWEEN ? (0 === this.store.indexOf(b) && a.push(d.lowerBoundary), a.push(d.upperBoundary)) : d.type === OpenLayers.Filter.Comparison.LESS_THAN && a.push(d.value) : a.push(d)
    }, this);
    if (this.thumbs) for (var b = a.length - 1; 0 <= b; --b) this.setValue(b, a[b]);
    return a
  },
  valuesToStore: function() {
    var a = this.getValues(),
        b = this.store;
    b.un("update", this.storeToValues, this);
    b.each(function(b) {
      var d = b.get("filter"),
          e = a.shift();
      if (d instanceof OpenLayers.Filter) {
        d =
        d.clone();
        if (d.type === OpenLayers.Filter.Comparison.BETWEEN) d.upperBoundary = e;
        else if (d.type === OpenLayers.Filter.Comparison.LESS_THAN) d.value = e;
        b.get("filter").toString() !== d.toString() && b.set("filter", d)
      } else d != e && b.set("filter", e)
    }, this);
    b.on("update", this.storeToValues, this)
  }
});
Ext.reg("gxp_classbreakslider", gxp.slider.ClassBreakSlider);
Ext.namespace("gxp");
gxp.StrokeSymbolizer = Ext.extend(Ext.FormPanel, {
  solidStrokeName: "Solid",
  dashStrokeName: "Dash",
  dotStrokeName: "Dot",
  titleText: "Stroke",
  styleText: "Style",
  colorText: "Color",
  widthText: "Width (pixels)",
  opacityText: "Opacity",
  symbolizer: null,
  colorManager: null,
  checkboxToggle: !0,
  defaultColor: null,
  dashStyles: null,
  border: !1,
  initComponent: function() {
    this.dashStyles = this.dashStyles || [
      ["solid", this.solidStrokeName],
      ["4 4", this.dashStrokeName],
      ["2 4", this.dotStrokeName]
    ];
    if (!this.symbolizer) this.symbolizer = {};
    var a;
    this.colorManager && (a = [new this.colorManager]);
    this.items = [{
      xtype: "fieldset",
      title: this.titleText,
      autoHeight: !0,
      checkboxToggle: this.checkboxToggle,
      collapsed: !0 === this.checkboxToggle && !1 === this.symbolizer.stroke,
      hideMode: "offsets",
      defaults: {
        width: 100
      },
      items: [{
        xtype: "combo",
        name: "style",
        fieldLabel: this.styleText,
        store: new Ext.data.SimpleStore({
          data: this.dashStyles,
          fields: ["value", "display"]
        }),
        displayField: "display",
        valueField: "value",
        value: this.getDashArray(this.symbolizer.strokeDashstyle) || OpenLayers.Renderer.defaultSymbolizerGXP.strokeDashstyle,
        mode: "local",
        allowBlank: !0,
        triggerAction: "all",
        editable: !1,
        listeners: {
          select: function(a, c) {
            this.symbolizer.strokeDashstyle = c.get("value");
            this.fireEvent("change", this.symbolizer)
          },
          scope: this
        }
      }, {
        xtype: "gxp_colorfield",
        name: "color",
        fieldLabel: this.colorText,
        emptyText: OpenLayers.Renderer.defaultSymbolizerGXP.strokeColor,
        value: this.symbolizer.strokeColor,
        defaultBackground: this.defaultColor || OpenLayers.Renderer.defaultSymbolizerGXP.strokeColor,
        plugins: a,
        listeners: {
          valid: function(a) {
            var a = a.getValue(),
                c = this.symbolizer.strokeColor != a;
            this.symbolizer.strokeColor = a;
            c && this.fireEvent("change", this.symbolizer)
          },
          scope: this
        }
      }, {
        xtype: "numberfield",
        name: "width",
        fieldLabel: this.widthText,
        allowNegative: !1,
        emptyText: OpenLayers.Renderer.defaultSymbolizerGXP.strokeWidth,
        value: this.symbolizer.strokeWidth,
        listeners: {
          change: function(a, c) {
            c = parseFloat(c);
            isNaN(c) ? delete this.symbolizer.strokeWidth : this.symbolizer.strokeWidth = c;
            this.fireEvent("change", this.symbolizer)
          },
          scope: this
        }
      }, {
        xtype: "slider",
        name: "opacity",
        fieldLabel: this.opacityText,
        values: [100 * ("strokeOpacity" in this.symbolizer ? this.symbolizer.strokeOpacity : OpenLayers.Renderer.defaultSymbolizerGXP.strokeOpacity)],
        isFormField: !0,
        listeners: {
          changecomplete: function(a, c) {
            this.symbolizer.strokeOpacity = c / 100;
            this.fireEvent("change", this.symbolizer)
          },
          scope: this
        },
        plugins: [new GeoExt.SliderTip({
          getText: function(a) {
            return a.value + "%"
          }
        })]
      }],
      listeners: {
        collapse: function() {
          if (!1 !== this.symbolizer.stroke) this.symbolizer.stroke = !1, this.fireEvent("change", this.symbolizer)
        },
        expand: function() {
          this.symbolizer.stroke = !0;
          this.fireEvent("change", this.symbolizer)
        },
        scope: this
      }
    }];
    this.addEvents("change");
    gxp.StrokeSymbolizer.superclass.initComponent.call(this)
  },
  getDashArray: function(a) {
    var b;
    a && (a = a.split(/\s+/), a = a[0] / a[1], isNaN(a) || (b = 1 <= a ? "4 4" : "2 4"));
    return b
  }
});
Ext.reg("gxp_strokesymbolizer", gxp.StrokeSymbolizer);
Ext.namespace("gxp");
gxp.StylesDialog = Ext.extend(Ext.Container, {
  addStyleText: "Add",
  addStyleTip: "Add a new style",
  chooseStyleText: "Choose style",
  deleteStyleText: "Remove",
  deleteStyleTip: "Delete the selected style",
  editStyleText: "Edit",
  editStyleTip: "Edit the selected style",
  duplicateStyleText: "Duplicate",
  duplicateStyleTip: "Duplicate the selected style",
  addRuleText: "Add",
  addRuleTip: "Add a new rule",
  newRuleText: "New Rule",
  deleteRuleText: "Remove",
  deleteRuleTip: "Delete the selected rule",
  editRuleText: "Edit",
  editRuleTip: "Edit the selected rule",
  duplicateRuleText: "Duplicate",
  duplicateRuleTip: "Duplicate the selected rule",
  cancelText: "Cancel",
  saveText: "Save",
  styleWindowTitle: "User Style: {0}",
  ruleWindowTitle: "Style Rule: {0}",
  stylesFieldsetTitle: "Styles",
  rulesFieldsetTitle: "Rules",
  errorTitle: "Error saving style",
  errorMsg: "There was an error saving the style back to the server.",
  layerRecord: null,
  layerDescription: null,
  symbolType: null,
  stylesStore: null,
  selectedStyle: null,
  selectedRule: null,
  editable: !0,
  modified: !1,
  dialogCls: Ext.Window,
  initComponent: function() {
    this.addEvents("ready", "modified", "styleselected", "beforesaved", "saved");
    Ext.applyIf(this, {
      layout: "form",
      disabled: !0,
      items: [{
        xtype: "fieldset",
        title: this.stylesFieldsetTitle,
        labelWidth: 85,
        style: "margin-bottom: 0;"
      }, {
        xtype: "toolbar",
        style: "border-width: 0 1px 1px 1px; margin-bottom: 10px;",
        items: [{
          xtype: "button",
          iconCls: "add",
          text: this.addStyleText,
          tooltip: this.addStyleTip,
          handler: this.addStyle,
          scope: this
        }, {
          xtype: "button",
          iconCls: "delete",
          text: this.deleteStyleText,
          tooltip: this.deleteStyleTip,
          handler: function() {
            this.stylesStore.remove(this.selectedStyle)
          },
          scope: this
        }, {
          xtype: "button",
          iconCls: "edit",
          text: this.editStyleText,
          tooltip: this.editStyleTip,
          handler: function() {
            this.editStyle()
          },
          scope: this
        }, {
          xtype: "button",
          iconCls: "duplicate",
          text: this.duplicateStyleText,
          tooltip: this.duplicateStyleTip,
          handler: function() {
            var a = this.selectedStyle,
                b = a.get("userStyle").clone();
            b.isDefault = !1;
            b.name = this.newStyleName();
            var c = this.stylesStore;
            c.add(new c.recordType({
              name: b.name,
              title: b.title,
              "abstract": b.description,
              userStyle: b
            }));
            this.editStyle(a)
          },
          scope: this
        }]
      }]
    });
    this.createStylesStore();
    this.on({
      beforesaved: function() {
        this._saving = !0
      },
      saved: function() {
        delete this._saving
      },
      savefailed: function() {
        Ext.Msg.show({
          title: this.errorTitle,
          msg: this.errorMsg,
          icon: Ext.MessageBox.ERROR,
          buttons: {
            ok: !0
          }
        });
        delete this._saving
      },
      render: function() {
        gxp.util.dispatch([this.getStyles], function() {
          this.enable()
        }, this)
      },
      scope: this
    });
    gxp.StylesDialog.superclass.initComponent.apply(this, arguments)
  },
  addStyle: function() {
    if (this._ready) {
      var a = this.selectedStyle,
          b = this.stylesStore,
          c = new OpenLayers.Style(null, {
          name: this.newStyleName(),
          rules: [this.createRule()]
        });
      b.add(new b.recordType({
        name: c.name,
        userStyle: c
      }));
      this.editStyle(a)
    } else this.on("ready", this.addStyle, this)
  },
  editStyle: function(a) {
    var b = this.selectedStyle.get("userStyle"),
        c = new this.dialogCls(Ext.apply({
        bbar: ["->",
        {
          text: this.cancelText,
          iconCls: "cancel",
          handler: function() {
            c.propertiesDialog.userStyle = b;
            c.destroy();
            if (a) this._cancelling = !0, this.stylesStore.remove(this.selectedStyle), this.changeStyle(a, {
              updateCombo: !0,
              markModified: !0
            }), delete this._cancelling
          },
          scope: this
        }, {
          text: this.saveText,
          iconCls: "save",
          handler: function() {
            c.destroy()
          }
        }]
      }, {
        title: String.format(this.styleWindowTitle, b.title || b.name),
        shortTitle: b.title || b.name,
        bodyBorder: !1,
        autoHeight: !0,
        width: 300,
        modal: !0,
        items: {
          border: !1,
          items: {
            xtype: "gxp_stylepropertiesdialog",
            ref: "../propertiesDialog",
            userStyle: b.clone(),
            nameEditable: !1,
            style: "padding: 10px;"
          }
        },
        listeners: {
          beforedestroy: function() {
            this.selectedStyle.set("userStyle", c.propertiesDialog.userStyle)
          },
          scope: this
        }
      }));
    this.showDlg(c)
  },
  createSLD: function(a) {
    var a =
    a || {},
        b = {
        version: "1.0.0",
        namedLayers: {}
        },
        c = this.layerRecord.get("name");
    b.namedLayers[c] = {
      name: c,
      userStyles: []
    };
    this.stylesStore.each(function(d) {
      (!a.userStyles || -1 !== a.userStyles.indexOf(d.get("name"))) && b.namedLayers[c].userStyles.push(d.get("userStyle"))
    });
    return (new OpenLayers.Format.SLD({
      multipleSymbolizers: !0,
      profile: "GeoServer"
    })).write(b)
  },
  saveStyles: function(a) {
    !0 === this.modified && this.fireEvent("beforesaved", this, a)
  },
  updateStyleRemoveButton: function() {
    var a = this.selectedStyle && this.selectedStyle.get("userStyle");
    this.items.get(1).items.get(1).setDisabled(!a || 1 >= this.stylesStore.getCount() || !0 === a.isDefault)
  },
  updateRuleRemoveButton: function() {
    this.items.get(3).items.get(1).setDisabled(!this.selectedRule || 2 > this.items.get(2).items.get(0).rules.length)
  },
  createRule: function() {
    return new OpenLayers.Rule({
      symbolizers: [new OpenLayers.Symbolizer[this.symbolType]]
    })
  },
  addRulesFieldSet: function() {
    var a = new Ext.form.FieldSet({
      itemId: "rulesfieldset",
      title: this.rulesFieldsetTitle,
      autoScroll: !0,
      style: "margin-bottom: 0;",
      hideMode: "offsets",
      hidden: !0
    }),
        b = new Ext.Toolbar({
        style: "border-width: 0 1px 1px 1px;",
        hidden: !0,
        items: [{
          xtype: "button",
          iconCls: "add",
          text: this.addRuleText,
          tooltip: this.addRuleTip,
          handler: this.addRule,
          scope: this
        }, {
          xtype: "button",
          iconCls: "delete",
          text: this.deleteRuleText,
          tooltip: this.deleteRuleTip,
          handler: this.removeRule,
          scope: this,
          disabled: !0
        }, {
          xtype: "button",
          iconCls: "edit",
          text: this.editRuleText,
          toolitp: this.editRuleTip,
          handler: function() {
            this.layerDescription ? this.editRule() : this.describeLayer(this.editRule)
          },
          scope: this,
          disabled: !0
        }, {
          xtype: "button",
          iconCls: "duplicate",
          text: this.duplicateRuleText,
          tip: this.duplicateRuleTip,
          handler: this.duplicateRule,
          scope: this,
          disabled: !0
        }]
      });
    this.add(a, b);
    this.doLayout();
    return a
  },
  addRule: function() {
    var a = this.items.get(2).items.get(0);
    this.selectedStyle.get("userStyle").rules.push(this.createRule());
    a.update();
    this.selectedStyle.store.afterEdit(this.selectedStyle);
    this.updateRuleRemoveButton()
  },
  removeRule: function() {
    var a = this.selectedRule;
    this.items.get(2).items.get(0).unselect();
    this.selectedStyle.get("userStyle").rules.remove(a);
    this.afterRuleChange()
  },
  duplicateRule: function() {
    var a = this.items.get(2).items.get(0),
        b = this.selectedRule.clone();
    this.selectedStyle.get("userStyle").rules.push(b);
    a.update();
    this.selectedStyle.store.afterEdit(this.selectedStyle);
    this.updateRuleRemoveButton()
  },
  editRule: function() {
    var a = this.selectedRule,
        b = a.clone(),
        c = new this.dialogCls({
        title: String.format(this.ruleWindowTitle, a.title || a.name || this.newRuleText),
        shortTitle: a.title || a.name || this.newRuleText,
        layout: "fit",
        width: 320,
        height: 450,
        modal: !0,
        items: [{
          xtype: "gxp_rulepanel",
          ref: "rulePanel",
          symbolType: this.symbolType,
          rule: a,
          attributes: new GeoExt.data.AttributeStore({
            url: this.layerDescription.owsURL,
            baseParams: {
              SERVICE: this.layerDescription.owsType,
              REQUEST: "DescribeFeatureType",
              TYPENAME: this.layerDescription.typeName
            },
            method: "GET",
            disableCaching: !1
          }),
          autoScroll: !0,
          border: !1,
          defaults: {
            autoHeight: !0,
            hideMode: "offsets"
          },
          listeners: {
            change: this.saveRule,
            tabchange: function() {
              c instanceof Ext.Window && c.syncShadow()
            },
            scope: this
          }
        }],
        bbar: ["->",
        {
          text: this.cancelText,
          iconCls: "cancel",
          handler: function() {
            this.saveRule(c.rulePanel, b);
            c.destroy()
          },
          scope: this
        }, {
          text: this.saveText,
          iconCls: "save",
          handler: function() {
            c.destroy()
          }
        }]
      });
    this.showDlg(c)
  },
  saveRule: function(a, b) {
    var c = this.selectedStyle;
    this.items.get(2).items.get(0);
    var c = c.get("userStyle"),
        d = c.rules.indexOf(this.selectedRule);
    c.rules[d] = b;
    this.afterRuleChange(b)
  },
  afterRuleChange: function(a) {
    this.items.get(2).items.get(0);
    this.selectedRule = a;
    this.selectedStyle.store.afterEdit(this.selectedStyle)
  },
  setRulesFieldSetVisible: function(a) {
    this.items.get(3).setVisible(a && this.editable);
    this.items.get(2).setVisible(a);
    this.doLayout()
  },
  parseSLD: function(a) {
    var b = a.responseXML;
    if (!b || !b.documentElement) b = (new OpenLayers.Format.XML).read(a.responseText);
    var a = this.layerRecord.getLayer().params,
        c = this.initialConfig.styleName || a.STYLES;
    if (c) this.selectedStyle = this.stylesStore.getAt(this.stylesStore.findExact("name", c));
    var d = new OpenLayers.Format.SLD({
      profile: "GeoServer",
      multipleSymbolizers: !0
    });
    try {
      var e =
      d.read(b).namedLayers[a.LAYERS].userStyles,
          f;
      if (a.SLD_BODY) f = d.read(a.SLD_BODY).namedLayers[a.LAYERS].userStyles, Array.prototype.push.apply(e, f);
      this.stylesStore.removeAll();
      this.selectedStyle = null;
      for (var g, h, j, k, b = 0, l = e.length; b < l; ++b) {
        g = e[b];
        j = this.stylesStore.findExact("name", g.name); - 1 !== j && this.stylesStore.removeAt(j);
        h = new this.stylesStore.recordType({
          name: g.name,
          title: g.title,
          "abstract": g.description,
          userStyle: g
        });
        h.phantom = !1;
        this.stylesStore.add(h);
        if (!this.selectedStyle && (c === g.name || !c && !0 === g.isDefault)) this.selectedStyle = h;
        !0 === g.isDefault && (k = h)
      }
      if (!this.selectedStyle) this.selectedStyle = k;
      this.addRulesFieldSet();
      this.createLegend(this.selectedStyle.get("userStyle").rules);
      this.stylesStoreReady();
      a.SLD_BODY && this.markModified()
    } catch (n) {
      window.console && console.warn(n.msg), this.setupNonEditable()
    }
  },
  createLegend: function(a) {
    var b = OpenLayers.Symbolizer.Raster;
    if (b && a[0] && a[0].symbolizers[0] instanceof b) throw Error("Raster symbolizers are not supported.");
    this.addVectorLegend(a)
  },
  setupNonEditable: function() {
    this.editable = !1;
    this.items.get(1).hide();
    (this.getComponent("rulesfieldset") || this.addRulesFieldSet()).add(this.createLegendImage());
    this.doLayout();
    this.items.get(3).hide();
    this.stylesStoreReady()
  },
  stylesStoreReady: function() {
    this.stylesStore.commitChanges();
    this.stylesStore.on({
      load: function() {
        this.addStylesCombo();
        this.updateStyleRemoveButton()
      },
      add: function(a, b, c) {
        this.updateStyleRemoveButton();
        b = this.items.get(0).items.get(0);
        this.markModified();
        b.fireEvent("select", b, a.getAt(c), c);
        b.setValue(this.selectedStyle.get("name"))
      },
      remove: function(a, b, c) {
        if (!this._cancelling) this._removing = !0, b = Math.min(c, a.getCount() - 1), this.updateStyleRemoveButton(), c = this.items.get(0).items.get(0), this.markModified(), c.fireEvent("select", c, a.getAt(b), b), c.setValue(this.selectedStyle.get("name")), delete this._removing
      },
      update: function(a, b) {
        var c = b.get("userStyle");
        Ext.apply(b.data, {
          name: c.name,
          title: c.title || c.name,
          "abstract": c.description
        });
        this.changeStyle(b, {
          updateCombo: !0,
          markModified: !0
        })
      },
      scope: this
    });
    this.stylesStore.fireEvent("load", this.stylesStore, this.stylesStore.getRange());
    this._ready = !0;
    this.fireEvent("ready")
  },
  markModified: function() {
    if (!1 === this.modified) this.modified = !0;
    this._saving || this.fireEvent("modified", this, this.selectedStyle.get("name"))
  },
  createStylesStore: function() {
    var a = this.layerRecord.get("styles") || [];
    this.stylesStore = new Ext.data.JsonStore({
      data: {
        styles: a
      },
      idProperty: "name",
      root: "styles",
      fields: ["name", "title", "abstract", "legend", "userStyle"],
      listeners: {
        add: function(a, c) {
          for (var d, e = c.length - 1; 0 <= e; --e) d = c[e], a.suspendEvents(), d.get("title") || d.set("title", d.get("name")), a.resumeEvents()
        }
      }
    })
  },
  getStyles: function(a) {
    var b = this.layerRecord.getLayer();
    if (!0 === this.editable) {
      var c = b.params.VERSION;
      1.1 < parseFloat(c) && (c = "1.1.1");
      Ext.Ajax.request({
        url: b.url,
        params: {
          SERVICE: "WMS",
          VERSION: c,
          REQUEST: "GetStyles",
          LAYERS: "" + b.params.LAYERS
        },
        method: "GET",
        disableCaching: !1,
        success: this.parseSLD,
        failure: this.setupNonEditable,
        callback: a,
        scope: this
      })
    } else this.setupNonEditable()
  },
  describeLayer: function() {},
  addStylesCombo: function() {
    var a = this.stylesStore,
        a = new Ext.form.ComboBox(Ext.apply({
        fieldLabel: this.chooseStyleText,
        store: a,
        editable: !1,
        displayField: "title",
        valueField: "name",
        value: this.selectedStyle ? this.selectedStyle.get("title") : this.layerRecord.getLayer().params.STYLES || "default",
        disabled: !a.getCount(),
        mode: "local",
        typeAhead: !0,
        triggerAction: "all",
        forceSelection: !0,
        anchor: "100%",
        listeners: {
          select: function(a, c) {
            this.changeStyle(c);
            !c.phantom && !this._removing && this.fireEvent("styleselected", this, c.get("name"))
          },
          scope: this
        }
      }, this.initialConfig.stylesComboOptions));
    this.items.get(0).add(a);
    this.doLayout()
  },
  createLegendImage: function() {
    var a = new GeoExt.WMSLegend({
      showTitle: !1,
      layerRecord: this.layerRecord,
      autoScroll: !0,
      defaults: {
        listeners: {
          render: function(b) {
            b.getEl().on({
              load: function(c, d) {
                d.getAttribute("src") != b.defaultImgSrc && (this.setRulesFieldSetVisible(!0), 250 < b.getEl().getHeight() && a.setHeight(250))
              },
              error: function() {
                this.setRulesFieldSetVisible(!1)
              },
              scope: this
            })
          },
          scope: this
        }
      }
    });
    return a
  },
  changeStyle: function(a, b) {
    var b = b || {},
        c = this.items.get(2).items.get(0);
    this.selectedStyle = a;
    this.updateStyleRemoveButton();
    a.get("name");
    if (!0 === this.editable) {
      var d = a.get("userStyle"),
          e = c.rules.indexOf(this.selectedRule);
      c.ownerCt.remove(c);
      this.createLegend(d.rules, {
        selectedRuleIndex: e
      })
    }!0 === b.updateCombo && (this.items.get(0).items.get(0).setValue(d.name), !0 === b.markModified && this.markModified())
  },
  addVectorLegend: function(a, b) {
    b = Ext.applyIf(b || {}, {
      enableDD: !0
    });
    this.symbolType = b.symbolType;
    if (!this.symbolType) {
      for (var c = ["Point", "Line", "Polygon"], d = 0, e = a[0].symbolizers, f, g = e.length - 1; 0 <= g; g--) f = e[g].CLASS_NAME.split(".").pop(), d = Math.max(d, c.indexOf(f));
      this.symbolType = c[d]
    }
    var h = this.items.get(2).add({
      xtype: "gx_vectorlegend",
      showTitle: !1,
      height: 10 < a.length ? 250 : void 0,
      autoScroll: 10 < a.length,
      rules: a,
      symbolType: this.symbolType,
      selectOnClick: !0,
      enableDD: b.enableDD,
      listeners: {
        ruleselected: function(a, b) {
          this.onRuleSelected(a, b)
        },
        ruleunselected: function(a, b) {
          this.onRuleUnselected(a, b)
        },
        rulemoved: function() {
          this.markModified()
        },
        afterlayout: function() {
          null !== this.selectedRule && null === h.selectedRule && -1 !== h.rules.indexOf(this.selectedRule) && h.selectRuleEntry(this.selectedRule)
        },
        scope: this
      }
    });
    this.setRulesFieldSetVisible(!0);
    return h
  },
  newStyleName: function() {
    var a = this.layerRecord.get("name");
    return a.split(":").pop() + "_" + gxp.util.md5(a + new Date + Math.random()).substr(0, 8)
  },
  onRuleSelected: function(a, b) {
    this.selectedRule = b;
    var c = this.items.get(3).items;
    this.updateRuleRemoveButton();
    c.get(2).enable();
    c.get(3).enable()
  },
  onRuleUnselected: function() {
    this.selectedRule =
    null;
    var a = this.items.get(3).items;
    a.get(1).disable();
    a.get(2).disable();
    a.get(3).disable()
  },
  showDlg: function(a) {
    a.show()
  }
});
gxp.StylesDialog.createGeoServerStylerConfig = function(a, b) {
  var c = a.getLayer();
  b || (b = a.get("restUrl"));
  b || (b = c.url.split("?").shift().replace(/\/(wms|ows)\/?$/, "/rest"));
  return {
    xtype: "gxp_stylesdialog",
    layerRecord: a,
    plugins: [{
      ptype: "gxp_geoserverstylewriter",
      baseUrl: b
    }],
    listeners: {
      styleselected: function(a, b) {
        c.mergeNewParams({
          styles: b
        })
      },
      modified: function(a) {
        a.saveStyles()
      },
      saved: function(a, b) {
        c.mergeNewParams({
          _olSalt: Math.random(),
          styles: b
        })
      },
      scope: this
    }
  }
};
OpenLayers.Renderer.defaultSymbolizerGXP = {
  fillColor: "#808080",
  fillOpacity: 1,
  strokeColor: "#000000",
  strokeOpacity: 1,
  strokeWidth: 1,
  strokeDashstyle: "solid",
  pointRadius: 3,
  graphicName: "square",
  fontColor: "#000000",
  fontSize: 10,
  haloColor: "#FFFFFF",
  haloOpacity: 1,
  haloRadius: 1,
  labelAlign: "cm"
};
Ext.reg("gxp_stylesdialog", gxp.StylesDialog);
Ext.namespace("gxp");
gxp.TextSymbolizer = Ext.extend(Ext.Panel, {
  fonts: void 0,
  symbolizer: null,
  defaultSymbolizer: null,
  attributes: null,
  colorManager: null,
  haloCache: null,
  border: !1,
  layout: "form",
  labelValuesText: "Label values",
  haloText: "Halo",
  sizeText: "Size",
  priorityText: "Priority",
  labelOptionsText: "Label options",
  autoWrapText: "Auto wrap",
  followLineText: "Follow line",
  maxDisplacementText: "Maximum displacement",
  repeatText: "Repeat",
  forceLeftToRightText: "Force left to right",
  groupText: "Grouping",
  spaceAroundText: "Space around",
  labelAllGroupText: "Label all segments in line group",
  maxAngleDeltaText: "Maximum angle delta",
  conflictResolutionText: "Conflict resolution",
  goodnessOfFitText: "Goodness of fit",
  polygonAlignText: "Polygon alignment",
  graphicResizeText: "Graphic resize",
  graphicMarginText: "Graphic margin",
  graphicTitle: "Graphic",
  fontColorTitle: "Font color and opacity",
  positioningText: "Label positioning",
  anchorPointText: "Anchor point",
  displacementXText: "Displacement (X-direction)",
  displacementYText: "Displacement (Y-direction)",
  perpendicularOffsetText: "Perpendicular offset",
  priorityHelp: "The higher the value of the specified field, the sooner the label will be drawn (which makes it win in the conflict resolution game)",
  autoWrapHelp: "Wrap labels that exceed a certain length in pixels",
  followLineHelp: "Should the label follow the geometry of the line?",
  maxDisplacementHelp: "Maximum displacement in pixels if label position is busy",
  repeatHelp: "Repeat labels after a certain number of pixels",
  forceLeftToRightHelp: "Labels are usually flipped to make them readable. If the character happens to be a directional arrow then this is not desirable",
  groupHelp: "Grouping works by collecting all features with the same label text, then choosing a representative geometry for the group. Road data is a classic example to show why grouping is useful. It is usually desirable to display only a single label for all of 'Main Street', not a label for every block of 'Main Street.'",
  spaceAroundHelp: "Overlapping and Separating Labels. By default GeoServer will not render labels 'on top of each other'. By using the spaceAround option you can either allow labels to overlap, or add extra space around labels. The value supplied for the option is a positive or negative size in pixels. Using the default value of 0, the bounding box of a label cannot overlap the bounding box of another label.",
  labelAllGroupHelp: "The labelAllGroup option makes sure that all of the segments in a line group are labeled instead of just the longest one.",
  conflictResolutionHelp: "By default labels are subjected to conflict resolution, meaning the renderer will not allow any label to overlap with a label that has been drawn already. Setting this parameter to false pull the label out of the conflict resolution game, meaning the label will be drawn even if it overlaps with other labels, and other labels drawn after it won\u2019t mind overlapping with it.",
  goodnessOfFitHelp: "Geoserver will remove labels if they are a particularly bad fit for the geometry they are labeling. For Polygons: the label is sampled approximately at every letter. The distance from these points to the polygon is determined and each sample votes based on how close it is to the polygon. The default value is 0.5.",
  graphic_resizeHelp: "Specifies a mode for resizing label graphics (such as highway shields) to fit the text of the label. The default mode, \u2018none\u2019, never modifies the label graphic. In stretch mode, GeoServer will resize the graphic to exactly surround the label text, possibly modifying the image\u2019s aspect ratio. In proportional mode, GeoServer will expand the image to be large enough to surround the text while preserving its original aspect ratio.",
  maxAngleDeltaHelp: "Designed to use used in conjuection with followLine, the maxAngleDelta option sets the maximum angle, in degrees, between two subsequent characters in a curved label. Large angles create either visually disconnected words or overlapping characters. It is advised not to use angles larger than 30.",
  polygonAlignHelp: "GeoServer normally tries to place horizontal labels within a polygon, and give up in case the label position is busy or if the label does not fit enough in the polygon. This options allows GeoServer to try alternate rotations for the labels. Possible options: the default value, only the rotation manually specified in the <Rotation> tag will be used (manual), If the label does not fit horizontally and the polygon is taller than wider the vertical alignement will also be tried (ortho), If the label does not fit horizontally the minimum bounding rectangle will be computed and a label aligned to it will be tried out as well (mbr).",
  graphic_marginHelp: "Similar to the margin shorthand property in CSS for HTML, its interpretation varies depending on how many margin values are provided: 1 = use that margin length on all sides of the label 2 = use the first for top & bottom margins and the second for left & right margins. 3 = use the first for the top margin, second for left & right margins, third for the bottom margin. 4 = use the first for the top margin, second for the right margin, third for the bottom margin, and fourth for the left margin.",
  initComponent: function() {
    if (!this.symbolizer) this.symbolizer = {};
    Ext.applyIf(this.symbolizer, this.defaultSymbolizer);
    if (!this.symbolizer.vendorOptions) this.symbolizer.vendorOptions = {};
    this.haloCache = {};
    this.attributes.on("load", this.showHideGeometryOptions, this);
    this.attributes.load();
    var a = {
      xtype: "combo",
      fieldLabel: this.labelValuesText,
      store: this.attributes,
      mode: "local",
      lastQuery: "",
      editable: !1,
      triggerAction: "all",
      allowBlank: !1,
      displayField: "name",
      valueField: "name",
      value: this.symbolizer.label && this.symbolizer.label.replace(/^\${(.*)}$/, "$1"),
      listeners: {
        select: function(a, c) {
          this.symbolizer.label = "${" + c.get("name") + "}";
          this.fireEvent("change", this.symbolizer)
        },
        scope: this
      },
      width: 120
    };
    this.attributesComboConfig = this.attributesComboConfig || {};
    Ext.applyIf(this.attributesComboConfig, a);
    this.labelWidth = 80;
    this.items = [this.attributesComboConfig,
    {
      cls: "x-html-editor-tb",
      style: "background: transparent; border: none; padding: 0 0em 0.5em;",
      xtype: "toolbar",
      items: [{
        xtype: "gxp_fontcombo",
        fonts: this.fonts || void 0,
        width: 110,
        value: this.symbolizer.fontFamily,
        listeners: {
          select: function(a, c) {
            this.symbolizer.fontFamily = c.get("field1");
            this.fireEvent("change", this.symbolizer)
          },
          scope: this
        }
      }, {
        xtype: "tbtext",
        text: this.sizeText + ": "
      }, {
        xtype: "numberfield",
        allowNegative: !1,
        emptyText: OpenLayers.Renderer.defaultSymbolizerGXP.fontSize,
        value: this.symbolizer.fontSize,
        width: 30,
        listeners: {
          change: function(a, c) {
            c = parseFloat(c);
            isNaN(c) ? delete this.symbolizer.fontSize : this.symbolizer.fontSize = c;
            this.fireEvent("change", this.symbolizer)
          },
          scope: this
        }
      }, {
        enableToggle: !0,
        cls: "x-btn-icon",
        iconCls: "x-edit-bold",
        pressed: "bold" === this.symbolizer.fontWeight,
        listeners: {
          toggle: function(a, c) {
            this.symbolizer.fontWeight = c ? "bold" : "normal";
            this.fireEvent("change", this.symbolizer)
          },
          scope: this
        }
      }, {
        enableToggle: !0,
        cls: "x-btn-icon",
        iconCls: "x-edit-italic",
        pressed: "italic" === this.symbolizer.fontStyle,
        listeners: {
          toggle: function(a, c) {
            this.symbolizer.fontStyle = c ? "italic" : "normal";
            this.fireEvent("change", this.symbolizer)
          },
          scope: this
        }
      }]
    }, {
      xtype: "gxp_fillsymbolizer",
      fillText: this.fontColorTitle,
      symbolizer: this.symbolizer,
      colorProperty: "fontColor",
      opacityProperty: "fontOpacity",
      checkboxToggle: !1,
      autoHeight: !0,
      width: 213,
      labelWidth: 70,
      plugins: this.colorManager && [new this.colorManager],
      listeners: {
        change: function() {
          this.fireEvent("change", this.symbolizer)
        },
        scope: this
      }
    }, {
      xtype: "fieldset",
      title: this.graphicTitle,
      checkboxToggle: !0,
      hideMode: "offsets",
      collapsed: !(this.symbolizer.fillColor || this.symbolizer.fillOpacity || this.symbolizer.vendorOptions["graphic-resize"] || this.symbolizer.vendorOptions["graphic-margin"]),
      labelWidth: 70,
      items: [{
        xtype: "gxp_pointsymbolizer",
        symbolizer: this.symbolizer,
        listeners: {
          change: function(a) {
            a.graphic = !! a.graphicName || !! a.externalGraphic;
            this.fireEvent("change", this.symbolizer)
          },
          scope: this
        },
        border: !1,
        labelWidth: 70
      },
      this.createVendorSpecificField({
        name: "graphic-resize",
        xtype: "combo",
        store: ["none", "stretch", "proportional"],
        mode: "local",
        listeners: {
          select: function(a) {
            "none" === a.getValue() ? this.graphicMargin.hide() : (Ext.isEmpty(this.graphicMargin.getValue()) && (this.graphicMargin.setValue(0), this.symbolizer.vendorOptions["graphic-margin"] =
            0), this.graphicMargin.show())
          },
          scope: this
        },
        width: 100,
        triggerAction: "all",
        fieldLabel: this.graphicResizeText
      }), this.createVendorSpecificField({
        name: "graphic-margin",
        ref: "../graphicMargin",
        hidden: "stretch" !== this.symbolizer.vendorOptions["graphic-resize"] && "proportional" !== this.symbolizer.vendorOptions["graphic-resize"],
        width: 100,
        fieldLabel: this.graphicMarginText,
        xtype: "textfield"
      })],
      listeners: {
        collapse: function() {
          this.graphicCache = {
            externalGraphic: this.symbolizer.externalGraphic,
            fillColor: this.symbolizer.fillColor,
            fillOpacity: this.symbolizer.fillOpacity,
            graphicName: this.symbolizer.graphicName,
            pointRadius: this.symbolizer.pointRadius,
            rotation: this.symbolizer.rotation,
            strokeColor: this.symbolizer.strokeColor,
            strokeWidth: this.symbolizer.strokeWidth,
            strokeDashStyle: this.symbolizer.strokeDashStyle
          };
          delete this.symbolizer.externalGraphic;
          delete this.symbolizer.fillColor;
          delete this.symbolizer.fillOpacity;
          delete this.symbolizer.graphicName;
          delete this.symbolizer.pointRadius;
          delete this.symbolizer.rotation;
          delete this.symbolizer.strokeColor;
          delete this.symbolizer.strokeWidth;
          delete this.symbolizer.strokeDashStyle;
          this.fireEvent("change", this.symbolizer)
        },
        expand: function() {
          Ext.apply(this.symbolizer, this.graphicCache);
          this.doLayout();
          this.fireEvent("change", this.symbolizer)
        },
        scope: this
      }
    }, {
      xtype: "fieldset",
      title: this.haloText,
      checkboxToggle: !0,
      collapsed: !(this.symbolizer.haloRadius || this.symbolizer.haloColor || this.symbolizer.haloOpacity),
      autoHeight: !0,
      labelWidth: 50,
      items: [{
        xtype: "numberfield",
        fieldLabel: this.sizeText,
        anchor: "89%",
        allowNegative: !1,
        emptyText: OpenLayers.Renderer.defaultSymbolizerGXP.haloRadius,
        value: this.symbolizer.haloRadius,
        listeners: {
          change: function(a, c) {
            c = parseFloat(c);
            isNaN(c) ? delete this.symbolizer.haloRadius : this.symbolizer.haloRadius = c;
            this.fireEvent("change", this.symbolizer)
          },
          scope: this
        }
      }, {
        xtype: "gxp_fillsymbolizer",
        symbolizer: {
          fillColor: "haloColor" in this.symbolizer ? this.symbolizer.haloColor : OpenLayers.Renderer.defaultSymbolizerGXP.haloColor,
          fillOpacity: "haloOpacity" in this.symbolizer ? this.symbolizer.haloOpacity : 100 * OpenLayers.Renderer.defaultSymbolizerGXP.haloOpacity
        },
        defaultColor: OpenLayers.Renderer.defaultSymbolizerGXP.haloColor,
        checkboxToggle: !1,
        width: 190,
        labelWidth: 60,
        plugins: this.colorManager && [new this.colorManager],
        listeners: {
          change: function(a) {
            this.symbolizer.haloColor = a.fillColor;
            this.symbolizer.haloOpacity = a.fillOpacity;
            this.fireEvent("change", this.symbolizer)
          },
          scope: this
        }
      }],
      listeners: {
        collapse: function() {
          this.haloCache = {
            haloRadius: this.symbolizer.haloRadius,
            haloColor: this.symbolizer.haloColor,
            haloOpacity: this.symbolizer.haloOpacity
          };
          delete this.symbolizer.haloRadius;
          delete this.symbolizer.haloColor;
          delete this.symbolizer.haloOpacity;
          this.fireEvent("change", this.symbolizer)
        },
        expand: function() {
          Ext.apply(this.symbolizer, this.haloCache);
          this.doLayout();
          this.fireEvent("change", this.symbolizer)
        },
        scope: this
      }
    }, {
      xtype: "fieldset",
      collapsed: !(this.symbolizer.labelAlign || this.symbolizer.vendorOptions.polygonAlign || this.symbolizer.labelXOffset || this.symbolizer.labelYOffset || this.symbolizer.labelPerpendicularOffset),
      title: this.positioningText,
      checkboxToggle: !0,
      autoHeight: !0,
      labelWidth: 75,
      defaults: {
        width: 100
      },
      items: [this.createField(Ext.applyIf({
        fieldLabel: this.anchorPointText,
        geometryTypes: ["POINT"],
        value: this.symbolizer.labelAlign || "lb",
        store: [
          ["lt", "Left-top"],
          ["ct", "Center-top"],
          ["rt", "Right-top"],
          ["lm", "Left-center"],
          ["cm", "Center"],
          ["rm", "Right-center"],
          ["lb", "Left-bottom"],
          ["cb", "Center-bottom"],
          ["rb", "Right-bottom"]
        ],
        listeners: {
          select: function(a) {
            this.symbolizer.labelAlign = a.getValue();
            delete this.symbolizer.labelAnchorPointX;
            delete this.symbolizer.labelAnchorPointY;
            this.fireEvent("change", this.symbolizer)
          },
          scope: this
        }
      }, this.attributesComboConfig)), this.createField({
        xtype: "numberfield",
        geometryTypes: ["POINT"],
        fieldLabel: this.displacementXText,
        value: this.symbolizer.labelXOffset,
        listeners: {
          change: function(a, c) {
            this.symbolizer.labelXOffset = c;
            this.fireEvent("change", this.symbolizer)
          },
          scope: this
        }
      }), this.createField({
        xtype: "numberfield",
        geometryTypes: ["POINT"],
        fieldLabel: this.displacementYText,
        value: this.symbolizer.labelYOffset,
        listeners: {
          change: function(a, c) {
            this.symbolizer.labelYOffset =
            c;
            this.fireEvent("change", this.symbolizer)
          },
          scope: this
        }
      }), this.createField({
        xtype: "numberfield",
        geometryTypes: ["LINE"],
        fieldLabel: this.perpendicularOffsetText,
        value: this.symbolizer.labelPerpendicularOffset,
        listeners: {
          change: function(a, c) {
            Ext.isEmpty(c) ? delete this.symbolizer.labelPerpendicularOffset : this.symbolizer.labelPerpendicularOffset = c;
            this.fireEvent("change", this.symbolizer)
          },
          scope: this
        }
      }), this.createVendorSpecificField({
        name: "polygonAlign",
        geometryTypes: ["POLYGON"],
        xtype: "combo",
        mode: "local",
        value: this.symbolizer.vendorOptions.polygonAlign || "manual",
        triggerAction: "all",
        store: ["manual", "ortho", "mbr"],
        fieldLabel: this.polygonAlignText
      })]
    }, {
      xtype: "fieldset",
      title: this.priorityText,
      checkboxToggle: !0,
      collapsed: !this.symbolizer.priority,
      autoHeight: !0,
      labelWidth: 50,
      items: [Ext.applyIf({
        fieldLabel: this.priorityText,
        value: this.symbolizer.priority && this.symbolizer.priority.replace(/^\${(.*)}$/, "$1"),
        allowBlank: !0,
        name: "priority",
        plugins: [{
          ptype: "gxp_formfieldhelp",
          dismissDelay: 2E4,
          helpText: this.priorityHelp
        }],
        listeners: {
          select: function(a, c) {
            this.symbolizer[a.name] = "${" + c.get("name") + "}";
            this.fireEvent("change", this.symbolizer)
          },
          scope: this
        }
      }, this.attributesComboConfig)]
    }, {
      xtype: "fieldset",
      title: this.labelOptionsText,
      checkboxToggle: !0,
      collapsed: !(this.symbolizer.vendorOptions.autoWrap || this.symbolizer.vendorOptions.followLine || this.symbolizer.vendorOptions.maxAngleDelta || this.symbolizer.vendorOptions.maxDisplacement || this.symbolizer.vendorOptions.repeat || this.symbolizer.vendorOptions.forceLeftToRight || this.symbolizer.vendorOptions.group || this.symbolizer.vendorOptions.spaceAround || this.symbolizer.vendorOptions.labelAllGroup || this.symbolizer.vendorOptions.conflictResolution || this.symbolizer.vendorOptions.goodnessOfFit || this.symbolizer.vendorOptions.polygonAlign),
      autoHeight: !0,
      labelWidth: 80,
      defaults: {
        width: 100
      },
      items: [this.createVendorSpecificField({
        name: "autoWrap",
        allowBlank: !1,
        fieldLabel: this.autoWrapText
      }), this.createVendorSpecificField({
        name: "followLine",
        geometryTypes: ["LINE"],
        xtype: "checkbox",
        listeners: {
          check: function(a, c) {
            c ? this.maxAngleDelta.show() : this.maxAngleDelta.hide()
          },
          scope: this
        },
        fieldLabel: this.followLineText
      }), this.createVendorSpecificField({
        name: "maxAngleDelta",
        ref: "../maxAngleDelta",
        hidden: null == this.symbolizer.vendorOptions.followLine,
        geometryTypes: ["LINE"],
        fieldLabel: this.maxAngleDeltaText
      }), this.createVendorSpecificField({
        name: "maxDisplacement",
        fieldLabel: this.maxDisplacementText
      }), this.createVendorSpecificField({
        name: "repeat",
        geometryTypes: ["LINE"],
        fieldLabel: this.repeatText
      }), this.createVendorSpecificField({
        name: "forceLeftToRight",
        xtype: "checkbox",
        geometryTypes: ["LINE"],
        fieldLabel: this.forceLeftToRightText
      }), this.createVendorSpecificField({
        name: "group",
        listeners: {
          check: function(a, c) {
            "LINE" === this.geometryType && (!1 === c ? this.labelAllGroup.hide() : this.labelAllGroup.show())
          },
          scope: this
        },
        xtype: "checkbox",
        yesno: !0,
        fieldLabel: this.groupText
      }), this.createVendorSpecificField({
        name: "labelAllGroup",
        ref: "../labelAllGroup",
        geometryTypes: ["LINE"],
        hidden: "yes" !== this.symbolizer.vendorOptions.group,
        xtype: "checkbox",
        fieldLabel: this.labelAllGroupText
      }), this.createVendorSpecificField({
        name: "conflictResolution",
        xtype: "checkbox",
        listeners: {
          check: function(a, c) {
            c ? this.spaceAround.show() : this.spaceAround.hide()
          },
          scope: this
        },
        fieldLabel: this.conflictResolutionText
      }), this.createVendorSpecificField({
        name: "spaceAround",
        hidden: !0 !== this.symbolizer.vendorOptions.conflictResolution,
        allowNegative: !0,
        ref: "../spaceAround",
        fieldLabel: this.spaceAroundText
      }), this.createVendorSpecificField({
        name: "goodnessOfFit",
        geometryTypes: ["POLYGON"],
        fieldLabel: this.goodnessOfFitText
      })]
    }];
    this.addEvents("change");
    gxp.TextSymbolizer.superclass.initComponent.call(this)
  },
  createField: function(a) {
    var b = Ext.ComponentMgr.create(a);
    if (a.geometryTypes) this.on("geometrytype", function(c) {
      -1 === a.geometryTypes.indexOf(c) && b.hide()
    });
    return b
  },
  createVendorSpecificField: function(a) {
    var b = function(b, c) {
      Ext.isEmpty(c) ? delete this.symbolizer.vendorOptions[a.name] : this.symbolizer.vendorOptions[a.name] = !0 === a.yesno ? !0 == c ? "yes" : "no" : c;
      this.fireEvent("change", this.symbolizer)
    },
        c = Ext.ComponentMgr.create(Ext.applyIf(a, {
        xtype: "numberfield",
        allowNegative: !1,
        value: a.value || this.symbolizer.vendorOptions[a.name],
        checked: !0 === a.yesno ? "yes" === this.symbolizer.vendorOptions[a.name] : this.symbolizer.vendorOptions[a.name],
        plugins: [{
          ptype: "gxp_formfieldhelp",
          dismissDelay: 2E4,
          helpText: this[a.name.replace(/-/g, "_") + "Help"]
        }]
      }));
    c.on("change", b, this);
    c.on("check", b, this);
    if (a.geometryTypes) this.on("geometrytype", function(b) {
      -1 === a.geometryTypes.indexOf(b) && c.hide()
    });
    return c
  },
  showHideGeometryOptions: function() {
    var a = /gml:((Multi)?(Point|Line|Polygon|Curve|Surface|Geometry)).*/,
        b = /gml:((Multi)?(Polygon|Surface)).*/,
        c = /gml:((Multi)?(Point)).*/,
        d = /gml:((Multi)?(Line|Curve|Surface)).*/,
        e = null;
    this.attributes.each(function(f) {
      f = f.get("type");
      a.exec(f) && (b.exec(f) ? e = "POLYGON" : c.exec(f) ? e = "POINT" : d.exec(f) && (e = "LINE"))
    }, this);
    if (null !== e) this.geometryType = e, this.fireEvent("geometrytype", e)
  }
});
Ext.reg("gxp_textsymbolizer", gxp.TextSymbolizer);
Ext.namespace("gxp.slider");
gxp.slider.Tip = Ext.extend(Ext.slider.Tip, {
  hover: !0,
  dragging: !1,
  init: function(a) {
    if (this.hover) a.on("render", this.registerThumbListeners, this);
    this.slider = a;
    gxp.slider.Tip.superclass.init.apply(this, arguments)
  },
  registerThumbListeners: function() {
    for (var a = 0, b = this.slider.thumbs.length; a < b; ++a) this.slider.thumbs[a].el.on({
      mouseover: this.createHoverListener(a),
      mouseout: function() {
        this.dragging || this.hide.apply(this, arguments)
      },
      scope: this
    })
  },
  createHoverListener: function(a) {
    return function() {
      this.onSlide(this.slider, {}, this.slider.thumbs[a]);
      this.dragging = !1
    }.createDelegate(this)
  },
  onSlide: function(a, b, c) {
    this.dragging = !0;
    gxp.slider.Tip.superclass.onSlide.apply(this, arguments)
  }
});
Ext.namespace("gxp");
gxp.VectorStylesDialog = Ext.extend(gxp.StylesDialog, {
  attributeStore: null,
  initComponent: function() {
    gxp.VectorStylesDialog.superclass.initComponent.apply(this, arguments);
    this.initialConfig.styleName = "default";
    this.items.get(1).setDisabled(!0);
    this.on({
      styleselected: function(a, b) {
        var c = this.stylesStore.findExact("name", b.name);
        if (-1 !== c) this.selectedStyle = this.stylesStore.getAt(c)
      },
      modified: function(a) {
        a.saveStyles()
      },
      beforesaved: function() {
        this._saving = !0
      },
      saved: function() {
        delete this._saving
      },
      savefailed: function() {
        Ext.Msg.show({
          title: this.errorTitle,
          msg: this.errorMsg,
          icon: Ext.MessageBox.ERROR,
          buttons: {
            ok: !0
          }
        });
        delete this._saving
      },
      render: function() {
        gxp.util.dispatch([this.getStyles], function() {
          this.enable()
        }, this)
      },
      scope: this
    })
  },
  addRulesFieldSet: function() {
    var a = gxp.VectorStylesDialog.superclass.addRulesFieldSet.apply(this, arguments);
    this.items.get(3).get(0).disable();
    return a
  },
  disableConditional: function(a) {
    var b = this.layerRecord.getLayer();
    a && b.customStyling && a.disable()
  },
  onRuleSelected: function(a, b) {
    gxp.VectorStylesDialog.superclass.onRuleSelected.call(this, a, b);
    this.disableConditional(this.items.get(3).items.get(3))
  },
  editRule: function() {
    var a = this.selectedRule;
    if (!this.textSym && this.attributeStore && 0 < this.attributeStore.data.getCount()) a.symbolizers.push(this.createSymbolizer("Text", {})), this.textSym = !0;
    var b = a.clone(),
        c = new this.dialogCls({
        title: String.format(this.ruleWindowTitle, a.title || a.name || this.newRuleText),
        shortTitle: a.title || a.name || this.newRuleText,
        layout: "fit",
        width: 320,
        height: 490,
        pageX: 150,
        pageY: 100,
        modal: !0,
        listeners: {
          hide: function() {
            gxp.ColorManager.pickerWin && gxp.ColorManager.pickerWin.hide()
          },
          scope: this
        },
        items: [{
          xtype: "gxp_rulepanel",
          ref: "rulePanel",
          symbolType: a.symbolType ? a.symbolType : this.symbolType,
          rule: a,
          attributes: this.attributeStore,
          autoScroll: !0,
          border: !1,
          defaults: {
            autoHeight: !0,
            hideMode: "offsets"
          },
          listeners: {
            change: this.saveRule,
            tabchange: function() {
              c instanceof Ext.Window && c.syncShadow()
            },
            scope: this
          }
        }],
        bbar: ["->",
        {
          text: this.cancelText,
          iconCls: "cancel",
          handler: function() {
            this.saveRule(c.rulePanel, b);
            c.destroy()
          },
          scope: this
        }, {
          text: this.saveText,
          iconCls: "save",
          handler: function() {
            c.destroy()
          }
        }]
      }),
        d;
    if (0 == this.attributeStore.data.getCount()) {
      var e = c.findByType("gxp_rulepanel")[0],
          a = e.items.getRange(1, 2);
      for (d = 0; d < a.length; d++) e.remove(a[d])
    }
    if ((a = c.findByType("gxp_textsymbolizer")) && 1 == a.length) {
      e = a[0];
      a = e.items.getRange(3, 7);
      for (d = 0; d < a.length; d++) e.remove(a[d])
    }
    this.showDlg(c)
  },
  createSymbolizer: function(a, b) {
    return new(eval("OpenLayers.Symbolizer." + a))(b)
  },
  prepareStyle: function(a, b, c) {
    b = b.clone();
    b.isDefault = "default" === c;
    b.name = c;
    b.title =
    c + " style";
    b.description = c + " style for this layer";
    b.layerName = a.name;
    var c = [],
        d, e;
    if (b.rules && 0 < b.rules.length) for (var f = 0; f < b.rules.length; f++) {
      a = b.rules[f];
      c = [];
      for (e in a.symbolizer) d = a.symbolizer[e], d = d.CLASS_NAME ? d.clone() : this.createSymbolizer(e, d), c.push(d);
      a.symbolizers = c;
      a.symbolizer = void 0
    } else if (a.customStyling) {
      c = ["Point", "Line", "Polygon"];
      b.rules = [];
      d = b.defaultStyle;
      for (f = 0; f < c.length; f++) e = c[f], a = new OpenLayers.Rule({
        title: e,
        symbolType: e,
        symbolizers: [this.createSymbolizer(e, d)]
      }), b.rules.push(a);
      b.defaultsPerSymbolizer = !1
    } else {
      e = "Polygon";
      if (a && a.features && 0 < a.features.length)(a = a.features[0].geometry) && (0 < a.CLASS_NAME.indexOf("Point") ? e = "Point" : 0 < a.CLASS_NAME.indexOf("Line") && (e = "Line"));
      d = this.createSymbolizer(e, b.defaultStyle);
      c = [d];
      b.rules = [new OpenLayers.Rule({
        title: b.name,
        symbolizers: c
      })]
    }
    return b
  },
  getStyles: function() {
    if (!this.first) {
      var a = this.layerRecord.getLayer();
      if (this.editable) {
        this.first = !0;
        var b = this.initialConfig.styleName;
        this.selectedStyle = this.stylesStore.getAt(this.stylesStore.findExact("name", b));
        try {
          var c = [];
          a.style && a.styleMap && (OpenLayers.Util.extend(a.styleMap.styles["default"].defaultStyle, a.style), delete a.style);
          for (var d in a.styleMap.styles)"default" == d && c.push(this.prepareStyle(a, a.styleMap.styles[d], d));
          this.stylesStore.removeAll();
          this.selectedStyle = null;
          for (var e, f, g, a = 0, h = c.length; a < h; ++a) if (e = c[a], g = this.stylesStore.findExact("name", e.name), -1 !== g && this.stylesStore.removeAt(g), f = new this.stylesStore.recordType({
            name: e.name,
            title: e.title,
            "abstract": e.description,
            userStyle: e
          }), f.phantom = !1, this.stylesStore.add(f), !this.selectedStyle && (b === e.name || !b && !0 === e.isDefault)) this.selectedStyle = f;
          this.addRulesFieldSet();
          this.createLegend(this.selectedStyle.get("userStyle").rules);
          this.stylesStoreReady();
          this.markModified()
        } catch (j) {
          this.setupNonEditable()
        }
      } else this.setupNonEditable()
    }
  },
  describeLayer: function(a) {
    this.layerDescription && a.call(this);
    var b = this.layerRecord.getLayer();
    if (b.protocol && 0 < b.protocol.CLASS_NAME.indexOf(".WFS")) this.wfsLayer = {}, this.wfsLayer.owsURL = b.protocol.url.replace("?", ""), this.wfsLayer.owsType = "WFS", this.wfsLayer.typeName = b.protocol.featureType;
    var c = this;
    if (this.wfsLayer) this.attributeStore = new GeoExt.data.AttributeStore({
      url: this.wfsLayer.owsURL,
      baseParams: {
        SERVICE: "WFS",
        VERSION: "1.1.0",
        REQUEST: "DescribeFeatureType",
        TYPENAME: this.wfsLayer.typeName
      },
      autoLoad: !0,
      listeners: {
        load: function(b) {
          c.layerDescription = c.attributeStore;
          b.load = function() {};
          a.call(c)
        },
        scope: this
      }
    });
    else {
      this.attributeStore = new Ext.data.Store({
        reader: new Ext.data.ArrayReader({
          idIndex: 0
        }, Ext.data.Record.create([{
          name: "name"
        }]))
      });
      var d = [];
      if (b && b.features && 0 < b.features.length) {
        var b = b.features[0].attributes,
            e;
        for (e in b) d.push([e])
      }
      this.attributeStore.loadData(d);
      this.attributeStore.proxy = {
        request: function() {}
      };
      this.layerDescription = this.attributeStore;
      a.call(this)
    }
  },
  addStylesCombo: function() {
    if (!this.combo) {
      var a = this.stylesStore;
      this.combo = new Ext.form.ComboBox(Ext.apply({
        fieldLabel: this.chooseStyleText,
        store: a,
        editable: !1,
        displayField: "title",
        valueField: "name",
        value: this.selectedStyle ? this.selectedStyle.get("title") : "default",
        disabled: !a.getCount(),
        mode: "local",
        typeAhead: !0,
        triggerAction: "all",
        forceSelection: !0,
        anchor: "100%",
        listeners: {
          select: function(a, c) {
            this.changeStyle(c);
            !c.phantom && !this._removing && this.fireEvent("styleselected", this, c.get("name"))
          },
          scope: this
        }
      }, this.initialConfig.stylesComboOptions));
      this.items.get(0).add(this.combo);
      this.doLayout()
    }
  },
  createLegendImage: function() {
    return new GeoExt.VectorLegend({
      showTitle: !1,
      layerRecord: this.layerRecord,
      autoScroll: !0
    })
  },
  updateRuleRemoveButton: function() {
    gxp.VectorStylesDialog.superclass.updateRuleRemoveButton.apply(this, arguments);
    this.disableConditional(this.items.get(3).items.get(1))
  },
  updateStyleRemoveButton: function() {
    this.items.get(1).items.get(1).setDisabled(!0)
  }
});
gxp.VectorStylesDialog.createVectorStylerConfig = function(a) {
  return {
    xtype: "gxp_vectorstylesdialog",
    layerRecord: a,
    listeners: {
      hide: function() {
        alert("hide")
      }
    },
    plugins: [{
      ptype: "gxp_vectorstylewriter"
    }]
  }
};
Ext.reg("gxp_vectorstylesdialog", gxp.VectorStylesDialog);
(function() {
  Ext.util.Observable.observeClass(Ext.ColorPalette);
  Ext.ColorPalette.on({
    render: function() {
      gxp.ColorManager.pickerWin && gxp.ColorManager.pickerWin.setPagePosition(200, 100)
    }
  });
  Ext.ColorPalette.on({
    select: function() {
      gxp.ColorManager.pickerWin && gxp.ColorManager.pickerWin.hide()
    }
  })
})();
Ext.namespace("gxp");
gxp.Viewer = Ext.extend(Ext.util.Observable, {
  defaultToolType: "gxp_tool",
  tools: null,
  selectedLayer: null,
  authenticate: null,
  saveErrorText: "Trouble saving: ",
  constructor: function(a) {
    this.addEvents("ready", "beforecreateportal", "portalready", "beforelayerselectionchange", "layerselectionchange", "featureedit", "authorizationchange", "beforesave", "save", "beforehashchange");
    Ext.apply(this, {
      layerSources: {},
      portalItems: []
    });
    this.createLayerRecordQueue = [];
    (a.loadConfig || this.loadConfig).call(this, a, this.applyConfig);
    gxp.Viewer.superclass.constructor.apply(this, arguments)
  },
  selectLayer: function(a) {
    var a = a || null,
        b = !1;
    if (!1 !== this.fireEvent("beforelayerselectionchange", a)) b = !0, this.selectedLayer && this.selectedLayer.set("selected", !1), (this.selectedLayer = a) && this.selectedLayer.set("selected", !0), this.fireEvent("layerselectionchange", a);
    return b
  },
  loadConfig: function(a) {
    this.applyConfig(a)
  },
  applyConfig: function(a) {
    this.initialConfig = Ext.apply({}, a);
    Ext.apply(this, this.initialConfig);
    this.load()
  },
  load: function() {
    if (this.proxy) OpenLayers.ProxyHost =
    this.proxy;
    this.initMapPanel();
    this.initTools();
    var a = [],
        b;
    for (b in this.sources) a.push(this.createSourceLoader(b));
    a.push(function(a) {
      Ext.onReady(function() {
        this.initPortal();
        a()
      }, this)
    });
    gxp.util.dispatch(a, this.activate, this)
  },
  createSourceLoader: function(a) {
    return function(b) {
      var c = this.sources[a];
      c.projection = this.initialConfig.map.projection;
      this.addLayerSource({
        id: a,
        config: c,
        callback: b,
        fallback: function() {
          b()
        },
        scope: this
      })
    }
  },
  addLayerSource: function(a) {
    var b = a.id || Ext.id(null, "gxp-source-"),
        c, d = a.config;
    d.id = b;
    try {
      c = Ext.ComponentMgr.createPlugin(d, this.defaultSourceType)
    } catch (e) {
      throw Error("Could not create new source plugin with ptype: " + a.config.ptype);
    }
    c.on({
      ready: {
        fn: function() {
          (a.callback || Ext.emptyFn).call(a.scope || this, b)
        },
        scope: this,
        single: !0
      },
      failure: {
        fn: function() {
          var c = a.fallback || Ext.emptyFn;
          delete this.layerSources[b];
          c.apply(a.scope || this, arguments)
        },
        scope: this,
        single: !0
      }
    });
    this.layerSources[b] = c;
    c.init(this);
    return c
  },
  initMapPanel: function() {
    var a = Ext.apply({}, this.initialConfig.map),
        b = {},
        c = {
        wrapDateLine: void 0 !== a.wrapDateLine ? a.wrapDateLine : !0,
        maxResolution: a.maxResolution,
        numZoomLevels: a.numZoomLevels,
        displayInLayerSwitcher: !1
        };
    if (this.initialConfig.map) for (var d = "theme,controls,resolutions,projection,units,maxExtent,restrictedExtent,maxResolution,numZoomLevels,panMethod".split(","), e, f = d.length - 1; 0 <= f; --f) e = d[f], e in a && (b[e] = a[e], delete a[e]);
    this.mapPanel = Ext.ComponentMgr.create(Ext.applyIf({
      xtype: a.xtype || "gx_mappanel",
      map: Ext.applyIf({
        theme: b.theme || null,
        controls: b.controls || [new OpenLayers.Control.Navigation({
          zoomWheelOptions: {
            interval: 250
          },
          dragPanOptions: {
            enableKinetic: !0
          }
        }), new OpenLayers.Control.PanPanel, new OpenLayers.Control.ZoomPanel, new OpenLayers.Control.Attribution],
        maxExtent: b.maxExtent && OpenLayers.Bounds.fromArray(b.maxExtent),
        restrictedExtent: b.restrictedExtent && OpenLayers.Bounds.fromArray(b.restrictedExtent),
        numZoomLevels: b.numZoomLevels || 20
      }, b),
      center: a.center && new OpenLayers.LonLat(a.center[0], a.center[1]),
      resolutions: a.resolutions,
      forceInitialExtent: !0,
      layers: [new OpenLayers.Layer(null, c)],
      items: this.mapItems,
      plugins: this.mapPlugins,
      tbar: a.tbar || new Ext.Toolbar({
        hidden: !0
      })
    }, a));
    this.mapPanel.getTopToolbar().on({
      afterlayout: this.mapPanel.map.updateSize,
      show: this.mapPanel.map.updateSize,
      hide: this.mapPanel.map.updateSize,
      scope: this.mapPanel.map
    });
    this.mapPanel.layers.on({
      add: function(a, b) {
        for (var c, d = b.length - 1; 0 <= d; d--) c = b[d], !0 === c.get("selected") && this.selectLayer(c)
      },
      remove: function(a, b) {
        !0 === b.get("selected") && this.selectLayer()
      },
      scope: this
    })
  },
  initTools: function() {
    this.tools = {};
    if (this.initialConfig.tools && 0 < this.initialConfig.tools.length) for (var a, b = 0, c = this.initialConfig.tools.length; b < c; b++) {
      try {
        a = Ext.ComponentMgr.createPlugin(this.initialConfig.tools[b], this.defaultToolType)
      } catch (d) {
        throw Error("Could not create tool plugin with ptype: " + this.initialConfig.tools[b].ptype);
      }
      a.init(this)
    }
  },
  initPortal: function() {
    var a = Ext.apply({}, this.portalConfig);
    if (0 === this.portalItems.length) this.mapPanel.region = "center", this.portalItems.push(this.mapPanel);
    this.fireEvent("beforecreateportal");
    this.portal = Ext.ComponentMgr.create(Ext.applyIf(a, {
      layout: "fit",
      hideBorders: !0,
      items: {
        layout: "border",
        deferredRender: !1,
        items: this.portalItems
      }
    }), a.renderTo ? "panel" : "viewport");
    this.fireEvent("portalready")
  },
  activate: function() {
    Ext.QuickTips.init();
    this.addLayers();
    this.checkLayerRecordQueue();
    this.fireEvent("ready")
  },
  addLayers: function() {
    var a = this.initialConfig.map;
    if (a && a.layers) {
      for (var b, c, d = [], e = [], f = 0; f < a.layers.length; ++f) b = a.layers[f], (c = this.layerSources[b.source]) ? (b = c.createLayerRecord(b)) && ("background" === b.get("group") ? d.push(b) : e.push(b)) : window.console && console.warn("Non-existing source '" + b.source + "' referenced in layer config.");
      a = this.mapPanel;
      d = d.concat(e);
      d.length && a.layers.add(d)
    }
  },
  getLayerRecordFromMap: function(a) {
    var b = null;
    this.mapPanel && this.mapPanel.layers.each(function(c) {
      if (c.get("source") == a.source && c.get("name") == a.name) return b = c, !1
    });
    return b
  },
  createLayerRecord: function(a, b, c) {
    this.createLayerRecordQueue.push({
      config: a,
      callback: b,
      scope: c
    });
    this.checkLayerRecordQueue()
  },
  checkLayerRecordQueue: function() {
    for (var a, b, c, d, e = [], f = 0, g = this.createLayerRecordQueue.length; f < g; ++f) d = !1, a = this.createLayerRecordQueue[f], b = a.config.source, b in this.layerSources && (b = this.layerSources[b], (c = b.createLayerRecord(a.config)) ? (function(a, b) {
      window.setTimeout(function() {
        a.callback.call(a.scope, b)
      }, 0)
    }(a, c), d = !0) : b.lazy && b.store.load({
      callback: this.checkLayerRecordQueue,
      scope: this
    })), d || e.push(a);
    this.createLayerRecordQueue = e
  },
  getSource: function(a) {
    return a && this.layerSources[a.get("source")]
  },
  getState: function() {
    var a = Ext.apply({}, this.initialConfig),
        b = this.mapPanel.map.getCenter();
    Ext.apply(a.map, {
      center: [b.lon, b.lat],
      zoom: this.mapPanel.map.zoom,
      layers: []
    });
    var c = {};
    this.mapPanel.layers.each(function(b) {
      var e = b.getLayer();
      if (e.displayInLayerSwitcher && !(e instanceof OpenLayers.Layer.Vector)) {
        var f = b.get("source"),
            g = this.layerSources[f];
        if (!g) throw Error("Could not find source for record '" + b.get("name") + " and layer " + e.name + "'");
        a.map.layers.push(g.getConfigForRecord(b));
        c[f] || (c[f] = g.getState())
      }
    }, this);
    Ext.apply(this.sources, c);
    a.tools = [];
    Ext.iterate(this.tools, function(b, c) {
      c.getState != gxp.plugins.Tool.prototype.getState && a.tools.push(c.getState())
    });
    return a
  },
  isAuthorized: function(a) {
    var b = !0;
    if (this.authorizedRoles) {
      b = !1;
      a || (a = "ROLE_ADMINISTRATOR");
      Ext.isArray(a) || (a = [a]);
      for (var c = a.length - 1; 0 <= c; --c) if (~this.authorizedRoles.indexOf(a[c])) {
        b = !0;
        break
      }
    }
    return b
  },
  setAuthorizedRoles: function(a) {
    this.authorizedRoles = a;
    this.fireEvent("authorizationchange")
  },
  cancelAuthentication: function() {
    this._authFn && this.un("authorizationchange", this._authFn, this);
    this.fireEvent("authorizationchange")
  },
  isAuthenticated: function() {
    return !this.authorizedRoles || 0 < this.authorizedRoles.length
  },
  doAuthorized: function(a, b, c) {
    this.isAuthorized(a) || !this.authenticate ? window.setTimeout(function() {
      b.call(c)
    }, 0) : (this.authenticate(), this._authFn = function() {
      delete this._authFn;
      this.doAuthorized(a, b, c, !0)
    }, this.on("authorizationchange", this._authFn, this, {
      single: !0
    }))
  },
  save: function(a, b) {
    var c = Ext.util.JSON.encode(this.getState()),
        d, e;
    this.id ? (d = "PUT", e = "../maps/" + this.id) : (d = "POST", e = "../maps/");
    c = {
      method: d,
      url: e,
      data: c
    };
    !1 !== this.fireEvent("beforesave", c, a) && OpenLayers.Request.issue(Ext.apply(c, {
      callback: function(c) {
        this.handleSave(c);
        a && a.call(b || this, c)
      },
      scope: this
    }))
  },
  handleSave: function(a) {
    if (200 == a.status) {
      if (a = Ext.util.JSON.decode(a.responseText).id) {
        this.id = a;
        a = "#maps/" + a;
        if (!1 !== this.fireEvent("beforehashchange", a)) window.location.hash = a;
        this.fireEvent("save", this.id)
      }
    } else window.console && console.warn(this.saveErrorText + a.responseText)
  },
  destroy: function() {
    this.mapPanel.destroy();
    this.portal && this.portal.destroy()
  }
});
(function() {
  OpenLayers.DOTS_PER_INCH = 25.4 / 0.28
})();
Ext.namespace("gxp");
gxp.WMSLayerPanel = Ext.extend(Ext.TabPanel, {
  layerRecord: null,
  source: null,
  styling: !0,
  sameOriginStyling: !0,
  rasterStyling: !1,
  transparent: null,
  editableStyles: !1,
  activeTab: 0,
  border: !1,
  imageFormats: /png|gif|jpe?g/i,
  aboutText: "About",
  titleText: "Title",
  attributionText: "Attribution",
  nameText: "Name",
  descriptionText: "Description",
  displayText: "Display",
  opacityText: "Opacity",
  formatText: "Tile format",
  infoFormatText: "Info format",
  infoFormatEmptyText: "Select a format",
  transparentText: "Transparent",
  cacheText: "Caching",
  cacheFieldText: "Use cached tiles",
  stylesText: "Available Styles",
  displayOptionsText: "Display options",
  queryText: "Limit with filters",
  scaleText: "Limit by scale",
  minScaleText: "Min scale",
  maxScaleText: "Max scale",
  switchToFilterBuilderText: "Switch back to filter builder",
  cqlPrefixText: "or ",
  cqlText: "use CQL filter instead",
  singleTileText: "Single tile",
  singleTileFieldText: "Use a single tile",
  initComponent: function() {
    this.cqlFormat = new OpenLayers.Format.CQL;
    this.source && this.source.getSchema(this.layerRecord, function(a) {
      if (!1 !== a) {
        var c = this.layerRecord.getLayer().params.CQL_FILTER;
        this.filterBuilder = new gxp.FilterBuilder({
          filter: c && this.cqlFormat.read(c),
          allowGroups: !1,
          listeners: {
            afterrender: function() {
              this.filterBuilder.cascade(function(a) {
                "toolbar" === a.getXType() && (a.addText(this.cqlPrefixText), a.addButton({
                  text: this.cqlText,
                  handler: this.switchToCQL,
                  scope: this
                }))
              }, this)
            },
            change: function(a) {
              var a = a.getFilter(),
                  b = null;
              !1 !== a && (b = this.cqlFormat.write(a));
              this.layerRecord.getLayer().mergeNewParams({
                CQL_FILTER: b
              })
            },
            scope: this
          },
          attributes: a
        });
        this.filterFieldset.add(this.filterBuilder);
        this.filterFieldset.doLayout()
      }
    }, this);
    this.addEvents("change");
    this.items = [this.createAboutPanel(), this.createDisplayPanel()];
    if (this.styling && gxp.WMSStylesDialog && this.layerRecord.get("styles")) {
      var a = this.layerRecord.get("restUrl");
      a || (a = (this.source || this.layerRecord.get("layer")).url.split("?").shift().replace(/\/(wms|ows)\/?$/, "/rest"));
      this.editableStyles = this.sameOriginStyling ? "/" === a.charAt(0) : !0;
      this.items.push(this.createStylesPanel(a))
    }
    gxp.WMSLayerPanel.superclass.initComponent.call(this)
  },
  switchToCQL: function() {
    var a = this.filterBuilder.getFilter(),
        b = "";
    !1 !== a && (b = this.cqlFormat.write(a));
    this.filterBuilder.hide();
    this.cqlField.setValue(b);
    this.cqlField.show();
    this.cqlToolbar.show()
  },
  switchToFilterBuilder: function() {
    var a = null;
    try {
      a = this.cqlFormat.read(this.cqlField.getValue())
    } catch (b) {}
    this.cqlField.hide();
    this.cqlToolbar.hide();
    this.filterBuilder.show();
    null !== a && this.filterBuilder.setFilter(a)
  },
  createStylesPanel: function(a) {
    a = gxp.WMSStylesDialog.createGeoServerStylerConfig(this.layerRecord, a);
    !0 === this.rasterStyling && a.plugins.push({
      ptype: "gxp_wmsrasterstylesdialog"
    });
    var b = this.ownerCt;
    if (!(b.ownerCt instanceof Ext.Window)) a.dialogCls = Ext.Panel, a.showDlg = function(a) {
      a.layout = "fit";
      a.autoHeight = !1;
      b.add(a)
    };
    return Ext.apply(a, {
      title: this.stylesText,
      style: "padding: 10px",
      editable: !1
    })
  },
  createAboutPanel: function() {
    return {
      title: this.aboutText,
      bodyStyle: {
        padding: "10px"
      },
      defaults: {
        border: !1
      },
      items: [{
        layout: "form",
        labelWidth: 70,
        items: [{
          xtype: "textfield",
          fieldLabel: this.titleText,
          anchor: "99%",
          value: this.layerRecord.get("title"),
          listeners: {
            change: function(a) {
              this.layerRecord.set("title", a.getValue());
              this.layerRecord.commit();
              this.fireEvent("change")
            },
            scope: this
          }
        }, {
          xtype: "textfield",
          fieldLabel: this.nameText,
          anchor: "99%",
          value: this.layerRecord.get("name"),
          readOnly: !0
        }, {
          xtype: "textfield",
          fieldLabel: this.attributionText,
          anchor: "99%",
          listeners: {
            change: function(a) {
              var b = this.layerRecord.getLayer();
              b.attribution = a.getValue();
              b.map.events.triggerEvent("changelayer", {
                layer: b,
                property: "attribution"
              });
              this.fireEvent("change")
            },
            scope: this
          },
          value: this.layerRecord.getLayer().attribution
        }]
      }, {
        layout: "form",
        labelAlign: "top",
        items: [{
          xtype: "textarea",
          fieldLabel: this.descriptionText,
          grow: !0,
          growMax: 150,
          anchor: "99%",
          value: this.layerRecord.get("abstract"),
          readOnly: !0
        }]
      }]
    }
  },
  onFormatChange: function(a) {
    var b = this.layerRecord.getLayer(),
        a = a.getValue();
    b.mergeNewParams({
      format: a
    });
    b = this.transparentCb;
    if ("image/jpeg" == a) this.transparent = b.getValue(), b.setValue(!1);
    else if (null !== this.transparent) b.setValue(this.transparent), this.transparent = null;
    b.setDisabled("image/jpeg" == a);
    this.fireEvent("change")
  },
  addScaleOptions: function(a, b) {
    a.alwaysInRange = null;
    a.addOptions(b);
    a.display();
    a.redraw()
  },
  createDisplayPanel: function() {
    var a = this.layerRecord,
        b = a.getLayer(),
        c = b.opacity;
    null == c && (c = 1);
    var d = [],
        c = b.params.FORMAT.toLowerCase();
    Ext.each(a.get("formats"), function(a) {
      this.imageFormats.test(a) && d.push(a.toLowerCase())
    }, this); - 1 === d.indexOf(c) && d.push(c);
    var e = b.params.TRANSPARENT;
    return {
      title: this.displayText,
      layout: "form",
      bodyStyle: {
        padding: "10px"
      },
      defaults: {
        labelWidth: 70
      },
      items: [{
        xtype: "fieldset",
        title: this.displayOptionsText,
        items: [{
          xtype: "gx_opacityslider",
          name: "opacity",
          anchor: "99%",
          isFormField: !0,
          fieldLabel: this.opacityText,
          listeners: {
            change: function() {
              this.fireEvent("change")
            },
            scope: this
          },
          layer: this.layerRecord
        }, {
          xtype: "compositefield",
          fieldLabel: this.formatText,
          anchor: "99%",
          items: [{
            xtype: "combo",
            width: 90,
            listWidth: 150,
            store: d,
            value: c,
            mode: "local",
            triggerAction: "all",
            editable: !1,
            listeners: {
              select: this.onFormatChange,
              scope: this
            }
          }, {
            xtype: "checkbox",
            ref: "../../../transparentCb",
            checked: "true" === e || !0 === e,
            listeners: {
              check: function(a, c) {
                b.mergeNewParams({
                  transparent: c ? "true" : "false"
                });
                this.fireEvent("change")
              },
              scope: this
            }
          }, {
            xtype: "label",
            cls: "gxp-layerproperties-label",
            text: this.transparentText
          }]
        }, {
          xtype: "compositefield",
          fieldLabel: this.singleTileText,
          anchor: "99%",
          items: [{
            xtype: "checkbox",
            checked: this.layerRecord.get("layer").singleTile,
            listeners: {
              check: function(a, c) {
                b.addOptions({
                  singleTile: c
                });
                this.fireEvent("change")
              },
              scope: this
            }
          }, {
            xtype: "label",
            cls: "gxp-layerproperties-label",
            text: this.singleTileFieldText
          }]
        }, {
          xtype: "compositefield",
          anchor: "99%",
          hidden: null == this.layerRecord.get("layer").params.TILED,
          fieldLabel: this.cacheText,
          items: [{
            xtype: "checkbox",
            checked: !0 === this.layerRecord.get("layer").params.TILED,
            listeners: {
              check: function(a, b) {
                this.layerRecord.get("layer").mergeNewParams({
                  TILED: b
                });
                this.fireEvent("change")
              },
              scope: this
            }
          }, {
            xtype: "label",
            cls: "gxp-layerproperties-label",
            text: this.cacheFieldText
          }]
        }, {
          xtype: "combo",
          fieldLabel: this.infoFormatText,
          emptyText: this.infoFormatEmptyText,
          store: a.get("infoFormats"),
          value: a.get("infoFormat"),
          hidden: void 0 === a.get("infoFormats"),
          mode: "local",
          listWidth: 150,
          triggerAction: "all",
          editable: !1,
          anchor: "99%",
          listeners: {
            select: function(b) {
              b = b.getValue();
              a.set("infoFormat", b);
              this.fireEvent("change")
            }
          },
          scope: this
        }]
      }, {
        xtype: "fieldset",
        title: this.queryText,
        hideLabels: !0,
        ref: "../filterFieldset",
        listeners: {
          expand: function() {
            this.layerRecord.getLayer().mergeNewParams({
              CQL_FILTER: this.cqlFilter
            })
          },
          collapse: function() {
            this.cqlFilter = this.layerRecord.getLayer().params.CQL_FILTER;
            this.layerRecord.getLayer().mergeNewParams({
              CQL_FILTER: null
            })
          },
          scope: this
        },
        hidden: null === this.source,
        checkboxToggle: !0,
        collapsed: !this.layerRecord.getLayer().params.CQL_FILTER,
        items: [{
          xtype: "textarea",
          value: this.layerRecord.getLayer().params.CQL_FILTER,
          grow: !0,
          anchor: "99%",
          width: "100%",
          growMax: 100,
          ref: "../../cqlField",
          hidden: !0
        }],
        buttons: [{
          ref: "../../../cqlToolbar",
          hidden: !0,
          text: this.switchToFilterBuilderText,
          handler: this.switchToFilterBuilder,
          scope: this
        }]
      }, {
        xtype: "fieldset",
        title: this.scaleText,
        listeners: {
          expand: function() {
            var a = this.layerRecord.getLayer();
            (void 0 !== this.minScale || void 0 !== this.maxScale) && this.addScaleOptions(a, {
              minScale: this.maxScale,
              maxScale: this.minScale
            })
          },
          collapse: function() {
            var a = this.layerRecord.getLayer();
            this.minScale = a.options.maxScale;
            this.maxScale = a.options.minScale;
            this.addScaleOptions(a, {
              minScale: null,
              maxScale: null
            })
          },
          scope: this
        },
        checkboxToggle: !0,
        collapsed: null == this.layerRecord.getLayer().options.maxScale && null == this.layerRecord.getLayer().options.minScale,
        items: [{
          xtype: "compositefield",
          fieldLabel: this.minScaleText,
          items: [{
            xtype: "label",
            text: "1:",
            cls: "gxp-layerproperties-label"
          }, {
            xtype: "numberfield",
            anchor: "99%",
            width: "85%",
            listeners: {
              change: function(a) {
                a = {
                  maxScale: parseInt(a.getValue())
                };
                this.addScaleOptions(this.layerRecord.getLayer(), a)
              },
              scope: this
            },
            value: this.layerRecord.getLayer().options.maxScale
          }]
        }, {
          xtype: "compositefield",
          fieldLabel: this.maxScaleText,
          items: [{
            xtype: "label",
            text: "1:",
            cls: "gxp-layerproperties-label"
          }, {
            xtype: "numberfield",
            anchor: "99%",
            width: "85%",
            listeners: {
              change: function(a) {
                a = {
                  minScale: parseInt(a.getValue())
                };
                this.addScaleOptions(this.layerRecord.getLayer(), a)
              },
              scope: this
            },
            value: this.layerRecord.getLayer().options.minScale
          }]
        }]
      }]
    }
  }
});
Ext.reg("gxp_wmslayerpanel", gxp.WMSLayerPanel);