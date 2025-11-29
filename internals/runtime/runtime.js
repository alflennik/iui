(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
  var __commonJS = (cb, mod) => function __require2() {
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
          const result2 = new _FixedPoint(aBase + bBase, calcPrecision);
          result2.setPrecision(targetPrecision);
          return result2;
        }
        sub(arg, resultPrecision) {
          const aPrecision = this.precision;
          const bPrecision = arg.precision;
          const calcPrecision = (0, math_1.max)(aPrecision, bPrecision);
          const targetPrecision = pickPrecision(aPrecision, bPrecision, resultPrecision ?? Decimals.left);
          const aBase = (0, math_1.toPrecision)(this.base, calcPrecision, aPrecision);
          const bBase = (0, math_1.toPrecision)(arg.base, calcPrecision, bPrecision);
          const result2 = new _FixedPoint(aBase - bBase, calcPrecision);
          result2.setPrecision(targetPrecision);
          return result2;
        }
        mul(arg, resultPrecision) {
          const aPrecision = this.precision;
          const bPrecision = arg.precision;
          const calcPrecision = aPrecision + bPrecision;
          const targetPrecision = pickPrecision(aPrecision, bPrecision, resultPrecision ?? Decimals.max);
          const aBase = this.base;
          const bBase = arg.base;
          const result2 = new _FixedPoint(aBase * bBase, calcPrecision);
          result2.setPrecision(targetPrecision);
          return result2;
        }
        div(arg, resultPrecision) {
          const aPrecision = this.precision;
          const bPrecision = arg.precision;
          const calcPrecision = aPrecision + bPrecision;
          const targetPrecision = pickPrecision(aPrecision, bPrecision, resultPrecision ?? Decimals.max);
          const aBase = this.base;
          const bBase = arg.base;
          const newBase = (0, math_1.toPrecision)(aBase, calcPrecision, aPrecision) / bBase;
          const result2 = new _FixedPoint((0, math_1.toPrecision)(newBase, calcPrecision, aPrecision), calcPrecision);
          result2.setPrecision(targetPrecision);
          return result2;
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
        let result2;
        if (Math.log10(src) <= 6) {
          result2 = src.toLocaleString("en", { minimumFractionDigits: precision, useGrouping: false });
        } else if (src - Math.trunc(src) === 0) {
          result2 = src.toLocaleString("en", { maximumFractionDigits: 0, useGrouping: false });
        } else {
          throw Error("Not enough precision for a number value. Use string value instead");
        }
        return result2;
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

  // node_modules/crypto-random/random.js
  var require_random = __commonJS({
    "node_modules/crypto-random/random.js"(exports, module) {
      var Random = class {
        /**
         * Generate a random number between 0 (inclusive) and 1 (exclusive).
         * A drop in replacement for Math.random()
         * @return {number}
         */
        static value() {
          if (typeof window !== "undefined" && (window.crypto || window.msCrypto)) {
            return this._getBrowserRandomValue();
          } else {
            return this._getNodeRandomValue();
          }
        }
        /**
         * Generate a random number between min (inclusive) and max (exclusive).
         * @param  {number} min
         * @param  {number} max
         * @return {number}
         */
        static range(min, max) {
          return Math.floor(this.value() * (max - min) + min);
        }
        /**
         * Get a random number between 0 (inclusive) and 1 (exclusive) using Node Crypto.
         * @return  {number}
         * @private
         */
        static _getNodeRandomValue() {
          const crypto = __require("crypto");
          const buffer = crypto.randomBytes(8);
          const number = parseInt(buffer.toString("hex"), 16);
          return number / Math.pow(2, 64);
        }
        /**
         * Get a random number between 0 (inclusive) and 1 (exclusive) using window.crypto.
         * @return  {number}
         * @private
         */
        static _getBrowserRandomValue() {
          const crypto = window.crypto || window.msCrypto;
          const randomValues = new Uint32Array(1);
          crypto.getRandomValues(randomValues);
          return randomValues[0] / Math.pow(2, 32);
        }
      };
      module.exports = Random;
    }
  });

  // createMemoryObject.js
  var valuesSymbol = Symbol("values");
  var createMemoryObject = () => {
    const defaultValues = {
      storageType: "null",
      objectFields: /* @__PURE__ */ new Map(),
      objectIndexes: [],
      function: null,
      number: null,
      string: null,
      null: false,
      boolean: null,
      error: null
    };
    const values = {
      ...defaultValues
    };
    const container = {
      // Use symbol to make these read-only
      [valuesSymbol]: values,
      getStorageType: () => values.storageType,
      setBaseFields: (baseFields) => {
        values.baseFields = baseFields;
      },
      assignNumber: (number) => {
        Object.keys(values).map((key) => {
          if (key === "storageType") {
            storageType = "number";
          } else if (key === "number") {
            values.number = number;
          } else {
            values[key] = defaultValues[key];
          }
        });
      },
      assignObject: ({ objectFields: objectFields2, objectIndexes: objectIndexes2 }) => {
        Object.keys(values).map((key) => {
          if (key === "storageType") {
            storageType = "object";
          } else if (key === "objectFields") {
            values.objectFields = objectFields2;
          } else if (key === "objectIndexes") {
            values.objectIndexes = objectIndexes2;
          } else {
            values[key] = defaultValues[key];
          }
        });
      },
      assignString: (basicString) => {
        Object.keys(values).map((key) => {
          if (key === "storageType") {
            storageType = "string";
          } else if (key === "string") {
            values.string = basicString;
          } else {
            values[key] = defaultValues[key];
          }
        });
      },
      assignNull: () => {
        Object.keys(values).map((key) => {
          if (key === "storageType") {
            storageType = "null";
          } else if (key === "null") {
            values.null = true;
          } else {
            values[key] = defaultValues[key];
          }
        });
      },
      assignBoolean: (booleanValue) => {
        Object.keys(values).map((key) => {
          if (key === "storageType") {
            storageType = "boolean";
          } else if (key === "boolean") {
            values.boolean = booleanValue;
          } else {
            values[key] = defaultValues[key];
          }
        });
      },
      reassign: (memoryObject) => {
        newValues = memoryObject[valuesSymbol];
        Object.keys((key) => {
          values[key] = newValues[key];
        });
      },
      read: (nameString2) => {
        result = values.objectFields.get(nameString2);
        if (result === void 0) return null;
        return result;
      },
      access: (memoryObject) => {
        accessValues = memoryObject[valuesSymbol];
        if (accessValues.number) {
          const jsNumber = accessValues.number.toDecimal();
          const result2 = objectIndexes.at(jsNumber);
          if (result2 === void 0) return null;
          return result2;
        }
        if (accessValues.string) {
          const result2 = values.objectFields.get(accessValues.string);
          if (result2 === void 0) return null;
          return result2;
        }
        if (accessValues.null || accessValues.error) {
          return null;
        }
      },
      accessRange: (numberObject1, numberObject2 = null) => {
        const number1 = numberObject1[valuesSymbol].number.toDecimal();
        let number2;
        if (numberObject2) {
          number2 = numberObject2[valuesSymbol].number.toDecimal();
        }
        if (values.string) {
          const newString = values.string.slice(number1, number2);
          const newMemoryObject2 = createMemoryObject();
          newMemoryObject2.assignString(newString);
          return newMemoryObject2;
        }
        newObjectIndexes = values.objectIndexes.slice(number1, number2);
        const newMemoryObject = createMemoryObject();
        newMemoryObject.assignIndexes(newObjectIndexes);
      },
      getValue: () => {
        return values[values.storageType];
      },
      setIndex: (index, memoryObject) => {
        objectIndexes[index] = memoryObject;
      },
      setName: (nameString2, memoryObject) => {
        objectFields.set(nameString2, memoryObject);
      }
    };
    return container;
  };
  var createMemoryObject_default = createMemoryObject;

  // bootstrap.js
  var import_fixed_point = __toESM(require_dist());
  var import_crypto_random = __toESM(require_random());
  var officialPrecision = 18;
  var extraDigitsOfHiddenPrecision = 1;
  var internalPrecision = officialPrecision + extraDigitsOfHiddenPrecision;
  var createExecute = (core2) => {
    return (node) => {
      const coreFunction = core2[node[0]];
      if (!coreFunction) throw new Error(`Invalid Syntax at ${node[0]}`);
      return coreFunction(...node.slice(1));
    };
  };
  var execute;
  var setExecute = (newExecute) => {
    execute = newExecute;
  };
  var bootstrap = {
    getRandomNumber: () => {
      return (0, import_fixed_point.fpFromDecimal)((0, import_crypto_random.default)());
    },
    add: (memoryObject12, memoryObject22) => {
      const number1 = memoryObject12.getValue();
      const number2 = memoryObject22.getValue();
      const memoryObject = createMemoryObject_default();
      memoryObject.assignNumber(number1.add(number2));
      return memoryObject;
    },
    subtract: (memoryObject12, memoryObject22) => {
      const number1 = memoryObject12.getValue();
      const number2 = memoryObject22.getValue();
      const memoryObject = createMemoryObject_default();
      memoryObject.assignNumber(number1.sub(number2));
      return memoryObject;
    },
    multiply: (memoryObject12, memoryObject22) => {
      const number1 = memoryObject12.getValue();
      const number2 = memoryObject22.getValue();
      const memoryObject = createMemoryObject_default();
      memoryObject.assignNumber(number1.mul(number2));
      return memoryObject;
    },
    number: (numberValue) => {
      return (0, import_fixed_point.fpFromDecimal)(numberValue, internalPrecision);
    },
    call: (functionValue, args) => {
      functionValue(args);
    },
    if: (conditionNode, thenNode, ...elseIfNodes) => {
      const condition = execute(conditionNode);
      if (condition) {
        return execute(thenNode[1]);
      }
      for (let i = 0; i < elseIfNodes.length; i += 1) {
        if (elseIfNodes[i][0] === "condition") {
          const condition2 = execute(elseIfNodes[i][1]);
          if (condition2) {
            return execute(elseIfNodes[i][2]);
          }
        } else if (elseIfNodes[i][0] === "then") {
          return execute(elseIfNodes[i][2]);
        } else {
          throw new Error("Syntax error");
        }
      }
    }
  };
  var bootstrap_default = bootstrap;

  // index.js
  var createScope = () => {
    const blocks = [];
    return {
      enter: () => {
        const id = bootstrap_default.getRandomNumber().toString().slice(2);
        blocks.push({ id, names: [] });
      },
      add: (nameString2, value) => {
        currentBlock = blocks.at(-1);
        currentBlock.names[nameString2] = value;
      },
      get: (nameString2) => {
        let depth = blocks.length - 1;
        while (depth >= 0) {
          const result2 = blocks[depth][nameString2];
          if (result2) return result2;
          depth -= 1;
        }
      },
      exit: () => {
        delete blocks[blocks.length - 1];
      }
    };
  };
  var scope = createScope();
  var core = {
    name: (nameString2) => {
      return scope.get(nameString2);
    },
    // myObject.field
    read: (node1, node2) => {
      const memoryObject = execute2(node1);
      if (node2[0] !== "name") throw new Error("Syntax error");
      const nameString2 = node2[1];
      return memoryObject.read(nameString2);
    },
    // myObject["field"]
    access: (node1, node2) => {
      memoryObject1 = execute2(node1);
      memoryObject2 = execute2(node2);
      return memoryObject1.access(memoryObject2);
    },
    // myArray[0, -1]
    accessRange: (node1, node2, node3) => {
      memoryObject1 = execute2(node1);
      memoryObject2 = execute2(node2);
      memoryObject3 = node3 ? execute2(node3) : null;
      return memoryObject1.accessRange(memoryObject2, memoryObject3);
    },
    add: (node1, node2) => {
      const result1 = execute2(node1);
      const result2 = execute2(node2);
      const memoryObject = createMemoryObject_default();
      memoryObject.assignNumber(bootstrap_default.add(result1, result2));
      return memoryObject;
    },
    addAndAssign: (node1, node2) => {
      const result1 = execute2(node1);
      const result2 = execute2(node2);
      result1.assignNumber(bootstrap_default.add(result1, result2));
    },
    subtract: (node1, node2) => {
      const result1 = execute2(node1);
      const result2 = execute2(node2);
      const memoryObject = createMemoryObject_default();
      memoryObject.assignNumber(bootstrap_default.subtract(result1, result2));
      return memoryObject;
    },
    subtractAndAssign: (node1, node2) => {
      const result1 = execute2(node1);
      const result2 = execute2(node2);
      result1.assignNumber(bootstrap_default.subtract(result1, result2));
    },
    multiply: (node1, node2) => {
      const result1 = execute2(node1);
      const result2 = execute2(node2);
      const memoryObject = createMemoryObject_default();
      memoryObject.assignNumber(bootstrap_default.multiply(result1, result2));
      return memoryObject;
    },
    number: (numberValue) => {
      return bootstrap_default.number(numberValue);
    },
    equals: (node1, node2) => {
      const result1 = execute2(node1);
      const result2 = execute2(node2);
      if (result1.getStorageType() === "string" || result1.getStorageType() === "string") {
        return result1.getValue() === result2.getValue();
      } else if (result1.getStorageType() === "number" || result2.getStorageType() === "number") {
        return result1.eq(result2);
      }
      throw new Error("Equals not intelligent enough yet");
    },
    blockExpression: (...nodes) => {
      scope.enter();
      nodes.forEach((node) => {
        execute2(node);
      });
      scope.exit();
    },
    function: (parametersNode, statementsNode) => {
      return (args) => {
        scope.enter();
        if (parametersNode[0] !== "parameters") throw new Error("Syntax error");
        let index = 0;
        parametersNode.slice(1).forEach((node) => {
          if (node[0] === "spread") {
            if (node[1][0] !== "name") throw new Error("Syntax error");
            scope.add(node[1][0], args.positional[index]);
            index += 1;
          } else if (node[0] === "name") {
            scope.add(node[1], args.positional[index]);
            index += 1;
          } else if (node[0] === "named") {
            nameString = node[1];
            scope.add(nameString, args.named[nameString]);
          } else {
            throw new Error("Syntax error");
          }
        });
        if (statementsNode[0] !== "statements") throw new Error("Syntax error");
        execute2(statementsNode);
        scope.exit();
      };
    },
    parameters: () => {
      throw new Error("Syntax error");
    },
    statements: (...nodes) => {
      nodes.forEach((node) => {
        execute2(node);
      });
    },
    call: (nameNode, argumentsNode) => {
      const args = execute2(argumentsNode);
      const functionValue = execute2(nameNode);
      return bootstrap_default.call(functionValue, args);
    },
    arguments: (...nodes) => {
      const results = nodes.map((node) => execute2(node));
      return results;
    },
    // value = getValue()
    // myObject.&value = getValue()
    assign: (node1, node2) => {
      const initialNameString = (() => {
        if (node1[0] === "name") return node1[1];
        if (node1[0] === "blaze") {
          if (node1[1][0] === "name") return node1[1][1];
        }
        return null;
      })();
      if (initialNameString) {
        result = execute2(node2);
        scope.add(initialNameString, result);
        return result;
      } else {
        const result1 = execute2(node1);
        const result2 = execute2(node2);
        result1.reassign(result2);
        return result1;
      }
    },
    // myField, &myField = getField()
    multipleAssign: (node1, node2, node3) => {
      if (node1[0] !== "name" || node2[0] !== "name") throw new Error("Syntax error");
      const nameString1 = node1[1];
      const nameString2 = node2[1];
      result = execute2(node3);
      scope.add(nameString1, result);
      scope.add(nameString2, result);
    },
    ternary: (conditionNode, thenNode, elseNode) => {
      if (conditionNode[0] !== "condition") throw new Error("Syntax error");
      const condition = execute2(conditionNode[1]);
      if (condition) {
        return execute2(thenNode[1]);
      } else {
        return execute2(elseNode[1]);
      }
    },
    ifStatement: (conditionNode, thenNode, ...elseIfNodes) => {
      return bootstrap_default.if(conditionNode, thenNode, ...elseIfNodes);
    },
    // TODO:
    // while: () => {}
    parentheses: (node1) => {
      return execute2(node1);
    },
    string: (...nodes) => {
      let output = "";
      nodes.forEach((node) => {
        if (node[0] === "stringContent") {
          output += node[1];
        } else if (node[0] === "stringReplacement") {
          output += execute2(node[1]);
        } else {
          throw new Error("Syntax error");
        }
      });
      return output;
    },
    object: (...nodes) => {
      const memoryObject = createMemoryObject_default();
      let index = 0;
      nodes.forEach((node) => {
        if (node[0] === "name") {
          const result2 = execute2(node);
          memoryObject.setIndex(index, result2);
          index += 1;
        } else if (node[0] === "named") {
          const nameString2 = node[1];
          result = (() => {
            if (node[2]) return execute2(node[2]);
            return execute2(node[1]);
          })();
          memoryObject.setName(nameString2, result);
        } else {
          throw new Error("Syntax error");
        }
      });
      return memoryObject;
    },
    tryThrow: (node) => execute2(node),
    // noop for now
    blaze: (node) => execute2(node)
    // noop for now
  };
  var execute2 = createExecute(core);
  setExecute(execute2);
  var runtime = {
    // variables,
    // fpFromDecimal,
    execute: execute2
  };
  globalThis.runtime = runtime;
})();
