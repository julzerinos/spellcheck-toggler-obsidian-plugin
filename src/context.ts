import { FrontMatterCache, TFile } from 'obsidian'
import {
    defaultSettings,
    SpellcheckBehaviourOption,
    SpellcheckOption,
    SpellcheckTogglerSettings,
} from './settings'

export interface SpellcheckContext {
    file: TFile | null
    frontmatter: FrontMatterCache | null
    settings: SpellcheckTogglerSettings
    uniqueOverrideKeys: string[]
}

let spellcheckContext: SpellcheckContext = {
    file: null,
    frontmatter: null,
    settings: defaultSettings,
    uniqueOverrideKeys: [],
}

export const updateSpellcheckContext = (
    partialContext: Partial<SpellcheckContext>,
): void => {
    if ('frontmatter' in partialContext) {
        updateFrontmatterWithDifference(partialContext.frontmatter!)
        delete partialContext['frontmatter']
    }

    if ('settings' in partialContext) {
        spellcheckContext.uniqueOverrideKeys = Object.values(
            partialContext.settings!,
        ).reduce((set, option) => {
            const override = (option as SpellcheckOption).frontmatterOverride
            if (override !== undefined) set.push(override)
            return set
        }, [] as string[])
    }

    spellcheckContext = { ...spellcheckContext, ...partialContext }
}

export const updateFrontmatterWithDifference = (
    frontmatter: FrontMatterCache | null,
): boolean => {
    if (frontmatter === null) {
        spellcheckContext.frontmatter = null
        return true
    }

    const frontmatterSpellcheckKeys = Object.keys(frontmatter).filter((k) =>
        spellcheckContext.uniqueOverrideKeys.includes(k),
    )
    const filteredFrontmatter = frontmatterSpellcheckKeys.reduce((ffm, k) => {
        ffm[k] = frontmatter[k]
        return ffm
    }, {} as FrontMatterCache)

    if (
        spellcheckContext.frontmatter === null ||
        Object.keys(spellcheckContext.frontmatter).length !==
            frontmatterSpellcheckKeys.length
    ) {
        spellcheckContext.frontmatter = filteredFrontmatter
        return true
    }

    for (const key of frontmatterSpellcheckKeys) {
        if (
            key in spellcheckContext.frontmatter &&
            spellcheckContext.frontmatter[key] === frontmatter[key]
        )
            continue

        spellcheckContext.frontmatter = filteredFrontmatter
        return true
    }

    return false
}

export const getSpellcheckContextProperty = <T extends keyof SpellcheckContext>(
    key: T,
): SpellcheckContext[T] => spellcheckContext[key]
