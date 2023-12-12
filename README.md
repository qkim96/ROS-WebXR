# ROS-WebXR Integration for Intuitive AR Robot Control

## About the Project
This project utilizes Robot Operating System (ROS) in conjunction with WebXR, a web-based Augmented Reality (AR) platform, to facilitate convenient interaction with robots through a web browser on any mobile devices.  
<br/>
The integration of ROS and WebXR optimizes user interactions with robots for non-experts by eliminating any process reliant on background knowledge in robot control or utilization of AR applications.  
<br/>
Improving human-robot interactions using Augmented Reality offers a better understanding of the robot perception. However, challenges in developing AR applications persist for both the developers and the users. Each time a developer modifies even a minor feature, recompilation is necessary, and users are required to download and comprehend the updated app. In addition, proficiency in ROS is also necessary for effective robot control, adding complexity to user engagement. Addressing these issues is crucial for enhancing the experience interacting with robots. This project aims to eliminate these challenges, thereby optimizing human-robot interactions.  
<br/>
By simply accessing a designated link, any users with a mobile device can teleoperate a robot with buttons on the screen and observe the LIDAR data displayed as AR.  
<br/>

## Simulation
For simulation, TurtleBot3 Burger is used in a Gazebo simulated environment.
<img src="https://raw.githubusercontent.com/qkim96/ROS-WebXR/main/image/screenshot_simulation.png" width=100% align="center"  />  
<br/>
<br/>
With any mobile device, the robot can be teleoperated with buttons on the screen, and the LIDAR data from the robot can be observed as AR.  
To view the AR display, a specific marker is used to specify where the robot is.  
When testing with real life robots, this marker will be physically attached to the robot.  
<img src="https://raw.githubusercontent.com/qkim96/ROS-WebXR/main/image/screenshot_mobile.PNG" width=50% align="center"  />  
<br/>
<br/>

## Getting Started

### Tested with:
* Ubuntu 20.04
* ROS Noetic
* iPhone 11 (iOS 16.3.1)
* Galaxy S8+ (Android 9)
* Chrome mobile (version 119.0.6045.169)
* Safari (version 16.3)
<br/>

### Prerequisites
```
sudo apt-get update
```
* Apache 2
```
sudo apt-get install apache2
```
* build-essential
```
sudo apt-get install build-essential
```
* rosbridge
```
sudo apt-get install ros-<rosdistro>-rosbridge-server
```
<br/>

### Steps
#### 1. Clone this repository
```
git clone https://github.com/qkim96/ROS-WebXR.git
```

#### 2. Clone required repositories
```
cd ROS-WebXR/src/ws/src/
git clone https://github.com/ROBOTIS-GIT/turtlebot3.git
git clone https://github.com/ROBOTIS-GIT/turtlebot3_msgs.git
git clone https://github.com/ROBOTIS-GIT/turtlebot3_simulations.git
cd ..
catkin_make
```

#### 3. Check your IP address with
```
hostname -I
```

#### 4. Edit line 58 of index_simulation.html file to your IP address.
```
var my_ip = "YOUR_IP_ADDRESS"
```

#### 5. Enable HTTPS protocol with Apache 2

&nbsp;&nbsp;&nbsp; - enable SSL
```
a2enmod ssl rewrite
```
&nbsp;&nbsp;&nbsp; - open configuration file
```
sudo nano /etc/apache2/apache2.conf
```
&nbsp;&nbsp;&nbsp; - and add these lines at the end of the file:
```
<Directory /var/www/html>
    AllowOverride All
</Directory>
```
&nbsp;&nbsp;&nbsp; - generate RSA private key
```
mkdir /etc/apache2/certificate
cd /etc/apache2/certificate
openssl req -new -newkey rsa:4096 -x509 -sha256 -days 365 -nodes -out apache-certificate.crt -keyout apache.key
```
&nbsp;&nbsp;&nbsp; - delete and create configuration file
```
rm /etc/apache2/sites-enabled/000-default.conf
sudo nano /etc/apache2/sites-enabled/000-default.conf
```
&nbsp;&nbsp;&nbsp; - and add these lines:
```
<VirtualHost *:443>
    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
    SSLEngine on
    SSLCertificateFile /etc/apache2/certificate/apache-certificate.crt
    SSLCertificateKeyFile /etc/apache2/certificate/apache.key
</VirtualHost>
```
&nbsp;&nbsp;&nbsp; - check the configuration files:
```
apache2ctl configtest
```

#### 6. Change permission of the RSA key
```
sudo chmod 644 /etc/apache2/certificate/apache-certificate.crt
sudo chmod 600 /etc/apache2/certificate/apache.key
```

#### 7. Change ownership of the RSA key
&nbsp;&nbsp;&nbsp; - check your user/group names
```
id
```
&nbsp;&nbsp;&nbsp; - this should print out
```
uid=1000(USERNAME) gid=1000(GROUPNAME) groups=1000(GROUPNAME),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),120(lpadmin),131(lxd),132(sambashare)
```
&nbsp;&nbsp;&nbsp; - change 'user' and 'group' to your user/group names
```
sudo chown user:group /etc/apache2/certificate/apache-certificate.crt
sudo chown user:group /etc/apache2/certificate/apache.key
```

#### 8. Set up firewall to allow ROS WebSocket (Port 9090), HTTP (Port 80), and HTTPS (Port 443) traffic
```
sudo ufw allow 9090
sudo ufw allow in "Apache Full"
sudo ufw reload
```

#### 9. Edit rosbridge launch file to enable SSL
&nbsp;&nbsp;&nbsp; - open the launch file
```
roscd rosbridge_server/launch/
sudo nano rosbridge_websocket.launch
```
&nbsp;&nbsp;&nbsp; - edit line 4-6
```
<arg name="ssl" default="true" />
<arg name="certfile" default="/etc/apache2/certificate/apache-certificate.crt" />
<arg name="keyfile" default="/etc/apache2/certificate/apache.key" />
```

#### 10. Set necessary environment variables
&nbsp;&nbsp;&nbsp; - on the device that will run roscore:
```
export ROS_MASTER_URI=http://YOUR_IP_ADDRESS:11311/
export ROS_IP=YOUR_IP_ADDRESS
```
&nbsp;&nbsp;&nbsp; - open bashrc file
```
gedit ~/.bashrc
```
&nbsp;&nbsp;&nbsp; - and add this line at the end of the file:
```
export TURTLEBOT3_MODEL=burger
```

#### 11. Run roscore
```
roscore
```

#### 12. Run rosbridge
```
roslaunch rosbridge_server rosbridge_websocket.launch
```
&nbsp;&nbsp; Make sure that the WebSocket server is started with wss and at port 9090 (wss://0.0.0.0:9090).

#### 13. Source setup.bash
```
. ~/PATH_TO_REPO/ROS-WebXR/src/ws/devel/setup.bash
```

#### 14. Run a launch file for simulation
```
roslaunch sim_test world1.launch
```
&nbsp;&nbsp; or
```
roslaunch sim_test world2.launch
```

#### 15. Copy HTML file to Apache default directory
```
cd ~/PATH_TO_REPO/ROS-WebXR/
sudo cp index_simulation.html /var/www/html/
```

#### 16. Host Apache HTTPS server
```
systemctl restart apache2; systemctl status apache2
```

#### 17. Run on mobile device
&nbsp;&nbsp; On any mobile device, connect to the same network as the host device and go to the link:  
&nbsp;&nbsp; https://HOST_IP_ADDRESS/FILE_NAME.html  
&nbsp;&nbsp; Ignore security warnings and proceed to the link.
