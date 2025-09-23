/************* Sample data *************/
const halls = [
  { name:"Conference Room 1", block:"E6", hallNo:"102", capacity:161, facilities:["Projector","Video Conference","Wi-Fi","AC","Mic"] },
  { name:"Conference Room 2", block:"E5", hallNo:"102", capacity:161, facilities:["Projector","Wi-Fi","AC","Mic"] },
  { name:"Round Cabin",       block:"E4", hallNo:"105", capacity:20,  facilities:["Projector","Wi-Fi","AC","Mic"] },
];

const LS_BOOKINGS = "hall_bookings";

/************* Tabs *************/
function showTab(which){
  const map = { book:["panel-book","tab-book"], my:["panel-my","tab-my"] };
  ["book","my"].forEach(k=>{
    document.getElementById(map[k][0]).classList.toggle("active", k===which);
    document.getElementById(map[k][1]).classList.toggle("active", k===which);
  });
  if (which === "my") renderMyBookings();
}

/************* Helpers *************/
const $ = (id)=> document.getElementById(id);

function toISO(dateStr, timeStr){
  if(!dateStr || !timeStr) return "";
  return new Date(`${dateStr}T${timeStr}:00`).toISOString();
}

function fmt(iso){
  const d = new Date(iso);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"});
}

function loadBookings(){
  try { return JSON.parse(localStorage.getItem(LS_BOOKINGS) || "[]"); } catch { return []; }
}
function saveBookings(list){ localStorage.setItem(LS_BOOKINGS, JSON.stringify(list)); }
function makeId(){ return "BK" + Math.random().toString(36).slice(2,8).toUpperCase(); }

/************* Availability flow *************/
function clearAvailability(){
  ["fromDate","fromTime","toDate","toTime","capacity"].forEach(id=> $(id).value="");
  $("availabilityMsg").textContent = "";
  $("hallSection").style.display = "none";
  $("hallList").innerHTML = "";
}

function checkAvailability(){
  const fromDate = $("fromDate").value, fromTime = $("fromTime").value;
  const toDate   = $("toDate").value,   toTime   = $("toTime").value;
  const capInput = $("capacity").value;

  const msg = $("availabilityMsg");
  msg.textContent = "";
  const fromISO = toISO(fromDate, fromTime);
  const toISOv  = toISO(toDate, toTime);

  if(!fromISO || !toISOv){ msg.textContent="⚠ Please fill all date/time fields."; msg.style.color="crimson"; return; }
  if(new Date(fromISO) >= new Date(toISOv)){ msg.textContent="⚠ 'From' must be before 'To'."; msg.style.color="crimson"; return; }

  // Filter halls by capacity if provided
  const minCap = capInput ? Number(capInput) : 0;
  const available = halls.filter(h => h.capacity >= minCap);

  renderHalls(available, {fromISO, toISO: toISOv, capacity: minCap || null});
  msg.textContent = `✅ Showing halls available between ${fromDate} ${fromTime} and ${toDate} ${toTime}.`;
  msg.style.color = "green";
  $("hallSection").style.display = "block";
}

/************* Render halls after availability *************/
function renderHalls(list, context){
  const root = $("hallList");
  root.innerHTML = "";

  if(list.length === 0){
    root.innerHTML = `<p style="color:#6b7280">No halls matched your capacity.</p>`;
    return;
  }

  list.forEach(h=>{
    const div = document.createElement("div");
    div.className = "hall";
    div.innerHTML = `
      <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:10px;">
        <div>
          <div style="font-size:18px; font-weight:700">${h.name}</div>
          <div style="margin-top:6px"><b>Block:</b> ${h.block} &nbsp;|&nbsp; <b>Hall No:</b> ${h.hallNo}</div>
          <div style="margin-top:6px"><b>Capacity:</b> ${h.capacity}</div>
          <div class="chips" style="margin-top:6px;">
            ${h.facilities.map(f=>`<span>${f}</span>`).join("")}
          </div>
        </div>
        <button class="btn" onclick="requestHall('${h.name}', '${context.fromISO}', '${context.toISO}', '${context.capacity ?? ""}')">Request Hall</button>
      </div>
    `;
    root.appendChild(div);
  });
}

/************* Booking *************/
function requestHall(hallName, fromISO, toISO, capStr){
  const newBk = {
    id: makeId(),
    hall: hallName,
    from: fromISO,
    to: toISO,
    capacity: capStr ? Number(capStr) : null,
    status: "pending"
  };
  const list = loadBookings();
  list.push(newBk);
  saveBookings(list);

  alert(`Request submitted for ${hallName}\nBooking ID: ${newBk.id}`);
  showTab("my");
}

/************* My Bookings *************/
function renderMyBookings(){
  const list = loadBookings().sort((a,b)=> new Date(b.from) - new Date(a.from));
  const tbody = $("bookingsTbody");
  tbody.innerHTML = "";

  if(list.length === 0){
    $("bookingsEmpty").style.display = "block";
    return;
  } else {
    $("bookingsEmpty").style.display = "none";
  }

  list.forEach(b=>{
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${b.id}</td>
      <td>${b.hall}</td>
      <td>${fmt(b.from)}</td>
      <td>${fmt(b.to)}</td>
      <td>${b.capacity ?? "-"}</td>
      <td><span class="status ${b.status}">${b.status[0].toUpperCase()+b.status.slice(1)}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

/* boot: default to Book Hall with empty halls until availability is checked */
renderMyBookings();  // so table appears if user has old bookings
