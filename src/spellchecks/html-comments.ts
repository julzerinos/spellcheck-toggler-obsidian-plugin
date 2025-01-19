import { ViewPlugin } from '@codemirror/view'
import { SyntaxNodeRef } from '@lezer/common'

import { ApplySpellcheckAttributePluginValue } from "./apply-spellcheck-plugin"

class HtmlCommentSpellcheckPluginValue extends ApplySpellcheckAttributePluginValue {
    public isNodeEligible(node: SyntaxNodeRef): boolean {
        return node.type.name.startsWith('comment')
    }
}

export const htmlCommentSpellcheckPluginValue = ViewPlugin.fromClass(
    HtmlCommentSpellcheckPluginValue,
    {
        decorations: (pluginValue) => pluginValue.decorations,
    },
)
