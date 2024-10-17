
# О плагине в целом
Этот плагин позволяет просто создавать структуру проекта, а так же поддерживает шаблоны.

# Инструкция использования
## Первый шаг
Вам обязательно потребуется создать файл с названием "**structure.json**", в нём в формате JSON нужно будет выстраивать структуру:

+ Для создании обычной папки нужно просто создать объект:
**structure.json**
```json
{
	"someObject": {}
}
```

+ Папки могут быть вложенными:
**structure.json**
```json
{
	"someObject": {
		"a": {},
		"b": {}
	}
}
```

+ Чтобы создать структуру проекта, необходимо вызвать команду "Generate Project Structure" через меню команд (Ctrl + Shift + P). Либо воспользоваться комбинацией клавиш "ctrl+shift+]".

+ При создании элементов с одинаковыми названиями возможно неопределённое поведение.
## Работа с шаблонами файлов
Данный плагин поддерживает работу с шаблонами, для этого вам потребуется создать папку с названием "**templates**", все папки и файлы, которые находятся в "**templates**" будут являться шаблонами.

+ Для использования шаблона, в структуре необходимо указать строку с названием шаблона:
```
templates
|
|-someTemplate.txt
```

**structure.json**
```json
{
	"someTemplateObject": "someTemplate.txt"
}
```
Теперь в вашем проекте будет создан файл с именем "**someTemplate.txt**", содержимое которого будет совпадать с файлом из папки "**templates**". Хотя в структуре указан объект с именем "**someTemplateObject**", в проекте будет создан файл с именем шаблона.

+ Вы можете использовать специальную конструкцию "(name)" в названии шаблона для того, чтобы задать динамическое имя файлу. Плагин заменит "(name)" на указанное в JSON название:
```
templates
|
|-(name).txt
```

**structure.json**
```json
{
	"someTemplateObject": "(name).txt"
}
```
В проекте будет создан файл с именем "**someTemplateObject.txt**", а его содержимое будет таким же, как в файле "**(name).txt**" из папки шаблонов.

+ Плагин также поддерживает использование конструкции `[...]`, которая позволяет удалять всё, что находится внутри скобок, вместе с самими скобками. Это может пригодиться для создания нескольких версий одного шаблона:
```
templates
|
|-(name)[a].txt
|-(name)[b].txt
```

**structure.json**
```json
{
	"someTemplateObject1": "(name)[a].txt",
	"someTemplateObject2": "(name)[b].txt"
}
```
В проекте будут созданы два файла:
- "**someTemplateObject1.txt**" с содержимым из "**(name)\[a].txt**",
- "**someTemplateObject2.txt**" с содержимым из "**(name)\[b].txt**".


+ При создании элементов с одинаковыми названиями возможно неопределённое поведение.
## Работа с шаблонами папок
Плагин также поддерживает шаблоны для папок. Вы можете создать папку в директории "**templates**", а затем указать её в структуре через JSON. Правила использования конструкций `(name)` и `[...]` работают для папок аналогично файлам. Если в шаблоне папки создаются файлы или другие папки с использованием "(name)", они также будут адаптированы.
```
templates
|
|-(name)[someFolder]
||
||-(name)
|||
|||-(name)1[a].txt
||
||-(name)2[b].txt
```

**structure.json**
```json
{
	"Test": "(name)[someFolder]"
}
```

По итогу будет получена следующая структура проекта: 
```
Test
|
|-Test
||
||-Test1.txt
|
|-Test2.txt
```
Файл "**Test1.txt**" будет содержать то же самое, что и "**(name)1\[a].txt**", а файл "**Test2.txt**" будет содержать данные из "**(name)2\[b].txt**".

# Обзор кода
+ Функция `activate` отвечает за регистрацию команды, запускающей плагин, и установку путей к файлу "**structure.json**" и папке "**templates**". Она считывает структуру и вызывает функцию создания папок и файлов на основе шаблонов:
```ts
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
```

+ Функция  `createFolders` рекурсивно создаёт папки и шаблоны на основе структуры.
```ts
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
```

+ Функция `createTemplate` рекурсивно создаёт шаблон.
```ts
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

                    createTemplates(newPath, newTemplatePath, '_', fileName);
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
```

> Шакура Роберт Дмитриевич M3101
