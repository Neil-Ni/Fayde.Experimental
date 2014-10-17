module Fayde.Experimental {
    export class GridHeadersControlNode extends Fayde.Controls.ControlNode {
        XObject: GridHeadersControl;
        constructor(xobj: GridHeadersControl) {
            super(xobj);
        }

        HeadersPresenter: GridHeadersPresenter = null;
        GetDefaultVisualTree(): UIElement {
            var presenter = this.HeadersPresenter;
            if (!presenter)
                (presenter = new GridHeadersPresenter()).TemplateOwner = this.XObject;
            return presenter;
        }
    }

    export class GridHeadersControl extends Fayde.Controls.Control {
        XamlNode: GridHeadersControlNode;
        CreateNode(): GridHeadersControlNode { return new GridHeadersControlNode(this); }

        static ItemsControlProperty = DependencyProperty.Register("ItemsControl", () => GridItemsControl, GridHeadersControl, undefined, (d, args) => (<GridHeadersControl>d).OnItemsControlChanged(args));
        ItemsControl: GridItemsControl;
        private OnItemsControlChanged(args: DependencyPropertyChangedEventArgs) {
            var presenter = this.XamlNode.HeadersPresenter;
            if (!presenter)
                return;
            presenter.UnlinkControl(args.OldValue);
            presenter.LinkControl(args.NewValue);
        }

        static HeadersProperty = DependencyProperty.RegisterImmutable<GridHeaderCollection>("Headers", () => GridHeaderCollection, GridHeadersControl);
        Headers: GridHeaderCollection;

        constructor() {
            super();
            this.DefaultStyleKey = (<any>this).constructor;
            var coll = GridHeadersControl.HeadersProperty.Initialize(this);
            coll.CollectionChanged.Subscribe(this._HeadersChanged, this);
            coll.ItemChanged.Subscribe(this._HeaderChanged, this);
        }

        private _AddHeaders(index: number, newItems: any[]) {
            //TODO: For every new item
            // Create GridHeader
            // Set Header to new item
            // Add to Headers collection
        }
        private _RemoveHeaders(index: number, oldItems: any[]) {
            //TODO: For every old item
            // Find our GridHeader that has Header = old item
            //      If exists, remove from Headers collection
        }

        private _HeadersChanged(sender: any, e: Collections.CollectionChangedEventArgs) {
            var presenter = this.XamlNode.HeadersPresenter;
            if (!presenter)
                return;
            switch (e.Action) {
                case Collections.CollectionChangedAction.Add:
                    for (var i = 0, len = e.NewItems.length; i < len; i++) {
                        presenter.OnHeaderAdded(e.NewStartingIndex + i, e.NewItems[i]);
                    }
                    break;
                case Collections.CollectionChangedAction.Remove:
                    for (var i = 0, len = e.OldItems.length; i < len; i++) {
                        presenter.OnHeaderRemoved(e.OldStartingIndex + i);
                    }
                    break;
                case Collections.CollectionChangedAction.Replace:
                    presenter.OnHeaderRemoved(e.NewStartingIndex);
                    presenter.OnHeaderAdded(e.NewStartingIndex, e.NewItems[i]);
                    break;
                case Collections.CollectionChangedAction.Reset:
                    presenter.OnHeadersCleared();
                    break;
            }
        }
        private _HeaderChanged(sender: any, e: Internal.ItemChangedEventArgs<GridHeader>) {
            var presenter = this.XamlNode.HeadersPresenter;
            if (!presenter)
                return;
            presenter.OnHeaderChanged(e.Item);
        }
    }
    Xaml.Content(GridHeadersControl, GridHeadersControl.HeadersProperty);
}