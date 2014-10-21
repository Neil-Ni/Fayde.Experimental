
module Fayde.Experimental {
    import Grid = Fayde.Controls.Grid;

    export class GridItemsControlNode extends Fayde.Controls.ControlNode {
        XObject: GridItemsControl;
        constructor(xobj: GridItemsControl) {
            super(xobj);
        }

        ItemsPresenter: GridItemsPresenter = null;
        GetDefaultVisualTree(): UIElement {
            var presenter = this.ItemsPresenter;
            if (!presenter)
                (presenter = new GridItemsPresenter()).TemplateOwner = this.XObject;
            return presenter;
        }

        private _CreatorListeners: Array<(presenter: GridItemsPresenter) => void> = null;
        ListenForPresenterCreated(func: (presenter: GridItemsPresenter) => void) {
            if (this.ItemsPresenter) {
                func(this.ItemsPresenter);
                return;
            }
            this._CreatorListeners = this._CreatorListeners || [];
            this._CreatorListeners.push(func);
        }
        OnPresenterCreated() {
            var presenter = this.ItemsPresenter;
            if (!presenter)
                return;
            for (var i = 0, listeners = this._CreatorListeners, len = listeners ? listeners.length : 0; i < len; i++) {
                listeners[i](presenter);
            }
            this._CreatorListeners = null;

            this.InitSelection(presenter);

            var gic = this.XObject;
            for (var i = 0, adorners = gic.Adorners.ToArray(), len = adorners.length; i < len; i++) {
                adorners[i].OnAttached(gic);
            }
        }

        private _CellClicked(sender: any, e: CellMouseButtonEventArgs) {
            var row = Grid.GetRow(e.Cell);
            var col = Grid.GetColumn(e.Cell);
            var xobj = this.XObject;
            xobj.SetCurrentValue(GridItemsControl.SelectedRowProperty, row);
        }

        private InitSelection(presenter: GridItemsPresenter) {
            presenter.CellClicked.Subscribe(this._CellClicked, this);
        }
    }

    export class GridItemsControl extends Fayde.Controls.Control {
        XamlNode: GridItemsControlNode;
        CreateNode(): GridItemsControlNode { return new GridItemsControlNode(this); }

        get IsItemsControl(): boolean { return true; }

        get ItemsPresenter(): GridItemsPresenter { return this.XamlNode.ItemsPresenter; }

        static ItemsSourceProperty = DependencyProperty.Register("ItemsSource", () => IEnumerable_, GridItemsControl, null, (d, args) => (<GridItemsControl>d).OnItemsSourceChanged(args.OldValue, args.NewValue));
        static ColumnsSourceProperty = DependencyProperty.Register("ColumnsSource", () => IEnumerable_, GridItemsControl, null, (d, args) => (<GridItemsControl>d).OnColumnsSourceChanged(args.OldValue, args.NewValue));
        static ColumnsProperty = DependencyProperty.RegisterImmutable<GridColumnCollection>("Columns", () => GridColumnCollection, GridItemsControl);
        static AdornersProperty = DependencyProperty.RegisterImmutable<Primitives.GridAdornerCollection>("Adorners", () => Primitives.GridAdornerCollection, GridItemsControl);
        static SelectedItemProperty = DependencyProperty.Register("SelectedItem", () => Object, GridItemsControl, undefined, (d, args) => (<GridItemsControl>d).OnSelectedItemChanged(args.OldValue, args.NewValue));
        static SelectedRowProperty = DependencyProperty.Register("SelectedRow", () => Number, GridItemsControl, -1, (d, args) => (<GridItemsControl>d).OnSelectedRowChanged(args.OldValue, args.NewValue));
        static EditingItemProperty = DependencyProperty.Register("EditingItem", () => Object, GridItemsControl, undefined, (d, args) => (<GridItemsControl>d).OnEditingItemChanged(args.OldValue, args.NewValue));
        static EditingRowProperty = DependencyProperty.Register("EditingRow", () => Number, GridItemsControl, -1, (d, args) => (<GridItemsControl>d).OnEditingRowChanged(args.OldValue, args.NewValue));
        ItemsSource: IEnumerable<any>;
        ColumnsSource: IEnumerable<any>;
        Columns: GridColumnCollection;
        Adorners: Primitives.GridAdornerCollection;
        SelectedItem: any;
        SelectedRow: number;
        EditingItem: any;
        EditingRow: number;

        SelectionChanged = new MulticastEvent<SelectionChangedEventArgs>();
        OnSelectionChanged() {
            this.SelectionChanged.Raise(this, new SelectionChangedEventArgs(this.SelectedItem, this.SelectedRow));
        }

        EditingChanged = new MulticastEvent<EditingChangedEventArgs>();
        OnEditingChanged() {
            var item = this.EditingItem;
            var row = this.EditingRow;
            this.ItemsPresenter.OnEditingItemChanged(item, row);
            this.EditingChanged.Raise(this, new EditingChangedEventArgs(item, row));
        }

