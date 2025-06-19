import { App, PluginSettingTab, Setting } from 'obsidian'
import { SpellcheckTogglerPlugin } from './plugin'

export enum SpellcheckBehaviourOption {
    DEFAULT = 'default',
    FRONTMATTER = 'frontmatter',
    GLOBAL = 'global',
}

export type BaseSpellcheckBehaviourOption =
    | SpellcheckBehaviourOption.DEFAULT
    | SpellcheckBehaviourOption.GLOBAL

const SpellcheckBehaviourOptionDisplay = {
    [SpellcheckBehaviourOption.DEFAULT]: 'Always spellcheck',
    [SpellcheckBehaviourOption.FRONTMATTER]: 'Use frontmatter',
    [SpellcheckBehaviourOption.GLOBAL]: 'Never spellcheck',
}

export interface SpellcheckOption {
    behaviour: SpellcheckBehaviourOption
    frontmatterOverride?: string
    frontmatterFallback?: BaseSpellcheckBehaviourOption
}

export interface SpellcheckTogglerSettings {
    useReactiveFrontmatter: boolean
    externalLinks: SpellcheckOption
    internalLinks: SpellcheckOption
    htmlComments: SpellcheckOption
    anyNode: SpellcheckOption
    emphasis: SpellcheckOption
    strong: SpellcheckOption
    blockquote: SpellcheckOption
}

export const defaultSettings: SpellcheckTogglerSettings = {
    useReactiveFrontmatter: false,
    externalLinks: { behaviour: SpellcheckBehaviourOption.GLOBAL },
    internalLinks: { behaviour: SpellcheckBehaviourOption.GLOBAL },
    htmlComments: { behaviour: SpellcheckBehaviourOption.DEFAULT },
    anyNode: { behaviour: SpellcheckBehaviourOption.DEFAULT },
    emphasis: { behaviour: SpellcheckBehaviourOption.DEFAULT },
    strong: { behaviour: SpellcheckBehaviourOption.DEFAULT },
    blockquote: { behaviour: SpellcheckBehaviourOption.DEFAULT },
}

