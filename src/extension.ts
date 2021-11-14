// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

/** EOLS */
var EOLS = ["", "\n", "\r\n",];

/** To determine if target is null/undefined */
export var isNullOrUndefined = (target: any) => ((target === null) || (target === undefined));

/** To determine if target is null/undefined/NaN/""/false */
export var isFalsyExceptZero = (target: any) => (!(target) && (target !== 0));

/** To determine if target and its children own any one of specific keys */
export var ownAnyOfKeysDeeply = (target: any, keys: any[]) => {
	if (!(keys.length)) {
		return false;
		
	} else if (isNullOrUndefined(target)) {
		return false;
		
	} else {
		Object.keys(target).forEach(key => {
			if (keys.includes(key)) {
				return true;
				
			} else if (ownAnyOfKeysDeeply(target[key], keys)) {
				return true;
				
			}
			
		});
		return false;
		
	}
	
};

/**
 * To determine if the startLine/endLine properties is deep equaled among 2 targets and its sub attributes
 * @public
 * @static
 * @param {any} target1 The target object 1
 * @param {any} target2 The target object 2
 * @return {boolean} result Comparison result
 * @author ZhouYi
 * @date 2021-11-14 11:55:48
 * @description description
 * @note note
 */
export var lineInfoDeepEqual = (target1: any, target2: any) => {
	// STEP Number Specific keys
	var lineInfoKeys = ["startLine", "endLine"];
	
	// BRANCH Number Handle nullable target 1
	if (isNullOrUndefined(target1)) {
		return !(ownAnyOfKeysDeeply(target2, lineInfoKeys));
		
	// BRANCH Number Handle nullable target 2
	} else if (isNullOrUndefined(target2)) {
		return !(ownAnyOfKeysDeeply(target1, lineInfoKeys));
	
	// BRANCH Number Handle not null target pair
	} else {
		var keys = Array.from(new Set(Object.keys(target1).concat(Object.keys(target2))));
		for (const key of keys) {
			var value1 = target1[key];
			var value2 = target2[key];
			// SUB-BRANCH Number If the key matches
			if (lineInfoKeys.includes(key)) {
				var result = (value1 === value2);
				if (result) {
					continue;
					
				} else {
					return false;
					
				}
				
			}
			// SUB-BRANCH Number If the value is function
			if ((typeof(value1) === "function") || (typeof(value2) === "function")) {
				continue;
				
			}
			// SUB-BRANCH Number Otherwise, compare recursively
			var result = lineInfoDeepEqual(value1, value2);
			if (result) {
				continue;
				
			} else {
				return false;
				
			}
			
		}
		return true;
		
	}
	
};

/**
 * Merge the selection infos according to the intersection of lines
 * @public
 * @static
 * @param {any[]} selectionInfos The array of selection infos
 * @return {any[]} results The output result array
 * @author ZhouYi
 * @date 2021-11-14 09:49:06
 * @description description
 * @note note
 */
export var mergeSelectionInfoByLines = (selectionInfos: any[]) => {
	// STEP Number Check, copy, sort and modify incoming array
	var startLineComparator = (info1: any, info2: any) => (info1.startLine - info2.startLine);
	var results = (selectionInfos || [])
		.concat([])
		.sort(startLineComparator)
		.map((info, index) => Object.assign(info, { originalIndex: index }))
	;
	
	// STEP Number While there are selections intersected, try merged
	while (!(results.every((item, index, arr) => (index === 0) || (item.startLine > arr[index - 1].endLine)))) {
		var mergedInfos: any[] = [];
		var handledIndexes: number[] = [];
		var originalIndexComparator = (info1: any, info2: any) => (info1.originalIndex - info2.originalIndex);
		results.forEach((info) => {
			// SUBSTEP Number Judge if this info is already handled
			var index = info.originalIndex;
			if (handledIndexes.includes(index)) {
				return;
				
			}
			
			// SUBSTEP Number Get the infos intersected with current info
			var intersections = results.filter((info2) => {
				var index2 = info2.originalIndex;
				var isIntersected = (
					(index2 !== index) 
					&& !(handledIndexes.includes(index2)) 
					&& (info2.startLine <= info.endLine)
					&& (info2.endLine >= info.startLine)
				);
				if (isIntersected) {
					handledIndexes.push(index2);
					
				}
				return isIntersected;
				
			});
			
			// SUBSTEP Number Merge the filtering results
			var mergedInfo = info;
			if (intersections.length) {
				var allIntersections = [info].concat(intersections);
				mergedInfo = allIntersections.reduce((prev, curr, index, arr) => {
					prev.startLine = isFalsyExceptZero(prev.startLine) ? curr.startLine : Math.min(prev.startLine, curr.startLine);
					prev.endLine = isFalsyExceptZero(prev.endLine) ? curr.endLine : Math.max(prev.endLine, curr.endLine);
					prev.selections = prev.selections || [];
					prev.selectionIndexes = prev.selectionIndexes || [];
					if (curr.selections) {
						prev.selections = prev.selections.concat(curr.selections);
						prev.selectionIndexes = prev.selectionIndexes.concat(curr.selectionIndexes);
						
					} else {
						prev.selections.push(curr.selection);
						prev.selectionIndexes.push(curr.originalIndex);
						
					}
					return prev;
					
				}, {});
				mergedInfo.selections.sort(originalIndexComparator);
				mergedInfo.selectionIndexes.sort();
				
			}
			
			// SUBSTEP Number Push the merged info to array
			mergedInfos.push(mergedInfo);
			mergedInfos.sort(startLineComparator);
			
		});
		results = mergedInfos;
		
	}
	return results;
	
};

