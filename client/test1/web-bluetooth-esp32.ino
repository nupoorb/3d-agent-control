
//#include <TFT_eSPI.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <BLE2902.h>
#include "esp_bt_main.h"
#include "esp_bt_device.h"
	
#include "esp_bt_device.h"

/// To Control  BNO080 include following 
#include <Wire.h>
#include "esp_adc_cal.h"
#include <WiFi.h>
#include <HTTPClient.h>


//////////////////////////
#define BAT_ADC    2
float Voltage = 0.0;

#include "SparkFun_BNO080_Arduino_Library.h" // Click here to get the library: http://librarymanager/All#SparkFun_BNO080
BNO080 myIMU;
/////////////////////////

//MPU9250 mpu;
/////////////////////////
// TFT_eSPI tft = TFT_eSPI(); 
//PCF8563_Class rtc; 

BLECharacteristic* pCharacteristic;

uint8_t hh, mm, ss ;
String mac_address;
int pacnum=0;


#define BLE_NAME "MM" //must match filters name in bluetoothterminal.js- navigator.bluetooth.requestDevice
// BLEUUID  SERVICE_UUID((uint16_t)0x1802); // UART service UUID
// BLEUUID CHARACTERISTIC_UUID ((uint16_t)0x1803);

BLEUUID  SERVICE_UUID("6E400001-B5A3-F393-E0A9-E50E24DCCA9E");//("6e400001-b5a3-f393-e0a9-e50e24dcca9e"); //("6E400001-B5A3-F393-E0A9-E50E24DCCA9E"); // UART service UUID
BLEUUID CHARACTERISTIC_UUID ("6E400002-B5A3-F393-E0A9-E50E24DCCA9E");
//("6e400002-b5a3-f393-e0a9-e50e24dcca9e");//("6E400002-B5A3-F393-E0A9-E50E24DCCA9E");


class MyCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
      std::string value = pCharacteristic->getValue();

      if (value.length() > 0) {
        // Serial.println("*********");
        Serial.print("New value: ");
        for (int i = 0; i < value.length(); i++)
        {
          Serial.print(value[i]);
        }

        pCharacteristic->setValue(value +"\n"); // must add seperator \n for it to register on BLE terminal
        pCharacteristic->notify();
      }
    }
};

unsigned long timerDelay = 10;
unsigned long lastTime = 0;

void setup() {
    Serial.begin(115200);

    delay(100); //  Wait for BNO to boot
    // Start i2c and BNO080
    Wire.flush();   // Reset I2C
      Wire.begin(26, 27);

    myIMU.begin(0x4B, Wire); // 0x4A, 0x4B
    // tft.pushImage(0, 0,  160, 80, ttgo); 

     if (myIMU.begin() == false)
    {
    Serial.println("BNO080 not detected at default I2C address. Check your jumpers and the hookup guide. Freezing...");
     while (1);
    }

    ////////////
    Wire.setClock(400000); //Increase I2C data rate to 400kHz

    myIMU.enableRotationVector(50); //Send data update every 50ms

    Serial.println(F("Rotation vector enabled"));
    Serial.println(F("Output in form i, j, k, real, accuracy"));
   

    BLEDevice::init(BLE_NAME);

    BLEServer *pServer = BLEDevice::createServer();

    BLEService *pService = pServer->createService(SERVICE_UUID);

    pCharacteristic = pService->createCharacteristic(
                                          CHARACTERISTIC_UUID,
                                          BLECharacteristic::PROPERTY_READ |
                                          BLECharacteristic::PROPERTY_WRITE |
                                          BLECharacteristic::PROPERTY_NOTIFY
                                        );

    pCharacteristic->setCallbacks(new MyCallbacks());
    
    pCharacteristic->addDescriptor(new BLE2902());

    mac_address = BLEDevice::getAddress().toString().c_str();
    Serial.println(mac_address);
    esp_ble_gap_set_device_name(("MM-" + mac_address).c_str());
    esp_bt_dev_set_device_name(("MM-" + mac_address).c_str());

    pService->start();

    BLEAdvertising *pAdvertising = pServer->getAdvertising();
    pAdvertising->start();

}

float rollp =0, pitchp =0, yawp=0;
bool firstvalue = true;

void loop() {

  if (myIMU.dataAvailable() == true){
    float quatI = myIMU.getQuatI();
    float quatJ = myIMU.getQuatJ();
    float quatK = myIMU.getQuatK();
    float quatReal = myIMU.getQuatReal();
    float quatRadianAccuracy = myIMU.getQuatRadianAccuracy();

    // Serial.print(quatI, 2);
    // Serial.print(F(" "));
    // Serial.print(quatK, 2);
    // Serial.print(F(" "));
    // Serial.print(quatJ, 2);
    // Serial.print(F(" "));
    // Serial.print(quatReal, 2);

    //     Voltage = (readADC_Cal(analogRead(BAT_ADC))) * 2;
    // Serial.printf(" %.2fV\n", Voltage / 1000.0); 


    float roll, pitch, yaw;

    // Assuming quatI, quatJ, quatK, and realQuat are the quaternion components from the sensor
    // Calculate roll, pitch, and yaw from quaternion components
    roll = atan2(2*(quatReal*quatI + quatJ*quatK), 1 - 2*(quatI*quatI + quatJ*quatJ));
    pitch = asin(2*(quatReal*quatJ - quatK*quatI));
    yaw = atan2(2*(quatReal*quatK + quatI*quatJ), 1 - 2*(quatJ*quatJ + quatK*quatK));

    // float r=0, p=0, y=0;

    // if ( ((roll - rollp) < -0.5) )
    //   {r = ((roll+0.5)/1.1)*100;}
    // else ( ((roll - rollp) > 0.5));
    //   {r = ((roll-0.5)/1.1)*100;};

    String url =  String(roll) + "," + String(pitch) + "," + String(yaw);
    Serial.println(url);       
    // response = httpGETRequest(url.c_str()); ///////
    // Serial.println(response);
    
    // String message = "Hello, world!";
      pCharacteristic->setValue(url.c_str());

      // Send a notification to connected clients
      pCharacteristic->notify();
      // webSocket.sendTXT(url.c_str());
    if (firstvalue == true)
    {
      rollp = roll;
      pitchp = pitch;
      yawp = yaw;
    };
    // Serial.println(rollp); Serial.println(roll);
    firstvalue = false;
  }
}


////90 left -1.55   3.10     1.5 
// 90 right 1.57   

//-.05 

// ^ -1.5
// 1.5 


// 1.55  left 3 right 0 







