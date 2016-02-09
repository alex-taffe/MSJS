<?php
    //returns random string 15 characters in length (alphanumeric)
    function generateSalt() {
        
        $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $randomString = '';
        for ($i = 0; $i < 15; $i++) {
            $randomString .= $characters[rand(0, strlen($characters) - 1)];
        }
        return $randomString;
    }
    //url is string, data is array
    function performPost($url,$data){
        // use key 'http' even if you send the request to https://...
        $options = array(
                         'http' => array(
                                         'header'  => 'Content-type: application/x-www-form-urlencoded\r\n',
                                         'method'  => 'POST',
                                         'content' => http_build_query($data),
                                         ),
                         );
        $context  = stream_context_create($options);
        $result = file_get_contents($url, false, $context);
        return $result;
    }
    //connect to the MySQL database
    $db = null;
    if(isset($_SERVER['SERVER_SOFTWARE']) && strpos($_SERVER['SERVER_SOFTWARE'],'Google App Engine') !== false){
    //connect to the MySQL database on app engine
        $db = new pdo('mysql:unix_socket=/cloudsql/sodium-pathway-93914:users;dbname=users',
                  'root',  // username
                  'xGQEsWRd39G3UrGU' // password
                  );
    }
    else{
        $db = new pdo('mysql:host=127.0.0.1:3307;dbname=users',
                  'root',  // username
                  'xGQEsWRd39G3UrGU' // password
                  );
    }
    //prevent emulated prepared statements to prevent against SQL injection
    $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    
    //get all the values that the user submitted
    $email = $_POST['email'];
    $password = $_POST['password'];
    $password2 = $_POST['password2'];

    //make sure no SQL injection or other trickery is going on
    if(strpos($email,'\'') || strpos($password,'\'')){
        echo json_encode(array('errorCode' => 407, 'message' => ' is an invalid character'));
        exit;
    }
    
    //make sure that the user doesn't already exist
    $stmt = $db->prepare('SELECT Email FROM Users WHERE Email=? LIMIT 1');
    $stmt->execute(array($email));
    if ($stmt->rowCount() > 0 ) {
        //well they do, may as well try logging them in
        $loggedInResult = performPost('login',array('email' => $email, 'password' => $password, 'g-recaptcha-response' => $_POST["g-recaptcha-response"]));
        $loggedInJSON = json_decode($loggedInResult);
        if($loggedInJSON["errorCode"] == 200){
            echo json_encode(array('errorCode' => 300, 'message' => 'User already exists, successfully logged in'));
            exit;
        }
        else{
            echo json_encode(array('errorCode' => 405, 'message' => 'This username already exists, and the password is incorrect. Try logging in with a correct password'));
            exit;
        }
    }
    $stmt = null;
    
    //Password mismatch
    if($password !== $password2){
        echo json_encode(array('errorCode' => 400, 'message' => 'Passwords do not match. Please try again'));
        exit;
    }
    //Password is too short (less than 6 characters)
    if(strlen($password) < 6){
        echo json_encode(array('errorCode' => 400, 'message' => 'Passwords must be at least 6 characters. Please try again'));
        exit;
    }
    
    //nullify the password and salt it so it's not just floating around in memory
    $password2 = null;
    $salt = generateSalt();
    $saltedPassword = hash('sha256', $salt . $password);
    $password = null;
    
    //Email is less than 5 chars, save on CPU cycles and don't even try to validate
    if(strlen($email) < 5){
        echo json_encode(array('errorCode' => 403, 'message' => 'This is not a valid email address. Please try again'));
        exit;
    }
    
    //Email is too long to fit in database and is most likely not valid
    if(
       ($email) > 254){
        echo json_encode(array('errorCode' => 404, 'message' => 'This is not a valid email address. Please try again'));
        exit;
    }
    
    //Not an email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(array('errorCode' => 401, 'message' => 'This is not a valid email address. Please try again'));
        exit;
    }
    
    //Cookies not enabled
    if(!(count($_COOKIE) > 0)) {
        echo json_encode(array('errorCode' => 406, 'message' => 'Cookies not enabled. Please enable cookies and try again. If you need help with this, please <a href="http://www.whatarecookies.com/enable.asp">click here</a>'));
        exit;
    }
    
    //recaptcha check (only if on the online app engine)
    if(isset($_SERVER['SERVER_SOFTWARE']) && strpos($_SERVER['SERVER_SOFTWARE'],'Google App Engine') !== false){
        $url = 'https://www.google.com/recaptcha/api/siteverify';
        $data = array('secret' => '6LfjXAcTAAAAAHUJGMFaC4SNJFvSTgbb_J5emtpV ', 'response' => $_POST['g-recaptcha-response'], 'remoteip' => $_SERVER['HTTP_CF_CONNECTING_IP']);
        $recaptchaResponse = performPost($url,$data);
        $recaptchaJSON = json_decode($recaptchaResponse,true);
        if(!($recaptchaJSON['success'])){
            echo json_encode(array('errorCode' => 408, 'message' => 'Are you a robot? Try the reCAPTCHA again'));
            exit;
        }
    }

    
    //The user has hopefully done everything corect, let's add them and notify the client
    $stmt = $db->prepare('INSERT INTO Users (Email, Salt, Password) VALUES (:email, :salt, :password)');
    $stmt->execute(array(':email' => $email, ':salt' => $salt, ':password' => $saltedPassword));
    $stmt = null;
    
    $db = null;
    echo json_encode(array('errorCode' => 200, 'message' => ''));
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