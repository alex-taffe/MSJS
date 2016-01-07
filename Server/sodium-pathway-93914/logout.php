<?php
session_start(); 
session_unset();
session_destroy();
unset($_COOKIE['Token']);
unset($_COOKIE['PHPSESSID']);
setcookie('Token',null,-1,'/');
setcookie('PHPSESSID',null,-1,'/');
header('Location: /');
?>