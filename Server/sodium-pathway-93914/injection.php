<?php

include 'GDS/GDS.php';

$teacherStore = new GDS\Store('Teacher');

$teacherLessons = $teacherStore->fetchAll('SELECT * From Teacher WHERE email=@id',['id'=>$_POST['ID']]);

var_dump($teacherLessons);

?>