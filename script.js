const ctx = document.getElementById('crowdChart').getContext('2d');

let total = 0;
let labels = ['Start'];
let data = [0];

const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: labels,
    datasets: [{
      label: 'Simulated Donations (€)',
      data: data,
      borderColor: '#f7931a',
      backgroundColor: 'rgba(247, 147, 26, 0.2)',
      tension: 0.4,
      pointRadius: 3,
      fill: true,
    }]
  },
  options: {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 400000,
        ticks: { color: '#ccc' },
        grid: { color: '#333' }
      },
      x: {
        ticks: { color: '#ccc' },
        grid: { color: '#333' }
      }
    },
    plugins: {
      legend: {
        labels: { color: '#fff' }
      }
    }
  }
});

// 🔁 Auto-simulate every 5 seconds
setInterval(() => {
  const donation = Math.floor(Math.random() * 5000) + 100; // €100–€5000
  total += donation;
  labels.push(`+€${donation}`);
  data.push(total);
  chart.update();
}, 5000); // 5000ms = 5 seconds
