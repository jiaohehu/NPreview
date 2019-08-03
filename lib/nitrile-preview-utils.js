'use babel';

const fs = require('fs');

module.exports = { 
 
  async readImageFileAsync (filename) {

    /// Returns a Promise that resolves to a NodeJs Buffer() and a mime-type pair
    /// ... [imgbuf,mime]
    
    /// NOTE: that the 'fs' method returns a new Buffer object
    /// and the 'Buffer#toString' method offers a way to 
    /// return a base64-encoded string.

    return new Promise((resolve, reject)=>{
        fs.readFile(filename, null, function(err, imgbuf) {
                if (err) {
                  reject(err.toString());
                } else {
                  let signature = imgbuf.toString('hex',0,4).toUpperCase();
                  var mime;
                  switch (signature) {
                      case '89504E47':
                          mime = 'image/png'
                          break;
                      case '47494638':
                          mime = 'image/gif'
                          break;
                      case '25504446':
                          mime = 'application/pdf'
                          break;
                      case 'FFD8FFDB':
                      case 'FFD8FFE0':
                      case 'FFD8FFE1':
                          mime = 'image/jpeg'
                          break;
                      case '504B0304':
                          mime = 'application/zip'
                          break;
                      default:
                          mime = 'unknown'
                          break;
                  }
///console.log( `signature type: ${signature}`);
///console.log( `mime type: ${mime}`);
                  resolve([imgbuf,mime]);///TODO: harded coded to PNG, this needs to be changed to accound for other image file types
                }
        });
    });
  },

  async readFileAsync (filename) {

    /// Returns a Promise that resolves to a string of
    /// the entire file content being read

    return new Promise((resolve, reject)=>{
        fs.readFile(filename, "utf8", function(err, data) {
                if (err) {
                  reject(err.toString());
                } else {
                  resolve(data.toString());
                }
        });
    });
  },

  async writeFileAsync (filename, data) {

    /// Returns a Promise that resolves to a string of
    /// the entire file content being read

    return new Promise((resolve, reject)=>{
        fs.writeFile(filename, data, 'utf8', function(err) {
                if (err) {
                  reject(err.toString());
                } else {
                  resolve(filename);
                }
        });
    });

  },

  getMinetypeFromSignature (signature) {

    switch (signature) {
        case '89504E47':
            return 'image/png'
        case '47494638':
            return 'image/gif'
        case '25504446':
            return 'application/pdf'
        case 'FFD8FFDB':
        case 'FFD8FFE0':
        case 'FFD8FFE1':
            return 'image/jpeg'
        case '504B0304':
            return 'application/zip'
        default:
            return 'unknown'
    }
  }

}

