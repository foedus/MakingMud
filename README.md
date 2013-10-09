MakingMud
=========
Game Development Site: https://sites.google.com/a/makingmud.com/mechanics/

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
Implement proper scrolling in game client.
Create db admin system to edit users and rooms.
Created Monster Model.
Created basic combat system.
Created login/password/authentication.
Created basic character creator.
Spruce up combat.

To Do:

Look for a Mongo GUI like RockMongo.
Update db admin to include new room fields and monster [Andrew]
Use RegEx to abbreviate commands.[STU]
Implement gameloop in GameMaster to spawn Monsters + random Events. 
Spawn monster objects. [STU]
Experience verbs - look, who, search...
Complete logout system (logout on command prompt; logout due to inactivity, logout due to "fatal error", etc.)
Implement death.
Figure out removing and adding rooms and users to GameMaster dynamically.
Implement inventory, items, and treasure.
Implement magic system.
Move all command parsing into game engine, take out of game client.
Implement class/profession.
Implement EXP.
Make more rooms.
Come up with a plot.
Update RoomTalk/UserTalk/WorldTalk to one function.
Implement in-game GMs.
Give rooms and users friendly Ids.
Implement non-direction exits.
Handle text input on phone.


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

