<?php

require_once (dirname(__FILE__).'/../php/CacheLoader.php');

CacheLoader::$verbose = TRUE;
CacheLoader::$FOLDERNAME = "../php/cache";
$cacheLoader = CacheLoader::getInstance();

$user = "nuthinking";
$validation = 'created_at';
$url = "http://api.twitter.com/1/favorites/$user.json";
$content = $cacheLoader->get($url, $validation);
echo "result:/n";
echo $content;


?>