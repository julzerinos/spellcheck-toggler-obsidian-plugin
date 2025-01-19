import { ViewPlugin } from '@codemirror/view'
import { SyntaxNodeRef } from '@lezer/common'

import {
    ApplySpellcheckAttributePluginValue,
    checkNodeEligibility,
} from './apply-spellcheck-plugin'

class InternalLinkSpellcheckPluginValue extends ApplySpellcheckAttributePluginValue {
    protected isNodeEligible(node: SyntaxNodeRef): boolean {
        if (!node.type.name.startsWith('hmd-internal-link')) return false

        return checkNodeEligibility('internalLinks')
    }
}

export const internalLinkSpellcheckViewPlugin = ViewPlugin.fromClass(
    InternalLinkSpellcheckPluginValue,
    {
        decorations: (pluginValue) => pluginValue.decorations,
    },
)
