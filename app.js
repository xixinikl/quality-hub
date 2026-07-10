const labels = { pass: "Pass", conditional: "Conditional", fail: "Fail", unknown: "Unknown" };

async function readJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`${url} ${response.status}`);
  return response.json();
}

function statusClass(status) {
  return ["pass", "conditional", "fail"].includes(status) ? status : "unknown";
}

function setText(id, value) {
  document.getElementById(id).textContent = value;
}

function normalizeBase(url) {
  return url.endsWith("/") ? url : `${url}/`;
}

async function loadProject(project) {
  const base = normalizeBase(project.dashboardUrl);
  try {
    const [latest, index] = await Promise.all([
      readJson(`${base}data/latest.json`),
      readJson(`${base}data/index.json`),
    ]);
    return { project, latest, index, ok: true };
  } catch (error) {
    return { project, error: String(error), ok: false };
  }
}

function projectRow(item) {
  const project = item.project;
  if (!item.ok) {
    return `<article class="project">
      <div>
        <div class="title">${project.projectName || project.projectId}</div>
        <div class="meta">${item.error}</div>
      </div>
      <span class="pill unknown">Unknown</span>
      <div class="links"><a href="${project.dashboardUrl}">Dashboard</a><a href="https://github.com/${project.repository}">Repo</a></div>
    </article>`;
  }

  const latest = item.latest;
  const status = latest.verdict.status;
  return `<article class="project">
    <div>
      <div class="title">${project.projectName || latest.project}</div>
      <div class="meta">${latest.date} | checks ${latest.checks.passed}/${latest.checks.total} | risk ${latest.risk.highRiskFiles.length} | ${latest.verdict.reason}</div>
    </div>
    <span class="pill ${statusClass(status)}">${labels[status] || status}</span>
    <div class="links">
      <a href="${project.dashboardUrl}">Dashboard</a>
      <a href="${latest.source.runUrl || `https://github.com/${project.repository}/actions`}">Run</a>
      ${project.updateLedgerUrl ? `<a href="${project.updateLedgerUrl}">Updates</a>` : ""}
      ${project.weeklyReviewUrl ? `<a href="${project.weeklyReviewUrl}">Weekly</a>` : ""}
      <a href="https://github.com/${project.repository}">Repo</a>
    </div>
  </article>`;
}

async function boot() {
  setText("updatedAt", "Refreshing");
  const projects = await readJson("./projects.json");
  const results = await Promise.all(projects.map(loadProject));
  const counts = {
    pass: results.filter((item) => item.ok && item.latest.verdict.status === "pass").length,
    conditional: results.filter((item) => item.ok && item.latest.verdict.status === "conditional").length,
    fail: results.filter((item) => item.ok && item.latest.verdict.status === "fail").length,
  };

  setText("projectCount", String(results.length));
  setText("passCount", String(counts.pass));
  setText("conditionalCount", String(counts.conditional));
  setText("failCount", String(counts.fail));
  setText("updatedAt", `Updated ${new Date().toLocaleString()}`);
  document.getElementById("projectList").innerHTML = results.map(projectRow).join("");
}

document.getElementById("refresh").addEventListener("click", boot);
boot().catch((error) => {
  setText("updatedAt", String(error));
});
