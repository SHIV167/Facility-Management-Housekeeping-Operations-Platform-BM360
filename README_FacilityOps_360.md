# Facility Management & Housekeeping Operations Platform

## Project README and Software Development Blueprint

> **Project type:** Enterprise facility management, housekeeping,
> workforce deployment, attendance, inspections, and operations
> management platform\
> **Working name:** FacilityOps 360\
> **Target environment:** Large campuses, convention centres, exhibition
> venues, public facilities, and multi-agency operations\
> **Document status:** Initial product and technical blueprint\
> **Version:** 1.0

------------------------------------------------------------------------

## 1. Project Overview

FacilityOps 360 is a proposed web and mobile platform for managing
housekeeping and facility operations across a large site such as a
convention centre or exhibition campus.

The platform centralizes operational information that may otherwise be
maintained in separate Excel files, paper registers, WhatsApp messages,
and manual reports.

It is designed for four principal user groups:

1.  **Management** -- organization-wide monitoring, approvals,
    analytics, and escalations.
2.  **Site officials and supervisors** -- attendance verification,
    inspections, task monitoring, and zone-level supervision.
3.  **Service agencies** -- employee records, shift planning,
    deployment, replacements, and work completion.
4.  **Security/checkpoint personnel** -- authorized checkpoint and
    access-related workflows.

The system should provide a common source of truth for employees,
agencies, sites, zones, shifts, attendance, deployment, work orders,
inspections, complaints, and reports.

### Important scope and accuracy note

This document is a development blueprint based on the visible
information and screenshots supplied for the BM360 website and login
page, together with recommended enterprise software practices. It does
**not** establish BM360's actual source code, database, vendors,
internal architecture, or complete feature set. FacilityOps 360 is a
proposed original implementation. Do not copy BM360's private code,
protected branding, or proprietary design assets.

------------------------------------------------------------------------

## 2. Product Goals

-   Replace fragmented registers and spreadsheets with centralized
    records.
-   Maintain one unique identity for every employee.
-   Prevent duplicate employee and attendance records.
-   Track manpower by agency, campus, building, zone, date, and shift.
-   Provide controlled access based on a user's role and assigned
    responsibility.
-   Record attendance with timestamps and, where permitted, location
    verification.
-   Assign, track, inspect, and close operational work orders.
-   Maintain photographic evidence and an audit trail.
-   Identify absenteeism, understaffing, overdue tasks, and unresolved
    complaints.
-   Generate reliable daily, weekly, monthly, and agency-wise reports.
-   Support future integration with payroll, access-control, HR, and
    other enterprise systems.

## 3. Users and Access Roles

Access must be controlled by **Role-Based Access Control (RBAC)** and,
where necessary, by site, agency, and zone assignments.

  -----------------------------------------------------------------------
  Role                    Main responsibilities   Typical access
  ----------------------- ----------------------- -----------------------
  Platform Super Admin    Configure the platform  Full system
                          and manage all          configuration
                          tenants/settings        

  Management              Monitor operations,     All authorized sites
                          approve exceptions,     and reports
                          review performance      

  ITPO/Site Official      Supervise assigned      Assigned sites and
                          sites and verify        zones
                          operations              

  Supervisor              Check teams, inspect    Assigned teams and
                          work, approve or reject zones
                          tasks                   

  Agency Admin/Manager    Manage the agency's     Own agency records
                          employees, shifts, and  
                          deployment              

  Agency Operator         Perform authorized data Limited agency records
                          entry and roster        
                          updates                 

  Housekeeping Employee   View own shift/tasks    Own profile and
                          and submit permitted    assigned tasks
                          updates                 

  Security Checkpoint     Perform authorized      Assigned checkpoint
  User                    checkpoint operations   workflows

  Auditor/Read-only User  Review reports and      Read-only authorized
                          audit history           records
  -----------------------------------------------------------------------

### Authorization rules

-   An agency must not view or edit another agency's employee records.
-   A supervisor must only access assigned sites, zones, and teams
    unless explicitly granted broader rights.
-   Employees should only see their own profile, attendance, and
    assigned tasks.
-   Management access must be explicitly granted and logged.
-   Sensitive actions---such as employee deactivation, attendance
    correction, approval override, and role changes---must be audited.
-   Hiding a button in the user interface is not sufficient security.
    The backend must enforce every permission.

------------------------------------------------------------------------

## 4. Main Application Interfaces

### 4.1 Management Web Portal

A desktop-first dashboard for management.

Recommended features:

