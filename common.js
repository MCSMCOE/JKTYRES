// Shared functions (login, sidebar, user info)
const LS_KEY = "campus_user";

function saveUser(user){ localStorage.setItem(LS_KEY, JSON.stringify(user)); }
function loadUser(){ try { return JSON.parse(localStorage.getItem(LS_KEY)); } catch { return null; } }
function clearUser(){ localStorage.removeItem(LS_KEY); }

function doLogin(){
  const name = document.getElementById("lgName").value;
  const email = document.getElementById("lgEmail").value;
  const dept = document.getElementById("lgDept").value;
  if(!name){ alert("Enter name"); return; }
  saveUser({name,email,department:dept});
  window.location.href = "halls.html";
}

function renderSidebar(activePage){
  const user = loadUser();
  if(!user){ window.location.href="login.html"; return; }
  document.getElementById("welcomeBar").innerHTML = `Welcome, <b>${user.name}</b>`;
  document.getElementById("sidebar").innerHTML = `
    <div class="usercard">
      <div><b>${user.name}</b></div>
      <div>${user.department}</div>
      <div>${user.email}</div>
    </div>
    <ul class="menu">
      <li><a href="halls.html" class="${activePage==='halls'?'active':''}">🏫 Halls</a></li>
      <li><a href="transport.html" class="${activePage==='transport'?'active':''}">🚌 Transport</a></li>
      <li><a href="leave.html" class="${activePage==='leave'?'active':''}">📅 Leave</a></li>
    </ul>
    <button onclick="logout()">Logout</button>
  `;
}

function logout(){ clearUser(); window.location.href="login.html"; }
