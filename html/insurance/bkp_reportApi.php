<?php

header("Content-Type: application/json");

$dsn = 'pgsql:host=localhost;dbname=clinlims;';
$username = 'clinlims';
$password = '';


$dsn2 = 'mysql:host=localhost;dbname=openmrs;charset=utf8';
$username2 = 'root';
$password2 = 'P@ssw0rd';


// $accession_no = '30082024-005';
// $patient_id = 'SDH200197';

$accession_no = $_GET['accession_no'];
$patient_id = $_GET['patient_id'];

try {

  $pdo = new PDO($dsn, $username, $password);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);


  $sql = "
SELECT 
    t.id AS testId, 
    t.sort_order AS order, 
    t.name AS test, 
    r.value AS result, 
    uom.name AS unit, 
    pl.name AS panel_name, 
    CASE 
        WHEN r.value ~ '^[0-9]+(\.[0-9]+)?$' 
             AND rl.high_normal IS NOT NULL 
             AND r.value::double precision > rl.high_normal THEN '(A)'
        WHEN r.value ~ '^[0-9]+(\.[0-9]+)?$' 
             AND rl.low_normal IS NOT NULL 
             AND r.value::double precision < rl.low_normal THEN '(B)'
        ELSE NULL 
    END AS Alert,
    CONCAT(
        COALESCE(rl.low_normal::text, 'N/A'), 
        ' - ', 
        COALESCE(rl.high_normal::text, 'N/A')
    ) AS Valid_range
FROM 
    result r
JOIN 
    analysis a ON r.analysis_id = a.id
JOIN 
    sample_item si ON a.sampitem_id = si.id
JOIN 
    sample s ON si.samp_id = s.id
JOIN 
    test t ON t.id = a.test_id

JOIN 
    panel pl ON pl.id = a.panel_id
LEFT JOIN 
    result_limits rl ON rl.test_id = t.id
LEFT JOIN 
    unit_of_measure uom ON uom.id = t.uom_id
JOIN 
    sample_human sh ON sh.samp_id = s.id
JOIN 
    patient_identity pi ON pi.patient_id = sh.patient_id AND pi.identity_type_id = 2
WHERE 
    s.accession_number = :accession_no 
    AND pi.identity_data = :patient_id;
 ";



  $sql2 =
    "
  SELECT p.gender, pe.first_name, pe.last_name, s.accession_number, pi.identity_data as patient_id, s.collection_date, s.entered_date as order_date,  EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date)) AS age
FROM patient p
JOIN patient_identity pi ON pi.patient_id = p.id AND pi.identity_type_id = 2
JOIN sample_human sh ON sh.patient_id = p.id
JOIN sample s ON sh.samp_id = s.id
join person pe on pe.id = p.person_id
WHERE s.accession_number = :accession_no and pi.identity_data = :patient_id ;";


  $stmt1 = $pdo->prepare($sql);
  $stmt1->bindParam(':accession_no', $accession_no, PDO::PARAM_STR);
  $stmt1->bindParam(':patient_id', $patient_id, PDO::PARAM_STR);
  $stmt1->execute();


  $testResults = $stmt1->fetchAll(PDO::FETCH_ASSOC);


  $stmt2 = $pdo->prepare($sql2);
  $stmt2->bindParam(':patient_id', $patient_id, PDO::PARAM_STR);
  $stmt2->bindParam(':accession_no', $accession_no, PDO::PARAM_STR);
  $stmt2->execute();


  $patientInfo = $stmt2->fetchAll(PDO::FETCH_ASSOC);


  $pdo2 = new PDO($dsn2, $username2, $password2);
  $pdo2->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  $sql3 = "
  select concat_ws(' ', pn.given_name, pn.middle_name, pn.family_name) AS 'Full Name',pa.value as contact_number from person_name pn 
inner join person_attribute pa on pa.person_id = pn.person_id and pa.person_attribute_type_id = 16
inner join patient_identifier pi on pi.patient_id = pn.person_id
where pi.identifier = :patient_id; 

";

  $stmt3 = $pdo2->prepare($sql3);
  $stmt3->bindParam(':patient_id', $patient_id, PDO::PARAM_STR);
  $stmt3->execute();


  $contact_number = $stmt3->fetchAll(PDO::FETCH_ASSOC);

  function sort_order($a, $b)
  {
    if ($a['order'] == $b['order']) {
      return 0;
    }
    return ($a['order'] < $b['order']) ? -1 : 1;
  }

  uasort($testResults, 'sort_order');


  $groupedData = [];


  foreach ($testResults as $item) {
    $panelName = $item['panel_name'];

    if (!isset($groupedData[$panelName])) {
      $groupedData[$panelName] = [];
    }

    $groupedData[$panelName][] = [
      'testid' => $item['testid'],
      'order' => $item['order'],
      'test' => $item['test'],
      'result' => $item['result'],
      'unit' => $item['unit'],
      'valid_range' => $item['valid_range'],
      'alert' => $item['alert']
    ];
  }




  $response = [
    'patient_info' => $patientInfo,
    'test_results' => $groupedData,
    'contact_number' => $contact_number

  ];




  if ($response) {
    echo json_encode($response);
  } else {
    echo json_encode(["message" => "No results found"]);
  }
} catch (PDOException $e) {

  die("Connection failed: " . $e->getMessage());
}
