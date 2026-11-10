# User guide

MD/TXT EasyViewer opens Markdown and text files on Windows. Microsoft Edge is required.

1. Launch the app to browse the desktop, or open an MD or TXT file with it. Its folder appears in the sidebar.
2. Select folders and files in the sidebar; select `..` to move to the parent folder. Search the current folder or switch to Windows-wide search using the search button. Windows-wide search is limited to indexed files.
3. Use the sidebar button to collapse or expand it. Hover at the left edge for a temporary peek, or drag the sidebar border to change its width. The collapsed state is saved.
4. Select **Edit** to choose an external editor. You can remember a detected editor as the default. Changes saved in the editor are checked approximately every two seconds while the document is visible.
5. Tabs are enabled by default for new users. A regular file click replaces the current tab; Ctrl-click, middle-click, or the file context menu opens another tab. Opening a document already in a tab switches to it.
6. Use the top arrows or mouse side buttons to navigate document history. Over the sidebar, the mouse side buttons navigate folder history.
7. Use the zoom controls or Ctrl+mouse wheel to resize document text. Use Print or Ctrl+P to print the document.
8. Settings contain language, dark mode, tabs, search, editor choices, and a replayable introduction. English is the default; Korean is also available.

The viewer supports a subset of Markdown and LaTeX-style math, including `$x^2$`, `$$...$$`, fractions, matrices, and aligned equations. Unsupported equations remain visible as source. Local documents are served to the Edge app window over a loopback HTTP connection.