-   Organization-wide overview.
-   Present, absent, late, and on-leave workforce counts.
-   Agency-wise and site-wise manpower.
-   Zone-wise deployment and vacancies.
-   Shift coverage.
-   Open, overdue, and completed work orders.
-   Complaint status and escalation queue.
-   Inspection results and SLA performance.
-   Downloadable Excel, CSV, and PDF reports.
-   User, role, and master-data administration.
-   Audit log and exception approvals.

### 4.2 Site Official / Supervisor Portal

A responsive web interface or mobile application.

Recommended features:

-   Assigned sites, zones, and teams.
-   Daily roster and attendance view.
-   Attendance exceptions.
-   Zone inspection checklist.
-   Task assignment and verification.
-   Photo evidence review.
-   Rework requests and approvals.
-   Complaint assignment and closure.
-   Shift handover notes.
-   Daily activity reports.

### 4.3 Agency Portal

Recommended features:

-   Agency profile and authorized users.
-   Employee master and document status.
-   Supervisor/team mapping.
-   Shift roster and deployment.
-   Attendance monitoring.
-   Absence and replacement management.
-   Work order status.
-   Performance and compliance reports.
-   Export of authorized employee and attendance data.

### 4.4 Housekeeping Employee Mobile App

Recommended features:

-   Secure sign-in.
-   Personal profile and assigned agency.
-   Today's shift and reporting location.
-   Check-in/check-out, subject to configured policy.
-   Assigned cleaning or facility tasks.
-   Task status updates.
-   Photo submission where required.
-   Supervisor instructions and notifications.
-   Attendance and task history.

### 4.5 Security Checkpoint Interface

This module must be defined with the site authority. Possible functions
include:

-   Checkpoint identity and shift handover.
-   Authorized visitor/vendor or movement logging, if in scope.
-   Incident reporting.
-   Time-stamped checkpoint observations.
-   Escalation to the designated authority.

Security data should be segregated from housekeeping data unless an
approved operational workflow requires sharing.

------------------------------------------------------------------------

## 5. Functional Modules

### 5.1 Organization and Agency Master

Store the organization, service agencies, contract references, contact
persons, and active/inactive status.

### 5.2 Employee Master

Suggested fields:

-   Permanent Employee ID (system-generated and unique).
-   Full name.
-   Father's/guardian's name, if required by policy.
-   Mobile number.
-   Alternate contact, if permitted.
-   Agency ID.
-   Designation.
-   Employment status.
-   Joining and exit dates.
-   Assigned site and default zone.
-   Emergency contact, if required.
-   Documents and verification status, where legally and operationally
    necessary.

**Data quality rules:**

-   Employee ID must be unique and immutable.
-   Mobile numbers should be normalized and validated.
-   Do not use name alone as an identity key.
-   Duplicate detection should consider mobile number, agency, and other
    approved identifiers.
-   If a mobile number is shared or changed, use an authorized exception
    process rather than silently merging employees.
-   Deactivation should preserve historical attendance and task records.

### 5.3 Site, Building, and Zone Master

Recommended hierarchy:

`Organization → Campus/Site → Building/Area → Floor/Level → Zone/Location`

Example location types:

-   Exhibition hall.
-   Plenary or conference area.
-   Outdoor amphitheatre.
-   Gate or checkpoint.
-   Washroom.
-   Corridor.
-   Office.
-   Parking or external area.

Each zone should have a unique code, name, parent location, active
status, optional map coordinates/geofence, and responsible supervisor.

### 5.4 Shift Management

Support configurable shifts, including 8-hour and 12-hour patterns where
authorized.

Store:

-   Shift code and name.
-   Start and end times.
-   Break policy.
-   Grace period.
-   Overnight-shift flag.
-   Applicable site and workforce category.
-   Effective dates.
-   Overtime and approval rules.

Overnight shifts must be handled correctly when the end time falls on
the following calendar day.

### 5.5 Deployment and Rostering

Assign employees to:

-   Agency.
-   Site/campus.
-   Building/zone.
-   Shift.
-   Supervisor/team.
-   Effective date and deployment status.

The system should flag:

-   Employees without a deployment.
-   Duplicate active deployments for the same time period.
-   Zone understaffing against approved manpower requirements.
-   Shift overlaps.
-   Inactive employees assigned to a roster.

### 5.6 Attendance Management

Recommended functions:

-   Check-in and check-out.
-   Manual attendance entry with reason and approval.
-   Present, absent, late, half-day, leave, weekly off, and other
    configurable statuses.
-   GPS/location evidence where lawful and appropriate.
-   Device and server timestamps.
-   Duplicate punch prevention.
-   Missed punch correction workflow.
-   Shift-wise attendance.
-   Attendance locking after approval.
-   Exportable attendance register.

