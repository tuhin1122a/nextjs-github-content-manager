# 📌 Next.js GitHub Content Manager

A **Next.js app** that fetches Markdown files from GitHub, renders them as HTML, and provides a simple interface to create, edit, delete drafts, and publish them back to GitHub as Markdown files.

---

## 🎯 Features

- **Fetch Markdown from GitHub**  
  Retrieves a Markdown file from a public repository and renders it as sanitized HTML.

- **Draft Management**  
  - Create multiple drafts with `title` and `body`  
  - Edit or delete drafts  
  - Drafts persist across reloads

- **Publish to GitHub**  
  - Publish all drafts at once  
  - Commits Markdown files to the repository via GitHub REST API

- **Best Practices**  
  - Uses environment variables for API keys (no secrets exposed)  
  - Accessible and responsive UI with Tailwind CSS  
  - Clean, minimal UX  

---

## ⚙️ Tech Stack

- [Next.js](https://nextjs.org/) – React Framework  
- [Tailwind CSS](https://tailwindcss.com/) – Styling  
- [GitHub REST API](https://docs.github.com/en/rest) – Fetch & publish content  
- [Vercel](https://vercel.com/) – Deployment  

---

## 🚀 Getting Started

### 1️⃣ Clone the repo
```bash
git clone https://github.com/<your-username>/nextjs-github-content-manager.git
cd nextjs-github-content-manager
