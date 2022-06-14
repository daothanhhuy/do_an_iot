#include <ESP8266HTTPClient.h>
#include <Wire.h>
#include <BH1750.h>
#include <DHT.h>
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Servo.h>
Servo servo;

//
BH1750 lightMeter;
int pumpPin = D7; // water pump
int bulbPin = D3; // đèn
int servoPin = D4; // servo
int soilPin = A0; // soil humidity 
#define DHTPIN D5 // Cảm biến nhiệt độ & độ ẩm
#define DHTTYPE DHT22 // 

DHT dht(DHTPIN, DHTTYPE);

// Configure mqtt
const char *mqttServer = "172.31.251.191";
const char *topicPump = "pump";
const char *topicBulb = "bulb";
const char *topicServo = "servo";
const char *topic = "test";


// SSID và password
const String ssid = "UiTiOt-E3.1";
const String password = "UiTiOtAP";
const char *updateDeviceApi = "http://172.31.250.62:3000/update/device";
const char *refreshApi = "http://172.31.250.62:3000/refresh";
const char *updateDhtApi = "http://172.31.250.62:3000/update/dht";
const char *updateBhApi = "http://172.31.250.62:3000/update/bh";
const char *updateSoilApi = "http://172.31.250.62:3000/update/soil";
const String image = "https://product.hstatic.net/1000362368/product/board_arduino_wemos_d1_r2_474b9472c3214d6088703c70b1a1e54b_master.jpg";

unsigned long lastUpdateTime = 0;
unsigned long lastRefreshTime =0;

// delay gửi request update dữ liệu từ sensor
unsigned long updateDelay = 10000; // 1p gui request đưa dữ liệu từ sensor lên server
unsigned long refreshDelay  = 60000; // 1

unsigned long lastPump = 0;
unsigned long pumpDelay = 5000;

bool turnOnPump = false;
unsigned long lastOpen = millis();
unsigned long openDelay = 10000;

String deviceId = "";
String deviceIP = "";
WiFiClient client;
WiFiClient mqttClient;
HTTPClient http;
PubSubClient brokerClient(mqttClient);

StaticJsonDocument<96> doc;

bool closingGate = false;

bool convertToJson(const char* message){
  DeserializationError error = deserializeJson(doc, message);
  if(error){
    Serial.print(F("deserializeJson() failed: "));
    Serial.println(error.f_str());
    return false;
  }
  return true;
}

void controlPump(bool turnOn){
  if(turnOn){
    Serial.println("Turn on water pump");
    digitalWrite(pumpPin, LOW);
//    lastPump = millis();
  } else {
    Serial.println("Turn off water pump");
    digitalWrite(pumpPin, HIGH);
  }
}

void controlBulb(bool turnOn){
  if(turnOn){
    Serial.println("Turn on light");
    digitalWrite(bulbPin, HIGH);
  } else {
    Serial.println("Turn off light");
    digitalWrite(bulbPin, LOW);
  }
}

void controlServo(bool turnOn){
  if(turnOn){
    Serial.println("Open gate");
    servo.write(0);
    lastOpen = millis();
    closingGate = true;
  } else { 
    Serial.println("Close gate");
    servo.write(180);
    closingGate = false;
  }
}

void callback(char * topic, byte* payload, unsigned int length){
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("]: ");
  
  char message[length];

  for(int i=0 ; i < length; i++){
    message[i] = (char)payload[i];
  }
  Serial.println(message);

  // https://stackoverflow.com/questions/7125697/c-comparing-pointers-with-chars
    if(strcmp(topic, topicPump) == 0){
    if(convertToJson(message)){
      turnOnPump = doc["pump"];
      controlPump(turnOnPump);
    }
  } else if(strcmp(topic, topicBulb) == 0){
    if(convertToJson(message)){
      bool turnOn = doc["bulb"];
      controlBulb(turnOn);
    }
  } else if(strcmp(topic, topicServo) == 0){
    if(convertToJson(message)){
      bool turnOn = doc["servo"];
      controlServo(turnOn);
    }
  }
}




