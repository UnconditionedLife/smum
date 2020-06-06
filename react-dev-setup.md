**SMUM React Development Setup**

1. Install npm and nodejs: https://nodejs.org/en/.
2. Run command "git clone https://github.com/UnconditionedLife/smum.git". Run this command in the directory you want SMUM files to reside in.
3. Run command "git checkout react-smum". This fetches the react dev code that we currently have.
4. Run command "npm install". Here npm (our package management system) reads the file "package.json" and fetches all dependencies that our code has. This is very similar to a system like maven in Java or pip in Python.
5. Run command "npm run build". This packages our react code into static HTML, which we then include in our main index.html file. After making a code change, to see it populate, you need to run this command.
6. Run command "npm start". This starts an express server, with the source for the server start in index.js.
7. Your application should be running at http://localhost:3000.

Notes:
1. If you get an fsevents error while running "npm install" on a Mac, you can ignore this error and proceed forward with the steps.
2. If the install continues to fail due to permissions issues, also try removing the node_modules directory (run command "rm -rf node_modules").
3. If the port 3000 is in use, open the file index.js (in the root of the repo) and edit the port number to 3001.
