metadata {
	definition (name: "WiFi Presence Sensor", namespace: "michaelansel", author: "Michael Ansel") {
		capability "Presence Sensor"
		capability "Actuator"
		capability "Sensor"
		command "arrived"
		command "departed"
	}

	simulator {
		status "present": "presence: present"
		status "not present": "presence: not present"
	}

	tiles {
		standardTile("presence", "device.presence", width: 2, height: 2, canChangeBackground: true) {
			state("present", labelIcon:"st.presence.tile.mobile-present", backgroundColor:"#53a7c0")
			state("not present", labelIcon:"st.presence.tile.mobile-not-present", backgroundColor:"#ffffff")
		}
		main "presence"
		details "presence"
	}
}

// Only used for the simulator
def parse(String description) {
	def pair = description.split(":")
	createEvent(name: pair[0].trim(), value: pair[1].trim())
}

// handle commands
def arrived() {
	log.trace "Executing 'Arrived'"
	sendEvent(name: "presence", value: "present")
}


def departed() {
	log.trace "Executing 'Departed'"
	sendEvent(name: "presence", value: "not present")
}