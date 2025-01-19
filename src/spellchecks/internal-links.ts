import { ViewPlugin } from '@codemirror/view'
import { SyntaxNodeRef } from '@lezer/common'

import { ApplySpellcheckAttributePluginValue } from './apply-spellcheck-plugin'

class InternalLinkSpellcheckPluginValue extends ApplySpellcheckAttributePluginValue {
    public isNodeEligible(node: SyntaxNodeRef): boolean {
        return node.type.name.startsWith('hmd-internal-link')
    }
}

export const internalLinkSpellcheckViewPlugin = ViewPlugin.fromClass(
    InternalLinkSpellcheckPluginValue,
    {
        decorations: (pluginValue) => pluginValue.decorations,
    },
)
