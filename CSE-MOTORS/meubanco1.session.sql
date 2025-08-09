
-- Execute no VS Code ou terminal psql:
-- No VS Code/psql, execute:
SELECT * FROM pg_stat_activity WHERE state = 'idle in transaction';