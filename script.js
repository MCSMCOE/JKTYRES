/* ---------------- LOGIN SYSTEM ---------------- */
const users = [
  { username: "admin", password: "admin123", role: "admin" },
  { username: "emp1", password: "emp123", role: "employee" },
  { username: "gate1", password: "gate123", role: "gate" },
  { username: "recep1", password: "recep123", role: "receptionist" }
];

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const uname = document.getElementById("username").value.trim();
      const pass = document.getElementById("password").value.trim();
      const role = document.getElementById("role").value;
      const errorMsg = document.getElementById("errorMsg");

      const user = users.find(
        (u) => u.username === uname && u.password === pass && u.role === role
      );

      if (user) {
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        window.location.href = "dashboard.html";
      } else {
        errorMsg.classList.remove("d-none");
        errorMsg.textContent = "Invalid credentials or role!";
      }
    });
  }

  const userDisplay = document.getElementById("userDisplay");
  if (userDisplay) {
    const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
    if (!user.username) {
      window.location.href = "index.html";
    } else {
      userDisplay.textContent = `${user.username} (${user.role})`;
    }
  }

  // auto-load tables if in courier page
  if (document.URL.includes("courier.html")) {
    applyRoleBasedTabs();
    loadGateTable();
    loadReceptionTable();
  }
  if (document.URL.includes("courier.html")) {
  setTimeout(() => {
    loadGateTable();
    loadReceptionTable();
  }, 200);
}

});

function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}

/* ---------------- ROLE BASED VIEW ---------------- */
function applyRoleBasedTabs() {
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const role = user.role;
  const tabs = {
    employee: ["empTab"],
    gate: ["gateTab"],
    receptionist: ["recepTab"],
    admin: ["empTab", "gateTab", "recepTab"]
  };

  const allowedTabs = tabs[role] || [];

  // Hide all tab panes and nav links not relevant
  document.querySelectorAll(".tab-pane").forEach((pane) => {
    if (allowedTabs.includes(pane.id)) {
      pane.classList.remove("d-none");
      // Automatically make the first visible tab active
      pane.classList.add("show", "active");
    } else {
      pane.classList.add("d-none");
      pane.classList.remove("show", "active");
    }
  });

  document.querySelectorAll("#roleTabs li").forEach((li) => {
    const link = li.querySelector("a");
    const href = link.getAttribute("href").replace("#", "");
    if (allowedTabs.includes(href)) {
      li.classList.remove("d-none");
      link.classList.add("active");
    } else {
      li.classList.add("d-none");
      link.classList.remove("active");
    }
  });

  // Load appropriate tables only after visibility applied
  if (allowedTabs.includes("gateTab")) loadGateTable();
  if (allowedTabs.includes("recepTab")) loadReceptionTable();
  if (allowedTabs.includes("empTab")) loadEmployeeTable();

}



/* ---------------- COURIER MODULE ---------------- */

function getParcels() {
  return JSON.parse(localStorage.getItem("parcels") || "[]");
}

function saveParcels(data) {
  localStorage.setItem("parcels", JSON.stringify(data));
}

// Employee adds parcel
function addParcel(event) {
  event.preventDefault();
  const parcels = getParcels();

  // ✅ get the logged-in user before creating the parcel object
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");

  const newParcel = {
    id: parcels.length + 1,
    date: document.getElementById("pDate").value,
    sender: user.username || "Unknown",   // use logged-in username
    to: document.getElementById("pTo").value,
    subject: document.getElementById("pSubject").value,
    docket: "",
    status: "At Gate"
  };

  parcels.push(newParcel);
  saveParcels(parcels);
  alert("Parcel submitted to Gate!");
  event.target.reset();

  // Refresh all relevant views
  loadGateTable();
  loadReceptionTable();
  loadEmployeeTable();
}

