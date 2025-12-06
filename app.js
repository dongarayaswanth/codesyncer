// ===================================
// CONFIGURATION
// ===================================
const CONFIG = {
    get owner() {
        return localStorage.getItem('github_username') || '';
    },
    get repo() {
        return localStorage.getItem('github_repo') || '';
    },
    // Token is now managed via localStorage for security
    get token() {
        return localStorage.getItem('github_token');
    }
};

// ===================================
// APPLICATION CODE
// ===================================

// DOM Elements
const languageSelect = document.getElementById('language');
const codeTitleInput = document.getElementById('codeTitle');
const codeTextarea = document.getElementById('codeInput');
const descriptionTextarea = document.getElementById('description');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const loadBtn = document.getElementById('loadBtn');
const statusDiv = document.getElementById('status');
const savedCodesDiv = document.getElementById('savedCodes');
const themeSelect = document.getElementById('themeSelect');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const saveTokenBtn = document.getElementById('saveTokenBtn');
const tokenInput = document.getElementById('tokenInput');
const usernameInput = document.getElementById('usernameInput');
const repoInput = document.getElementById('repoInput');
const createRepoBtn = document.getElementById('createRepoBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const searchInput = document.getElementById('searchInput');
const aiKeyInput = document.getElementById('aiKeyInput');

// AI Elements
const aiGenerateBtn = document.getElementById('aiGenerateBtn');
const aiModal = document.getElementById('aiModal');
const closeAiModalBtn = document.getElementById('closeAiModalBtn');
const aiPromptInput = document.getElementById('aiPromptInput');
const aiSubmitBtn = document.getElementById('aiSubmitBtn');
const aiResultContainer = document.getElementById('aiResultContainer');
const aiCodePreview = document.getElementById('aiCodePreview');
const aiAcceptBtn = document.getElementById('aiAcceptBtn');
const aiRejectBtn = document.getElementById('aiRejectBtn');
const aiLoading = document.getElementById('aiLoading');

// Chat Elements
const chatHistory = document.getElementById('chatHistory');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');
const chatClearBtn = document.getElementById('chatClearBtn');

// File View Modal Elements
const fileViewModal = document.getElementById('fileViewModal');
const closeFileViewBtn = document.getElementById('closeFileViewBtn');
const viewFileName = document.getElementById('viewFileName');
const viewFileDescription = document.getElementById('viewFileDescription');
const viewFileCode = document.getElementById('viewFileCode');
const downloadFileBtn = document.getElementById('downloadFileBtn');

// State for editing
let editingFile = null; // { path: string, sha: string }
let currentViewFile = null; // { name: string, content: string }
let allFiles = []; // Store all files for searching

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('App Initialized');
    setupEventListeners();
    loadTheme();
    
    // Check for token
    if (CONFIG.token) {
        fetchFromGitHub();
    } else {
        // Only show status if statusDiv exists (it might not on all pages)
        if (statusDiv) showStatus('⚠️ Please configure your GitHub Token', 'info');
        // Don't auto-open settings on every page load, maybe just on home?
        // openSettings(); 
    }
});

