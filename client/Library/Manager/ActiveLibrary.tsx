import { Listable } from "../../../common/Listable";
import { LibraryType, Libraries } from "../Libraries";
import { Library } from "../useLibrary";

export function ActiveLibrary(
  libraries: Libraries,
  libraryType: LibraryType
): Library<Listable> | null {
  if (libraryType === "StatBlocks") {
    return libraries.StatBlocks;
  }
  if (libraryType === "PersistentCharacters") {
    return libraries.PersistentCharacters;
  }
  if (libraryType === "Encounters") {
    return libraries.Encounters;
  }
  if (libraryType === "Spells") {
    return libraries.Spells;
  }

  return null;
}
