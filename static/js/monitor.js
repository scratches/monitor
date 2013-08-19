window.monitor = window.monitor || {}
monitor.template = '<table class="table"><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody>{{#metrics}}<tr><td>{{name}}</td><td>{{value}}</td></tr>{{/metrics}}</tbody></table>'
$(window).load(function() {
    $.Mustache.add('monitor', $('#monitor').html() || monitor.template);
    $.get("/metrics", function(input) {
        var data = {metrics: []}, i = 0;
        for (var key in input) {
            data.metrics[i++] = { name: key, value: input[key] };
        }
        data.metrics.sort(function(one,two) {
            if (one == two) return 0;
            return one.name > two.name ? 1 : -1;
        });
            $('#js-monitor').mustache('monitor', data, { method: "html" });
    });
})
