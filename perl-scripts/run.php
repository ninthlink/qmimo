<?php
$pl = $_GET['s'];
switch( $pl ) {
  case 'ap_mu_mode':
  case 'ap_su_mode':
  case 'ap_tb_mode':
  case 'mg_udp_traffic':
  case 'lb_tcp_traffic':
    $run = true;
    break;
  default:
    $run = false;
    break;
}
if ( $run === true ) {
  shell_exec('perl '. $pl .'.pl');
}
?>