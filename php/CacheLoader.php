<?php

class CacheLoader
{
    // singleton instance 
    private static $instance;
    public static $FOLDERNAME = "cache";

    private $foldername = "";
    public static $verbose = FALSE;
    
    // private constructor function 
    // to prevent external instantiation 
    private function __construct()
    {
        $this->foldername = self::$FOLDERNAME;
        $this->log("folder name: \"" . $this->foldername . "\"");
    }
    
    // getInstance method 
    public static function getInstance()
    { 
        if(!self::$instance) { 
            self::$instance = new self(); 
        } 
        return self::$instance; 
    } 
    
    public function get($url, $validation)
    {
        $filename = urlencode($url);
        $content = $this->loadContent($url);
        if($content === false){
            $this->log("load from cache...");
            $content = $this->loadCached($filename);
        }else{
            if(!$validation || stristr($content, $validation)){
                $this->log("update cache...");
                $this->saveCached($filename, $content);
            }else{
                $this->log("validation not passed!");
                return false;
            }
        }
        return $content;   
    }
    
    private function log($message)
    {
        if(self::$verbose){
            echo "$message\n";
        }
    }
    
    private function loadContent($url)
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
    
    private function loadCached($filename)
    {
        $path = $this->foldername . "/" . $filename;
        if(!file_exists($path)){
            $this->log("no cached file available at path: \"$path\"!");
            return false;
        }
        $fh = fopen($path, 'r');
        $content = fread($fh, filesize($path));
        fclose($fh);
        return $content;
    }
    
    private function saveCached($filename, $content)
    {
        if(!file_exists($this->foldername)){
            $this->log("folder \"" . $this->foldername . "\", will create it.");
            mkdir($this->foldername);
        }
        $path = $this->foldername . "/" . $filename;
        $fh = fopen($path, 'w') or die("can't open file");
        fwrite($fh, $content);
        fclose($fh);
        chmod($path, 0777);
    }
    
}

?>