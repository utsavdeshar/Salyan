<?php
require 'config.php';
$config = new imisConfig(); 
$data_array=array(
    "resourceType" => "EligibilityRequest",
    "patient"=> array( 
    "reference"=>   "Patient/".$_GET["identifier"]
       
    ));

$payload = json_encode($data_array);
$elig_info = $config->postData('EligibilityRequest/',$payload);
$responseData = json_decode($elig_info, true);
  if (isset($responseData['insurance'])) {
  
            $extensionData = $responseData['insurance'][0]['extension'][0]['valueDecimal'];

            $total_data = array(
                "eligibility" => $responseData,
                "coPayment" => $extensionData
            );

           echo json_encode($total_data);
     
    http_response_code(200);
    
} else {
   
    http_response_code(404);
    echo json_encode(array("message" => "Data not found"));
}




















































































//<?php
//require 'config.php';
//$config = new imisConfig(); 
//$data_array=array(
//    "resourceType" => "EligibilityRequest",
//    "patient"=> array( 
//    "reference"=>   "Patient/".$_GET["identifier"]
//    ))
//    ;
//if(isset($_GET["eligibilityOnly"]))
//{
//$payload = json_encode($data_array);
//$elig_info = $config->postData('EligibilityRequest/',$payload);
//
//
////echo(json_encode($elig_info));
//
//// Decode the JSON response
//    $responseData = json_decode($elig_info, true);
//
//    if (isset($responseData['insurance'])) {
//        // The 'insurance' key exists in the response
//        // This means the data was found, so set a 200 status code
//        http_response_code(200);
//    } else {
//        // The 'insurance' key does not exist in the response
//        // This means the data was not found, so set a 404 status code
//        http_response_code(404);
//        echo json_encode(array("message" => "Data not found"));
//    }
//
//    // Send the response as is
//   echo(json_encode($elig_info));
//
//
//    
//    
//    
//
//}
//else
//{ 
//$payload = json_encode($data_array);
//$patient_info = $config->getData('Patient/?identifier='. $_GET["identifier"]);
//$elig_info = $config->postData('EligibilityRequest/',$payload);
// $responseData = json_decode($elig_info, true);
// 
// if (isset($responseData['insurance'])) {
//    // The 'insurance' key exists in the response
//    // This means the data was found, so set a 200 status code
//    http_response_code(200);
//    
//} else {
//    // The 'insurance' key does not exist in the response
//    // This means the data was not found, so set a 404 status code
//    http_response_code(404);
//    echo json_encode(array("message" => "Data not found"));
//}
//
//
//
// 
// 
// $total_data =array("info" => $patient_info,"elgiibility" => $elig_info);
// echo(json_encode($total_data)); 
//
//}
