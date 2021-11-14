# Duplicate Entire Lines

The **VSCode Duplicate Entire Lines** is a plugin in VSCode platform to simulate the `Duplicate Entire Lines` action of JetBrains IDE.

The plugin will make it avalable for user to duplicate all the entire lines selection reached, not like the `Duplicate Selection` command, this plugin do not care if you have select all the text of whole line.

## Features

- Support to duplicate entire lines in selection before/after position according to the command type or user settings.
- Support multi-selection/multi-cursor mode, and will merge the intersected lines for different selections.
- Using commands below or their shortcut key to trigger action:
  - `duplicate-entire-lines.duplicate` (Duplicate lines in selection) : *Ctrl + Alt + D (Same as the default settings of IDEA, will be conflict with the key `View: Show SQL Server`).*
  - `duplicate-entire-lines.duplicateBefore` (Duplicate lines in selection before) : *No default keybindings.*
  - `duplicate-entire-lines.duplicateAfter` (Duplicate lines in selection after) : *No default keybindings.*

\!\[The images is preparing ...\]\(images/feature-x.png\ "Feature")

## Requirements

I have built this plugin with the VSCode Engine 1.61.0, but I thought the client version need not to be so new.

## Extension Settings

This extension contributes the following settings:

* `duplicateEntireLines.defaultInsertBefore`: If default to insert duplicates before source when not asked, using for command `duplicate-entire-lines.duplicate`

## Known Issues

Multi-selection with intersections and bottom reaching situation has not be test fully.

## Release Notes

The version below:

### 0.0.1-SNAPSHOT

Finish first valid version.
