const STATUS = {
  pass: {
    label: "运行正常",
    tone: "good",
    action: "查看项目",
  },
  conditional: {
    label: "需要确认",
    tone: "attention",
    action: "查看需要确认的内容",
  },
  fail: {
    label: "需要处理",
    tone: "danger",
    action: "查看问题",
  },
  unknown: {
    label: "暂时无法读取",
    tone: "muted",
    action: "打开项目",
  },
};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function readJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`无法读取数据（${response.status}）`);
  return response.json();
}

function normalizeBase(url) {
  return url.endsWith("/") ? url : `${url}/`;
}

function formatDate(date) {
  if (!date) return "更新时间未知";
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
  }).format(new Date(`${date}T12:00:00+08:00`));
}

function repositoryUrl(project) {
  return `https://github.com/${project.repository}`;
}

function primaryUrl(item) {
  if (!item.ok) return repositoryUrl(item.project);
  const status = item.latest?.verdict?.status;
  if (["conditional", "fail"].includes(status) && item.latest?.source?.runUrl) {
    return item.latest.source.runUrl;
  }
  return item.project.dashboardUrl || repositoryUrl(item.project);
}

function describeNextStep(item) {
  if (!item.ok) return "确认项目报告是否仍在正常发布。";
  const latest = item.latest;
  const status = latest?.verdict?.status;
  if (status === "fail") return latest.verdict.reason || "查看失败原因并决定修复方式。";
  if (status === "conditional") {
    if (latest.checks?.failed === 0 && latest.risk?.highRiskFiles?.length) {
      return "自动检查已通过，请确认本次高风险范围是否符合预期。";
    }
    return latest.verdict.reason || "查看需要人工确认的内容。";
  }
  if (status === "pass") return "当前无需处理，继续按计划推进。";
  return "打开项目确认最新状态。";
}

async function loadProject(project) {
  const base = normalizeBase(project.dashboardUrl);
  try {
    const [latest, index] = await Promise.all([
      readJson(`${base}data/latest.json`),
      readJson(`${base}data/index.json`),
    ]);
    let weekly = null;
    if (project.weeklySummaryUrl) {
      try {
        weekly = await readJson(project.weeklySummaryUrl);
      } catch {
        weekly = null;
      }
    }
    return { project, latest, index, weekly, ok: true };
  } catch (error) {
    return { project, error: String(error), ok: false };
  }
}

function statusFor(item) {
  if (!item.ok) return "unknown";
  return STATUS[item.latest?.verdict?.status] ? item.latest.verdict.status : "unknown";
}

function projectCard(item) {
  const project = item.project;
  const status = statusFor(item);
  const config = STATUS[status];
  const latest = item.latest;
  const date = item.ok ? formatDate(latest.date) : "连接异常";
  const activity = item.ok
    ? `${latest.scope?.commitCount || 0} 个提交，${latest.scope?.changedFileCount || 0} 个文件有变化`
    : "没有读取到最新项目报告";
  const detailUrl = project.dashboardUrl || repositoryUrl(project);

  return `<article class="project-card tone-${config.tone}">
    <div class="project-main">
      <div class="project-title-row">
        <h3>${escapeHtml(project.projectName || project.projectId)}</h3>
        <span class="status-badge tone-${config.tone}">${config.label}</span>
      </div>
      <p class="next-step"><strong>下一步：</strong>${escapeHtml(describeNextStep(item))}</p>
      <p class="project-meta">${escapeHtml(date)}更新 · ${escapeHtml(activity)}</p>
    </div>
    <div class="project-actions">
      <a class="primary-button tone-${config.tone}" href="${escapeHtml(primaryUrl(item))}">${config.action}<span aria-hidden="true">→</span></a>
      <a class="text-link" href="${escapeHtml(detailUrl)}">查看历史</a>
    </div>
  </article>`;
}

