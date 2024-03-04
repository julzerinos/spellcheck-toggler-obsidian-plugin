import { Plugin } from 'obsidian'
import { Extension } from '@codemirror/state'

import {
    internalLinkSpellcheckViewPlugin,
    externalLinkSpellcheckViewPlugin,
} from './spellchecks/links'
import {
    SpellcheckConfiguratorSettingTab,
    SpellcheckConfiguratorSettings,
    defaultSettings,
} from './settings'

export class SpellcheckConfiguratorPlugin extends Plugin {
    settings: SpellcheckConfiguratorSettings
    editorExtensions: Extension[] = []

    async loadSettings() {
        this.settings = Object.assign(
            {},
            defaultSettings,
            await this.loadData(),
        )
    }
    async saveSettings(settings: Partial<SpellcheckConfiguratorSettings>) {
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
    }
    refreshExtensions() {
        this.buildExtensions()
        this.app.workspace.updateOptions()
    }

    async onload(): Promise<void> {
        await this.loadSettings()
        this.addSettingTab(new SpellcheckConfiguratorSettingTab(this.app, this))

        this.buildExtensions()
        this.registerEditorExtension(this.editorExtensions)
    }
}
