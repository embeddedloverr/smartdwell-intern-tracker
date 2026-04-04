/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv").config({ path: ".env.local" });

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/smartdwell_tracker";

const TaskSchema = new mongoose.Schema({
  phase: Number,
  week: Number,
  weekTitle: String,
  taskNumber: Number,
  title: String,
  description: String,
  selfCheck: String,
});

TaskSchema.index({ phase: 1, week: 1, taskNumber: 1 }, { unique: true });

const Task = mongoose.models.Task || mongoose.model("Task", TaskSchema);

const TASKS = [
  // Phase 1 - Week 1
  { phase: 1, week: 1, weekTitle: "Electronics basics & safety", taskNumber: 1, title: "Ohm's Law experiment", description: "Ohm's Law experiment with 9V battery + resistor + LED, measure voltage and log it.", selfCheck: "Can you calculate current using V=IR for your circuit?" },
  { phase: 1, week: 1, weekTitle: "Electronics basics & safety", taskNumber: 2, title: "Identify PCB components", description: "Identify components on a PCB — resistors, capacitors, relays, terminal blocks, fuses, write each component name and function.", selfCheck: "Can you name and explain the function of at least 5 PCB components?" },
  { phase: 1, week: 1, weekTitle: "Electronics basics & safety", taskNumber: 3, title: "Multimeter practice", description: "Multimeter practice — measure continuity, DC voltage of USB charger, resistance of 3 resistors, record readings.", selfCheck: "Can you correctly set the multimeter for continuity, voltage, and resistance modes?" },
  { phase: 1, week: 1, weekTitle: "Electronics basics & safety", taskNumber: 4, title: "Lab safety checklist", description: "Read and sign Smartdwell lab safety checklist.", selfCheck: "Can you list the top 5 safety rules in the lab?" },
  { phase: 1, week: 1, weekTitle: "Electronics basics & safety", taskNumber: 5, title: "Organise component drawer", description: "Organise one component drawer, label compartments, photograph before/after.", selfCheck: "Is every compartment labelled and photographed?" },
  // Phase 1 - Week 2
  { phase: 1, week: 2, weekTitle: "Wiring diagrams & soldering", taskNumber: 1, title: "Trace relay panel wiring", description: "Trace all wires on Smartdwell relay panel diagram and mark on paper.", selfCheck: "Can you explain the path of each wire from source to destination?" },
  { phase: 1, week: 2, weekTitle: "Wiring diagrams & soldering", taskNumber: 2, title: "Wire colour convention chart", description: "Write wire colour convention chart — Red=+ve, Black=-ve/GND, Green/Yellow=Earth, Blue=Neutral.", selfCheck: "Can you identify wire function by colour in any Indian wiring setup?" },
  { phase: 1, week: 2, weekTitle: "Wiring diagrams & soldering", taskNumber: 3, title: "Solder header pins", description: "Solder 5 header pins on prototype board, mentor checks joint quality.", selfCheck: "Are all solder joints shiny, conical, and free of cold joints?" },
  { phase: 1, week: 2, weekTitle: "Wiring diagrams & soldering", taskNumber: 4, title: "Wire terminal block", description: "Wire 4-terminal block, tighten screws, pull-test each wire.", selfCheck: "Does every wire pass the pull test without coming loose?" },
  { phase: 1, week: 2, weekTitle: "Wiring diagrams & soldering", taskNumber: 5, title: "Hand-draw relay circuit", description: "Hand-draw circuit: 12V→fuse→relay coil→transistor→ESP32 GPIO with labels.", selfCheck: "Can you explain the role of each component in your circuit drawing?" },
  // Phase 1 - Week 3
  { phase: 1, week: 3, weekTitle: "Computer & documentation basics", taskNumber: 1, title: "Terminal basics", description: "Terminal basics — run dir/ls, mkdir, cd, copy/cp, create SDW_Training folder.", selfCheck: "Can you navigate to any folder and create/copy files using only the terminal?" },
  { phase: 1, week: 3, weekTitle: "Computer & documentation basics", taskNumber: 2, title: "Create Google Sheet log", description: "Create Google Sheet log with columns Date, Task, Component, Result, Issue — enter last 5 days.", selfCheck: "Is your log sheet up to date with all columns filled for each day?" },
  { phase: 1, week: 3, weekTitle: "Computer & documentation basics", taskNumber: 3, title: "File naming convention", description: "Rename 10 files using SDW_[ProjectCode]_[DocType]_[Date].pdf convention.", selfCheck: "Do all 10 files follow the exact naming convention?" },
  { phase: 1, week: 3, weekTitle: "Computer & documentation basics", taskNumber: 4, title: "Annotate wiring photo", description: "Photograph wired relay board and annotate in Photos/Paint with component labels.", selfCheck: "Can someone unfamiliar identify every component from your annotations?" },
  { phase: 1, week: 3, weekTitle: "Computer & documentation basics", taskNumber: 5, title: "Fill training log sheet", description: "Fill complete Side A and Side B of training log sheet for today.", selfCheck: "Are both sides of the log sheet complete with no blank fields?" },
  // Phase 2 - Week 4
  { phase: 2, week: 4, weekTitle: "ESP32 first steps", taskNumber: 1, title: "Install Arduino IDE & ESP32", description: "Install Arduino IDE 2.x, add ESP32 board manager URL, install Espressif package, select correct board.", selfCheck: "Can you select the correct ESP32 board and port in Arduino IDE?" },
  { phase: 2, week: 4, weekTitle: "ESP32 first steps", taskNumber: 2, title: "Blink example variations", description: "Upload Blink example, change delay to 200ms/500ms/1000ms, observe and explain setup()/loop().", selfCheck: "Can you explain what setup() and loop() do and how delay affects blink rate?" },
  { phase: 2, week: 4, weekTitle: "ESP32 first steps", taskNumber: 3, title: "External LED control", description: "Wire external LED + 330 ohm resistor to GPIO2, write code: ON 1s OFF 3s, upload and verify.", selfCheck: "Does your LED turn ON for 1 second and OFF for 3 seconds consistently?" },
  { phase: 2, week: 4, weekTitle: "ESP32 first steps", taskNumber: 4, title: "Push button input", description: "Wire push button to GPIO4 with 10k pull-up, read state, print PRESSED/RELEASED on Serial Monitor at 115200 baud.", selfCheck: "Does Serial Monitor show correct PRESSED/RELEASED states with no bouncing?" },
  { phase: 2, week: 4, weekTitle: "ESP32 first steps", taskNumber: 5, title: "Serial Monitor debugging", description: "Add Serial.println() at 5 points in blink code, open Serial Monitor, explain each output line.", selfCheck: "Can you explain what each Serial.println() output means in context of program flow?" },
  // Phase 2 - Week 5
  { phase: 2, week: 5, weekTitle: "Sensors — I2C & 1-Wire", taskNumber: 1, title: "I2C bus diagram", description: "Draw I2C bus diagram — SDA, SCL, multiple devices, unique addresses — explain to mentor.", selfCheck: "Can you explain how multiple devices share the same two I2C wires?" },
  { phase: 2, week: 5, weekTitle: "Sensors — I2C & 1-Wire", taskNumber: 2, title: "SHT40 I2C scanner", description: "Connect SHT40, run I2C scanner, confirm address 0x44 on Serial Monitor.", selfCheck: "Does the I2C scanner show address 0x44?" },
  { phase: 2, week: 5, weekTitle: "Sensors — I2C & 1-Wire", taskNumber: 3, title: "SHT40 direct I2C read", description: "Use Smartdwell direct I2C SHT40 code — send 0xFD, read 6 bytes, calculate and print temp/humidity.", selfCheck: "Do your printed temperature and humidity values match expected room conditions?" },
  { phase: 2, week: 5, weekTitle: "Sensors — I2C & 1-Wire", taskNumber: 4, title: "DS18B20 temperature sensor", description: "Wire DS18B20 with 4.7k pull-up, install libraries, read and print temperature.", selfCheck: "Does the DS18B20 reading match within ±2°C of the SHT40 reading?" },
  { phase: 2, week: 5, weekTitle: "Sensors — I2C & 1-Wire", taskNumber: 5, title: "Dual sensor comparison", description: "Read both sensors simultaneously every 2 seconds, compare temperatures, log difference.", selfCheck: "Is the temperature difference between both sensors consistently small (<2°C)?" },
  // Phase 2 - Week 6
  { phase: 2, week: 6, weekTitle: "RS-485 wiring & Modbus basics", taskNumber: 1, title: "RS-485 topology diagram", description: "Draw RS-485 topology — A/B differential pair, termination resistors, explain differential advantage.", selfCheck: "Can you explain why differential signalling is more noise-resistant?" },
  { phase: 2, week: 6, weekTitle: "RS-485 wiring & Modbus basics", taskNumber: 2, title: "MAX485 transceiver wiring", description: "Wire MAX485 transceiver to ESP32 — DI, RO, DE+RE, A/B lines, verify with mentor.", selfCheck: "Can you trace signal flow from ESP32 TX through MAX485 to the bus?" },
  { phase: 2, week: 6, weekTitle: "RS-485 wiring & Modbus basics", taskNumber: 3, title: "Modbus RTU frame analysis", description: "Write down byte-by-byte Modbus RTU request frame for reading 1 register from address 1 function 0x04.", selfCheck: "Can you identify each byte's purpose: address, function, register, length, CRC?" },
  { phase: 2, week: 6, weekTitle: "RS-485 wiring & Modbus basics", taskNumber: 4, title: "ModbusMaster library read", description: "Install ModbusMaster library, connect to Modbus device, read 1 input register, print raw value.", selfCheck: "Does the printed value match the device display?" },
  { phase: 2, week: 6, weekTitle: "RS-485 wiring & Modbus basics", taskNumber: 5, title: "RS-485 troubleshooting checklist", description: "Create RS-485 troubleshooting checklist — 5 items — test each point on your setup.", selfCheck: "Have you tested all 5 checklist items on your actual wiring?" },
  // Phase 2 - Week 7
  { phase: 2, week: 7, weekTitle: "Relay control & panel wiring", taskNumber: 1, title: "Relay terminal diagram", description: "Draw relay diagram showing COM/NO/NC in both OFF and ON states, explain each terminal.", selfCheck: "Can you explain which terminal pair is connected in each relay state?" },
  { phase: 2, week: 7, weekTitle: "Relay control & panel wiring", taskNumber: 2, title: "2-relay board wiring", description: "Wire 2-relay board to ESP32 — VCC, GND, IN1 GPIO1, IN2 GPIO2 — note active-low initialisation.", selfCheck: "Do you understand why the relay activates when GPIO goes LOW?" },
  { phase: 2, week: 7, weekTitle: "Relay control & panel wiring", taskNumber: 3, title: "Relay toggle with Serial", description: "Write relay toggle code with Serial.println for each state, verify with multimeter across NO-COM.", selfCheck: "Does the multimeter show continuity across NO-COM only when relay is ON?" },
  { phase: 2, week: 7, weekTitle: "Relay control & panel wiring", taskNumber: 4, title: "12V lamp relay control", description: "Wire 12VDC lamp through relay NO-COM under mentor supervision, demonstrate ON/OFF control.", selfCheck: "Does the lamp turn ON and OFF reliably with your code?" },
  { phase: 2, week: 7, weekTitle: "Relay control & panel wiring", taskNumber: 5, title: "Phase 2 assessment", description: "Phase assessment: read SHT40 temp, if >30°C turn relay ON, else OFF — write, upload, demonstrate alone.", selfCheck: "Does the relay respond correctly to temperature threshold without any help?" },
  // Phase 3 - Week 8
  { phase: 3, week: 8, weekTitle: "WiFi & WiFiManager", taskNumber: 1, title: "Hardcoded WiFi connection", description: "Connect ESP32 to WiFi hardcoded, print IP, ping from laptop.", selfCheck: "Can you successfully ping the ESP32 IP from your laptop?" },
  { phase: 3, week: 8, weekTitle: "WiFi & WiFiManager", taskNumber: 2, title: "WiFiManager flow explanation", description: "Explain WiFiManager flow in own words in training log — 6 steps.", selfCheck: "Can you describe all 6 steps of the WiFiManager captive portal flow?" },
  { phase: 3, week: 8, weekTitle: "WiFi & WiFiManager", taskNumber: 3, title: "SDW gateway WiFiManager", description: "Flash SDW gateway firmware, connect to Smartdwell_Config hotspot, enter WiFi credentials, verify connection.", selfCheck: "Does the gateway connect to WiFi after entering credentials via the captive portal?" },
  { phase: 3, week: 8, weekTitle: "WiFi & WiFiManager", taskNumber: 4, title: "NVS Preferences exploration", description: "Find NVS Preferences section in firmware, explain each stored key to mentor.", selfCheck: "Can you list all NVS keys and explain what each one stores?" },
  { phase: 3, week: 8, weekTitle: "WiFi & WiFiManager", taskNumber: 5, title: "WiFi reconnect flowchart", description: "Trace WiFi reconnect logic in SDW firmware, draw as flowchart.", selfCheck: "Does your flowchart accurately represent the reconnection logic including timeouts?" },
  // Phase 3 - Week 9
  { phase: 3, week: 9, weekTitle: "MQTT protocol", taskNumber: 1, title: "MQTT architecture diagram", description: "Draw MQTT diagram — broker, 1 gateway publishing, 1 dashboard subscribing — explain publish/subscribe.", selfCheck: "Can you explain the publish/subscribe pattern and role of the broker?" },
  { phase: 3, week: 9, weekTitle: "MQTT protocol", taskNumber: 2, title: "MQTT Explorer setup", description: "Install MQTT Explorer, connect to Smartdwell broker, browse all topics, screenshot in log.", selfCheck: "Can you navigate the topic tree and identify Smartdwell device topics?" },
  { phase: 3, week: 9, weekTitle: "MQTT protocol", taskNumber: 3, title: "ESP32 MQTT publish", description: "Publish test message from ESP32 to topic sdw/test/intern1 with payload hello, verify in MQTT Explorer.", selfCheck: "Does your message appear in MQTT Explorer under the correct topic?" },
  { phase: 3, week: 9, weekTitle: "MQTT protocol", taskNumber: 4, title: "MQTT subscribe & relay control", description: "Subscribe to sdw/test/cmd, publish relay_on from MQTT Explorer, print in ESP32 callback, then trigger relay 1.", selfCheck: "Does relay 1 activate when you publish relay_on from MQTT Explorer?" },
  { phase: 3, week: 9, weekTitle: "MQTT protocol", taskNumber: 5, title: "SDW MQTT topic mapping", description: "List all MQTT topics in SDW gateway firmware in table: Topic, Direction, Payload format, Purpose.", selfCheck: "Does your table cover every topic the gateway publishes and subscribes to?" },
  // Phase 3 - Week 10
  { phase: 3, week: 10, weekTitle: "Modbus RTU deep dive with SELEC PID", taskNumber: 1, title: "SELEC PID register map", description: "Write SELEC PID330-U confirmed register map from memory — PV IR[30008], SV IR[30006] div10, Hand IR[30012], write SV HR[40114] x10, Hand HR[40155].", selfCheck: "Can you write the complete register map from memory without looking?" },
  { phase: 3, week: 10, weekTitle: "Modbus RTU deep dive with SELEC PID", taskNumber: 2, title: "SELEC PID live reading", description: "Wire to SELEC PID via RS-485, read PV and SV every 2s, compare with PID display.", selfCheck: "Do your serial readings match the PID display within ±0.1?" },
  { phase: 3, week: 10, weekTitle: "Modbus RTU deep dive with SELEC PID", taskNumber: 3, title: "MQTT to Modbus SV control", description: "Send SV change command via MQTT Explorer, verify PID display changes, debug if not.", selfCheck: "Does the PID display update when you send a new SV via MQTT?" },
  { phase: 3, week: 10, weekTitle: "Modbus RTU deep dive with SELEC PID", taskNumber: 4, title: "Modbus error code handling", description: "Add Serial.print for Modbus error codes — 0=success, timeout, illegal function, illegal address.", selfCheck: "Can you identify and explain each Modbus error code in your output?" },
  { phase: 3, week: 10, weekTitle: "Modbus RTU deep dive with SELEC PID", taskNumber: 5, title: "Mentor fault-finding challenge", description: "Mentor introduces 1 fault — intern finds and fixes within 20 minutes using multimeter + Serial Monitor only.", selfCheck: "Did you find and fix the fault within the time limit?" },
  // Phase 3 - Week 11
  { phase: 3, week: 11, weekTitle: "ESP-NOW sensor nodes", taskNumber: 1, title: "ESP-NOW concept explanation", description: "Explain ESP-NOW concept — no router, peer-to-peer, range — in own words.", selfCheck: "Can you explain 3 advantages of ESP-NOW over WiFi for sensor nodes?" },
  { phase: 3, week: 11, weekTitle: "ESP-NOW sensor nodes", taskNumber: 2, title: "Gateway MAC address", description: "Print gateway ESP32 MAC address using WiFi.macAddress(), note it for sensor nodes.", selfCheck: "Have you recorded the MAC address and verified it is correct?" },
  { phase: 3, week: 11, weekTitle: "ESP-NOW sensor nodes", taskNumber: 3, title: "SHT40 sensor node flash", description: "Flash SHT40 sensor node firmware with correct gateway MAC, verify gateway Serial shows data received.", selfCheck: "Does the gateway serial output show temperature and humidity from the sensor node?" },
  { phase: 3, week: 11, weekTitle: "ESP-NOW sensor nodes", taskNumber: 4, title: "NodePayload struct analysis", description: "Find NodePayload struct — char mac[18], uint8_t nodeId, float temp, float humidity — explain each field.", selfCheck: "Can you explain the purpose and data type of each field in NodePayload?" },
  { phase: 3, week: 11, weekTitle: "ESP-NOW sensor nodes", taskNumber: 5, title: "Dual sensor node setup", description: "Flash 2 ESP32s as sensor nodes nodeId 1 and 2, verify gateway receives and identifies both correctly.", selfCheck: "Does the gateway correctly identify and display data from both nodes?" },
  // Phase 3 - Week 12
  { phase: 3, week: 12, weekTitle: "Full system integration test", taskNumber: 1, title: "Full system bring-up", description: "Bring up complete system: gateway + SELEC PID (Modbus) + 1 sensor node (ESP-NOW) + MQTT broker — verify all publishing.", selfCheck: "Are all components publishing data to the MQTT broker correctly?" },
  { phase: 3, week: 12, weekTitle: "Full system integration test", taskNumber: 2, title: "6-relay MQTT control test", description: "Control all 6 relays via MQTT Explorer, measure output with multimeter, all must respond correctly.", selfCheck: "Do all 6 relays respond correctly to MQTT commands?" },
  { phase: 3, week: 12, weekTitle: "Full system integration test", taskNumber: 3, title: "Firmware code review", description: "Read firmware for 1 hour, find one real potential failure point, document with line number and explanation.", selfCheck: "Can you explain the failure scenario and suggest a fix?" },
  { phase: 3, week: 12, weekTitle: "Full system integration test", taskNumber: 4, title: "System test checklist", description: "Write 1-page system test checklist — Power, WiFi, Modbus PV, ESP-NOW receive, MQTT publish, Relay control.", selfCheck: "Does your checklist cover all 6 critical system verification points?" },
  { phase: 3, week: 12, weekTitle: "Full system integration test", taskNumber: 5, title: "Phase 3 assessment", description: "Phase assessment: fresh ESP32 + RS-485 device + MQTT broker details — wire, flash, configure, verify all data — 45 minutes, no hints.", selfCheck: "Did you complete the full setup within 45 minutes without any assistance?" },
  // Phase 4 - Week 13
  { phase: 4, week: 13, weekTitle: "Installation report writing", taskNumber: 1, title: "Study installation report", description: "Study one real Smartdwell installation report — list all sections it must contain.", selfCheck: "Can you list all required sections of a Smartdwell installation report?" },
  { phase: 4, week: 13, weekTitle: "Installation report writing", taskNumber: 2, title: "Write installation report", description: "Write installation report for Week 12 gateway setup as if real client site — photos, MQTT screenshot, Modbus readings, relay test.", selfCheck: "Does your report include all required sections with supporting evidence?" },
  { phase: 4, week: 13, weekTitle: "Installation report writing", taskNumber: 3, title: "5-photo documentation SOP", description: "Practice 5-photo documentation SOP for every site visit — panel before, panel after, labels, MQTT screenshot, client+engineer.", selfCheck: "Do you have all 5 required photos with proper quality and labelling?" },
  { phase: 4, week: 13, weekTitle: "Installation report writing", taskNumber: 4, title: "Google Drive folder structure", description: "Create Google Drive folder structure: Projects > ClientName > InstallDate > Photos/Reports/Firmware, file Week 12 report.", selfCheck: "Is your folder structure correct and the report filed in the right location?" },
  { phase: 4, week: 13, weekTitle: "Installation report writing", taskNumber: 5, title: "Error-finding in flawed report", description: "Find all errors in a deliberately flawed installation report given by mentor, list and correct them.", selfCheck: "Did you find and correct all deliberately planted errors?" },
  // Phase 4 - Week 14
  { phase: 4, week: 14, weekTitle: "Troubleshooting & client communication", taskNumber: 1, title: "5-step troubleshooting method", description: "Apply 5-step troubleshooting method to broken setup created by mentor — Power, Connections, Serial, MQTT, Firmware version.", selfCheck: "Did you follow all 5 steps in order and identify the issue?" },
  { phase: 4, week: 14, weekTitle: "Troubleshooting & client communication", taskNumber: 2, title: "Professional WhatsApp messages", description: "Write 3 professional WhatsApp support messages for: confirming site visit, reporting an issue, following up on pending query.", selfCheck: "Are all 3 messages professional, clear, and complete?" },
  { phase: 4, week: 14, weekTitle: "Troubleshooting & client communication", taskNumber: 3, title: "Support email writing", description: "Write support email with subject line, issue description, steps tried, site visit request in Smartdwell format.", selfCheck: "Does your email follow the Smartdwell format with all required sections?" },
  { phase: 4, week: 14, weekTitle: "Troubleshooting & client communication", taskNumber: 4, title: "Angry client simulation", description: "Handle simulated angry client complaint — stay calm, ask right questions, give clear response and timeline.", selfCheck: "Did you maintain professionalism and provide a clear resolution timeline?" },
  { phase: 4, week: 14, weekTitle: "Troubleshooting & client communication", taskNumber: 5, title: "Escalation SOP", description: "Write escalation SOP — when to escalate to Rahul — 4 scenarios, 1 page.", selfCheck: "Does your SOP clearly define all 4 escalation scenarios with action steps?" },
  // Phase 4 - Week 15
  { phase: 4, week: 15, weekTitle: "SOP writing for Smartdwell products", taskNumber: 1, title: "Gateway installation SOP", description: "Write SOP for SDW IoT Gateway installation — pre-check, wiring, firmware flash, WiFiManager, MQTT verify, handover — 2-3 pages with photos.", selfCheck: "Can someone follow your SOP to install a gateway without asking any questions?" },
  { phase: 4, week: 15, weekTitle: "SOP writing for Smartdwell products", taskNumber: 2, title: "6-Relay Controller SOP", description: "Write SOP for 6-Relay Controller — mounting, wiring, flash, schedule config, relay test, client training.", selfCheck: "Does your SOP cover every step from mounting to client handover?" },
  { phase: 4, week: 15, weekTitle: "SOP writing for Smartdwell products", taskNumber: 3, title: "FAQ document", description: "Create FAQ document — 10 common issues, format: Issue, Likely Cause, Solution, Prevention.", selfCheck: "Are all 10 FAQs based on real issues you encountered during training?" },
  { phase: 4, week: 15, weekTitle: "SOP writing for Smartdwell products", taskNumber: 4, title: "SOP validation by mentor", description: "Mentor follows your SOP on real hardware without asking questions — rewrite any step that causes confusion.", selfCheck: "Did mentor complete the installation using only your SOP?" },
  { phase: 4, week: 15, weekTitle: "SOP writing for Smartdwell products", taskNumber: 5, title: "SOP translation", description: "Translate critical safety and wiring steps of relay controller SOP into simple Hindi or Marathi.", selfCheck: "Can a Hindi/Marathi-speaking technician understand your translated steps?" },
  // Phase 4 - Week 16
  { phase: 4, week: 16, weekTitle: "Site visit preparation & final assessment", taskNumber: 1, title: "Site visit toolkit checklist", description: "Prepare physical site visit toolkit checklist — laptop, Arduino IDE, USB cable, multimeter, spare ESP32, RS-485 cable, terminal screwdriver, crimping tool, jumper wires, wiring diagram.", selfCheck: "Is every item on your checklist packed and verified?" },
  { phase: 4, week: 16, weekTitle: "Site visit preparation & final assessment", taskNumber: 2, title: "Client handover procedure", description: "Practice client handover procedure — live demo, MQTT dashboard explanation, manual relay test, signature on report, photo.", selfCheck: "Can you perform the complete handover procedure smoothly?" },
  { phase: 4, week: 16, weekTitle: "Site visit preparation & final assessment", taskNumber: 3, title: "Mock site visit simulation", description: "Full 2-hour mock site visit simulation — arrive, install, troubleshoot deliberate issues, write report, present as if to real client.", selfCheck: "Did you complete the mock site visit within 2 hours including the report?" },
  { phase: 4, week: 16, weekTitle: "Site visit preparation & final assessment", taskNumber: 4, title: "Skills audit", description: "Fill skills audit table — 20 skills, rate 1-5, identify top 3 strengths and top 3 improvement areas, share with Rahul.", selfCheck: "Is your self-assessment honest and shared with Rahul?" },
  { phase: 4, week: 16, weekTitle: "Site visit preparation & final assessment", taskNumber: 5, title: "Final Q&A assessment", description: "Final 30-minute Q&A with Rahul covering all phases — on pass: training completion certificate issued.", selfCheck: "Are you confident you can answer questions from all 4 phases?" },
];

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI);
  console.log("Connected.");

  console.log("Clearing existing tasks...");
  await Task.deleteMany({});

  console.log("Inserting 80 tasks...");
  const result = await Task.insertMany(TASKS);
  console.log(`Successfully seeded ${result.length} tasks.`);

  await mongoose.disconnect();
  console.log("Done.");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
