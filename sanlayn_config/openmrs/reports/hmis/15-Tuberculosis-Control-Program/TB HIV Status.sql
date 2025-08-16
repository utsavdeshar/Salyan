 select first_gender.gender,
       IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.hiv_status= 'TRUE' THEN raw.person_id
                END),
            0) AS 'hiv_positive',
                 IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.hiv_status= 'False' THEN raw.person_id
                END),
            0) AS 'hiv_neg',
     IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.on_art= 'TRUE' THEN raw.person_id
                END),
            0) AS 'on_art',
                IFNULL(COUNT(DISTINCT CASE
                    WHEN raw.on_cpt = 'TRUE' THEN raw.person_id
                END),
            0) AS 'on_cpt'
 
 
 from    (SELECT 'F' AS gender UNION SELECT 'M' AS gender ) AS first_gender
        LEFT JOIN

(select p.gender,cov.value_concept_full_name as hiv_status,cov1.value_concept_full_name as on_art,cov2.value_concept_full_name as on_cpt,p.person_id
 from visit v
inner join encounter e on e.visit_id = v.visit_id
inner join person p on p.person_id = v.patient_id
    INNER JOIN obs o ON o.encounter_id = e.encounter_id
        AND o.concept_id in (SELECT 
            concept_id
        FROM
            concept_name
        WHERE
            name in( 'Tuberculosis Intake Note') AND voided = 0
                AND concept_name_type = 'FULLY_SPECIFIED')
left join coded_obs_view cov on cov.encounter_id = e.encounter_id and cov.concept_full_name in ('TB intake-HIV result') and cov.voided = 0
left join coded_obs_view cov1 on cov1.encounter_id = e.encounter_id and cov1.concept_full_name in ( 'TB Intake-Is patient on ART') and cov1.voided = 0
left join coded_obs_view cov2 on cov2.encounter_id = e.encounter_id and cov2.concept_full_name = 'TB Intake-Is patient on CPT' and cov2.voided = 0
where v.voided = 0 and date(o.obs_datetime) between '2024-01-01' and '2024-01-22') raw
on raw.gender = first_gender.gender
 group by first_gender.gender

