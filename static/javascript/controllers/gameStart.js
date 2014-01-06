youCantSql.controller('gameStartController', function($scope) {
    $scope.visible = true;
    $scope.startGame = function() {
        $scope.visible = false;
        $scope.$emit('gameStart.click');
    };
});
