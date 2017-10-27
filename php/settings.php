<?php

$key = "0AiwGIA90dbK1dEUyS0pOVkZucUhfeTJCbUdxVDlfMGc";//0AiwGIA90dbK1dGJ3TkJubWxacUNScjRMLVNvWnI5Ymc";
$urlPattern = "http://spreadsheets.google.com/feeds/cells/$key/%i%/public/values";
$hashTag = "%23ubuntu";
$twitterUrl = "http://search.twitter.com/search.json?q=$hashTag&rpp=100";


$BOLD_SYNONYM = array(
    "bold",
    "big",
    "grande",  
    "grand",   
    "large",   
    "huge",
    "massive", 
    "giant",
    "strong",  
    "great",
    "jumbo",
    "brave",
    "heroic",
    "rash",
    "fearless",
    "strength",
    "hard",
    "weight",
    "weighty",
    "heavy",
    "heft",
    "hefty"
);

$ITALIC_SYNONYM = array(
    "italic",
    "angular",
    "sharp",     
    "angle",
    "lean",
    "oblique",
    "diagonal",
    "diagonally",
    "striking",
    "stylish",
    "sheer"   
);
/*
 * TODO once account is created:
 * - modify twitter search url
 * - modify matchQuery
 * 
 * 
 */

function __autoload($class_name) {
    include $class_name . '.php';
}

$sheetLoader = new SheetLoader($key, $urlPattern);
/*
function getSecurityMode ()
{
    global $sheetLoader;
    
    return strtolower($sheetLoader->getCell(1,2,3));
}
*/
function getBlacklistedAccounts ()
{
    global $sheetLoader;
    
    return $sheetLoader->getColumn(1,1,2);
}
/*
function getModerators ()
{
    global $sheetLoader;
    
    return $sheetLoader->getColumn(1,2,2);
}

function getPrepopulatedTweets ()
{
    global $sheetLoader;
    
    return $sheetLoader->getGrid(2,1,3,2);
}
*/
// lazy creation
$swearWords = NULL;

function getSwearWords ()
{
    global $sheetLoader, $swearWords;
    
    if(!$swearWords){
        $swearWords = $sheetLoader->getColumn(3,1,2);
    }
    
    return $swearWords;
}

?>