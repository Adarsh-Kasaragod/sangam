<?php
// backend/api/stats.php
// GET /api/stats.php
// Admin-only: dashboard summary statistics.
// Returns total events, total registrations, and upcoming event count.

declare(strict_types=1);

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/cors.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../helpers/auth.php';

setCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    errorResponse('Method not allowed', 405);
}

// Auth required — dashboard stats are admin-only
requireAuth();

try {
    $db = getDB();
} catch (RuntimeException $e) {
    errorResponse('Database unavailable', 503);
}

// Total events
$totalEvents = (int) $db->query('SELECT COUNT(*) FROM events')->fetchColumn();

// Total registrations across all events
$totalRegistrations = (int) $db->query('SELECT COUNT(*) FROM registrations')->fetchColumn();

// Upcoming events: event_date in the future
$upcomingStmt = $db->query("SELECT COUNT(*) FROM events WHERE event_date > NOW()");
$upcomingEvents = (int) $upcomingStmt->fetchColumn();

// Recent registrations (last 5, for a dashboard feed)
$recentStmt = $db->query("
    SELECT r.name, r.email, r.created_at, e.title AS event_title
    FROM registrations r
    JOIN events e ON e.id = r.event_id
    ORDER BY r.created_at DESC
    LIMIT 5
");
$recentRegistrations = $recentStmt->fetchAll();

jsonResponse([
    'total_events'         => $totalEvents,
    'total_registrations'  => $totalRegistrations,
    'upcoming_events'      => $upcomingEvents,
    'recent_registrations' => $recentRegistrations,
]);
