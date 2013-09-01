window.monitor = window.monitor || {}

monitor.table = '<table class="table"><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>{{#metrics}}<tr id="{{name}}"><td>{{name}}</td><td>{{value}}</td></tr>{{/metrics}}</tbody></table>'

monitor.row = '<td>{{name}}</td><td>{{value}}</td>'

monitor.updateTable = function(element, data) {
	if (element) {
		var result = [];
		var i = 0;
	    for (var item in data) {
	        if (!/.*\.stomp\./.test(data[item].name)) {
	        	result[i++] = data[item]
	        } else {
	        	console.log("Not showing: " + JSON.stringify(data[item]))
	        }
	    }
		result.sort(function(one, two) {
			if (one == two)
				return 0;
			return one.name > two.name ? 1 : -1;
		});
		element.mustache('monitorTable', {
			metrics : result
		}, {
			method : "html"
		});
	}
}

monitor.updateRow = function(element, data) {
	if (element) {
		element.mustache('monitorRow', data, {
			method : "html"
		});
	}
}

monitor.scocket = null;

monitor.staticUpdate = function(element, endpoint) {
	if (element) {
	    $.get(endpoint, function(input) {
	        var data = [], i = 0;
	        for (var key in input) {
	            data[i++] = { name: key, value: input[key] };
	        }
			monitor.updateTable(element, data);
	    });
	}
} 

monitor.open = function(ws,metrics) {
	var element = $('#js-monitor');
	if (!element) {
	    return
    }
	monitor.staticUpdate(element, metrics);
    monitor.socket = new SockJS(ws);
    var client = Stomp.over(monitor.socket);
    client.connect('guest', 'guest', function(frame) {
	    console.log('Connected ' + frame);
	    client.subscribe("/topic/metrics/*", function(message) {
            var data = JSON.parse(message.body);
		    monitor.updateRow($('#' + data.name.replace(/\./g,'\\.')), data);
	    });
    });
}

var socket = null;
$(window).load(function() {
	$.Mustache.add('monitorTable', $('#monitorTable').html() || monitor.table);
	$.Mustache.add('monitorRow', $('#monitorRow').html() || monitor.row);
	monitor.open("/stomp", "/metrics");
})