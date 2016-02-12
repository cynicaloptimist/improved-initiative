module ImprovedInitiative {
  var templateLoader = {
    loadTemplate: function(name, templateConfig, callback) {
        if (templateConfig.name) {
            var fullUrl = '/templates/' + templateConfig.name;
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
  
  ko.components.register('settings', {
    viewModel: (params) => {
        return {
            Commander: params.commander,
            ShowTab: (tabSelector: string) => {
                $('.settings .tab').hide();
                $(`.settings ${tabSelector}`).show();
            },
            ExportData: () => {
                saveAs(new Blob([[JSON.stringify({Hello:"World"}, null, 2)]], {type : 'application/json'}),'hello_world.txt');
            }
        }
    },
    template: { name: 'settings' }
  });
  
  ko.components.register('defaultstatblock', {
    viewModel: params => { return params.creature; },
    template: { name: 'defaultstatblock' }
  });
  
  ko.components.register('activestatblock', {
    viewModel: params => { return params.creature; },
    template: { name: 'activestatblock' }
  });
  
  ko.components.register('combatant', {
    viewModel: function(params) {
      params.creature.ViewModel = new CombatantViewModel(params.creature, params.addUserPoll);
      return params.creature.ViewModel;
    },
    template: { name: 'combatant' }
  })
  
  ko.components.register('playerdisplaycombatant', {
    viewModel: params => { return params.creature; },
    template: { name: 'playerdisplaycombatant' }
  })

}