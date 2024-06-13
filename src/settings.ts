import { App, PluginSettingTab, Setting } from 'obsidian'

import { SpellcheckTogglerPlugin } from './plugin'

export interface SpellcheckTogglerSettings {
    spellcheckExternalLinks: boolean
    spellcheckInternalLinks: boolean
    spellcheckHtmlComments: boolean
}

export const defaultSettings: SpellcheckTogglerSettings = {
    spellcheckExternalLinks: false,
    spellcheckInternalLinks: false,
    spellcheckHtmlComments: true,
}

export class SpellcheckTogglerSettingTab extends PluginSettingTab {
    plugin: SpellcheckTogglerPlugin

    constructor(app: App, plugin: SpellcheckTogglerPlugin) {
        super(app, plugin)
        this.plugin = plugin
    }

    display(): void {
        let { containerEl } = this
        containerEl.empty()

        new Setting(containerEl)
            .setName('Enable spellcheck for external links')
            .setDesc(
                'Toggle spellcheck underline for link text in any external link.',
            )
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.spellcheckExternalLinks)
                    .onChange((value) =>
                        this.plugin.saveSettings({
                            spellcheckExternalLinks: value,
                        }),
                    ),
            )

        new Setting(containerEl)
            .setName('Enable spellcheck for internal links')
            .setDesc(
                'Toggle spellcheck underline for link text for in any internal link.',
            )
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.spellcheckInternalLinks)
                    .onChange((value) =>
                        this.plugin.saveSettings({
                            spellcheckInternalLinks: value,
                        }),
                    ),
            )

        new Setting(containerEl)
            .setName('Enable spellcheck for html comments')
            .setDesc(
                'Toggle spellcheck underline for any text inside an html comment block.',
            )
            .addToggle((toggle) =>
                toggle
                    .setValue(this.plugin.settings.spellcheckHtmlComments)
                    .onChange((value) =>
                        this.plugin.saveSettings({
                            spellcheckHtmlComments: value,
                        }),
                    ),
            )
    }
}