function loadEmployeeTable() {
  const parcels = getParcels();
  const empTable = document.querySelector("#empTable tbody");
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  if (empTable && user.role === "employee") {
    empTable.innerHTML = "";
    const myParcels = parcels.filter(p => p.sender === user.username);
    if (myParcels.length === 0) {
      empTable.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No parcels submitted yet.</td></tr>`;
    } else {
      myParcels.forEach(p => {
        empTable.innerHTML += `
          <tr>
            <td>${p.id}</td>
            <td>${p.date}</td>
            <td>${p.to}</td>
            <td>${p.subject}</td>
            <td>${p.docket || "-"}</td>
            <td>${p.status}</td>
          </tr>`;
      });
    }
  }
}

// Gate updates docket
function updateDocket(id) {
  const docketValue = document.getElementById(`docket_${id}`).value;
  const parcels = getParcels();
  const parcel = parcels.find(p => p.id === id);
  if (parcel) {
    parcel.docket = docketValue;
    parcel.status = "Dispatched";
    saveParcels(parcels);
    loadGateTable();
    loadReceptionTable();
  }
}

// Load tables
function loadGateTable() {
  const parcels = getParcels();
  const gateTable = document.querySelector("#gateTable tbody");
  if (gateTable) {
    gateTable.innerHTML = "";
    parcels.forEach(p => {
      gateTable.innerHTML += `
        <tr>
          <td>${p.id}</td>
          <td>${p.date}</td>
          <td>${p.sender}</td>
          <td>${p.to}</td>
          <td>${p.subject}</td>
          <td><input type="text" class="form-control" id="docket_${p.id}" value="${p.docket}" placeholder="Enter docket"></td>
          <td><button class="btn btn-success btn-sm" onclick="updateDocket(${p.id})">Update</button></td>
        </tr>`;
    });
  }
}

function loadReceptionTable() {
  const parcels = getParcels();
  const recepTable = document.querySelector("#recepTable tbody");
  if (recepTable) {
    recepTable.innerHTML = "";
    parcels.forEach(p => {
      recepTable.innerHTML += `
        <tr>
          <td>${p.id}</td>
          <td>${p.date}</td>
          <td>${p.sender}</td>
          <td>${p.to}</td>
          <td>${p.subject}</td>
          <td>${p.docket || "-"}</td>
          <td>${p.status}</td>
        </tr>`;
    });
  }
}

// Auto-load tables when courier.html opens
document.addEventListener("DOMContentLoaded", () => {
  // Load any existing data tables
  loadGateTable();
  loadReceptionTable();
  loadEmployeeTable();   // also load employee's own parcels

  // ✅ Auto-fill sender name if logged-in user is an employee
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const senderField = document.getElementById("pSender");
  if (senderField && user.role === "employee") {
    senderField.value = user.username;   // fills name automatically
  }
});

/* ---------------- AMENITIES MODULE ---------------- */

function getAmenities() {
  return JSON.parse(localStorage.getItem("amenities") || "[]");
}

function saveAmenities(data) {
  localStorage.setItem("amenities", JSON.stringify(data));
}

function addAmenityRequest(event) {
  event.preventDefault();
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const amenities = getAmenities();

  const newReq = {
    id: amenities.length + 1,
    date: document.getElementById("reqDate").value,
    employee: user.username,
    item: document.getElementById("reqItem").value,
    details: document.getElementById("reqDetails").value,
    status: "Pending"
  };

  amenities.push(newReq);
  saveAmenities(amenities);
  alert("Request submitted successfully!");
  event.target.reset();
  loadEmpAmenityTable();
  loadAdminAmenityTable();
}

function loadEmpAmenityTable() {
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const amenities = getAmenities();
  const table = document.querySelector("#empAmenityTable tbody");
  if (table && user.role === "employee") {
    table.innerHTML = "";
    const myReqs = amenities.filter(a => a.employee === user.username);
    myReqs.forEach(a => {
      const badge =
        a.status === "Collected"
          ? '<span class="badge bg-success">Collected</span>'
          : '<span class="badge bg-warning text-dark">Pending</span>';
      table.innerHTML += `<tr><td>${a.id}</td><td>${a.date}</td><td>${a.item}</td><td>${a.details}</td><td>${badge}</td></tr>`;
    });
  }
}

function loadAdminAmenityTable() {
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const amenities = getAmenities();
  const table = document.querySelector("#adminAmenityTable tbody");
  if (table && (user.role === "admin" || user.role === "receptionist")) {
    table.innerHTML = "";
    amenities.forEach(a => {
      const badge =
        a.status === "Collected"
          ? '<span class="badge bg-success">Collected</span>'
          : '<span class="badge bg-warning text-dark">Pending</span>';
      table.innerHTML += `
        <tr>
          <td>${a.id}</td>
          <td>${a.date}</td>
          <td>${a.employee}</td>
          <td>${a.item}</td>
          <td>${a.details}</td>
          <td>${badge}</td>
          <td>
            ${
              a.status === "Pending"
                ? `<button class="btn btn-sm btn-success" onclick="markCollected(${a.id})">Ready! Collect it</button>`
                : ""
            }
          </td>
        </tr>`;
    });
  }
}

function markCollected(id) {
  const amenities = getAmenities();
  const req = amenities.find(a => a.id === id);
  if (req) {
    req.status = "Collected";
    saveAmenities(amenities);
    loadAdminAmenityTable();
    loadEmpAmenityTable();
  }
}

// Auto-fill employee name on load
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");

  // Auto-fill employee name
  const empField = document.getElementById("reqEmp");
  if (empField && user.username) empField.value = user.username;

  // Apply role-based visibility
  applyAmenityRoleView();
});

function applyAmenityRoleView() {
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const role = user.role;

  const tabs = {
    employee: ["empAmenity"],
    admin: ["adminAmenity"]
  };

  const allowedTabs = tabs[role] || [];

  // Hide or show tab panes
  document.querySelectorAll(".tab-pane").forEach((pane) => {
    if (allowedTabs.includes(pane.id)) {
      pane.classList.remove("d-none");
      pane.classList.add("show", "active");
    } else {
      pane.classList.add("d-none");
      pane.classList.remove("show", "active");
    }
  });

  // Hide or show tab buttons
  document.querySelectorAll("#amenityTabs li").forEach((li) => {
    const link = li.querySelector("a");
    const href = link.getAttribute("href").replace("#", "");
    if (!allowedTabs.includes(href)) {
      li.classList.add("d-none");
      link.classList.remove("active");
    } else {
      li.classList.remove("d-none");
      link.classList.add("active");
    }
  });

  // Load relevant data for the role
  if (allowedTabs.includes("empAmenity")) loadEmpAmenityTable();
  if (allowedTabs.includes("adminAmenity")) loadAdminAmenityTable();
}

/* ---------------- MEETING MODULE ---------------- */

// Retrieve & save meeting data
function getMeetings() {
  return JSON.parse(localStorage.getItem("meetings") || "[]");
}
function saveMeetings(data) {
  localStorage.setItem("meetings", JSON.stringify(data));
}

// List of available halls
const halls = ["Conference Hall A", "Conference Hall B", "Training Room", "Board Room"];

// Load halls into dropdown
function checkHalls() {
  const hallSelect = document.getElementById("hallSelect");
  hallSelect.innerHTML = "";
  halls.forEach(h => {
    hallSelect.innerHTML += `<option>${h}</option>`;
  });
  alert("✅ Available Halls loaded!");
}

// Simple alert for hall booking (placeholder for future logic)
function bookHall() {
  const selectedHall = document.getElementById("hallSelect").value;
  if (!selectedHall) return alert("Please select a hall first!");
  alert(`✅ ${selectedHall} booked for your meeting!`);
}

// Toggle visibility for visitor / gift sections
function toggleVisitorDetails() {
  const val = document.getElementById("hasVisitor").value;
  document.getElementById("visitorDetailsDiv").style.display = val === "Yes" ? "block" : "none";
}
function toggleGiftDetails() {
  const val = document.getElementById("giftNeeded").value;
  document.getElementById("giftDetailsDiv").style.display = val === "Yes" ? "block" : "none";
}

// ---------------- Internal Attendees ----------------
let internalAttendees = [];

function addInternalAttendee() {
  const name = document.getElementById("intName").value.trim();
  const email = document.getElementById("intEmail").value.trim();
  if (!name || !email) {
    alert("Please enter both name and email.");
    return;
  }

  internalAttendees.push({ name, email });
  document.getElementById("intName").value = "";
  document.getElementById("intEmail").value = "";
  renderInternalList();
}

function renderInternalList() {
  const list = document.getElementById("internalList");
  list.innerHTML = "";
  internalAttendees.forEach((p, index) => {
    list.innerHTML += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        ${p.name} (${p.email})
        <button type="button" class="btn btn-sm btn-danger" onclick="removeInternal(${index})">X</button>
      </li>`;
  });
}

