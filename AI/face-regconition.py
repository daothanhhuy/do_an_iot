
from unittest import result
import cv2
import numpy as np
import os
import time
from paho.mqtt import client as mqtt_client
import json
import threading
import requests
import socket

'''               FOR SERVER                '''
register_url = 'http://localhost:3000/update/device'
refresh_url ='http://localhost:3000/refresh'
name = 'Dell Laptop'
imgUrl = 'https://i.pcmag.com/imagery/roundups/04OtgLS2CSnpQsNfHODkh5S-1.fit_lim.size_1200x630.v1569470764.jpg'

url = 'http://localhost:3000/enterlog/upload'


'''                                         '''


'''               FOR BROKER                '''
topic = 'servo'
client_id = 'python_client'
broker = '172.31.251.191' # đổi thành địa chỉ IP của mqtt broker
port = 1883 #
open_msg = json.dumps({'servo': True})
close_msg = json.dumps({'servo': False})

'''                                         '''


# lấy địa chỉ IP hiện tại của thiết bị
def get_current_ip():
    hostname = socket.gethostname()
    IPAddr = socket.gethostbyname(hostname)
    return IPAddr


# Đăng ký thiết bị với server.
def register_device(url, name, imgUrl):
    r = requests.post(url = url, json= {'name': name, 'imgUrl': imgUrl})
    return r.text

# Khởi động lại trạng thái thiết bị
def refresh_device(url, deviceId, delay):
    last_refresh = time.time()
    while True:
        if time.time() - last_refresh > delay:
            print(f'Refresh device after {delay} seconds')
            r = requests.patch(url= url, json = {'_id': deviceId})
            if r.status_code == 200:
                print('Refresh successful.')
            last_refresh = time.time()

# Tạo một thread riêng để tránh block
def refresh_thread(url, deviceId, delay):
    t = threading.Thread(target= refresh_device, args = [url, deviceId, delay], daemon=True)
    t.start()


# gửi request có chứa ảnh
def send_img_request(url, data):
    r = requests.post(url = url, files = data)
    print(r)
    print('Send image reqest')

# tạo multiform-data có chứa ảnh
def create_data(img, ip, deviceID):
    img_encoded = cv2.imencode('.jpg', img)[1]
    name_img = 'img_' + str(round(time.time()))
    multipart_form_data = {
        'image': (name_img, img_encoded.tobytes()),
        'name': (None, 'Python User'),
        'attachTo': (None, deviceID),
        'ip': (None, ip)
    }
    return multipart_form_data

# Tạo thread riêng để gửi ảnh, do requests là đồng bộ
def sending_img_thread(url, data):
    t = threading.Thread(target = send_img_request, args= [url, data], daemon=True)
    t.start()

# kết nối với mqtt broker
def connect_mqtt():
    def on_connect(client, userdata, flags, rc):
        if rc == 0:
            print(f'Connect to broker {broker}:{port}')
        else:
            print(f'Fail to connect to broker')
    
    def on_disconnect(client, userdata, rc):
        if rc !=0:
            print(f'Disconnect from broker {broker}:{port}')
        
    client = mqtt_client.Client(client_id)
    client.on_disconnect = on_disconnect
    client.on_connect = on_connect # gán hàm
    # client.username_pw_set(username, password)
    
    client.connect(broker, port)        
    return client

# publish message lên mqtt
def publish(client, msg):
    result = client.publish(topic, msg)
     # we will the tuple (a,b)
    #print(f'Result: {result}')
    status = result[0]
    if status == 0:
        print(f'Send `{msg}` to topic `{topic}`')
    else:
        print(f'Fail to send message to topic `{topic}`')



open_delay = 10 # thời gian delay mở cổng
sending_img_delay = 20
is_open = False # trạng thái mở cổng/đóng cổng
is_sending_img = False # trạng thái đã gửi/ko gửi ảnh

last_open = time.time()
last_detect = time.time()
last_send_img = time.time()

detect_delay = 5
checking_delay = 5

def open_gate():
    if not is_open:
        publish(client, open_msg)
        is_open = True

    last_open = time.time()

