SELECT
pi.identifier AS 'IP',
CONCAT_WS(' ', pn.given_name, pn.middle_name, pn.family_name) as 'Name',
TIMESTAMPDIFF(Year,p.birthdate,CURDATE()) AS Age_Year,
TIMESTAMPDIFF(Month,p.birthdate,CURDATE()) AS Age_Month,
p.gender,
pa.city_village as 'Municipality',
date(o.obs_datetime) as 'date_diagnosed',
pa.address1 as 'Ward',
pa.county_district as 'District',
cn.name as DIAG
FROM
person p
INNER JOIN
patient_identifier pi ON p.person_id = pi.patient_id
AND pi.identifier != 'CKT100208'
AND pi.voided = '0'
INNER JOIN
person_name pn ON pn.person_id = p.person_id
AND pn.voided = '0'
INNER JOIN
person_address pa ON pa.person_id = pn.person_id
AND pa.voided = '0'
INNER JOIN
visit v ON v.patient_id = p.person_id
INNER JOIN
obs o ON o.person_id = p.person_id
and o.voided = '0'
-- EDCD
and o.concept_id = '15' 
INNER JOIN concept_name cn 
ON o.value_coded=cn.concept_id
AND cn.concept_name_type = 'FULLY_SPECIFIED'
AND cn.name in ('Acute Gastro-Enteritis (AGE)','Gastroenteritis and colitis of unspecified origin (AGE)',
       'Acute hepatitis B','Cholera, Unspecified','Anthrax, unspecified',
       'COVID-19 suspected (clinical/epidemiological)','COVID-19 confirm by laboratory',
       'Dengue fever [classical dengue]','Dengue haemorrhagic fever','Dengue, unspecified',
       'Diptheria','Diphtheria, unspecified','Unspecified viral encephalitis','Japanese encephalitis',
       'Typhoid fever','Viral Influenza','Influenza due to identified avian influenza virus',
       'Influenza due to other identified influenza virus','Influenza with other manifestations, 
       virus not identified','Plasmodium falciparum malaria, unspecified','Unspecified malaria',
       'Plasmodium vivax malaria','Plasmodium malariae malaria','Malaria (Plasmodium mix)','Malaria (Relapse)',
       'Meningitis','Tuberculous meningitis (G01*)','Meningococcal meningitis (G01*)','Viral meningitis, unspecified',
       'Bacterial meningitis, not elsewhere classified','Meningitis due to other and unspecified causes',
       'Neonatal Tetanus','Obstetrical tetanus','Tetanus neonatorum','SARI-Severe Acute Respiratory Infection',
       'Scrub Typhus','Measles','Measles without complication','Other Rabies Susceptible Animal Bite',
       'Rabies, unspecified','Arenaviral haemorrhagic fever','Other viral haemorrhagic fevers, not elsewhere classified',
       'Unspecified viral haemorrhagic fever','Whooping Cough','Whooping cough, unspecified','Yellow fever',
       'Snake Bite: Poisonous','Snake Bite: Non‐Poisonous',
       'Toxic effect of contact with venomous animals (Poisonous snake bite)')
where p.voided = '0'
and date(o.obs_datetime) between '#startDate#' and '#endDate#'
group by IP, Name, Age_Year,Age_Month, gender, Municipality, Ward, District, diag
ORDER BY date_diagnosed ASC;