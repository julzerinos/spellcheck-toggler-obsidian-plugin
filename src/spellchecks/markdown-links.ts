import { ViewPlugin } from '@codemirror/view'
import { SyntaxNodeRef } from '@lezer/common'

import {
    ApplySpellcheckAttributePluginValue,
    checkNodeEligibility,
} from './apply-spellcheck-plugin'

class MarkdownLinkSpellcheckPluginValue extends ApplySpellcheckAttributePluginValue {
    protected isNodeEligible(node: SyntaxNodeRef): boolean {
        if (
            node.type.name.match(/^link|.*_link$/) === null ||
            node.type.name.contains('hmd-barelink') // TODO: Collate this into the regex
        )
            return false

        return checkNodeEligibility('externalLinks')
    }
}

export const markdownLinkSpellcheckViewPlugin = ViewPlugin.fromClass(
    MarkdownLinkSpellcheckPluginValue,
    {
        decorations: (pluginValue) => pluginValue.decorations,
    },
)