/**
 * Duplicate the entire lines where selection touched
 * @public
 * @static
 * @param {vscode.ExtensionContext} context The context of current process
 * @param {boolean} insertBefore If to insert the new copies before source, It will be insert after when false
 * @return {void}
 * @author ZhouYi
 * @date 2021-11-14 06:05:24
 * @description description
 * @note note
 */
 export var duplicateEntireLines = (context: vscode.ExtensionContext, insertBefore: boolean) => {
	// STEP Number Check incoming params
	if (isNullOrUndefined(insertBefore)) {
		insertBefore = (vscode.workspace.getConfiguration("duplicateEntireLines").get("defaultInsertBefore") || false);
		
	}
	
	// STEP Number Get editor and selections
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		return;
		
	}
	const selections = editor.selections;
	
	// STEP Number Get and merge selection info according to lines intersection
	var selectionInfos = selections.map(selection => Object.assign({
		"selection": selection, 
		"startLine": selection.start.line,
		"endLine": selection.end.line,
	})).sort((info1, info2) => (info1.startLine - info2.startLine));
	selectionInfos = mergeSelectionInfoByLines(selectionInfos);
	
	// STEP Number Handled each merged selection
	if (selectionInfos.length) {
		var eol = EOLS[editor.document.eol];
		var tailSelections: any[] = [];
		editor.edit(textEdit => {
			selectionInfos.forEach(info => {
				// SUBSTEP Number Get the indexes and lines of selection
				var lineCount = info.endLine - info.startLine + 1;
				var indexes = new Array(lineCount).fill(info.startLine).map((item, index) => (item + index)); // [startLine ... endLine]
				var lineTexts = indexes.map(i => editor.document.lineAt(i).text);
				var indexOfLastLine = (editor.document.lineCount - 1);
				
				// SUBSTEP Number If the selection reach the tail of document, cache it
				if (info.endLine === indexOfLastLine) {
					var lastLineText = editor.document.lineAt(indexOfLastLine).text;
					tailSelections = tailSelections.concat((info.selections || [info.selection]).filter((item: any) => 
						(!(isNullOrUndefined(item)) && (item.end.character === lastLineText.length))
					));
					
				}
				
				// SUBSTEP Number Determine the position and text to insert
				var position = insertBefore 
					? new vscode.Position(info.startLine, 0)
					: new vscode.Position(info.endLine + 1, 0)
				;
				var text = (!(insertBefore) && tailSelections.length) 
					? eol + lineTexts.join(eol)
					: lineTexts.join(eol) + eol
				;
				
				// SUBSTEP Number Do insert
				textEdit.insert(position, text);
				
			});
			
		}).then(() => {
			// SUBSTEP Number If there is old selections reaching the tail, try to fix the issue of selection expanding
			// NOTE Number When we try to duplicate a bottom line with tail selection, we try to insert at new Position(lastLine + 1, 0)
			//             But there is no that position in fact, so editor will put it on the available ending: new Position(lastLine, lastChar)
			// NOTE Number As there is no eol at the end of bottom line to divide new text with exists selection (not like other lines),
			//             the new inserted text will be auto added to out exists selection, so our selection will expand itself.
			//             To deal with this issue, we must revert the tail selection manually.
			// NOTE Number The empty tail selections won't trigger this issue, cause them dose not have length and will not be expanded.
			tailSelections = Array.from(new Set(tailSelections));
			if (!(insertBefore) && tailSelections.length) {
				// PART Number Get new tail position of document
				var indexOfLastLine = (editor.document.lineCount - 1);
				var lastLineText = editor.document.lineAt(indexOfLastLine).text;
				var tailPosition = new vscode.Position(indexOfLastLine, lastLineText.length);
				
				// PART Number If the selection is not empty, and reaches the tail, and own same start position with old tail selection,
				//             Revert the end position of this kind of selections to the old version.
				editor.selections = editor.selections.map(selection => {
					var oldTailSelection = tailSelections.find(item => item.start.isEqual(selection.start));
					if (!(selection.isEmpty) && selection.end.isEqual(tailPosition) && oldTailSelection) {
						return new vscode.Selection(selection.start, oldTailSelection.end);
						
					}
					return selection;
					
				});
				
			}
			
		});
		
	}
	
};

/** Duplicate the entire lines where selection touched, insert copies before */
export var duplicateEntireLinesBefore = (context: vscode.ExtensionContext) => duplicateEntireLines(context, true);

/** Duplicate the entire lines where selection touched, insert copies after */
export var duplicateEntireLinesAfter = (context: vscode.ExtensionContext) => duplicateEntireLines(context, false);

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	/* 
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "duplicate-entire-lines" is now active!');
	
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('duplicate-entire-lines.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Duplicate Entire Lines!');
	});
	
	context.subscriptions.push(disposable);
	*/
	
	context.subscriptions.push(vscode.commands.registerCommand("duplicate-entire-lines.duplicate", duplicateEntireLines));
	context.subscriptions.push(vscode.commands.registerCommand("duplicate-entire-lines.duplicateBefore", duplicateEntireLinesBefore));
	context.subscriptions.push(vscode.commands.registerCommand("duplicate-entire-lines.duplicateAfter", duplicateEntireLinesAfter));
	
}

// this method is called when your extension is deactivated
export function deactivate() {}