**Important:** GPS is not proof by itself. Use location accuracy,
geofence checks, server-side validation, device signals, and supervisor
review. Provide a documented exception path for GPS failure, poor
connectivity, shared devices, or authorized manual corrections. Do not
use covert tracking.

### 5.7 Work Order and Task Management

A work order should include:

-   Work order number.
-   Category and description.
-   Site and zone.
-   Priority.
-   Requester.
-   Assigned agency/team/person.
-   Created time and due time.
-   SLA target.
-   Status.
-   Completion notes.
-   Evidence attachments.
-   Supervisor verification.
-   Rework reason, if rejected.

Suggested lifecycle:

`Draft → Assigned → Accepted → In Progress → Submitted for Inspection → Approved/Rejected → Closed`

Rejected tasks should return to an actionable state with a recorded
reason.

### 5.8 Inspection and Quality Assurance

-   Configurable checklists by zone and task category.
-   Inspection schedule.
-   Pass/fail or scored result.
-   Remarks and photographs.
-   Corrective action.
-   Reinspection.
-   Inspector identity and timestamp.
-   Quality trend by agency, site, and zone.

### 5.9 Complaint Management

-   Complaint registration.
-   Category, priority, site, and zone.
-   Photo or document evidence.
-   Assignment to responsible team.
-   SLA and due time.
-   Status and resolution notes.
-   Complainant notification, where configured.
-   Reopen and escalation workflow.

### 5.10 Escalation and Notifications

Create configurable escalation rules based on severity, elapsed time,
task status, or unresolved complaints.

Potential notification channels:

-   In-app notifications.
-   SMS provider.
-   Email.
-   Push notifications.

Escalation levels and recipients must be configurable by the
organization. Any hierarchy shown in a reference portal should be
treated as an example until formally confirmed by the authority.

### 5.11 Reports and Analytics

Minimum reports:

-   Daily attendance register.
-   Agency-wise attendance.
-   Employee-wise attendance history.
-   Site/zone-wise manpower deployment.
-   Shift-wise manpower.
-   Absent and replacement report.
-   Overtime report.
-   Work order status and SLA report.
-   Complaint and escalation report.
-   Inspection and quality report.
-   Agency performance report.
-   Audit and correction report.

All reports should show the reporting period, filters, generated
timestamp, and user who generated the report. Totals should be
calculated from the underlying records, not manually typed.

### 5.12 Audit Trail

Record important actions with:

-   Actor/user ID.
-   Action and affected record.
-   Previous and new values, where appropriate.
-   Server timestamp.
-   Source/device/session metadata where appropriate.
-   Reason or approval reference for sensitive changes.

Audit records should be protected from ordinary users' editing or
deletion.

------------------------------------------------------------------------

## 6. End-to-End Workflows

### 6.1 User Login

1.  User enters a registered mobile number.
2.  Backend normalizes and looks up the account.
3.  Authentication service sends an OTP through an approved provider.
4.  User submits the OTP.
5.  Backend validates expiry, attempt count, and one-time use.
6.  Backend creates a secure session.
7.  User's role and data scope are loaded.
8.  User is routed to the correct dashboard.

The reference login screenshot shows a mobile-number step followed by a
verification-code step. The actual provider and implementation are not
known. Use an approved SMS/OTP provider and never store OTPs in plain
text.

### 6.2 Employee Onboarding

1.  Agency operator enters employee details.
2.  System validates mandatory fields and duplicate indicators.
3.  Employee receives a permanent Employee ID.
4.  Authorized reviewer verifies the record, if required.
5.  Employee is assigned to an agency, site, zone, and shift.
6.  Employee becomes eligible for roster and attendance workflows.

### 6.3 Daily Attendance and Deployment

1.  Agency prepares the shift roster.
2.  Supervisor reviews team and zone allocation.
3.  Employee checks in using an approved method.
4.  Backend validates employee status, shift, and applicable location
    rules.
5.  Exceptions are flagged for review.
6.  Employee checks out or attendance is closed by the approved process.
7.  Supervisor/agency official reviews exceptions.
8.  Authorized user locks or approves the attendance period.

### 6.4 Work Order Completion

1.  Authorized requester creates a work order.
2.  Work order is assigned to an agency/team.
3.  Agency assigns an employee or team.
4.  Staff update progress and submit evidence.
5.  Supervisor inspects the work.
6.  Supervisor approves or rejects with a reason.
7.  Approved work is closed; rejected work is sent for rework.
8.  SLA and audit records are updated.

### 6.5 Complaint Resolution

