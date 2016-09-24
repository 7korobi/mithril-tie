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
        files: [
          '{src,test}/**/*'
        ]
        tasks: ['make', 'spec']
      demo_coffee:
        files: [
          'demo/**/*.coffee'
        ]
        tasks: ['coffee:demo']
      demo_pug:
        files: [
          'demo/**/*.pug'
        ]
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

    "mocha-chai-sinon":
      build:
        src: ['test/**/*.coffee']
        options:
          ui: 'bdd'
          reporter: 'list'

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
  config.uglify.js.files["#{pkg.name}.min.js"] = ["#{pkg.name}.js"]
  config.usebanner.js.files.src = ["#{pkg.name}.js"]
  grunt.initConfig config


  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-banner'
  grunt.loadNpmTasks "grunt-mocha-chai-sinon"


  grunt.task.registerTask "default", ["demo", "make", "spec", "watch"]
  grunt.task.registerTask "make", ["coffee:src", "uglify", "usebanner"]
  grunt.task.registerTask "spec", ["mocha-chai-sinon"]

  grunt.loadNpmTasks 'grunt-shell-spawn'
  grunt.loadNpmTasks 'grunt-contrib-pug'
  grunt.loadNpmTasks 'grunt-shell'
  grunt.task.registerTask "demo", ["shell:demo", "coffee:demo", "pug:demo"]