bool registerDevice(const char *apiPath){
  HTTPClient http;
  http.begin(client, apiPath);
  http.addHeader("Content-Type", "application/json");
  String name = "\"name\":\"Wemos D1 R2\"";
  String imgUrl = "\"imgUrl\":\"" + image + "\"";
  String payload = "{" + name + "," + imgUrl +"}";

  Serial.println("Gửi dữ payload thông tin lên server.");
  int responeCode = http.POST(payload);
  if (responeCode >= 200 && responeCode  <300){
      Serial.println("Kết nối đến server thành công.");
      Serial.print("Id: ");
      deviceId = http.getString();
      Serial.println();
      http.end();
      return true;
  } else {
      Serial.println("Không thể kết nối server, tiến hành thử lại...");
      Serial.print("Error code: ");
      Serial.println(responeCode);
      http.end();
      return false;
    }
  http.end();
  return false;
}

void refreshDevice(const char* apiPath){
    HTTPClient http;
    http.begin(client, apiPath);
    http.addHeader("Content-Type", "application/json");
    
    String payload = "{\"_id\":\""+deviceId+"\"}";
    
    Serial.print("Refresh lại trạng thái thiết bị");
    int responeCode = http.PATCH(payload);
    
    if (responeCode >= 400) {
      Serial.println("Không thể refresh trạng thái thiết bị...");
      Serial.print("Error code: ");
      Serial.println(responeCode);
    } else if (responeCode >= 200 && responeCode  <300){
      Serial.println("Refresh trạng thái thành công");
      Serial.println(http.getString());
    }
    http.end();
}


void updateDht(const char *apiPath, float temp, float humi){
    HTTPClient http;
    http.begin(client, apiPath);
    http.addHeader("Content-Type", "application/json");

    // Tạo payload để gửi đi
    String name = "\"name\":\"DHT11\"";
    String ip = "\"ip\":\"" + deviceIP + "\"";
    String tempStr ="\"temp\":\"" + String(temp) + "\"";
    String humiStr ="\"humi\":\"" + String(humi) + "\"";
    String attachTo = "\"attachTo\":\"" + deviceId + "\"";
    String payload = "{" + name + "," + ip + "," + tempStr + "," + humiStr + "," + attachTo + "}";

    Serial.println("Gửi dữ liệu dht lên server");
    int httpResponeCode = http.POST(payload);
  
     if(httpResponeCode  >= 200 && httpResponeCode < 300){
        Serial.println("Gửi dữ liệu dht thành công");
        Serial.print("Respone code: ");
        Serial.println(httpResponeCode);
    } else {
        Serial.println("Gửi dữ liệu dht lỗi");
        Serial.print("Error code: ");
        Serial.println(httpResponeCode);
    }
    Serial.println();
    http.end();
}

void updateBh(const char *apiPath, float lux){
    HTTPClient http;
    http.begin(client, apiPath);
    http.addHeader("Content-Type", "application/json");

    // Tạo payload để gửi đi
    String name = "\"name\":\"BH1750\"";
    String ip = "\"ip\":\"" + deviceIP + "\"";
    String luxStr ="\"lux\":\"" + String(lux) + "\"";
    String attachTo = "\"attachTo\":\"" + deviceId + "\"";
    String payload = "{" + name + "," + ip + "," + luxStr + ","  + attachTo + "}";

    Serial.println("Gửi dữ liệu bh lên server.");
    int httpResponeCode = http.POST(payload);
  
     if(httpResponeCode  >= 200 && httpResponeCode < 300){
        Serial.println("Gửi dữ liệu bh lên sserver thành công");
        Serial.print("Respone code: ");
        Serial.println(httpResponeCode);
        Serial.println();
    } else {
        Serial.println("Gửi dữ liệu bh lỗi");
        Serial.print("Error code: ");
        Serial.println(httpResponeCode);
    }

    http.end();
}

void updateSoil(const char *apiPath, float soil){
    HTTPClient http;
    http.begin(client, apiPath);
    http.addHeader("Content-Type", "application/json");

    // Tạo payload để gửi đi
    String name = "\"name\":\"Soil Sensor\"";
    String ip = "\"ip\":\"" + deviceIP + "\"";
    String soilHumiStr ="\"soilHumi\":\"" + String(soil) + "\"";
    String attachTo = "\"attachTo\":\"" + deviceId + "\"";
    String payload = "{" + name + "," + ip + "," + soilHumiStr + "," + attachTo + "}";

    Serial.println("Gửi dữ liệu soil sensor lên server.");
    int httpResponeCode = http.POST(payload);
  
     if(httpResponeCode  >= 200 && httpResponeCode < 300){
        Serial.println("Gửi dữ liệu soil sensor lên sserver thành công");
        Serial.print("Respone code: ");
        Serial.println(httpResponeCode);
        Serial.println();
    } else {
        Serial.println("Gửi dữ liệu soil sensor lỗi");
        Serial.print("Error code: ");
        Serial.println(httpResponeCode);
    }
    http.end();
}

