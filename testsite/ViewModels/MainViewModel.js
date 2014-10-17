var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../Models/TestItem"], function(require, exports, TestItem) {
    var MainViewModel = (function (_super) {
        __extends(MainViewModel, _super);
        function MainViewModel() {
            _super.call(this);
            this.Items = new Fayde.Collections.ObservableCollection();
            this.Cols = new Fayde.Collections.ObservableCollection();
            this.Items.AddRange([
                new TestItem("First1", "Last1", 10),
                new TestItem("First2", "Last2", 12),
                new TestItem("First3", "Last3", 13),
                new TestItem("First4", "Last4", 14)
            ]);
            this.Cols.Add("Test1");
            this.Cols.Add("Test2");
        }
        MainViewModel.prototype.RemoveItem = function (args) {
            if (!args.parameter)
                return;
            this.Items.Remove(args.parameter);
        };
        return MainViewModel;
    })(Fayde.MVVM.ViewModelBase);
    
    return MainViewModel;
});
//# sourceMappingURL=MainViewModel.js.map
