const MQTT_TOPICS = {
  ESP01: {
    temperature: "EE2120/ESP01/temp",
    ledCommand: "EE2120/ESP01/LED/cmd",
    ledStatus: "EE2120/ESP01/LED/status",
    gps: "EE2120/ESP01/gps",
    status: "EE2120/ESP01/status"
  },
  ESP02: {
    temperature: "EE2120/ESP02/temp",
    ledCommand: "EE2120/ESP02/LED/cmd",
    ledStatus: "EE2120/ESP02/LED/status",
    gps: "EE2120/ESP02/gps",
    status: "EE2120/ESP02/status"
  }
};

export default MQTT_TOPICS;
