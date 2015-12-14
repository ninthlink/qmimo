/**
 * config.js
 *
 * Handles setting up some configurable variables for the GUI
 * including # of connected devices, time before refreshing pieces,
 * and whether or not to generate fake Throughputs data.
 */
// Whether to output (console.log) messages or stay quiet
var QMIMO_OUTPUT_LOGS = false;

// SU/MU Mode to start in : 'mu' = Multi User, 'su' = Single User
var QMIMO_INITIAL_11AC = 'mu';

// Tri-Band Mode to start in : true = "On" = show TB #s, false = "Off" = hide
var QMIMO_INITIAL_11AD = true;

// auto switch 11ac to SU after MU off, & vice versa, or allow total pause
var QMIMO_AUTO_11AC_SWITCH = false;

// Directory (inside the overall qmimo GUI folder?) to find tput files
var QMIMO_TPUT_DATA_DIR = 'fake-demo-contents';

// Note : GUI automatically displays max # of devices from the following 2 sets

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

// whether to start with the home Devices numbers collapsed (or not)
var QMIMO_COLLAPSE_DEVICE_NUMBERS = false;

// whether to show tput numbers when collapsed
var QMIMO_COLLAPSE_TOTALS = false;

// How many decimals to show for the top SU/MU/Tri-Band MBPS totals
var QMIMO_TPUT_TOTALS_DECIMAL_PLACES = 0;

// How many decimals to show for the "MU Gain" calculation number
var QMIMO_MU_GAIN_DECIMAL_PLACES = 2;

// What to show after the "MU Gain" number (either 'X' or nothing)
var QMIMO_MU_GAIN_SUFFIX = 'X';

// How many decimals to show for the "TB Gain" number
var QMIMO_TB_GAIN_DECIMAL_PLACES = 1;

// What to show after the "TB Gain" number (either 'X' or nothing)
var QMIMO_TB_GAIN_SUFFIX = 'X';

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

// Directory (inside the overall qmimo GUI folder?) to find .pl scripts to call
var QMIMO_PERL_SCRIPT_DIR = 'perl-scripts';

/**
 * .pl scripts inside that QMIMO_PERL_SCRIPT_DIR, without ".pl"
 */
// script to call when switching to MU Mode
var QMIMO_MU_SWITCH_SCRIPT = 'ap_mu_mode';

// script to call when switching to SU Mode
var QMIMO_SU_SWITCH_SCRIPT = 'ap_su_mode';

// (outdated?) script to call when switching to TB Mode
var QMIMO_TB_SWITCH_SCRIPT = 'ap_tb_mode';

// (outdated?) script to call when switching to MG Demo
var QMIMO_MG_SWITCH_SCRIPT = 'mg_udp_traffic';

// (outdated?) script to call when switching to LB Demo
var QMIMO_LB_SWITCH_SCRIPT = 'lb_tcp_traffic';

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

/**
 * the following are outdated config variables
 * that should no longer be used in GUI v2.1+
 */
// Time value / wait for LB Demo in MU mode
var QMIMO_FAKE_LB_MU_TIME = 40;

// Time value / wait for LB Demo in SU mode : should be different than MU above
var QMIMO_FAKE_LB_SU_TIME = 46;

// (outdated) control actual file name format for tput .txt : '#' is replaced
var QMIMO_TPUT_FILE_NAME_FORMAT = 'tput#.txt';
 
// (outdated) # of devices to expect tput from
var QMIMO_NUMBER_OF_MU_DEVICES = 4;

/**
 * old config settings from previous demo configuration ideas
 */
// Demo to start in : 'mg' = Multi User Gain, 'lb' = Legacy Client Benefit
var QMIMO_INITIAL_DEMO = 'mg';

// # of "legacy" / non-MU-capable devices, for "LB" mode
var QMIMO_NUMBER_OF_LEGACY_DEVICES = 1;

// by default, hide LB switch & numbers?
var QMIMO_DEFAULT_HIDE_LB = true;

// show QCA#### label names or generic Smartphone / Notebook labels if false
var QMIMO_Q_LABELS = true;

// "magic" number to calculate demo Tri-Band Gain against
var QMIMO_TB_GAIN_MAGIC_NUMBER = 1500;