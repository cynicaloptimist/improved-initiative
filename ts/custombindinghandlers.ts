interface KnockoutBindingHandlers {
  focusOnRender: KnockoutBindingHandler;
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