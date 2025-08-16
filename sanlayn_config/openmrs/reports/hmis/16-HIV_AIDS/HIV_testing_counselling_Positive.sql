SELECT 
    "Total" AS 'HTC Programme-Positive',    
    IFNULL(SUM(entries.`Sex Worker-M`), 0) AS 'Sex Worker-M',
    IFNULL(SUM(entries.`Sex Worker-F`), 0) AS 'Sex Worker-F',        
    IFNULL(SUM(entries.`Sex Worker-TG`), 0) AS 'Sex Worker-TG',
    IFNULL(SUM(entries.`Who Inject Drugs-M`), 0) AS 'Who Inject Drugs-M',
    IFNULL(SUM(entries.`Who Inject Drugs-F`), 0) AS 'Who Inject Drugs-F',        
    IFNULL(SUM(entries.`Who Inject Drugs-TG`), 0) AS 'Who Inject Drugs-TG',        
    IFNULL(SUM(entries.`MSM and Transgenders-M`), 0) AS 'MSM and Transgenders-M',
    IFNULL(SUM(entries.`MSM and Transgenders-F`), 0) AS 'MSM and Transgenders-F',
    IFNULL(SUM(entries.`MSM and Transgenders-TG`), 0) AS 'MSM and Transgenders-TG',
    IFNULL(SUM(entries.`Blood/Organ Recipient-M`), 0) AS 'Blood/Organ Recipient-M',
    IFNULL(SUM(entries.`Blood/Organ Recipient-F`), 0) AS 'Blood/Organ Recipient-F',        
    IFNULL(SUM(entries.`Blood/Organ Recipient-TG`), 0) AS 'Blood/Organ Recipient-TG',
    IFNULL(SUM(entries.`Client of Sex Worker-M`), 0) AS 'Client of Sex Worker-M',
    IFNULL(SUM(entries.`Client of Sex Worker-F`), 0) AS 'Client of Sex Worker-F',        
    IFNULL(SUM(entries.`Client of Sex Worker-O`), 0) AS 'Client of Sex Worker-O',        
    IFNULL(SUM(entries.`Migrant- M`), 0) AS 'Migrant- M',
    IFNULL(SUM(entries.`Migrant- F`), 0) AS 'Migrant- F',
    IFNULL(SUM(entries.`Migrant- TG`), 0) AS 'Migrant- TG',
    IFNULL(SUM(entries.`Spouse of Migrant- M`), 0) AS 'Spouse of Migrant- M',
    IFNULL(SUM(entries.`Spouse of Migrant- F`), 0) AS 'Spouse of Migrant- F',
    IFNULL(SUM(entries.`Spouse of Migrant- TG`), 0) AS 'Spouse of Migrant- TG',
    IFNULL(SUM(entries.`Others-M`), 0) AS 'Others-M',
    IFNULL(SUM(entries.`Others-F`), 0) AS 'Others-F',                
    IFNULL(SUM(entries.`Others-TG`), 0) AS 'Others-TG',                
    IFNULL(SUM(entries.`Age < 15 years`), 0) AS 'Age < 15 years',                
    IFNULL(SUM(entries.`Age 14-49 years`), 0) AS 'Age 14-49 years',                
    IFNULL(SUM(entries.`Age >49 years`), 0) AS 'Age >49 years'
    
