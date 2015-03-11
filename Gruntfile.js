module.exports = function(grunt) {

  var config = {
    jsSrc: ['src/module.js', 
            'src/common.js',
            'src/cards.js',
            'src/format.js',
            'src/validate.js',
            'src/form.js']
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: config.jsSrc,
        dest: 'lib/<%= pkg.name %>.js'
      }
    },
    jshint: {
      options: {
        jshintrc: './.jshintrc'
      },
      dist: {
        files: {
          src: config.jsSrc
        }
      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'lib/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
    connect: {
      server: {
        options: {
          port: 8000,
          base: '.',
          keepalive: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

};