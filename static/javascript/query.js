function timerProvider() {
    var self = this;

    self.$get = function($interval) {
        var self = this;
        
        var timer = 0;
        var formattedTime = '00:00';

        var interval = undefined;

        function pad(s) {
            return (s.length < 2 ? '0' : '') + s;
        };
        
        function updateTimer() {
            timer += 0.1;
            var hours = Math.floor(timer / 3600).toString();
            var minutes = Math.floor((timer
                                      - (hours * 3600))
                                     / 60).toString();
            var seconds = Math.floor((timer
                                      - (hours * 3600)
                                      - (minutes * 60))).toString();
            formattedTime = (hours > 0
                             ? hours + ':'
                             : '')
                + pad(minutes) + ':' + pad(seconds);
        };

        function startTimer() {
            interval = $interval(updateTimer, 100);
        };

        function stopTimer() {
            if (angular.isDefined(interval)) {
                $interval.cancel(interval);
                interval = undefined;
            };
        };

        return {
            start: function() { startTimer(); },
            stop:  function() { stopTimer(); },
            
            getTime: function() {
                return timer;
            },
            
            getFormattedTime: function() {
                return formattedTime;
            }
        };
    };
    
    return self;
};

var youCantSql = angular
        .module('youCantSql', ['ngSanitize'])
        .provider('timer', timerProvider);

youCantSql.controller('timerController', function($scope, $interval, timer) {
    timer.start();
    $scope.formattedTime = timer.getFormattedTime();
    $interval(function() {
        $scope.formattedTime = timer.getFormattedTime();
    }, 1000);
});

youCantSql.controller('queryController', function($scope, $http, timer) {
    $scope.history = [];

    function tabulate(rows) {
        var headers = [];
        var trs = [];

        for (var i in rows) {
            var row = rows[i];
            var tr = '<tr>';
            for (var field in row) {
                if (row == rows[0]) {
                    headers.push(field);
                };
                tr += '<td>' + row[field] + '</td>';
            };
            tr += '</tr>';
            trs.push(tr);
        };

        return '<table>'
            + '<thead><tr><th>'
            + headers.join('</th><th>')
            + '</th></thead>'
            + '<tbody>'
            + trs.join('')
            + '</tbody>'
            + '</table>';
    };
    
    $scope.send = function query() {
        if ($scope.query) {
            timer.stop();
            return $http
                .get('/query/' + $scope.query)
                .then(function(result) {
                    var d = result.data;
                    var formattedQuery = $scope.query
                            .replace(/\n/g, '<br />');
                    $scope.history
                        .unshift({'time':   timer.getFormattedTime(),
                                  'query':  formattedQuery,
                                  'status': (d.errors.length == 0
                                             ? 'pass'
                                             : 'fail'),
                                  'result': (d.status
                                             ? tabulate(d.result)
                                             : d.errors.join('<br />'))});
                    timer.start();
                });
        };
        return false;
    };
});
