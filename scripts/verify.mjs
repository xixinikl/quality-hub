import { readFile } from "node:fs/promises";
import vm from "node:vm";

const requiredFiles = ["index.html", "styles.css", "app.js", "projects.json"];
const contents = Object.fromEntries(
  await Promise.all(requiredFiles.map(async (file) => [file, await readFile(file, "utf8")])),
);

JSON.parse(contents["projects.json"]);
new vm.Script(contents["app.js"], { filename: "app.js" });

const requiredHtml = ["attentionTitle", "attentionCount", "projectList", "growthContent", "refresh"];
for (const id of requiredHtml) {
  if (!contents["index.html"].includes(`id="${id}"`)) {
    throw new Error(`index.html 缺少 #${id}`);
  }
}

const forbiddenCopy = ["Conditional", "Project Status", "Multi-Project Control Room"];
for (const text of forbiddenCopy) {
  if (contents["index.html"].includes(text)) {
    throw new Error(`页面仍包含旧机器术语：${text}`);
  }
}

console.log("PASS: JSON、JavaScript 与关键用户入口检查通过");
