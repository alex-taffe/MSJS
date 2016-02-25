<?php
    include 'checklogged.php';
    include 'globals.php';
    include 'GDS/GDS.php';
    $obj_store = new GDS\Store('Lessons');
    
    //generate the code to be used for the lesson
    function generateCode() {
        
        $characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $randomString = '';
        for ($i = 0; $i < 7; $i++) {
            $randomString .= $characters[rand(0, strlen($characters) - 1)];
        }
        return $randomString;
    }
    if(!isset($_SESSION['ID']))
        die();
    
    $teacherID = $_SESSION['ID'];

    //user wants to retrieve lessons
    if($_SERVER['REQUEST_METHOD'] == 'GET'){
        //attempt to query the database for the user
        $obj_store->query('SELECT * FROM Lessons WHERE TeacherID=@id',['id'=>$teacherID]);
        $result = $obj_store->fetchAll();
        $lessons = array();
        if (count($result) > 0) {
            //well we have some lessons, iterate through them and start dumping them into an array
            foreach($result as $lesson) {
                $lessons[] = array('JSON' => $lesson->JSON, 'Code' => $lesson->Code);
            }
        }
        //return to the client
        echo json_encode($lessons);
    }
    //user wants to modify the database
    else if($_SERVER['REQUEST_METHOD'] == 'POST'){
        //user wants to delete a lesson
        if($_POST['request'] == 'delete'){
            $lessonToDelete = $obj_store->fetchOne('SELECT * FROM Lessons WHERE TeacherID=@id AND Code=@code',['id'=>$teacherID,'code'=>$_POST['code']]);
            if($lessonToDelete != null){
                $obj_store->delete($lessonToDelete);
                echo '{"status":"Success"}';
            }
            else
                echo '{"status":"Lesson or user not found"}';
        }
        
        //user wants to add a lesson
        
        else if($_POST['request'] == 'add'){
            $code = generateCode();
            $lessonTitle = $_POST['lessonTitle'];
            $lessonMessage = $_POST['lessonMessage'];
            $lessonSprites = json_decode($_POST['sprites'], true);
            
            $raw = array(
                'status' => 'success',
                'message' => null,
                'isDefault' =>false,
                'lessonTitle' => $lessonTitle,
                'lessonMessage' => $lessonMessage,
                'version' => $VERSION,
                'sprites' => $lessonSprites
            );
            $JSON = json_encode($raw);
            
            $lesson = new GDS\Entity();
            $lesson->TeacherID = $teacherID;
            $lesson->JSON = $JSON;
            $lesson->Code = $code;
            
            $obj_store->upsert($lesson);
            
            echo $code;
        }
    }
    
?>