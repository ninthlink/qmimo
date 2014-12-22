q mu-mimo GUI
=============

an Angular-based Mu-Mimo demo GUI

Highlights the benefit in comparing throughput mb/s in a system switching between operating in Multi-User ("MU") mode and Single-User ("SU") Mode

Reads "tput .txt" for a given number of "connected devices", parses the "throughout" number out of them, and displays on the GUI, along with the total for the current MU/SU mode. 

Has the option to generate its own throughput data via calling on a PHP script, or to rely on whatever (live) throughput data may be present.

System Requirements
-------------------

By default, the GUI is set to operate in "demo" mode, using a PHP script to repeatedly create the "tput#.txt" files with numbers in the range of whatever the given mode is. As such, if you are installing this and running locally, and want to make use of this "demo" mode, the system should have Apache + PHP installed, and the GUI should be downloaded to some place inside the http://localhost area.

GUI has been developed and optimized for full-screen mode on 1366x768 laptop & 1920x1080 large screen display. Displaying at some window dimensions other than those may result in non-optimal viewing. 

Some GUI elements and animations require HTML5 and CSS3 support, so a modern browser should be used. GUI currently only tested in Google Chrome.

