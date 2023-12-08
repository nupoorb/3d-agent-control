# 3d-agent-control


<h3>Hardware Requirements</h3>
<ol>
  <li>Arduino Controller</li>
  <li>IMU BNO080 module</li>
  <li>USB cable</li>
  <li>Lipo battery</li>
  <li>Computer system with bluetooth</li>
</ol>

<h3>Software Requirements</h3>
<ol>
  <li>Arduino IDE 2.2.1</li>
  <li>Web browser with web bluetooth functionality, for example - Chrome </li>
  <li>HTML5</li>
  <li>three.js - https://threejs.org/docs/#manual/en/introduction/Installation</li>
</ol>

<h3>Client</h3>
<ol>
  <li>Connect Arduino to computer and select ESP32 dev module and arduino system board.</li>
  <li>Copy "web-bluetooth-esp32.ino" from <code>client/test1</code> folder to your IDE and upload to the arduino board</li>
  <li>Upon successful upload, check if seriel monitor is publishing IMU values</li>
</ol>

<h3>Sever</h3>
<ol>
  <li>Clone this repo into the server</li>
  <li>Locate index.html and run using <code>npx vite</code></li>
  <li>Using browser access port 5173 of locahost</li>
</ol>
<h3>Results</h3>
<img width="923" alt="ss" src="https://github.com/nupoorb/3d-agent-control/assets/35562572/51f7c5fd-a6bd-46bd-9420-113feee37fa5">

<h3>Demo</h3>
https://drive.google.com/file/d/1NvcacdRZbeXrxlrmnG-RMc-vC5LYli6r/view?usp=drive_link

