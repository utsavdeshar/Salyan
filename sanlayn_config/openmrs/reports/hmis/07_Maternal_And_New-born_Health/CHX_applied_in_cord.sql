SELECT 
  COUNT(CASE WHEN question_full_name = 'Breast feeding within a Hour' AND answer_full_name = 'True' THEN 1 END) AS 'Breast feeding within a Hour',
  COUNT(CASE WHEN question_full_name = 'NBA-Chlorhexidine applied on cord' AND answer_full_name = 'True' THEN 1 END) AS 'CHX applied in cord'
  
FROM nonVoidedQuestionAnswerObs
WHERE question_full_name IN ('NBA-Chlorhexidine applied on cord', 'Breast feeding within a Hour')
  AND answer_full_name = 'True'
  AND DATE(obs_datetime) BETWEEN '#startDate#' AND '#endDate#';
  