function removeInternal(index) {
  internalAttendees.splice(index, 1);
  renderInternalList();
}

// ---------------- Add Meeting ----------------
function addMeeting(event) {
  event.preventDefault();
  console.log("✅ addMeeting triggered");

  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const meetings = getMeetings();

  const newMeeting = {
    id: meetings.length + 1,
    employee: user.username,
    details: document.getElementById("meetDetails").value,
    persons: document.getElementById("meetPersons").value,
    date: document.getElementById("meetDate").value,
    fromTime: document.getElementById("meetFrom").value,
    toTime: document.getElementById("meetTo").value,
    internal: internalAttendees,
    hasVisitor: document.getElementById("hasVisitor").value,
    visitor: document.getElementById("visitorDetails").value,
    food: document.getElementById("foodNeeded").value,
    refresh: document.getElementById("refreshNeeded").value,
    gift: document.getElementById("giftNeeded").value,
    giftDetails: document.getElementById("giftDetails").value,
    hall: document.getElementById("hallSelect").value || "Not selected",
    status: "Request Sent"
  };

  meetings.push(newMeeting);
  saveMeetings(meetings);
  alert("✅ Meeting request submitted!");

  // Reset form and attendee list
  event.target.reset();
  internalAttendees = [];
  renderInternalList();

  loadEmpMeetingTable();
  loadAdminMeetingTable();
}

