module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  pluginOptions: {
    lodash: {
        provide: false
    }
  },
  publicPath: process.env.NODE_ENV === 'production'
  ? '/image-editor/'
  : '/'
}