<?php

require_once (dirname(__FILE__).'/settings.php');
require_once (dirname(__FILE__).'/utils.php');

$grid = getPrepopulatedTweets();
//print_r($grid);

$res = array();

foreach ($grid as $row) {
    array_push($res, array(
        'text' => $row[0],
        'from_user' => $row[1],
        'time' => $row[2]
    ));
}

foreach($res as &$t){
    replaceQuotes($t);
    calculateStyle($t);
}

echo json_encode($res);

?>