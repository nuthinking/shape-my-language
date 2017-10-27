<?php

class SheetLoader
{
    private $key,$urlPattern,$sheets;
    
    
    public function __construct($key, $urlPattern)
    {
        $this->key = $key;
        $this->urlPattern = $urlPattern;
        $this->sheets = array();
    }
    
    public function getColumn($sheetIndex=1,$col=1,$initialRow=1, $finalRow=0)
    {
        $res = array();
        $row = $initialRow;
        $cell = $this->getCell($sheetIndex, $row, $col);
        while($cell !== false && ($finalRow == 0 || $row <= $finalRow)){
            array_push($res, $cell);
            $row++;
            $cell = $this->getCell($sheetIndex, $row, $col);
        }
        return $res;
    }
    
    public function getGrid($sheetIndex=1,$initialCol=1, $width=1, $initialRow=1, $finalRow=0)
    {
        $res = array();
        $rowIndex = $initialRow;
        $row = $this->getRow($sheetIndex, $initialCol, $width, $rowIndex);
        while($row !== false && ($finalRow == 0 || $rowIndex <= $finalRow)){
            array_push($res, $row);
            $rowIndex++;
            $row = $this->getRow($sheetIndex, $initialCol, $width, $rowIndex);
        }
        return $res;
    }
    
    public function getRow($sheetIndex=1,$initialCol=1, $width=1, $row)
    {
        $res = array();
        $hasCell = false;
        for($col=$initialCol; $col<$initialCol + $width; $col++){
            $cell = $this->getCell($sheetIndex, $row, $col);
            if($cell !== false){
                $hasCell = true;
            }
            array_push($res, $cell);
        }
        if(!$hasCell){
            return false;
        }else{
            return $res;
        }
    }
    
    private function getSheet($sheetIndex)
    {
        if(!isset($this->sheets[$sheetIndex])){
            $url = str_replace("%i%", (string) $sheetIndex, $this->urlPattern);
            $content = $this->loadSheet($url);
            
            if($content === false){
                die("couldn't connect to db!");
            }
            
            $xml = new SimpleXMLElement($content);
            $this->sheets[$sheetIndex] = $xml;
        }
        return $this->sheets[$sheetIndex];
    }
    
    private function getPageContent($url)
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
    
    private function loadSheet($url)
    {
        $content = $this->getPageContent($url);
        if ($content === false) {
            return false;
        }
        $content = str_replace('xmlns=', 'ns=', $content);
        return $content;
    }
    
    public function getCell($sheetIndex, $row, $col)
    {
        $xml = $this->getSheet($sheetIndex);
        $result = $xml->xpath("/feed/entry/gs:cell[@row='" . $row . "'][@col='" . $col . "']");
        
        while(list( , $node) = each($result)) {
            return (string) $node;
        }
        return false;
    }
        
    
    
    
}

?>

