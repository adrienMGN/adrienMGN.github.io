const output = document.getElementById('output');
const promptElem = document.getElementById('prompt');
const inputElem = document.getElementById('input');

let currentPath = [];
const fileSystem = {
    '/': {
        type: 'dir',
        contents: {
            'projets': {
                type: 'dir',
                contents: {
                    'projet1.html': { type: 'file', content: '<h2>Projet 1</h2><p>Description du Projet 1...</p>' },
                    'projet2.html': { type: 'file', content: '<h2>Projet 2</h2><p>Description du Projet 2...</p>' },
                }
            },
            'a-propos.html': { type: 'file', content: '<h2>À Propos</h2><p>Informations sur moi...</p>' },
            'contact.html': { type: 'file', content: '<h2>Contact</h2><p>Email: exemple@exemple.com</p>' },
            'cv.pdf': { type: 'file', content: 'Téléchargez mon CV : <a href="cv.pdf">cv.pdf</a>' },
        }
    }
};

function updatePrompt() {
    const pathStr = currentPath.length ? '/' + currentPath.join('/') : '/';
    promptElem.textContent = `visiteur@monportfolio:${pathStr}$ `;
}

function appendToOutput(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    output.appendChild(div);
    output.scrollTop = output.scrollHeight;
}

function getCurrentDirectory() {
    let current = fileSystem['/'];
    for (let dir of currentPath) {
        current = current.contents[dir];
    }
    return current;
}

function processCommand(input) {
    const [command, ...args] = input.trim().split(' ');
    switch (command) {
        case 'cd':
            handleCd(args[0]);
            break;
        case 'ls':
            handleLs();
            break;
        case 'cat':
            handleCat(args[0]);
            break;
        case 'help':
            handleHelp();
            break;
        default:
            appendToOutput(`Commande non trouvée : ${command}`);
    }
}

function handleCd(target) {
    if (!target) {
        appendToOutput('cd : argument manquant');
        return;
    }
    let newPath = [...currentPath];
    if (target.startsWith('/')) {
        newPath = [];
        target = target.slice(1);
    }
    const parts = target.split('/').filter(p => p !== '');
    for (let part of parts) {
        if (part === '..') {
            if (newPath.length > 0) newPath.pop();
        } else {
            newPath.push(part);
        }
    }
    let current = fileSystem['/'];
    for (let dir of newPath) {
        if (current.contents[dir] && current.contents[dir].type === 'dir') {
            current = current.contents[dir];
        } else {
            appendToOutput(`cd : répertoire inexistant : ${target}`);
            return;
        }
    }
    currentPath = newPath;
}

function handleLs() {
    const currentDir = getCurrentDirectory();
    const items = Object.keys(currentDir.contents).map(key => {
        const item = currentDir.contents[key];
        return item.type === 'dir' ? key + '/' : key;
    });
    appendToOutput(items.join('  '));
}

function handleCat(file) {
    if (!file) {
        appendToOutput('cat : argument manquant');
        return;
    }
    const currentDir = getCurrentDirectory();
    if (currentDir.contents[file] && currentDir.contents[file].type === 'file') {
        appendToOutput(currentDir.contents[file].content);
    } else {
        appendToOutput(`cat : fichier inexistant : ${file}`);
    }
}

function handleHelp() {
    appendToOutput(`
Commandes disponibles :
  cd <répertoire> - Changer de répertoire
  ls - Lister les fichiers et répertoires
  cat <fichier> - Afficher le contenu d'un fichier
  help - Afficher ce message d'aide
      `);
}

inputElem.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
        const command = inputElem.value.trim();
        if (command) {
            appendToOutput(`${promptElem.textContent}${command}`);
            processCommand(command);
        } else {
            appendToOutput(promptElem.textContent);
        }
        inputElem.value = '';
        updatePrompt();
    }
});

// Initialisation
updatePrompt();
inputElem.focus();
appendToOutput('Bienvenue dans le terminal de mon portfolio.<br>Tapez \'help\' pour voir les commandes disponibles.');
function simulateCommands(commands, delay = 1000) {
    let index = 0;

    function executeNextCommand() {
        if (index < commands.length) {
            const command = commands[index];
            appendToOutput(`${promptElem.textContent}${command}`);
            processCommand(command);
            index++;
            setTimeout(executeNextCommand, delay);
        }
    }

    executeNextCommand();
}

// Ajouter un répertoire et un fichier pour l'animation
fileSystem['/'].contents['alternance'] = {
    type: 'dir',
    contents: {
        'alternance.txt': {
            type: 'file',
            content: '<h2>Alternance</h2><p>Je recherche une alternance en administration système et réseau et DevOps pour ma troisième année de BUT. </p>'
        }
    }
};

// Lancer l'animation après un court délai
setTimeout(() => {
    simulateCommands(['ls', 'cd alternance', 'cat alternance.txt'], 1500);
}, 2000);