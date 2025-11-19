(() => {
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

  // node_modules/@hastom/fixed-point/dist/math.js
  var require_math = __commonJS({
    "node_modules/@hastom/fixed-point/dist/math.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.abs = exports.max = exports.min = exports.toPrecision = void 0;
      var toPrecision = (base, to, from) => {
        if (to === from) {
          return base;
        }
        return base * 10n ** to / 10n ** from;
      };
      exports.toPrecision = toPrecision;
      var min = (...args) => args.reduce((m, e) => e < m ? e : m);
      exports.min = min;
      var max = (...args) => args.reduce((m, e) => e > m ? e : m);
      exports.max = max;
      var abs = (arg) => arg < 0n ? -arg : arg;
      exports.abs = abs;
    }
  });

  // node_modules/@hastom/fixed-point/dist/FixedPoint.js
  var require_FixedPoint = __commonJS({
    "node_modules/@hastom/fixed-point/dist/FixedPoint.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.FixedPoint = exports.Decimals = exports.Rounding = void 0;
      var math_1 = require_math();
      var Rounding;
      (function(Rounding2) {
        Rounding2[Rounding2["ROUND_UP"] = 0] = "ROUND_UP";
        Rounding2[Rounding2["ROUND_DOWN"] = 1] = "ROUND_DOWN";
        Rounding2[Rounding2["ROUND_CEIL"] = 2] = "ROUND_CEIL";
        Rounding2[Rounding2["ROUND_FLOOR"] = 3] = "ROUND_FLOOR";
        Rounding2[Rounding2["ROUND_HALF_UP"] = 4] = "ROUND_HALF_UP";
        Rounding2[Rounding2["ROUND_HALF_DOWN"] = 5] = "ROUND_HALF_DOWN";
        Rounding2[Rounding2["ROUND_HALF_EVEN"] = 6] = "ROUND_HALF_EVEN";
        Rounding2[Rounding2["ROUND_HALF_CEIL"] = 7] = "ROUND_HALF_CEIL";
        Rounding2[Rounding2["ROUND_HALF_FLOOR"] = 8] = "ROUND_HALF_FLOOR";
      })(Rounding || (exports.Rounding = Rounding = {}));
      var Decimals;
      (function(Decimals2) {
        Decimals2["left"] = "left";
        Decimals2["right"] = "right";
        Decimals2["min"] = "min";
        Decimals2["max"] = "max";
        Decimals2["add"] = "add";
        Decimals2["sub"] = "sub";
      })(Decimals || (exports.Decimals = Decimals = {}));
      var pickPrecision = (aPrecision, bPrecision, precisionResolution) => {
        if (typeof precisionResolution !== "string") {
          return BigInt(precisionResolution);
        }
        switch (precisionResolution) {
          case Decimals.left:
            return aPrecision;
          case Decimals.right:
            return bPrecision;
          case Decimals.min:
            return (0, math_1.min)(aPrecision, bPrecision);
          case Decimals.max:
            return (0, math_1.max)(aPrecision, bPrecision);
          case Decimals.add:
            return aPrecision + bPrecision;
          case Decimals.sub:
            return (0, math_1.max)(aPrecision, bPrecision) - (0, math_1.min)(aPrecision, bPrecision);
        }
      };
      var FixedPoint = class _FixedPoint {
        static min(arg0, ...args) {
          let min = arg0;
          for (const arg of args) {
            if (arg.lt(min)) {
              min = arg;
            }
          }
          return min;
        }
        static max(arg0, ...args) {
          let max = arg0;
          for (const arg of args) {
            if (arg.gt(max)) {
              max = arg;
            }
          }
          return max;
        }
        constructor(base, precision) {
          this.plus = this.add;
          this.minus = this.sub;
          this.times = this.mul;
          this.multipliedBy = this.mul;
          this.dividedBy = this.div;
          this.isEqualTo = this.eq;
          this.isGreaterThan = this.gt;
          this.isLessThan = this.lt;
          this.isGreaterThanOrEqualTo = this.gte;
          this.isLessThanOrEqualTo = this.lte;
          this.negated = this.neg;
          this.absoluteValue = this.abs;
          this.squareRoot = this.sqrt;
          this._base = base;
          this._precision = precision;
        }
        get base() {
          return this._base;
        }
        get precision() {
          return this._precision;
        }
        add(arg, resultPrecision) {
          const aPrecision = this.precision;
          const bPrecision = arg.precision;
          const calcPrecision = (0, math_1.max)(aPrecision, bPrecision);
          const targetPrecision = pickPrecision(aPrecision, bPrecision, resultPrecision ?? Decimals.left);
          const aBase = (0, math_1.toPrecision)(this.base, calcPrecision, aPrecision);
          const bBase = (0, math_1.toPrecision)(arg.base, calcPrecision, bPrecision);
          const result = new _FixedPoint(aBase + bBase, calcPrecision);
          result.setPrecision(targetPrecision);
          return result;
        }
        sub(arg, resultPrecision) {
          const aPrecision = this.precision;
          const bPrecision = arg.precision;
          const calcPrecision = (0, math_1.max)(aPrecision, bPrecision);
          const targetPrecision = pickPrecision(aPrecision, bPrecision, resultPrecision ?? Decimals.left);
          const aBase = (0, math_1.toPrecision)(this.base, calcPrecision, aPrecision);
          const bBase = (0, math_1.toPrecision)(arg.base, calcPrecision, bPrecision);
          const result = new _FixedPoint(aBase - bBase, calcPrecision);
          result.setPrecision(targetPrecision);
          return result;
        }
        mul(arg, resultPrecision) {
          const aPrecision = this.precision;
          const bPrecision = arg.precision;
          const calcPrecision = aPrecision + bPrecision;
          const targetPrecision = pickPrecision(aPrecision, bPrecision, resultPrecision ?? Decimals.max);
          const aBase = this.base;
          const bBase = arg.base;
          const result = new _FixedPoint(aBase * bBase, calcPrecision);
          result.setPrecision(targetPrecision);
          return result;
        }
        div(arg, resultPrecision) {
          const aPrecision = this.precision;
          const bPrecision = arg.precision;
          const calcPrecision = aPrecision + bPrecision;
          const targetPrecision = pickPrecision(aPrecision, bPrecision, resultPrecision ?? Decimals.max);
          const aBase = this.base;
          const bBase = arg.base;
          const newBase = (0, math_1.toPrecision)(aBase, calcPrecision, aPrecision) / bBase;
          const result = new _FixedPoint((0, math_1.toPrecision)(newBase, calcPrecision, aPrecision), calcPrecision);
          result.setPrecision(targetPrecision);
          return result;
        }
        cmp(arg, comparator) {
          const aPrecision = this.precision;
          const bPrecision = arg.precision;
          const newPrecision = (0, math_1.max)(aPrecision, bPrecision);
          const aBase = (0, math_1.toPrecision)(this.base, newPrecision, aPrecision);
          const bBase = (0, math_1.toPrecision)(arg.base, newPrecision, bPrecision);
          return comparator(aBase, bBase);
        }
        eq(arg) {
          return this.cmp(arg, (a, b) => a === b);
        }
        gt(arg) {
          return this.cmp(arg, (a, b) => a > b);
        }
        lt(arg) {
          return this.cmp(arg, (a, b) => a < b);
        }
        gte(arg) {
          return this.cmp(arg, (a, b) => a >= b);
        }
        lte(arg) {
          return this.cmp(arg, (a, b) => a <= b);
        }
        neg() {
          return new _FixedPoint(-this.base, this.precision);
        }
        abs() {
          return new _FixedPoint((0, math_1.abs)(this.base), this.precision);
        }
        sqrt() {
          if (this.isNegative()) {
            throw new Error("Cannot calculate square root of negative number");
          }
          if (this.isZero()) {
            return new _FixedPoint(0n, this.precision);
          }
          const workingPrecision = this.precision + 10n;
          const workingThis = new _FixedPoint((0, math_1.toPrecision)(this.base, workingPrecision, this.precision), workingPrecision);
          let x = new _FixedPoint(workingThis.base >> workingPrecision / 2n, workingPrecision);
          if (x.isZero()) {
            x = new _FixedPoint(10n ** (workingPrecision / 2n), workingPrecision);
          }
          const two = new _FixedPoint(2n * 10n ** workingPrecision, workingPrecision);
          const epsilon = new _FixedPoint(1n, workingPrecision);
          for (let i = 0; i < 50; i++) {
            const quotient = workingThis.div(x, workingPrecision);
            const newX = x.add(quotient, workingPrecision).div(two, workingPrecision);
            if (newX.sub(x, workingPrecision).abs().lte(epsilon)) {
              break;
            }
            x = newX;
          }
          return x.toPrecision(this.precision);
        }
        isZero() {
          return this.base === 0n;
        }
        isPositive() {
          return this.base > 0n;
        }
        isNegative() {
          return this.base < 0n;
        }
        floor() {
          return this.round(Rounding.ROUND_FLOOR);
        }
        ceil() {
          return this.round(Rounding.ROUND_CEIL);
        }
        round(mode = Rounding.ROUND_HALF_UP) {
          if (this.precision === 0n) {
            return new _FixedPoint(this.base, this.precision);
          }
          const isNegative = this.isNegative();
          const absBase = (0, math_1.abs)(this.base);
          const divisor = 10n ** this.precision;
          const integerPart = absBase / divisor;
          const fractionalPart = absBase % divisor;
          const isHalfwayCase = fractionalPart * 2n === divisor;
          let rounded = integerPart;
          switch (mode) {
            case Rounding.ROUND_UP:
              if (fractionalPart > 0n) {
                rounded = integerPart + 1n;
              }
              break;
            case Rounding.ROUND_DOWN:
              rounded = integerPart;
              break;
            case Rounding.ROUND_CEIL:
              if (fractionalPart > 0n) {
                if (!isNegative) {
                  rounded = integerPart + 1n;
                } else {
                  rounded = integerPart;
                }
              }
              break;
            case Rounding.ROUND_FLOOR:
              if (fractionalPart > 0n) {
                if (!isNegative) {
                  rounded = integerPart;
                } else {
                  rounded = integerPart + 1n;
                }
              }
              break;
            case Rounding.ROUND_HALF_UP:
              if (fractionalPart > divisor / 2n || isHalfwayCase) {
                rounded = integerPart + 1n;
              }
              break;
            case Rounding.ROUND_HALF_DOWN:
              if (fractionalPart > divisor / 2n) {
                rounded = integerPart + 1n;
              }
              break;
            case Rounding.ROUND_HALF_EVEN:
              if (fractionalPart > divisor / 2n) {
                rounded = integerPart + 1n;
              } else if (isHalfwayCase) {
                if (integerPart % 2n === 1n) {
                  rounded = integerPart + 1n;
                }
              }
              break;
            case Rounding.ROUND_HALF_CEIL:
              if (fractionalPart > divisor / 2n) {
                rounded = integerPart + 1n;
              } else if (isHalfwayCase) {
                if (!isNegative) {
                  rounded = integerPart + 1n;
                }
              }
              break;
            case Rounding.ROUND_HALF_FLOOR:
              if (fractionalPart > divisor / 2n) {
                rounded = integerPart + 1n;
              } else if (isHalfwayCase) {
                if (isNegative) {
                  rounded = integerPart + 1n;
                }
              }
              break;
          }
          const roundedBase = isNegative ? -rounded * divisor : rounded * divisor;
          return new _FixedPoint(roundedBase, this.precision);
        }
        setPrecision(newPrecision, rounding = Rounding.ROUND_DOWN) {
          if (newPrecision < this.precision) {
            const rounded = new _FixedPoint(this.base, this.precision - newPrecision).round(rounding);
            this._base = (0, math_1.toPrecision)(rounded.base, newPrecision, this.precision);
            this._precision = newPrecision;
          } else if (newPrecision > this.precision) {
            this._base = (0, math_1.toPrecision)(this.base, newPrecision, this.precision);
            this._precision = newPrecision;
          }
        }
        toPrecision(resultPrecision, rounding = Rounding.ROUND_DOWN) {
          const newPrecision = BigInt(resultPrecision);
          if (newPrecision < this.precision) {
            const rounded = new _FixedPoint(this.base, this.precision - newPrecision).round(rounding);
            return new _FixedPoint((0, math_1.toPrecision)(rounded.base, newPrecision, this.precision), newPrecision);
          } else {
            return new _FixedPoint((0, math_1.toPrecision)(this.base, newPrecision, this.precision), newPrecision);
          }
        }
        toString() {
          return this.base.toString();
        }
        toJSON() {
          return this.toString();
        }
        toDecimalString() {
          const isNegative = this.isNegative();
          let str = (0, math_1.abs)(this.base).toString().padStart(Number(this.precision) + 1, "0");
          if (isNegative) {
            str = `-${str}`;
          }
          if (this.precision === 0n) {
            return str;
          }
          return str.slice(0, -Number(this.precision)) + "." + str.slice(-Number(this.precision));
        }
        toDecimal() {
          return Number(this.toDecimalString());
        }
        valueOf() {
          return this.toDecimal();
        }
      };
      exports.FixedPoint = FixedPoint;
    }
  });

  // node_modules/@hastom/fixed-point/dist/parsers.js
  var require_parsers = __commonJS({
    "node_modules/@hastom/fixed-point/dist/parsers.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.fpFromInt = exports.fpFromDecimal = void 0;
      var FixedPoint_1 = require_FixedPoint();
      var math_1 = require_math();
      var pow10 = (base, exp) => base * 10n ** exp;
      var numberToDecimalString = (src, precision) => {
        if (!Number.isFinite(src)) {
          throw Error("Invalid number");
        }
        let result;
        if (Math.log10(src) <= 6) {
          result = src.toLocaleString("en", { minimumFractionDigits: precision, useGrouping: false });
        } else if (src - Math.trunc(src) === 0) {
          result = src.toLocaleString("en", { maximumFractionDigits: 0, useGrouping: false });
        } else {
          throw Error("Not enough precision for a number value. Use string value instead");
        }
        return result;
      };
      var fpFromDecimal2 = (src, dstPrecision) => {
        const _dstPrecision = BigInt(dstPrecision);
        if (typeof src === "bigint") {
          return new FixedPoint_1.FixedPoint(pow10(src, _dstPrecision), _dstPrecision);
        }
        let decimalString = typeof src === "number" ? numberToDecimalString(src, dstPrecision) : src;
        let isNegative = false;
        while (decimalString.startsWith("-")) {
          isNegative = !isNegative;
          decimalString = decimalString.slice(1);
        }
        if (decimalString === ".") {
          throw Error("Invalid number");
        }
        const parts = decimalString.split(".");
        if (parts.length > 2) {
          throw Error("Invalid number");
        }
        let whole = parts[0];
        let frac = parts[1];
        if (!whole) {
          whole = "0";
        }
        if (!frac) {
          frac = "0";
        }
        if (frac.length > dstPrecision) {
          throw Error("Invalid number");
        }
        while (frac.length < dstPrecision) {
          frac += "0";
        }
        let base = pow10(BigInt(whole), _dstPrecision) + BigInt(frac);
        if (isNegative) {
          base = -base;
        }
        return new FixedPoint_1.FixedPoint(base, _dstPrecision);
      };
      exports.fpFromDecimal = fpFromDecimal2;
      var fpFromInt = (src, srcPrecision, dstPrecision) => {
        const _srcPrecision = BigInt(srcPrecision);
        const _dstPrecision = BigInt(dstPrecision);
        return new FixedPoint_1.FixedPoint((0, math_1.toPrecision)(BigInt(src), _dstPrecision, _srcPrecision), _dstPrecision);
      };
      exports.fpFromInt = fpFromInt;
    }
  });

  // node_modules/@hastom/fixed-point/dist/index.js
  var require_dist = __commonJS({
    "node_modules/@hastom/fixed-point/dist/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.toPrecision = exports.abs = exports.max = exports.min = exports.fpFromInt = exports.fpFromDecimal = exports.Rounding = exports.Decimals = exports.FixedPoint = void 0;
      var FixedPoint_1 = require_FixedPoint();
      Object.defineProperty(exports, "FixedPoint", { enumerable: true, get: function() {
        return FixedPoint_1.FixedPoint;
      } });
      Object.defineProperty(exports, "Decimals", { enumerable: true, get: function() {
        return FixedPoint_1.Decimals;
      } });
      Object.defineProperty(exports, "Rounding", { enumerable: true, get: function() {
        return FixedPoint_1.Rounding;
      } });
      var parsers_1 = require_parsers();
      Object.defineProperty(exports, "fpFromDecimal", { enumerable: true, get: function() {
        return parsers_1.fpFromDecimal;
      } });
      Object.defineProperty(exports, "fpFromInt", { enumerable: true, get: function() {
        return parsers_1.fpFromInt;
      } });
      var math_1 = require_math();
      Object.defineProperty(exports, "min", { enumerable: true, get: function() {
        return math_1.min;
      } });
      Object.defineProperty(exports, "max", { enumerable: true, get: function() {
        return math_1.max;
      } });
      Object.defineProperty(exports, "abs", { enumerable: true, get: function() {
        return math_1.abs;
      } });
      Object.defineProperty(exports, "toPrecision", { enumerable: true, get: function() {
        return math_1.toPrecision;
      } });
    }
  });

  // index.js
  var import_fixed_point = __toESM(require_dist());
  var variables = {
    log: console.log
  };
  var runtime = {
    variables,
    fpFromDecimal: import_fixed_point.fpFromDecimal,
    execute: () => {
      console.log("hello from runtime");
    }
  };
  globalThis.runtime = runtime;
})();
