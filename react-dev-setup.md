**SMUM React Development Setup**

1. Install npm and nodejs: https://nodejs.org/en/.
2. Run command "git clone https://github.com/UnconditionedLife/smum.git".
3. Run command "git checkout react-smum"
4. Run command "npm install"
5. Run command "npm run build"
6. Run command "npm start"
7. Your application should be running at http://localhost:3000.

Notes:
1. If you get an fsevents error while running "npm install" on a Mac, you can ignore this error and proceed forward with the steps.
2. If the install continues to fail due to permissions issues, also try removing the node_modules directory (run command "rm -rf node_modules").
3. If the port 3000 is in use, open the file index.js (in the root of the repo) and edit the port number to 3001.