1.  Complaint is registered.
2.  System assigns priority and due time.
3.  Responsible agency/team receives the complaint.
4.  Work is performed and resolution evidence is submitted.
5.  Supervisor verifies resolution.
6.  Complaint is closed or reopened.
7.  Escalation occurs if the configured deadline is breached.

------------------------------------------------------------------------

## 7. Recommended Technology Stack

The following is a proposed stack, not a statement about the technology
used by BM360.

  -----------------------------------------------------------------------
  Layer                   Recommended technology  Purpose
  ----------------------- ----------------------- -----------------------
  Web frontend            Next.js + React +       Management and agency
                          TypeScript              portals

  UI styling              Tailwind CSS or an      Consistent responsive
                          approved component      UI
                          system                  

  Mobile                  Flutter                 Android-first
                                                  staff/supervisor app;
                                                  iOS can follow

  Backend                 NestJS (Node.js +       APIs, business rules,
                          TypeScript)             authorization

  Primary database        PostgreSQL              Relational operational
                                                  records

  ORM/migrations          Prisma or TypeORM       Database access and
                                                  schema migrations

  Cache/queues            Redis                   Caching, rate limits,
                                                  background jobs

  Real-time               WebSockets              Live dashboard updates

  File storage            S3-compatible object    Photos and documents
                          storage                 

  Maps                    Google Maps Platform or Maps and geospatial
                          Mapbox                  display

  Authentication          OTP provider + secure   Identity verification
                          session/JWT design      

  Notifications           SMS, email, and push    Alerts and OTP delivery
                          providers               

  Hosting                 AWS, Azure, or approved Application
                          Indian cloud/data       infrastructure
                          centre                  

  Monitoring              OpenTelemetry + managed Reliability and
                          logs/metrics            diagnostics

  CI/CD                   GitHub Actions or       Testing and deployment
                          equivalent              automation
  -----------------------------------------------------------------------

### Architecture principles

-   Start with a **modular monolith** rather than unnecessary
    microservices.
-   Keep business logic in the backend, not only in the browser or
    mobile app.
-   Use REST APIs for standard operations and WebSockets for live
    updates.
-   Use background queues for SMS, report generation, image processing,
    and escalations.
-   Keep uploaded files in object storage; store metadata and access
    references in PostgreSQL.
-   Design for intermittent mobile connectivity and safe retry behavior.
-   Use database migrations and versioned APIs.
-   Keep development, staging, and production environments separate.

------------------------------------------------------------------------

## 8. High-Level System Architecture

``` text
                 MANAGEMENT WEB PORTAL
                           |
                 AGENCY WEB PORTAL
                           |
              SUPERVISOR / STAFF MOBILE APP
                           |
                 HTTPS / REST API
                           |
                 BACKEND APPLICATION
                  (NestJS / TypeScript)
                           |
       +-------------------+--------------------+
       |                   |                    |
  Authentication      Business Modules     Notification Jobs
  & Authorization     & Workflow Engine    / Background Queue
       |                   |                    |
       +-------------------+--------------------+
                           |
              +------------+------------+
              |                         |
        PostgreSQL Database         Redis Queue/Cache
              |
       Audit & Reporting Data

External integrations:
- OTP/SMS provider
- Email/push notification provider
- Maps/geolocation service
- Object storage for photos/documents
- Optional payroll/HR/access-control systems
```

------------------------------------------------------------------------

## 9. Proposed Database Design

Use UUIDs or another stable primary key for internal records. Use
human-readable unique codes for employee IDs, work orders, agencies,
sites, and zones.

