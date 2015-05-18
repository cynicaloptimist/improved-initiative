var ImprovedInitiative;
(function (ImprovedInitiative) {
    var UserResponseRequest = (function () {
        function UserResponseRequest(requestContent, inputSelector, callback, stack) {
            var _this = this;
            this.requestContent = requestContent;
            this.inputSelector = inputSelector;
            this.callback = callback;
            this.HandleResponse = function (form) {
                _this.callback($(form).find(_this.inputSelector).val());
                _this.stack.remove(_this);
                return false;
            };
            this.stack = stack;
        }
        return UserResponseRequest;
    })();
    ImprovedInitiative.UserResponseRequest = UserResponseRequest;
})(ImprovedInitiative || (ImprovedInitiative = {}));
