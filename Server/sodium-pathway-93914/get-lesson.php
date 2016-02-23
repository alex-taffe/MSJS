<?php
    include 'checklogged.php';
    include 'GDS/GDS.php';
    $code = $_GET['code'];
    $obj_store = new GDS\Store('Lessons');
        
    //make code uppercase cause the user probably screwed up
    $code = strtoupper($code);

    $result = $obj_store->fetchOne('SELECT * From Lessons WHERE Code=@code',['code'=>$code]);
    
    if($result == null)
        echo json_encode(['status'=>'fail','message'=>'Code not found']);
    else
        echo $result->JSON;
    
?>