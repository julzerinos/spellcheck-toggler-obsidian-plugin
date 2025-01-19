import { ViewPlugin } from '@codemirror/view'

import { ApplySpellcheckAttributePluginValue } from './apply-spellcheck-plugin'
import {
    SpellcheckTogglerSettings,
} from 'src/settings'

class InternalLinkSpellcheckPluginValue extends ApplySpellcheckAttributePluginValue {
    protected nodeName: string = 'hmd-internal-link'
    protected settingsKey: keyof SpellcheckTogglerSettings = 'internalLinks'
}

export const internalLinkSpellcheckViewPlugin = ViewPlugin.fromClass(
    InternalLinkSpellcheckPluginValue,
    {
        decorations: (pluginValue) => pluginValue.decorations,
    },
)