// ---------------- Employee Table ----------------
function loadEmpMeetingTable() {
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const meetings = getMeetings();
  const table = document.querySelector("#empMeetingTable tbody");

  if (table && user.role === "employee") {
    table.innerHTML = "";
    const myMeetings = meetings.filter(m => m.employee === user.username);

    if (myMeetings.length === 0) {
      table.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No meeting requests yet.</td></tr>`;
      return;
    }

    myMeetings.forEach(m => {
      table.innerHTML += `
        <tr>
          <td>${m.id}</td>
          <td>${m.details}</td>
          <td>${m.date} (${m.fromTime || "--"}–${m.toTime || "--"})</td>
          <td>${m.hall}</td>
          <td><span class="badge ${m.status === "Request Received" ? "bg-success" : "bg-warning text-dark"}">${m.status}</span></td>
        </tr>`;
    });
  }
}

// ---------------- Admin Table ----------------
function loadAdminMeetingTable() {
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const meetings = getMeetings();
  const table = document.querySelector("#adminMeetingTable tbody");

  if (!table) {
    console.warn("⚠️ adminMeetingTable tbody not found in DOM.");
    return;
  }

  if (!user.role || user.role.toLowerCase() !== "admin") {
    console.warn("⚠️ current user is not admin, skipping admin table load.");
    return;
  }

  table.innerHTML = "";

  if (meetings.length === 0) {
    table.innerHTML = `<tr><td colspan="13" class="text-center text-muted">No meeting requests found.</td></tr>`;
    return;
  }

  meetings.forEach(m => {
    table.innerHTML += `
      <tr>
        <td>${m.id}</td>
        <td>${m.details || "-"}</td>
        <td>${m.employee || "-"}</td>
        <td>${m.date ? `${m.date} (${m.fromTime || ""}–${m.toTime || ""})` : "-"}</td>
        <td>${m.persons || "-"}</td>
        <td>
        ${
          Array.isArray(m.internal)
           ? m.internal.map(p => `${p.name} (${p.email})`).join("<br>")
          : (m.internal ? m.internal : "<span class='text-muted'>None</span>")
         }
        </td>
        <td>${m.hasVisitor === "Yes" ? (m.visitor || "Yes") : "<span class='text-muted'>No</span>"}</td>
        <td>${m.food || "No"}</td>
        <td>${m.refresh || "No"}</td>
        <td>${m.gift === "Yes" ? (m.giftDetails || "Yes") : "<span class='text-muted'>No</span>"}</td>
        <td>${m.hall || "-"}</td>
        <td><span class="badge ${m.status === "Request Received" ? "bg-success" : "bg-warning text-dark"}">${m.status}</span></td>
        <td>
          ${m.status === "Request Sent"
            ? `<button class="btn btn-sm btn-success" onclick="approveMeeting(${m.id})">Received</button>`
            : ""}
        </td>
      </tr>`;
  });
}

// ---------------- Admin Approval ----------------
function approveMeeting(id) {
  const meetings = getMeetings();
  const meet = meetings.find(m => m.id === id);
  if (meet) {
    meet.status = "Request Received";
    saveMeetings(meetings);
    loadAdminMeetingTable();
    loadEmpMeetingTable();
    alert(`✅ Meeting #${id} marked as received.`);
  }
}

// ---------------- Role Based View ----------------
function applyMeetingRoleView() {
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const role = (user.role || "").toLowerCase();

  const tabs = {
    employee: ["empMeeting"],
    admin: ["adminMeeting"]
  };

  const allowedTabs = tabs[role] || [];

  // Toggle tab panes
  document.querySelectorAll(".tab-pane").forEach((pane) => {
    if (allowedTabs.includes(pane.id)) {
      pane.classList.remove("d-none");
      pane.classList.add("show", "active");
    } else {
      pane.classList.add("d-none");
      pane.classList.remove("show", "active");
    }
  });

  // Toggle tab headers
  document.querySelectorAll("#meetingTabs li").forEach((li) => {
    const link = li.querySelector("a");
    const href = link.getAttribute("href").replace("#", "");
    if (!allowedTabs.includes(href)) {
      li.classList.add("d-none");
      link.classList.remove("active");
    } else {
      li.classList.remove("d-none");
      link.classList.add("active");
    }
  });

  // Load correct table
  if (allowedTabs.includes("empMeeting")) loadEmpMeetingTable();
  if (allowedTabs.includes("adminMeeting")) loadAdminMeetingTable();
}

// ---------------- Auto Load on Page Ready ----------------
// Auto-load after DOM and Bootstrap tabs are fully ready
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  console.log("👤 Logged in user:", user);

  // Apply role-based tab view
  applyMeetingRoleView();

  // Wait slightly for hidden tab DOM to render
  setTimeout(() => {
    if (user.role && user.role.toLowerCase() === "admin") {
      console.log("🧾 Admin detected → loading meeting table...");
      loadAdminMeetingTable();
    } else if (user.role && user.role.toLowerCase() === "employee") {
      console.log("👷 Employee detected → loading my meetings...");
      loadEmpMeetingTable();
    } else {
      console.warn("⚠️ Unknown role or not logged in");
    }
  }, 300);
});