        OnItemsSourceChanged(oldItemsSource: IEnumerable<any>, newItemsSource: IEnumerable<any>) {
            var nc = Collections.INotifyCollectionChanged_.As(oldItemsSource);
            if (nc)
                nc.CollectionChanged.Unsubscribe(this._OnItemsSourceUpdated, this);
            if (oldItemsSource)
                this._RemoveItems(0, this._Items);
            if (newItemsSource)
                this._AddItems(0, EnumerableEx.ToArray(newItemsSource));
            var nc = Collections.INotifyCollectionChanged_.As(newItemsSource);
            if (nc)
                nc.CollectionChanged.Subscribe(this._OnItemsSourceUpdated, this);
        }
        private _OnItemsSourceUpdated(sender: any, e: Collections.CollectionChangedEventArgs) {
            switch (e.Action) {
                case Collections.CollectionChangedAction.Add:
                    this._AddItems(e.NewStartingIndex, e.NewItems);
                    break;
                case Collections.CollectionChangedAction.Remove:
                    this._RemoveItems(e.OldStartingIndex, e.OldItems);
                    break;
                case Collections.CollectionChangedAction.Replace:
                    this._RemoveItems(e.NewStartingIndex, e.OldItems);
                    this._AddItems(e.NewStartingIndex, e.NewItems);
                    break;
                case Collections.CollectionChangedAction.Reset:
                    this._RemoveItems(0, e.OldItems);
                    break;
            }
        }

        OnColumnsSourceChanged(oldColumnsSource: IEnumerable<any>, newColumnsSource: IEnumerable<any>) {
            var nc = Collections.INotifyCollectionChanged_.As(oldColumnsSource);
            if (nc)
                nc.CollectionChanged.Unsubscribe(this._OnColumnsSourceUpdated, this);
            if (oldColumnsSource)
                this._RemoveColumns(0, EnumerableEx.ToArray(oldColumnsSource));
            if (newColumnsSource)
                this._AddColumns(0, EnumerableEx.ToArray(newColumnsSource));
            var nc = Collections.INotifyCollectionChanged_.As(newColumnsSource);
            if (nc)
                nc.CollectionChanged.Subscribe(this._OnColumnsSourceUpdated, this);
        }

        private _OnColumnsSourceUpdated(sender: any, e: Collections.CollectionChangedEventArgs) {
            switch (e.Action) {
                case Collections.CollectionChangedAction.Add:
                    this._AddColumns(e.NewStartingIndex, e.NewItems);
                    break;
                case Collections.CollectionChangedAction.Remove:
                    this._RemoveColumns(e.OldStartingIndex, e.OldItems);
                    break;
                case Collections.CollectionChangedAction.Replace:
                    this._RemoveColumns(e.NewStartingIndex, e.OldItems);
                    this._AddColumns(e.NewStartingIndex, e.NewItems);
                    break;
                case Collections.CollectionChangedAction.Reset:
                    this._RemoveColumns(0, e.OldItems);
                    break;
            }
        }

        private _IsCoercingSel = false;
        OnSelectedItemChanged(oldItem: any, newItem: any) {
            if (this._IsCoercingSel)
                return;
            try {
                this._IsCoercingSel = true;
                this.SetCurrentValue(GridItemsControl.SelectedRowProperty, this._Items.indexOf(newItem));
            } finally {
                this._IsCoercingSel = false;
            }
            this.OnSelectionChanged();
        }
        OnSelectedRowChanged(oldRow: number, newRow: number) {
            if (this._IsCoercingSel)
                return;
            try {
                this._IsCoercingSel = true;
                this.SetCurrentValue(GridItemsControl.SelectedItemProperty, (newRow > -1 && newRow < this._Items.length) ? this._Items[newRow] : undefined);
            } finally {
                this._IsCoercingSel = false;
            }
            this.OnSelectionChanged();
        }

        private _IsCoercingEdit = false;
        OnEditingItemChanged(oldItem: any, newItem: any) {
            if (this._IsCoercingEdit)
                return;
            try {
                this._IsCoercingEdit = true;
                this.SetCurrentValue(GridItemsControl.EditingRowProperty, this._Items.indexOf(newItem));
            } finally {
                this._IsCoercingEdit = false;
            }
            this.OnEditingChanged();
        }
        OnEditingRowChanged(oldRow: number, newRow: number) {
            if (this._IsCoercingEdit)
                return;
            try {
                this._IsCoercingEdit = true;
                this.SetCurrentValue(GridItemsControl.EditingItemProperty, (newRow > -1 && newRow < this._Items.length) ? this._Items[newRow] : undefined);
            } finally {
                this._IsCoercingEdit = false;
            }
            this.OnEditingChanged();
        }
        
        private _ToggleEditCommand: MVVM.RelayCommand;

        private _Items: any[] = [];
        get Items(): any[] { return this._Items; }
        private _AddItems(index: number, newItems: any[]) {
            var items = this._Items;
            for (var i = 0, len = newItems.length; i < len; i++) {
                items.splice(index + i, 0, newItems[i]);
            }
            this.OnItemsAdded(index, newItems);
        }
        private _RemoveItems(index: number, oldItems: any[]) {
            this._Items.splice(index, oldItems.length);
            this.OnItemsRemoved(index, oldItems);
        }

