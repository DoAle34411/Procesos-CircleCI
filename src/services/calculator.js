import { sum, subtract, multiply, divide } from "../utils/math.js";
import { logInfo, logError } from "../utils/logger.js";

export class Calculator {
  add(a, b) {
    const result = sum(a, b);
    logInfo(`Adding ${a} + ${b} = ${result}`);
    return result;
  }

  subtract(a, b) {
    const result = subtract(a, b);
    logInfo(`Subtracting ${a} - ${b} = ${result}`);
    return result;
  }

  multiply(a, b) {
    const result = multiply(a, b);
    logInfo(`Multiplying ${a} * ${b} = ${result}`);
    return result;
  }

  divide(a, b) {
    try {
      const result = divide(a, b);
      logInfo(`Dividing ${a} / ${b} = ${result}`);
      return result;
    } catch (error) {
      logError(error.message);
      throw error;
    }
  }
}
