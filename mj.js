/**
 *  mj - a js wrapper 2 the myjson.com API 4 simple persistent data storage
 *  Examples:
 *  <code>
 *    mj.create({tbl1: [[]]}).then(uri => console.log(`${uri} : saved URI in mj.uri`));
 *    mj.update(mj.uri, {tbl1: [[]], tbl2: [[]]}).then(data => console.log(data));
 *    mj.get('np419y').then(data => console.log(data));
 *  </code>
**/
'use strict';
var mj = {
  uri: '',  // always holds the last utilized URI during a session
  data: {},  // always holds the last resolved data during a session
  /**
   *  Creates a new store
   *  @param {Object} obj Plain js object !NOT JSON!
   *  @return {Promise.<string>} URI
  **/
  create(obj) { 
    return new Promise(function(resolve, reject) {
      var xhr;
      if (!obj || !window.confirm('aint yet got a store/URI?\ncheck mj.uri or in ur download dir "mjuri.txt".\ncontinue anyways?')) {
        return reject('cancel');  // exit
      }
      xhr = new XMLHttpRequest();
      xhr.onerror = reject;
      xhr.open('POST', 'https://api.myjson.com/bins', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.addEventListener('load', function(e) {
        mj.uri = JSON.parse(this.responseText).uri;
        mj._saveUri('mjuri.txt', mj.uri);
        window.alert(`${mj.uri}\nsaved this URI.\nu will need it 2 get and update ur store.`);
        resolve(mj.uri);
      });
      xhr.send(JSON.stringify(obj));
    });
  },
  /**
   *  Updates an existing store
   *  @param {string} id Either entire URI or just an id
   *  @param {Object} obj Plain js object !NOT JSON!
   *  @return {Promise.<Object>} Plain js object
  **/
  update(id, obj) {
    return new Promise(function(resolve, reject) {
      var xhr;
      if (!id || !obj) {
        return reject('no input!');
      }
      (/https:\/\/api.myjson.com\/bins\//.test(id)) ? mj.uri = id : mj.uri = `https://api.myjson.com/bins/${id}`;
      xhr = new XMLHttpRequest();
      xhr.onerror = reject;
      xhr.open('PUT', mj.uri, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.addEventListener('load', function(e) {
        var data = JSON.parse(this.responseText);
        mj.data = data;
        resolve(data);
      });
      xhr.send(JSON.stringify(obj));
    });
  },
  /**
   *  Gets data from a store
   *  @param {string} id Either entire URI or just an id
   *  @return {Promise.<Object>} Plain js object
  **/
  get(id) {
    return new Promise(function(resolve, reject) {
      var urid, xhr;  // urid is used to always extract id, then build full uri, ensuring https
      if (!id) {
        return reject('no input!');
      }
      (id.includes('bins/')) ? urid = id.replace(/^.*bins\//, '') : urid = id;
      xhr = new XMLHttpRequest();
      xhr.onerror = reject;
      xhr.open('GET', mj.uri = `https://api.myjson.com/bins/${urid}`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.addEventListener('load', function(e) {
        var data = JSON.parse(this.responseText);
        mj.data = data;
        resolve(data);
      });
      xhr.send();
    });
  },
  /**
   *  Saves users myjson URI locally
  **/ 
  _saveUri(filename, text) {
    var blob = new Blob([text], {type: 'text/plain'});
    var a = window.document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(a.href);
  }
};