type OptionKey =
    | 'externalLinks'
    | 'internalLinks'
    | 'htmlComments'
    | 'anyNode'
    | 'emphasis'
    | 'strong'
    | 'blockquote'

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
            optionKey: OptionKey,
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

            const frontmatterDrawer = settingContainer.createDiv({
                cls: 'frontmatter-drawer',
            })
            //  document.createElement('div')
            // frontmatterDrawer.className = 'frontmatter-drawer'

            new Setting(frontmatterDrawer)
                .setName('Frontmatter override property')
                .setDesc(
                    'Define the (boolean) frontmatter property which controls the spellcheck behaviour for a file.',
                )
                .addText((text) =>
                    text
                        .setValue(
                            this.plugin.settings[optionKey]
                                .frontmatterOverride ?? '',
                        )
                        .onChange((frontmatterOverride) =>
                            this.plugin.saveSettings({
                                [optionKey]: {
                                    ...this.plugin.settings[optionKey],
                                    frontmatterOverride:
                                        frontmatterOverride.length
                                            ? frontmatterOverride
                                            : undefined,
                                },
                            }),
                        ),
                )

            new Setting(frontmatterDrawer)
                .setName('Fallback behavior')
                .setDesc(
                    'Select the spellcheck fallback behavior for the node in files where the frontmatter property is absent.',
                )
                .addDropdown((dropdown) => {
                    const { frontmatter, ...filteredOptions } =
                        SpellcheckBehaviourOptionDisplay
                    dropdown
                        .addOptions({ ...filteredOptions })
                        .onChange((frontmatterFallback) => {
                            this.plugin.saveSettings({
                                [optionKey]: {
                                    ...this.plugin.settings[optionKey],
                                    frontmatterFallback: frontmatterFallback,
                                },
                            })
                        })
                        .setValue(
                            this.plugin.settings[optionKey]
                                .frontmatterFallback ??
                                SpellcheckBehaviourOption.DEFAULT,
                        )
                })

            frontmatterDrawer.toggleClass(
                'hidden',
                [
                    SpellcheckBehaviourOption.DEFAULT,
                    SpellcheckBehaviourOption.GLOBAL,
                ].includes(this.plugin.settings[optionKey].behaviour),
            )

            new Setting(settingContainer)
                .setName('Spellchecking behaviour')
                .addDropdown((dropdown) =>
                    dropdown
                        .addOptions(SpellcheckBehaviourOptionDisplay)
                        .onChange((behaviour) => {
                            this.plugin.saveSettings({
                                [optionKey]: {
                                    ...this.plugin.settings[optionKey],
                                    behaviour,
                                },
                            })
                            frontmatterDrawer.toggleClass(
                                'hidden',
                                [
                                    SpellcheckBehaviourOption.DEFAULT,
                                    SpellcheckBehaviourOption.GLOBAL,
                                ].includes(
                                    this.plugin.settings[optionKey].behaviour,
                                ),
                            )
                        })
                        .setValue(this.plugin.settings[optionKey].behaviour),
                )

            settingContainer.appendChild(frontmatterDrawer)
        }

        const legendContainer = containerEl.createDiv({
            cls: 'settings-container',
        })
        new Setting(legendContainer)
            .setHeading()
            .setName('Spellcheck toggler settings')
            .setDesc(
                'Configure spellchecking options. The behaviour of a spellcheck option is defined as follows:',
            )

        const list = legendContainer.createEl('ul')

        list.createEl('li', {
            text: `     "Always spellcheck": the editor default behaviour will be applied (the plugin is not active for the option).`,
            cls: 'setting-item-target-label',
        })
        list.createEl('li', {
            text: `     "Use frontmatter": use the defined frontmatter property to toggle spellchecking per file.`,
            cls: 'setting-item-target-label',
        })
        list.createEl('li', {
            text: `     "Never spellcheck": do not use spellcheck in any file for the option.`,
            cls: 'setting-item-target-label',
        })

        new Setting(legendContainer)
            .setName('Use reactive frontmatter')
            .setDesc(
                'Toggle for using reactive frontmatter property for spellchecks. Uses frontmatter processing which applies .',
            )
            .addToggle((t) =>
                t
                    .setValue(this.plugin.settings.useReactiveFrontmatter)
                    .onChange((use) =>
                        this.plugin.saveSettings({
                            useReactiveFrontmatter: use,
                        }),
                    ),
            )

        createSpellcheckOptionDisplay(
            'externalLinks',
            'External links option',
            'Toggle spellcheck underline for link text in any external link.',
            '![text](link)',
        )

        createSpellcheckOptionDisplay(
            'internalLinks',
            'Internal links option',
            'Toggle spellcheck underline for link text in any internal link.',
            '[[ link text ]]',
        )

        createSpellcheckOptionDisplay(
            'htmlComments',
            'Html comment option',
            'Toggle spellcheck underline for any text inside an html comment block.',
            '<-- text -->',
        )

        createSpellcheckOptionDisplay(
            'blockquote',
            'Blockquote node option',
            'Toggle spellcheck for text inside block quotes.',
            '>text',
        )

        createSpellcheckOptionDisplay(
            'emphasis',
            'Italics (emphasis) node option',
            'Toggle spellcheck for italics (emphasis) text.',
            '*text*',
        )

        createSpellcheckOptionDisplay(
            'strong',
            'Bolded (strong) node option',
            'Toggle spellcheck for bolded (strong) text.',
            '**text**',
        )

        createSpellcheckOptionDisplay(
            'anyNode',
            'Per file option',
            'Toggle spellcheck for an entire file. With "Never spellcheck", spellchecking is disabled for all files.',
            '*',
        )
    }
}
