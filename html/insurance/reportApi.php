<?php

header("Content-Type: application/json");

$dsn = 'pgsql:host=localhost;dbname=clinlims;';
$username = 'clinlims';
$password = '';


$dsn2 = 'mysql:host=localhost;dbname=openmrs;charset=utf8';
$username2 = 'root';
$password2 = 'P@ssw0rd';


//$accession_no = '31102023-048';
//$patient_id = 'MKH244914';

$accession_no = $_GET['accession_no'];
$patient_id = $_GET['patient_id'];

try {

  $pdo = new PDO($dsn, $username, $password);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);



  $sql = "SELECT distinct
    t.id AS testId, 
    t.sort_order AS order, 
    t.name AS test, 
    -- case  when d.dict_entry is not null then d.dict_entry else r.value end as result,
    case when tr.tst_rslt_type = 'D' then d.dict_entry else r.value end as result,
    CASE 
        WHEN uom.name = 'NA' OR uom.name IS NULL THEN '-' 
       ELSE uom.name 
    END AS unit,  
    pl.name AS panel_name, 
    CASE 
        WHEN r.value ~ '^[0-9]+(\.[0-9]+)?$' 
             AND rl.high_normal IS NOT NULL 
             AND r.value::double precision > rl.high_normal THEN 'High'
        WHEN r.value ~ '^[0-9]+(\.[0-9]+)?$' 
             AND rl.low_normal IS NOT NULL 
             AND r.value::double precision < rl.low_normal THEN 'Low'
        ELSE NULL 
    END AS Alert,
    CONCAT(
        COALESCE(rl.low_normal::text, ' '), 
        ' - ', 
        COALESCE(rl.high_normal::text, ' ')
    ) AS Valid_range,n.text as comment
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
    left join test_result tr on tr.test_id = t.id  and tr.value is not null
LEFT JOIN 
    panel pl ON pl.id = a.panel_id
   left join note n on n.reference_id = r.id and n.subject= 'Result Note'
LEFT JOIN 
    result_limits rl ON rl.test_id = t.id
    AND (rl.gender = :gender OR rl.gender IS NULL OR rl.gender = ' ')
LEFT JOIN 
    unit_of_measure uom ON uom.id = t.uom_id
JOIN 
    sample_human sh ON sh.samp_id = s.id
JOIN 
    patient_identity pi ON pi.patient_id = sh.patient_id AND pi.identity_type_id = 2
    LEFT JOIN dictionary d ON d.id = CASE 
    WHEN r.value ~ '^[0-9]+(\.[0-9]+)?$' THEN r.value::double precision
    ELSE NULL
END
WHERE 
    s.accession_number = :accession_no
    AND pi.identity_data = :patient_id;";



  $sql2 =
    "
  SELECT p.gender, pe.first_name, pe.middle_name, pe.last_name, s.accession_number, pi.identity_data as patient_id, s.collection_date, s.entered_date as order_date,  EXTRACT(YEAR FROM AGE(CURRENT_DATE, p.birth_date)) AS age
FROM patient p
JOIN patient_identity pi ON pi.patient_id = p.id AND pi.identity_type_id = 2
JOIN sample_human sh ON sh.patient_id = p.id
JOIN sample s ON sh.samp_id = s.id
join person pe on pe.id = p.person_id
WHERE s.accession_number = :accession_no and pi.identity_data = :patient_id ;";


  $stmt2 = $pdo->prepare($sql2);
  $stmt2->bindParam(':patient_id', $patient_id, PDO::PARAM_STR);
  $stmt2->bindParam(':accession_no', $accession_no, PDO::PARAM_STR);
  $stmt2->execute();


  $patientInfo = $stmt2->fetchAll(PDO::FETCH_ASSOC);
  $gender = $patientInfo[0]['gender'];
  
  
  $stmt1 = $pdo->prepare($sql);
  $stmt1->bindParam(':accession_no', $accession_no, PDO::PARAM_STR);
  $stmt1->bindParam(':patient_id', $patient_id, PDO::PARAM_STR);
  $stmt1->bindParam(':gender', $gender, PDO::PARAM_STR);
  $stmt1->execute();
  $testResults = $stmt1->fetchAll(PDO::FETCH_ASSOC);
  


  $pdo2 = new PDO($dsn2, $username2, $password2);
  $pdo2->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);




  $sql3 = "SELECT  
    CONCAT_WS(' ', pn.given_name, pn.middle_name, pn.family_name) AS 'Name',
    CONCAT_WS('-', a.city_village, a.address1) AS 'Address',
    pa.value AS contact_number
FROM 
    patient_identifier pi
LEFT JOIN 
    person_address a ON pi.patient_id = a.person_id
LEFT JOIN 
    person_name pn ON pi.patient_id = pn.person_id
LEFT JOIN 
    person_attribute pa ON pi.patient_id = pa.person_id AND pa.person_attribute_type_id = 16
WHERE pi.identifier = :patient_id;";

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


    $panelName = !empty($item['panel_name']) ? $item['panel_name'] : 'Other Tests';

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
      'alert' => $item['alert'],
      'comment' => $item['comment']
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
