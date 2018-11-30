# UniFi-Controller-SmartThings
Connecting the UniFi Controller to SmartThings


# Setup process
Note: this is from distant memory. I'll update once I get a chance to properly test it. PRs with updates welcome

1. Install the app and device handler using the GitHub integration on graph.api.smartthings.com. Make sure to publish as well.
2. Add the SmartApp via the SmartThings Classic mobile app
  * I think you have to do something to enable OAuth? Try searching the internet for directions. I think I did this for WebCoRE or NST Manager.
3. Create a new device object for each WiFi MAC address you want to track: https://graph.api.smartthings.com/device/create
  * Name: Whatever you want; e.g. "My Phone (WiFi)"
  * Network ID: "WIFIdeadbeef" (plug in the MAC address here)
  * Type: WiFi Presence Sensor
  * Version: Published
4. Install a SmartApp instance for each WiFi MAC address
  * Select WiFi Presence Sensor (select the matching Device that you created)
  * Assign a name: e.g. "WiFi Presence (My Phone)"
  * Set for specific mode(s): Select all modes
5. Set up the node.js helper app
  * `npm install node-unifi`
  * script assumes you install in `/home/pi/unifi-presence/`
6. Set up the helper app config
  * https://graph.api.smartthings.com/location/list Click the relevant location "smartapps"
  * Find each WiFi Presence device and click on it. Save the accessToken value (this will be the `token` in the config)
  * Grab the SmartApp ID from the bottom under Developer Options: you will plug this in to the URL
  * Update all the other fields in the config and launch the helper
7. If everything is working, update the crontab
