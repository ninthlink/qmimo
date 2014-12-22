/**
 * qmimo.config.js 
 */
/**
 * Specify the # of devices we should expect tput from
 */
var QMIMO_NUMBER_OF_DEVICES = 6;
/**
 * Set the # of ms to wait to refresh tput data
 */
var QMIMO_REFRESH_TPUT_MS = 2000;
/**
 * Set the # of ms delay when switching MU / SU modes
 */
var QMIMO_SWITCH_DELAY_MS = 3000;
/**
 * Specify which directory (inside the overall qmimo GUI folder)
 * we should expect to find our tput .txt files in
 */
var QMIMO_TPUT_DATA_DIR = 'fake-demo-contents';
/**
 * How many decimals we should show for our MU Gain number
 */
var QMIMO_MU_GAIN_DECIMAL_PLACES = 2;
/**
 * Optionally, we can control the actual file name format for our tput .txt
 * 
 * the # gets replaced by the actual numbers, so "tput#.txt" = "tput1.txt"...
 * ranging from 1 to QMIMO_NUMBER_OF_DEVICES above
 */
var QMIMO_TPUT_FILE_NAME_FORMAT = 'tput#.txt';
/**
 * Define which mode the demo should start in
 * 'mu' for Multi-User, 'su' for Single-User
 */
var QMIMO_INITIAL_MODE = 'mu';
/**
 * Specify whether we'll have actual data in coming in or if we should fake it.
 * If true, then use our fake-demo-contents/qgen.php script
 * to generate demo throughput tput data at the intervals specified below...
 */
var QMIMO_FAKE_DEMO = true;
/**
 * How many ms to wait before re-looping through above..
 * should probably be <= QMIMO_REFRESH_TPUT_MS
 */
var QMIMO_FAKE_DEMO_LOOP_MS = 1000;