FROM
(SELECT age,
SUM(IF(  age <15,1,0)) AS 'Age < 15 years',
SUM(IF(  age >14 && age <50,1,0)) AS 'Age 14-49 years',
SUM(IF(  age >49,1,0)) AS 'Age >49 years',
SUM(IF(  report.risk_group = 'Sex Worker' && report.gender = 'M',1,0)) AS 'Sex Worker-M',
		SUM(IF(  report.risk_group = 'Sex Worker' && report.gender = 'F',1,0)) AS 'Sex Worker-F',		
        SUM(IF(  report.risk_group = 'Sex Worker' && report.gender = 'O',1,0)) AS 'Sex Worker-TG',
        SUM(IF(  report.risk_group = 'People Who Inject Drugs' && report.gender = 'M',1,0)) AS 'Who Inject Drugs-M',
		SUM(IF(  report.risk_group = 'People Who Inject Drugs' && report.gender = 'F',1,0)) AS 'Who Inject Drugs-F',		
        SUM(IF(  report.risk_group = 'People Who Inject Drugs' && report.gender = 'O',1,0)) AS 'Who Inject Drugs-TG',		
        SUM(IF(  report.risk_group = 'MSM and Transgenders' && report.gender = 'M',1,0)) AS 'MSM and Transgenders-M',
		SUM(IF(  report.risk_group = 'MSM and Transgenders' && report.gender = 'F',1,0)) AS 'MSM and Transgenders-F',
		SUM(IF(  report.risk_group = 'MSM and Transgenders' && report.gender = 'O',1,0)) AS 'MSM and Transgenders-TG',
		SUM(IF(  report.risk_group = 'Blood or Organ Recipient' && report.gender = 'M',1,0)) AS 'Blood/Organ Recipient-M',
		SUM(IF(  report.risk_group = 'Blood or Organ Recipient' && report.gender = 'F',1,0)) AS 'Blood/Organ Recipient-F',		
        SUM(IF(  report.risk_group = 'Blood or Organ Recipient' && report.gender = 'O',1,0)) AS 'Blood/Organ Recipient-TG',
		SUM(IF(  report.risk_group = 'Client of Sex Worker' && report.gender = 'M',1,0)) AS 'Client of Sex Worker-M',
		SUM(IF(  report.risk_group = 'Client of Sex Worker' && report.gender = 'F',1,0)) AS 'Client of Sex Worker-F',		
        SUM(IF(  report.risk_group = 'Client of Sex Worker' && report.gender = 'O',1,0)) AS 'Client of Sex Worker-O',		
        SUM(IF(  report.risk_group = 'Migrant' && report.gender = 'M',1,0)) AS 'Migrant- M',
		SUM(IF(  report.risk_group = 'Migrant' && report.gender = 'F',1,0)) AS 'Migrant- F',
        SUM(IF(  report.risk_group = 'Migrant' && report.gender = 'O',1,0)) AS 'Migrant- TG',
        SUM(IF(  report.risk_group = 'Spouse/Partner of Migrant' && report.gender = 'M',1,0)) AS 'Spouse of Migrant- M',
		SUM(IF(  report.risk_group = 'Spouse/Partner of Migrant' && report.gender = 'F',1,0)) AS 'Spouse of Migrant- F',
        SUM(IF(  report.risk_group = 'Spouse/Partner of Migrant' && report.gender = 'O',1,0)) AS 'Spouse of Migrant- TG',
        SUM(IF(  report.gender = 'M' && (report.labCheck = 0 || report.risk_group='Others')  ,1,0)) AS 'Others-M',
		SUM(IF(  report.gender = 'F' && (report.labCheck = 0 || report.risk_group='Others') ,1,0)) AS 'Others-F',		        
        SUM(IF(  report.gender = 'O' && (report.labCheck = 0 || report.risk_group='Others') ,1,0)) AS 'Others-TG'
FROM
(SELECT 
       DISTINCT
        patients.pid as ppid,
        tested_now.tid as ttid,
            tested_now.gend as gender,
            patients.risk_group,
            IF(tested_now.tid = patients.pid,1,0) AS labCheck,
             IF(tested_now.test_result = 'Positive' || tested_before.previous_test_result = 'Positive', 1, 0) AS tested,
          TIMESTAMPDIFF(YEAR, tested_now.birthdate, tested_now.startdate)  AS age

    FROM
  (SELECT DISTINCT
        person.person_id as tid,
		person.birthdate,
        test_result.value_text AS test_result,
        visit.date_started as startdate,
        person.gender as gend
    FROM
        visit
    JOIN encounter ON visit.visit_id = encounter.visit_id
        AND DATE(visit.date_started) BETWEEN '#startDate#' AND '#endDate#'
    INNER JOIN obs AS test_result ON test_result.encounter_id = encounter.encounter_id
        AND test_result.voided = 0
                AND test_result.value_text IS NOT NULL
    INNER JOIN concept_view test_concept ON test_result.concept_id = test_concept.concept_id
        AND test_concept.concept_full_name IN ('HIV (Blood)' , 'HIV (Serum)')
    INNER JOIN person ON test_result.person_id = person.person_id  group by person.person_id) AS tested_now 
     
    LEFT JOIN
      (SELECT 
        person.person_id as pid,
            risk_group_values.concept_full_name AS risk_group,
            visit.date_started
    FROM
        visit
    JOIN encounter ON visit.visit_id = encounter.visit_id
        AND DATE(visit.date_started) BETWEEN '#startDate#' AND '#endDate#'
    INNER JOIN obs AS risk_group ON risk_group.encounter_id = encounter.encounter_id
        AND risk_group.voided = 0
    INNER JOIN concept_view ON risk_group.concept_id = concept_view.concept_id
        AND concept_view.concept_full_name = 'HTC-Risk group'
    INNER JOIN concept_view AS risk_group_values ON risk_group.value_coded = risk_group_values.concept_id
    INNER JOIN person ON risk_group.person_id = person.person_id) AS patients ON tested_now.tid = patients.pid
    LEFT OUTER JOIN (SELECT 
        person.person_id,
            value_tested.concept_full_name AS previous_test_result
    FROM
        visit
    JOIN encounter ON visit.visit_id = encounter.visit_id
        AND DATE(visit.date_started) BETWEEN '#startDate#' AND '#endDate#'
    INNER JOIN obs AS previously_tested ON previously_tested.encounter_id = encounter.encounter_id
        AND previously_tested.voided = 0
    INNER JOIN concept_view AS previously_tested_concept ON previously_tested.concept_id = previously_tested_concept.concept_id
        AND previously_tested_concept.concept_full_name = 'HTC-Result if tested'
    INNER JOIN concept_view AS value_tested ON value_tested.concept_id = previously_tested.value_coded
    INNER JOIN person ON previously_tested.person_id = person.person_id) AS tested_before ON patients.pid = tested_before.person_id
  )AS report 
)entries

;