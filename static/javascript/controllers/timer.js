youCantSql.controller('timerController', function($scope, $interval, timer) {
    $scope.formattedTime = timer.getFormattedTime();
    $interval(function() {
        $scope.formattedTime = timer.getFormattedTime();
    }, 500);
});