// Setup event listeners
function setupEventListeners() {
    if (saveBtn) saveBtn.addEventListener('click', saveToGitHub);
    if (clearBtn) clearBtn.addEventListener('click', clearForm);
    if (loadBtn) loadBtn.addEventListener('click', fetchFromGitHub);
    if (themeSelect) themeSelect.addEventListener('change', changeTheme);
    
    // Settings Modal
    if (settingsBtn) settingsBtn.addEventListener('click', openSettings);
    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettings);
    if (saveTokenBtn) saveTokenBtn.addEventListener('click', saveSettings);
    if (createRepoBtn) createRepoBtn.addEventListener('click', createRepository);
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            closeSettings();
        }
        if (fileViewModal && e.target === fileViewModal) {
            fileViewModal.style.display = 'none';
        }
        if (aiModal && e.target === aiModal) {
            aiModal.style.display = 'none';
        }
    });

    // AI Modal
    if (aiGenerateBtn) aiGenerateBtn.addEventListener('click', openAiModal);
    if (closeAiModalBtn) closeAiModalBtn.addEventListener('click', () => aiModal.style.display = 'none');
    if (aiSubmitBtn) aiSubmitBtn.addEventListener('click', generateAiCode);
    if (aiAcceptBtn) aiAcceptBtn.addEventListener('click', acceptAiCode);
    if (aiRejectBtn) aiRejectBtn.addEventListener('click', () => {
        aiResultContainer.style.display = 'none';
        aiPromptInput.value = '';
    });

    // File View Modal
    if (closeFileViewBtn) {
        closeFileViewBtn.addEventListener('click', () => {
            fileViewModal.style.display = 'none';
        });
    }
    
    if (downloadFileBtn) downloadFileBtn.addEventListener('click', downloadCurrentFile);

    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            filterFiles(e.target.value);
        });
    }

    // Custom Select Logic
    setupCustomSelect();

    // Font Size Logic
    setupFontSize();

    // Prevent tab key from leaving textarea
    if (codeTextarea) codeTextarea.addEventListener('keydown', handleTabKey);

    // Chat Page Listeners
    if (chatSendBtn) chatSendBtn.addEventListener('click', sendChatMessage);
    if (chatClearBtn) chatClearBtn.addEventListener('click', clearChatHistory);
    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }
    
    // Load chat history if on chat page
    if (chatHistory) loadChatHistory();
}

function setupFontSize() {
    const fontSizeDisplay = document.getElementById('fontSizeDisplay');
    const increaseFontBtn = document.getElementById('increaseFontBtn');
    const decreaseFontBtn = document.getElementById('decreaseFontBtn');
    
    let currentFontSize = parseInt(localStorage.getItem('fontSize')) || 14;

    function updateFontSize() {
        document.body.style.fontSize = `${currentFontSize}px`;
        fontSizeDisplay.textContent = `${currentFontSize}px`;
        localStorage.setItem('fontSize', currentFontSize);
    }

    // Initialize
    updateFontSize();

    increaseFontBtn.addEventListener('click', () => {
        if (currentFontSize < 32) {
            currentFontSize += 2;
            updateFontSize();
        }
    });

    decreaseFontBtn.addEventListener('click', () => {
        if (currentFontSize > 10) {
            currentFontSize -= 2;
            updateFontSize();
        }
    });
}

function setupCustomSelect() {
    const customSelect = document.getElementById('customLanguageSelect');
    if (!customSelect) return;

    const trigger = customSelect.querySelector('.custom-select-trigger');
    const options = customSelect.querySelectorAll('.custom-option');
    const hiddenInput = document.getElementById('language');

    // Toggle dropdown
    trigger.addEventListener('click', () => {
        customSelect.classList.toggle('open');
    });

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
            customSelect.classList.remove('open');
        }
    });

    // Handle option selection
    options.forEach(option => {
        option.addEventListener('click', () => {
            const value = option.getAttribute('data-value');
            const html = option.innerHTML;
            
            // Update trigger
            trigger.innerHTML = html;
            
            // Update hidden input
            hiddenInput.value = value;
            
            // Update selected class
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            // Close dropdown
            customSelect.classList.remove('open');
        });
    });
}

function openSettings() {
    tokenInput.value = CONFIG.token || '';
    if (usernameInput) usernameInput.value = CONFIG.owner || '';
    if (repoInput) repoInput.value = CONFIG.repo || '';
    
    // Hide AI Key input if default is present
    if (typeof DEFAULT_AI_KEY !== 'undefined' && DEFAULT_AI_KEY) {
        if (aiKeyInput) {
            aiKeyInput.parentElement.style.display = 'none';
        }
    } else {
        if (aiKeyInput) {
            aiKeyInput.value = localStorage.getItem('ai_api_key') || '';
            aiKeyInput.parentElement.style.display = 'block';
        }
    }
    
    settingsModal.style.display = 'block';
}

function closeSettings() {
    settingsModal.style.display = 'none';
}

