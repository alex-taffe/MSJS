<?php
include 'GDS/GDS.php';

// Build a new entity
$obj_book = new GDS\Entity();
$obj_book->email = 'alex.taffe@gmail.com';

// Write it to Datastore
$obj_store = new GDS\Store('Teacher');
$obj_store->upsert($obj_book);
?>