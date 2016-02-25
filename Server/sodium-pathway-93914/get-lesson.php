<?php
include 'GDS/GDS.php';

$code = $_GET['code'];
$obj_store = new GDSStore('Lessons');

// make code uppercase cause the user probably screwed up
$code = strtoupper($code);

// save the data and retrieve from memcache if we can to speed up operations
$memcache = new Memcache;
$data = $memcache->get('' . $code);

if ($data === false) {
	$data = $obj_store->fetchOne('SELECT * From Lessons WHERE Code=@code', ['code' => $code]);
	if ($data !== null) 
        $memcache->set('' . $code, $data, 21600); //keep in the cache for 6 hours
}

if ($data == null) 
    echo json_encode(['status' => 'fail', 'message' => 'Code not found']);
else 
    echo $data->JSON;
?>