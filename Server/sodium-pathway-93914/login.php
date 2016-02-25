<?php
session_start();
$currentCookieParams = session_get_cookie_params(); 

$rootDomain = 'msjsapp.com'; 

session_set_cookie_params( 
    $currentCookieParams['lifetime'], 
    $currentCookieParams['path'], 
    $rootDomain, 
    $currentCookieParams['secure'], 
    $currentCookieParams['httponly'] 
); 

include 'GDS/GDS.php';
$obj_store = new GDS\Store('Teacher');

//returns random string 15 characters in length (alphanumeric)
    function generateToken() {
        
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $randomString = '';
        for ($i = 0; $i < 15; $i++) {
            $randomString .= $characters[rand(0, strlen($characters) - 1)];
        }
        return $randomString;
    }
    
    //get all the values that the user submitted
    $email = $_POST['email'];
    $password = $_POST['password'];

    //make sure no SQL injection or other trickery is going on
    if(strpos($email,'\'') || strpos($password,'\'')){
        echo json_encode(array('errorCode' => 407, 'message' => ' is an invalid character.'));
        exit;
    }

    //attempt to query the database for the user
    $result = $obj_store->fetchOne('SELECT * FROM Teacher WHERE email=@email',['email'=>$email]);
    if ($result !== null) {
        if($result->password == hash('sha256', $result->salt . $password)){
            $token = generateToken();
            setcookie('Token', $token);
            $_SESSION['Token'] = $token;
            $_SESSION['Email'] = $email;
            $_SESSION['ID'] = $result->getKeyId();
            echo json_encode(array('errorCode' => 200, 'message' => ''));
            exit;
        }
        else{
            echo json_encode(array('errorCode' => 501, 'message' => 'Incorrect password, please try again'));
            exit;
        }
    }
    else{
        echo json_encode(array('errorCode' => 500, 'message' => 'Sorry this email does not exist. Please try again'));
        exit;
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