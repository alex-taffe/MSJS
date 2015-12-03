<?php
    session_start();
    
    $teacherID = $_SESSION["ID"];
    
    //connect to the MySQL database
    $db = null;
    if(isset($_SERVER["SERVER_SOFTWARE"]) && strpos($_SERVER["SERVER_SOFTWARE"],"Google App Engine") !== false){
    //connect to the MySQL database on app engine
        $db = new pdo('mysql:unix_socket=/cloudsql/sodium-pathway-93914:users;dbname=lessons',
                  'root',  // username
                  'xGQEsWRd39G3UrGU' // password
                  );
    }
    else{
        $db = new pdo('mysql:host=127.0.0.1:3307;dbname=lessons',
                  'root',  // username
                  'xGQEsWRd39G3UrGU' // password
                  );
    }
    //prevent emulated prepared statements to prevent against SQL injection
    $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

    //user wants to retrieve lessons
    if($_SERVER["REQUEST_METHOD"] == "GET"){
        //attempt to query the database for the user
        $stmt = $db->prepare('SELECT JSON, AddDate, Code FROM lessons WHERE TeacherID=:id');
        $stmt->execute(array(':id' => $teacherID));
        $lessons = array();
        if ($stmt->rowCount() > 0 ) {
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $lessons[] = array("JSON" => $row["JSON"], "Code" => $row["Code"]);
            }
        }
        echo json_encode($lessons);
    }
    //user wants to modify the database
    else if($_SERVER["REQUEST_METHOD"] == "POST"){
        if($_POST["request"] == "delete"){
            $stmt = $db->prepare('DELETE FROM lessons WHERE TeacherID=:id AND Code=:code');
            $stmt->execute(array(':id' => $teacherID, ':code' => $_POST["code"]));
            if($stmt->rowCount() > 0)
                echo '{"status":"Success"}';
            else
                echo '{"status":"Lesson or user not found"}';
        }
    }
    
?>