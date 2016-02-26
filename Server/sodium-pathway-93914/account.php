<?php
include 'checklogged.php';
include 'GDS/GDS.php';
require_once 'PHPGangsta/GoogleAuthenticator.php';

$teacherStore = new GDS\Store('Teacher');
$lessonStore = new GDS\Store('Lessons');
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

// user wants account deleted

if ($_POST['request'] == 'delete') {

	// remove all of their lessons so they aren't taking up tons of space
    $teacherLessons = $lessonStore->fetchAll('SELECT * From Lessons WHERE TeacherID=@id',['id'=>$teacherID]);
	foreach($teacherLessons as $lesson)
        $lessonStore->delete($lesson);

	// delete their account
	
    $teacherStore->delete($teacher);
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
        $teacher = $teacherStore->fetchById($teacherID);
		$teacher->salt = $newSalt;
        $teacher->password = $saltedPassword;
        $teacherStore->upsert($teacher);
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
	$teacher = $teacherStore->fetchById($teacherID);
    $teacher->email = $email;
    $teacherStore->upsert($teacher);

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