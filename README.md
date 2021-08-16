# DragAndDropServer
Drag and Drop server+client for machsilim automation

## Routes 
### GET /status_check
This route runs the client script and validates server status
Compares client logs to predicted logs and validates equality
Returns Status OK or specific error


### POST /upload_file
Gets PNG file and region selected
The steps are - 
1. Saving file localy
2. Tries to activate 'Encode.exe' on the file
3. Copy first.png and second.png to working folder
4. Try to zip working folder
5. Copy zip file to relevant path
In case of error the server return the error message and displays it
