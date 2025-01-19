import { App, PluginSettingTab, Setting } from 'obsidian'
import { SpellcheckTogglerPlugin } from './plugin'

enum SpellcheckBehaviourOption {
    DEFAULT = 'default',
    FRONTMATTER = 'frontmatter',
    GLOBAL = 'global',
}

const SpellcheckBehaviourOptionDisplay = {
    [SpellcheckBehaviourOption.DEFAULT]: 'Always spellcheck',
    [SpellcheckBehaviourOption.FRONTMATTER]: 'Opt-out spellcheck',
    [SpellcheckBehaviourOption.GLOBAL]: 'Opt-in spellcheck',
}

export interface SpellcheckOption {
    behaviour: SpellcheckBehaviourOption
    frontmatterOverride?: string
}

export interface SpellcheckTogglerSettings {
    externalLinks: SpellcheckOption
    internalLinks: SpellcheckOption
    htmlComments: SpellcheckOption
}

export const defaultSettings: SpellcheckTogglerSettings = {
    externalLinks: { behaviour: SpellcheckBehaviourOption.GLOBAL },
    internalLinks: { behaviour: SpellcheckBehaviourOption.GLOBAL },
    htmlComments: { behaviour: SpellcheckBehaviourOption.DEFAULT },
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

        const createSpellcheckOptionDisplay = (
            optionsKey: keyof SpellcheckTogglerSettings,
            name: string,
            description: string,
            targetFormat?: string,
        ) => {
            const settingContainer = containerEl.createDiv({
                cls: 'settings-container',
            })

            const headingSetting = new Setting(settingContainer)
                .setHeading()
                .setName(name)
                .setDesc(description)

            if (targetFormat) {
                const span = headingSetting.controlEl.createEl('span', {
                    text: `Targeted format: `,
                    cls: 'setting-item-target-label',
                })
                span.createEl('code', {
                    text: targetFormat,
                    cls: 'setting-item-target-label',
                })
            }

            const behaviourDropdownSetting = new Setting(
                settingContainer,
            ).setDesc('Spellchecking behaviour')

            const frontmatterOverrideTextSetting = new Setting(settingContainer)
                .setDesc('Frontmatter override property')
                .setTooltip(
                    'Define the (boolean) frontmatter property which controls the spellcheck behaviour for the respective file.',
                )
                .addText((text) =>
                    text
                        .setValue(
                            this.plugin.settings[optionsKey]
                                .frontmatterOverride ?? '',
                        )
                        .onChange((frontmatterOverride) =>
                            this.plugin.saveSettings({
                                [optionsKey]: {
                                    ...this.plugin.settings[optionsKey],
                                    frontmatterOverride:
                                        frontmatterOverride.length
                                            ? frontmatterOverride
                                            : undefined,
                                },
                            }),
                        ),
                )

            frontmatterOverrideTextSetting.settingEl.toggleClass(
                'hidden',
                this.plugin.settings[optionsKey].behaviour ===
                    SpellcheckBehaviourOption.DEFAULT,
            )

            behaviourDropdownSetting.addDropdown((dropdown) => {
                dropdown.addOptions(SpellcheckBehaviourOptionDisplay)
                dropdown.onChange((behaviour) => {
                    this.plugin.saveSettings({
                        [optionsKey]: {
                            ...this.plugin.settings[optionsKey],
                            behaviour,
                        },
                    })
                    frontmatterOverrideTextSetting.settingEl.toggleClass(
                        'hidden',
                        behaviour === SpellcheckBehaviourOption.DEFAULT,
                    )
                })
                dropdown.setValue(this.plugin.settings[optionsKey].behaviour)
            })
        }

        const legendContainer = containerEl.createDiv({
            cls: 'settings-container',
        })
        new Setting(legendContainer)
            .setHeading()
            .setName('Settings legend')
            .setDesc('...')

        createSpellcheckOptionDisplay(
            'externalLinks',
            'Disable spellcheck for external links',
            'Toggle spellcheck underline for link text in any external link.',
            '![text](link)',
        )

        createSpellcheckOptionDisplay(
            'internalLinks',
            'Disable spellcheck for internal links',
            'Toggle spellcheck underline for link text in any internal link.',
            '[[ link text ]]',
        )

        createSpellcheckOptionDisplay(
            'htmlComments',
            'Disable spellcheck for html links',
            'Toggle spellcheck underline for any text inside an html comment block.',
            '<-- text -->',
        )

        // new Setting(containerEl)
        //     .setName('Enable spellcheck for external links')
        //     .setDesc(
        //         'Toggle spellcheck underline for link text in any external link.',
        //     )
        //     .addToggle((toggle) =>
        //         toggle
        //             .setValue(this.plugin.settings.spellcheckExternalLinks)
        //             .onChange((value) =>
        //                 this.plugin.saveSettings({
        //                     spellcheckExternalLinks: value,
        //                 }),
        //             ),
        //     )

        // new Setting(containerEl)
        //     .setName('Enable spellcheck for internal links')
        //     .setDesc(
        //         'Toggle spellcheck underline for link text for in any internal link.',
        //     )
        //     .addToggle((toggle) =>
        //         toggle
        //             .setValue(this.plugin.settings.spellcheckInternalLinks)
        //             .onChange((value) =>
        //                 this.plugin.saveSettings({
        //                     spellcheckInternalLinks: value,
        //                 }),
        //             ),
        //     )

        // new Setting(containerEl)
        //     .setName('Enable spellcheck for html comments')
        //     .setDesc(
        //         'Toggle spellcheck underline for any text inside an html comment block.',
        //     )
        //     .addToggle((toggle) =>
        //         toggle
        //             .setValue(this.plugin.settings.spellcheckHtmlComments)
        //             .onChange((value) =>
        //                 this.plugin.saveSettings({
        //                     spellcheckHtmlComments: value,
        //                 }),
        //             ),
        //     )
    }
}
