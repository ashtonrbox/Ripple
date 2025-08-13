<div align="center">
  <img height="280" alt="Ripple logo" src="https://github.com/user-attachments/assets/ae96c6da-5811-40bd-b793-41c3608a876a" />
  <h1>Ripple</h1>
</div>

Ripple is an AI-powered journaling app that transforms your words into a tile with a unique colour palette reflecting your emotions.  
No two days look the same — each page becomes a piece of art and a visual time capsule of your moods and moments.

---

## 📸 Showcase

<div align="center">
  <img height="280" alt="Ripple app screenshot" src="https://github.com/user-attachments/assets/c7eedeb7-9440-48d7-9774-f810e72481e7" />
</div>

Add a new entry every day by clicking the plus button.  
You can also search entries using <kbd>Command</kbd> + <kbd>F</kbd>.

---

## ⚙️ Installation

> **Note:** You’ll need an API key from [Google AI Studio](https://aistudio.google.com/apikey).  
> Use of the Gemini API from a billing-enabled project is subject to pay-as-you-go pricing.

1. **Clone the repository**
   ```bash
   git clone https://github.com/username/ripple.git
   cd ripple
2. **Create pnode.js**
   Add the following code:
   
   ```javascript
   export async function call(message) {
    const API_KEY = "API_KEY_HERE"
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const body = {
        contents: [{ parts: [{ text: message }] }],
    };

    const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text
   }
   ```

3. **Replace "API_KEY_HERE" with your actual API key**
4. **Install dependencies**
   ```bash
   npm install
   ```
5. **Build the app**
   ```bash
   npm run build
   ```
