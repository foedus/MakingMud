MakingMud
=========

Completed so far: 
Built a Room object.
Built a user object.
Built movement verbs.
Enable talking with "'"
Set focus on input text field in client.
Enable movement in all directions.
Gracefully handle invalid commands.

To Do:
Create admin system for db management.
Use RegEx to abbreviate commands.
Implement gameloop - setInterval.
Create a monster object.
Fill out the user object with stats.
Combat system.
Proper login page/prompt.
Character creation system.
Experience verbs - look, who, search...
Flesh out full room display with who, exits...

Enabling talking to room

Things to ask:

A using self = this.
** consider prototyping for all functions for objects, unless you don't want variable to leak

A How can the client know who the user is (right now only the game server knows [for chat])

Game state!!!
The whole question of sockets/players/things on the socket
Best way to persist data across the app? On socket?

socket chatting, best way to serialize

What is a map and how do you scale the commands properly

node design patterns -- all these callbacks/parallel/series/waterfalls/async etc.

why do we have to use socket.send twice --> scope issue?

running a gameloop

** MONGOOSE **
ORM -- define what a room is, define the parameters.
In the game server, you tell mongoose you need to connect and all the other files can just use that connection. It will help denest some of those callbacks in User and Room.

Gameloop:

	User stuff -->
	Health regenerates
	Mana regenerates
	Experience absorbs
	* As soon as user becomes active, has it's own interval
	* As soon as everything maxes out, can clear interval since it won't do anything at that point which saves processing

	Room stuff -->
	Monsters appear
	Item appears
	Items decay
	Monsters move
	NPCs move
	NPCs do stuff
	Events happen (weather, atmospherics, random fluff)

	Both -->
	Dead bodies decay

Event based stuff:
Attacks change health
Spells change mana
Kills change experience
NPCs are interacted with
Environment is interacted
Players kill monsters
Players search monsters

