/*global module:false*/
module.exports = function(grunt) {
	grunt
			.initConfig({
				pkg : grunt.file.readJSON('package.json'),
				meta : {
					banner : '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - '
							+ '<%= grunt.template.today("yyyy-mm-dd") %>\n'
							+ '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>'
							+ '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>; %> */'
				},
				's3-sync' : {
					options : {
						key : 'AKIAIJEUG7S3IGYDERQQ',
						secret : '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',
						bucket : 'appdata.cmap.org'
					},
					tcga : {
						files : [ {
							root : 'U:/users/jgould/tcga_current/test',
							src : [ 'U:/users/jgould/tcga_current/test/**' ],
							dest : 'morpheus/tcga/',
							gzip : true,
							compressionLevel : 9
						} ]
					}
				},
				uglify : {
					extApps : {
						options : {
							mangle : false
						},
						files : {
							'js/morpheus.external.apps.min.js' : [ 'js/morpheus.external.apps.js' ]
						}
					}
				},
				cssmin : {
					apps : {
						src : 'css/morpheus.external.apps.css',
						dest : 'css/morpheus.external.apps.min.css'
					}
				},
				concat : {
					extCss : {
						src : [ 'css/jquery-ui.min.css',
								'css/font-awesome.min.css',
								'css/hopscotch.min.css', 'css/slick.grid.css' ],
						dest : 'css/morpheus.external.apps.css'
					},
					extJs : {
						nonull : true,
						dest : 'js/morpheus.external.apps.js',
						src : [ 'js/newick.js', 'js/hammer.min.js',
								'js/jquery.mousewheel.min.js',
								'js/bootstrap-select.min.js',
								'js/xlsx.full.min.js', 'js/canvas2svg.js',
								'js/canvg.js', 'js/rgbcolor.js',
								'js/jquery-ui.min.js', 'js/parser.js',
								'js/FileSaver.min.js', 'js/Blob.js',
								'js/canvas-toBlob.js', 'js/colorbrewer.js',
								'js/hopscotch.min.js', 'js/typed.min.js',
								'js/jquery.event.drag-2.2.js',
								'js/slick.min.js', 'js/quadtree.min.js',
								'js/clipboard.min.js', 'js/d3.min.js',
								'js/d3.layout.cloud.js' ]
					},
					morpheus : {
						nonull : true,
						dest : 'js/morpheus.js',
						src : [ 'src/util/util.js', 'src/util/*.js',
								'src/io/*.js', 'src/matrix/vector_adapter.js',
								'src/table/list.js', 'src/matrix/*.js',
								'src/*.js', 'src/tools/*.js', 'src/ui/*.js',
								'src/**/*.js' ]
					}
				},
				watch : {
					files : [ 'src/*.js', 'src/**/*.js' ],
					tasks : [ 'concat:morpheus', 'copy:apps' ]
				},
				copy : {
					apps : {
						src : 'js/morpheus.js',
						dest : '../kafejo/public/lib/js/morpheus.js'
					},
					appsMin : {
						src : 'js/morpheus.min.js',
						dest : '../kafejo/public/lib/js/morpheus.min.js'
					},
					morpheus : {
						files : [ {
							src : [ 'css/**' ],
							dest : '../kafejo/public/morpheus/',
						}, {

							src : [ 'fonts/**' ],
							dest : '../kafejo/public/morpheus/',
						}, {
							src : [ 'js/**' ],
							dest : '../kafejo/public/morpheus/',
						}, {
							src : [ '*.html' ],
							dest : '../kafejo/public/morpheus/',
						}, {
							src : [ 'images/**' ],
							dest : '../kafejo/public/morpheus/',
						} ]

					}
				}
			});
	// Default task.
	grunt.registerTask('default', 'copy');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-s3-sync');
};
