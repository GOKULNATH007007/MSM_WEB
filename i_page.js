let activeIndex = null;

// Load and display complaint buttons
function loadComplaints() {
  const complaints = JSON.parse(localStorage.getItem("maintenanceData") || "[]");
  const buttonsDiv = document.getElementById("complaintButtons");
  const title = document.getElementById("pageTitle");
  buttonsDiv.innerHTML = "";

  if (complaints.length > 0) {
    title.style.display = "block";
    buttonsDiv.style.display = "block";

    complaints.forEach((c, index) => {
      const btn = document.createElement("button");
      btn.className = "complaint-btn";
      btn.innerText = `Complaint No: ${c.id}`;
      if (c.finished && !c.confirmed) btn.classList.add("yellow");
      btn.onclick = () => showComplaintPopup(index);
      buttonsDiv.appendChild(btn);
    });
  } else {
    title.style.display = "none";
    buttonsDiv.style.display = "none";
  }
}

// Show complaint details popup
function showComplaintPopup(index) {
  activeIndex = index;
  const complaints = JSON.parse(localStorage.getItem("maintenanceData") || "[]");
  const c = complaints[index];
  const popup = document.getElementById("complaintPopup");

  popup.innerHTML = `
    <table class="complaint-table">
      <tr><td><strong>Machine:</strong></td><td>${c.machine}</td></tr>
      <tr><td><strong>Owner:</strong></td><td>${c.owner}</td></tr>
      <tr><td><strong>Machine Number:</strong></td><td>${c.machineNumber}</td></tr>
      <tr><td><strong>Section:</strong></td><td>${c.section}</td></tr>
      <tr><td><strong>Defect:</strong></td><td>${c.defect}</td></tr>
    </table>
    <div class="popup-buttons">
      ${c.finished && !c.confirmed ? `<button class="okay-btn" onclick="markAsConfirmed(${c.id})">OKAY</button>` : ''}
      <button class="close-btn" onclick="closePopup()">Close</button>
    </div>
  `;
}

// Close popup
function closePopup() {
  activeIndex = null;
  document.getElementById("complaintPopup").innerHTML = "";
  loadComplaints();
}

// Mark complaint as confirmed (from yellow state)
function markAsConfirmed(complaintId) {
  let complaints = JSON.parse(localStorage.getItem("maintenanceData") || "[]");
  complaints = complaints.filter(c => c.id !== complaintId);
  localStorage.setItem("maintenanceData", JSON.stringify(complaints));

  // Notify M-PAGE to remove it
  if (window.opener) {
    window.opener.postMessage({ action: 'removeComplaint', id: complaintId }, '*');
  }

  closePopup();
}

// Send complaint function
function sendComplaint() {
  const machine = document.getElementById("machine").value;
  const owner = document.getElementById("owner").value;
  const machineNumber = document.getElementById("machineNumber").value;
  const section = document.getElementById("section").value;
  const defect = document.getElementById("defect").value;

  if (!machine || !owner || !machineNumber || !section || !defect) {
    alert("Please fill in all fields");
    return;
  }

  const complaints = JSON.parse(localStorage.getItem("maintenanceData") || "[]");
  const newComplaint = {
    id: Date.now(),
    machine, owner, machineNumber, section, defect,
    sent: true,
    finished: false,
    confirmed: false
  };

  complaints.push(newComplaint);
  localStorage.setItem("maintenanceData", JSON.stringify(complaints));
  alert("Complaint Sent Successfully");

  // Clear form
  document.getElementById("machine").value = "";
  document.getElementById("owner").value = "";
  document.getElementById("machineNumber").value = "";
  document.getElementById("section").value = "";
  document.getElementById("defect").value = "";

  loadComplaints();
}

// Listen for finish signal from M-page
window.addEventListener("message", function (event) {
  if (event.data.action === "updateComplaints") {
    loadComplaints();
  }
});

loadComplaints();
