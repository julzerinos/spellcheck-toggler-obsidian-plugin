import { ViewPlugin } from '@codemirror/view'
import { SyntaxNodeRef } from '@lezer/common'

import { ApplySpellcheckAttributePluginValue } from './apply-spellcheck-plugin'

class ExternalLinkSpellcheckPluginValue extends ApplySpellcheckAttributePluginValue {
    public isNodeEligible(node: SyntaxNodeRef): boolean {
        return node.type.name.startsWith('link')
    }
}

export const externalLinkSpellcheckViewPlugin = ViewPlugin.fromClass(
    ExternalLinkSpellcheckPluginValue,
    {
        decorations: (pluginValue) => pluginValue.decorations,
    },
)
