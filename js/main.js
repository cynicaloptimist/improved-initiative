requirejs.config({
  baseUrl: '../',
  paths: {
    'jquery': 'node_modules/jquery/dist/jquery.js',
    'jquery-ui': 'node_modules/jquery-ui/jquery-ui.js',
    'knockout': 'node_modules/knockout/build/output/knockout-latest.debug.js',
    'mousetrap': 'node_modules/mousetrap/mousetrap.js'
  }
})

require(['js/ImprovedInitiative']);
