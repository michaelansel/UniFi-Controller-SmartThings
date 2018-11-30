const fs = require('fs');
const config = JSON.parse(fs.readFileSync('config.json'));

const UNIFI_HOST = config.unifi.host;
const UNIFI_USER = config.unifi.user;
const UNIFI_PASS = config.unifi.pass;
const SITE = config.unifi.site;
const BOUNCE_DELAY = config.unifi.bounce_delay;
// poll UniFi controller every minute for client state
const POLL_UNIFI_INTERVAL = config.unifi.poll_interval*1000;
// push an update to ST every XX seconds, even if state hasn't changed
const FORCE_UPDATE_SMARTTHINGS_INTERVAL = config.smartthings.update_interval*1000;
const DEVICE_MAP = config.devices;

const unifi = require('node-unifi');
const controller = new unifi.Controller(UNIFI_HOST, 8443);

function watchController(err) {
  if(err) {
    console.log('ERROR: ' + err);
    return;
  }

  let errCounter = 0;
  const handleClientDevice = function(err, client_data) {
    if(err) {
      console.log('ERROR: ' + err);
      errCounter = errCounter + 1;
      if ( errCounter > 5 ) {
        process.exit(1);
      } else {
        clearInterval(poller);
        controller.login(UNIFI_USER, UNIFI_PASS, watchController);
        return;
      }
    }
    errCounter = 0;

    try {
      const last_seen_ago = Date.now()/1000 - client_data[0][0].last_seen;
      console.log(client_data[0][0].mac, Math.ceil(last_seen_ago / 60), "minute(s) ago");
      if (last_seen_ago > BOUNCE_DELAY) {
        updateSmartThings(client_data[0][0].mac, 'away');
      } else {
        updateSmartThings(client_data[0][0].mac, 'home');
      }
    } catch (exception) {
      console.log("something broke...", exception);
    }
  }

  const pollClientDevices = function() {
    for (const mac in DEVICE_MAP) {
      controller.getClientDevice(SITE, handleClientDevice, mac);
    }
  }

  const poller = setInterval(pollClientDevices, POLL_UNIFI_INTERVAL);
  pollClientDevices();
}

controller.login(UNIFI_USER, UNIFI_PASS, watchController);



const request = require('request');

let stateCache = {};

function updateSmartThings(mac, state) {
  console.log(mac, state);
  if (
    // Cache is populated
    stateCache.hasOwnProperty(mac) &&
    (
      // Pushed a state update within the last XX minutes
      (stateCache[mac].lastUpdate - Date.now()) < FORCE_UPDATE_SMARTTHINGS_INTERVAL &&
      // The value hasn't changed
      (stateCache[mac].value == state)
    )
  ) {
    // No need to contact SmartThings
    return;
  }

  request.post(DEVICE_MAP[mac].url + state, {'auth': {'bearer': DEVICE_MAP[mac].token}}).on('response', function(response) {
    console.log(mac, state, 'http response');
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    if (response && response.statusCode >= 200 && response.statusCode < 300) {
      stateCache[mac] = {
        lastUpdate: Date.now(),
        value: state,
      };
      console.log('stateCache['+mac+']: ', JSON.stringify(stateCache[mac]));
    }
  });
}
