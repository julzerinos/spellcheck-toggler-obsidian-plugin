import {
    SpellcheckBehaviourOption,
    SpellcheckTogglerSettings,
} from 'src/settings'

type schema1_2_0 = SpellcheckTogglerSettings
type currentSchema = schema1_2_0

export const validateAndMigrateSettings = (settings: any): currentSchema => {
    const migratedOutput: Partial<currentSchema> = {}

    // From 1.1.0 to 1.2.0
    const keys1_1_0ToKeys1_2_0 = {
        spellcheckExternalLinks: 'externalLinks',
        spellcheckInternalLinks: 'internalLinks',
        spellcheckHtmlComments: 'htmlComments',
    } as { [key: string]: keyof schema1_2_0 }

    for (const [srcKey, destKey] of Object.entries(keys1_1_0ToKeys1_2_0)) {
        if (srcKey in settings && typeof settings[srcKey] === 'boolean') {
            migratedOutput[destKey] = {
                behaviour: settings[srcKey]
                    ? SpellcheckBehaviourOption.DEFAULT
                    : SpellcheckBehaviourOption.GLOBAL,
            }

            delete settings[srcKey]
        }
    }

    return { ...migratedOutput, ...settings }
}
