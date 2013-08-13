Handles conflict detection between local and remote resources.



Whenever an item is PUT to the server from the ---
an 'IF-MATCH' header is added with the version of the
document that the --- had originally received from the server.
If there was no original document the --- does a PUT with
an 'IF-NONE-MATCH: *' header.

Failed PUTs