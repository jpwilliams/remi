* Start a RabbitMQ server (RMQ).
* Start a MongoDB server called DB.
* Start a DO server called Master.
* Start a DO server called Slave.
* On Master, do `npm i -g remi`.
* On Slave, do `npm i -g remi`.
* On Master, do `REMI_AMQ=rmq_address REMI_DB=db_address remi server`.
* Detects first time using Remi on Master, so generates a small config in ~/.remi/config.json with a UUID in it giving the server a unique ID.
* Starts a Server instance using `pm2` which connects to RMQ and DB.
* Server emits that it's joined the Server cluster to RMQ.
* Server retrieves GIT keys from the database if they exist.
* Server finds that no GIT keys exist.
* On Master, do `remi git`.
* Server detects that there is currently no git key for this cluster, so automatically creates a new SSH key in ~/.remi/key and saves it into the database.
* On GitHub (or similar), add this new SSH key to the allowed users list for particular repos.
* On Slave, do `REMI_AMQ=rmq_address REMI_TAGS=app remi client`. `app` here represents a single tag. `REMI_TAGS` is a comma-separated list of tags for this Slave.
* Detects first time using Remi on Slave, so generates a small config in ~/.remi/config.json with a UUID in it giving the client a unique ID and any tags given into the tags array for this Slave.
* Starts a Client instance using `pm2` which listens for commands from ~/.remi/sock to perform actions.
* Client requests `remi.register` with the tags and UUID.
* Master responds to Client's request with success and logs the client in the database.
* Client requests `remi.keys` with its UUID.
* Master responds to Client's request with the previously-added key.
* Client stores this in memory.
* On Master, do `remi deploy`.
* Master prompts user for an application name. User specifies "website".
* Master cannot find any conflicting app names, so then asks for a GIT url. User specifies one.
* Master tries a basic HEAD request on the given GIT url. The request succeeds, so it does not exit.
* Master prompts user for tags required for app working. This list is a checkbox list and is generated via querying the database. Gives server numbers. User chooses "app".
* Master prompts user for environment variables needed when running this app. User (somehow) specifies RABBITMQ or something. Hardcode for now?
* Master prompts user for how many services should be running initially. Defaults to 1. User chooses 1.
* Master retrieves server listings from the database matching the tags specified and pulls out the server that has the smallest usage (cpu + mem). This server has the ID 12345.
* Master emits `remi.deploy` with an object of key(servers that need to listen) and value(the scale), the GIT url, app name and environment variables.
* Slave hears `remi.deploy`, checks that its ID is in the array given and proceeds to create a new `pm2` service with that name.
* Once new process is up and deployed, Slave sends a request to Master informing it that the app name is up with a scale of 1.
* Master finally ends CLI session informing the user that it has been deployed.
* On Master, do `remi scale website 2`.
* Master retrieves server listings from the database matching the tags specified for `website`. It must take into account which servers are already running `website`. In this case, however, we only have one server and the listing only has one result, so Master emits `remi.deploy` with a list of servers that need to listen, the GIT url, app name, new scale and environment variables.
* Slave hears `remi.deploy`, checks that its ID is in the array given and checks whether it's currently running the app specified. It is, so it performs `pm2 scale` and uses the number provided in the args obj.
* Once everything is successfully scaled, Slave sends a request to Master informing it that the app name is up with a scale of 2.