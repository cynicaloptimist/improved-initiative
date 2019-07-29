import { SpellLibrary } from "../Library/SpellLibrary";
import { IRules } from "../Rules/Rules";
import { TextEnricher } from "../TextEnricher/TextEnricher";

export function buildStatBlockTextEnricher(rules: IRules) {
  return new TextEnricher(
    jest.fn(),
    jest.fn(),
    jest.fn(),
    jest.fn(),
    new SpellLibrary(null),
    rules
  );
}
