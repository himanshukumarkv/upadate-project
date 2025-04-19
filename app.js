document.getElementById("themeColor").addEventListener("input", (e) => {
  document.documentElement.style.setProperty('--theme-color', e.target.value);
});

document.getElementById("financeForm").addEventListener("submit", function (e) {
  e.preventDefault();
  calculateFinancialHealth();
});

function calculateFinancialHealth() {
  const income = +document.getElementById("income").value;
  const education = +document.getElementById("education").value;
  const houseRent = +document.getElementById("houseRent").value;
  const transportCost = +document.getElementById("transportCost").value;
  const foodCost = +document.getElementById("foodCost").value;
  const extraCashflow = +document.getElementById("extraCashflow").value || 0;

  const debt = extraCashflow < 0 ? -extraCashflow : 0;
  const gain = extraCashflow > 0 ? extraCashflow : 0;

  const totalExpenses = education + houseRent + transportCost + foodCost + debt;
  const netCashflow = income - totalExpenses + gain;

  const savingsRate = ((netCashflow / income) * 100).toFixed(2);
  document.getElementById("savingsBar").value = savingsRate;

  let category = "Poor";
  const entryDate = document.getElementById("entryDate").value || new Date().toLocaleDateString();

  if (netCashflow > 0.3 * income) category = "Excellent";
  else if (netCashflow > 0.1 * income) category = "Good";
  else if (netCashflow > 0) category = "Average";

  document.getElementById("result").textContent =
  `📅 Entry Date: ${entryDate} | 💸 Net Cashflow: ₹${netCashflow.toFixed(2)} | Status: ${category}`;


  localStorage.setItem("financeData", JSON.stringify({
    income, education, houseRent, transportCost, foodCost, extraCashflow
  }));

  drawCharts(income, education, houseRent, transportCost, foodCost, debt, netCashflow);
  showSuggestions(netCashflow);
  showAdvice(income, education, houseRent, transportCost, foodCost, netCashflow);

  document.querySelector(".charts").scrollIntoView({ behavior: "smooth" });
}

function drawCharts(income, education, houseRent, transportCost, foodCost, debt, netCashflow) {
  const expCtx = document.getElementById("expenseChart").getContext("2d");
  const netCtx = document.getElementById("netChart").getContext("2d");

  if (window.expChart) window.expChart.destroy();
  if (window.nChart) window.nChart.destroy();

  window.expChart = new Chart(expCtx, {
    type: "pie",
    data: {
      labels: ["Education", "Rent", "Transport", "Food", "Debt"],
      datasets: [{
        data: [education, houseRent, transportCost, foodCost, debt],
        backgroundColor: ["#007bff", "#ffc107", "#28a745", "#dc3545", "#6c757d"]
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: "📊 Expense Breakdown" }
      }
    }
  });

  window.nChart = new Chart(netCtx, {
    type: "bar",
    data: {
      labels: ["Income", "Net Cashflow"],
      datasets: [{
        label: "₹ Amount",
        data: [income, netCashflow],
        backgroundColor: ["#17a2b8", "#6610f2"]
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: "📈 Income vs Savings" }
      }
    }
  });
}

function showSuggestions(netCashflow) {
  const el = document.getElementById("investmentSuggestions");
  let html = "<h3>📌 Investment Suggestions</h3><ul>";
  if (netCashflow <= 0) {
    html += "<li>Reduce unnecessary expenses to start saving.</li>";
  } else {
    html += "<li><a href='https://groww.in' target='_blank'>Groww</a> - Mutual Funds</li>";
    html += "<li><a href='https://zerodha.com' target='_blank'>Zerodha</a> - Stock Market</li>";
    html += "<li><a href='https://smallcase.com' target='_blank'>Smallcase</a> - Portfolios</li>";
    html += "<li><a href='https://npscra.nsdl.co.in' target='_blank'>NPS</a> - Retirement Plans</li>";
  }
  html += "</ul>";
  el.innerHTML = html;
}

