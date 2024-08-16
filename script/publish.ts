import fs from "fs-extra";
import { runShell } from "./common";

const packageJson = JSON.parse(fs.readFileSync("package.json", "utf-8"));

const { type, ...rest } = packageJson;

console.log("移除 type 字段");
fs.writeFileSync("package.json", JSON.stringify(rest, null, 4));

console.log("执行发布");
runShell("npm publish");

console.log("恢复 type 字段");
fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 4));