void reconnect(){
  String clientId = "WemosD1R2";
  while(!brokerClient.connected()){
    Serial.print("Attempting MQTT connection...");
     if(brokerClient.connect(clientId.c_str())){
        Serial.println("connected");
//        brokerClient.subscribe(topic);
        brokerClient.subscribe(topicPump);
        brokerClient.subscribe(topicBulb);
        brokerClient.subscribe(topicServo);
      } else {
      Serial.print("failed, rc=");
      Serial.print(brokerClient.state());
      Serial.println(" try again in 2 seconds");
      // Wait 5 seconds before retrying
      delay(2000);
    }
  } 
}

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  

  servo.write(180);
  pinMode(pumpPin, OUTPUT);
  pinMode(soilPin, INPUT);
  pinMode(servoPin, OUTPUT);
  pinMode(bulbPin, OUTPUT);

  WiFi.begin(ssid, password);
  Serial.println("Connecting to " + ssid + "...");
  while(WiFi.status() != WL_CONNECTED){
    delay(500);
    Serial.print(".");    
  }
  
  Serial.println("Connecting successful.");
  Serial.print("Your IP is: ");
  deviceIP = WiFi.localIP().toString();
  Serial.println(deviceIP);
  Serial.println();

  Serial.println("");

  while(!registerDevice(updateDeviceApi)){
    delay(1000);
    Serial.print(".");
  } 
   
  //after register successfully
  Serial.println("Your device ID is: " + deviceId);

  brokerClient.setServer(mqttServer, 1883);
  brokerClient.setCallback(callback);

  // for bh
  servo.attach(servoPin);
  digitalWrite(pumpPin, HIGH);
  Wire.begin();
  lightMeter.begin();
  dht.begin();

  
  servo.write(0);
}

void loop() {
  
  if(!brokerClient.connected()){
    reconnect();
  }
  brokerClient.loop();

 // Chinh sua cho nay mot xiu
  int value = analogRead(soilPin);
  int soil = map(value, 0, 1023, 0, 100);
 // printSoil(soil);

  float lux = lightMeter.readLightLevel();
  //printLux(lux);

  float t = dht.readTemperature();  float h = dht.readHumidity();
  if(isnan(h) || isnan(t)){
    Serial.println("Failed to read from DHT sensor.");
    return;
  }
  //printTempHumi(t, h);

  if (millis() - lastOpen > openDelay){
    if (closingGate){
      Serial.println("Close gate");
      servo.write(180);
      closingGate = false;
    }
  }
  

  if(millis() - lastUpdateTime > updateDelay){
    updateDht(updateDhtApi, t, h);
    updateBh(updateBhApi, lux);
    updateSoil(updateSoilApi, soil);
    lastUpdateTime = millis();
  }
  

  if(millis() - lastRefreshTime > refreshDelay){
     refreshDevice(refreshApi);
     lastRefreshTime = millis();
  }

//  if (t >= 35 || h <= 20){
//      digitalWrite(pumpPin, LOW);
//  } else { // t < 35 && h > 20
//      digitalWrite(pumpPin, HIGH);  
//  }
//
//  if (lux <= 250){
//     digitalWrite(bulbPin, HIGH);
//  } else {
//    digitalWrite(bulbPin, LOW);
//  }


delay(50);

}

void printTempHumi(float temp, float humi){
  Serial.print("Temperature: "); 
  Serial.print(temp);
  Serial.println(" *C ");

  Serial.print("Humidity: ");
  Serial.print(humi);
  Serial.println(" %t ");
  delay(50);
}

void printLux(float lux){
  Serial.print("Light: ");
  Serial.print(lux);
  Serial.println(" lx");
  delay(50);
}

void printSoil(float soil){
  Serial.print("Soil Humidity: ");
  Serial.print(soil);
  Serial.println("%");
  delay(50);
}
