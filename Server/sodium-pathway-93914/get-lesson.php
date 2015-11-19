<?php
    
    $code = $_GET["code"];
    
    //connect to the MySQL database
    $$db = null;
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
    $stmt = $db->prepare('SELECT JSON FROM Lessons WHERE Code=? LIMIT 1');
    $stmt->execute(array($code));
    if ($stmt->rowCount() > 0 ) {
        $queryResult = $stmt->fetch();
        echo $queryResult["JSON"];
    }
    
?>