/**
 * qmimo.config.js 
 */
/**
 * Specify the # of devices we can expect tput from
 */
var QMIMO_NUMBER_OF_DEVICES = 6;
/**
 * Set the # of ms to wait to refresh tput data
 */
var QMIMO_REFRESH_TPUT_MS = 1000;
/**
 * Set the # of ms delay when switching MU / SU modes
 */
var QMIMO_SWITCH_DELAY_MS = 1000;
/**
 * Specify which directory (inside the overall qmimo GUI folder)
 * we should expect to find our tput .txt files in
 */
var QMIMO_TPUT_DATA_DIR = 'fake-demo-contents';
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
 * If we will have actual data coming in, set this to 0, 
 * but if we should just use our fake-demo-contents/qgen.php script
 * for generating demo numbers, then set this to some # > 0.
 * Preferably <= QMIMO_REFRESH_TPUT_MS / QMIMO_NUMBER_OF_DEVICES
 */
var QMIMO_FAKE_DEMO_NUM_GEN_MS = 150;