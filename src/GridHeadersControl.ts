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
        static HeadersSourceProperty = DependencyProperty.Register("HeadersSource", () => IEnumerable_, GridHeadersControl, null, (d, args) => (<GridHeadersControl>d).OnHeadersSourceChanged(args.OldValue, args.NewValue));
        Headers: GridHeaderCollection;

        constructor() {
            super();
            this.DefaultStyleKey = (<any>this).constructor;
            var coll = GridHeadersControl.HeadersProperty.Initialize(this);
            coll.CollectionChanged.Subscribe(this._HeadersChanged, this);
            coll.ItemChanged.Subscribe(this._HeaderChanged, this);
        }

        OnHeadersSourceChanged(oldHeadersSource: IEnumerable<any>, newHeadersSource: IEnumerable<any>) {
            var nc = Collections.INotifyCollectionChanged_.As(oldHeadersSource);
            if (nc)
                nc.CollectionChanged.Unsubscribe(this._OnHeadersSourceUpdated, this);
            if (oldHeadersSource)
                this._RemoveHeaders(0, EnumerableEx.ToArray(oldHeadersSource));
            if (newHeadersSource)
                this._AddHeaders(0, EnumerableEx.ToArray(newHeadersSource));
            var nc = Collections.INotifyCollectionChanged_.As(newHeadersSource);
            if (nc)
                nc.CollectionChanged.Subscribe(this._OnHeadersSourceUpdated, this);
        }
        private _OnHeadersSourceUpdated(sender: any, e: Collections.CollectionChangedEventArgs) {
            switch (e.Action) {
                case Collections.CollectionChangedAction.Add:
                    this._AddHeaders(e.NewStartingIndex, e.NewItems);
                    break;
                case Collections.CollectionChangedAction.Remove:
                    this._RemoveHeaders(e.OldStartingIndex, e.OldItems);
                    break;
                case Collections.CollectionChangedAction.Replace:
                    this._RemoveHeaders(e.NewStartingIndex, e.OldItems);
                    this._AddHeaders(e.NewStartingIndex, e.NewItems);
                    break;
                case Collections.CollectionChangedAction.Reset:
                    this._RemoveHeaders(0, e.OldItems);
                    break;
            }
        }

        private _createHeader(header: string): GridHeader {
            var hdr = new GridHeader();
            hdr.Header = header;
            return hdr;
        }

        private _AddHeaders(index: number, newHeaders: any[]) {
            for (var i = 0, hdrs = this.Headers, len = newHeaders.length; i < len; i++) {
                var hrd = this._createHeader(newHeaders[i]);
                hdrs.Insert(index + i, hrd);
            }
        }
        private _RemoveHeaders(index: number, oldHeaders: any[]) {
            for (var i = 0, hrds = this.Headers, ht = hrds._ht, len = oldHeaders.length; i < len; i++) {
                var c = oldHeaders[i];
                for (var j = 0; j < ht.length; j++ ) {
                    if (c === (<GridHeader>ht[j]).Header) {
                        hrds.RemoveAt(j);
                        break;
                    }
                }
            }
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