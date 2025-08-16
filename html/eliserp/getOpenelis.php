<?php 
// $curl = curl_init();

// curl_setopt_array($curl, array(
//   CURLOPT_URL => 'https://127.0.0.1/openelis/ValidateLogin.do?ID=null&startingRecNo=1',
//   CURLOPT_RETURNTRANSFER => true,
//   CURLOPT_ENCODING => '',
//   CURLOPT_MAXREDIRS => 10,
//   CURLOPT_TIMEOUT => 0,
//   CURLOPT_FOLLOWLOCATION => true,
//   CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
//   CURLOPT_CUSTOMREQUEST => 'POST',
//   CURLOPT_POSTFIELDS => array('loginName' => 'admin','password' => 'adminADMIN!'),
 
// ));

// $response = curl_exec($curl);

// curl_close($curl);
// print_r( $response);
 
$url ='https://localhost/openelis/ValidateLogin.do?ID=null&startingRecNo=1';

// $target_url = 'https://apiprovider.com/api/v0/imports?token=[KEY]' 
$post = array('loginName' => 'admin','password' => 'adminADMIN!');

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL,$url);
curl_setopt($ch, CURLOPT_POST,1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
curl_setopt($ch, CURLOPT_VERBOSE,true);
$result = curl_exec ($ch);

$curlresponse = json_decode($result, true);

var_dump($result); 

// Matching the response to extract cookie value
preg_match_all('/^Set-Cookie:\s*([^;]*)/mi',
          $result,  $match_found);
   
$cookies = array();
foreach($match_found[1] as $item) {
    parse_str($item,  $cookie);
    $cookies = array_merge($cookies,  $cookie);
}
   
// Printing cookie data
var_dump( $cookies);
   
// Closing curl object instance
curl_close($ch);
