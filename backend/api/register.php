<?php
// backend/api/register.php
// POST /api/register.php
// Student event registration endpoint (public — no auth required).
//
// Validates: required fields, email format, 10-digit phone,
//            event existence, status (past/closed/full), duplicate email.

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/validate.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    errorResponse('Method not allowed', 405);
}

$body = json_decode(file_get_contents('php://input'), true);
if (!is_array($body)) {
    errorResponse('Invalid JSON body', 400);
}

// ── Field validation ──────────────────────────────────────────────────────────

$missing = validateRequired(['event_id', 'name', 'email', 'phone'], $body);
if ($missing) {
    errorResponse('Missing required fields: ' . implode(', ', $missing), 422);
}

$eventId = (int) $body['event_id'];
$name    = trim($body['name']);
$email   = trim($body['email']);
$phone   = trim($body['phone']);

if (!validateEmail($email)) {
    errorResponse('Please enter a valid email address', 422);
}

if (!validatePhone($phone)) {
    errorResponse('Phone number must be exactly 10 digits', 422);
}

if ($eventId <= 0) {
    errorResponse('Invalid event ID', 422);
}

// ── Database checks ───────────────────────────────────────────────────────────

try {
    $db = getDB();
} catch (RuntimeException $e) {
    errorResponse('Database unavailable', 503);
}

// Fetch the event with registration count
$stmt = $db->prepare("
    SELECT e.*, COUNT(r.id) AS registration_count
    FROM events e
    LEFT JOIN registrations r ON r.event_id = e.id
    WHERE e.id = ?
    GROUP BY e.id
");
$stmt->execute([$eventId]);
$event = $stmt->fetch();

if (!$event) {
    errorResponse('Event not found', 404);
}

$now = new DateTimeImmutable('now', new DateTimeZone('UTC'));

// Check: past event
$eventDate = new DateTimeImmutable($event['event_date']);
if ($eventDate < $now) {
    errorResponse('Registration is closed — this event has already passed', 422);
}

// Check: registration deadline
if (!empty($event['registration_deadline'])) {
    $deadline = new DateTimeImmutable($event['registration_deadline']);
    if ($deadline < $now) {
        errorResponse('The registration deadline for this event has passed', 422);
    }
}

// Check: capacity full
if ($event['capacity'] !== null && (int) $event['registration_count'] >= (int) $event['capacity']) {
    errorResponse('Sorry, this event has reached its maximum capacity', 422);
}

// ── Insert registration ───────────────────────────────────────────────────────

try {
    $stmt = $db->prepare("
        INSERT INTO registrations (event_id, name, email, phone)
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([$eventId, $name, $email, $phone]);

    $registrationId = (int) $db->lastInsertId();

    jsonResponse([
        'message'         => 'You have been successfully registered!',
        'registration_id' => $registrationId,
    ], 201);

} catch (PDOException $e) {
    // SQLSTATE 23000 = Integrity constraint violation (duplicate email for this event)
    if ($e->getCode() === '23000') {
        errorResponse('You are already registered for this event with this email address', 409);
    }
    // Any other DB error
    errorResponse('Registration failed due to a server error. Please try again.', 500);
}
