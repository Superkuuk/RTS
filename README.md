# RTS
Real Time Strategy Development. A project to make a strategy game, which is played in real-time. With multiplayer support and an advanced AI computer oppent.

# Install for OS X
Install Homebrew:
http://brew.sh

    /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
Install Node.js via brew:
https://nodejs.org/en/download/package-manager/#osx

    brew install node
Or install Node.js via it's package. Which is easier.    
    
Next we'll add express to our directory.
https://expressjs.com/en/starter/installing.html

Make a new directory for the app:

    mkdir RTS
    cd RTS
Then start installing express into the new directory:

    npm init
Follow the steps in the terminal...
And finish with installing express in the directory:

    npm install express --save
Install Socket.io

    npm install socket.io