        private _createTextColumn(displayMemberPath: string): GridTextColumn {
            var col = new GridTextColumn();
            col.DisplayMemberPath = displayMemberPath;
            col.IsEditable = true;
            return col;
        }
        
        private _AddColumns(index: number, newColumns: any[]) {
            for (var i = 0, cols = this.Columns, len = newColumns.length; i < len; i++) {
                var col = this._createTextColumn(newColumns[i]);
                cols.Insert(index + i, col);
            }
        }
        private _RemoveColumns(index: number, oldColumns: any[]) {
            for (var i = 0, cols = this.Columns, ht = cols._ht, len = oldColumns.length; i < len; i++) {
                var c = oldColumns[i];
                for (var j = 0; j < ht.length; j++ ) {
                    if (c === (<GridTextColumn>ht[j]).DisplayMemberPath) {
                        cols.RemoveAt(j);
                        break;
                    }
                }
            }
        }

        get ToggleEditCommand(): MVVM.RelayCommand { return this._ToggleEditCommand; }

        constructor() {
            super();
            this.DefaultStyleKey = (<any>this).constructor;

            this._ToggleEditCommand = new MVVM.RelayCommand((args: IEventBindingArgs<Input.MouseButtonEventArgs>) => this.EditingItem = (this.EditingItem === args.parameter) ? undefined : args.parameter);

            var cols = GridItemsControl.ColumnsProperty.Initialize(this);
            cols.CollectionChanged.Subscribe(this._ColumnsChanged, this);
            cols.ItemChanged.Subscribe(this._ColumnChanged, this);

            var ads = GridItemsControl.AdornersProperty.Initialize(this);
            ads.CollectionChanged.Subscribe(this._AdornersChanged, this);
        }

        OnItemsAdded(index: number, newItems: any[]) {
            var presenter = this.XamlNode.ItemsPresenter;
            if (presenter)
                presenter.OnItemsAdded(index, newItems);
            var item = this.SelectedItem;
            var row = this.SelectedRow;
            if (item === undefined && row > -1) {
                this.SetCurrentValue(GridItemsControl.SelectedItemProperty, this._Items[row]);
            } else if (item !== undefined && row < 0) {
                this.SetCurrentValue(GridItemsControl.SelectedRowProperty, this._Items.indexOf(item));
            }
        }
        OnItemsRemoved(index: number, oldItems: any[]) {
            var presenter = this.XamlNode.ItemsPresenter;
            if (presenter)
                presenter.OnItemsRemoved(index, oldItems);
            var item = this.SelectedItem;
            var row = this.SelectedRow;
            if (item !== undefined && oldItems.indexOf(item) > -1) {
                this.SetCurrentValue(GridItemsControl.SelectedItemProperty, undefined);
            } else if (row > -1 && (row >= index && row < (index + oldItems.length))) {
                this.SetCurrentValue(GridItemsControl.SelectedRowProperty, -1);
            }
        }

        private _ColumnsChanged(sender: any, e: Collections.CollectionChangedEventArgs) {
            var presenter = this.XamlNode.ItemsPresenter;
            if (!presenter)
                return;
            switch (e.Action) {
                case Collections.CollectionChangedAction.Add:
                    for (var i = 0, len = e.NewItems.length; i < len; i++) {
                        presenter.OnColumnAdded(e.NewStartingIndex + i, e.NewItems[i]);
                    }
                    break;
                case Collections.CollectionChangedAction.Remove:
                    for (var i = 0, len = e.OldItems.length; i < len; i++) {
                        presenter.OnColumnRemoved(e.OldStartingIndex + i);
                    }
                    break;
                case Collections.CollectionChangedAction.Replace:
                    presenter.OnColumnRemoved(e.NewStartingIndex);
                    presenter.OnColumnAdded(e.NewStartingIndex, e.NewItems[i]);
                    break;
                case Collections.CollectionChangedAction.Reset:
                    presenter.OnColumnsCleared();
                    break;
            }
            for (var en = this.Adorners.getEnumerator(); en.moveNext();) {
                en.current.OnShapeChanged(this);
            }
        }
        private _ColumnChanged(sender: any, e: Internal.ItemChangedEventArgs<GridColumn>) {
            var presenter = this.XamlNode.ItemsPresenter;
            if (!presenter)
                return;
            presenter.OnColumnChanged(e.Item);
        }

        private _AdornersChanged(sender: any, e: Collections.CollectionChangedEventArgs) {
            var presenter = this.XamlNode.ItemsPresenter;
            if (!presenter)
                return;

            var oldItems = <Primitives.GridAdorner[]>e.NewItems;
            for (var i = 0, len = oldItems ? oldItems.length : 0; i < len; i++) {
                oldItems[i].OnDetached(this);
            }

            var newItems = <Primitives.GridAdorner[]>e.NewItems;
            for (var i = 0, len = newItems ? newItems.length : 0; i < len; i++) {
                newItems[i].OnAttached(this);
            }
        }
    }
    Xaml.Content(GridItemsControl, GridItemsControl.ColumnsProperty);
}