// Modules dependencies
var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var browserSync = require('browser-sync');
var del = require('del');
var bs = browserSync.create('My server');
var runSequence = require('run-sequence');
// var nodemon = require('gulp-nodemon');
var config = require('./config');
var path = require('path');
var spritesmith = require('gulp.spritesmith');

var $ = gulpLoadPlugins();
var reload = browserSync.reload;

// path 定义
var basedir = './';
var srcdir = './src'
var publicdir = './dist';
var filepath = {
  'css': path.join(srcdir, 'themes/**/*.css'),
  'less': path.join(srcdir, 'less/**/*.less'),
  'js': path.join(srcdir, 'sites/**/*.js'),
  'view': path.join(srcdir,'views/**/*.ejs')
};

// 编译 less
// gulp.task('styles', function () {
//   return gulp.src(filepath.less)
//     .pipe($.plumber())
//     // .pipe($.sourcemaps.init())
//     .pipe($.less())
//     .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
//     // .pipe($.sourcemaps.write())
//     .pipe(gulp.dest(path.join(srcdir,'themes')))
//     .pipe(reload({stream: true}));
// });

gulp.task('less', function () {
  return gulp.src('./src/less/blue/books/homepage.less')
    .pipe($.plumber())
    // .pipe($.sourcemaps.init())
    .pipe($.less())
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR']}))
    // .pipe($.sourcemaps.write())
    .pipe(gulp.dest('./src/themes/blue/books'))
    .pipe(reload({stream: true}));
});

gulp.task('sprite',function() {
  return gulp.src('./src/less/blue/homepage/images/*.png')
         .pipe(spritesmith({
          imgName: 'homepage-sprite.png',
          cssName: 'homepage-sprite.css'
         }))
          .pipe(gulp.dest('./src/themes/blue/homepage/'));

});
gulp.task('fonts', function() {
  return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
    .concat('src/fonts/**/*'))
    .pipe(gulp.dest('.tmp/fonts'))
    .pipe(gulp.dest('src/fonts'));
});

// gulp.task('images', function() {
//   return gulp.src('src/images/**/*')
//     .pipe($.cache($.imagemin()))
//     .pipe(gulp.dest('src/images'));
// });

gulp.task('clean', del.bind(null, ['.tmp', 'dist']));
// dev server
// 启动 express 并添加 browserSync 支持
// gulp.task('dev:server', function () {
//   nodemon({
//     script: 'server.js',
//     ignore: ['.vscode', '.idea', 'node_modules'],
//     env: {
//       'NODE_ENV': 'development'
//     }
//   });
//   bs.init(null, {
//     proxy: 'http://localhost:' + config.port,
//     files: [filepath.js, filepath.view],
//     notify: false,
//     open: true,
//     port: 5000
//   })
// });



// // 联调服务
// gulp.task('api:server', function () {
//   nodemon({
//     script: 'server.js',
//     ignore: ['.vscode', '.idea', 'node_modules'],
//     env: {
//       'NODE_ENV': 'api',
//       'REMOTE_API': config.remoteApi
//     }
//   });
//   bs.init(null, {
//     proxy: 'http://localhost:' + config.port,
//     files: [filepath.js, filepath.view],
//     notify: false,
//     open: false,
//     port: 5000
//   })
// });

// gulp.task('cssmin', function () {
//   return gulp.src(path.join(publicdir,'styles/*.css'))
//     .pipe($.cssnano())
//     .pipe($.rename({
//       suffix: '.min'
//     }))
//     .pipe(gulp.dest(path.join(publicdir,'styles')))
// });

// gulp.task('jsmin', function () {
//   return gulp.src(path.join(publicdir,'scripts/*.js'))
//     .pipe($.uglify())
//     .pipe($.rename({
//       suffix: '.min'
//     }))
//     .pipe(gulp.dest(path.join(publicdir,'scripts')));
// });

gulp.task('nodemon', function() {
  var called = false;

  return $.nodemon({
    script: './bin/www',
    ext: 'js css html',
    ignore: ['node_modules/*', '.gitignore'],
    env: {
      'NODE_ENV': 'development'
    },
    "restartable": "rs",
    "ignore": [
      ".git",
      "node_modules/**/node_modules"
    ],
    "verbose": true,
    "execMap": {
      "js": "node --harmony"
    },
    "events": {
      "restart": "osascript -e 'display notification \"App restarted due to:\n'$FILENAME'\" with title \"nodemon\"'"
    }
  }).on('start', function() {
    if(!called) {
      cb();
      called = true;
    }
  });
});

gulp.task('browser-sync', ['nodemon'], function() {
  bs.init(null, {
    proxy: 'http://localhost:'+(process.env.PORT || '3000'),
    notify: false,
    open: true,
    port: 5000
  });
  gulp.watch([
      'src/'
    ]).on('change', reload);
});

// gulp.task('build', ['cssmin', 'jsmin']);

// gulp.task('serve', function() {
//   runSequence(['styles', 'fonts'], ['browser-sync'], function() {

//     gulp.watch([
//       'app/*.html',
//       'app/images/**/*',
//       'app/fonts/**/*',
//       'app/scripts/**/*'
//     ]).on('change', reload);

//     gulp.watch('app/styles/**/*.css', ['styles']);
//     gulp.watch('app/fonts/**/*', ['fonts']);
//   });
// });

// // watching
gulp.task('watch', function () {
  gulp.watch('./src/less/blue/books/homepage.less', ['less']);
});

// gulp.task('dev', ['dev:server', 'styles', 'watch']);
// gulp.task('api', ['api:server', 'styles', 'watch']);

