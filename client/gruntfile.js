module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-jade');
  //grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  //grunt.loadNpmTasks('grunt-contrib-watch');
  //grunt.loadNpmTasks('grunt-recess');
  //grunt.loadNpmTasks('grunt-karma');
  //grunt.loadNpmTasks('grunt-html2js');

  // Default task.

  grunt.registerTask('default', ['jshint', 'build']);
  grunt.registerTask('build', ['clean', 'copy:assets', 'copy:less', 'concat', 'jade']);
  //grunt.registerTask('default', ['jshint','build','karma:unit']);
  //grunt.registerTask('build', ['clean','html2js','concat','recess:build','copy:assets']);
  //grunt.registerTask('release', ['clean','html2js','uglify','jshint','karma:unit','concat:index', 'recess:min','copy:assets']);
  //grunt.registerTask('test-watch', ['karma:watch']);

  // Print a timestamp (useful for when watching)
  grunt.registerTask('timestamp', function() {
    grunt.log.subhead(Date());
  });

  //var karmaConfig = function(configFile, customOptions) {
  //  var options = { configFile: configFile, keepalive: true };
  //  var travisOptions = process.env.TRAVIS && { browsers: ['Firefox'], reporters: 'dots' };
  //  return grunt.util._.extend(options, customOptions, travisOptions);
  //};

  // Project configuration.
  grunt.initConfig({
    distdir: 'dist',
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
      ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;\n' +
      ' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n */\n',
    clean: ['<%= distdir %>/*'],
    src: {
      js: ['src/app/app.js', 'src/common/directives/*.js', 'src/common/services/*.js', 'src/common/controllers/*.js'],
      html: ['src/index.html']
    },
    copy: {
      assets: {
        files: [{
          dest: '<%= distdir %>',
          src: '**',
          expand: true,
          cwd: 'src/assets/'
        }]
      },
      less: {
        files: [{
          dest: '<%= distdir %>/less',
          src: '**',
          expand: true,
          cwd: 'src/less/'
        }]
      },

    },
    concat: {
      dist: {
        options: {
          banner: "<%= banner %>"
        },
        src: ['<%= src.js %>'],
        dest: '<%= distdir %>/<%= pkg.name %>.js'
      },
      index: {
        src: ['src/index.html'],
        dest: '<%= distdir %>/index.html',
        options: {
          process: true
        }
      },
      angular: {
        src: ['vendor/angular/angular.js', 'vendor/angular/angular-route.js'],
        dest: '<%= distdir %>/angular.js'
      },
      jquery: {
        src: ['vendor/jquery/*.js'],
        dest: '<%= distdir %>/jquery.js'
      },
      bootstrap: {
        src: ['vendor/bootstrap/*.js'],
        dest: '<%= distdir %>/bootstrap.js'
      },
      flatui: {
        src: ['vendor/flatui/*.js'],
        dest: '<%= distdir %>/flatui.js'
      },
      less: {
        src: ['vendor/less/*.js'],
        dest: '<%= distdir %>/less.js'
      }
    },
    jade: {
        compile: {
            options: {
                client: false,
                pretty: true
            },
            files: [ {
              cwd: "src/app/partials/",
              src: "**/*.jade",
              dest: "<%= distdir %>/partials",
              expand: true,
              ext: '.html'
              //rename: function(dest, src){ return dest + '/'+src.replace('.jade', '') },
            } ]
        }
    },    
    jshint: {
      files: ['gruntFile.js', 'package.json', '<%= src.js %>'],
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        boss: true,
        eqnull: true,
        globals: {}
      }
    }
  });

};