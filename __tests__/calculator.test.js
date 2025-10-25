import { Calculator } from "../src/services/calculator.js";

const calc = new Calculator();

test("adds numbers correctly", () => {
  expect(calc.add(1, 2)).toBe(3);
});

test("subtracts numbers correctly", () => {
  expect(calc.subtract(5, 3)).toBe(2);
});

test("throws error when dividing by zero", () => {
  expect(() => calc.divide(5, 0)).toThrow("Cannot divide by zero");
});