### 9.1 Core tables

  ------------------------------------------------------------------------
  Table                    Purpose                 Important fields
  ------------------------ ----------------------- -----------------------
  organizations            Organization/tenant     id, name, status

  agencies                 Service providers       id, organization_id,
                                                   code, name, status

  users                    Login identities        id, mobile, name,
                                                   status

  roles                    Role definitions        id, code, name

  permissions              Fine-grained            id, code, description
                           permissions             

  user_roles               User-role mapping       user_id, role_id

  role_permissions         Role permission mapping role_id, permission_id

  user_scope_assignments   Site/agency/zone scope  user_id, scope_type,
                                                   scope_id

  employees                Workforce master        id, employee_code,
                                                   agency_id, name,
                                                   mobile, status

  sites                    Campus/site master      id, code, name

  locations                Hierarchical            id, parent_id, site_id,
                           buildings/areas         code, name, type

  zones                    Operational zones       id, location_id, code,
                                                   name, status

  shifts                   Shift definitions       id, code, start_time,
                                                   end_time

  teams                    Teams/supervisor groups id, agency_id,
                                                   supervisor_id, name

  deployments              Employee roster         employee_id, zone_id,
                           allocation              shift_id, date, status

  attendance               Attendance records      employee_id, shift_id,
                                                   check_in, check_out,
                                                   status

  attendance_events        Individual punch events attendance_id,
                                                   event_type, event_time,
                                                   source

  work_orders              Operational tasks       id, code, zone_id,
                                                   priority, status,
                                                   due_at

  work_order_assignments   Task allocation         work_order_id,
                                                   employee_id/team_id

  task_evidence            Task photos/files       work_order_id,
                                                   storage_key,
                                                   captured_at

  inspections              Quality verification    work_order_id,
                                                   inspector_id, result,
                                                   inspected_at

  complaints               Service complaints      id, zone_id, priority,
                                                   status, due_at

  complaint_updates        Complaint history       complaint_id, actor_id,
                                                   status, note

  escalation_rules         Configurable rules      id, event_type,
                                                   threshold,
                                                   recipient_role

  escalations              Escalation history      id, record_type,
                                                   record_id, level,
                                                   status

  notifications            Notification log        id, user_id, channel,
                                                   status, sent_at

  audit_logs               Change history          id, actor_id, action,
                                                   entity, entity_id,
                                                   created_at

  attachments              File metadata           id, owner_type,
                                                   owner_id, storage_key,
                                                   mime_type
  ------------------------------------------------------------------------

### 9.2 Important data relationships

-   One agency can have many employees.
-   One site can have many buildings/areas and zones.
-   One employee can have many deployment records over time.
-   One employee can have many attendance records.
-   One shift can have many deployments and attendance records.
-   One work order can have multiple assignments, evidence files, and
    inspections.
-   One complaint can have multiple updates and escalation records.
-   One user can have multiple roles and scoped assignments.

### 9.3 Data integrity requirements

-   Add unique constraints for employee codes, agency codes, site codes,
    zone codes, and work-order numbers within their required scope.
-   Use foreign keys for relationships.
-   Use transactions for attendance and approval workflows.
-   Prevent duplicate active roster assignments for conflicting periods.
-   Store timestamps in UTC and display them in the configured local
    timezone (for example, Asia/Kolkata).
-   Preserve historical records when an employee, agency, zone, or user
    is deactivated.
-   Define retention and deletion policies before production launch.
-   Index commonly filtered fields such as date, agency, site, zone,
    shift, and status.

------------------------------------------------------------------------

## 10. API Design Outline

Use versioned endpoints, for example `/api/v1/...`. All protected
endpoints must enforce authorization on the server.

### Authentication

``` text
POST   /api/v1/auth/otp/request
POST   /api/v1/auth/otp/verify
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
```

### Master data

``` text
GET    /api/v1/agencies
POST   /api/v1/agencies
GET    /api/v1/employees
POST   /api/v1/employees
GET    /api/v1/employees/:id
PATCH  /api/v1/employees/:id
GET    /api/v1/sites
GET    /api/v1/zones
GET    /api/v1/shifts
```

### Deployment and attendance

``` text
GET    /api/v1/deployments
POST   /api/v1/deployments
PATCH  /api/v1/deployments/:id
POST   /api/v1/attendance/check-in
POST   /api/v1/attendance/check-out
GET    /api/v1/attendance
POST   /api/v1/attendance/:id/correction-request
POST   /api/v1/attendance/:id/approve
```

### Work orders and inspections

``` text
GET    /api/v1/work-orders
POST   /api/v1/work-orders
PATCH  /api/v1/work-orders/:id
POST   /api/v1/work-orders/:id/assign
POST   /api/v1/work-orders/:id/evidence
POST   /api/v1/work-orders/:id/submit-for-inspection
POST   /api/v1/work-orders/:id/inspection
```

### Complaints and reporting

``` text
GET    /api/v1/complaints
POST   /api/v1/complaints
PATCH  /api/v1/complaints/:id
GET    /api/v1/reports/attendance
GET    /api/v1/reports/deployment
GET    /api/v1/reports/work-orders
GET    /api/v1/reports/agency-performance
GET    /api/v1/audit-logs
```

These are proposed endpoint names and must be refined during API design.
Use pagination, filtering, validation, consistent error formats,
idempotency for retryable operations, and API documentation
(OpenAPI/Swagger).

------------------------------------------------------------------------

## 11. Security, Privacy, and Compliance

Security and privacy must be designed from the beginning.

### Authentication and sessions

-   Use an approved OTP/SMS provider.
-   Hash or otherwise securely protect OTP verification material; never
    log OTP values.
-   Apply OTP expiry, resend cooldown, attempt limits, and abuse
    protection.
