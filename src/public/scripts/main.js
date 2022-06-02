var randomScalingFactor = function() {
    return Math.round(Math.random() * 100);
  };
  
  var randomData = function () {
    return [
      randomScalingFactor(),
      randomScalingFactor(),
      randomScalingFactor(),
      randomScalingFactor()
    ];
  };
  
  var randomValue = function (data) {
    return Math.max.apply(null, data) * Math.random();
  };
  
  var data = randomData();
  var value = randomValue(data);
  
  var tempConfig = {
    type: 'gauge',
    data: {
      //labels: ['Success', 'Warning', 'Warning', 'Error'],
      datasets: [{
        data: [20,30,40],
        value: 20,
        backgroundColor: ['#baabe4', 'green', 'red'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: 'Temperature'
      },
      layout: {
        padding: {
          bottom: 30
        }
      },
      needle: {
        // Needle circle radius as the percentage of the chart area width
        radiusPercentage: 2,
        // Needle width as the percentage of the chart area width
        widthPercentage: 3.2,
        // Needle length as the percentage of the interval between inner radius (0%) and outer radius (100%) of the arc
        lengthPercentage: 80,
        // The color of the needle
        color: 'rgba(0, 0, 0, 1)'
      },
      valueLabel: {
        formatter: Math.round
      },
      plugins: {
        datalabels: {
          display: true,
          formatter: function (value, context) {
            return '< ' + Math.round(value);
          },
          color: function (context) {
            return context.dataset.backgroundColor;
          },
          //color: 'rgba(255, 255, 255, 1.0)',
          backgroundColor: 'rgba(0, 0, 0, 1.0)',
          borderWidth: 0,
          borderRadius: 5,
          font: {
            weight: 'bold'
          }
        }
      }
    }
  };
  var humiConfig = {
    type: 'gauge',
    data: {
      //labels: ['Success', 'Warning', 'Warning', 'Error'],
      datasets: [{
        data: [35, 65, 100],
        value: 35,
        backgroundColor: ['red', 'orange', 'green'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: 'Humidity'
      },
      layout: {
        padding: {
          bottom: 30
        }
      },
      needle: {
        // Needle circle radius as the percentage of the chart area width
        radiusPercentage: 2,
        // Needle width as the percentage of the chart area width
        widthPercentage: 3.2,
        // Needle length as the percentage of the interval between inner radius (0%) and outer radius (100%) of the arc
        lengthPercentage: 80,
        // The color of the needle
        color: 'rgba(0, 0, 0, 1)'
      },
      valueLabel: {
        formatter: Math.round
      },
      plugins: {
        datalabels: {
          display: true,
          formatter: function (value, context) {
            return '< ' + Math.round(value);
          },
          color: function (context) {
            return context.dataset.backgroundColor;
          },
          //color: 'rgba(255, 255, 255, 1.0)',
          backgroundColor: 'rgba(0, 0, 0, 1.0)',
          borderWidth: 0,
          borderRadius: 5,
          font: {
            weight: 'bold'
          }
        }
      }
    }
  };
  var lightConfig = {
    type: 'gauge',
    data: {
      //labels: ['Success', 'Warning', 'Warning', 'Error'],
      datasets: [{
        data: [200, 300, 1000],
        value: value,
        backgroundColor: ['red', 'orange', 'green'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: 'Brightness'
      },
      layout: {
        padding: {
          bottom: 30
        }
      },
      needle: {
        // Needle circle radius as the percentage of the chart area width
        radiusPercentage: 2,
        // Needle width as the percentage of the chart area width
        widthPercentage: 3.2,
        // Needle length as the percentage of the interval between inner radius (0%) and outer radius (100%) of the arc
        lengthPercentage: 80,
        // The color of the needle
        color: 'rgba(0, 0, 0, 1)'
      },
      valueLabel: {
        formatter: Math.round
      },
      plugins: {
        datalabels: {
          display: true,
          formatter: function (value, context) {
            return '< ' + Math.round(value);
          },
          color: function (context) {
            return context.dataset.backgroundColor;
          },
          //color: 'rgba(255, 255, 255, 1.0)',
          backgroundColor: 'rgba(0, 0, 0, 1.0)',
          borderWidth: 0,
          borderRadius: 5,
          font: {
            weight: 'bold'
          }
        }
      }
    }
  };
  var soilHumiConfig = {
    type: 'gauge',
    data: {
      //labels: ['Success', 'Warning', 'Warning', 'Error'],
      datasets: [{
        data: [35,80,100],
        value: 88,
        backgroundColor: ['red', 'orange', 'green'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: 'Soil Humidity'
      },
      layout: {
        padding: {
          bottom: 30
        }
      },
      needle: {
        // Needle circle radius as the percentage of the chart area width
        radiusPercentage: 2,
        // Needle width as the percentage of the chart area width
        widthPercentage: 3.2,
        // Needle length as the percentage of the interval between inner radius (0%) and outer radius (100%) of the arc
        lengthPercentage: 80,
        // The color of the needle
        color: 'rgba(0, 0, 0, 1)'
      },
      valueLabel: {
        formatter: Math.round
      },
      plugins: {
        datalabels: {
          display: true,
          formatter: function (value, context) {
            return '< ' + Math.round(value);
          },
          color: function (context) {
            return context.dataset.backgroundColor;
          },
          //color: 'rgba(255, 255, 255, 1.0)',
          backgroundColor: 'rgba(0, 0, 0, 1.0)',
          borderWidth: 0,
          borderRadius: 5,
          font: {
            weight: 'bold'
          }
        }
      }
    }
  };
  
  window.onload = function() {
    var ctx1 = document.getElementById('temp-chart').getContext('2d');
    window.myGauge1 = new Chart(ctx1, tempConfig);
    var ctx2 = document.getElementById('humi-chart').getContext('2d');
    window.myGauge2 = new Chart(ctx2, humiConfig);
    var ctx3 = document.getElementById('light-chart').getContext('2d');
    window.myGauge3 = new Chart(ctx3, lightConfig);
    var ctx4 = document.getElementById('soil-humi-chart').getContext('2d');
    window.myGauge4 = new Chart(ctx4, soilHumiConfig);
  };
  
//   document.getElementById('randomizeData').addEventListener('click', function() {
//     soilHumiConfig.data.datasets.forEach(function(dataset) {
//       dataset.data = randomData();
//       dataset.value = randomValue(dataset.data);
//     });
//     window.myGauge4.update();
//   });
  document.addEventListener('DOMContentLoaded', () => {
    // setInterval(() => {
    //     soilHumiConfig.data.datasets.forEach(function(dataset) {
    //         dataset.data = randomData();
    //         dataset.value = randomValue(dataset.data);
    //     });
    //     window.myGauge4.update();
    // }, 3000);
  })