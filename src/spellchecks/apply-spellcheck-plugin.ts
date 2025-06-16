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

        const adds = [] as { from: number; to: number }[]

        const enter = (node: SyntaxNodeRef) => {
            if (this.isNodeEligible?.(node))
                adds.push({ from: node.from, to: node.to })
        }

        for (let { from, to } of view.visibleRanges)
            syntaxTree(view.state).iterate({
                from,
                to,
                enter,
            })

        adds.sort((a, b) => a.from - b.from)
        for (const { from, to } of adds) {
            console.debug(
                `[spellcheck-toggler] Set spellcheck to false for node range [ ${from}, ${to} ]`,
            )
            builder.add(from, to, markSpellcheckFalse)
        }

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
        case SpellcheckBehaviourOption.FRONTMATTER:
            const fallback =
                getSpellcheckContextProperty('settings')[settingsKey]
                    .frontmatterFallback

            // TODO test the booleans
            return (
                (isOverrideInFrontmatter && frontmatter[override] === false) ||
                (!isOverrideInFrontmatter &&
                    fallback == SpellcheckBehaviourOption.GLOBAL)
            )
    }

    return false
}