/* ---------------- PATENT MODULE (with multi-inventor) ---------------- */

let inventorList = [];

function getPatents() {
  return JSON.parse(localStorage.getItem("patents") || "[]");
}
function savePatents(data) {
  localStorage.setItem("patents", JSON.stringify(data));
}

// ➕ Add inventor
function addInventor() {
  const name = document.getElementById("invName").value.trim();
  const dept = document.getElementById("invDept").value.trim();
  const email = document.getElementById("invEmail").value.trim();

  if (!name || !dept || !email) {
    alert("Please fill all inventor fields.");
    return;
  }

  inventorList.push({ name, dept, email });
  document.getElementById("invName").value = "";
  document.getElementById("invDept").value = "";
  document.getElementById("invEmail").value = "";
  renderInventorList();
}

// Render inventor list
function renderInventorList() {
  const list = document.getElementById("inventorList");
  list.innerHTML = "";
  inventorList.forEach((inv, i) => {
    list.innerHTML += `
      <li class="list-group-item d-flex justify-content-between align-items-center">
        ${inv.name} (${inv.dept}) - ${inv.email}
        <button class="btn btn-sm btn-danger" onclick="removeInventor(${i})">X</button>
      </li>`;
  });
}

function removeInventor(index) {
  inventorList.splice(index, 1);
  renderInventorList();
}

// Add new idea
function addPatent(event) {
  event.preventDefault();
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const patents = getPatents();

  if (inventorList.length === 0) {
    alert("Please add at least one inventor.");
    return;
  }

  const newPatent = {
    id: patents.length + 1,
    submittedBy: user.username,
    inventors: inventorList,
    title: document.getElementById("pTitle").value,
    domain: document.getElementById("pDomain").value,
    description: document.getElementById("pDescription").value,
    status: "Form Received",
    remarks: "Your disclosure has been received."
  };

  patents.push(newPatent);
  savePatents(patents);
  alert("✅ Idea Disclosure Submitted!");

  // Reset form and inventor list
  inventorList = [];
  renderInventorList();
  event.target.reset();

  loadEmpPatentTable();
  loadAdminPatentTable();
}

// Employee view
function loadEmpPatentTable() {
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const patents = getPatents();
  const table = document.querySelector("#empPatentTable tbody");
  if (table && user.role === "employee") {
    table.innerHTML = "";
    const myPatents = patents.filter(p => p.submittedBy === user.username);
    myPatents.forEach(p => {
      const inventorNames = p.inventors.map(i => i.name).join(", ");
      table.innerHTML += `
        <tr>
          <td>${p.id}</td>
          <td>${p.title}</td>
          <td>${p.domain}</td>
          <td><span class="badge bg-info text-dark">${p.status}</span></td>
          <td>${p.remarks || "-"}</td>
        </tr>`;
    });
  }
}

