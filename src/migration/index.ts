import {
    SpellcheckBehaviourOption,
    SpellcheckTogglerSettings,
} from 'src/settings'

export const validateAndMigrateSettings = (
    settings: any,
): Partial<SpellcheckTogglerSettings> => {
    if (settings === null) return {}

    // From 1.1.0 to 1.2.0
    const keys1_1_0ToKeys1_2_0 = {
        spellcheckExternalLinks: 'externalLinks',
        spellcheckInternalLinks: 'internalLinks',
        spellcheckHtmlComments: 'htmlComments',
    }

    for (const [srcKey, destKey] of Object.entries(keys1_1_0ToKeys1_2_0)) {
        if (srcKey in settings && typeof settings[srcKey] === 'boolean') {
            settings[destKey] = {
                behaviour: settings[srcKey]
                    ? SpellcheckBehaviourOption.DEFAULT
                    : SpellcheckBehaviourOption.GLOBAL,
            }

            delete settings[srcKey]
        }
    }

    // from 1.2.0 to 1.3.5
    for (const [spellcheckKey, spellcheckOption] of Object.entries(settings)) {
        const behaviour = (spellcheckOption as any)['behaviour']
        if (['opt-in', 'opt-out'].includes(behaviour)) {
            settings[spellcheckKey] = {
                behaviour: SpellcheckBehaviourOption.FRONTMATTER,
                frontmatterOverride: (spellcheckOption as any)[
                    'frontmatterOverride'
                ],
                frontmatterFallback:
                    behaviour === 'opt-in'
                        ? SpellcheckBehaviourOption.DEFAULT
                        : SpellcheckBehaviourOption.GLOBAL,
            }
        }
    }

    return { ...settings }
}
