SELECT distinct  pv.identifier as ID, pv.gender as GENDER, CONCAT_WS(' ', pn.given_name, pn.middle_name, pn.family_name) as 'Name', 
pa.city_village as 'VDC',
pa.address1 as 'Ward',
pa.county_district as 'District', cn1.name,    
TIMESTAMPDIFF(YEAR, pv.birthdate, v.date_started) AS Age,
CASE 
WHEN cd1.name = 'Coded' THEN cn1.name         
WHEN cd1.name = 'Numeric' THEN o1.value_numeric        
WHEN cd1.name = 'Text' THEN o1.value_text         
WHEN cd1.name = 'Boolean' THEN cn2.name         
WHEN cd1.name = 'Datetime' THEN o1.value_datetime         
WHEN cd3.name = 'Date' THEN date(o1.value_datetime)     
END AS 'If Any',      
date(e.encounter_datetime) as 'ANC Test Date' FROM     patient_view pv     
INNER JOIN visit v ON v.patient_id = pv.patient_id and v.voided = 0 
INNER JOIN person p ON p.person_id = v.patient_id
INNER JOIN person_name pn ON pn.person_id = p.person_id AND pn.voided = '0'
INNER JOIN person_address pa ON pa.person_id = pn.person_id AND pa.voided = '0'   
INNER JOIN encounter e ON e.visit_id = v.visit_id and e.voided = 0          
LEFT JOIN obs o1 ON e.encounter_id = o1.encounter_id and o1.voided = 0     
INNER JOIN concept c1 ON c1.concept_id = o1.concept_id     
INNER JOIN concept_datatype cd1 ON c1.datatype_id = cd1.concept_datatype_id  
LEFT JOIN concept_name cn1 ON cn1.concept_id = o1.value_coded and cn1.concept_name_type = 'FULLY_SPECIFIED'      
LEFT JOIN obs o2 ON e.encounter_id = o2.encounter_id and o2.voided = 0     
INNER JOIN concept c2 ON c2.concept_id = o2.concept_id     
INNER JOIN concept_datatype cd2 ON c2.datatype_id = cd2.concept_datatype_id  
LEFT JOIN concept_name cn2 ON cn2.concept_id = o2.value_coded and cn2.concept_name_type = 'FULLY_SPECIFIED'      
LEFT JOIN obs o3 ON e.encounter_id = o3.encounter_id and o3.voided = 0     
INNER JOIN concept c3 ON c3.concept_id = o3.concept_id     
INNER JOIN concept_datatype cd3 ON c3.datatype_id = cd3.concept_datatype_id  
LEFT JOIN concept_name cn3 ON cn3.concept_id = o3.value_coded 
and cn3.concept_name_type = 'FULLY_SPECIFIED' where  
o1.concept_id = 6813
AND date(o1.obs_datetime) between date'#startDate#' and '#endDate#'
order by v.visit_id DESC ; 