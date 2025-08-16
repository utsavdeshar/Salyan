<?php 


$username='superman';
$password='Admin123';
$URL='https://localhost/openmrs/ws/rest/v1/';

function getData($URL)
{

    $username='superman';
    $password='Admin123';
$curl = curl_init();

curl_setopt_array($curl, array(
  CURLOPT_URL =>$URL,
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_ENCODING => '',
  CURLOPT_MAXREDIRS => 10,
  CURLOPT_TIMEOUT => 0,
  CURLOPT_SSL_VERIFYHOST => false,
  CURLOPT_SSL_VERIFYPEER => false,
  CURLOPT_FOLLOWLOCATION => true,
  CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
  CURLOPT_CUSTOMREQUEST => 'GET',
  CURLOPT_HTTPHEADER => array(
    'Authorization: Basic '. base64_encode($username.':'.$password),    
),
));


$response = curl_exec($curl);
$httpcode = curl_getinfo($curl, CURLINFO_HTTP_CODE);
curl_close($curl);

if ($httpcode != 200)
{
  return array();
}
return $response;
}