var chartColors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yell: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(231,233,237)'
  };
  
  // used to generate random data point values
  var randomScalingFactor = function() {
    return (Math.random() > 0.5 ? 1.0 : 1.0) * Math.round(Math.random() * 100);
  };
  
  // decimal rounding algorithm
  // see: https://plnkr.co/edit/uau8BlS1cqbvWPCHJeOy?p=preview
  var roundNumber = function (num, scale) {
    var number = Math.round(num * Math.pow(10, scale)) / Math.pow(10, scale);
    if(num - number > 0) {
      return (number + Math.floor(2 * Math.round((num - number) * Math.pow(10, (scale + 1))) / 10) / Math.pow(10, scale));
    } else {
      return number;
    }
  };
  
  // save the original line element so we can still call it's 
  // draw method after we build the linear gradient
  var origLineElement = Chart.elements.Line;
  
  // define a new line draw method so that we can build a linear gradient
  // based on the position of each point
  Chart.elements.Line = Chart.Element.extend({
    draw: function() {
      var vm = this._view;
      var backgroundColors = this._chart.controller.data.datasets[this._datasetIndex].backgroundColor;
      var points = this._children;
      var ctx = this._chart.ctx;
      var minX = points[0]._model.x;
      var maxX = points[points.length - 1]._model.x;
      var linearGradient = ctx.createLinearGradient(minX, 0, maxX, 0);
  
      // iterate over each point to build the gradient
      points.forEach(function(point, i) {
        // `addColorStop` expects a number between 0 and 1, so we
        // have to normalize the x position of each point between 0 and 1
        // and round to make sure the positioning isn't too percise 
        // (otherwise it won't line up with the point position)
        var colorStopPosition = roundNumber((point._model.x - minX) / (maxX - minX), 2);
  
        // special case for the first color stop
        if (i === 0) {
          linearGradient.addColorStop(0, backgroundColors[i]);
        } else {
          // only add a color stop if the color is different
          if (backgroundColors[i] !== backgroundColors[i-1]) {
            // add a color stop for the prev color and for the new color at the same location
            // this gives a solid color gradient instead of a gradient that fades to the next color
            linearGradient.addColorStop(colorStopPosition, backgroundColors[i - 1]);
            linearGradient.addColorStop(colorStopPosition, backgroundColors[i]);
          }
        }
      });
  
      // save the linear gradient in background color property
      // since this is what is used for ctx.fillStyle when the fill is rendered
      vm.backgroundColor = linearGradient;
  
      // now draw the lines (using the original draw method)
      origLineElement.prototype.draw.apply(this);
    }               
  });
  
  // we have to overwrite the datasetElementType property in the line controller
  // because it is set before we can extend the line element (this ensures that 
  // the line element used by the chart is the one that we extended above)
  Chart.controllers.line = Chart.controllers.line.extend({
    datasetElementType: Chart.elements.Line,
  });
  
  // the labels used by the chart
  var labels = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  
  // the line chart point data
  var lineData = [randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), randomScalingFactor(), ];
  
  // colors used as the point background colors as well as the fill colors
  var fillColors = [chartColors.green,  chartColors.green, chartColors.red, chartColors.red, chartColors.red, chartColors.red, chartColors.blue, chartColors.blue, chartColors.blue, chartColors.purple, chartColors.purple, chartColors.purple,];
  
  // get the canvas context and draw the chart
  var ctx = document.getElementById("canvas").getContext("2d");
  var myLine = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: "My Dataset",
        backgroundColor: fillColors, // now we can pass in an array of colors (before it was only 1 color)
        borderColor: chartColors.yellow,
        pointBackgroundColor: fillColors,
        fill: true,
        data: lineData,
      }]
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text:'Graph - Campaign'
      },
      legend: {
        display: false,
      },
      scales: {
        xAxes: [{
          gridLines: {
            offsetGridLines: true
          },
        }]
      }
    }
  });