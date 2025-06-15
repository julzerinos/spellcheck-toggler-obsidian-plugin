import { ViewPlugin } from '@codemirror/view'
import { SyntaxNodeRef } from '@lezer/common'

import {
    ApplySpellcheckAttributePluginValue,
    checkNodeEligibility,
} from './apply-spellcheck-plugin'

class ExternalLinkSpellcheckPluginValue extends ApplySpellcheckAttributePluginValue {
    protected isNodeEligible(node: SyntaxNodeRef): boolean {        
        if (node.type.name.match(/^link|.*_link$/) === null) return false

        return checkNodeEligibility('externalLinks')
    }
}

export const externalLinkSpellcheckViewPlugin = ViewPlugin.fromClass(
    ExternalLinkSpellcheckPluginValue,
    {
        decorations: (pluginValue) => pluginValue.decorations,
    },
)
