const express = require('express')
const bodyParser = require('body-parser');
const path = require('path');
let cors = require('cors')
const fileUpload = require('express-fileupload');
const execF = require('child_process').execFile;
const fs = require('fs')

const HOST_NAME = 'localhost'
const GET_ROUTE = '/status_check'
const POST_ROUTE = '/upload_file'
const PORT = 7500

const app = express()
app.use(bodyParser.json());
app.use(cors())
app.use(fileUpload({
  createParentPath: true
}));

app.get('/superadmin', (req, res) => {
  res.sendFile(path.resolve(`${__dirname}/client/index.html`))
})


const connection_success = [`connection successful`, `Could not establish connection! NOT VALID`]
const login_success = [`Received - b\'M@CH{"response": 101, "data": "gportal have been logged in successfully."}M@CH\'`, 'Could not login! NOT VALID']
const dir_success = [`Received - b'M@CH{"response": 201, "data": {`, 'Could not get dir valid response! NOT VALID']
const read_text_commend = [`Running tasks readtext\r`, 'Could not readtext command! NOT VALID']
const get_file_commend = [`Running tasks getfile\r`, 'Could not getfile command! NOT VALID']
const receiving_valid_command = [`receiving...\r`, 'Could not receive valid response! NOT VALID']
const search_quesrirs = [connection_success, login_success, dir_success, read_text_commend, get_file_commend, receiving_valid_command]

app.get(GET_ROUTE, (req, res) => {
  const { spawn } = require('child_process');
  console.log("Got status check request!")
  try {
    console.log(`Asked for server status check!`);
    const pyProg = spawn('python3', ['./scripts/checkServerStatus.py']);
    pyProg.stdout.on('data', function (data) {
      let response_server_status = ''
      const response_lines = data.toString().split('\n')
      search_quesrirs.forEach(search_query => {
        if (!response_lines.includes(search_query[0])) {
          if (response_server_status == '')
            response_server_status = search_query[1]
        }
      });
      if (response_server_status == '') response_server_status = 'Status OK';
      console.log(`Server response is - '${response_server_status}'`);
      return res.send(response_server_status)
    });
    pyProg.stderr.on('data', (data) => {
      console.log('Error accured');
      response_server_status = data.toString().split(']')[1]
      return res.send(response_server_status)
    });
  } catch (err) {
    console.log(`Error accured - ${err}`)
  }
});

app.post(POST_ROUTE, async (req, res) => {
  const current_file = req.files.map_file
  const selected_region = req.body.region
  console.log(`Region selected is - ${selected_region}`)
  console.log(`Uploading file ${current_file.name}`)
  if (current_file.name.includes('png')) {
    current_file.mv('./' + 'Secret.png');
  } else {
    return res.send('File is not PNG valid')
  }
  console.log("Trying to encode")
  execF('Encode.exe', ['Secret.png'], async (err, data) => {
    if (err) {
      console.log("Encryption error - " + err)
      return res.send("ERROR - " + err)
    }
    if (data.toString() == '') {
      console.log("Encryption Success!!!");
      fs.rename('./first.png', './EncryptionDir/working/first.png', (err) => {
        if (err) return res.send("Could not move encrypted first.png")
      });
      fs.rename('./second.png', './EncryptionDir/working/secong.png', (err) => {
        if (err) return res.send("Could not move encrypted second.png")
      });
      try { fs.unlinkSync('./EncryptionDir/working/SecretCrazyRoomCenter.zip') } catch (err) { console.log("Cannot unlink center.zip") }
      try { fs.unlinkSync('./EncryptionDir/working/SecretCrazyRoomNorth.zip') } catch (err) { console.log("Cannot unlink north.zip") }
      try { fs.unlinkSync('./EncryptionDir/working/SecretCrazyRoomSouth.zip') } catch (err) { console.log("Cannot unlink south.zip") }
      console.log("Files crop Success!");
      console.log("Zipping...");

      const zipdir = require('zip-dir');
      const buffer = await zipdir('./EncryptionDir/working');
      zipdir('./EncryptionDir/working',
        { saveTo: `./EncryptionDir/working/SecretCrazyRoom${selected_region}.zip` },
        function (err, buffer) {
          console.log('Zipping success!')
          return res.send('Status OK')
        });
    } else {
      return res.send('Encryption failed!')

    }
  });
  // Run python script

});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`listening at http://${HOST_NAME}:${PORT}`)
});
