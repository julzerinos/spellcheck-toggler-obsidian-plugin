import { ViewPlugin } from '@codemirror/view'

import {
    ApplySpellcheckAttributePluginValue,
    checkNodeEligibility,
} from './apply-spellcheck-plugin'
import { SyntaxNodeRef } from '@lezer/common'

class AnyNodeSpellcheckPluginValue extends ApplySpellcheckAttributePluginValue {
    protected isNodeEligible(node: SyntaxNodeRef): boolean {
        return checkNodeEligibility('anyNode')
    }
}

export const anyNodeSpellcheckPluginValue = ViewPlugin.fromClass(
    AnyNodeSpellcheckPluginValue,
    {
        decorations: (pluginValue) => pluginValue.decorations,
    },
)
