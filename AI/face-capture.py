import cv2
import os
import time
cap = cv2.VideoCapture(0)
cap.set(3, 640)
cap.set(4, 480)

img_count = 70
face_detector = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')

face_id = input('\nAdd your ID: ')
print('\nFace updating, please see into the camera....')

count = 1
print('Wait 2s.')
time.sleep(2)
while (True):
    ret, img = cap.read()

    img = cv2.flip(img, 1)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_detector.detectMultiScale(gray, 1.3, 5)

    for (x, y, w, h) in faces:
        cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)
  
        # user.1.27.jpg
        cv2.imwrite("dataset/user." + str(face_id) + "." + str(count) + ".jpg", gray[y:y+h, x:x+w])
        
        count += 1
    
    cv2.imshow("image", img)

    key = cv2.waitKey(1) & 0xFF
    if key == ord("q"):
        break
    elif count >= img_count:
       break

print("\nPress ESC to exit...")
cap.release()
cv2.destroyAllWindows()