function saveSettings() {
    const token = tokenInput.value.trim();
    const username = usernameInput ? usernameInput.value.trim() : '';
    const repo = repoInput ? repoInput.value.trim() : '';
    const aiKey = aiKeyInput ? aiKeyInput.value.trim() : '';

    if (token && username && repo) {
        localStorage.setItem('github_token', token);
        localStorage.setItem('github_username', username);
        localStorage.setItem('github_repo', repo);
        if (aiKey) localStorage.setItem('ai_api_key', aiKey);
        
        showStatus('✅ Configuration saved successfully', 'success');
        closeSettings();
        if (typeof fetchFromGitHub === 'function') {
            fetchFromGitHub();
        }
    } else {
        alert('Please fill in all fields (Token, Username, Repository)');
    }
}

// AI Functions
function openAiModal() {
    // Check for default key first, then local storage
    const key = (typeof DEFAULT_AI_KEY !== 'undefined' && DEFAULT_AI_KEY) ? DEFAULT_AI_KEY : localStorage.getItem('ai_api_key');
    
    if (!key) {
        alert('Please configure your AI API Key in Settings first.');
        openSettings();
        return;
    }
    aiModal.style.display = 'block';
    aiPromptInput.focus();
}

async function generateAiCode() {
    const prompt = aiPromptInput.value.trim();
    const key = (typeof DEFAULT_AI_KEY !== 'undefined' && DEFAULT_AI_KEY) ? DEFAULT_AI_KEY : localStorage.getItem('ai_api_key');
    
    if (!prompt) return;
    
    aiLoading.style.display = 'block';
    aiResultContainer.style.display = 'none';
    aiSubmitBtn.disabled = true;

    try {
        // Use OpenRouter API (Free Models)
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`,
                'HTTP-Referer': window.location.href, // Required by OpenRouter
                'X-Title': 'Code Syncer'
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3.3-70b-instruct:free",
                messages: [
                    {
                        role: "system", 
                        content: "You are an expert coding assistant. Return ONLY the code requested. Do not include markdown backticks (```) or explanations unless asked in comments."
                    },
                    {
                        role: "user", 
                        content: prompt
                    }
                ]
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error?.message || 'API Error');
        }

        const data = await response.json();
        let code = data.choices[0].message.content;
        
        // Clean up markdown if present
        code = code.replace(/^```\w*\n/, '').replace(/\n```$/, '');

        aiCodePreview.textContent = code;
        aiResultContainer.style.display = 'flex';

    } catch (error) {
        console.error(error);
        alert('AI Generation Failed: ' + error.message);
    } finally {
        aiLoading.style.display = 'none';
        aiSubmitBtn.disabled = false;
    }
}

function acceptAiCode() {
    const code = aiCodePreview.textContent;
    if (codeTextarea) {
        // Insert at cursor or append
        const start = codeTextarea.selectionStart;
        const end = codeTextarea.selectionEnd;
        const text = codeTextarea.value;
        
        if (start || start === 0) {
            codeTextarea.value = text.substring(0, start) + code + text.substring(end);
        } else {
            codeTextarea.value += code;
        }
        
        // Trigger input event to resize if needed
        codeTextarea.dispatchEvent(new Event('input'));
    }
    aiModal.style.display = 'none';
    aiPromptInput.value = '';
    aiResultContainer.style.display = 'none';
    showStatus('✨ Code inserted!', 'success');
}

async function createRepository() {
    const token = tokenInput.value.trim();
    const repoName = repoInput.value.trim();

    if (!token) {
        alert('Please enter your GitHub Token first');
        return;
    }
    if (!repoName) {
        alert('Please enter a Repository Name');
        return;
    }

    createRepoBtn.disabled = true;
    createRepoBtn.textContent = 'Creating...';

    try {
        const response = await fetch('https://api.github.com/user/repos', {
            method: 'POST',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                name: repoName,
                private: false, // Default to public, user can change later
                auto_init: true, // Create README so we have a main branch
                description: 'Created via Code Syncer'
            })
        });

        if (response.status === 201) {
            alert(`✅ Repository "${repoName}" created successfully!`);
            // Auto-fill username if empty (we can get it from the response owner.login)
            const data = await response.json();
            if (usernameInput && !usernameInput.value) {
                usernameInput.value = data.owner.login;
            }
            saveSettings(); // Save the new config
        } else if (response.status === 422) {
            alert('❌ Repository already exists or name is invalid.');
        } else {
            const error = await response.json();
            alert(`❌ Error: ${error.message}`);
        }
    } catch (error) {
        console.error(error);
        alert('❌ Network Error');
    } finally {
        createRepoBtn.disabled = false;
        createRepoBtn.textContent = 'Create Repo';
    }
}


