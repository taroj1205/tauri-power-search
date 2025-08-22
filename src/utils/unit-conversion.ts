type UnitCategory = 'length' | 'weight' | 'temperature' | 'area' | 'volume' | 'speed' | 'time' | 'data' | 'angle'

type UnitDefinition = {
  name: string
  symbol: string
  category: UnitCategory
  toBase: (value: number) => number
  fromBase: (value: number) => number
}

type ConversionResult = {
  value: number
  unit: string
  category: UnitCategory
}

const units: Record<string, UnitDefinition> = {
  // Length units
  'px': { name: 'pixels', symbol: 'px', category: 'length', toBase: (v) => v * 0.0625, fromBase: (v) => v / 0.0625 },
  'rem': { name: 'rem', symbol: 'rem', category: 'length', toBase: (v) => v * 16, fromBase: (v) => v / 16 },
  'em': { name: 'em', symbol: 'em', category: 'length', toBase: (v) => v * 16, fromBase: (v) => v / 16 },
  'pt': { name: 'points', symbol: 'pt', category: 'length', toBase: (v) => v * 1.333333, fromBase: (v) => v / 1.333333 },
  'pc': { name: 'picas', symbol: 'pc', category: 'length', toBase: (v) => v * 16, fromBase: (v) => v / 16 },
  'in': { name: 'inches', symbol: 'in', category: 'length', toBase: (v) => v * 96, fromBase: (v) => v / 96 },
  'cm': { name: 'centimeters', symbol: 'cm', category: 'length', toBase: (v) => v * 37.795276, fromBase: (v) => v / 37.795276 },
  'mm': { name: 'millimeters', symbol: 'mm', category: 'length', toBase: (v) => v * 3.779528, fromBase: (v) => v / 3.779528 },
  'm': { name: 'meters', symbol: 'm', category: 'length', toBase: (v) => v * 3779.527559, fromBase: (v) => v / 3779.527559 },
  'km': { name: 'kilometers', symbol: 'km', category: 'length', toBase: (v) => v * 3779527.559, fromBase: (v) => v / 3779527.559 },
  'ft': { name: 'feet', symbol: 'ft', category: 'length', toBase: (v) => v * 1152, fromBase: (v) => v / 1152 },
  'yd': { name: 'yards', symbol: 'yd', category: 'length', toBase: (v) => v * 3456, fromBase: (v) => v / 3456 },
  'mi': { name: 'miles', symbol: 'mi', category: 'length', toBase: (v) => v * 6082560, fromBase: (v) => v / 6082560 },

  // Weight units
  'g': { name: 'grams', symbol: 'g', category: 'weight', toBase: (v) => v, fromBase: (v) => v },
  'kg': { name: 'kilograms', symbol: 'kg', category: 'weight', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  'mg': { name: 'milligrams', symbol: 'mg', category: 'weight', toBase: (v) => v * 0.001, fromBase: (v) => v / 0.001 },
  'lb': { name: 'pounds', symbol: 'lb', category: 'weight', toBase: (v) => v * 453.59237, fromBase: (v) => v / 453.59237 },
  'oz': { name: 'ounces', symbol: 'oz', category: 'weight', toBase: (v) => v * 28.349523, fromBase: (v) => v / 28.349523 },
  't': { name: 'tons', symbol: 't', category: 'weight', toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },

  // Temperature units
  'c': { name: 'celsius', symbol: '°C', category: 'temperature', toBase: (v) => v, fromBase: (v) => v },
  'f': { name: 'fahrenheit', symbol: '°F', category: 'temperature', toBase: (v) => (v - 32) * 5/9, fromBase: (v) => v * 9/5 + 32 },
  'k': { name: 'kelvin', symbol: 'K', category: 'temperature', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },

  // Area units
  'm2': { name: 'square meters', symbol: 'm²', category: 'area', toBase: (v) => v, fromBase: (v) => v },
  'cm2': { name: 'square centimeters', symbol: 'cm²', category: 'area', toBase: (v) => v * 0.0001, fromBase: (v) => v / 0.0001 },
  'km2': { name: 'square kilometers', symbol: 'km²', category: 'area', toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
  'ft2': { name: 'square feet', symbol: 'ft²', category: 'area', toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
  'in2': { name: 'square inches', symbol: 'in²', category: 'area', toBase: (v) => v * 0.00064516, fromBase: (v) => v / 0.00064516 },
  'ac': { name: 'acres', symbol: 'ac', category: 'area', toBase: (v) => v * 4046.856422, fromBase: (v) => v / 4046.856422 },

  // Volume units
  'l': { name: 'liters', symbol: 'L', category: 'volume', toBase: (v) => v, fromBase: (v) => v },
  'ml': { name: 'milliliters', symbol: 'mL', category: 'volume', toBase: (v) => v * 0.001, fromBase: (v) => v / 0.001 },
  'gal': { name: 'gallons', symbol: 'gal', category: 'volume', toBase: (v) => v * 3.785412, fromBase: (v) => v / 3.785412 },
  'qt': { name: 'quarts', symbol: 'qt', category: 'volume', toBase: (v) => v * 0.946353, fromBase: (v) => v / 0.946353 },
  'pint': { name: 'pints', symbol: 'pt', category: 'volume', toBase: (v) => v * 0.473176, fromBase: (v) => v / 0.473176 },
  'cup': { name: 'cups', symbol: 'cup', category: 'volume', toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588 },

  // Speed units
  'mps': { name: 'meters per second', symbol: 'm/s', category: 'speed', toBase: (v) => v, fromBase: (v) => v },
  'kmh': { name: 'kilometers per hour', symbol: 'km/h', category: 'speed', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
  'mph': { name: 'miles per hour', symbol: 'mph', category: 'speed', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
  'knot': { name: 'knots', symbol: 'kt', category: 'speed', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },

  // Time units
  's': { name: 'seconds', symbol: 's', category: 'time', toBase: (v) => v, fromBase: (v) => v },
  'min': { name: 'minutes', symbol: 'min', category: 'time', toBase: (v) => v * 60, fromBase: (v) => v / 60 },
  'h': { name: 'hours', symbol: 'h', category: 'time', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
  'd': { name: 'days', symbol: 'd', category: 'time', toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
  'w': { name: 'weeks', symbol: 'w', category: 'time', toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
  'mo': { name: 'months', symbol: 'mo', category: 'time', toBase: (v) => v * 2592000, fromBase: (v) => v / 2592000 },
  'y': { name: 'years', symbol: 'y', category: 'time', toBase: (v) => v * 31536000, fromBase: (v) => v / 31536000 },

  // Data units
  'b': { name: 'bytes', symbol: 'B', category: 'data', toBase: (v) => v, fromBase: (v) => v },
  'kb': { name: 'kilobytes', symbol: 'KB', category: 'data', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
  'mb': { name: 'megabytes', symbol: 'MB', category: 'data', toBase: (v) => v * 1048576, fromBase: (v) => v / 1048576 },
  'gb': { name: 'gigabytes', symbol: 'GB', category: 'data', toBase: (v) => v * 1073741824, fromBase: (v) => v / 1073741824 },
  'tb': { name: 'terabytes', symbol: 'TB', category: 'data', toBase: (v) => v * 1099511627776, fromBase: (v) => v / 1099511627776 },

  // Angle units
  'deg': { name: 'degrees', symbol: '°', category: 'angle', toBase: (v) => v, fromBase: (v) => v },
  'rad': { name: 'radians', symbol: 'rad', category: 'angle', toBase: (v) => v * 180 / Math.PI, fromBase: (v) => v * Math.PI / 180 },
  'grad': { name: 'gradians', symbol: 'grad', category: 'angle', toBase: (v) => v * 0.9, fromBase: (v) => v / 0.9 },
}

const unitPattern = /^(\d+(?:\.\d+)?)\s*([a-zA-Z]+(?:\d+)?)\s+(?:to|in|as)\s+([a-zA-Z]+(?:\d+)?)$/i

export const isUnitConversion = (query: string): boolean => {
  return unitPattern.test(query.trim())
}

export const parseUnitConversion = (query: string): { value: number; fromUnit: string; toUnit: string } | null => {
  const match = query.trim().match(unitPattern)
  if (!match) return null

  const [, valueStr, fromUnit, toUnit] = match
  const value = Number.parseFloat(valueStr)
  
  if (Number.isNaN(value)) return null

  return { value, fromUnit: fromUnit.toLowerCase(), toUnit: toUnit.toLowerCase() }
}

export const convertUnit = (value: number, fromUnit: string, toUnit: string): ConversionResult | null => {
  const fromUnitDef = units[fromUnit]
  const toUnitDef = units[toUnit]

  if (!fromUnitDef || !toUnitDef) return null
  if (fromUnitDef.category !== toUnitDef.category) return null

  const baseValue = fromUnitDef.toBase(value)
  const convertedValue = toUnitDef.fromBase(baseValue)

  return {
    value: convertedValue,
    unit: toUnitDef.symbol,
    category: toUnitDef.category
  }
}

export const getAvailableUnits = (category?: UnitCategory): UnitDefinition[] => {
  if (category) {
    return Object.values(units).filter(unit => unit.category === category)
  }
  return Object.values(units)
}

export const getUnitSuggestions = (partialUnit: string): UnitDefinition[] => {
  const lowerPartial = partialUnit.toLowerCase()
  return Object.values(units).filter(unit => 
    unit.name.toLowerCase().includes(lowerPartial) || 
    unit.symbol.toLowerCase().includes(lowerPartial)
  )
}

export const formatConversionResult = (result: ConversionResult): string => {
  const { value, unit } = result
  
  if (Number.isInteger(value)) {
    return `${value} ${unit}`
  }
  
  return `${value.toFixed(4).replace(/\.?0+$/, '')} ${unit}`
}
