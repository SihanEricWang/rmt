// ====== 0) 配置：改成你自己的 ======
const SUPABASE_URL = "https://pdccbtcxpsxauwapjtpu.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Fg4f2FyKZ8bjsfXM1vajuw_iqqbPYxC";

// anon key 是“可以公开的”，千万不要把 service_role 放前端
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ====== 1) 设备令牌：没有就注册一个 ======
async function getOrCreateDevice() {
  const keyId = "biph_device_id";
  const keySec = "biph_device_secret";
  let device_id = localStorage.getItem(keyId);
  let device_secret = localStorage.getItem(keySec);

  if (device_id && device_secret) return { device_id, device_secret };

  const { data, error } = await supabase.rpc("register_device");
  if (error) throw error;

  // register_device 返回的是一行结果数组
  const row = Array.isArray(data) ? data[0] : data;
  device_id = row.device_id;
  device_secret = row.device_secret;

  localStorage.setItem(keyId, device_id);
  localStorage.setItem(keySec, device_secret);
  return { device_id, device_secret };
}

// ====== 2) DOM helpers ======
const $ = (id) => document.getElementById(id);
function setMsg(text) { $("msg").textContent = text || ""; }

// ====== 3) 读：老师/课程/统计/评论 ======
async function loadProfessors() {
  const { data, error } = await supabase
    .from("professors")
    .select("id,name,department")
    .order("name", { ascending: true });
  if (error) throw error;
  return data;
}

async function loadCourses() {
  const { data, error } = await supabase
    .from("courses")
    .select("id,code,title")
    .order("code", { ascending: true });
  if (error) throw error;
  return data;
}

async function loadProfessorStats(professor_id) {
  const { data, error } = await supabase
    .from("professor_stats")
    .select("professor_id,review_count,avg_overall,avg_difficulty,avg_workload")
    .eq("professor_id", professor_id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function loadPublishedReviews(professor_id) {
  // RLS 已限制只能看到 published，这里再过滤一层更直观
  const { data, error } = await supabase
    .from("reviews")
    .select("id,course_id,rating_overall,rating_difficulty,rating_workload,comment,created_at,status")
    .eq("professor_id", professor_id)
    .eq("status", "published")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data;
}

// ====== 4) 写：提交评价（走 RPC，带限流/唯一性） ======
async function submitReview() {
  setMsg("");

  const profId = $("profSelect").value;
  const courseId = $("courseSelect").value;
  const rating_overall = parseInt($("rOverall").value, 10);

  const rd = $("rDiff").value;
  const rw = $("rWork").value;

  const rating_difficulty = rd ? parseInt(rd, 10) : null;
  const rating_workload = rw ? parseInt(rw, 10) : null;

  const comment = $("comment").value.trim();

  const { device_id, device_secret } = await getOrCreateDevice();

  const { data, error } = await supabase.rpc("submit_review", {
    p_professor_id: profId,
    p_course_id: courseId,
    p_rating_overall: rating_overall,
    p_rating_difficulty: rating_difficulty,
    p_rating_workload: rating_workload,
    p_comment: comment,
    p_device_id: device_id,
    p_device_secret: device_secret
  });

  if (error) {
    // 常见错误：rate_limited / invalid_device / unique index 冲突
    setMsg("提交失败：" + error.message);
    return;
  }

  setMsg("已提交！需要管理员审核后才会公开显示。");
  $("comment").value = "";
}

// ====== 5) UI 渲染 ======
let professors = [];
let courses = [];

function renderProfList(q) {
  const list = $("profList");
  list.innerHTML = "";

  const filtered = professors.filter(p =>
    !q || p.name.toLowerCase().includes(q.toLowerCase())
  );

  filtered.forEach(p => {
    const div = document.createElement("div");
    div.className = "item";
    div.textContent = `${p.name}${p.department ? " · " + p.department : ""}`;
    div.onclick = () => showProfessor(p.id);
    list.appendChild(div);
  });
}

async function showProfessor(professor_id) {
  const prof = professors.find(p => p.id === professor_id);
  $("profTitle").textContent = prof ? `老师：${prof.name}` : "老师详情";

  const stats = await loadProfessorStats(professor_id);
  $("profStats").innerHTML = stats
    ? `
      <span class="pill">评论数：${stats.review_count}</span>
      <span class="pill">综合：${stats.avg_overall ?? "-"}</span>
      <span class="pill">难度：${stats.avg_difficulty ?? "-"}</span>
      <span class="pill">作业量：${stats.avg_workload ?? "-"}</span>
    `
    : `<span class="pill">暂无已公开评价</span>`;

  const revs = await loadPublishedReviews(professor_id);
  const reviewsDiv = $("reviews");
  reviewsDiv.innerHTML = "";

  if (!revs.length) {
    reviewsDiv.innerHTML = `<p class="meta">暂无已公开评论</p>`;
    return;
  }

  // 课程名称映射
  const courseMap = new Map(courses.map(c => [c.id, `${c.code}${c.title ? " " + c.title : ""}`]));

  revs.forEach(r => {
    const div = document.createElement("div");
    div.className = "rev";
    const courseText = courseMap.get(r.course_id) || "课程";
    div.innerHTML = `
      <div class="meta">${courseText} · ${new Date(r.created_at).toLocaleString()}</div>
      <div>综合：${r.rating_overall} /5
        ${r.rating_difficulty ? ` · 难度：${r.rating_difficulty}` : ""}
        ${r.rating_workload ? ` · 作业量：${r.rating_workload}` : ""}
      </div>
      <div>${(r.comment || "").replaceAll("<","&lt;").replaceAll(">","&gt;")}</div>
    `;
    reviewsDiv.appendChild(div);
  });
}

// ====== 6) 初始化 ======
async function init() {
  setMsg("初始化中...");
  await getOrCreateDevice(); // 先确保拿到 device token

  professors = await loadProfessors();
  courses = await loadCourses();

  // 下拉框填充
  $("profSelect").innerHTML = professors.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
  $("courseSelect").innerHTML = courses.map(c => `<option value="${c.id}">${c.code}${c.title ? " " + c.title : ""}</option>`).join("");

  renderProfList("");
  setMsg("");
}

$("q").addEventListener("input", (e) => renderProfList(e.target.value));
$("refresh").addEventListener("click", async () => {
  setMsg("刷新中...");
  professors = await loadProfessors();
  renderProfList($("q").value);
  $("profSelect").innerHTML = professors.map(p => `<option value="${p.id}">${p.name}</option>`).join("");
  setMsg("");
});
$("submit").addEventListener("click", submitReview);

init().catch(err => setMsg("初始化失败：" + err.message));
