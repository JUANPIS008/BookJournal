
-- =========================================
-- Script de seguridad para PostgreSQL
-- Proyecto: BookJournal
-- =========================================

-- Crear usuario de la aplicación
CREATE USER bookjournal_app WITH PASSWORD 'CHANGE_ME';

-- Permitir conexión a la base de datos
GRANT CONNECT ON DATABASE bookjournal_db TO bookjournal_app;

-- Restringir acceso público
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;

-- Dar acceso al esquema
GRANT USAGE ON SCHEMA public TO bookjournal_app;

-- Permisos sobre tablas
GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
TO bookjournal_app;

-- Permisos futuros para nuevas tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLES TO bookjournal_app;
