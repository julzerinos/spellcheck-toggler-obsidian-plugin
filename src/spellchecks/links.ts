import { ViewPlugin } from '@codemirror/view'
import { SyntaxNodeRef } from '@lezer/common'

import { ApplySpellcheckAttributePluginValue } from './logic'

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
