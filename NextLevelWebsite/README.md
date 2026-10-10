# Next Level Gaming & Esports Arena

A static, multi-page website for **Next Level Gaming & Esports Arena**. It introduces the arena, presents example gaming and event packages, and lets visitors build a non-binding starting-price estimate.

## Website contents

- **Home (`index.html`)** — Arena introduction, ways to play, and links to packages and enquiries.
- **About (`about.html`)** — The arena concept and experiences for friends and families, schools and clubs, work teams, and competitive gamers.
- **Courses (`courses.html`)** — Example package listings with search and category filters.
- **Cart (`cart.html`)** — A package estimate where visitors can review selections and adjust quantities. Cart data is kept in browser storage when available.
- **Contact (`contact.html`)** — An enquiry form interface for collecting draft details.
- **Style (`style.html`)** — Brand colors and visual identity guidance.
- **`assets/`** — Shared stylesheet, JavaScript, package data, and brand artwork used by the pages.

## Run in Visual Studio Code

This project is built with plain HTML, CSS, and JavaScript. **Node.js and `npm install` are not required.**

1. Open Visual Studio Code.
2. Select **File → Open Folder…** and choose the project folder.
3. In the Extensions view, install **Live Server** (by Ritwick Dey) if it is not already installed.
4. In the Explorer, right-click `index.html` and select **Open with Live Server**. Alternatively, open `index.html` and click **Go Live** in the status bar.
5. The site opens in your browser. Use the site navigation to visit the other pages. Live Server refreshes the browser when you save changes.

You can also open `index.html` directly in a browser for a basic preview, but serving the folder with Live Server is recommended while developing.

## Important notes

- Package prices are illustrative starting prices in South African rand; the arena must confirm final prices, inclusions, and availability.
- The cart is an estimate only. It does not reserve a session or take payment.
- The contact form is a front-end demonstration and is not connected to an email or form-submission service, so submitting it does not send an enquiry.
