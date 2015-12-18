<?php

session_start();
if(!isset($_SESSION["ID"]))
        die();

$teacherID = $_SESSION["ID"];

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
?>