<?php
/**
 * qgen.php
 *
 * fakes creating tput#.txt files
 * with 1 line of content like :
 *
 * eth0: 123 0
 */
$maxnum = 8;

$w = false;
if ( isset( $_GET['w'] ) ) {
  $w = ( intval( $_GET['w'] ) == 1 );
}

$range = array(
  array( 10, 70 ),
  array( 90, 125 ),
  array( 270, 350 )
);

$m = 0;
if ( isset( $_GET['m'] ) ) {
  if ( $w ) {
    $m = intval( $_GET['m'] );
  } else {
    if ( intval( $_GET['m'] ) === 1 ) {
      $m = 1;
    } elseif ( intval( $_GET['m'] ) === 2 ) {
      $m = 2;
      /**
       * m = 2 = "Tri-Band" 11AD mode
       *
       * in this case, range is variable
       * depending on how many devices are connected
       * with total range going from roughly 2000 - 2600
       */
      if ( isset( $_GET['t'] ) ) {
        $t = intval( $_GET['t'] );
        if ( $t > 0 ) {
          $range[$m][0] = round( 2000 / $t );
          $range[$m][1] = round( 2600 / $t );
        }
      }
    }
  }
}

$n = 'qgen.php';
$i = 1;
if ( isset( $_GET['i'] ) ) {
  $i = intval( $_GET['i'] );
  // make sure in range
  if ( ( $i < 1 ) || ( $i > $maxnum ) ) {
    $i = 1;
  }
}

$j = ( $i === $maxnum ? 1 : $i + 1 );

if ( $w ) {
  $r = 0;
  if ( isset( $_GET['r'] ) ) {
    $r = intval( $_GET['r'] );
  }
} else {
  $r = rand( $range[$m][0], $range[$m][1] ); // + ( 0.09 * $i );
}
$contents = 'eth0: '. $r .' 0' ."\n";

if ( $w ) {
  // loop from $i to $m
  for( $k = 0; $k < $m; $k++ ) {
    $file = 'tput'. ( $j + $k ) .'.txt';
    file_put_contents( $file, $contents );
  }
} else {
  // actually write to the file then
  if ( isset( $_GET['f'] ) ) {
    $file = $_GET['f']; // uhhh
  } else {
    $file = 'tput'. $i .'.txt';
  }
  file_put_contents( $file, $contents );
}
$q = isset( $_GET['q'] ) ? ( $_GET['q'] ? 1 : 0 ) : 0;
if ( $q === 1 ) exit(0);
?>
<!DOCTYPE html>
<html>
<body>
<pre>
<?php print_r($_GET); ?>
</pre>
<h1>MU Mode <?php echo ( $m === 1 ? 'ON' : 'OFF' ); ?></h1>
<p><?php echo $file ?> ( <?php echo $range[$m][0] .' - '. $range[$m][1] ?> )</p>
<pre><?php print $contents ?></pre>
<p><a href="<?php echo $n ?>?i=<?php echo $j ?>&m=<?php echo ''. $m ?>" id="rl">next #<?php echo $j ?> & mumode m=<?php echo ''. $m ?></a></p>
<p>press..</p>
<ul>
<li>m : switch MU Mode</li>
<li>n : next #</li>
</ul>
<script type="text/javascript" src="../includes/jquery.min.js"></script>
<script type="text/javascript">
(function($) {
  function w( l ) {
    window.location.href = l;
  }
  
  $(window).keypress( function(e) {
    var k = e.which;
    switch ( k ) {
      case 109:
        w( '<?php echo $n ?>?i=<?php echo $j ?>&m=<?php echo ''. ( $m === 1 ? 0 : 1 ) ?>' );
        break;
      case 110:
        w( '<?php echo $n ?>?i=<?php echo $j ?>&m=<?php echo ''. $m ?>' );
        break;
    }
  });
})(jQuery);
</script>
</body>
</html>