-   Use secure, HttpOnly, SameSite cookies for browser sessions where
    appropriate.
-   Rotate and revoke sessions.
-   Require stronger controls for privileged roles.
-   Do not expose whether a phone number is registered in a way that
    enables account enumeration.

### Application security

-   Enforce authorization on every API request.
-   Validate and sanitize all inputs.
-   Use parameterized database access.
-   Protect against CSRF, XSS, SQL injection, SSRF, and insecure direct
    object references.
-   Rate-limit authentication and sensitive endpoints.
-   Use HTTPS everywhere.
-   Encrypt backups and sensitive data at rest.
-   Store secrets in a secrets manager, not in source code.
-   Scan dependencies and uploaded files.
-   Keep audit logs access-controlled and tamper-resistant.

### Location and photographs

-   Collect location only for a clear, disclosed operational purpose.
-   Capture location only at relevant attendance/task events unless a
    separately approved policy requires otherwise.
-   Store accuracy and timestamp metadata.
-   Restrict photo access by role and assignment.
-   Avoid public file URLs; use short-lived signed links.
-   Define retention periods and deletion procedures.
-   Provide a manual review process for inaccurate GPS readings or
    device/network failures.

### India-specific review

Before production, obtain legal/security review for applicable Indian
privacy, employment, telecom, data-hosting, and government/venue
requirements. Confirm the applicable requirements with the organization;
this README is not legal advice.

------------------------------------------------------------------------

## 12. Non-Functional Requirements

  -----------------------------------------------------------------------
  Area                                Initial target / requirement
  ----------------------------------- -----------------------------------
  Availability                        Agree a production SLA; design for
                                      graceful recovery

  Performance                         Common dashboard/API requests
                                      should normally respond within a
                                      few seconds under agreed load

  Scalability                         Support the confirmed employee
                                      count, peak event traffic, and
                                      concurrent users

  Reliability                         Backups, recovery tests, retry-safe
                                      jobs, and monitoring

  Mobile connectivity                 Queue safe actions locally where
                                      appropriate and sync when connected

  Accessibility                       Keyboard support, readable
                                      contrast, labels, and clear
                                      validation

  Localization                        Configurable date/time formats and
                                      language support

  Auditability                        Trace sensitive changes and
                                      approvals

  Reporting                           Reconcile totals against source
                                      records

  Maintainability                     Automated tests, code review,
                                      migrations, and documentation
  -----------------------------------------------------------------------

Targets such as concurrent users, response times, recovery time
objective (RTO), and recovery point objective (RPO) must be finalized
after discovery and load testing.

------------------------------------------------------------------------

## 13. Suggested Dashboard KPIs

The dashboard should calculate values from live, permission-filtered
records.

-   Total active employees.
-   Present, absent, late, and leave counts.
-   Attendance percentage.
-   Employees without a valid deployment.
-   Zone-wise required versus deployed manpower.
-   Shift-wise manpower coverage.
-   Open and overdue work orders.
-   Work completion percentage.
-   Average inspection score.
-   Rework rate.
-   Open complaints and SLA breaches.
-   Agency-wise performance.
-   Attendance corrections pending approval.

**Illustrative calculation examples:**

``` text
Attendance % =
  (Employees marked present / Employees expected to report) × 100

Zone Coverage % =
  (Employees deployed in zone / Approved manpower requirement) × 100

Task Completion % =
  (Approved completed work orders / Work orders due in period) × 100
```

Define exclusions carefully---for example, approved leave and weekly off
should not automatically count as absent.

------------------------------------------------------------------------

## 14. User Interface and Design Guidance

The supplied reference screenshots suggest a modern enterprise visual
direction:

-   Dark navy and teal/green as the main palette.
-   Clear, high-contrast typography.
-   Compact status indicators and KPI cards.
-   Responsive layout for desktop, tablet, and mobile.
-   A branded sign-in page with mobile-number entry and a separate OTP
    verification step.
-   A consistent navigation system for each role.
-   Accessible forms, tables, filters, and confirmation dialogs.

The proposed product should use its own name, logo, colors, and design
assets unless the organization has licensed or authorized other
branding.

### Suggested main navigation

``` text
Dashboard
Employees
Agencies
Sites & Zones
Supervisors & Teams
Shifts
Deployment
Attendance
Work Orders
Inspections
Complaints
Escalations
Reports
Users & Permissions
Audit Logs
Settings
```

Show only the navigation items the current user is permitted to access.

------------------------------------------------------------------------

## 15. Development Roadmap

