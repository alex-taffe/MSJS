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
$conn = new pdo('mysql:unix_socket=/cloudsql/sodium-pathway-93914:users;dbname=users',
  'root',  // username
  'xGQEsWRd39G3UrGU'       // password
);

$email = $_POST["email"];
$password = $_POST["password"];
$salt = generateSalt();
$saltedPassword = hash("sha256", $salt . $password);
$password = null;
    
    $stmt = $conn->prepare('INSERT INTO Users (Email, Salt, Password) VALUES (:email, :salt, :password)');
    $stmt->execute(array(':email' => $email, ':salt' => $salt, ':password' => $saltedPassword));
$conn = null;
?>