function renderAttention(results) {
  const attention = document.getElementById("attention");
  const title = document.getElementById("attentionTitle");
  const summary = document.getElementById("attentionSummary");
  const action = document.getElementById("attentionAction");
  const countLabel = document.getElementById("attentionCount");
  const urgent = results.filter((item) => ["fail", "unknown"].includes(statusFor(item)));
  const review = results.filter((item) => statusFor(item) === "conditional");
  const needsAttention = [...urgent, ...review];

  attention.className = "attention";
  action.hidden = true;
  action.innerHTML = "";

  if (!results.length) {
    countLabel.textContent = "00";
    attention.classList.add("neutral");
    title.textContent = "还没有接入项目";
    summary.textContent = "接入第一个项目后，这里会告诉你最重要的下一步。";
    return;
  }

  if (!needsAttention.length) {
    countLabel.textContent = "OK";
    attention.classList.add("all-good");
    title.textContent = "本周无需你处理";
    summary.textContent = `已接入的 ${results.length} 个项目运行正常。你可以专注于下一项产品工作。`;
    return;
  }

  const first = needsAttention[0];
  const count = needsAttention.length;
  countLabel.textContent = String(count).padStart(2, "0");
  attention.classList.add(urgent.length ? "has-danger" : "has-attention");
  title.textContent = `有 ${count} 个项目需要你看一下`;
  summary.textContent = `${first.project.projectName || first.project.projectId}：${describeNextStep(first)}`;
  action.hidden = false;
  action.innerHTML = `<a class="hero-button" href="${escapeHtml(primaryUrl(first))}">现在处理<span aria-hidden="true">→</span></a>`;
}

function renderGrowth(results) {
  const container = document.getElementById("growthContent");
  const weeklyItems = results.flatMap((item) => item.weekly?.learnings || []);
  if (weeklyItems.length) {
    container.innerHTML = `<div class="growth-icon" aria-hidden="true">✦</div><div><h3>本周已沉淀 ${weeklyItems.length} 条经验</h3><ul>${weeklyItems
      .slice(0, 4)
      .map((item) => `<li>${escapeHtml(item.title || item)}</li>`)
      .join("")}</ul></div>`;
    return;
  }

  const changedProjects = results.filter((item) => item.ok && item.latest?.scope?.commitCount > 0).length;
  container.innerHTML = `<div class="growth-icon" aria-hidden="true">✦</div><div><h3>等待周一自动回顾</h3><p>${
    changedProjects
      ? `本周已有 ${changedProjects} 个项目产生新变化。系统会筛选有证据、可复用的经验后再展示，避免把偶发问题写成规则。`
      : "本周暂时没有新的项目变化。"
  }</p></div>`;
}

async function boot() {
  const refresh = document.getElementById("refresh");
  refresh.disabled = true;
  document.getElementById("updatedAt").textContent = "正在更新";

  try {
    const projects = await readJson("./projects.json");
    const results = await Promise.all(projects.map(loadProject));
    renderAttention(results);
    renderGrowth(results);
    document.getElementById("projectList").innerHTML = results.map(projectCard).join("");
    const attentionCount = results.filter((item) => statusFor(item) !== "pass").length;
    document.getElementById("projectSummary").textContent = attentionCount
      ? `${attentionCount} 个需要关注`
      : `${results.length} 个项目都正常`;
    document.getElementById("updatedAt").textContent = `刚刚更新`;
  } catch (error) {
    document.getElementById("attention").className = "attention has-danger";
    document.getElementById("attentionTitle").textContent = "暂时无法读取项目列表";
    document.getElementById("attentionSummary").textContent = "刷新重试；如果仍然失败，再查看项目配置。";
    document.getElementById("projectList").innerHTML = `<div class="empty-state">${escapeHtml(error)}</div>`;
    document.getElementById("updatedAt").textContent = "更新失败";
  } finally {
    refresh.disabled = false;
  }
}

document.getElementById("refresh").addEventListener("click", boot);
boot();