// Theme Handling
function changeTheme() {
    document.body.className = themeSelect.value;
    localStorage.setItem('theme', themeSelect.value);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.body.className = savedTheme;
        themeSelect.value = savedTheme;
    }
}

// Handle tab key in textarea
function handleTabKey(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        const value = this.value;
        this.value = value.substring(0, start) + '\t' + value.substring(end);
        this.selectionStart = this.selectionEnd = start + 1;
    }
}

// Clear form
function clearForm() {
    if (confirm('Clear all fields?')) {
        resetForm();
        showStatus('Form cleared', 'info');
    }
}

function resetForm() {
    codeTitleInput.value = '';
    codeTextarea.value = '';
    descriptionTextarea.value = '';
    editingFile = null;
    saveBtn.textContent = 'Save to GitHub';
    codeTitleInput.disabled = false;
    
    // Reset language to python
    document.getElementById('language').value = 'python';
    const customSelect = document.getElementById('customLanguageSelect');
    const trigger = customSelect.querySelector('.custom-select-trigger');
    const defaultOption = customSelect.querySelector('[data-value="python"]');
    if (defaultOption) {
        trigger.innerHTML = defaultOption.innerHTML;
        customSelect.querySelectorAll('.custom-option').forEach(o => o.classList.remove('selected'));
        defaultOption.classList.add('selected');
    }
}

