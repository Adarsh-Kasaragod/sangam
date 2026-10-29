<?php
// backend/helpers/response.php
// Centralised JSON response helpers.
// All API endpoints must use these functions to ensure consistent output.

declare(strict_types=1);

/**
 * Send a JSON response and terminate the script.
 *
 * @param mixed $data   Data to encode as JSON
 * @param int   $status HTTP status code (default 200)
 */
function jsonResponse(mixed $data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Send a standardised error response.
 *
 * @param string $message Human-readable error message
 * @param int    $status  HTTP status code
 * @param array  $extra   Optional extra fields merged into the response
 */
function errorResponse(string $message, int $status = 400, array $extra = []): never {
    jsonResponse(array_merge(['error' => $message], $extra), $status);
}
