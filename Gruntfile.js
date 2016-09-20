/*global module:false*/
module.exports = function (grunt) {
	grunt
	.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		meta: {
			banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - '
			+ '<%= grunt.template.today("yyyy-mm-dd") %>\n'
			+ '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>'
			+ '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>; %> */'
		},
		uglify: {
			morpheus: {
				options: {
					mangle: false,
					preserveComments: false
				},
				files: {
					'js/morpheus-latest.min.js': ['js/morpheus.js']
				}
			},
			extJs: {
				options: {
					mangle: false,
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
				src: ['css/bootstrap.min.css',
					'css/bootstrap-select.min.css',
					'css/jquery-ui.min.css',
					'css/font-awesome.min.css',
					'css/hopscotch.min.css', 'css/slick.grid.css', 'css/morpheus.grid.css',
					'css/animate.css', 'css/morpheus.css'],
				dest: 'css/morpheus.all.css'
			},
			extJsAll: {
				src: ['js/morpheus-external.min.js',
					'js/plotly-latest.min.js', 'js/papaparse.min.js'],
				dest: 'js/morpheus-external-latest.min.js'
			},
			extJs: {
				nonull: true,
				dest: 'js/morpheus-external.js',
				src: ['js/d3.min.js', 'js/jquery-1.11.1.min.js',
					'js/bootstrap.min.js', 'js/underscore-min.js',
					'js/newick.js', 'js/hammer.min.js',
					'js/jquery.mousewheel.min.js',
					'js/bootstrap-select.min.js',
					'js/xlsx.full.min.js', 'js/canvas2svg.js',
					'js/canvg.js', 'js/rgbcolor.js',
					'js/jquery-ui.min.js', 'js/parser.js',
					'js/FileSaver.min.js', 'js/Blob.js',
					'js/canvas-toBlob.js', 'js/colorbrewer.js',
					'js/hopscotch.min.js', 'js/typed.min.js',
					'js/jquery.event.drag-2.2.js',
					'js/clipboard.min.js', 'js/slick.min.js',
					'js/js.cookie.js', 'js/d3.layout.cloud.js']
			},
			morpheus: {
				nonull: true,
				dest: 'js/morpheus.js',
				src: ['src/util/util.js', 'src/util/*.js',
					'src/io/*.js', 'src/matrix/vector_adapter.js',
					'src/matrix/*.js', 'src/*.js',
					'src/tools/*.js', 'src/ui/*.js', 'src/**/*.js', 'js/tsne.js']
			}
		},
		watch: {
			files: ['src/*.js', 'src/**/*.js'],
			tasks: ['concat:morpheus']
		}
	});

	// rebuild js and css:
	// grunt concat:morpheus concat:extJs uglify concat:extJsAll
	grunt.registerTask('default', 'watch');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-jshint');
};
