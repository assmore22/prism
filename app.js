import * as THREE from "https://esm.sh/three@0.165.0";
import { CONFIG } from "./config.js";
import { activeAccount, connectWallet, fmtErr, makeReader, short, write } from "./shared/genlayer-lite.js";

const CONTRACT = CONFIG.contractAddress;
const reader = makeReader(CONTRACT);
const $ = (id) => document.getElementById(id);

const state = {
  account: null,
  busy: false,
  selectedId: null,
  bootstrap: {},
  dossiers: [],
  detail: { evidence: [], reviews: [], challenges: [], appeals: [], audit: [] },
  tab: "evidence",
};

function parse(value, fallback) {
  if (value == null || value === "") return fallback;
  if (typeof value === "string") {
    try { return JSON.parse(value); } catch (_) { return fallback; }
  }
  return value;
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function pct(n) {
  return `${Math.max(0, Math.min(100, Math.round(Number(n || 0) / 100)))}%`;
}

function statusClass(d) {
  if (d?.status === "ACCEPTED" || d?.outcome === "supported") return "good";
  if (d?.status === "APPEALED" || d?.status === "CHALLENGE_WINDOW") return "hot";
  return "cool";
}

function setBusy(next, label = "Working") {
  state.busy = next;
  document.querySelectorAll("button").forEach((button) => { button.disabled = next; });
  if (next) toast(label);
}

function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove("show"), 4200);
}

async function tx(label, fn, args = []) {
  setBusy(true, label);
  try {
    const hash = await write(CONTRACT, fn, args, 0n, "ACCEPTED");
    toast(`${label}: ${short(hash)}`);
    await load();
    return hash;
  } catch (error) {
    toast(fmtErr(error));
    throw error;
  } finally {
    setBusy(false);
  }
}

async function loadDetail(id) {
  if (id == null) {
    state.detail = { evidence: [], reviews: [], challenges: [], appeals: [], audit: [] };
    return;
  }
  const sid = String(id);
  async function readSection(name) {
    try {
      return await reader.read(name, [sid]);
    } catch (error) {
      toast(fmtErr(error));
      return "[]";
    }
  }
  const evidence = await readSection("get_evidence");
  const reviews = await readSection("get_reviews");
  const challenges = await readSection("get_challenges");
  const appeals = await readSection("get_appeals");
  const audit = await readSection("get_audit_log");
  state.detail = {
    evidence: parse(evidence, []),
    reviews: parse(reviews, []),
    challenges: parse(challenges, []),
    appeals: parse(appeals, []),
    audit: parse(audit, []),
  };
}

async function load() {
  if (/^0x0{40}$/i.test(CONTRACT)) {
    renderEmptyContract();
    return;
  }
  state.account = await activeAccount();
  $("connectBtn").textContent = state.account ? short(state.account) : "Connect";
  $("explorerLink").href = `${CONFIG.explorerBase}/address/${CONTRACT}`;

  let boot = {};
  try {
    boot = parse(await reader.read("get_frontend_bootstrap"), {});
  } catch (error) {
    toast(fmtErr(error));
  }
  state.bootstrap = boot;
  state.dossiers = Array.isArray(boot.recentDossiers) ? boot.recentDossiers : [];
  if (!state.selectedId && state.dossiers[0]) state.selectedId = String(state.dossiers[0].id);
  if (state.selectedId && !state.dossiers.some((d) => String(d.id) === String(state.selectedId))) {
    state.selectedId = state.dossiers[0] ? String(state.dossiers[0].id) : null;
  }
  await loadDetail(state.selectedId);
  render();
}

function renderEmptyContract() {
  $("metrics").innerHTML = `<div class="metric"><b>Not deployed</b><span>CONFIG.address pending</span></div>`;
  $("dossierList").innerHTML = `<div class="empty">Contract address will appear after deploy.</div>`;
  $("detailView").innerHTML = `<div class="empty">Prism is ready for the first deployment.</div>`;
}

function renderMetrics() {
  const stats = state.bootstrap.counts || {};
  const q = state.bootstrap.quality || {};
  const rows = [
    ["Dossiers", stats.dossiers || 0],
    ["Evidence", stats.evidence || 0],
    ["Reviews", stats.reviews || 0],
    ["Challenges", stats.challenges || 0],
    ["Appeals", stats.appeals || 0],
    ["Quality", pct(q.qualityBps || 0)],
  ];
  $("metrics").innerHTML = rows.map(([label, value]) => `<div class="metric"><b>${esc(value)}</b><span>${esc(label)}</span></div>`).join("");
}

