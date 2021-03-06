<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$servername = "localhost";
$username = "root";
$password = "password";
$dbname = "obscurify";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$sql = "SELECT top_artist,count(*) as fans from users group by top_artist order by fans desc limit 6;";
$sql.= "SELECT top_artist,count(*) as fans from users where user_country='US' group by top_artist order by fans desc limit 5;";
$sql.= "SELECT top_artist,count(*) as fans from users where user_country='BR' group by top_artist order by fans desc limit 5;";
$sql.= "SELECT top_artist,count(*) as fans from users where user_country='GB' group by top_artist order by fans desc limit 5;";
$sql.= "SELECT top_artist,count(*) as fans from users where user_country='SE' group by top_artist order by fans desc limit 5;";
$sql.= "SELECT top_artist,count(*) as fans from users where user_country='AU' group by top_artist order by fans desc limit 5;";

if (!$conn->multi_query($sql)) {
    echo "Multi query failed: (" . $conn->errno . ") " . $conn->error;
}

$final = array();

do {
    if ($result = $conn->store_result()) {
      $rows = array();
      while($r = mysqli_fetch_array($result)) {
        $rows[] = ["top_artist" => $r['top_artist'],
                    "fans" => $r['fans']];
      }
      $final[] = $rows;

      $result->free();
    }
} while ($conn->more_results() && $conn->next_result());

echo json_encode($final);

$conn->close();

?>
