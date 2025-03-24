// Chart.js setup
const ctx = document.getElementById('speedChart').getContext('2d');
const speedChart = new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Download', 'Upload'],
    datasets: [{
      label: 'Speed (Mbps)',
      data: [0, 0],
      backgroundColor: ['#4caf50', '#2196f3']
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 100
      }
    }
  }
});

// Gauge.js setup
const gaugeOpts = {
  angle: 0,
  lineWidth: 0.3,
  radiusScale: 0.9,
  pointer: {
    length: 0.6,
    strokeWidth: 0.035,
    color: '#fff'
  },
  limitMax: false,
  limitMin: false,
  highDpiSupport: true,
  staticZones: [
    {strokeStyle: "#4caf50", min: 0, max: 20},
    {strokeStyle: "#ffc107", min: 20, max: 50},
    {strokeStyle: "#f44336", min: 50, max: 100}
  ],
  staticLabels: {
    font: "12px sans-serif",
    labels: [0, 10, 20, 50, 100],
    color: "#fff",
    fractionDigits: 0
  },
  renderTicks: {
    divisions: 5,
    divWidth: 1.1,
    divLength: 0.7,
    divColor: "#fff"
  }
};

const downloadGauge = new Gauge(document.getElementById("downloadGauge")).setOptions(gaugeOpts);
downloadGauge.maxValue = 100;
downloadGauge.setMinValue(0);
downloadGauge.animationSpeed = 32;
downloadGauge.set(0);

const uploadGauge = new Gauge(document.getElementById("uploadGauge")).setOptions(gaugeOpts);
uploadGauge.maxValue = 100;
uploadGauge.setMinValue(0);
uploadGauge.animationSpeed = 32;
uploadGauge.set(0);

// Theme switching
const themeSelector = document.getElementById('themeSelector');
themeSelector.addEventListener('change', () => {
  document.body.className = `${themeSelector.value}-theme`;
});

// Speed Test
function startSpeedTest() {
  const spinner = document.querySelector('.spinner');
  const result = document.getElementById('result');
  spinner.style.display = 'block';
  result.textContent = '';

  // Download Test
  const downloadTest = new Promise((resolve) => {
    const image = new Image();
    const imageSizeInBytes = 5 * 1024 * 1024; // ~5 MB
    const startTime = new Date().getTime();
    image.onload = () => {
      const endTime = new Date().getTime();
      const duration = (endTime - startTime) / 1000;
      const bitsLoaded = imageSizeInBytes * 8;
      const speedMbps = (bitsLoaded / duration / (1024 * 1024)).toFixed(2);
      resolve(Number(speedMbps));
    };
    image.onerror = () => resolve(0); // If fails, return 0
    image.src = "https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg?nnn=" + Math.random();
  });

  // Upload Test
  const uploadTest = new Promise((resolve) => {
    const dataSize = 2 * 1024 * 1024; // 2 MB
    const data = new Blob([new Uint8Array(dataSize)]);
    const startTime = new Date().getTime();
    fetch("https://httpbin.org/post", {
      method: "POST",
      body: data,
    }).then(() => {
      const endTime = new Date().getTime();
      const duration = (endTime - startTime) / 1000;
      const bitsUploaded = dataSize * 8;
      const speedMbps = (bitsUploaded / duration / (1024 * 1024)).toFixed(2);
      resolve(Number(speedMbps));
    }).catch(() => resolve(0));
  });

  // Run both
  Promise.all([downloadTest, uploadTest]).then(([downloadSpeed, uploadSpeed]) => {
    spinner.style.display = 'none';
    result.textContent = `Download Speed: ${downloadSpeed} Mbps\nUpload Speed: ${uploadSpeed} Mbps`;

    speedChart.data.datasets[0].data = [downloadSpeed, uploadSpeed];
    speedChart.update();

    downloadGauge.set(downloadSpeed);
    uploadGauge.set(uploadSpeed);
  });
}