// Save code to GitHub
async function saveToGitHub() {
    const token = CONFIG.token;
    const code = codeTextarea.value;
    let title = codeTitleInput.value.trim() || 'untitled';
    const language = languageSelect.value;
    const description = descriptionTextarea.value.trim();

    if (!token) {
        showStatus('❌ GitHub Token is missing in configuration', 'error');
        return;
    }
    if (!code) {
        showStatus('❌ Please enter some code', 'error');
        return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = 'Processing...';

    try {
        let path, message, sha;

        if (editingFile) {
            // Updating existing file
            path = editingFile.path;
            sha = editingFile.sha;
            message = `Update ${path}`;
        } else {
            // Creating new file
            const ext = getExtension(language);
            // If title doesn't have extension, add it
            if (!title.endsWith(ext)) {
                // If user didn't provide extension, we might want to add timestamp to avoid collisions
                // But for "Hacker" feel, let's trust the user's filename or add one if missing
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const safeTitle = title.replace(/[^a-zA-Z0-9-_]/g, '_');
                title = `${safeTitle}_${timestamp}${ext}`;
            }
            path = `${language}/${title}`;
            message = `Add ${language} snippet: ${title}`;
        }
        
        // Create file content with metadata header
        const fileContent = `/*
Title: ${title}
Description: ${description}
Date: ${new Date().toLocaleString()}
*/

${code}`;

        // Base64 encode content (required by GitHub API)
        const contentEncoded = btoa(unescape(encodeURIComponent(fileContent)));

        const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`;
        
        const body = {
            message: message,
            content: contentEncoded
        };

        if (sha) {
            body.sha = sha;
        }

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message);
        }

        showStatus(`✅ Saved to ${path}`, 'success');
        resetForm();
        fetchFromGitHub(); // Refresh list

    } catch (error) {
        console.error(error);
        showStatus('❌ Error: ' + error.message, 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save to GitHub';
    }
}

// Fetch files from GitHub
async function fetchFromGitHub() {
    if (!savedCodesDiv) return;

    const token = CONFIG.token;
    if (!token) {
        showStatus('❌ GitHub Token is missing in configuration', 'error');
        return;
    }

    loadBtn.disabled = true;
    loadBtn.textContent = '...';
    savedCodesDiv.innerHTML = '<div class="loading-spinner">Scanning repository...</div>';

    try {
        // 1. Get all files recursively using the Git Tree API (more efficient)
        const repoUrl = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}`;
        const repoResponse = await fetch(repoUrl, {
            headers: { 'Authorization': `token ${token}` }
        });
        const repoData = await repoResponse.json();
        const defaultBranch = repoData.default_branch;

        const treeUrl = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/git/trees/${defaultBranch}?recursive=1`;
        const treeResponse = await fetch(treeUrl, {
            headers: { 'Authorization': `token ${token}` }
        });
        
        if (treeResponse.status === 404) {
            // Repository is empty or branch doesn't exist yet
            savedCodesDiv.innerHTML = '<p class="empty-message">Repository is empty (No commits yet)</p>';
            showStatus('✅ System Online: Repository ready', 'success');
            return;
        }

        if (!treeResponse.ok) throw new Error('Failed to fetch repository tree');
        
        const treeData = await treeResponse.json();
        
        const files = treeData.tree.filter(item => item.type === 'blob');
        
        files.sort((a, b) => b.path.localeCompare(a.path)); 

        allFiles = files; // Save for searching
        displayFiles(files);
        showStatus(`✅ System Online: ${files.length} files loaded`, 'success');

    } catch (error) {
        console.error(error);
        savedCodesDiv.innerHTML = '<p class="empty-message">Connection Failed</p>';
        showStatus('❌ Error: ' + error.message, 'error');
    } finally {
        loadBtn.disabled = false;
        loadBtn.textContent = 'Refresh';
    }
}

// Filter files based on search
function filterFiles(searchTerm) {
    if (!searchTerm) {
        displayFiles(allFiles);
        return;
    }
    
    const term = searchTerm.toLowerCase();
    const filtered = allFiles.filter(file => 
        file.path.toLowerCase().includes(term)
    );
    
    displayFiles(filtered);
}

// Display files list
function displayFiles(files) {
    savedCodesDiv.innerHTML = '';
    
    if (files.length === 0) {
        savedCodesDiv.innerHTML = '<p class="empty-message">No matching files found</p>';
        return;
    }
    
    files.forEach(file => {
        const div = document.createElement('div');
        div.className = 'code-item';
        // Escape single quotes in path to prevent HTML attribute breakage
        const safePath = file.path.replace(/'/g, "\\'");
        
        div.innerHTML = `
            <div class="code-item-header">
                <div class="code-item-actions-left">
                    <button class="btn-small" title="Edit" onclick="editFile('${file.url}', '${safePath}', '${file.sha}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        <span>Edit</span>
                    </button>
                </div>
                <div class="code-item-title">
                    <h3 onclick="viewFile('${file.url}', '${file.sha}')" class="clickable-title">${file.path}</h3>
                </div>
                <div class="code-item-actions-right">
                    <button class="btn-small btn-danger-icon" title="Delete" onclick="deleteFile('${safePath}', '${file.sha}')">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        `;
        savedCodesDiv.appendChild(div);
    });
}

// Edit File
async function editFile(url, path, sha) {
    try {
        showStatus('Loading file for editing...', 'info');
        
        // Use the Blob URL directly from the tree API (more reliable for raw content)
        // But we need to handle the response correctly
        const response = await fetch(url, {
            headers: { 'Authorization': `token ${CONFIG.token}` }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.content) {
            throw new Error('File content is empty or too large');
        }

        // Clean base64 string (remove newlines) and decode
        const cleanContent = data.content.replace(/\n/g, '');
        const content = decodeURIComponent(escape(atob(cleanContent)));
        
        // Parse content to separate metadata if possible
        // Our format is /* ... */ \n code
        let code = content;
        let description = '';
        let title = path.split('/').pop(); // Default to filename
        
        // Simple parsing of our metadata format
        const metadataMatch = content.match(/^\/\*([\s\S]*?)\*\/\s*([\s\S]*)/);
        if (metadataMatch) {
            const metadata = metadataMatch[1];
            code = metadataMatch[2];
            
            const titleMatch = metadata.match(/Title: (.*)/);
            if (titleMatch) title = titleMatch[1].trim();
            
            const descMatch = metadata.match(/Description: (.*)/);
            if (descMatch) description = descMatch[1].trim();
        }

        // Populate form
        codeTextarea.value = code;
        codeTitleInput.value = title;
        descriptionTextarea.value = description;
        
        // Try to set language from path
        const ext = '.' + path.split('.').pop();
        for (const [lang, extension] of Object.entries(getExtensionMap())) {
            if (extension === ext) {
                // Update hidden input
                document.getElementById('language').value = lang;
                
                // Update custom select UI
                const customSelect = document.getElementById('customLanguageSelect');
                const options = customSelect.querySelectorAll('.custom-option');
                const trigger = customSelect.querySelector('.custom-select-trigger');
                
                options.forEach(opt => {
                    if (opt.getAttribute('data-value') === lang) {
                        opt.classList.add('selected');
                        trigger.innerHTML = opt.innerHTML;
                    } else {
                        opt.classList.remove('selected');
                    }
                });
                break;
            }
        }

        // Set editing state
        editingFile = { path, sha };
        saveBtn.textContent = 'Update File';
        
        // Disable fields that shouldn't change during edit (optional, but safer for path consistency)
        // codeTitleInput.disabled = true; 
        // languageSelect.disabled = true;

        showStatus(`Editing: ${path}`, 'success');
        
    } catch (error) {
        console.error(error);
        showStatus('❌ Error loading file', 'error');
    }
}

// Delete File
async function deleteFile(path, sha) {
    if (!confirm(`Are you sure you want to DELETE ${path}? This cannot be undone.`)) {
        return;
    }

    try {
        const url = `https://api.github.com/repos/${CONFIG.owner}/${CONFIG.repo}/contents/${path}`;
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${CONFIG.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Delete ${path}`,
                sha: sha
            })
        });

        if (!response.ok) {
            throw new Error('Failed to delete file');
        }

        showStatus(`🗑️ Deleted ${path}`, 'success');
        fetchFromGitHub(); // Refresh list

    } catch (error) {
        console.error(error);
        showStatus('❌ Error deleting file', 'error');
    }
}

// View file content
async function viewFile(url, sha) {
    try {
        showStatus('Loading file...', 'info');
        
        // Use the Blob URL directly (passed as 'url' parameter)
        // Note: In displayFiles, we pass file.url as the first arg to viewFile
        const response = await fetch(url, {
            headers: { 'Authorization': `token ${CONFIG.token}` }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.content) {
            throw new Error('File content is empty or too large');
        }
        
        // Decode content
        const cleanContent = data.content.replace(/\n/g, '');
        const content = decodeURIComponent(escape(atob(cleanContent)));
        
        // Parse metadata
        let code = content;
        let description = '';
        let title = data.name;
        
        const metadataMatch = content.match(/^\/\*([\s\S]*?)\*\/\s*([\s\S]*)/);
        if (metadataMatch) {
            const metadata = metadataMatch[1];
            code = metadataMatch[2];
            
            const titleMatch = metadata.match(/Title: (.*)/);
            if (titleMatch) title = titleMatch[1].trim();
            
            const descMatch = metadata.match(/Description: (.*)/);
            if (descMatch) description = descMatch[1].trim();
        }

        // Populate Modal
        viewFileName.textContent = title;
        viewFileCode.textContent = code;
        
        if (description) {
            viewFileDescription.textContent = description;
            viewFileDescription.style.display = 'block';
        } else {
            viewFileDescription.style.display = 'none';
        }

        // Store for download
        currentViewFile = {
            name: title,
            content: content // Download the full content including metadata
        };

        // Show Modal
        fileViewModal.style.display = 'block';
        showStatus('✅ File loaded', 'success');
        
    } catch (error) {
        console.error(error);
        showStatus('❌ Error loading file content', 'error');
    }
}

function downloadCurrentFile() {
    if (!currentViewFile) return;
    
    const blob = new Blob([currentViewFile.content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentViewFile.name;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    showStatus('⬇️ Download started', 'success');
}

function copyToClipboard(btn) {
    const text = btn.previousElementSibling.textContent;
    navigator.clipboard.writeText(text);
    const original = btn.textContent;
    btn.textContent = '✅ Copied';
    setTimeout(() => btn.textContent = original, 2000);
}

// Helper: Get file extension
function getExtension(lang) {
    return getExtensionMap()[lang] || '.txt';
}

function getExtensionMap() {
    return {
        'python': '.py', 'java': '.java', 'javascript': '.js', 'cpp': '.cpp',
        'csharp': '.cs', 'go': '.go', 'rust': '.rs', 'php': '.php',
        'ruby': '.rb', 'swift': '.swift', 'kotlin': '.kt', 'typescript': '.ts',
        'sql': '.sql', 'html': '.html', 'css': '.css'
    };
}

// Helper: Show status
function showStatus(msg, type) {
    if (!statusDiv) return;
    statusDiv.textContent = msg;
    statusDiv.className = `status-message ${type}`;
    statusDiv.style.display = 'block';
    setTimeout(() => statusDiv.style.display = 'none', 5000);
}

// Helper: Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Chat Functionality
function loadChatHistory() {
    const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
    chatHistory.innerHTML = ''; // Clear current
    
    // Add welcome message if empty
    if (history.length === 0) {
        chatHistory.innerHTML = `
            <div class="chat-welcome" style="text-align: center; opacity: 0.7; margin-top: 50px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: 10px;"><rect width="18" height="10" x="3" y="11" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" x2="8" y1="16" y2="16"/><line x1="16" x2="16" y1="16" y2="16"/></svg>
                <p>Start a conversation with the AI...</p>
            </div>
        `;
        return;
    }

    history.forEach(msg => appendMessageToUI(msg.role, msg.content));
    scrollToBottom();
}

function appendMessageToUI(role, content) {
    // Remove welcome message if it exists
    const welcome = chatHistory.querySelector('.chat-welcome');
    if (welcome) welcome.remove();

    // Map 'assistant' to 'ai' for styling
    const styleRole = role === 'assistant' ? 'ai' : role;
    
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${styleRole}`;
    
    const sender = role === 'user' ? 'You' : 'AI';
    
    // Format content (simple markdown support)
    let formattedContent = content
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/```(\w*)([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\n/g, '<br>');

    msgDiv.innerHTML = `
        <div class="chat-sender">${sender}</div>
        <div class="chat-bubble">${formattedContent}</div>
    `;
    
    chatHistory.appendChild(msgDiv);
}

function scrollToBottom() {
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

async function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    const key = (typeof DEFAULT_AI_KEY !== 'undefined' && DEFAULT_AI_KEY) ? DEFAULT_AI_KEY : localStorage.getItem('ai_api_key');
    
    // Add user message
    appendMessageToUI('user', text);
    chatInput.value = '';
    scrollToBottom();
    
    // Save to history
    const history = JSON.parse(localStorage.getItem('chat_history') || '[]');
    history.push({ role: 'user', content: text });
    localStorage.setItem('chat_history', JSON.stringify(history));

    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'chat-message ai loading-msg';
    loadingDiv.innerHTML = `
        <div class="chat-sender">AI</div>
        <div class="chat-bubble">Thinking...</div>
    `;
    chatHistory.appendChild(loadingDiv);
    scrollToBottom();

    try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`,
                'HTTP-Referer': window.location.href,
                'X-Title': 'Code Syncer'
            },
            body: JSON.stringify({
                model: "meta-llama/llama-3.3-70b-instruct:free",
                messages: [
                    {
                        role: "system", 
                        content: "You are a helpful coding assistant. Answer questions and provide code snippets."
                    },
                    ...history
                ]
            })
        });

        if (!response.ok) {
            throw new Error('API Error');
        }

        const data = await response.json();
        const aiText = data.choices[0].message.content;
        
        // Remove loading
        loadingDiv.remove();
        
        // Add AI message
        appendMessageToUI('assistant', aiText); // OpenRouter returns 'assistant'
        scrollToBottom();
        
        // Save to history
        history.push({ role: 'assistant', content: aiText });
        localStorage.setItem('chat_history', JSON.stringify(history));

    } catch (error) {
        loadingDiv.innerHTML = `
            <div class="chat-sender">System</div>
            <div class="chat-bubble" style="color: var(--danger-color); border-color: var(--danger-color);">Error: ${error.message}</div>
        `;
    }
}

function clearChatHistory() {
    if (confirm('Are you sure you want to clear the chat history?')) {
        localStorage.removeItem('chat_history');
        loadChatHistory();
    }
}
