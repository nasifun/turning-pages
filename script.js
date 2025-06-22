const lineCtx = document.getElementById('crowdChart').getContext('2d');

let totalRaised = 0;
let donationData = [];
let volumeData = [];
let labels = [];

const chart = new Chart(lineCtx, {
  type: 'bar',
  data: {
    labels: labels,
    datasets: [
      {
        type: 'line',
        label: 'Total Raised (€)',
        data: donationData,
        borderColor: '#f7931a',
        backgroundColor: 'rgba(247, 147, 26, 0.2)',
        tension: 0.4,
        pointRadius: 3,
        fill: true,
        yAxisID: 'y1',
      },
      {
        type: 'bar',
        label: 'Donation Amount (€)',
        data: volumeData,
        backgroundColor: '#4caf50',
        yAxisID: 'y2',
      }
    ]
  },
  options: {
    responsive: true,
    scales: {
      y1: {
        beginAtZero: true,
        max: 400000,
        position: 'left',
        title: { display: true, text: 'Total Raised (€)', color: '#fff' },
        ticks: { color: '#ccc' },
        grid: { color: '#333' }
      },
      y2: {
        beginAtZero: true,
        position: 'right',
        title: { display: true, text: 'Donation Volume (€)', color: '#fff' },
        ticks: { color: '#ccc' },
        grid: { drawOnChartArea: false }
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

// Fetch live data from your local backend every 10 seconds
async function fetchLiveDonations() {
  try {
    const res = await fetch('http://localhost:3000/donations');
    const data = await res.json();

    const donations = data.donations;
    donationData.length = 0;
    volumeData.length = 0;
    labels.length = 0;

    let cumulative = 0;
    donations.forEach(d => {
      cumulative += d.amount;
      donationData.push(cumulative);
      volumeData.push(d.amount);
      labels.push(new Date(d.date).toLocaleDateString());
    });

    totalRaised = cumulative;
    document.getElementById('live-total').textContent = `€${totalRaised.toLocaleString()}`;

    chart.update();
  } catch (err) {
    console.error('Failed to fetch donations:', err);
  }
}

setInterval(fetchLiveDonations, 10000);
fetchLiveDonations();
