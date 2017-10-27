<?php

require_once (dirname(__FILE__).'/settings.php');

function getPageContent($url)
{
    $ch = curl_init();
    // set URL and other appropriate options
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    // grab URL and pass it to the browser
    $content = curl_exec($ch);
    curl_close($ch);
    return $content;
}

$favorites_validation = 'created_at';

$cacheLoader = CacheLoader::getInstance();

function getFavorites($user)
{
    global $cacheLoader, $favorites_validation;
    
    $res = array();
    
    $url = "http://api.twitter.com/1/favorites/$user.json";
    $content = $cacheLoader->get($url, $favorites_validation);
    if($content === false){
        return $res;
    }
    $result = json_decode($content, true);
    //print "result:\n";
    //var_dump($result);
    if($result && count($result)>0){
        $res = $result;
    }
    
    return $res;
}

function getAllFavorites()
{
    $res = array();
    
    $users = getModerators();
    for($i=0; $i<count($users); $i++){
        $user = $users[$i];
        $res = array_merge($res, getFavorites($user));
    }
    return $res;
}

function matchQuery($tweet)
{
    global $twitterAccount;
    
    return stristr($tweet['text'], $twitterAccount);
}

function createTweetsMap($tweets)
{
    $map = array();
    for($i=0; $i<count($tweets); $i++){
        $id = $tweets[$i]['id_str'];
        $map[$id] =& $tweets[$i];
    }
    return $map;
}

function cleanFavorite(&$tweet)
{
    $tweet['from_user'] = $tweet['user']['screen_name'];
    unset($tweet['user']);
}

function replaceQuotes(&$tweet)
{
    
    // left
    $pattern = "/\b\'/";
    $tweet['text'] = preg_replace($pattern, "’", $tweet['text']);
    $pattern = '/\b\"/';
    $tweet['text'] = preg_replace($pattern, "”", $tweet['text']);
    $pattern = '/\b\&quot;/';
    $tweet['text'] = preg_replace($pattern, "”", $tweet['text']);
    
    // right
    $pattern = "/\'\b/";
    $tweet['text'] = preg_replace($pattern, "‘", $tweet['text']);
    $pattern = '/\"\b/';
    $tweet['text'] = preg_replace($pattern, "“", $tweet['text']);
    $pattern = '/\&quot;\b/';
    $tweet['text'] = preg_replace($pattern, "“", $tweet['text']);
    
    $tweet['text'] = html_entity_decode($tweet['text']);
    $tweet['text'] = str_replace("'", "’", $tweet['text']);
    $tweet['text'] = str_replace('"', "”", $tweet['text']);
}

function containsSwearing($tweet)
{
    $swearWords = getSwearWords();
    //echo "check text agains " . count($swearWords) . " swear words";
    $text = $tweet['text'];
	$text = preg_replace("/\W/i", '', $text);
    foreach($swearWords as $sw){
        $pattern = "/$sw/i";
        if(preg_match($pattern, $text)>0)
            return true;
    }
    return false;
}

function calculateStyle(&$tweet)
{
	$sizes = array(3,4,5,7);
    $tweet['fontWeight'] = $sizes[rand()% count($sizes)] * 100;
    $tweet['style'] = ((rand() % 2) == 0 ? "regular" : "italic");
}

function checkHashTags(&$tweet)
{
    if(checkHashTag($tweet, "#bold")){
        $tweet['isBold'] = true;
    }
    if(checkHashTag($tweet, "#italic")){
        $tweet['isItalic'] = true;
    }
    if(checkHashTag($tweet, "#bolditalic") || checkHashTag($tweet, "#italicbold")){
        $tweet['isBold'] = true;
        $tweet['isItalic'] = true;
    }
}

function checkHashTag(&$tweet, $tag)
{
    $isPresent = false;
    $pattern = "/\\$tag\b/i";
    if(preg_match($pattern, $tweet['text'],$matches, PREG_OFFSET_CAPTURE)){
        $isPresent = true;
        foreach($matches as $m){
            $text = $m[0];
            $index = $m[1];
            $len = strlen($text);
            if(strlen($tweet['text'])>$index+$len && substr($tweet['text'],$index+$len,1)==" "){
                $len++;
            }else if($index>0 && substr($tweet['text'],$index-1,1)==" "){
                $index--;
                $len++;
            }
            $tweet['text'] = substr($tweet['text'],0,$index) . substr($tweet['text'],$index+$len);
        }
    }
    return $isPresent;
}

function checkStylesInText(&$tweet)
{
    global $BOLD_SYNONYM, $ITALIC_SYNONYM;
    if(tweetContainsAnyWord($tweet, $BOLD_SYNONYM)){
        $tweet['isBold'] = true;
    }
    if(tweetContainsAnyWord($tweet, $ITALIC_SYNONYM)){
        $tweet['isItalic'] = true;
    }
}

function tweetContainsAnyWord($tweet, $words)
{
    foreach($words as $w)
    {
        $pattern = "/\b$w\b/i";
        if(preg_match($pattern, $tweet['text'])>0)
            return true;
    }
    return false;
}


?>