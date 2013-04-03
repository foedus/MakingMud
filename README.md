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
Flesh out full room display with who, exits...
Enabling talking to room
Converted to Mongoose
Create admin system for room mapping.
Fill out the user object with stats.

To Do:
Lock for a Mongo GUI like RockMongo.
Implement proper scrolling in game client.
Create db admin system to edit users and rooms.
Use RegEx to abbreviate commands.
Implement gameloop - setInterval.
Create a monster object.
Combat system.
Proper login page/prompt.
Character creation system.
Experience verbs - look, who, search...
Complete logout system (logout on command prompt; logout due to inactivity, logout due to "fatal error", etc.)

Things to ask:

1. Why isn't socket obj showing on user when you print user even though you can see it when logging user.socket?

2. What is a map and how do you scale the commands properly

3. Running a gameloop?

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

