/** mj - a js wrapper 2 the myjson.com API 4 simple persistent data storage
 *  TODO: reject promise on xhr error!!
 *  xhr.onerror = e => reject(`xhr error ${e.message}`); ???
 *  xhr.addEventListener('error', e => reject(`xhr error ${e.message}`)); ???
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
    return new Promise((resolve, reject) => {
      var xhr;
      !obj && reject('no input!');
      xhr = new XMLHttpRequest();
      xhr.onerror = reject;
      xhr.open('POST', 'https://api.myjson.com/bins', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.addEventListener('load', function(e) {
        resolve(mj.uri = JSON.parse(this.responseText).uri);
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
    return new Promise((resolve, reject) => {
      var xhr;
      (!id || !obj) && reject('no input!');
      /https:\/\/api.myjson.com\/bins\//.test(id) ? mj.uri = id : mj.uri = `https://api.myjson.com/bins/${id}`;
      xhr = new XMLHttpRequest();
      xhr.onerror = reject;
      xhr.open('PUT', mj.uri, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.addEventListener('load', function(e) {
        resolve(mj.data = JSON.parse(this.responseText));
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
    return new Promise((resolve, reject) => {
      var urid, xhr;  // urid is used 2 extract id, then build full uri, ensuring https
      !id && reject('no input!');
      id.includes('bins/') ? urid = id.replace(/^.*bins\//, '') : urid = id;
      xhr = new XMLHttpRequest();
      xhr.onerror = reject;
      xhr.open('GET', mj.uri = `https://api.myjson.com/bins/${urid}`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.addEventListener('load', function(e) {
        resolve(mj.data = JSON.parse(this.responseText));
      });
      xhr.send();
    });
  }
};