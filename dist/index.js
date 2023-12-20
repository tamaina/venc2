var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/@webav+mp4box.js@0.5.3-fenghen/node_modules/@webav/mp4box.js/dist/mp4box.all.js
var require_mp4box_all = __commonJS({
  "node_modules/.pnpm/@webav+mp4box.js@0.5.3-fenghen/node_modules/@webav/mp4box.js/dist/mp4box.all.js"(exports) {
    "use strict";
    var Log2 = function() {
      var start = /* @__PURE__ */ new Date();
      var LOG_LEVEL_ERROR = 4;
      var LOG_LEVEL_WARNING = 3;
      var LOG_LEVEL_INFO = 2;
      var LOG_LEVEL_DEBUG = 1;
      var log_level = LOG_LEVEL_ERROR;
      var logObject = {
        setLogLevel: function(level) {
          if (level == this.debug)
            log_level = LOG_LEVEL_DEBUG;
          else if (level == this.info)
            log_level = LOG_LEVEL_INFO;
          else if (level == this.warn)
            log_level = LOG_LEVEL_WARNING;
          else if (level == this.error)
            log_level = LOG_LEVEL_ERROR;
          else
            log_level = LOG_LEVEL_ERROR;
        },
        debug: function(module2, msg) {
          if (console.debug === void 0) {
            console.debug = console.log;
          }
          if (LOG_LEVEL_DEBUG >= log_level) {
            console.debug("[" + Log2.getDurationString(/* @__PURE__ */ new Date() - start, 1e3) + "]", "[" + module2 + "]", msg);
          }
        },
        log: function(module2, msg) {
          this.debug(module2.msg);
        },
        info: function(module2, msg) {
          if (LOG_LEVEL_INFO >= log_level) {
            console.info("[" + Log2.getDurationString(/* @__PURE__ */ new Date() - start, 1e3) + "]", "[" + module2 + "]", msg);
          }
        },
        warn: function(module2, msg) {
          if (LOG_LEVEL_WARNING >= log_level) {
            console.warn("[" + Log2.getDurationString(/* @__PURE__ */ new Date() - start, 1e3) + "]", "[" + module2 + "]", msg);
          }
        },
        error: function(module2, msg) {
          if (LOG_LEVEL_ERROR >= log_level) {
            console.error("[" + Log2.getDurationString(/* @__PURE__ */ new Date() - start, 1e3) + "]", "[" + module2 + "]", msg);
          }
        }
      };
      return logObject;
    }();
    Log2.getDurationString = function(duration, _timescale) {
      var neg;
      function pad(number, length) {
        var str = "" + number;
        var a = str.split(".");
        while (a[0].length < length) {
          a[0] = "0" + a[0];
        }
        return a.join(".");
      }
      if (duration < 0) {
        neg = true;
        duration = -duration;
      } else {
        neg = false;
      }
      var timescale = _timescale || 1;
      var duration_sec = duration / timescale;
      var hours = Math.floor(duration_sec / 3600);
      duration_sec -= hours * 3600;
      var minutes = Math.floor(duration_sec / 60);
      duration_sec -= minutes * 60;
      var msec = duration_sec * 1e3;
      duration_sec = Math.floor(duration_sec);
      msec -= duration_sec * 1e3;
      msec = Math.floor(msec);
      return (neg ? "-" : "") + hours + ":" + pad(minutes, 2) + ":" + pad(duration_sec, 2) + "." + pad(msec, 3);
    };
    Log2.printRanges = function(ranges) {
      var length = ranges.length;
      if (length > 0) {
        var str = "";
        for (var i2 = 0; i2 < length; i2++) {
          if (i2 > 0)
            str += ",";
          str += "[" + Log2.getDurationString(ranges.start(i2)) + "," + Log2.getDurationString(ranges.end(i2)) + "]";
        }
        return str;
      } else {
        return "(empty)";
      }
    };
    if (typeof exports !== "undefined") {
      exports.Log = Log2;
    }
    var MP4BoxStream2 = function(arrayBuffer) {
      if (arrayBuffer instanceof ArrayBuffer) {
        this.buffer = arrayBuffer;
        this.dataview = new DataView(arrayBuffer);
      } else {
        throw "Needs an array buffer";
      }
      this.position = 0;
    };
    MP4BoxStream2.prototype.getPosition = function() {
      return this.position;
    };
    MP4BoxStream2.prototype.getEndPosition = function() {
      return this.buffer.byteLength;
    };
    MP4BoxStream2.prototype.getLength = function() {
      return this.buffer.byteLength;
    };
    MP4BoxStream2.prototype.seek = function(pos) {
      var npos = Math.max(0, Math.min(this.buffer.byteLength, pos));
      this.position = isNaN(npos) || !isFinite(npos) ? 0 : npos;
      return true;
    };
    MP4BoxStream2.prototype.isEos = function() {
      return this.getPosition() >= this.getEndPosition();
    };
    MP4BoxStream2.prototype.readAnyInt = function(size, signed) {
      var res = 0;
      if (this.position + size <= this.buffer.byteLength) {
        switch (size) {
          case 1:
            if (signed) {
              res = this.dataview.getInt8(this.position);
            } else {
              res = this.dataview.getUint8(this.position);
            }
            break;
          case 2:
            if (signed) {
              res = this.dataview.getInt16(this.position);
            } else {
              res = this.dataview.getUint16(this.position);
            }
            break;
          case 3:
            if (signed) {
              throw "No method for reading signed 24 bits values";
            } else {
              res = this.dataview.getUint8(this.position) << 16;
              res |= this.dataview.getUint8(this.position + 1) << 8;
              res |= this.dataview.getUint8(this.position + 2);
            }
            break;
          case 4:
            if (signed) {
              res = this.dataview.getInt32(this.position);
            } else {
              res = this.dataview.getUint32(this.position);
            }
            break;
          case 8:
            if (signed) {
              throw "No method for reading signed 64 bits values";
            } else {
              res = this.dataview.getUint32(this.position) << 32;
              res |= this.dataview.getUint32(this.position + 4);
            }
            break;
          default:
            throw "readInt method not implemented for size: " + size;
        }
        this.position += size;
        return res;
      } else {
        throw "Not enough bytes in buffer";
      }
    };
    MP4BoxStream2.prototype.readUint8 = function() {
      return this.readAnyInt(1, false);
    };
    MP4BoxStream2.prototype.readUint16 = function() {
      return this.readAnyInt(2, false);
    };
    MP4BoxStream2.prototype.readUint24 = function() {
      return this.readAnyInt(3, false);
    };
    MP4BoxStream2.prototype.readUint32 = function() {
      return this.readAnyInt(4, false);
    };
    MP4BoxStream2.prototype.readUint64 = function() {
      return this.readAnyInt(8, false);
    };
    MP4BoxStream2.prototype.readString = function(length) {
      if (this.position + length <= this.buffer.byteLength) {
        var s = "";
        for (var i2 = 0; i2 < length; i2++) {
          s += String.fromCharCode(this.readUint8());
        }
        return s;
      } else {
        throw "Not enough bytes in buffer";
      }
    };
    MP4BoxStream2.prototype.readCString = function() {
      var arr = [];
      while (true) {
        var b = this.readUint8();
        if (b !== 0) {
          arr.push(b);
        } else {
          break;
        }
      }
      return String.fromCharCode.apply(null, arr);
    };
    MP4BoxStream2.prototype.readInt8 = function() {
      return this.readAnyInt(1, true);
    };
    MP4BoxStream2.prototype.readInt16 = function() {
      return this.readAnyInt(2, true);
    };
    MP4BoxStream2.prototype.readInt32 = function() {
      return this.readAnyInt(4, true);
    };
    MP4BoxStream2.prototype.readInt64 = function() {
      return this.readAnyInt(8, false);
    };
    MP4BoxStream2.prototype.readUint8Array = function(length) {
      var arr = new Uint8Array(length);
      for (var i2 = 0; i2 < length; i2++) {
        arr[i2] = this.readUint8();
      }
      return arr;
    };
    MP4BoxStream2.prototype.readInt16Array = function(length) {
      var arr = new Int16Array(length);
      for (var i2 = 0; i2 < length; i2++) {
        arr[i2] = this.readInt16();
      }
      return arr;
    };
    MP4BoxStream2.prototype.readUint16Array = function(length) {
      var arr = new Int16Array(length);
      for (var i2 = 0; i2 < length; i2++) {
        arr[i2] = this.readUint16();
      }
      return arr;
    };
    MP4BoxStream2.prototype.readUint32Array = function(length) {
      var arr = new Uint32Array(length);
      for (var i2 = 0; i2 < length; i2++) {
        arr[i2] = this.readUint32();
      }
      return arr;
    };
    MP4BoxStream2.prototype.readInt32Array = function(length) {
      var arr = new Int32Array(length);
      for (var i2 = 0; i2 < length; i2++) {
        arr[i2] = this.readInt32();
      }
      return arr;
    };
    if (typeof exports !== "undefined") {
      exports.MP4BoxStream = MP4BoxStream2;
    }
    var DataStream4 = function(arrayBuffer, byteOffset, endianness) {
      this._byteOffset = byteOffset || 0;
      if (arrayBuffer instanceof ArrayBuffer) {
        this.buffer = arrayBuffer;
      } else if (typeof arrayBuffer == "object") {
        this.dataView = arrayBuffer;
        if (byteOffset) {
          this._byteOffset += byteOffset;
        }
      } else {
        this.buffer = new ArrayBuffer(arrayBuffer || 0);
      }
      this.position = 0;
      this.endianness = endianness == null ? DataStream4.LITTLE_ENDIAN : endianness;
    };
    DataStream4.prototype = {};
    DataStream4.prototype.getPosition = function() {
      return this.position;
    };
    DataStream4.prototype._realloc = function(extra) {
      if (!this._dynamicSize) {
        return;
      }
      var req = this._byteOffset + this.position + extra;
      var blen = this._buffer.byteLength;
      if (req <= blen) {
        if (req > this._byteLength) {
          this._byteLength = req;
        }
        return;
      }
      if (blen < 1) {
        blen = 1;
      }
      while (req > blen) {
        blen *= 2;
      }
      var buf = new ArrayBuffer(blen);
      var src = new Uint8Array(this._buffer);
      var dst = new Uint8Array(buf, 0, src.length);
      dst.set(src);
      this.buffer = buf;
      this._byteLength = req;
    };
    DataStream4.prototype._trimAlloc = function() {
      if (this._byteLength == this._buffer.byteLength) {
        return;
      }
      var buf = new ArrayBuffer(this._byteLength);
      var dst = new Uint8Array(buf);
      var src = new Uint8Array(this._buffer, 0, dst.length);
      dst.set(src);
      this.buffer = buf;
    };
    DataStream4.BIG_ENDIAN = false;
    DataStream4.LITTLE_ENDIAN = true;
    DataStream4.prototype._byteLength = 0;
    Object.defineProperty(
      DataStream4.prototype,
      "byteLength",
      { get: function() {
        return this._byteLength - this._byteOffset;
      } }
    );
    Object.defineProperty(
      DataStream4.prototype,
      "buffer",
      {
        get: function() {
          this._trimAlloc();
          return this._buffer;
        },
        set: function(v) {
          this._buffer = v;
          this._dataView = new DataView(this._buffer, this._byteOffset);
          this._byteLength = this._buffer.byteLength;
        }
      }
    );
    Object.defineProperty(
      DataStream4.prototype,
      "byteOffset",
      {
        get: function() {
          return this._byteOffset;
        },
        set: function(v) {
          this._byteOffset = v;
          this._dataView = new DataView(this._buffer, this._byteOffset);
          this._byteLength = this._buffer.byteLength;
        }
      }
    );
    Object.defineProperty(
      DataStream4.prototype,
      "dataView",
      {
        get: function() {
          return this._dataView;
        },
        set: function(v) {
          this._byteOffset = v.byteOffset;
          this._buffer = v.buffer;
          this._dataView = new DataView(this._buffer, this._byteOffset);
          this._byteLength = this._byteOffset + v.byteLength;
        }
      }
    );
    DataStream4.prototype.seek = function(pos) {
      var npos = Math.max(0, Math.min(this.byteLength, pos));
      this.position = isNaN(npos) || !isFinite(npos) ? 0 : npos;
    };
    DataStream4.prototype.isEof = function() {
      return this.position >= this._byteLength;
    };
    DataStream4.prototype.mapUint8Array = function(length) {
      this._realloc(length * 1);
      var arr = new Uint8Array(this._buffer, this.byteOffset + this.position, length);
      this.position += length * 1;
      return arr;
    };
    DataStream4.prototype.readInt32Array = function(length, e) {
      length = length == null ? this.byteLength - this.position / 4 : length;
      var arr = new Int32Array(length);
      DataStream4.memcpy(
        arr.buffer,
        0,
        this.buffer,
        this.byteOffset + this.position,
        length * arr.BYTES_PER_ELEMENT
      );
      DataStream4.arrayToNative(arr, e == null ? this.endianness : e);
      this.position += arr.byteLength;
      return arr;
    };
    DataStream4.prototype.readInt16Array = function(length, e) {
      length = length == null ? this.byteLength - this.position / 2 : length;
      var arr = new Int16Array(length);
      DataStream4.memcpy(
        arr.buffer,
        0,
        this.buffer,
        this.byteOffset + this.position,
        length * arr.BYTES_PER_ELEMENT
      );
      DataStream4.arrayToNative(arr, e == null ? this.endianness : e);
      this.position += arr.byteLength;
      return arr;
    };
    DataStream4.prototype.readInt8Array = function(length) {
      length = length == null ? this.byteLength - this.position : length;
      var arr = new Int8Array(length);
      DataStream4.memcpy(
        arr.buffer,
        0,
        this.buffer,
        this.byteOffset + this.position,
        length * arr.BYTES_PER_ELEMENT
      );
      this.position += arr.byteLength;
      return arr;
    };
    DataStream4.prototype.readUint32Array = function(length, e) {
      length = length == null ? this.byteLength - this.position / 4 : length;
      var arr = new Uint32Array(length);
      DataStream4.memcpy(
        arr.buffer,
        0,
        this.buffer,
        this.byteOffset + this.position,
        length * arr.BYTES_PER_ELEMENT
      );
      DataStream4.arrayToNative(arr, e == null ? this.endianness : e);
      this.position += arr.byteLength;
      return arr;
    };
    DataStream4.prototype.readUint16Array = function(length, e) {
      length = length == null ? this.byteLength - this.position / 2 : length;
      var arr = new Uint16Array(length);
      DataStream4.memcpy(
        arr.buffer,
        0,
        this.buffer,
        this.byteOffset + this.position,
        length * arr.BYTES_PER_ELEMENT
      );
      DataStream4.arrayToNative(arr, e == null ? this.endianness : e);
      this.position += arr.byteLength;
      return arr;
    };
    DataStream4.prototype.readUint8Array = function(length) {
      length = length == null ? this.byteLength - this.position : length;
      var arr = new Uint8Array(length);
      DataStream4.memcpy(
        arr.buffer,
        0,
        this.buffer,
        this.byteOffset + this.position,
        length * arr.BYTES_PER_ELEMENT
      );
      this.position += arr.byteLength;
      return arr;
    };
    DataStream4.prototype.readFloat64Array = function(length, e) {
      length = length == null ? this.byteLength - this.position / 8 : length;
      var arr = new Float64Array(length);
      DataStream4.memcpy(
        arr.buffer,
        0,
        this.buffer,
        this.byteOffset + this.position,
        length * arr.BYTES_PER_ELEMENT
      );
      DataStream4.arrayToNative(arr, e == null ? this.endianness : e);
      this.position += arr.byteLength;
      return arr;
    };
    DataStream4.prototype.readFloat32Array = function(length, e) {
      length = length == null ? this.byteLength - this.position / 4 : length;
      var arr = new Float32Array(length);
      DataStream4.memcpy(
        arr.buffer,
        0,
        this.buffer,
        this.byteOffset + this.position,
        length * arr.BYTES_PER_ELEMENT
      );
      DataStream4.arrayToNative(arr, e == null ? this.endianness : e);
      this.position += arr.byteLength;
      return arr;
    };
    DataStream4.prototype.readInt32 = function(e) {
      var v = this._dataView.getInt32(this.position, e == null ? this.endianness : e);
      this.position += 4;
      return v;
    };
    DataStream4.prototype.readInt16 = function(e) {
      var v = this._dataView.getInt16(this.position, e == null ? this.endianness : e);
      this.position += 2;
      return v;
    };
    DataStream4.prototype.readInt8 = function() {
      var v = this._dataView.getInt8(this.position);
      this.position += 1;
      return v;
    };
    DataStream4.prototype.readUint32 = function(e) {
      var v = this._dataView.getUint32(this.position, e == null ? this.endianness : e);
      this.position += 4;
      return v;
    };
    DataStream4.prototype.readUint16 = function(e) {
      var v = this._dataView.getUint16(this.position, e == null ? this.endianness : e);
      this.position += 2;
      return v;
    };
    DataStream4.prototype.readUint8 = function() {
      var v = this._dataView.getUint8(this.position);
      this.position += 1;
      return v;
    };
    DataStream4.prototype.readFloat32 = function(e) {
      var v = this._dataView.getFloat32(this.position, e == null ? this.endianness : e);
      this.position += 4;
      return v;
    };
    DataStream4.prototype.readFloat64 = function(e) {
      var v = this._dataView.getFloat64(this.position, e == null ? this.endianness : e);
      this.position += 8;
      return v;
    };
    DataStream4.endianness = new Int8Array(new Int16Array([1]).buffer)[0] > 0;
    DataStream4.memcpy = function(dst, dstOffset, src, srcOffset, byteLength) {
      var dstU8 = new Uint8Array(dst, dstOffset, byteLength);
      var srcU8 = new Uint8Array(src, srcOffset, byteLength);
      dstU8.set(srcU8);
    };
    DataStream4.arrayToNative = function(array, arrayIsLittleEndian) {
      if (arrayIsLittleEndian == this.endianness) {
        return array;
      } else {
        return this.flipArrayEndianness(array);
      }
    };
    DataStream4.nativeToEndian = function(array, littleEndian) {
      if (this.endianness == littleEndian) {
        return array;
      } else {
        return this.flipArrayEndianness(array);
      }
    };
    DataStream4.flipArrayEndianness = function(array) {
      var u8 = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
      for (var i2 = 0; i2 < array.byteLength; i2 += array.BYTES_PER_ELEMENT) {
        for (var j = i2 + array.BYTES_PER_ELEMENT - 1, k = i2; j > k; j--, k++) {
          var tmp = u8[k];
          u8[k] = u8[j];
          u8[j] = tmp;
        }
      }
      return array;
    };
    DataStream4.prototype.failurePosition = 0;
    String.fromCharCodeUint8 = function(uint8arr) {
      var arr = [];
      for (var i2 = 0; i2 < uint8arr.length; i2++) {
        arr[i2] = uint8arr[i2];
      }
      return String.fromCharCode.apply(null, arr);
    };
    DataStream4.prototype.readString = function(length, encoding) {
      if (encoding == null || encoding == "ASCII") {
        return String.fromCharCodeUint8.apply(null, [this.mapUint8Array(length == null ? this.byteLength - this.position : length)]);
      } else {
        return new TextDecoder(encoding).decode(this.mapUint8Array(length));
      }
    };
    DataStream4.prototype.readCString = function(length) {
      var blen = this.byteLength - this.position;
      var u8 = new Uint8Array(this._buffer, this._byteOffset + this.position);
      var len = blen;
      if (length != null) {
        len = Math.min(length, blen);
      }
      for (var i2 = 0; i2 < len && u8[i2] !== 0; i2++)
        ;
      var s = String.fromCharCodeUint8.apply(null, [this.mapUint8Array(i2)]);
      if (length != null) {
        this.position += len - i2;
      } else if (i2 != blen) {
        this.position += 1;
      }
      return s;
    };
    var MAX_SIZE = Math.pow(2, 32);
    DataStream4.prototype.readInt64 = function() {
      return this.readInt32() * MAX_SIZE + this.readUint32();
    };
    DataStream4.prototype.readUint64 = function() {
      return this.readUint32() * MAX_SIZE + this.readUint32();
    };
    DataStream4.prototype.readInt64 = function() {
      return this.readUint32() * MAX_SIZE + this.readUint32();
    };
    DataStream4.prototype.readUint24 = function() {
      return (this.readUint8() << 16) + (this.readUint8() << 8) + this.readUint8();
    };
    if (typeof exports !== "undefined") {
      exports.DataStream = DataStream4;
    }
    DataStream4.prototype.save = function(filename) {
      var blob = new Blob([this.buffer]);
      if (window.URL && URL.createObjectURL) {
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement("a");
        document.body.appendChild(a);
        a.setAttribute("href", url);
        a.setAttribute("download", filename);
        a.setAttribute("target", "_self");
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        throw "DataStream.save: Can't create object URL.";
      }
    };
    DataStream4.prototype._dynamicSize = true;
    Object.defineProperty(
      DataStream4.prototype,
      "dynamicSize",
      {
        get: function() {
          return this._dynamicSize;
        },
        set: function(v) {
          if (!v) {
            this._trimAlloc();
          }
          this._dynamicSize = v;
        }
      }
    );
    DataStream4.prototype.shift = function(offset) {
      var buf = new ArrayBuffer(this._byteLength - offset);
      var dst = new Uint8Array(buf);
      var src = new Uint8Array(this._buffer, offset, dst.length);
      dst.set(src);
      this.buffer = buf;
      this.position -= offset;
    };
    DataStream4.prototype.writeInt32Array = function(arr, e) {
      this._realloc(arr.length * 4);
      if (arr instanceof Int32Array && this.byteOffset + this.position % arr.BYTES_PER_ELEMENT === 0) {
        DataStream4.memcpy(
          this._buffer,
          this.byteOffset + this.position,
          arr.buffer,
          0,
          arr.byteLength
        );
        this.mapInt32Array(arr.length, e);
      } else {
        for (var i2 = 0; i2 < arr.length; i2++) {
          this.writeInt32(arr[i2], e);
        }
      }
    };
    DataStream4.prototype.writeInt16Array = function(arr, e) {
      this._realloc(arr.length * 2);
      if (arr instanceof Int16Array && this.byteOffset + this.position % arr.BYTES_PER_ELEMENT === 0) {
        DataStream4.memcpy(
          this._buffer,
          this.byteOffset + this.position,
          arr.buffer,
          0,
          arr.byteLength
        );
        this.mapInt16Array(arr.length, e);
      } else {
        for (var i2 = 0; i2 < arr.length; i2++) {
          this.writeInt16(arr[i2], e);
        }
      }
    };
    DataStream4.prototype.writeInt8Array = function(arr) {
      this._realloc(arr.length * 1);
      if (arr instanceof Int8Array && this.byteOffset + this.position % arr.BYTES_PER_ELEMENT === 0) {
        DataStream4.memcpy(
          this._buffer,
          this.byteOffset + this.position,
          arr.buffer,
          0,
          arr.byteLength
        );
        this.mapInt8Array(arr.length);
      } else {
        for (var i2 = 0; i2 < arr.length; i2++) {
          this.writeInt8(arr[i2]);
        }
      }
    };
    DataStream4.prototype.writeUint32Array = function(arr, e) {
      this._realloc(arr.length * 4);
      if (arr instanceof Uint32Array && this.byteOffset + this.position % arr.BYTES_PER_ELEMENT === 0) {
        DataStream4.memcpy(
          this._buffer,
          this.byteOffset + this.position,
          arr.buffer,
          0,
          arr.byteLength
        );
        this.mapUint32Array(arr.length, e);
      } else {
        for (var i2 = 0; i2 < arr.length; i2++) {
          this.writeUint32(arr[i2], e);
        }
      }
    };
    DataStream4.prototype.writeUint16Array = function(arr, e) {
      this._realloc(arr.length * 2);
      if (arr instanceof Uint16Array && this.byteOffset + this.position % arr.BYTES_PER_ELEMENT === 0) {
        DataStream4.memcpy(
          this._buffer,
          this.byteOffset + this.position,
          arr.buffer,
          0,
          arr.byteLength
        );
        this.mapUint16Array(arr.length, e);
      } else {
        for (var i2 = 0; i2 < arr.length; i2++) {
          this.writeUint16(arr[i2], e);
        }
      }
    };
    DataStream4.prototype.writeUint8Array = function(arr) {
      this._realloc(arr.length * 1);
      if (arr instanceof Uint8Array && this.byteOffset + this.position % arr.BYTES_PER_ELEMENT === 0) {
        DataStream4.memcpy(
          this._buffer,
          this.byteOffset + this.position,
          arr.buffer,
          0,
          arr.byteLength
        );
        this.mapUint8Array(arr.length);
      } else {
        for (var i2 = 0; i2 < arr.length; i2++) {
          this.writeUint8(arr[i2]);
        }
      }
    };
    DataStream4.prototype.writeFloat64Array = function(arr, e) {
      this._realloc(arr.length * 8);
      if (arr instanceof Float64Array && this.byteOffset + this.position % arr.BYTES_PER_ELEMENT === 0) {
        DataStream4.memcpy(
          this._buffer,
          this.byteOffset + this.position,
          arr.buffer,
          0,
          arr.byteLength
        );
        this.mapFloat64Array(arr.length, e);
      } else {
        for (var i2 = 0; i2 < arr.length; i2++) {
          this.writeFloat64(arr[i2], e);
        }
      }
    };
    DataStream4.prototype.writeFloat32Array = function(arr, e) {
      this._realloc(arr.length * 4);
      if (arr instanceof Float32Array && this.byteOffset + this.position % arr.BYTES_PER_ELEMENT === 0) {
        DataStream4.memcpy(
          this._buffer,
          this.byteOffset + this.position,
          arr.buffer,
          0,
          arr.byteLength
        );
        this.mapFloat32Array(arr.length, e);
      } else {
        for (var i2 = 0; i2 < arr.length; i2++) {
          this.writeFloat32(arr[i2], e);
        }
      }
    };
    DataStream4.prototype.writeInt32 = function(v, e) {
      this._realloc(4);
      this._dataView.setInt32(this.position, v, e == null ? this.endianness : e);
      this.position += 4;
    };
    DataStream4.prototype.writeInt16 = function(v, e) {
      this._realloc(2);
      this._dataView.setInt16(this.position, v, e == null ? this.endianness : e);
      this.position += 2;
    };
    DataStream4.prototype.writeInt8 = function(v) {
      this._realloc(1);
      this._dataView.setInt8(this.position, v);
      this.position += 1;
    };
    DataStream4.prototype.writeUint32 = function(v, e) {
      this._realloc(4);
      this._dataView.setUint32(this.position, v, e == null ? this.endianness : e);
      this.position += 4;
    };
    DataStream4.prototype.writeUint16 = function(v, e) {
      this._realloc(2);
      this._dataView.setUint16(this.position, v, e == null ? this.endianness : e);
      this.position += 2;
    };
    DataStream4.prototype.writeUint8 = function(v) {
      this._realloc(1);
      this._dataView.setUint8(this.position, v);
      this.position += 1;
    };
    DataStream4.prototype.writeFloat32 = function(v, e) {
      this._realloc(4);
      this._dataView.setFloat32(this.position, v, e == null ? this.endianness : e);
      this.position += 4;
    };
    DataStream4.prototype.writeFloat64 = function(v, e) {
      this._realloc(8);
      this._dataView.setFloat64(this.position, v, e == null ? this.endianness : e);
      this.position += 8;
    };
    DataStream4.prototype.writeUCS2String = function(str, endianness, lengthOverride) {
      if (lengthOverride == null) {
        lengthOverride = str.length;
      }
      for (var i2 = 0; i2 < str.length && i2 < lengthOverride; i2++) {
        this.writeUint16(str.charCodeAt(i2), endianness);
      }
      for (; i2 < lengthOverride; i2++) {
        this.writeUint16(0);
      }
    };
    DataStream4.prototype.writeString = function(s, encoding, length) {
      var i2 = 0;
      if (encoding == null || encoding == "ASCII") {
        if (length != null) {
          var len = Math.min(s.length, length);
          for (i2 = 0; i2 < len; i2++) {
            this.writeUint8(s.charCodeAt(i2));
          }
          for (; i2 < length; i2++) {
            this.writeUint8(0);
          }
        } else {
          for (i2 = 0; i2 < s.length; i2++) {
            this.writeUint8(s.charCodeAt(i2));
          }
        }
      } else {
        this.writeUint8Array(new TextEncoder(encoding).encode(s.substring(0, length)));
      }
    };
    DataStream4.prototype.writeCString = function(s, length) {
      var i2 = 0;
      if (length != null) {
        var len = Math.min(s.length, length);
        for (i2 = 0; i2 < len; i2++) {
          this.writeUint8(s.charCodeAt(i2));
        }
        for (; i2 < length; i2++) {
          this.writeUint8(0);
        }
      } else {
        for (i2 = 0; i2 < s.length; i2++) {
          this.writeUint8(s.charCodeAt(i2));
        }
        this.writeUint8(0);
      }
    };
    DataStream4.prototype.writeStruct = function(structDefinition, struct) {
      for (var i2 = 0; i2 < structDefinition.length; i2 += 2) {
        var t = structDefinition[i2 + 1];
        this.writeType(t, struct[structDefinition[i2]], struct);
      }
    };
    DataStream4.prototype.writeType = function(t, v, struct) {
      var tp;
      if (typeof t == "function") {
        return t(this, v);
      } else if (typeof t == "object" && !(t instanceof Array)) {
        return t.set(this, v, struct);
      }
      var lengthOverride = null;
      var charset = "ASCII";
      var pos = this.position;
      if (typeof t == "string" && /:/.test(t)) {
        tp = t.split(":");
        t = tp[0];
        lengthOverride = parseInt(tp[1]);
      }
      if (typeof t == "string" && /,/.test(t)) {
        tp = t.split(",");
        t = tp[0];
        charset = parseInt(tp[1]);
      }
      switch (t) {
        case "uint8":
          this.writeUint8(v);
          break;
        case "int8":
          this.writeInt8(v);
          break;
        case "uint16":
          this.writeUint16(v, this.endianness);
          break;
        case "int16":
          this.writeInt16(v, this.endianness);
          break;
        case "uint32":
          this.writeUint32(v, this.endianness);
          break;
        case "int32":
          this.writeInt32(v, this.endianness);
          break;
        case "float32":
          this.writeFloat32(v, this.endianness);
          break;
        case "float64":
          this.writeFloat64(v, this.endianness);
          break;
        case "uint16be":
          this.writeUint16(v, DataStream4.BIG_ENDIAN);
          break;
        case "int16be":
          this.writeInt16(v, DataStream4.BIG_ENDIAN);
          break;
        case "uint32be":
          this.writeUint32(v, DataStream4.BIG_ENDIAN);
          break;
        case "int32be":
          this.writeInt32(v, DataStream4.BIG_ENDIAN);
          break;
        case "float32be":
          this.writeFloat32(v, DataStream4.BIG_ENDIAN);
          break;
        case "float64be":
          this.writeFloat64(v, DataStream4.BIG_ENDIAN);
          break;
        case "uint16le":
          this.writeUint16(v, DataStream4.LITTLE_ENDIAN);
          break;
        case "int16le":
          this.writeInt16(v, DataStream4.LITTLE_ENDIAN);
          break;
        case "uint32le":
          this.writeUint32(v, DataStream4.LITTLE_ENDIAN);
          break;
        case "int32le":
          this.writeInt32(v, DataStream4.LITTLE_ENDIAN);
          break;
        case "float32le":
          this.writeFloat32(v, DataStream4.LITTLE_ENDIAN);
          break;
        case "float64le":
          this.writeFloat64(v, DataStream4.LITTLE_ENDIAN);
          break;
        case "cstring":
          this.writeCString(v, lengthOverride);
          break;
        case "string":
          this.writeString(v, charset, lengthOverride);
          break;
        case "u16string":
          this.writeUCS2String(v, this.endianness, lengthOverride);
          break;
        case "u16stringle":
          this.writeUCS2String(v, DataStream4.LITTLE_ENDIAN, lengthOverride);
          break;
        case "u16stringbe":
          this.writeUCS2String(v, DataStream4.BIG_ENDIAN, lengthOverride);
          break;
        default:
          if (t.length == 3) {
            var ta = t[1];
            for (var i2 = 0; i2 < v.length; i2++) {
              this.writeType(ta, v[i2]);
            }
            break;
          } else {
            this.writeStruct(t, v);
            break;
          }
      }
      if (lengthOverride != null) {
        this.position = pos;
        this._realloc(lengthOverride);
        this.position = pos + lengthOverride;
      }
    };
    DataStream4.prototype.writeUint64 = function(v) {
      var h = Math.floor(v / MAX_SIZE);
      this.writeUint32(h);
      this.writeUint32(v & 4294967295);
    };
    DataStream4.prototype.writeUint24 = function(v) {
      this.writeUint8((v & 16711680) >> 16);
      this.writeUint8((v & 65280) >> 8);
      this.writeUint8(v & 255);
    };
    DataStream4.prototype.adjustUint32 = function(position, value) {
      var pos = this.position;
      this.seek(position);
      this.writeUint32(value);
      this.seek(pos);
    };
    DataStream4.prototype.mapInt32Array = function(length, e) {
      this._realloc(length * 4);
      var arr = new Int32Array(this._buffer, this.byteOffset + this.position, length);
      DataStream4.arrayToNative(arr, e == null ? this.endianness : e);
      this.position += length * 4;
      return arr;
    };
    DataStream4.prototype.mapInt16Array = function(length, e) {
      this._realloc(length * 2);
      var arr = new Int16Array(this._buffer, this.byteOffset + this.position, length);
      DataStream4.arrayToNative(arr, e == null ? this.endianness : e);
      this.position += length * 2;
      return arr;
    };
    DataStream4.prototype.mapInt8Array = function(length) {
      this._realloc(length * 1);
      var arr = new Int8Array(this._buffer, this.byteOffset + this.position, length);
      this.position += length * 1;
      return arr;
    };
    DataStream4.prototype.mapUint32Array = function(length, e) {
      this._realloc(length * 4);
      var arr = new Uint32Array(this._buffer, this.byteOffset + this.position, length);
      DataStream4.arrayToNative(arr, e == null ? this.endianness : e);
      this.position += length * 4;
      return arr;
    };
    DataStream4.prototype.mapUint16Array = function(length, e) {
      this._realloc(length * 2);
      var arr = new Uint16Array(this._buffer, this.byteOffset + this.position, length);
      DataStream4.arrayToNative(arr, e == null ? this.endianness : e);
      this.position += length * 2;
      return arr;
    };
    DataStream4.prototype.mapFloat64Array = function(length, e) {
      this._realloc(length * 8);
      var arr = new Float64Array(this._buffer, this.byteOffset + this.position, length);
      DataStream4.arrayToNative(arr, e == null ? this.endianness : e);
      this.position += length * 8;
      return arr;
    };
    DataStream4.prototype.mapFloat32Array = function(length, e) {
      this._realloc(length * 4);
      var arr = new Float32Array(this._buffer, this.byteOffset + this.position, length);
      DataStream4.arrayToNative(arr, e == null ? this.endianness : e);
      this.position += length * 4;
      return arr;
    };
    var MultiBufferStream = function(buffer) {
      this.buffers = [];
      this.bufferIndex = -1;
      if (buffer) {
        this.insertBuffer(buffer);
        this.bufferIndex = 0;
      }
    };
    MultiBufferStream.prototype = new DataStream4(new ArrayBuffer(), 0, DataStream4.BIG_ENDIAN);
    MultiBufferStream.prototype.initialized = function() {
      var firstBuffer;
      if (this.bufferIndex > -1) {
        return true;
      } else if (this.buffers.length > 0) {
        firstBuffer = this.buffers[0];
        if (firstBuffer.fileStart === 0) {
          this.buffer = firstBuffer;
          this.bufferIndex = 0;
          Log2.debug("MultiBufferStream", "Stream ready for parsing");
          return true;
        } else {
          Log2.warn("MultiBufferStream", "The first buffer should have a fileStart of 0");
          this.logBufferLevel();
          return false;
        }
      } else {
        Log2.warn("MultiBufferStream", "No buffer to start parsing from");
        this.logBufferLevel();
        return false;
      }
    };
    ArrayBuffer.concat = function(buffer1, buffer2) {
      Log2.debug("ArrayBuffer", "Trying to create a new buffer of size: " + (buffer1.byteLength + buffer2.byteLength));
      var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
      tmp.set(new Uint8Array(buffer1), 0);
      tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
      return tmp.buffer;
    };
    MultiBufferStream.prototype.reduceBuffer = function(buffer, offset, newLength) {
      var smallB;
      smallB = new Uint8Array(newLength);
      smallB.set(new Uint8Array(buffer, offset, newLength));
      smallB.buffer.fileStart = buffer.fileStart + offset;
      smallB.buffer.usedBytes = 0;
      return smallB.buffer;
    };
    MultiBufferStream.prototype.insertBuffer = function(ab) {
      var to_add = true;
      for (var i2 = 0; i2 < this.buffers.length; i2++) {
        var b = this.buffers[i2];
        if (ab.fileStart <= b.fileStart) {
          if (ab.fileStart === b.fileStart) {
            if (ab.byteLength > b.byteLength) {
              this.buffers.splice(i2, 1);
              i2--;
              continue;
            } else {
              Log2.warn("MultiBufferStream", "Buffer (fileStart: " + ab.fileStart + " - Length: " + ab.byteLength + ") already appended, ignoring");
            }
          } else {
            if (ab.fileStart + ab.byteLength <= b.fileStart) {
            } else {
              ab = this.reduceBuffer(ab, 0, b.fileStart - ab.fileStart);
            }
            Log2.debug("MultiBufferStream", "Appending new buffer (fileStart: " + ab.fileStart + " - Length: " + ab.byteLength + ")");
            this.buffers.splice(i2, 0, ab);
            if (i2 === 0) {
              this.buffer = ab;
            }
          }
          to_add = false;
          break;
        } else if (ab.fileStart < b.fileStart + b.byteLength) {
          var offset = b.fileStart + b.byteLength - ab.fileStart;
          var newLength = ab.byteLength - offset;
          if (newLength > 0) {
            ab = this.reduceBuffer(ab, offset, newLength);
          } else {
            to_add = false;
            break;
          }
        }
      }
      if (to_add) {
        Log2.debug("MultiBufferStream", "Appending new buffer (fileStart: " + ab.fileStart + " - Length: " + ab.byteLength + ")");
        this.buffers.push(ab);
        if (i2 === 0) {
          this.buffer = ab;
        }
      }
    };
    MultiBufferStream.prototype.logBufferLevel = function(info) {
      var i2;
      var buffer;
      var used, total;
      var ranges = [];
      var range;
      var bufferedString = "";
      used = 0;
      total = 0;
      for (i2 = 0; i2 < this.buffers.length; i2++) {
        buffer = this.buffers[i2];
        if (i2 === 0) {
          range = {};
          ranges.push(range);
          range.start = buffer.fileStart;
          range.end = buffer.fileStart + buffer.byteLength;
          bufferedString += "[" + range.start + "-";
        } else if (range.end === buffer.fileStart) {
          range.end = buffer.fileStart + buffer.byteLength;
        } else {
          range = {};
          range.start = buffer.fileStart;
          bufferedString += ranges[ranges.length - 1].end - 1 + "], [" + range.start + "-";
          range.end = buffer.fileStart + buffer.byteLength;
          ranges.push(range);
        }
        used += buffer.usedBytes;
        total += buffer.byteLength;
      }
      if (ranges.length > 0) {
        bufferedString += range.end - 1 + "]";
      }
      var log = info ? Log2.info : Log2.debug;
      if (this.buffers.length === 0) {
        log("MultiBufferStream", "No more buffer in memory");
      } else {
        log("MultiBufferStream", "" + this.buffers.length + " stored buffer(s) (" + used + "/" + total + " bytes), continuous ranges: " + bufferedString);
      }
    };
    MultiBufferStream.prototype.cleanBuffers = function() {
      var i2;
      var buffer;
      for (i2 = 0; i2 < this.buffers.length; i2++) {
        buffer = this.buffers[i2];
        if (buffer.usedBytes === buffer.byteLength) {
          Log2.debug("MultiBufferStream", "Removing buffer #" + i2);
          this.buffers.splice(i2, 1);
          i2--;
        }
      }
    };
    MultiBufferStream.prototype.mergeNextBuffer = function() {
      var next_buffer;
      if (this.bufferIndex + 1 < this.buffers.length) {
        next_buffer = this.buffers[this.bufferIndex + 1];
        if (next_buffer.fileStart === this.buffer.fileStart + this.buffer.byteLength) {
          var oldLength = this.buffer.byteLength;
          var oldUsedBytes = this.buffer.usedBytes;
          var oldFileStart = this.buffer.fileStart;
          this.buffers[this.bufferIndex] = ArrayBuffer.concat(this.buffer, next_buffer);
          this.buffer = this.buffers[this.bufferIndex];
          this.buffers.splice(this.bufferIndex + 1, 1);
          this.buffer.usedBytes = oldUsedBytes;
          this.buffer.fileStart = oldFileStart;
          Log2.debug("ISOFile", "Concatenating buffer for box parsing (length: " + oldLength + "->" + this.buffer.byteLength + ")");
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    };
    MultiBufferStream.prototype.findPosition = function(fromStart, filePosition, markAsUsed) {
      var i2;
      var abuffer = null;
      var index = -1;
      if (fromStart === true) {
        i2 = 0;
      } else {
        i2 = this.bufferIndex;
      }
      while (i2 < this.buffers.length) {
        abuffer = this.buffers[i2];
        if (abuffer.fileStart <= filePosition) {
          index = i2;
          if (markAsUsed) {
            if (abuffer.fileStart + abuffer.byteLength <= filePosition) {
              abuffer.usedBytes = abuffer.byteLength;
            } else {
              abuffer.usedBytes = filePosition - abuffer.fileStart;
            }
            this.logBufferLevel();
          }
        } else {
          break;
        }
        i2++;
      }
      if (index !== -1) {
        abuffer = this.buffers[index];
        if (abuffer.fileStart + abuffer.byteLength >= filePosition) {
          Log2.debug("MultiBufferStream", "Found position in existing buffer #" + index);
          return index;
        } else {
          return -1;
        }
      } else {
        return -1;
      }
    };
    MultiBufferStream.prototype.findEndContiguousBuf = function(inputindex) {
      var i2;
      var currentBuf;
      var nextBuf;
      var index = inputindex !== void 0 ? inputindex : this.bufferIndex;
      currentBuf = this.buffers[index];
      if (this.buffers.length > index + 1) {
        for (i2 = index + 1; i2 < this.buffers.length; i2++) {
          nextBuf = this.buffers[i2];
          if (nextBuf.fileStart === currentBuf.fileStart + currentBuf.byteLength) {
            currentBuf = nextBuf;
          } else {
            break;
          }
        }
      }
      return currentBuf.fileStart + currentBuf.byteLength;
    };
    MultiBufferStream.prototype.getEndFilePositionAfter = function(pos) {
      var index = this.findPosition(true, pos, false);
      if (index !== -1) {
        return this.findEndContiguousBuf(index);
      } else {
        return pos;
      }
    };
    MultiBufferStream.prototype.addUsedBytes = function(nbBytes) {
      this.buffer.usedBytes += nbBytes;
      this.logBufferLevel();
    };
    MultiBufferStream.prototype.setAllUsedBytes = function() {
      this.buffer.usedBytes = this.buffer.byteLength;
      this.logBufferLevel();
    };
    MultiBufferStream.prototype.seek = function(filePosition, fromStart, markAsUsed) {
      var index;
      index = this.findPosition(fromStart, filePosition, markAsUsed);
      if (index !== -1) {
        this.buffer = this.buffers[index];
        this.bufferIndex = index;
        this.position = filePosition - this.buffer.fileStart;
        Log2.debug("MultiBufferStream", "Repositioning parser at buffer position: " + this.position);
        return true;
      } else {
        Log2.debug("MultiBufferStream", "Position " + filePosition + " not found in buffered data");
        return false;
      }
    };
    MultiBufferStream.prototype.getPosition = function() {
      if (this.bufferIndex === -1 || this.buffers[this.bufferIndex] === null) {
        throw "Error accessing position in the MultiBufferStream";
      }
      return this.buffers[this.bufferIndex].fileStart + this.position;
    };
    MultiBufferStream.prototype.getLength = function() {
      return this.byteLength;
    };
    MultiBufferStream.prototype.getEndPosition = function() {
      if (this.bufferIndex === -1 || this.buffers[this.bufferIndex] === null) {
        throw "Error accessing position in the MultiBufferStream";
      }
      return this.buffers[this.bufferIndex].fileStart + this.byteLength;
    };
    if (typeof exports !== "undefined") {
      exports.MultiBufferStream = MultiBufferStream;
    }
    var MPEG4DescriptorParser = function() {
      var ES_DescrTag = 3;
      var DecoderConfigDescrTag = 4;
      var DecSpecificInfoTag = 5;
      var SLConfigDescrTag = 6;
      var descTagToName = [];
      descTagToName[ES_DescrTag] = "ES_Descriptor";
      descTagToName[DecoderConfigDescrTag] = "DecoderConfigDescriptor";
      descTagToName[DecSpecificInfoTag] = "DecoderSpecificInfo";
      descTagToName[SLConfigDescrTag] = "SLConfigDescriptor";
      this.getDescriptorName = function(tag) {
        return descTagToName[tag];
      };
      var that = this;
      var classes = {};
      this.parseOneDescriptor = function(stream) {
        var hdrSize = 0;
        var size = 0;
        var tag;
        var desc;
        var byteRead;
        tag = stream.readUint8();
        hdrSize++;
        byteRead = stream.readUint8();
        hdrSize++;
        while (byteRead & 128) {
          size = (byteRead & 127) << 7;
          byteRead = stream.readUint8();
          hdrSize++;
        }
        size += byteRead & 127;
        Log2.debug("MPEG4DescriptorParser", "Found " + (descTagToName[tag] || "Descriptor " + tag) + ", size " + size + " at position " + stream.getPosition());
        if (descTagToName[tag]) {
          desc = new classes[descTagToName[tag]](size);
        } else {
          desc = new classes.Descriptor(size);
        }
        desc.parse(stream);
        return desc;
      };
      classes.Descriptor = function(_tag, _size) {
        this.tag = _tag;
        this.size = _size;
        this.descs = [];
      };
      classes.Descriptor.prototype.parse = function(stream) {
        this.data = stream.readUint8Array(this.size);
      };
      classes.Descriptor.prototype.findDescriptor = function(tag) {
        for (var i2 = 0; i2 < this.descs.length; i2++) {
          if (this.descs[i2].tag == tag) {
            return this.descs[i2];
          }
        }
        return null;
      };
      classes.Descriptor.prototype.parseRemainingDescriptors = function(stream) {
        var start = stream.position;
        while (stream.position < start + this.size) {
          var desc = that.parseOneDescriptor(stream);
          this.descs.push(desc);
        }
      };
      classes.ES_Descriptor = function(size) {
        classes.Descriptor.call(this, ES_DescrTag, size);
      };
      classes.ES_Descriptor.prototype = new classes.Descriptor();
      classes.ES_Descriptor.prototype.parse = function(stream) {
        this.ES_ID = stream.readUint16();
        this.flags = stream.readUint8();
        this.size -= 3;
        if (this.flags & 128) {
          this.dependsOn_ES_ID = stream.readUint16();
          this.size -= 2;
        } else {
          this.dependsOn_ES_ID = 0;
        }
        if (this.flags & 64) {
          var l = stream.readUint8();
          this.URL = stream.readString(l);
          this.size -= l + 1;
        } else {
          this.URL = "";
        }
        if (this.flags & 32) {
          this.OCR_ES_ID = stream.readUint16();
          this.size -= 2;
        } else {
          this.OCR_ES_ID = 0;
        }
        this.parseRemainingDescriptors(stream);
      };
      classes.ES_Descriptor.prototype.getOTI = function(stream) {
        var dcd = this.findDescriptor(DecoderConfigDescrTag);
        if (dcd) {
          return dcd.oti;
        } else {
          return 0;
        }
      };
      classes.ES_Descriptor.prototype.getAudioConfig = function(stream) {
        var dcd = this.findDescriptor(DecoderConfigDescrTag);
        if (!dcd)
          return null;
        var dsi = dcd.findDescriptor(DecSpecificInfoTag);
        if (dsi && dsi.data) {
          var audioObjectType = (dsi.data[0] & 248) >> 3;
          if (audioObjectType === 31 && dsi.data.length >= 2) {
            audioObjectType = 32 + ((dsi.data[0] & 7) << 3) + ((dsi.data[1] & 224) >> 5);
          }
          return audioObjectType;
        } else {
          return null;
        }
      };
      classes.DecoderConfigDescriptor = function(size) {
        classes.Descriptor.call(this, DecoderConfigDescrTag, size);
      };
      classes.DecoderConfigDescriptor.prototype = new classes.Descriptor();
      classes.DecoderConfigDescriptor.prototype.parse = function(stream) {
        this.oti = stream.readUint8();
        this.streamType = stream.readUint8();
        this.bufferSize = stream.readUint24();
        this.maxBitrate = stream.readUint32();
        this.avgBitrate = stream.readUint32();
        this.size -= 13;
        this.parseRemainingDescriptors(stream);
      };
      classes.DecoderSpecificInfo = function(size) {
        classes.Descriptor.call(this, DecSpecificInfoTag, size);
      };
      classes.DecoderSpecificInfo.prototype = new classes.Descriptor();
      classes.SLConfigDescriptor = function(size) {
        classes.Descriptor.call(this, SLConfigDescrTag, size);
      };
      classes.SLConfigDescriptor.prototype = new classes.Descriptor();
      return this;
    };
    if (typeof exports !== "undefined") {
      exports.MPEG4DescriptorParser = MPEG4DescriptorParser;
    }
    var BoxParser4 = {
      ERR_INVALID_DATA: -1,
      ERR_NOT_ENOUGH_DATA: 0,
      OK: 1,
      // Boxes to be created with default parsing
      BASIC_BOXES: ["mdat", "idat", "free", "skip", "meco", "strk"],
      FULL_BOXES: ["hmhd", "nmhd", "iods", "xml ", "bxml", "ipro", "mere"],
      CONTAINER_BOXES: [
        ["moov", ["trak", "pssh"]],
        ["trak"],
        ["edts"],
        ["mdia"],
        ["minf"],
        ["dinf"],
        ["stbl", ["sgpd", "sbgp"]],
        ["mvex", ["trex"]],
        ["moof", ["traf"]],
        ["traf", ["trun", "sgpd", "sbgp"]],
        ["vttc"],
        ["tref"],
        ["iref"],
        ["mfra", ["tfra"]],
        ["meco"],
        ["hnti"],
        ["hinf"],
        ["strk"],
        ["strd"],
        ["sinf"],
        ["rinf"],
        ["schi"],
        ["trgr"],
        ["udta", ["kind"]],
        ["iprp", ["ipma"]],
        ["ipco"],
        ["grpl"],
        ["j2kH"],
        ["etyp", ["tyco"]]
      ],
      // Boxes effectively created
      boxCodes: [],
      fullBoxCodes: [],
      containerBoxCodes: [],
      sampleEntryCodes: {},
      sampleGroupEntryCodes: [],
      trackGroupTypes: [],
      UUIDBoxes: {},
      UUIDs: [],
      initialize: function() {
        BoxParser4.FullBox.prototype = new BoxParser4.Box();
        BoxParser4.ContainerBox.prototype = new BoxParser4.Box();
        BoxParser4.SampleEntry.prototype = new BoxParser4.Box();
        BoxParser4.TrackGroupTypeBox.prototype = new BoxParser4.FullBox();
        BoxParser4.BASIC_BOXES.forEach(function(type) {
          BoxParser4.createBoxCtor(type);
        });
        BoxParser4.FULL_BOXES.forEach(function(type) {
          BoxParser4.createFullBoxCtor(type);
        });
        BoxParser4.CONTAINER_BOXES.forEach(function(types) {
          BoxParser4.createContainerBoxCtor(types[0], null, types[1]);
        });
      },
      Box: function(_type, _size, _uuid) {
        this.type = _type;
        this.size = _size;
        this.uuid = _uuid;
      },
      FullBox: function(type, size, uuid) {
        BoxParser4.Box.call(this, type, size, uuid);
        this.flags = 0;
        this.version = 0;
      },
      ContainerBox: function(type, size, uuid) {
        BoxParser4.Box.call(this, type, size, uuid);
        this.boxes = [];
      },
      SampleEntry: function(type, size, hdr_size, start) {
        BoxParser4.ContainerBox.call(this, type, size);
        this.hdr_size = hdr_size;
        this.start = start;
      },
      SampleGroupEntry: function(type) {
        this.grouping_type = type;
      },
      TrackGroupTypeBox: function(type, size) {
        BoxParser4.FullBox.call(this, type, size);
      },
      createBoxCtor: function(type, parseMethod) {
        BoxParser4.boxCodes.push(type);
        BoxParser4[type + "Box"] = function(size) {
          BoxParser4.Box.call(this, type, size);
        };
        BoxParser4[type + "Box"].prototype = new BoxParser4.Box();
        if (parseMethod)
          BoxParser4[type + "Box"].prototype.parse = parseMethod;
      },
      createFullBoxCtor: function(type, parseMethod) {
        BoxParser4[type + "Box"] = function(size) {
          BoxParser4.FullBox.call(this, type, size);
        };
        BoxParser4[type + "Box"].prototype = new BoxParser4.FullBox();
        BoxParser4[type + "Box"].prototype.parse = function(stream) {
          this.parseFullHeader(stream);
          if (parseMethod) {
            parseMethod.call(this, stream);
          }
        };
      },
      addSubBoxArrays: function(subBoxNames) {
        if (subBoxNames) {
          this.subBoxNames = subBoxNames;
          var nbSubBoxes = subBoxNames.length;
          for (var k = 0; k < nbSubBoxes; k++) {
            this[subBoxNames[k] + "s"] = [];
          }
        }
      },
      createContainerBoxCtor: function(type, parseMethod, subBoxNames) {
        BoxParser4[type + "Box"] = function(size) {
          BoxParser4.ContainerBox.call(this, type, size);
          BoxParser4.addSubBoxArrays.call(this, subBoxNames);
        };
        BoxParser4[type + "Box"].prototype = new BoxParser4.ContainerBox();
        if (parseMethod)
          BoxParser4[type + "Box"].prototype.parse = parseMethod;
      },
      createMediaSampleEntryCtor: function(mediaType, parseMethod, subBoxNames) {
        BoxParser4.sampleEntryCodes[mediaType] = [];
        BoxParser4[mediaType + "SampleEntry"] = function(type, size) {
          BoxParser4.SampleEntry.call(this, type, size);
          BoxParser4.addSubBoxArrays.call(this, subBoxNames);
        };
        BoxParser4[mediaType + "SampleEntry"].prototype = new BoxParser4.SampleEntry();
        if (parseMethod)
          BoxParser4[mediaType + "SampleEntry"].prototype.parse = parseMethod;
      },
      createSampleEntryCtor: function(mediaType, type, parseMethod, subBoxNames) {
        BoxParser4.sampleEntryCodes[mediaType].push(type);
        BoxParser4[type + "SampleEntry"] = function(size) {
          BoxParser4[mediaType + "SampleEntry"].call(this, type, size);
          BoxParser4.addSubBoxArrays.call(this, subBoxNames);
        };
        BoxParser4[type + "SampleEntry"].prototype = new BoxParser4[mediaType + "SampleEntry"]();
        if (parseMethod)
          BoxParser4[type + "SampleEntry"].prototype.parse = parseMethod;
      },
      createEncryptedSampleEntryCtor: function(mediaType, type, parseMethod) {
        BoxParser4.createSampleEntryCtor.call(this, mediaType, type, parseMethod, ["sinf"]);
      },
      createSampleGroupCtor: function(type, parseMethod) {
        BoxParser4[type + "SampleGroupEntry"] = function(size) {
          BoxParser4.SampleGroupEntry.call(this, type, size);
        };
        BoxParser4[type + "SampleGroupEntry"].prototype = new BoxParser4.SampleGroupEntry();
        if (parseMethod)
          BoxParser4[type + "SampleGroupEntry"].prototype.parse = parseMethod;
      },
      createTrackGroupCtor: function(type, parseMethod) {
        BoxParser4[type + "TrackGroupTypeBox"] = function(size) {
          BoxParser4.TrackGroupTypeBox.call(this, type, size);
        };
        BoxParser4[type + "TrackGroupTypeBox"].prototype = new BoxParser4.TrackGroupTypeBox();
        if (parseMethod)
          BoxParser4[type + "TrackGroupTypeBox"].prototype.parse = parseMethod;
      },
      createUUIDBox: function(uuid, isFullBox, isContainerBox, parseMethod) {
        BoxParser4.UUIDs.push(uuid);
        BoxParser4.UUIDBoxes[uuid] = function(size) {
          if (isFullBox) {
            BoxParser4.FullBox.call(this, "uuid", size, uuid);
          } else {
            if (isContainerBox) {
              BoxParser4.ContainerBox.call(this, "uuid", size, uuid);
            } else {
              BoxParser4.Box.call(this, "uuid", size, uuid);
            }
          }
        };
        BoxParser4.UUIDBoxes[uuid].prototype = isFullBox ? new BoxParser4.FullBox() : isContainerBox ? new BoxParser4.ContainerBox() : new BoxParser4.Box();
        if (parseMethod) {
          if (isFullBox) {
            BoxParser4.UUIDBoxes[uuid].prototype.parse = function(stream) {
              this.parseFullHeader(stream);
              if (parseMethod) {
                parseMethod.call(this, stream);
              }
            };
          } else {
            BoxParser4.UUIDBoxes[uuid].prototype.parse = parseMethod;
          }
        }
      }
    };
    BoxParser4.initialize();
    BoxParser4.TKHD_FLAG_ENABLED = 1;
    BoxParser4.TKHD_FLAG_IN_MOVIE = 2;
    BoxParser4.TKHD_FLAG_IN_PREVIEW = 4;
    BoxParser4.TFHD_FLAG_BASE_DATA_OFFSET = 1;
    BoxParser4.TFHD_FLAG_SAMPLE_DESC = 2;
    BoxParser4.TFHD_FLAG_SAMPLE_DUR = 8;
    BoxParser4.TFHD_FLAG_SAMPLE_SIZE = 16;
    BoxParser4.TFHD_FLAG_SAMPLE_FLAGS = 32;
    BoxParser4.TFHD_FLAG_DUR_EMPTY = 65536;
    BoxParser4.TFHD_FLAG_DEFAULT_BASE_IS_MOOF = 131072;
    BoxParser4.TRUN_FLAGS_DATA_OFFSET = 1;
    BoxParser4.TRUN_FLAGS_FIRST_FLAG = 4;
    BoxParser4.TRUN_FLAGS_DURATION = 256;
    BoxParser4.TRUN_FLAGS_SIZE = 512;
    BoxParser4.TRUN_FLAGS_FLAGS = 1024;
    BoxParser4.TRUN_FLAGS_CTS_OFFSET = 2048;
    BoxParser4.Box.prototype.add = function(name) {
      return this.addBox(new BoxParser4[name + "Box"]());
    };
    BoxParser4.Box.prototype.addBox = function(box2) {
      this.boxes.push(box2);
      if (this[box2.type + "s"]) {
        this[box2.type + "s"].push(box2);
      } else {
        this[box2.type] = box2;
      }
      return box2;
    };
    BoxParser4.Box.prototype.set = function(prop, value) {
      this[prop] = value;
      return this;
    };
    BoxParser4.Box.prototype.addEntry = function(value, _prop) {
      var prop = _prop || "entries";
      if (!this[prop]) {
        this[prop] = [];
      }
      this[prop].push(value);
      return this;
    };
    if (typeof exports !== "undefined") {
      exports.BoxParser = BoxParser4;
    }
    BoxParser4.parseUUID = function(stream) {
      return BoxParser4.parseHex16(stream);
    };
    BoxParser4.parseHex16 = function(stream) {
      var hex16 = "";
      for (var i2 = 0; i2 < 16; i2++) {
        var hex = stream.readUint8().toString(16);
        hex16 += hex.length === 1 ? "0" + hex : hex;
      }
      return hex16;
    };
    BoxParser4.parseOneBox = function(stream, headerOnly, parentSize) {
      var box2;
      var start = stream.getPosition();
      var hdr_size = 0;
      var diff;
      var uuid;
      if (stream.getEndPosition() - start < 8) {
        Log2.debug("BoxParser", "Not enough data in stream to parse the type and size of the box");
        return { code: BoxParser4.ERR_NOT_ENOUGH_DATA };
      }
      if (parentSize && parentSize < 8) {
        Log2.debug("BoxParser", "Not enough bytes left in the parent box to parse a new box");
        return { code: BoxParser4.ERR_NOT_ENOUGH_DATA };
      }
      var size = stream.readUint32();
      var type = stream.readString(4);
      var box_type = type;
      Log2.debug("BoxParser", "Found box of type '" + type + "' and size " + size + " at position " + start);
      hdr_size = 8;
      if (type == "uuid") {
        if (stream.getEndPosition() - stream.getPosition() < 16 || parentSize - hdr_size < 16) {
          stream.seek(start);
          Log2.debug("BoxParser", "Not enough bytes left in the parent box to parse a UUID box");
          return { code: BoxParser4.ERR_NOT_ENOUGH_DATA };
        }
        uuid = BoxParser4.parseUUID(stream);
        hdr_size += 16;
        box_type = uuid;
      }
      if (size == 1) {
        if (stream.getEndPosition() - stream.getPosition() < 8 || parentSize && parentSize - hdr_size < 8) {
          stream.seek(start);
          Log2.warn("BoxParser", 'Not enough data in stream to parse the extended size of the "' + type + '" box');
          return { code: BoxParser4.ERR_NOT_ENOUGH_DATA };
        }
        size = stream.readUint64();
        hdr_size += 8;
      } else if (size === 0) {
        if (parentSize) {
          size = parentSize;
        } else {
          if (type !== "mdat") {
            Log2.error("BoxParser", "Unlimited box size not supported for type: '" + type + "'");
            box2 = new BoxParser4.Box(type, size);
            return { code: BoxParser4.OK, box: box2, size: box2.size };
          }
        }
      }
      if (size !== 0 && size < hdr_size) {
        Log2.error("BoxParser", "Box of type " + type + " has an invalid size " + size + " (too small to be a box)");
        return { code: BoxParser4.ERR_NOT_ENOUGH_DATA, type, size, hdr_size, start };
      }
      if (size !== 0 && parentSize && size > parentSize) {
        Log2.error("BoxParser", "Box of type '" + type + "' has a size " + size + " greater than its container size " + parentSize);
        return { code: BoxParser4.ERR_NOT_ENOUGH_DATA, type, size, hdr_size, start };
      }
      if (size !== 0 && start + size > stream.getEndPosition()) {
        stream.seek(start);
        Log2.info("BoxParser", "Not enough data in stream to parse the entire '" + type + "' box");
        return { code: BoxParser4.ERR_NOT_ENOUGH_DATA, type, size, hdr_size, start };
      }
      if (headerOnly) {
        return { code: BoxParser4.OK, type, size, hdr_size, start };
      } else {
        if (BoxParser4[type + "Box"]) {
          box2 = new BoxParser4[type + "Box"](size);
        } else {
          if (type !== "uuid") {
            Log2.warn("BoxParser", "Unknown box type: '" + type + "'");
            box2 = new BoxParser4.Box(type, size);
            box2.has_unparsed_data = true;
          } else {
            if (BoxParser4.UUIDBoxes[uuid]) {
              box2 = new BoxParser4.UUIDBoxes[uuid](size);
            } else {
              Log2.warn("BoxParser", "Unknown uuid type: '" + uuid + "'");
              box2 = new BoxParser4.Box(type, size);
              box2.uuid = uuid;
              box2.has_unparsed_data = true;
            }
          }
        }
      }
      box2.hdr_size = hdr_size;
      box2.start = start;
      if (box2.write === BoxParser4.Box.prototype.write && box2.type !== "mdat") {
        Log2.info("BoxParser", "'" + box_type + "' box writing not yet implemented, keeping unparsed data in memory for later write");
        box2.parseDataAndRewind(stream);
      }
      box2.parse(stream);
      diff = stream.getPosition() - (box2.start + box2.size);
      if (diff < 0) {
        Log2.warn("BoxParser", "Parsing of box '" + box_type + "' did not read the entire indicated box data size (missing " + -diff + " bytes), seeking forward");
        stream.seek(box2.start + box2.size);
      } else if (diff > 0) {
        Log2.error("BoxParser", "Parsing of box '" + box_type + "' read " + diff + " more bytes than the indicated box data size, seeking backwards");
        if (box2.size !== 0)
          stream.seek(box2.start + box2.size);
      }
      return { code: BoxParser4.OK, box: box2, size: box2.size };
    };
    BoxParser4.Box.prototype.parse = function(stream) {
      if (this.type != "mdat") {
        this.data = stream.readUint8Array(this.size - this.hdr_size);
      } else {
        if (this.size === 0) {
          stream.seek(stream.getEndPosition());
        } else {
          stream.seek(this.start + this.size);
        }
      }
    };
    BoxParser4.Box.prototype.parseDataAndRewind = function(stream) {
      this.data = stream.readUint8Array(this.size - this.hdr_size);
      stream.position -= this.size - this.hdr_size;
    };
    BoxParser4.FullBox.prototype.parseDataAndRewind = function(stream) {
      this.parseFullHeader(stream);
      this.data = stream.readUint8Array(this.size - this.hdr_size);
      this.hdr_size -= 4;
      stream.position -= this.size - this.hdr_size;
    };
    BoxParser4.FullBox.prototype.parseFullHeader = function(stream) {
      this.version = stream.readUint8();
      this.flags = stream.readUint24();
      this.hdr_size += 4;
    };
    BoxParser4.FullBox.prototype.parse = function(stream) {
      this.parseFullHeader(stream);
      this.data = stream.readUint8Array(this.size - this.hdr_size);
    };
    BoxParser4.ContainerBox.prototype.parse = function(stream) {
      var ret2;
      var box2;
      while (stream.getPosition() < this.start + this.size) {
        ret2 = BoxParser4.parseOneBox(stream, false, this.size - (stream.getPosition() - this.start));
        if (ret2.code === BoxParser4.OK) {
          box2 = ret2.box;
          this.boxes.push(box2);
          if (this.subBoxNames && this.subBoxNames.indexOf(box2.type) != -1) {
            this[this.subBoxNames[this.subBoxNames.indexOf(box2.type)] + "s"].push(box2);
          } else {
            var box_type = box2.type !== "uuid" ? box2.type : box2.uuid;
            if (this[box_type]) {
              Log2.warn("Box of type " + box_type + " already stored in field of this type");
            } else {
              this[box_type] = box2;
            }
          }
        } else {
          return;
        }
      }
    };
    BoxParser4.Box.prototype.parseLanguage = function(stream) {
      this.language = stream.readUint16();
      var chars = [];
      chars[0] = this.language >> 10 & 31;
      chars[1] = this.language >> 5 & 31;
      chars[2] = this.language & 31;
      this.languageString = String.fromCharCode(chars[0] + 96, chars[1] + 96, chars[2] + 96);
    };
    BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL = "Visual";
    BoxParser4.SAMPLE_ENTRY_TYPE_AUDIO = "Audio";
    BoxParser4.SAMPLE_ENTRY_TYPE_HINT = "Hint";
    BoxParser4.SAMPLE_ENTRY_TYPE_METADATA = "Metadata";
    BoxParser4.SAMPLE_ENTRY_TYPE_SUBTITLE = "Subtitle";
    BoxParser4.SAMPLE_ENTRY_TYPE_SYSTEM = "System";
    BoxParser4.SAMPLE_ENTRY_TYPE_TEXT = "Text";
    BoxParser4.SampleEntry.prototype.parseHeader = function(stream) {
      stream.readUint8Array(6);
      this.data_reference_index = stream.readUint16();
      this.hdr_size += 8;
    };
    BoxParser4.SampleEntry.prototype.parse = function(stream) {
      this.parseHeader(stream);
      this.data = stream.readUint8Array(this.size - this.hdr_size);
    };
    BoxParser4.SampleEntry.prototype.parseDataAndRewind = function(stream) {
      this.parseHeader(stream);
      this.data = stream.readUint8Array(this.size - this.hdr_size);
      this.hdr_size -= 8;
      stream.position -= this.size - this.hdr_size;
    };
    BoxParser4.SampleEntry.prototype.parseFooter = function(stream) {
      BoxParser4.ContainerBox.prototype.parse.call(this, stream);
    };
    BoxParser4.createMediaSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_HINT);
    BoxParser4.createMediaSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_METADATA);
    BoxParser4.createMediaSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_SUBTITLE);
    BoxParser4.createMediaSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_SYSTEM);
    BoxParser4.createMediaSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_TEXT);
    BoxParser4.createMediaSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL, function(stream) {
      var compressorname_length;
      this.parseHeader(stream);
      stream.readUint16();
      stream.readUint16();
      stream.readUint32Array(3);
      this.width = stream.readUint16();
      this.height = stream.readUint16();
      this.horizresolution = stream.readUint32();
      this.vertresolution = stream.readUint32();
      stream.readUint32();
      this.frame_count = stream.readUint16();
      compressorname_length = Math.min(31, stream.readUint8());
      this.compressorname = stream.readString(compressorname_length);
      if (compressorname_length < 31) {
        stream.readString(31 - compressorname_length);
      }
      this.depth = stream.readUint16();
      stream.readUint16();
      this.parseFooter(stream);
    });
    BoxParser4.createMediaSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_AUDIO, function(stream) {
      this.parseHeader(stream);
      stream.readUint32Array(2);
      this.channel_count = stream.readUint16();
      this.samplesize = stream.readUint16();
      stream.readUint16();
      stream.readUint16();
      this.samplerate = stream.readUint32() / (1 << 16);
      this.parseFooter(stream);
    });
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL, "avc1");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL, "avc2");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL, "avc3");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL, "avc4");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL, "av01");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL, "dav1");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL, "hvc1");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL, "hev1");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL, "hvt1");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL, "lhe1");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL, "dvh1");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL, "dvhe");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL, "vvc1");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL, "vvi1");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL, "vvs1");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL, "vvcN");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL, "vp08");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL, "vp09");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL, "avs3");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL, "j2ki");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL, "mjp2");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL, "mjpg");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL, "uncv");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_AUDIO, "mp4a");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_AUDIO, "ac-3");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_AUDIO, "ac-4");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_AUDIO, "ec-3");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_AUDIO, "Opus");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_AUDIO, "mha1");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_AUDIO, "mha2");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_AUDIO, "mhm1");
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_AUDIO, "mhm2");
    BoxParser4.createEncryptedSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_VISUAL, "encv");
    BoxParser4.createEncryptedSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_AUDIO, "enca");
    BoxParser4.createEncryptedSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_SUBTITLE, "encu");
    BoxParser4.createEncryptedSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_SYSTEM, "encs");
    BoxParser4.createEncryptedSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_TEXT, "enct");
    BoxParser4.createEncryptedSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_METADATA, "encm");
    BoxParser4.createBoxCtor("a1lx", function(stream) {
      var large_size = stream.readUint8() & 1;
      var FieldLength = ((large_size & 1) + 1) * 16;
      this.layer_size = [];
      for (var i2 = 0; i2 < 3; i2++) {
        if (FieldLength == 16) {
          this.layer_size[i2] = stream.readUint16();
        } else {
          this.layer_size[i2] = stream.readUint32();
        }
      }
    });
    BoxParser4.createBoxCtor("a1op", function(stream) {
      this.op_index = stream.readUint8();
    });
    BoxParser4.createFullBoxCtor("auxC", function(stream) {
      this.aux_type = stream.readCString();
      var aux_subtype_length = this.size - this.hdr_size - (this.aux_type.length + 1);
      this.aux_subtype = stream.readUint8Array(aux_subtype_length);
    });
    BoxParser4.createBoxCtor("av1C", function(stream) {
      var i2;
      var toparse;
      var tmp = stream.readUint8();
      if (tmp >> 7 & false) {
        Log2.error("av1C marker problem");
        return;
      }
      this.version = tmp & 127;
      if (this.version !== 1) {
        Log2.error("av1C version " + this.version + " not supported");
        return;
      }
      tmp = stream.readUint8();
      this.seq_profile = tmp >> 5 & 7;
      this.seq_level_idx_0 = tmp & 31;
      tmp = stream.readUint8();
      this.seq_tier_0 = tmp >> 7 & 1;
      this.high_bitdepth = tmp >> 6 & 1;
      this.twelve_bit = tmp >> 5 & 1;
      this.monochrome = tmp >> 4 & 1;
      this.chroma_subsampling_x = tmp >> 3 & 1;
      this.chroma_subsampling_y = tmp >> 2 & 1;
      this.chroma_sample_position = tmp & 3;
      tmp = stream.readUint8();
      this.reserved_1 = tmp >> 5 & 7;
      if (this.reserved_1 !== 0) {
        Log2.error("av1C reserved_1 parsing problem");
        return;
      }
      this.initial_presentation_delay_present = tmp >> 4 & 1;
      if (this.initial_presentation_delay_present === 1) {
        this.initial_presentation_delay_minus_one = tmp & 15;
      } else {
        this.reserved_2 = tmp & 15;
        if (this.reserved_2 !== 0) {
          Log2.error("av1C reserved_2 parsing problem");
          return;
        }
      }
      var configOBUs_length = this.size - this.hdr_size - 4;
      this.configOBUs = stream.readUint8Array(configOBUs_length);
    });
    BoxParser4.createBoxCtor("avcC", function(stream) {
      var i2;
      var toparse;
      this.configurationVersion = stream.readUint8();
      this.AVCProfileIndication = stream.readUint8();
      this.profile_compatibility = stream.readUint8();
      this.AVCLevelIndication = stream.readUint8();
      this.lengthSizeMinusOne = stream.readUint8() & 3;
      this.nb_SPS_nalus = stream.readUint8() & 31;
      toparse = this.size - this.hdr_size - 6;
      this.SPS = [];
      for (i2 = 0; i2 < this.nb_SPS_nalus; i2++) {
        this.SPS[i2] = {};
        this.SPS[i2].length = stream.readUint16();
        this.SPS[i2].nalu = stream.readUint8Array(this.SPS[i2].length);
        toparse -= 2 + this.SPS[i2].length;
      }
      this.nb_PPS_nalus = stream.readUint8();
      toparse--;
      this.PPS = [];
      for (i2 = 0; i2 < this.nb_PPS_nalus; i2++) {
        this.PPS[i2] = {};
        this.PPS[i2].length = stream.readUint16();
        this.PPS[i2].nalu = stream.readUint8Array(this.PPS[i2].length);
        toparse -= 2 + this.PPS[i2].length;
      }
      if (toparse > 0) {
        this.ext = stream.readUint8Array(toparse);
      }
    });
    BoxParser4.createBoxCtor("btrt", function(stream) {
      this.bufferSizeDB = stream.readUint32();
      this.maxBitrate = stream.readUint32();
      this.avgBitrate = stream.readUint32();
    });
    BoxParser4.createFullBoxCtor("ccst", function(stream) {
      var flags = stream.readUint8();
      this.all_ref_pics_intra = (flags & 128) == 128;
      this.intra_pred_used = (flags & 64) == 64;
      this.max_ref_per_pic = (flags & 63) >> 2;
      stream.readUint24();
    });
    BoxParser4.createBoxCtor("cdef", function(stream) {
      var i2;
      this.channel_count = stream.readUint16();
      this.channel_indexes = [];
      this.channel_types = [];
      this.channel_associations = [];
      for (i2 = 0; i2 < this.channel_count; i2++) {
        this.channel_indexes.push(stream.readUint16());
        this.channel_types.push(stream.readUint16());
        this.channel_associations.push(stream.readUint16());
      }
    });
    BoxParser4.createBoxCtor("clap", function(stream) {
      this.cleanApertureWidthN = stream.readUint32();
      this.cleanApertureWidthD = stream.readUint32();
      this.cleanApertureHeightN = stream.readUint32();
      this.cleanApertureHeightD = stream.readUint32();
      this.horizOffN = stream.readUint32();
      this.horizOffD = stream.readUint32();
      this.vertOffN = stream.readUint32();
      this.vertOffD = stream.readUint32();
    });
    BoxParser4.createBoxCtor("clli", function(stream) {
      this.max_content_light_level = stream.readUint16();
      this.max_pic_average_light_level = stream.readUint16();
    });
    BoxParser4.createFullBoxCtor("cmex", function(stream) {
      if (this.flags & 1) {
        this.pos_x = stream.readInt32();
      }
      if (this.flags & 2) {
        this.pos_y = stream.readInt32();
      }
      if (this.flags & 4) {
        this.pos_z = stream.readInt32();
      }
      if (this.flags & 8) {
        if (this.version == 0) {
          if (this.flags & 16) {
            this.quat_x = stream.readInt32();
            this.quat_y = stream.readInt32();
            this.quat_z = stream.readInt32();
          } else {
            this.quat_x = stream.readInt16();
            this.quat_y = stream.readInt16();
            this.quat_z = stream.readInt16();
          }
        } else if (this.version == 1) {
        }
      }
      if (this.flags & 32) {
        this.id = stream.readUint32();
      }
    });
    BoxParser4.createFullBoxCtor("cmin", function(stream) {
      this.focal_length_x = stream.readInt32();
      this.principal_point_x = stream.readInt32();
      this.principal_point_y = stream.readInt32();
      if (this.flags & 1) {
        this.focal_length_y = stream.readInt32();
        this.skew_factor = stream.readInt32();
      }
    });
    BoxParser4.createBoxCtor("cmpd", function(stream) {
      this.component_count = stream.readUint16();
      this.component_types = [];
      this.component_type_urls = [];
      for (i = 0; i < this.component_count; i++) {
        var component_type = stream.readUint16();
        this.component_types.push(component_type);
        if (component_type >= 32768) {
          this.component_type_urls.push(stream.readCString());
        }
      }
    });
    BoxParser4.createFullBoxCtor("co64", function(stream) {
      var entry_count2;
      var i2;
      entry_count2 = stream.readUint32();
      this.chunk_offsets = [];
      if (this.version === 0) {
        for (i2 = 0; i2 < entry_count2; i2++) {
          this.chunk_offsets.push(stream.readUint64());
        }
      }
    });
    BoxParser4.createFullBoxCtor("CoLL", function(stream) {
      this.maxCLL = stream.readUint16();
      this.maxFALL = stream.readUint16();
    });
    BoxParser4.createBoxCtor("colr", function(stream) {
      this.colour_type = stream.readString(4);
      if (this.colour_type === "nclx") {
        this.colour_primaries = stream.readUint16();
        this.transfer_characteristics = stream.readUint16();
        this.matrix_coefficients = stream.readUint16();
        var tmp = stream.readUint8();
        this.full_range_flag = tmp >> 7;
      } else if (this.colour_type === "rICC") {
        this.ICC_profile = stream.readUint8Array(this.size - 4);
      } else if (this.colour_type === "prof") {
        this.ICC_profile = stream.readUint8Array(this.size - 4);
      }
    });
    BoxParser4.createFullBoxCtor("cprt", function(stream) {
      this.parseLanguage(stream);
      this.notice = stream.readCString();
    });
    BoxParser4.createFullBoxCtor("cslg", function(stream) {
      var entry_count2;
      if (this.version === 0) {
        this.compositionToDTSShift = stream.readInt32();
        this.leastDecodeToDisplayDelta = stream.readInt32();
        this.greatestDecodeToDisplayDelta = stream.readInt32();
        this.compositionStartTime = stream.readInt32();
        this.compositionEndTime = stream.readInt32();
      }
    });
    BoxParser4.createFullBoxCtor("ctts", function(stream) {
      var entry_count2;
      var i2;
      entry_count2 = stream.readUint32();
      this.sample_counts = [];
      this.sample_offsets = [];
      if (this.version === 0) {
        for (i2 = 0; i2 < entry_count2; i2++) {
          this.sample_counts.push(stream.readUint32());
          var value = stream.readInt32();
          if (value < 0) {
            Log2.warn("BoxParser", "ctts box uses negative values without using version 1");
          }
          this.sample_offsets.push(value);
        }
      } else if (this.version == 1) {
        for (i2 = 0; i2 < entry_count2; i2++) {
          this.sample_counts.push(stream.readUint32());
          this.sample_offsets.push(stream.readInt32());
        }
      }
    });
    BoxParser4.createBoxCtor("dac3", function(stream) {
      var tmp_byte1 = stream.readUint8();
      var tmp_byte2 = stream.readUint8();
      var tmp_byte3 = stream.readUint8();
      this.fscod = tmp_byte1 >> 6;
      this.bsid = tmp_byte1 >> 1 & 31;
      this.bsmod = (tmp_byte1 & 1) << 2 | tmp_byte2 >> 6 & 3;
      this.acmod = tmp_byte2 >> 3 & 7;
      this.lfeon = tmp_byte2 >> 2 & 1;
      this.bit_rate_code = tmp_byte2 & 3 | tmp_byte3 >> 5 & 7;
    });
    BoxParser4.createBoxCtor("dec3", function(stream) {
      var tmp_16 = stream.readUint16();
      this.data_rate = tmp_16 >> 3;
      this.num_ind_sub = tmp_16 & 7;
      this.ind_subs = [];
      for (var i2 = 0; i2 < this.num_ind_sub + 1; i2++) {
        var ind_sub = {};
        this.ind_subs.push(ind_sub);
        var tmp_byte1 = stream.readUint8();
        var tmp_byte2 = stream.readUint8();
        var tmp_byte3 = stream.readUint8();
        ind_sub.fscod = tmp_byte1 >> 6;
        ind_sub.bsid = tmp_byte1 >> 1 & 31;
        ind_sub.bsmod = (tmp_byte1 & 1) << 4 | tmp_byte2 >> 4 & 15;
        ind_sub.acmod = tmp_byte2 >> 1 & 7;
        ind_sub.lfeon = tmp_byte2 & 1;
        ind_sub.num_dep_sub = tmp_byte3 >> 1 & 15;
        if (ind_sub.num_dep_sub > 0) {
          ind_sub.chan_loc = (tmp_byte3 & 1) << 8 | stream.readUint8();
        }
      }
    });
    BoxParser4.createFullBoxCtor("dfLa", function(stream) {
      var BLOCKTYPE_MASK = 127;
      var LASTMETADATABLOCKFLAG_MASK = 128;
      var boxesFound = [];
      var knownBlockTypes = [
        "STREAMINFO",
        "PADDING",
        "APPLICATION",
        "SEEKTABLE",
        "VORBIS_COMMENT",
        "CUESHEET",
        "PICTURE",
        "RESERVED"
      ];
      this.parseFullHeader(stream);
      do {
        var flagAndType = stream.readUint8();
        var type = Math.min(
          flagAndType & BLOCKTYPE_MASK,
          knownBlockTypes.length - 1
        );
        if (!type) {
          stream.readUint8Array(13);
          this.samplerate = stream.readUint32() >> 12;
          stream.readUint8Array(20);
        } else {
          stream.readUint8Array(stream.readUint24());
        }
        boxesFound.push(knownBlockTypes[type]);
        if (!!(flagAndType & LASTMETADATABLOCKFLAG_MASK)) {
          break;
        }
      } while (true);
      this.numMetadataBlocks = boxesFound.length + " (" + boxesFound.join(", ") + ")";
    });
    BoxParser4.createBoxCtor("dimm", function(stream) {
      this.bytessent = stream.readUint64();
    });
    BoxParser4.createBoxCtor("dmax", function(stream) {
      this.time = stream.readUint32();
    });
    BoxParser4.createBoxCtor("dmed", function(stream) {
      this.bytessent = stream.readUint64();
    });
    BoxParser4.createBoxCtor("dOps", function(stream) {
      this.Version = stream.readUint8();
      this.OutputChannelCount = stream.readUint8();
      this.PreSkip = stream.readUint16();
      this.InputSampleRate = stream.readUint32();
      this.OutputGain = stream.readInt16();
      this.ChannelMappingFamily = stream.readUint8();
      if (this.ChannelMappingFamily !== 0) {
        this.StreamCount = stream.readUint8();
        this.CoupledCount = stream.readUint8();
        this.ChannelMapping = [];
        for (var i2 = 0; i2 < this.OutputChannelCount; i2++) {
          this.ChannelMapping[i2] = stream.readUint8();
        }
      }
    });
    BoxParser4.createFullBoxCtor("dref", function(stream) {
      var ret2;
      var box2;
      this.entries = [];
      var entry_count2 = stream.readUint32();
      for (var i2 = 0; i2 < entry_count2; i2++) {
        ret2 = BoxParser4.parseOneBox(stream, false, this.size - (stream.getPosition() - this.start));
        if (ret2.code === BoxParser4.OK) {
          box2 = ret2.box;
          this.entries.push(box2);
        } else {
          return;
        }
      }
    });
    BoxParser4.createBoxCtor("drep", function(stream) {
      this.bytessent = stream.readUint64();
    });
    BoxParser4.createFullBoxCtor("elng", function(stream) {
      this.extended_language = stream.readString(this.size - this.hdr_size);
    });
    BoxParser4.createFullBoxCtor("elst", function(stream) {
      this.entries = [];
      var entry_count2 = stream.readUint32();
      for (var i2 = 0; i2 < entry_count2; i2++) {
        var entry = {};
        this.entries.push(entry);
        if (this.version === 1) {
          entry.segment_duration = stream.readUint64();
          entry.media_time = stream.readInt64();
        } else {
          entry.segment_duration = stream.readUint32();
          entry.media_time = stream.readInt32();
        }
        entry.media_rate_integer = stream.readInt16();
        entry.media_rate_fraction = stream.readInt16();
      }
    });
    BoxParser4.createFullBoxCtor("emsg", function(stream) {
      if (this.version == 1) {
        this.timescale = stream.readUint32();
        this.presentation_time = stream.readUint64();
        this.event_duration = stream.readUint32();
        this.id = stream.readUint32();
        this.scheme_id_uri = stream.readCString();
        this.value = stream.readCString();
      } else {
        this.scheme_id_uri = stream.readCString();
        this.value = stream.readCString();
        this.timescale = stream.readUint32();
        this.presentation_time_delta = stream.readUint32();
        this.event_duration = stream.readUint32();
        this.id = stream.readUint32();
      }
      var message_size = this.size - this.hdr_size - (4 * 4 + (this.scheme_id_uri.length + 1) + (this.value.length + 1));
      if (this.version == 1) {
        message_size -= 4;
      }
      this.message_data = stream.readUint8Array(message_size);
    });
    BoxParser4.createEntityToGroupCtor = function(type, parseMethod) {
      BoxParser4[type + "Box"] = function(size) {
        BoxParser4.FullBox.call(this, type, size);
      };
      BoxParser4[type + "Box"].prototype = new BoxParser4.FullBox();
      BoxParser4[type + "Box"].prototype.parse = function(stream) {
        this.parseFullHeader(stream);
        if (parseMethod) {
          parseMethod.call(this, stream);
        } else {
          this.group_id = stream.readUint32();
          this.num_entities_in_group = stream.readUint32();
          this.entity_ids = [];
          for (i = 0; i < this.num_entities_in_group; i++) {
            var entity_id = stream.readUint32();
            this.entity_ids.push(entity_id);
          }
        }
      };
    };
    BoxParser4.createEntityToGroupCtor("aebr");
    BoxParser4.createEntityToGroupCtor("afbr");
    BoxParser4.createEntityToGroupCtor("albc");
    BoxParser4.createEntityToGroupCtor("altr");
    BoxParser4.createEntityToGroupCtor("brst");
    BoxParser4.createEntityToGroupCtor("dobr");
    BoxParser4.createEntityToGroupCtor("eqiv");
    BoxParser4.createEntityToGroupCtor("favc");
    BoxParser4.createEntityToGroupCtor("fobr");
    BoxParser4.createEntityToGroupCtor("iaug");
    BoxParser4.createEntityToGroupCtor("pano");
    BoxParser4.createEntityToGroupCtor("slid");
    BoxParser4.createEntityToGroupCtor("ster");
    BoxParser4.createEntityToGroupCtor("tsyn");
    BoxParser4.createEntityToGroupCtor("wbbr");
    BoxParser4.createEntityToGroupCtor("prgr");
    BoxParser4.createFullBoxCtor("esds", function(stream) {
      var esd_data = stream.readUint8Array(this.size - this.hdr_size);
      this.data = esd_data;
      if (typeof MPEG4DescriptorParser !== "undefined") {
        var esd_parser = new MPEG4DescriptorParser();
        this.esd = esd_parser.parseOneDescriptor(new DataStream4(esd_data.buffer, 0, DataStream4.BIG_ENDIAN));
      }
    });
    BoxParser4.createBoxCtor("fiel", function(stream) {
      this.fieldCount = stream.readUint8();
      this.fieldOrdering = stream.readUint8();
    });
    BoxParser4.createBoxCtor("frma", function(stream) {
      this.data_format = stream.readString(4);
    });
    BoxParser4.createBoxCtor("ftyp", function(stream) {
      var toparse = this.size - this.hdr_size;
      this.major_brand = stream.readString(4);
      this.minor_version = stream.readUint32();
      toparse -= 8;
      this.compatible_brands = [];
      var i2 = 0;
      while (toparse >= 4) {
        this.compatible_brands[i2] = stream.readString(4);
        toparse -= 4;
        i2++;
      }
    });
    BoxParser4.createFullBoxCtor("hdlr", function(stream) {
      if (this.version === 0) {
        stream.readUint32();
        this.handler = stream.readString(4);
        stream.readUint32Array(3);
        this.name = stream.readString(this.size - this.hdr_size - 20);
        if (this.name[this.name.length - 1] === "\0") {
          this.name = this.name.slice(0, -1);
        }
      }
    });
    BoxParser4.createBoxCtor("hvcC", function(stream) {
      var i2, j;
      var nb_nalus;
      var length;
      var tmp_byte;
      this.configurationVersion = stream.readUint8();
      tmp_byte = stream.readUint8();
      this.general_profile_space = tmp_byte >> 6;
      this.general_tier_flag = (tmp_byte & 32) >> 5;
      this.general_profile_idc = tmp_byte & 31;
      this.general_profile_compatibility = stream.readUint32();
      this.general_constraint_indicator = stream.readUint8Array(6);
      this.general_level_idc = stream.readUint8();
      this.min_spatial_segmentation_idc = stream.readUint16() & 4095;
      this.parallelismType = stream.readUint8() & 3;
      this.chroma_format_idc = stream.readUint8() & 3;
      this.bit_depth_luma_minus8 = stream.readUint8() & 7;
      this.bit_depth_chroma_minus8 = stream.readUint8() & 7;
      this.avgFrameRate = stream.readUint16();
      tmp_byte = stream.readUint8();
      this.constantFrameRate = tmp_byte >> 6;
      this.numTemporalLayers = (tmp_byte & 13) >> 3;
      this.temporalIdNested = (tmp_byte & 4) >> 2;
      this.lengthSizeMinusOne = tmp_byte & 3;
      this.nalu_arrays = [];
      var numOfArrays = stream.readUint8();
      for (i2 = 0; i2 < numOfArrays; i2++) {
        var nalu_array = [];
        this.nalu_arrays.push(nalu_array);
        tmp_byte = stream.readUint8();
        nalu_array.completeness = (tmp_byte & 128) >> 7;
        nalu_array.nalu_type = tmp_byte & 63;
        var numNalus = stream.readUint16();
        for (j = 0; j < numNalus; j++) {
          var nalu = {};
          nalu_array.push(nalu);
          length = stream.readUint16();
          nalu.data = stream.readUint8Array(length);
        }
      }
    });
    BoxParser4.createFullBoxCtor("iinf", function(stream) {
      var ret2;
      if (this.version === 0) {
        this.entry_count = stream.readUint16();
      } else {
        this.entry_count = stream.readUint32();
      }
      this.item_infos = [];
      for (var i2 = 0; i2 < this.entry_count; i2++) {
        ret2 = BoxParser4.parseOneBox(stream, false, this.size - (stream.getPosition() - this.start));
        if (ret2.code === BoxParser4.OK) {
          if (ret2.box.type !== "infe") {
            Log2.error("BoxParser", "Expected 'infe' box, got " + ret2.box.type);
          }
          this.item_infos[i2] = ret2.box;
        } else {
          return;
        }
      }
    });
    BoxParser4.createFullBoxCtor("iloc", function(stream) {
      var byte;
      byte = stream.readUint8();
      this.offset_size = byte >> 4 & 15;
      this.length_size = byte & 15;
      byte = stream.readUint8();
      this.base_offset_size = byte >> 4 & 15;
      if (this.version === 1 || this.version === 2) {
        this.index_size = byte & 15;
      } else {
        this.index_size = 0;
      }
      this.items = [];
      var item_count = 0;
      if (this.version < 2) {
        item_count = stream.readUint16();
      } else if (this.version === 2) {
        item_count = stream.readUint32();
      } else {
        throw "version of iloc box not supported";
      }
      for (var i2 = 0; i2 < item_count; i2++) {
        var item = {};
        this.items.push(item);
        if (this.version < 2) {
          item.item_ID = stream.readUint16();
        } else if (this.version === 2) {
          item.item_ID = stream.readUint16();
        } else {
          throw "version of iloc box not supported";
        }
        if (this.version === 1 || this.version === 2) {
          item.construction_method = stream.readUint16() & 15;
        } else {
          item.construction_method = 0;
        }
        item.data_reference_index = stream.readUint16();
        switch (this.base_offset_size) {
          case 0:
            item.base_offset = 0;
            break;
          case 4:
            item.base_offset = stream.readUint32();
            break;
          case 8:
            item.base_offset = stream.readUint64();
            break;
          default:
            throw "Error reading base offset size";
        }
        var extent_count = stream.readUint16();
        item.extents = [];
        for (var j = 0; j < extent_count; j++) {
          var extent = {};
          item.extents.push(extent);
          if (this.version === 1 || this.version === 2) {
            switch (this.index_size) {
              case 0:
                extent.extent_index = 0;
                break;
              case 4:
                extent.extent_index = stream.readUint32();
                break;
              case 8:
                extent.extent_index = stream.readUint64();
                break;
              default:
                throw "Error reading extent index";
            }
          }
          switch (this.offset_size) {
            case 0:
              extent.extent_offset = 0;
              break;
            case 4:
              extent.extent_offset = stream.readUint32();
              break;
            case 8:
              extent.extent_offset = stream.readUint64();
              break;
            default:
              throw "Error reading extent index";
          }
          switch (this.length_size) {
            case 0:
              extent.extent_length = 0;
              break;
            case 4:
              extent.extent_length = stream.readUint32();
              break;
            case 8:
              extent.extent_length = stream.readUint64();
              break;
            default:
              throw "Error reading extent index";
          }
        }
      }
    });
    BoxParser4.createBoxCtor("imir", function(stream) {
      var tmp = stream.readUint8();
      this.reserved = tmp >> 7;
      this.axis = tmp & 1;
    });
    BoxParser4.createFullBoxCtor("infe", function(stream) {
      if (this.version === 0 || this.version === 1) {
        this.item_ID = stream.readUint16();
        this.item_protection_index = stream.readUint16();
        this.item_name = stream.readCString();
        this.content_type = stream.readCString();
        this.content_encoding = stream.readCString();
      }
      if (this.version === 1) {
        this.extension_type = stream.readString(4);
        Log2.warn("BoxParser", "Cannot parse extension type");
        stream.seek(this.start + this.size);
        return;
      }
      if (this.version >= 2) {
        if (this.version === 2) {
          this.item_ID = stream.readUint16();
        } else if (this.version === 3) {
          this.item_ID = stream.readUint32();
        }
        this.item_protection_index = stream.readUint16();
        this.item_type = stream.readString(4);
        this.item_name = stream.readCString();
        if (this.item_type === "mime") {
          this.content_type = stream.readCString();
          this.content_encoding = stream.readCString();
        } else if (this.item_type === "uri ") {
          this.item_uri_type = stream.readCString();
        }
      }
    });
    BoxParser4.createFullBoxCtor("ipma", function(stream) {
      var i2, j;
      entry_count = stream.readUint32();
      this.associations = [];
      for (i2 = 0; i2 < entry_count; i2++) {
        var item_assoc = {};
        this.associations.push(item_assoc);
        if (this.version < 1) {
          item_assoc.id = stream.readUint16();
        } else {
          item_assoc.id = stream.readUint32();
        }
        var association_count = stream.readUint8();
        item_assoc.props = [];
        for (j = 0; j < association_count; j++) {
          var tmp = stream.readUint8();
          var p = {};
          item_assoc.props.push(p);
          p.essential = (tmp & 128) >> 7 === 1;
          if (this.flags & 1) {
            p.property_index = (tmp & 127) << 8 | stream.readUint8();
          } else {
            p.property_index = tmp & 127;
          }
        }
      }
    });
    BoxParser4.createFullBoxCtor("iref", function(stream) {
      var ret2;
      var entryCount;
      var box2;
      this.references = [];
      while (stream.getPosition() < this.start + this.size) {
        ret2 = BoxParser4.parseOneBox(stream, true, this.size - (stream.getPosition() - this.start));
        if (ret2.code === BoxParser4.OK) {
          if (this.version === 0) {
            box2 = new BoxParser4.SingleItemTypeReferenceBox(ret2.type, ret2.size, ret2.hdr_size, ret2.start);
          } else {
            box2 = new BoxParser4.SingleItemTypeReferenceBoxLarge(ret2.type, ret2.size, ret2.hdr_size, ret2.start);
          }
          if (box2.write === BoxParser4.Box.prototype.write && box2.type !== "mdat") {
            Log2.warn("BoxParser", box2.type + " box writing not yet implemented, keeping unparsed data in memory for later write");
            box2.parseDataAndRewind(stream);
          }
          box2.parse(stream);
          this.references.push(box2);
        } else {
          return;
        }
      }
    });
    BoxParser4.createBoxCtor("irot", function(stream) {
      this.angle = stream.readUint8() & 3;
    });
    BoxParser4.createFullBoxCtor("ispe", function(stream) {
      this.image_width = stream.readUint32();
      this.image_height = stream.readUint32();
    });
    BoxParser4.createFullBoxCtor("kind", function(stream) {
      this.schemeURI = stream.readCString();
      this.value = stream.readCString();
    });
    BoxParser4.createFullBoxCtor("leva", function(stream) {
      var count = stream.readUint8();
      this.levels = [];
      for (var i2 = 0; i2 < count; i2++) {
        var level = {};
        this.levels[i2] = level;
        level.track_ID = stream.readUint32();
        var tmp_byte = stream.readUint8();
        level.padding_flag = tmp_byte >> 7;
        level.assignment_type = tmp_byte & 127;
        switch (level.assignment_type) {
          case 0:
            level.grouping_type = stream.readString(4);
            break;
          case 1:
            level.grouping_type = stream.readString(4);
            level.grouping_type_parameter = stream.readUint32();
            break;
          case 2:
            break;
          case 3:
            break;
          case 4:
            level.sub_track_id = stream.readUint32();
            break;
          default:
            Log2.warn("BoxParser", "Unknown leva assignement type");
        }
      }
    });
    BoxParser4.createBoxCtor("lsel", function(stream) {
      this.layer_id = stream.readUint16();
    });
    BoxParser4.createBoxCtor("maxr", function(stream) {
      this.period = stream.readUint32();
      this.bytes = stream.readUint32();
    });
    BoxParser4.createBoxCtor("mdcv", function(stream) {
      this.display_primaries = [];
      this.display_primaries[0] = {};
      this.display_primaries[0].x = stream.readUint16();
      this.display_primaries[0].y = stream.readUint16();
      this.display_primaries[1] = {};
      this.display_primaries[1].x = stream.readUint16();
      this.display_primaries[1].y = stream.readUint16();
      this.display_primaries[2] = {};
      this.display_primaries[2].x = stream.readUint16();
      this.display_primaries[2].y = stream.readUint16();
      this.white_point = {};
      this.white_point.x = stream.readUint16();
      this.white_point.y = stream.readUint16();
      this.max_display_mastering_luminance = stream.readUint32();
      this.min_display_mastering_luminance = stream.readUint32();
    });
    BoxParser4.createFullBoxCtor("mdhd", function(stream) {
      if (this.version == 1) {
        this.creation_time = stream.readUint64();
        this.modification_time = stream.readUint64();
        this.timescale = stream.readUint32();
        this.duration = stream.readUint64();
      } else {
        this.creation_time = stream.readUint32();
        this.modification_time = stream.readUint32();
        this.timescale = stream.readUint32();
        this.duration = stream.readUint32();
      }
      this.parseLanguage(stream);
      stream.readUint16();
    });
    BoxParser4.createFullBoxCtor("mehd", function(stream) {
      if (this.flags & 1) {
        Log2.warn("BoxParser", "mehd box incorrectly uses flags set to 1, converting version to 1");
        this.version = 1;
      }
      if (this.version == 1) {
        this.fragment_duration = stream.readUint64();
      } else {
        this.fragment_duration = stream.readUint32();
      }
    });
    BoxParser4.createFullBoxCtor("meta", function(stream) {
      this.boxes = [];
      BoxParser4.ContainerBox.prototype.parse.call(this, stream);
    });
    BoxParser4.createFullBoxCtor("mfhd", function(stream) {
      this.sequence_number = stream.readUint32();
    });
    BoxParser4.createFullBoxCtor("mfro", function(stream) {
      this._size = stream.readUint32();
    });
    BoxParser4.createFullBoxCtor("mvhd", function(stream) {
      if (this.version == 1) {
        this.creation_time = stream.readUint64();
        this.modification_time = stream.readUint64();
        this.timescale = stream.readUint32();
        this.duration = stream.readUint64();
      } else {
        this.creation_time = stream.readUint32();
        this.modification_time = stream.readUint32();
        this.timescale = stream.readUint32();
        this.duration = stream.readUint32();
      }
      this.rate = stream.readUint32();
      this.volume = stream.readUint16() >> 8;
      stream.readUint16();
      stream.readUint32Array(2);
      this.matrix = stream.readUint32Array(9);
      stream.readUint32Array(6);
      this.next_track_id = stream.readUint32();
    });
    BoxParser4.createBoxCtor("npck", function(stream) {
      this.packetssent = stream.readUint32();
    });
    BoxParser4.createBoxCtor("nump", function(stream) {
      this.packetssent = stream.readUint64();
    });
    BoxParser4.createFullBoxCtor("padb", function(stream) {
      var sample_count = stream.readUint32();
      this.padbits = [];
      for (var i2 = 0; i2 < Math.floor((sample_count + 1) / 2); i2++) {
        this.padbits = stream.readUint8();
      }
    });
    BoxParser4.createBoxCtor("pasp", function(stream) {
      this.hSpacing = stream.readUint32();
      this.vSpacing = stream.readUint32();
    });
    BoxParser4.createBoxCtor("payl", function(stream) {
      this.text = stream.readString(this.size - this.hdr_size);
    });
    BoxParser4.createBoxCtor("payt", function(stream) {
      this.payloadID = stream.readUint32();
      var count = stream.readUint8();
      this.rtpmap_string = stream.readString(count);
    });
    BoxParser4.createFullBoxCtor("pdin", function(stream) {
      var count = (this.size - this.hdr_size) / 8;
      this.rate = [];
      this.initial_delay = [];
      for (var i2 = 0; i2 < count; i2++) {
        this.rate[i2] = stream.readUint32();
        this.initial_delay[i2] = stream.readUint32();
      }
    });
    BoxParser4.createFullBoxCtor("pitm", function(stream) {
      if (this.version === 0) {
        this.item_id = stream.readUint16();
      } else {
        this.item_id = stream.readUint32();
      }
    });
    BoxParser4.createFullBoxCtor("pixi", function(stream) {
      var i2;
      this.num_channels = stream.readUint8();
      this.bits_per_channels = [];
      for (i2 = 0; i2 < this.num_channels; i2++) {
        this.bits_per_channels[i2] = stream.readUint8();
      }
    });
    BoxParser4.createBoxCtor("pmax", function(stream) {
      this.bytes = stream.readUint32();
    });
    BoxParser4.createFullBoxCtor("prdi", function(stream) {
      this.step_count = stream.readUint16();
      this.item_count = [];
      if (this.flags & 2) {
        for (var i2 = 0; i2 < this.step_count; i2++) {
          this.item_count[i2] = stream.readUint16();
        }
      }
    });
    BoxParser4.createFullBoxCtor("prft", function(stream) {
      this.ref_track_id = stream.readUint32();
      this.ntp_timestamp = stream.readUint64();
      if (this.version === 0) {
        this.media_time = stream.readUint32();
      } else {
        this.media_time = stream.readUint64();
      }
    });
    BoxParser4.createFullBoxCtor("pssh", function(stream) {
      this.system_id = BoxParser4.parseHex16(stream);
      if (this.version > 0) {
        var count = stream.readUint32();
        this.kid = [];
        for (var i2 = 0; i2 < count; i2++) {
          this.kid[i2] = BoxParser4.parseHex16(stream);
        }
      }
      var datasize = stream.readUint32();
      if (datasize > 0) {
        this.data = stream.readUint8Array(datasize);
      }
    });
    BoxParser4.createFullBoxCtor("clef", function(stream) {
      this.width = stream.readUint32();
      this.height = stream.readUint32();
    });
    BoxParser4.createFullBoxCtor("enof", function(stream) {
      this.width = stream.readUint32();
      this.height = stream.readUint32();
    });
    BoxParser4.createFullBoxCtor("prof", function(stream) {
      this.width = stream.readUint32();
      this.height = stream.readUint32();
    });
    BoxParser4.createContainerBoxCtor("tapt", null, ["clef", "prof", "enof"]);
    BoxParser4.createBoxCtor("rtp ", function(stream) {
      this.descriptionformat = stream.readString(4);
      this.sdptext = stream.readString(this.size - this.hdr_size - 4);
    });
    BoxParser4.createFullBoxCtor("saio", function(stream) {
      if (this.flags & 1) {
        this.aux_info_type = stream.readUint32();
        this.aux_info_type_parameter = stream.readUint32();
      }
      var count = stream.readUint32();
      this.offset = [];
      for (var i2 = 0; i2 < count; i2++) {
        if (this.version === 0) {
          this.offset[i2] = stream.readUint32();
        } else {
          this.offset[i2] = stream.readUint64();
        }
      }
    });
    BoxParser4.createFullBoxCtor("saiz", function(stream) {
      if (this.flags & 1) {
        this.aux_info_type = stream.readUint32();
        this.aux_info_type_parameter = stream.readUint32();
      }
      this.default_sample_info_size = stream.readUint8();
      var count = stream.readUint32();
      this.sample_info_size = [];
      if (this.default_sample_info_size === 0) {
        for (var i2 = 0; i2 < count; i2++) {
          this.sample_info_size[i2] = stream.readUint8();
        }
      }
    });
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_METADATA, "mett", function(stream) {
      this.parseHeader(stream);
      this.content_encoding = stream.readCString();
      this.mime_format = stream.readCString();
      this.parseFooter(stream);
    });
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_METADATA, "metx", function(stream) {
      this.parseHeader(stream);
      this.content_encoding = stream.readCString();
      this.namespace = stream.readCString();
      this.schema_location = stream.readCString();
      this.parseFooter(stream);
    });
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_SUBTITLE, "sbtt", function(stream) {
      this.parseHeader(stream);
      this.content_encoding = stream.readCString();
      this.mime_format = stream.readCString();
      this.parseFooter(stream);
    });
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_SUBTITLE, "stpp", function(stream) {
      this.parseHeader(stream);
      this.namespace = stream.readCString();
      this.schema_location = stream.readCString();
      this.auxiliary_mime_types = stream.readCString();
      this.parseFooter(stream);
    });
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_SUBTITLE, "stxt", function(stream) {
      this.parseHeader(stream);
      this.content_encoding = stream.readCString();
      this.mime_format = stream.readCString();
      this.parseFooter(stream);
    });
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_SUBTITLE, "tx3g", function(stream) {
      this.parseHeader(stream);
      this.displayFlags = stream.readUint32();
      this.horizontal_justification = stream.readInt8();
      this.vertical_justification = stream.readInt8();
      this.bg_color_rgba = stream.readUint8Array(4);
      this.box_record = stream.readInt16Array(4);
      this.style_record = stream.readUint8Array(12);
      this.parseFooter(stream);
    });
    BoxParser4.createSampleEntryCtor(BoxParser4.SAMPLE_ENTRY_TYPE_METADATA, "wvtt", function(stream) {
      this.parseHeader(stream);
      this.parseFooter(stream);
    });
    BoxParser4.createSampleGroupCtor("alst", function(stream) {
      var i2;
      var roll_count = stream.readUint16();
      this.first_output_sample = stream.readUint16();
      this.sample_offset = [];
      for (i2 = 0; i2 < roll_count; i2++) {
        this.sample_offset[i2] = stream.readUint32();
      }
      var remaining = this.description_length - 4 - 4 * roll_count;
      this.num_output_samples = [];
      this.num_total_samples = [];
      for (i2 = 0; i2 < remaining / 4; i2++) {
        this.num_output_samples[i2] = stream.readUint16();
        this.num_total_samples[i2] = stream.readUint16();
      }
    });
    BoxParser4.createSampleGroupCtor("avll", function(stream) {
      this.layerNumber = stream.readUint8();
      this.accurateStatisticsFlag = stream.readUint8();
      this.avgBitRate = stream.readUint16();
      this.avgFrameRate = stream.readUint16();
    });
    BoxParser4.createSampleGroupCtor("avss", function(stream) {
      this.subSequenceIdentifier = stream.readUint16();
      this.layerNumber = stream.readUint8();
      var tmp_byte = stream.readUint8();
      this.durationFlag = tmp_byte >> 7;
      this.avgRateFlag = tmp_byte >> 6 & 1;
      if (this.durationFlag) {
        this.duration = stream.readUint32();
      }
      if (this.avgRateFlag) {
        this.accurateStatisticsFlag = stream.readUint8();
        this.avgBitRate = stream.readUint16();
        this.avgFrameRate = stream.readUint16();
      }
      this.dependency = [];
      var numReferences = stream.readUint8();
      for (var i2 = 0; i2 < numReferences; i2++) {
        var dependencyInfo = {};
        this.dependency.push(dependencyInfo);
        dependencyInfo.subSeqDirectionFlag = stream.readUint8();
        dependencyInfo.layerNumber = stream.readUint8();
        dependencyInfo.subSequenceIdentifier = stream.readUint16();
      }
    });
    BoxParser4.createSampleGroupCtor("dtrt", function(stream) {
      Log2.warn("BoxParser", "Sample Group type: " + this.grouping_type + " not fully parsed");
    });
    BoxParser4.createSampleGroupCtor("mvif", function(stream) {
      Log2.warn("BoxParser", "Sample Group type: " + this.grouping_type + " not fully parsed");
    });
    BoxParser4.createSampleGroupCtor("prol", function(stream) {
      this.roll_distance = stream.readInt16();
    });
    BoxParser4.createSampleGroupCtor("rap ", function(stream) {
      var tmp_byte = stream.readUint8();
      this.num_leading_samples_known = tmp_byte >> 7;
      this.num_leading_samples = tmp_byte & 127;
    });
    BoxParser4.createSampleGroupCtor("rash", function(stream) {
      this.operation_point_count = stream.readUint16();
      if (this.description_length !== 2 + (this.operation_point_count === 1 ? 2 : this.operation_point_count * 6) + 9) {
        Log2.warn("BoxParser", "Mismatch in " + this.grouping_type + " sample group length");
        this.data = stream.readUint8Array(this.description_length - 2);
      } else {
        if (this.operation_point_count === 1) {
          this.target_rate_share = stream.readUint16();
        } else {
          this.target_rate_share = [];
          this.available_bitrate = [];
          for (var i2 = 0; i2 < this.operation_point_count; i2++) {
            this.available_bitrate[i2] = stream.readUint32();
            this.target_rate_share[i2] = stream.readUint16();
          }
        }
        this.maximum_bitrate = stream.readUint32();
        this.minimum_bitrate = stream.readUint32();
        this.discard_priority = stream.readUint8();
      }
    });
    BoxParser4.createSampleGroupCtor("roll", function(stream) {
      this.roll_distance = stream.readInt16();
    });
    BoxParser4.SampleGroupEntry.prototype.parse = function(stream) {
      Log2.warn("BoxParser", "Unknown Sample Group type: " + this.grouping_type);
      this.data = stream.readUint8Array(this.description_length);
    };
    BoxParser4.createSampleGroupCtor("scif", function(stream) {
      Log2.warn("BoxParser", "Sample Group type: " + this.grouping_type + " not fully parsed");
    });
    BoxParser4.createSampleGroupCtor("scnm", function(stream) {
      Log2.warn("BoxParser", "Sample Group type: " + this.grouping_type + " not fully parsed");
    });
    BoxParser4.createSampleGroupCtor("seig", function(stream) {
      this.reserved = stream.readUint8();
      var tmp = stream.readUint8();
      this.crypt_byte_block = tmp >> 4;
      this.skip_byte_block = tmp & 15;
      this.isProtected = stream.readUint8();
      this.Per_Sample_IV_Size = stream.readUint8();
      this.KID = BoxParser4.parseHex16(stream);
      this.constant_IV_size = 0;
      this.constant_IV = 0;
      if (this.isProtected === 1 && this.Per_Sample_IV_Size === 0) {
        this.constant_IV_size = stream.readUint8();
        this.constant_IV = stream.readUint8Array(this.constant_IV_size);
      }
    });
    BoxParser4.createSampleGroupCtor("stsa", function(stream) {
      Log2.warn("BoxParser", "Sample Group type: " + this.grouping_type + " not fully parsed");
    });
    BoxParser4.createSampleGroupCtor("sync", function(stream) {
      var tmp_byte = stream.readUint8();
      this.NAL_unit_type = tmp_byte & 63;
    });
    BoxParser4.createSampleGroupCtor("tele", function(stream) {
      var tmp_byte = stream.readUint8();
      this.level_independently_decodable = tmp_byte >> 7;
    });
    BoxParser4.createSampleGroupCtor("tsas", function(stream) {
      Log2.warn("BoxParser", "Sample Group type: " + this.grouping_type + " not fully parsed");
    });
    BoxParser4.createSampleGroupCtor("tscl", function(stream) {
      Log2.warn("BoxParser", "Sample Group type: " + this.grouping_type + " not fully parsed");
    });
    BoxParser4.createSampleGroupCtor("vipr", function(stream) {
      Log2.warn("BoxParser", "Sample Group type: " + this.grouping_type + " not fully parsed");
    });
    BoxParser4.createFullBoxCtor("sbgp", function(stream) {
      this.grouping_type = stream.readString(4);
      if (this.version === 1) {
        this.grouping_type_parameter = stream.readUint32();
      } else {
        this.grouping_type_parameter = 0;
      }
      this.entries = [];
      var entry_count2 = stream.readUint32();
      for (var i2 = 0; i2 < entry_count2; i2++) {
        var entry = {};
        this.entries.push(entry);
        entry.sample_count = stream.readInt32();
        entry.group_description_index = stream.readInt32();
      }
    });
    BoxParser4.createFullBoxCtor("schm", function(stream) {
      this.scheme_type = stream.readString(4);
      this.scheme_version = stream.readUint32();
      if (this.flags & 1) {
        this.scheme_uri = stream.readString(this.size - this.hdr_size - 8);
      }
    });
    BoxParser4.createBoxCtor("sdp ", function(stream) {
      this.sdptext = stream.readString(this.size - this.hdr_size);
    });
    BoxParser4.createFullBoxCtor("sdtp", function(stream) {
      var tmp_byte;
      var count = this.size - this.hdr_size;
      this.is_leading = [];
      this.sample_depends_on = [];
      this.sample_is_depended_on = [];
      this.sample_has_redundancy = [];
      for (var i2 = 0; i2 < count; i2++) {
        tmp_byte = stream.readUint8();
        this.is_leading[i2] = tmp_byte >> 6;
        this.sample_depends_on[i2] = tmp_byte >> 4 & 3;
        this.sample_is_depended_on[i2] = tmp_byte >> 2 & 3;
        this.sample_has_redundancy[i2] = tmp_byte & 3;
      }
    });
    BoxParser4.createFullBoxCtor(
      "senc"
      /*, function(stream) {
      	this.parseFullHeader(stream);
      	var sample_count = stream.readUint32();
      	this.samples = [];
      	for (var i = 0; i < sample_count; i++) {
      		var sample = {};
      		// tenc.default_Per_Sample_IV_Size or seig.Per_Sample_IV_Size
      		sample.InitializationVector = this.readUint8Array(Per_Sample_IV_Size*8);
      		if (this.flags & 0x2) {
      			sample.subsamples = [];
      			subsample_count = stream.readUint16();
      			for (var j = 0; j < subsample_count; j++) {
      				var subsample = {};
      				subsample.BytesOfClearData = stream.readUint16();
      				subsample.BytesOfProtectedData = stream.readUint32();
      				sample.subsamples.push(subsample);
      			}
      		}
      		// TODO
      		this.samples.push(sample);
      	}
      }*/
    );
    BoxParser4.createFullBoxCtor("sgpd", function(stream) {
      this.grouping_type = stream.readString(4);
      Log2.debug("BoxParser", "Found Sample Groups of type " + this.grouping_type);
      if (this.version === 1) {
        this.default_length = stream.readUint32();
      } else {
        this.default_length = 0;
      }
      if (this.version >= 2) {
        this.default_group_description_index = stream.readUint32();
      }
      this.entries = [];
      var entry_count2 = stream.readUint32();
      for (var i2 = 0; i2 < entry_count2; i2++) {
        var entry;
        if (BoxParser4[this.grouping_type + "SampleGroupEntry"]) {
          entry = new BoxParser4[this.grouping_type + "SampleGroupEntry"](this.grouping_type);
        } else {
          entry = new BoxParser4.SampleGroupEntry(this.grouping_type);
        }
        this.entries.push(entry);
        if (this.version === 1) {
          if (this.default_length === 0) {
            entry.description_length = stream.readUint32();
          } else {
            entry.description_length = this.default_length;
          }
        } else {
          entry.description_length = this.default_length;
        }
        if (entry.write === BoxParser4.SampleGroupEntry.prototype.write) {
          Log2.info("BoxParser", "SampleGroup for type " + this.grouping_type + " writing not yet implemented, keeping unparsed data in memory for later write");
          entry.data = stream.readUint8Array(entry.description_length);
          stream.position -= entry.description_length;
        }
        entry.parse(stream);
      }
    });
    BoxParser4.createFullBoxCtor("sidx", function(stream) {
      this.reference_ID = stream.readUint32();
      this.timescale = stream.readUint32();
      if (this.version === 0) {
        this.earliest_presentation_time = stream.readUint32();
        this.first_offset = stream.readUint32();
      } else {
        this.earliest_presentation_time = stream.readUint64();
        this.first_offset = stream.readUint64();
      }
      stream.readUint16();
      this.references = [];
      var count = stream.readUint16();
      for (var i2 = 0; i2 < count; i2++) {
        var ref = {};
        this.references.push(ref);
        var tmp_32 = stream.readUint32();
        ref.reference_type = tmp_32 >> 31 & 1;
        ref.referenced_size = tmp_32 & 2147483647;
        ref.subsegment_duration = stream.readUint32();
        tmp_32 = stream.readUint32();
        ref.starts_with_SAP = tmp_32 >> 31 & 1;
        ref.SAP_type = tmp_32 >> 28 & 7;
        ref.SAP_delta_time = tmp_32 & 268435455;
      }
    });
    BoxParser4.SingleItemTypeReferenceBox = function(type, size, hdr_size, start) {
      BoxParser4.Box.call(this, type, size);
      this.hdr_size = hdr_size;
      this.start = start;
    };
    BoxParser4.SingleItemTypeReferenceBox.prototype = new BoxParser4.Box();
    BoxParser4.SingleItemTypeReferenceBox.prototype.parse = function(stream) {
      this.from_item_ID = stream.readUint16();
      var count = stream.readUint16();
      this.references = [];
      for (var i2 = 0; i2 < count; i2++) {
        this.references[i2] = {};
        this.references[i2].to_item_ID = stream.readUint16();
      }
    };
    BoxParser4.SingleItemTypeReferenceBoxLarge = function(type, size, hdr_size, start) {
      BoxParser4.Box.call(this, type, size);
      this.hdr_size = hdr_size;
      this.start = start;
    };
    BoxParser4.SingleItemTypeReferenceBoxLarge.prototype = new BoxParser4.Box();
    BoxParser4.SingleItemTypeReferenceBoxLarge.prototype.parse = function(stream) {
      this.from_item_ID = stream.readUint32();
      var count = stream.readUint16();
      this.references = [];
      for (var i2 = 0; i2 < count; i2++) {
        this.references[i2] = {};
        this.references[i2].to_item_ID = stream.readUint32();
      }
    };
    BoxParser4.createFullBoxCtor("SmDm", function(stream) {
      this.primaryRChromaticity_x = stream.readUint16();
      this.primaryRChromaticity_y = stream.readUint16();
      this.primaryGChromaticity_x = stream.readUint16();
      this.primaryGChromaticity_y = stream.readUint16();
      this.primaryBChromaticity_x = stream.readUint16();
      this.primaryBChromaticity_y = stream.readUint16();
      this.whitePointChromaticity_x = stream.readUint16();
      this.whitePointChromaticity_y = stream.readUint16();
      this.luminanceMax = stream.readUint32();
      this.luminanceMin = stream.readUint32();
    });
    BoxParser4.createFullBoxCtor("smhd", function(stream) {
      this.balance = stream.readUint16();
      stream.readUint16();
    });
    BoxParser4.createFullBoxCtor("ssix", function(stream) {
      this.subsegments = [];
      var subsegment_count = stream.readUint32();
      for (var i2 = 0; i2 < subsegment_count; i2++) {
        var subsegment = {};
        this.subsegments.push(subsegment);
        subsegment.ranges = [];
        var range_count = stream.readUint32();
        for (var j = 0; j < range_count; j++) {
          var range = {};
          subsegment.ranges.push(range);
          range.level = stream.readUint8();
          range.range_size = stream.readUint24();
        }
      }
    });
    BoxParser4.createFullBoxCtor("stco", function(stream) {
      var entry_count2;
      entry_count2 = stream.readUint32();
      this.chunk_offsets = [];
      if (this.version === 0) {
        for (var i2 = 0; i2 < entry_count2; i2++) {
          this.chunk_offsets.push(stream.readUint32());
        }
      }
    });
    BoxParser4.createFullBoxCtor("stdp", function(stream) {
      var count = (this.size - this.hdr_size) / 2;
      this.priority = [];
      for (var i2 = 0; i2 < count; i2++) {
        this.priority[i2] = stream.readUint16();
      }
    });
    BoxParser4.createFullBoxCtor("sthd");
    BoxParser4.createFullBoxCtor("stri", function(stream) {
      this.switch_group = stream.readUint16();
      this.alternate_group = stream.readUint16();
      this.sub_track_id = stream.readUint32();
      var count = (this.size - this.hdr_size - 8) / 4;
      this.attribute_list = [];
      for (var i2 = 0; i2 < count; i2++) {
        this.attribute_list[i2] = stream.readUint32();
      }
    });
    BoxParser4.createFullBoxCtor("stsc", function(stream) {
      var entry_count2;
      var i2;
      entry_count2 = stream.readUint32();
      this.first_chunk = [];
      this.samples_per_chunk = [];
      this.sample_description_index = [];
      if (this.version === 0) {
        for (i2 = 0; i2 < entry_count2; i2++) {
          this.first_chunk.push(stream.readUint32());
          this.samples_per_chunk.push(stream.readUint32());
          this.sample_description_index.push(stream.readUint32());
        }
      }
    });
    BoxParser4.createFullBoxCtor("stsd", function(stream) {
      var i2;
      var ret2;
      var entryCount;
      var box2;
      this.entries = [];
      entryCount = stream.readUint32();
      for (i2 = 1; i2 <= entryCount; i2++) {
        ret2 = BoxParser4.parseOneBox(stream, true, this.size - (stream.getPosition() - this.start));
        if (ret2.code === BoxParser4.OK) {
          if (BoxParser4[ret2.type + "SampleEntry"]) {
            box2 = new BoxParser4[ret2.type + "SampleEntry"](ret2.size);
            box2.hdr_size = ret2.hdr_size;
            box2.start = ret2.start;
          } else {
            Log2.warn("BoxParser", "Unknown sample entry type: " + ret2.type);
            box2 = new BoxParser4.SampleEntry(ret2.type, ret2.size, ret2.hdr_size, ret2.start);
          }
          if (box2.write === BoxParser4.SampleEntry.prototype.write) {
            Log2.info("BoxParser", "SampleEntry " + box2.type + " box writing not yet implemented, keeping unparsed data in memory for later write");
            box2.parseDataAndRewind(stream);
          }
          box2.parse(stream);
          this.entries.push(box2);
        } else {
          return;
        }
      }
    });
    BoxParser4.createFullBoxCtor("stsg", function(stream) {
      this.grouping_type = stream.readUint32();
      var count = stream.readUint16();
      this.group_description_index = [];
      for (var i2 = 0; i2 < count; i2++) {
        this.group_description_index[i2] = stream.readUint32();
      }
    });
    BoxParser4.createFullBoxCtor("stsh", function(stream) {
      var entry_count2;
      var i2;
      entry_count2 = stream.readUint32();
      this.shadowed_sample_numbers = [];
      this.sync_sample_numbers = [];
      if (this.version === 0) {
        for (i2 = 0; i2 < entry_count2; i2++) {
          this.shadowed_sample_numbers.push(stream.readUint32());
          this.sync_sample_numbers.push(stream.readUint32());
        }
      }
    });
    BoxParser4.createFullBoxCtor("stss", function(stream) {
      var i2;
      var entry_count2;
      entry_count2 = stream.readUint32();
      if (this.version === 0) {
        this.sample_numbers = [];
        for (i2 = 0; i2 < entry_count2; i2++) {
          this.sample_numbers.push(stream.readUint32());
        }
      }
    });
    BoxParser4.createFullBoxCtor("stsz", function(stream) {
      var i2;
      this.sample_sizes = [];
      if (this.version === 0) {
        this.sample_size = stream.readUint32();
        this.sample_count = stream.readUint32();
        for (i2 = 0; i2 < this.sample_count; i2++) {
          if (this.sample_size === 0) {
            this.sample_sizes.push(stream.readUint32());
          } else {
            this.sample_sizes[i2] = this.sample_size;
          }
        }
      }
    });
    BoxParser4.createFullBoxCtor("stts", function(stream) {
      var entry_count2;
      var i2;
      var delta;
      entry_count2 = stream.readUint32();
      this.sample_counts = [];
      this.sample_deltas = [];
      if (this.version === 0) {
        for (i2 = 0; i2 < entry_count2; i2++) {
          this.sample_counts.push(stream.readUint32());
          delta = stream.readInt32();
          if (delta < 0) {
            Log2.warn("BoxParser", "File uses negative stts sample delta, using value 1 instead, sync may be lost!");
            delta = 1;
          }
          this.sample_deltas.push(delta);
        }
      }
    });
    BoxParser4.createFullBoxCtor("stvi", function(stream) {
      var tmp32 = stream.readUint32();
      this.single_view_allowed = tmp32 & 3;
      this.stereo_scheme = stream.readUint32();
      var length = stream.readUint32();
      this.stereo_indication_type = stream.readString(length);
      var ret2;
      var box2;
      this.boxes = [];
      while (stream.getPosition() < this.start + this.size) {
        ret2 = BoxParser4.parseOneBox(stream, false, this.size - (stream.getPosition() - this.start));
        if (ret2.code === BoxParser4.OK) {
          box2 = ret2.box;
          this.boxes.push(box2);
          this[box2.type] = box2;
        } else {
          return;
        }
      }
    });
    BoxParser4.createBoxCtor("styp", function(stream) {
      BoxParser4.ftypBox.prototype.parse.call(this, stream);
    });
    BoxParser4.createFullBoxCtor("stz2", function(stream) {
      var i2;
      var sample_size;
      var sample_count;
      this.sample_sizes = [];
      if (this.version === 0) {
        this.reserved = stream.readUint24();
        this.field_size = stream.readUint8();
        sample_count = stream.readUint32();
        if (this.field_size === 4) {
          for (i2 = 0; i2 < sample_count; i2 += 2) {
            var tmp = stream.readUint8();
            this.sample_sizes[i2] = tmp >> 4 & 15;
            this.sample_sizes[i2 + 1] = tmp & 15;
          }
        } else if (this.field_size === 8) {
          for (i2 = 0; i2 < sample_count; i2++) {
            this.sample_sizes[i2] = stream.readUint8();
          }
        } else if (this.field_size === 16) {
          for (i2 = 0; i2 < sample_count; i2++) {
            this.sample_sizes[i2] = stream.readUint16();
          }
        } else {
          Log2.error("BoxParser", "Error in length field in stz2 box");
        }
      }
    });
    BoxParser4.createFullBoxCtor("subs", function(stream) {
      var i2, j;
      var entry_count2;
      var subsample_count;
      entry_count2 = stream.readUint32();
      this.entries = [];
      for (i2 = 0; i2 < entry_count2; i2++) {
        var sampleInfo = {};
        this.entries[i2] = sampleInfo;
        sampleInfo.sample_delta = stream.readUint32();
        sampleInfo.subsamples = [];
        subsample_count = stream.readUint16();
        if (subsample_count > 0) {
          for (j = 0; j < subsample_count; j++) {
            var subsample = {};
            sampleInfo.subsamples.push(subsample);
            if (this.version == 1) {
              subsample.size = stream.readUint32();
            } else {
              subsample.size = stream.readUint16();
            }
            subsample.priority = stream.readUint8();
            subsample.discardable = stream.readUint8();
            subsample.codec_specific_parameters = stream.readUint32();
          }
        }
      }
    });
    BoxParser4.createFullBoxCtor("tenc", function(stream) {
      stream.readUint8();
      if (this.version === 0) {
        stream.readUint8();
      } else {
        var tmp = stream.readUint8();
        this.default_crypt_byte_block = tmp >> 4 & 15;
        this.default_skip_byte_block = tmp & 15;
      }
      this.default_isProtected = stream.readUint8();
      this.default_Per_Sample_IV_Size = stream.readUint8();
      this.default_KID = BoxParser4.parseHex16(stream);
      if (this.default_isProtected === 1 && this.default_Per_Sample_IV_Size === 0) {
        this.default_constant_IV_size = stream.readUint8();
        this.default_constant_IV = stream.readUint8Array(this.default_constant_IV_size);
      }
    });
    BoxParser4.createFullBoxCtor("tfdt", function(stream) {
      if (this.version == 1) {
        this.baseMediaDecodeTime = stream.readUint64();
      } else {
        this.baseMediaDecodeTime = stream.readUint32();
      }
    });
    BoxParser4.createFullBoxCtor("tfhd", function(stream) {
      var readBytes = 0;
      this.track_id = stream.readUint32();
      if (this.size - this.hdr_size > readBytes && this.flags & BoxParser4.TFHD_FLAG_BASE_DATA_OFFSET) {
        this.base_data_offset = stream.readUint64();
        readBytes += 8;
      } else {
        this.base_data_offset = 0;
      }
      if (this.size - this.hdr_size > readBytes && this.flags & BoxParser4.TFHD_FLAG_SAMPLE_DESC) {
        this.default_sample_description_index = stream.readUint32();
        readBytes += 4;
      } else {
        this.default_sample_description_index = 0;
      }
      if (this.size - this.hdr_size > readBytes && this.flags & BoxParser4.TFHD_FLAG_SAMPLE_DUR) {
        this.default_sample_duration = stream.readUint32();
        readBytes += 4;
      } else {
        this.default_sample_duration = 0;
      }
      if (this.size - this.hdr_size > readBytes && this.flags & BoxParser4.TFHD_FLAG_SAMPLE_SIZE) {
        this.default_sample_size = stream.readUint32();
        readBytes += 4;
      } else {
        this.default_sample_size = 0;
      }
      if (this.size - this.hdr_size > readBytes && this.flags & BoxParser4.TFHD_FLAG_SAMPLE_FLAGS) {
        this.default_sample_flags = stream.readUint32();
        readBytes += 4;
      } else {
        this.default_sample_flags = 0;
      }
    });
    BoxParser4.createFullBoxCtor("tfra", function(stream) {
      this.track_ID = stream.readUint32();
      stream.readUint24();
      var tmp_byte = stream.readUint8();
      this.length_size_of_traf_num = tmp_byte >> 4 & 3;
      this.length_size_of_trun_num = tmp_byte >> 2 & 3;
      this.length_size_of_sample_num = tmp_byte & 3;
      this.entries = [];
      var number_of_entries = stream.readUint32();
      for (var i2 = 0; i2 < number_of_entries; i2++) {
        if (this.version === 1) {
          this.time = stream.readUint64();
          this.moof_offset = stream.readUint64();
        } else {
          this.time = stream.readUint32();
          this.moof_offset = stream.readUint32();
        }
        this.traf_number = stream["readUint" + 8 * (this.length_size_of_traf_num + 1)]();
        this.trun_number = stream["readUint" + 8 * (this.length_size_of_trun_num + 1)]();
        this.sample_number = stream["readUint" + 8 * (this.length_size_of_sample_num + 1)]();
      }
    });
    BoxParser4.createFullBoxCtor("tkhd", function(stream) {
      if (this.version == 1) {
        this.creation_time = stream.readUint64();
        this.modification_time = stream.readUint64();
        this.track_id = stream.readUint32();
        stream.readUint32();
        this.duration = stream.readUint64();
      } else {
        this.creation_time = stream.readUint32();
        this.modification_time = stream.readUint32();
        this.track_id = stream.readUint32();
        stream.readUint32();
        this.duration = stream.readUint32();
      }
      stream.readUint32Array(2);
      this.layer = stream.readInt16();
      this.alternate_group = stream.readInt16();
      this.volume = stream.readInt16() >> 8;
      stream.readUint16();
      this.matrix = stream.readInt32Array(9);
      this.width = stream.readUint32();
      this.height = stream.readUint32();
    });
    BoxParser4.createBoxCtor("tmax", function(stream) {
      this.time = stream.readUint32();
    });
    BoxParser4.createBoxCtor("tmin", function(stream) {
      this.time = stream.readUint32();
    });
    BoxParser4.createBoxCtor("totl", function(stream) {
      this.bytessent = stream.readUint32();
    });
    BoxParser4.createBoxCtor("tpay", function(stream) {
      this.bytessent = stream.readUint32();
    });
    BoxParser4.createBoxCtor("tpyl", function(stream) {
      this.bytessent = stream.readUint64();
    });
    BoxParser4.TrackGroupTypeBox.prototype.parse = function(stream) {
      this.parseFullHeader(stream);
      this.track_group_id = stream.readUint32();
    };
    BoxParser4.createTrackGroupCtor("msrc");
    BoxParser4.TrackReferenceTypeBox = function(type, size, hdr_size, start) {
      BoxParser4.Box.call(this, type, size);
      this.hdr_size = hdr_size;
      this.start = start;
    };
    BoxParser4.TrackReferenceTypeBox.prototype = new BoxParser4.Box();
    BoxParser4.TrackReferenceTypeBox.prototype.parse = function(stream) {
      this.track_ids = stream.readUint32Array((this.size - this.hdr_size) / 4);
    };
    BoxParser4.trefBox.prototype.parse = function(stream) {
      var ret2;
      var box2;
      while (stream.getPosition() < this.start + this.size) {
        ret2 = BoxParser4.parseOneBox(stream, true, this.size - (stream.getPosition() - this.start));
        if (ret2.code === BoxParser4.OK) {
          box2 = new BoxParser4.TrackReferenceTypeBox(ret2.type, ret2.size, ret2.hdr_size, ret2.start);
          if (box2.write === BoxParser4.Box.prototype.write && box2.type !== "mdat") {
            Log2.info("BoxParser", "TrackReference " + box2.type + " box writing not yet implemented, keeping unparsed data in memory for later write");
            box2.parseDataAndRewind(stream);
          }
          box2.parse(stream);
          this.boxes.push(box2);
        } else {
          return;
        }
      }
    };
    BoxParser4.createFullBoxCtor("trep", function(stream) {
      this.track_ID = stream.readUint32();
      this.boxes = [];
      while (stream.getPosition() < this.start + this.size) {
        ret = BoxParser4.parseOneBox(stream, false, this.size - (stream.getPosition() - this.start));
        if (ret.code === BoxParser4.OK) {
          box = ret.box;
          this.boxes.push(box);
        } else {
          return;
        }
      }
    });
    BoxParser4.createFullBoxCtor("trex", function(stream) {
      this.track_id = stream.readUint32();
      this.default_sample_description_index = stream.readUint32();
      this.default_sample_duration = stream.readUint32();
      this.default_sample_size = stream.readUint32();
      this.default_sample_flags = stream.readUint32();
    });
    BoxParser4.createBoxCtor("trpy", function(stream) {
      this.bytessent = stream.readUint64();
    });
    BoxParser4.createFullBoxCtor("trun", function(stream) {
      var readBytes = 0;
      this.sample_count = stream.readUint32();
      readBytes += 4;
      if (this.size - this.hdr_size > readBytes && this.flags & BoxParser4.TRUN_FLAGS_DATA_OFFSET) {
        this.data_offset = stream.readInt32();
        readBytes += 4;
      } else {
        this.data_offset = 0;
      }
      if (this.size - this.hdr_size > readBytes && this.flags & BoxParser4.TRUN_FLAGS_FIRST_FLAG) {
        this.first_sample_flags = stream.readUint32();
        readBytes += 4;
      } else {
        this.first_sample_flags = 0;
      }
      this.sample_duration = [];
      this.sample_size = [];
      this.sample_flags = [];
      this.sample_composition_time_offset = [];
      if (this.size - this.hdr_size > readBytes) {
        for (var i2 = 0; i2 < this.sample_count; i2++) {
          if (this.flags & BoxParser4.TRUN_FLAGS_DURATION) {
            this.sample_duration[i2] = stream.readUint32();
          }
          if (this.flags & BoxParser4.TRUN_FLAGS_SIZE) {
            this.sample_size[i2] = stream.readUint32();
          }
          if (this.flags & BoxParser4.TRUN_FLAGS_FLAGS) {
            this.sample_flags[i2] = stream.readUint32();
          }
          if (this.flags & BoxParser4.TRUN_FLAGS_CTS_OFFSET) {
            if (this.version === 0) {
              this.sample_composition_time_offset[i2] = stream.readUint32();
            } else {
              this.sample_composition_time_offset[i2] = stream.readInt32();
            }
          }
        }
      }
    });
    BoxParser4.createFullBoxCtor("tsel", function(stream) {
      this.switch_group = stream.readUint32();
      var count = (this.size - this.hdr_size - 4) / 4;
      this.attribute_list = [];
      for (var i2 = 0; i2 < count; i2++) {
        this.attribute_list[i2] = stream.readUint32();
      }
    });
    BoxParser4.createFullBoxCtor("txtC", function(stream) {
      this.config = stream.readCString();
    });
    BoxParser4.createBoxCtor("tyco", function(stream) {
      var count = (this.size - this.hdr_size) / 4;
      this.compatible_brands = [];
      for (var i2 = 0; i2 < count; i2++) {
        this.compatible_brands[i2] = stream.readString(4);
      }
    });
    BoxParser4.createFullBoxCtor("udes", function(stream) {
      this.lang = stream.readCString();
      this.name = stream.readCString();
      this.description = stream.readCString();
      this.tags = stream.readCString();
    });
    BoxParser4.createFullBoxCtor("uncC", function(stream) {
      var i2;
      this.profile = stream.readUint32();
      this.component_count = stream.readUint16();
      this.component_index = [];
      this.component_bit_depth_minus_one = [];
      this.component_format = [];
      this.component_align_size = [];
      for (i2 = 0; i2 < this.component_count; i2++) {
        this.component_index.push(stream.readUint16());
        this.component_bit_depth_minus_one.push(stream.readUint8());
        this.component_format.push(stream.readUint8());
        this.component_align_size.push(stream.readUint8());
      }
      this.sampling_type = stream.readUint8();
      this.interleave_type = stream.readUint8();
      this.block_size = stream.readUint8();
      var flags = stream.readUint8();
      this.component_little_endian = flags >> 7 & 1;
      this.block_pad_lsb = flags >> 6 & 1;
      this.block_little_endian = flags >> 5 & 1;
      this.block_reversed = flags >> 4 & 1;
      this.pad_unknown = flags >> 3 & 1;
      this.pixel_size = stream.readUint8();
      this.row_align_size = stream.readUint32();
      this.tile_align_size = stream.readUint32();
      this.num_tile_cols_minus_one = stream.readUint32();
      this.num_tile_rows_minus_one = stream.readUint32();
    });
    BoxParser4.createFullBoxCtor("url ", function(stream) {
      if (this.flags !== 1) {
        this.location = stream.readCString();
      }
    });
    BoxParser4.createFullBoxCtor("urn ", function(stream) {
      this.name = stream.readCString();
      if (this.size - this.hdr_size - this.name.length - 1 > 0) {
        this.location = stream.readCString();
      }
    });
    BoxParser4.createUUIDBox("a5d40b30e81411ddba2f0800200c9a66", true, false, function(stream) {
      this.LiveServerManifest = stream.readString(this.size - this.hdr_size).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
    });
    BoxParser4.createUUIDBox("d08a4f1810f34a82b6c832d8aba183d3", true, false, function(stream) {
      this.system_id = BoxParser4.parseHex16(stream);
      var datasize = stream.readUint32();
      if (datasize > 0) {
        this.data = stream.readUint8Array(datasize);
      }
    });
    BoxParser4.createUUIDBox(
      "a2394f525a9b4f14a2446c427c648df4",
      true,
      false
      /*, function(stream) {
      	if (this.flags & 0x1) {
      		this.AlgorithmID = stream.readUint24();
      		this.IV_size = stream.readUint8();
      		this.KID = BoxParser.parseHex16(stream);
      	}
      	var sample_count = stream.readUint32();
      	this.samples = [];
      	for (var i = 0; i < sample_count; i++) {
      		var sample = {};
      		sample.InitializationVector = this.readUint8Array(this.IV_size*8);
      		if (this.flags & 0x2) {
      			sample.subsamples = [];
      			sample.NumberOfEntries = stream.readUint16();
      			for (var j = 0; j < sample.NumberOfEntries; j++) {
      				var subsample = {};
      				subsample.BytesOfClearData = stream.readUint16();
      				subsample.BytesOfProtectedData = stream.readUint32();
      				sample.subsamples.push(subsample);
      			}
      		}
      		this.samples.push(sample);
      	}
      }*/
    );
    BoxParser4.createUUIDBox("8974dbce7be74c5184f97148f9882554", true, false, function(stream) {
      this.default_AlgorithmID = stream.readUint24();
      this.default_IV_size = stream.readUint8();
      this.default_KID = BoxParser4.parseHex16(stream);
    });
    BoxParser4.createUUIDBox("d4807ef2ca3946958e5426cb9e46a79f", true, false, function(stream) {
      this.fragment_count = stream.readUint8();
      this.entries = [];
      for (var i2 = 0; i2 < this.fragment_count; i2++) {
        var entry = {};
        var absolute_time = 0;
        var absolute_duration = 0;
        if (this.version === 1) {
          absolute_time = stream.readUint64();
          absolute_duration = stream.readUint64();
        } else {
          absolute_time = stream.readUint32();
          absolute_duration = stream.readUint32();
        }
        entry.absolute_time = absolute_time;
        entry.absolute_duration = absolute_duration;
        this.entries.push(entry);
      }
    });
    BoxParser4.createUUIDBox("6d1d9b0542d544e680e2141daff757b2", true, false, function(stream) {
      if (this.version === 1) {
        this.absolute_time = stream.readUint64();
        this.duration = stream.readUint64();
      } else {
        this.absolute_time = stream.readUint32();
        this.duration = stream.readUint32();
      }
    });
    BoxParser4.createFullBoxCtor("vmhd", function(stream) {
      this.graphicsmode = stream.readUint16();
      this.opcolor = stream.readUint16Array(3);
    });
    BoxParser4.createFullBoxCtor("vpcC", function(stream) {
      var tmp;
      if (this.version === 1) {
        this.profile = stream.readUint8();
        this.level = stream.readUint8();
        tmp = stream.readUint8();
        this.bitDepth = tmp >> 4;
        this.chromaSubsampling = tmp >> 1 & 7;
        this.videoFullRangeFlag = tmp & 1;
        this.colourPrimaries = stream.readUint8();
        this.transferCharacteristics = stream.readUint8();
        this.matrixCoefficients = stream.readUint8();
        this.codecIntializationDataSize = stream.readUint16();
        this.codecIntializationData = stream.readUint8Array(this.codecIntializationDataSize);
      } else {
        this.profile = stream.readUint8();
        this.level = stream.readUint8();
        tmp = stream.readUint8();
        this.bitDepth = tmp >> 4 & 15;
        this.colorSpace = tmp & 15;
        tmp = stream.readUint8();
        this.chromaSubsampling = tmp >> 4 & 15;
        this.transferFunction = tmp >> 1 & 7;
        this.videoFullRangeFlag = tmp & 1;
        this.codecIntializationDataSize = stream.readUint16();
        this.codecIntializationData = stream.readUint8Array(this.codecIntializationDataSize);
      }
    });
    BoxParser4.createBoxCtor("vttC", function(stream) {
      this.text = stream.readString(this.size - this.hdr_size);
    });
    BoxParser4.createFullBoxCtor("vvcC", function(stream) {
      var i2, j;
      var bitReader = {
        held_bits: void 0,
        num_held_bits: 0,
        stream_read_1_bytes: function(strm2) {
          this.held_bits = strm2.readUint8();
          this.num_held_bits = 1 * 8;
        },
        stream_read_2_bytes: function(strm2) {
          this.held_bits = strm2.readUint16();
          this.num_held_bits = 2 * 8;
        },
        extract_bits: function(num_bits) {
          var ret2 = this.held_bits >> this.num_held_bits - num_bits & (1 << num_bits) - 1;
          this.num_held_bits -= num_bits;
          return ret2;
        }
      };
      bitReader.stream_read_1_bytes(stream);
      bitReader.extract_bits(5);
      this.lengthSizeMinusOne = bitReader.extract_bits(2);
      this.ptl_present_flag = bitReader.extract_bits(1);
      if (this.ptl_present_flag) {
        bitReader.stream_read_2_bytes(stream);
        this.ols_idx = bitReader.extract_bits(9);
        this.num_sublayers = bitReader.extract_bits(3);
        this.constant_frame_rate = bitReader.extract_bits(2);
        this.chroma_format_idc = bitReader.extract_bits(2);
        bitReader.stream_read_1_bytes(stream);
        this.bit_depth_minus8 = bitReader.extract_bits(3);
        bitReader.extract_bits(5);
        {
          bitReader.stream_read_2_bytes(stream);
          bitReader.extract_bits(2);
          this.num_bytes_constraint_info = bitReader.extract_bits(6);
          this.general_profile_idc = bitReader.extract_bits(7);
          this.general_tier_flag = bitReader.extract_bits(1);
          this.general_level_idc = stream.readUint8();
          bitReader.stream_read_1_bytes(stream);
          this.ptl_frame_only_constraint_flag = bitReader.extract_bits(1);
          this.ptl_multilayer_enabled_flag = bitReader.extract_bits(1);
          this.general_constraint_info = new Uint8Array(this.num_bytes_constraint_info);
          if (this.num_bytes_constraint_info) {
            for (i2 = 0; i2 < this.num_bytes_constraint_info - 1; i2++) {
              var cnstr1 = bitReader.extract_bits(6);
              bitReader.stream_read_1_bytes(stream);
              var cnstr2 = bitReader.extract_bits(2);
              this.general_constraint_info[i2] = cnstr1 << 2 | cnstr2;
            }
            this.general_constraint_info[this.num_bytes_constraint_info - 1] = bitReader.extract_bits(6);
          } else {
            bitReader.extract_bits(6);
          }
          if (this.num_sublayers > 1) {
            bitReader.stream_read_1_bytes(stream);
            this.ptl_sublayer_present_mask = 0;
            for (j = this.num_sublayers - 2; j >= 0; --j) {
              var val = bitReader.extract_bits(1);
              this.ptl_sublayer_present_mask |= val << j;
            }
            for (j = this.num_sublayers; j <= 8 && this.num_sublayers > 1; ++j) {
              bitReader.extract_bits(1);
            }
            this.sublayer_level_idc = [];
            for (j = this.num_sublayers - 2; j >= 0; --j) {
              if (this.ptl_sublayer_present_mask & 1 << j) {
                this.sublayer_level_idc[j] = stream.readUint8();
              }
            }
          }
          this.ptl_num_sub_profiles = stream.readUint8();
          this.general_sub_profile_idc = [];
          if (this.ptl_num_sub_profiles) {
            for (i2 = 0; i2 < this.ptl_num_sub_profiles; i2++) {
              this.general_sub_profile_idc.push(stream.readUint32());
            }
          }
        }
        this.max_picture_width = stream.readUint16();
        this.max_picture_height = stream.readUint16();
        this.avg_frame_rate = stream.readUint16();
      }
      var VVC_NALU_OPI = 12;
      var VVC_NALU_DEC_PARAM = 13;
      this.nalu_arrays = [];
      var num_of_arrays = stream.readUint8();
      for (i2 = 0; i2 < num_of_arrays; i2++) {
        var nalu_array = [];
        this.nalu_arrays.push(nalu_array);
        bitReader.stream_read_1_bytes(stream);
        nalu_array.completeness = bitReader.extract_bits(1);
        bitReader.extract_bits(2);
        nalu_array.nalu_type = bitReader.extract_bits(5);
        var numNalus = 1;
        if (nalu_array.nalu_type != VVC_NALU_DEC_PARAM && nalu_array.nalu_type != VVC_NALU_OPI) {
          numNalus = stream.readUint16();
        }
        for (j = 0; j < numNalus; j++) {
          var len = stream.readUint16();
          nalu_array.push({
            data: stream.readUint8Array(len),
            length: len
          });
        }
      }
    });
    BoxParser4.createFullBoxCtor("vvnC", function(stream) {
      var tmp = strm.readUint8();
      this.lengthSizeMinusOne = tmp & 3;
    });
    BoxParser4.SampleEntry.prototype.isVideo = function() {
      return false;
    };
    BoxParser4.SampleEntry.prototype.isAudio = function() {
      return false;
    };
    BoxParser4.SampleEntry.prototype.isSubtitle = function() {
      return false;
    };
    BoxParser4.SampleEntry.prototype.isMetadata = function() {
      return false;
    };
    BoxParser4.SampleEntry.prototype.isHint = function() {
      return false;
    };
    BoxParser4.SampleEntry.prototype.getCodec = function() {
      return this.type.replace(".", "");
    };
    BoxParser4.SampleEntry.prototype.getWidth = function() {
      return "";
    };
    BoxParser4.SampleEntry.prototype.getHeight = function() {
      return "";
    };
    BoxParser4.SampleEntry.prototype.getChannelCount = function() {
      return "";
    };
    BoxParser4.SampleEntry.prototype.getSampleRate = function() {
      return "";
    };
    BoxParser4.SampleEntry.prototype.getSampleSize = function() {
      return "";
    };
    BoxParser4.VisualSampleEntry.prototype.isVideo = function() {
      return true;
    };
    BoxParser4.VisualSampleEntry.prototype.getWidth = function() {
      return this.width;
    };
    BoxParser4.VisualSampleEntry.prototype.getHeight = function() {
      return this.height;
    };
    BoxParser4.AudioSampleEntry.prototype.isAudio = function() {
      return true;
    };
    BoxParser4.AudioSampleEntry.prototype.getChannelCount = function() {
      return this.channel_count;
    };
    BoxParser4.AudioSampleEntry.prototype.getSampleRate = function() {
      return this.samplerate;
    };
    BoxParser4.AudioSampleEntry.prototype.getSampleSize = function() {
      return this.samplesize;
    };
    BoxParser4.SubtitleSampleEntry.prototype.isSubtitle = function() {
      return true;
    };
    BoxParser4.MetadataSampleEntry.prototype.isMetadata = function() {
      return true;
    };
    BoxParser4.decimalToHex = function(d, padding) {
      var hex = Number(d).toString(16);
      padding = typeof padding === "undefined" || padding === null ? padding = 2 : padding;
      while (hex.length < padding) {
        hex = "0" + hex;
      }
      return hex;
    };
    BoxParser4.avc1SampleEntry.prototype.getCodec = BoxParser4.avc2SampleEntry.prototype.getCodec = BoxParser4.avc3SampleEntry.prototype.getCodec = BoxParser4.avc4SampleEntry.prototype.getCodec = function() {
      var baseCodec = BoxParser4.SampleEntry.prototype.getCodec.call(this);
      if (this.avcC) {
        return baseCodec + "." + BoxParser4.decimalToHex(this.avcC.AVCProfileIndication) + BoxParser4.decimalToHex(this.avcC.profile_compatibility) + BoxParser4.decimalToHex(this.avcC.AVCLevelIndication);
      } else {
        return baseCodec;
      }
    };
    BoxParser4.hev1SampleEntry.prototype.getCodec = BoxParser4.hvc1SampleEntry.prototype.getCodec = function() {
      var i2;
      var baseCodec = BoxParser4.SampleEntry.prototype.getCodec.call(this);
      if (this.hvcC) {
        baseCodec += ".";
        switch (this.hvcC.general_profile_space) {
          case 0:
            baseCodec += "";
            break;
          case 1:
            baseCodec += "A";
            break;
          case 2:
            baseCodec += "B";
            break;
          case 3:
            baseCodec += "C";
            break;
        }
        baseCodec += this.hvcC.general_profile_idc;
        baseCodec += ".";
        var val = this.hvcC.general_profile_compatibility;
        var reversed = 0;
        for (i2 = 0; i2 < 32; i2++) {
          reversed |= val & 1;
          if (i2 == 31)
            break;
          reversed <<= 1;
          val >>= 1;
        }
        baseCodec += BoxParser4.decimalToHex(reversed, 0);
        baseCodec += ".";
        if (this.hvcC.general_tier_flag === 0) {
          baseCodec += "L";
        } else {
          baseCodec += "H";
        }
        baseCodec += this.hvcC.general_level_idc;
        var hasByte = false;
        var constraint_string = "";
        for (i2 = 5; i2 >= 0; i2--) {
          if (this.hvcC.general_constraint_indicator[i2] || hasByte) {
            constraint_string = "." + BoxParser4.decimalToHex(this.hvcC.general_constraint_indicator[i2], 0) + constraint_string;
            hasByte = true;
          }
        }
        baseCodec += constraint_string;
      }
      return baseCodec;
    };
    BoxParser4.vvc1SampleEntry.prototype.getCodec = BoxParser4.vvi1SampleEntry.prototype.getCodec = function() {
      var i2;
      var baseCodec = BoxParser4.SampleEntry.prototype.getCodec.call(this);
      if (this.vvcC) {
        baseCodec += "." + this.vvcC.general_profile_idc;
        if (this.vvcC.general_tier_flag) {
          baseCodec += ".H";
        } else {
          baseCodec += ".L";
        }
        baseCodec += this.vvcC.general_level_idc;
        var constraint_string = "";
        if (this.vvcC.general_constraint_info) {
          var bytes = [];
          var byte = 0;
          byte |= this.vvcC.ptl_frame_only_constraint << 7;
          byte |= this.vvcC.ptl_multilayer_enabled << 6;
          var last_nonzero;
          for (i2 = 0; i2 < this.vvcC.general_constraint_info.length; ++i2) {
            byte |= this.vvcC.general_constraint_info[i2] >> 2 & 63;
            bytes.push(byte);
            if (byte) {
              last_nonzero = i2;
            }
            byte = this.vvcC.general_constraint_info[i2] >> 2 & 3;
          }
          if (last_nonzero === void 0) {
            constraint_string = ".CA";
          } else {
            constraint_string = ".C";
            var base32_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
            var held_bits = 0;
            var num_held_bits = 0;
            for (i2 = 0; i2 <= last_nonzero; ++i2) {
              held_bits = held_bits << 8 | bytes[i2];
              num_held_bits += 8;
              while (num_held_bits >= 5) {
                var val = held_bits >> num_held_bits - 5 & 31;
                constraint_string += base32_chars[val];
                num_held_bits -= 5;
                held_bits &= (1 << num_held_bits) - 1;
              }
            }
            if (num_held_bits) {
              held_bits <<= 5 - num_held_bits;
              constraint_string += base32_chars[held_bits & 31];
            }
          }
        }
        baseCodec += constraint_string;
      }
      return baseCodec;
    };
    BoxParser4.mp4aSampleEntry.prototype.getCodec = function() {
      var baseCodec = BoxParser4.SampleEntry.prototype.getCodec.call(this);
      if (this.esds && this.esds.esd) {
        var oti = this.esds.esd.getOTI();
        var dsi = this.esds.esd.getAudioConfig();
        return baseCodec + "." + BoxParser4.decimalToHex(oti) + (dsi ? "." + dsi : "");
      } else {
        return baseCodec;
      }
    };
    BoxParser4.stxtSampleEntry.prototype.getCodec = function() {
      var baseCodec = BoxParser4.SampleEntry.prototype.getCodec.call(this);
      if (this.mime_format) {
        return baseCodec + "." + this.mime_format;
      } else {
        return baseCodec;
      }
    };
    BoxParser4.vp08SampleEntry.prototype.getCodec = BoxParser4.vp09SampleEntry.prototype.getCodec = function() {
      var baseCodec = BoxParser4.SampleEntry.prototype.getCodec.call(this);
      var level = this.vpcC.level;
      if (level == 0) {
        level = "00";
      }
      var bitDepth = this.vpcC.bitDepth;
      if (bitDepth == 8) {
        bitDepth = "08";
      }
      return baseCodec + ".0" + this.vpcC.profile + "." + level + "." + bitDepth;
    };
    BoxParser4.av01SampleEntry.prototype.getCodec = function() {
      var baseCodec = BoxParser4.SampleEntry.prototype.getCodec.call(this);
      var level = this.av1C.seq_level_idx_0;
      if (level < 10) {
        level = "0" + level;
      }
      var bitdepth;
      if (this.av1C.seq_profile === 2 && this.av1C.high_bitdepth === 1) {
        bitdepth = this.av1C.twelve_bit === 1 ? "12" : "10";
      } else if (this.av1C.seq_profile <= 2) {
        bitdepth = this.av1C.high_bitdepth === 1 ? "10" : "08";
      }
      return baseCodec + "." + this.av1C.seq_profile + "." + level + (this.av1C.seq_tier_0 ? "H" : "M") + "." + bitdepth;
    };
    BoxParser4.Box.prototype.writeHeader = function(stream, msg) {
      this.size += 8;
      if (this.size > MAX_SIZE) {
        this.size += 8;
      }
      if (this.type === "uuid") {
        this.size += 16;
      }
      Log2.debug("BoxWriter", "Writing box " + this.type + " of size: " + this.size + " at position " + stream.getPosition() + (msg || ""));
      if (this.size > MAX_SIZE) {
        stream.writeUint32(1);
      } else {
        this.sizePosition = stream.getPosition();
        stream.writeUint32(this.size);
      }
      stream.writeString(this.type, null, 4);
      if (this.type === "uuid") {
        stream.writeUint8Array(this.uuid);
      }
      if (this.size > MAX_SIZE) {
        stream.writeUint64(this.size);
      }
    };
    BoxParser4.FullBox.prototype.writeHeader = function(stream) {
      this.size += 4;
      BoxParser4.Box.prototype.writeHeader.call(this, stream, " v=" + this.version + " f=" + this.flags);
      stream.writeUint8(this.version);
      stream.writeUint24(this.flags);
    };
    BoxParser4.Box.prototype.write = function(stream) {
      if (this.type === "mdat") {
        if (this.data) {
          this.size = this.data.length;
          this.writeHeader(stream);
          stream.writeUint8Array(this.data);
        }
      } else {
        this.size = this.data ? this.data.length : 0;
        this.writeHeader(stream);
        if (this.data) {
          stream.writeUint8Array(this.data);
        }
      }
    };
    BoxParser4.ContainerBox.prototype.write = function(stream) {
      this.size = 0;
      this.writeHeader(stream);
      for (var i2 = 0; i2 < this.boxes.length; i2++) {
        if (this.boxes[i2]) {
          this.boxes[i2].write(stream);
          this.size += this.boxes[i2].size;
        }
      }
      Log2.debug("BoxWriter", "Adjusting box " + this.type + " with new size " + this.size);
      stream.adjustUint32(this.sizePosition, this.size);
    };
    BoxParser4.TrackReferenceTypeBox.prototype.write = function(stream) {
      this.size = this.track_ids.length * 4;
      this.writeHeader(stream);
      stream.writeUint32Array(this.track_ids);
    };
    BoxParser4.avcCBox.prototype.write = function(stream) {
      var i2;
      this.size = 7;
      for (i2 = 0; i2 < this.SPS.length; i2++) {
        this.size += 2 + this.SPS[i2].length;
      }
      for (i2 = 0; i2 < this.PPS.length; i2++) {
        this.size += 2 + this.PPS[i2].length;
      }
      if (this.ext) {
        this.size += this.ext.length;
      }
      this.writeHeader(stream);
      stream.writeUint8(this.configurationVersion);
      stream.writeUint8(this.AVCProfileIndication);
      stream.writeUint8(this.profile_compatibility);
      stream.writeUint8(this.AVCLevelIndication);
      stream.writeUint8(this.lengthSizeMinusOne + (63 << 2));
      stream.writeUint8(this.SPS.length + (7 << 5));
      for (i2 = 0; i2 < this.SPS.length; i2++) {
        stream.writeUint16(this.SPS[i2].length);
        stream.writeUint8Array(this.SPS[i2].nalu);
      }
      stream.writeUint8(this.PPS.length);
      for (i2 = 0; i2 < this.PPS.length; i2++) {
        stream.writeUint16(this.PPS[i2].length);
        stream.writeUint8Array(this.PPS[i2].nalu);
      }
      if (this.ext) {
        stream.writeUint8Array(this.ext);
      }
    };
    BoxParser4.co64Box.prototype.write = function(stream) {
      var i2;
      this.version = 0;
      this.flags = 0;
      this.size = 4 + 8 * this.chunk_offsets.length;
      this.writeHeader(stream);
      stream.writeUint32(this.chunk_offsets.length);
      for (i2 = 0; i2 < this.chunk_offsets.length; i2++) {
        stream.writeUint64(this.chunk_offsets[i2]);
      }
    };
    BoxParser4.cslgBox.prototype.write = function(stream) {
      var i2;
      this.version = 0;
      this.flags = 0;
      this.size = 4 * 5;
      this.writeHeader(stream);
      stream.writeInt32(this.compositionToDTSShift);
      stream.writeInt32(this.leastDecodeToDisplayDelta);
      stream.writeInt32(this.greatestDecodeToDisplayDelta);
      stream.writeInt32(this.compositionStartTime);
      stream.writeInt32(this.compositionEndTime);
    };
    BoxParser4.cttsBox.prototype.write = function(stream) {
      var i2;
      this.version = 0;
      this.flags = 0;
      this.size = 4 + 8 * this.sample_counts.length;
      this.writeHeader(stream);
      stream.writeUint32(this.sample_counts.length);
      for (i2 = 0; i2 < this.sample_counts.length; i2++) {
        stream.writeUint32(this.sample_counts[i2]);
        if (this.version === 1) {
          stream.writeInt32(this.sample_offsets[i2]);
        } else {
          stream.writeUint32(this.sample_offsets[i2]);
        }
      }
    };
    BoxParser4.drefBox.prototype.write = function(stream) {
      this.version = 0;
      this.flags = 0;
      this.size = 4;
      this.writeHeader(stream);
      stream.writeUint32(this.entries.length);
      for (var i2 = 0; i2 < this.entries.length; i2++) {
        this.entries[i2].write(stream);
        this.size += this.entries[i2].size;
      }
      Log2.debug("BoxWriter", "Adjusting box " + this.type + " with new size " + this.size);
      stream.adjustUint32(this.sizePosition, this.size);
    };
    BoxParser4.elngBox.prototype.write = function(stream) {
      this.version = 0;
      this.flags = 0;
      this.size = this.extended_language.length;
      this.writeHeader(stream);
      stream.writeString(this.extended_language);
    };
    BoxParser4.elstBox.prototype.write = function(stream) {
      this.version = 0;
      this.flags = 0;
      this.size = 4 + 12 * this.entries.length;
      this.writeHeader(stream);
      stream.writeUint32(this.entries.length);
      for (var i2 = 0; i2 < this.entries.length; i2++) {
        var entry = this.entries[i2];
        stream.writeUint32(entry.segment_duration);
        stream.writeInt32(entry.media_time);
        stream.writeInt16(entry.media_rate_integer);
        stream.writeInt16(entry.media_rate_fraction);
      }
    };
    BoxParser4.emsgBox.prototype.write = function(stream) {
      this.version = 0;
      this.flags = 0;
      this.size = 4 * 4 + this.message_data.length + (this.scheme_id_uri.length + 1) + (this.value.length + 1);
      this.writeHeader(stream);
      stream.writeCString(this.scheme_id_uri);
      stream.writeCString(this.value);
      stream.writeUint32(this.timescale);
      stream.writeUint32(this.presentation_time_delta);
      stream.writeUint32(this.event_duration);
      stream.writeUint32(this.id);
      stream.writeUint8Array(this.message_data);
    };
    BoxParser4.ftypBox.prototype.write = function(stream) {
      this.size = 8 + 4 * this.compatible_brands.length;
      this.writeHeader(stream);
      stream.writeString(this.major_brand, null, 4);
      stream.writeUint32(this.minor_version);
      for (var i2 = 0; i2 < this.compatible_brands.length; i2++) {
        stream.writeString(this.compatible_brands[i2], null, 4);
      }
    };
    BoxParser4.hdlrBox.prototype.write = function(stream) {
      this.size = 5 * 4 + this.name.length + 1;
      this.version = 0;
      this.flags = 0;
      this.writeHeader(stream);
      stream.writeUint32(0);
      stream.writeString(this.handler, null, 4);
      stream.writeUint32(0);
      stream.writeUint32(0);
      stream.writeUint32(0);
      stream.writeCString(this.name);
    };
    BoxParser4.hvcCBox.prototype.write = function(stream) {
      var i2, j;
      this.size = 23;
      for (i2 = 0; i2 < this.nalu_arrays.length; i2++) {
        this.size += 3;
        for (j = 0; j < this.nalu_arrays[i2].length; j++) {
          this.size += 2 + this.nalu_arrays[i2][j].data.length;
        }
      }
      this.writeHeader(stream);
      stream.writeUint8(this.configurationVersion);
      stream.writeUint8(this.general_profile_space << 6 + this.general_tier_flag << 5 + this.general_profile_idc);
      stream.writeUint32(this.general_profile_compatibility);
      stream.writeUint8Array(this.general_constraint_indicator);
      stream.writeUint8(this.general_level_idc);
      stream.writeUint16(this.min_spatial_segmentation_idc + (15 << 24));
      stream.writeUint8(this.parallelismType + (63 << 2));
      stream.writeUint8(this.chroma_format_idc + (63 << 2));
      stream.writeUint8(this.bit_depth_luma_minus8 + (31 << 3));
      stream.writeUint8(this.bit_depth_chroma_minus8 + (31 << 3));
      stream.writeUint16(this.avgFrameRate);
      stream.writeUint8((this.constantFrameRate << 6) + (this.numTemporalLayers << 3) + (this.temporalIdNested << 2) + this.lengthSizeMinusOne);
      stream.writeUint8(this.nalu_arrays.length);
      for (i2 = 0; i2 < this.nalu_arrays.length; i2++) {
        stream.writeUint8((this.nalu_arrays[i2].completeness << 7) + this.nalu_arrays[i2].nalu_type);
        stream.writeUint16(this.nalu_arrays[i2].length);
        for (j = 0; j < this.nalu_arrays[i2].length; j++) {
          stream.writeUint16(this.nalu_arrays[i2][j].data.length);
          stream.writeUint8Array(this.nalu_arrays[i2][j].data);
        }
      }
    };
    BoxParser4.kindBox.prototype.write = function(stream) {
      this.version = 0;
      this.flags = 0;
      this.size = this.schemeURI.length + 1 + (this.value.length + 1);
      this.writeHeader(stream);
      stream.writeCString(this.schemeURI);
      stream.writeCString(this.value);
    };
    BoxParser4.mdhdBox.prototype.write = function(stream) {
      this.size = 4 * 4 + 2 * 2;
      this.flags = 0;
      this.version = 0;
      this.writeHeader(stream);
      stream.writeUint32(this.creation_time);
      stream.writeUint32(this.modification_time);
      stream.writeUint32(this.timescale);
      stream.writeUint32(this.duration);
      stream.writeUint16(this.language);
      stream.writeUint16(0);
    };
    BoxParser4.mehdBox.prototype.write = function(stream) {
      this.version = 0;
      this.flags = 0;
      this.size = 4;
      this.writeHeader(stream);
      stream.writeUint32(this.fragment_duration);
    };
    BoxParser4.mfhdBox.prototype.write = function(stream) {
      this.version = 0;
      this.flags = 0;
      this.size = 4;
      this.writeHeader(stream);
      stream.writeUint32(this.sequence_number);
    };
    BoxParser4.mvhdBox.prototype.write = function(stream) {
      this.version = 0;
      this.flags = 0;
      this.size = 23 * 4 + 2 * 2;
      this.writeHeader(stream);
      stream.writeUint32(this.creation_time);
      stream.writeUint32(this.modification_time);
      stream.writeUint32(this.timescale);
      stream.writeUint32(this.duration);
      stream.writeUint32(this.rate);
      stream.writeUint16(this.volume << 8);
      stream.writeUint16(0);
      stream.writeUint32(0);
      stream.writeUint32(0);
      stream.writeUint32Array(this.matrix);
      stream.writeUint32(0);
      stream.writeUint32(0);
      stream.writeUint32(0);
      stream.writeUint32(0);
      stream.writeUint32(0);
      stream.writeUint32(0);
      stream.writeUint32(this.next_track_id);
    };
    BoxParser4.SampleEntry.prototype.writeHeader = function(stream) {
      this.size = 8;
      BoxParser4.Box.prototype.writeHeader.call(this, stream);
      stream.writeUint8(0);
      stream.writeUint8(0);
      stream.writeUint8(0);
      stream.writeUint8(0);
      stream.writeUint8(0);
      stream.writeUint8(0);
      stream.writeUint16(this.data_reference_index);
    };
    BoxParser4.SampleEntry.prototype.writeFooter = function(stream) {
      for (var i2 = 0; i2 < this.boxes.length; i2++) {
        this.boxes[i2].write(stream);
        this.size += this.boxes[i2].size;
      }
      Log2.debug("BoxWriter", "Adjusting box " + this.type + " with new size " + this.size);
      stream.adjustUint32(this.sizePosition, this.size);
    };
    BoxParser4.SampleEntry.prototype.write = function(stream) {
      this.writeHeader(stream);
      stream.writeUint8Array(this.data);
      this.size += this.data.length;
      Log2.debug("BoxWriter", "Adjusting box " + this.type + " with new size " + this.size);
      stream.adjustUint32(this.sizePosition, this.size);
    };
    BoxParser4.VisualSampleEntry.prototype.write = function(stream) {
      this.writeHeader(stream);
      this.size += 2 * 7 + 6 * 4 + 32;
      stream.writeUint16(0);
      stream.writeUint16(0);
      stream.writeUint32(0);
      stream.writeUint32(0);
      stream.writeUint32(0);
      stream.writeUint16(this.width);
      stream.writeUint16(this.height);
      stream.writeUint32(this.horizresolution);
      stream.writeUint32(this.vertresolution);
      stream.writeUint32(0);
      stream.writeUint16(this.frame_count);
      stream.writeUint8(Math.min(31, this.compressorname.length));
      stream.writeString(this.compressorname, null, 31);
      stream.writeUint16(this.depth);
      stream.writeInt16(-1);
      this.writeFooter(stream);
    };
    BoxParser4.AudioSampleEntry.prototype.write = function(stream) {
      this.writeHeader(stream);
      this.size += 2 * 4 + 3 * 4;
      stream.writeUint32(0);
      stream.writeUint32(0);
      stream.writeUint16(this.channel_count);
      stream.writeUint16(this.samplesize);
      stream.writeUint16(0);
      stream.writeUint16(0);
      stream.writeUint32(this.samplerate << 16);
      this.writeFooter(stream);
    };
    BoxParser4.stppSampleEntry.prototype.write = function(stream) {
      this.writeHeader(stream);
      this.size += this.namespace.length + 1 + this.schema_location.length + 1 + this.auxiliary_mime_types.length + 1;
      stream.writeCString(this.namespace);
      stream.writeCString(this.schema_location);
      stream.writeCString(this.auxiliary_mime_types);
      this.writeFooter(stream);
    };
    BoxParser4.SampleGroupEntry.prototype.write = function(stream) {
      stream.writeUint8Array(this.data);
    };
    BoxParser4.sbgpBox.prototype.write = function(stream) {
      this.version = 1;
      this.flags = 0;
      this.size = 12 + 8 * this.entries.length;
      this.writeHeader(stream);
      stream.writeString(this.grouping_type, null, 4);
      stream.writeUint32(this.grouping_type_parameter);
      stream.writeUint32(this.entries.length);
      for (var i2 = 0; i2 < this.entries.length; i2++) {
        var entry = this.entries[i2];
        stream.writeInt32(entry.sample_count);
        stream.writeInt32(entry.group_description_index);
      }
    };
    BoxParser4.sgpdBox.prototype.write = function(stream) {
      var i2;
      var entry;
      this.flags = 0;
      this.size = 12;
      for (i2 = 0; i2 < this.entries.length; i2++) {
        entry = this.entries[i2];
        if (this.version === 1) {
          if (this.default_length === 0) {
            this.size += 4;
          }
          this.size += entry.data.length;
        }
      }
      this.writeHeader(stream);
      stream.writeString(this.grouping_type, null, 4);
      if (this.version === 1) {
        stream.writeUint32(this.default_length);
      }
      if (this.version >= 2) {
        stream.writeUint32(this.default_sample_description_index);
      }
      stream.writeUint32(this.entries.length);
      for (i2 = 0; i2 < this.entries.length; i2++) {
        entry = this.entries[i2];
        if (this.version === 1) {
          if (this.default_length === 0) {
            stream.writeUint32(entry.description_length);
          }
        }
        entry.write(stream);
      }
    };
    BoxParser4.sidxBox.prototype.write = function(stream) {
      this.version = 0;
      this.flags = 0;
      this.size = 4 * 4 + 2 + 2 + 12 * this.references.length;
      this.writeHeader(stream);
      stream.writeUint32(this.reference_ID);
      stream.writeUint32(this.timescale);
      stream.writeUint32(this.earliest_presentation_time);
      stream.writeUint32(this.first_offset);
      stream.writeUint16(0);
      stream.writeUint16(this.references.length);
      for (var i2 = 0; i2 < this.references.length; i2++) {
        var ref = this.references[i2];
        stream.writeUint32(ref.reference_type << 31 | ref.referenced_size);
        stream.writeUint32(ref.subsegment_duration);
        stream.writeUint32(ref.starts_with_SAP << 31 | ref.SAP_type << 28 | ref.SAP_delta_time);
      }
    };
    BoxParser4.smhdBox.prototype.write = function(stream) {
      var i2;
      this.version = 0;
      this.flags = 1;
      this.size = 4;
      this.writeHeader(stream);
      stream.writeUint16(this.balance);
      stream.writeUint16(0);
    };
    BoxParser4.stcoBox.prototype.write = function(stream) {
      this.version = 0;
      this.flags = 0;
      this.size = 4 + 4 * this.chunk_offsets.length;
      this.writeHeader(stream);
      stream.writeUint32(this.chunk_offsets.length);
      stream.writeUint32Array(this.chunk_offsets);
    };
    BoxParser4.stscBox.prototype.write = function(stream) {
      var i2;
      this.version = 0;
      this.flags = 0;
      this.size = 4 + 12 * this.first_chunk.length;
      this.writeHeader(stream);
      stream.writeUint32(this.first_chunk.length);
      for (i2 = 0; i2 < this.first_chunk.length; i2++) {
        stream.writeUint32(this.first_chunk[i2]);
        stream.writeUint32(this.samples_per_chunk[i2]);
        stream.writeUint32(this.sample_description_index[i2]);
      }
    };
    BoxParser4.stsdBox.prototype.write = function(stream) {
      var i2;
      this.version = 0;
      this.flags = 0;
      this.size = 0;
      this.writeHeader(stream);
      stream.writeUint32(this.entries.length);
      this.size += 4;
      for (i2 = 0; i2 < this.entries.length; i2++) {
        this.entries[i2].write(stream);
        this.size += this.entries[i2].size;
      }
      Log2.debug("BoxWriter", "Adjusting box " + this.type + " with new size " + this.size);
      stream.adjustUint32(this.sizePosition, this.size);
    };
    BoxParser4.stshBox.prototype.write = function(stream) {
      var i2;
      this.version = 0;
      this.flags = 0;
      this.size = 4 + 8 * this.shadowed_sample_numbers.length;
      this.writeHeader(stream);
      stream.writeUint32(this.shadowed_sample_numbers.length);
      for (i2 = 0; i2 < this.shadowed_sample_numbers.length; i2++) {
        stream.writeUint32(this.shadowed_sample_numbers[i2]);
        stream.writeUint32(this.sync_sample_numbers[i2]);
      }
    };
    BoxParser4.stssBox.prototype.write = function(stream) {
      this.version = 0;
      this.flags = 0;
      this.size = 4 + 4 * this.sample_numbers.length;
      this.writeHeader(stream);
      stream.writeUint32(this.sample_numbers.length);
      stream.writeUint32Array(this.sample_numbers);
    };
    BoxParser4.stszBox.prototype.write = function(stream) {
      var i2;
      var constant = true;
      this.version = 0;
      this.flags = 0;
      if (this.sample_sizes.length > 0) {
        i2 = 0;
        while (i2 + 1 < this.sample_sizes.length) {
          if (this.sample_sizes[i2 + 1] !== this.sample_sizes[0]) {
            constant = false;
            break;
          } else {
            i2++;
          }
        }
      } else {
        constant = false;
      }
      this.size = 8;
      if (!constant) {
        this.size += 4 * this.sample_sizes.length;
      }
      this.writeHeader(stream);
      if (!constant) {
        stream.writeUint32(0);
      } else {
        stream.writeUint32(this.sample_sizes[0]);
      }
      stream.writeUint32(this.sample_sizes.length);
      if (!constant) {
        stream.writeUint32Array(this.sample_sizes);
      }
    };
    BoxParser4.sttsBox.prototype.write = function(stream) {
      var i2;
      this.version = 0;
      this.flags = 0;
      this.size = 4 + 8 * this.sample_counts.length;
      this.writeHeader(stream);
      stream.writeUint32(this.sample_counts.length);
      for (i2 = 0; i2 < this.sample_counts.length; i2++) {
        stream.writeUint32(this.sample_counts[i2]);
        stream.writeUint32(this.sample_deltas[i2]);
      }
    };
    BoxParser4.tfdtBox.prototype.write = function(stream) {
      var UINT32_MAX = Math.pow(2, 32) - 1;
      this.version = this.baseMediaDecodeTime > UINT32_MAX ? 1 : 0;
      this.flags = 0;
      this.size = 4;
      if (this.version === 1) {
        this.size += 4;
      }
      this.writeHeader(stream);
      if (this.version === 1) {
        stream.writeUint64(this.baseMediaDecodeTime);
      } else {
        stream.writeUint32(this.baseMediaDecodeTime);
      }
    };
    BoxParser4.tfhdBox.prototype.write = function(stream) {
      this.version = 0;
      this.size = 4;
      if (this.flags & BoxParser4.TFHD_FLAG_BASE_DATA_OFFSET) {
        this.size += 8;
      }
      if (this.flags & BoxParser4.TFHD_FLAG_SAMPLE_DESC) {
        this.size += 4;
      }
      if (this.flags & BoxParser4.TFHD_FLAG_SAMPLE_DUR) {
        this.size += 4;
      }
      if (this.flags & BoxParser4.TFHD_FLAG_SAMPLE_SIZE) {
        this.size += 4;
      }
      if (this.flags & BoxParser4.TFHD_FLAG_SAMPLE_FLAGS) {
        this.size += 4;
      }
      this.writeHeader(stream);
      stream.writeUint32(this.track_id);
      if (this.flags & BoxParser4.TFHD_FLAG_BASE_DATA_OFFSET) {
        stream.writeUint64(this.base_data_offset);
      }
      if (this.flags & BoxParser4.TFHD_FLAG_SAMPLE_DESC) {
        stream.writeUint32(this.default_sample_description_index);
      }
      if (this.flags & BoxParser4.TFHD_FLAG_SAMPLE_DUR) {
        stream.writeUint32(this.default_sample_duration);
      }
      if (this.flags & BoxParser4.TFHD_FLAG_SAMPLE_SIZE) {
        stream.writeUint32(this.default_sample_size);
      }
      if (this.flags & BoxParser4.TFHD_FLAG_SAMPLE_FLAGS) {
        stream.writeUint32(this.default_sample_flags);
      }
    };
    BoxParser4.tkhdBox.prototype.write = function(stream) {
      this.version = 0;
      this.size = 4 * 18 + 2 * 4;
      this.writeHeader(stream);
      stream.writeUint32(this.creation_time);
      stream.writeUint32(this.modification_time);
      stream.writeUint32(this.track_id);
      stream.writeUint32(0);
      stream.writeUint32(this.duration);
      stream.writeUint32(0);
      stream.writeUint32(0);
      stream.writeInt16(this.layer);
      stream.writeInt16(this.alternate_group);
      stream.writeInt16(this.volume << 8);
      stream.writeUint16(0);
      stream.writeInt32Array(this.matrix);
      stream.writeUint32(this.width);
      stream.writeUint32(this.height);
    };
    BoxParser4.trexBox.prototype.write = function(stream) {
      this.version = 0;
      this.flags = 0;
      this.size = 4 * 5;
      this.writeHeader(stream);
      stream.writeUint32(this.track_id);
      stream.writeUint32(this.default_sample_description_index);
      stream.writeUint32(this.default_sample_duration);
      stream.writeUint32(this.default_sample_size);
      stream.writeUint32(this.default_sample_flags);
    };
    BoxParser4.trunBox.prototype.write = function(stream) {
      this.version = 0;
      this.size = 4;
      if (this.flags & BoxParser4.TRUN_FLAGS_DATA_OFFSET) {
        this.size += 4;
      }
      if (this.flags & BoxParser4.TRUN_FLAGS_FIRST_FLAG) {
        this.size += 4;
      }
      if (this.flags & BoxParser4.TRUN_FLAGS_DURATION) {
        this.size += 4 * this.sample_duration.length;
      }
      if (this.flags & BoxParser4.TRUN_FLAGS_SIZE) {
        this.size += 4 * this.sample_size.length;
      }
      if (this.flags & BoxParser4.TRUN_FLAGS_FLAGS) {
        this.size += 4 * this.sample_flags.length;
      }
      if (this.flags & BoxParser4.TRUN_FLAGS_CTS_OFFSET) {
        this.size += 4 * this.sample_composition_time_offset.length;
      }
      this.writeHeader(stream);
      stream.writeUint32(this.sample_count);
      if (this.flags & BoxParser4.TRUN_FLAGS_DATA_OFFSET) {
        this.data_offset_position = stream.getPosition();
        stream.writeInt32(this.data_offset);
      }
      if (this.flags & BoxParser4.TRUN_FLAGS_FIRST_FLAG) {
        stream.writeUint32(this.first_sample_flags);
      }
      for (var i2 = 0; i2 < this.sample_count; i2++) {
        if (this.flags & BoxParser4.TRUN_FLAGS_DURATION) {
          stream.writeUint32(this.sample_duration[i2]);
        }
        if (this.flags & BoxParser4.TRUN_FLAGS_SIZE) {
          stream.writeUint32(this.sample_size[i2]);
        }
        if (this.flags & BoxParser4.TRUN_FLAGS_FLAGS) {
          stream.writeUint32(this.sample_flags[i2]);
        }
        if (this.flags & BoxParser4.TRUN_FLAGS_CTS_OFFSET) {
          if (this.version === 0) {
            stream.writeUint32(this.sample_composition_time_offset[i2]);
          } else {
            stream.writeInt32(this.sample_composition_time_offset[i2]);
          }
        }
      }
    };
    BoxParser4["url Box"].prototype.write = function(stream) {
      this.version = 0;
      if (this.location) {
        this.flags = 0;
        this.size = this.location.length + 1;
      } else {
        this.flags = 1;
        this.size = 0;
      }
      this.writeHeader(stream);
      if (this.location) {
        stream.writeCString(this.location);
      }
    };
    BoxParser4["urn Box"].prototype.write = function(stream) {
      this.version = 0;
      this.flags = 0;
      this.size = this.name.length + 1 + (this.location ? this.location.length + 1 : 0);
      this.writeHeader(stream);
      stream.writeCString(this.name);
      if (this.location) {
        stream.writeCString(this.location);
      }
    };
    BoxParser4.vmhdBox.prototype.write = function(stream) {
      var i2;
      this.version = 0;
      this.flags = 1;
      this.size = 8;
      this.writeHeader(stream);
      stream.writeUint16(this.graphicsmode);
      stream.writeUint16Array(this.opcolor);
    };
    BoxParser4.cttsBox.prototype.unpack = function(samples) {
      var i2, j, k;
      k = 0;
      for (i2 = 0; i2 < this.sample_counts.length; i2++) {
        for (j = 0; j < this.sample_counts[i2]; j++) {
          samples[k].pts = samples[k].dts + this.sample_offsets[i2];
          k++;
        }
      }
    };
    BoxParser4.sttsBox.prototype.unpack = function(samples) {
      var i2, j, k;
      k = 0;
      for (i2 = 0; i2 < this.sample_counts.length; i2++) {
        for (j = 0; j < this.sample_counts[i2]; j++) {
          if (k === 0) {
            samples[k].dts = 0;
          } else {
            samples[k].dts = samples[k - 1].dts + this.sample_deltas[i2];
          }
          k++;
        }
      }
    };
    BoxParser4.stcoBox.prototype.unpack = function(samples) {
      var i2;
      for (i2 = 0; i2 < this.chunk_offsets.length; i2++) {
        samples[i2].offset = this.chunk_offsets[i2];
      }
    };
    BoxParser4.stscBox.prototype.unpack = function(samples) {
      var i2, j, k, l, m;
      l = 0;
      m = 0;
      for (i2 = 0; i2 < this.first_chunk.length; i2++) {
        for (j = 0; j < (i2 + 1 < this.first_chunk.length ? this.first_chunk[i2 + 1] : Infinity); j++) {
          m++;
          for (k = 0; k < this.samples_per_chunk[i2]; k++) {
            if (samples[l]) {
              samples[l].description_index = this.sample_description_index[i2];
              samples[l].chunk_index = m;
            } else {
              return;
            }
            l++;
          }
        }
      }
    };
    BoxParser4.stszBox.prototype.unpack = function(samples) {
      var i2;
      for (i2 = 0; i2 < this.sample_sizes.length; i2++) {
        samples[i2].size = this.sample_sizes[i2];
      }
    };
    BoxParser4.DIFF_BOXES_PROP_NAMES = [
      "boxes",
      "entries",
      "references",
      "subsamples",
      "items",
      "item_infos",
      "extents",
      "associations",
      "subsegments",
      "ranges",
      "seekLists",
      "seekPoints",
      "esd",
      "levels"
    ];
    BoxParser4.DIFF_PRIMITIVE_ARRAY_PROP_NAMES = [
      "compatible_brands",
      "matrix",
      "opcolor",
      "sample_counts",
      "sample_counts",
      "sample_deltas",
      "first_chunk",
      "samples_per_chunk",
      "sample_sizes",
      "chunk_offsets",
      "sample_offsets",
      "sample_description_index",
      "sample_duration"
    ];
    BoxParser4.boxEqualFields = function(box_a, box_b) {
      if (box_a && !box_b)
        return false;
      var prop;
      for (prop in box_a) {
        if (BoxParser4.DIFF_BOXES_PROP_NAMES.indexOf(prop) > -1) {
          continue;
        } else if (box_a[prop] instanceof BoxParser4.Box || box_b[prop] instanceof BoxParser4.Box) {
          continue;
        } else if (typeof box_a[prop] === "undefined" || typeof box_b[prop] === "undefined") {
          continue;
        } else if (typeof box_a[prop] === "function" || typeof box_b[prop] === "function") {
          continue;
        } else if (box_a.subBoxNames && box_a.subBoxNames.indexOf(prop.slice(0, 4)) > -1 || box_b.subBoxNames && box_b.subBoxNames.indexOf(prop.slice(0, 4)) > -1) {
          continue;
        } else {
          if (prop === "data" || prop === "start" || prop === "size" || prop === "creation_time" || prop === "modification_time") {
            continue;
          } else if (BoxParser4.DIFF_PRIMITIVE_ARRAY_PROP_NAMES.indexOf(prop) > -1) {
            continue;
          } else {
            if (box_a[prop] !== box_b[prop]) {
              return false;
            }
          }
        }
      }
      return true;
    };
    BoxParser4.boxEqual = function(box_a, box_b) {
      if (!BoxParser4.boxEqualFields(box_a, box_b)) {
        return false;
      }
      for (var j = 0; j < BoxParser4.DIFF_BOXES_PROP_NAMES.length; j++) {
        var name = BoxParser4.DIFF_BOXES_PROP_NAMES[j];
        if (box_a[name] && box_b[name]) {
          if (!BoxParser4.boxEqual(box_a[name], box_b[name])) {
            return false;
          }
        }
      }
      return true;
    };
    var VTTin4Parser = function() {
    };
    VTTin4Parser.prototype.parseSample = function(data) {
      var cues, cue;
      var stream = new MP4BoxStream2(data.buffer);
      cues = [];
      while (!stream.isEos()) {
        cue = BoxParser4.parseOneBox(stream, false);
        if (cue.code === BoxParser4.OK && cue.box.type === "vttc") {
          cues.push(cue.box);
        }
      }
      return cues;
    };
    VTTin4Parser.prototype.getText = function(startTime, endTime, data) {
      function pad(n, width, z) {
        z = z || "0";
        n = n + "";
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
      }
      function secToTimestamp(insec) {
        var h = Math.floor(insec / 3600);
        var m = Math.floor((insec - h * 3600) / 60);
        var s = Math.floor(insec - h * 3600 - m * 60);
        var ms = Math.floor((insec - h * 3600 - m * 60 - s) * 1e3);
        return "" + pad(h, 2) + ":" + pad(m, 2) + ":" + pad(s, 2) + "." + pad(ms, 3);
      }
      var cues = this.parseSample(data);
      var string = "";
      for (var i2 = 0; i2 < cues.length; i2++) {
        var cueIn4 = cues[i2];
        string += secToTimestamp(startTime) + " --> " + secToTimestamp(endTime) + "\r\n";
        string += cueIn4.payl.text;
      }
      return string;
    };
    var XMLSubtitlein4Parser = function() {
    };
    XMLSubtitlein4Parser.prototype.parseSample = function(sample) {
      var res = {};
      var i2;
      res.resources = [];
      var stream = new MP4BoxStream2(sample.data.buffer);
      if (!sample.subsamples || sample.subsamples.length === 0) {
        res.documentString = stream.readString(sample.data.length);
      } else {
        res.documentString = stream.readString(sample.subsamples[0].size);
        if (sample.subsamples.length > 1) {
          for (i2 = 1; i2 < sample.subsamples.length; i2++) {
            res.resources[i2] = stream.readUint8Array(sample.subsamples[i2].size);
          }
        }
      }
      if (typeof DOMParser !== "undefined") {
        res.document = new DOMParser().parseFromString(res.documentString, "application/xml");
      }
      return res;
    };
    var Textin4Parser = function() {
    };
    Textin4Parser.prototype.parseSample = function(sample) {
      var textString;
      var stream = new MP4BoxStream2(sample.data.buffer);
      textString = stream.readString(sample.data.length);
      return textString;
    };
    Textin4Parser.prototype.parseConfig = function(data) {
      var textString;
      var stream = new MP4BoxStream2(data.buffer);
      stream.readUint32();
      textString = stream.readCString();
      return textString;
    };
    if (typeof exports !== "undefined") {
      exports.XMLSubtitlein4Parser = XMLSubtitlein4Parser;
      exports.Textin4Parser = Textin4Parser;
    }
    var ISOFile = function(stream) {
      this.stream = stream || new MultiBufferStream();
      this.boxes = [];
      this.mdats = [];
      this.moofs = [];
      this.isProgressive = false;
      this.moovStartFound = false;
      this.onMoovStart = null;
      this.moovStartSent = false;
      this.onReady = null;
      this.readySent = false;
      this.onSegment = null;
      this.onSamples = null;
      this.onError = null;
      this.sampleListBuilt = false;
      this.fragmentedTracks = [];
      this.extractedTracks = [];
      this.isFragmentationInitialized = false;
      this.sampleProcessingStarted = false;
      this.nextMoofNumber = 0;
      this.itemListBuilt = false;
      this.onSidx = null;
      this.sidxSent = false;
    };
    ISOFile.prototype.setSegmentOptions = function(id, user, options) {
      var trak = this.getTrackById(id);
      if (trak) {
        var fragTrack = {};
        this.fragmentedTracks.push(fragTrack);
        fragTrack.id = id;
        fragTrack.user = user;
        fragTrack.trak = trak;
        trak.nextSample = 0;
        fragTrack.segmentStream = null;
        fragTrack.nb_samples = 1e3;
        fragTrack.rapAlignement = true;
        if (options) {
          if (options.nbSamples)
            fragTrack.nb_samples = options.nbSamples;
          if (options.rapAlignement)
            fragTrack.rapAlignement = options.rapAlignement;
        }
      }
    };
    ISOFile.prototype.unsetSegmentOptions = function(id) {
      var index = -1;
      for (var i2 = 0; i2 < this.fragmentedTracks.length; i2++) {
        var fragTrack = this.fragmentedTracks[i2];
        if (fragTrack.id == id) {
          index = i2;
        }
      }
      if (index > -1) {
        this.fragmentedTracks.splice(index, 1);
      }
    };
    ISOFile.prototype.setExtractionOptions = function(id, user, options) {
      var trak = this.getTrackById(id);
      if (trak) {
        var extractTrack = {};
        this.extractedTracks.push(extractTrack);
        extractTrack.id = id;
        extractTrack.user = user;
        extractTrack.trak = trak;
        trak.nextSample = 0;
        extractTrack.nb_samples = 1e3;
        extractTrack.samples = [];
        if (options) {
          if (options.nbSamples)
            extractTrack.nb_samples = options.nbSamples;
        }
      }
    };
    ISOFile.prototype.unsetExtractionOptions = function(id) {
      var index = -1;
      for (var i2 = 0; i2 < this.extractedTracks.length; i2++) {
        var extractTrack = this.extractedTracks[i2];
        if (extractTrack.id == id) {
          index = i2;
        }
      }
      if (index > -1) {
        this.extractedTracks.splice(index, 1);
      }
    };
    ISOFile.prototype.parse = function() {
      var found;
      var ret2;
      var box2;
      var parseBoxHeadersOnly = false;
      if (this.restoreParsePosition) {
        if (!this.restoreParsePosition()) {
          return;
        }
      }
      while (true) {
        if (this.hasIncompleteMdat && this.hasIncompleteMdat()) {
          if (this.processIncompleteMdat()) {
            continue;
          } else {
            return;
          }
        } else {
          if (this.saveParsePosition) {
            this.saveParsePosition();
          }
          ret2 = BoxParser4.parseOneBox(this.stream, parseBoxHeadersOnly);
          if (ret2.code === BoxParser4.ERR_NOT_ENOUGH_DATA) {
            if (this.processIncompleteBox) {
              if (this.processIncompleteBox(ret2)) {
                continue;
              } else {
                return;
              }
            } else {
              return;
            }
          } else {
            var box_type;
            box2 = ret2.box;
            box_type = box2.type !== "uuid" ? box2.type : box2.uuid;
            this.boxes.push(box2);
            switch (box_type) {
              case "mdat":
                this.mdats.push(box2);
                break;
              case "moof":
                this.moofs.push(box2);
                break;
              case "moov":
                this.moovStartFound = true;
                if (this.mdats.length === 0) {
                  this.isProgressive = true;
                }
              default:
                if (this[box_type] !== void 0) {
                  Log2.warn("ISOFile", "Duplicate Box of type: " + box_type + ", overriding previous occurrence");
                }
                this[box_type] = box2;
                break;
            }
            if (this.updateUsedBytes) {
              this.updateUsedBytes(box2, ret2);
            }
          }
        }
      }
    };
    ISOFile.prototype.checkBuffer = function(ab) {
      if (ab === null || ab === void 0) {
        throw "Buffer must be defined and non empty";
      }
      if (ab.fileStart === void 0) {
        throw "Buffer must have a fileStart property";
      }
      if (ab.byteLength === 0) {
        Log2.warn("ISOFile", "Ignoring empty buffer (fileStart: " + ab.fileStart + ")");
        this.stream.logBufferLevel();
        return false;
      }
      Log2.info("ISOFile", "Processing buffer (fileStart: " + ab.fileStart + ")");
      ab.usedBytes = 0;
      this.stream.insertBuffer(ab);
      this.stream.logBufferLevel();
      if (!this.stream.initialized()) {
        Log2.warn("ISOFile", "Not ready to start parsing");
        return false;
      }
      return true;
    };
    ISOFile.prototype.appendBuffer = function(ab, last) {
      var nextFileStart;
      if (!this.checkBuffer(ab)) {
        return;
      }
      this.parse();
      if (this.moovStartFound && !this.moovStartSent) {
        this.moovStartSent = true;
        if (this.onMoovStart)
          this.onMoovStart();
      }
      if (this.moov) {
        if (!this.sampleListBuilt) {
          this.buildSampleLists();
          this.sampleListBuilt = true;
        }
        this.updateSampleLists();
        if (this.onReady && !this.readySent) {
          this.readySent = true;
          this.onReady(this.getInfo());
        }
        this.processSamples(last);
        if (this.nextSeekPosition) {
          nextFileStart = this.nextSeekPosition;
          this.nextSeekPosition = void 0;
        } else {
          nextFileStart = this.nextParsePosition;
        }
        if (this.stream.getEndFilePositionAfter) {
          nextFileStart = this.stream.getEndFilePositionAfter(nextFileStart);
        }
      } else {
        if (this.nextParsePosition) {
          nextFileStart = this.nextParsePosition;
        } else {
          nextFileStart = 0;
        }
      }
      if (this.sidx) {
        if (this.onSidx && !this.sidxSent) {
          this.onSidx(this.sidx);
          this.sidxSent = true;
        }
      }
      if (this.meta) {
        if (this.flattenItemInfo && !this.itemListBuilt) {
          this.flattenItemInfo();
          this.itemListBuilt = true;
        }
        if (this.processItems) {
          this.processItems(this.onItem);
        }
      }
      if (this.stream.cleanBuffers) {
        Log2.info("ISOFile", "Done processing buffer (fileStart: " + ab.fileStart + ") - next buffer to fetch should have a fileStart position of " + nextFileStart);
        this.stream.logBufferLevel();
        this.stream.cleanBuffers();
        this.stream.logBufferLevel(true);
        Log2.info("ISOFile", "Sample data size in memory: " + this.getAllocatedSampleDataSize());
      }
      return nextFileStart;
    };
    ISOFile.prototype.getInfo = function() {
      var i2, j;
      var movie = {};
      var trak;
      var track;
      var ref;
      var sample_desc;
      var _1904 = (/* @__PURE__ */ new Date("1904-01-01T00:00:00Z")).getTime();
      if (this.moov) {
        movie.hasMoov = true;
        movie.duration = this.moov.mvhd.duration;
        movie.timescale = this.moov.mvhd.timescale;
        movie.isFragmented = this.moov.mvex != null;
        if (movie.isFragmented && this.moov.mvex.mehd) {
          movie.fragment_duration = this.moov.mvex.mehd.fragment_duration;
        }
        movie.isProgressive = this.isProgressive;
        movie.hasIOD = this.moov.iods != null;
        movie.brands = [];
        movie.brands.push(this.ftyp.major_brand);
        movie.brands = movie.brands.concat(this.ftyp.compatible_brands);
        movie.created = new Date(_1904 + this.moov.mvhd.creation_time * 1e3);
        movie.modified = new Date(_1904 + this.moov.mvhd.modification_time * 1e3);
        movie.tracks = [];
        movie.audioTracks = [];
        movie.videoTracks = [];
        movie.subtitleTracks = [];
        movie.metadataTracks = [];
        movie.hintTracks = [];
        movie.otherTracks = [];
        for (i2 = 0; i2 < this.moov.traks.length; i2++) {
          trak = this.moov.traks[i2];
          sample_desc = trak.mdia.minf.stbl.stsd.entries[0];
          track = {};
          movie.tracks.push(track);
          track.id = trak.tkhd.track_id;
          track.name = trak.mdia.hdlr.name;
          track.references = [];
          if (trak.tref) {
            for (j = 0; j < trak.tref.boxes.length; j++) {
              ref = {};
              track.references.push(ref);
              ref.type = trak.tref.boxes[j].type;
              ref.track_ids = trak.tref.boxes[j].track_ids;
            }
          }
          if (trak.edts) {
            track.edits = trak.edts.elst.entries;
          }
          track.created = new Date(_1904 + trak.tkhd.creation_time * 1e3);
          track.modified = new Date(_1904 + trak.tkhd.modification_time * 1e3);
          track.movie_duration = trak.tkhd.duration;
          track.movie_timescale = movie.timescale;
          track.layer = trak.tkhd.layer;
          track.alternate_group = trak.tkhd.alternate_group;
          track.volume = trak.tkhd.volume;
          track.matrix = trak.tkhd.matrix;
          track.track_width = trak.tkhd.width / (1 << 16);
          track.track_height = trak.tkhd.height / (1 << 16);
          track.timescale = trak.mdia.mdhd.timescale;
          track.cts_shift = trak.mdia.minf.stbl.cslg;
          track.duration = trak.mdia.mdhd.duration;
          track.samples_duration = trak.samples_duration;
          track.codec = sample_desc.getCodec();
          track.kind = trak.udta && trak.udta.kinds.length ? trak.udta.kinds[0] : { schemeURI: "", value: "" };
          track.language = trak.mdia.elng ? trak.mdia.elng.extended_language : trak.mdia.mdhd.languageString;
          track.nb_samples = trak.samples.length;
          track.size = trak.samples_size;
          track.bitrate = track.size * 8 * track.timescale / track.samples_duration;
          if (sample_desc.isAudio()) {
            track.type = "audio";
            movie.audioTracks.push(track);
            track.audio = {};
            track.audio.sample_rate = sample_desc.getSampleRate();
            track.audio.channel_count = sample_desc.getChannelCount();
            track.audio.sample_size = sample_desc.getSampleSize();
          } else if (sample_desc.isVideo()) {
            track.type = "video";
            movie.videoTracks.push(track);
            track.video = {};
            track.video.width = sample_desc.getWidth();
            track.video.height = sample_desc.getHeight();
          } else if (sample_desc.isSubtitle()) {
            track.type = "subtitles";
            movie.subtitleTracks.push(track);
          } else if (sample_desc.isHint()) {
            track.type = "metadata";
            movie.hintTracks.push(track);
          } else if (sample_desc.isMetadata()) {
            track.type = "metadata";
            movie.metadataTracks.push(track);
          } else {
            track.type = "metadata";
            movie.otherTracks.push(track);
          }
        }
      } else {
        movie.hasMoov = false;
      }
      movie.mime = "";
      if (movie.hasMoov && movie.tracks) {
        if (movie.videoTracks && movie.videoTracks.length > 0) {
          movie.mime += 'video/mp4; codecs="';
        } else if (movie.audioTracks && movie.audioTracks.length > 0) {
          movie.mime += 'audio/mp4; codecs="';
        } else {
          movie.mime += 'application/mp4; codecs="';
        }
        for (i2 = 0; i2 < movie.tracks.length; i2++) {
          if (i2 !== 0)
            movie.mime += ",";
          movie.mime += movie.tracks[i2].codec;
        }
        movie.mime += '"; profiles="';
        movie.mime += this.ftyp.compatible_brands.join();
        movie.mime += '"';
      }
      return movie;
    };
    ISOFile.prototype.setNextSeekPositionFromSample = function(sample) {
      if (!sample) {
        return;
      }
      if (this.nextSeekPosition) {
        this.nextSeekPosition = Math.min(sample.offset + sample.alreadyRead, this.nextSeekPosition);
      } else {
        this.nextSeekPosition = sample.offset + sample.alreadyRead;
      }
    };
    ISOFile.prototype.processSamples = function(last) {
      var i2;
      var trak;
      if (!this.sampleProcessingStarted)
        return;
      if (this.isFragmentationInitialized && this.onSegment !== null) {
        for (i2 = 0; i2 < this.fragmentedTracks.length; i2++) {
          var fragTrak = this.fragmentedTracks[i2];
          trak = fragTrak.trak;
          while (trak.nextSample < trak.samples.length && this.sampleProcessingStarted) {
            Log2.debug("ISOFile", "Creating media fragment on track #" + fragTrak.id + " for sample " + trak.nextSample);
            var result = this.createFragment(fragTrak.id, trak.nextSample, fragTrak.segmentStream);
            if (result) {
              fragTrak.segmentStream = result;
              trak.nextSample++;
            } else {
              break;
            }
            if (trak.nextSample % fragTrak.nb_samples === 0 || (last || trak.nextSample >= trak.samples.length)) {
              Log2.info("ISOFile", "Sending fragmented data on track #" + fragTrak.id + " for samples [" + Math.max(0, trak.nextSample - fragTrak.nb_samples) + "," + (trak.nextSample - 1) + "]");
              Log2.info("ISOFile", "Sample data size in memory: " + this.getAllocatedSampleDataSize());
              if (this.onSegment) {
                this.onSegment(fragTrak.id, fragTrak.user, fragTrak.segmentStream.buffer, trak.nextSample, last || trak.nextSample >= trak.samples.length);
              }
              fragTrak.segmentStream = null;
              if (fragTrak !== this.fragmentedTracks[i2]) {
                break;
              }
            }
          }
        }
      }
      if (this.onSamples !== null) {
        for (i2 = 0; i2 < this.extractedTracks.length; i2++) {
          var extractTrak = this.extractedTracks[i2];
          trak = extractTrak.trak;
          while (trak.nextSample < trak.samples.length && this.sampleProcessingStarted) {
            Log2.debug("ISOFile", "Exporting on track #" + extractTrak.id + " sample #" + trak.nextSample);
            var sample = this.getSample(trak, trak.nextSample);
            if (sample) {
              trak.nextSample++;
              extractTrak.samples.push(sample);
            } else {
              this.setNextSeekPositionFromSample(trak.samples[trak.nextSample]);
              break;
            }
            if (trak.nextSample % extractTrak.nb_samples === 0 || trak.nextSample >= trak.samples.length) {
              Log2.debug("ISOFile", "Sending samples on track #" + extractTrak.id + " for sample " + trak.nextSample);
              if (this.onSamples) {
                this.onSamples(extractTrak.id, extractTrak.user, extractTrak.samples);
              }
              extractTrak.samples = [];
              if (extractTrak !== this.extractedTracks[i2]) {
                break;
              }
            }
          }
        }
      }
    };
    ISOFile.prototype.getBox = function(type) {
      var result = this.getBoxes(type, true);
      return result.length ? result[0] : null;
    };
    ISOFile.prototype.getBoxes = function(type, returnEarly) {
      var result = [];
      ISOFile._sweep.call(this, type, result, returnEarly);
      return result;
    };
    ISOFile._sweep = function(type, result, returnEarly) {
      if (this.type && this.type == type)
        result.push(this);
      for (var box2 in this.boxes) {
        if (result.length && returnEarly)
          return;
        ISOFile._sweep.call(this.boxes[box2], type, result, returnEarly);
      }
    };
    ISOFile.prototype.getTrackSamplesInfo = function(track_id) {
      var track = this.getTrackById(track_id);
      if (track) {
        return track.samples;
      } else {
        return;
      }
    };
    ISOFile.prototype.getTrackSample = function(track_id, number) {
      var track = this.getTrackById(track_id);
      var sample = this.getSample(track, number);
      return sample;
    };
    ISOFile.prototype.releaseUsedSamples = function(id, sampleNum) {
      var size = 0;
      var trak = this.getTrackById(id);
      if (!trak.lastValidSample)
        trak.lastValidSample = 0;
      for (var i2 = trak.lastValidSample; i2 < sampleNum; i2++) {
        size += this.releaseSample(trak, i2);
      }
      Log2.info("ISOFile", "Track #" + id + " released samples up to " + sampleNum + " (released size: " + size + ", remaining: " + this.samplesDataSize + ")");
      trak.lastValidSample = sampleNum;
    };
    ISOFile.prototype.start = function() {
      this.sampleProcessingStarted = true;
      this.processSamples(false);
    };
    ISOFile.prototype.stop = function() {
      this.sampleProcessingStarted = false;
    };
    ISOFile.prototype.flush = function() {
      Log2.info("ISOFile", "Flushing remaining samples");
      this.updateSampleLists();
      this.processSamples(true);
      this.stream.cleanBuffers();
      this.stream.logBufferLevel(true);
    };
    ISOFile.prototype.seekTrack = function(time, useRap, trak) {
      var j;
      var sample;
      var seek_offset = Infinity;
      var rap_seek_sample_num = 0;
      var seek_sample_num = 0;
      var timescale;
      if (trak.samples.length === 0) {
        Log2.info("ISOFile", "No sample in track, cannot seek! Using time " + Log2.getDurationString(0, 1) + " and offset: 0");
        return { offset: 0, time: 0 };
      }
      for (j = 0; j < trak.samples.length; j++) {
        sample = trak.samples[j];
        if (j === 0) {
          seek_sample_num = 0;
          timescale = sample.timescale;
        } else if (sample.cts > time * sample.timescale) {
          seek_sample_num = j - 1;
          break;
        }
        if (useRap && sample.is_sync) {
          rap_seek_sample_num = j;
        }
      }
      if (useRap) {
        seek_sample_num = rap_seek_sample_num;
      }
      time = trak.samples[seek_sample_num].cts;
      trak.nextSample = seek_sample_num;
      while (trak.samples[seek_sample_num].alreadyRead === trak.samples[seek_sample_num].size) {
        if (!trak.samples[seek_sample_num + 1]) {
          break;
        }
        seek_sample_num++;
      }
      seek_offset = trak.samples[seek_sample_num].offset + trak.samples[seek_sample_num].alreadyRead;
      Log2.info("ISOFile", "Seeking to " + (useRap ? "RAP" : "") + " sample #" + trak.nextSample + " on track " + trak.tkhd.track_id + ", time " + Log2.getDurationString(time, timescale) + " and offset: " + seek_offset);
      return { offset: seek_offset, time: time / timescale };
    };
    ISOFile.prototype.getTrackDuration = function(trak) {
      var sample;
      if (!trak.samples) {
        return Infinity;
      }
      sample = trak.samples[trak.samples.length - 1];
      return (sample.cts + sample.duration) / sample.timescale;
    };
    ISOFile.prototype.seek = function(time, useRap) {
      var moov = this.moov;
      var trak;
      var trak_seek_info;
      var i2;
      var seek_info = { offset: Infinity, time: Infinity };
      if (!this.moov) {
        throw "Cannot seek: moov not received!";
      } else {
        for (i2 = 0; i2 < moov.traks.length; i2++) {
          trak = moov.traks[i2];
          if (time > this.getTrackDuration(trak)) {
            continue;
          }
          trak_seek_info = this.seekTrack(time, useRap, trak);
          if (trak_seek_info.offset < seek_info.offset) {
            seek_info.offset = trak_seek_info.offset;
          }
          if (trak_seek_info.time < seek_info.time) {
            seek_info.time = trak_seek_info.time;
          }
        }
        Log2.info("ISOFile", "Seeking at time " + Log2.getDurationString(seek_info.time, 1) + " needs a buffer with a fileStart position of " + seek_info.offset);
        if (seek_info.offset === Infinity) {
          seek_info = { offset: this.nextParsePosition, time: 0 };
        } else {
          seek_info.offset = this.stream.getEndFilePositionAfter(seek_info.offset);
        }
        Log2.info("ISOFile", "Adjusted seek position (after checking data already in buffer): " + seek_info.offset);
        return seek_info;
      }
    };
    ISOFile.prototype.equal = function(b) {
      var box_index = 0;
      while (box_index < this.boxes.length && box_index < b.boxes.length) {
        var a_box = this.boxes[box_index];
        var b_box = b.boxes[box_index];
        if (!BoxParser4.boxEqual(a_box, b_box)) {
          return false;
        }
        box_index++;
      }
      return true;
    };
    if (typeof exports !== "undefined") {
      exports.ISOFile = ISOFile;
    }
    ISOFile.prototype.lastBoxStartPosition = 0;
    ISOFile.prototype.parsingMdat = null;
    ISOFile.prototype.nextParsePosition = 0;
    ISOFile.prototype.discardMdatData = false;
    ISOFile.prototype.processIncompleteBox = function(ret2) {
      var box2;
      var merged;
      var found;
      if (ret2.type === "mdat") {
        box2 = new BoxParser4[ret2.type + "Box"](ret2.size);
        this.parsingMdat = box2;
        this.boxes.push(box2);
        this.mdats.push(box2);
        box2.start = ret2.start;
        box2.hdr_size = ret2.hdr_size;
        this.stream.addUsedBytes(box2.hdr_size);
        this.lastBoxStartPosition = box2.start + box2.size;
        found = this.stream.seek(box2.start + box2.size, false, this.discardMdatData);
        if (found) {
          this.parsingMdat = null;
          return true;
        } else {
          if (!this.moovStartFound) {
            this.nextParsePosition = box2.start + box2.size;
          } else {
            this.nextParsePosition = this.stream.findEndContiguousBuf();
          }
          return false;
        }
      } else {
        if (ret2.type === "moov") {
          this.moovStartFound = true;
          if (this.mdats.length === 0) {
            this.isProgressive = true;
          }
        }
        merged = this.stream.mergeNextBuffer ? this.stream.mergeNextBuffer() : false;
        if (merged) {
          this.nextParsePosition = this.stream.getEndPosition();
          return true;
        } else {
          if (!ret2.type) {
            this.nextParsePosition = this.stream.getEndPosition();
          } else {
            if (this.moovStartFound) {
              this.nextParsePosition = this.stream.getEndPosition();
            } else {
              this.nextParsePosition = this.stream.getPosition() + ret2.size;
            }
          }
          return false;
        }
      }
    };
    ISOFile.prototype.hasIncompleteMdat = function() {
      return this.parsingMdat !== null;
    };
    ISOFile.prototype.processIncompleteMdat = function() {
      var box2;
      var found;
      box2 = this.parsingMdat;
      found = this.stream.seek(box2.start + box2.size, false, this.discardMdatData);
      if (found) {
        Log2.debug("ISOFile", "Found 'mdat' end in buffered data");
        this.parsingMdat = null;
        return true;
      } else {
        this.nextParsePosition = this.stream.findEndContiguousBuf();
        return false;
      }
    };
    ISOFile.prototype.restoreParsePosition = function() {
      return this.stream.seek(this.lastBoxStartPosition, true, this.discardMdatData);
    };
    ISOFile.prototype.saveParsePosition = function() {
      this.lastBoxStartPosition = this.stream.getPosition();
    };
    ISOFile.prototype.updateUsedBytes = function(box2, ret2) {
      if (this.stream.addUsedBytes) {
        if (box2.type === "mdat") {
          this.stream.addUsedBytes(box2.hdr_size);
          if (this.discardMdatData) {
            this.stream.addUsedBytes(box2.size - box2.hdr_size);
          }
        } else {
          this.stream.addUsedBytes(box2.size);
        }
      }
    };
    ISOFile.prototype.add = BoxParser4.Box.prototype.add;
    ISOFile.prototype.addBox = BoxParser4.Box.prototype.addBox;
    ISOFile.prototype.init = function(_options) {
      var options = _options || {};
      var ftyp = this.add("ftyp").set("major_brand", options.brands && options.brands[0] || "iso4").set("minor_version", 0).set("compatible_brands", options.brands || ["iso4"]);
      var moov = this.add("moov");
      moov.add("mvhd").set("timescale", options.timescale || 600).set("rate", options.rate || 1 << 16).set("creation_time", 0).set("modification_time", 0).set("duration", options.duration || 0).set("volume", options.width ? 0 : 256).set("matrix", [1 << 16, 0, 0, 0, 1 << 16, 0, 0, 0, 1073741824]).set("next_track_id", 1);
      moov.add("mvex");
      return this;
    };
    ISOFile.prototype.addTrack = function(_options) {
      if (!this.moov) {
        this.init(_options);
      }
      var options = _options || {};
      options.width = options.width || 320;
      options.height = options.height || 320;
      options.id = options.id || this.moov.mvhd.next_track_id;
      options.type = options.type || "avc1";
      var trak = this.moov.add("trak");
      this.moov.mvhd.next_track_id = options.id + 1;
      trak.add("tkhd").set("flags", BoxParser4.TKHD_FLAG_ENABLED | BoxParser4.TKHD_FLAG_IN_MOVIE | BoxParser4.TKHD_FLAG_IN_PREVIEW).set("creation_time", 0).set("modification_time", 0).set("track_id", options.id).set("duration", options.duration || 0).set("layer", options.layer || 0).set("alternate_group", 0).set("volume", 1).set("matrix", [0, 0, 0, 0, 0, 0, 0, 0, 0]).set("width", options.width << 16).set("height", options.height << 16);
      var mdia = trak.add("mdia");
      mdia.add("mdhd").set("creation_time", 0).set("modification_time", 0).set("timescale", options.timescale || 1).set("duration", options.media_duration || 0).set("language", options.language || "und");
      mdia.add("hdlr").set("handler", options.hdlr || "vide").set("name", options.name || "Track created with MP4Box.js");
      mdia.add("elng").set("extended_language", options.language || "fr-FR");
      var minf = mdia.add("minf");
      if (BoxParser4[options.type + "SampleEntry"] === void 0)
        return;
      var sample_description_entry = new BoxParser4[options.type + "SampleEntry"]();
      sample_description_entry.data_reference_index = 1;
      var media_type = "";
      for (var mediaType in BoxParser4.sampleEntryCodes) {
        var codes = BoxParser4.sampleEntryCodes[mediaType];
        for (var i2 = 0; i2 < codes.length; i2++) {
          if (codes.indexOf(options.type) > -1) {
            media_type = mediaType;
            break;
          }
        }
      }
      switch (media_type) {
        case "Visual":
          minf.add("vmhd").set("graphicsmode", 0).set("opcolor", [0, 0, 0]);
          sample_description_entry.set("width", options.width).set("height", options.height).set("horizresolution", 72 << 16).set("vertresolution", 72 << 16).set("frame_count", 1).set("compressorname", options.type + " Compressor").set("depth", 24);
          if (options.avcDecoderConfigRecord) {
            var avcC = new BoxParser4.avcCBox();
            avcC.parse(new MP4BoxStream2(options.avcDecoderConfigRecord));
            sample_description_entry.addBox(avcC);
          } else if (options.hevcDecoderConfigRecord) {
            var hvcC = new BoxParser4.hvcCBox();
            hvcC.parse(new MP4BoxStream2(options.hevcDecoderConfigRecord));
            sample_description_entry.addBox(hvcC);
          }
          break;
        case "Audio":
          minf.add("smhd").set("balance", options.balance || 0);
          sample_description_entry.set("channel_count", options.channel_count || 2).set("samplesize", options.samplesize || 16).set("samplerate", options.samplerate || 1 << 16);
          break;
        case "Hint":
          minf.add("hmhd");
          break;
        case "Subtitle":
          minf.add("sthd");
          switch (options.type) {
            case "stpp":
              sample_description_entry.set("namespace", options.namespace || "nonamespace").set("schema_location", options.schema_location || "").set("auxiliary_mime_types", options.auxiliary_mime_types || "");
              break;
          }
          break;
        case "Metadata":
          minf.add("nmhd");
          break;
        case "System":
          minf.add("nmhd");
          break;
        default:
          minf.add("nmhd");
          break;
      }
      if (options.description) {
        sample_description_entry.addBox(options.description);
      }
      if (options.description_boxes) {
        options.description_boxes.forEach(function(b) {
          sample_description_entry.addBox(b);
        });
      }
      minf.add("dinf").add("dref").addEntry(new BoxParser4["url Box"]().set("flags", 1));
      var stbl = minf.add("stbl");
      stbl.add("stsd").addEntry(sample_description_entry);
      stbl.add("stts").set("sample_counts", []).set("sample_deltas", []);
      stbl.add("stsc").set("first_chunk", []).set("samples_per_chunk", []).set("sample_description_index", []);
      stbl.add("stco").set("chunk_offsets", []);
      stbl.add("stsz").set("sample_sizes", []);
      this.moov.mvex.add("trex").set("track_id", options.id).set("default_sample_description_index", options.default_sample_description_index || 1).set("default_sample_duration", options.default_sample_duration || 0).set("default_sample_size", options.default_sample_size || 0).set("default_sample_flags", options.default_sample_flags || 0);
      this.buildTrakSampleLists(trak);
      return options.id;
    };
    BoxParser4.Box.prototype.computeSize = function(stream_) {
      var stream = stream_ || new DataStream4();
      stream.endianness = DataStream4.BIG_ENDIAN;
      this.write(stream);
    };
    ISOFile.prototype.addSample = function(track_id, data, _options) {
      var options = _options || {};
      var sample = {};
      var trak = this.getTrackById(track_id);
      if (trak === null)
        return;
      sample.number = trak.samples.length;
      sample.track_id = trak.tkhd.track_id;
      sample.timescale = trak.mdia.mdhd.timescale;
      sample.description_index = options.sample_description_index ? options.sample_description_index - 1 : 0;
      sample.description = trak.mdia.minf.stbl.stsd.entries[sample.description_index];
      sample.data = data;
      sample.size = data.byteLength;
      sample.alreadyRead = sample.size;
      sample.duration = options.duration || 1;
      sample.cts = options.cts || 0;
      sample.dts = options.dts || 0;
      sample.is_sync = options.is_sync || false;
      sample.is_leading = options.is_leading || 0;
      sample.depends_on = options.depends_on || 0;
      sample.is_depended_on = options.is_depended_on || 0;
      sample.has_redundancy = options.has_redundancy || 0;
      sample.degradation_priority = options.degradation_priority || 0;
      sample.offset = 0;
      sample.subsamples = options.subsamples;
      trak.samples.push(sample);
      trak.samples_size += sample.size;
      trak.samples_duration += sample.duration;
      if (trak.first_dts === void 0) {
        trak.first_dts = options.dts;
      }
      this.processSamples();
      var moof = this.createSingleSampleMoof(sample);
      this.addBox(moof);
      moof.computeSize();
      moof.trafs[0].truns[0].data_offset = moof.size + 8;
      this.add("mdat").data = new Uint8Array(data);
      return sample;
    };
    ISOFile.prototype.createSingleSampleMoof = function(sample) {
      var sample_flags = 0;
      if (sample.is_sync)
        sample_flags = 1 << 25;
      else
        sample_flags = 1 << 16;
      var moof = new BoxParser4.moofBox();
      moof.add("mfhd").set("sequence_number", this.nextMoofNumber);
      this.nextMoofNumber++;
      var traf = moof.add("traf");
      var trak = this.getTrackById(sample.track_id);
      traf.add("tfhd").set("track_id", sample.track_id).set("flags", BoxParser4.TFHD_FLAG_DEFAULT_BASE_IS_MOOF);
      traf.add("tfdt").set("baseMediaDecodeTime", sample.dts - (trak.first_dts || 0));
      traf.add("trun").set("flags", BoxParser4.TRUN_FLAGS_DATA_OFFSET | BoxParser4.TRUN_FLAGS_DURATION | BoxParser4.TRUN_FLAGS_SIZE | BoxParser4.TRUN_FLAGS_FLAGS | BoxParser4.TRUN_FLAGS_CTS_OFFSET).set("data_offset", 0).set("first_sample_flags", 0).set("sample_count", 1).set("sample_duration", [sample.duration]).set("sample_size", [sample.size]).set("sample_flags", [sample_flags]).set("sample_composition_time_offset", [sample.cts - sample.dts]);
      return moof;
    };
    ISOFile.prototype.lastMoofIndex = 0;
    ISOFile.prototype.samplesDataSize = 0;
    ISOFile.prototype.resetTables = function() {
      var i2;
      var trak, stco, stsc, stsz, stts, ctts, stss;
      this.initial_duration = this.moov.mvhd.duration;
      this.moov.mvhd.duration = 0;
      for (i2 = 0; i2 < this.moov.traks.length; i2++) {
        trak = this.moov.traks[i2];
        trak.tkhd.duration = 0;
        trak.mdia.mdhd.duration = 0;
        stco = trak.mdia.minf.stbl.stco || trak.mdia.minf.stbl.co64;
        stco.chunk_offsets = [];
        stsc = trak.mdia.minf.stbl.stsc;
        stsc.first_chunk = [];
        stsc.samples_per_chunk = [];
        stsc.sample_description_index = [];
        stsz = trak.mdia.minf.stbl.stsz || trak.mdia.minf.stbl.stz2;
        stsz.sample_sizes = [];
        stts = trak.mdia.minf.stbl.stts;
        stts.sample_counts = [];
        stts.sample_deltas = [];
        ctts = trak.mdia.minf.stbl.ctts;
        if (ctts) {
          ctts.sample_counts = [];
          ctts.sample_offsets = [];
        }
        stss = trak.mdia.minf.stbl.stss;
        var k = trak.mdia.minf.stbl.boxes.indexOf(stss);
        if (k != -1)
          trak.mdia.minf.stbl.boxes[k] = null;
      }
    };
    ISOFile.initSampleGroups = function(trak, traf, sbgps, trak_sgpds, traf_sgpds) {
      var l;
      var k;
      var sample_groups_info;
      var sample_group_info;
      var sample_group_key;
      function SampleGroupInfo(_type, _parameter, _sbgp) {
        this.grouping_type = _type;
        this.grouping_type_parameter = _parameter;
        this.sbgp = _sbgp;
        this.last_sample_in_run = -1;
        this.entry_index = -1;
      }
      if (traf) {
        traf.sample_groups_info = [];
      }
      if (!trak.sample_groups_info) {
        trak.sample_groups_info = [];
      }
      for (k = 0; k < sbgps.length; k++) {
        sample_group_key = sbgps[k].grouping_type + "/" + sbgps[k].grouping_type_parameter;
        sample_group_info = new SampleGroupInfo(sbgps[k].grouping_type, sbgps[k].grouping_type_parameter, sbgps[k]);
        if (traf) {
          traf.sample_groups_info[sample_group_key] = sample_group_info;
        }
        if (!trak.sample_groups_info[sample_group_key]) {
          trak.sample_groups_info[sample_group_key] = sample_group_info;
        }
        for (l = 0; l < trak_sgpds.length; l++) {
          if (trak_sgpds[l].grouping_type === sbgps[k].grouping_type) {
            sample_group_info.description = trak_sgpds[l];
            sample_group_info.description.used = true;
          }
        }
        if (traf_sgpds) {
          for (l = 0; l < traf_sgpds.length; l++) {
            if (traf_sgpds[l].grouping_type === sbgps[k].grouping_type) {
              sample_group_info.fragment_description = traf_sgpds[l];
              sample_group_info.fragment_description.used = true;
              sample_group_info.is_fragment = true;
            }
          }
        }
      }
      if (!traf) {
        for (k = 0; k < trak_sgpds.length; k++) {
          if (!trak_sgpds[k].used && trak_sgpds[k].version >= 2) {
            sample_group_key = trak_sgpds[k].grouping_type + "/0";
            sample_group_info = new SampleGroupInfo(trak_sgpds[k].grouping_type, 0);
            if (!trak.sample_groups_info[sample_group_key]) {
              trak.sample_groups_info[sample_group_key] = sample_group_info;
            }
          }
        }
      } else {
        if (traf_sgpds) {
          for (k = 0; k < traf_sgpds.length; k++) {
            if (!traf_sgpds[k].used && traf_sgpds[k].version >= 2) {
              sample_group_key = traf_sgpds[k].grouping_type + "/0";
              sample_group_info = new SampleGroupInfo(traf_sgpds[k].grouping_type, 0);
              sample_group_info.is_fragment = true;
              if (!traf.sample_groups_info[sample_group_key]) {
                traf.sample_groups_info[sample_group_key] = sample_group_info;
              }
            }
          }
        }
      }
    };
    ISOFile.setSampleGroupProperties = function(trak, sample, sample_number, sample_groups_info) {
      var k;
      var index;
      sample.sample_groups = [];
      for (k in sample_groups_info) {
        sample.sample_groups[k] = {};
        sample.sample_groups[k].grouping_type = sample_groups_info[k].grouping_type;
        sample.sample_groups[k].grouping_type_parameter = sample_groups_info[k].grouping_type_parameter;
        if (sample_number >= sample_groups_info[k].last_sample_in_run) {
          if (sample_groups_info[k].last_sample_in_run < 0) {
            sample_groups_info[k].last_sample_in_run = 0;
          }
          sample_groups_info[k].entry_index++;
          if (sample_groups_info[k].entry_index <= sample_groups_info[k].sbgp.entries.length - 1) {
            sample_groups_info[k].last_sample_in_run += sample_groups_info[k].sbgp.entries[sample_groups_info[k].entry_index].sample_count;
          }
        }
        if (sample_groups_info[k].entry_index <= sample_groups_info[k].sbgp.entries.length - 1) {
          sample.sample_groups[k].group_description_index = sample_groups_info[k].sbgp.entries[sample_groups_info[k].entry_index].group_description_index;
        } else {
          sample.sample_groups[k].group_description_index = -1;
        }
        if (sample.sample_groups[k].group_description_index !== 0) {
          var description;
          if (sample_groups_info[k].fragment_description) {
            description = sample_groups_info[k].fragment_description;
          } else {
            description = sample_groups_info[k].description;
          }
          if (sample.sample_groups[k].group_description_index > 0) {
            if (sample.sample_groups[k].group_description_index > 65535) {
              index = (sample.sample_groups[k].group_description_index >> 16) - 1;
            } else {
              index = sample.sample_groups[k].group_description_index - 1;
            }
            if (description && index >= 0) {
              sample.sample_groups[k].description = description.entries[index];
            }
          } else {
            if (description && description.version >= 2) {
              if (description.default_group_description_index > 0) {
                sample.sample_groups[k].description = description.entries[description.default_group_description_index - 1];
              }
            }
          }
        }
      }
    };
    ISOFile.process_sdtp = function(sdtp, sample, number) {
      if (!sample) {
        return;
      }
      if (sdtp) {
        sample.is_leading = sdtp.is_leading[number];
        sample.depends_on = sdtp.sample_depends_on[number];
        sample.is_depended_on = sdtp.sample_is_depended_on[number];
        sample.has_redundancy = sdtp.sample_has_redundancy[number];
      } else {
        sample.is_leading = 0;
        sample.depends_on = 0;
        sample.is_depended_on = 0;
        sample.has_redundancy = 0;
      }
    };
    ISOFile.prototype.buildSampleLists = function() {
      var i2;
      var trak;
      for (i2 = 0; i2 < this.moov.traks.length; i2++) {
        trak = this.moov.traks[i2];
        this.buildTrakSampleLists(trak);
      }
    };
    ISOFile.prototype.buildTrakSampleLists = function(trak) {
      var j, k;
      var stco, stsc, stsz, stts, ctts, stss, stsd, subs, sbgps, sgpds, stdp;
      var chunk_run_index, chunk_index, last_chunk_in_run, offset_in_chunk, last_sample_in_chunk;
      var last_sample_in_stts_run, stts_run_index, last_sample_in_ctts_run, ctts_run_index, last_stss_index, last_subs_index, subs_entry_index, last_subs_sample_index;
      trak.samples = [];
      trak.samples_duration = 0;
      trak.samples_size = 0;
      stco = trak.mdia.minf.stbl.stco || trak.mdia.minf.stbl.co64;
      stsc = trak.mdia.minf.stbl.stsc;
      stsz = trak.mdia.minf.stbl.stsz || trak.mdia.minf.stbl.stz2;
      stts = trak.mdia.minf.stbl.stts;
      ctts = trak.mdia.minf.stbl.ctts;
      stss = trak.mdia.minf.stbl.stss;
      stsd = trak.mdia.minf.stbl.stsd;
      subs = trak.mdia.minf.stbl.subs;
      stdp = trak.mdia.minf.stbl.stdp;
      sbgps = trak.mdia.minf.stbl.sbgps;
      sgpds = trak.mdia.minf.stbl.sgpds;
      last_sample_in_stts_run = -1;
      stts_run_index = -1;
      last_sample_in_ctts_run = -1;
      ctts_run_index = -1;
      last_stss_index = 0;
      subs_entry_index = 0;
      last_subs_sample_index = 0;
      ISOFile.initSampleGroups(trak, null, sbgps, sgpds);
      if (typeof stsz === "undefined") {
        return;
      }
      for (j = 0; j < stsz.sample_sizes.length; j++) {
        var sample = {};
        sample.number = j;
        sample.track_id = trak.tkhd.track_id;
        sample.timescale = trak.mdia.mdhd.timescale;
        sample.alreadyRead = 0;
        trak.samples[j] = sample;
        sample.size = stsz.sample_sizes[j];
        trak.samples_size += sample.size;
        if (j === 0) {
          chunk_index = 1;
          chunk_run_index = 0;
          sample.chunk_index = chunk_index;
          sample.chunk_run_index = chunk_run_index;
          last_sample_in_chunk = stsc.samples_per_chunk[chunk_run_index];
          offset_in_chunk = 0;
          if (chunk_run_index + 1 < stsc.first_chunk.length) {
            last_chunk_in_run = stsc.first_chunk[chunk_run_index + 1] - 1;
          } else {
            last_chunk_in_run = Infinity;
          }
        } else {
          if (j < last_sample_in_chunk) {
            sample.chunk_index = chunk_index;
            sample.chunk_run_index = chunk_run_index;
          } else {
            chunk_index++;
            sample.chunk_index = chunk_index;
            offset_in_chunk = 0;
            if (chunk_index <= last_chunk_in_run) {
            } else {
              chunk_run_index++;
              if (chunk_run_index + 1 < stsc.first_chunk.length) {
                last_chunk_in_run = stsc.first_chunk[chunk_run_index + 1] - 1;
              } else {
                last_chunk_in_run = Infinity;
              }
            }
            sample.chunk_run_index = chunk_run_index;
            last_sample_in_chunk += stsc.samples_per_chunk[chunk_run_index];
          }
        }
        sample.description_index = stsc.sample_description_index[sample.chunk_run_index] - 1;
        sample.description = stsd.entries[sample.description_index];
        sample.offset = stco.chunk_offsets[sample.chunk_index - 1] + offset_in_chunk;
        offset_in_chunk += sample.size;
        if (j > last_sample_in_stts_run) {
          stts_run_index++;
          if (last_sample_in_stts_run < 0) {
            last_sample_in_stts_run = 0;
          }
          last_sample_in_stts_run += stts.sample_counts[stts_run_index];
        }
        if (j > 0) {
          trak.samples[j - 1].duration = stts.sample_deltas[stts_run_index];
          trak.samples_duration += trak.samples[j - 1].duration;
          sample.dts = trak.samples[j - 1].dts + trak.samples[j - 1].duration;
        } else {
          sample.dts = 0;
        }
        if (ctts) {
          if (j >= last_sample_in_ctts_run) {
            ctts_run_index++;
            if (last_sample_in_ctts_run < 0) {
              last_sample_in_ctts_run = 0;
            }
            last_sample_in_ctts_run += ctts.sample_counts[ctts_run_index];
          }
          sample.cts = trak.samples[j].dts + ctts.sample_offsets[ctts_run_index];
        } else {
          sample.cts = sample.dts;
        }
        if (stss) {
          if (j == stss.sample_numbers[last_stss_index] - 1) {
            sample.is_sync = true;
            last_stss_index++;
          } else {
            sample.is_sync = false;
            sample.degradation_priority = 0;
          }
          if (subs) {
            if (subs.entries[subs_entry_index].sample_delta + last_subs_sample_index == j + 1) {
              sample.subsamples = subs.entries[subs_entry_index].subsamples;
              last_subs_sample_index += subs.entries[subs_entry_index].sample_delta;
              subs_entry_index++;
            }
          }
        } else {
          sample.is_sync = true;
        }
        ISOFile.process_sdtp(trak.mdia.minf.stbl.sdtp, sample, sample.number);
        if (stdp) {
          sample.degradation_priority = stdp.priority[j];
        } else {
          sample.degradation_priority = 0;
        }
        if (subs) {
          if (subs.entries[subs_entry_index].sample_delta + last_subs_sample_index == j) {
            sample.subsamples = subs.entries[subs_entry_index].subsamples;
            last_subs_sample_index += subs.entries[subs_entry_index].sample_delta;
          }
        }
        if (sbgps.length > 0 || sgpds.length > 0) {
          ISOFile.setSampleGroupProperties(trak, sample, j, trak.sample_groups_info);
        }
      }
      if (j > 0) {
        trak.samples[j - 1].duration = Math.max(trak.mdia.mdhd.duration - trak.samples[j - 1].dts, 0);
        trak.samples_duration += trak.samples[j - 1].duration;
      }
    };
    ISOFile.prototype.updateSampleLists = function() {
      var i2, j, k;
      var default_sample_description_index, default_sample_duration, default_sample_size, default_sample_flags;
      var last_run_position;
      var box2, moof, traf, trak, trex;
      var sample;
      var sample_flags;
      if (this.moov === void 0) {
        return;
      }
      while (this.lastMoofIndex < this.moofs.length) {
        box2 = this.moofs[this.lastMoofIndex];
        this.lastMoofIndex++;
        if (box2.type == "moof") {
          moof = box2;
          for (i2 = 0; i2 < moof.trafs.length; i2++) {
            traf = moof.trafs[i2];
            trak = this.getTrackById(traf.tfhd.track_id);
            trex = this.getTrexById(traf.tfhd.track_id);
            if (traf.tfhd.flags & BoxParser4.TFHD_FLAG_SAMPLE_DESC) {
              default_sample_description_index = traf.tfhd.default_sample_description_index;
            } else {
              default_sample_description_index = trex ? trex.default_sample_description_index : 1;
            }
            if (traf.tfhd.flags & BoxParser4.TFHD_FLAG_SAMPLE_DUR) {
              default_sample_duration = traf.tfhd.default_sample_duration;
            } else {
              default_sample_duration = trex ? trex.default_sample_duration : 0;
            }
            if (traf.tfhd.flags & BoxParser4.TFHD_FLAG_SAMPLE_SIZE) {
              default_sample_size = traf.tfhd.default_sample_size;
            } else {
              default_sample_size = trex ? trex.default_sample_size : 0;
            }
            if (traf.tfhd.flags & BoxParser4.TFHD_FLAG_SAMPLE_FLAGS) {
              default_sample_flags = traf.tfhd.default_sample_flags;
            } else {
              default_sample_flags = trex ? trex.default_sample_flags : 0;
            }
            traf.sample_number = 0;
            if (traf.sbgps.length > 0) {
              ISOFile.initSampleGroups(trak, traf, traf.sbgps, trak.mdia.minf.stbl.sgpds, traf.sgpds);
            }
            for (j = 0; j < traf.truns.length; j++) {
              var trun = traf.truns[j];
              for (k = 0; k < trun.sample_count; k++) {
                sample = {};
                sample.moof_number = this.lastMoofIndex;
                sample.number_in_traf = traf.sample_number;
                traf.sample_number++;
                sample.number = trak.samples.length;
                traf.first_sample_index = trak.samples.length;
                trak.samples.push(sample);
                sample.track_id = trak.tkhd.track_id;
                sample.timescale = trak.mdia.mdhd.timescale;
                sample.description_index = default_sample_description_index - 1;
                sample.description = trak.mdia.minf.stbl.stsd.entries[sample.description_index];
                sample.size = default_sample_size;
                if (trun.flags & BoxParser4.TRUN_FLAGS_SIZE) {
                  sample.size = trun.sample_size[k];
                }
                trak.samples_size += sample.size;
                sample.duration = default_sample_duration;
                if (trun.flags & BoxParser4.TRUN_FLAGS_DURATION) {
                  sample.duration = trun.sample_duration[k];
                }
                trak.samples_duration += sample.duration;
                if (trak.first_traf_merged || k > 0) {
                  sample.dts = trak.samples[trak.samples.length - 2].dts + trak.samples[trak.samples.length - 2].duration;
                } else {
                  if (traf.tfdt) {
                    sample.dts = traf.tfdt.baseMediaDecodeTime;
                  } else {
                    sample.dts = 0;
                  }
                  trak.first_traf_merged = true;
                }
                sample.cts = sample.dts;
                if (trun.flags & BoxParser4.TRUN_FLAGS_CTS_OFFSET) {
                  sample.cts = sample.dts + trun.sample_composition_time_offset[k];
                }
                sample_flags = default_sample_flags;
                if (trun.flags & BoxParser4.TRUN_FLAGS_FLAGS) {
                  sample_flags = trun.sample_flags[k];
                } else if (k === 0 && trun.flags & BoxParser4.TRUN_FLAGS_FIRST_FLAG) {
                  sample_flags = trun.first_sample_flags;
                }
                sample.is_sync = sample_flags >> 16 & 1 ? false : true;
                sample.is_leading = sample_flags >> 26 & 3;
                sample.depends_on = sample_flags >> 24 & 3;
                sample.is_depended_on = sample_flags >> 22 & 3;
                sample.has_redundancy = sample_flags >> 20 & 3;
                sample.degradation_priority = sample_flags & 65535;
                var bdop = traf.tfhd.flags & BoxParser4.TFHD_FLAG_BASE_DATA_OFFSET ? true : false;
                var dbim = traf.tfhd.flags & BoxParser4.TFHD_FLAG_DEFAULT_BASE_IS_MOOF ? true : false;
                var dop = trun.flags & BoxParser4.TRUN_FLAGS_DATA_OFFSET ? true : false;
                var bdo = 0;
                if (!bdop) {
                  if (!dbim) {
                    if (j === 0) {
                      bdo = moof.start;
                    } else {
                      bdo = last_run_position;
                    }
                  } else {
                    bdo = moof.start;
                  }
                } else {
                  bdo = traf.tfhd.base_data_offset;
                }
                if (j === 0 && k === 0) {
                  if (dop) {
                    sample.offset = bdo + trun.data_offset;
                  } else {
                    sample.offset = bdo;
                  }
                } else {
                  sample.offset = last_run_position;
                }
                last_run_position = sample.offset + sample.size;
                if (traf.sbgps.length > 0 || traf.sgpds.length > 0 || trak.mdia.minf.stbl.sbgps.length > 0 || trak.mdia.minf.stbl.sgpds.length > 0) {
                  ISOFile.setSampleGroupProperties(trak, sample, sample.number_in_traf, traf.sample_groups_info);
                }
              }
            }
            if (traf.subs) {
              trak.has_fragment_subsamples = true;
              var sample_index = traf.first_sample_index;
              for (j = 0; j < traf.subs.entries.length; j++) {
                sample_index += traf.subs.entries[j].sample_delta;
                sample = trak.samples[sample_index - 1];
                sample.subsamples = traf.subs.entries[j].subsamples;
              }
            }
          }
        }
      }
    };
    ISOFile.prototype.getSample = function(trak, sampleNum) {
      var buffer;
      var sample = trak.samples[sampleNum];
      if (!this.moov) {
        return null;
      }
      if (!sample.data) {
        sample.data = new Uint8Array(sample.size);
        sample.alreadyRead = 0;
        this.samplesDataSize += sample.size;
        Log2.debug("ISOFile", "Allocating sample #" + sampleNum + " on track #" + trak.tkhd.track_id + " of size " + sample.size + " (total: " + this.samplesDataSize + ")");
      } else if (sample.alreadyRead == sample.size) {
        return sample;
      }
      while (true) {
        var index = this.stream.findPosition(true, sample.offset + sample.alreadyRead, false);
        if (index > -1) {
          buffer = this.stream.buffers[index];
          var lengthAfterStart = buffer.byteLength - (sample.offset + sample.alreadyRead - buffer.fileStart);
          if (sample.size - sample.alreadyRead <= lengthAfterStart) {
            Log2.debug("ISOFile", "Getting sample #" + sampleNum + " data (alreadyRead: " + sample.alreadyRead + " offset: " + (sample.offset + sample.alreadyRead - buffer.fileStart) + " read size: " + (sample.size - sample.alreadyRead) + " full size: " + sample.size + ")");
            DataStream4.memcpy(
              sample.data.buffer,
              sample.alreadyRead,
              buffer,
              sample.offset + sample.alreadyRead - buffer.fileStart,
              sample.size - sample.alreadyRead
            );
            buffer.usedBytes += sample.size - sample.alreadyRead;
            this.stream.logBufferLevel();
            sample.alreadyRead = sample.size;
            return sample;
          } else {
            if (lengthAfterStart === 0)
              return null;
            Log2.debug("ISOFile", "Getting sample #" + sampleNum + " partial data (alreadyRead: " + sample.alreadyRead + " offset: " + (sample.offset + sample.alreadyRead - buffer.fileStart) + " read size: " + lengthAfterStart + " full size: " + sample.size + ")");
            DataStream4.memcpy(
              sample.data.buffer,
              sample.alreadyRead,
              buffer,
              sample.offset + sample.alreadyRead - buffer.fileStart,
              lengthAfterStart
            );
            sample.alreadyRead += lengthAfterStart;
            buffer.usedBytes += lengthAfterStart;
            this.stream.logBufferLevel();
          }
        } else {
          return null;
        }
      }
    };
    ISOFile.prototype.releaseSample = function(trak, sampleNum) {
      var sample = trak.samples[sampleNum];
      if (sample.data) {
        this.samplesDataSize -= sample.size;
        sample.data = null;
        sample.alreadyRead = 0;
        return sample.size;
      } else {
        return 0;
      }
    };
    ISOFile.prototype.getAllocatedSampleDataSize = function() {
      return this.samplesDataSize;
    };
    ISOFile.prototype.getCodecs = function() {
      var i2;
      var codecs = "";
      for (i2 = 0; i2 < this.moov.traks.length; i2++) {
        var trak = this.moov.traks[i2];
        if (i2 > 0) {
          codecs += ",";
        }
        codecs += trak.mdia.minf.stbl.stsd.entries[0].getCodec();
      }
      return codecs;
    };
    ISOFile.prototype.getTrexById = function(id) {
      var i2;
      if (!this.moov || !this.moov.mvex)
        return null;
      for (i2 = 0; i2 < this.moov.mvex.trexs.length; i2++) {
        var trex = this.moov.mvex.trexs[i2];
        if (trex.track_id == id)
          return trex;
      }
      return null;
    };
    ISOFile.prototype.getTrackById = function(id) {
      if (this.moov === void 0) {
        return null;
      }
      for (var j = 0; j < this.moov.traks.length; j++) {
        var trak = this.moov.traks[j];
        if (trak.tkhd.track_id == id)
          return trak;
      }
      return null;
    };
    ISOFile.prototype.items = [];
    ISOFile.prototype.itemsDataSize = 0;
    ISOFile.prototype.flattenItemInfo = function() {
      var items = this.items;
      var i2, j;
      var item;
      var meta = this.meta;
      if (meta === null || meta === void 0)
        return;
      if (meta.hdlr === void 0)
        return;
      if (meta.iinf === void 0)
        return;
      for (i2 = 0; i2 < meta.iinf.item_infos.length; i2++) {
        item = {};
        item.id = meta.iinf.item_infos[i2].item_ID;
        items[item.id] = item;
        item.ref_to = [];
        item.name = meta.iinf.item_infos[i2].item_name;
        if (meta.iinf.item_infos[i2].protection_index > 0) {
          item.protection = meta.ipro.protections[meta.iinf.item_infos[i2].protection_index - 1];
        }
        if (meta.iinf.item_infos[i2].item_type) {
          item.type = meta.iinf.item_infos[i2].item_type;
        } else {
          item.type = "mime";
        }
        item.content_type = meta.iinf.item_infos[i2].content_type;
        item.content_encoding = meta.iinf.item_infos[i2].content_encoding;
      }
      if (meta.iloc) {
        for (i2 = 0; i2 < meta.iloc.items.length; i2++) {
          var offset;
          var itemloc = meta.iloc.items[i2];
          item = items[itemloc.item_ID];
          if (itemloc.data_reference_index !== 0) {
            Log2.warn("Item storage with reference to other files: not supported");
            item.source = meta.dinf.boxes[itemloc.data_reference_index - 1];
          }
          switch (itemloc.construction_method) {
            case 0:
              break;
            case 1:
              Log2.warn("Item storage with construction_method : not supported");
              break;
            case 2:
              Log2.warn("Item storage with construction_method : not supported");
              break;
          }
          item.extents = [];
          item.size = 0;
          for (j = 0; j < itemloc.extents.length; j++) {
            item.extents[j] = {};
            item.extents[j].offset = itemloc.extents[j].extent_offset + itemloc.base_offset;
            item.extents[j].length = itemloc.extents[j].extent_length;
            item.extents[j].alreadyRead = 0;
            item.size += item.extents[j].length;
          }
        }
      }
      if (meta.pitm) {
        items[meta.pitm.item_id].primary = true;
      }
      if (meta.iref) {
        for (i2 = 0; i2 < meta.iref.references.length; i2++) {
          var ref = meta.iref.references[i2];
          for (j = 0; j < ref.references.length; j++) {
            items[ref.from_item_ID].ref_to.push({ type: ref.type, id: ref.references[j] });
          }
        }
      }
      if (meta.iprp) {
        for (var k = 0; k < meta.iprp.ipmas.length; k++) {
          var ipma = meta.iprp.ipmas[k];
          for (i2 = 0; i2 < ipma.associations.length; i2++) {
            var association = ipma.associations[i2];
            item = items[association.id];
            if (item.properties === void 0) {
              item.properties = {};
              item.properties.boxes = [];
            }
            for (j = 0; j < association.props.length; j++) {
              var propEntry = association.props[j];
              if (propEntry.property_index > 0 && propEntry.property_index - 1 < meta.iprp.ipco.boxes.length) {
                var propbox = meta.iprp.ipco.boxes[propEntry.property_index - 1];
                item.properties[propbox.type] = propbox;
                item.properties.boxes.push(propbox);
              }
            }
          }
        }
      }
    };
    ISOFile.prototype.getItem = function(item_id) {
      var buffer;
      var item;
      if (!this.meta) {
        return null;
      }
      item = this.items[item_id];
      if (!item.data && item.size) {
        item.data = new Uint8Array(item.size);
        item.alreadyRead = 0;
        this.itemsDataSize += item.size;
        Log2.debug("ISOFile", "Allocating item #" + item_id + " of size " + item.size + " (total: " + this.itemsDataSize + ")");
      } else if (item.alreadyRead === item.size) {
        return item;
      }
      for (var i2 = 0; i2 < item.extents.length; i2++) {
        var extent = item.extents[i2];
        if (extent.alreadyRead === extent.length) {
          continue;
        } else {
          var index = this.stream.findPosition(true, extent.offset + extent.alreadyRead, false);
          if (index > -1) {
            buffer = this.stream.buffers[index];
            var lengthAfterStart = buffer.byteLength - (extent.offset + extent.alreadyRead - buffer.fileStart);
            if (extent.length - extent.alreadyRead <= lengthAfterStart) {
              Log2.debug("ISOFile", "Getting item #" + item_id + " extent #" + i2 + " data (alreadyRead: " + extent.alreadyRead + " offset: " + (extent.offset + extent.alreadyRead - buffer.fileStart) + " read size: " + (extent.length - extent.alreadyRead) + " full extent size: " + extent.length + " full item size: " + item.size + ")");
              DataStream4.memcpy(
                item.data.buffer,
                item.alreadyRead,
                buffer,
                extent.offset + extent.alreadyRead - buffer.fileStart,
                extent.length - extent.alreadyRead
              );
              buffer.usedBytes += extent.length - extent.alreadyRead;
              this.stream.logBufferLevel();
              item.alreadyRead += extent.length - extent.alreadyRead;
              extent.alreadyRead = extent.length;
            } else {
              Log2.debug("ISOFile", "Getting item #" + item_id + " extent #" + i2 + " partial data (alreadyRead: " + extent.alreadyRead + " offset: " + (extent.offset + extent.alreadyRead - buffer.fileStart) + " read size: " + lengthAfterStart + " full extent size: " + extent.length + " full item size: " + item.size + ")");
              DataStream4.memcpy(
                item.data.buffer,
                item.alreadyRead,
                buffer,
                extent.offset + extent.alreadyRead - buffer.fileStart,
                lengthAfterStart
              );
              extent.alreadyRead += lengthAfterStart;
              item.alreadyRead += lengthAfterStart;
              buffer.usedBytes += lengthAfterStart;
              this.stream.logBufferLevel();
              return null;
            }
          } else {
            return null;
          }
        }
      }
      if (item.alreadyRead === item.size) {
        return item;
      } else {
        return null;
      }
    };
    ISOFile.prototype.releaseItem = function(item_id) {
      var item = this.items[item_id];
      if (item.data) {
        this.itemsDataSize -= item.size;
        item.data = null;
        item.alreadyRead = 0;
        for (var i2 = 0; i2 < item.extents.length; i2++) {
          var extent = item.extents[i2];
          extent.alreadyRead = 0;
        }
        return item.size;
      } else {
        return 0;
      }
    };
    ISOFile.prototype.processItems = function(callback) {
      for (var i2 in this.items) {
        var item = this.items[i2];
        this.getItem(item.id);
        if (callback && !item.sent) {
          callback(item);
          item.sent = true;
          item.data = null;
        }
      }
    };
    ISOFile.prototype.hasItem = function(name) {
      for (var i2 in this.items) {
        var item = this.items[i2];
        if (item.name === name) {
          return item.id;
        }
      }
      return -1;
    };
    ISOFile.prototype.getMetaHandler = function() {
      if (!this.meta) {
        return null;
      } else {
        return this.meta.hdlr.handler;
      }
    };
    ISOFile.prototype.getPrimaryItem = function() {
      if (!this.meta || !this.meta.pitm) {
        return null;
      } else {
        return this.getItem(this.meta.pitm.item_id);
      }
    };
    ISOFile.prototype.itemToFragmentedTrackFile = function(_options) {
      var options = _options || {};
      var item = null;
      if (options.itemId) {
        item = this.getItem(options.itemId);
      } else {
        item = this.getPrimaryItem();
      }
      if (item == null)
        return null;
      var file = new ISOFile();
      file.discardMdatData = false;
      var trackOptions = { type: item.type, description_boxes: item.properties.boxes };
      if (item.properties.ispe) {
        trackOptions.width = item.properties.ispe.image_width;
        trackOptions.height = item.properties.ispe.image_height;
      }
      var trackId = file.addTrack(trackOptions);
      if (trackId) {
        file.addSample(trackId, item.data);
        return file;
      } else {
        return null;
      }
    };
    ISOFile.prototype.write = function(outstream) {
      for (var i2 = 0; i2 < this.boxes.length; i2++) {
        this.boxes[i2].write(outstream);
      }
    };
    ISOFile.prototype.createFragment = function(track_id, sampleNumber, stream_) {
      var trak = this.getTrackById(track_id);
      var sample = this.getSample(trak, sampleNumber);
      if (sample == null) {
        this.setNextSeekPositionFromSample(trak.samples[sampleNumber]);
        return null;
      }
      var stream = stream_ || new DataStream4();
      stream.endianness = DataStream4.BIG_ENDIAN;
      var moof = this.createSingleSampleMoof(sample);
      moof.write(stream);
      moof.trafs[0].truns[0].data_offset = moof.size + 8;
      Log2.debug("MP4Box", "Adjusting data_offset with new value " + moof.trafs[0].truns[0].data_offset);
      stream.adjustUint32(moof.trafs[0].truns[0].data_offset_position, moof.trafs[0].truns[0].data_offset);
      var mdat = new BoxParser4.mdatBox();
      mdat.data = sample.data;
      mdat.write(stream);
      return stream;
    };
    ISOFile.writeInitializationSegment = function(ftyp, moov, total_duration, sample_duration) {
      var i2;
      var index;
      var mehd;
      var trex;
      var box2;
      Log2.debug("ISOFile", "Generating initialization segment");
      var stream = new DataStream4();
      stream.endianness = DataStream4.BIG_ENDIAN;
      ftyp.write(stream);
      var mvex = moov.add("mvex");
      if (total_duration) {
        mvex.add("mehd").set("fragment_duration", total_duration);
      }
      for (i2 = 0; i2 < moov.traks.length; i2++) {
        mvex.add("trex").set("track_id", moov.traks[i2].tkhd.track_id).set("default_sample_description_index", 1).set("default_sample_duration", sample_duration).set("default_sample_size", 0).set("default_sample_flags", 1 << 16);
      }
      moov.write(stream);
      return stream.buffer;
    };
    ISOFile.prototype.save = function(name) {
      var stream = new DataStream4();
      stream.endianness = DataStream4.BIG_ENDIAN;
      this.write(stream);
      stream.save(name);
    };
    ISOFile.prototype.getBuffer = function() {
      var stream = new DataStream4();
      stream.endianness = DataStream4.BIG_ENDIAN;
      this.write(stream);
      return stream.buffer;
    };
    ISOFile.prototype.initializeSegmentation = function() {
      var i2;
      var j;
      var box2;
      var initSegs;
      var trak;
      var seg;
      if (this.onSegment === null) {
        Log2.warn("MP4Box", "No segmentation callback set!");
      }
      if (!this.isFragmentationInitialized) {
        this.isFragmentationInitialized = true;
        this.nextMoofNumber = 0;
        this.resetTables();
      }
      initSegs = [];
      for (i2 = 0; i2 < this.fragmentedTracks.length; i2++) {
        var moov = new BoxParser4.moovBox();
        moov.mvhd = this.moov.mvhd;
        moov.boxes.push(moov.mvhd);
        trak = this.getTrackById(this.fragmentedTracks[i2].id);
        moov.boxes.push(trak);
        moov.traks.push(trak);
        seg = {};
        seg.id = trak.tkhd.track_id;
        seg.user = this.fragmentedTracks[i2].user;
        seg.buffer = ISOFile.writeInitializationSegment(this.ftyp, moov, this.moov.mvex && this.moov.mvex.mehd ? this.moov.mvex.mehd.fragment_duration : void 0, this.moov.traks[i2].samples.length > 0 ? this.moov.traks[i2].samples[0].duration : 0);
        initSegs.push(seg);
      }
      return initSegs;
    };
    BoxParser4.Box.prototype.printHeader = function(output) {
      this.size += 8;
      if (this.size > MAX_SIZE) {
        this.size += 8;
      }
      if (this.type === "uuid") {
        this.size += 16;
      }
      output.log(output.indent + "size:" + this.size);
      output.log(output.indent + "type:" + this.type);
    };
    BoxParser4.FullBox.prototype.printHeader = function(output) {
      this.size += 4;
      BoxParser4.Box.prototype.printHeader.call(this, output);
      output.log(output.indent + "version:" + this.version);
      output.log(output.indent + "flags:" + this.flags);
    };
    BoxParser4.Box.prototype.print = function(output) {
      this.printHeader(output);
    };
    BoxParser4.ContainerBox.prototype.print = function(output) {
      this.printHeader(output);
      for (var i2 = 0; i2 < this.boxes.length; i2++) {
        if (this.boxes[i2]) {
          var prev_indent = output.indent;
          output.indent += " ";
          this.boxes[i2].print(output);
          output.indent = prev_indent;
        }
      }
    };
    ISOFile.prototype.print = function(output) {
      output.indent = "";
      for (var i2 = 0; i2 < this.boxes.length; i2++) {
        if (this.boxes[i2]) {
          this.boxes[i2].print(output);
        }
      }
    };
    BoxParser4.mvhdBox.prototype.print = function(output) {
      BoxParser4.FullBox.prototype.printHeader.call(this, output);
      output.log(output.indent + "creation_time: " + this.creation_time);
      output.log(output.indent + "modification_time: " + this.modification_time);
      output.log(output.indent + "timescale: " + this.timescale);
      output.log(output.indent + "duration: " + this.duration);
      output.log(output.indent + "rate: " + this.rate);
      output.log(output.indent + "volume: " + (this.volume >> 8));
      output.log(output.indent + "matrix: " + this.matrix.join(", "));
      output.log(output.indent + "next_track_id: " + this.next_track_id);
    };
    BoxParser4.tkhdBox.prototype.print = function(output) {
      BoxParser4.FullBox.prototype.printHeader.call(this, output);
      output.log(output.indent + "creation_time: " + this.creation_time);
      output.log(output.indent + "modification_time: " + this.modification_time);
      output.log(output.indent + "track_id: " + this.track_id);
      output.log(output.indent + "duration: " + this.duration);
      output.log(output.indent + "volume: " + (this.volume >> 8));
      output.log(output.indent + "matrix: " + this.matrix.join(", "));
      output.log(output.indent + "layer: " + this.layer);
      output.log(output.indent + "alternate_group: " + this.alternate_group);
      output.log(output.indent + "width: " + this.width);
      output.log(output.indent + "height: " + this.height);
    };
    var MP4Box = {};
    MP4Box.createFile = function(_keepMdatData, _stream) {
      var keepMdatData = _keepMdatData !== void 0 ? _keepMdatData : true;
      var file = new ISOFile(_stream);
      file.discardMdatData = keepMdatData ? false : true;
      return file;
    };
    if (typeof exports !== "undefined") {
      exports.createFile = MP4Box.createFile;
    }
  }
});

// src/index.ts
var import_mp4box6 = __toESM(require_mp4box_all());

// node_modules/.pnpm/@misskey-dev+browser-image-resizer@2.2.1-misskey.10/node_modules/@misskey-dev/browser-image-resizer/dist/index.js
function bilinear(srcCanvasData, destCanvasData, scale) {
  function inner(f00, f10, f01, f11, x, y) {
    let un_x = 1 - x;
    let un_y = 1 - y;
    return f00 * un_x * un_y + f10 * x * un_y + f01 * un_x * y + f11 * x * y;
  }
  let i2, j;
  let iyv, iy0, iy1, ixv, ix0, ix1;
  let idxD, idxS00, idxS10, idxS01, idxS11;
  let dx, dy;
  let r, g, b, a;
  for (i2 = 0; i2 < destCanvasData.height; ++i2) {
    iyv = i2 / scale;
    iy0 = Math.floor(iyv);
    iy1 = Math.ceil(iyv) > srcCanvasData.height - 1 ? srcCanvasData.height - 1 : Math.ceil(iyv);
    for (j = 0; j < destCanvasData.width; ++j) {
      ixv = j / scale;
      ix0 = Math.floor(ixv);
      ix1 = Math.ceil(ixv) > srcCanvasData.width - 1 ? srcCanvasData.width - 1 : Math.ceil(ixv);
      idxD = (j + destCanvasData.width * i2) * 4;
      idxS00 = (ix0 + srcCanvasData.width * iy0) * 4;
      idxS10 = (ix1 + srcCanvasData.width * iy0) * 4;
      idxS01 = (ix0 + srcCanvasData.width * iy1) * 4;
      idxS11 = (ix1 + srcCanvasData.width * iy1) * 4;
      dx = ixv - ix0;
      dy = iyv - iy0;
      r = inner(
        srcCanvasData.data[idxS00],
        srcCanvasData.data[idxS10],
        srcCanvasData.data[idxS01],
        srcCanvasData.data[idxS11],
        dx,
        dy
      );
      destCanvasData.data[idxD] = r;
      g = inner(
        srcCanvasData.data[idxS00 + 1],
        srcCanvasData.data[idxS10 + 1],
        srcCanvasData.data[idxS01 + 1],
        srcCanvasData.data[idxS11 + 1],
        dx,
        dy
      );
      destCanvasData.data[idxD + 1] = g;
      b = inner(
        srcCanvasData.data[idxS00 + 2],
        srcCanvasData.data[idxS10 + 2],
        srcCanvasData.data[idxS01 + 2],
        srcCanvasData.data[idxS11 + 2],
        dx,
        dy
      );
      destCanvasData.data[idxD + 2] = b;
      a = inner(
        srcCanvasData.data[idxS00 + 3],
        srcCanvasData.data[idxS10 + 3],
        srcCanvasData.data[idxS01 + 3],
        srcCanvasData.data[idxS11 + 3],
        dx,
        dy
      );
      destCanvasData.data[idxD + 3] = a;
    }
  }
}
var hermite;
function getTargetHeight(srcHeight, scale, config) {
  return Math.min(Math.floor(srcHeight * scale), config.maxHeight);
}
function findMaxWidth(config, canvas) {
  const ratio = canvas.width / canvas.height;
  let mWidth = Math.min(
    canvas.width,
    config.maxWidth,
    ratio * config.maxHeight
  );
  if (config.maxSize && config.maxSize > 0 && config.maxSize < canvas.width * canvas.height / 1e3)
    mWidth = Math.min(
      mWidth,
      Math.floor(config.maxSize * 1e3 / canvas.height)
    );
  if (!!config.scaleRatio)
    mWidth = Math.min(mWidth, Math.floor(config.scaleRatio * canvas.width));
  if (config.debug) {
    console.log(
      "browser-image-resizer: original image size = " + canvas.width + " px (width) X " + canvas.height + " px (height)"
    );
    console.log(
      "browser-image-resizer: scaled image size = " + mWidth + " px (width) X " + getTargetHeight(canvas.height, mWidth / canvas.width, config) + " px (height)"
    );
  }
  if (mWidth <= 0) {
    mWidth = 1;
    console.warn("browser-image-resizer: image size is too small");
  }
  return mWidth;
}
function getImageData(canvas, scaled) {
  const srcImgData = canvas?.getContext("2d")?.getImageData(0, 0, canvas.width, canvas.height);
  const destImgData = scaled?.getContext("2d")?.createImageData(scaled.width, scaled.height);
  if (!srcImgData || !destImgData)
    throw Error("Canvas is empty (scaleCanvasWithAlgorithm). You should run this script after the document is ready.");
  return { srcImgData, destImgData };
}
function prepareHermit() {
  if (!hermite)
    hermite = new Hermit();
}
async function scaleCanvasWithAlgorithm(canvas, config) {
  const scale = config.outputWidth / canvas.width;
  const scaled = new OffscreenCanvas(Math.floor(config.outputWidth), getTargetHeight(canvas.height, scale, config));
  switch (config.argorithm) {
    case "hermite": {
      prepareHermit();
      await hermite.resampleAuto(canvas, scaled, config);
      break;
    }
    case "hermite_single": {
      const { srcImgData, destImgData } = getImageData(canvas, scaled);
      prepareHermit();
      hermite.resampleSingle(srcImgData, destImgData, config);
      scaled?.getContext("2d")?.putImageData(destImgData, 0, 0);
      break;
    }
    case "bilinear": {
      const { srcImgData, destImgData } = getImageData(canvas, scaled);
      bilinear(srcImgData, destImgData, scale);
      scaled?.getContext("2d")?.putImageData(destImgData, 0, 0);
      break;
    }
    default: {
      scaled.getContext("2d")?.drawImage(canvas, 0, 0, scaled.width, scaled.height);
      break;
    }
  }
  return scaled;
}
function getHalfScaleCanvas(src) {
  const half = new OffscreenCanvas(src.width / 2, src.height / 2);
  half?.getContext("2d")?.drawImage(src, 0, 0, half.width, half.height);
  return half;
}
async function scaleImage({ img, config }) {
  if (config.debug) {
    console.log("browser-image-resizer: Scale: Started", img);
  }
  let converting;
  if (img instanceof OffscreenCanvas) {
    converting = img;
  } else {
    const bmp = await createImageBitmap(img);
    converting = new OffscreenCanvas(bmp.width, bmp.height);
    converting.getContext("2d")?.drawImage(bmp, 0, 0);
  }
  if (!converting?.getContext("2d"))
    throw Error("browser-image-resizer: Canvas Context is empty.");
  const maxWidth = findMaxWidth(config, converting);
  if (!maxWidth)
    throw Error(`browser-image-resizer: maxWidth is ${maxWidth}!!`);
  if (config.debug)
    console.log(`browser-image-resizer: scale: maxWidth is ${maxWidth}`);
  while (config.processByHalf && converting.width >= 2 * maxWidth) {
    if (config.debug)
      console.log(`browser-image-resizer: scale: Scaling canvas by half from ${converting.width}`);
    converting = getHalfScaleCanvas(converting);
  }
  if (converting.width > maxWidth) {
    if (config.debug)
      console.log(`browser-image-resizer: scale: Scaling canvas by ${config.argorithm} from ${converting.width} to ${maxWidth}`);
    converting = await scaleCanvasWithAlgorithm(
      converting,
      Object.assign(config, { outputWidth: maxWidth })
    );
  }
  if (config.mimeType === null) {
    return converting;
  }
  const imageData = await converting.convertToBlob({ type: config.mimeType, quality: config.quality });
  return imageData;
}
var Hermit = class {
  /**
   * contructor
   */
  constructor() {
    this.workersArchive = [];
    this.cores = Math.min(navigator.hardwareConcurrency || 4, 4);
    this.workerBlobURL = globalThis.URL.createObjectURL(new Blob([
      "(",
      function() {
        onmessage = function(event) {
          if (event.data.debug) {
            console.log("browser-image-resizer: hermite worker: start", event.data.core, event.data);
            console.time("work");
          }
          const core = event.data.core;
          const srcWidth = event.data.srcWidth;
          const srcHeight = event.data.srcHeight;
          const destWidth = event.data.destWidth;
          const destHeight = event.data.destHeight;
          const ratio_w = srcWidth / destWidth;
          const ratio_h = srcHeight / destHeight;
          const ratio_w_half = Math.ceil(ratio_w / 2);
          const ratio_h_half = Math.ceil(ratio_h / 2);
          const source = new Uint8ClampedArray(event.data.source);
          const target_size = destWidth * destHeight * 4;
          const target_memory = new ArrayBuffer(target_size);
          const target = new Uint8ClampedArray(target_memory, 0, target_size);
          for (let j = 0; j < destHeight; j++) {
            for (let i2 = 0; i2 < destWidth; i2++) {
              const x2 = (i2 + j * destWidth) * 4;
              let weight = 0;
              let weights = 0;
              let weights_alpha = 0;
              let gx_r = 0;
              let gx_g = 0;
              let gx_b = 0;
              let gx_a = 0;
              const center_y = j * ratio_h;
              const xx_start = Math.floor(i2 * ratio_w);
              const xx_stop = Math.min(Math.ceil((i2 + 1) * ratio_w), srcWidth);
              const yy_start = Math.floor(j * ratio_h);
              const yy_stop = Math.min(Math.ceil((j + 1) * ratio_h), srcHeight);
              for (let yy = yy_start; yy < yy_stop; yy++) {
                let dy = Math.abs(center_y - yy) / ratio_h_half;
                let center_x = i2 * ratio_w;
                let w0 = dy * dy;
                for (let xx = xx_start; xx < xx_stop; xx++) {
                  let dx = Math.abs(center_x - xx) / ratio_w_half;
                  let w = Math.sqrt(w0 + dx * dx);
                  if (w >= 1) {
                    continue;
                  }
                  weight = 2 * w * w * w - 3 * w * w + 1;
                  let pos_x = 4 * (xx + yy * srcWidth);
                  gx_a += weight * source[pos_x + 3];
                  weights_alpha += weight;
                  if (source[pos_x + 3] < 255)
                    weight = weight * source[pos_x + 3] / 250;
                  gx_r += weight * source[pos_x];
                  gx_g += weight * source[pos_x + 1];
                  gx_b += weight * source[pos_x + 2];
                  weights += weight;
                }
              }
              target[x2] = gx_r / weights;
              target[x2 + 1] = gx_g / weights;
              target[x2 + 2] = gx_b / weights;
              target[x2 + 3] = gx_a / weights_alpha;
            }
          }
          const objData = {
            core,
            target
          };
          globalThis.postMessage(objData, [target.buffer]);
          if (event.data.debug) {
            console.timeEnd("work");
            console.log("browser-image-resizer: Worker: end", event.data.core);
          }
        };
      }.toString(),
      ")()"
    ], { type: "application/javascript" }));
  }
  /**
   * Hermite resize. Detect cpu count and use best option for user.
   */
  resampleAuto(srcCanvas, destCanvas, config) {
    if (!!globalThis.Worker && this.cores > 1 && config?.argorithm !== "hermite_single") {
      return this.resample(srcCanvas, destCanvas, config);
    } else {
      const { srcImgData, destImgData } = getImageData(srcCanvas, destCanvas);
      this.resampleSingle(srcImgData, destImgData, config);
      destCanvas.getContext("2d").putImageData(destImgData, 0, 0);
      return;
    }
  }
  /**
   * Hermite resize, multicore version - fast image resize/resample using Hermite filter.
   */
  async resample(srcCanvas, destCanvas, config) {
    return new Promise((resolve, reject) => {
      if (config.debug)
        console.time("hermite_multi");
      const ratio_h = srcCanvas.height / destCanvas.height;
      if (this.workersArchive.length > 0) {
        for (let c = 0; c < this.cores; c++) {
          if (this.workersArchive[c] != void 0) {
            this.workersArchive[c].terminate();
            delete this.workersArchive[c];
          }
        }
      }
      this.workersArchive = new Array(this.cores);
      const ctx = srcCanvas.getContext("2d");
      if (!ctx)
        return reject("Canvas is empty (resample)");
      if (config.debug) {
        console.log("browser-image-resizer: hermite_multi: ", this.cores, "cores");
        console.log("browser-image-resizer: source size: ", srcCanvas.width, srcCanvas.height, "ratio_h: ", ratio_h);
        console.log("browser-image-resizer: target size: ", destCanvas.width, destCanvas.height);
      }
      const data_part = [];
      const block_height = Math.ceil(srcCanvas.height / this.cores / 2) * 2;
      let end_y = -1;
      for (let c = 0; c < this.cores; c++) {
        const offset_y = end_y + 1;
        if (offset_y >= srcCanvas.height) {
          continue;
        }
        end_y = Math.min(offset_y + block_height - 1, srcCanvas.height - 1);
        const current_block_height = Math.min(block_height, srcCanvas.height - offset_y);
        if (config.debug) {
          console.log("browser-image-resizer: source split: ", "#" + c, offset_y, end_y, "height: " + current_block_height);
        }
        data_part.push({
          source: ctx.getImageData(0, offset_y, srcCanvas.width, block_height),
          startY: Math.ceil(offset_y / ratio_h),
          height: current_block_height
        });
      }
      const destCtx = destCanvas.getContext("2d");
      if (!destCtx)
        return reject("Canvas is empty (resample dest)");
      let workers_in_use = data_part.length;
      for (let c = 0; c < data_part.length; c++) {
        const my_worker = new Worker(this.workerBlobURL);
        this.workersArchive[c] = my_worker;
        my_worker.onmessage = (event) => {
          workers_in_use--;
          const core = event.data.core;
          const height_part = Math.ceil(data_part[core].height / ratio_h);
          const target = destCtx.createImageData(destCanvas.width, height_part);
          target.data.set(event.data.target);
          destCtx.putImageData(target, 0, data_part[core].startY);
          if (workers_in_use <= 0) {
            resolve();
            if (config.debug)
              console.timeEnd("hermite_multi");
          }
          this.workersArchive[core].terminate();
          delete this.workersArchive[core];
        };
        my_worker.onerror = (err) => reject(err);
        const objData = {
          srcWidth: srcCanvas.width,
          srcHeight: data_part[c].height,
          destWidth: destCanvas.width,
          destHeight: Math.ceil(data_part[c].height / ratio_h),
          core: c,
          source: data_part[c].source.data.buffer,
          debug: config.debug
        };
        my_worker.postMessage(objData, [objData.source]);
      }
    });
  }
  /**
   * Hermite resize - fast image resize/resample using Hermite filter. 1 cpu version!
   */
  resampleSingle(srcCanvasData, destCanvasData, config) {
    const ratio_w = srcCanvasData.width / destCanvasData.width;
    const ratio_h = srcCanvasData.height / destCanvasData.height;
    const ratio_w_half = Math.ceil(ratio_w / 2);
    const ratio_h_half = Math.ceil(ratio_h / 2);
    const data = srcCanvasData.data;
    const data2 = destCanvasData.data;
    if (config.debug) {
      console.log("browser-image-resizer: source size: ", srcCanvasData.width, srcCanvasData.height, "ratio_h: ", ratio_h);
      console.log("browser-image-resizer: target size: ", destCanvasData.width, destCanvasData.height);
      console.time("hermite_single");
    }
    for (let j = 0; j < destCanvasData.height; j++) {
      for (let i2 = 0; i2 < destCanvasData.width; i2++) {
        const x2 = (i2 + j * destCanvasData.width) * 4;
        let weight = 0;
        let weights = 0;
        let weights_alpha = 0;
        let gx_r = 0;
        let gx_g = 0;
        let gx_b = 0;
        let gx_a = 0;
        const center_y = j * ratio_h;
        const xx_start = Math.floor(i2 * ratio_w);
        const xx_stop = Math.min(Math.ceil((i2 + 1) * ratio_w), srcCanvasData.width);
        const yy_start = Math.floor(j * ratio_h);
        const yy_stop = Math.min(Math.ceil((j + 1) * ratio_h), srcCanvasData.height);
        for (let yy = yy_start; yy < yy_stop; yy++) {
          let dy = Math.abs(center_y - yy) / ratio_h_half;
          let center_x = i2 * ratio_w;
          let w0 = dy * dy;
          for (let xx = xx_start; xx < xx_stop; xx++) {
            let dx = Math.abs(center_x - xx) / ratio_w_half;
            let w = Math.sqrt(w0 + dx * dx);
            if (w >= 1) {
              continue;
            }
            weight = 2 * w * w * w - 3 * w * w + 1;
            let pos_x = 4 * (xx + yy * srcCanvasData.width);
            gx_a += weight * data[pos_x + 3];
            weights_alpha += weight;
            if (data[pos_x + 3] < 255)
              weight = weight * data[pos_x + 3] / 250;
            gx_r += weight * data[pos_x];
            gx_g += weight * data[pos_x + 1];
            gx_b += weight * data[pos_x + 2];
            weights += weight;
          }
        }
        data2[x2] = gx_r / weights;
        data2[x2 + 1] = gx_g / weights;
        data2[x2 + 2] = gx_b / weights;
        data2[x2 + 3] = gx_a / weights_alpha;
      }
    }
    if (config.debug) {
      console.timeEnd("hermite_single");
    }
  }
};
var DEFAULT_CONFIG = {
  argorithm: "null",
  processByHalf: true,
  quality: 0.5,
  maxWidth: 800,
  maxHeight: 600,
  debug: false,
  mimeType: "image/jpeg"
};
async function readAndCompressImage(img, userConfig) {
  const config = Object.assign({}, DEFAULT_CONFIG, userConfig);
  return scaleImage({ img, config });
}
function calculateSize(src, userConfig) {
  const config = Object.assign({}, DEFAULT_CONFIG, userConfig);
  const width = findMaxWidth(config, src);
  const height = getTargetHeight(src.height, width / src.width, config);
  return { width: Math.floor(width), height };
}

// src/demux.ts
var import_mp4box2 = __toESM(require_mp4box_all());

// src/box.ts
var import_mp4box = __toESM(require_mp4box_all());
function getBoxBuffer(box2) {
  const stream = new import_mp4box.DataStream(void 0, 0, import_mp4box.DataStream.BIG_ENDIAN);
  box2.write(stream);
  return stream.buffer;
}
function getDescriptionBuffer(entry) {
  const box2 = entry.avcC || entry.hvcC || entry.vpcC || entry.av1C;
  if (box2) {
    const buffer = getBoxBuffer(box2);
    return new Uint8Array(buffer, 8);
  }
  throw new Error("avcC, hvcC, vpcC or av1C box not found");
}
function getDescriptionBoxEntriesFromTrak(trak) {
  return trak?.mdia?.minf?.stbl?.stsd?.entries ?? [];
}

// src/demux.ts
var KEEP_SAMPLES_NUMBER = 50;
var generateDemuxTransformer = (trackId, DEV = false) => {
  let seek = 0;
  let mp4boxfile;
  const ___ = (() => {
    let allSamplesEnqueuedCallback;
    const allSamplesEnqueued = new Promise((resolve) => {
      allSamplesEnqueuedCallback = resolve;
    });
    return {
      allSamplesEnqueuedPromise: allSamplesEnqueued,
      allSamplesEnqueuedCallback
    };
  })();
  const data = {
    track: void 0,
    tracks: void 0,
    processedSample: 0,
    flashCalled: false,
    /**
     * controller.desiredSizeを1msおきに監視するsetIntervalのID
     */
    interval: 0,
    /**
     * transformで返されているPromiseのresolve
     * これを実行することでデータ受信を再開する
     */
    resolve: null
  };
  const clearInterval = () => {
    if (DEV)
      console.log("demux: clearInterval", data.interval);
    if (data.interval) {
      globalThis.clearInterval(data.interval);
      data.interval = 0;
    }
  };
  return new TransformStream({
    start(controller) {
      mp4boxfile = (0, import_mp4box2.createFile)();
      mp4boxfile.onError = (e) => {
        controller.error(e);
        console.error("demux: mp4box error", e);
        mp4boxfile.flush();
        clearInterval();
      };
      mp4boxfile.onReady = (info) => {
        mp4boxfile.setExtractionOptions(trackId, null, { nbSamples: 1 });
        data.tracks = new Set(info.tracks.map((track) => track.id));
        data.track = info.tracks.find((track) => track.id === trackId);
        if (!data.track) {
          controller.error("No track found");
          return;
        }
        if (DEV)
          console.log("demux: onReady", info, data.track.nb_samples);
        mp4boxfile.start();
      };
      mp4boxfile.onSamples = (id, user, samples) => {
        if (!samples || samples.length === 0)
          return;
        if (DEV)
          console.log("demux: onSamples: desiredSize", controller.desiredSize);
        for (const sample of samples) {
          controller.enqueue(sample);
          data.processedSample = sample.number + 1;
          if (DEV)
            console.log("demux: onSamples: sample", sample.track_id, sample.number, data.track.nb_samples, sample.cts, sample.duration, sample.timescale, sample.is_sync, sample);
          if (data.flashCalled && data.processedSample >= data.track.nb_samples) {
            if (DEV)
              console.log("demux: onSamples: [terminate] last sample", sample.number, data.processedSample, data.track.nb_samples);
            ___.allSamplesEnqueuedCallback();
          }
        }
      };
      data.interval = globalThis.setInterval(() => {
        if (data.resolve && (controller.desiredSize ?? 0) >= 0) {
          if (DEV)
            console.log("demux: recieving chunk resolve!!");
          data.resolve();
          data.resolve = null;
        }
      }, 1);
    },
    async transform(chunk, controller) {
      try {
        if (chunk) {
          const buff = chunk.buffer;
          buff.fileStart = seek;
          mp4boxfile.appendBuffer(buff);
          seek += chunk.byteLength;
          if (DEV)
            console.log("demux: recieving chunk", chunk.byteLength, seek, controller.desiredSize);
          if (data.processedSample >= KEEP_SAMPLES_NUMBER) {
            const desiredNegative = Math.min(controller.desiredSize ?? 0, 0);
            const sampleNumber = Math.max(data.processedSample + desiredNegative - KEEP_SAMPLES_NUMBER, 0);
            if (DEV)
              console.log("demux: recieving chunk: release used samples", trackId, sampleNumber, data.processedSample, desiredNegative, KEEP_SAMPLES_NUMBER);
            mp4boxfile.releaseUsedSamples(trackId, sampleNumber);
          }
          for (const track of data.tracks ?? []) {
            const length = mp4boxfile.getTrackSamplesInfo(track).length;
            if (track !== trackId && length) {
              mp4boxfile.releaseUsedSamples(track, length);
            }
          }
        }
        if (!data.track?.nb_samples)
          return;
        return new Promise((resolve) => {
          if (data.resolve)
            data.resolve();
          data.resolve = resolve;
        });
      } catch (e) {
        console.error("demux: caught error", e);
        return Promise.resolve();
      }
    },
    async flush(controller) {
      if (DEV)
        console.log("demux: [terminate] file flush");
      data.flashCalled = true;
      if (data.processedSample >= data.track.nb_samples) {
        if (DEV)
          console.log("demux: [terminate] all samples already processed");
        ___.allSamplesEnqueuedCallback();
      } else {
        await ___.allSamplesEnqueuedPromise;
      }
      clearInterval();
      controller.terminate();
      mp4boxfile.flush();
      clearInterval();
    }
  }, {
    highWaterMark: 1
  });
};
var STABLE_FPSs = [
  9,
  15,
  23.94,
  24,
  25,
  29.97,
  30,
  59.94,
  60,
  119.88,
  120
];
function getStabilizedFps(srcFps) {
  const fps = Math.round(srcFps * 100) / 100;
  for (const stableFps of STABLE_FPSs) {
    if (fps <= stableFps)
      return stableFps;
  }
  return fps;
}
function getMP4Info(file, DEV = false) {
  let result = {};
  return new Promise((resolve, reject) => {
    const mp4boxfile = (0, import_mp4box2.createFile)();
    result.file = mp4boxfile;
    const reader = file.stream().getReader();
    let seek = 0;
    async function push() {
      const { done, value } = await reader.read();
      if (done) {
        return;
      }
      if (value) {
        const buff = value.buffer;
        buff.fileStart = seek;
        mp4boxfile.appendBuffer(buff);
        seek += value.byteLength;
      }
      return push();
    }
    mp4boxfile.onError = (e) => {
      reject(e);
      mp4boxfile.flush();
      reader.cancel();
    };
    mp4boxfile.onReady = (info) => {
      reader.cancel();
      result.info = info;
      if (info.videoTracks.length > 0) {
        result.videoInfo = info.videoTracks[0];
        if (result.videoInfo.edits && result.videoInfo.edits.length && result.videoInfo.edits[0].media_time) {
          result.fps = result.videoInfo.timescale / result.videoInfo.edits[0].media_time;
          result.defaultSampleDuration = result.videoInfo.edits[0].media_time;
        } else {
          result.defaultSampleDuration = result.videoInfo.duration / result.videoInfo.nb_samples;
          result.fps = result.videoInfo.duration ? result.videoInfo.timescale / result.defaultSampleDuration : 30;
        }
        result.fps = getStabilizedFps(result.fps);
        const trak = mp4boxfile.getTrackById(result.videoInfo.id);
        for (const entry of getDescriptionBoxEntriesFromTrak(trak)) {
          try {
            result.description = getDescriptionBuffer(entry);
          } catch (e) {
            if (DEV)
              console.error("getMP4Info: getDescriptionBuffer error", e);
          }
        }
      }
      resolve(result);
      mp4boxfile.flush();
    };
    push();
  });
}

// src/decode.ts
var DECODE_QUEUE_MAX = 32;
var DECODE_HWM = 16;
var generateSampleToEncodedVideoChunkTransformer = (DEV = false) => {
  return new TransformStream({
    start() {
    },
    transform(sample, controller) {
      try {
        const chunk = new EncodedVideoChunk({
          type: sample.is_sync ? "key" : "delta",
          timestamp: 1e6 * sample.cts / sample.timescale,
          duration: 1e6 * sample.duration / sample.timescale,
          data: sample.data
        });
        if (DEV)
          console.log("sample: transform from sample to EncodedVideoChunk", sample, chunk);
        controller.enqueue(chunk);
      } catch (e) {
        console.error("sample: caught error", e);
      }
    },
    flush(controller) {
      if (DEV)
        console.log("sample: [terminate] sample flush");
      controller.terminate();
    }
  });
};
async function generateVideoDecodeTransformer(videoInfo, description, orderConfig, sharedData, DEV = false) {
  let samplecnt = 0;
  let framecnt = 0;
  let decoder;
  const config = {
    codec: videoInfo.codec.startsWith("vp08") ? "vp8" : videoInfo.codec,
    hardwareAcceleration: "prefer-software",
    optimizeForLatency: false,
    ...orderConfig,
    codedHeight: videoInfo.video.height,
    codedWidth: videoInfo.video.width,
    description
  };
  if (DEV)
    console.log("decode: configure", config);
  await VideoDecoder.isConfigSupported(config);
  let allowWriteResolve = null;
  const emitResolve = () => {
    if (DEV)
      console.log("decode: emit resolve", allowWriteResolve);
    if (allowWriteResolve) {
      allowWriteResolve();
      allowWriteResolve = null;
    }
  };
  const allowWriteEval = () => samplecnt <= framecnt + DECODE_QUEUE_MAX;
  const keyFrames = /* @__PURE__ */ new Set();
  return new TransformStream({
    start(controller) {
      decoder = new VideoDecoder({
        output: (frame) => {
          if (frame) {
            try {
              if (DEV)
                console.log("decode: enqueue frame:", frame.timestamp, keyFrames.has(framecnt), framecnt, videoInfo.nb_samples, decoder.decodeQueueSize);
              framecnt++;
              controller.enqueue({
                frame,
                isKeyFrame: keyFrames.has(frame.timestamp)
              });
            } catch (e) {
              console.error("decode: enqueue frame: caught error", e);
            }
          } else {
            console.error("decode: enqueue frame: no frame output??");
          }
          if (allowWriteEval())
            emitResolve();
        },
        error: (e) => {
          console.error("decode: decoder error", e);
          controller.error(e);
        }
      });
      decoder.configure(config);
    },
    transform(vchunk, controller) {
      try {
        samplecnt++;
        if (vchunk.type === "key") {
          keyFrames.add(vchunk.timestamp);
        }
        if (DEV)
          console.log("decode: recieving vchunk:", samplecnt, framecnt, decoder.decodeQueueSize);
        if (decoder.state !== "configured") {
          console.error("decode: recieving vchunk: decoder state is strange", decoder.state);
          return Promise.resolve();
        } else {
          decoder.decode(vchunk);
        }
        emitResolve();
        if (allowWriteEval()) {
          if (DEV)
            console.log("decode: recieving vchunk: resolve immediate");
          return Promise.resolve();
        }
        if (DEV)
          console.log("decode: recieving vchunk: wait for allowWrite");
        return new Promise((resolve) => {
          allowWriteResolve = resolve;
        });
      } catch (e) {
        console.error("decode: caught error", e);
        return Promise.resolve();
      }
    },
    async flush(controller) {
      if (DEV)
        console.log("decode: [terminate] vchunk flush");
      return decoder.flush().then(() => {
        if (DEV)
          console.log("decode: [terminate] decoder flushed!!!", videoInfo.nb_samples, framecnt);
        sharedData.dropFramesOnDecoding = videoInfo.nb_samples - framecnt;
        controller.terminate();
      });
      controller.terminate();
    }
  }, {
    highWaterMark: DECODE_HWM
  });
}

// src/transform.ts
var TIMESTAMP_MARGINS = [0, -1, -2, -3, -4, -5, -6, -7, -8, -9, 1, 2, 3, 4, 5, 6, 7, 8, 9];
function generateVideoSortTransformer(videoInfo, sharedData, DEV = false) {
  let expectedNextTimestamp = 0;
  let prevTimestamp = 0;
  const cache = /* @__PURE__ */ new Map();
  let recievedcnt = 0;
  let enqueuecnt = 0;
  function dropByCache(timestamp) {
    cache.get(timestamp)?.frame.close();
    cache.delete(timestamp);
    sharedData.dropFrames++;
  }
  function enqueue(f, controller) {
    enqueuecnt++;
    const prefferedDuration = f.frame.timestamp - prevTimestamp;
    if (DEV)
      console.log("sort: enqueue: prefferedDuration", enqueuecnt, prefferedDuration, prevTimestamp, f.frame.timestamp, f.frame.duration, f.frame);
    prevTimestamp = f.frame.timestamp;
    if (f.frame.duration !== prefferedDuration) {
      const frame = new VideoFrame(f.frame, {
        timestamp: f.frame.timestamp,
        duration: prefferedDuration,
        visibleRect: f.frame.visibleRect ?? void 0
      });
      f.frame.close();
      controller.enqueue({
        frame,
        isKeyFrame: f.isKeyFrame
      });
    } else {
      controller.enqueue(f);
    }
  }
  function enqueueByCache(timestamp, controller) {
    const frame = cache.get(timestamp);
    enqueue(frame, controller);
    cache.delete(timestamp);
  }
  function send(controller, incoming, _timestamps) {
    if (DEV)
      console.log("sort: send: trying to send", expectedNextTimestamp, incoming, cache.keys());
    const timestamps = _timestamps ?? /* @__PURE__ */ new Set();
    cache.set(incoming.frame.timestamp, incoming);
    for (const margin of TIMESTAMP_MARGINS) {
      const timestamp = expectedNextTimestamp + margin;
      if (incoming?.frame.timestamp === timestamp) {
        timestamps.add(incoming.frame.timestamp);
        expectedNextTimestamp = timestamp + (incoming.frame.duration ?? 0);
        break;
      }
      if (cache.size && cache.has(timestamp)) {
        timestamps.add(timestamp);
        const frame = cache.get(timestamp);
        if (frame.frame.duration) {
          expectedNextTimestamp = timestamp + frame.frame.duration;
          send(controller, frame, timestamps);
          return;
        }
      }
    }
    if (timestamps.size > 0) {
      if (DEV)
        console.log("sort: send: enqueue buffer", timestamps, timestamps.size);
      for (const frame of timestamps) {
        enqueueByCache(frame, controller);
        if (DEV)
          console.log("sort: send: enqueue buffer: sending frame", frame, recievedcnt, enqueuecnt, cache.size);
      }
      return;
    } else {
      if (DEV)
        console.log("sort: send: no frame to enqueue");
    }
  }
  return new TransformStream({
    start() {
    },
    transform(frame, controller) {
      try {
        recievedcnt++;
        if (DEV)
          console.log("sort: recieving frame", frame.frame.timestamp, recievedcnt, videoInfo.nb_samples, enqueuecnt, sharedData, cache.size);
        if (cache.has(frame.frame.timestamp)) {
          console.error("sort: recieving frame: timestamp duplicated", frame.frame.timestamp);
          dropByCache(frame.frame.timestamp);
        }
        if (frame.frame.timestamp < expectedNextTimestamp) {
          console.error("sort: recieving frame: drop frame", frame.frame.timestamp, expectedNextTimestamp);
          frame.frame.close();
          return;
        }
        if (cache.size >= 13) {
          console.error("sort: recieving frame: cache is too large", frame.frame.timestamp, expectedNextTimestamp, Array.from(cache.keys()));
          for (const timestamp of cache.keys()) {
            if (timestamp < expectedNextTimestamp) {
              dropByCache(timestamp);
            }
          }
          expectedNextTimestamp = Math.min(...cache.keys());
          if (!("startTimeShift" in sharedData)) {
            sharedData.startTimeShift = expectedNextTimestamp;
          }
          if (DEV)
            console.log("sort: recieving frame: cache is too large (cache and expectedNextTimestamp fixed)", Array.from(cache.keys()), expectedNextTimestamp);
        }
        send(controller, frame);
      } catch (e) {
        console.error("sort: recieving frame: caught error", e);
      }
    },
    flush(controller) {
      if (DEV)
        console.log("sort: [terminate] frame flush");
      const stamps = Array.from(cache.keys()).sort((a, b) => a - b);
      if (DEV)
        console.log("sort: recieving frame: last frame:", stamps);
      for (const timestamp of stamps) {
        if (timestamp < expectedNextTimestamp) {
          if (DEV)
            console.error("sort: recieving frame: last framee: drop frame", timestamp, expectedNextTimestamp, enqueuecnt);
          dropByCache(timestamp);
        } else {
          const f = cache.get(timestamp);
          expectedNextTimestamp = timestamp + (f.frame.duration ?? 0);
          if (DEV)
            console.log("sort: recieving frame: last frame: enqueue", timestamp, expectedNextTimestamp, enqueuecnt);
          enqueue(f, controller);
          cache.delete(timestamp);
        }
      }
      if (DEV)
        console.log("sort: recieving frame: [terminate]", enqueuecnt, sharedData, sharedData.getResultSamples());
      controller.terminate();
    }
  }, {
    highWaterMark: 16
  });
}
function floorWithSignificance(value, significance) {
  return Math.floor(value / significance) * significance;
}
function generateResizeTransformer(config, DEV = false) {
  let framecnt = 0;
  return new TransformStream({
    start() {
    },
    async transform(srcFrame, controller) {
      try {
        framecnt++;
        if (DEV) {
          performance.mark("resize start");
          console.log("resize: recieved", framecnt, srcFrame);
        }
        const canvas = await readAndCompressImage(srcFrame.frame, {
          ...config,
          mimeType: null
        });
        srcFrame.frame.close();
        const dstFrame = new VideoFrame(canvas, {
          timestamp: srcFrame.frame.timestamp,
          duration: srcFrame.frame.duration ?? void 0
        });
        if (DEV) {
          performance.mark("resize end");
          console.log("resize: transform", framecnt, performance.measure("resize", "resize start").duration, dstFrame);
        }
        controller.enqueue({ frame: dstFrame, isKeyFrame: srcFrame.isKeyFrame });
      } catch (e) {
        console.error("resize: caught error", e);
      }
    },
    flush(controller) {
      if (DEV)
        console.log("resize: [terminate] flush");
      controller.terminate();
    }
  });
}

// src/encode.ts
var ENCODE_QUEUE_MAX = 32;
function validateVideoKeyFrameConfig(config) {
  if (!config)
    return;
  if (config.type === "microseconds") {
    if (config.interval < 0)
      throw new Error("videoKeyframeConfig.interval must be positive");
  }
}
function generateVideoEncoderTransformStream(config, videoKeyframeConfig, DEV = false) {
  let encoder;
  let framecnt = 0;
  let enqueuecnt = 0;
  let prevKeyFrameNumber = 0;
  validateVideoKeyFrameConfig(videoKeyframeConfig);
  let allowWriteResolve = null;
  const emitResolve = () => {
    if (DEV)
      console.log("encode: emit resolve", allowWriteResolve);
    if (allowWriteResolve) {
      allowWriteResolve();
      allowWriteResolve = null;
    }
  };
  const allowWriteEval = () => framecnt <= enqueuecnt + ENCODE_QUEUE_MAX;
  return new TransformStream({
    start(controller) {
      encoder = new VideoEncoder({
        output: (chunk, metadata) => {
          enqueuecnt++;
          if (metadata && Object.keys(metadata).length) {
            controller.enqueue({ type: "metadata", data: metadata });
            if (DEV) {
              console.log(
                "encode: encoded: metadata",
                metadata,
                Array.from(new Uint8Array(metadata.decoderConfig?.description ?? new ArrayBuffer(0))).map((n) => n.toString(16).padStart(2, "0")).join(" ")
              );
            }
          }
          controller.enqueue({ type: "encodedVideoChunk", data: chunk });
          if (DEV)
            console.log("encode: encoded", chunk.timestamp, enqueuecnt - 1, framecnt, chunk, encoder.encodeQueueSize, metadata);
          if (allowWriteEval())
            emitResolve();
        },
        error: (error) => {
          console.error("encode: encoder error", error);
          controller.error(error);
        }
      });
      try {
        encoder.configure(config);
      } catch (e) {
        console.error("encoder configure error", e);
        controller.error(e);
      }
    },
    async transform(frame, controller) {
      try {
        framecnt++;
        const keyFrame = (() => {
          if (DEV)
            console.log("encode: keyframe decision:", framecnt, frame.frame.timestamp, videoKeyframeConfig);
          if (framecnt === 1)
            return true;
          if (!videoKeyframeConfig) {
            return frame.isKeyFrame;
          }
          if (videoKeyframeConfig.type === "microseconds") {
            if (videoKeyframeConfig.interval === 0)
              return frame.isKeyFrame;
            if (frame.frame.timestamp - prevKeyFrameNumber >= videoKeyframeConfig.interval) {
              if (DEV)
                console.log("encode: keyframe decision: microseconds true:", framecnt, frame.frame.timestamp, prevKeyFrameNumber, videoKeyframeConfig.interval);
              prevKeyFrameNumber = frame.frame.timestamp;
              return true;
            }
            return false;
          }
          return frame.isKeyFrame;
        })();
        if (DEV)
          console.log("encode: frame:", framecnt, frame, keyFrame, encoder.encodeQueueSize);
        encoder.encode(frame.frame, {
          keyFrame
        });
        frame.frame.close();
        emitResolve();
        if (allowWriteEval()) {
          if (DEV)
            console.log("encode: recieving vchunk: resolve immediate");
          return Promise.resolve();
        }
        if (DEV)
          console.log("encode: recieving vchunk: wait for allowWrite");
        return new Promise((resolve) => {
          allowWriteResolve = resolve;
        });
      } catch (e) {
        console.error("encode: caught error", e);
        return Promise.resolve();
      }
    },
    async flush(controller) {
      if (DEV)
        console.log("encode: [terminate] flush", framecnt, enqueuecnt);
      return encoder.flush().then(() => {
        if (DEV)
          console.log("encode: [terminate] done", framecnt, enqueuecnt);
        controller.terminate();
      });
      controller.terminate();
    }
  });
}

// src/mux.ts
var import_mp4box4 = __toESM(require_mp4box_all());

// src/specs/av1C.ts
var import_mp4box3 = __toESM(require_mp4box_all());
function av1CDescription(codec, configOBUs = new Uint8Array(0)) {
  if (!codec.startsWith("av01."))
    throw new Error(`codec ${codec} is not supported`);
  const [
    /* av01 */
    ,
    profile,
    levelAndTier,
    bits,
    monochrome,
    chromaSubsampling
  ] = codec.split(".");
  const stream = new import_mp4box3.DataStream();
  stream.endianness = import_mp4box3.DataStream.BIG_ENDIAN;
  stream.writeUint8(129);
  stream.writeUint8(
    (parseInt(profile) << 5) + // profile
    parseInt(levelAndTier.slice(0, -1))
    // level
  );
  stream.writeUint8(
    ((levelAndTier.slice(0, -1) === "M" ? 0 : 1) << 7) + // seq_tier_0
    ((parseInt(bits) > 8 ? 1 : 0) << 6) + // high_bitdepth
    ((parseInt(bits) === 12 ? 1 : 0) << 5) + // twelve_bit
    (parseInt(monochrome) << 4) + // monochrome
    (parseInt((chromaSubsampling ?? "110").slice(0, 2), 2) << 2) + // chroma_subsampling_x/y
    0
    // chroma_sample_position(TODO?)
  );
  stream.writeUint8(0);
  stream.writeUint8Array(configOBUs);
  return stream.buffer;
}
import_mp4box3.BoxParser.av1CBox.prototype.write = function(stream) {
  this.size = 4 + (this.configOBUs?.byteLength ?? 0);
  this.writeHeader(stream);
  stream.writeUint8((1 << 7) + this.version);
  stream.writeUint8((this.seq_profile << 5) + this.seq_level_idx_0);
  stream.writeUint8(
    (this.seq_tier_0 << 7) + (this.high_bitdepth << 6) + (this.twelve_bit << 5) + (this.monochrome << 4) + (this.chroma_subsampling_x << 3) + (this.chroma_subsampling_y << 2) + this.chroma_sample_position
  );
  stream.writeUint8(
    (this.reserved_1 << 5) + (this.initial_presentation_delay_present << 4) + this.initial_presentation_delay_present ? this.initial_presentation_delay_minus_one : this.reserved_2
  );
  stream.writeUint8Array(this.configOBUs);
};

// src/mux.ts
function copyEdits(tragetTrak, srcInfo) {
  if (srcInfo.edits) {
    const edts = tragetTrak.add("edts");
    const elst = edts.add("elst");
    srcInfo.edits.forEach((editEntry) => {
      elst.addEntry(editEntry);
    });
  }
}
function getAv1CBox(codec, DEV = false) {
  const buffer = av1CDescription(codec);
  const av1CBox = new import_mp4box4.BoxParser.av1CBox(buffer.byteLength);
  av1CBox.parse(new import_mp4box4.MP4BoxStream(buffer));
  if (DEV)
    console.log("write: metadata: getAv1CBox", codec, buffer, av1CBox);
  return av1CBox;
}
function writeEncodedVideoChunksToMP4File(file, encoderConfig, videoInfo, sharedData, trackAddedCallback, promiseToStartChunks, DEV = false) {
  let trackId;
  let trak;
  let samplecnt = 0;
  let nextDtsTime = 0;
  return new TransformStream({
    start() {
    },
    async transform(data, controller) {
      try {
        if (data.type === "metadata" && !trak) {
          const media_duration = videoInfo.duration;
          trackId = file.addTrack({
            name: "VideoHandle",
            type: encoderConfig.codec.split(".")[0],
            timescale: videoInfo.timescale,
            duration: media_duration,
            media_duration,
            language: videoInfo.language,
            width: encoderConfig.width,
            height: encoderConfig.height,
            ...encoderConfig.codec.startsWith("avc") ? {
              avcDecoderConfigRecord: data.data.decoderConfig?.description
            } : encoderConfig.codec.startsWith("hevc") ? {
              hevcDecoderConfigRecord: data.data.decoderConfig?.description
            } : encoderConfig.codec.startsWith("av01") ? {
              description: getAv1CBox(data.data.decoderConfig?.codec ?? encoderConfig.codec, DEV)
            } : {}
          });
          trak = file.getTrackById(trackId);
          if (trak.tkhd) {
            trak.tkhd.set("matrix", videoInfo.matrix);
          }
          copyEdits(trak, videoInfo);
          file.setSegmentOptions(trackId, null, { nbSamples: sharedData.getResultSamples() });
          if (DEV)
            console.log("write: addTrack", trackId, trak, videoInfo.timescale);
          trackAddedCallback(trackId);
          await promiseToStartChunks;
          return;
        } else if (data.type === "encodedVideoChunk") {
          samplecnt++;
          const chunk = data.data;
          const b = new ArrayBuffer(chunk.byteLength);
          chunk.copyTo(b);
          const times = {
            cts: Math.round(chunk.timestamp * videoInfo.timescale / 1e6),
            dts: Math.round(nextDtsTime * videoInfo.timescale / 1e6),
            duration: Math.round((chunk.duration ?? 1) * videoInfo.timescale / 1e6)
          };
          const sample = file.addSample(trackId, b, {
            ...times,
            is_sync: chunk.type === "key"
          });
          if (DEV)
            console.log("write: addSample", samplecnt, times, sample);
          controller.enqueue(sample);
          nextDtsTime += chunk.duration ?? 1;
        }
      } catch (e) {
        console.error("write: caught error", e);
      }
    },
    flush(controller) {
      if (DEV)
        console.log("write: flush", file);
      controller.terminate();
    }
  });
}
function samplesToMp4FileWritable(file, trackId, srcInfo, sampleOptions = {}, DEV = false) {
  const trak = file.getTrackById(trackId);
  copyEdits(trak, srcInfo);
  file.setSegmentOptions(trackId, null, { nbSamples: srcInfo.nb_samples });
  if (DEV)
    console.log("write samples to file: addTrack", `#${trackId}`, trak, srcInfo.nb_samples);
  let samplecnt = 0;
  return new WritableStream({
    start() {
    },
    write(sample) {
      samplecnt++;
      const res = file.addSample(trackId, sample.data, {
        duration: sample.duration,
        cts: sample.cts,
        dts: sample.dts,
        is_sync: sample.is_sync,
        is_leading: sample.is_leading,
        depends_on: sample.depends_on,
        is_depended_on: sample.is_depended_on,
        has_redundancy: sample.has_redundancy,
        degradation_priority: sample.degradation_priority,
        subsamples: sample.subsamples,
        ...sampleOptions
      });
      if (DEV)
        console.log("write samples to file: addSample", `#${trackId}`, samplecnt, sample, res);
    },
    close() {
      if (DEV)
        console.log("write samples to file: close", `#${trackId}`, file);
    }
  });
}
function writeVideoSamplesToMP4File(file, videoInfo, videoTrak, DEV = false) {
  const entiries = getDescriptionBoxEntriesFromTrak(videoTrak);
  const description = entiries.reduce((acc, entry) => {
    if (acc)
      return acc;
    if (entry.type?.startsWith("avc") && "av1C" in entry) {
      return entry.av1C;
    } else if (entry.type === "hvc1" && "hvcC" in entry) {
      return entry.hvcC;
    } else if (entry.type === "hev1" && "hvcC" in entry) {
      return entry.hvcC;
    } else if (entry.type?.startsWith("vp") && "vpcC" in entry) {
      return entry.vpcC;
    } else if (entry.type === "av01" && "av1C" in entry) {
      return entry.av1C;
    }
    return void 0;
  }, void 0);
  const trackId = file.addTrack({
    name: "VideoHandle",
    type: videoInfo.codec.split(".")[0],
    timescale: videoInfo.timescale,
    //duration: videoInfo.duration,
    //media_duration: videoInfo.duration,
    // duration must be 0 for fragmented mp4
    duration: 0,
    media_duration: 0,
    language: videoInfo.language,
    width: videoInfo.video.width,
    height: videoInfo.video.height,
    description
  });
  return {
    writable: samplesToMp4FileWritable(file, trackId, videoInfo, {}, DEV),
    trackId
  };
}
function writeAudioSamplesToMP4File(file, audioInfo, audioTrak, DEV = false) {
  const entiries = getDescriptionBoxEntriesFromTrak(audioTrak);
  const description = entiries.reduce((acc, entry) => {
    if (acc)
      return acc;
    if (entry.type === "mp4a" && "esds" in entry) {
      return entry.esds;
    }
    return void 0;
  }, void 0);
  const trackId = file.addTrack({
    type: audioInfo.codec.split(".")[0],
    hdlr: "soun",
    name: "SoundHandle",
    timescale: audioInfo.timescale,
    //duration: audioInfo.duration,
    //media_duration: audioInfo.duration,
    // duration must be 0 for fragmented mp4
    duration: 0,
    media_duration: 0,
    language: audioInfo.language,
    width: 0,
    height: 0,
    channel_count: audioInfo.audio.channel_count,
    samplerate: audioInfo.audio.sample_rate,
    samplesize: audioInfo.audio.sample_size,
    description
  });
  return {
    writable: samplesToMp4FileWritable(file, trackId, audioInfo, {}, DEV),
    trackId
  };
}

// src/specs/avc1.ts
var avc1ProfileToProfileIdTable = {
  "constrained_baseline": "4240",
  "baseline": "4200",
  "extended": "5800",
  "constrained_main": "4d40",
  "main": "4d00",
  "constrained_high": "640c",
  "high": "6400",
  "high_progressive": "6408",
  /**
   * 10bit and 422/444 are not supported by JS Canvas,
   * so the following definitions are not used in this application,
   * but may be useful for something else.
   */
  "high_10": "6e00",
  "high_10_intra": "6e10",
  "high_422": "7a00",
  "high_422_intra": "7a10",
  "high_444_predictive": "f400",
  "high_444_intra": "f410",
  "cavlc_444_intra": "2c00"
};
var Avc1ProfileIdcToFactor = class {
  constructor(profileIdc, cpbBrVclFactor, cpbBrNalFactor) {
    this.profileIdc = profileIdc;
    this.cpbBrVclFactor = cpbBrVclFactor;
    this.cpbBrNalFactor = cpbBrNalFactor;
  }
};
var avc1ProfileIdcToFactorTable = [
  new Avc1ProfileIdcToFactor(66, 1e3, 1200),
  new Avc1ProfileIdcToFactor(77, 1e3, 1200),
  new Avc1ProfileIdcToFactor(88, 1e3, 1200),
  new Avc1ProfileIdcToFactor(100, 1250, 1500),
  new Avc1ProfileIdcToFactor(110, 3e3, 3600),
  new Avc1ProfileIdcToFactor(122, 4e3, 4800),
  new Avc1ProfileIdcToFactor(244, 4e3, 4800),
  new Avc1ProfileIdcToFactor(44, 4e3, 4800)
];
function avc1GetProfileToNalFactor(profile) {
  const targetProfileIdc = parseInt(avc1ProfileToProfileIdTable[profile].substring(0, 2), 16);
  const factor = avc1ProfileIdcToFactorTable.find(({ profileIdc }) => profileIdc === targetProfileIdc);
  if (!factor)
    throw new Error(`profile ${profile} is not supported`);
  return factor.cpbBrNalFactor;
}
var Avc1LevelLimit = class {
  constructor(name, levelIdc, cs3fFlag, maxMBPS, maxFS, maxDpbMbs, maxBR, maxCPB, maxVmvR, minCR, maxMvsPer2Mb) {
    this.name = name;
    this.levelIdc = levelIdc;
    this.cs3fFlag = cs3fFlag;
    this.maxMBPS = maxMBPS;
    this.maxFS = maxFS;
    this.maxDpbMbs = maxDpbMbs;
    this.maxBR = maxBR;
    this.maxCPB = maxCPB;
    this.maxVmvR = maxVmvR;
    this.minCR = minCR;
    this.maxMvsPer2Mb = maxMvsPer2Mb;
  }
};
var avc1LevelLimitsTable = [
  //                   Name, idc, cs3f,MxMBPS,  MaxFS, DpbMbs,  MaxBR, MaxCPB, VmvR,CR, Mvs/2Mb]
  new Avc1LevelLimit("1", 10, 0, 1485, 99, 396, 64, 175, 64, 2, 0),
  //new Avc1LevelLimit("1b",  11, 1,     1485,     99,    396,    128,    350,   64, 2,  0),
  new Avc1LevelLimit("1b", 9, 0, 1485, 99, 396, 128, 350, 64, 2, 0),
  new Avc1LevelLimit("1.1", 11, 0, 3e3, 396, 900, 192, 500, 128, 2, 0),
  new Avc1LevelLimit("1.2", 12, 0, 6e3, 396, 2376, 384, 1e3, 128, 2, 0),
  new Avc1LevelLimit("1.3", 13, 0, 11880, 396, 2376, 768, 2e3, 128, 2, 0),
  new Avc1LevelLimit("2", 20, 0, 11880, 396, 2376, 2e3, 2e3, 128, 2, 0),
  new Avc1LevelLimit("2.1", 21, 0, 19800, 792, 4752, 4e3, 4e3, 256, 2, 0),
  new Avc1LevelLimit("2.2", 22, 0, 20250, 1620, 8100, 4e3, 4e3, 256, 2, 0),
  new Avc1LevelLimit("3", 30, 0, 40500, 1620, 8100, 1e4, 1e4, 256, 2, 32),
  new Avc1LevelLimit("3.1", 31, 0, 108e3, 3600, 18e3, 14e3, 14e3, 512, 4, 16),
  new Avc1LevelLimit("3.2", 32, 0, 216e3, 5120, 20480, 2e4, 2e4, 512, 4, 16),
  new Avc1LevelLimit("4", 40, 0, 245760, 8192, 32768, 2e4, 25e3, 512, 4, 16),
  new Avc1LevelLimit("4.1", 41, 0, 245760, 8192, 32768, 5e4, 62500, 512, 2, 16),
  new Avc1LevelLimit("4.2", 42, 0, 522240, 8704, 34816, 5e4, 62500, 512, 2, 16),
  new Avc1LevelLimit("5", 50, 0, 589824, 22080, 110400, 135e3, 135e3, 512, 2, 16),
  new Avc1LevelLimit("5.1", 51, 0, 983040, 36864, 184320, 24e4, 24e4, 512, 2, 16),
  new Avc1LevelLimit("5.2", 52, 0, 2073600, 36864, 184320, 24e4, 24e4, 512, 2, 16),
  new Avc1LevelLimit("6", 60, 0, 4177920, 139264, 696320, 24e4, 24e4, 8192, 2, 16),
  new Avc1LevelLimit("6.1", 61, 0, 8355840, 139264, 696320, 48e4, 48e4, 8192, 2, 16),
  new Avc1LevelLimit("6.2", 62, 0, 16711680, 139264, 696320, 8e5, 8e5, 8192, 2, 16)
];
function avc1GuessLevelIdcFromInformations({ profile, width, height, fps, prefferedAllowingMaxBitrate, maxDecFrameBuffering }, DEV = false) {
  const profileIdc = avc1ProfileToProfileIdTable[profile];
  if (!profileIdc) {
    throw new Error(`avc1 guess lv: profile ${profile} is not supported`);
  }
  if (!Math.max(width, 0) || !Math.max(height, 0) || !Math.max(fps, 0)) {
    throw new Error("avc1 guess lv: width, heighta and fps must be positive number");
  }
  const acceptCs3f = profileIdc.startsWith("42") || profileIdc.startsWith("4d") || profileIdc.startsWith("58");
  const factor = avc1GetProfileToNalFactor(profile);
  const widthMBs = Math.ceil(width / 16);
  const heightMBs = Math.ceil(height / 16);
  const whMBs = widthMBs * heightMBs;
  const whMBPS = whMBs * fps;
  const whDpbMbs = whMBs * (maxDecFrameBuffering ?? 0);
  const wwMBs = widthMBs ** 2;
  const hhMBs = heightMBs ** 2;
  let antiprefferedLevelIdc = void 0;
  for (let i2 = 0; i2 < avc1LevelLimitsTable.length; i2++) {
    const level = avc1LevelLimitsTable[i2];
    if (level.cs3fFlag && !acceptCs3f)
      continue;
    if (whMBs > level.maxFS)
      continue;
    if (wwMBs > 8 * level.maxFS)
      continue;
    if (hhMBs > 8 * level.maxFS)
      continue;
    if (whMBPS > level.maxMBPS)
      continue;
    if (maxDecFrameBuffering) {
      if (whDpbMbs > level.maxDpbMbs)
        continue;
    }
    if (DEV)
      console.log("avc1 guess lv: level choosing: bitrate", level.name, (prefferedAllowingMaxBitrate ?? 0) / 1e3, level.maxBR, factor, level.maxBR * factor / 1e3);
    if (prefferedAllowingMaxBitrate && prefferedAllowingMaxBitrate > level.maxBR * factor) {
      antiprefferedLevelIdc = level.levelIdc;
      continue;
    }
    if (DEV)
      console.log("avc1 guess lv: level choosing: level chosen", level.name, level.levelIdc);
    return level.levelIdc;
  }
  if (antiprefferedLevelIdc) {
    if (DEV)
      console.log("avc1 guess lv: level choosing: anti-preffered level chosen", antiprefferedLevelIdc);
    return antiprefferedLevelIdc;
  }
  throw new Error(`avc1 guess lv: suitable level is not found`);
}
function avc1LevelId(levelx10) {
  return levelx10.toString(16).padStart(2, "0");
}
function avc1PL(profile, levelx10) {
  return `avc1.${avc1ProfileToProfileIdTable[profile]}${avc1LevelId(levelx10)}`;
}
function avc1PLFromVideoInfo(videoInfo, DEV = false) {
  return avc1PL(videoInfo.profile, avc1GuessLevelIdcFromInformations(videoInfo, DEV));
}

// src/specs/av01.ts
var av01ProfileToProfileIdTable = {
  "Main": 0,
  "High": 1,
  "Professional": 2
};
var av01ChromaSubsamplingTable = {
  "4:0:0": "111",
  "4:2:0": "110",
  "4:2:2": "100",
  "4:4:4": "000"
};
var av01ColorPrimariesTable = {
  BT_709: 1,
  UNSPECIFIED: 2,
  // RESERVED?: 3,
  BT_470_M: 4,
  BT_470_B_G: 5,
  BT_601: 6,
  SMPTE_240: 7,
  GENERIC_FILM: 8,
  BT_2020: 9,
  XYZ: 10,
  SMPTE_431: 11,
  SMPTE_432: 12,
  EBU_3213: 22
};
var av01TransferCharacteristicsTable = {
  RESERVED_0: 0,
  BT_709: 1,
  UNSPECIFIED: 2,
  RESERVED_3: 3,
  BT_470_M: 4,
  BT_470_B_G: 5,
  BT_601: 6,
  SMPTE_240: 7,
  LINEAR: 8,
  LOG_100: 9,
  LOG_100_SQRT10: 10,
  IEC_61966: 11,
  BT_1361: 12,
  SRGB: 13,
  BT_2020_10_BIT: 14,
  BT_2020_12_BIT: 15,
  SMPTE_2084: 16,
  SMPTE_428: 17,
  HLG: 18
};
var av01MatrixCoefficientsTable = {
  IDENTITY: 0,
  BT_709: 1,
  UNSPECIFIED: 2,
  RESERVED_3: 3,
  FCC: 4,
  BT_470_B_G: 5,
  BT_601: 6,
  SMPTE_240: 7,
  SMPTE_YCGCO: 8,
  BT_2020_NCL: 9,
  BT_2020_CL: 10,
  SMPTE_2085: 11,
  CHROMAT_NCL: 12,
  CHROMAT_CL: 13,
  ICTCP: 14
};
var VOID = void 0;
var Av01LevelLimit = class {
  constructor(name, levelIdx, maxPicSize, maxHSize, maxVSize, maxDisplayRate, maxDecodeRate, maxHeaderRate, mainMbps, highMbps, mainCR, highCR, maxTiles, maxTileCols) {
    this.name = name;
    this.levelIdx = levelIdx;
    this.maxPicSize = maxPicSize;
    this.maxHSize = maxHSize;
    this.maxVSize = maxVSize;
    this.maxDisplayRate = maxDisplayRate;
    this.maxDecodeRate = maxDecodeRate;
    this.maxHeaderRate = maxHeaderRate;
    this.mainMbps = mainMbps;
    this.highMbps = highMbps;
    this.mainCR = mainCR;
    this.highCR = highCR;
    this.maxTiles = maxTiles;
    this.maxTileCols = maxTileCols;
  }
};
var av01LevelLimitTable = [
  //                 name levelIdx maxPicSize maxH maxV  maxDisplayR  maxDecodeR maxHeaderR mainbr highbr mainCR highCR maxTiles maxTileCols
  new Av01LevelLimit("2.0", 0, 147456, 2048, 1152, 4423680, 5529600, 150, 1.5, VOID, 2, VOID, 8, 4),
  new Av01LevelLimit("2.1", 1, 278784, 2816, 1584, 8363520, 10454400, 150, 3, VOID, 2, VOID, 8, 4),
  new Av01LevelLimit("3.0", 4, 665856, 4352, 2448, 19975680, 24969600, 150, 6, VOID, 2, VOID, 16, 6),
  new Av01LevelLimit("3.1", 5, 1065024, 5504, 3096, 31950720, 39938400, 150, 10, VOID, 2, VOID, 16, 6),
  new Av01LevelLimit("4.0", 8, 2359296, 6144, 3456, 70778880, 77856768, 300, 12, 30, 4, 4, 32, 8),
  new Av01LevelLimit("4.1", 9, 2359296, 6144, 3456, 141557760, 155713536, 300, 20, 50, 4, 4, 32, 8),
  new Av01LevelLimit("5.0", 12, 8912896, 8192, 4352, 267386880, 273715200, 300, 30, 100, 6, 4, 64, 8),
  new Av01LevelLimit("5.1", 13, 8912896, 8192, 4352, 534773760, 547430400, 300, 40, 160, 8, 4, 64, 8),
  new Av01LevelLimit("5.2", 14, 8912896, 8192, 4352, 1069547520, 1094860800, 300, 60, 240, 8, 4, 64, 8),
  new Av01LevelLimit("5.3", 15, 8912896, 8192, 4352, 1069547520, 1176502272, 300, 60, 240, 8, 4, 64, 8),
  new Av01LevelLimit("6.0", 16, 35651584, 16384, 8704, 1069547520, 1176502272, 300, 60, 240, 8, 4, 128, 16),
  new Av01LevelLimit("6.1", 17, 35651584, 16384, 8704, 2139095040, 2189721600, 300, 100, 480, 8, 4, 128, 16),
  new Av01LevelLimit("6.2", 18, 35651584, 16384, 8704, 4278190080, 4379443200, 300, 160, 800, 8, 4, 128, 16),
  new Av01LevelLimit("6.3", 19, 35651584, 16384, 8704, 4278190080, 4706009088, 300, 160, 800, 8, 4, 128, 16)
];
function av01GuessLevelFromInformations({ profile, width, height, tiles, tileCols, fps, prefferedAllowingMaxBitrate }, DEV = false) {
  let maxBrMbps = VOID;
  let antiprefferedLevel = void 0;
  const picSize = width * height;
  const displayRate = picSize * fps;
  for (let i2 = 0; i2 < av01LevelLimitTable.length; i2++) {
    const level = av01LevelLimitTable[i2];
    if (picSize > level.maxPicSize)
      continue;
    if (width > level.maxHSize)
      continue;
    if (height > level.maxVSize)
      continue;
    if (displayRate > level.maxDisplayRate)
      continue;
    maxBrMbps = profile === "Main" ? level.mainMbps : level.highMbps;
    if (maxBrMbps === VOID)
      continue;
    if (prefferedAllowingMaxBitrate) {
      if (DEV)
        console.log(`av01 guess lv: maxBrMbps: ${maxBrMbps}Mbps, prefferedAllowingMaxBitrate: ${prefferedAllowingMaxBitrate / 1e6}Mbps`);
      if (prefferedAllowingMaxBitrate > 1e6 * maxBrMbps) {
        antiprefferedLevel = level;
        continue;
      }
      ;
    }
    if (tiles ?? 0 > level.maxTiles)
      continue;
    if (tileCols ?? 0 > level.maxTileCols)
      continue;
    return level;
  }
  if (antiprefferedLevel) {
    if (DEV)
      console.log("av01 guess lv: level choosing: anti-preffered level chosen", antiprefferedLevel);
    return antiprefferedLevel;
  }
  throw new Error(`av01 guess lv: suitable level is not found`);
}
function av01CorrectSeqTier(requestedSeqTier, levelIdx) {
  return levelIdx > 7 ? requestedSeqTier : "M";
}
var av01VideoAdditionalInfoToBuildCodecsParameterStringDefaults = {
  monoChrome: false,
  chromaSubsampling: "4:2:0",
  colorPrimary: "BT_709",
  transferCharacteristics: "BT_709",
  matrixCoefficients: "BT_709",
  videoFullRange: false
};
function numPad(num, length) {
  return num.toString().padStart(length, "0");
}
function av01PL(levelInfo, depth = 8, seqTier = "M", additional, DEV = false) {
  const level = av01GuessLevelFromInformations(levelInfo, DEV);
  const basic = `av01.${av01ProfileToProfileIdTable[levelInfo.profile]}.${numPad(level.levelIdx, 2)}${av01CorrectSeqTier(seqTier, level.levelIdx)}.${depth.toString().padStart(2, "0")}`;
  if (additional) {
    return [
      basic,
      additional.monoChrome ? "1" : "0",
      av01ChromaSubsamplingTable[additional.chromaSubsampling],
      numPad(av01ColorPrimariesTable[additional.colorPrimary], 2),
      numPad(av01TransferCharacteristicsTable[additional.transferCharacteristics], 2),
      numPad(av01MatrixCoefficientsTable[additional.matrixCoefficients], 2),
      additional.videoFullRange ? "1" : "0"
    ].join(".");
  }
  return basic;
}

// src/specs/mfra.ts
var import_mp4box5 = __toESM(require_mp4box_all());
function getMfraStream({
  startPositionMap,
  fileSize
}) {
  const mfraStream = new import_mp4box5.DataStream();
  mfraStream.endianness = import_mp4box5.DataStream.BIG_ENDIAN;
  mfraStream.writeUint32(0);
  mfraStream.writeString("mfra", null, 4);
  for (const [trackId, pos] of startPositionMap) {
    mfraStream.writeUint32(43);
    mfraStream.writeString("tfra", null, 4);
    mfraStream.writeUint8(1);
    mfraStream.writeUint24(0);
    mfraStream.writeUint32(trackId);
    mfraStream.writeUint32(0);
    mfraStream.writeUint32(1);
    mfraStream.writeUint64(0);
    mfraStream.writeUint64(pos);
    mfraStream.writeUint8(1);
    mfraStream.writeUint8(1);
    mfraStream.writeUint8(1);
  }
  mfraStream.writeUint32(16);
  mfraStream.writeString("mfro", null, 4);
  mfraStream.writeUint8(0);
  mfraStream.writeUint24(0);
  const mfraSize = mfraStream.getPosition() + 4;
  mfraStream.writeUint32(mfraSize);
  mfraStream.adjustUint32(0, mfraSize);
  if (fileSize)
    mfraStream.buffer.fileStart = fileSize;
  return mfraStream;
}

// src/index.ts
function createDstFile(brands, info) {
  const dstFile = (0, import_mp4box6.createFile)();
  dstFile.init({
    brands: Array.from(brands).filter((brand) => brand && typeof brand === "string" && brand.length === 4),
    timescale: info.timescale,
    duration: 0
  });
  if (dstFile.moov) {
    const _1904 = (/* @__PURE__ */ new Date("1904-01-01T00:00:00Z")).getTime();
    dstFile.moov.mvhd?.set("creation_time", Math.floor((info.created.getTime() - _1904) / 1e3));
    dstFile.moov.mvhd?.set("modification_time", Math.floor((Date.now() - _1904) / 1e3));
    const mehd = dstFile.moov.mvex?.add("mehd");
    mehd.set("fragment_duration", info.duration);
  }
  return dstFile;
}
var BoxSendManager = class {
  constructor(dstFile, cb, DEV = false) {
    this.dstFile = dstFile;
    this.cb = cb;
    this.DEV = DEV;
  }
  nextBox = 0;
  fileSize = 0;
  /**
   * For tfra creating
   */
  startPositionMap = /* @__PURE__ */ new Map();
  send() {
    if (this.DEV)
      console.log("index: send box called", this.nextBox, this.dstFile.boxes.length);
    for (let i2 = this.nextBox; i2 < this.dstFile.boxes.length; i2++) {
      if (this.DEV)
        console.log("index: send box", this.nextBox, i2, this.dstFile.boxes[i2]);
      const box2 = this.dstFile.boxes[i2];
      if (box2.type === "moof") {
        const trackId = box2.trafs[0].tfhd.track_id;
        if (!this.startPositionMap.has(trackId)) {
          this.startPositionMap.set(trackId, this.fileSize);
          if (this.DEV)
            console.log("index: send box: set start position", trackId, this.fileSize);
        }
      }
      const buffer = getBoxBuffer(box2);
      this.fileSize += buffer.byteLength;
      this.cb(buffer);
      if (box2.data) {
        box2.data = void 0;
      }
    }
    if (this.DEV)
      console.log("index: send box: next", this.dstFile.boxes.length);
    this.nextBox = this.dstFile.boxes.length;
  }
};
var StreamCounter = class {
  count = 0;
  constructor() {
  }
  countingTransformStream(cb) {
    const self = this;
    return new TransformStream({
      start() {
      },
      transform(chunk, controller) {
        controller.enqueue(chunk);
        self.count++;
        if (cb)
          cb();
      },
      flush() {
      }
    });
  }
};
var EasyVideoEncoder = class extends EventTarget {
  processes = /* @__PURE__ */ new Map();
  constructor() {
    super();
  }
  async waitForAllProcesses() {
    await Promise.all(this.processes.values());
  }
  async getProcesses() {
    return new Map(this.processes);
  }
  async start(order) {
    const identifier = order.identifier ?? crypto.randomUUID();
    if (this.processes.has(order.identifier))
      throw new Error("Already started");
    const process = this._start({ ...order, identifier });
    this.processes.set(identifier, process);
    try {
      await process;
    } catch (e) {
      if (order.DEV) {
        console.error("start root: error caught", e);
      }
      this.dispatchEvent(new CustomEvent("error", { detail: { identifier, error: e } }));
    } finally {
      this.processes.delete(identifier);
    }
  }
  async _start(order) {
    const DEV = order.DEV ?? false;
    import_mp4box6.Log.setLogLevel(DEV ? import_mp4box6.Log.LOG_LEVEL_DEBUG : import_mp4box6.Log.LOG_LEVEL_ERROR);
    const identifier = order.identifier;
    if (DEV)
      console.log("index: start", order);
    const dispatchEvent = this.dispatchEvent.bind(this);
    const ___ = (() => {
      let videoTrackAddedCallback;
      const videoTrackAddedPromise = new Promise((resolve) => {
        videoTrackAddedCallback = resolve;
      });
      let startToWriteVideoChunksCallback;
      const startToWriteVideoChunksPromise = new Promise((resolve) => {
        startToWriteVideoChunksCallback = resolve;
      });
      return {
        videoTrackAddedCallback,
        videoTrackAddedPromise,
        startToWriteVideoChunksCallback,
        startToWriteVideoChunksPromise
      };
    })();
    const info = await getMP4Info(order.file);
    if (DEV)
      console.log("index: info", info);
    if (!("videoInfo" in info)) {
      if (info.info.audioTracks.length > 0) {
        return this._audioOnly(identifier, order, info, DEV);
      } else {
        throw new Error("No video track found");
      }
    }
    const samplesNumber = (info.videoInfo.nb_samples ?? 0) + info.info.audioTracks.reduce((acc, track) => acc + track.nb_samples, 0);
    const streamCounter = new StreamCounter();
    function dispatchProgress(forceNumber) {
      dispatchEvent(new CustomEvent("progress", { detail: {
        identifier,
        samplesNumber,
        samplesCount: typeof forceNumber === "number" ? forceNumber : streamCounter.count
      } }));
    }
    dispatchProgress();
    const _outputSize = calculateSize(info.videoInfo.video, order.resizeConfig);
    const videoOutputSize = {
      width: floorWithSignificance(_outputSize.width, 2),
      height: floorWithSignificance(_outputSize.height, 2)
    };
    const targetVideoCodec = (() => {
      if (order.videoEncoderConfig.codec)
        return order.videoEncoderConfig.codec;
      if (order.videoEncodeCodecRequest) {
        if (order.videoEncodeCodecRequest.type === "av01") {
          return av01PL(
            {
              width: videoOutputSize.width,
              height: videoOutputSize.height,
              profile: order.videoEncodeCodecRequest?.profile ?? "Main",
              fps: info.fps,
              prefferedAllowingMaxBitrate: order.videoEncoderConfig?.bitrate ?? void 0
            },
            order.videoEncodeCodecRequest.depth ?? 8,
            order.videoEncodeCodecRequest.seqTier ?? "M",
            order.videoEncodeCodecRequest.additional,
            DEV
          );
        }
      }
      return avc1PLFromVideoInfo({
        width: videoOutputSize.width,
        height: videoOutputSize.height,
        profile: order.videoEncodeCodecRequest?.profile ?? "constrained_baseline",
        fps: info.fps,
        prefferedAllowingMaxBitrate: order.videoEncoderConfig?.bitrate ?? void 0
      }, DEV);
    })();
    const encoderConfig = {
      ...order.videoEncoderConfig,
      ...videoOutputSize,
      codec: targetVideoCodec.startsWith("vp08") ? "vp8" : targetVideoCodec,
      framerate: Math.round(info.fps * 100) / 100,
      ...targetVideoCodec.startsWith("avc") ? {
        avc: {
          format: "avc"
        }
      } : {}
    };
    if (DEV)
      console.log("index: start: encoderConfig", encoderConfig);
    try {
      const encoderSupport = await VideoEncoder.isConfigSupported(encoderConfig);
      if (DEV)
        console.log("index: start: isConfigSupported", JSON.parse(JSON.stringify(encoderSupport)));
      if (!encoderSupport || !encoderSupport.supported) {
        console.error("Your encoding config is not supported.", encoderSupport);
        throw new Error(`Your encoding config is not supported. ${JSON.stringify(encoderSupport)}`);
      }
    } catch (e) {
      dispatchEvent(new CustomEvent("error", { detail: { identifier, error: e } }));
      throw e;
    }
    const dstFile = createDstFile([
      "isom",
      "iso6",
      "iso2",
      encoderConfig.codec.split(".")[0],
      ...info.info.audioTracks.map((track) => track.codec.split(".")[0])
    ], info.info);
    if (DEV)
      console.log("index: prepare", samplesNumber, streamCounter.count, videoOutputSize, encoderConfig, dstFile);
    const boxSendManager = new BoxSendManager(dstFile, (buffer) => {
      dispatchEvent(new CustomEvent("segment", { detail: { identifier, buffer } }));
    }, DEV);
    const sampleCounter = new StreamCounter();
    const sharedData = {
      /**
       * Number of samples/frames video_sort_transformer has dropped
       */
      dropFramesOnDecoding: 0,
      dropFrames: 0,
      getResultSamples: () => Math.max(info.videoInfo.nb_samples, sampleCounter.count) - sharedData.dropFrames - sharedData.dropFramesOnDecoding
    };
    const writeThenSendBoxStream = () => new WritableStream({
      start() {
      },
      write() {
        boxSendManager.send();
      },
      close() {
        boxSendManager.send();
      }
    });
    const videoWriter = writeThenSendBoxStream();
    const videoStreamPromise = order.file.stream().pipeThrough(generateDemuxTransformer(info.videoInfo.id, DEV)).pipeThrough(streamCounter.countingTransformStream()).pipeThrough(generateSampleToEncodedVideoChunkTransformer(DEV)).pipeThrough(await generateVideoDecodeTransformer(info.videoInfo, info.description, order.videoDecoderConfig ?? {}, sharedData, DEV)).pipeThrough(generateVideoSortTransformer(info.videoInfo, sharedData, DEV)).pipeThrough(generateResizeTransformer(order.resizeConfig, DEV)).pipeThrough(generateVideoEncoderTransformStream(encoderConfig, order.videoKeyframeConfig, DEV)).pipeThrough(streamCounter.countingTransformStream(dispatchProgress)).pipeThrough(writeEncodedVideoChunksToMP4File(dstFile, encoderConfig, info.videoInfo, sharedData, ___.videoTrackAddedCallback, Promise.resolve(), DEV)).pipeTo(videoWriter).catch((e) => {
      console.error("video stream error", e);
      dispatchEvent(new CustomEvent("error", { detail: { identifier, error: e } }));
    });
    await ___.videoTrackAddedPromise;
    const audioStreams = [];
    const audioTrackIds = [];
    for (const track of info.info.audioTracks) {
      const { writable: audioWriter, trackId } = writeAudioSamplesToMP4File(dstFile, track, info.file.getTrackById(track.id), DEV);
      audioTrackIds.push(trackId);
      audioStreams.push(
        () => order.file.stream().pipeThrough(generateDemuxTransformer(track.id, DEV)).pipeThrough(streamCounter.countingTransformStream(dispatchProgress)).pipeTo(audioWriter).catch((e) => {
          dispatchEvent(new CustomEvent("error", { detail: { identifier, error: e } }));
        })
      );
    }
    if (DEV)
      console.log("index: send first boxes", dstFile);
    boxSendManager.send();
    for (let i2 = 0; i2 < audioStreams.length; i2++) {
      const audioStream = audioStreams[i2];
      await audioStream();
      boxSendManager.send();
    }
    if (DEV)
      console.log("index: start writing video chunks");
    ___.startToWriteVideoChunksCallback();
    await videoStreamPromise;
    if (DEV)
      console.log("index: writing video chunks finished");
    const mfraStream = getMfraStream({
      startPositionMap: boxSendManager.startPositionMap,
      fileSize: boxSendManager.fileSize
    });
    dispatchEvent(new CustomEvent("segment", { detail: { identifier, buffer: mfraStream.buffer } }));
    if (streamCounter.count !== samplesNumber) {
      dispatchProgress(samplesNumber);
    }
    if (DEV)
      console.log("index: mux finish", samplesNumber, streamCounter.count, dstFile);
    dispatchEvent(new CustomEvent("complete", { detail: { identifier } }));
    dstFile.flush();
  }
  async _audioOnly(identifier, order, info, DEV = false) {
    if (DEV)
      console.log("index: THIS IS AUDIO FILE");
    const dispatchEvent = this.dispatchEvent.bind(this);
    const samplesNumber = info.info.audioTracks.reduce((acc, track) => acc + track.nb_samples, 0);
    const streamCounter = new StreamCounter();
    function dispatchProgress(forceNumber) {
      dispatchEvent(new CustomEvent("progress", { detail: {
        identifier,
        samplesNumber,
        samplesCount: typeof forceNumber === "number" ? forceNumber : streamCounter.count
      } }));
    }
    dispatchProgress();
    const dstFile = createDstFile([
      "isom",
      "iso6",
      "iso2",
      ...info.info.audioTracks.map((track) => track.codec.split(".")[0])
    ], info.info);
    if (DEV)
      console.log("index: prepare", samplesNumber, streamCounter.count, dstFile);
    const boxSendManager = new BoxSendManager(dstFile, (buffer) => {
      dispatchEvent(new CustomEvent("segment", { detail: { identifier, buffer } }));
    }, DEV);
    const audioStreams = [];
    const audioTrackIds = [];
    for (const track of info.info.audioTracks) {
      const { writable: audioWriter, trackId } = writeAudioSamplesToMP4File(dstFile, track, info.file.getTrackById(track.id), DEV);
      audioTrackIds.push(trackId);
      audioStreams.push(
        () => order.file.stream().pipeThrough(generateDemuxTransformer(track.id, DEV)).pipeThrough(streamCounter.countingTransformStream(dispatchProgress)).pipeTo(audioWriter).catch((e) => {
          dispatchEvent(new CustomEvent("error", { detail: { identifier, error: e } }));
        })
      );
    }
    if (DEV)
      console.log("index: send first boxes", dstFile);
    boxSendManager.send();
    for (let i2 = 0; i2 < audioStreams.length; i2++) {
      const audioStream = audioStreams[i2];
      await audioStream();
      boxSendManager.send();
    }
    const mfraStream = getMfraStream({
      startPositionMap: boxSendManager.startPositionMap,
      fileSize: boxSendManager.fileSize
    });
    dispatchEvent(new CustomEvent("segment", { detail: { identifier, buffer: mfraStream.buffer } }));
    if (streamCounter.count !== samplesNumber) {
      dispatchProgress(samplesNumber);
    }
    if (DEV)
      console.log("index: mux finish", samplesNumber, streamCounter.count, dstFile);
    dispatchEvent(new CustomEvent("complete", { detail: { identifier } }));
    dstFile.flush();
  }
};
export {
  BoxSendManager,
  EasyVideoEncoder,
  StreamCounter,
  av01ChromaSubsamplingTable,
  av01ColorPrimariesTable,
  av01CorrectSeqTier,
  av01GuessLevelFromInformations,
  av01LevelLimitTable,
  av01MatrixCoefficientsTable,
  av01PL,
  av01ProfileToProfileIdTable,
  av01TransferCharacteristicsTable,
  av01VideoAdditionalInfoToBuildCodecsParameterStringDefaults,
  av1CDescription,
  avc1GetProfileToNalFactor,
  avc1GuessLevelIdcFromInformations,
  avc1LevelLimitsTable,
  avc1PL,
  avc1PLFromVideoInfo,
  avc1ProfileIdcToFactorTable,
  avc1ProfileToProfileIdTable,
  createDstFile,
  floorWithSignificance,
  generateDemuxTransformer,
  generateResizeTransformer,
  generateSampleToEncodedVideoChunkTransformer,
  generateVideoDecodeTransformer,
  generateVideoEncoderTransformStream,
  generateVideoSortTransformer,
  getBoxBuffer,
  getDescriptionBoxEntriesFromTrak,
  getDescriptionBuffer,
  getMP4Info,
  getMfraStream,
  getStabilizedFps,
  samplesToMp4FileWritable,
  validateVideoKeyFrameConfig,
  writeAudioSamplesToMP4File,
  writeEncodedVideoChunksToMP4File,
  writeVideoSamplesToMP4File
};
