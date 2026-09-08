export default {
  MQTTBroker: process.env.MQTTBroker,
  // Retained by default: MQTT discovery configs (and states) must survive
  // broker/HA restarts, otherwise entities go "unavailable" until their
  // underlying data next changes. Opt out with RetainMessages=false.
  RetainMessages: process.env.RetainMessages !== "false",
  MQTTBaseTopic: process.env.MQTTBaseTopic,
  MQTTRefreshRate: process.env.MQTTRefreshRate
    ? parseInt(process.env.MQTTRefreshRate)
    : 60,
  MQTTCacheTime: process.env.MQTTCacheTime
    ? parseInt(process.env.MQTTCacheTime)
    : 60,
  KeyStorage: process.env.KeyStorage || "secure",

  MQTTConnection: {
    username: process.env.MQTTUser, // MQTT username
    password: process.env.MQTTPass, // MQTT password
    port: process.env.MQTTPort, // MQTT port
    host: process.env.MQTTBroker, // MQTT broker host
    rejectUnauthorized: process.env.MQTTSelfSigned !== "true", // Determine if self-signed certificates are rejected
    secure: process.env.MQTTSecure === "true"
  }
};
