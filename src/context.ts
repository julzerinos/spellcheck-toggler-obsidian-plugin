import { FrontMatterCache, TFile } from 'obsidian'
import { defaultSettings, SpellcheckTogglerSettings } from './settings'

export interface SpellcheckContext {
    file: TFile | null
    frontmatter: FrontMatterCache | null
    settings: SpellcheckTogglerSettings
}

let spellcheckContext: SpellcheckContext = {
    file: null,
    frontmatter: null,
    settings: defaultSettings,
}

export const updateSpellcheckContext = (
    partialContext: Partial<SpellcheckContext>,
): void => {
    spellcheckContext = { ...spellcheckContext, ...partialContext }
}

export const getSpellcheckContextProperty = <T extends keyof SpellcheckContext>(
    key: T,
): SpellcheckContext[T] => spellcheckContext[key]
