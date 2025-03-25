let chart;

function login() {
  const username = document.getElementById("usernameInput").value.trim();
  if (username) {
    localStorage.setItem("user", username);
    showDashboard();
  }
}

function logout() {
  localStorage.removeItem("user");
  location.reload();
}

function showDashboard() {
  document.getElementById("loginView").classList.add("hidden");
  document.getElementById("dashboardView").classList.remove("hidden");
  document.getElementById("usernameDisplay").textContent = localStorage.getItem("user");

  const savedTheme = localStorage.getItem("theme") || "blue";
  applyTheme(savedTheme);
  document.getElementById("themeSelect").value = savedTheme;
  loadHistory();
  initChart();
}

function applyTheme(theme) {
  document.body.className = theme;
  localStorage.setItem("theme", theme);
}

async function startSpeedTest() {
  document.getElementById("downloadResult").textContent = "Testing...";
  document.getElementById("uploadResult").textContent = "Testing...";

  const download = await testDownloadSpeed();
  const upload = await testUploadSpeed();

  document.getElementById("downloadResult").textContent = `${download} Mbps`;
  document.getElementById("uploadResult").textContent = `${upload} Mbps`;

  updateChart(download, upload);
  saveResult(download, upload);
}

function testDownloadSpeed() {
  return new Promise((resolve) => {
    const image = new Image();
    const startTime = Date.now();
    const size = 5 * 1024 * 1024;

    image.onload = () => {
      const duration = (Date.now() - startTime) / 1000;
      const speed = ((size * 8) / duration / 1024 / 1024).toFixed(2);
      resolve(speed);
    };

    image.onerror = () => resolve("0");
    image.src = `https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg?${Math.random()}`;
  });
}

async function testUploadSpeed() {
  const size = 2 * 1024 * 1024;
  const data = new Blob([new Uint8Array(size)]);
  const start = Date.now();
  await fetch("https://httpbin.org/post", { method: "POST", body: data });
  const duration = (Date.now() - start) / 1000;
  const speed = ((size * 8) / duration / 1024 / 1024).toFixed(2);
  return speed;
}

function saveResult(download, upload) {
  const record = { date: new Date().toLocaleString(), download, upload };
  let history = JSON.parse(localStorage.getItem("speedHistory")) || [];
  history.unshift(record);
  if (history.length > 10) history = history.slice(0, 10);
  localStorage.setItem("speedHistory", JSON.stringify(history));
  loadHistory();
}

function loadHistory() {
  const table = document.querySelector("#historyTable tbody");
  const avgEl = document.getElementById("avgDownload");
  table.innerHTML = "";
  const history = JSON.parse(localStorage.getItem("speedHistory")) || [];
  let total = 0;

  history.forEach((r) => {
    total += parseFloat(r.download);
    table.innerHTML += `<tr><td>${r.date}</td><td>${r.download} Mbps</td><td>${r.upload} Mbps</td></tr>`;
  });

  avgEl.textContent = history.length ? (total / history.length).toFixed(2) : "-";
}

function clearHistory() {
  localStorage.removeItem("speedHistory");
  loadHistory();
}

function initChart() {
  const ctx = document.getElementById("speedChart").getContext("2d");
  chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Download", "Upload"],
      datasets: [
        {
          label: "Speed (Mbps)",
          data: [0, 0],
          backgroundColor: ["#4bc0c0", "#ff6384"],
        },
      ],
    },
    options: {
      scales: {
        y: { beginAtZero: true, suggestedMax: 100 },
      },
    },
  });
}

function updateChart(download, upload) {
  chart.data.datasets[0].data = [download, upload];
  chart.update();
}

window.onload = () => {
  const user = localStorage.getItem("user");
  if (user) showDashboard();
  const btn = document.getElementById("runTestBtn");
  if (btn) btn.addEventListener("click", startSpeedTest);
};
