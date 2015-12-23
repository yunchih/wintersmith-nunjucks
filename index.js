var nunjucks = require("nunjucks");
var path = require("path");

module.exports = function(env, callback) {

  // Load the new nunjucks environment.
  var loaderOpts = {
    watch: (env.mode == 'preview')
  };
  var loader = new nunjucks.FileSystemLoader(env.templatesPath, loaderOpts);
  var nenv = new nunjucks.Environment(loader);

  // Configure nunjucks environment.
  if (env.config.nunjucks) {
    nenv.opts = env.config.nunjucks.opts | {
        autoescape: true    
    };
  }

  // Load the filters
  if(env.config.nunjucks && env.config.nunjucks.filterdir) {
    env.config.nunjucks.filters.map( function (name) {
      file = path.join(env.config.nunjucks.filters_dir, name + ".js");
      filter = env.loadModule(env.resolvePath(file), true);
      nenv.addFilter(name, filter);
    });
  }

  if(env.config.nunjucks && env.config.nunjucks.extensions) {
    env.config.nunjucks.extensions.map( function (name) {
      file = path.join(env.config.nunjucks.extensions_dir, name + ".js");
      extension = env.loadModule(env.resolvePath(file), true);
      nenv.addExtension(name, extension);
    });
  }


  var NunjucksTemplate = function(template) {
    this.template = template;
  };

  NunjucksTemplate.prototype.render = function render(locals, callback) {
    try {
      callback(null, new Buffer(this.template.render(locals)));
    } catch (error) {
      callback(error);
    }
  };

  NunjucksTemplate.fromFile = function fromFile(filepath, callback) {
    callback(null, new NunjucksTemplate(nenv.getTemplate(filepath.relative)));
  };

  env.registerTemplatePlugin("**/*.*(html|nunjucks)", NunjucksTemplate);
  callback();
};
