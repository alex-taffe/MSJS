<?php

include "checklogged.php";

$teacherID = $_SESSION["ID"];

function generateSalt() {  
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $randomString = '';
    for ($i = 0; $i < 15; $i++) {
        $randomString .= $characters[rand(0, strlen($characters) - 1)];
    }
    return $randomString;
}

//connect to the MySQL databases
$userDB = null;
$lessonsDB = null;
if(isset($_SERVER["SERVER_SOFTWARE"]) && strpos($_SERVER["SERVER_SOFTWARE"],"Google App Engine") !== false){
    //connect to the MySQL database on app engine
    $lessonsDB = new pdo('mysql:unix_socket=/cloudsql/sodium-pathway-93914:users;dbname=lessons',
                  'root',  // username
                  'xGQEsWRd39G3UrGU' // password
                  );
    $userDB = new pdo('mysql:unix_socket=/cloudsql/sodium-pathway-93914:users;dbname=users',
                  'root',  // username
                  'xGQEsWRd39G3UrGU' // password
                  );
}
else{
    //connect to the local SQL server
    $lessonsDB = new pdo('mysql:host=127.0.0.1:3307;dbname=lessons',
                  'root',  // username
                  'xGQEsWRd39G3UrGU' // password
                  );
    $userDB = new pdo('mysql:host=127.0.0.1:3307;dbname=users',
                  'root',  // username
                  'xGQEsWRd39G3UrGU' // password
                  );
}
//prevent emulated prepared statements to prevent against SQL injection
$userDB->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
$lessonsDB->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

//user wants account deleted
if($_POST["request"] == "delete"){
    //remove all of their lessons so they aren't taking up tons of space
    $stmt = $lessonsDB->prepare('DELETE FROM lessons WHERE TeacherID=:id');
    $stmt->execute(array(':id' => $teacherID));
    
    //delete their account
    $stmt = $userDB->prepare('DELETE FROM users WHERE id=:id');
    $stmt->execute(array(':id' => $teacherID));
}
else if($_POST["request"] == "passwordUpdate"){
    if($_POST["password1"] != $_POST["password2"]){
        echo "passwords must match";
    }
    else{
        $newSalt = generateSalt();
        $saltedPassword = hash("sha256", $newSalt . $_POST["password1"]);
        $stmt = $userDB->prepare('UPDATE users SET Salt=:salt, Password=:password WHERE TeacherID=:id');
        $stmt->execute(array(':salt' => $newSalt, 'password' => $saltedPassword, 'id' => $teacherID));
    }
}
?>