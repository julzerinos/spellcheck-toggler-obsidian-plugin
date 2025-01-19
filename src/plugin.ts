import { EventRef, Plugin, TFile } from 'obsidian'
import { Extension } from '@codemirror/state'

import {
    SpellcheckBehaviourOption,
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
import { updateSpellcheckContext } from './context'

export class SpellcheckTogglerPlugin extends Plugin {
    settings: SpellcheckTogglerSettings
    editorExtensions: Extension[] = []
    onFileOpenEventRef: EventRef

    async loadSettings() {
        const userSettings: SpellcheckTogglerSettings = await this.loadData()
        this.settings = { ...defaultSettings, ...userSettings }

        updateSpellcheckContext({ settings: this.settings })
    }

    async saveSettings(settings: Partial<SpellcheckTogglerSettings>) {
        this.settings = { ...this.settings, ...settings }
        await this.saveData(this.settings)

        this.refreshExtensions()
        updateSpellcheckContext({ settings: this.settings })
    }

    buildExtensions() {
        this.editorExtensions.length = 0

        if (
            this.settings.internalLinks.behaviour !==
            SpellcheckBehaviourOption.DEFAULT
        )
            this.editorExtensions.push(internalLinkSpellcheckViewPlugin)

        if (
            this.settings.externalLinks.behaviour !==
            SpellcheckBehaviourOption.DEFAULT
        )
            this.editorExtensions.push(externalLinkSpellcheckViewPlugin)

        if (
            this.settings.htmlComments.behaviour !==
            SpellcheckBehaviourOption.DEFAULT
        )
            this.editorExtensions.push(htmlCommentSpellcheckPluginValue)
    }

    refreshExtensions() {
        this.buildExtensions()
        this.app.workspace.updateOptions()
        this.app.workspace.activeEditor?.editor?.refresh()
    }

    onFileOpen(file: TFile | null) {
        if (file === null) return

        updateSpellcheckContext({
            file,
            frontmatter: this.app.metadataCache.getFileCache(file)?.frontmatter,
        })
    }

    async onload(): Promise<void> {
        await this.loadSettings()
        this.addSettingTab(new SpellcheckTogglerSettingTab(this.app, this))

        this.buildExtensions()
        this.registerEditorExtension(this.editorExtensions)

        this.onFileOpen(this.app.workspace.getActiveFile())
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
