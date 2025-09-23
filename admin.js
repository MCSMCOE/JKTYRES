// Must match the key used in halls page
const LS_BOOKINGS = "hall_bookings";

const $ = (id) => document.getElementById(id);

function loadBookings() {
  try { return JSON.parse(localStorage.getItem(LS_BOOKINGS) || "[]"); }
  catch { return []; }
}
function saveBookings(list) {
  localStorage.setItem(LS_BOOKINGS, JSON.stringify(list));
}

function fmt(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
}

function render() {
  const tb = $("reqBody");
  tb.innerHTML = "";

  const filter = $("filterStatus").value;
  const q = $("searchBox").value.trim().toLowerCase();

  const list = loadBookings().sort((a,b)=> new Date(b.from) - new Date(a.from));

  // counters
  const counts = {
    all: list.length,
    pending: list.filter(x=>x.status==="pending").length,
    approved: list.filter(x=>x.status==="approved").length,
    rejected: list.filter(x=>x.status==="rejected").length
  };
  $("counts").textContent = `All: ${counts.all} | Pending: ${counts.pending} | Approved: ${counts.approved} | Rejected: ${counts.rejected}`;

  const filtered = list.filter(item => {
    const statusOK = (filter === "all") || (item.status === filter);
    const text = `${item.id} ${item.hall}`.toLowerCase();
    const searchOK = !q || text.includes(q);
    return statusOK && searchOK;
  });

  if (filtered.length === 0) {
    tb.innerHTML = `<tr><td colspan="5" class="muted">No requests match the filter.</td></tr>`;
    return;
  }

  filtered.forEach(b => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><span class="pill">${b.id}</span></td>
      <td>
        <div><b>${b.hall}</b></div>
        <div class="small">${fmt(b.from)} → ${fmt(b.to)}</div>
      </td>
      <td>${b.capacity ?? "-"}</td>
      <td><span class="status ${b.status}">${b.status[0].toUpperCase()+b.status.slice(1)}</span></td>
      <td class="right">
        <button class="btn approve"  onclick="setStatus('${b.id}','approved')" ${b.status==='approved'?'disabled':''}>Approve</button>
        <button class="btn reject"   onclick="setStatus('${b.id}','rejected')" ${b.status==='rejected'?'disabled':''}>Reject</button>
        <button class="btn secondary" onclick="setStatus('${b.id}','pending')"  ${b.status==='pending'?'disabled':''}>Mark Pending</button>
      </td>
    `;
    tb.appendChild(tr);
  });
}

function setStatus(id, status) {
  const list = loadBookings();
  const idx = list.findIndex(x => x.id === id);
  if (idx === -1) return;

  list[idx].status = status;
  saveBookings(list);
  render();
}

function refresh(){ render(); }

// wire filters
$("filterStatus").addEventListener("change", render);
$("searchBox").addEventListener("input", render);

// first render
render();
