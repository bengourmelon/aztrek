// Initialize modules
// Importing specific gulp API functions lets us write them below as series() instead of gulp.series()
const { src, dest, watch, series, parallel } = require('gulp');
const sourcemaps = require('gulp-sourcemaps'),
  sass = require('gulp-sass'),
  postcss = require('gulp-postcss'),
  autoprefixer = require('autoprefixer'),
  minifyCss = require('gulp-clean-css'),
  useref = require('gulp-useref'),
  uglify = require('gulp-uglify'),
  gulpif = require('gulp-if'),
  imagemin = require('gulp-imagemin'),
  browsersync = require('browser-sync').create();

// File paths
const paths = { 
  styles: {
    src: 'app/scss/**/*.scss',
    dest: 'app/css'
  },
  srcAll: 'app/**/*',
  html: 'app/*.html'
}

// Sass task: compiles the style.scss file into style.css
function scssTask() {
  return src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([ autoprefixer() ]))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(paths.styles.dest))
    .pipe(browsersync.stream());
}

// Watch task: watch SCSS
function watchTask(){
  watch([paths.styles.src], scssTask);    
}

// Watch BrowserSync task: watch SCSS & reload Browser
function watchBSTask(){
  watch([paths.styles.src], scssTask); 
  watch([paths.html], browserSyncReload);   
}

// BrowserSync initialisation
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./"
    },
    port: 3000
  });
  done();
}

// BrowserSync reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Production task : copy .html files, concat .css & .js files in 'dist' folder
function prodTask() {
  return src(paths.html)
    .pipe(useref())
    .pipe(gulpif('*.js', uglify()))
    .pipe(gulpif('*.css', minifyCss()))
    .pipe(dest('dist'));
}

// Image task : copy & optimize image files
function imgTask() {
  return src('app/images/**/*.+(png|jpg|gif|svg|ico)')
    .pipe(imagemin())
    .pipe(dest('dist/images'));
}

// Export the Gulp tasks to be run in CLI

// Compile scss files : $ gulp scss 
exports.scss = scssTask;
// Watch scss files : $ gulp 
exports.default = series(scssTask, watchTask);
// Watch scss files & Synchronize Browser : $ gulp wbs
exports.wbs = parallel(watchBSTask, browserSync);
// Build dist folder : $ gulp prod
exports.prod = prodTask;
// Build dist folder with images : $ gulp prodimg
exports.prodimg = parallel(prodTask, imgTask); 