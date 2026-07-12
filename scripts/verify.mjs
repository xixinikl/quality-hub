import { readFile } from "node:fs/promises";
import vm from "node:vm";

const requiredFiles = ["index.html", "styles.css", "app.js", "projects.json", "weekly/latest.json"];
const contents = Object.fromEntries(
  await Promise.all(requiredFiles.map(async (file) => [file, await readFile(file, "utf8")])),
);

const projects = JSON.parse(contents["projects.json"]);
const expectedProjects = ["gongtu-project", "code-quest", "canvas-storm"];
if (projects.length !== expectedProjects.length) {
  throw new Error("projects.json 必须且只能登记三个当前活跃项目");
}
for (const projectId of expectedProjects) {
  const project = projects.find((item) => item.projectId === projectId);
  if (!project?.repository || !project?.dashboardUrl) {
    throw new Error(`${projectId} 缺少仓库或用户入口`);
  }
}
for (const project of projects.filter((item) => item.projectId !== "gongtu-project")) {
  if (!project.reportBaseUrl?.includes("raw.githubusercontent.com")) {
    throw new Error(`${project.projectId} 缺少公开质量报告地址`);
  }
}
const weekly = JSON.parse(contents["weekly/latest.json"]);
if (weekly.schemaVersion !== 1 || !Array.isArray(weekly.learnings)) {
  throw new Error("weekly/latest.json 不符合周报数据契约");
}
new vm.Script(contents["app.js"], { filename: "app.js" });

const requiredHtml = ["attentionTitle", "attentionCount", "projectList", "growthContent", "refresh"];
for (const id of requiredHtml) {
  if (!contents["index.html"].includes(`id="${id}"`)) {
    throw new Error(`index.html 缺少 #${id}`);
  }
}

const forbiddenCopy = [
  "Conditional",
  "Project Status",
  "Multi-Project Control Room",
  "NOW",
  "WEEKLY LOG",
  "SYSTEM / WEEKLY STATUS",
  "开发指挥台",
];
for (const text of forbiddenCopy) {
  if (contents["index.html"].includes(text)) {
    throw new Error(`页面仍包含旧机器术语：${text}`);
  }
}

console.log("PASS: JSON、JavaScript 与关键用户入口检查通过");
