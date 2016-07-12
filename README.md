# RTS
Real Time Strategy Development. A project to make a strategy game, which is played in real-time. With multiplayer support and an advanced AI computer oppent.

# Install for OS X
Install Homebrew:
http://brew.sh

    /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
Install Node.js:
https://nodejs.org/en/download/package-manager/#osx

    brew install node
Next we'll add express to our directory.
https://expressjs.com/en/starter/installing.html

Make a new directory for the app:

    mkdir RTS
    cd RTS
Then start installing express into the new directory:

    npm init
Follow the steps in the terminal, name the app 'app.js'
And finish with installing express in the directory:

    npm install express --save
You can now run the server with:

    node app.js