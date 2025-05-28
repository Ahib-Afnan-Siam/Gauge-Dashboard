const svg = d3.select("#gauge");
const width = 400, height = 300, radius = 120;
const centerX = width / 2, centerY = height * 0.75;

const group = svg.append("g")
  .attr("transform", `translate(${centerX}, ${centerY})`);

const arc = d3.arc()
  .innerRadius(radius - 20)
  .outerRadius(radius)
  .startAngle(d => d.startAngle)
  .endAngle(d => d.endAngle);

const ranges = [
  { startAngle: (-3 * Math.PI / 4), endAngle: (-Math.PI / 2), color: "red", label: "Low" },
  { startAngle: (-Math.PI / 2), endAngle: (Math.PI / 6), color: "orange", label: "Medium" },
  { startAngle: (Math.PI / 6), endAngle: (3 * Math.PI / 4), color: "blue", label: "High" }
];

// Draw arcs with tooltips
group.selectAll("path")
  .data(ranges)
  .enter()
  .append("path")
  .attr("d", arc)
  .attr("fill", d => d.color)
  .attr("stroke", "#999")
  .attr("stroke-width", 1)
  .append("title")
  .text(d => `Category: ${d.label}`);

// Add ticks
const tickScale = d3.scaleLinear().domain([0, 10000000]).range([-135, 135]);
const tickValues = [1000000, 3000000, 5000000, 7000000, 9000000, 10000000];

tickValues.forEach(val => {
  const angle = tickScale(val) * Math.PI / 180;
  const x = Math.cos(angle) * (radius + 10);
  const y = Math.sin(angle) * (radius + 10);

  group.append("text")
    .attr("x", x)
    .attr("y", y)
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "middle")
    .attr("font-size", "10px")
    .text(`${(val / 1000000).toFixed(1)}m`);
});

// Draw needle
const needle = group.append("line")
  .attr("x1", 0)
  .attr("y1", 0)
  .attr("x2", 0)
  .attr("y2", -radius + 20)
  .attr("stroke", "black")
  .attr("stroke-width", 4);

function angleForValue(value) {
  const angleScale = d3.scaleLinear()
    .domain([0, 10000000])
    .range([-135, 135]); // degrees
  return angleScale(value);
}

function updateGauge(value) {
  const angle = angleForValue(value);

  needle.transition()
    .duration(800)
    .attr("transform", `rotate(${angle})`);

  // ✅ Final Correct Status Logic
  let status;
  if (value <= 3000000) {
    status = "Low";
  } else if (value > 3000000 && value < 7000000) {
    status = "Medium";
  } else if (value >= 7000000) {
    status = "High";
  }

  document.getElementById("status").innerHTML =
    `Status: <span class="badge">${status}</span>`;
  document.getElementById("value").innerText =
    value >= 1000000 ? `${(value / 1000000).toFixed(1)}m` : value.toLocaleString();
}

// Set initial display
document.getElementById("value").innerText = "0";
document.getElementById("status").innerHTML =
  `Status: <span class="badge">Select a month to view the status</span>`;

// Load monthly data
fetch("data.json")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("month-buttons");
    Object.entries(data).forEach(([month, val]) => {
      const btn = document.createElement("button");
      btn.innerText = month;
      btn.onclick = () => updateGauge(val);
      container.appendChild(btn);
    });
  });
