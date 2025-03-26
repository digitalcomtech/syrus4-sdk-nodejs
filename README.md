# Syrus 4 SDK for nodejs
Interactive function to consult enable or disable multiple modules for APEX OS

## Quick Start
Install using npm github
```bash
$ npm install https://github.com/dctdevelop/syrus4-nodejs/tarball/master
```


## Modules

<dl>
<dt><a href="#module_Accelerometer">Accelerometer</a></dt>
<dd><p>Accelerometer module get information about hardware acceleration and events in ApexOS</p>
</dd>
<dt><a href="#module_Apps">Apps</a></dt>
<dd><p>Apps module to start/stop/enable/disable/install third parts apps running in apex-os</p>
</dd>
<dt><a href="#module_Bluetooth">Bluetooth</a></dt>
<dd><p>Bluetooth module, get information about bluetooth state</p>
</dd>
<dt><a href="#module_Counters">Counters</a></dt>
<dd><p>Counters module setup get and set counters from APEX OS</p>
</dd>
<dt><a href="#module_Database">Database</a></dt>
<dd><p>Logrotate module setup get and set counters from APEX OS</p>
</dd>
<dt><a href="#module_ECU">ECU</a></dt>
<dd><p>ECU module get information about EcU monitor and vehicle in ApexOS</p>
</dd>
<dt><a href="#module_Fatigue">Fatigue</a></dt>
<dd><p>Fatigue module, get fatigue sensor information and events</p>
</dd>
<dt><a href="#module_GPS">GPS</a></dt>
<dd><p>GPS module get information about gps and location in ApexOS</p>
</dd>
<dt><a href="#module_Geofences">Geofences</a></dt>
<dd><p>Geofences module</p>
</dd>
<dt><a href="#module_Hotspot">Hotspot</a></dt>
<dd><p>Hotspot module to interacte with the enable/disable Hotspot mode  with Apex OS</p>
</dd>
<dt><a href="#module_IButton">IButton</a></dt>
<dd><p>IButton module get information about onewire</p>
</dd>
<dt><a href="#module_IOExpander">IOExpander</a></dt>
<dd><p>Logrotate module setup get and set counters from APEX OS</p>
</dd>
<dt><a href="#module_IOS">IOS</a></dt>
<dd><p>IOS module allow to get and set status from Input and Outputs in Syrus 4 Apex OS</p>
</dd>
<dt><a href="#module_Logrotate">Logrotate</a></dt>
<dd><p>Logrotate module setup get and set counters from APEX OS</p>
</dd>
<dt><a href="#module_Network">Network</a></dt>
<dd><p>Network module get information about networks and events in ApexOS</p>
</dd>
<dt><a href="#module_PeopleCounter">PeopleCounter</a></dt>
<dd><p>PeopleCounter module setup get and set Safe engine cut of from APEX OS</p>
</dd>
<dt><a href="#module_PulseCounter">PulseCounter</a></dt>
<dd><p>Logrotate module setup get and set counters from APEX OS</p>
</dd>
<dt><a href="#module_RFID">RFID</a></dt>
<dd><p>RFID module get information about RFID states</p>
</dd>
<dt><a href="#module_SafeEngine">SafeEngine</a></dt>
<dd><p>SafeEngine module setup get and set Safe engine cut of from APEX OS</p>
</dd>
<dt><a href="#module_Serial">Serial</a></dt>
<dd><p>Serial module, get information about serial state</p>
</dd>
<dt><a href="#module_System-Info">System-Info</a></dt>
<dd><p>System module get information about ApexOS</p>
</dd>
<dt><a href="#module_Technoton">Technoton</a></dt>
<dd><p>Technoton module get information about Technoton fuel level</p>
</dd>
<dt><a href="#module_Temperature">Temperature</a></dt>
<dd><p>Temperature module get information about temperature sensors</p>
</dd>
<dt><a href="#module_Update">Update</a></dt>
<dd><p>Update module check for update and make update for ApexOS</p>
</dd>
<dt><a href="#module_Utils">Utils</a></dt>
<dd><p>Utils module some utlities in ApexOS</p>
</dd>
<dt><a href="#module_WIFI">WIFI</a></dt>
<dd><p>WIFI module to interacte with the enable/disable WIFI mode  with Apex OS</p>
</dd>
<dt><a href="#module_Windows">Windows</a></dt>
<dd><p>Time Windows module setup get and set counters from APEX OS</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#getInfo">getInfo()</a></dt>
<dd><p>returns a JSON with the configured values in RF</p>
</dd>
<dt><a href="#set">set(key, value)</a></dt>
<dd><p>Use this option to configure the network variable for mobile networks</p>
</dd>
</dl>

<a name="module_Accelerometer"></a>

## Accelerometer
Accelerometer module get information about hardware acceleration and events in ApexOS


