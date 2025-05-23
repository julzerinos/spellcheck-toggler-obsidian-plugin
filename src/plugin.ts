import { EventRef, Plugin, TFile } from 'obsidian'
import { Extension } from '@codemirror/state'

import {
    SpellcheckBehaviourOption,
    SpellcheckTogglerSettingTab,
    SpellcheckTogglerSettings,
    defaultSettings,
} from './settings'
import {
    emphasisSpellcheckPluginValue,
    externalLinkSpellcheckViewPlugin,
    htmlCommentSpellcheckPluginValue,
    internalLinkSpellcheckViewPlugin,
    strongSpellcheckPluginValue,
} from './spellchecks'
import { updateSpellcheckContext } from './context'
import { validateAndMigrateSettings } from './migration'
import { anyNodeSpellcheckPluginValue } from './spellchecks/any-node'
import { blockQuoteSpellcheckPluginValue } from './spellchecks/blockquote'

export class SpellcheckTogglerPlugin extends Plugin {
    settings: SpellcheckTogglerSettings
    editorExtensions: Extension[] = []
    onFileOpenEventRef: EventRef

    async loadSettings() {
        const userSettings = validateAndMigrateSettings(await this.loadData())
        this.settings = { ...defaultSettings, ...userSettings }

        this.saveData(this.settings)

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

        if (
            this.settings.blockquote.behaviour !==
            SpellcheckBehaviourOption.DEFAULT
        )
            this.editorExtensions.push(blockQuoteSpellcheckPluginValue)

        if (
            this.settings.emphasis.behaviour !==
            SpellcheckBehaviourOption.DEFAULT
        )
            this.editorExtensions.push(emphasisSpellcheckPluginValue)

        if (
            this.settings.strong.behaviour !== SpellcheckBehaviourOption.DEFAULT
        )
            this.editorExtensions.push(strongSpellcheckPluginValue)

        if (
            this.settings.anyNode.behaviour !==
            SpellcheckBehaviourOption.DEFAULT
        )
            this.editorExtensions.push(anyNodeSpellcheckPluginValue)
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
            frontmatter:
                this.app.metadataCache.getFileCache(file)?.frontmatter ?? null,
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
