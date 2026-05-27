document.addEventListener("DOMContentLoaded", function () {
  drawChart1D(window.VOTERS);
  drawChart2D(window.VOTERS);
  drawChartSwing(window.VOTERS);
  drawChartCandidates(window.CANDIDATES);
  drawChartGravity(window.VOTERS, window.CANDIDATES);
});
