<?php
    session_start();
    function generateCode() {
        
        $characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $randomString = '';
        for ($i = 0; $i < 7; $i++) {
            $randomString .= $characters[rand(0, strlen($characters) - 1)];
        }
        return $randomString;
    }
    
    $teacherID = $_SESSION["ID"];
    $code = generateCode();
    $JSON = $_POST["JSON"];
    
    //connect to the MySQL database
    $db = new pdo('mysql:unix_socket=/cloudsql/sodium-pathway-93914:users;dbname=users',
                  'root',  // username
                  'xGQEsWRd39G3UrGU' // password
                  );
    //prevent emulated prepared statements to prevent against SQL injection
    $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    
    $stmt = $db->prepare('INSERT INTO Lessons (TeacherID, JSON, Code) VALUES (:id, :json, :code)');
    $stmt->execute(array(':id' => $teacherID, ':json' => $JSON, ':code' => $code));
    $stmt = null;
    
    $db = null;
    echo $code;
    
?>