function renderList() {
  if (!state.dossiers.length) {
    $("dossierList").innerHTML = `<div class="empty">No dossiers yet.</div>`;
    return;
  }
  $("dossierList").innerHTML = state.dossiers.map((d) => `
    <article class="dossierItem ${String(d.id) === String(state.selectedId) ? "active" : ""}" data-id="${esc(d.id)}">
      <h3>${esc(d.question)}</h3>
      <div class="chips">
        <span class="chip ${statusClass(d)}">${esc(d.status)}</span>
        <span class="chip">${esc(d.outcome)}</span>
        <span class="chip">${pct(d.confidenceBps)} confidence</span>
      </div>
    </article>
  `).join("");
  document.querySelectorAll(".dossierItem").forEach((item) => {
    item.addEventListener("click", async () => {
      state.selectedId = item.dataset.id;
      await loadDetail(state.selectedId);
      render();
    });
  });
}

function current() {
  return state.dossiers.find((d) => String(d.id) === String(state.selectedId)) || null;
}

function renderTabRows() {
  const rows = state.detail[state.tab] || [];
  if (!rows.length) return `<div class="empty">No ${esc(state.tab)} records.</div>`;
  return `<div class="logGrid">${rows.map((row) => {
    const title = row.label || row.action || row.ruling || row.claim || row.reason || row.summary || row.url || `Record ${row.id}`;
    const body = row.note || row.reason || row.synthesis || row.claim || row.evidenceUrl || row.url || "";
    const meta = row.createdAt ? `clock ${row.createdAt}` : row.status || row.outcome || "";
    return `<article class="logItem">
      <span>${esc(meta)}</span>
      <strong>${esc(title)}</strong>
      <p>${esc(body)}</p>
      ${row.url || row.evidenceUrl ? `<a class="sourceLink" target="_blank" rel="noreferrer" href="${esc(row.url || row.evidenceUrl)}">${esc(row.url || row.evidenceUrl)}</a>` : ""}
    </article>`;
  }).join("")}</div>`;
}

function renderDetail() {
  const d = current();
  if (!d) {
    $("detailView").innerHTML = `<div class="empty">Open the first dossier to populate Prism.</div>`;
    return;
  }
  const flags = Array.isArray(d.riskFlags) ? d.riskFlags : [];
  $("detailView").innerHTML = `
    <section class="heroDetail">
      <div>
        <div class="chips">
          <span class="chip ${statusClass(d)}">${esc(d.status)}</span>
          <span class="chip">${esc(d.outcome)}</span>
          <span class="chip">#${esc(d.id)}</span>
        </div>
        <h2>${esc(d.question)}</h2>
        <a class="sourceLink" target="_blank" rel="noreferrer" href="${esc(d.primaryUrl)}">${esc(d.primaryUrl)}</a>
      </div>
      <div class="scoreDial" style="--pct:${pct(d.confidenceBps)}"><div><b>${pct(d.confidenceBps)}</b><span>confidence</span></div></div>
    </section>

    <section class="ribbon">
      <div><b>${pct(d.supportBps)}</b><span>support</span></div>
      <div><b>${pct(d.contradictionBps)}</b><span>contradiction</span></div>
      <div><b>${esc(d.evidenceCount || 0)}</b><span>evidence</span></div>
      <div><b>${esc(d.reviewCount || 0)}</b><span>reviews</span></div>
    </section>

    <section class="summary">
      <div class="summaryBlock"><h3>Rubric</h3><p>${esc(d.rubric)}</p></div>
      <div class="summaryBlock"><h3>Synthesis</h3><p>${esc(d.synthesis || d.summary || "Pending review.")}</p></div>
    </section>

    <div class="chips">${flags.map((flag) => `<span class="chip hot">${esc(flag)}</span>`).join("")}</div>
    <div class="tabs">
      ${["evidence", "reviews", "challenges", "appeals", "audit"].map((tab) => `<button class="tab ${state.tab === tab ? "active" : ""}" type="button" data-tab="${tab}">${tab}</button>`).join("")}
    </div>
    ${renderTabRows()}
  `;
  document.querySelectorAll(".tab").forEach((tab) => tab.addEventListener("click", () => {
    state.tab = tab.dataset.tab;
    renderDetail();
  }));
}

function render() {
  renderMetrics();
  renderList();
  renderDetail();
}

function selectedOrThrow() {
  const d = current();
  if (!d) throw new Error("No dossier selected");
  return d;
}

