import { Plugin } from 'obsidian'
import { Extension } from '@codemirror/state'

import {
    internalLinkSpellcheckViewPlugin,
    externalLinkSpellcheckViewPlugin,
} from './spellchecks/links'
import {
    SpellcheckTogglerSettingTab,
    SpellcheckTogglerSettings,
    defaultSettings,
} from './settings'
import { htmlCommentSpellcheckPluginValue } from './spellchecks/html'

export class SpellcheckTogglerPlugin extends Plugin {
    settings: SpellcheckTogglerSettings
    editorExtensions: Extension[] = []

    async loadSettings() {
        this.settings = Object.assign(
            {},
            defaultSettings,
            await this.loadData(),
        )
    }
    
    async saveSettings(settings: Partial<SpellcheckTogglerSettings>) {
        this.settings = { ...this.settings, ...settings }
        this.refreshExtensions()
        await this.saveData(this.settings)
    }

    buildExtensions() {
        this.editorExtensions.length = 0

        if (!this.settings.spellcheckInternalLinks)
            this.editorExtensions.push(internalLinkSpellcheckViewPlugin)

        if (!this.settings.spellcheckExternalLinks)
            this.editorExtensions.push(externalLinkSpellcheckViewPlugin)

        if (!this.settings.spellcheckHtmlComments)
            this.editorExtensions.push(htmlCommentSpellcheckPluginValue)
    }

    refreshExtensions() {
        this.buildExtensions()
        this.app.workspace.updateOptions()
    }

    async onload(): Promise<void> {
        await this.loadSettings()
        this.addSettingTab(new SpellcheckTogglerSettingTab(this.app, this))

        this.buildExtensions()
        this.registerEditorExtension(this.editorExtensions)
    }
}
