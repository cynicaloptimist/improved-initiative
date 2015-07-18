interface KnockoutBindingHandlers {
  focusOnRender: KnockoutBindingHandler;
  afterRender: KnockoutBindingHandler;
  onEnter: KnockoutBindingHandler;
  uiText: KnockoutBindingHandler;
  format: KnockoutBindingHandler;
}
	
module ImprovedInitiative {
	ko.bindingHandlers.focusOnRender = {
    update: (element: any, valueAccessor: () => any, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: ViewModel, bindingContext?: KnockoutBindingContext) => {
      $(element).find(valueAccessor()).select();
    }
  }
  
  ko.bindingHandlers.afterRender = {
    init: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      // This will be called when the binding is first applied to an element
      // Set up any initial state, event handlers, etc. here
      //if (bindingContext.$data.init) bindingContext.$data.init(element, valueAccessor, allBindings, viewModel, bindingContext);
    },
    update: function(element, valueAccessor, allBindings, viewModel, bindingContext) {
      // This will be called once when the binding is first applied to an element,
      // and again whenever any observables/computeds that are accessed change
      // Update the DOM element based on the supplied values here.
      //if (bindingContext.$data.update) bindingContext.$data.update(element, valueAccessor, allBindings, viewModel, bindingContext);
      valueAccessor()(element, valueAccessor, allBindings, viewModel, bindingContext);
    }
  }
  
  ko.bindingHandlers.onEnter = {
    init: (element: any, valueAccessor: () => any, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext) => {
        var callback = valueAccessor();
        $(element).keypress(event => {
            var keyCode = (event.which ? event.which : event.keyCode);
            if (keyCode === 13) {
                callback.call(viewModel);
                return false;
            }
            return true;
        });
    }
  };
  
  ko.bindingHandlers.uiText = {
    update: (element: any, valueAccessor: () => any, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext) => {
      if(uiText[valueAccessor()]){
        $(element).html(uiText[valueAccessor()])
      } else {
        $(element).html(valueAccessor());
      }
      
    }
  }
  
  ko.bindingHandlers.format = {
    init: (element: any, valueAccessor: () => any, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext) => {
      bindingContext['formatString'] = $(element).html();
    },
    update: (element: any, valueAccessor: () => any, allBindingsAccessor?: KnockoutAllBindingsAccessor, viewModel?: any, bindingContext?: KnockoutBindingContext) => {
      var replacements = ko.unwrap(valueAccessor());
      if(!(replacements instanceof Array)){
        replacements = [replacements];
      }
      $(element).html(bindingContext['formatString'].format(replacements));
    }
  }
}