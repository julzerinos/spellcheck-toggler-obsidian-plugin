import {
    Decoration,
    DecorationSet,
    EditorView,
    PluginValue,
    ViewUpdate,
} from '@codemirror/view'
import { RangeSetBuilder } from '@codemirror/state'
import { syntaxTree } from '@codemirror/language'
import { SyntaxNodeRef } from '@lezer/common'

import { getSpellcheckContextProperty } from 'src/context'
import {
    SpellcheckBehaviourOption,
    SpellcheckTogglerSettings,
} from 'src/settings'

export class ApplySpellcheckAttributePluginValue implements PluginValue {
    decorations: DecorationSet

    constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view)
    }

    update(update: ViewUpdate) {
        if (!update.docChanged && !update.viewportChanged) return
        this.decorations = this.buildDecorations(update.view)
    }

    protected isNodeEligible?(node: SyntaxNodeRef): boolean

    buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>()
        const markSpellcheckFalse = Decoration.mark({
            attributes: { spellcheck: 'false' },
        })

        const enter = (node: SyntaxNodeRef) => {
            if (this.isNodeEligible?.(node))
                builder.add(node.from, node.to, markSpellcheckFalse)
        }

        for (let { from, to } of view.visibleRanges)
            syntaxTree(view.state).iterate({
                from,
                to,
                enter,
            })

        return builder.finish()
    }
}

export const checkNodeEligibility = (
    settingsKey: keyof SpellcheckTogglerSettings,
) => {
    const frontmatter = getSpellcheckContextProperty('frontmatter')
    const override =
        getSpellcheckContextProperty('settings')[settingsKey]
            .frontmatterOverride

    const isOverrideInFrontmatter =
        frontmatter !== null &&
        override !== undefined &&
        override in frontmatter

    switch (getSpellcheckContextProperty('settings')[settingsKey].behaviour) {
        case SpellcheckBehaviourOption.GLOBAL:
            return true
        case SpellcheckBehaviourOption.OPT_IN:
            return isOverrideInFrontmatter && frontmatter[override] === false
        case SpellcheckBehaviourOption.OPT_OUT:
            return !isOverrideInFrontmatter || frontmatter[override] === false
    }

    return false
}
