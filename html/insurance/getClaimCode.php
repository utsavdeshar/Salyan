<?php


$servername = "localhost";
$username = "root";
$password = "P@ssw0rd";
$dbname = "openmrs";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
  die("Connection failed: " . $conn->connect_error);
}
$sql = "select min_value,max_value,if(current_value is null,max(min_value)+1,max(current_value)+1) as claimCode from claim_code_generation";

$result = $conn->query($sql);
$claimCode = 0;
$min_value = 0;
$max_value = 0;
if ($result->num_rows > 0) {
  // output data of each row
  while($row = $result->fetch_assoc()) {
    $claimCode = $row["claimCode"];
    $min_value = $row["min_value"];
    $max_value = $row["max_value"];
    break;
    //echo "id: " . $row["id"]. " - Name: " . $row["firstname"]. " " . $row["lastname"]. "<br>";
  }
} else {
  echo "0 results";
}

$message = "";
  if($claimCode >= $min_value && $claimCode <= $max_value)
  {
    $message= "successful";
    
$sql= "update claim_code_generation set current_value = ".$claimCode. "";
$conn->query($sql);
  }
  else {
    $claimCode = Null;
    $message = "Claim Code Max Limit Reached";
  }

$conn->close();
$result = array(

    "claimCode" => $claimCode,
    "message" => $message

);
header("Content-type: application/json");
echo JSON_ENCODE($result);
