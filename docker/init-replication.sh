#!/bin/bash
# Runs once inside the primary DB container on first start.
# Creates the replication user and a physical replication slot for replica1.
set -e

psql -v ON_ERROR_STOP=1 -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" <<-EOSQL
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'replicator') THEN
            CREATE USER replicator WITH REPLICATION LOGIN ENCRYPTED PASSWORD '${REPLICATION_PASSWORD}';
        END IF;
    END
    \$\$;

    SELECT CASE
        WHEN NOT EXISTS (
            SELECT 1 FROM pg_replication_slots WHERE slot_name = 'replica1_slot'
        )
        THEN pg_create_physical_replication_slot('replica1_slot')
    END;
EOSQL
