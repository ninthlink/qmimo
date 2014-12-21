<?php
/**
 * qgen.php
 *
 * fakes creating tput#.txt files
 * with 1 line of content like :
 *
 * eth0: 123 0
 */
$maxnum = 6;
$m = 0;
if ( isset( $_GET['m'] ) ) {
  if ( intval( $_GET['m'] ) === 1 ) {
    $m = 1;
  }  
}
$range = array(
  array( 10, 70 ),
  array( 90, 125 )
);

$n = 'qgen.php';
$i = 1;
if ( isset( $_GET['i'] ) ) {
  $i = intval( $_GET['i'] );
  // make sure in range
  if ( ( $i < 1 ) || ( $i > $maxnum ) ) {
    $i = 1;
  }
}

$file = 'tput'. $i .'.txt';
$j = ( $i === $maxnum ? 1 : $i + 1 );

$r = rand( $range[$m][0], $range[$m][1] );
$contents = 'eth0: '. $r .' 0' ."\n";

// actually write to the file then
file_put_contents( $file, $contents );

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