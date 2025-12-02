# Code Storage - Save to Telegram

A simple and elegant web application that allows you to save code snippets to Telegram with perfect formatting preservation. Designed to handle code from any programming language (Python, Java, JavaScript, etc.) without losing spaces, tabs, or indentation.

## ✨ Features

- **Perfect Formatting Preservation**: All spaces, tabs, and indentation are preserved exactly as you paste them
- **Multiple Language Support**: Python, Java, JavaScript, C++, C#, Go, Rust, PHP, Ruby, Swift, Kotlin, TypeScript, SQL, HTML, CSS, and more
- **Telegram Integration**: Saves your code snippets directly to your Telegram chat
- **Auto-Save Drafts**: Automatically saves your work in progress to browser storage
- **Syntax Highlighting in Telegram**: Code is sent with proper Markdown formatting for syntax highlighting
- **Clean UI**: Modern, responsive design that works on all devices
- **Tab Key Support**: Use Tab key in the code editor for proper indentation

## 🚀 Setup Instructions

### Step 1: Create a Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` command
3. Follow the instructions to create your bot
4. Copy the **bot token** you receive (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### Step 2: Get Your Chat ID

1. Send a message to your newly created bot in Telegram
2. Open this URL in your browser (replace `<YOUR_BOT_TOKEN>` with your actual bot token):
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
3. Look for `"chat":{"id":` in the response
4. Copy the number after `"id":` (this is your **chat ID**)

### Step 3: Configure the Application

1. Open `script.js` in a text editor
2. Find the `CONFIG` section at the top:
   ```javascript
   const CONFIG = {
       botToken: 'YOUR_BOT_TOKEN_HERE',
       chatId: 'YOUR_CHAT_ID_HERE'
   };
   ```
3. Replace `YOUR_BOT_TOKEN_HERE` with your bot token
4. Replace `YOUR_CHAT_ID_HERE` with your chat ID

### Step 4: Run the Application

1. Open `index.html` in your web browser
2. Start saving your code snippets!

## 📖 How to Use

1. **Select Language**: Choose the programming language from the dropdown
2. **Add Title** (Optional): Give your code snippet a descriptive title
3. **Paste Code**: Copy and paste your code into the large text area
   - All spaces, tabs, and indentation will be preserved
   - You can use Tab key for indentation
4. **Add Description** (Optional): Add notes or comments about the code
5. **Click "Save to Telegram"**: Your code will be sent to your Telegram chat
6. **Check Telegram**: Open your Telegram bot chat to see your saved code

## 🔒 Privacy & Security

- All code is sent directly from your browser to Telegram's API
- No third-party servers are involved
- Your bot token and chat ID remain in your local `script.js` file
- Draft auto-save uses browser's localStorage (stays on your device)

## 🛠️ Technical Details

### Why Formatting is Preserved

1. **Monospace Font**: Uses `Consolas/Monaco/Courier New` font family
2. **White-space Preservation**: CSS `white-space: pre` maintains all whitespace
3. **Tab Support**: JavaScript intercepts Tab key to insert actual tab characters
4. **Markdown Code Blocks**: Telegram receives code in properly formatted Markdown code blocks
5. **No Spellcheck**: Spellcheck is disabled to prevent interference with code

### File Structure

```
code-storage/
├── index.html      # Main HTML structure
├── styles.css      # Styling and layout
├── script.js       # Application logic and Telegram integration
└── README.md       # This file
```

## 🎯 Use Cases

- **Quick Code Backup**: Save important code snippets for later reference
- **Code Sharing**: Share code with yourself across devices via Telegram
- **Learning**: Keep a collection of useful code examples
- **Debugging**: Save problematic code for troubleshooting
- **Portfolio**: Build a personal code snippet library

## ⚠️ Important Notes

- **Indentation**: Python users - all indentation is preserved exactly as pasted
- **Character Limit**: Telegram messages have a 4096 character limit
- **Internet Required**: Needs internet connection to send messages to Telegram
- **Bot Configuration**: Make sure to configure your bot token and chat ID before use

## 🐛 Troubleshooting

### "Please configure your Telegram bot token and chat ID"
- Make sure you've updated the `CONFIG` object in `script.js` with your actual values

### "Error saving code"
- Check that your bot token is correct
- Verify your chat ID is correct
- Make sure you've sent at least one message to your bot
- Check your internet connection

### Code formatting looks wrong in Telegram
- This shouldn't happen, but if it does, make sure you're using the latest version
- The code is sent in Markdown format with proper code block syntax

## 📝 License

This project is free to use and modify for personal and commercial purposes.

## 🤝 Contributing

Feel free to fork, modify, and improve this application!

## 💡 Tips

- Use the auto-save feature to never lose your work
- Add descriptive titles to make searching easier in Telegram
- You can search your saved codes in Telegram using the search function
- Consider creating different bots for different programming languages

---

Happy Coding! 🚀
