import { App, PluginSettingTab, Setting } from 'obsidian'
import { SpellcheckTogglerPlugin } from './plugin'

export enum SpellcheckBehaviourOption {
    DEFAULT = 'default',
    OPT_IN = 'opt-in',
    OPT_OUT = 'opt-out',
    GLOBAL = 'global',
}

const SpellcheckBehaviourOptionDisplay = {
    [SpellcheckBehaviourOption.DEFAULT]: 'Always spellcheck',
    [SpellcheckBehaviourOption.OPT_IN]: 'Opt-in disable',
    [SpellcheckBehaviourOption.OPT_OUT]: 'Opt-out disable',
    [SpellcheckBehaviourOption.GLOBAL]: 'Never spellcheck',
}

export interface SpellcheckOption {
    behaviour: SpellcheckBehaviourOption
    frontmatterOverride?: string
}

export interface SpellcheckTogglerSettings {
    externalLinks: SpellcheckOption
    internalLinks: SpellcheckOption
    htmlComments: SpellcheckOption
    anyNode: SpellcheckOption
    emphasis: SpellcheckOption
    strong: SpellcheckOption
}

export const defaultSettings: SpellcheckTogglerSettings = {
    externalLinks: { behaviour: SpellcheckBehaviourOption.GLOBAL },
    internalLinks: { behaviour: SpellcheckBehaviourOption.GLOBAL },
    htmlComments: { behaviour: SpellcheckBehaviourOption.DEFAULT },
    anyNode: { behaviour: SpellcheckBehaviourOption.DEFAULT },
    emphasis: { behaviour: SpellcheckBehaviourOption.GLOBAL },
    strong: { behaviour: SpellcheckBehaviourOption.GLOBAL },
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
                [
                    SpellcheckBehaviourOption.DEFAULT,
                    SpellcheckBehaviourOption.GLOBAL,
                ].includes(this.plugin.settings[optionsKey].behaviour),
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
                        [
                            SpellcheckBehaviourOption.DEFAULT,
                            SpellcheckBehaviourOption.GLOBAL,
                        ].includes(this.plugin.settings[optionsKey].behaviour),
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
            text: `     "Opt-in disable": explicitly use the defined frontmatter override property to disable spellchecking in applicable files, otherwise in files without the property apply the editor default (spellcheck) for the option.`,
            cls: 'setting-item-target-label',
        })
        list.createEl('li', {
            text: `     "Opt-out disable": explicitly use the defined frontmatter override property to enable spellchecking in applicable files, otherwise in files without the property do not spellcheck the option.`,
            cls: 'setting-item-target-label',
        })
        list.createEl('li', {
            text: `     "Never spellcheck": do not use spellcheck in any file for the option.`,
            cls: 'setting-item-target-label',
        })

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
            'Any text node option',
            'Toggle spellcheck for any text node type. Recommended use with "Opt-in disable" behaviour to target specifc files. With the "Never spellcheck" behaviour, this option will disable spellcheck for all text in every file.',
            '*',
        )
    }
}
