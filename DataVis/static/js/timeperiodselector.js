// *** THE DATA *** //
var i = 0;

function getDataset() {
    var arr = [],
        startDate = moment("2010-03-25"),
        endDate = moment("2014-12-12");
    for (; startDate < endDate;) {
        arr.push({
            date: startDate.format("YYYY-MM-DD"),
        });
        startDate = startDate.add(Math.ceil(Math.random() * 1) + 2, "days");
    }
    return arr;
}
var dataset = getDataset();

// *** SETTINGS *** //
function getSettings() {
    var margins = {
        top: 10,
        bottom: 40,
        left: 50,
        right: 50
    };
    var dim = {
        width: 400,
        height: 400
    };

    return {
        margins: margins,
        dim: dim
    };
}
var settings = getSettings();

var updateChart = function(settings) {
    var svg = svg = d3.select("#topicspie");

    var callback = function(process, dstart, dend) {
        if (process === 'dragend') {
            svg.attr('opacity', 1);
            startYear = dstart.value._d.getFullYear();
            startMonth = dstart.value._d.getMonth()+1;
            startDate = dstart.value._d.getDate();
            start = startYear+"-"+startMonth+"-"+startDate

            endYear = dend.value._d.getFullYear();
            endMonth = dend.value._d.getMonth()+1;
            endDate = dend.value._d.getDate();
            end = endYear+"-"+endMonth+"-"+endDate

            dataURL = "/pie_chart_data/?start_date="+start+"&end_date="+end;

            $.ajax({
          		url:dataURL,
          		type:"GET",
          	}).done(function(response){
          		//check for success
              drawPieChart(response);
          	});
        } else if (process === 'dragstart') {
            svg.attr('opacity', 0.5);
        }
    };

    return callback;
}(settings);

