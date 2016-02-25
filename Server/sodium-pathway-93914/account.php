<?php
include 'checklogged.php';
include 'GDS/GDS.php';
require_once 'PHPGangsta/GoogleAuthenticator.php';

$obj_store = new GDSStore('Teacher');
$teacherID = $_SESSION['ID'];

function generateSalt()
{
	$characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	$randomString = '';
	for ($i = 0; $i < 15; $i++) {
		$randomString.= $characters[rand(0, strlen($characters) - 1) ];
	}

	return $randomString;
}

// connect to the MySQL databases

$userDB = null;
$lessonsDB = null;

if (isset($_SERVER['SERVER_SOFTWARE']) && strpos($_SERVER['SERVER_SOFTWARE'], 'Google App Engine') !== false) {

	// connect to the MySQL database on app engine

	$lessonsDB = new pdo('mysql:unix_socket=/cloudsql/sodium-pathway-93914:users;dbname=lessons', 'root', // username
	'xGQEsWRd39G3UrGU'

	// password

	);
	$userDB = new pdo('mysql:unix_socket=/cloudsql/sodium-pathway-93914:users;dbname=users', 'root', // username
	'xGQEsWRd39G3UrGU'

	// password

	);
}
else {

	// connect to the local SQL server
	$lessonsDB = new pdo('mysql:host=127.0.0.1:3307;dbname=lessons', 'root', // username
	'xGQEsWRd39G3UrGU'
	);
	$userDB = new pdo('mysql:host=127.0.0.1:3307;dbname=users', 'root', // username
	'xGQEsWRd39G3UrGU'

	// password

	);
}

// prevent emulated prepared statements to prevent against SQL injection

$userDB->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

// $userDB->setAttribute(PDO::ATTR_ERRMODE,PDO::ERRMODE_WARNING);

$lessonsDB->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

// user wants account deleted

if ($_POST['request'] == 'delete') {

	// remove all of their lessons so they aren't taking up tons of space
	$stmt = $lessonsDB->prepare('DELETE FROM lessons WHERE TeacherID=:id');
	$stmt->execute(array(
		':id' => $teacherID
	));

	// delete their account
	$stmt = $userDB->prepare('DELETE FROM Users WHERE id=:id');
	$stmt->execute(array(
		':id' => $teacherID
	));
}
else if ($_POST['request'] == 'passwordUpdate') {

	// make sure passwords match
	if ($_POST['password1'] != $_POST['password2']) {
		echo 'passwords must match';
		die();
	}

	// not much else to verify, if they screwed up, that's their problem
	else {
		$newSalt = generateSalt();
		$saltedPassword = hash('sha256', $newSalt . $_POST['password1']);
		$stmt = $userDB->prepare('UPDATE users SET Salt = :salt , Password = :password WHERE id = :id');
		$stmt->execute(array(
			':salt' => $newSalt,
			':password' => $saltedPassword,
			':id' => $teacherID
		));
	}
}
else if ($_POST['request'] == 'emailUpdate') {

	// make sure emails match
	if ($_POST['email1'] != $_POST['email2']) {
		echo json_encode(array(
			'status' => 'fail',
			'message' => 'Emails must match'
		));
		exit;
	}

	$email = $_POST['email1'];

	// Email is less than 5 chars, save on CPU cycles and don't even try to validate
	if (strlen($email) < 5) {
		echo json_encode(array(
			'status' => 'fail',
			'message' => 'This is not a valid email address'
		));
		exit;
	}

	// Email is too long to fit in database and is most likely not valid
	if (strlen($email) > 254) {
		echo json_encode(array(
			'status' => 'fail',
			'message' => 'This is not a valid email address'
		));
		exit;
	}

	// Not an email
	if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
		echo json_encode(array(
			'status' => 'fail',
			'message' => 'This is not a valid email address'
		));
		exit;
	}

	// the email is most likely valid, so update the database
	$stmt = $userDB->prepare('UPDATE users SET Email = :email WHERE id = :id');
	$stmt->execute(array(
		':email' => $email,
		':id' => $teacherID
	));

	// alert the client
	echo json_encode(array(
		'status' => 'success',
		'message' => ''
	));
}
else if ($_POST['request'] == 'enableTwoFactor') {
}
else if ($_POST['request'] == 'confirmTwoFactor') {
}
else if ($_POST['request'] == 'disableTwoFactor') {
}

?>