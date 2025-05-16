import { ViewPlugin } from '@codemirror/view'
import { SyntaxNodeRef } from '@lezer/common'

import {
    ApplySpellcheckAttributePluginValue,
    checkNodeEligibility,
} from './apply-spellcheck-plugin'

class BlockQuoteSpellcheckPluginValue extends ApplySpellcheckAttributePluginValue {
    protected isNodeEligible(node: SyntaxNodeRef): boolean {
        if (!node.type.name.startsWith('quote')) return false

        return checkNodeEligibility('blockquote')
    }
}

export const blockQuoteSpellcheckPluginValue = ViewPlugin.fromClass(
    BlockQuoteSpellcheckPluginValue,
    {
        decorations: (pluginValue) => pluginValue.decorations,
    },
)
