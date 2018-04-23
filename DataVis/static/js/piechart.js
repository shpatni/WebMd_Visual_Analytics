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
                var color = d3.scaleOrdinal()
                	.range(["#EDC951","#CC333F","#00A0B0"]);
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


    arc.append("text")
        .attr("transform", function(d) {
            return "translate(" + label.centroid(d) + "),rotate(20)";
        })
        .attr("dy", "0.35em")
        .text(function(d) {
            return d.data.topic;
        })
        .style('font-size', "15px");
}