* [Accelerometer](#module_Accelerometer)
    * [~onMotionChange(callback, errorCallback)](#module_Accelerometer..onMotionChange)
    * [~on(callback, errorCallback)](#module_Accelerometer..on)
    * [~startAutoAlignment(state)](#module_Accelerometer..startAutoAlignment)
    * [~startSelfAccelerationTest(state)](#module_Accelerometer..startSelfAccelerationTest)
    * [~isAutoAligning()](#module_Accelerometer..isAutoAligning)
    * [~isAccelerationTest()](#module_Accelerometer..isAccelerationTest)
    * [~isMoving()](#module_Accelerometer..isMoving)

<a name="module_Accelerometer..onMotionChange"></a>

### Accelerometer~onMotionChange(callback, errorCallback)
Watch the motion state of the Syrus Apex accceleration hardware module

**Kind**: inner method of [<code>Accelerometer</code>](#module_Accelerometer)  

| Param | Description |
| --- | --- |
| callback | callback to executed when motion state changes |
| errorCallback | callback to execute in case of error |

<a name="module_Accelerometer..on"></a>

### Accelerometer~on(callback, errorCallback)
Watch for accelerations events in Apex OS. possible events:
FORWARD_COLLISION, BACKWARD_COLLISION, LAT_COLLISION_FROM_RIGHT, LAT_COLLISION_FROM_LEFT, HARSH_FWD_ACCELERATION, HARD_BRAKING, CORNERING_RIGHT, CORNERING_LEFT

**Kind**: inner method of [<code>Accelerometer</code>](#module_Accelerometer)  

| Param | Description |
| --- | --- |
| callback | callback to executed when new acceleration event received |
| errorCallback | callback to execute in case of error |

<a name="module_Accelerometer..startAutoAlignment"></a>

### Accelerometer~startAutoAlignment(state)
Set the state for the auto alignment procces of the APEX OS acceleration hardware

**Kind**: inner method of [<code>Accelerometer</code>](#module_Accelerometer)  

| Param | Default | Description |
| --- | --- | --- |
| state | <code>true</code> | desired state of auto alignment proccess |

<a name="module_Accelerometer..startSelfAccelerationTest"></a>

### Accelerometer~startSelfAccelerationTest(state)
Set the state for the self acceleration test of the APEX OS acceleration hardware

**Kind**: inner method of [<code>Accelerometer</code>](#module_Accelerometer)  

| Param | Default | Description |
| --- | --- | --- |
| state | <code>true</code> | desired state of self acceleration test proccess |

<a name="module_Accelerometer..isAutoAligning"></a>

### Accelerometer~isAutoAligning()
check is hardware is on state auto aligning returns a promise with the state

**Kind**: inner method of [<code>Accelerometer</code>](#module_Accelerometer)  
<a name="module_Accelerometer..isAccelerationTest"></a>

### Accelerometer~isAccelerationTest()
check is hardware is on state acceleration test returns a promise with the state

**Kind**: inner method of [<code>Accelerometer</code>](#module_Accelerometer)  
<a name="module_Accelerometer..isMoving"></a>

### Accelerometer~isMoving()
Check the current state of the acceloremeter hardware is moving

**Kind**: inner method of [<code>Accelerometer</code>](#module_Accelerometer)  
<a name="module_Apps"></a>

## Apps
Apps module to start/stop/enable/disable/install third parts apps running in apex-os


* [Apps](#module_Apps)
    * [~execute(action, app, zipPath, instance)](#module_Apps..execute)
    * [~installApp(app, zipPath)](#module_Apps..installApp)
    * [~uninstallApp(app, ver)](#module_Apps..uninstallApp)
    * [~listApps()](#module_Apps..listApps) ⇒
    * [~createInstance(name, app, ver)](#module_Apps..createInstance) ⇒
    * [~deleteInstance(name, ver)](#module_Apps..deleteInstance) ⇒
    * [~listInstances()](#module_Apps..listInstances) ⇒
    * [~startInstance(name)](#module_Apps..startInstance) ⇒
    * [~stopInstance(name)](#module_Apps..stopInstance) ⇒
    * [~restartInstance(name)](#module_Apps..restartInstance) ⇒
    * [~setConfiguration(app, newConfig)](#module_Apps..setConfiguration)
    * [~getConfiguration(app)](#module_Apps..getConfiguration)

<a name="module_Apps..execute"></a>

### Apps~execute(action, app, zipPath, instance)
allows to execute commands from the apps-manager utility from ApexOs

**Kind**: inner method of [<code>Apps</code>](#module_Apps)  

| Param | Default | Description |
| --- | --- | --- |
| action |  | action to execute |
| app | <code></code> | the name of the App |
| zipPath | <code></code> | the zip location under where unzip the app |
| instance | <code></code> |  |

<a name="module_Apps..installApp"></a>

### Apps~installApp(app, zipPath)
Allows to install an app receive as parameter the name of the app and the zip
 location or the data of the zip in question.

**Kind**: inner method of [<code>Apps</code>](#module_Apps)  

| Param | Description |
| --- | --- |
| app | the name of the app |
| zipPath | the zip location |

<a name="module_Apps..uninstallApp"></a>

### Apps~uninstallApp(app, ver)
Uninstall and deletes the data from an app

**Kind**: inner method of [<code>Apps</code>](#module_Apps)  

| Param | Description |
| --- | --- |
| app | the name of the app |
| ver |  |

<a name="module_Apps..listApps"></a>

### Apps~listApps() ⇒
Lists all the installed applications.

This function executes the "list-apps" action using the `execute` function
from the `Utils` module. It returns a promise that resolves with the result
of the command execution.

**Kind**: inner method of [<code>Apps</code>](#module_Apps)  
**Returns**: A promise that resolves with the list of installed applications.  
<a name="module_Apps..createInstance"></a>

### Apps~createInstance(name, app, ver) ⇒
Creates an instance of an application.

This function executes the "create-instance" action using the `execute` function
from the `Utils` module. It returns a promise that resolves with the result
of the command execution.

**Kind**: inner method of [<code>Apps</code>](#module_Apps)  
**Returns**: A promise that resolves with the result of the instance creation.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the instance to create. |
| app | <code>string</code> | The name of the application. |
| ver | <code>string</code> | The version of the application. |

<a name="module_Apps..deleteInstance"></a>

### Apps~deleteInstance(name, ver) ⇒
Deletes an instance of an application.

This function executes the "delete-instance" action using the `execute` function
from the `Utils` module. It returns a promise that resolves with the result
of the instance deletion.

**Kind**: inner method of [<code>Apps</code>](#module_Apps)  
**Returns**: A promise that resolves with the result of the instance deletion.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the instance to delete. |
| ver | <code>string</code> | The version of the instance. |

<a name="module_Apps..listInstances"></a>

### Apps~listInstances() ⇒
Lists all instances of an application.

This function executes the "list-instances" action using the `execute` function
from the `Utils` module. It returns a promise that resolves with the list of instances.

**Kind**: inner method of [<code>Apps</code>](#module_Apps)  
**Returns**: A promise that resolves with the list of instances.  
<a name="module_Apps..startInstance"></a>

### Apps~startInstance(name) ⇒
Starts an instance of an application.

This function executes the "start-instance" action using the `execute` function
from the `Utils` module. It returns a promise that resolves with the result
of starting the instance.

**Kind**: inner method of [<code>Apps</code>](#module_Apps)  
**Returns**: A promise that resolves with the result of starting the instance.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the instance to start. |

<a name="module_Apps..stopInstance"></a>

### Apps~stopInstance(name) ⇒
Stops an instance of an application.

This function executes the "stop-instance" action using the `execute` function
from the `Utils` module. It returns a promise that resolves with the result
of stopping the instance.

**Kind**: inner method of [<code>Apps</code>](#module_Apps)  
**Returns**: A promise that resolves with the result of stopping the instance.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the instance to stop. |

<a name="module_Apps..restartInstance"></a>

### Apps~restartInstance(name) ⇒
Restarts an instance of an application.

This function executes the "restart-instance" action using the `execute` function
from the `Utils` module. It returns a promise that resolves with the result
of restarting the instance.

**Kind**: inner method of [<code>Apps</code>](#module_Apps)  
**Returns**: A promise that resolves with the result of restarting the instance.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | The name of the instance to restart. |

<a name="module_Apps..setConfiguration"></a>

### Apps~setConfiguration(app, newConfig)
write .env file configuration of the app, if the .env exists, replace it

**Kind**: inner method of [<code>Apps</code>](#module_Apps)  

| Param | Description |
| --- | --- |
| app | the name of the app |
| newConfig |  |

<a name="module_Apps..getConfiguration"></a>

### Apps~getConfiguration(app)
Get the contents of SYRUS4G_APP_CONF_FILE file where it stored the configuration of the app

**Kind**: inner method of [<code>Apps</code>](#module_Apps)  

| Param | Description |
| --- | --- |
| app | the name of the app |

<a name="module_Bluetooth"></a>

## Bluetooth
Bluetooth module, get information about bluetooth state

<a name="module_Counters"></a>

## Counters
Counters module setup get and set counters from APEX OS

<a name="module_Database"></a>

## Database
Logrotate module setup get and set counters from APEX OS

<a name="module_ECU"></a>

## ECU
ECU module get information about EcU monitor and vehicle in ApexOS


* [ECU](#module_ECU)
    * [~getECUInfo()](#module_ECU..getECUInfo)
    * [~watchECUParams(cb, errorCallback)](#module_ECU..watchECUParams)
    * [~getECUParams()](#module_ECU..getECUParams)
    * [~getECUList()](#module_ECU..getECUList)

<a name="module_ECU..getECUInfo"></a>

### ECU~getECUInfo()
ECU PARAM LIST from the ecu monitor

**Kind**: inner method of [<code>ECU</code>](#module_ECU)  
<a name="module_ECU..watchECUParams"></a>

### ECU~watchECUParams(cb, errorCallback)
allows to subscribe for ECU parameter changes

**Kind**: inner method of [<code>ECU</code>](#module_ECU)  

| Param | Description |
| --- | --- |
| cb | calbback to execute when new ECU data arrives |
| errorCallback | errorCallback when something wrong goes with the subscription |

<a name="module_ECU..getECUParams"></a>

### ECU~getECUParams()
Get all the most recent data from ECU parameters

**Kind**: inner method of [<code>ECU</code>](#module_ECU)  
<a name="module_ECU..getECUList"></a>

### ECU~getECUList()
get ecu paramas list associated to all the pgn and id for ecu and taip tag associated

**Kind**: inner method of [<code>ECU</code>](#module_ECU)  
<a name="module_Fatigue"></a>

## Fatigue
Fatigue module, get fatigue sensor information and events

<a name="module_GPS"></a>

## GPS
GPS module get information about gps and location in ApexOS


* [GPS](#module_GPS)
    * [~distanceBetweenCoordinates(coord1, coord2)](#module_GPS..distanceBetweenCoordinates)
    * [~getCurrentPosition()](#module_GPS..getCurrentPosition)
    * [~watchPosition(callback, errorCallback, config)](#module_GPS..watchPosition)
    * [~watchGPS(callback, errorCallback)](#module_GPS..watchGPS)
    * [~watchTrackingResolution(callback, opts)](#module_GPS..watchTrackingResolution)
    * [~getActiveTrackingsResolutions(prefixed)](#module_GPS..getActiveTrackingsResolutions)
    * [~setTrackingResolution(opts)](#module_GPS..setTrackingResolution)
    * [~getTrackingResolution(opts)](#module_GPS..getTrackingResolution)

<a name="module_GPS..distanceBetweenCoordinates"></a>

### GPS~distanceBetweenCoordinates(coord1, coord2)
return distance in km between two coordinates points

**Kind**: inner method of [<code>GPS</code>](#module_GPS)  

| Param | Description |
| --- | --- |
| coord1 | first coordinate to calculate the distance |
| coord2 | second coordinate to calculate the distance |

<a name="module_GPS..getCurrentPosition"></a>

### GPS~getCurrentPosition()
Get last current location from GPS

**Kind**: inner method of [<code>GPS</code>](#module_GPS)  
<a name="module_GPS..watchPosition"></a>

### GPS~watchPosition(callback, errorCallback, config)
allows to subscribe to position events in GPS module

**Kind**: inner method of [<code>GPS</code>](#module_GPS)  

| Param | Description |
| --- | --- |
| callback | handler to execute when new gps position arrives |
| errorCallback | Errorcallback executes when is unable to get gps location |
| config | Object coniguration how evaluate criteria for watchPosition |

<a name="module_GPS..watchGPS"></a>

### GPS~watchGPS(callback, errorCallback)
allows to subscribe to gps data changes in GPS module

**Kind**: inner method of [<code>GPS</code>](#module_GPS)  

| Param | Description |
| --- | --- |
| callback | handler to execute when new gps data arrives |
| errorCallback | Errorcallback executes when is unable to get gps location |

<a name="module_GPS..watchTrackingResolution"></a>

### GPS~watchTrackingResolution(callback, opts)
define a tracking resolution using apx-tracking tool to receive filtered data gps

**Kind**: inner method of [<code>GPS</code>](#module_GPS)  

| Param | Description |
| --- | --- |
| callback | callback to execute when new data arrive from tracking resolution |
| opts | tracking_resolution: *  namespace: The name used as a reference to identify a tracking criteria.          * *Max 30 characters     * *   heading:     The heading threshold for triggering notifications based on heading   * *changes. Use 0 to disable. Range (0 - 180)            * *   time:        The time limit in seconds for triggering tracking notifications.      * *Use 0 to disable. Range (0 - 86400)   * *   distance:    The distance threshold in meters for triggering tracking              * *notifications based on the traveled distance. Use 0 to disable.       * *Range (0 - 100000) |

<a name="module_GPS..getActiveTrackingsResolutions"></a>

### GPS~getActiveTrackingsResolutions(prefixed)
get all the active tracking resolutions`in the apex tol apx-tracking

**Kind**: inner method of [<code>GPS</code>](#module_GPS)  

| Param | Description |
| --- | --- |
| prefixed | prefix to lookup tracking_resolution |

<a name="module_GPS..setTrackingResolution"></a>

### GPS~setTrackingResolution(opts)
set options for a tracking_resolution for the apex tool apx-tracking

**Kind**: inner method of [<code>GPS</code>](#module_GPS)  

| Param | Description |
| --- | --- |
| opts | tracking_resolution: *  namespace: The name used as a reference to identify a tracking criteria.          * *Max 30 characters     * *   heading:     The heading threshold for triggering notifications based on heading   * *changes. Use 0 to disable. Range (0 - 180)            * *   time:        The time limit in seconds for triggering tracking notifications.      * *Use 0 to disable. Range (0 - 86400)   * *   distance:    The distance threshold in meters for triggering tracking              * *notifications based on the traveled distance. Use 0 to disable.       * *Range (0 - 100000) |

<a name="module_GPS..getTrackingResolution"></a>

### GPS~getTrackingResolution(opts)
get options for a tracking_resolution for the apex tool apx-tracking

**Kind**: inner method of [<code>GPS</code>](#module_GPS)  

| Param | Description |
| --- | --- |
| opts | tracking_resolution: *  namespace: The name used as a reference to identify a tracking criteria. |

<a name="module_Geofences"></a>

## Geofences
Geofences module


* [Geofences](#module_Geofences)
    * [~addGeofence(opts)](#module_Geofences..addGeofence)
    * [~updateGeofence(opts)](#module_Geofences..updateGeofence)
    * [~removeGeofence(opts)](#module_Geofences..removeGeofence)
    * [~getNamespaces()](#module_Geofences..getNamespaces) ⇒ <code>\*</code>
    * [~get(opts)](#module_Geofences..get)
    * [~getAll(opts)](#module_Geofences..getAll)
    * [~deleteAll(opts)](#module_Geofences..deleteAll)
    * [~watchGeofencesSpeedLimits(callback, errorCb, opts)](#module_Geofences..watchGeofencesSpeedLimits)
    * [~watchGeofences(callback, errorCb, opts)](#module_Geofences..watchGeofences)
    * [~watchGroups(callback, errorCb, opts)](#module_Geofences..watchGroups)

<a name="module_Geofences..addGeofence"></a>

### Geofences~addGeofence(opts)
Add Geofence to the apx-tool

**Kind**: inner method of [<code>Geofences</code>](#module_Geofences)  

| Param | Description |
| --- | --- |
| opts | options hash name: name of the fence; lngLats: array of (lon,lat) coordinate pairs; group: group name; namespace: namespace; type: geofence type could be circular or poly; radius: radius for circular fences, in meters, must be >= 50; |

<a name="module_Geofences..updateGeofence"></a>

### Geofences~updateGeofence(opts)
Update Geofence to the apx-tool

**Kind**: inner method of [<code>Geofences</code>](#module_Geofences)  

| Param | Description |
| --- | --- |
| opts | options hash name: name of the fence; lngLats: array of (lon,lat) coordinate pairs; group: group name; namespace: namespace; type: geofence type could be circular or poly; radius: radius for circular fences, in meters, must be >= 50; |

<a name="module_Geofences..removeGeofence"></a>

### Geofences~removeGeofence(opts)
Remove Geofence from the apx-tool

**Kind**: inner method of [<code>Geofences</code>](#module_Geofences)  

| Param | Description |
| --- | --- |
| opts | options hash name: name of the fence; group: group name; namespace: namespace; |

<a name="module_Geofences..getNamespaces"></a>

### Geofences~getNamespaces() ⇒ <code>\*</code>
get all available namespaces

**Kind**: inner method of [<code>Geofences</code>](#module_Geofences)  
<a name="module_Geofences..get"></a>

### Geofences~get(opts)
Get geofence state from the apx-tool

**Kind**: inner method of [<code>Geofences</code>](#module_Geofences)  

| Param | Description |
| --- | --- |
| opts | options hash name: name of the fence; namespace: namespace; |

<a name="module_Geofences..getAll"></a>

### Geofences~getAll(opts)
Get states from all Geofences for a given namespace

**Kind**: inner method of [<code>Geofences</code>](#module_Geofences)  

| Param | Description |
| --- | --- |
| opts | options hash namespace: namespace that belongs of geofence; |

<a name="module_Geofences..deleteAll"></a>

### Geofences~deleteAll(opts)
remove all Geofences from the namespace

**Kind**: inner method of [<code>Geofences</code>](#module_Geofences)  

| Param | Description |
| --- | --- |
| opts | options hash namespace: namespace that belongs of geofence; |

<a name="module_Geofences..watchGeofencesSpeedLimits"></a>

### Geofences~watchGeofencesSpeedLimits(callback, errorCb, opts)
**Kind**: inner method of [<code>Geofences</code>](#module_Geofences)  

| Param | Description |
| --- | --- |
| callback | callback to execute when the device enters or exits from a geofence |
| errorCb | error callback to execute if there is an unexpected error |
| opts | options hash namespace: namespace to check if entered or exited from geofence; |

<a name="module_Geofences..watchGeofences"></a>

### Geofences~watchGeofences(callback, errorCb, opts)
**Kind**: inner method of [<code>Geofences</code>](#module_Geofences)  

| Param | Description |
| --- | --- |
| callback | callback to execute when the device enters or exits from a geofence |
| errorCb | error callback to execute if there is an unexpected error |
| opts | options hash namespace: namespace to check if entered or exited from geofence; |

<a name="module_Geofences..watchGroups"></a>

### Geofences~watchGroups(callback, errorCb, opts)
**Kind**: inner method of [<code>Geofences</code>](#module_Geofences)  

| Param | Description |
| --- | --- |
| callback | callback to execute when the device enters or exits a geofence group |
| errorCb | error callback to execute if something fails |
| opts | namespace: namespace to check if entered or exited from group of geofence; |

<a name="module_Hotspot"></a>

## Hotspot
Hotspot module to interacte with the enable/disable Hotspot mode  with Apex OS


* [Hotspot](#module_Hotspot)
    * [~list()](#module_Hotspot..list)
    * [~state()](#module_Hotspot..state)
    * [~start()](#module_Hotspot..start)
    * [~stop()](#module_Hotspot..stop)
    * [~reset()](#module_Hotspot..reset)
    * [~route(netInterface)](#module_Hotspot..route)
    * [~edit(parameter, newValue)](#module_Hotspot..edit)

<a name="module_Hotspot..list"></a>

### Hotspot~list()
returns the list of the connected clients to the hotspot

**Kind**: inner method of [<code>Hotspot</code>](#module_Hotspot)  
<a name="module_Hotspot..state"></a>

### Hotspot~state()
returns the state of the connected clients to the hotspot

**Kind**: inner method of [<code>Hotspot</code>](#module_Hotspot)  
<a name="module_Hotspot..start"></a>

### Hotspot~start()
start the hotspot service, also stop wifi service

**Kind**: inner method of [<code>Hotspot</code>](#module_Hotspot)  
<a name="module_Hotspot..stop"></a>

### Hotspot~stop()
stops the hotspot service

**Kind**: inner method of [<code>Hotspot</code>](#module_Hotspot)  
<a name="module_Hotspot..reset"></a>

### Hotspot~reset()
executes a stop-start in the same call

**Kind**: inner method of [<code>Hotspot</code>](#module_Hotspot)  
<a name="module_Hotspot..route"></a>

### Hotspot~route(netInterface)
Use this option for forwarding the wlan traffic to another interface, it allows you to have internet access by specifying the output interface

**Kind**: inner method of [<code>Hotspot</code>](#module_Hotspot)  

| Param | Default | Description |
| --- | --- | --- |
| netInterface | <code>ppp0</code> | Interface you ant allow internet access default="ppp0" |

<a name="module_Hotspot..edit"></a>

### Hotspot~edit(parameter, newValue)
edits the parameter received in the hotspot configuration file. <br>
Example apx-hotspot edit wpa_passphrase myNewPass1234
Possible Values: "wpa_passphrase" | "ssid" | "max_num_sta" | "channel" | "wpa_key_mgmt"

**Kind**: inner method of [<code>Hotspot</code>](#module_Hotspot)  

| Param | Default | Description |
| --- | --- | --- |
| parameter | <code>wpa_passphrase</code> | param to edit config |
| newValue |  | new value for the parameter |

<a name="module_IButton"></a>

## IButton
IButton module get information about onewire


* [IButton](#module_IButton)
    * [~IButtonUpdate](#module_IButton..IButtonUpdate)
        * [new IButtonUpdate()](#new_module_IButton..IButtonUpdate_new)
    * [~getIButtons()](#module_IButton..getIButtons)
    * [~getIButton()](#module_IButton..getIButton)
    * [~setIButtonAlias()](#module_IButton..setIButtonAlias)
    * [~removeIButtonAlias()](#module_IButton..removeIButtonAlias)
    * [~onIButtonChange()](#module_IButton..onIButtonChange)

<a name="module_IButton..IButtonUpdate"></a>

### IButton~IButtonUpdate
**Kind**: inner class of [<code>IButton</code>](#module_IButton)  
<a name="new_module_IButton..IButtonUpdate_new"></a>

#### new IButtonUpdate()
Event published by the sdk composed of of multiple IButtonEvent
authorized contains events from whitelisted ibuttons

<a name="module_IButton..getIButtons"></a>

### IButton~getIButtons()
allow to get al lthe state of the ibuttons connected

**Kind**: inner method of [<code>IButton</code>](#module_IButton)  
<a name="module_IButton..getIButton"></a>

### IButton~getIButton()
allow to get al lthe state of the ibuttons connected

**Kind**: inner method of [<code>IButton</code>](#module_IButton)  
<a name="module_IButton..setIButtonAlias"></a>

### IButton~setIButtonAlias()
allow to get al lthe state of the ibuttons connected

**Kind**: inner method of [<code>IButton</code>](#module_IButton)  
<a name="module_IButton..removeIButtonAlias"></a>

### IButton~removeIButtonAlias()
remove Alias from ibutton whitelist

**Kind**: inner method of [<code>IButton</code>](#module_IButton)  
<a name="module_IButton..onIButtonChange"></a>

### IButton~onIButtonChange()
monitor iButton notifications

**Kind**: inner method of [<code>IButton</code>](#module_IButton)  
<a name="module_IOExpander"></a>

## IOExpander
Logrotate module setup get and set counters from APEX OS

<a name="module_IOS"></a>

## IOS
IOS module allow to get and set status from Input and Outputs in Syrus 4 Apex OS


* [IOS](#module_IOS)
    * [~watchInputState(inputName, cb, errorCallback)](#module_IOS..watchInputState)
    * [~getInputState(inputName)](#module_IOS..getInputState)
    * [~setOutputState(inputName, state)](#module_IOS..setOutputState)
    * [~getAll()](#module_IOS..getAll)

<a name="module_IOS..watchInputState"></a>

### IOS~watchInputState(inputName, cb, errorCallback)
Allow to subcribe to changes in a input or output accepts sub patterns

**Kind**: inner method of [<code>IOS</code>](#module_IOS)  

| Param | Default | Description |
| --- | --- | --- |
| inputName | <code>*</code> | input or patter to subscribe |
| cb |  | callback execute everytime the input state changed, first argument contains the new state |
| errorCallback |  |  |

<a name="module_IOS..getInputState"></a>

### IOS~getInputState(inputName)
get a promise that resolve the current input or output state

**Kind**: inner method of [<code>IOS</code>](#module_IOS)  

| Param | Default | Description |
| --- | --- | --- |
| inputName | <code>IGN</code> | the input/output requested |

<a name="module_IOS..setOutputState"></a>

### IOS~setOutputState(inputName, state)
Allow to change the state of an output

**Kind**: inner method of [<code>IOS</code>](#module_IOS)  

| Param | Default | Description |
| --- | --- | --- |
| inputName | <code>OUT1</code> | the output to change state |
| state | <code>true</code> | the new state  of the output |

<a name="module_IOS..getAll"></a>

### IOS~getAll()
Get the current state of all inputs, outputs and analogs in the Syrus4 device

**Kind**: inner method of [<code>IOS</code>](#module_IOS)  
<a name="module_Logrotate"></a>

## Logrotate
Logrotate module setup get and set counters from APEX OS

<a name="module_Network"></a>

## Network
Network module get information about networks and events in ApexOS


* [Network](#module_Network)
    * [~onNetworkChange(callback, errorCallback)](#module_Network..onNetworkChange)
    * [~getActiveNetwork()](#module_Network..getActiveNetwork)
    * [~getNetworkInfo(net)](#module_Network..getNetworkInfo)
    * [~getNetworks()](#module_Network..getNetworks)

<a name="module_Network..onNetworkChange"></a>

### Network~onNetworkChange(callback, errorCallback)
Watch the network state change

**Kind**: inner method of [<code>Network</code>](#module_Network)  

| Param | Description |
| --- | --- |
| callback | callback to executed when network state changes |
| errorCallback | callback to execute in case of error |

<a name="module_Network..getActiveNetwork"></a>

### Network~getActiveNetwork()
get the current state of the network of the APEX OS, returns a promise with the info

**Kind**: inner method of [<code>Network</code>](#module_Network)  
<a name="module_Network..getNetworkInfo"></a>

### Network~getNetworkInfo(net)
get Network Information about specific network

**Kind**: inner method of [<code>Network</code>](#module_Network)  

| Param | Description |
| --- | --- |
| net | network that want to know the information valid options are: eth0, ppp0, wlan0 |

<a name="module_Network..getNetworks"></a>

### Network~getNetworks()
get network information about all the available networks on APEX OS

**Kind**: inner method of [<code>Network</code>](#module_Network)  
<a name="module_PeopleCounter"></a>

## PeopleCounter
PeopleCounter module setup get and set Safe engine cut of from APEX OS

<a name="module_PulseCounter"></a>

## PulseCounter
Logrotate module setup get and set counters from APEX OS

<a name="module_RFID"></a>

## RFID
RFID module get information about RFID states


* [RFID](#module_RFID)
    * [~RFIDUpdate](#module_RFID..RFIDUpdate)
        * [new RFIDUpdate()](#new_module_RFID..RFIDUpdate_new)

<a name="module_RFID..RFIDUpdate"></a>

### RFID~RFIDUpdate
**Kind**: inner class of [<code>RFID</code>](#module_RFID)  
<a name="new_module_RFID..RFIDUpdate_new"></a>

#### new RFIDUpdate()
Event published by the sdk composed of multiple RFID
authorized contains events from RFID

<a name="module_SafeEngine"></a>

## SafeEngine
SafeEngine module setup get and set Safe engine cut of from APEX OS

<a name="module_Serial"></a>

## Serial
Serial module, get information about serial state


* [Serial](#module_Serial)
    * [~getSerialMode()](#module_Serial..getSerialMode)
    * [~setSerialMode()](#module_Serial..setSerialMode)
    * [~getSerialModemState()](#module_Serial..getSerialModemState)
    * [~getModemBufferSize()](#module_Serial..getModemBufferSize)
    * [~setModemBufferSize()](#module_Serial..setModemBufferSize)
    * [~send()](#module_Serial..send)

<a name="module_Serial..getSerialMode"></a>

### Serial~getSerialMode()
get serial mode: Promise<"console"|"modem"|"unmanaged"|"rfid"|"mdt"|"faitgue_sensor"|"fuel_sensor"|"user">

**Kind**: inner method of [<code>Serial</code>](#module_Serial)  
<a name="module_Serial..setSerialMode"></a>

### Serial~setSerialMode()
set serial mode (console or modem)

**Kind**: inner method of [<code>Serial</code>](#module_Serial)  
<a name="module_Serial..getSerialModemState"></a>

### Serial~getSerialModemState()
get serial modem state

**Kind**: inner method of [<code>Serial</code>](#module_Serial)  
<a name="module_Serial..getModemBufferSize"></a>

### Serial~getModemBufferSize()
get modem buffer size

**Kind**: inner method of [<code>Serial</code>](#module_Serial)  
<a name="module_Serial..setModemBufferSize"></a>

### Serial~setModemBufferSize()
set the buffer size

**Kind**: inner method of [<code>Serial</code>](#module_Serial)  
<a name="module_Serial..send"></a>

### Serial~send()
send a message

**Kind**: inner method of [<code>Serial</code>](#module_Serial)  
<a name="module_System-Info"></a>

## System-Info
System module get information about ApexOS


* [System-Info](#module_System-Info)
    * [~info()](#module_System-Info..info)
    * [~modem()](#module_System-Info..modem)
    * [~onSleepOn(callback, errorCallback)](#module_System-Info..onSleepOn)
    * [~getLastWakeUp()](#module_System-Info..getLastWakeUp)
    * [~getlastSleepOn()](#module_System-Info..getlastSleepOn)
    * [~getWakeUpList()](#module_System-Info..getWakeUpList)
    * [~addDisconnectListener(callback)](#module_System-Info..addDisconnectListener)
    * [~removeDisconnectListener(callback)](#module_System-Info..removeDisconnectListener)

<a name="module_System-Info..info"></a>

### System-Info~info()
Get Info about the system like RAM,CPU,uptime, etc

**Kind**: inner method of [<code>System-Info</code>](#module_System-Info)  
<a name="module_System-Info..modem"></a>

### System-Info~modem()
Get Modem about the system like RAM,CPU,uptime, etc

**Kind**: inner method of [<code>System-Info</code>](#module_System-Info)  
<a name="module_System-Info..onSleepOn"></a>

### System-Info~onSleepOn(callback, errorCallback)
handler to detect power save mode and execute callback 15 seconds before the device goes to sleep

**Kind**: inner method of [<code>System-Info</code>](#module_System-Info)  

| Param | Description |
| --- | --- |
| callback | callback to execute when power save mode is on and device is about to turn off |
| errorCallback | callbac to execute in case of any error |

<a name="module_System-Info..getLastWakeUp"></a>

### System-Info~getLastWakeUp()
Get the latest wakeup reason and timestamp from sleep on from APEX OS

**Kind**: inner method of [<code>System-Info</code>](#module_System-Info)  
<a name="module_System-Info..getlastSleepOn"></a>

### System-Info~getlastSleepOn()
Get the latest time from  sleep on event from APEX OS

**Kind**: inner method of [<code>System-Info</code>](#module_System-Info)  
<a name="module_System-Info..getWakeUpList"></a>

### System-Info~getWakeUpList()
Get the list of latets sleep on and wakeup events with reason and timestamp

**Kind**: inner method of [<code>System-Info</code>](#module_System-Info)  
<a name="module_System-Info..addDisconnectListener"></a>

### System-Info~addDisconnectListener(callback)
add a callback from stack to execute when app signal termination

**Kind**: inner method of [<code>System-Info</code>](#module_System-Info)  

| Param | Description |
| --- | --- |
| callback | callback to execute when application goes offline |

<a name="module_System-Info..removeDisconnectListener"></a>

### System-Info~removeDisconnectListener(callback)
remove a callback from stack to execute when app signal termination

**Kind**: inner method of [<code>System-Info</code>](#module_System-Info)  

| Param | Description |
| --- | --- |
| callback | callback to remove from listener |

<a name="module_Technoton"></a>

## Technoton
Technoton module get information about Technoton fuel level

<a name="module_Temperature"></a>

## Temperature
Temperature module get information about temperature sensors


* [Temperature](#module_Temperature)
    * [~TemperatureUpdate](#module_Temperature..TemperatureUpdate)
        * [new TemperatureUpdate()](#new_module_Temperature..TemperatureUpdate_new)
    * [~getTemperatures()](#module_Temperature..getTemperatures)
    * [~getTemperature()](#module_Temperature..getTemperature)
    * [~setTemperatureAlias()](#module_Temperature..setTemperatureAlias)
    * [~removeTemperatureAlias()](#module_Temperature..removeTemperatureAlias)
    * [~removeTemperatureAliases()](#module_Temperature..removeTemperatureAliases)
    * [~onTemperatureChange()](#module_Temperature..onTemperatureChange)

<a name="module_Temperature..TemperatureUpdate"></a>

### Temperature~TemperatureUpdate
**Kind**: inner class of [<code>Temperature</code>](#module_Temperature)  
<a name="new_module_Temperature..TemperatureUpdate_new"></a>

#### new TemperatureUpdate()
Event published by the sdk composed of multiple TemperatureEvents
authorized object contains events from whitelisted ibuttons

<a name="module_Temperature..getTemperatures"></a>

### Temperature~getTemperatures()
get the current temperature state

**Kind**: inner method of [<code>Temperature</code>](#module_Temperature)  
<a name="module_Temperature..getTemperature"></a>

### Temperature~getTemperature()
get reading from a specific sensor, by id or alias

**Kind**: inner method of [<code>Temperature</code>](#module_Temperature)  
<a name="module_Temperature..setTemperatureAlias"></a>

### Temperature~setTemperatureAlias()
set alias to a temperature sensor

**Kind**: inner method of [<code>Temperature</code>](#module_Temperature)  
<a name="module_Temperature..removeTemperatureAlias"></a>

### Temperature~removeTemperatureAlias()
remove alias from temperature sensor

**Kind**: inner method of [<code>Temperature</code>](#module_Temperature)  
<a name="module_Temperature..removeTemperatureAliases"></a>

### Temperature~removeTemperatureAliases()
remove aliases from all temperature sensors

**Kind**: inner method of [<code>Temperature</code>](#module_Temperature)  
<a name="module_Temperature..onTemperatureChange"></a>

### Temperature~onTemperatureChange()
monitor temperature notifications

**Kind**: inner method of [<code>Temperature</code>](#module_Temperature)  
<a name="module_Update"></a>

## Update
Update module check for update and make update for ApexOS


* [Update](#module_Update)
    * [~checkCore()](#module_Update..checkCore)
    * [~UpdateCore(force)](#module_Update..UpdateCore)
    * [~listOS()](#module_Update..listOS)
    * [~checkOS()](#module_Update..checkOS)
    * [~recoverOS()](#module_Update..recoverOS)
    * [~updateOS(force)](#module_Update..updateOS)
    * [~installOS(package_name)](#module_Update..installOS)

<a name="module_Update..checkCore"></a>

### Update~checkCore()
Check if an update is available in the dctserver for Core Ccomponentss

**Kind**: inner method of [<code>Update</code>](#module_Update)  
<a name="module_Update..UpdateCore"></a>

### Update~UpdateCore(force)
Start the update of the core packages by using the dctserver

**Kind**: inner method of [<code>Update</code>](#module_Update)  

| Param | Default | Description |
| --- | --- | --- |
| force | <code>false</code> | The same as start but without checking the network interface |

<a name="module_Update..listOS"></a>

### Update~listOS()
list installed packages from OS components in the distribution

**Kind**: inner method of [<code>Update</code>](#module_Update)  
<a name="module_Update..checkOS"></a>

### Update~checkOS()
Check if an update is available in the dctserver for OS apps and return a list of the latest version of the packages

**Kind**: inner method of [<code>Update</code>](#module_Update)  
<a name="module_Update..recoverOS"></a>

### Update~recoverOS()
allows to recover from broken packages when a bad install or updates happens

**Kind**: inner method of [<code>Update</code>](#module_Update)  
<a name="module_Update..updateOS"></a>

### Update~updateOS(force)
Start the update of the OS components by using the dctserver

**Kind**: inner method of [<code>Update</code>](#module_Update)  

| Param | Description |
| --- | --- |
| force | The same as start but without checking the network interface |

<a name="module_Update..installOS"></a>

### Update~installOS(package_name)
upgrade a package to the lastest version available in the dctserver

**Kind**: inner method of [<code>Update</code>](#module_Update)  

| Param | Description |
| --- | --- |
| package_name | the name of the  package that it wants to be updated |

<a name="module_Utils"></a>

## Utils
Utils module some utlities in ApexOS


* [Utils](#module_Utils)
    * [~OSExecute(...args)](#module_Utils..OSExecute)
    * [~getPrefix()](#module_Utils..getPrefix) ⇒ <code>\*</code>
    * [~$trycatch(promise)](#module_Utils..$trycatch) ⇒ <code>\*</code>
    * [~$throw(error)](#module_Utils..$throw)
    * [~$sleep(ms)](#module_Utils..$sleep) ⇒ <code>\*</code>

<a name="module_Utils..OSExecute"></a>

### Utils~OSExecute(...args)
Execute a command using sudo in the shell of the APEXOS and returns a promise with the stdout. Promise is rejected if status code is different than 0

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  

| Param | Description |
| --- | --- |
| ...args | arguments to pass to the function to execute |

<a name="module_Utils..getPrefix"></a>

### Utils~getPrefix() ⇒ <code>\*</code>
Fetch application prefix,
uses env=SYRUS4G_APP_NAME when available
otherwise it builds it from the directory where the app is running

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  
<a name="module_Utils..$trycatch"></a>

### Utils~$trycatch(promise) ⇒ <code>\*</code>
Utility for try/catching promises in one line, avoiding the need for try/catch blocks
let [response, error] = $trycatch(await awaitable())

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  
**Returns**: <code>\*</code> - {(Promise<[ any | null, Error | null ]>)}  

| Param | Type |
| --- | --- |
| promise | <code>Promise.&lt;any&gt;</code> | 

<a name="module_Utils..$throw"></a>

### Utils~$throw(error)
Utility for throwing errors inside a catch, reduces need for try/catch
await awaitable().catch($throw)

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  

| Param | Type |
| --- | --- |
| error | <code>Error</code> | 

<a name="module_Utils..$sleep"></a>

### Utils~$sleep(ms) ⇒ <code>\*</code>
Sleep Utility
await $sleep(10*1000)

**Kind**: inner method of [<code>Utils</code>](#module_Utils)  
**Returns**: <code>\*</code> - {Promise<void>}  

| Param | Type |
| --- | --- |
| ms | <code>number</code> | 

<a name="module_WIFI"></a>

## WIFI
WIFI module to interacte with the enable/disable WIFI mode  with Apex OS


* [WIFI](#module_WIFI)
    * [~scan()](#module_WIFI..scan)
    * [~state()](#module_WIFI..state)
    * [~list()](#module_WIFI..list)
    * [~start()](#module_WIFI..start)
    * [~stop()](#module_WIFI..stop)
    * [~reset()](#module_WIFI..reset)
    * [~add(ssid, password)](#module_WIFI..add)
    * [~remove(ssid)](#module_WIFI..remove)

<a name="module_WIFI..scan"></a>

### WIFI~scan()
It starts a WIFI scan and returns a list of SSIDs

**Kind**: inner method of [<code>WIFI</code>](#module_WIFI)  
<a name="module_WIFI..state"></a>

### WIFI~state()
It returns the wifi status

**Kind**: inner method of [<code>WIFI</code>](#module_WIFI)  
<a name="module_WIFI..list"></a>

### WIFI~list()
It returns the list of networks configured

**Kind**: inner method of [<code>WIFI</code>](#module_WIFI)  
<a name="module_WIFI..start"></a>

### WIFI~start()
It enables the WIFI interface and starts the service for connecting with preconfigured networks

**Kind**: inner method of [<code>WIFI</code>](#module_WIFI)  
<a name="module_WIFI..stop"></a>

### WIFI~stop()
It stops the WIFI service and disables the interface

**Kind**: inner method of [<code>WIFI</code>](#module_WIFI)  
<a name="module_WIFI..reset"></a>

### WIFI~reset()
It executes a stop-start in the same call

**Kind**: inner method of [<code>WIFI</code>](#module_WIFI)  
<a name="module_WIFI..add"></a>

### WIFI~add(ssid, password)
It adds a new network to the WIFI configuration file, in this case you have to include the SSID and psk as parameters. Example apx-wifi add myNet myPass

**Kind**: inner method of [<code>WIFI</code>](#module_WIFI)  

| Param | Description |
| --- | --- |
| ssid | The name of SSID you want to connect |
| password | the password of the SSID |

<a name="module_WIFI..remove"></a>

### WIFI~remove(ssid)
It removes a network from the WIFI configuration file, in this case you have to include the SSID as parametes

**Kind**: inner method of [<code>WIFI</code>](#module_WIFI)  

| Param | Description |
| --- | --- |
| ssid | Name of the SSID you want to remove |

<a name="module_Windows"></a>

## Windows
Time Windows module setup get and set counters from APEX OS

<a name="getInfo"></a>

## getInfo()
returns a JSON with the configured values in RF

**Kind**: global function  
<a name="set"></a>

## set(key, value)
Use this option to configure the network variable for mobile networks

**Kind**: global function  

| Param | Description |
| --- | --- |
| key | the paramter to be configured, posible values are: "apn", "user", "pin", "pass" |
| value | the new value of the parameter |


* * *

&copy; 2020 Digitalcomtech