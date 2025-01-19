import { EventRef, Plugin, TFile } from 'obsidian'
import { Extension } from '@codemirror/state'

import {
    SpellcheckOption,
    SpellcheckTogglerSettingTab,
    SpellcheckTogglerSettings,
    defaultSettings,
} from './settings'
import {
    externalLinkSpellcheckViewPlugin,
    htmlCommentSpellcheckPluginValue,
    internalLinkSpellcheckViewPlugin,
} from './spellchecks'

export class SpellcheckTogglerPlugin extends Plugin {
    settings: SpellcheckTogglerSettings
    editorExtensions: Extension[] = []
    onFileOpenEventRef: EventRef

    async loadSettings() {
        const userSettings: SpellcheckTogglerSettings = await this.loadData()
        this.settings = { ...defaultSettings, ...userSettings }
    }

    async saveSettings(settings: Partial<SpellcheckTogglerSettings>) {
        this.settings = { ...this.settings, ...settings }
        this.refreshExtensions()
        await this.saveData(this.settings)
    }

    buildExtensions() {
        this.editorExtensions.length = 0

        if (!this.settings.internalLinks)
            this.editorExtensions.push(internalLinkSpellcheckViewPlugin)

        if (!this.settings.externalLinks)
            this.editorExtensions.push(externalLinkSpellcheckViewPlugin)

        if (!this.settings.htmlComments)
            this.editorExtensions.push(htmlCommentSpellcheckPluginValue)
    }

    refreshExtensions() {
        this.buildExtensions()
        this.app.workspace.updateOptions()
    }

    onFileOpen(file: TFile | null) {
        if (!file) return

        const frontmatter =
            this.app.metadataCache.getFileCache(file)?.frontmatter

        console.log(frontmatter)

        // updateSpellcheckContext({ currentFrontmatter: frontmatter ?? null })
    }

    async onload(): Promise<void> {
        await this.loadSettings()
        this.addSettingTab(new SpellcheckTogglerSettingTab(this.app, this))

        this.buildExtensions()
        this.registerEditorExtension(this.editorExtensions)

        this.onFileOpenEventRef = this.app.workspace.on(
            'file-open',
            this.onFileOpen.bind(this),
        )
    }

    unload(): void {
        this.app.workspace.offref(this.onFileOpenEventRef)
        super.unload()
    }
}