function showAdvice(income, edu, rent, trans, food, cash) {
  const el = document.getElementById("financialAdvice");
  let html = "<h3>💬 Tips to Improve</h3><ul>";
  if (edu / income > 0.2) html += "<li>Cut down on education expenses or get scholarships.</li>";
  if (rent / income > 0.3) html += "<li>Find a more affordable home.</li>";
  if (trans / income > 0.15) html += "<li>Use public transport or cycle.</li>";
  if (food / income > 0.2) html += "<li>Cook at home more often.</li>";
  if (cash < 0) html += "<li>Create a strict monthly budget plan.</li>";
  if (cash > 0) html += "<li>You're saving! Start investing wisely.</li>";
  html += "</ul>";
  el.innerHTML = html;
}

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const entryDate = (document.getElementById("entryDate").value || new Date().toLocaleDateString());
  const result = document.getElementById("result").textContent;
  const suggestions = document.getElementById("investmentSuggestions").innerText;
  const advice = document.getElementById("financialAdvice").innerText;

  // ✅ Remove emojis or non-ASCII characters
  const cleanResult = result.replace(/[^\x00-\x7F]/g, "");
  const cleanSuggestions = suggestions.replace(/[^\x00-\x7F]/g, "");
  const cleanAdvice = advice.replace(/[^\x00-\x7F]/g, "");

  doc.setFont("courier", "normal");
  doc.setFontSize(12);
  doc.text("CashFlow Compass Report", 20, 20);
  doc.text("Entry Date: " + entryDate, 20, 30);
  doc.text(cleanResult, 20, 40);

  doc.text("Investment Suggestions:", 20, 55);
  doc.setFontSize(10);
  doc.text(cleanSuggestions, 20, 63);

  const yStart = 63 + cleanSuggestions.split('\n').length * 5 + 5;
  doc.setFontSize(12);
  doc.text("Financial Advice:", 20, yStart);
  doc.setFontSize(10);
  doc.text(cleanAdvice, 20, yStart + 8);

  // ✅ Add page with charts as image
  html2canvas(document.querySelector(".charts")).then(canvas => {
    const imgData = canvas.toDataURL("image/png");
    doc.addPage();
    doc.addImage(imgData, "PNG", 15, 15, 180, 130);
    doc.save("CashFlow_Report.pdf");
  });
}



function copyResult() {
  const resultText = document.getElementById("result").textContent;
  navigator.clipboard.writeText(resultText).then(() => alert("Result copied to clipboard!"));
}

function resetForm() {
  if (confirm("Reset all inputs and start fresh?")) {
    document.getElementById("financeForm").reset();
    document.getElementById("result").textContent = "";
    document.getElementById("savingsBar").value = 0;
    document.getElementById("investmentSuggestions").innerHTML = "";
    document.getElementById("financialAdvice").innerHTML = "";
    if (window.expChart) window.expChart.destroy();
    if (window.nChart) window.nChart.destroy();
    localStorage.removeItem("financeData");
    document.querySelector(".input-section").scrollIntoView({ behavior: "smooth" });
  }
}

function shareByEmail() {
  const subject = encodeURIComponent("My CashFlow Report");
  const body = encodeURIComponent(document.getElementById("result").textContent);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function exportData() {
  const data = localStorage.getItem("financeData");
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "cashflow_data.json";
  a.click();
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      for (let key in data) {
        if (document.getElementById(key)) {
          document.getElementById(key).value = data[key];
        }
      }
      localStorage.setItem("financeData", JSON.stringify(data));
      calculateFinancialHealth(); // ✅ important
      event.target.value = '';    // ✅ reset file input

    } catch (err) {
      alert("Invalid file format");
    }
  };
  reader.readAsText(file);
}


if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js');
}

window.onload = () => {
  const saved = JSON.parse(localStorage.getItem("financeData"));
  const theme = localStorage.getItem("theme");

  if (saved) {
    for (let key in saved) {
      if (document.getElementById(key)) {
        document.getElementById(key).value = saved[key];
      }
    }
    calculateFinancialHealth();
  }

  // Apply saved theme on load
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    document.getElementById("themeToggle").textContent = "☀️ Light Mode";
  } else {
    document.getElementById("themeToggle").textContent = "🌙 Dark Mode";
  }
};

function toggleTheme() {
  const isDark = document.body.classList.toggle("dark-mode");

  // Save user preference
  localStorage.setItem("theme", isDark ? "dark" : "light");

  // Update button text
  document.getElementById("themeToggle").textContent = isDark
    ? "☀️ Light Mode"
    : "🌙 Dark Mode";
}
