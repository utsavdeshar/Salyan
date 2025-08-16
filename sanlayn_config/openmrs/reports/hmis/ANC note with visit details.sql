SELECT distinct
 pi.identifier AS 'IP',
 CONCAT_WS(' ', pn.given_name, pn.middle_name, pn.family_name) as 'Name', 
 TIMESTAMPDIFF(YEAR,p.birthdate,CURDATE()) AS age,
 p.gender,
 pa.city_village as 'VDC',
 pa.address1 as 'Ward',
 pa.county_district as 'District',
 date(e.encounter_datetime) as 'ANC Test Date' ,
 (select name from concept_name where concept_id = o2.value_coded and voided = '0' and concept_name_type = 'FULLY_SPECIFIED') as 'ANC-Visit month',
    (select name from concept_name where concept_id = o3.value_coded and voided = '0' and concept_name_type = 'FULLY_SPECIFIED') as 'ANC-ANC visit',
    (select name from concept_name where concept_id = o4.value_coded and voided = '0' and concept_name_type = 'FULLY_SPECIFIED') as 'ANC-Completed 4 ANC visits',
    (select name from concept_name where concept_id = o5.value_coded and voided = '0' and concept_name_type = 'FULLY_SPECIFIED') as 'ANC-Completed 8 ANC visits'
FROM
   person p
        INNER JOIN
    patient_identifier pi ON p.person_id = pi.patient_id
        AND pi.identifier != 'CKT200000'
        INNER JOIN
    person_name pn ON pn.person_id = p.person_id
        AND pn.voided = '0'
        INNER JOIN
    person_address pa ON pa.person_id = pn.person_id
    AND pa.voided = '0'
    INNER JOIN
    person_attribute pat ON pat.person_id = pn.person_id
    AND pat.voided = '0'
    INNER JOIN
    visit v ON v.patient_id = p.person_id
    and v.voided = '0'
    INNER JOIN
    encounter e ON e.visit_id = v.visit_id
        AND e.voided = '0'
        LEFT JOIN
    obs o ON o.encounter_id = e.encounter_id
         AND o.concept_id = '20016'
        AND o.voided = '0'
        LEFT JOIN
        obs o2 ON o2.encounter_id = e.encounter_id
        AND o2.concept_id = '19951'
        and o2.voided = '0'
        LEFT JOIN
        obs o3 ON o3.encounter_id = e.encounter_id
        AND o3.concept_id = '19962'
        and o3.voided = '0'
        LEFT JOIN
        obs o4 ON o4.encounter_id = e.encounter_id
        AND o4.concept_id = '19963'
        and o4.voided = '0'        
        LEFT JOIN
        obs o5 ON o5.encounter_id = e.encounter_id
        AND o5.concept_id = '19964'
        and o5.voided = '0'        
where (o.obs_datetime is NOT null or o2.value_coded is NOT null or o3.value_coded is NOT null or o4.value_coded is not null )
and date(o.obs_datetime) 
-- between '2025-3-01' and '2025-03-05'
between '#startDate#' and '#endDate#'
ORDER BY IP, DATE(o.value_datetime) ASC;