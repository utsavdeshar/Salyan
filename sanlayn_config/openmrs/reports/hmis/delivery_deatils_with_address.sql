SELECT 
 pi.identifier AS 'IP',
 concat_ws(' ',pn.given_name,pn.middle_name,pn.family_name) as 'Full-Name',
 p.gender,
 pa.city_village as 'Municipality',
 pa.address1 as 'Ward',
 pa.county_district as 'District',
 (select name from concept_name where concept_id = o2.value_coded and voided = '0' and concept_name_type = 'FULLY_SPECIFIED') as 'Delivery Method',
    (select name from concept_name where concept_id = o3.value_coded and voided = '0' and concept_name_type = 'FULLY_SPECIFIED') as 'Outcome of Delivery',
    (select name from concept_name where concept_id = o4.value_coded and voided = '0' and concept_name_type = 'FULLY_SPECIFIED') as 'Presentation',
    (select name from concept_name where concept_id = o5.value_coded and voided = '0' and concept_name_type = 'FULLY_SPECIFIED') as 'Delivery-Gravida'
FROM
   person p
        INNER JOIN
    patient_identifier pi ON p.person_id = pi.patient_id
        AND pi.voided = '0'
        -- AND DATE(pi.date_created) >= @dt
        AND p.voided = '0'
        INNER JOIN
    person_name pn ON pn.person_id = p.person_id
        AND pn.voided = '0'
        INNER JOIN
    person_address pa ON pa.person_id = pn.person_id
    AND pa.voided = '0'
    INNER JOIN
    visit v ON v.patient_id = p.person_id
    and v.voided = '0'
    INNER JOIN
    encounter e ON e.visit_id = v.visit_id
        AND e.voided = '0'
        LEFT JOIN
    obs o ON o.encounter_id = e.encounter_id
         AND o.concept_id = '6571'
        AND o.voided = '0'
        LEFT JOIN
        obs o2 ON o2.encounter_id = e.encounter_id
        AND o2.concept_id = '6576'
        and o2.voided = '0'
        LEFT JOIN
        obs o3 ON o3.encounter_id = e.encounter_id
        AND o3.concept_id = '6590'
        and o3.voided = '0'
        LEFT JOIN
        obs o4 ON o4.encounter_id = e.encounter_id
        AND o4.concept_id = '6598'
        and o4.voided = '0'
        LEFT JOIN
        obs o5 ON o5.encounter_id = e.encounter_id
        AND o5.concept_id = '6833'
        and o5.voided = '0'
where (o.value_datetime is NOT null or o2.value_coded is NOT null or o3.value_coded is NOT null or o4.value_coded is not null or o5.value_coded is not null)
and date(e.encounter_datetime) between '#startDate#' and '#endDate#'
ORDER BY DATE(o.value_datetime) DESC