// Admin view
function loadAdminPatentTable() {
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const patents = getPatents();
  const table = document.querySelector("#adminPatentTable tbody");
  if (table && user.role === "admin") {
    table.innerHTML = "";
    patents.forEach(p => {
      const inventorHTML = Array.isArray(p.inventors)
        ? p.inventors.map(i => `${i.name} (${i.dept})<br>${i.email}`).join("<hr>")
         : "<span class='text-muted'>No inventor data</span>";
      table.innerHTML += `
        <tr>
          <td>${p.id}</td>
          <td>${p.title}</td>
          <td>${inventorHTML}</td>
          <td>${p.domain}</td>
          <td>${p.description}</td>
          <td><span class="badge bg-info text-dark">${p.status}</span></td>
          <td>${p.remarks || "-"}</td>
          <td>
            <select class="form-select form-select-sm" onchange="updatePatentStatus(${p.id}, this.value)">
              <option selected disabled>Update Stage</option>
              <option>Under Evaluation</option>
              <option>With Patent Search - Proceed</option>
              <option>With Patent Search - Not Proceed</option>
              <option>Application Submitted</option>
              <option>Query Raised by IPO</option>
              <option>Query Clarification Submitted</option>
              <option>In Process with IPO</option>
              <option>Confirmation Received</option>
              <option>Patent Granted</option>
            </select>
          </td>
        </tr>`;
    });
  }
}

function updatePatentStatus(id, newStatus) {
  const patents = getPatents();
  const patent = patents.find(p => p.id === id);
  if (patent) {
    patent.status = newStatus;
    patent.remarks = getAutoRemark(newStatus);
    savePatents(patents);
    loadAdminPatentTable();
    loadEmpPatentTable();
  }
}

function getAutoRemark(status) {
  const remarksMap = {
    "Under Evaluation": "Your idea is under technical evaluation.",
    "With Patent Search - Proceed": "Patent search complete — proceeding with filing.",
    "With Patent Search - Not Proceed": "Idea did not qualify after search.",
    "Application Submitted": "Patent application submitted to IPO.",
    "Query Raised by IPO": "IPO has raised a clarification query.",
    "Query Clarification Submitted": "Clarification submitted to IPO.",
    "In Process with IPO": "Patent under examination at IPO.",
    "Confirmation Received": "IPO confirmed acceptance of application.",
    "Patent Granted": "🎉 Congratulations! Patent granted and award initiated."
  };
  return remarksMap[status] || "";
}

function applyPatentRoleView() {
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
  const role = user.role ? user.role.toLowerCase() : "";

  const tabMap = {
    employee: ["empPatent"],
    admin: ["adminPatent"]
  };

  const allowedTabs = tabMap[role] || [];

  // Hide or show tab panes
  document.querySelectorAll(".tab-pane").forEach(pane => {
    if (allowedTabs.includes(pane.id)) {
      pane.classList.remove("d-none");
      pane.classList.add("show", "active");
    } else {
      pane.classList.add("d-none");
      pane.classList.remove("show", "active");
    }
  });

  // Hide or show tab buttons
  document.querySelectorAll("#patentTabs li").forEach(li => {
    const link = li.querySelector("a");
    const href = link.getAttribute("href").replace("#", "");
    if (allowedTabs.includes(href)) {
      li.classList.remove("d-none");
      link.classList.add("active");
    } else {
      li.classList.add("d-none");
      link.classList.remove("active");
    }
  });

  // Load correct tables
  if (role === "employee") {
    loadEmpPatentTable();
  } else if (role === "admin") {
    loadAdminPatentTable();
  } else {
    console.warn("⚠️ No valid role detected for patent view");
  }
}


document.addEventListener("DOMContentLoaded", () => {
  applyPatentRoleView();
});

// Auto-detect current page and apply correct role view automatically
document.addEventListener("DOMContentLoaded", () => {
  const url = document.URL;

  if (url.includes("courier.html")) applyRoleBasedTabs();
  if (url.includes("amenities.html")) applyAmenityRoleView();
  if (url.includes("meeting.html")) applyMeetingRoleView();
  if (url.includes("patent.html")) applyPatentRoleView();
});

