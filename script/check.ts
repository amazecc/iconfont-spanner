import { exec } from "./utils";

console.log("[Task: format code]");
exec("prettier --config .prettierrc --write src/**/*.{ts,tsx,less,json}");

console.log("[Task: Typescript Compile]");
exec("tsc --noEmit");

console.log("[Task: esLint]");
exec("eslint --fix src/**/*.{ts,tsx,json}");