Indicative plan for a small experienced team. Actual timing depends on
integrations, approvals, data migration, testing, and the confirmed
scope.

  Phase   Scope                                                  Indicative duration
  ------- ---------------------------------------------------- ---------------------
  0       Discovery, process mapping, requirements, and UX                1--2 weeks
  1       Project setup, database, authentication, RBAC                   2--3 weeks
  2       Agency, employee, site, zone, and shift masters                 2--3 weeks
  3       Rostering, deployment, and attendance                           2--3 weeks
  4       Mobile application and location/evidence workflows              3--4 weeks
  5       Work orders, inspections, and complaints                        2--3 weeks
  6       Escalations, dashboards, reports, and exports                   2--3 weeks
  7       Security testing, UAT, training, and deployment                 2--3 weeks

A realistic initial production plan may take approximately 12--20+
weeks, depending on team size and complexity. A pilot can be delivered
earlier by limiting the first release to core masters, roster,
attendance, and reports.

### Recommended MVP

Build these first:

1.  Secure login and RBAC.
2.  Agency and employee master.
3.  Site and zone master.
4.  Shift master.
5.  Employee deployment.
6.  Attendance and correction approvals.
7.  Supervisor dashboard.
8.  Daily attendance and deployment exports.
9.  Audit log.

Add work orders, inspections, complaints, escalations, and advanced
analytics after the core data is reliable.

------------------------------------------------------------------------

## 16. Testing and Acceptance Criteria

### Authentication

-   Registered user can request and verify an OTP.
-   Expired or reused OTP is rejected.
-   Excessive attempts are blocked or throttled.
-   User receives only their authorized role and data scope.

### Employee master

-   Employee ID is unique.
-   Duplicate warnings work as specified.
-   Unauthorized agencies cannot view or edit other agencies' employees.
-   Deactivated employees remain visible in historical reports.

### Deployment

-   Employee can be assigned to a valid site, zone, and shift.
-   Conflicting or duplicate assignments are rejected or flagged.
-   Historical deployments remain available.

### Attendance

-   Check-in/out records have reliable server timestamps.
-   Duplicate requests do not create duplicate punches.
-   Missed punch correction requires a reason and authorized approval.
-   Shift crossing midnight is calculated correctly.
-   Attendance totals reconcile with employee-level records.

### Work orders

-   Only authorized users can create and assign work.
-   Required evidence is enforced by configuration.
-   Rejection requires a reason.
-   Status history and approvals are auditable.

### Reports

-   Filters work by date, agency, site, zone, and shift.
-   Exported totals match on-screen results.
-   Unauthorized users cannot export data outside their scope.

### Operations

-   Backup restoration is tested.
-   Monitoring and alerting are configured.
-   Peak-load testing is performed using the agreed user volume.
-   Mobile offline/retry behavior is tested where supported.

------------------------------------------------------------------------

## 17. Team and Delivery Roles

A typical delivery team may include:

-   Product owner / business analyst.
-   UI/UX designer.
-   Frontend developer.
-   Backend developer.
-   Flutter/mobile developer.
-   QA/test engineer.
-   DevOps/cloud engineer.
-   Security reviewer.

Some roles can be combined in a small team, but product ownership,
testing, and security review should not be ignored.

------------------------------------------------------------------------

## 18. Suggested Repository Structure

``` text
facilityops-360/
├── apps/
│   ├── web/                  # Next.js web portal
│   └── mobile/               # Flutter application
├── services/
│   └── api/                  # NestJS backend
├── packages/
│   ├── shared-types/         # Shared API/data types
│   └── design-system/        # Shared web UI components
├── database/
│   ├── migrations/
│   ├── seeds/
│   └── diagrams/
├── docs/
│   ├── requirements/
│   ├── architecture/
│   ├── api/
│   ├── user-guides/
│   └── security/
├── infrastructure/
│   ├── development/
│   ├── staging/
│   └── production/
├── scripts/
├── .env.example
├── .gitignore
└── README.md
```

This is a suggested monorepo layout. It can be adjusted to the selected
framework and team workflow.

------------------------------------------------------------------------

## 19. Local Development Setup (Proposed)

The commands below are a starting point for the recommended stack. They
assume the repository has been created and the relevant application
scaffolding has been added.

### Prerequisites

-   Git.
-   Node.js LTS and npm/pnpm.
-   PostgreSQL.
-   Redis.
-   Flutter SDK and Android Studio for mobile development.
-   Access credentials for development-only SMS and object-storage
    services, if those integrations are enabled.

### Environment variables

Create a local `.env` file from `.env.example`. Never commit real
secrets.

