SELECT 
    raw.NCF AS 'New Clients Female',
    raw.NCM AS 'New Clients Male',
    (raw.Total_Clients_Female - raw.NCF) AS 'Total Old OPD Visit Female',
    (raw.Total_Clients_Male - raw.NCM) AS 'Total Old OPD Visit Male'
FROM
    (SELECT 
        IF(patient.patient_id IS NULL, 0, SUM(IF(DATE(patient.date_created) BETWEEN CAST('#startDate#' AS DATE) AND CAST('#endDate#' AS DATE), IF(person.gender = 'F', 1, 0), 0))) AS 'NCF',
            IF(patient.patient_id IS NULL, 0, SUM(IF(DATE(patient.date_created) BETWEEN CAST('#startDate#' AS DATE) AND CAST('#endDate#' AS DATE), IF(person.gender = 'M', 1, 0), 0))) AS 'NCM',
            IF(patient.patient_id IS NULL, 0, SUM(IF(person.gender = 'F', 1, 0))) AS 'Total_Clients_Female',
            IF(patient.patient_id IS NULL, 0, SUM(IF(person.gender = 'M', 1, 0))) AS 'Total_Clients_Male'
    FROM
        visit
    INNER JOIN patient ON visit.patient_id = patient.patient_id
        AND DATE(visit.date_started) BETWEEN CAST('#startDate#' AS DATE) AND CAST('#endDate#' AS DATE)
        AND patient.voided = 0
        AND visit.voided = 0
    INNER JOIN person ON person.person_id = patient.patient_id
        AND person.voided = 0
    INNER JOIN visit_type vt ON vt.visit_type_id = visit.visit_type_id
        AND vt.name = 'OPD') AS raw