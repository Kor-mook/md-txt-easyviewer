# MD/TXT EasyViewer

**English** | [한국어](README.ko.md)

MD/TXT EasyViewer is a Windows reader for Markdown and text files. Browse a document's folder as you read, and see changes saved in an external editor without reopening the file.

- Folder navigation, optional tabs, and separate document and folder history
- Search the current folder or Markdown and text files indexed by Windows Search
- Dark mode, document zoom, printing, and opening files in an external editor
- Mathematical notation, including fractions, scripts, matrices, and selected LaTeX commands
- English and Korean interfaces, with replaceable language files

## Why this project?

Reading a Markdown or text file should not require navigating an editor interface. This project explores a lightweight reading experience with nearby files readily available and saved edits reflected in the viewer.

## Implementation and design

- **UI and file access:** A C# loopback HTTP server handles local files and Windows integration; an app window in Microsoft Edge renders the HTML/CSS/JavaScript interface. A new path token is generated for each server instance.
- **Navigation:** Separate document and folder histories let the mouse back and forward buttons behave according to the area under the pointer. Folder navigation preserves open tabs and the current document.
- **Live updates:** The visible document is checked approximately every two seconds and re-rendered when its content changes, retaining the scroll position.
- **Windows integration:** The installer registers the app as a file-opening option and creates a Start menu shortcut without changing existing defaults. The viewer detects common external editors.
- **Math rendering:** A built-in renderer converts a subset of LaTeX to MathML without an external math library. Unsupported expressions remain visible as source.

## Validation

Viewer and installer builds were checked on Windows. Edge-based checks covered tab and folder navigation, sidebar state, live updates, common equations, and Markdown character handling. Installation file copying and app registration were checked in an isolated test location. An automated test suite and CI are not yet included in this repository.

## Download

[**Download for Windows**](https://github.com/Kor-mook/md-txt-easyviewer/releases/latest/download/MD-TXT-EasyViewer-Setup.exe)

Run the downloaded installer. It includes the application files and does not require an internet connection during installation. It installs for the current user and registers an app choice without changing the current default.

The current build is unsigned and Windows may display a warning. Windows and Microsoft Edge are required.

## Add a language

English is the default; Korean is included. To add another language, copy `src/viewer/locales/en.json` and translate the `name` and `strings` values. Save it as UTF-8 JSON in the installed application's `%LOCALAPPDATA%/Programs/MDTXEasyViewer/locales/` folder, using a file name such as `fr.json`. Open Settings to select it. File names must contain only letters, numbers, hyphens, or underscores (up to 40 characters). Missing strings fall back to English. Native Windows dialogs and setup messages may not use the selected language.

## Build

A Windows machine with the .NET Framework 4.x C# compiler is required. From the repository root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\build.ps1
```

The outputs are `build/viewer/MarkdownViewer.exe` and `build/MD-TXT-EasyViewer-Setup.exe`. The `build/` directory is ignored by Git. The build does not install or download external packages.

## Project layout

```text
src/viewer/       Viewer source and language files
src/installer/    Single-file installer and installation script
assets/           Application icon
scripts/          Build script
USER_GUIDE.md     English user guide
사용법.txt         Korean user guide
```

## Limitations and next steps

- Windows-wide search only covers files indexed by Windows Search.
- Markdown and LaTeX support are incomplete; unsupported equations are displayed as source.
- Improve uninstall and update handling, background process cleanup, and verification on clean Windows installations.
- Add automated tests and CI, and evaluate code signing.

The application reads local files through a loopback HTTP server. See the [English user guide](USER_GUIDE.md) or [Korean user guide](사용법.txt) for more details.

## License

No license has been selected yet. Terms of use and distribution need to be determined before others can rely on permission to use or redistribute the software.
