youCantSql.controller('gameController', function($scope, $rootScope,
                                                 $http, timer) {
    $scope.title = "You can't SQL under pressure.";
    
    $scope.running  = false;
    $scope.complete = false;
    $scope.round = 0;
    $scope.rounds = 0;

    $scope.query = '';
    $scope.history = [];

    $rootScope.$on('gameStart.click', function() {
        $scope.running = true;
        $scope.title = "You can't SQL under pressure...or can you?";
        $http.get('/rounds/count')
            .then(function(result) {
                $scope.rounds = result.data.count;
            });
        startRound(1);
    });

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

    function startRound(round) {
        $scope.round = round;
        return $http
            .get('/round/'
                 + $scope.round
                 + '/description')
            .then(function(result) {
                $scope.roundDescription =
                    "Round " + $scope.round
                    // + " of " + $scope.rounds
                    + ": " + result.data.description;
                timer.start();
            });
    };

    function finishRound() {
        var lastRound = $scope.round;
        timer.stop();
        $scope.query = '';
        $scope.round += 1;
        $scope.history.unshift({'time': timer.getFormattedTime(),
                                'status': 'pass',
                                'result': 'Round ' + lastRound + ' completed!'});
        if ($scope.round > $scope.rounds) {
            $scope.running  = false;
            $scope.complete = true;
            $scope.title = "Congratulations! You can SQL under pressure!";
            $scope.completionTime = timer.getFormattedTime();
        }
        else {
            startRound($scope.round);
        };
        
    };

    $scope.handleKeyDown = function handleKeyDown (event) {
        if (event.ctrlKey && event.keyCode == 13) {
            $scope.tryQuery();
        };
    };
    
    $scope.tryQuery = function tryQuery () {
        if ($scope.query) {
            timer.stop();
            return $http
                .get('/round/'
                     + $scope.round
                     + '/try/'
                     + $scope.query.replace(/\n/g, ' '))
                .then(function(result) {
                    var d = result.data;
                    var formattedQuery = $scope.query
                            .replace(/\n/g, '<br />');
                    $scope.history
                        .unshift({'time':   timer.getFormattedTime(),
                                  'query':  formattedQuery,
                                  'status': (d.status ? 'pass' : 'fail'),
                                  'result': (d.errors.length == 0
                                             ? tabulate(d.result)
                                             : d.errors.join('<br />'))});
                    if (d.status) {
                        finishRound();
                    }
                    else {
                        timer.start();
                    };
                });
        };
        return false;
    };
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
