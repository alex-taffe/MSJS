<?php
    include "checklogged.php";
    
    //generate the code to be used for the lesson
    function generateCode() {
        
        $characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $randomString = '';
        for ($i = 0; $i < 7; $i++) {
            $randomString .= $characters[rand(0, strlen($characters) - 1)];
        }
        return $randomString;
    }

    if(!isset($_SESSION["ID"]))
        die();
    
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
        //connect to the app engine
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
            //well we have some lessons, iterate through them and start dumping them into an array
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $lessons[] = array("JSON" => $row["JSON"], "Code" => $row["Code"]);
            }
        }
        //return to the client
        echo json_encode($lessons);
    }
    //user wants to modify the database
    else if($_SERVER["REQUEST_METHOD"] == "POST"){
        //user wants to delete a lesson
        if($_POST["request"] == "delete"){
            $stmt = $db->prepare('DELETE FROM lessons WHERE TeacherID=:id AND Code=:code');
            $stmt->execute(array(':id' => $teacherID, ':code' => $_POST["code"]));
            if($stmt->rowCount() > 0)
                echo '{"status":"Success"}';
            else
                echo '{"status":"Lesson or user not found"}';
        }
        //user wants to add a lesson
        elseif($_POST["request"] == "add"){
            $code = generateCode();
            $JSON = $_POST["JSON"];
            $stmt = $db->prepare('INSERT INTO Lessons (TeacherID, JSON, Code) VALUES (:id, :json, :code)');
            $stmt->execute(array(':id' => $teacherID, ':json' => $JSON, ':code' => $code));
            echo $code;
        }
    }
    
?>