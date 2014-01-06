module.exports = function rounds(d, r) {
    var self = this;
    var rounds = r;
    var db = d;

    // FIXME check constructor args for validity

    function initRound(ready, round) {
        db.all(round.requirement,
               function (err, match) {
                   if (err) {
                       throw(new Error("Failed prepping round " 
                                       + (ready + 1)
                                       + ": " + err));
                   };
                   round.matchResult = JSON.stringify(match);
               });
        return [ready + 1, round];
    };

    self.init = function(callback) {
        var ready = 0;

        for (var i in r) {
            var round = r[i];
            var match = [];

            var result = initRound(ready, round);
            ready = result[0];
            rounds[i] = result[1];
            
            if (ready == rounds.length) {
                console.log(ready + " rounds initialized.");
                return callback();
            };
        };
        return true;
    };

    self.getRoundDesc = function (roundNumber) {
        return rounds[roundNumber - 1].description;
    };

    self.getRoundCount = function() {
        return rounds.length;
    };

    self.try = function(roundNumber, jsonResult) {
        var req = rounds[roundNumber - 1].matchResult;
        return (jsonResult == req);
    };

    return self;
};
