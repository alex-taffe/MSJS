<?php
    
    $code = $_GET["code"];
    
    //connect to the MySQL database
    $db = new pdo('mysql:unix_socket=/cloudsql/sodium-pathway-93914:users;dbname=users',
                  'root',  // username
                  'xGQEsWRd39G3UrGU' // password
                  );
    //prevent emulated prepared statements to prevent against SQL injection
    $db->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    
    //attempt to query the database for the user
    $stmt = $db->prepare('SELECT JSON FROM Lessons WHERE Code=? LIMIT 1');
    $stmt->execute(array($code));
    if ($stmt->rowCount() > 0 ) {
        $queryResult = $stmt->fetch();
        echo $queryResult["JSON"];
    }
    
?>