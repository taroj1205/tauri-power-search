import { all, create } from "mathjs";

export const isMathematicalExpression = (value: string) => {
	return /[-+*/().\d\s]+/.test(value) && /[-+*/]/.test(value);
};

const math = create(all);

export const calculate = (value: string) => {
	return math.evaluate(value);
};