def close_gate():
    if is_open:
        publish(client, close_msg)
        is_open = False

# Hàm main nơi mọi câu lệnh sẽ bất đầu 
if __name__ == '__main__':

    is_detect = False

    ip = get_current_ip() # lấy địa chỉ IP
    print(f'Your current IP: {ip}')

    deviceId = register_device(register_url, name, imgUrl) # lấy deviceId
    print(f'Your current Id: {deviceId}')
    
    #Khởi tạo thread riêng chạy refresh device
    refresh_thread(refresh_url, deviceId, 60)

    #Kết nối với mqtt
    client = connect_mqtt()
    client.loop_start()
   
    # Nạp các model xử lý ảnh
    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.read('trainer/trainer.yml')
    cascade = 'haarcascade_frontalface_default.xml'

    faceCascade = cv2.CascadeClassifier(cascade)
    font = cv2.FONT_HERSHEY_SIMPLEX

    id = 0
    names = ['', 'Cuong', '','','' ]

    cap = cv2.VideoCapture(0)
    cap.set(3, 640)
    cap.set(4, 480)

    minW = 0.1*cap.get(3)
    minH = 0.1*cap.get(4)

    unknow_person = ''

    
    last_check = time.time()

    results = []

    while True:
        ret, frame = cap.read()
        img = cv2.flip(frame, 1)
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        faces = faceCascade.detectMultiScale(
            gray,
            scaleFactor = 1.2,
            minNeighbors = 5,
            minSize = (int(minW), int (minH))
        )
     
        for (x, y, w, h) in faces: 
            cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)
            id, confidence = recognizer.predict(gray[y:y+h, x:x+w])
            #print(str(id) + " => " + str(confidence))

            # Nếu nhận diện là người quen, thì ta tiến hành mở cửa
            if (confidence < 80):
                id = names[id]
                confidence = " {0}".format(round(confidence))
                results.append('yes')
                # Cửa chưa mở => mở cửa
            
            # Nếu nhận diện là người 
            else:
                id = "unknown"
                confidence = " {0}".format(round(confidence))
                results.append('no')
                # if not is_sending_img:
                    #data = create_data(img, ip, deviceId)
                    #sending_img_thread(url, data)
                    # print('Sending image')
                    # is_sending_img = True
                unknow_person = img #
                
            cv2.putText(img, str(id), (x + 5, y - 5), font, 1, (255, 255, 255), 2)
            cv2.putText(img, str(confidence), (x + 5, y + h - 5), font, 1, (255, 255, 0), 1)
            
        # Nếu mở cửa quá hạn thì sẽ tự động đóng
        # if time.time() - last_open > open_delay and is_open:
        #     publish(client, close_msg)
        #     is_open = False
      
        if time.time() - last_send_img > sending_img_delay:
            is_sending_img = False

        if time.time() - last_check > checking_delay:
            print('Finish scaning')
            print(f'Total samples {len(results)}')
            if len(results) > 10:
                positive = results.count('yes') / len(results)
                if positive >= 0.9:
                    if not is_open:
                        publish(client, open_msg)
                        is_open = True
                    last_open = time.time()                               
                else:
                    if is_open:
                        publish(client, close_msg)
                        is_open = False
                    if not is_sending_img:
                        data = create_data(unknow_person, ip, deviceId)
                        sending_img_thread(url, data)
                        is_sending_img = True
                        last_send_img  = time.time()
                    
            else:
                if is_open:
                    publish(client, close_msg) 
                    is_open = False      
                  
            results = []
            last_check = time.time()
            
            
        cv2.imshow("Camera", img)
        key = cv2.waitKey(1) & 0xFF
	    # if the `q` key was pressed, break from the loop
        if key == ord("q"):
            break

    print("\nPress ESC to exit...")
    cap.release()
    cv2.destroyAllWindows()
                        
        

'''
reference:
json: https://www.geeksforgeeks.org/python-convert-json-to-string/
calculate time: https://stackoverflow.com/questions/3426870/calculating-time-difference
https://stackoverflow.com/questions/46563364/python-opencv-image-array-to-binary


'''