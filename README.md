q Mu-MiMo GUI
=============

####GUI demonstrating Multi-User Multi-Input Multi-Output (Mu-MiMo), built in AngularJS

Highlights the benefit in comparing throughput mb/s of connected devices in a system switching between operating in Multi-User ("MU") Mode and Single-User ("SU") Mode on an 11ac network.

Reads "tput#.txt" to parse throughput values for the given "connected devices", displaying updated values in the GUI, and some total and comparison "Gain" numbers.

The GUI has the option to run in "live" mode, relying on whatever throughput data may be present, watching for whenever it may be updated by some external operators / devices, or to run in "demo" mode where a PHP script is called on to generate example throughput data for the specified number of connected devices.

####Update from the 2nd half of 2015

The GUI system now can also read throughput for a given number of devices operating on a parallel 11ad "Tri-Band" network, and compare the total throughput of the 11ad Tri-Band to the 11ac MU/SU total.

##System Requirements
By default, the GUI is set to operate in "demo" mode. As such, if you are installing this and running locally, and want to make use of this "demo" mode, we assume the system has some sort of Apache + PHP installed, and the GUI should be downloaded to and run from some place inside the http://localhost area.

GUI has been designed, developed and optimized to run in Google Chrome browser operating in "full-screen" mode on 1366x768 laptop & 1920x1080 large screen display resolutions. Some GUI elements and animations require HTML5 and CSS3 support, so a modern browser should be used. Displaying at some window dimensions other than those may result in sub-optimal viewing. 

##Installation Instructions
1. Per "System Requirements" above, we assume the system has some sort of Apache + PHP installed in order to handle running the GUI in "demo" mode.
2. Download [the Source code .zip for the latest release](https://github.com/ninthlink/qmimo/releases)
3. Unzip in to a folder like "qmimo" in the "httpdocs" area of the GUI machine.
4. Open Google Chrome and go to http://localhost/qmimo/
5. Press F11 or navigate in the Chrome menu to activate "full-screen" mode.

For additional information on configuring the GUI, see the "Configuration" section below.


##Configuration
The majority of the configurability of the GUI is handled in the [config.js](config.js) file in the root of the repo :

```js
// SU/MU Mode to start in : 'mu' = Multi User, 'su' = Single User
var QMIMO_INITIAL_11AC = 'mu';

// Tri-Band Mode to start in : true = "On" = show TB #s, false = "Off" = hide
var QMIMO_INITIAL_11AD = true;
```

Updated for the 2nd half of 2015, the config.js now specifies the exact file names of the throughput "tput" .txt files to load for devices connected in the 11ac and 11ad setups. The GUI will automatically display the max # of devices from counting the 2 sets, and will show "Not Connected" for any discrepancy in count between the two.

```js
// Directory (inside the overall qmimo GUI folder?) to find tput files
var QMIMO_TPUT_DATA_DIR = 'fake-demo-contents';

// list of tput files to parse, corresponding to # of 11AC (SU/MU) devices
var QMIMO_11AC_TPUT_FILES = [
    'tput1.txt',
    'tput2.txt',
    'tput3.txt',
    'tput4.txt'
];

// list of tput files to parse, corresponding to # of 11ad (Tri-Band) devices
var QMIMO_11AD_TPUT_FILES = [
    'tput7.txt',
    'tput8.txt',
    'tput9.txt',
    'tput10.txt',
    'tput11.txt',
    'tput12.txt'
];
```

There are a few variables to configure how the GUI displays data :

```js
// whether to start with the home Devices numbers collapsed (or not)
var QMIMO_COLLAPSE_DEVICE_NUMBERS = false;

// How many decimals to show for the top SU/MU/Tri-Band MBPS totals
var QMIMO_TPUT_TOTALS_DECIMAL_PLACES = 0;

// How many decimals to show for the "MU Gain" calculation number
var QMIMO_MU_GAIN_DECIMAL_PLACES = 2;

// How many decimals to show for the "TB Gain" number
var QMIMO_TB_GAIN_DECIMAL_PLACES = 1;
```
####"demo" mode vs "live" mode configuration
In addition to specifying whether the system should even be in "fake" Demo mode, or solely rely on the tput files being updated "live" themselves :

```js
var QMIMO_FAKE_DEMO = true;
```

To turn the "demo" number generation off, in order to use "live" data, you will need to edit the [config.js Line 95](config.js#L95) to change

```js
var QMIMO_FAKE_DEMO = false;
```

Save the config.js with that change and then reload the GUI to load in "live" mode.

####timing configuration

There are also a number of additional variables to control the overall timing of various elements :

```js
// # of ms to wait to refresh device tput data
var QMIMO_REFRESH_11AC_TPUT_MS = 2000;

// # of ms to wait to refresh device tput data
var QMIMO_REFRESH_11AD_TPUT_MS = 3000;

// if loading a number takes longer than this, abort & return previous #
var QMIMO_TPUT_TIMEOUT_MS = 1000;

// # of ms downtime delay when switching MU / SU modes
var QMIMO_SWITCH_DELAY_MS = 5000;

// ms to wait to auto close a Home right 1/3rd btn if left open. 0 = never
var QMIMO_CLOSE_HOME_BUTTONS_MS = 60000;

// Time to wait before re-generating demo #s. probably <= QMIMO_REFRESH_TPUT_MS
var QMIMO_FAKE_DEMO_LOOP_MS = 1000;
```

... all specified in the [config.js](config.js) file in the root of the repo.

##Additional Screens
In addtion, the right column of the GUI "Home" screen brings up 3 examples of environments where a Multi-User "MU" setup could be beneficial over a basic "SU" setup, and 3 more for Tri-Band "TB"

| Demo Screen | MU Demo | TB Demo |
| ----------- | ------- | ------- |
| At Home     | ![At Home : MU Demo](includes/images/bg_room.jpg?raw=true) | ![At Home : TB](includes/images/2015/athome-tb.jpg?raw=true) |
| On the Go     | ![On the Go : MU Demo](includes/images/2015/onthego-mu.jpg?raw=true) | ![On the Go : TB](includes/images/2015/onthego-tb.jpg?raw=true) |
| At the Office | ![At the Office : MU Demo](includes/images/2015/office-mu.jpg?raw=true) | ![At the Office : TB](includes/images/2015/office-tb.jpg?raw=true) |
