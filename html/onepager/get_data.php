<?php

//header("Content-Type: application/json");


$dsn = 'mysql:host=localhost;dbname=openmrs;charset=utf8';
$username = 'root';
$password = 'P@ssw0rd';

//$patient_uuid = 'a548b3a1-7b34-4079-b2f4-a2cf546d3498';
// $visit_uuid = '4b701b2f-11fd-4737-a893-6c95b40f0b42';


//$visit_uuid = $_GET['visit'];
//$patient_uuid = $_GET['patient'];





try {

  $pdo = new PDO($dsn, $username, $password);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  function executeQuery($pdo, $sql, $params = [])
  {
    // $startTime = microtime(true);
    $stmt = $pdo->prepare($sql);
    foreach ($params as $key => $value) {
      $stmt->bindParam($key, $value, PDO::PARAM_STR);
    }
    $stmt->execute();
    // $endTime = microtime(true);
    // $executionTime = $endTime - $startTime;

    // echo "Query executed in {$executionTime} seconds.\n";
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
  }


  //patient details
  $sql1 = " SELECT  
    CONCAT_WS(' ', pn.given_name, pn.middle_name, pn.family_name) AS full_name, 
    p.gender AS Gender, 
    p.birthdate AS birth_date,
      TIMESTAMPDIFF(YEAR,
        p.birthdate,
       CURDATE()) AS age_years,
    CONCAT_WS(' , ', a.city_village, a.address1, a.county_district, a.country) AS Address,
    MAX(CASE WHEN pa.person_attribute_type_id = 26 THEN pa.value END) AS nhis_number,
    MAX(CASE WHEN pa2.person_attribute_type_id = 29 THEN pa2.value END) AS claim_code,
    pi.identifier 
FROM 
    person p
LEFT JOIN 
    person_address a ON p.person_id = a.person_id
LEFT JOIN 
    person_name pn ON p.person_id = pn.person_id
LEFT JOIN 
    person_attribute pa ON p.person_id = pa.person_id AND pa.person_attribute_type_id = 26
LEFT JOIN 
    person_attribute pa2 ON p.person_id = pa2.person_id AND pa2.person_attribute_type_id = 29
Left JOIN 
     patient_identifier pi ON p.person_id = pi.patient_id
WHERE p.uuid = :patient_uuid;";



  $patient_details = executeQuery($pdo, $sql1, [':patient_uuid' => $patient_uuid]);


  //for all visit uuids

  $sql2 = "select v.uuid from visit v 
left join person p on p.person_id =  v.patient_id 
where p.uuid =  :patient_uuid;";


  $stmt2 = $pdo->prepare($sql2);
  $stmt2->bindParam(':patient_uuid', $patient_uuid, PDO::PARAM_STR);
  $stmt2->execute();
  $visit_uuid_list = $stmt2->fetchAll(PDO::FETCH_ASSOC);

  //for visit summary
  $sql3 = "select v.visit_id AS id, v.date_started AS visitDate, vt.name AS visitType, vt.description AS Note  FROM visit v 
LEFT JOIN visit_type vt on v.visit_type_id = vt.visit_type_id 
WHERE v.uuid=:visit_uuid and v.voided=false;";



  // Prepare and execute SQL3 for each visit UUID
  $visit_summary = [];
  foreach ($visit_uuid_list as $visit) {

    $stmt3 = $pdo->prepare($sql3);
    $stmt3->bindParam(':visit_uuid', $visit['uuid'], PDO::PARAM_STR); // Use the current visit UUID
    $stmt3->execute();


    $visit_summary[] = $stmt3->fetchAll(PDO::FETCH_ASSOC);
  }


  //  $sql3 = "select *  from visit v 
  //Left join visit_type vt on v.visit_type_id = vt.visit_type_id 
  //
  //where v.uuid='4b701b2f-11fd-4737-a893-6c95b40f0b42' and v.voided=false";

  //  $stmt3 = $pdo2->prepare($sql3);
  //  $stmt3->bindParam(':visit_uuid', $visit_uuid, PDO::PARAM_STR);
  //  $stmt3->execute();


  //for diagnosis
  $sql4 = "
 SELECT
   CONCAT(person_name.given_name, ' ', IFNULL(person_name.family_name,'')) AS provider,
    diagnosis.person_id AS 'Person Id',
    diagnosis.obs_id AS 'Obs Id',
    diagnosis.obs_datetime AS 'Diagnosis Datetime',
    IFNULL(diagnosisConceptName.name, diagnosis.value_text) AS 'Diagnosis',
    certaintyConceptName.name AS 'Diagnosis Certainty',
    diagnosisOrderConceptName.name AS 'Diagnosis Order'
FROM
person pv
INNER JOIN visit latestVisit
   ON latestVisit.patient_id = pv.person_id
        AND latestVisit.voided = 0
        AND latestVisit.uuid = :visit_uuid
INNER JOIN encounter
    ON encounter.visit_id = latestVisit.visit_id
INNER JOIN obs diagnosis
    ON latestVisit.patient_id = diagnosis.person_id
    AND diagnosis.voided = 0
    AND diagnosis.encounter_id = encounter.encounter_id
    AND diagnosis.concept_id IN (
        SELECT concept_id
        FROM concept_name
        WHERE name IN ('Coded Diagnosis', 'Non-Coded Diagnosis')
        AND concept_name_type = 'FULLY_SPECIFIED'
    )
LEFT JOIN concept_name diagnosisConceptName
    ON diagnosis.value_coded = diagnosisConceptName.concept_id
    AND diagnosisConceptName.concept_name_type = 'FULLY_SPECIFIED'
LEFT JOIN encounter_provider ep
    ON diagnosis.encounter_id = ep.encounter_id
LEFT JOIN provider diagnosis_provider 
    ON diagnosis_provider.provider_id = ep.provider_id
LEFT JOIN person_name
    ON person_name.person_id = diagnosis_provider.person_id
INNER JOIN obs certainty
    ON diagnosis.obs_group_id = certainty.obs_group_id
    AND certainty.voided = 0
    AND certainty.concept_id = (
        SELECT concept_id
        FROM concept_name
        WHERE name = 'Diagnosis Certainty'
        AND concept_name_type = 'FULLY_SPECIFIED'
    )
LEFT JOIN concept_name certaintyConceptName
    ON certainty.value_coded = certaintyConceptName.concept_id
    AND certaintyConceptName.concept_name_type = 'FULLY_SPECIFIED'
INNER JOIN obs diagnosisOrder
    ON diagnosis.obs_group_id = diagnosisOrder.obs_group_id
    AND diagnosisOrder.voided = 0
    AND diagnosisOrder.concept_id = (
        SELECT concept_id
        FROM concept_name
        WHERE name = 'Diagnosis order'
        AND concept_name_type = 'FULLY_SPECIFIED'
    )
LEFT JOIN concept_name diagnosisOrderConceptName
    ON diagnosisOrder.value_coded = diagnosisOrderConceptName.concept_id
    AND diagnosisOrderConceptName.concept_name_type = 'FULLY_SPECIFIED'
LEFT JOIN obs diagnosisStatus
    ON diagnosis.obs_group_id = diagnosisStatus.obs_group_id
    AND diagnosisStatus.voided = 0
    AND diagnosisStatus.concept_id = (
        SELECT concept_id
        FROM concept_name
        WHERE name = 'Bahmni Diagnosis Status'
        AND concept_name_type = 'FULLY_SPECIFIED'
    )
LEFT JOIN concept_name diagnosisStatusConceptName
    ON diagnosisStatus.value_coded = diagnosisStatusConceptName.concept_id
    AND diagnosisStatusConceptName.concept_name_type = 'FULLY_SPECIFIED'
WHERE
    pv.uuid = :patient_uuid;
";
  $stmt4 = $pdo->prepare($sql4);
  $stmt4->bindParam(':patient_uuid', $patient_uuid, PDO::PARAM_STR);
  $stmt4->bindParam(':visit_uuid', $visit_uuid, PDO::PARAM_STR);
  $stmt4->execute();
  $diagnosis = $stmt4->fetchAll(PDO::FETCH_ASSOC);


  $sql14 = "
  SELECT DISTINCT
    pi.identifier,
    p.person_id,
    v.visit_id,
    p.birthdate,
    TIMESTAMPDIFF(YEAR,
        p.birthdate,
        v.date_created) AS age_years,
    vt.name AS visit_type,
    c.status AS condition_status,
    CASE
        WHEN c.condition_non_coded IS NOT NULL THEN c.condition_non_coded
        ELSE (SELECT 
                cn.name
            FROM
                concept_name cn
            WHERE
                cn.concept_name_type = 'FULLY_SPECIFIED'
                    AND cn.voided = 0
                    AND cn.concept_id = c.concept_id)
    END AS conditions
FROM
    person p
        JOIN
    person_name pn ON pn.person_id = p.person_id
        JOIN
    patient_identifier pi ON pi.patient_id = p.person_id
        JOIN
    visit v ON v.patient_id = p.person_id
        AND v.voided = 0
        AND v.uuid = :visit_uuid
        JOIN
    visit_type vt ON vt.visit_type_id = v.visit_type_id
        JOIN
    conditions c ON c.patient_id = v.patient_id
WHERE
    p.uuid = :patient_uuid;
  ";

  $stmt14 = $pdo->prepare($sql14);
  $stmt14->bindParam(':patient_uuid', $patient_uuid, PDO::PARAM_STR);
  $stmt14->bindParam(':visit_uuid', $visit_uuid, PDO::PARAM_STR);
  $stmt14->execute();
  $condition = $stmt14->fetchAll(PDO::FETCH_ASSOC);

  //$diagnosis = executeQuery($pdo, $sql4, [':patient_uuid' => $patient_uuid]);


  $sql5 = "SELECT  
  v.visit_id AS visit_id,
  treatment.name AS treatment_name, 
  treatment.dose AS dose,          
  cn_dose.name AS dosage_units,  
  treatment.duration AS duration,   
  cn_duration.name AS duration_units,  
  treatment.quantity AS quantity,
  cn_quantity.name AS quantity_units,  
  cn_frequency.name AS frequency,  
  cn_route.name AS route, 
  treatment.date_created,
  treatment.provider
FROM
  obs o 
  JOIN encounter e ON o.encounter_id = e.encounter_id
  JOIN visit v ON e.visit_id = v.visit_id
  INNER JOIN (
    SELECT 
      v.visit_id, 
      dor.order_id AS drug_order_id, 
      d.name, 
      o.order_id AS orders_order_id, 
      o.date_created, 
      do.dose, 
      d.dosage_form, 
      do.dose_units AS dosage_units_id, 
      do.duration,
      do.duration_units AS duration_units_id,  
      do.quantity,
      do.quantity_units AS quantity_units_id, 
      do.frequency AS frequency_id,  
      do.route AS route_id,  
      CONCAT(pn.given_name, ' ', IFNULL(pn.family_name,'')) AS provider
    FROM
      orders o
      JOIN drug_order dor ON dor.order_id = o.order_id
      JOIN drug d ON d.drug_id = dor.drug_inventory_id AND d.retired = 0
      LEFT JOIN drug_order do ON do.drug_inventory_id = dor.drug_inventory_id AND o.order_id = do.order_id
      JOIN encounter e ON e.encounter_id = o.encounter_id
      JOIN visit v ON v.visit_id = e.visit_id AND v.voided = 0
      JOIN encounter_provider ep ON o.encounter_id = ep.encounter_id
      JOIN provider treat_provider ON treat_provider.provider_id = ep.provider_id
      JOIN person_name pn ON pn.person_id = treat_provider.person_id
    WHERE
      o.order_type_id=2
      AND o.voided = 0
  ) AS treatment ON treatment.visit_id = v.visit_id
   JOIN concept_name cn_dose ON cn_dose.concept_id = treatment.dosage_units_id AND cn_dose.concept_name_type = 'FULLY_SPECIFIED' AND cn_dose.voided = 0
   JOIN concept_name cn_duration ON cn_duration.concept_id = treatment.duration_units_id AND cn_duration.concept_name_type = 'FULLY_SPECIFIED' AND cn_duration.voided = 0
   JOIN concept_name cn_quantity ON cn_quantity.concept_id = treatment.quantity_units_id AND cn_quantity.concept_name_type = 'FULLY_SPECIFIED' AND cn_quantity.voided = 0
   JOIN concept_name cn_frequency ON cn_frequency.concept_id = treatment.frequency_id AND cn_frequency.concept_name_type = 'FULLY_SPECIFIED' AND cn_frequency.voided = 0
   JOIN concept_name cn_route ON cn_route.concept_id = treatment.route_id AND cn_route.concept_name_type = 'FULLY_SPECIFIED' AND cn_route.voided = 0
WHERE 
  v.uuid = :visit_uuid
  AND v.voided = 0
  GROUP BY 
  v.visit_id
ORDER BY 
  v.uuid; ";

  // $treatments = executeQuery($pdo, $sql5, [':visit_uuid' => $visit_uuid]);

  $sql6 = "SELECT DISTINCT
    p.person_id,
    v.visit_id,
    vt.name AS visit_type,
    second_answer.note  AS 'Disposition',
    second_answer.answer  AS 'Disposition Note',
    second_answer.obs_datetime AS 'Disposition Time',
     second_answer.fullname AS 'Disposition By'
FROM
    person p
    JOIN visit v ON v.patient_id = p.person_id
        AND v.voided = 0
        AND v.uuid = :visit_uuid
    JOIN visit_type vt ON vt.visit_type_id = v.visit_type_id
    JOIN encounter e ON e.visit_id = v.visit_id
    LEFT JOIN (
        SELECT 
            v.visit_id,
            cn.name AS note,
            o.obs_datetime,
            COALESCE(
                o.value_text,
                (select distinct cn_answer.name from concept_name cn_answer where cn_answer.concept_id = o.value_coded AND cn_answer.concept_name_type = 'FULLY_SPECIFIED'
                AND cn_answer.voided = 0)) AS answer,
                 concat_ws(' ',pn.given_name,pn.middle_name,pn.family_name) as 'fullname'
        FROM
            visit v
            JOIN encounter e ON e.visit_id = v.visit_id
            JOIN obs o ON o.encounter_id = e.encounter_id
                AND o.voided = 0
                and o.order_id is null
                AND o.concept_id NOT IN (15, 16, 19, 48, 47, 50, 49)
                join users u on u.user_id = o.creator
    			join person_name pn on pn.person_id = u.person_id
            JOIN concept_name cn ON cn.concept_id = o.concept_id
                AND cn.concept_name_type = 'FULLY_SPECIFIED'
                AND cn.voided = 0
			and cn.name in ('Disposition','Disposition Note')
			where v.voided = 0 AND v.uuid = :visit_uuid
    ) AS second_answer ON second_answer.visit_id = v.visit_id
WHERE
    p.uuid = :patient_uuid;";
    
    $stmt6 = $pdo->prepare($sql6);
  $stmt6->bindParam(':visit_uuid', $visit_uuid, PDO::PARAM_STR);
  $stmt6->bindParam(':patient_uuid', $patient_uuid, PDO::PARAM_STR);
  $stmt6->execute();
  $dispositions = $stmt6->fetchAll(PDO::FETCH_ASSOC);

  //$dispositions = executeQuery($pdo, $sql6, [':patient_uuid' => $patient_uuid]);
  




$sql7 = "SELECT DISTINCT
    p.person_id,
    v.visit_id,
    vt.name AS visit_type,
    second_answer.note  AS 'Vital Sign',
    second_answer.answer  AS 'Vital Value',
    second_answer.fullname AS 'Vital Provider',
    second_answer.obs_datetime AS 'Vitals DateTime'
FROM
    person p
        JOIN
    visit v ON v.patient_id = p.person_id
        AND v.voided = 0
        AND v.uuid = :visit_uuid
        JOIN
    visit_type vt ON vt.visit_type_id = v.visit_type_id
        JOIN
    encounter e ON e.visit_id = v.visit_id
        LEFT JOIN
    (SELECT 
        v.visit_id,
            cn.name AS note,
            o.obs_datetime,
            COALESCE(o.value_datetime, o.value_numeric, o.value_text, (SELECT 
                    cn.name
                FROM
                    concept_name cn
                WHERE
                    cn.concept_name_type = 'FULLY_SPECIFIED'
                        AND cn.voided = 0
                        AND cn.concept_id = o.value_coded)) AS answer,u.username,
                        concat_ws(' ',pn.given_name,pn.middle_name,pn.family_name) as 'fullname'
    FROM
        visit v
    JOIN encounter e ON e.visit_id = v.visit_id
    JOIN obs o ON o.encounter_id = e.encounter_id
        AND o.voided = 0
	join users u on u.user_id = o.creator
    join person_name pn on pn.person_id = u.person_id
    JOIN concept_name cn ON cn.concept_id = o.concept_id
        AND cn.concept_name_type = 'FULLY_SPECIFIED'
        AND cn.name IN ('Blood Pressure','BP data-Systolic','BP data-Diastolic','Posture','Temperature','Heart rate','Respiratory rate','Oxygen saturation','Capillary Refill time','Weight')
        AND cn.voided = 0
	where v.voided = 0 and  v.uuid = :visit_uuid
    ) AS second_answer ON second_answer.visit_id = v.visit_id
WHERE
    p.uuid = :patient_uuid
    order by field(second_answer.note,'Blood Pressure','BP data-Systolic','BP data-Diastolic','Posture','Temperature','Heart rate','Respiratory rate','Oxygen saturation','Capillary Refill time','Weight')";

//  $stmt7 = $pdo->prepare($sql7);
//  $stmt7->bindParam(':visit_uuid', $visit_uuid, PDO::PARAM_STR);
//  $stmt7->bindParam(':patient_uuid', $patient_uuid, PDO::PARAM_STR);
//  $stmt7->execute();
//  $vitals = $stmt7->fetchAll(PDO::FETCH_ASSOC);

   //$vitals = executeQuery($pdo, $sql7, [':patient_uuid' => $patient_uuid, ':visit_uuid' => $visit_uuid]);
  // print_r($vitals);

  $sql8 = "SELECT DISTINCT 
    p.person_id,
    v.visit_id,
    vt.name AS visit_type,
    lab.panel_name, 
    lab.test_name,   
    lab.test_value,
    lab.date_created AS test_date_created,
    lab.provider
FROM
    person p
    JOIN visit v ON v.patient_id = p.person_id
        AND v.voided = 0
        AND v.uuid = :visit_uuid
    JOIN visit_type vt ON vt.visit_type_id = v.visit_type_id
    JOIN encounter e ON e.visit_id = v.visit_id
    LEFT JOIN (
        SELECT 
            v.visit_id,
            panel_cn.name AS panel_name, 
            cn.name AS test_name,        
            o.date_created,
            CONCAT(pn.given_name, ' ', IFNULL(pn.family_name,'')) AS provider,
            COALESCE(o1.value_numeric,
                    o1.value_text,
                    (SELECT 
                        name
                    FROM
                        concept_name
                    WHERE
                        concept_id = o1.value_coded
                        AND voided = '0'
                        AND concept_name_type = 'FULLY_SPECIFIED' AND concept_id NOT IN (38, 39))) AS test_value
        FROM
            orders o
        JOIN encounter e ON e.encounter_id = o.encounter_id
        JOIN obs o1 ON o1.order_id = o.order_id 
            AND COALESCE(o1.value_datetime, o1.value_numeric, o1.value_text, o1.value_coded) IS NOT NULL
        JOIN visit v ON v.visit_id = e.visit_id AND v.voided = 0
        JOIN encounter_provider ep ON o1.encounter_id = ep.encounter_id
        JOIN provider treat_provider ON treat_provider.provider_id = ep.provider_id
        JOIN person_name pn ON pn.person_id = treat_provider.person_id
        JOIN concept_name panel_cn ON panel_cn.concept_id = o.concept_id  
            AND panel_cn.concept_name_type = 'FULLY_SPECIFIED'
            AND panel_cn.voided = 0
        JOIN concept_name cn ON cn.concept_id = o1.concept_id
            AND cn.concept_name_type = 'FULLY_SPECIFIED'
            AND cn.voided = 0
        WHERE
            o.order_type_id IN (3)  
            AND o.voided = 0
            AND o1.concept_id NOT IN (38, 39)
    ) AS lab ON lab.visit_id = v.visit_id
ORDER BY 
    v.visit_id";

  // $lab_order = executeQuery($pdo, $sql8, [':visit_uuid' => $visit_uuid]);

  $sql9 = "SELECT  
    cn.name AS 'Radiology Name',
    o.date_activated AS 'Radiology DateTime',
    CONCAT(pn.given_name, ' ', IFNULL(pn.family_name,'')) AS 'Radiology Provider'
   FROM 
   orders o
   JOIN
   encounter e ON o.encounter_id = e.encounter_id
JOIN
    visit v ON e.visit_id = v.visit_id
    AND 
    v.uuid = :visit_uuid
    AND v.voided = 0
 JOIN 
 concept_name cn ON cn.concept_id = o.concept_id
    AND cn.concept_name_type = 'FULLY_SPECIFIED'
    AND cn.voided = 0
   LEFT JOIN encounter_provider ep ON o.encounter_id = ep.encounter_id
   LEFT JOIN provider radiology_provider ON radiology_provider.provider_id = ep.provider_id
   LEFT JOIN person_name pn ON pn.person_id = radiology_provider.person_id
  WHERE 
  o.voided = 0
  AND o.order_type_id = 4;";

  $radiology = executeQuery($pdo, $sql9, [':visit_uuid' => $visit_uuid]);


  


  
    
   //for observation
    $sql11 = "SELECT DISTINCT
    pi.identifier,
    p.person_id,
    v.visit_id,
    vt.name AS visit_type,
    second_answer.note AS observation_name,
    second_answer.answer AS obs_value,
    second_answer.fullname AS 'Observation Provider',
    second_answer.obs_datetime AS 'Observation DateTime',
    first_answer.bed_number,
    first_answer.name as location,
    o.value_text as blood_group
FROM
    person p
    JOIN person_name pn ON pn.person_id = p.person_id
    JOIN patient_identifier pi ON pi.patient_id = p.person_id
    JOIN visit v ON v.patient_id = p.person_id
        AND v.voided = 0
        AND v.uuid = :visit_uuid
    JOIN visit_type vt ON vt.visit_type_id = v.visit_type_id
    JOIN encounter e ON e.visit_id = v.visit_id
  left join ( select v.visit_id, b.bed_number,l.name from visit v 
    join encounter e on e.visit_id = v.visit_id
     join bed_patient_assignment_map bpam on bpam.patient_id = v.patient_id and bpam.encounter_id = e.encounter_id and bpam.voided =0
    join bed b on b.bed_id = bpam.bed_id and b.voided =0
    join bed_location_map blm on blm.bed_id=b.bed_id
     join location l on l.location_id = blm.location_id where v.voided = 0 ) first_answer on first_answer.visit_id = v.visit_id
    left join obs o on o.person_id = v.patient_id and o.voided =0 and o.value_text is not null  and o.concept_id in (select distinct cn.concept_id from concept_name cn where cn.name = 'Blood Group' and cn.voided =0 and cn.concept_name_type = 'FULLY_SPECIFIED')
    LEFT JOIN (
        SELECT 
            v.visit_id,
            cn.name AS note,
            o.obs_datetime,
            COALESCE(
                o.value_datetime,
                o.value_numeric,
                o.value_text,
                (select distinct cn_answer.name from concept_name cn_answer where cn_answer.concept_id = o.value_coded AND cn_answer.concept_name_type = 'FULLY_SPECIFIED' AND cn_answer.voided = 0)) AS answer,
concat_ws(' ',pn.given_name,pn.middle_name,pn.family_name) as 'fullname'
        FROM
            visit v
            JOIN encounter e ON e.visit_id = v.visit_id
            JOIN obs o ON o.encounter_id = e.encounter_id
                AND o.voided = 0
                AND o.order_id is null
               AND o.concept_id NOT IN (13,15, 16,34, 19, 48, 47, 50, 49,14,51,27,25,26)
                
    join users u on u.user_id = o.creator
    join person_name pn on pn.person_id = u.person_id
            JOIN concept_name cn ON cn.concept_id = o.concept_id
                AND cn.concept_name_type = 'FULLY_SPECIFIED'
                AND cn.voided = 0
    join concept_view cv on cv.concept_full_name = cn.name and cv.concept_class_name not in ('Radiology')            
			where v.voided = 0 AND v.uuid = :visit_uuid
    ) AS second_answer ON second_answer.visit_id = v.visit_id
WHERE
    p.uuid = :patient_uuid;"; 
    
     $stmt11 = $pdo->prepare($sql11);
  $stmt11->bindParam(':visit_uuid', $visit_uuid, PDO::PARAM_STR);
  $stmt11->bindParam(':patient_uuid', $patient_uuid, PDO::PARAM_STR);
  $stmt11->execute();
  $observation = $stmt11->fetchAll(PDO::FETCH_ASSOC);

  //$observation = executeQuery($pdo, $sql11, [':visit_uuid' => $visit_uuid, ':patient_uuid' => $patient_uuid]);


  $sql13 = "SELECT  
    cn.name AS 'other Name',
    o.date_activated AS 'other DateTime',
    CONCAT(pn.given_name, ' ', IFNULL(pn.family_name,'')) AS 'other Provider'
   FROM 
   orders o
   JOIN
   encounter e ON o.encounter_id = e.encounter_id
JOIN
    visit v ON e.visit_id = v.visit_id
    AND 
    v.uuid = :visit_uuid
    AND v.voided = 0
 JOIN 
 concept_name cn ON cn.concept_id = o.concept_id
    AND cn.concept_name_type = 'FULLY_SPECIFIED'
    AND cn.voided = 0
   LEFT JOIN encounter_provider ep ON o.encounter_id = ep.encounter_id
   LEFT JOIN provider other_provider ON other_provider.provider_id = ep.provider_id
   LEFT JOIN person_name pn ON pn.person_id = other_provider.person_id
  WHERE 
  o.voided = 0
  AND o.order_type_id = 5;";
  
   $stmt13 = $pdo->prepare($sql13);
    $stmt13->bindParam(':visit_uuid', $visit_uuid, PDO::PARAM_STR);
    $stmt13->execute();
    $other_diagnostics = $stmt13->fetchAll(PDO::FETCH_ASSOC);

   $sql16 = "SELECT DISTINCT
    pi.identifier,
    p.person_id,
    v.visit_id,
    vt.name AS visit_type,
    second_answer.note AS name,
    second_answer.item_code
FROM
    person p
        JOIN
    person_name pn ON pn.person_id = p.person_id
        JOIN
    patient_identifier pi ON pi.patient_id = p.person_id
        JOIN
    visit v ON v.patient_id = p.person_id
        AND v.voided = 0
        AND v.uuid = :visit_uuid
        JOIN
    visit_type vt ON vt.visit_type_id = v.visit_type_id
        JOIN
    encounter e ON e.visit_id = v.visit_id
        LEFT JOIN
    (SELECT 
        v.visit_id, d.name AS note,sci.item_code
    FROM
        visit v
    JOIN encounter e ON e.visit_id = v.visit_id
    JOIN orders o ON o.encounter_id = e.encounter_id
        AND o.voided = 0
    JOIN order_type ot ON ot.order_type_id = o.order_type_id
        AND ot.name = 'Procedure Order'
    JOIN drug_order dor ON dor.order_id = o.order_id
    JOIN drug d ON d.drug_id = dor.drug_inventory_id
    left join service_code_insurance sci on sci.openmrs_product_name = d.name
    WHERE
        v.voided = 0
            AND v.uuid = :visit_uuid) AS second_answer ON second_answer.visit_id = v.visit_id
WHERE
    p.uuid = :patient_uuid;";


    $stmt16 = $pdo->prepare($sql16);
    $stmt16->bindParam(':visit_uuid', $visit_uuid, PDO::PARAM_STR);
    $stmt16->bindParam(':patient_uuid', $patient_uuid, PDO::PARAM_STR);
    $stmt16->execute();
    $procedures = $stmt16->fetchAll(PDO::FETCH_ASSOC);

  //$other_diagnostics = executeQuery($pdo, $sql13, [':visit_uuid' => $visit_uuid]);

  $response = [
    'patient_details' => $patient_details,
    'visit_summary' => $visit_summary,
    'diagnosis' => $diagnosis,
    'disposition' => $dispositions,
    'vitals' => $vitals,
    'radiology' => $radiology,
    'other_diagnostics' => $other_diagnostics,
    'observation' => $observation,
    'usg_ecg_xray_note' => $usg_ecg_xray_note,
    'condition' => $condition,
    'procedures' => $procedures

  ];




  if ($response) {
    //echo json_encode($response);
    return json_encode($response);
  } else {
    // echo json_encode(["message" => "No results found"]);
    return json_encode(["message" => "No results found"]);
  }
} catch (PDOException $e) {

  die("Connection failed: " . $e->getMessage());
}
