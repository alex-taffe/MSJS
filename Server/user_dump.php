<?php
function generateSalt() {
	
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $randomString = '';
    for ($i = 0; $i < 15; $i++) {
        $randomString .= $characters[rand(0, strlen($characters) - 1)];
    }
    return $randomString;
} 
// Using MySQL API (connecting from App Engine)
$conn = new pdo('mysql:unix_socket=/cloudsql/sodium-pathway-93914:users',
  'root',  // username
  'xGQEsWRd39G3UrGU'       // password
);
foreach($conn->query('SELECT * from Users') as $row) {
            echo "<div>Email " . $row['Email'] . " Salt " . $row['Salt'] . " Password " . $row['Password'] . "</div>";
     }
?>