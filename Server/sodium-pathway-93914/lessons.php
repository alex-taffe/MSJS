<?php
    session_start();
    
    $teacherID = $_SESSION["ID"];
    
    //connect to the MySQL database
    $db = new pdo('mysql:unix_socket=/cloudsql/sodium-pathway-93914:users;dbname=users',
                  'root',  // username
                  'xGQEsWRd39G3UrGU' // password
                  );
    //prevent emulated prepared statements to prevent against SQL injection
    $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    
    //attempt to query the database for the user
    $stmt = $db->prepare('SELECT JSON, AddDate, Code FROM Lessons WHERE TeacherID=?');
    $stmt->execute(array($teacherID));
    $lessons = array();
    if ($stmt->rowCount() > 0 ) {
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $lessons[] = array("JSON" => $row["JSON"], "Code" => $row["Code"]);
        }
    }
    echo json_encode($lessons);
    
?>