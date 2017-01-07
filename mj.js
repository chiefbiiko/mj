/* mj - a js wrapper to the myjson.com api 4 simple persistent data storage
only pass plain js objects 2 mj.create n mj.update..! 1st arg of mj.update n mj.get can be entire uri or just id
mj.create, mj.update, and mj.get return promises, use like:
  mj.create({tbl1: [[]]}).then(uri => console.log(uri + ' | saved uri in mj.uri'));
  mj.update(mj.uri, {tbl1: [[]], tbl2: [[]]}).then(data => console.log(data));
  mj.get('np419y').then(data => console.log(data)); */
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
      var xhr;
      (id.includes('http')) ? mj.uri = id : mj.uri = 'https://api.myjson.com/bins/' + id;
      xhr = new XMLHttpRequest();
      xhr.onerror = reject;
      xhr.open('PUT', mj.uri, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.addEventListener('load', function(e) {
        var data = JSON.parse(this.responseText);
        mj.data = data;  // mj.data is local store of ur data during a session
        resolve(data);
      });
      xhr.send(JSON.stringify(obj));
    });
  },
  get: function(id) {  // id can either be the entire uri or just ur id
    return new Promise(function(resolve, reject) {
      var urid, xhr;
      (id.includes('bins/')) ? urid = id.replace(/^.*bins\//, '') : urid = id;
      xhr = new XMLHttpRequest();
      xhr.onerror = reject;
      xhr.open('GET', 'https://api.myjson.com/bins/' + urid, true);
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