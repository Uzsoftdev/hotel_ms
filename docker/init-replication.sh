#!/bin/bash
# Runs once inside the primary DB container on first start.
# Creates the replication user, replication slot, and pg_hba entry.
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

# Allow replication connections from any host in the Docker network.
# Without this the replica gets: no pg_hba.conf entry for replication connection.
HBA_FILE=$(psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -t -A -c "SHOW hba_file;")
ENTRY="host replication replicator 0.0.0.0/0 trust"
if ! grep -qF "${ENTRY}" "${HBA_FILE}"; then
    echo "${ENTRY}" >> "${HBA_FILE}"
    psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c "SELECT pg_reload_conf();"
fi
