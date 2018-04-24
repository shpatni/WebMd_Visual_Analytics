function getTopQuestions() {
  var data = [{
          "question": "populateTopQuestions populateTopQuestions populateTopQuestions populateTopQuestions populateTopQuestions",
          "answer": "https://stackoverflow.com/questions/17773938/add-a-list-item-through-javascript"
      },
      {
          "question": "populateTopQuestions populateTopQuestions populateTopQuestions populateTopQuestions populateTopQuestions",
          "answer": "https://stackoverflow.com/questions/17773938/add-a-list-item-through-javascript"
      },
      {
          "question": "populateTopQuestions populateTopQuestions populateTopQuestions populateTopQuestions populateTopQuestions",
          "answer": "https://stackoverflow.com/questions/17773938/add-a-list-item-through-javascript"
      },
      {
          "question": "populateTopQuestions populateTopQuestions populateTopQuestions populateTopQuestions populateTopQuestions",
          "answer": "https://stackoverflow.com/questions/17773938/add-a-list-item-through-javascript"
      },
      {
          "question": "populateTopQuestions populateTopQuestions populateTopQuestions populateTopQuestions populateTopQuestions",
          "answer": "https://stackoverflow.com/questions/17773938/add-a-list-item-through-javascript"
      }
  ];
  return data;
}

function populateTopQuestions(data) {
  $('#topQuestionsList').empty();

  var list = document.getElementById("topQuestionsList");
  var length = data.length;
  var i = 0;
  while(i < length) {
    var entry = document.createElement('li');
    entry.style.padding = "5px 0px 5px 0px";
    var link = document.createElement('a');
    link.style.fontSize = "0.8em";
    entry.style.textAlign = "left";
    link.setAttribute("target", "_blank");
    link.setAttribute("href",  data[i]['answer']);
    link.innerHTML = data[i]['question'];
    entry.appendChild(link);
    list.appendChild(entry);
    i++;
  }
}

function drawPieChart(data) {
    $('#topicspie').empty();
    var svg = d3.select("#topicspie"),
        width = +svg.attr("width"),
        height = +svg.attr("height"),
        radius = Math.min(width, height) / 2,
        g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


    var color = d3.scaleOrdinal(d3.schemeCategory20c);

    var pie = d3.pie()
        .sort(null)
        .value(function(d) {
            return d.topicCount;
        });

    var path = d3.arc()
        .outerRadius(radius - 10)
        .innerRadius(0);

    var label = d3.arc()
        .outerRadius(radius - 40)
        .innerRadius(radius - 40);


    var arc = g.selectAll(".arc")
        .data(pie(data))
        .enter().append("g")
        .attr("margin", "auto")
        .attr("class", "arc");

    arc.append("path")
        .attr("d", path)
        .attr("fill", function(d) {
            return color(d.data.topic);
        })
        .on("click", function(d) {
            selectedTopic = d.data.topic;
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
                var margin = {top: 100, right: 100, bottom: 100, left: 100},
                	width = Math.min(550, window.innerWidth - 10) - margin.left - margin.right,
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
                            "lengthChange": false,
                            data: result,
							"destroy": true,
							columns: [
								{ data: 'questionTitle' },
							]
		        });});
        });

    // var pieData = pie(data);
    // var pieAngle = pieData.map(function (p) {
    //     return (p.startAngle + p.endAngle) / 2 / Math.PI * 180;
    // });
    // const innerArc = d3.svg.arc().innerRadius(radius - 0).outerRadius(radius - 0);

    arc.append("text")
        .attr("transform", function(d) {
            return "translate(" + label.centroid(d) + "),rotate(60)";
        })
        // .style('text-anchor', function (d, i) { //important
        //   const p = pieData[i];
        //   const angle = pieAngle[i];
        //   if (angle > 0 && angle <= 180) { //text-anchor depends on the angle
        //     return "end"
        //   }
        //   return "start"
        // })
        // .attr("transform", function (d, i) { //important
        //   const p = pieData[i];
        //   let angle = pieAngle[i];
        //   if (angle > 0 && angle <= 180) { //rotation depends on the angle
        //     angle = angle - 180;
        //   }
        //   return "translate(${innerArc.centroid(p)}) rotate(${angle+90} 0 0)";
        // })
        .attr("dy", "0.35em")
        .text(function(d) {
            return d.data.topic;
        })
        .style('font-size', "15px").style("font-family","Helvetica");
}
