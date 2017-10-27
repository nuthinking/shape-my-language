<?php

require_once (dirname(__FILE__).'/../php/utils.php');

// STYLE

$tweet = array('text'=>"any sentence");
calculateStyle($tweet);
assert('$tweet["style"]=="regular" /* style detection should handle defaults */');

$tweet = array('text'=>"Bold sentence");
calculateStyle($tweet);
assert('$tweet["style"]=="bold" /* style detection should handle uppercase */');

$tweet = array('text'=>"Bold sentence italic");
calculateStyle($tweet);
assert('$tweet["style"]=="bold italic" /* style detection should handle more then a style */');

$tweet = array('text'=>"#bold sentence");
calculateStyle($tweet);
assert('$tweet["style"]=="bold" /* tweet should get style from #hashtags at the left */');
assert('$tweet["text"]=="sentence" /* tweet should remove hashtags on the left */');

$tweet = array('text'=>"sentence #bold");
calculateStyle($tweet);
assert('$tweet["style"]=="bold" /* tweet should get style from #hashtags at the right */');
assert('$tweet["text"]=="sentence" /* tweet should remove hashtags on the right */');

$tweet = array('text'=>"sentence #bold end");
calculateStyle($tweet);
assert('$tweet["style"]=="bold" /* tweet should get style from #hashtags in the middle */');
assert('$tweet["text"]=="sentence end" /* tweet should remove hashtags in the middle */');

$tweet = array('text'=>"sentence #bold and #italic end");
calculateStyle($tweet);
assert('$tweet["style"]=="bold italic" /* tweet should concatenate styles from #hashtags */');
assert('$tweet["text"]=="sentence and end" /* tweet should remove hashtags in the middle 2 */');
assert('!isset($tweet["isBold"]) /* calculate style should clean isBold key */');
assert('!isset($tweet["isItalic"]) /* calculate style should clean isItalic key */');

$tweet = array('text'=>"@shapemylanguage test this font");
calculateStyle($tweet);
assert('$tweet["text"]=="test this font" /* tweet should remove twitter nickname as address 1 */');

$tweet = array('text'=>"Like\n\n@shapemylanguage test this font");
calculateStyle($tweet);
assert('$tweet["text"]=="Like\n\ntest this font" /* tweet should remove twitter nickname as address 2 */');

// QUOTES

/*

U+2018  ‘   Left Single Quotation Mark
U+2019  ’   Right Single Quotation Mark
U+201C  “   Left Double Quotation Mark
U+201D  ”   Right Double Quotation Mark
 
*/
$tweet = array();
$tweet['text'] = "ooh can't wait for this! Shape My";
replaceQuotes($tweet);
assert('$tweet["text"]=="ooh can’t wait for this! Shape My" /* Right single quotation should replace simple apostrophe */');

$tweet['text'] = 'he said "c u later" dude!';
replaceQuotes($tweet);
assert('$tweet["text"]=="he said “c u later” dude!" /* Left and right double quotation should replace quotes when in the middle */');

$tweet['text'] = '"c u later" dude!';
replaceQuotes($tweet);
assert('$tweet["text"]=="“c u later” dude!" /* Left and right double quotation should replace quotes when at the beginning */');

$tweet['text'] = 'he said "c u later"';
replaceQuotes($tweet);
assert('$tweet["text"]=="he said “c u later”" /* Left and right double quotation should replace quotes when at the end */');


// SWEAR WORDS

assert('!containsSwearing(array("text"=>"cuntine")) /* swear word should be detected only if is a split workd */');
assert('containsSwearing(array("text"=>"cunt friend"))');

    

echo "test passed!";

?>