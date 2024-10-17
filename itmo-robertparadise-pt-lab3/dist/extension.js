/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(__webpack_require__(1));
const fs = __importStar(__webpack_require__(2));
const path = __importStar(__webpack_require__(3));
const STRUCTURE_FILE = 'structure.json';
const TEMPLATES_FOLDER = 'templates';
/**
 * Activates the extension and registers the 'extension.createStructure' command.
 */
function activate(context) {
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
function createFolders(basePath, templatesPath, structure) {
    if (!basePath) {
        return;
    }
    for (const key in structure) {
        const value = structure[key];
        if (typeof value === "object") {
            // If it's no template
            const folderPath = path.join(basePath, key);
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);
            }
            createFolders(folderPath, templatesPath, value);
        }
        else if (typeof value === "string") {
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
function createTemplate(basePath, templatesPath, template, fileName) {
    fs.readdir(templatesPath, { withFileTypes: true }, (err, objects) => {
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
                    if (template === '_') {
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
function deactivate() { }


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((module) => {

module.exports = require("fs");

/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("path");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map