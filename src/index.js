import readline from "readline";
import { Calculator } from "./services/calculator.js";

const calc = new Calculator();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("=== Calculator CLI ===");
console.log("Usage: <operation> <num1> <num2>");
console.log("Available: add, subtract, multiply, divide");
console.log("Type 'exit' to quit.\n");

rl.setPrompt("> ");
rl.prompt();

rl.on("line", (input) => {
  if (input.trim().toLowerCase() === "exit") {
    rl.close();
    return;
  }

  const [operation, a, b] = input.trim().split(" ");
  const num1 = parseFloat(a);
  const num2 = parseFloat(b);

  if (isNaN(num1) || isNaN(num2)) {
    console.log("❌ Please enter two valid numbers.\n");
    rl.prompt();
    return;
  }

  try {
    let result;
    switch (operation) {
      case "add":
        result = calc.add(num1, num2);
        break;
      case "subtract":
        result = calc.subtract(num1, num2);
        break;
      case "multiply":
        result = calc.multiply(num1, num2);
        break;
      case "divide":
        result = calc.divide(num1, num2);
        break;
      default:
        console.log("❌ Unknown operation. Try add/subtract/multiply/divide.\n");
        rl.prompt();
        return;
    }

    console.log(`✅ Result: ${result}\n`);
  } catch (err) {
    console.error(`⚠️ Error: ${err.message}\n`);
  }

  rl.prompt();
});

rl.on("close", () => {
  console.log("👋 Goodbye!");
  process.exit(0);
});
