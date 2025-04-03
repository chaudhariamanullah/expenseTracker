let selectTag = document.querySelector("#chart-select");

let dailyChartInstance, weeklyChartInstance, monthlyChartInstance;

let dTotal = []
let dDate = []

let wYear = []
let wWeek = []
let wTotal = []

let mYear = []
let mMonth = []
let mTotal = []

for ( day of daily){
    dTotal.push(day.Total) 
    dDate.push(day.date.slice(0,10));
}

for ( week of weekly){
    wYear.push(week.wYear);

    let startDate = new Date(week.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    let endDate = new Date(week.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    wWeek.push(`${startDate} - ${endDate}`); 

    wTotal.push(week.totalExpense);
}

for ( month of monthly){
    mYear.push(month.year); 
    let monthName = new Date(month.year, month.month - 1).toLocaleString('en-US', { month: 'long' });
    
    mMonth.push(`${monthName} ${month.year}`);

    mTotal.push(month.totalExpense);
}

window.addEventListener("DOMContentLoaded", () => {
  selectTag.value = "daily";
  document.querySelector("#daily").style.display = "block";
  document.querySelector("#weekly").style.display = "none";
  document.querySelector("#monthly").style.display = "none";
  dailyChart(); 
});

selectTag.addEventListener("change",()=>{
    let graph = selectTag.value;

    if ( graph === "daily"){
        document.querySelector("#daily").style.display = "block";
        document.querySelector("#weekly").style.display = "none";
        document.querySelector("#monthly").style.display = "none";
        dailyChart();
    } 
    
    if ( graph === "weekly"){
        document.querySelector("#weekly").style.display = "block";
        document.querySelector("#daily").style.display = "none";
        document.querySelector("#monthly").style.display = "none";
        weeklyChart();
    }
    
    if (graph === "yearly"){
        document.querySelector("#monthly").style.display = "block";
        document.querySelector("#daily").style.display = "none";
        document.querySelector("#weekly").style.display = "none";   
        yearlyChart();
    }

});

function dailyChart(){
  const ctx = document.getElementById('dailyChart').getContext('2d');
  if (dailyChartInstance) dailyChartInstance.destroy();
  dailyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dDate,
      datasets: [
        {
          label: 'Daily Expenses',
          data: dTotal,
          backgroundColor: 'rgba(71, 125, 233, 0.6)'
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true }
      }
    }
  });
}

function weeklyChart(){
  const ctx = document.getElementById('weeklyChart').getContext('2d');
  if (weeklyChartInstance) weeklyChartInstance.destroy();
  weeklyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: wWeek,
      datasets: [
        {
          label: 'Weekly Expenses',
          data: wTotal,
          backgroundColor: 'rgba(36, 164, 30, 0.6)'
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true }
      }
    }
  });
}

function yearlyChart(){
  const ctx = document.getElementById('monthlyChart').getContext('2d');
  if (monthlyChartInstance) monthlyChartInstance.destroy();
  monthlyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: mMonth,
      datasets: [
        {
          label: 'Monthly Expenses',
          data: mTotal,
          backgroundColor: 'rgba(209, 28, 28, 0.6)'
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true }
      }
    }
  });
}






