import { ViewPlugin } from '@codemirror/view'
import { SyntaxNodeRef } from '@lezer/common'

import {
    ApplySpellcheckAttributePluginValue,
    checkNodeEligibility,
} from './apply-spellcheck-plugin'

class StrongSpellcheckPluginValue extends ApplySpellcheckAttributePluginValue {
    protected isNodeEligible(node: SyntaxNodeRef): boolean {
        if (!node.type.name.startsWith('strong')) return false

        return checkNodeEligibility('strong')
    }
}

export const strongSpellcheckPluginValue = ViewPlugin.fromClass(
    StrongSpellcheckPluginValue,
    {
        decorations: (pluginValue) => pluginValue.decorations,
    },
)
