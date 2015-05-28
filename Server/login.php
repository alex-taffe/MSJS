<!--
The MIT License (MIT)

Copyright (c) Wed May 27 2015 Alex Taffe

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORTOR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
-->


<?php
$currentCookieParams = session_get_cookie_params(); 

$rootDomain = 'msjsapp.com'; 

session_set_cookie_params( 
    $currentCookieParams["lifetime"], 
    $currentCookieParams["path"], 
    $rootDomain, 
    $currentCookieParams["secure"], 
    $currentCookieParams["httponly"] 
); 
session_start();
//returns random string 15 characters in length (alphanumeric)
    function generateToken() {
        
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $randomString = '';
        for ($i = 0; $i < 15; $i++) {
            $randomString .= $characters[rand(0, strlen($characters) - 1)];
        }
        return $randomString;
    }
//code must be int or double, message is a string
    function outputResponse($code,$message){
        echo '{';
        echo '"errorCode":';
        echo $code;
        echo ',';
        echo '"message":"';
        echo $message;
        echo '"}';
        exit; 
    }

 //connect to the MySQL database
    $db = new pdo('mysql:unix_socket=/cloudsql/sodium-pathway-93914:users;dbname=users',
                  'root',  // username
                  'xGQEsWRd39G3UrGU' // password
                  );
    //prevent emulated prepared statements to prevent against SQL injection
    $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    
    //get all the values that the user submitted
    $email = $_POST["email"];
    $password = $_POST["password"];

    //make sure no SQL injection or other trickery is going on
    if(strpos($email,'\'') || strpos($password,'\'')){
        outputResponse(407,"' is an invalid character.");
    }

    //attempt to query the database for the user
    $stmt = $db->prepare('SELECT Email, Password, Salt FROM Users WHERE Email=? LIMIT 1');
    $stmt->execute(array($email));
    if ($stmt->rowCount() > 0 ) {
        $userResult = $stmt->fetch();
        if($userResult["Password"] == hash("sha256", $userResult["Salt"] . $password)){
            $token = generateToken();
            setcookie("Token", $token);
            $_SESSION["Token"] = $token;
            outputResponse(200,"");
        }
        else{
            outputResponse(501,"Incorrect password, please try again");
        }
    }
    else{
        outputResponse(500,"Sorry this email does not exist. Please try again");
    }
    /*
     STATUS CODES
     ============
     All Good
     200:OK
     
     Warning
     300:User already exists for registration, successfully logged in
     
     Error:
     Registration:
     400:Password Mismatch
     401:Not an email
     402:Password too short
     403:Email too short
     404:Email too long
     405:User already exists, could not login
     406:Cookies not enabled
     407:Invalid characters
     408:Recaptcha invalid
     
     Login:
     500:Username does not exist
     501:Incorrect password
     502:Cookies not enabled
     
     */
?>