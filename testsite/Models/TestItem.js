var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports"], function(require, exports) {
    var TestItem = (function (_super) {
        __extends(TestItem, _super);
        function TestItem(firstName, lastName, age, specialDay) {
            _super.call(this);
            this.FirstName = firstName;
            this.LastName = lastName;
            this.Age = age;
            this.SpecialDay = specialDay;
            this.CreateTime = DateTime.Now.TimeOfDay;
        }
        return TestItem;
    })(Fayde.MVVM.ObservableObject);
    Fayde.MVVM.NotifyProperties(TestItem, ["FirstName", "LastName", "Age", "SpecialDay", "CreateTime"]);
    
    return TestItem;
});
//# sourceMappingURL=TestItem.js.map
