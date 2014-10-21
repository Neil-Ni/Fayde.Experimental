module Fayde.Experimental {
    export class GridTemplateCell extends GridCell {
        GoToStateEditing(gotoFunc: (state: string) => boolean): boolean {
            if (!this.EditTemplate)
                return gotoFunc("Display");
            return gotoFunc(this.IsEditing ? (this.IsEditable ? "Edit" : "NotEditable") : "Display");
        }
    }
}