function renderSlider(dataset, settings, callback) {
    var RangeSlider = function(svg, width, radius, color, translater, callback) {
        var self = this,
            elements = {
                min: {
                    value: 0
                },
                max: {
                    value: width
                }
            },
            settings = {
                min: 0,
                max: width,
                radius: radius,
                offset: Math.floor(radius / 2),
                color: color,
                opacity: {
                    full: 1.0,
                    medium: 0.8,
                    half: 0.5,
                    light: 0.3
                },
                translater: translater,
                callback: callback
            };

        //build the bar
        elements.$bar = svg.append('rect')
            .attr("x", settings.offset)
            .attr("width", settings.max - (settings.offset * 2))
            .attr("y", settings.offset)
            .attr("height", settings.radius)
            .attr("fill", settings.color)
            .attr("fill-opacity", settings.opacity.half);

        //build the handles
        elements.$min = svg.append('ellipse')
            .style('cursor', 'pointer')
            .attr("cx", settings.min)
            .attr("cy", settings.radius)
            .attr("rx", settings.radius)
            .attr("ry", settings.radius)
            .attr("fill", settings.color)
            .attr("fill-opacity", settings.opacity.medium);

        elements.$minText = svg.append('text')
            .attr("x", settings.min)
            .attr("y", settings.radius * 3 + settings.offset)
            .attr("fill", "#004d66").style("font-size", "13px").style("font-weight","bold").style("font-family","Georgia")
            .attr('fill-opacity', settings.opacity.medium)
            .attr('text-anchor', 'middle')
            .text(settings.translater.apply(self, [settings.min]).text);

        elements.$max = svg.append('ellipse')
            .style('cursor', 'pointer')
            .attr("cx", settings.max)
            .attr("cy", settings.radius)
            .attr("rx", settings.radius)
            .attr("ry", settings.radius)
            .attr("fill", settings.color)
            .attr('fill-opacity', settings.opacity.medium);

        elements.$maxText = svg.append('text')
            .attr("x", settings.max)
            .attr("y", settings.radius * 3 + settings.offset)
            .attr("fill", "#004d66").style("font-size", "13px").style("font-weight","bold").style("font-family","Georgia")
            .attr("fill-opacity", settings.opacity.medium)
            .attr("text-anchor", "middle")
            .text(settings.translater.apply(self, [settings.max]).text);

        //expose as public properties
        self.elements = elements;
        self.settings = settings;

        //setup additional methods
        self.init();
    };

    RangeSlider.prototype.init = function() {
        var self = this,
            api = {};

        var runCallback = function(process) {
            if (self.settings.callback) {
                self.settings.callback.apply(self, [
                    process,
                    self.settings.translater.apply(self, [self.elements.min.value]),
                    self.settings.translater.apply(self, [self.elements.max.value])
                ]);
            }
        };

        self.move = function(self) {
            var api = {};

            var resetBar = function(x, width) {
                //no error checking
                self.elements.$bar.attr("x", Math.max(x - self.settings.offset, 0)).attr("width", Math.max(width, 0));
            };


            api.$min = function(x) {
                if (x >= self.settings.min && x <= self.elements.max.value) {
                    self.elements.min.value = x;
                    self.elements.$min.attr('cx', x);
                    self.elements.$minText.attr('x', x).text(self.settings.translater.apply(self, [x]).text);
                    resetBar(x, self.elements.max.value - x);
                    runCallback('move');
                }
                return self; //chain-able
            };
            api.$max = function(x) {
                if (x >= self.elements.min.value && x <= self.settings.max) {
                    self.elements.max.value = x;
                    self.elements.$max.attr('cx', x);
                    self.elements.$maxText.attr('x', x).text(self.settings.translater.apply(self, [x]).text);
                    resetBar(self.elements.min.value, x - self.elements.min.value);
                    runCallback('move');
                }
                return self; //chain-able
            };

            return api;
        }(self);

        self.dragstart = function(self) {
            var api = {};

            var render = function($element, $text) {
                $element.attr('fill-opacity', self.settings.opacity.full);
                $text.attr('fill-opacity', self.settings.full);
                self.elements.$bar.attr('fill-opacity', self.settings.opacity.light);
                runCallback('dragstart');
            }
            api.$min = function() {
                render(self.elements.$min, self.elements.$minText);
                return self;
            };
            api.$max = function() {
                render(self.elements.$max, self.elements.$maxText);
                return self;
            };

            return api;
        }(self);

        self.dragend = function(self) {
            var api = {};

            var render = function($element, $text) {
                $element.attr('fill-opacity', self.settings.opacity.medium);
                $text.attr('fill-opacity', self.settings.medium);
                self.elements.$bar.attr('fill-opacity', self.settings.opacity.half);
                runCallback('dragend');
            }
            api.$min = function() {
                render(self.elements.$min, self.elements.$minText);
                return self;
            };
            api.$max = function() {
                render(self.elements.$max, self.elements.$maxText);
                return self;
            };
            return api;
        }(self);

        return self;
    };

    var min = moment(dataset[0].date),
        max = moment(dataset[dataset.length - 1].date),
        handles = {
            size: 8
        };
    var timeScale = d3.scaleTime()
        .domain([min.toDate(), max.toDate()])
        .range([0, settings.dim.width]);

    //setup the svg container
    var svg = d3.select('#controllers')
        .append('svg')
        .attr("width", settings.dim.width + settings.margins.left + settings.margins.right)
        .attr("height", 50);

    var g = svg.append("g")
        .attr('class', 'x-axis')
        .attr('transform', 'translate(' + settings.margins.left + ',0)');

    //draw the axis
    g.append('line')
        .attr("x1", 0)
        .attr("y1", handles.size)
        .attr("x2", settings.dim.width)
        .attr("y2", handles.size)
        .attr("stroke", "#ccc")
        .attr("stroke-width", 1);

    var translater = function(timeScale) {
        return function(x) {
            var m = moment(timeScale.invert(x)),
                ret = {
                    x: x,
                    text: null,
                    value: m
                };

            if (m.isValid()) {
                ret.text = m.format("MMM. DD, YYYY");
            }
            return ret;
        };
    }(timeScale);

    var slider = new RangeSlider(g, settings.dim.width, handles.size, '#006699', translater, callback);

    //setup handle dragging
    slider.elements.$min.call(d3.drag()
        .on('start', slider.dragstart.$min)
        .on('drag', function() {
            slider.move.$min(d3.event.x);
        })
        .on('end', slider.dragend.$min));
    slider.elements.$max.call(d3.drag()
        .on('start', slider.dragstart.$max)
        .on('drag', function() {
            slider.move.$max(d3.event.x);
        })
        .on('end', slider.dragend.$max));

}
renderSlider(dataset, settings, updateChart);
