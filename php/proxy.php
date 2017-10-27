<?php

require_once (dirname(__FILE__).'/utils.php');

$url = $_GET['url'];
// echo "url: $url";
// die;
echo getPageContent($url);

?>