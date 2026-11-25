// Ported from Valkyrie (Apache-2.0), modified: unity/Assets/Scripts/QuestEditor/EditorTools.cs
// The tools menu is the app's. "Validate scenario" and "Optimize localization" do nothing in Valkyrie 3.28.
// A browser has no desktop: the package goes into a folder the app names, and the app hands its files to the player.
import { LocalizationRead } from '../Content/LocalizationRead.ts';
import { Destroyer } from '../Destroyer.ts';
import { Game } from '../Game.ts';
import { NewLine, replace } from '../platform/CSharp.ts';
import { bitConverterToString, sha256 } from '../platform/Sha256.ts';
import { Directory, File, IOException, Path } from '../platform/SystemIO.ts';
import { ValkyrieConstants } from '../ValkyrieConstants.ts';
import { ValkyrieDebug } from '../ValkyrieTools/ValkyrieDebug.ts';
import { ZipManager } from '../ZipManager.ts';
import { QuestEditor } from './QuestEditor.ts';

// Valkyrie: EditorTools.cs EditorTools
export const EditorTools = {
  /**
   * Create a .valkyrie package and associated meta data, in a new folder under `desktopDir` named after the quest's
   * folder (with 2, 3... when taken); returns that folder, or null when it could not be written.
   */
  // Valkyrie: EditorTools.cs EditorTools.CreatePackage
  createPackage(desktopDir: string): string | null {
    Destroyer.dialog();
    const game = Game.get();
    const quest = game.currentQuest!.qd.quest;

    // save content before creating the package
    QuestEditor.save();

    const questDir = Path.getDirectoryName(game.currentQuest!.qd.questPath)!;
    const packageName = Path.getFileName(questDir);
    let destination: string | null = null;
    try {
      destination = Path.combine(desktopDir, packageName);
      let postfix = 2;
      while (Directory.exists(destination)) {
        destination = Path.combine(desktopDir, packageName + postfix++);
      }
      Directory.createDirectory(destination);

      const packageFile = Path.combine(destination, packageName + ValkyrieConstants.ScenarioDownloadContainerExtension);

      File.writeAllBytes(packageFile, ZipManager.zipDirectory(questDir));

      // Append sha version
      quest.version = bitConverterToString(sha256(File.readAllBytes(packageFile)));

      const icon = quest.image.replace(/\\/g, '/');
      if (icon.length > 0) {
        const iconName = Path.getFileName(icon);
        // Temp hack to get ToString to output local file
        quest.image = iconName;
        const src = Path.combine(questDir, icon);
        const dest = Path.combine(destination, iconName);
        // File.Copy, which does not overwrite
        if (File.exists(dest)) throw new IOException(`The file '${dest}' already exists.`);
        File.writeAllBytes(dest, File.readAllBytes(src));
      }
      let manifest = quest.toString();
      // Restore icon
      quest.image = icon;

      const qst = LocalizationRead.selectDictionary('qst')!;
      for (const [language, value] of qst.extractAllMatches('quest.name')) {
        manifest += 'name.' + language + '=' + value + NewLine;
      }

      for (const [language, value] of qst.extractAllMatches('quest.synopsys')) {
        manifest += 'synopsys.' + language + '=' + replace(replace(value, '\n', ''), '\r', '') + NewLine;
      }

      for (const [language, value] of qst.extractAllMatches('quest.description')) {
        manifest += 'description.' + language + '=' + replace(replace(value, '\n', '\\n'), '\r', '') + NewLine;
      }

      for (const [language, value] of qst.extractAllMatches('quest.authors')) {
        // Valkyrie removes the two characters \r here, not a carriage return
        manifest += 'authors.' + language + '=' + replace(replace(value, '\n', '\\n'), '\\r', '') + NewLine;
      }

      for (const [language, value] of qst.extractAllMatches('quest.authors_short')) {
        manifest += 'authors_short.' + language + '=' + replace(replace(value, '\n', ''), '\r', '') + NewLine;
      }

      File.writeAllText(Path.combine(destination, packageName + '.ini'), manifest);
    } catch (e) {
      if (!(e instanceof IOException)) throw e;
      ValkyrieDebug.log('Warning: Unable to write to valkyrie package.' + e.message);
      return null;
    }
    return destination;
  },
};
