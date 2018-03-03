let mix = require('laravel-mix')

mix.options(
  { processCssUrls: false }
)

mix.js(
  'src/app.js',
  'dist/js'
)

// mix.sass(
//   'app/src/scss/main.scss',
//   'mailer/static/css'
// )

// mix.copyDirectory(
//   'app/src/img',
//   'mailer/static/img'
// )

// mix.copyDirectory(
//   'app/src/fonts',
//   'mailer/static/fonts'
// )

if (mix.inProduction()) {
  mix.version()
}

mix.disableNotifications()
