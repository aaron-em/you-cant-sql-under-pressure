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
