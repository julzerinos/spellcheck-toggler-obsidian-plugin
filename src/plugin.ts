import { EventRef, Plugin, TFile, getFrontMatterInfo } from 'obsidian'
import { Extension } from '@codemirror/state'

import {
    SpellcheckBehaviourOption,
    SpellcheckTogglerSettingTab,
    SpellcheckTogglerSettings,
    defaultSettings,
} from './settings'
import {
    emphasisSpellcheckPluginValue,
    markdownLinkSpellcheckViewPlugin,
    htmlCommentSpellcheckPluginValue,
    wikiLinkSpellcheckViewPlugin,
    strongSpellcheckPluginValue,
} from './spellchecks'
import {
    getSpellcheckContextProperty,
    updateFrontmatterWithDifference,
    updateSpellcheckContext,
} from './context'
import { validateAndMigrateSettings } from './migration'
import { blockQuoteSpellcheckPluginValue } from './spellchecks/blockquote'
import { bareLinkSpellcheckPluginValue } from './spellchecks/barelink'

export class SpellcheckTogglerPlugin extends Plugin {
    settings: SpellcheckTogglerSettings
    editorExtensions: Extension[] = []
    onFileOpenEventRef: EventRef
    onFileModifyEventRef: EventRef

    async loadSettings() {
        const userSettings = validateAndMigrateSettings(await this.loadData())
        this.settings = { ...defaultSettings, ...userSettings }

        this.saveData(this.settings)

        updateSpellcheckContext({ settings: this.settings })
    }

    async saveSettings(settings: Partial<SpellcheckTogglerSettings>) {
        this.settings = { ...this.settings, ...settings }
        await this.saveData(this.settings)

        updateSpellcheckContext({ settings: this.settings })
        this.refreshExtensions()
    }

    buildExtensions() {
        this.editorExtensions.length = 0

        if (
            this.settings.internalLinks.behaviour !==
            SpellcheckBehaviourOption.DEFAULT
        )
            this.editorExtensions.push(wikiLinkSpellcheckViewPlugin)

        if (
            this.settings.externalLinks.behaviour !==
            SpellcheckBehaviourOption.DEFAULT
        )
            this.editorExtensions.push(markdownLinkSpellcheckViewPlugin)

        if (
            this.settings.bareLinks.behaviour !==
            SpellcheckBehaviourOption.DEFAULT
        )
            this.editorExtensions.push(bareLinkSpellcheckPluginValue)

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
    }

    refreshExtensions() {
        this.buildExtensions()
        this.app.workspace.updateOptions()
        this.app.workspace.activeEditor?.editor?.refresh()
    }

    handleSpellcheckAttribute() {
        let globalSpellcheckFlag = true

        const anyNodeOption =
            getSpellcheckContextProperty('settings')['anyNode']

        switch (anyNodeOption.behaviour) {
            case SpellcheckBehaviourOption.GLOBAL:
                globalSpellcheckFlag = false
                break
            case SpellcheckBehaviourOption.FRONTMATTER:
                const frontmatter = getSpellcheckContextProperty('frontmatter')
                const isOverrideInFrontmatter =
                    frontmatter !== null &&
                    anyNodeOption.frontmatterOverride !== undefined &&
                    anyNodeOption.frontmatterOverride in frontmatter

                const isOverrideTrue =
                    isOverrideInFrontmatter &&
                    frontmatter[anyNodeOption.frontmatterOverride!] === true
                const isFallbackDefault =
                    !isOverrideInFrontmatter &&
                    anyNodeOption.frontmatterFallback !==
                        SpellcheckBehaviourOption.GLOBAL

                globalSpellcheckFlag = isOverrideTrue || isFallbackDefault
                break
        }

        const content =
            this.app.workspace.containerEl.querySelector('.cm-content')

        const attributeObserver = new MutationObserver((_, observer) => {
            content!.setAttribute('spellcheck', String(globalSpellcheckFlag))
            observer.disconnect()
        })

        content!.setAttribute('spellcheck', String(globalSpellcheckFlag))
        attributeObserver.observe(content!, {
            attributes: true,
            attributeOldValue: true,
            attributeFilter: ['spellcheck'],
        })
    }

    onFileOpen(file: TFile | null) {
        if (file === null) return

        const metadata = this.app.metadataCache.getFileCache(file)
        const frontmatter = metadata?.frontmatter ?? null
        updateSpellcheckContext({
            file,
            frontmatter,
        })

        this.handleSpellcheckAttribute()
    }

    onFileModify(file: TFile | null) {
        if (
            file === null ||
            this.app.workspace.getActiveFile()?.basename !== file.basename
        )
            return
        ;(async () => {
            const content = await this.app.vault.cachedRead(file)
            const frontmatterInfo = getFrontMatterInfo(content)
            if (!frontmatterInfo.exists) return

            const overrideKeys =
                getSpellcheckContextProperty('uniqueOverrideKeys')
            const frontmatter = {} as { [key: string]: boolean }

            for (const line of frontmatterInfo.frontmatter.split('\n')) {
                const [property, value] = line.split(':').map((s) => s.trim())

                if (value === undefined || value.length === 0) continue

                const parsedValue =
                    value === 'true'
                        ? true
                        : value === 'false'
                        ? false
                        : undefined
                if (
                    parsedValue !== undefined &&
                    overrideKeys.includes(property)
                )
                    frontmatter[property] = parsedValue
            }

            const didDiffer = updateFrontmatterWithDifference(frontmatter)
            if (!didDiffer) return

            this.handleSpellcheckAttribute()
            const editor = this.app.workspace.activeEditor?.editor
            if (!editor) return
            editor.replaceRange(' ', editor.getCursor())
            editor.undo()
        })()
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
        this.onFileModifyEventRef = this.app.vault.on(
            'modify',
            this.onFileModify.bind(this),
        )
    }

    unload(): void {
        this.app.workspace.offref(this.onFileOpenEventRef)
        this.app.vault.offref(this.onFileModifyEventRef)
        super.unload()
    }
}
