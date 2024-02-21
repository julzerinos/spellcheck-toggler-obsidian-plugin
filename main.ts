import { Plugin } from 'obsidian';

import {
	Decoration,
	DecorationSet,
	EditorView,
	PluginValue,
	ViewPlugin,
	ViewUpdate,
} from "@codemirror/view";
import { RangeSetBuilder } from '@codemirror/state';
import { syntaxTree } from "@codemirror/language";

export class UnspellcheckLinksPluginValue implements PluginValue {
	decorations: DecorationSet;

	constructor(view: EditorView) {
		this.decorations = this.buildDecorations(view);
	}

	update(update: ViewUpdate) {
		if (!update.docChanged && !update.viewportChanged) return

		this.decorations = this.buildDecorations(update.view);

	}

	buildDecorations(view: EditorView): DecorationSet {
		const builder = new RangeSetBuilder<Decoration>();
		const markSpellcheckFalse = Decoration.mark({
			attributes: { "spellcheck": "false" }
		})

		for (let { from, to } of view.visibleRanges)
			syntaxTree(view.state).iterate({
				from,
				to,
				enter(node) {
					if (node.type.name.startsWith("link") || node.type.name.startsWith("hmd-internal-link"))
						builder.add(node.from, node.to, markSpellcheckFalse)
				}

			});


		return builder.finish();
	}

}

export const unspellcheckLinksPluginValue = ViewPlugin.fromClass(UnspellcheckLinksPluginValue, {
	decorations: (pluginValue) => pluginValue.decorations
})

export default class UnspellcheckLinksPlugin extends Plugin {
	onload(): void {
		this.registerEditorExtension([unspellcheckLinksPluginValue])
	}
}
