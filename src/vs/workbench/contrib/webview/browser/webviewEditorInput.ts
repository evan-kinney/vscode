/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Lazy } from 'vs/base/common/lazy';
import { URI } from 'vs/base/common/uri';
import { EditorInput, GroupIdentifier, IEditorInput, Verbosity } from 'vs/workbench/common/editor';
import { IWebviewService, WebviewIcons, WebviewOverlay } from 'vs/workbench/contrib/webview/browser/webview';

const WebviewPanelResourceScheme = 'webview-panel';

export class WebviewInput extends EditorInput {

	public static typeId = 'workbench.editors.webviewInput';

	private _name: string;
	private _iconPath?: WebviewIcons;
	private _group?: GroupIdentifier;

	private readonly _webview: Lazy<WebviewOverlay>;
	private _didSomeoneTakeMyWebview = false;

	get resource() {
		return URI.from({
			scheme: WebviewPanelResourceScheme,
			path: `webview-panel/webview-${this.id}`
		});
	}

	constructor(
		public readonly id: string,
		public readonly viewType: string,
		name: string,
		webview: Lazy<WebviewOverlay>,
		@IWebviewService private readonly _webviewService: IWebviewService,
	) {
		super();
		this._name = name;
		this._webview = webview;
	}

	dispose() {
		if (!this.isDisposed()) {
			if (!this._didSomeoneTakeMyWebview) {
				this._webview?.rawValue?.dispose();
			}
		}
		super.dispose();
	}

	public getTypeId(): string {
		return WebviewInput.typeId;
	}

	public getName(): string {
		return this._name;
	}

	public getTitle(_verbosity?: Verbosity): string {
		return this.getName();
	}

	public getDescription(): string | undefined {
		return undefined;
	}

	public setName(value: string): void {
		this._name = value;
		this._onDidChangeLabel.fire();
	}

	public get webview(): WebviewOverlay {
		return this._webview.getValue();
	}

	public get extension() {
		return this.webview.extension;
	}

	public get iconPath() {
		return this._iconPath;
	}

	public set iconPath(value: WebviewIcons | undefined) {
		this._iconPath = value;
		this._webviewService.setIcons(this.id, value);
	}

	public matches(other: IEditorInput): boolean {
		return other === this;
	}

	public get group(): GroupIdentifier | undefined {
		return this._group;
	}

	public updateGroup(group: GroupIdentifier): void {
		this._group = group;
	}

	public async resolve(): Promise<null> {
		return null;
	}

	public supportsSplitEditor() {
		return false;
	}

	protected takeOwnershipOfWebview(): WebviewOverlay | undefined {
		if (this._didSomeoneTakeMyWebview) {
			return undefined;
		}
		this._didSomeoneTakeMyWebview = true;
		return this.webview;
	}
}
