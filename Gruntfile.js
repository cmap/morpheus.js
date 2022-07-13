module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - '
        + '<%= grunt.template.today("yyyy-mm-dd") %>\n'
        + '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>'
        + '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>; %> */'
    },
    uglify: {
      morpheusEs6Module: {
        options: {
          mangle: false
        },
        files: {
          'js/morpheus-esm-latest.min.js': ['js/morpheus-esm.js']
        }
      },
      morpheus: {
        options: {
          mangle: false,
          compress: false,
          preserveComments: false
        },
        files: {
          'js/morpheus-latest.min.js': ['js/morpheus.js']
        }
      },
      extJs: {
        options: {
          mangle: false,
          compress: false,
          preserveComments: false
        },
        files: {
          'js/morpheus-external.min.js': ['js/morpheus-external.js']
        }
      }
    },
    cssmin: {
      css: {
        src: 'css/morpheus.all.css',
        dest: 'css/morpheus-latest.min.css'
      }
    },
    concat: {
      css: {
        src: [
          'css/bootstrap.min.css',
          'css/bootstrap-select.min.css',
          'css/jquery-ui.min.css',
          'css/font-awesome.min.css',
          'css/slick.grid.css', 'css/morpheus.grid.css',
          'css/animate.css', 'css/morpheus.css'],
        dest: 'css/morpheus.all.css'
      },
      morpheus: {
        options: {
          banner: '(function(global){\n\'use strict\';\n',
          footer: '\n})(typeof window !== \'undefined\' ? window : this);\n'
        },
        dest: 'js/morpheus.js',
        src: [
          'src/util/util.js', 'src/util/*.js',
          'src/io/*.js', 'src/matrix/vector_adapter.js',
          'src/matrix/*.js', 'src/*.js',
          'src/tools/*.js', 'src/ui/*.js', 'src/**/*.js']
      },
      morpheusEs6Module: {
        options: {
          banner: 'let morpheus;\n(function (root, factory) {\nmorpheus = factory();\n}(this, function () {\n',
          footer: '\nreturn morpheus;\n}));\nexport default morpheus;\n'
        },
        dest: 'js/morpheus-esm.js',
        src: [
          'src/util/util.js', 'src/util/*.js',
          'src/io/*.js', 'src/matrix/vector_adapter.js',
          'src/matrix/*.js', 'src/*.js',
          'src/tools/*.js', 'src/ui/*.js', 'src/**/*.js']
      },
      extJs: {
        nonull: true,
        dest: 'js/morpheus-external.js',
        src: [
          'js/d3.min.js', 'js/jquery-3.6.0.min.js',
          'js/bootstrap.min.js', 'js/underscore-min.js',
          'js/newick.js', 'js/hammer.min.js',
          'js/jquery.mousewheel.min.js',
          'js/bootstrap-select.min.js',
          'js/xlsx.full.min.js', 'js/canvas2svg.js',
          'js/canvg.js', 'js/rgbcolor.js',
          'js/jquery-ui.min.js', 'js/parser.js',
          'js/FileSaver.min.js', 'js/colorbrewer.js',
          'js/jquery.event.drag-2.3.0.js', 'js/slick.min.js', 'js/canvas-toBlob.js',
          'js/js.cookie.js', 'js/jstat.min.js', 'js/blob-stream.js',
          'js/canvas2pdf.js', 'js/pdfkit.js', 'js/promise.polyfill.min.js', 'js/fetch.js', 'js/tsne.js']
      },
      extJsR: {
        nonull: true,
        dest: 'js/morpheus-external-r.js',
        src: [
          'js/d3.min.js', 'js/underscore-min.js',
          'js/newick.js', 'js/hammer.min.js',
          'js/jquery.mousewheel.min.js',
          'js/bootstrap-select.min.js',
          'js/xlsx.full.min.js', 'js/canvas2svg.js',
          'js/canvg.js', 'js/rgbcolor.js',
          'js/jquery-ui.min.js', 'js/parser.js',
          'js/FileSaver.min.js', 'js/colorbrewer.js',
          'js/jquery.event.drag-2.3.0.js', 'js/slick.min.js', 'js/canvas-toBlob.js',
          'js/js.cookie.js', 'js/jstat.min.js', 'js/blob-stream.js',
          'js/canvas2pdf.js', 'js/pdfkit.js', 'js/promise.polyfill.min.js', 'js/fetch.js']
      },
      extJsAll: {
        nonull: true,
        src: [
          'js/morpheus-external.js',
          'js/echarts.min.js', 'js/echarts-gl.min.js', 'js/papaparse.min.js'],
        dest: 'js/morpheus-external-latest.min.js'
      },
      extJsAllR: {
        nonull: true,
        src: [
          'js/morpheus-external-r.js',
          'js/echarts.min.js', 'js/echarts-gl.min.js', 'js/papaparse.min.js'],
        dest: 'js/morpheus-external-latest-r.min.js'
      }
    },
    watch: {
      files: ['src/*.js', 'src/**/*.js'],
      tasks: ['concat:morpheus']
    }
  });

  grunt.registerTask('default', 'watch');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify-es');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
};
