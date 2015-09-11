module ImprovedInitiative {
  var templateLoader = {
    loadTemplate: function(name, templateConfig, callback) {
        if (templateConfig.name) {
            var fullUrl = '/templates/' + templateConfig.name + '.html';
            $.get(fullUrl, function(markupString) {
                // We need an array of DOM nodes, not a string.
                // We can use the default loader to convert to the
                // required format.
                ko.components.defaultLoader.loadTemplate(name, markupString, callback);
            });
        } else {
            // Unrecognized config format. Let another loader handle it.
            callback(null);
        }
    }
  };
   
  ko.components.loaders.unshift(templateLoader);
  
  ko.components.register('defaultstatblock', {
    viewModel: params => { return params.creature.StatBlock || params.creature; },
    template: { name: 'defaultstatblock' }
  });
  
  ko.components.register('activestatblock', {
    viewModel: params => { return params.creature; },
    template: { name: 'activestatblock' }
  });
}