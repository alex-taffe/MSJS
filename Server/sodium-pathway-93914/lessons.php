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
    
?>