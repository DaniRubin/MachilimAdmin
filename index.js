const express = require('express')
const bodyParser = require('body-parser');
const path = require('path');
let cors = require('cors')
const fileUpload = require('express-fileupload');
const execF = require('child_process').execFile;
const fs = require('fs')

const HOST_NAME = 'localhost'
const GET_ROUTE = '/status_check'
const POST_ROUTE = '/upload-file'
const PORT = 5555

const app = express()
app.use(bodyParser.json());
app.use(cors())
app.use(fileUpload({
  createParentPath: true
}));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(`${__dirname}/client/index.html`))
})


const connection_success = [`connection successful\r`, `Could not establish connection! NOT VALID`]
const login_success = [`Received - b\'M@CH{"response": 101, "data": "gportal have been logged in successfully."}M@CH\'\r`, 'Could not login! NOT VALID']
const dir_success = [`Received - b'M@CH{"response": 201, "data": {"2254133.log": 2598, "340.pdf": 43578, "341.pdf": 43004, "355.pdf": 57727, "356.pdf": 45002, "42takziv2004.xlsx.001": 22528, "42takziv2004.xlsx.002": 22528, "42takziv2004.xlsx.003": 7030, "hoze.pdf": 46376, "ONLY_FOR_MACHSHILIM.txt": 54, "presentation.pptx": 991273, "SecretCrazyRoomCenter.zip": 129699, "SecretCrazyRoomNorth.zip": 129722, "SecretCrazyRoomSouth.zip": 129723, "TOPSECRET.txt": 8, "very_important.txt": 89}}M@CH'\r`, 'Could not get dir valid response! NOT VALID']
const read_text_commend = [`Running tasks readtext\r`, 'Could not readtext command! NOT VALID']
const get_file_commend = [`Running tasks getfile\r`, 'Could not getfile command! NOT VALID']
const receiving_valid_command = [`receiving...\r`, 'Could not receive valid response! NOT VALID']
const search_quesrirs = [connection_success, login_success, dir_success, read_text_commend, get_file_commend, receiving_valid_command]

let checking_counter = 0
app.get(GET_ROUTE, (req, res) => {
  const { spawn } = require('child_process');

  try {
    console.log(`Asked for server status check!`);
    const pyProg = spawn('python3', ['./scripts/checkServerStatus.py']);
    pyProg.stdout.on('data', function (data) {
      const response_lines = data.toString().split('\n')
      let response_server_status = ''
      search_quesrirs.forEach(search_query => {
        if (!response_lines.includes(search_query[0])) {
          if (response_server_status == '')
            response_server_status = search_query[1]
        }
      });

      if (response_server_status == '') response_server_status = 'Status OK';
      console.log(`Server response is - '${response_server_status}'`);
      res.send(response_server_status)
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

app.listen(PORT, () => {
  console.log(`listening at http://${HOST_NAME}:${PORT}`)
});
