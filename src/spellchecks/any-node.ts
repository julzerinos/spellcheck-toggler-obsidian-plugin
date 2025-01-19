import { ViewPlugin } from '@codemirror/view'

import { ApplySpellcheckAttributePluginValue } from './apply-spellcheck-plugin'
import { SpellcheckTogglerSettings } from 'src/settings'

class AnyNodeSpellcheckPluginValue extends ApplySpellcheckAttributePluginValue {
    protected nodeName: string = ''
    protected settingsKey: keyof SpellcheckTogglerSettings = 'anyNode'
}

export const htmlCommentSpellcheckPluginValue = ViewPlugin.fromClass(
    AnyNodeSpellcheckPluginValue,
    {
        decorations: (pluginValue) => pluginValue.decorations,
    },
)