function bindForms() {
  $("connectBtn").addEventListener("click", async () => {
    try {
      state.account = await connectWallet();
      $("connectBtn").textContent = short(state.account);
      toast(`Connected ${short(state.account)}`);
    } catch (error) { toast(fmtErr(error)); }
  });
  $("refreshBtn").addEventListener("click", load);
  $("newBtn").addEventListener("click", () => $("questionInput").focus());
  $("standardForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    await tx("Set standard", "set_review_standard", [$("standardInput").value]);
  });
  $("openForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    await tx("Open dossier", "open_dossier", [$("questionInput").value, $("sourceInput").value, $("rubricInput").value]);
  });
  $("evidenceForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const d = selectedOrThrow();
    await tx("Add evidence", "add_evidence", [String(d.id), $("evidenceUrl").value, $("evidenceLabel").value, $("evidenceNote").value]);
  });
  $("reviewBtn").addEventListener("click", async () => {
    const d = selectedOrThrow();
    await tx("Run GenLayer review", "review_with_genlayer", [String(d.id)]);
  });
  $("windowBtn").addEventListener("click", async () => {
    const d = selectedOrThrow();
    await tx("Open challenge window", "open_challenge_window", [String(d.id)]);
  });
  $("finalizeBtn").addEventListener("click", async () => {
    const d = selectedOrThrow();
    await tx("Finalize dossier", "finalize_dossier", [String(d.id)]);
  });
  $("archiveBtn").addEventListener("click", async () => {
    const d = selectedOrThrow();
    await tx("Archive dossier", "archive_dossier", [String(d.id)]);
  });
  $("challengeForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const d = selectedOrThrow();
    await tx("File challenge", "submit_challenge", [String(d.id), $("challengeClaim").value, $("challengeUrl").value]);
  });
  $("resolveChallengeBtn").addEventListener("click", async () => {
    const d = selectedOrThrow();
    const open = [...state.detail.challenges].reverse().find((item) => item.status === "open");
    if (!open) return toast("No open challenge");
    await tx("Resolve challenge", "resolve_challenge_with_genlayer", [String(d.id), String(open.id)]);
  });
  $("appealForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const d = selectedOrThrow();
    await tx("File appeal", "submit_appeal", [String(d.id), $("appealReason").value, $("appealUrl").value]);
  });
  $("resolveAppealBtn").addEventListener("click", async () => {
    const d = selectedOrThrow();
    const open = [...state.detail.appeals].reverse().find((item) => item.status === "open");
    if (!open) return toast("No open appeal");
    await tx("Resolve appeal", "resolve_appeal_with_genlayer", [String(d.id), String(open.id)]);
  });
}

function bootScene() {
  const canvas = $("prismCanvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 7);
  const group = new THREE.Group();
  scene.add(group);

  const prism = new THREE.Mesh(
    new THREE.OctahedronGeometry(1.35, 0),
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.18,
      transmission: 0.38,
      thickness: 0.5,
      clearcoat: 1,
      transparent: true,
      opacity: 0.72,
    })
  );
  group.add(prism);

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(prism.geometry),
    new THREE.LineBasicMaterial({ color: 0x181514, transparent: true, opacity: 0.42 })
  );
  group.add(edges);

  const beams = new THREE.Group();
  const colors = [0xb7f03a, 0x18c4c9, 0xff6f4d, 0x6e5cff];
  for (let i = 0; i < 34; i++) {
    const mat = new THREE.LineBasicMaterial({ color: colors[i % colors.length], transparent: true, opacity: 0.18 });
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-5 + Math.random() * 10, -3 + Math.random() * 6, -2),
      new THREE.Vector3(-5 + Math.random() * 10, -3 + Math.random() * 6, 1.6),
    ]);
    beams.add(new THREE.Line(geo, mat));
  }
  scene.add(beams);

  scene.add(new THREE.AmbientLight(0xffffff, 2.6));
  const light = new THREE.DirectionalLight(0xffffff, 2.4);
  light.position.set(3, 4, 4);
  scene.add(light);

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    group.position.set(w > 900 ? 2.8 : 0.4, w > 900 ? 0.5 : -1.6, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  function tick(t) {
    prism.rotation.x = t * 0.00024;
    prism.rotation.y = t * 0.00038;
    edges.rotation.copy(prism.rotation);
    beams.rotation.z = Math.sin(t * 0.00018) * 0.08;
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

bindForms();
bootScene();
load().catch((error) => toast(fmtErr(error)));
