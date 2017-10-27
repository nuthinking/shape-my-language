<?php

$original = array('favorited'=>'ciccio');

$arr = array();
array_push($arr, $original);

$map = array();
$map['name'] =& $arr[0];

$map['name']['favorited'] = 'franco';

print_r($arr);


?>