``` dotenv
NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://app_user:change_me@localhost:5432/facilityops
REDIS_URL=redis://localhost:6379

SESSION_SECRET=replace_with_a_long_random_secret
OTP_PROVIDER=development
OTP_API_KEY=
OTP_SENDER_ID=

OBJECT_STORAGE_ENDPOINT=
OBJECT_STORAGE_BUCKET=
OBJECT_STORAGE_ACCESS_KEY=
OBJECT_STORAGE_SECRET_KEY=

MAPS_API_KEY=
```

Use a development OTP adapter or test numbers locally. Do not send real
OTPs from an unapproved development environment.

### Example backend commands

``` bash
# Install dependencies
npm install

# Run database migrations (after configuring the ORM)
npm run db:migrate

# Start the API in development mode
npm run dev
```

### Example web commands

``` bash
cd apps/web
npm install
npm run dev
```

### Example mobile commands

``` bash
cd apps/mobile
flutter pub get
flutter run
```

Exact scripts will depend on the generated project. These commands are
illustrative until the repository and package scripts exist.

------------------------------------------------------------------------

## 20. Deployment Environments

Maintain separate environments:

-   **Development:** local developer work and test data.
-   **Staging/UAT:** realistic workflows and user acceptance testing
    with controlled data.
-   **Production:** approved live operations.

Production checklist:

-   Approved hosting and domain.
-   TLS/HTTPS certificates.
-   Secrets manager.
-   Database backups and restore testing.
-   Object-storage access controls.
-   Monitoring, logs, and alerting.
-   Rate limiting and web application protection.
-   CI/CD approvals and rollback process.
-   Database migration plan.
-   Incident response contacts.
-   User training and support process.

------------------------------------------------------------------------

## 21. Decisions Required Before Development

The following items must be confirmed with the organization:

1.  Final product name, logo, and branding permissions.
2.  Exact campuses, buildings, halls, gates, floors, and zones.
3.  Total agencies, employees, supervisors, and concurrent users.
4.  User roles and approval hierarchy.
5.  Employee data fields and duplicate-record policy.
6.  Shift patterns, breaks, overtime, and weekly-off rules.
7.  Attendance method: supervisor entry, kiosk, QR, GPS, or a
    combination.
8.  Location-verification boundaries and privacy policy.
9.  Required mobile devices and Android/iOS support.
10. Work-order categories and inspection checklists.
11. Complaint categories, SLAs, and escalation recipients.
12. Reports, Excel formats, and approval requirements.
13. Existing Excel/CSV data to migrate.
14. SMS, email, maps, payroll, HR, or access-control integrations.
15. Hosting, data residency, retention, backup, and security
    requirements.
16. Budget, delivery team, support model, and launch date.

------------------------------------------------------------------------

## 22. Definition of Done

The initial release is ready for pilot when:

-   Approved users can securely sign in.
-   Each role sees only its authorized functions and data.
-   Employee and agency masters are validated and deduplicated.
-   Sites, zones, and shifts are configured.
-   Employees can be rostered without conflicting assignments.
-   Attendance can be recorded, reviewed, corrected, and reported.
-   Supervisors can see their assigned teams and zones.
-   Management can view reliable summary metrics.
-   Important actions are recorded in audit logs.
-   Reports reconcile with source records.
-   Backup restoration and basic security tests pass.
-   User acceptance testing is signed off by the designated owner.

------------------------------------------------------------------------

## 23. Immediate Next Steps

1.  Conduct a discovery workshop with management, supervisors, agencies,
    and security representatives.
2.  Collect current employee, agency, supervisor, shift, site, and zone
    spreadsheets.
3.  Confirm the role/permission matrix and approval hierarchy.
4.  Approve the employee master and deployment data model.
5.  Design the login, dashboard, employee, attendance, and deployment
    screens.
6.  Build the MVP with a small pilot site or zone.
7.  Reconcile pilot attendance and manpower reports against the existing
    process.
8.  Fix operational issues before expanding to all sites.

## 24. Project Summary

FacilityOps 360 should be developed as a secure, centralized, role-based
facility operations platform with:

-   A management and agency web portal.
-   A supervisor and housekeeping mobile experience.
-   OTP-based authentication.
-   Employee, agency, site, zone, and shift masters.
-   Deployment and attendance management.
-   GPS/location verification where approved.
-   Work orders, photographic evidence, and inspections.
-   Complaints, SLA tracking, and escalation.
-   Reports, dashboards, and audit history.

The most important implementation principle is to establish clean master
data, correct permissions, and reliable attendance/deployment workflows
before adding advanced automation. This creates a dependable foundation
for the complete facility management platform.

------------------------------------------------------------------------

**Document owner:** Project team\
**Status:** Draft blueprint --- validate business rules, integrations,
security, and compliance requirements before implementation.
