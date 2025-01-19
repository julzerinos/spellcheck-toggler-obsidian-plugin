import { ViewPlugin } from '@codemirror/view'

import { ApplySpellcheckAttributePluginValue } from './apply-spellcheck-plugin'
import { SpellcheckTogglerSettings } from 'src/settings'

class HtmlCommentSpellcheckPluginValue extends ApplySpellcheckAttributePluginValue {
    protected nodeName: string = 'comment'
    protected settingsKey: keyof SpellcheckTogglerSettings = 'htmlComments'
}

export const htmlCommentSpellcheckPluginValue = ViewPlugin.fromClass(
    HtmlCommentSpellcheckPluginValue,
    {
        decorations: (pluginValue) => pluginValue.decorations,
    },
)
