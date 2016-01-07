<?php
$currentCookieParams = session_get_cookie_params(); 

$rootDomain = 'msjsapp.com'; 

session_set_cookie_params( 
    $currentCookieParams['lifetime'], 
    $currentCookieParams['path'], 
    $rootDomain, 
    $currentCookieParams['secure'], 
    $currentCookieParams['httponly'] 
); 
session_start();
if(!isset($_COOKIE['Token']) || !isset($_SESSION['Token']) || $_SESSION['Token'] != $_COOKIE['Token']) {
    header('Location: /');
}
?>