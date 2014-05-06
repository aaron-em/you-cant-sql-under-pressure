var mime = require('mime');
var file = require('file');
var fs = require('fs');
fs.notify = require('fs.notify');

module.exports = function statics(opts) {
    var self = this;

    var defaults = {'listen': true,
                    'verbose': false};
    var mutableOpts = ['verbose'];
    
    var options = defaults;
    if (opts) {
        for (var opt in opts) {
            options[opt] = opts[opt];
        };
    };

    self.files = [];
    self.fileContent = {};
    self.fileType    = {};
    self.notifiers   = {};

    var log = function(message) {
        if (options.verbose) {
            console.log(message);
        };
    };

    var readContent = function(path) {
        var mimetype = mime.lookup(path);
        var charset  = mime.charsets.lookup(mimetype);
        self.fileContent[path] = fs.readFileSync(path).toString();
        self.fileType[path] = mimetype + (charset
                                          ? '; charset=' + charset
                                          : '');
    };

    var addListener = function(path) {
        log("Adding listener on " + path);
        var notifier = new fs.notify(path);
        notifier.on('change', function (file, event, path) {
            log("updating " + path);
            readContent(path);
        });
        self.notifiers[path] = notifier;
    };

    self.option = function(name, value) {
        if (name === undefined) { return opts; };
        if (value === undefined) { return opts[name]; };
        if (mutableOpts.indexOf(name) == -1) {
            throw(new Error("Attempt to change immutable option '" + name + "'"));
        };
        opts[name] = value;
        return opts[name];
    };

    self.root = function () {
        return options.root;
    };

    self.addPath = function(path, listen) {
        log("Adding static: " + path);
        self.files.push(path);
        readContent(path);
        if (listen) {
            addListener(path);
        };
    };

    self.getPaths = function() {
        return self.files;
    };
    
    self.getContent = function(path) {
        return self.fileContent[path];
    };

    self.getType = function(path) {
        return self.fileType[path];
    };

    self.on = function (root) {
        options.root = root;
        file.walkSync(root, function(here, dirs, items) {
            items.map(function(item) {
                var path = here + '/' + item;
                path = path.replace(/\/\//g, '/');
                var stat = fs.statSync(path);
                if (stat.isFile()) {
                    self.addPath(path, options.listen);
                    // FIXME get add/delete notifications also
                // }
                // else {
                //     var notifier = new fs.notify();
                //     notifier.on('create', function(file, event, path) {
                //         console.log("Got a " + event + " on " + path);
                //     });
                };
            });
        });

        return self;
    };
};
