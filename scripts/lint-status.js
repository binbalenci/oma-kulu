#!/usr/bin/env node

const { execSync } = require("child_process");
const chalk = require("chalk").default || require("chalk");

console.log(chalk.blue.bold("🔍 Oma Kulu - Linting Status Check\n"));

try {
  console.log(chalk.yellow("📝 Running TypeScript type check..."));
  execSync("npm run type-check", { stdio: "pipe" });
  console.log(chalk.green("✅ TypeScript: No errors found\n"));
} catch (error) {
  console.log(chalk.red("❌ TypeScript: Errors found"));
  console.log(error.stdout.toString());
  console.log(chalk.yellow('💡 Run "npm run type-check" to see details\n'));
}

try {
  console.log(chalk.yellow("🔧 Running ESLint check..."));
  execSync("npm run lint:check", { stdio: "pipe" });
  console.log(chalk.green("✅ ESLint: No warnings found\n"));
} catch (error) {
  console.log(chalk.red("❌ ESLint: Warnings found"));
  console.log(error.stdout.toString());
  console.log(chalk.yellow('💡 Run "npm run lint:fix" to auto-fix issues\n'));
}

console.log(chalk.blue("📋 Available commands:"));
console.log(chalk.gray("  npm run lint:check     - Check for linting issues"));
console.log(chalk.gray("  npm run lint:fix       - Auto-fix linting issues"));
console.log(chalk.gray("  npm run type-check     - Check TypeScript types"));
console.log(chalk.gray("  npm run check-all      - Run all checks"));
console.log(chalk.gray("  npm run lint:fix-all   - Fix and check everything"));
