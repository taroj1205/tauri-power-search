import { describe, expect, it } from "bun:test";
import {
  isUnitConversion,
  parseUnitConversion,
  convertUnit,
  formatConversionResult,
  formatConversionResultForCopy,
  getAvailableUnits,
  getUnitSuggestions,
} from "./unit-conversion";

describe("Unit Conversion", () => {
  describe("isUnitConversion", () => {
    it("should detect valid unit conversion queries", () => {
      expect(isUnitConversion("1px to rem")).toBe(true);
      expect(isUnitConversion("10kg to lb")).toBe(true);
      expect(isUnitConversion("32f to c")).toBe(true);
      expect(isUnitConversion("100cm to m")).toBe(true);
    });

    it("should detect invalid unit conversion queries", () => {
      expect(isUnitConversion("hello world")).toBe(false);
      expect(isUnitConversion("1px")).toBe(false);
      expect(isUnitConversion("to rem")).toBe(false);
      expect(isUnitConversion("")).toBe(false);
    });

    it("should handle different separators", () => {
      expect(isUnitConversion("1px to rem")).toBe(true);
      expect(isUnitConversion("1px in rem")).toBe(true);
      expect(isUnitConversion("1px as rem")).toBe(true);
    });

    it("should handle whitespace variations", () => {
      expect(isUnitConversion("1px to rem")).toBe(true);
      expect(isUnitConversion("1 px to rem")).toBe(true);
      expect(isUnitConversion("1px  to  rem")).toBe(true);
    });
  });

  describe("parseUnitConversion", () => {
    it("should parse valid unit conversion queries", () => {
      const result = parseUnitConversion("1px to rem");
      expect(result).toEqual({
        value: 1,
        fromUnit: "px",
        toUnit: "rem",
      });
    });

    it("should handle decimal values", () => {
      const result = parseUnitConversion("16.5px to rem");
      expect(result).toEqual({
        value: 16.5,
        fromUnit: "px",
        toUnit: "rem",
      });
    });

    it("should handle different separators", () => {
      expect(parseUnitConversion("1px in rem")).toEqual({
        value: 1,
        fromUnit: "px",
        toUnit: "rem",
      });
      expect(parseUnitConversion("1px as rem")).toEqual({
        value: 1,
        fromUnit: "px",
        toUnit: "rem",
      });
    });

    it("should return null for invalid queries", () => {
      expect(parseUnitConversion("hello world")).toBeNull();
      expect(parseUnitConversion("1px")).toBeNull();
      expect(parseUnitConversion("to rem")).toBeNull();
    });
  });

  describe("convertUnit", () => {
    describe("Length conversions", () => {
      it("should convert px to rem correctly", () => {
        const result = convertUnit(1, "px", "rem");
        expect(result).toEqual({
          value: 0.0625,
          unit: "rem",
          category: "length",
        });
      });

      it("should convert rem to px correctly", () => {
        const result = convertUnit(1, "rem", "px");
        expect(result).toEqual({
          value: 16,
          unit: "px",
          category: "length",
        });
      });

      it("should convert px to em correctly", () => {
        const result = convertUnit(16, "px", "em");
        expect(result).toEqual({
          value: 1,
          unit: "em",
          category: "length",
        });
      });

      it("should convert cm to m correctly", () => {
        const result = convertUnit(100, "cm", "m");
        expect(result).toEqual({
          value: expect.closeTo(1, 5),
          unit: "m",
          category: "length",
        });
      });

      it("should convert m to cm correctly", () => {
        const result = convertUnit(1, "m", "cm");
        expect(result).toEqual({
          value: expect.closeTo(100, 5),
          unit: "cm",
          category: "length",
        });
      });
    });

    describe("Weight conversions", () => {
      it("should convert kg to lb correctly", () => {
        const result = convertUnit(1, "kg", "lb");
        expect(result).toEqual({
          value: expect.closeTo(2.2046226218487757, 10),
          unit: "lb",
          category: "weight",
        });
      });

      it("should convert lb to kg correctly", () => {
        const result = convertUnit(2.2046226218487757, "lb", "kg");
        expect(result).toEqual({
          value: expect.closeTo(1, 10),
          unit: "kg",
          category: "weight",
        });
      });
    });

    describe("Temperature conversions", () => {
      it("should convert celsius to fahrenheit correctly", () => {
        const result = convertUnit(0, "c", "f");
        expect(result).toEqual({
          value: 32,
          unit: "°F",
          category: "temperature",
        });
      });

      it("should convert fahrenheit to celsius correctly", () => {
        const result = convertUnit(32, "f", "c");
        expect(result).toEqual({
          value: 0,
          unit: "°C",
          category: "temperature",
        });
      });

      it("should convert celsius to kelvin correctly", () => {
        const result = convertUnit(0, "c", "k");
        expect(result).toEqual({
          value: 273.15,
          unit: "K",
          category: "temperature",
        });
      });
    });

    it("should return null for incompatible units", () => {
      expect(convertUnit(1, "px", "kg")).toBeNull();
      expect(convertUnit(1, "c", "m")).toBeNull();
    });

    it("should return null for invalid units", () => {
      expect(convertUnit(1, "invalid", "px")).toBeNull();
      expect(convertUnit(1, "px", "invalid")).toBeNull();
    });
  });

  describe("formatConversionResult", () => {
    it("should format integer values with space", () => {
      const result = { value: 16, unit: "px", category: "length" as const };
      expect(formatConversionResult(result)).toBe("16 px");
    });

    it("should format decimal values with space", () => {
      const result = {
        value: 0.0625,
        unit: "rem",
        category: "length" as const,
      };
      expect(formatConversionResult(result)).toBe("0.0625 rem");
    });

    it("should remove trailing zeros", () => {
      const result = { value: 1.5, unit: "kg", category: "weight" as const };
      expect(formatConversionResult(result)).toBe("1.5 kg");
    });
  });

  describe("formatConversionResultForCopy", () => {
    it("should format integer values without space", () => {
      const result = { value: 16, unit: "px", category: "length" as const };
      expect(formatConversionResultForCopy(result)).toBe("16px");
    });

    it("should format decimal values without space", () => {
      const result = {
        value: 0.0625,
        unit: "rem",
        category: "length" as const,
      };
      expect(formatConversionResultForCopy(result)).toBe("0.0625rem");
    });

    it("should remove trailing zeros", () => {
      const result = { value: 1.5, unit: "kg", category: "weight" as const };
      expect(formatConversionResultForCopy(result)).toBe("1.5kg");
    });
  });

  describe("getAvailableUnits", () => {
    it("should return all units when no category is specified", () => {
      const allUnits = getAvailableUnits();
      expect(allUnits.length).toBeGreaterThan(0);
      expect(allUnits.some((unit) => unit.category === "length")).toBe(true);
      expect(allUnits.some((unit) => unit.category === "weight")).toBe(true);
      expect(allUnits.some((unit) => unit.category === "temperature")).toBe(
        true
      );
    });

    it("should return only units of specified category", () => {
      const lengthUnits = getAvailableUnits("length");
      expect(lengthUnits.length).toBeGreaterThan(0);
      expect(lengthUnits.every((unit) => unit.category === "length")).toBe(
        true
      );

      const weightUnits = getAvailableUnits("weight");
      expect(weightUnits.length).toBeGreaterThan(0);
      expect(weightUnits.every((unit) => unit.category === "weight")).toBe(
        true
      );

      const temperatureUnits = getAvailableUnits("temperature");
      expect(temperatureUnits.length).toBeGreaterThan(0);
      expect(
        temperatureUnits.every((unit) => unit.category === "temperature")
      ).toBe(true);
    });
  });

  describe("getUnitSuggestions", () => {
    it("should return units matching partial name", () => {
      const suggestions = getUnitSuggestions("pixel");
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((unit) => unit.name === "pixels")).toBe(true);
    });

    it("should return units matching partial symbol", () => {
      const suggestions = getUnitSuggestions("px");
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((unit) => unit.symbol === "px")).toBe(true);
    });

    it("should be case insensitive", () => {
      const suggestions1 = getUnitSuggestions("PIXEL");
      const suggestions2 = getUnitSuggestions("pixel");
      expect(suggestions1).toEqual(suggestions2);
    });

    it("should return empty array for no matches", () => {
      const suggestions = getUnitSuggestions("nonexistent");
      expect(suggestions).toEqual([]);
    });
  });

  describe("Integration tests", () => {
    it("should handle complete px to rem conversion flow", () => {
      const query = "1px to rem";
      expect(isUnitConversion(query)).toBe(true);

      const parsed = parseUnitConversion(query);
      expect(parsed).toEqual({
        value: 1,
        fromUnit: "px",
        toUnit: "rem",
      });

      if (!parsed) throw new Error("Failed to parse unit conversion");

      const converted = convertUnit(
        parsed.value,
        parsed.fromUnit,
        parsed.toUnit
      );
      expect(converted).toEqual({
        value: 0.0625,
        unit: "rem",
        category: "length",
      });

      if (!converted) throw new Error("Failed to convert unit");

      expect(formatConversionResult(converted)).toBe("0.0625 rem");
      expect(formatConversionResultForCopy(converted)).toBe("0.0625rem");
    });

    it("should handle complete rem to px conversion flow", () => {
      const query = "1rem to px";
      expect(isUnitConversion(query)).toBe(true);

      const parsed = parseUnitConversion(query);
      expect(parsed).toEqual({
        value: 1,
        fromUnit: "rem",
        toUnit: "px",
      });

      if (!parsed) throw new Error("Failed to parse unit conversion");

      const converted = convertUnit(
        parsed.value,
        parsed.fromUnit,
        parsed.toUnit
      );
      expect(converted).toEqual({
        value: 16,
        unit: "px",
        category: "length",
      });

      if (!converted) throw new Error("Failed to convert unit");

      expect(formatConversionResult(converted)).toBe("16 px");
      expect(formatConversionResultForCopy(converted)).toBe("16px");
    });
  });
});
