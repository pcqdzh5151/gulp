import gulp from 'gulp'; //引入gulp
import gulpLoadPlugins from 'gulp-load-plugins'; //自动加载插件 省去一个一个require进来
import browserSync from 'browser-sync'; //浏览器同步
import {stream as wiredep} from 'wiredep'; //把bower 下载的文件引入到html文件中
const $ = gulpLoadPlugins();
const reload = browserSync.reload;

const paths = {
    src: 'app',
    dist: 'dist',
    tmp: 'tmp'
};

paths.sass = [paths.src+'/styles/*.scss'];

gulp.task('clean', ()=> {
    return gulp.src([paths.dist+'/', paths.tmp+'/'])
        .pipe($.clean());
});

gulp.task('build', ['lint']);

gulp.task('default', ['clean'], ()=> {
    return gulp.run('build');
});

gulp.task('sass', ()=>{
    return gulp.src(paths.sass)
        .pipe($.sass())
        .pipe(gulp.dest(paths.src+'/styles'));
});

gulp.task('watch',()=>{
    return gulp.watch(paths.sass,['sass']);
});

//ES6转ES5
gulp.task('scripts', ()=>{
    return gulp.src(paths.src+'/scripts/*.js')
        .pipe($.babel())
        .pipe(gulp.dest(paths.dist+'/scripts'));
})

//压缩图片
gulp.task('images', ()=>{
    return gulp.src('app/images/*')
         .pipe ($.cache ($.imagemin ({ 
              optimizationLevel: 10,
              progressive: true, 
              interlaced: true})
         )).pipe (gulp.dest (paths.dist+'/images'));
});

//js报错检查
gulp.task('lint', ()=>{
    return gulp.src(paths.src+'/scripts/*.js')
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish', {verbose: true}));
});

//压缩
gulp.task('html', ['sass','scripts'], ()=>{
    var version = (new Date).valueOf() + '';
    var options = {
        removeComments: false,//清除HTML注释
        collapseWhitespace: true,//压缩HTML
        collapseBooleanAttributes: false,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: false,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: false,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: false,//删除<style>和<link>的type="text/css"
        minifyJS: false,//压缩页面里的JS
        minifyCSS: false//压缩页面里的CSS
    };
    return gulp.src(paths.src+'/*.html')
        .pipe($.plumber())
        .pipe($.useref({searchPath: ['app','.']}))
        .pipe($.if('*.js', $.uglify()))
        .pipe($.if('*.css', $.cssnano()))
        .pipe($.if('*.html',$.htmlmin(options)))
        // .pipe($.replace('.js"></script>' , '.js?v=' + version + '"></script>'))
        .pipe(gulp.dest('dist'));
});