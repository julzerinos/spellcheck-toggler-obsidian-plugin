import { App, PluginSettingTab, Setting } from 'obsidian'

import { SpellcheckConfiguratorPlugin } from './plugin'

export interface SpellcheckConfiguratorSettings {
    spellcheckExternalLinks: boolean
    spellcheckInternalLinks: boolean
}

export const defaultSettings: SpellcheckConfiguratorSettings = {
    spellcheckExternalLinks: false,
    spellcheckInternalLinks: false,
}

export class SpellcheckConfiguratorSettingTab extends PluginSettingTab {
    plugin: SpellcheckConfiguratorPlugin

    constructor(app: App, plugin: SpellcheckConfiguratorPlugin) {
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
    }
}
