/**
 * config.js
 *
 * Handles setting up some configurable variables for the GUI
 * including # of connected devices, time before refreshing pieces,
 * and whether or not to generate fake Throughputs data.
 */
// The # of devices we can expect tput from
var QMIMO_NUMBER_OF_DEVICES = 6;

// # of ms to wait to refresh device tput data
var QMIMO_REFRESH_TPUT_MS = 2000;

// # of ms downtime delay when switching MU / SU modes
var QMIMO_SWITCH_DELAY_MS = 3000;

// Directory (inside the overall qmimo GUI folder?) to find tput files
var QMIMO_TPUT_DATA_DIR = 'fake-demo-contents';

// Which Mode to start in : 'mu' = Multi User, 'su' = Single User
var QMIMO_INITIAL_MODE = 'mu';

// How many decimals to show for the "MU Gain" number, in case we want to tweak
var QMIMO_MU_GAIN_DECIMAL_PLACES = 2;

// Optional control actual file name format for tput .txt : '#' is replaced
var QMIMO_TPUT_FILE_NAME_FORMAT = 'tput#.txt';

/**
 * Fake Demo Throughput Numbers Generation
 *
 * Specify whether we'll have actual data in coming in or if we should fake it.
 * If true, then use our fake-demo-contents/qgen.php script
 * to generate demo throughput tput data at the intervals specified below...
 */
var QMIMO_FAKE_DEMO = true;

// Time to wait before re-generating demo #s. probably <= QMIMO_REFRESH_TPUT_MS
var QMIMO_FAKE_DEMO_LOOP_MS = 1000;