<?php

require_once (dirname(__FILE__).'/utils.php');

$security = getSecurityMode();
//echo "security: " . $security . "\n";
$forbiddenUsers = getBlacklistedAccounts();
//echo "black listed users: " . count($forbiddenUsers) . "\n";
$favorites = getAllFavorites();
//echo "favorites: " . count($favorites) . "\n";
//print_r($favorites);

$content = getPageContent($twitterUrl);
$result = json_decode($content, true);
$tweets = $result['results'];
// mark as not favorite
foreach($tweets as $t){
    $t['favorited'] = false;
}

// remove blacklisted or the ones containing swearing
for($i=0; $i<count($tweets); $i++){
    $tweet = $tweets[$i];
    $user = strtolower($tweet['from_user']);
    if(in_array($user, $forbiddenUsers) || containsSwearing($tweet)){
        array_splice($tweets, $i, 1);
        $i--;
    }
}


//echo "tweets after removed blacklisted: " . count($tweets) . "\n";

if($security!="open"){
    // remove not favorites
    $favoritesMap = createTweetsMap($favorites);
    
    for($i=0; $i<count($tweets); $i++){
        $tweet = $tweets[$i];
        if(!isset($favoritesMap[$tweet['id_str']])){
            array_splice($tweets, $i, 1);
            $i--;
        }else{
            //echo "tweet \"" . $tweet['text'] . "\" is favorite!";
        }
    }
}

// remove empty
for($i=0; $i<count($tweets); $i++){
    $tweet = $tweets[$i];
    $tweet['text'] = trim($tweet['text']);
    if(strlen($tweet['text'])==0){
        array_splice($tweets, $i, 1);
        $i--;
    }
}

//echo "tweets after removed not favorites: " . count($tweets) . "\n";

// add matching favorites if missing
$tweetsMap = createTweetsMap($tweets);
foreach ($favorites as $f) {
    if(matchQuery($f)){
        $id = $f['id_str'];
        //echo "add " . $id . "\n";
        if(!isset($tweetsMap[$id])){
            //echo "not present yet\n";
            cleanFavorite($f);
            array_push($tweets, $f);
            $tweetsMap[$id] = $f;
        }
    }
}

// because I couldn't make the pointers to work...
foreach($tweets as &$t){
    $id = $t['id_str'];
    if(isset($favoritesMap[$id])){
        $t['favorited'] = true;
    }
    replaceQuotes($t);
    calculateStyle($t);
}

// sort by date
function cmp($a, $b) {
    $ta = date("U", strtotime($a['created_at']));
    $tb = date("U", strtotime($b['created_at']));
    if ($ta == $tb) {
        return 0;
    }
    return ($ta < $tb) ? 1 : -1;
}
usort($tweets, 'cmp');

//echo "tweets after adding matching favorites: " . count($tweets) . "\n";

echo json_encode($tweets);

?>