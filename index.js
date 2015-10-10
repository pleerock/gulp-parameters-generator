var gutil = require('gulp-util');
var through = require('through2');
var fs = require('fs');
var inq = require('inquirer');
var path = require('path');
var PluginError = gutil.PluginError;

var unflatten = function(data) {
    if (Object(data) !== data || Array.isArray(data))
        return data;
    var regex = /\.?([^|\[\]]+)|\[(\d+)\]/g,
        resultholder = {};
    for (var p in data) {
        var cur = resultholder,
            prop = "",
            m;
        while (m = regex.exec(p)) {
            cur = cur[prop] || (cur[prop] = (m[2] ? [] : {}));
            prop = m[2] || m[1];
        }
        cur[prop] = data[p];
    }
    return resultholder[""] || resultholder;
};

var flatten = function(data) {
    var result = {};
    function recurse (cur, prop) {
        if (Object(cur) !== cur || (Array.isArray(cur) && cur.every(function(i) { return !(i instanceof Object); }))) {
            result[prop] = cur;
        } else if (Array.isArray(cur)) {
            for(var i=0, l=cur.length; i<l; i++)
                recurse(cur[i], prop + "[" + i + "]");
            if (l == 0)
                result[prop] = [];
        } else {
            var isEmpty = true;
            for (var p in cur) {
                isEmpty = false;
                recurse(cur[p], prop ? prop+"|"+p : p);
            }
            if (isEmpty && prop)
                result[prop] = {};
        }
    }
    recurse(data, "");
    return result;
};


// consts
const PLUGIN_NAME = 'gulp-config-parameters';

// plugin level function (dealing with files)
function gulpConfigParameters(dist) {

    if (!dist)
        this.emit('error', new PluginError(PLUGIN_NAME, 'Original file name is not given'));


    // creating a stream through which each file will pass
    var stream = through.obj(function(file, enc, cb) {

        // ignore it
        if (file.isNull()) {
            this.push(file);
            return cb();
        }

        // stream is not supported
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streaming is not supported'));
            return cb();
        }

        try {

            var distFile;
            try {
                distFile = JSON.parse(fs.readFileSync(dist));
            } catch (e) {
                distFile = {};
            }
            var distValues = flatten(distFile);
            var distValuesKeys = Object.keys(distValues);

            var values = flatten(JSON.parse(file.contents.toString('utf8')));
            var questions = Object.keys(values).filter(function(key) {
                return distValuesKeys.indexOf(key) === -1;
            }).map(function(key) {

                var type = typeof values[key] === 'boolean' ? 'confirm' : 'input';
                var choices;
                if (values[key] instanceof Array) {
                    type = 'checkbox';
                    choices = values[key];
                }

                return {
                    type: type,
                    name: key,
                    message: key,
                    default: values[key],
                    choices: choices
                };
            });

            inq.prompt(questions, function(res){

                Object.keys(res).forEach(function(key) {
                    distValues[key] = res[key];
                });

                file.path = path.join(file.base, path.basename(dist));
                file.contents = new Buffer(JSON.stringify(unflatten(distValues), null, 2));
                cb(null, file);
            });

        } catch (err) {
            this.emit('error', new PluginError(PLUGIN_NAME, err));
        }

        // make sure the file goes through the next gulp plugin
        this.push(file);
        // tell the stream engine that we are done with this file
    });

    // returning the file stream
    return stream;
}

// exporting the plugin main function
module.exports = gulpConfigParameters;