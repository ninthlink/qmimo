/**
 * qmimo.config.js 
 *
 * initial variables
 */
var QMIMO_SWITCH_DELAY_MS = 1000, // # of ms delay when switching modes
    QMIMO_NUMBER_OF_DEVICES = 6, // # of devices we can expect tput from
    QMIMO_INITIAL_MODE = 'mu', // 'mu' for Multi-User, 'su' for Single-User
    QMIMO_TPUT_DATA_DIR = 'fake-demo-contents', // directory with tputs
    QMIMO_TPUT_FILE_NAME_FORMAT = 'tput#.txt'; // in case we need to change
