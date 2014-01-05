module.exports = function rounds(d, r) {
    var self = this;
    var rounds = r;
    var db = d;

    // FIXME check constructor args for validity

    var ready = 0;

    self.init = function(callback) {
        for (var i in rounds) {
            var round = rounds[i];
            var match = [];

            db.each(round.requirement,
                    function (err, row) {
                        match.push(row);
                    },
                    function (err, cnt) {
                        if (err) {
                            throw(new Error("Failed prepping round " 
                                            + (ready + 1)
                                            + ": " + err));
                        };
                        rounds[i].matchResult = JSON.stringify(match);
                        ready += 1;

                        if (ready == rounds.length) {
                            console.log(ready + " rounds initialized.");
                            return callback();
                        };
                        return true;
                    });
        };
    };

    self.getRounds = function() {
        return rounds;
    };

    return self;
};
