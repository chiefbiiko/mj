/* mj - a js wrapper to the myjson.com api 4 simple persistent data storage
only pass plain js objects to mj.create and mj.update..! 
mj.create, mj.update, and mj.get return promises, use like: 
  mj.get("np94z").then(data => console.log(data)).catch(() => console.log('error'));
   */
'use strict';
var mj = {
  downloadR: function(filename, text) {  // helpr that saves users myjson uri locally
    var blob = new Blob([text], {type: 'text/plain'});
    if (window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, filename);
    } else {
      let a = window.document.createElement('a');
      a.href = window.URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(a.href);
    }
  },
  create: function(obj) {  // obj must be plain js object!
    return new Promise(function(resolve, reject) {
      var xhr;
      if (!window.confirm('aint yet got a store/uri? check mj.uri or in ur download dir "mj_uri.txt" for an existing uri. continue anyways?')) {
        return reject();  // exit on cancel
      }
      xhr = new XMLHttpRequest();
      xhr.onerror = reject;
      xhr.open('POST', 'https://api.myjson.com/bins', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.addEventListener('load', function(e) {
        mj.uri = JSON.parse(this.responseText).uri;  // mj.uri always holds the last utilized uri during a session
        mj.downloadR('mj_uri.txt', mj.uri);
        window.alert(mj.uri + ' | saved this uri. u will need the id after "bins/" 2 get and update your json.');
        resolve(mj.uri);
      });
      xhr.send(JSON.stringify(obj));
    });
  },
  update: function(id, obj) {  // id can either be the entire uri or just ur id  // obj must b plain js object!
    return new Promise(function(resolve, reject) {
      var uri, xhr;
      (id.includes('https:')) ? uri = id : uri = 'https://api.myjson.com/bins/' + id;
      mj.uri = uri.replace(/^.*bins\//, '');
      xhr = new XMLHttpRequest();
      xhr.onerror = reject;
      xhr.open('PUT', uri, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.addEventListener('load', function(e) {
        var data = JSON.parse(this.responseText);
        console.log(data);
        mj.data = data;  // mj.data is local store of ur data during a session
        resolve(data);
      });
      xhr.send(JSON.stringify(obj));
    });
  },
  get: function(id) {  // id can either be the entire uri or just ur id
    return new Promise(function(resolve, reject) {
      var xhr;
      (id.includes('bins/')) ? mj.id = id.replace(/^.*bins\//, '') : mj.id = id;
      xhr = new XMLHttpRequest();
      xhr.onerror = reject;
      xhr.open('GET', 'https://api.myjson.com/bins/' + mj.id, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.addEventListener('load', function(e) {
        var data = JSON.parse(this.responseText);
        mj.data = data;
        resolve(data);
      });
      xhr.send();
    });
  }
};