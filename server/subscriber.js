const mqtt = require("mqtt");
const { insert } = require("./db");
const { getUniqueWeight } = require("./weightMapping");

const brokerUrl = "mqtt://localhost:1883";
const client = mqtt.connect(brokerUrl);
const connectedTables = new Set();
const lastOnlineTimestamps = {}; // { table_id: timestamp }

client.on("connect", () => {
  console.log("✅ Connected to MQTT broker");
  client.subscribe("table/+/status");
  client.subscribe("table/+/data", (err) => {
    if (err) {
      console.error("❌ Failed to subscribe:", err);
    } else {
      console.log("📡 Subscribed to topic: table/+/data");
    }
  });
});

client.on("message", (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    const [, table_id, topicType] = topic.split("/"); // topicType will be 'data' or 'status'
    const currentWeight = parseFloat(data.weight);

    // Respond to ESP32 unit weight request
    if (data.remarks === "request_unit_weight") {
      const uniqueWeight = getUniqueWeight(data.job_id, data.process_id);
      const publishTopic = `table/${table_id}/command`;
      let publishMsg;
      if (uniqueWeight !== null) {
        publishMsg = JSON.stringify({ msg: uniqueWeight.toString() });
        console.log(
          `📦 Sent unit weight (${uniqueWeight}) to table ${table_id}`
        );
      } else {
        publishMsg = JSON.stringify({ msg: "Ineligible weight" });
        console.log(
          `⚠️ No mapping found for job ${data.job_id}, process ${data.process_id}. Sent 'Ineligible weight' to table ${table_id}`
        );
      }
      client.publish(publishTopic, publishMsg);
      return;
    }

    // Track online status
    if (topicType === "status") {
      if (data.status === "online") {
        connectedTables.add(table_id);
        lastOnlineTimestamps[table_id] = Date.now();
      }
      // Do NOT insert status messages into the database!
      return;
    }

    // Only insert if topic is 'data'
    if (topicType === "data") {
      console.log(
        `📥 Table ${table_id} | Job: ${data.job_id}, Process: ${data.process_id}, Wt: ${currentWeight}, Count: ${data.product_count}, Job Status: ${data.job_status}`
      );
      insert({
        table_id,
        job_id: data.job_id || "",
        process_id: data.process_id || "",
        weight: currentWeight,
        count: parseInt(data.product_count) || 0,
        job_status: data.job_status || 0,
      });
      console.log(`✅ Data inserted for table ${table_id}`);
    }
  } catch (err) {
    console.error("❌ Failed to handle MQTT message:", err.message);
  }
});

// Periodically check for offline machines
setInterval(() => {
  const now = Date.now();
  for (const table_id of Object.keys(lastOnlineTimestamps)) {
    if (now - lastOnlineTimestamps[table_id] > 5000) {
      connectedTables.delete(table_id);
    }
  }
}, 500);

client.on("error", (err) => {
  console.error("❌ MQTT Error:", err);
});

module.exports.getConnectedTables = () => Array.from(connectedTables);
