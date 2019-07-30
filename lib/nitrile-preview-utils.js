'use babel';

const fs = require('fs');

module.exports = { 
 
  async readImageFileAsync (filename) {

    /// Returns a Promise that resolves to a NodeJs Buffer() 
    
    /// NOTE: that the 'fs' method returns a new Buffer object
    /// and the 'Buffer#toString' method offers a way to 
    /// return a base64-encoded string.

    return new Promise((resolve, reject)=>{
        fs.readFile(filename, null, function(err, data) {
                if (err) {
                  reject(err.toString());
                } else {
                  resolve(data);///TODO: harded coded to PNG, this needs to be changed to accound for other image file types
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
  }

}

