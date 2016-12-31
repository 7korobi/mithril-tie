banner = """
  /**
   <%= pkg.name %> - <%= pkg.description %>
   @version v<%= pkg.version %>
   @link <%= pkg.repository.url %>
   @license <%= pkg.license %>
  **/


"""

module.exports = (grunt)->
  pkg = grunt.file.readJSON 'package.json'
  config =
    pkg: pkg

    watch:
      make:
        files: ['{src,test}/**/*.coffee', 'package.json']
        tasks: ['make', 'spec']
      demo_coffee:
        files: ['demo/**/*.coffee']
        tasks: ['coffee:demo']
      demo_pug:
        files: ['demo/**/*.pug']
        tasks: ['pug:demo']

    coffee:
      demo:
        options:
          bare: false
        files:
          "html/test.js": "demo/*.coffee"
      src:
        options:
          sourceMap: false
          bare: false
        files: {}


    usebanner:
      js:
        options:
          position: "top"
          banner: banner
          linebreak: true
        files: {}

    uglify:
      js:
        options:
          banner: banner
          compress:
            dead_code: false
          sourceMap: true
        files: {}

    mochaTest:
      test:
        options:
          reporter: "min"
          require: "intelli-espower-loader"
        src: ["test-espower/**/*.js"]

    pug:
      demo:
        options:
          data: grunt.file.readJSON('package.json')
        files:
          "html/index.html": ["demo/*.pug"]

    shell:
      demo:
        command: "webpack"

  config.coffee.src.files["#{pkg.name}.js"] =  ["src/**/_*.coffee", "src/**/*.coffee"]
  config.coffee.src.files["test-espower/mocha.js"] = ["test/**/*.coffee"]

  config.uglify.js.files["#{pkg.name}.min.js"] = ["#{pkg.name}.js"]
  config.usebanner.js.files.src = ["#{pkg.name}.js"]
  grunt.initConfig config

  for task, ver of pkg.devDependencies when task[..5] == "grunt-"
    grunt.loadNpmTasks task

  grunt.task.registerTask "default", ["demo", "make", "spec", "watch"]
  grunt.task.registerTask "make", ["coffee:src", "uglify", "usebanner"]
  grunt.task.registerTask "spec", ["mochaTest"]
  grunt.task.registerTask "demo", ["shell:demo", "coffee:demo", "pug:demo"]

