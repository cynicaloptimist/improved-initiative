import { Listable } from "../../../common/Listable";
import { Libraries, LibraryType } from "../Libraries";
import { ObservableBackedLibrary } from "../ObservableBackedLibrary";

export function ActiveLibrary(
  libraries: Libraries,
  libraryType: LibraryType
): ObservableBackedLibrary<Listable> | null {
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
