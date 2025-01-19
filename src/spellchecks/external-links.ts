import { ViewPlugin } from '@codemirror/view'

import { ApplySpellcheckAttributePluginValue } from './apply-spellcheck-plugin'
import { SpellcheckTogglerSettings } from 'src/settings'

class ExternalLinkSpellcheckPluginValue extends ApplySpellcheckAttributePluginValue {
    protected nodeName: string = 'link'
    protected settingsKey: keyof SpellcheckTogglerSettings = 'externalLinks'
}

export const externalLinkSpellcheckViewPlugin = ViewPlugin.fromClass(
    ExternalLinkSpellcheckPluginValue,
    {
        decorations: (pluginValue) => pluginValue.decorations,
    },
)
