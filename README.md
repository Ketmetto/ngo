# Fursa

Free courses, training, internships and scholarships for students in Lebanon.

## Run in VS Code
1. Install Node.js (LTS) from https://nodejs.org
2. Unzip this folder and open it: File > Open Folder
3. Open the terminal (Ctrl + `) and run:

    npm install
    npm run dev

4. Open the link it prints (usually http://localhost:5173)

## Files
- src/App.jsx   the whole app: sample listings, translations, styles, pages
- src/main.jsx  mounts the app
- index.html    page shell and font

## Notes
- Edit the sample listings at the top of src/App.jsx.
- Sign-in is a browser-only demo. Real accounts, Google sign-in and password reset need a backend.
- Build for hosting: npm run build (output in dist/)
