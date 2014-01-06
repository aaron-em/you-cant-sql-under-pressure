youCantSql.controller('infoController', function($scope, $rootScope) {
    $scope.visible = true;
    $scope.visibleSections = ['tldr'];

    $rootScope.$on('gameStart.click', function() {
        $scope.visible = false;
    });

    $scope.isSectionVisible = function(id) {
        return !($scope.visibleSections.indexOf(id) == -1);
    };

    $scope.toggleSectionVisible = function(id) {
        if ($scope.visibleSections.indexOf(id) == -1) {
            $scope.visibleSections.unshift(id);
        }
        else {
            var a = [];
            for (var i in $scope.visibleSections) {
                var el = $scope.visibleSections[i];
                if (el != id) {
                    a.push(el);
                };
            };
            $scope.visibleSections = a;
        };
    };
});
