import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

const STRUCTURE_FILE = 'structure.json';
const TEMPLATES_FOLDER = 'templates';

/**
 * Activates the extension and registers the 'extension.createStructure' command.
 */
export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.createStructure', () => {
    	const filePath = vscode.workspace.rootPath + '/' + STRUCTURE_FILE;
    	const templatesPath = vscode.workspace.rootPath + '/' + TEMPLATES_FOLDER;

    	// Read structure file
    	fs.readFile(filePath, 'utf8', (err, data) => {
        	if (err) {
            	vscode.window.showErrorMessage('Error reading structure file!');
            	return;
        	}
      
        	const structure = JSON.parse(data);
        	createFolders(vscode.workspace.rootPath, templatesPath, structure);
		});
    });

    context.subscriptions.push(disposable);
}

/**
 * Recursively creates folders based on the structure provided.
 * If a value is an object, it creates a folder. If a value is a string representing a template, it creates with that template.
 * @param basePath The base path to create the folders in.
 * @param templatesPath The path to the templates folder.
 * @param structure The structure object defining the folders to create.
 */
function createFolders(basePath: string | undefined, templatesPath: string, structure: any) {
	if(!basePath){
		return;
	}

    for(const key in structure) {
		const value = structure[key];
		if(typeof value === "object") {
			// If it's no template

			const folderPath = path.join(basePath, key);
    
        	if (!fs.existsSync(folderPath)) {
            	fs.mkdirSync(folderPath);
        	}

        	createFolders(folderPath, templatesPath, value);
		}
		else if(typeof value === "string") {
			// If it's a template

			if (value === "_") {
				vscode.window.showErrorMessage(`Error invalid template name "${value}"`);
				return;
			}

			createTemplate(basePath, templatesPath, value, key);
		}
    }
}

/**
 * Create given template.
 */
function createTemplate(basePath: string, templatesPath: string, template: string, fileName: string) {
	fs.readdir(templatesPath, {withFileTypes: true}, (err, objects) => {
		if (err) {
			vscode.window.showErrorMessage('Error reading directory:' + err);
			return;
		}

		// Check all objects in the folder
		for (const obj of objects) {
			const newTemplatePath = path.join(templatesPath, obj.name);
			// If template = "_" then we are already in template processing
			// If template != "_" then we need find given template
			if (obj.name === template || template === '_') {
				if (obj.isDirectory()) {
					let newPath;
					if(template === '_') {
						newPath = path.join(basePath, obj.name);	
					}
					else {
						newPath = path.join(basePath, template);
					}

					newPath = newPath.replace(/\(name\)/g, fileName);
					// remove [...] constructs
					newPath = newPath.replace(/\[.*?\]/g, '');

					if (!fs.existsSync(newPath)) {
						fs.mkdirSync(newPath);
					}

					createTemplate(newPath, newTemplatePath, '_', fileName);
				}
				else {
					let finalName = obj.name.replace(/\(name\)/g, fileName);
					// remove [...] constructs
					finalName = finalName.replace(/\[.*?\]/g, '');
					if (!fs.existsSync(path.join(basePath, finalName))) {
						fs.copyFileSync(path.join(templatesPath, obj.name), path.join(basePath, finalName));
					}
				}
			}
		}
	});
}

export function deactivate() {}
