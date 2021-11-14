import * as assert from "assert";

// You can import and use all API from the "vscode" module
// as well as import your extension to test it
import * as vscode from "vscode";
import * as extension from "../../extension";
// import * as myExtension from "../../extension";

const lineInfoDeepEqualTest = (target1: any, target2: any) => {
	var result = extension.lineInfoDeepEqual(target1, target2);
	console.log("Is line info deep equaled: " + result);
	if (!result) {
		console.log("Target1: ");
		console.log(target1);
		console.log(JSON.stringify(target1));
		console.log("Target2: ");
		console.log(target2);
		console.log(JSON.stringify(target2));
		
	}
	return result;
	
};

suite("Extension Test Suite", () => {
	vscode.window.showInformationMessage("Start all tests.");
	
	test("Sample test", () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
		
	});
	
	test("extension.mergeSelectionInfoByLines", () => {
		var infos1 = [
			{ startLine: 1, endLine: 1 },
			{ startLine: 1, endLine: 1 },
			{ startLine: 2, endLine: 2 },
			{ startLine: 2, endLine: 2 },
			{ startLine: 3, endLine: 3 },
			{ startLine: 4, endLine: 4 },
			{ startLine: 5, endLine: 5 },
			{ startLine: 5, endLine: 5 },
			{ startLine: 6, endLine: 6 },
			{ startLine: 7, endLine: 7 },
			{ startLine: 7, endLine: 7 },
		].sort(() => (Math.random() - 0.5));
		var results1 = [
			{ startLine: 1, endLine: 1 },
			{ startLine: 2, endLine: 2 },
			{ startLine: 3, endLine: 3 },
			{ startLine: 4, endLine: 4 },
			{ startLine: 5, endLine: 5 },
			{ startLine: 6, endLine: 6 },
			{ startLine: 7, endLine: 7 },
		];
		assert.ok(lineInfoDeepEqualTest(extension.mergeSelectionInfoByLines(infos1), results1));
		var infos2 = [
			{ startLine: 2, endLine: 3 },
			{ startLine: 2, endLine: 4 },
			{ startLine: 4, endLine: 5 },
			{ startLine: 1, endLine: 3 },
			{ startLine: 6, endLine: 8 },
			{ startLine: 9, endLine: 9 },
			{ startLine: 10, endLine: 12 },
			{ startLine: 11, endLine: 13 },
			{ startLine: 14, endLine: 16 },
			{ startLine: 16, endLine: 18 },
			{ startLine: 19, endLine: 25 },
			{ startLine: 20, endLine: 22 },
			{ startLine: 27, endLine: 29 },
			{ startLine: 26, endLine: 28 },
			{ startLine: 32, endLine: 34 },
			{ startLine: 30, endLine: 32 },
			{ startLine: 36, endLine: 38 },
			{ startLine: 35, endLine: 41 },
		].sort(() => (Math.random() - 0.5));
		var results2 = [
			{ startLine: 1, endLine: 5 },
			{ startLine: 6, endLine: 8 },
			{ startLine: 9, endLine: 9 },
			{ startLine: 10, endLine: 13 },
			{ startLine: 14, endLine: 18 },
			{ startLine: 19, endLine: 25 },
			{ startLine: 26, endLine: 29 },
			{ startLine: 30, endLine: 34 },
			{ startLine: 35, endLine: 41 },
		];
		assert.ok(lineInfoDeepEqualTest(extension.mergeSelectionInfoByLines(infos2), results2));
		
	});
	
});
