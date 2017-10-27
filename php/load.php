<?php

require_once (dirname(__FILE__).'/utils.php');

$forbiddenUsers = getBlacklistedAccounts();
//echo "black listed users: " . count($forbiddenUsers) . "\n";
//echo "favorites: " . count($favorites) . "\n";
//print_r($favorites);

$content = getPageContent($twitterUrl);
$result = json_decode($content, true);
$tweets = $result['results'];
//echo "loaded: " . count($tweets) . "\n";

// remove blacklisted or the ones containing swearing
for($i=0; $i<count($tweets); $i++){
    $tweet = $tweets[$i];
    $user = strtolower($tweet['from_user']);
    if(in_array($user, $forbiddenUsers) || containsSwearing($tweet)){
        array_splice($tweets, $i, 1);
        $i--;
    }
}



// because I couldn't make the pointers to work...
foreach($tweets as &$t){
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