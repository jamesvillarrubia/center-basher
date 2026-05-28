document.addEventListener("DOMContentLoaded", function () {
  // Try to load real ANES data; fall back to synthetic if unavailable
  fetch("data/voters.json")
    .then(r => r.ok ? r.json() : Promise.reject("not found"))
    .then(realData => {
      console.log(`Loaded real ANES data: ${realData.length} respondents`);
      init(realData);
    })
    .catch(() => {
      console.warn("Real data unavailable — using synthetic placeholder.");
      init(window.VOTERS);
    });

  function init(voters) {
    drawChart1D(voters);
    drawPlaybook();
    drawChart2D(voters);
    drawChartBridge(voters);
    drawChartSwing(voters);
    drawChartMoveable(voters);
    drawChartJobs();
    drawTurnoutLevers();
    drawChartSignal(voters);
    drawChartDisaffected();
    drawChartCandidates(window.CANDIDATES);
    drawStrategyMatrix();
    drawChartGravity(voters, window.CANDIDATES);
    drawChartConsolidation();
  }
});
