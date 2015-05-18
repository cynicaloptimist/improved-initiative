var ImprovedInitiative;
(function (ImprovedInitiative) {
    ko.bindingHandlers.focusOnRender = {
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
            //unwrap this so Knockout knows this update depends on the array's state
            ko.unwrap(viewModel.UserResponseRequests);
            $(element).find(valueAccessor()).select();
        }
    };
})(ImprovedInitiative || (ImprovedInitiative = {}));
