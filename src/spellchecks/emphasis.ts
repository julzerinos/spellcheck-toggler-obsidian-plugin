import { ViewPlugin } from '@codemirror/view'
import { SyntaxNodeRef } from '@lezer/common'

import {
    ApplySpellcheckAttributePluginValue,
    checkNodeEligibility,
} from './apply-spellcheck-plugin'

class EmphasisSpellcheckPluginValue extends ApplySpellcheckAttributePluginValue {
    protected isNodeEligible(node: SyntaxNodeRef): boolean {
        if (!node.type.name.startsWith('em')) return false

        return checkNodeEligibility('emphasis')
    }
}

export const emphasisSpellcheckPluginValue = ViewPlugin.fromClass(
    EmphasisSpellcheckPluginValue,
    {
        decorations: (pluginValue) => pluginValue.decorations,
    },
)
