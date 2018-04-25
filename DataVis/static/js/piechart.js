function drawPieChart(data) {
  d3.select("#topicspie").html("");

  var matchdata = data

  var players = matchdata.map(function(t) {
    return t.topic
  });

  var margin = {top: 45, right: 5, bottom: 50, left: 105};

  var fullWidth = 500;
  var fullHeight = 400;
  // the width and height values will be used in the ranges of our scales
  var width = fullWidth - margin.right - margin.left;
  var height = fullHeight - margin.top - margin.bottom;
  var svg = d3.select('#topicspie').append('svg')
    .style('width', fullWidth)
    .style('height', fullHeight)
    .style('margin','0 auto')
    .style('margin-top','70')
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  var playerScale = d3.scaleBand()
    .domain(players)
    .range([0, height])
    .paddingInner(0.4);

  var bandwidth = playerScale.bandwidth();

  var maxValue = d3.max(matchdata, function(d) {return d.topicCount; });

  var valueScale = d3.scaleLinear()
    .domain([0, maxValue])
    .range([0, width])
    .nice();

  var xAxis = d3.axisBottom(valueScale);
  var yAxis = d3.axisLeft(playerScale);

  var xAxisEle =svg.append('g')
    .classed('x axis', true)
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis);

  var yAxisEle = svg.append('g')
    .classed('y axis', true)
    .call(yAxis);

  var yText = yAxisEle.append('text')
    .attr('transform', 'rotate(-90)translate(-' + height/2 + ',0)')
    .style('text-anchor', 'middle')
    .style('fill', 'black')
    .attr('dy', '-9.5em')
    .style('font-size', 20)
    .text('Topics');

  var xTextValue = "No. of Questions";

  var xText = xAxisEle.append('text')
    .attr('transform', 'translate(+' + width/2 + ','+height+')')
    .style('text-anchor', 'middle')
    .style('fill', 'black')
    .attr('dy','-27em')
    .style('z-index','1000')
    .style('font-size', 20)
    .text(xTextValue);

  var barHolder = svg.append('g')
    .classed('bar-holder', true);

  barHolder.selectAll('rect.bar')
      .data(matchdata)
    .enter().append('rect')
      .classed('bar', true)
      .attr('x', 0)
      .attr('width', function(d) {
        return valueScale(d.topicCount);
      })
      .attr('y', function(d) {
        return playerScale(d.topic);
      })
      .attr('height', bandwidth)
      .attr('class','bars')
      .on('mouseover', function(d,i) {
        d3.select(this).style("fill", 'skyblue');
      })
      .on('mouseout', function(d,i) {
        d3.select(this).style("fill", 'steelblue');
      })
      .on('click', function(d,i) {
        console.log(d.topic);
            selectedTopic = d.topic;
            selectedTopicId = nameIdMapping[selectedTopic];
            //var questionsData = getTopQuestions();
            //populateTopQuestions(questionsData);
            for(var index=0; index < table.data().length; index++) {
              if(table.data()[index]['topicName'] == selectedTopic) {
                $(".selected").removeClass("selected");
                pageNum = Math.floor(index/table.page.len());
                table.search( '' ).draw();
                table.order( [ 0, 'asc' ] ).draw();
                table.page(pageNum).draw(false);
                offset = index - pageNum*table.page.len();
                tableRow = document.getElementsByTagName("tbody")[0]['children'][offset];
                tableRow.classList.add("selected");
              }
            }

            $.getJSON("static/data/topJobLocationAnsweringQuesByTopic.json", function(result){
        				var dataBubbleChart = {
        				  "name": "workplace",
        				  "children": result[selectedTopicId]
        				};
        				createBubbleChart('workplace', dataBubbleChart);
      			});
            $.getJSON("static/data/topMemberJobAnsweringQuestionByTopic.json", function(result){
                var dataBubbleChart1 = {
                  "name": "jobtype",
                  "children": result[selectedTopicId]
                };
                createBubbleChart('jobtype', dataBubbleChart1);
      			});
            $.getJSON("static/data/similarity.json", function(result){
                var color = d3.scaleOrdinal().range(["#e6b800", "#cc3300"])
                var margin = {top: 100, right: 100, bottom: 100, left: 80},
                	width = Math.min(520, window.innerWidth - 10) - margin.left - margin.right,
                	height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);
        				var radarChartOptions = {
        					w: width,
        					h: height,
        					margin: margin,
        					maxValue: 0.5,
        					levels: 5,
        					roundStrokes: true,
        					color: color
        				};
        				data = [result[selectedTopicId]]
        				//Call function to draw the Radar chart
        				RadarChart(".radarChart", data, radarChartOptions);
      			});
			$.getJSON("questionsByTopic/?topicId="+selectedTopicId, function(result){
						table1 = $('#questionTable').DataTable({
                            searching: true,
                            paging: true,
                            "pageLength": 5,
                            "pagingType": "simple",
                            "lengthChange": false,
                            data: result,
							"destroy": true,
							columns: [
								{ data: 'questionTitle' },
							]
		        });
          });
      });
}
